# Sakura shelf stickers - first implementation

Owner requested cute Japanese price tickets and shelf decorations, then authorised implementation. On `codex/sakura-retain-detail` / draft PR #378; opt-in rebuilt shop only. The ordinary shop keeps its current shelf treatment. This is separate from the wall-decoration CAD proposal, whose runtime dressing remains pending.

## Delivered

`src/world/interiors/sakura-shelf-stickers.js` builds one atlas and one merged mesh: 96 cream price tickets, three per each of the 32 shelf catalogue lines, plus nine selected decorative cards. All prices and English names read `GROCERY_ITEMS`; no catalogue, stock, package dimensions, prices or save IDs changed. The bun remains a counter item rather than receiving a shelf price. Japanese physical copy and the exact selected products/reasons live in `sakura-shelf-stickers.json`.

Original procedural paper artwork: pink sakura marks, smiling rice ball, smiling coffee cup, autumn leaf. Small recommendations identify Thuận's picks; everyday cards and the autumn snack card are decorative merchandising, not discounts. There are no sale/new-arrival claims. September-November uses the autumn leaf; other calendar months use the everyday flower. No imported illustration, external mascot or extra point lights. The existing OFL Japanese font subset is extended for these physical labels; attribution remains `docs/qa/sakura-retained-stock/OFL-NotoSansJP.txt`.

Prices: 200 x 65 mm. Decoration cards: 140 x 65 mm, or 85 x 65 mm on the narrow drink bay. Every rectangle hangs below its shelf deck, with its top 7.5 mm below the deck. Decorative cards occupy the end of their own product bay. All are in front of product bounds; none changes collisions or aisle width. Existing edge-on talkers are disabled for this candidate to prevent duplication. The original shop's default talkers remain unchanged. The new price mesh replaces candidate legacy price planes, not the product packaging atlas.

## Checks and evidence

16 focused checks passed: unchanged 33-line / 780-unit mapping, real routes, stock depletion, counter, queue, checkout, English UI, exact price equality and all 105 rectangles checked against all retained product bounds and their own bay extents. Frozen/missing time, October and January refresh paths exercised. Runtime rebuilt successfully with `NODE_OPTIONS=--max-old-space-size=1536 npm run build:runtime`; the first default-heap attempt was killed during chunk rendering. Runtime-package tests 4 passed. Full guard was not rerun for this pass; the prior no-z-fighting process SIGKILL remains unresolved, including on baseline. Static clearance checks are not a moving-camera flicker sign-off or physical-device/FPS acceptance.

`tools/sakura-rebuild-review.mjs --stickers /absolute/evidence/dir` captures the real built game with a close shelf camera and exports the actual runtime print atlas, plus ordinary review views and label placement metadata. Set TOWN_CHROMIUM_PATH to Chrome headless shell. The player body alone is hidden for camera framing; products and props are the real scene. Screenshots are progress evidence, not a completed shop sign-off.

Next: review the owner's preference for density/colour, test readable prices on physical iPad and from ordinary player cameras, then refine the selected decorative cards and continue the separate measured wall scheme. Preserve catalogue-driven prices and keep decorative offer claims truthful.
