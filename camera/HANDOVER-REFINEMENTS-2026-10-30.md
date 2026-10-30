# Pocket Camera: Save/Share, Solitaire sizing, wax Crayon and Paper — 30 October 2026

## Owner's instructions and branch

After the crop/compression release, the owner requested, in this order:

1. Save should only save to the in-app album; printing belongs with Share, and Share allows saving into the phone's Photos.
2. Solitaire does not resize properly on their iPhone 17.
3. Crayon looks poor on the supplied iPhone screenshot; improve it and audit as a crayon artist.
4. Paper textures should be an option.

Branch **`codex/pocket-camera-save-share`**, from `main` **`ff76aee1`**. Earlier crop release PR #408 remains live.
These changes are **not published**; the previous “Publish” authorised that earlier release. No main merge here.

## Implemented

- Save and camera captures persist directly to IndexedDB; no printer, phone download or share sheet is triggered.
  Failed storage leaves the editor open and reports the error, rather than silently downloading a photo.
- Share opens `navigator.share` in the original click, alongside the optional printer animation. Waiting for a
  three-second animation first risks losing the [Web Share transient activation](https://www.w3.org/TR/web-share/).
  Print-off/reduced-motion still share. Cancellation/failure cleans up the printer, keeps the photo, and never
  substitutes a download; failed native Share is retryable. Browsers without file sharing retain explicit Download.
  Duplicate taps are guarded until the share finishes. Native share was mocked in automated tests; nothing sent.
- Solitaire's style layer forced `min-width:428px`. It now uses seven equal columns in the actual board width,
  proportional cards, separate exposed heights for face-up and face-down stacks, and vertical scrolling for long
  runs. Short landscape screens reduce card/toolbar sizes. Resizing retains the game and scroll state; no new deal.
- Crayon is rebuilt only in `camera/looks-gl.js`: colour underdrawing, edge-preserving grouping, broad overlapping
  wax marks, tooth, pressure and burnished darks. Crossed pencil grain and ink-like contour specks are removed.
  Three visual iterations; full and LIGHT builds judged on six photos. [Artist audit](AUDIT-LOOKS-2026-10-30.md) and
  [before / revised / Rough-stock proof](qa/2026-10-30-refinements/crayon-review.jpg). The owner's screenshot was
  diagnostic, not used as the raw input. Its original photo was unavailable.
- Paper in the editor Frame tab and camera Frame sheet: **None, Drawing, Rough, Warm**. Default None adds no pass.
  Selected paper is a deterministic post-Look finish, before frame/stamp/stickers, shared by preview, thumbnails
  and saved pixels. It persists in recipes and camera preferences, is inherited by imported photos, and steps aside
  during Original comparison or Erase. Black areas remain black; stock tint does not bleach them. No image download.
- App, renderer and style cache keys updated. `tools/render-camera-looks.mjs --paper rough` supports repeatable QA.
  No World shader, character, unrelated page or runtime bundle changed.

## Checks actually run

Environment: Chromium 133 with SwiftShader, Playwright, emulated phone/tablet/desktop sizes; no physical iPhone.

| Check | Result |
| --- | --- |
| `node camera/tests/save-share-layout.browser.mjs` | **14/14**: album-only saves; original-tap native-share mock; file bytes/type; duplicate guard; cancel/failure cleanup; Print-off; unsupported-browser Download; quota failure preserves edit; Solitaire resizing at seven sizes, preserving game; no page errors |
| `node camera/tests/paper.browser.mjs` | **5/5**: all stocks deterministic across Natural/Crayon/Manga/Riso; draw/export pixels agree; None unchanged; blacks/colour retained; Rough has stronger tooth; thumbnails; 320 px UI; saved recipe and camera-preference restoration; no page errors |
| `node camera/tests/crop.browser.mjs` | **33/33**, including zoom/pinch, cropped Erase/Undo, saved pixels, source hashes and compression |
| `node camera/tests/camera.browser.mjs` | **56/56**, printer coverage moved from capture to Share under the owner's new decision; step feed, skip, Print-off and album assertions retained |
| Crop unit, 33 Look conversions, module versions, Solitaire rules, social-share rules | Passed |
| JS syntax and `git diff --check` | Passed |

Solitaire viewport checks: **402×740**, **402×874**, **874×340**, **320×560**, **390×664**, **768×1024**, **1280×800**.
These are viewport coverage, not a claim of an actual iPhone 17 hardware test. Header, New game and status remain
reachable; cards keep their 5:7 proportions; all columns fit without horizontal scrolling; rotation does not redeal.

Crayon renders: `tools/camera-test-photos.py` into `/tmp/camera-crayon-bench/in`; `tools/render-camera-looks.mjs` before,
after, `--light`, and `--paper rough` on all six photos. Contact sheets and portrait 1:1 images inspected. The final
artist review is this agent's separate assessment; no independent reviewer was used and no physical phone rate measured.
The review proof credits Ozan Çulha / Pexels 28890349. Other bench images remain transient with sources in the tool.

## Next

Review the branch and draft PR, then publish only on the owner's explicit instruction. After publication, test the
native iPhone Save Image sheet, cancellation, browser/Home Screen rotation and the owner's unfiltered portrait.
Physical Safari behaviour, hardware frame rates and the actual phone Photos app remain unverified. The wider Looks
backlog and Minato mode remain separate. Handover delivery details will identify exact commits and PR.
