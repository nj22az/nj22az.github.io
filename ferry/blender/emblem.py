"""
The line's mark, as a shape: a J in a ring. No Blender here.

    python3 ferry/blender/emblem.py          draws the page's icons (ferry/icon-180.png, icon-192.png, icon-512.png)

The owner, 11 November 2026: "a big J similar to Jonsson lines ships but my own thing", and of the first icon, whose J sat
low and to one side: "The Johansson emblem with the J needs to be aligned and pushed on the chimneys". The J is drawn, not
set in type: a stem, a hook to the left at its foot and a bar to the left at its head, all of one weight. It is put in the
middle of the ring by its own outline. blender/livery.py paints this shape on the funnels; `icons` draws it for the page.
The measures are metres on the funnel: the ring is 0.62 m across.
"""
from math import cos, sin, pi

RING = (0.265, 0.31)                 # the ring's inner and outer radius
WEIGHT = 0.075                       # the J's stroke
STEM = (0.165, -0.07)                # the stem's head and the height of the hook's middle, before it is centred
HOOK = 0.075                         # the hook's radius, to the middle of the stroke
BAR = (0.15, 0.065)                  # the bar at the head: how far it runs to the left of the stem, and its depth
TEAL, WHITE = (47, 111, 116), (244, 244, 240)


def letter():
    """The J as four-cornered pieces that meet edge to edge, its middle at the origin."""
    w = WEIGHT / 2
    x = HOOK                                                       # the stem's middle, with the hook's middle at 0
    quads = [[(x - w, STEM[1]), (x + w, STEM[1]), (x + w, STEM[0]), (x - w, STEM[0])],
             [(x - w - BAR[0], STEM[0] - BAR[1]), (x - w, STEM[0] - BAR[1]), (x - w, STEM[0]), (x - w - BAR[0], STEM[0])]]
    n = 16
    for k in range(n):
        a0, a1 = -pi * k / n, -pi * (k + 1) / n
        quads.append([((HOOK - w) * cos(a1), STEM[1] + (HOOK - w) * sin(a1)), ((HOOK + w) * cos(a1), STEM[1] + (HOOK + w) * sin(a1)),
                      ((HOOK + w) * cos(a0), STEM[1] + (HOOK + w) * sin(a0)), ((HOOK - w) * cos(a0), STEM[1] + (HOOK - w) * sin(a0))])
    xs = [p[0] for q in quads for p in q]
    ys = [p[1] for q in quads for p in q]
    mx, my = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    return [[(px - mx, py - my) for px, py in q] for q in quads]


def ring(n=64):
    out = []
    for k in range(n):
        a0, a1 = 2 * pi * k / n, 2 * pi * (k + 1) / n
        out.append([(RING[0] * cos(a0), RING[0] * sin(a0)), (RING[1] * cos(a0), RING[1] * sin(a0)),
                    (RING[1] * cos(a1), RING[1] * sin(a1)), (RING[0] * cos(a1), RING[0] * sin(a1))])
    return out


def mark():
    """The whole mark: four-cornered pieces in (u to the right, v up), metres, the ring's middle at the origin."""
    return ring() + letter()


def icons():
    import os
    from PIL import Image, ImageDraw
    here = os.path.dirname(os.path.abspath(__file__))
    for size in (180, 192, 512):
        big = size * 4                                             # drawn four times as large and reduced, for smooth edges
        im = Image.new('RGB', (big, big), TEAL)
        d = ImageDraw.Draw(im)
        k = big * 0.36 / RING[1]
        for q in mark():
            d.polygon([(big / 2 + u * k, big / 2 - v * k) for u, v in q], fill=WHITE)
        im.resize((size, size), Image.LANCZOS).save(os.path.join(here, '..', f'icon-{size}.png'), optimize=True)
        print(f'icon-{size}.png')


if __name__ == '__main__':
    icons()
