"""The Johansson sailor's walk: a cut-out puppet of the owner's own drawing.

Frame 0 of the cycle is the owner's walk drawing, piece for piece. The head, striped torso, both arms
and both boots are the drawing itself (tools/cut_parts.py); only the trouser legs and the seat are
redrawn each frame, as plain inked hoses in the same line weight.

Coordinates: `u` = one pixel of the reference sheet. World origin is on the ground under the pelvis.
"""
import json
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PARTS_DIR = ROOT / 'art' / 'parts'
UP = 4                       # working enlargement (the parts are stored at this size)
OUT_SCALE = 2                # film pixels per u
ORIGIN = (845, 716)          # sheet position of the world origin
CELL = (-250, -335, 250, 25) # world box of one frame, in u
FRAMES = 36                  # one cycle = two steps: an easy stroll, 80 steps a minute
STRIDE = 196.0               # u travelled per cycle (the sheet's marching step is 147; he strolls at 98)
INK = 6.5                    # line weight of the drawing, u

_meta = json.loads((PARTS_DIR / 'parts.json').read_text())['parts']


def world(p):
    return (p[0] - ORIGIN[0], p[1] - ORIGIN[1])


def rot(v, a):
    c, s = math.cos(a), math.sin(a)
    return (v[0] * c - v[1] * s, v[0] * s + v[1] * c)


def add(a, b):
    return (a[0] + b[0], a[1] + b[1])


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1])


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


class Part:
    def __init__(self, name):
        m = _meta[name]
        self.img = Image.open(PARTS_DIR / f'{name}.png').convert('RGBA')
        self.origin = m['origin']
        self.pts = {k: world(m[k]) for k in ('pivot', 'heel', 'ball') if k in m}

    def local(self, wpt):
        """World point -> pixel in this part's image."""
        return ((wpt[0] + ORIGIN[0] - self.origin[0]) * UP, (wpt[1] + ORIGIN[1] - self.origin[1]) * UP)


PARTS = {n: Part(n) for n in _meta}


