# Johansson conversation eyes — 24 October 2026

## Request and diagnosis

The owner reported that Johansson always closes his eyes when talking to someone.
Current main was verified as `aee7515f53817cb743c820607baf2e8c6d6a27ab`.

`setConversation()` starts a `Nod`. The player gesture maps that nod to the `content`
expression, whose eyes are drawn as closed arcs. Both the live frame loop and the
frozen audit's `step()` passed zero elapsed time to the player while the dialogue
panel was open. Consequently the greeting expression, nod, blink and speech timers
could remain frozen throughout the conversation. Resident animation still advanced.

There was a second issue in the existing player API: `play(name,{face})` applied the
requested expression before the gesture default, allowing the default to overwrite it.

## Change

Branch: `codex/johansson-conversation-eyes`, based on the main commit above.

- The conversation greeting requests `Nod` with the existing open-eyed `smile` face.
- An explicit `face` takes precedence over a gesture's default expression.
- Live and audit loops advance the player animation during an active conversation,
  following the existing conversation-facing policy.
- During conversation the animation receives zero walking speed, no running and no
  airborne state. Dialogue skips movement updates, so its previous movement values
  otherwise remain stale and would cause walking in place.
- Ordinary menus retain their animation pause. Existing default gesture expressions,
  intentional closed-eye poses, natural blinking, seat state and world timing remain.
- The compiled runtime is rebuilt from main's runtime, retaining its previous chunks
  according to the existing build script. No Linux package is released by this change.

The functional fix is confined to `src/game.js` and `src/avatars/actors.js`.
`tools/conversation-eyes-smoke.mjs` reproduces the actual-game conversation and captures
its timing, motion and screenshots using existing audit hooks.

## Verification

- Baseline focused suites passed before the change: avatars, avatar expressions,
  dialogue RPG and conversation.
- After the change those four suites and runtime-package passed (five test files).
- A deterministic four-second player animation check passed: explicit greeting,
  changing speech, blink closure/reopening, expression expiry and preserved default
  Nod/Laugh expressions.
- Runtime build and JavaScript syntax check passed.
- Independent read-only source review found no blocking defect or startup-order issue;
  ordinary menu/inspection transitions clear the conversation before opening.
- Local full guard: 71 files, 69 passed, two failed because the sparse checkout lacked
  `art/izakaya/compact/plan.json`, `art/izakaya/walnut-runtime-report.json` and the existing
  compact-room browser report. Restoring those tracked fixtures made both affected files
  (`minato-compact`, `izakaya-bar`) pass. No game source, test or assertion changed for
  those reruns. Logs retain the original failed invocation and the successful reruns.
- Actual built-game checks passed at 390 × 844 and 1280 × 800: open-eyed greeting,
  expression expiry, blink recovery, changing speech, stationary position/legs,
  conversation pause and ordinary inventory pause; zero page errors. The final capture also verifies actual actor visibility, giving 9/9 checks at each
  size (18/18 total). Original main reproduces exactly the four greeting/blink/speech
  failures; both original and corrected captures have zero page errors.

## Delivery and next action

Prepared for owner review. Main has not been changed; the repository requires owner
approval before merging visual changes. Implementation commit: `d1ed2d5885189d601e271b767778c9d50b338fdb`.
Review: [PR #386](https://github.com/nj22az/nj22az.github.io/pull/386), targeting `main`.
GitHub guard and Linux acceptance are running; no result is claimed until verified.
The final photographs were inspected: the original greeting/listening frames show
closed eyes; the corrected greeting and eight-second listening frames show open eyes.
Evidence and reproduction: [conversation-eyes review](../docs/qa/conversation-eyes/README.md).
The actual-game harness is `tools/conversation-eyes-smoke.mjs`; its 390 × 844 original
comparison and corrected 390 × 844 / 1280 × 800 reports are under that evidence folder.

Next: owner reviews the before/after views, then approve merge. Before merging, verify
checks on the current PR head and whether main has advanced. If runtime integration is
needed, rebuild once from current main's manifest so its cached chunks remain available. Physical-device acceptance is not claimed.
