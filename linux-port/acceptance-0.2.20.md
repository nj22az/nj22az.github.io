# Linux 0.2.20 — candidate acceptance

Prepared 25 October 2026 (Europe/Stockholm). **Candidate only; not published.**

## Production source

Production main: `a7338203dd8a239fb6529e533aaea23a9526d651`; facial correction `c36a40c782ae9ffa118b879661849e9a6f1af01e`. Latest published Linux release verified as 0.2.19, release source `e5d0c94fd7907b4fc6d885271a85127027e52e9b`. No later packaging PR or published release was found at preparation.

Only version metadata, release notes and acceptance tooling change. No game source, geometry or animation changes. Rebuilding approved main reproduces `boot-Dxv7PTWJ.js`; its tracked runtime is retained. The Steam installer differs from 0.2.19 only in its version assignment; controller configuration and save locations are unchanged.

## Local checks actually run

- Desktop/controller/update/installer suite: **39/39 passed**, both before and after the version bump.
- Shared facial material, game controller, runtime and combat withdrawal suites: **6/6 passed**.
- Production runtime rebuild: passed, 635 modules, same production boot entry. Existing chunk-size warnings remain.
- Full World guard: **400 checks passed; one file failed**, `no-z-fighting.test.mjs`; no assertion detail was emitted. Isolated rerun and hosted guard pending. Do not report the earlier main's 413-test result as this candidate's result.
- Local packaging reached archive creation, but its first tar pass reported a changing directory. An unchanged-directory tar retry succeeded. This is not the hosted package gate or an approved release artifact.
- Packaged-source preflight passed (shared avatar, Looks, pipeline and boot matched production). Browser launch then failed because this execution environment denies Chromium's Unix socket creation. Xvfb/native startup was also blocked by local environment setup. No new local rendering, startup or controller browser result is claimed.

## Required hosted gates

Linux console PR acceptance must pass: desktop regressions, compiled package, new packaged facial check, controller recovery, real Electron startup and disk saves, offline startup, full controller/layout/resident/save acceptance. World guard must pass too.

The facial check serves the actual packaged application's source, verifies production bytes including runtime chunks, exercises the established 92 WebGL cases across 19 Looks and repeated switching, and exports the contrast report plus dim Natural, Sketchbook, Cartoon and Oil captures. The numeric threshold remains 0.045. These are actual WebGL software renders, not physical-device acceptance.

After the reviewed release-branch merge, the release workflow must pass the same packaged facial check before publishing. Download final artifacts; verify SHA256SUMS, latest-linux.json, GitHub asset digests, archive contents/version and production-source hashes. Record final release identity, patch-base verification, published checksums and screenshots here before changing website links and public installer.

## Physical acceptance

Physical Steam Deck and 8BitDo Bluetooth acceptance remain **unverified**. Simulated Gamepad and Steam shortcut/layout fixtures do not establish success on the owner's hardware. Preserve the existing installer configuration and do not claim a new hardware controller correction.
