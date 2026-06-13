# Nue Server Architecture & Future Roadmap Notes
*Session notes — May 2026*

---

## Current Server Landscape

Nue has **one HTTP server** (`packages/nuekit/src/tools/server.js`) built on `Bun.serve()`. All traffic flows through a single priority chain:

1. **API requests** → user server (worker or proxy), short-circuits on match
2. **WebSocket upgrade** → HMR connection (`server.upgrade(req)`)
3. **Static file serving** → rendered/streamed files via callback

### The Three "Server" Concepts

| Name | Location | Type | Purpose |
|---|---|---|---|
| Dev/preview server | `nuekit/src/tools/server.js` | Bun.serve() wrapper | Static files + HMR WebSocket |
| User server | `nuekit/src/server/` | Edge worker runtime | Runs your API routes locally |
| Nueserver | `packages/nueserver/` | Edge-first HTTP server | The route framework (`get`, `post`, `use`) |

### User Server Detail
- **Worker mode**: imports `@shared/server/index.js`, runs routes via `nue-edgeserver`, injects fake CF headers
- **Proxy mode**: forwards matching routes to a real remote server (`server.url` in `site.yaml`)
- Local mock data from JSON files in `server/data/` → available as `c.env.users`, `c.env.leads`, etc.
- `c.env` is the key abstraction seam — local uses JSON mock, production would use real storage behind the same interface

### Nueserver Design
- Global route methods: `get()`, `post()`, `del()`, `use()` — no imports needed
- Web Standards only: `Request`, `Response`, `fetch`, `URL` — no Node APIs
- Already exports `export default { fetch }` — the exact CF Workers entry point convention
- Explicitly no: HTML responses, file serving, complex routing, regex patterns

---

## What Is Missing for Production

### Minimal path to production (no SSR, no universal model):

1. **Worker bundle step** — bundle user's `server/index.js` + `nueserver.js` into a CF Workers-compatible file (Bun already handles bundling)
2. **Real data persistence** — swap the JSON mock behind `c.env` with CF KV/D1 bindings (same API surface, different implementation)
3. **Static asset hosting** — deploy `.dist/` to CF Pages or any CDN
4. **`nue push` command** — wires 1–3 together from CLI

The server *code* is already production-ready. The disclaimer is about infrastructure plumbing, not server logic.

---

## Proposed Architecture Extensions

### 1. SSR Templating
**Status**: Not yet in Nue. A significant gap for "Rapid Web Development" use cases (cf. ASP.NET Core + Razor).

**Key insight**: `nuedom` already has `renderNue(ast, data)` — the SSR engine exists. SSG uses it at build time. SSR would use it at **request time**.

**Conceptual design**:
- New doctype: `<!doctype shtml>` signals "render at request time, not build time"
- Route handler fetches data, calls `c.render('template-name', data)`, returns full HTML
- No client JS required for the page itself
- Same template syntax as SSG and DHTML — one language for all three modes
- Fits between SSG and CSR on the spectrum: SSG → **SSR** → CSR (DHTML/SPA)

**Example**:
```js
get('/profile/:id', async (c) => {
  const user = await c.env.users.get(c.req.param('id'))
  return c.render('profile', { user })
})
```

**Open question**: Where does `c.render('profile')` resolve templates from? Needs integration with Nuekit's asset/dependency system.

**Alignment**:
- Nue vision: same template syntax, clean separation (data layer → template → output)
- RWD vision: identical mental model to Razor — handler prepares model, template renders it
- Progressive: page can start as SSG, be promoted to SSR for personalization, optionally add DHTML islands

### 2. Platform Adapter Mechanism
**Status**: Not yet in Nue. Currently CF-only in intent.

**Update (May 2026):** The accepted feature name is **Platform Adapter**. Core implementation should use target-neutral terminology (`platform`, runtime requirements, manifests, environment resources) and keep all target-specific vocabulary inside adapter implementations. The first implementation milestone is the core Platform Adapter foundation; the second is a Cloudflare Pages adapter using Pages Advanced Mode only. See [Platform Adapters](./platform-adapters/platform-adapters.md) for the active design notes.

**Key insight**: The server is *already* platform-agnostic. CF coupling exists only in:
- Dev-time CF header mocks in `worker.js` (not a production concern)
- Future CF KV/D1 data bindings (not yet built)

**Proposed adapter model** (like SvelteKit):
```
adapter-cloudflare   →  CF Workers + KV/D1
adapter-bun          →  Bun.serve() (already exists!)
adapter-node         →  node:http wrapper
adapter-deno         →  Deno.serve()
adapter-vercel       →  Vercel Edge
```

Each adapter handles:
- Deploy plumbing (how to package and push)
- Data bindings (how to wire `c.env` to platform storage)

User route code is **identical** across all adapters.

**Critical design constraint**: `c.env` must remain a pure interface. Adapters implement it. The model layer must not import platform-specific packages directly.

### 3. Data Model Architecture
**Proposed separation**:

| Layer | What it contains | Where it lives |
|---|---|---|
| Nue core | `c.env` interface contract + local JSON mock | `nuekit/src/server/model.js` |
| Adapter packages | Deploy + storage bindings per platform | `adapter-cloudflare`, etc. |
| Model templates | Domain model implementations (users, payments, etc.) | Separate packages or project templates |

**Rationale**: The "universal data model" (users, payments, analytics, email, CRM) is a *product category*, not infrastructure. Different projects need different subsets. Keeping it out of core:
- Avoids bloat
- Avoids forcing opinions
- Allows community-extensible implementations
- Keeps core independently versioned

**Template-based model selection**:
```sh
nue create spa --model sqlite
nue create spa --model cloudflare
nue create spa --model postgres
```

The local JSON mock is effectively the "dev" model template already — just not packaged that way yet.

---

## Rendering Mode Spectrum

```
SSG (build time)        →  renderNue() at build, output to .dist/
SSR (request time)      →  renderNue() per request, return HTML Response  ← MISSING
CSR/SPA (client time)   →  compileNue() to JS, mount() in browser
Isomorphic              →  <!doctype html+dhtml>, renders on both sides
```

All four modes would use the **same template syntax** and the **same rendering engine** (nuedom). Only the *when* and *where* differs.

---

## HMR WebSocket Architecture (for reference)

The WebSocket is a **developer-only push channel** — not part of production:

1. Page loads → `hmr.js` runs → `new WebSocket(...)` → server upgrades connection
2. Browser sends its `pathname` once on open → server tracks it in `sessions` Map
3. Developer edits file → `fswatch` fires → `site.update()` → `asset.render({ hmr: true })`
4. `broadcastTo(asset, pathname)` (content pages) or `broadcast(asset)` (everything else)
5. Browser receives push → decides: CSS swap / DOM diff / full reload / error overlay

Key: rendered content travels **in the WebSocket message** — browser doesn't make a second HTTP request for content updates.

---

## Open Questions / Next Steps

- [ ] SSR: How does `c.render()` resolve template paths? Integrate with Nuekit's asset system?
- [ ] SSR: Should SSR pages be able to include DHTML islands (progressive enhancement)?
- [ ] SSR: HMR for SSR pages — re-render on file change, push new HTML over WebSocket?
- [ ] Adapters: Define the formal `c.env` interface contract (TypeScript types or JSDoc?)
- [ ] Model templates: What is the minimum viable model interface all implementations must satisfy?
- [ ] Production: Worker bundling — use Bun.build()? Needs edge-compatibility check (no Node APIs)
- [ ] Production: Session storage in production — cookie-based or Authorization header? (current mock uses localStorage `$sid`)
