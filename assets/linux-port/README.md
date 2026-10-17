# Vy’s Psst invitation

`vy-whisper.png` is a transparent render made with Johansson Studio’s agent portrait API (`avatar-creator/studio-api.js`). It uses the unchanged `recipeFor('Vy')` game asset, the existing `Shush` / “Shh!” pose, the `wink` expression and a front view. The avatar builder supplies the game’s cel materials and ink outlines. No generated artwork or replacement character model is used.

To reproduce with Playwright installed and the website served locally:

```
WORLD_PREVIEW=http://127.0.0.1:5191 node scripts/render-vy-whisper.cjs
```

The export is cropped to its alpha bounds and fitted within 264 × 400 pixels. The homepage only loads this 44 KB image; it does not load Studio or a 3D renderer.
