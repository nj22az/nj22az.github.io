# Sakura: CAD-first counter density

Owner approved counter/endcap elevations followed by one dressed counter bay. Candidate only (`?sakura-rebuild`), branch `codex/sakura-retain-detail`, draft PR #378. No default-shop change, merge or deployment.

## Drawing and self-audit before construction

`src/world/interiors/sakura-counter-density.json` is the shared millimetre schedule. Run `python docs/qa/sakura-counter-density/build-cad.py` for the editable DXF and two-page vector PDF. The first sheet is the actual counter proposal; the second records the existing 900 x 450 x 1350 mm endcap and deck datums for a later stocking pass.

The first cabinet proposal was self-audited and corrected: upper pack fronts exceeded Thuận's actual avatar reach. Rev B places the dispenser from 850 to 1400 mm, with 600 mm rear storage depth to put its pack fronts at the back-worktop edge. The visual audit also added four 70 mm steel support feet between the dispenser and the worktop, avoiding an unsupported gap. Four rows of twelve 70 x 85 mm fronts remain below the retained tobacco header and clear of all wall notices. `audit.json` records the finding, correction and static reach calculation from the actual recipe, not a guessed human height. The assumed shoulder approach is CAD X=13.05 m; staff aisle remains 1200 mm. Static reach is not an accepted animation/contact test.

Root `AGENTS.md` now makes CAD -> self-audit -> corrections -> construction -> actual-result verification mandatory for every spatial remodel. Town instructions link that rule. It creates no additional user approval gate.

## Construction

- Forty-eight original fictional cigarette-pack fronts, numbered slot tags, steel trays and rear cabinet. Scenery only: no tobacco purchase interaction added.
- Oden vat within its original 450 x 600 mm counter footprint, divided broth compartments, daikon/fishcake/fish-ball forms and a partly opened timber lid.
- A small two-level gum display with original printed wrappers, a labelled prize-ticket stand, and a supported scanner cord alongside the retained scanner, change tray and register.
- Warm emissive strips inside the retained hot-food cases. No additional shadow-casting lights.

Original 33 catalogue lines, 780 counted units, packaging, stock/save IDs, 96 price tickets and existing gameplay remain. Endcaps, hanging promotions and other wider atmosphere suggestions are not claimed complete; the endcap is CAD-only. Prize drawing is not implemented. Full worker picking/restocking contacts, physical-device/FPS/flicker acceptance and earlier exterior/storage/save integration remain open.

## Checks and captures

Run `node --test tests/sakura-rebuild.test.mjs tests/sakura-counter.test.mjs tests/sakura-queue.test.mjs tests/sakura-checkout-feedback.test.mjs tests/runtime-package.test.mjs` after `npm run build:runtime`.

Capture the actual built game with `TOWN_CHROMIUM_PATH=/path/to/chrome-headless-shell node tools/sakura-rebuild-review.mjs --density /absolute/evidence`. Player body alone is hidden for framing. Thuận is the game's actual actor. Capture report records the CAD revision, geometry metadata and page errors. Software Chromium is not a physical iPad test.

Final validation: 21 focused/runtime-package checks passed; build passed; final real-game capture had zero page errors. Full 71-file guard: 363/364 passed, no-z-fighting worker exhausted the 1536 MB heap. No full guard or flicker sign-off.
