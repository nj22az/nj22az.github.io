"""The Johansson sailor's walk: a vector character traced from the owner's own drawing.

Every curve of him is the owner's (tools/cut_parts.py cuts the walk drawing, tools/vectorise.py traces
it). Here the curves are moved point by point: his arm bends at the elbow, his boot at the ball of
the foot, his chest turns against his hips. Nothing is a rigid picture and no drawing is swapped for
another, so the motion is continuous at any frame rate. Only the trouser legs, the seat and the neck
are drawn by the program, as hoses in the sheet's line weight.

Coordinates: `u` = one pixel of the reference sheet. World origin is on the ground under the pelvis.
Time: `ph` is the phase of the walk, 0..1 over two steps.
"""
import json
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT_SCALE = 2                # film pixels per u
AA = 3                       # drawn three times larger, then reduced
ORIGIN = np.array([845.0, 716.0])
CELL = (-250, -335, 250, 25) # world box of one frame, in u
CYCLE_SECONDS = 1.5          # two steps: 80 steps a minute
STRIDE = 264.0               # u travelled per cycle; the sheet's own walk drawing steps 147, he steps 132
INK = 6.5                    # line weight of the drawing, u
BLACK, WHITE = (0, 0, 0, 255), (255, 255, 255, 255)

_data = json.loads((ROOT / 'art' / 'vector' / 'sailor.json').read_text())


class Part:
    def __init__(self, name):
        d = _data[name]
        self.shapes = [(BLACK if s['fill'] == 0 else WHITE, np.array(s['pts']) - ORIGIN) for s in d['shapes']]


PARTS = {n: Part(n) for n in ('head', 'torso', 'arm_near', 'foot_flat')}


def W(x, y):
    """Sheet pixel -> world."""
    return np.array([x, y], float) - ORIGIN


def rotm(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s], [s, c]])


class Xf:
    """p -> at + R(angle) . (scale * (p - anchor)); works on one point or an array of points."""

    def __init__(self, anchor, at, angle=0.0, scale=(1.0, 1.0)):
        self.anchor, self.at = np.asarray(anchor, float), np.asarray(at, float)
        self.m = rotm(angle) @ np.diag(scale)

    def __call__(self, p):
        return (np.asarray(p, float) - self.anchor) @ self.m.T + self.at


def blend(p, xa, xb, joint, along, width):
    """Two bones meeting at `joint`: points before it follow xa, points beyond it (in direction
    `along`) follow xb, and across `width` they are shared, so the shape bends instead of breaking."""
    d = (np.asarray(p, float) - joint) @ along
    w = np.clip((d + width) / (2 * width), 0, 1)
    w = (w * w * (3 - 2 * w))[:, None]
    return xa(p) * (1 - w) + xb(p) * w


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def swing(x):
    return (1 - math.cos(2 * math.pi * x)) / 2          # 0 back, 1 forward


