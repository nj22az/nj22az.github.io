"""
Deck fittings: what a vehicle deck carries for securing its cargo (fittings.py is the door; fittings_kit.py the tools).

Lashing pots in the deck (one at a time, or a whole grid of them as few parts), a rack of chain lashings on a bulkhead, a
trailer trestle, wheel chocks in their rack.

Sizes: securing points not more than 2.5 m apart fore and aft and 2.8 to 3.0 m athwartships, each good for 120 kN; chain
lashings of not less than 120 kN; an uncoupled semi-trailer stands on a trestle; wheels are chocked [R roro-freight-ships,
section 4, Lashing: the IMO guideline of 1985]. A cloverleaf pot is about 230 mm across its top plate; lashing chain 13 mm
long-link, 3 m with an elephant's foot and a lever tensioner [M, as recalled; not read tonight].
"""
from math import pi, sin, cos, radians, degrees, hypot
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403
from fittings_kit import fitting, Kit, FITTINGS
from fittings_mooring import chain

POT_R = 0.115


def _pot(kit, x, z, sunk=True, colour=YELLOW):
    """One lashing pot at (x, z) on the deck: the top plate with its cloverleaf opening, 4 mm proud of the deck and painted;
    under it the cup welded into the plating, and the bar across the cup that a hook takes."""
    cast, paint = kit.p('cast'), kit.p('deck')
    n = 32
    top = 0.004 if sunk else 0.018
    under = -0.014 if sunk else 0.0
    outer = [(x + POT_R * cos(2 * pi * k / n), under, z + POT_R * sin(2 * pi * k / n)) for k in range(n)]
    clover = [(x + (0.040 + 0.030 * cos(4 * pi * k / n) ** 2) * cos(2 * pi * k / n), under, z + (0.040 + 0.030 * cos(4 * pi * k / n) ** 2) * sin(2 * pi * k / n)) for k in range(n)]
    band(paint, outer, clover, (0, top - under, 0), colour)
    if sunk:
        lathe(cast, (x, 0.0, z), UP, [(-0.014, 0.108), (-0.060, 0.094), (-0.094, 0.052), (-0.104, 0.0), (-0.110, 0.0), (-0.100, 0.056), (-0.064, 0.100), (-0.014, 0.115)],
              lambda i: tint(RUST, 0.55) if i < 3 else tint(DARK, 0.9), sides=n, caps=(False, False))
        cast.tube((x - 0.098, -0.040, z), (x + 0.098, -0.040, z), 0.013, colour=tint(STEEL, 0.6), caps=(False, False))
        kit.cut('deck', (x - 0.110, -0.012, z - 0.110), (x + 0.110, 0.0, z + 0.110), round_=((x, 0.0, z), 0.110, UP))
    else:
        # on a deck that is not to be cut: the plate stands on the deck, and the opening has a black floor 12 mm over the
        # deck (2 mm over it, it lay in the plane of the lane lines painted there: JSY-STD-403)
        st = len(kit.p('mark').f)
        kit.p('mark').polygon([(q[0], 0.012, q[2]) for q in clover], BLACK)
        kit.p('mark').orient(st, UP)


@fitting('lashing-pot', size=(0.23, 0.23, 0.02), front='either', title='Lashing pot',
         note='a cloverleaf lashing socket flush in the deck; needs its round cut (sunk=True) or stands 18 mm proud on an uncut deck (sunk=False); for many use lashing_grid')
def lashing_pot(kit, sunk=True, **_):
    """A lashing pot: a top plate with a cloverleaf opening, the cup welded into the deck under it, a bar across the cup."""
    _pot(kit, 0.0, 0.0, sunk)
    kit.known_by = 'Top plate with a cloverleaf opening, painted yellow, 4 mm proud of the deck; the cup under it welded into the plating; a bar across the cup'


def lashing_grid(at, nx, nz, dx, dz, heading=0.0, group='car', name=None, sunk=True):
    """Many lashing pots as few parts: nx rows across by nz along, dx and dz apart, the first at `at` (the deck under it, in
    the ship's axes), the rows running toward +x and +z of the grid's own heading. Returns what `build` returns; `cuts` has
    one round opening for each pot."""
    kit = Kit('lashing-pot', name or f'lashing-grid-{nx}x{nz}', group, f"Lashing pots {name or ''}".strip())
    for i in range(nx):
        for k in range(nz):
            _pot(kit, i * dx, k * dz, sunk)
    kit.known_by = 'Each pot: a top plate with a cloverleaf opening, painted yellow, 4 mm proud of the deck; the cup under it welded into the plating; a bar across the cup'
    return kit.place(at, heading)


@fitting('lashing-rack', size=(1.5, 0.35, 1.7), front='+z (out from the bulkhead)', title='Lashing rack',
         note='a rack of chain lashings on a bulkhead or a bulwark: origin on the deck at the wall\'s face (z = 0), the wall behind it')
