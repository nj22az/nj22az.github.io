"""
Her light fittings: a marine fluorescent fitting under the deckhead of every enclosed space, hung by rule.

The light of every place aboard is traced through her as built (light.py), and a space with no window and no lamp is dark.
So every enclosed room of the general arrangement (ga.py) is given its lamps here, as a ship has them, and the rooms then
light themselves: the tracing takes a surface that gives out light for a lamp.

**The fitting** (JSY-STD-404: its parts, its fastening, how it is fed). A two-tube fluorescent fitting of the kind every
ship of her time carried in her working spaces:
  - a body of sheet steel, 1.27 m by 0.16 m by 0.07 m, in white enamel, with an end cap each end;
  - under it the diffuser, an opal trough 1.21 m long, which is what gives out the light (the look `Lamp diffuser`), held
    by two clips each side;
  - two hangers, each a flat bar of 40 mm by 6 mm from a foot plate welded under the deck's plating down to a lug on the
    body's top (JSY-STD-402: a hanger is a section of 40 mm or more, and is seen to carry what hangs on it);
  - a cable gland on the body's top beside one hanger, and the cable up that hanger to a saddle on the deckhead: 0.3 m or
    less of free cable. The feeder along the deckhead comes with her electrical installation, and is not here.

**The rule.**
  - One fitting for every 9 to 12 m² of deck: a room of a breadth and b length gets round(a / 3.2) rows of round(a b / 10.5
    / rows) fittings, never less than one.
  - In rows fore and aft, each fitting between two beams: the deck's beams stand at the even frames, so a fitting hangs at
    an odd frame, lying across the ship. In a space under 1.6 m wide it lies fore and aft instead, 50 mm under the beams
    (and under the upper deck only midway between two web beams, which are deeper than that).
  - Its underside is at least 2.1 m over the deck where the height allows: it hangs 0.2 m under the plating, between the
    beams, which is 2.45 m over the deck in the house and 6.25 m over the trailers. Where the space is lower than that
    (the steering gear, the after passage) it is bolted close under the plating, beside where one walks and not over it.
  - Never over a stair or in a well, never under a hatch or the lift's platform, never where the deck over it is open,
    and 0.2 m and more clear of every wall, so none hangs in a doorway.
  - A fitting belongs to the deck it hangs from, and lifts away with it when she is taken apart.

Not lit from here: the wheelhouse (its own deckhead lights are part of the bridge), the emergency generator room (built
whole to the owner's drawing), tanks and trunks that are not entered, and the stair up into the wheelhouse, which is all
stair: its light comes down its well and in at its doorway.

Drawn in the ship's axes (lines.py): x to port, y up from the waterline, z forward from amidships.
"""
from math import ceil, floor, sqrt
import lines as L
import spec as S
import ga
import steel
import stair_rules
from shipyard import Part, srgb, tint, RUNS

Z = L.Z
PLATE = steel.PLATE
BODY = (1.27, 0.16, 0.07)          # a fitting's body: its length, breadth and depth
DROP, DROP_ALONG, DROP_LOW = 0.20, 0.30, 0.05      # how far the body's top hangs under the plating: across her, fore and aft, in a low space
WHITE, GREY, DARK, STEEL = srgb(0xe6e4dc), srgb(0x9aa0a0), srgb(0x3a3f41), srgb(S.STEEL)
OPAL = srgb(0xfff3de)
AREA = 10.5                        # square metres of deck to a fitting
# What the fittings of each plan hang from: the viewer's part of the deck over them, and that deck's plating over the waterline.
OVER = dict(hold=('main', S.MAIN_DECK), main=('upper', S.UPPER_DECK), upper=('boat', S.BOAT_DECK), boat=('officers', S.OFFICERS_DECK),
            officers=('bridge', S.BRIDGE_DECK), bridge=('top', S.COMPASS_DECK))
NAMES = dict(main='main deck', upper='upper deck', boat='boat deck', officers="officers' deck", bridge='bridge deck', top='house top')
# Spaces under the open sky, whatever kind the arrangement gives them.
WEATHER = {'aft-deck', 'helideck', 'funnel-p', 'funnel-s', 'trailer-deck', 'ramp-cover', 'walkway-p', 'walkway-s', 'forecastle', 'boat-deck-p', 'boat-deck-s',
           'officers-deck-aft', 'bridge-deck-open', 'compass-deck', 'house-top'}
