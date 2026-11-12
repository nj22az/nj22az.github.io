"""
The outfitter's kit for the navigation bridge: what wheelhouse.py and its fellows (bridge_console.py, bridge_outfit.py) draw
with. Her measures and colours, the parts everything is drawn into, the motions that are noted as things are drawn, and the
small made things a real fitting is known by: a screw, a hinge, a quarter-turn lock, a louvre, a gland, a nameplate, a knob,
a key, a lamp, a handset on its cord.

The owner, 11 November 2026, of the bridge as first built: "It still looks like Lego create a realistic bridge". Lego is a
box in one colour standing on a table. A fitted thing is set into its place behind a bezel on a gasket, held by screws one
can count, lettered, and worked by parts that are shapes and not a picture of shapes (JSY-STD-404).

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships. Places are given in the
bridge's own measures: x, `yard` (metres from the first Chisum's transom, where the bridge was designed) and h (metres over
the bridge deck); bridge_place.py carries them aboard. A `Frame` is a place with its own three measures, for what is set in
a face that leans: across, up the face, and out of it.
"""
import os, sys, json
from math import pi, cos, sin, radians, degrees, tan, atan, atan2, hypot
from mathutils import Vector
import lines as L
import spec as S
import shipyard
import bridge_place as BP
from shipyard import Part, srgb, tint, component, tile, lettering, round_sides

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'systems'))
import bridge as REG

DECK = BP.DECK                        # the bridge deck she stands on (bridge_place.py: the bridge's own measures are the first Chisum's)
W = BP.WING                           # the inner face of each wing's bulwark: the wings are carried to the ship's side
# The wheelhouse's heights over its deck. The owner, 11 November 2026, on raising the roof: "Yes make it realistic".
# It stood 2.055 m clear under a roof at 2.40 m, with the glass ending at 1.96 m and an overhead console hanging to 1.80 m,
# a tall helmsman's eye. Now: 2.30 m clear under the lining, a service void over it for the cable trays, the roof's
# structure from 2.42 m and its top (the compass deck) at 2.70 m; every window's glass and the wing doors' reach 2.00 m
# and more, and what hangs from the deckhead ahead of the helm hangs above the windows' head (yard/calc JS4-402).
HEAD_ROOM = 2.42                      # the roof's underside
CEIL = 2.30                           # the deckhead lining's underside: the clear height
LINING_T = 0.025                      # the lining panels; over them the void
OLD_HEAD = 2.08                       # where the other ship's aft wall ends: hers is carried up from there
SILL, HEAD, RAKE = 0.95, 2.10, tan(radians(10.0))
X_IN, X_OUT = 2.92, 3.00              # the house side, inside and out
AFT, FRONT_IN, FRONT_OUT = 19.545, 22.92, 23.00
CORNER = 22.82                        # where the side wall's last window ends and the forward corner begins
AFT_FACE = 19.550                     # the face of the after wall's lining panels (the ship's own lining stands at 19.54: steel.py)

# Her colours as refitted (12 November 2026, yard/design/wheelhouse-refit.md): a real bridge's, not the site's teal and cream.
# The owner's two photographs of a ferry's wheelhouse (reference F3, F4) are the pattern: consoles in a strong marine blue
# with dark instrument fields, off-white linings over a dark skirting, a blue vinyl deck, the windows between light
# varnished wood with the glass in black rubber, stainless rails, black leather. What is the classic ship's own stays: the
# mahogany wheel and chart table, brass where there is brass.
HOUSE, LINING, CEILING = srgb(0xeeeae0), srgb(0xe8e6dd), srgb(0xefeee8)
BLUEC, DESK, ANOD, CASE = srgb(0x2f5886), srgb(0x24282b), srgb(0x17191b), srgb(0x7a8387)     # console enamel, desk tops, black cases, hammer grey
WOODL, SKIRT, RUBBER, JOINERY = srgb(0xc49a5e), srgb(0x2c3a4a), srgb(0x141516), srgb(0xeae8e0)  # light wood, skirting, rubber, white joinery
GREEN, CREAM, DARK, BRASS, WOOD = BLUEC, DESK, srgb(0x1b1e20), srgb(S.BRONZE), srgb(0x6b4429)
STAND, LEATHER, STEEL = srgb(0x6f787c), srgb(0x1d1d1f), srgb(S.STEEL)
FRAME, DOOR, SILLC = srgb(0x596168), srgb(0xdddcd4), srgb(0x6b7472)
RED, GREENLENS, WHITE_LAMP, BLUE = srgb(0xc2412f), srgb(0x2f9e5a), srgb(0xf6f1e2), srgb(0x4a6a8a)
GREY, BLACK, WHITE = srgb(0x7d8586), srgb(0x1a1f20), srgb(0xf2f0e8)
STAINLESS = srgb(0xc6ccce)
VINYL, MAT, WINGDECK, BOARD, ORANGE, YELLOW = srgb(0x4a6c96), srgb(0x1e2124), srgb(0x6f7d6c), srgb(0x9aa3a2), srgb(0xe8742a), srgb(0xe4d83c)
GLASS = srgb(0x2d4a55)
KEYSIDE, CLOTH, CHROME = srgb(0x2c3033), srgb(0x3a3f45), srgb(0xdfe3e4)

