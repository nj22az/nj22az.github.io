# Shared bookshop workshop and restored harbour office

19 September 2026. Combined-building update for the peninsula layout.

Front-Row moves north to Z = 1.6, with an 8.8 × 7.4 m exterior and an
8.4 × 7.0 m interior. Its south wall is at Z = −3.02; Minato’s north gable
is at approximately −6.10. The passage between them is paved and connects
the west pavement to the yard. Movement checks traverse it in both the
player and NPC collision envelope.

The exterior is a new single-storey wooden building: horizontal cedar plank
walls, exposed timber posts and beams, closed timber gables and one tiled
roof. Book and repair displays flank its single entrance beneath a combined
Front-Row Books & Workshop sign. The separate repair workshop exterior is
removed. Both activities share one room, without another interior transition.

Books, the evening press, Form 3D, StepWise, radio repairs and Star Port
share the Front-Row entrance. All 18 existing content objects remain
available across the combined shop and office. Historical workshop visits
and destinations resolve to Front-Row in this layout; inventory and print
jobs keep their existing identifiers.

| Building | Existing staff |
| --- | --- |
| Front-Row Books & Workshop | Aya, Reiko, Kenji, Tetsuo |
| Johansson Harbour Office | Harbour master |
| Harbour Warehouse | Mrs Sato |
| Sakura Shōten | Thuan |
| Minato Izakaya | Nao |

Officer Mori retains his patrol and the bus driver retains the terminal.
No new actors are created. Staff use the existing shifts and shopping
errands. The disabled ramen premises are removed from peninsula routines.
Workers queue for a shared interior exit instead of blocking one another.
The office uses the existing supplied office GLB, CRT workstation, filing
binders and downloadable spreadsheets. It remains staffed overnight.

The visitor board and map destinations reflect the combined address.
Archived street layouts retain their separate workshop and bookshop.

Integrated with main at 3f15ed5, retaining the dusk lighting, garden and
Thuan's current movement and bench routines. Live workshop destinations
resolve to the combined entrance before and after world construction.

Validation: 91 focused checks pass, including complete-town door routes,
passage sweeps, four-person interior movement and departures, loaded office
staff activity, warehouse staffing, content preservation, save aliases,
printing, dusk and garden behaviour, Thuan’s bench/return-to-work routine,
and runtime/source parity. The older office.test.mjs actor-count assertion
also fails on unchanged main because it expects loaded actors without
loading their models. The loaded office-workplace checks pass.
The timber exterior also passes the shared-room, frontage, roof, ground
clearance and runtime checks. The runtime has been rebuilt with the source.
The review browser cannot access the local preview (ERR_BLOCKED_BY_CLIENT),
so GPU appearance and device frame rate remain unverified.
