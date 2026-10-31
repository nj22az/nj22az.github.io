# Pocket Camera design/shader audit — 31 October 2026

Owner: “Why does 32 bit produce a warped image? … audit … as a Nintendo designer … UI and the icons … shaders … screenshots.”
Current published main at audit start: `83783c93448d1be251a61c213959448e1d21c971`, UI release PR #417 (`51f07130`).
Work is on `codex/pocket-camera-design-audit`, isolated from existing local changes. This new review is not published.

## Findings and review implementation

1. The Camera-only 32-bit shader deliberately mapped the image through a 6 × 4 triangle mesh with displaced corners.
   This bends faces and straight lines. Its triangle selection also used the original grid, rather than the displaced
   triangle boundaries. The user-facing hint promised pixels/colour/dither without disclosing photo distortion.
   The review removes the mesh and makes the pixel/texel grid follow the photo's aspect. Five-bit channels, coarse
   sampling and ordered dither remain. World's renderer and other Look algorithms are unchanged.
2. Several console Looks reused one World-house placeholder in the side rail and mix row. The review uses one small
   Camera symbol catalog: original medium pictograms, ink colours and distinct 8/16/32/64 codes. Actual-photo thumbnails,
   selected names, accessible names and existing controls remain. No Nintendo/Sony marks or assets were copied.
3. The rail grows from 48 to 56 CSS pixels so short selected names fit; it still reserves space outside the photo.
   All six panels and both device orientations will be captured to audit control size, overflow and photo/tool balance.

App/main-style/renderer and adapter URL keys on this branch are `20261031audit1`; published main remains `20261031ui1`.
The new icon module replaces the Camera's dependency on World's UI-house swatches. MCP architecture, approved imports,
copy-save, explicit export/close and preview-pixel disclosure remain unchanged. Existing albums/source JPEGs are not rewritten.

## Design lens and evidence

The review applies our interpretation of Nintendo's separation of content tiles and utility destinations, strong selection
feedback, readable effect identity and accessible text/contrast. It is an independent audit, not Nintendo approval.
Primary references:

- https://en-americas-support.nintendo.com/app/answers/detail/a_id/22308/~/home-menu-overview
- https://www.nintendo.com/en-gb/Support/Nintendo-Switch-2/Nintendo-Switch-2-HOME-Menu-Overview-2879084.html
- https://www.nintendo.com/us/gaming-systems/switch-2/accessibility/

`camera/tests/audit.browser.mjs` compares the exact published source against the review, renders a geometric grid in four
aspects/full and LIGHT, clicks all 34 real shader choices and their strength controls, captures all six panels at four
phone/tablet viewport cases, and creates actual-renderer shader/icon sheets. Zero strength must restore exact source pixels.
The existing full Camera/UI and MCP suites are retained. Historical pixel comparisons still check all 34 Looks; only the
intentional Crayon and repaired 32-bit differences are asserted as differences, with 32-bit geometry checked separately.

Local syntax, module consistency (16 modules), conversion and 15/15 MCP policy checks pass. Hosted checks, exact image
measurements, screenshot inspection, final findings and artifact IDs are pending; do not count them as passed.

Next: inspect hosted results and actual screenshots, correct verified defects, then give the owner the audit and before/after
captures for review. Main publication requires a subsequent owner instruction. Physical Safari and the installed MCP host
remain untested/unconnected; no personal Photos library or live browser album is attached.

## Subsequent AR question — research, not implementation

The owner asked about placing Blender-rendered Thuan and Thao in the real world and augmenting the camera view.
The current app already composites 2D character stickers over camera/photos; these do not track a floor or table.
Existing source includes Blender Thuan cut-outs, `johansson-town/assets/avatars/pixar/{thuan,thao}.glb` and Thuan
figurine GLBs. These are source assets to assess, not verified AR-ready exports. No USDZ was found in that inventory.

For iPhone/iPad, the proposed supported 3D route is a fully clothed, correctly scaled Blender-to-USDZ export launched
with Safari AR Quick Look, with short baked animations. A PNG alone remains a flat cut-out. WebKit's March 2026
response says WebXR is unsupported on iOS; an interactive scene that navigates a room or handles complex occlusion
would need a separate native ARKit/RealityKit assessment. No AR architecture, camera permission, new model or hosted
service was added by this audit. This remains a proposal pending scope agreement and device testing.

Primary references checked:
- https://developer.apple.com/quick-look-gallery/
- https://developer.apple.com/documentation/arkit/previewing-a-model-with-ar-quick-look
- https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/
- https://bugs.webkit.org/show_bug.cgi?id=309550 (WebKit maintainer response, 11 March 2026)
