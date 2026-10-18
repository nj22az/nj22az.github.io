# Sakura internal stair and night lighting

18 October 2026. The office and konbini now share one continuous two-storey
interior. Walk through the stockroom and up two flights, turning at the western
landing; walk back down the same route. The upper floor is 4.01m above the shop.
The existing outside stair still enters the office and its upper door returns to
the outside landing. There is no separate office instance when entering that way.

The western stockroom has a real ceiling opening, stepped treads, handrails,
guarded upper-floor opening and a lit turning landing. The office floor is split
around the opening. The kitchenette is moved clear of the stair arrival. Stock
racks are shortened, and cartons, bottle crates and the delivery trolley are
repositioned. Sales aisles, till, goods capacities and delivery entrance remain.

Office fixtures have steady fluorescent diffusers; the existing shop hemisphere
fill remains on throughout the night. The stair bulkhead also remains visible.
No point lights, shadow maps, downloaded models or framebuffer allocations are
added. The upper windows use the existing live street renderer with the upper
floor and local origin accounted for. Upstairs occupants do not block people on
the shop floor at the same horizontal position.

## Verification

Local checks cover walking both stair flights in both directions at normal player
radius, standing headroom, shifted seat coordinates, lit fixtures, shop business,
restocking, existing resident homes and the runtime build. The compiled graph gains
one small shared house-walk helper chunk; the packaging bound increases from 35
to 36 manifest entries for this measured reason.

`tools/sakura-stairs-smoke.mjs` replays forward movement through the actual game
physics up and down the stairs. It captures the office in daylight and after
midnight, plus the stair at night; it checks image content, lighting fixtures,
full postprocessing, GPU errors and outside-door entry. Results are recorded in
`docs/qa/sakura-internal-stairs/` after verification. Physical iPhone Safari
testing remains unavailable; Linux WebKit is not a physical-phone benchmark.