class Canvas:
    def __init__(self):
        self.w = (CELL[2] - CELL[0]) * UP
        self.h = (CELL[3] - CELL[1]) * UP
        self.img = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))

    def px(self, p):
        return ((p[0] - CELL[0]) * UP, (p[1] - CELL[1]) * UP)

    def place(self, part, anchor, at, angle=0.0):
        """Put `part` so its own world point `anchor` lands on `at`, turned by `angle` about it."""
        c, s = math.cos(angle), math.sin(angle)
        ax, ay = part.local(anchor)
        X, Y = self.px(at)
        data = (c, s, ax - c * X - s * Y, -s, c, ay + s * X - c * Y)
        t = part.img.transform((self.w, self.h), Image.AFFINE, data, resample=Image.BICUBIC)
        self.img.alpha_composite(t)

    def shape(self, prims):
        """White shapes with one ink outline round their union. prims: ('hose', pts, r) | ('poly', pts)."""
        layer = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        for grow, col in ((INK * UP, (0, 0, 0, 255)), (0, (255, 255, 255, 255))):
            for prim in prims:
                pts = [self.px(p) for p in prim[1]]
                if prim[0] == 'hose':
                    r = prim[2] * UP + grow
                    d.line(pts, fill=col, width=round(2 * r), joint='curve')
                    for x, y in pts:
                        d.ellipse([x - r, y - r, x + r, y + r], fill=col)
                else:
                    d.polygon(pts, fill=col)
                    if grow:
                        d.line(pts + pts[:2], fill=col, width=round(2 * grow), joint='curve')
        self.img.alpha_composite(layer)

    def result(self):
        return self.img.resize((self.w * OUT_SCALE // UP, self.h * OUT_SCALE // UP), Image.LANCZOS)


# ---- feet ----------------------------------------------------------------------------------------
HEEL_X0 = 40.0                                    # where the leading heel strikes, ahead of the pelvis
STANCE = 0.60                                     # share of the cycle a boot is on the quay
FLAT = PARTS['foot_flat']
HEELED = PARTS['foot_heel']
BALL_DX = FLAT.pts['ball'][0] - FLAT.pts['heel'][0]
T_SLAP, T_FLAT, T_OFF = 0.03, 0.085, 0.45
TOE_OFF = math.radians(38)
STRIKE = math.radians(24)     # the toe-up drawing, lowered this far for an easy heel strike


def foot(p):
    """Which boot drawing, the point of it that is pinned, where, and its turn. Never slides."""
    p %= 1.0
    hx = HEEL_X0 - STRIDE * p                      # where the heel is (or would be) on the ground
    if p < T_SLAP:
        return HEELED, 'heel', (hx, 0), STRIKE
    if p < T_FLAT:
        return FLAT, 'heel', (hx, 0), math.radians(lerp(-11, 0, smooth((p - T_SLAP) / (T_FLAT - T_SLAP))))
    if p < T_OFF:
        return FLAT, 'heel', (hx, 0), 0.0
    if p < STANCE:
        th = TOE_OFF * smooth((p - T_OFF) / (STANCE - T_OFF)) ** 1.2
        return FLAT, 'ball', (hx + BALL_DX, 0), th
    # swing: carry the heel from where it left the ground to the next strike
    s = (p - STANCE) / (1 - STANCE)
    th0 = TOE_OFF
    ball0 = (HEEL_X0 - STRIDE * STANCE + BALL_DX, 0)
    heel0 = add(ball0, rot((-BALL_DX, 0), th0))
    heel1 = (HEEL_X0, 0)
    e = smooth(s)
    x = lerp(heel0[0], heel1[0], lerp(s, e, 0.6))
    y = lerp(heel0[1], heel1[1], e) - 15 * math.sin(math.pi * s) ** 1.1
    if s < 0.72:
        return FLAT, 'heel', (x, y), lerp(th0, math.radians(-12), smooth(s / 0.72))
    return HEELED, 'heel', (x, y), lerp(math.radians(32), STRIKE, smooth((s - 0.72) / 0.28))


def ankle(p):
    part, key, at, th = foot(p)
    return add(at, rot(sub(part.pts['pivot'], part.pts[key]), th))


def hose(a, b, rest, n=12):
    """A rubber-hose leg from hip a to ankle b: it bows forward when it has slack, stretches when not."""
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1.0
    bend = math.sqrt(max(0.0, rest * rest - L * L)) * 0.55
    nx, ny = -dy / L, dx / L
    if nx < 0:
        nx, ny = -nx, -ny
    c = ((a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend)
    return [((1 - t) ** 2 * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0],
             (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]) for t in (i / n for i in range(n + 1))]


# ---- body ----------------------------------------------------------------------------------------
PELVIS = world((846, 635))
HIP_NEAR = world((858, 640))
HIP_FAR = world((828, 638))
FAR_SHOULDER = (878, 550)    # sheet px: where the hanging arm hangs on his far side
LEG_R = 14.0
LEG_REST = 60.0


def lift(ph):
    """Pelvis height: sinks just after each heel strike, rises as the legs pass."""
    return 1.0 - 3.0 * math.cos(4 * math.pi * (ph - 0.07))


def pose(ph):
    up = lift(ph)
    lean = math.radians(0.9 * math.sin(4 * math.pi * (ph - 0.02)))        # chest rocks over each step
    sway = 1.5 * math.sin(2 * math.pi * ph)
    body = (sway, -up)

    def on_torso(sheet_pt):
        piv = PARTS['torso'].pts['pivot']
        return add(add(piv, rot(sub(world(sheet_pt), piv), lean)), body)

    swing = lambda x: (1 - math.cos(2 * math.pi * x)) / 2                  # 0 back, 1 forward
    head_up = lift(ph - 1.6 / FRAMES)                                       # the head arrives a beat late
    return dict(
        body=body, lean=lean, on_torso=on_torso,
        # both arms are the hanging-arm drawing; it is drawn 46 degrees back, so turn it forward
        arm_near=math.radians(lerp(-12, -84, swing(ph - 0.05))),
        arm_far=math.radians(lerp(-12, -84, swing(ph + 0.5 - 0.05))),
        shrug=1.6 * math.sin(4 * math.pi * (ph - 0.16)),      # shoulders ride up a touch after each step
        head=(sway * 1.2, -(head_up * 1.15)),
        head_tilt=math.radians(1.3 * math.sin(4 * math.pi * (ph - 0.12))),
    )


def mouth_point(i):
    """Where his lips are in frame i (world u): the whistled notes start here."""
    ph = (i % FRAMES) / FRAMES
    P = pose(ph)
    Hd = PARTS['head']
    at = add(P['on_torso'](add(Hd.pts['pivot'], ORIGIN)), sub(P['head'], P['body']))
    return add(at, rot(sub(world((866, 503)), Hd.pts['pivot']), P['head_tilt']))


def frame(i, frames=FRAMES, face='head'):
    ph = (i % frames) / frames
    P = pose(ph)
    c = Canvas()
    T = PARTS['torso']
    # far arm, behind everything
    A = PARTS['arm_near']
    c.place(A, A.pts['pivot'], add(P['on_torso'](FAR_SHOULDER), (0, -P['shrug'])), P['arm_far'] + P['lean'])
    # far leg
    for hip, shift, parts_first in ((HIP_FAR, 0.5, None), (HIP_NEAR, 0.0, 'seat')):
        part, key, at, th = foot(ph + shift)
        h = add(hip, P['body'])
        leg = ('hose', hose(h, ankle(ph + shift), LEG_REST), LEG_R)
        if parts_first:
            seat = [add(add(PELVIS, P['body']), (31 * math.cos(t), 19 * math.sin(t)))
                    for t in (k * 2 * math.pi / 36 for k in range(36))]
            c.shape([('poly', seat), leg])
        else:
            c.shape([leg])
        c.place(part, part.pts[key], at, th)
    c.place(T, T.pts['pivot'], add(T.pts['pivot'], P['body']), P['lean'])
    Hd = PARTS[face]
    c.place(Hd, Hd.pts['pivot'], add(P['on_torso'](add(Hd.pts['pivot'], ORIGIN)), sub(P['head'], (P['body'][0], P['body'][1]))),
            P['head_tilt'])
    N = PARTS['arm_near']
    c.place(N, N.pts['pivot'], add(P['on_torso'](add(N.pts['pivot'], ORIGIN)), (0, -P['shrug'])), P['arm_near'] + P['lean'])
    return c.result()


if __name__ == '__main__':
    import sys
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'build'
    out.mkdir(parents=True, exist_ok=True)
    fr = [frame(i) for i in range(FRAMES)]
    w, h = fr[0].size
    cols = 7
    sheet = Image.new('RGB', (w * cols // 2, h * ((FRAMES + cols - 1) // cols) // 2), (150, 190, 225))
    for i, f in enumerate(fr):
        s = f.resize((w // 2, h // 2), Image.LANCZOS)
        sheet.paste(s, ((i % cols) * w // 2, (i // cols) * h // 2), s)
    sheet.save(out / 'walk-contact-sheet.png')
    print(w, h, sheet.size)
