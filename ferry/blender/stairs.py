"""
Her stairs: one standard, one builder.

The owner, 11 November 2026: "All stairs need to be traversable and fully realistic and standardised". The stairs she
inherited were eight of the other ship's, at 45 to 60 degrees with steps 15 to 20 cm deep: thin plates on two bars, with
a slanted bar for a handrail. Every stair aboard is now one line of spec.STAIRS, of one of the three classes of
spec.STAIR_CLASS, and is built here: steps, stringers, a soffit under a closed stair, handrails with their posts or
brackets, landings, and a marked edge on every step of a closed stair. `check` holds each stair to its class and the
build stops if one breaks it.

How a flight is measured. It comes down from the edge of the deck above, `top` = (metres from the transom, height). With
n steps of height `rise` it has n - 1 treads, each `going` long; the first tread lies one rise under the deck, with its
back under the deck's edge; after the last tread the deck below begins. So a flight is (n - 1) x going long, and its
pitch is the angle of the line through the treads' edges.

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward.
"""
from math import hypot
from mathutils import Vector
import lines as L
import spec as S
from shipyard import Part, srgb, tint

Z = L.Z
TREAD = dict(closed=0.040, open=0.030)          # a tread's own thickness
NOSE = 0.020                                    # a closed tread overhangs the step under it by this
YELLOW, GRIT, RAIL, DARK = srgb(0xe2b93b), srgb(0x4a5254), srgb(0xc9cfcf), srgb(S.DARK_GREY)


from stair_rules import flights, check, facts


def _clip(poly, a, b, c):
    """Keep the part of a polygon in the (yard, y) plane where a x yard + b x y >= c."""
    out = []
    for i, p in enumerate(poly):
        q = poly[(i + 1) % len(poly)]
        fp, fq = a * p[0] + b * p[1] - c, a * q[0] + b * q[1] - c
        if fp >= 0:
            out.append(p)
        if fp * fq < 0:
            t = fp / (fp - fq)
            out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def _slab(part, x0, x1, profile, colour):
    """A solid from an outline in (yard, y) pushed from x0 to x1."""
    if len(profile) < 3:
        return
    x0, x1 = sorted((x0, x1))
    ring = lambda x: [(x, y, Z(yd)) for yd, y in profile]
    start = len(part.f)
    part.grid([ring(x0), ring(x1)], colour, close=True)
    for x in (x0, x1):
        part.polygon(ring(x), colour)
    mx = (x0 + x1) / 2
    my = sum(y for _, y in profile) / len(profile)
    mz = sum(Z(yd) for yd, _ in profile) / len(profile)
    part.orient(start, lambda c: (c[0] - mx, c[1] - my, c[2] - mz))


def _box(part, x0, x1, yd0, yd1, y0, y1, colour):
    x0, x1 = sorted((x0, x1))
    yd0, yd1 = sorted((yd0, yd1))
    y0, y1 = sorted((y0, y1))
    part.box((x0, y0, Z(yd0)), (x1, y1, Z(yd1)), colour)


def _rail(part, x, pts, r, colour):
    """A round bar through points in (yard, y) at one x."""
    for (a, ya), (b, yb) in zip(pts, pts[1:]):
        if hypot(b - a, yb - ya) > 1e-4:
            part.tube((x, ya, Z(a)), (x, yb, Z(b)), r, None, colour=colour, sides=10)


