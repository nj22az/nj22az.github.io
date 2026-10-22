# Sakura audit and measured CAD plans - 22 October 2026

Owner request: audit Sakura and the office against Tomato Konbini in New Yokosuka; consider removing Sakura's upper floor and relocating office functions to the ferry terminal; ask questions before breaking existing functions.

## Deliverables

- `Sakura-Audit-and-Options.pdf`: four A3 landscape sheets. Existing digital ground/upper plans, a retained-footprint ground-floor zoning proposal (Rev B), terminal constraints/possible office allocation, audit and safe change sequence.
- `Sakura-Measured-Plans-and-Concept.dxf`: layered R2010 CAD, one drawing unit = one metre. Existing plans and proposed zones are separated spatially and by layer. Dimension entities included. Text and selected fixture envelopes are editable. This is a digital zoning/fixture audit, not a construction survey or complete detailed wall/door schedule.
- `measurements.json`: constants exported from current source, for traceability.
- `build_drawings.py`: original drawing generator (ReportLab + ezdxf), not game code.

## Findings

1. Sakura's ground-floor polygon is **138.75 m2**. Its front block is 106.49 m2 including the small office and WC, so it must not be described as net retail area. The retained New Yokosuka study records Tomato's entire shell as **8.03 x 4.23 m, about 34 m2**, ceiling 2.41 m. Sakura's full ground envelope is about four times that shell; the programs are not identical.
2. There are **two offices**: a 5.92 m2 shift office and a 22.88 m2 upstairs main office. The upper room envelope is 128.64 m2 and also includes rest space, hall, archive and decoration stores. Removing the upper floor is a program/ownership change, not just a stair deletion.
3. The terminal is not spare space. Its exterior waiting hall is **4.1 x 7.3 m (29.93 m2)**, whereas its interior builder is **9 x 7 m (63 m2)** before insets. The separate Harbour Office interior is 6.74 x 6.74 m. The exterior upper records shell is 6.7 x 6.9 m, with no matching enterable upper-room builder found in the inspected access chain. Reconcile these coordinate frames and service allocations before choosing a new office location.
4. The upstairs archive, decoration stores, tea point, rest room, safe, files, window portals, fire escape and site identity all have dependencies. Keep daily shift accounts and security near the shop. The owner now requires stock and archives to remain at Sakura; no depot or terminal relocation is part of Rev B.
5. PR #362 proposes changes to staff, Saturday hours and Sakura's trade; PR #364 repairs the stair but remains unmerged. Neither is evidence that a replan is already approved. Coordinate all three scopes before implementation.

## Owner decisions - confirmed

- Retain the current approximately **139 m2 ground footprint** (138.75 m2 source polygon).
- The proposed terminal office serves **Johansson's ferry and engineering work**. It is not a relocated Sakura administration suite. Sakura's accounts and secure cash remain at the shop.
- Keep **all four selected functions at Sakura itself**: daily desk and secure cash, tea/meal-break corner, dedicated lie-down/rest room, bulk stock and archive storage.

These decisions supersede the earlier 54 m2 shop and Sakura Trading terminal-suite proposal. Tomato remains a reference for atmosphere, shelf density, clear merchandising and a believable small-town shop. Its footprint is not the new size target.

## Revised ground-floor zoning - proposal, not implemented

Use the same ground polygon and retain the front door, frontage, retail/till anchors, shift-office zone and WC. Reuse the 32.262 m2 rear block as follows (gross zones before partition thickness):

| Function | Gross area | Treatment |
| --- | ---: | --- |
| Lie-down/rest room | 7.924 m2 | 2.8 x 2.83 m room; indicative 2 x 1 m futon envelope |
| Staff access | 3.396 m2 | 1.2 m wide access zone |
| Tea and meal breaks | 6.226 m2 | Counter and compact table, proposed furniture envelopes |
| Bulk stock and archive | 14.716 m2 | Retain all storage functions on site; delivery route left through the shelf arrangement |
| Shift office | Existing 5.92 m2 | Keep daily desk and secure cash beside the till; safe/desk fit still needs a full-size mock-up |

`layout-proposal.json` records the owner constraints, zone coordinates, proposed openings and indicative furniture. Zones total the rear-block area exactly; furniture was checked to remain within assigned zones. Those checks do not establish player/NPC/camera clearance or inventory capacity. Door markers overlay the zoning envelopes; these are not detailed construction wall plans.

The proposed terminal suite is for maintenance planning, drawings, manuals and engineering records. Its approximately 15 m2 allocation remains illustrative. First reconcile the terminal exterior/interior mismatch, confirm access and preserve the existing Harbour Office, harbour records, ticketing, post/parcels and crew operations.

## Upper-floor removal gate

The owner is considering upper-floor removal; no demolition or in-game relocation is implemented or inferred from the questionnaire answers. The current upstairs stores provide much more area than the proposed ground store. Audit actual stock, decorations, archive quantities, shelf volume and delivery clearance before retiring them. If ground capacity is insufficient, keep necessary upper storage **at Sakura** and revise the building proposal; do not silently move it to the depot or terminal. Preserve the rest room and other selected functions in either arrangement.

Next: inventory/capacity audit and a full-size greybox for the ground support rooms and terminal engineering office, followed by shop/terminal service, save and camera tests. PR #364 remains a separate stair repair until the owner agrees whether it is interim work or superseded. No game/runtime/save changes are part of this planning update.

## Sources and validation limits

Audited main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`: `src/world/interiors/{sakura-layout,sakura-shell,sakura-small-office,sakura-office-room,port-hall}.js`, `src/world/{port-building,supplied-rooms,thuan-flat}.js`, game stair/access wiring, related research and handovers. The source authority is current geometry/data, not older shop-plan aspirations.

Reference study: [New Yokosuka measured lessons](../../research/new-yokosuka-lessons.md), dated 19 October; current [DCBN collision metadata](https://github.com/brynnb/new-yokosuka/blob/main/public/data/native-collisions/DCBN.json) was independently read through GitHub. The 8.03 x 4.23 m shell measurement is the recorded prior model study, not a new measurement in this audit. No Shenmue models, textures, logos or New Yokosuka code were copied.

Revision B checks: rear-zone areas sum to 32.262 m2; proposed fixture envelopes remain inside their zones; source constants exported; CAD reopened and ezdxf audit reported zero errors; CAD unit checked as metres; PDF four A3 pages reopened/text checked, rendered and visually inspected. Proposed layouts are not collision/camera/NPC tested. No new physical-device walkthrough was performed. No game/runtime/save changes and no gameplay tests claimed.
