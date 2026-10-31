# Pocket Camera design/shader audit — 31 October 2026

Owner: “Why does 32 bit produce a warped image? … audit … as a Nintendo designer … UI and the icons … shaders … screenshots.”

## Owner-authorised layout fixes — 31 October 2026, verification in progress

The owner followed the audit with **“Implement the fixes”**. Continue draft PR #418 from verified head
`aa6c38213f38da3ee11027e2947fdad9ed1589ae`. Its Camera, MCP, World guard/WebKit **and Linux full acceptance all passed**;
this newer Linux success supersedes the pending status in the historical evidence below.

The follow-up implements the three listed UI findings: compact Paper/Mirror mode controls with an icon Date switch;
one horizontally scrollable sticker-category row that reveals the selection; and an explicitly bounded, nonshrinking
Look rail that scrolls independently of the clipped photo stage. Touch scrolling is allowed on the rail/categories
while photo gestures stay on the picture. Frame/Paper/Mirror/date recipe semantics, Save copy and the corrected 32-bit
renderer remain. Cache keys, including MCP, align at **`20261031audit2`**; no dependencies or AR implementation added.

The UI suite adds checks across eight viewport cases for Frame photo size, finish recipe controls, one-row categories,
Mine/Thuan access, all three Looks and Original, plus 200% text rail access. The prior 57 UI assertions and the entire
143 Camera/50 shader audit/15+20 MCP coverage remain; the core Mirror test now opens its explicit mode control.
Local syntax/module/game unit checks and **15/15 MCP policy checks pass**. Hosted follow-up results, measurements and
fresh screenshots are pending. Do not count the new UI checks or physical Safari as passed yet. Main is unchanged.

