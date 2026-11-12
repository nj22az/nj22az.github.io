"""
Her marks: draught marks forward, amidships and aft on both sides, the load line, her name on both bows, the line's name
along each side, and her name over her port of registry on the stern ramp, which is her stern door.

Every mark is laid on the plating it is painted on: each point of a letter is carried horizontally onto the shell, as
draught marks are set out (their height is the height they measure), so the lettering follows her shape.
"""
from math import pi, cos, sin
import lines as L
import spec as S
from shipyard import Part, srgb, lettering

LIFT = 0.004        # paint stands this far off the plating in the model, and is drawn a hair in front of it


def _on_shell(side, z, y):
    return (side * (L.hull_x(y, z) + LIFT), y, z)


def _write(part, text, height, side, z_middle, y_foot, colour, surface):
    """A line of lettering on one side of her, centred at z_middle, reading left to right as seen from outside."""
    pts, tris, width = lettering(text, height)
    # Seen from port the bow is to the left; seen from starboard, the stern.
    start = z_middle + side * width / 2
    base = len(part.v)
    for u, v in pts:
        part.vert(surface(side, start - side * u, y_foot + v))
    first = len(part.f)
    for a, b, c in tris:
        part.face((base + a, base + b, base + c), colour(y_foot) if callable(colour) else colour)
    part.orient(first, (side, 0, 0))


def _mark_colour(y):
    """White on the antifouling and on the hull's teal; dark on the white line between them."""
    return srgb(S.MARK_DARK) if S.BOOT - 0.02 <= y < S.BOOT + S.BOOT_LINE - 0.08 else srgb(S.MARK_LIGHT)


def _draught_label(dm):
    """Metric draught marks: 10 cm figures every 20 cm, the whole metres marked M."""
    return f'{dm // 10}M' if dm % 10 == 0 else str(dm % 10)


def _ring(part, side, zc, yc, r_out, r_in, count=48):
    first = len(part.f)
    for k in range(count):
        a0, a1 = 2 * pi * k / count, 2 * pi * (k + 1) / count
        quad = [part.vert(_on_shell(side, zc + r * cos(a), yc + r * sin(a))) for r, a in ((r_in, a0), (r_out, a0), (r_out, a1), (r_in, a1))]
        part.face(quad, srgb(S.MARK_LIGHT))
    part.orient(first, (side, 0, 0))


def _bar(part, side, z0, z1, y0, y1, surface=_on_shell, steps=6):
    first = len(part.f)
    for k in range(steps):
        za, zb = z0 + (z1 - z0) * k / steps, z0 + (z1 - z0) * (k + 1) / steps
        quad = [part.vert(surface(side, z, y)) for z, y in ((za, y0), (zb, y0), (zb, y1), (za, y1))]
        part.face(quad, srgb(S.MARK_LIGHT))
    part.orient(first, (side, 0, 0))


def build():
    marks = Part('Draught marks and load line', 'Marking')
    name = Part('Name', 'Marking')
    # Her name on the stern ramp's plating: it goes with the ramp when that lowers, and is drawn with the main deck, as the ramp is.
    stern = Part('Name on the stern ramp', 'Marking', mover=S.STERN_RAMP['id'])
    stern.group = 'main'
    white = srgb(S.LETTERING)

    for side in (1, -1):
        # ---- Draught marks: the foot of each figure stands at the draught it names, in decimetres above the keel.
        for station in S.DRAUGHT_MARKS:
            z = L.Z(station['yard'])
            dm = round(station['lowest'] * 10)
            while dm <= round(S.DRAUGHT_TOP * 10):
                # A figure is painted where the plating stands up enough to carry one: not under the turn of the bilge.
                y = L.Y(dm / 10)
                steep = L.topside_normal(z)[0] if y >= L.MAIN - 0.05 else L.shell_normal(z, L.psi_at(y + 0.05, z))[0]
                if y > L.keel_y(z) + 0.02 and steep > 0.6:
                    _write(marks, _draught_label(dm), 0.10, side, z, y, _mark_colour, _on_shell)
                dm += 2
        # ---- The load line: a 300 mm ring with a line through its middle at the laden waterline, and the deck line
        # over it at the level of the main deck.
        z = L.Z(S.LOAD_LINE_YARD)
        _ring(marks, side, z, 0.0, 0.150, 0.125)
        _bar(marks, side, z - 0.225, z + 0.225, -0.025, 0.0)
        _bar(marks, side, z - 0.150, z + 0.150, L.MAIN - 0.025, L.MAIN)
        # ---- Her name on the bow, under the forecastle's rail.
        zc = L.Z(S.NAME_YARD)
        _write(name, S.NAME, 0.95, side, zc, L.UPPER - 1.9, white, _on_shell)
        # ---- The line's name along her side (the owner, 11 November 2026: "make the shipping company sign Johansson Lines", then: "Johansson Line not lines by the way").
        _write(name, S.LINE, 2.4, side, L.Z(S.LINE_YARD), L.MAIN + 2.1, white, _on_shell)

    # ---- Her name and port of registry on the stern ramp's outer face.
    z = -L.HALF + S.STERN_RAMP['thick'][0] - LIFT
    for text, height, y_foot in ((S.NAME, 0.70, 4.3), (S.PORT_OF_REGISTRY, 0.42, 3.4)):
        pts, tris, width = lettering(text, height)
        base = len(stern.v)
        for u, v in pts:
            stern.vert((width / 2 - u, y_foot + v, z))
        first = len(stern.f)
        for a, b, c in tris:
            stern.face((base + a, base + b, base + c), white)
        stern.orient(first, (0, 0, -1))
    return [marks, name, stern]
