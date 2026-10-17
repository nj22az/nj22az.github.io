# Vy’s Psst mascot

Rendered with the same Johansson Studio portrait pipeline and settings recorded for `johansson-tada` in `manifest.json`: three-quarter view, excited expression (outlined white eyes and irises), transparent background, 768 px source. Vy uses her existing game recipe and the existing Shush pose. The avatar builder supplies the game’s cel materials and ink outlines. No replacement model or generated artwork is used.

Reproduce with Playwright installed and this website served locally:

```
WORLD_PREVIEW=http://127.0.0.1:5191 node scripts/render-vy-whisper.cjs
```

The script crops transparent margins and fits the render into 368 × 512 pixels, then saves WebP with alpha. The homepage loads only the exported cutout, without loading Studio or a 3D renderer.
