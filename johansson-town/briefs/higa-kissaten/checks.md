# Checks: a kissaten in the shut Higa Liquor

Run in the cloud session of 30 October 2026 (Node 22.22). Nothing in the game was changed, so no game tests were run.

| Check | Command | Result |
| --- | --- | --- |
| The Meshy key is in the environment | a shell test that it is non-empty (the value never printed) | set |
| Meshy's CLI and its API origin | `npm exec --yes --package=meshy-cli@0.4.0 -- meshy doctor …` | CLI 0.4.0; credential from the environment; `api.meshy.ai` |
| The key works (one free call) | `meshy balance --output-schema v1 --format json` | ok, 2,753 credits |
| What a model costs (calls nothing) | `meshy make "…" --dry-run`, a prompt and an image URL | text: preview 20 + refine 10 = 30; image, textured: 30 |
| Every other price | <https://docs.meshy.ai/en/api/pricing>, read 30 October 2026 | table in `progress.md` |
| The map | `git grep -i -E "higa[ -_]?liquor|higaLiquor|higa-saketen|比嘉酒店"` (127 files), then the shut shop in other words ("liquor shop", "keeps only the bath", "the shut shop", 酒屋), the guide, the town papers, the CI guard list, and the studio repo `jojo` | `progress.md`, sections A–D |
| The cast's mornings | a script calling `canonicalDay` for every resident, 06:30–10:00 each half hour, on a Monday, a Saturday and a Sunday | free and near: Tetsuo, Officer Mori, Ms Ganaha, Ms Uezu on her weeks off; Grandmother Higa at Johansson Mart from 09:00 on Saturdays |

Not done: no Meshy generation (waiting for the owner), no build, no CI guard run (no code changed).
