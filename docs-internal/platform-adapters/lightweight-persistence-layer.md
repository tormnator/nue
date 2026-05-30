# Lightweight Persistence Layer Design And Plan

Working draft, started 2026-05-29.

## Purpose

This document starts M4b from the platform adapter master plan. It turns the current model-resource findings into a design for a small persistence boundary above local JSON storage and platform storage such as Cloudflare D1.

The goal is not to design a full ORM, migration system, auth system, or universal data model. The goal is to separate storage mechanics, generic collection persistence, and app/template domain behavior so platform adapters do not need to own concepts such as users, login, sessions, or authentication.

## Starting Inputs

Primary inputs:

- [Platform Adapters Master Plan](./master-plan.md), especially M4b.
- [Platform Resource Layer](./platform-resource-layer.md), especially the `c.env` shape and D1 collection mapping.
- [Model Resources Status And Persistence Plan](./model-resources-status-plan-260528.md).
- [Beta 3 Release Notes Draft](../releases/beta-3.md), especially the planned lightweight persistence section and known limitations.

Current implementation facts checked at M4b start:

- `packages/nuekit/src/server/resources.js` owns `createResourceEnv()` and `createConfigResource()`.
- `packages/nuekit/src/server/model.js` still owns local JSON-backed collections and the specialized local `users` model with `login`, `logout`, and `authenticate`.
- `packages/nuekit/src/platform/cloudflare-pages/resources.js` owns Cloudflare D1 collection resources and exposes only generic collection behavior.
- The `spa` template uses generic `c.env.models.users.getAll()` and `get(id)` behavior.
- The `full` template still expects `c.env.models.users.login()`, `logout()`, and `authenticate()` for the admin demo.
- Existing focused tests cover local model creation, resource env shaping, D1 collection behavior, and Cloudflare worker resource dispatch.

## Alignment With Source Plans

This document is now the M4b design artifact. The follow-up issue, if created, should be an implementation issue based on this design rather than another design task.

Alignment with the master plan M4b scope:

- Keeps the layer small, platform-neutral, and below app/template domain semantics.
- Separates concrete providers, generic collection operations, and template domain behavior.
- Keeps adapters responsible for storage capabilities, not users, login sessions, or authentication semantics.
- Keeps schema creation, migrations, JSON seed import, platform provisioning, and production auth/session strategy out of scope.
- Validates against both `spa` and `full` template needs without claiming a broad universal data model.

Alignment with the status/plan note:

- Uses a wrapper, `createCollectionResource(provider)`, instead of exposing a persistence manager on `c.env`.
- Keeps route code on `c.env.models` and does not introduce `c.env.persistence` in this slice.
- Treats the current `getAll`, `size`, `create`, `get`, item `update`, and item `remove` shape as the beta 3 compatibility surface, not a final universal API.
- Keeps object-level item methods because the current templates use them and the wrapper can centralize their behavior.
- Moves specialized `users.login/logout/authenticate` behavior out of Nue core and into the full template.
- Uses `users` and `loginSessions` collections as storage below a template-local login-session service so local and Cloudflare can share the same persistence boundary.

## Problem Statement

The M4 issue #28 implementation proved that local and Cloudflare model resources can be exposed under `c.env.models`, but the current code still mixes three separate concerns:

1. Concrete storage providers, such as local JSON/in-memory data and Cloudflare D1.
2. Generic collection persistence operations, such as list, count, create, read, update, and delete.
3. App/template domain behavior, such as users, login, sessions, and authentication.

The coupling is clearest in the `users` model. Local development has specialized `users.login/logout/authenticate` methods because `server/model.js` has template-specific auth behavior. Cloudflare D1 collections intentionally do not duplicate those methods. If adapters are asked to copy every domain-specific method, platform adapters become app model implementations, which is the wrong boundary.

M4b should make the boundary explicit before more adapters or resource backings are added.

## Design Goals

- Keep route code simple and stable for beta 3 where possible.
- Keep `c.env.models` as the main route-facing namespace for declared app models.
- Put reusable generic collection behavior in a platform-neutral layer.
- Let local JSON and Cloudflare D1 become providers behind that layer.
- Move app/template-specific user/session behavior out of Nue core and out of platform adapters.
- Preserve clear errors for missing files, missing bindings, unsupported model kinds, and incompatible platform bindings.
- Keep schema creation, migrations, JSON import, provisioning, and production auth/session design as explicit follow-ups unless M4b deliberately scopes in a narrow piece.
- Validate against the `spa` and `full` templates without claiming broad universal data-model support.

