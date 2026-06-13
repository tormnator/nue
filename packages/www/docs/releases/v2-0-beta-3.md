# Nue 2.0 Beta 3

Status: Released
CRI: `v2-0-beta-3`
Release date: 2026-06-13
Primary npm package line: `@tormnator/nuekit@2.0.0-beta.3-tor.2`
Source commit: `6d387ab5` (`main` release merge and npm publish source)

## Summary

Nue 2.0 Beta 3 is the first coordinated release of the `tormnator/nue` fork as a public `@tormnator` npm package set. It is intended for developers with projects based on upstream Nue 2.0 Beta 2 who want to evaluate the fork's current Beta 3 line.

The release focuses on making Nue usable in production-like fork validation projects: a Cloudflare Pages platform adapter, target-neutral resource access through `c.env`, Cloudflare D1-backed collection resources, deterministic starter-template ZIPs, and a set of Nuekit and Nuemark fixes that were discovered during real project work.

## Install Or Upgrade

For the primary Nuekit package:

```bash
bun add nuekit@npm:@tormnator/nuekit@2.0.0-beta.3-tor.2
```

For production-like installs, pin exact package versions instead of depending on moving npm dist-tags. Fast validation projects may use `@dev` intentionally when tracking the current validation package line.

Starter templates now default to the fork's official `main` branch. You can also choose a specific source:

```bash
nue create spa
nue create spa https://github.com/tormnator/nue/raw/dev/packages/templates
nue create spa ./packages/templates
```

Cloudflare Pages Git integration projects should use:

```text
Framework preset: None
Build command: bun run build
Build output directory: .dist
```

On developer machines with Bun's minimum release age safety setting enabled, freshly published validation packages may need `bun install --minimum-release-age=0`. Cloudflare Pages build environments are unaffected.

## Package Versions

| Package | Version | npm dist-tag | Notes |
|---|---|---|---|
| `@tormnator/nuekit` | `2.0.0-beta.3-tor.2` | `latest` | Official Beta 3 Nuekit package line. |
| `@tormnator/nue-edgeserver` | `0.1.0-tor.2` | `latest` | Package-page README correction for the Beta 3 `c.env.models` route API. |
| `@tormnator/nuemark` | `0.7.1-tor.1` | `latest` | Contains the Beta 3 Nuemark rendering fixes from the first scoped publish. |
| `@tormnator/nuedom` | `0.1.1-tor.1` | `latest` | First `@tormnator` scoped package line. |
| `@tormnator/nuestate` | `0.1.1-tor.1` | `latest` | First `@tormnator` scoped package line. |
| `@tormnator/nueyaml` | `0.1.0-tor.1` | `latest` | First `@tormnator` scoped package line. |
| `@tormnator/nue-glow` | `0.2.5-tor.1` | `latest` | First `@tormnator` scoped package line. |

The first scoped package publish happened on 2026-05-23. The final official Beta 3 package set keeps unchanged packages on those already published versions and publishes the packages that changed after that point with incremented `tor.N` versions.

## Highlights

- Cloudflare Pages platform adapter for Pages Advanced Mode, emitting `_worker.js` only when server routes, proxy behavior, or SPA fallbacks require runtime handling.
- Target-neutral platform resource layer exposed through `c.env`, including `config`, `models`, `platform`, and `runtime` namespaces.
- Cloudflare D1-backed collection resources for declared `kind: collection` models.
- Lightweight collection resource boundary shared by local JSON-backed resources and D1-backed resources.
- Full-template login sessions moved out of Nue core into template-local route code.
- Asset precedence fixes across HTML layout discovery, CSS, JS, YAML, JSON, and shared assets.
- HMR updates scoped to browser sessions on the affected page.
- Nuemark fixes for `[image]` alt/figcaption rendering and multi-line HTML comment parsing.
- `nue build --clean` now tolerates a missing `.dist` directory on fresh checkouts.
- Deterministic starter-template ZIP generation and configurable `nue create` template sources.

## Added

- Platform adapter foundation in Nuekit, including adapter registry, platform context, runtime requirement detection, and post-build hooks.
- Cloudflare Pages adapter under Nuekit's platform layer.
- Worker generation for server routes, proxy passthrough, static asset passthrough, extensionless SPA fallback, and static 404 behavior.
- `createResourceEnv` and `createConfigResource` helpers for target-neutral server route resources.
- Local JSON and Cloudflare D1 collection model resources under `c.env.models`.
- `createCollectionResource(provider)` as a shared route-facing collection wrapper.
- Template ZIP workflow via `bun run templates:zip`.
- `nue create` support for default fork templates, explicit remote template bases, and local template checkout sources.

## Changed

- Server route model access now uses `c.env.models.<name>` instead of top-level `c.env.<name>` model properties.
- Models must be declared in `site.yaml` under `resources.models`.
- Cloudflare Pages projects declare D1-backed model mappings under `platform.resources.models`.
- The full template owns demo login, logout, authenticate, and session behavior in template-local server route code.
- `nue create` defaults to templates from `https://github.com/tormnator/nue/raw/main/packages/templates`.
- Wrangler configuration files are skipped during Nuekit builds.
- Cloudflare Pages support targets Advanced Mode only; `functions/` output is not supported by this adapter.

## Fixed