PARTS = dict(
    plating=('Wheelhouse, plating', 'Topside paint'), lining=('Wheelhouse, linings', 'Laminate'), frame=('Wheelhouse, window frames', 'Console paint'),
    glass=('Wheelhouse, window glass', 'Window glass'), floor=('Wheelhouse, deck covering', 'Vinyl deck'), seam=('Wheelhouse, panel seams', 'Marking'),
    console=('Wheelhouse, console', 'Marine enamel'), dark=('Wheelhouse, instruments', 'Matt black'), plastic=('Wheelhouse, plastics', 'Plastic'),
    steel=('Wheelhouse, steel', 'Stainless'), brass=('Wheelhouse, brass', 'Bronze'), wood=('Wheelhouse, wood', 'Varnished wood'),
    seat=('Wheelhouse, upholstery', 'Leather'), lens=('Wheelhouse, lamps and lenses', 'Lens'), screen=('Wheelhouse, screens', 'Screen picture'),
    face=('Wheelhouse, panel faces', 'Panel face'), paint=('Wheelhouse, painted fittings', 'Deck paint'), wing=('Wheelhouse, wing plating', 'Topside paint'),
    # the refit's own: desk tops, hammer-finish cases, black anodised cases, rubber, light wood, the deckhead's strips, the
    # skirting, the wings' painted deck, cloth, the glass over a dial, a blind's film, coffee, and lamps that are lit
    desk=('Wheelhouse, desk tops', 'Matt black'), case=('Wheelhouse, equipment cases', 'Hammer finish'), anod=('Wheelhouse, black cases', 'Black anodised'),
    rubber=('Wheelhouse, rubber', 'Rubber'), lwood=('Wheelhouse, light wood', 'Light wood'), strip=('Wheelhouse, strips', 'Deckhead strip'),
    skirt=('Wheelhouse, skirting', 'Vinyl deck'), wingdeck=('Wheelhouse, wing deck', 'Deck paint'), cloth=('Wheelhouse, cloth', 'Cloth'),
    clear=('Wheelhouse, instrument glass', 'Dial glass'), cvs=('Wheelhouse, clear-view glass', 'Clear glass'), film=('Wheelhouse, blind film', 'Blind film'),
    chrome=('Wheelhouse, chrome', 'Chrome'), joinery=('Wheelhouse, joinery', 'Laminate'),
    lit=('Wheelhouse, lit lamps', 'Lit lamp'), lit_green=('Wheelhouse, lit green', 'Lit green'), lit_red=('Wheelhouse, lit red', 'Lit red'),
    lit_amber=('Wheelhouse, lit amber', 'Lit amber'), lit_white=('Wheelhouse, lit white', 'Lit white'), lit_blue=('Wheelhouse, lit blue', 'Lit blue'),
    top=('Compass deck, bridge fittings', 'Topside paint', 'top'), top_dark=('Compass deck, bridge fittings, dark', 'Machinery paint', 'top'),
    top_lens=('Compass deck, bridge fittings, lenses', 'Lens', 'top'), top_steel=('Compass deck, bridge fittings, steel', 'Shaft steel', 'top'),
)
MADE, EXTRA = {}, []

# What hangs from the deckhead is fastened to the compass deck, and lifts away with it when she is taken apart (as the
# deckhead over the machinery spaces goes with the car deck): the lining, its lights, the overhead console, the periscope.
# So a room is looked down into with nothing over it.
HANGS = [False]


def part(key):
    top = len(PARTS[key]) > 2 or HANGS[0]
    slot = (key, top)
    if slot not in MADE:
        name, look = PARTS[key][:2]
        if HANGS[0] and len(PARTS[key]) == 2:
            name = name.replace('Wheelhouse, ', 'Wheelhouse deckhead, ')
        MADE[slot] = Part(name, look)
        MADE[slot].group = 'top' if top else 'bridge'
    return MADE[slot]


def P(x, yard, h):
    """A point from its place on the bridge deck: x to port, metres from the transom, metres over the deck."""
    return (x, DECK + h, BP.Z(yard))


def unP(v):
    """A point of the ship's axes back in the bridge's own measures: (x, yard, h)."""
    return (v[0], v[2] - BP.Z(0.0), v[1] - DECK)


def fwd(h):
    """How far the raked forward wall has leaned forward at this height."""
    return (min(max(h, SILL), HEAD) - SILL) * RAKE


# What the house itself is made of is plate with square edges; everything fitted in it is a made thing, whose edges are
# chamfered and catch the light (JSY-STD-404, rule 2).
PLATE_KEYS = {'plating', 'lining', 'glass', 'floor', 'seam', 'wing', 'wingdeck'}


def box(key, x0, x1, yd0, yd1, h0, h1, colour, r=0.003):
    x0, x1 = sorted((x0, x1))
    yd0, yd1 = sorted((yd0, yd1))
    h0, h1 = sorted((h0, h1))
    p = key if isinstance(key, Part) else part(key)
    if key in PLATE_KEYS if isinstance(key, str) else False:
        p.box(P(x0, yd0, h0), P(x1, yd1, h1), colour)
    else:
        p.block(P(x0, yd0, h0), P(x1, yd1, h1), colour, r)


def pillow(key, x0, x1, yd0, yd1, h0, h1, colour, r=0.02, segs=4):
    """A box rounded all round: a cushion, a pad, a moulded case."""
    x0, x1 = sorted((x0, x1))
    yd0, yd1 = sorted((yd0, yd1))
    h0, h1 = sorted((h0, h1))
    (key if isinstance(key, Part) else part(key)).pillow(P(x0, yd0, h0), P(x1, yd1, h1), r, colour, segs)


def extrude(p, profile, ring_a, ring_b, out, colour):
    """A solid from a flat outline pushed from one place to another: `ring_a` and `ring_b` are the outline's corners at the
    two ends, `out` turns a direction of the outline's own plane (two numbers) into the ship's. Each side looks the way
    its own edge of the outline says, so an outline that goes in as well as out (a console's section, a coved skirting)
    is closed right: looking away from the middle is not enough for such a shape."""
    area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(profile, profile[1:] + profile[:1]))
    turn = 1.0 if area > 0 else -1.0
    n = len(profile)
    for i in range(n):
        j = (i + 1) % n
        du, dv = profile[j][0] - profile[i][0], profile[j][1] - profile[i][1]
        if abs(du) + abs(dv) < 1e-12:
            continue
        start = len(p.f)
        p.face([p.vert(q) for q in (ring_a[i], ring_b[i], ring_b[j], ring_a[j])], colour)
        p.orient(start, tuple(out((dv * turn, -du * turn))))
    along = Vector(ring_b[0]) - Vector(ring_a[0])
    for ring, way in ((ring_a, -along), (ring_b, along)):
        start = len(p.f)
        p.polygon(ring, colour)
        p.orient(start, tuple(way))


