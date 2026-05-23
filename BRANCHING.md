# Branching

## Roles

- `master`: upstream-aligned reference branch
- `main`: latest official/releasable branch in this fork
- `dev`: active development branch and normal source for npm dist-tag `dev` test publishes
- short-lived topic branches: branch from `dev`
- `v3-dev`: future v3-based development branch from `upstream/3.0` when needed

## Normal Flow

1. Start normal work from `dev`.
2. Create a short-lived child branch from `dev` for focused work.
3. Merge finished work back into `dev`.
4. Publish npm dist-tag `dev` test releases from the Git `dev` branch when fast external validation is needed.
5. Promote `dev` to `main` when cutting an official fork update.

## `dev` to `main`

Merge `dev` to `main` when the current work is ready to become the latest official fork state.

Before promoting `dev` to `main`:

- Ensure the work forms a coherent milestone or package-set update.
- Run the relevant tests and package dry runs.
- Finalize package versions and package manifests.
- Update internal release/publishing notes enough that the release can be reconstructed later.

Do not merge every `dev` commit to `main` immediately. Treat `dev` as the preparation branch and `main` as the latest known-good fork state for external users and production-like consumers.

## npm Publishing

Two npm publishing modes are allowed:

1. **Development/test publishing from `dev`**
	- Use this for fast Cloudflare Pages and external test-site validation.
	- Publish with the moving npm development dist-tag, currently `dev`.
	- When both terms appear together, `dev` branch means the Git branch and npm dist-tag `dev` means the registry tag.
	- Use exact package versions such as `2.0.0-beta.3-tor.1`; never republish the same `name@version`.
	- Publish only from committed code with a clean working tree, except for unrelated untracked planning notes that are intentionally excluded.
	- Run package dry runs or pack checks before real publish commands.
	- Record the commit SHA and exact package versions published.

2. **Official/coordinated publishing from `main`**
	- Use this for package sets intended to be the latest official fork state.
	- Publish from a clean `main` checkout at the commit that will be tagged or released.
	- Use exact versions in release notes.

Do not publish npm packages from arbitrary topic branches unless explicitly making a one-off experiment and recording that it is not part of the normal release line.

## GitHub Releases

Create GitHub releases only from `main`.

Use GitHub releases for coordinated package-set releases, not for every npm dist-tag `dev` development publish. Release notes should list the exact npm packages and versions published.

## Upstream PRs

Prepare upstream PR branches from `master` or another upstream-aligned base, not directly from `dev`.

## v3

Keep v3 work on `v3-dev` in parallel with `dev` until it is clear whether the later transition should be a merge or a branch-role rename.