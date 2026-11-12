"""
Her deck outfit: every fitting of spec.OUTFIT stood in its place, from the yard's library of deck fittings (fittings.py).

The arrangement gives each fitting its place and says why (ga.STATIONS, spec.OUTFIT); the library draws the fitting and
knows nothing of the ship; this file is the fitter between them. For each place it works out the point of the deck under the
fitting, turns the fitting the way the place asks, and stands it to the deck it is on:

  - the upper deck rises with her sheer forward of the house (lines.deck_y): a fitting there stands square to the deck, not
    to the waterline;
  - a chock in a bulwark leans with the bulwark (her bow flares: the place's `lean`);
  - each kind has its own origin and front in the library, and the place says where the fitting's middle is and which way
    its front faces: `HOW` below turns the one into the other, kind by kind.

A fitting that is worked where it stands (a lifeboat's davit and falls, a windlass, a foam monitor) is marked `local`: the
page gives it no icon on its rail, and its keys come up when the fitting itself is tapped.

What is not done here, and is owed: the openings the library asks for in what a fitting stands on (`cuts`: a ventilator's
trunk through the deck, a windlass's pipes) are not cut, so nothing is seen of a fitting from the room under it; lashing
pots stand on the deck's plating (`sunk=False`) for the same reason.
"""
from math import atan, atan2, cos, degrees, radians, sin
import lines as L
import spec as S
import ga
import steel
import fittings

PLATE = 0.012                  # the bulwark's plating, as the shell is drawn
_done = dict(parts=[], inputs=[], movers=[], rows=[], owed=[])


def _deck(o):
    """The deck a place is on: (the viewer's part its fittings belong to, the deck's height over the waterline there, its
    slope along her in radians: the upper deck rises with her sheer)."""
    name, z = o['deck'], L.Z(o.get('yard', 0.0))
    plan = steel.PLANS.get(name)
    group = plan['group'] if plan else 'upper'
    flat = plan['floor'] if plan else L.Y(ga.DECKS[name])
    if name == 'upper' and o.get('yard', 0.0) > L.SHEER_FROM:
        y = L.deck_y(z)
        d = 0.25
        slope = atan2(L.deck_y(L.Z(o['yard'] + d)) - L.deck_y(L.Z(o['yard'] - d)), 2 * d)
        return group, y, slope
    return group, flat, 0.0


def _turn(v, k, c, s):
    """A direction turned about the unit axis k (Rodrigues), cos and sin of the angle given."""
    kv = k[0] * v[0] + k[1] * v[1] + k[2] * v[2]
    cx, cy, cz = k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]
    return (v[0] * c + cx * s + k[0] * kv * (1 - c), v[1] * c + cy * s + k[1] * kv * (1 - c), v[2] * c + cz * s + k[2] * kv * (1 - c))


def _tilt(got, at, k, angle):
    """Lean a whole fitting about the axis k through the point `at`: its parts, and what its motions turn about."""
    if abs(angle) < 1e-4:
        return
    c, s = cos(angle), sin(angle)
    point = lambda p: tuple(a + b for a, b in zip(at, _turn((p[0] - at[0], p[1] - at[1], p[2] - at[2]), k, c, s)))
    for part in got['parts']:
        part.v = [point(p) for p in part.v]
        part.n = [None if n is None else _turn(n, k, c, s) for n in part.n]
    for m in got['movers']:
        for key in ('pivot', 'anchor', 'pin', 'point', 'at'):
            if key in m and m[key] is not None and len(m[key]) == 3:
                m[key] = list(point(m[key]))
        if m.get('axis') is not None:
            m['axis'] = list(_turn(m['axis'], k, c, s))
    for i in got['inputs']:
        if i.get('at') is not None and len(i['at']) == 3:
            i['at'] = list(point(i['at']))


# How each kind is called: what is added to the place's heading (the library's front is not always the place's "front"),
# and the options it is given. A kind not named here is called as the place says.
HOW = {
    'liferaft': dict(turn=180),             # the library's canister looks inboard; the place says outboard
    'panama-chock': dict(turn=180),         # the library's chock looks out from the wall; the place gives the wall's outer face
    'floodlight': dict(turn=180),           # the library's lamp stands at a rail and looks back inboard; the place says where it shines
}


