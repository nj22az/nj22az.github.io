# Pocket Camera design/shader audit evidence

[Owner handover and remaining findings](../../HANDOVER-DESIGN-AUDIT-2026-10-31.md).
[Draft PR #418](https://github.com/nj22az/nj22az.github.io/pull/418); not merged/published.

Exact screenshot/test source: `d9a9f25b525a6d403b2c352d78745d78463f6a7f`.
Exact before source: `83783c93448d1be251a61c213959448e1d21c971`, still the published main at verification.
Runtime implementation: `26f576481cbcbf2b5fec1af02e4053aa4b12d9e5`; later source commits only refine audit drivers.

## Results

- Camera run [41190783338](https://github.com/nj22az/nj22az.github.io/actions/runs/41190783338): **143 Camera + 57 UI + 50 audit** pass.
- MCP run [41190783298](https://github.com/nj22az/nj22az.github.io/actions/runs/41190783298): **15 units + 20 acceptance** pass; zero npm findings on fresh installation.
- World [41190783269](https://github.com/nj22az/nj22az.github.io/actions/runs/41190783269): guard and automated WebKit pass.
- Linux [41190783339](https://github.com/nj22az/nj22az.github.io/actions/runs/41190783339): full acceptance still running at review handoff, not counted as passed.

[evidence.json](evidence.json) records exact jobs, artifact digests and bounded measurement claims;
[runtime-sha256.json](runtime-sha256.json) proves the runtime retained across verification commits.
[delivery.json](delivery.json) records the six successfully saved deliverables and their checksums.
The owner received the durable image/archive links directly; the Git project is not duplicated.

## Reproduce from the repository root

Use the existing pinned dependencies and normal Chromium installation documented in [MCP.md](../../MCP.md).
The hosted workflow prepares the published baseline and executes these commands:

```sh
git archive 83783c93448d1be251a61c213959448e1d21c971 camera | tar -x -C /tmp/camera-audit-baseline --strip-components=1
CAMERA_AUDIT_BASELINE=/tmp/camera-audit-baseline CAMERA_SHOTS=/tmp/camera-design-audit node camera/tests/audit.browser.mjs
CAMERA_SHOTS=/tmp/camera-ui node camera/tests/ui.browser.mjs
node --test johansson-town/tools/camera/policy.test.mjs
CAMERA_MCP_EVIDENCE_DIR=./camera-mcp-evidence node johansson-town/tools/camera/acceptance.mjs
```

Create `/tmp/camera-audit-baseline` before the archive command. The full 143-check browser sequence is retained in
[pocket-camera.yml](../../../.github/workflows/pocket-camera.yml); no suite is omitted to obtain the audit result.
Local managed-shell Chromium is blocked by a required Unix socket; this pass used hosted CI rather than changing security.

Inspect the before/after café and grid, 34 actual shader outputs, 34 symbols, each of six panels in four viewports,
the two-Look small-phone/200%-text cases, MCP before/after and saved JPEG. Frame canvas shrink, the orphan Mine row
and clipped short multi-Look rail are open design findings; passing checks do not prove complete visual polish.
Physical iPhone/iPad Safari/native Share and the owner's installed MCP host remain unverified. AR remains a proposal.
