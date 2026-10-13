# Johansson's house (ヨハンソン邸): the design book

The creator, 2026-10-13, with the drawings: *"Can you use these drawings and model Johansson’s house on the tropical island?"*
Two revisions came: Rev B (`cad-rev-b/`, a schematic set: plans, elevations, a section, structure, electrics, plumbing and
drainage) and Rev C (`cad-rev-c/`, three coordinated plans with real wall gaps, the building manifest and the shell as GLB).
Rev C rules; Rev B is reference only, as its README says. This folder is generated from what the game builds
(`node tools/johansson-house-drawings.mjs`; `tests/johansson-house.test.mjs` fails when a sheet is stale), so the house
in World, these drawings and the house in the stories are one house.

- **The drawings, read:** `src/world/johansson-house-cad.js`, generated from `cad-rev-c/` by
  `node tools/johansson-house-import.mjs`, which checks the plans and the manifest against each other on the way in.
- **The house as built:** `src/world/johansson-house.js`: the drawings, and where they leave something open, the findings
  below. Nothing else departs from them.
- **Outside, in Kitano hamlet:** `src/world/johansson-house-build.js`, on plot `kitano-1` (`kitano-hamlet-layout.js`,
  `kitano-hamlet.js`), its front door the site `mayor-home`.
- **Inside:** `src/world/interiors/johansson-house-interior.js`, walked floor by floor with `src/world/house-walk.js`.

A new revision: put it in `cad-rev-<x>/`, point the importer's `SOURCE` at it, run the importer, and the tests say
which finding it settles and what no longer fits.

## Particulars

| | |
|---|---|
| Footprint | 12 × 10 m outside, walls 200 mm, partitions 120 mm |
| Floors (finished) | Basement -2700, ground 100, upper +2900 mm; 2 800 mm floor to floor |
| Clear heights | Basement 2520, ground 2520, upper 2700 mm |
| Roof | Slab 5600–5800 mm, 400 mm over the walls; hipped red tile to a ridge at +7900 (F10) |
| Stair | 16 risers × 175 mm, treads 250 mm, two flights 1100 mm wide and a landing, stacked (F1) |
| Site | Yard -350 mm under the datum (450 under the ground floor), 1.3 m above the sea |
| Rooms | 24 (21 and the stair on each floor) |

## The sheets

| Sheet | File | What it is |
|---|---|---|
| B1 | `plan-B1.svg`, `as-built-B1.dxf` | Basement plan as built |
| G0 | `plan-G0.svg`, `as-built-G0.dxf` | Ground floor plan as built |
| L1 | `plan-L1.svg`, `as-built-L1.dxf` | Upper floor plan as built |

The DXF are in millimetres on Rev C's layers (A-EXT-WALL, A-PARTITION, A-OPENING, A-STAIR, A-FLOOR, A-ANNOT), so they
open over the creator's own sheets.

## Rooms

