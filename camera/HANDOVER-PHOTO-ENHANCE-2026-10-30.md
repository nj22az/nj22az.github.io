# Pocket Camera: Enhance photo — 30 October 2026

**Combined review, later on 30 October:** [integration candidate](HANDOVER-INTEGRATION-2026-10-30.md) combines #411 and #412 on current main, preserving #408. It is not published; #405 stays separate. Use that note for combined checks and next steps.

Owner: “Can you use this to add a enhance photo option in Johansson Camera”, linking
https://github.com/Merserk/dlss5-visual-enhancer.

## Delivery state

**Implemented and tested; draft, not published.** Branch `codex/pocket-camera-enhance`,
[PR #412](https://github.com/nj22az/nj22az.github.io/pull/412) into `main`. Implementation commit
**`92ac80324da49f2fcd9b92557c8d78de9cd36c01`**, based on production
`ff76aee1a30ff1d000bd5bb9ecf0475543915899`. Its tree is
`b85f96f04fc359a60a913b248932f51a24bf065f`; all seven uploaded blobs and the complete tree match the tested local
snapshot. This handover, the root index and retained evidence follow in a documentation commit on the same branch.
No merge, deployment or change to `main` was performed.

Read alongside [the crop handover](HANDOVER-PHOTO-CROP-2026-10-30.md) and
[the camera/Looks handover](HANDOVER-CODEX-2026-10-30.md). Separate open work at this session's check:
PR #411 (`codex/pocket-camera-save-share`: direct save/share, Solitaire, Crayon and paper choices), and PR #405
(`codex/pocket-camera-looks`, targeting `claude/friendly-darwin-a4e3re`). Their code is not included here. Preserve their
changes when integrating, especially the app/page module cache keys and the shared `looks-gl.js` file.

## Repository assessment and chosen implementation

The linked project's [README](https://github.com/Merserk/dlss5-visual-enhancer/blob/main/README.md) specifies
Windows 11, native NVIDIA engines for DLSS/RTX, and DirectX 12/DirectML for its image model path. It supplies selected
source rather than a complete build. These dependencies cannot be embedded in this static iPhone browser camera.

Its [Merserk Source License](https://github.com/Merserk/dlss5-visual-enhancer/blob/main/LICENSE), version 1.0,
restricts redistribution/repackaging in section 5 and hosted equivalents in section 7 without written permission.
Reviewed README blob `4fa5d2ef5ad8a7a28d7a0a283416e05d496733c7` and licence blob
`850f23cbb54b3582a57f0c013890e8458c0ad520`. No code, models, binaries or visual assets were taken from that project.

The owner was informed during the task that the delivered alternative would be independent browser photo correction,
not DLSS or AI reconstruction. No server, account, model download, upload, subscription or paid service was added.

## What changed

- **Adjust → Enhance photo**: an accessible labelled switch, followed by a 0–100% Strength slider and original-view
  hint. First activation uses 65%; toggling off and on remembers the last nonzero strength within the edit, including
  on a reopened saved photo. No seventh editor tab was added.
- `recipe.enhance`, normalised to 0–1, defaults to zero for old albums. The recipe retains the strength through save,
  reload and re-edit. Turning it off restores the unenhanced pipeline, including the user's existing manual adjustments.
- An independently written optional branch in the existing `PREPARE` shader: edge-preserving weighted smoothing,
  bounded luminance sharpening that avoids strong edges, conservative tone correction measured from the crop, and a
  small vibrance increase for muted colours. It runs before the Looks and manual adjustments. The extra sampling is
  skipped when strength is zero. Source coordinates and sampling reach follow the crop and output size.
- Editor preview, Look/frame previews and exported pixels use that same recipe. Hold-to-view-original continues to
  show the retained source through the same crop with enhancement, Looks and adjustments bypassed.
- The original source is untouched. The existing source decoding limit, 2,560 px output limit and JPEG quality 0.88
  remain in effect. Enhancement neither enlarges a photo nor invents missing detail.
- Cache keys updated for `app.js`, `looks-gl.js` and `camera.css`. No World shader body, service worker, dependency or
  album schema was changed.

## Verification

Final runs used Chromium and SwiftShader; viewport names describe emulation, not physical Safari acceptance.

```sh
node camera/tests/looks-gl.test.mjs
node camera/tests/crop.test.mjs
node camera/tests/modules.test.mjs
node --check camera/app.js
node --check camera/looks-gl.js
node --check camera/tests/enhance.browser.mjs
git diff --check
CHROMIUM_EXECUTABLE=/tmp/camera-browser/chromium node camera/tests/camera.browser.mjs
CHROMIUM_EXECUTABLE=/tmp/camera-browser/chromium node camera/tests/crop.browser.mjs
CHROMIUM_EXECUTABLE=/tmp/camera-browser/chromium \
  CAMERA_BASELINE=/tmp/pocket-enhance-baseline.js CAMERA_SHOTS=/tmp/pocket-enhance-qa \
  node camera/tests/enhance.browser.mjs
```

`CAMERA_BASELINE` was the unmodified `camera/looks-gl.js` extracted from production `ff76aee1` before editing. The focused
suite blocks service workers so its optional intercepted baseline module can be tested. The original regression
retains its service-worker behaviour and assertions. The two asset fixtures required by the existing tests were
restored locally from the same production commit after preparing the sparse checkout; they were not changed.

- **22/22 focused browser checks**, at 390×664, 320×560, 768×1024 and 1280×800: initial off state, visible controls,
  switch/slider behaviour, original comparison, cropped JPEG pixels, byte-identical retained source, recipe persistence,
  re-edit and reload, independent manual adjustments, no page errors. The photo remains over 100 px tall even on the
  small phone with the Adjust panel open.
- **GPU measurements:** off is byte-for-byte equal to the old engine on the 480×360 fixture; repeated enhanced renders
  match exactly. At 100% the synthetic fixture's mean RGB change is 13.04/255; white remains `[250,250,250]`, black
  `[7,7,7]`. All 34 offered Looks, including Natural, render with enhancement. These are bounded-output and regression
  measurements, not a perceptual quality score.
- **Real photographs:** the existing harbour/café sample and garden photo rendered at preview and export sizes.
  Before/after comparisons inspected at full image size: modest tone lift, restrained colour, no visible broad halos.
  Phone and small-phone screenshots inspected; labels and controls fit.
- **33/33 existing crop/export checks:** gestures, Erase/Undo, saved crop, source retention, re-edit and output limit;
  the existing compression bench retains its result. **56/56 existing camera regressions:** camera, all Looks,
  thumbnails, mixing, stickers, text, printer, Memory, imports, editing, persistence and lost-context save rejection.
- Shader conversion, recipe bounds/round trip, crop unit checks, module-version consistency, syntax and whitespace
  checks all passed.

Retained final logs: [enhancement](qa/2026-10-30-enhance/enhance.log),
[camera regression](qa/2026-10-30-enhance/camera.log), [crop/export](qa/2026-10-30-enhance/crop.log).

## Remaining and next action

Review the correction on the owner's photos; it is conventional enhancement, not the linked application's neural
renderer. Publish only on the owner's instruction after reconciling any camera changes merged meanwhile. Check
physical iPhone/iPad Safari and Home Screen preview responsiveness, export time and visual judgement; those have not
been tested here. SwiftShader's existing lost-context restoration limitation is unchanged; rejection of black saves
passes. The separate Looks/persona backlog and PR #411 remain separate work.