def lashing_rack(kit, n=6, **_):
    """
    A rack on the bulkhead with the deck's chain lashings hung on it: a flat bar on two brackets bolted to the wall, a hook
    for each lashing; each lashing a length of long-link chain hung doubled over its hook, an elephant's foot on one end,
    a lever tensioner with its hook on the other; a stencilled notice over it.
    """
    paint, steel, galv, chn, mark = kit.p('paint'), kit.p('steel'), kit.p('galv'), kit.p('chain'), kit.p('mark')
    y, half = 1.50, 0.70
    paint.block((-half, y - 0.035, 0.06), (half, y + 0.035, 0.072), YELLOW, r=0.003)
    for x in (-half + 0.12, half - 0.12):                           # two brackets: a foot on the wall with two bolts, an arm out to the bar
        paint.block((x - 0.04, y - 0.10, 0.0), (x + 0.04, y + 0.10, 0.010), YELLOW, r=0.003)
        paint.block((x - 0.012, y - 0.03, 0.010), (x + 0.012, y + 0.03, 0.062), YELLOW, r=0.003)
        for dy in (-0.07, 0.07):
            bolt(steel, (x, y + dy, 0.010), FWD, 0.012)
    for k in range(n):
        x = -half + 0.14 + (2 * half - 0.28) * k / (n - 1)
        sweep(galv, [(x, y, 0.072), (x, y, 0.13), (x, y + 0.035, 0.155), (x, y + 0.075, 0.145)], 0.008, GALV)       # the hook
        d = 0.011
        long_end, short_end = 0.42 + 0.05 * (k % 3), 0.62 + 0.04 * ((k + 1) % 3)
        path = [(x - 0.022, long_end, 0.118), (x - 0.022, y - 0.02, 0.118), (x - 0.012, y + 0.014, 0.125), (x + 0.012, y + 0.014, 0.125), (x + 0.022, y - 0.02, 0.118), (x + 0.022, short_end, 0.118)]
        chain(chn, path, d, srgb(0x4b4f50), phase=0.01, stud=False, n_end=3, sides=8, across=FWD)
        # the elephant's foot on the long end: a shank and an oval foot that locks in a pot's cloverleaf
        steel.tube((x - 0.022, long_end, 0.118), (x - 0.022, long_end - 0.085, 0.118), 0.011, colour=STEEL)
        lathe(steel, (x - 0.022, long_end - 0.085, 0.118), (0, -1, 0), [(0.0, 0.011), (0.006, 0.030), (0.022, 0.034), (0.028, 0.022), (0.030, 0.0)], STEEL)
        # the tensioner on the short end: a lever with a hook at its foot
        paint.block((x + 0.012, short_end - 0.36, 0.110), (x + 0.032, short_end, 0.126), RED, r=0.004)
        sweep(steel, [(x + 0.022, short_end - 0.36, 0.118), (x + 0.022, short_end - 0.41, 0.118), (x + 0.046, short_end - 0.43, 0.118), (x + 0.058, short_end - 0.40, 0.118)], 0.007, STEEL)
    paint.block((-0.36, y + 0.16, 0.0), (0.36, y + 0.30, 0.004), WHITE, r=0.001)
    label(kit, mark, (0.0, y + 0.23, 0.004), PORT, UP, 0.72, 0.14, WHITE, ('LASHINGS 120 KN', 'RETURN AFTER USE'), ink=BLACK, proud=0.0015)
    kit.clear = ((-0.9, 0.0, 0.0), (0.9, 1.95, 0.6))
    kit.known_by = ('A flat bar on two brackets bolted to the wall; a hook for each lashing; each a long-link chain hung doubled, an elephant\'s foot '
                    'on one end, a lever tensioner with its hook on the other; a notice over it')


@fitting('trailer-trestle', size=(1.0, 0.8, 1.2), front='either', title='Trailer trestle',
         note='the horse an uncoupled semi-trailer\'s front stands on; origin under its middle; its saddle lies along x')
