# Food-service and seating integration handover — 22 October 2026

## State

Draft review: [PR #356](https://github.com/nj22az/nj22az.github.io/pull/356). Combined implementation commit: `b446e39f662b4d004e6c76cb6067d77d22e84d45`. Hosted checks must be verified before merging; the test results below are the completed local runs.

Branch: `codex/food-seating-integration`, based on main `96a0f83583bb8f10c379f2640cd0216fd4294faa`.
PR #350 had already received the owner's visual approval and was merged as `16407e2822ce2379fb0661042d2c21ddd7334c8d`; its sign-off is on main. Do not repeat that work or treat it as still a draft. PR #351 remains open at `5364c8c4d1cfc33a4cd45c5ba69a4c2c13bc97cb`; its seating changes are incorporated into this integration branch. Both PR discussions were empty when inspected. Main was rechecked and had not moved.

This combined result is **for owner visual approval**. It has not been merged into main or published. Do not merge either this integration or the old seating branch without the owner's explicit approval of the combined pictures and a green hosted World guard. Physical iPhone/Safari, native Linux/Electron and Steam Deck acceptance are unperformed.

## Changes and resolution

- Preserved main's independent resident food/drink records, preparation and delivery rounds, food/prop clearances, partial-save restoration and the measured body-separation fix.
- Incorporated #351's measured front-edge data for chairs, stools, cushions and benches; multi-place indoor benches; clinic facing; resident/player/comic consumers of the data.
- The only shared source path, `src/people/izakaya-beer.js`, combined cleanly: food service is retained and seats gain their measured `front`. The other 12 overlapping paths are generated output or runtime references.
- Restored main's previous runtime generation as the build baseline and rebuilt from the combined sources. Did not select either PR's generated runtime as the final integration.
- Drinking regression fixture now passes each actual seat's `front` to the actor. The existing seven-seat tests therefore check the new posture and glass/wrist/lip contacts together.
- Photo tooling can capture the built runtime at desktop and phone dimensions, includes booth sitters and records cameras/conditions. Natural service captures include separate drink and meal placement plus a visible-HUD frame. Staged seating photographs use the actual game rooms, recipes and animator; they do not prove those residents' schedules bring them to those places.

## Verification

- Full repository guard: **336 tests, 60 files, all passed**, including z-fighting and interior geometry, seating/contact, independent food service, drinking and runtime packaging.
- Focused run: **68 passed**, covering food preparation/delivery/cancellation/partial saves/clearance, drinking with seat-front data, body collision, save safety/feedback, grip and the onsen chair.
- Web-edition run: **30 passed** (food service, body collision and resident-personalities suites).
- Rebuilt runtime package: **3 passed**. Build and source-only `git diff --check` passed. The complete staged diff reports the seating branch’s pre-existing whitespace inside embedded GLSL in `runtime/compact-shops-M6EJ8ghC.js`; generated shader text was not edited. Capture scripts parse successfully.
- [QA record, traces and evidence](../docs/qa/food-seating-integration/README.md). Software Chromium only. No native release or deployment claim.

## Next actions

1. Present the combined evidence for owner visual approval. Preserve this approval gate.
2. After approval, recheck main and PR #351's head; if either changed, reconcile again and rebuild from combined sources. Refresh affected checks and photographs.
3. With approval and a green hosted World guard, merge the combined integration; then reconcile #351 as already included rather than merging its obsolete runtime separately.
4. Physical-device confirmation and a new Linux release remain separate work.
