# Studio free-camera staging — 27 October 2026

Owner request: replace Build scene with the better free-camera controls, add characters at the current view, drag and pose them, return to the previous view, and make shader selection visual and easier to compare.

## Implementation

- Studio mode is **Free camera**. The existing locations, shared cast, posing, acting, project sharing, comics and exports remain the working scene system.
- `scene-flight.js` uses World's existing `stepFreeCamera`: background drag looks, wheel flies, WASD/arrows move, E/Q change height, Shift/Alt alter speed. Touch pinches fly and two-finger slides translate. Input is scoped to the picture; text fields and other Studio modes keep their input. Hold camera to use character keyboard nudges. Escape stops flight input.
- Pointer hits on characters stay with the existing drag/seat/counter/pose system, even while flight is enabled. Camera movement pauses during actor gestures and cast playback. Inertia, events and animation frames are cleared on hide/disposal.
- Add my character / Add resident now find visible, unoccupied standing floor in front of the current camera, facing it. A full or blocked stage gives an explanation without inserting a character elsewhere. World residents are independent Studio recipes, never teleported NPCs or edits to their schedules.
- Save this view / Return to saved view preserve the camera independently of cast edits. Add characters here and Pose selected automatically keep the initial view if none has been saved. Changing location resets this bookmark. A project/reload keeps the working free-camera position and target; the temporary return bookmark lasts for this workspace session.
- Shader cards have names, descriptions, search, selected state, the shared illustrative swatches, and a real scene thumbnail after that look is rendered. Composition changes clear old real thumbnails. Selecting a card applies it live. Compare with Natural temporarily previews the baseline without replacing the selected look; leaving comparison or opening Export restores the selected look for picture saving.
- Camera positions and targets at actual town coordinates now survive schema normalization; old orbit-based projects still open.

## Scope and limits

This is staging in the selected existing World location, with the existing ±12 m character stage and a bounded free camera. It does not build a new full-island editor. The actual World free-camera/game loop, shaders and compiled runtime are unchanged. The Studio controller supports keyboard, mouse and touch; no new Studio gamepad controls are claimed.

## Validation performed

- 35 focused checks pass: new flight placement/project tests, scene model, controls, snapping, sharing links and World's existing free-camera tests.
- `tests/scene-flight.browser.mjs` passes in software Chromium at 1280, 820 and 390 px. Actual Studio UI and rendered classroom: desktop flight/background look, touch pinch/slide, adding a character, Wave pose, character drag while flight is enabled, returning the camera without undoing the pose, search, all 19 looks on desktop, Manga/Oil on touch, Natural comparison, project download, reload, no page overflow or page errors, and no World recipe writes.
- Additional actual Studio browser checks pass for adding characters to the harbour and Minato Izakaya after location changes.
- Desktop and phone screenshots inspected. No physical iPad/Safari or real GPU frame-rate acceptance is claimed.
- JavaScript syntax and `git diff --check` pass. The separate existing Node scene-world suite fails in its unchanged room/GLTF path (browser-only texture loading reports `self is not defined`, and an outdated town-hall seat expectation). Actual browser Minato/harbour placement passes. The full World CI guard was not run: no World runtime source or compiled runtime changes.

## Branch and delivery state

Implementation is a scoped Studio feature on `main`, based on source `74dac7d82a4a38e6340d2793b9fac52ec49ffa7a`, integrated onto newer main `a2f5c85191ae0b7acac539218ef6e4483c24e00c` (the intervening change only concerns hotel cards). No prototype geometry or development/Pixar content is promoted. No additional branch or PR is created.

Publication verification and implementation commit are recorded below after publishing. Re-run the browser check with `CHROMIUM_EXECUTABLE` pointing to Chromium; optional `STUDIO_FLIGHT_SHOTS` writes screenshots. Physical Safari/iPad validation is the remaining acceptance check.
