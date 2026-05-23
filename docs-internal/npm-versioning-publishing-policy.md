# npm Versioning and Publishing Policy for `@tormnator/nue`

## Context

This repo is my fork of Nue: `tormnator/nue`.

The short-term goal is to publish the Nue package set from this fork so that external test sites, including Cloudflare Pages Git integration deployments, can install the required Nue packages with Bun and run `nue-tor build`.

The current development phase is experimental and fast-moving. I expect frequent updates while testing Cloudflare Pages adapter features, deployment behavior, packaging, and private test sites such as `torlanglo.com` and possibly the Archie/ASCS site.

For the Summary Policy, see the section with same name at the bottom of the document.

## Package Scope and Registry

The forked packages will be published publicly to npm under the `@tormnator` scope.

Example package names:

```text
@tormnator/nuekit
@tormnator/nuemark
@tormnator/nuedom
@tormnator/nuestate
@tormnator/nueyaml
@tormnator/nue-glow
@tormnator/nue-edgeserver
```

The package scope `@tormnator` identifies these as Tor’s forked Nue packages, not official Nue releases. This keeps the current work clearly separated from any future official Nue continuation, community takeover, rename, or Archie integration.

Prefer public npm packages for the first Cloudflare Pages Git integration path. Avoid GitHub Packages unless there is a strong reason, because it usually requires registry configuration and often auth token handling in the build environment. Avoid vendoring Nue into test projects except as a temporary fallback; vendoring can validate an artifact, but not the normal package distribution path.

## Package Set

Likely publishable packages from this monorepo:

| Package | Source directory | First `@tormnator` version | Notes |
|---|---|---:|---|
| `@tormnator/nuekit` | `packages/nuekit` | `2.0.0-beta.3-tor.1` | CLI package; publish with `"bin": { "nue-tor": "./src/cli.js" }`. |
| `@tormnator/nuedom` | `packages/nuedom` | `0.1.1-tor.1` | Runtime/compiler package. |
| `@tormnator/nuemark` | `packages/nuemark` | `0.7.1-tor.1` | Markdown package. |
| `@tormnator/nue-glow` | `packages/nueglow` | `0.2.5-tor.1` | Syntax highlighting/styles package. |
| `@tormnator/nue-edgeserver` | `packages/nueserver` | `0.1.0-tor.1` | Package name differs from directory name. |
| `@tormnator/nuestate` | `packages/nuestate` | `0.1.1-tor.1` | URL-first state package. |
| `@tormnator/nueyaml` | `packages/nueyaml` | `0.1.0-tor.1` | YAML package. |

Not likely publish targets:

- Root `nue-monorepo`: private workspace root.
- `packages/www`: private docs/site package.
- `packages/templates/full`: template package shape, not a versioned library package.

Current internal dependency graph:

```text
@tormnator/nuekit
  depends on:
    @tormnator/nue-edgeserver
    @tormnator/nuestate
    @tormnator/nueyaml
    @tormnator/nuedom
    @tormnator/nuemark
    @tormnator/nue-glow

@tormnator/nuemark
  depends on:
    @tormnator/nueyaml
    @tormnator/nue-glow
```

## Versioning Policy

Use SemVer-compatible versions.

Do **not** use build metadata such as:

```
+fork.local
```

Build metadata after `+` is ignored for SemVer precedence and is not appropriate for npm release progression.

Instead, use prerelease identifiers such as:

```
-tor.1
-tor.2
-tor.3
```

The `tor.N` suffix means:

```
tor = Tor fork line
N   = incrementing published fork release number for this base version
```

Example:

```
0.7.0-tor.1
0.7.0-tor.2
0.7.0-tor.3
```

This means all three are forked releases based on the same `0.7.0` package lineage, with incrementing Tor fork publication numbers.

The `tor.N` value is not a separate API version. It is a fork release counter.

## First Fork Versions

For unchanged packages, the first `@tormnator` npm publications should preserve the current upstream version lineage and add `-tor.1`.

Packages with meaningful package-level changes should bump the base version as appropriate, then add `-tor.1`.
`nuekit` is the planned special case: the fork work begins on a `beta.3` line because it represents the major fork changes since upstream `2.0.0-beta.2`.

Current upstream package versions:

