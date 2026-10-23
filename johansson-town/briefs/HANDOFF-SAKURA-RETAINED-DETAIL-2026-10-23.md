# Sakura retained-detail implementation handover — 23 October 2026

## Owner request and scope

Owner approved the improved layout visually, asked to retain the old konbini's products/items/detail, then requested a plan, branch work and progress screenshots. Work is on `codex/sakura-retain-detail`, [draft PR #378](https://github.com/nj22az/nj22az.github.io/pull/378), based on main `9589f90eecff71a64993f196b8cdd6d68064a530`. No merge/deployment requested. The single-storey decision supersedes older internal-stair/upstairs instructions for this replacement.

## Delivered

[Implementation plan](SAKURA-RETAINED-DETAIL-PLAN-2026-10-23.md) defines five stages: retain products; create one measured production layout; relocate the complete prop inventory; preserve the working shop; migrate upstairs saves and integrate with actual-game acceptance.

Source/evidence through commit `fcbb2b2c2a5f9ecc0c931d69f9100f68504d6c00`. Review prototype: `docs/qa/sakura-retained-stock/index.html`. It directly imports existing main product templates, packaging material and flavour code. It does not copy/reinvent the products or edit generated product data. The isolated CAD review geometry comes from #373 with optional placeholder stock disabled and transparent steamer fittings. It is not the final production shell/material treatment.

33 original catalogue lines mapped; 780 original configured counted shelf capacity; 1,254 static display facings including extras. Original food interiors and wrappers, flavours, printed cartons and three example magazine templates. No product rescaling. The original 2 packaging atlas image blob SHAs match the branch (`07b4d95d8571190d78603b34921b27678222aa51`, `9792a6545ddeac3c539a93aa32336b2a85ec6d49`). Tissue/toothpaste bays were widened according to actual bounds. Catalogue fingerprint is in `checks.json`.

## Checks actually run

Three module syntax checks passed. `verify.mjs` ran in official Chrome-for-Testing headless shell with SwiftShader at 1440x1000 and 390x844. All five preset camera modes rendered. No page errors or failed assets. 33 IDs, configured capacity 780, 1,254 facings; zero overlapping product bounding boxes, non-finite bounds or products outside the clear rectangle. Phone width 390, panel initially collapsed. Rendered counts: iso132/171858 triangles, door78/74676, clerk122/135454, office111/113242, roof149/172750. These are not FPS or physical-GPU measurements.

Screenshots captured and visually inspected: overview, aisle, fresh-food close-up, phone. The first three were saved and delivered as progress evidence; they show the actual branch prototype. The old attachment HTML stalled at Loading model in the owner's iPad viewer, so do not claim that route is usable. No hosted review URL has been deployed.

Reproduce from a normal full checkout: serve `johansson-town/`, open `docs/qa/sakura-retained-stock/`, or run `SAKURA_CHROME=/path/to/chrome-headless-shell node johansson-town/docs/qa/sakura-retained-stock/verify.mjs` with Playwright installed. Optional `SAKURA_PROJECT_ROOT` points to the town folder and `SAKURA_EVIDENCE_DIR` selects capture output.

## Remaining work

Stage 1 demonstrates product reuse only. Complete calendar magazine rack, caps, flowers, medicine, posters, price rails, original counter details, backroom/office props and final materials are still to relocate. The 33-line catalogue does not establish all decorative items or freezer stock. No live-game builder, runtime, schedule or save files changed. The real actors, hand contacts, queue, restock interactions, working fridge doors, collision/nav, capacity for actual reserves, old-save migration and physical-iPad acceptance remain pending. No game CI guard claimed.

Next: inventory all source props and interactions using the plan's module table, then introduce a single production layout and rigid CAD-to-room transform. Register the actual exterior/glazing/front entrance and proposed X11.50m rear delivery relocation before wiring navigation. Measure reserve storage (1,560 default units, up to1,980 under existing save caps) without silently relocating it. Retain stable product/save IDs and the `buildSakuraInterior` return contract. Use actual Thuận for the 780mm counter, 800mm depth and shelf sightlines.

Related PRs verified open: #373 CAD review (conflicted), #366 older retained-footprint plan, #364 older complete internal stair, #363 alcohol consolidation stacked on #362. Do not merge #373 wholesale or revive the superseded upper floor. Reconcile #363 if it lands. Final replacement needs runtime build, focused tests, full CI guard, actual-game comparisons and owner review before main.

## Stage 2 supersedes the prototype-only status above

The branch now includes an opt-in actual-game candidate, selected with `?sakura-rebuild` (append `&sakura-rebuild` to existing query strings). Default play keeps the existing shop. `src/world/interiors/sakura-rebuild{,-shell,-layout,-stock}.js` provide the new builder, a single CAD-to-room transform, collision/layout data and the original product system. Japanese physical sign text is in `sakura-rebuild-signs.json`; existing English UI auditing remains unchanged. The real game controller uses the candidate layout for customers, queue positions, shelf approaches, staff and receiving. Old upstairs walk triggers are disabled for this candidate only.

