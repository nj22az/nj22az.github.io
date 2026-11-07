# Minato Maru bridge polish — publication verification

[Johansson World](https://nj22az.github.io/johansson-town/) is live with the large teaching plaque and backing board removed, only the small ordinary battery marking retained, and three proper Blender-built linked wipers on the exterior window frames.

Published source implementation [`390ff7fcfa68d050023d885b80bbab158d639fdb`](https://github.com/nj22az/nj22az.github.io/commit/390ff7fcfa68d050023d885b80bbab158d639fdb), runtime publication head `ef37e76fcd2aaaf6654ff84e1a7fb9fd47823d55`. Main was updated by fresh compare-and-swap with `force=false`; no extra remote branch was created. This closing update changes root documentation/evidence only.

[Pages deployment passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41532036449). **All eight public files return HTTP 200 and match the tested local hashes**, including the page, runtime manifest, four source modules, lantern v2 GLB and new wiper GLB. Exact hashes are in `verification.json`.

[Canonical hosted World guard passed **588/588**](https://github.com/nj22az/nj22az.github.io/actions/runs/41532037902/job/125574424996), 113 files in 382 seconds, zero failures. `canonical-guard-summary.log` retains the exact aggregate. Local feature checks passed 10/10, runtime package 4/4 and complete unchanged vessel-walk checks 12/12. All 148 original runtime JavaScript blobs remain byte-identical. Independent QA and root approved the frozen geometry, all four corrected wiper proofs and the sign-free console proof.

The wipers share four articulated mesh parts across three units, with 4,080 total triangles. Tests check actual pane/frame dimensions, 281 fallback poses, 41 loaded-native hinge/rubber poses, full linkage closure and blade clearance, weather/power behaviour, smooth parking and pose-preserving lazy replacement. Power loss holds the pose. The 12 V hardware, canonical 24 V ship system, original navigation lights, instruments and walking layout remain unchanged.

All five [hosted World workflow jobs completed successfully](https://github.com/nj22az/nj22az.github.io/actions/runs/41532037902): canonical guard, iPhone startup/reload/room, desktop exploration, iPad portrait exploration and iPad landscape exploration. No browser profiles remain pending. Hosted software-browser jobs and Blender proofs are not physical-device tests.

[Implementation handover](../../johansson-town/briefs/HANDOFF-BRIDGE-WIPERS-2026-11-02.md) · [Wiper proofs and source checks](../../johansson-town/docs/qa/bridge-wipers-2026-11-02/README.md) · [Sign-free console](../../johansson-town/docs/qa/bridge-polish-2026-11-02/console-final.png).
