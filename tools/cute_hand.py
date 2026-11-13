"""The cute hand: how Pocket Camera's sticker friends and face cutouts are drawn.

The same hand as the icons and the frames (tools/draw-camera-icons.py, tools/draw-camera-cute-frames.py): flat colour,
round chunky shapes built from circles and ellipses, two tones of one colour and a pale third, dark only for a face. No
outline, no wobble, no shading. (The owner, 12 November 2026, of a first sheet of plain things: "Looks nice but a bit
too generic", "give them more personality"; then of a try at a wobbly ink line: "this is too ugly, you made icons
perfectly and frames perfectly I think you lost your art style?", "the characters can be flat", "like line and kakao
friends".) So the personality is in who is drawn and what they are up to, never in a rougher line: a small cast (frog,
duck, rabbit, cat, bear), each one soft round body with a face that means something and something to do. Nothing is
traced, nothing is a font and nobody else's character is here.

A Drawing keeps a list of what was drawn (flat shapes, round-ended lines) in a grid of 100, and can be

  * painted with Pillow, larger than kept, with a sticker's white edge (stickers), or
  * written as path data for the browser to draw at any size (the face cutouts of frames/cute.json).
"""
import importlib.util
import math
import re
from contextlib import contextmanager
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location('icons', ROOT / 'tools' / 'draw-camera-icons.py')
kit = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(kit)
rrect, circle, ellipse, poly, star, burst, heart, sparkle, drop, on, pt = (kit.rrect, kit.circle, kit.ellipse, kit.poly, kit.star,
                                                                             kit.burst, kit.heart, kit.sparkle, kit.drop, kit.on, kit.pt)

G = 100                     # the design grid
MARGIN = 20                 # room round it: a hat, a raised arm, the white edge
K = 11                      # pixels to a grid unit while painting
S = (G + 2 * MARGIN) * K
EDGE = 3.4                  # a sticker's white edge, in grid units

INK, WHITE, CREAM = '#263d39', '#ffffff', '#fbf7ec'
ROSE, PINK, BLUSH = '#ee6f8b', '#f9c2ce', '#f8a9b8'
SUN, BUTTER, AMBER = '#f6c343', '#fbe39a', '#e9a32b'
SKY, SEA, NAVY = '#bfe4f4', '#5fb3d8', '#3f77b5'
MINT, LEAF, GREEN = '#bfe9d4', '#58c28f', '#16815e'
LILAC, PLUM = '#d9c7f2', '#9a78d0'
CORAL, RED, DARK_RED = '#f49a7c', '#e4533f', '#c4402f'
WOOD, BARK = '#d8a56a', '#8a5a3c'
ORANGE, ORANGE_DARK = '#f6913a', '#d9731f'
MOUTH, TONGUE = '#8c3443', '#f58ea0'
MIST = '#dfeaf0'            # a puff of steam or dust: white would be lost in a sticker's white edge
STEAM = '#b7cbd6'


def rgb(colour):
    colour = colour.lstrip('#')
    return tuple(int(colour[i:i + 2], 16) for i in (0, 2, 4))


# ---------- path data to points ----------
TOKEN = re.compile(r'[MLHVAQTCZ]|-?\d*\.?\d+(?:e-?\d+)?')


def arc_points(x0, y0, rx, ry, large, sweep, x1, y1):
    """The points of an SVG arc (no rotation: the kit never turns one)."""
    if rx == 0 or ry == 0 or (x0 == x1 and y0 == y1):
        return [(x1, y1)]
    dx, dy = (x0 - x1) / 2, (y0 - y1) / 2
    scale = dx * dx / (rx * rx) + dy * dy / (ry * ry)
    if scale > 1:
        rx, ry = rx * math.sqrt(scale), ry * math.sqrt(scale)
    num = max(0, rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx)
    den = rx * rx * dy * dy + ry * ry * dx * dx
    coef = (-1 if large == sweep else 1) * math.sqrt(num / den) if den else 0
    cxp, cyp = coef * rx * dy / ry, -coef * ry * dx / rx
    cx, cy = cxp + (x0 + x1) / 2, cyp + (y0 + y1) / 2
    a0 = math.atan2((dy - cyp) / ry, (dx - cxp) / rx)
    a1 = math.atan2((-dy - cyp) / ry, (-dx - cxp) / rx)
    da = a1 - a0
    if sweep and da < 0:
        da += 2 * math.pi
    if not sweep and da > 0:
        da -= 2 * math.pi
    steps = max(6, int(abs(da) / (math.pi / 48)))
    return [(cx + rx * math.cos(a0 + da * i / steps), cy + ry * math.sin(a0 + da * i / steps)) for i in range(1, steps + 1)]


