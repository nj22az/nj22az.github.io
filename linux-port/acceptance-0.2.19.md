# Linux 0.2.19 — acceptance and publication

Signed off 2026-10-24 (Europe/Copenhagen).

[Published release](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.19) ·
[Linux release workflow](https://github.com/nj22az/nj22az.github.io/actions/runs/40120289660) ·
[Exact candidate acceptance](https://github.com/nj22az/nj22az.github.io/actions/runs/40117841659)

Brings the offline Linux edition up to the browser World of the evening of 24 October 2026: Vy cel-shaded like the
rest of the cast (and the Soft sculpted head in Studio), Make a face, the harbour noticeboard rebuilt from its drawings
with the woodland diorama, solid moving cars and the flowerbed bench fix. The installer adds Johansson World to Steam's
Library and sets the Deck's Gamepad with Camera Controls layout; `--steam` does that alone for an existing install.

## Source and release identity

- Browser merge #393: `94613e2ca49dae286a878449729c9a7f5e6de66c`.
- Tested Linux candidate (#394 head): `b634054b7a85c80af535b5a74cd749b059f305d1`.
- Release merge #394 and immutable tag: `e5d0c94fd7907b4fc6d885271a85127027e52e9b`.
- Candidate/release tree: `63d7c29995eb87cd1a093dc49841d36005f46f95` (identical).

## Checks completed

- World guard on #394 passed; the same World source passed the full guard locally, **409 passed, 0 failed; 77 files**.
- Linux desktop suite: **39 passed** locally (the installer fixture covers the Steam Library entry, the Steam Input
  layout, backups and a second `--steam` run without duplicates); the same `npm test` step passed in both workflows.
- [Linux console acceptance](https://github.com/nj22az/nj22az.github.io/actions/runs/40117841659) passed: controller
  recovery, native startup and disk saves, the offline packaged site, four window sizes, the resident roster and the
  web-only check (the web starts as Johansson, out of bed, with no Linux console UI).
- The release workflow passed every step, including publication and the public installer/checksum verification.
- Checked by hand after publication: the archive and patch downloaded from the release match `SHA256SUMS`,
  `latest-linux.json` and GitHub's asset digests; the packaged app reports 0.2.19; the packaged `build.js` has Vy's
  cel shading and no sculpted exemption; the release `install.sh` names 0.2.19, carries the Steam steps and is
  byte-identical to the website installer. The bundle manifest lists 1,622 files.

## Published downloads

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| Full Linux archive | 268,764,983 | `1b6a6c1db3c7a10467f3f3f4b55d173d9d5e1bc13ce8adc276da3b13daec883e` |
| Patch from 0.2.18 | 7,687,664 | `008ac9ff6ed47a35623297f44b16e40bc3aa221318c4c32ab7c85138617399b6` |

[Download and checksums](https://github.com/nj22az/nj22az.github.io/releases/tag/johansson-world-linux-v0.2.19). Use Settings → Updates in an installed
copy, or the [installation guide](/linux-port/install/). Save profiles and the
previous installation are retained. Version 0.2.18 assets were not replaced.

## Limits

These are hosted Ubuntu/Xvfb/SwiftShader checks and simulated controller inputs.
Physical Steam Deck, 8BitDo Bluetooth and iPhone Safari acceptance is outstanding, including whether the Steam Input
Gamepad layout fixes the owner's report that only the touch screen works on the Deck.

Detailed handover: [HANDOVER.md](../HANDOVER.md), 24 October 2026 session notes.
