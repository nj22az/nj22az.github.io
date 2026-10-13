# Loading: what the phone fetches before the town runs

Measured 2026-10-13 with a headless browser against the published page (`tools/measure-load.mjs`: bytes by file
from the first request to `__JOHANSSON_RUNNING__`), before and after the first batch. The creator: "the game loads too
slow, is it possible to optimise the code or loading, can the code be consolidated? Say more with less code."

| | Before | After batch 1 |
|---|---|---|
| JavaScript fetched before the Enter button | 5 695 KB | 3 546 KB |
| Everything fetched before the town runs | 24 661 KB over 178 files | 11 943 KB over 89 files |
| Raw (unminified) source modules fetched | three.js 1 284 KB + 60 modules, one after another | none |

## Batch 1 (built)

- **The title menu imported the source tree.** `index.html` imported `title-menu.js`, which imports `save.js` and
  `friendship.js`, which import the residents, who import the town's layouts, the ferry, the ocean and three.js. The
  title screen therefore fetched 1.3 MB of unminified three.js and sixty source modules in a serial waterfall, and
  the game then fetched three.js again inside its own chunk. `scripts/build-runtime.mjs` now builds `title-menu.js` as
  a runtime entry: it shares the game's chunks (three.js once, minified) and is preloaded with them.
- **Food art as WebP.** The five `assets/food/island-*.png` (1.2–1.9 MB each, the ice cream loaded at boot by the Blue
  Coral shop) are WebP at 180–280 KB; `commerce/food-art.js` points at them. 7.8 MB → 1.1 MB.
- **Boot-time material textures re-encoded.** Nine plaster, timber and roof textures (1024², JPEG at quality ~100)
  at quality 82: 5.3 MB → 1.5 MB. Normal maps keep full chroma.

## What is still large, in order (the plan for batch 2 and 3)

1. **The game's static import graph is one 3.5 MB download before the first frame.** `game.js` statically imports
   every interior (onsen 180 KB, Sakura 160 KB, the quarters 650 KB, compact shops, Sato Ramen, the town hall), so
   they all load before Enter. Each interior should be a dynamic import when its door is opened (the chunks already
   exist; only the `import` statements in `game.js` and `enterRoom` change). Expected: about 1.4 MB off the boot path.
2. **`spector.bundle` (1.2 MB)** is a WebGL debugger. It is a separate chunk and not preloaded; confirm it is only
   imported behind the inspector flag, never in a normal session.
3. **Models at boot.** The resident figurines and display GLBs (`thuan-display.glb` 5 MB, `maneki-neko-display.glb`
   1 MB) are only needed in their rooms; load them on entry. The HDR sky (1.5 MB) could be a 512 px version on phones.
4. **The avatar code** (`swept-ponytail-mesh.js` 260 KB of source, `build.js` 137 KB, `animate.js` 125 KB) and
   `game.js` (196 KB, one file) are where "say more with less code" applies: the ponytail mesh is generated data
   that could be built at runtime from a few parameters, and `game.js` carries room entry, seating, eating, the ferry,
   the island and the audit API in one file. Splitting it by concern is a refactor to do room by room, with the test
   suite as the net.
5. **Service worker.** `sw.js` caches the runtime; a returning phone should not refetch 12 MB. Check its cache list
   covers the hashed chunks and the textures.

Rule for every batch: measure with the script before and after, and never ship a change that moves the first-frame
bytes up.
