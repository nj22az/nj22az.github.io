# Simulatorer · Maskinrummet

Final simulator section of the course. Station A (multimeter) and Station B (week 40, AC) are implemented, both with Erik, the engine room's electrician; the other station cards link to the existing course labs while their engine-room versions are developed (`PLAN-ERIK.md`).

## Implemented

- Navigable Three.js engine room with generator, distribution board, pump and guarded equipment footprints.
- Johansson's actual avatar recipe, face and skeleton, copied from Johansson Town. Work clothing, helmet, glasses, boots and attached earmuffs. This is a SELV teaching bench, not an authorisation to work on live shipboard equipment.
- **Erik in Station A**: he stands at the right-hand end of the bench. *Erik visar steget* makes him point out, with his own arms (same CCD as Johansson), the dial, jacks, link P–A, supply and probe points for the current step, with a ring on the target and a speech bubble. Script: `stationA-manus.mjs` (one entry per step, no numbers, only points the step names; tested). Text list without WebGL.
- Multimeter with all nine Station A steps, seven rigs, free exploration, reference source, autoranged Ω/kΩ, protection and wiring interlocks. The electrical model is independent of the renderer.
- Real scene-ray picking and select controls; the original shoulder/elbow skeleton reaches the selected probe contacts. Fixed-length probes follow the hands; leads follow the grip positions.
- Keyboard and held touch-button navigation; equipment collisions and canvas-scoped keyboard controls. Two bench camera positions. Static views render on demand; walking animates.
- Full 2D fallback for absent/lost WebGL. Prediction-first laboratory protocol, print/PDF and CSV through the existing protocol component.
- Separate keys: `sjoskolan-maskinrum-multimeter-v1` and `sjoskolan-protokoll-maskinrum-stationA-v1`. Weekly progress, protocols and town avatars are not read or written.

## Station B · Växelström med Erik (`vaxelstrom/`)

Week 40's guided AC lab in the engine room. Same eight tasks (EL-000337–344), the same personal values from D
(`gemensamt/elevtal.mjs`, so a student sees the numbers of the weekly lab) and the same prediction-first protocol, with
one step added: **Förutsäg → Erik visar → Läs av och jämför → Förklara**.

- **Erik** (`character/erik.js`) is the engine room's electrician, an old Swedish sailor settled on the island. He walks
  to the instrument, connects the leads and steps aside so the student can read it (`erik-visar.mjs`, shared by future
  stations; `vaxelstrom/manus.mjs` is his script). His lines never contain an answer or a student value (tested).
- **The bench is SELV**: calibrator 10 V, AC source, oscilloscope with cursors, R + laminated-core coil on a component
  plate, M1 (true RMS) and M2 (sine-calibrated). X_{L} and |Z| are measured as U/I, as on a real bench.
- **Shore power (230 V 50 Hz at the quay) is Erik's only**: blue CEE socket, power analyser and an R/L load bank.
- `vaxelstrom/session.mjs` holds the flow and the readings (no DOM); `scen.mjs` only shows them. Storage key
  `sjoskolan-maskinrum-vaxelstrom-v1`; the weekly lab's keys and result codes are not read or written.
- The model files are snapshots of `vaxelstromslabbet/` (hashes in `snapshot.json`, a test checks they are identical).
- Without WebGL, Erik's steps are listed as text and every task still works.

`rum.mjs` holds the engine room shell for all stations (moved unchanged out of `scene.mjs`). The plan for the remaining
stations is `PLAN-ERIK.md`.

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
