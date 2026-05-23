# Package Alias Resolution

## Context

This fork publishes Nue packages under the scoped `@tormnator` npm namespace, while keeping existing JavaScript imports on the original unscoped package names.

Example source import:

```js
import { parseYAML } from 'nueyaml'
```

Example published package identity:

```text
@tormnator/nueyaml
```

These are intentionally different names.

The unscoped name is the source-level import contract inherited from upstream Nue.
The scoped name is the npm package identity for this fork.

## Decision

Keep JavaScript imports stable and unscoped.

Map those unscoped dependency names to scoped fork packages in `package.json` with npm aliases.

Example:

```json
{
  "dependencies": {
    "nueyaml": "npm:@tormnator/nueyaml@0.1.0-tor.1"
  }
}
```

This means:

```text
Code imports:        nueyaml
Installed alias key: nueyaml
Resolved package:    @tormnator/nueyaml@0.1.0-tor.1
```

The source code remains compatible with upstream-style imports, while consumers install the forked package set.

## Why `node_modules` and `bun.lock` Show Both Names

After `bun install`, local workspace packages can appear under both their real scoped package names and their unscoped alias names.

Example local resolution shape:

```text
packages/nuekit/node_modules/nueyaml
  -> ../../nueyaml

packages/nuekit/node_modules/@tormnator/nueyaml
  -> ../../../nueyaml
```

This is not two copies of the package.
It is two resolution names pointing at the same local workspace package.

`bun.lock` records the same idea:

```js
"@tormnator/nueyaml": ["@tormnator/nueyaml@workspace:packages/nueyaml"],
"nueyaml": ["@tormnator/nueyaml@workspace:packages/nueyaml"]
```

The scoped entry records the actual workspace package identity.
The unscoped entry records the alias name that satisfies imports such as `import ... from 'nueyaml'`.

## Why Not Use Only `workspace:*`

`workspace:*` is useful when the dependency key is the actual workspace package name.

Example:

```json
{
  "dependencies": {
    "@tormnator/nueyaml": "workspace:*"
  }
}
```

That shape works naturally with scoped source imports:

```js
import { parseYAML } from '@tormnator/nueyaml'
```

But the current architecture keeps source imports unscoped:

```js
import { parseYAML } from 'nueyaml'
```

Using only `@tormnator/nueyaml: workspace:*` would not provide the unscoped package name `nueyaml` for those imports.

Using `"nueyaml": "workspace:*"` is not the right expression either, because the actual workspace package is no longer named `nueyaml`; it is named `@tormnator/nueyaml`.

The npm alias expresses the required mapping directly:

```json
"nueyaml": "npm:@tormnator/nueyaml@0.1.0-tor.1"
```

## Local Development Behavior

Inside the monorepo, Bun resolves the alias to the matching local workspace package when the package exists locally.

This allows local tests and runtime imports to work before the scoped packages have been published to npm.

Important local checks:

```bash
bun install --frozen-lockfile
bun test
bun publish --dry-run --access public --tag dev
```

Package-local `node_modules` folders are install artifacts and are ignored by Git.

Do not commit package-local `node_modules` folders.

## Published Consumer Behavior

Outside the monorepo, package managers resolve the alias from npm.

If a consumer installs `@tormnator/nuekit`, its dependency metadata can say:

```json
{
  "dependencies": {
    "nuemark": "npm:@tormnator/nuemark@0.7.1-tor.1"
  }
}
```

The consumer gets a dependency importable as `nuemark`, but the package content comes from `@tormnator/nuemark`.

This is why publish order matters:

1. Publish leaf packages such as `@tormnator/nueyaml` and `@tormnator/nue-glow`.
2. Publish packages that depend on them, such as `@tormnator/nuemark`.
3. Publish top-level packages such as `@tormnator/nuekit`.

## Trade-Offs

Benefits:

- JavaScript imports stay stable and upstream-compatible.
- Generated/user-facing code can keep importing unscoped Nue package names.
- Published packages still clearly identify this fork through the `@tormnator` scope.
- Local Bun workspaces can resolve the alias to local package directories.

Costs:

- `bun.lock` contains both scoped package identities and unscoped alias entries.
- Package-local `node_modules` folders contain both scoped and unscoped symlinks.
- Dependency manifests are more subtle than plain scoped dependencies.
- Exact alias versions must be updated when publishing a coordinated new package set.

## Future Review

For the first scoped package set, use exact alias versions to keep external installs reproducible.

After the package line is stable in external consumers, review whether selected aliases can loosen to SemVer ranges or npm dist-tags.
Keep exact aliases for coordinated package-set releases unless there is a clear reason to allow independent dependency drift.