def prism(key, x0, x1, profile, colour):
    """A solid from an outline in (yard, h) pushed from x0 to x1."""
    p = key if isinstance(key, Part) else part(key)
    x0, x1 = sorted((x0, x1))
    extrude(p, profile, [P(x0, yd, h) for yd, h in profile], [P(x1, yd, h) for yd, h in profile], lambda d: (0.0, d[1], d[0]), colour)


def tube(key, a, b, r, colour, sides=12, r2=None, caps=(True, True)):
    (key if isinstance(key, Part) else part(key)).tube(P(*a), P(*b), r, r2, colour=colour, sides=sides, caps=caps)


def vessel(key, a, b, r, colour, r2=None):
    """A length of a glass vessel (a bottle, a jar, a jug): its wall only. Glass is seen from both sides, so it has no end
    lying in the plane of what it stands on or of what closes it (JSY-STD-403, rule 8)."""
    tube(key, a, b, r, colour, r2=r2, caps=(False, False))


def torus(key, centre, big, small, colour, axis='z', n=28, m=10):
    """A ring about the fore-and-aft axis (a wheel) or the athwartships one (a lifebuoy against the bulwark)."""
    p = key if isinstance(key, Part) else part(key)
    p.ring(P(*centre), (0, 0, 1) if axis == 'z' else (1, 0, 0), big, small, colour)


def lathe(key, origin, axis, profile, colour):
    """A turned body from a place on the bridge deck: profile is (distance along the axis, radius)."""
    (key if isinstance(key, Part) else part(key)).lathe(P(*origin), axis, profile, colour)


def sweep(key, points, r, colour, ends=(True, True), sides=None, local=False):
    """A round line through points, bent smoothly at each: a cord, a cable, a small pipe, a bent rail. Its rings are shared
    from one length to the next, so the light runs round a bend. Points are places on the bridge deck (or, with `local`,
    already in the part's own axes)."""
    p = key if isinstance(key, Part) else part(key)
    pts = [Vector(q if local else P(*q)) for q in points]
    pts = [q for i, q in enumerate(pts) if i == 0 or (q - pts[i - 1]).length > 1e-7]
    n = len(pts)
    if n < 2:
        return
    sides = sides or round_sides(r)
    tans = [(pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized() for i in range(n)]
    u = tans[0].orthogonal().normalized()
    rows = []
    for i in range(n):
        t = tans[i]
        u = u - t * u.dot(t)
        u = u.normalized() if u.length > 1e-9 else t.orthogonal().normalized()
        v = t.cross(u)
        row = []
        for k in range(sides):
            d = u * cos(2 * pi * k / sides) + v * sin(2 * pi * k / sides)
            row.append(p.vert(tuple(pts[i] + d * r), tuple(d)))
        rows.append(row)
    start = len(p.f)
    for i in range(n - 1):
        for k in range(sides):
            j = (k + 1) % sides
            p.face((rows[i][k], rows[i][j], rows[i + 1][j], rows[i + 1][k]), colour, smooth=True)
    p.orient(start, None)
    for want, row, at, away in ((ends[0], rows[0], pts[0], -tans[0]), (ends[1], rows[-1], pts[-1], tans[-1])):
        if not want:
            continue
        start = len(p.f)
        c = p.vert(tuple(at))
        ring = [p.vert(p.v[i]) for i in row]
        for k in range(sides):
            p.face((c, ring[k], ring[(k + 1) % sides]), colour, smooth=False)
        p.orient(start, tuple(away))


def helix(a, b, radius, turns, lead=0.02):
    """The points of a coiled cord from a to b (ship's axes): a short straight lead at each end, coils between."""
    a, b = Vector(a), Vector(b)
    t = (b - a).normalized()
    u = t.orthogonal().normalized()
    v = t.cross(u)
    length = (b - a).length
    pts = [a]
    steps = int(turns * 10)
    for i in range(steps + 1):
        f = i / steps
        ang = 2 * pi * turns * f
        ease = min(1.0, f * steps / 5.0, (1 - f) * steps / 5.0)
        pts.append(a + t * (lead + (length - 2 * lead) * f) + (u * cos(ang) + v * sin(ang)) * radius * ease)
    pts.append(b)
    return [tuple(q) for q in pts]


def pic(centre, normal, up, w, h, name, proud=0.0015):
    """A picture of her sheet, w by h, on a face that looks along `normal`; `up` is the picture's upward edge. Screens shine, the rest takes the light."""
    c, n, u = Vector(P(*centre)), Vector(normal).normalized(), Vector(up).normalized()
    r = u.cross(n)
    c = c + n * proud
    corners = [tuple(c - r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) + u * (h / 2)), tuple(c - r * (w / 2) + u * (h / 2))]
    part('screen' if tile(name)['kind'] == 'screen' else 'face').picture(corners, name)
    return c, r, u, n


def disc(centre, normal, up, radius, name, sides=28, proud=0.0015):
    """A round picture: the circle inscribed in the picture's square."""
    c, n, u = Vector(P(*centre)), Vector(normal).normalized(), Vector(up).normalized()
    r = u.cross(n)
    c = c + n * proud
    u0, v0, u1, v1 = tile(name)['uv']
    p = part('face')
    mid = p.vert(tuple(c))
    ring, uvs = [], []
    for k in range(sides):
        a = 2 * pi * k / sides
        ring.append(p.vert(tuple(c + r * (radius * cos(a)) + u * (radius * sin(a)))))
        uvs.append((u0 + (0.5 + 0.5 * cos(a)) * (u1 - u0), v0 + (0.5 + 0.5 * sin(a)) * (v1 - v0)))
    cm = ((u0 + u1) / 2, (v0 + v1) / 2)
    for k in range(sides):
        j = (k + 1) % sides
        p.face((mid, ring[k], ring[j]), (1.0, 1.0, 1.0), [cm, uvs[k], uvs[j]])


