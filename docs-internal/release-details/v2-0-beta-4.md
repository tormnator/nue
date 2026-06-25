# Release Details - Nue 2.0 Beta 4 (v2-0-beta-4)

**Status:** Open
**CRI:** v2-0-beta-4
**Cycle start:** 2026-06-24
**Branch:** dev

## Scope

Beta 4 starts with a Nuekit HMR fix for stale `site.yaml` config values during `nue server`.

## Package Tracking

| Package | Planned change | Version | Notes |
|---|---|---|---|
| `@tormnator/nuekit` | HMR config refresh fix | TBD | Issue #33 |

## Release Log

| Date | Item | Notes |
|---|---|---|
| 2026-06-24 | Cycle opened | Started for issue #33. |
| 2026-06-24 | HMR config refresh fix | Landed on `dev` in `b584464f`. |

## Validation Log

| Date | Validation | Result |
|---|---|---|
| 2026-06-24 | `bun test packages/nuekit/test/conf.test.js` | Pass |
| 2026-06-24 | `bun test packages/nuekit/test` | 179 pass, 3 skip, 0 fail |
| 2026-06-24 | Manual temp-site `site.yaml` refresh check | Removed key stopped rendering without server restart |

## Known Limitations

- Runtime infrastructure config changes may still require restarting `nue server` unless this cycle explicitly changes that behavior.

## Source Material

- GitHub issue: https://github.com/tormnator/nue/issues/33