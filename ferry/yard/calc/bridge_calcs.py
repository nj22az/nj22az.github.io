#!/usr/bin/env python3
"""
The yard's calculations for the navigation bridge, asked for by class in PA-001: made from the model as built
(ferry/data/ferry.bin.gz) and from the register (ferry/systems/), so that a change to either changes the result.

    python3 ferry/yard/calc/bridge_calcs.py

Writes, beside itself:
  JS4-402-bridge-visibility.md   what is seen from the conning position and from each wing: the sea over the bow, blind
                                 sectors, the glass, the lights' sectors
  JS8-855-battery-capacity.md    the radio battery and the general service (transitional) battery

and stops with an error if a result is outside its limit. Needs numpy; no Blender. Run it after assemble.py.
"""
import json, math, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'systems'))
import assemble as A
import lines as L
import spec as S
import bridge as REG
import ship as SHIP
import wheelhouse_view as W

DECK = 9.1                      # the bridge deck over the laden waterline
KEEL = 1.9                      # the laden draught: the waterline over the keel
LENGTH = 34.5
CONN = (0.0, 20.9)              # the conning position: standing at the wheel (x, metres from the transom)
WALL = (22.90, 23.35)           # the forward window wall, sill to raked head, with what is fixed to its outside
SILL_TOP = 1.00                 # the sill's upper edge over the deck: the foot of the glass
HOUSE = dict(x=3.06, yard=(19.50, 23.30), h=2.12)       # the wheelhouse's own walls: what stands in them is framing
FAR = 500.0                     # a bearing is blind when the sea this far off is hidden


def triangles():
    """Every triangle of the model that can hide something (no glass), in the ship's axes."""
    header, block = A.read_jmf(A.DEFAULT)
    out = []
    for g in header['views'][0]['groups']:
        for rec in g['meshes']:
            if header['materials'][rec['material']].get('transparent'):
                continue
            m = A.decode(header, block, rec)
            out.append(m['pos'][m['idx']])
    return np.concatenate(out)


def boxes():
    """The register's components with the box each was built in, smallest first, for naming what a sight line meets."""
    data = json.load(open(os.path.join(HERE, '..', '..', 'data', 'systems.json')))
    out = []
    for c in data['components']:
        if c.get('box') and c['id'] != 'OUT-20':
            lo, hi = np.array(c['box'][0]), np.array(c['box'][1])
            out.append((float(np.prod(hi - lo)), c['id'], c['name'], lo, hi))
    return sorted(out, key=lambda b: b[0])


def name_of(point, named):
    x, y, z = point
    yard, h = z + L.HALF, y - DECK
    for _, cid, name, lo, hi in named:
        if np.all(point >= lo - 0.02) and np.all(point <= hi + 0.02):
            return f'{name} ({cid})'
    if abs(x) <= HOUSE['x'] and HOUSE['yard'][0] <= yard <= HOUSE['yard'][1] and 0 <= h <= HOUSE['h']:
        return f'the wheelhouse\'s own framing, {yard:.2f} m from the transom (x {x:+.2f})'
    if yard > 33.0:
        return f'the stowed bow ramp, {y + KEEL:.2f} m above the keel'
    return f'{yard:.1f} m from the transom, {y + KEEL:.2f} m above the keel (x {x:+.2f})'


def cut(T, eye, bearing_deg):
    """Every triangle that the upright plane of a bearing passes through, as the two points where it enters and leaves."""
    b = math.radians(bearing_deg)
    ahead = np.array([math.sin(b), 0.0, math.cos(b)])           # bearings are positive to port (x is to port)
    across = np.array([math.cos(b), 0.0, -math.sin(b)])
    rel = T - eye
    side = rel @ across
    R, Sd = rel[(side.min(1) < 0) & (side.max(1) > 0)], side[(side.min(1) < 0) & (side.max(1) > 0)]
    pts, mask = [], []
    with np.errstate(divide='ignore', invalid='ignore'):
        for i, j in ((0, 1), (1, 2), (2, 0)):
            mixed = (Sd[:, i] * Sd[:, j]) < 0
            t = np.where(mixed, Sd[:, i] / (Sd[:, i] - Sd[:, j]), 0.0)
            pts.append(R[:, i] + (R[:, j] - R[:, i]) * t[:, None])
            mask.append(mixed)
    pts, mask = np.stack(pts, 1), np.stack(mask, 1)
    two = mask.sum(1) == 2
    pts, mask = pts[two], mask[two]
    order = np.argsort(~mask, axis=1, kind='stable')
    n = np.arange(len(pts))
    return pts[n, order[:, 0]], pts[n, order[:, 1]], ahead


