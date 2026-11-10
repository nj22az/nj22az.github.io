#!/usr/bin/env python3
"""
The Chisum's own pictures: what her screens show, her dial faces, the faces of her panels and boards, her chart, her
flags. Drawn here, in Python, and packed onto one sheet.

    python3 ferry/blender/atlas.py [--out ferry/data/chisum-atlas.webp] [--tiles ferry/blender/atlas.json] [--preview dir]

Writes the sheet (WebP) and a list of where each picture lies on it (atlas.json: name → u0, v0, u1, v1 as the viewer
reads them, v up), which the builders read to put a picture on a face. Everything on it is made here: no photograph, no
maker's panel, no chart of a real coast. The waters shown are the Town's own (Minato and Kitano-jima).
Needs Pillow; no Blender.
"""
import json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
WIDTH, PAD = 2048, 6

# ---------- lettering ----------
_FONT_DIRS = ['/usr/share/fonts/truetype/dejavu']
try:
    import matplotlib
    _FONT_DIRS.append(os.path.join(os.path.dirname(matplotlib.__file__), 'mpl-data', 'fonts', 'ttf'))
except Exception:
    pass
_fonts = {}


def font(size, kind='b'):
    name = {'b': 'DejaVuSans-Bold.ttf', 'r': 'DejaVuSans.ttf', 'm': 'DejaVuSansMono-Bold.ttf'}[kind]
    key = (name, int(size))
    if key not in _fonts:
        for d in _FONT_DIRS:
            p = os.path.join(d, name)
            if os.path.exists(p):
                _fonts[key] = ImageFont.truetype(p, int(size))
                break
        else:
            raise SystemExit(f'no {name}: install the DejaVu fonts or matplotlib')
    return _fonts[key]


PANEL, INK, DIM = (36, 42, 45), (228, 233, 232), (140, 150, 152)
LCD_BG, LCD_FG, AMBER = (16, 40, 32), (150, 255, 190), (255, 180, 48)
RED, GREEN, YELLOW, BLUE, WHITE = (214, 60, 48), (60, 200, 110), (240, 200, 60), (70, 130, 220), (245, 243, 236)


def sheet(w, h, bg=PANEL):
    im = Image.new('RGB', (w, h), bg)
    return im, ImageDraw.Draw(im)


def text(d, xy, s, size=14, fill=INK, anchor='mm', kind='b'):
    d.text(xy, s, font=font(size, kind), fill=fill, anchor=anchor)


def frame(d, w, h, col=(70, 78, 82), screws=True):
    d.rectangle((1, 1, w - 2, h - 2), outline=col, width=2)
    if screws:
        for x, y in ((9, 9), (w - 10, 9), (9, h - 10), (w - 10, h - 10)):
            d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(110, 118, 120), outline=(20, 24, 26))


def key(d, cx, cy, w, h, col, legend='', size=11, lit=True, ink=None):
    """A push button with its legend on it."""
    c = col if lit else tuple(int(v * 0.35) for v in col)
    d.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=4, fill=c, outline=(12, 14, 15), width=2)
    d.line((cx - w / 2 + 4, cy - h / 2 + 3, cx + w / 2 - 4, cy - h / 2 + 3), fill=tuple(min(255, v + 60) for v in c), width=1)
    if legend:
        lines = legend.split('\n')
        for i, s in enumerate(lines):
            text(d, (cx, cy + (i - (len(lines) - 1) / 2) * (size + 1)), s, size, ink or ((20, 22, 22) if sum(c) > 330 else INK))


def led(d, cx, cy, r, col, on=True):
    c = col if on else tuple(int(v * 0.25) for v in col)
    d.ellipse((cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2), fill=(14, 16, 17))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=c)
    if on:
        d.ellipse((cx - r * 0.45, cy - r * 0.5, cx, cy - r * 0.05), fill=tuple(min(255, v + 90) for v in c))


def lcd(d, box, lines, size=14, fg=LCD_FG, bg=LCD_BG, kind='m', align='l'):
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=bg, outline=(8, 10, 10), width=2)
    step = (y1 - y0 - 8) / max(len(lines), 1)
    for i, s in enumerate(lines):
        if align == 'c':
            text(d, ((x0 + x1) / 2, y0 + 4 + step * (i + 0.5)), s, size, fg, 'mm', kind)
        else:
            text(d, (x0 + 7, y0 + 4 + step * (i + 0.5)), s, size, fg, 'lm', kind)


def knob_mark(d, cx, cy, r, legend='', pos=(), size=10):
    """The engraving round a rotary switch or knob (the knob itself is modelled): a ring, its positions, its name."""
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=DIM, width=2)
    for a, s in pos:
        x, y = cx + (r + 4) * math.sin(math.radians(a)), cy - (r + 4) * math.cos(math.radians(a))
        d.line((cx + r * math.sin(math.radians(a)), cy - r * math.cos(math.radians(a)), x, y), fill=INK, width=2)
        text(d, (cx + (r + 16) * math.sin(math.radians(a)), cy - (r + 12) * math.cos(math.radians(a))), s, size)
    if legend:
        text(d, (cx, cy + r + 15), legend, size)


# ---------- the waters she sails in: one coast for the radar, the chart system and the paper chart ----------
def _rough(pts, rng, amp, depth=3):
    for _ in range(depth):
        out = []
        for a, b in zip(pts, pts[1:] + pts[:1]):
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            dx, dy = b[0] - a[0], b[1] - a[1]
            k = rng.uniform(-amp, amp)
            out += [a, (mx - dy * k, my + dx * k)]
        pts, amp = out, amp * 0.6
    return pts


def waters():
    """Land, in nautical miles east and north of the ship: the mainland with Minato's harbour, Kitano-jima, a few rocks."""
    rng = random.Random(1986)
    mainland = _rough([(-6, -6), (-6, 6), (2.2, 6), (1.2, 3.6), (-0.4, 3.0), (-1.3, 1.9), (-1.0, 1.1), (-1.9, 0.6), (-2.1, -0.6), (-1.5, -1.8), (-2.4, -3.2), (-2.0, -6)], rng, 0.16)
    island = _rough([(2.3, 0.9), (3.4, 1.5), (4.3, 1.0), (4.6, -0.2), (3.7, -1.0), (2.6, -0.5)], rng, 0.2)
    rocks = [_rough([(1.1 + dx, -2.2 + dy), (1.25 + dx, -2.1 + dy), (1.2 + dx, -2.3 + dy)], rng, 0.3, 2) for dx, dy in ((0, 0), (0.5, -0.4), (-0.3, -0.7))]
    return dict(land=[mainland, island] + rocks, harbour=(-1.25, 1.5), island=(3.5, 0.3),
                route=[(0.6, -4.6), (0.0, 0.0), (-0.55, 0.95), (-1.05, 1.45)],
                targets=[(1.6, 1.9, 205, 9.0), (-0.3, -2.4, 30, 6.5), (2.2, -2.6, 315, 11.0)])


HEADING = 42.5


def _project(scale, cx, cy, heading=None):
    """A map from (east, north) in miles to picture points; head-up when a heading is given."""
    a = math.radians(heading or 0.0)
    ca, sa = math.cos(a), math.sin(a)

    def at(p):
        e, n = p
        x, y = (e * ca - n * sa, e * sa + n * ca) if heading else (e, n)
        return cx + x * scale, cy - y * scale
    return at


