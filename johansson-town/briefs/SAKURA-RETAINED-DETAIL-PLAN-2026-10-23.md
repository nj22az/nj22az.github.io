# Sakura: new layout, retained detail

23 October 2026. Branch `codex/sakura-retain-detail`, based on current main. Owner authorises branch work and progress screenshots; no merge or deployment requested.

## Intended result

Replace the spatial arrangement, not the shop's identity. Fit the single-storey CAD interior to the existing 14.26 x 11.00 m exterior envelope. Retain original Johansson products, packaging, flavours, decorative character, usable equipment, commerce and Thuận's daily work. WC in rear storage/staff area; only a compact external stair reaches the roof tank/escape route. No occupied upper floor or internal stair.

The source of dimensions is Rev E in draft PR #373. That PR is still open and has conflicts; do not merge it wholesale into this branch. This branch copies its isolated review geometry for the stock-fitting experiment only. Existing main is the source of product assets and gameplay. The prototype is not the final game shell or material treatment.

## Stage 1 — prove product retention (implemented on this branch)

The branch review page imports the real, unchanged `sakuraProductTemplate`, `shopProductTemplate`, product catalogue, original packaging atlas and flavour shader. It removes the CAD's anonymous product blocks from view and stocks the new fixtures with those original assets. No product is scaled to fit.

- All **33 catalogue lines** mapped, with **780 units of original configured shelf capacity** retained in the mapping. **1,254 displayed facings** include display-only extras, as in the existing shop. This is not an active stock simulation.
- Original food geometry, clear wrappers, drink shapes and flavour variants retained. Original printed delivery cartons and three magazine templates included as examples; the complete calendar-driven magazine rack is a later stage.
- Actual package bounds determine bay widths and spacing. Tissue/toothpaste bays need unequal widths. Buns use a small shelf inside the transparent steamer case.
- The two original packaging images match the branch assets by Git blob SHA. Product data fingerprint: `b146a268e43c91b29b36d0ba24cc6a9680f8dd8c1b9a861b942c6c0cb53f7807`.

| Destination | Existing lines |
| --- | --- |
| Rear drinks cooler | tea, coffee, water, orange, cola, soda, beer |
| West fresh chiller | rice/onigiri, sandwich, bento, pudding, yogurt, milk |
| Island 1 | bread, soup, peaches, noodles, curry, soy, tuna |
| Island 2 | chips, crackers, biscuit, chocolate, candy |
| Island 3 | notebook, postcard, battery, detergent, soap, tissues, toothpaste |
| Counter steamer | bun |

The eight-door cooler has spare display width; do not invent a product merely to fill it. The chest freezer's final merchandise still needs identification outside the 33-line catalogue.

## Stage 2 — one measured production layout

Introduce one production layout definition containing fixture footprints, shelf planes, doors, product bays, colliders, approach positions and staff service points. Derive render placements, product slots and navigation from it. Keep current product IDs, prices, flavour cells, recipes and inventory keys.

Use an explicit rigid transform between the CAD SW-origin frame and the game's current centred room frame. Do not stretch the entire old shop or independently type new coordinates into every module. Check the existing exterior's glazing, shell edges and floor height against the rectangular clear area; the old interior has a stepped rear polygon, not the new full rectangle. Register the front entrance and the proposed relocated rear door with the actual street/back lane. Rear door X=11.50 m remains a proposal until registration passes.

Rebuild shelf boards from the same shelf-plane data used for products. Preserve cream plaster, honey timber, green ends, original print and the established cartoon material/Look pipeline. Keep the CAD's simplified industrial fixture appearance as a review aid only. Do not replace the exterior with chain branding.

Acceptance: correct exterior footprint and entrance alignment; no product rescaling; shelves/products aligned within 2 mm; actual Thuận and player fit the 1,050/1,150 mm aisles and 1,200 mm staff aisle in first and third person. Confirm the 780 mm counter using Thuận's rig and hand contacts. The current eye-height slider is not actor acceptance.

