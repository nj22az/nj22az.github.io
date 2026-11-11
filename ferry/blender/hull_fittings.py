"""
What stands in the spaces the hull gives a floor and bulkheads to, and what she carries at the bow:

  - the steering gear: a flat, the two rudder stocks in their carriers, a tiller on each joined by a tie bar, a ram on
    each tiller, two hydraulic power units, the hand pump, the stern tubes' oil header tanks, the emergency fire pump;
  - the shafting inside her: each intermediate shaft from its gearbox's flange in the engine room, over a plummer block,
    through the bulkhead's gland, to the coupling on the tail shaft in the shaft space;
  - the ways on foot below the car deck: six watertight doors on the centreline, the flat and steps through the shaft
    space, the steps from the engine room's after flat to the tank top, the ladder and flush hatch to the fore store;
  - the bow thruster's motor on the crown of the tunnel;
  - the fore store's flat and the two chain lockers;
  - the two anchors, housed in their hawse pipes.

All but the anchors are fittings of rooms, so they lift with the machinery spaces (`group = 'machinery'`), where the
viewer lists those rooms; the anchors are part of the hull.
"""
from math import pi, cos, sin
from mathutils import Vector
import lines as L
import spec as S
from shipyard import Part, srgb, tint, round_rect
from hull_appendages import shaft_y, _revolve, _frame

X = S.SHAFT_X
UP = (0, 1, 0)


def _cyl(part, a, b, r, colour, sides=16, r2=None):
    part.tube(a, b, r, r2, colour=colour, sides=sides)


PLATE_T = 0.006          # a floor plate's thickness


def _plates(part, yard0, yard1, y, colour, breadth, gap=0.008, length=0.75, width=0.9, opening=None):
    """Floor plates laid in panels between two frames: each panel its own plate, a shade apart from its neighbours."""
    n = max(1, round((yard1 - yard0) / length))
    for i in range(n):
        za, zb = L.Z(yard0 + (yard1 - yard0) * i / n) + gap, L.Z(yard0 + (yard1 - yard0) * (i + 1) / n) - gap
        half = min(breadth(za), breadth(zb))
        m = max(1, round(2 * half / width))
        for j in range(m):
            xa, xb = -half + 2 * half * j / m + gap, -half + 2 * half * (j + 1) / m - gap
            if opening and opening(xa, xb, za, zb):
                continue
            shade = 1 + 0.035 * (((i * 7 + j * 13) % 5) - 2) / 2
            part.box((xa, y - PLATE_T, za), (xb, y, zb), tint(colour, shade))        # 6 mm of plate: it carries what stands on it


