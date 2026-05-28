## Model Resources Status And Persistence Plan

Working draft, started 2026-05-28.

This note evaluates the current issue #28 model-resource implementation and sketches the next persistence-layer direction. It is intentionally a working document. Names and APIs below are provisional unless marked as current implementation facts.

## Current Understanding

Issue #28 has produced a useful first Platform Resource Layer slice:

- A target-neutral resource env factory shapes route `c.env`.
- `c.env.config` exposes `get`, `require`, and `public`.
- Local JSON-backed models are now exposed under `c.env.models`.
- The Cloudflare Pages adapter exposes raw platform bindings under `c.env.platform`.
- The Cloudflare Pages adapter can map declared `kind: collection` models to D1-backed model resources.

The current Cloudflare implementation is almost compatible with the local model API used by the templates. The important missing piece is the specialized local `users` model behavior: `login`, `logout`, and `authenticate`.

This is acceptable for issue #28 if the scope is stated narrowly. It validates env/resource shaping and generic D1-backed persistence for declared models. It does not validate production users, sessions, auth, migrations, provisioning, or the full template's admin login flow.

## Design Problem

The current local model implementation combines several concerns:

- Local file and in-memory persistence.
- Generic record operations such as create, get, list, update, and remove.
- Domain/application behavior such as users, login, logout, sessions, and authentication.
- Template-specific assumptions from the `spa` and `full` templates.

The Cloudflare implementation has repeated the generic record-operation shape against D1, but it intentionally does not repeat the specialized local `users` behavior.

This creates a coupling problem. If domain model behavior changes, each platform adapter could be forced to mirror it. That would make adapters responsible for app/domain semantics instead of platform capabilities. It would also push Nue toward a narrow "universal data model" idea that is not a near-term goal and may be too opinionated for a flexible framework.

## Terminology Direction

Avoid using **CRUD domain model** as the name for the next layer. It mixes persistence mechanics with the app's domain model.

Also avoid treating the current `getAll`, `size`, `create`, `get`, item `update`, and item `remove` shape as the final API. That shape is useful evidence from the current templates, but the next design should start from needs and constraints rather than freezing the beta implementation.

Working terms for now:

| Term | Provisional meaning |
|---|---|
| Persistence provider | A concrete platform or local storage implementation, such as D1, local JSON, KV, Durable Objects, SQLite, or another backing store. |
| Persistence manager | A lightweight platform-neutral wrapper/decorator around one or more providers. It owns the common API exposed to app/domain code and hides provider-specific details. |
| Domain model | The full set of app-specific models/entities/services needed by a site or app, such as users, leads, products, sessions, carts, or payments. |

The names are not settled. The important split is:

1. Platform adapters implement or expose persistence providers.
2. A platform-neutral manager/wrapper provides the small common persistence API.
3. App or template domain models build on that persistence API.

This persistence layer should stay lightweight. It should not try to become an ORM, schema framework, query language, migration framework, auth system, or broad universal data model.

## Persistence Layer Needs

The next design should answer these questions before naming the final API:

- What are the smallest useful operations for JSON-like records?
- Should records have built-in persistence methods such as `user.update()` and `user.remove()`?
- Can those methods be supported without making objects carry too much hidden provider state?
- Should app code ever see a persistence manager directly, such as `c.env.pm`, or should domain objects and models hide it?
- How should multiple providers be selected per app model when one adapter supports D1, KV, Durable Objects, or other storage?
- How should local JSON development data relate to production storage?
- Should data bootstrapping/import be explicit tooling instead of runtime behavior?
- What parts of schema, migration, and seed import belong outside the first persistence layer?

Current preference:

- Keep user route code simple.
- Allow persistence-style methods on domain/model objects if the implementation remains small and understandable.
- Do not expose a persistence manager to route code unless there is a strong reason.
- Use a manager/wrapper internally if needed to avoid duplicating object decoration and provider coordination across local and platform implementations.
- Keep bootstrapping/migration explicit and separate from request-time route behavior.

## Template Implications

### SPA Template

The `spa` template only depends on generic access to a `users` model:

```js
const { users } = c.env.models
return c.json(await users.getAll())
```

It does not depend on `login`, `logout`, or `authenticate`. This makes it independent of the specialized local `users` behavior.

### Full Template

The `full` template currently depends on specialized `users` behavior:

```js
post('/api/login', async (c) => {
    const { users } = c.env.models
    const ret = await users.login(email, password)
})
```

That behavior should not be implemented separately in every platform adapter. It should move out of Nue core and into the template or app domain model code.

One possible shape is a template-local model/service that wraps the generic persisted `users` data:

```js
import { createUsersModel } from './models/users.js'

post('/api/login', async (c) => {
    const users = createUsersModel(c.env.models.users)
    const ret = await users.login(email, password)
})
```

If a future persistence manager is needed by that model/service, it can be passed in without exposing the manager as the main route API:

```js
const users = createUsersModel(c.env.models.users, c.env.persistence)
```

The name `c.env.persistence` is only illustrative. It should not be adopted without a separate naming/API decision.

## Open Questions

- What should the persistence manager/wrapper be called?
- Should it be exposed on `c.env`, kept internal, or only passed to template/domain model factories?
- What is the smallest stable persistence API that supports current templates without becoming an ORM?
- Should object-level methods such as `item.update()` remain part of the API?
- How should provider selection be configured when one adapter supports multiple persistence backings?
- Should local JSON import/bootstrapping be a separate command, an adapter tool, or a template utility?

## Current models implementation comparison

### models.js

- Is still in core.
- Has session file persistence, model in-memory persistence, general Model object, specific User object
- Model "Item" object shape:
    - Properties as defined in the backing JSON-file
    - id // auto-generated value
    - created // auto-generated value
    - update(data) // assigns data to itself
    - remove() // removes itself from the owner array
- General Model shape:
    - Private array of items
    - getAll()
    - size()
    - create(obj)
    - get(id)
- Users model shape // with login/logout/authenticate/sessions
    - Has private users model and sessions set.
    - Conceptually “inherits” the general users model (getAll, size, create, and get functions become members of this model)
    - login(email, password)
    - logout(sessionId)
    - authenticate(sessionId)
- createEnv(dir, opts)  // by the way, s/b called createModelResources()
    - Returns an object where each property is a model
    - If opts.resources.models exist then:
        - Adds each model declared in the resources to the returned env. Uses the local path specified in the resources for the filename
    - Otherwise:
        - Adds a model for each JSON-file in the provided "dir" parameter
    - When creating a model, if the filename equals 'users', then create the Users model, otherwise create general model.

### cloudflare-pages/resources.js

- Model "Item" object shape
    - Properties as defined in the JSON-string in the db row's data column
    - id // from the id column in the db row
    - created // from the created column in the db row
    - update(data) // Assigns data to itself and updates the db via SQL (delegates to owner's update function)
    - remove() // Removes itself from the owner array and updates the db via SQL (delegates to owner's remove function)
- General Model shape (based on D1 database access via SQL):
    - No cached array/collection → all access SQL
    - getAll() // SQL select
    - size() // SQL select count
    - create(data) // SQL insert
    - get(id) // SQL select
    - update(item) // SQL update
    - remove(id) // SQL delete
- Users model: not supported yet!
- createModelResources(env, resources, platformResources)
    - Returns an object where each property is a model
    - Creates a model object for each item declared in resources.models
