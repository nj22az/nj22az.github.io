# Pocket Camera: the face pack, Makeup as looks, characters and Auto — 3 November 2026

The owner (3 November 2026), of Makeup and Face stickers: "No this is not right, it needs to be extremely polished and
the app should do the job, not sliders and manual adjustment. Manual sliders are a last resort, audit as a makeup sales
boss's and pocket camera designer at Nintendo"; then "Yes implement and look if you find any GitHub repo that can help
you, make up, photo etc"; and "My app needs to be simple as a Nintendo game no need for tutorial". The audit:
[AUDIT-MAKEUP-FACE-2026-11-03.md](AUDIT-MAKEUP-FACE-2026-11-03.md). This note records what was built from it.

## State

**Published and verified on 3 November 2026.** The owner: "Push to main". Main fast-forwarded to
[`75f9ace1`](https://github.com/nj22az/nj22az.github.io/commit/75f9ace14421b3bbdf6803f59ce1cb890d4d50fb) (branch
`claude/laughing-brahmagupta-ybyndm`). Pages deployed it (run 1607, success); **18/18 public files match main byte for
byte** (SHA-256, cache-busted: Camera `index.html`, `app.js`, `face-pack.js`, `face-pack-worker.js`, `makeup.js`,
`makeup-guide.js`, `face-stamps.js`, `auto.js`, `looks-gl.js`, `camera-ui.css`, `sw.js`, `offline.json`, the four
`vendor/mediapipe/` files, `tests/face-pack-check.html`, and `johansson-town/tools/camera/preview.mjs`); the wasm is
served as `application/wasm` (9,574,032 bytes) and the old `vendor/pico.js` is gone (404). On the live page (headless
Chromium, 390 × 844 touch phone, a fresh profile) the test portrait's face was found **8.1 s** after it opened (the
first use downloads the 13.4 MB runtime and model; cached after), Auto read 0.50 / 0.21 with the portrait cap, Soft
glam went on from the strip, the Auto row said On, no page errors. The live check page (`/camera/tests/face-pack-check.html`) found the sample's face: first run 1,301 ms (loading included, after the runtime was cached), second 45 ms, no errors. The World guard (run 428) was still
running at this note; it is triggered by the MCP preview files, not by any World source.
Visible version `v2026.11.03.2`, release key `20261103face1` (every camera module moved to it; `20261103zoom1` is gone).
The offline bundle is **352 files, 36.9 MB** (was 23.5 MB): the face finder's runtime and model are 13.4 MB of it.

## What was built

1. **The face pack** (`face-pack.js`, `face-pack-worker.js`, `vendor/mediapipe/`): MediaPipe Face Landmarker 0.10.21
   (Apache-2.0, `vision_bundle.js` as a classic worker script, the SIMD wasm only, and a copy of the Studio's
   `face_landmarker.task`, sha256 `64184e22…`) in a worker, image mode, up to six faces, CPU delegate. Run once when a
   photo opens in the editor (`prepareFaces`), at a working size of 1,280 px; `recipe.faces[]` keeps a compact face per
   person (`compactFace`: 20+20 lip points, 16+16 eye, 10+10 brow, 36 oval, two irises, eight anchors, mouth-open and
   smile and blink scores; about 2.4 KB), normalised by `normaliseFaces` in `looks-gl.js normalRecipe`. The guide
   (`makeup.face`) is `guideFromFace(faces[0])`; a handle dragged runs `syncFaceToGuide` so the landmarks follow (eye
   with its brow, or the lips, or the whole face), and the guide is derived again; the guide's outline is the face's
   own oval and lips (`makeup-guide.js outline`). A glint sweeps the frame while it looks (`.frame.finding`). No face:
   "I can’t see a face here. Tap the face?" (`faceTap`: a second look round the tap, else the handles placed there).
   "Not quite right?" (the old Align face) zooms to the face at up to 3× (`showFace`). The old detector
   (`face-detect.js`, `vendor/pico.*`, `facefinder.bin`, its unit test) is removed; the MCP preview's vendor allowlist
   and policy test name the new files. `tests/face-pack-check.html` is the owner's phone check. On the test portrait the
   eyes land within 8 px and the mouth within 7 px of the hand-aligned truth, with nothing dragged; 97 ms once warm
   here, 2.4 s the first time (loading).
