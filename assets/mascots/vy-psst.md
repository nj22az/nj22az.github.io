# Vy’s Psst mascot

Rendered from the owner-approved Vy default on 24 October 2026: Studio proportions, soft sculpted head, ink oval eyes, long fringe, striped tee with a layered vest and the authored panel skirt. The actual shared avatar and existing Shush pose are rendered through Johansson Studio, with an excited expression, three-quarter view and transparent background. No generated artwork is used.

Reproduce with Playwright installed:

```
TOWN_CHROMIUM_PATH=/path/to/chromium node scripts/render-vy-whisper.cjs
```

The script starts its own local preview unless WORLD_PREVIEW is supplied. It renders at 768 px, crops transparent margins and fits the character into 368 × 512 pixels, then saves WebP with alpha. The Linux Port website page loads this exported cutout without loading Studio or a 3D renderer.
