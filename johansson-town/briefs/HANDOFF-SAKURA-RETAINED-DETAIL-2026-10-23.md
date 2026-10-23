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