# Spaces that get no fittings from here (the head of this file says why), beside those and the tanks.
NOT_LIT = WEATHER | {'wheelhouse', 'eg-room', 'wheelhouse-stair', 'uptake-s', 'er-vent', 'aux-vent', 'hold-vent', 'er-escape', 'cargo-lift', 'fixed-ramp', 'stern-ramp'}
# Spaces whose lit part is not their whole box: (space, plan, floor, [(x from, x to, yard from, yard to), ...], lies).
# `lies` 'across' or 'along', or None for the rule's own choice; a floor of None is the plan's.
G = steel.GALLERY
SPECIAL = [
    ('engine-room', 'hold', None, [(-5.0, 5.0, S.fr(42) + 0.3, S.fr(64) - 0.3)], None),
    ('er-platform', 'hold', S.PLATFORM, [(-0.85, 0.85, S.fr(28) + 0.3, S.fr(42) - 0.3), (G[0] + 0.2, 8.7, G[1] + 0.3, G[2] - 0.3), (-8.7, -G[0] - 0.2, G[1] + 0.3, G[2] - 0.3)], None),
    # the two low spaces aft: beside the way one walks (the walkway is on the centreline, the gear stands at the stocks)
    ('steering-gear', 'hold', S.AFT_FLAT, [(0.9, 2.5, 1.2, 6.9), (-2.5, -0.9, 1.2, 6.9)], 'along'),
    ('aft-passage', 'hold', S.AFT_FLAT, [(0.56, 1.16, 7.6, 15.0)], 'along'),
    ('hold-stair', 'hold', None, [(6.0, 8.9, 46.9, 48.0)], 'across'),
    ('thruster-room', 'hold', None, [(-1.6, 1.6, 98.8, 106.0)], None),
    ('fore-store', 'main', None, [(-1.7, 1.7, 110.7, 115.2)], None),
    # each storey of the house's stair trunk: over its own forward landing
    ('house-stair', 'upper', None, [(-1.0, 1.0, S.TRUNK_FWD[0] + 0.1, S.TRUNK_FWD[1] - 0.1)], 'across'),
    ('house-stair-boat', 'boat', None, [(-1.0, 1.0, S.TRUNK_FWD[0] + 0.1, S.TRUNK_FWD[1] - 0.1)], 'across'),
    ('house-stair-officers', 'officers', None, [(-1.0, 1.0, S.TRUNK_FWD[0] + 0.1, S.TRUNK_FWD[1] - 0.1)], 'across'),
]


def _keep_clear():
    """Where nothing may hang, by the deck it would hang from: (x from, x to, yard from, yard to) of every opening in that
    deck's plating."""
    out = dict(main=list(steel.MAIN_HOLES), upper=list(steel.UPPER_HOLES), boat=[steel.TRUNK_WELL], officers=[steel.TRUNK_WELL], bridge=[steel.WHEELHOUSE_STAIR], top=[])
    return out


def _stairs():
    """Every stair as a box no fitting may hang in: (x from, x to, yard from, yard to, its foot's level, and a storey over
    its top: nothing is hung from the next deck over a stair)."""
    out = []
    for st in S.STAIRS:
        _, (foot_yard, foot_y) = stair_rules.flights(st)
        x0, x1 = sorted(st['x'])
        ya, yb = sorted((st['top'][0], foot_yard))
        out.append((x0 - 0.2, x1 + 0.2, ya, yb, foot_y, st['top'][1] + 2.9))
    return out


def _odd_frames(a, b, clear=0.2, between_webs=False):
    """The odd frames between two yards, each `clear` and more inside them: where a fitting hangs between two beams. With
    `between_webs`, only the frame midway between two web beams (which stand at every sixth frame): a fitting that lies
    fore and aft reaches past the beam each side of it, and must not reach a web."""
    k = int(ceil((a + clear) / L.FRAME_SPACING - 1e-9))
    out = []
    while k * L.FRAME_SPACING <= b - clear + 1e-9:
        if k % 2 and (not between_webs or k % 6 == 3):
            out.append(round(k * L.FRAME_SPACING, 4))
        k += 1
    return out


def _spread(candidates, count):
    """`count` of the candidates, spread evenly along them."""
    if count >= len(candidates):
        return list(candidates)
    lo, hi = candidates[0], candidates[-1]
    out = []
    for j in range(count):
        want = lo + (hi - lo) * (j + 0.5) / count
        best = min((c for c in candidates if c not in out), key=lambda c: abs(c - want))
        out.append(best)
    return sorted(out)


