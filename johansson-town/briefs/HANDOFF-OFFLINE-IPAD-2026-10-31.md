# Complete offline island on iPad — 31 October 2026

The owner asked to explore Johansson World offline on his iPad and conduct a human audit. This extends the existing game; no renderer, simulation, rooms, residents, saves or Pocket Camera runtime are changed.

## Implementation and publication

- Base: verified main `3869b9dff5f214ae28f35c061575fa80476d15d9` (Camera offline release retained).
- Review branch: `codex/town-offline-audit`. Implementation commit and PR will be recorded after transfer.
- An explicit Offline control on the title and in Town book → Settings downloads the complete game inventory, about 131 MiB. It verifies each file's length and SHA-256 before publishing a ready marker. Download progress, pause/resume, retry, quota errors and recovery after termination are included.
- A complete snapshot is pinned separately from the bounded visited-content cache. A failed replacement retains the previous complete snapshot; a completed replacement reuses matching files and keeps one complete predecessor for tabs holding old lazy chunks. Older/partial island snapshots are removed. Camera caches and localStorage saves are untouched.
- All gameplay assets and current compiled entries, including lazy room/audio/season/engine-room content, are included. Blender sources, authoring scripts, docs and personal saves are excluded. External Studio/calculator pages, live shops and the separately opted-in AI model are outside island exploration. Existing font fallbacks work without Google Fonts.
- **Not published.** The owner's initial boundary requires explicit authority for main/publication. Previous Camera publication requests have been completed. This new World feature is prepared for review first.

## Verification

Initial CPU checks: 10 offline policy/inventory tests and four runtime-package tests passed before the final review refinements. Re-run and record the final exact source, inventory, hosted jobs and evidence before completion. Local graphics are unavailable in this managed environment; real graphical checks run in GitHub Actions.

`town-offline.yml` tests real Chromium and WebKit with an iPad mini 744 × 1133 CSS viewport, DPR 2 and touch. It downloads through the UI, pauses/resumes, hashes every file with networking disabled, restarts the browser twice using persistent storage, boots the ordinary game URL, retains a real save, rotates the display, exercises touch and movement, then enters unvisited rooms and all eight default Blender ferry views. No scene or service-worker response is mocked. Google Fonts are replaced with the existing system font fallback for deterministic CI.

These are desktop browser simulations, **not a physical iPadOS Safari sign-off**. Physical installation, memory pressure, long-term browser storage retention and the owner's human exploration remain open.

Existing unrelated Linux acceptance failures remain documented in the Camera offline handover: ferry landing expectation and the post-office lot scan. Do not weaken those assertions or mix their repair into this change.

## Human audit on the iPad

After publication:

1. Open Johansson World in Safari while connected. Share → Add to Home Screen; open that icon.
2. Tap Offline → Download for offline. Keep the app open until **Ready offline**. Download in the app you will actually use; Safari and the Home Screen app can have separate storage and saves.
3. Enable Airplane Mode and switch Wi-Fi off. Close and reopen the app. Continue your existing save.
4. Walk the harbour; visit Sakura and its upstairs office, Minato Izakaya, Sato Ramen and the ferry's engine/control rooms. Try portrait and landscape, movement, conversations and local sound.
5. Save, close and reopen while still offline. Confirm progress remains. For defects, record the location, time, orientation, action and screenshot.

Keep the app's website data. Safari can remove data under device storage pressure; the app requests persistent storage from a user gesture without promising it will be granted. [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/) is the primary reference.

## Next action

Complete hosted offline and regression checks, inspect screenshots, retain evidence, update this handover with exact commits/results, and obtain publication authority before merging this World change.

## Acceptance continuation — 1 November 2026

The owner asked this thread to proceed with the acceptance work in PR #421, branch
`codex/town-offline-audit`, from head `4d2f7223`. No publication is included in this continuation.

