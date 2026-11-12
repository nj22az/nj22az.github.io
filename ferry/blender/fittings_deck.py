"""
Deck fittings: ventilators, air and sounding pipes, and the deck's furniture and lights (fittings.py is the door).

Mushroom ventilator, gooseneck ventilator, air pipe head, sounding pipe cap; the slatted bench with iron ends, a floodlight on
a rail bracket, a foam monitor on a pedestal, a bulkhead light in a wire guard, a loudspeaker horn, a waste bin lashed to a
rail.

Sizes: ventilator coamings stand 760 mm over an exposed deck and air pipes the same (the load line rules' heights, as
recalled [M]; 900 mm on the forward quarter is the placer's to ask for with `coaming`). The bench is the owner's photograph
E7; rails are the ship's own three courses (1.0 m, 0.62 m, 0.30 m; steel.py).
"""
from math import pi, sin, cos, radians, degrees, hypot
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403
from fittings_kit import fitting
from fittings_mooring import handwheel

VENT_WHITE = srgb(0xe9e7df)


def _tap(kit, what, at, top=100, unit='%', reach=1.6, said='shut'):
    kit.inputs.append(dict(id=kit.mid('work'), name=what, min=0, max=top, step=1, unit=unit, below='', above=said, rest='open' if said == 'shut' else 'shut', auto='tap',
                           at=list(at), normal=[0, 0, 1], reach=reach))


def _deck_flange(kit, r, colour, bolts=6, h=0.016, hollow=False):
    """A pipe's foot on the deck: a flange with its bolts, a weld collar over it (a ring, for a trunk that is open below)."""
    if hollow:
        lathe(kit.p('paint'), (0, 0, 0), UP, [(0.0, r + 0.055), (h, r + 0.055), (h, r - 0.008), (0.0, r - 0.008)], tint(colour, 0.9), caps=(False, False))
    else:
        kit.p('paint').tube((0, 0, 0), (0, h, 0), r + 0.055, colour=tint(colour, 0.9))
    bolt_circle(kit.p('steel'), (0, h, 0), UP, r + 0.034, bolts, 0.012)
    lathe(kit.p('paint'), (0, h, 0), UP, [(0.0, r + 0.016), (0.03, r)], tint(colour, 0.95), caps=(False, False))


def _tally(kit, text, centre, right, up, w=0.16, h=0.045, colour=BRASS):
    """A tally plate: what the pipe or the ventilator serves."""
    r, u = Vector(right).normalized(), Vector(up).normalized()
    n = r.cross(u)
    c = Vector(centre)
    with turned(kit, tuple(c), x=tuple(r), y=tuple(u)):
        kit.p('bronze').block((-w / 2, -h / 2, 0.0), (w / 2, h / 2, 0.003), colour, r=0.001)
    label(kit, kit.p('mark'), tuple(c + n * 0.003), tuple(r), tuple(u), w - 0.01, h - 0.008, colour, (text,), ink=BLACK, proud=0.0008)


@fitting('ventilator-mushroom', size=(0.95, 0.95, 1.25), front='either', title='Mushroom ventilator',
         note='options dia (the trunk: 0.4, 0.6 ...), coaming (0.76), serves (its tally); its head screws down to a tap; a round cut in the deck is asked for under it')
