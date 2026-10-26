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

## Evening, 26 October 2026: the nude body audited, a plan to rebuild it, and the neck, shoulders and legs fixed

The owner, in order: "Johansson with clothes looks pretty ok but nude is abhorrent we need to be able to dress him be
Hayao Miyazaki pls audit and make a plan to correct the Johansson model in blender"; "The neck and shoulders look off
fix it pls"; "Look at the legs they are not ok he is supposed to be nude under the underwear now it looks like he is
deformed".

- **The audit and the plan**: jojo `3d/cast/AUDIT-JOHANSSON-BODY.md`. Thirteen findings, measured on the GLB and seen in
  Blender clay, as triangles, in the atlas and in World's close frames (jojo `renders/game/johansson-nude-audit-*.jpg`):
  undressed he was a shrunk shirt (epaulette shoulders, a groove from the armpit to the waist, a neck in a flat top, a
  slab-and-sack trunk, a forearm thicker than the upper arm, knee lumps, boxers as a box, random 5–178 mm triangles
  with 1,598 creases over 30°, an atlas of hundreds of islands each its own tone, 38 mm of asymmetry). The plan: a base
  body built in Blender from code in Miyazaki's manner (five or six clean volumes, one S-curve from the ear down the arm,
  no anatomy that is not a story, flat colour), his head and hands grafted on, one flat skin, World's bones bound in an
  A-pose, the shirt and shorts (kept) and every later outfit as layers over it; five stages, four checkpoints, and five
  decisions for the owner (nipples; bare feet with the sandals as a garment; the hands; nothing of the nude published;
  publishing him and stubble, still open). It absorbs the handover's "next work" (the A-pose binding, the fingers, the
  arms' density): those come with the new body, not before it.
- **Fixed now, in the current export** (jojo `clothes_apart.py`; `AUDIT-JOHANSSON-BODY.md` section 4): a shoulder
  girdle (the trapezius), a round deltoid on each joint, the trunk's section a dome above the shoulders, the neck
  flaring into the girdle below the neckline (the collar hugs it at the neckline: 2 mm, measured), all fitted under the
  shirt (8 mm near the neck where he is drawn dressed, 2 mm under the yoke and sleeve which hide it); the thigh a lean
  taper inside the hips (its capsule had stood 2 cm outside them: the boxers bulged, the thigh below was a stick), a
  soft knee into a two-capsule shin, the shin refitted and repainted, the boxers 7 mm off and eased onto the skin over
  25 mm, the thighs joined solidly under the boxers down to the leg openings. A bug found on the way: the forearm's ease
  back to the sculpt ran on down the arm's line past the hand and reset the outer thigh and shin vertices (fins); bounded.
  Dressed he is unchanged (the dressed chest and hips frames before and after).
- **His model**: `assets/avatars/pixar/johansson.glb` version `10de7fcf72` (`PIXAR_BODIES.Johansson.version`), ~2.0 MB,
  the same parts and budgets; the card as before.

### Checks (evening)

- `node --test tests/pixar-johansson.test.mjs tests/pixar-thuan.test.mjs`: 13/13 on the final GLB.
- Full guard `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs` on the rebuilt runtime: **456/456 pass**, 88 files, 287 s.
- `tools/pixar-sheet.mjs Johansson --undressed` (body in six views and moves; `--frame chest|hips`, front and back,
  `--size 700`) and dressed (body; `--frame chest`, `--frame hips`), each cell looked at: jojo
  `renders/game/johansson-nude-fixed.jpg`, `johansson-nude-fix-before-after.jpg`. Found and fixed on the way: fins down
  the shins (the forearm-ease bug), a see-through web and notch at the crotch (the thighs' join).
- `tools/pixar-shots.mjs --name Johansson` on the built runtime: island ready, playing, Johansson found on Main Street drawn dressed, 11 steps, **no page errors** (jojo `renders/game/johansson-in-game-evening.jpg`).
- Blender clay tries between exports (`scratchpad/work/jg/t1..t5`), and the export's own `nude.png`.
- Not checked: a physical phone, a GPU browser, the Linux edition.

## Night, 26 October 2026: the pasted spec, and "how did we stray so far?"

The owner pasted a structured spec ("Refactor Character Proportions, Joint Topology, and Clothing Offset": the spine's
S, a chest and waist taper, a cone forearm and larger curled hands, a placed calf and narrowed ankle, toe-out, the shirt
pushed out with thick flared hems, warm wrap lighting and a sharper sheen on the nose and ears, AO). Then, with the
morning's wave sheet of him dressed: "It's slowly getting better but his legs look deformed and his arms and hands
too"; "Here it's almost good what happened how did we stray so far?"

- **What stayed** (GLB `2bf5d5e3ba`, `PIXAR_BODIES.Johansson.version`): the spine's S in profile and the waist drawn
  in, under the shirt; the sleeve openings made clean rings, every opening flared and 8 mm thick; the feet turned out
  9° at rest (baked in the pose stage); in World, the terminator's red-orange (#e06a4b) and a sharper, stronger sheen on
  what stands out of the head beyond its radius (the nose, the ears), from the card's neck height and head radius, for
  every Pixar body (`src/avatars/pixar-skin.js` `head`, passed in `pixar.js`; Thuận checked: her skin as before,
  warmer at the terminator; `tests/pixar-skin.test.mjs` has a new test). One skin from the trunk to the fingertips:
  the hands take the trunk's tone at the export (the sculpt's pink wrists are gone).
