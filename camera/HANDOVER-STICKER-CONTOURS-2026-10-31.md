# Pocket Camera: thin sticker contours — 31 October 2026

**Publication update — 31 October:** the owner’s “Push to main” authorised publication. [PR #414](https://github.com/nj22az/nj22az.github.io/pull/414) is merged as `cf86ea2a`; strict **143/143** browser checks and Pages deployment passed. Read the [publication handover](HANDOVER-PUBLICATION-2026-10-31.md) for the current state and remaining device limits. Review-only statements below describe the earlier stage. #405 remains separate.

## Current review and authority

The owner's follow-up during the integration task: “The stickers still have to big white outline it should be more
like a contour”. This extends **[PR #414](https://github.com/nj22az/nj22az.github.io/pull/414)** on
`codex/pocket-camera-integration-rc`; the original Save/Share/Enhance integration is still included. **Not published.**
Main remains `87f47e8f6e5fafdb586ac723e9aa3cc704d11345`; no main push, merge or deployment is authorised.

Read with [the integration handover](HANDOVER-INTEGRATION-2026-10-30.md), which records source PRs #411/#412 and the
deliberate exclusion of #405. Initial implementation `983ed88d5d381f480ad44784bdfb34edb68830ee`; delivery note
`6cdf69ae5faab1353b9b220b96af7c44d939e8c0`. That version's **workflow reported green; this was later found to be an incomplete pass**
([run 41135753566](https://github.com/nj22az/nj22az.github.io/actions/runs/41135753566)). The follow-up travels with this
note; PR #414 records its exact final head and the new hosted result. Do not represent the earlier run as testing the
later asset changes. Full-log audit subsequently found a portrait-layout fixture timeout masked by the logging pipe in both early runs; those green statuses are not accepted as full camera passes.

## What changed

- The wide white paper was baked into the resident assets, not a CSS outline. Recut **all 116 residents/pairs and
  116 thumbnails** from the published WebPs into a **0.45%-of-long-edge white contour** (about 4.6 px at 1,024 px).
  It follows round the actual figure, arms, hair and gaps; broad grey cut stock and square paper shoulders are removed.
- `tools/camera_sticker_contours.py` identifies background-connected paper and the studio's specific grey cut colour,
  retains the figure/white clothing, removes detached cut-stock fragments, and grows a Euclidean contour. Its source
  is pinned with `--baseline-ref 87f47e8f`, so repeating it does not accumulate a new border or WebP loss.
- **Canvas dimensions, figure position, IDs and recipe coordinates remain identical.** The output is lossless WebP
  from the existing decoded art; the figures are not repainted. Picker, greeting, Memory, preview and export all read
  the same updated catalogue. Full catalogue plus thumbnails is approximately 19 MB rather than 7 MB; assets are
  fetched as used. Lossless output avoids a second lossy compression of the source art.
- `tools/build-camera-stickers.py` now applies the same contour when rebuilding from studio plain PNGs. Encoding is
  validated in memory and assets are replaced atomically, avoiding partially written files during a rebuild.
- New custom stickers in `cutout.js` use the same **0.45%** rim rather than **3.5%**, with no second grey cut line and a
  restrained shadow. Transparent cut-outs follow their shape; opaque photos retain their rounded-photo shape.
- New catalogue/asset/sticker/cutout key **`20261031-contour1`**. Page/app/renderer/style release key
  **`20261031rc2`** is consistent; the renderer's shader bodies are unchanged by this follow-up.

Existing flattened album JPEGs and previously created custom-sticker blobs remain as saved. The latter have no
retained original subject/alpha separate from their baked border, so they are not destructively white-keyed; reimport
the original to give an old custom sticker the new contour. This does not affect the 116 supplied stickers.

## Checks and actual evidence

Local Chromium 133 / SwiftShader, Playwright 1.62.1; no physical iPhone or Safari test.

| Check | Result |
| --- | --- |
| All 232 generated WebPs | Decoded, dimensions checked, SHA-256 retained in [assets.json](qa/2026-10-31-contours/assets.json). |
| `python3 tools/camera-sticker-contours.test.py` | Passed: white clothing, actual pale-shoe regression, concave gap, narrow rim and fixed canvas. |
| `camera/tests/sticker-contour.browser.mjs` | **4/4**: all 116 full images/thumbs and keys; real pale shoes retained; transparent/opaque custom sticker rims and corners; actual picker placement; **zero pixel difference** between preview asset and export drawing; save; no page errors. |
| `camera/tests/camera.browser.mjs` | **56/56** on the updated app/cutout/catalogue paths, including capture, sticker gestures/handles, custom stickers, saved recipes, Memory and printer. |
| All camera unit tests, module keys, JS syntax, workflow YAML and whitespace | Passed. |
| Six catalogue sheets | **All 116 before/after pairs inspected**, including three-resident hero, shoes, dress details, hands and pairs. |
| Actual phone screenshots | Editor and saved photo at **390 × 664**, Chromium touch viewport. Not Safari. |

The PR workflow now runs **seven browser suites**, adding sticker-contour to camera/crop/Enhance/Save-Share/paper/
integration. Expected combined count is **143** (139 original integration checks plus four contour checks); refer to
the PR for the actual hosted result. The original 816 rendering matrix, saved-JPEG/Share identity and #405 isolation
checks remain in that workflow. The initial six-photo photographic rendering comparisons remain valid because this
follow-up changes sticker assets and cutout generation, not Look shader bodies.

Visual review caught two generation problems before upload: warm compression fragments around old cut stock, and a
broad grey key that could open the flood into pale shoes. The final mask matches the known cut colour, preserves the
shoe boundary and rejects detached stock; both real shoes are regression fixtures. An early concurrent encoder run
also produced six empty local files; the final generator encodes/verifies before atomic replacement, and every final
asset was decoded and hashed. Those failed intermediate assets were never uploaded to the review branch.

Actual comparisons/screens and the final local logs: [evidence](qa/2026-10-31-contours/README.md).

## Hosted gate correction after full-log audit

The green status on run 41139190457 masked a camera suite failure: Bash used `-e` without `pipefail`, so `node ... | tee ...` returned the successful logger status. The other six suites passed, while camera stopped at the portrait compact-layout fixture. [Original excerpt](qa/2026-10-31-contours/ci-wrapper-first.log) is retained. The local Chromium 133 camera run remains 56/56; the early hosted statuses are not complete camera acceptance.

The workflow now sets **`set -euo pipefail`**, verified by injecting exit 23 through `tee` and requiring exit 23. It explicitly installs and verifies ffmpeg. The portrait fixture now requires its upright Y4M feed, instead of silently falling back to Chromium's landscape test picture, and reports actual video/viewport dimensions on a layout timeout. Every existing layout assertion is retained. The strict hosted rerun is the acceptance gate; PR #414 records its exact final head and result. A local run of the stricter fixture was also launched. No product code or main publication changed during this correction.

## Remaining and next action

The complete candidate remains in PR #414 for owner review; keep main unchanged. Inspect the narrower contour at the
owner's preferred sticker size on a real iPhone, together with the original candidate's native Share/cancel, crop,
Enhance/Crayon/paper and Solitaire rotation checks. Physical Safari, actual Photos sharing and hardware performance
remain unverified. Publish only after an explicit owner instruction. #405 remains a separate development review.
