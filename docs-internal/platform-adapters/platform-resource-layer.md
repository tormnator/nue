# Platform Resource Layer

*Design note for issue #27 and the beta 3 resource layer - May 2026*

## Purpose

The platform resource layer defines how server routes access deployment-provided capabilities through `c.env` without making Nue core depend on any one hosting platform.

This document uses **developer** for the person building a site or app. It avoids using **user** for that role because `users` is also an application/domain model in the existing templates.

This is the beta 3 resource-layer design that followed the Cloudflare Pages adapter and Git integration validation. The implemented beta 3 slices cover resource env shaping, config resources, declared local model resources, raw Cloudflare env access, Cloudflare D1 collection resources, and the follow-up lightweight collection boundary. Production auth/session semantics, schema management, provisioning, JSON seed import, KV, R2, Durable Objects, Queues, and Analytics Engine remain follow-up work.

## Current Local Model

Nueserver already accepts an environment object:

```js
fetch(request, env)
```

For each request, Nueserver exposes that object as:

```js
c.env
```

Local development now builds `c.env` through the resource factory. JSON files declared under `resources.models` become collection resources under `c.env.models`. `packages/nuekit/src/server/model.js` reads files such as `users.json` and `leads.json` and turns them into simple in-memory collection resources.

That file is not a general platform resource layer. It creates local development collection resources for the current templates:

- Declared collections use the model name from `resources.models`.
- Undeclared local development can still infer collections from JSON filenames.
- Each collection uses a simple in-memory provider behind the shared collection resource API.
- Local JSON writes are in memory only; runtime creates, updates, and removes are not written back to the source JSON files.

Earlier beta code special-cased a model named `users` with `login`, `logout`, and `authenticate`. M4b moves that domain behavior out of Nue core and into the full template, where demo login sessions are backed by declared `users` and `loginSessions` collection resources. Core should provide the platform interfaces that let domain models run consistently across local development and production adapters.

Template route code should read declared models from `c.env.models`:

```js
const { users } = c.env.models
```

Before the resource layer, the Cloudflare Pages adapter bundled server routes and dispatched them with the raw Cloudflare environment:

```js
dispatch(request, env)
```

The resource layer formalizes which values are raw platform bindings, which are normalized Nue resources, and how local development should match production.

## Design Goals

- Keep route code platform-neutral by default.
- Keep Cloudflare-specific names and APIs inside the Cloudflare adapter or Cloudflare resource implementations.
- Preserve an escape hatch for raw platform bindings when a project intentionally needs them.
- Let local development and tests provide compatible resources without pretending to be Cloudflare.
- Let app/site-specific domain models live outside core while still using core platform interfaces.
- Avoid exposing secrets accidentally through broad config dumps.
- Make missing required bindings fail clearly.
- Add the smallest useful implementation slice before designing a complete universal model.
- Support the current `spa` and `full` templates on Cloudflare Pages as the first practical implementation target. Breaking changes to the current mock model code are acceptable if they clarify the resource contract.

## Non-Goals For The First Slice

The first slice should not implement a full production model layer. Defer:

- production users/authentication semantics
- production sessions
- universal login/authentication/session semantics
- D1 schema creation, migrations, provisioning, or seed import
- KV/R2 storage helpers
- Durable Objects
- Queues
- Analytics Engine
- auth policy, password hashing, and cookie/session strategy
- schema migrations

Those need the resource contract first.

It may be possible to design platform-independent user, login, session, and authentication helpers later, but that should follow platform capability research. Cloudflare, Netlify, Vercel, and other deployment targets provide different storage, identity, edge runtime, and secrets models. The first resource-layer design should not assume those can be collapsed into one universal auth model.

## Platform Capability Research

Before designing universal domain-user, login, session, or authentication helpers, compare at least these platform capabilities:

