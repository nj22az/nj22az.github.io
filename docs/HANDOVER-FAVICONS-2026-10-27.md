# Favicons — 27 October 2026

The owner first asked for the favicons of The Office of Nils Johansson, Hotels & Parking and
Johansson World to be redrawn in Python as simple Lucide or pixel icons. The pixel version was
rejected ("too ugly"); the follow-up was "make them easier to discern … use highest possible
quality", then "Push to main when it's done".

**Source of truth: `tools/draw-favicons.py`.** Every shape, letters included, is computed
geometry on a 512-unit tile (no `<text>`, no fonts, no rasters). Straight edges sit on a
32-unit grid, so the 16 px tab icon is built from whole pixels. Running it writes the SVGs
and renders the PNGs with Chromium (`tools/render-favicons.cjs png`), so they match what a
browser draws. Never edit the SVGs or PNGs by hand.

| Icon | Picture | Files |
| --- | --- | --- |
| Office | the seal: cream stamp disc on brand teal `#3ea88c`, NJ in warm ink `#3d3a37`, letters 7 px tall at 16 px | `assets/images/favicon.svg`, `assets/images/apple-touch-icon.png` (180) |
| Hotels & Parking | near-black ink `#08131a`, free-parking-green P `#22c55e`, a separate white bed under it | `assets/images/favicon-hotels.svg`, `assets/images/apple-touch-icon-hotels.png` (180) |
| Johansson World | island navy `#294b60`, red hip roof, cream walls and doorway, sand island, teal sea, a small sun in the corner clear of the roof | `johansson-town/assets/icons/town.svg`, `town-192.png`, `town-512.png` (manifest, service worker, `world/`, `avatar-creator/`) |

The hotel page links its own icon (`tools/build-hotels.py`); `world/index.html` links the
World icon; every other page keeps its existing links to the office icon.

## How it was designed

A workflow ran four independent sets (line pictograms, flat illustration, monogram/emblem,
geometric reduction), three judges (16/32 px legibility, craft and brand, distinctness), a
refiner and two skeptics per round who named each icon before reading labels. Scores:
B 43.2, A 41.2, C 37.8, D 29.0. After three rounds the skeptics still failed the set at a
true 16 px: NJ too small (5 px), the pale mint hotel tile invisible on a white tab, the
world house reading as a mushroom under a large sun. Those were then fixed by hand in the
committed script: larger and heavier letters filling the seal disc, the hotel set back on the
dark ink tile with the bed as its own shape clear of the P, a taller house with a small sun
in the top-right corner. `tools/favicon-pixels.cjs` renders the true 1x 16/32 px pixels on
light and dark tabs plus a grayscale row; that view was reviewed for the final set.

## State and checks

Published to main on the owner's word ("Push to main when it's done") as [`f559293b`](https://github.com/nj22az/nj22az.github.io/commit/f559293b51090721959d0f33eaa490966dbe3f48); [Pages run 40469053879](https://github.com/nj22az/nj22az.github.io/actions/runs/40469053879) succeeded; all seven icon files and `world/index.html` match the commit live. World guard [run 40469054295](https://github.com/nj22az/nj22az.github.io/actions/runs/40469054295) was started by the icon change; see HANDOVER.md for its result.
Checks: `draw-favicons.py` runs clean (its geometry asserts pass); true-pixel and tab-strip
renders reviewed; hotel unit tests and page `--check` pass. Installed copies of the World
app keep the old icon until the next service-worker version; browser tabs pick the new one
up on reload. Not tested on physical devices.
