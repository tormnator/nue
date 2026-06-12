# Release and Publishing Policy

This document defines how the Nue fork plans release cycles, records release
information, publishes npm packages, and creates GitHub Releases.

For branch roles and merge flow, see `docs-internal/branching-policy.md`.

## Goals

- Keep release work reconstructable from committed release details.
- Keep release notes, changelogs, package versions, npm dist-tags, Git tags,
  and GitHub Releases intentionally aligned.
- Support fast validation publishes without treating every validation package as
  an official release.
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
- Use the same CRI for release details, release-facing docs, changelog links,
  GitHub Release naming/linking, and release-note URLs.

Examples:

```text
v2-0
v2-0-beta-3
v2-1-rc-1
```

The CRI is not an npm package version. npm package versions continue to use
SemVer-compatible versions such as `2.0.0`, `2.0.0-beta.3`, or
`2.0.0-beta.3-tor.1`.

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

Treat the release details document as the internal living source of truth for
reconstructing the cycle. It should collect the detailed material needed to
produce public release notes, changelogs, package publish records, GitHub
Release text, and later audits.

Create a skeletal release details document when the cycle begins. Do not leave
the cycle to a blank page. A useful starting shape includes:

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

During the cycle, record relevant source changes, validation results, package
version decisions, npm publishes, issue links, known gaps, and release risks in
the release details document.

The release details document is intentionally more detailed than public release
notes. Preserve useful engineering context there, then curate the user-facing
release notes from it at the end of the cycle.

## Release Notes

Create one public release notes document per release cycle before the cycle is
officially released:

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

Treat the public release notes as the main user-facing source of truth for the
cycle. They should describe what changed, who should care, how to install or
upgrade, package versions, validation, known issues, and links to deeper guides
when needed.

Public release notes should be derived from the release details document, but
they should not copy it wholesale. Keep them high-level, user-friendly, and
focused on release impact.

Patch releases normally update the existing major-minor release notes document
under a patch updates section. Create a separate patch release notes document
only when the patch is large enough to need its own public page.

Use `docs-internal/release-notes-template.md` and the release details document
as the starting point for new release notes.

## Changelogs

Follow the Keep a Changelog style:

- Write changelogs for people, not as raw commit logs.
- Put the newest entries first.
- Use ISO dates such as `2026-06-10`.
- Keep versions and release headings linkable.
- Group changes by type when applicable: `Added`, `Changed`, `Deprecated`,
  `Removed`, `Fixed`, and `Security`.
- Keep an `Unreleased` section when work is accumulating before release.

### Root Changelog

The root `CHANGELOG.md` records notable repo-level releases. Each released entry
should link to the release notes document for the CRI.

Use the root changelog for release summaries, not detailed implementation notes.
Detailed engineering notes belong in the release details document. User-facing
context belongs in the release notes document.

### Package Changelogs

Each package may have its own `CHANGELOG.md` in the package root.

Rules:

- Create a package `CHANGELOG.md` only when that package first has
  release-relevant changes.
- Do not create placeholder changelogs for unchanged packages.
- If a package is published in a release cycle, it must have a changelog entry
  for that cycle.
- Package changelog entries should list the exact package version and link to
  the relevant CRI release notes when the package publish belongs to a
  coordinated release.

### Package Readmes

When a package has a changelog, its package `README.md` should link to that
changelog so npm visitors can find release history from the npm package page.

## Package Versioning

Publish fork packages publicly under the `@tormnator` npm scope. These packages
are Tor's forked Nue packages, not official upstream Nue releases.

Use SemVer-compatible versions. During the fork phase, use `-tor.N` prerelease
identifiers as the fork publication counter for a base version.

Examples:

```text
0.7.1-tor.1
0.7.1-tor.2
2.0.0-beta.3-tor.1
```

The `tor.N` value is not an API version. It is the publication counter for that
forked base version.

Package versions remain independent. Do not force every package into the same
version unless the project later adopts a fixed-version monorepo release model.
A coordinated release cycle maps one CRI to the exact package versions published
or promoted for that cycle.

### Choosing The Next Package Version

- Increment only `tor.N` for frequent validation iterations, packaging fixes,
  adapter test releases, dependency corrections, metadata/readme corrections,
  and small bug fixes that do not justify moving the base package version.
- Increment PATCH for meaningful package-level fixes.
- Increment MINOR for meaningful new public functionality.
- Increment MAJOR for breaking changes or a deliberate stable major line.
- For `0.x` packages, use the same discipline even though SemVer is less strict.
- For `nuekit` beta milestones, move from one beta line to the next only when
  the milestone changes meaningfully.

Do not publish a new package version for every source commit. Publish when an
installable package artifact is needed or when the release cycle reaches a
publish point.

## Start A Release Cycle

Use this workflow when a coherent release cycle begins.

1. Choose the CRI.
2. Create `docs-internal/release-details/{CRI}.md` as the skeletal living
    release details document for the cycle.
3. Add or update the root `CHANGELOG.md` `Unreleased` section or draft release
   entry.
4. Identify which packages are expected to change or publish during the cycle.
5. Create package changelogs only for packages that first have release-relevant
   changes.
6. Add package README changelog links when package changelogs exist.
7. Record planned validation targets, known risks, and expected package publish
    needs in the release details document.

The public release notes document may be drafted early, but it is not required
at cycle start. It must exist and be finalized before the coordinated release is
published.

## Maintain A Release Cycle