def sight_over_bow(T, eye_at, eye_h, bearing_deg):
    """
    Along one bearing: the lowest line of sight that clears what stands under the eye, where it meets the water, and what it
    grazes. The highest point under the eye's level, as an angle, is what hides the sea up to there.

    What counts as standing under the eye: inside the wheelhouse, anything up to 1.40 m over the deck (the console and what
    is on it); in the window wall, the sill only (the frames between the panes are judged as blind sectors, and what hangs
    from the deckhead hides the sky, not the sea); ahead of the wall, everything. Only what is under the eye's own level
    counts anywhere: the sea is never seen above the horizon, so the roof's brow hides none of it, while anything that rises
    from below through the eye's level (a mast, a ramp standing higher than the eye) hides it all on its bearing.
    """
    eye = np.array([eye_at[0], DECK + eye_h, L.Z(eye_at[1])])
    Pa, Pb, ahead = cut(T, eye, bearing_deg)
    best, at = -90.0, None
    for p in (Pa, Pb):
        d = p @ ahead
        yard = p[:, 2] + eye[2] + L.HALF
        h = p[:, 1] + eye[1] - DECK
        up = np.degrees(np.arctan2(p[:, 1], np.maximum(d, 1e-6)))
        ok = (d > 0.35) & (up < 0) & (((yard < WALL[0]) & (h <= 1.40)) | ((yard >= WALL[0]) & (yard <= WALL[1]) & (h <= SILL_TOP)) | (yard > WALL[1]))
        if ok.any():
            k = int(np.argmax(up[ok]))
            if up[ok][k] > best:
                best, at = float(up[ok][k]), p[ok][k] + eye
    reach = (DECK + eye_h) / math.tan(math.radians(-best)) if best < 0 else float('inf')
    stem = (L.HALF - L.Z(eye_at[1])) / math.cos(math.radians(bearing_deg))          # how far ahead of the eye the stem is
    return dict(bearing=bearing_deg, dip=-best, grazes=at, beyond_bow=reach - stem)


def blind(T, eye_at, eye_h, bearing_deg, near=0.25):
    """Whether the sea 500 m off is hidden on a bearing, and by what: the nearest thing the line of sight to it meets
    (beyond `near`: a person's own hands, a lantern's own body)."""
    eye = np.array([eye_at[0], DECK + eye_h, L.Z(eye_at[1])])
    Pa, Pb, ahead = cut(T, eye, bearing_deg)
    k = (DECK + eye_h) / FAR
    da, db = Pa @ ahead, Pb @ ahead
    fa, fb = Pa[:, 1] + k * da, Pb[:, 1] + k * db                # above or under the line of sight
    hit = (fa * fb < 0)
    t = np.where(hit, fa / np.where(hit, fa - fb, 1.0), 0.0)
    dc = da + (db - da) * t
    hit &= dc > near
    if not hit.any():
        return None
    i = int(np.argmin(np.where(hit, dc, np.inf)))
    return Pa[i] + (Pb[i] - Pa[i]) * t[i] + eye


def sectors(T, named, eye_at, eye_h, first, last, step=0.5, near=0.25):
    """The blind sectors between two bearings: (from, to, what hides it, whether that is the wheelhouse's own framing)."""
    out, run = [], None
    b = first
    while b <= last + 1e-9:
        p = blind(T, eye_at, eye_h, b, near)
        if p is not None:
            x, yard, h = p[0], p[2] + L.HALF, p[1] - DECK
            own = abs(x) <= HOUSE['x'] and HOUSE['yard'][0] <= yard <= HOUSE['yard'][1] and 0 <= h <= HOUSE['h']
            what = name_of(p, named)
            if run and run[3] == own and (own or run[2] == what):
                run[1] = b
            else:
                run = [b, b, what, own]
                out.append(run)
        else:
            run = None
        b += step
    return [(a - step / 2, z + step / 2, what, own) for a, z, what, own in out]


def side_name(b):
    return 'ahead' if abs(b) < 1e-6 else f"{abs(b):g}° to {'port' if b > 0 else 'starboard'}"


