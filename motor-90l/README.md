# IEC 90L pump motor

A 3D model of a 1.5 kW, 4-pole, 230 Δ / 400 Y V TEFC induction motor in IEC frame 90L, for a ship's bilge or transfer pump:
<https://nj22az.github.io/motor-90l/>. Built from the specification in millimetres, then audited (`AUDIT.md`).

No build step. Serve the site root (`python3 -m http.server`) and open `/motor-90l/`.

| File | What |
|---|---|
| `calc.mjs` | Ratings, IEC dimensions and the design checks (currents, winding factors, turns, slot fill, iron, hi-pot) |
| `calc.test.mjs` | `node --test motor-90l/calc.test.mjs` |
| `motor.js` | The model: every part as its own group, axis along x, drive end toward −x, feet at y = −90 mm |
| `info.js` | Part descriptions, service notes, build steps and audit findings |
| `app.js`, `index.html` | Viewer: explode, build steps, cutaway, Y/Δ links, B3/B5/B35, dimensions, phase colours, `.glb` export |
| `vendor/` | three.js r170 (MIT): core, OrbitControls, RoomEnvironment, GLTFExporter, BufferGeometryUtils |

Johansson Town also runs three.js r170, so the parts and the exported `.glb` (metres, one node per part) can move into the
Dock Electrical Workshop without conversion. The export is about 14 MB uncompressed; index and meshopt-compress it with the
town's asset pipeline before it goes in.
