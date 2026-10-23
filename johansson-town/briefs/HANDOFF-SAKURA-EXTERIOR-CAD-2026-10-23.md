# Sakura exterior-led CAD - 23 October 2026, Rev C

## Authority and scope

Owner: make a new CAD first, using the existing exterior as the guideline, with New Yokosuka's Tomato store as inspiration and realistic proportions for Thuan's work. The owner repeated the exterior constraint during preparation. This delivery is a proposed interior layout, not a game implementation or permission to change the exterior.

## State checked

Main inspected at `e15be1738e2e68c1f1ba323b9992dc89661751f4`. Read root and World instructions, HANDOVER.md and the 21/22 October World handovers. Read the more recent unmerged Sakura replan handover on PR #366 at `0d6e756993273ac4c6e2dba7ea58a166a9e811bb`. #366 remains open/draft; #364 complete stair remains open/draft at `cb262811775a58890ba1cd84e76ba833a875b05c`; #363 alcohol consolidation remains open at `7d586c8a731b511f80e3ad182bd0e3b1ed4d2087`. Do not mistake those plans or branches for main.

## Review branch

Delivery branch: `codex/sakura-exterior-led-cad`; [draft PR #373](https://github.com/nj22az/nj22az.github.io/pull/373). Drawing/source commits `6082bbad9f4282ae8908f5ce3cfb63fa59fba048` through `d7109a2df0edcaa4fb8b957dd67c7977396bd4d6`; handover/index through `6c99728c92749edfcedad82b6e45dacc64582770`. Open draft, not merged or deployed. The PDF and complete review package were delivered alongside the PR; the repository stores the reproducible source and editable DXF.

## Drawing basis and decisions

- Existing exterior is the controlling envelope. Live `harbour.js` passes the 14.26 x 11.00 m nominal span to `storefront.js`; the central front door is 1.90 m and the rear delivery door is 0.90 m right of its axis. Nominal span excludes projecting wall skins/eaves. The heavy rectangle in the drawing is aligned around the inset source floor for conservative fit comparison; it is not a fresh world-space mesh survey.
- Retain the source stepped 138.75 m2 floor within that exterior. Do not enlarge the building to accommodate imported interior geometry.
- Rebuild shop fittings: three 900 x 2,700 mm gondolas, 1,400 mm high; 1,430 / 1,600 / 1,800 mm principal aisles; 780 mm checkout; 1,230 mm staff aisle. These are proposed dimensions, not measured Tomato dimensions.
- Fresh food near the front; drinks at the rear; three queue spots off the entrance axis; magazine rack, copier/fax, baskets and flowers given defined places.
- Receiving, backstock, WC and a shift office with secure cash stay at Sakura. Upper floor and its tea corner, dedicated rest room, archive and decoration storage stay. No demolition or off-site stock relocation. This preserves the confirmed support requirements in #366 while replacing its ground-floor-only zoning as this candidate's approach.
- Draw both flights and the return/top landings of a complete U-stair: 24 risers over 4,010 mm, 250 mm goings, 1,100 mm flights. Retain fade transitions as an implementation option; do not use a black panel to truncate geometry.
- Coordinate any #363 trade consolidation and its stock quantities before implementation. Existing main staffing/hours are not changed here.

## Deliverables and checks

Three A3 PDF sheets (ground plan, counter/stair sections, fixture/operating schedule), editable R2010 millimetre DXF, layout JSON, source generator and check record. The source package accompanies the review. Reproduce the PDF/DXF with Python `reportlab` and `ezdxf` by running `build_sakura_cad.py` in the drawing directory.

Checks actually run: DXF reopened with millimetre units and zero ezdxf audit errors or fixes; 138.75 m2 polygon area calculated; all 16 scheduled fixture corners fit the stepped floor; their floor envelopes do not overlap; PDF reopened as three A3 landscape pages, text extracted, all pages rendered and visually reviewed. Counter/stair sheet was corrected after the first visual inspection. No game/runtime/save/schedule files changed. No gameplay, camera, inventory-capacity or physical-device acceptance is claimed.

New Yokosuka's live asset-viewer page opened, but its model catalogue did not populate. The numerical reference is the existing 19 October repository study `docs/research/new-yokosuka-lessons.md`: DCBN shell 8.03 x 4.23 m, ceiling 2.41 m, near-door counter and window magazine rack. It is inherited research, not a fresh measurement. No reference assets or code were copied.

## Next action

Review this CAD candidate, then make a 1:1 greybox against the actual exterior mesh and register the two coordinate frames. Check the real Thuan rig at the till, hot case, microwave and each shelf. Keep routine hand contact within the proposed 350 mm working reach; it is not yet rig-validated. Verify queue and trolley paths, cooling-door/lid clearance, stock/archive/decor capacity, upstairs stair alignment and headroom, inside-only access and escape. Retain all existing saves and shop services. No merge or live rebuild is part of the CAD-first request.
