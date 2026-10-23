# Third city island — planning handover

23 October 2026. Branch: `codex/third-city-island-plan`; base main inspected at
`db8153ce92d55e475ce6a4f8f63357b100e6ee7d`. Planning commit: `811da7b9021930f5b270527eba8321fb362b8f31`.
Review: [PR #374](https://github.com/nj22az/nj22az.github.io/pull/374), open and unmerged.
The World guard and Linux console acceptance were in progress at handover; no CI pass is claimed.

**Owner priority, 23 October 2026:** making Minato island impeccable and immersive is priority 1. The third city island is low priority and deferred. Retain this research and proposal for later; do not begin further city design, prototyping or implementation unless the owner explicitly reprioritises it.

## Request and delivered scope

The owner requested adding <https://github.com/mrdoob/slop-newyork/> to the Johansson World repository and
planning a third city island based on it and New Yokosuka.

- Added [the pinned source assessment](../docs/research/slop-newyork.md), including concrete source paths,
  current-engine comparisons, code/data provenance and measured-evidence boundaries.
- Registered the reference in root `CLAUDE.md`, alongside the existing New Yokosuka reference.
- Added [the city proposal](THIRD-CITY-ISLAND-2026-10-23.md), with district roles, approximate dimensions,
  a [zoning schematic](../docs/third-city-island-concept.svg), complete-first-block delivery phases,
  transport/save work, staffing, region loading and verification targets.
- Added this handover to the root index without replacing the current World handovers.

This is a review branch, not merged or published at handover time. No external code, geodata, assets or dependencies
were imported. No gameplay, renderer, saves, ferry route, crew or cast assignments changed. The island's dimensions,
name and contents are proposals, not established canon. Existing Minato and Kitano-jima remain the reference points.

## Evidence and validation

Inspected Slop New York commit `9c39d20d2aa7ea23da71384aafee479c0e9d6144`: README, MIT licence, entry import map,
renderer, culling, road graph and traffic. Rechecked New Yokosuka's current README; reused the existing 19 October
measurements with their date and limitations. Read root and World instructions, latest applicable indexed World
handover and the earlier World notes it requires. Checked current loading, section batching, ferry and ground code.

Local validation passed: 28 local Markdown link targets, SVG XML parsing, SVG raster rendering and visual review,
and `git diff --check`. Gameplay, cloud boot, device performance and visual acceptance
are not tested by this planning change. The schematic depicts the proposal, not an implemented game screenshot.

## Next concrete action

Return to the current Minato quality and immersion work. The previously proposed city CAD/site-plan task is deferred, along with all subsequent city phases. Preserve the reference material for later.

Priority update validation: checked the four documentation edits against the owner's instruction. No runtime changes or gameplay tests. PR #374 remains open and unmerged; its description identifies the proposal as deferred.