def build_stair(st):
    """One stair, as its parts in the viewer's part it belongs to."""
    c = S.STAIR_CLASS[st['cls']]
    closed = c['tread'] == 'closed'
    title = f"Stair, {st['name']}"
    paint = srgb(st.get('paint', S.LIGHT_GREY))
    steel = Part(f'{title}, structure', 'Topside paint' if st.get('paint') == S.WHITE else 'Machinery paint')
    tread = Part(f'{title}, treads', 'Deck covering' if closed else 'Floor plate')
    rails = Part(f'{title}, handrails', 'Shaft steel', smooth=True, angle=40)
    marks = Part(f'{title}, step edges', 'Marking')
    x0, x1 = sorted(st['x'])
    d, r, g = st['down'], st['rise'], st['going']
    t = TREAD[c['tread']]
    wide = 0.012                                             # a stringer's thickness, outside the clear width
    tread_colour = srgb(0x6f7d7c) if closed else srgb(S.FLOOR_PLATE)
    legs, (foot_yard, foot_y) = flights(st)
    rail_x = []
    for side, x in zip(st['sides'], (x0, x1)):
        out = -1 if x == x0 else 1
        # on an open side the rail stands on the stringer; at a wall it is held off the wall, inside the clear width
        rail_x.append((x + out * wide / 2 if side == 'open' else x - out * 0.055, side, out))

    h = c['rail']
    top_yard, top_y = st['top']
    ext = st.get('top_ext', 0.30)                                            # how far the rail runs on over the deck above
    path = [(top_yard - d * ext, top_y + h), (top_yard, top_y + h)]          # the handrail's line, from the deck above down
    for kind, yard, y, n in legs:
        if kind == 'landing':
            length = n
            _box(steel, x0 - wide, x1 + wide, yard, yard + d * length, y - 0.050, y - 0.006, paint)
            _box(tread, x0, x1, yard, yard + d * length, y - 0.006, y, tread_colour)
            path.append((yard + d * length, y + h))
            continue
        run = (n - 1) * g
        # ---- treads: n - 1 of them, the k-th one k rises under the deck, its back under the edge above
        for k in range(1, n):
            hk = y - k * r
            back, edge = yard + d * (k - 1) * g, yard + d * k * g
            if closed:
                _box(tread, x0, x1, back - d * NOSE, edge, hk - t, hk, tread_colour)
                _box(steel, x0, x1, edge - d * NOSE - d * 0.006, edge - d * NOSE, hk - r + 0.001, hk - t, tint(paint, 0.9))        # the riser under its edge
                _box(marks, x0 + 0.01, x1 - 0.01, edge - d * 0.045, edge - d * 0.004, hk + 0.0004, hk + 0.0024, YELLOW)            # the marked edge
            else:
                depth = max(g + 0.035, 0.185)                # an open tread laps under the one above
                _box(tread, x0, x1, edge - d * depth, edge, hk - t, hk, tread_colour)
                _box(steel, x0, x1, edge - d * 0.012, edge, hk - t - 0.004, hk + 0.003, DARK)                                      # its nosing bar
        if closed:
            _box(steel, x0, x1, yard, yard + d * 0.006, y - r + 0.001, y - 0.012, tint(paint, 0.9))                               # the top riser, under the deck's edge
        # ---- stringers: a plate each side along the pitch, standing on the deck below and ending at the deck above
        up = 0.060 if closed else 0.045                      # how far the plate stands over the treads' edges
        deep = (r + t + 0.14) if closed else 0.17
        slope = r / g
        top_line = lambda yd, y=y, yard=yard: y + up - slope * abs(yd - yard)       # over the edges
        far = yard + d * (run + g + 0.20)
        low = y - n * r
        para = [(yard, top_line(yard)), (far, top_line(far)), (far, top_line(far) - deep), (yard, top_line(yard) - deep)]
        para = _clip(para, 0.0, 1.0, low + 0.004)                                   # it stands on the deck below
        for x, side, out in rail_x:
            xs = x0 if out < 0 else x1
            _slab(steel, xs, xs + out * wide, para, paint)
        # ---- a soffit under a closed flight, so that it is closed from below
        if closed:
            under = lambda yd, y=y, yard=yard: y - r - t - 0.020 - slope * abs(yd - yard)
            soffit = [(yard, under(yard)), (far, under(far)), (far, under(far) - 0.010), (yard, under(yard) - 0.010)]
            soffit = _clip(soffit, 0.0, 1.0, low + 0.004)
            _slab(steel, x0, x1, soffit, tint(paint, 0.94))
        path.append((yard + d * run, y - (n - 1) * r + h))                          # over the last tread's edge
        path.append((yard + d * (run + g), y - n * r + h))                          # and on, one going, to the level below

    # ---- handrails: 0.90 m over the line of the steps' edges and over a landing; a newel at the top and at the foot
    for x, side, out in rail_x:
        _rail(rails, x, path, 0.019, RAIL)
        if st.get('top_newel', True):
            rails.tube((x, top_y + 0.004, Z(path[0][0])), (x, path[0][1], Z(path[0][0])), 0.019, None, colour=RAIL, sides=10)
        # (on an open side the newel stands in the stringer, its foot inside it; at a wall it stands on the deck)
        rails.tube((x, foot_y + (0.02 if side == 'open' else 0.004), Z(path[-1][0])), (x, path[-1][1], Z(path[-1][0])), 0.019, None, colour=RAIL, sides=10)
        if side == 'open':
            # a knee rail halfway up, and posts from the stringer about every 0.9 m
            _rail(rails, x, [(yd, yy - h / 2) for yd, yy in path], 0.012, RAIL)
            for (a, ya), (b, yb) in zip(path[1:], path[2:]):
                count = max(1, int(round(hypot(b - a, yb - ya) / 0.9)))
                for i in range(1, count):
                    f = i / count
                    yd, yy = a + (b - a) * f, ya + (yb - ya) * f
                    rails.tube((x, yy - h + 0.03, Z(yd)), (x, yy, Z(yd)), 0.012, None, colour=RAIL, sides=8)
        else:
            # brackets to the wall about every 0.9 m
            wall = x + out * (0.055 + st.get('gaps', (0.0, 0.0))[0 if out < 0 else 1] + 0.002)       # 2 mm into the wall
            for (a, ya), (b, yb) in zip(path[1:], path[2:]):
                count = max(1, int(round(hypot(b - a, yb - ya) / 0.9)))
                for i in range(count + 1):
                    f = i / count
                    yd, yy = a + (b - a) * f, ya + (yb - ya) * f
                    rails.tube((x, yy - 0.035, Z(yd)), (wall, yy - 0.035, Z(yd)), 0.008, None, colour=RAIL, sides=6)
                    rails.tube((x, yy - 0.035, Z(yd)), (x, yy, Z(yd)), 0.008, None, colour=RAIL, sides=6)
    parts = [steel, tread, rails] + ([marks] if closed else [])
    for p in parts:
        p.group = st['part']
    return parts


