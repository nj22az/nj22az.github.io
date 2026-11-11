"""
Her stairs: one standard, one builder.

The owner, 11 November 2026: "All stairs need to be traversable and fully realistic and standardised". Every stair aboard
is one line of spec.STAIRS, of one of the three classes of
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


def build():
    out = []
    bad = []
    for st in S.STAIRS:
        wrong = check(st)
        if wrong:
            bad.append(f"{st['id']} ({S.STAIR_CLASS[st['cls']]['name']}): " + '; '.join(wrong))
        out += build_stair(st)
    if bad:
        raise SystemExit('stairs outside the standard:\n  ' + '\n  '.join(bad))
    for st in S.STAIRS:
        f = facts(st)
        print(f"stair {f['id']:12s} {S.STAIR_CLASS[f['cls']]['name']:16s} {f['steps']:2d} steps of {f['rise'] * 1000:.0f} mm, going {f['going'] * 1000:.0f} mm, "
              f"{f['pitch']:.1f}°, {f['width']:.2f} m wide, from {f['top'][1]:.2f} m at {f['top'][0]:.2f} to {f['foot'][1]:.2f} m at {f['foot'][0]:.2f}")
    return out
