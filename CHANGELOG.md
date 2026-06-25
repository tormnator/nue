# Changelog

All notable coordinated releases of the `tormnator/nue` fork are documented here.

This project follows the Keep a Changelog style. Package-specific changes are documented in package changelogs when a package has release-relevant changes or publish records.

## v2-0-beta-4 - Unreleased

### Fixed

- Nuekit HMR refreshes removed `site.yaml` config values without requiring a server restart.

## [v2-0-beta-3](packages/www/docs/releases/v2-0-beta-3.md) - 2026-06-13

Nue 2.0 Beta 3 is the first coordinated release of the `@tormnator` scoped npm package set. It adds the Cloudflare Pages platform adapter, the target-neutral `c.env` resource layer, D1-backed collection resources, deterministic template ZIPs, and the fork's release and branching policy foundations.

### Added

- Cloudflare Pages adapter for Pages Advanced Mode worker output.
- Target-neutral platform resource layer for server routes through `c.env`.
- Local JSON and Cloudflare D1 collection resources behind the same route-facing model API.
- Deterministic template ZIP generation and explicit `nue create` template sources.
- Fork release, publishing, package versioning, and branching policy documentation.

### Changed

- Server route model access now uses `c.env.models.<name>`.
- Full-template login/session behavior moved from Nue core into template-local route code.
- `nue create` defaults to the fork's official `main` branch templates.
- Wrangler config files are skipped during builds.

### Fixed

- Nuekit asset precedence across HTML, CSS, JS, YAML, JSON, and shared assets.
- HMR page/content and CSS updates leaking into unrelated browser sessions.
- Nuemark `[image]` alt/figcaption rendering and multi-line HTML comment parsing.
- `nue build --clean` on fresh checkouts with no `.dist` directory.
- Missing `<menu>` tag recognition and Windows path normalization carried into the Beta 3 line.

### Packages

- `@tormnator/nuekit@2.0.0-beta.3-tor.2`
- `@tormnator/nue-edgeserver@0.1.0-tor.2`
- `@tormnator/nuemark@0.7.1-tor.1`
- `@tormnator/nuedom@0.1.1-tor.1`
- `@tormnator/nuestate@0.1.1-tor.1`
- `@tormnator/nueyaml@0.1.0-tor.1`
- `@tormnator/nue-glow@0.2.5-tor.1`