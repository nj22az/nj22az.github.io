# Pocket Camera UI implementation and review — 31 October 2026


## Approved implementation — 31 October 2026

The owner approved the screenshots with **“Push to main this looks good”** and then requested less text,
icon-coded shaders and status messages beside the canvas. This supersedes the historical review hold below.
Implementation is in an isolated checkout from main `faca8c535cef6927f243d7daff46d131d363d78e`, to be reviewed
on `codex/pocket-camera-ui` and merged to main only after actual checks. No production publication yet.

- Existing editor, renderer, all 34 Looks/three-layer mixing, crop, Enhance, stickers, paper and games retained.
- Stable header; concise welcome with labelled album; 44 px controls; adaptive tablet and phone layouts.
- Look categories and inactive mix layers use existing vector icons with full accessible names. Active names remain.
- Side rails show the active shader mix; Look announcements remain accessible without any visible canvas banner.
  Action/error messages occupy the controls' layout. Original comparison has an explicit side button.
- Save copy now always adds a new album entry, including re-edits, preserving prior photos and original bytes.
- Main style/app/renderer URL keys and the MCP adapter import use `20261031ui1`. Renderer source is unchanged.
- Local Camera units/module/syntax checks and MCP policy/lifecycle **15/15** pass. Hosted browser regression,
  new target-device UI checks and real MCP acceptance remain pending. Previous 143 checks are not counted anew.
- Existing tests are adapted for explicit Enhance strength, immutable copy IDs and the reserved side rail;
  pixel/hash, capture, settings, layout and privacy assertions are retained. The new UI suite checks discovery,
  canvas clearance, target dimensions, comparison, Enhance, original-byte retention and enlarged labels.
- A generated screenshot edit from the owner's exact selected image illustrates the side rail. It is not runtime
  evidence and is not used as a production asset. Hosted screenshots must show the actual implementation.

Next: inspect hosted checks and screenshots, fix failures without reducing coverage, then publish the verified
change under the owner's instruction. Physical iPhone 17/iPad mini Safari and installed MCP host remain untested.

## Historical review — owner direction and state

The owner requested research into an intuitive, unclipped Pocket Camera interface with Nintendo, LINE and Apple
influences, and **screenshots before changing the app**. They subsequently specified **iPhone 17 and iPad mini**
as the primary targets and asked to see the screenshots. This is a review hold on implementation/publication.

Verified repository base: local `main` and remote `main` both
`faca8c535cef6927f243d7daff46d131d363d78e`. PR #416 is already merged/closed as
`ffc02e29ff14a632cf05ae99f691b009af09f7c2`; it adds the local adapter, not this UI proposal.
No new implementation commit, PR, merge or deployment was made for this design review. These handover edits
are local and uncommitted. Existing unrelated local work was preserved.

## Deliverables and recommendation

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

## Research evidence

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

## Checks actually performed

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

## Remaining work and next action

1. Owner audits the screenshots and chooses/revises the visual direction **before production UI editing**.
2. Resolve the short-landscape inspector trade-off; specify three-Look mixing and full catalogue navigation.
3. Implement the approved direction in the existing Camera, preserving rendering, source retention, albums,
   copy-save, explicit Share, privacy boundaries and module cache alignment.
4. Run the existing Camera regression suite and layout checks, including the actual target widths, 200% text,
   iPad resized windows and reduced Safari height. Inspect actual renderer/export images again.
5. Verify on physical iPhone 17 and iPad mini Safari: safe areas/browser bars, rotation, large text, camera/import,
   native Share/cancellation and restored albums. **No physical device or owner's browser was connected here.**

Implemented: isolated review prototype only. Tested: bounded Chromium layout study. Connected: no new owner
device or installed MCP-host connection. Published: existing Camera release unchanged; this UI is not published.
