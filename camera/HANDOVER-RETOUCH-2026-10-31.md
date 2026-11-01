# Pocket Camera makeup and smart eraser — 31 October 2026

Owner request: implement makeup effects and smart eraser effects that identify problematic parts of a photograph and
allow the selected area to be removed with a click.

## State

**Merged to main on 1 November 2026**, on the owner's explicit instruction "Push to main".
PR #422 squash merge: `5daae17d4eaae2cece40e45180f405caa7ed63ef`. The merged tree equals the reviewed
`99229e2e` source. Final head CI completed successfully: Camera `41238712880`, MCP `41238712756`,
World guard `41238712762`. Linux retains the two documented baseline failures; no Linux release is changed.
Pages deployment `41271304970` is in progress; hosted-byte verification follows after deployment.
Historical review-run notes below preserve earlier pending states and are superseded by this section.

## Behaviour

Adjust → Makeup offers independent Skin, Lips and Blush strengths, three shades, Find face, Align face and Reset.
Native FaceDetector is used if available, with a pinned MIT picojs classifier bundled for browsers including Safari
that lack that API. Detection selects the largest clear frontal face. No detected face means no cosmetic placement
until the user explicitly aligns the guide. Draggable/keyboard face, resize, eye and mouth handles plus angle and lip width/height support
source-normalized alignment through cropping. Facial geometry is unchanged. Lip placement is an adjustable template,
not semantic lip segmentation; the guide should be reviewed. Strength zero preserves the original pixels. Preview is
limited to 1,280 px; native decoded source is processed immediately before export. Recipe/source persist on re-edit.

Erase → Find spots offers up to twelve conservative, isolated local contrast anomalies. Numbered photo rings and
accessible numbered buttons heal only the selected region. This is not semantic person/object detection. The manual
brush and exact bounded Undo remain. Suggestions alone never change pixels; source/crop changes invalidate them.
Async work checks edit/source ownership so switching pictures or resetting cannot apply stale results. Undo is retained
within the editor session, not as album history; erasure becomes the saved source, as before.

No images are uploaded, no hosted model/API is added, and World's shaders are unchanged. Face classifier and new modules
are included in the regenerated hash-verified offline bundle. Source/model pins, hashes and MIT licence are in
`vendor/pico.NOTICE.txt` / `vendor/pico.LICENSE.txt`. The attributed Pexels portrait test fixture is excluded from the
runtime/offline bundle. Runtime release keys are `20261031retouch1`.

## Verification

Local: all fifteen Camera unit suites pass, including 9 makeup, 6 spot-analysis, 5 actual-classifier, 9 simulated-DOM guide and 7 offline-update lifecycle and 6 worker deadline checks, module consistency,
offline inventory/hash and syntax/diff checks. Actual classifier independently detected the established Pexels portrait
and rejected the harbour sample in Node/canvas-shim checks. These are not visual browser evidence.

Chromium 149 cannot start in this executor: process_singleton_posix `socket() failed: Operation not permitted`, before
page navigation. The new `camera/tests/retouch.browser.mjs` runs through the added Camera workflow matrix job and covers
four viewport sizes, actual WASM healing, unchanged pixels outside the mask, exact Undo, stale result rejection,
makeup source/recipe round trips, crop coordinates, no-face fallback and actual positive bundled-model detection.
The browser suite has 36 executable checks, including a 1920 × 1440 makeup-plus-healing save with delayed source encoding that proves native detail survives preview redraws. CI/browser results are pending and must not be implied to pass. Automatic approval review initially rejected the public branch push; the owner has now explicitly authorised it. Main publication remains a separate decision. Physical iPhone/iPad Safari and native camera/share
remain untested. No device performance claim is made.

## Updating a saved offline copy

Source audit found an old open Home Screen page only asked the worker for status when returning online. It did not
request a worker update, and a newer worker's version mismatch was ignored. `offline.js` now requests a fresh worker
on online/page/foreground resume (deduplicated and throttled), bypasses the HTTP script cache, and offers an explicit
**Update** action only after the new bundle is ready. The action never reloads an open edit or an import/capture/share.
Only Camera caches change; album IndexedDB is untouched. A worker installation is not interrupted by a premature
refresh prompt. The optional caption is visible only for the actionable update state; other offline states remain icons.
Seven mocked lifecycle checks verify these behaviours. Actual service-worker/offline browser regressions remain in CI.

After publication, connect online, reload/reopen the app, and wait for the Settings checkmark. An old pre-release
copy needs an actual online page reload to receive the new Update control. Do not clear site data or reinstall:
that is unnecessary and could lose browser-stored photos. A separately downloaded ZIP/source is a different copy
and needs replacing/updating from the repository.

