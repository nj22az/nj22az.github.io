# Latest handovers

Start here on every task, then read the latest applicable notes below. Maintain this index whenever a new note supersedes one of these. For an area without a note, create and link one when handing over work. Dates alone do not settle conflicting information: verify current branches, PRs, checks and releases.

| Work area | Current handover |
| --- | --- |
| Food service and seating integration: PR #350 on main plus PR #351 | [22 October combined integration review](johansson-town/briefs/HANDOFF-FOOD-SEATING-INTEGRATION-2026-10-22.md). [Merged PR #356](https://github.com/nj22az/nj22az.github.io/pull/356), squash commit `2fd64868fe6da67619cef618ed8c67174843a96f`. Owner approved the combined screenshots; handover signed off. |
| Johansson World: world, characters, benches and storytelling | [22 October 2026 afternoon World handoff](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md) (seated poses #351, civic comic backdrops #352, retired-cast tests #353), after the [morning one](johansson-town/briefs/HANDOFF-2026-10-22.md). Also read the earlier notes they reference. |
| Minato Izakaya: food preparation, separate food/drink delivery and serving clearances | [22 October 2026 food-service handover](johansson-town/briefs/HANDOFF-IZAKAYA-FOOD-2026-10-22.md). Read alongside the World handoff. |
| Nhung becomes the island doctor (Dr Kakazu retired into her); Front-Row's trade and Saturday closing at Sakura; queued: Higa Liquor closes into Sakura | **Finished, PR to main open, not merged** (branch `claude/clever-ride-qdpo8s`; merge only on the owner's word): [task folder](johansson-town/briefs/nhung-doctor/progress.md) (progress, checks, inputs) and the session note below. Higa Liquor: its own stacked PR on `claude/clever-ride-qdpo8s-higa-liquor`. |
| Claude Code skills: Colorfigures (hand-inked interactive isometric figures) | **Merged** to main as [PR #361](https://github.com/nj22az/nj22az.github.io/pull/361) (squash `a0fb347c`), only `.claude/skills/colorfigures/` (8 files, MIT, reviewed before adding). Signed off. |
| Linux edition, controllers, right-stick camera and release integration | [22 October 2026 Linux controller handover](HANDOVER-LINUX-JOYSTICK-2026-10-22.md). Read alongside the World handoff for shared game changes. |

The Linux controller note contains newer merge and release information than the morning World note. Real-device confirmation of right-stick camera control on Bluetooth and Steam Deck remains outstanding; follow that note's reproduction steps. Its evening update: a saved Look axis past the pad's axes now falls back to the right stick (`84baf00`, for 0.2.17, unreleased; it rides the Nhung doctor PR from `claude/clever-ride-qdpo8s`).

## Repository instructions handover — 22 October 2026

The owner requested that every new agent check the latest handover and update it when finished. Root [AGENTS.md](AGENTS.md#handover-required-at-the-start-and-end-of-every-task) now requires that lifecycle for every task, including partial or blocked work. [CLAUDE.md](CLAUDE.md) repeats the entry point so both Claude and Codex encounter it.

This change adds repository instructions and this index. Existing project rules and dated handovers are preserved. Validation: reviewed the current main instruction files and handover inventory; checked all local Markdown link targets and the three-file diff. No game, runtime or visual changes; no gameplay tests required.

Next agent: read the handover for your work area, verify live repository state, carry out the owner's task, and update that handover plus this index if its latest pointer changes.

## Session handover — 22 October 2026 (evening), branch `claude/laughing-rubin-6p25x2`

Not merged; no PR. Three things live on this branch, in this order:
1. `84baf00` **Controller fix** (steam-deck, for Linux 0.2.17, unreleased): a saved Look/Move pair past the pad's axes
   falls back to the default sticks; test added, 39/39 desktop tests passed. Ready on its own; see the Linux note.
2. `a30a254`, `3fe01c0` and the commit carrying this note: **Nhung becomes the island doctor**, work in progress. Start
   with [its task folder](johansson-town/briefs/nhung-doctor/progress.md) (`progress.md`, `checks.md`,
   `sources/task.md`): the owner's decisions, what is done, the baseline comparison and the exact list still failing.
3. `54d1573` the Colorfigures skill, already on main through #361 (it merges cleanly).

Next agent: finish (2) per its Next action, keep (1) with it or split it into its own PR, then the queued Higa Liquor
step. Do not merge (2) to main before the CI guard is green and the runtime is rebuilt: main deploys the site.

## Session handover — 22 October 2026 (late evening), branch `claude/clever-ride-qdpo8s`

The branch holds `claude/laughing-rubin-6p25x2` (the controller fix `84baf00`, the doctor work in progress, Colorfigures)
plus main merged in, then the finishing commits. One PR to main carries both the controller fix (its own commit, kept as
it was) and **Nhung becomes the island doctor**; it is not merged: main deploys the site, and the owner merges on their
word.

Done here, as the [task folder](johansson-town/briefs/nhung-doctor/progress.md) records: the tests that stated the old
arrangement updated (none weakened; the sisters' game reports a todo), her red car fetches the clinic's medicines
from the airport freight on Monday and Thursday evenings, the clinic draws the doctor only when her day has her
there, Front-Row draws her at the paper in the evening, the jagged sage shirt under her coat fixed (and the same band on
every open jacket), portraits and article photos re-rendered and looked at, a separate review whose findings were fixed,
the runtime rebuilt once, last. `node tools/ci-guard.mjs` alone: 333 of 334, the one `no-z-fighting` running out of
memory on this container's Node 22 heap exactly as on the base commit (it passes with a 10 GB heap; CI runs Node 24).

Open for the owner (task folder, "Open issues"): the sisters' jan-ken-pon has no day now that Nhung keeps Sakura on
Sunday and it shuts on Saturday; books at Sakura are by order only; the clinic's "Mayor" wording.

Next agent: the PR waits on the owner. The Higa Liquor step (Sakura sells and supplies all alcohol, Kōji's round is
Sakura Trading's, the shop stands shut with a notice) is its own stacked PR, branch
`claude/clever-ride-qdpo8s-higa-liquor` on top of this one, task folder `johansson-town/briefs/higa-liquor-closes/`.