For each source or documentation change during the cycle, decide whether it is:

- user-facing and should be reflected in release details and later release
  notes;
- repo-level and notable enough for the root changelog;
- package-specific and relevant to a package changelog;
- validation-related and should be recorded with commit/version details;
- internal-only and not release-notable.

Update release details continuously as work lands, validations complete, package
versions are published, and known issues change.

Release details should clearly separate completed, in-progress, planned,
deferred, and known-limitation items. Do not present topic-branch work as landed
unless it has landed in the selected release branch.

## Mid-Cycle npm Publishing

Use mid-cycle npm publishing only when external validation needs installable
packages. Common examples:

- Cloudflare Pages Git integration or production-like deployment validation.
- Consumer test projects that cannot reasonably use a local checkout.
- Package install, lockfile, or published manifest validation.

Do not use mid-cycle publishing merely to mark ordinary progress.

### Preconditions

Before publishing from the Git `dev` branch to npm dist-tag `dev`:

- Work from committed code on Git `dev` branch.
- Use a clean working tree, except for unrelated untracked planning notes that
  are intentionally excluded.
- Run relevant tests.
- Run package dry runs or pack checks.
- Confirm package manifests and internal dependency versions.
- Confirm package changelog entries exist for packages being published.
- Record the source commit and exact package versions before or immediately
  after publishing.

Prefer Bun for publishing:

```bash
bun publish --access public --tag dev
```

Bun workspace publishing integrates cleanly with this repo and rewrites
`workspace:` dependency protocols when packing. Use `npm publish` only as a
fallback or when publishing already-prepared manifests or tarballs.

Important Bun nuance: the first publication of a new package name can receive
the npm dist-tag `latest` in addition to the requested `dev` tag. After that
first publish, continue moving npm dist-tag `dev` and treat exact versions as
the operational control for validation.

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
- dry-run or pack-check result;
- validation target;
- validation result.

Record this in the release details document and package changelog. Do not create
a GitHub Release for every npm dist-tag `dev` validation publish.

## End A Release Cycle

Use this workflow when the release is ready to become an official fork update.

1. Finish and validate the coherent milestone on Git `dev` branch.
2. Finalize the release details document.
3. Create or finalize public release notes from the release details document.
4. Finalize root changelog and package changelogs.
5. Update package README changelog links for packages whose changelogs were
   created during the cycle.
6. Finalize package versions, package manifests, and internal dependency
   versions.
7. Run relevant tests and package dry runs.
8. If templates or `nue create` changed, regenerate and validate committed
   template zips on the branch being promoted.
9. Validate npm dist-tag `dev` packages with real consumers when installable
   validation packages were published.
10. Promote Git `dev` branch to Git `main` branch according to
   `docs-internal/branching-policy.md`.
11. Publish missing official packages from `main`, or move npm dist-tag `latest`
    to exact package versions that were already validated from npm dist-tag
    `dev`.
12. Create a Git tag for the `main` commit used by the GitHub Release.
13. Create the GitHub Release from `main`.
14. Record the final source commit, package versions, validation results, known
    limitations, and release links.

## Official npm Publishing

Official package publishing or promotion happens from a clean Git `main` branch
checkout at the commit used for the release.

Prefer promoting already validated exact package versions to npm dist-tag
`latest` when those exact versions were previously published from Git `dev`
branch and externally validated. Publish missing packages from `main` only when
promotion cannot be used.

Production-like consumers should pin exact package versions and use frozen
installs. Fast validation sites may use npm dist-tag `dev` with non-frozen
installs when tracking the current validation package line is intentional.

## Git Tags And GitHub Releases

GitHub Releases are based on Git tags. Create GitHub Releases only from Git
`main` branch.

For coordinated source releases, prefer a Git tag based on the CRI, for example:

```text
v2-0-beta-3
```

If package-specific tags are later needed, use an explicit package tag format,
for example:

```text
@tormnator/nuekit@2.0.0-beta.3-tor.8
```

Do not use package-specific tags as a substitute for coordinated release notes.

GitHub Release content should include:

- short summary;
- CRI;
- source commit;
- exact npm package versions published or promoted;
- validation performed;
- notable limitations or known issues;
- link to the canonical release notes document or webpage.

Use GitHub Releases for coordinated package-set releases, not for every npm
dist-tag `dev` validation publish.

## Upgrade Guides

Create a separate upgrade guide when users need project edits, behavioral
migration steps, compatibility notes, or examples that would make release notes
too long.

Suggested internal location while drafting:

```text
docs-internal/upgrades/{from}-to-{to}.md
```

The release notes should link to the upgrade guide and summarize the most
important migration requirements.

## Final Review Checklist

Before publishing a coordinated release, confirm:

- CRI is consistent across release notes, changelog links, Git tag, and GitHub
  Release text.
- Release details are finalized and include source commits, package versions,
  validation results, publish records, known limitations, and release links.
- npm package versions are SemVer-compatible and independent per package.
- Public release notes are derived from release details and list exact package
  versions and install guidance.
- Root changelog links to the release notes.
- Each published package has a package changelog entry for the cycle.
- Package README files link to package changelogs where those changelogs exist.
- Package dry runs or pack checks were run.
- Relevant tests were run.
- External install/deploy validation was completed when npm packages changed.
- Known issues and deferred work are clearly labeled.
- Git `main` branch, npm dist-tag `latest`, Git tag, and GitHub Release describe
  the same official source state.