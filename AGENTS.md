# Working instructions

Read the existing `CLAUDE.md` and any instructions in the directory being changed. Preserve its project guidance. The following working rules adapt [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills/blob/8462496b34419f20b32778610571ac723e91f94c/CLAUDE.md), adopted at the owner's request on 18 October 2026.

1. Before editing, identify assumptions, relevant alternatives and consequential uncertainty. Explain meaningful trade-offs. Resolve ambiguity that could change the intended outcome; use judgement for routine reversible choices.
2. Implement the smallest complete solution to the requested problem. Avoid speculative features, premature frameworks and unused configuration. Prefer a straightforward implementation.
3. Keep changes confined to the requested work, follow the surrounding style and remove any unused code introduced by your changes. Report unrelated defects separately.
4. Turn the goal into observable acceptance criteria. For substantial work, outline the steps and their checks, then iterate until those checks pass. Report remaining verification limits honestly.

These supplement the owner's instructions and existing project rules. They do not authorise unrelated work or override the owner's stated decisions.

## Owner's rule - 23 October 2026: CAD before every remodel

Every building, room, shop, counter, shelving or other spatial remodel must follow this sequence, including work in a review branch:

1. **Draw CAD first.** Measure and record the existing exterior shell, openings, floor levels and retained fixtures. Draw a dimensioned plan and the relevant elevations/sections, with units, coordinates and revision. The owner's fixed exterior governs the interior. Keep the editable CAD and a readable review drawing with the work.
2. **Audit the CAD yourself before construction.** Check dimensions and proportions, overlaps, doors and their swings, routes/egress, working and customer clearances, character scale/reach/sightlines, shelf/product fit, materials/supports and service access. Compare retained objects and intended uses with the actual source/assets. Record findings, assumptions and checks; identify anything unverified.
3. **Fix the drawing before implementing.** Resolve every finding that invalidates the layout or intended use, update affected dimensions and rerun the audit. Do not build a known-bad plan and defer its correction to decoration. Unresolved consequential dimensions or dependencies block that part of construction; independent drawing/audit work can continue.
4. **Construct from the corrected CAD, then verify.** Share measured placement data with the implementation where practical. Compare the built result with the CAD, inspect actual-game views at player and worker height, test affected routes/interactions, and correct discrepancies. Keep screenshots and the audit results with the handover. A visual mock-up alone does not establish working geometry or character contact.

The user requested this as a standing instruction: "for any remodel draw a cad first and audit yourself and fix what needs fixing before implement construction". This is a required work sequence, not a new permission/approval gate.

## Handover: required at the start and end of every task

These instructions apply to every agent working in this repository.

1. **Before starting work**, read [HANDOVER.md](HANDOVER.md), then the latest applicable handover it links to and any newer notes for the area being changed. Check dates and Git history when several notes exist; do not assume an older note is current because it was supplied in a previous conversation. Follow any additional handovers required by directory instructions.
2. Verify the relevant branch, PR, check and release state against the repository before acting. Handovers preserve context; newer owner decisions and verified repository state take precedence.
3. **Before finishing or handing work to another agent**, update the applicable handover with what changed, exact branches/commits/PRs, checks actually run and their results, remaining problems or verification limits, and the next concrete actions. Do this for completed, partial and blocked work. Clearly distinguish planned, open, merged and published work; never imply an unrun check or physical-device test passed.
4. Keep [HANDOVER.md](HANDOVER.md) pointing to the latest notes. If a new dated handover supersedes an old one, update its pointer in the same change and preserve useful history. If no handover exists for the work area, create one and link it there. Re-read the current version before writing so concurrent agents' updates are preserved.
5. Include the handover update in the work delivered for review and link it in the final response. If access prevents updating it, state that explicitly and provide the pending handover text instead of silently omitting it.

## Animation, character performances and films

Read [ANIMATION_DIRECTION.md](ANIMATION_DIRECTION.md) when working on animated performances, scene/film direction or rendering. It adapts the owner's supplied *Opus 5.5 promt.pdf* for both Claude and Codex: timed briefs, a reproducible timeline, readable acting/cameras, contact checks, measured picture/sound review and honest reporting. Its offline film settings do not replace the interactive game's device budgets or existing character system.

## Repository split: on hold

The owner, 20 October 2026: "We won't split anything until the Sjöskolan course is over." The plan to move World, Studio
and Sjöskolan into their own repositories (`split/RUNBOOK.md` on the `codex/studio-*` branches) stays unexecuted until
then: no new repositories, no moved folders, no forwarding addresses. Work continues in this repository.