WALL, TEAL, DOOR, WOOD = srgb(0xeeeae0), srgb(0x2f6f74), srgb(0x5d6b6a), srgb(0x8d6f4c)
DOORS = []                                      # the sliding doors' motions, for motion()


def _sign(part, centre, normal, w, h, name, proud=0.002):
    """A picture of her sheet, w by h, upright on a wall that looks along `normal`."""
    c, n, u = Vector(centre), Vector(normal).normalized(), Vector((0, 1, 0))
    r = u.cross(n)
    c = c + n * proud
    part.picture([tuple(c - r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) - u * (h / 2)),
                  tuple(c + r * (w / 2) + u * (h / 2)), tuple(c - r * (w / 2) + u * (h / 2))], name)


def main_stair_fitout(st):
    """
    What stands round a main stair (spec.MAIN_STAIR), port or starboard: the trim of its well in the passenger deck and the
    guard along it; the lining that brings its outboard wall in line; the plate in the other ship's doorway; its foot
    lobby and the sliding fire door from the car deck, with the zone kept clear before it.
    """
    M = S.MAIN_STAIR
    s = st['main']
    title = f"Stair, {st['name']}"
    x_in, x_out = M['wall']
    T, W = M['well']
    y0, y1 = M['slab']
    parts = []

    def part(key, look, group, **kw):
        p = Part(f'{title}, {key}', look, **kw)
        p.group = group
        parts.append(p)
        return p

    B = lambda p, xa, xb, a, b, ya, yb, colour: _box(p, s * xa, s * xb, a, b, ya, yb, colour)

    # ---- on the passenger deck: the well's trim and the guard along it
    trim = part('well trim', 'Bulkhead paint', 'passenger')
    cap = part('guard rail', 'Varnished wood', 'passenger')
    B(trim, x_in - 0.06, x_in, T, W, y0, y1 - 0.001, WALL)                                   # inboard, in line with the casing's wall below
    B(trim, x_out, M['plate'], T, W, y0, y1 - 0.001, WALL)                                   # outboard, in line with the lobby's wall above
    B(trim, x_in, x_out, T - 0.004, T, y0, y1 - 0.001, WALL)                                 # under the top step
    G = M['guard']
    top = y1 + G['height'] - G['cap']
    B(trim, x_in - 0.06, x_in, T - 0.05, 9.46, y1, top, WALL)                                # the guard: a lined panel to the lobby's forward wall
    B(trim, x_in - 0.064, x_in - 0.06, T - 0.05, 9.46, y1 + 0.008, y1 + 0.088, DARK)         # its skirting, on the lobby's side
    B(cap, x_in - 0.075, x_in + 0.015, T - 0.065, 9.46, top, top + G['cap'], WOOD)           # and its capping rail

    # ---- on the car deck: the enclosure
    wall = part('enclosure', 'Bulkhead paint', 'car')
    lobby, door, old = M['lobby'], M['door'], M['old_door']
    end = lobby['yard'][1] if s < 0 else 13.26                                               # to port the side door's frame stands at 13.26 m
    start = M['pocket']['yard'][0] if s < 0 else T
    B(wall, x_out, M['plate'] - 0.002, start, end, st['foot'], y0, WALL)                     # the lining on the outboard wall
    B(wall, x_in - 0.06, x_in, old['yard'][0], old['yard'][1], st['foot'], st['foot'] + old['height'], WALL)       # the other ship's doorway, plated in
    if s < 0:
        # The casing is drawn solid here: the pocket the top steps stand in, and the foot lobby cut out of the forward block.
        (pa, pb), (py0, py1) = M['pocket']['yard'], M['pocket']['y']
        B(wall, x_in, x_out, pa, pb - 0.004, py0 - 0.04, py0, WALL)          # (their forward ends inside the block, not in its face)
        B(wall, x_in, x_out, pa - 0.04, pa, py0, py1, WALL)
        B(wall, x_in - 0.05, x_in, pa, pb - 0.004, py0, py1, WALL)
        a, b = lobby['yard']
        head = lobby['head']
        for ya, yb, lo, hi in ((a, door['yard'][0], st['foot'], head), (door['yard'][1], b, st['foot'], head),
                               (door['yard'][0], door['yard'][1], st['foot'] + door['height'], head)):
            B(wall, x_in - 0.058, x_in, ya, yb, lo, hi, WALL)                                # the inboard wall, round the doorway
        B(wall, x_in, M['plate'], b, b + 0.06, st['foot'], head, WALL)                       # the forward wall
        B(wall, x_in, M['plate'], a + 0.004, b, head, head + 0.06, WALL)                     # the deckhead (its after edge inside the block, not in its face)
        B(wall, 3.50, 3.80, 13.40, 13.90, head - 0.045, head, srgb(0xf3efe2))                # its light

    # ---- the doorway from the car deck and its sliding fire door
    frame = part('door frame', 'Machinery paint', 'car')
    a, b = door['yard']
    f0, f1 = st['foot'], st['foot'] + door['height']
    xa, xb = x_in - 0.07, x_in + 0.01                                                        # a centimetre proud of the wall each side
    B(frame, xa, xb, a, a + 0.02, f0, f1, TEAL)
    B(frame, xa, xb, b - 0.02, b, f0, f1, TEAL)
    B(frame, xa, xb, a + 0.02, b - 0.02, f1 - 0.03, f1, TEAL)
    B(frame, xa, xb, a + 0.02, b - 0.02, f0, f0 + door['sill'], srgb(0x7d8586))              # the sill
    run = door['run']
    B(frame, x_in, x_in + 0.07, a - 0.06, b + run + 0.06, f1 + 0.02, f1 + 0.10, srgb(0x7d8586))            # the track the leaf hangs from, on the wall
    B(frame, x_in, x_in + 0.06, b + run + 0.02, b + run + 0.06, f0, f0 + 0.10, srgb(0x7d8586))             # the stop it runs against
    mover = f"door-{st['id']}"
    leaf = part('door, steel', 'Machinery paint', 'car', mover=mover)
    grip = part('door, fittings', 'Shaft steel', 'car', mover=mover)
    face = part('door, sign', 'Panel face', 'car', mover=mover)
    la, lb = a - 0.04, b + 0.04
    B(leaf, x_in + 0.015, x_in + 0.055, la, lb, f0 + 0.02, f1 + 0.02, DOOR)
    for k in (0.18, 0.82):                                                                   # the two hangers on the track
        m = la + (lb - la) * k
        B(grip, x_in + 0.02, x_in + 0.05, m - 0.05, m + 0.05, f1 + 0.012, f1 + 0.06, RAIL)
    B(grip, x_in + 0.055, x_in + 0.065, la + 0.06, la + 0.09, f0 + 0.95, f0 + 1.25, RAIL)    # a pull inside, at the closing edge
    B(grip, x_in + 0.013, x_in + 0.015, la + 0.07, la + 0.12, f0 + 0.98, f0 + 1.22, DARK)    # and a flush one outside, which passes the frame
    _sign(face, (s * (x_in + 0.055), f0 + 1.55, Z((la + lb) / 2)), (s, 0, 0), 0.46, 0.115, 'car_deck')
    _sign(face, (s * (x_in + 0.015), f0 + 1.55, Z((la + lb) / 2)), (-s, 0, 0), 0.46, 0.115, 'fire_door')
    DOORS.append(dict(id=mover, name=f"Fire door, car deck to the {'port' if s > 0 else 'starboard'} main stair", max=round(run * 100),
                      at=[s * (x_in - 0.03), st['foot'], Z((a + b) / 2)], normal=[s, 0, 0]))
    signs = part('signs', 'Panel face', 'car')
    _sign(signs, (s * (x_in - 0.06), f1 + 0.20, Z((a + b) / 2)), (-s, 0, 0), 0.72, 0.18, 'stairs_up')       # over the door, on the lanes
    # ---- the zone kept clear before the door, on the car deck
    marks = part('kept clear', 'Marking', 'car')
    zx0, zx1 = x_in - 0.06 - 1.00, x_in - 0.07
    ya, yb = a - 0.05, b + 0.05
    hy = st['foot'] + 0.0005
    for edge in ((zx0, zx0 + 0.06, ya, yb), (zx0, zx1, ya, ya + 0.06), (zx0, zx1, yb - 0.06, yb)):
        B(marks, edge[0], edge[1], edge[2], edge[3], hy, hy + 0.002, YELLOW)
    n = 5
    for k in range(n):                                                                       # hatched: bars athwartships
        m = ya + 0.06 + (yb - ya - 0.12) * (k + 0.5) / n
        B(marks, zx0 + 0.06, zx1, m - 0.03, m + 0.03, hy, hy + 0.002, YELLOW)
    return parts