## Non-Goals

- Do not build an ORM.
- Do not add a query language.
- Do not design migrations or schema management.
- Do not automatically import local JSON into production stores.
- Do not implement universal users, sessions, login, password hashing, or auth policy in core.
- Do not expose raw provider handles as a normal route API.
- Do not add Cloudflare KV, R2, Durable Objects, Queues, or Analytics Engine support in the first M4b slice.

## Terminology Direction

Use these terms for M4b unless implementation proves a better name is needed:

| Term | Meaning |
|---|---|
| Persistence provider | A concrete storage adapter for a collection, such as local JSON/in-memory storage or a D1 table. |
| Collection resource | The platform-neutral resource exposed under `c.env.models.<name>` for generic record operations. |
| Domain model | App or template behavior built above collection resources, such as users, sessions, login, leads, products, carts, or payments. |

Avoid **CRUD domain model** as a name. It blends persistence mechanics with app semantics.

The term **persistence manager** remains provisional. M4b may not need a separately exposed manager if a small `createCollectionResource(provider)` wrapper is enough.

## Proposed Boundary

The recommended first M4b design is:

```js
// Route-facing resource remains plain and familiar
const { leads } = c.env.models
const lead = await leads.create(data)
await lead.update({ status: 'new' })
```

Behind that route-facing API, local and platform code provide storage through a smaller internal provider contract:

```js
const provider = {
  async list() {},
  async count() {},
  async create(data) {},
  async get(id) {},
  async update(id, data) {},
  async remove(id) {}
}

const resource = createCollectionResource(provider)
```

The exact provider method names are not final. The important design move is that item decoration, `id`/`created` handling policy, and `item.update()` / `item.remove()` behavior should be shared instead of reimplemented separately in local and Cloudflare code.

## Initial API Recommendation

For beta 3 compatibility, keep the existing route-facing collection shape for now:

```js
await model.getAll()
await model.size()
await model.create(data)
await model.get(id)
await item.update(data)
await item.remove()
```

This shape should be treated as the beta 3 collection resource surface, not as a long-term universal data model promise. It supports the current templates and keeps M4b focused on the internal boundary.

The provider-facing shape can use clearer internal names such as `list`, `count`, `create`, `get`, `update`, and `remove`, but the first implementation should avoid exposing a second public route API until there is a stronger reason.

For compatibility, route-facing `item.update(data)` remains a patch-style call. The shared wrapper can merge the current item and patch before delegating to the provider, so the provider receives the complete record state it should persist.

## `c.env` Exposure Recommendation

Do not expose `c.env.persistence` in the first M4b implementation.

Reasons:

- Current route code already has a resource namespace: `c.env.models`.
- Exposing a manager too early risks making provider mechanics part of the public route API.
- Domain model factories can receive collection resources directly.

If a later design needs a manager, introduce it deliberately with a concrete use case, not as an implementation convenience.

## Provider Selection Recommendation

Keep the current declaration shape for the first implementation:

```yaml
resources:
  models:
    leads:
      kind: collection
      local: @shared/server/data/leads.json

platform:
  name: cloudflare-pages
  resources:
    models:
      leads:
        binding: DB
        table: leads
```

For Cloudflare Pages, `kind: collection` should describe the route-facing collection contract, not a specific backing store. The platform `binding` property is the Cloudflare lookup key; adapter code can inspect the bound resource object and choose the correct collection provider from its capabilities. Today the implementation supports only `kind: collection` and creates a D1-backed collection from the configured binding, but the configuration does not need an explicit `type: d1` while D1 is the only implemented Cloudflare collection provider. Later, `kind` can further customize collection creation while `binding` continues to identify the platform resource.

Local development can continue to use `resources.models.<name>.local`. Automatic production seeding from that file should remain out of scope.

## Domain Model Direction

App/template domain behavior should wrap collection resources rather than live in core model creation or adapters.

The full template should move toward a shape like:

```js
import { createUsersModel } from './models/users.js'

post('/api/login', async (c) => {
  const users = createUsersModel(c.env.models.users)
  const ret = await users.login(email, password)
})
```

This keeps `users.login()` as template/app behavior. It also prevents Cloudflare, Netlify, Vercel, and future adapters from each needing to implement template auth methods.

## Current Login Sessions