def radar():
    w, h = 640, 384
    im, d = sheet(w, h, (4, 8, 6))
    W = waters()
    cx, cy, R = 196, 192, 178
    scale = R / 3.0                                   # 3 miles to the edge
    at = _project(scale, cx, cy, HEADING)
    # echoes: the land is painted where the beam strikes it, brighter at the near edge, speckled
    echo = Image.new('RGB', (w, h), (0, 0, 0))
    ed = ImageDraw.Draw(echo)
    for poly in W['land']:
        ed.polygon([at(p) for p in poly], fill=(120, 96, 20))
        ed.line([at(p) for p in poly] + [at(poly[0])], fill=(255, 220, 70), width=4)
    rng = random.Random(7)
    for _ in range(900):
        x, y = rng.uniform(cx - R, cx + R), rng.uniform(cy - R, cy + R)
        if echo.getpixel((int(x), int(y)))[0] > 100:
            ed.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(255, 226, 90) if rng.random() < 0.5 else (60, 46, 8))
    for _ in range(140):                              # sea clutter near the ship
        r, a = rng.uniform(4, 34), rng.uniform(0, 6.283)
        ed.point((cx + r * math.cos(a), cy + r * math.sin(a)), fill=(170, 140, 40))
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).ellipse((cx - R, cy - R, cx + R, cy + R), fill=255)
    im.paste(echo, (0, 0), mask)
    d = ImageDraw.Draw(im)
    for k in (1, 2, 3):
        r = R * k / 3
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(0, 110, 60), width=1 if k < 3 else 2)
    for a in range(0, 360, 10):
        r0 = R - (9 if a % 30 == 0 else 5)
        d.line((cx + r0 * math.sin(math.radians(a)), cy - r0 * math.cos(math.radians(a)), cx + R * math.sin(math.radians(a)), cy - R * math.cos(math.radians(a))), fill=(0, 170, 90), width=1)
    for a in range(0, 360, 30):                       # bearing scale, head-up: true bearings round the edge
        b = (a + HEADING) % 360
        text(d, (cx + (R - 19) * math.sin(math.radians(a)), cy - (R - 19) * math.cos(math.radians(a))), f'{int(round(b)) % 360:03d}', 9, (0, 190, 100), kind='m')
    d.line((cx, cy, cx, cy - R), fill=(120, 255, 170), width=1)                           # heading line
    d.line((cx, cy, cx + R * math.sin(math.radians(63)), cy - R * math.cos(math.radians(63))), fill=(60, 200, 255), width=1)   # a bearing line
    r = R * 1.9 / 3
    d.arc((cx - r, cy - r, cx + r, cy + r), 0, 360, fill=(60, 200, 255))                  # a range marker
    for e, n, course, speed in W['targets']:
        x, y = at((e, n))
        if math.hypot(x - cx, y - cy) > R - 8:
            continue
        d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(255, 230, 90))
        d.ellipse((x - 9, y - 9, x + 9, y + 9), outline=(90, 255, 160))
        ca = math.radians(course - HEADING)
        d.line((x, y, x + speed * 2.2 * math.sin(ca), y - speed * 2.2 * math.cos(ca)), fill=(90, 255, 160), width=1)
    d.polygon([(cx, cy - 7), (cx - 4, cy + 5), (cx + 4, cy + 5)], outline=(120, 255, 170))
    # the data on the right
    g, x0 = (70, 255, 150), 396
    rows = [('HDG', f'{HEADING:05.1f}°T'), ('SPD', '11.2 kn'), ('COG', '044.1°T'), ('SOG', '11.4 kn'), ('', ''), ('RANGE', '3 NM'), ('RINGS', '1 NM'), ('', ''),
            ('EBL', '105.5°T'), ('VRM', '1.90 NM'), ('', ''), ('HEAD UP', 'RM'), ('GAIN', '62'), ('SEA', '18'), ('RAIN', '0')]
    d.rectangle((x0 - 8, 6, w - 6, h - 6), outline=(0, 90, 50))
    for i, (k, v) in enumerate(rows):
        y = 22 + i * 15.5
        text(d, (x0, y), k, 11, (0, 170, 90), 'lm', 'm')
        text(d, (w - 14, y), v, 12, g, 'rm', 'm')
    d.line((x0 - 8, 262, w - 6, 262), fill=(0, 90, 50))
    text(d, (x0, 276), 'TARGETS', 11, (0, 170, 90), 'lm', 'm')
    for i, (name, rng_, brg, cpa) in enumerate((('01', '2.41', '062', '0.8'), ('02', '2.38', '189', '1.6'))):
        text(d, (x0, 294 + i * 15), f'{name}  {rng_} NM  {brg}°  CPA {cpa}', 10, g, 'lm', 'm')
    text(d, (x0, 350), 'X-BAND  TX', 11, (255, 200, 60), 'lm', 'm')
    text(d, (x0, 366), '26°38.40\'N 127°54.10\'E', 10, (0, 170, 90), 'lm', 'm')
    return im


SEA, SHOAL, LAND, LAND_EDGE = (190, 222, 240), (150, 200, 232), (236, 220, 170), (120, 100, 60)


def _chart(d, at, scale, W, soundings=True, ink=(60, 70, 90), paper=False):
    rng = random.Random(42)
    for poly in W['land']:                            # a shoal fringe round the land, then the land
        d.line([at(p) for p in poly] + [at(poly[0])] + [at(poly[1])], fill=SHOAL if not paper else (190, 214, 222), width=int(scale * 0.5), joint='curve')
    for poly in W['land']:
        d.polygon([at(p) for p in poly], fill=LAND if not paper else (232, 214, 160), outline=LAND_EDGE)
    if soundings:
        for _ in range(110):
            e, n = rng.uniform(-3.4, 5), rng.uniform(-5, 4.4)
            x, y = at((e, n))
            try:
                px = d._image.getpixel((int(x), int(y)))
            except Exception:
                continue
            if abs(px[0] - (SEA[0] if not paper else 244)) < 6:
                dist = min(math.hypot(e - q[0], n - q[1]) for poly in W['land'] for q in poly[::4])
                text(d, (x, y), str(int(4 + dist * 16 + rng.uniform(0, 5))), 9, ink, kind='r')


def ecdis():
    w, h = 640, 384
    im, d = sheet(w, h, SEA)
    W = waters()
    cx, cy, scale = 250, 214, 46
    at = _project(scale, cx, cy)
    _chart(d, at, scale, W)
    for a, b in zip(W['route'], W['route'][1:]):       # the route, with its waypoints
        d.line((*at(a), *at(b)), fill=(220, 90, 30), width=2)
    for i, p in enumerate(W['route']):
        x, y = at(p)
        d.ellipse((x - 5, y - 5, x + 5, y + 5), outline=(220, 90, 30), width=2)
        text(d, (x + 9, y - 9), f'WP{i + 1}', 9, (150, 50, 10))
    text(d, at((-2.55, 1.75)), 'MINATO', 12, (60, 50, 30))
    text(d, at((3.5, 0.35)), 'KITANO-JIMA', 11, (60, 50, 30))
    for e, n, course, speed in W['targets']:           # AIS targets
        x, y = at((e, n))
        ca = math.radians(course)
        tri = [(x + 9 * math.sin(ca), y - 9 * math.cos(ca)), (x + 5 * math.sin(ca + 2.5), y - 5 * math.cos(ca + 2.5)), (x + 5 * math.sin(ca - 2.5), y - 5 * math.cos(ca - 2.5))]
        d.polygon(tri, outline=(20, 110, 40))
        d.line((x, y, x + speed * 2 * math.sin(ca), y - speed * 2 * math.cos(ca)), fill=(20, 110, 40))
    x, y = at((0, 0))                                  # own ship, with heading and course vectors
    a = math.radians(HEADING)
    d.line((x, y, x + 60 * math.sin(a), y - 60 * math.cos(a)), fill=(20, 20, 20), width=1)
    d.polygon([(x + 11 * math.sin(a), y - 11 * math.cos(a)), (x + 6 * math.sin(a + 2.4), y - 6 * math.cos(a + 2.4)), (x + 6 * math.sin(a - 2.4), y - 6 * math.cos(a - 2.4))], outline=(20, 20, 20), fill=(250, 250, 250))
    for k in range(1, 5):                              # the grid
        d.line((0, k * 77, 500, k * 77), fill=(150, 180, 200))
        d.line((k * 100, 0, k * 100, h), fill=(150, 180, 200))
    d.rectangle((0, 0, 500, 20), fill=(40, 48, 54))
    text(d, (8, 10), 'CHART  MINATO APPROACHES   1:40 000   NORTH UP', 10, (220, 228, 230), 'lm')
    d.rectangle((500, 0, w, h), fill=(34, 40, 46))
    rows = [('HDG', f'{HEADING:05.1f}°'), ('COG', '044.1°'), ('SOG', '11.4 kn'), ('DEPTH', '12.4 m'), ('', ''), ('TO', 'WP3'), ('BRG', '330°'), ('DIST', '1.10 NM'), ('TTG', '00:06'),
            ('XTE', '0.02 P'), ('', ''), ('LAT', "26°38.40'N"), ('LON', "127°54.10'E"), ('UTC', '03:41:20')]
    for i, (k, v) in enumerate(rows):
        yy = 20 + i * 24
        text(d, (508, yy), k, 10, (150, 165, 172), 'lm')
        text(d, (w - 8, yy), v, 12, (240, 244, 244), 'rm', 'm')
    text(d, (570, 366), 'NOT FOR NAVIGATION', 8, (240, 190, 60))
    return im


def paper_chart():
    w, h = 704, 432
    im, d = sheet(w, h, (244, 238, 220))
    W = waters()
    at = _project(62, 300, 250)
    d.rectangle((10, 10, w - 11, h - 11), outline=(60, 60, 70), width=2)
    for k in range(0, w, 16):                          # the graduated border
        d.line((k, 10, k, 17 if k % 80 else 22), fill=(60, 60, 70))
        d.line((k, h - 11, k, h - (18 if k % 80 else 23)), fill=(60, 60, 70))
    _chart(d, at, 62, W, ink=(70, 70, 110), paper=True)
    cx, cy = 590, 330                                   # a compass rose
    for r in (58, 44):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(150, 70, 110))
    for a in range(0, 360, 10):
        r0 = 58 - (10 if a % 30 == 0 else 5)
        d.line((cx + r0 * math.sin(math.radians(a)), cy - r0 * math.cos(math.radians(a)), cx + 58 * math.sin(math.radians(a)), cy - 58 * math.cos(math.radians(a))), fill=(150, 70, 110))
    text(d, (cx, cy - 66), 'N', 10, (150, 70, 110))
    d.line((cx, cy + 40, cx, cy - 52), fill=(150, 70, 110))
    for a, b in zip(W['route'], W['route'][1:]):       # the course pencilled on it
        d.line((*at(a), *at(b)), fill=(90, 90, 100), width=1)
    x, y = at((0.25, -1.9))
    text(d, (x + 26, y), '042°', 10, (90, 90, 100), kind='r')
    x, y = at((0, 0))
    d.ellipse((x - 5, y - 5, x + 5, y + 5), outline=(90, 90, 100))
    text(d, (x + 26, y + 2), '1140', 9, (90, 90, 100), kind='r')
    text(d, at((-2.6, 1.9)), 'MINATO', 13, (40, 40, 60))
    text(d, at((3.5, 0.3)), 'Kitano-jima', 12, (40, 40, 60), kind='r')
    text(d, (120, 34), 'MINATO AND APPROACHES', 13, (40, 40, 60))
    text(d, (120, 52), 'Depths in metres    Scale 1:40 000', 9, (70, 70, 90), kind='r')
    return im