| Floor | Room | Size | Area | What it is for |
|---|---|---|---|---|
| B1 | Electrical workshop | 4.64 × 4.74 m | 21.99 m² | Johansson’s bench, his meters and the parts drawers: the ship’s electrician’s workshop he kept when he came ashore. |
| B1 | Club reading room | 4.64 × 4.74 m | 21.99 m² | The reading club meets here: armchairs, the books, a bar; the high window under the garden lets in the day. |
| B1 | Cellar store | 2.28 × 3.24 m | 7.39 m² | Under the genkan: preserves, the club’s bottles and the typhoon kit (finding F2). |
| B1 | Stair hall | 2.28 × 3 m | 6.84 m² | The foot of the stair, and the way to every room in the basement. |
| B1 | Stair | 2.28 × 3.24 m | 7.39 m² | The first flight up, and the cupboard under the flight down (finding F1). |
| B1 | Boiler and pumps | 4.44 × 4.74 m | 21.05 m² | The water heater, the pressure pumps and the sump pumps, with its own door to the garden (D-BEXT). |
| B1 | Sauna and shower | 4.44 × 1.98 m | 8.79 m² | A Swede’s sauna: the bench room, the shower and the changing bench. |
| B1 | Storage | 4.44 × 2.64 m | 11.72 m² | Shelves, the fishing gear and the spare tiles, through the sauna’s changing room (finding F4). |
| G0 | Living room | 4.64 × 4.74 m | 21.99 m² | The low table, the television and the window to the garden. |
| G0 | Kitchen and dining | 4.64 × 4.74 m | 21.99 m² | The kitchen along the west wall, the dining table under the north window. |
| G0 | Entry and genkan | 2.28 × 3.24 m | 7.39 m² | The front door, the doma where shoes come off, the step up and the letter box (finding F8). |
| G0 | Stair hall | 2.28 × 3 m | 6.84 m² | The middle of the house: every room on the floor opens off it. |
| G0 | Stair | 2.28 × 3.24 m | 7.39 m² | The stair, up and down (finding F1). |
| G0 | Thuan sewing studio | 4.44 × 4.74 m | 21.05 m² | Thuan’s machine at the east window, her cutting table and her fabric. |
| G0 | WC and utility | 4.44 × 1.98 m | 8.79 m² | The toilet, the washbasin and the utility sink. |
| G0 | Covered terrace access | 4.44 × 2.64 m | 11.72 m² | Boots, the garden tools and the door out to the terrace (D-TERRACE). |
| L1 | Primary bedroom | 4.64 × 4.74 m | 21.99 m² | Johansson and Thuan’s room: the futons and the wardrobe. |
| L1 | Guest bedroom | 4.64 × 4.74 m | 21.99 m² | For visitors and for Thuan’s sisters when the last boat has gone. |
| L1 | Box room | 2.28 × 3.24 m | 7.39 m² | The nando over the genkan: the winter quilts and the suitcases (finding F3). |
| L1 | Stair hall | 2.28 × 3 m | 6.84 m² | The landing at the top of the stair. |
| L1 | Stair | 2.28 × 3.24 m | 7.39 m² | The well of the stair, with its balustrade (finding F1). |
| L1 | Bathroom | 4.44 × 4.74 m | 21.05 m² | The ofuro, the washing place and the basin. |
| L1 | Study | 4.44 × 1.98 m | 8.79 m² | The desk at the east window, the town’s papers (finding F6). |
| L1 | Linen room | 4.44 × 2.64 m | 11.72 m² | The linen and the airing rail under the north window (finding F5). |

## Findings

Where the house as built departs from Rev C, and why: for the next revision to settle.

### F1. The stair cannot stand in the stair hall as drawn

- **Drawn:** Two flights of 8 risers × 175 mm, treads 250 mm, with an intermediate landing, in the 2.0 × 2.6 m footprint 5.1–7.1 × 3.7–6.3, and every floor slab cut away over that footprint. The second flight is drawn from y 6.3 down to 4.55, over the landing.
- **Problem:** Two flights of seven treads and a landing take 1.75 + 0.85 m, the whole hall, so a floor has no landing to step off at: the hall’s doorways (two to the west rooms, two to the east rooms, the genkan’s, the linen’s) open over the stair well at every level. In the basement the slab is cut away under the stair too. And the bay north of the hall (4.96–7.24 × 6.56–9.8) has no doorway on any floor.
- **Built:** The same stair, 16 × 175 mm risers and 250 mm treads, flights 1.10 m wide either side of an 80 mm spine wall, in the bay north of the hall: up north along the west half (7 treads, 1.75 m) to a landing 1.49 m deep across the bay, up south along the east half to the next floor. It fits the bay to the millimetre (1.75 + 1.49 = 3.24 m), the flights stack 2.8 m apart (2.6 m headroom), and the hall is a floor on every level. The hall’s north partition goes; the well is in the ground and upper floor slabs over the bay; the basement slab is whole. In the basement the hall’s east doorway at 7.6–8.4 (now under the flights) moves to 5.8–6.6, as on the floors above.

### F2. The basement room under the genkan has no door

- **Drawn:** Enclosed by partitions on all four sides (4.96–7.24 × 0.2–3.44).
- **Problem:** Unreachable.
- **Built:** A doorway onto the hall at 5.4–6.2, as the genkan has on the floor above: the cellar store.

### F3. The upper-floor room over the genkan has no door

- **Drawn:** Enclosed on all four sides (4.96–7.24 × 0.2–3.44).
- **Problem:** Unreachable.
- **Built:** A doorway onto the landing at 5.4–6.2: the box room (nando).

### F4. The basement storage has no door

