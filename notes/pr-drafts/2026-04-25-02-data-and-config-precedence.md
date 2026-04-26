# PR Draft: Data And Config Precedence

## Title

Fix template data base-layer precedence and nested app config cascade

## Summary

This PR aligns Nuekit's data and configuration precedence with the documented cascade model.

It fixes three related behaviors:

1. shared template data from `@shared/data` now behaves as the broad base layer
2. nested `app.yaml` files now cascade from broader scope to deeper scope
3. `.json` template data now participates in the same discovery and merge model as `.yaml`

## Problem

Before these changes:

- shared data could be merged too late, acting like a stronger override instead of a base layer
- `asset.config()` could stop at the first matching `app.yaml` instead of cascading through all applicable levels
- docs described JSON template data parity with YAML, but JSON was not actually discovered and merged through the page data pipeline

## Changes

### Shared data behavior

- split shared static data parsing from shared data modifier scripts
- merge static shared data before root/app/page data
- keep shared JS/TS data modifiers running after the merged data object exists

### Nested app config cascade

- merge all matching `app.yaml` files in broad-to-specific order
- keep deeper `app.yaml` values as the later override layer

### JSON parity

- include `.json` in page dependency discovery
- merge page/app JSON data through the same path as YAML
- fix JSON parsing in `asset.parse()`

## Files

- `packages/nuekit/src/asset.js`
- `packages/nuekit/src/deps.js`
- `packages/nuekit/src/site.js`
- `packages/nuekit/test/conf.test.js`
- `packages/www/docs/template-data.md`
- `packages/www/docs/page-dependencies.md`

## Validation

- added focused tests for shared data base-layer precedence
- added focused tests for nested `app.yaml` cascade
- added focused tests for JSON template data parity with YAML
- full Nuekit suite passed during integration validation

## User-facing result

- `@shared/data` now behaves like the documented broad base layer
- nested `app.yaml` files now cascade predictably from parent scope to child scope
- JSON template data now works alongside YAML in the same discovery and merge hierarchy

## Notes

- Root-level `app.yaml` is also merged if present, which is consistent with the implemented cascade model even though the docs focus on site-level `site.yaml` and app-level `app.yaml`.