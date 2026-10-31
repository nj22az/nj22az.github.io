# Minato Maru engine room — CAD C / H1 implementation, 31 October 2026

The owner requested a physically credible engine room before adding/removing equipment, then increased headroom, Blender and Meshy implementation, application to World, and attractive locked cameras for exploration.

Development only, opt-in `?engine-room-h1`. Implementation commit: `e43e6ff292bda94b5918dcb881acc8692e1b450b`, based on `1ff451effda177451af67f4ab3e3a5b0f6367a5a`. Main was checked at `faca8c535cef6927f243d7daff46d131d363d78e`; no main merge, Pages deployment, Pixar-branch or Linux release is included. Preserve the owner's three-branch workflow. The GitHub source tree `3d23c15890b9f92cd02d6f07a8c79225740c4f38` matches the verified local snapshot byte-for-byte. Publication uses the connected GitHub app because the command-line connection has no write credentials.

## Delivered geometry and CAD

The [15-sheet A2 implementation drawing](../art/ferry-engine-room/cad/Minato_Maru_Engine_Room_H1_Implementation.pdf) includes the original 12-sheet checkpoint and three implementation amendments. Six editable DXFs total; the new amendment DXF has mm units, eight native dimensions and separate A2 plan, access and boarding layouts. The unmodified Rev C checkpoint and older Rev B reference remain in `art/ferry-engine-room/cad/Minato_Maru_RevC_H1_Checkpoint.zip`. Later amendments govern the prototype.

| Element | H1 geometry |
| --- | --- |
| Machinery floor / tank top | +900 / +700 mm above keel, retained |
| Working envelope | 2,400 mm clear, lowest reserved services +3,300 |
| Structural underside / car deck | +3,600 / +4,000; 400 mm is a reservation, not calculated scantlings |
| Passenger / bridge / compass decks | +8,400 / +11,000 / +13,400; upper decks +1,000; retain 4,200 vehicle clearance |
| Primary inclined ladder | X6,400 head to X8,600 foot, 3,100 rise / 2,200 run, 14 risers, 54.64 degrees |
| Ladder handrails / landing | 800 between inner rail faces; 1,150 top landing X5,250–6,400 |
| Casing P side door | X5,300–6,400; prevents side entry midway down the extended flight |
| Port lobby benches | X3,200–5,000 and X6,700–11,000; retain 6,100 total length |
| Service rails | Two inboard 800 mm openings between 40 mm posts at X10,380 / X11,220 |
| Inter-room doors | Booth X10,900 and bulkheads X14,000 / 19,000 / 22,500: 2,100 high; widths 700 / 800 / 750 / 700 |
| Central grating | Actual bars at floor +900, 3,100 × 1,260, 6 mm bars / 50 mm pitch, supported over +700 tank top |
| Lighting | Five new fluorescent fittings above working clearance; four retained main/electrical fittings; two nearest lights active, without shadows |
| Boarding | 4,000 mm gangway; actual top-surface contact solved against the pier under hull motion; forward crew post derives from forecastle floor |

Engine, gearbox and shaft positions/counts remain. The existing fictional Johansson Marine engine specification is not relabelled as a selected OEM product. The permanently open starboard crankcase is closed in H1. Illustrative pipe previews are omitted; neither old screened paths nor the open fuel C1 work are claimed accepted for H1.

CAD correction preceded the access/lighting/boarding construction changes. Walk checks exposed the old doorway's mid-flight entry, benches across the relocated doorway, insufficient gangway reach and an old hardcoded forward crew-post height. H1-04/05 resolve those prototype layout dependencies. Two metres of standing height also clears the updated booth doorway.

## Blender and game application

[Editable metric Blender scene](../art/ferry-engine-room/Minato_Maru_Engine_Room_H1.blend): 1,290 named source components, original material groups and eight fixed cameras. Shared data is exported from `src/world/ferry-engine-room-plan.js` and `ferry-interior.js` by `tools/export-ferry-engine-room-h1.mjs`; this also writes the CAD design snapshot. The CAD builder assembles the 15-sheet PDF. Blender maps game `(x,y,z)` to `(x,-z,y)`, then exports glTF Y-up back into the original game frame. The shipped GLB is one vertex-colour primitive, 32,408 triangles, about 2.8 MB. Live maker plates, gauges and plant controls remain the game's own. A failed mesh load keeps the retained-geometry fallback; successful loading disposes it.

Fixed-camera positions and targets follow the ship's full world transform, including pitch/roll. Engine and workshop cuts have hysteresis. Held movement preserves its world heading across cuts until input releases; it cannot reverse from an opposing camera. V / Camera angle cycles the current floor's shots without changing the saved first/third-person setting. Normal FOV/zoom restore when leaving. Free camera, inspection, Photo Studio, pocket camera, cinematics and explicit audit cameras take precedence; first-person hands are hidden and Johansson remains visible.

