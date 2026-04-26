# Nuekit Precedence Audit Draft

## Recommended location

This draft is stored in `notes/` at the repo root instead of `packages/www/docs/`.

Reasoning:
- `packages/www/docs/` is the public documentation site for Nue users and should contain only settled user-facing docs.
- This document is primarily release engineering and PR-preparation material.
- A repo-local note is easier to revise, split, or delete once the upstream PR strategy is finalized.

Recommended use:
- Keep this file as the working summary for upstream PR preparation.
- Extract only the user-facing parts into `packages/www/docs/` if and when they belong in the public docs.
- Link or summarize this file in issue discussions if needed, rather than moving the full draft into issue comments.

Companion upstream PR body drafts live in `notes/pr-drafts/`.


## Scope of work

This document summarizes the changes implemented during the layout and asset precedence investigation, covering these fork issues:

1. Issue #1: Layout module precedence should prefer more specific directories over broader ones, with parent directory beating its `ui/` subfolder
2. Issue #3: Fix root `index.html` discovery leaking unrelated UI/layout assets
3. Issue #2: Audit and align asset precedence semantics across asset categories


## Executive summary

The work started with a mismatch between documented layout specificity and actual layout slot resolution. That led to an HTML precedence fix, then to a root `index.html` discovery regression fix, and finally to a broader audit of category-specific precedence behavior across CSS, JS, YAML, JSON, and app configuration.

The final result is:
- HTML layout modules now resolve by page-relative specificity instead of incidental discovery order.
- Root `index.html` no longer leaks unrelated nested UI/layout assets through the SPA discovery path.
- Shared data now behaves as a base layer instead of a late override.
- Nested `app.yaml` files now cascade from broader scope to deeper scope.
- Global site sorting and dependency ordering now explicitly support broad-to-specific accumulation semantics for CSS and JS.
- JSON template data now participates in the same discovery and merge hierarchy as YAML.
- Official docs were aligned for the affected categories.


## Issue #1

### Title

Layout module precedence should prefer more specific directories over broader ones, with parent directory beating its `ui/` subfolder

### Problem

When multiple discovered HTML library files defined the same slot, the effective winner could be determined by asset order rather than by documented specificity. This allowed broader layout modules such as `@shared/ui/layout.html` to beat more local app-specific modules.

### Implemented behavior

HTML libraries are now treated as a winner-selection category with page-relative ranking:

1. Page directory `*.html`
2. Page directory `ui/*.html`
3. Parent app directory `*.html`
4. Parent app directory `ui/*.html`
5. Root-level layout files such as `layout.html` or `site.html`
6. `@shared/ui/*.html`

Within the same scope, a directory beats its own `ui/` subfolder.

### Main implementation

- `packages/nuekit/src/asset.js`
  - added HTML ranking logic for discovered library assets before slot resolution

### Main tests

- `packages/nuekit/test/render/md.test.js`
  - app layout beats app `ui`, root, and shared layouts
  - page layout beats page `ui`, app, root, and shared layouts
  - root layout beats shared layout fallback

### Main docs

- `packages/www/docs/layout-system.md`
- `packages/www/docs/page-dependencies.md`

### Main commit

- `7969979d` — `Implement page-relative precedence for HTML layout discovery`


## Issue #3

### Title

Fix root `index.html` discovery leaking unrelated UI/layout assets

### Problem

After the HTML precedence fix, root `index.html` pages could still render the wrong layout if unrelated nested UI/layout assets leaked into the dependency set through the SPA discovery branch in `deps.js`.

The concrete symptom was a root page rendering a header from an unrelated subtree like `shopping/ui/layout.html` instead of the shared fallback.

### Implemented behavior

- SPA subtree inclusion is now limited to explicit SPA entry points.
- Root multi-page `index.html` pages no longer auto-discover unrelated nested app UI/layout assets.
- Legitimate subtree inclusion for actual SPA entry pages is preserved.

### Main implementation

- `packages/nuekit/src/asset.js`
  - computes whether an HTML file is truly an SPA entry
- `packages/nuekit/src/deps.js`
  - gates SPA subtree discovery behind that explicit SPA entry signal

### Main tests

- `packages/nuekit/test/deps.test.js`
  - root `index.html` does not discover unrelated nested UI layouts
- `packages/nuekit/test/render/asset-render.test.js`
  - root `index.html` does not render unrelated nested UI layout header

### Main commit

- `2e70c091` — `Fix root index.html SPA discovery leak`


## Issue #2

### Title

Audit and align asset precedence semantics across asset categories

### Purpose

Issue #2 served as the umbrella tracking issue and working requirement specification for the broader precedence audit.

It is now closed because the planned independently shippable behavior slices were completed.

### Completed slices

#### 1. Shared data base-layer precedence

Shared static data from `@shared/data` now establishes the base layer before root/app/page data overrides it. Shared JS/TS data modifier scripts still run after the merged data object exists.

