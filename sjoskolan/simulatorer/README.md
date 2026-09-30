# Simulatorer · Maskinrummet

First published increment of the course's unnumbered final simulator section. Only Station A is implemented here; the other station cards explicitly link to the existing course labs while their engine-room versions are developed.

## Implemented

- Navigable Three.js engine room with generator, distribution board, pump and guarded equipment footprints.
- Johansson's actual avatar recipe, face and skeleton, copied from Johansson Town. Work clothing, helmet, glasses, boots and attached earmuffs. This is a SELV teaching bench, not an authorisation to work on live shipboard equipment.
- Multimeter with all nine Station A steps, seven rigs, free exploration, reference source, autoranged Ω/kΩ, protection and wiring interlocks. The electrical model is independent of the renderer.
- Real scene-ray picking and select controls; the original shoulder/elbow skeleton reaches the selected probe contacts. Fixed-length probes follow the hands; leads follow the grip positions.
- Keyboard and held touch-button navigation; equipment collisions and canvas-scoped keyboard controls. Two bench camera positions. Static views render on demand; walking animates.
- Full 2D fallback for absent/lost WebGL. Prediction-first laboratory protocol, print/PDF and CSV through the existing protocol component.
- Separate keys: `sjoskolan-maskinrum-multimeter-v1` and `sjoskolan-protokoll-maskinrum-stationA-v1`. Weekly progress, protocols and town avatars are not read or written.

## Sources and promotion policy

`snapshot.json` records the source commit and SHA-256 of the copied multimeter files. `multimeter/uppgifter.gen.mjs` is a release snapshot of database-generated content. Do not hand-edit its exercise text: change the original content database, generate it, test the weekly version, then deliberately promote the new snapshot. The character copy is similarly independent of future town character edits. Three.js r170 and BufferGeometryUtils reuse the repository's local vendor distribution (MIT); no CDN or additional runtime library.

## Checks

```
cd sjoskolan/simulatorer
npm ci
npm test
npm run test:browser -- --workers=1
```

Chromium projects: 390×844, 820×1180, 1024×768, 1440×1000. Tests cover physical scene picks, arm reach, all nine steps, keyboard/touch movement, separate saved progress, blocked storage, WebGL fallback and no horizontal overflow. Screenshots and traces are generated under ignored `test-results/` and `playwright-report/` directories.

Physical iPhone/iPad and Safari/WebKit acceptance remains outstanding. Draw-call counts are a local diagnostic, not a guarantee of device frame rate.

## Following increments

1. Complete the multimeter's remaining circuits and eight earlier exercise flows in this scene.
2. Promote the generator and AC bench, then three-phase and motor/control stations, then insulation.
3. Add station-to-station tasks, seeded faults and a final integrated troubleshooting exercise.
4. Mark the section's complete release only after every station has passed calculation and interaction acceptance.
