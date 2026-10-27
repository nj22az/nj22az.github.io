# Handover: Sakura's stockroom and stair without Z-fighting, and the climb as the loading screen (26–27 October 2026)

The owner: "Push to main, then audit the storage room and the stair case, Cad it first remove all Z fighting." Then: "The
black part should not be shown it should be like a loading screen when you up the stairs the loading starts for the top
Floor", "No the loading screen is walking up the stairs", "Sveeenshots too pls" and "Camera should lock from below we just
see him go up".

## Stockroom and stair surfaces (published to main, `23ac623f`, `f8f61105`)

Drawings SK-ZF-004/005 rev A (`docs/qa/sakura-surfaces/build_stair_cad.py`, `audit-stair-before.json`). The strict zones
(stockroom and stairwell: 2 mm / 0.1 cm² with identical faces kept, and 10 mm / 0.05 m² wide) are at 0 and tested in
`tests/sakura-surfaces.test.mjs`. The hosted guard ran out of memory in `no-z-fighting.test.mjs`; the scanner allocates less
and the workflow gives the guard step a 6 GB heap.

## The climb (this commit)

Drawing SK-ST-001 rev B (`docs/qa/sakura-surfaces/build_climb_cad.py`, 8/8 checks; rev A cut between two cameras).

- **No black.** The stairwell is built in full in both storeys (`buildSakuraStairwell` in `sakura-stairs.js`: closed
  carriages, 11 + 11 treads, the turning landing, the top landing, walls and ceiling). The dark volumes only keep their
  colliders.
- **The walk is the loading screen.** Stepping onto the stair (or Go upstairs/downstairs) starts `takeSakuraStair` in
  `game.js`: the other storey starts loading, and he walks his flight at 1.2 m/s (`SAKURA_STAIR_CLIMB`).
- **The camera is locked.** In third person: going up, low in the corner at the stair's foot, aimed up the lower flight;
  going down, high over the top landing, aimed down the upper flight. It turns only 30 % after him. The walls between the
  flights hide the other flight from any camera, so each walk ends as he turns on the landing. Then the cut (0.18 s) and he
  is at the stair head upstairs, or the foot in the stockroom. If the storey is not ready he waits on the landing, in view.
  In first person he climbs on his own eyes.
- On arrival his camera is put level behind him at once (the stair camera's aim used to carry into the first frame).
- Film: `node tools/sakura-climb-review.mjs <dir>` (after `npm run build:runtime`). The sheet sent to the owner:
  `docs/qa/sakura-surfaces/climb-locked-camera.jpg`.

## Checks

- `tests/sakura-stairs.test.mjs`, `sakura-back`, `sakura-surfaces`: pass.
- Every test file that mentions Sakura (635 tests): 12 fail here and 11 on untouched main, the same 11 plus #335 (the office
  site named once more in `game.js`), which this branch then fixed. With it fixed all three files pass.
- The local `tools/ci-guard.mjs` result is recorded in the HANDOVER row.
- Frames up and down inspected: he is in view from his first step to the turn, nothing black, the arrival level.
  SwiftShader in desktop Chromium; not checked on the owner's phone.

## Next

- Phone check of the climb (timing of the loading on a slow connection: he may wait on the landing).
- The Pixar Blender konbini (`jojo`, `pixar`) should follow the same rules.
