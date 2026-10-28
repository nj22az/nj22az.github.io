# Thuan's selfie on the Minato Maru — 28 October 2026

The owner, with a holiday photo (a selfie at a sea-view rail: one arm out to the camera, a peace sign by the cheek, a big
smile): "Make a scene on the Minato Ferry where Thuan poses like this".

**State: on branch `claude/sweet-goldberg-vivsot`, not on `main`. Publishing waits for the owner's word.**

![Thuan's selfie on the open deck](ferry-selfie/thuan-ferry-selfie.jpg)

## What changed

- **A new fun pose, `Selfie`** (`src/avatars/fun-poses.js`), so the storyteller, World's photo studio (Photo → pose
  "Selfie") and Johansson Studio's Build scene can all use it, on every body. The right mitten is solved to a point ahead
  of the face and above the eyes (where the camera is held), and the left goes up beside the cheek. The face is `excited`.
- **Finger shapes for a move** (`hands` on a fun pose; `src/avatars/animate.js`): on a body with finger bones (the Pixar
  cast), each finger eases from its resting curl to the pose's shape: Selfie's V (index and middle straight, ring, pinky
  and thumb folded) and a closed grip on the camera hand. Mitten bodies keep their mittens.
- **`__JOHANSSON_AUDIT__.stage(name, {pose, expression, at, yaw, parent, shadows})` / `unstage()`** (`src/game.js`,
  audit pages only): a resident's own body built the way the photo studio builds it, posed at its still and set on any
  parent (here the ferry, so she rides her deck). The living resident is hidden while staged.
- **`tools/ferry-selfie-shoot.mjs`**: boots World, lays the ferry alongside, stands Thuan at the open deck's port rail
  (between the liferaft and the funnel, out from under the awning so there is open sky over her), facing inboard, and
  takes the picture from her camera's place: 0.64 m ahead of her face, 0.15 m up and 0.12 m to her right, so her arm
  goes out of frame toward the lens. `--lens`, `--at`, `--yaw`, `--face`, `--time`, `--looks` vary it.
- Runtime rebuilt (`node scripts/build-runtime.mjs`).

## Found and fixed while shooting

- From the stern rail, the awning and its posts filled the top of the frame. She moved to the port rail.
- The first lens, on the line through her hand, put her forearm across her face (her arms are short). The lens now sits
  ahead of her face and her arm comes in from the corner.
- In full sun at under a metre, the sun's shadow map showed as blotches across her skin. The staged body is built
  without shadows (`shadows:false`), as the photo studio builds its cast. Living residents still cast shadows. At the
  game camera's distance the acne doesn't show.
- The audit camera ignores `fov` (also noted in the blog-stamp handover), so the framing comes from the lens position.

## Checks

- Every frame was looked at in full: no clipping of the V hand into the hair or head, clean skin, the rail and the sea
  read, and the open right hand stays out of frame.
- `tests/fun-poses.test.mjs`: **4/4 pass** (Selfie on every body, child to elder, slim to round: in nothing, feet on the floor).
- `tests/photo-studio.test.mjs` and `tests/runtime-package.test.mjs`: **8/8 pass**.
- Not run: the full World guard, phone-width or real-device checks, and the photo studio's Selfie through its UI.

## Open / next

- **Under way:** `beginCrossing('airport')` returned false from a freshly parked ferry, so this still is taken alongside
  (only open sea shows behind her). Shooting under way, with a wake and Kitano-jima behind her, needs the timetable's
  own departure (or the operations request's preconditions).
- The photo's yellow bucket hat and white summer outfit are not in Thuan's wardrobe. A sun hat sold at Sakura would give
  her a reason to have one (hat-assets.js).
- The camera hand holds nothing. A 1990s disposable camera in it would explain the arm when the pose is seen from
  another angle.
