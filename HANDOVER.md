# Latest handovers

Start here on every task, then read the latest applicable notes below. Maintain this index whenever a new note supersedes one of these. For an area without a note, create and link one when handing over work. Dates alone do not settle conflicting information: verify current branches, PRs, checks and releases.

## Current owner priority — 23 October 2026

**Make Minato impeccable and immersive: “a little paradise that you wish were real.”**
Read the [Minato design direction in the World handover](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md#owner-direction--23-october-2026-minato-comes-first).
Refine existing places, residents' daily lives, comfortable interactions, atmosphere and reliability.
The third city island is low priority and deferred until explicitly reprioritised by the owner.

| Work area | Current handover |
| --- | --- |
| Studio: Fujita television comic | [23 October production handover](johansson-town/briefs/HANDOFF-FUJITA-TV-COMIC-2026-10-23.md). Latest: built-in editable comic, camera/pose editing and 14 per-panel shader looks; project round-trip verified. Merged in [PR #375](https://github.com/nj22az/nj22az.github.io/pull/375) as `fffc491b`; Pages deployment verified. Follow-up adds editable scene/comic sharing links and an immediate preview; publication in progress. |
| Current fighting withdrawal: web and Linux | [22 October implementation handover](johansson-town/briefs/HANDOFF-COMBAT-WITHDRAWAL-2026-10-22.md). [PR #365](https://github.com/nj22az/nj22az.github.io/pull/365): merged to main as `4a52d5d2161f9691b8f3e808ba959389f463e578`; [Linux 0.2.17](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.17) published through merged [PR #370](https://github.com/nj22az/nj22az.github.io/pull/370). 367 World checks, full Linux acceptance and public installer/checksum verification passed; signed off. |
| Food service and seating integration: PR #350 on main plus PR #351 | [22 October combined integration review](johansson-town/briefs/HANDOFF-FOOD-SEATING-INTEGRATION-2026-10-22.md). [Merged PR #356](https://github.com/nj22az/nj22az.github.io/pull/356), squash commit `2fd64868fe6da67619cef618ed8c67174843a96f`. Owner approved the combined screenshots; handover signed off. |
| Johansson World: world, characters, benches and storytelling | [22 October 2026 afternoon World handoff](johansson-town/briefs/HANDOFF-2026-10-22-afternoon.md) (seated poses #351, civic comic backdrops #352, retired-cast tests #353), after the [morning one](johansson-town/briefs/HANDOFF-2026-10-22.md). Also read the earlier notes they reference. |
| Minato Izakaya: food preparation, separate food/drink delivery and serving clearances | [22 October 2026 food-service handover](johansson-town/briefs/HANDOFF-IZAKAYA-FOOD-2026-10-22.md). Read alongside the World handoff. |
| Look setting (shader styles under Settings in the Town book) and Free camera (frozen fly-round view) | [22 October 2026 looks handover](johansson-town/briefs/HANDOFF-LOOKS-2026-10-22.md). Branch `claude/upbeat-hamilton-4bhz8q`, pushed straight to `main` on the owner's instruction ("Push camera to main"). |
| World test maintenance: save consolidation and frozen screenshot regression | [22 October save-consolidation sign-off](johansson-town/briefs/HANDOFF-SAVE-CONSOLIDATION-2026-10-22.md), PR #369, merged as `97579cc0b4bfd4af3523e3ae0bf25d672643d82b`; 350 local checks and the GitHub guard passed. Earlier [frozen-audit sign-off](johansson-town/briefs/HANDOFF-FROZEN-AUDIT-2026-10-22.md), PR #368, merged as `67856af51864165014f12299966065411b3eb381`. Read alongside the World handoff. |
| Linux edition, controllers, right-stick camera and release integration | [22 October 2026 Linux controller handover](HANDOVER-LINUX-JOYSTICK-2026-10-22.md). Read alongside the World handoff for shared game changes. |

The Linux controller note contains newer merge and release information than the morning World note. Real-device confirmation of right-stick camera control on Bluetooth and Steam Deck remains outstanding; follow that note's reproduction steps.

## Repository instructions handover — 22 October 2026

The owner requested that every new agent check the latest handover and update it when finished. Root [AGENTS.md](AGENTS.md#handover-required-at-the-start-and-end-of-every-task) now requires that lifecycle for every task, including partial or blocked work. [CLAUDE.md](CLAUDE.md) repeats the entry point so both Claude and Codex encounter it.

This change adds repository instructions and this index. Existing project rules and dated handovers are preserved. Validation: reviewed the current main instruction files and handover inventory; checked all local Markdown link targets and the three-file diff. No game, runtime or visual changes; no gameplay tests required.

Next agent: read the handover for your work area, verify live repository state, carry out the owner's task, and update that handover plus this index if its latest pointer changes.