def ventilator_mushroom(kit, dia=0.6, coaming=0.76, serves='E.R. SUPPLY', **_):
    """
    A mushroom ventilator: a coaming up from the deck with a flange and brackets at its foot; inside its mouth a spider that
    carries a screwed spindle; on the spindle the mushroom head, which a handwheel on top screws down on to the coaming's
    rubber seat to close it; a wire screen under the head; its tally plate.
    """
    paint, steel, galv, rubber = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('rubber')
    r, c = dia / 2, VENT_WHITE
    _deck_flange(kit, r, c, bolts=8, hollow=True)
    lathe(paint, (0, 0.016, 0), UP, [(0.0, r), (coaming - 0.016, r), (coaming - 0.016, r - 0.008), (0.0, r - 0.008)], lambda i: c if i < 1 else tint(DARK, 0.8), caps=(False, False))
    for k in range(4):                                             # four brackets at the coaming's foot
        a = pi / 4 + k * pi / 2
        d = Vector((cos(a), 0, sin(a)))
        gusset(paint, d * (r - 0.003) + Vector((0, 0.016, 0)), tuple(d), UP, 0.05, 0.14, 0.008, c)
    rubber.ring((0, coaming + 0.004, 0), UP, r - 0.004, 0.009, BLACK)                                                # the seat the head closes on
    # the spider in the mouth and the spindle up from it
    for k in range(3):
        a = 2 * pi * k / 3
        d = Vector((cos(a), 0, sin(a)))
        bar(galv, tuple(d * 0.02 + Vector((0, coaming - 0.06, 0))), tuple(d * (r - 0.006) + Vector((0, coaming - 0.06, 0))), 0.008, 0.04, GALV, up=UP)
    lathe(galv, (0, coaming - 0.09, 0), UP, [(0.0, 0.0), (0.0, 0.03), (0.06, 0.03), (0.06, 0.0)], GALV)
    lift = 0.12                                                    # how far open the head stands over its seat
    steel.tube((0, coaming - 0.03, 0), (0, coaming + lift + r * 0.42 + 0.10, 0), 0.014, colour=STEEL)
    # the wire screen round the opening between seat and head
    rs = r + 0.003                                                   # it stands round the coaming's head, its uprights lapped on the coaming
    for k in range(5):
        galv.ring((0, coaming + 0.014 + (lift - 0.02) * k / 4, 0), UP, rs, 0.0025, tint(GALV, 0.85))
    for k in range(24):
        a = 2 * pi * k / 24
        galv.tube((rs * cos(a), coaming - 0.04, rs * sin(a)), (rs * cos(a), coaming + lift + 0.02, rs * sin(a)), 0.0025, colour=tint(GALV, 0.85), caps=(False, False))
    galv.ring((0, coaming - 0.035, 0), UP, rs + 0.001, 0.004, tint(GALV, 0.85))                                       # the band that clamps it to the coaming
    # the head: a dished cap with a turned-down rim, wider than the coaming; a boss on it for the spindle's nut; the handwheel
    H = lambda key: kit.p(key, 'head')
    R = r * 1.42
    y0 = coaming + lift
    lathe(H('paint'), (0, y0, 0), UP, [(-0.035, R - 0.006), (-0.035, R), (0.02, R), (0.08, R * 0.86), (r * 0.30, R * 0.45), (r * 0.38, 0.05), (r * 0.38, 0.0),
                                       (r * 0.38 - 0.006, 0.0), (r * 0.30 - 0.006, R * 0.44), (0.074, R * 0.85), (0.014, R - 0.006), (-0.035, R - 0.006)],
          lambda i: c if i < 7 else tint(DARK, 0.85), caps=(False, False))
    lathe(H('paint'), (0, y0 + r * 0.38 - 0.004, 0), UP, [(0.0, 0.0), (0.0, 0.05), (0.035, 0.035), (0.035, 0.0)], c)
    W = lambda key: kit.p(key, 'wheel')
    handwheel(W('steel'), (0, y0 + r * 0.42 + 0.085, 0), UP, 0.13, RED, spokes=4, rim=0.010)
    _tally(kit, serves, (0, coaming * 0.62, r + 0.001), PORT, UP)
    for sx in (-1, 1):                                             # the tally stands on two studs welded to the coaming
        steel.tube((sx * 0.06, coaming * 0.62, (r * r - 0.0036) ** 0.5 - 0.003), (sx * 0.06, coaming * 0.62, r + 0.0015), 0.005, colour=BRASS)
    kit.cut('deck', (-r + 0.01, -0.012, -r + 0.01), (r - 0.01, 0.0, r - 0.01), round_=((0, 0, 0), r - 0.01, UP))
    _tap(kit, f'Ventilator, {serves.lower()}', (0, y0, 0), top=100)
    kit.movers += [dict(id=kit.mid('head'), kind='slide', input=kit.mid('work'), axis=[0, -1, 0], pivot=[0, 0, 0], ratio=(lift - 0.012) / 100),
                   dict(id=kit.mid('wheel'), kind='turn', input=kit.mid('work'), axis=[0, 1, 0], pivot=[0, 0, 0], ratio=14.4, on=kit.mid('head'))]
    kit.clear = ((-R - 0.3, 0.0, -R - 0.3), (R + 0.3, y0 + 0.6, R + 0.3))
    kit.known_by = ('Coaming with a bolted deck flange, weld collar and four brackets; rubber seat; a spider and a screwed spindle; a wire screen; '
                    'the mushroom head with its boss; a handwheel on the spindle; a brass tally. The head screws down to a tap')


@fitting('ventilator-gooseneck', size=(0.55, 0.3, 1.0), front='+z (its mouth looks down on that side)', title='Gooseneck ventilator',
         note='options dia (0.15), serves; its flap shuts to a tap')
def ventilator_gooseneck(kit, dia=0.15, coaming=0.76, serves='PAINT STORE', **_):
    """
    A gooseneck ventilator: a pipe up from a bolted deck flange, bent over so that its mouth looks down; a flange on the
    mouth with a wire gauze in it; a flap hinged on the flange, held open by its stay, with a wing nut to screw it shut;
    its tally plate.
    """
    paint, steel, galv = kit.p('paint'), kit.p('steel'), kit.p('galv')
    r, c = dia / 2, VENT_WHITE
    _deck_flange(kit, r, c)
    R = 0.16
    pts = [(0, 0.016, 0), (0, coaming, 0)] + [(0, coaming + R * sin(radians(a)), R - R * cos(radians(a))) for a in range(15, 181, 15)] + [(0, coaming - 0.07, 2 * R)]
    sweep(paint, pts, r, c, caps=(True, False))
    my = coaming - 0.07
    lathe(paint, (0, my, 2 * R), (0, -1, 0), [(0.0, r), (0.0, r + 0.035), (0.012, r + 0.035), (0.012, r - 0.006), (-0.10, r - 0.006)], lambda i: c if i < 3 else tint(DARK, 0.8), caps=(False, False))
    for k in range(-3, 4):                                         # the gauze in the mouth
        galv.tube((k * r / 3.6, my - 0.006, 2 * R - (r ** 2 - (k * r / 3.6) ** 2) ** 0.5), (k * r / 3.6, my - 0.006, 2 * R + (r ** 2 - (k * r / 3.6) ** 2) ** 0.5), 0.0022, colour=BRASS, caps=(False, False))
        galv.tube((-(r ** 2 - (k * r / 3.6) ** 2) ** 0.5, my - 0.008, 2 * R + k * r / 3.6), ((r ** 2 - (k * r / 3.6) ** 2) ** 0.5, my - 0.008, 2 * R + k * r / 3.6), 0.0022, colour=BRASS, caps=(False, False))
    # the flap: hinged on the flange's outer side, hanging open; it swings up against the mouth
    hz = 2 * R + r + 0.045
    hy = my - 0.012
    steel.tube((-0.03, hy, hz), (0.03, hy, hz), 0.007, colour=STEEL)
    paint.block((-0.02, hy - 0.004, 2 * R + r + 0.02), (0.02, hy + 0.008, hz + 0.004), c, r=0.002)
    F = lambda key: kit.p(key, 'flap')
    lathe(F('paint'), (0, hy - r - 0.05, hz + 0.012), FWD, [(0.0, 0.0), (0.0, r + 0.03), (0.006, r + 0.03), (0.006, 0.0)], c)
    F('paint').block((-0.015, hy - 0.022, hz + 0.004), (0.015, hy - 0.004, hz + 0.018), c, r=0.002)
    F('rubber').ring((0, hy - r - 0.05, hz + 0.010), FWD, r + 0.012, 0.005, BLACK)
    F('bronze').tube((0, hy - 2 * r - 0.066, hz + 0.018), (0, hy - 2 * r - 0.066, hz + 0.05), 0.006, colour=BRASS)      # the wing nut's stud
    F('bronze').block((-0.022, hy - 2 * r - 0.071, hz + 0.036), (0.022, hy - 2 * r - 0.061, hz + 0.046), BRASS, r=0.002)
    _tally(kit, serves, (0, coaming * 0.55, -r - 0.001), (-1, 0, 0), UP, w=0.14)
    for sx in (-1, 1):
        steel.tube((sx * 0.05, coaming * 0.55, -(r * r - 0.0025) ** 0.5 + 0.003), (sx * 0.05, coaming * 0.55, -r - 0.0015), 0.004, colour=BRASS)
    _tap(kit, f'Gooseneck, {serves.lower()}', (0, my, 2 * R), top=88, unit='°')
    kit.movers.append(dict(id=kit.mid('flap'), kind='turn', input=kit.mid('work'), axis=[1, 0, 0], pivot=[0, hy, hz], ratio=1.0))
    kit.clear = ((-0.4, 0.0, -0.4), (0.4, coaming + 0.5, 0.9))
    kit.known_by = ('Pipe from a bolted deck flange with a weld collar, bent over to look down; a flange and gauze in its mouth; a flap on a hinge '
                    'with a rubber joint and a wing nut; a brass tally. The flap shuts to a tap')