def flatten(d):
    """Path data as a list of (points, closed) outlines."""
    t, i, outlines, pts, cur, start, ctrl = TOKEN.findall(d), 0, [], [], (0, 0), (0, 0), None
    while i < len(t):
        cmd = t[i]
        i += 1

        def take(n):
            nonlocal i
            v = [float(x) for x in t[i:i + n]]
            i += n
            return v
        if cmd == 'M':
            if pts:
                outlines.append((pts, False))
            x, y = take(2)
            cur = start = (x, y)
            pts, ctrl = [cur], None
            while i < len(t) and not t[i].isalpha():      # further pairs after M are lines
                cur = tuple(take(2))
                pts.append(cur)
        elif cmd == 'L':
            while i < len(t) and not t[i].isalpha():
                cur = tuple(take(2))
                pts.append(cur)
            ctrl = None
        elif cmd == 'H':
            cur = (take(1)[0], cur[1])
            pts.append(cur)
        elif cmd == 'V':
            cur = (cur[0], take(1)[0])
            pts.append(cur)
        elif cmd == 'A':
            while i < len(t) and not t[i].isalpha():
                rx, ry, _, large, sweep, x, y = take(7)
                pts += arc_points(cur[0], cur[1], rx, ry, int(large), int(sweep), x, y)
                cur = (x, y)
            ctrl = None
        elif cmd in 'QT':
            while i < len(t) and not t[i].isalpha():
                if cmd == 'Q':
                    cx, cy, x, y = take(4)
                else:
                    x, y = take(2)
                    cx, cy = (2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]) if ctrl else cur
                for s in range(1, 25):
                    u = s / 24
                    pts.append(((1 - u) ** 2 * cur[0] + 2 * (1 - u) * u * cx + u * u * x, (1 - u) ** 2 * cur[1] + 2 * (1 - u) * u * cy + u * u * y))
                ctrl, cur = (cx, cy), (x, y)
        elif cmd == 'C':
            while i < len(t) and not t[i].isalpha():
                x1, y1, x2, y2, x, y = take(6)
                for s in range(1, 33):
                    u = s / 32
                    a, b, c, e = (1 - u) ** 3, 3 * (1 - u) ** 2 * u, 3 * (1 - u) * u * u, u ** 3
                    pts.append((a * cur[0] + b * x1 + c * x2 + e * x, a * cur[1] + b * y1 + c * y2 + e * y))
                cur = (x, y)
            ctrl = None
        elif cmd == 'Z':
            outlines.append((pts, True))
            pts, cur, ctrl = [], start, None
    if pts:
        outlines.append((pts, False))
    return outlines


def simplified(pts, eps):
    """Fewer points for the same line (Douglas and Peucker), for the path data the browser draws."""
    if len(pts) < 3:
        return list(pts)
    keep, stack = [False] * len(pts), [(0, len(pts) - 1)]
    keep[0] = keep[-1] = True
    while stack:
        a, b = stack.pop()
        (x0, y0), (x1, y1) = pts[a], pts[b]
        dx, dy = x1 - x0, y1 - y0
        ln = math.hypot(dx, dy) or 1
        far, at = 0, None
        for i in range(a + 1, b):
            dist = abs((pts[i][0] - x0) * dy - (pts[i][1] - y0) * dx) / ln
            if dist > far:
                far, at = dist, i
        if at is not None and far > eps:
            keep[at] = True
            stack += [(a, at), (at, b)]
    return [p for p, k in zip(pts, keep) if k]


# ---------- shapes the kit does not have ----------
def blob(cx, cy, rx, ry, turn=0):
    """An ellipse turned by `turn` degrees."""
    a, pts = math.radians(turn), []
    for i in range(56):
        t = math.tau * i / 56
        x, y = rx * math.cos(t), ry * math.sin(t)
        pts.append((cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a)))
    return 'M' + 'L'.join(pt(*p) for p in pts) + 'Z'


def egg(cx, cy, w, h, e=.12):
    """A soft body: an ellipse w wide and h tall that is fuller below (e) than above."""
    pts = []
    for i in range(72):
        t = math.tau * i / 72
        pts.append((cx + w / 2 * math.cos(t) * (1 + e * math.sin(t)), cy + h / 2 * math.sin(t)))
    return 'M' + 'L'.join(pt(*p) for p in pts) + 'Z'


def half(cx, cy, r, up=False):
    """Half a disc under (or, with up, over) the line through (cx, cy)."""
    return f'M{pt(cx - r, cy)}A{r:.2f} {r:.2f} 0 0 {1 if up else 0} {pt(cx + r, cy)}Z'


