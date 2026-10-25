# Island tree implementation - 25 October 2026

Owner: "Implement suggested fixes", following the [island-tree CAD audit](https://github.com/nj22az/nj22az.github.io/blob/main/johansson-town/briefs/HANDOFF-ISLAND-TREES-2026-10-25.md).

## Branch and scope

Implemented on **development**, based on `955b5870e558be823e9d54e005f9420f7f93fa07`. Use **`/johansson-town/?tree-rebuild`** in a served checkout of this branch. This is a working World prototype behind its own URL flag, following AGENTS.md. No prototype art is promoted to main, no third island is added, no planting centres or timetables change, and no Linux package is published. Existing Sakura prototype flags and the retained upstairs decision are untouched.

The regular development game keeps the accepted trees. The prototype data is a lazy dynamic chunk, not part of the ordinary game's eager dependency graph. Original seven-family CAD geometry is baked by `tools/build-tree-designs.py` from the same dimensioned source used for the audit, not reconstructed with a separate tree generator.

## Delivered behaviour

- Minato's column / spreading trees use distinct fukugi and gajumaru geometry: connected limbs, joined rounded crowns, no leaf-shingle shell. The broadleaf and pine catalogue families remain available without adding new trees.
- Kitano's 75 palms, 82 canopy trees, 31 pandanus and 34 banana clumps use the new opaque indexed meshes in the existing instanced batches. Palm heights / lean variants and the existing per-instance positions and rotations are retained. Three detail levels are baked; close/middle selection has 120/135 m hysteresis, and the existing distant switch remains 240/260 m.
- Distant tree collections use the same family, variant partition, trunk bend, crown placement and instance matrices as the near collections. All measured height/width/depth and centre differences are below the proposed 5% tolerance; far samples cost less than half their near samples. The old straight-pole / flat-palm substitute is bypassed in preview mode.
- Tree colliders derive their low bark footprint from the actual selected geometry. Tropical trunk rectangles follow the model's rotation and transformed centre. The four hill rocks have a rock label rather than masquerading as tree trunks.
- Cherry geometry and seasonal logic are unchanged; its preview collider covers the visible root flare (1.12 x 1.12 m). Original production collision remains the default without the preview flag.
- CAD amendment **A1** moves the banyan aerial-root starts inboard into the substantial first limbs. Runtime site limits constrain low roots radially, preserving the park root enclosure and checked approaches. The corrected native DXF, readable vector elevations, dimensions and triangle budgets are under `docs/qa/island-trees-2026-10-25/implementation/`.

## Validation actually run

- **433/433 World guard checks passed**, 85 files, 289 s: `NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs --test-concurrency=2`.
- **16/16 focused checks passed**: tree rebuild, Kitano on-demand loading, east-lawn collision regression and runtime packaging. After final root/runtimes, the tree + runtime suites passed **10/10**, and the final retained-runtime packaging check **4/4**.
- The preview's full source town has 222 typed tropical plant colliders plus four separately labelled hill rocks. Kitano trail centres were sampled at <=0.25 m with an actual 0.28 m standing-body radius; all stayed clear. Both park bench standing approaches are clear of tree collision. Tree templates have finite unit normals, valid indices, target CAD bounds and progressive mesh reduction; the baked CAD construction checks closed components.
- Runtime rebuilt. Only the final candidate plus the previous **development production generation** are retained, not intermediate local builds. The runtime fingerprint matches the final source. The manifest proves the 634,772-byte prototype data module is lazy; no new prototype geometry is fetched by the ordinary game.
- Local browser startup was attempted and blocked before page load: Chromium `socket() failed: Operation not permitted`. No local compiled-game screenshots, World Look inspection, frame-rate or physical-device pass is claimed.
- `.github/workflows/tree-rebuild-review.yml` runs on the development push: focused checks, runtime rebuild/package checks, then `tools/tree-rebuild-browser.mjs` boots the **real compiled World** with the tree flag and captures all seven active / retained views at desktop and phone widths. Its report and images are review evidence, not physical Safari acceptance. Hosted result pending at this commit.

## Review / next action

Inspect the hosted real-game captures for canopy/branch contact, retained cherry, under-canopy cameras and shadow quality. Record any visual faults and correct them here. Physical iPad/Safari, actual desktop/iPad frame rate and the full set of World Looks remain unverified. Main remains on its accepted tree art; any later promotion must isolate these tree changes from the unrelated unapproved Sakura prototype on development.