@fitting('air-pipe', size=(0.3, 0.3, 0.95), front='either', title='Air pipe head',
         note='a tank\'s air pipe with a float-ball head; options dia (0.10), serves')
def air_pipe(kit, dia=0.10, coaming=0.76, serves='F.W. TANK 2 S', **_):
    """
    A tank's air pipe: the pipe up from a bolted deck flange; on it the head, a cast body with a hood; under the hood a cage
    of bars with gauze round it, and in the cage the float ball that closes the pipe when a sea comes over; its tally plate.
    """
    paint, steel, galv, plastic = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('plastic')
    r, c = dia / 2, VENT_WHITE
    _deck_flange(kit, r, c)
    paint.tube((0, 0.016, 0), (0, coaming - 0.02, 0), r, colour=c)
    y = coaming - 0.02
    lathe(paint, (0, y, 0), UP, [(0.0, r), (0.0, r + 0.04), (0.012, r + 0.04), (0.012, r + 0.055), (0.03, r + 0.055), (0.03, 0.0)], c, caps=(False, False))    # the body's flange and floor
    bolt_circle(steel, (0, y + 0.012, 0), UP, r + 0.028, 6, 0.008)
    cage_r, h = r + 0.045, 0.13
    for k in range(10):
        a = 2 * pi * k / 10
        galv.tube((cage_r * cos(a), y + 0.03, cage_r * sin(a)), (cage_r * cos(a), y + 0.03 + h, cage_r * sin(a)), 0.004, colour=BRASS)
    for k in range(7):                                             # the gauze: rings of fine wire round the cage
        galv.ring((0, y + 0.04 + (h - 0.02) * k / 6, 0), UP, cage_r + 0.004, 0.0016, BRASS)
    plastic.ball((0, y + 0.03 + r * 0.9, 0), r * 0.9, ORANGE)                                                       # the float ball, on its seat
    lathe(paint, (0, y + 0.03 + h, 0), UP, [(-0.05, cage_r + 0.036), (0.0, cage_r + 0.036), (0.03, cage_r + 0.004), (0.05, 0.0), (0.044, 0.0), (0.024, cage_r), (0.0, cage_r + 0.004),
                                            (-0.05, cage_r + 0.030), (-0.05, cage_r + 0.036)], lambda i: c if i < 3 else tint(DARK, 0.9), caps=(False, False))   # the hood, on the bars' heads
    _tally(kit, serves, (0, coaming * 0.5, r + 0.001), PORT, UP, w=0.13, h=0.04)
    steel.ring((0, coaming * 0.5, 0), UP, r + 0.002, 0.003, BRASS)
    kit.clear = ((-0.3, 0.0, -0.3), (0.3, coaming + 0.4, 0.3))
    kit.known_by = ('Pipe from a bolted deck flange with a weld collar; the head\'s flanged body; a cage of ten bars with gauze round it; the float '
                    'ball on its seat; the hood; a brass tally on a band')


@fitting('sounding-pipe', size=(0.25, 0.25, 0.05), front='either', title='Sounding pipe',
         note='a sounding pipe\'s screwed cap in a deck socket, with its chain and tally; options serves')