- **Tried and rolled back on the owner's word**: the forearm as a cone to the wrist, the hands scaled, the shin refitted
  with a placed calf and a narrowed ankle, the thigh refitted through the knee. **The sculpt's own forearms, hands,
  knees, shins and ankles are kept wherever they show** (jojo `clothes_apart.py` `SCULPT_LIMBS`); the body is built
  only where it was covered. How we strayed, for the record: every fix since the clothes came off reached further out
  of the covered region, replacing sculpted anatomy with capsule unions, which World's toon ramp shows as tubes with
  bands; the spec's numbers pushed the same way. jojo `3d/cast/AUDIT-JOHANSSON-BODY.md` section 5 has the item-by-item
  outcome and the reasons for what was set aside (the shoulder pivot is World's skeleton; the finger curl waits for the
  A-pose binding; the stance width is World's; the chest cannot widen with the arms hanging beside it; the shirt is not
  pushed out because, measured, the arm is inside the sleeve at rest; a baked AO would darken the nude under phantom
  hems).
- **Bugs found and fixed on the way** (they bit three exports): the painting rules keyed on "covered" regions misread
  a refitted forearm (black wrist bands, mottled arms, teeth on the boxers' edge); the arm's vertices now carry an
  attribute set from where they lie after the fit, and the boxers and their edges keep off them; the forearm's refit
  once took the boxers' side with it (refitted faces only); the armpit's own skin faces, never covered, kept the
  concept's painted shadow (evened with the arm by position).

### Checks (night)

- `node --test tests/pixar-johansson.test.mjs tests/pixar-thuan.test.mjs tests/pixar-skin.test.mjs`: 18/18 on the
  final GLB.
- Full guard on the rebuilt runtime: **457/457 pass**, 88 files, 278 s (the skin test adds one).
- `tools/pixar-sheet.mjs Johansson` undressed and dressed (the body in six views and moves; `--frame chest|hips|hand`),
  each cell looked at; Thuận's and his face frames with the new terminator. jojo `renders/game/johansson-night-after.jpg`:
  the owner's reference, then dressed and undressed at the night's end.
- `tools/pixar-shots.mjs --name Johansson` on the built runtime: island ready, playing, Johansson on Main Street drawn dressed, no page errors (jojo `renders/game/johansson-in-game-night.jpg`).
- Not checked: a physical phone, a GPU browser, the Linux edition.

## For the next session (written 26 October 2026, end of the session)

**Where it stands.** Everything above is committed and pushed on `claude/vibrant-brown-0udpq3` in both repos (the
morning's work: this one `8a73aafe`, jojo `978dd15`; the evening's audit, plan and fix: this one `a52b6880`, jojo
`e3d2bbf`); both working trees clean. The guard is green (456/456) on the rebuilt runtime, the booted
game draws him dressed with no page errors, and a separate review's two real findings (the seam's normals, Thuận's brow
limits) are fixed and tested. Nothing of his is on `main`.

