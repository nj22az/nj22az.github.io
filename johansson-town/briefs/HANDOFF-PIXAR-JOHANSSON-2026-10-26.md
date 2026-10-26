# Handover: Pixar Johansson in Johansson World, and the Pixar rendering brief (26 October 2026)

The owner, 26 October 2026, in order: "Fix Johansson's blockers and bring him into the game, Thuans expressions need some
work too, she needs more personality when she is shocked and the different expressions, now she comes off as Generic";
"You need to audit and rig his whole face"; "The nose looks broken like a piece of meat cutting through it"; "Remove the
goatee"; "Remove moustache give him a mouth back"; a pasted brief, "Upgrade Character Rendering, Shaders, and Facial
Geometry to a Pixar/Disney Stylized Standard" (skin, eyes, brows and facial hair, mouth, neck and idle); and "Bring the
mouth further down so it's more visible"; "Have his head complete bald it's better"; "He shouldn't do the Hitler
salute"; "Still something not right in his neck ?"; "Make a nude rig with underwear for Johansson then rig the Hawaii
shirt"; "Eyebrows need rigging , he should be able to do "evil " angry eyebrows"; and two pieces of guidance, a painted
turnaround of him dressed and in his underwear, and a pasted Pixar critique with a rendered reference (blend the neck into
sloping shoulders, relax the shoulders and fingers, an A-pose, cloth thickness, warm skin).

## State

- **Branch `claude/vibrant-brown-0udpq3`** of this repo and of the studio repo (`nj22az/jojo`). **Not on `main`.** Pixar
  Johansson is in `PIXAR_BODIES`, so on this branch every World and Studio page draws him (`?pixar=0` the cartoon;
  `?pixar=thuan` her alone). He is the player: publishing him waits for the owner's word (AGENTS.md, "Except Thuan").
- **On `main` once merged, the rendering brief also changes Pixar Thuận** (live today): warmer shadows on her skin, a rim,
  the eye and brow shading, the mouth colours. Her lit skin is as before (measured, below).

## What it is

- **His model** (`assets/avatars/pixar/johansson.glb`, 2.0 MB, 26,657 triangles of which 23,415 are drawn while he is
  dressed; card `johansson.json`): from the
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

