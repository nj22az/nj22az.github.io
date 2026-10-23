# Sakura starburst POP - CAD first, then runtime

Owner requested star-shaped messages written as if in crayon and explicitly required CAD before implementation. On `codex/sakura-retain-detail`, draft PR #378, based on `f3df6f3c`. This pass affects the opt-in rebuilt shop only.

## CAD and setting-out

The CAD was generated and audited before the runtime was edited. `Sakura-Starburst-POP-CAD.dxf` contains six closed, 24-vertex paper cut profiles in millimetres at 1:1, with MESSAGE_SAFE and DIMENSIONS layers. Profiles are arranged separately in model space for drafting. `Sakura-Starburst-POP-CAD.svg` is an A3 sheet at 1:2, including Japanese outlined text, English meanings and sizes. Print at 100%. `placements.json` gives the six exact room centres and shelf elevations derived from the preceding actual-game capture.

The canonical cut outlines, message, colour, intended product and reason live in `src/world/interiors/sakura-starburst-pop.json`. The runtime triangulates those same polygons, rather than approximating a star with a rectangular sign. Five are 150 x 95 mm; the coffee card is 105 x 90 mm. All tops sit 7.5 mm below their middle shelf deck. Six replace existing rectangular cards; three rectangular everyday cards remain, keeping the total to nine decorations. The 96 catalogue-driven price tickets remain separate and unchanged.

## Visual implementation

Yellow and pink cut card; red, green or blue wax-pencil lettering; individually tilted glyphs, small pigment gaps and two translucent tape tabs. The letters and shapes are original procedural code, using the existing OFL Japanese font source/subset. No external illustrations, mascots or new rendering dependencies. Geometry remains in the shelf atlas's single merged mesh.

P01: shopkeeper's recommendation, rice balls. P02: today's recommendation, bento. P03: take a little break, canned coffee. P04: snack time, crisps. P05: well done today, chocolate. P06: take a breather, pudding. These are personal messages, not discounts, new-arrival claims or new services. Japanese belongs to physical cards; game UI stays English. No product dimensions, prices, stock or save IDs changed. This pass does not apply the separate wall-decoration CAD.

## Checks and reproduction

16 focused checks passed (rebuild stock/routes, counter, queue, checkout, English and shelf details). They include six 24-point cut outlines, all 105 label/card envelopes versus all products, bay extents, exact prices and calendar refresh. Four runtime-package checks passed; runtime build succeeded with a 1,536 MB heap. CAD DXF reopened/audited without errors. Actual-game evidence uses `tools/sakura-rebuild-review.mjs --pop /absolute/evidence/dir` with TOWN_CHROMIUM_PATH set; captures crisps and chilled-food close-ups and the actual runtime atlas, with the player body hidden for framing only.

CAD reproduction: Python with ezdxf/fonttools, set SAKURA_JP_FONT to the original Noto Sans JP TTF, then run `python3 build-cad.py` from this directory. The generator writes the source polygon data and setting-out schedule. The SVG outlines its Japanese glyphs so a viewer does not need the font installed; OFL notice remains in `../sakura-retained-stock/OFL-NotoSansJP.txt`. Inkscape can render the SVG preview.

Physical-iPad readability and a moving-camera flicker sign-off remain outstanding. Full guard not rerun; previous no-z-fighting process SIGKILL remains an environment limitation reproduced on baseline, not a green check or a demonstrated geometry defect. Continue the wider interior/props/actor/save/exterior integration separately.
