# Pocket Camera album investigation — 2 November 2026

## Review state

Requested by Mr. Johansson: investigate photographs missing between sessions/updates, preserve all existing data,
add reproducible reload/update/offline/session regression tests, and supply a reviewable correction.
Base main: `e00b7167a768469d21b99946f3d4cb60cd252411`.
Branch: `codex/pocket-camera-album-preservation`. Candidate version `v2026.11.02.1`, release key `20261102album1`.
**Review only; not merged or deployed.** PR/check references and final evidence will be appended after verification.
PR #424 remains a separate open action-icon change; this correction does not incorporate or replace its artwork.
Published Save/Share/Enhance from #414 and current Look/screen/retouch/offline behaviour are retained.

## Specific findings on the published implementation

| Finding | Evidence on the base | Consequence |
| --- | --- | --- |
| Any initial read/render failure is converted into an empty in-memory album | `app.js` loadShots catch sets `state.shots=[]` | Existing photographs can disappear from the display without deletion |
| Opening Album and returning to the app do not re-read storage | openAlbum only renders the cached array; visibility handler only resumes camera | A temporary failure persists for that page session |
| Failed deletion is swallowed | deleteShot rejection is ignored before filtering the array and announcing success | A stored photograph can disappear from the display until reload |
| A malformed thumbnail can throw in URL.createObjectURL | renderRoll/renderGrid have no per-record fallback | One bad record can disrupt other photographs |
| Blocked database opening never settles | no blocked handler or deadline | Album can remain indefinitely unavailable |
| New photographs use put with a short timestamp/random key | album.js addShot | A forced key collision silently overwrites an earlier photo; this was deterministically reproduced, not observed on the owner's device |
| Old v1/v2 code opens a now-v3 database with a lower explicit version | historic album modules | VersionError is possible for an old in-memory/offline bundle; not established as the owner's trigger |

History confirms the database name `office-pocket-camera`, `shots` store and `id` key are stable. Version 2 adds
stickers; version 3 adds metadata. No upgrade clears or deletes stores. Current writes already await transaction
completion; the first 29 October build acknowledged request success before completion, fixed about 33 minutes later.
Manifest id/start_url/scope remain `/camera/`. Worker updates delete only `pocket-camera-*` caches, not IndexedDB.
No runtime database reset/clear or deletion was used for investigation or correction.

These findings prove reproducible application faults. They do **not** establish whether the owner's physical
Safari/Home Screen container still contains the missing photographs.

## Correction

- Failed reads keep the last successful rows and show an explicit error/retry state, distinct from an empty album.
  Opening Album, pageshow and foreground return re-read storage; concurrent reads deduplicate and revision checks
  prevent a pending old read from undoing an in-session save/delete.
- Thumbnail/recipe errors are isolated per record. Bad preview fields fall back to saved images; records lacking
  image bytes remain visible as backup-preserved placeholders. Failed deletions keep their row and report failure.
- IndexedDB open and transactions have bounded ten-second deadlines. Blocked opens surface an actionable error;
  stale readonly operations retry once on a new connection. A begun write is never replayed. Late events from an
  old handle cannot invalidate its replacement. Synchronous request errors abort the transaction.
- New shots use UUID plus add, so collisions fail rather than overwrite. Strict write durability is requested with
  a legacy-engine fallback. Save confirmation continues to wait for transaction completion, including late aborts.
- The database remains schema 3 with the same stores. A newer existing schema may be read/exported through its
  known compatible stores, but writes are refused until the app is updated. This is not a complete future-schema dump.
- Persistence requests return a checked result, never an unhandled rejection. Album storage details identify the
  origin, browser/Home Screen context, stored record/sample counts and whether persistence was actually granted.

## Backup and restoration

Album → **Backup and album storage** → **Prepare backup** → **Save backup**. The second explicit tap saves a prepared
`.pocket-camera.json` file without depending on Safari retaining transient activation across asynchronous encoding.
It contains the current album's finished images, original sources, thumbnails, full recipes, custom stickers and
sample metadata. Nothing is uploaded. Keep the resulting file in Files outside browser storage.

