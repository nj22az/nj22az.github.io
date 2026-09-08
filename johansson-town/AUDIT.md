# Johansson Town — implementation and acceptance audit

Updated 8 September 2026. This supersedes the previous document's inaccurate claim that remote high-detail humans were shipping. The branch is an unaccepted development slice; no live deployment is implied.

## Phase status

| Phase | Implemented in this draft | Still required |
| --- | --- | --- |
| A — honesty and loading | Local Three r170, one boot graph, canonical imports, obsolete wrappers removed, local model loading/fallback, corrected docs and in-world records | WebGL startup and cached load timing on actual hardware |
| B — town skeleton | Connected district paths, two OSM way fragments, shared route/height data, raised shrine, school approach, arcade, four new building silhouettes, raster navigation, timed shutters, ramen room | Complete historical blockout/coastline, GSI reference study, twelve distinct buildings, unique bookshop/harbour interiors and visual walk-through |
| C — bodies and sound | Five CC0 clothed bases with embedded compatible clips, twenty schedules, eight visible residents, original local audio files, can hold/drink and seated view | Per-resident wardrobe/age specificity, audible tuning, in-world fishing and CRT Star Port |
| D — density and quests | Existing Tama and workshop escort are retained; paper notebook map added | Enterable sentō, player room, shrine office and bus hut; fifteen inspectables per room; physical drawers; complete book-drying/Mrs Sato quests; postcard camera |
| E — grade and performance | PBR map channels, quantised following shadow target, model material merging | GPU profiling, baked/half-res AO, window interior cards, final grade, LOD/batching, iPad matrix and credits review |

Phase D expansion is held at the requested gate: a stranger must walk shrine → arcade → ramen → quay → outer pier and review the façades first. Source tests cannot substitute for that visual gate.

## Acceptance evidence

| Requested check | Current evidence / result |
| --- | --- |
| Cold/cached load under 4 seconds, offline play | Local imports/assets are checked. Optional production build succeeds. Timing and offline reload are **not verified**; no service-worker offline guarantee is implemented. |
| Shrine → shopping street → ramen → quay → outer pier | CPU routes include detailed content colliders; pier boundaries, school, bathhouse route and raised shrine landing are checked. Visual mesh/collision agreement remains **unverified**. |
| A/D, mouse, jump, vending can | Coordinate convention, fixed simulation, can animation/one-time consumption and purchase save checks pass. Physical keyboard/pointer-lock/touch input needs browser play. |
| Afternoon → night closure | Bookshop opening rules and Aiko's departure are tested; shutters and emissive windows are wired to town minutes. Night appearance and radio audibility unverified. |
| Five residents, dialogue, Tama | Twenty named profiles have at least three topics. Five GLBs parse and animate with independent skeletons. Tama reward and no duplicate payout tested. Silhouette quality unverified. |
| Bench, coffee, harbour/train audio | Seated camera and can consumption wired; local positional loops and train intervals implemented. Listening/seat alignment still required. |
| Paper notebook map | Notebook and HUD share a paper map renderer and route data. CPU wiring passes; rendered legibility unverified. |
| iPhone/iPad | Dedicated controls and dark fullscreen backing retained. No actual device verification. |
| Reload save | v3/v4 import, corrupt-save fallback, inventory/yen/quest persistence and legacy preservation tested. |
| Credits/licences | Three MIT, Poly Haven CC0, Quaternius CC0 and OSM ODbL are listed on screen and in the local ledger. ambientCG is explicitly a proposed source, not a shipped asset. |

## Regression coverage

Run `npm test`: all test files are selected, including the migrated office and stability suites. Old assertions demanding removed filenames, remote models and import-map aliases were retired. Their meaningful geometry, inspector, dialogue, save and bounded WebMCP checks remain.

The CPU full-game test constructs actual geometry/content/cast, checks startup stability, enters and exits all nine registered interiors and checks finite scene/camera matrices. It replaces WebGLRenderer and browser APIs, so it is not a rendered gameplay test. Separate tests load all five binary models through the vendored GLTFLoader, sample animation and verify independent skeletons.

Review caught and fixed circular interaction metadata that broke object cloning, a journal doorway intersecting a book pedestal, low-elevation interaction assumptions, duplicate NPC destinations, a Kenji/Kenta escort deadlock, navigation edges cutting bounds, missing school pavement, shrine bounds mismatch, obsolete credit overwrites and directory IDs needed by WebMCP.

## Graphics and performance limits

The selected Quaternius assets were converted offline from 10–13 material parts to one skinned mesh/material each; the suit's weapon accessory and unused combat clips were removed. Geometry deformation was compared across every retained animation and an idle/walk blend before and after export. No external decoder is needed.

An earlier CPU frustum estimate with the procedural fallback counted 983 visible draw submissions and 69,804 triangles at the starting camera, excluding shadow passes. It is not a GPU measurement and predates the merged local bodies. The requested <100 calls / <150k triangles and 60 desktop / 30 iPad FPS are **not certified**. Batch the remaining static and fallback geometry after measuring with WebGL; do not describe post-processing as solving this budget.

The imported adults are generic low-poly bases. Mrs Sato's biography and height do not establish an elderly body; customised age and wardrobe work remains. All rendered bodies and buildings use Standard/PBR materials, but final coherence still needs visual direction.

The navigation implementation is a conservative raster A* over the shared collision predicate, not a Recast bake. Population streams by proximity, not interior loading. Shops close to new entries but residents do not yet occupy individually modelled indoor workplaces/homes. The original eight interiors retain their common shell. Fishing and Star Port still use activity panels. Audio is original synthesised Foley/music, not field recordings, spoken weather broadcasts or recorded baseball commentary.

## Browser blocker and release matrix

The supplied cloud browser fails WebGL context creation (`GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`). This was reproduced on ENTER TOWN. No game screenshot or FPS claim is available.

Before release, test desktop Chromium and Safari, iPad Safari landscape/portrait, iPhone touch controls, fullscreen enter/exit, background/foreground, rain/night, camera near benches/walls, model-load failure, all shop entries/exits, the full Tama loop and all save fields after reload. Record actual draw calls, triangles, p95 frame time, memory and cache timing. Keep the pull request draft until these gates and the stated scope are resolved.
