# Platform Adapters

*Preliminary implementation notes — May 2026*

## Purpose

Platform Adapters let Nue prepare build output for a target platform without making Nue core depend on that platform. Core code uses deployment-neutral language. Target-specific concepts, files, bindings, and deployment rules belong inside adapter implementations.

## Terminology

| Term | Meaning |
|---|---|
| Platform Adapter | A target-specific implementation of Nue's build/runtime extension points |
| Platform | The site-level config value selecting an adapter |
| Runtime artifact | Optional target output used when static files alone are not enough |
| Runtime requirement | A target-neutral reason a runtime artifact may be needed |
| Fallback manifest | Target-neutral data describing non-file routes such as SPA shell fallback |
| Environment resources | Adapter-provided objects exposed to server routes through `c.env` |

Core terms should stay generic. Names such as Cloudflare Pages, `_worker.js`, `env.ASSETS`, D1, KV, Wrangler, or compatibility date belong in a Cloudflare adapter, not in core adapter code.

## Configuration

The selected adapter is configured with `platform` in `site.yaml`:

```yaml
platform: cloudflare-pages
```

Future options can use an object form:

```yaml
platform:
  name: cloudflare-pages
  runtime: auto
```

The default runtime policy is `auto`: generate runtime artifacts only when detected project features require them.

## Static-first Behavior

Regular MPA sites are already build-time static output and should not require a runtime artifact. Ordinary file-backed DHTML pages also remain static output plus compiled client JavaScript.

Runtime artifacts are considered only when the build detects features such as:

- Nueserver route handling
- local server proxy behavior
- SPA fallback routes

This keeps the common static site path simple and fast.

## Build Lifecycle

The current static build remains the foundation. Platform Adapters run after the normal build and receive a target-neutral build context containing:

- site config
- root and dist paths
- assets and build subset
- runtime requirement flags
- fallback manifests

Adapters decide how to map that context to their target platform.

## Development Server

The existing Bun development server is not part of the initial Platform Adapter implementation. It acts as Nue's built-in local development runtime for now. The adapter contract should leave room for future development hooks, but Milestone 1 intentionally avoids forcing HMR, file watching, local mocks, and live rendering into the production adapter shape.

## Universal Model

`c.env` remains the future seam for adapter-provided resources and the universal model. Milestone 1 defines the platform boundary only. Production implementations for users, sessions, D1, KV, or other storage belong in later adapter work.

## Initial Milestones

1. Core Platform Adapter foundation: config, registry, build context, runtime detection, fallback manifests, internal docs, and tests.
2. Cloudflare Pages Platform Adapter: Advanced Mode only, generated runtime artifacts when needed, static asset fallback, Nueserver dispatch, SPA fallback, root `404.html` handling, Wrangler deployment validation, and user-facing docs draft.
3. Cloudflare Pages Git integration deployment: validated dashboard-created Git integration, first deploy, automatic redeploy after commit/push, and secondary branch Preview deployment.
4. Platform resources: design and implement the first platform-neutral resource layer for values exposed to Nueserver routes through `c.env`.
5. Final documentation: finish the Cloudflare Pages adapter docs and move them from `docs-internal/` to the public docs site.

## Cloudflare Pages Adapter

The first concrete adapter targets Cloudflare Pages Advanced Mode. It generates `_worker.js` only when the target-neutral runtime context requires a runtime artifact. Static-only MPA builds do not emit a worker in `auto` mode.

The generated worker owns Cloudflare-specific request orchestration:

1. Dispatch bundled Nueserver routes when a route matches.
2. Proxy configured backend routes when `server.url` is used.
3. Fall through to `env.ASSETS.fetch(request)` for static files.
4. Apply SPA shell fallback for extensionless `GET` and `HEAD` 404s using the core fallback manifest.
5. Return the static asset 404 otherwise.

The adapter ensures a root `404.html` exists in Cloudflare Pages output. Without that file, Pages assumes implicit SPA behavior and may return the root page for unknown paths before the generated worker can distinguish missing files from app routes.

The adapter currently passes the platform environment directly to Nueserver as `c.env`. Production universal-model resources such as users, sessions, D1, KV, R2, Durable Objects, Queues, and Analytics Engine remain future adapter work.

### Validation Status

The adapter has been validated with automated tests and manual builds:

- Static MPA builds do not emit `_worker.js` in `auto` mode.
- SPA and server-route builds emit a Pages Advanced Mode worker.
- Generated workers are imported by tests and exercised with mocked `env.ASSETS`.
- API routes dispatch before static assets.
- Static assets fall through to `env.ASSETS.fetch(request)`.
- SPA fallback handles extensionless 404s and prefers nested app fallbacks before root fallback.
- File-like 404s, such as `/missing.txt`, do not fall back to an SPA shell.
- Wrangler deployment validated a static `blog` template on Cloudflare Pages.
- Wrangler deployment validated a minimal runtime project on Cloudflare Pages at `https://runtime-check.cf-pages-demo-nue.pages.dev/api/ping`, returning `{ "ok": true }` from a bundled `@shared/server` route.
- Cloudflare Pages treats projects without a root `404.html` as implicit SPAs; the adapter emits one when missing so `env.ASSETS.fetch(request)` can return static 404s and the worker can apply Nue's explicit SPA fallback only to extensionless routes.
- Cloudflare Pages Git integration validated a private GitHub demo consuming `@tormnator/nuekit@dev` with `bun run build` and `nue-tor build`.
- The Git-integrated demo validated production deployment from `main`, automatic redeploy after a pushed commit, and Preview deployment from `dev` at `https://7ff529b1.nue-cf-pages-git-integration.pages.dev/`.
- The Preview deployment validated `/api/ping` server routing, `/dashboard` extensionless SPA fallback, and `/missing.txt` static 404 behavior.

Manual build inspection has covered a pure MPA site, the `spa` template, and the `full` template. The `full` template output includes static MPA pages, login DHTML output, admin SPA output, and bundled server routes.

### Current Limitations

- Production model resources are not implemented. Routes that depend on `c.env.users`, `c.env.leads`, or similar resources need a future adapter resource layer.
- Native `nue push` deployment is not implemented.
- Cloudflare `/functions` folder output is intentionally unsupported. This adapter targets Pages Advanced Mode only.