Restore validates the format/version, whole-file SHA-256 and every image's SHA-256 before opening a write transaction.
It adds all new photo/sticker rows atomically, skips byte-identical existing IDs, and refuses a conflicting ID rather
than replacing it. A concurrent insertion collision or quota failure aborts additions. No restore clears a store.
Supported current field values include objects, arrays, Date, Blob/File and JSON scalar/undefined/non-finite numbers.
Unsupported types fail explicitly rather than being silently omitted. Limits: **256 MiB file / 192 MiB image bytes**
plus bounded record/depth complexity. Larger albums need separate exports or a later streaming format.
The duplicate skip comparison uses a preflight snapshot; simultaneous deletion by another tab can make its skip count
stale. Do not edit/delete the album from a second tab during restoration.

## Verification and limits

[Local verification record](qa/2026-11-02-album/local-verification.json): all **19 Camera unit suites**, including
**25** storage fault tests, **13** backup tests and **15** real-controller/DOM-mock album tests, pass. Syntax,
whitespace, one-address module checks and regenerated offline inventory/hash/worker pin pass (326 public assets).
Controller tests include initial failure/retry, retained rows, concurrent reads, save/delete revision races, malformed
previews/recipes and honest deletion. Storage tests include blocked/hung/closed connections, readonly retry limits,
strict-durability fallback, late abort, quota failure, schema safety and atomic snapshots/restores.

Local Playwright Chromium and WebKit binaries are absent; both attempts stop before navigation. No local browser
pass, physical iPhone/iPad test, actual camera/native Share or long-term OS eviction test is claimed.
New `album.browser.mjs` and CI jobs exercise disposable persistent profiles: schema 1/2/3 upgrade, exact per-Blob
hash/recipe comparisons, ordinary reloads, three process sessions, aborted insertion, backup transfer to another profile,
conflict rejection, real published #414 worker → candidate update, other-cache retention and offline cold restarts.
Chromium also tests actual UI failure/retry/delete/thumbnail handling. WebKit storage/worker checks do not establish
installed iOS behaviour. Hosted results must be recorded before calling this correction verified.

## Safari, recovery and sources

- [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/): persistence is granted heuristically;
  check persisted/persist results. Best-effort storage may be evicted by origin under storage/overall-quota pressure.
  Origin quota exhaustion instead causes a failed write. A storage estimate does not prove eviction occurred.
