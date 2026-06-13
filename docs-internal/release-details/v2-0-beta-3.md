# Release Details — Nue 2.0 Beta 3 (v2-0-beta-3)

**Document type:** Release Details — internal working document  
**Status:** Released - npm `latest`, Git tag, and GitHub Release complete
**CRI:** v2-0-beta-3  
**Draft date:** 2026-06-11  
**Release tag:** `v2-0-beta-3`
**Target release:** Full `@tormnator` package set with version-incremented packages for post-publish package changes
**Release branch:** `dev` → `main` (`main` release merge and npm publish source: `6d387ab5`)
**Release notes canonical location:** `packages/www/docs/releases/v2-0-beta-3.md` (GitHub URL used for this fork cycle - see note below)
**Intended audience for this document:** Release author. Used to produce: (1) final public release notes, (2) root `CHANGELOG.md`, (3) package-level `CHANGELOG.md` files.

> **Release notes URL note:** The canonical rendered URL per RPP convention would be `https://www.nuejs.org/docs/releases/v2-0-beta-3`. However, because this is a fork and the official Nue website cannot be updated at this time, the public release notes should instead be referenced via the tormnator GitHub location: `https://github.com/tormnator/nue/blob/main/packages/www/docs/releases/v2-0-beta-3.md`. A website deployment to Cloudflare (which would enable the nuejs.org URL) may happen in a future cycle (Beta 4).

---

## Table of Contents

<!-- Start Document Outline -->