Reused: all 33 unchanged catalogue templates and packaging, 780 counted shelf units, price rails, original detailed register/drawer/scanner, two original microwaves, counter supplies, copier detail, hot food, baskets and calendar magazine display. Stock depletion/refill and eight cooler hinges are wired. Decorative excess facings are not sellable stock. The existing Japanese font subset is embedded for physical signage, under its existing OFL notice. No external inspiration code/assets have been imported.

Route corrections: 1,100mm office openings, level office instead of the proposed 150mm step, stock cart against the rack and safe/chair moved to clear navigation. Tests use the actual room walker at 360mm radius, checking all 780 stock approaches plus staff, receiving, queue and browsing destinations. These checks establish traversability; they do not establish hand contacts, realistic reserve capacity or complete staff routines.

Validation: focused builder, stock, counter, queue, checkout and English checks 15 passed; runtime build succeeded; runtime package checks 4 passed. The full guard completed 360 of 361 checks; the no-z-fighting test process was killed without a geometry assertion. An isolated run on unchanged baseline source also ended in SIGKILL. Do not call the full guard green or infer a proven geometry defect. Immediate predecessor runtime manifest files were retained for cached-page compatibility.

Reproduce actual-game evidence: `npm run build:runtime`, then `TOWN_CHROMIUM_PATH=/path/to/chrome-headless-shell node tools/sakura-rebuild-review.mjs /absolute/evidence/dir`. This launches its own server, enters the real game, freezes 23 October 1997 at 12:20 and captures 1280x800 entrance, checkout and aisle views plus 390x844 mobile. The player body alone is hidden for camera framing; Thuận remains the actual game actor. Software Chromium, not a physical iPad. See the capture report for page errors and actor state. These are progress images, not final visual acceptance.

Reference register: `docs/research/sakura-references.md`, including the owner's Japanese Miniature Scenes addition and the useful konbini topic projects. Use for atmosphere, merchandising and visit rhythm; the fixed exterior shell governs proportions. Source descriptions/READMEs were reviewed, not licenses for asset reuse.

Next: complete remaining original decorative/office/backroom props, validate Thuận's reach and each transaction/restock animation with residents, register the new interior against the actual exterior/doors, measure reserve storage, reconcile old upstairs saves/story destinations, and rerun acceptance on a normal environment plus physical iPad. The candidate is deliberately not enabled for default play. Main advanced in unrelated Studio work; preserve its newer handover entries when integrating. No merge or deployment authorised.

## Wall decoration CAD - 23 October 2026

Owner requested a CAD drawing to establish wall decoration capacity before implementation. Added `docs/qa/sakura-wall-decoration/`: two A2 SVG sheets, editable millimetre DXF, 20-ID JSON/CSV placement schedule, generator and validation report. Basis is actual candidate geometry at `bdb7c824`; no runtime changed. The owner receives PDF and rendered previews separately. North sales boundary and rear shell are distinct; office observation glazing stays protected. Existing warm cream/timber and original J Coffee/Sakura/flower artwork guide the scheme. Headers sit above chillers; the full front graphic envelopes occupy 2.77% of glazing. No entrance, office-window or cooler-air decoration. The candidate rear-door relocation still requires exterior registration.

Checks: 20 placements, bounded heights/face extents, no same-face overlap, west canopy and front entrance clear, DXF reopen/audit zero errors. Two A2 PDF pages rendered and visually inspected. No gameplay tests run for this drawing-only change; previous gameplay limitations remain. Next: connect each ID to original assets, replace duplicated header boards, then inspect actual-game cameras, door/loading/air clearance and surface flicker. Drawing is a proposal, not completed runtime dressing. See the drawing README for reproduction and exact CAD-to-Three coordinate/normal conventions.

## Shelf stickers implemented - 23 October 2026

Owner authorised the cute Japanese shelf treatment. Added candidate-only atlas/merged mesh: 96 real catalogue price tickets and nine small paper cards, original sakura/rice-ball/coffee/leaf drawings, selected Thuận recommendations, Japanese physical labels and month-aware autumn artwork. Existing product packaging, prices, stock/save IDs and ordinary-shop default treatment remain unchanged. Existing candidate edge-on talkers and old price planes are replaced to avoid duplicate labels. Font subset extended under the existing OFL notice. Details and reproduction: `docs/qa/sakura-shelf-stickers/README.md`.

Checks: 16 focused tests passed, including prices versus source catalogue, 105 ticket/card bounds versus all products and own shelf bays, existing stock/routes/counter/queue/English checks and calendar refresh. Build passed with 1,536 MB Node heap after the default-heap attempt was killed; four runtime-package tests passed. Real built-game close-up and actual print atlas captured. Full guard/flicker scan not rerun; prior scan SIGKILL and physical-iPad acceptance remain open. This is the first shelf-detail implementation, not application of the separate wall CAD or completion of backroom/animation/exterior/save integration.
