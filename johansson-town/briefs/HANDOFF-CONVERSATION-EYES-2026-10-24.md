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
- Full guard and actual-game comparison: results recorded in the final delivery update.

## Delivery and next action

Prepared for owner review. Main has not been changed; the repository requires owner
approval before merging visual changes. Final delivery records the fix commit, PR,
full guard result and actual-game evidence here. Physical-device acceptance is not claimed.
