# Handover: Meshy Johansson and Meshy Thao in Johansson World (27 October 2026)

The owner, 27 October 2026, in order: a Meshy model of Johansson ("maybe it can help with Johansson"); "Use the Meshy
model and rig it"; "We are stuck on polishing a turd, so use Meshy Johansson and Meshy Thao, bring them to the world";
"Don't delete the old simple characters, I want them for other things like merch and prints and my website"; "Can you
remove goatee and moustache?"; "Remember to write handovers when you complete something".

## State

- **Branch `claude/vibrant-brown-0udpq3`** of this repo and of the studio repo (`nj22az/jojo`). **Not on `main`:**
  publishing waits for the owner's word. On the branch every World and Studio page draws Pixar Johansson (the player)
  and Pixar Thao from the Meshy models; `?pixar=0` shows the cartoon. **The cartoon characters are untouched** (the
  recipes in `src/avatars/cast.js`, the cartoon build): they stay for merch, prints and the website.
- **Models:** `assets/avatars/pixar/johansson.glb` (1.83 MB, version `7fa87c4213`) and `thao.glb` (1.70 MB, version
  `14fcbc8287`), cards beside them; 20,000 body triangles each plus the eyes, brows and mouth decals, one 2048 texture.
  Made by the studio repo's `3d/cast/game_meshy.py` (its `GAME.md`, "The Meshy bodies"): the sculpt's own hands kept,
  World's rest with the hand straight on from the forearm, bound with the arms out 35 degrees (the card's `bind`),
  the painted eyes, brows and mouth painted out and World's rigged ones laid over them, his moustache and goatee
  painted over and smoothed away.
- **World:** `PIXAR_BODIES.Thao` added (`src/avatars/pixar.js`); the Pixar body's own lips for a drink or a morsel
  (`pixar.js` `mouthPoint`/`lipsLocal`, read by `table-drink.js` and `consume.js`); the audit harness serves and sips
  a draught at his izakaya seat (`__JOHANSSON_AUDIT__.serve/sip/drinking`, game.js); the shot tool
  (`tools/pixar-shots.mjs`) shoots gestures at the open spot, the seated views over the counter, a sip series, with
  `--part street|izakaya|sip` and Thao found at the izakaya. Tests: `tests/pixar-meshy.test.mjs` (both bodies, 6/6),
  `pixar-johansson.test.mjs` slimmed to his acting.
- **Evidence** (studio repo `3d/cast/renders/game/`): `johansson-meshy-body.jpg` (front, three-quarter, side, back,
  walking, wave, think, sit drink), `johansson-meshy-face.jpg`, `thao-meshy-body.jpg`, `thao-meshy-face.jpg`,
  `thao-meshy-in-game.jpg` and `-face.jpg` (the izakaya's door, 17:30), the painted-out faces.

## Afternoon, 27 October 2026: the sit-drink pose, his face, Thao's eyes

The owner, in order: a diagnostics note on the sheet's "sit drink" cell (the right elbow up beside the head, the hand
dangling at the collarbone, no grip; the hips "not lowered", the thighs "crushed", the feet floating; the left arm
hanging); "His face needs to be cleaner too"; "He looks like a burn victim now make his head gorgeous so he fits in and
Thao's eyes were all over the place"; "Shouldn't the elbow be down when he is drinking"; "he looks good now but the arm
gets stuck in his head".

