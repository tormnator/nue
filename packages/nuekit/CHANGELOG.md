# Changelog

All notable changes to `@tormnator/nuekit` are documented here.

## Unreleased

### Fixed

- HMR refreshes removed `site.yaml` config values without requiring a server restart.

## [2.0.0-beta.3-tor.2](../www/docs/releases/v2-0-beta-3.md) - 2026-06-13

### Added

- Cloudflare Pages platform adapter for Pages Advanced Mode worker output.
- Platform adapter foundation with adapter registry, platform context, runtime requirement detection, and post-build hooks.
- Target-neutral server route resource layer through `c.env`.
- `createConfigResource`, `createResourceEnv`, and `createCollectionResource` helpers.
- Local JSON and Cloudflare D1-backed collection model resources under `c.env.models`.
- Deterministic template ZIP generation through `bun run templates:zip`.
- `nue create` support for fork default templates, explicit remote template sources, and local template checkouts.

### Changed

- Server route model access changed from top-level `c.env.<name>` model properties to `c.env.models.<name>`.
- The full template now owns demo login/session behavior in template-local server route code.
- `nue create` defaults to `https://github.com/tormnator/nue/raw/main/packages/templates`.
- Wrangler configuration files are skipped during builds.
- Cloudflare Pages support targets Advanced Mode worker output; `functions/` output is intentionally unsupported.

### Fixed

- HTML layout, CSS, JS, YAML, JSON, and shared-asset precedence behavior.
- Root `index.html` SPA discovery leak and missing `home/` asset inclusion.
- HMR content navigation and CSS reloads leaking into unrelated browser sessions.
- `nue build --clean` when `.dist` does not exist.
- Missing `<menu>` HTML element recognition.

## [2.0.0-beta.3-tor.1](../www/docs/releases/v2-0-beta-3.md) - 2026-05-23

### Added

- Initial `@tormnator` scoped Nuekit package publication for the Beta 3 validation package set.
- Early Beta 3 platform adapter, Cloudflare Pages adapter, asset precedence, HMR, Windows path, HTML parser, and build-clean fixes available at the first scoped publish point.