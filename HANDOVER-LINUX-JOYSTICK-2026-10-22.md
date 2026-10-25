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

## Update, 22 October 2026 (evening): likely cause 2 fixed in code

Branch `claude/laughing-rubin-6p25x2`. `steam-deck/ui/controller.mjs` `read` now falls back to the default sticks
(Move [0, 1], Look [2, 3]) when a saved pair points past the axes the pad is read with, so a profile saved against
the raw xpad layout (Look 3 and 4) no longer leaves the camera dead after 0.2.16's four-axis normalisation. The saved
profile is left as it is (the Controls page still shows the old numbers until the owner changes them). New test in
`steam-deck/tests/controller.test.cjs`: it fails on the old code and passes now; all 39 desktop tests pass. This is not
released: 0.2.17 was published without it (see the release update below); it reaches `main` through #362 on
23 October and ships in the next Linux release, **0.2.18 or later**. Causes 1 (Steam Input's desktop layout) and 3 (switching
pads only on a button press) are unchanged, and the owner's three answers are still needed. Nothing confirmed on hardware.

## Release update — 2026-10-22T23:17:22+02:00 (Europe/Copenhagen)

[Linux 0.2.17](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.17) is now published via
[#370](https://github.com/nj22az/nj22az.github.io/pull/370), release commit
`1c204ad415483e097c279f5ade19f89cf3ad39a8`. It removes current fighting,
safely migrates old combat saves and includes accepted main World work, including
the new Look setting and frozen Free camera. Source integration, exact-tree
acceptance and [public installer verification](https://github.com/nj22az/nj22az.github.io/actions/runs/39854364138) passed.
See [the signed handover](johansson-town/briefs/HANDOFF-COMBAT-WITHDRAWAL-2026-10-22.md)
and [release evidence](linux-port/acceptance-0.2.17.md).

This release does **not** include the separate saved-axis repair proposed in
#362. Real Steam Deck/8BitDo checks and the diagnostic questions above remain
outstanding. Version 0.2.17 is consumed: a further controller release needs the
next unpublished version, at least 0.2.18. Preserve all published assets and saves.

## Update, 24 October 2026: 0.2.18 published

[Linux 0.2.18](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.18) carries the saved-axis
fallback (`84baf00`) and main's World of 24 October; evidence in `linux-port/acceptance-0.2.18.md`, session note in
`HANDOVER.md`. Version 0.2.18 is consumed: the next release is at least 0.2.19. The console check's full-acceptance step
now has 30 minutes (job 45). Real Steam Deck/8BitDo confirmation of right-stick camera control is still outstanding.

## Update — 25 October 2026: Linux 0.2.20 published

[Release 0.2.20](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.20) includes `c36a40c` (painted head-lighting floor and Sketchbook dark-feature preservation), from approved production main `aa792244`. [PR #397](https://github.com/nj22az/nj22az.github.io/pull/397) merged as `a56db3686b853907f08335c88e0197b96b972b47`; final candidate `2c504ee0` and release tree are identical (`156956a70be12d3f49026df6615a982ca8bd5167`). The existing preparation branch was reused, with no new branch or prototype promotion.

Complete [Linux acceptance 40161672630](https://github.com/nj22az/nj22az.github.io/actions/runs/40161672630) and the 413-check World guard pass. Both candidate and release pass 92 actual packaged WebGL cases across 19 Looks (minimum contrast 0.0646, threshold 0.045), controller recovery, native startup/disk saves and offline startup. Full candidate acceptance includes real game movement/camera, four sizes, residents, saved mappings/identity and legacy-save recovery. A Help-readiness fixture now waits for the actual UI state; production controller/game code is unchanged. Final [release workflow 40163244813](https://github.com/nj22az/nj22az.github.io/actions/runs/40163244813) passed through the public installer/checksum gate. Independent verification covers all 1,621 files, 32 runtime modules, version/source identity, patch payload, asset hashes and installer equality.

[Detailed release evidence and screenshots](linux-port/acceptance-0.2.20.md). Preserve the Steam shortcut, Gamepad layout, saved-axis fallback and existing save paths. Physical Steam Deck/8BitDo Bluetooth controller operation remains **unverified**; software simulation does not resolve the owner's hardware report. Both 0.2.19 and 0.2.20 are consumed and immutable. Check latest releases before another bump (at least 0.2.21). Later concurrent main changes are outside this frozen package.

**Website sign-off — 25 October:** publication `465808031c0b73b7e38d5f4493f44f5c2494ae4a`, [Pages run 40164117036](https://github.com/nj22az/nj22az.github.io/actions/runs/40164117036), is verified live: 21 exact public files, seven current release links and the actual raw installation script match the final release. The real 0.2.19 updater applies the published 1,671,472-byte patch to the exact 1,621-file target; the previous installation and an explicitly synthetic save profile remain unchanged. [Final publication and patch evidence](linux-port/acceptance-0.2.20.md). All package/download work is signed off; physical Steam Deck and 8BitDo acceptance remains unverified.
