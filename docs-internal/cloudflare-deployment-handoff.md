# Cloudflare Deployment Handoff

Date: 2026-05-23

This note records the platform adapter and Cloudflare Pages deployment work after the first `@tormnator` npm package publication.

## Current State

The first public `@tormnator` Nue package set has been published from Git `dev` branch commit `eccbecd7`.

Cloudflare Pages Git integration has now been validated with a private GitHub demo repository consuming `@tormnator/nuekit@dev`.

Validated deployment paths:

- Production deployment from `main`, including automatic redeploy after pushing commit `c3498ba`.
- Preview deployment from `dev` at `https://7ff529b1.nue-cf-pages-git-integration.pages.dev/` after pushing commit `89b39ac`.

Validated runtime behavior:

- `/api/ping` returned the bundled `@shared/server` route response.
- `/dashboard` returned 200 as an extensionless SPA fallback route.
- `/missing.txt` returned 404 rather than the SPA shell.

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

1. Promote or rewrite the Cloudflare Pages user docs from `docs-internal/` into the public docs when the adapter scope is approved.
2. Keep the demo project available as a smoke test for future adapter or package publishing changes.
3. Decide whether future Git integration demos should track the npm dist-tag `dev` dynamically or commit lockfile updates deliberately.

## Known Good Smoke Test

A temporary local consumer project successfully installed `@tormnator/nuekit@dev`, resolved `nue-tor`, and ran `nue-tor build` against a minimal `index.html`, producing `.dist`.

Use that as the baseline expectation for the Cloudflare adapter/deployment session.