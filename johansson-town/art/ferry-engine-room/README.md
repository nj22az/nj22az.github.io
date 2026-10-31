# Minato Maru engine room — CAD C / H1 development study

The owner's 31 October request: retain a physically credible machinery arrangement, enlarge working headroom, construct it in Blender and Meshy, and make the room explorable through attractive locked camera angles.

Implemented on `development`, opt-in `?engine-room-h1`. Main is not changed. The Meshy pass is **not complete**: Google requested human verification during Meshy sign-in and that sign-in session subsequently expired. No generated asset is attributed to Meshy.

## Drawings and editable model

- `cad/Minato_Maru_Engine_Room_H1_Implementation.pdf`: fifteen A2 sheets. H1-01/02 establish the vertical scheme; H1-03/04 correct service rails, lighting, doors, access landing and the primary ladder. H1-05 coordinates the longer gangway and the raised forward crew station. The remaining ten sheets survey the existing arrangement.
- `cad/JS127-ER-H1-03.dxf`: model-space mm geometry with native dimensions, access/light/camera layers, plus the corrected ladder and retained lobby bench arrangement. The companion three-sheet PDF is the readable amendment.
- `cad/Minato_Maru_RevC_H1_Checkpoint.zip`: unmodified 12-sheet CAD checkpoint, DXFs, source measurements, original Rev B reference and audit. Later amendments govern the prototype where they differ.
- `Minato_Maru_Engine_Room_H1.blend`: metric, named editable components and eight locked cameras. Blender 4.0.2 used. The scene retains material separations; the exported game GLB joins components into one vertex-colour mesh.
- `geometry-h1.json`: shared source export, in game local metres. Blender maps `(x,y,z)` to `(x,-z,y)` and exports glTF Y-up back into the same game frame.
- `renders/`: Blender Cycles CPU previews, 960 × 720 / 32 samples. They are model previews, not captured game frames.

The machinery identity is the existing fictional Johansson Marine specification, not a claim that a selected production engine has these overhaul dimensions. Engines, gearboxes, shaft axes and tank-top levels remain. Two inboard rail openings provide 800 mm between post faces. The floor remains +900 mm above keel; nominal underside is +3,600, leaving a reserved 2,400 mm working envelope below +3,300 services. The deck structure zone is a 400 mm reservation, not calculated scantlings.

H1 raises the vehicle deck and the decks above by 1,000 mm to preserve 4,200 mm vehicle clearance. The primary inclined ladder has a 3,100 rise, 2,200 run, fourteen risers and 800 mm between handrail faces. A relocated side door and full 1,150 mm top landing prevent sideways entry midway down the flight. The 4,000 mm gangway meets the existing Minato pier with its top surface; the forward crew station derives its height from the actual forecastle floor. The two port lobby benches redistribute 1,000 mm of length forward, retaining 6,100 mm total and keeping the new door clear.

## Runtime behaviour

Fixed positions/targets are ship-local and follow translation, pitch, roll and yaw. Camera cuts use hysteresis; held input retains its world heading until released. V / Camera angle cycles the room's shots without overwriting the saved first/third-person preference. Free camera, inspection, Photo Studio, pocket camera, cinematics and explicit audit cameras take precedence. Ordinary FOV and zoom restore on exit.

The Blender GLB loads lazily on the first machinery/access view aboard. Retained source geometry remains as fallback if loading fails; a successful load disposes that fallback. Live plates and gauges remain the game's originals. Illustrative pipe previews are omitted from H1: they are not certified connected systems. Only the two nearest CAD luminaires are active point lights, without shadows.

`tools/ferry-engine-room-review.html` offers room placements in the real compiled game for review. Start Exploring, then choose a room. WASD walks; V changes the fixed shot. Phone width checks the same game in a 390 px frame. These review placements do not replace the ordinary ladder route.

## Rebuild

From `johansson-town`:

```sh
node tools/export-ferry-engine-room-h1.mjs
python tools/ferry-engine-room-cad-h1.py
blender -b --factory-startup --python tools/blender/build-ferry-engine-room-h1.py -- --render --preview
npm run build:runtime
node --test tests/ferry-fixed-camera.test.mjs tests/runtime-package.test.mjs
```

Shared design values and camera data live in `src/world/ferry-engine-room-plan.js`; the exporter writes both `geometry-h1.json` and `cad/design-h1.json`. `--shots=control,workshop` restricts Blender preview rendering when revising a camera. The .blend retains 1,200 × 900 / 64-sample render settings; `--preview` affects preview output only.

## Limits and acceptance

This is a development geometry study, not a buildable or class-approved ship. Structure, lightship/KG and stability, windage, berth/tidal access, ramps/gangways, protected emergency escapes, fire-suppression volumes, ventilation duties, complete pipe routing and supplier removal/lifting procedures remain engineering holds. Existing open fuel C1 PR #192 is not silently treated as main or incorporated.

The cloud browser reports `GL_VENDOR = Disabled` and cannot create a WebGL context, including outside the review iframe. Consequently no actual-game H1 screenshot, desktop/phone visual acceptance, GPU performance claim or physical-device acceptance is asserted. Numerical framing and geometry/walk tests supplement the Blender previews; they do not replace that remaining visual check.