**World (`src/avatars/animate.js`, `consume.js`):**
- The drinking arm on a Pixar body (`drinkArm`, and the sip's own IK in `poseAvatarConsumption`): the elbow hangs below
  the shoulder and a little forward (the reach's pole `[-.45,-1,.25]`), the forearm folds up and turns across to the
  mouth. The cartoon keeps its raised arm (short arms, big head). A toast raises the glass before the face with the
  elbow bent, not a straight arm overhead.
- What meets the lips on a Pixar body is the rim's near edge (`rimNear`, the glass's radius), not the rim's centre: its
  lips are its own skin, and with the centre there the glass stood through his cheek and chin.
- The draught at the counter is the table-drink performance (`table-drink.js`), not the gesture: its arm takes the same
  elbow-down pole on a Pixar body. In the booted game the sip's rim error is 0 (`johansson-meshy-game-report.json`).
- Seated in shorts or trousers, a Pixar body's hands rest on its thighs (the cartoon's rest on the lap only over a
  skirt's cloth). The owner: "Sitting is awkward like he is stretched": a Pixar body now sits as a person does on a
  stool (`CHAIR_SIT.pixar`): the thighs sloping a little down to the knees (-1.36 rad), the knees a hand apart, the
  shins hanging, and a soft back (spine and chest curved forward a touch, the chin level). The cartoon's square toy sit
  (`CHAIR_SIT.cartoon`) is unchanged.
- **The hips and thighs are right for this body.** Measured on the Meshy mesh (`scratchpad legs.py`): his crotch is at
  0.59 m of 1.80 (a third of his height; a person's is near half), the knee at 0.46, so his thigh bone is 0.19 m and his
  shin 0.34. Seated on the izakaya's 0.46 m stool the animator lowers him 9 cm (the seat under his own bottom,
  `seat-support.js`) and his feet hang 10 cm off the floor, on the stool's rail in the game. The sheet draws no stool,
  so he looks as if he floats; nothing to fix in the rig short of resculpting his legs (not done: the owner's model).
- **The hand at the glass** (the owner, a frame from their own game: the jug at his mouth, his hand by his ear, "Do you
  look at the photos yourself? Because this is wrong"): the table-drink's grip placed the palm by the cartoon mitten's
  clearance (a palm 0.9 hand radii wide plus a thumb sphere), 16 cm from the glass's axis for his hand measure. A body
  with `measure.realHand` (the Pixar bodies, `pixar.js`) takes a real hand's grip (`consume.js drinkGrip`: the fingers
  through a handle with a finger's clearance, or the palm on a glass's body) and holds a mug with the fingers hanging
  down through the handle and the palm toward the glass (`table-drink.js wrist`). The side and close lenses had hidden
  the distance; the front lens shows it: judge the front frame first.
- **The draught is a big jug now** (大ジョッキ: 9.6 cm across, 18 cm tall, a handle for four fingers;
  `izakaya-serving-visuals.js`): the owner, "he needs to be able to grab the beer jug, if the jug is too small make it
  bigger". The sculpted fingers wrap it; they do not close (no finger bones): `3. Open` below.
- **A proper seat** (the owner: "he needs a proper butt and not be stretched like this"): the studio's
  `game_meshy.py clip_leg_weights`. Bone heat had given the thigh bones a quarter of the trunk up to the waist and more
  than half of the seat of the shorts (measured: 0.25 at z 0.74 to 0.86, 0.56 to 0.65 at the back of the pelvis), so the
  sit dragged the shirt and waist down and flattened the pelvis. Above the hip joint a thigh's weight now falls to
  nothing within 7 cm at the front and 3.5 cm at the back; the glutes are the pelvis's. Both bodies re-exported
  (`johansson.glb` `dae59dce26`, `thao.glb` `8929092308`).
- The owner's link (gist Fedik/082902e91b5407b5b97f) is a 2015 CSS and jQuery beer-pour animation in a web page, foam
  rising in a div: nothing for the 3D rig; the izakaya pours its own stream. Not used.
- A gripping hand is still open (World's skeleton has no finger bones): `3. Open` below.

**Studio (`3d/cast/game_thuan.py paint_out_face`, `game_meshy.py`, the landmarks):**
- `clean=True` (the Meshy bodies): the holes fill from the skin's own tone round them (a wide normalised blur, wider
  where little skin is near), feathered, and the whole front of the face is smoothed of blotches and stubble
  (`clean_skin`). The old fill was one flat lighter pink in jagged patches, and a tanned skin's shaded side passed the
  brow-remnant test by luminance alone, so his forehead and cheeks were patched all over: now a remnant must be dark
  *and* grey (`sat < .24`), and the found brow's own box goes too.
- `tone=L['skin_tone']`: his skin brought from the texture's red-orange (0.90, 0.58, 0.49) to (0.93, 0.66, 0.53), toward
  the cartoon Johansson's #dc9d7a, by hue so the khaki shorts stay khaki (`tone_skin`). Shave zones: the goatee's zone
  widened over the jaw, the tuft painted at his hairline added.
- Thao: her brows lie 2 to 6 cm above her eyes (`face_zones.brow_above`), lower than Thuận's, so they were missed and
  the painted brows stayed under the rigged ones; her left brow hides under her bob from its middle out, so a brow
  with less than two thirds of the other's span takes the other's shape. Her iris measured as wide as the eye
  (`IRIS_MOST = .72` of the half width now): with white either side, her look about stays inside the eye.
- Exports of the afternoon: `johansson.glb` `dae59dce26`, `thao.glb` `8929092308` (the last, with the leg weights
  clipped); runtime rebuilt.

**Evidence** (studio repo `3d/cast/renders/game/`): `johansson-meshy-body.jpg` (turned round, walking, wave, think,
drink, sit drink, sit toast, sit), `johansson-meshy-face.jpg`, `johansson-meshy-face-painted-out.jpg`,
`thao-meshy-face.jpg` (at rest, looking, three-quarter, side, the feelings), `thao-meshy-face-painted-out.jpg`,
`johansson-meshy-game-izakaya-sip-*.jpg` (the draught at the counter in the booted game: the elbow down, the jug at
his lips in his hand, the feet on the stool's rail), `johansson-meshy-body-seated.jpg` (the seat of the shorts kept). World tests:
`player-seating`, `avatar-dining-combat`, `pixar-meshy`, `pixar-johansson`, `avatar-polish`, `afterbath-outfit` pass.

## Open

1. **Faces, the last details:** a few dark specks remain beside Thao's eyes and on her nose (lash-fin and nostril
   remnants under the dilation); his hair at the temples is the texture's painted streaks (the side view). His iris
   decal's seam at its edge. (The brows' remnants and his blotched skin: done this afternoon, above.)
2. **His in-game checks, done once** (`node tools/pixar-shots.mjs --scenes --name Johansson <out>`, 81 steps; the
   studio repo's `renders/game/johansson-meshy-game-*.jpg`): idle, walk, gestures and the counter are clean, and the
   draught served at his seat is drunk by the game's own performance with the rim at his lips (`report.json`
   `sip.moments`: `valid` at the sip). The hand stays open around the mug: a holding hand shape is the next step
   (World's skeleton has no finger bones; a closed-hand shape key on the Meshy hand, driven by `heldProp`, is the
   likely route). The stools fit him (feet on the rail, knees at the counter); then the izakaya redrawn in CAD.
3. Thuận is still on her Tripo model; the same route takes a Meshy Thuận when the owner gives one.
4. The earlier Pixar Johansson route (the free sculpt, separate shirt and shorts) is kept in the studio repo out of the
   game; its last fixes of the morning (the wrist graft, the hand straight at rest, a wrist weight ramp) live in the
   shared code and serve the Meshy route.
