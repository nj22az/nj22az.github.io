# Loading: what the phone fetches before the town runs

Measured 2026-10-13 with a headless browser against the published page (`tools/measure-load.mjs`: bytes by file
from the first request to `__JOHANSSON_RUNNING__`), before and after the first batch. The creator: "the game loads too
slow, is it possible to optimise the code or loading, can the code be consolidated? Say more with less code."

| | Before | After batch 1 |
|---|---|---|
| JavaScript fetched before the Enter button | 5 695 KB | 3 546 KB |
| Everything fetched before the town runs | 24 661 KB over 178 files | 11 943 KB over 89 files |
| Raw (unminified) source modules fetched | three.js 1 284 KB + 60 modules, one after another | none |

## Batch 1 (built)

- **The title menu imported the source tree.** `index.html` imported `title-menu.js`, which imports `save.js` and
  `friendship.js`, which import the residents, who import the town's layouts, the ferry, the ocean and three.js. The
  title screen therefore fetched 1.3 MB of unminified three.js and sixty source modules in a serial waterfall, and
  the game then fetched three.js again inside its own chunk. `scripts/build-runtime.mjs` now builds `title-menu.js` as
  a runtime entry: it shares the game's chunks (three.js once, minified) and is preloaded with them.
- **Food art as WebP.** The five `assets/food/island-*.png` (1.2–1.9 MB each, the ice cream loaded at boot by the Blue
  Coral shop) are WebP at 180–280 KB; `commerce/food-art.js` points at them. 7.8 MB → 1.1 MB.
- **Boot-time material textures re-encoded.** Nine plaster, timber and roof textures (1024², JPEG at quality ~100)
  at quality 82: 5.3 MB → 1.5 MB. Normal maps keep full chroma.

## Batch 2: the title while it builds, and the docks opening (2026-10-13)

The creator: "The loading screen is unreadable while it loads for the landing page I mean, can you enhance loading ? Move
some loading to the opening scene ? Where Johansson has spawned randomly ?", then "Change the spawn point so Johansson
always spawns at the docks , looking at something new , the animation should be long enough to load the rest of the
town and tropical island doesn't need to load until we are there we see it in the distance but it's not the whole
island".

- **What it looked like.** The page imports the game at once, and the game builds the whole town behind the title
  (about 9 s of CPU measured in node; minutes in a slowed headless browser). Until the first 3D frame the title stood
  on the page's own dark background: a black slab under the logo, "BUILDING TOWN…" in 11 px grey on it, the footer
  dark on dark. At night the live title's stamp and footer were unreadable too.
- **The title's own view as its backdrop** (`title-screen.css`, `.title-backdrop` in `index.html`). It is a still of
  the title camera's view (`renderTitle` in `game.js`), by day or by night by the hour (`data-title-light`, set before
  the first paint), landscape or portrait. It fades into the live view when the town is ready (`data-scene=ready`).
  It adds 8–39 KB to the first visit (`assets/images/title/`, WebP at 960×600 and 540×960), the one deliberate
  exception to the rule below: a readable start is worth one small picture.
- **Readable status.** "Loading the island…", then "Building the town…", is a pill on a light backing over a running
  bar. The bar moves by transform, so the compositor keeps it moving while the town is built. The footer and the
  work-in-progress stamp have a light backing at every hour.
- **Always at the docks** (`world/openings.js`, `docks`). Eight sights, each only while it is there to be seen: the
  gangway's foot, the Minato Maru alongside (only when she is), the end of the pier, the cargo boat unloading (only at
  her calls), the fish auction's catch, Mr Fujita's houseboat, a fishing boat on the quay, and the landing sign with
  Kitano-jima across the strait. Each start shows one not yet seen, until all have been. The town's other openings
  (Minato, Sato Ramen, the benches, the seawall) are kept for `?spawn=`.
- **The opening holds while the town loads** (`render/spawn-scene.js`). A docks opening begins high and wide over the
  harbour, turning slowly round him. It holds there while anything near him is still loading
  (`detailStream.pendingNear`; the staged build adds its own steps in batch 3), for at least 2.2 s and at most 45 s.
  Then it comes down to him and the lens returns behind him, onto what he is looking at. While it holds he stands
  still, and only a placement, a room or another view can end it, so nobody walks into a town still being built.
