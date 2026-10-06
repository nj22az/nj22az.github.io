# Umi-no-yu acceptance and period detail

Base main: `dfe99ddc224ddb16d0c6627a853989f9bca04c46`. Date: 6 October 2026.
Runtime under review: source SHA-256 `8ad7e2f2e8ca90f3c8d302070bf47ad7298cb4fe7875951cd0577a8926f64838`, boot `boot-u19loFB6.js`, game `game-CE2faKn6.js`.

The original main was checked first; `baseline/phone-entry.png` is its untouched bath entrance. This change repairs demonstrated behaviour and adds researched period detail, so the acceptance below applies to the rebuilt candidate based on that exact main, not to an unchanged-main clean bill of health.

## Repairs

- Paid admission was serialized but never loaded. Same-day admission now survives reload; yesterday's fee and malformed save values do not grant admission.
- At 390×844, a touch opened payment/locker dialogs on pointer-down, then Chrome retargeted the release click to the newly focused Close control. Consume clicks whose gesture began outside the dialog. Deliberate later dialog/backdrop taps and keyboard activation still work.
- The board notice stood in front of reset anchors and won distance/facing selection. Visible tripped levers now take priority. Normal inspection remains available with all breakers on.
- Move the rental-towel shelf clear of the bandai service aisle and align the payment interaction with its tray.
- Dispose owned bump/roughness textures on room teardown as well as colour maps.

## Browser method

Real Chromium 149 headless shell and Playwright, private loopback serving the committed runtime, isolated storage, service workers blocked, software WebGL/SwiftShader. Desktop 1280×800 and touch 390×844. The normal game clock is frozen between controlled 60 Hz simulation steps. Walking uses real movement input and collisions; desktop interactions use E, phone interactions tap the visible action button. Entry/exit use the normal threshold controls.

Fixtures place the player outside the venue, invite Thuan and place her at the exterior door, select the existing teen recipe for the player, and trip a circuit. The resident's entry, indoor route, seating and departure use the actual resident simulation. Close-up screenshots use an inspection camera and reveal the player body for geometry inspection; the ordinary first-person camera normally hides the body at close range. These close-ups are not proposed gameplay camera positions.

`tools/mcp/onsen-acceptance.mjs` reproduces the sequence. Set `TOWN_CHROME` to the installed Chromium executable and run from `johansson-town`:

```
node tools/mcp/onsen-acceptance.mjs desktop accepted
node tools/mcp/onsen-acceptance.mjs phone accepted
```

Run these sequentially on a software renderer. A concurrent desktop attempt ended before completion; a phone attempt used an insufficient 10-second reload wait. The successful reruns use a 240-second boot/reload wait. Neither harness failure is counted as a game pass.

## Results

Desktop completed the player entry → payment → change → walk → bench → washing stool → indoor soak → rock soak → dress → street exit sequence. One wrap and its outline were visible, with regular outfit meshes hidden until dressing. No obvious cloth/body or seat penetration was visible in the inspected poses. All exercised fixture routes reached their destinations. Thuan walked from the entrance, soaked, departed and returned to her street routine. The existing teen recipe selected swimwear. The tripped socket circuit reset through normal interaction. Reload retained admission day `20732` and normal clothes.

Phone completed the same sequence using touch on the visible action button, including the repaired payment/locker dialogs and breaker reset. The teen recipe also soaked in the rock bath in swimwear. Thuan entered, walked, soaked and left. Reload retained admission day `20732` and normal clothes. Both `checks.json` files report `completed: true`.

| Evidence | Desktop | 390×844 |
| --- | --- | --- |
| Player bench | [frame](accepted/desktop/wrap-bench.jpg) | [frame](accepted/phone/wrap-bench.jpg) |
| Indoor soak / mural / tiles | [frame](accepted/desktop/wrap-indoor.jpg) | [frame](accepted/phone/wrap-indoor.jpg) |
| Resident wrap in rock bath | [frame](accepted/desktop/resident-entry-2.jpg) | [frame](accepted/phone/resident-entry-2.jpg) |
| Younger swimwear soak | — | [frame](accepted/phone/younger-soak.jpg) |
| Checks and resource errors | [JSON](accepted/desktop/checks.json) | [JSON](accepted/phone/checks.json) |

No page exceptions or WebGL errors were recorded in the completed viewport runs. External Google Fonts requests failed in this environment, producing resource console errors; Japanese was inspected with installed Noto CJK fallback fonts. A cancelled optional Thuan figurine request was also recorded in the desktop run. These are disclosed in `checks.json`, and the console is not claimed entirely clean. This is focused acceptance, not a performance benchmark or exhaustive all-resident soak.

## Regression coverage

The full suite passed 896 tests, with 5 existing skips (901 total). After the final touch refinement, all 29 focused activity, English-language and onsen tests passed. Coverage includes payment reload/expiry/malformed saves, the retargeted touch release, breaker interaction priority, constant physical tile spacing, open basket geometry/shelf contact and clear fixture/seat approaches. Existing outfit, towel separation, placement, lighting and resident transition coverage also passed in the full suite.

See [period-references.md](period-references.md) for primary references, historical limits and the authored graphics changes. No photographs or third-party artwork were copied into the game.
