# PR Draft: HTML Layout Precedence And Root Index Discovery

## Title

Fix HTML layout precedence and root `index.html` asset discovery

## Summary

This PR fixes two closely related HTML layout resolution problems in Nuekit:

1. HTML layout modules now resolve by page-relative specificity instead of incidental discovery order.
2. Root `index.html` pages no longer auto-discover unrelated nested UI/layout assets through the SPA discovery path.

Together, these changes make layout slot resolution match the documented inheritance model for multi-page sites.

## Problem

Nue auto-discovers layout modules from multiple locations, including page directories, app directories, root files, and `@shared/ui/`. When multiple discovered files define the same slot, the effective winner could previously depend on asset ordering rather than explicit specificity.

This became especially visible when a root `index.html` page leaked unrelated nested layout assets into its dependency set. Once those unrelated assets entered the candidate set, the layout ranking could still produce a wrong user-facing result.

## Changes

### HTML precedence

- rank discovered HTML library assets by page-relative scope before slot resolution
- prefer more local directories over broader ones
- prefer a directory over its own `ui/` subdirectory
- prefer root layout files over `@shared/ui`

### Root `index.html` discovery

- restrict SPA subtree discovery to explicit SPA entry pages
- prevent root multi-page `index.html` from discovering unrelated nested app UI/layout files
- preserve intended subtree inclusion for real SPA entry points

## Files

- `packages/nuekit/src/asset.js`
- `packages/nuekit/src/deps.js`
- `packages/nuekit/test/render/md.test.js`
- `packages/nuekit/test/deps.test.js`
- `packages/nuekit/test/render/asset-render.test.js`
- `packages/www/docs/layout-system.md`
- `packages/www/docs/page-dependencies.md`

## Validation

- added focused precedence tests for markdown pages
- added focused dependency regression for root `index.html`
- added focused render regression for root `index.html`
- full Nuekit suite passed during integration validation

## User-facing result

- app/page-local layout modules override broader/global ones for the same slot
- root home pages no longer render layout modules from unrelated app subtrees
- HTML layout behavior is more predictable from project structure alone

## Notes

- This PR intentionally keeps HTML precedence as a winner-selection category separate from CSS/JS accumulation ordering.
- The root `index.html` discovery fix is included here because it directly affects which HTML layout modules enter the candidate set.