```
nuedom          0.1.0
nue-edgeserver  0.1.0
nue-glow        0.2.5
nuekit          2.0.0-beta.2
nuemark         0.7.0
nuestate        0.1.1
nueyaml         0.1.0
```

First `@tormnator` versions:

```
@tormnator/nuedom            0.1.1-tor.1
@tormnator/nue-edgeserver    0.1.0-tor.1
@tormnator/nue-glow          0.2.5-tor.1
@tormnator/nuekit            2.0.0-beta.3-tor.1
@tormnator/nuemark           0.7.1-tor.1
@tormnator/nuestate          0.1.1-tor.1
@tormnator/nueyaml           0.1.0-tor.1
```

This says:


These are forked publications of the current Nue package line, not official upstream releases and not yet new upstream-compatible version milestones.
For `nuekit`, the fork intentionally starts a new `beta.3` line.
For `nuedom` and `nuemark`, patch-level package fixes justify advancing the base patch version before adding `-tor.1`.

## First Fork Version Rationale

| Package | Current official/base | Recommended first `@tormnator` version | Rationale |
|---|---:|---:|---|
| `@tormnator/nuekit` | `2.0.0-beta.2` | `2.0.0-beta.3-tor.1` | Significant fork feature work: platform adapter foundation, Cloudflare Pages adapter, build/preview/runtime behavior, HMR and asset/dependency fixes, and supporting tests. |
| `@tormnator/nuedom` | `0.1.0` | `0.1.1-tor.1` | Patch-level fixes: Windows path normalization and missing HTML5 tag entries. |
| `@tormnator/nuemark` | `0.7.0` | `0.7.1-tor.1` | Patch-level fixes: multi-line HTML comment parsing and image alt/figcaption accessibility behavior. |
| `@tormnator/nue-glow` | `0.2.5` | `0.2.5-tor.1` | No package diff found against upstream-aligned `master`; keep base version and add fork prerelease suffix. |
| `@tormnator/nue-edgeserver` | `0.1.0` | `0.1.0-tor.1` | No package diff found against upstream-aligned `master`; keep base version and add fork prerelease suffix. |
| `@tormnator/nuestate` | `0.1.1` | `0.1.1-tor.1` | No package diff found against upstream-aligned `master`; keep base version and add fork prerelease suffix. |
| `@tormnator/nueyaml` | `0.1.0` | `0.1.0-tor.1` | No package diff found against upstream-aligned `master`; npm registry reports `nueyaml@0.1.0`. |

This table should be reviewed again before each coordinated package-set publication.
Only bump the base version for packages whose own published contents changed enough to justify it.

## When to Increment Which Version Part

### Increment only `tor.N`

Use this for frequent development, test, packaging, or adapter iterations.

Example:

```
0.7.0-tor.1 → 0.7.0-tor.2
```

Appropriate for:

- packaging fixes
- Cloudflare adapter test iterations
- small bug fixes
- dependency corrections
- metadata/readme corrections
- frequent test releases


### Increment PATCH

Use this when the fork has a meaningful package-level fix that should be treated as the next real patch version.

Example:

```
0.7.0-tor.5 → 0.7.1-tor.1
```

### Increment MINOR

Use this for meaningful new public functionality.

Example:

```
0.7.1-tor.3 → 0.8.0-tor.1
```

### Increment MAJOR

Use this for breaking changes, or later when stabilizing a package into a new major release line.

For `0.x` packages, SemVer is naturally less strict, but the same discipline should still be followed.

## `nuekit` Special Case

`nuekit` is already at:

```
2.0.0-beta.2
```

The first fork publication should be:

```
2.0.0-beta.3-tor.1
```

This deliberately starts the fork on the next beta line.

Frequent iterations:

```
2.0.0-beta.3-tor.1
2.0.0-beta.3-tor.2
2.0.0-beta.3-tor.3
```

When the fork reaches a meaningful next beta milestone:

```
2.0.0-beta.4-tor.1
```

## Independent Package Versions

Each package keeps its own independent version.

Do not force all packages into one synchronized version unless the project later intentionally changes to a fixed-version monorepo release model.

Nue already appears to use independent package versioning because the current packages have different versions.

## npm Dist-Tag Policy

Use a moving npm dist-tag for the current fast-moving development/testing phase.

