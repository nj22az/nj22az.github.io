# Complete Sakura staircase — 23 October 2026

The owner rejected the five-tread candidate after reviewing its pictures: the complete staircase must exist even where it cannot be seen from below. This revision has two complete twelve-tread flights, a turning landing and a top landing. The enclosing plaster wall hides the return around the bend. There is no black panel across the lower run. The same geometry is used in the shop and office room frames; the established fade passage remains.

## Pictures

- [Entrance comparison](front-comparison.png).
- [Stockroom comparison](stockroom-comparison.png).
- [Revised front](after/front.png), [side](after/side.png), [low](after/low.png), [stockroom](after/stockroom.png).
- [Desktop](after/desktop-stockroom.png) and [landscape](after/landscape.png).
- [Upstairs arrival](after/up-arrival.png) and [downstairs arrival](after/down-arrival.png).

These are actual-game captures. The comparison uses the previous candidate's stair module from `2f90f5ee84d9c605d7cba7f98dbe2acc477b83ad` inside the same current game, with identical camera fixtures, fresh storage, web edition and sunny town minute 424100. The previous view is served from source to substitute that module; the revised view uses the rebuilt runtime. This is not a claim about an exact original owner camera or physical-device acceptance.

The captured source is local commit `83222c98`, whose complete tree matches remote code commit `68fc1a27189036071cc6aed8e56b41a951f1033f`; its base includes main `b4a4320e5a3369a8c114274d5ee22de250bc4463`. Runtime source SHA-256: `eaa8747ae32edf501df5bc1fabff2c4941a7fc5fce7e97e5d81798f1fe1b8855`.

## Checks actually completed

- Stair and shop-budget suites: eight tests passed. Existing draw and triangle limits are unchanged. Vertex-coloured steps retain separate tread/riser colours with one draw each.
- Direct geometry scan: no coplanar findings in either the complete stair entrance or upstairs room at the existing 2 mm / 0.0005 square metre indoor threshold.
- Full z-fighting suite: 13 passed, without exclusions or tolerance changes.
- Full guard attempt: 359 checks passed, while the z-fighting test process exited without an assertion result. The isolated rerun above passed all 13 of that file's checks. This covers 372 individual checks across the completed runs; it is not reported as one green full-guard invocation. The hosted guard must pass before merge.
- Actual rebuilt game: all eight transitions passed (up/down by prompt and by walking onto the trigger, in first and third person), with clear arrivals/cameras and zero page errors. See [third-person report](after/report.json) and [first-person report](first-person/report.json).
- 390×844, 1280×800 and 844×390 images captured through Electron's offscreen Chromium with SwiftShader. No desktop preload/bridge is installed, so these are web-edition checks. This is not installed Linux, physical Steam Deck or iPhone Safari acceptance.

The logs in this directory preserve the interrupted guard and successful isolated checks. Old pictures in the parent directory are historical and superseded.

## Reproduce

From `johansson-town`, use `node tools/sakura-entrance-photos.mjs <output>` for standalone Chromium. Add `--electron=/absolute/path/to/electron` for offscreen Chromium when a standalone browser is absent. Run alone. `--first --checks-only` checks first-person transitions; `--source --baseline=<commit> --photos-only` captures the comparison views with an older stair module. No native-game acceptance is implied by the optional Electron renderer.

PR #364 remains unmerged pending owner review of this revision and current hosted checks.