2. **Makeup as looks** (`makeup.js`, rewritten): `MAKEUP_LOOKS` (Natural, Fresh, Clean, Soft glam, Evening, Bold lip,
   Sun-kissed, Rose), each a whole-face recipe; `normaliseMakeup` → `{look, strength, shade, tune, face}` (an older
   recipe's Skin/Lips/Blush amounts become the `custom` look). The pass (`makeupPixels`) works in OKLab on the face's
   masks rasterised from the landmarks (`faceMasks`: lips outer-minus-inner, inner mouth, eyes, irises, brows,
   under-eye bands, cheekbone ellipses, a wide sun ellipse, skin = oval less features and nostrils), with the skin
   gated by its own colour (`own` weight). Skin: frequency split (small and large box blurs; the mid band calmed, the
   fine texture kept); under-eye lift toward the skin median; blush from the skin's own colour toward a tone; lips
   from the lips' own median toward the shade in OKLab, the shift following the lip's light, the lip's shading kept,
   teeth protected by the inner loop and a light-and-grey gate; teeth de-yellowed when the mouth is open; eye whites
   and irises lifted; brows tidied. The look-independent work (masks, Lab, blurs, medians) is cached per face on the
   source pixels (`PREP` WeakMap) and warmed in an idle moment after the faces are found (`warmMakeup`,
   `prepareMakeup`), so a tap costs the mixing alone: about 240 ms on the 1,280-px preview here (CPU, SwiftShader
   container); the first tap 360 ms. Thumbnails: the face cut square from the preview, each look drawn on it
   (`faceCrop`, `facesInCrop`, `drawMakeupThumbs`). UI: `#makeupStrip` (Off + 8 tiles), `#makeupStrength`, the
   handles row, **Fine-tune** (`#makeupFine`: Skin/Lips/Blush/Eyes/Teeth as multipliers 0–150%, the shade chips).
   Looked at (close crops of the mouth, cheeks and eyes for every look): colour inside the lips and nowhere outside
   the oval, teeth white, freckles kept; the first version's flat-paint lips and pink blob of blush were retuned.
3. **Characters** (`face-stamps.js CHARACTERS`, `characterOf`, `characterStamps`, `stampsLabel`): Evil, Shocked, In
   love, Manga, Dizzy, Witch, Cat, Pumpkin, each with two or three variants; the next tap is the next variant; parts
   set by hand that equal a variant read as it ("Evil 1"). `faceSpace(guide,W,H,face)` takes the compact face: the
   crown above the real forehead, the head width from the oval, the brow line from the real brows (`browY(b,space)`).
   `coverBrows`: under drawn-on brows, the forehead's own skin brought down over the real brows through a feathered
   mask of their shape (a clone, so texture and light stay; the first version's flat patches were replaced). UI:
   `#funStrip` with thumbnails, the handles row, **Fine-tune** (`#funFine`: the parts as before).
4. **Auto** (`auto.js levelsFromPixels`): Enhance and Pop from the photo's contrast, median light, saturation and
   cast (a warm scene counts little; a portrait is capped at 0.5 Enhance and gets 0.75× Pop). Applied at capture
   (`takePhoto`), at import (`editFile`, `addToAlbum`) when the camera setting **Auto** (`#autoSetting`, `state.auto`,
   remembered) is on; measured again once a face is found (`remeasureAuto`). The Adjust tab: an **Auto** row first
   (On / Adjusted / Off; off is both 0); Enhance, Pop and the six adjusters behind **More adjustments**
   (`#adjustFine`). Levels here: the harbour sample 0.36 / 0.20, the portrait 0.50 / 0.21.
5. **Copy and feel**: no "Find face" or "Align face" buttons; one-line states; the strips tap with a pop; the glint.
   Two doors on the Adjust tab (a block's Fine-tune, the tab's More adjustments).

## Verification

Local, headless Chromium with SwiftShader (not a phone, not Safari), every camera suite on the final files:
- camera **56/56**, crop **33/33**, integration **8/8**, ui **82/82**, retouch **40/40**, screens **5/5**,
  face-stamps **12/12**, offline **13/13**, backup **7/7**, pop **5/5**, zoom **13/13**, save-share-layout **14/14**,
  paper **5/5**, sticker-contour **4/4**, smart **14/14**; enhance **21/21**, face-pack **4/4**, auto
  **5/5**; the real MCP/Camera acceptance **20/20** (`CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` here) and
  the MCP policy **16/16**.
- Units: makeup **5/5**, face-stamps **6/6**, looks-gl, modules (28 modules, one address each), offline inventory.
- Measured here: the finder 97 ms once warm on a 640 × 960 photo (2.4 s the first time, loading); the makeup pass's
  mixing 240 ms on the 1,280-px preview, the first tap 360 ms (its groundwork is done after the face is found).

Test changes, all for the new behaviour (nothing relaxed): the retouch suite's manual-alignment block became "the face
is found as the photo opens" with the hand-aligned truth as its yardstick (14 px); its Makeup checks drive the strip
and the fine-tune; face-stamps opens the Fine-tune door, samples the brows on the found face's brow line, and gains a
characters check; zoom waits for the faces before comparing recipes; the suites that use Enhance/Pop/adjusters open
More adjustments; the offline inventory's size ceiling is 40 MB with the reason; `makeup.test.mjs` is new for the new
API; `face-detect.test.mjs` is gone with the detector.

## Not done, honestly

- **Physical iPhone/iPad**: untested. First thing: open `/camera/tests/face-pack-check.html` on the phone (does the
  finder load and run; how long).
- **Speed**: the makeup pass is CPU JavaScript; a Strength drag is about 240 ms per step on the 1,280-px preview here.
  The right next step is the GL port the audit named (masks as textures, the mixing in the first pass, the skin's
  blurs from mipmap levels as Pop already does): instant drags, and a tiled save identical to the preview.
- **Multi-face**: every face is found and kept; makeup is drawn on every face; the guide, the stickers and the
  thumbnails use the largest face only. No tap-to-pick yet.
- **Live**: no landmarks on the viewfinder.
- **Faceplugin's Open-Source-Face-Recognition-SDK** and **CMU OpenFace** (the owner, later on 3 November) are face
  recognition (who), not face finding (where): neither runs in a browser nor is open enough to ship; the capability
  (the camera knows it is you and puts your look on; the album grouped by person) would need a small browser-ready
  fingerprint model, opt-in, on the device only, never in a shared backup, and comes after the GL port and the Game
  Boy export if at all.
- **visage** (MIT, Python, dlib 68 points: lipstick and eyeliner through masks; less than here), **SamurAIGPT's
  ai-professional-makeup-generator** (a Next.js app that uploads the photo to a cloud generation API with keys and
  Stripe: against the camera's rule, not usable) and **Jayanths9/Virtual_Makeup** (no licence stated, study only: the
  same MediaPipe 478 points, Lab blending, shade adaptation, presets): the one thing to take from them is **eyeliner
  and eyeshadow** as parts of the looks, drawn from the eye loops the recipe already keeps; a small next job.
- The owner's links (3 November): **Photopea** (github.com/photopea/photopea) holds no code, only issues; the app is
  closed source, so REA on it would be inspecting a proprietary product (AGENTS.md: study, never copy), and its model
  (a desktop Photoshop with layers and panels) is the opposite of this app's bar. Of **OpenModelDB, Upscayl,
  chaiNNer, WaifuXL, palettum, Geometrize**: Geometrize (MIT; a browser port exists) could be a "Shapes" Look, a photo
  rebuilt from a few hundred shapes; WaifuXL's way of running a super-resolution ONNX model in the browser, with a
  small photo model from OpenModelDB (check each model's licence, many are non-commercial), could be an "Upscale" for
  small or old photos; Upscayl and chaiNNer are desktop programs (AGPL / GPL), palettum does what the console Looks
  already do. **GB Dot Converter** (itch.io, free, closed, no source): what makes it special is a check of the unique
  8 × 8 tiles against the Game Boy's limit (and 160 × 144 trimming) so a picture can go into a real cartridge; worth
  building as a "Game Boy export" of the Pocket Look (160 × 144, four greens, the tile count shown) and the Game Boy
  Camera's own dither patterns. None of these were fetched or copied; nothing of theirs is in the repository.

## Next

1. Owner: the phone check page, then the looks and characters on their own photos.
2. The GL port of the makeup pass.
3. Tap a face to pick it in a group photo.
4. The owner's links of 3 November, in order of worth: the Game Boy export, Geometrize's Shapes Look, an Upscale.