def conning():
    w, h = 576, 384
    im, d = sheet(w, h, (10, 14, 18))
    g, c = (120, 255, 170), (80, 200, 255)
    d.rectangle((6, 6, w - 7, 86), outline=(40, 70, 80))                                   # heading tape
    for k in range(-5, 6):
        hd = round(HEADING) + k * 5
        x = w / 2 + (hd - HEADING) * 9.6
        d.line((x, 12, x, 26 if hd % 10 else 34), fill=g, width=2)
        if hd % 10 == 0:
            text(d, (x, 46), f'{hd % 360:03d}', 13, g, kind='m')
    d.polygon([(w / 2, 10), (w / 2 - 7, 0), (w / 2 + 7, 0)], fill=(255, 220, 80))
    text(d, (w / 2, 70), f'HDG {HEADING:05.1f}°   ROT +2.1°/min', 15, (240, 244, 244), kind='m')
    # rudder
    d.rectangle((6, 96, w - 7, 176), outline=(40, 70, 80))
    text(d, (20, 108), 'RUDDER', 11, (150, 165, 172), 'lm')
    x0, x1, y = 60, w - 60, 146
    d.line((x0, y, x1, y), fill=(150, 165, 172), width=2)
    for k in range(-35, 36, 5):
        x = (x0 + x1) / 2 + k * (x1 - x0) / 70
        d.line((x, y - (9 if k % 10 == 0 else 5), x, y), fill=(150, 165, 172), width=2)
        if k % 10 == 0:
            text(d, (x, y + 14), str(abs(k)), 10, (150, 165, 172), kind='m')
    xr = (x0 + x1) / 2 + 4 * (x1 - x0) / 70
    d.rectangle(((x0 + x1) / 2, y - 22, xr, y - 10), fill=GREEN)
    d.polygon([(xr, y - 6), (xr - 7, y - 24), (xr + 7, y - 24)], fill=(255, 220, 80))
    text(d, (x0 - 4, y - 16), 'P', 12, RED, 'rm')
    text(d, (x1 + 6, y - 16), 'S', 12, GREEN, 'lm')
    text(d, (w - 20, 108), 'S 4°', 14, (240, 244, 244), 'rm', 'm')
    # engines
    for i, (name, rpm) in enumerate((('PORT ENGINE', 1480), ('STBD ENGINE', 1475))):
        bx = 6 + i * (w / 2)
        d.rectangle((bx, 186, bx + w / 2 - 12, 290), outline=(40, 70, 80))
        text(d, (bx + 12, 198), name, 11, (150, 165, 172), 'lm')
        d.rectangle((bx + 14, 226, bx + w / 2 - 28, 244), outline=(150, 165, 172))
        d.rectangle((bx + 16, 228, bx + 16 + (w / 2 - 46) * rpm / 2000, 242), fill=c)
        text(d, (bx + 14, 268), f'{rpm} rpm', 17, (240, 244, 244), 'lm', 'm')
        text(d, (bx + w / 2 - 28, 268), 'AHEAD', 12, g, 'rm')
    # speed, depth, wind
    for i, (k, v, u) in enumerate((('SOG', '11.4', 'kn'), ('STW', '11.2', 'kn'), ('DEPTH', '12.4', 'm'), ('WIND', '14', 'kn 310°R'))):
        bx = 6 + i * (w - 12) / 4
        d.rectangle((bx, 300, bx + (w - 12) / 4 - 6, h - 7), outline=(40, 70, 80))
        text(d, (bx + 10, 314), k, 11, (150, 165, 172), 'lm')
        text(d, (bx + 10, 346), v, 24, (240, 244, 244), 'lm', 'm')
        text(d, (bx + (w - 12) / 4 - 12, 366), u, 10, (150, 165, 172), 'rm')
    return im


def echo():
    w, h = 256, 256
    im, d = sheet(w, h, (6, 10, 30))
    rng = random.Random(3)
    y = 150.0
    for x in range(0, 200):
        y += rng.uniform(-2.2, 2.0) + (0.25 if x < 90 else -0.35)
        y = min(max(y, 96), 226)
        d.line((x, y, x, h), fill=(120, 40, 10))
        d.line((x, y, x, y + 7), fill=(255, 200, 40))
        d.line((x, y + 7, x, y + 16), fill=(230, 90, 20))
        if rng.random() < 0.05:
            d.point((x, rng.uniform(30, y - 10)), fill=(70, 160, 220))
    d.line((0, 14, 200, 14), fill=(200, 220, 255))
    for i, m in enumerate((0, 10, 20, 30)):
        yy = 14 + i * 74
        d.line((200, yy, 210, yy), fill=(200, 220, 255))
        text(d, (232, yy + (8 if i == 0 else 0)), str(m), 11, (200, 220, 255), kind='m')
    d.rectangle((6, 22, 118, 70), fill=(6, 10, 30), outline=(90, 110, 160))
    text(d, (62, 40), '12.4', 24, (255, 240, 120), kind='m')
    text(d, (62, 61), 'm below keel', 8, (200, 220, 255))
    text(d, (228, 246), '50 kHz', 8, (200, 220, 255))
    return im


def gps():
    w, h = 256, 208
    im, d = sheet(w, h)
    frame(d, w, h)
    lcd(d, (14, 14, w - 14, 138), ["26°38.401'N", "127°54.102'E", 'COG 044°  SOG 11.4', 'UTC 03:41:20   3D'], 15)
    for i, s in enumerate(('NAV', 'WPT', 'RTE', 'MOB', 'MENU', 'ENT')):
        key(d, 34 + i * 38, 172, 32, 26, (200, 60, 50) if s == 'MOB' else (70, 80, 86), s, 9)
    return im


def ais():
    w, h = 256, 208
    im, d = sheet(w, h)
    frame(d, w, h)
    lcd(d, (14, 14, w - 14, 150), ['NAME        RNG  BRG', 'KITANO MARU 2.4  062', 'SAKURA NO 3 2.4  189', 'HIGA MARU   3.4  140', 'OWN: CHISUM', 'TX OK  CH 87B 88B'], 11, AMBER, (30, 22, 6))
    for i, s in enumerate(('▲', '▼', 'MSG', 'MENU', 'ENT')):
        key(d, 36 + i * 46, 180, 38, 24, (70, 80, 86), s, 9)
    return im


def vhf(ch, extra, w=352, h=208, distress=True):
    im, d = sheet(w, h)
    frame(d, w, h)
    lcd(d, (16, 16, 176, 122), [], 12)
    text(d, (62, 62), ch, 46, LCD_FG, kind='m')
    text(d, (140, 40), 'INT', 10, LCD_FG, kind='m')
    text(d, (140, 58), '25W', 10, LCD_FG, kind='m')
    text(d, (96, 106), extra, 10, LCD_FG, kind='m')
    x0 = 196
    for r in range(4):
        for c in range(3):
            key(d, x0 + c * 40 + (w - x0 - 100) / 2, 28 + r * 28, 34, 22, (70, 80, 86), '123456789*0#'[r * 3 + c], 11)
    if distress:
        d.rounded_rectangle((16, 136, 110, 190), radius=6, fill=(170, 30, 24), outline=(250, 250, 250), width=2)
        text(d, (63, 163), 'DISTRESS', 12, WHITE)
    for i, s in enumerate(('16', 'DW', 'SCAN', 'H/L')):
        key(d, 136 + i * 46 if distress else 40 + i * 62, 166, 40, 26, (60, 110, 170) if s == '16' else (70, 80, 86), s, 10)
    return im


def navtex():
    w, h = 304, 208
    im, d = sheet(w, h)
    frame(d, w, h)
    lcd(d, (14, 14, w - 14, 146), ['ZCZC GA42', '100341 UTC NOV', 'NAVAREA XI WARNING', 'MINATO APPROACHES', 'LIGHT BUOY NO 3 UNLIT', 'NNNN'], 11, (30, 30, 30), (206, 214, 200))
    for i, s in enumerate(('▲', '▼', 'PRINT', 'MENU')):
        key(d, 44 + i * 70, 178, 56, 24, (70, 80, 86), s, 9)
    led(d, w - 26, 178, 5, GREEN)
    return im


