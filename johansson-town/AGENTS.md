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
- Retain iPhone Safari resource safeguards. Colour or surface improvements must not silently restore expensive framebuffer allocations or background asset floods.

The implementation plan is [docs/MINATO-HOMES-PLAN.md](docs/MINATO-HOMES-PLAN.md). Its future assignments are proposals, not claims about the current runtime. Preserve save compatibility when implementing it.

## Verification

Use focused geometry, collision, navigation and schedule checks. For runtime changes run `npm run build:runtime` and `node --test tests/runtime-package.test.mjs`. Check real pedestrian and overhead views, including mobile, wherever a GPU browser is available; state when physical-device or visual checks are unavailable. Do not claim screenshots or tests that were not performed.