UP, FWD, AFTWARD, PORT, STBD = (0, 1, 0), (0, 0, 1), (0, 0, -1), (1, 0, 0), (-1, 0, 0)
TILT = (0, cos(radians(20)), sin(radians(20)))            # up the leaning face of a display
TILT_N = (0, sin(radians(20)), -cos(radians(20)))         # and the way that face looks: aft and a little up

SIDES = {                                                  # openings in each side wall, the same on both sides: (yard from, to, h from, to, what)
    side: [(19.65, 20.33, 1.10, 2.05, 'window'), (20.45, 21.25, 0.0, 2.05, 'door'), (21.30, 22.10, 0.97, 2.05, 'window'), (22.15, CORNER, 0.97, 2.05, 'window')]
    for side in (1, -1)
}
# The forward windows, x from and to: five alike between two corner posts of 0.06 m and four mullions of 0.10 m.
PANE = (2 * X_IN - 2 * 0.06 - 4 * 0.10) / 5
PANES = [(-X_IN + 0.06 + k * (PANE + 0.10), -X_IN + 0.06 + k * (PANE + 0.10) + PANE) for k in range(5)]
MULLION_X = PANES[2][1] + 0.05            # the mullion either side of the middle window, where the cable ducts come down
FRAME_T, STILE = 0.05, 0.06               # a window's frame, and the stile of a door's leaf beside its glass
HELM = (0.0, 20.9, 1.6)                   # the eye of a person standing at the wheel
EYES = (1.5, 1.8)                         # a short helmsman's eye and a tall one's: the glass must serve both
DOOR_GLASS = (0.95, 1.95)                 # the glazed part of a wing door's leaf
GLASS_AT = lambda h: FRONT_IN + 0.045 + fwd(h)             # where the forward glass stands at a height
RAKE_UP = (0.0, cos(radians(10.0)), sin(radians(10.0)))    # up the raked forward glass

# ---------------------------------------------------------------------------------------------------------------------
# What moves. A door, a lid, a drawer, a handset: a part with a hinge or a slide, worked by a tap (the file's `inputs` and
# `movers`: README, the file format). A lever, a switch: worked a notch at a time. What runs: a wiper, a clear-view screen.
# Each is noted here as it is drawn; wheelhouse.motion() hands them to the build.
# ---------------------------------------------------------------------------------------------------------------------
MOTIONS = []                        # doors and whatever else is worked by a tap or by coming near: dict(id, name, kind, ...)
LEVERS = []                         # movers that follow an input which is not theirs alone: dict(id, input, axis, pivot, ratio)
CONTROLS = []                       # what is worked a notch at a time: dict(id, name, fitting, home, steps)
LEVELS = []                         # what fills and empties: dict(id, name, ...)


SHARED = {}                         # the parts of a thing that is drawn in several places and moves as one (the films that dim the displays)


def shown(mover, works, title, look, when='on', over=0.0):
    """The part of a thing that is there only while what works it is on (a lamp's lit glass), or only while it is off
    (`when`: the film that darkens a display turned down): the page shows or hides it (the file's movers: kind `show`)."""
    if mover not in SHARED:
        SHARED[mover] = moving(title, mover, it=look)['it']
        LEVERS.append(dict(id=mover, input=works, kind='show', axis=[0, 1, 0], pivot=[0, 0, 0], ratio=1.0, when=when, over=over))
    return SHARED[mover]


def switch_knob(F, x, y, z, r, mover, name, fitting, steps, home=0, start=0.0, h=0.016):
    """A rotary switch that is worked: its knob is a part that turns a step for a tap, and what each step means is said.
    `steps` are (degrees turned clockwise from its first position, what the position means); `start` is where its mark
    points in the first position, in degrees clockwise from upright."""
    part_ = moving(name, mover, knob='Plastic')['knob']
    F.into = dict(plastic=part_)
    knob(F, x, y, z, r, h=h, turn=radians(start))
    F.into = None
    CONTROLS.append(dict(id=mover, name=name, fitting=fitting, home=home, steps=[dict(v=float(a), say=say) for a, say in steps]))
    # the knob is drawn where its first step has it; clockwise as it is looked at is against the face's own direction
    LEVERS.append(dict(id=mover, input=mover, axis=[float(v) for v in F.way((0.0, 0.0, 1.0))], pivot=[float(v) for v in F.at((x, y, z))], ratio=-1.0))


def moving(title, mover, **looks):
    """The parts of one thing that moves, one for each look it needs: the viewer moves them together (the file's `movers`)."""
    parts = {key: Part(f'{title}, {key}', look, mover=mover) for key, look in looks.items()}
    for part_ in parts.values():
        part_.group = 'top' if HANGS[0] else 'bridge'
        EXTRA.append(part_)
    return parts


def hinged(mover, name, pivot, axis=(0, 1, 0), ratio=1.0, opens=100, at=None, reach=1.9, normal=(1, 0, 0), auto='tap', say=('shut', 'open')):
    """Note a thing that turns on a hinge when it is tapped: a door, a lid, a flap. `pivot` is a place on the bridge deck
    (x, yard, h); `axis` the hinge's line in the ship's axes."""
    px, py, pz = P(*pivot)
    ax, ay, az = P(*(at or pivot))
    MOTIONS.append(dict(id=mover, name=name, kind='turn', pivot=[px, py, pz], axis=list(axis), ratio=ratio, max=opens, at=[ax, ay, az], normal=list(normal),
                        auto=auto, reach=reach, rest=say[0], above=say[1]))


def sliding(mover, name, axis, run, at, reach=1.9, say=('shut', 'open')):
    """Note a thing that slides when it is tapped: a drawer, a chair on its rail. `run` is how far, in metres."""
    ax, ay, az = P(*at)
    MOTIONS.append(dict(id=mover, name=name, kind='slide', pivot=[ax, ay, az], axis=list(axis), ratio=0.01, max=round(run * 100, 1), at=[ax, ay, az], normal=[1, 0, 0],
                        auto='tap', reach=reach, rest=say[0], above=say[1], unit='cm'))


