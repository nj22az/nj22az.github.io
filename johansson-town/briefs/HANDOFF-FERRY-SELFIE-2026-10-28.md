# Thuan's selfie on the Minato Maru — 28 October 2026

The owner, with a holiday photo (a selfie at a sea-view rail: one arm out to the camera, a peace sign by the cheek, a big
smile): "Make a scene on the Minato Ferry where Thuan poses like this".

**State: on branch `claude/sweet-goldberg-vivsot`, not on `main`. Publishing waits for the owner's word.**

![Thuan's selfie on the open deck](ferry-selfie/thuan-ferry-selfie.jpg)

## What changed

- **A new fun pose, `Selfie`** (`src/avatars/fun-poses.js`), so the storyteller, World's photo studio (Photo → pose
  "Selfie") and Johansson Studio's Build scene can all use it, on every body. The right mitten is solved to a point ahead
  of the face and above the eyes (where the camera is held), and the left goes up beside the cheek. The face is `excited`.
- **Finger shapes for a move** (`hands` on a fun pose; `src/avatars/animate.js`): on a body with finger bones (the Pixar
  cast), each finger eases from its resting curl to the pose's shape: Selfie's V (index and middle straight, ring, pinky
  and thumb folded) and a closed grip on the camera hand. Mitten bodies keep their mittens.
- **`__JOHANSSON_AUDIT__.stage(name, {pose, expression, at, yaw, parent, shadows})` / `unstage()`** (`src/game.js`,
  audit pages only): a resident's own body built the way the photo studio builds it, posed at its still and set on any
  parent (here the ferry, so she rides her deck). The living resident is hidden while staged.
- **`tools/ferry-selfie-shoot.mjs`**: boots World, lays the ferry alongside, stands Thuan at the open deck's port rail
  (between the liferaft and the funnel, out from under the awning so there is open sky over her), facing inboard, and
  takes the picture from her camera's place: 0.64 m ahead of her face, 0.15 m up and 0.12 m to her right, so her arm
  goes out of frame toward the lens. `--lens`, `--at`, `--yaw`, `--face`, `--time`, `--looks` vary it.
- Runtime rebuilt (`node scripts/build-runtime.mjs`).

## Found and fixed while shooting

- From the stern rail, the awning and its posts filled the top of the frame. She moved to the port rail.
- The first lens, on the line through her hand, put her forearm across her face (her arms are short). The lens now sits
  ahead of her face and her arm comes in from the corner.
- In full sun at under a metre, the sun's shadow map showed as blotches across her skin. The staged body is built
  without shadows (`shadows:false`), as the photo studio builds its cast. Living residents still cast shadows. At the
  game camera's distance the acne doesn't show.
- The audit camera ignores `fov` (also noted in the blog-stamp handover), so the framing comes from the lens position.

## Second round: the hand and the pose (the owner: "Looks like the hand needs improvement? And the pose ?")

Judged up close against the photo in a rig with only Thuan, through the selfie lens, at the hand and from the front and
side (a scratch page, not committed):
- **The V hand:** before, the thumb stuck out sideways, the ring and little fingers hooked half closed, and the side
  of the hand faced the lens. Now the wrist turns the palm to the lens (`hand:[0,1.2,0]` on the left reach), the ring and
  little fingers fold deeper (1.1), and the thumb lies across them. A thumb turned 1.3 bent down to the wrist, so it
  stays at 1.0.
- **The V hand's place:** before, it was pressed against the cheek. Now it sits beside the cheek and a little ahead of it, as in
  the photo (`head:[.75,-.15,.65,.08]`). Further out, at the shoulder, it left the frame and looked like a wave.
- **The camera arm:** it aimed at a point beyond her reach, so it went up over her head and read as a raised fist from
  the front. It now aims where she can reach it, at eye level ((upper + forearm) × 0.92 ahead).
- **The head** tips toward the camera arm (roll −0.2). The face is `excited`, the photo's open smile.
- The lens default is now 0.64 ahead, 0.15 up, 0.10 right, which keeps the camera fist out of frame and the V in it.

## Third round: contour on the fingers (the owner: "The fingers need more contour she's supposed to come out as she is an animated cartoon character")

Why they were flat: the ink pass (`src/render/ink-pipeline.js`) finds edges from depth. On anything marked as skin it raises the
threshold and cuts inside-corner lines by 90%, so that a face's soft curves don't ink as smudges. The hands were marked as skin too,
so a finger against the palm got a faint one-pixel line or none.
- **The hands mark themselves apart.** `pixar.js` gives every Pixar body's geometry a `pixarHand` weight from its own
  skinning (how much the hand and finger bones carry each vertex; Thuan is one mesh, hands and all). `pixar-skin.js` writes
  `HAND_MARK` (0.94) where that weight is over half, `SKIN_MARK` (0.98) elsewhere (program key `pixar-skin-v5`).
- **The ink pass** still treats both as skin for the grade (warm in shadow). Faces keep their softened ink (`gSoft`).
  Hands are inked in full and bolder: depth is sampled from twice as far round (a two-pixel line on a narrow finger),
  with the threshold 1.4× and inside-corner lines at half. At the plain threshold the fingertips' flat facets inked as
  scratches (tried and rejected).
