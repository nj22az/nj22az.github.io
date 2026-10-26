# Working instructions

Read the existing `CLAUDE.md` and any instructions in the directory being changed. Preserve its project guidance. The following working rules adapt [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills/blob/8462496b34419f20b32778610571ac723e91f94c/CLAUDE.md), adopted at the owner's request on 18 October 2026.

1. Before editing, identify assumptions, relevant alternatives and consequential uncertainty. Explain meaningful trade-offs. Resolve ambiguity that could change the intended outcome; use judgement for routine reversible choices.
2. Implement the smallest complete solution to the requested problem. Avoid speculative features, premature frameworks and unused configuration. Prefer a straightforward implementation.
3. Keep changes confined to the requested work, follow the surrounding style and remove any unused code introduced by your changes. Report unrelated defects separately.
4. Turn the goal into observable acceptance criteria. For substantial work, outline the steps and their checks, then iterate until those checks pass. Report remaining verification limits honestly.

These supplement the owner's instructions and existing project rules. They do not authorise unrelated work or override the owner's stated decisions.

## Owner's workflow — 24 October 2026: prototypes, Pixar, main

The owner: "I want the workflow to be like this , codex prototypes and makes a detailed three.js room and characters and
you improve upon this to reach Pixar standard , main keeps the simplified but cute and relatable cartoony three js until
we have a perfect Pixar world".

- **Codex prototypes** detailed three.js rooms and characters on the `development` branch (behind a URL flag when
  they run in World, as `?sakura-rebuild` does). Prototypes are not merged into `main`.
- **Claude takes a prototype to Pixar standard**, in Blender (the studio repo `nj22az/jojo`: `3d/cast/`, `3d/sakura/`),
  on the `pixar` branch, reading the prototype's CAD and data rather than copying it.
- **`main` keeps the simplified, cute and relatable cartoon three.js** World until the Pixar world is complete; its
  fixes and small features merge as before.
- **Except Thuan** (the owner, 26 October 2026: "Replace her in the live game and studio now"): her Pixar body (made in
  the studio repo, `3d/cast/game_thuan.py`; World `src/avatars/pixar.js`) is Thuan on every World and Studio page;
  `?pixar=0` shows the cartoon. Further residents follow only on the owner's word
  (`johansson-town/briefs/HANDOFF-PIXAR-THUAN-2026-10-26.md`). **Pixar Johansson** (`3d/cast/game_johansson.py`, in
  `PIXAR_BODIES`) is made and on the branch `claude/vibrant-brown-0udpq3`, **not on `main`**: he is the player, and his
  publication waits for the owner's word (`johansson-town/briefs/HANDOFF-PIXAR-JOHANSSON-2026-10-26.md`).
- **Three branches only** (the owner, 24 October 2026: "I basically want main , and the Pixar branch , and a development
  branch"): `main`, `development`, `pixar`, in both repos. Every older branch is kept as a tag `archive/<name>`
  (`git checkout -b <name> archive/<name>` restores one). The survey before the clean-up: `docs/BRANCHES-2026-10-24.md`.

## Development tool: REA, reverse engineering for agents — 24 October 2026

The owner: "https://github.com/morluto/rea use this as a permanent asset in Johansson World and nj22az.github.io
development". REA (MIT, `rea-agents` on npm) gives an agent tools to inspect native binaries, JavaScript/Electron
applications, .NET assemblies and websites, with the evidence for each conclusion.

- **Registered for every session** in `.mcp.json` as `rea`, pinned to one exact version (`npx -y rea-agents@6.7.0 mcp`),
  as REA's installation guide recommends for persistent registrations. Raise the pin deliberately, after reading the
  release notes; never `@latest` in the shared config. Terminal use: `npx -y rea-agents@6.7.0 <command>` (`--help` lists
  them). Codex registers it with `npx -y rea-agents@6.7.0 setup --client codex` (see REA's `docs/installation.md`).
- **Use it on our own things first:** the packaged Linux edition (`steam-deck/dist/`, an Electron app:
  `analyze-javascript-application`), the website and World bundles, Johansson Studio, Steam's behaviour around our
  shortcut and controller files, and libraries we depend on, to understand and debug them from the outside.
- **Study, measure, never copy** (as for New Yokosuka): REA's own disclaimer is the boundary. No DRM, licence-check or
  anti-cheat circumvention, no cheats, no reproducing another product's code or assets. Learn how a feature works,
  then build our own. Record what was inspected and why with the work.

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

