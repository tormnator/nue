# Branching and Release Policy

This document defines the fork's branch roles, npm publishing cadence, GitHub Release policy, and beta milestone criteria.

## Release Surfaces

The fork has several related but distinct release surfaces:

| Surface | Role |
|---|---|
| Git `dev` branch | Active integration and validation branch |
| Git `main` branch | Latest official fork source state |
| npm dist-tag `dev` | Moving installable validation package line |
| npm dist-tag `latest` | Official installable fork package line |
| GitHub Releases | Human-readable records of official fork updates |

Keep these surfaces synchronized intentionally. A GitHub Release and npm `latest` promotion should describe the same `main` commit.

## Branch Roles

- `master`: upstream-aligned reference branch
- `main`: latest official/releasable branch in this fork
- `dev`: active development branch and normal source for npm dist-tag `dev` test publishes
- short-lived topic branches: branch from `dev`
- `v3-dev`: future v3-based development branch from `upstream/3.0` when needed

## Normal Development Flow

1. Start normal work from `dev`.
2. Create a short-lived child branch from `dev` for focused work.
3. Merge finished work back into `dev`.
4. Publish npm dist-tag `dev` test releases from the Git `dev` branch only when fast external validation needs installable packages.
5. Promote `dev` to `main` only when cutting an official fork update.

Do not merge every `dev` commit to `main` immediately. Treat `dev` as the preparation branch and `main` as the latest known-good fork state for external users and production-like consumers.

## Current Beta 3 Sprint Policy

The current beta 3 line is a fast private sprint. During this phase:

- Do not promote `dev` to `main` yet.
- Do not publish new npm packages unless an external validation need justifies it.
- Include the platform adapter work, Cloudflare Pages validation, platform resource layer, and docs update in beta 3.
- After the platform resource layer and docs update are complete or meaningfully under way, evaluate the status quo and decide whether to wrap up beta 3.

The current `@tormnator/nuekit` beta 3 package line is:

```text
2.0.0-beta.3-tor.N
```

Use `tor.N` for iterations inside beta 3. Move to `2.0.0-beta.4-tor.1` only when the milestone changes meaningfully, such as after a platform resource layer, public docs promotion, material adapter API change, or broader runtime model change.

## `dev` to `main`

Merge `dev` to `main` when the current work is ready to become the latest official fork state.

Before promoting `dev` to `main`:

- Ensure the work forms a coherent milestone or package-set update.
- Run the relevant tests and package dry runs.
- Finalize package versions and package manifests.
- Confirm npm dist-tag `dev` packages, if any, have been externally validated.
- Update internal release/publishing notes enough that the release can be reconstructed later.
- Make sure docs describe the actual behavior.
- Confirm no known blocker would make `main` a misleading official baseline.

Practical test: if future work branches from `main`, `main` should contain the baseline you would want that work to inherit.

## npm Publishing

Two npm publishing modes are allowed.

### Development/test publishing from `dev`

Use this for fast Cloudflare Pages and external test-site validation.

- Publish with the moving npm development dist-tag, currently `dev`.
- When both terms appear together, Git `dev` branch means the branch and npm dist-tag `dev` means the registry tag.
- Use exact package versions such as `2.0.0-beta.3-tor.1`; never republish the same `name@version`.
- Publish only from committed code with a clean working tree, except for unrelated untracked planning notes that are intentionally excluded.
- Run package dry runs or pack checks before real publish commands.
- Record the commit SHA and exact package versions published.
- Do not create a GitHub Release for every npm dist-tag `dev` development publish.

### Official/coordinated publishing from `main`

Use this for package sets intended to be the latest official fork state.

- Publish or promote packages from a clean `main` checkout at the commit that will be tagged or released.
- Prefer promoting already validated package versions with npm dist-tags when the exact package version was previously published from `dev` and validated.
- Use exact versions in release notes.
- Keep the GitHub Release, npm `latest` package versions, and `main` commit aligned.

Do not publish npm packages from arbitrary topic branches unless explicitly making a one-off experiment and recording that it is not part of the normal release line.

For detailed package versioning rules, see `docs-internal/npm-versioning-publishing-policy.md`.

## GitHub Releases

Create GitHub Releases only from `main`.

Use GitHub Releases for coordinated package-set releases, not for every npm dist-tag `dev` development publish. Release notes should list:

- source commit
- package versions published or promoted
- validation performed
- notable limitations
- links to relevant issues or internal release notes

## Official Release Flow

Use this flow when `dev` is ready to become the latest official fork state:

1. Finish and validate the coherent milestone on `dev`.
2. Publish npm dist-tag `dev` packages only if external validation requires installable packages.
3. Validate those packages with real consumers.
4. Merge `dev` to `main`.
5. Publish missing official packages or move npm `latest` dist-tags to the validated package versions.
6. Create a GitHub Release from `main`.
7. Record exact package versions, source commit, and validation results.

## Upstream PRs

Prepare upstream PR branches from `master` or another upstream-aligned base, not directly from `dev`.

## v3

Keep v3 work on `v3-dev` in parallel with `dev` until it is clear whether the later transition should be a merge or a branch-role rename.