# Fujita's sofa cabin — 18 October 2026

The owner's supplied cluttered houseboat diorama is a furnishing reference. Shiosai retains its narrow working-boat form and existing entrance. Its stern extends 0.6 m (overall deck length 6.8 → 7.4 m), with hull, cabin, roof, surface support and collision boundaries extended together.

The permanent berth is replaced by a worn olive sofa with pillow and draped blanket. Fujita sleeps on the sofa using the existing 23:30–06:00 routine and sleep-cover animation. A folded futon and quilt are stored in an open cupboard under the radio. A small table, newspaper, remote, beer can, nautical logs, faded lining and short drying line establish a lived-in cabin. Furnishings sit beside the clear central aisle; the line hangs above the sofa. Static fittings share materials and merged geometry; no additional lights, wave simulation or renderer are introduced.

Verification:

```
node --test tests/fujita-houseboat.test.mjs tests/scenery-placement.test.mjs
node tools/export-fujita-houseboat.mjs
npm run build:runtime
node --test tests/runtime-package.test.mjs
```

These checks cover overnight and reverse-clock routines, deck/gangway navigation, central aisle and entrance clearance, bounded waterborne collision support, shipping clearance, batched fittings and the published runtime source hash. The reusable complete GLB is regenerated alongside the game model.

Visual verification remains outstanding: no local Chromium was available, and the Playwright browser download returned an invalid archive. No screenshots or physical iPhone Safari check are claimed. In particular, inspect the sleeping body and blanket on the sofa, pedestrian camera, overhead cabin composition and loaded hull at the extended stern before treating visual acceptance as complete. The folded futon is a furnishing, not a separate deployment mechanic.