| Platform | Capabilities to inspect |
|---|---|
| Cloudflare | Pages/Workers bindings, KV, D1, R2, Durable Objects, Queues, secrets, dashboard and Wrangler provisioning |
| Netlify | Functions/Edge Functions, Blobs, environment variables, identity/auth options, database integrations, CLI provisioning |
| Vercel | Edge/serverless functions, environment variables, KV/blob/postgres integrations, storage provisioning, auth integrations |

The research question is not whether every platform has every primitive. It is whether Nue can define small portable resource contracts while letting adapters map those contracts to platform-specific storage and binding systems.

### Research Snapshot

Initial documentation review shows that the platforms expose similar categories but different operational models:

| Platform | Config and secrets | Object/key-value storage | Database/structured storage | Stateful/session primitives | Provisioning model |
|---|---|---|---|---|---|
| Cloudflare Pages | Environment variables and secrets are bindings on `env`; variables can be strings or JSON; secrets are encrypted and accessed the same way at runtime. | KV for global key-value, R2 for blobs, both available as Pages bindings. | D1 is SQLite-compatible serverless SQL and can be bound to Pages Functions. | Durable Objects provide strongly consistent state and coordination, but require a Worker/DO setup separate from the Pages project; D1 can also store session rows. | Resources and bindings can be configured in the dashboard or Wrangler configuration; Pages bindings must already exist and require redeploy to take effect. |
| Netlify | Environment variables can be scoped by build/function/runtime and by deploy context; secret handling is available through Netlify's environment tooling. | Netlify Blobs provide stores with JSON/blob APIs, deploy-specific stores, optional strong consistency, and last-write-wins behavior for overlapping writes. | Netlify Database is managed Postgres with migrations, database branching, and local development support. | No single universal session primitive; sessions/auth can use app code, database, blobs, identity/auth integrations, or third-party services. | UI, CLI, and API can manage env vars; Netlify Database can be initialized through CLI and applies migrations during deploy; Blobs are zero-configuration for sites. |
| Vercel | Environment variables are project/team scoped by production, preview, development, custom environment, and branch; CLI supports pull/run/add/update. | Vercel Blob supports object storage with public/private stores, conditional writes, and CLI management. Edge Config is read-optimized global key-value for frequently read, rarely changed config. | Vercel's current database story is Marketplace storage such as Neon, Upstash Redis, Supabase, and other providers; old Vercel KV moved to Upstash Redis. | No single universal session primitive; Redis/Postgres/third-party auth are provider choices. | Dashboard, CLI, REST APIs, and Marketplace installs can provision resources and inject environment variables. |

Implications:

- A portable `config` resource is realistic across all three platforms.
- A portable `models.collection` contract is possible only if the contract is deliberately small and adapters can choose SQL, key-value, or blob storage behind it.
- A universal auth/session model should wait. The storage and consistency tradeoffs differ too much to bake a core `users.login()` contract into this first layer.
- Provisioning should stay outside the first resource contract. Beta 3 should validate configured resources; later adapter tooling can create resources through provider CLIs or APIs.

## Proposed `c.env` Shape

Routes should receive a shaped environment object with four categories:

```js
c.env = {
  // Normalized Nue resources intended for portable route code
  config,

  // App/site domain models declared by the developer
  models: {
    users,
    leads
  },

  // Adapter-specific escape hatch for advanced/platform-specific route code
  platform,

  // Optional metadata for diagnostics and conditional behavior
  runtime
}
```

The exact object should stay plain JavaScript. Routes should not need imports to access configured resources.

### Normalized Resources

Normalized resources are stable Nue-facing capabilities. Examples:

```js
c.env.config.get('PUBLIC_SITE_NAME')
c.env.models.users.getAll()
c.env.models.leads.getAll()
```

These resources should be backed by local JSON mocks in development and by platform-specific implementations in production.

Domain models such as `users` and `leads` should not be implicitly invented by the adapter. The developer should declare them in project configuration, and the selected adapter should map those declarations to local mocks or production bindings.

## Domain Model Scenarios

Different apps need different domain model backing stores. The resource layer should support this range without forcing every project into one storage strategy.

Examples:

