# Original coordinated attention — 25 October 2026

## Scope and publication

Owner authorised proceeding with independently implemented eye, neck and body
attention after discussing `doldecomp/sms` and explicitly asking to avoid legal
risk. The implemented scope is this first character improvement, not the separate
camera, locomotion and collision proposals.

Base: `development` at `96b743bb3b8b8286d52cbddf7aa84174f39d2d7d` (Thao work
retained). Prototype: **development only**, enabled by `?attention-rig`;
`?attention-rig=0` and ordinary URLs use the previous animator. Main, Pages and the
Linux release are not changed by publishing this development work.

## Specification and implementation

Read [the original behaviour specification](../docs/ATTENTION-RIG-2026-10-25.md).
It was written before the attention implementation. Existing bones/geometry and
painted/rigged eye paths are retained; no new dependency or saved state is needed.

- `src/avatars/attention-rig.js`: eyes respond first, neck/head after 0.10 s,
  limited chest assistance after 0.28 s. Angular speed limits and exponential
  settling; measured head origin, parent transforms, near/far/behind fades,
  finite-input protection and release. Eyes use the residual direction after
  the actual head turn, including the ordinary animator's pose.
- `animate.js`: optional final pose layer. Authored gestures, head-to targets,
  consumption, sleeping and lying retain head/hand contact priority. Explicit
  eye directions retain their priority. Walking, seating and tasks retain the torso.
- `actors.js`: passes task occupancy to the attention layer.
- `people/facing.js`: free residents give eyes/neck time before whole-body
  conversation turns; occupied residents retain direction. Street neighbours
  release facing-owned gaze on conversation end in the prototype.
- `people/neighbour-chats.js`: the same delayed body turn and the actual partner
  head position, including a seated partner, when enabled.
- `game.js`: prototype facing uses the possessed player's height / current seat
  eye level instead of assuming every player is the standing Johansson.

## Provenance

The assessment preceding this task inspected selected decompilation files. This
work is **not** presented as a formal clean-room exercise or a legal opinion.
No decompiled source, tuning tables, assets or dependencies were copied, imported
or translated. The implementation follows Johansson-specific requirements and
uses standard mathematics and the existing Johansson skeleton. The repository's
CC0 label was not treated as permission to reuse Nintendo-derived material.

## Evidence and checks

- Focused attention/facing/neighbour-chat/shop-gaze/rigged-eye suite: **35/35**.
  Thirteen attention checks cover timing, limits, invalid targets, different
  bodies/heights, transformed parents, release, 30/60/120 Hz stepping, seating,
  task priority, peer conversations and unchanged ordinary URLs.
- [Rendered contact sheet](../docs/qa/attention-rig/attention-sheet.png): actual
  Thuan, Johansson and seated Thao, initial/eyes/neck/settled/released states.
  All 15 cells inspected. Head, hair, face and eyes remain attached through the
  sampled turns. No new mesh/seam correction is claimed.
- [Motion review](../docs/qa/attention-rig/attention-motion.webm): Thao acknowledges
  a target, changes side and releases it; rendered and reviewed through sampled
  video frames. Software Chromium/WebGL, **zero page/console errors** in the
  standalone review. Not a real-GPU performance measurement.
- [Capture report](../docs/qa/attention-rig/report.json) and reproducible tool
  `node tools/attention-review.mjs`. Set `TOWN_CHROMIUM_PATH` for the available
  browser and `TMPDIR` for its temporary profile if necessary.
- Runtime rebuilt with the repository's locked dependencies: Vite 7.3.6,
  Rollup 4.63.1, esbuild 0.28.2. **4/4 runtime checks pass**; the graph remains
  **34 entries** (the same count as the development baseline). Final boot:
  `runtime/boot-CTRsfkw6.js`. Prior baseline chunks retained for cached pages.
- Final parallel World guard: **462 passing checks**, one geometry-audit process
  failed to complete. The same audit run alone passes **13/13**. All **475 guard
  checks are therefore covered across those runs**, but the parallel guard command
  itself did not exit green in this container. Memory pressure is the inferred
  cause (the container recorded OOM kills); no geometry assertion failed. Logs:
  [parallel guard](../docs/qa/attention-rig/guard.log),
  [isolated geometry audit](../docs/qa/attention-rig/no-z-fighting.log).
  Earlier setup failures from omitted sparse-checkout fixtures and a non-locked
  Rollup build were resolved before these final checks; no test budget was relaxed.
- Compiled-game phone-width smoke: boots, START works, street and Community Hall
  render, **zero page errors**. The existing compiled resident animator (Nhung)
  shows eyes first at frame 5 (neck 0), neck turn at frame 12 (0.147 radians),
  settled at frame 75 (0.320 radians). The in-town capture was inspected after
  positioning the observer in her actual streamed area:
  [resident](../docs/qa/attention-rig/compiled-resident.png),
  [game report](../docs/qa/attention-rig/game-report.json).
- `git diff --check` passes. [Verification manifest](../docs/qa/attention-rig/verification.json)
  records the source fingerprint and counts. Implementation prepared on development;
  publication is recorded in the follow-up below.

## Remaining acceptance

Physical iPad/Safari and Steam Deck are untested. The Blender neck-remodelling
work is separate: this changes the existing rig's attention behaviour only.
Review the prototype's conversation timing on a real device before considering
default enablement or promotion to main. Preserve the other development
prototypes and the retained Sakura upper-floor decision.
