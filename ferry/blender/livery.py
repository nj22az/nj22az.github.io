"""
The line's mark: Johansson Line (the owner, the same day: "Johansson Line not lines by the way").

The owner, 11 November 2026: "we need to make the shipping company sign Johansson Lines and a big J similar to Jonsson
lines ships but my own thing", and of the page's icon: "The Johansson emblem with the J needs to be aligned and pushed
on the chimneys". The mark is her own: a white J in a white ring on the funnels' teal (its shape is emblem.py's, which
also draws the page's icon from it). It is painted on the outboard and the inboard face of each funnel.

The funnels are still the other ship's: a sixteen-sided casing 1.0 m by 2.0 m at its foot, tapering to 0.88 of that at
its top, with a ridge down the middle of each side. The mark is laid on the two facets either side of that ridge and is
cut along it, so that it lies on the plating and not through it.
"""
from math import cos, sin, pi, radians, hypot
import lines as L
from shipyard import Part, srgb
import emblem

FUNNELS = ((1, 'port'), (-1, 'starboard'))
XC, YARD, A, B = 3.35, 4.90, 0.50, 1.00       # a funnel's middle off the centreline and from the transom; its half breadth and half length at the foot
FOOT, TOP, TAPER = 6.50, 11.10, 0.88
MARK = dict(y=9.55, off=0.004)                # the height of the mark's middle; how far it lies off the plating
WHITE = srgb(0xf4f4f0)


def _scale(y):
    return 1.0 - (1.0 - TAPER) * (y - FOOT) / (TOP - FOOT)


def _on_funnel(side, face, u, v):
    """A point of the mark on a funnel: `face` +1 its outboard side, -1 its inboard; u to the right as it is read, v up."""
    n = side * face                                              # the way the face looks, along x
    xc, zc = side * XC, L.Z(YARD)
    y = MARK['y'] + v
    s = _scale(y)
    p0 = (xc + n * A * s, zc)
    way = (1 if u >= 0 else -1) * -n                             # read from outside, right is aft on a face that looks to port
    p1 = (xc + n * A * s * cos(radians(22.5)), zc + way * B * s * sin(radians(22.5)))
    dx, dz = p1[0] - p0[0], p1[1] - p0[1]
    length = hypot(dx, dz)
    t = abs(u) / length
    nx, nz = dz / length, -dx / length                           # square to the facet, outward
    if nx * n < 0:
        nx, nz = -nx, -nz
    if abs(u) < 1e-9:
        # on the ridge the two facets' pieces share one point, as far off both as the rest is
        return (p0[0] + n * MARK['off'] / abs(nx), y, p0[1])
    return (p0[0] + dx * t + nx * MARK['off'], y, p0[1] + dz * t + nz * MARK['off'])


def _split(poly):
    """A polygon in (u, v) cut along the ridge u = 0: the piece on each side."""
    out = []
    for keep in (1, -1):
        piece = []
        for i, p in enumerate(poly):
            q = poly[(i + 1) % len(poly)]
            fp, fq = p[0] * keep, q[0] * keep
            if fp >= 0:
                piece.append(p)
            if (fp > 0 and fq < 0) or (fp < 0 and fq > 0):
                t = fp / (fp - fq)
                piece.append((0.0, p[1] + (q[1] - p[1]) * t))
        if len(piece) >= 3:
            out.append((keep, piece))
    return out


def build():
    out = []
    shape = emblem.mark()
    for side, name in FUNNELS:
        part = Part(f'Funnel emblem, {name}', 'Marking')
        part.group = 'passenger'
        for face in (1, -1):
            first = len(part.f)
            for quad in shape:
                for keep, piece in _split(list(quad)):
                    base = [part.vert(_on_funnel(side, face, u, v)) for u, v in piece]
                    for k in range(1, len(base) - 1):
                        part.face((base[0], base[k], base[k + 1]), WHITE)
            part.orient(first, (side * face, 0, 0))
        out.append(part)
    return out