- Some sites do not need a domain-user model at all.
- Some sites need only a few domain users or records, and could use a key-value or JSON-object backing store.
- Some apps may have thousands of domain users, sessions, or leads, and should use a more robust database or dedicated service rather than a key-value store.
- Some apps may bring their own auth, CRM, payment, or analytics service and only need Nue to pass configured bindings through safely.

This is why `users`, `leads`, and sessions should not become assumed core resources. They should be declared and implemented as app/site models on top of the platform resource interfaces.

## Resource Declarations

Developer-controlled resource configuration should live in `site.yaml`. Adapter implementation details should live in adapter code.

This keeps the developer-facing project configuration portable while letting each adapter decide how to satisfy the declaration.

### Why `resources`

The term **resources** is intentionally broader than **models**, **data**, **storage**, or **services**. Server routes need access to deployment-provided capabilities through `c.env`, and those capabilities are not all domain models or persistence stores. They can include configuration, declared app models, object storage, queues, analytics, cache-like storage, and platform-specific escape hatches.

The top-level `resources` block describes what the app expects in portable Nue terms. The platform-specific `platform.resources` block describes how the selected adapter satisfies those expectations. For example, an app can declare a portable `models.leads` collection, while the Cloudflare Pages adapter can satisfy it with a D1 binding and table.

This split keeps Nue core from becoming Cloudflare-specific and keeps route code from depending on provider names by default. It also leaves room for future capabilities without prematurely naming the whole feature after one slice such as persistence or domain models.

Conceptual shape:

```yaml
resources:
  config:
    public_prefix: PUBLIC_

  models:
    users:
      kind: collection
      local: @shared/server/data/users.json
    leads:
      kind: collection
      local: @shared/server/data/leads.json

platform:
  name: cloudflare-pages
  resources:
    models:
      users:
        binding: DB
        table: users
      leads:
        binding: DB
        table: leads
```

The top-level `resources` block is the platform-independent app contract. It says which resources route code expects and which local files can back development mocks. The selected `platform` block holds adapter-specific production binding details. For Cloudflare Pages, `platform.resources.models.<name>.binding` is the developer-chosen Cloudflare runtime binding variable name, such as `DB`, and `table` is the D1 table backing that model.

Cloudflare Pages collection models are D1-backed in the beta 3 implementation. The YAML does not need to say `D1` while that is the only supported Cloudflare implementation for `kind: collection`; the adapter owns that choice and validates that the configured binding is D1-compatible at request time.

Cloudflare platform resource configuration is not required for local development. Local development can use the platform-independent `resources.models.<name>.local` declarations without a Cloudflare binding. The Cloudflare configuration is needed when building or deploying routes that expect production Cloudflare model resources.

An adapter may add adapter-specific interpretation, defaults, or validation in its own code space. For Cloudflare Pages, the adapter maps a declared model to the binding/table configured under `platform.resources`. If Cloudflare later supports multiple collection backings for the same Nue resource contract, the adapter can introduce an explicit backend field such as `type`, but beta 3 should avoid that extra schema until it is needed.

Longer term, platform adapters may live in per-platform folders or outside Nuekit as plugins. The resource declaration shape should prepare for that, but beta 3 does not need to implement the plugin system.

### Future Resource Categories

For beta 3, the active resource declaration surface should stay small: `resources.config` and `resources.models`, with only `resources.models` currently carrying app model declarations in templates. Future direct children of `resources` should be capability categories, not app-specific nouns.

Possible future shape:

```yaml
resources:
  config:
    public_prefix: PUBLIC_

  models:
    leads:
      kind: collection
      local: @shared/server/data/leads.json
    settings:
      kind: document
      local: @shared/server/data/settings.json

  storage:
    uploads:
      kind: blobs

  cache:
    redirects:
      kind: keyvalue

  queues:
    emails:
      kind: queue

  analytics:
    events:
      kind: events
```

Likely categories:

