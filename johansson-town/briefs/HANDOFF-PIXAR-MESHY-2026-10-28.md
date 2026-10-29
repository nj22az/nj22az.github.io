# Handover: Pixar Johansson's face, 28 October 2026

The owner, while a Blender still of the cast at Minato was being made (studio repo `nj22az/jojo`, branch
`claude/quirky-hamilton-buam44`, `3d/cast/shots_izakaya.py`): "Make Johansson's chin less pointy"; "Give him a [dimple]
in the chin like a manly chin"; "Oh the moustache needs to be fully gone"; "Can you update the Pixar game model as
well"; "The mouth is a bit offset"; "If you fix the mouth will beer drink still work?".

## State (this repo, branch `claude/quirky-hamilton-buam44`, not on `main`)

- `assets/avatars/pixar/johansson.glb` / `.json`, `PIXAR_BODIES.Johansson.version` `a5c3787aba`, runtime rebuilt.
  Made by the studio's `3d/cast/game_meshy.py johansson` (one full run, about 6 minutes; `--resume` from the posed rig).
- His chin: the V of the sculpt widened at its foot, the tip drawn up and back, a soft cleft down its middle
  (`game_meshy.round_chin`).
- The moustache fully gone: extra shave zones (`johansson_meshy.SHAVE_MORE`), the grey on faces turned down under the
  chin and the nose painted in his skin (`paint_grey`), the moustache's modelled fold smoothed (`smooth_upper_lip`).
- The mouth decal is centred between the eyes. Its x had been the painted sliver's, 12.5 mm to his left.
- Checked: `node --test tests/pixar-meshy.test.mjs tests/pixar-johansson.test.mjs` (7/7);
  `tools/pixar-sheet.mjs Johansson` (every expression); `tools/pixar-shots.mjs --scenes --name Johansson --part sip` (the
  draught at the counter: rim error 0, valid at the sip). Evidence: studio `3d/cast/renders/game/johansson-meshy-mouth-centred-sip.jpg`.

## Later the same day: the face pass of the owner's "anything but outstanding perfect is wrong"

- GLB `2d74cc67fa`. The chin is widened less (0.55 of the earlier 0.85: it had squared the jaw). The extra shave zones and
  the grey paint boxes no longer reach the collar (|x| < 0.075 m, above 1.44 m). A new box paints the jaw's seam.
- Checked again: `node --test tests/pixar-meshy.test.mjs tests/pixar-johansson.test.mjs` (7/7);
  `tools/pixar-sheet.mjs Johansson` (every expression; no moustache, the mouth centred);
  `tools/pixar-shots.mjs --scenes --name Johansson --part sip`: rim error 0 and valid at SIP, as before.

## 29 October 2026: his hip joints, and published

The owner, with a pasted review of the studio's check sheet ("a severe upper-to-lower body scale mismatch"), asked how
to fix it: "Re-proportion, still and game"; then, with a screenshot of him on a sea-wall bench in the live game: "Bring
it to the game too".

- Measured first: standing he is the creator's 1.80 m, 1.16 to 1.21 times the women; seated he was 1.42 times, his thighs
  0.20 m. The cause was the rig: the hip joints at 0.64 m, below his crotch (0.70 m), so he bent there and the top of
  his thighs stood up as trunk. Now at 0.79 m (studio `3d/cast/johansson_meshy.py` `L`); standing he is exactly the
  sculpt. The review's cures (him 20 to 25 % smaller, the hips narrower, the legs thicker) were not used: they would have
  made him 1.35 to 1.44 m and kept the proportions.
- The card at World's scale: `hipY` 0.596 to 0.736, `thigh` 0.186 to 0.314, `torso` 0.755 to 0.615; World seats him from
  these, at the counter, on benches and stools alike. The underside of his shirt's hem is painted in the shirt's blue
  (seated, it showed pale at the cushion from behind).
- Exported from the studio branch with `claude/vibrant-brown-0udpq3` merged in (its soles on the foot bone kept: 410
  vertices), so nothing of `main`'s export of 28 October was lost. GLB `5cb788b657`.
- Checked: `tests/pixar-*.test.mjs` 27/27; the full suite's failures are the same as before the change (67 and 1
  cancelled with the old GLB and the new: none of them his); `tools/pixar-shots.mjs --scenes --name Johansson --part
  izakaya`: seated at the counter in scale, the draught at his lips at the sip (rim error 0, valid); seated on the quay
  bench by the game's own interaction (a scratch run of the audit harness), his thighs along the seat.
- Published: the branch merged with `main` and pushed to `main` on the owner's word.

## 29 October 2026, later: his hands on his knees when he sits

The owner, of him on a bench: "How about his hands shouldn't they rest on his knees when sitting like that". Seated, his
hands floated in front of his belly. Measured in the game: his shoulder is 0.64 m from his knee, his arm reaches 0.48 m
to the wrist, and the chair sit (`src/avatars/animate.js` `chairShape`) held the cartoon's round mitten a hand's length
over the lap: the reach (`reachFor`) keeps a mitten's middle 0.7 of a hand off the body, sampled as a 23 cm ball.

- A Pixar body now rests its palms on its thighs by the knees (`CHAIR_SIT.pixar.rest`): the farthest point of `along`
  (85 % of the way from the hip to the knee first) the arm reaches, with the trunk leaned in by one of `leans` if it must
  (shared by the spine and the chest, the head kept level); the arm is solved with the trunk as it is drawn (the slump
  and the lean), which it was not before. Johansson reaches 85 % with no lean.
- `reachFor` takes `flat` (a thin hand sampled at [its thickness, its width] of the mitten's round) and `clear` (how near
  its middle may come to the body). The cartoon bodies' mittens are as before.
- Checked: on the quay bench and the sea-wall bench by the game's own interaction (`--source`), the palms on the knees,
  fingers over them, from the side, front and three-quarter.

## Open

- A faint crease under the nose, where the moustache's sculpted volume met the nose, shows only close up.
- Tetsuo and Mr Fujita are cloned from his sculpt and landmarks (`tetsuo_meshy.py`, `fujita_meshy.py` take his `L`): their
  next export takes the same hip joints; their GLBs on `main` still have the old ones and sit as tall as he did.
- His arms are 13 % short of a person's (0.29 of his height against 0.33): the sculpt's own, kept.