The selected npm dist-tag name is:

```
dev
```

This is distinct from the Git `dev` branch. When both are discussed together, write npm dist-tag `dev` for the registry tag and Git `dev` branch for the branch.

Publish test/development releases with:

```bash
bun publish --access public --tag dev
```

Prefer `bun publish` as the primary publishing path for this fork.
Reason: Bun workspaces integrate cleanly with the monorepo and `bun publish` rewrites `workspace:` dependency protocols to concrete versions when packing.

The npm dist-tag `dev` points to the current development release for a package.

Example:

```
@tormnator/nuekit@dev → @tormnator/nuekit@2.0.0-beta.3-tor.7
```

Later, after publishing a new version:

```
@tormnator/nuekit@dev → @tormnator/nuekit@2.0.0-beta.3-tor.8
```

Do not use `latest` for this experimental phase unless intentionally making a package the default stable install target.

Important Bun nuance:

- `bun publish --tag dev` is the intended command for this workflow.
- However, Bun assigns `latest` to the initial published version of a package in addition to the specified tag.
- That means the first publication of a new `@tormnator/*` package name will still receive `latest` once.
- After that first publish, continue moving npm dist-tag `dev` and treat exact versions as the source of truth for controlled installs.

## Test Site Dependency Strategy

For fast-moving test sites, use the moving npm dist-tag `dev`.

Example:

```json
{
  "dependencies": {
    "nuekit": "npm:@tormnator/nuekit@dev"
  },
  "scripts": {
    "build": "nue-tor build"
  }
}
```

This npm alias keeps the local dependency key as `nuekit` while resolving the actual package from `@tormnator/nuekit`.
The CLI name still comes from the published package's `bin` field, so the script calls `nue-tor`.

This allows the test site to track the current `@tormnator/nuekit` development release without manually editing `package.json` for every new `-tor.N` release.

However, the lockfile matters.

If `bun.lock` is committed, the currently resolved version may remain locked until updated.

Options for test sites:

### Option A: Fast and flexible test builds

Use non-frozen install in Cloudflare Pages:

```
bun install && bun run build
```

This allows the build to resolve the current npm dist-tag `dev`.

### Option B: Controlled test updates

Run locally:

```bash
bun update nuekit
git add bun.lock
git commit -m "Update Nue fork packages"
git push
```


Cloudflare then builds from the updated lockfile.

### Option C: Convenience script

Add:

```json
{
  "scripts": {
    "update:nue": "bun update nuekit",
    "build": "nue-tor build"
  }
}
```

Then update with:

```bash
bun run update:nue
git add bun.lock
git commit -m "Update Nue"
git push
```

## Production or Production-Like Site Strategy

For real production deployments, pin exact versions.

Example:

```json
{
  "dependencies": {
    "nuekit": "npm:@tormnator/nuekit@2.0.0-beta.3-tor.8"
  },
  "scripts": {
    "build": "nue-tor build"
  }
}
```

Cloudflare Pages build command:

```
bun install --frozen-lockfile && bun run build
```

This gives reproducible builds.

## Internal Monorepo Dependency Strategy

For the architectural rationale behind this alias strategy, see [Package Alias Resolution](./package-alias-resolution.md).

Inside the `tormnator/nue` fork repo itself, keep JavaScript source imports stable by preserving the upstream bare package specifiers.

Package manifests in this fork are long-lived scoped manifests, not temporary generated publish manifests.
For internal dependencies, use npm alias specs: keep the dependency key as the upstream bare name, and point the resolved package to the scoped `@tormnator/*` package and exact version.
This keeps code such as `import { parseYAML } from 'nueyaml'` unchanged while ensuring consumers install the forked scoped package.

Example:

```
{
  "dependencies": {
    "nuemark": "npm:@tormnator/nuemark@0.7.1-tor.1",
    "nueyaml": "npm:@tormnator/nueyaml@0.1.0-tor.1"
  }
}
```

This means published packages expose installable metadata while the JavaScript code can keep upstream-compatible import names.

During development:

```
nuekit depends on local nuemark
nuekit depends on local nueyaml
etc.
```

through package-manager alias resolution.

At publish time, the internal dependencies must resolve to real published package versions.