def judge(blinds, problems, where):
    """The outside obstructions against regulation 22.1.2; the framing is reported, not judged by it."""
    outside = [s for s in blinds if not s[3] and -90 <= (s[0] + s[1]) / 2 <= 90]
    total = sum(z - a for a, z, _, _ in outside)
    for a, z, what, _ in outside:
        limit = 5.0 if -10 <= a and z <= 10 else 10.0
        if z - a > limit:
            problems.append(f'{where}: a blind sector of {z - a:.1f}° ({what}) where {limit:g}° is allowed')
    if total > 20:
        problems.append(f'{where}: blind sectors of {total:.1f}° in all forward of the beam (20° allowed)')
    return outside, total


def visibility(T, named, problems):
    limit = min(2 * LENGTH, 500.0)
    out = ['# JS4-402 · Navigation bridge visibility', '',
           f'Johansson Shipyard, newbuilding No. 1, {S.SHIP_NAME}. Calculated by `ferry/yard/calc/bridge_calcs.py` from the model as built '
           '(`ferry/data/ferry.bin.gz`) and the builder\'s own measures (`ferry/blender/wheelhouse.py`). Revision 1, 11 November 2026.', '',
           '**Requirement.** SOLAS chapter V, regulation 22, as adopted by resolution MSC.99(73) and amended by MSC.142(77): read for class comment sheet PA-001 revision 1, '
           'which lists the paragraphs. It binds ships of 55 m in length overall and more; she is 34.5 m and is held to it as the benchmark the yard and class agreed. '
           'The recommended heights of the glass are from IACS Recommendation 95 (revision 1), which is a recommendation.', '',
           f'**The conning position** is declared as standing at the wheel, on the centreline, {CONN[1]} m from the transom ({LENGTH - CONN[1]:.1f} m abaft the stem). '
           'The regulation names no eye height for the view of the sea; the yard takes 1.50 m (a short helmsman, the worst case for looking over the console) and 1.80 m.', '',
           '## 1. The sea surface over the bow (22.1.1)', '',
           f'With the bow ramp stowed upright, at her laden draught ({KEEL} m), level trim. Not to be hidden more than two ship lengths ({2 * LENGTH:.0f} m) or 500 m, whichever is less, '
           'forward of the bow, to 10° on either side.', '',
           '| Eye over the deck | Bearing | The line of sight dips | It grazes | Sea hidden to, ahead of the bow |', '|---|---|---|---|---|']
    worst = {}
    for eye in (1.5, 1.8):
        rows = {b: sight_over_bow(T, CONN, eye, b) for b in range(-10, 11)}
        worst[eye] = max(rows.values(), key=lambda r: r['beyond_bow'])
        for b in (-10, -5, 0, 5, 10):
            r = rows[b]
            out.append(f"| {eye:.2f} m | {side_name(b)} | {r['dip']:.1f}° | {name_of(r['grazes'], named)} | {r['beyond_bow']:.0f} m |")
        w = worst[eye]
        out.append(f"| {eye:.2f} m | **worst of every whole degree: {side_name(w['bearing'])}** | {w['dip']:.1f}° | {name_of(w['grazes'], named)} | **{w['beyond_bow']:.0f} m** |")
    hidden = max(w['beyond_bow'] for w in worst.values())
    if hidden > limit:
        problems.append(f'the sea is hidden to {hidden:.0f} m ahead of the bow (limit {limit:.0f} m)')
    out += ['', f'**Result: the sea is hidden to at most {hidden:.0f} m ahead of the bow; {limit:.0f} m is allowed.** '
            'The first calculation, for revision 0 of the design, gave 176 m at 5° either side for the 1.50 m eye: the engine instrument panel and the console\'s rudder angle '
            'indicator stood 0.39 m over the console on stand-offs, and the control levers 0.30 m. The yard lowered the two panels onto the console (0.22 m) and shortened the '
            'levers (0.19 m, on new control heads). Nothing ahead of the wheel now stands higher than 1.22 m over the deck.', '']

    # ---- for information: the two chairs
    out += ['For information, not asked by the regulation of anything but the conning position: seated in a chair, eye 1.50 m over the deck.', '',
            '| From | Worst bearing | It grazes | Sea hidden to, ahead of the bow |', '|---|---|---|---|']
    chairs = {}
    for cid in ('OUT-02', 'OUT-03'):
        c = next(k for k in REG.COMPONENTS if k['id'] == cid)
        at = (c['at'][0], c['at'][1] - 0.10)
        w = max((sight_over_bow(T, at, 1.5, b) for b in range(-10, 11)), key=lambda r: r['beyond_bow'])
        chairs[cid] = w['beyond_bow']
        out.append(f"| {c['name']} | {side_name(w['bearing'])} | {name_of(w['grazes'], named)} | {w['beyond_bow']:.0f} m |")
    out.append('')

    # ---- blind sectors
    out += ['## 2. Blind sectors from the conning position (22.1.2, 22.1.3)', '',
            'A bearing is counted blind when the sea 500 m off is hidden from an eye 1.50 m over the deck, taken every half degree from the model. The regulation limits '
            'what stands **outside** the wheelhouse forward of the beam: no sector over 10°, 20° in all, 5° within the view of section 1. The wheelhouse\'s own framing is '
            'judged by 22.1.9.2 (kept to a minimum, none immediately forward of a workstation) and is listed here for what it is.', '']
    seen, _, to = W.view()
    blinds = sectors(T, named, CONN, 1.5, -112.5, 112.5)
    outside, total = judge(blinds, problems, 'conning position')
    own = [s for s in blinds if s[3]]
    clear = 225.0 - sum(z - a for a, z, _, _ in blinds)
    out += [f'- **Outside the wheelhouse, forward of the beam: {len(outside)} blind sector{"" if len(outside) == 1 else "s"}'
            + (f', {total:.1f}° in all**: ' + '; '.join(f'{z - a:.1f}° at {side_name(round((a + z) / 2, 1))} ({what})' for a, z, what, _ in outside) + '.' if outside else '.** Nothing outside stands as high as the eye forward of the beam but the stowed ramp, which is under the line of sight (section 1).'),
            f'- The wheelhouse\'s own framing: {len(own)} frames in the 225°, the widest {max((z - a for a, z, _, _ in own), default=0):.1f}° '
            f'(a corner post or a door\'s edge), {sum(z - a for a, z, _, _ in own):.0f}° in all: **{clear:.0f}° of the 225° are clear glass.** The windows reach to {to:.0f}° on each side (22.5° abaft the beam is 112.5°); '
            f'the builder\'s own count, {seen:.0f}° of 225°, takes a frame under 6° as part of the window it stands in, and the build stops under 220°.',
            '- Abaft the beam, to 22.5° on each side: ' + ('; '.join(f'{z - a:.1f}° at {side_name(round((a + z) / 2, 1))} ({what})' for a, z, what, o in blinds if not o and abs((a + z) / 2) > 90) or 'nothing outside the wheelhouse hides the sea') + '.', '']
    frames = [(a, z) for a, z, _, o in blinds if o and -30 <= (a + z) / 2 <= 30]
    out += ['Frames within 30° of the bow, as seen from the wheel: ' + ', '.join(f'{side_name(round((a + z) / 2, 1))} ({z - a:.1f}°)' for a, z in frames) + '.', '']

    # ---- the wings
    out += ['## 3. From each bridge wing (22.1.4, 22.1.5)', '',
            'The field asked: from 45° on the opposite bow through right ahead, and round to right astern on the wing\'s own side: 225°. Standing at the wing control station, '
            'eye 1.50 m; what is seen through the wheelhouse\'s own glass counts as seen. The first calculation, with the station across the whole wing and its levers inboard, found the house\'s '
            'forward corner hiding 13.5° inside the arc, at 29° to 42° on the opposite bow; the yard moved each station to the outboard forward corner of its wing.', '']
    for name, cid, sign in (('Port wing', 'PRP-10', 1), ('Starboard wing', 'PRP-11', -1)):
        c = next(k for k in REG.COMPONENTS if k['id'] == cid)
        at = (c['at'][0] + sign * 0.165, c['at'][1] - 0.37)           # at the levers, a step behind the pedestal
        first, last = (-45.0, 180.0) if sign > 0 else (-180.0, 45.0)
        bl = sectors(T, named, at, 1.5, first, last)
        clear = 225.0 - sum(z - a for a, z, _, _ in bl)
        big = [(a, z, what, o) for a, z, what, o in bl if z - a >= 3.0]
        out.append(f'- **{name}** (standing {abs(at[0]):.2f} m off the centreline, {at[1]:.2f} m from the transom): {clear:.0f}° of the 225° clear. Hidden over 3° or more: '
                   + ('; '.join(f'{z - a:.1f}° at {side_name(round((a + z) / 2, 1))} ({what})' for a, z, what, _ in big) or 'nothing') + '.')
    out += [f'- The ship\'s side (22.1.5): each wing\'s outer rail is 4.16 m off the centreline and her side at the deck 4.20 m; the side and the fenders are seen by leaning over the rail.', '']

    # ---- the glass
    head, sill, dist = W.GLASS_TOP, W.GLASS_FOOT, W.glass_distance()
    pitch = lambda eye: math.degrees(math.atan2(head - eye, dist))
    out += ['## 4. The glass (22.1.7 to 22.1.9)', '',
            f'- Forward windows inclined {W.RAKE_DEG:.0f}° from the vertical, top outward (22.1.9.1: 10° to 25°).',
            f'- Framing (22.1.9.2): the mullions between the forward panes are 0.10 m wide and the corner posts 0.06 m (150 mm is the recommended most). None is straight ahead of a workstation: '
            f'the wheel (centreline) looks through the middle of the middle pane, which is {W.PANES[2][1] - W.PANES[2][0]:.2f} m wide; each chair (1.05 m off the centreline) through the pane beside it, '
            f'whose glass runs from {W.PANES[3][0]:.2f} to {W.PANES[3][1]:.2f} m.',
            f'- Lower edge of the forward glass {sill:.2f} m over the deck (22.1.7: as low as possible; recommended 1.00 m at most).',
            f'- Upper edge of the forward glass {head:.2f} m over the deck, {dist:.2f} m ahead of the conning eye (22.1.8: the horizon to stay in view for an eye at 1.80 m when she pitches; '
            f'1.60 m where the Administration allows). An eye at 1.80 m keeps the horizon until she pitches {pitch(1.8):.1f}° by the bow, an eye at 1.60 m until {pitch(1.6):.1f}°. '
            f'**The recommended 2.00 m is not reached.** The deckhead is at 2.08 m (the underside of the compass deck) and limits the glass: the yard raised its head from 1.95 to 2.00 m '
            f'(the glass itself to {head:.2f} m) for PA-001; reaching 2.00 m of glass needs the wheelhouse roof raised by about 0.10 m. Open with the owner.', '',
            '## 5. The lights\' sectors (JS4-404)', '']
    out += lights(T, named, problems)
    out += [
            '## Open', '',
            '- The roof\'s height and the 2.00 m upper edge of the glass (owner).',
            '- The same calculation at the light draught and with trim by the stern, when the stability booklet (JS1-104) gives those waterlines.',
            '- The stern light, with the passenger deck.', '']
    open(os.path.join(HERE, 'JS4-402-bridge-visibility.md'), 'w').write('\n'.join(out))
    return hidden, seen, len(outside), total, chairs


