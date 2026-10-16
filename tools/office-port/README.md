# Homepage harbour videos

The homepage uses twelve complete, silent H.264 videos: Fujita, Johansson, Thuận and Tetsuo at the quay, pier end and Minato Maru ferry bridge wing overlooking the port and loading deck. Each clip is 960 × 540, five or six seconds at 24 fps, and below 500 KB. No Three.js, game boot, simulation or audio is loaded by the homepage.

Separate shuffled character and location bags in local storage show every option before resetting, without consecutive repeats. Another arrival selects a different character and viewpoint. Videos play once, keep the final frame, and pause off-screen or in hidden tabs. Explicit pause survives viewport changes. Replay restarts the current clip.

A finished WebP stays visible until playback succeeds and a decoded video frame is ready for presentation. Blocked autoplay and loading failures retain the still. Stale callbacks cannot reveal an old selection. Each selection keeps its finished still visible for at least ten seconds before either automatic or requested playback. The countdown starts after the image is presented and advances only while the scene is in view and the tab is visible. Another arrival restarts the full hold. Video loading waits for page load, idle time and viewport visibility; reduced motion and data-saving preferences keep a still until explicit Play.

## Validation and authoring

Run `node tools/office-port/controller.test.cjs` for deferred downloads, presented-frame reveal, preferences, playback controls, no-repeat selection, stale callbacks, errors and disposal. Validate all twelve videos with ffprobe and a complete ffmpeg decode before publishing. Actual device playback and layout require device checks.

The manifest records the twelve published clips and fallback images. Chromium and ffmpeg are offline authoring dependencies only. The retained `render.mjs` / `encode.mjs` scripts are the original quay-only authoring pipeline; they do not reproduce the additional pier and bridge clips and must not overwrite the twelve-clip manifest. The published location clips are retained as finished assets.

Live-rendering source and baked geometry remain available for future authoring experiments, but are not requested by the homepage.
