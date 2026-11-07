# Combined Pocket Camera evidence — 30 October 2026

All images here are actual renderer output or screenshots. No generated substitute photograph or painted-over UI.
**Chromium 133 / SwiftShader / Playwright 1.62.1; browser emulation, not physical Safari.**

The candidate combines #411 and #412 on main `87f47e8f`, preserving #408. Runtime cache key `20261030rc1`.
The combined [handover](../../HANDOVER-INTEGRATION-2026-10-30.md) records exact source heads and compatibility limits.

| Evidence | Content |
| --- | --- |
| [Natural](proof-none.jpg) / [Crayon](proof-crayon.jpg) / [Manga](proof-manga.jpg) / [Oil](proof-oil.jpg) / [Miniature](proof-tilt.jpg) / [Riso](proof-risoThree.jpg) | Six photos per sheet. Rows: enhancement off; Enhance 65%; Enhance 65% + Rough; LIGHT + Enhance 65% + Rough. Derived from 144 separately rendered 720-line PNGs. |
| [Crayon detail](crayon-detail.jpg) | Unscaled 1:1 crop from the restaurant portrait's 720-line renders; columns correspond to the four rows above. |
| [Phone montage](phone-screens.jpg) | Actual combined editor and Solitaire screenshots. |
| [Enhance](phone-enhance.png) / [Paper](phone-paper.png) | 390 × 664 emulated touch viewport; mixed Crayon/Riso recipe, crop and Enhance 57%. |
| [Solitaire portrait](phone-solitaire.png) / [landscape](phone-solitaire-landscape.png) | 402 × 740 and 874 × 340 emulated viewports. Screens at scroll top; the test additionally scrolls to the last card. |
| [Matrix](render-matrix.json) | 816 draw cases: 34 Looks × four stocks × three strengths × full/LIGHT. All nonblank; 408 full preview/export pixel matches. |
| [Render manifest](render-manifest.json) | SHA-256 and dimensions of all 144 actual PNG outputs used to compose the proofs. |
| [Camera](camera.log), [crop](crop.log), [Enhance](enhance.log), [Save/Share/layout](save-share-layout.log), [paper](paper.log), [integration](integration.log), [unit](unit.log) | Passing final local runs. Combined nine checks include 68 baseline and eight thumbnail comparisons, exact JPEG/source/Share bytes and repeated-save identity. |
| [First fixture log](integration-first.log), [readback fixture log](integration-readback-first.log) | Early new-test failures explained in the handover. Final test uses exact encoded comparison and readback before compositor clearing. |

Visual review: all six sheets, face detail, combined editor screens and both Solitaire orientations inspected.
Enhancement/paper integration is visible and settings are retained. Existing art limitations remain in the persona audit.
Share is mocked; no device sheet was opened and no photo was sent. “iPhone Safari” in inherited camera-log labels means
the Chromium viewport fixture only. The separate #405's LUT/sorting/model tests were not run or represented as passed.

## Reproduce

Run from repository root with Playwright/Chromium and ffmpeg available. `CHROMIUM_EXECUTABLE` is optional when Playwright's
browser is installed. The new GitHub camera workflow supplies dependencies, baselines and all suite commands.

```sh
git show 87f47e8f6e5fafdb586ac723e9aa3cc704d11345:camera/looks-gl.js > /tmp/camera-main-engine.js
git show 3af0bae6324fe73f974bd00bc371c6555d7f1e58:camera/looks-gl.js > /tmp/camera-refine-engine.js
CAMERA_MAIN_ENGINE=/tmp/camera-main-engine.js CAMERA_REFINE_ENGINE=/tmp/camera-refine-engine.js \
  CAMERA_SHOTS=/tmp/pocket-camera-integration/combined node camera/tests/integration.browser.mjs
CAMERA_SHOTS=/tmp/pocket-camera-integration/layout node camera/tests/save-share-layout.browser.mjs
python3 tools/camera-test-photos.py /tmp/camera-bench/in
```

Render each of `off`, `enhance`, `paper`, `light` into `/tmp/pocket-camera-integration/renders/<name>` with
`tools/render-camera-looks.mjs --looks none,crayon,manga,oil,tilt,risoThree --lines 720 --out <folder> /tmp/camera-bench/in/*.jpg`.
Use no extra flag for `off`, `--enhance 0.65` for `enhance`, add `--paper rough` for `paper`, and `--light` for `light`.
Then run `tools/camera-integration-proof.py --renders /tmp/pocket-camera-integration/renders --screens
/tmp/pocket-camera-integration --out camera/qa/2026-10-30-integration`.

The local run reused the established six-photo bench already present in `/tmp/camera-bench/in`; no new model or photo
download was needed. The original 720-line PNGs are transient; their hashes and the composed proofs are retained here.

## Photo credits and licences

Sources are recorded by [the established photo tool](../../../tools/camera-test-photos.py):

- Restaurant portrait: Vladislav Anchuk, Pexels 29747506, [source](https://www.pexels.com/photo/29747506/), Pexels licence.
- Braids portrait: Ozan Çulha, Pexels 28890349, [source](https://www.pexels.com/photo/28890349/), Pexels licence.
- Conical-hat portrait: Yulia Rozanova, Pexels 3024599, [source](https://www.pexels.com/photo/3024599/), Pexels licence.
- Café and garden: the owner's repository photographs (`IMG_2855.jpeg`, `assets/images/nils-lake-hero.jpg`).
- Night: Martin Falbisoner, “Dotonbori, Osaka, at night, November 2016”, [Wikimedia source](https://commons.wikimedia.org/wiki/File:Dotonbori,_Osaka,_at_night,_November_2016.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
  Cropped, resized and processed through the labelled camera effects. The six proof sheets containing it are shared
  under CC BY-SA 4.0; attribution is retained here. The licences of the other component photographs are unchanged.