- [WebKit tracking prevention](https://webkit.org/tracking-prevention/): Home Screen first-party website data is isolated
  from Safari and exempt from the ITP seven-day inactivity cap. Do not describe all installed apps as expiring weekly.
- [Apple Home Screen app explanation](https://developer.apple.com/videos/play/wwdc2023/10120/): separate storage context.
- [WebKit connection-loss report](https://bugs.webkit.org/show_bug.cgi?id=277615), especially comment 31, and
  [recovery fix](https://bugs.webkit.org/show_bug.cgi?id=309386): stale connections can fail while records remain;
  reopening/retrying is appropriate. No claim that this particular browser bug affected the owner.

A successful read with nonzero records but failed previews indicates a display/record problem. A read failure is
not an empty album. A successful zero count proves only that the **current context/database** is empty: it cannot
by itself distinguish first use, another browser/PWA container, intentional deletion or eviction. No sentinel can
prove eviction if it was removed with the origin. Service-worker caches contain public assets, not private photos.

If Safari has already deleted the underlying image bytes, this application cannot reconstruct them. An external
backup or existing Photos/Files copy is necessary; a finished-image copy may lack originals and editable recipes.
Check the existing installed icon and ordinary Safari separately without clearing data, uninstalling or reinstalling.

## Remaining acceptance

Verify actual iPhone/iPad installed app, ordinary Safari separately, five reloads, several background/return sessions,
an OS restart, normal Update action, Airplane Mode cold launch and backup→Files→restore on disposable test albums.
Compare record IDs plus original/finished/thumbnail hashes and recipes. Do not experiment destructively on the owner's
only photo copy. The unused updateShot helper retains its pre-existing last-writer-wins read/put race; no active
application path calls it, and this work does not introduce an overwrite-in-place UI.

## First hosted review and follow-up

Draft PR [#425](https://github.com/nj22az/nj22az.github.io/pull/425), initial source
`5589834467675b3457b010ebf032d380d7ec81e0`, exact tree `3724eba595174ba67c327cd2acd31a11250f732b`.
Run [41395300147](https://github.com/nj22az/nj22az.github.io/actions/runs/41395300147) **positively reproduced the
published display defect** against exact base app `e00b7167`: the stored image/hash remained intact, its displayed
row was absent, and opening Album issued no new read. The candidate passed the corresponding four UI recovery cases.
UI82, shader audit50, Smart14, retouch40/screens5 and offline13 passed in this initial run.
The new Chromium/WebKit storage jobs passed old-schema/reloads/three-process/abort/backup/worker-cache checks but failed
the first cold offline navigation. Their first cache-completeness predicate was not sufficient evidence of activated
worker readiness. The follow-up requires the exact active/controller identity, candidate BUILD/manifest version,
a readiness reply from that controller, actual online app startup, and a same-process offline navigation before closing
and reopening. All original data/hash/cache assertions remain; no runtime worker change is made. Result pending.

MCP run 41395299991 passed15 policy tests and caught the adapter's remaining old **album** query key (the renderer key
had been aligned already). Both album imports now match the app. Local MCP execution was blocked by missing SDK
dependencies and is not a pass; the initial PR wording that grouped it with local passing checks is superseded here.
The follow-up also downloads a real backup through the UI, restores through its file picker, checks no duplication,
and records phone/tablet backup and error screenshots. These are generated fixture data, not personal photographs.

Second source `3b5601c70712364787ab19df4f0aaef86d61c26d`, tree `bfbbf7fe35c746a2970cdbcfe56f87c3be02c276`:
MCP [41395754296](https://github.com/nj22az/nj22az.github.io/actions/runs/41395754296) now passes **16/16 policy +
20/20 real Camera acceptance**. Chromium passed the five real album UI cases, including backup download/file-picker
restore and exact no-duplicate verification. Phone error/backup and tablet backup screenshots were downloaded with
artifact SHA-256/ZIP CRC/path checks and visually inspected; the status, retained rows and controls are readable.
The stronger minimal-harness worker check still timed out awaiting its readiness message on both engines, despite
an exact active/cache predicate. No cold-restart pass is claimed from either incomplete album job. The next test-only
follow-up inspects Chromium's live worker BUILD, starts message delivery explicitly, loads the actual app before the
message handshake, and logs worker errors/replies/controller states to distinguish a fixture issue from runtime loss.
The existing full offline suite passed on the unchanged runtime in the first run; this is separate from the new
uncompleted cross-version fixture. No assertion, photograph hash comparison or runtime worker is weakened/changed.

Third source `bba11f09040c1f90e706afb5380ab06c148c55cb` confirmed the fixture fault: after online app registration,
its captured controller became redundant while the active candidate sent three correct ready/version replies from
its replacement. The test incorrectly compared those replies with the retired object. The follow-up tracks the
**current** controller on every reply and after awaiting registration, requires current===active and activated,
and re-requests status on controllerchange. Exact BUILD/cache/version/data/offline assertions remain.
The Album shortcut's screen-reader label now also distinguishes unavailable/loading from a zero-photo count;
the initial-failure regression asserts this. The offline manifest/digest is regenerated; all19 unit suites pass.

Final preservation follow-up: a prepared backup download is retired after committed saves/deletes/restores or a fresh
album read, so the UI cannot offer an old snapshot as the current album after data changes. A focused regression
verifies this; album-controller units now **16/16**. All19 unit suites pass and offline hashes are regenerated.

Fourth source `2d540601d066b626ebaf12e58e4e22a08c7dac3c`: **25/25 Chromium album checks pass**, including
cross-version activation, portable restore/conflicts and two offline cold starts. The WebKit failure now occurs at
warm offline navigation, after correct readiness. This matches [Playwright #42775](https://github.com/microsoft/playwright/issues/42775):
the affected offline emulation rejects even a literal service-worker Response. The issue is now closed, but this
project's pinned1.62.1 remains affected. WebKit's fixture now destroys all origin HTTP connections instead, keeps that
cut across cold starts, and checks newly blocked requests plus zero successful HTTP responses in each phase.
This is an origin-unavailability test, not an identical substitute for a real Airplane Mode/installed Safari test.
Chromium retains its browser-offline emulation. No data/cache/backup assertion is removed or weakened.
The separate Linux job repeats exactly its two documented World fixture failures: ferry spawn[0.3,-72.7] versus
[-1.5,-72.7], and ferry paint/metal counted at the post-office lot. No World runtime or assertion is changed here.

Independent final review found a further asynchronous freshness race: a commit could invalidate a backup while it
was still encoding, before its download URL existed. Preparation now captures an invalidation generation and refuses
to publish the file if a commit/fresh read changed it during encoding. A delayed-encoding regression covers this.
Album-controller units now **17/17**; all19 suites and regenerated offline hashes pass. This changes only which prepared
snapshot is offered; stored photos and restore inputs remain untouched.
