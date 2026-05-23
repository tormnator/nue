# Cloudflare Deployment Handoff

Date: 2026-05-23

This note is for resuming the platform adapter and Cloudflare Pages deployment work after the first `@tormnator` npm package publication.

## Current State

The first public `@tormnator` Nue package set has been published from Git `dev` branch commit `eccbecd7`.

For exact package versions, publish order, tags, and validation details, see [First `@tormnator` npm Publish Record](./first-tormnator-npm-publish-record.md).

For versioning, publish policy, and release workflow, see [npm Versioning and Publishing Policy](./npm-versioning-publishing-policy.md).

For why package manifests use npm aliases while JavaScript imports stay unscoped, see [Package Alias Resolution](./package-alias-resolution.md).

## Package to Consume

Use the published forked CLI package:

```text
@tormnator/nuekit@dev
```

The CLI bin is:

```text
nue-tor
```

Expected build script shape for test projects:

```json
{
  "scripts": {
    "build": "nue-tor build"
  },
  "dependencies": {
    "@tormnator/nuekit": "dev"
  }
}
```

If using an npm alias in a consumer project is preferred, this shape is also valid:

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

## Local Verification Caveat

This machine has Bun's minimum release age protection enabled globally.

When testing immediately after a fresh publish, local installs may need:

```bash
bun install --minimum-release-age=0
```

Cloudflare Pages will only need this if the same safety policy is configured in that environment.

## Suggested Next Steps

1. Update the minimal Cloudflare Pages demo or target test site to consume `@tormnator/nuekit@dev`.
2. Run a clean local install/build using `nue-tor build`.
3. Confirm `.dist` output matches Cloudflare Pages expectations.
4. Push the test project and verify Cloudflare Pages Git integration can install the package and run the build command.
5. If Cloudflare uses frozen lockfiles, decide whether the test project should track npm dist-tag `dev` dynamically or commit lockfile updates deliberately.

## Known Good Smoke Test

A temporary local consumer project successfully installed `@tormnator/nuekit@dev`, resolved `nue-tor`, and ran `nue-tor build` against a minimal `index.html`, producing `.dist`.

Use that as the baseline expectation for the Cloudflare adapter/deployment session.