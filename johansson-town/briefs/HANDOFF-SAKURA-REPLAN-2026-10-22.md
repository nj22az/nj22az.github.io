# Sakura audit/replan handover - 22 October 2026

## Owner request and authority

The owner is unhappy with Sakura and its office, wants a CAD audit against Tomato Konbini in New Yokosuka, and is considering removing the upper floor and moving the office to the ferry terminal. They explicitly ask questions to avoid breaking the game. **This authorises audit and proposals, not demolition, relocation, altered shop size, changed staff schedules or save migration.** Existing inside-only/fade instructions remain active until a replan is agreed.

## Work completed

Branch `codex/sakura-audit-cad`, based on main `a0fb347ced9250b2e5a6210ba068bf595a7ca310`; separate from stair repair PR #364. Read root/directory instructions and latest linked handovers, source geometry/access and New Yokosuka research. Current DCBN collision metadata was checked on the source repository. PR #362 is concurrent staffing/trade work and must be considered before future implementation.

[Audit, four-sheet PDF, layered DXF, source measurements and drawing generator](../docs/qa/sakura-audit/README.md).

Confirmed: ground polygon 138.75 m2; small office 5.92 m2; upstairs office 22.88 m2; upper room envelope 128.64 m2, not just an office. Terminal exterior waiting hall 29.93 m2 versus interior builder 63 m2; existing Harbour Office and upper records shell cannot be treated as vacant. See the audit for reference/measurement distinctions.

Suggested direction, not approved: compact single-storey Sakura with a retained shift desk, plus a separately identified Sakura Trading admin suite in a reconciled terminal plan. Proposed 54 m2 shop and 15 m2 suite are discussion sizes, not accepted layouts. The rest room, archives and decoration storage require explicit decisions/destinations. Preserve harbour staff, ticket/post functions, ferry operations, purchases, shelves and save identities.

## Verification and state

CAD R2010 reopened, metre units verified, ezdxf audit zero errors. Four-page A3 PDF reopened/text checked, rendered and visually inspected. No game/runtime/save/schedule change; no gameplay tests or physical-device acceptance claimed. Drawing envelopes are not construction wall/door plans; proposed access, fixtures, camera and routes remain unvalidated.

## Next / questions

Ask the owner about total shop size and frontage change, whom the terminal office serves, and staff rest provision. Carry their answers into one source-backed exterior/interior/access plan before implementation. Keep PR #364 separate until the owner chooses interim repair versus superseding replan. Do not merge planning notes as if they implement a building change.
