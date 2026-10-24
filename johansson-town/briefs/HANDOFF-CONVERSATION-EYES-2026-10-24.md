# Johansson conversation eyes — 24 October 2026

Owner authorisation: "Push to main if it works."

Base: `aee7515f53817cb743c820607baf2e8c6d6a27ab`. Validation branch: `chatgpt/conversation-eyes-validation-20261024`.
Status: validated candidate on this branch; this workflow does not update main. The supervising agent must inspect and promote the final tree.

## Change
Only the player gesture mapping `Nod: content` becomes `Nod: smile` in `src/avatars/actors.js`. Conversation entry already uses Nod. Its former content expression deliberately draws closed eyes. The existing smile keeps the eyes open except for natural blinks. No face artwork, gesture duration, speaking, sleeping, other expressions, recipes or saves changed.
Added four regression tests using the real shared avatar geometry, player controller and animator; the Node DOM/canvas uses the existing repository fixture. Registered the suite in the full World guard. Rebuilt runtime/index/service-worker outputs once with the existing builder, retaining predecessor chunks.

## Checks actually completed
- The new greeting test failed on the unchanged source with GREETING_EYES_REGRESSION before the fix.
- Four actual-controller regression tests passed after the fix: greeting, repeated greeting/expiry, speech and natural blink recovery, and authored closed-eye gestures/sleep.
- `npm run build:runtime` passed.
- `node --test tests/runtime-package.test.mjs` passed.
- `node tools/ci-guard.mjs` passed in full. See the linked run for counts and exact logs.
- Built-game software Chromium smoke passed all six steps, including START/play, street rendering, Community Hall entry and room rendering, with zero page errors. Screenshots and report are attached to the run.
- Evidence: [validation run](https://github.com/nj22az/nj22az.github.io/actions/runs/40073107742), artifact conversation-eyes-validation.

## Limits and next action
The full-game smoke covers startup and room entry, not a photographed dialogue interaction. The controller tests exercise the greeting directly. No physical iPhone/iPad, Steam Deck, hardware FPS or newly packaged Linux release is claimed.
Remove the temporary branch-only validation workflow from the final delivery tree; inspect scope and current main before promoting. Do not overwrite concurrent main changes. Main promotion and Pages deployment must be verified separately.