- `config`: normalized environment/config access, including public-prefix or allowlist rules.
- `models`: app-declared domain data resources such as `users`, `leads`, `products`, or `orders`.
- `storage`: object/blob storage for uploaded or generated files, potentially backed by Cloudflare R2, Vercel Blob, Netlify Blobs, or local development storage.
- `cache`: key-value or cache-like app data, potentially backed by Cloudflare KV, Edge Config, Redis-like providers, or local mocks.
- `queues`: background job or event queue resources where the selected platform supports them.
- `analytics`: event or analytics ingestion resources, such as Cloudflare Analytics Engine.

These categories are intentionally provisional. M4b should clarify `models.kind: collection` before the YAML surface grows.

### Model `kind` Values

For beta 3, only `kind: collection` should be treated as implemented. It means a named mutable set of JSON-like records with ordinary record operations. Current local JSON models and Cloudflare D1 collection resources both target this shape.

Possible future `resources.models.<name>.kind` values:

| Kind | Meaning | Notes |
|---|---|---|
| `collection` | Mutable set of JSON-like records. | Current beta 3 value. Useful for `users`, `leads`, `products`, and `orders`. |
| `document` | One JSON-like object rather than a record set. | Plausible next model kind for app settings, profile documents, or small structured state. |
| `keyvalue` | Named string keys mapped to JSON-like or string values. | May belong under `resources.cache` instead of `resources.models`; use caution before adding it as a model kind. |
| `counter` | Atomic increment/read behavior. | Useful for likes, views, or rate counters, but provider semantics differ enough to defer. |
| `log` | Append-only records. | May belong under `resources.analytics` or future event resources rather than models. |
| `sql` | Raw/queryable database access. | Powerful escape hatch, but it leaks provider capability and should not be the default model abstraction. |

Avoid using `kind` for broad platform primitives that are not app data models. Values such as `blob`, `files`, `queue`, `analytics`, or `service` should usually become siblings under `resources`, not model kinds. This keeps `resources.models` focused on app data shapes while the wider `resources` block handles platform capabilities.

## Bootstrapping And Provisioning

For beta 3, assume the developer configures platform resources such as Cloudflare KV namespaces, D1 databases, or other bindings in the platform dashboard or platform CLI. Nue should consume and validate those bindings; it does not need to create them through provider APIs in the first implementation.

Future adapter tooling could call provider APIs to create resources from `site.yaml`, but that should be treated as deployment automation, not the core resource contract.

Local JSON files can act as seed data or development mocks. Projecting those files into production storage may be possible for simple JSON-object stores, but SQL-backed resources need schema and migration design. The first implementation should avoid promising automatic projection from JSON files into every platform storage model.

### Raw Platform Escape Hatch

Some projects will need direct access to deployment-specific bindings. Use an explicit namespace rather than mixing all raw bindings into the top-level route environment:

```js
c.env.platform
```

Only one platform adapter is active for a deployment, so `c.env.platform` can be the raw current-platform object. For Cloudflare Pages, this can hold the raw worker `env` object:

```js
c.env.platform
```

This makes platform-specific route code visually obvious:

```js
const value = await c.env.platform.MY_KV.get('key')
```

The escape hatch should exist, but docs should steer portable app code toward normalized resources.

### Runtime Metadata

The shaped environment may include small metadata for diagnostics:

```js
c.env.runtime = {
  platform: 'cloudflare-pages',
  adapter: 'cloudflare-pages',
  mode: 'production'
}
```

This is not a feature flag system. It is a lightweight way to understand what created the environment.

## Config Resource

The normalized config resource is part of the implemented beta 3 resource layer.

Route API:

```js
const value = c.env.config.get('PUBLIC_SITE_NAME')
const required = c.env.config.require('PUBLIC_SITE_NAME')
const publicConfig = c.env.config.public()
```

Behavior:

- `get(name)` returns the value or `undefined`.
- `require(name)` returns the value or throws a clear missing-config error.
- `public()` returns only values explicitly safe for client exposure.
- No method returns all secrets by default.

Public config should require a naming convention or explicit config list. The simplest beta 3 convention is:

