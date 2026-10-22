# Quality recovery handover — 22 October 2026

## Start here and scope

Read root CLAUDE.md, AGENTS.md, HANDOVER.md and johansson-town/AGENTS.md first, then this note, HANDOFF-2026-10-22.md and its two referenced 21 October notes. For Linux read HANDOVER-LINUX-JOYSTICK-2026-10-22.md as well.

The owner supplied nine iPhone Safari screenshots, IMG_8651.jpeg–IMG_8659.jpeg, and requested identification of quality problems and a remedy plan in the handover. The images are evidence of appearance, not proof of animated flicker, collisions or the current deployed commit. Preserve their exact viewpoints for comparison.

**New owner decision: abolish the current fighting mode from the build now.** This supersedes earlier permission for festival fighting and insult-triggered quarrels. Do not merely hide one button, reduce its frequency, restrict it to Linux, or build its replacement during this recovery.

**Delivery status: inspection and plan only.** This documentation change does not remove fighting or repair geometry. Implementation and publication remain outstanding. Do not tell the owner the game has changed because this note exists.

## Evidence and source findings

Current main files were read through GitHub on 22 October. Search results referenced revision 8e234f1bb407611d37101247eff0f56c1facb5f3; searches are navigation evidence, not a release audit. The screenshot build/version is unknown.

| Area | Observed evidence | Source or next inspection target | Required result |
| --- | --- | --- | --- |
| Sakura stockroom, IMG_8651 | A very large near-black opening dominates the rear wall; the boundary reaches up under the ceiling. It reads as missing architecture. | src/world/interiors/sakura-stairs.js: SAKURA_STAIR_PASSAGE.dark, addDark, voidMaterial; src/game.js: takeSakuraStair. Read source blob a6e42490e39776e23610f5acca1ab7bf29198281 for the inspected stair version. | A bounded, credible stair doorway/alcove with darkness recessed behind it; stockroom walls, soffit and trim remain visible. Preserve the non-traversable fade transition and inside-only office access. |
| Nakamura frontage, IMG_8652 | The shaved-ice banner pole lies directly across the standing resident and doorway sightline. Its lower end appears to meet the frontage without a clear stand. | Find Nakamura's actual banner builder and placement data; inspect its base, cloth, crossbar, collider and resident stand point together. Sakura nobori in src/world/okinawa/old-town.js is a related audit target, not a confirmed source of this photographed pole. | Pole and banner stand beside the entrance, with a grounded base, legible cloth and clear door/resident approach. Audit all freestanding flags and shop banners, not just this one. |
| Harbour approach, IMG_8653–54 | Hard rectangular dark/light surface joins, abrupt road-marking terminations and crowded sign/support silhouettes make the approach appear assembled from separate patches. The truck crosses the apron in both views. | src/world/ground-plan-harbour.js, ground-plan.js, ground-build.js; harbour, pier, sign and traffic builders. | One intentional road-to-quay transition, coherent markings and clear pedestrian/vehicle routes; no duplicate deck surfaces, exposed underlays, unsupported edges or snagging posts. Truck grounding must be checked in motion. |
| Residential service corner, IMG_8655–56 | The utility pole intersects the composition of a small framed service enclosure and its contents; a planter crowds the corner; repeated pointed weeds fringe the gutter. | Locate this actual lot in the audit harness before changing it. Inspect lot dressing, utility pole clearance, gutter and route ownership. | Each object has a recorded owner/purpose and fits the service area without obstructing access, clipping the pole or spilling onto the lane. Keep the utility network connected. |
| Ganaha/Heights frontage, IMG_8657 | Laundry frame, planters, boundary wall, gate posts and vending machines crowd a small frontage. The home-entry and Heights-mailbox prompts appear together and should be checked against their actual targets. | Heights/Ganaha site, home-directory, household and interaction data; room-arrival and enterable-sites checks. | A clear gate-to-door route, plausible laundry placement and correct prompts for the flat/building addressed. Do not infer a wrong household assignment from the image alone. |
| Coastal junction, IMG_8658 | White road-edge lines overlap/continue into crossing edges in a conspicuous rectangular pattern. The footway-to-road transition is visually abrupt. | Quarter/coast ground plans, lane-edge paint ownership and coastal connection. | Correct junction priority: one owner for every marking, clean terminations, deliberate pedestrian connection and no repeated coincident paint. |
| Planted plot, IMG_8659 | A dense thicket of thin upright/diagonal green geometry reads as scaffolding rather than a convincing cultivated bed. | Identify the plot and builder first; distinguish plants, supports and possible duplicated instances. Its crop species is not established by this image. | Readable planting rows and species-appropriate leaves/supports at pedestrian distance. Reduce redundant geometry, keep believable density and preserve the plot's narrative purpose. |
| Fighting, owner report | No supplied image shows a fight, but the owner reports it remains and current source confirms reachable systems. | src/game.js imports createHarbourFestival and createFists; src/progression/harbour-festival-view.js exposes menu, tournamentMenu, quarrel and auditStage; src/desktop/life.js offers Lose your temper and insult escalation into startQuarrel. | No playable, watchable or ambient combat in either edition, including on restored saves and through old shortcuts. |

