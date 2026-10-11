# Johansson logo

A signature "Johansson" with a spark that flies an arc over the name, leaving a tapered line and a trail of
twinkles; the name appears behind it and the spark lands as a small star. The letters are outlines of the Satisfy
font (Apache-2.0), so no font is needed. Animated files play once in about 3 s, then hold;
`prefers-reduced-motion` shows the finished logo.
Preview and downloads: `/brand/`.

| File | Use |
|---|---|
| `johansson-{signature,mark}[-on-dark][-animated].svg` | Web, print, slides. `-on-dark` for dark backgrounds |
| `johansson-logo.js` | `<johansson-logo layout="signature" dark replay static>` (or `layout="mark"`) web component, coloured by `--jl-ink`, `--jl-star`, `--jl-glow` |
| `export/*.mp4`, `*.gif` | Video intros (night blue or cream), social posts, email |
| `export/*-alpha.webm` | Transparent overlays (intro, lower third) |
| `export/*.png` | Still images |

Do not edit the SVGs by hand. Change `tools/brand/build-logo.mjs`, then run:

```bash
NODE_PATH=$(npm root -g) node tools/brand/build-logo.mjs     # needs opentype.js
NODE_PATH=$(npm root -g) node tools/brand/export-logo.cjs   # PRORES=1 for .mov with alpha
```

## 29 styles

`styles/` holds the name in 29 animated styles, each after a Japanese design system from
[awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp) and choreographed with the
[pixel2motion](https://github.com/nolangz/pixel2motion) method. Preview: `/brand/styles/`. `styles/MOTION_SPEC.md` lists each
style's mood words, motion preset, reveal pattern and principles.

| File | Use |
|---|---|
| `styles/NN-<slug>.svg` | Animated, with its background plate (800 × 450) |
| `styles/NN-<slug>-still.svg` | The finished logo, same picture as the animation's last frame |
| `styles/export/NN-<slug>.mp4`, `.png` | 1080p video and still |
| `styles/export/johansson-29-styles-reel.mp4` | All 29 in a row |

```bash
NODE_PATH=$(npm root -g) node tools/brand/build-styles.mjs           # SVGs, styles.json, MOTION_SPEC.md (fetches font subsets once)
NODE_PATH=$(npm root -g) node tools/brand/qa-styles.cjs <out-dir>    # frames + final frame == still check
NODE_PATH=$(npm root -g) node tools/brand/export-styles.cjs          # MP4s, PNGs and the reel
```

## The final three

`final/` holds the three chosen logos (Precision, Monolith, Seal), each built letter by letter like a
studio ident: letters cut into slices that lock in from alternating sides, kana written stroke by stroke,
one passing light, a slow camera push and one impact beat. Preview: `/brand/final/`.

```bash
NODE_PATH=$(npm root -g) node tools/brand/build-final.mjs
NODE_PATH=$(npm root -g) SET=final node tools/brand/qa-styles.cjs <out-dir>
NODE_PATH=$(npm root -g) SET=final node tools/brand/export-styles.cjs
```
