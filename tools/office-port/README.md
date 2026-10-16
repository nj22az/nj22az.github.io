# Live homepage harbour

The homepage keeps its WebP harbour photograph while a compact Three.js scene loads after window load, idle time and viewport visibility. Reduced-motion and data-saving preferences keep the photograph until the visitor explicitly requests 3D. No game boot, town simulation, traffic logic or audio runs on the homepage.

The scene reuses the actual harbour and Minato Maru geometry, and builds the actual Johansson, Thuận, Fujita and Tetsuo avatars with World's shared character and gesture code. Separate shuffled character and location bags in local storage avoid consecutive repeats and show every option before a bag resets. Positions vary slightly within safe standing areas. The three views are the outer quay, pier end and ferry bridge wing overlooking the vehicle deck and port.

The complete first frame is revealed only after geometry, textures and shader compilation finish. Loading/rendering errors retain the still; context loss never reloads the page. The short arrival runs at up to 30 fps, settles, then stops requesting frames. It pauses off-screen and in hidden tabs. Replay restarts the current arrival; Another arrival changes character and location. Dragging or left/right arrow keys adjust the camera within a bounded view. The homepage identity and About link remain available.

## Rebuild

Install Town's authoring dependencies with `npm ci` in `johansson-town`. Chromium and ffmpeg are authoring tools only. `TOWN_CHROMIUM_PATH` may specify an installed browser; `PORT_BUILD_PACKAGE` may specify an alternative package.json beside installed esbuild.

```
node tools/office-port/bake.mjs
node tools/office-port/build-live.mjs
node tools/office-port/live-posters.mjs
node tools/office-port/controller.test.cjs
```

`bake.mjs` selects complete nearby meshes from the actual town, freezes and merges them by material, welds vertices, quantises positions to 16-bit buffers, reduces textures to at most 256 pixels, strips game-only material history and packs typed geometry buffers with embedded WebP images. It rejects scene downloads over 4.5 MB. `assets/office-port/scene.json` records the resulting size and geometry statistics. `build-live.mjs` bundles only character/rendering code, with Three.js shared from World's existing vendor module. Commit the generated runtime and scene along with their source.

`live-posters.mjs` generates matching still assets from the same live renderer and complete-frame gate. It writes temporary review images under `output/office-port/live`; publish only the finished WebP assets. Existing MP4 files are retained for old cached versions of the page; the current homepage does not request them.

Controller checks cover deferred imports, all character/location choices, preferences, manual controls, complete-frame reveal, failed loading, selection races, tab/viewport visibility, and disposal. Inspect generated compositions before publication; actual device performance and touch layout still require device checks.
