# Johansson World: ferry company, crew and building direction

22 October 2026. Source baseline `a0fb347ced9250b2e5a6210ba068bf595a7ca310`. Planning and an isolated avatar candidate only; no game changes or Blender model produced. Read root/directory instructions and the current handover first.

## Start with the ferry office and operating roles

Recommended order: (1) implement the approved company/command roles after resolving relief arrangements; (2) reconcile and greybox the shared terminal office; (3) make the ship's duty routines and accommodation self-contained; (4) redesign Sakura's roof and validate its ground-floor support rooms; (5) select and greybox the northern school/community building; (6) author the agreed building shells in Blender and integrate/test one location at a time. Chin's appearance can be reviewed as a separate small visual change.

Blender is suitable for the shells, roof, tank, trim and furniture. Keep doors, shop products, interactions, collision, navigation, room IDs and schedules attached to the game's shared data. A monolithic replacement GLB would lose those responsibilities unless reconnected. Author in metres with explicit origins and export collections separately. `tools/blender/build-school.py` contains hard-coded older dimensions while current `school-layout.js` has a later single-storey campus; do not regenerate the school from that script unchanged.

## Confirmed new owner direction

- Thuan and Johansson jointly own the ferry line in the game. Thuan has a place in the ferry office too. No equity percentage, corporate name or title portfolio has been specified.
- Some island real estate is intended to belong to them; the properties are not identified. Do not transfer other households, public plots, the terminal or the school to them by inference.
- The ship's crew should work as a self-contained group, seen ashore sparingly. This means duties, meals, rest and ordinary off-watch time chiefly aboard; it does not authorise deleting Chin's family, shore homes or meaningful occasional shore leave.
- Fujita is a **retired sea captain**, not the active master. Preserve his character, houseboat and stories. The owner has now appointed Ryo as captain for implementation.
- Tetsuo remains the electrician. Retain his island/workshop role and purposeful maintenance visits; do not turn him into an unrelated full-time deckhand.
- Chin should look stronger and clearly adult, using the shared avatar creator/system.
- Sakura retains its approximately 139 m2 footprint and all previously selected on-site functions: shift desk/secure cash, tea/meal break, lie-down/rest room, bulk stock/archives.
- Replace the former Sakura upper office with a **roof, water tank and small internal stair reached through a door inside Sakura**. This is a roof-access stair, not an upstairs-office entrance. Roof walkability, stair travel style and final geometry have not been agreed.
- Consolidate school and community kitchen into a new northern building, retaining the present classroom interior and adding teachers' office, kitchen/community function and an office. For planning, the latter is a teacher/community office; the ferry company office remains at the terminal unless corrected.
- Include a minimap. The game already has one (`game.js` drawMap, `#minimap`); extend the existing map and destination data after a site is chosen.

## Ferry company office proposal

Provide two identifiable work areas: Johansson's technical desk, machinery drawings, maintenance planning and ship records; Thuan's operator/business desk, bookings/freight oversight and company/property records. Use shared meeting/chart space and an equipment/key cupboard if the room test supports it. These are proposed duties and furnishings, not new commitments or an assumption that Thuan abandons Sakura.

Keep the existing Harbour Office and shore staff distinct. Preserve ticketing, post/parcels, Ganaha's counter, waiting seats and ferry departures. Reconcile the waiting-room interior (9 x 7 m) with the exterior hall (4.1 x 7.3 m), and the upper records shell/access, before authoring a final office model. Do not simply move Sakura's shop safe, stock and account books into the company office. The previous exclusive-Johansson terminal sketch in PR #366 is superseded by this shared-owner direction; its footprint and storage safeguards remain useful.

## Approved command roles and proposed remaining crew - not yet implemented

| Function | Proposed person | What changes / remains to settle |
| --- | --- | --- |
| Master | **Ryo — owner approved** | Promote from chief officer; bridge relief and the vacated mate post must be resolved before switching live operations. |
| Chief officer | To be appointed | Ryo's former post is vacant in the new plan. Do not promote Ren or invent a qualified mate by assumption. |
| Chief engineer | **Chin — owner approved** | Supersedes his motorman assignment. Reconcile profile, command, engine-room duties and accommodation; do not leave duplicate chief/motorman assignments. |
| Owner / technical manager | **Johansson — owner approved** | Shore management with Thuan as joint owner. No routine chief-engineer watch or departure dependency. |
| Relief engineer | Mac | Retain engineering relief capacity; final rota must support Chin rather than substitute for Johansson's presence. |
| Motorman | To be resolved | Chin's promotion vacates this post. Audit workload/relief before deciding whether a separate person is required. |
| Bosun | Nao; Koji as existing relief | Mooring/deck work. Preserve the relief arrangement; do not quietly remove Koji's fishing/delivery functions. |
| Deck hand | Ren | Lines, gangway and rounds; ship-based duty. |
| Purser | Aya | Passenger/vehicle counts and onboard service, distinct from Ganaha's terminal counter. |
| Cook-steward | Jun | Crew meals, galley and kiosk, with real meal/rest periods aboard. |
| Electrician (shore support) | Tetsuo | Planned electrical jobs aboard and island/workshop work ashore. |
| Retired captain | Fujita | No required bridge watch, startup command or departure dependency; occasional advice/story visits only. |

The owner-approved promotions leave chief-officer and motorman coverage unresolved. This is not a complete relief rota or a live roster change. Check the 06:05-22:20 working day, bridge/engine cover, meals, rest, berths and days off. Preserve the fixed timetable: she never waits for Johansson or either owner. Several listed berths are data reservations rather than fully verified drawn accommodation; inspect every bed/locker/mess seat before declaring the crew self-contained.