- **Drawn:** Storage, 5.0–11.8 × 6.6–9.8, reached only through the stair bay’s doorway at 7.6–8.4.
- **Problem:** The stair bay is closed, and in F1 it is the stair.
- **Built:** The north-east room (7.36–11.8 × 7.16–9.8) is the storage, with the doorway the ground floor has there (9.2–10.0) from the sauna’s changing room. A doorway off the hall would be better: Rev D.

### F5. The upper-floor linen room has no door

- **Drawn:** Linen and landing, 5.0–11.8 × 6.6–9.8, with W-LANDING in its north wall; its east part is enclosed.
- **Problem:** Unreachable, and its west part is the stair well in F1.
- **Built:** The north-east room is the linen room, with W-LANDING, and the doorway the ground floor has there (9.2–10.0), from the study.

### F6. The study window is cut by the bathroom’s partition

- **Drawn:** W-STUDY, east wall, y 4.4–6.1, sill 850, head 2100.
- **Problem:** The partition between the bathroom and the study is at y 4.94–5.06, across the window.
- **Built:** W-STUDY, 1.7 m as drawn, at y 5.2–6.9, centred in the study.

### F7. The walls stop short of the slabs

- **Drawn:** Ground floor walls end at 2.60 under a slab from 2.62; upper floor walls at 5.40 under the roof slab at 5.60; basement walls at −0.20 under a slab from −0.18; partitions 50 mm lower still.
- **Problem:** Gaps of 20–200 mm between wall and slab: no wall stands like that.
- **Built:** Every wall runs to the soffit over it.

### F8. Interior doorways and the genkan

- **Drawn:** Interior doors are full-height gaps in the partitions; the ground floor slab is level throughout.
- **Problem:** A doorway has a head; a Japanese genkan has a doma a step below the floor, where shoes come off.
- **Built:** Each interior doorway is 2.0 m high with its head walled up to the soffit (as the drawn outside openings are). The genkan’s doma, from the front door to 1.4 m in, is 150 mm under the hall, with the step (agari-kamachi) at its edge. Door leaves are not drawn, so none are hung.

### F9. The ground round the house

- **Drawn:** Not drawn. The basement walls stop at −0.20 and the ground floor slab is at −0.18–0.10.
- **Problem:** The house needs a grade, a step to its front door and a way down to D-BEXT, 2.35 m under the garden.
- **Built:** The yard 450 mm under the ground floor (−0.35), a stone step at the front door (−0.20); outside D-BEXT a walled areaway with 14 steps of 168 mm up to the garden along the south face, rails round it; outside W-B1 a window well with a steel grating at grade.

### F10. The roof is a placeholder

- **Drawn:** A flat slab 5.60–5.80 over −0.4–12.4 × −0.4–10.4, a placeholder pending a typhoon-resistant roof (Rev B: a tiled hipped roof, ridge at 7.90).
- **Problem:** A placeholder is not a roof for the hamlet; the design is the creator’s to make.
- **Built:** The slab as drawn, and on it Rev B’s intent: a hipped roof of red tile pointed in lime, the Okinawan way, equal pitches (about 21°), ridge at 7.90, a shisa on the ridge. To be replaced by the creator’s design.

### F11. The basement is under the sea’s level

- **Drawn:** Basement floor at −2.70.
- **Problem:** The yard is 1.3 m above the sea, so the basement floor is about 1 m below it, in coral sand: the drawings say basement waterproofing is not engineered.
- **Built:** Nothing more than drawn: a tanked concrete box with a sump and two pumps (in the boiler room) is what a builder would need, and a check against flotation. Open.

### F12. The kitchen window is lower than the counter under it

- **Drawn:** W-KITCHEN, west wall of the kitchen and dining room, sill 850 over the datum: 750 mm over the ground floor.
- **Problem:** A kitchen counter is 850 mm high, so the counter runs across the foot of the window, 100 mm of glass behind the worktop.
- **Built:** The counter at 850 along the west wall as a kitchen has it, across the window’s foot. Rev D: a sill of 1 000 mm or more over the floor at a counter.

## Open

- The creator's roof design (F10), the basement's tanking and its sump (F11), the kitchen window's sill (F12).
- The stair house's own steps down to D-BEXT are not walked yet: the door is bolted in the game.
- Rev B's electrics, plumbing and drainage are not coordinated with Rev C (its README says so); the house's services
  are the next sheets to draw.