Use `tools/ferry-engine-room-review.html` against the compiled development game for review placements. Start Exploring, then choose a room. This review page does not replace ordinary boarding or the primary ladder. See the artifact README for reproducible export/build/render commands.

## Verification

- Full guard: **482/482 pass, 93 files**, 545 s, 6,144 MB Node heap, concurrency 2. Log: `docs/qa/ferry-engine-room-h1/guard-final.log`.
- Focused camera/geometry/GLB/boarding plus runtime package: **11/11 pass**. Includes a 2 m standing envelope through the booth doorway, finite unit normals and a single primitive with correct metre-scale source bounds.
- H1 vessel walk with the flag enabled: **7/7 pass** — Minato gangway, both bow-ramp routes, actual physical voyage/crew procedure, stairs, bridge and crew-house routes. The new primary ladder route also goes down through ER/aux/workshop and returns to the car deck.
- CAD: fifteen A2 pages, amendment text within border, six editable DXFs total. New DXF reopened: units 4 (mm), eight native dimensions, zero audit errors/fixes, separate A2 plan/access/boarding layouts. Original checkpoint validation is preserved in its ZIP.
- Saved Blender scene audit: metric scale 1, **eight camera positions and vertical fields of view match CAD** to 0.00001; transform locks set; 1,290 source components. Log/data: `blender-audit.json` and `blender-saved-scene-review.log`.
- `npm run build:runtime` completed. The final focused runtime hash check passed. `git diff --check` passes for code and text; native CAD/PDF/Blender files have binary attributes to preserve their formats.

Blender Cycles CPU previews use 960 × 720 / 32 samples, with all eight camera views inspected. The saved .blend retains 1,200 × 900 / 64-sample settings. Numerical framing checks keep a representative person's head and feet inside the frame on desktop and 390 px portrait aspect ratios. These checks do not establish visibility at every walkable point or physical-device performance.

[QA evidence](../docs/qa/ferry-engine-room-h1/validation.json) records asset hashes, model budget, CAD checks and verification limits. Actual command logs and the Blender contact sheet accompany it. Earlier full-guard attempts hit the 2 GB Node heap, or this 8 GB container's memory limit when heavy world audits ran together. A serial attempt passed 478/479 but saw the runtime hash during an ongoing source rebuild; that stale build was corrected. The final guard result above is the acceptance result, not the failed intermediate runs.

## Explicit blockers and engineering holds

**Meshy is unfinished.** No plugin/API connection was available. The Meshy workspace was reached, Google sign-in was selected through native authentication and account entry submitted. Google then requested a human check; none was attempted. That sign-in session expired while independent work continued. No Meshy asset/texture was generated, downloaded or applied. `art/ferry-engine-room/MESHY_HANDOFF.txt` supplies the authoritative input, reference picture, constrained art direction and acceptance checks. Continue only after the user completes sign-in/human verification; record actual Meshy job/export IDs and provenance when available.

**No actual-game H1 visual acceptance.** This cloud browser cannot create a WebGL context: `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`, `BindToCurrentSequence failed`. The same failure occurs directly and in the review iframe. The saved browser picture is the startup page, not an in-game H1 frame. The browser also reported an import error in unchanged `landing.js`. Do not represent Blender stills as game captures, or claim desktop/phone GPU or Steam Deck/iPad acceptance.

**Not a buildable/class-approved vessel.** Structure, lightship/KG/stability, windage, real tidal/berthing access, gangway hoist/stow restraints, ramp loads, protected emergency escapes, fire-suppression volumes, ventilation duties, complete pipe routing and selected-supplier lifting/overhaul routes remain open. The old 190 m³ fire-suppression basis is not accepted for the larger volume. The historical 1.8 m fuel-head claim is not established by the roughly 0.15 m interface elevation difference. Fuel C1 PR #192 remains open/unmerged, verified head `9761f61304d3ac7a66d9061b593d61fce706805c`; it is not silently incorporated or described as main.

## Next concrete actions

1. Complete the Meshy account handoff, inspect supported material/texturing operations and apply an audited material pass to the measured mesh; do not replace this room with unconstrained text-to-3D geometry.
2. On a WebGL-capable device, open the compiled development build with `?engine-room-h1`, walk the pier–gangway–ladder–ER–booth–aux–workshop/store–electrical route and back, inspect every automatic cut and V selection, and test view/photo/inspection restoration. Capture actual game desktop and phone views and check light/shader/texture budgets on hardware.
3. Resolve the real engineering holds before any production or fabrication acceptance. Keep main's existing cartoon World unchanged until the owner's separate promotion decision.