```text
PUBLIC_*
```

This mirrors common deployment conventions and avoids accidental broad exposure.

## Local Development Mapping

Local development composes `c.env` from local sources:

- JSON model files declared under `resources.models` create simple local collection resources such as `users`, `loginSessions`, and `leads`.
- Local config can come from project config and/or a future local env file.
- Local `platform` can be empty or contain a local diagnostic object.
- Existing fake Cloudflare request headers in `worker.js` can remain request-header mocks, not environment resources.

The current JSON model helpers should be treated as local mock resources, not production implementations. Domain behavior such as demo login sessions belongs in templates or project-local code above the collection resources.

## Cloudflare Pages Mapping

The Cloudflare Pages adapter shapes the raw worker environment before dispatching to Nueserver.

Old generated worker behavior:

```js
dispatch(request, env)
```

Current generated worker behavior:

```js
const nueEnv = createResourceEnv({
  platform: 'cloudflare-pages',
  mode: 'production',
  raw: env,
  resources: {
    config: createConfigResource(env)
  }
})

return dispatch(request, nueEnv)
```

For beta 3:

- Cloudflare string bindings and environment variables can back `c.env.config`.
- Raw Cloudflare bindings stay available under `c.env.platform`.
- `env.ASSETS` remains an adapter implementation detail for static asset fetches and should not be exposed as a normalized route resource by default.
- Declared models are mapped into `c.env.models` by Cloudflare-specific resource implementations.

### Cloudflare-First Implementation Choice

For beta 3, the Cloudflare implementation uses D1 for mutable domain collections rather than KV.

Rationale:

- The current `full` template needs collection behavior: create, list, get by id, update, and delete.
- The same collection abstraction should scale from a few records to many records without changing route code.
- D1 gives the adapter a queryable, transactional backing store with clearer schema/migration semantics than KV.
- KV remains useful for cache-like or small key-value resources, but it is not the best default for mutable app collections.
- Durable Objects are compelling for coordination and strongly consistent state, but they require additional setup and should not be the first resource backing for templates.

Recommended beta 3 Cloudflare mapping:

| Declaration | Cloudflare backing | Notes |
|---|---|---|
| `resources.config` | Pages environment variables and secrets | Expose via `c.env.config`; secrets are accessible to server code but never returned by `public()`. |
| `resources.models.<name>` with `kind: collection` plus `platform.resources.models.<name>.binding/table` | D1 binding | Provide the local model-style methods needed by templates: `getAll`, `size`, `create`, `get`, item `update`, and item `remove`. |
| Template domain-user login/session demo | Template-local code using `users` and `loginSessions` collection resources | Keep it outside core; do not define universal auth semantics yet. |
| Raw platform access | `c.env.platform` | Contains the raw Cloudflare `env` object for explicit platform-specific route code. |

For beta 3, the developer should create and bind the D1 database through Cloudflare dashboard or Wrangler, then put that binding variable name in `platform.resources.models.<name>.binding`. Nue can validate that the named binding exists and is D1-compatible, and can fail clearly if it does not. Automatic D1 creation, schema generation, migrations, and JSON data import can be designed later.

Later Cloudflare resource mappings may wrap:

| Cloudflare binding | Possible normalized resource |
|---|---|
| D1 | collections, SQL, app models |
| KV | key-value config/cache/storage |
| R2 | object/blob storage |
| Durable Objects | stateful actors/sessions/realtime |
| Queues | background jobs/events |
| Analytics Engine | analytics/event ingestion |

These mappings remain follow-up design work after the beta 3 config and collection resource contracts.

## Resource Factory Boundary

Adapters call a target-neutral resource factory instead of constructing `c.env` ad hoc.

API shape:

```js
createResourceEnv({
  platform: 'cloudflare-pages',
  mode: 'production',
  raw: env,
  resources: {
    config: createConfigResource(env)
  }
})
```

Expected result:

