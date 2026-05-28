# Platform Adapters Master Plan

Last updated: 2026-05-28

## Purpose

This document is the working status and schedule plan for the Platform Adapter effort. It tracks milestones, tasks, current state, validation, and next actions.

Design details, requirements, rules, terminology, and open questions belong in [Platform Adapters](./platform-adapters.md) and [Platform Resource Layer](./platform-resource-layer.md). Keep this document focused on what is planned, in progress, completed, canceled, or waiting.

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
| Planned | [M4a: Update Template Zip-files Workflow](#m4a-update-template-zip-files-workflow) | Update Template Zip-files Workflow |
| Planned | [M4b: Lightweight Persistence Layer](#m4b-lightweight-persistence-layer) | Design and implement the follow-up persistence provider/manager layer without making adapters own app/domain model semantics. |
| Planned | [M5: Final Documentation And Release Preparation](#m5-final-documentation-and-release-preparation) | Finish public docs, release notes, merge sequencing, and npm `dev` publish after validation. |

Status vocabulary:

- Planned: not started.
- In Progress: active branch or open implementation work exists.
- Waiting: blocked on a decision, external validation, or approval.
- Completed: implemented and validated enough for this plan.
- Canceled: intentionally dropped.

## Current Snapshot

Recently closed issue:

- Issue #28: Implement resource factory, config, and Cloudflare D1 collections.
- State: closed on 2026-05-28 after validation summary was posted.

Ready-to-merge branch:

- `feat/cloudflare-d1-collections`
- Tracking: `origin/feat/cloudflare-d1-collections`
- Current top commits:
  - `3b9827de Document Cloudflare D1 setup flow`
  - `b0465aed Skip Wrangler config files in builds`
  - `800c3a85 Add Cloudflare D1 validation note`

Completed validation on this branch:

| Area | Status | Notes |
|---|---|---|
| Full Nuekit tests | Completed | `171 pass, 0 fail`, `174 tests across 28 files` |
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
| npm publish with issue #28 changes | Postponed | Defer until after M4a or the next public/dev package cut; needed for post-publish Git integration validation, not direct D1 validation |

Not completed yet:

- Merge of completed M4 resource branch stack into `dev`.
- M4a template zip workflow fix.
- npm publish containing the completed M4 changes.
- Post-publish Cloudflare Git integration validation consuming the npm `dev` package.
- Public documentation promotion.

## Next Actions

Immediate next actions:

1. Commit this master-plan status update on `feat/cloudflare-d1-collections`.
2. Merge the completed M4 branch stack into `dev`.
3. Run the full test suite on `dev`, then push `dev` if validation passes.
4. Start M4a: update or document the template zip workflow so `nue create` uses current template content.
5. Postpone npm `dev` publish and Cloudflare Git integration validation until after M4a or the next package cut.
6. Start M4b after M4a is handled or deliberately paused.

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

This milestone addresses what the workflow for creating and updating the site templates' zip-file versions should be. Here are my rough notes to be cleaned up and expanded upon:

1. Whenever we update the template itself, the zip-file also needs to be updated. How is the zip-file created, do we have a command, or do we have documentation for this?
   - The zip-files are updated using `.github\workflows\build-template-zips.yml`. How is this file used, how can we make it work with @tormnator?
2. The nue CLI's help content should be updated to show `nue create` options.
3. What determines where the zip-file is located when running the CLI?
   - `nue create spa [local-path]`: zip is loaded from `local-path\spa.zip`
   - When local-path is not provided, then zip is loaded from the web at baseUrl and baseurl is currently hardcoded as `https://github.com/nuejs/nue/raw/master/packages/templates` in the CLI. But, with minor changes to the CLI source code it will be possible to provide a different baseurl. For instance we could modify create.js to detect a local dir vs a web url in the dir parameter and then load from local or from web based on the outcome.
4. We could modify `C:\Tools\Bin\nue.ps1` to automatically add the `C:\Git\nue\packages\templates` path if the current command is `nue create`. This assumes that we're keeping the local .zip files up to date.

### M4b: Lightweight Persistence Layer

This milestone follows issue #28. It should design and implement a small platform-neutral persistence layer that can sit above local and platform-specific providers without becoming an ORM, migration framework, auth system, or universal data model.

The goal is to separate three concerns that are currently mixed in local model code: concrete storage providers, generic persistence operations, and app/template domain models. Platform adapters should provide storage capabilities; app or template code should own domain behavior such as users, login, sessions, and authentication.

- Planned: Create a follow-up issue for the lightweight persistence layer after issue #28 is validated or deliberately paused.
- Planned: Settle provisional terminology such as persistence provider, persistence manager, and domain model.
- Planned: Define the smallest useful persistence API for JSON-like records without freezing the current `getAll`, `size`, `create`, `get`, `update`, and `remove` shape prematurely.
- Planned: Decide whether persisted objects should keep methods such as `item.update()` and `item.remove()`.
- Planned: Decide whether any persistence manager is exposed on `c.env`, passed only to domain-model factories, or kept internal.
- Planned: Define how platform-specific provider selection should work when an adapter supports multiple backings such as D1, KV, or Durable Objects.
- Planned: Align local JSON-backed development resources and Cloudflare D1-backed resources behind the chosen persistence boundary.
- Planned: Move or redesign specialized `users.login/logout/authenticate` behavior so it belongs to template/app domain code rather than core or every adapter.
- Planned: Keep schema creation, migrations, JSON seed import, and production auth/session strategy as explicit follow-up designs unless this milestone intentionally scopes in a minimal piece.
- Planned: Validate the resulting design against the `spa` and `full` template needs without claiming broad universal data-model support.

### M5: Final Documentation And Release Preparation

This milestone should happen after the completed M4 branch stack is merged, M4a is handled or deliberately postponed, and any M4b scope decision that affects public docs is settled. It covers public docs, release notes, npm `dev` publish, and final release validation under the documented policy.

- Planned: Promote or rewrite Cloudflare Pages docs into public docs when adapter scope is approved.
- Planned: Update beta 3 release notes or create them if no current draft exists.
- Planned: Document D1 table assumptions and migration limitations clearly.
- Planned: Document that local JSON mocks are not production auth/session implementations.
- Planned: Publish npm `dev` dist-tag from Git `dev` with approval.
- Planned: Validate Cloudflare Git integration after publish using a demo project consuming the npm `dev` package.
