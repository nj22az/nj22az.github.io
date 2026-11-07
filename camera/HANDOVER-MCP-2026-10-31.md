# Pocket Camera MCP — 31 October 2026

The owner instructed **“Push to main”** and requested full offline use. [PR #420](https://github.com/nj22az/nj22az.github.io/pull/420)
is **merged and deployed** at **a1125c62e38e9dcb507f6bd73dce1003cad1cee6**, identical tree to reviewed **ef4962533e9274051d2ac6670ecf7ceb324ba2cd**.
App/renderer/adapter imports align at **20261031offline1**. MCP **41228514058**, job **124617601234**, passed
**15/15 units + 20/20 actual acceptance**, fresh install and local audit **zero vulnerabilities**. Camera **302/302**,
World **569/569** and automated WebKit passed; Linux repeats two unchanged World failures. Pages **41229423812** passed;
[324/324 public requests match](qa/2026-10-31-offline/publication.json). Actual generated-image previews/JPEG and offline
screenshots/export were inspected and retained. [Current offline/publication handover](HANDOVER-OFFLINE-2026-10-31.md).

**Connection remains separate:** the official SDK acceptance client connects. Plugin Creator is installed; the owner's
Camera host and this chat remain unconnected until a real running host/private tunnel and workspace registration are
configured and verified. [MCP.md](MCP.md) records current local desktop and ChatGPT web setup. The server is still local
stdio in an isolated browser; no hosted endpoint, Safari/Photos access, new MCP tool or privacy/confirmation change was
added. Session album is temporary; export before close. Preview sends image pixels to the connected host. Physical
Safari/native Share/hardware camera remain untested. Earlier review/pending sections below are historical.

The subsequent [photo-aware Surprise review](HANDOVER-SMART-SHUFFLE-2026-10-31.md), [draft PR #419](https://github.com/nj22az/nj22az.github.io/pull/419),
aligns the adapter renderer import at **`20261031smart1`** on a review branch only. Source **`b795c7a02a721ff538b435e9aacd6126b3a868a8`**,
MCP run **41206756330**, job **124553287604**, passes **15/15 units + 20/20 real acceptance checks**, with **zero npm
vulnerabilities** on fresh installation and local audit. Generated-image previews and exported JPEG were inspected and
retained. No MCP tools or connection/privacy boundaries change. Main remains the published `20261031audit2` release
below. This photo-aware review is not deployed; the owner's installed host and this chat remain unconnected.

The owner subsequently instructed **“Push to main”**: [PR #418](https://github.com/nj22az/nj22az.github.io/pull/418) is
**merged and deployed**, main **`bd0507162dfa9d60cd891fd707893a7e22bcb618`**, identical tree to all-green reviewed
head **`d56ea1226b58738b7f313ce1c9765c9894684395`**. Keys, including the adapter's renderer import, align at
**`20261031audit2`**. Exact-head MCP **41196615769**, job **124523951297**, passed **15/15 units + 20/20 real
acceptance checks**, with zero npm vulnerabilities on fresh installation; Camera/UI/audit **275/275**, World guard,
automated WebKit **and Linux full acceptance passed**. Pages **41199773205** passed.
The [current publication handover](HANDOVER-DESIGN-AUDIT-2026-10-31.md) records exact source/check/deployment details
and the public-file verification. Older review/pending states below are historical.

**Connection remains local:** the SDK acceptance client connects; the owner's installed host and this chat are still
unconnected. Pull main, install pinned dependencies/Chromium, register/reconnect the absolute server path in
[MCP.md](MCP.md), and prove eleven-tool discovery plus a generated-image cycle in that host. Merging does not connect
Photos or an existing browser album. Preview shares pixels with the host, the session album is temporary, and approved
imports, copy-save and explicit save/export/close remain. Physical Safari/native Share/camera and AR remain open.

The owner subsequently authorised the three [UI layout fixes](HANDOVER-DESIGN-AUDIT-2026-10-31.md). This follow-up
keeps draft PR #418 and aligns all release/import keys at **`20261031audit2`**. Exact source **`9e28f6d4d3bf137f4d1b27b9e54d07190dc1c34e`**
passes **15/15 units + 20/20 actual MCP/Camera checks**, run **41195476147**, job **124520658675**, with **zero npm
vulnerabilities** on fresh installation. Generated-image previews and exported JPEG were inspected; the UI suite passes
**82/82**, shader audit **50/50**, and Camera **143/143**: **275/275 Camera/UI/audit checks**. Source parent
`aa6c3821` passed Camera, MCP, World/WebKit and Linux full acceptance. Approved imports, temporary album, preview-pixel
disclosure, copy-save and explicit save/export/close remain. Only the SDK client connects; the owner's installed host
and this chat are unconnected. Nothing in this follow-up publishes main; previous records below are historical.

A subsequent [design/shader audit](HANDOVER-DESIGN-AUDIT-2026-10-31.md), [draft PR #418](https://github.com/nj22az/nj22az.github.io/pull/418), is on review branch `codex/pocket-camera-design-audit`, not main. Its app/renderer/style and adapter import keys use `20261031audit1`; published main remains `20261031ui1`. On review source `d9a9f25b`, MCP run **41190783298**, job **124506977996**, passes **15/15 units + 20/20** actual MCP/Camera checks; fresh pinned installation reports **zero npm vulnerabilities**. Generated-image preview/export evidence was inspected. The SDK acceptance client connects; the owner's installed host and this chat remain unconnected. Approved imports, copy-save, explicit save/export/close, pixel disclosure and temporary-album/local stdio boundaries are retained. No AR service or browser/Photos connection was added.

The subsequent [Camera UI release](HANDOVER-UI-REVIEW-2026-10-31.md) is **published via PR #417**, main
**`51f071309f6b9e1dbd6977595004c6c60602a0ee`**, identical to tested `dd5997a775736f5990044ea9b2a210fc47a68211`.
App/main-style/renderer URL keys and the adapter import align at **`20261031ui1`**; renderer source and local stdio
privacy boundaries remain. Latest MCP run **41183839641**, job **124486593146**, passed **15/15 units + 20/20** real
acceptance checks with **zero npm findings**. Camera **143/143**, target-layout UI **57/57**, World **560/560** and
automated World WebKit passed. [Pages](https://github.com/nj22az/nj22az.github.io/actions/runs/41184647837) passed;
[44/44 public-address checks](qa/2026-10-31-ui/publication.json) match the release, including the adapter import key.

**Connection remains separate:** the official SDK acceptance client discovers all eleven tools and completes a
generated-image cycle. The owner's installed MCP host and this chat remain unconnected; use the absolute Node
server path and reconnect as described in [MCP.md](MCP.md), then prove discovery/import/edit/preview/save/export.
Physical iPhone/iPad Safari/native Share remain untested. The temporary album, approved-image imports, pixel-preview
disclosure and explicit save/export/close confirmation are unchanged. There is no hosted HTTP endpoint or personal
Photos/browser connection. Linux **41183839640** has passed build/faces/controller/native/offline stages; full World
acceptance remains running at publication. No Linux binary was released. This supersedes the older retry state below.

## Merged on the owner's instruction — 31 October 2026

The owner instructed **“Merge”**. [PR #416](https://github.com/nj22az/nj22az.github.io/pull/416) is **merged and closed**,
squash commit **`ffc02e29ff14a632cf05ae99f691b009af09f7c2`** on `main`, parent
`f49f22ba82e6d4b1fd9b5033f8bddc4d3eed903f`. The merge tree **`a50322bba3909057f1b17e9f4259eccc2dc0ded1`** is identical
to the reviewed head **`c689ee0ac837bfa6a143cf47e4700ee4de3a9c02`**. The merge used an expected-head guard and did not
change runtime files. Existing local changes remain preserved.

Final PR checks on `c689ee0a`:

- **MCP 41172757953**, job **124454030492**: **15/15 units + 20/20 real MCP/Camera checks**, no skips; fresh install
  reports **zero npm vulnerabilities**.
- **Camera regression 41172757896**, job **124454030217**: **143/143** browser checks (56 + 33 + 22 + 14 + 5 + 9 + 4),
  plus its unit/module/syntax checks, passed.
- **World 41172757870**: guard job **124454030173** and native WebKit/iPhone-simulation job **124454030285** passed.
  This is automated WebKit, not a physical iPhone test.
- **Linux 41172757918, attempt 1**, job **124454030269**: build, facial visibility and controller recovery passed.
  Native startup reported stability success, then its GPU process exited with `UnknownVizError` and lost WebGL
  before the native/disk-save stage completed. Offline/full-console stages were therefore not run. The Linux
  renderer, native entry point, Electron version and CI workflow are unchanged from main. Do not call this pass.
  The failed job was retried unchanged; **attempt 2**, job **124456571536**, remains in progress at this handover.
  The earlier retired-Mai test failure was separately corrected below. Full acceptance of the Riku replacement
  remains unverified until the retry reaches and completes that stage.

The merge proceeded under the owner's explicit instruction after the passing Camera/MCP/World checks and triage
of the unchanged Linux renderer's CI GPU crash. No checks, assertions, timeouts or graphics settings were weakened.
No new Linux binary release was published.

Pages deployment for the merge: [run 41173645390](https://github.com/nj22az/nj22az.github.io/actions/runs/41173645390).
The build, deploy and report jobs **all passed**. Post-merge World run **41173645762** is independent of the passing
PR guard and was still running at the handover check. Exact public-file verification is retained in
[publication-files.json](qa/2026-10-31-mcp-review/publication-files.json); this is byte verification, not another
physical-device or installed-client test. **13/13** checked HTTPS public files match the merge exactly: six unchanged
Camera entry/renderer/album/worker/frame files and all seven adapter modules. The final follow-up changes only
handover/documentation and this evidence.

**Connection remains local:** the adapter source and `.mcp.json` are on main. The owner's installed MCP client and
this chat are still unconnected; pull main, install the pinned dependencies/Chromium and register/reconnect the
absolute Node server path as described in [MCP.md](MCP.md). Merging does not create a hosted HTTP MCP endpoint.
The previous Camera UI/renderer, temporary-album boundaries and preview-pixel disclosure remain in force.

**Next action:** inspect Linux retry 41172757918 (attempt 2) to completion and investigate any remaining failure
without weakening coverage; complete the owner's local MCP-host setup. Do not claim physical Safari acceptance.

## Pre-merge preparation and Linux fixture correction — 31 October 2026

The owner subsequently instructed **“Merge”**, authorising PR #416 into `main` and its normal Pages deployment.
Verified review head `5095bb659ad51aae8ce8e40a7930362baa28d00f`: MCP **41169932260**, Camera regression
**41169932106**, and World guard/native WebKit **41169932042** all passed. There were no comments or review threads.
Linux **41169932045**, job **124445677667**, failed in `steam-deck/tools/console-smoke.cjs:206`: it timed out waiting
for `[data-person="Mai"]`, after controls/layout, native saves and offline checks passed.

The failing fixture is byte-identical on unchanged `main` `f49f22ba` and the review head (blob
`fb4087d54f963ea8f5d86340c040be000a44f0fc`). The live cast already excludes Mai and Mrs Nakamura under the owner's
31 October retirement decision. The test's exact roster assertion had passed; its later hard-coded child selection
was stale. Replace that selection with the active nine-year-old pupil **Riku**, retain the bed, stick-to-wake,
outdoor exit and full-roster checks, and add explicit active-resident and avatar assertions. No game or release
behaviour changes, no skipped coverage or enlarged timeouts. Re-run Linux acceptance before the authorised merge.
Local preflight: **42/42** existing Steam Deck tests passed, console script syntax and `git diff --check` passed;
Riku is in the live playable roster, sleeps at 01:00 and has the occupied home `kitahama-3`.
The final merge commit, check outcome and deployment result follow below once verified.

## Continuation review — 31 October 2026

The owner explicitly requested continuation of draft PR #416, not a rebuild, merge or publication.
Verified starting head **`3267eff1993bf276a0ee6700407f23a0fa8cbfa6`**; PR remains open/draft, with no conversation
comments or review threads at this review. MCP run **41167700821**, Camera regression **41167700721** and World guard
**41167700698** report success. Linux run **41167700800** initially reported `in_progress` at its final full-world
acceptance step and subsequently finished **cancelled**; it is not counted as passed. There were no local tracked changes at checkout. An unrelated untracked Sjöskolan
temporary video file is preserved and excluded from this work.

Changes in this review:

- Check original PNG/JPEG/WebP dimensions before importing. The old post-import check saw the app's already reduced
  dimensions (at most 16 megapixels) and could not enforce the promised 48-megapixel limit. Failed imports preserve
  the existing edit. Approved file reads also check the opened file identity and reject final symlink replacements.
- Use a Camera-only preview server: public resources and five shared shader/UI modules; no repository/dependency
  exposure, foreign Host/Origin, cross-site fetches or preview symlinks. The old shared server was demonstrated reading
  a synthetic file through a symlink outside its mount. World's shared development server and runtime are unchanged.
- Increase the bounded stdio input buffer to fit 20 MiB of image bytes encoded as base64. The SDK's default was only
  10 MiB. Close the isolated session on transport closure/errors as well as ordinary disconnect and signals.
- Expand units from 9 to **15** and real acceptance from 16 to **20** checks. The latter now loads the actual
  `.mcp.json` registration from outside the checkout, exercises both approved-file and base64 import, three Looks,
  all six adjustments, a real frame, oversized-import preservation, strict schemas and session separation.
- Apply only **Vite 7.3.6 → 7.3.7**, **Zod 4.6.5 → 4.6.6**, and transitive **source-map-js 1.2.1 → 1.2.2**.
  No unrelated package resolutions change. Audit dependency paths and applicability are in the review evidence.
- Root HANDOVER.md now links directly to this note, preserving the separate published release entries.

Local checks: **15/15 unit/lifecycle checks pass**, all seven adapter modules pass syntax checks, and `git diff --check`
passes. The post-update `npm audit --prefix johansson-town --json` reports **zero vulnerabilities** (before: three high).
Local real-browser acceptance initializes and discovers all eleven tools but cannot open Chromium: the managed executor
denies Chromium's required Unix socket (`process_singleton_posix.cc`, `socket(): Operation not permitted`). The default
Playwright download also returned invalid ZIPs; a valid official Chromium 149.0.7827.55 archive was obtained and tested,
which exposed the socket restriction. Do not present the two successful discovery checks as a completed editing cycle.

### Verified source and results

Review implementation: **`23ead95974b5362aa1042b9368fb89b630de4108`**, tree
**`0213ec74fa7b75edefa176a95f4b24e355ad6901`**, parent `3267eff1993bf276a0ee6700407f23a0fa8cbfa6`.
The final handover/evidence follow-up changes documentation and retained test records only.
The unauthenticated shell Git push was unavailable; the connected GitHub API created the identical verified tree,
and advanced only `codex/pocket-camera-mcp` without force. The local checkout was aligned only after tree equality
was verified; the unrelated untracked file remains present.

**Hosted MCP:** [run 41169563788](https://github.com/nj22az/nj22az.github.io/actions/runs/41169563788), job
**124444372569**, **15/15 units + 20/20 real MCP-to-Camera acceptance**, no skips. The full log confirms a fresh
`npm ci` with **zero vulnerabilities** and tests merge candidate **`ce31b6ce1e3f93db55b64214a7998bf888283a51`**
(`23ead959` into `f49f22ba`). This supersedes the original implementation's 9/16 totals below.

[Artifact 13030695442](https://github.com/nj22az/nj22az.github.io/actions/runs/41169563788/artifacts/13030695442)
contains before/after previews, saved JPEG and `results.json`. Its downloaded ZIP matches both the upload log and
GitHub digest: **`16566b783e6df279e232b5948770a79c70e06535e61cf14692280336b4960efc`**.
All three images were opened and inspected: default Pocket rendering, cropped three-Look treatment with Drawing
paper and a Print border, and the corresponding **256 × 192 JPEG**. These are synthetic functional checks, not a
photographic art audit. A durable copy is retained as
[camera-mcp-review-evidence.zip](https://chatgpt.com/library?file_id=libfile_d1ef221fa6d48191af1c756a8e87fec8&account_id=personal).
The machine-readable result and dependency/security review are also in
[qa/2026-10-31-mcp-review/](qa/2026-10-31-mcp-review/README.md).

**Local compatibility:** full World guard **560/560**, **109 files**, **309 seconds**, no skips or failures, with a
6 GiB Node heap. Existing Town/Studio MCP checks: **21 passed, 1 skipped, 0 failures**. The skipped check is the existing
opt-in After effects browser acceptance (`STUDIO_BROWSER_TEST` was not enabled); do not count it as passed.
Both logs are retained with the review evidence.

At the post-review check, Camera regression **41169563798**, hosted World guard/WebKit **41169563894**, and Linux
acceptance **41169563914** were still running, with no reported failure. Do not describe their wrapper state as success.
The documentation follow-up may create newer runs; inspect the latest PR head before any merge. Earlier Linux run
**41167700800** ended cancelled, with all preceding setup and acceptance stages successful; its final full-world
acceptance did not complete.

### Historical review states — before the owner's merge instruction

- **Implemented:** existing local stdio adapter continued, with the four boundary/lifecycle corrections above;
  eleven tools and the actual Camera renderer retained. Only the three audited dependency resolutions changed.
- **Tested:** 15 units and 20 complete browser acceptance checks passed in hosted Chromium; local World guard passes.
  The local managed-executor browser remains blocked by its Unix-socket policy. Physical Safari/iPhone remains untested.
- **Connected:** the official SDK acceptance client discovers and exercises the real `.mcp.json` server from outside
  the repository. The owner's installed host and this ChatGPT session are **not connected**. Remaining local step:
  register Node with the absolute `johansson-town/tools/camera/server.mjs` path in the owner's stdio-capable host,
  reconnect, verify the eleven tools, and run the generated-image cycle there before using personal images.
- **Published:** **no**. Draft PR #416 stays open; no merge, main push, Pages deployment, auto-merge, release or live
  Camera/World runtime change was made.

**Next action:** inspect final checks on the latest draft head, then complete the owner's local MCP-host connection
using [MCP.md](MCP.md). Investigate a failed check if one appears; do not merge or publish without a new owner instruction.

## Original request, branch and review

Owner: **“Mcp wire the Johansson camera web app.”**

[Draft PR #416](https://github.com/nj22az/nj22az.github.io/pull/416), branch `codex/pocket-camera-mcp`, based on `main`
**`f49f22ba82e6d4b1fd9b5033f8bddc4d3eed903f`**. Implementation commit:
**`daaa219ee6a5ea8bf665b739909a89f238548b99`**, tree `01387594f5b74fb2f2282be6beefd6ec9889a7f7`.
The original follow-up `3267eff1` was documentation only. The continuation implementation and evidence above supersede
that adapter snapshot; the original acceptance remains useful history.

The original review was not merged or published; the current merge status is recorded above. The prior Camera release via #414 stays intact. No Camera runtime,
shader, CSS, service worker, sticker asset, World runtime or existing album migration is changed.
The existing publication handover remains the root HANDOVER.md index's published Camera entry and now links to this
separate MCP continuation. Read [MCP.md](MCP.md) for setup, tool boundaries and operation.

## Implemented

- `.mcp.json`: dedicated `johansson-camera` entry, retaining Town Audit, Studio and REA.
- `johansson-town/tools/camera/`: lazy isolated browser session, eleven SDK-registered stdio tools, strict schemas,
  validation, file-import restrictions, serialization, cancellation and cleanup.
- The existing `window.pocketCamera` bridge and actual DOM controls perform edits. The original Save handler performs
  final rendering and JPEG encoding. Every MCP save is a copy. Export preserves the exact saved bytes.
- State/catalog, import, recipe editing, preview, album metadata, original-source re-edit, save-copy, export and close.
- No hardware capture, personal browser/phone connection, arbitrary URL import, native Share, delete or publication.
- Temporary album only; exports survive closure but must be moved out of the OS temporary directory for durability.
- `policy.test.mjs`: validation and lifecycle checks. `acceptance.mjs`: official client -> stdio -> actual Camera.
- `.github/workflows/camera-mcp.yml`: bounded PR acceptance and evidence artifact.

## Completed verification

**Local:** 9/9 Node unit tests passed, including invalid image payloads, import traversal and symlink escape rejection,
recipe bounds, tool inventory, required save/export/close confirmation, startup failure cleanup and cancellation during
a delayed browser launch. All six new `.mjs` files passed `node --check`.

**Hosted:** [Pocket Camera MCP run 41167521955](https://github.com/nj22az/nj22az.github.io/actions/runs/41167521955),
job **124438197590**, completed successfully on 31 October 2026 at 04:12 UTC. The full job log confirms **9/9 unit tests
and 16/16 real MCP/Camera acceptance checks**, with no skipped acceptance steps. GitHub tested merge candidate
`17a0023dd5b227278b786bfd89aa103dc6d9415b` (implementation `daaa219e` into base `f49f22ba`).

The acceptance run verified initialization and discovery of eleven tools, explicit errors before open, actual WebGL
startup, current app catalog, image import, real preview PNGs, two-Look editing with adjustments/Enhance/crop/paper,
invalid-edit rejection without recipe mutation, changed rendered output, Save confirmation, actual 256 x 192 JPEG
output from a cropped 320 x 240 source, album metadata, exact saved-byte exports to distinct filenames, original-source
re-edit and copy-save preserving the earlier photo, no uncaught page errors, and explicit close retaining exports.

[Evidence artifact 13029866176](https://github.com/nj22az/nj22az.github.io/actions/runs/41167521955/artifacts/13029866176)
contains `before.png`, `after.png`, `saved.jpg` and `results.json`. Downloaded ZIP SHA-256 verified against the job log:
`706b8c1bcd991bea30a10d34b493d0d9994e68b7bd6de1aa9e8dc04ba4e0e76e`.
All three images were opened and inspected: the generated checker/gradient fixture renders in the default Pocket Look,
then with the requested crop and mixed treatment; the JPEG contains the resulting crop. This is a synthetic functional
fixture, not a photographic art-quality audit or exhaustive coverage of all Looks/frame combinations.

The separate existing Camera regression/World/Linux jobs are not included in these MCP acceptance totals.
Chromium/SwiftShader acceptance is **not** a physical Safari, iPhone/iPad, native-sharing or user's installed-MCP-host test.

## Historical open findings before the continuation review

The dependency installation reports **three high-severity npm audit findings in the existing pinned dependency tree**.
No dependency versions or lockfile were changed. The install log does not identify the affected packages or establish
reachability from this adapter; run `npm audit --prefix johansson-town` and triage separately before wider distribution.
Do not equate functional acceptance with a clean security audit. The workflow also reports existing v4 actions' Node 20
runtime deprecation (the runner executes them on Node 24); all steps completed successfully.

Review PR #416 and connect the local host from this branch after installing dependencies/Chromium. The adapter deliberately
references published Camera module cache keys `20261031rc2`, `20261029f` and `20261029c`; keep them aligned when Camera
modules change. Existing app release evidence remains in [the publication handover](HANDOVER-PUBLICATION-2026-10-31.md).

The tool scope excludes sticker/lettering authoring, Erase painting and mini-games. Browser-native WebMCP and a hosted
HTTP MCP endpoint are also not implemented. Do not claim all app functions or the user's live phone tab are wired.

Publication requires a separate owner instruction. A local MCP host can use this branch independently of GitHub Pages
after dependency/browser installation and reconnection. No host connection has been installed on the owner's computer
or into the current chat by this task.