# ---------------------------------------------------------------------------------------------------------------------
# A frame: a place to draw in its own measures. x is across (to the right of whoever looks at the face), y up the face, z out
# of it toward the eye. What is drawn in it is carried into the ship's axes when the frame is left.
# ---------------------------------------------------------------------------------------------------------------------
_marks = None


def marks(name):
    """What stands on a picture in three dimensions (atlas.py notes it as it draws: atlas-marks.json)."""
    global _marks
    if _marks is None:
        _marks = json.load(open(os.path.join(HERE, 'atlas-marks.json')))
    return _marks.get(name, [])


class Frame:
    def __init__(self, origin, right, up, local=False):
        self.o = Vector(origin if local else P(*origin))
        self.x = Vector(right).normalized()
        up = Vector(up)
        self.y = (up - self.x * up.dot(self.x)).normalized()
        self.z = self.x.cross(self.y)
        self.tmp = {}
        # For a thing that moves: the parts its keys are drawn into instead of the standing ones (a door's own leaf, its
        # own fittings). While it is set, a key it does not name is a mistake: that piece would stay behind when the thing moves.
        self.into = None

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        if exc[0] is None:
            self.flush()
        return False

    def p(self, target):
        """The part to draw into here: by its key, or a part itself (a mover's)."""
        if isinstance(target, str) and self.into is not None:
            if target not in self.into:
                raise KeyError(f'a moving thing is drawn here, and it has no part of its own for "{target}"')
            t = self.into[target]
        else:
            t = part(target) if isinstance(target, str) else target
        if id(t) not in self.tmp:
            q = Part('in a frame', t.look)
            Part.made.remove(q)
            self.tmp[id(t)] = (q, t)
        return self.tmp[id(t)][0]

    def at(self, q):
        """A place of this frame in the ship's axes."""
        return self.o + self.x * q[0] + self.y * q[1] + self.z * q[2]

    def way(self, d):
        return self.x * d[0] + self.y * d[1] + self.z * d[2]

    def flush(self):
        for q, t in self.tmp.values():
            base = len(t.v)
            for v, n in zip(q.v, q.n):
                t.vert(tuple(self.at(v)), None if n is None else tuple(self.way(n)))
            for f, c, uv, sm in zip(q.f, q.c, q.t, q.s):
                t.face(tuple(base + i for i in f), c, uv, sm)
        self.tmp = {}

    # ---- shapes, in the frame's own measures
    def block(self, key, lo, hi, colour, r=0.003):
        self.p(key).block(lo, hi, colour, r)

    def box(self, key, lo, hi, colour):
        self.p(key).box(tuple(min(a, b) for a, b in zip(lo, hi)), tuple(max(a, b) for a, b in zip(lo, hi)), colour)

    def pillow(self, key, lo, hi, colour, r=0.02, segs=4):
        self.p(key).pillow(lo, hi, r, colour, segs)

    def tube(self, key, a, b, r, colour, r2=None, caps=(True, True)):
        self.p(key).tube(a, b, r, r2, colour=colour, caps=caps)

    def lathe(self, key, origin, profile, colour, axis=(0, 0, 1)):
        self.p(key).lathe(origin, axis, profile, colour)

    def ring(self, key, centre, big, small, colour, axis=(0, 0, 1), sweep=(0.0, 2 * pi)):
        self.p(key).ring(centre, axis, big, small, colour, sweep=sweep)

    def ball(self, key, centre, r, colour):
        self.p(key).ball(centre, r, colour)

    def sweep(self, key, points, r, colour, ends=(True, True)):
        sweep(self.p(key), points, r, colour, ends=ends, local=True)

    def prism(self, key, x0, x1, profile, colour):
        """A solid from an outline in (y, z) pushed from x0 to x1."""
        extrude(self.p(key), profile, [(x0, y, z) for y, z in profile], [(x1, y, z) for y, z in profile], lambda d: (0.0, d[0], d[1]), colour)

    def quad(self, key, x0, y0, x1, y1, z, colour):
        """A flat mark on the face (paint, an engraved line's fill)."""
        p = self.p(key)
        p.face([p.vert(q) for q in ((x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z))], colour)

    def line(self, key, pts, width, z, colour):
        """An engraved or painted line through points (x, y) of the face."""
        p = self.p(key)
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            d = hypot(bx - ax, by - ay)
            if d < 1e-9:
                continue
            nx, ny = -(by - ay) / d * width / 2, (bx - ax) / d * width / 2
            ex, ey = (bx - ax) / d * width / 2, (by - ay) / d * width / 2
            p.face([p.vert(q) for q in ((ax - ex + nx, ay - ey + ny, z), (ax - ex - nx, ay - ey - ny, z), (bx + ex - nx, by + ey - ny, z), (bx + ex + nx, by + ey + ny, z))], colour)

    def pic(self, name, x0, y0, x1, y1, z=0.0, sub=None):
        """A picture of her sheet on the face; `sub` is a part of the picture, in picture points (left, top, right, bottom)."""
        u0, v0, u1, v1 = tile(name)['uv']
        if sub:
            w, h = tile(name)['px']
            a, b, c, d = sub
            u0, u1, v0, v1 = u0 + (u1 - u0) * a / w, u0 + (u1 - u0) * c / w, v1 - (v1 - v0) * d / h, v1 - (v1 - v0) * b / h
        p = self.p('screen' if tile(name)['kind'] == 'screen' else 'face')
        p.face([p.vert(q) for q in ((x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z))], (1.0, 1.0, 1.0), [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])

    def round_pic(self, name, x, y, r, z=0.0, sub=None, sides=32):
        """A round picture: the circle inscribed in the picture's square, or (sub: centre and radius in picture points) a round part of it."""
        u0, v0, u1, v1 = tile(name)['uv']
        w, h = tile(name)['px']
        cx, cy, rr = sub if sub else (w / 2, h / 2, min(w, h) / 2)
        uv = lambda px, py: (u0 + (u1 - u0) * px / w, v1 - (v1 - v0) * py / h)
        p = self.p('screen' if tile(name)['kind'] == 'screen' else 'face')
        mid = p.vert((x, y, z))
        ring = [p.vert((x + r * cos(2 * pi * k / sides), y + r * sin(2 * pi * k / sides), z)) for k in range(sides)]
        uvs = [uv(cx + rr * cos(2 * pi * k / sides), cy - rr * sin(2 * pi * k / sides)) for k in range(sides)]
        for k in range(sides):
            j = (k + 1) % sides
            p.face((mid, ring[k], ring[j]), (1.0, 1.0, 1.0), [uv(cx, cy), uvs[k], uvs[j]])

    def text(self, s, x, y, z, height, colour, key='seam', align='c'):
        """A line of lettering on the face, engraved and filled: its middle (or its left end) at x, the foot of its letters at y."""
        pts, tris, width = lettering(s, height)
        x0 = x - width / 2 if align == 'c' else x
        p = self.p(key)
        start = len(p.f)
        for t in tris:
            p.face([p.vert((x0 + pts[i][0], y + pts[i][1], z)) for i in t], colour)
        p.orient(start, (0, 0, 1))
        return width