## Next action

Open the authorised draft PR to trigger the Camera workflow. Complete the CI/browser review, inspect its actual screenshots and correct any failures before marking ready. The attached change package contains the binary patch, current changed files, exact source commit, validation logs and this handover; no browser screenshots are claimed or included.
Publication requires the owner's explicit instruction; this branch does not change the live site.

## First review-branch browser run

PR [#422](https://github.com/nj22az/nj22az.github.io/pull/422), initial remote source `c551232c529199d7c91c3610e5e8dfbcda934576`,
exact local tree `ae4fda7cb62b0e328d9231e1ee277c3737427363`. Camera run `41235818118`: Retouch **36/36**, job
`124639261164`; UI **82/82**, `124639261050`; shader audit **50/50**, `124639261231`; Smart **14/14**, `124639261192`.
Retouch screenshots were downloaded with ZIP hash/CRC/path checks and inspected. The unadjusted tilted portrait showed
why an automatic bounding box is not a precise lip mask. The next candidate adds guide-only lip width/height controls
and a drawn mask boundary; the portrait check now aligns eyes/mouth/angle through the real controls before colouring.
The initial unaligned picture is diagnostic, not a claim of automatic makeup quality.

Two initial integration failures are corrected in the next candidate: MCP's renderer import still named the prior
release key (policy 14/15; `124639260546`), now aligned without changing assertions; and offline check10 measured the
stalled fetch together with the Node/browser scheduling round trip. Its unchanged 4,500 ms threshold now measures the
actual fetch/body operation inside the browser and logs both timings. The worker's three-second fallback is unchanged;
the rerun must verify the diagnosis. First9 offline checks passed before that failure (`124639261178`).

## Second review run and final integration corrections

Remote source `09d9b3ca776238ff35b8391b89461a6b801b699a`, exact local tree
`5056c3594062327f75a86f03f3a294daef7cdc08`, Camera run `41236318240`: offline **13/13**,
job `124640745461`, verified stalled-fetch browser duration **3,365.4 ms** (Node roundtrip 3,367 ms), below the unchanged
4,500 ms limit. Cache repair and two cold restarts pass. UI, shader audit and Smart also pass.
Retouch passed the first35 checks; final real-portrait alignment caught a test-harness timing error: the first handle
was sampled before the Angle control's next-frame guide redraw. The final harness uses normal locator hover/stability
before pointerdown; source-coordinate assertions/targets are unchanged. Native mask rendering and source tests passed.

MCP run `41236318163` passed all15 existing policy checks, then its actual session failed to load because preview's
nested-directory allowlist blocked the new pico module. Final correction permits exactly four detector vendor assets
with explicit MIME types. It does not broaden vendor/binary serving. A new HTTP policy check proves exact byte/MIME/HEAD
behaviour and denial of other files and symlinks; all **16/16 policy checks pass locally**. The final candidate must
rerun real SDK-to-Camera acceptance. These corrections do not alter Camera's runtime from `09d9b3ca`.

## Third review run and deadline correction

Remote `7263b2012709459ce5673ec8e122e96854a38bd3`, exact local tree
`2fc6da1b6fe3dd73a34ee34390cdd27010407293`: MCP run `41236772835`, job `124642110571`, passed **16/16 policy +
20/20 actual SDK/Camera acceptance**, no skips/page errors. Retouch `41236772830`, `124642110802`, passed **36/36**;
aligned real-portrait pictures were inspected and lip tint is contained, with teeth/skin detail retained. Visual QA
found the SVG outline inherited the generic 22 px icon size. The final CSS selector now overrides that rule; the
browser suite checks full-frame SVG dimensions and visible face/lip paths. Core Camera also found idle Erase text
still suggested tapping when no suggestions existed; the idle state now correctly offers painting, retaining the
existing manual-brush test without changing its assertion.

Repeating offline exposed a real deadline gap (5,670.9 ms for a stalled request): manifest/cache preparation and fetch
abort acknowledgement were outside the old timeout. The final worker starts the three-second deadline immediately,
prepares cache/manifest alongside the network and races the network against the deadline. It does not await abort
acknowledgement before using a verified cached response. Normal network success remains first; unlisted resources
retain normal network behaviour. Six focused worker checks cover slow preparation and abort-ignoring fetch, exact
three-second fallback, fast success, unlisted passthrough, failed network, missing cache and scope. The browser timing
limit remains **4,500 ms**; cached responses expose worker timing diagnostics. Final browser rerun remains necessary.

## Fourth runtime acceptance and isolated final timing check

Remote `749e4112d9e6949e0dec76f7e48b6666049f6920`, exact local tree
`bc3009a117e9e5eb664d2df1e456b2890f153786`, Camera run `41237541775`: full core **143/143**
(job `124644372475`, all seven suites), UI **82/82** (`124644372689`), shader audit **50/50** (`124644372647`),
Smart **14/14** (`124644372654`) and retouch **36/36** (`124644372739`) pass. Final aligned-guide and portrait
screenshots were ZIP-hash/CRC/path verified and inspected; full-size face/lip outlines and contained tint are correct.
MCP `41237541882`, `124644372672`, passes **16/16 policy + 20/20 real acceptance**. World guard `41237541780`,
`124644729113`, passes **569/569**. Physical iPhone/iPad Safari remains untested.

Worker diagnostics proved the new timeout itself completed at **3,000.3 ms**, manifest 0.2 ms/cache 5.2 ms. The browser
received it at 6,298.8 ms while its cold-start 1,920 px fake-camera feed and software shader compilation were active.
The final timing fixture enters the real Album (stopping the camera), waits for shader preparation and measures the
same real stalled request. It retains **4,500 ms browser fetch/body limit**, adds **3,200 ms worker limit**, and logs
headers/body/worker/Node stages. This isolates network-deadline acceptance from an unrelated GPU workload; the live
camera and cold startup are still covered elsewhere in the unchanged full suite. The retouch suite also adds four
native manual-brush/idle-prompt/exact-Undo cases, for **40** checks. These final edits change tests/documentation only:
the complete Camera runtime bundle is byte-identical to the accepted `749e4112` source.

Linux retains the two previously reproduced main failures: controller smoke expects x=-1.5 at its landing but actual
x=0.3; housing's post-office-lot counts the moving Minato Maru paint/metal meshes. No World runtime, fixture expectation
or Linux release is changed by this Camera work.

## Verified review delivery — 31 October 2026

Review branch is pushed; [PR #422](https://github.com/nj22az/nj22az.github.io/pull/422) remains unmerged. Final tested
source `15712ac437b5befd7c163150857326f5eacaab48`, exact local tree `b4c5895d96d2e8dca9fbcb786c7c7be2814abf05`.
The complete Camera runtime is byte-identical to fully regression-tested `749e4112`; only browser fixtures and this
handover changed. Later handover-only commits do not alter that runtime.

Final focused Camera run [41238456158](https://github.com/nj22az/nj22az.github.io/actions/runs/41238456158):
- Retouch **40/40**, job `124647076331`: makeup, native manual strokes and touch targets, exact Undo, alignment,
  native-resolution JPEG/source persistence, cancellation and bundled face detector.
- Offline **13/13**, job `124647076194`: verified full bundle, import/edit/save/games, repair and cold restarts.
  Isolated stalled request: browser **3,003.7 ms**, headers 3,002.3 ms, body 1.4 ms; worker **3,000.3 ms**.
  Both original 4,500 ms browser limit and new 3,200 ms worker limit pass.
- Audit and Smart pass; duplicate full/UI runs were still running when these focused results were recorded.
  Their unchanged runtime already passed the full143/UI82/audit50/Smart14 checks in `41237541775` above.

Retouch artifact `13055458969`, SHA256 `48920f2cdd1302007d105496c5ae103d5aed321e982c5377b98f3e2bb33ec795`;
offline artifact `13056516586`, SHA256 `d5835d624cd56ac6e641dd04f0263cb833528ac66a774fda8621b00145acaff8`.
Final runtime screenshots from `749e4112` were inspected; the fifth candidate changes no displayed controls or pixels.
All fifteen local Camera unit suites pass. MCP16/20 and World569 passing evidence are recorded above; source-equivalent
reruns are independent. Chromium's core suite could not exercise two context-restoration branches on this runner;
physical iPad/iPhone Safari, hardware camera and native Photos/Share remain unverified. Linux's two known World failures
remain unchanged. No assertion thresholds were relaxed, no World shaders/runtime changed, and no main/Pages release
was performed.

The owner approved a review-branch push. Next: publish only on an explicit main-publication instruction, then verify
Pages/public bytes and an actual Home Screen update. For the existing Home Screen copy, save edits, connect online,
fully close/reopen (reload if needed), then wait for the offline-ready tick in Camera settings. The new Update action
is available after this release is installed. It preserves the album; clearing site data or reinstalling is unnecessary.
Downloaded source/ZIP copies require updating/replacing files separately.

## Main publication — 1 November 2026

The owner explicitly authorised main publication. PR #422 is merged as `5daae17d4eaae2cece40e45180f405caa7ed63ef`.
No implementation changed after the passing review-head checks. Deployment and hosted-byte checks are being verified
against the exact merged Camera manifest and assets. Physical iPad/iPhone Safari and native Share remain unverified.
