# Pocket Camera: audit for a professional photo editor that stays a PWA — 2 November 2026

The owner (2 November 2026): "Pocket Camera is pretty fun, how can you help me bring it to a professional photo editing
app? like Meitu and Line Camera? how do we reach that and still keep it PWA browser based? audit it pls", then "I also
want fun effects like Manga eyes, evil eyebrows, Halloween cute stickers etc (maybe things can be brought from the avatar
creator and Johansson World?)" and "Imagine using stickers for the eyebrows from the avatar creator".

This is an audit and a plan. **No runtime file was changed.** Main at the time: `4f545da` (Camera release
`v2026.11.01.3`, cache key `20261101screen1`, published via #423). Nothing of Meitu's or LINE's art or code is to be used:
only their feature categories are compared, as with the manga moment.

## Verdict

Pocket Camera already has the right foundations for a professional editor, and some parts are better than the apps it is
compared with:

- **Looks**: 34 hand-tuned Looks, each judged by the artists of its medium, mixed up to three deep with strengths. No
  mainstream beauty app has a filter set this deliberate.
- **Non-destructive editing**: every photo keeps its original and a plain-data recipe, so re-editing starts from the
  original. This is how Lightroom works, and it makes undo/redo, presets and face anchors cheap to add.
- **On-device processing**: WebGL2 rendering, tiled 16 MP saves, PhotoCraft content-aware fill in a 157 KB WASM worker,
  a bundled face detector, nothing uploaded.
- **A verified offline PWA**: 325 assets (about 22.7 MB), checked against SHA-256 hashes, with a safe Update action.
- **Tests**: about thirty unit and browser suites in CI.

What separates it from Meitu and LINE Camera:

1. **It does not know where the features of a face are.** It finds one box per face (pico.js) and the user places the
   eyes and mouth by hand. Every Meitu feature depends on facial landmarks: reshaping, big eyes, real lip masks,
   eyebrows, live AR stamps. So do the manga eyes and evil eyebrows asked for.
2. **No segmentation**: nothing separates person, hair, skin and background, so there is no background blur or
   replacement and no hair colour.
3. **No warp engine**: nothing can reshape (enlarge eyes, slim a face).
4. **No live AR**: stickers do not follow a face in the viewfinder.
5. **Basic adjustments only**: six sliders. There are no curves, HSL, highlights/shadows, local masks, straighten or
   blur/mosaic brush.
6. **No general undo/redo**: only Erase and Surprise can be undone.
7. **Album safety**: there is no backup or export of the album, and the owner's report of missing earlier photos is
   still open.

All seven can be built in the browser. The key addition is one on-device model runtime, **MediaPipe Tasks Vision**
(Apache-2.0). It gives 478 face landmarks including the irises, 52 expression scores (brow down, smile, blink, jaw
open…) and person/hair masks, all offline. The Studio already ships its face model:
`avatar-creator/acting/vendor/face_landmarker.task`.

## What a browser cannot do (state these honestly in the app)

| Native feature | In a PWA | What to do |
|---|---|---|
| Full-sensor stills (12–48 MP) | Safari has no `ImageCapture`. The shutter saves a video frame: `getUserMedia` asks for 1920×1440, about **2.8 MP** (`app.js:550`, `app.js:758-762`) | Add a **Full quality** button that opens the phone's own camera (`<input type=file accept=image/* capture>`) and takes the photo straight into the editor. That photo is full size but has no live Look preview. |
| Saving straight into Photos | Not possible | Already handled: Share → Save Image |
| Receiving photos from other apps | Web Share Target works only for Android Chrome installs; not on iPhone | Add `share_target` for Android; iPhone keeps Photos/paste/drop |
| RAW, ProRAW, Live Photos, portrait depth maps | Not exposed to the web | Out of scope |
| HEIC import | Safari decodes it; Chrome and Firefox on desktop do not | iPhone users are covered. A desktop HEIC decoder (libheif, LGPL) is not worth its licence and size now |
| Album safety | The browser owns the storage. On iPhone, Safari and the Home Screen app keep **separate** albums, and Safari website data can be evicted | Backup/export (P0 below), and show where the album lives |
| Generative AI (AI art, outpaint, upscale) | Not realistic on a phone at these sizes; would need a server and break "nothing uploaded" | Leave out. Revisit only as an explicit, opt-in online feature |

## Findings

Priority: **P0** trust (never lose work), **P1** core of the Meitu/LINE experience, **P2** professional depth,
**P3** polish.

### Trust and data

- **P0 — No album backup, export or import.** Photos live only in IndexedDB (`album.js`). The missing-photos report
  (RETOUCH handover, 1 November) is still unresolved. The likeliest cause is that Safari and the Home Screen app keep
  separate albums; the owner is checking. A professional editor must make loss recoverable:
  - **Export album**: one ZIP containing originals, recipes (JSON), finished JPEGs and own stickers.
  - **Import album**: the same file restores the album, merging by id and never deleting.
  - **Album storage** in Settings: where the album lives (Safari or Home Screen app), photo count, space used
    (`navigator.storage.estimate()`) and whether persistent storage was granted (`navigator.storage.persisted()`).
    `keepAlbum()` already requests persistence after a save; nothing shows the result.
- **P1 — Imported photos get the wrong date.** Imports take `file.lastModified` (`app.js:1046`, `1050`, `1064`). The
  date stamp and album order should use the EXIF capture date, `DateTimeOriginal`. On iPhone, `lastModified` is probably
  the day the photo was chosen, so a summer photo would print `’26 11 02`; this needs confirming on the device. Read
  only the date tag; keep stripping GPS from saves, as now.
- **P3 — The album loads every record at once** (`listShots` uses `getAll()`). This is fine for hundreds of photos. A
  library of thousands needs a cursor and an index on `created`.

### Editing core

- **P1 — No general undo/redo.** The recipe is plain data, so a history stack of recipe snapshots is cheap: about 30
  steps, cleared when the editor closes. Erase already keeps bounded source revisions; history can point at them. Add
  standard shortcuts (⌘Z / ⇧⌘Z) and two buttons.
- **P2 — Adjust has six sliders** (Light, Contrast, Colour, Warmth, Pattern, Detail) plus Enhance. Missing:
  highlights, shadows, whites/blacks, vibrance, tint, sharpen/clarity, vignette, grain, fade, HSL per colour and a tone
  curve. All of these fit the existing first GPU pass in `looks-gl.js`, before the Looks, at no meaningful cost.
- **P2 — Crop has fixed shapes only.** Missing: free aspect, rotate 90°, straighten (±45° with a level), flip and
  perspective (keystone).
- **P2 — No local adjustments.** Missing: a brush, radial or linear mask for light and colour; a **blur/mosaic brush**
  for hiding faces and number plates; a doodle pen.
- **P2 — Text is balloons, captions and sound effects only.** Missing: plain text with fonts, colour, outline,
  background and curve.
- **P2 — Sticker handling.** Missing: a layer list (reorder, lock, hide), duplicate, opacity, recently used and
  favourites. The limit of 40 per photo is fine.
- **P3 — No collage/grid templates.** A LINE Camera staple; it reuses the album and frames.

### Face: the core of the Meitu experience

- **P1 — Face model.** `face-detect.js` returns one box for the largest face. `makeup.js` then guesses the eyes and
  mouth, and the user corrects them with the guide. Landmarks would provide:
  - every face in the photo, each selectable;
  - automatic makeup placement, with the guide kept for corrections;
  - a real lip mask instead of the template;
  - eye brightening, teeth whitening and under-eye correction;
  - anchors for eyebrow, eye and mouth stamps;
  - live tracking.
- **P1 — Warp pass.** Add a bounded mesh warp to the first pass, driven by landmarks: at most 16 local scale/push
  controls, computed in the shader, so tiled saves match the preview exactly. Order: warp → Enhance/Makeup → Looks. The
  Looks then draw the reshaped face. Guardrails:
  - strengths are capped;
  - hold to compare, as now;
  - warn when a straight line behind the face (a door frame or tiles) would bend;
  - **no unnatural behaviour**: an effect that tears, swims or doubles an edge is a bug.
- **P1 — Segmentation.** MediaPipe's selfie segmenter (0.25 MB) gives a person mask; its hair segmenter (0.78 MB) gives
  hair. These enable:
  - background blur (portrait mode);
  - **background replacement with real Minato places**, using the room captures that `tools/render-feed-backdrops.mjs`
    already makes for the comics, so a person can stand in Sakura Shōten or on the harbour;
  - hair colour;
  - own stickers cut from any photo, not only pasted iPhone cut-outs.
- **Earlier work:** unmerged PR #405 (`codex/pocket-camera-looks`, `f13068cc`) prototyped a person mask in a worker. It
  shares no merge base with the current branch and predates crop, Enhance and paper. Read it for lessons; do not merge
  it wholesale (see `HANDOVER-INTEGRATION-2026-10-30.md`).

### Camera

- **P2 — Capture resolution**: see the browser-limits table. Add the Full quality path.
- **P1 — Live AR**: face stamps that track in the viewfinder, and expression triggers. For example: open the mouth and
  a ghost flies out; frown and the anger vein appears. The landmark model runs in real time on recent phones, but this
  must be **proved on the owner's iPhone**, in Safari and as the Home Screen app, before it is promised. Photos keep
  working without it.
- **P3**: grid/level overlay, burst.

### Platform

- **P2 — `app.js` is 1,616 dense lines (107 KB).** Every new professional feature would land there. Put new work in
  its own modules (`face-pack.js`, `face-anchors.js`, `face-parts.js`, `history.js`, `backup.js`) instead of growing
  `app.js`. No rewrite.
- **P2 — The manifest** lacks `share_target` (Android), `file_handlers` (desktop Chrome), `launch_handler`, and
  `screenshots`/`description` for the richer install sheet.
- **P2 — Heavy work runs on the main thread.** Face detection and the export composition do; Erase already uses a
  worker. Put the landmark model in a worker; measure on the iPhone before moving the export.
- **P3 — sRGB only.** iPhone photos are Display P3, so the most saturated reds and greens are clipped on save. Safari
  supports P3 canvases. Worth doing after the face work.
- **Systemic — no physical-device checks.** Every Camera handover lists physical iPhone and iPad Safari as unverified.
  For an editor used mainly on a phone, that is the biggest quality risk. Each phase below ends with a short device
  checklist the owner runs, recorded in its handover.

## Fun face effects: what the avatar creator and World already have

The avatar creator (Studio) has no face code of its own. It uses World's **`johansson-town/src/avatars/face.js`**, a
pure Canvas 2D face painter with no imports, drawn in a 256-unit square and turned by a mood value:

- **Brows**: 12 styles in `recipe.js` — straight, arched, thick, thin, worried, bushy, angled, short, rounded, tapered,
  feathered and maro (none is a 13th option). `drawBrow(ctx, x, y, s, side, brows, tilt, mood)` turns the inner end down
  by `mood` (`face.js:454`). The moods include angry (1.4), **scheme (1.7, the evil grin)** and raging (1.9). The comment
  there records the Studio fix "Tetsuos eye brows look worried instead of evil", so the evil brow has already been
  judged once. They are **vector strokes**, so a brow drawn at a 16 MP photo's resolution stays sharp: better than a
  bitmap sticker.
- **Eyes**: 17 styles (the biggest are sparkle, doe, lashes and starry) and symbol eyes: star, heart, spiral, blank,
  bawl, wink, smug, droop, dreamy, shock, pain and daze.
- **Mouths**: about 28 (snarl, gritted, jawdrop, wail, bleh, smirk…).
- **Marks**: blush, flush, gloom, puff, waterfall tears, sweat, anger vein and drool.
- **Expressions**: 46 moods (`MOOD`), each with a label (`EXPRESSION_INFO`) and a text glyph.
- **The catch**: `drawEye`, `drawBrow`, `drawMouth` and `drawMarks` are not exported, and `drawFace`/`drawPart` paint
  the skin square first. The fix is small: export those four functions, unchanged, from `face.js`, and have the camera
  **import them, never copy them**, as it already imports World's Looks. A brow changed in the Studio then changes in
  the camera.

**Halloween and seasons:**

- **Halloween exists only as 3D World props.** In `world/halloween-props.js`: a paper pumpkin lantern, a jack-o'-lantern
  pail, an obake ghost (cut-out and plush) and Kuro the black dog. In `avatars/story-props.js` (`buildCostume`): a
  pumpkin suit, a ghost sheet and a witch hat.
- **There is no 2D Halloween art, and no bats, skulls, candy, fangs, horns or masks anywhere.**
- **Year-round paper shapes**: `world/interiors/sakura-dressing.js` has the 2D paper shapes in Sakura's window, with
  `seasonFor(date)` exported. There are 27 shapes, among them kagami-mochi, daruma, the Setsubun oni, hina, koi, kabuto,
  teru-teru-bōzu, frog, tanzaku, fūrin, hanabi, moon, rabbit, dango, momiji, kaki, snowflake and a Christmas tree. Its
  `SHAPES` table is not exported.
- **Drawing tool**: `tools/draw-manga-marks.py` (Pillow; ink line and white die-cut edge, saved as 512/256 px WebP) is
  the tool that drew the camera's ten manga marks, and can draw new sets.

### Design: face stamps

A new kind of sticker, anchored to a feature of a face rather than to the picture:

- **Anchors**: browL/browR (one pair, mirrored and edited together), eyeL/eyeR, nose, mouth, cheeks, chin and the top of
  the head (hats, ears, horns).
- **Recipe**: `recipe.faces[]` keeps a small, source-normalised snapshot of each face's anchor points: about 20, not all
  478. The face is then detected once, saves and re-edits draw identically, and the user can correct a point with the
  existing guide, as with makeup now. A stamp keeps `{anchor:{face, to}}` plus offsets in face units. The crop maps it,
  as it maps makeup today.
- **Two finishes**:
  - **Sticker**: white die-cut edge, drawn after the Looks, like the other stickers.
  - **Drawn on**: ink only, drawn *before* the Looks, so Manga inks the brows and Riso prints them.

**Effects:**

1. **Evil eyebrows ("Brows")**:
   - the 12 avatar brow styles with a **Mood** slider: Calm → Worried → Cross → Evil (face.js's own mood values);
   - colour: ink black, the person's own brow colour (sampled), or a fun colour;
   - **Hide my brows** heals the real brows first with the existing PhotoCraft fill, through a mask from the brow
     points. This reuses Erase and adds no new engine.
2. **Manga eyes**, in three strengths:
   - **Manga shine**: two white catchlights on each real iris, placed from the iris landmarks. The subtlest, and the
     most like printed manga.
   - **Big eyes**: the bounded warp.
   - **Drawn eyes**: face.js's sparkle, doe and starry eyes and its symbol eyes (heart, star, spiral, shock) over each
     eye, for a comedy look.
3. **Expressions**: one tap applies one of face.js's 46 moods as a set of brows, eye marks and marks. For example,
   Scheme gives evil brows and a gleam; Raging gives brows, the anger vein and flush. Each is labelled from
   `EXPRESSION_INFO`. These are small stories, in keeping with Johansson Town's storytelling purpose.
4. **Halloween sheet** (new `tools/draw-season-stickers.py`, in the marks' style):
   - **World's own Halloween**, redrawn in 2D from the 3D props so the camera matches the town: the pumpkin lantern, the
     jack-o'-lantern pail, the obake, Kuro the black dog, the witch hat and the pumpkin-suit cap.
   - **New and cute**: bat, candy, spider on a thread, moon and a friendly skull.
   - **Face-anchored**: witch hat, cat ears and devil horns (head), fangs (mouth) and a domino mask (eyes).
5. **Season sheets**: Sakura's window shapes become stickers. Export `SHAPES` and render it to WebP. The camera opens
   with the sheet for the current month from `seasonFor(date)`, so the camera's sticker is the one hanging in Sakura's
   window that month. Halloween is the October sheet, available all year.

None of this needs Meitu's or LINE's art: the faces, props and drawing tools are the studio's own.

## The model pack (keeping it a PWA)

| File | Stored | Purpose |
|---|---|---|
| `@mediapipe/tasks-vision` 1.2.0 WASM, SIMD build (Apache-2.0) | 14.5 MB (4.1 MB gzip) | Runtime for everything below |
| `face_landmarker.task` (already in the repo, Studio) | 3.76 MB | 478 landmarks, iris, 52 blendshapes |
| `selfie_segmenter.tflite` | 0.25 MB | Person/background |
| `hair_segmenter.tflite` | 0.78 MB | Hair |
| (not recommended) `selfie_multiclass_256x256.tflite` | 16.4 MB | Skin/clothes/hair classes; too big for its gain |

Sizes were measured on 2 November 2026 from the npm package and Google's model URLs.

- **A separate, optional "Face pack"** of about 19 MB stored, offered on first use of a face tool with its size stated.
  The base 22.7 MB bundle stays as it is, so people who never use face tools never download it.
- **Same rules as the base bundle**: its own cache and manifest, hash-checked and atomic, with the same Update rules.
- **pico.js stays as the fallback** when the pack is absent, with today's manual guide.
- **Self-host the runtime.** Never load it from a CDN, as the Studio's `acting/tracking-worker.js` does today
  (jsDelivr 0.10.21), which also breaks the Studio offline.
- **Share one model file** between the Studio and the Camera. The worker's path allowlist (`sw.js`: only `/camera/` and
  `/johansson-town/src/render/`) needs one more shared folder.
- **Notices (P2, already a gap)**: the Pocket Camera section of `THIRD_PARTY_NOTICES.md` lists only Baloo 2.
  PhotoCraft (`pocket-algo.LICENSE.txt`), pico.js (`vendor/pico.LICENSE.txt`) and M PLUS Rounded 1c
  (`fonts/OFL-MPLUSRounded1c.txt`) ship with their own licence files but are missing from that index, as is the
  Studio's MediaPipe model. Add MediaPipe and its model cards when the pack arrives.
- **Measure on the live host**: whether it serves the WASM compressed decides whether the download is about 9 MB or
  about 19 MB.

## Roadmap

Each phase is publishable on its own, ends with browser suites in `camera/tests`, a regenerated offline bundle and the
owner's iPhone checklist, and goes to main only on the owner's word.

| Phase | Work | Done when |
|---|---|---|
| **0. Trust** | Album export/import ZIP; Album storage panel; EXIF capture date for imports; undo/redo history | A ZIP round trip restores originals, recipes and own stickers byte for byte; the date stamp of an imported iPhone photo shows its capture date; 30-step undo/redo passes a browser suite |
| **1a. Brows and eyes, no model yet** | Export face.js's four part painters; face stamps anchored to the existing face guide (its eye points place the brows); Brows with Mood; Manga shine and Drawn eyes; Halloween and season sheets | Stamps follow the guide through crop, re-edit and save; brows sharp at 16 MP; Drawn on is inked by Manga; the Studio's faces unchanged (World guard) |
| **1b. Face pack** | Self-hosted MediaPipe in a worker, optional download; landmarks into `recipe.faces`; multi-face; automatic placement for makeup and stamps; real lip mask; Hide my brows | Works offline after the pack; pico fallback without it; landmarks within tolerance on the Pexels test portrait; **owner's iPhone: Safari and Home Screen** |
| **2. Beauty and backgrounds** | Warp pass (Big eyes, face slim, smile); eye brighten, teeth whiten, under-eye; background blur and Minato backgrounds; hair colour; cut-out stickers from any photo | Preview equals tiled save; no bending of straight lines without warning; hold-to-compare; device checklist |
| **3. Professional adjustments** | Highlights/shadows, whites/blacks, vibrance, tint, sharpen, vignette, grain, fade, HSL, curve; straighten/rotate/flip/perspective; local brush/radial/linear; blur/mosaic brush; free text; sticker layer list | Each control reversible in the recipe; old recipes render unchanged |
| **4. Live** | Live face stamps and expression triggers in the viewfinder; Full quality capture; collage; manifest share target/file handlers | Frame rate measured on the owner's iPhone; camera works with the pack absent |

**Recommended start: Phase 0 and 1a together.** Phase 0 protects the photos. Phase 1a delivers the evil eyebrows,
manga eyes and Halloween stickers this week without any new download, and builds the anchor system that Phase 1b's
landmarks will drive. Phase 1b's first step is a spike: prove landmarks offline in a worker on the owner's iPhone, in
Safari and as the Home Screen app. That result decides how far Phases 2 and 4 can go.

## State and next actions

- Branch `claude/laughing-brahmagupta-ybyndm`: this audit and the HANDOVER.md index row only. No runtime change, no
  release key change, no tests run, as none apply to a document.
- Verified while auditing: the camera code paths cited above; the brow, eye and mood code in `face.js`; the Studio's
  MediaPipe model and its CDN runtime; `seasonFor` in `sakura-dressing.js`; the MediaPipe package and model sizes.
- Not verified: anything on a physical iPhone, including the `lastModified` date behaviour and the MediaPipe frame rate.
- Next: the owner chooses the starting phase. With 1a, export the four face.js painters first, so the World guard
  proves the Studio and World faces are unchanged before the camera uses them.
