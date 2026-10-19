# Johansson World instructions

Read the repository's [AGENTS.md](../AGENTS.md) and [CLAUDE.md](../CLAUDE.md). Their working discipline applies here.

## Owner's current decisions — 18 October 2026

- Keep Minato a compact urban port town. Do not restore rural districts or expand its shoreline for housing.
- Every ordinary Minato villager needs an actual occupied home, with a reachable entrance, usable interior, sleeping place and credible work/home routine. A registry label alone is insufficient.
- Do not retain surplus empty houses or speculative residential units. Assign existing suitable homes first, then remove genuinely redundant residential buildings and their obsolete geometry/navigation references.
- Preserve working shops, port access, ferry operations, Harbour Park and Umi-no-yu. Do not remove an active workplace merely because an upper floor is vacant.
- Johansson is the ship's chief engineer. His main home is with Thuan on the separate tropical island; he also has a cabin aboard the ship. Older mayor descriptions are stale canon.
- ~~Thuan shares that tropical primary home and keeps a room in Thao and Chin's Minato house.~~ Superseded on 19 October 2026 (the consolidation's ruling 4, below): her weekday room is dropped; she lives with Nils on Kitano-jima. Do not create a separate empty house for her.
- Sakura's upper floor is to become the main office with a kitchenette and views over the port and town, not a home. The tiny existing ground-floor office remains complementary. ~~Grandmother Sakurai therefore needs a suitable home elsewhere on Minato.~~ Superseded on 19 October 2026: Grandmother Sakurai retires and Thuan owns Sakura outright (the consolidation, below).
- Keep the tropical island's terrain and facilities intact. Housing work on Minato must not rebuild that separate island.
- ~~Retain iPhone Safari resource safeguards.~~ Superseded on 19 October 2026, below.

## Owner's decisions — 19 October 2026

- Graphics: every device draws the standard of before 18 October 2026 (the owner: "pre October 18 standard graphics is what we are looking for"; "I don't need iPhone safeguards I need the code to be optimised so it still looks good"). Desktop, tablet and phone differ only in drawing resolution and shadow detail (`src/render/startup-recovery.js` `graphicsProfile`). Do not reintroduce device classes that drop shadows, multisampling, HDR, detail streaming or varied openings; keep memory down by optimising what is drawn and kept instead (for example `src/render/canvas-release.js`, the ferry's engine-room plates drawn only aboard).
- Reduced graphics is a recovery mode only after two interrupted launches in a row, and the game says so and offers the full look back.
- Where empty houses were removed, the street plan closes up around them: no vacant lawn or paving lots left where buildings stood.

~~The implementation plan is [docs/MINATO-HOMES-PLAN.md](docs/MINATO-HOMES-PLAN.md).~~ Superseded on 19 October 2026 by the cast, household and crew consolidation below; the homes plan remains as dependency evidence only. Preserve save compatibility when implementing it.

## Owner's rulings — 19 October 2026: the cast, household and crew consolidation

The plan of record is [docs/CAST-CONSOLIDATION.md](docs/CAST-CONSOLIDATION.md), the owner's brief with its addendum; where the two differ, the addendum wins, and both win over every older character, ownership and housing description here and in `docs/`. Its data is `src/people/roster.js` (mirrored in `docs/cast-roster.json`): 21 core and 5 supporting identities with stable ids, short display names and historical aliases, the ten retired identities and where their purpose goes, the 14 core households, the eight ship posts and the shore roles. It is run as five PRs (the brief, "How it is run"); phase 1 (roster data, aliases and the save migration, `src/save.js migrateCast`) changes nothing visible, and each later phase switches one part of the game over to the roster.

In brief: Thuan owns and runs Sakura outright; Chin is the motorman aboard and Tetsu's repairman ashore, never Sakura staff; Fujita becomes the ferry master, shown as Fuji, sober on watch, the shed and the beer only after he signs off; Nils is chief engineer, not mayor, at home with Thuan on Kitano-jima with a duty cabin aboard; Jack Reed (harbour agent) and Mac Turner (relief engineer) replace the Harbour master and Mr Nakandakari as American long-term residents; ten identities retire (the Bus driver, Mr Higa Jr, Grandmother Sakurai, Grandmother Chinen, Postman Tōma, Mr Shimabukuro, Mr Ōshiro, Mrs Kinjō, Barfly, Reiko) and six more Minato houses go.

The owner's rulings of later that day (the brief's addendum), which win:

1. **Police station.** Mori does not stay in the kōban. A real police station (交番/警察署 on the signs, English in speech) is built on the empty lot next to it, enterable like the shops (front desk, waiting bench, lost-and-found, notice board, holding room, bicycle rack, patrol-car bay); Mori's accommodation moves inside it. The household count stays 14 and the home id `koban` is retained as his logical identity. The station is a separate job after the consolidation, which must not build on that lot.
2. **Kitahama lots.** The street-dressing pass skips the Kitahama lots; the compaction decides the plan, and the dressing (gardens, 月極 parking, bike sheds, hedges) follows on the final layout.
3. **Trade rules.** Retiring Mrs Kinjō moves flowers to Sakura: change the "Rainflower Florist supplies decorations" line in the repo CLAUDE.md and `src/commerce/merchandising.js` with it, and remove the florist pavilion. Remove the former post-office shop-house once Mika's counter has the parcels (if inspection finds a shared or non-residential dependency, name it and make the smallest complete service-preserving change).
4. **Thuan's weekday room at 1 Kitahama is dropped.** She and Nils live on Kitano-jima and the ferry runs 06:25–22:15. kitahama-1 is purely Thao, Chin and Vy.
5. **kitano-3** (the dead Chinen house) is removed in this job, not reported as a candidate.
6. **Kitahama Heights** becomes two attached ground-floor houses with their own doors and gardens (no corridor, no stair), keeping the `kitahama-flat-3` / `kitahama-flat-4` ids for migration.

Reconciled with the source on 19 October 2026 (`src/people/roster.js` records each): Yui, Aya and Nao, three of the brief's display names, are the sisters' names in the oldest saves (`src/people/renamed.js`), so those renames apply only to saves from before the roster (castRevision 1) and the names now belong to the teacher, the purser and the bosun; the manning plan's post key stays `oiler` with the title Motorman and a `motorman` alias; Jack takes both the Harbour master's shore keys and Mr Fujita's Minato linesman duty.

## Verification

Use focused geometry, collision, navigation and schedule checks. For runtime changes run `npm run build:runtime` and `node --test tests/runtime-package.test.mjs`. Check real pedestrian and overhead views, including mobile, wherever a GPU browser is available; state when physical-device or visual checks are unavailable. Do not claim screenshots or tests that were not performed.
