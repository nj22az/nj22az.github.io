# Ramen counter acceptance — 1 October 2026

## Baseline

Validated commit `d0049f63a49d0f63048ffb214899c1cb175f19be` in an isolated checkout. Its ramen service and published-runtime packaging tests passed (5 checks). The compiled game does drive the service: a real Chromium order progresses from Mrs Sato's preparation message to delivery. GitHub's combined status endpoint returned an empty status list.

Two additional failures were demonstrated:

* Seating drops `seat.table` while copying the seat into `parkSeat`. The full-game regression fails with `undefined` instead of the counter delivery coordinates. The bowl consequently uses the fallback position; in the desktop view it is clipped by the lower screen edge.
* On Chromium touch input, the action button opens the meal menu on pointer-down. The same gesture's click is retargeted to the new backdrop, closing it immediately; on the next menu it can activate a newly displayed button. A captured pointer/mutation trace demonstrates both cases.

## Repair

Preserve a copy of the seat's table coordinates. In the activity dialog, require pointer-generated clicks to start within the already-open dialog; keyboard activation remains valid. The guard covers the whole dialog so the opening gesture cannot activate its buttons or backdrop. It resets whenever a new dialog is presented.

The repair is based on main `59810ac73f362d80bfbf17dd1d7e706db1829bd4`, which follows the requested commit with the shop purchasing improvements. Before applying the two fixes, the reconstructed runtime source hash matches that main commit's recorded `7dc0022a94a9e5bebeb4df60aec94542655cfdf251907fb152c30afd538f6b70` exactly. No shop, schedule, save, onsen or rendering changes are included in the repair.

## Acceptance

Chromium 153, real compiled boot/game graph, fresh browser and save for each viewport:

| Check | 1280 × 800 | 390 × 844 |
|---|---|---|
| Mrs Sato accepts the order | Pass | Pass, touchscreen action |
| No bowl/payment during preparation | Pass | Pass |
| Delivery shows a bowl on the counter | Pass | Pass |
| ¥450 charged once, at delivery | Pass | Pass |
| Eating removes the bowl once | Pass | Pass |
| Standing cancels a pending order | Pass | Pass |
| Exiting cancels a pending order | Pass | Pass |
| Zero-yen order refused without delivery | Pass | Pass |
| Re-entry, reseating and navigation | Pass | Pass, touch-stick movement |
| JavaScript exceptions | None | None |

The full-game CPU regression advances the actual fixed simulation: still preparing at four seconds, delivered after five seconds; repeated updates do not charge again, and eating cannot repeat. Forty-one focused checks covering ramen, runtime packaging, onsen, resident services and the current shop changes passed. Runtime packaging was checked again after the final rebuild.

This runner uses SwiftShader software rendering. Delivery wall time varied from about 7.6 to 14.7 seconds on the phone viewport and about 42 seconds on desktop; these figures are **not hardware performance measurements**. A smaller drawing buffer was used for some behavioural runs, with the device ratio restored for screenshots; the final phone regression also passed at the normal drawing ratio. No new meshes, materials, textures or per-frame allocations are introduced. Physical-device FPS and normal-GPU wall-clock timing remain unverified.

## Reproduction

Serve the repository root with `python -m http.server 8765`, then run:

```
node --test johansson-town/tests/ramen-game.test.mjs johansson-town/tests/ramen-player.test.mjs johansson-town/tests/sato-ramen.test.mjs johansson-town/tests/runtime-package.test.mjs
node johansson-town/tests/ramen-counter.browser.mjs
```

The browser regression uses Playwright. `CHROME_EXECUTABLE` selects an installed Chromium binary, `TOWN_CHROMIUM_ARGS` accepts its launch arguments as JSON, and `TOWN_REVIEW_OUTPUT` selects the screenshot directory. `TOWN_REVIEW_WIDTHS` can select one viewport. Each viewport launches a separate browser, including when using a single-process serverless Chromium binary. Test fixtures use existing audit hooks only to enter/re-enter, position the player and set yen; ordering/eating/standing use the actual menu controls, while navigation uses keyboard or real CDP touch input.