- HTML layout module precedence is now page-relative, so more specific directories beat broader ones and parent directories beat their own `ui/` subfolders.
- CSS and JS dependencies load in explicit broad-to-specific order.
- Shared YAML data acts as a broad base layer, with root, app, and page YAML overriding in increasing specificity.
- Nested `app.yaml` files cascade from broader scope to deeper scope.
- JSON files participate in page dependency discovery and broad-to-specific data merging.
- Root `index.html` pages no longer discover unrelated nested SPA UI/layout assets.
- Root `index.html` pages include `home/` assets consistently with root `index.md` pages.
- HMR content navigation and CSS reloads are scoped to matching browser sessions.
- Nuemark `[image]` tags no longer duplicate captions into `alt` or render `alt` values as visible figcaptions.
- Nuemark multi-line HTML comments no longer corrupt indentation tracking in block parsing.
- `nue build --clean` no longer fails when `.dist` is absent.
- The `<menu>` HTML element is now recognized by Nuekit's HTML parser.
- Windows path inputs are normalized to forward slashes at input boundaries.

## Deprecated

None identified in this release.

## Removed

- Nue core no longer gives special login or auth behavior to a model named `users`. Applications and templates now own auth/session semantics explicitly.

## Security

No security fixes are included in this release. The full-template login/session implementation is demo template code and is not production-ready auth.

## Upgrade Notes

### Server Route Model Access

Update declared model access from top-level `c.env` properties to `c.env.models`:

```js
// Before
const users = c.env.users

// After
const users = c.env.models.users
```

### Resource Declarations

Declare local models in `site.yaml`:

```yaml
resources:
	models:
		users:
			kind: collection
			local: server/data/users.json
```

For Cloudflare Pages with D1, map the same model to a binding and table:

```yaml
platform:
	name: cloudflare-pages
	resources:
		models:
			users:
				binding: DB
				table: users
```

### Cloudflare D1 Tables

D1 tables must already exist. Beta 3 expects this collection schema:

```sql
CREATE TABLE users (id TEXT PRIMARY KEY, created TEXT, data TEXT);
CREATE TABLE loginSessions (id TEXT PRIMARY KEY, created TEXT, data TEXT);
```

Nue does not create schemas, run migrations, import JSON seed data, or implement production auth/session semantics in this release.

## Validation

Validation for the release cycle included:

- Nuekit platform adapter foundation test pass: 147 pass, 3 skip, 0 fail.
- Cloudflare Pages adapter milestone test pass: 153 pass, 3 skip, 0 fail.
- Cloudflare platform-specific suite: 10 pass.
- Template ZIP workflow milestone test pass: 175 pass, 3 skip, 0 fail.
- Lightweight persistence milestone test pass: 178 pass, 3 skip, 0 fail.
- `nue build --clean` focused test pass: 10 pass, 0 fail.
- Cloudflare Pages Git integration validation for production and preview branches.
- Wrangler Direct Upload validation for SPA and full-template D1 behavior.
- Template ZIP generation and inspection on Windows.
- npm package dry-runs before the first scoped package publish.
- Final release-candidate validation on 2026-06-13: `bun install --frozen-lockfile` completed with no changes.
- Final release-candidate package test baseline on 2026-06-13: `nueyaml` 24 pass; `nueglow` 7 pass; `nuedom` 190 pass, 1 skip; `nuestate` 9 pass, 2 skip; `nue-edgeserver` 18 pass; `nuemark` 116 pass, 1 skip; `nuekit` 178 pass, 3 skip.
- Final template validation on 2026-06-13: `spa` and `full` templates built successfully with local `@tormnator/nuekit@2.0.0-beta.3-tor.2`.
- Final package dry-runs on 2026-06-13: `@tormnator/nue-edgeserver@0.1.0-tor.2` and `@tormnator/nuekit@2.0.0-beta.3-tor.2` with `--access public --tag latest`.
- Final npm publish on 2026-06-13 from `main` commit `6d387ab5`: `@tormnator/nue-edgeserver@0.1.0-tor.2` and `@tormnator/nuekit@2.0.0-beta.3-tor.2` published to `latest`.
- Final npm package-set verification on 2026-06-13: all seven `@tormnator` packages resolve to the versions listed in Package Versions through npm dist-tag `latest`.

Git tag and GitHub Release URL are pending at the time this release record was prepared.

## Known Issues

- Full-template login/session behavior is demo code only and is not production-ready auth.
- D1 tables must be created manually; migrations and schema creation are deferred.
- JSON seed import to D1 is deferred.
- Automatic platform resource provisioning is deferred.
- Netlify and Vercel production resource implementations are deferred.
- `app.yaml`-level `collections:` support is deferred to Beta 4; current source reads site-level collection configuration.
- Documentation issues for template data, `:bind`, component attribute value semantics, and inline component data access remain open.
- Page-scoped assets without route changes, server-rendered Markdown partials, and ESM imports in inline component scripts remain open feature work.
- Native `nue push` deployment is not part of this release.
- The Cloudflare Pages `functions/` output model is not supported by the adapter.
- A hosted `nuejs.org` release-notes URL for this fork is deferred; this release uses the GitHub file URL as its public reference.

## Source Material

- Internal release details: `docs-internal/release-details/v2-0-beta-3.md`
- Release and publishing policy: `docs-internal/release-and-publishing-policy.md`
- Branching policy: `docs-internal/branching-policy.md`
- Issues: https://github.com/tormnator/nue/issues/1 through https://github.com/tormnator/nue/issues/30