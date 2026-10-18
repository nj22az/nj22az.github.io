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

## Integration validation — 18 October 2026

Integrated against main `11a438dec344a31fbb501340fb142db73a5b4106`, including the newer Sakura, scenery, housing/access and audio changes. PR head before integration: `764fae16f2eb03ab1702dea3f865cd57cc109da6`; common ancestor: `9b3db1ffe03056d440a6696ff57d9a499bddda11`.

Three-way source comparison found no conflicts in the houseboat model, routine, shed, generated town papers or focused tests. Actual text conflicts were in `index.html` (four regions), runtime manifest (17 regions), runtime source stamp and service-worker version (one region each). The branch also diverged in renamed/deleted hashed chunks. Preserved main's page and source, applied the houseboat source changes, then regenerated the full runtime graph, page references, source hash, service-worker stamp and town papers. The build retains the immediately previous main runtime graph for cached pages. Exported the reusable complete GLB again (276,356 bytes).

Integrated automated checks:

```
node tools/export-fujita-houseboat.mjs
npm run build:runtime
node --test tests/runtime-package.test.mjs tests/fujita-houseboat.test.mjs tests/scenery-placement.test.mjs tests/soundscape.test.mjs tests/yard-homes.test.mjs
node --test tests/sakura-*.test.mjs tests/island-coast.test.mjs tests/detail-stream.test.mjs tests/startup-recovery.test.mjs
```

Results: 23 focused integration tests and 73 regression tests pass. Checks include overnight spawn, 23:30 arrival, 06:00 return, clock reversal, sampled cargo clearances, land/deck support and the full gangway/cabin approach sampled every 25 mm at a 0.28 m player radius in both directions. The sleeping endpoint matches the sofa anchor; these numerical checks do not establish the rendered body's appearance.

Visual acceptance remains outstanding on the integrated build. A fresh Playwright launch failed because the Chromium headless executable is absent. No desktop/mobile screenshots or physical iPhone Safari result are claimed. Inspect the sofa/pillow/blanket alignment, sleeping and waking transitions, stern hull and cabin roof from pedestrian and overhead views; then walk the harbour, gangway and cabin on an actual iPhone before closing physical-device acceptance.