class Drawing:
    """What has been drawn, in order: flat shapes and round-ended lines, in the grid's units."""

    def __init__(self):
        self.ops, self.m = [], [(1, 0, 0, 1, 0, 0)]

    @contextmanager
    def at(self, x=0, y=0, s=1, turn=0, flip=False):
        """Everything drawn inside is moved to (x, y), made `s` times as large, turned and, with flip, mirrored."""
        a, b, c, d, e, f = self.m[-1]
        co, si = math.cos(math.radians(turn)) * s, math.sin(math.radians(turn)) * s
        la, lb, lc, ld = (-co if flip else co), (-si if flip else si), -si, co
        self.m.append((a * la + c * lb, b * la + d * lb, a * lc + c * ld, b * lc + d * ld, a * x + c * y + e, b * x + d * y + f))
        try:
            yield self
        finally:
            self.m.pop()

    def _size(self):
        a, b, c, d, _, _ = self.m[-1]
        return math.sqrt(abs(a * d - b * c))

    def _outlines(self, d):
        a, b, c, dd, e, f = self.m[-1]
        return [([(a * x + c * y + e, b * x + dd * y + f) for x, y in pts], closed) for pts, closed in flatten(d) if len(pts) > 1]

    def fill(self, d, colour, alpha=1.0):
        """Flat colour."""
        self.ops.append(('fill', [pts for pts, _ in self._outlines(d)], colour, alpha))
        return self

    def line(self, d, colour=INK, width=2.2):
        """A line of one width with round ends and corners."""
        for pts, closed in self._outlines(d):
            self.ops.append(('line', pts + [pts[0]] if closed else pts, colour, width * self._size()))
        return self

    def cut(self, d):
        """A hole through everything drawn so far (a face cutout's window)."""
        self.ops.append(('cut', [pts for pts, _ in self._outlines(d)]))
        return self

    # ----- painted (Pillow) -----
    def paint(self):
        im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        px = lambda x, y: ((x + MARGIN) * K, (y + MARGIN) * K)

        def lay(mask, colour, alpha=1.0):
            box = mask.getbbox()
            if not box:
                return
            part = mask.crop(box)
            if alpha < 1:
                part = part.point(lambda v: int(v * alpha))
            layer = Image.new('RGBA', part.size, rgb(colour) + (255,))
            layer.putalpha(part)
            im.alpha_composite(layer, (box[0], box[1]))
        for op in self.ops:
            mask = Image.new('L', (S, S), 0)
            draw = ImageDraw.Draw(mask)
            if op[0] == 'fill':
                for p in op[1]:
                    if len(p) > 2:
                        draw.polygon([px(x, y) for x, y in p], fill=255)
                lay(mask, op[2], op[3])
            elif op[0] == 'line':
                p, w = [px(x, y) for x, y in op[1]], op[3] * K
                draw.line(p, fill=255, width=max(1, round(w)), joint='curve')
                for x, y in p:                                            # round ends, and round corners where it turns
                    draw.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=255)
                lay(mask, op[2])
            elif op[0] == 'cut':
                for p in op[1]:
                    draw.polygon([px(x, y) for x, y in p], fill=255)
                im.putalpha(ImageChops.subtract(im.getchannel('A'), mask))
        return im

    def sticker(self):
        """Painted, with a white edge all round and a faint shadow, cropped to itself."""
        im = self.paint()
        small = im.getchannel('A').resize((S // 3, S // 3), Image.LANCZOS)
        grown = small.filter(ImageFilter.MaxFilter(2 * round(EDGE * K / 3) + 1)).filter(ImageFilter.GaussianBlur(1.3)).point(lambda v: 255 if v > 96 else int(v * 2.6))
        grown = grown.resize((S, S), Image.LANCZOS)
        shadow = Image.new('L', (S, S), 0)
        shadow.paste(grown.filter(ImageFilter.GaussianBlur(K * .9)).point(lambda v: int(v * .26)), (0, round(K * .9)))
        out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        for colour, mask in ((rgb(INK), shadow), ((255, 255, 255), grown)):
            layer = Image.new('RGBA', (S, S), colour + (255,))
            layer.putalpha(mask)
            out.alpha_composite(layer)
        out.alpha_composite(im)
        return out.crop(out.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())

    # ----- written as path data (the browser draws it) -----
    def paths(self, digits=1, eps=.06):
        """[{d, fill} | {d, stroke, width} (+ opacity) | {cut: d}] in the grid's units."""
        def num(v):
            text = f'{v:.{digits}f}'.rstrip('0').rstrip('.')
            return '0' if text in ('', '-0') else text
        def data(p, closed):
            if closed and len(p) > 3:
                # A closed outline ends where it began, and a line cannot be simplified against a chord of no length:
                # it is taken in two halves, from its first point to the one farthest from it and back.
                if math.dist(p[0], p[-1]) < 1e-6:
                    p = p[:-1]
                far = max(range(len(p)), key=lambda i: math.dist(p[0], p[i]))
                p = simplified(p[:far + 1], eps)[:-1] + simplified(p[far:] + [p[0]], eps)[:-1]
            else:
                p = simplified(p, eps)
            return 'M' + 'L'.join(f'{num(x)} {num(y)}' for x, y in p) + ('Z' if closed else '')
        out = []
        for op in self.ops:
            if op[0] == 'fill':
                item = {'d': ''.join(data(p, True) for p in op[1]), 'fill': op[2]}
                if op[3] < 1:
                    item['opacity'] = round(op[3], 2)
                out.append(item)
            elif op[0] == 'line':
                out.append({'d': data(op[1], False), 'stroke': op[2], 'width': round(op[3], 2)})
            elif op[0] == 'cut':
                out.append({'cut': ''.join(data(p, True) for p in op[1])})
        return out


# ---------- faces ----------
def eye(g, kind, x, y, r=3.0, left=True):
    """One eye at (x, y)."""
    w = r * .72
    if kind == 'dot':
        g.fill(ellipse(x, y, r * .84, r), INK).fill(circle(x + r * .26, y - r * .38, r * .27), WHITE)
    elif kind == 'tiny':
        g.fill(circle(x, y, r * .5), INK)
    elif kind == 'arc':
        g.line(f'M{pt(x - r * 1.15, y + r * .5)}Q{pt(x, y - r * 1.5)} {pt(x + r * 1.15, y + r * .5)}', INK, w)
    elif kind == 'down':
        g.line(f'M{pt(x - r * 1.15, y - r * .4)}Q{pt(x, y + r * 1.5)} {pt(x + r * 1.15, y - r * .4)}', INK, w)
    elif kind == 'line':
        g.line(f'M{pt(x - r * 1.15, y)}L{pt(x + r * 1.15, y)}', INK, w)
    elif kind == 'half':                      # a lid half down: smug, bored, plotting
        g.fill(half(x, y - r * .1, r * .95), INK)
        g.line(f'M{pt(x - r * 1.3, y - r * .3)}L{pt(x + r * 1.3, y - r * .3)}', INK, w)
    elif kind == 'cross':                     # squeezed shut: > <
        s = 1 if left else -1
        g.line(f'M{pt(x - s * r, y - r * .9)}L{pt(x + s * r * .8, y)}L{pt(x - s * r, y + r * .9)}', INK, w)
    elif kind == 'ex':                        # knocked out: x x
        g.line(f'M{pt(x - r * .9, y - r * .9)}L{pt(x + r * .9, y + r * .9)}M{pt(x + r * .9, y - r * .9)}L{pt(x - r * .9, y + r * .9)}', INK, w)
    elif kind == 'shine':                     # awe: a big dark eye full of light
        g.fill(circle(x, y, r * 1.5), INK).fill(circle(x + r * .5, y - r * .55, r * .56), WHITE).fill(circle(x - r * .55, y + r * .55, r * .3), WHITE)
    elif kind == 'heart':
        g.fill(heart(x, y + r * .2, r * 2.9), ROSE)
    elif kind == 'cry':                       # shut, and streaming
        g.fill(rrect(x - r * .75, y + r * .2, r * 1.5, r * 3.8, r * .75), SEA)
        g.line(f'M{pt(x - r * 1.15, y - r * .4)}Q{pt(x, y + r * 1.3)} {pt(x + r * 1.15, y - r * .4)}', INK, w)


def brow(g, kind, x, y, r=3.0, left=True):
    s, w = (-1 if left else 1), r * .72      # toward the middle of the face is -s
    if kind == 'angry':
        g.line(f'M{pt(x + s * r * 1.4, y - r * .8)}L{pt(x - s * r * 1.2, y + r * .5)}', INK, w)
    elif kind == 'worried':
        g.line(f'M{pt(x + s * r * 1.4, y + r * .5)}L{pt(x - s * r * 1.2, y - r * .7)}', INK, w)
    elif kind == 'flat':
        g.line(f'M{pt(x - r * 1.3, y)}L{pt(x + r * 1.3, y)}', INK, w)
    elif kind == 'up':
        g.line(f'M{pt(x - r * 1.3, y + r * .3)}Q{pt(x, y - r * 1.1)} {pt(x + r * 1.3, y + r * .3)}', INK, w)


def mouth(g, kind, x, y, w=5.0, width=2.2):
    """A mouth `w` wide to each side of (x, y)."""
    if kind == 'smile':
        g.line(f'M{pt(x - w, y - w * .1)}Q{pt(x, y + w)} {pt(x + w, y - w * .1)}', INK, width)
    elif kind == 'frown':
        g.line(f'M{pt(x - w, y + w * .5)}Q{pt(x, y - w * .6)} {pt(x + w, y + w * .5)}', INK, width)
    elif kind == 'flat':
        g.line(f'M{pt(x - w, y)}L{pt(x + w, y)}', INK, width)
    elif kind == 'smirk':
        g.line(f'M{pt(x - w, y + w * .1)}Q{pt(x + w * .4, y + w * .7)} {pt(x + w, y - w * .6)}', INK, width)
    elif kind == 'wavy':
        g.line(f'M{pt(x - w, y)}Q{pt(x - w * .66, y - w * .55)} {pt(x - w * .33, y)}T{pt(x + w * .33, y)}T{pt(x + w, y)}', INK, width)
    elif kind == 'cat':
        g.line(f'M{pt(x - w, y - w * .1)}Q{pt(x - w * .5, y + w * .8)} {pt(x, y - w * .05)}Q{pt(x + w * .5, y + w * .8)} {pt(x + w, y - w * .1)}', INK, width)
    elif kind == 'o':
        g.fill(ellipse(x, y + w * .25, w * .52, w * .66), MOUTH)
    elif kind in ('open', 'blep'):
        if kind == 'open':
            g.fill(half(x, y - w * .15, w), MOUTH).fill(ellipse(x, y + w * .5, w * .5, w * .26), TONGUE)
        else:
            g.line(f'M{pt(x - w, y - w * .1)}Q{pt(x, y + w * .9)} {pt(x + w, y - w * .1)}', INK, width)
            g.fill(rrect(x - w * .1, y + w * .25, w * .8, w * .95, w * .4), TONGUE)
    elif kind == 'shout':
        g.fill(ellipse(x, y + w * .4, w * .8, w * 1.02), MOUTH).fill(ellipse(x, y + w * 1.0, w * .46, w * .3), TONGUE)
    elif kind == 'teeth':
        g.fill(rrect(x - w, y - w * .4, 2 * w, w * 1.05, w * .45), WHITE)
        g.line(f'M{pt(x - w * .75, y + w * .12)}H{x + w * .75:.2f}', INK, width * .6)
    elif kind == 'kiss':
        g.line(f'M{pt(x - w * .2, y - w * .6)}Q{pt(x + w * .6, y - w * .3)} {pt(x - w * .1, y)}Q{pt(x + w * .6, y + w * .3)} {pt(x - w * .2, y + w * .6)}', INK, width)


# mood: eyes (left, right), brows, mouth, cheeks
MOODS = {
    'happy': ('dot', 'dot', None, 'smile', True),
    'joy': ('arc', 'arc', None, 'open', True),
    'smug': ('half', 'half', None, 'smirk', True),
    'wink': ('dot', 'arc', None, 'blep', True),
    'shock': ('tiny', 'tiny', 'up', 'o', False),
    'grumpy': ('dot', 'dot', 'angry', 'frown', False),
    'angry': ('dot', 'dot', 'angry', 'teeth', False),
    'deadpan': ('dot', 'dot', None, 'flat', False),
    'sleepy': ('down', 'down', None, 'o', True),
    'calm': ('down', 'down', None, 'smile', True),
    'cry': ('cry', 'cry', None, 'wavy', False),
    'nervous': ('dot', 'dot', 'worried', 'wavy', False),
    'love': ('heart', 'heart', None, 'smile', True),
    'out': ('ex', 'ex', None, 'wavy', False),
    'awe': ('shine', 'shine', None, 'o', True),
    'ouch': ('cross', 'cross', None, 'wavy', False),
    'sing': ('arc', 'arc', None, 'shout', True),
    'yum': ('arc', 'arc', None, 'blep', True),
}


def face(g, mood, x=0, y=0, gap=11.0, r=3.0, mouth_y=7.0, mouth_w=4.6, cheek=None, lips=None):
    """A face about (x, y): eyes `gap` to each side, the mouth `mouth_y` under them. `lips` overrides the mouth
    ('' leaves it out: a bill or a muzzle is drawn by the animal)."""
    left, right, brows, default, cheeks = MOODS[mood]
    if cheeks and cheek is not False:
        cx, cy = cheek or (gap + r * 2.3, r * 2.1)
        g.fill(ellipse(x - cx, y + cy, r * 1.45, r * .92) + ellipse(x + cx, y + cy, r * 1.45, r * .92), BLUSH, alpha=.9)
    eye(g, left, x - gap, y, r, True)
    eye(g, right, x + gap, y, r, False)
    if brows:
        brow(g, brows, x - gap, y - r * 2.3, r, True)
        brow(g, brows, x + gap, y - r * 2.3, r, False)
    lips = default if lips is None else lips
    if lips:
        mouth(g, lips, x, y + mouth_y, mouth_w)
    return g


# ---------- the small marks that say how someone feels ----------
def sweat(g, x, y, s=1.0, turn=0):
    with g.at(x, y, s, turn):
        g.fill(drop(0, 0, 4), SEA).fill(ellipse(-1, 1.1, .8, 1.3), WHITE, alpha=.8)


def vein(g, x, y, s=1.0):
    """The cross of a temper."""
    with g.at(x, y, s):
        for a in (0, 90, 180, 270):
            with g.at(0, 0, 1, a):
                g.line(f'M{pt(1.5, 5.2)}Q{pt(1.7, 1.7)} {pt(5.2, 1.5)}', RED, 2.3)


def zzz(g, x, y, s=1.0, colour=NAVY):
    for dx, dy, z in ((0, 0, 1), (8.5, -8.5, .72), (14.5, -15, .5)):
        with g.at(x + dx * s, y + dy * s, s * z):
            g.line(f'M{pt(0, 0)}H{6.4}L{pt(0, 7.4)}H{6.4}', colour, 2.2)


def hearts(g, spots, colour=ROSE):
    for x, y, r in spots:
        g.fill(heart(x, y, r), colour)


def shines(g, spots, colour=SUN):
    for x, y, r in spots:
        g.fill(sparkle(x, y, r, .22), colour)


def puff(g, x, y, s=1.0, colour=MIST):
    with g.at(x, y, s):
        g.fill(circle(-4, 1, 3.8) + circle(.6, -1.6, 4.8) + circle(5, 1.2, 3.4), colour)


def zoom(g, x, y, s=1.0, turn=0, colour=INK):
    """Three quick lines: something moved."""
    with g.at(x, y, s, turn):
        g.line(f'M{pt(0, -5)}H{9}M{pt(-4, 0)}H{8}M{pt(0, 5)}H{9}', colour, 1.8)


def rays(g, x, y, r0, r1, angles, colour=INK, width=2.0):
    """Short lines out from a point: surprise, a shout, a shine."""
    g.line(''.join(f'M{pt(*on(x, y, r0, a))}L{pt(*on(x, y, r1, a))}' for a in angles), colour, width)


def note(g, x, y, s=1.0, colour=PLUM):
    with g.at(x, y, s):
        g.fill(blob(-2.4, 6, 3.4, 2.6, -20), colour).line(f'M{pt(.6, 5.4)}V{-5}L{pt(6, -3)}', colour, 2.0)


# ---------- the cast ----------
# Five friends, each with its own build and its own way of being (the owner, 12 November 2026, of five round balls:
# "Better but too round, they lack personality"). Each stands on the ground at (0, 0) and is drawn upward.
#   the frog    wide and squat, a flat head with its eyes on top, long folded legs. Nothing impresses it.
#   the duck    the smallest: a big head, a small body, big flat feet and a heavy brow. Short of patience.
#   the rabbit  tall and thin under long ears that say what it feels. Everything is the best or the worst day ever.
#   the cat     a wide jaw, a long tail, eyes it rarely opens. Up to something.
#   the bear    the biggest: a small head on a great soft body. Would rather be asleep.
FROG, FROG_DARK, FROG_BELLY = '#7fcf7a', '#55b166', '#dff3b6'
DUCK, DUCK_DARK, DUCK_BELLY = '#fbd24a', '#efb22e', '#fde99b'
BUN, BUN_DARK, BUN_EAR = '#fbf0e2', '#e6d0b8', '#f9c2ce'
CAT, CAT_DARK, CAT_BELLY = '#f3b562', '#dc9440', '#fde6c4'
BEAR, BEAR_DARK, BEAR_PALE = '#b98a63', '#96694a', '#ead0b5'


def limb(g, points, colour, width, hand=True):
    """An arm or a leg: a round-ended line through `points`, with a slightly fuller end for a paw."""
    g.line('M' + 'L'.join(pt(*p) for p in points), colour, width)
    if hand:
        g.fill(circle(*points[-1], width * .7), colour)


def frog(g, mood='smug', hands=None, look=(0, 0), lips=None, arms=True):
    """The frog, 58 wide and 88 tall. `hands` is where its two hands are (left, right); returns where things are."""
    left_hand, right_hand = hands or ((-21, -27), (21, -27))
    for s in (-1, 1):                                                                     # long legs, folded out
        g.line(f'M{pt(s * 7, -21)}L{pt(s * 18.5, -14)}L{pt(s * 14, -4)}', FROG_DARK, 6.2)
        g.fill(blob(s * 18.5, -2.9, 10, 3.9), FROG_DARK)
    g.fill(rrect(-13.5, -51, 27, 35, 12.5), FROG)
    g.fill(ellipse(0, -31, 8.6, 10.5), FROG_BELLY)
    g.fill(circle(-15, -77, 11) + circle(15, -77, 11) + rrect(-29, -80, 58, 34, 17), FROG)  # a wide flat head
    eyes, _, brows, default, cheeks = MOODS[mood][0:2], None, MOODS[mood][2], MOODS[mood][3], MOODS[mood][4]
    if cheeks:
        g.fill(ellipse(-23, -55, 4.4, 2.8) + ellipse(23, -55, 4.4, 2.8), BLUSH, alpha=.9)
    for sx, kind, is_left in ((-15, eyes[0], True), (15, eyes[1], False)):
        if kind in ('dot', 'tiny', 'half'):
            g.fill(circle(sx, -78, 7.2), WHITE)
            if kind == 'half':
                g.fill(circle(sx + look[0] * 2.2, -76, 3.8), INK)
                g.fill(half(sx, -77.8, 8, up=True), FROG)
                g.line(f'M{pt(sx - 6.8, -77.8)}L{pt(sx + 6.8, -77.8)}', INK, 2.2)
            else:
                g.fill(circle(sx + look[0] * 2.6, -78 + look[1] * 2.6, 1.8 if kind == 'tiny' else 4), INK)
                if kind == 'dot':
                    g.fill(circle(sx + look[0] * 2.6 + 1.3, -79.4 + look[1] * 2.6, 1.1), WHITE)
        else:
            eye(g, kind, sx, -77.5, 2.5 if kind == 'heart' else 3.4, is_left)
        if brows:
            brow(g, brows, sx, -89.5, 3.1, is_left)
    g.fill(circle(-2.5, -67, .95) + circle(2.5, -67, .95), FROG_DARK)
    lips = default if lips is None else lips
    wide = {'smile': f'M{pt(-16, -60)}Q{pt(0, -50)} {pt(16, -60)}', 'smirk': f'M{pt(-15, -57)}Q{pt(5, -51)} {pt(17, -61)}',
            'flat': f'M{pt(-14, -56.5)}L{pt(14, -56.5)}', 'frown': f'M{pt(-14, -53.5)}Q{pt(0, -61)} {pt(14, -53.5)}'}
    if lips in wide:                                                                      # a frog's mouth is wide
        g.line(wide[lips], INK, 2.3)
    elif lips == 'wavy':
        mouth(g, 'wavy', 0, -56, 12)
    elif lips:
        mouth(g, lips, 0, -59.5, 6.4)
    if arms:
        limb(g, [(-12, -46), left_hand], FROG_DARK, 5.6)
        limb(g, [(12, -46), right_hand], FROG_DARK, 5.6)
    return {'hands': (left_hand, right_hand), 'top': -88, 'mouth': (0, -57), 'head': (0, -64)}


def duck(g, mood='deadpan', hands=None, bill='shut', brows='flat', legs='stand', arms=True):
    """The duck, 44 wide and 87 tall with its tuft. Its brow is always there: `brows` is flat, angry, worried or up."""
    left_hand, right_hand = hands or ((-20, -19), (20, -19))
    feet = {'stand': ((-6, -12), (-7, -4), 0), 'run': ((-5, -12), (-15, -6), -28)}[legs]
    for s in (-1, 1):                                                                     # big flat feet
        hip, ankle, turn = feet if s == -1 or legs == 'stand' else ((5, -12), (13, -5), 24)
        hip, ankle = ((abs(hip[0]) * s, hip[1]), (abs(ankle[0]) * s, ankle[1])) if legs == 'stand' else (hip, ankle)
        g.line(f'M{pt(*hip)}L{pt(*ankle)}', ORANGE, 3.8)
        with g.at(ankle[0], ankle[1], 1, turn if legs != 'stand' else 0):
            g.fill(poly([(-5 * s, 3.2), (11 * s, 3.2), (7 * s, -2.6), (-1 * s, -3.2)], 2.6), ORANGE)
    g.fill(poly([(9, -25), (24, -32), (18, -17)], 3.2), DUCK)                             # the tail
    g.fill(egg(0, -24, 31, 28, .18), DUCK)
    g.fill(ellipse(0, -20, 9, 8.5), DUCK_BELLY)
    g.fill(poly([(-8, -70), (-10, -84), (-1, -73)], 2.2) + poly([(-3, -72), (1, -88), (5.5, -72)], 2.2) + poly([(3, -71), (12, -82), (9.5, -69)], 2.2), DUCK_DARK)
    g.fill(rrect(-22, -73, 44, 38, 17.5), DUCK)
    left, right, _, default, cheeks = MOODS[mood]
    if cheeks:
        g.fill(ellipse(-17.5, -48.5, 3.9, 2.5) + ellipse(17.5, -48.5, 3.9, 2.5), BLUSH, alpha=.9)
    eye(g, left, -10, -57, 2.9, True)
    eye(g, right, 10, -57, 2.9, False)
    for s, is_left in ((-1, True), (1, False)):                                           # the brow
        if brows == 'flat':
            g.line(f'M{pt(s * 5.5, -64)}L{pt(s * 14.5, -64.6)}', INK, 2.6)
        else:
            brow(g, brows, s * 10, -64.5, 3.4, is_left)
    if bill == 'open':
        g.fill(ellipse(0, -43, 8.6, 6.6), MOUTH).fill(ellipse(0, -39.8, 4.8, 2.6), TONGUE)
        g.fill(rrect(-12.5, -53, 25, 8.5, 4.2), ORANGE)
    else:
        g.fill(rrect(-12.5, -52.5, 25, 11, 5.5), ORANGE)
        g.line(f'M{pt(-9, -46.6)}Q{pt(0, -44.6)} {pt(9, -46.6)}', ORANGE_DARK, 1.6)
    if arms:
        limb(g, [(-14, -31), left_hand], DUCK_DARK, 6.2, hand=False)
        limb(g, [(14, -31), right_hand], DUCK_DARK, 6.2, hand=False)
    return {'hands': (left_hand, right_hand), 'top': -88, 'mouth': (0, -47), 'head': (0, -54)}


def rabbit(g, mood='happy', hands=None, ears='up', arms=True, eyes=True):
    """The rabbit, 42 wide and 104 tall to the tips of its ears, which stand up, flop, droop or fly back."""
    left_hand, right_hand = hands or ((-16, -27), (16, -27))
    for s in (-1, 1):
        g.line(f'M{pt(s * 5, -14)}L{pt(s * 6, -5)}', BUN_DARK, 5.2)
        g.fill(blob(s * 9.5, -2.9, 9, 3.8), BUN_DARK)
    g.fill(circle(13, -17, 5.2), BUN_DARK)                                                # the tail
    g.fill(rrect(-10.5, -45, 21, 33, 10), BUN)
    pairs = {'up': ((-9, -87, 17, -5), (9, -87, 17, 7)), 'flop': ((-9, -87, 17, -5), (19, -77, 15, 66)),
             'droop': ((-19.5, -56, 13, 9), (19.5, -56, 13, -9)), 'back': ((-14, -84, 16, -44), (-3, -88, 16, -30))}[ears]
    for x, y, long, turn in pairs:
        g.fill(blob(x, y, 6.2, long, turn), BUN)
    for x, y, long, turn in pairs:
        g.fill(blob(x, y, 2.9, long - 5, turn), BUN_EAR)
    g.fill(ellipse(0, -59, 19, 16) + circle(-12.5, -53.5, 8.6) + circle(12.5, -53.5, 8.6), BUN)   # full cheeks
    left, right, brows, default, cheeks = MOODS[mood]
    if cheeks:
        g.fill(ellipse(-16.5, -53, 3.9, 2.5) + ellipse(16.5, -53, 3.9, 2.5), BLUSH, alpha=.9)
    if eyes:
        eye(g, left, -9.5, -61, 2.7, True)
        eye(g, right, 9.5, -61, 2.7, False)
        if brows:
            brow(g, brows, -9.5, -67.4, 2.7, True)
            brow(g, brows, 9.5, -67.4, 2.7, False)
    g.fill(poly([(-2.1, -57.6), (2.1, -57.6), (0, -55.2)], .9), ROSE)
    if default in ('smile', 'flat', 'smirk'):
        mouth(g, 'cat', 0, -53.6, 3.6, 1.9)
    else:
        mouth(g, default, 0, -53, 3.8, 1.9)
    if arms:
        limb(g, [(-9.5, -41), left_hand], BUN_DARK, 5.2)
        limb(g, [(9.5, -41), right_hand], BUN_DARK, 5.2)
    return {'hands': (left_hand, right_hand), 'top': -75, 'mouth': (0, -53), 'head': (0, -59)}


def cat(g, mood='smug', hands=None, tail='up', arms=True, fur=False):
    """The cat, 52 wide and 90 tall to its ears; its tail curls up behind it. `fur` stands it on end."""
    left_hand, right_hand = hands or ((-17, -27), (17, -27))
    if fur:
        g.fill(burst(0, -34, 33, 14, .8, 1.2), CAT_DARK)
    g.line({'up': f'M{pt(9, -11)}Q{pt(32, -9)} {pt(28, -37)}', 'down': f'M{pt(9, -11)}Q{pt(30, -12)} {pt(31, -2)}'}[tail], CAT_DARK, 10 if fur else 6.2)
    for s in (-1, 1):
        g.line(f'M{pt(s * 5.5, -14)}L{pt(s * 6.5, -5)}', CAT_DARK, 5.6)
        g.fill(blob(s * 9.5, -2.9, 8.6, 3.8), CAT_DARK)
    g.fill(rrect(-11.5, -47, 23, 35, 10.5), CAT)
    g.fill(ellipse(0, -28, 7.6, 10.5), CAT_BELLY)
    g.fill(poly([(-23, -64), (-22, -90), (-5, -76)], 4) + poly([(23, -64), (22, -90), (5, -76)], 4) + poly([(-19, -79), (19, -79), (26, -47), (-26, -47)], 12), CAT)
    g.fill(poly([(-19.5, -70), (-19, -83), (-10.5, -76)], 2) + poly([(19.5, -70), (19, -83), (10.5, -76)], 2), PINK)
    g.fill(rrect(-6.8, -79, 3, 7, 1.5) + rrect(-1.5, -79, 3, 8.6, 1.5) + rrect(3.8, -79, 3, 7, 1.5), CAT_DARK)
    left, right, brows, default, cheeks = MOODS[mood]
    if cheeks:
        g.fill(ellipse(-17.5, -53.5, 3.9, 2.5) + ellipse(17.5, -53.5, 3.9, 2.5), BLUSH, alpha=.9)
    eye(g, left, -10.5, -62, 2.8, True)
    eye(g, right, 10.5, -62, 2.8, False)
    if brows:
        brow(g, brows, -10.5, -68.6, 2.8, True)
        brow(g, brows, 10.5, -68.6, 2.8, False)
    g.fill(poly([(-2.1, -58.4), (2.1, -58.4), (0, -56)], .9), ROSE)
    if default in ('smile', 'flat', 'smirk'):
        mouth(g, 'cat', 0, -54.4, 3.6, 1.9)
    else:
        mouth(g, default, 0, -53.6, 3.8, 1.9)
    g.line(f'M{pt(-20, -57)}L{pt(-30, -59)}M{pt(-20, -53)}L{pt(-30, -51)}M{pt(20, -57)}L{pt(30, -59)}M{pt(20, -53)}L{pt(30, -51)}', CAT_DARK, 1.5)
    if arms:
        limb(g, [(-10.5, -43), left_hand], CAT_DARK, 5.6)
        limb(g, [(10.5, -43), right_hand], CAT_DARK, 5.6)
    return {'hands': (left_hand, right_hand), 'top': -90, 'mouth': (0, -54), 'head': (0, -62)}


def bear(g, mood='calm', hands=None, arms=True):
    """The bear, 48 wide and 97 tall: a small head on a great soft body."""
    left_hand, right_hand = hands or ((-29, -29), (29, -29))
    for s in (-1, 1):
        g.line(f'M{pt(s * 11, -12)}L{pt(s * 11, -5.5)}', BEAR_DARK, 12)
        g.fill(blob(s * 12.5, -3.3, 10.5, 4.5), BEAR_DARK)
    g.fill(rrect(-24, -60, 48, 54, 21), BEAR)
    g.fill(ellipse(0, -29, 14.5, 17), BEAR_PALE)
    g.fill(circle(-15.5, -90, 7.2) + circle(15.5, -90, 7.2) + rrect(-20, -92, 40, 36, 16), BEAR)
    g.fill(circle(-15.5, -90, 3.4) + circle(15.5, -90, 3.4) + ellipse(0, -65.5, 8.8, 6.6), BEAR_PALE)
    left, right, brows, default, cheeks = MOODS[mood]
    if cheeks:
        g.fill(ellipse(-15.5, -67, 3.7, 2.4) + ellipse(15.5, -67, 3.7, 2.4), BLUSH, alpha=.9)
    eye(g, left, -9.5, -75, 2.6, True)
    eye(g, right, 9.5, -75, 2.6, False)
    if brows:
        brow(g, brows, -9.5, -81.2, 2.6, True)
        brow(g, brows, 9.5, -81.2, 2.6, False)
    g.fill(ellipse(0, -68.2, 3.3, 2.4), INK)
    if default in ('smile', 'flat', 'smirk'):
        g.line(f'M{pt(0, -66)}V{-63.4}M{pt(-3.2, -63.8)}Q{pt(0, -60.8)} {pt(3.2, -63.8)}', INK, 1.8)
    else:
        mouth(g, default, 0, -64, 3, 1.8)
    if arms:
        limb(g, [(-21, -50), left_hand], BEAR_DARK, 9.6)
        limb(g, [(21, -50), right_hand], BEAR_DARK, 9.6)
    return {'hands': (left_hand, right_hand), 'top': -97, 'mouth': (0, -64), 'head': (0, -74)}
