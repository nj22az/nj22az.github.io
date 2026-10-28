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

## Open

- Publishing to `main` waits for the owner's word, as before.
- A faint crease under the nose, where the moustache's sculpted volume met the nose, shows only close up.
