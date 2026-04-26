# PR Draft: CSS, JS, And Design Base Ordering

## Title

Fix CSS and JS asset ordering and clarify `design.base`

## Summary

This PR makes Nuekit's accumulation-order behavior explicit for CSS and JS assets and documents how `design.base` selects the stylesheet to promote to the front of the cascade.

## Problem

CSS and JS ordering previously depended on a mix of site sorting and incidental discovery order. That made the final load order harder to reason about and could conflict with the intended broad-to-specific cascade.

In addition, `sortAssets()` relied on malformed shared-priority logic, and `design.base` had documentation but no explicit implementation or documented matching rules.

## Changes

### Shared priority in site sorting

- give `@shared/*` files an explicit priority bucket in `sortAssets()`

### CSS and JS dependency ordering

- order dependencies broad-to-specific for accumulation categories
- load shared assets before root assets, then app/page assets
- preserve original discovery order for equal-rank ties so same-scope HTML component order is not disturbed

### `design.base`

- honor `design.base` by promoting one configured stylesheet to the front of the CSS list
- document that `design.base` can match either a filename or a project-relative path
- recommend a full project-relative path when deterministic matching matters

## Files

- `packages/nuekit/src/site.js`
- `packages/nuekit/src/deps.js`
- `packages/nuekit/src/render/head.js`
- `packages/nuekit/src/asset.js`
- `packages/nuekit/test/site.test.js`
- `packages/nuekit/test/deps.test.js`
- `packages/nuekit/test/render/head.test.js`
- `packages/nuekit/test/render/md.test.js`
- `packages/www/docs/css-development.md`

## Validation

- added focused `sortAssets()` regression coverage
- added focused CSS/JS dependency ordering coverage
- added focused `design.base` ordering coverage
- revalidated markdown HTML component ordering after the dependency-order change
- full Nuekit suite passed during integration validation

## User-facing result

- CSS and JS load in a more predictable broad-to-specific order
- `@shared` assets no longer depend on lexical sorting to come first
- `design.base` is now both implemented and documented more explicitly

## Notes

- `design.base` currently supports filename and project-relative path matching. If more than one stylesheet matches a filename or suffix, the first discovered match wins.
- A future optimization candidate remains in HTML component parsing, but this PR intentionally leaves that behavior unchanged to avoid correctness regressions.