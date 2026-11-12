"""
What holds her shape below the main deck and in her sides: frames at every 0.6 m with a web frame at every third, plate
floors under them, the double bottom's girders, the seven watertight bulkheads of the general arrangement with their
stiffeners, the longitudinal bulkheads of the tanks and of the lower hold, the tank top, and the frames of the topsides
between the main deck and the upper deck (a web frame at every sixth, as a ro-ro ship's side has them: Eyres and Bruce,
chapter 17).

Plates are drawn as one surface seen from both sides ('Primer plate').
"""
from math import pi, cos, sin
import lines as L
import spec as S
from shipyard import Part, srgb, tint, round_rect

PRIMER = srgb(S.PRIMER)
TOP_OF_STRUCTURE = L.MAIN - 0.012        # the underside of the main deck's plating (steel.PLATE), which her frames and bulkheads are welded to
TUNNEL = (L.Z(S.THRUSTER['yard']), S.THRUSTER['y'], S.THRUSTER['radius'])
UNDER = 0.003                            # how far a floor or a girder ends under the plating it carries
LAST_FRAME = int((L.STEM_AT_MAIN - 0.3) / L.FRAME_SPACING)         # the last frame of the lower body
TOPSIDE_WEB_EVERY = 6                    # a web frame in the topsides at every sixth frame
TOPSIDE_WEB = 0.45


def _in_tunnel(z):
    return abs(z - TUNNEL[0]) < TUNNEL[2] + 0.04


def _bulkhead_frames():
    return {b['frame'] for b in S.BULKHEADS}


def in_double_bottom(yard):
    return S.DOUBLE_BOTTOM[0] - 1e-6 <= yard <= S.DOUBLE_BOTTOM[1] + 1e-6


def floor_top(yard):
    """The top edge of the floor at a frame: the tank top over the double bottom, a shallow floor in the ends."""
    z = L.Z(yard)
    if in_double_bottom(yard):
        return S.TANK_TOP
    # Aft: 0.20 m under the steering flat (which lies low over them, for standing room under the deck), deepening to
    # 0.60 m under the engine room platform, where the shafts leave her.
    if yard < S.DOUBLE_BOTTOM[0]:
        return L.keel_y(z) + (0.20 if yard < S.fr(12) else 0.20 + 0.40 * min(1.0, (yard - S.fr(12)) / (S.fr(28) - S.fr(12))))
    return L.keel_y(z) + 0.50


def _section_outline(z, y_top, count=16, depth=S.SHELL):
    """The inside of the shell at z from the port side at y_top, round under the keel, to starboard at y_top."""
    top = L.psi_at(min(y_top, L.deck_edge(z) - 1e-4), z)
    # Nothing lies lower than the keel plate's inner face: forward, where her section stands upright from the keel plate's
    # edge, a point set in from the side would else lie on the keel plate itself.
    low = L.keel_y(z) + depth
    port = [(x, max(y, low)) for x, y in (L.inside_plane(z, p, depth) for p in L.girth_psis(z, count, 0.0, top))]
    port[0] = (0.0, low)
    return [(x, y) for x, y in reversed(port)] + [(-x, y) for x, y in port[1:]]


def _breadth_inside(z, y, depth=S.SHELL):
    """The half-breadth, at height y, of a level plate that stops `depth` short of the moulded shell square to it."""
    n = L.shell_normal(z, L.psi_at(y, z))
    across = n[0] / ((n[0] ** 2 + n[1] ** 2) ** 0.5 or 1.0)
    return L.main_x(y, z) - depth / max(across, 0.25)        # (of the hull without her bulb: her structure stands in the lower body)


def _oval(xc, yc, a, b, z, count=14):
    return [(xc + a * cos(2 * pi * k / count), yc + b * sin(2 * pi * k / count), z) for k in range(count)]


