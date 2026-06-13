# Release and Publishing Policy

This document defines how the Nue fork plans release cycles, records release information, publishes npm packages, and creates GitHub Releases.

For branch roles and merge flow, see `docs-internal/branching-policy.md`.

## Table of Contents

<!-- Start Document Outline -->

* [Goals](#goals)
* [Core Terms](#core-terms)
* [Release Details](#release-details)
* [Release Notes](#release-notes)
* [Changelogs](#changelogs)
* [Package Versioning](#package-versioning)
* [Start A Release Cycle](#start-a-release-cycle)
* [Maintain A Release Cycle](#maintain-a-release-cycle)
* [Mid-Cycle npm Publishing](#mid-cycle-npm-publishing)
* [End A Release Cycle](#end-a-release-cycle)
* [Official npm Publishing](#official-npm-publishing)
* [Git Tags And GitHub Releases](#git-tags-and-github-releases)
* [Upgrade Guides](#upgrade-guides)
* [Final Review Checklist](#final-review-checklist)

<!-- End Document Outline -->

## Goals

- Keep release work reconstructable from committed release details.
- Keep release notes, changelogs, package versions, npm dist-tags, Git tags, and GitHub Releases intentionally aligned.
- Support fast validation publishes without treating every validation package as an official release.
- Keep the policy durable across release cycles instead of tying it to one beta.

## Core Terms

### Canonical Release Identifier

Each release cycle has one Canonical Release Identifier (CRI).

CRI format:

```text
v{major}-{minor}[-{channel}-{number}]
```

Rules:

- Use lowercase letters, digits, and hyphens only.
- Do not use periods or underscores.
- Use the same CRI for release details, release-facing docs, changelog links, GitHub Release naming/linking, and release-note URLs.

Examples:

```text
v2-0
v2-0-beta-3
v2-1-rc-1
```

The CRI is not an npm package version. npm package versions continue to use SemVer-compatible versions such as `2.0.0`, `2.0.0-beta.3`, or `2.0.0-beta.3-tor.1`.

### Release Artifacts

| Artifact | Role |
|---|---|
| Release details | Internal living source of truth for reconstructing a release cycle. |
| Public release notes | User-facing source of truth for a released cycle. |
| Root `CHANGELOG.md` | Chronological index of notable repo releases. |
| Package `CHANGELOG.md` | Chronological index of package-specific changes and publishes. |
| Package `README.md` | npm-facing entry point; links to the package changelog when one exists. |
| npm package version | Installable package artifact. Versions are independent per package. |
| npm dist-tag `dev` | Moving validation tag for installable development packages. |
| npm dist-tag `latest` | Official/default package tag for users. |
| Git tag | Immutable repository point used by GitHub Releases. |
| GitHub Release | Short public record for a coordinated release, linked to release notes. |

## Release Details

Create one internal release details document per release cycle:

```text
docs-internal/release-details/{CRI}.md
```

Example:

```text
docs-internal/release-details/v2-0-beta-3.md
```

Treat the release details document as the internal living source of truth for reconstructing the cycle. It should collect the detailed material needed to produce public release notes, changelogs, package publish records, GitHub Release text, and later audits.

Create a skeletal release details document when the cycle begins. Do not leave the cycle to a blank page. A useful starting shape includes:

- status and CRI;
- cycle boundaries;
- package versions;
- release highlight candidates;
- added, changed, fixed, removed, and security notes;
- validation log;
- npm publish log;
- known issues and deferred work;
- changelog candidates;
- source material.

During the cycle, record relevant source changes, validation results, package version decisions, npm publishes, issue links, known gaps, and release risks in the release details document.

The release details document is intentionally more detailed than public release notes. Preserve useful engineering context there, then curate the user-facing release notes from it at the end of the cycle.

## Release Notes

Create one public release notes document per release cycle before the cycle is officially released:

```text
packages/www/docs/releases/{CRI}.md
```

Example:

```text
packages/www/docs/releases/v2-0-beta-3.md
```

The rendered URL should use the same CRI slug, for example:

```text
https://www.nuejs.org/docs/releases/v2-0-beta-3
```

Treat the public release notes as the main user-facing source of truth for the cycle. They should describe what changed, who should care, how to install or upgrade, package versions, validation, known issues, and links to deeper guides when needed.

Public release notes should be derived from the release details document, but they should not copy it wholesale. Keep them high-level, user-friendly, and focused on release impact.

Patch releases normally update the existing major-minor release notes document under a patch updates section. Create a separate patch release notes document only when the patch is large enough to need its own public page.

Use `docs-internal/release-notes-template.md` and the release details document as the starting point for new release notes.

## Changelogs

Follow the Keep a Changelog style:

- Write changelogs for people, not as raw commit logs.
- Put the newest entries first.
- Use ISO dates such as `2026-06-10`.
- Keep versions and release headings linkable.
- Group changes by type when applicable: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- Keep an `Unreleased` section when work is accumulating before release.

### Root Changelog

The root `CHANGELOG.md` records notable repo-level releases. Each released entry should link to the release notes document for the CRI.

Use the root changelog for release summaries, not detailed implementation notes. Detailed engineering notes belong in the release details document. User-facing context belongs in the release notes document.

### Package Changelogs

Each package may have its own `CHANGELOG.md` in the package root.

Rules:

- Create a package `CHANGELOG.md` only when that package first has release-relevant changes.
- Do not create placeholder changelogs for unchanged packages.
- If a package is published in a release cycle, it must have a changelog entry for that cycle.
- Package changelog entries should list the exact package version and link to the relevant CRI release notes when the package publish belongs to a coordinated release.

### Package Readmes

When a package has a changelog, its package `README.md` should link to that changelog so npm visitors can find release history from the npm package page.

The root `README.md` currently points to `packages/nuekit/README.md`. Treat edits there as both GitHub repo-front-page content and `@tormnator/nuekit` npm package-page content. Prefer durable release links over long per-cycle narrative: link to the root changelog, relevant package changelog, and public release notes. Add or update a short current-release note only when it helps both GitHub visitors and npm visitors understand the published package line.

## Package Versioning

Publish fork packages publicly under the `@tormnator` npm scope. These packages are Tor's forked Nue packages, not official upstream Nue releases.

Use SemVer-compatible versions. During the fork phase, use `-tor.N` prerelease identifiers as the fork publication counter for a base version.

Examples:

```text
0.7.1-tor.1
0.7.1-tor.2
2.0.0-beta.3-tor.1
```

The `tor.N` value is not an API version. It is the publication counter for that forked base version.

Package versions remain independent. Do not force every package into the same version unless the project later adopts a fixed-version monorepo release model. A coordinated release cycle maps one CRI to the exact package versions published or promoted for that cycle.

### Choosing The Next Package Version

- Increment only `tor.N` for frequent validation iterations, packaging fixes, adapter test releases, dependency corrections, metadata/readme corrections, and small bug fixes that do not justify moving the base package version.
- Increment PATCH for meaningful package-level fixes.
- Increment MINOR for meaningful new public functionality.
- Increment MAJOR for breaking changes or a deliberate stable major line.
- For `0.x` packages, use the same discipline even though SemVer is less strict.
- For `nuekit` beta milestones, move from one beta line to the next only when the milestone changes meaningfully.

Do not publish a new package version for every source commit. Publish when an installable package artifact is needed or when the release cycle reaches a publish point.

## Start A Release Cycle

Use this workflow when a coherent release cycle begins.

1. Choose the CRI.
2. Create `docs-internal/release-details/{CRI}.md` as the skeletal living release details document for the cycle.
3. Add or update the root `CHANGELOG.md` `Unreleased` section or draft release entry.
4. Identify which packages are expected to change or publish during the cycle.
5. Create package changelogs only for packages that first have release-relevant changes.
6. Add package README changelog links when package changelogs exist.
7. Record planned validation targets, known risks, and expected package publish needs in the release details document.

The public release notes document may be drafted early, but it is not required at cycle start. It must exist and be finalized before the coordinated release is published.

## Maintain A Release Cycle

For each source or documentation change during the cycle, decide whether it is:

- user-facing and should be reflected in release details and later release notes;
- repo-level and notable enough for the root changelog;
- package-specific and relevant to a package changelog;
- validation-related and should be recorded with commit/version details;
- internal-only and not release-notable.

Update release details continuously as work lands, validations complete, package versions are published, and known issues change.

Release details should clearly separate completed, in-progress, planned, deferred, and known-limitation items. Do not present topic-branch work as landed unless it has landed in the selected release branch.

## Mid-Cycle npm Publishing

Use mid-cycle npm publishing only when external validation needs installable packages. Common examples:

- Cloudflare Pages Git integration or production-like deployment validation.
- Consumer test projects that cannot reasonably use a local checkout.
- Package install, lockfile, or published manifest validation.

Do not use mid-cycle publishing merely to mark ordinary progress.

Before choosing package versions for a publish, review each package changelog against package source changes since that package's previous npm publish. Use [Package Versioning](#package-versioning) to propose the next package version string, then update the package manifest and any internal dependency versions needed for that exact package set.

### Preconditions

Before publishing from the Git `dev` branch to npm dist-tag `dev`:

- Work from committed code on Git `dev` branch.
- Use a clean working tree, except for unrelated untracked planning notes that are intentionally excluded.
- Run release-candidate tests for every package being published and every package that depends on it.
- Run package dry runs or pack checks.
- Confirm each package changelog describes the source changes since the package's previous npm publish and supports the proposed version string.
- Confirm package manifests and internal dependency versions match the proposed exact package versions.
- Record the source commit and exact package versions before or immediately after publishing.

Recommended release-candidate test baseline:

```bash
bun install --frozen-lockfile

cd packages/nueyaml && bun test
cd ../nueglow && bun test
cd ../nuedom && bun test
cd ../nuestate/test && bun test
cd ../../nueserver && bun test
cd ../nuemark/test && bun test
cd ../../nuekit/test && bun test
```

Run additional focused tests for the changed area. For example, platform adapter changes should include the relevant Nuekit platform tests plus a local build of an affected template or demo site. If starter templates or `nue create` changed, regenerate template zips before the final test pass:

```bash
bun run templates:zip
```

Then inspect package contents before real publishing. Run from each package directory in publish order:

```bash
bun publish --dry-run --access public --tag dev
```

Prefer Bun for publishing:

```bash
bun publish --access public --tag dev
```

Bun workspace publishing integrates cleanly with this repo and rewrites `workspace:` dependency protocols when packing. Use `npm publish` only as a fallback or when publishing already-prepared manifests or tarballs.

Important Bun nuance: the first publication of a new package name can receive the npm dist-tag `latest` in addition to the requested `dev` tag. After that first publish, continue moving npm dist-tag `dev` and treat exact versions as the operational control for validation.

Before a real publish, confirm npm identity and scope visibility without putting secrets in docs, scripts, chat, or logs:

```bash
npm whoami
npm view @tormnator/nuekit versions --json
```

If npm login, browser authentication, OTP, or token setup is required, perform that directly in the terminal.

### Publish Order

Publish leaf packages before dependents:

1. `@tormnator/nueyaml`
2. `@tormnator/nue-glow`
3. `@tormnator/nuedom`
4. `@tormnator/nuestate`
5. `@tormnator/nue-edgeserver`
6. `@tormnator/nuemark`
7. `@tormnator/nuekit`

### Record The Publish

For each published package, record:

- package name;
- package version;
- npm dist-tag;
- source commit;
- branch published from;
- version decision source, usually the package changelog entry and release details note;
- dry-run or pack-check result;
- validation target;
- validation result.

Record this in the release details document and package changelog. Do not create a GitHub Release for every npm dist-tag `dev` validation publish.

### Validate Published `dev` Packages

After publishing, verify the registry state for every published package:

```bash
npm dist-tag ls @tormnator/nuekit
npm view @tormnator/nuekit@dev version
```

Create or update a clean external consumer project and install the package line as a consumer would. For fast validation sites, depend on npm dist-tag `dev` and use a non-frozen install so the latest validation package can resolve:

```json
{
  "scripts": {
    "check": "nue-tor --version",
    "build": "nue-tor build"
  },
  "dependencies": {
    "nuekit": "npm:@tormnator/nuekit@dev"
  }
}
```

```bash
bun install --minimum-release-age=0
bun run check
bun run build
```

The `--minimum-release-age=0` flag is only needed on machines with Bun's minimum release age safety setting enabled and when validating freshly published packages.

For Cloudflare Pages Git integration validation, use a dedicated demo repo or a release validation branch with these settings:

```text
Framework preset: None
Build command: bun run build
Build output directory: .dist
```

Validate the behavior that matters for the changed release surface. Issue #25 used this baseline for the Cloudflare Pages package path:

- clean `bun install` and `bun run build` from the external repo;
- `.dist` contains expected output, including `_worker.js` when runtime is required and root `404.html`;
- deployed `/api/ping` returns the server response;
- deployed `/dashboard` returns the SPA shell through extensionless fallback;
- deployed `/missing.txt` returns 404;
- pushing a source change triggers a new Cloudflare Pages deployment.

## End A Release Cycle

Use this workflow when the release is ready to become an official fork update.

Source-state terms used below:

- **npm publish source commit**: the clean `main` commit used to publish package artifacts.
- **release record commit**: the committed docs/changelogs that record publish and validation results.
- **Git tag target commit**: the final `main` commit the coordinated release tag points at.

1. Finish and validate the coherent milestone on Git `dev` branch.
2. Finalize the release details document.
3. Create or finalize public release notes from the release details document.
4. Finalize root changelog and package changelogs.
5. Review each package changelog against source changes since that package's previous npm publish. Use [Package Versioning](#package-versioning) to propose final package version strings. Finalize package manifests and internal dependency versions for those exact versions.
6. Review README release visibility. Update package README changelog links for packages whose changelogs were created during the cycle, and update the root README/`packages/nuekit/README.md` release links or short release note when the release should be visible from the GitHub front page.
7. If templates or `nue create` changed, regenerate committed template zips on Git `dev` branch and validate the affected template or demo site.
8. Run release-candidate tests and package dry runs. Use the Mid-Cycle npm Publishing preconditions as the baseline, then add focused tests for changed areas.
9. Commit all final release-cycle changes on Git `dev` branch and push Git `dev` branch to `origin`.
10. When exact installable package versions need external validation before the official release, publish them from Git `dev` branch to npm dist-tag `dev` and validate them with real consumers. Follow [Mid-Cycle npm Publishing](#mid-cycle-npm-publishing), including the post-publish validation steps.
11. Run the promotion preflight below, then promote Git `dev` branch to Git `main` branch according to `docs-internal/branching-policy.md`.
12. Publish or promote official package versions from Git `main` branch. Follow [Official npm Publishing](#official-npm-publishing).
13. Run external consumer validation against the official npm package versions when package content changed.
14. Finalize and commit release records on `main`: package versions, npm publish source commits, validation results, known limitations, and planned release links.
15. Create a Git tag for the final `main` release record commit, then create the GitHub Release from that tag.
16. Fast-forward Git `dev` to the final Git `main` commit and push Git `dev`.

Promotion preflight:

- Verify `dev`, `main`, `origin/dev`, and `origin/main` before promotion.
- Prefer fast-forward promotion when `main` is already an ancestor of `dev`. If `main` has unique commits, use a normal merge that preserves both histories and records the divergence in the release details.
- Do not force-push `main` or discard unique `main` commits during release promotion.

## Official npm Publishing

Official package publishing or promotion happens from a clean Git `main` branch checkout at the commit used for the release. This matters for auditability: the package artifacts, package manifests, changelogs, Git tag, and GitHub Release should all point back to the same official source state.

Prefer promoting already validated exact package versions to npm dist-tag `latest` when those exact versions were previously published from Git `dev` branch and externally validated. Publish missing packages from `main` only when promotion cannot be used.

"Missing packages" means exact package versions that are required for the coordinated release but do not yet exist on npm. This can happen when a package was not published to npm dist-tag `dev`, when final source or packaging changes landed after the last `dev` publish, or when the official release intentionally uses a different package version than the validation publish.

Promotion is a registry operation and is not technically tied to the current Git checkout, but perform it from the clean Git `main` release checkout anyway so the operator can verify and record the release state consistently. Only promote an exact package version when the package content being promoted matches the source state being released or when any difference is explicitly recorded as harmless.

Before publishing or promoting, verify the branch and registry state:

```bash
git switch main
git pull --ff-only origin main
git status --short --branch

npm whoami
npm view @tormnator/nuekit versions --json
npm dist-tag ls @tormnator/nuekit
```

To promote an already validated exact package version to npm dist-tag `latest`:

```bash
npm dist-tag add @tormnator/nuekit@2.0.0-beta.3-tor.2 latest
npm dist-tag ls @tormnator/nuekit
```

Repeat for each package being promoted. Record the exact package version and the post-promotion `npm dist-tag ls` result in the release details document.

To publish an exact official package version that is not yet on npm, run the release-candidate tests and dry run first, then publish from that package directory in publish order:

```bash
bun publish --dry-run --access public --tag latest
bun publish --access public --tag latest
npm dist-tag ls @tormnator/nuekit
```

Use `npm publish --access public --tag latest` only as a fallback or when publishing already-prepared manifests or tarballs. Never publish from uncommitted package manifests. If a real publish fails midway through the package set, do not rerun blindly; inspect npm for the exact versions already published and continue only with the missing packages.

After a successful publish, npm reads can lag briefly. Do not rerun a publish because an immediate `npm view` returns stale data. Recheck with `npm view <package> versions --json --prefer-online`, `npm view <package>@<version> version --prefer-online`, and `npm dist-tag ls <package>` until the exact version and dist-tag agree.

Production-like consumers should pin exact package versions and use frozen installs. Fast validation sites may use npm dist-tag `dev` with non-frozen installs when tracking the current validation package line is intentional.

## Git Tags And GitHub Releases

GitHub Releases are based on Git tags. Create GitHub Releases only from Git `main` branch.

The GitHub repository default branch should be `main`. If GitHub Release API output reports an unexpected `targetCommitish`, verify the pushed tag itself and its peeled commit instead of treating `targetCommitish` as authoritative.

For coordinated source releases, prefer a Git tag based on the CRI, for example:

```text
v2-0-beta-3
```

If package-specific tags are later needed, use an explicit package tag format, for example:

```text
@tormnator/nuekit@2.0.0-beta.3-tor.8
```

Do not use package-specific tags as a substitute for coordinated release notes.

GitHub Release content should include:

- short summary;
- CRI;
- npm publish source commit and Git tag target commit;
- exact npm package versions published or promoted;
- validation performed;
- notable limitations or known issues;
- link to the canonical release notes document or webpage.

Use GitHub Releases for coordinated package-set releases, not for every npm dist-tag `dev` validation publish.

## Upgrade Guides

Create a separate upgrade guide when users need project edits, behavioral migration steps, compatibility notes, or examples that would make release notes too long.

Suggested internal location while drafting:

```text
docs-internal/upgrades/{from}-to-{to}.md
```

The release notes should link to the upgrade guide and summarize the most important migration requirements.

## Final Review Checklist

Before publishing a coordinated release, confirm:

- CRI is consistent across release notes, changelog links, Git tag, and GitHub Release text.
- Release details are finalized and include source commits, package versions, validation results, publish records, known limitations, and release links.
- npm package versions are SemVer-compatible and independent per package.
- Public release notes are derived from release details and list exact package versions and install guidance.
- Root changelog links to the release notes.
- Each published package has a package changelog entry for the cycle.
- Package README files link to package changelogs where those changelogs exist.
- Package dry runs or pack checks were run.
- Relevant tests were run.
- External install/deploy validation was completed when npm packages changed.
- Known issues and deferred work are clearly labeled.
- Git `main` branch, npm dist-tag `latest`, Git tag, and GitHub Release describe the same coordinated release, with any difference between npm publish source commit and Git tag target commit recorded explicitly.