# Thuan's Storage

Work in progress.

Walk Thuan through Sakura Shōten's changing stockroom, collect six marked goods,
and return to the pink shop curtain. Receiving and dispatch bays connect to four
stock departments with random shelf banks and clear cross-aisles.

### The night shift

After Sakura closes, Thuan restocks it from the back room -- and the back room has a hole
in it now, low in the west wall, down to the old sea cave under the headland. Bizarro
Minato comes up through it: the townsfolk in monster suits from Johansson Town's cave
dungeon (`johansson-town/src/dungeon/costumes.js`), two or three a night, talking
backwards. Each one waddles to a carton on Thuan's list, rummages through it for a few
seconds, lifts it over their head and carries it back to the hole.

- Shoo them (Space or F, the gamepad's A, or the Shoo! button on touch): a shooed visitor
  drops the carton where they stand and goes back down the hole, leaving ¥50 in old cave
  coins. Bump into one and you get bopped on the head.
- What gets down the hole is lost. The run still ends at the pink curtain with what is left.
- Played from the town (`?from=johansson-town`), the result goes back to Sakura: the saved
  goods are restocked, the lost ones stay sold out, the cave coins go into your purse, and
  the lost cartons turn up in the sea cave's chests, where bringing them out puts them back on
  the shelf.
- "Let Thuan restock" goes after thieves and shoos anything in reach by herself.

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