- **His clothes, apart** (studio `3d/cast/clothes_apart.py`, `3d/cast/CLOTHES.md`): his film model was one surface, the
  shirt grown on him. Now the GLB holds `body` (head, neck, arms, legs, hands), `torso` (the trunk under the clothes),
  `shirt` and `shorts` (their own texture, double-sided, a 5 mm lip at every opening), all on World's bones by the film
  rig's weights. Dressed (the default) World draws the clothes and leaves out the torso, so nothing of him shows through;
  `?pixarClothes=0` (or `api.dress(false)`, `tools/pixar-sheet.mjs --undressed`) shows the body under them: a soft body
  with a belly, sloping shoulders, slimmer arms, his neck's own skin tone, subtle nipples and navel, loose charcoal boxer
  shorts to mid-thigh (the owner's turnaround). This also ended the neck's streaks, smudge and saw-toothed collar edge:
  the collar is the shirt's own edge now, over clean skin. World's measures stay his dressed shape. Looked at close
  (`tools/pixar-sheet.mjs Johansson OUT --undressed --cells neutral --frame chest|hips [--turn 3.14]`), the first
  version had a patchwork on the arms, a ring at the elbow, a toothed waistband and a hole between the legs; all fixed in
  the studio exporter (jojo `3d/cast/CLOTHES.md`), and his arms and legs are now one even skin, dressed too (the grey
  shadow-side legs are gone). `tests/pixar-johansson.test.mjs` fails on any face of his body turned inside out, and on
  a shading seam where the body meets the trunk under his clothes (the review found one, up to 129 degrees: fixed).
- **Evil brows** (`face-features.js` brows, `face-acting.js`): each brow has three more controls, `outer` (the outer end up
  on its own), `straight` (the turn a straight line: a V) and `bunch` (the inner end thicker), and his brows taper to a
  tail (`browTaper`). His brows slope down to the outside at rest, so angry, fuming, raging, seething and the evil grin
  (`scheme`) bring the inner ends a long way down to the lids and the outer ends up; the brow decal is wider to hold it,
  and so are his brows' limits (`face-acting.js` `browRange`); Thuận keeps hers (`pixar.js` `BROW_RANGE`), which her
  decal holds (shared, the wider limits let her springs' overshoot cut her brows' inner ends flat: found in review).

## Checks (26 October 2026)

- Full guard `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`: **456/456 pass**, 88 files (321 s), on the final source
  with the rebuilt runtime (`runtime/boot-BOgKw6Vp.js`). New in it: `pixar-johansson` (7), `pixar-skin` (4),
  `wave-gesture` (1).
- `node tools/pixar-shots.mjs --name Johansson` on the built runtime (again with his clothes: 6 meshes, dressed): island
  ready, playing, Johansson found on Main Street drawn as his Pixar body, front, three-quarter and five face frames,
  **no page errors**; jojo
  `3d/cast/renders/game/johansson-in-game.jpg`, `-in-game-face.jpg`. The first run showed a dark, streaked band on the
  front of his neck above his T-shirt: repainted (warm texels only, the T-shirt stays), checked in the next run.
- `tools/pixar-sheet.mjs Johansson`: 29 face states and the body in eight views and moves, looked at cell by cell; jojo
  `3d/cast/renders/game/johansson-face-sheet.jpg`, `-body-sheet.jpg`, `-mouth.jpg`, `-before-brief.jpg`,
  `-after-brief.jpg`. Found and fixed on the way: a ragged ink line at the old grin whenever the jaw moved (jaw weights),
  scratchy ink under the nose (firm edges only on skin), the crown's grey strokes, painted shading blotches (flattened).
- His clothes and the body under them: the body in six views and moves, dressed and undressed, and close views of the
  undressed chest, back and hips, looked at cell by cell; jojo `3d/cast/renders/game/johansson-dressed-and-nude.jpg`,
  `johansson-undressed-close.jpg`, `johansson-undressed-before-after.jpg`. His evil brows (angry, raging, seething,
  scheme, grumpy beside neutral, smile and shock) with the wider brow decal, no clipping: `johansson-evil-brows.jpg`.
  The backs of his arms in shadow show the light's bands on 2 cm triangles (the texture there is even); more triangles
  would cost the phone budget.
- Thuận with the brief: her lit skin as before (forehead 246/187/147 before, 249/194/157 after), her shadows warmer
  (chin 221/163/129 before, 230/162/122 after); jojo `3d/cast/renders/game/thuan-skin-after.jpg`. A first pass turned
  her orange (a wide terminator and warm ambient on her lit side); narrowed before this was kept.
- Not checked: a physical phone, a GPU browser, the Linux edition, every room and story he appears in.

## Not done / limits

- **A-pose** (the critique): World binds every body in its rest, arms straight down, and every move turns its bones from
  there. Binding him in an A-pose means World binding a body apart from its rest (three.js skins allow it); it would ease
  the shoulders in raised-arm moves. Not done. The fingers stay flat: curled, they go into his thighs, his palms resting
  against them in that rest.
- **Face volume, ears' cartilage, 3D brows, stubble** (the critique): sculpting; not done. Stubble was left out (the
  owner had the goatee and moustache removed).

- **Outline colour** (brief 5: warm umber #2b211c): World's ink is one colour for the town; a character's own needs the
  ink pass to read a colour per pixel, not only the skin mark.
- **Idle pose** (brief 5: head tilt, bent elbows and knees): World's animator poses every resident; blinks (1.8–5.6 s)
  and glances were already there. Not changed.
- **Smile lines** stop short of the nose's wings (the mouth's decal stops short of the nose).
- **40% of the painted shading** is left in his face texture by choice; a texture painted for his shape would end it.
- **No blendshapes**, as hers: the face's silhouette moves by the jaw, nose and cheek bones only.

## Files

`src/avatars/pixar.js` (Johansson in `PIXAR_BODIES`, the skin hook, the mouth's lines), `src/avatars/pixar-skin.js`
(new), `src/avatars/face-acting.js` (new), `src/avatars/face-features.js`, `src/avatars/eyes3d.js`,
`src/render/ink-pipeline.js`, `assets/avatars/pixar/johansson.glb|json` (new), `tests/pixar-johansson.test.mjs` (new),
`tests/pixar-skin.test.mjs` (new), `tests/wave-gesture.test.mjs` (new), `src/avatars/animate.js` (the wave),
`src/avatars/pixar.js` (`CLOTHES_PARTS`, `pixarDressed`, `api.dress`; brows' taper),
`tests/pixar-thuan.test.mjs`, `tests/ci-guard.txt`, `tools/pixar-sheet.mjs` (`--cells`, `--size`, `--tag`, `--frame`
face|mouth|eyes|nose|hand|chest|hips, `--turn`, `--motion`, `--body`, `--undressed`; a second wave frame), `runtime/`
(rebuilt).
