# Stockroom night acceptance — 1 October 2026

Baseline: `ca049ba6c9c474c04a90814ba6b61d7172c58091`.
GitHub main still matched this SHA during validation. Its combined status API returned an empty statuses array. The live Pages HTML selected the same boot/game/storage files; the live storage bundle's SHA-256 was `9f4ba9fdb81ce5b845ed3e15d6f6b9e68dcb861f97237f9f700e84716fb06945`, exactly matching the baseline file.

## Demonstrated failures and repairs

1. Theft only skipped replenishment: a full tea shelf remained at 12, and stock totals did not decrease. The repaired transfer removes one carton (up to the product's shelf capacity), records its actual units, keeps the missing product sold out, and prevents automatic jobs from replenishing it until recovery. Remaining units are retained in reserve. A recovered carton restores only its own recorded units, once.
2. Reloading or leaving the stockroom recreated its random layout and forgot time, visitors, collected/lost cartons and coins. A checkpoint now retains the same shift per local player and closing trading day. It saves once per second and at pause/page exit/completion. After-midnight visits use the same closing trading day.
3. The unchanged baseline hand-off paid the same day twice: ¥1,000 became ¥1,100 rather than ¥1,050 (see `original-reward-failure.json`). A saved reward-day marker prevents result replay, including after reload. Coins are limited to ¥50 per shooed visitor. Another local player's pending hand-off is left intact, and failed storage removal cannot issue a reward.

## Verification

- 33 focused town Node checks passed: storage outcomes/replay/recovery/player isolation, existing Sakura purchasing and scheduled restocking, cave geometry/interaction, and runtime packaging.
- All 9 stockroom checks passed, including 300 generated layouts, rack collision/sliding, keyboard/touch/focus handling, real Thuan skin animation, auto-restock, intruder routes, and persistence after rebuilding the scene.
- Chromium WebGL at 1440×1000 and 390×844 ran the built runtime selected by each HTML page. Browser transport served the exact repository files at a test origin; external requests were blocked. The storage bundle received test-only access to its existing fixed-step simulation and player position. Thief decisions, collisions, collection, hand-off, rewards, Three.js scenes and cave interactions were not replaced.
- `acceptance.json`: spawning, collision bop, shoo, one reward, theft, reload, leaving/re-entering mid-event, actual return to town, sold-out shelves, actual cave chest/rope exit/reload, Photo Studio and warehouse. No page errors at either size.
- `carrying-acceptance.json`: actual keyboard press / mobile screen tap while a thief carries a carton; approach and collect its dropped carton once; another press cannot pay again; reload preserves the drop and coins; a new night's checkpoint starts separately.
- `cycle-acceptance.json`: actual TIME menu → 22:00 → auto stockroom → return → 06:00 next day → 22:00 → another auto stockroom → return. Each night paid once; a pre-existing missing tea carton stayed sold out and kept its unit count. No page errors at either size.

Run the numerical checks from the repository root:

```sh
node --test johansson-town/tests/storage-restock.test.mjs johansson-town/tests/storage-theft.test.mjs johansson-town/tests/dungeon.test.mjs johansson-town/tests/shop-cycle.test.mjs johansson-town/tests/sakura-business.test.mjs johansson-town/tests/runtime-package.test.mjs
node --test thuans-storage/tests/playability.test.mjs thuans-storage/tests/night-resume.test.mjs
```

The browser scripts use the installed primary-runtime Playwright dependency. `STORAGE_CHROME` selects an executable; this environment required `/tmp/chromium`, because its newer headless shell closed with socket-permission errors.

```sh
STORAGE_CHROME=/tmp/chromium node johansson-town/tests/storage-night.browser.mjs
STORAGE_CHROME=/tmp/chromium node johansson-town/tests/storage-carrying.browser.mjs
STORAGE_CHROME=/tmp/chromium node johansson-town/tests/storage-cycle.browser.mjs
```

Browser screenshots and JSON records are alongside this file. Both runtimes were rebuilt, and the town source fingerprint/manifest/style hashes passed. The previously deployed town and storage bundles remain available for cached-page transitions.

## Limits

The corrected built runtime was tested locally; it has not been deployed to Pages. The tests accelerate the real fixed-step stockroom simulation and position the player for specific interactions. They do not establish an uninterrupted physical walk-through or hardware gamepad acceptance. Phone viewport/touch and WebGL functionality passed under software rendering; physical iPhone/iPad frame rates, WebKit and device GPU performance were not measured. No geometry, model, schedule, Photo Studio or warehouse implementation was changed.

## Main advanced during final publication

After this validation, main advanced by one commit to `302d97b36af05d8333ccc250334a159b5d4ae821` ("Thuan's Storage: one Bizarro boss a night, behaving like its suit"). It deliberately replaces the multiple carton thieves with a single boss, removes stolen-carton records and chest recovery, and changes the hand-off and rewards. There is substantive overlap in both games, stock/economy, UI and runtime packaging. PR #131 retains the tested repairs against the requested `ca049ba` as a draft; it has not been merged or deployed. Integrating the tested thief/carton behavior into the new boss design requires a gameplay decision. The results above apply to the requested baseline and its repaired runtime, not to acceptance of the new boss commit.
