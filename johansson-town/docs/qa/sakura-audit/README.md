# Sakura audit and measured CAD plans - 22 October 2026

Owner request: audit Sakura and the office against Tomato Konbini in New Yokosuka; consider removing Sakura's upper floor and relocating office functions to the ferry terminal; ask questions before breaking existing functions.

## Deliverables

- `Sakura-Audit-and-Options.pdf`: four A3 landscape sheets. Existing digital ground/upper plans, a compact-shop zoning option, terminal constraints/possible office allocation, audit and safe change sequence.
- `Sakura-Measured-Plans-and-Concept.dxf`: layered R2010 CAD, one drawing unit = one metre. Existing plans and proposed zones are separated spatially and by layer. Dimension entities included. Text and selected fixture envelopes are editable. This is a digital zoning/fixture audit, not a construction survey or complete detailed wall/door schedule.
- `measurements.json`: constants exported from current source, for traceability.
- `build_drawings.py`: original drawing generator (ReportLab + ezdxf), not game code.

## Findings

1. Sakura's ground-floor polygon is **138.75 m2**. Its front block is 106.49 m2 including the small office and WC, so it must not be described as net retail area. The retained New Yokosuka study records Tomato's entire shell as **8.03 x 4.23 m, about 34 m2**, ceiling 2.41 m. Sakura's full ground envelope is about four times that shell; the programs are not identical.
2. There are **two offices**: a 5.92 m2 shift office and a 22.88 m2 upstairs main office. The upper room envelope is 128.64 m2 and also includes rest space, hall, archive and decoration stores. Removing the upper floor is a program/ownership change, not just a stair deletion.
3. The terminal is not spare space. Its exterior waiting hall is **4.1 x 7.3 m (29.93 m2)**, whereas its interior builder is **9 x 7 m (63 m2)** before insets. The separate Harbour Office interior is 6.74 x 6.74 m. The exterior upper records shell is 6.7 x 6.9 m, with no matching enterable upper-room builder found in the inspected access chain. Reconcile these coordinate frames and service allocations before choosing a new office location.
4. The upstairs archive, decoration stores, tea point, rest room, safe, files, window portals, fire escape and site identity all have dependencies. Keep daily shift accounts and security near the shop. Relocating bulk stock to the existing Sakura Trading depot is only a candidate until its capacity/routes are checked.
5. PR #362 proposes changes to staff, Saturday hours and Sakura's trade; PR #364 repairs the stair but remains unmerged. Neither is evidence that a replan is already approved. Coordinate all three scopes before implementation.

## Recommendation - not an owner decision

A compact single-storey Sakura is a stronger route towards Tomato's spatial economy than keeping the oversized front block and merely removing its upstairs. Suggested discussion target: **9 x 6 m / 54 m2 total**, including 36 m2 gross retail and 18 m2 support. Keep original Sakura identities, character, products and merchandising. A separate approximately 15 m2 Sakura Trading administration suite could fit within a revised terminal upper-floor allocation, subject to access, harbour records, room/exterior reconciliation and explicit owner approval.

Lower-risk alternative: retain Sakura's current frontage/door anchors, remove or repurpose the upper programme, then plan a later shop shrink. This addresses excessive complexity but does not achieve the reference scale by itself. Never shrink avatars or fixtures to force a room to work.

## Decisions requested

- Intended total shop size / willingness to revise the frontage and street parcel.
- Who the relocated office serves: Sakura trade, harbour/ferry administration, or a shared function.
- Staff rest provision: tea/break corner, lie-down room, or retirement of dedicated rest facilities.

## Sources and validation limits

Audited main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`: `src/world/interiors/{sakura-layout,sakura-shell,sakura-small-office,sakura-office-room,port-hall}.js`, `src/world/{port-building,supplied-rooms,thuan-flat}.js`, game stair/access wiring, related research and handovers. The source authority is current geometry/data, not older shop-plan aspirations.

Reference study: [New Yokosuka measured lessons](../../research/new-yokosuka-lessons.md), dated 19 October; current [DCBN collision metadata](https://github.com/brynnb/new-yokosuka/blob/main/public/data/native-collisions/DCBN.json) was independently read through GitHub. The 8.03 x 4.23 m shell measurement is the recorded prior model study, not a new measurement in this audit. No Shenmue models, textures, logos or New Yokosuka code were copied.

Checks: source constants exported; CAD reopened and ezdxf audit reported zero errors; CAD unit checked as metres; PDF four A3 pages reopened/text checked, rendered and visually inspected. Proposed layouts are not collision/camera/NPC tested. No new physical-device walkthrough was performed. No game/runtime/save changes and no gameplay tests claimed.
