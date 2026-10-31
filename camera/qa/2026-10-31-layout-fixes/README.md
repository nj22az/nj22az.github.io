# Pocket Camera layout-fix evidence — 31 October 2026

**Published:** PR #418 merged on the owner's “Push to main”, main **bd0507162dfa9d60cd891fd707893a7e22bcb618**,
identical tree to final all-green reviewed **d56ea122**. Exact-head **275 Camera/UI/audit + 15/20 MCP** checks,
World guard/automated WebKit and Linux full acceptance passed. Pages **41199773205** passed. [publication.json](publication.json)
records **42/42 live-address matches** and exact source/check/deployment details; original screenshot snapshots below
retain the state when they were captured.

[Current handover](../../HANDOVER-DESIGN-AUDIT-2026-10-31.md) · [Merged PR #418](https://github.com/nj22az/nj22az.github.io/pull/418).
Exact tested/screenshot source: **9e28f6d4d3bf137f4d1b27b9e54d07190dc1c34e**.
The preceding before screenshots use **d9a9f25b525a6d403b2c352d78745d78463f6a7f**; published main stays **83783c93**.

Frame shows one Paper/Mirror option row and a Date icon. Sticker categories stay on one scrollable row. The Look rail
scrolls within the reserved side space; photo gestures only run in the picture area. The new UI tests retain all 57
earlier checks and add 25 across eight viewports/200% text, checking actual recipe edits, dimensions and visible bounds.
The first candidate's failing landscape Paper-bound assertion was retained, and compact thumbnails fixed its cause.

Fresh results: **143/143 Camera + 82/82 UI + 50/50 shader audit**, **15/15 MCP units + 20/20 acceptance**. World guard
and automated WebKit also pass. See the handover for exact jobs/artifacts and the still-running Linux state; do not infer
physical Safari or an installed-client connection from these automated checks.

[evidence.json](evidence.json) records exact Git source/tree, artifact IDs/digests and all measured case results;
[delivery.json](delivery.json) records each successfully saved file's checksum. [Runtime hashes](runtime-sha256.json)
demonstrate the shader body stayed unchanged. Screenshots are actual hosted Chromium,
with the app's real renderer; they are not generated mockups. Original artefact archives are retained with the delivery.

To reproduce, use the existing pinned browser environment and the commands/workflow in
[the initial audit instructions](../2026-10-31-design/README.md). The same `ui.browser.mjs` now includes all 82 checks;
the full 143-check sequence remains in [.github/workflows/pocket-camera.yml](../../../.github/workflows/pocket-camera.yml).
MCP installation and the generated-image cycle remain in [MCP.md](../../MCP.md).

Inspect phone/iPad Frame before/after, landscape Paper controls, the category strip, all three short-screen Look
controls, enlarged text, and MCP before/after/export. Scrollable rails preserve full access to individual controls;
the screenshots do not promise every control fits simultaneously. Physical devices, installed MCP setup and AR remain open.
