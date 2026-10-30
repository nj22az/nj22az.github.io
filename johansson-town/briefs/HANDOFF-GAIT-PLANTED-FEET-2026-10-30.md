# Handoff: planted feet in World's walk (30 October 2026)

**The owner's ruling (30 October 2026):** "Warn, and fix the gait next". The film studio's new foot-slide check
(`jojo/remotion/scripts/collide.mjs` with `feet.mjs`, branch `claude/admiring-heisenberg-ynv4ds`) found 62 slides in The
Haunted Vending Machine. They are warnings in the films until World's walk keeps its feet planted; then they fail.

**State: not fixed. World's walk is unchanged** (`src/avatars/animate.js`, the `moving` branch, about line 720). A first
attempt was reverted because it traded the slide for a pop (below). Added: `tools/gait-feet.mjs`, which measures it.

## The measurement (`node tools/gait-feet.mjs`)

A resident is walked in Node at a steady pace, facing -z as the game moves them. The heel and toe of each shoe are
followed; while a point is within 10 mm of the floor it should not move. On the walk as it is now (mm):

| | 1.3 m/s worst | mean | 3.5 m/s worst | mean |
|---|---|---|---|---|
| Thuan | 320 | 143 | 849 | 361 |
| Harbour master | 548 | 457 | 305 | 183 |
| Vy | 437 | 230 | 662 | 350 |
| Grandmother Higa | 528 | 493 | 770 | 720 |

Done means every number is under 10, with no pop (no sole jumping between frames) and no foot through the floor.

## Why it slides

1. **The step is longer than the legs sweep.** The step cycle turns π per `stride` walked, with
   `stride = m.leg × (run ? 2.6 : 1.7)`. But the ankle sweeps only 2 × hip-to-ankle × sin(A) per step: about 1.2 leg
   lengths walking (A = 0.62) and 1.6 running (A = 0.95). The difference is dragged along the ground.
2. **The thigh swings on a sine.** Even with a matched step, a sine moves a planted foot fastest at mid-stance and
   slowest at the ends, so it slides back and forth by several centimetres.
3. **The joints ease behind their targets** (`k = 1 - exp(-14 dt)`, a 71 ms lag). At walking cadence that is about 27° of
   the cycle late and 11 % short.
4. **The foot pitches with the step** (`foot = sin(phase) × A × 0.3`). The heel and toe then rotate about the ankle while
   they are down.

## What was tried (reverted), and what it taught

- **Stance: solved.** The ankle's height and reach are measured once (hip to ankle, from the bones), and the step is
  made `2 × reach × sin(A)`. During stance the sine of the thigh angle goes linearly through the half-cycle, so the foot
  goes straight back at the body's pace. The foot is kept flat (`foot = -(thigh + knee)`), and the legs copy their
  targets once a walk is 0.3 s old (eased in before that). Result: a planted heel stayed within 16 mm for the whole
  stance (Thuan, 1.3 m/s).
  - Signs found: thigh `+` = the leg behind (forward is -z); knee `+` = bent; flat foot = `-(thigh + knee)`. Both legs
    use the same function half a cycle apart; do not mirror the sign.
- **Swing: not solved, and the reason is geometry.** With the stance foot flat to the end and both legs the same
  length, a leg reaching forward with a slightly bent knee hangs *lower* than the straight leg spread behind it, unless
  the knee bends by more than twice the thigh's angle.
  - The knee bent by the clock (as now): the swing toe came down about 3 frames early and slid in about 29 cm.
  - The knee solved for a foot-height arch: the solution needs the "shin behind" branch, which cannot straighten in front
    in time. At landing the knee snapped from 1.34 rad to 0.07 in one frame, a 25 cm pop. That is why it was reverted.
- Walking cadence rises with a matched step: about 2.3 steps a second at 1.3 m/s for Thuan, and about 4.5 at 3.5 m/s
  with A unchanged. The look will change; the owner should see it.

## The design to build next

A proper procedural walk, in the moving branch only:
- The step cycle driven by distance (already so).
- The stance foot locked: its ankle placed by two-bone IK from the hip (thigh and shin lengths from the bones), not by a
  thigh angle.
- **Terminal stance: the heel rises about the toe** (toe-off). This keeps the hip up so the swing foot clears; it is
  what real walking does, and it is the missing piece above.
- The swing foot on a height arc with a clearance of at least 15 mm until the last frames. It lands at the body's pace
  (the Hermite swing curve above: `8s³ − 12s² + 2s + 1` leaves and lands at the stance's speed).
- Optionally a duty factor above 0.5 (double support) with a little stance-knee flex.
- Keep each resident's gait (`gait.js`: stride, lift, toe, bounce) as inputs. Keep the arms, the hips' sway and the tics.

Check with `tools/gait-feet.mjs`, plus `tests/avatar-gait.test.mjs` (residents still told apart by their walk) and the
full guard (`node tools/ci-guard.mjs`). Look at it in the real game: pedestrian and overhead, phone too. Then sync the
avatars into the film studio (`jojo/remotion/tools/sync-town.sh`) and re-run
`film.mjs haunted-vending-machine check`. After a sync, `remotion/src/town/avatars/animate.js` also takes about 230
lines of other World changes (the Pixar sitting); expect re-renders.