def cctv():
    w, h = 512, 232
    im, d = sheet(w, h, (6, 8, 10))
    hw, hh = w // 2, h // 2
    # 1: the bow ramp, raised, seen from the wheelhouse front
    d.rectangle((0, 0, hw - 2, hh - 2), fill=(120, 150, 170))
    d.polygon([(40, hh - 2), (hw - 42, hh - 2), (hw - 70, 30), (70, 30)], fill=(96, 110, 112))
    d.polygon([(74, 34), (hw - 74, 34), (hw - 60, 8), (60, 8)], fill=(70, 96, 100))
    for k in range(5):
        d.line((70 + k * 28, hh - 2, 88 + k * 22, 34), fill=(230, 200, 60), width=2)
    # 2: the car deck, three lanes of cars
    d.rectangle((hw, 0, w, hh - 2), fill=(70, 76, 78))
    for lane in range(3):
        for k in range(3):
            x, y = hw + 26 + lane * 78, 12 + k * 34
            d.rounded_rectangle((x, y, x + 52, y + 26), radius=5, fill=((180, 40, 40), (220, 220, 215), (40, 80, 150), (60, 60, 64))[(lane + k * 2) % 4])
            d.rectangle((x + 8, y + 5, x + 44, y + 12), fill=(30, 40, 50))
    # 3: the wake astern
    d.rectangle((0, hh, hw - 2, h), fill=(40, 90, 130))
    d.rectangle((0, hh, hw - 2, hh + 30), fill=(150, 190, 220))
    d.polygon([(hw / 2 - 16, h), (hw / 2 + 16, h), (hw / 2 + 80, hh + 30), (hw / 2 - 80, hh + 30)], fill=(200, 225, 235))
    d.rectangle((0, h - 16, hw - 2, h), fill=(230, 230, 224))
    # 4: the engine room, two engines
    d.rectangle((hw, hh, w, h), fill=(52, 60, 56))
    for k in range(2):
        x = hw + 36 + k * 110
        d.rectangle((x, hh + 36, x + 76, h - 14), fill=(40, 110, 100))
        d.rectangle((x + 8, hh + 22, x + 68, hh + 40), fill=(150, 160, 160))
        for j in range(3):
            d.ellipse((x + 12 + j * 20, hh + 48, x + 26 + j * 20, hh + 62), fill=(30, 70, 66))
    d.line((hw - 1, 0, hw - 1, h), fill=(6, 8, 10), width=3)
    d.line((0, hh - 1, w, hh - 1), fill=(6, 8, 10), width=3)
    for (x, y), s in (((6, 6), 'CAM 1  BOW RAMP'), ((hw + 6, 6), 'CAM 2  CAR DECK'), ((6, hh + 6), 'CAM 3  STERN'), ((hw + 6, hh + 6), 'CAM 4  ENGINE ROOM')):
        d.rectangle((x - 2, y - 2, x + 126, y + 12), fill=(0, 0, 0))
        text(d, (x, y + 5), s, 9, (240, 240, 240), 'lm', 'm')
    return im


def hdg():
    w, h = 256, 160
    im, d = sheet(w, h, (8, 10, 10))
    text(d, (w / 2, 66), f'{HEADING:05.1f}°', 60, (255, 96, 60), kind='m')
    text(d, (w / 2, 132), 'HEADING  TRUE', 14, (190, 80, 50))
    return im


def keyboard(w, h, ball=True):
    im, d = sheet(w, h)
    frame(d, w, h)
    kx = w - (120 if ball else 0)
    cols, rows = int((kx - 24) // 44), 3
    names = ['RANGE+', 'RANGE-', 'GAIN', 'SEA', 'RAIN', 'EBL', 'VRM', 'ACQ', 'CANCEL', 'MODE', 'OFFSET', 'TRAILS', 'MENU', 'ALARM\nACK', 'TX\nSTBY', 'BRILL', 'TLL', 'MOB', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6']
    for r in range(rows):
        for c in range(cols):
            s = names[(r * cols + c) % len(names)]
            col = (190, 60, 50) if s.startswith('ALARM') else (60, 110, 170) if s.startswith('TX') else (70, 80, 86)
            key(d, 34 + c * 44, 34 + r * 46, 38, 36, col, s, 8)
    if ball:
        cx, cy = w - 62, h / 2
        d.ellipse((cx - 44, cy - 44, cx + 44, cy + 44), fill=(20, 24, 26), outline=DIM, width=2)
        for dx in (-64, 64):
            if 0 < cx + dx < w:
                pass
    return im


def alarm_panel():
    w, h = 416, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    names = ('ME PORT', 'ME STBD', 'GEN 1', 'GEN 2', 'STEERING', 'BILGE', 'FIRE', 'POWER', 'GEARBOX\nPORT', 'GEARBOX\nSTBD', 'FUEL', 'COOLING', 'THRUSTER', 'BATTERY', 'DOORS', 'SYSTEM')
    for i, s in enumerate(names):
        cx, cy = 34 + (i % 8) * 43, 32 + (i // 8) * 44
        key(d, cx, cy, 39, 38, (90, 30, 26), s, 7, lit=True, ink=(255, 200, 190))
    text(d, (w - 62, 14), 'MACHINERY', 9)
    key(d, w - 62, 130, 44, 26, (200, 150, 40), 'ACK', 10)
    key(d, 190, 130, 60, 26, (70, 80, 86), 'SILENCE', 9)
    key(d, 60, 130, 70, 26, (70, 80, 86), 'LAMP TEST', 9)
    text(d, (w - 62, 60), 'ALL\nNORMAL', 10, GREEN)
    led(d, w - 62, 92, 6, GREEN)
    return im


def bnwas():
    w, h = 336, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 16), 'BRIDGE WATCH ALARM', 10)
    lcd(d, (16, 30, 150, 92), ['02:45', 'AUTO  12 min'], 16, AMBER, (30, 22, 6), align='c')
    knob_mark(d, 76, 124, 15, '', (((-50), 'OFF'), (0, 'AUTO'), (50, 'ON')), 8)
    d.ellipse((208, 34, 304, 130), fill=(60, 110, 170), outline=(12, 14, 15), width=3)
    text(d, (256, 82), 'RESET', 15, WHITE)
    for i, cc in enumerate((GREEN, YELLOW, RED)):
        led(d, 172, 44 + i * 26, 5, cc, on=i == 0)
    return im


def prop_panel():
    w, h = 592, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    for i, (name, x) in enumerate((('PORT ENGINE', 92), ('STBD ENGINE', w - 92))):
        text(d, (x, 16), name, 10, RED if i == 0 else GREEN)
        key(d, x - 46, 54, 40, 34, (40, 150, 80), 'START', 9)
        key(d, x, 54, 40, 34, (190, 60, 50), 'STOP', 9)
        led(d, x + 44, 44, 5, GREEN)
        text(d, (x + 44, 64), 'RUN', 8)
        # the emergency stop, under a striped flap
        d.rectangle((x - 40, 90, x + 40, 144), fill=(230, 200, 40), outline=(12, 14, 15), width=2)
        for k in range(-40, 80, 16):
            d.polygon([(x - 40 + k, 144), (x - 40 + k + 8, 144), (x - 40 + k + 62, 90), (x - 40 + k + 54, 90)], fill=(20, 20, 20))
        d.rectangle((x - 40, 90, x + 40, 144), outline=(12, 14, 15), width=2)
        d.rectangle((x - 30, 106, x + 30, 128), fill=(230, 200, 40))
        text(d, (x, 117), 'EM. STOP', 9, (20, 20, 20))
    text(d, (w / 2, 16), 'IN COMMAND', 10)
    for i, s in enumerate(('BRIDGE', 'PORT\nWING', 'STBD\nWING', 'ENGINE\nROOM')):
        key(d, w / 2 - 99 + i * 66, 56, 58, 38, (40, 150, 80) if i == 0 else (70, 80, 86), s, 9, lit=True)
    key(d, w / 2 - 50, 120, 84, 30, (60, 110, 170), 'TAKE CONTROL', 8)
    key(d, w / 2 + 50, 120, 84, 30, (70, 80, 86), 'LAMP TEST', 8)
    return im


def thr_panel():
    w, h = 256, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 16), 'BOW THRUSTER', 10, BLUE)
    key(d, 52, 56, 46, 34, (40, 150, 80), 'START', 9)
    key(d, 108, 56, 46, 34, (190, 60, 50), 'STOP', 9)
    led(d, 160, 46, 5, YELLOW, on=False)
    text(d, (160, 66), 'READY', 8)
    led(d, 208, 46, 5, GREEN, on=False)
    text(d, (208, 66), 'RUN', 8)
    d.rectangle((24, 100, w - 24, 126), fill=(12, 14, 15), outline=DIM)
    for k in range(11):
        d.line((30 + k * 19.6, 100, 30 + k * 19.6, 108), fill=INK)
    text(d, (w / 2, 142), 'MOTOR CURRENT  0 … 200 A', 8)
    return im


def whistle_panel():
    w, h = 208, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (62, 18), 'WHISTLE', 10)
    d.ellipse((24, 36, 100, 112), outline=DIM, width=2)
    text(d, (62, 130), 'PUSH', 9)
    text(d, (150, 18), 'FOG SIGNAL', 9)
    knob_mark(d, 150, 74, 18, '', ((-45, 'OFF'), (45, 'AUTO')), 8)
    led(d, 150, 124, 5, YELLOW, on=False)
    text(d, (150, 142), '2 min', 8)
    return im


def sl_panel():
    w, h = 208, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 16), 'SEARCHLIGHT', 10)
    d.ellipse((66, 42, 142, 118), outline=DIM, width=2)
    for a, s in ((0, '▲'), (90, '▶'), (180, '▼'), (270, '◀')):
        text(d, (104 + 50 * math.sin(math.radians(a)), 80 - 50 * math.cos(math.radians(a))), s, 10)
    key(d, 36, 138, 48, 24, (200, 150, 40), 'LAMP', 9)
    led(d, 180, 138, 5, YELLOW, on=False)
    return im


