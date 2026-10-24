# Latest handovers

Start here on every task, then read the latest applicable notes below. Maintain this index whenever a new note supersedes one of these. For an area without a note, create and link one when handing over work. Dates alone do not settle conflicting information: verify current branches, PRs, checks and releases.

## Current owner priority — 23 October 2026

**Make Minato impeccable and immersive: “a little paradise that you wish were real.”**
Read the [Minato design direction in the World handover](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md#owner-direction--23-october-2026-minato-comes-first).
Refine existing places, residents' daily lives, comfortable interactions, atmosphere and reliability.
The third city island is low priority and deferred until explicitly reprioritised by the owner.

| Work area | Current handover |
| --- | --- |
| Conversation greeting eyes | [24 October correction and validation](johansson-town/briefs/HANDOFF-CONVERSATION-EYES-2026-10-24.md). One-line nod expression correction; actual controller tests, rebuilt runtime, complete guard and built-game smoke passed on the validation branch. Check the note and current main for promotion state. |
| Studio: Seventeen Beers sea-wall comic | [23 October sea-wall comic handover](johansson-town/briefs/HANDOFF-SEVENTEEN-BEERS-COMIC-2026-10-23.md). Canonical Fujita/Johansson, actual promenade bench, Risograph and editable creator mark; PNG/project and nineteen-style PDF delivered, with Risograph first and one complete strip per page. Reusable sea-wall camera location added to Studio. |
| World / Studio: experimental print and paint looks | [23 October print-media shader handover](johansson-town/briefs/HANDOFF-PRINT-MEDIA-SHADERS-2026-10-23.md). [PR #383](https://github.com/nj22az/nj22az.github.io/pull/383), publishing implementation `9aa922e1`, adds Risograph, Pencil Manga, Heavy Brush Oil and Rubber Stamp; accepted styles preserved. Four comic variants and twelve full-game views (including Minato Izakaya), eight-page PDF and editable projects delivered. Merged with owner approval as `2b836773`; World guard passed, extended Linux conversation acceptance timed out and was retried. Follow-up pushed to main as `9f546d5b` adds a discreet editable Johansson creator wordmark to new comics, with project/share persistence; see the latest handover section. |
| Studio: Fujita television comic | [23 October production handover](johansson-town/briefs/HANDOFF-FUJITA-TV-COMIC-2026-10-23.md). Latest: [shared shader implementation handover](johansson-town/briefs/HANDOFF-SHARED-SHADERS-2026-10-23.md): World/Studio share geometry-aware illustration effects, capture buffers and export quality; Manga/Cartoon/Oil comparisons delivered on a review branch, followed by the owner’s second review: binary Manga, calmer Cartoon colour, highlight-only Oil grain and broken surface-pencil strokes. Owner approved and merged the recovery in [PR #382](https://github.com/nj22az/nj22az.github.io/pull/382), main `50f531d3`; both GitHub World guard and Linux acceptance passed. Four-language Manga source/lettering follow-up pushed to main as `f7a82033`; exports (Vietnamese/Japanese/Swedish/English), editable projects and PDF delivered; see the latest merge/language section in that handover. Latest visual recovery removes the rejected Storybook/Sunday/Gouache experiments, restores the accepted Cartoon/Manga/Oil and ink prepass, and retains the Crayon cheek fix and architectural Sketchbook. See the handover’s recovery section; do not revive the rejected hybrids without a new owner request. Physical-device acceptance remains outstanding. New Thuan “Make something of your life” comic with an unnamed man, hero burst and football ending; see the Thuan revision section ([PR #381](https://github.com/nj22az/nj22az.github.io/pull/381), merged `070f8f54`; image/project delivered, Pages verification pending). After effects MCP 1.7 adds discovery and comic editing/export tools; see the MCP wiring section in the handover ([PR #380](https://github.com/nj22az/nj22az.github.io/pull/380), merged `b287e702`). After effects adds replacement text, shader looks, image/sticker assets and English/Swedish versions. [PR #379](https://github.com/nj22az/nj22az.github.io/pull/379) merged as `101dc238`; After effects verified live. Earlier: corrected speech-bubble joins and head clearance ([PR #377](https://github.com/nj22az/nj22az.github.io/pull/377), merged `23629714`); built-in editable comic, camera/pose editing and 14 per-panel shader looks; project round-trip verified. Merged in [PR #375](https://github.com/nj22az/nj22az.github.io/pull/375) as `fffc491b`; Pages deployment verified. Editable scene/comic sharing and the immediate preview merged in [PR #376](https://github.com/nj22az/nj22az.github.io/pull/376), `ee165872`; public comic viewer and Studio sharing entry verified live. |
| Current fighting withdrawal: web and Linux | [22 October implementation handover](johansson-town/briefs/HANDOFF-COMBAT-WITHDRAWAL-2026-10-22.md). [PR #365](https://github.com/nj22az/nj22az.github.io/pull/365): merged to main as `4a52d5d2161f9691b8f3e808ba959389f463e578`; [Linux 0.2.17](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.17) published through merged [PR #370](https://github.com/nj22az/nj22az.github.io/pull/370). 367 World checks, full Linux acceptance and public installer/checksum verification passed; signed off. |
| Food service and seating integration: PR #350 on main plus PR #351 | [22 October combined integration review](johansson-town/briefs/HANDOFF-FOOD-SEATING-INTEGRATION-2026-10-22.md). [Merged PR #356](https://github.com/nj22az/nj22az.github.io/pull/356), squash commit `2fd64868fe6da67619cef618ed8c67174843a96f`. Owner approved the combined screenshots; handover signed off. |
| Johansson World: world, characters, benches and storytelling | [22 October 2026 afternoon World handoff](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md) (seated poses #351, civic comic backdrops #352, retired-cast tests #353), after the [morning one](johansson-town/briefs/HANDOFF-2026-10-22.md). Also read the earlier notes they reference. |
| Minato Izakaya: food preparation, separate food/drink delivery and serving clearances | [22 October 2026 food-service handover](johansson-town/briefs/HANDOFF-IZAKAYA-FOOD-2026-10-22.md). Read alongside the World handoff. |
| Nhung becomes the island doctor (Dr Kakazu retired into her); Front-Row's trade and Saturday closing at Sakura | **Merged** to main through [PR #362](https://github.com/nj22az/nj22az.github.io/pull/362) on the owner's word (23 October 2026; branch `claude/clever-ride-qdpo8s`, with main merged in and the runtime rebuilt): [task folder](johansson-town/briefs/nhung-doctor/progress.md) and the session notes below. |
| Higa Liquor closes into Sakura (Sakura sells and supplies all the drink, Kōji's round is Sakura Trading's, the shop shut with a notice) | **Merged**: [PR #363](https://github.com/nj22az/nj22az.github.io/pull/363) into #362's branch (`41fed9ec`), and with it to main through #362 (23 October 2026): [task folder](johansson-town/briefs/higa-liquor-closes/progress.md) and the session note below. |
| #362 and #363 merged; the money model closed for now; the next step (simplify background processes) | **Latest:** [22 October 2026 night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md). Supersedes the two session notes of 22 October (late evening, night) below for state; they keep the detail. |
| Claude Code skills: Colorfigures (hand-inked interactive isometric figures) | **Merged** to main as [PR #361](https://github.com/nj22az/nj22az.github.io/pull/361) (squash `a0fb347c`), only `.claude/skills/colorfigures/` (8 files, MIT, reviewed before adding). Signed off. |
| Look setting (shader styles under Settings in the Town book) and Free camera (frozen fly-round view) | [22 October 2026 looks handover](johansson-town/briefs/HANDOFF-LOOKS-2026-10-22.md). Branch `claude/upbeat-hamilton-4bhz8q`, pushed straight to `main` on the owner's instruction ("Push camera to main"). |
| World test maintenance: save consolidation and frozen screenshot regression | [22 October save-consolidation sign-off](johansson-town/briefs/HANDOFF-SAVE-CONSOLIDATION-2026-10-22.md), PR #369, merged as `97579cc0b4bfd4af3523e3ae0bf25d672643d82b`; 350 local checks and the GitHub guard passed. Earlier [frozen-audit sign-off](johansson-town/briefs/HANDOFF-FROZEN-AUDIT-2026-10-22.md), PR #368, merged as `67856af51864165014f12299966065411b3eb381`. Read alongside the World handoff. |
| Linux edition, controllers, right-stick camera and release integration | [22 October 2026 Linux controller handover](HANDOVER-LINUX-JOYSTICK-2026-10-22.md). Read alongside the World handoff for shared game changes. |

The newest note for Nhung the doctor and Higa Liquor is the [22 October 2026 night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md): both merged to main through #362 on 23 October; the money model closed for now; next, simplify background processes.

The Linux controller note contains newer merge and release information than the morning World note. Real-device confirmation of right-stick camera control on Bluetooth and Steam Deck remains outstanding; follow that note's reproduction steps. Its evening update: a saved Look axis past the pad's axes now falls back to the right stick (`84baf00`, for 0.2.17, unreleased; it rides the Nhung doctor PR from `claude/clever-ride-qdpo8s`).

## Repository instructions handover — 22 October 2026

The owner requested that every new agent check the latest handover and update it when finished. Root [AGENTS.md](AGENTS.md#handover-required-at-the-start-and-end-of-every-task) now requires that lifecycle for every task, including partial or blocked work. [CLAUDE.md](CLAUDE.md) repeats the entry point so both Claude and Codex encounter it.

This change adds repository instructions and this index. Existing project rules and dated handovers are preserved. Validation: reviewed the current main instruction files and handover inventory; checked all local Markdown link targets and the three-file diff. No game, runtime or visual changes; no gameplay tests required.

Next agent: read the handover for your work area, verify live repository state, carry out the owner's task, and update that handover plus this index if its latest pointer changes.

## Session handover — 22 October 2026 (evening), branch `claude/laughing-rubin-6p25x2`

Not merged; no PR. Three things live on this branch, in this order:
1. `84baf00` **Controller fix** (steam-deck; 0.2.17 was published without it, so it ships in 0.2.18 or later): a saved Look/Move pair past the pad's axes
   falls back to the default sticks; test added, 39/39 desktop tests passed. Ready on its own; see the Linux note.
2. `a30a254`, `3fe01c0` and the commit carrying this note: **Nhung becomes the island doctor**, work in progress. Start
   with [its task folder](johansson-town/briefs/nhung-doctor/progress.md) (`progress.md`, `checks.md`,
   `sources/task.md`): the owner's decisions, what is done, the baseline comparison and the exact list still failing.
3. `54d1573` the Colorfigures skill, already on main through #361 (it merges cleanly).

Next agent: finish (2) per its Next action, keep (1) with it or split it into its own PR, then the queued Higa Liquor
step. Do not merge (2) to main before the CI guard is green and the runtime is rebuilt: main deploys the site.

## Session handover — 22 October 2026 (late evening), branch `claude/clever-ride-qdpo8s`

**Update, 23 October:** merged to main through #362 on the owner's word; see the [night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md).

The branch holds `claude/laughing-rubin-6p25x2` (the controller fix `84baf00`, the doctor work in progress, Colorfigures)
plus main merged in, then the finishing commits. One PR to main, [#362](https://github.com/nj22az/nj22az.github.io/pull/362), carries both the controller fix (its own commit, kept as
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

## Session handover — 22 October 2026 (night), branch `claude/clever-ride-qdpo8s-higa-liquor`

**Update, 23 October:** merged to main through #362 on the owner's word; see the [night handoff](johansson-town/briefs/HANDOFF-2026-10-22-night.md).

**Higa Liquor closes into Sakura** (the owner, 22 October: "close Higa Liquor. Sakura sells and supplies all alcohol,
Kōji's round becomes Sakura Trading's, and the building stands shut with a notice on it"; their answer on how: "Own
stacked PR"; [PR #363](https://github.com/nj22az/nj22az.github.io/pull/363)). The branch is the doctor branch (`claude/clever-ride-qdpo8s`, PR #362) plus this change; its PR is based
on the doctor branch, so it shows only this change. Merge #362 first, then this one, each on the owner's word: main
deploys the site, and this branch's runtime was built from the doctor branch's, keeping that build's chunks.

The owner's decision and its details: `johansson-town/AGENTS.md`, "Owner's decision — 22 October 2026: Higa Liquor
closes into Sakura"; the work, the review and the open issues: the
[task folder](johansson-town/briefs/higa-liquor-closes/progress.md) (`progress.md`, `checks.md`, `sources/task.md`).

Next agent: both PRs wait on the owner. Open for them: the walking Kōji keeps to the ice plant between the depot and
the crate yard (the drops are in the data, not walked); the economy model does not know Sakura's Saturday closing; the
Higa feed backdrop is still to be captured.