def places():
    """Where every fitting hangs: a list of dicts (the space, x, yard, the plating it hangs from, the part that deck is drawn
    in, how it lies, how far it hangs), and the lit spaces that got none. This is the rule; build() only draws it."""
    clear, stairs = _keep_clear(), _stairs()
    out, without = [], []
    special = {s[0]: s for s in SPECIAL}
    for sp in ga.SPACES:
        if sp['kind'] in ('open', 'tank') or sp['id'] in NOT_LIT:
            continue
        plan = sp['plan']
        if plan not in OVER:
            continue
        group, deck = OVER[plan]
        floor_y = S.LEVELS[plan]
        if sp['level'] == 'platform':
            floor_y = S.PLATFORM
        elif sp['level'] == 'aft':
            floor_y = S.AFT_FLAT
        lies = None
        (a, b), (x0, x1) = sp['yard'], sp['x']
        boxes = [(x0, x1, a, b)]
        if sp['id'] in special:
            _, _, fl, boxes, lies = special[sp['id']]
            floor_y = floor_y if fl is None else fl
        made = 0
        for x0, x1, a, b in boxes:
            # no wider than she is there, at the deck the room stands on and at the one over it: a room's breadth is taken
            # at its middle; a long space (the vehicle deck, the hold) is fitted to her side fitting by fitting, below
            side = lambda yd: 99.0
            if plan in ('hold', 'main', 'upper'):
                side = lambda yd: min(L.main_x(floor_y + 0.3, Z(yd)), L.main_x(min(deck, L.UPPER) - 0.4, Z(yd))) - 0.45
                if b - a < 20.0:
                    hb = side((a + b) / 2)
                    x0, x1 = max(x0, -hb), min(x1, hb)
            # under the forecastle the deck rises with her sheer
            ceiling = lambda yd: (L.deck_y(Z(yd)) if plan == 'main' else deck) - PLATE
            width, length = x1 - x0, b - a
            if width < 0.5 or length < 0.5:
                continue
            height = ceiling((a + b) / 2) - floor_y
            how = lies or ('across' if width >= BODY[0] + 0.3 else 'along')
            drop = DROP_LOW if height < 2.1 + DROP + BODY[2] + 0.07 else (DROP if how == 'across' else DROP_ALONG)
            reach_x, reach_y = (BODY[0] / 2, BODY[1] / 2) if how == 'across' else (BODY[1] / 2, BODY[0] / 2)
            rows = max(1, round(width / 3.2))
            count = max(1, round(width * length / AREA / rows))
            webs = plan == 'main' and how == 'along'
            candidates = _odd_frames(a, b, 0.2 + reach_y - BODY[1] / 2, between_webs=webs)
            if how == 'along' and length >= BODY[0] + 0.3:
                # a small space may have no odd frame far enough from its ends: then a fitting lies fore and aft under the
                # beams near its middle, so placed that neither hanger stands in a beam's plane (and none where a web beam is)
                mid = (a + b) / 2
                for nudge in (0.0, 0.1, -0.1, 0.2, -0.2):
                    hangers = [mid + nudge - 0.45, mid + nudge + 0.45]
                    span = range(int(ceil((mid + nudge - reach_y) / L.FRAME_SPACING)), int(floor((mid + nudge + reach_y) / L.FRAME_SPACING)) + 1)
                    clear_of_beams = all(abs(h - 2 * L.FRAME_SPACING * round(h / (2 * L.FRAME_SPACING))) > 0.07 for h in hangers)
                    if clear_of_beams and not (webs and any(k % 6 == 0 for k in span)) and not candidates:
                        candidates.append(round(mid + nudge, 3))
            xs = [x0 + (i + 0.5) * width / rows for i in range(rows)]
            # a fitting stands 0.2 m and more clear of the walls beside it
            xs = [min(max(x, x0 + reach_x + 0.2), x1 - reach_x - 0.2) for x in xs] if width >= 2 * reach_x + 0.4 else [(x0 + x1) / 2]

            def free(x, yd):
                """Whether a fitting may hang at (x, yd): inside her, under plating that is there, and over no stair."""
                top = ceiling(yd) - drop
                low = top - BODY[2] - 0.065
                if abs(x) + reach_x + 0.2 > side(yd):
                    return False
                if any(rx0 - reach_x - 0.1 < x < rx1 + reach_x + 0.1 and ya - reach_y - 0.1 < yd < yb + reach_y + 0.1 for rx0, rx1, ya, yb in clear[group]):
                    return False
                return not any(sx0 - reach_x < x < sx1 + reach_x and ya - reach_y < yd < yb + reach_y and fy < top and low < head for sx0, sx1, ya, yb, fy, head in stairs)

            for x in sorted(set(round(v, 3) for v in xs)):
                # of the places in this row where a fitting may hang, as many as the rule asks, spread along the room
                for yd in _spread([yd for yd in candidates if free(x, yd)], count):
                    low = ceiling(yd) - drop - BODY[2] - 0.065
                    out.append(dict(space=sp['id'], x=x, yard=yd, ceiling=ceiling(yd), group=group, lies=how, drop=drop, under=round(low - floor_y, 3)))
                    made += 1
        if not made:
            without.append(sp['id'])
    return out, without