- **Found on the way: Kitano-jima's batches were culled from Minato.** `batchStaticProps` put the island's merged
  meshes (runway, quay wall, plaza…) under `world.group`, outside the island's horizon group, so section culling hid
  them beyond 54 m while its unbatched glass and beacon still drew. One batch also lost part of the terminal plaza.
  Batches now stay inside their horizon group (`render/static-props.js`). That showed a real 6 cm lip where the trail
  meets the plaza's edge, which the island's walk floors now count as plaza (`airport-ground.js`: a micrometre of
  slack on floor bounds).

## Batch 3: Kitano-jima when he goes there (2026-10-13)

"tropical island doesn't need to load until we are there we see it in the distance but it's not the whole island".
Kitano-jima was about 410k triangles, ~320 colliders and ~60 prompts, all built at startup and drawn from Minato.

- **At startup** (`createTown({kitano:'distant'})`, `world/kitano-on-demand.js`): the island's ground and quay, its
  airport buildings (a few thousand triangles), the vehicle yard, the hamlet's sites, gate prompts and nameplates, the
  ocean's dry pits, and a view of the rest as it is read from across the strait. The distant view has the plants at
  their own places, sizes and turns as a few simple shapes (`farPlants`, under 20k triangles for the 355k of the real
  ones). The airport district is its plaza, kiosks, thatch, parasols and lookout deck (`buildAirportDistrictFar`).
  The hamlet is its yards and three houses, Johansson's from its drawings' walls, eaves and ridge (`hamletFar`).
- **When he heads there:** boarding the Minato Maru for Kitano-jima starts `prepare()`, a builder a step, so it is
  ready long before she berths. The quick crossing waits for it behind its veil. Anything that puts him on or by the
  island (a save that wakes there, the Town Book, a room's door, the audit) calls `ensure()` first, which builds it
  at once. Then the stand-ins go, everything static is batched in the island's own group, its window glass joins the
  clock, the game shades and compiles it, and the neighbours plan their walks again round its new walls.
- **After that** the real plants show within 240 m of the island and the simple ones beyond 260 m (`tropic.lod`).
- **The same island either way:** `tests/kitano-on-demand.test.mjs` builds it both ways and compares colliders,
  prompts and meshes one by one. The tests, the tools and Studio build it whole (`kitano:'full'`, the default).

## What is still large, in order (the plan for batch 2 and 3)

1. **The game's static import graph is one 3.5 MB download before the first frame.** `game.js` statically imports
   every interior (onsen 180 KB, Sakura 160 KB, the quarters 650 KB, compact shops, Sato Ramen, the town hall), so
   they all load before Enter. Each interior should be a dynamic import when its door is opened (the chunks already
   exist; only the `import` statements in `game.js` and `enterRoom` change). Expected: about 1.4 MB off the boot path.
2. **`spector.bundle` (1.2 MB)** is a WebGL debugger. It is a separate chunk and not preloaded; confirm it is only
   imported behind the inspector flag, never in a normal session.
3. **Models at boot.** The resident figurines and display GLBs (`thuan-display.glb` 5 MB, `maneki-neko-display.glb`
   1 MB) are only needed in their rooms; load them on entry. The HDR sky (1.5 MB) could be a 512 px version on phones.
4. **The avatar code** (`swept-ponytail-mesh.js` 260 KB of source, `build.js` 137 KB, `animate.js` 125 KB) and
   `game.js` (196 KB, one file) are where "say more with less code" applies: the ponytail mesh is generated data
   that could be built at runtime from a few parameters, and `game.js` carries room entry, seating, eating, the ferry,
   the island and the audit API in one file. Splitting it by concern is a refactor to do room by room, with the test
   suite as the net.
5. **Service worker.** `sw.js` caches the runtime; a returning phone should not refetch 12 MB. Check its cache list
   covers the hashed chunks and the textures.

Rule for every batch: measure with the script before and after, and never ship a change that moves the first-frame
bytes up.