* [Purpose](#purpose)
* [Release Overview](#release-overview)
* [Beta 3 Cycle Boundaries](#beta-3-cycle-boundaries)
* [Package Versions](#package-versions)
* [Highlights](#highlights)
* [Added](#added)
* [Fixed](#fixed)
* [Changed](#changed)
* [Deprecated](#deprecated)
* [Removed](#removed)
* [Security](#security)
* [Upgrade Notes](#upgrade-notes)
* [Known Issues and Deferred Work](#known-issues-and-deferred-work)
* [Open Issues Carried Into Next Cycle](#open-issues-carried-into-next-cycle)
* [Validation Summary](#validation-summary)
* [In-Depth Notes](#in-depth-notes)
* [Remaining Open Items Before Final Release](#remaining-open-items-before-final-release)
* [Source Material](#source-material)

<!-- End Document Outline -->

## Purpose

This draft collects all available release-note source material for the Beta 3 cycle of the `tormnator/nue` fork. The Beta 3 cycle began with commit `5e3f7b6` on 2025-12-19 and concludes with the work merged through commit `6f581c2` on 2026-06-11. It covers all issues and commits on the `dev` branch through the end of the cycle.

The audience for the final public release notes is: developers with Nue projects based on upstream Nue 2.0 Beta 2 who want to evaluate or upgrade to the current `tormnator/nue` beta 3 line.

---

## Release Overview

Beta 3 is the first coordinated release of the `tormnator/nue` fork as a publicly installable scoped npm package set. The headline additions are a Cloudflare Pages platform adapter with full Advanced Mode worker output, a target-neutral platform resource layer (`c.env`) with Cloudflare D1-backed collection resources, a lightweight collection resource boundary shared by local JSON and D1 providers, and a set of meaningful Nuekit bug fixes (asset precedence, HMR, Nuemark rendering, build tooling). The release also establishes the fork's branching policy, npm publishing policy, release and publishing policy, template zip workflow, and internal release documentation foundations.

---

## Beta 3 Cycle Boundaries

| Boundary | Value |
|---|---|
| Cycle start commit | `5e3f7b6` — 2025-12-19 (`fix(windows): normalize backslash paths`) |
| Cycle end commit | `6f581c2` — 2026-06-11 (`Standardize and expand release and publishing policies`) |
| Branch | `dev` |
| First npm publish date | 2026-05-23 |
| First npm publish source commit | `eccbecd7` |
| Main branch promotion commit | `6d387ab5` — 2026-06-13 (`Merge dev for Nue 2.0 Beta 3 release`) |
| Git release tag | `v2-0-beta-3` |
| GitHub Release | https://github.com/tormnator/nue/releases/tag/v2-0-beta-3 |

---

## Package Versions

### First (Validation) Publish — 2026-05-23

All packages were first published on **2026-05-23** from Git `dev` branch at source commit `eccbecd7`. This was the initial publication of the `@tormnator` scoped package set. Because each package name was new to npm, both `dev` and `latest` dist-tags were assigned automatically on first publish.

| Package | Version | npm dist-tags | Published |
|---|---|---|---|
| `@tormnator/nuekit` | `2.0.0-beta.3-tor.1` | `dev`, `latest` | 2026-05-23 |
| `@tormnator/nuemark` | `0.7.1-tor.1` | `dev`, `latest` | 2026-05-23 |
| `@tormnator/nuedom` | `0.1.1-tor.1` | `dev`, `latest` | 2026-05-23 |
| `@tormnator/nuestate` | `0.1.1-tor.1` | `dev`, `latest` | 2026-05-23 |
| `@tormnator/nueyaml` | `0.1.0-tor.1` | `dev`, `latest` | 2026-05-23 |
| `@tormnator/nue-glow` | `0.2.5-tor.1` | `dev`, `latest` | 2026-05-23 |
| `@tormnator/nue-edgeserver` | `0.1.0-tor.1` | `dev`, `latest` | 2026-05-23 |

> **⚠ Publish timing gap:** The 2026-05-23 packages were published at commit `eccbecd7`, which predates M4a (template zip workflow, `nue create` source changes — landed 2026-05-29) and M4b (lightweight collection resource boundary, full-template login session refactor — landed 2026-05-30). The published packages do **not** include those changes.

### Official Release Publish — 2026-06-13

The official Beta 3 release uses the full `@tormnator` package set, but only packages with post-publish package changes receive incremented version strings. The first scoped npm publish happened at commit `eccbecd7`; the package audit for final release decisions compared package changes after that point.

Official npm publish source commit: `6d387ab5` on Git `main`.

| Package | Official Version | npm `latest` | Notes |
|---|---|---|---|
| `@tormnator/nuekit` | `2.0.0-beta.3-tor.2` | Verified | Bumped for the official Beta 3 package line and post-publish Nuekit/template work: resource layer, template zip workflow, lightweight persistence boundary, build fix, and release package visibility. |
| `@tormnator/nue-edgeserver` | `0.1.0-tor.2` | Verified | Bumped for a package README correction after the first publish so npm-facing examples match the Beta 3 `c.env.models` route API. |
| `@tormnator/nuemark` | `0.7.1-tor.1` | Verified | No package changes after the first publish; the Beta 3 Nuemark fixes are already included in `0.7.1-tor.1`. |
| `@tormnator/nuedom` | `0.1.1-tor.1` | Verified | No package changes after the first publish. |
| `@tormnator/nuestate` | `0.1.1-tor.1` | Verified | No package changes after the first publish. |
| `@tormnator/nueyaml` | `0.1.0-tor.1` | Verified | No package changes after the first publish. |
| `@tormnator/nue-glow` | `0.2.5-tor.1` | Verified | No package changes after the first publish. |

Publish record:

| Package | Action | Result |
|---|---|---|
| `@tormnator/nue-edgeserver@0.1.0-tor.2` | `bun publish --access public --tag latest` from `packages/nueserver` | Published; `latest` verified as `0.1.0-tor.2`; `dev` remains `0.1.0-tor.1`. |
| `@tormnator/nuekit@2.0.0-beta.3-tor.2` | `bun publish --access public --tag latest` from `packages/nuekit` | Published; `latest` verified as `2.0.0-beta.3-tor.2`; `dev` remains `2.0.0-beta.3-tor.1`. |

> **Package audit note:** `git diff eccbecd7..HEAD -- packages/nuemark packages/nuedom packages/nuestate packages/nueyaml packages/nueglow` produced no output during draft finalization, so those package versions remain unchanged. `packages/nueserver/README.md` changed after the first publish and is npm-facing package content, so `@tormnator/nue-edgeserver` receives a `tor.N` metadata/documentation bump.

> **Note on `nue-edgeserver`:** The Cloudflare Pages adapter bundles `nue-edgeserver` directly into the generated `_worker.js` via `import { fetch as dispatch, matches } from 'nue-edgeserver'`. The official `0.1.0-tor.2` bump is for npm-facing package documentation alignment; no `nueserver.js` runtime source change was identified after the first publish.

### Install / Upgrade (Final Release)

```bash
bun add @tormnator/nuekit       # installs latest
# or pin exact version:
bun add @tormnator/nuekit@2.0.0-beta.3-tor.2
```

For Cloudflare Pages Git integration, note that `bun install --minimum-release-age=0` may be needed on developer machines with Bun's global minimum release age policy enabled for freshly published packages. Cloudflare Pages build environments are unaffected.

---

## Highlights

1. **Cloudflare Pages platform adapter** — First concrete platform adapter. Targets Pages Advanced Mode. Emits `_worker.js` only when server routes, proxy behavior, or SPA fallbacks require it. Static-only builds remain static.
2. **Platform resource layer (`c.env`)** — Target-neutral resource env shaping for server routes. Exposes `c.env.config`, `c.env.models`, `c.env.platform`, and `c.env.runtime`. No Nue core dependency on any hosting platform.
3. **Cloudflare D1 collection resources** — Declared `kind: collection` model resources can map to Cloudflare D1-backed storage, accessed identically to local JSON/in-memory models via `c.env.models`.
4. **Lightweight collection resource boundary** — `createCollectionResource(provider)` wrapper makes local JSON and D1 providers interchangeable at the route level. Removes special-cased auth/user logic from Nue core.
5. **Full-template login sessions moved to template-local code** — The full template now owns its demo login/logout/authenticate behavior in template-local route code backed by declared `users` and `loginSessions` collection resources.
6. **Asset precedence overhaul** — Comprehensive audit and fix of HTML layout, CSS, JS, YAML, and JSON asset precedence semantics across Nuekit.
7. **HMR scoped to matching sessions** — Content and CSS hot-reload updates are now scoped to browser sessions on the affected page only.
8. **Nuemark rendering fixes** — `[image]` tag alt/figcaption logic corrected; multi-line HTML comment indentation tracking fixed.
9. **`nue build --clean` tolerates missing `.dist`** — No longer fails on a fresh checkout.
10. **Explicit, portable template zip workflow** — `bun run templates:zip` generates deterministic ZIPs. `nue create` defaults to fork's official `main` branch templates with dev and local override paths.
11. **First `@tormnator` scoped npm publish** — All seven Nue packages published under the `@tormnator` scope.
12. **Fork policy documentation** — Branching policy, npm versioning/publishing policy, and release and publishing policy all documented and committed to the repo.

---

## Added

### Platform Adapter Foundation (Issue #23 — Milestone 1)

**Status:** Landed and tested  
**Related commit:** `3e04116e` (2026-05-20)  
**Branch:** `platform-adapter-core` → merged to `dev`  
**Test result at merge:** 147 pass, 3 skip, 0 fail

Adds a target-neutral platform adapter foundation to Nuekit. No Cloudflare-specific terminology, runtime files, bindings, or deployment behavior enters core.

- New site-level config key: `platform` with a `name` field for adapter selection.
- Platform adapter registry, context, and runtime detection under `packages/nuekit/src/platform/`.
- Adapters auto-loaded by `platform.name` — no adapter is hard-coded in core.
- Platform post-build hook runs after the existing static build step.
- Runtime requirement detection (`RUNTIME_REASONS`: `server_routes`, `server_proxy`, `spa_fallback`) drives whether a runtime artifact is emitted.
- Static-first: no platform artifact emitted if the build has no runtime requirement.

### Cloudflare Pages Platform Adapter (Issue #24 — Milestone 2)

**Status:** Landed and validated  
**Related commits:** `deb45bc1` (2026-05-20), `13d3d402` (2026-05-21), `d8e2a16` (2026-05-21), `651cb14` (2026-05-21), `ee2ed310` (2026-05-21), `7a9b8b3a` (2026-05-22, merge to `dev`)  
**Branch:** `cloudflare-pages-platform-adapter`  
**Test results:** 153 pass, 3 skip, 0 fail (at milestone close); 10 pass on Cloudflare-specific platform suite

Adds the `cloudflare-pages` adapter under `packages/nuekit/src/platform/cloudflare-pages/`. Targets Pages Advanced Mode only. Emits `_worker.js` by bundling `nue-edgeserver` as the route dispatch runtime. A user-facing documentation draft has been captured in `docs-internal/platform-adapters/cloudflare-pages-user-docs-draft.md`.

**Worker generation:**
- `_worker.js` is emitted only when runtime is required (server routes, proxy config, or SPA fallbacks detected).
- Worker source is generated dynamically, then bundled via `Bun.build` into a single ESM file.
- `nue-edgeserver` is imported as `import { fetch as dispatch, matches } from 'nue-edgeserver'` in the generated worker source.
- `createResourceEnv` and `createConfigResource` are imported from `../../server/resources.js` for `c.env` shaping inside the worker.
- `createModelResources` (from `./resources.js`) maps declared model resources to D1 or local providers inside the worker.

**Worker request order:**
1. Server route dispatch via `nue-edgeserver` (`matches` + `dispatch`)
2. Proxy passthrough (if configured)
3. Static asset passthrough (`env.ASSETS.fetch(request)`)
4. Extensionless SPA fallback (if path matches a known SPA shell)
5. Static 404 (file-like paths that miss)

**Additional adapter behavior:**
- Default `@shared/server` detection: worker output is emitted for the default server route directory.
- Root `404.html` emitted when missing, preventing Cloudflare Pages implicit SPA fallback from masking file-like 404 responses.
- `nue preview` updated to mirror built SPA fallback behavior.
- `functions/` directory output model intentionally unsupported.
- Native `nue push` deployment not part of this milestone.

**Validated behavior (Wrangler Direct Upload):**
- API route dispatch to server routes
- Static asset passthrough
- Nested SPA fallback (extensionless routes → correct DHTML shell)
- File-like 404 (e.g., `missing.txt` → 404, not SPA fallback)

### Cloudflare Pages Git Integration Validation (Issue #25 — Milestone 3)

**Status:** Validated  
**Related commit:** `3385e07` (2026-05-25, doc)

A private Cloudflare Pages Git integration demo validated the full publish-to-deploy pipeline using the `@tormnator` package set. The demo project used `@tormnator/nuekit@dev` and `build: nue-tor build` as the build command.

**Validated deployment paths:**
- Production branch (`main`): deployed and served updated content.
- Preview branch (`dev`): deployed and served preview branch marker content.

**Validated behavior:**
- Cloudflare Pages dashboard Git integration setup, initial deploy, and automatic redeploy after commit push.
- `bun install` + `bun run build` succeeds on Cloudflare's build environment using the published `@tormnator` package set.
- `_worker.js` detected and compiled by Cloudflare.
- Server route (`/api/ping`) returns JSON correctly.
- Extensionless SPA route (`/dashboard`) falls back correctly.
- File-like miss (`/missing.txt`) returns 404.

### Platform Resource Layer Design (Issue #27)

**Status:** Landed (design-complete)  
**Related commits:** `8b4b145` (2026-05-26), `357090d` (2026-05-26)  
**Branch:** `design/platform-resource-layer`

Defines how server routes access deployment-provided capabilities through `c.env` without coupling Nue core to any specific hosting platform.

**`c.env` shape:**
- `c.env.config` — normalized configuration access (`get`, `require`, `public` methods) via `createConfigResource`.
- `c.env.models` — app/site domain model resources declared under `resources.models` in `site.yaml`.
- `c.env.platform` — raw platform bindings as an explicit escape hatch (e.g., Cloudflare `env.*` bindings).
- `c.env.runtime` — lightweight runtime metadata.

Clear boundary: core resource shaping ↔ adapter-specific platform mappings ↔ app/template domain behavior. Issue #27 closed as design-complete; implementation followed in Issues #28 and #30.

### Resource Environment and Cloudflare D1 Collections (Issue #28 — Milestone 4, part 1)

**Status:** Landed and validated  
**Related commits:** `e6b7594`, `3a2b30d` (2026-05-26), `1421fa1`, `4fb1be0` (2026-05-27), `800c3a8`, `49d0773`, `3b9827d`, `b0465ae` (2026-05-28), `c3e4aca` (2026-05-28, merge to `dev`)  
**Branch:** `feat/cloudflare-d1-collections`  
**Test results:** Full Nuekit suite passed before merge; focused Cloudflare resource tests passed

Implements the first beta 3 resource-layer slice: target-neutral `c.env` shaping, config resource, local JSON model resources, and Cloudflare D1-backed collection resources.

**What landed:**
- Target-neutral `createResourceEnv` helper used by both local server and the Cloudflare Pages worker.
- `createConfigResource` with `get`, `require`, and `public` methods.
- `resources.models` declarations in `site.yaml` for local/template model resources.
- Local JSON-backed model resources under `c.env.models` for local `nue dev` / `nue serve`.
- Cloudflare Pages worker shaping: `c.env.platform` carries raw platform bindings; `c.env.models` carries D1-backed resources when declared.
- `createModelResources` (in `packages/nuekit/src/platform/cloudflare-pages/resources.js`) maps declared `kind: collection` models to Cloudflare D1 via `platform.resources.models` config.
- Template route examples migrated: `c.env.users` / `c.env.leads` → `c.env.models.users` / `c.env.models.leads`.
- Wrangler config files (e.g., `wrangler.toml`) are now skipped during Nuekit builds (`b0465ae`).
- Full-template lead model write bug fixed (`4fb1be0`).

**D1 collection schema assumption (beta 3):**
```sql
CREATE TABLE <name> (
  id      TEXT PRIMARY KEY,
  created TEXT,
  data    TEXT
);
```
All collection data is stored as JSON in the `data` column.

**Known scope:**
- D1 tables must already exist with the schema above.
- Nue does not create schemas, run migrations, import JSON seed data, or implement production auth/session semantics.

**Validation:**
- Real Cloudflare D1 validation confirmed D1-backed `users` routes through Wrangler Direct Upload.
- Package dry-run confirmed moved Cloudflare adapter files are included in the published artifact.
- SPA and full templates built with Cloudflare worker output.

### Template Zip Workflow and `nue create` Sources (Issue #29 — M4a)

**Status:** Landed and validated  
**Related commits:** `a713b54` (2026-05-29), `2f45827` (2026-05-29, merge to `dev`)  
**Branch:** `feat/template-zip-workflow`  
**Test results:** 175 pass, 3 skip, 0 fail

Template folders are now the source of truth. Committed template ZIPs are explicit release artifacts for remote `nue create` usage.

- `bun run templates:zip` — regenerates `packages/templates/*.zip` from live template folders.
- `scripts/build-template-zips.js` — deterministic ZIP generation: stable ordering and timestamps, UTF-8 filename metadata, preserves empty directories, skips `.dist` and `node_modules`.
- `.github/workflows/build-template-zips.yml` — manual `workflow_dispatch`, branch-scoped, Bun-based, validates generated ZIPs before committing.
- `nue create` default source updated to fork's `main` branch: `https://github.com/tormnator/nue/raw/main/packages/templates`.
- `nue create` accepts a remote base URL or a local `packages/templates` checkout.
- Local checkout mode: prefers live template folders over local ZIPs; skips `.dist` and `node_modules`.

**`nue create` usage:**
```bash
nue create spa                                                                # fork main branch (default)
nue create spa https://github.com/tormnator/nue/raw/dev/packages/templates   # dev branch templates
nue create spa ./packages/templates                                           # local checkout
```

**Validation:**
- `bun run templates:zip` regenerated all committed template ZIPs.
- ZIP metadata and archive listings inspected on Windows.
- Empty-directory and non-ASCII filename smoke checks passed.
- Local ZIP fallback smoke test passed with `nue create spa .zips`.

### Lightweight Collection Resources and Full-Template Login Sessions (Issue #30 — M4b)

**Status:** Landed and validated  
**Related commits:** `f553f1e` (2026-05-30, design doc), `26adefa4` (2026-05-30, implementation), `8679b45e` (2026-05-30, merge to `dev`)  
**Branch:** `feat/lightweight-persistence-layer`  
**Test results:** 178 pass, 3 skip, 0 fail (pre- and post-merge)

Implements a lightweight persistence/provider boundary above local JSON models and Cloudflare D1 storage. Design captured in `docs-internal/platform-adapters/lightweight-persistence-layer.md`.

**What landed:**
- `createCollectionResource(provider)` — shared target-neutral wrapper.
- Route-facing collection API: `getAll`, `size`, `create`, `get`, item `update`, item `remove` — consistent across local JSON and D1 providers.
- Provider-owned `id` and `created` field behavior.
- Local JSON/in-memory writes stay in memory only (no write-back to seed files).
- Nue core no longer gives special login/auth behavior to a model named `users`.
- Full template now owns demo login-session behavior entirely in template-local code backed by declared `users` and `loginSessions` collection resources.
- Full-template login responses return a public user object that omits the password field.
- `spa` template generic model routes continue to work unchanged.

**Validation:**
- `spa` and `full` template builds completed locally with Nuekit CLI.
- Full-template Cloudflare-style D1 worker smoke: login, admin list/detail/delete, public lead creation, logout, post-logout admin denial.
- Post-merge Nuekit suite: 178 pass, 3 skip, 0 fail.

---

## Fixed

### Asset Precedence Overhaul (Issues #1, #2, #3, #4)

**Status:** Landed and tested  
**Related commits:** `7969979`, `2e70c09`, `55344bd`, `e5ae7a7`, `785b98dc`, `bdb77d7`, `b875c1a7`, `a780b67` (all 2026-04-25)  
**Branches:** `tor/fix-layout-module-precedence`, `tor/fix-root-index-html-discovery`, `tor/audit-asset-precedence`, `tor/fix-home-index-html-inclusion`

Comprehensive audit and fix of asset precedence semantics across all asset categories.

**Issue #1 — HTML layout module precedence:**
- `asset.js` now implements page-relative precedence: more specific (deeper) directories beat broader ones; a parent directory beats its own `ui/` subfolder.
- Commit: `7969979` (`Implement page-relative precedence for HTML layout discovery`)

**Issue #2 — Full asset precedence audit (five focused fix slices):**
- `sortAssets()` now gives `@shared/*` files an explicit priority bucket instead of relying on lexical sort order — `785b98dc`.
- CSS and JS dependencies load in explicit broad-to-specific order: `@shared/*` → root → app/page scope; `renderStyles()` honors `design.base` — `bdb77d7`.
- Shared YAML data from `@shared/data` now acts as the broad base layer; root/app/page YAML overrides in increasing specificity — `55344bd`.
- Nested `app.yaml` files now cascade from broader scope to deeper scope — `e5ae7a7`.
- `.json` files now participate in page dependency discovery alongside `.yaml`; JSON data merges through the same broad-to-specific hierarchy — `b875c1a7`.

**Issue #3 — Root `index.html` SPA discovery leak:**
- Root `index.html` pages could discover unrelated nested UI/layout assets through the SPA dependency branch in `deps.js`, causing wrong layout modules to render after the Issue #1 fix.
- Fixed in `2e70c09` (`Fix root index.html SPA discovery leak`).

**Issue #4 — Root `index.html` `home/` asset inclusion:**
- Root `index.html` pages did not auto-include assets from the `home/` directory, unlike root `index.md` pages.
- Fixed in `a780b67` (`Fix home asset inclusion for root index.html`).

**Upstream PR material:** A consolidated audit note and upstream PR body drafts were committed to branch `tor/upstream-pr-drafts` as working material for future upstream PR preparation. This branch is not merged to `dev`. No upstream PR submission to `nuejs/nue` is planned at this time.

### HMR Session Scoping Fix (Issues #14, #15)

**Status:** Landed  
**Related commit:** `36018a0` (2026-05-04)

**Issue #14 — HMR content navigation broadcast:**
- Editing a `.md` or non-library HTML file during `nue dev` caused all connected browser sessions to navigate to the edited file's URL, regardless of which page they were on.
- Fix: content update events are now scoped to sessions on the matching page URL.

**Issue #15 — HMR CSS injection into unrelated pages:**
- Saving a page-specific CSS file caused `reloadCSS()` to append that stylesheet to the `<head>` of every connected session, injecting foreign stylesheets into unrelated pages.
- Fix: CSS reload is scoped; a session that does not already have the stylesheet linked will not receive it.

Both bugs were fixed in a single commit: `36018a0` (`fix(hmr): scope content updates to matching browser sessions`).

### Nuemark Rendering Fixes (Issues #16, #17)

**Status:** Landed  
**Related commits:** `cff1547`, `cdfb18a` (both 2026-05-04)

**Issue #16 — `[image]` tag alt/figcaption logic** (`packages/nuemark/src/render-tag.js`):
- **Bug 1:** Setting `alt:` as a YAML attribute correctly populated `<img alt="...">` but also fell through to render the alt value as a visible `<figcaption>` (with a leading colon) because `caption` was `undefined`.
- **Bug 2:** Setting `caption:` duplicated the caption text into `<img alt="">` instead of using the caption as the accessible fallback only when no `alt:` was provided.
- Fixed in `cff1547`.

**Issue #17 — Multi-line HTML comments in `parseBlocks`** (`packages/nuemark/src/`):
- Inner lines of multi-line HTML comments (`<!-- ... -->`) were processed by `parseBlocks` as normal content, corrupting the document-wide `spaces` variable used for indentation tracking. Subsequent indented content was sliced incorrectly.
- Fixed in `cdfb18a` — inner lines of multi-line HTML comments are now skipped.

### `nue build --clean` Missing `.dist` Fix (Issue #26)

**Status:** Landed and tested  
**Related commit:** `d592bac` (2026-05-25)

- `nue build --clean` failed on fresh checkouts when `.dist` did not exist yet.
- Fix: replaced `fs.rmdir` with `fs.rm` in `packages/nuekit/src/cmd/build.js` for the `--clean` deletion path.
- Regression test added in `packages/nuekit/test/cmd/build.test.js`.
- Focused test result: 10 pass, 0 fail.

### Missing `<menu>` Tag in HTML5_TAGS

**Related commits:** `9939caa` (2026-04-23), `1c4eec5` (2026-04-27)  
The `<menu>` HTML5 element was absent from the `HTML5_TAGS` recognition list used by Nuekit's HTML parser. Added.

### Windows Path Normalization (Cycle-start fix)

**Related commit:** `5e3f7b6` (2025-12-19)  
First commit of the Beta 3 cycle. Normalizes backslash paths to forward slashes at input boundaries for Windows compatibility. Carried forward from an upstream PR.

---

## Changed

### Server Route Model Access Path

Route code must migrate from top-level `c.env` model access to `c.env.models`:

```js
// Before (Beta 2 / early Beta 3)
const users = c.env.users
const leads = c.env.leads

// After (Beta 3)
const users = c.env.models.users
const leads = c.env.models.leads
```

This change is required for all projects using declared model resources (Issue #28).

### Site Config Resource Declarations Required

Models must now be declared explicitly in `site.yaml`:

```yaml
resources:
  models:
    users:
      kind: collection
      local: server/data/users.json
```

For Cloudflare Pages with D1:

```yaml
platform:
  name: cloudflare-pages
  resources:
    models:
      users:
        binding: DB
        table: users
```

### `nue create` Default Template Source

`nue create` now defaults to the fork's `main` branch templates (`https://github.com/tormnator/nue/raw/main/packages/templates`) instead of upstream Nue templates.

### Full Template Login/Session Architecture

The full template's login/logout/authenticate behavior is no longer in Nue core or platform adapters — it lives entirely in template-local route code. This affects developers who have customized the full template's auth routes.

### Cloudflare Pages: Advanced Mode Only

The Cloudflare Pages adapter targets Pages Advanced Mode (`_worker.js`) exclusively. The `functions/` directory output model is intentionally unsupported.

### Wrangler Config Files Skipped in Builds

`wrangler.toml` and related Wrangler configuration files are now excluded from Nuekit builds and will not be copied to `.dist`.

---

## Deprecated

_(None identified in this cycle.)_

---

## Removed

### Nue Core `users` Special Auth Behavior

Nue core no longer gives special login/auth behavior to a model named `users`. Auth/session semantics are now entirely the responsibility of the consuming template or application (Issue #30).

---

## Security

No security fixes in this cycle. The full-template login sessions are explicitly a demo/template implementation, not production-ready auth. See Known Issues.

---

## Upgrade Notes

### 1. Server Route Model Access

```js
// Before
const users = c.env.users

// After
const users = c.env.models.users
```

Applies to all declared models (e.g., `leads`, `posts`, `loginSessions`).

### 2. Add Resource Declarations to `site.yaml`

```yaml
resources:
  models:
    users:
      kind: collection
      local: server/data/users.json
```

### 3. Cloudflare Pages Projects

Expect `_worker.js` output when server routes, proxy config, or SPA fallbacks are detected. Static-only builds are unaffected.

Pre-create D1 tables with the beta 3 schema before deploying:

```sql
CREATE TABLE users (id TEXT PRIMARY KEY, created TEXT, data TEXT);
CREATE TABLE loginSessions (id TEXT PRIMARY KEY, created TEXT, data TEXT);
```

Add `platform.resources` declarations in `site.yaml` (see Changed section).

### 4. `nue create` Template Sources

Dev branch templates:
```bash
nue create spa https://github.com/tormnator/nue/raw/dev/packages/templates
```

Local checkout:
```bash
nue create spa ./packages/templates
```

---

## Known Issues and Deferred Work

| Item | Status |
|---|---|
| Production auth/session semantics | **Deferred** — full-template login is a demo implementation only |
| D1 schema creation and migrations | **Deferred** — D1 tables must be pre-created manually |
| JSON seed import to D1 | **Deferred** |
| Automatic platform resource provisioning | **Deferred** |
| Netlify and Vercel production resource implementations | **Deferred** |
| `app.yaml`-level `collections:` config (Issue #22) | **Deferred to Beta 4** — docs claim support; source only reads `site.yaml` collections |
| Docs: two errors in `template-data.md` (Issue #20) | **Open** |
| Docs: Document `:bind` attribute (Issues #9, #19) | **Open** |
| Docs: Component attribute value semantics (Issue #10) | **Open** |
| Docs: Template-data access for inline components (Issue #5) | **Open** |
| Feature: Page-scoped assets without route changes (Issue #13) | **Open** |
| Feature: Server-rendered Markdown partials (Issue #12) | **Open** |
| Feature: ESM imports in inline component scripts (Issue #6) | **Open** |
| Test setup standardization (Issue #8) | **Open** (low priority) |
| `nue push` native deployment | Not part of this release |
| `functions/` Cloudflare Pages output model | Not supported by the adapter |
| Website deployment (nuejs.org URL for release notes) | Likely Beta 4 |

---

## Open Issues Carried Into Next Cycle

| Issue | Title | Filed |
|---|---|---|
| #22 | `app.yaml` can define `collections:` — source only processes `site.yaml` | 2026-05-05 |
| #20 | Docs: two errors in `template-data.md` collections section | 2026-05-04 |
| #19 | Docs: Document `:bind` attribute in `html-syntax.md` | 2026-05-04 |
| #13 | Support page-scoped assets without forcing route changes | 2026-05-04 |
| #12 | Add server-rendered Markdown partials via `<markdown>` and `[markdown]` | 2026-05-01 |
| #10 | Document component attribute value semantics more clearly | 2026-04-28 |
| #9 | Document the `:bind` feature explicitly | 2026-04-28 |
| #8 | Tighten and standardize the test setup across packages | 2026-04-28 |
| #6 | Support ESM imports in inline HTML component scripts | 2026-04-28 |
| #5 | Clarify template-data access for inline HTML components | 2026-04-28 |

> **Closed as duplicates during Beta 3:** Issue #11 (duplicate of #10), Issue #21 (duplicate of #22).

---

## Validation Summary

| Checkpoint | Result |
|---|---|
| Nuekit suite — M1 merge (platform adapter foundation) | 147 pass, 3 skip, 0 fail |
| Nuekit suite — M2 close (Cloudflare adapter) | 153 pass, 3 skip, 0 fail |
| Cloudflare platform-specific suite (M2) | 10 pass |
| Nuekit suite — M4a merge (template zip workflow) | 175 pass, 3 skip, 0 fail |
| Nuekit suite — M4b pre-merge (lightweight persistence) | 178 pass, 3 skip, 0 fail |
| Nuekit suite — M4b post-merge | 178 pass, 3 skip, 0 fail |
| `nue build --clean` focused test | 10 pass, 0 fail |
| Cloudflare Pages Git integration — production branch | Validated |
| Cloudflare Pages Git integration — preview branch | Validated |
| Cloudflare D1 — SPA template (Wrangler Direct Upload) | Validated |
| Cloudflare D1 — Full template (Wrangler Direct Upload) | Validated |
| Template ZIP generation and inspection (Windows) | Validated |
| npm package dry-run before publish | Confirmed |
| npm `dev` + `latest` dist-tags assigned on first publish | Confirmed |
| Final frozen install — 2026-06-13 | Passed; `bun install --frozen-lockfile` reported no changes |
| Final package test baseline — 2026-06-13 | Passed; `nueyaml` 24 pass; `nueglow` 7 pass; `nuedom` 190 pass, 1 skip; `nuestate` 9 pass, 2 skip; `nue-edgeserver` 18 pass; `nuemark` 116 pass, 1 skip; `nuekit` 178 pass, 3 skip |
| Final template builds — 2026-06-13 | Passed; `spa` and `full` templates built with local `@tormnator/nuekit@2.0.0-beta.3-tor.2` |
| Final template ZIP regeneration — 2026-06-13 | Passed; `bun run templates:zip` regenerated `blog.zip`, `full.zip`, `minimal.zip`, and `spa.zip` |
| Final package dry-runs — 2026-06-13 | Passed; `@tormnator/nue-edgeserver@0.1.0-tor.2` and `@tormnator/nuekit@2.0.0-beta.3-tor.2` dry-ran with `--access public --tag latest` |
| Main branch promotion — 2026-06-13 | Completed; `origin/main` updated to merge commit `6d387ab5` |
| Official npm publish — 2026-06-13 | Completed; `@tormnator/nue-edgeserver@0.1.0-tor.2` and `@tormnator/nuekit@2.0.0-beta.3-tor.2` published to `latest` |
| Final npm package-set verification — 2026-06-13 | Passed; npm `latest` resolves to the package versions listed for all seven `@tormnator` packages |
| External npm consumer validation — 2026-06-13 | Passed; clean external project installed `nuekit@npm:@tormnator/nuekit@2.0.0-beta.3-tor.2`, `nue-tor --version` reported `Nue 2.0.0-beta.3-tor.2`, and `nue-tor build` succeeded for a minimal Markdown site |
| Git tag — 2026-06-13 | Completed; `v2-0-beta-3` pushed to `origin` |
| GitHub Release — 2026-06-13 | Completed; https://github.com/tormnator/nue/releases/tag/v2-0-beta-3 |

> **Resolved validation gap:** The 2026-05-23 packages did not include M4a or M4b changes. The official release resolved this by publishing `@tormnator/nuekit@2.0.0-beta.3-tor.2` from the `main` release merge commit. Unchanged packages remain on their previously published exact versions.

---

## In-Depth Notes

### npm Publish Timing Gap

The first `@tormnator` npm publish (2026-05-23, commit `eccbecd7`) occurred between Milestone 3 (Git integration validation) and Milestone 4 work. The following changes postdate the published packages and must be included in the official release publish:

| Change | Landed |
|---|---|
| M4a: Template zip workflow, `nue create` source selection | 2026-05-29 |
| M4b: Lightweight collection resource boundary | 2026-05-30 |
| M4b: Full-template login session refactor | 2026-05-30 |
| Release and publishing policy docs | 2026-06-11 |

### `nue-edgeserver` Role in the Cloudflare Pages Worker

`nue-edgeserver` (`packages/nueserver/nueserver.js`) is the edge-first HTTP server that provides route registration, matching, and request dispatch. It exports `fetch` (as `dispatch`) and `matches`, both used directly in the generated `_worker.js`:

```js
import { fetch as dispatch, matches } from 'nue-edgeserver'
```

The worker uses `matches(request.method, url.pathname)` to determine if the request should be dispatched to a Nue server route before falling through to static assets. This makes `nue-edgeserver` a runtime dependency of every Cloudflare Pages deployment that uses server routes. Even if no source changes were made to `nueserver.js` during Beta 3 beyond the scoped package rename, a version bump is warranted if the package is republished for the official release.

### Fork Policy Documentation Committed During Beta 3

Two significant internal policy documents were committed during the cycle:

1. **Branching policy** — `BRANCHING.md` / `docs-internal/` (commit `98cb4da`, 2026-05-25). Defines roles of `master`, `main`, `dev`, npm dist-tags, and GitHub Releases.
2. **Release and publishing policy (RPP)** — `docs-internal/release-and-publishing-policy.md` (commits `d1d8e8e`, `6f581c2`, 2026-06-11). Governs CRI, release notes, changelogs, GitHub Releases, upgrade guides, and final review checklist.

### Upstream PR Drafts (Branch `tor/upstream-pr-drafts`)

An audit note consolidating the Issue #1–#4 asset precedence fixes, plus draft PR body text for upstream `nuejs/nue` submission, was committed to branch `tor/upstream-pr-drafts` (not merged to `dev`). No upstream PR submission is planned at this time.

- Audit note: `notes/2026-04-25-nuekit-precedence-audit.md`
- PR draft directory: `notes/pr-drafts/`

### Issue #22 — `app.yaml` Collections Documentation Gap (Deferred)

Issues #21 and #22 are duplicates; #21 was closed as a duplicate. #22 remains open and is officially deferred to Beta 4.

The gap: `configuration.md` documents `collections:` as valid in `app.yaml`, but `packages/nuekit/src/asset.js` only calls `getCollections()` with the site-level `conf.collections`. App-level `app.yaml` is loaded as plain `app_data` and merged into the template context, but collection-building is never triggered from app config.

Beta 4 resolution options: (a) implement app-level collection support in `asset.js`, or (b) correct the documentation to reflect that `collections:` is site-level only.

### Platform Adapter Architecture Reference

```
Nuekit core (platform-agnostic build + serve)
    └── runPlatformBuild() — platform post-build hook
            └── adapter: cloudflare-pages
                    ├── ensureNotFoundPage() — always runs
                    └── if runtime.required:
                            ├── createWorkerSource() — generates ESM worker source
                            │       ├── import { fetch as dispatch, matches } from 'nue-edgeserver'
                            │       ├── import { createConfigResource, createResourceEnv } from resources.js
                            │       └── import { createModelResources } from cloudflare-pages/resources.js
                            └── Bun.build() — bundles to single _worker.js
```

`c.env` shaping inside the worker:

```js
const nueEnv = createResourceEnv({
  platform: 'cloudflare-pages',
  mode: 'production',
  raw: env,                          // raw Cloudflare env bindings
  resources: {
    config: createConfigResource(env),
    models: createModelResources(env, resources, platformResources)
  }
})
```

---

## Remaining Open Items Before Final Release

These items must be resolved before the official Beta 3 release is complete:

1. **Final checklist** — Run the RPP Final Review Checklist and record any residual risks.

---

## Source Material

| Reference | Link / Location |
|---|---|
| Issue #1 — Layout module precedence | https://github.com/tormnator/nue/issues/1 |
| Issue #2 — Asset precedence audit | https://github.com/tormnator/nue/issues/2 |
| Issue #3 — Root index.html SPA discovery leak | https://github.com/tormnator/nue/issues/3 |
| Issue #4 — Root index.html home/ assets | https://github.com/tormnator/nue/issues/4 |
| Issue #5 — Template-data access, inline components | https://github.com/tormnator/nue/issues/5 |
| Issue #6 — ESM imports in inline scripts | https://github.com/tormnator/nue/issues/6 |
| Issue #8 — Test setup standardization | https://github.com/tormnator/nue/issues/8 |
| Issue #9 — :bind feature docs | https://github.com/tormnator/nue/issues/9 |
| Issue #10 — Component attribute value semantics | https://github.com/tormnator/nue/issues/10 |
| Issue #12 — Server-rendered Markdown partials | https://github.com/tormnator/nue/issues/12 |
| Issue #13 — Page-scoped assets | https://github.com/tormnator/nue/issues/13 |
| Issue #14 — HMR navigation broadcast bug | https://github.com/tormnator/nue/issues/14 |
| Issue #15 — HMR CSS injection bug | https://github.com/tormnator/nue/issues/15 |
| Issue #16 — [image] tag alt/figcaption | https://github.com/tormnator/nue/issues/16 |
| Issue #17 — Multi-line HTML comment parseBlocks | https://github.com/tormnator/nue/issues/17 |
| Issue #19 — Docs: :bind attribute | https://github.com/tormnator/nue/issues/19 |
| Issue #20 — Docs: template-data.md errors | https://github.com/tormnator/nue/issues/20 |
| Issue #22 — app.yaml collections doc bug (open) | https://github.com/tormnator/nue/issues/22 |
| Issue #23 — Platform adapter foundation | https://github.com/tormnator/nue/issues/23 |
| Issue #24 — Cloudflare Pages adapter | https://github.com/tormnator/nue/issues/24 |
| Issue #25 — CF Pages Git integration validation | https://github.com/tormnator/nue/issues/25 |
| Issue #26 — nue build --clean fix | https://github.com/tormnator/nue/issues/26 |
| Issue #27 — Platform resource layer design | https://github.com/tormnator/nue/issues/27 |
| Issue #28 — Resource factory, config, D1 collections | https://github.com/tormnator/nue/issues/28 |
| Issue #29 — Template zip workflow | https://github.com/tormnator/nue/issues/29 |
| Issue #30 — Lightweight persistence + full-template sessions | https://github.com/tormnator/nue/issues/30 |
| Dev branch commits | https://github.com/tormnator/nue/commits/dev/ |
| @tormnator npm packages | https://www.npmjs.com/settings/tormnator/packages |
| Upstream PR drafts branch | https://github.com/tormnator/nue/tree/tor/upstream-pr-drafts |
| First npm publish record (internal) | `docs-internal/first-tormnator-npm-publish-record.md` |
| Platform adapter master plan (internal) | `docs-internal/platform-adapters/` |
| Lightweight persistence design (internal) | `docs-internal/platform-adapters/lightweight-persistence-layer.md` |
| Branching policy | `BRANCHING.md` / `docs-internal/` |
| Release and publishing policy (internal) | `docs-internal/release-and-publishing-policy.md` |

