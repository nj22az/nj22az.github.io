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

## The Meshy audit (later the same day)

| Check | Command | Result |
| --- | --- | --- |
| Nine shapes, judged on Meshy's free preview renders before colour was paid for | `meshy text-to-3d create` (smart topology, `meshy-t2.5`), `wait`, `download --asset thumbnail.primary` | 6 kept, 3 rejected (siphon, morning set, fortune machine) |
| Six coloured | `meshy text-to-3d create --mode refine` (`enable_pbr false`, 2k) | all SUCCEEDED; 1,548–3,100 triangles, one 2048 px colour map each |
| Credits | `consumed_credits` on each task, and `meshy balance` before and after | 9 × 5 + 6 × 10 = 105; 2,753 → 2,648 |
| The models load and render in World | `node tools/kissaten-meshy-look.mjs docs/qa/kissaten-meshy` (Chromium, swiftshader, the real town, cel and ink) | 8 photographs, no page errors; looked at, every pair |
| Side by side | the tool's photographs laid in pairs with Python (PIL), Meshy left, code right | `docs/qa/kissaten-meshy/pair-*.jpg` |
| Shrunk to 1024 px | `python3 tools/shrink-glb-textures.py` | 1.8–2.6 MB → 190–280 KB each; photographed again from the shrunk files, the same look |

The first photographs set the counter props 8 cm into the counter: the harness had the counter top at 0.95 m, but the
fitted interior stands on the 8 cm shop floor (`houses.js` 197). Corrected to floor + 0.95 and photographed again.

Not done: no build into the game, no CI guard run (no game code changed), no phone or real-GPU look.
