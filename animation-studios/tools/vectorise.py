"""Turn the cut pieces of the owner's drawing into a vector character.

Every piece in art/parts/ is traced: its silhouette, every black shape of ink and every white shape
inside the ink become closed curves. The curves are what gets animated: they bend, squash and turn
point by point, so nothing is a rigid picture any more.

    python3 tools/vectorise.py     # writes art/vector/sailor.json and art/vector/sailor.svg
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PARTS = ROOT / 'art' / 'parts'
OUT = ROOT / 'art' / 'vector'
SMOOTH = 2.2      # how far the staircase of the pixels is ironed out, in traced pixels
STEP = 3          # keep every third point


def loops_of(mask):
    """Every boundary of a boolean mask as a closed loop of pixel corners (x, y)."""
    m = np.pad(mask, 1)
    nxt = {}
    ys, xs = np.nonzero(m & ~np.roll(m, 1, 0));  [nxt.setdefault((x, y), []).append((x + 1, y)) for x, y in zip(xs, ys)]          # top
    ys, xs = np.nonzero(m & ~np.roll(m, -1, 1)); [nxt.setdefault((x + 1, y), []).append((x + 1, y + 1)) for x, y in zip(xs, ys)]  # right
    ys, xs = np.nonzero(m & ~np.roll(m, -1, 0)); [nxt.setdefault((x + 1, y + 1), []).append((x, y + 1)) for x, y in zip(xs, ys)]  # bottom
    ys, xs = np.nonzero(m & ~np.roll(m, 1, 1));  [nxt.setdefault((x, y + 1), []).append((x, y)) for x, y in zip(xs, ys)]          # left
    out = []
    while nxt:
        start = next(iter(nxt))
        loop, p = [], start
        while True:
            loop.append(p)
            ends = nxt[p]
            q = ends.pop()
            if not ends:
                del nxt[p]
            p = q
            if p == start:
                break
        out.append(np.array(loop, float) - 1.0)      # undo the padding
    return out


def area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * float(np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y))


def iron(p):
    """Smooth a closed loop (circular Gaussian) and thin it out."""
    n = len(p)
    r = int(SMOOTH * 3)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / SMOOTH) ** 2); k /= k.sum()
    ext = np.concatenate([p[-r:], p, p[:r]])
    sm = np.stack([np.convolve(ext[:, i], k, 'valid') for i in (0, 1)], 1)
    return sm[::STEP] if n >= 4 * STEP else sm


def trace(name, meta, up):
    im = Image.open(PARTS / f'{name}.png')
    ink = np.asarray(im.getchannel(0)) < 128
    solid = np.asarray(im.getchannel(1)) > 128
    ink &= solid
    x0, y0 = meta['origin']
    shapes = []
    for mask, kind in ((solid, 'body'), (ink, 'ink')):
        for lp in loops_of(mask):
            a = area(lp)
            if abs(a) < 30:
                continue                                  # a speck
            if kind == 'body' and a < 0:
                continue                                  # no see-through holes in him
            fill = 255 if kind == 'body' else (0 if a > 0 else 255)
            pts = iron(lp) / up + (x0, y0)
            shapes.append((abs(a), fill, pts))
    shapes.sort(key=lambda s: -s[0])                      # big shapes underneath, details on top
    return [dict(fill=f, pts=np.round(p, 2).tolist()) for _, f, p in shapes]


def svg(data):
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="690 395 300 330">',
           '<title>The Johansson sailor, traced from the owner\'s walk drawing</title>']
    for name in ('arm_far', 'foot_flat', 'foot_heel', 'torso', 'head', 'arm_near'):
        out.append(f'<g id="{name}">')
        for s in data[name]['shapes']:
            d = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in s['pts']) + ' Z'
            out.append(f'<path fill="{"#fff" if s["fill"] else "#000"}" d="{d}"/>')
        out.append('</g>')
    out.append('</svg>')
    return '\n'.join(out) + '\n'


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    cut = json.loads((PARTS / 'parts.json').read_text())
    data = {}
    for name, meta in cut['parts'].items():
        if name.startswith('head_'):
            continue                                      # faces are now drawn on the vector head
        data[name] = dict(shapes=trace(name, meta, cut['up']), **{k: meta[k] for k in ('pivot', 'heel', 'ball') if k in meta})
        print(name, len(data[name]['shapes']), 'shapes', sum(len(s['pts']) for s in data[name]['shapes']), 'points')
    (OUT / 'sailor.json').write_text(json.dumps(data, separators=(',', ':')) + '\n')
    (OUT / 'sailor.svg').write_text(svg(data))
