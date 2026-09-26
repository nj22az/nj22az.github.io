# JoJo Engineering Shorts

Vertical pixel-art Shorts (1080×1920) with the channel's teacher: a ship's electrician with a yellow hard hat, red beard, navy coverall and multimeter. No build step and no frameworks. Each video is drawn on a canvas, frame by frame, from a short script file.

| File | Purpose |
|---|---|
| `episodes/*.mjs` | One file per Short: hook, title, description, tags and beats (`draw(ctx, t)` plus the lines) |
| `index.mjs` | Publishing order |
| `engine.mjs` | Scene: ship bridge, hook banner, board, speech bubble, stamps, SRT captions. `BRAND` sets the channel name |
| `teacher.mjs` | The teacher sprite (talk, blink, point, multimeter) |
| `play.html` | Preview player: open `play.html?short=<id>`, scrub, and switch episodes |
| `check.mjs` | Checks reading speed (≤ 15 characters/s), overlaps, ≤ 60 s, hook at 0 s and metadata |
| `render.cjs` | Renders MP4 + cover PNG + `.srt` + upload sheet `.txt` into `video/` |
| `audio.py` | Chiptune loop, talk blips and beat clicks (Python standard library only) |

## Preview

```bash
python3 -m http.server 8765        # in the repo root
# open http://localhost:8765/jojo-engineering/shorts/play.html
```

## Render

Needs Playwright (installed globally) and ffmpeg.

```bash
node jojo-engineering/shorts/check.mjs
node jojo-engineering/shorts/render.cjs                 # all Shorts
node jojo-engineering/shorts/render.cjs amp-jack        # one Short
node jojo-engineering/shorts/render.cjs --no-talk       # music only, for your own voice-over
```

If ffmpeg isn't installed, `pip install imageio-ffmpeg` provides a binary. Point `FFMPEG=` at it.

## Voice-over workflow

1. Render with `--no-talk`, so the video has music and clicks but no blips.
2. Open `video/<id>.srt` as the script, and record each line at its timestamp (any DAW, or CapCut/DaVinci on top of the MP4).
3. Keep the music about 18 dB under your voice.

Your own voice matters for the YPP review (see `../STRATEGY.md`).

## A new Short

1. Copy an episode in `episodes/` and change `id`, `kicker`, `hook`, `title`, `desc`, `tags` and the beats.
2. Add it to `index.mjs`.
3. Run `check.mjs`, preview it in `play.html`, then render.

Rules: the question goes in the hook and the first line starts straight away. One idea per Short, and the takeaway is a stamp near the end. The last line loops back to the hook. Colours: blue for values, orange for warnings, red for what's unknown or wrong, green for the answer. Include one safety habit wherever it fits.