def sounding_pipe(kit, serves='F.O. 3 P', **_):
    """
    A sounding pipe's deck socket: a ring welded on the deck, a brass screw cap in it with a square for the key, the cap's
    chain to an eye on the ring, and a brass tally on the deck beside it.
    """
    galv, bronze, steel = kit.p('galv'), kit.p('bronze'), kit.p('steel')
    lathe(galv, (0, 0, 0), UP, [(0.0, 0.062), (0.012, 0.058), (0.012, 0.040), (0.0, 0.040)], tint(DARK, 1.2), caps=(False, False))
    lathe(bronze, (0, 0, 0), UP, [(0.0, 0.0), (0.0, 0.040), (0.016, 0.040), (0.016, 0.034), (0.020, 0.030), (0.020, 0.0)], BRASS)
    bronze.block((-0.012, 0.020, -0.012), (0.012, 0.030, 0.012), tint(BRASS, 0.85), r=0.002)
    galv.ring((0.066, 0.008, 0), FWD, 0.008, 0.0025, GALV)
    sweep(steel, [(0.062, 0.012, 0), (0.045, 0.024, 0.01), (0.03, 0.022, 0.012), (0.012, 0.026, 0.006)], 0.002, tint(BRASS, 0.8))
    with turned(kit, (0.0, 0.0, 0.13), about=PORT, angle=-90):
        _tally(kit, serves, (0, 0, 0.0), PORT, UP, w=0.12, h=0.04)
    kit.clear = ((-0.2, 0.0, -0.2), (0.2, 0.3, 0.3))
    kit.known_by = 'A socket ring welded on the deck; a brass screw cap with a square for the key; the cap\'s chain to an eye; a brass tally on the deck'


@fitting('bench', size=(1.8, 0.62, 0.86), front='+z (one sits looking that way)', title='Bench',
         note='slatted wooden bench with iron ends; its length along x; origin under its middle')
def bench(kit, length=1.8, **_):
    """
    A deck bench as the owner's photograph shows it (reference E7): two cast-iron ends, each a foot bar bolted to the deck,
    a front leg, a back leg carried up as the back's standard, a seat bearer and an arm rest; five teak slats for the seat
    and three for the back, each held to each end by two coach bolts.
    """
    cast, teak, steel = kit.p('cast'), kit.p('teak'), kit.p('steel')
    iron = srgb(0x23282a)
    half = length / 2
    seat = [(z, 0.385 + (z - 0.03) * 0.015 / 0.41 + 0.011) for z in (0.40, 0.31, 0.22, 0.13, 0.055)]       # (z, the bearer's top under it)
    lean = 0.145 / 0.465                                              # how the back's standard leans, for each metre it rises
    back = [(0.03 - lean * (y - 0.385) + 0.0116, y) for y in (0.52, 0.65, 0.78)]
    for sx in (-1, 1):
        x = sx * (half - 0.12)
        e = lambda z, y: (x, y, z)
        cast.block((x - 0.03, 0.0, -0.14), (x + 0.03, 0.014, 0.48), iron, r=0.004)                                    # the foot bar
        for z in (-0.10, 0.44):
            bolt(steel, (x, 0.014, z), UP, 0.012)
        for a, b in (((0.42, 0.014), (0.44, 0.40)), ((-0.06, 0.014), (0.03, 0.385)), ((0.03, 0.385), (-0.115, 0.85)), ((0.03, 0.385), (0.44, 0.40)),
                     ((0.44, 0.40), (0.45, 0.62)), ((0.45, 0.62), (-0.062, 0.63))):
            bar(cast, e(a[0], a[1]), e(b[0], b[1]), 0.045, 0.022, iron, up=FWD if abs(b[1] - a[1]) > abs(b[0] - a[0]) else UP)
        cast.ball(e(0.455, 0.628), 0.03, iron)                                                                        # the arm rest's knob
        cast.ball(e(-0.117, 0.86), 0.026, iron)
        prism(cast, [e(0.40, 0.014), e(0.30, 0.014), e(0.425, 0.14)], (0.012 * sx, 0, 0), iron)                         # a web in the front leg's foot
    for k, (z, y) in enumerate(seat):
        teak.block((-half, y, z - 0.04), (half, y + 0.028, z + 0.04), tint(TEAK, 0.95 + 0.04 * (k % 3)), r=0.006)
        for sx in (-1, 1):
            for dz in (-0.018, 0.018):
                kit.p('bronze').ball((sx * (half - 0.12), y + 0.028, z + dz), 0.007, BRASS, squash=0.5)
    for k, (z, y) in enumerate(back):
        with turned(kit, (0.0, y, z), about=PORT, angle=-17.3):
            teak.block((-half, -0.045, 0.0), (half, 0.045, 0.028), tint(TEAK, 0.97 + 0.04 * (k % 2)), r=0.006)
            for sx in (-1, 1):
                for dy in (-0.02, 0.02):                           # each coach bolt goes through the slat into the iron
                    kit.p('bronze').tube((sx * (half - 0.12), dy, 0.029), (sx * (half - 0.12), dy, -0.014), 0.004, colour=BRASS)
                    kit.p('bronze').ball((sx * (half - 0.12), dy, 0.028), 0.007, BRASS, squash=0.5)
    kit.clear = ((-half - 0.2, 0.0, -0.3), (half + 0.2, 1.0, 1.0))
    kit.known_by = ('Two cast-iron ends, each a foot bar with two deck bolts, front leg, back leg and standard, seat bearer, arm rest with a knob; '
                    'five teak seat slats and three back slats, two brass coach bolts in each at each end')


@fitting('floodlight', size=(0.5, 0.45, 1.75), front='+z (it lights that way)', title='Deck floodlight',
         note='a floodlight on its own stanchion clamped to a rail: origin on the deck under the rail\'s line (the rail runs along x); options rails ((height, radius), ...), aim (degrees down)')
