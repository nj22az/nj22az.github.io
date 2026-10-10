# Johansson Island master plan — 10 October 2026

Two islands and one walking network. Minato is the compact harbour town, crossed on foot in a few minutes. The
uplands to the south hold the farms, Mount Aoba, Aoba Radio, Hoshizaki and the West Cape lighthouse. Across the
strait, Kitano-jima is a tropical island with a small commuter airport, reached by the Minato car ferry.

## Survey: can you walk everywhere?

`node tools/reachability-audit.mjs [--json out.json] [--png out.ppm]` flood-fills the game's own walking rules
(`routeAt`, colliders at standing height, the climbable step) on a 0.5 m grid. It starts on Main Street and at the
Kitano quay, which the ferry joins to the town. Then it checks every door, seat, counter and notice against the
ground it reached. Results today:

| Measure | Value |
|---|---|
| Walkable ground | 60,860 m² |
| Reached from Main Street | 49,360 m² |
| Kitano-jima, from the quay | 11,390 m² |
| Doors that cannot be reached | 0 |

The one flagged interaction, the Aoba Radio roof lookout, is reached by its stair; the flat survey cannot climb
stairs. The sealed pockets left are the Ōshiro cattle pen and the inside of Mr Fujita's houseboat, both closed on
purpose. Re-run the survey after any change to ground, colliders or doors.

## Districts

| District | Purpose | Access |
|---|---|---|
| Minato harbour town | Daily life: Sakura Shōten, Front-Row Books, the harbour office, Harbour Park, izakaya and ramen | On foot |
| Rainflower Lane, Aoba Garden | Second shopping street, Umi-no-yu, the pond garden | Short walk south of Main Street |
| The uplands | Cane fields, the Ōshiro farmstead, tombs, Aoba Radio, the coastal road loop | Walk or cycle; coastal bus |
| Mount Aoba | The island's landmark hill, 14 m, south-east of Aoba Radio (`ISLAND.mountain`) | Walk up any side; slopes stay climbable |
| Hoshizaki, West Cape | Fishing village, store, guesthouse; the lighthouse | Coastal road; village bus |
| Kitano-jima | Coral Bay, the jungle trail to the Hinata lookout, Turtle Cove; the airport plaza, three kiosks, the departure lounge | Car ferry from the town quay; Naha commuter from Gate 1 |

Kitano-jima's terrain, outline, trails and plantings are `src/world/tropical-island.js`; its walking rules are
`airportSurface` in `airport-ground.js`; its plaza, lounge, benches, fence and notices are `airport-district.js`.

## Rules the plan keeps

- One walking network: every door sits on ground connected to Main Street. The ferry is the only link not on foot.
- Walking height and drawn ground come from one grid (the town plan, `islandTerrainHeight`, `tropicHeight`).
- Airside stays airside: the airport fence crosses the whole of Kitano-jima at v = 16.75.
- Nothing is random: every kiosk, bench and sign has someone it is for, recorded in its notice text.
- The third-person lens stops at drawn surfaces (awnings, canopies, shop glass) and never sits inside the avatar's
  head (`src/render/lens-occlusion.js`).

## Next phases

1. **Fill the uplands.** The countryside is reachable but mostly empty grass: a hamlet at the foot of Mount Aoba,
   a summit path and shrine, a roadside stall on the coastal loop, each with residents and routines.
2. **One sea, one horizon.** The haze turns the far strait into a flat pale band; tune it by view height so both
   islands sit in the same water from every viewpoint.
3. **Smoothness on iPad.** The town draws roughly 900–1,300 objects a frame. Batching the shop streets and the
   quarter's small props, as the harbour already is, is the largest frame-rate gain left.
4. **Life on Kitano-jima.** A Coral Bay beach bar supplied by Higa Liquor, Jun's lunch on the beach, ferry
   day-trippers.