# ---------------------------------------------------------------------------------------------------------------------
# The small made things. Each is drawn in a frame, at a place of the face (x, y), standing on it from z.
# ---------------------------------------------------------------------------------------------------------------------
def _hash(x, y):
    v = sin(x * 127.1 + y * 311.7) * 43758.5453
    return v - int(v) if v > 0 else v - int(v) + 1


def screw(F, x, y, z=0.0, r=0.003, key='steel', colour=STAINLESS):
    """A pan-head screw with a cross in its head (no two stand turned alike)."""
    F.lathe(key, (x, y, z), [(0.0, r), (r * 0.30, r), (r * 0.55, r * 0.68), (r * 0.55, 0.0)], colour)
    a = _hash(x, y) * pi / 2
    zt = z + r * 0.55 + 0.0002
    for q in (a, a + pi / 2):
        F.line('seam', [(x - cos(q) * r * 0.5, y - sin(q) * r * 0.5), (x + cos(q) * r * 0.5, y + sin(q) * r * 0.5)], r * 0.2, zt, DARK)


def bolt(F, x, y, z=0.0, r=0.006, h=0.004, key='steel', colour=STEEL):
    """A hexagon-headed bolt on its washer."""
    F.lathe(key, (x, y, z), [(0.0, r * 1.45), (0.0012, r * 1.45), (0.0012, 0.0)], tint(colour, 1.1))
    p = F.p(key)
    a0 = _hash(x, y) * pi / 3
    ring = lambda zz: [(x + r * cos(a0 + k * pi / 3), y + r * sin(a0 + k * pi / 3), zz) for k in range(6)]
    start = len(p.f)
    p.grid([ring(z + 0.0012), ring(z + 0.0012 + h)], colour, close=True)
    p.polygon(ring(z + 0.0012 + h), colour)
    p.polygon(ring(z + 0.0012), colour)
    p.orient(start, lambda c: (c[0] - x, c[1] - y, (c[2] - z - 0.0012 - h / 2) * 40))


def corner_screws(F, x0, y0, x1, y1, z, inset=0.007, r=0.0028):
    for x in (x0 + inset, x1 - inset):
        for y in (y0 + inset, y1 - inset):
            screw(F, x, y, z, r)


def knob(F, x, y, z, r, colour=BLACK, key='plastic', h=0.016, mark=WHITE, turn=0.0):
    """A rotary knob: a skirt, a waisted body, its cap, and the line that says where it stands."""
    F.lathe(key, (x, y, z), [(0.0, r * 1.12), (0.0022, r * 1.12), (0.0032, r), (h * 0.8, r * 0.86), (h, r * 0.74), (h, 0.0)], colour)
    if mark is not None:
        dx, dy = sin(turn), cos(turn)
        nx, ny = dy * r * 0.09, -dx * r * 0.09
        p = F.p(key)
        zt = z + h + 0.0006
        pts = ((x + dx * r * 0.2 - nx, y + dy * r * 0.2 - ny), (x + dx * r * 0.2 + nx, y + dy * r * 0.2 + ny), (x + dx * r * 0.72 + nx, y + dy * r * 0.72 + ny), (x + dx * r * 0.72 - nx, y + dy * r * 0.72 - ny))
        start = len(p.f)
        p.grid([[(a, b, z + h) for a, b in pts], [(a, b, zt) for a, b in pts]], mark, close=True)
        p.polygon([(a, b, zt) for a, b in pts], mark)
        p.polygon([(a, b, z + h) for a, b in pts], mark)
        p.orient(start, lambda c: (c[0] - x - dx * r * 0.46, c[1] - y - dy * r * 0.46, (c[2] - z - h - 0.0003) * 200))


def lamp(F, x, y, z, r, colour, lit=True, bezel=True):
    """A signal lamp: a domed lens in a chromed ring; lit, it gives out its own light."""
    key = 'lens'
    if lit:
        rr, gg, bb = colour
        key = 'lit_red' if rr > 1.5 * gg and rr > 1.5 * bb else 'lit_green' if gg > 1.25 * rr and gg > 1.25 * bb else 'lit_blue' if bb > 1.3 * rr else 'lit_amber' if rr > 1.4 * bb else 'lit_white'
    F.lathe(key, (x, y, z), [(0.0, r), (r * 0.45, r * 0.9), (r * 0.85, r * 0.5), (r, 0.0)], colour)
    if bezel:
        F.lathe('chrome', (x, y, z), [(0.0, r * 1.5), (r * 0.3, r * 1.5), (r * 0.3, r * 0.98)], CHROME)