This policy still assumes `bun publish` is the normal publish command.
Use exact aliased internal published versions during the early fork phase to avoid accidental mismatches and to keep pack previews installable without relying on publish-time `workspace:*` rewriting.
After the first scoped package set is published and the package line is stable, review whether some internal alias dependencies should loosen from exact versions to SemVer ranges or npm dist-tags.
Keep exact versions for coordinated package-set releases unless there is a clear reason to allow independent dependency drift.

Example published dependency:

```json
{
  "dependencies": {
    "nuemark": "npm:@tormnator/nuemark@0.7.1-tor.1",
    "nueyaml": "npm:@tormnator/nueyaml@0.1.0-tor.1"
  }
}
```

## Publish Order

Publish leaf packages before packages that depend on them:

1. `@tormnator/nueyaml`
2. `@tormnator/nue-glow`
3. `@tormnator/nuedom`
4. `@tormnator/nuestate`
5. `@tormnator/nue-edgeserver`
6. `@tormnator/nuemark`
7. `@tormnator/nuekit`

## First Publishing Checklist

Before real publish commands:

- Confirm npm account and scope access with `npm whoami` and `npm view @tormnator/nuekit versions --json`.
- If `npm whoami` is not authenticated, run `bunx npm login` or `npm login` manually in the terminal; do not paste passwords, tokens, or OTP codes into chat, docs, scripts, or logs.
- Confirm whether publishing requires browser auth, legacy OTP, or token-based automation.
- Do manifest/import prep on a short-lived topic branch from Git `dev` branch, then merge back to Git `dev` branch before normal npm dist-tag `dev` publishing.
- Check `git status --short --branch` and ensure package publishes use committed code.
- Re-read current package manifests before editing or publishing.
- Update package names to `@tormnator/*` and internal dependencies to npm alias specs for the coordinated package set.
- Keep internal JavaScript package imports on upstream bare names such as `nuemark`, `nueyaml`, and `nue-edgeserver` unless a package genuinely changes its public import contract.
- Update repository metadata from `nuejs/nue` to `tormnator/nue` if packages should clearly point to the fork.
- Add or verify `publishConfig` where useful:

```json
{
  "publishConfig": {
    "access": "public",
    "tag": "dev"
  }
}
```

- Run the relevant tests before pack/publish checks.
- After the first publish path is stable, review legacy Jest configuration in package manifests and remove or migrate stale config if Bun remains the intended test runner.
- Run `bun publish --dry-run --access public --tag dev` or `npm pack --dry-run` in each package and inspect included files.
- Verify `files` lists include the files needed for Cloudflare adapter work and do not include private/local state.
- Check that runtime imports keep the intended upstream bare package names and that package manifests map those names to the correct `npm:@tormnator/*` aliases.
- Publish only after explicit approval for real publish commands.
- After publishing, create a clean external test project, install `@tormnator/nuekit`, run `bunx nue-tor --version`, and verify `bun run build` produces `.dist`.

## GitHub Releases

GitHub releases do not have to match individual npm package versions one-to-one.

Because this is a multi-package repo with independent package versions, use GitHub releases to describe coordinated package-set releases.

Example GitHub release names:

```
tormnator-nue-2026.05.22
package-set-2026.05.22
dev-2026.05.22
```

Release notes should list the exact npm packages published:

```
Published packages:
- @tormnator/nuekit@2.0.0-beta.3-tor.8
- @tormnator/nuemark@0.7.1-tor.5
- @tormnator/nuedom@0.1.1-tor.3
```

Package-specific tags can be added later if needed, but coordinated release notes are simpler during the current phase.

## GitHub Actions Publishing

Start with manual publishing until the package graph and release process are stable.

Manual flow:

```bash
# update package versions
# build/test packages
bun publish --access public --tag dev
```

Use `npm publish` only as a fallback path, or when publishing from already-prepared tarballs/manifests that no longer contain `workspace:` specs.

Later, automate with GitHub Actions.

Possible future automated flow:

```
1. Update package versions in repo.
2. Commit version changes.
3. Push tag or create GitHub release.
4. GitHub Action runs tests/build.
5. GitHub Action publishes changed packages to npm.
6. GitHub Action uses npm Trusted Publishing if practical.
```

