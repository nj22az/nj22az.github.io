# Johansson logo

A stamped ring with a J, and the name JOHANSSON, drawn as monoline pen strokes (no font needed).
Animated files draw themselves once in about 2 s, then hold; `prefers-reduced-motion` shows the finished logo.
Preview and downloads: `/brand/`.

| File | Use |
|---|---|
| `johansson-{horizontal,stacked,mark,wordmark}[-on-dark][-animated].svg` | Web, print, slides. `-on-dark` for dark backgrounds |
| `johansson-logo.js` | `<johansson-logo layout="…" replay static>` web component, coloured by `--jl-ink` / `--jl-accent` |
| `export/*.mp4`, `*.gif` | Video intros, social posts, email |
| `export/*-alpha.webm` | Transparent overlays (intro, lower third) |
| `export/*.png` | Still images |

Do not edit the SVGs by hand. Change `tools/brand/build-logo.mjs`, then run:

```bash
node tools/brand/build-logo.mjs
NODE_PATH=$(npm root -g) node tools/brand/export-logo.cjs   # PRORES=1 for .mov with alpha
```