def raise_marks(F, name, x0, y0, x1, y1, z, skip=()):
    """What the picture `name`, laid on the face from (x0, y0) to (x1, y1), shows standing on it, made as shapes: each key a
    cap with its own legend on top, each lamp a lens, each knob a knob, a glass over each display window, a screw in each
    corner."""
    w, h = tile(name)['px']
    sx, sy = (x1 - x0) / w, (y1 - y0) / h
    X = lambda px: x0 + px * sx
    Y = lambda py: y1 - py * sy
    for m in marks(name):
        kind = m[0]
        if kind in skip:
            continue
        if kind == 'screw':
            screw(F, X(m[1]), Y(m[2]), z, r=max(0.0022, m[3] * sx * 0.85))
        elif kind in ('key', 'flap'):
            cx, cy, kw, kh = m[1:5]
            lift = 0.0028 if kind == 'key' else 0.0065
            a, b, c, d = X(cx - kw / 2) + 0.0004, Y(cy + kh / 2) + 0.0004, X(cx + kw / 2) - 0.0004, Y(cy - kh / 2) - 0.0004
            F.box('plastic', (a, b, z), (c, d, z + lift), KEYSIDE)
            F.pic(name, a, b, c, d, z + lift + 0.0003, sub=(cx - kw / 2 + 0.5, cy - kh / 2 + 0.5, cx + kw / 2 - 0.5, cy + kh / 2 - 0.5))
        elif kind == 'round':
            cx, cy, rr = m[1:4]
            r = rr * sx
            F.lathe('plastic', (X(cx), Y(cy), z), [(0.0, r), (0.0055, r), (0.0072, r * 0.94), (0.0072, 0.0)], KEYSIDE)
            F.round_pic(name, X(cx), Y(cy), r * 0.94, z + 0.0075, sub=(cx, cy, rr * 0.94))
        elif kind == 'led':
            cx, cy, rr, col, on = m[1:6]
            lamp(F, X(cx), Y(cy), z, max(rr * sx, 0.0018), tuple(v / 255 for v in col), lit=on)
        elif kind == 'lcd':
            F.box('clear', (X(m[1]), Y(m[4]), z + 0.0008), (X(m[3]), Y(m[2]), z + 0.0022), (0.92, 0.96, 0.96))
        elif kind == 'knob':
            knob(F, X(m[1]), Y(m[2]), z, r=m[3] * sx * 0.82)


def panel(F, name, x0, y0, x1, y1, z=0.0, thick=0.004, margin=0.003, colour=ANOD, key='anod', skip=()):
    """A panel set in a face: a rubber gasket under it, an anodised plate, its picture, and what the picture's marks name,
    as shapes (raise_marks)."""
    F.box('rubber', (x0 - 0.0025, y0 - 0.0025, z), (x1 + 0.0025, y1 + 0.0025, z + 0.0012), RUBBER)
    F.block(key, (x0, y0, z), (x1, y1, z + thick), colour, r=0.0012)
    F.pic(name, x0 + margin, y0 + margin, x1 - margin, y1 - margin, z + thick + 0.0004)
    raise_marks(F, name, x0 + margin, y0 + margin, x1 - margin, y1 - margin, z + thick, skip)


def blank(F, x0, y0, x1, y1, z=0.0, thick=0.004, colour=ANOD, key='anod'):
    """A blanking plate where no instrument is fitted, on its gasket, with a screw in each corner."""
    F.box('rubber', (x0 - 0.0025, y0 - 0.0025, z), (x1 + 0.0025, y1 + 0.0025, z + 0.0012), RUBBER)
    F.block(key, (x0, y0, z), (x1, y1, z + thick), colour, r=0.0012)
    corner_screws(F, x0, y0, x1, y1, z + thick)


def display(F, name, w, h, depth=0.014, bz=0.014, foot=0.028, keys=6, hood=0.0, dims=None):
    """A display set in a face, centred on the frame's origin: bezel bars round a screen sunk under glass, on a gasket; on
    the lower bar a row of keys, a brilliance knob and the lamp that says it is on; a screw in each corner. With `hood`,
    a sun hood stands out round the top and sides by that much."""
    x0, x1, y0, y1 = -w / 2, w / 2, -h / 2, h / 2
    a, b, c, d = x0 + bz, y0 + foot, x1 - bz, y1 - bz                         # the screen
    F.box('rubber', (x0 - 0.003, y0 - 0.003, 0.0), (x1 + 0.003, y1 + 0.003, 0.0015), RUBBER)
    for lo, hi in (((x0, y0, 0.0), (a, y1, depth)), ((c, y0, 0.0), (x1, y1, depth)), ((a, d, 0.0), (c, y1, depth)), ((a, y0, 0.0), (c, b, depth))):
        F.block('anod', lo, hi, ANOD, r=0.002)
    F.box('dark', (a - 0.001, b - 0.001, 0.0), (c + 0.001, d + 0.001, 0.003), DARK)
    F.pic(name, a, b, c, d, 0.0034)
    F.box('clear', (a, b, depth - 0.0045), (c, d, depth - 0.003), (0.9, 0.95, 0.95))
    if dims:                                                                  # turned down for the night, the screen darkens: a film over it, there only then
        F.into = dict(film=shown('instruments-dimmed', 'dimmer-instruments', 'Displays, dimmed', 'Blind film', when='off', over=dims))
        F.quad('film', a, b, c, d, depth - 0.0020, srgb(0x05070a))
        F.into = None
    corner_screws(F, x0, y0, x1, y1, depth, inset=0.006, r=0.0024)
    ky = y0 + foot / 2
    n = max(0, keys)
    for k in range(n):
        kx = a + 0.03 + k * 0.021
        if kx + 0.016 > c - 0.05:
            break
        F.block('plastic', (kx, ky - 0.0055, depth), (kx + 0.016, ky + 0.0055, depth + 0.0026), tint(KEYSIDE, 1.5), r=0.0)
    lamp(F, a + 0.012, ky, depth, 0.0028, srgb(0x3cf058))
    knob(F, c - 0.022, ky, depth, 0.0075, h=0.011)
    if hood:
        t = 0.004
        F.block('anod', (x0 - t, y1, 0.0), (x1 + t, y1 + t, hood), ANOD, r=0.001)
        for sx0, sx1 in ((x0 - t, x0), (x1, x1 + t)):
            F.prism('anod', sx0, sx1, [(y0 + h * 0.25, 0.0), (y1, 0.0), (y1, hood), (y0 + h * 0.55, hood * 0.55)], ANOD)


