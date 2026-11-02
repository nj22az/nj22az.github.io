# Minato Maru bridge lantern — publication verification

Published implementation [`7e362dc956032af6d710b31597b4852e411995ee`](https://github.com/nj22az/nj22az.github.io/commit/7e362dc956032af6d710b31597b4852e411995ee), source/runtime publication head `eda9f03481b03ca2a989c56832836364c61c540b`. Main was updated atomically with the fresh expected SHA and `force=false`; no extra remote branch was created. Later commits change release documentation only.

[Johansson World](https://nj22az.github.io/johansson-town/) is live. [Pages deployment passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41521959709). All five public files return HTTP 200 and exactly match the tested local bytes: page, runtime source manifest, bridge builder, practice-circuit module and actual GLB. `verification.json` records their hashes.

The 692,060-byte GLB has three meshes and 10,968 triangles. It retains an intact fuse, two complete conductors, supported battery tray, upright Swedish labels and a separate exterior practice lamp. Canonical 24 V, four navigation lights, original bridge instruments and walking layout remain. Independent review approved the final artifact without remaining P1/P2. Focused asset/bridge/runtime checks passed 9/9 and unchanged vessel-walk checks passed 12/12; all 122 original production runtime JavaScript blobs were preserved.

[Canonical hosted World guard passed 583/583](https://github.com/nj22az/nj22az.github.io/actions/runs/41521961658/job/125539982206), 112 files in 367 seconds, zero failures. The [iPhone startup/reload/room job passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41521961658/job/125539982586). [Island tree game review passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41521961866).

All five [hosted World workflow jobs passed](https://github.com/nj22az/nj22az.github.io/actions/runs/41521961658): canonical guard, iPhone startup/reload/room, iPad portrait exploration, iPad landscape exploration and desktop exploration. Their job steps are successful. Root independently verified these final API results. Blender proofs and hosted software-browser jobs are not physical-device tests. The incomplete local serial aggregate is not presented as a pass; the hosted canonical run supplies the completed full result.

[Editable source and historical implementation handover](../../johansson-town/briefs/HANDOFF-BRIDGE-LANTERN-2026-11-02.md) · [Blender asset notes](../../johansson-town/art/ferry-bridge-lantern/README.md).