class Canvas:
    def __init__(self, box=CELL):
        self.box = box
        self.k = OUT_SCALE * AA
        self.size = (round((box[2] - box[0]) * self.k), round((box[3] - box[1]) * self.k))
        self.img = Image.new('RGBA', self.size, (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def px(self, pts):
        p = (np.asarray(pts, float) - (self.box[0], self.box[1])) * self.k
        return [tuple(q) for q in p.tolist()]

    def shapes(self, part, fn):
        for col, pts in part.shapes:
            self.d.polygon(self.px(fn(pts)), fill=col)

    def poly(self, pts, col):
        self.d.polygon(self.px(pts), fill=col)

    def hoses(self, hoses, extra=()):
        """White hoses (and `extra` polygons) with one ink line round their union."""
        for grow, col in ((INK, BLACK), (0, WHITE)):
            for pts, r in hoses:
                pts = np.asarray(pts, float)               # a hose is a string of discs, close together
                seg = np.hypot(*np.diff(pts, axis=0).T)
                at = np.concatenate([[0], np.cumsum(seg)])
                t = np.linspace(0, at[-1], max(2, int(at[-1] / 1.2) + 1))
                dense = np.stack([np.interp(t, at, pts[:, 0]), np.interp(t, at, pts[:, 1])], 1)
                w = (r + grow) * self.k
                for x, y in self.px(dense):
                    self.d.ellipse([x - w, y - w, x + w, y + w], fill=col)
            for pts in extra:
                p = self.px(pts)
                self.d.polygon(p, fill=col)
                if grow:
                    self.d.line(p + p[:2], fill=col, width=round(2 * grow * self.k), joint='curve')

    def line(self, pts, width, col=BLACK):
        p = self.px(pts); w = width * self.k / 2
        self.d.line(p, fill=col, width=max(1, round(2 * w)), joint='curve')
        for x, y in (p[0], p[-1]):
            self.d.ellipse([x - w, y - w, x + w, y + w], fill=col)

    def result(self):
        return self.img.resize((self.size[0] // AA, self.size[1] // AA), Image.LANCZOS)


# ---- feet ----------------------------------------------------------------------------------------
HEEL, BALL, ANKLE = W(758, 716), W(806, 716), W(806, 660)     # on the boot drawing
BALL_DX = BALL[0] - HEEL[0]
HEEL_X0 = 56.0               # where the heel strikes, ahead of the pelvis
STANCE = 0.60                # share of the cycle a boot is on the quay
T_FLAT, T_OFF = 0.085, 0.42
STRIKE = math.radians(-22)   # toe up as the heel lands
TOE_OFF = math.radians(54)   # heel high as the toe leaves


def boot(p):
    """Where the ball of the foot is, and the turn of the boot behind the ball and of the toe.
    While the boot is down, the part that touches the quay moves exactly with the quay."""
    p %= 1.0
    hx = HEEL_X0 - STRIDE * p
    if p < T_FLAT:                                       # heel down first, the sole rolls flat
        th = STRIKE * (1 - smooth(p / T_FLAT))
        return np.array([hx, 0.0]) + rotm(th) @ (BALL - HEEL), th, th
    if p < T_OFF:
        return np.array([hx + BALL_DX, 0.0]), 0.0, 0.0
    if p < STANCE:                                       # the heel peels up, the toe stays down
        return np.array([hx + BALL_DX, 0.0]), TOE_OFF * smooth((p - T_OFF) / (STANCE - T_OFF)) ** 1.3, 0.0
    s = (p - STANCE) / (1 - STANCE)                      # carried forward
    b0 = np.array([HEEL_X0 - STRIDE * STANCE + BALL_DX, 0.0])
    b1 = np.array([HEEL_X0, 0.0]) + rotm(STRIKE) @ (BALL - HEEL)
    e = smooth(s)
    x = lerp(b0[0], b1[0], lerp(s, e, 0.65))
    y = lerp(b0[1], b1[1], e) - 13 * math.sin(math.pi * s) ** 1.15
    rear = lerp(TOE_OFF, STRIKE, smooth(s ** 0.8))
    toe = rear * smooth(s / 0.3)                         # the toe trails, then catches up
    return np.array([x, y]), rear, toe


def boot_xf(p):
    ball, rear, toe = boot(p)
    xr, xt = Xf(BALL, ball, rear), Xf(BALL, ball, toe)
    return (lambda pts: blend(pts, xr, xt, BALL, np.array([1.0, 0.0]), 9.0)), xr


def hose(a, b, rest, n=14):
    """A rubber-hose leg from hip a to ankle b: it bows forward when it has slack, stretches when not."""
    d = b - a
    L = float(np.hypot(*d)) or 1.0
    bend = math.sqrt(max(0.0, rest * rest - L * L)) * 0.5
    nrm = np.array([-d[1], d[0]]) / L
    if nrm[0] < 0:
        nrm = -nrm
    c = (a + b) / 2 + nrm * bend
    t = np.linspace(0, 1, n + 1)[:, None]
    return (1 - t) ** 2 * a + 2 * t * (1 - t) * c + t ** 2 * b


# ---- body ----------------------------------------------------------------------------------------
PELVIS, HIP_NEAR, HIP_FAR = W(846, 635), W(858, 640), W(828, 638)
WAIST, CHEST = W(846, 612), W(846, 572)
NECK = W(822, 522)
SHOULDER, ELBOW = W(792, 548), W(766, 550)
FOREARM_DIR = np.array([-0.5, 0.866])
FAR_SHOULDER = W(878, 550)
LEG_R, LEG_REST = 14.0, 62.0
LAG = 0.045


def lift(ph):
    """Pelvis height: sinks a little as each heel lands, rises as the legs pass."""
    return 1.5 - 3.2 * math.cos(4 * math.pi * (ph - LAG))


def pose(ph):
    body = np.array([1.5 * math.sin(2 * math.pi * ph), -lift(ph)])
    k = 0.018 * math.cos(4 * math.pi * (ph - LAG - 0.02))
    lean = math.radians(1.2 * math.sin(4 * math.pi * (ph - 0.02)))
    hips = Xf(WAIST, WAIST + body, lean, (1 + 0.7 * k, 1 - k))
    twist = math.radians(2.4 * math.sin(2 * math.pi * (ph + 0.02)))     # chest against hips
    chest = Xf(CHEST, hips(CHEST), lean + twist, (1 + 0.7 * k, 1 - k))
    torso = lambda pts: blend(pts, hips, chest, CHEST + (0, 12), np.array([0.0, -1.0]), 22.0)
    nod = math.radians(2.0 * math.sin(4 * math.pi * (ph - 0.12)))
    head = Xf(NECK, chest(NECK), lean + twist * 0.4 + nod)
    shrug = np.array([0.0, -1.6 * math.sin(4 * math.pi * (ph - 0.16))])

    def arm(shoulder, x):
        # the arm is drawn 46 degrees back: it swings from the shoulder, and the forearm follows late
        # and bends further as it comes forward
        a = math.radians(lerp(-6, -70, swing(x - 0.05))) + lean + twist
        b = math.radians(lerp(14, -24, swing(x - 0.13)))
        up = Xf(SHOULDER, chest(shoulder) + shrug, a)
        fore = Xf(ELBOW, up(ELBOW), a + b)
        return lambda pts: blend(pts, up, fore, ELBOW, FOREARM_DIR, 13.0)

    return dict(body=body, hips=hips, chest=chest, torso=torso, head=head,
                arm_near=arm(SHOULDER, ph), arm_far=arm(FAR_SHOULDER, ph + 0.5))


def frame(ph):
    """The whole figure at walk phase ph, without his mouth and eyelid (see `face`)."""
    P = pose(ph)
    c = Canvas()
    c.shapes(PARTS['arm_near'], P['arm_far'])
    for hip, shift, seat in ((HIP_FAR, 0.5, False), (HIP_NEAR, 0.0, True)):
        fn, rear = boot_xf(ph + shift)
        leg = (hose(hip + P['body'], rear(ANKLE), LEG_REST), LEG_R)
        if seat:
            t = np.linspace(0, 2 * math.pi, 40)[:-1]
            c.hoses([leg], [PELVIS + P['body'] + np.stack([31 * np.cos(t), 19 * np.sin(t)], 1)])
        else:
            c.hoses([leg])
        c.shapes(PARTS['foot_flat'], fn)
    # his neck, from the shoulders up behind the ear and the beard, under the shirt
    c.hoses([(np.array([P['chest'](W(813, 536)), P['head'](W(807, 512))]), 4.5),
             (np.array([P['chest'](W(840, 542)), P['head'](W(838, 520))]), 13)])
    c.shapes(PARTS['torso'], P['torso'])
    c.shapes(PARTS['head'], P['head'])
    c.shapes(PARTS['arm_near'], P['arm_near'])
    return c.result()


# ---- face ----------------------------------------------------------------------------------------
GRIN = np.array([W(826, 495), W(875, 495), W(877, 510), W(850, 518), W(828, 516)])
LIPS = W(860, 504)
EYE = W(832.5, 473.5)


def ellipse(c, rx, ry, n=28):
    t = np.linspace(0, 2 * math.pi, n + 1)[:-1]
    return c + np.stack([rx * np.cos(t), ry * np.sin(t)], 1)


def mouth_point(ph):
    """Where his lips are (world u): the whistled notes start here."""
    return pose(ph)['head'](W(866, 503))


def face(ph, pucker=0.0, lid=0.0):
    """His whistle and his blink, drawn on the head: (image, x, y) to lay over `frame(ph)`, or None.
    pucker 0..1.3 purses the lips (0 is the drawn grin); lid 0..1 closes the eye."""
    if pucker < 0.02 and lid < 0.02:
        return None
    H = pose(ph)['head']
    lo, hi = H(W(815, 455)), H(W(885, 525))
    box = (math.floor(min(lo[0], hi[0])) - 12, math.floor(min(lo[1], hi[1])) - 12,
           math.ceil(max(lo[0], hi[0])) + 12, math.ceil(max(lo[1], hi[1])) + 12)
    c = Canvas(box)
    if pucker >= 0.02:
        c.poly(H(GRIN), BLACK)
        s = 0.45 + 0.55 * min(pucker, 1.0) + 0.22 * max(0.0, pucker - 1.0) / 0.3
        c.poly(H(ellipse(LIPS, 8.4 * s, 10.4 * s)), WHITE)
        c.poly(H(ellipse(LIPS + (1, 0), 3.6 * s, 5.2 * s)), BLACK)
    if lid >= 0.02:
        top, bottom = EYE[1] - 12.5, EYE[1] + 12.5
        edge = lerp(top, bottom - 4, lid)
        cover = np.array([(EYE[0] - 9, top - 1), (EYE[0] + 9, top - 1), (EYE[0] + 9, edge), (EYE[0] - 9, edge)])
        c.poly(H(cover), WHITE)
        t = np.linspace(math.radians(200), math.radians(340), 12)
        sag = lerp(-3.0, 5.0, lid)                          # the lid curves down as it closes
        arc = np.stack([EYE[0] + 8.5 * np.cos(t), edge + sag * (np.sin(t) + 0.64) / 0.36 * 0.36], 1)
        c.line(H(arc), 5.0)
    return c.result(), (box[0] - CELL[0]) * OUT_SCALE, (box[1] - CELL[1]) * OUT_SCALE


if __name__ == '__main__':
    import sys
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    n = 24
    fr = [frame(i / n) for i in range(n)]
    w, h = fr[0].size
    sheet = Image.new('RGB', (w * 6 // 2, h * 4 // 2), (150, 190, 225))
    for i, f in enumerate(fr):
        s = f.resize((w // 2, h // 2), Image.LANCZOS)
        sheet.paste(s, ((i % 6) * w // 2, (i // 6) * h // 2), s)
    sheet.save(out / 'walk-contact-sheet.png')
