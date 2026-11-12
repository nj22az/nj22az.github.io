"""
Deck fittings: the mooring and anchoring gear (fittings.py is the door; fittings_kit.py the tools).

Sizes are real sizes: [R] the yard's reference files, [M] a maker's sheet or a standard as recalled (not read tonight),
[Y] the yard's own estimate.
"""
from math import pi, sin, cos, tan, atan2, radians, degrees, hypot, sqrt
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403  (the tools and the yard's tins of paint)
from fittings_kit import fitting


@fitting('bitts', size=(1.25, 0.48, 0.60), front='either', note='double bollard; its two posts stand in a line along z; origin under the middle of its bedplate')
def bitts(kit, nominal=0.324, **_):
    """
    A pair of bitts (a double bollard), welded: two tube posts on a bedplate, each closed by a head plate with a lip that
    keeps a rope's turns from riding up, four brackets at each post's foot, and a fillet of weld round the bedplate where it
    is welded to the deck. Painted black; the head and a band under it yellow, as the owner's photograph of a ro-ro ship's
    after deck shows them (reference E6).

    Sizes [M]: DIN 82607 double bollard, nominal size 315 as recalled: post 324 mm, 510 mm high, 800 mm between centres,
    bedplate 1250 x 480 mm. For a ship of 125 m with ropes of 56 to 64 mm.
    """
    k = nominal / 0.324
    cast = kit.p('cast')
    L, B, t = 1.25 * k, 0.48 * k, 0.030 * k
    r, h, c = nominal / 2, 0.51 * k, 0.40 * k
    # the bedplate, and the weld that holds it to the deck: a fillet all round its foot
    cast.block((-B / 2, 0.0, -L / 2), (B / 2, t, L / 2), BLACK, r=0.006)
    w = 0.010
    for (x0, x1, z0, z1) in ((-B / 2 - w, -B / 2 + 0.004, -L / 2 + 0.01, L / 2 - 0.01), (B / 2 - 0.004, B / 2 + w, -L / 2 + 0.01, L / 2 - 0.01),
                             (-B / 2 + 0.01, B / 2 - 0.01, -L / 2 - w, -L / 2 + 0.004), (-B / 2 + 0.01, B / 2 - 0.01, L / 2 - 0.004, L / 2 + w)):
        kit.p('steel').block((x0, 0.0, z0), (x1, 0.009, z1), tint(STEEL, 0.75), r=0.004)
    for s in (-1, 1):
        o = (0.0, t, s * c)
        band = lambda i: YELLOW if i in (2, 4, 5, 6, 7) else BLACK
        lathe(cast, o, UP, [(0.0, r + 0.014), (0.016, r), (h - 0.185, r), (h - 0.105, r), (h - 0.060, r),
                            (h - 0.045, r + 0.032), (h - 0.012, r + 0.032), (h, r + 0.018), (h + 0.012, 0.0)], band, caps=(False, False))
        for q in range(4):                                         # four brackets at each post's foot
            a = pi / 4 + q * pi / 2
            d = Vector((cos(a), 0.0, sin(a)))
            gusset(cast, Vector(o) + d * (r - 0.004), tuple(d), UP, 0.07 * k, 0.13 * k, 0.014, BLACK)
    kit.clear = ((-B / 2 - 0.35, 0.0, -L / 2 - 0.35), (B / 2 + 0.35, h + 0.25, L / 2 + 0.35))
    kit.known_by = ('Bedplate with its fillet weld to the deck; two tube posts; at each a weld collar, four foot brackets, a head '
                    'plate with a rope lip; black, the head and one band yellow')