A still cannot prove z-fighting. Treat suspected duplicated surfaces, floating bases and collision obstructions as reproduction targets until measured. The existing ground audit's empty baseline is valuable but does not certify road-paint design, vertical props, visual composition or moving-camera stability.

## Work order

### P0 — withdraw fighting completely

1. Trace all entry paths before editing: game wiring, festival menus/nearby actions, annual tournament/calendar hooks, ferry car-deck arena interactions, Linux social escalation, keyboard/touch/controller bindings, cave combat and first-person fists/weapons. Search callers as well as user-facing labels. Decide each shared helper's legitimate non-combat consumers before removal.
2. Remove active combat entry points and instantiation from web and Linux. Remove exhibitions, spectating, annual bouts, quarrels, attack controls, combat HUD, damage and combat rewards. Do not leave a hidden callable route or an edition-specific bypass. Cave exploration may remain only if it functions safely without attacks, hostile damage or a combat soft-lock; otherwise withdraw its combat-dependent entry pending a separate decision.
3. Remove insult-to-fight escalation and combat-only prompts. Preserve ordinary conversation, apologies where meaningful, relationships, resident selection, owned beds, ferry operations and peaceful festival activities. Do not delete a whole festival because some activities are combat.
4. Retire combat-only arena props, rings, signs, directory/guide claims and tutorial/control text. Preserve ferry vehicle/passenger deck geometry and working ship equipment.
5. Migrate/ignore old bout, tournament, hostility and arena-resume state safely. Retain money, possessions, relationships, travel progress and character identity. An old save in a fight must resume in a safe ordinary location with camera, controls and HUD restored; no repeated launch or save loop.
6. Remove combat modules from the delivered runtime dependency graph where they have no remaining non-combat use. Git history is sufficient archival preservation; do not ship a dormant replacement or unused fight assets. Studio-only poses or legitimate story actions may remain if isolated from gameplay.
7. Add focused regression coverage proving that menus, proximity actions, calendar events, repeated insults, keyboard/touch/controller input and restored combat saves cannot start a bout, inflict damage or award combat prizes in either edition. Update native acceptance fixtures which currently expect a four-insult fight or festival bout to expect their absence. Never disable broad acceptance to make this pass.
8. Rebuild runtime last. Verify source and generated package, service-worker/cache update, installed Linux package and public documentation agree. Inspect the latest releases before assigning a new version; do not overwrite an existing tag or asset. Main source changes do not update an installed binary.

**P0 acceptance:** fresh and retained saves in web/Linux; all former fight launch routes tested; no combat UI, fists, hostile simulation or combat-only payload in the ordinary build; normal movement, dialogue, dining, ferry travel and saves continue to work. Report separately what is implemented, merged, deployed and released.

### P1 — Sakura black opening

The 20 October decision explicitly requested stairs leading into darkness with a fade, not physically traversable stairs. Preserve that behaviour. The present dark volumes are actual black box meshes using an unlit material; the photograph is consistent with an overexposed volume boundary, but dimensions/occlusion need reproduction.

Record stockroom camera coordinates and identify which faces are visible. Bound the opening with the stockroom's actual walls/soffit, recess darkness beyond a small visible first run, and prevent its boxes escaping into the shop. Do not fix it by switching off darkness globally, adding an unrelated light, or restoring a traversable multi-storey staircase. Check forward/side/low and third-person views, both travel directions, fade timings, shelves and NPC clearance, upstairs arrival and inside-only fire exit.

**Acceptance:** no giant black wall or roof-like slab in the stockroom; a readable stair entrance; safe up/down transitions; no external office entry; no clipping or new flicker.

