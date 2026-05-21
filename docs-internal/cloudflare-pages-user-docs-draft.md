# Cloudflare Pages Platform Adapter

> **User-facing documentation draft.** This file is written as user-facing documentation, but it lives in `docs-internal/` until the adapter is ready to publish. Promote or rewrite it into `packages/www/docs/` only after the feature scope and production-resource story are approved.

The Cloudflare Pages Platform Adapter prepares a Nue site for deployment to Cloudflare Pages. It keeps static sites static by default and generates a Pages Advanced Mode worker only when your project needs runtime behavior.

## Enable The Adapter

Add `platform: cloudflare-pages` to `site.yaml`:

```yaml
platform: cloudflare-pages
```

Then build normally:

```bash
nue build
```

## What Gets Built

For regular static MPA sites, Nue writes the normal `.dist/` output and does not create `_worker.js` in `auto` mode.

For projects with server routes or SPA fallback routes, Nue also generates `.dist/_worker.js`. This file uses Cloudflare Pages Advanced Mode and handles the runtime behavior required by your project.

## Request Handling

When `_worker.js` is generated, requests are handled in this order:

1. Nueserver API routes are matched and dispatched first.
2. Static files are served through Cloudflare Pages assets.
3. Extensionless 404s can fall back to an SPA shell, such as `/admin/`.
4. Other missing files return the normal static 404.

This means content-heavy MPA pages remain static, while application areas can still use server routes and SPA navigation.

## SPA Fallback

A body-scoped DHTML `index.html` acts as an SPA entry. For example, `admin/index.html` can handle routes such as `/admin/123` after deployment. Nue records these fallback entries during build and emits them into the generated worker.

Nested SPA entries are preferred before broader root fallbacks, so `/admin/123` resolves to the admin SPA shell before a root SPA fallback.

## Current Limitations

Production environment resources are not implemented yet. Local development can provide JSON-backed mock models such as `c.env.users`, but Cloudflare production needs a future adapter resource layer for users, sessions, D1, KV, and related platform services.

Native `nue push` deployment is also not implemented yet. For now, validate deployment through Cloudflare Pages GitHub integration by committing the project and configuring Pages to build with `nue build`.

Cloudflare Pages `/functions` folder output is intentionally not supported. Nue uses Pages Advanced Mode so it can keep its own Nueserver routing and SPA fallback behavior in one generated worker.