# Linux 0.2.17 — acceptance and publication

Signed off 2026-10-22T23:17:22+02:00 (Europe/Copenhagen).

[Published release](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.17) ·
[Linux release workflow](https://github.com/nj22az/nj22az.github.io/actions/runs/39854364138) ·
[Exact candidate acceptance](https://github.com/nj22az/nj22az.github.io/actions/runs/39851951948)

The ordinary game is peaceful. Current fighting launchers, input interception,
damage/rewards and first-person weapons are removed; the combat-dependent cave
descent is closed. Conversations, apologies, peaceful festivals, dining,
exploration and ferry operations remain. Old active combat saves recover safely
without losing possessions, relationships, identity or travel milestones.
The current Look styles and frozen Free camera are retained.

## Source and release identity

- Browser merge #365: `4a52d5d2161f9691b8f3e808ba959389f463e578`.
- Tested Linux candidate: `98136ef8ea425828674d3188cea9c1e93f6b4df8`.
- Release merge #370 and immutable tag: `1c204ad415483e097c279f5ade19f89cf3ad39a8`.
- Candidate/release tree: `bc30fa65c8bb134841a04f7b3b094873f62889b4`.
- World runtime source hash: `9393340c1c5bce6f09c5b5b229e7fe48780bc1c05bfa7d13f2374f708c3cd520`.

## Checks completed

- [World guard](https://github.com/nj22az/nj22az.github.io/actions/runs/39851951906): **367 passed, 0 failed; 69 files**.
- Linux suites: **37 desktop and 57 targeted game tests passed**.
- Controller recovery, native startup/stability/version and disk saves passed.
- Packaged offline browser passed, with remote requests blocked.
- Extended console checks passed at 1280×800, 1280×720, 960×540 and 800×600.
- All 26 canonical identities, owned beds, saved character/settings reload,
  peaceful repeated insults, removed shortcuts and old combat/cave save recovery passed.
- Final report: `passed:true`, `errors:[]`, `missing:[]`.
- Accepted candidate archive: **1,559 inventoried files** verified against
  SHA-256, byte counts and modes; embedded inventory verified; retired modules absent.
- Inspected current acceptance captures of peaceful conversation, safe harbour
  recovery and the native guide. The identity-chip/dialogue overlap remains a separate UI issue.
- Publication and fresh public installation with checksum verification passed.
- Published manifest, checksum file and GitHub asset digests agree.

## Published downloads

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| Full Linux archive | 261,963,891 | `9bfc838d78f021cf210098cab61f4333e0edccf63ffa05c5bc45a01e2866ab0f` |
| Patch from 0.2.16 | 6,348,417 | `c6c1cdc53887bc99b784ff818298712c3e6594e631f6da13ca6be849ab355ef9` |

[Download and checksums](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.17). Use Settings → Updates in an installed
copy, or the [installation guide](/linux-port/install/). Save profiles and the
previous installation are retained. Version 0.2.16 assets were not replaced.

## Limits

These are hosted Ubuntu/Xvfb/SwiftShader checks and simulated controller inputs.
Physical Steam Deck, 8BitDo Bluetooth and iPhone Safari acceptance is outstanding.
The separate proposed controller-settings repair in #362 is excluded.
No replacement fighting mode is included.

Detailed [handover](../johansson-town/briefs/HANDOFF-COMBAT-WITHDRAWAL-2026-10-22.md).
