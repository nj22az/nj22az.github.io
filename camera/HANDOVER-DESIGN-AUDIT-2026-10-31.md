# Pocket Camera design/shader audit — 31 October 2026

## Published on the owner's “Push to main” — 31 October 2026

The owner explicitly instructed **“Push to main”**. [PR #418](https://github.com/nj22az/nj22az.github.io/pull/418) is
**merged and closed**, squash commit **`bd0507162dfa9d60cd891fd707893a7e22bcb618`**, parent
`83783c93448d1be251a61c213959448e1d21c971`. Its tree **`e74f9ebf7f01cc20e49e409b133aec201b9a97f8`** is identical
to final reviewed head **`d56ea1226b58738b7f313ce1c9765c9894684395`**. The merge used an expected-head guard;
no review comments or threads were outstanding. Existing local changes/media temporary files remain preserved.

The release includes the stable 32-bit photo geometry, 34 original shader symbols and all three layout fixes below.
Frame keeps 216 px photo height on the phone and 448 px on iPad mini, categories use one scrollable row, and each
Look/Original can scroll fully into its reserved rail. App/style/renderer/icon and adapter import keys align at
**`20261031audit2`**. Existing album originals, Save copy, approved imports and explicit save/export/close remain.

Final checks on the exact reviewed head **d56ea122**, all successful:

- Camera **41196615845**: regression **124523951952**, **143/143**; UI **124523952008**, **82/82**; shader audit
  **124523951770**, **50/50**: **275/275**, retaining all 816 combinations, 408 preview/export pairs and 68 baselines.
- MCP **41196615769**, job **124523951297**: **15/15 units + 20/20 actual MCP/Camera acceptance**, zero npm findings
  on fresh installation. Prior exact-runtime screenshots and generated-image export were inspected and retained below.
- World **41196615766**: guard **124523951382** and automated iPhone WebKit **124523951569** passed.
- Linux **41196615798**, job **124524246015**: **full console acceptance passed**. This supersedes all pending Linux
  states below, including the earlier layout-source checkpoint. No new Linux binary release was published.

Pages **41199773205** for the merge **passed**: build **124533102487**, report **124533347677**, deploy **124533347723**.
**42/42 public HTTPS addresses match the release byte-for-byte**, including the bare Camera entry, actual module/style
URLs, raw app/renderer/UI/icon files, service worker and adapter modules. [Publication receipt](qa/2026-10-31-layout-fixes/publication.json)
records SHA-256, exact URLs and deployment/jobs. This proves served bytes, not a physical-device or installed-client test.
Post-merge World run **41199773766** is independent of the passing PR checks and is not counted as passed at this checkpoint.

**Separate states:** source is implemented, merged and deployed; the official SDK acceptance client connects and
completes the generated-image cycle. The owner's installed MCP host and this chat remain unconnected. Physical
iPhone 17/iPad mini Safari/camera/native Share remain untested; AR remains a proposal with no new model/architecture.
The temporary session album, preview-pixel disclosure and export-before-close boundary remain in force.

The publication follow-up changes only handovers and the verification receipt, preserving the tested runtime. Keep
the older review notes below as history; their “draft/not published” labels describe the earlier checkpoints.
**Next:** inspect post-merge checks, test on the owner's physical devices and complete local MCP-host setup from
[MCP.md](MCP.md); assess AR exports only under a separately agreed scope.

Owner: “Why does 32 bit produce a warped image? … audit … as a Nintendo designer … UI and the icons … shaders … screenshots.”

## Owner-authorised layout fixes — 31 October 2026

The owner followed the audit with **“Implement the fixes”**. Continue draft PR #418 from verified head
`aa6c38213f38da3ee11027e2947fdad9ed1589ae`. Its Camera, MCP, World guard/WebKit **and Linux full acceptance all passed**;
this newer Linux success supersedes the pending status in the historical evidence below.

The follow-up implements the three listed UI findings: compact Paper/Mirror mode controls with an icon Date switch;
one horizontally scrollable sticker-category row that reveals the selection; and an explicitly bounded, nonshrinking
Look rail that scrolls independently of the clipped photo stage. Touch scrolling is allowed on the rail/categories
while photo gestures stay on the picture. Frame/Paper/Mirror/date recipe semantics, Save copy and the corrected 32-bit
renderer remain. Cache keys, including MCP, align at **`20261031audit2`**; no dependencies or AR implementation added.

Implementation source **`f38127e1fbe9504c8f9c131ae390f3210983c8e8`** passed the 50-case shader audit and 15+20 MCP
checks. The new UI assertion caught Paper controls extending below the panel in the 874×340 case. Follow-up
**`9e28f6d4d3bf137f4d1b27b9e54d07190dc1c34e`**, tree **`b3695dc5dae3bd48484b26c27e9d7e359e10c151`**, uses compact
landscape frame thumbnails and confines camera/editor gesture listeners to their picture area. The original failure
assertion remains. Rail checks also intersect the rail, stage and viewport and prove that a long press on the rail
does not compare/edit the photo. The core Mirror test now opens its explicit mode control; no assertions were removed.

Current source **9e28f6d4** results:

- Camera run **41195476077**: Camera job **124520778612**, **143/143 passed**; UI job **124520778456**, **82/82 passed**,
  retaining the previous 57 checks and adding 25 for the three findings; shader audit job **124520778264**, **50/50 passed**.
  This is **275/275 Camera/UI/audit checks**, including all **816 recipe combinations**, **408 full preview/export
  pairs** and **68 historical comparisons**, on the exact final runtime/test source.
- MCP run **41195476147**, job **124520658675**: **15/15 units + 20/20 real MCP/Camera checks passed**, no skips.
  Fresh pinned installation reports **zero npm vulnerabilities**. Generated-image previews and exported JPEG inspected.
- Local game units, syntax/module checks (**16 single-address modules**) and **15/15 MCP policy checks passed**.
- World **41195476103**: automated iPhone WebKit job **124520789047** and guard **124520788694** both passed.
  Linux full acceptance **41195476135**, job **124520836704**, was still in the native/disk-save stage, not counted as
  passed. No World source or Linux release changed.

All three UI findings are fixed in the review. Settled UI measurements:

| Available viewport | Looks photo height | Frame photo height | Result |
| --- | --- | --- | --- |
| iPhone 17, 402×700 | 216 | **216** (was 149) | Full photo size retained |
| iPhone 17, 402×874 | 216 | 216 | Retained |
| iPhone landscape, 874×340 | 228 | 228 | Paper controls fully inside their panel |
| iPad mini, 744×980 | 448 | **448** (was 400) | Full photo size retained |
| iPad landscape, 1133×650 | 506 | 506 | Retained |
| Compact iPad, 768×1024 | 466 | 466 | Retained |
| Small phone, 320×568 | 138 | 160 | Frame provides more photo space |
| Resized iPad, 507×740 | 294 | 294 | Retained |

Every case has **one category row**, all three Looks and Original reachable fully within the visible rail/stage/view,
and zero photo-stage scroll. The enlarged-text case also passes. On short windows the rail/category strip intentionally
scrolls; the claim is full access to each control, not simultaneous visibility of every control. Paper/Mirror/date
change the actual recipe, and Save copy still retains the original bytes and previous album entry.

Verified artifacts:

| Run / artifact | Contents | SHA-256 |
| --- | --- | --- |
| 41195476077 / **13041141097** | 82 UI checks, eight viewports and 200% text | `66e9f2edc537916f02f5d187be1531c3d5d5b76affc6eb72b0bb317cbf9ad7c2` |
| 41195476077 / **13040511160** | 50 shader checks, 34 actual outputs/icons, 24 panel captures | `a9f34a6dc3e356f9edf1cc07619ef80005878999ce616bdba7ffccb4ef46d651` |
| 41195476147 / **13040361138** | MCP previews, saved JPEG and 20-check receipt | `7fae06699f3e82a95db68033057a1ee4a6a271c2440df9268e8af52d1189119c` |
| 41195476077 / **13040388063** | Original 143-check regression ZIP, retained as a companion download | `1bc256fd573ababbb5ca5c2bd64f577cbce58566b01d48c93a5f188f6f8b5f2d` |

Downloads passed SHA-256, ZIP CRC and safe-path checks. Actual phone Frame/Stickers, iPad mini Frame, landscape Frame,
small-phone three-Look and 200% text captures and MCP before/after/export were visually inspected. The renderer body
is byte-identical to the accepted 32-bit correction (`effcc29d8f531fb1406047b6465006737ec7d2c687a57d9f5f789b6e656e4ef9`).
The [layout evidence receipt](qa/2026-10-31-layout-fixes/README.md) records the completed delivery and reproduction.

**Remaining:** current Linux full acceptance, physical iPhone 17/iPad mini Safari/native Share/camera checks and the
owner's installed MCP connection. Only the SDK acceptance client is connected. Main stays
`83783c93`/`20261031ui1`; draft PR #418 is not merged or published. AR remains the separate proposal below.

**Next:** owner reviews the delivered new screenshots and decides publication; inspect Linux full acceptance to completion.
Do not merge or publish without a subsequent instruction. Physical-device/installed-host checks and any
AR asset export/placement proof remain separate next actions.

## Initial design audit — source and historical evidence

Published main, verified again on 31 October: **`83783c93448d1be251a61c213959448e1d21c971`**, UI release PR #417
(`51f07130`). [Draft PR #418](https://github.com/nj22az/nj22az.github.io/pull/418), branch
`codex/pocket-camera-design-audit`, is **open, unmerged and not published**, with no comments/reviews at verification.
Existing local Camera/World work and unrelated media temporary files are preserved in separate worktrees.

Runtime implementation: **`26f576481cbcbf2b5fec1af02e4053aa4b12d9e5`**. Full Camera/UI/audit verification:
**`ff5bd139125988b0a270e7d991cb2ed026518fab`**. Strengthened real full/LIGHT preview audit and initial screenshot
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

## Original UI findings — fixed by the owner-authorised follow-up above

These describe the initial audit source d9a9f25b, before the subsequent implementation. Keep this history; the current
results and remaining device/connection limits are at the top of this note.

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
