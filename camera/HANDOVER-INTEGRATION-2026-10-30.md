# Pocket Camera integration candidate — 30 October 2026

## State and scope

Branch **`codex/pocket-camera-integration-rc`**, started from current `main`
**`87f47e8f6e5fafdb586ac723e9aa3cc704d11345`**. This is a review candidate, **not published**.
Main was not pushed, merged or deployed. The owner expressly reserves publication for a later instruction.

Integrated [PR #411](https://github.com/nj22az/nj22az.github.io/pull/411), head
`3af0bae6324fe73f974bd00bc371c6555d7f1e58`, and [PR #412](https://github.com/nj22az/nj22az.github.io/pull/412), head
`edc2a6d55b4c01a838f9001a05ec62e1b7bab80a`. Their individual handovers remain historical records:
[Save/Share](HANDOVER-REFINEMENTS-2026-10-30.md), [Enhance](HANDOVER-PHOTO-ENHANCE-2026-10-30.md).
This note supersedes them for the combined release. PR #408's published crop and compression remain intact.

## Reconciliation

| Area | Combined behaviour |
| --- | --- |
| Crop and compression | Existing crop gestures, ratios, Erase/Undo and source coordinates retained. JPEG quality 0.88, maximum 2,560 px long edge; retained imported original stays byte-identical until Erase changes it. |
| Recipe | Both `enhance` (0–1) and `paper` (None/Drawing/Rough/Warm) survive normalisation alongside crop, layers, adjustments, frame, focus, stickers and stamp. Old albums default to Enhance off and Paper None. |
| Renderer | One enhanced preparation pass; Looks run in their existing order; optional paper runs once after the Looks, before frame/stamp/stickers. Enhancement is independently authored conventional WebGL correction. |
| Cache | Page `app.js`, app's `looks-gl.js` import and `camera.css` all use **`20261030rc1`**. Unchanged modules keep their established keys. Module test also checks page/app/renderer/style consistency. Network-first service worker retained. |
| UI | Enhance is under Adjust; Paper is under Frame, including the live camera's Frame sheet. No extra editor tab. Original comparison bypasses enhancement, Looks and paper while retaining crop. |
| Save/Share | Save/capture persist to the app album. Share calls the native API from the tap and optionally animates printing. Cancel/failure never triggers a download. Unsupported file sharing retains explicit Download. |
| Solitaire | #411's seven-column phone layout, landscape sizing and vertical scrolling retained; resize does not redeal. |

Repeated save of the same enhanced, paper-finished, mixed-Look crop produces the **same JPEG bytes and shot ID**.
The source is decoded afresh on re-edit; correction and paper do not accumulate. The integration test also independently
renders and JPEG-encodes that saved recipe and requires exact SHA-256 equality with the saved file. Native Share is
mocked and must receive those exact bytes; no photo is transmitted by the tests.

## PR #405 dependency review

[PR #405](https://github.com/nj22az/nj22az.github.io/pull/405), `codex/pocket-camera-looks` at
**`f13068cc2026f01ba5556234ebb506c3270eab21`**, still targets `claude/friendly-darwin-a4e3re`, not main.
It is **not an integration dependency** and was not merged or cherry-picked. This candidate offers **34 Looks**, not 42.
There are no person-mask/worker/model, `photo-bodies.js`, new LUT or Glitch requests in the combined runtime check.

That branch changes the same app/renderer/cache areas and predates the published crop work. A future integration must:

1. Preserve `normalCrop`, `enhance` and `paper`, and rebase its import, capture, editor/save and thumbnail paths onto
   the source/crop/export flow here. Do not replace these files wholesale with #405's older versions.
2. Keep paper outside its per-Look/multi-pass sorting loop, applying it once after all stages; keep enhancement in
   preparation. Its LUT texture bindings and person-mask source/crop/mirror/trick transforms need combined checks.
3. Resolve its older pencil Crayon against #411's later wax Crayon decision. Preserve the latter unless the owner
   chooses another direction. Issue one coherent set of module keys, including its new modules/worker.
4. Run its own `photo-pipeline` and actual-model person-mask suites after rebasing, together with the crop and combined
   suites here. Those #405-only suites are not applicable to this candidate because their unapproved implementation
   dependencies are deliberately absent. Its native-size, memory and physical-Safari limits remain open.

## Validation actually performed

**Local Chromium 133, Playwright 1.62.1, Node 24.22.1, SwiftShader.** Viewport/touch emulation, not iOS or Safari.
The existing camera log's historical “iPhone Safari” labels describe emulated viewport scenarios only.
All final logs and actual images are under [the evidence directory](qa/2026-10-30-integration/README.md).

| Check | Final result |
| --- | --- |
| `camera/tests/camera.browser.mjs` | **56/56**: fake-camera capture, every published Look, thumbnails, mixing, frames, stickers, eraser, imports, storage, games, printer, black-save rejection. |
| `camera/tests/crop.browser.mjs` | **33/33**, including real Chromium two-touch pinch, cropped Erase/Undo, save pixels, original hash and compression. |
| `camera/tests/enhance.browser.mjs` | **22/22**, including prior-main Natural/off pixel parity. |
| `camera/tests/save-share-layout.browser.mjs` | **14/14**: mocked Share activation/bytes/cancellation/failure, album failures, seven viewport sizes and game retention. |
| `camera/tests/paper.browser.mjs` | **5/5**: all stocks, black/colour retention, UI and persistence. |
| `camera/tests/integration.browser.mjs` | **9/9**: 816 full/LIGHT combinations; 408 full preview/export pixel comparisons; 68 prior-engine comparisons; eight mixed thumbnail comparisons; actual UI-selected mix, crop and strength; Original pixels; exact reference JPEG; exact Share bytes; repeated-save equality; cancel/reload; #405 dependency exclusion. |
| All `camera/tests/*.test.mjs` | Passed: Looks, crop, module versions, Blackjack, Memory, Solitaire, social-share rules. |
| JS syntax, Python compile, workflow YAML, `git diff --check` | Passed. |
| Actual photo rendering | **144 outputs**: six photographs × Natural/Crayon/Manga/Oil/Miniature/Riso three-colour × off/enhanced/enhanced+Rough/LIGHT+enhanced+Rough. All six proof sheets, portrait 1:1 detail and phone screens inspected. |

Off/None matches #411 **for all 34 Looks**. It matches main **for all 33 unchanged Looks**; Crayon changes intentionally.
The crop compression bench retains its 61.2% size reduction and 39.17 dB JPEG PSNR result on the established café fixture.
This is an encoding bench, not a perceptual quality score or a guarantee for every Look/photo.

The new PR-scoped [camera workflow](../.github/workflows/pocket-camera.yml) runs unit/syntax and all six browser suites
sequentially and retains logs/screenshots. Its hosted status is recorded with the integration PR after upload.

Two initial faults were in the new test fixture, not observed runtime regressions. A raw-versus-JPEG tolerance of 8 was
inappropriate for dithered Riso (9.552 mean difference); replaced with the stronger exact reference-JPEG comparison.
Original readback after compositing read the cleared `preserveDrawingBuffer:false` buffer; the fixture now captures
immediately inside the actual UI draw, before composition. Both early logs are retained; no existing assertion was removed.

## Visual assessment and remaining limits

Enhancement gives a modest tone/detail change on the six photographs. Rough paper visibly adds tooth; the Crayon face
retains readable teeth, glasses and dark masses. No broad sharpening halo, paper doubling, blank image or lost setting
was observed. Crayon remains photographic in places, and Manga/paint retain their established persona-audit faults;
this integration does not claim to solve the wider artistic backlog. LIGHT intentionally differs from full in heavy
Looks. Passing compile/pixel tests establish integration behaviour, not independent artistic or device acceptance.

**Physical iPhone/iPad Safari, Home Screen mode, actual native Share/Photos sheet, camera permission, device JPEG/wide-gamut
behaviour, native 12 MP imports, hardware frame rates, memory/thermal behaviour and real context restoration are unverified.**
The cloud preview browser reported no WebGL 2, so its view is not rendering evidence; the local SwiftShader captures are.

Next: review this single candidate, then try native Save/Share/cancel, crop/re-edit, Enhance+Crayon+paper and Solitaire
rotation on a physical iPhone. Publish only after the owner's explicit new instruction. Keep #405 separate.
