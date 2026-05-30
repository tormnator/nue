# Platform Adapters Master Plan

Last updated: 2026-05-29

## Purpose

This document is the working status and schedule plan for the Platform Adapter effort. It tracks milestones, tasks, current state, validation, and next actions.

Design details, requirements, rules, terminology, and open questions belong in [Platform Adapters](./platform-adapters.md) and [Platform Resource Layer](./platform-resource-layer.md). Keep this document focused on what is planned, in progress, completed, canceled, or waiting.

The Milestones section should be a table with one milestone per row. The Milestones And Tasks section should be a compressed outline of milestones and tasks, allowing only a condensed description at the top of each milestone. If a milestone needs to document more details in this document, first consider if the details better fit in another document. If the need is still there, add the milestone details in a subsection of the Milestone Details section, creating it if needed.

## Contents
<!-- Start Document Outline -->

* [Purpose](#purpose)
* [Contents](#contents)
* [Main Objective](#main-objective)
* [Milestones](#milestones)
* [Current Snapshot](#current-snapshot)
* [Next Actions](#next-actions)
* [Milestones And Tasks](#milestones-and-tasks)
  * [M1: Core Platform Adapter Foundation](#m1-core-platform-adapter-foundation)
  * [M2: Cloudflare Pages Platform Adapter](#m2-cloudflare-pages-platform-adapter)
  * [M3: Cloudflare Pages Git Integration And npm Dev Package Path](#m3-cloudflare-pages-git-integration-and-npm-dev-package-path)
  * [M4: Platform Resources](#m4-platform-resources)
  * [M4a: Update Template Zip-files Workflow](#m4a-update-template-zip-files-workflow)
  * [M4b: Lightweight Persistence Layer](#m4b-lightweight-persistence-layer)
  * [M5: Final Documentation And Release Preparation](#m5-final-documentation-and-release-preparation)

<!-- End Document Outline -->

## Main Objective

Design, implement, validate, and document Nue's Platform Adapter feature, including the Cloudflare Pages adapter and the first platform resource layer slice.

## Milestones

| Status | Milestone | Description |
|---|---|---|
| Completed | [M1: Core Platform Adapter Foundation](#m1-core-platform-adapter-foundation) | Add target-neutral adapter configuration, registry, build context, runtime detection, fallback manifests, docs, and tests. |
| Completed | [M2: Cloudflare Pages Platform Adapter](#m2-cloudflare-pages-platform-adapter) | Implement Cloudflare Pages Advanced Mode output, generated worker behavior, asset fallback, Nueserver dispatch, SPA fallback, root 404 behavior, and user-doc draft. |
| Completed | [M3: Cloudflare Pages Git Integration And npm Dev Package Path](#m3-cloudflare-pages-git-integration-and-npm-dev-package-path) | Validate Git-integrated Cloudflare Pages deployment using published `@tormnator` packages and document npm publishing workflow. |
| Completed | [M4: Platform Resources](#m4-platform-resources) | Implement issue #28 resource factory/config/model declarations, local `c.env.models`, Cloudflare `c.env.platform`, and D1 collection resources. |
| Completed | [M4a: Update Template Zip-files Workflow](#m4a-update-template-zip-files-workflow) | Update Template Zip-files Workflow |
| In Progress | [M4b: Lightweight Persistence Layer](#m4b-lightweight-persistence-layer) | Design and implement the follow-up persistence provider/collection layer without making adapters own app/domain model semantics. |
| Planned | [M5: Final Documentation And Release Preparation](#m5-final-documentation-and-release-preparation) | Finish public docs, release notes, merge sequencing, and npm `dev` publish after validation. |

Status vocabulary:

- Planned: not started.
- In Progress: active branch or open implementation work exists.
- Waiting: blocked on a decision, external validation, or approval.
- Completed: implemented and validated enough for this plan.
- Canceled: intentionally dropped.

## Current Snapshot

Recently completed issues:

- Issue #27: Design platform resource layer for `c.env`.
  - State: design acceptance criteria satisfied by [Platform Resource Layer](./platform-resource-layer.md) and the issue #28 implementation slice; ready to close as design-complete.
- Issue #28: Implement resource factory, config, and Cloudflare D1 collections.
  - State: closed on 2026-05-28 after validation summary was posted.
- Issue #29: Make template zip generation explicit, portable, and branch-aware.
  - State: implementation complete on `feat/template-zip-workflow`; ready to close after merge to `dev`.

Current branch:

- `design/m4b-lightweight-persistence`
- Purpose: M4b lightweight persistence design, tracking cleanup, and implementation issue preparation.

Completed validation for M4 and M4a:

| Area | Status | Notes |
|---|---|---|
| Full Nuekit tests | Completed | M4: `171 pass, 0 fail`, `174 tests across 28 files`; M4a: `175 pass, 0 fail`, `178 tests across 28 files` |
| Focused Cloudflare tests | Completed | `12 pass, 0 fail` |
| Whitespace check | Completed | `git diff --check` clean |
| Package dry-run | Completed | Moved Cloudflare adapter folder included |
| SPA template build | Completed | Emits `.dist/_worker.js` |
| Full template build | Completed | Emits `.dist/_worker.js` |
| Full template lead smoke | Completed | Mock D1 `POST /api/leads` returned `200` |
| Real Cloudflare D1 deploy | Completed | Wrangler Direct Upload validated D1-backed `spa` routes at `https://d1-validation.nue-d1-validation.pages.dev` |
| Live D1 route recheck | Completed | 2026-05-28 recheck confirmed `/users`, `/users/1`, `/users/999999`, `/missing.txt`, and `/123` behavior |
| Cloudflare user-doc draft D1 setup | Completed | Added app-developer setup flow for Pages project creation, D1 database/table creation, Wrangler config, seed SQL, deploy, and smoke checks |
| Issue #28 GitHub close-out | Completed | Validation summary posted and issue closed on 2026-05-28 |
| Issue #29 GitHub tracking | Completed | Issue created with reasoning, planned changes, user-visible changes, and validation notes |
| Template zip workflow | Completed | Local `bun run templates:zip`, manual branch-scoped GitHub Action, zip validation, UTF-8 names, empty directory support, and regenerated artifacts |
| `nue create` template source selection | Completed | Defaults to fork `main`; accepts dev/raw remote URLs and local `packages/templates` checkouts |
| npm publish with issue #28 changes | Postponed | Defer until after M4a or the next public/dev package cut; needed for post-publish Git integration validation, not direct D1 validation |

Not completed yet:

- Complete M4b implementation tracked in issue #30.
- Create the M4b implementation branch from `dev` after design/tracking docs are accepted.
- Implement the lightweight persistence layer and full-template login-session changes.
- npm publish containing the completed M4 changes.
- Post-publish Cloudflare Git integration validation consuming the npm `dev` package.
- Public documentation promotion.

## Next Actions

Immediate next actions:

1. Finish the M4b design/tracking split on `design/m4b-lightweight-persistence`.
2. After approval, create `feat/lightweight-persistence-layer` from `dev` and start implementation.
3. Complete the M4b implementation in three checkpoints: collection/provider boundary, full-template login sessions, then validation/docs.
4. Postpone npm `dev` publish and Cloudflare Git integration validation until the next package cut.

## Milestones And Tasks

### M1: Core Platform Adapter Foundation

This milestone created the platform-neutral adapter foundation. It should remain free of Cloudflare terminology and behavior except through adapter registration and generic platform selection.

- Completed: Choose **Platform Adapter** as the feature name.
- Completed: Establish site-level `platform` configuration.
- Completed: Keep core terminology target-neutral.
- Completed: Add adapter registry and build lifecycle hooks.
- Completed: Add runtime requirement detection.
- Completed: Add fallback manifest concepts.
- Completed: Validate static-first behavior with tests.
- Completed: Document the initial architecture.

### M2: Cloudflare Pages Platform Adapter

This milestone delivered the first concrete adapter. It proved that static MPA sites remain static, runtime sites can use Pages Advanced Mode, and Nue can preserve its own Nueserver routing and SPA fallback behavior in one generated worker.

- Completed: Implement Cloudflare Pages adapter using Pages Advanced Mode only.
- Completed: Generate `_worker.js` only when runtime output is needed in `auto` mode.
- Completed: Dispatch bundled Nueserver routes before static asset fallback.
- Completed: Fall through to `env.ASSETS.fetch(request)` for static files.
- Completed: Apply SPA fallback only for extensionless `GET`/`HEAD` 404s.
- Completed: Emit root `404.html` when needed to avoid Cloudflare implicit SPA behavior.
- Completed: Validate Wrangler direct deployment for static and runtime checks.
- Completed: Draft user-facing Cloudflare Pages docs.
- Canceled: Support Cloudflare `/functions` folder output.

### M3: Cloudflare Pages Git Integration And npm Dev Package Path

This milestone appeared during the adapter work because Cloudflare Git integration needed installable packages. It established the `@tormnator` npm package path and the rule that normal `dev` dist-tag publishes come from Git `dev`.

- Completed: Publish first `@tormnator` package set from Git `dev` for external testing.
- Completed: Validate a private GitHub demo consuming `@tormnator/nuekit@dev`.
- Completed: Validate production deployment from `main`.
- Completed: Validate automatic redeploy after commit/push.
- Completed: Validate Preview deployment from `dev`.
- Completed: Document npm versioning and publishing workflow.
- Completed: Document Cloudflare deployment handoff.
- Waiting: Reuse the package path after issue #28 merges to `dev`.

### M4: Platform Resources

This milestone is issue #28 and is complete. It extends the adapter work from request routing into route resources. The first slice is intentionally small: config, resource env shaping, local model declarations, raw platform env access, and Cloudflare D1-backed collection models.

The current implementation assumes D1 tables with `id`, `created`, and `data`. Schema creation, migrations, JSON seed import, and production auth/session semantics are not implemented in the first slice.

- Completed: Add target-neutral `createResourceEnv()`.
- Completed: Add `createConfigResource()` with `get`, `require`, and `public`.
- Completed: Add top-level `resources.models` declarations.
- Completed: Shape local development env as `c.env.models`.
- Completed: Expose raw Cloudflare env under `c.env.platform`.
- Completed: Move Cloudflare-specific resource code out of core.
- Completed: Implement Cloudflare D1 collection methods.
- Completed: Update templates to use `resources` plus `platform.resources`.
- Completed: Fix full template `POST /api/leads` to use `leads.create()`.
- Completed: Validate tests, package dry-run, template builds, and mock worker smoke path.
- Completed: Validate against real Cloudflare Pages D1 through Wrangler Direct Upload before npm publish, using [Cloudflare D1 Validation Note](./cloudflare-d1-validation.md).
- Completed: Posted issue #28 close-out with commits, tests, limitations, and M4a/M4b follow-ups.
- Completed: Keep production auth/session out of scope for issue #28; handle it through follow-up persistence/domain-model work if needed.
- Planned: Hand off broader persistence/provider/domain-model questions to M4b.

Issue #28 closed after:

- Completed: Local resource factory/config/models behavior is implemented and tested.
- Completed: Cloudflare adapter exposes raw platform env under `c.env.platform`.
- Completed: Cloudflare adapter maps declared collection models to D1-backed resources.
- Completed: Missing binding and D1 compatibility errors are clear.
- Completed: Templates use the new resource configuration shape.
- Completed: Package dry-run confirms moved Cloudflare adapter files ship.
- Completed: At least one real Cloudflare D1 deployment validates the route/resource flow through Wrangler Direct Upload.
- Completed: Known limitations are documented: schema creation/migrations, JSON seed import, production auth/session, and full-template auth behavior.

### M4a: Update Template Zip-files Workflow

This milestone addresses template source freshness for `nue create`. Template folders are the source of truth. Zip files are release artifacts for remote template creation and must match the branch/version a developer intentionally uses.

- Completed: Added a local `bun run templates:zip` command that regenerates `packages/templates/*.zip` from the live template folders.
- Completed: Updated `.github/workflows/build-template-zips.yml` to be a manual GitHub Actions workflow that uses the same local command. Run it deliberately on the branch whose template artifacts should be refreshed, such as `main` for official templates or `dev` for dev-tag testing.
- Completed: Updated `nue create` so the default remote source is `tormnator/nue` `main`, and the optional second argument can be either a remote template URL or a local template checkout.
- Completed: Prefer live local template folders over local zip files when a local checkout is passed, while skipping generated folders such as `.dist`.
- Completed: Updated CLI help and docs so developers know how to create from official templates, dev branch templates, or a local checkout.
- Completed: Regenerated current template zips from the updated live template folders.
- Completed: Validated local folder creation, regenerated zip extraction, and focused create tests.

### M4b: Lightweight Persistence Layer

This milestone implements the lightweight collection boundary and moves full-template demo login sessions into template-owned domain code. Design details are in [Lightweight Persistence Layer Design And Plan](./lightweight-persistence-layer.md); execution details are tracked in issue #30.

- Completed: Create the M4b design artifact on `design/m4b-lightweight-persistence`.
- Completed: Create issue #30, [Implement lightweight collection resources and full-template login sessions](https://github.com/tormnator/nue/issues/30).
- Planned: Create `feat/lightweight-persistence-layer` from `dev` after design/tracking docs are accepted.
- Planned: Implement the shared collection resource boundary for local JSON/in-memory and Cloudflare D1 collections.
- Planned: Move full-template login/logout/authenticate behavior into template-local code backed by `users` and `loginSessions` collections.
- Planned: Validate `spa` and `full` template flows, then update master plan, beta 3 notes, and Cloudflare user-doc limitations.

### M5: Final Documentation And Release Preparation

This milestone should happen after the completed M4 branch stack is merged, M4a is handled or deliberately postponed, and any M4b scope decision that affects public docs is settled. It covers public docs, release notes, npm `dev` publish, and final release validation under the documented policy.

- Planned: Promote or rewrite Cloudflare Pages docs into public docs when adapter scope is approved.
- Planned: Update beta 3 release notes or create them if no current draft exists.
- Planned: Document D1 table assumptions and migration limitations clearly.
- Planned: Document that local JSON mocks are not production auth/session implementations.
- Planned: Publish npm `dev` dist-tag from Git `dev` with approval.
- Planned: Validate Cloudflare Git integration after publish using a demo project consuming the npm `dev` package.