def _fitting(P, f):
    """One fitting, hung."""
    x, z, top = f['x'], Z(f['yard']), f['ceiling'] - f['drop']
    across = f['lies'] == 'across'
    ln, br, dp = BODY
    # a point of the fitting: u along its length, v across it, h up from its body's top
    at = (lambda u, v, h: (x + u, top + h, z + v)) if across else (lambda u, v, h: (x + v, top + h, z + u))
    box = lambda part, u0, u1, v0, v1, h0, h1, colour, r=0.004: part.block(tuple(map(min, at(u0, v0, h0), at(u1, v1, h1))), tuple(map(max, at(u0, v0, h0), at(u1, v1, h1))), colour, r)
    # the body and its end caps
    box(P['body'], -ln / 2 + 0.02, ln / 2 - 0.02, -br / 2, br / 2, -dp, 0.0, WHITE)
    for e in (-1, 1):
        box(P['body'], e * (ln / 2 - 0.02), e * ln / 2, -br / 2 - 0.004, br / 2 + 0.004, -dp - 0.012, 0.004, GREY, 0.003)
    # the diffuser, and the two clips each side that hold it
    box(P['lamp'], -ln / 2 + 0.035, ln / 2 - 0.035, -br / 2 + 0.014, br / 2 - 0.014, -dp - 0.05, -dp, OPAL, 0.012)
    for u in (-0.36, 0.36):
        for e in (-1, 1):
            box(P['body'], u - 0.012, u + 0.012, e * (br / 2 - 0.016), e * (br / 2 + 0.002), -dp - 0.022, -dp + 0.012, GREY, 0.002)
    # the two hangers: a foot plate under the deck's plating, a flat bar down to a lug on the body's top
    for u in (-0.45, 0.45):
        box(P['hanger'], u - 0.05, u + 0.05, -0.05, 0.05, f['drop'] - 0.006, f['drop'], GREY, 0.001)
        box(P['hanger'], u - 0.003, u + 0.003, -0.02, 0.02, -0.002, f['drop'] - 0.006, GREY, 0.001)
        box(P['hanger'], u - 0.012, u + 0.012, -0.03, 0.03, 0.0, 0.012, GREY, 0.002)
    # the gland on the body's top beside one hanger, the cable up the hanger, and its saddle on the deckhead
    g = (-0.45 + 0.022, 0.0)
    P['hanger'].tube(at(g[0], g[1], 0.0), at(g[0], g[1], 0.028), 0.011, colour=STEEL)
    pts = [at(g[0], g[1], 0.028), at(g[0], g[1], f['drop'] - 0.02)]
    P['cable'].rod(pts, 0.005, DARK)
    RUNS.append(dict(part=P['cable'].name, r=0.005, points=[[round(float(v), 4) for v in p] for p in pts]))
    box(P['hanger'], g[0] - 0.012, g[0] + 0.012, g[1] - 0.012, g[1] + 0.012, f['drop'] - 0.026, f['drop'], GREY, 0.002)


def build():
    fittings, without = places()
    parts = {}
    for f in fittings:
        key = f['group']
        if key not in parts:
            name = f'Light fittings under the {NAMES[key]}'
            parts[key] = dict(body=Part(f'{name}, bodies', 'Machinery paint'), lamp=Part(f'{name}, diffusers', 'Lamp diffuser'),
                              hanger=Part(f'{name}, hangers', 'Machinery paint'), cable=Part(f'{name}, cables', 'Plastic', smooth=True, angle=40))
            for p in parts[key].values():
                p.group = key
        _fitting(parts[key], f)
    low = sorted({f['space'] for f in fittings if f['under'] < 2.1})
    print(f"light fittings: {len(fittings)} in {len({f['space'] for f in fittings})} spaces; lower than 2.1 m over the deck in: {', '.join(low) or 'none'}; "
          f"without a fitting: {', '.join(without) or 'none'}")
    return [p for group in parts.values() for p in group.values()]

