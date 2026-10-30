# Pocket Camera: crop imported photos and save smaller files — 30 October 2026

Owner: “Cropping photos doesn’t work in the Johansson camera app? I want to be able to zoom and crop when I use my
own photos”; then “And the saved image is too big should use better compression while keeping excellent quality”.

## Branch and publication

`codex/pocket-camera-photo-crop`, based on production `main` `1d355885` (current camera code `37befc31`). Implementation
commit **`268b1cd6d6d3670c760c0b5742dfc7e206168c92`**, [PR #408](https://github.com/nj22az/nj22az.github.io/pull/408)
into `main`. All 13 uploaded blob hashes and the complete tree match the tested local snapshot (`683bb0df`). The
command-line push lacked credentials; delivery used the connected GitHub Git-object API with a checked branch lease.
**Published on the owner's “Publish”, 30 October 2026:** PR #408 merged to `main` as
**`0cd8408ba5656e2ed2639824d43524531e183c2b`**. [Pages run 41092437147](https://github.com/nj22az/nj22az.github.io/actions/runs/41092437147)
completed successfully. **6/6 changed live runtime files match the tested local versions byte-for-byte**: page,
app, CSS, crop, eraser and engine. [Public-file hashes and URLs](qa/2026-10-30-crop/live-files.json).
The Looks work on other branches is separate; no World source or camera Look shader body was changed here.

## What changed

The editor had no crop control: live-camera zoom never applied to an imported photo. Its preview and export always
used the entire source rectangle.

- Crop tab: pinch or slider zoom 1×–4×; drag to position; Original, 1:1, 4:3, 3:4, 16:9, 9:16; Reset. Mouse wheel zoom
  anchors at the pointer, arrow keys move the crop, Shift moves faster. Thirds grid appears while cropping; the
  frame, stamp and stickers step aside. Other tabs restore those overlays on the selected crop.
- `crop.js`: source-coordinate rectangle, constrained to the photo. Saved in `recipe.crop`; old recipes default to
  the full photo. Re-edit always decodes the retained source, so crops do not accumulate. Preview, Look/frame
  thumbnails, exported pixels and Erase use this same source rectangle. Erase brush size follows the visible crop.
- Six editor tabs fit narrow phones; the longer Stickers label has a wider grid column. No new library or upload.
- All new camera, edited and batch-import saves: JPEG quality **0.88**, longest edge **2,560 px**, no enlargement.
  Sources keep the existing 4,096 px working limit; an imported file is now retained **byte-for-byte** until Erase
  replaces the working source. Camera originals keep their previous resolution/encoding. Export dimensions in shot
  metadata, printer and viewer match the actual saved JPEG. Existing JPEGs are not changed until saved again.
- Cache keys bumped for app, CSS, crop, engine recipe normalisation and eraser. Network-first service worker unchanged.

## Checks and evidence

Commands run in Chromium 133, Playwright and SwiftShader (software WebGL), from the repository root:

```sh
node camera/tests/crop.test.mjs
node camera/tests/looks-gl.test.mjs
node camera/tests/modules.test.mjs
CHROMIUM_EXECUTABLE=/tmp/camera-browser/chromium node camera/tests/camera.browser.mjs
CHROMIUM_EXECUTABLE=/tmp/camera-browser/chromium CAMERA_SHOTS=/tmp/pocket-crop-qa node camera/tests/crop.browser.mjs
node --check camera/app.js
node --check camera/crop.js
node --check camera/erase.js
git diff --check
```

- Crop unit checks pass: full-source compatibility, bounds, shape and zoom across landscape/portrait/small sources,
  saved JSON recipe round trip. All 33 Look shader conversions and module-version consistency pass.
- Existing camera regression **56/56 passed**: camera, every Look, stickers, frames, eraser, imports, re-edit,
  IndexedDB persistence, games, printer, context-loss rejection. Run before the final two-line original-file retention
  change; final focused suite additionally verifies byte-identical source retention.
- Focused crop browser suite: phone **390×664**, small phone **320×560**, tablet **768×1024**, desktop **1280×800**.
  Checks controls remain visible, real two-point CDP touch pinch and remaining-finger drag, drag/compare separation,
  cropped Erase and Undo at a known source point, matching saved JPEG pixels and dimensions, restoring crop on re-edit,
  Reset, output limit, no page errors. Final suite also measures actual saved JPEG compression and hashes the retained
  original against the input. **33/33 checks passed on the final code.**
- Initial and cropped screenshots inspected at phone and small-phone sizes; Natural and Manga 2,560 px compression
  results inspected. An initial clipped Stickers label was fixed and the fit check passed afterwards.

Compression bench on repo `IMG_2855.jpeg` (a café photo; 4,096×3,072 working source), before 0.92/full size versus
0.88/2,560×1,920. Numbers measure JPEG blobs, not the separately retained source:

| Look | Previous bytes | New bytes | Reduction |
| --- | ---: | ---: | ---: |
| Natural | 3,004,907 | 1,165,147 | 61.2% |
| Manga | 4,509,806 | 1,891,113 | 58.1% |
| Risograph | 9,461,227 | 3,615,789 | 61.8% |

On `assets/images/nils-lake-hero-optimized.jpg` (1,920×1,440, already below the limit), reductions were 5.8%, 10.9%
and 12.4% respectively. Sizes vary by photo and Look; grain-heavy Risograph still compresses less efficiently.
Natural's new JPEG measured 39.17 dB PSNR against the uncompressed render at the same export size. This measures
encoding loss, not detail removed by resizing; the new download has fewer pixels than the previous maximum.

## Remaining and next action

The live code is verified at https://nj22az.github.io/camera/. Next, check the owner's own photo on iPhone
Safari/Home Screen and iPad. Physical Apple devices, Safari's JPEG encoder,
camera permission flow and hardware frame rate have not been tested here. Browser tests use emulated viewports and
real Chromium touch events; they do not establish physical iPhone acceptance. Lost-context restoration remains an
existing SwiftShader limitation. The independent Look persona backlog and Minato mode are unchanged.
