# Branching Policy

This document defines the fork's branch roles and normal branch flow.

For release-cycle, npm publishing, changelog, release notes, Git tag, and GitHub
Release policy, see `docs-internal/release-and-publishing-policy.md`.

## Branch Roles

- `master`: upstream-aligned reference branch
- `main`: latest official/releasable branch in this fork
- `dev`: active development branch
- short-lived topic branches: branch from `dev`
- `v3-dev`: future v3-based development branch from `upstream/3.0` when needed

## Normal Development Flow

1. Start normal work from `dev`.
2. Create a short-lived child branch from `dev` for focused work.
3. Merge finished work back into `dev`.
4. Promote `dev` to `main` only when cutting an official fork update.

Do not merge every `dev` commit to `main` immediately. Treat `dev` as the preparation branch and `main` as the latest known-good fork state for external users and production-like consumers.

## `dev` to `main`

Merge `dev` to `main` when the current work is ready to become the latest official fork state.

Before promoting `dev` to `main`:

- Ensure the work forms a coherent milestone or package-set update.
- Run the relevant validation for the milestone.
- Complete the release and publishing checklist when the promotion is part of a release.
- Make sure docs describe the actual behavior.
- If templates or `nue create` changed, regenerate and validate committed template zips on the branch being promoted so the default official templates match `main`.
- Confirm no known blocker would make `main` a misleading official baseline.

Practical test: if future work branches from `main`, `main` should contain the baseline you would want that work to inherit.

## Upstream PRs

Prepare upstream PR branches from `master` or another upstream-aligned base, not directly from `dev`.

## v3

Keep v3 work on `v3-dev` in parallel with `dev` until it is clear whether the later transition should be a merge or a branch-role rename.