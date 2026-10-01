# Thuan's Storage

Work in progress.

Walk Thuan through Sakura Shōten's changing stockroom, collect six marked goods,
and return to the pink shop curtain. Receiving and dispatch bays connect to four
stock departments with random shelf banks and clear cross-aisles.

### The night's boss

After Sakura closes, Thuan restocks it from the back room, and the back room has a hole in
it now, low in the west wall, down to the old sea cave under the headland. Each night one of
the townsfolk climbs up through it in their Bizarro Minato suit from Johansson Town's cave
dungeon (`johansson-town/src/dungeon/costumes.js`), talking backwards. The suit is the
behaviour:

- **Gorilla** (the bus driver): knuckle-walks; from a distance down a clear aisle it beats
  its chest, then charges in a straight line. Run it into the racks and it sits down seeing
  stars. Too close and it jumps and pounds the floor.
- **Crocodile** (Officer Mori): lies flat like a log by the goods on your list and drifts
  closer; it lifts its jaws, lunges, snaps, then rolls over on its back, worn out.
- **Bear** (Tetsuo): ambles after you, rears up roaring, swipes, then sits down heavily.
- **Donkey** (Mrs Sato): grazes by the goods and will not be moved. Come up in front and she
  brays you back; come up behind and you get both back hooves, after which she is winded.

The boss is plainly the townsperson playing pretend: their own avatar from Johansson Town's
creator, in their own clothes, with the animal's hood in place of a hat, furry paws and a
tail (`johansson-town/src/dungeon/pretend.js`), loaded from the town in the browser. Those
modules import the town's Three.js; the import map in `index.html` hands them
`vendor/three-r186/` instead (MIT, see its LICENSE), the same version this game renders with,
because the r186 renderer cannot draw r170 objects. Where the town's code cannot load (the
tests' sandbox), a simple mascot body in the same colours stands in.

Each has a tell before it goes for Thuan and a worn-out moment after, with stars round its
head. Shoo it then (Space or F, the gamepad's A, or Shoo! on touch): any other time it does
not notice. Three shoos and the head comes off, the townsperson bows and goes back down
the hole, leaving ¥200 in old cave coins. Being hit only knocks Thuan over for a moment;
the list can always be finished. Played from the town (`?from=johansson-town`), the coins go
into your purse and the town hears who it was.

- WASD / arrows: walk. Shift: run. Drag: look. Escape: pause.
- Touch: Move and Look pads, with a held Run button.
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
node --test thuans-storage/tests/playability.test.mjs
```

The build produces a content-hashed runtime and updates `index.html`. Commit both
the source and generated output. GitHub Pages serves the committed files directly.

Tests cover 300 seeded layouts, collision sliding, keyboard and touch input reset,
the actual GLB skeleton and animation weights, pause/resume, and four complete
automatic restocking runs. Numerical tests use the real Three.js scene and skin;
they substitute the GPU renderer and sound. They do not verify visual rendering
or performance on a physical phone.

Play it at [nj22az.github.io/thuans-storage](https://nj22az.github.io/thuans-storage/).
