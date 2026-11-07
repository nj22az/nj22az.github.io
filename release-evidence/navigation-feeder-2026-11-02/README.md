# Navigation lantern feeder: published and verified

Implementation: [`ebe94688d88a3553605107672e141ae85430418d`](https://github.com/nj22az/nj22az.github.io/commit/ebe94688d88a3553605107672e141ae85430418d), on `main`. [Johansson World](https://nj22az.github.io/johansson-town/) · [source handover](../../johansson-town/briefs/HANDOFF-NAVIGATION-FEEDER-2026-11-02.md).

The navigation lantern is supplied from the existing ESB 105 V AC, 60 Hz insulated two-wire branch. A fused, double-pole switched panel feeds the existing green starboard light through an actual incoming feeder and outgoing two-core cable. The invented battery, tray and separate practice lamp are absent from the active scene. The book uses its explicitly simplified 12 V DC calculation values with the same physical equipment layout; those values are not ship ratings. Main/emergency supply and retained switch command are distinct. The corrected native screen joint and removal of the replaced primitive board prevent the observed overlapping surfaces. The existing pantograph wipers are unchanged.

## Verification

- Fresh combined focused, vessel-walk, wiper, native/fallback and runtime package checks: **29/29 passed**.
- [Canonical World workflow41544026746](https://github.com/nj22az/nj22az.github.io/actions/runs/41544026746): **all five jobs succeeded** — guard, iPhone WebKit startup, desktop exploration, iPad portrait exploration, iPad landscape exploration.
- Canonical guard: **591/591 tests**,113files,376seconds.
- [Pages41544025331](https://github.com/nj22az/nj22az.github.io/actions/runs/41544025331): **success**.
- Public entry page, service worker, runtime source record, active compiled feeder chunk, active boot chunk, three affected source modules, native v2 model and unchanged wipers: **10/10 hash matches**. See [byte report](live-byte-verification.json) and reproducible [checker](verify-live.py).
- All **172** previously published runtime JS chunks retained byte-for-byte. See [local verification](local-verification.json).
- [Hosted job records](hosted-verification.json) identify the tested implementation and each successful job.

## Canonical v2 model metadata

| Item | Value |
| --- | --- |
| Active asset | `assets/models/ferry-bridge/navigation-feeder-v2.glb` |
| Bytes |111440|
| Meshes |2|
| Triangles |1300|
| SHA-256 |`f6188705d85feec26f081292b52cc30bb852c6e90c43f7f799ccacd46eab4376`|
| Unchanged wiper SHA-256 |`317574e7030012e919c18acb5b74445a3f82fde48ee576e1773bb7808c1adc1d`|

The metadata above supersedes the preliminary byte count in the implementation handover. The initial feeder publication177c0e21 was superseded by the screen-joint correction: its Pages and tree review passed, while its World workflow was automatically cancelled by the newer run. Only the final implementation’s successful workflow is the closing evidence.

The three Blender images are source-geometry proofs, including the actual runtime lever geometry and reproduced panel-canvas labels. The hosted browser jobs are automated WebKit viewport checks, not tests on a physical iPhone/iPad or an electrical installation. No hardware certification or physical-device approval is claimed. The final closing commit touches only root handover/evidence paths and does not change any tested World source, asset or runtime byte.
