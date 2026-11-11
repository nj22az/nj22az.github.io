"""The docks, inked in the manner of the Johansson Animation Studios seal: white paper, black line,
solid black accents. Three scrolling layers (far, mid, near) that tile seamlessly, plus a still sky.

Everything here has a reason to be on a quay: bollards and rope to moor to, lamps to work by, crates,
barrels and fish boxes waiting for a boat, a lifebuoy by the water, and the seal's own anchor and
propeller, landed for repair.
"""
import math
from PIL import Image, ImageDraw

W, H = 1920, 1080
SS = 2
BLACK, WHITE = (0, 0, 0, 255), (255, 255, 255, 255)
HORIZON = 560
QUAY = 840          # far edge of the quay deck
GROUND = 965        # where he walks
NEAR_W, MID_W, FAR_W = 7840, 3920, 1960


class Art:
    def __init__(self, w, h=H):
        self.w, self.h = w, h
        self.img = Image.new('RGBA', (w * SS, h * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def _p(self, pts):
        return [(x * SS, y * SS) for x, y in pts]

    def _prim(self, prim, grow, col):
        k = prim[0]
        if k == 'poly':
            pts = self._p(prim[1])
            self.d.polygon(pts, fill=col)
            if grow:
                self.d.line(pts + pts[:2], fill=col, width=round(2 * grow * SS), joint='curve')
        elif k == 'circ':
            (x, y), r = prim[1], prim[2]
            rx = r if not isinstance(r, tuple) else r[0]
            ry = r if not isinstance(r, tuple) else r[1]
            self.d.ellipse([(x - rx - grow) * SS, (y - ry - grow) * SS, (x + rx + grow) * SS, (y + ry + grow) * SS], fill=col)
        elif k == 'rect':
            x0, y0, x1, y1 = prim[1:5]
            self._prim(('poly', [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]), grow, col)
        elif k == 'hose':
            self.line(prim[1], 2 * (prim[2] + grow), col)

    def blob(self, prims, lw=12, fill=WHITE):
        """Filled shapes with one outline round their union."""
        if prims and not isinstance(prims[0], tuple):
            prims = [prims]
        for p in prims:
            self._prim(p, lw, BLACK)
        for p in prims:
            self._prim(p, 0, fill)

    def solid(self, prim, col=BLACK):
        self._prim(prim, 0, col)

    def line(self, pts, lw=12, col=BLACK):
        p = self._p(pts)
        self.d.line(p, fill=col, width=max(1, round(lw * SS)), joint='curve')
        r = lw * SS / 2
        for x, y in (p[0], p[-1]):
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=col)

    def arc(self, c, rx, ry, a0, a1, lw=12, n=24):
        self.line([(c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
                    c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)], lw)

    def done(self):
        return self.img.resize((self.w, self.h), Image.LANCZOS)


def ell(c, rx, ry, n=36, a=0.0):
    ca, sa = math.cos(a), math.sin(a)
    out = []
    for i in range(n):
        x, y = rx * math.cos(2 * math.pi * i / n), ry * math.sin(2 * math.pi * i / n)
        out.append((c[0] + x * ca - y * sa, c[1] + x * sa + y * ca))
    return out


def waves(a, x0, x1, rows, size, lw, seed):
    """Little ticks of swell; `seed` only staggers them."""
    for j, y in enumerate(rows):
        step = size * 5.2
        x = x0 + ((j * 0.37 + seed) % 1) * step
        while x < x1 - size * 2:
            a.arc((x, y), size, size * 0.45, 200, 340, lw)
            a.arc((x + size * 1.9, y), size, size * 0.45, 200, 340, lw)
            x += step


# ---- sky -----------------------------------------------------------------------------------------
SUN = (300, 170)


def sun(pump=0.0):
    """The sun has a face, as suns did then, and its rays breathe in and out on the beat (pump 0..1).
    A 340 px square to be centred on SUN."""
    a = Art(340, 340)
    c = (170, 170)
    a.blob(('circ', c, 66), 9)
    for i in range(12):
        t = i * math.pi / 6
        r1 = 108 + 22 * (pump if i % 2 == 0 else 1 - pump)
        a.line([(c[0] + 92 * math.cos(t), c[1] + 92 * math.sin(t)), (c[0] + r1 * math.cos(t), c[1] + r1 * math.sin(t))], 9)
    for dx in (-22, 20):                                   # pie eyes
        a.solid(('circ', (c[0] + dx, c[1] - 12), (9, 15)))
        a.solid(('poly', [(c[0] + dx + 1, c[1] - 12), (c[0] + dx + 12, c[1] - 19), (c[0] + dx + 12, c[1] - 7)]), WHITE)
    a.arc((c[0], c[1] + 8), 34, 26, 20, 160, 7)
    a.arc((c[0] - 34, c[1] + 16), 7, 7, 200, 330, 5); a.arc((c[0] + 34, c[1] + 16), 7, 7, 210, 340, 5)
    return a.done()


def note(kind, size=120):
    """A whistled note, inked: 'one' is a quaver, 'two' a beamed pair."""
    a = Art(size, size)
    lw = 7
    if kind == 'one':
        a.solid(('poly', ell((44, 92), 19, 13, a=-0.4)))
        a.line([(60, 88), (60, 26)], lw)
        a.line([(60, 26), (82, 40), (86, 60)], lw)
    else:
        for x, y in ((30, 94), (80, 84)):
            a.solid(('poly', ell((x, y), 17, 12, a=-0.4)))
            a.line([(x + 15, y - 4), (x + 15, y - 60)], lw)
        a.line([(45, 32), (95, 22)], 13)
    return a.done()


def cloud(a, x, y, s=1.0, lw=8):
    a.blob([('circ', (x, y), 46 * s), ('circ', (x + 60 * s, y - 22 * s), 56 * s), ('circ', (x + 130 * s, y - 4 * s), 44 * s),
            ('circ', (x + 180 * s, y + 10 * s), 30 * s), ('rect', x - 20 * s, y + 6 * s, x + 190 * s, y + 38 * s)], lw)


# ---- far: the bay --------------------------------------------------------------------------------
def far():
    a = Art(FAR_W)
    cloud(a, 120, 250, 1.0)
    cloud(a, 760, 150, 1.25)
    cloud(a, 1450, 290, 0.85)
    lw = 7
    # headland
    hill = [(60, HORIZON)] + [(60 + i * 20, HORIZON - 70 * math.sin(math.pi * i / 30) - 26 * math.sin(math.pi * i / 7.5) ** 2) for i in range(1, 30)] + [(660, HORIZON)]
    a.blob(('poly', hill), lw)
    for x, s in ((230, 1.0), (330, 1.3), (430, 0.9)):               # a few pines
        a.solid(('poly', [(x, HORIZON - 70 * s), (x - 16 * s, HORIZON - 28 * s), (x + 16 * s, HORIZON - 28 * s)]))
        a.line([(x, HORIZON - 30 * s), (x, HORIZON - 14 * s)], 5)
    # steamer
    x, y = 1010, HORIZON
    a.blob(('rect', x + 60, y - 62, x + 190, y - 30), lw)
    a.blob(('rect', x + 108, y - 112, x + 142, y - 62), lw)
    a.solid(('rect', x + 108, y - 100, x + 142, y - 82))
    a.blob(('poly', [(x - 10, y - 36), (x + 300, y - 36), (x + 270, y + 4), (x + 20, y + 4)]), lw, BLACK)
    for i in range(4):
        a.solid(('circ', (x + 82 + i * 28, y - 46), 6))
    a.line([(x + 250, y - 36), (x + 250, y - 96)], 5)
    for i, (dx, dy, r) in enumerate(((120, -140, 16), (100, -176, 22), (66, -212, 28), (20, -240, 34))):
        a.blob(('circ', (x + dx, y + dy), r), lw)
    # lighthouse on its rock
    x = 1650
    a.blob(('poly', [(x - 120, HORIZON), (x - 86, HORIZON - 34), (x - 30, HORIZON - 50), (x + 40, HORIZON - 46), (x + 96, HORIZON - 24), (x + 124, HORIZON)]), lw, BLACK)
    tower = [(x - 30, HORIZON - 46), (x - 20, HORIZON - 190), (x + 20, HORIZON - 190), (x + 30, HORIZON - 46)]
    a.blob(('poly', tower), lw)
    for y0, y1 in ((-86, -118), (-150, -182)):
        k0, k1 = (-y0 - 46) / 144, (-y1 - 46) / 144
        a.solid(('poly', [(x - 30 + 10 * k0, HORIZON + y0), (x + 30 - 10 * k0, HORIZON + y0), (x + 30 - 10 * k1, HORIZON + y1), (x - 30 + 10 * k1, HORIZON + y1)]))
    a.blob(('rect', x - 28, HORIZON - 200, x + 28, HORIZON - 190), lw)
    a.blob(('rect', x - 16, HORIZON - 232, x + 16, HORIZON - 200), lw)
    a.blob(('poly', [(x - 24, HORIZON - 232), (x, HORIZON - 262), (x + 24, HORIZON - 232)]), lw, BLACK)
    for sgn in (-1, 1):
        for dy in (-12, 0, 12):
            a.line([(x + sgn * 34, HORIZON - 216 + dy * 0.4), (x + sgn * 74, HORIZON - 216 + dy * 1.6)], 5)
    a.line([(0, HORIZON), (FAR_W, HORIZON)], lw)
    waves(a, 0, FAR_W, (590, 624), 9, 4, 0.1)
    return a.done()


# ---- mid: the harbour water and what is moored in it ---------------------------------------------
def gull(a, x, y, lw=7):
    a.blob([('circ', (x, y), (26, 15))], lw)
    a.blob([('circ', (x + 26, y - 16), 12)], lw)
    a.solid(('poly', [(x + 36, y - 18), (x + 54, y - 12), (x + 36, y - 9)]))
    a.solid(('circ', (x + 28, y - 19), 2.6))
    a.solid(('poly', [(x - 22, y - 6), (x - 48, y - 12), (x - 26, y + 6)]))
    a.arc((x - 2, y - 2), 16, 9, 20, 160, 5)
    for dx in (-4, 8):
        a.line([(x + dx, y + 14), (x + dx, y + 28)], 4)


def piles(a, x, y, with_gull=True):
    lw = 9
    for dx, top in ((0, y - 150), (46, y - 120), (-40, y - 104)):
        a.blob(('rect', x + dx - 16, top, x + dx + 16, y + 6), lw)
        a.blob(('circ', (x + dx, top), (16, 6)), lw)
        a.solid(('rect', x + dx - 16, y - 34, x + dx + 16, y - 16))
    if with_gull:
        gull(a, x - 2, y - 180)


def fishing_boat(a, x, y):
    lw = 10
    a.line([(x + 150, y - 60), (x + 150, y - 260)], 9)                                   # mast
    a.blob(('poly', [(x + 156, y - 256), (x + 216, y - 240), (x + 156, y - 222)]), 7, BLACK)   # pennant
    a.line([(x + 150, y - 250), (x + 40, y - 70)], 4); a.line([(x + 150, y - 250), (x + 330, y - 74)], 4)
    a.blob(('rect', x + 190, y - 150, x + 300, y - 66), lw)                               # wheelhouse
    a.solid(('rect', x + 182, y - 164, x + 308, y - 148))
    a.blob(('circ', (x + 224, y - 110), 15), 7); a.blob(('circ', (x + 268, y - 110), 15), 7)
    hull = [(x - 20, y - 78), (x + 400, y - 78), (x + 372, y + 6), (x + 30, y + 6)]
    a.blob(('poly', hull), lw)
    a.solid(('poly', [(x - 2, y - 30), (x + 386, y - 30), (x + 372, y + 6), (x + 30, y + 6)]))
    a.line([(x - 14, y - 60), (x + 394, y - 60)], 5)
    a.blob(('circ', (x + 96, y - 34), 24), 8); a.blob(('circ', (x + 96, y - 34), 10), 6)   # tyre fender


def rowing_boat(a, x, y):
    lw = 9
    a.blob(('poly', [(x, y - 40), (x + 210, y - 40), (x + 186, y + 4), (x + 30, y + 4)]), lw)
    a.solid(('poly', [(x + 14, y - 14), (x + 198, y - 14), (x + 186, y + 4), (x + 30, y + 4)]))
    a.line([(x + 60, y - 40), (x + 150, y - 40)], 5)
    a.line([(x + 40, y - 54), (x + 190, y - 22)], 7)                                      # oar
    a.blob(('circ', (x + 200, y - 18), (16, 8), ), 6)


def buoy(a, x, y):
    lw = 9
    a.blob(('poly', [(x - 34, y), (x - 14, y - 86), (x + 14, y - 86), (x + 34, y)]), lw)
    a.solid(('poly', [(x - 27, y - 30), (x + 27, y - 30), (x + 20, y - 60), (x - 20, y - 60)]))
    a.line([(x, y - 86), (x, y - 118)], 7)
    a.blob(('circ', (x, y - 128), 12), 7, BLACK)


def mid():
    a = Art(MID_W)
    waves(a, 0, MID_W, (676, 732, 792), 15, 6, 0.6)
    fishing_boat(a, 420, 760)
    piles(a, 1420, 790)
    rowing_boat(a, 2020, 768)
    buoy(a, 2700, 742)
    piles(a, 3350, 800, with_gull=False)
    return a.done()


# ---- near: the quay ------------------------------------------------------------------------------
def bollard(a, x, y, rope=True):
    lw = 12
    a.blob(('rect', x - 26, y - 78, x + 26, y), lw)
    a.solid(('rect', x - 26, y - 26, x + 26, y - 8))
    a.blob([('circ', (x, y - 86), (46, 20))], lw)
    a.blob(('circ', (x, y + 2), (44, 10)), lw, BLACK)
    if rope:
        for i in range(3):
            a.arc((x, y - 50 - i * 9), 32, 9, 10, 170, 7)


def crate(a, x, y, w=150, h=120, mark=None):
    lw = 12
    a.blob(('rect', x, y - h, x + w, y), lw)
    a.line([(x + 22, y - h), (x + 22, y)], 6); a.line([(x + w - 22, y - h), (x + w - 22, y)], 6)
    a.line([(x + 22, y - h + 22), (x + w - 22, y - 22)], 6)
    if mark == 'anchor':
        small_anchor(a, x + w / 2, y - h / 2 + 4, 0.5, 8)


def small_anchor(a, x, y, s=1.0, lw=None):
    lw = lw or 12 * s + 3
    a.blob(('circ', (x, y - 78 * s), 15 * s), lw * 0.7)
    a.line([(x, y - 62 * s), (x, y + 70 * s)], lw)
    a.line([(x - 34 * s, y - 34 * s), (x + 34 * s, y - 34 * s)], lw)
    a.arc((x, y + 14 * s), 62 * s, 56 * s, 10, 170, lw)
    for sg in (-1, 1):
        a.solid(('poly', [(x + sg * 78 * s, y - 6 * s), (x + sg * 44 * s, y + 20 * s), (x + sg * 74 * s, y + 36 * s)]))


def barrel(a, x, y, s=1.0):
    lw = 12
    a.blob(('poly', [(x - 44 * s, y), (x - 56 * s, y - 62 * s), (x - 44 * s, y - 124 * s), (x + 44 * s, y - 124 * s), (x + 56 * s, y - 62 * s), (x + 44 * s, y)]), lw)
    for yy, wd in ((y - 26 * s, 51), (y - 98 * s, 51)):
        a.solid(('rect', x - wd * s, yy - 7 * s, x + wd * s, yy + 7 * s))
    a.blob(('circ', (x, y - 124 * s), (44 * s, 10 * s)), lw * 0.75)


def lamp(a, x, y):
    lw = 12
    a.blob(('poly', [(x - 30, y), (x - 18, y - 60), (x + 18, y - 60), (x + 30, y)]), lw, BLACK)
    a.blob(('rect', x - 7, y - 520, x + 7, y - 60), lw)
    a.arc((x + 60, y - 520), 60, 60, 180, 290, 26)
    a.arc((x + 60, y - 520), 60, 60, 181, 289, 6, 24) if False else None
    a.blob(('circ', (x, y - 300), (14, 8)), 9, BLACK)
    lx, ly = x + 84, y - 572
    a.blob(('poly', [(lx - 34, ly), (lx + 34, ly), (lx + 22, ly + 14), (lx - 22, ly + 14)]), 10, BLACK)
    a.blob(('poly', [(lx - 22, ly + 14), (lx + 22, ly + 14), (lx + 30, ly + 66), (lx - 30, ly + 66)]), 10)
    a.line([(lx, ly + 14), (lx, ly + 66)], 5)
    a.blob(('circ', (lx, ly + 72), (20, 6)), 8, BLACK)


def lifebuoy(a, x, y):
    lw = 12
    a.blob(('rect', x - 9, y - 190, x + 9, y), lw)
    a.blob(('rect', x - 40, y - 6, x + 40, y + 4), 9, BLACK)
    c = (x, y - 190)
    a.blob(('circ', c, 62), lw)
    for q in range(4):
        t0 = q * 90 + 25
        pts = [(c[0] + 62 * math.cos(math.radians(t0 + i * 8)), c[1] + 62 * math.sin(math.radians(t0 + i * 8))) for i in range(6)]
        pts += [(c[0] + 26 * math.cos(math.radians(t0 + i * 8)), c[1] + 26 * math.sin(math.radians(t0 + i * 8))) for i in range(5, -1, -1)]
        a.solid(('poly', pts))
    a.blob(('circ', c, 26), lw)


def propeller(a, x, y, s=1.0):
    """The seal's three-bladed propeller, landed and leant against a box."""
    lw = 12
    for k in range(3):
        t = math.radians(-90 + k * 120 + 14)
        c = (x + 62 * s * math.cos(t), y + 62 * s * math.sin(t))
        a.blob(('poly', ell(c, 56 * s, 34 * s, a=t + 0.5)), lw, BLACK)
    a.blob(('circ', (x, y), 26 * s), lw)
    a.solid(('circ', (x, y), 9 * s))


def fish_boxes(a, x, y):
    lw = 12
    for i, (dx, dy) in enumerate(((0, 0), (10, -52), (-6, -104))):
        a.blob(('rect', x + dx, y + dy - 44, x + dx + 170, y + dy), lw)
        a.line([(x + dx + 8, y + dy - 22), (x + dx + 162, y + dy - 22)], 6)
    # two tails over the rim of the top box
    for dx in (40, 96):
        a.blob(('poly', [(x + dx, y - 148), (x + dx - 20, y - 190), (x + dx + 6, y - 176), (x + dx + 30, y - 192), (x + dx + 20, y - 148)]), 9, BLACK)


def rope_coil(a, x, y):
    for i in range(4):
        a.blob(('circ', (x, y - i * 12), (58 - i * 5, 17 - i)), 9)
    a.solid(('circ', (x, y - 38), (26, 7)))


def near():
    a = Art(NEAR_W)
    # the bull rail along the quay edge, on its chocks
    for x in range(70, NEAR_W, 280):
        a.blob(('rect', x - 22, QUAY - 26, x + 22, QUAY), 10, BLACK)
    a.blob(('rect', -40, QUAY - 56, NEAR_W + 40, QUAY - 26), 11)
    for x in range(0, NEAR_W, 560):
        a.line([(x + 200, QUAY - 41), (x + 330, QUAY - 41)], 4)
    # deck: one bold edge, plank seams, a few nail heads
    a.solid(('rect', -40, QUAY, NEAR_W + 40, H + 20), WHITE)
    a.line([(-40, QUAY), (NEAR_W + 40, QUAY)], 12)
    for i, x in enumerate(range(0, NEAR_W, 140)):
        a.line([(x + 24, QUAY + 6), (x - 30, H + 10)], 5)
        for yy in (QUAY + 40, GROUND + 60):
            a.solid(('circ', (x + 50 - (yy - QUAY) * 0.225, yy), 4.5))
        if i % 3 == 0:
            a.line([(x + 62, QUAY + 96 + (i % 5) * 20), (x + 110, QUAY + 96 + (i % 5) * 20)], 4)
    return a.done()


PROP_BASE = 898                                     # things stand on the quay behind his path


def props():
    """What stands on the quay, on its own layer so that it can bounce to the beat."""
    a = Art(NEAR_W)
    base = PROP_BASE
    bollard(a, 420, base)
    crate(a, 980, base, 160, 124, 'anchor'); crate(a, 1150, base, 130, 96); crate(a, 1040, base - 124 - 12, 130, 100)
    lamp(a, 1800, base)
    barrel(a, 2420, base); barrel(a, 2540, base, 0.86)
    rope_coil(a, 2990, base + 4)
    bollard(a, 3380, base)
    crate(a, 3960, base, 170, 130)
    small_anchor(a, 4180, base - 96, 1.25, 17)
    lifebuoy(a, 4840, base)
    fish_boxes(a, 5380, base)
    propeller(a, 5700, base - 92, 0.95)
    lamp(a, 6300, base)
    crate(a, 6860, base, 150, 116, 'anchor'); barrel(a, 7080, base)
    bollard(a, 7520, base, rope=False)
    return a.done()


if __name__ == '__main__':
    import sys
    from pathlib import Path
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    for name, fn in (('sun', sun), ('far', far), ('mid', mid), ('near', near), ('props', props)):
        fn().save(out / f'dock-{name}.png')
