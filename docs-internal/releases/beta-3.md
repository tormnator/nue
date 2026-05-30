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
- `Planned`: expected follow-up work that has not started yet.
- `Deferred`: intentionally out of scope for beta 3.

## Highlights

- Cloudflare Pages platform adapter foundation and Advanced Mode worker output.
- Cloudflare Pages runtime validation for server routes, static asset fallback, SPA fallback, and file-like 404 behavior.
- Cloudflare Pages Git integration validation with production and preview deployments.
- `nue build --clean` now tolerates a missing `.dist` directory.
- Branching, npm publishing, and GitHub Release policy clarified for the fork.
- Platform resource layer design completed for `c.env`, with local resource declarations, `c.env.config`, `c.env.models`, `c.env.platform`, and runtime metadata.
- Cloudflare D1-backed collection resources for declared model resources.
- Explicit, portable template zip generation and `nue create` source selection for official, dev, and local templates.

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

### Platform Resource Layer Design

Status: Landed
Related issue: #27

The platform resource layer design defines how server routes access deployment-provided capabilities through `c.env` without making Nue core depend on a single hosting platform.

The design establishes:

- `c.env.config` for normalized configuration access.
- `c.env.models` for app/site domain models declared by the developer.
- `c.env.platform` for raw platform bindings as an explicit escape hatch.
- `c.env.runtime` for lightweight runtime metadata.
- A boundary between core resource shaping, adapter-specific platform mappings, and app/template domain behavior.

Issue #27 is closed as design-complete. Follow-up persistence/provider/domain-model work remains planned under M4b.

### Resource Environment And D1 Collections

Status: Landed and validated
Related issue: #28

Beta 3 now includes the first platform resource implementation slice.

Implemented behavior:

- Target-neutral `createResourceEnv()` helper.
- `createConfigResource()` with `get`, `require`, and `public` methods.
- Local server route env shaping with JSON-backed models under `c.env.models`.
- Site-level `resources.models` declarations for local model resources.
- Cloudflare Pages server routes receive `c.env.config`, `c.env.platform`, and `c.env.runtime`.
- Cloudflare Pages can map declared `kind: collection` models to D1-backed resources.
- Template route examples moved from top-level `c.env.users` / `c.env.leads` to `c.env.models.users` / `c.env.models.leads`.

Validated behavior:

- Full Nuekit tests passed before merge to `dev`.
- Focused Cloudflare resource tests passed.
- Package dry-run confirmed moved Cloudflare adapter files are included.
- SPA and full templates build with Cloudflare worker output.
- Real Cloudflare Pages D1 validation confirmed D1-backed `users` routes through Wrangler Direct Upload.

Known scope:

- D1 tables must already exist with `id`, `created`, and `data` columns.
- Nue does not yet create schemas, run migrations, import JSON seed data, or implement production auth/session semantics.

### Template Zip Workflow And `nue create` Sources

Status: Landed and validated
Related issue: #29

Template folders are now treated as the source of truth, and committed template zips are explicit release artifacts for remote `nue create` usage.

Implemented behavior:

- `bun run templates:zip` regenerates `packages/templates/*.zip` from live template folders.
- `scripts/build-template-zips.js` writes deterministic ZIP files with stable ordering and timestamps.
- Generated ZIPs use UTF-8 filename metadata, preserve empty directories, and skip generated folders such as `.dist` and `node_modules`.
- `.github/workflows/build-template-zips.yml` is now a manual branch-scoped workflow that uses Bun, validates generated zips, and commits refreshed artifacts.
- `nue create` defaults to official templates from `https://github.com/tormnator/nue/raw/main/packages/templates`.
- `nue create <template> <source>` accepts a remote template base URL or a local `packages/templates` checkout.
- Local checkout mode prefers live template folders over local zips and skips generated folders such as `.dist`.

User-visible examples:

```bash
nue create spa
nue create spa https://github.com/tormnator/nue/raw/dev/packages/templates
nue create spa ./packages/templates
```

Validation:

- `bun run templates:zip` regenerated all committed template zips.
- ZIP metadata and archive listings were inspected on Windows.
- Empty-directory and non-ASCII filename smoke checks passed during implementation.
- Local zip fallback smoke test passed with `nue create spa ./zips`.
- Full Nuekit suite passed on `dev`: `175 pass`, `3 skip`, `0 fail`.

## In-Progress Release Candidates

These items are candidates for beta 3 release notes, but must not be presented as released until they land in the selected release branch.

### Lightweight Persistence Layer

Status: In progress
Related issue: #30

The M4b topic branch implements a small persistence/provider boundary above local JSON models and platform-specific storage such as D1. This does not become a full ORM, migration framework, auth system, or universal data model.

Implemented branch behavior:

- Local JSON/in-memory collections and Cloudflare D1 collections now share a platform-neutral `createCollectionResource(provider)` wrapper.
- Route-facing model resources keep the beta 3-compatible `getAll`, `size`, `create`, `get`, item `update`, and item `remove` API under `c.env.models`.
- Nue core no longer gives special login/auth behavior to a model merely because it is named `users`.
- The full template now owns its demo login-session behavior in template-local code backed by `users` and `loginSessions` collection resources.

Branch validation:

- Full Nuekit suite: `178 pass`, `3 skip`, `0 fail`.
- `spa` and `full` template builds completed with the local Nuekit CLI.
- Full-template Cloudflare-style D1 worker smoke covered login, admin list/detail/delete, public lead creation, logout, and post-logout admin denial.

Known scope remains unchanged: production auth/session semantics, D1 schema creation, migrations, JSON seed import, and additional platform backings remain follow-up work.

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

For Cloudflare Pages in beta 3, declared collection models can map to D1 through `platform.resources`:

```yaml
resources:
  models:
    users:
      kind: collection
      local: server/data/users.json

platform:
  name: cloudflare-pages
  resources:
    models:
      users:
        binding: DB
        table: users
```

The configured D1 table must already exist with the expected beta 3 collection schema.

### Cloudflare Pages Adapter

Projects targeting Cloudflare Pages should expect Advanced Mode worker output when runtime features are detected. Static-only builds should remain static.

If a project depends on platform-specific bindings, route code should prefer `c.env.platform.<binding>` once the resource layer is adopted.

### Template Creation Sources

By default, `nue create` downloads starter template zips from the fork's official `main` branch.

Developers evaluating the npm dist-tag `dev` package line should use templates that match the code they are testing:

```bash
nue create spa https://github.com/tormnator/nue/raw/dev/packages/templates
```

Developers working from a local checkout can use live template folders directly:

```bash
nue create spa ./packages/templates
```

Local checkout mode skips generated folders such as `.dist`.

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
- If starter templates or `nue create` changed, regenerate and validate committed template zips for the branch being released.
- Record exact commits and package versions.
- Confirm the release notes only claim work that landed in the release branch.

## Known Limitations And Deferred Work

- Cloudflare D1-backed collection resources require pre-existing D1 tables with the beta 3 schema.
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
- #29 Template zip generation and `nue create` source selection
- `docs/cloudflare-git-validation`
- `fix/build-clean-missing-dist`
- `design/platform-resource-layer`
- `feat/resource-layer-core`
- `feat/cloudflare-d1-collections`
- `feat/template-zip-workflow`
