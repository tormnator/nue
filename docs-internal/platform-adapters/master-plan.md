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
| In Progress | [M4: Platform Resources](#m4-platform-resources) | Implement issue #28 resource factory/config/model declarations, local `c.env.models`, Cloudflare `c.env.platform`, and D1 collection resources. |
| Planned | [M4b: Lightweight Persistence Layer](#m4b-lightweight-persistence-layer) | Design and implement the follow-up persistence provider/manager layer without making adapters own app/domain model semantics. |
| Planned | [M5: Final Documentation And Release Preparation](#m5-final-documentation-and-release-preparation) | Finish public docs, release notes, merge sequencing, and npm `dev` publish after validation. |

Status vocabulary:

- Planned: not started.
- In Progress: active branch or open implementation work exists.
- Waiting: blocked on a decision, external validation, or approval.
- Completed: implemented and validated enough for this plan.
- Canceled: intentionally dropped.

## Current Snapshot

Active issue:

- Issue #28: Implement resource factory, config, and Cloudflare D1 collections.
- State: open.

Active branch:

- `feat/cloudflare-d1-collections`
- Tracking: `origin/feat/cloudflare-d1-collections`
- Current top commits:
  - `4fb1be06 Fix full template lead model writes`
  - `1421fa13 Add Cloudflare D1 collection resources`

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
| Real Cloudflare D1 deploy | Planned | Validate with Wrangler Direct Upload from the local branch before merge/publish confidence |
| npm publish with issue #28 changes | Planned | Should wait for `dev` merge; needed for Git integration validation, not direct D1 validation |

Not completed yet:

- Real Cloudflare Pages deployment using an actual D1 binding.
- Merge of resource branches into `dev`.
- npm publish containing issue #28 changes.
- Post-publish Cloudflare Git integration validation consuming the npm `dev` package.
- Final issue #28 update/closure.
- Public documentation promotion.

## Next Actions

Immediate next actions:

1. Keep issue #28 scoped to the current resource env/config/models/D1 slice.
2. Prepare a tiny Cloudflare D1 schema/setup note for validation.
3. Run real Cloudflare D1 deployment validation through Wrangler Direct Upload from the local branch.
4. Update issue #28 with validation results, limitations, and the planned M4b persistence-layer follow-up.
5. Decide whether to merge into `dev`.
6. Publish npm `dev` only after merge and approval, then run Git integration validation against the published package.
7. Start M4b after issue #28 is validated or deliberately paused.

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

This milestone is issue #28. It extends the adapter work from request routing into route resources. The first slice is intentionally small: config, resource env shaping, local model declarations, raw platform env access, and Cloudflare D1-backed collection models.

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
- In Progress: Keep issue #28 open until real D1 validation and limitation docs are complete.
- Planned: Validate against real Cloudflare Pages D1 through Wrangler Direct Upload before npm publish.
- Planned: Update issue #28 with commits, tests, limitations, and follow-up issues.
- Planned: Decide whether production auth/session remains out of scope and gets its own issue.
- Planned: Hand off broader persistence/provider/domain-model questions to M4b.

Issue #28 can likely close when:

- Completed: Local resource factory/config/models behavior is implemented and tested.
- Completed: Cloudflare adapter exposes raw platform env under `c.env.platform`.
- Completed: Cloudflare adapter maps declared collection models to D1-backed resources.
- Completed: Missing binding and D1 compatibility errors are clear.
- Completed: Templates use the new resource configuration shape.
- Completed: Package dry-run confirms moved Cloudflare adapter files ship.
- Planned: At least one real Cloudflare D1 deployment validates the route/resource flow through Wrangler Direct Upload.
- Planned: Known limitations are documented: schema creation/migrations, JSON seed import, production auth/session, and full-template auth behavior.

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

This milestone should happen after M4 validation, merge approval, and any M4b scope decision that affects public docs. It covers public docs, release notes, merge to `dev`, and npm `dev` publish under the documented policy.

- Planned: Promote or rewrite Cloudflare Pages docs into public docs when adapter scope is approved.
- Planned: Update beta 3 release notes or create them if no current draft exists.
- Planned: Document D1 table assumptions and migration limitations clearly.
- Planned: Document that local JSON mocks are not production auth/session implementations.
- Planned: Merge validated resource branches into `dev` with approval.
- Planned: Publish npm `dev` dist-tag from Git `dev` with approval.
- Planned: Validate Cloudflare Git integration after publish using a demo project consuming the npm `dev` package.