Before live implementation, update the roster once, then all consumers: ferry-crew, master-commute, fujita-day, aboard/shore bodies, operations/startup authorisation, households, biographies, dialogue, stories and save migration. Preserve stable Fujita identity instead of deleting him. Never let owner status substitute for the serving master's operational command.

## Chin: useful reversible preparation

`Chin-stronger-candidate.recipe.json` is an isolated normalized recipe, not applied to World. Adult life stage and identity/outfit are retained; Build rises from 0.32 to 0.65, jaw to 0.62 and brows to 0.55. Shared engine measurements show approximately 14.2% greater torso width and 10.5% greater arm radius at the same height. See `chin-comparison.json`.

The current Build dial broadens depth/waist as well as limbs; it is not an independent musculature control. A broader build may read stocky rather than athletic. First compare the actual character in identical lighting, front/side/full-body and in his work pose; then test clothing, hands, walking, seats and doorway clearance. Keep face/skin identity and family role. No visual approval is claimed for the candidate, and no runtime recipe was edited. Coordinate with the existing Studio identity/hand work rather than fork the character engine.

## Northern school/community building and map

`Northern-Site-Review.svg` and `northern-sites.json` show existing source-coordinate footprints/uses, not a buildable site survey. The current classroom shell is 9 x 7.2 m. Reuse that room's layout, light, desk/school-day behaviour and student/teacher identities as requested.

The continuous northern Kitahama block is 26 x 10 m (260 m2), but contains the shared vegetable garden and monthly parking. Small northern cane plots 10/11/12 are each 8 x 9 m (72 m2), separated by lanes; do not treat the three as one open parcel or close lanes silently. One small plot barely accommodates the classroom shell before teachers' office, kitchen, WCs, safe entry and circulation. Lots 6/7/9 also have existing garden, association, play and bicycle uses.

Prepare a site comparison before choosing: preserve public routes, school arrival safety and useful displaced functions; verify terrain/ground ownership, setbacks, utility access and capacity. The current clinic and power house stay unless separately instructed. Decide the old school/community footprints' future uses only after the new rooms work, avoiding empty shells. No ownership transfer of any candidate public plot is authorised.

New building programme: existing classroom; teachers' preparation/office room; community kitchen with school meal support; community/administration office; toilets/wash/cleaning store; shared circulation and accessible public entrance. Kitchen and classroom are separate functioning rooms/zones, with sensible community access during school hours. Keep school routines and kitchen keeper Emi's existing obligations in view; do not schedule one person in two places. Refresh navigation, room origins, map pins and comic backdrops from real new rooms.

## Sakura roof and interior protection

Use the retained-footprint ground-floor Rev B zoning as a starting point, not an accepted capacity result. Keep Thuan's desk/secure cash and all selected facilities on site. Validate storage inventory/volume before retiring upper stores; solve any shortfall at Sakura rather than silently outsourcing it. Reconcile the new roof/tank with that result before removing a floor.

Give the tank a supported roof/plinth and appropriate plumbing/maintenance clearance; do not place a heavy-looking tank on an unsupported cosmetic slab. Put the small stair behind an inside staff door, away from customer/stock routes. Preserve the no-traversable-office-stair ruling until the roof stair's interaction is specifically agreed. No street-facing office entry. Do not leave the old office window portals, fire escape, door prompts or saved room positions pointing into air. Access, fall protection and safe arrival must be designed if the roof is usable; a maintenance-only roof can be simpler.

## Proposed delivery order and acceptance gates

1. Implement Ryo captain, Chin chief engineer and Johansson owner/technical manager after resolving mate/motorman coverage; record owners separately from crew command. Property portfolio can remain deferred.
2. Draw and greybox the shared terminal office against the actual port exterior; test both desks, stairs/access, window views and all passenger/harbour services.
3. Implement crew posts, relief and onboard routines/accommodation as one focused change; prove sailing with the player ashore, owner visiting, and old saves.
4. Preview Chin's shared-engine recipe separately; apply only the reviewed appearance with pose/clothing/clearance checks.
5. Verify Sakura inventory/support room capacity, then greybox its roof, tank and internal staff-door stair; preserve shopping/save behaviour.
6. Compare/select the northern school/community site and displaced uses; retain the classroom; update the existing minimap and story photographs.
7. Build agreed shells in Blender, export in the existing coordinate convention (Three x,y,z -> Blender x,-z,y), then run room-arrival, ground, collision/z-fighting, schedule/save/runtime checks and 390x844/desktop actual-game visual acceptance for each focused PR.

No broad simultaneous rebuild, demolition, live crew swap or asset replacement has occurred. No .blend file, in-game minimap change, character screenshot or physical-device test is claimed by this planning task.

## Decisions and next verification

The owner has decided: Ryo is captain; Chin is chief engineer; Johansson is owner and technical manager. These supersede the earlier new-captain and rotating-Johansson-chief proposals. Thuan remains joint owner, Tetsuo electrician and Fujita retired captain.

The owner requested an MCP walk of the island to choose the school site. See [SCHOOL-SITE-RECOMMENDATION.md](SCHOOL-SITE-RECOMMENDATION.md): public-game startup failed with a graphics-engine error after a retry, and the document offered no WebMCP tools. No walk or successful in-game site inspection is claimed. The northern garden/parking block is the provisional best of the measured cleared-plot options; siting, outdoor provision and displacement remain unapproved.

Property parcels, company name/equity and exact roof-access behaviour can be decided later. Chief-officer and motorman coverage need an operating plan before implementation.
