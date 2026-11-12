"""
card_crop.py shot.png card.webp: the homepage card's picture from card.cjs's shot. Finds her outline against the page's
backdrop, frames it at 1200 : 630 with a margin and writes a 1200 x 630 WebP (quality 84). Pillow and numpy; no Blender.
"""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(int)
H, W, _ = a.shape
# the backdrop changes down the page: each row's colour is taken from its two ends
bg = (a[:, :40].mean(1) + a[:, -40:].mean(1)) / 2
ys, xs = np.nonzero(np.abs(a - bg[:, None, :]).sum(2) > 40)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
w = max(x1 - x0, (y1 - y0) * 1200 / 630) * 1.12
h = w * 630 / 1200
if x1 - x0 > 0.97 * W and y1 - y0 > 0.97 * H:
    # Afloat (since 12 November 2026 the page opens on her at sea) the backdrop is the sea, not one colour, and her
    # outline cannot be found against it: card.cjs has already framed her box inside the shot, so the picture is the
    # shot's own middle, nine tenths of it.
    w, h = 0.9 * W, 0.9 * W * 630 / 1200
    x0, x1, y0, y1 = 0, W - 1, 0, H - 1
left = min(max(int(round((x0 + x1) / 2 - w / 2)), 0), W - int(w))
top = min(max(int(round((y0 + y1) / 2 - h / 2)), 0), H - int(h))
im.crop((left, top, left + int(w), top + int(h))).resize((1200, 630), Image.LANCZOS).save(out, 'WEBP', quality=84, method=6)
print(f'her outline {x0},{y0} to {x1},{y1} of {W} x {H}; framed {int(w)} x {int(h)} at {left},{top}; wrote {out}')
