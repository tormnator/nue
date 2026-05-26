# @tormnator/nue 2.0 Beta 3 Release Notes

Status: Draft
Date started: 2026-05-26
Target release: `@tormnator/nuekit` `2.0.0-beta.3-tor.N`

## Purpose

This draft collects release-note source material for the fork's beta 3 line. It should be updated as work lands, packages are published, and validation is completed.

The intended audience is developers with Nue projects based on upstream Nue 2.0 beta 2 who want to evaluate or upgrade to the current `@tormnator/nue` beta 3 line.

## Release State

Beta 3 is still in progress. Do not use this draft as final release text until the beta 3 milestone is complete and the release branch/package set is selected.

Use these status labels while drafting:

- `Landed`: merged into the release preparation branch.
- `Validated`: tested with automated tests and/or real deployments.
- `In progress`: implemented or designed on a topic branch but not yet merged into the release branch.
- `Deferred`: intentionally out of scope for beta 3.

## Highlights

- Cloudflare Pages platform adapter foundation and Advanced Mode worker output.
- Cloudflare Pages runtime validation for server routes, static asset fallback, SPA fallback, and file-like 404 behavior.
- Cloudflare Pages Git integration validation with production and preview deployments.
- `nue build --clean` now tolerates a missing `.dist` directory.
- Branching, npm publishing, and GitHub Release policy clarified for the fork.
- Platform resource layer design started for `c.env`, with local resource declarations and `c.env.models` shape in progress.

## Landed Or Validated Work

### Platform Adapter Foundation

Status: Landed
Related issues: #23, #24

Beta 3 introduces the platform adapter foundation used by target-specific build outputs. The first adapter targets Cloudflare Pages.

Notable behavior:

- Static-first builds remain static when no runtime artifact is needed.
- Runtime artifacts are generated when server routes, configured server proxy behavior, or SPA fallbacks require them.
- Platform-specific code is isolated in adapter implementations.

### Cloudflare Pages Adapter

Status: Landed and validated
Related issue: #24

The Cloudflare Pages adapter targets Pages Advanced Mode and emits `_worker.js` only when needed.

Validated behavior:

- Server routes dispatch before static assets.
- Static requests fall through to `env.ASSETS.fetch(request)`.
- Extensionless SPA routes fall back to the best matching SPA shell.
- File-like misses such as `/missing.txt` return static 404 behavior instead of implicit SPA fallback.
- A root `.dist/404.html` is emitted when missing to prevent Cloudflare Pages implicit SPA fallback from masking file-like 404s.

Known scope:

- `/functions` output is intentionally unsupported for this adapter.
- Native `nue push` deployment is not part of this milestone.

### Cloudflare Pages Git Integration Validation

Status: Validated
Related issue: #25

A private Cloudflare Pages Git integration demo validated that Cloudflare Pages can install the fork package line, run the build, detect `_worker.js`, compile the worker, and deploy both production and preview branches.

Validated behavior:

- Production deployment from `main`.
- Automatic redeploy after a pushed commit.
- Preview deployment from a secondary branch.
- `/api/ping` server route returns JSON.
- `/dashboard` extensionless SPA fallback works.
- `/missing.txt` returns 404.

### Build Clean Fix

Status: Landed and tested
Related issue: #26

`nue build --clean` now tolerates a missing `.dist` directory.

Validation:

- Regression coverage added in Nuekit build command tests.

### Branching And Release Policy

Status: Landed

The fork now documents the roles of `master`, `main`, `dev`, npm dist-tags, and GitHub Releases.

Key policy points:

- `dev` is the active integration and validation branch.
- `main` is the latest official fork source state.
- npm dist-tag `dev` is for moving installable validation packages.
- npm dist-tag `latest` and GitHub Releases should align with `main`.
- GitHub Releases are created only from `main`.

## In-Progress Release Candidates

These items are candidates for beta 3 release notes, but must not be presented as released until they land in the selected release branch.

### Platform Resource Layer Design

Status: In progress
Related issue: #27
Branches: `design/platform-resource-layer`, `feat/resource-layer-core`

The platform resource layer defines how server routes access deployment-provided capabilities through `c.env` without making Nue core depend on a single hosting platform.

Current direction:

- `c.env.config` for normalized configuration access.
- `c.env.models` for app/site domain models declared by the developer.
- `c.env.platform` for raw platform bindings as an explicit escape hatch.
- `c.env.runtime` for lightweight runtime metadata.

### Core Resource Environment Shaping

Status: In progress
Related issue: #28
Branch: `feat/resource-layer-core`

Implemented on the topic branch:

- Target-neutral `createResourceEnv()` helper.
- `createConfigResource()` with `get`, `require`, and `public` methods.
- Local server route env shaping with JSON-backed models under `c.env.models`.
- Cloudflare Pages server routes receive `c.env.config`, `c.env.platform`, and `c.env.runtime`.
- Template route examples moved from top-level `c.env.users` / `c.env.leads` to `c.env.models.users` / `c.env.models.leads`.

### Local Resource Declarations

Status: In progress
Related issue: #28
Branch: `feat/resource-layer-core`

Implemented on the topic branch:

- `resources` is treated as site-level config.
- Templates declare local JSON-backed model resources in `site.yaml`.
- Local model loading supports declared `resources.models.<name>.local` paths.
- Existing data-directory scanning remains as fallback.
- Missing declared local model files fail with clearer errors.

## Possible Upgrade Notes

These notes should become an upgrade guide if they require project edits.

### Server Route Model Access

Projects using local JSON-backed models should move route code from top-level model access to `c.env.models`:

```js
// Before
const { users } = c.env

// After
const { users } = c.env.models
```

The same applies to other domain models such as `leads`.

### Resource Declarations

Projects using local models should prepare to declare model resources in `site.yaml`:

```yaml
resources:
  models:
    users:
      kind: collection
      local: server/data/users.json
```

The exact Cloudflare production mapping is still in progress.

### Cloudflare Pages Adapter

Projects targeting Cloudflare Pages should expect Advanced Mode worker output when runtime features are detected. Static-only builds should remain static.

If a project depends on platform-specific bindings, route code should prefer `c.env.platform.<binding>` once the resource layer is adopted.

## Package Versions

TBD before publish.

Record every beta 3 package publish here:

| Package | Version | npm dist-tag | Source commit | Published from | Validation |
|---|---|---|---|---|---|
| `@tormnator/nuekit` | TBD | TBD | TBD | TBD | TBD |

## Validation Checklist

Before final beta 3 release notes are cut:

- Run the relevant package test suites.
- Run package dry runs or pack checks before npm publishing.
- Validate install commands against published packages.
- Validate Cloudflare Pages build/deploy behavior if adapter/runtime behavior changed.
- Record exact commits and package versions.
- Confirm the release notes only claim work that landed in the release branch.

## Known Limitations And Deferred Work

- Cloudflare D1-backed production collections are not complete yet.
- Universal auth/session semantics are deferred.
- Automatic platform resource provisioning is deferred.
- JSON-to-production data seeding and SQL migrations are deferred.
- Netlify and Vercel production resource implementations are deferred.

## Source Material

Issues and branches to review before finalizing:

- #23 Platform adapter foundation
- #24 Cloudflare Pages platform adapter
- #25 Cloudflare Pages Git integration validation
- #26 `nue build --clean` missing `.dist` fix
- #27 Platform resource layer design
- #28 Resource factory, config, and Cloudflare D1 collections
- `docs/cloudflare-git-validation`
- `fix/build-clean-missing-dist`
- `design/platform-resource-layer`
- `feat/resource-layer-core`
