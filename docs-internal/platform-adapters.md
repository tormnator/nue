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
2. Cloudflare Pages Platform Adapter: Advanced Mode only, generated runtime artifacts when needed, static asset fallback, Nueserver dispatch, SPA fallback, and GitHub-based deployment validation.

## Cloudflare Pages Adapter

The first concrete adapter targets Cloudflare Pages Advanced Mode. It generates `_worker.js` only when the target-neutral runtime context requires a runtime artifact. Static-only MPA builds do not emit a worker in `auto` mode.

The generated worker owns Cloudflare-specific request orchestration:

1. Dispatch bundled Nueserver routes when a route matches.
2. Proxy configured backend routes when `server.url` is used.
3. Fall through to `env.ASSETS.fetch(request)` for static files.
4. Apply SPA shell fallback for extensionless `GET` and `HEAD` 404s using the core fallback manifest.
5. Return the static asset 404 otherwise.

The adapter currently passes the platform environment directly to Nueserver as `c.env`. Production universal-model resources such as users, sessions, D1, KV, R2, Durable Objects, Queues, and Analytics Engine remain future adapter work.