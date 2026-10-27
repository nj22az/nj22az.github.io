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

## Evening, 27 October 2026: a butt, no stretch, a hand that grips, cartoon drinking; published to the game

The owner: "What's your plan? Make a plan, then work according to the plan to make the beer drinking look like it's
from a cartoon and give him a butt and not stretch"; then "Push him to the game and I'll fault find while playing but
drinking is not right his hand disappears for some reason"; "Thuan needs to be able to interact with the items in
Sakura too, pick up a can etc, hands is something you need to put some effort in"; four hand links.

**Done, in the plan's order:**
1. **A butt** (studio `game_meshy.py sculpt_seat`): the back of the pelvis pushed out in two lobes over the hip joints,
   5 cm at the fullest, blending into the thighs and the back; UVs untouched. Both Meshy bodies (she has hips under her
   dress). `renders/game/johansson-meshy-seat-sculpt.jpg` before and after.
2. **No stretch**: with the thigh weights kept to the legs (midday) the sit no longer drags the trunk; the seat of the
   shorts keeps its shape (`johansson-meshy-body-seated.jpg`, side view standing and seated).
3. **A hand that grips** (`game_meshy.py grip_keys` → morph targets `gripL`/`gripR` in the GLB, `export_morph=True`;
   World `pixar.js grip(side, v)`, named from the model's `targetNames`): the fingers past the knuckles curled toward the
   palm at three joints (70, 70, 60 degrees), fingertip first about the sculpted joint lines; the thumb as sculpted.
   World closes the hand on a held glass (`consume.js fitAvatarHeldProp`), through the counter performance from the
   reach to the release (`table-drink.js`), half on a morsel's sticks, and opens it when the prop goes
   (`actors.js hold`). `johansson-meshy-hand-grip.jpg`: open above, closed below. `tools/pixar-sheet.mjs --grip`
   renders the hands closed.
4. **Cartoon drinking** (`table-drink.js`, Pixar bodies only): the head goes back as the jug tips (0.24 rad at full
   tilt), three gulps bob it through the sip, the chest leans back, the elbow comes up and out as he drains it (the
   reach's pole swings with the tilt), and he comes down with a satisfied nod and a happy face. The liquid, the rim at
   the lips and the timing are the sober performance's; the sip still reads `valid` (rim error 0).
5. **Checked front first**: `johansson-meshy-game-izakaya-sip-*.jpg`. From the camera's usual side the hand is behind
   the jug at the grasp (the handle is on his right): that is the "hand disappears" of the owner's frame, most likely,
   not a missing hand; the open hand earlier also sat inside the glass. If it still vanishes in play, say which camera.
6. **Published to the game** (the owner: "Push him to the game and I'll fault find while playing"): the branch merged
   into `main` and pushed, see the commit log. The cartoon characters are untouched (`?pixar=0`).

**The hand links** (the owner, for Thuận's hands): `JackTisdell/hand` is a p5.js hand built from joint-angle components
(phalanx, metacarpal, carpal group: a good model for finger bones, no mesh); `tubakhxn/Advanced-Hand-Gesture-3D-Visualizer`
is a MediaPipe webcam demo (Python, no model); `jperedadnr/RiggedHand` is a Java and Leap Motion skinned-hand project
(Apache-2.0; its model files are not visible from the page); animations-maschine.com is an agency's service page, no
download. None gives a rigged hand mesh for World; the route stays our own: finger bones on World's skeleton from the
Meshy hands (the next step below).

## Night, 27 October 2026: finger bones; the owner's faults from play, fixed

The owner: "Can you build finger bones"; then, playing the published game: "the butt should come when he sits, this
looks too crappy, and his mouth needs to show in all shaders and even normal"; "His feet should point forward when he
is running too, now they point outwards"; "risograph really captures the hand drawn comic feel"; "I just want you to
fix my issues"; "You can't be happy with what the face looks like, align it properly and the hand too so he can drink
beer"; "Audit your screenshots ... as you are Akira Kurosawa or Miyazaki or Disney yourself".

- **Finger bones** (studio `game_meshy.py finger_joints`, `finger_weights`, `finger_rest`; World `pixar.js`): fifteen
  a hand on World's skeleton under the hand bone, thumb (root in the palm) and four fingers, three joints each. Found
  on the full mesh before it is lightened: past the knuckle line the Meshy hand is one block of four fingers (cut into
  four bands across its width, the index nearest the thumb) and the thumb apart; the joints at the knuckle, 40 and 70
  per cent of the way to the tip. The hand's weight past the knuckles goes onto them with a band at every joint. The
  card carries each bone's rest and bend axis (`fingers.L/R.bend`, World's frame, a positive turn curls toward the
  palm). World builds them as children of the hand (no turn at rest, so the card's axes apply as they are) and
  `grip(side, v, shape)` turns each joint (`GRIP_TURN`, the index least). The grip morph is gone; the first-person arm
  keeps the finger bones. Both bodies. `johansson-meshy-hand-grip.jpg` (open above, closed below), `thao-meshy-fingers.jpg`.
- **The hold** (`table-drink.js`): a real hand holds the jug as a person does: the wrist beside the handle, the palm
  toward the glass, the fingers through the handle's hole to curl round its bar, the thumb on top (`HOLD_Q`,
  `holdOffset`); the jug is turned in the hand as it is lifted so its handle is at his right (`heldQ`), and stays so
  when set down. The sip still validates (rim error 0, wrist error 0).
- **The seat only when he sits**: the sculpt is a shape key `seat` now (`sculpt_seat(..., key='seat')`, 4 cm), and
  World brings it in with `chairBlend` (`pixar.seat(v)`, animate.js); standing he is the sculpt as it came (the back
  view the owner sent, the lumpy shorts, is gone).
- **The mouth in every look**: the seam between the lips in a dark warm ink (`inkFor`) and twice as thick
  (`rigMouth({seam})`, `uSeam`), the lips a shade deeper than the skin; and **placed from the landmark**
  (`johansson_meshy.py mouth_at=1.545, mouth_half=0.033`; `plain_mouth`): the painted lips were a sliver under the
  moustache, found on the nose and fitted into curves that shot off past five units, so his mouth drew as a dot under
  his nose. World also guards a card's curves (`saneMouth`). `johansson-meshy-face.jpg`.
- **Feet forward**: the sculpt stands toes-out 12.3 degrees (Thao 4.4); `a_pose(rig, L)` turns each foot to point
  forward in the bind, so the walk and run swing straight feet.
- `tests/pixar-meshy.test.mjs` accepts and checks the finger bones (30, each rested, bend axes in the card).
- Risograph: the owner likes it; nothing changed there, the mouth now reads in it.

## Late night, 27 October 2026: the jug in his hand

The owner: "how about Johansson's hands???? he is not holding the beer, model a beer jug that fits in his hand and
obeys gravity pls"; "Screenshots"; a frame with the thumb standing up beside the jug: "What's this?"

- **Measured, not eyeballed** (`tools/pixar-shots.mjs --part sip`, `table-drink.js` diagnostics): per moment of the
  performance, each finger's nearest distance to the handle's bar, fingertips inside the glass, the jug's lean off
  upright, its base above its counter spot, the rim to the lips; the frames from his right (the handle side) and close.
  Before: the hand sat beside the jug by a guessed offset; the bar was nowhere near the fingers.
- **A jug that fits his hand** (`izakaya-serving-visuals.js` `JUG`): 大ジョッキ, 9.4 cm across, 19 cm tall on a thick base,
  a D-handle (a tube on a rounded D) whose opening is 11.4 cm tall and 3.5 cm deep for his four fingers (their knuckles
  span 5.9 cm centre to centre, a finger 2.2 cm thick) and whose bar is 15 mm thick to curl round. Its grip data says
  where the bar is (`handle`, `bar`, `height`, `opening`).
- **The hold is built from the fingers** (`pixar.js holdPoint`: forward kinematics of the finger bones at the grip, the
  hollow the curled fingers make; `table-drink.js wrist`): the wrist goes where that hollow meets the bar, the palm
  toward the glass, the knuckle line up the bar, the thumb on top (`HOLD_Q`, right-handed). Measured from the grasp to
  the set-down: every finger 11 to 16 mm off the bar (a finger's half thickness plus the bar's radius), no fingertip in
  the glass, the jug upright (lean 0) carried, tipped only at the sip (22 degrees) and swallow (30), level again set
  down, rim error 0 at the sip.
- **The thumb ("What's this?")**: the digit standing up beside the jug was his real thumb, never rigged. The studio's
  first finger cut (`game_meshy.py finger_joints`) took the hand past half its length as one block of four fingers and
  a separate thumb; on his Meshy hand the index stands apart there and the short thumb ends before it, so the index
  was rigged as the thumb (and swept across the palm), the three other fingers were cut into four bands, and the thumb
  stayed on the hand bone. Seen with the vertices coloured by bone (a scratch render) and fixed in the studio: the five
  tips are found as the points farthest along the mesh from the wrist, the thumb is the tip most to the front, every
  vertex goes to the digit whose tip it reaches most directly (fused fingers part along their creases), the lightened
  mesh takes each vertex's digit from the nearest labelled one, and the thumb's root sits in the ball of the thumb and
  curls across the palm to meet the fingers. Both casts re-exported (Johansson `5fef83b9f0`, Thao `be1dcce7d0`; Thao's
  index is her longest finger, and the split follows it). Now the thumb lies along the top of the fist over the index,
  the four fingers close through the handle (10 to 21 mm off its bar), none in the glass (`shots-sip19`).
- **Gravity**: the jug hangs vertical from the hand through the lift and the carry, tips with the sip, is set down on its
  spot (base 0 above rest); the beer's surface stays level (the liquid system). The NPCs' held glasses go through
  `consume.js fitAvatarHeldProp` unchanged.
- **Audited by independent judges** (three lenses: Kurosawa for weight and truth, Miyazaki for physics, Disney for
  appeal; every fault then challenged by two refuters; `tools` of the session, a workflow over the frames and the
  report). Round one (on the first frames) found: the thumb standing up beside the jug, things behind the beer drawn
  through it (chopsticks, the ink of the chin and collar: the liquid had no depth write), the free hand hanging in
  the air at counter height, the reach's open fingers passing through the bar, the set-down still shot before the jug
  landed, and the lenses named from the wrong side. Fixed: the thumb folds over (`GRIP_TURN.thumb`); beer is drawn
  opaque and writes depth (`drinking/vessel.js`, `liquidOpacity` 1 for the draught); the free hand rests on the counter
  beside the jug's spot, palm down, fingers forward (`table-drink.js counterHand`); the reach stops a finger's length
  behind the handle with the fingers open, the grasp slides the hand on and closes the fingers after
  (`reachHand`, the grip ramp); a `landed` moment (base 0 above its spot); the `right` lens is his right. Also the jug
  filled to 2 cm under the rim (a fresh 大ジョッキ), so it tips 13 degrees at the sip, and his eyes on the jug as he
  reaches and lifts, shut as he drinks. The judges' one wrong call, recorded so nobody chases it: "the beer never
  reaches his lips": seen from the front the beer stands lower at the near wall of a tilted jug while it touches the
  rim at the lips; it is level and it reaches the rim (rim error 0, `valid` at the sip). Resting hands on a Pixar body
  are a little curled, never splayed (`animate.js`, grip 0.28).

- **Audit of the new hold** (`shots-sip19`, three lenses and two refuters a fault): all three pass the seat, the fist
  round the handle (four fingers through the loop, the handle seen above and below), no finger in the glass, the jug
  upright carried and back on its spot, the rim at the lips, the face acting. The thumbs-up is gone. Confirmed, and
  fixed: the beer read as milky tea (a saturated gold now, `0xf0a400`, with a whiter head; a deep amber came out as cocoa). Their call that the beer tips with the
  glass is wrong again: at the swallow the beer's top is a horizontal line across a jug leaning 29 degrees (checked in
  the frame). Left open, all rated should or nit: the knuckles close to his jaw at the sip from the side lens, the
  swallow tipping further than the sip (the cycle's choice), the jug a few degrees off upright at approach and recover,
  his head staying fairly upright under a litre jug, a dark stripe down his jaw and neck (the texture).

## Later: Thuận and Thao drink beer the same way (the owner: "Can we use what we learned from Johansson?")

The owner, 27 October 2026: "Can you do so Thuan and Thao also can drink beer now?"; "Everyone should eventually be
Pixar style"; "Audit yourself"; "Thuan is better but the beer doesn't reach her mouth either".

- **One hold for every hand with fingers** (`consume.js` `fingerHold`, `HOLD_Q`, used by `poseAvatarConsumption` and
  `fitAvatarHeldProp`): a resident's jug sits with its bar in the curled fingers' hollow, the thumb on top, as
  Johansson's at the counter; any Pixar body with finger bones gets it, the cartoon keeps its mitten grip. The held
  jug's beer is the levelled liquid (`table-drink.js levelHeldDrink`), not a cylinder tipping with the glass; the
  resting hand comes up and forward when it holds a jug, so the base clears the thighs (it went into Thuận's lap).
- **Thuận has finger bones** (jojo `game_thuan.py` with `game_meshy.finger_joints(..., whole=True)` on each of her
  procedural hands): GLB `7c2477169d`; a stray unweighted vertex by her hand now takes its neighbour's weights instead of
  stopping the export.
- **The lips point and the rim** (`pixar.js lipsNow`, `consume.js poseAvatarConsumption`), found by looking at the
  frames, not the numbers (the owner: "Audit yourself"; "the beer doesn't reach her mouth"; "do you look at the
  screenshots? Look and correct"). The point was the mouth decal's unskinned box: for Thao 10 cm behind her face, so
  the rim went into her head; on the decal's centre it was a centimetre low; pushed to the face's front it stood 4 cm
  in the air before the mouth. Now it is the middle of the line between the lips (where the decal's jaw weight changes
  over), on the skin. And the rim point brought to the lips was the jug's far edge (the offset's sign: the body faces
  +z), so the near edge and the rim went under the chin toward the throat while the numbers said "2 mm". Now the near
  edge sits on the lower lip, the jug stands in front of the face tipped toward it, its far edge clear of the nose, and
  the beer reaches the rim at the lips (the empty glass is the far, high side). Checked in close frames from both
  sides with the lips and rim points marked (scratch probe), for Thuận and Thao; every finger 7 to 20 mm off the bar.
  Lesson: a distance between two points is only as good as the points; mark them on the frame.
- **The free hand** relaxes (grip 0.28) while the other holds a drink; it closed into a fist.
- **Self-audit of Thao's face** (her probe frames), not yet fixed: her irises disagree (one centred, one pulled in), the
  painted-out face reads flat and pale round the eyes and nose, pale gaps between her hair's ends and her neck, a
  dark strand by her eye in profile and a doubled hairline, eyes that read as stickers in profile, her dress texture
  smeared into zigzags, and her underwear showing when she sits (her Meshy dress). Next for her: the eyes' centres from
  her own sockets, the painted-out skin blended to her cheeks, the hair's holes.
- **Why Thuận is better** (the owner asked): she was made over two days on the owner's notes by her own route
  (`game_thuan.py`, GAME.md): a film model from the owner's design, her hands built procedurally with nails, her face
  painted out and rebuilt with her own measured eyes, lashes, brows and mouth in every feeling, a jaw, nose and cheeks,
  her braids on springs, her skin matched to the film renders. Thao's Meshy model went through the quick route in an
  afternoon: a generated textured sculpt with its own fused hands, its painted face cleaned and the same rigged
  features laid over it.
- **When they drink**: their routines still order tea (`resident-personalities.js`: Thuan `drink:'tea'`, Thao works
  Minato's counter); the owner to say when each has a beer.

## Open

1. **Faces, the last details:** a few dark specks remain beside Thao's eyes and on her nose (lash-fin and nostril
   remnants under the dilation); his hair at the temples is the texture's painted streaks (the side view). His iris
   decal's seam at its edge. (The brows' remnants and his blotched skin: done this afternoon, above.)
2. **Thuận's hands and the things in Sakura** (the owner, 27 October 2026, evening: "Thuan needs to be able to
   interact with the items in Sakura too, pick up a can etc, hands is something you need to put some effort in"). Her
   Pixar body is the Tripo model with grafted hands; the plan: (a) when the owner gives a Meshy Thuận, her own hands with
   grip keys as his; until then, graft the Meshy hands onto her (`game_thuan.py`'s graft, the Meshy hand mesh as the
   donor) and give them the same keys; (b) finger bones on World's skeleton (thumb, index, the three others as one
   chain) driven by the grip, so a can, a bottle, a basket and a broom each get their hold; (c) the Sakura shelves'
   items made holdable (`heldProp` with `grip` data: radius or handle, height), the pick-up and put-back as the izakaya's
   table performance. Start with (c) and the existing grip keys: a can in her hand at once; the fingers later.
3. **His in-game checks, done once** (`node tools/pixar-shots.mjs --scenes --name Johansson <out>`, 81 steps; the
   studio repo's `renders/game/johansson-meshy-game-*.jpg`): idle, walk, gestures and the counter are clean, and the
   draught served at his seat is drunk by the game's own performance with the rim at his lips (`report.json`
   `sip.moments`: `valid` at the sip). The hand stays open around the mug: a holding hand shape is the next step
   (World's skeleton has no finger bones; a closed-hand shape key on the Meshy hand, driven by `heldProp`, is the
   likely route) — done at night: finger bones, above. The stools fit him (feet on the rail, knees at the counter);
   then the izakaya redrawn in CAD.
4. Thuận is still on her Tripo model; the same route takes a Meshy Thuận when the owner gives one.
5. The earlier Pixar Johansson route (the free sculpt, separate shirt and shorts) is kept in the studio repo out of the
   game; its last fixes of the morning (the wrist graft, the hand straight at rest, a wrist weight ramp) live in the
   shared code and serve the Meshy route.