def floodlight(kit, rails=((1.0, 0.019), (0.62, 0.012)), aim=35.0, **_):
    """
    A deck floodlight on a rail: a flat-bar stanchion welded to the deck and clamped to the rail's courses by U-bolts; a
    stirrup on the stanchion's head with a wing nut each side; in the stirrup the lamp, a cast body with cooling fins, a
    glass in a frame held by four clips; its cable from a gland on the body down the stanchion in clips, through a
    junction box, to a gland in the deck.
    """
    paint, steel, galv, lens = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('lens')
    grey = LIGHT
    z0 = 0.045                                                       # the stanchion stands inboard of the rail
    paint.block((-0.03, 0.0, z0 - 0.006), (0.03, 1.46, z0 + 0.006), VENT_WHITE, r=0.003)
    paint.block((-0.05, 0.0, z0 - 0.05), (0.05, 0.010, z0 + 0.05), VENT_WHITE, r=0.003)
    gusset(paint, (0, 0.010, z0 + 0.006), FWD, UP, 0.04, 0.10, 0.008, VENT_WHITE)
    for h, rr in rails:                                             # a U-bolt round each course of the rail, its two nuts on the stanchion's inboard face
        sweep(galv, [(0.0, h - rr - 0.006, z0 + 0.022), (0.0, h - rr - 0.006, 0.0)] + [(0.0, h + (rr + 0.006) * sin(radians(a)), -(rr + 0.006) * cos(radians(a))) for a in range(-60, 61, 30)]
              + [(0.0, h + rr + 0.006, 0.0), (0.0, h + rr + 0.006, z0 + 0.022)], 0.004, GALV)
        for dy in (-(rr + 0.006), rr + 0.006):
            hexagon(galv, (0.0, h + dy, z0 + 0.006), (0.0, h + dy, z0 + 0.014), 0.012, GALV)
        paint.block((-0.03, h - rr - 0.016, rr * 0.2), (0.03, h + rr + 0.016, z0 - 0.006), VENT_WHITE, r=0.003)        # a packing piece between rail and stanchion
    # the stirrup and the lamp
    sy = 1.46
    steel.tube((0, sy, z0), (0, sy + 0.03, z0), 0.014, colour=STEEL)
    paint.block((-0.21, sy + 0.03, z0 - 0.02), (0.21, sy + 0.042, z0 + 0.02), grey, r=0.003)
    for sx in (-1, 1):
        paint.block((sx * 0.21 - (0.012 if sx > 0 else 0.0), sy + 0.03, z0 - 0.02), (sx * 0.21 + (0.012 if sx < 0 else 0.0), sy + 0.21, z0 + 0.02), grey, r=0.003)
        steel.tube((sx * 0.18, sy + 0.17, z0), (sx * 0.235, sy + 0.17, z0), 0.008, colour=STEEL)
        galv.block((sx * 0.222 - 0.004, sy + 0.150, z0 - 0.02), (sx * 0.222 + 0.004, sy + 0.190, z0 + 0.02), BRASS, r=0.002)   # the wing nut
    with turned(kit, (0.0, sy + 0.17, z0), about=PORT, angle=aim) as T:
        paint.block((-0.185, -0.13, -0.07), (0.185, 0.13, 0.07), grey, r=0.012)
        for k in range(7):                                         # cooling fins on its back
            paint.block((-0.15 + 0.05 * k - 0.004, -0.11, -0.10), (-0.15 + 0.05 * k + 0.004, 0.11, -0.068), grey, r=0.002)
        paint.block((-0.195, -0.14, 0.07), (0.195, 0.14, 0.086), tint(grey, 0.85), r=0.004)                           # the glass's frame
        lens.block((-0.165, -0.11, 0.086), (0.165, 0.11, 0.090), srgb(0xf6f1e2), r=0.001)
        for sx in (-1, 1):
            for sy_ in (-1, 1):
                galv.block((sx * 0.192 - 0.006, sy_ * 0.09 - 0.012, 0.062), (sx * 0.192 + 0.006, sy_ * 0.09 + 0.012, 0.092), GALV, r=0.002)
        galv.tube((0.10, -0.13, -0.02), (0.10, -0.16, -0.02), 0.011, colour=BRASS)                                   # the cable's gland, under the body
        gl = T.at((0.10, -0.16, -0.02))
    # the cable: from the gland to the stanchion, down it in clips, through a junction box, to the deck gland
    jb = 0.95
    kit.run('cables', [gl, (0.10, gl[1] - 0.06, gl[2] - 0.01), (0.045, sy - 0.10, z0 + 0.014), (0.045, jb + 0.07, z0 + 0.014)], 0.006, BLACK)
    paint.block((0.0, jb - 0.07, z0 + 0.006), (0.09, jb + 0.07, z0 + 0.05), grey, r=0.006)
    for dy in (-0.05, 0.05):
        for dx in (0.012, 0.078):
            steel.tube((dx, jb + dy, z0 + 0.05), (dx, jb + dy, z0 + 0.053), 0.004, colour=STEEL)
    kit.run('cables', [(0.045, jb - 0.07, z0 + 0.014), (0.045, 0.30, z0 + 0.014), (0.045, 0.06, z0 + 0.030), (0.045, 0.03, z0 + 0.075)], 0.006, BLACK)
    galv.tube((0.045, 0.0, z0 + 0.075), (0.045, 0.035, z0 + 0.075), 0.012, colour=BRASS)
    for y in (0.22, 0.52, 0.80, 1.15, 1.32):
        galv.block((0.032, y - 0.008, z0 + 0.006), (0.058, y + 0.008, z0 + 0.0215), GALV, r=0.002)                    # a clip over the cable
    kit.clear = ((-0.4, 0.0, 0.04), (0.4, 1.9, 0.6))
    kit.known_by = ('A flat-bar stanchion on a welded foot with a bracket, U-bolted to two courses of the rail with packing pieces; a stirrup with '
                    'two wing nuts; the lamp\'s body with fins, a glass in a frame held by four clips; its cable from a gland in clips down the '
                    'stanchion, through a junction box with four lid screws, to a deck gland')


@fitting('foam-monitor', size=(1.3, 0.5, 1.6), front='+z (it throws that way)', title='Foam monitor',
         note='a foam monitor on a pedestal (for the helideck); it trains and elevates on keys; origin under its riser')
