# First `@tormnator` npm Publish Record

Date: 2026-05-23

Source repo: `tormnator/nue`

Source branch: Git `dev` branch

Source commit: `eccbecd7`

Primary policy: [npm Versioning and Publishing Policy](./npm-versioning-publishing-policy.md)

Alias architecture note: [Package Alias Resolution](./package-alias-resolution.md)

## Published Package Set

Published publicly to npm under the `@tormnator` scope with:

```bash
bun publish --access public --tag dev
```

Publish order:

1. `@tormnator/nueyaml@0.1.0-tor.1`
2. `@tormnator/nue-glow@0.2.5-tor.1`
3. `@tormnator/nuedom@0.1.1-tor.1`
4. `@tormnator/nuestate@0.1.1-tor.1`
5. `@tormnator/nue-edgeserver@0.1.0-tor.1`
6. `@tormnator/nuemark@0.7.1-tor.1`
7. `@tormnator/nuekit@2.0.0-beta.3-tor.1`

## npm Dist-Tags After Publish

Because these were first publishes for new package names, npm/Bun assigned both `dev` and `latest` to the first published version.

```text
@tormnator/nueyaml          dev/latest -> 0.1.0-tor.1
@tormnator/nue-glow        dev/latest -> 0.2.5-tor.1
@tormnator/nuedom          dev/latest -> 0.1.1-tor.1
@tormnator/nuestate        dev/latest -> 0.1.1-tor.1
@tormnator/nue-edgeserver  dev/latest -> 0.1.0-tor.1
@tormnator/nuemark         dev/latest -> 0.7.1-tor.1
@tormnator/nuekit          dev/latest -> 2.0.0-beta.3-tor.1
```

The operational development tag remains npm dist-tag `dev`.

## Validation Performed

Before real publish:

- `bun install --frozen-lockfile` passed.
- Normal package test commands passed for all seven publishable packages.
- `bun publish --dry-run --access public --tag dev` passed for all seven packages in dependency order.
- Pack inspections confirmed manifest entry points and alias dependency metadata.

After real publish:

- `npm dist-tag ls` verified `dev` and `latest` tags for all seven packages.
- A clean temporary consumer project installed `@tormnator/nuekit@dev` successfully with `bun install --minimum-release-age=0`.
- `bun run check` resolved the `nue-tor` bin and printed `Nue 2.0.0-beta.3-tor.1`.
- A minimal temporary project ran `nue-tor build` and produced `.dist`.

## Important Local Machine Note

The local machine has a Bun minimum release age safety setting of 604800 seconds.

Immediately after publishing, local installs of fresh packages require:

```bash
bun install --minimum-release-age=0
```

This is a local safety override for verification of newly published packages. It does not indicate a package publish failure.