# Changelog

All notable changes to `@tormnator/nuemark` are documented here.

## [0.7.1-tor.1](../www/docs/releases/v2-0-beta-3.md) - 2026-05-23

### Added

- Initial `@tormnator` scoped package publication for the Beta 3 validation package set.

### Fixed

- `[image]` tag alt/figcaption logic so explicit `alt` text is not rendered as a visible figcaption and captions are not duplicated into `alt`.
- Multi-line HTML comment parsing so inner comment lines do not corrupt block indentation tracking.