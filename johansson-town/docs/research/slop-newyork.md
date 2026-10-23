# Slop New York — technical reference for the third island

Added at the owner's request, 23 October 2026. This is a permanent research reference, paired with
[New Yokosuka](new-yokosuka.md) and its [measured lessons](new-yokosuka-lessons.md).
The design proposal is [Third city island](../../briefs/THIRD-CITY-ISLAND-2026-10-23.md).

## Source and evidence

- Repository: <https://github.com/mrdoob/slop-newyork>
- Live project: <https://mrdoob.github.io/slop-newyork/>
- Inspected source commit: `9c39d20d2aa7ea23da71384aafee479c0e9d6144`.
- Read: README, LICENSE, import map, main renderer setup, spatial culling, road graph and traffic implementation.
- Evidence boundary: source inspection only. The live simulation was not driven or benchmarked in this task.
  Any performance benefit below is a hypothesis to measure in Johansson World.

The project models New York with Three.js WebGPURenderer and TSL. Its README describes exploring on foot,
by car, bicycle and helicopter. The inspected entry page imports Three.js from the moving `dev` branch;
pinning the application commit alone does not freeze its renderer dependencies.

## What to study and where it fits

| Upstream source at the inspected commit | Observed mechanism | Johansson application |
| --- | --- | --- |
| [`js/scene-culling.js`](https://github.com/mrdoob/slop-newyork/blob/9c39d20d2aa7ea23da71384aafee479c0e9d6144/js/scene-culling.js) | Splits large static instance sets into spatial chunks; small props have size-derived visibility distances; separate shadow proxies | Compare with existing `src/render/town-sections.js` and `section-instances.js`. Improve those only where a measured bottleneck remains. Do not transplant Manhattan's 250–600 m chunk sizes into our compact streets. |
| [`js/road-network.js`](https://github.com/mrdoob/slop-newyork/blob/9c39d20d2aa7ea23da71384aafee479c0e9d6144/js/road-network.js) | Derives drivable lanes from the ground corridors and obstacles; spatial hash supports queries | Use one city plan for ground, pedestrian routes, vehicle lanes and crossings. Build left-side traffic explicitly; the source's right-side conventions need redesign. |
| [`js/traffic.js`](https://github.com/mrdoob/slop-newyork/blob/9c39d20d2aa7ea23da71384aafee479c0e9d6144/js/traffic.js) | Lane following, signal obedience, crossing yields, instanced vehicle geometry; distant vehicles may relocate | Start with a small delivery loop. Named residents and owned vehicles must retain their actual journeys; do not copy distant relocation into their routines. |
| [`js/buildings.js`](https://github.com/mrdoob/slop-newyork/blob/9c39d20d2aa7ea23da71384aafee479c0e9d6144/js/buildings.js), `city-grid.js`, `street-details.js` | Separate building, ground and street-detail builders | Create a small authored Japanese facade kit with assigned occupants and trade. Procedural repetition serves construction, never random shops or vacant housing. |
| [`js/main.js`](https://github.com/mrdoob/slop-newyork/blob/9c39d20d2aa7ea23da71384aafee479c0e9d6144/js/main.js), `tsl-materials.js` | WebGPU/TSL renderer and materials, clustered lighting setup | Research separately. World currently vendors Three.js r170 and uses WebGL rendering; adding an island does not require a renderer migration. Preserve the shared Look pipeline. |

## Two references, different responsibilities

Slop New York informs city construction, visibility, roads and traffic. New Yokosuka informs human scale,
shopfront rhythm, interiors, working days and atmosphere. Johansson supplies its own 1997 Okinawan identity,
characters, assets, stories and rendering style. A Manhattan street grid or skyline is not the proposed setting.

Existing measured evidence records a 6.2 m median doorway spacing on the reference shopping street, an
8.03 × 4.23 m convenience-store shell and a 74 × 88 m warehouse yard. These are observations of game spaces,
not building regulations or dimensions to impose on Sakura. Its current exterior remains the boundary for
the separate Sakura CAD task.

## Reuse and provenance

The inspected Slop New York LICENSE is MIT, copyright (c) 2026 Mr.doob. Any later copied or substantially adapted
code must carry the complete upstream copyright and permission notice, the source commit/path, changes made
and a dependency review. This addition contains reference links and analysis, no upstream source or assets.

The upstream README identifies NYC Open Data and OpenStreetMap geographic data (ODbL), with third-party
data and dependencies retaining their own licences. The third island should use our own authored fictional
coastline and streets: no Manhattan geodata or upstream data pipeline is needed. If that changes, review each
dataset and required attribution before importing it; the MIT code licence does not cover everything.

New Yokosuka remains study-only under our existing rule: no Shenmue assets, dialogue, music, branding or
New Yokosuka code enter the game. Its current README was rechecked on 23 October; previous measurements
remain explicitly the 19 October study, not new measurements from this session.

## Recommended first technical experiment

Build the first city block using the current renderer and existing batching. Record draw calls, submitted triangles,
frame-time percentiles and retained memory on the same route before changing culling. If instance visibility is
the constraint, compare a focused adaptation of upstream chunking with our existing 24 m sections. Retain only a
measured improvement, with attribution if code is reused. Do not import the full simulator into the game bundle.