def trailer_trestle(kit, **_):
    """
    A trailer trestle: a saddle of channel with a wooden pad on four splayed legs of square tube, ties between the legs, a
    foot plate under each, a lashing eye each end, a handle; painted yellow.
    """
    paint, wood, galv = kit.p('paint'), kit.p('teak'), kit.p('galv')
    c = YELLOW
    h = 1.12
    paint.block((-0.45, h - 0.07, -0.13), (0.45, h, 0.13), c, r=0.006)                                                # the saddle
    wood.block((-0.43, h, -0.11), (0.43, h + 0.045, 0.11), tint(TEAK, 0.85), r=0.006)
    feet = []
    for sx in (-1, 1):
        for sz in (-1, 1):
            top, foot = (sx * 0.36, h - 0.06, sz * 0.09), (sx * 0.46, 0.012, sz * 0.36)
            bar(paint, foot, top, 0.06, 0.06, c, up=PORT)
            paint.block((foot[0] - 0.08, 0.0, foot[2] - 0.08), (foot[0] + 0.08, 0.012, foot[2] + 0.08), c, r=0.004)
            feet.append(foot)
        # a tie across each pair of legs, and one along each side
        f = 0.38
        a, b = Vector((sx * 0.46, 0.012, -0.36)), Vector((sx * 0.36, h - 0.06, -0.09))
        p0 = a + (b - a) * f
        paint.block((p0.x - 0.02, p0.y - 0.02, p0.z), (p0.x + 0.02, p0.y + 0.02, -p0.z), c, r=0.004)
        galv.ring((sx * 0.47, h - 0.035, 0.0), FWD, 0.035, 0.009, GALV)                                               # a lashing eye at each end
    for sz in (-1, 1):
        a, b = Vector((-0.46, 0.012, sz * 0.36)), Vector((-0.36, h - 0.06, sz * 0.09))
        p0 = a + (b - a) * 0.38
        paint.block((p0.x, p0.y - 0.02, p0.z - 0.02), (-p0.x, p0.y + 0.02, p0.z + 0.02), c, r=0.004)
    sweep(kit.p('steel'), [(-0.12, h - 0.07, 0.13), (-0.12, h - 0.10, 0.18), (0.12, h - 0.10, 0.18), (0.12, h - 0.07, 0.13)], 0.009, STEEL)   # its handle
    label(kit, kit.p('mark'), (0.0, h - 0.035, 0.13), PORT, UP, 0.30, 0.05, c, ('SWL 20 T',), ink=BLACK, proud=0.0012)
    kit.clear = ((-0.7, 0.0, -0.6), (0.7, 1.3, 0.6))
    kit.known_by = 'A saddle of channel with a wooden pad; four splayed legs of square tube on foot plates; ties; a lashing eye each end; a handle; its load lettered'


@fitting('wheel-chocks', size=(1.3, 0.4, 1.0), front='+z (out from the bulkhead)', title='Wheel chocks',
         note='six wheel chocks in a rack on a bulkhead: origin on the deck at the wall\'s face (z = 0), the wall behind it')
def wheel_chocks(kit, **_):
    """
    Wheel chocks in their stowage rack: two shelves of angle bar on brackets bolted to the wall, a keep bar along the front
    of each; on each shelf three chocks of black rubber, each a wedge with a ribbed face and a rope becket.
    """
    paint, steel, rubber, rope = kit.p('paint'), kit.p('steel'), kit.p('rubber'), kit.p('rope')
    half = 0.62
    for y in (0.30, 0.68):
        paint.block((-half, y - 0.012, 0.0), (half, y, 0.30), YELLOW, r=0.003)                                       # the shelf
        paint.block((-half, y, 0.288), (half, y + 0.06, 0.30), YELLOW, r=0.003)                                       # its keep bar
        for x in (-half + 0.03, half - 0.03):
            prism(paint, [(x - 0.006, y - 0.012, 0.004), (x - 0.006, y - 0.012, 0.28), (x - 0.006, y - 0.20, 0.004)], (0.012, 0, 0), YELLOW)
            paint.block((x - 0.03, y - 0.24, 0.0), (x + 0.03, y - 0.012, 0.004), YELLOW, r=0.001)
            bolt(steel, (x, y - 0.10, 0.004), FWD, 0.010)
            bolt(steel, (x + 0.018 * (1 if x < 0 else -1), y - 0.20, 0.004), FWD, 0.010)
        for k in range(3):
            x = -0.40 + 0.40 * k
            prism(rubber, [(x - 0.10, y, 0.03), (x - 0.10, y, 0.27), (x - 0.10, y + 0.17, 0.05), (x - 0.10, y + 0.17, 0.03)], (0.20, 0, 0), BLACK)
            for q in range(4):                                     # ribs on its sloping face
                f = 0.2 + 0.2 * q
                p0 = Vector((x, y + 0.17 * (1 - f) + 0.004, 0.05 + 0.22 * f + 0.003))
                bar(rubber, tuple(p0 - Vector((0.09, 0, 0))), tuple(p0 + Vector((0.09, 0, 0))), 0.016, 0.008, tint(BLACK, 1.6), up=(0, 0.79, 0.61))
            sweep(rope, [(x - 0.04, y + 0.17, 0.04), (x - 0.03, y + 0.24, 0.045), (x + 0.03, y + 0.24, 0.045), (x + 0.04, y + 0.17, 0.04)], 0.006, ORANGE, lay=3)
    kit.clear = ((-0.8, 0.0, 0.0), (0.8, 1.1, 0.7))
    kit.known_by = 'Two shelves of angle bar on brackets bolted to the wall, each with a keep bar; six wedges of black rubber with ribbed faces and rope beckets'
