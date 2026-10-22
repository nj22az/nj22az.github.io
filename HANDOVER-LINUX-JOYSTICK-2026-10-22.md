# Linux controller handover — 22 October 2026

## Owner's next priority

The owner reports: **“The right joystick should control camera now it doesn’t on either Bluetooth or steam deck.”**
Fix actual horizontal and vertical camera control with the Steam Deck's built-in right stick and the Bluetooth controller. Do not treat simulated-controller tests as proof that either physical device works. The controller model, reported mapping and Steam Input configuration have not yet been captured. The owner requested the Linux work be integrated into main and these notes supplied to a new agent.

Read `AGENTS.md`, `CLAUDE.md`, `johansson-town/AGENTS.md` and directory instructions first. Preserve the current main world and its approved visuals. Keep concurrent town-hall/backdrop and character work separate. Do not split repositories.

## Published baseline

- Linux **0.2.15** is already published: [release](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.15), [install/update](https://nj22az.github.io/linux-port/install/).
- Its tag points to `1071a3880a35c12fed7ec8057710366bf1776805` on `codex/johansson-world-steam-deck`. Do not overwrite the tag or release assets. A shipped controller correction requires a subsequent version, at least 0.2.16; inspect latest releases first.
- Approved ferry implementation: #333, main `e16d14fff20f9342c693d98700271f1563fa4dc3`. Linux integration: #338, `6f69315ec6d89702896810ca5c3dc051f2046497`. Native/console night-start fixture: #343, `1071a3880a35c12fed7ec8057710366bf1776805`.
- Public guides/evidence: #344, main `68c8de703d950677996d298da712076139122396`; see `linux-port/acceptance-0.2.15.md`.
- Release run [39707936489](https://github.com/nj22az/nj22az.github.io/actions/runs/39707936489) passed native startup, controller recovery, disk saves, publication and a fresh installation of the public archive with SHA-256 verification.
- Full archive: 444,779,537 bytes, SHA-256 `7a0c48a787a87ce6ecb66b66282800deb9e143450bff55ee7080e08682a314c4`. Compatible 0.2.14 patch: 2,209,477 bytes, SHA-256 `9338fb93f5d6658fab72056a5958af967590a480d59d1eeafc4ed007c54da7d5`.

## Existing controller repair — investigate before duplicating it

[PR #340](https://github.com/nj22az/nj22az.github.io/pull/340), branch `claude/linux-bluetooth-controller`, head `c5eef5eda4b2c75c3e38f5d233e82de6fea2d169`, is OPEN and targets the Linux integration branch. It is **not in published 0.2.15** and is not included in this main integration.

It adds `steam-deck/ui/pad-layout.mjs`, normalising unmapped Linux xpad/xpadneo, hid-playstation, hid-nintendo and hid-generic layouts. Triggers and D-pad hats become buttons. `controller.mjs` selects a pad being pressed instead of an idle virtual pad; `console-ui.mjs` distinguishes switching connected pads from losing one. It includes three driver-layout/late-connect/multiple-pad regression tests. Review its assumptions: first-seen axes may not be resting, button counts alone may not identify a driver, and an explicit saved controller selection wins over automatic takeover.

Its overall run [39688481038](https://github.com/nj22az/nj22az.github.io/actions/runs/39688481038) failed, but **the controller recovery and full console/browser checks passed**, recording zero page errors and missing files. The failure was native festival setup starting indoors after a sleeping cabin start: `FESTIVAL_SMOKE stage:false`, “Step outside onto the island before joining the festival.” This is the same acceptance-fixture problem subsequently fixed by #343. Do not mislabel that run as a demonstrated controller regression, and do not merge #340 solely because the fake-pad tests pass. Rebase/combine it with current source and rerun full acceptance.

## Trace and reproduce

1. Capture version, launch route (Steam Gaming Mode, Steam Desktop Mode, direct executable), controller ID, `mapping`, index, button count and every raw axis at rest and while moving each stick independently. Include all connected pads: Steam Input can expose an idle virtual pad beside a physical one. Avoid guessing which axis is the right stick.
2. Check saved Controls & camera settings: selected controller, horizontal/vertical axes, swapped sticks, dead zone, sensitivity and invert Y. Test a fresh profile and a retained old profile; preserve the user's existing saves and bindings. Verify the Steam Input layout emits right-stick joystick axes; if it emits mouse motion instead, trace that path explicitly.
3. Follow `steam-deck/ui/controller.mjs` → `steam-deck/ui/console-ui.mjs` → the desktop input bridge → `johansson-town/src/input/analogue.js` and `src/game.js` camera update. Compare raw axes, normalised `frame.look`, selected pad and actual yaw/pitch. Check menu/reconnect suppression, active-device choice, camera modes and focus/pointer-lock conditions.
4. Reproduce the real failure with a captured device fixture, then add regression coverage that fails before the fix. Retain standard pads, unmapped pads, late connection, two-pad takeover, held-button suppression, reconnect/remap persistence, movement, menus and near-door B exit.
5. Run the actual built game. Check yaw and pitch with each physical device, while walking and standing, indoors and outdoors, after pause/resume, reconnect and restart. Report physical checks honestly if hardware is unavailable.

## Integration and validation rules

The Linux-to-main integration combines released Linux source with main through `9b578fa`, retaining main's later izakaya/bar service, hand work and compact-room assets rather than restoring older Linux copies. The approved two-person bench and clothing-fit work (#342) is retained, including seatFront through the avatar update alongside sleeping. The game conflicts preserve Linux sleeping/owned-home handling, bed-restricted exit plus ferry departure context, and desktop pause/festival/frame handling. Generated runtime is rebuilt from the combined source, last. Do not copy either parent's whole index or runtime over the combination.

The published ferry is already owner-approved: scheduled departures, T−2 horn/sign/passenger choices, safe gangway closure, walkable onboard travel, safe destination exit, passenger/vehicle save migration, Mac's relief watch, full Linux crew simulation and separate request-only quick crossing must remain intact.

Baseline evidence: integration run [39686445369](https://github.com/nj22az/nj22az.github.io/actions/runs/39686445369) passed 258 World tests across 49 files, 68 focused ferry/controller/access tests, 35 desktop tests, 2,624 offline files and native checks. Final pre-release console run [39702000847](https://github.com/nj22az/nj22az.github.io/actions/runs/39702000847) passed all four layouts, 26 canonical residents, owned beds/waking/doorway B, saved identity/controller reload, conversations and web isolation. Those results establish the 0.2.15 baseline, not the owner's newly reported hardware behaviour or the newly combined main build.

Build/test starting points:

```sh
npm ci --prefix steam-deck
npm run build:runtime --prefix johansson-town
npm test --prefix steam-deck
node --test johansson-town/tests/controller-game.test.mjs johansson-town/tests/runtime-package.test.mjs
cd johansson-town && node tools/ci-guard.mjs
```

Install the existing pinned Vite/Spector build dependencies as the workflows do. `npm run package --prefix steam-deck` prepares the installed site; `npm run test:console --prefix steam-deck` then exercises the real browser world. Read `.github/workflows/linux-console-check.yml` and `johansson-world-linux.yml` for recovery/native/package/installer gates. Full console coverage takes minutes under software rendering; do not run other browsers beside it. Keep assertions; fix setup instead of weakening checks.

Before shipping, bump the next unpublished Linux version, rebuild combined runtime last, pass the full guard/desktop/ferry/console/offline/native gates, and verify publication plus the public installer/checksum. Update guides separately after success. The earlier ferry-release follow-up is complete and disabled; no controller follow-up has been scheduled. Physical Steam Deck/GPU/Steam Input acceptance remains outstanding.