Use **login sessions** for the current full-template auth tokens. Avoid **users sessions**. Use **user sessions** only if a future implementation actually stores user-linked session records. The current HMR `sessions` map and Nuestate `sessionStorage` support are unrelated and should be named separately.

Current local flow:

- The full template currently seeds one login account: `admin@example.com` / `demo123`.
- There is no UI or server route for adding, modifying, or deleting login users.
- A JSON file named `users.json` gets a special local model with `login`, `logout`, and `authenticate` methods.
- `login(email, password)` compares plaintext credentials from the JSON-backed user records.
- Successful login creates a `crypto.randomUUID()` session id, adds it to an in-memory `Set`, writes the set to `.nue/sessions.json`, and returns `{ sessionId, user }`.
- The login page stores `sessionId` in `localStorage.$sid`.
- The template CRUD helper sends `Authorization: Bearer <sessionId>`.
- Admin middleware calls `users.authenticate(sessionId)`, which only checks whether the token exists in the in-memory `Set`.
- `logout(sessionId)` deletes the token from the set and rewrites `.nue/sessions.json`.

What works today:

- The local full-template happy path works: login, bearer-token requests, admin guard, and logout.
- HMR keeps login sessions alive because the local worker env and its in-memory session set survive route-module reloads.
- Full process restarts can reuse a saved login session only when the same `.nue/sessions.json` file is read again, the browser still has `localStorage.$sid`, and the server starts from the same `process.cwd()`.

Known flaws and security issues:

- Passwords are plaintext demo data.
- The single seeded login account is manually edited seed data, not managed by the app.
- Runtime user creation, if called from code, is local in-memory behavior and is not persisted back to `users.json`.
- `login()` returns the full user object, which can include the plaintext password.
- Session ids are raw bearer tokens stored in browser `localStorage`.
- The saved file stores only token strings; there is no user id, expiry, created time, rotation, device metadata, or invalidation policy.
- There is no automatic logout on app shutdown, browser tab close, or browser window close.
- Abandoned login sessions remain valid until explicit logout or manual file cleanup.
- Repeated logins create new session ids, so `.nue/sessions.json` can grow without automatic pruning.
- Session storage is tied to `process.cwd()/.nue/sessions.json`, not the configured project root.
- Session-file read errors are swallowed and treated as an empty session set.
- Login/logout rewrite the whole file without locking or merge behavior.
- Cloudflare D1 collection resources do not implement `login`, `logout`, or `authenticate`, so the full-template admin login does not currently work on Cloudflare.

## Full Template Adapter Goal

M4b should make the `full` template work with platform adapters, including Cloudflare Pages, while being explicit that the bundled login-session behavior is a demo and not production auth. The preferred direction is a template-local login-session service built above declared collection resources, not auth behavior in Nue core or in each platform adapter.

The target is to make the current full-template login/admin behavior work on Cloudflare Pages. Minor cleanup is welcome, but M4b does not need to redesign auth beyond the current feature set.

Recommended design:

- Keep login/authentication behavior in template-local domain code, not Nue core and not platform adapters.
- Back that template-local domain code with generic collection resources so the same behavior can run locally and on Cloudflare D1.
- Keep a `users` collection for seeded demo login users.
- Add a separate login-session collection, preferably named `loginSessions` rather than generic `sessions`, to avoid confusion with HMR sessions and browser `sessionStorage`.
- Build a small template-local service, such as `createLoginSessionModel({ users, loginSessions })`, that exposes the current `login`, `logout`, and `authenticate` behavior to the full-template routes.
- Keep the login page and internal docs explicit that this is demo auth with plaintext seeded credentials and bearer tokens, not production auth.

Making login sessions a collection resource has a practical consequence: login sessions become normal persisted records instead of an in-memory `Set` plus `.nue/sessions.json`. That gives local and Cloudflare code the same persistence boundary and lets the full template run through platform adapters. It also means the template must declare and provision a login-session backing store, such as a local JSON file and a D1 table. It does not automatically solve security or lifecycle problems: token hashing, expiry, cleanup, session rotation, user linkage, and production cookie policy remain template or follow-up auth design choices.

## Implementation Handoff

This document is the design reference for M4b. Operational tracking, checkpoints, branch coordination, validation tasks, and the implementation issue draft belong in [Platform Adapters Master Plan](./master-plan.md).

The implementation should begin with the shared collection boundary, then move the full-template demo login-session behavior into template-local code backed by `users` and `loginSessions` collections. Keep the implementation narrow: match current behavior locally and on Cloudflare D1 first, document limitations, and defer production auth improvements.