Next: inspect the hosted follow-up, remedy failures without weakening coverage, inspect actual phone/tablet and export
images, then update this section with exact source/results/evidence and deliver the new screenshots. Publication
still requires the owner's subsequent word; AR remains the separate proposal below.
Published main, verified again on 31 October: **`83783c93448d1be251a61c213959448e1d21c971`**, UI release PR #417
(`51f07130`). [Draft PR #418](https://github.com/nj22az/nj22az.github.io/pull/418), branch
`codex/pocket-camera-design-audit`, is **open, unmerged and not published**, with no comments/reviews at verification.
Existing local Camera/World work and unrelated media temporary files are preserved in separate worktrees.

Runtime implementation: **`26f576481cbcbf2b5fec1af02e4053aa4b12d9e5`**. Full Camera/UI/audit verification:
**`ff5bd139125988b0a270e7d991cb2ed026518fab`**. Strengthened real full/LIGHT preview audit and current screenshot
source: **`d9a9f25b525a6d403b2c352d78745d78463f6a7f`**, tree **`8e19fdecc584e4b245864cdf5322be2474436208`**.
The six changed runtime files are byte-identical across these three commits; later changes corrected audit drivers.

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
   All six panels and both device orientations were captured. Actual photo thumbnails remain; these are original
   medium symbols and console codes, not copied platform assets.

The initial audit used `20261031audit1`; the owner-authorised layout follow-up uses `20261031audit2`. Published main remains `20261031ui1`.
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
phone/tablet viewport cases, and creates actual-renderer shader/icon sheets. Zero strength must equal Natural at the
matched render size; this is not an original JPEG byte-identity claim.
The existing full Camera/UI and MCP suites are retained. Historical pixel comparisons still check all 34 Looks; only the
intentional Crayon and repaired 32-bit differences are asserted as differences, with 32-bit geometry checked separately.

Local syntax, module consistency (16 modules), conversion and **15/15 MCP policy checks** pass. The cloud shell cannot
launch Chromium because its required local socket is blocked. Browser verification uses actual hosted Chromium/SwiftShader,
without a sandbox/security workaround. Browser chrome/native Share and physical-device performance are not simulated claims.

## Actual results and evidence

- On **ff5bd139**, Camera run **41189994682**, job **124504730033**, passed **143/143** existing checks
  (56 + 33 + 22 + 14 + 5 + 9 + 4), including **816 combinations**, **408 preview/export pairs** and **68 historical
  comparisons**. Its 57 UI and 50 audit checks also passed: **250/250 Camera/UI/audit**. World guard/WebKit
  **41189994659** passed. Linux **41189994689** was cancelled, not passed.
- On **d9a9f25**, Camera run **41190783338**, Camera job **124506978428**, passed **143/143**; UI job **124506978220**,
  **57/57**; audit job **124506978340**, **50/50**: **250/250** on the exact final screenshot/test source. The audit
  now reads the real full/LIGHT preview canvas, rather than treating the always-full export path as a LIGHT preview.
  The rerun retains all **816 combinations**, **408 full preview/export pairs** and **68 prior-engine comparisons**.
- MCP **41190783298**, job **124506977996**, passed **15/15 units + 20/20 actual MCP/Camera checks**. A fresh pinned
  dependency installation reports **zero npm vulnerabilities**. The official SDK client discovers all eleven tools and
  proves generated-image import/edit/preview/Save copy/export, original-source re-edit and explicit close/session isolation.
- World **41190783269** guard and automated iPhone WebKit startup/room acceptance passed. Linux **41190783339** was
  still running; do not count full console acceptance as passed. No World source or Linux binary release changed.

Real preview charts at 640×480, 480×640, 800×450 and 450×800 show baseline vertical line-centroid spread **17–30 px**
and horizontal spread **19.5–33.5 px**. Review full/LIGHT previews and exports measure **0 px** on both axes with
**zero missing markers**. Full preview/export maximum channel difference is **0**. Markers span at least two retro
texels; this proves removal of the mesh bend, not preservation of sub-texel detail. The quality chart retains **32 grey
levels**, **two dither values** on a flat patch, opaque pixels and exact deterministic repeats.

All **34 real UI choices** were selected; **33 effect sliders** exercised 0/100%, and Natural's irrelevant slider is
correctly disabled. At 0%, each matches Natural at 160×120. The 34 symbol definitions are distinct and have accessible
button names. Save copy retains its source and produces a JPEG. The contact sheet is a one-scene identity/control audit,
not a fresh all-photo aesthetic approval of every medium. Old TV/VHS keep their intended optical distortions.

Artifacts (SHA-256 verified after download, ZIP integrity/path checks passed):

| Run / artifact | Contents | SHA-256 |
| --- | --- | --- |
| 41190783338 / **13038722765** | 50-case audit, before/after, grid, 34-Look/icon sheets, 34 editor views, 24 panel views | `4e38d1e11bed6561312db78403a3a1e6e2943c05744b3dac7a7613e686cb18e1` |
| 41190783338 / **13038473448** | 57-case UI suite, 25 screenshots including small phone and 200% text | `aaa93e0a36158970afb43530784d6cdc7075bf3bc7245cb577451b7015d495be` |
| 41190783298 / **13038328674** | MCP before/after PNG, exported JPEG, 20-check receipt | `f7a83b147c401645e18603903cc652f65475efe2160aa1034a884988bd7ee2ab` |
| 41190783338 / **13039035960** | Passing 143-check Camera suite on the final source; original ZIP retained in delivery | `bfb6deadffa3276397cde8ffda2f4b52c4b08b3a234e70f1d9b2012ad58ba02d` |

Audit/UI/MCP images and the exported JPEG were visually inspected. In particular, the 32-bit before/after and straight
grid are real render differences; the 34-output sheet, icon sheet, iPad mini, Frame, Stickers, small-phone and 200%-text
screenshots were checked. [Evidence receipt and reproduction](qa/2026-10-31-design/README.md) records the final delivery.

## Remaining UI findings — do not claim a finished design

1. **Frame takes too much phone canvas.** At a settled 402×700 viewport, Looks shows a **288×216** photo, but Frame
   shows **198×149** (31% less height). At 744×980, iPad mini drops from **598×448** to **533×400**. Proposal:
   compact/disclose Paper/Mirror/date settings and preserve preview height. This redesign is not implemented.
2. **Sticker categories waste a row.** “Mine” wraps to a full-width second row on the phone. Proposal: balanced resident
   categories or thumbnails with one selected label. Not implemented.
3. **Short multi-Look rails clip visible content.** The 320×568 two-Look capture clips part of the first Print symbol;
   at 200% text, Original partly extends past the visible rail. Existing tests check label wrapping, target sizes and
   photo bounds, not every rail child's visible bounds. Proposal: anchor overflowing content at its start and verify
   scrolling/access for three Looks and Original. Do not interpret 57 passing checks as proof of no truncation.

No page-wide horizontal overflow was measured in the 24 settled panel cases; all six destination buttons remain at
least 44×44 and inside the viewport. This does not resolve the specific rail and canvas-balance findings above.

**Connection and publication remain separate:** the owner's installed MCP host and this chat are unconnected; no
personal Photos library or live Safari album is attached. The remaining local step is to install pinned dependencies
and Chromium on the owner's machine, register/reconnect the absolute Node server path from [MCP.md](MCP.md), and prove
tool discovery plus a generated-image cycle in that host. The automated SDK client is the only verified connection.
Physical iPhone 17/iPad mini Safari/native Share and real camera performance remain untested. Published main stays
`20261031ui1`; the review uses `20261031audit1`. Main publication requires a subsequent owner instruction.

**Next action:** review the delivered screenshots and three UI findings, then refine Frame/category/short-rail layouts
with focused visibility checks; agree an AR placement scope and assess source exports on both target devices. Keep all
work on the review branch and preserve existing Camera/World releases. Do not silently introduce hosted MCP, WebMCP,
hardware capture or personal-browser access.

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