def _stand(o):
    kind = o['kind']
    group, y, slope = _deck(o)
    z = L.Z(o['yard'])
    x, heading = o['x'], (o.get('heading', 0) + HOW.get(kind, {}).get('turn', 0)) % 360
    side = 1 if x >= 0 else -1
    more = {k: v for k, v in o.items() if k in ('dia', 'persons', 'length', 'nominal', 'serves')}
    if kind == 'lifeboat-station':
        # the library's origin is the deck's edge abreast the boat's middle, x outboard and her bow forward; the place is the
        # middle of the station's footprint, 1.8 m inboard of that edge
        # (the least breadth along the station's length: forward of amidships her side draws in, and a station set to the
        # edge abreast its middle had its forward end rail 12 mm outside the deck)
        edge = min(L.upper_breadth(L.Z(o['yard'] + d)) for d in (-4.45, -2.2, 0.0, 2.2, 4.45))
        x, heading = side * edge, 0
        more.update(side=side, height=y, rescue=side > 0, number=2 if side > 0 else 1, ship=S.SHIP_NAME.upper(), port=S.PORT_OF_REGISTRY)
    elif kind == 'panama-chock':
        # on the deck at the bulwark's inboard face; it leans with the bulwark
        x = side * (L.upper_breadth(z) - PLATE)
        more.update(t=PLATE)
    elif kind == 'windlass':
        stop = next((p for p in S.OUTFIT if p['kind'] == 'chain-stopper' and (p['x'] >= 0) == (x >= 0)), None)
        if stop:
            more.update(lead=round(stop['yard'] - o['yard'], 3))
    elif kind == 'chain-stopper' and hasattr(S, 'HAWSE'):
        more.update(hawse=round(S.HAWSE['deck_yard'] - o['yard'], 3))
    at = (x, y, z)
    try:
        got = fittings.build(kind, at, heading=heading, group=group, name=o['id'], **more)
    except TypeError:                       # an option the fitting does not take: build it as it comes
        got = fittings.build(kind, at, heading=heading, group=group, name=o['id'])
    if slope:
        _tilt(got, at, (1.0, 0.0, 0.0), -slope)                                   # square to the sheered deck: its forward end rises
    if kind == 'panama-chock' and o.get('lean'):
        h = radians(o.get('heading', 0))
        _tilt(got, at, (cos(h), 0.0, -sin(h)), radians(o['lean']))                # with the bulwark: its head goes outboard
    return got


def _grid(o):
    """Lashing pots at every crossing of a grid: one fitting of few parts."""
    group, y, _ = _deck(dict(o, yard=o['grid']['yard'][0]))
    (y0, y1, dy), (x0, x1, dx) = o['grid']['yard'], o['grid']['x']
    nz, nx = int(round((y1 - y0) / dy)) + 1, int(round((x1 - x0) / dx)) + 1
    return fittings.lashing_grid((x0, y, L.Z(y0)), nx, nz, dx, dy, heading=0, group=group, name=o['id'], sunk=False)


def build():
    made = []
    for o in S.OUTFIT:
        try:
            got = _grid(o) if 'grid' in o else _stand(o)
        except Exception as e:              # a place the library cannot fill yet is said, not passed over
            _done['owed'].append(f"{o['id']} ({o['kind']}): {type(e).__name__}: {e}")
            continue
        for i in got['inputs']:
            i['local'] = True               # worked where it stands: no icon on the page's rail
        made += got['parts']
        _done['inputs'] += got['inputs']
        _done['movers'] += got['movers']
        _done['rows'].append((o['id'], o['kind'], len(got['parts']), len(got.get('cuts', ()))))
    kinds = {}
    for _, kind, n, _c in _done['rows']:
        kinds[kind] = kinds.get(kind, 0) + 1
    print(f"deck outfit: {len(_done['rows'])} of {len(S.OUTFIT)} places fitted ({', '.join(f'{n} {k}' for k, n in sorted(kinds.items()))}); "
          f"{len(_done['inputs'])} worked where they stand, {len(_done['movers'])} motions")
    for line in _done['owed']:
        print('  not fitted:', line)
    return made


def motion():
    return _done['inputs'], _done['movers']