def _side_frames(frames, z, yard, y_floor, skin, toward, colour, web):
    """An angle bar up each side from the floor to the deck at the station z: a web `web` deep and a flange along her length."""
    foot = max(y_floor, L.keel_y(z) + 0.12)
    if _in_tunnel(z):
        # Over the tunnel the frame begins above the plating that was fitted round the opening.
        foot = TUNNEL[1] + TUNNEL[2] + 0.4
    head = min(TOP_OF_STRUCTURE, L.deck_edge(z) - 0.01)
    # Forward she is a narrow V low down: a frame begins where she is wide enough to hold it.
    foot = max(foot, L.section_psi(z, L.psi_at_x(web + 0.2, z))[1])
    if head - foot > 0.3 and L.half_breadth(z) > web + 0.25:
        psis = L.girth_psis(z, 14, L.psi_at(foot, z), L.psi_at(head, z))
        for side in (1, -1):
            outer = [L.inside_plane(z, p, skin) for p in psis]
            # (where she flares, a point set in square to the plating lies higher than the plating's own: not above the frame's head)
            inner = [(x, min(y, head)) for x, y in (L.inside_plane(z, p, skin + web) for p in psis)]
            frames.grid([[(side * x, y, z) for x, y in outer], [(side * x, y, z) for x, y in inner]], colour)
            frames.grid([[(side * x, y, z) for x, y in inner], [(side * x, y, z + toward * S.FRAME_FLANGE) for x, y in inner]], colour)


def frame_reach(z):
    """How far off the centreline the inner edge of a frame stands in the depth of a deck beam under the car deck: where a
    beam ends. Forward, where she flares, a frame's inner edge leans inboard as it rises: the least of it in that depth."""
    head = min(TOP_OF_STRUCTURE, L.deck_edge(z) - 0.01)
    low = head - S.DECK_BEAM - 0.06
    best = None
    for i in range(41):
        psi = L.psi_at(head, z) * (0.55 + 0.45 * i / 40)
        x, y = L.inside_plane(z, psi, S.SHELL + 0.012 + S.WEB_FRAME)
        if y >= low and (best is None or x < best):
            best = x
    return best if best is not None else L.inside_plane(z, L.psi_at(head, z), S.SHELL + 0.012 + S.WEB_FRAME)[0]


def topside_web(yard):
    """How deep the frame of the topsides at `yard` is: a web frame at every sixth frame."""
    k = int(round(yard / L.FRAME_SPACING))
    return TOPSIDE_WEB if abs(k * L.FRAME_SPACING - yard) < 1e-6 and k % TOPSIDE_WEB_EVERY == 0 else S.TOPSIDE_FRAME


def topside_frame_reach(z, depth=None):
    """The same of a frame of the topsides, under the upper deck: at the foot of the beam's depth, where she is narrower."""
    n = L.topside_normal(z)
    across = max(0.3, (n[0] ** 2 + n[1] ** 2) ** 0.5)
    return L.topside_x(L.deck_y(z) - (depth or S.DECK_BEAM) - 0.06, z) - (S.SHELL + 0.002 + topside_web(L.yard(z))) / across


def topside_frame_spans(yard):
    """Where a frame of the topsides stands at `yard`, as heights: the whole height, or what an opening in the shell leaves of it."""
    lo, hi = L.MAIN + 0.012, L.deck_y(L.Z(yard)) - 0.03
    for o in (S.MOORING_PORT, S.PILOT_DOOR):
        if o['yard'][0] - 0.05 < yard < o['yard'][1] + 0.05:
            return [(a, b) for a, b in ((lo, o['y'][0] - 0.02), (o['y'][1] + 0.02, hi)) if b - a > 0.15]
    return [(lo, hi)]


