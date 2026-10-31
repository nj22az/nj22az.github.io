# Pocket Camera MCP — 31 October 2026

## Continuation review — 31 October 2026

The owner explicitly requested continuation of draft PR #416, not a rebuild, merge or publication.
Verified starting head **`3267eff1993bf276a0ee6700407f23a0fa8cbfa6`**; PR remains open/draft, with no conversation
comments or review threads at this review. MCP run **41167700821**, Camera regression **41167700721** and World guard
**41167700698** report success. Linux run **41167700800** still reports `in_progress` at its final full-world acceptance
step; it is not counted as passed. There were no local tracked changes at checkout. An unrelated untracked Sjöskolan
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

The final post-review commit, hosted acceptance result/evidence, World guard result and image inspection are recorded
below when available. Publication and the owner's installed-client connection remain separate, outstanding states.

## Request, branch and review

Owner: **“Mcp wire the Johansson camera web app.”**

[Draft PR #416](https://github.com/nj22az/nj22az.github.io/pull/416), branch `codex/pocket-camera-mcp`, based on `main`
**`f49f22ba82e6d4b1fd9b5033f8bddc4d3eed903f`**. Implementation commit:
**`daaa219ee6a5ea8bf665b739909a89f238548b99`**, tree `01387594f5b74fb2f2282be6beefd6ec9889a7f7`.
The follow-up handover change is documentation only; the tested adapter code is unchanged.

This is review work, **not merged or published**. The prior Camera release via #414 stays intact. No Camera runtime,
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
