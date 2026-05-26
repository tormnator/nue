# Platform Resource Layer

*Design draft for issue #27 - May 2026*

## Purpose

The platform resource layer defines how server routes access deployment-provided capabilities through `c.env` without making Nue core depend on any one hosting platform.

This document uses **developer** for the person building a site or app. It avoids using **user** for that role because `users` is also an application/domain model in the existing templates.

This is the next beta 3 milestone after the Cloudflare Pages adapter and Git integration validation. The immediate goal is to design a small, testable resource contract before implementing production resources such as users, sessions, D1, KV, R2, Durable Objects, Queues, or Analytics Engine.

## Current Local Model

Nueserver already accepts an environment object:

```js
fetch(request, env)
```

For each request, Nueserver exposes that object as:

```js
c.env
```

Local development currently builds `c.env` from JSON files under the server data directory. `packages/nuekit/src/server/model.js` reads files such as `users.json` and `leads.json`, turns them into simple in-memory models, and adds specialized domain-user helpers such as `login`, `logout`, and `authenticate`.

That file is not a general platform resource layer. It creates a very specific local model for the current templates:

- Entity collections are inferred from JSON filenames.
- Each collection uses a simple in-memory API.
- Session persistence writes to `.nue/sessions.json`.
- Session writes are file-based and probably do not support concurrent writes safely.
- The current domain-user model is local/mock behavior and should not be treated as thread-safe or production-ready.

The long-term direction is to move this domain model out of Nue core and into app/site code, templates, or optional resource packages. Core should provide the platform interfaces that let this model, and other models, run consistently across local development and production adapters.

The full template currently reads domain models directly from `c.env`. The resource-layer design should move that route code toward `c.env.models`:

```js
const { users } = c.env.models
const ret = await users.login(email, password)
```

The Cloudflare Pages adapter currently bundles server routes and dispatches them with the raw Cloudflare environment:

```js
dispatch(request, env)
```

This means `c.env` works as the platform boundary, but there is not yet a formal contract for which values are raw platform bindings, which are normalized Nue resources, and how local development should match production.

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

- production users
- production sessions
- universal login/authentication/session semantics
- D1-backed collections
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
c.env.models.users.login(email, password)
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
```

An adapter may add adapter-specific interpretation, defaults, or validation in its own code space. For Cloudflare Pages, a future version might map a declared model to D1, KV, or another binding, but that mapping should be explicit enough that the adapter knows where the data lives and how to construct `c.env.models`.

Longer term, platform adapters may live in per-platform folders or outside Nuekit as plugins. The resource declaration shape should prepare for that, but beta 3 does not need to implement the plugin system.

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

## Config Resource As The First Slice

The first implementation slice should be a normalized config resource. It is useful immediately and less risky than users or sessions.

Proposed route API:

```js
const value = c.env.config.get('PUBLIC_SITE_NAME')
const required = c.env.config.require('PUBLIC_SITE_NAME')
const publicConfig = c.env.config.public()
```

Suggested behavior:

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

Local development should compose `c.env` from local sources:

- JSON model files under `@shared/server/data` continue to create simple local models such as `users` and `leads`.
- Local config can come from project config and/or a future local env file.
- Local `platform` can be empty or contain a local diagnostic object.
- Existing fake Cloudflare request headers in `worker.js` can remain request-header mocks, not environment resources.

The current JSON model helpers should be treated as local mock resources, not production implementations. They can move from core into templates or project-local code once the resource factory gives local development a stable way to assemble `c.env.models`.

## Cloudflare Pages Mapping

The Cloudflare Pages adapter should shape the raw worker environment before dispatching to Nueserver.

Current generated worker behavior:

```js
dispatch(request, env)
```

Future generated worker behavior:

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

For the first config slice:

- Cloudflare string bindings and environment variables can back `c.env.config`.
- Raw Cloudflare bindings stay available under `c.env.platform`.
- `env.ASSETS` remains an adapter implementation detail for static asset fetches and should not be exposed as a normalized route resource by default.
- Declared models should be mapped into `c.env.models` by Cloudflare-specific resource implementations.

Later Cloudflare resource mappings may wrap:

| Cloudflare binding | Possible normalized resource |
|---|---|
| D1 | collections, SQL, app models |
| KV | key-value config/cache/storage |
| R2 | object/blob storage |
| Durable Objects | stateful actors/sessions/realtime |
| Queues | background jobs/events |
| Analytics Engine | analytics/event ingestion |

These mappings should be designed only after the first config resource proves the contract.

## Resource Factory Boundary

Adapters should call a target-neutral resource factory instead of constructing `c.env` ad hoc.

Conceptual API:

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

## First Implementation Slice

A focused beta 3 implementation can be:

1. Add a target-neutral resource factory module in Nuekit.
2. Add a config resource with `get`, `require`, and `public`.
3. Add resource declaration parsing for developer-defined models in `site.yaml`.
4. Update local server worker creation to pass JSON models through the resource factory as `c.env.models`.
5. Update the Cloudflare Pages worker generation to pass raw Cloudflare `env` through the resource factory and expose it under `c.env.platform`.
6. Implement enough Cloudflare model mapping for the `spa` and `full` templates to work.
7. Add tests for local resource shaping, config access, model namespacing, and Cloudflare worker dispatch receiving the shaped env.

This establishes the production boundary even if the template route API changes from `c.env.users` to `c.env.models.users`.

## Open Questions

- What exact `site.yaml` schema should resource declarations use?
- Should raw platform access remain `c.env.platform`, or should any future adapter require additional namespacing?
- Should `PUBLIC_*` be enough for beta 3, or should public config require an explicit allowlist?
- Should local config read only `site.yaml` for beta 3, or should a later phase add `.env` support?
- Can domain-user/login/session/authentication helpers be designed universally across Cloudflare, Netlify, Vercel, and similar platforms?
- Which storage backing should the Cloudflare implementation use for small collections, large collections, and sessions?
- Should adapter tooling eventually provision platform resources through provider APIs, or only validate resources configured by the developer?
- Can local JSON files become production seed data, and if so, how does that interact with SQL schemas and migrations?
- How should TypeScript developers get resource types in route files?

## Decision For Now

Proceed with a small config/resource-factory slice plus `c.env.models` namespacing. Treat the current JSON domain model as local/template behavior that should move out of core. Expose raw Cloudflare bindings directly under `c.env.platform`, and defer production users/sessions/storage semantics until platform capability research is complete.
