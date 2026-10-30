# Minato Izakaya: CAD Rev 9, surfaces and entry recovery

## Delivery state

Owner request, 30 October 2026: entering the izakaya breaks the game; draw it in CAD, rebuild without Z-fighting and use Artlist.

Work branch: `codex/izakaya-entry-cad-repair`. Started from main `1d3558851004e48277345d661179aefd1246e8db`, then fast-forwarded to current main `ff76aee1a30ff1d000bd5bb9ecf0475543915899` while retaining the repair. That update contains Pocket Camera work only; no World integration conflict. This repair is **for draft review, not merged or published**. No Linux release or Studio-repository synchronisation.

The exact reported device crash remains **unreproduced**. Confirmed geometry defects and entry error recovery are delivered; neither a Blender render nor a Node test proves that the owner's device crash is resolved.

## What was wrong and what changed

- The whole-room scan found 45 reported overlapping pairs on the original source. The previous cabinet/counter regions missed wall/window/door joinery, runtime prints and appliances. The baseline includes a detector false positive around tapered chopsticks; it is not evidence of 45 independent visible defects or a crash diagnosis.
- Rough wall apertures now include the frame dimensions from `plan.json` (`joinery`). Window jambs butt into the head/sill; service and WC jambs no longer duplicate plaster reveals. All clear door/passage dimensions, furniture, seats and serving coordinates remain as before.
- Guestbook and recipe printing are faces of their solids. Sato topping pans have an open interior, with food below the rim. The washroom sign faces into the room. The cold-store label clears the door.
- The payphone's thin rounded panels allowed corner radii larger than half their height, creating self-crossing outlines and overlapping triangles. Radii are bounded; digit artwork replaces the keycap face. Its coin faceplate has no redundant rear face.
- Towel-warmer louvers, condiment-box joints, the tanuki's book, TV brackets and Sato's delivery-box handle have actual fitted joins. The can's print is its sidewall; the oolong jug has clearance between the glass and tea.
- `enterRoom` now catches a room-setup exception, records the original error, clears the partial room through the ordinary exit and leaves the player outside with the original heading. This prevents an entry exception from leaving the frame loop in a partial interior. Both shared entrances have a regression test for this path. It does not diagnose or cure every possible later render/GPU failure.

`tools/z-fighting.mjs` also needed a measurement correction: plane constants from slightly different normals are not directly comparable away from the origin. It now uses height intervals in one shared projection and clips an overlap to the part actually within 2 mm. The original tolerance and area thresholds remain. Regression cases retain detection of both a planted wall overlay and a near, slightly sloping face, while rejecting a surface 12 mm above another.

## CAD and editable source

- `art/izakaya/compact/plan.json`, revision 9; `tools/build-minato-plan.mjs` regenerates the runtime data.
- `tools/blender/build-minato-compact.py`; rebuilt in **Blender 4.5.3 LTS**, including `minato-compact.blend` and the fitted `minato-interior-compact.glb`.
- `art/izakaya/compact/cad/`: a three-page A3 PDF, native millimetre DXF and SVG. `tools/build-izakaya-cad.py` regenerates them. DXF audit: zero errors. PDF pages rendered and visually inspected; the first-page dimension/header collision was corrected and rechecked.
- Fresh `entry.png`, `counter.png`, `overhead.png`: **architectural Blender reviews**, with independent review lighting and a neutral scale mannequin. They are not game or physical-device screenshots. `compact-report.json` records Rev 9 and source/export/render hashes.

The main clear rectangle remains 6.40 x 7.20 m; the annex 3.24 x 5.20 m. Heights are game Y datums (finished floor 0.04 m, ceiling underside 2.94 m), stated explicitly on the CAD section. Existing seat heights are preserved.

## Artlist

Original Sango Quay house-awamori print, generated through Artlist / **Seedream 4.5**, generation `01a18d9e-0c79-7415-821d-734177991b1e`. Purpose: Thao's house brand, supplied by Sakura Trading. Provenance and game-texture hash: `docs/qa/izakaya-rebuild-2026-10-30/artlist-provenance.json`.

It replaces the old sake-campaign artwork in its existing slot; four inspectable posters remain. The runtime mounts it once. The Blender review copy is marked `reviewOnly` and excluded from the GLB, avoiding a duplicate print at the same position.

## Verification

- Whole game-room geometry, closed and open cold-store door: **0 competing pairs** at **2 mm / 0.0005 m2**, including identical finishes; no invalid transforms. 194 meshes, 104,483 triangles including runtime dressing. `tools/audit-izakaya-room.mjs` reproduces `docs/qa/izakaya-rebuild-2026-10-30/geometry.json` without a GPU.
- Focused repair regression: **23/23 passed** (`izakaya-backbar`, `shared-dining-entry`, `izakaya-devices`). Includes the complete-room scan, planted overlay, translated/sloping depth cases and failed-entry recovery.
- Service/food/drink/layout acceptance: **70/70 passed** across the selected eleven files; menu prices, service routes and opening hours unchanged.
- Runtime rebuilt; final guard and remote-review results will be appended below.
- The extra, non-guard `izakaya-lived-in.test.mjs` was also tried and retains its old-room `west warm tea` furniture-footprint failure. Its builder and test are unchanged; it is not used to claim acceptance of this compact room. An initially missing walnut report was a sparse-checkout omission, restored before the successful service run.

## Verification limits and next concrete actions

The connected browser cannot create WebGL before gameplay. An isolated local software-browser attempt also exits under the container's socket restrictions before entering the game. Details: `docs/qa/izakaya-rebuild-2026-10-30/browser-limits.json`. No successful fresh keyboard walk, exit/re-entry capture, FPS measurement, iPhone Safari, iPad or Steam Deck acceptance is claimed. Existing older walkthroughs are historical evidence only.

1. Inspect this draft and the CAD/Blender reviews. Keep the live site on main until the owner's publication instruction.
2. Run `tests/minato-compact.browser.mjs` in a working GPU/software-browser environment through both doors; check normal walking, guest WC, service, exit and re-entry.
3. Reproduce the owner's exact crash on their affected edition/device and record the original console exception or context-loss event. Do not label the unreproduced crash fixed solely because the surface scan passes.

## Final checks and review

Pending the current full World guard and draft PR creation. Implementation/ref/check identifiers will be recorded after the push.