Trusted Publishing is preferable to long-lived npm tokens when using GitHub Actions, because it avoids storing a permanent npm automation token in repository secrets.

## Cloudflare Pages Deployment Pattern

For test sites tracking the current development release:

```json
{
  "dependencies": {
    "nuekit": "npm:@tormnator/nuekit@dev"
  },
  "scripts": {
    "build": "nue-tor build"
  }
}
```

Cloudflare Pages build command for flexible testing:

```
bun install && bun run build
```

Output directory:

```
.dist
```

For production-like deployment:

```json
{
  "dependencies": {
    "nuekit": "npm:@tormnator/nuekit@2.0.0-beta.3-tor.8"
  },
  "scripts": {
    "build": "nue-tor build"
  }
}
```

Cloudflare Pages build command:

```
bun install --frozen-lockfile && bun run build
```

Output directory:

```
.dist
```

## Summary Policy

Publish public fork packages to npm under the `@tormnator` scope. These packages are Tor's forked Nue packages, not official upstream Nue releases.

Use SemVer-compatible prerelease versions with `-tor.N`. Do not use build metadata such as `+fork.local`. The `tor.N` suffix is the fork release counter for a given base version; increment only `tor.N` for frequent fork iterations, packaging fixes, adapter test releases, and small corrections. Bump PATCH, MINOR, MAJOR, or the beta line only when the individual package has a meaningful package-level change.

First coordinated `@tormnator` package versions:

```text
@tormnator/nuekit          2.0.0-beta.3-tor.1
@tormnator/nuedom          0.1.1-tor.1
@tormnator/nuemark         0.7.1-tor.1
@tormnator/nue-glow        0.2.5-tor.1
@tormnator/nue-edgeserver  0.1.0-tor.1
@tormnator/nuestate        0.1.1-tor.1
@tormnator/nueyaml         0.1.0-tor.1
```

Keep package versions independent. `nuekit` starts on `2.0.0-beta.3-tor.N` because it represents the fork's major changes since upstream `2.0.0-beta.2`. `nuedom` and `nuemark` start with patch bumps because they include package-level fixes. Packages without package diffs keep their current upstream base version and add `-tor.1`.

Publish in dependency order: `nueyaml`, `nue-glow`, `nuedom`, `nuestate`, `nue-edgeserver`, `nuemark`, then `nuekit`.

Use npm dist-tag `dev` as the moving development tag and publish primarily with:

```bash
bun publish --access public --tag dev
```

Bun is the primary publishing path. Use `npm publish` only as a fallback or with already-prepared manifests/tarballs. Expect the first Bun publication of a new package name to receive `latest` in addition to npm dist-tag `dev`; after that, treat npm dist-tag `dev` and exact versions as the operational controls.

Inside the monorepo, keep permanent scoped package manifests and use npm alias specs for internal package dependencies during coordinated publish prep. Internal source imports should remain on stable upstream bare package names. At publish time, ensure published metadata resolves those bare names to exact `@tormnator/*` versions.
After the forked package set has proven stable in external consumers, revisit whether exact internal alias versions should remain mandatory or whether selected dependencies can move to ranges or npm dist-tags.

Publish `@tormnator/nuekit` with a distinct CLI bin:

```json
"bin": {
  "nue-tor": "./src/cli.js"
}
```

Do not reuse the plain `nue` bin name unless intentionally replacing upstream Nue installs. Consumer build scripts should call `nue-tor build`.

For fast-moving test sites, depend on the moving tag, for example `"nuekit": "npm:@tormnator/nuekit@dev"`, and use non-frozen installs when Cloudflare should pick up the current npm dist-tag `dev` release. For controlled test updates, run `bun update nuekit`, commit `bun.lock`, then deploy. For production or production-like sites, pin exact package versions and use `bun install --frozen-lockfile && bun run build`.

Use GitHub releases for coordinated package-set release notes rather than trying to make GitHub release numbers match every independent npm package version. List the exact package versions published in each release note.

Start with manual publishing until the package graph and release process are stable. Later automation should run tests/builds and publish through GitHub Actions, preferably with npm Trusted Publishing instead of long-lived npm tokens.

Before the first publish, confirm npm scope access, authentication/OTP mode, package contents, repository metadata, permanent scoped manifests, and scoped import renames.