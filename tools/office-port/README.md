# Homepage harbour videos

The homepage uses twelve complete, silent H.264 videos: Fujita, Johansson, Thuận and Tetsuo at the quay, pier end and Minato Maru ferry bridge wing overlooking the port and loading deck. Each clip is 960 × 540, five or six seconds at 24 fps, and below 500 KB. No Three.js, game boot, simulation or audio is loaded by the default arrivals. The optional Explore harbour button loads a separate real-time viewer only after activation.

Separate shuffled character and location bags in local storage show every option before resetting, without consecutive repeats. Another arrival selects a different character and viewpoint. Videos play once, keep the final frame, and pause off-screen or in hidden tabs. Explicit pause survives viewport changes. Replay restarts the current clip.

A finished WebP stays visible until playback succeeds and a decoded video frame is ready for presentation. Blocked autoplay and loading failures retain the still. Stale callbacks cannot reveal an old selection. Each selection keeps its finished still visible for at least ten seconds before either automatic or requested playback. The countdown starts after the image is presented and advances only while the scene is in view and the tab is visible. Another arrival restarts the full hold. Video loading waits for page load, idle time and viewport visibility; reduced motion and data-saving preferences keep a still until explicit Play.

## Validation and authoring

Run `node tools/office-port/controller.test.cjs` for deferred downloads, presented-frame reveal, preferences, playback controls, no-repeat selection, stale callbacks, errors and disposal. Validate all twelve videos with ffprobe and a complete ffmpeg decode before publishing. Actual device playback and layout require device checks.

The manifest records the twelve published clips and fallback images. Chromium and ffmpeg are offline authoring dependencies only. The retained `render.mjs` / `encode.mjs` scripts are the original quay-only authoring pipeline; they do not reproduce the additional pier and bridge clips and must not overwrite the twelve-clip manifest. The published location clips are retained as finished assets.

## Optional harbour diorama

`assets/js/office-diorama.js` opens an inline viewer on explicit request, using `office-diorama-scene.js`, the local Three.js/cel renderer and the existing `harbour.scene.gz` set. No upstream Dioramas code or assets are imported. Quay, Ferry and Overview presets, drag/keyboard navigation, zoom/reset and project links use the real Minato geometry. The ferry remains moored in the merged geometry. The water animates at up to 30 fps; reduced motion renders only on interaction. The drawing buffer is capped at 960 px wide and pixel ratio 1. Closing releases the renderer, geometry, materials and textures. Hidden/offscreen scenes pause. Failures restore the original arrival and a retry button. The default film controller suspends playback while the viewer is active.

`node tools/office-port/diorama.browser.mjs` runs the hosted Chromium regression with `DIORAMA_TEST_RUNTIME` pointing to the directory containing its installed Playwright package. The `Homepage harbour review` workflow installs that test dependency, checks four viewport profiles and saves all three scene views as screenshots. Physical iPad Safari testing remains separate.

The original character-based live-rendering source remains available for offline film authoring; the new viewer does not load its character system.

Bridge-wing refresh: run `node tools/office-port/bake.mjs` then `node tools/office-port/bridge-films.mjs` with `TOWN_CHROMIUM_PATH` set to a local Chrome executable. The latter records four deterministic 6-second/24-fps clips and the matching fallback, updates their manifest entries and fully decodes each encoded movie. It requires cwebp for the still. The model now selects the teal 操舵室 / WHEELHOUSE atlas strip above both bridge doors; the red ENGINE ROOM sign remains at the actual machinery-space entrance.
