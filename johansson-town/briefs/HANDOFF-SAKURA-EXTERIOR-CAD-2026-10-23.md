# Sakura exterior-led CAD - 23 October 2026, Rev D

## Current owner decision - supersedes Rev C

The owner explicitly requires a **single-storey konbini**, using the whole rectangular exterior box. Remove the large interior staircase and occupied second floor. Move the toilet into the storage room. Provide only a small staircase to the roof for the water tank and fire escape.

This is a CAD-first revision. It changes the proposed design and supersedes Rev C's retained upper floor; it does not implement demolition or game changes. The previous physical-stair repair PR #364 is not the target architecture of this replacement. Do not restore upstairs shop functions from older notes after this design is accepted.

## Review branch and history

Branch `codex/sakura-exterior-led-cad`; [draft PR #373](https://github.com/nj22az/nj22az.github.io/pull/373), unmerged. Rev C and its handover/index were recorded through `a6df84fe90fc87dae97152574136aa7365b007eb`; its upper-floor retention and stepped interior floor are superseded by this owner revision. Original exterior source was main `e15be1738e2e68c1f1ba323b9992dc89661751f4`.

Earlier research and concurrent context: open planning PR #366, stair repair #364 and alcohol consolidation #363. Read their verified state before future implementation. The owner's current single-storey decision overrides contradictory proposed upper-floor arrangements.

Rev D drawing/source changes are recorded through `b261c199cca45e19751dfc42c3fab24aa6f7723b`. This handover records the completed checks for those files.

## Rev D drawing

- Fixed exterior guide: 14,260 x 11,000 mm nominal span. A proposed 180 mm perimeter allowance gives a full rectangular clear floor of 13,900 x 10,640 mm = 147.896 m2 before internal partitions. This is a new proposed fit within the box, not a measurement of the old imported stepped floor. Register this allowance and all coordinates against the actual exterior mesh before modelling.
- No internal stair and no occupied upper floor. Remove the former upper office-storey walls/windows in the future replacement. The roof deck remains at approximately 4,010 mm, preserving the lower building/signboard height; proposed sales ceiling 2,700 mm.
- Three short 900 x 2,700 mm gondolas, 1,400 mm high. Main aisles 1,430 / 1,600 / 1,800 mm. Fresh food near the front, drinks at the rear and queue beside the low till. Counter 780 mm; staff aisle 1,230 mm.
- Full-width rear stockroom replaces the old stair/recess arrangement. WC 1,800 x 1,940 mm clear, entered through a small hygiene lobby entirely from the stockroom. No toilet door opens onto the sales floor. Separate hygiene provision stays at the service worktop.
- All earlier requested support functions remain at Sakura on the ground floor: daily desk and secure cash, tea/meal corner, dedicated futon rest room, stock/archive/decorations. Capacity remains subject to quantities and shelf-volume checks; no stock is moved elsewhere.
- Compact **external rear** steel stair, 4,050 x 1,920 mm, two 900 mm clear flights, 20 risers x 200.5 mm and 250 mm goings. It reaches only the roof. The overhead return bridge is dashed in plan; guarded entry and edge protection are shown. It projects beyond the shop box, so lane/site clearance and ground access must be checked before implementation.
- Roof tank is a placeholder cylinder 1,200 mm diameter x 1,200 mm high on a 200 mm curb with a 1,200 mm service ring. Roof is for maintenance and escape only, never an upstairs shop or office.

## Deliverables and validation

Three A3 landscape PDF sheets: ground plan; roof plan/elevation/counter detail; fixture and space schedule. Editable R2010 DXF in millimetres, layout JSON, reproducible ReportLab/ezdxf generator and checks accompany the review.

Checks actually run: reopened DXF, zero audit errors/fixes, millimetre units; 147.896 m2 full rectangle calculated; all 18 scheduled fixture envelopes inside the rectangle with no pairwise overlaps. Three PDF pages reopened and text checked; all rendered and visually inspected. Rest-room label placement and roof-plan/elevation separation were corrected. No game/runtime/save/schedule/build changes; no NPC/camera, inventory-capacity, physical-device or roof-site acceptance claimed.

New Yokosuka is merchandising/proportion guidance via the inherited 19 October repository study, not the footprint authority. The previous session's live viewer catalogue did not populate; no fresh model measurement is claimed. No reference assets or code copied.

## Next concrete action

Review Rev D, then create a 1:1 single-storey greybox against the existing exterior mesh. Check actual Thuan rig/reach, shelves, private rest/office access, WC lobby, shopper and trolley routes, all storage quantities, tank space and external rear stair against the town lane. Remove upstairs entry prompts and safely migrate old upstairs saves when implementing. Keep ordinary shop operation and deliveries intact. No merge or deployment is part of the CAD revision.
