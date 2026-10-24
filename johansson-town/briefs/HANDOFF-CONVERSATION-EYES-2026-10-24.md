# Johansson conversation eyes — 24 October 2026

Owner request: "Push to main if it works."

Base: `aee7515f53817cb743c820607baf2e8c6d6a27ab`.
Validation branch: `chatgpt/conversation-eyes-validation-20261024`.

The conversation entry calls `play('Nod')`; the player gesture mapping selects
`content`, whose eyes are intentionally closed. Proposed fix: change only that
mapping to the existing open-eyed `smile`. Keep natural blinking, speech, nod
motion, timing, other expressions, appearance recipes and saves unchanged.

Status: validation staged, not pushed to main. The branch-only workflow must
reproduce the regression before applying the patch, run the real avatar/controller
regression tests, rebuild the runtime, run the runtime-package suite and complete
the full World guard. It cannot push main. The supervising agent must inspect its
results and the resulting tree, remove the temporary validation workflow from the
final tree, recheck the main head, and promote only the validated candidate.

No tests or visual checks are claimed by this initial note. Physical-device
acceptance remains outstanding. Update this note with actual results before
promotion or handover.
