# Sakura measured wall dressing and constructed gondolas

Owner authorised continuing the suggested decoration, then asked for more realistic shelves with imperfections and material choices. Work remains on `codex/sakura-retain-detail`, draft PR #378, based on `9099d4fa`. Candidate only (`?sakura-rebuild`); no merge or deployment.

## Wall scheme implemented

All 20 placements from `docs/qa/sakura-wall-decoration/Sakura-Wall-Decoration-Schedule.json` are implemented with their exact CAD centres, normal directions, widths and heights. Runtime specification: `src/world/interiors/sakura-wall-dressing.json`; builder: `sakura-wall-dressing.js`. One wall-print atlas/merged mesh plus shallow backing. The J Coffee boards reuse `assets/graphics/advertising/j-coffee-island-banner.webp`, fitted within their frames without changing the art's aspect ratio. The flower-service drawing is a small original procedural bouquet, not a newly imported asset.

Replaced the superseded small drinks, fresh-food and rest-room boards; retained the un-replaced wash sign and reserved future-service marker. The wash sign is moved out of the old partition into the interior face to avoid being buried. Hanging aisle signs remain. Existing shelf prices and six crayon starbursts remain unchanged.

Hours/till cut-off use `sakura-rota.js`. Office calendar uses the actual game year/month/day, with today's day marked. Office rota derives each day's keeper from `sakuraClerkAt`, not a new hardcoded staff schedule. Receiving clock uses game time with separately moving geometry hands; only daily calendar/rota changes repaint the atlas. No 24-hour opening, speculative discount or newly active ATM. Doors, cooler operation, office observation glass, fixture footprints and walking routes remain as before.

## Shelf construction and finish choices

`src/world/interiors/sakura-gondola-detail.js` replaces candidate block gondolas while preserving each 900 x 4,500 mm footprint, 1,350 mm height and existing stocked deck tops +344 / +664 / +984 mm.

| Component | Material chosen for Sakura | Visible construction |
| --- | --- | --- |
| Uprights / decks / plinth | Cream powder-coated steel | Slotted posts, 900 mm shelf sections, thin tray tops with folded returns, recessed base |
| Brackets / feet | Exposed grey steel | Under-deck supports and levelling feet |
| Main back-panel inserts | 12 mm laminate-faced hardboard | Separate panel inserts held between upright flanges |
| End panels | Pale wood-effect laminate | Subtle grain, thin painted metal perimeter trim |
| Product retainers | Clear PET plastic | Thin low retaining strips; price channels remain separate |
| Refrigerated case glazing | Existing glass representation | Remains on the cold display; the ambient gondola trays remain steel |

The finish pass adds a few authored small edge rubs, not random dirt, damaged structural shelves, heavy rust or crooked shelves. The shelf trays are not solid timber slabs. No product scale, placement, count, price, stock/save ID or aisle collider is changed. Material batches use ordinary Three.js meshes and the existing rendering system; no new point lights or transmission effect. This does not complete the remaining freezer merchandising or full original prop inventory.

Construction references: Lozier's official [upright specification](https://www.lozier.com/products/lozier-gondola/uprite/) and [product index](https://www.lozier.com/products/product-index/) establish steel framing and a choice of hardboard/pegboard/woodgrain/wire backs. They are construction references, not evidence that a particular modern product was installed in a 1997 Japanese store. Sakura's sizes/finish choices are authored to the existing measured layout. No source geometry, catalogue artwork or vendor assets imported.

## Validation and reproduction

17 focused tests passed (original stock/routes/counter/queue/checkout/English plus shelf-label clearances and exact 20-ID wall setting-out). Clock hands move without reuploading the wall atlas each minute; calendar/hours refresh paths checked. Runtime build succeeded with the 1,536 MB Node heap; four runtime-package checks passed. Retained the immediate predecessor's manifest chunks for cached-page compatibility.

Capture: `TOWN_CHROMIUM_PATH=/path/to/chrome-headless-shell node tools/sakura-rebuild-review.mjs --walls /absolute/evidence/dir`. This uses the actual built game at 23 October 1997, 12:20. It captures the shelf construction, entrance and dressed counter and exports the real wall-print atlas and 20 placement records. Player body alone hidden for camera framing. Software Chromium; no physical iPad, FPS or moving-camera flicker acceptance claimed. Full guard not rerun; prior no-z-fighting process SIGKILL on candidate and baseline remains unresolved.

Next: visually review new material density and sign readability at ordinary player/phone viewpoints, verify actor reaches and cooler/office motions, then continue exterior registration, reserve capacity, old upstairs save/story migration and the remaining props. Do not enable the rebuild by default until those integration steps pass.
