# Johansson World instructions

Read the repository's [AGENTS.md](../AGENTS.md) and [CLAUDE.md](../CLAUDE.md). Their working discipline applies here.

## Owner's current decisions — 18 October 2026

- Keep Minato a compact urban port town. Do not restore rural districts or expand its shoreline for housing.
- Every ordinary Minato villager needs an actual occupied home, with a reachable entrance, usable interior, sleeping place and credible work/home routine. A registry label alone is insufficient.
- Do not retain surplus empty houses or speculative residential units. Assign existing suitable homes first, then remove genuinely redundant residential buildings and their obsolete geometry/navigation references.
- Preserve working shops, port access, ferry operations, Harbour Park and Umi-no-yu. Do not remove an active workplace merely because an upper floor is vacant.
- Johansson is the ship's chief engineer. His main home is with Thuan on the separate tropical island; he also has a cabin aboard the ship. Older mayor descriptions are stale canon.
- Thuan shares that tropical primary home and keeps a room in Thao and Chin's Minato house. Do not create a separate empty house for her.
- Sakura's upper floor is to become the main office with a kitchenette and views over the port and town, not a home. The tiny existing ground-floor office remains complementary. Grandmother Sakurai therefore needs a suitable home elsewhere on Minato.
- Keep the tropical island's terrain and facilities intact. Housing work on Minato must not rebuild that separate island.
- ~~Retain iPhone Safari resource safeguards.~~ Superseded on 19 October 2026, below.

## Owner's decisions — 19 October 2026

- Graphics: every device draws the standard of before 18 October 2026 (the owner: "pre October 18 standard graphics is what we are looking for"; "I don't need iPhone safeguards I need the code to be optimised so it still looks good"). Desktop, tablet and phone differ only in drawing resolution and shadow detail (`src/render/startup-recovery.js` `graphicsProfile`). Do not reintroduce device classes that drop shadows, multisampling, HDR, detail streaming or varied openings; keep memory down by optimising what is drawn and kept instead (for example `src/render/canvas-release.js`, the ferry's engine-room plates drawn only aboard).
- Reduced graphics is a recovery mode only after two interrupted launches in a row, and the game says so and offers the full look back.
- Where empty houses were removed, the street plan closes up around them: no vacant lawn or paving lots left where buildings stood.

The implementation plan is [docs/MINATO-HOMES-PLAN.md](docs/MINATO-HOMES-PLAN.md). Its future assignments are proposals, not claims about the current runtime. Preserve save compatibility when implementing it.

## Verification

Use focused geometry, collision, navigation and schedule checks. For runtime changes run `npm run build:runtime` and `node --test tests/runtime-package.test.mjs`. Check real pedestrian and overhead views, including mobile, wherever a GPU browser is available; state when physical-device or visual checks are unavailable. Do not claim screenshots or tests that were not performed.
