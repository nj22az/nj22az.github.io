# Handover: the izakaya to walk round, 30 October 2026

**State: stopped at the owner's request** ("Stop and update handover", 30 October 2026, after they were shown the
screenshots). Partial work, on branches only: nothing merged, nothing on the live site, the page linked from nowhere.

The owner, 29 October 2026, of the studio's Blender still of Johansson, Thao and Thuận toasting at Minato: "Can this be
added as an explorable 3d scene on my website ? In this quality". To a baked scene on its own page: "Yes".

## Where it is

| Repo | Branch | Head | What |
|---|---|---|---|
| `nj22az/nj22az.github.io` | `claude/quirky-hamilton-buam44` | `fb3712eef` | `izakaya/`: the page (`index.html`, `izakaya.js`, `izakaya.css`, `vendor/`, `preview.jpg`) and the export (`scene.gltf`/`.bin`, `live.gltf`/`.bin`, `walk.json`, `tex/`, `tex-half/`) |
| `nj22az/jojo` | `claude/quirky-hamilton-buam44` | `3e3815b` | `3d/cast/web_izakaya.py` (`prep`, `layout`, `bake`, `export`); `3d/izakaya-web/` (`progress.md`: the design and every fault found and fixed; `checks.md`; `screens/` shown to the owner) |

Not in Git: the work files in `jojo/3d/cast/renders/izakaya-web/` (2.8 GB: `prep.blend`, `layout.blend`, the kept bake
passes `bake/*.npy`). They lived only in this session's container. A new session makes them again: `prep`, `layout`,
`bake --samples 128` (about three hours on four CPUs), `export`. The one hand patch made to `layout.blend` (the bottles'
colour attribute) is now in the code (`name_colours`, called by `join`), so a fresh run needs none.

To look at it: check out the branch, run `python3 -m http.server 8000` at the repo's root, open
`http://localhost:8000/izakaya/` (`?half` or `?full` forces the texture size; `?audit` gives the checks a handle).

## How it works (short; the full account is in the studio's `progress.md`)

Cycles bakes every surface of the still's staged scene into atlases (two 4096, one 2048 for the room; a 2048 each for
the three; 1024 for Thuận's hands; 2048 for the marks), through the still's colour management (AgX, Medium High
Contrast, exposure 0.2). The page (three.js r170, the site's copy) draws them unlit. The jugs' glass and beer are
drawn live: a reflection cube where each jug stands, the glass at an IOR of 1.05 (the page blends in screen values),
the beer a glow fitted on the still per jug plus 12 % of what is behind it. A walk grid keeps a visitor out of the
counter, the stools, the walls and the three.

## Checks actually run

- The opening view against the still at 2400x1350: the walls, faces and the shop curtain within one or two levels of
  the still. The TV's glare and the worktop's sheen match since the room's gloss is baked as the still's camera sees it.
- Ten views in headless Chromium (software WebGL): load 1.9 s locally, 18 draw calls, 775,657 triangles, 11.3 MB, no
  console errors. Walk: two seconds of W from the start stop at the worktop; a place past the counter is refused.
- Phone size in Chromium (390x844, touch, 3x): the half-size textures load (6.5 MB), the controls fit, no errors.
- A separate review (shot-checker) of the ten views. Each finding was checked against the still, or against the staged
  scene rendered through the still's look from the same camera (behind the three, the aisle, the counter's end, the
  ceiling, close by Johansson). How each was settled: the studio's `checks.md`.
- **Not run:** a real phone (iPhone or Android), Safari, the frame rate on any real GPU.

## Open problems

1. **Close-up sharpness.** Textures are coarse where one can walk close: the back bar's labels from the kitchen aisle,
   the green kitchen through its door, the small print on the sign over the window and on the posters. Texels are
   planned per object (the back bar's from its median distance, about 2 m), and the opening view gets 2.7 of the
   still's pixels a texel. The fix is a texel plan per island and the whole bake again (about three hours). The
   owner's decision.
2. Faint lines between the ceiling's tiles, about 1 % (two levels in 255).
3. A faint warm rim at Thao's index fingertip seen from behind; a small light patch on one lamp shade.
4. Textures at full size are 55.6 M texels, over the 45 M set for the task (a phone loads the half size: 13.9 M).
5. In the models, so the game shows them too: the fold under Johansson's chin (four attempts, studio `progress.md`),
   the streaked flower on the back of his shirt (in his texture), the dark band inside Thao's hair. A task of their
   own in `game_meshy.py`.
6. The marks' (decals') atlas is only 45 % used.

## Next actions (waiting on the owner)

1. The owner looks at the page and says whether it goes on the live site (`main`) and where it is linked from.
2. Whether to plan the texels per island and bake again for sharper close-ups.
3. Whether to take on the chin and the shirt in the models.
