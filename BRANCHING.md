# Branching

## Roles

- `master`: upstream-aligned reference branch
- `main`: latest official branch in this fork
- `dev`: active development branch
- short-lived topic branches: branch from `dev`
- `v3-dev`: future v3-based development branch from `upstream/3.0` when needed

## Normal Flow

1. Start normal work from `dev`.
2. Create a short-lived child branch from `dev` for focused work.
3. Merge finished work back into `dev`.
4. Promote `dev` to `main` when cutting an official update.

## Upstream PRs

Prepare upstream PR branches from `master` or another upstream-aligned base, not directly from `dev`.

## v3

Keep v3 work on `v3-dev` in parallel with `dev` until it is clear whether the later transition should be a merge or a branch-role rename.