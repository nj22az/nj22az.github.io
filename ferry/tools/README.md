# Tools for looking

Small helpers used while building her; none is part of the page or of the build's gate.

| File | What | How |
|---|---|---|
| `still.py` | A Cycles still of the built ship from a place given in the ship's terms (metres from the transom, to port, above the keel) | `blender -b <built.blend> -P ferry/tools/still.py -- --out x.png --eye 51.2,5.1,14.0 --aim 52.0,5.9,13.6 [--lens 35] [--samples 32] [--size 1300x900] [--lamp yard,x,h --watts 800]` (inside a room it needs `--lamp`: no light gets in otherwise) |
| `onfoot-wing.cjs` | The page itself, on foot on the port bridge wing, as an upright tablet shows it; opens the hose box | `node ferry/tools/onfoot-wing.cjs /tmp/out` (site served on port 8765) |
| `onfoot-pantry.cjs` | The page on foot at the pantry, its doors shut and open | `node ferry/tools/onfoot-pantry.cjs /tmp/out` |
| `card.cjs`, `card_crop.py` | The homepage card's picture: her whole length from the bow quarter, the page's chrome hidden, drawn on the machine's own graphics card when Chromium can reach it (it says which it got) | `node ferry/tools/card.cjs shot.png`, then `python3 ferry/tools/card_crop.py shot.png assets/images/ferry/chisum-card.webp` |
| `svgshot.cjs` | A picture of a yard drawing (SVG), whole or a part at twice the size | `node ferry/tools/svgshot.cjs sheet.svg out.png [x y w h]` |

The `onfoot` and `svgshot` helpers start Chromium with software drawing, as the page checks do: they prove a thing is there and works, not how it
looks on a real graphics card.