## Stage 3 — relocate all detail deliberately

| Existing source | Retain and adapt |
| --- | --- |
| `sakura-food-products.js`, `shop-product.js`, `shelf-flavours.js`, `products-data.js` | Same original geometry, labels, food interiors, wrapper material and flavour variants; new placements only. Catalogue source remains `data/studio/products.json`; do not hand-edit generated data. |
| `sakura-counter-detail.js`, `sakura-cheer.js`, `sakura-checkout.js` | Till/drawer, bell, oden, hot case, steamer, microwaves, signs and service hand-offs. Parameterise fixture anchors before moving. Do not copy an entire old room into the new room. |
| `shop-refrigerator.js`, `sakura-life.js` | Working door handles, opening pivots, front/staff doors and calendar decorations; remeasure sweep clearance and interact positions. |
| `sakura-magazine-rack.js`, `magazine-issues.js`, `magazine-art.js` | Full dated magazine/newspaper rack, covers and calendar updates along the front window. Initial prototype's three print templates are not a replacement for this system. |
| `sakura-baskets.js`, `sakura-cap-stand.js`, `sakura-corners.js` | Shopping baskets, original cap display, umbrella stand and applicable impulse props. Reserve space and clear approaches before placing. |
| `sakura-dressing.js`, `sakura-specials-board.js`, `sakura-shelf-edge.js`, `sakura-surfaces.js` | Medicine shelf, original posters, seasonal decor, price rails, specials and shop surface detail. Reattach to actual walls and shelf fronts. |
| `sakura-backroom.js`, `sakura-restroom.js`, `sakura-small-office-build.js`, `sakura-office-dressing.js` | WC/basin, stock cartons, daisha, crates, extinguisher, desk, ledger, safe, tea facilities, archive and staff rest items; fit into ground-floor rooms. |
| `old-town.js` / Sakura exterior dressing | Preserve the family-shop frontage, flowers and established street identity; register the roof stair and rear delivery opening without blocking the lane. |

Inventory every mesh/interaction with its source, purpose, destination and acceptance result. Nothing disappears merely because it does not fit the first bay. Resolve items against the 1997 setting: the old ATM conflicts with the agreed reserved bay; keep its source asset intact and record the decision rather than silently installing an anachronistic service. No speculative new product branding.

Acceptance: matching before/after views of counter, chiller, shelf labels, magazines, window/flower display, office and stockroom. Each interactive retained item performs its original action. Keep all relevant slots discoverable for the storyteller and Studio.

## Stage 4 — preserve the working shop

Adapt `buildSakuraInterior`'s returned contract: `layout`, `unitPositions`, `unitApproaches`, `accessShelf`, `updateStock`, `cashDrawer`, doors, lighting, decorations, lifecycle and small-office hooks. Wire new slot matrices into the existing stock code. Preserve existing counted capacities, stock balances, reserve, cash, receipts and save identities. Display-only facings must not become sellable units or inflate inventory.

Move clerk/queue/browse/restock points together with their fixtures. Validate Thuận arriving, opening, serving, using equipment, reaching the WC/rest area, receiving delivery and closing; do not make her walk through customers, furniture or the raised office step. Use the level receiving-to-sales opening for carts. Preserve the web/Linux edition distinction.

Quantify storage before production sign-off: default reserves total 1,560 items across the 33 lines; existing saves can retain up to 60 reserve items per line (1,980 overall). Count real pack/carton dimensions and usable shelving, plus empty crates, archive and seasonal decor. A few drawn cartons do not establish capacity; do not silently move stock off-site.

Acceptance: buy/return/restock/sold-out, correct product pick points, refrigerated-door access, save/reload and closing-day behaviour; same stable inventory IDs and balances. Test staff/customer paths and cart turning with actual bodies and fixtures, not just a sampled rectangle.

## Stage 5 — remove upstairs safely, integrate and review

