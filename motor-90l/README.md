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
| `service.js` | Workshop tool kit, strip-down and rebuild steps (with the part moves for the model) and the workshop audit |
| `app.js`, `index.html` | Viewer: workshop strip-down/rebuild, explode, build steps, cutaway, Y/Δ links, B3/B5/B35, dimensions, phase colours, `.glb` export |
| `workshop/` | Erik's routine: Erik, an old Swedish sailor settled on the island (built with `johansson-town/src/avatars`), does lock-off, prove dead, Y/Δ, winding tests, bearings, cleaning and a test run, with a *Learn* card per chapter. `routine.js` is the script (beats: pose, hand targets, tools, state, camera), `erik.js` his recipe and IK rig, `scene.js` the workshop bench, `app.js` the player |
| `TEACHING.md` | The lessons in the routine and the next ones to build |
| `vendor/` | three.js r170 (MIT): core, OrbitControls, RoomEnvironment, GLTFExporter, BufferGeometryUtils |

The workshop page loads three.js from `johansson-town/vendor/` (the same r170 build), so Erik and the motor share one
three.js instance. Town characters are drawn big-headed, so the workshop shows the motor and tools at 1.7 × true size,
the way the town sizes its props.

Johansson Town also runs three.js r170, and the motor now stands on Tetsuo's test bench in its Dock Electrical Workshop.
`johansson-town/tools/pack-motor-90l.mjs` builds it from `motor.js` (no browser), keeps the closed motor's outside, simplifies
it with meshoptimizer and writes one quantised, vertex-coloured mesh (about 0.45 MB against the 14 MB full export). Rerun it
after changing `motor.js` or `calc.mjs`; the town's `tests/motor-bench.test.mjs` checks their hashes.
