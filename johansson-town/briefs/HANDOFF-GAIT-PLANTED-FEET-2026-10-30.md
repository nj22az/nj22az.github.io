# Handoff: planted feet in World's walk (30 October 2026)

**The owner's ruling (30 October 2026):** "Warn, and fix the gait next". The film studio's new foot-slide check
(`jojo/remotion/scripts/collide.mjs` with `feet.mjs`, branch `claude/admiring-heisenberg-ynv4ds`) found 62 slides in The
Haunted Vending Machine. They are warnings in the films until World's walk keeps its feet planted; then they fail.

**Original investigation, retained as history:** World's walk was unchanged when this brief was written. The first
attempt was reverted because it traded the slide for a pop. The original measurements and design follow the current
candidate notes below.

## Codex candidate — 30 October 2026

**[Draft PR #406](https://github.com/nj22az/nj22az.github.io/pull/406): not merged or published.** Branch
`codex/gait-planted-feet` was made from `origin/main` **`37befc31db79e09ac2a1507663f80d6f0cc65ee3`**.
The original measuring tool and this brief came from `origin/claude/admiring-heisenberg-ynv4ds` **`65411983b4`**.
No development-branch World was used, and main was not pushed.

Commits on the review branch:

- **`65b9b7b94af92f4fa54ed6f3af8e267111e094ba`**: world-space planted contacts, measured IK, gait/stop tests, runtime.
- **`550c10446d09cd8ff5801fc2627af46b6c8c87f8`**: running gains distance during flight; bounded airborne reach and body-height
  checks prevent the excessive crouch found in the first visual review.
- **`0d38b1017e27b5e97f523146f496f616d48d7c1e`**: prompt first landing when stopping in flight; the drawn shoe surface,
  rather than a virtual bounding-box corner, determines support height and floor penetration.

### What changed

`src/avatars/planted-walk.js` owns only ordinary locomotion contacts. Thigh/shin lengths and the lower shoe silhouette
are measured once; vectors, quaternions and two contact records are reused. Stance anchors are in world space and the
legs are solved by two-bone IK **after** joint easing, so the 71 ms joint filter cannot drag a supporting shoe.

The distance-driven cycle still uses the resident's stride, lift, toe-out, bounce, sway, carry style and tics from
`gait.js`. Arms, hips' rotations and head keep their existing formulas. The running gait object is cached. The planned
stance factor is 55% walking and 16% running: a run covers distance in flight with a shorter planted-leg sweep, rather
than reaching the stance leg out to 55° and dropping the body. Step length and duty change smoothly with pace.
A trailing support can release early. Airborne reach is bounded, and the revised landing is committed before descent.
The knee bends towards the torso's front even when travel is sideways or backwards.

Terminal stance raises the heel about the toe. Actual shoe vertices set its height on the floor. Swing uses Hermite
(smoothstep) interpolation in world space, leaving and landing at the body's pace relative to the torso, with a height
arc that gains clearance early. A kick acts on the airborne foot rather than moving a support. The first swing and
initial toe rise are eased through their available phase, including when a stop is interrupted.

Ordinary stops finish with lifted 0.3 s recovery steps and retain their final contacts while standing. If **both drawn
shoes are airborne**, the lower one first lands promptly (0.12 s target), then the other recovers with a support.
Existing airborne feet are not returned to an obsolete anchor. This also prevents a suspended two-foot stop.

Sitting, lying, named gestures/poses, climbing, deliberate jumps and **authored counter work** retain their existing
performance. `work-hands.js` has its own toe rises and measured hand/furniture contacts; applying ordinary locomotion
there initially lowered Thao enough to put utensils through a worktop. It is deliberately excluded, as required by
the owner's instruction not to change carrying/poses. Ordinary `s.carrying` locomotion still uses the new contacts.
This candidate does **not** certify counter-work or named-pose foot contacts.

### Measurement and checks actually run

- Original `node tools/gait-feet.mjs`: reproduced the brief's **320/849, 548/305, 437/662, 528/770 mm** worst slides for
  Thuan, Harbour master, Vy and Grandmother Higa at 1.3/3.5 m/s, exactly.
- `tools/gait-feet.mjs` retains the original film heel/toe probes and adds **every drawn rigid shoe vertex** for contact,
  penetration and vertical-change checks. It counts unfinished contacts and reports unrounded values. The contact
  band and slide limit remain 10 mm. The film probes are bounding-box corners, not skin vertices: when the shoe rolls,
  such a corner can lie below its curved surface. Therefore only actual drawn vertices determine penetration.
- Final [144-case matrix](../docs/qa/gait-planted-feet-2026-10-30/matrix.json): **Thuan, Harbour master, Vy, Grandmother Higa,
  Johansson and Mai** at **0.6, 1.3, 2.0, 3.5 m/s**, standing starts, steady travel and stops at 1.13/1.37/1.69/4 s,
  plus the actual Pixar Thuan/Johansson bodies. Mai is the additional child; Riku's current avatar recipe is adult.
  Maximum film-probe slide **3.667 mm**, actual shoe contact slide **5.992 mm**, actual penetration **0.109 mm**, vertical sole change **32.761 mm/frame**, and unsupported stop interval **113.333 ms**; all limits pass.
- `tests/avatar-feet.test.mjs` plus unchanged `avatar-gait.test.mjs` are in `tests/ci-guard.txt`. They check actual
  contacts, <10 mm slide/penetration, <40 mm vertical shoe changes per 60 Hz frame, a first landing within 167 ms,
  other headings, changes of pace, interrupted stops and the real Pixar bodies. A steady run's pelvis must stay within
  30% of measured leg reach of its standing height and change by <40 mm/frame; pace transitions have a 40% / 50 mm bound.
- Focused gait, style and service suites: **43/43** (`avatar-feet`, `avatar-gait`, `izakaya-bar`, `izakaya-food`).
  The original animator was separately checked through a temporary Node loader: service **36/36**. No existing hand,
  furniture or collision assertions were weakened. Extra 22 s Riku/Vy/Tetsuo walks exercised tics within contact limits.
- Initial full guard: **455/470**, exposing the counter-work regression and stale runtime fingerprint; both addressed.
  The first contact-only candidate then passed **470/470**, but its run's excessive body dip was found in the frame
  review and revised before owner approval. The added posture/landing tests guard these findings.
- Final `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs`: **471/471**, **92 files**, **228 s**. This is
  CI's configured heap. `npm run build:runtime`: passed. `node --test tests/runtime-package.test.mjs`: **4/4**.
  After local rebuild iterations, main `37befc31`'s runtime chunks were retained alongside the final graph so existing
  live tabs can finish loading; unpublished intermediate graphs were removed. Runtime-package checks passed again.
- `git diff --check`: passed. The GitHub connection uploaded the exact tested Git trees; tree hashes were checked
  against local commits before the review branch was advanced. Terminal push had no credentials. Main was untouched.

### Visual evidence and review state

[Before-and-after clip](https://chatgpt.com/library?file_id=libfile_5aa456b4f438819198846d363da4be0f&account_id=personal)
and [review notes, matrix and logs](../docs/qa/gait-planted-feet-2026-10-30/README.md).
The final clip is 6.5 s, 24 fps, 156 frames, H.264, 1920×540, silent. Main `37befc31` and the candidate use the same
four bodies, road, speed profile and camera inside the **full source game**, not a substitute avatar viewer.
The cast is staged in a clear carriageway for comparison, not driven along their daily routes.
`tools/gait-review.mjs OUT 37befc31` reproduces it. Pedestrian, overhead and 390×844 phone-sized views are reviewed;
five neighbouring frames around walk, run and stop are inspected. Rendering uses software Chromium, not a physical
phone or GPU-device acceptance. The earlier `cloud-boot-smoke --source` also booted the street and Community Hall at
390×844 with no page errors. Final capture: **zero page errors**. The encoded clip has **156 frames / 6.5 s**, and a
complete FFmpeg decode reports no errors. Owner aesthetic approval remains pending.
The PNG captures remain local because GitHub's blob-create operation returned internal errors; text evidence and
this handover were uploaded through the Git tree operation. The available comparison clip and capture tool preserve
the review result and its reproduction.

### Open / next actions

1. Owner reviews the changed cadence and approves the look. **Keep PR #406 draft; do not merge or push main without
   the owner's own explicit instruction.** This work has not been published.
2. Physical iPhone/iPad and GPU-device checks remain unperformed. The measured matrix covers default clothing on level
   floors. Other outfits, stairs, turns on the spot and authored counter/gesture performances are not certified here.
3. After an owner-approved merge, Claude syncs World into `nj22az/jojo` with `remotion/tools/sync-town.sh`, re-checks the
   films and enables their failures as directed by the owner. This task did not edit the film-studio repository.

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

## Original proposed design (investigation history)

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