Reviewed both saved artifacts from run [41235803744](https://github.com/nj22az/nj22az.github.io/actions/runs/41235803744):
- Chromium artifact `13055991362`: Pause became hidden after the download completed; Done occupied its old target.
  This is a real-input test race, not evidence that the download itself failed.
- WebKit artifact `13055532209`: no page errors or failed local requests; at the five-minute deadline it had
  verified 288/602 files (64,526,241 bytes), and the subsequent screenshot showed 292 files. The download was
  making progress; offline boot/exploration had not been reached. Artifact source is GitHub's synthetic PR merge.

The browser fixture now holds one real server response until the native Pause interaction is complete.
It neither mocks the worker nor substitutes asset bytes. Resuming releases the response; all files must still
pass the original size/SHA-256 proof with networking disabled. Readiness now has a fifteen-minute outer bound,
a three-minute no-progress failure, and logged byte/timing observations. Workflow budget is 45 minutes for
download plus the existing cold restarts, save/rotation/input, unvisited rooms and eight ferry views.
Browser contexts record WebM video alongside the existing screenshots and JSON evidence.

Local policy/inventory and runtime-package tests: **14/14 pass**; browser script syntax passes.
No gameplay runtime, geometry, graphics, save logic or Linux assertions changed. Hosted reruns and visual review
remain required; physical iPadOS Safari is still untested. Main has since published Camera retouch via #422;
this branch must retain that publication when integration is prepared.

Integration follows current main `d328e45c` (including the standalone Camera version/header).
Only the handover index conflicted; both Camera publication and this offline review entry are retained.
The local browser attempt is blocked by missing WebKit system libraries; Chromium's download is unavailable.
Git HTTPS has no write credential; the connected GitHub API transfers exact local tree objects.

## Verified status-scan race and worker fix — 1 November 2026

Head `14fb4edd` passed the hosted guard **579/579**, run `41271993488`, job `124746487612`.
Linux `41271993491` repeats exactly the two baseline assertions. Chromium offline job `124746487922`,
run `41271993565`, exercised Pause but later reported **paused, 601/602 files**, despite Resume.
Its three-minute stall assertion correctly failed; [artifact 13069288463](https://github.com/nj22az/nj22az.github.io/actions/runs/41271993565/artifacts/13069288463) retains video, JSON and screenshots.

A deterministic regression now reproduces the product race: seed a partial cache, block its first inspection
hash, finish a resumed download, then release the old inspection. Before the fix, that older inspection
overwrites `ready` with `paused`. The worker now increments a revision on Start/Pause and discards stale
inspection state/marker mutations. The regression passes, with all **15/15** local offline/package tests.
The required runtime build succeeds; its unrelated pruning of retained historic chunks was reverted,
so previously published JS chunks remain byte-identical. The offline manifest is regenerated for the worker.
This changes offline state coordination only; gameplay, graphics, saves and Linux fixtures remain untouched.
Hosted graphical acceptance must still pass on the new head; the previous 579 result is historical.

## Offline cold boot verified; desktop rotation fixture correction

Worker-fix head `43642b31` passes hosted guard **580/580** (`41272794713`, job `124748828897`).
Chromium offline job `124749064088` (`41272794686`) now passes Pause/Resume, all **602 files /
137,189,946 bytes** with networking disabled, and the ordinary-URL cold offline boot; page errors are empty
and the server supplies zero successful responses after disconnecting. Its artifact `13070127948`
contains the actual offline portrait screenshot and recordings. It then fails at the desktop viewport
resize: Chromium refuses Browser.setWindowBounds while Start Exploring's native fullscreen is active.
The harness now exits standard/prefixed DOM fullscreen before changing its desktop viewport; the same
landscape canvas, touch, saved reload and room assertions remain. This is browser-fixture correction,
not a change to physical iPad orientation handling. Full room/ferry acceptance remains open.
The deterministic worker regression also covers a corrupt complete-cache scan: an older scan may neither
overwrite resumed readiness nor delete the newly repaired ready marker. All **15/15** local checks pass.

Source review also confirms RUN is intentionally hidden while idle (`control-visibility.js`).
The fixture now holds the normal W movement input while tapping RUN, releasing it in `finally`;
it does not force the button visible or bypass its hit target. This verifies a real touch action
with normal keyboard movement; physical joystick ergonomics remain part of the iPad audit.

## Corrected quiet-HUD acceptance target

Head `5cd365c1` passes hosted guard and the complete WebKit phone flow (`41273442254`).
Chromium `124750788075` (`41273442307`, artifact `13070144789`) again passes all offline bytes and
ordinary-URL cold boot, and now passes desktop rotation. It fails tapping RUN. Source and actual
landscape screenshot show this is the wrong fixture target: `quiet-hud.css:81` deliberately sets
`#run{display:none!important}`; its preceding comment says pushing the movement stick runs.
The earlier fixture change based only on control-visibility.js was insufficient.

The fixture now holds normal movement and taps the visible Jump target. A passive capture listener
asserts a trusted pointerdown with pointerType touch; it never forces visibility or invokes a handler.
This checks touch delivery alongside normal keyboard movement, not physical joystick ergonomics or jump height.
Extra failure diagnostics retain the root class, mobile controls and focus. The worker/runtime is unchanged
from `43642b31`; further ordinary save reload and actual offline room/ferry acceptance are still required.