def build():
    frames = Part('Frames', 'Primer plate')
    floors = Part('Floors', 'Primer plate')
    girders = Part('Double-bottom girders', 'Primer plate')
    bulkheads = Part('Watertight bulkheads', 'Primer plate')
    tanks = Part('Tank bulkheads', 'Primer plate')
    stringers = Part('Fore-peak stringers', 'Primer plate')
    topside = Part('Topside frames', 'Primer plate')
    tank_top = Part('Tank top', 'Primer plate')
    tank_top.group = 'machinery'
    skip = _bulkhead_frames()
    floor_colour, frame_colour = tint(PRIMER, 0.97), PRIMER

    for k in range(1, LAST_FRAME + 1):
        yard, z = k * L.FRAME_SPACING, L.Z(k * L.FRAME_SPACING)
        if k in skip:
            continue
        y_floor = floor_top(yard)
        in_db = in_double_bottom(yard)
        plated = in_db                              # a floor that carries the tank top
        depth = y_floor - L.keel_y(z)
        toward = -1 if z > 0 else 1                 # flanges and face bars turn toward amidships, where she is fuller
        # Round the thruster tunnel the plating is fitted to the opening in larger pieces and keeps less closely to her
        # lines: the floors and frames beside the tunnel stand a further 12 mm off it.
        skin = S.SHELL + (0.012 if abs(z - TUNNEL[0]) < 1.0 else 0.0)
        # ---- The floor: a plate across her bottom, with lightening holes where the double bottom is deep enough.
        if depth > 0.12 and not _in_tunnel(z) and L.main_x(y_floor - 0.02, z) > 0.35:
            # (a floor that carries plating ends 3 mm under it: its edge in the plating's own plane would show as a line on it)
            outline = [(x, y, z) for x, y in _section_outline(z, y_floor - (UNDER if plated else 0.0), depth=skin)]
            holes = []
            if plated and not any(abs(yard - t) < 1e-6 for t in S.TIGHT_FLOORS):
                for xc in (1.7, 4.9, 7.9):
                    under = L.hull_y(xc + 0.45, z)
                    if under is not None and y_floor - under > 0.75:
                        yc = (y_floor + max(under, L.hull_y(xc, z))) / 2 + 0.02
                        holes += [_oval(xc, yc, 0.30, 0.18, z), _oval(-xc, yc, 0.30, 0.18, z)]
            floors.polygon(outline, floor_colour, holes)
            if not plated:
                # A face bar along the top of a floor that carries no tank top: on the floor's own top edge, which lies
                # a little above y_floor (the floor stands 12 mm inside the plating at its ends).
                (x0, yb, _), x1 = outline[0], outline[-1][0]
                floors.grid([[(x0, yb, z), (x1, yb, z)], [(x0, yb, z + toward * 0.08), (x1, yb, z + toward * 0.08)]], floor_colour)
        # ---- The side frames: an angle bar up each side from the floor to the deck; every third is a web frame.
        web = S.WEB_FRAME if k % S.WEB_EVERY == 0 else S.FRAME_WEB
        _side_frames(frames, z, yard, y_floor, skin, toward, frame_colour, web)

    # ---- Intermediate frames in the fore peak: a lighter angle between each pair, from the collision bulkhead to the stem,
    # where the sea strikes her. They stand on the floor's level there.
    k = int(round(S.INTERMEDIATE_FROM / L.FRAME_SPACING))
    while (k + 0.5) * L.FRAME_SPACING < L.STEM_AT_CAR - 0.6:
        yard = (k + 0.5) * L.FRAME_SPACING
        _side_frames(frames, L.Z(yard), yard, floor_top(yard), S.SHELL, -1, frame_colour, S.INTERMEDIATE_WEB)
        k += 1

    # ---- The frames of the topsides: an angle bar up each side from the main deck to the upper deck, 12 mm inside the
    # moulded line, cut where the shell has an opening. They are straight, as the topsides are. Every sixth is a web frame.
    for k in range(1, L.FRAMES):
        yard, z = k * L.FRAME_SPACING, L.Z(k * L.FRAME_SPACING)
        if yard > L.STEM_AT_MAIN - 0.5:
            break
        toward = -1 if z > 0 else 1
        web = topside_web(yard)
        n = L.topside_normal(z)
        across = max(0.3, (n[0] ** 2 + n[1] ** 2) ** 0.5)
        for a, b in topside_frame_spans(yard):
            for side in (1, -1):
                outer = [(side * (L.topside_x(y, z) - (S.SHELL + 0.002) / across), y, z) for y in (a, b)]
                inner = [(side * (L.topside_x(y, z) - (S.SHELL + 0.002 + web) / across), y, z) for y in (a, b)]
                topside.grid([outer, inner], frame_colour)
                topside.grid([inner, [(x, y, zz + toward * (0.12 if web > 0.3 else 0.075)) for x, y, zz in inner]], frame_colour)

    # ---- Girders in the double bottom: the centre girder and, each side, one under the main engine and one outboard.
    count = int(round((S.DOUBLE_BOTTOM[1] - S.DOUBLE_BOTTOM[0]) / 0.3))
    yards = [S.DOUBLE_BOTTOM[0] + 0.3 * i for i in range(count + 1)]
    girder_colour = tint(PRIMER, 0.94)
    for x in (0.0,) + tuple(S.GIRDERS) + tuple(-g for g in S.GIRDERS):
        lower, upper = [], []
        for yard in yards:
            z = L.Z(yard)
            under = L.keel_y(z) if x == 0 else L.hull_y(x, z)
            if under is None or under + S.SHELL > S.TANK_TOP - 0.06 or _in_tunnel(z) or yard < S.DOUBLE_BOTTOM[0] + 0.05:
                if len(lower) > 1:
                    girders.grid([lower, upper], girder_colour)
                lower, upper = [], []
                continue
            lower.append((x, under + S.SHELL, z))
            upper.append((x, S.TANK_TOP - UNDER, z))
        if len(lower) > 1:
            girders.grid([lower, upper], girder_colour)

    # ---- Watertight bulkheads, each stiffened on one face with angle bars 0.6 m apart.
    bulkhead_colour = tint(PRIMER, 1.03)
    for b in S.BULKHEADS:
        z = L.Z(b['yard'])
        outline = _section_outline(z, TOP_OF_STRUCTURE, count=24)
        # A watertight door stands in six of them (spec.WT_DOORS): the plate is cut 3 cm wider than the clear opening,
        # under the door's frame.
        doorways = []
        for d in S.WT_DOORS:
            if abs(d['yard'] - b['yard']) < 1e-6:
                x0, y0, x1, y1 = S.door_opening(d)
                doorways.append(round_rect(x0 - 0.03, y0 - 0.03, x1 + 0.03, y1 + 0.03, S.WT_DOOR['corner'] + 0.03, z))
        bulkheads.polygon([(x, y, z) for x, y in outline], bulkhead_colour, doorways)
        toward = -1 if z > 0 else 1
        # (0.6 m apart, on the odd 0.3 m: the girders stand at 3.4 and 6.4 m and the tanks' sides at 1.2, 1.8 and 5.9 m, and
        # a stiffener in the plane of one of them would be two plates in one plane)
        half = L.half_breadth(z)
        x = -(int(half / 0.6) + 0.5) * 0.6
        while x < half:
            y_low = L.hull_y(x, z)
            y_far = L.hull_y(x, z + toward * 0.09)
            # No stiffener through a door: one that would stand within 0.55 m of a door's middle is left out.
            at_door = any(abs(d['yard'] - b['yard']) < 1e-6 and abs(x - d.get('x', 0.0)) < 0.55 for d in S.WT_DOORS)
            if y_low is not None and y_far is not None and y_low < L.MAIN and y_far < L.MAIN and abs(x) > 0.05 and not at_door:
                y_low = max(y_low, y_far) + S.SHELL + 0.03
                if TOP_OF_STRUCTURE - y_low > 0.4 and abs(x) < _breadth_inside(z, min(y_low + 0.05, L.MAIN - 0.1)) - 0.12:
                    web = [[(x, y_low, z), (x, TOP_OF_STRUCTURE, z)], [(x, y_low, z + toward * 0.09), (x, TOP_OF_STRUCTURE, z + toward * 0.09)]]
                    bulkheads.grid(web, bulkhead_colour)
                    bulkheads.grid([web[1], [(x + 0.06, y_low, z + toward * 0.09), (x + 0.06, TOP_OF_STRUCTURE, z + toward * 0.09)]], bulkhead_colour)
            x += 0.6

    # ---- The sides of the tanks and of the lower hold: a longitudinal bulkhead each side, from the bottom (or the tank
    # top) to the main deck. The port one is cut for the doorway of the lower hold's stair (rule 3: an opening is cut).
    tank_colour = tint(PRIMER, 1.01)
    for t in S.TANK_SIDES:
        (a, b), off = t['yard'], t['x']
        for side in (1, -1):
            doors = sorted(t.get('doors', ())) if side > 0 else []
            # the plate in lengths between its doorways, and over each doorway's head
            cuts = [a] + [v for ya, yb, _, _ in doors for v in (ya, yb)] + [b]
            for k in range(0, len(cuts), 2):
                ya, yb = cuts[k], cuts[k + 1]
                n = max(1, int(round((yb - ya) / 0.3)))
                lower, upper = [], []
                for i in range(n + 1):
                    yard = ya + (yb - ya) * i / n
                    z = L.Z(yard)
                    foot = S.TANK_TOP if in_double_bottom(yard) else L.hull_y(off, z) + S.SHELL
                    lower.append((side * off, foot, z))
                    upper.append((side * off, TOP_OF_STRUCTURE, z))
                tanks.grid([lower, upper], tank_colour)
            for ya, yb, sill, head in doors:
                for y0, y1 in ((S.TANK_TOP, S.TANK_TOP + sill), (S.TANK_TOP + head, TOP_OF_STRUCTURE)):
                    if y1 - y0 > 1e-6:
                        tanks.grid([[(side * off, y0, L.Z(ya)), (side * off, y0, L.Z(yb))], [(side * off, y1, L.Z(ya)), (side * off, y1, L.Z(yb))]], tank_colour)
    # ---- The forward end of the lower hold stair's trunk: a plate across the port wing tank, from the hold's side to the shell.
    E = S.TRUNK_END
    z = L.Z(E['yard'])
    # (it ends on the inner edge of the frame that stands in its plane: on the frame's own web it would be a second plate there)
    k = int(round(E['yard'] / L.FRAME_SPACING))
    web = (S.WEB_FRAME if k % S.WEB_EVERY == 0 else S.FRAME_WEB) if abs(k * L.FRAME_SPACING - E['yard']) < 1e-6 else 0.0
    pts = [(x, max(y, S.TANK_TOP)) for x, y in _section_outline(z, TOP_OF_STRUCTURE, count=24, depth=S.SHELL + web + (0.003 if web else 0.0)) if x >= E['x'] + 0.01]
    tanks.polygon([(E['x'], TOP_OF_STRUCTURE, z)] + [(x, y, z) for x, y in pts] + [(E['x'], S.TANK_TOP, z)], tank_colour)

    # ---- Two panting stringers in the fore peak, where the sea strikes her.
    for y in (L.Y(3.2), L.Y(5.0)):
        for side in (1, -1):
            outer, inner = [], []
            i = 0
            while True:
                z = L.Z(S.COLLISION) + 0.03 + 0.3 * i
                i += 1
                if z > L.BODY_END - 0.4 or y < L.keel_y(z) + 0.3:
                    break
                x = _breadth_inside(z, y, S.SHELL + 0.006)
                if x < 0.2:
                    break
                outer.append((side * x, y, z))
                inner.append((side * max(0.0, x - 0.32), y, z))
            if len(outer) > 1:
                stringers.grid([outer, inner], frame_colour)

    # ---- The tank top.
    red = srgb(S.BILGE_RED)

    def plating(a, b, y, colour):
        rows = []
        n = max(1, int(round((b - a) / 0.6)))
        for i in range(n + 1):
            z = L.Z(a + (b - a) * i / n)
            x = _breadth_inside(z, y)
            rows.append([(x, y, z), (0.0, y, z), (-x, y, z)])
        start = len(tank_top.f)
        tank_top.grid(rows, colour)
        tank_top.orient(start, (0, 1, 0))

    plating(S.DOUBLE_BOTTOM[0] + 0.006, S.DOUBLE_BOTTOM[1], S.TANK_TOP, red)
    return [frames, floors, girders, bulkheads, tanks, stringers, topside, tank_top]
