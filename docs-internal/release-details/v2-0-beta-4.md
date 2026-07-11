# Release Details - Nue 2.0 Beta 4 (v2-0-beta-4)

**Status:** Open
**CRI:** v2-0-beta-4
**Cycle start:** 2026-06-24
**Branch:** dev

## Scope

Beta 4 starts with Nuekit fixes for HMR config refresh, client-side history handling, and dev watcher directory handling.

## Package Tracking

| Package | Planned change | Version | Notes |
|---|---|---|---|
| `@tormnator/nuekit` | HMR config refresh; refresh/history fix; dev watcher directory handling | TBD | Issues #33, #34, #35. No mid-cycle npm `dev` publish planned. |

## Release Log

| Date | Item | Notes |
|---|---|---|
| 2026-06-24 | Cycle opened | Started for issue #33. |
| 2026-06-24 | HMR config refresh fix | Landed on `dev` in `b584464f`. |
| 2026-06-24 | Client refresh/history fix | Source commit `50da66fc` for issue #34. Affects published `@tormnator/nuekit@2.0.0-beta.3-tor.2` and deployed sites with `view_transitions: true`. |
| 2026-07-10 | Dev watcher directory fix | Source commit `80297443` for issue #35. Prevents dotted directories from being read as files, preserves ignore patterns during directory scans, and excludes generated `.dist` assets from development dependencies. |

## Validation Log

| Date | Validation | Result |
|---|---|---|
| 2026-06-24 | `bun test packages/nuekit/test/conf.test.js` | Pass |
| 2026-06-24 | `bun test packages/nuekit/test` | 179 pass, 3 skip, 0 fail |
| 2026-06-24 | Manual temp-site `site.yaml` refresh check | Removed key stopped rendering without server restart |
| 2026-06-24 | `bun test packages/nuekit/test/client/transitions.test.js` | 1 pass, 0 fail |
| 2026-06-24 | `bun test packages/nuekit/test` | 180 pass, 3 skip, 0 fail |
| 2026-06-24 | Headless browser reload check, `nue serve` on `packages/www` | `history.length` stayed 2 -> 2 after three reloads |
| 2026-06-24 | Headless browser reload check, `nue preview` on `packages/www` | `history.length` stayed 2 -> 2 after three reloads |
| 2026-07-10 | Watcher regression baseline on unmodified `dev` | 4 expected failures confirmed: default `.dist` exclusion, dotted-directory callback, nested ignore propagation, and `.dist` callback suppression |
| 2026-07-10 | `bun test packages/nuekit/test/conf.test.js packages/nuekit/test/fswatch.test.js` | 20 pass, 1 skip, 0 fail |
| 2026-07-10 | `bun test packages/nuekit/test` | 183 pass, 3 skip, 0 fail |
| 2026-07-10 | Manual `nue serve` check on `sites/nue` | `docs/2.0-beta` directory activity returned HTTP 200 with no `EISDIR`; `.dist` CSS activity left 10 source styles and 0 `/.dist/` styles |

## Known Limitations

- Runtime infrastructure config changes may still require restarting `nue server` unless this cycle explicitly changes that behavior.

## Source Material

- GitHub issue: https://github.com/tormnator/nue/issues/33
- GitHub issue: https://github.com/tormnator/nue/issues/34
- GitHub issue: https://github.com/tormnator/nue/issues/35