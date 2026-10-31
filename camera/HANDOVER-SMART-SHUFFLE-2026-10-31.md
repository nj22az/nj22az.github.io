# Pocket Camera photo-aware Surprise — 31 October 2026

## Implemented, review only

The owner wants any uploaded photo to guide combinations of Looks and settings, with later dice clicks exploring
variations suited to that image. [Draft PR #419](https://github.com/nj22az/nj22az.github.io/pull/419), branch
`codex/pocket-camera-smart-shuffle`, implements this. **Not merged, published or auto-merged.** Published Camera remains
`20261031audit2` from #418. Review key: `20261031smart1`.

Base main: **`baf0da1a0745bad6238811bdfae26c4df4aebe67`**. Initial implementation **`e0dec365629a2ccf681e9006b7c492c27b2e1d96`**;
current refined and tested source **`b795c7a02a721ff538b435e9aacd6126b3a868a8`**. Newer main `fee38241fcd3198522298137e6de1b9299b6a955` includes concurrent World touch/publication
updates; Camera and its adapter are unchanged from the base. Its current root handover is preserved in this follow-up. The World engine-room/arrival work and existing local changes are preserved. This note and
its QA records are a documentation follow-up to the tested runtime; check the current PR head before further work.

## Behaviour and limits

In the photo editor, the dice measures the original cropped photo, renders up to sixteen candidate mixes through the
actual Camera engine, and ranks spatial structure, usable tone, clipping, detail and colour. It tunes Look strengths,
six adjustments and Enhance. Later clicks include refinements of the preceding match and favour another strong family
when available. The live camera retains its twenty curated random mixes. VHS/TV/miniature suggestions have bounded
strength to protect the photograph's detail; their manually chosen full strengths remain available.

This is a bounded quality heuristic, not a learned aesthetic model or a guarantee that every click is subjectively more
beautiful. Gentle mixes can win over stylised effects when they preserve the image better. Every search starts from the
original source, never the previous rendered result. Crop, frame, paper, stamp and stickers remain. Undo Surprise restores
the preceding Looks/tonal settings while retaining later crop/frame edits. Manual edits, replacement photos, backgrounding
and Save cancel stale work. Busy state stays on the dice; no status covers the canvas.

Sampling is at most 128 pixels per side; temporary GPU targets are released without resizing the visible canvas. Search
has an approximately 1.8-second cooperative budget; cold compilation may require another click. Five fixtures each tested
14 candidates in **440–605 ms on CI**, not a physical-device speed claim. All processing stays in the browser. No runtime
dependency, external service, model, hardware capture, native Share, AR or new MCP tool is added. The adapter renderer
import and new module are aligned at `20261031smart1` with one URL per module.

## Actual verification

Source **`b795c7a0`**, Camera [run 41206756507](https://github.com/nj22az/nj22az.github.io/actions/runs/41206756507):

- Smart photo suite, job **124553604278**: **14/14 pass**. Real portrait, café, garden and generated dark/bright patterns;
  repeat search, source identity, retained crop/overlays, Undo including later crop/frame edits, cancellation on manual
  edit/replacement/background/Save, immutable JPEG save-copy, bounded GPU sample resources, no upload/external browser
  service, phone/tablet/small/200% text controls and no uncaught errors.
- UI, job **124553604287**: **82/82 pass**. Design/shader audit, job **124553604087**: **50/50 pass**.
- Existing Camera regression, job **124553604355**: **143/143 pass** (56 + 33 + 22 + 14 + 5 + 9 + 4).
  Total Camera/UI/audit/Smart: **289/289 browser checks**, no skips.
- All local Camera units, 17-module URL consistency, syntax and diff checks pass, including **7/7 new quality-policy checks**.
- MCP [run 41206756330](https://github.com/nj22az/nj22az.github.io/actions/runs/41206756330), job **124553287604**:
  **15/15 units + 20/20 actual MCP-to-Camera checks pass**, fresh install **zero npm vulnerabilities**. Local JSON npm
  audit independently reports zero. Eleven tools discovered; generated-image import/edit/preview/save/export proved.

[Retained evidence and images](qa/2026-10-31-smart-surprise/README.md), [exact results/digests](qa/2026-10-31-smart-surprise/evidence.json)
and [runtime hashes](qa/2026-10-31-smart-surprise/runtime-sha256.json). Full Smart artifact **13044900413** and MCP
artifact **13043559795** were downloaded, SHA-256/ZIP CRC/path validated and retained. All Camera/UI/audit regression
archives are also retained, with IDs, hashes and delivery links in the QA records. Actual before/after renders,
phone/iPad mini controls, small/200% text screens, photo saved JPEG and generated-image MCP previews/export were inspected.
Portrait: Vladislav Anchuk / Pexels 29747506, existing test-bench source, with source digest recorded. The initial
`e0dec365` fixture evidence is superseded: its placeholder profile file failed to decode; the corrected suite requires
source-File identity after import and uses a real portrait. No failed import is counted as a new photo.

## Independent failures and remaining verification

Linux **41206756376**, job **124553287888**, fails two **unchanged World tests**: controller smoke still expects landing
x=-1.5 while main now starts at x=0.3; housing consolidation counts the moving ferry's paint/metal on post-office-lot.
Both reproduce on pristine base main `baf0da1a`: **11/13 pass, 2 fail**, [retained full log](qa/2026-10-31-smart-surprise/unchanged-main-world.log).
Only the adapter cache key changes under johansson-town; no World runtime, shader, test or assertion is altered. No
blind retries or weakened assertions. World **41206756327** passes **569/569 guard**, job **124553593640**, and automated
WebKit/iPhone-profile startup, job **124553593418**; this is not a physical Camera/Safari test.

Physical iPhone 17/iPad mini Safari, hardware camera and native Share remain untested. SDK acceptance client connects;
the owner's installed MCP host and this chat remain **unconnected**. To connect locally, pull the chosen source, install
pinned dependencies/Chromium, register/reconnect the absolute server path in [MCP.md](MCP.md), then prove tool discovery
and the generated-image cycle in that host. Session album is temporary; export before close. Preview shares pixels with
the host. Approved imports, copy-save and explicit save/export/close confirmation remain. No live Safari/Photos access.

## Next action

Review the photo comparisons and try the feature on physical devices. The final documentation/evidence commit
changes no tested runtime; automatic checks on that newer head may still be running. Resolve the independent World
checks in their own work. Before any
merge, fetch current main/PR comments/checks and preserve concurrent handovers; merge/publish only on the owner's next
explicit instruction. No new Linux release or AR implementation is part of this change.
