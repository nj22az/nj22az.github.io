# Sakura/izakaya room recovery and Nakamura retirement — 31 October 2026

## Owner request and state

Owner: “The game crashes in Sakura office too, find the issues. Izikaya and Sakura, remove the ice cream family now ... we need to build facilities before we populate them”.

Work branch: `codex/sakura-izakaya-resident-repair`, from production `8124d06ca0bd90606a737c3856c7a9da968fd15a`. Local merge `2f645b0` retains current Pocket Camera publication and brings in the existing combined room repair (`55ee0843`), preserving its work instead of rebuilding another independent interior. This includes startup/resource repair #413, CAD Rev 9/entry recovery #410, published artwork #409 and the owner's two-office-poster selection (KITANO 12 and UMINEKO Black). This task's new changes and verification are recorded below. Review [PR #415](https://github.com/nj22az/nj22az.github.io/pull/415), candidate `c7002c843934d1c8d5b83219486477b1ea3a0e3f`. Its tree `5246d70a528b881c8e38f80f259bf2bd4c204466` exactly equals locally tested `b520f593`; every uploaded blob and the complete tree were SHA-verified. Shell Git lacked write credentials, so the connected GitHub app published the same tree. This task’s new owner instruction is separate from the earlier combined candidate’s rejected upload. No automatic approval rejection occurred on this delivery. Main is not yet updated; hosted phone acceptance remains pending.

## Confirmed faults

- Main's released-canvas registry retained disposed room textures, backing canvases and painter closures. The existing startup repair unregisters them on disposal; its regression reproduces twelve retained entries before the fix and zero afterwards.
- Six concurrent full-character decodes and shader warm-up of hidden subtrees caused avoidable memory/compilation peaks. The integrated repair uses two concurrent jobs and compiles drawable subtrees, retaining the normal cartoon rendering and original models/textures.
- Entry lacked complete recovery around prerequisite loads and allowed another entry between loading phases. One lock now spans prerequisites and construction; rejected loads retain the current room and can be retried. A construction exception uses the ordinary street rollback and logs the original error.
- Sakura's stair transition ignored a false readiness result, discarded its loaded storey and announced arrival even after failure. Failed prerequisites now keep the original floor, return the player to its safe stair arrival and clear passage/input state for a retry. Successful swaps dispose the preceding room once.
- Sakura's cached poster/case atlases were disposed by office cleanup despite also belonging to the persistent shop. The shared textures now declare that ownership. The regression first reproduced three poster and one case disposal event; five office build/cleanup cycles now preserve the cached atlases while disposing room-owned resources.

- The extended native WebKit run then exposed a real five-geometry increase on each izakaya visit. Actual fitted-GLB/real-clearRoom probes confirmed five private edited-index wrappers escaped cleanup under a shared-model ancestor, plus six extracted door/bottle geometries. `liftPiece.dispose()` now restores the cached source, detaches borrowed attributes before releasing its private index, frees extracted geometry and guards late service callbacks. Three actual-room cycles release all eleven private geometries exactly once, with cached geometry/morph/index/material data untouched. Existing bar/backbar/lifetime checks pass 30/30.

These are reproduced code/resource faults. They do not establish the exact cause of an OS-level physical iPhone page closure; that reported failure remains distinct from the automated checks below.

## Facilities before residents

Exactly Emi Nakamura (`emi`, Mrs Nakamura) and Mai Nakamura (`mai`, Mai) retire from active cast, households, schedules, school presence, social choices and resident guides. Historical recipes/assets remain available for existing creative work. Their retained dessert/ice-cream premises are vacant, shuttered and unstaffed, and cannot take an order. Their former upstairs home is no longer an occupied address; the premises remain. The community-kitchen programme pauses while civic register/clinic facilities remain.

Save migration removes retired aliases and relationships, remaps the old home discovery, drops errands from or to either retiree, and retains surviving progress. Desktop life already recovers an absent controlled resident to Johansson; regression coverage checks the new retired aliases without replacing that implementation. No replacement resident or best friend is invented.

## Verification

The final runtime build passed (656 modules, 35 manifest entries), source SHA-256 `36477c6e752e8248d041589741b508a1b99a1e3e73e6caacee28601700adb360`. All 35 current production cache-entry files remain byte-identical. The full guard passed **559/559 across 108 files, zero skipped/TODO**, in 387 seconds (6 GB heap, two-file concurrency), and the exact same tree’s [hosted guard](https://github.com/nj22az/nj22az.github.io/actions/runs/41149922029) passed. The first diagnostic guard passed 550/551 before the obsolete occupied-Nakamura-home fixture was corrected for the owner’s retirement; its route/geometry assertions were retained.

The full-game CPU boot/interior smoke passed **1/1 in 157.9 seconds**: actual room builders, simulation and save code, substituted renderer. It is not a GPU claim. Room-recovery checks passed 19/19; facility batches 40/40; retirement/save/directory/recipe/guide checks pass. The World Library inventory rebuild passes 3/3 and removes retired live choices. The guide/catalogue checks pass 8/8. No portraits were rerendered: `--catalogue-only` first reconstructs the previous recorded input hash using the old catalogue and current visual sources; it refuses changed visual sources/new names/changed image paths, retains the prior render hash/count and records `rendered: 0` for the 23 retained portraits. All original image bytes remain.

Hosted WebKit first entered the actual izakaya with full ink/grade/HDR/four samples and no uncaught page errors. It then failed trying to tap the intentionally hidden exit button away from the door, while rendering continued. [Original artifact](https://github.com/nj22az/nj22az.github.io/actions/runs/41149922029/artifacts/13021869779), report `docs/qa/room-crash-family-2026-10-31/iphone-first-report.json`. The actual izakaya capture was opened and inspected. The fixture follow-up approaches the authored door before tapping the real control; all error/graphics assertions remain. This failed fixture run is not claimed as browser acceptance.

Full evidence: `docs/qa/room-crash-family-2026-10-31/verification.json`, `guard.txt`, `guard-first.txt`, `cpu-boot.txt`, `resident-guide.txt` and `build.txt`. The browser fixture extends the existing iPhone-profile WebKit/Mesa acceptance with repeated office/izakaya entries and bounded post-warm-up texture/geometry/canvas counts, all prior graphics/error assertions retained. Extending a fixture is not a passed browser run. Physical iPhone/iPad/Steam Deck acceptance remains unverified. No new Linux release, Studio sync or paid asset generation.

## Final bar-lifetime follow-up

The third hosted run ([41151434104](https://github.com/nj22az/nj22az.github.io/actions/runs/41151434104), artifact 13023137637) successfully rendered both actual rooms and both selected office prints, with no page errors/failed requests. Office and close-up print captures were opened and inspected. Resource tracing found the private bar geometry retention above. Its stale per-venue baseline was also corrected to a common exterior baseline after the whole warm-up; all three measured pairs are now collected before the unchanged zero-growth assertions. Transient doorway traffic can clear for up to ten seconds under unchanged collision/site checks; permanent blockage still fails with full diagnostics.

The preceding 559-check/source-hash/CPU results describe the candidate before this bar-lifetime correction. Final rebuilt-source guard, CPU smoke and native repeat results are pending; `guard-before-bar-fix.txt` and `cpu-boot-before-bar-fix.txt` preserve the preceding evidence.

## Next

Complete the corrected hosted WebKit fixture, inspect actual office/room captures and resource counts, then deliver the owner-authorised game repair. Preserve unrelated main work and record the exact merge/deployment/public-byte result. No new Linux release or generation.