def foam_monitor(kit, **_):
    """
    A foam monitor: a riser on a bolted deck flange with a butterfly valve and its lever; the training joint with a
    handwheel and worm box; the body's two bends; the elevating joint with its handwheel; the barrel and the foam branch
    with its air holes. Painted red.
    """
    paint, steel, galv = kit.p('paint'), kit.p('steel'), kit.p('galv')
    red = RED
    r = 0.055
    paint.tube((0, 0, 0), (0, 0.02, 0), r + 0.07, colour=red)
    bolt_circle(steel, (0, 0.02, 0), UP, r + 0.045, 8, 0.014)
    paint.tube((0, 0.02, 0), (0, 0.62, 0), r, colour=red)
    for y in (0.62, 0.70):                                          # the valve between two flanges; its lever
        paint.tube((0, y, 0), (0, y + 0.018, 0), r + 0.045, colour=red)
    paint.tube((0, 0.638, 0), (0, 0.70, 0), r + 0.02, colour=tint(DARK, 1.2))
    bolt_circle(steel, (0, 0.718, 0), UP, r + 0.03, 6, 0.010)
    steel.tube((0, 0.669, -r - 0.02), (0, 0.669, -r - 0.07), 0.012, colour=STEEL)
    bar(paint, (0, 0.669, -r - 0.06), (0.26, 0.669, -r - 0.06), 0.012, 0.03, tint(DARK, 1.2), up=UP)
    kit.p('plastic').tube((0.26, 0.669, -r - 0.06), (0.34, 0.669, -r - 0.06), 0.016, colour=BLACK)
    paint.tube((0, 0.718, 0), (0, 0.90, 0), r, colour=red)
    lathe(paint, (0, 0.90, 0), UP, [(0.0, r), (0.0, r + 0.04), (0.05, r + 0.04), (0.05, r)], tint(DARK, 1.2), caps=(False, False))           # the training joint's fixed half
    # ---- what trains: the upper half of the joint, the worm box and its handwheel, the body, and on it what elevates
    T = lambda key: kit.p(key, 'train')
    lathe(T('paint'), (0, 0.953, 0), UP, [(0.0, r), (0.0, r + 0.04), (0.05, r + 0.04), (0.05, r)], red, caps=(False, False))
    T('paint').block((r + 0.02, 0.945, -0.05), (r + 0.11, 1.01, 0.05), red, r=0.008)                                  # the worm box
    T('steel').tube((r + 0.065, 0.978, 0.05), (r + 0.065, 0.978, 0.16), 0.009, colour=STEEL)
    handwheel(T('steel'), (r + 0.065, 0.978, 0.15), FWD, 0.085, tint(DARK, 1.2), spokes=3, rim=0.008)
    ey, bx = 1.14, 0.30                                             # the elevating joint's axis, athwart the monitor; the barrel's line, to port of the riser
    sweep(T('paint'), [(0, 0.953, 0), (0, 1.06, 0), (0.03, 1.12, 0), (0.08, ey, 0), (0.12, ey, 0)], r, red, caps=(False, False))
    lathe(T('paint'), (0.11, ey, 0), PORT, [(0.0, r), (0.0, r + 0.035), (0.045, r + 0.035), (0.045, r)], tint(DARK, 1.2), caps=(False, False))
    E = lambda key: kit.p(key, 'elevate')
    lathe(E('paint'), (0.157, ey, 0), PORT, [(0.0, r * 0.9), (0.0, r + 0.035), (0.045, r + 0.035), (0.045, r * 0.9)], red, caps=(False, False))
    sweep(E('paint'), [(0.158, ey, 0), (0.22, ey, 0), (bx - 0.03, ey, 0.03), (bx, ey, 0.10), (bx, ey, 0.55)], r * 0.9, red, caps=(False, False))
    lathe(E('paint'), (bx, ey, 0.55), FWD, [(0.0, r * 0.9), (0.0, r + 0.02), (0.03, r + 0.02), (0.03, r + 0.012), (0.42, r + 0.03), (0.42, r + 0.022), (0.03, r + 0.004),
                                               (0.0, r * 0.9 - 0.006)], lambda i: red if i < 5 else tint(DARK, 0.8), caps=(False, False))    # the foam branch
    for k in range(6):                                             # its air holes, each a dark port on the branch's foot
        a = 2 * pi * k / 6
        E('paint').tube((bx + (r + 0.016) * cos(a), ey + (r + 0.016) * sin(a), 0.60), (bx + (r + 0.0225) * cos(a), ey + (r + 0.0225) * sin(a), 0.60), 0.012, colour=BLACK)
    E('steel').tube((bx, ey + r * 0.9 - 0.004, 0.30), (bx, ey + 0.16, 0.30), 0.008, colour=STEEL)                     # the elevating handwheel's stem on the barrel
    handwheel(E('steel'), (bx, ey + 0.16, 0.30), UP, 0.075, tint(DARK, 1.2), spokes=3, rim=0.008)
    paint.block((-0.04, 0.34, r - 0.004), (0.04, 0.42, r + 0.003), WHITE, r=0.001)
    label(kit, kit.p('mark'), (0.0, 0.38, r + 0.003), PORT, UP, 0.07, 0.07, WHITE, ('F',), ink=RED, proud=0.0012)
    kit.inputs += [dict(id=kit.mid('train'), name='Foam monitor: train', min=-120, max=120, step=1, unit='°', below='to port', above='to starboard', rest='fore and aft',
                        keys=['Left', 'Amidships', 'Right'], notch=15, rate=20),
                   dict(id=kit.mid('elevate'), name='Foam monitor: elevate', min=-15, max=60, step=1, unit='°', below='depressed', above='elevated', rest='level',
                        keys=['Down', 'Level', 'Up'], notch=10, rate=15)]
    kit.movers += [dict(id=kit.mid('train'), kind='turn', input=kit.mid('train'), axis=[0, -1, 0], pivot=[0, 0, 0]),
                   dict(id=kit.mid('elevate'), kind='turn', input=kit.mid('elevate'), axis=[-1, 0, 0], pivot=[0, ey, 0], on=kit.mid('train'))]
    kit.clear = ((-1.2, 0.0, -1.2), (1.2, 2.0, 1.2))
    kit.known_by = ('Riser on a bolted deck flange; a butterfly valve between flanges with its lever; the training joint, worm box and handwheel; the '
                    'body\'s bend; the elevating joint and its handwheel; the barrel; the foam branch with six air holes; red, lettered F. It '
                    'trains and elevates on keys')