Retire the internal stair and upstairs entry points, directory/story cameras and office-room assumptions as one change. Migrate saves made upstairs to a clear ground-floor staff arrival while preserving player identity, money, ownership, inventory and travel state. Keep the roof's service/escape route separate from an occupied upper floor.

Audit imports/references before removing old builders; old data/assets remain until all callers are reconciled. PR #364's internal-stair design is superseded by the owner's one-storey decision. PR #363's proposed alcohol consolidation remains open and must be reconciled if merged; do not reset its products/trade changes. PR #366 remains older planning context.

Run the focused product/layout/stock/arrival/camera/save/no-z-fighting/budget checks, rebuild the runtime, run the runtime-package test and full CI guard, then actual-game desktop/phone screenshots and iPad review. Check performance using the same views/Look on baseline and candidate; optimise batching, shared textures and visibility rather than removing detail. No main merge or live replacement until owner review.

## Evidence and current limits

The branch prototype passed software Chromium checks at 1440 x 1000 and 390 x 844: all five camera modes; no page errors or failed assets; all 33 IDs; 780 configured counted capacity; 1,254 displayed instances; zero overlapping product bounding boxes, non-finite bounds or products outside the clear box. Original packaging images loaded successfully.

Measured draws/triangles (not FPS): overview 132/171,858; entrance 78/74,676; clerk 122/135,454; office 111/113,242; roof 149/172,750. The extra detail has a measurable cost; compare the real game before setting budgets.

Screenshots: overview, aisle, fresh-food shelf and phone layout. They show the actual branch prototype, not a live-game implementation. Collision navigation, actors/hand contact, operational stock behaviour, complete prop retention, production materials/exterior, saves, physical iPad and full game guard remain unverified. The previous downloaded HTML stalled in the owner's iPad attachment viewer; do not repeat that as an accepted delivery route. A hosted review URL remains future work.

## Stage 2 working candidate — 23 October 2026

The owner added Japanese Miniature Scenes and the other useful konbini repositories as supporting inspiration; see [the reference register](../docs/research/sakura-references.md). Proceeding on the existing branch is authorised; a merge/deployment is not.

The real `buildSakuraInterior` now has an opt-in `?sakura-rebuild` candidate. The shell, stock fitting and layout are reusable source modules, with the same rigid translation into the existing shop frame (CAD metres to room: x−6.95, y, 3.91−depth). The default game remains on the existing shop while the replacement is accepted.

The candidate uses the standard shop controller/character system. Product slots, approaches, queues and restock jobs read the display's returned layout; no product IDs, counted capacities, prices or stock-save keys change. Original register/drawer, scanner, cash tray, microwave, counter supplies, copier details, hot food, baskets, price channels/tags and the complete dated magazine rack have been adapted. Eight independently opening cold doors and the existing smooth automatic front-door mechanism are connected. New source strings for physical Japanese signs live in separate JSON; controls/inspect actions remain English. The sign font subset is embedded under the existing OFL notice.

Fitting corrections discovered by actual route tests: office openings widened to 1.10 m; trolley parked against the east dry-stock rack; safe/chair adjusted to clear the route; desk has a supported top and legs so the chair can tuck underneath. The office floor stays level in this candidate, removing the proposed 150 mm step from the CAD review. This is an explicit design difference, not a claim the earlier drawing is unchanged. The clerk's old idle stand sequence is not reused at obsolete coordinates; the candidate waits at its new till between jobs until the full routine is mapped.

Focused checks exercise every SKU approach with a 0.36 m radius walker, the staff approach and receiving, queue/browse clearances, counted-slot depletion/refill, independent doors and the drawer contract. These do not establish actor hand contact, complete prop retention or physical-device performance.

Still needed before replacement: migrate the remaining original detail and office/rest/storage functions; measure actual reserves; align the final exterior/rear delivery/roof service route; handle all upstairs save/prompt/story references; validate real customer checkout/restocking/hand contacts and final materials; review actual-game desktop/phone/iPad evidence. Do not enable the candidate by default merely because it boots.