### P1 — banners, poles and docks

Survey every flag/banner assembly: grounded stand or bracket, plausible dimensions, attached cloth/crossbar, separate solid geometry, clear door/camera/NPC routes. Use measured avatar-envelope clearance with a practical pedestrian corridor (target 1 m where space permits), rather than moving a pole until a screenshot looks acceptable.

Walk the main quay, passenger landing, cargo apron, outer piers and ferry gangway. Compare deck heights, joints, coping, railing ends, signpost bases, stairs and collisions. Inspect the truck's wheels against ground throughout its route; still images alone do not prove a height error.

Fix ground through the existing rulebook/plans/generators. Keep tests/fixtures/ground-baseline.json empty. Remove overlapping ownership rather than masking it with polygon offsets. Do not move or remove operational rails/gangways without preserving safe arrival and departure.

**Acceptance:** grounded posts, no doorway obstruction, coherent quay joins and marking terminations, traversable docks and safe spawns, no vehicle/deck intersection, no flicker during a slow moving-camera sweep.

### P2 — residential edges, junction and planting

Resolve the exact photographed lots in the live scene. Consolidate utility/service dressing, clear gates and gutters, correct prompt targeting only if reproduction confirms a mismatch, and replace repetitive pointed verge geometry with restrained site-appropriate planting. Fix the coastal junction's paint in the source plan. Rebuild the planted bed with readable rows, supports and foliage; inspect draw calls and aliasing before/after instead of adding more thin geometry.

**Acceptance:** no prop intersections or inaccessible door; mailbox and home prompts identify the correct targets; coherent edge treatments; plausible planting at walking distance; no measurable performance regression in the same view.

## Verification and delivery gates

For each visual item record edition, source/runtime revision, viewport, camera coordinates/yaw/pitch, town time, weather, location and fresh/retained save status. Capture the nine owner's viewpoints before and after, plus close-ups and slow camera sweeps. Use 390×844 portrait as a required browser viewport and desktop/Linux 1280×800; also check landscape and first-/third-person views. Browser emulation is not physical iPhone Safari acceptance.

Run focused suites appropriate to the changed files, including existing ground-standard, enterable-sites, runtime-package and collision/z-fighting checks, then the World CI guard. The z-fighting suite may need NODE_OPTIONS=--max-old-space-size=6144 on Node 22; run memory-heavy checks alone. For runtime changes use npm run build:runtime and node --test tests/runtime-package.test.mjs from johansson-town. For Linux run the desktop tests and full applicable console/offline/native acceptance against the actual package.

The ground audit must remain at zero. Use existing safe-spawn requirements: clear of rails, hull and gangway; room to move a metre in two directions; reachable street. Do not weaken assertions, rebaseline findings or lower graphics quality to pass.

Inspect screenshots before sending them to the owner. Visual changes require owner review of before/after photographs under the existing handover rules. Open separate focused PRs: (1) fighting withdrawal, (2) Sakura opening, (3) banners/docks/markings, (4) residential dressing/planting. Do not merge without the owner's instruction. Recheck main for concurrent work before each change.

## Future fighting mode — deferred, not authorised for this build

The owner names Virtua Fighter and Tekken as quality references and wants fighting costumes. Return only through a separately approved design and prototype: deliberate entry into a dedicated match, original character-appropriate fighting outfits, stance/footwork and facing, readable attack/guard/recovery timing, grounded feet, convincing hand/foot contact, hit reactions, camera framing, balanced rules and keyboard/controller support. Preserve Johansson World's own cast and visual style; do not copy either reference's assets.

Do not reinstate random street fights or insult escalation. Keep ordinary town life peaceful while the new mode is absent. This section records direction, not a promise to implement a combat system now.

## Handover status and next action

- Changed in this task: this evidence register and recovery plan; root handover index links to it.
- Source inspected: instructions and linked handovers; ground standard; game imports/transition wiring; Sakura stair mesh definitions; festival view and Linux social fight entry paths.
- Checks performed: document/source inspection and screenshot review only. No game tests, moving-camera capture, physical-device test, binary inspection or release publication was performed.
- Current release information was read from the Linux handover (0.2.16 there); it was not independently revalidated as the latest release in this documentation task.
- Next agent: first verify current branch/PR/release state, then implement P0 fighting withdrawal. Update this note with exact commits/PRs, actual checks and remaining limits. The owner must not be left believing the present build is already combat-free.
