# Office homepage bench

Four silent, pre-rendered World scenes. The homepage ships no Three.js, models, scene code or animation engine. `assets/js/office-bench.js` chooses one resident per browser session, loads only their poster, and attaches that resident's MP4 after window load and idle time while the scene is visible. Hidden tabs and off-screen scenes pause. Reduced-motion and data-saving preferences retain the poster; explicit Play is available. Autoplay refusal and failed video requests retain the poster.

The scene uses `buildPark`, the original `harbour-bench.glb`, `createAvatarActor` and World's consumption/grip animation. Fujita holds the fictional Umineko beer can; Johansson holds the original J-Coffee vending can with its measured grip/rim. Thuận and Tetsuo hold nothing. No character recipes or World gameplay are changed.

## Rebuild

From repository root, with the existing Town Playwright authoring dependency and Chromium available, plus ffmpeg:

```
node tools/office-bench/render.mjs
node tools/office-bench/encode.mjs
node tools/office-bench/controller.test.cjs
```

`TOWN_CHROMIUM_PATH` can point to an installed Chromium executable. The renderer serves only the local World and authoring files, saves temporary PNG frames under `output/office-bench/frames`, and closes its browser/server. `--stills` renders one review frame per resident. The encoder writes 480 × 360, 12 fps, ten-second H.264 MP4s with fast-start metadata, and WebP stills. It rejects videos above 80 KB or posters above 24 KB. Commit final media and manifest; do not commit temporary frames.

Inspect the seated support, resting hands and raised-can frames after changes to the World rigs. Test the actual homepage on a device after layout changes. The controller tests cover selection, deferred video requests, viewport/tab pause, explicit pause/resume, reduced motion, data saving and media failure.