def wiper_panel():
    w, h = 384, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (150, 14), 'WINDOW WIPERS', 10)
    for i, s in enumerate(('STBD', 'CENTRE', 'PORT')):
        knob_mark(d, 56 + i * 96, 76, 17, s, ((-55, 'OFF'), (0, 'INT'), (55, 'ON')), 8)
    d.ellipse((314, 46, 366, 98), fill=(60, 110, 170), outline=(12, 14, 15), width=2)
    text(d, (340, 72), 'WASH', 9, WHITE)
    return im


def dimmer_panel():
    w, h = 304, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 14), 'DIMMERS', 10)
    for i, s in enumerate(('CONSOLE', 'INSTRUMENTS', 'CHART')):
        knob_mark(d, 56 + i * 96, 76, 19, s, ((-130, ''), (130, '')), 8)
        d.arc((56 + i * 96 - 30, 46, 56 + i * 96 + 30, 106), 140, 400, fill=DIM, width=2)
    return im


def ramp_panel():
    w, h = 560, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 13), 'RAMP · HATCHES · WATERTIGHT DOORS', 9)
    # the ship in plan: bow to the right
    hull = [(40, 62), (60, 44), (430, 44), (520, 62), (520, 110), (430, 128), (60, 128), (40, 110)]
    d.polygon(hull, outline=INK, width=2)
    d.rectangle((520, 58, 536, 114), outline=INK, width=2)
    lamps = [(528, 86, 'RAMP'), (476, 70, 'HATCH 1'), (176, 86, 'HATCH 2'), (300, 104, 'HATCH 3'), (82, 86, 'WT 1'), (130, 86, 'WT 2'), (222, 86, 'WT 3'), (386, 104, 'WT 4'), (432, 104, 'WT 5')]
    for x, y, s in lamps:
        led(d, x, y, 6, GREEN)
        text(d, (x, y + (16 if s.startswith('W') else -15) if x < 520 else 132), s, 7)
    text(d, (86, 146), '● SHUT AND SECURED', 8, GREEN, 'lm')
    text(d, (250, 146), '● OPEN', 8, RED, 'lm')
    key(d, 500, 144, 66, 20, (70, 80, 86), 'LAMP TEST', 7)
    return im


def pa_panel():
    w, h = 464, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (120, 13), 'PUBLIC ADDRESS', 9)
    for i, s in enumerate(('CAR\nDECK', 'SALOON', 'CREW', 'OPEN\nDECKS', 'ALL')):
        key(d, 34 + i * 43, 46, 39, 34, (60, 110, 170) if s == 'ALL' else (70, 80, 86), s, 8)
    d.rounded_rectangle((252, 22, 330, 70), radius=6, fill=(170, 30, 24), outline=WHITE, width=2)
    text(d, (291, 46), 'GENERAL\nALARM', 9, WHITE)
    text(d, (120, 88), 'TALKBACK', 9)
    for i, s in enumerate(('PORT\nWING', 'STBD\nWING', 'FWD', 'AFT', 'ENGINE\nROOM')):
        key(d, 34 + i * 43, 122, 39, 34, (70, 80, 86), s, 8)
    for k in range(5):                                 # the loudspeaker grille
        d.line((262, 96 + k * 9, 324, 96 + k * 9), fill=(12, 14, 15), width=4)
    d.ellipse((364, 30, 444, 110), outline=DIM, width=2)   # where the microphone stands
    text(d, (404, 128), 'PRESS TO TALK', 8)
    return im


def phone():
    w, h = 288, 160
    im, d = sheet(w, h)
    frame(d, w, h)
    lcd(d, (150, 14, w - 14, 50), ['BRIDGE  01'], 12, AMBER, (30, 22, 6))
    for r in range(4):
        for c in range(3):
            key(d, 168 + c * 40, 68 + r * 22, 34, 18, (70, 80, 86), '123456789*0#'[r * 3 + c], 9)
    for i, s in enumerate(('01 BRIDGE', '02 ENGINE CTRL', '03 MASTER', '04 MESS', '05 GALLEY')):
        text(d, (14, 60 + i * 18), s, 8, DIM, 'lm')
    return im


def navlight_panel():
    w, h = 848, 208
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (130, 16), 'NAVIGATION LIGHTS', 12)
    # the ship in profile, bow to the right, with a lamp where each lantern stands
    d.polygon([(40, 150), (56, 176), (356, 176), (384, 150)], outline=INK, width=2)
    d.rectangle((150, 118, 330, 150), outline=INK, width=2)
    d.rectangle((250, 92, 330, 118), outline=INK, width=2)
    d.line((290, 92, 290, 36), fill=INK, width=2)
    names = ('MASTHEAD', 'PORT', 'STBD', 'STERN', 'ANCHOR', 'NUC 1', 'NUC 2')
    spots = ((300, 58, WHITE), (322, 100, RED), (322, 110, GREEN), (150, 128, WHITE), (290, 34, WHITE), (280, 48, RED), (280, 74, RED))
    for i, (x, y, c) in enumerate(spots):
        led(d, x, y, 5, c, on=i < 4)
    for i, s in enumerate(names):
        x = 424 + i * 58
        text(d, (x, 22), s, 8)
        led(d, x, 44, 6, (WHITE, RED, GREEN, WHITE, WHITE, RED, RED)[i], on=i < 4)
        d.rounded_rectangle((x - 16, 62, x + 16, 122), radius=4, fill=(20, 24, 26), outline=DIM)      # where the switch stands
        text(d, (x, 134), 'ON', 7, DIM)
        led(d, x, 156, 4, RED, on=False)
        text(d, (x, 174), 'FAIL', 7, DIM)
    knob_mark(d, 800, 150, 16, 'SUPPLY', ((-50, 'MAIN'), (0, 'OFF'), (50, 'ALT')), 7)
    d.line((396, 30, 396, 190), fill=DIM)
    return im


def autopilot():
    w, h = 256, 256
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 16), 'AUTOPILOT', 10)
    lcd(d, (18, 30, w - 18, 112), ['HDG   042.5°', 'SET   042°', 'RUD   S 04°  AUTO'], 14)
    for i, s in enumerate(('STBY', 'AUTO', 'NAV')):
        key(d, 50 + i * 78, 142, 64, 30, (40, 150, 80) if s == 'AUTO' else (70, 80, 86), s, 10)
    for i, s in enumerate(('-10', '-1', '+1', '+10')):
        key(d, 40 + i * 59, 206, 48, 42, (190, 60, 50) if i < 2 else (40, 150, 80), s, 12)
    return im


def steer_mode():
    w, h = 232, 256
    im, d = sheet(w, h)
    frame(d, w, h)
    text(d, (w / 2, 16), 'STEERING', 10)
    knob_mark(d, w / 2, 78, 24, '', ((-55, 'HAND'), (0, 'AUTO'), (55, 'TILLER')), 9)
    d.line((30, 138, w - 30, 138), fill=DIM)
    text(d, (w / 2, 152), 'TILLER', 9)
    d.rounded_rectangle((36, 170, w - 36, 226), radius=8, outline=DIM, width=2)
    text(d, (58, 198), '◀ PORT', 9, RED)
    text(d, (w - 58, 198), 'STBD ▶', 9, GREEN)
    text(d, (w / 2, 240), 'non-follow-up', 8, DIM, kind='r')
    return im


def gauge(d, cx, cy, r, lo, hi, value, title, unit, step, red=None, face=(14, 16, 17), ink=INK, a0=-135, a1=135, fmt='{:g}'):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=face, outline=(90, 98, 100), width=3)
    if red:
        b0, b1 = (a0 + (red[0] - lo) / (hi - lo) * (a1 - a0) - 90, a0 + (red[1] - lo) / (hi - lo) * (a1 - a0) - 90)
        d.arc((cx - r + 7, cy - r + 7, cx + r - 7, cy + r - 7), b0, b1, fill=RED, width=5)
    n = int(round((hi - lo) / step))
    for i in range(n * 5 + 1):
        a = math.radians(a0 + (a1 - a0) * i / (n * 5))
        big = i % 5 == 0
        r0 = r - (13 if big else 8)
        d.line((cx + r0 * math.sin(a), cy - r0 * math.cos(a), cx + (r - 4) * math.sin(a), cy - (r - 4) * math.cos(a)), fill=ink, width=2 if big else 1)
        if big and (r >= 70 or i % 10 == 0):
            text(d, (cx + (r - (24 if r >= 70 else 21)) * math.sin(a), cy - (r - (24 if r >= 70 else 21)) * math.cos(a)), fmt.format(lo + step * i / 5), max(8, int(r * 0.13)), ink)
    if r >= 70:
        text(d, (cx, cy + r * 0.38), title, max(8, int(r * 0.13)), ink)
        text(d, (cx, cy + r * 0.58), unit, max(7, int(r * 0.11)), DIM if ink == INK else (90, 90, 90), kind='r')
    else:
        text(d, (cx, cy + r * 0.66), f'{title} {unit}', 8, ink)
    a = math.radians(a0 + (a1 - a0) * (value - lo) / (hi - lo))
    d.line((cx - 0.15 * r * math.sin(a), cy + 0.15 * r * math.cos(a), cx + (r - 14) * math.sin(a), cy - (r - 14) * math.cos(a)), fill=(255, 110, 50) if ink == INK else (170, 30, 20), width=3)
    d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=(60, 66, 68))


