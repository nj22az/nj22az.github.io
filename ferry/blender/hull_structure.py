"""
What holds her shape: frames at every 0.5 m, plate floors under them, the double bottom's girders, the watertight
bulkheads the hull carries herself, and the tank top.

The machinery spaces between frames 17 and 52 are still the Minato Maru's rooms (Rev C sheet C3), with their own
linings 14 cm inside the moulded line and their own end walls: the structure here keeps clear of them, so a frame is a
75 mm angle and the bulkheads at frames 17 and 52 stand 8 cm outside those walls.

Plates are drawn as one surface seen from both sides ('Primer plate').
"""
from math import pi, cos, sin
import lines as L
import spec as S
from shipyard import Part, srgb, tint

PRIMER = srgb(S.PRIMER)
TOP_OF_STRUCTURE = L.CAR - 0.03          # just under the car deck's plating
TUNNEL = (L.Z(S.THRUSTER['yard']), S.THRUSTER['y'], S.THRUSTER['radius'])


def _in_tunnel(z):
    return abs(z - TUNNEL[0]) < TUNNEL[2] + 0.04


def _bulkhead_frames():
    return {round(b['yard'] * 2) for b in S.BULKHEADS}


def floor_top(yard):
    """The top edge of the floor at a frame: the tank top over the double bottom, a shallow floor in the ends."""
    z = L.Z(yard)
    if S.DOUBLE_BOTTOM[0] - 1e-6 <= yard <= S.DOUBLE_BOTTOM[1] + 1e-6:
        return S.TANK_TOP
    # Aft, 0.20 m: low enough for the flat of the steering-gear room to lie over them with standing room under the deck.
    return L.keel_y(z) + (0.20 if yard < S.DOUBLE_BOTTOM[0] else 0.45)


def _section_outline(z, y_top, count=14, depth=S.SHELL):
    """The inside of the shell at z from the port side at y_top, round under the keel, to starboard at y_top."""
    top = L.psi_at(min(y_top, L.deck_edge(z) - 1e-4), z)
    port = [L.inside_plane(z, p, depth) for p in L.girth_psis(z, count, 0.0, top)]
    port[0] = (0.0, port[0][1])
    return [(x, y) for x, y in reversed(port)] + [(-x, y) for x, y in port[1:]]


def _breadth_inside(z, y, depth=S.SHELL):
    """The half-breadth, at height y, of a level plate that stops `depth` short of the moulded shell square to it."""
    n = L.shell_normal(z, L.psi_at(y, z))
    across = n[0] / ((n[0] ** 2 + n[1] ** 2) ** 0.5 or 1.0)
    return L.hull_x(y, z) - depth / max(across, 0.25)


def _oval(xc, yc, a, b, z, count=14):
    return [(xc + a * cos(2 * pi * k / count), yc + b * sin(2 * pi * k / count), z) for k in range(count)]


