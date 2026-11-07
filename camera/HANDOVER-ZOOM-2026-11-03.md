# Pocket Camera zoom by gesture — 3 November 2026

The owner (3 November 2026): "I want to be able to zoom in and out on the photo while I'm in the app by gesture", and
while it was being built: "Make up too, face identify".

## State

**Published and verified on 3 November 2026.** The owner: "Push to main". Main fast-forwarded to
[`8a448ea3`](https://github.com/nj22az/nj22az.github.io/commit/8a448ea3117a7569445373b59542c1e7b4fa61f5) (branch
`claude/laughing-brahmagupta-ybyndm`, restarted from main `85e8a73a` after PR #426). Pages deployed it; **13/13 public
files match main byte for byte** (SHA-256, cache-busted: Camera `index.html`, `app.js`, `zoom-view.js`, `erase.js`,
`stickers.js`, `makeup-guide.js`, `face-stamps.js`, `looks-gl.js`, `camera.css`, `camera-ui.css`, `sw.js`,
`offline.json`, and `johansson-town/tools/camera/session.mjs`). The live page (headless Chromium, 390 × 844 touch phone)
shows `v2026.11.03.1`, and a real two-finger pinch on a photo in the editor zoomed it to 3.0× with no page errors.
The Johansson World guard on `8a448ea3` (run 427: guard, iphone-startup and the three ferry-exploration profiles) passed.
Visible version `v2026.11.03.1`, release key `20261103zoom1`. Physical iPhone/iPad Safari is untested: the gestures
were driven with Chromium's real touch input (CDP), not a phone.

## What was built

`camera/zoom-view.js` (new), one zoom for the editor's photo and the album's photo. README section "Zoom".
- Pinch round the fingers, 1× to a closest of two screen pixels per photo pixel (2× to 8×), with resistance and a spring
  back past either end; one finger moves a zoomed photo, edges give and spring back, a flick carries on (speed from the
  last tenth of a second, or the last two moves on a busy page); double-tap to 2.5× where tapped and back; a corner
  button (`.zoom-fit`, shows "2.5×") back to the whole photo; trackpad pinch / ctrl + wheel, the wheel alone pans.
- Transform on the target round its centre; `--view-zoom` (live, CSS counter-scaling of controls) and `data-view-zoom`
  (at rest, for redrawing) on the target. Area gets `.zoomed` and clips.
- Editor detail: `drawEditor` draws the canvas at `box.height × dpr × zoom`, up to the photo's own pixels, `MAX_SIDE`,
  the GPU's texture size and `VIEW_PIXELS` (8 MP); never below the unzoomed size; only when the fingers rest.
  `viewDetail()` does the same for the frame art, the face stickers' layer, the stickers' effect lines and balloons and
  Erase's marks (4 MP budget each).
- Gesture ownership: stickers keep their whole touch (`claims`); the face guide's handles keep one finger but yield a
  pinch (`yields` + `pinched` → `makeupGuide.cancelDrag()` puts the face back where that drag began); `gestures()` now
  ignores a touch once a second finger is down and takes no swipe while zoomed or just after a pinch; hold-for-original
  only unzoomed; Erase: one finger paints, two zoom/move, brush radius divided by the zoom (finer when zoomed); Crop
  resets the zoom (its pinch is the crop's). `show()` resets both zooms on every screen change.
- Makeup / Face stickers: `.editor.aligning` caps the panel at 46dvh on phone layouts while the face guide is on (the
  photo went from about 120 to 280 CSS px tall at 390 × 844); Find face then calls `showFace()`: the face to about two
  thirds of the photo area's height (and 80% of its width), centred, if that is at least 1.2×.
- Module keys bumped to `20261103zoom1`: app, CSS, `looks-gl.js`, `stickers.js`, `erase.js`, `makeup-guide.js`,
  `face-stamps.js` (its dynamic import of stickers), `zoom-view.js`; tests and `johansson-town/tools/camera/session.mjs`
  follow. Offline bundle rebuilt (348 files). CI: `zoom` added to the `camera-face-backup` job.

## Verification

Local, headless Chromium with SwiftShader (not a phone, not Safari):
- `zoom.browser.mjs` **13/13** (390 × 844 touch phone, DPR 2, CDP touches; and a 1,280 × 900 desktop): pinch anchor
  within 1%, canvas rows ×1.6+ at 2×, recipe untouched, pan never past edges and no Look swipe, spring back from 8×
  and below 1×, double tap in/out, corner button, swipe still works at 1×, sticker pinch sizes the sticker and its
  remove button keeps its width at 3×, Erase pinch zooms without erasing and one finger does not pan, Crop resets and
  pinches the crop, Makeup Find face zooms to the face (centred, whole) and a pinch over the handles zooms without
  moving them while one finger drags a handle 1:1 on screen, a save while zoomed is the whole photo at its usual size,
  the album photo pinches/pans/flicks/double-taps and reopens whole, ctrl + wheel keeps the point under the pointer
  (vertically; a photo narrower than the window stays centred across until it fills it). Passed 4 runs in a row on a
  quiet machine. With four browsers on four CPU cores one run timed out waiting for a zoomed 8 MP redraw on the CPU
  renderer; the wait is now 45 s (a phone GPU draws it in milliseconds).
- Other suites after the change: camera **56/56**, ui **82/82**, retouch **40/40**, face-stamps **11/11**, crop
  **33/33**, offline **13/13**, integration **8/8**, enhance, screens, backup, pop, save-share-layout, paper,
  sticker-contour and smart all passed; modules, offline inventory; MCP policy **16/16**, real MCP/Camera acceptance
  **20/20** (`CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` in this container).
- Test changes because of the zoom (not relaxed): retouch measures the guide outline's width on the screen and waits for
  Find face's zoom to rest before dragging handles; face-stamps waits three frames for the zoomed redraw before reading
  the hat layer; zoom-sensitive module keys updated.
- Looked at: editor at 2×, a selected balloon at 2.5× (thin outline, normal buttons), the face guide at 3× and after
  Find face at 1.6× with the new room, the album photo at 3×.

## Next

1. Owner on a real iPhone: pinch, flick and double-tap feel; Find face's zoom in Makeup and Face stickers; Erase zoomed.
2. Possible later: pinch on the camera's viewfinder (its zoom is the 1×/2×/3× button now; a pinch there would change
   what is captured, a different thing from this view-only zoom).