**Waiting on the owner.**
1. **Publish?** Pixar Johansson is the player, so he replaces the cartoon for everyone the moment this branch merges
   (AGENTS.md, "Except Thuan"). The wave fix (`src/avatars/animate.js`) is on the same branch and Thuận, who is live,
   uses the wave. If the owner wants the wave alone on `main`, cherry-pick `animate.js` and `tests/wave-gesture.test.mjs`
   (plus `ci-guard.txt`'s line) into a branch off `main`, run the guard, publish, and verify the live files as the
   Thuận handover did. If the owner wants him published, merge the branch into `main` (the runtime is already rebuilt),
   watch GitHub's guard run and Pages deploy, and compare the live `assets/avatars/pixar/johansson.glb` hash with
   `PIXAR_BODIES.Johansson.version`.
2. **Stubble** (the critique asked for painted stubble; the owner had the goatee and moustache removed): only on their
   word. Where it would go: jojo `game_johansson.py` `paint_face`, a texel field over the jaw and upper lip below the
   mouth decal, grey-brown, at low alpha, before `SKIN_FLATTEN`.

**Next work, in order of value (evening update: the plan in jojo `3d/cast/AUDIT-JOHANSSON-BODY.md` comes first; the
items below are absorbed into it and are kept for their detail).**
- **The body rebuilt** (the plan): the owner's five decisions, then stage 0 (a clay body for their yes), stages 1–5.
  **The night's lesson goes into it**: the spec's numbers (a tapered forearm, chunky hands, a placed calf, a narrow ankle,
  a relaxed curl) belong in the base body, built once with clean topology, never as refits of the sculpt's skin.
- **A-pose binding** (the critique; the biggest visible gain for the wave and every raised arm). World binds Pixar bodies
  in their rest (`src/avatars/pixar.js` `dressPixar`: the skeleton's rest from the card's `rest`, `bindMatrix` from
  the bones as placed). The plan: the studio exports the body posed with the upper arms out ~35° (jojo `game_johansson.py`
  `G.world_rest` / `G.bake_pose`: pose the shoulders before baking) and writes that bind pose into the card (`bind`
  per bone, beside `rest`); World builds the skeleton in the card's `rest` but computes each bone's inverse bind matrix
  from `bind` (three.js `Skeleton` takes `boneInverses`), so animation still turns from arms-down rest while the skin
  was bound with room under the arms. Test: `tests/pixar-johansson.test.mjs` checks the card's `bind` exists and that a
  shoulder-raised pose (`Wave` at 0.9 s) keeps the armpit's vertices further apart than the arms-down bind did.
  `tools/pixar-sheet.mjs Johansson OUT --body wave,"wave later" --size 900` to look. Thuận keeps her binding until hers
  is re-exported the same way.
- **Fingers**: once the A-pose binding is in, the hands clear the thighs and jojo's `relaxed` curl can be baked
  (`game_johansson.py`, the comment at `G.bake_pose`).
- **The backs of his arms** show lighting bands on ~2 cm triangles when undressed and in shadow. Options: give the
  decimation a denser budget on the arms (jojo `game_johansson.py` `G.decimate(body, BODY_TRIS, face)`: pass an
  arms mask like `face`), inside the test's 26,000 dressed / 32,000 total triangle limits.
- **Face volume, ears' cartilage, chunky 3D brows, cloth creases, hand-painted textures**: sculpting and painting in
  the studio's Pixar track (jojo `3d/cast/PLAN-PIXAR.md`), not a World change.

**How to resume the studio export** (jojo `3d/cast/GAME.md` "Pixar Johansson: step by step"). The inputs live in a
session scratchpad, so a new session makes them again (about 15 minutes in all):
```bash
cd jojo/3d/cast
python3 concept_paint.py back models/johansson-concept.png /tmp/back.png johansson_ai
python3 concept_paint.py paint models/johansson-hunyuan.glb models/johansson-concept.png /tmp/back.png /tmp/joh/johansson.glb johansson_ai
CAST_CACHE=/tmp/cast-cache python3.11 -u game_johansson.py /tmp/joh/johansson.glb /tmp/jg          # ~10 min, saves johansson-face.blend
CAST_CACHE=/tmp/cast-cache python3.11 -u game_johansson.py /tmp/joh/johansson.glb /tmp/jg --from-face   # ~4 min, the clothes alone
cp /tmp/jg/johansson.glb /tmp/jg/johansson.json ../../../nj22az.github.io/johansson-town/assets/avatars/pixar/
sha256sum ../../../nj22az.github.io/johansson-town/assets/avatars/pixar/johansson.glb | cut -c1-10   # into PIXAR_BODIES.Johansson.version
```
Then in World: `node --test tests/pixar-johansson.test.mjs tests/pixar-thuan.test.mjs`, the sheets
(`tools/pixar-sheet.mjs`, `TOWN_CHROMIUM_PATH=/opt/pw-browsers/chromium` in the cloud), `npm run build:runtime`, the
full guard, `tools/pixar-shots.mjs --name Johansson`. Look at every sheet cell by cell before calling anything done;
the full-body sheet is too small to show the faults the `--frame chest|hips` views show.

**Rules that bit this session** (keep): pad the atlas before lifting colours; set custom normals after a mesh is cut,
never before; a face is "folded" only against its own corners' normals; brow limits are per body; World's weights for a
garment, never nearest-vertex copies; never curl the fingers in the arms-down rest; check the undressed body up close.
