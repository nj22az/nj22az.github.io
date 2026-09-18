# Johansson Town layout audit — 17 September 2026

Second pass against `main` at `bac7c6d8`, plus the `peninsula-walk` branch that opens the headland.

## How walking actually works

Outdoor movement is not a rectangle. `physics.js` does this:

```
townBoundsBlocked(x,z,r) => !routeAt(x,z,r)
```

`routeAt` in `src/world/layout.js` only accepted paved ribbons (Main Street, crossings, quay, outer pier, bus apron, park, dining lane) plus a few named landings. Grass drawn by `buildPeninsula()` was scenery. Stepping off the ribbon felt like an invisible wall, including onto land that the visitor map already paints as the peninsula.

The `peninsula-walk` branch adds a final fallback: if the collision circle is inside `COASTLINE`, `routeAt` returns `{id:'peninsula-ground', surface:'dirt'}`. Water stays blocked. Building colliders are unchanged.

## Two towns in one repository

| Frame | Bounds (approx.) | Shops live at | Walk rule |
| --- | --- | --- | --- |
| Published shopping district | Map envelope `-44…48`, `-72…37` | Compact Main Street / quay (`businesses.js`, `town-grid.js`) | Was ribbon-only; now ribbon + `COASTLINE` |
| `FULL_TOWN` overworld | `-26…24`, `-24…20` plus canal | Completely different `LOCATIONS` in `full-town.js` | `fullContains` / height grid |

These two geographies do not share coordinates. If `overworld.glb` loads, doors, homes and patrols jump to the canal quarter. If it fails, the harbour district is what you play. That is the largest layout inconsistency in the project.

A third, unused `peninsulaContains` in `full-town-state.js` is a small rectangle, not `COASTLINE`. Do not treat them as the same landmass.

## Coastline vs playable decks

`COASTLINE` south edge is `z = -50`. The outer pier deck runs to `z ≈ -64.5`. That is correct: the pier is over water and must keep its own route. Do not grow the polygon over the harbour or the player will walk on empty sea.

The west “second pier” route (`x = -36`, `z = -44…-62`) is marked `legacy` and is hidden in shopping-district mode, but the geometry file is still there. The land at `x ≈ -36, z ≈ -44` is now walkable grass; the deck over water is not, unless that legacy route is turned back on.

## Inconsistent objects (still true after the walk patch)

### Names and dates
- Visitor board / live clock: **13 September 1988**. README and several docs: **14 September 1988**.
- Clerk identity: assets `yui`, docs `Yuri`, street profile `Thuan`. Three names for one counter.
- Docs folder still has `INAKAYA.md` next to `IZAKAYA-SEATING.md`.

### Retired content that still exists as files
- `sea-cave.js` — `world.quality.seaCave` is hard-coded `false`.
- Residential circuit, shrine, school, river walk — described in `COMPACT-TOWN.md`, stripped from the published street.
- Legacy routes: `west-alley`, `crystal-door`, `west-service`, `east-service`, `east-market-cut`.
- `FULL_TOWN` shop IDs `journal`, `electronics`, `stepwise`, `career` are aliases or retired in `businesses.js`.

### Props that do not match their ground
- Neighbourhood bench interaction hard-codes seat `{position:[2.05, 0, 17.02]}` while the mesh is placed at `(2.05, 17.1)`. Off by eight centimetres on Z; fine at a glance, wrong if you sit and stand repeatedly.
- Peninsula land mesh used to sit at `y = -0.4` while `groundHeight` is `0`. Off-road walking would have floated. Branch lifts the mesh to `y = -0.02`.
- Forest “wall” was an invisible 24 m × 0.9 m collider at `z = 33.8` with `opacity: 0`. Trees were decoration in front of a gameplay slab. Branch replaces the slab with per-trunk colliders so you can walk the woods.
- Utility cabinet comment says it is clear of a six-metre carriageway; Main Street width is defined in `main-road.js` and has moved several times. Re-measure before trusting the comment.
- Recycle bins at `(5.05, -19.8)` and the hand pump at `(-7.4, -31.2)` sit on pavement only if those Z values still land on the current street. After the seaside-grid shrink they are the first props to audit in a live capture.

### Interaction holes
Registered `E` targets are explicit anchors: shop doors, a short list of street props, pier winch / bait / rope, residents, Tama, vending, seats, documents. Everything else is scenery. “Interact with anything” is not a one-line flag; each mesh needs `register()`.

The branch adds inspect/sit/read anchors on the west waste-ground, east bluff, north wood, south shelf, a few named shore rocks, and the southern tip. It does not auto-wrap every crate in every room.

Residents already have `Talk to <name>` on their group. Off-duty people still exist (`Reiko`, `Tetsuo`, `Nao`, `Officer Mori`) but follow schedules — they are not missing, they are elsewhere. Indoor talk depends on the room the schedule put them in.

### Map vs world
- Paper map uses `MAP_BOUNDS` and `COASTLINE` in compact mode, `FULL_TOWN.bounds` in overworld mode.
- Compact map previously cropped north at `FOREST_EDGE.roadEndZ + 1` (`≈ 37.6`) while the land polygon continues to `z = 51`. Branch sets `maxZ: 52`.
- Forest sign used to say `BUS ONLY`. Branch copy says the woods are walkable; the bus lane itself is still a road mesh.

## What you can walk now (peninsula-walk)

Walkable:
- All previous street, quay, park, bus apron, outer pier.
- Grass and dirt inside `COASTLINE` (west headland, east bluff, north wood around the trunks).
- Inner quay after dark (unchanged warning text on the notice board).

Still blocked:
- Water outside the polygon.
- Building / crate / trunk / furniture colliders.
- The outer pier remains a separate wooden deck; you do not walk the sea beside it.
- Interiors still use room bounds, not the peninsula test.

NPCs keep using the authored route network and A*. They will not wander the bluff unless their schedules gain new waypoints.

## Recommended next passes (not in this branch)

1. Pick one date (13 or 14 September 1988) and one clerk name; grep the rest out.
2. Delete or quarantine `sea-cave.js`, `INAKAYA.md`, and unused `FULL_TOWN` door tables if the overworld GLB is no longer the published mode.
3. Re-sit every street prop against `MAIN_ROAD` and `BOARDWALK` with a one-frame debug overlay of collider boxes.
4. If “interact with anything” is literal, add a prop catalogue: every `factory.*` call returns `{object, collider, inspect}`. Do not raycast anonymous merged static batches — `batchStaticProps` will make that impossible.
5. Give two or three residents an off-street evening waypoint (west lookout, park, east bluff) so the new walkable land is populated, not only inspectable.
6. Device-test WebGL. The docs already record that the review browser cannot create a context; none of this pass was seen in-engine.

## Files touched on peninsula-walk

- `src/world/peninsula.js` — point-in-polygon, land raised to foot height.
- `src/world/layout.js` — dirt fallback, map north opened to `z = 52`.
- `src/world/forest-edge.js` — trunk colliders, no invisible slab.
- `src/world/peninsula-life.js` — new headland anchors.
- `src/world/town.js` — wires the new module.
- `docs/LAYOUT-AUDIT-2026-09-17.md` — this note.
