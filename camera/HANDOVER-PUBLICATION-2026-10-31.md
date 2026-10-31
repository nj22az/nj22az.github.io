# Pocket Camera publication — 31 October 2026

## Current release: complete offline Camera and Smart Surprise — #420

The owner requested publication, direct MCP connection and offline use. Smart Surprise **#419** merged as **e0e749cc**;
complete offline **#420** is now **merged and deployed**, main **a1125c62e38e9dcb507f6bd73dce1003cad1cee6**, identical tree
to source **ef4962533e9274051d2ac6670ecf7ceb324ba2cd**. Keys, including the adapter, align at **20261031offline1**.

**302/302 browser checks** include 13 genuine offline checks, all 316 cached assets and two cold browser restarts.
MCP **15/15 units + 20/20 acceptance**, World **569/569** and automated WebKit pass; audit zero. Linux retains two unchanged
World fixture failures. Pages **41229423812** passed; [324/324 public requests match](qa/2026-10-31-offline/publication.json).
[Current handover](HANDOVER-OFFLINE-2026-10-31.md) and [actual screenshots/evidence](qa/2026-10-31-offline/README.md) record
exact commits, jobs, archive digests and remaining physical Safari/connection limits. Plugin Creator is installed; the
SDK acceptance client connects, while this chat and the owner's Camera host remain unconnected. No hosted MCP server.

Open online once and wait for the Settings download icon to become a checkmark; keep browser site data for offline use.
The following entries preserve previous release history and are superseded by the current release above.

## Icon UI — published via PR #417

