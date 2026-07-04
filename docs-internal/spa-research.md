# Nue SPA Documentation Research

> **Purpose:** Pre-documentation research for the Nue SPA documentation sub-site.  
> **Created:** May 2026  
> **Updated:** July 2, 2026, added a TODO for documenting SPA islands.
> **Status:** Research phase — not yet documentation

---

## Table of Contents

1. [Overview and Framing](#1-overview-and-framing)
2. [What Is Working vs. What Is Promised](#2-what-is-working-vs-what-is-promised)
3. [Core Concepts and Architecture](#3-core-concepts-and-architecture)
4. [SPA Entry Point: `<!doctype dhtml>`](#4-spa-entry-point-doctype-dhtml)
5. [Client-Side Routing](#5-client-side-routing)
6. [Nuestate: State Management](#6-nuestate-state-management)
7. [Nuedom: The UI Layer](#7-nuedom-the-ui-layer)
8. [Dynamic Component Mounting](#8-dynamic-component-mounting)
9. [Component Lifecycle](#9-component-lifecycle)
10. [Data Fetching](#10-data-fetching)
11. [The SPA Template (Minimal)](#11-the-spa-template-minimal)
12. [The Full Template (Advanced SPA)](#12-the-full-template-advanced-spa)
13. [Server Layer: Nueserver](#13-server-layer-nueserver)
14. [Mock Data and the Local Model](#14-mock-data-and-the-local-model)
15. [Custom Server Proxy](#15-custom-server-proxy)
16. [HMR and Development Workflow](#17-hmr-and-development-workflow)
17. [Build System and SPA Production](#17-build-system-and-spa-production)
18. [MPA+SPA Hybrid Architecture](#18-mpaspa-hybrid-architecture)
19. [Client-side Components](#19-client-side-components)
20. [What Is Not Yet Supported](#20-what-is-not-yet-supported)
21. [SPA vs. MPA: Nue's Philosophical Stance](#21-spa-vs-mpa-nues-philosophical-stance)
22. [Roadmap: Future SPA Features](#22-roadmap-future-spa-features)
23. [Source Inventory](#23-source-inventory)

---

## 1. Overview and Framing

Nue's SPA support is a genuine feature of Nue 2.0 that is fully functional for local development. The documentation explicitly marks SPA as "local development only" — production cloud deployments are not yet available.

From `spa-development.md`:

> **Local development only**: SPA's currently work only as a local mockup to get a glimpse of what's coming. Production deployments with CloudFlare integration and [universal data model](universal-data-model) come later.

From `nueserver.md`:

> **Disclaimer** Nueserver currently works for local development only. It's the foundation for Nue's upcoming backend vision.

**What this means in practice:**
- You can build, run, and test a fully working SPA on localhost using `nue dev`.
- The full feature set — routing, state, component mounting, server routes, auth patterns, CRUD — works in local development.
- You **cannot** deploy that SPA to production yet through Nue's own infrastructure.
- You **can** connect to your own existing backend via a proxy config, giving a path to production.

The SPA story is best understood as: Nue provides the frontend SPA architecture, the local dev server/API layer, and a clear promise of cloud deployment — but the deployment piece is still future work.

---

## 2. What Is Working vs. What Is Promised

### Working Now (Local Development)

| Feature | Status | Source |
|---|---|---|
| `<!doctype dhtml>` SPA entry point | ✅ Working | `nue-jit.js`, `asset.js`, templates |
| Client-side routing via Nuestate | ✅ Working | `state.js`, tests, templates |
| URL path parameters (`/:id`) | ✅ Working | `state.js`, confirmed in tests |
| URL query parameters (`?search=`) | ✅ Working | `state.js`, confirmed in tests |
| sessionStorage state persistence | ✅ Working | `state.js` |
| localStorage state persistence | ✅ Working | `state.js` |
| In-memory state | ✅ Working | `state.js` |
| `emit_only` events | ✅ Working | `state.js`, confirmed in tests |
| `autolink` — SPA navigation from `<a href>` | ✅ Working | `state.js` |
| Back/Forward browser navigation | ✅ Working | `state.js` (`popstate` handler) |
| Dynamic component mounting (`this.mount()`) | ✅ Working | `node.js` |
| Lifecycle methods (`mounted`, `onmount`, etc.) | ✅ Working | `node.js` |
| `this.update()` for manual re-render | ✅ Working | `node.js` |
| Loops, conditionals, expressions in components | ✅ Working | `node.js` |
| Nueserver route handlers (`get`, `post`, `del`, `use`) | ✅ Working | `nueserver.js`, `worker.js` |
| Middleware/auth patterns | ✅ Working | `worker.js`, full template |
| Mock data from JSON files in `server/data/` | ✅ Working | `model.js` |
| Mocked Cloudflare request headers locally | ✅ Working | `worker.js` |
| Custom server proxy | ✅ Working | `proxy.js` |
| Hot Module Replacement for SPA components | ✅ Working | `hmr.js` |
| SPA-scoped asset dependency resolution | ✅ Working | `deps.js` |
| `nue create spa` / `nue create full` templates | ✅ Working | `create.js`, templates |
| `state.set()` batch updates | ✅ Working | `state.js` |
| `state.on()` de-duplication | ✅ Working | `state.js`, tests |
| Slots in components | ✅ Working | `node.js` |
| Import maps for module aliasing | ✅ Working | `renderDHTML` in `page.js` |
| In-browser compilation (no build step in dev) | ✅ Working | `nue-jit.js` |

### **Note on `state.on()` tests marked `.skip`**

Two browser tests in `packages/nuestate/test/browser.test.js` are marked `test.skip`:

```js
test.skip('click flow', () => { ... })
test.skip('back button', () => { ... })
```

These tests require a more complete DOM mock (`document.addEventListener`, `history.pushState`, etc.) and are currently skipped due to environment limitations — not because the features are broken. The underlying code for `autolink` and `popstate` handling is present and used in the live templates. The non-browser unit tests in `state.test.js` pass fully.

---

### Promised / Future (Not Yet Available)

| Feature | Status | Source |
|---|---|---|
| Production cloud deployment (Cloudflare) | 🔮 Roadmap | `spa-development.md`, `nueserver.md` |
| Universal data model (beyond mock JSON) | 🔮 Roadmap | `universal-data-model.md`, `roadmap.md` |
| Users/auth on Cloudflare Workers (real) | 🔮 Roadmap | `model.js` comments, `universal-data-model.md` |
| Payments/subscriptions model | 🔮 Roadmap | `universal-data-model.md`, `roadmap.md` |
| Analytics/events model | 🔮 Roadmap | `roadmap.md` |
| Email campaigns model | 🔮 Roadmap | `universal-data-model.md` |
| Multi-site development & deployment | 🔮 Roadmap | `roadmap.md` |
| SPA template library (CRM, analytics, mailing list, etc.) | 🔮 Roadmap | `roadmap.md` |
| `nue push` deployment | 🔮 Roadmap | `roadmap.md` |
| Pre-built design system templates (Mies, Rams, Muriel) | 🔮 Roadmap | `roadmap.md` |

---

## 3. Core Concepts and Architecture

Nue SPAs are built on **strict separation of concerns** split into four layers:

```
┌────────────────────────────────────────────────────┐
│  Routing + State   → Nuestate (URL-first)           │
├────────────────────────────────────────────────────┤
│  UI Layer          → Nuedom (.html components)      │
├────────────────────────────────────────────────────┤
│  Business Logic    → JS modules (@shared/app/)      │
├────────────────────────────────────────────────────┤
│  Design System     → CSS (@shared/design/)          │
├────────────────────────────────────────────────────┤
│  Server/Data       → Nueserver + mock model         │
└────────────────────────────────────────────────────┘
```

Unlike React, which mixes these layers inside components, Nue enforces them at the file level. A `.html` component cannot have embedded `<style>` blocks, cannot have inline style attributes, and has a class-name count limit (default: 3). These are **enforced constraints** (see `node.js`), not just recommendations.

**Key philosophy quote** from `nuedom.md`:

> The document structure IS the application architecture.

---

## 4. SPA Entry Point: `<!doctype dhtml>`

A file becomes an SPA entry point when it meets **all three conditions** (from `asset.js`, `isSPAEntry()`):

```js
async function isSPAEntry() {
  if (!file.is_html || file.base != 'index.html') return false
  const { is_dhtml=false, root={} } = await parse()
  return is_dhtml && root.tag == 'body'
}
```

So:
1. The file must be named `index.html` (not any other name).
2. It must use `<!doctype dhtml>` (making `is_dhtml = true`).
3. Its root element must be `<body>` (i.e., it scopes the entire body).

When all three conditions are met, Nue treats this file as an **SPA entry point** and automatically includes all assets from its directory tree as dependencies.

### The DHTML Doctype System

Nue uses doctype declarations to classify HTML files:

| Doctype | Type | Description |
|---|---|---|
| `<!doctype html>` | Server page | Static page, renders to HTML |
| `<!doctype dhtml>` | Dynamic page | Client-rendered SPA entry or interactive page |
| `<!html lib>` | Server library | Server-side component library |
| `<!dhtml lib>` or `<!doctype dhtml lib>` | Client library | Client-side component library |
| `<!html+dhtml>` or `<!doctype html+dhtml>` | Isomorphic | Works on server and client |
| `<!doctype html>` with `<html>`/`<head>` root | Raw HTML | Passed through unchanged |

Nue also **auto-detects** type when doctype is omitted: if a file has `:onclick` handlers or `import` statements, it becomes DHTML.

### Minimal SPA Entry (`spa` template)

```html
<!doctype dhtml>

<script>
  import { state } from 'state'
  state.setup({ route: '/:id', autolink: true })
</script>

<body>
  <main>
    <article/>
  </main>

  <script>
    state.on('id', ({ id }) => {
      this.mount(id ? 'user' : 'users', 'article')
    })

    mounted() {
      state.init()
    }
  </script>
</body>
```

**How it works:**

- The top-level `<script>` (outside `<body>`) runs before mount — for global setup like state configuration and auth guards.
- The `<body>` element becomes the root component.
- The inner `<script>` contains lifecycle methods and state listeners.
- `state.init()` in `mounted()` populates state from the current URL and fires initial events.

### Route Handling

When a user visits any URL under the SPA's directory (e.g., `/`, `/123`, `/users/settings`), the server catches all non-file requests and routes them to the SPA's `index.html` (from `serve.js`):

```js
// SPA entry page
if (!ext) {
  const app = url.split('/')[1]
  const spa = assets.find(asset => ['index.html', `${app}/index.html`].includes(asset.path))
  if (spa) return (await spa.render()).html
}
```

This is the client-side routing catch-all that makes SPAs work — all unknown routes return the SPA HTML, and Nuestate then handles the URL client-side.

---

## 5. Client-Side Routing

### Route Patterns

Routes use `:parameter` syntax:

```js
state.setup({
  route: '/:id'              // matches /123, /alice, etc.
})

state.setup({
  route: '/app/:section/:id' // matches /app/users/123
})
```

Route parameters become state properties automatically:
- URL `/app/users/123` → `state.section = 'users'`, `state.id = 123`

**Note: type coercion** — Nuestate automatically converts URL strings to numbers where possible (`'123'` → `123`, `'true'` → `true`, `'false'` → `false`). This is done by the `translate()` function in `state.js`.

### Query Parameters

```js
state.setup({
  query: ['search', 'filter', 'page']
})
// URL becomes: ?search=shoes&filter=active&page=2
state.search = 'shoes'
state.filter = 'active'
state.page = 2
```

### Autolink

With `autolink: true`, all `<a href>` links that match the route pattern become SPA navigation (no page reload). The autolink handler in `state.js`:

```js
root.addEventListener('click', e => {
  const link = e.target.closest('a[href]')
  if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey
      || !getPathData(opts.route, link.pathname)) return
  api.set(getURLData(link))
  e.preventDefault()
})
```

- Only links matching the route pattern are intercepted.
- Meta-key and Ctrl-key clicks open in new tabs normally.
- External links pass through unmodified.
- Links that don't match the route pattern navigate normally.

### Back/Forward Navigation

Nuestate listens for `popstate` events:

```js
function onpopstate({ state }) {
  state ? api.set(getURLData(location), true) : api.init()
}
```

When the browser back/forward buttons are pressed, Nuestate updates its state from the URL and fires listeners — no additional code needed from the developer.

### How pushState Works

When state changes that map to URL parameters occur, Nuestate updates the browser URL:

```js
function pushURLState(at, data) {
  const search = opts.query[0] ? renderQuery(opts.query, data) : ''

  if (at.has('path_params')) {
    history.pushState(true, 0, renderPath(opts.route, data) + search)
  } else if (at.has('query')) {
    history.replaceState(true, 0, search || './')
  }
}
```

- Path parameter changes use `pushState` (creates browser history entry).
- Query parameter changes use `replaceState` (updates URL without new history entry).

---

## 6. Nuestate: State Management

Nuestate is a separate package (`packages/nuestate`) available as `nuestate` on npm/esm.sh.

### How Nuekit Maps `'state'`

Nuekit automatically adds `state` to the import map in every DHTML page (from `page.js`):

```js
const map = conf.import_map ??= {}
map.state = '/@nue/state.js'
```

This means `import { state } from 'state'` works in any SPA component without explicit configuration.

### Storage Model

Nuestate stores a single JSON blob in localStorage/sessionStorage under the key `$state`:

```js
const KEY = '$state'

function getStoreData(store) {
  return JSON.parse(store[KEY] || '{}')
}

function setStoreValue(store, key, val) {
  const data = getStoreData(store)
  if (data[key] != val) {
    data[key] = val
    store[KEY] = JSON.stringify(data)
  }
}
```

**Important:** Multiple apps on the same origin share this `$state` key in localStorage. This could cause collisions if multiple SPA apps on the same site use the same property names in localStorage. Session storage is isolated per tab but not per app.

### Configuration Options

All options in `state.setup()`:

| Option | Type | Description | Storage |
|---|---|---|---|
| `route` | `string` | URL path pattern with `:param` segments | URL path |
| `query` | `string[]` | Properties stored as query params | URL search |
| `session` | `string[]` | Properties stored in sessionStorage | sessionStorage |
| `local` | `string[]` | Properties stored in localStorage | localStorage |
| `memory` | `string[]` | In-memory only (not persisted) | RAM |
| `emit_only` | `string[]` | Events that fire but don't persist | None |
| `autolink` | `boolean` | Intercept `<a href>` for SPA navigation | — |

### Reading State

State is read from multiple sources and merged in priority order:

```js
get data() {
  return translate(!window ? memory : {
    ...getStoreData(sessionStorage),
    ...getStoreData(localStorage),
    ...getURLData(location),
    ...memory
  })
}
```

Priority (highest to lowest): `memory` > URL (path+query) > localStorage > sessionStorage

### Event Listeners (`state.on`)

```js
state.on('id', ({ id }) => { ... })
state.on('search filter page', async (changes) => { ... })
```

**De-duplication:** `state.on()` with the same property name string and same function body replaces the previous listener — prevents duplicate registrations.

**Batch firing:** If multiple properties change in a single `state.set()` call, the listener fires once with all changes.

**Missing from docs:** `state.off()` exists in the source but is not documented. It removes a listener by matching property name and function body.

### `state.emit()`

For `emit_only` properties:

```js
state.setup({ emit_only: ['deleted', 'saved'] })
state.emit('deleted', userId) // fires listeners, stores nothing
```

### The `state.set()` Method (Undocumented)

`state.set()` is an internal API that handles batch updates. It is exposed on the `api` object (not through the proxy). The `full` template uses it:

```js
state.set({ ondelete: null, deleted: id })
```

This is more efficient than two separate assignments when you need to update multiple properties atomically without double-firing listeners.

---

## 7. Nuedom: The UI Layer

Nuedom (`packages/nuedom`) is the HTML-first UI library that powers both server-side rendering and client-side reactivity.

### Two Runtime Modes

1. **Server-side (`index.js`)**: Used by Nuekit during build/serve to render HTML from templates.
2. **Browser JIT (`nue-jit.js`)**: The in-browser compiler for prototyping. Not used in Nuekit's production flow.
3. **Compiled DHTML**: In Nuekit, DHTML files are compiled to JavaScript at serve time (via `compileNue()`), then executed client-side.

### How SPA Components Are Compiled and Served

When a DHTML file is requested (e.g., `ui/lib.html`), Nuekit:
1. Parses the HTML (`parseNue()`)
2. Compiles it to JavaScript (`compileNue()`)
3. Serves it with content-type `application/javascript`
4. The client loads it as an ES module

Each compiled DHTML file exports a `lib` array of component ASTs. The browser then uses `mount()` from `/@nue/nue.js` (the Nuedom client runtime) to instantiate them.

### The Client Runtime Size

The Nue.js client runtime is **2.5KB gzipped** (referenced in `build-system.md`). This compares to React's 42KB+ and Svelte's ~1.85KB baseline. The key insight is that Nue uses DOM mutation directly (no virtual DOM), making it feasible to stay very small.

### HTML Syntax Features

Full reference is in `html-syntax.md`. Key features for SPAs:

**Expressions:** `{ user.name }`, `{ count > 10 ? 'many' : count }`

**Unescaped HTML:** `{{ markdown(description) }}`

**Loops:**
```html
<tr :each="user in users">
  <td>{ user.name }</td>
</tr>

<!-- with index -->
<li :each="item, i in items">{ i }: { item.name }</li>

<!-- destructuring -->
<li :each="{ name, price } in products">...</li>
```

**Conditionals:**
```html
<p :if="count > 100">Too many!</p>
<p :else-if="count > 10">Getting there</p>
<p :else>{ count } items</p>
```

**Event handlers (client-only):**
```html
<button :onclick="count++">Click me</button>
<form :onsubmit="handleSubmit">...</form>
```

Note: `:onsubmit` automatically calls `e.preventDefault()`.

**Dynamic attributes:**
```html
<div class="status { user.status }">
<div class="[ is-active: isActive, has-error: hasError ]">
<button disabled="{ is_disabled }">
```

**CSS variable attributes:**
```html
<section --spacing="2rem">
```

**Slots:**
```html
<card>
  <div class="card"><slot/></div>
</card>
```

**JavaScript imports (client-only):**
```html
<script>
  import { state } from 'state'
  import { get, post } from 'crud'
</script>
```

**Shared scripts (available to all components in file):**
```html
<script>
  const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { ... })
</script>
```

### Architectural Constraints (Enforced)

From `node.js` (rendering code):

1. **Class name count limit** — More than `max_class_names` (default 3) triggers a `console.error`.
2. **Invalid class name characters** — Class names containing `:`, `[`, `]` (Tailwind syntax) trigger an error.
3. **No `<style>` blocks** — CSS is external only (stripped at processing).
4. **No `style` attributes** — Inline styles are ignored completely.

---

## 8. Dynamic Component Mounting

`this.mount()` is the core mechanism of SPA navigation in Nue. It replaces the content of a target element with a different component.

### Signature

```js
this.mount(name, target, data)
```

- `name`: Component name (matches the `:is` attribute on a component definition)
- `target`: DOM element or CSS selector string
- `data`: Optional data to pass directly to the component

### How It Works Internally (from `node.js`)

```js
self.mount = function(name, wrap, data) {
  if (typeof wrap == 'string') wrap = root?.querySelector(wrap)
  const ast = opts.deps?.find(c => name == (c.is || c.tag))

  // convert to <div> at runtime if needed
  if (ast.is_custom) { ast.is = ast.tag; ast.tag = 'div'; delete ast.is_custom }

  const block = createNode(ast, data, opts, self)
  block.mount(wrap)
}
```

The `mount()` call **replaces** the target element's content. The previous component is cleaned up automatically (no lifecycle `unmount` hook is provided).

### Component Library Files

SPA components are defined in `<!doctype dhtml lib>` files. The `lib` doctype means the file contains component definitions without being a standalone page:

```html
<!doctype dhtml lib>

<article :is="users">
  ...
</article>

<article :is="user">
  ...
</article>
```

Multiple components can share one file. Components are found by Nuekit based on directory hierarchy (SPA entry point includes its entire subtree).

### Passing Data on Mount

```js
// Mount with explicit data
this.mount('user-profile', 'article', { userId: state.id })

// Mount after fetching data
const all = await get('/api/admin/all')
state.on('id', ({ id }) => {
  this.mount(id ? 'contact-details' : 'contact-list', 'article', all)
})
```

---

## 9. Component Lifecycle

| Hook | Timing | Notes |
|---|---|---|
| `onmount()` | Before DOM insertion | Good for pre-fetch; `root` not yet set |
| `mounted()` | After DOM insertion | `this.root` is available; call `state.init()` here |
| `onupdate()` | Before re-render | Can return `false` to cancel update |
| `updated()` | After re-render | DOM reflects new state |

**Lifecycle in action (full template)**:

```html
<script>
  async onmount() {
    const all = await get('/api/admin/all') // fetch before mount
    state.on('id', ({ id }) => {
      this.mount(id ? 'contact-details' : 'contact-list', 'article', all)
    })
    state.init()
  }
</script>
```

Using `onmount()` for data fetching is a common pattern in the full template — it fetches all needed data before the first mount, then uses that data when components are dynamically mounted.

---

## 10. Data Fetching

Nue provides no special data-fetching abstraction. Use standard `fetch()`.

### Pattern 1: Fetch on Mount

```html
<article :is="users">
  <table>
    <tr :each="user in users">
      <td>{ user.name }</td>
    </tr>
  </table>

  <script>
    async mounted() {
      const users = await fetch('/users').then(r => r.json())
      this.update({ users })
    }
  </script>
</article>
```

### Pattern 2: Fetch on State Change

```html
<article :is="user">
  <script>
    state.on('id', async ({ id }) => {
      if (!id) return
      const user = await fetch(`/users/${id}`).then(r => r.json())
      this.update(user)
    })
  </script>
</article>
```

### Pattern 3: Pre-fetch in Parent, Pass as Data

```html
<!-- In entry point (index.html) -->
<script>
  async onmount() {
    const all = await get('/api/admin/all') // fetch once
    state.on('id', ({ id }) => {
      this.mount(id ? 'contact-details' : 'contact-list', 'article', all)
    })
    state.init()
  }
</script>
```

### The `crud.js` Helper (full template)

The full template provides a thin `crud.js` utility at `@shared/lib/crud.js`:

```js
export async function post(route, data) { ... }
export async function get(route, params) { ... }
export async function del(route) { ... }
```

It adds:
- Authentication header (`Authorization: Bearer <sessionId>`) via localStorage
- Error throwing on non-ok responses
- Query string building for GET params

This is **not part of Nue core** — it is a template utility. It is registered via import map:

```yaml
import_map:
  crud: /@shared/lib/crud.js
```

---

## 11. The SPA Template (Minimal)

`nue create spa` generates the minimal SPA template (`packages/templates/spa`):

```
spa/
├── css/
│   ├── base.css
│   └── components.css
├── index.html          # SPA entry point
├── server/
│   ├── data/
│   │   └── users.json  # Mock user data
│   └── index.js        # Route handlers
├── site.yaml
└── ui/
    ├── entry.html      # (NOTE: not used by the live entry - see below)
    └── table.html      # Components: 'users' list and 'pretty-date'
```

**Actual files:**

`index.html` (SPA entry):
```html
<!doctype dhtml>
<script>
  import { state } from 'state'
  state.setup({ route: '/:id', autolink: true })
</script>
<body>
  <main><article/></main>
  <script>
    state.on('id', ({ id }) => {
      this.mount(id ? 'user' : 'users', 'article')
    })
    mounted() {
      state.init()
    }
  </script>
</body>
```

`ui/entry.html` (defines the `user` component):
```html
<!doctype dhtml lib>
<script>
  import { state } from 'state'
</script>
<article :is="user">
  <h1>{ name || email }</h1>
  <nav><button onclick="history.go(-1)">Back</button></nav>
  <dl>
    <dt>Registered</dt><dd><pretty-date :date="created"/></dd>
    ...
  </dl>
  <script>
    state.on('id', async ({ id }) => {
      if (!id) return
      const user = await fetch(`/users/${id}`).then(r => r.json())
      this.update(user)
    })
  </script>
</article>
```

`ui/table.html` (defines `users` list + `pretty-date`):
```html
<!doctype dhtml lib>
<article :is="users">
  <h1>Users</h1>
  <table>
    <tr :each="user in users">
      <td><a href="/{ user.id }">{ user.name }</a></td>
      <td><pretty-date :date="user.created"/></td>
    </tr>
  </table>
  <script>
    async mounted() {
      const users = await fetch('/users').then(r => r.json())
      this.update({ users })
    }
  </script>
</article>

<time :is="pretty-date">
  { formatDate(date) }
  <script>
    const opts = { year: 'numeric', month: 'short', day: 'numeric' }
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', opts)
    }
  </script>
</time>
```

`server/index.js`:
```js
get('/users', async (c) => {
  const { users } = c.env
  return c.json(await users.getAll())
})
get('/users/:id', async (c) => {
  const { users } = c.env
  const user = await users.get(c.req.param('id'))
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})
```

`site.yaml`:
```yaml
meta:
  title: Minimal SPA

server:
  dir: server
  reload: true
```

**What this demonstrates:**
- URL routing (`/:id`)
- Two views (list and detail) on the same URL
- Async data fetching via `fetch()`
- Reusable utility component (`pretty-date`)
- Server-side CRUD through mock model
- Autolink navigation and browser back button

---

## 12. The Full Template (Advanced SPA)

`nue create full` generates a hybrid MPA+SPA template (`packages/templates/full`):

```
full/
├── @shared/
│   ├── design/           # CSS design system
│   ├── lib/
│   │   └── crud.js       # HTTP utility (get, post, del)
│   ├── server/
│   │   ├── data/
│   │   │   ├── leads.json
│   │   │   └── users.json
│   │   └── index.js      # All server routes
│   └── ui/               # Global UI components
├── admin/
│   ├── app.yaml
│   ├── index.html        # Admin SPA entry
│   └── ui/
│       ├── lead.html     # Contact detail component
│       ├── leads.html    # Contact list (search, pagination, delete)
│       └── shared.html   # Shared: pretty-date, country-emoji, toast, confirm-delete
├── blog/                 # MPA content area
├── contact/              # MPA contact form
├── docs/                 # MPA documentation area
├── index.md              # Marketing home page (MPA)
├── login/
│   └── index.html        # Auth form
└── site.yaml
```

### Advanced Patterns Demonstrated

**Auth guard in entry point:**
```html
<script>
  if (!localStorage.$sid) location.href = '/login/'
</script>
```

**Full state configuration:**
```js
state.setup({
  query: ['type', 'query', 'start'],
  emit_only: ['deleted'],
  memory: ['ondelete'],
  route: '/admin/:id',
  autolink: true,
})
```

**Pre-fetch all data, then mount based on state:**
```js
async onmount() {
  const all = await get('/api/admin/all')
  state.on('id', ({ id }) => {
    this.mount(id ? 'contact-details' : 'contact-list', 'article', all)
  })
  state.init()
}
```

**Search and pagination with state:**
```js
state.on('id type query start', args => {
  const { start=0, type, query } = args
  let all = query ? leads.filter(el => el.email.includes(query)) : leads
  this.update({ items: all.slice(start, page_size + start) })
})
```

**Delete with popover confirmation dialog:**
```js
// In list item:
:onclick="state.ondelete = el.id"
// In confirm dialog:
async onclick() {
  const id = state.id || state.ondelete
  if (id) {
    await del(`/api/admin/leads/${id}`)
    if (state.id) state.id = null
    state.set({ ondelete: null, deleted: id })
  }
}
// In list — listen for deletion:
state.on('deleted', ({ deleted }) => {
  this.items = this.items.filter(el => el.id != deleted)
  this.update({ message: 'Lead deleted successfully' })
  setTimeout(() => this.update({ message: null }), 3000)
})
```

**Authentication routes (server):**
```js
post('/api/login', async (c) => {
  const { users } = c.env
  const { email, password } = await c.req.json()
  const ret = await users.login(email, password)
  return ret ? c.json(ret) : c.json({ error: 'Invalid credentials' }, 401)
})

// Middleware for protected routes:
use('/api/admin/*', async (c, next) => {
  const { users } = c.env
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '')
  if (await users.authenticate(sessionId)) await next()
  else return c.json({ error: 'Invalid session' }, 401)
})
```

---

## 13. Server Layer: Nueserver

Nueserver (`packages/nueserver`) is a minimal HTTP server that mirrors the Cloudflare Workers API.

### Design Goals

From `nueserver.md`:

> Write code locally, deploy globally when ready.

The API is intentionally similar to Hono but with differences:
- **Global methods** — no imports/exports needed. Use `get()`, `post()`, `del()`, `use()` directly.
- **No HTML responses** — server returns JSON or text only; HTML is the frontend's job.
- **No file serving** — static assets go through the build system.
- **No complex routing** — simple patterns matching Cloudflare's capabilities.
- **Linear middleware** — explicit `next()` calls, predictable flow.

### Route API

```js
get(path, handler)
post(path, handler)
del(path, handler)
use(path, middleware)   // middleware (no method check)
use(middleware)         // global middleware
```

### Context Object

```js
handler(c) {
  c.req.param('id')        // route parameter
  c.req.query('page')      // query param
  c.req.query()            // all query params as object
  c.req.json()             // parse JSON body
  c.req.text()             // parse text body
  c.req.header('key')      // request header
  c.env                    // environment (models, etc.)
  
  c.json(data)             // JSON response (200)
  c.json(data, 404)        // JSON with status code
  c.text('hello')          // text response
  c.status(201).json(data) // chained status + JSON
}
```

### Local Runtime

Nuekit's `worker.js` runs the Nueserver routes by importing the user's `server/index.js` file and calling `fetch()` from `nue-edgeserver` (the Nueserver package):

```js
const match = matches(method, url.pathname)
if (!match) return null
return await fetch(workerReq, env)
```

If no routes match, `null` is returned and Nuekit falls through to serving static files.

### Cloudflare Headers Mocked Locally

When running locally, `worker.js` injects fake Cloudflare headers:

```js
function getCFHeaders() {
  return {
    'cf-ipcountry': 'FI',
    'cf-ipcity': 'Helsinki',
    // ... many more
  }
}
```

This lets you write code that uses `c.req.header('cf-ipcountry')` and have it work identically locally and in production (where Cloudflare provides real values).

---

## 14. Mock Data and the Local Model

Nuekit's `model.js` automatically creates data models from JSON files placed in `server/data/` (or whatever directory is specified in `server.dir`):

```js
export async function createEnv(dir) {
  const files = await readdir(dir)
  const env = {}
  for (const file of files) {
    if (file.endsWith('.json')) {
      const type = file.replace('.json', '')
      const items = JSON.parse(await readFile(path, 'utf8'))
      const model = type == 'users' ? createUserModel(items) : createModel(items)
      env[type] = model
    }
  }
  return env
}
```

### Standard Model Methods

Every JSON-backed model gets these methods:

```js
model.getAll()       // returns all items
model.get(id)        // returns item + { update(data), remove() } methods
model.create(obj)    // adds item with auto-generated id and created timestamp
model.size()         // returns item count
```

### Users Model (Special)

When a JSON file is named `users.json`, it gets a specialized model with session management:

```js
users.login(email, password)       // validates credentials, returns { sessionId, user }
users.authenticate(sessionId)      // validates session
users.logout(sessionId)            // removes session
```

Sessions are persisted to `.nue/sessions.json` for persistence across server restarts.

**Security note:** Passwords in the mock model are compared in **plaintext** — this is explicitly a local dev-only mock. The comment in `model.js` says: `// mock: plaintext passwords. production uses hashed`.

### `created` Timestamp Injection

The model automatically adds a `created` timestamp to all items:

```js
items.forEach((el, i) => {
  el.created = NOW - DAY * i   // staggered creation dates
  el.id = i + 1
})
```

This means your mock JSON doesn't need `id` or `created` fields — the model generates them. However, the JSON data is modified in-memory, not on disk, so restarting the server resets to original JSON data.

---

## 15. Custom Server Proxy

For developers who want to use their own backend technology or existing infrastructure, Nue supports a proxy configuration:

```yaml
# site.yaml
server:
  url: http://localhost:5000
  routes: [/api/, /admin/]
```

**How it works (`proxy.js`):**

```js
export function createProxy(opts) {
  return async function(req) {
    const url = new URL(req.url)
    const match = opts.routes?.some(path => url.pathname.startsWith(path))
    if (!match) return null
    
    const fullUrl = `${target.protocol}//${target.host}${url.pathname}${url.search}`
    return await fetch(fullUrl, { headers, method, body })
  }
}
```

- Only configured route prefixes are proxied.
- Everything else is served by Nue normally.
- Works with any backend: Express, FastAPI, Rails, Go, etc.
- Provides an immediate production deployment path (deploy your own backend + Nue frontend).

---

## 16. HMR and Development Workflow

### SPA-Specific HMR

When a DHTML component file changes, the HMR system (`hmr.js`) handles it differently from regular HTML:

```js
async function reloadHTML(asset) {
  const { ast } = asset
  return ast.is_dhtml ? await reloadComponents(asset)
    : ast.is_lib ? location.reload()
    : await reloadContent(asset)
}

async function reloadComponents(asset) {
  const { mountAll } = await import('./mount.js')
  const state = saveState()
  await mountAll(asset.path)
  restoreState(state)
}
```

When an SPA component file changes:
1. Form data is saved (inputs preserve their values).
2. Popovers that were open are tracked.
3. Dialogs that were open are tracked.
4. Components are re-mounted.
5. Form data, popovers, and dialogs are restored.

This means **you can edit SPA components without losing application state** — a major developer experience improvement.

### Server-side Hot Reload

With `server.reload: true` in `site.yaml`, the Nueserver routes are reloaded on file changes:

```js
export async function createWorker(opts = {}) {
  const { dir='@shared/server', reload } = opts
  ...
  return async function(req) {
    if (reload) await importWorker({ dir, reload }) // re-import on each request
    ...
  }
}
```

Each request during development re-imports the server file with a cache-busting query param. This means you can edit route handlers and the changes take effect immediately without restarting.

### Development Startup

```bash
nue           # start at default port 4000
nue dev       # same as above, explicit
nue --port 3000  # custom port
```

The dev server starts instantly (no build step). SPA files are processed on first request.

---

## 17. Build System and SPA Production

### Development Serving

During development, Nue processes and serves files directly. When a DHTML `index.html` is served:

1. The HTML is parsed (`parseNue()`).
2. Server-side HTML placeholder is generated (just a `<div nue="...">` or `<element nue="...">` stub).
3. All DHTML library files are compiled to JS (`compileNue()`).
4. The page HTML is assembled with `<script type="module">` tags for each compiled DHTML file.
5. The state import map is injected.

### Build Output

```bash
nue build
```

Production builds compile everything to `.dist/`. For SPA files:
- DHTML entry `index.html` → generates HTML + compiled JS bundles
- CSS is minified and optionally inlined
- TypeScript is compiled to JS

**Current limitation noted in the beta notice from the 2.0 blog post:**

> This is a beta release. Tested on macOS only. Linux and Windows compatibility unknown.

No specific information was found on whether production build for SPAs is fully working end-to-end (deployment to Cloudflare is not yet supported).

---

## 18. MPA+SPA Hybrid Architecture

One of Nue's key differentiators is seamless integration of Multi-Page Applications (MPAs) and Single-Page Applications in the same project with a unified design system.

### The Full Template Demonstrates

- `index.md` — static Markdown home page (MPA)
- `blog/` — Markdown blog (MPA)
- `docs/` — Documentation site (MPA)
- `contact/` — HTML contact form (MPA)
- `login/` — Auth form (MPA-ish, DHTML)
- `admin/` — SPA admin dashboard (SPA)

All areas share:
- `@shared/design/` — one CSS design system
- `@shared/server/` — one set of server routes
- `site.yaml` — one configuration

### View Transitions

For the MPA areas, Nue supports CSS View Transitions for page-to-page navigation:

```yaml
site:
  view_transitions: true
```

This provides a SPA-like feel for MPA navigation without JavaScript routing overhead.

### Routing Boundary

SPAs and MPAs coexist by file location:
- `admin/index.html` with `<!doctype dhtml>` handles all `/admin/*` routes as SPA.
- All other routes are served as individual MPA pages.
- The server-side catch-all in `serve.js` handles SPA routes: requests to `/admin/anything` return the `admin/index.html` SPA shell.

---

## 19. Client-side Components

*TODO: Expand on my (Tor's) initial text below.*

Nue also supports mounting client-side components on static pages. In other words, the majority of the page might be static HTML, optionally built from a markdown file, and then one or more sections within the page are mounted and rendered on the client. As a good example of this, see the Nue website itself. Its home page has a "Console" HTML Component referenced like this:

```markdown
[console]
Nue is small and fast
```

The Console component is its own HTML-file with the following declaration:

```HTML
<!dhtml lib>
```

When building the site, instead of the component being added to the static HTML, a console.html.js file is rendered. This .js file is then mounted on the client and the DOM is updated with the contents. Also see the "join-list" client-side component there.

This whole concept is a great feature, and we must make sure it's well documented along with the full SPA feature set (the SPA term is misleading, sounds like a "big" thing).

---

## 20. What Is Not Yet Supported

Based on documentation, source code inspection, and the roadmap, the following is **confirmed not yet supported**:

### 1. Production Deployment

**What's missing:** No `nue push` command, no Cloudflare Workers deployment pipeline.

**Documentation says:** Both `spa-development.md` and `nueserver.md` explicitly state "local development only."

**Workaround:** Use the custom server proxy (`server.url`) to point at your own deployed backend and deploy Nue's static HTML/CSS/JS to any static host separately.

### 2. Real Universal Data Model

**What's missing:** The `c.env.users`, `c.env.payments`, `c.env.analytics` etc. mentioned in `universal-data-model.md` are **only mock implementations** currently. The local JSON-backed model in `model.js` is the only implementation.

**Documentation says:** `universal-data-model.md` opens with: "This currently works as a local mockup for prototyping. Production deployments with CloudFlare integration come later."

**What works locally:** `c.env.users.getAll()`, `.get(id)`, `.create()`, `.login()`, `.authenticate()`, `.logout()` — basic CRUD and sessions.

**What doesn't exist yet:** Payments, subscriptions, analytics/events, email campaigns, customer relationships.

### 3. Multi-Site Development

**What's missing:** No `nue dev --all` or multi-site configuration (as described in `roadmap.md`).

### 4. `nue push` / Deployment Commands

**What's missing:** The `nue push` command described in the roadmap doesn't exist yet.

### 5. Design System Templates

**What's missing:** The `nue create mvp --design mies` / `nue create startup --design rams` style template commands described in the roadmap are not yet available. Only `minimal`, `blog`, `spa`, `full` exist.

### 6. Browser Tests for Autolink/Back Button

The browser-environment tests for `autolink` click flow and back-button navigation (`browser.test.js`) are marked `test.skip`. The code is present and works in practice (the templates use it), but the automated test coverage for these specific flows is incomplete.

### 7. State `state.off()` Is Undocumented

`state.off()` exists in `state.js` but is not mentioned in the documentation. It removes a listener matched by property names and function body.

### 8. No `state.set()` Documentation

The `state.set()` batch update method is used in the full template but not documented. The documented API suggests using direct property assignment (`state.id = '123'`) or `state.emit()` for emit-only events.

### 9. Windows/Linux Compatibility Unknown

From the 2.0 beta blog post: "Tested on macOS only." This may have improved since, but no explicit confirmation.

### 10. No SSR Hydration for SPAs

Nue's DHTML pages do **not** server-side render their dynamic content. The server returns a stub element (e.g., `<article nue="users">`) and the client-side runtime renders the actual component. There is no hydration step because there is nothing to hydrate from — the initial HTML is a skeleton.

This is a deliberate design choice (no extra complexity), but it means:
- SPA pages have no SEO-visible content (just a shell).
- First meaningful paint depends on JavaScript loading.
- No progressive enhancement for SPA components.

(MPA pages use full SSR with no client-side rendering needed.)

---

## 21. SPA vs. MPA: Nue's Philosophical Stance

From the "Rethinking Reactivity" blog post (written in 2023):

> **Multipage applications (MPA)** are on the rise. With the emergence of server components and tools like Astro and Nue, people will eventually realize that the SPA (single page application) model is not ideal for "normal", content-heavy websites.

Nue's position is that SPAs are appropriate for **application-like interfaces** (dashboards, admin panels, CRMs) but that content-heavy sites should be MPAs. The hybrid model (MPA for content, SPA for apps) is the recommended pattern.

From "Perfect Web Framework":

> All areas of your website should offer a consistently great user experience. This includes your content-heavy areas like the documentation and blog, the customer-facing app, and your internal admin dashboard.

The vision is that the **same design system** should work across both MPA and SPA sections, with seamless "turbo linking" between them.

**Important note on Tero's evolution (from Slack history):** As of early 2026, Tero stepped away from Nue, noting that the React/Tailwind ecosystem had consolidated and that AI had changed tool-adoption patterns. This context is important for any documentation that might reference the project's future direction. The core architecture and working features described in this document are based on what exists in the codebase as of the research date.

---

## 22. Roadmap: Future SPA Features

From `roadmap.md` and `universal-data-model.md`:

### Multi-Site Development
Build multiple websites from one shared system with a single `@shared/` design system, separate site directories, and `nue dev --all` to serve them all.

### Deployments
`nue push --all` — deploy to nuejs.com subdomains for free, with custom domains starting at $2/month.

### Analytics Application
A production analytics platform to stress-test the full-stack foundation with multi-site tracking, event sourcing, and real-time aggregation.

### Universal Data Model
Real implementations (beyond mock JSON) for:
- Users/authentication (Cloudflare Workers KV)
- Payments/subscriptions
- Analytics/events
- Email campaigns
- Customer relationships (CRM)
- Full CRUD CRUD operations

### SPA Templates Library
Pre-built templates for:
- Analytics dashboards
- CRM (customer relationship management)
- Mailing list administration
- Payment processing

Each template would use the universal data model and demonstrate the full SPA pattern.

### Design System Templates
Branded templates with different aesthetic systems (referenced as "Mies", "Rams", "Muriel" in the roadmap).

---

## 23. Source Inventory

### Primary Documentation Sources

| File | Content Summary |
|---|---|
| `packages/www/docs/spa-development.md` | SPA overview, architecture, entry point, routing, data fetching, custom server |
| `packages/www/docs/single-page-apps.md` | More detailed SPA guide; UI libraries, dynamic mounting, development workflow |
| `packages/www/docs/state-api.md` | Complete Nuestate API reference |
| `packages/www/docs/nuestate.md` | Nuestate overview: URL-first philosophy, installation |
| `packages/www/docs/universal-data-model.md` | Universal data model (future roadmap item) |
| `packages/www/docs/nuedom.md` | Nuedom: UI assembly, architectural constraints, in-browser compilation |
| `packages/www/docs/html-syntax.md` | Full HTML template syntax reference |
| `packages/www/docs/interactive-components.md` | Interactive component overview (non-SPA context) |
| `packages/www/docs/server-api.md` | Nueserver route/context API reference |
| `packages/www/docs/nueserver.md` | Nueserver overview: edge-first philosophy |
| `packages/www/docs/roadmap.md` | Future features: multi-site, deployments, templates, analytics |
| `packages/www/docs/conventions-reference.md` | File types, doctype system, project structure conventions |
| `packages/www/docs/build-system.md` | Build system, HMR, production builds |
| `packages/www/docs/project-structure.md` | Directory structure, routing, @shared convention |
| `packages/www/docs/configuration.md` | Site.yaml, app.yaml, server config |

### Blog Sources

| File | Content Summary |
|---|---|
| `packages/www/blog/rethinking-reactivity/index.md` | Nue's reactivity model, HTML-first philosophy, comparison to React/Svelte/Vue |
| `packages/www/blog/perfect-web-framework/index.md` | Vision for MPA+SPA hybrid, design systems, Nue's goals |
| `packages/www/blog/large-scale-apps/index.md` | Full app lighter than a React button, Rust/WASM scale demo |
| `packages/www/blog/standards-first-react-alternative/index.md` | Hyper (early Nuedom), design system decoupling, standards-first philosophy |
| `packages/www/blog/2.0/index.md` | Nue 2.0 release notes: SPA development model, Nuestate, Nueserver, templates |

### Template Sources

| Directory | Content Summary |
|---|---|
| `packages/templates/spa/` | Minimal SPA: user list/detail, mock data, server routes |
| `packages/templates/full/admin/` | Advanced admin SPA: search, pagination, auth, delete confirmation |
| `packages/templates/full/login/` | Login form with session creation |
| `packages/templates/full/@shared/lib/crud.js` | HTTP utility with auth header |
| `packages/templates/full/@shared/server/` | Full server routes (login, CRUD, auth middleware) |

### Source Code

| File | What It Tells Us |
|---|---|
| `packages/nuestate/src/state.js` | Complete state management implementation |
| `packages/nuestate/test/state.test.js` | What's tested/confirmed working |
| `packages/nuestate/test/browser.test.js` | Two tests skipped (autolink, back-button) |
| `packages/nuedom/src/nue.js` | Entry point: `mount()` |
| `packages/nuedom/src/dom/node.js` | Component lifecycle, `this.mount()`, rendering logic, constraints |
| `packages/nuedom/src/nue-jit.js` | In-browser JIT compilation |
| `packages/nuedom/src/compiler/document.js` | `parseNue()` |
| `packages/nuekit/src/asset.js` | `isSPAEntry()` detection, `renderDHTML()` |
| `packages/nuekit/src/render/page.js` | `renderDHTML()` — how SPA pages are assembled |
| `packages/nuekit/src/deps.js` | `listDependencies()` — SPA asset inclusion logic |
| `packages/nuekit/src/server/worker.js` | Local server worker: route execution, CF header mocking |
| `packages/nuekit/src/server/model.js` | Mock data model: CRUD + sessions |
| `packages/nuekit/src/server/proxy.js` | Custom server proxy |
| `packages/nuekit/client/mount.js` | `mountAll()`: client-side component instantiation |
| `packages/nuekit/client/hmr.js` | HMR: DHTML component hot reload with state preservation |
| `packages/nuekit/src/cmd/serve.js` | Dev server: SPA catch-all routing |
| `packages/nuekit/src/cmd/create.js` | `nue create spa/full/etc.` |
| `packages/nueserver/nueserver.js` | Complete Nueserver implementation |

---

## Appendix: Technical Gotchas and Undocumented Behaviors

1. **`state.off()` exists but is not documented.** Removes listener by name+function match.

2. **`state.set()` is used in templates but not documented.** Provides atomic batch updates.

3. **`$state` key in localStorage** — all Nue apps on the same origin share this key. Multiple SPAs on the same domain could have property name conflicts in localStorage.

4. **Type coercion in URL state** — Nuestate silently converts `'123'` → `123`, `'true'` → `true`, `'false'` → `false`. Objects in URL params become `'[object Object]'`.

5. **No `unmount` lifecycle hook** — When `this.mount()` replaces a component, no cleanup hook fires on the old component.

6. **The `entry.html` naming** — In the spa template, `ui/entry.html` is not "the entry" — that's `index.html`. `entry.html` is just a library component file defining the `user` component. (Confusing naming.)

7. **Component `is_custom` fix at runtime** — In `node.js`, there's a known issue comment: `// convert to <div> (TODO: do this at compile time)`. Components with custom root elements (`<article :is="users">`) have `is_custom` set at parse time and must be fixed at runtime.

8. **`state.init()` must be called from `mounted()`** — If called from `onmount()`, `this.root` may not exist yet, and some dependent state listeners may not be attached. Always call from `mounted()`.

9. **Server reload on every request** — With `server.reload: true`, the server re-imports `index.js` on **every request** (not just when files change). This is correct for development but adds overhead. The timestamp-based cache busting (`?t=Date.now()`) ensures fresh imports.

10. **DHTML doesn't SSR** — The `renderDHTML()` function generates a shell stub, not rendered component content. There is no hydration. This is by design but means SPA pages have no crawlable content.

11. **`state` import map is automatically injected** — You never need to configure `import_map.state`. Nuekit always adds `state: '/@nue/state.js'` to any DHTML page's import map in `renderDHTML()`.

12. **`this.root` vs `this.querySelector()`** — In a body-scoped SPA entry, `this.root` is the `<body>` element. `this.querySelector('article')` queries within the body. Both patterns appear in the documentation and templates.
