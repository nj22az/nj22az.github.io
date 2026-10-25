# Handover: the cosy face (25 October 2026, evening)

The avatar remake after step 1 (the rigged eyes, [HANDOFF-AVATAR-EYES-2026-10-25.md](HANDOFF-AVATAR-EYES-2026-10-25.md)): the
rest of the creator's cosy-anime critique of 25 October 13:19 (Ghibli, Animal Crossing, Breath of the Wild), in the face
painter and the head. The creator (17:03): "continue the avatar remake". Plan and review sheets: studio repo `nj22az/jojo`,
`3d/cast/avatars-cad/HANDOFF.md` and `3d/cast/avatars-cad/cosy-face/`.

**State: built on branch `claude/avatar-remake-continue-llretw` behind a switch, off by default: `?cosy=1` on any World or
Studio page shows it (with the rigged eyes, now on main: `b3ebec8a`, published on the owner's "Push"). Not merged to main, not published,
not yet judged by the creator.**

## What it is

`src/avatars/cosy-face.js` holds the switch (`cosyFaceOn()`, `?cosy=1`; `buildAvatar(recipe,{cosy})`, `avatar.cosy`;
`drawFace` takes `state.cosy`) and every number (`COSY`), so the look is tuned in one place.

- **Brows** (`face.js drawBrow`): every line style becomes one filled tapered ribbon along the style's own curve (round
  thin ends, fullest a little inside the middle, 30% fuller at the inner end), no hair ticks on bushy or feathered; the
  solid styles (tapered, maro) keep their shapes. Colour: the brow colour darkened to 0.8, then 35% toward taupe
  `#7a5c4a` (`cosyBrowInk`): black hair gives a warm dark brown, Johansson's grey a taupe grey.
- **Mouth** (`drawMouth`): natural lips draw in warm dark brown `#5a3025`, the open mouth's inside `#3b1f1a`. Lipstick
  (Thuan) keeps its own colour, as today.
- **Stubble**: one soft tint of the whiskers' colour (alpha 0.2) over jaw and upper lip, fading to the sides, the lips
  left clear (`stubbleTint`). The game's 120 raised bristles (`face-objects.js`) and the painter's dots are left out; the
  "Stubble shadow" mark keeps its shadow without speckles.
- **Blush**: never below 0.22 on the cheeks; a soft spot on the nose tip; the ears' colour 18% toward pink.
- **Nose**: no line or ring round it. The ball noses (button, wide, hook, dot, ...) become a smooth rise of the face
  (`build.js inkNoseBump` with `cosyNoseShape`): the ball's size, wearing the face's own canvas, profile (1−r²)^1.6 with a
  foot 1.45× wide, so it meets the face tangentially and the ink pass finds no edge to outline (a first try with the ink
  noses' hemisphere still drew a thin ring on Thuan). The painter draws only a small soft shadow under the tip. The ink
  noses (Vy's drawn line) are untouched.
- **Ears** (`build.js` ears): turned 27° so the back edge stands out, 3% further out, blushing; the braids' inner ear
  turns with them.
- Off is exactly today: same geometry, same painting (tested).

## Checks run (25 October, evening)

- `node --test tests/cosy-face.test.mjs`: 4/4 (off unless `?cosy=1`, and off paints and builds exactly today for all six;
  every brow style filled in the taupe, none stroked; the ribbon's taper; no black line on any of the six in any of the 46
  expressions except the painted eyes; Johansson's stubble dots gone, Thuan's lipstick kept; in 3D no bristles, the cosy
  nose on the head in the face's material, Vy's ink nose identical, finite geometry). Added to `tests/ci-guard.txt`.
- `node tools/cosy-face-sheet.mjs` (new): a sheet per resident, today beside cosy, front, three-quarter, side and six
  expressions plus talking, in the ink pipeline (software GL). Copies for the creator: jojo
  `3d/cast/avatars-cad/cosy-face/<name>.jpg` and `all-six-front-and-three-quarter.jpg`. Every cell looked at.
- Full guard (`NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`, 85 files): 424/427 in one run. Three
  failures: `runtime-package` (source changed, runtime not yet rebuilt) and `no-z-fighting` and `pair-poses`, both killed
  by the container (SIGKILL, memory, no failed assertion). After `npm run build:runtime` (committed): `runtime-package`
  4/4, `no-z-fighting` 13/13, `pair-poses` 4/4, each run on its own.
- `node tools/cloud-boot-smoke.mjs --eyes3d --cosy` (new `--cosy` flag: boots with `?cosy=1`) on the rebuilt runtime,
  phone viewport: island ready in 34 s, 7 steps, no page errors; Johansson's face photographed in the street (jojo
  `3d/cast/avatars-cad/cosy-face/Johansson-in-game.jpg`). Seen there: at phone close-up a **faint thin line still traces
  the cosy nose's lower edge** (today's bold double ring is gone); to remove it, widen `noseFoot` or lower `noseProfile`.
- Not checked: a physical phone or a GPU browser; the Studio avatar creator page.

## Open, for the creator

- Judge the sheets. Known: Tetsuo's hook nose loses its punch front-on (it reads in three-quarter and side); Johansson's
  grey stubble tint is faint on his skin (by design: "a soft tint"); the ears barely change front-on where hair covers
  them (Johansson, Tetsuo, Mr Fujita), and show clearly on Thuan.
- If accepted: switch on by default (`cosyFaceOn` returns true unless `?cosy=0`, as `eyes3dOn` does), rebuild the runtime,
  then publish on the owner's word (the eyes are already on main).

## Next

1. The creator judges the cosy face; tune `COSY` from the notes.
2. The remake's step 2, the neck (a drawing first): jojo `3d/cast/avatars-cad/HANDOFF.md`.