def build():
    frames = Part('Frames', 'Primer plate')
    floors = Part('Floors', 'Primer plate')
    girders = Part('Double-bottom girders', 'Primer plate')
    bulkheads = Part('Watertight bulkheads', 'Primer plate')
    stringers = Part('Fore-peak stringers', 'Primer plate')
    tank_top = Part('Tank top', 'Primer plate')
    tank_top.group = 'machinery'
    skip = _bulkhead_frames()
    floor_colour, frame_colour = tint(PRIMER, 0.97), PRIMER

    for k in range(1, 69):
        yard, z = k * L.FRAME_SPACING, L.Z(k * L.FRAME_SPACING)
        if k in skip:
            continue
        y_floor = floor_top(yard)
        in_db = S.DOUBLE_BOTTOM[0] - 1e-6 <= yard <= S.DOUBLE_BOTTOM[1] + 1e-6
        depth = y_floor - L.keel_y(z)
        toward = -1 if z > 0 else 1                 # flanges and face bars turn toward amidships, where she is fuller
        # Round the thruster tunnel the plating is fitted to the opening in larger pieces and keeps less closely to her
        # lines: the floors and frames beside the tunnel stand a further 12 mm off it.
        skin = S.SHELL + (0.012 if abs(z - TUNNEL[0]) < 0.8 else 0.0)
        # ---- The floor: a plate across her bottom, with lightening holes where the double bottom is deep enough.
        if depth > 0.12 and not _in_tunnel(z):
            outline = [(x, y, z) for x, y in _section_outline(z, y_floor, depth=skin)]
            holes = []
            if in_db and depth > 0.55 and not any(abs(yard - t) < 1e-6 for t in S.TIGHT_FLOORS):
                yc = (y_floor + L.keel_y(z)) / 2 + 0.01
                for xc in (0.775, 2.275):
                    holes += [_oval(xc, yc, 0.27, 0.16, z), _oval(-xc, yc, 0.27, 0.16, z)]
            floors.polygon(outline, floor_colour, holes)
            if not in_db:
                # A face bar along the top of a floor that carries no tank top: on the floor's own top edge, which lies
                # a little above y_floor (the floor stands 12 mm inside the plating at its ends).
                (x0, yb, _), x1 = outline[0], outline[-1][0]
                floors.grid([[(x0, yb, z), (x1, yb, z)], [(x0, yb, z + toward * 0.06), (x1, yb, z + toward * 0.06)]], floor_colour)
        # ---- The side frames: an angle bar up each side from the floor to the deck.
        foot = max(y_floor, L.keel_y(z) + 0.12)
        if _in_tunnel(z):
            # Over the tunnel the frame begins above the plating that was fitted round the opening.
            foot = TUNNEL[1] + TUNNEL[2] + 0.4
        head = min(TOP_OF_STRUCTURE, L.deck_edge(z) - 0.01)
        if head - foot > 0.3:
            psis = L.girth_psis(z, 14, L.psi_at(foot, z), L.psi_at(head, z))
            for side in (1, -1):
                outer = [L.inside_plane(z, p, skin) for p in psis]
                inner = [L.inside_plane(z, p, skin + S.FRAME_WEB) for p in psis]
                frames.grid([[(side * x, y, z) for x, y in outer], [(side * x, y, z) for x, y in inner]], frame_colour)
                frames.grid([[(side * x, y, z) for x, y in inner], [(side * x, y, z + toward * S.FRAME_FLANGE) for x, y in inner]], frame_colour)

    # ---- Girders in the double bottom: the centre girder and, each side, one under the main engine and one outboard.
    yards = [S.DOUBLE_BOTTOM[0] + 0.25 * i for i in range(int((S.DOUBLE_BOTTOM[1] - S.DOUBLE_BOTTOM[0]) / 0.25) + 1)]
    girder_colour = tint(PRIMER, 0.94)
    for x in (0.0,) + tuple(S.GIRDERS) + tuple(-g for g in S.GIRDERS):
        lower, upper = [], []
        for yard in yards:
            z = L.Z(yard)
            y = (L.keel_y(z) if x == 0 else L.hull_y(x, z)) + S.SHELL
            if y > S.TANK_TOP - 0.06:
                continue
            lower.append((x, y, z))
            upper.append((x, S.TANK_TOP, z))
        if len(lower) > 1:
            girders.grid([lower, upper], girder_colour)

    # ---- Watertight bulkheads, each stiffened on one face with angle bars 0.6 m apart.
    bulkhead_colour = tint(PRIMER, 1.03)
    for b in S.BULKHEADS:
        z = L.Z(b['yard'])
        outline = _section_outline(z, TOP_OF_STRUCTURE, count=22)
        trunk = b.get('trunk')
        if trunk:
            # The engine room's ladder trunk comes down through this bulkhead's place on the port side: open for it.
            tx, ty = trunk
            outline = [(tx, outline[0][1]), (tx, ty)] + [p for p in outline if not (p[0] > tx and p[1] > ty)]
            edge = L.inside_plane(z, L.psi_at(ty, z), S.SHELL)
            outline.insert(2, (edge[0], ty))
        bulkheads.polygon([(x, y, z) for x, y in outline], bulkhead_colour)
        toward = -1 if z > 0 else 1
        x = -3.6
        while x < 3.61:
            y_low = L.hull_y(x, z)
            y_high = TOP_OF_STRUCTURE if not (trunk and x > trunk[0] - 0.05) else trunk[1]
            y_far = L.hull_y(x, z + toward * 0.075)
            if y_low is not None and y_far is not None and y_high - y_low > 0.4 and abs(x) > 0.05:
                y_low = max(y_low, y_far) + S.SHELL + 0.03
                web = [[(x, y_low, z), (x, y_high, z)], [(x, y_low, z + toward * 0.075), (x, y_high, z + toward * 0.075)]]
                bulkheads.grid(web, bulkhead_colour)
                bulkheads.grid([web[1], [(x + 0.05, y_low, z + toward * 0.075), (x + 0.05, y_high, z + toward * 0.075)]], bulkhead_colour)
            x += 0.6

    # ---- Two panting stringers in the fore peak, where the sea strikes her.
    for y in (-0.55, 0.65):
        for side in (1, -1):
            outer, inner = [], []
            for i in range(int((L.HALF - 0.05 - L.Z(30.5)) / 0.25) + 1):
                z = L.Z(30.5) + 0.25 * i
                if y < L.keel_y(z) + 0.3:
                    continue
                x = _breadth_inside(z, y, S.SHELL + 0.006)
                outer.append((side * x, y, z))
                inner.append((side * (x - 0.28), y, z))
            if len(outer) > 1:
                stringers.grid([outer, inner], frame_colour)

    # ---- The tank top forward of the engine room (the engine room's own is the Minato Maru's until that section).
    red = srgb(S.BILGE_RED)
    rows = []
    for i in range(int((26.0 - 14.0) / 0.5) + 1):
        z = L.Z(14.0 + 0.5 * i)
        x = _breadth_inside(z, S.TANK_TOP)
        rows.append([(x, S.TANK_TOP, z), (0.0, S.TANK_TOP, z), (-x, S.TANK_TOP, z)])
    tank_top.grid(rows, red)
    tank_top.orient(0, (0, 1, 0))
    return [frames, floors, girders, bulkheads, stringers, tank_top]
