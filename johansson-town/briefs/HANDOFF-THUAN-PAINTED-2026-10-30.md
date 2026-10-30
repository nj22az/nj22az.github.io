# Handover: Thuận 2.0's painted face and her meme stickers (30 October 2026)

Stopped at the owner's request ("Stop and write handover") after the sticker sheet's second external audit. Nothing is
running. Nothing is published, merged or opened as a PR.

## Where the work is

| Repo | Branch | Head | State |
| --- | --- | --- | --- |
| `nj22az/jojo` (Studio) | `claude/die-cut-sticker-sheet-i8ppfr` | `5acafa6` | pushed, no PR |
| `nj22az/nj22az.github.io` (World) | `claude/die-cut-sticker-sheet-i8ppfr` | `f38514f` (this note: the next commit) | pushed, no PR |

The full audit trail is in jojo `3d/cast/thuan-2/checks.md` (every round, every verdict), `progress.md` (Done, Next,
Commands) and `review/` (proof sheets; `review/game/` for World). The sticker set is in jojo `art/stickers/thuan-3d/`
(`stickers.json`, `out/` with the 12 stickers and `sheet.png`, `review/sheet-painted.jpg`), documented in
`art/stickers/README.md`.

## The owner's words that set this work

- "Make a die cut sticker sheet with Pixar Thuan", "Need more poses all the cute and playful ones", "I just want higher
  quality", "Make memes in English and Vietnamese with blender Thuan" ("Pixar" is a style word only: no studio names or
  logos in anything made).
- The rigged face (`3d/cast/thuan2.py`): "Thuan looks like a scary doll in Thuan 2"; then "Do it" to her painted face
  made to move (`3d/cast/thuan_paint.py`), "Wow this is almost perfect", "The hair needs to cover that little spot",
  "Show screenshots and audit them as Akira a Toriyama", "Proceed with your plan".
- World: "How to bring Thuan 2.0 To the game ?", "Try and show me progress", "Oh this is much better", then **"Do all"**:
  happy and blink in the game, eyes that move, and the other expressions (which also become the meme stickers).
- Making the painted face World's default is the owner's call: it stays behind `?face=painted`.

## Done (verified)

**World** (`johansson-town/`):
- `src/avatars/painted-face.js`, only with `?face=painted`. The live default is the rigged face, unchanged.
- The painted face lives in two atlases in `assets/avatars/pixar/`: `thuan-face-over.png` and `thuan-face-under.png`, described by `thuan-face.json`.
- 15 frames: neutral, smile, happy, laugh, excited, blink, sleepy, surprised, sad, worried, angry, shy, smug, pout, wink.
- Every feeling World knows is mapped to a frame (`FRAME_OF`).
- Her irises move with World's gaze, clipped by the lids.
- The face version is `PIXAR_BODIES.Thuan.face` = `2ea89d1621`.
- The runtime is rebuilt.
- `tools/pixar-shots.mjs --painted --frames` photographs every frame and five gazes in software Chromium.
- `tests/painted-face.test.mjs` is the test file.