Main commit:
- `55344bde` — `Fix shared data base-layer precedence`

Main files:
- `packages/nuekit/src/asset.js`
- `packages/nuekit/src/site.js`
- `packages/nuekit/test/conf.test.js`

#### 2. Nested app config precedence

`asset.config()` now cascades through all matching `app.yaml` files from broader scope to deeper scope, instead of stopping at the first matching file.

Main commit:
- `e5ae7a7e` — `Fix nested app config precedence`

Main files:
- `packages/nuekit/src/asset.js`
- `packages/nuekit/test/conf.test.js`

#### 3. Explicit shared priority in site sorting

`sortAssets()` now gives `@shared/*` files an explicit priority bucket instead of relying on lexical ordering.

Main commit:
- `785b98dc` — `Fix sortAssets shared priority`

Main files:
- `packages/nuekit/src/site.js`
- `packages/nuekit/test/site.test.js`

#### 4. CSS and JS precedence

CSS and JS dependencies now come back in explicit broad-to-specific order:

1. `@shared/*`
2. root-level assets
3. nested app/page scopes

Equal-rank ties preserve original discovery order so same-scope HTML component order is not disturbed.

`renderStyles()` also now honors `design.base` by promoting one configured stylesheet to the front while preserving the remaining CSS order.

Main commit:
- `bdb77d78` — `Fix CSS and JS asset precedence`

Main files:
- `packages/nuekit/src/deps.js`
- `packages/nuekit/src/render/head.js`
- `packages/nuekit/test/deps.test.js`
- `packages/nuekit/test/render/head.test.js`

#### 5. JSON template data support

`.json` files now participate in page dependency discovery and template data merging alongside `.yaml` files.

Main commit:
- `b875c1a7` — `Add JSON template data support`

Main files:
- `packages/nuekit/src/asset.js`
- `packages/nuekit/src/deps.js`
- `packages/nuekit/test/conf.test.js`
- `packages/www/docs/template-data.md`
- `packages/www/docs/page-dependencies.md`

#### 6. Final follow-up clarification

Documented how `design.base` matching works and added short intent comments at the non-obvious precedence helpers.

Main commit:
- `13b27d4b` — `Clarify design base matching`

Main files:
- `packages/www/docs/css-development.md`
- `packages/nuekit/src/asset.js`
- `packages/nuekit/src/deps.js`
- `packages/nuekit/src/render/head.js`
- `packages/nuekit/src/site.js`


## Validation summary

Focused validations were run as each slice landed.

The final validation state on the merged integration branch was:

- `bun run test`
- result: `137 pass, 3 skip, 0 fail`


## Branch summary

Relevant branches used during this work:

- `tor/fix-layout-module-precedence`
  - baseline branch for HTML precedence and subsequent dependent work
- `tor/fix-root-index-html-discovery`
  - focused issue #3 branch
- `tor/audit-asset-precedence`
  - focused umbrella audit branch for issue #2 slices
- `tor/clarify-design-base-docs`
  - focused follow-up branch for docs and intent comments
- `tor/local-integration`
  - final integration branch containing the merged chain


## Suggested upstream PR slicing

If this work is later proposed upstream, the cleanest PR decomposition is probably not “one PR per fork issue number”. Instead, group by coherent behavior change.

Recommended PR slicing:

1. HTML layout precedence and root `index.html` discovery
   - commits centered around `7969979d` and `2e70c091`
   - rationale: both changes are tightly coupled to HTML layout selection correctness

2. Data and configuration precedence
   - commits centered around `55344bde`, `e5ae7a7e`, and `b875c1a7`
   - rationale: shared data base-layer behavior, nested `app.yaml` cascade, and JSON parity all belong to template/config data semantics

3. CSS and JS ordering plus supporting docs
   - commits centered around `785b98dc`, `bdb77d78`, and `13b27d4b`
   - rationale: global asset ordering, CSS/JS precedence, and `design.base` clarification are one coherent asset-loading story

That said, if upstream prefers smaller PRs, issue #3 can stand alone as its own bugfix PR.


## Suggested user-facing summary

If this later needs to be explained to Nue users in a release note, the short version is:

- HTML layout slot resolution is now based on page-relative specificity instead of accidental asset order.
- Root `index.html` no longer picks up unrelated nested UI/layout assets.
- CSS and JS now load from broader scopes to narrower scopes more predictably.
- Shared template data now behaves as a base layer.
- Nested `app.yaml` files now cascade from parent scope to child scope.
- JSON template data now works alongside YAML in the same discovery and merge model.


## What should not be copied verbatim into public docs

This file includes:
- branch names
- commit IDs
- PR-splitting guidance
- engineering review context

Those parts are for maintainers and fork workflow only. They should not be copied directly into `packages/www/docs/`.