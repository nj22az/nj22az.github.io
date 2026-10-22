# Linux controller handover — 22 October 2026

## First task for the next agent

The owner reported: **“The right joystick should control camera now it doesn’t on either Bluetooth or steam deck.”**

That report preceded a concurrent controller repair and the publication of **Linux 0.2.16**. First confirm the installed version and test 0.2.16 on both the built-in Steam Deck controls and the Bluetooth controller. Real-device confirmation is still missing. Do not claim a hardware fix from simulated-controller tests, and do not duplicate the already-merged #340.

Read `AGENTS.md`, `CLAUDE.md`, `johansson-town/AGENTS.md` and directory instructions. Preserve the approved world, visuals, crew, saves and controls; keep unrelated backdrop/character work separate. No repository split.

## Current main and release state

- [PR #345](https://github.com/nj22az/nj22az.github.io/pull/345) merged the released Linux edition with main through `9b578fa`, preserving the approved #342 bench/clothing work and main's newer bar service/hand work. Merge: `32f6994d95320d1cfdf291ec8a951dc3927f89fe`.
- [PR #193](https://github.com/nj22az/nj22az.github.io/pull/193) then brought the published 0.2.16 controller repair into main. Merge: `f72413df9daba9b776be25382f80e58b8e57b480`. Its remaining delta was exactly ten `steam-deck/` files; the tested World source/runtime was unchanged.
- [PR #340](https://github.com/nj22az/nj22az.github.io/pull/340) is **MERGED**, not open. Its final tested source was `33cfc3c0ccf247ed07a26c93c6cf8cf9680ef91a`; the Linux merge/release commit is `8a04557518d7a2f15e3e1940f1faf8d2ba75ac5a`. Their trees are identical.
- [Linux 0.2.16](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.16) is already published. Full acceptance [39726497285](https://github.com/nj22az/nj22az.github.io/actions/runs/39726497285) and release/public installer verification [39728457286](https://github.com/nj22az/nj22az.github.io/actions/runs/39728457286) passed. Do not overwrite its tag/assets. A further shipped correction needs the next unpublished version, at least 0.2.17; inspect latest releases first.
- Linux 0.2.15 remains the historical ferry release at `1071a388`: #333 approved the ferry, #338 integrated it into Linux, #343 repaired night-start acceptance setup. Its evidence is `linux-port/acceptance-0.2.15.md`. Do not revive closed duplicate #335.
- Another agent handled the 0.2.16 release. Inspect current public guides/installer and open follow-ups before editing them; do not duplicate or overwrite concurrent release-documentation work. The earlier ferry-release follow-up was completed and disabled. No new controller follow-up was scheduled here.

## What #340 changes

`steam-deck/ui/pad-layout.mjs` normalises unmapped Linux driver layouts (xpad/xpadneo, hid-playstation, hid-nintendo, hid-generic). Triggers and D-pad hats become standard buttons, preventing resting trigger axes being treated as the camera.

`controller.mjs` permits a pad being pressed to take over from an idle virtual pad. An explicitly saved controller choice still wins. `console-ui.mjs` distinguishes switching connected pads from losing one and displays the driver-layout status.

The original #340 run failed in the **native festival fixture**, not its browser/controller checks: it started indoors after a sleeping cabin start. #343 subsequently fixed that fixture. The final 0.2.16 acceptance/release succeeded. Old PR text saying “ship in 0.2.14” is stale.

## Reproduce and diagnose any remaining fault

1. Record version and launch route: Steam Gaming Mode, Steam Desktop Mode or direct executable. Capture every connected Gamepad's ID, index, `mapping`, button count and raw axes at rest and while moving each stick independently. Include virtual pads. The actual Bluetooth model/layout has not been captured.
2. Inspect saved Controls & camera settings: selected controller, look/move axes, swapped sticks, dead zone, sensitivity and invert Y. Compare a fresh profile with the retained old one while preserving saves/bindings. Check whether Steam Input emits joystick axes or mouse motion.
3. Follow `steam-deck/ui/controller.mjs` and `pad-layout.mjs` → `console-ui.mjs`/`window.johanssonDesktopInput` → `johansson-town/src/input/analogue.js` and `src/game.js`. Compare raw axes, normalised `frame.look`, active device and actual yaw/pitch. Inspect focus, menu/reconnect suppression and camera mode.
4. Review assumptions, without treating them as proven causes: the first sampled axes may not be resting; button counts may not identify a driver; axis-only movement may need device takeover; retained raw-axis settings may interact with newly normalised axes; an explicit controller selection can retain an idle device.
5. Capture the real failing device as a regression fixture. Retain standard/unmapped pads, late connection, two-pad behaviour, held-button suppression, remaps/reconnect, movement, menu controls and near-door B exit.
6. Verify yaw and pitch with each real device while standing/walking, indoors/outdoors, after pause, reconnect and restart. State hardware limits honestly if no device is available.

## Validation and integration safeguards

The combined World/runtime in #345 passed [World guard 39727702564](https://github.com/nj22az/nj22az.github.io/actions/runs/39727702564): **311 tests across 59 files**. [Linux run 39727702559](https://github.com/nj22az/nj22az.github.io/actions/runs/39727702559) passed four layouts, all 26 residents, owned beds/waking/doorway B, conversations/quarrel pause, save/controller reload, web isolation, zero page errors/missing files, actual native startup/festival stages and disk saves.

The 0.2.16 repair separately passed its full release-tree acceptance. All **38 desktop tests** also passed locally on the proposed main + 0.2.16 combination. This native-only merge did not change the World/runtime tested in #345. Do not describe these software results as physical Steam Deck acceptance.

Main retains both `seatFront` and native `sleeping` in the game/actor updates, native bed-restricted exit plus ferry departure context, and desktop pause/festival handling. The combined runtime entry is `boot-CLW2OJgY.js`. Never copy either parent's whole index/runtime over a source combination; rebuild last.

Keep the approved timetable, T−2 horn/sign/choices, safe gangway closure, walking onboard travel and destination exit, passenger/vehicle save migration, Mac's relief watch, full Linux crew simulation and separate request-only quick crossing intact.

## Commands and next release

```sh
npm ci --prefix steam-deck
npm run build:runtime --prefix johansson-town
npm test --prefix steam-deck
node --test johansson-town/tests/controller-game.test.mjs johansson-town/tests/runtime-package.test.mjs
cd johansson-town && node tools/ci-guard.mjs
```

Install the pinned Vite/Spector dependencies as the workflows do. Package with `npm run package --prefix steam-deck`, then run `npm run test:console --prefix steam-deck`. Read `.github/workflows/linux-console-check.yml` and `johansson-world-linux.yml` for recovery/native/offline/installer gates. Software-rendered full acceptance can take many minutes; do not run other browsers alongside it or weaken assertions to finish sooner.

Before another release, bump the next unpublished version, rebuild runtime last if World source changes, complete appropriate World/desktop/ferry/console/offline/native checks, verify actual publication and the public installer/checksum, then update guides separately. Preserve existing save locations and published release assets.

## Update, 22 October 2026 (afternoon): the owner's devices

The owner answered the question this note left open: **a Steam Deck (its built-in controls) and an 8BitDo controller
in Switch Pro mode over Bluetooth**. No controller code has changed since 0.2.16. Read from the code on main only; none
of this is confirmed on hardware.

**Still to ask the owner before changing code** (asked on 22 October, not yet answered):
1. Is 0.2.16 installed, and does it still fail? How is it launched: Game Mode through Steam (as a non-Steam game), or
   Desktop Mode?
2. Does the left stick work while the right does not? Does the right stick move a mouse pointer instead?
3. On the Controls page: the device name shown at the top, and the two Look axes.

**Likely causes, in order:**
1. **Steam Input owns both pads.** With Steam running, it takes the Deck's controls and (by default) Switch Pro pads,
   the 8BitDo included. Outside Game Mode, or not launched through Steam, its desktop layout drives the mouse instead of
   presenting a gamepad, so the right stick never reaches the camera on either device. Fix: launch as a non-Steam game in
   Game Mode, and have the game say so when it sees this.
2. **A saved Look axis that no longer exists.** Since 0.2.16 (`steam-deck/ui/pad-layout.mjs`), an unmapped Bluetooth pad
   is rebuilt to four standard axes. A profile saved with `lookAxes` ≥ 4 (the raw xpad right stick is axes 3 and 4)
   reads `undefined`, so the camera is dead. Fix in `controller.mjs` `profileSettings`/`read`: fall back to the default
   [2, 3] when a saved axis is beyond the pad's axes; add a test.
3. **The game switches pads only on a button press.** `controller.mjs` changes the pad it reads only when one of a
   pad's buttons is pressed. Beside Steam's virtual pad (28de:11ff), stick movement alone never moves it to the
   physical one.

The 8BitDo in Switch mode should already read correctly. Under hid-nintendo it reports 14 buttons and 6 axes (X Y RX RY
plus the D-pad hat), which `DRIVER_BUTTONS[14]` and the stick/hat split already handle. Its stick calibration on clones
is the one thing to watch.

**Next:** get the three answers. Capture the real pads' `navigator.getGamepads()` (id, mapping, button count, axes at
rest and with each stick moved) as a test fixture. Fix, then release 0.2.17 per the steps above.
