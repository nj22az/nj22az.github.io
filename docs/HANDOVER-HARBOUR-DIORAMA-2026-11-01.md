# Homepage harbour diorama — 1 November 2026

## Scope and current state

Owner authorised the recommended Minato harbour enhancement after reviewing blendi-remade/dioramas. This implementation adapts its presentation approach using original code and the existing Johansson World set; no upstream code, models, generated images or paid services are imported.

Adds an opt-in Explore harbour control to the existing homepage figure. Existing arrivals, their ten-second still hold, reduced-motion/data-saving behaviour and finished images remain the default. The viewer provides Quay, Ferry and Overview cameras, horizontal drag, bounded elevation, keyboard arrows/zoom, explicit camera buttons, reset and links to World, Pocket Camera and the electrical book. The moored ferry is part of the existing merged scene; it is not newly animated or rebuilt. Buildings are not raycast project hotspots in this first version.

The viewer loads the existing 3.79 MB compressed harbour only after activation, plus the local Three.js and cel material modules. It does not load the game simulation, character system or Dioramas' expensive postprocessing. Pixel ratio 1, maximum canvas width 960 px, at most 30 animation frames per second. Water animates; reduced motion renders only on interaction. Hidden/offscreen scenes pause. Close releases GPU resources and returns to the original arrivals. Failed loading/context loss restores the image and retry control. The video controller pauses while the viewer is active.

## Checks

- Node syntax checks for both modules and the hosted browser suite: passed.
- Existing arrival-controller regression plus viewer/video suspension checks: passed.
- Local preview UI opened through the supported preview service. This browser cannot create a WebGL context, so local rendering is not acceptance evidence.
- Hosted workflow `Homepage harbour review` renders all three views at desktop, iPad portrait/landscape and phone widths, checks no initial 3D downloads, camera controls, 44 px targets, close/reopen/Escape disposal, no overflow, failed-download image fallback and graphics/page errors. Final candidate 4dd593e91b9795b85e5d2a279add1c62f5d0d70e passed all four profiles, including actual animated water, reduced-motion stillness and drag navigation: https://github.com/nj22az/nj22az.github.io/actions/runs/41343994249. All twelve captures were produced; desktop quay/ferry, iPad overview and phone quay were visually inspected. Controls were moved below the scene after the first screenshot review.

## Delivery

Original source base: main ab35ac3e9cc7d6dadac8c05178a04da42cef50da. Development commits 4dd40d7f, ca56a87c and 4dd593e9 contain the implementation, composition refinements and motion checks. This main delivery selectively applies the homepage files, without development World prototypes. Published source: `0fd71d1c4c3b91470f9d96057bf7f128eedbec2f`. The exact main delivery passed [hosted review 41344153715](https://github.com/nj22az/nj22az.github.io/actions/runs/41344153715): desktop 1440×1000, iPad portrait 768×1024, iPad landscape 1024×768 and phone 390×844. Motion/reduced-motion, drag, keyboard, camera controls, 44 px targets, fallback, disposal/reopening and no initial 3D downloads passed. All twelve captures were generated; final main desktop quay, iPad ferry and phone overview were inspected and preserved as WebP.

[Pages deployment 41344153161](https://github.com/nj22az/nj22az.github.io/actions/runs/41344153161) succeeded. The production homepage visibly presents Explore harbour. **10/10 public files match tested bytes**, including HTML, CSS, both viewer scripts, video controller, compressed scene, fallback image, Three.js, cel shading and world UV module. Raw `.gz` is served without Content-Encoding, as expected by the loader. [Public file hashes](../release-evidence/harbour-diorama-2026-11-01/public-files.json) and [profile results](../release-evidence/harbour-diorama-2026-11-01/results.json).

[Desktop capture](../release-evidence/harbour-diorama-2026-11-01/desktop-quay.webp) · [iPad capture](../release-evidence/harbour-diorama-2026-11-01/ipad-portrait-ferry.webp) · [phone capture](../release-evidence/harbour-diorama-2026-11-01/phone-overview.webp). Full original PNGs remain in the linked workflow artifact, subject to GitHub retention. No World geometry, gameplay, camera application, course materials or unrelated development prototypes should be included in that publication.

Completed implementation and publication. Remaining verification: physical Safari/iPad testing. The preview browser lacks WebGL, so rendered acceptance came from hosted Chromium with software WebGL, not a physical device or a desktop GPU performance measurement. Future building hotspots or a separately animated ferry require an additional scoped implementation; neither is represented as completed here.
