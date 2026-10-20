# Inputs checked 20 October 2026

Owner: improve Studio as World's asset authoring tool; import/export GLB, stable selectable objects, snapping, undo,
agent tools, purpose/usage review and static support. Full animation is required as the eventual outcome. Owner then
identified the existing jojo/remotion pipeline and asked to reuse it and merge the old PRs onto current main.

Sources read: current website AGENTS.md, CLAUDE.md, johansson-town/AGENTS.md; jojo CLAUDE.md,
.claude/skills/long-task/SKILL.md, remotion/scripts/film.mjs, remotion/FILM.md, remotion/src/stage.ts,
remotion/src/Film.tsx, remotion/mcp/server.mjs, remotion/tools/sync-town.sh and town-studio/README.md.
The existing pipeline has animated blocking/gestures, camera paths/following, lip sync, fingerprinted retakes,
segmented rendering, collision checks and creator approval gates. Do not install a second film engine.

Scope of this integration: port #275/#277 feature diffs onto current main; preserve newer World/course/site changes;
add a shared purpose inventory, room support queries and a verified Sato Ramen support fix; export clean scene staging
for the existing film engine. Do not split repositories (owner's current ruling), remove residents/houses automatically,
claim a whole-island clearance, or claim a complete visual animation editor has been implemented.