def lights(T, named, problems):
    """Each lantern's sector, looked along from the lantern itself in the model: what stands in its light."""
    comps = {c['id']: c for c in REG.COMPONENTS}
    hull = lambda h: DECK + h + KEEL - 4.0                       # above the hull: her depth to the car deck is 4.0 m
    width = lambda found: sum(z - a for a, z, _, _ in found)
    said = lambda found: '; '.join(f'{z - a:.1f}° at {side_name(round((a + z) / 2, 1))} ({what})' for a, z, what, _ in found) or 'nothing'
    out = ['**Requirement.** COLREG Annex I, as read for PA-001 revision 1: 2(a)(i), 2(g), 2(i)(i), 3(d), section 5 and 9(b). The cut-off of a sidelight outside its sector (9(a)) was not read and is quoted from memory. '
           'Each sector below is looked along from the lantern\'s own lens in the model, every half degree.', '']
    # masthead
    m = comps['NLT-04']
    box = [float(v) for v in re.search(r"C\('NLT-04'.*?box=\(([^)]*)\)", open(os.path.join(HERE, '..', '..', 'systems', 'bridge.py')).read(), re.S).group(1).split(',')]
    at, h = (0.0, (box[2] + box[3]) / 2), (box[4] + box[5]) / 2
    found = sectors(T, named, at, h, -112.5, 112.5, near=0.16)
    ml = hull(h)
    out.append(f'- **Masthead light** (white, 225°): on the front of the mast, {ml:.1f} m above the hull; her beam is 8.4 m, so 2(a)(i) asks at least 8.4 m. '
               f'{at[1] - LENGTH / 2:.2f} m forward of amidships (3(d)). In its sector, from the lens: **{said(found)}**.')
    if width(found) > 0:
        problems.append(f'the masthead light is hidden over {width(found):.1f}° of its sector')
    # sidelights
    for cid, sign, name in (('NLT-02', 1, 'port'), ('NLT-03', -1, 'starboard')):
        c = comps[cid]
        at, h = (c['at'][0], c['at'][1]), c['at'][2] + 0.125
        own = sectors(T, named, at, h, 0.0, 112.5, near=0.08) if sign > 0 else sectors(T, named, at, h, -112.5, 0.0, near=0.08)
        across = 60.0
        for k in range(1, 121):                                     # across the bow, every half degree: how far the lens is still seen
            if blind(T, at, h, -sign * k * 0.5, 0.08) is not None:
                across = (k - 1) * 0.5
                break
        out.append(f'- **Sidelight, {name}**: on the wing rail, {hull(h):.1f} m above the hull, under three quarters of the masthead light\'s height ({0.75 * ml:.1f} m; 2(g)). '
                   f'In its own sector: {said(own)}. Its matt black screen (section 5) is 0.42 m long and stands 0.09 m inboard of the lens: the middle of the lens is still seen '
                   f'**{across:g}° across the bow**.')
        if width(own) > 0:
            problems.append(f'the {name} sidelight is hidden over {width(own):.1f}° of its own sector')
    out.append('  **Open (PA-001 comment 22):** the practical cut-off asked is 1° to 3° outside the sector. Either the lantern\'s own screening gives it (the maker\'s certificate), or the screens are made 0.9 m long, '
               'which the wing has no room for with the lantern on its rail: the yard proposes lanterns in boxes let into the wing bulwark under the rail.')
    # not under command: a pair at each height
    for cid in ('NLT-07', 'NLT-08'):
        c = comps[cid]
        h = c['at'][2] + 0.105
        each = [sectors(T, named, (sx, c['at'][1]), h, -180.0, 179.5, near=0.10) for sx in (0.30, -0.30)]
        dark = []
        for k in range(720):
            b = -180.0 + k * 0.5
            if all(blind(T, (sx, c['at'][1]), h, b, 0.10) is not None for sx in (0.30, -0.30)):
                dark.append(b)
        out.append(f'- **{c["name"]}** (red, all round), {hull(h):.1f} m above the hull: the port lantern alone is hidden over {width(each[0]):.0f}° (the mast, and whips of the antennas), the starboard one over {width(each[1]):.0f}°; '
                   f'9(b)(i) allows 6°, so one lantern would not do. **Both are hidden together on {len(dark) * 0.5:g}° of the horizon.** They are 0.6 m apart: one light at a mile (9(b)(ii)).')
        if dark:
            problems.append(f'{c["name"]}: both lanterns are hidden together on {len(dark) * 0.5:g}° ({dark[0]:g}° to {dark[-1]:g}°)')
    up, low = comps['NLT-07']['at'][2], comps['NLT-08']['at'][2]
    out.append(f'  The two heights are {up - low:.1f} m apart and the lower is {hull(low + 0.105):.1f} m above the hull (2(i)(i): 2 m apart, the lowest 4 m above the hull).')
    # anchor
    c = comps['NLT-05']
    found = sectors(T, named, (c['at'][0], c['at'][1]), c['at'][2] + 0.02, -180.0, 179.5, near=0.12)
    out.append(f'- **Anchor light** (white, all round): on the crown of the mast. Hidden: {said(found)} (9(b)(i) excepts anchor lights in any case).')
    out.append('- **Stern light**: at the after end of the passenger deck, which is still the other ship\'s drawing; its sector is to be shown when that section is rebuilt.')
    out.append('')
    return out