@fitting('bulkhead-light', size=(0.2, 0.15, 0.3), front='+z (out from the bulkhead)', title='Bulkhead light',
         note='a bulkhead light in a wire guard: origin on the deck at the wall\'s face (z = 0); option h (its height over the deck)')
def bulkhead_light(kit, h=1.9, **_):
    """
    A bulkhead light: a cast base bolted to the bulkhead by four screws, a glass well-glass screwed into it, a wire guard
    over the glass, the cable up the bulkhead in clips from below into a gland in the base.
    """
    paint, steel, galv, lens = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('lens')
    grey = LIGHT
    with turned(kit, (0.0, h, 0.0), about=PORT, angle=90):          # drawn standing on a table, then stood against the wall
        lathe(paint, (0, 0, 0), UP, [(0.0, 0.0), (0.0, 0.085), (0.02, 0.085), (0.035, 0.065), (0.045, 0.062), (0.045, 0.0)], grey)
        for k in range(4):
            a = pi / 4 + k * pi / 2
            steel.tube((0.072 * cos(a), 0.02, 0.072 * sin(a)), (0.072 * cos(a), 0.024, 0.072 * sin(a)), 0.006, colour=STEEL)
        lathe(lens, (0, 0.045, 0), UP, [(0.0, 0.054), (0.05, 0.054), (0.085, 0.044), (0.105, 0.02), (0.11, 0.0)], srgb(0xf3ecd6), caps=(False, False))
        for k in range(2):                                         # the guard: two hoops of wire over the glass and a ring round its middle
            with turned(kit, (0, 0.045, 0), about=UP, angle=90 * k):
                sweep(galv, [(-0.064, 0.0, 0), (-0.064, 0.06, 0), (-0.045, 0.105, 0), (0.0, 0.122, 0), (0.045, 0.105, 0), (0.064, 0.06, 0), (0.064, 0.0, 0)], 0.003, GALV)
        galv.ring((0, 0.105, 0), UP, 0.0655, 0.003, GALV)
        galv.ring((0, 0.046, 0), UP, 0.066, 0.004, GALV)
    galv.tube((0, h - 0.085, 0.022), (0, h - 0.115, 0.022), 0.010, colour=BRASS)                                      # the gland under the base
    kit.run('cables', [(0, h - 0.115, 0.022), (0, h - 0.16, 0.008), (0, h - 0.45, 0.008), (0, h - 0.75, 0.008)], 0.006, BLACK)
    for y in (h - 0.22, h - 0.48, h - 0.72):
        galv.block((-0.016, y - 0.007, 0.0), (0.016, y + 0.007, 0.0155), GALV, r=0.002)
    galv.tube((0, h - 0.75, 0.008), (0, h - 0.78, 0.008), 0.010, colour=BRASS)                                        # it comes through the bulkhead by a gland here
    galv.block((-0.02, h - 0.80, 0.0), (0.02, h - 0.775, 0.02), grey, r=0.003)
    kit.clear = ((-0.3, h - 0.9, 0.0), (0.3, h + 0.3, 0.4))
    kit.known_by = 'Cast base on four screws; well-glass; a guard of two wire hoops and two rings; the cable in three clips down to a gland through the bulkhead'


@fitting('loudspeaker', size=(0.3, 0.4, 0.35), front='+z (out from the bulkhead)', title='Loudspeaker horn',
         note='a horn loudspeaker on a bracket: origin on the deck at the wall\'s face (z = 0); option h')
def loudspeaker(kit, h=2.1, **_):
    """
    A horn loudspeaker: a re-entrant horn with its driver behind, in a stirrup on a foot bolted to the bulkhead, looking
    out and a little down; its cable from a gland in the driver's cover to a gland through the bulkhead.
    """
    paint, steel, galv = kit.p('paint'), kit.p('steel'), kit.p('galv')
    grey = srgb(0x9aa3a2)
    paint.block((-0.05, h - 0.05, 0.0), (0.05, h + 0.05, 0.008), grey, r=0.003)
    for sx in (-1, 1):
        for sy in (-1, 1):
            steel.tube((sx * 0.035, h + sy * 0.035, 0.008), (sx * 0.035, h + sy * 0.035, 0.012), 0.005, colour=STEEL)
    paint.block((-0.012, h - 0.012, 0.008), (0.012, h + 0.012, 0.07), grey, r=0.003)
    paint.block((-0.11, h - 0.012, 0.058), (0.11, h + 0.012, 0.07), grey, r=0.003)                                    # the stirrup
    for sx in (-1, 1):
        paint.block((sx * 0.11 - (0.008 if sx > 0 else 0.0), h - 0.012, 0.058), (sx * 0.11 + (0.008 if sx < 0 else 0.0), h + 0.012, 0.19), grey, r=0.003)
        steel.tube((sx * 0.100, h, 0.17), (sx * 0.125, h, 0.17), 0.006, colour=STEEL)
    with turned(kit, (0.0, h, 0.17), about=PORT, angle=12) as T:
        lathe(paint, (0, 0, -0.085), FWD, [(0.0, 0.0), (0.0, 0.05), (0.07, 0.05), (0.075, 0.035), (0.10, 0.04), (0.19, 0.075), (0.235, 0.102), (0.24, 0.102), (0.24, 0.098),
                                           (0.20, 0.072), (0.12, 0.038), (0.12, 0.0)], lambda i: grey if i < 8 else tint(DARK, 0.9), caps=(False, False))
        lathe(paint, (0, 0, 0.035), FWD, [(0.0, 0.0), (0.0, 0.018), (0.08, 0.03), (0.085, 0.0)], tint(grey, 0.8))       # the re-entrant cone in its mouth
        galv.tube((0, -0.05, -0.05), (0, -0.075, -0.05), 0.009, colour=BRASS)
        gl = T.at((0, -0.075, -0.05))
    kit.run('cables', [gl, (0, gl[1] - 0.05, gl[2] - 0.03), (0, h - 0.20, 0.03), (0, h - 0.24, 0.012)], 0.005, BLACK)
    galv.tube((0, h - 0.24, 0.0), (0, h - 0.24, 0.02), 0.010, colour=BRASS)
    kit.clear = ((-0.3, h - 0.4, 0.0), (0.3, h + 0.3, 0.5))
    kit.known_by = 'A foot on four screws; a stirrup with two pivot screws; the horn with its driver and re-entrant cone; its cable from a gland to a gland through the bulkhead'