**Studio** (`3d/cast/`):
- `thuan_paint.FRAMES` holds the 15 game frames plus a sticker-only `rawr` (`sticker=True`, kept out of World's atlases).
- `game-frames` writes World's atlases.
- `shots_stickers.py --painted` paints each meme's face (`FACE`) onto her texture at rest before posing.
- `thuan2._matte` makes her painted ink matte. Without it, a far eye on a turned head took the rim light's sheen and read pale blue.
- `art/stickers/compose.py` now fills every hole a die-cut encloses.

## Checks actually run, and results

- **World tests:** the 33 Thuận/Pixar tests (`painted-face` and `pixar-*`) pass, 33/33, on `f38514f`'s assets and runtime.
- **World CI guard** (`node tools/ci-guard.mjs`, on round 6's commit `05f5d79`): 90 of 91 files are green.
  - `tests/no-z-fighting.test.mjs` runs out of Node's 2 GB heap in this cloud container.
  - It fails the same way with `painted-face.js` and `pixar.js` put back to `af7c487` (the last green guard).
  - It passes 13/13 with `NODE_OPTIONS=--max-old-space-size=6144`.
  - It builds the town from `src/world`, which this work does not touch.
  - The full guard was **not** re-run on `f38514f`. That commit changed only assets, the face hash and the runtime.
- **In-game external audits** of the 15 faces (shot-checker, four masters):
  - Rounds 1 to 5 scored 9, 8, 10, 12 and 11 PASS of 15, with no FAIL.
  - Pout was redrawn twice since. Round 6's V read as a glare; round 7 (current) is **WEAK, close to FAIL**: it reads bored, not a sulk.
  - Also WEAK at round 5: blink, worried and angry. Angry reads as a smirk.
- **Sticker sheet external audits:**
  - Round 1: 3 PASS, 7 WEAK, 2 FAIL.
  - Fixes since: rawr's face, pout's face and the die-cut holes.
  - Round 2 (current): **1 PASS (please), 9 WEAK, 2 FAIL (look_back, kneel)**. The faces act now; huff's is "the best of the attitude faces".
- **Not tested:** any physical phone, and the painted face in the live game without `?face=painted`.

## Open problems (the sheet is shown to the owner marked failing)

In the poses (jojo `3d/cast/poses.py`, from the first sheet):
- **look_back:** no real glance back over the shoulder. A dark smudge on the cheek: a rim-light shadow, present on the original model too. The eyes diverge at that angle. A fist with a hole.
- **kneel:** reads as standing, and the face is tiny.
- **shoulder_peek:** the left sleeve hem is dragged into a horn by the arm crossing the turned chest. The pose check also finds a hand 64 mm into the thighs.
- **hair_tuck:** a hard cuff band and a sleeve spike. The hand is not at the ear.
- **huff:** the folded arms are stiff tubes, with a dark wedge where the braid streaks into the sleeve.
- **hip_pop and heel_pop:** full length, so the face is too small at 200 px.
- **lean_in:** a pale wedge at the hip.

In her base model, on every sticker:
- the shirt's seam cracks;
- ragged braid tips;
- dark hair strands by the cheeks;
- pointed ears;
- doll-joint wrists;
- the busts cut flat at the bottom over the caption.

Faces:
- The in-game pout needs a shape of its own: a lip that reads at game size, a puffed cheek or the chin up. The earlier puff discs read as ghosts.
- A faint smirk crease at her left mouth corner shows in every face. It comes from her base paint.

## Next concrete actions

1. Wait for the owner's choice. My question to them: start the pose fixes with look_back and kneel (the two FAILs), or frame the full-length stickers closer first?
2. Pose fixes in `poses.py`, each tested by its pose check (`PO.check`) and a still. Then the external audit, then the owner.
   - About 25 minutes a pose on a cloud CPU (20 of them posing); far less on the owner's M1 Pro (`CAST_DEVICE=GPU`).
   - Save the posed `.blend` to iterate on lighting without posing again.
3. Pout in the game: a new mouth shape, then `thuan_paint.py game-frames`, then copy the three files to `assets/avatars/pixar/`.
   - Bump `PIXAR_BODIES.Thuan.face` to the sha256 (first 10) of the json, the over PNG and the under PNG, in that order.
   - Then `npm run build:runtime`, the painted tests, `pixar-shots.mjs --painted --frames`, and the external audit.

## Rebuilding the working files (the cloud scratchpad is gone with the session)

The posed blends, measures and clean captures were in the session's scratchpad.

To rebuild them in jojo `3d/cast/`, follow `thuan-2/progress.md`, "Commands":
1. `shots_poses.py build Thuan`
2. `thuan2.py paint`
3. `thuan_paint.py base`

The measures dir (`measures.json` and `face-front.png`) comes from `thuan2.py paint`'s work dir.

Run the stickers with `CAST_OUT=<dir> python shots_stickers.py <base.blend> <poses> --painted <measures dir> --samples 64 --size 1600`.

Cut and lay out with:
1. `python3 art/stickers/prep3d.py <stills> <raw>`
2. `python3 art/stickers/compose.py <raw> art/stickers/thuan-3d/out art/stickers/thuan-3d/stickers.json "art/stickers/fonts/Baloo2[wght].ttf"`

Gotchas:
- Never `pkill -f` a pattern that appears in your own command line: it killed the shell twice.
- Background jobs in a cloud session stop at 2 hours, so use `nohup … &` for long renders.