- Seen up close (the selfie) and at a game distance (2.4 m, `thuan-ferry-selfie-wide.jpg`): outlines round each finger
  and the palm, creases where the fingers fold, no blobs from further off. One small facet mark is left at the base of
  the thumb.

**Found and fixed:** the 2.4 m check showed her standing *in* the open deck's side bench (its seat through her legs) at
z −14.4. The close lens had hidden it. Her default spot is now z −13.65, in the gap between the bench's forward end
(−13.95) and the funnel casing (−13.35). Checked clear from 2.4 m.

## Fourth round: her phone (the owner: "Give her a camera", "But bring an open source smartphone", "The phone looks upside down")

- **The model:** the CC0 "6.1 inch smartphone" from 3DAssets.dev (marked AI-generated by the site; 426 triangles,
  21 KB). As published, two slabs of its body stand up above the screen (21.8 mm against an 8 mm phone); the 6.7 inch one
  has the same fault. `tools/clean-smartphone-glb.py` drops those 80 triangles and nothing else:
  `assets/models/props/smartphone-61.glb`, recorded with both hashes in `assets/ATTRIBUTION.md`. Rendered front and back
  after cleaning: screen, dual rear camera, no slabs.
- **A story prop, `smartphone`** (`src/avatars/story-props.js`, with who, why and where). It loads once and each phone
  is a copy; until then a plain slab of its size stands in. It is held upright for a selfie: its length along the
  knuckle line, its back on the flat of the fingers, screen and palm to her. The rear cameras are at the top (the first
  build had them at the bottom: "upside down"). `fit()` then makes the least move (forward off the pads, across its
  width so the thumb lies along its edge, up its length so the little finger is under its bottom edge) that clears
  every finger joint, segment middle and fingertip by a finger's half-thickness, and runs when the phone is given.
- **Selfie's camera hand:** fingers flatter (index 0.32 … little finger 0.45, thumb 0.1), and the wrist turned
  (0.7, −0.2, 0.3). That turn was found by a sweep on Pixar Thuan in node (screen square to her face at 0.999 in the
  solve; 0.946 in the shot, once the shot's own fit is made).
- **Tried and dropped:** a disposable film camera, built and placed first. A 3.3 × 5.6 cm block can't sit in a fist
  curled for a bar: its fingers went through it, or it sat on top of them. The phone replaced it on the owner's word.
- `stage()` takes `props` (given with the pose's own grip). The tool gives the phone, waits for its model, reports
  `phoneClear` (0.0002 m) and `screenToFace` (0.946), aims a check shot at it with `--target phone`, and hides the
  frozen audit's opening notice ("Welcome to Minato."), which had shown in the frame.
- Pictures: `ferry-selfie/thuan-ferry-selfie.jpg` (the selfie), `…-wide.jpg` (2.4 m), `…-phone.jpg` (the phone in her hand).

## Checks

- Every frame was looked at in full: no clipping of the V hand into the hair or head, clean skin, the rail and the sea
  read, and the open right hand stays out of frame.
- `tests/fun-poses.test.mjs`: **4/4 pass** (Selfie on every body, child to elder, slim to round: in nothing, feet on the floor).
- `tests/photo-studio.test.mjs` and `tests/runtime-package.test.mjs`: **8/8 pass**.
- After the second round: fun-poses, photo studio and runtime **12/12 pass**.
- After the third round: `pixar-skin` 5/5 (its mark test updated for the hand mark), `pixar-thuan`, `pixar-johansson`,
  `pixar-meshy`, `ink-recovery`, `looks` all pass. `looks-data` has **1 failure, pre-existing**: it fails the same with
  these changes stashed ("the resident groups cover everybody once"). It isn't related to this work and was left alone.
- After the fourth round: fun-poses, work-kit, onsen-paperback, fujitas-back-moves, halloween-street, police-uniform,
  pixar-skin, pixar-thuan, photo-studio, runtime-package: **65 pass, 1 fail, pre-existing**: "Fujita's squinting eyes
  follow his face", which fails the same with every change here stashed.
- Not run: the full World guard, phone-width or real-device checks, and the photo studio's Selfie through its UI.

## Open / next

- **Under way:** `beginCrossing('airport')` returned false from a freshly parked ferry, so this still is taken alongside
  (only open sea shows behind her). Shooting under way, with a wake and Kitano-jima behind her, needs the timetable's
  own departure (or the operations request's preconditions).
- The photo's yellow bucket hat and white summer outfit are not in Thuan's wardrobe. A sun hat sold at Sakura would give
  her a reason to have one (hat-assets.js).
- **Pixar Thuan's wrist seam:** where her hand meets the forearm, the skin shows a ragged edge. It appears at rest
  too (the rig's untwisted hand), and the palm-forward twist makes it easier to see in this close-up. The fix belongs in
  the model's export (jojo `3d/cast/game_thuan.py`, the hand's join to the arm), not in the pose.
- The phone's fit is measured on Pixar Thuan's hand; another Pixar body gets its own fit, but its screen angle has not
  been checked. Mitten bodies hold it in the fist, unchecked.
- Two pre-existing test failures to look at separately: `looks-data` (resident groups) and `fujitas-back-moves`
  (Fujita's squinting eyes). A 1990s disposable camera in it would explain the arm when the pose is seen from
  another angle.
