# Office homepage port arrival

The homepage photograph is replaced by a real Minato harbour still and one randomly selected, silent arrival clip. No World JavaScript, model files or Three.js run on the homepage. The former bench feature is removed. None of the four characters carries a drink.

The offline renderer uses World's actual `createTown`, `createTownSky`, `OPENINGS` (`minato-maru`), `createSpawnScene` and player avatar API. It uses the shared collision rectangles and ground heights, moors the ferry and records the opening harbour view, descent, character gesture and gull. Recording stops before the game's return to player control. The final frame holds until the visitor explicitly replays.

The HTML always has a normal WebP harbour photograph. It works without JavaScript and remains visible if video loading/autoplay fails or motion/data-saving preferences prevent autoplay. The small controller selects a resident for the browser session, requests only that resident's clip after window load and idle time while visible, and pauses in hidden tabs or off-screen. It offers pause and explicit replay.

## Rebuild

From repository root, using the Town Playwright authoring dependency, Chromium and ffmpeg:

```
node tools/office-port/render.mjs
node tools/office-port/render.mjs --poster
node tools/office-port/encode.mjs
node tools/office-port/controller.test.cjs
```

`TOWN_CHROMIUM_PATH` can point to an installed Chromium executable. `--stills` records one opening frame per resident. Temporary PNGs are written under `output/office-port`; commit only the final media, manifest and authoring sources. Video output is 960 × 540, 15 fps, nine seconds, H.264/yuv420p with fast-start metadata and no audio. The encoder rejects any clip over 500 KB or the shared poster over 100 KB.

Inspect wide, descending and close shots for each character when World geometry changes. The controller checks exercise deferred requests, character selection, static fallback, data saving, reduced motion, visibility, manual pause and explicit replay. Actual device layout checks should accompany homepage changes.
