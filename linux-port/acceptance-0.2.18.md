# Linux 0.2.18 — acceptance and publication

Signed off 2026-10-24 (Europe/Copenhagen).

[Published release](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.18) ·
[Linux release workflow](https://github.com/nj22az/nj22az.github.io/actions/runs/40086718443) ·
[Exact candidate acceptance](https://github.com/nj22az/nj22az.github.io/actions/runs/40084048887)

The offline Linux edition catches up with the browser World of 24 October 2026:
the new Looks and improved illustration shaders, the Town book's home screen of
icon tiles, Nhung as the island doctor, Higa Liquor closed into Sakura, Vy's new
design, animated greeting eyes, and Sakura's corrected Eisa poster and cold
cabinet. It also carries the controller fallback that 0.2.17 left out: a saved
Look or Move stick pair past the connected pad's axes falls back to the default
sticks.

## Source and release identity

- Browser merge #388: `2cc5a6b07727e8ece77c238d611166a97f1d3971`.
- Tested Linux candidate (#389 head): `5d5069445258916ab3c95719c5126f65295c03a8`.
- Release merge #389 and immutable tag: `c7540727b8ad09ee354a1323a4e519636f931947`.
- Candidate/release tree: `87d03eb4b21c9a29289734ffd784ca151fcd177e` (identical).
- World runtime source hash in the package: `804d72d5721fedd29e7cbaa1a9e45478ea814a189d6d0e2e98e1cf3836acb164`.

## Checks completed

- World guard on #389 ([run 40084048942](https://github.com/nj22az/nj22az.github.io/actions/runs/40084048942)) passed;
  the same source passed the full guard locally, **391 passed, 0 failed; 75 files**.
- Linux desktop suite: **38 passed** locally; the same `npm test` step passed in both workflows.
- Controller recovery passed (`CONTROL_REPAIR_OK`), native startup, stability and
  version (`desktopVersion: 0.2.18`) and disk saves passed.
- Packaged offline browser passed: `errors:[]`, `missing:[]`, remote requests blocked.
- Extended console checks passed at 1280×800, 1280×720, 960×540 and 800×600;
  all 25 selectable identities, home exit and conversation escalation passed, then
  the web-only recovery. Final report: `passed:true`, `errors:[]`, `missing:[]`.
  The full-acceptance step took 21 minutes, inside its new 30-minute budget.
- The native startup logged one fallback: the Sakura bench's detail model hit
  its timeout and a local stand-in was drawn. The check passed; noted, not hidden.
- Publication and the public installer/checksum verification in the release
  workflow passed.
- Checked again by hand after publication: the archive and patch downloaded from
  the release match `SHA256SUMS`, `latest-linux.json` and GitHub's asset digests;
  the packaged app reports 0.2.18; the release `install.sh` is byte-identical to
  the website installer and names 0.2.18; the packaged Sakura chunk reads "Sakura ·
  Eisa poster". The bundle manifest lists 1,607 files.

## Published downloads

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| Full Linux archive | 263,368,125 | `a626775e3b0c6a2a3eabfb51c27b59bd4a3d3bb6fb222299b735658610b26ebd` |
| Patch from 0.2.17 | 5,473,706 | `64d1860a654d9c8d6e8f4f99d5cf1221f23612bd2fefe290d42af79ecb96fdeb` |

[Download and checksums](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.18). Use Settings → Updates in an installed
copy, or the [installation guide](/linux-port/install/). Save profiles and the
previous installation are retained. Version 0.2.17 assets were not replaced.

## Limits

These are hosted Ubuntu/Xvfb/SwiftShader checks and simulated controller inputs.
Physical Steam Deck, 8BitDo Bluetooth and iPhone Safari acceptance is outstanding.
The woodland diorama merged to main after this release and is not in it.

Detailed handover: [HANDOVER.md](../HANDOVER.md), 24 October 2026 session note.
