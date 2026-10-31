# Pocket Camera makeup and smart eraser — 31 October 2026

Owner request: implement makeup effects and smart eraser effects that identify problematic parts of a photograph and
allow the selected area to be removed with a click.

## State

Branch `codex/pocket-camera-retouch`, based on verified `main` `3869b9df`. Implementation is for review. On 31 October the owner explicitly approved pushing the review branch ("Push but how do I update my locally saved version"). No main merge or Pages deployment is included in that review-branch approval. The current offline release and World files are retained.
Implementation commit: `62a02e33`, verification follow-up `3e02e612`. The approved branch is being uploaded through the connected GitHub API because ordinary git push has no HTTPS credential in this executor. Every uploaded blob and final tree are compared with local Git object hashes. PR/check results follow below.

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

Local: all fourteen Camera unit suites pass, including 9 makeup, 6 spot-analysis, 5 actual-classifier, 9 simulated-DOM guide and 7 offline-update lifecycle checks, module consistency,
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