@fitting('waste-bin', size=(0.45, 0.45, 0.8), front='+z (inboard)', title='Waste bin',
         note='a galvanised bin lashed to a rail: origin on the deck under the rail\'s line (the rail runs along x); option rail (the course it is lashed to: height, radius)')
def waste_bin(kit, rail=(0.62, 0.012), **_):
    """
    A waste bin: a galvanised bin with two swaged hoops and a rolled rim on three feet, two side handles, a lid with a
    handle, lettered; lashed to the rail by a rope through one handle with a turn round the rail.
    """
    galv, steel, rope, mark = kit.p('galv'), kit.p('steel'), kit.p('rope'), kit.p('mark')
    zc, r0, r1, h = 0.27, 0.165, 0.20, 0.62
    for k in range(3):
        a = 2 * pi * k / 3 + 0.5
        galv.block((r0 * 0.8 * cos(a) - 0.02, 0.0, zc + r0 * 0.8 * sin(a) - 0.02), (r0 * 0.8 * cos(a) + 0.02, 0.03, zc + r0 * 0.8 * sin(a) + 0.02), tint(GALV, 0.85), r=0.004)
    prof = [(0.0, 0.0), (0.0, r0)]
    for f in (0.3, 0.62):
        rr = r0 + (r1 - r0) * f
        prof += [(h * f - 0.012, rr), (h * f, rr + 0.007), (h * f + 0.012, rr)]
    prof += [(h, r1), (h + 0.006, r1 + 0.008), (h + 0.012, r1), (h + 0.006, r1 - 0.006), (0.008, r0 - 0.006), (0.008, 0.0)]
    lathe(galv, (0, 0.03, zc), UP, prof, lambda i: GALV if i < 10 else tint(DARK, 1.1), caps=(False, False))
    y1 = 0.03 + h
    lathe(galv, (0, y1 + 0.012, zc), UP, [(0.0, 0.0), (0.0, r1 + 0.012), (-0.03, r1 + 0.014), (-0.03, r1 + 0.018), (0.008, r1 + 0.016), (0.05, 0.05), (0.055, 0.0)], tint(GALV, 1.04))   # the lid
    sweep(steel, [(-0.05, y1 + 0.062, zc), (-0.05, y1 + 0.10, zc), (0.05, y1 + 0.10, zc), (0.05, y1 + 0.062, zc)], 0.006, GALV)
    for sx in (-1, 1):
        rr = r0 + (r1 - r0) * 0.8
        sweep(steel, [(sx * rr, 0.03 + h * 0.86, zc - 0.045), (sx * (rr + 0.04), 0.03 + h * 0.86, zc - 0.045), (sx * (rr + 0.04), 0.03 + h * 0.86, zc + 0.045), (sx * rr, 0.03 + h * 0.86, zc + 0.045)], 0.005, GALV)
    st = len(mark.f)
    ra = r0 + (r1 - r0) * 0.45
    letter(kit, mark, 'WASTE', 0.06, None, PORT, UP, BLACK, onto=lambda u, v: Vector(((ra + 0.004 + v * 0.06) * sin(u / ra), 0.03 + h * 0.40 + v, zc + (ra + 0.004 + v * 0.06) * cos(u / ra))), piece=0.02)
    mark.orient(st, lambda c: Vector((c.x, 0.0, c.z - zc)))
    # the lashing: from the back handle... a rope round the rail and through the bin's port handle, hitched
    hy = 0.03 + h * 0.86
    rr = r0 + (r1 - r0) * 0.8 + 0.04
    turn = [(rr * 0.5, rail[0] + (rail[1] + 0.007) * sin(radians(a)), -(rail[1] + 0.007) * cos(radians(a))) for a in range(-120, 241, 40)]
    sweep(rope, [(rr, hy, zc - 0.02), (rr * 0.9, hy + 0.01, zc - 0.10), (rr * 0.6, rail[0] + 0.02, 0.06)] + turn + [(rr * 0.4, rail[0] - 0.04, 0.05), (rr * 0.75, hy - 0.03, zc - 0.11), (rr, hy, zc - 0.04)],
          0.006, ROPE_ORANGE, lay=3)
    kit.clear = ((-0.4, 0.0, 0.04), (0.4, 1.0, 0.7))
    kit.known_by = 'A galvanised bin with two swaged hoops and a rolled rim on three feet; two side handles; a lid with a handle; lettered; lashed to the rail by a rope'


ROPE_ORANGE = srgb(0xd9772a)