def _hex_bar(part, a, b, wa, wb, h, colour):
    """A flat bar from a to b, `wa` wide at a and `wb` at b, `h` deep: a tiller arm."""
    a, b = Vector(a), Vector(b)
    along = (b - a).normalized()
    side = along.cross(Vector(UP)).normalized()
    up = Vector(UP)
    ring = lambda c, w: [tuple(c + side * (sx * w / 2) + up * (sy * h / 2)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    start = len(part.f)
    part.grid([ring(a, wa), ring(b, wb)], colour, close=True)
    mid = (a + b) / 2
    part.orient(start, lambda c: (c - mid) - along * (c - mid).dot(along))
    for c, w, d in ((a, wa, -along), (b, wb, along)):
        start = len(part.f)
        part.polygon(ring(c, w), colour)
        part.orient(start, tuple(d))


def steering_gear():
    """
    The steering gear, as it works. What turns with a rudder is a part of its own (its `mover`): the head of the stock
    and the tiller with the rudder; the tie bar is carried by the tillers' ends; each ram swings on its trunnion and its
    rod runs out or in. motion() says how each moves.
    """
    flat = Part('Steering-gear room, flat', 'Floor plate')
    gear = Part('Steering gear', 'Machinery paint', smooth=True, angle=40)
    bright = Part('Steering gear, bright steel', 'Shaft steel', smooth=True, angle=40)
    tie = Part('Tie bar', 'Machinery paint', smooth=True, angle=40, mover='tie-bar')
    made = [flat, gear, bright, tie]
    y0 = S.STEERING_FLAT
    zs = L.Z(S.RUDDER['yard_stock'])
    t = S.TILLER
    arm_y, reach = t['level'], t['reach']
    k = 1.6                                           # her gear beside the first Chisum's: stocks of 200 mm for 120
    dark, grey, steel = srgb(S.DARK_GREY), srgb(S.LIGHT_GREY), srgb(S.STEEL)
    blue, red, brown = srgb(S.MOTOR_BLUE), srgb(S.FIRE_RED), srgb(S.OIL_BROWN)

    # ---- The flat: chequer plates from the transom's frames to the bulkhead.
    breadth = lambda z: L.hull_x(y0 + 0.02, z) - 0.20
    _plates(flat, 0.33, S.fr(8) - 0.06, y0, srgb(S.FLOOR_PLATE), breadth, length=0.9, width=1.1)
    # The flat's bearers: a bar across her on the floor of each frame, as high as the flat lies over it.
    from hull_structure import floor_top
    bearers = Part('Steering-gear room, bearers', 'Machinery paint')
    made.append(bearers)
    for frame in range(1, 8):
        yard = frame * L.FRAME_SPACING
        zb = L.Z(yard)
        foot = floor_top(yard)
        if y0 - PLATE_T - foot > 0.02:
            half = L.hull_x(foot + 0.02, zb) - 0.12                 # as wide as she is at the bearer's foot: she is narrower there than at the flat
            bearers.box((-half, foot, zb - 0.03), (half, y0 - PLATE_T, zb + 0.03), dark)

    pin = zs + t['ram_at']
    for side, label in ((1, 'port'), (-1, 'starboard')):
        x = side * X
        rudder = 'rudder-p' if side > 0 else 'rudder-s'
        ram = 'ram-p' if side > 0 else 'ram-s'
        tiller = Part(f'Tiller, {label}', 'Machinery paint', smooth=True, angle=40, mover=rudder)
        head = Part(f'Rudder stock head, {label}', 'Shaft steel', smooth=True, angle=40, mover=rudder)
        barrel = Part(f'Ram cylinder, {label}', 'Machinery paint', smooth=True, angle=40, mover=ram)
        rod = Part(f'Ram rod, {label}', 'Shaft steel', smooth=True, angle=40, mover=ram + '-rod')
        made += [tiller, head, barrel, rod]
        # The rudder carrier on the flat (fixed); the head of the stock above it and the tiller keyed to it (turning).
        # (The carrier's top closes on the stock, the tiller's boss is bored to it and the ram's cylinder begins at its stool:
        # each stood clear of what holds it by 5 to 30 mm, which blender/afloat.py found.)
        _revolve(gear, (x, y0, zs), UP, [(0.0, 0.25 * k), (0.035 * k, 0.25 * k), (0.035 * k, 0.17 * k), (0.15 * k, 0.17 * k), (0.16 * k, 0.11 * k), (0.16 * k, 0.10)], dark, sides=22)
        _cyl(head, (x, y0 + 0.15 * k, zs), (x, arm_y + 0.20, zs), 0.10, steel)
        _revolve(tiller, (x, arm_y - 0.13, zs), UP, [(0.0, 0.10), (0.0, 0.20), (0.26, 0.20), (0.26, 0.10)], dark, sides=22)
        _hex_bar(tiller, (x, arm_y, zs + 0.15), (x, arm_y, zs + reach), 0.27, 0.16, 0.13, dark)
        _revolve(tiller, (x, arm_y - 0.09, zs + reach), UP, [(0.0, 0.0), (0.0, 0.10), (0.18, 0.10), (0.18, 0.0)], dark, sides=16)
        _cyl(head, (x, arm_y - 0.13, zs + reach), (x, arm_y + t['tie_bar'] + 0.07, zs + reach), 0.034, steel, sides=10)
        # The clevis on the tiller that the ram's rod is pinned to.
        cx = x + side * t['clevis']
        tiller.box((cx - 0.085, arm_y - 0.10, pin - 0.08), (cx + 0.085, arm_y + 0.10, pin + 0.08), dark)
        # The ram: its stool (fixed), the cylinder trunnioned on it, the rod.
        out = side * (X + t['ram_anchor'])
        gear.box((min(out, out + side * 0.22), y0, pin - 0.17), (max(out, out + side * 0.22), arm_y + 0.14, pin + 0.17), dark)
        along = lambda d: (out - side * d, arm_y, pin)          # a point d metres from the trunnion, toward the tiller
        _cyl(barrel, along(0.0), along(0.90), 0.095, grey, sides=18)
        _cyl(barrel, along(0.89), along(0.97), 0.115, dark, sides=18)
        # The rod is as long as the stroke asks: hard over one way it still stands in the cylinder, the other way it
        # does not come out of its back.
        _cyl(rod, along(0.42), along(t['ram_anchor'] - t['clevis'] - 0.04), 0.042, steel, sides=12)
        # Two pipes from the power unit to the ram, along the flat, clamped to it at every turn and between.
        for i, end in enumerate((X + 1.75, X + 1.05)):
            run = L.Z(1.75) + 0.07 * i
            pts = [(side * 1.05, y0 + 0.03, run), (side * end, y0 + 0.03, run), (side * end, y0 + 0.03, pin + 0.21), (side * end, arm_y - 0.10, pin + 0.21)]
            for a, b in zip(pts, pts[1:]):
                _cyl(bright, a, b, 0.016, srgb(S.FLANGE), sides=8)
            # a saddle clamp on the flat at each end of its two level lengths and in the middle of each (JSY-STD-402)
            for a, b in zip(pts[:2], pts[1:3]):
                for f in (0.08, 0.5, 0.92):
                    cx, cz = a[0] + (b[0] - a[0]) * f, a[2] + (b[2] - a[2]) * f
                    wx, wz = (0.012, 0.03) if abs(b[0] - a[0]) > abs(b[2] - a[2]) else (0.03, 0.012)
                    gear.box((cx - wx, y0, cz - wz), (cx + wx, y0 + 0.052, cz + wz), dark)
        # A hydraulic power unit each side of the centreline, aft of the stocks and clear of the tillers and the tie bar:
        # a tank on feet, a motor and its pump standing on the tank, a filter, a sight glass.
        ux = side * 1.05
        z0, z1 = L.Z(1.0), L.Z(1.7)
        gear.box((ux - 0.42, y0 + 0.12, z0), (ux + 0.42, y0 + 0.72, z1), grey)
        for fx in (-0.34, 0.34):
            for fz in (z0 + 0.07, z1 - 0.07):
                gear.box((ux + fx - 0.035, y0, fz - 0.035), (ux + fx + 0.035, y0 + 0.12, fz + 0.035), dark)
        _cyl(gear, (ux - 0.12, y0 + 0.72, (z0 + z1) / 2), (ux - 0.12, y0 + 0.82, (z0 + z1) / 2), 0.10, dark)
        _cyl(gear, (ux - 0.12, y0 + 0.82, (z0 + z1) / 2), (ux - 0.12, y0 + 1.26, (z0 + z1) / 2), 0.15, blue, sides=18)
        _cyl(gear, (ux - 0.12, y0 + 1.26, (z0 + z1) / 2), (ux - 0.12, y0 + 1.31, (z0 + z1) / 2), 0.157, dark, sides=18)
        _cyl(gear, (ux + 0.22, y0 + 0.72, z1 - 0.18), (ux + 0.22, y0 + 0.94, z1 - 0.18), 0.06, srgb(S.FLANGE), sides=12)
        gear.box((ux - 0.05, y0 + 0.26, z1), (ux + 0.05, y0 + 0.60, z1 + 0.015), srgb(0xd8d2b8))
        # The stern tube's oil header tank, high on the forward bulkhead (frame 8), its pipe led down the bulkhead to the flat.
        hx = side * 3.3
        hz = L.Z(S.fr(8)) - 0.002                                         # its bracket is welded to the bulkhead's after face
        gear.box((hx - 0.22, y0 + 1.05, hz - 0.36), (hx + 0.22, y0 + 1.55, hz - 0.02), brown)
        gear.box((hx - 0.26, y0 + 0.99, hz - 0.36), (hx + 0.26, y0 + 1.05, hz), dark)
        _cyl(bright, (hx, y0 + 1.0, hz - 0.05), (hx, y0, hz - 0.05), 0.016, srgb(S.FLANGE), sides=8)
        for hh in (0.25, 0.70):                                           # clamped to the bulkhead on its way down
            gear.box((hx - 0.03, y0 + hh, hz - 0.07), (hx + 0.03, y0 + hh + 0.025, hz), dark)

    # The tie bar joins the two tillers' ends, over the tillers and the rams, so the rudders turn together.
    bar_y = arm_y + t['tie_bar']
    _cyl(tie, (-X, bar_y, zs + reach), (X, bar_y, zs + reach), 0.05, dark, sides=14)
    for side in (1, -1):
        tie.box((side * X - 0.08, bar_y - 0.055, zs + reach - 0.08), (side * X + 0.08, bar_y + 0.055, zs + reach + 0.08), dark)

    # The emergency hand pump on its pedestal on the centreline aft, its lever up.
    hz = L.Z(1.5)
    gear.box((-0.11, y0, hz - 0.11), (0.11, y0 + 0.62, hz + 0.11), grey)
    _cyl(gear, (0.0, y0 + 0.62, hz), (0.0, y0 + 0.74, hz), 0.07, dark)
    _cyl(bright, (0.0, y0 + 0.70, hz), (0.0, y0 + 1.22, hz - 0.36), 0.016, steel, sides=10)
    _cyl(gear, (0.0, y0 + 1.22, hz - 0.36), (0.0, y0 + 1.34, hz - 0.44), 0.025, red, sides=10)

    # The rudder-angle transmitter beside the port stock, on a stool on the flat, and its link to the stock's head.
    gear.box((X - 0.50, y0, zs - 0.52), (X - 0.34, arm_y + 0.26, zs - 0.36), grey)
    _cyl(bright, (X - 0.42, arm_y + 0.19, zs - 0.44), (X, arm_y + 0.19, zs), 0.010, steel, sides=6)

    # The emergency fire pump, outside the engine room: a pump and its motor on a bed to starboard aft, its own sea
    # suction with a valve, its delivery led up to the deck.
    px, pz = -3.4, L.Z(1.3)
    gear.box((px - 0.2, y0, pz - 0.42), (px + 0.2, y0 + 0.07, pz + 0.42), dark)
    _cyl(gear, (px, y0 + 0.24, pz - 0.36), (px, y0 + 0.24, pz + 0.02), 0.115, blue, sides=18)
    _cyl(gear, (px, y0 + 0.24, pz + 0.02), (px, y0 + 0.24, pz + 0.1), 0.06, dark, sides=12)
    _cyl(gear, (px, y0 + 0.24, pz + 0.1), (px, y0 + 0.24, pz + 0.3), 0.14, red, sides=18)
    _cyl(gear, (px, y0 + 0.24, pz + 0.3), (px, y0 + 0.24, pz + 0.4), 0.055, red, sides=12)
    _cyl(gear, (px, y0 + 0.24, pz + 0.4), (px, y0 - 0.02, pz + 0.4), 0.05, red, sides=12)
    _revolve(gear, (px, y0 + 0.12, pz + 0.4), (1, 0, 0), [(0.05, 0.0), (0.05, 0.09), (0.065, 0.09), (0.065, 0.0)], red, sides=12)
    _cyl(gear, (px, y0 + 0.36, pz + 0.2), (px, L.CAR - 0.04, pz + 0.2), 0.04, red, sides=12)
    for p in made:
        p.group = 'machinery'
    return made


def motion():
    """
    What can be worked on the page, and how each moving part answers. One input, the rudder angle in degrees (to port
    negative, to starboard positive: the helm indicator's way). Turning to starboard is a turn about the upright axis
    that carries the blade's after edge to starboard and the tiller, which points forward, to port.

      turn    the part turns about `pivot`
      carry   the part keeps its heading and goes with `point` as that turns about `pivot` (the tie bar)
      aim     the part swings about `anchor` to keep pointing at `pin`, which turns about `pivot` (a ram's cylinder);
              with `extend`, it also runs along that line by as much as the distance has grown (its rod)
    """
    t = S.TILLER
    zs = L.Z(S.RUDDER['yard_stock'])
    inputs = [dict(id='rudder', name='Rudder', min=-S.RUDDER_ANGLE, max=S.RUDDER_ANGLE, step=1, unit='°',
                   below='to port', above='to starboard', rest='amidships')]
    movers = []
    for side, tag in ((1, 'p'), (-1, 's')):
        pivot = [side * X, 0.0, zs]
        movers.append(dict(id=f'rudder-{tag}', kind='turn', input='rudder', axis=[0, 1, 0], pivot=pivot))
        ram = dict(kind='aim', input='rudder', axis=[0, 1, 0], pivot=pivot,
                   anchor=[side * (X + t['ram_anchor']), t['level'], zs + t['ram_at']],
                   pin=[side * (X + t['clevis']), t['level'], zs + t['ram_at']])
        movers.append(dict(ram, id=f'ram-{tag}'))
        movers.append(dict(ram, id=f'ram-{tag}-rod', extend=True))
    movers.append(dict(id='tie-bar', kind='carry', input='rudder', axis=[0, 1, 0], pivot=[X, 0.0, zs], point=[X, 0.0, zs + t['reach']]))
    # The watertight doors: each turns on its hinges, 90° open. Nobody sets a door with a slider: `auto: near` says the
    # page opens it for whoever comes within `reach` of `at` (the middle of its sill's foot) on foot, and to a tap from
    # outside; `normal` is the way through it.
    D = S.WT_DOOR
    for d in S.WT_DOORS:
        hinge = _door_hinge(d)
        inputs.append(dict(id=d['id'], name=d['name'], min=0, max=D['open'], step=1, unit='°', below='', above='open', rest='shut',
                           auto='near', at=[d.get('x', 0.0), d['floor'], L.Z(d['yard'])], normal=[0, 0, 1], reach=D['reach']))
        movers.append(dict(id=d['id'], kind='turn', input=d['id'], axis=[0, 1, 0], pivot=[hinge[0], 0.0, hinge[1]], ratio=d['opens']))
    # The hatch covers the same way: 100° open, for whoever comes near on the deck or on the ladder under it.
    for l in S.LADDERS:
        if not l.get('hatch'):
            continue
        x0, x1, ya, yb = S.hatch_opening(l)
        pivot, axis, ratio = hatch_hinge(l)
        inputs.append(dict(id=l['hatch'], name=l['hatch_name'], min=0, max=100, step=1, unit='°', below='', above='open', rest='shut',
                           auto='near', at=[(x0 + x1) / 2, (l['foot'] + l['head']) / 2, L.Z((ya + yb) / 2)], reach=1.9, height=1.6))
        movers.append(dict(id=l['hatch'], kind='turn', input=l['hatch'], axis=axis, pivot=pivot, ratio=ratio))
    return inputs, movers


def _door_face(d):
    """Where a door's leaf lies: the face of its frame on the side it opens to (z), and that side (+1 forward, -1 aft)."""
    ya, yb = S.door_frame_yards(d)
    return (L.Z(yb) if d['opens'] > 0 else L.Z(ya)), d['opens']


def _door_hinge(d):
    """The hinge line of a door: (x, z). To port of the frame, in the middle of the leaf's thickness."""
    zf, side = _door_face(d)
    return (d.get('x', 0.0) + S.WT_DOOR['width'] / 2 + S.WT_DOOR['frame'] + 0.04, zf + side * (0.004 + S.WT_DOOR['leaf'] / 2))


def _walkway(walk, rails, cx, half, levels, posts, frames, rail, floor=None):
    """
    A walkway of floor plates: `levels` are its plates, each (yard, yard, height), in the order one walks them. Under
    each edge a stringer; bearers down to the floors of her bottom at the frames given; a rail each side on stanchions
    at the yards given for that side (+1 port, -1 starboard).
    """
    from hull_structure import floor_top
    plate, dark, yellow = srgb(S.FLOOR_PLATE), srgb(S.DARK_GREY), srgb(S.RAIL_YELLOW)
    for i, (ya, yb, y) in enumerate(levels):
        ya, yb = sorted((ya, yb))
        start = len(walk.f)
        walk.grid([[(cx - half, y, L.Z(ya)), (cx + half, y, L.Z(ya))], [(cx - half, y, L.Z(yb)), (cx + half, y, L.Z(yb))]], tint(plate, 1 + 0.03 * ((i * 5) % 3 - 1)))
        walk.orient(start, UP)

    def level_at(yard):
        best = None
        for ya, yb, y in levels:
            ya, yb = sorted((ya, yb))
            if ya - 1e-6 <= yard <= yb + 1e-6 and (best is None or y > best):
                best = y
        return best if best is not None else levels[0][2]

    for sx in (1, -1):
        x = cx + sx * (half + 0.02)
        for ya, yb, y in levels:
            ya, yb = sorted((ya, yb))
            a, b = sorted((x - 0.006, x + 0.006))
            # A level with no frame under it (a step between two longer levels) has no post: its side bearer is deep enough
            # to meet the next level's, so the step hangs on its neighbours (it hung on nothing: blender/afloat.py).
            framed = any(ya < k * L.FRAME_SPACING < yb for k in frames)
            under = y - (0.10 if framed else 0.30)
            rails.box((a, under if floor is None else max(under, floor), L.Z(ya)), (b, y - 0.004, L.Z(yb)), dark)
        for k in frames:
            yard = k * L.FRAME_SPACING
            if not (min(l[0] for l in levels) < yard < max(l[1] for l in levels)):
                continue
            top, foot = level_at(yard) - 0.10, floor_top(yard) + 0.012
            if top - foot > 0.06:
                rails.box((x - 0.025, foot, L.Z(yard) - 0.025), (x + 0.025, top, L.Z(yard) + 0.025), dark)
        rx = cx + sx * (half + 0.04)
        tops = []
        for yard in posts[sx]:
            y = level_at(yard)
            _cyl(rails, (rx, y - 0.02, L.Z(yard)), (rx, y + rail, L.Z(yard)), 0.014, yellow, sides=8)
            tops.append((rx, y + rail, L.Z(yard)))
        for a, b in zip(tops, tops[1:]):
            _cyl(rails, a, b, 0.017, yellow, sides=10)
            _cyl(rails, (a[0], a[1] - 0.45, a[2]), (b[0], b[1] - 0.45, b[2]), 0.011, yellow, sides=8)


def ways():
    """The ladders, as the page's walker needs them: where one stands at each end and the line one climbs on."""
    out = []
    for l in S.LADDERS:
        foot, head, line = S.ladder_way(l)
        out.append(dict(id=l['id'], kind='ladder', down=l['name'], up=l['up'],
                        a=[foot[0], l['foot'], L.Z(foot[1])], b=[head[0], l['head'], L.Z(head[1])], line=[line[0], L.Z(line[1])]))
    return out


def ladders():
    """
    The ladders (spec.LADDERS): two flat-bar stringers 0.40 m apart, round rungs every 0.30 m. Over the fore store's a
    hatch in the car deck, on the line between the two middle lanes: flush, because vehicles drive over it; its coaming
    hangs under the deck and its cover lies in the deck's plane, hinged on the ladder's side (a mover named as the hatch,
    which the page opens for whoever comes near). And the fore store's flat itself, between the chain lockers.
    """
    from hull_structure import floor_top
    steel, grey, dark, plate = srgb(S.STEEL), srgb(S.DOOR_GREY), srgb(S.DARK_GREY), srgb(S.FLOOR_PLATE)
    made = []
    for l in S.LADDERS:
        fx, fz = l['faces']
        ax, az = abs(fz), abs(fx)                                   # across the ladder, in the plan
        x, z = l['x'], L.Z(l['yard'])
        y0, y1 = l['foot'], l['head'] + l.get('top', -0.02)
        part = Part(f"Ladder, {l['id'][7:].replace('-', ' ')}", 'Shaft steel', smooth=True, angle=40)
        part.group = l['group']
        for sgn in (1, -1):
            sx, sz = x + sgn * 0.2 * ax, z + sgn * 0.2 * az
            lo = (sx - 0.006 * ax - 0.025 * abs(fx), y0, sz - 0.006 * az - 0.025 * abs(fz))
            hi = (sx + 0.006 * ax + 0.025 * abs(fx), y1, sz + 0.006 * az + 0.025 * abs(fz))
            part.box(lo, hi, steel)
            # stand-offs to the wall behind, where there is one
            if l.get('wall'):
                n = max(2, int((y1 - y0) / 1.1) + 1)
                for k in range(n):
                    y = y0 + 0.25 + (min(y1, l['head']) - y0 - 0.5) * k / (n - 1)
                    a = (min(sx, sx + fx * l['wall']) - 0.008 * ax, y, min(sz, sz + fz * l['wall']) - 0.008 * az)
                    b = (max(sx, sx + fx * l['wall']) + 0.008 * ax, y + 0.04, max(sz, sz + fz * l['wall']) + 0.008 * az)
                    part.box(a, b, steel)
        y = y0 + 0.30
        while y < y1 - 0.05:
            _cyl(part, (x - 0.2 * ax, y, z - 0.2 * az), (x + 0.2 * ax, y, z + 0.2 * az), 0.011, steel, sides=8)
            y += 0.30
        made.append(part)
        if not l.get('hatch'):
            continue
        # ---- The hatch: a coaming under the deck round the opening, and the cover in the deck's plane.
        x0, x1, ya, yb = S.hatch_opening(l)
        z0, z1 = L.Z(ya), L.Z(yb)
        deck = l['head']
        coaming = Part(f"Hatch coaming, {l['id'][7:].replace('-', ' ')}", 'Machinery paint')
        coaming.group = 'car'
        t, foot = 0.03, deck - 0.22
        for lo, hi in (((x0 - t, foot, z0 - t), (x0, deck - 0.012, z1 + t)), ((x1, foot, z0 - t), (x1 + t, deck - 0.012, z1 + t)),
                       ((x0, foot, z0 - t), (x1, deck - 0.012, z0)), ((x0, foot, z1), (x1, deck - 0.012, z1 + t))):
            coaming.box(lo, hi, grey)
        cover = Part(f"Hatch cover, {l['id'][7:].replace('-', ' ')}", 'Machinery paint', mover=l['hatch'])
        cover.group = 'car'
        cover.box((x0 + 0.004, deck - 0.012, z0 + 0.004), (x1 - 0.004, deck + 0.004, z1 - 0.004), tint(grey, 0.9))
        # a stiffening cross under the cover, and a flush lifting ring on it
        mx, mz = (x0 + x1) / 2, (z0 + z1) / 2
        cover.box((x0 + 0.05, deck - 0.03, mz - 0.02), (x1 - 0.05, deck - 0.012, mz + 0.02), tint(grey, 0.82))
        cover.box((mx - 0.02, deck - 0.03, z0 + 0.05), (mx + 0.02, deck - 0.012, z1 - 0.05), tint(grey, 0.82))
        cover.box((mx - 0.05, deck + 0.004, z1 - 0.12), (mx + 0.05, deck + 0.008, z1 - 0.08), dark)
        made += [coaming, cover]
    # ---- The fore store's flat, between the two bulkheads forward, on bearers that stand on the floors.
    flat = Part('Fore store, flat', 'Floor plate')
    bearers = Part('Fore store, bearers', 'Machinery paint')
    for p in (flat, bearers):
        p.group = 'machinery'
    a, b = S.fr(96) + 0.06, S.COLLISION - 0.06
    breadth = lambda z: L.hull_x(S.FORE_STORE_FLAT + 0.02, z) - 0.22
    _plates(flat, a, b, S.FORE_STORE_FLAT, plate, breadth, length=0.6, width=1.0)
    for k in range(97, 103):
        yard = k * L.FRAME_SPACING
        z = L.Z(yard)
        foot = floor_top(yard) + 0.012
        for sx in (0.5, -0.5):
            if abs(sx) < L.hull_x(foot - 0.05, z) - 0.15:
                bearers.box((sx - 0.03, foot - 0.02, z - 0.03), (sx + 0.03, S.FORE_STORE_FLAT - PLATE_T, z + 0.03), dark)
        # a bearer across under the plates at each frame, landed on the frames each side
        half = L.hull_x(S.FORE_STORE_FLAT - 0.10, z) - 0.10          # as wide as she is under the flat, where she is narrower than at it
        bearers.box((-half, S.FORE_STORE_FLAT - 0.09, z - 0.03), (half, S.FORE_STORE_FLAT - PLATE_T, z + 0.03), dark)
    made += [flat, bearers]
    return made


def hatch_hinge(l):
    """A hatch cover's hinge: a point on it and its direction. Along the edge behind the ladder."""
    x0, x1, ya, yb = S.hatch_opening(l)
    cx, cz = S.ladder_side(l)
    y = l['head'] - 0.004
    if cx:
        return [x0 + 0.004 if cx > 0 else x1 - 0.004, y, L.Z((ya + yb) / 2)], [0, 0, 1], (1 if cx > 0 else -1)
    return [(x0 + x1) / 2, y, L.Z(ya + 0.004 if cz > 0 else yb - 0.004)], [1, 0, 0], (-1 if cz > 0 else 1)


def way_aft():
    """
    The three watertight doors and the walkway through the shaft space (spec.WT_DOORS, spec.WALKWAY).

    A door: a frame of flat bar round the opening, standing 5 cm proud of the bulkhead each side (its lower side is the
    sill one steps over, its upper side the head one stoops under); a leaf of 20 mm with a pressed panel, lying against
    the frame on the side it opens to; six dogs round its edge and the handwheel that works them; two hinges to port.
    The leaf, its dogs and the wheel turn together (a mover named as the door); the frame and the hinges' lugs stand.
    """
    D, W = S.WT_DOOR, S.WALKWAY
    grey, dark, steel, yellow = srgb(S.DOOR_GREY), srgb(S.DARK_GREY), srgb(S.STEEL), srgb(S.RAIL_YELLOW)
    frames = Part('Watertight doors, frames', 'Machinery paint')
    walk = Part('Shaft space walkway', 'Floor plate')
    rails = Part('Shaft space walkway, rails and bearers', 'Machinery paint', smooth=True, angle=40)
    made = [frames, walk, rails]
    r, fw = D['corner'], D['frame']
    for d in S.WT_DOORS:
        x0, y0, x1, y1 = S.door_opening(d)
        za, zb = (L.Z(v) for v in S.door_frame_yards(d))
        cx, cy = d.get('x', 0.0), (y0 + y1) / 2
        inward = lambda c, cx=cx, cy=cy: (cx - c[0], cy - c[1], 0)
        outward = lambda c, cx=cx, cy=cy: (c[0] - cx, c[1] - cy, 0)
        # ---- The frame: two faces, the lining of the opening, and its outer edge.
        for z, look in ((za, -1), (zb, 1)):
            start = len(frames.f)
            frames.polygon(round_rect(x0 - fw, y0 - fw, x1 + fw, y1 + fw, r + fw, z), grey, [round_rect(x0, y0, x1, y1, r, z)])
            frames.orient(start, (0, 0, look))
        start = len(frames.f)
        frames.grid([round_rect(x0, y0, x1, y1, r, za), round_rect(x0, y0, x1, y1, r, zb)], tint(grey, 0.9), close=True)
        frames.orient(start, inward)
        start = len(frames.f)
        frames.grid([round_rect(x0 - fw, y0 - fw, x1 + fw, y1 + fw, r + fw, za), round_rect(x0 - fw, y0 - fw, x1 + fw, y1 + fw, r + fw, zb)], tint(grey, 0.95), close=True)
        frames.orient(start, outward)
        # ---- The leaf.
        zf, side = _door_face(d)
        hx, hz = _door_hinge(d)
        near, far = zf + side * 0.004, zf + side * (0.004 + D['leaf'])           # against the frame, and its outer face
        leaf = Part(f"Watertight door, {d['where']}", 'Machinery paint', mover=d['id'])
        gear = Part(f"Watertight door, {d['where']}, dogs and wheel", 'Shaft steel', smooth=True, angle=40, mover=d['id'])
        over = 0.035
        edge = lambda z: round_rect(x0 - over, y0 - over, x1 + over, y1 + over, r + over, z)
        for z, look in ((near, -side), (far, side)):
            start = len(leaf.f)
            leaf.polygon(edge(z), grey)
            leaf.orient(start, (0, 0, look))
        start = len(leaf.f)
        leaf.grid([edge(near), edge(far)], tint(grey, 0.9), close=True)
        leaf.orient(start, outward)
        # The pressed panel that stiffens it, on the outer face.
        a, b = sorted((far, far + side * 0.012))
        leaf.box((x0 + 0.09, y0 + 0.16, a), (x1 - 0.09, y1 - 0.16, b), tint(grey, 1.04))
        # Hinge blades from the leaf's port edge to the pins.
        for hy in (y0 + 0.28, y1 - 0.28):
            a, b = sorted((near + side * 0.003, far - side * 0.003))
            leaf.box((x1 + over - 0.02, hy - 0.035, a), (hx, hy + 0.035, b), tint(grey, 0.82))
            _cyl(gear, (hx, hy - 0.05, hz), (hx, hy + 0.05, hz), 0.014, steel, sides=10)
            # The lug on the bulkhead that carries the pin, above and below the blade.
            for ly in (hy - 0.075, hy + 0.05):
                a, b = sorted((zf, hz + side * 0.014))
                # (it reaches 5 mm onto the frame's flange: narrower, it stood beside the frame and, where no wall is beside
                # the frame, on nothing: the steering gear's door hung on its seal's 4 mm of air)
                frames.box((hx - 0.045, ly, a), (hx + 0.035, ly + 0.025, b), tint(grey, 0.8))
        # Six dogs: a lever over the frame at each, on a boss through the leaf.
        for dx, sx in ((x0 + 0.02, -1), (x1 - 0.02, 1)):
            for dy in (y0 + 0.2, cy, y1 - 0.2):
                _cyl(gear, (dx, dy, far), (dx, dy, far + side * 0.03), 0.022, steel, sides=10)
                a, b = sorted((far + side * 0.012, far + side * 0.026))
                gear.box((min(dx, dx + sx * 0.085), dy - 0.016, a), (max(dx, dx + sx * 0.085), dy + 0.016, b), steel)
        # The handwheel in the middle of the leaf: hub, three spokes, rim.
        wz = far + side * 0.012
        _cyl(gear, (cx, cy, wz), (cx, cy, wz + side * 0.06), 0.028, steel, sides=12)
        rim0, rim1 = sorted((0.04, 0.062))
        _revolve(gear, (cx, cy, wz), (0, 0, side), [(rim0, 0.13), (rim0, 0.155), (rim1, 0.155), (rim1, 0.13), (rim0, 0.13)], steel, sides=24)
        for k in range(3):
            ang = pi / 2 + 2 * pi * k / 3
            _cyl(gear, (cx, cy, wz + side * 0.05), (cx + 0.14 * cos(ang), cy + 0.14 * sin(ang), wz + side * 0.05), 0.009, steel, sides=8)
        made += [leaf, gear]

    # ---- The way through the shaft space: a platform at the level of the engine room's after flat inside the door, five
    # treads up, and a flat at the level of the steering gear's as far as its door (spec.WALKWAY).
    low, high = S.ER_AFT_FLAT, S.STEERING_FLAT
    rise = (high - low) / (W['treads'] + 1)
    levels = [(W['platform'][0], W['platform'][1], low)]             # (yard aft end, yard forward end, height), going aft
    for k in range(1, W['treads'] + 1):
        fwd = W['platform'][0] - W['going'] * (k - 1)
        levels.append((fwd - W['going'], fwd + 0.02, low + rise * k))
    head = W['platform'][0] - W['going'] * W['treads']
    levels.append((W['flat'][0], head + 0.02, high))
    posts = [W['platform'][1] - 0.06, W['platform'][0]] + [W['platform'][0] - W['going'] * k for k in (2, 4)] + [head, 7.6, 6.5, 5.5, W['flat'][0] + 0.1]
    _walkway(walk, rails, 0.0, W['half'], levels, {1: posts, -1: posts}, range(9, 18), W['rail'])

    # ---- The steps in the engine room, from its after flat down to the tank top at frame 24 (spec.ER_STEPS).
    E = S.ER_STEPS
    low, high = S.TANK_TOP, S.ER_AFT_FLAT
    rise = (high - low) / (E['treads'] + 1)
    er_walk = Part('Engine room steps', 'Floor plate')
    er_rails = Part('Engine room steps, rails and bearers', 'Machinery paint', smooth=True, angle=40)
    levels = [(E['at'] + E['going'] * (k - 1) - 0.02, E['at'] + E['going'] * k, high - rise * k) for k in range(1, E['treads'] + 1)]
    posts = [E['at'] + 0.03, E['at'] + E['going'] * E['treads'] - 0.03]
    _walkway(er_walk, er_rails, 0.0, E['half'], levels, {1: posts, -1: posts}, (), 0.95, floor=S.TANK_TOP)
    made += [er_walk, er_rails]
    for part in made:
        part.group = 'machinery'
    return made


def shafting():
    """The intermediate shafts and their fittings, in the engine room and the shaft space."""
    paint = Part('Shafting: couplings, bearings, seats', 'Machinery paint', smooth=True, angle=40)
    bright = Part('Intermediate shafts', 'Shaft steel', smooth=True, angle=40)
    for p in (paint, bright):
        p.group = 'machinery'
    steel, flange, green = srgb(S.STEEL), srgb(S.FLANGE), srgb(S.ENGINE_GREEN)
    g = S.GEARBOX_FLANGE
    bulkhead = S.fr(18)
    for side in (1, -1):
        x = side * X
        at = lambda yard: Vector((x, shaft_y(yard), L.Z(yard)))
        fwd = (at(9.0) - at(8.0)).normalized()
        along = lambda yard: (at(yard) - at(0)).length
        ring = lambda profile, colour, part=paint: _revolve(part, at(0), fwd, [(along(yd), r) for yd, r in profile], colour, sides=20)
        # The shaft, from the half coupling that will be bolted to the gearbox's flange to the coupling on the tail shaft.
        bright.tube(at(g['yard'] - 0.05), at(S.SHAFT_COUPLING), S.SHAFT_RADIUS, colour=steel, sides=16)
        bore = S.SHAFT_RADIUS
        ring([(g['yard'], bore), (g['yard'], g['radius']), (g['yard'] - 0.07, g['radius']), (g['yard'] - 0.08, bore)], flange)
        # The gland where it passes through the engine room's after bulkhead.
        ring([(bulkhead + 0.012, bore), (bulkhead + 0.012, 0.24), (bulkhead - 0.02, 0.24), (bulkhead - 0.02, 0.18), (bulkhead - 0.16, 0.18), (bulkhead - 0.17, bore)], flange)
        # The plummer block: its housing round the shaft, its foot, and the seat that carries it down to the after flat.
        pb = S.PLUMMER_BLOCK
        ring([(pb + 0.16, bore), (pb + 0.15, 0.21), (pb - 0.15, 0.21), (pb - 0.16, bore)], green)
        c = at(pb)
        foot = c.y - 0.26
        paint.box((x - 0.34, foot, c.z - 0.13), (x + 0.34, foot + 0.10, c.z + 0.13), green)
        paint.box((x - 0.30, S.ER_AFT_FLAT, c.z - 0.17), (x + 0.30, foot, c.z + 0.17), tint(srgb(S.PRIMER), 0.86))
        # The pair of flanges that couples it to the tail shaft.
        k = S.SHAFT_COUPLING
        ring([(k + 0.08, bore), (k + 0.07, 0.19), (k - 0.07, 0.19), (k - 0.08, bore)], flange)
    return [paint, bright]


def thruster_room():
    """The bow thruster's motor, upright on the crown of the tunnel: its seat, the lantern over the coupling, the motor of
    about 300 kW with its terminal box and its fan cowl. (Its starter and cable come with the machinery spaces.)"""
    gear = Part('Bow thruster motor', 'Machinery paint', smooth=True, angle=40)
    gear.group = 'machinery'
    t = S.THRUSTER
    zc, crown = L.Z(t['yard']), t['y'] + t['radius']
    blue, dark = srgb(S.MOTOR_BLUE), srgb(S.DARK_GREY)
    _revolve(gear, (0, crown - 0.03, zc), UP, [(0.0, 0.42), (0.10, 0.42), (0.10, 0.28), (0.55, 0.28), (0.55, 0.42), (0.61, 0.42)], dark, sides=24)
    _revolve(gear, (0, crown + 0.58, zc), UP, [(0.0, 0.42), (0.0, 0.38), (0.92, 0.38), (0.92, 0.39), (1.08, 0.39), (1.11, 0.28), (1.11, 0.0)], blue, sides=26)
    gear.box((0.36, crown + 0.86, zc - 0.14), (0.58, crown + 1.20, zc + 0.14), blue)
    for k in range(12):
        a = 2 * pi * k / 12 + 0.26
        if cos(a) > 0.85:
            continue
        gear.box((0.38 * cos(a) - 0.016, crown + 0.70, 0.38 * sin(a) + zc - 0.016), (0.38 * cos(a) + 0.016, crown + 1.44, 0.38 * sin(a) + zc + 0.016), tint(blue, 0.9))
    return [gear]


def chain_lockers():
    """The two chain lockers in the fore store, each on four legs on the flat, a door in its after side."""
    lockers = Part('Chain lockers', 'Primer')
    lockers.group = 'machinery'
    primer = srgb(S.PRIMER)
    za, zb = L.Z(59.7), L.Z(60.9)
    foot = S.FORE_STORE_FLAT + 0.30
    for side in (1, -1):
        xa, xb = sorted((side * 0.4, side * 1.3))
        lockers.box((xa, foot, za), (xb, L.CAR - 0.04, zb), primer)
        for lz in (za + 0.12, zb - 0.12):
            for lx in (xa + 0.12, xb - 0.12):
                lockers.box((lx - 0.04, S.FORE_STORE_FLAT, lz - 0.04), (lx + 0.04, foot, lz + 0.04), tint(primer, 0.84))
        lockers.box((xa + 0.25, foot + 0.35, za - 0.012), (xb - 0.25, foot + 1.10, za), tint(primer, 0.84))
    return [lockers]


def anchors():
    """A stockless anchor of about 1,300 kg each side of the bow, hove up into its hawse pipe: the head and flukes against the plating."""
    part = Part('Anchors', 'Machinery paint', smooth=True, angle=35)
    mouth = Part('Hawse pipe mouths', 'Marking')
    black = srgb(S.BLACK)
    m_ = 1.4                                                   # beside the first Chisum's 480 kg anchor
    for side in (1, -1):
        z = L.Z(62.2)
        psi = L.psi_at(1.05, z)
        m = Vector(L.shell_point(z, psi))
        n = Vector(L.shell_normal(z, psi))
        fwd = (Vector((0, 0, 1)) - n * n.z).normalized()
        up = n.cross(fwd) * -1
        if up.y < 0:
            up = -up
        place = lambda a, b, c: tuple(Vector((side, 1, 1)) * (m + fwd * (a * m_) + up * (b * m_) + n * (c * m_)))
        centre = Vector(place(0, 0, 0))
        out = Vector((side * n.x, n.y, n.z))
        # The bolster round the mouth of the pipe, and the dark of the pipe within it.
        _revolve(part, centre, out, [(0.0, 0.27 * m_), (0.045 * m_, 0.25 * m_), (0.07 * m_, 0.2 * m_), (0.06 * m_, 0.15 * m_), (0.0, 0.15 * m_)], srgb(S.WHITE), sides=22)
        start = len(mouth.f)
        mouth.polygon([place(0.15 * cos(2 * pi * k / 20), 0.15 * sin(2 * pi * k / 20), 0.004) for k in range(20)], tint(black, 0.6))
        mouth.orient(start, tuple(out))
        # The shank, up into the pipe; the head across its foot; the two flukes lying up the plating beside the pipe.
        def bar(points, colour=black):
            rows = [[place(*q) for q in ring] for ring in points]
            start = len(part.f)
            part.grid(rows, colour, close=True)
            mid = sum((Vector(q) for row in rows for q in row), Vector()) / sum(len(r) for r in rows)
            part.orient(start, lambda c: c - mid)
            for row, k in ((rows[0], 0), (rows[-1], -1)):
                start = len(part.f)
                part.polygon(row, colour)
                part.orient(start, lambda c: c - mid)
        sq = lambda a, b, c, w, h: [(a - w, b, c - h), (a + w, b, c - h), (a + w, b, c + h), (a - w, b, c + h)]
        bar([sq(0, -0.52, 0.12, 0.055, 0.05), sq(0, -0.05, 0.1, 0.05, 0.045), sq(0, 0.1, 0.03, 0.045, 0.04)])
        bar([[(-0.34, -0.66, 0.03), (0.34, -0.66, 0.03), (0.34, -0.66, 0.2), (-0.34, -0.66, 0.2)],
             [(-0.36, -0.46, 0.03), (0.36, -0.46, 0.03), (0.36, -0.46, 0.21), (-0.36, -0.46, 0.21)]])
        for k in (-1, 1):
            bar([[(k * 0.36, -0.5, 0.03), (k * 0.16, -0.5, 0.03), (k * 0.16, -0.5, 0.13), (k * 0.36, -0.5, 0.13)],
                 [(k * 0.4, -0.05, 0.03), (k * 0.2, -0.05, 0.03), (k * 0.2, -0.05, 0.1), (k * 0.4, -0.05, 0.1)],
                 [(k * 0.36, 0.3, 0.03), (k * 0.27, 0.3, 0.03), (k * 0.27, 0.3, 0.06), (k * 0.36, 0.3, 0.06)]])
    return [part, mouth]


def build():
    return steering_gear() + shafting() + way_aft() + ladders() + thruster_room() + chain_lockers() + anchors()
