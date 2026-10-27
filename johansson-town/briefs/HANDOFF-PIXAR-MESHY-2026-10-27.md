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

## Open

1. **The brows on both:** the painted brow leaves remnants beside World's brow decal, and his decal lies thin and
   tilted (the face sheets). Fix in the studio's `paint_out_face`: the brow hole from the found brow's own box, the
   decal's tilt from the line's ends. His iris decal shows a seam at its edge.
2. **His in-game checks** (the owner's standing asks): idle and Interact, the draught at the counter by the game's own
   performance (`node tools/pixar-shots.mjs --scenes --name Johansson --part sip <out>`; the earlier body sipped with
   the rim at the lips, `report.json` `sip.moments`), the stools against him; then the izakaya redrawn in CAD.
3. Thuận is still on her Tripo model; the same route takes a Meshy Thuận when the owner gives one.
4. The earlier Pixar Johansson route (the free sculpt, separate shirt and shorts) is kept in the studio repo out of the
   game; its last fixes of the morning (the wrist graft, the hand straight at rest, a wrist weight ramp) live in the
   shared code and serve the Meshy route.
