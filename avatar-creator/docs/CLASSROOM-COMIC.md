# Vy's classroom comic — Studio acceptance scene

The owner requested the supplied four-panel classroom strip with Vy and her teacher, then asked that its missing capabilities be implemented in Studio and the comic rebuilt for comparison. The desk must overturn dramatically as Vy runs out.

## Findings and implementation

| Needed for the strip | Before | Implemented |
| --- | --- | --- |
| School set | World had a classroom; Studio's location picker did not expose it | Island classroom uses World's actual builder, with the running lesson and placeholder cast paused; sea views use the daytime clock |
| Furniture action | Scene furniture was fixed | The classroom's desk and chair have independent position, rotation and visibility controls; the third shot overturns them |
| Character acting | Separate gestures could not maintain a lift | Five Studio acting poses plus a `liftedBy` link; hand targets follow the carried avatar's actual bones, resolved after both bodies are placed |
| Camera | The initial hand-staged prototype looked through the window frame | Saved camera position, target and field of view; normal camera sliders adjust that framing; the first two panels are close views of Vy’s face and the desktop |
| Dramatic action | Ordinary isolated gesture | A forward running pose, overturned desk, fallen chair and deterministic motion lines with KRAASH lettering |
| Editable panels | Captures retained only PNG pixels | Each new capture also retains its complete scene; Edit scene reopens it and the next capture replaces that panel |
| Project exchange | One active scene and captured images | Backward-compatible `panelScenes` and layout fields preserve each shot; old PNG-only projects still open |
| Agent access | Portrait and asset renders | `scene_classroom_example`, `scene_render`, `comic_render`; all rendering and capture go through the actual Build scene workspace |

## Use

Open **Build a scene → Pose & position → Build Vy’s classroom comic** in a project without captured panels. Studio builds four shots and opens Make a comic. Each panel has **Edit scene**. Adjust a pose, face, speech, camera, height or **Classroom furniture**, then **Add panel to comic** replaces the panel being edited. Download project retains the scene snapshots, captured images and page layout.

`scene_classroom_example` returns the four scene snapshots. `comic_render` accepts them as `scenes`, a safe output `name`, and `layout: "strip"` or `"grid"`. It returns the PNG and portable `.studio.json` paths. `scene_render` additionally returns projected head positions and measured hand-target errors, in metres. These previews do not publish anything to World.

Vy uses `recipeFor('Vy')`. At the owner's request the teacher is Mrs Kubo, a separate Studio-only design derived from Miss Higa, with an older face, broad build and taller stature (1.2 scene scale). Miss Higa's resident recipe is unchanged. No resident recipe or routine changes. The comic is a re-staging of the owner's supplied reference, not an image-generator approximation.

## Verification and limits

- All four scene snapshots survive JSON normalization with their actor identities, carrier link, furniture transforms, camera and action effect intact. Invalid vectors, heights, missing partners and multiple carried actors are bounded or cleared.
- Real Chromium/WebGL rendering produced the full strip and editable project. The final gripping-hand target error for this cast is below 0.001 m. The teacher lifts by the back of the blouse with one hand, matching the reference, and rests her other hand on her hip. This is a measured target check, not a proof of collision-free skin surfaces for every possible edited recipe.
- UI round trips passed at 820 × 1180 and 390 × 844: open the project, edit the overturned desk, replace its panel, export, verify all four snapshots and the carrier link, then import a legacy PNG-only project.
- Existing scene suites: 58 passed, one existing TODO and one Sakura counter-edge assertion failed. The same Sakura assertion failed against the unchanged HEAD version of `scene-world.js`; it is not caused by classroom staging.
- New/focused schema, catalogue and MCP checks pass. See `tests/classroom-comic.test.mjs` and `tests/classroom-comic.browser.mjs`.
- The held comic poses are choreographed; running and walking also play as continuous rig animation. Cloth and furniture are not physics simulations. Classroom staging deliberately permits actor contact without the ordinary automatic separation. Furniture transforms do not change World's playable classroom, routes or collisions. Physical iPad/iPhone Safari has not been tested.

The before comparison is labelled **Initial staging prototype**: that render required manual scripting because the old scene picker could not create this classroom shot. The after image is rebuilt through Studio's own renderer and capture path. The comparison is not presented as an old UI feature that did not exist.

## Shared classroom model correction

The final side view exposed the classroom’s existing noticeboard defect: long English words were rendered at 84 px on 96 px papers, with no width fitting, and several notices contained incoherent text. `classroom-notices.js` now owns a bounded layout with eight single-character calligraphy sheets, complete notices, consistent margins and text measured in the actual font. All 33 labels fit their paper areas in Chromium; the flat artwork and the rebuilt final panel were visually checked. This changes the shared World classroom builder, so Studio and World use the same correction, with no added 3D draw calls. The World runtime was rebuilt; classroom checks (8) and runtime checks (3) passed. Physical-device Safari remains untested.

## Dramatic acting and movement

Studio now offers Walk, Run, School run and Comic leap. Play cast advances the same World locomotion rig used in town, including alternating strides, bent elbows and body bounce; the scene timeline can seek backwards deterministically. Saved scene times preserve the frame chosen for a panel. The shared animator accepts an optional initial clock for repeatable Studio sampling; World retains its existing random starting clock.

The example uses tear-free rage and panic, wider mouths, a grounded running escape, large unboxed shout lettering and optional plain comic paper. Both lettering and backdrop have controls under Add text. The full classroom remains selectable. The teacher and pupil retain their side-view lift and ashamed expression.

Verification: 10 schema/motion tests passed; pose/catalogue checks passed with one existing floor-skirt TODO. Chromium renders a 24-frame run cycle through the actual Studio workspace. The browser acceptance check also exercises timeline seeking, rewind and Play cast, alongside project round trips at tablet and phone sizes.

The revised camera pass shows the first desk pose from the side, the escape from behind, and the final lift from an angle that separates Vy from the teacher. A reusable large speech-bubble option keeps the teacher’s complete line readable across the top of the panel.

The escape now samples School run at 0.30 s, with a stronger forward lean and bent, opposing arms. The actual shoe supports are grounded after posing; the paper treatment projects a short floor stroke and dust marks from the planted sole. The jump pose remains available separately. Eleven scene/motion tests pass, including planted-sole height and repeat-frame stability.
