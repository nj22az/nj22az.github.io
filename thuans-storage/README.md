# Thuan's Storage

Work in progress.

Walk Thuan through Sakura Shōten's changing stockroom, collect six marked goods,
and return to the pink shop curtain. Receiving and dispatch bays connect to four
stock departments with random shelf banks and clear cross-aisles.

- WASD / arrows: walk. Shift: run. Drag: look. Escape: pause.
- Touch: drag the left half to move and the right half to look. Sticks appear at
  the initial touch position and disappear on release. Run appears while Move is
  held; hold it to sprint. Two-thumb movement/look does not change the zoom.
- List and Map open on demand and close when movement starts. Progress and Pause
  remain available in the compact top bar. There is no optional Moonwalk mode.
- Gamepad: left stick moves, right stick looks; shoulder / stick press runs.
- “Let Thuan restock” follows a real route, collects the list and returns to the
  shop. Move or select “Take control” to take over. Assisted runs do not set a best time.
- “New list” changes the layout. “Same stockroom” retains the current seed.

The original Thuan model supplies walking, running, greeting, breathing and
celebration clips. Pickup reactions add a nod and a brief hand movement. An
animated stand-in keeps the game playable while the model loads.

### Source and verification

The original export contained only a compiled bundle. Its unchanged dependency
code is preserved in `vendor/original-runtime.js`; the editable game sections are
under `src/`. No dependency installation is required:

```sh
node thuans-storage/scripts/build-runtime.mjs
node --test thuans-storage/tests/*.test.mjs
```

The build produces a content-hashed runtime and updates `index.html`. Commit both
the source and generated output. GitHub Pages serves the committed files directly.

Tests cover 300 seeded layouts, collision sliding, keyboard and touch input reset,
the actual GLB skeleton and animation weights, pause/resume, straight reverse movement, independent touch pointer ownership,
contextual control resets, and four complete
automatic restocking runs. Numerical tests use the real Three.js scene and skin;
they substitute the GPU renderer and sound. They do not verify visual rendering
or performance on a physical phone.

Play it at [nj22az.github.io/thuans-storage](https://nj22az.github.io/thuans-storage/).
