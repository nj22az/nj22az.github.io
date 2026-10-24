# Sakura retained architecture - 24 October 2026

The owner's 20:07 reversal wins: retain upstairs office, kitchenette and staff rest accommodation. Do not merge the
single-storey architecture from draft PRs 378/384/385. They were inspected as open/draft/unmerged.

## Delivered for visual review

Studio `nj22az/jojo`, branch `pixar`, `3d/sakura/`:
- `PLAN.md` and `progress.md` rewritten so operative steps no longer construct the superseded single-storey specification.
- `cad/Sakura-Retained-Architecture-F1.pdf`: six A3 sheets: comparison, ground floor, upper floor, four elevations,
  stair/structure sections, audit limits.
- Matching editable DXF and JSON; reproducible `cad/build_review.py`; `cad/audit.json`; `checks.md` and `sources/task.md`.

Source comparison preserves World's upper office 5650×4050, staff rest2800×2850 gross, kitchenette, downstairs shift
2,160×2,740 office, WC, receiving and inside-only stairs. Exactly two office outlookportals; rear daylight glazing remains.
F1 corrects independent scene registration: upper rooms shift 950 rearward to visible exterior setback, decorations store
shortens 950 to clear the complete stair opening, upper head redrawn. Nominal retainedWorld footprint is 14,260×11,000;
old prototype's offset shell is not substituted for it. Physical Blender stair proposes 22 rises / 280 going / 1100 turn / 
1200 head; World keeps its existing 24-riser symbolic fade passage.

Fixture proposal: three 3100-long gondolas, 3000 counter, 4800 west chiller, 3100 freezer; eight-door 5200×800 reach-in cabinets
in place of the proposed rear-loaded walk-in. This relinquishes rear loading to preserve cross-stockroom access.
Counter props and 780-unit stock counts cannot simply be copied: recompute schedules after shorter fixtures.

## Checks and limitations

Generator final run: 208 envelope/arithmetic checks pass,0 fail, 5 unresolved construction gates. DXF units mm, reopened
without audit errors. All six PDF pages visually inspected. Separate reviewer found stair/landing/void/route/frame defects,
corrected before delivery. These are review drawing checks, not game/Blender/structural capacity acceptance.

Open: structural capacity and full load paths, refrigeration sizing/services, complete props/stock capacity, detailed moving
door envelopes, clay registration, actual mesh duplicates/coplanarity and frame-by-frame cast contacts. Owner visual approval
of the whole architecture is not recorded. Refrigeration choice is approved below. Full replacement Blender environment remains unbuilt.

## Branches and next action

World `development`: this documentation only; existing runtime prototype untouched. Studio `pixar`: revised CAD and plan.
No branch created/deleted/renamed; no main change or deployment. Do not start Monday by blindly building PR #385.
Show F1 for visual review, incorporate owner comments, close technical holds, then clay build both floors/stair together.

See corrected Studio plan: https://github.com/nj22az/jojo/blob/pixar/3d/sakura/PLAN.md
Checks: https://github.com/nj22az/jojo/blob/pixar/3d/sakura/checks.md

Studio delivery commit: `7157cd7109e32773d7ed264f04c95f6a44fa8f51`. This World commit contains documentation only.

## Owner refrigeration decision - 24 October 2026

"Use the proposed reach-in cabinets". The eight-door 5200 × 800 × 2400 mm bank proceeds to detailed design. The walk-in alternative is no longer an open owner choice. Keep the upstairs office/rest room and all protected receiving/stair routes. Next: door sweeps, maintenance and ventilation access, product capacity, electrical/heat-rejection/condensate coordination. This decision covers the refrigeration arrangement only; other visual and technical gates remain.

Recorded in Studio `pixar` commit `389cbde4e3eedbd820cd759b65c5c76804324c6a` (plan, progress, CAD JSON and generator). Metadata/documentation only; generator syntax checked. No geometry or runtime change, construction or publication.