def engine_panel():
    w, h = 704, 232                                   # the face is 0.55 by 0.184 m: lowered for the view over the console
    im, d = sheet(w, h)
    frame(d, w, h)
    for i, (x, name) in enumerate(((122, 'PORT'), (w - 122, 'STBD'))):
        gauge(d, x, 108, 94, 0, 2400, 1480 - 5 * i, 'ENGINE ' + name, 'rpm', 400, red=(2100, 2400))
        text(d, (x, 217), 'AHEAD', 11, GREEN)
    for i, (x, y, title, unit, lo, hi, v, step, red) in enumerate(((298, 62, 'OIL P', 'bar', 0, 8, 4.6, 2, (0, 1.5)), (406, 62, 'OIL S', 'bar', 0, 8, 4.5, 2, (0, 1.5)),
                                                                   (298, 170, 'WATER P', '°C', 40, 120, 82, 20, (100, 120)), (406, 170, 'WATER S', '°C', 40, 120, 83, 20, (100, 120)))):
        gauge(d, x, y, 49, lo, hi, v, title, unit, step, red=red, a0=-120, a1=120)
    return im


def rudder_dial(w, h, r, cy=None, title=True):
    im, d = sheet(w, h, (14, 16, 17))
    cx, cy = w / 2, cy or h * 0.44
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(90, 98, 100), width=3)
    d.pieslice((cx - r + 6, cy - r + 6, cx + r - 6, cy + r - 6), 90, 160, fill=(120, 30, 26))      # port: red
    d.pieslice((cx - r + 6, cy - r + 6, cx + r - 6, cy + r - 6), 20, 90, fill=(24, 100, 56))       # starboard: green
    d.ellipse((cx - r * 0.62, cy - r * 0.62, cx + r * 0.62, cy + r * 0.62), fill=(14, 16, 17))
    for k in range(-40, 41, 5):
        a = math.radians(180 - k * 1.75)
        big = k % 10 == 0
        r0 = r - (16 if big else 10)
        d.line((cx + r0 * math.sin(a), cy - r0 * math.cos(a), cx + (r - 5) * math.sin(a), cy - (r - 5) * math.cos(a)), fill=WHITE, width=2 if big else 1)
        if big:
            text(d, (cx + (r * 0.72) * math.sin(a), cy - (r * 0.72) * math.cos(a)), str(abs(k)), max(8, int(r * 0.13)), WHITE)
    a = math.radians(180 - 4 * 1.75)
    d.polygon([(cx + (r - 18) * math.sin(a), cy - (r - 18) * math.cos(a)), (cx + 7 * math.cos(a), cy + 7 * math.sin(a)), (cx - 7 * math.cos(a), cy - 7 * math.sin(a))], fill=(255, 220, 80))
    d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=(60, 66, 68))
    text(d, (cx - r * 0.42, cy - r * 0.22), 'PORT', max(8, int(r * 0.12)), (255, 150, 140))
    text(d, (cx + r * 0.42, cy - r * 0.22), 'STBD', max(8, int(r * 0.12)), (150, 240, 180))
    if title:
        text(d, (cx, cy - r * 0.55), 'RUDDER', max(9, int(r * 0.14)), WHITE)
    return im


def wind():
    w = h = 256
    im, d = sheet(w, h, (14, 16, 17))
    cx = cy = 128
    r = 118
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(90, 98, 100), width=3)
    d.arc((cx - r + 8, cy - r + 8, cx + r - 8, cy + r - 8), 180, 270, fill=RED, width=6)
    d.arc((cx - r + 8, cy - r + 8, cx + r - 8, cy + r - 8), 270, 360, fill=GREEN, width=6)
    for k in range(0, 360, 10):
        a = math.radians(k)
        big = k % 30 == 0
        d.line((cx + (r - (20 if big else 14)) * math.sin(a), cy - (r - (20 if big else 14)) * math.cos(a), cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a)), fill=WHITE, width=2 if big else 1)
        if big:
            if k != 180:
                text(d, (cx + (r - 34) * math.sin(a), cy - (r - 34) * math.cos(a)), str(k if k <= 180 else 360 - k), 12, WHITE)
    d.polygon([(cx, cy - 46), (cx - 16, cy + 40), (cx + 16, cy + 40)], outline=DIM)             # the ship
    a = math.radians(310)
    d.line((cx + (r - 22) * math.sin(a), cy - (r - 22) * math.cos(a), cx + 34 * math.sin(a), cy - 34 * math.cos(a)), fill=(255, 220, 80), width=5)
    d.rectangle((cx - 36, cy + 50, cx + 36, cy + 80), fill=(8, 10, 10), outline=DIM)
    text(d, (cx, cy + 65), '14 kn', 16, AMBER, kind='m')
    return im


def clock():
    w = h = 256
    im, d = sheet(w, h, WHITE)
    cx = cy = 128
    for k in range(60):
        a = math.radians(k * 6)
        big = k % 5 == 0
        d.line((cx + (116 - (16 if big else 8)) * math.sin(a), cy - (116 - (16 if big else 8)) * math.cos(a), cx + 116 * math.sin(a), cy - 116 * math.cos(a)), fill=(20, 20, 20), width=4 if big else 1)
    for k in range(1, 13):
        a = math.radians(k * 30)
        text(d, (cx + 84 * math.sin(a), cy - 84 * math.cos(a)), str(k), 22, (20, 20, 20))
    for k in (0, 1, 2, 5, 6, 7):                       # the radio silence periods are not kept any more; a plain face
        pass
    for ang, ln, wd in ((math.radians(11 * 30 + 20), 58, 7), (math.radians(40 * 6), 92, 5)):
        d.line((cx, cy, cx + ln * math.sin(ang), cy - ln * math.cos(ang)), fill=(20, 20, 20), width=wd)
    a = math.radians(140)
    d.line((cx - 20 * math.sin(a), cy + 20 * math.cos(a), cx + 100 * math.sin(a), cy - 100 * math.cos(a)), fill=(190, 40, 30), width=2)
    d.ellipse((cx - 7, cy - 7, cx + 7, cy + 7), fill=(20, 20, 20))
    text(d, (cx, cy + 44), 'QUARTZ', 9, (90, 90, 90), kind='r')
    return im


def barometer():
    w = h = 256
    im, d = sheet(w, h, WHITE)
    cx = cy = 128
    for i in range(0, 101):
        v = 960 + i
        a = math.radians(-150 + 300 * i / 100)
        big = v % 10 == 0
        d.line((cx + (116 - (18 if big else (12 if v % 5 == 0 else 7))) * math.sin(a), cy - (116 - (18 if big else (12 if v % 5 == 0 else 7))) * math.cos(a), cx + 116 * math.sin(a), cy - 116 * math.cos(a)), fill=(20, 20, 20), width=2 if big else 1)
        if big:
            text(d, (cx + 82 * math.sin(a), cy - 82 * math.cos(a)), str(v), 12, (20, 20, 20))
    for s, a in (('RAIN', -80), ('CHANGE', 0), ('FAIR', 80)):
        text(d, (cx + 52 * math.sin(math.radians(a)), cy - 52 * math.cos(math.radians(a)) + 8), s, 9, (90, 90, 90), kind='r')
    a = math.radians(-150 + 300 * (1014 - 960) / 100)
    d.line((cx, cy, cx + 100 * math.sin(a), cy - 100 * math.cos(a)), fill=(20, 20, 20), width=3)
    a2 = math.radians(-150 + 300 * (1009 - 960) / 100)
    d.line((cx, cy, cx + 96 * math.sin(a2), cy - 96 * math.cos(a2)), fill=(190, 150, 40), width=2)
    d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=(190, 150, 40))
    text(d, (cx, cy + 60), 'hPa', 12, (20, 20, 20))
    return im


def clinometer():
    w = h = 256
    im, d = sheet(w, h, WHITE)
    cx, cy = 128, 60
    for k in range(-30, 31, 2):
        a = math.radians(180 - k * 1.6)
        big = k % 10 == 0
        r0 = 172 - (20 if big else 10)
        d.line((cx + r0 * math.sin(a), cy - r0 * math.cos(a), cx + 172 * math.sin(a), cy - 172 * math.cos(a)), fill=(20, 20, 20), width=3 if big else 1)
        if big:
            text(d, (cx + 136 * math.sin(a), cy - 136 * math.cos(a)), str(abs(k)), 15, (20, 20, 20))
    a = math.radians(180 - 1 * 1.6)
    d.line((cx, cy, cx + 160 * math.sin(a), cy - 160 * math.cos(a)), fill=(190, 40, 30), width=3)
    d.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), fill=(20, 20, 20))
    text(d, (64, 40), 'PORT', 12, (190, 40, 30))
    text(d, (192, 40), 'STBD', 12, (20, 110, 60))
    text(d, (cx, 22), 'LIST', 11, (90, 90, 90))
    return im


