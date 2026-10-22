# Sakura audit/replan handover - 22 October 2026

## Owner request and authority

The owner is unhappy with Sakura and its office, wants a CAD audit against Tomato Konbini in New Yokosuka, and is considering removing the upper floor and moving the office to the ferry terminal. They explicitly ask questions to avoid breaking the game. **This authorises audit and proposals, not demolition, relocation, altered shop size, changed staff schedules or save migration.** Existing inside-only/fade instructions remain active until a replan is agreed.

Review: [draft PR #366](https://github.com/nj22az/nj22az.github.io/pull/366), audit commit eaf87fef48cf546ccf232c89df1a37c768d065b7. Not merged.

## Work completed

Branch `codex/sakura-audit-cad`, based on main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`; separate from stair repair PR #364. Read root/directory instructions and latest linked handovers, source geometry/access and New Yokosuka research. Current DCBN collision metadata was checked on the source repository. PR #362 is concurrent staffing/trade work and must be considered before future implementation.

[Audit, four-sheet PDF, layered DXF, source measurements and drawing generator](../docs/qa/sakura-audit/README.md).

Confirmed: ground polygon 138.75 m2; small office 5.92 m2; upstairs office 22.88 m2; upper room envelope 128.64 m2, not just an office. Terminal exterior waiting hall 29.93 m2 versus interior builder 63 m2; existing Harbour Office and upper records shell cannot be treated as vacant. See the audit for reference/measurement distinctions.

## Owner answers - confirmed in this conversation

1. Retain the current approximately 139 m2 ground footprint, including the existing street frontage.
2. The terminal office is for **Johansson's ferry and engineering work**, not Sakura trade administration.
3. Keep **all four selected functions at Sakura**: daily desk and secure cash, tea/meal-break corner, dedicated lie-down/rest room, bulk stock and archives.

These requirements supersede the 54 m2 shrink and Sakura Trading terminal-suite suggestion. They authorise revising the plan, not demolition or an untested in-game move.

Revision B drawings retain the existing ground polygon, front/till/shift-office/WC anchors. The 32.262 m2 rear block is zoned for rest 7.924, access 3.396, tea 6.226 and stock/archive 14.716 m2 (gross, partition thickness not deducted). All requested functions stay at Sakura. The terminal's illustrative 15 m2 suite now serves engineering; preserve separate harbour staff, records, ticketing and post services.

**Capacity gate:** the old upper stores are larger than the proposed ground stock/archive zone. No claim that existing quantities fit. Inventory and shelf-volume checks, delivery and avatar/camera routes, office fitting and saves must pass before removing upstairs. Retain upper storage at Sakura if required; no off-site stock relocation is authorised.

## Verification and state

Rev B: rear zones sum exactly to 32.262 m2 and proposed furniture envelopes remain inside their zones. CAD R2010 reopened, metre units verified, ezdxf audit zero errors. Four-page A3 PDF reopened/text checked, rendered and visually inspected. No game/runtime/save/schedule change; no gameplay tests or physical-device acceptance claimed. Drawing envelopes are not construction wall/door plans; proposed access, fixtures, camera and routes remain unvalidated.

## Next

Use the confirmed constraints above. Complete an inventory/storage-capacity audit and a full-size greybox before building removal: shop support rooms, delivery door/route, secure cash fitting, lie-down access and the terminal engineering suite. Then test actual avatars, first-/third-person camera, shop/terminal service, schedules and saves. Do not re-ask the three answered questions. Upper-floor removal and the detailed layouts remain proposals until reviewed. Keep PR #364 separate; do not merge planning notes as if they implement the changes.