def motion():
    """Each main stair's door from the car deck slides forward inside its lobby, and opens for whoever comes near on foot."""
    inputs, movers = [], []
    for d in DOORS:
        inputs.append(dict(id=d['id'], name=d['name'], min=0, max=d['max'], step=1, unit='cm', below='', above='open', rest='shut', auto='near',
                           at=d['at'], normal=d['normal'], reach=1.7))
        movers.append(dict(id=d['id'], kind='slide', input=d['id'], axis=[0, 0, 1], pivot=[0, 0, 0], ratio=0.01))
    return inputs, movers


def build():
    out = []
    bad = []
    DOORS.clear()
    for st in S.STAIRS:
        wrong = check(st)
        if wrong:
            bad.append(f"{st['id']} ({S.STAIR_CLASS[st['cls']]['name']}): " + '; '.join(wrong))
        out += build_stair(st)
        if st.get('main'):
            out += main_stair_fitout(st)
    if bad:
        raise SystemExit('stairs outside the standard:\n  ' + '\n  '.join(bad))
    for st in S.STAIRS:
        f = facts(st)
        print(f"stair {f['id']:12s} {S.STAIR_CLASS[f['cls']]['name']:16s} {f['steps']:2d} steps of {f['rise'] * 1000:.0f} mm, going {f['going'] * 1000:.0f} mm, "
              f"{f['pitch']:.1f}°, {f['width']:.2f} m wide, from {f['top'][1]:.2f} m at {f['top'][0]:.2f} to {f['foot'][1]:.2f} m at {f['foot'][0]:.2f}")
    return out