def fitted(source):
    return float(re.search(r'(\d+) Ah', next(s for s in SHIP.SOURCES if s['id'] == source)['rating']).group(1))


def batteries(problems):
    comps = {c['id']: c for c in REG.COMPONENTS}
    on = lambda board: [c for c in REG.COMPONENTS if c['by'] and c['by'][0] == board]
    amps = lambda w: w / 24.0
    COUNTED = 0.8 * 0.8             # end of life, and not discharged below a fifth
    RX_W = 12.0                     # a VHF set on watch: half an ampere at 24 V (typical; the maker's figure replaces it)
    INVERTER = 0.85

    out = ['# JS8-855 · Battery capacity', '',
           f'Johansson Shipyard, newbuilding No. 1, {S.SHIP_NAME}. Calculated by `ferry/yard/calc/bridge_calcs.py` from the register (`ferry/systems/bridge.py`, `ship.py`). Revision 1, 11 November 2026.', '',
           'Both banks are 24 V lead-acid, in the emergency generator room. A bank is taken at 80 % of its rated capacity at the end of its life and is not discharged below 20 %: '
           f'**{COUNTED:.2f} of the rated ampere-hours are counted.** Powers are the register\'s; a set\'s receiving current is a typical figure until the maker\'s is in hand.', '',
           '## 1. The radio battery: reserve source of energy (bank BAT-R, panel DC2)', '',
           '**Requirement.** SOLAS chapter IV, regulation 13, as amended by resolution MSC.496(105) (read for PA-001 revision 1): the reserve source runs the VHF installation, and the loads '
           'the regulation adds to it, for one hour where the emergency source of electrical power complies fully with regulation II-1/42, and for six hours where it does not (13.2); '
           'the charger brings the bank back to the capacity required within 10 hours (13.6.1). The load is worked out as half the current drawn when transmitting, plus the current drawn '
           'when receiving, plus the current of the other loads (the method of COMSAR/Circ.16, as given in the United Kingdom\'s MGN 641, annex F).', '',
           '| Load | Transmitting A | Receiving A | Counted A |', '|---|---|---|---|']
    total = standing = 0.0
    for c in on('DC2'):
        if c['id'] in ('COM-01', 'COM-02'):
            tx, rx = amps(c['w']), amps(RX_W)
            counted = 0.5 * tx + rx
            standing += rx
            out.append(f"| {c['name']} ({c['id']}) | {tx:.2f} | {rx:.2f} | {counted:.2f} |")
        else:
            counted = amps(c['w'])
            standing += counted
            out.append(f"| {c['name']} ({c['id']}) | | | {counted:.2f} |")
        total += counted
    for c in REG.COMPONENTS:
        if c['alt'] and c['alt'][0] == 'DC2':
            counted = amps(c['w'])
            total += counted
            standing += counted
            out.append(f"| {c['name']} ({c['id']}), its second supply: the position for the distress call | | | {counted:.2f} |")
    have = fitted('BAT-R')
    need1, need6 = total * 1 / COUNTED, total * 6 / COUNTED
    charger = need6 * COUNTED / 10 + standing
    out += [f'| **Total** | | | **{total:.2f}** |', '',
            f'- For one hour: {total:.1f} Ah, a bank of {need1:.0f} Ah rated. For six hours: {total * 6:.0f} Ah, a bank of {need6:.0f} Ah rated.',
            f'- **Fitted: 24 V, {have:.0f} Ah.** It meets the six-hour case, so the radio does not depend on the emergency generator being accepted. Both VHF sets are counted, though the rule asks one.',
            f'- Charger: the six-hour capacity back in 10 hours with the sets on watch: {need6 * COUNTED:.0f} / 10 + {standing:.1f} = {charger:.1f} A. **Fitted: 24 V, {math.ceil(charger / 5) * 5:.0f} A**, automatic, '
            'with a charging-failure alarm at the radio position.', '']
    if need6 > have:
        problems.append(f'the radio battery needs {need6:.0f} Ah rated for six hours and {have:.0f} Ah is fitted')

    dc1 = sum(c['w'] for c in on('DC1'))
    pa = comps['INT-01']['w']
    nlp = sum(c['w'] for c in on('NLP'))
    nlp_sea = sum(comps[k]['w'] for k in ('NLT-02', 'NLT-03', 'NLT-04', 'NLT-06'))       # under way: masthead, sidelights, stern
    rows = [('Everything on panel DC1: navigation sensors, autopilot, propulsion control, alarms, night and transitional lighting', dc1, amps(dc1)),
            ('Public address and general alarm amplifier at full output, on its battery supply (DC1 way 14)', pa, amps(pa)),
            (f'Navigation light panel, every lantern lit, through the inverter (efficiency {INVERTER})', nlp, amps(nlp / INVERTER))]
    out += ['## 2. The general service battery: transitional source of emergency power (bank BAT-G; panel DC1 and the transitional section)', '',
            '**Requirement.** SOLAS chapter II-1, regulation 42 (passenger ships), read for PA-001 revision 1: the emergency generator starts by itself and is on the board within 45 s (42.3.1.2); '
            'the transitional source is an accumulator battery that takes over by itself and carries for half an hour the emergency lighting and the navigation lights, the internal '
            'communication, the fire detection and alarm and the internal signals (42.4.1). The fire detection panel has its own battery for this half hour and is not counted here.', '',
            '| Load on the bank in the rule\'s half hour | W | A at 24 V | Ah in 0.5 h |', '|---|---|---|---|']
    current = 0.0
    for name, w, a in rows:
        current += a
        out.append(f'| {name} | {w:.0f} | {a:.1f} | {a * 0.5:.1f} |')
    have = fitted('BAT-G')
    ah = current * 0.5
    spare = have * COUNTED - ah
    out += [f'| **Total, the bridge** | | **{current:.1f}** | **{ah:.1f}** |', '',
            f'- The bridge takes {ah:.0f} Ah in the half hour: a bank of {ah / COUNTED:.0f} Ah rated would carry it.',
            f'- **Fitted: 24 V, {have:.0f} Ah**, of which {have * COUNTED:.0f} Ah are counted. **{spare:.0f} Ah remain for the transitional services of the other sections** (the emergency lighting of the '
            f'passenger spaces, stairs, machinery spaces and embarkation stations; the watertight doors\' indication): up to {spare / 0.5 * 24 / 1000:.1f} kW for the half hour. '
            'This calculation is closed only when every section is in the register.',
            f'- If the emergency generator never starts, panel DC1 and the lanterns she shows under way ({nlp_sea:.0f} W) draw {amps(dc1) + amps(nlp_sea / INVERTER):.1f} A: the bank carries navigation and control for '
            f'{have * COUNTED / (amps(dc1) + amps(nlp_sea / INVERTER)):.1f} hours.',
            f'- Inverter: the navigation light panel\'s {nlp:.0f} W connected. **Fitted: 1 kVA, 24 V DC to 105 V**, in the emergency generator room, feeding the transitional section of the emergency switchboard.',
            f'- Charger: a tenth of the bank an hour and panel DC1\'s load: {have / 10:.0f} + {amps(dc1):.1f} = {have / 10 + amps(dc1):.1f} A. **Fitted: 24 V, {math.ceil((have / 10 + amps(dc1)) / 10) * 10:.0f} A**, automatic, '
            'with a charging-failure alarm on the bridge alarm panel.',
            '- Neither steering control system is on this bank: each is fed from its own power unit\'s circuit (PA-001 comment 3).', '']
    if ah > have * COUNTED:
        problems.append(f'the general service battery is drawn {ah:.0f} Ah in the half hour and {have * COUNTED:.0f} Ah are counted')
    open(os.path.join(HERE, 'JS8-855-battery-capacity.md'), 'w').write('\n'.join(out))
    return need6, ah, spare


if __name__ == '__main__':
    problems = []
    T = triangles()
    hidden, seen, n_out, total, chairs = visibility(T, boxes(), problems)
    need6, ah, spare = batteries(problems)
    print(f'bridge visibility: sea hidden to {hidden:.0f} m ahead of the bow (limit {min(2 * LENGTH, 500):.0f}); glass {seen:.0f} of 225 degrees; '
          f'{n_out} blind sectors outside the wheelhouse forward of the beam, {total:.1f} degrees in all')
    print('   from the chairs, for information: ' + ', '.join(f'{k} {v:.0f} m' for k, v in chairs.items()))
    print(f'batteries: radio needs {need6:.0f} Ah rated for 6 h ({fitted("BAT-R"):.0f} fitted); the bridge draws {ah:.0f} Ah of the general service bank in the half hour, {spare:.0f} Ah remain')
    if problems:
        raise SystemExit('a calculation does not hold:\n  ' + '\n  '.join(problems))
    print('all calculations hold')