def card():
    """A compass card: the heading repeater's, under the azimuth ring of a pelorus."""
    w = h = 256
    im, d = sheet(w, h, (238, 236, 226))
    cx = cy = 128
    for k in range(0, 360, 2):
        a = math.radians(k - HEADING)
        big = k % 10 == 0
        r0 = 120 - (18 if big else 9)
        d.line((cx + r0 * math.sin(a), cy - r0 * math.cos(a), cx + 120 * math.sin(a), cy - 120 * math.cos(a)), fill=(20, 20, 20), width=2 if big else 1)
        if k % 30 == 0:
            text(d, (cx + 88 * math.sin(a), cy - 88 * math.cos(a)), 'N' if k == 0 else f'{k // 10}', 16, (190, 40, 30) if k == 0 else (20, 20, 20))
    d.line((cx, cy - 122, cx, cy - 96), fill=(190, 40, 30), width=4)
    d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=(20, 20, 20))
    return im


def rpm_small():
    w = h = 256
    im, d = sheet(w, h, (14, 16, 17))
    gauge(d, 128, 128, 116, 0, 2400, 1480, 'ENGINES', 'rpm', 400, red=(2100, 2400))
    return im


def fire_panel():
    w, h = 336, 416
    im, d = sheet(w, h, (52, 56, 58))
    d.rectangle((0, 0, w, 40), fill=(170, 34, 28))
    text(d, (w / 2, 20), 'FIRE DETECTION', 16, WHITE)
    lcd(d, (20, 56, w - 20, 148), ['SYSTEM NORMAL', 'LOOPS 1-4  OK', '10 NOV  03:41', 'CHISUM'], 14, AMBER, (30, 22, 6))
    for i, (s, c, on) in enumerate((('FIRE', RED, False), ('FAULT', YELLOW, False), ('DISABLED', YELLOW, False), ('POWER', GREEN, True))):
        led(d, 44 + i * 82, 176, 7, c, on)
        text(d, (44 + i * 82, 198), s, 9)
    text(d, (w / 2, 226), 'ZONES', 10)
    zones = ('BRIDGE DECK', 'PASSENGER DECK', 'CAR DECK', 'ENGINE ROOM', 'MACHINERY FWD', 'STEERING GEAR', 'EM. GENERATOR', 'CO₂ ROOM')
    for i, s in enumerate(zones):
        x, y = 30 + (i % 2) * 150, 250 + (i // 2) * 24
        led(d, x, y, 5, RED, on=False)
        text(d, (x + 14, y), s, 9, INK, 'lm')
    for i, (s, c) in enumerate((('ACCEPT', (200, 150, 40)), ('SILENCE', (70, 80, 86)), ('RESET', (70, 80, 86)), ('TEST', (70, 80, 86)))):
        key(d, 50 + i * 78, 374, 68, 34, c, s, 9)
    return im


def board_door(w, h, tag, name, lines, ways, volts, meters=2, lamps=3):
    """The door of a distribution board: its name plate, its meters and earth lamps, and the list of its ways."""
    im, d = sheet(w, h, (188, 196, 194))
    d.rectangle((3, 3, w - 4, h - 4), outline=(120, 128, 126), width=3)
    d.rectangle((16, 14, w - 16, 76), fill=(24, 26, 28), outline=(230, 230, 226), width=2)
    text(d, (w / 2, 34), f'{tag}  {name}', 15 if len(name) < 26 else 12, (240, 240, 236))
    text(d, (w / 2, 58), lines, 11, (240, 240, 236), kind='r')
    small = h < 320
    y = 84 if small else 96
    mw = 44 if small else 62
    for i in range(meters):
        x = w / 2 + (i - (meters - 1) / 2) * (mw + 22)
        d.rectangle((x - mw / 2, y, x + mw / 2, y + mw), fill=(244, 242, 236), outline=(30, 30, 30), width=2)
        k = mw / 62
        d.arc((x - 24 * k, y + 14 * k, x + 24 * k, y + 62 * k), 215, 325, fill=(30, 30, 30), width=2)
        a = math.radians(-20 + 30 * i)
        d.line((x, y + 46 * k, x + 26 * k * math.sin(a), y + 46 * k - 26 * k * math.cos(a)), fill=(190, 40, 30), width=2)
        text(d, (x, y + 52 * k), 'V' if i == 0 else 'A', 11 if not small else 9, (30, 30, 30))
    if lamps:
        text(d, (w / 2, y + mw + 16), 'EARTH FAULT' if lamps > 1 else 'SUPPLY', 9, (40, 44, 46))
        for i in range(lamps):
            led(d, w / 2 + (i - (lamps - 1) / 2) * 28, y + mw + 36, 6, (255, 250, 220) if lamps > 1 else GREEN)
    y0 = y + mw + (10 if small else 58)
    d.rectangle((16, y0, w - 16, h - 14), fill=(246, 244, 236), outline=(30, 30, 30))
    text(d, (24, y0 + 11), f'WAYS   {volts}', 10 if not small else 9, (30, 30, 30), 'lm')
    step = min(20.0, (h - 22 - y0 - 20) / max(len(ways), 1))
    for i, s in enumerate(ways):
        text(d, (24, y0 + 28 + i * step), s, 10 if not small else 9, (30, 30, 30), 'lm', 'r')
    return im


def flags():
    w, h = 288, 608
    im, d = sheet(w, h, (70, 46, 28))
    rng = random.Random(11)
    cols = [(210, 40, 40), (245, 220, 50), (30, 70, 170), (245, 245, 240), (20, 20, 24)]
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789123A'
    for r in range(10):
        for c in range(4):
            x0, y0 = 8 + c * 69, 8 + r * 59.4
            d.rectangle((x0, y0, x0 + 64, y0 + 54), fill=(24, 16, 10))
            a, b = rng.sample(cols, 2)
            d.rounded_rectangle((x0 + 6, y0 + 16, x0 + 58, y0 + 50), radius=12, fill=a)
            d.rounded_rectangle((x0 + 6, y0 + 30, x0 + 58, y0 + 50), radius=12, fill=b)
            d.rectangle((x0 + 20, y0 + 2, x0 + 44, y0 + 13), fill=(226, 214, 180))
            text(d, (x0 + 32, y0 + 8), letters[r * 4 + c], 9, (30, 20, 10))
    return im


def logbook():
    w, h = 256, 176
    im, d = sheet(w, h, (246, 242, 228))
    d.line((w / 2, 0, w / 2, h), fill=(150, 140, 120), width=3)
    for k in range(1, 12):
        d.line((8, k * 14 + 6, w - 8, k * 14 + 6), fill=(150, 170, 200))
    for x in (40, 84, w / 2 + 40, w / 2 + 84):
        d.line((x, 12, x, h - 6), fill=(200, 150, 150))
    rng = random.Random(5)
    for k in range(1, 7):
        for x0 in (10, 44, 90):
            d.line((x0, k * 14 + 2, x0 + rng.uniform(12, 30), k * 14 + 2 + rng.uniform(-1, 1)), fill=(40, 50, 110), width=1)
    text(d, (62, 8), 'DECK LOG', 8, (60, 60, 60))
    return im


def books():
    w, h = 528, 208
    im, d = sheet(w, h, (40, 28, 18))
    rng = random.Random(21)
    x = 6
    names = ('TIDE TABLES', 'LIST OF LIGHTS', 'RADIO SIGNALS', 'SIGNAL CODE', 'COLREG', 'SOLAS', 'STABILITY', 'MANOEUVRING', 'PILOT VOL 1', 'PILOT VOL 2', 'SHIP MANUALS', 'GMDSS', 'CHART CAT.')
    cols = [(30, 60, 110), (130, 30, 30), (30, 90, 60), (200, 170, 60), (60, 60, 66), (150, 80, 30), (220, 215, 200)]
    i = 0
    while x < w - 30:
        bw = rng.choice((30, 36, 44, 52))
        c = cols[i % len(cols)]
        top = rng.choice((8, 14, 20, 4))
        d.rectangle((x, top, x + bw - 2, h), fill=c)
        d.rectangle((x, top + 18, x + bw - 2, top + 22), fill=tuple(min(255, v + 50) for v in c))
        t = Image.new('RGBA', (160, 16), (0, 0, 0, 0))
        ImageDraw.Draw(t).text((80, 8), names[i % len(names)], font=font(10), fill=(240, 236, 220) if sum(c) < 420 else (30, 30, 30), anchor='mm')
        t = t.rotate(90, expand=True)
        im.paste(t, (int(x + bw / 2 - 9), top + 30), t)
        x += bw
        i += 1
    return im


def sign(w, h, bg, lines, ink=WHITE, size=13, border=True):
    im, d = sheet(w, h, bg)
    if border:
        d.rectangle((2, 2, w - 3, h - 3), outline=ink, width=2)
    for i, s in enumerate(lines):
        text(d, (w / 2, h / 2 + (i - (len(lines) - 1) / 2) * (size + 4)), s, size, ink)
    return im


def firstaid():
    im, d = sheet(240, 208, (232, 236, 232))
    d.rectangle((70, 30, 170, 130), fill=(30, 140, 70))
    d.rectangle((108, 44, 132, 116), fill=WHITE)
    d.rectangle((84, 68, 156, 92), fill=WHITE)
    text(d, (120, 164), 'FIRST AID', 18, (30, 110, 60))
    return im


def callpoint():
    im, d = sheet(128, 128, (196, 40, 32))
    d.rectangle((14, 14, 113, 113), fill=(240, 240, 236), outline=(20, 20, 20), width=2)
    d.ellipse((54, 62, 74, 82), fill=(20, 20, 20))
    text(d, (64, 34), 'FIRE', 16, (20, 20, 20))
    text(d, (64, 100), 'BREAK GLASS', 8, (20, 20, 20))
    return im


def lever_scale(across=False):
    im, d = sheet(112, 288, (24, 26, 28))
    for i, (s, c) in enumerate((('FULL', GREEN), ('HALF', GREEN), ('SLOW', GREEN), ('STOP', WHITE), ('SLOW', RED), ('HALF', RED), ('FULL', RED))):
        y = 26 + i * 39
        d.line((8, y, 40, y), fill=c, width=3)
        text(d, (78, y), s, 11, c)
    text(d, (78, 8), 'AHEAD', 8, GREEN)
    text(d, (78, 280), 'ASTERN', 8, RED)
    if across:
        im2, d2 = sheet(288, 112, (24, 26, 28))
        for i, s in enumerate(('100', '50', '0', '50', '100')):
            x = 30 + i * 57
            d2.line((x, 8, x, 40), fill=RED if i < 2 else GREEN if i > 2 else WHITE, width=3)
            text(d2, (x, 62), s, 12, RED if i < 2 else GREEN if i > 2 else WHITE)
        text(d2, (40, 92), 'PORT', 11, RED)
        text(d2, (248, 92), 'STBD', 11, GREEN)
        text(d2, (144, 92), 'THRUST %', 9, DIM)
        return im2
    return im


def talkback():
    im, d = sheet(128, 176, (228, 216, 60))
    for k in range(7):
        d.line((24, 22 + k * 11, 104, 22 + k * 11), fill=(30, 30, 30), width=5)
    d.ellipse((44, 112, 84, 152), fill=(30, 30, 30))
    text(d, (64, 166), 'PRESS TO TALK', 8, (30, 30, 30))
    return im


def tiles():
    # The ways lettered on each board's door are the register's own (ferry/systems/bridge.py): the door cannot say otherwise.
    sys.path.insert(0, os.path.join(HERE, '..', 'systems'))
    import bridge as REG
    ways = lambda board: [f'{no}  {name[:40]:<40s} {breaker:>2d} A' for b, no, name, breaker, mm2, pf in REG.CIRCUITS if b == board]
    BD1, BD2 = ways('BD1'), ways('BD2')
    short = {1: 'GPS', 2: 'AIS', 3: 'Sat compass', 4: 'Sounder', 5: 'Log', 6: 'Nav data', 7: 'Autopilot', 8: 'Propulsion', 9: 'Thruster', 10: 'Talkback',
             11: 'Alarms', 12: 'Repeaters', 13: 'Wind', 14: 'PA battery', 15: 'Lights', 16: 'Signal lamp'}
    nos = [no for b, no, *_ in REG.CIRCUITS if b == 'DC1']
    assert set(nos) <= set(short), 'a way of DC1 has no short name for its door'
    DC1 = ['  '.join(f'{n} {short[n]}' for n in nos[i:i + 4]) for i in range(0, len(nos), 4)]
    DC2 = ['1 VHF No. 1    2 VHF No. 2', '3 NAVTEX    4 GPS (second supply)', '5 Portable VHF charger']
    return {
        'radar': (radar(), 'screen'), 'ecdis': (ecdis(), 'screen'), 'conning': (conning(), 'screen'), 'echo': (echo(), 'screen'), 'gps': (gps(), 'screen'),
        'ais': (ais(), 'screen'), 'cctv': (cctv(), 'screen'), 'hdg': (hdg(), 'screen'),
        'vhf1': (vhf('16', 'DSC WATCH 70'), 'face'), 'vhf2': (vhf('12', 'PORT OPS', 304, 208, False), 'face'), 'navtex': (navtex(), 'face'),
        'radar_kbd': (keyboard(512, 160), 'face'), 'ecdis_kbd': (keyboard(384, 160), 'face'),
        'alarm_panel': (alarm_panel(), 'face'), 'bnwas': (bnwas(), 'face'), 'prop_panel': (prop_panel(), 'face'), 'thr_panel': (thr_panel(), 'face'),
        'whistle_panel': (whistle_panel(), 'face'), 'sl_panel': (sl_panel(), 'face'), 'wiper_panel': (wiper_panel(), 'face'), 'dimmer_panel': (dimmer_panel(), 'face'),
        'ramp_panel': (ramp_panel(), 'face'), 'pa_panel': (pa_panel(), 'face'), 'phone': (phone(), 'face'), 'navlight_panel': (navlight_panel(), 'face'),
        'autopilot': (autopilot(), 'face'), 'steer_mode': (steer_mode(), 'face'), 'engine_panel': (engine_panel(), 'face'),
        'rai_panel': (rudder_dial(256, 276, 110, 142), 'face'), 'rai': (rudder_dial(256, 256, 120, 128), 'face'), 'wind': (wind(), 'face'),
        'clock': (clock(), 'face'), 'barometer': (barometer(), 'face'), 'clinometer': (clinometer(), 'face'), 'card': (card(), 'face'), 'rpm': (rpm_small(), 'face'),
        'fire_panel': (fire_panel(), 'face'),
        'bd1': (board_door(384, 544, 'BD1', 'WHEELHOUSE DISTRIBUTION', '105 V  60 Hz  ·  FROM LIGHTING BOARD  ·  40 A', BD1, '105 V, two-pole'), 'face'),
        'bd2': (board_door(304, 496, 'BD2', 'EMERGENCY', '105 V  ·  FROM EMERGENCY SWBD  ·  16 A', BD2, '105 V, two-pole'), 'face'),
        'dc1': (board_door(352, 288, 'DC1', '24 V DC  NAVIGATION', 'GENERAL SERVICE BATTERY  ·  40 A', DC1, '24 V, fused', meters=1, lamps=0), 'face'),
        'dc2': (board_door(352, 288, 'DC2', '24 V DC  RADIO', 'RADIO BATTERY  ·  25 A', DC2, '24 V, fused', meters=1, lamps=0), 'face'),
        'flags': (flags(), 'face'), 'chart': (paper_chart(), 'face'), 'logbook': (logbook(), 'face'), 'books': (books(), 'face'), 'firstaid': (firstaid(), 'face'),
        'callpoint': (callpoint(), 'face'), 'ga_push': (sign(128, 128, (236, 190, 40), ['GENERAL', 'ALARM'], (20, 20, 20), 13), 'face'),
        'bnwas_reset': (sign(128, 128, (60, 68, 70), ['WATCH', 'RESET'], WHITE, 13), 'face'),
        'lever_scale': (lever_scale(), 'face'), 'thr_scale': (lever_scale(True), 'face'), 'talkback': (talkback(), 'face'),
        'hose': (sign(256, 96, (190, 40, 32), ['FIRE HOSE'], WHITE, 22), 'face'),
        'exit': (sign(256, 96, (30, 130, 70), ['EXIT'], WHITE, 34, border=False), 'face'),
        'nameplate': (sign(384, 64, (24, 26, 28), ['CHISUM   ·   MINATO'], (226, 200, 120), 20), 'face'),
    }


def pack(items):
    """Shelves across the sheet, tallest pictures first. Returns the sheet and each picture's place on it."""
    order = sorted(items, key=lambda k: (-items[k][0].size[1], -items[k][0].size[0], k))
    x = y = PAD
    row = 0
    place = {}
    for name in order:
        w, h = items[name][0].size
        if x + w + PAD > WIDTH:
            x, y, row = PAD, y + row + PAD, 0
        place[name] = (x, y)
        x += w + PAD
        row = max(row, h)
    height = -(-(y + row + PAD) // 64) * 64
    im = Image.new('RGB', (WIDTH, height), (30, 30, 30))
    for name, (px, py) in place.items():
        pic = items[name][0]
        # a rim of the picture's own edge round it, so that a small picture seen from afar does not take its neighbour's colour
        im.paste(pic.resize((pic.size[0] + PAD, pic.size[1] + PAD), Image.NEAREST), (px - PAD // 2, py - PAD // 2))
        im.paste(pic, (px, py))
    uv = {}
    for name, (px, py) in place.items():
        w, h = items[name][0].size
        uv[name] = dict(uv=[round((px + 0.5) / WIDTH, 6), round(1 - (py + h - 0.5) / height, 6), round((px + w - 0.5) / WIDTH, 6), round(1 - (py + 0.5) / height, 6)],
                        px=[w, h], kind=items[name][1])
    return im, uv, height


def main():
    args = sys.argv[1:]
    opt = dict(zip(args[::2], args[1::2]))
    out = opt.get('--out', os.path.join(HERE, '..', 'data', 'chisum-atlas.webp'))
    tiles_path = opt.get('--tiles', os.path.join(HERE, 'atlas.json'))
    items = tiles()
    im, uv, height = pack(items)
    im.save(out, 'WEBP', quality=90, method=6)
    json.dump(dict(file=os.path.basename(out), size=[WIDTH, height], tiles=uv), open(tiles_path, 'w'), indent=1, sort_keys=True)
    if '--preview' in opt:
        os.makedirs(opt['--preview'], exist_ok=True)
        im.save(os.path.join(opt['--preview'], 'atlas.png'))
    used = sum(v[0].size[0] * v[0].size[1] for v in items.values())
    print(f'{out}: {WIDTH} × {height}, {len(items)} pictures, {100 * used / (WIDTH * height):.0f} % of the sheet, {os.path.getsize(out)} bytes')


if __name__ == '__main__':
    main()
