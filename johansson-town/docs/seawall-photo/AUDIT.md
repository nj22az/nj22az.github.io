# JW-PH-001 revision C - construction and self-audit

Owner chose option A on 25 October 2026 and requested Blender construction, implementation, screenshots and self-audit. Baseline: development d3b8050. Corrected editable CAD: design.json; review plan: cad-rev-c.svg. The original concept PDF is historical revision A.

## Corrections made before acceptance

1. **Camera side:** the original conceptual drawing used the wrong camera-right basis. The actual Blender camera exposed it. Mirror the scheme around unchanged subject Z -6.65: pier SOUTH of the bay, Z -13.2..-10.8; portrait rail Z -10.3..-4.3; aim Z -7.05. Actual game exports confirm the pier is on the right.
2. **Level and root:** existing promenade top is +0.04, not nominal zero. Pier is +0.04 with a 160 mm slab. Extend its root 350 mm landward to X -39.2, removing a gap between the original wall centre and the walkable ground. Deck, navigation and standing-height queries share the corrected plan.
3. **Retained shore:** cut both wall geometry and collider at the rail bay and entrance. Keep the 500 mm wall between them. Filter complete tetrapod envelopes across Z -14.7..-2.8 so no legs protrude through the apron or pier supports. Existing wall below the abutment stays.
4. **Coplanar end caps:** an additional 2 mm / 0.02 m2 overlap scan found that a two-sided stone material exposed back-to-back end caps against the retained wall. Use outward-facing front-side materials; the actual apron winding already points upward. The same scan now finds zero exposed overlaps above its threshold.

## Dimension and use audit

| Item | Verified result |
| --- | --- |
| Pier | 16 m seaward of wall centre, 16.35 m including landward root, 2.4 m overall width; closed sides and end |
| Supports | Eight bents, two 250 mm piles each, crossheads meeting slab underside; final bent 200 mm inside deck end |
| Rail bay | 6 m long; 140 mm posts at 1.5 m centres; post top +1.24; three horizontal rails; continuous barrier collider |
| Promenade | Existing 2.8 m walk retained; real collider route remains clear |
| Camera | X -35.3 / Y +1.22 / Z -6.65; square 34 degree preset; no utility pole in portrait crop |
| Subject | X -38.65 / Y +0.04 / Z -6.65; full figure and shoes inside the tested Thuận frame |
| Garden | Wall and all planting remain; 1 m camera reservation clears the west garden wall by 100 mm |
| Pedestrian access | Real radius-aware collider sampling and click-to-walk path reach the pier end and return |
| Ground | One standard-generated deck; no second Blender deck face; supports and fittings are Blender meshes |
| Mesh data | 5,594 triangles, six materials, finite positions and unit normals |
| Default world | Prototype off retains original full seawall, boundaries and armour |

## Visual and interaction evidence

Six compiled-game views cover overview, entrance, bay, Thuận square portrait, studio controls and tablet-sized entrance. Browser reports record zero page errors. The clean saved photograph is the actual 1200 x 1200 PNG export, with the editor's yellow selection ring removed by the existing export path. Capture succeeds and Photo Studio returns the player to the original position and facing.

The reference dress, shawl and straw hat have not been authored as new wardrobe assets. The screenshot uses Thuận's existing shared character and clothes. The stage and camera preset remain editable.

## Validation and limits

- Focused geometry/navigation/material-overlap checks and runtime packaging: 10/10 passed after the front-side correction.
- The final full guard log is saved alongside this audit. An earlier run exceeded the environment's default 2 GB heap in the existing no-z-fighting suite; the suite passed with a 6 GB allowance, then the whole guard was rerun with that allowance.
- Chromium software WebGL captures are real game rendering. Tablet dimensions are browser emulation, not a physical iPad acceptance check.
- No measured 60 fps or physical Steam Deck/iPad claim; no new Linux package is part of this work. Pile termination depth is a game geometry assumption, not a real structural design.
- Development opt-in only; main remains the accepted ordinary World. Promote only through the owner's established workflow.
