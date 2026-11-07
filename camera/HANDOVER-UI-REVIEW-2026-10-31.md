# Pocket Camera UI implementation and review — 31 October 2026

## Published implementation — 31 October 2026

The owner approved the review with **“Push to main this looks good”**, then requested less text,
icon-coded shaders and status beside the canvas. [PR #417](https://github.com/nj22az/nj22az.github.io/pull/417)
was squash-merged to main as **`51f071309f6b9e1dbd6977595004c6c60602a0ee`**, parent `faca8c535cef6927f243d7daff46d131d363d78e`.
Its tree matches tested head **`dd5997a775736f5990044ea9b2a210fc47a68211`**, tree
**`dbb3294fdd61c30f8418d81834c9cb264e53a0d4`**. Existing local changes and unrelated World work are preserved.

The existing Camera was adapted in place. The renderer source, all 34 Looks and three-Look mixing, crop,
Enhance, Erase, stickers, frames, paper, albums, direct-tap Share and games remain. The main changes are:

- Six primary editing tools use existing vector icons; the selected tool keeps its short name. Full accessible
  names, keyboard labels and at least 44 px primary targets remain. Look categories, adjustment choices and
  mixed layers use icons and thumbnail previews instead of repeated names.
- The active shader mix and Original comparison occupy a reserved side rail. Look announcements remain
  accessible but do not paint a banner over the picture; other action/error messages occupy the controls' layout.
  Zoom and exposure also stay outside the live picture.
- Stable header, shorter welcome, labelled album, separate settings view and one active adjustment slider.
  Phone/tablet portrait, landscape, reduced Safari-height samples and resized iPad windows adapt. Enlarged text
  expands the rail and reflows the icon grid; short/enlarged views may require vertical control scrolling.
- Save copy always adds a new album entry, including a re-edit, preserving the preceding photo and source bytes.
  Edited metadata is retained. No renderer rewrite, new dependency or album migration was introduced.
- Page/app/main-style/renderer URLs and the MCP adapter import are aligned at **`20261031ui1`**. The existing
  network-first service worker, source storage and renderer bytes are unchanged.

### Actual verification

| Check | Exact run / job | Result |
| --- | --- | --- |
| Camera regression | [41183839653](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839653), `124486593328` | **143/143** (56 + 33 + 22 + 14 + 5 + 9 + 4); 816 combinations, 408 preview/export comparisons and 68 baseline comparisons |
| Target-device UI | same run, `124486593513` | **57/57**, eight viewport cases, including phone/tablet portrait/landscape, compact/resized windows and 200% CSS text |
| MCP units + real acceptance | [41183839641](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839641), `124486593146` | **15/15 + 20/20**; initialization/discovery, generated imports, edit, preview, copy-save, exact-byte export and cleanup |
| npm audit | local `npm audit --prefix johansson-town --json` and fresh CI install | **zero findings**; no UI dependency changes |
| World guard / automated World WebKit | [41183839643](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839643), `124486593665` / `124486593308` | **560/560** guard and startup/room acceptance passed; not a physical Camera Safari test |
| Linux console | [41183839640](https://github.com/nj22az/nj22az.github.io/actions/runs/41183839640), `124486892433` | Build, facial visibility, controller recovery, native/disk saves and offline acceptance passed; full World controller/layout/resident/save acceptance still running at publication |

Local Camera unit/module/syntax and MCP policy checks also passed. All existing regression assertions remain;
no timeouts or graphics settings were relaxed. The final toast fix restores zero opacity when dismissed alongside
`display:none`, retaining the original dismissal contract without putting the message over the canvas.

The existing regressions retain pixel/hash, capture, crop, shader compatibility, Share activation, album and
sticker assertions. Adaptations reflect deliberate copy-save IDs/counts, explicit Enhance strength and the
reserved picture area. Failures found during review were corrected: zoom intercepting a sticker gesture,
missing edited metadata, a Paper row wider than the phone, a fixed-height Adjust row and enlarged-text wrapping.
The UI test now checks control bounds after Reset and picture fitting after a text-size change.

The actual hosted Chromium screenshots were inspected for iPhone 17 welcome/Looks/Adjust/landscape, iPad mini
portrait/landscape and 200% CSS text. MCP before/after PNGs and the exported JPEG were also inspected.
The original generated screenshot edit was illustrative only; it is neither runtime evidence nor a deployed asset.
Evidence IDs, ZIP SHA-256 values and live-byte verification are in [publication evidence](qa/2026-10-31-ui/publication.json).

### State and next action

- **Implemented:** the real `/camera/` UI and its matching local adapter module key.
- **Tested:** the exact candidate and checks above, using hosted Chromium/WebGL and an official SDK stdio client.
- **Connected:** the acceptance client discovers all eleven tools and completes a generated-image import/edit/
  preview/save/export/close cycle. The owner's installed MCP host and this chat remain unconnected.
- **Published:** [Pages build/deploy/report passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41184647837); **44/44** checked public addresses match `51f07130`. Public-file checks compare the deployed bytes with the tested runtime.

Next repository check: inspect Linux run **41183839640** before calling full Linux acceptance passed.

Physical iPhone 17/iPad mini Safari, native Share/cancellation, camera permission, safe areas and restored personal
albums remain unobserved. Next: exercise those on the owner's devices. For local MCP, pull main, install the pinned
dependencies/Chromium, register Node with the absolute server path and reconnect a stdio-capable host as described
in [MCP.md](MCP.md); then verify discovery and the generated-image cycle before approving personal pixels.
MCP albums remain temporary; export before closing. Preview sends pixels to the connected host. Approved-image
imports, copy-save and explicit save/export/close confirmation remain. No hosted HTTP MCP, personal Photos/browser
connection, arbitrary-JavaScript tool, new Linux binary or World graphics change was introduced.

## Historical review — owner direction and state

This section records the pre-approval prototype review. The published implementation above supersedes its hold and next steps.

The owner requested research into an intuitive, unclipped Pocket Camera interface with Nintendo, LINE and Apple
influences, and **screenshots before changing the app**. They subsequently specified **iPhone 17 and iPad mini**
as the primary targets and asked to see the screenshots. At that stage this was a review hold on implementation/publication.

Verified repository base: local `main` and remote `main` both
`faca8c535cef6927f243d7daff46d131d363d78e`. PR #416 is already merged/closed as
`ffc02e29ff14a632cf05ae99f691b009af09f7c2`; it adds the local adapter, not this UI proposal.
At that review stage no implementation commit, PR, merge or deployment had been made, and the handover edits
were local and uncommitted. Existing unrelated local work was preserved.

### Deliverables and recommendation

Review source and images were prepared outside the checkout in
`/workspace/scratch/0bac722ae682/camera-ui-review/`. The downloadable `Pocket-Camera-UI-review.zip` contains
the isolated HTML/CSS/JS prototype, original supplied screenshot, retained existing editor evidence, six proposed
screenshot boards, research and JSON layout measurements. Open `dist/index.html` for the phone audit or
`dist/devices.html` for the primary device studies after extracting the package.

- Keep Johansson's existing charcoal/yellow palette and characters. Use the character beside a small photo print
  instead of letting it consume most of the welcome view.
- Reserve stable header slots for Back, the title and Settings. Remove the expanding status-icon pill and duplicate
  import action from the welcome header; show camera choices in a labelled settings view.
- Keep Start camera and Choose a photo explicit. Give the temporary/current browser's album a labelled entry.
- Give all six editing tools complete labels and at least 44 × 44 CSS-pixel targets. Use a two-row tool grid on
  phones; a wider row in tablet portrait; a separate inspector in landscape.
- Show one active adjustment slider. Offer Enhance strength on tap to avoid displaying two competing sliders.
- Rename the existing save action **Save copy**, retaining original-source re-editing and a separate direct-tap
  Share action. Put album photos before the secondary Game Room entry.

The prototype is simulated UI. It does not open a camera/Photos picker, process shaders, create real saved photos,
export, send a photo or open native Share. Only the original/Adventure samples are retained app output; Mono,
Sepia and other displayed mock choices are illustrative. The complete 34-Look catalogue, three-Look mixing,
sticker authoring and all panel behaviours still need an implementation specification if this direction is approved.

### Research evidence

- Apple layout guidance: adaptable layouts, safe areas and larger text:
  https://developer.apple.com/design/human-interface-guidelines/layout
- Apple UI design tips: fit the screen, avoid overlapping text, provide generous touch targets and contrast:
  https://developer.apple.com/design/tips/
- LINE Voice: short, clear, unambiguous action labels:
  https://designsystem.line.me/about/line-voice-en
- Nintendo HOME Menu: separate content tiles, Album and system settings. Tactile tiles/character warmth are our
  design interpretation, not an official Nintendo design rule:
  https://en-americas-support.nintendo.com/app/answers/detail/a_id/22308/~/home-menu-overview
- W3C reflow and enlarged text references (not a claim of WCAG conformance):
  https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
  https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- Device sizing references: https://www.apple.com/iphone-17/specs/ and https://support.apple.com/en-ie/121456
  Native screen pixels are distinct from CSS app viewports and available Safari height.

### Checks actually performed

Six screenshot boards were captured from the isolated prototype in the supported cloud Chromium browser:

1. `01-proposed-main.jpg`: welcome, Looks editor, album at 393 × 700.
2. `02-proposed-controls.jpg`: Adjust, Crop and Settings at 393 × 700.
3. `03-proposed-narrow.jpg`: welcome, Looks and Adjust at 320 × 568.
4. `04-large-text-study.jpg`: three 320 × 568 views with an explicit 200% CSS text/layout study; content scrolls
   vertically. This is not Safari Dynamic Type or a browser-zoom conformance test.
5. `05-ipad-mini-editor.jpg`: 744 × 980 portrait and 1133 × 650 landscape; the board displays them at 72%/60%.
6. `06-iphone-17-editor.jpg`: 402 × 700 portrait and 874 × 340 landscape; the board displays them at 100%/80%.

Read-only DOM measurements cover **16 screen samples** (12 general + 4 device-specific): no horizontal overflow
or `scrollWidth` text clipping was detected in the sampled headings/labels, and no sampled button/range target
was smaller than 44 × 44 CSS pixels. This is a bounded layout check, not a full accessibility audit.
At 874 × 340, the landscape inspector is 159 px high with 259 px of content: **vertical inspector scrolling is
required to reach strength**. Keep that visible trade-off in the owner review; do not claim every control fits
simultaneously in short landscape. Tablet welcome/Adjust variants exist in the prototype but were not visually
accepted during this pass.

Prototype `node --check dist/review.js` passed. The simulated Choose a photo → editor → Save copy flow was
observed; native import/save/Share were not exercised. The published page was inspected, but this cloud browser
reported no WebGL 2, so existing verified editor screenshots supplied the current-editor visual baseline.
The shared preview later returned unrelated World content; those responses were rejected as Camera
evidence. Further device captures were stopped. No browser/network security settings were changed.

Camera runtime/renderer, cache keys, service worker, MCP adapter and World source were not edited. Their prior
regression results remain historical; those suites were not rerun for this isolated static design study.

### Remaining work and next action

1. Owner audits the screenshots and chooses/revises the visual direction **before production UI editing**.
2. Resolve the short-landscape inspector trade-off; specify three-Look mixing and full catalogue navigation.
3. Implement the approved direction in the existing Camera, preserving rendering, source retention, albums,
   copy-save, explicit Share, privacy boundaries and module cache alignment.
4. Run the existing Camera regression suite and layout checks, including the actual target widths, 200% text,
   iPad resized windows and reduced Safari height. Inspect actual renderer/export images again.
5. Verify on physical iPhone 17 and iPad mini Safari: safe areas/browser bars, rotation, large text, camera/import,
   native Share/cancellation and restored albums. **No physical device or owner's browser was connected here.**

**Historical state at review:** implemented: isolated review prototype only. Tested: bounded Chromium layout study. Connected: no new owner
device or installed MCP-host connection. Published: existing Camera release unchanged; this UI is not published.
