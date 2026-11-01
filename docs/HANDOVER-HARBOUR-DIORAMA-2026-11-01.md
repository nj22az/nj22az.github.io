# Homepage harbour diorama — 1 November 2026

## Scope and current state

Owner authorised the recommended Minato harbour enhancement after reviewing blendi-remade/dioramas. This implementation adapts its presentation approach using original code and the existing Johansson World set; no upstream code, models, generated images or paid services are imported.

Adds an opt-in Explore harbour control to the existing homepage figure. Existing arrivals, their ten-second still hold, reduced-motion/data-saving behaviour and finished images remain the default. The viewer provides Quay, Ferry and Overview cameras, horizontal drag, bounded elevation, keyboard arrows/zoom, explicit camera buttons, reset and links to World, Pocket Camera and the electrical book. The moored ferry is part of the existing merged scene; it is not newly animated or rebuilt. Buildings are not raycast project hotspots in this first version.

The viewer loads the existing 3.79 MB compressed harbour only after activation, plus the local Three.js and cel material modules. It does not load the game simulation, character system or Dioramas' expensive postprocessing. Pixel ratio 1, maximum canvas width 960 px, at most 30 animation frames per second. Water animates; reduced motion renders only on interaction. Hidden/offscreen scenes pause. Close releases GPU resources and returns to the original arrivals. Failed loading/context loss restores the image and retry control. The video controller pauses while the viewer is active.

## Checks

- Node syntax checks for both modules and the hosted browser suite: passed.
- Existing arrival-controller regression plus viewer/video suspension checks: passed.
- Local preview UI opened through the supported preview service. This browser cannot create a WebGL context, so local rendering is not acceptance evidence.
- Hosted workflow `Homepage harbour review` renders all three views at desktop, iPad portrait/landscape and phone widths, checks no initial 3D downloads, camera controls, 44 px targets, close/reopen/Escape disposal, no overflow, failed-download image fallback and graphics/page errors. Results are pending at this initial handover checkpoint.

## Delivery

Original source base: main ab35ac3e9cc7d6dadac8c05178a04da42cef50da. Work is tested on development before selective homepage-only publication to main. No World geometry, gameplay, camera application, course materials or unrelated development prototypes should be included in that publication.

Next: inspect hosted screenshots and results, correct observed faults, record exact commits/workflow IDs and publication status. Physical Safari/iPad testing remains open.