```js
{
  config,
  models,
  platform: env,
  runtime: {
    platform: 'cloudflare-pages',
    mode: 'production'
  }
}
```

Local development can use the same factory:

```js
createResourceEnv({
  platform: 'local',
  mode: 'development',
  resources: {
    config,
    models: {
      users,
      leads
    }
  }
})
```

This keeps Nueserver simple: it continues to receive an `env` object and expose it as `c.env`.

## Error Policy

Missing resources should fail close to the access point unless the project declares required resources during build.

For beta 3:

- `c.env.config.get(name)` may return `undefined`.
- `c.env.config.require(name)` should throw a clear error.
- Missing top-level resources should produce normal JavaScript errors in route code.
- Missing declared models should fail with a clear resource-construction error before route code handles requests when possible.
- Build-time validation can come later when resource declarations exist.

## Security Notes

The resource layer must not encourage accidental secret exposure.

- Do not provide `config.all()` for all values in the first slice.
- Do not serialize raw platform bindings.
- Keep raw bindings under `c.env.platform` so platform-specific access is explicit.
- Use `PUBLIC_*` or an explicit allowlist for values intended to reach the browser.

## Implemented Beta 3 Slices

The beta 3 resource-layer work is now split across issue #28 and M4b issue #30:

1. Added a target-neutral resource factory module in Nuekit.
2. Added a config resource with `get`, `require`, and `public`.
3. Added resource declaration parsing for developer-defined models in `site.yaml`.
4. Updated local server worker creation to pass JSON models through the resource factory as `c.env.models`.
5. Updated the Cloudflare Pages worker generation to pass raw Cloudflare `env` through the resource factory and expose it under `c.env.platform`.
6. Implemented a D1-backed Cloudflare collection resource for declared `kind: collection` models.
7. Added a shared `createCollectionResource(provider)` wrapper so local JSON/in-memory and Cloudflare D1 collections share generic collection behavior.
8. Moved full-template demo login/logout/authenticate behavior into template-local code backed by `users` and `loginSessions` collection resources.
9. Added tests for local resource shaping, config access, model namespacing, collection resource behavior, Cloudflare worker dispatch, D1 collection resources, and the full-template login-session flow.

This establishes the production boundary and moves template route API usage from top-level `c.env.users` or `c.env.leads` to `c.env.models.users` and `c.env.models.leads`.

## Open Questions

Settled for beta 3 and M4b:

- Cloudflare `kind: collection` model bindings remain implicit-D1 while D1 is the only implemented Cloudflare collection provider.
- Raw platform access remains `c.env.platform`.
- `PUBLIC_*` is the beta 3 public config convention.
- No persistence manager is exposed on `c.env`; route code uses `c.env.models`.
- Generic collection item methods remain part of the beta 3 route-facing collection API.
- Domain-user/login/session/authentication helpers are not universal core resources in beta 3. The full template owns its demo login-session behavior in template-local code.

Still open or deferred:

- Should a later adapter version add an explicit backend field such as `type: d1` when one platform supports multiple collection backings?
- Should local config read only `site.yaml`, or should a later phase add `.env` support?
- Can any production-grade auth/session helpers be designed portably across Cloudflare, Netlify, Vercel, and similar platforms, or should Nue keep this entirely app/template-owned?
- What exact D1 schema, migration, and provisioning story should Nue support beyond validating already-created tables?
- Should adapter tooling eventually provision platform resources through provider APIs, or only validate resources configured by the developer?
- Can local JSON files become production seed data, and if so, how does that interact with SQL schemas and migrations?
- How should TypeScript developers get resource types in route files?

## Decision For Beta 3

Keep platform-independent resource declarations under `resources`, and keep Cloudflare binding/table details under `platform.resources`. Expose raw Cloudflare bindings directly under `c.env.platform`. Use D1 as the first Cloudflare backing for mutable `kind: collection` models. Keep the persistence layer behind `c.env.models`, with shared collection behavior in `createCollectionResource(provider)`. Keep domain-user/login/session semantics in template or project code until a separate auth design exists.