def hinge(F, x, y0, y1, z, r=0.0045, key='steel', colour=STAINLESS):
    """A barrel hinge along the face's upward measure: three knuckles on a pin, a leaf each side."""
    third = (y1 - y0) / 3
    for k in range(3):
        F.tube(key, (x, y0 + k * third + 0.0006, z + r), (x, y0 + (k + 1) * third - 0.0006, z + r), r, colour if k != 1 else tint(colour, 0.9))
    F.box(key, (x - r * 3.2, y0, z), (x - r * 0.4, y1, z + 0.0016), colour)
    F.box(key, (x + r * 0.4, y0, z), (x + r * 3.2, y1, z + 0.0016), colour)
    for yy in (y0 + third * 0.5, y1 - third * 0.5):
        screw(F, x - r * 1.9, yy, z + 0.0016, r=0.0018)
        screw(F, x + r * 1.9, yy, z + 0.0016, r=0.0018)


def quarter_turn(F, x, y, z, r=0.0095, key='steel', colour=STAINLESS):
    """A quarter-turn lock: a round escutcheon and the slotted head that is turned with a key or a coin."""
    F.lathe(key, (x, y, z), [(0.0, r), (0.0018, r), (0.003, r * 0.8), (0.003, r * 0.62), (0.0045, r * 0.58), (0.0045, 0.0)], colour)
    F.line('seam', [(x - r * 0.42, y), (x + r * 0.42, y)], r * 0.2, z + 0.0048, DARK)


def louvres(F, x0, y0, x1, y1, z, n=5, key='console', colour=BLUEC, depth=0.007):
    """Pressed ventilation louvres in a door: `n` hoods one over another, each open downward, the dark of the slot under it."""
    step = (y1 - y0) / n
    for k in range(n):
        a = y0 + k * step
        F.prism(key, x0, x1, [(a + step * 0.18, z), (a + step * 0.92, z), (a + step * 0.22, z + depth)], colour)
        F.quad('seam', x0 + 0.002, a + step * 0.02, x1 - 0.002, a + step * 0.20, z + 0.0006, srgb(0x0c0d0e))


def nameplate(F, text, x, y, z, height=0.007, colour=srgb(0x101213), ink=srgb(0xe6e2d2), pad=0.006, screws=True):
    """An engraved nameplate: black laminate with its letters cut through to white, a screw at each end."""
    pts, tris, width = lettering(text, height)
    half = width / 2 + pad + (0.007 if screws else 0.0)
    F.block('anod', (x - half, y - height / 2 - pad * 0.7, z), (x + half, y + height / 2 + pad * 0.7, z + 0.0015), colour, r=0.0)
    F.text(text, x, y - height / 2, z + 0.0018, height, ink)
    if screws:
        for sx in (-1, 1):
            screw(F, x + sx * (half - 0.004), y, z + 0.0015, r=0.0016)
    return half * 2


def gland(F, x, y, z, r=0.008, cable=0.0035, key='steel', colour=STAINLESS):
    """A cable gland: a hexagon nut on the plate, the sealing dome, and the cable coming out of it."""
    bolt(F, x, y, z, r=r, h=r * 0.7, key=key, colour=colour)
    F.lathe(key, (x, y, z + r * 0.7 + 0.0012), [(0.0, r * 0.82), (r * 0.5, r * 0.8), (r * 0.9, r * 0.55), (r * 0.9, cable)], colour)


def pull(F, x0, x1, y, z, proud=0.022, r=0.005, key='steel', colour=STAINLESS):
    """A bow handle: a round bar on two feet."""
    F.sweep(key, [(x0, y, z), (x0, y, z + proud - r * 1.5), (x0 + r * 1.5, y, z + proud), (x1 - r * 1.5, y, z + proud), (x1, y, z + proud - r * 1.5), (x1, y, z)], r, colour)
    for x in (x0, x1):
        F.lathe(key, (x, y, z), [(0.0, r * 1.9), (0.002, r * 1.9), (0.002, r)], colour)


def socket(F, x, y, z, colour=WHITE, double=False):
    """A 230 V socket outlet: a moulded plate, the round well of each outlet with its two holes and earth clips, and the plate's screws."""
    n = 2 if double else 1
    half = 0.041 * n
    F.pillow('plastic', (x - half, y - 0.041, z), (x + half, y + 0.041, z + 0.009), colour, r=0.004, segs=3)
    for k in range(n):
        cx = x + (k - (n - 1) / 2) * 0.082
        F.lathe('plastic', (cx, y, z + 0.009), [(0.0, 0.0215), (0.0015, 0.0215), (0.0015, 0.0195)], tint(colour, 0.94))
        F.lathe('dark', (cx, y, z + 0.0085), [(0.0, 0.0195), (0.0012, 0.0195), (0.0012, 0.0)], srgb(0x202326))
        for sx in (-1, 1):
            F.lathe('dark', (cx + sx * 0.0095, y, z + 0.0097), [(0.0, 0.0026), (0.0006, 0.0026), (0.0006, 0.0)], srgb(0x050505))
        for sy in (-1, 1):
            F.box('brass', (cx - 0.003, y + sy * 0.0195 - 0.0012, z + 0.0092), (cx + 0.003, y + sy * 0.0195 + 0.0012, z + 0.0112), BRASS)
        screw(F, cx, y + 0.031, z + 0.009, r=0.002)