The owner approved **“Push to main this looks good”**, then asked for fewer words, icon-coded shaders and status
beside the canvas. [PR #417](https://github.com/nj22az/nj22az.github.io/pull/417) is merged as
**`51f071309f6b9e1dbd6977595004c6c60602a0ee`**, with the exact tree of tested
**`dd5997a775736f5990044ea9b2a210fc47a68211`**. The real existing Camera now uses icon controls with one active
label, a reserved shader/comparison rail, adaptive phone/tablet layouts and immutable Save copy. The renderer,
34 Looks/three-layer mixes, originals, crop, Enhance, stickers, paper, games and direct-tap Share remain.
Page/app/main-style/renderer URL keys and local adapter import are **`20261031ui1`**; sticker keys remain unchanged.

**143/143 Camera + 57/57 UI checks**, **15/15 MCP units + 20/20 real acceptance**, **560/560 World guard** and
automated World WebKit passed; npm audit reports **zero findings**. Actual screenshots and JPEG were inspected.
[Pages 41184647837](https://github.com/nj22az/nj22az.github.io/actions/runs/41184647837) passed; **44/44** checked
public addresses match the tested runtime. [Open the updated Camera](https://nj22az.github.io/camera/?v=20261031ui1).

[Current UI handover](HANDOVER-UI-REVIEW-2026-10-31.md) records exact jobs, artifacts, limits and next actions;
[publication evidence](qa/2026-10-31-ui/publication.json) retains hashes. Physical iPhone 17/iPad mini Safari/native
Share and the owner's installed MCP host remain unverified. Linux full World acceptance is still running after
its build/controller/native/offline stages passed. No Linux release or hosted MCP service was published.
The following sections preserve earlier release history; this UI supersedes their previous control layout and keys.

## Local MCP adapter source — merged on 31 October 2026

The owner's subsequent request, “Mcp wire the Johansson camera web app”, is implemented in
[PR #416](https://github.com/nj22az/nj22az.github.io/pull/416), squash-merged to main as
**`ffc02e29ff14a632cf05ae99f691b009af09f7c2`** on the owner's subsequent **“Merge”** instruction.
Read [the MCP handover](HANDOVER-MCP-2026-10-31.md) and [connection instructions](MCP.md) for the local stdio adapter,
its eleven tools and **15/15 unit + 20/20 real MCP/Camera acceptance checks**, clean npm audit, and current Linux retry.
The existing **143/143** Camera browser checks and World guard/native WebKit also passed on the merged candidate.
The adapter source is available on main; it still requires a local stdio-capable host and does not create a public
HTTP MCP service or connect the owner's device. It does not replace or alter the published Camera runtime below.
The temporary MCP album is not the user's iPhone or personal-browser album.

The merge's [Pages build/deploy/report jobs passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41173645390).
The [merge verification](qa/2026-10-31-mcp-review/publication-files.json) confirms **13/13** checked public files match
the merged bytes. A local MCP
client connection remains a separate setup step; the Linux rerun and physical-device limits remain in the handover.

## Published on the owner's instruction

The owner explicitly instructed **“Push to main”**, superseding the earlier review-only hold.
[PR #414](https://github.com/nj22az/nj22az.github.io/pull/414) was squash-merged into `main` at
**`cf86ea2a1e156155185f681007d870fca2161c44`**, on 30 October at 23:24 UTC (31 October in Finland).
The live application is **[Pocket Camera](https://nj22az.github.io/camera/)**.

The merged tree **`cbc483518d099d702d69dd6eebafbaf5b4d4f8ba`** is identical to the tested candidate
**`8330efe550c3400405047cf7ffb0cffd12e5f482`** on `codex/pocket-camera-integration-rc`.
There were no runtime edits during publication. Subsequent main work is preserved; the independent Sakura/item-viewer
merge `c432fe1cbe9472263c0c07878ab7b1930c58cd36` does not change the camera files.

## Delivered behaviour

- #411's album Save/capture, original-tap native Share, phone Solitaire sizing, wax Crayon and optional paper.
- #412's adjustable conventional on-device WebGL Enhance; no DLSS application, model or server dependency.
- Both recipe fields retained, with Enhance before Looks and paper once afterwards, before overlays.
- #408's published crop, retained source, Erase flow and JPEG compression preserved.
- All **116 supplied stickers and 116 thumbnails** have thin silhouette contours. New custom stickers use the same
  **0.45%** rim. Canvas dimensions, figure positions, IDs and recipe coordinates are retained.
- Coherent release keys: app/renderer/style **`20261031rc2`**, sticker catalogue/assets/cutout **`20261031-contour1`**.

#405 remains a separate development review; its extra Looks, person segmentation and renderer dependencies were not
published. There are **34 Looks** in this release. See the [integration dependency review](HANDOVER-INTEGRATION-2026-10-30.md#pr-405-dependency-review).

## Verified release

[Strict CI run 41140070128](https://github.com/nj22az/nj22az.github.io/actions/runs/41140070128) passed on the exact
candidate above: **143/143 browser checks**, plus unit/module/syntax checks. Full logs confirm camera **56**, crop
**33**, Enhance **22**, Save/Share/Solitaire **14**, paper **5**, integration **9**, sticker contours **4**.
The final gate uses `set -euo pipefail`, explicitly installs/verifies ffmpeg and requires the portrait Y4M fixture.
Earlier green wrapper statuses that masked a camera failure remain rejected as full acceptance.

The integration suite includes **816 rendering combinations**, **408 preview/export matches**, **68 prior-engine
comparisons**, eight mixed-thumbnail checks and independently rendered JPEG/recipe/Share-byte checks.
[Actual photographic comparisons and phone screenshots](qa/2026-10-30-integration/README.md) and
[all-pose contour comparisons](qa/2026-10-31-contours/README.md) are retained.

[GitHub Pages run 41144262613](https://github.com/nj22az/nj22az.github.io/actions/runs/41144262613) **completed successfully**
for publication commit `cf86ea2a`. The canonical HTTPS camera page returns **200** with the new release key.
**244/244 public files matched SHA-256 and byte length** at 2026-10-30T23:30:09.243635+00:00: the canonical page, all changed root camera JS/CSS, sticker catalogue, all 232 sticker images/thumbnails, and unchanged crop/Erase modules. Requests used the actual module/asset cache keys over standard HTTPS; every response returned 200. [Per-file evidence](qa/2026-10-31-contours/publication-files.json). This verifies deployed bytes; it is not an additional physical-device or live-origin visual test.

## Remaining limits and next action

Automated rendering and phone-size checks use **Chromium/SwiftShader emulation**, not physical Safari.
Native Share is mocked in tests. Physical iPhone/iPad Safari, actual Photos sharing/cancellation, camera permission,
Home Screen behaviour, native 12 MP/wide-gamut processing, hardware performance and real WebGL restoration remain
unverified. Test those on a physical device; retain the distinction in subsequent reports.

Previously flattened photos and old custom-sticker blobs retain their original appearance. Reimport the original
image to give an old custom sticker the narrower contour. Existing artistic Look limitations are recorded in the
[integration handover](HANDOVER-INTEGRATION-2026-10-30.md); no further incompatible development was imported.

Publication is complete. Do not merge #405 or the superseded source branches as a follow-up without a separate review.
