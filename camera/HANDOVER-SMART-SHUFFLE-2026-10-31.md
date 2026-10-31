# Pocket Camera photo-aware Surprise — 31 October 2026

## Review state

The owner wants any uploaded photo to guide attractive combinations of Looks and settings, with later dice clicks
exploring variations. This is a review implementation, **not merged or published**. Main's published Camera is still
`20261031audit2` from PR #418. The review branch is `codex/pocket-camera-smart-shuffle`, based on main
`baf0da1a0745bad6238811bdfae26c4df4aebe67`, preserving the concurrent World engine-room/arrival work.
Implementation source: `02d3ea199b80b9c6f1e9ed3c0abc2b6da2bf65da`. Hosted browser verification and a draft PR are the next actions.

## Behaviour

In the photo editor, the existing dice measures a small preview of the original cropped photo, renders up to sixteen
candidate mixes through the actual Camera engine, and ranks structure, usable tone, clipping and colour. It tunes Look
strengths, six adjustments and Enhance for that source. Later clicks include refinements of the preceding match and
favour a different high-ranking family. The live camera retains its twenty curated random mixes.

This is a bounded quality heuristic, not a learned aesthetic model or a promise that every click is subjectively more
beautiful. The search uses the original source each time; it never bakes the previous rendered result into the next.
Crop, frame, paper, stamp and stickers remain. Undo Surprise restores the preceding Looks/tonal settings while retaining
later crop/frame edits. Manual changes, replacement photos, backgrounding and Save cancel stale work. The dice reports
busy state without covering the canvas. Search has an approximately 1.8-second cooperative budget; cold compilation
can require another click. Samples are at most 128 pixels per side and temporary GPU targets are released.

All processing stays in the browser. No new dependency, network service, model, hardware capture, native Share, AR or
new MCP tool is added. The adapter renderer import matches `20261031smart1`; the new module has one versioned URL.
Existing MCP approved imports, pixel-preview disclosure, temporary album and explicit save/export/close remain.

## Verification so far

- Local: all Camera unit/module checks pass, including **7/7 new Smart Surprise checks**, plus syntax and diff checks.
- Local MCP policy/lifecycle/cache-key checks: **15/15 pass**.
- Browser checks and real screenshots: **pending hosted execution**, not claimed passed. The new suite covers five
  source types, repeat search, Undo, later crop/frame edits, stale-result cancellation, save-copy, GPU cleanup, privacy
  and phone/tablet/large-text controls. Existing 275 Camera/UI/audit browser checks remain in place.
- Physical iPhone 17/iPad mini Safari, actual hardware camera and native Share remain untested. The owner's installed
  MCP host and this chat remain unconnected; only the previously verified SDK acceptance client connects.

## Next action

Open a draft review PR, run all existing Camera/MCP regressions and the new real-photo search suite, download/inspect
before/after previews and saved JPEG, retain evidence, and update this note with exact source, PR and check results.
Do not merge, publish or enable auto-merge without the owner's next instruction. Keep unrelated local changes intact.
