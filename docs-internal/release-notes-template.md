# Release Notes Template

Use this template for public release notes in:

```text
sites/nue/docs/releases/{CRI}.md
packages/www/docs/releases/{CRI}.md # This is the old website's location
```

The Canonical Release Identifier (CRI) format is:

```text
v{major}-{minor}[-{channel}-{number}]
```

Examples: `v2-0`, `v2-0-beta-3`, `v2-1-rc-1`.

Patch releases normally update the existing major-minor release notes document
under a patch updates section. Create a separate patch release notes document
only when the patch is large enough to need its own public page.

Delete template guidance before publishing the final release notes.

---

# {Release Name}

Status: Draft | Released
CRI: `{CRI}`
Release date: YYYY-MM-DD
Primary npm package line: `{package-name}@{version}`

Optional release record fields after release:

- npm publish source commit: `{commit}`
- Git tag: `{tag}`
- GitHub Release: `{url}`

## Summary

Required.

Write a short user-facing overview of the release. Include who the release is
for, the main theme, and the most important changes.

## Install Or Upgrade

Required.

Show the recommended install or upgrade path for the release.

Include exact package versions for production-like installs. If moving tags are
useful for validation, explain that they are for validation only.

Example:

```bash
bun add nuekit@npm:@tormnator/nuekit@{version}
```

If starter templates or `nue create` behavior changed, include the matching
template source:

```bash
nue create spa https://github.com/tormnator/nue/raw/{branch}/packages/templates
```

Link to the getting-started guide after it has been reviewed for this release.

## Package Versions

Required when npm packages are published or promoted.

| Package | Version | npm dist-tag | Notes |
|---|---|---|---|
| `@tormnator/nuekit` | `{version}` | `dev` or `latest` | |

List every package published or promoted for this release cycle. If no package
was published, say so explicitly.

## Highlights

Required.

- Highlight the most important user-visible features, fixes, and changes.
- Keep this section concise; use deeper sections for details.

## Added

Required when applicable.

- New features.
- New public APIs.
- New templates, commands, adapters, or documented workflows.

## Changed

Required when applicable.

- Improvements to existing behavior.
- Important behavior changes that are not removals or deprecations.
- Documentation or template changes that affect users.

## Fixed

Required when applicable.

- Bug fixes.
- Compatibility fixes.
- Packaging, install, or deployment fixes.

## Deprecated

Required when applicable.

- Features or APIs that still work but should no longer be used.
- Include the expected removal path when known.

## Removed

Required when applicable.

- Removed features, APIs, commands, templates, or compatibility behavior.
- Include migration guidance or link to an upgrade guide.

## Security

Required when applicable.

- Security fixes.
- Security-relevant behavior changes.
- Link to the security advisory when one exists.

## Upgrade Notes

Required when users may need to change project code, configuration, package
versions, deployment settings, or templates.

Keep brief migration steps here. Link to a separate upgrade guide when the
migration needs longer examples or deeper explanation.

## Patch Updates

Required only when this release notes document also tracks patch releases. Delete this section when not applicable.

Use newest-first entries.

### {patch-version} - YYYY-MM-DD

- Summary of the patch.
- Package versions changed.
- Fixes or known limitations.

## Validation

Required before public release.

Record the validation that supports the release claims.

- Automated tests run.
- Package dry runs or pack checks.
- Install checks against published packages, including an external consumer check when npm package content changed.
- Template zip regeneration or validation when applicable.
- Deployment validation when runtime, adapter, or hosting behavior changed.
- Source commit used for final validation.
- npm publish source commit and Git tag target commit, when they differ.

## Known Issues

Required.

- Known bugs.
- Platform limitations.
- Deferred work that users may otherwise assume is included.

If there are no known issues, say so explicitly.

## In-Depth Notes

Optional. Delete this section when not needed.

Use one or more sections for substantial changes that need screenshots, videos,
examples, architecture notes, or how-to material.

## Source Material

Optional for public release notes; useful while drafting.

- Relevant issues.
- Relevant pull requests or branches.
- Internal validation notes.
- Links to related docs or upgrade guides.