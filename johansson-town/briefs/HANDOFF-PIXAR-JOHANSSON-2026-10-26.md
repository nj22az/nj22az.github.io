# Handover: Pixar Johansson in Johansson World, and the Pixar rendering brief (26 October 2026)

The owner, 26 October 2026, in order: "Fix Johansson's blockers and bring him into the game, Thuans expressions need some
work too, she needs more personality when she is shocked and the different expressions, now she comes off as Generic";
"You need to audit and rig his whole face"; "The nose looks broken like a piece of meat cutting through it"; "Remove the
goatee"; "Remove moustache give him a mouth back"; a pasted brief, "Upgrade Character Rendering, Shaders, and Facial
Geometry to a Pixar/Disney Stylized Standard" (skin, eyes, brows and facial hair, mouth, neck and idle); and "Bring the
mouth further down so it's more visible"; "Have his head complete bald it's better"; "He shouldn't do the Hitler
salute".

## State

- **Branch `claude/vibrant-brown-0udpq3`** of this repo and of the studio repo (`nj22az/jojo`). **Not on `main`.** Pixar
  Johansson is in `PIXAR_BODIES`, so on this branch every World and Studio page draws him (`?pixar=0` the cartoon;
  `?pixar=thuan` her alone). He is the player: publishing him waits for the owner's word (AGENTS.md, "Except Thuan").
- **On `main` once merged, the rendering brief also changes Pixar Thuận** (live today): warmer shadows on her skin, a rim,
  the eye and brow shading, the mouth colours. Her lit skin is as before (measured, below).

## What it is

- **His model** (`assets/avatars/pixar/johansson.glb`, 1.57 MB, 24,195 triangles; card `johansson.json`): from the
  studio repo's `3d/cast/game_johansson.py`, his painted film model posed into World's rest on World's bones and the
  face's (jaw, nose, cheeks), World's height for him (1.6768). The audit's blockers and how each was met: jojo
  `3d/cast/AUDIT-JOHANSSON-GAME.md` "Status"; his face (eyes set about his nose, the nose coloured by its shape, the
  goatee and moustache gone, the mouth lowered, his head bald, jaw weights, hats on his skull): jojo `3d/cast/AUDIT-JOHANSSON-FACE.md`.
- **His acting** (`src/avatars/face-acting.js`): his feelings his own (drier, a beat slower than hers), an older face's
  lines (forehead lines, crow's feet, smile lines). **Thuận's** feelings were reworked the same day for personality
  (shock, anger, joy and the rest each her own, leaning to one side): `face-acting.js` `THUAN`.
- **The rendering brief, for every Pixar body**:
  - `src/avatars/pixar-skin.js` (new): on skin, a warm shadow tint and a coral terminator instead of the town's cool one,
    the ambient on the side away from the sun warm at the same brightness, a soft sheen; a Fresnel rim round the body
    (warm cream sunward, sky blue on the shadow side). The feature decals (lips, brows) are lit the same, without the rim.
  - `src/render/ink-pipeline.js`: the grey smudges under his cheekbones were the ink pass's inside-corner ink and the
    grade's violet split tone. A Pixar skin pixel marks itself (scene alpha `SKIN_MARK` 0.98, only while the pass draws
    its scene: `markSkin`), and there gets no inside-corner ink, inks only firm edges, and has warm darks
    (`GRADE_DEFAULTS.skinShadowTint`). Everything else in the town draws exactly as before.
  - `src/avatars/eyes3d.js`: for a modelled eye only (`lidShadow`, `warmIris`, 0 for the cartoon): the lid's warm shadow
    over the top quarter of the white and the iris, a warm ring round the pupil, a darker rim.
  - `src/avatars/face-features.js`: brows with volume (lighter top, darker underside, a soft warm shadow under them), his
    brows #3d322c; the mouth's interior #4a151b and tongue #d96b70; smile lines for a face with `lines` (his).

- **The wave** (`src/avatars/animate.js` `Wave`, every resident's greeting, cartoons too): it raised a straight arm high
  and forward with the hand flat, which read as a salute on his Pixar body. Now the upper arm is out a little above the
  shoulder, the forearm up beside the head swaying from the elbow, the palm turned to the front (the hand bone's own
  turn: a turn of the forearm's Euler swings it forward instead). `tests/wave-gesture.test.mjs` (in the guard) fails on
  the old pose and passes on the new for Johansson, Thuan and Mr Fujita.

## Checks (26 October 2026)

- Full guard `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`: **454/454 pass**, 88 files (355 s), on
  the final source with the rebuilt runtime (`runtime/boot-DFdbsctv.js`). New in it: `pixar-johansson` (5),
  `pixar-skin` (4), `wave-gesture` (1).
- `node tools/pixar-shots.mjs --name Johansson` on the built runtime: island ready, playing, Johansson found on Main
  Street drawn as his Pixar body (3 meshes), front, three-quarter and five face frames, **no page errors**; jojo
  `3d/cast/renders/game/johansson-in-game.jpg`, `-in-game-face.jpg`. The first run showed a dark, streaked band on the
  front of his neck above his T-shirt: repainted (warm texels only, the T-shirt stays), checked in the next run.
- `tools/pixar-sheet.mjs Johansson`: 29 face states and the body in eight views and moves, looked at cell by cell; jojo
  `3d/cast/renders/game/johansson-face-sheet.jpg`, `-body-sheet.jpg`, `-mouth.jpg`, `-before-brief.jpg`,
  `-after-brief.jpg`. Found and fixed on the way: a ragged ink line at the old grin whenever the jaw moved (jaw weights),
  scratchy ink under the nose (firm edges only on skin), the crown's grey strokes, painted shading blotches (flattened).
- Thuận with the brief: her lit skin as before (forehead 246/187/147 before, 249/194/157 after), her shadows warmer
  (chin 221/163/129 before, 230/162/122 after); jojo `3d/cast/renders/game/thuan-skin-after.jpg`. A first pass turned
  her orange (a wide terminator and warm ambient on her lit side); narrowed before this was kept.
- Not checked: a physical phone, a GPU browser, the Linux edition, every room and story he appears in.

## Not done / limits

- **Outline colour** (brief 5: warm umber #2b211c): World's ink is one colour for the town; a character's own needs the
  ink pass to read a colour per pixel, not only the skin mark.
- **Idle pose** (brief 5: head tilt, bent elbows and knees): World's animator poses every resident; blinks (1.8–5.6 s)
  and glances were already there. Not changed.
- **Smile lines** stop short of the nose's wings (the mouth's decal stops short of the nose).
- **His shadow-side legs** read grey: leg hair painted in the concept.
- **40% of the painted shading** is left in his face texture by choice; a texture painted for his shape would end it.
- **No blendshapes**, as hers: the face's silhouette moves by the jaw, nose and cheek bones only.

## Files

`src/avatars/pixar.js` (Johansson in `PIXAR_BODIES`, the skin hook, the mouth's lines), `src/avatars/pixar-skin.js`
(new), `src/avatars/face-acting.js` (new), `src/avatars/face-features.js`, `src/avatars/eyes3d.js`,
`src/render/ink-pipeline.js`, `assets/avatars/pixar/johansson.glb|json` (new), `tests/pixar-johansson.test.mjs` (new),
`tests/pixar-skin.test.mjs` (new), `tests/wave-gesture.test.mjs` (new), `src/avatars/animate.js` (the wave),
`tests/pixar-thuan.test.mjs`, `tests/ci-guard.txt`, `tools/pixar-sheet.mjs` (`--cells`, `--size`, `--tag`, `--frame`,
`--motion`, `--body`; a second wave frame), `runtime/` (rebuilt).
