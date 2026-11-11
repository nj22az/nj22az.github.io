"""
The line's mark: Johansson Line (the owner, the same day: "Johansson Line not lines by the way").

The owner, 11 November 2026: "we need to make the shipping company sign Johansson Lines and a big J similar to Jonsson
lines ships but my own thing", and of the page's icon: "The Johansson emblem with the J needs to be aligned and pushed
on the chimneys". The mark is her own: a white J in a white ring on the funnels' teal (its shape is emblem.py's, which
also draws the page's icon from it). It is painted on the outboard and the inboard face of each funnel.

Her funnels are her own (steel.py: FUNNEL): each side is a flat plate, upright, so the mark lies on it as it is drawn,
four times the size it had on the first Chisum's funnels: the ring is 2.5 m across.
"""
from math import cos, sin, pi
import lines as L
from shipyard import Part, srgb
import emblem
import steel

FUNNELS = ((1, 'port'), (-1, 'starboard'))
F = steel.FUNNEL
SCALE = 4.0
MARK = dict(yard=(F['yard'][0] + F['yard'][1]) / 2 - 0.1, y=F['foot'] + 4.6, off=0.004)      # the mark's middle; how far it lies off the plating
WHITE = srgb(0xf4f4f0)


def _on_funnel(side, face, u, v):
    """A point of the mark on a funnel: `face` +1 its outboard side, -1 its inboard; u to the right as it is read, v up."""
    n = side * face                                              # the way the face looks, along x
    x = side * (F['x'][1] if face > 0 else F['x'][0]) + n * MARK['off']
    return (x, MARK['y'] + v * SCALE, L.Z(MARK['yard']) - n * u * SCALE)      # read from outside, right is aft on a face that looks to port


def build():
    out = []
    shape = emblem.mark()
    for side, name in FUNNELS:
        part = Part(f'Funnel emblem, {name}', 'Marking')
        part.group = 'bridge'
        for face in (1, -1):
            first = len(part.f)
            for quad in shape:
                part.face([part.vert(_on_funnel(side, face, u, v)) for u, v in quad], WHITE)
            part.orient(first, (side * face, 0, 0))
        out.append(part)
    return out
