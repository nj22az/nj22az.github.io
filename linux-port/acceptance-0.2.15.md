# Linux 0.2.15 ferry acceptance

21 October 2026 (Pacific); publication and final acceptance on 22 October UTC.

## Approved feature and integration

The owner-approved timetable was merged in [PR #333](https://github.com/nj22az/nj22az.github.io/pull/333), main commit `e16d14fff20f9342c693d98700271f1563fa4dc3`. [PR #338](https://github.com/nj22az/nj22az.github.io/pull/338) combined that work with Linux 0.2.14 and merged only into the Linux integration branch at `6f69315ec6d89702896810ca5c3dc051f2046497`. Town-hall backdrop work was kept separate.

Minato Maru uses the published Harbour Line timetable. The two-minute horn, 出港 · Departing sign and Go ashore / Stay aboard choices precede safe gangway closure. Passengers remaining aboard travel with the vessel, can walk the decks and go below, and can disembark when access opens at the destination. Mac covers the chief engineer's watch while Johansson is ashore or off duty. Linux retains its full crew simulation, vehicles, controls, playable residents, owned beds and save/update systems. The separate quick crossing remains on request. Old held/requested crossings migrate to the timetable.

## Runtime and automated evidence

The [combined integration run](https://github.com/nj22az/nj22az.github.io/actions/runs/39686445369) passed:

- 35 desktop regression tests and 68 focused ferry/controller/access tests.
- The full World guard: 258 tests across 49 files.
- Offline inventory verification: 2,624 files.
- Actual native Electron startup, festival stages and disk-save verification.

It committed generated runtime/index/service-worker output last at `fd2e3a832f245484e9c2eb011fc443b9f0f0739b`. The rebuilt entry point is `boot-CUkZNBff.js`; the runtime source hash is `c1896c63172f95f389751f9b5b15344653a215dd26eb962f4570bfadfbdcb3a2`.

The [first complete combined console run](https://github.com/nj22az/nj22az.github.io/actions/runs/39686452354) passed the full controller/layout/resident/save journey and native startup with the same compiled runtime.

The [final acceptance run](https://github.com/nj22az/nj22az.github.io/actions/runs/39702000847) passed on `00ab3e3d1669a7ace403485b6e8856c1f1fb0111`: 35 desktop and 57 gameplay regression tests, controller recovery, all four layouts (1280×800, 1280×720, 960×540, 800×600), all 26 canonical residents and authored avatar mappings, owned beds/waking/doorway B exit, conversations/quarrel pause/no rewards, saved identity/controller reload and separate web isolation. Its browser result records zero page errors and zero missing files. Native Electron reported `running:true`, `stability.ok:true` and `desktopVersion:0.2.15`; the festival stages and disk-save checks also passed.

The caption/action correction and original measured layout evidence remain documented in [0.2.14 acceptance](acceptance-0.2.14.md).

## Night-start fixture correction

The first publication attempt stopped before publishing because the native smoke began asleep in Johansson's cabin. Waking him did not make the contextual Exit button available away from the door. The outdoor festival correctly refused to begin indoors. The console fixture contained the same assumption.

[PR #343](https://github.com/nj22az/nj22az.github.io/pull/343), merged at `1071a3880a35c12fed7ec8057710366bf1776805`, corrects only acceptance setup: wake, leave through the audit API and wait for room loading/catch-up to settle before outdoor checks. The native fixture also sets a deterministic 08:35 harbour scene. Actual A/stick waking, near-door B exit and all other assertions are retained. No gameplay or visual alteration was made.

## Actual built-game phone journey

An independent review of merged main used the actual rebuilt game at 390×844 CSS pixels:

1. 08:43: the departure warning and Go ashore / Stay aboard choices appeared.
2. Stay aboard was selected; Johansson travelled throughout the 08:45 sailing.
3. During the crossing, ordinary W-key movement moved him 1.318 metres relative to the ship, with open-deck floor beneath him before and after.
4. 09:07: access was open at Kitano-jima. Go ashore completed the real route onto the destination pier.

The complete journey recorded no page errors. Four phone screenshots and a review sheet were delivered to the owner before Linux integration; the ferry functionality had already received visual approval in #333.

## Published release

The [complete release workflow](https://github.com/nj22az/nj22az.github.io/actions/runs/39707936489) passed regression/runtime/package checks, controller recovery, actual native startup and disk saves, publication without overwriting an existing version and a fresh installation of the public archive with SHA-256 verification.

Release: [johansson-world-linux-v0.2.15](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.15). Its tag points to `1071a3880a35c12fed7ec8057710366bf1776805`. Prior 0.2.14 publication completed before this release.

The full archive is 444,779,537 bytes. SHA-256: `7a0c48a787a87ce6ecb66b66282800deb9e143450bff55ee7080e08682a314c4`.

A compatible 0.2.14 → 0.2.15 patch is 2,209,477 bytes. SHA-256: `9338fb93f5d6658fab72056a5958af967590a480d59d1eeafc4ed007c54da7d5`. Older or modified installations can use the full archive. The updater reports the available package and size.

The archive, `SHA256SUMS`, `bundle-manifest.json`, `latest-linux.json`, installer and launcher icon are published together. The release workflow retains existing published versions rather than overwriting their assets. Existing save locations and formats are preserved.

## Hardware limit

No physical Steam Deck or real controller was available. Steam Input translation, device GPU performance, physical buttons, suspend/resume and on-device installation remain unverified. Ubuntu/Xvfb with SwiftShader and simulated controller input establish software acceptance only.
