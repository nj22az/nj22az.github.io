"""
Her maker's marks in steel: the studio's name and its four signs, laid inside her plating where no eye comes.

The owner, 12 November 2026: "I need you to water mark, models, with my logo and these icons, incase someone just steals
them, these are invisible watermarks, one shouldnt be able to download the 3d models, its just a demo".

Each mark is a flat stamp, JOHANSSON ANIMATION STUDIOS with a ship, a gear, a lightning bolt and a film camera, the
owner's name and the year, drawn as plain shapes and laid in the middle of a plate's thickness or inside a closed box:
in the transom's plating beside the stern door, in her side amidships, in the main deck, in the upper deck, and inside
the stern ramp's box girder (it goes with the ramp). The page never draws them (their look is `hidden`: app.js leaves
such a mesh out), so nothing of them is seen aboard, in the X-ray or with her decks lifted apart; but they are in the
file, and whoever takes the model out of the file and opens it up finds whose it is.

They are the second of three marks. The first is in the numbers themselves (mark.py: a keyed bit in every corner's place,
which survives the stamps being found and cut out); the third is the notice in the file's header (assemble.py: `rights`).

The four signs are drawn here from plain measures, after the studio's own; the studio's mascot is not drawn (its artwork
is not in this repository).

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
from math import cos, pi, sin
import lines as L
import spec as S
from shipyard import Part, srgb, lettering

INK = srgb(0x0b2a5b)             # the studio's navy
NAME, SUB, OWNER = 'JOHANSSON', 'ANIMATION STUDIOS', '(c) 2026 NILS JOHANSSON  -  CHISUM  -  NOT FOR DOWNLOAD OR REUSE'


def _ship():
    hull = [(0.02, 0.26), (1.00, 0.26), (0.86, 0.04), (0.14, 0.04)]
    house = [(0.26, 0.29), (0.72, 0.29), (0.72, 0.44), (0.26, 0.44)]
    bridge = [(0.36, 0.47), (0.62, 0.47), (0.62, 0.59), (0.36, 0.59)]
    mast = [(0.47, 0.62), (0.52, 0.62), (0.52, 0.82), (0.47, 0.82)]
    yard = [(0.40, 0.70), (0.59, 0.70), (0.59, 0.74), (0.40, 0.74)]
    return [(hull, ()), (house, ()), (bridge, ()), (mast, ()), (yard, ())]


def _gear(teeth=8, outer=0.48, root=0.36, hole=0.15):
    pts = []
    for k in range(teeth):
        a = 2 * pi * k / teeth
        w = pi / teeth
        for da, r in ((-0.62 * w, root), (-0.38 * w, outer), (0.38 * w, outer), (0.62 * w, root)):
            pts.append((0.5 + r * cos(a + da), 0.5 + r * sin(a + da)))
    ring = [(0.5 + hole * cos(2 * pi * k / 20), 0.5 + hole * sin(2 * pi * k / 20)) for k in range(20)]
    return [(pts, (ring,))]


def _bolt():
    return [([(0.56, 1.00), (0.16, 0.46), (0.46, 0.46), (0.30, 0.00), (0.86, 0.60), (0.53, 0.60), (0.76, 1.00)], ())]


def _camera():
    disc = lambda cx, cy, r: [(cx + r * cos(2 * pi * k / 20), cy + r * sin(2 * pi * k / 20)) for k in range(20)]
    body = [(0.14, 0.30), (0.70, 0.30), (0.70, 0.62), (0.14, 0.62)]
    lens = [(0.73, 0.40), (0.97, 0.28), (0.97, 0.66), (0.73, 0.54)]
    leg1 = [(0.36, 0.27), (0.44, 0.27), (0.28, 0.00), (0.20, 0.00)]
    leg2 = [(0.46, 0.27), (0.54, 0.27), (0.68, 0.00), (0.60, 0.00)]
    return [(body, ()), (lens, ()), (leg1, ()), (leg2, ()), (disc(0.28, 0.80, 0.15), ()), (disc(0.57, 0.78, 0.12), ())]


SIGNS = (_ship, _gear, _bolt, _camera)


def stamp(part, origin, right, up, width):
    """The whole mark as flat shapes in a plane: `origin` its lower left corner, `right` and `up` the plane's two directions
    (unit vectors, the ship's axes), `width` how wide it is in metres."""
    k = width / 6.0                                       # the mark is drawn 6 units wide and about 2.3 high
    at = lambda u, v: tuple(origin[i] + right[i] * u * k + up[i] * v * k for i in range(3))
    normal = (right[1] * up[2] - right[2] * up[1], right[2] * up[0] - right[0] * up[2], right[0] * up[1] - right[1] * up[0])
    first = len(part.f)

    def words(text, height, u0, v0):
        pts, tris, wide = lettering(text, height * k)
        base = len(part.v)
        for u, v in pts:
            part.vert(tuple(origin[i] + right[i] * (u0 * k + u) + up[i] * (v0 * k + v) for i in range(3)))
        for a, b, c in tris:
            part.face((base + a, base + b, base + c), INK)
        return wide / k

    words(NAME, 0.78, 0.0, 1.40)
    words(SUB, 0.30, 0.02, 0.95)
    words(OWNER, 0.10, 0.02, 0.0)
    for n, sign in enumerate(SIGNS):                      # the four signs in a row under the name
        for outline, holes in sign():
            part.polygon([at(0.05 + n * 0.82 + u * 0.66, 0.20 + v * 0.66) for u, v in outline], INK,
                         holes=[[at(0.05 + n * 0.82 + u * 0.66, 0.20 + v * 0.66) for u, v in h] for h in holes])
    part.orient(first, normal)


def build():
    marks = Part("Maker's marks", 'Maker mark')
    marks.group = 'hull'
    half = L.half_breadth(L.Z(60.0)) - S.SHELL / 2
    # in her side amidships, each side: in the middle of the plating's thickness, over the waterline
    for side in (1, -1):
        stamp(marks, (side * half, 1.2, L.Z(57.0 if side > 0 else 63.0)), (0, 0, side), (0, 1, 0), 6.0)
    # in the transom's plating, to starboard of the stern door
    stamp(marks, (-5.2, S.MAIN_DECK + 2.6, -L.HALF + S.SHELL / 2), (-1, 0, 0), (0, 1, 0), 3.6)
    # in the main deck and in the upper deck, in the middle of each plate
    deck = Part("Maker's marks, decks", 'Maker mark')
    deck.group = 'main'
    stamp(deck, (2.0, S.MAIN_DECK - 0.006, L.Z(72.0)), (-1, 0, 0), (0, 0, 1), 4.0)
    upper = Part("Maker's marks, upper deck", 'Maker mark')
    upper.group = 'upper'
    stamp(upper, (2.0, S.UPPER_DECK - 0.006, L.Z(40.0)), (-1, 0, 0), (0, 0, 1), 4.0)
    # inside the stern ramp's box girder, in the middle of its depth: it goes with the ramp
    R = S.STERN_RAMP
    ramp = Part("Maker's marks, stern ramp", 'Maker mark', mover=R['id'])
    ramp.group = 'main'
    stamp(ramp, (3.0, S.MAIN_DECK + 2.0, -L.HALF + (R['thick'][0] + R['thick'][1]) / 2), (-1, 0, 0), (0, 1, 0), 6.0)
    return [marks, deck, upper, ramp]
