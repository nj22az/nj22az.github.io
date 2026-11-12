#!/usr/bin/env python3
"""
The Chisum's component register: puts her systems together, routes every cable, sizes and checks every circuit, and
writes what the page and people read.

    python3 ferry/systems/register.py [--boxes <part file from blender/build.py>]

Reads ship.py and each section's module (bridge.py). Writes
  ferry/data/systems.json            what the page reads (places in the ship's axes: x to port, y up from the waterline, z forward)
  ferry/systems/out/<section>-*.csv  the same as tables: components, circuits, nets, pipes

A component's box (where it is in the model) comes from the Blender build (`--boxes`, or blender/assemble.py passes it on);
without it the boxes already in systems.json are kept. Stops with a non-zero exit if a check fails.
Needs only Python 3 (numpy to read a part file).
"""
import csv, heapq, json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'blender'))
import ship as S
import bridge
import stern
import bridge_place as BP

SECTIONS = [bridge, stern]
OUT_JSON = os.path.join(HERE, '..', 'data', 'systems.json')
OUT_DIR = os.path.join(HERE, 'out')


def ship_xyz(p):
    """(x, yard, h over the bridge deck), in the bridge's own measures → the ship's axes, by its placing (blender/bridge_place.py)."""
    return [round(p[0], 3), round(BP.DECK + p[2], 3), round(BP.Z(p[1]), 3)]


def xyz_of(mod):
    """How a section's places are turned into the ship's axes: its own way (`xyz`), or the bridge's."""
    return getattr(mod, 'xyz', ship_xyz)


def manhattan(a, b):
    return sum(abs(u - v) for u, v in zip(a, b))


def legs(a, b):
    """The way from a to b by the three axes in turn (x, then along her length, then up or down), without empty legs."""
    pts = [tuple(a), (b[0], a[1], a[2]), (b[0], b[1], a[2]), tuple(b)]
    out = [pts[0]]
    for p in pts[1:]:
        if manhattan(p, out[-1]) > 1e-6:
            out.append(p)
    return out


class Ways:
    """The cable ways of a section: shortest ways between its named points."""

    def __init__(self, nodes, edges):
        self.nodes = nodes
        self.next = {n: [] for n in nodes}
        for a, b in edges:
            d = manhattan(nodes[a], nodes[b])
            self.next[a].append((b, d))
            self.next[b].append((a, d))
        self._seen = {}

    def nearest(self, at):
        return min(self.nodes, key=lambda n: manhattan(self.nodes[n], at))

    def run(self, names):
        """The points of a way through the named points: each stretch by the three axes in turn, laid the same whichever
        way it is gone along (a tray is one tray, whoever's cable lies in it)."""
        pts = [self.nodes[names[0]]]
        for a, b in zip(names, names[1:]):
            leg = legs(self.nodes[a], self.nodes[b]) if a < b else legs(self.nodes[b], self.nodes[a])[::-1]
            pts += leg[1:]
        return pts

    def between(self, a, b):
        """The named points from a to b, and the length of the way."""
        if (a, b) in self._seen:
            return self._seen[(a, b)]
        best, queue = {a: (0.0, None)}, [(0.0, a)]
        while queue:
            d, n = heapq.heappop(queue)
            if n == b:
                break
            if d > best[n][0]:
                continue
            for m, w in self.next[n]:
                if m not in best or d + w < best[m][0] - 1e-9:
                    best[m] = (d + w, n)
                    heapq.heappush(queue, (d + w, m))
        if b not in best:
            raise KeyError(f'no cable way from {a} to {b}')
        way, n = [], b
        while n is not None:
            way.append(n)
            n = best[n][1]
        self._seen[(a, b)] = (way[::-1], best[b][0])
        return self._seen[(a, b)]


def build(boxes=None):
    problems, notes, missing = [], [], []
    comps, by_id = [], {}
    boards = {b['id']: dict(b, section=None) for b in S.BOARDS}
    circuits = {}
    nets, pipes = [], []
    systems = {s['id']: s for s in S.SUBSYSTEMS}

    old_boxes = {}
    if boxes is None and os.path.exists(OUT_JSON):
        try:
            old_boxes = {c['id']: dict(box=c['box'], part=c['part']) for c in json.load(open(OUT_JSON))['components'] if c.get('box') and c.get('drawn') == 'blender'}
        except Exception:
            pass
    boxes = boxes if boxes is not None else old_boxes

    for mod in SECTIONS:
        sec = mod.SECTION
        ways = Ways(mod.NODES, mod.EDGES)
        ship_xyz_ = xyz_of(mod)

        # ---- components
        for c in mod.COMPONENTS:
            if c['id'] in by_id:
                problems.append(f"{c['id']}: the tag is used twice")
            sysid = c['id'].split('-')[0]
            if sysid not in systems:
                problems.append(f"{c['id']}: no subsystem {sysid}")
            if c['room'] not in sec['rooms']:
                problems.append(f"{c['id']}: no room {c['room']} in the {sec['name'].lower()}")
            node = c['node'] or ways.nearest(c['at'])
            if node not in mod.NODES:
                problems.append(f"{c['id']}: no cable way point {node}")
                node = ways.nearest(c['at'])
            tail = c['tail'] if c['tail'] is not None else manhattan(mod.NODES[node], c['at'])
            rec = dict(id=c['id'], name=c['name'], sys=sysid, section=sec['id'], room=c['room'], roomName=sec['rooms'][c['room']], what=c['what'],
                       at=ship_xyz_(c['at']), w=c['w'], use=c['use'], by=list(c['by']) if c['by'] else None, alt=list(c['alt']) if c['alt'] else None,
                       basis=c['basis'], pick=c['pick'], nets=[], pipes=[])
            for key in ('hid', 'survey', 'kks', 'note'):
                if c[key]:
                    rec[key] = c[key]
            if c['box']:
                x0, x1, y0, y1, h0, h1 = c['box']
                rec['box'] = [ship_xyz_((x0, y0, h0)), ship_xyz_((x1, y1, h1))]
                rec['drawn'] = 'elsewhere'
                rec['part'] = 'top'
            elif c['id'] in boxes:
                rec['box'] = [[round(v, 3) for v in boxes[c['id']]['box'][0]], [round(v, 3) for v in boxes[c['id']]['box'][1]]]
                rec['drawn'] = 'blender'
                rec['part'] = boxes[c['id']]['part']
            elif c['g']['kind'] != 'none':
                missing.append(c['id'])
            by_id[c['id']] = dict(rec=rec, src=c, node=node, tail=tail, ways=ways, mod=mod)
            comps.append(rec)

        # ---- boards and circuits of the section
        for b in mod.BOARDS:
            if b['comp'] not in by_id:
                problems.append(f"board {b['id']}: its component {b['comp']} is not registered")
            boards[b['id']] = dict(b, section=sec['id'], where=sec['rooms'][by_id[b['comp']]['rec']['room']] if b['comp'] in by_id else '')
        for board, no, name, breaker, mm2, pf in mod.CIRCUITS:
            circuits[(board, no)] = dict(board=board, no=no, name=name, breaker=breaker, mm2=mm2, pf=pf, consumers=[], standby=[], feeds=None, section=sec['id'])
        for key, c in mod.OUTSIDE_CIRCUITS.items():
            circuits[key] = dict(board=key[0], no=key[1], name=c['name'], breaker=c['breaker'], mm2=c['mm2'], pf=1.0, consumers=[], standby=[], feeds=None,
                                 section=sec['id'], given_length=c.get('length'), note=c.get('note'), kks=c.get('kks'))

    # ---- who is on which circuit
    for cid, e in by_id.items():
        c = e['src']
        if c['w'] and not c['by']:
            problems.append(f"{cid}: draws {c['w']} W and is on no circuit")
        for key, slot in ((c['by'], 'consumers'), (c['alt'], 'standby')):
            if key is None:
                continue
            if tuple(key) not in circuits:
                problems.append(f"{cid}: circuit {key[0]} {key[1]} does not exist")
            else:
                circuits[tuple(key)][slot].append(cid)
    for bid, b in boards.items():
        for key, slot in ((b.get('fed_by'), 'main'), (b.get('alt'), 'alt')):
            if isinstance(key, tuple):
                if key not in circuits:
                    problems.append(f'board {bid}: circuit {key[0]} {key[1]} that feeds it does not exist')
                else:
                    circuits[key]['feeds'] = bid
                    circuits[key]['feeds_as'] = slot

    def volts_of(bid):
        return boards[bid]['volts'], boards[bid]['kind']

    def path_between(a, b):
        """The cable's way from component a to component b: points (bridge-deck places) and its length as laid."""
        ea, eb = by_id[a], by_id[b]
        ways = ea['ways']
        names, d = ways.between(ea['node'], eb['node'])
        pts = legs(ea['src']['at'], ways.nodes[ea['node']])
        pts += ways.run(names)[1:]
        tail_pts = legs(ways.nodes[eb['node']], eb['src']['at']) if eb['src']['tail'] is None else [ways.nodes[eb['node']]]
        pts += tail_pts[1:]
        clean = [pts[0]]
        for p in pts[1:]:
            if manhattan(p, clean[-1]) > 1e-6:
                clean.append(p)
        return clean, ea['tail'] + d + eb['tail']

    # ---- loads, from the leaves up: a circuit that feeds a board carries that board's load
    def board_watts(bid, which='w'):
        total = 0.0
        for (b, no), k in circuits.items():
            if b == bid:
                total += circuit_watts(k, which)
        return total

    def circuit_watts(k, which='w'):
        w = sum(by_id[c]['src']['w'] * (by_id[c]['src']['use'] if which == 'sea' else 1.0) for c in k['consumers'])
        if k['feeds'] and k.get('feeds_as') == 'main':
            w += board_watts(k['feeds'], which)
        return w

    def round_up(x, step=0.5):
        return math.ceil(x / step - 1e-9) * step

    def entry(mod, bid):
        """Where the cables from a board elsewhere come into the section: the main supplies by one way, the emergency ones by another."""
        return getattr(mod, 'ENTRY', {}).get(bid, 'COR')

    fire = set()
    for mod in SECTIONS:
        fire |= set(getattr(mod, 'FIRE_RESISTANT', ()))

    def cable(mm2, resistant=False, kind='AC'):
        return f"{S.cores(kind)} × {mm2:g} mm² + earth" + (', fire-resistant' if resistant else '')

    out_boards = []
    drop_to = {}                                   # board → per cent lost from its source's bars to its own
    order = [b for b in boards if boards[b].get('section')]
    # a board fed from a circuit of another comes after it
    order.sort(key=lambda b: isinstance(boards[b].get('fed_by'), tuple))
    for bid in order:
        b = boards[bid]
        volts, kind = b['volts'], b['kind']
        rec = dict(id=bid, name=b['name'], volts=volts, kind=kind, section=b['section'], where=b.get('where', ''), comp=b['comp'], text=b.get('text', ''), circuits=[])
        watts, sea = board_watts(bid), board_watts(bid, 'sea')
        rec['load'] = dict(connected=round(watts), sea=round(sea))
        fed = b['fed_by']
        if isinstance(fed, tuple):
            rec['fedBy'] = dict(board=fed[0], circuit=fed[1])
            if b.get('alt'):
                rec['alt'] = dict(board=b['alt'][0], circuit=b['alt'][1])
            drop_to[bid] = None                    # filled in when its feeding circuit is worked out
        else:
            src = boards[fed]
            f = b['feeder']
            comp = by_id[b['comp']]
            ways = comp['ways']
            names, d = ways.between(entry(comp['mod'], fed), comp['node'])
            laid = d + comp['tail']
            length = round_up(src.get('ext', 0.0) + laid * S.ALLOWANCE)
            standby = sum(circuit_watts(k) if not k['consumers'] else 0 for (bb, no), k in circuits.items() if bb == bid and k['feeds'] and k.get('feeds_as') == 'alt')
            standby += sum(by_id[c]['src']['w'] for (bb, no), k in circuits.items() if bb == bid for c in k['standby'])
            standby += sum(board_watts(k['feeds']) for (bb, no), k in circuits.items() if bb == bid and k['feeds'] and k.get('feeds_as') == 'alt')
            amps = S.amps(watts, volts, kind)
            amps_all = S.amps(watts + standby, volts, kind)
            dv = S.drop_volts(length, amps, f['mm2'], kind)
            pct = 100 * dv / volts
            pts = ways.run(names) + legs(ways.nodes[comp['node']], comp['src']['at'])[1:]
            ship_xyz_ = xyz_of(comp['mod'])
            rec['fedBy'] = dict(board=fed, name=src['name'], where=src['where'])
            rec['feeder'] = dict(breaker=f['breaker'], mm2=f['mm2'], cable=cable(f['mm2'], ('feeder', bid) in fire, kind), length=length, amps=round(amps, 1), drop=round(pct, 1),
                                 standby=round(standby), path=[ship_xyz_(p) for p in pts])
            drop_to[bid] = pct
            # a second feeder from another switchboard (the navigation lights): it carries the whole board when it is the one in use
            af = b.get('alt_feeder')
            if af:
                src2 = boards[af['board']]
                # `via` leads the second feeder round by another side of the room, so that the two meet only at the board
                if af.get('via'):
                    first, d_a = ways.between(entry(comp['mod'], af['board']), af['via'])
                    rest, d_b = ways.between(af['via'], comp['node'])
                    names2, d2 = first + rest[1:], d_a + d_b
                else:
                    names2, d2 = ways.between(entry(comp['mod'], af['board']), comp['node'])
                length2 = round_up(src2.get('ext', 0.0) + (d2 + comp['tail']) * S.ALLOWANCE)
                pct2 = 100 * S.drop_volts(length2, amps, af['mm2'], kind) / volts
                pts2 = ways.run(names2) + legs(ways.nodes[comp['node']], comp['src']['at'])[1:]
                rec['altFeeder'] = dict(board=af['board'], name=src2['name'], where=src2['where'], breaker=af['breaker'], mm2=af['mm2'],
                                        cable=cable(af['mm2'], ('alt', bid) in fire, kind), length=length2, amps=round(amps, 1), drop=round(pct2, 1), path=[ship_xyz_(p) for p in pts2])
                drop_to[bid] = max(pct, pct2)
                shared = len(set(map(tuple, map(ship_xyz_, pts))) & set(map(tuple, map(ship_xyz_, pts2))))
                rec['altFeeder']['sharedPoints'] = shared
                if af['breaker'] not in S.BREAKERS or af['breaker'] < S.MARGIN * amps - 1e-6:
                    problems.append(f"{bid} second feeder: {af['breaker']} A breaker for {amps:.1f} A")
                if S.rating(af['mm2'], kind) < af['breaker']:
                    problems.append(f"{bid} second feeder: {af['mm2']:g} mm² is rated {S.rating(af['mm2'], kind)} A, under its {af['breaker']} A breaker")
                if pct2 > S.DROP_ONE_CABLE + 1e-6:
                    problems.append(f"{bid} second feeder: {pct2:.1f} % voltage drop over {length2:g} m of {af['mm2']:g} mm²")
            if f['breaker'] not in S.BREAKERS:
                problems.append(f"{bid} feeder: {f['breaker']} A is not a standard breaker")
            if f['breaker'] < S.MARGIN * amps - 1e-6:
                problems.append(f"{bid} feeder: {f['breaker']} A breaker for {amps:.1f} A (needs {S.MARGIN * amps:.1f} A)")
            if f['breaker'] < amps_all - 1e-6:
                problems.append(f"{bid} feeder: {f['breaker']} A breaker for {amps_all:.1f} A with the standby loads on")
            if S.rating(f['mm2'], kind) < f['breaker']:
                problems.append(f"{bid} feeder: {f['mm2']:g} mm² is rated {S.rating(f['mm2'], kind)} A, under its {f['breaker']} A breaker")
            if pct > S.DROP_ONE_CABLE + 1e-6:
                problems.append(f"{bid} feeder: {pct:.1f} % voltage drop over {length:g} m of {f['mm2']:g} mm²")
        out_boards.append(rec)

    # ---- circuits
    def work(key):
        k = circuits[key]
        bid = k['board']
        own = bid in drop_to
        volts, kind = (boards[bid]['volts'], boards[bid]['kind'])
        pf = k['pf'] if k['pf'] is not None else 0.9
        watts = circuit_watts(k)
        if k['feeds'] and k.get('feeds_as') == 'alt':
            standby = board_watts(k['feeds'])
        else:
            standby = sum(by_id[c]['src']['w'] for c in k['standby'])
        amps = S.amps(watts, volts, kind, pf)
        amps_all = S.amps(watts + standby, volts, kind, pf)
        rec = dict(no=k['no'], name=k['name'], breaker=k['breaker'], mm2=k['mm2'], cable=cable(k['mm2'], key in fire, kind), watts=round(watts), amps=round(amps, 2),
                   consumers=list(k['consumers']), standby=list(k['standby']), paths={})
        if standby:
            rec['standbyWatts'] = round(standby)
        if k['feeds']:
            rec['feeds'] = k['feeds']
            rec['feedsAs'] = k['feeds_as']
        for extra in ('note', 'kks'):
            if k.get(extra):
                rec[extra] = k[extra]
        ends = list(k['consumers']) + list(k['standby']) + ([boards[k['feeds']]['comp']] if k['feeds'] else [])
        if not ends:
            problems.append(f'{bid} {k["no"]} ({k["name"]}): nothing is on it')
        longest = 0.0
        start = boards[bid].get('comp') if own else None
        for c in ends:
            if start:
                try:
                    pts, laid = path_between(start, c)
                except KeyError as err:
                    problems.append(f'{bid} {k["no"]}: {err.args[0]}')
                    continue
                rec['paths'][c] = [xyz_of(by_id[c]['mod'])(p) for p in pts]
                longest = max(longest, laid)
            else:
                e = by_id[c]
                names, d = e['ways'].between(entry(e['mod'], bid), e['node'])
                pts = e['ways'].run(names) + legs(e['ways'].nodes[e['node']], e['src']['at'])[1:]
                rec['paths'][c] = [xyz_of(e['mod'])(p) for p in pts]
                longest = max(longest, d + e['tail'])
        if 'given_length' in k and k['given_length'] is not None:
            length = k['given_length']
        else:
            length = round_up((0.0 if own else boards[bid].get('ext', 0.0)) + longest * S.ALLOWANCE)
        current = amps if watts else amps_all       # a standby-only way is sized for what it would carry
        dv = S.drop_volts(length, current, k['mm2'], kind)
        pct = 100 * dv / volts
        before = drop_to.get(bid) or 0.0
        rec.update(length=length, drop=round(pct, 1), total=round(before + pct, 1))
        tag = f'{bid} {k["no"]} ({k["name"]})'
        if k['breaker'] not in S.BREAKERS:
            problems.append(f'{tag}: {k["breaker"]} A is not a standard breaker')
        if k['breaker'] < S.MARGIN * amps - 1e-6:
            problems.append(f'{tag}: {k["breaker"]} A breaker for {amps:.2f} A (needs {S.MARGIN * amps:.2f} A)')
        if k['breaker'] < amps_all - 1e-6:
            problems.append(f'{tag}: {k["breaker"]} A breaker for {amps_all:.2f} A with the standby load on')
        if S.rating(k['mm2'], kind) < k['breaker']:
            problems.append(f'{tag}: {k["mm2"]:g} mm² is rated {S.rating(k["mm2"], kind)} A, under its {k["breaker"]} A breaker')
        if pct > S.DROP_ONE_CABLE + 1e-6:
            problems.append(f'{tag}: {pct:.1f} % voltage drop over {length:g} m of {k["mm2"]:g} mm²')
        if own and before + pct > S.DROP_TOTAL[kind] + 1e-6:
            problems.append(f'{tag}: {before + pct:.1f} % in all from the switchboard (limit {S.DROP_TOTAL[kind]:g} %)')
        if k['feeds'] and k.get('feeds_as') == 'main':
            drop_to[k['feeds']] = before + pct
        return rec

    done = {}
    for bid in order:
        for key in sorted((k for k in circuits if k[0] == bid), key=lambda k: k[1]):
            done[key] = work(key)
    outside = [dict(work(key), board=key[0]) for key in circuits if key[0] not in drop_to]
    for b in out_boards:
        b['circuits'] = [done[k] for k in sorted((k for k in done if k[0] == b['id']), key=lambda k: k[1])]
        if b['id'] in drop_to and 'feeder' not in b:
            b['dropTo'] = round(drop_to[b['id']] or 0.0, 1)

    # ---- nets
    for mod in SECTIONS:
        ship_xyz_ = xyz_of(mod)
        for n in mod.NETS:
            members, paths = [], []
            ids = []
            for who, role, says in n['members']:
                if who.startswith('ext:'):
                    _, place, what = who.split(':', 2)
                    if place not in S.ELSEWHERE:
                        problems.append(f"net {n['id']}: no place {place}")
                    members.append(dict(ext=what, place=S.ELSEWHERE.get(place, place), role=role, says=says))
                elif who not in by_id:
                    problems.append(f"net {n['id']}: {who} is not registered")
                else:
                    members.append(dict(id=who, role=role, says=says))
                    by_id[who]['rec']['nets'].append(n['id'])
                    ids.append(who)
            if len(members) < 2:
                problems.append(f"net {n['id']}: fewer than two ends")
            hub = n.get('hub')
            if hub and hub not in ids:
                problems.append(f"net {n['id']}: its hub {hub} is not one of its members")
            pairs = [(hub, i) for i in ids if i != hub] if hub else list(zip(ids, ids[1:]))
            for a, b in pairs:
                try:
                    pts, _ = path_between(a, b)
                    paths.append([ship_xyz_(p) for p in pts])
                except KeyError as err:
                    problems.append(f"net {n['id']}: {err.args[0]}")
            if any('ext' in m for m in members) and ids:
                # the way out of the section: from the hub (or the first member) to where the ship's cables arrive
                first = by_id[hub or ids[0]]
                names, _ = first['ways'].between(first['node'], n.get('out', 'COR'))
                pts = legs(first['src']['at'], first['ways'].nodes[first['node']]) + first['ways'].run(names)[1:]
                paths.append([ship_xyz_(p) for p in pts])
            nets.append(dict(id=n['id'], name=n['name'], medium=n['medium'], text=n.get('text', ''), hub=hub, section=mod.SECTION['id'], members=members, paths=paths,
                             kind=n.get('kind', 'signal')))

        # ---- pipes
        for p in mod.PIPES:
            ends = []
            for who in p['ends']:
                if who.startswith('ext:'):
                    _, place, what = who.split(':', 2)
                    if place not in S.ELSEWHERE:
                        problems.append(f"pipe {p['id']}: no place {place}")
                    ends.append(dict(ext=what, place=S.ELSEWHERE.get(place, place)))
                elif who not in by_id:
                    problems.append(f"pipe {p['id']}: {who} is not registered")
                else:
                    ends.append(dict(id=who))
                    by_id[who]['rec']['pipes'].append(p['id'])
            if len(p['path']) < 2:
                problems.append(f"pipe {p['id']}: no run")
            length = sum(math.dist(a, b) for a, b in zip(p['path'], p['path'][1:]))
            pipes.append(dict(id=p['id'], system=p['system'], name=p['name'], dn=p['dn'], medium=p['medium'], material=p['material'], text=p['text'],
                              section=mod.SECTION['id'], ends=ends, path=[ship_xyz_(q) for q in p['path']], length=round(length, 1)))

    # ---- every component is somewhere: on a circuit, a net or a pipe, or it needs none
    for cid, e in by_id.items():
        r = e['rec']
        is_board = any(b.get('comp') == cid for b in boards.values())
        if r['sys'] in ('NAV', 'STR', 'PRP', 'COM', 'INT', 'ALM', 'HVC') and not (r['by'] or r['nets'] or r['pipes'] or is_board) \
                and e['src']['g']['kind'] not in ('dial', 'periscope') and 'own battery' not in r['what']:
            notes.append(f'{cid} ({r["name"]}): on no circuit, net or pipe')

    if missing:
        notes.append(f'{len(missing)} components have no place in the model yet (run blender/build.py and pass its part file): ' + ' '.join(missing[:8]) + (' …' if len(missing) > 8 else ''))
    subs = []
    for s in S.SUBSYSTEMS:
        n = sum(1 for c in comps if c['sys'] == s['id'])
        if n:
            subs.append(dict(s, count=n))
    data = dict(
        format='chisum-systems-1',
        ship=S.SHIP, supply=S.SUPPLY, sources=S.SOURCES,
        elsewhere=[dict(id=b['id'], name=b['name'], volts=b['volts'], kind=b['kind'], where=b['where'], text=b.get('text', ''), fedBy=b.get('fed_by', []))
                   for b in S.BOARDS],
        rules=dict(margin=S.MARGIN, dropOneCable=S.DROP_ONE_CABLE, dropTotal=S.DROP_TOTAL, allowance=S.ALLOWANCE, rho=S.RHO,
                   text='A breaker is at least 1.25 times the full-load current; a cable is rated for its breaker; no cable loses more than 5 % of the voltage, '
                        'and no consumer more than 6 % in all from the switchboard (10 % on a battery supply). A cable\'s length is the way it is laid along, and a tenth more.'),
        sections=[dict(id=m.SECTION['id'], name=m.SECTION['name'], rooms=m.SECTION['rooms']) for m in SECTIONS],
        subsystems=subs, boards=out_boards, outside=outside, nets=nets, pipes=pipes, components=comps,
    )
    return data, problems, notes


def tables(data):
    os.makedirs(OUT_DIR, exist_ok=True)
    by = {c['id']: c for c in data['components']}
    for sec in data['sections']:
        sid = sec['id']
        with open(os.path.join(OUT_DIR, f'{sid}-components.csv'), 'w', newline='') as f:
            w = csv.writer(f)
            w.writerow(['tag', 'name', 'subsystem', 'room', 'watts', 'share at sea', 'supply', 'second supply', 'nets', 'pipes', 'x', 'y above waterline', 'z from amidships',
                        'in the model', 'where, if hidden', 'basis of the power figure', 'survey row', 'KKS tag (Minato Maru)', 'what it is'])
            for c in data['components']:
                if c['section'] != sid:
                    continue
                w.writerow([c['id'], c['name'], c['sys'], c['roomName'], c['w'] or '', c['use'] if c['w'] else '', ' '.join(map(str, c['by'])) if c['by'] else '',
                            ' '.join(map(str, c['alt'])) if c['alt'] else '', ' '.join(c['nets']), ' '.join(c['pipes']), *c['at'],
                            {'blender': 'built', 'elsewhere': 'built (compass deck)'}.get(c.get('drawn'), 'not built'), c.get('hid', ''), c['basis'] if c['w'] else '',
                            c.get('survey', ''), c.get('kks', ''), c['what']])
        with open(os.path.join(OUT_DIR, f'{sid}-circuits.csv'), 'w', newline='') as f:
            w = csv.writer(f)
            w.writerow(['board', 'way', 'name', 'volts', 'watts', 'amps', 'breaker A', 'cable', 'length m', 'drop %', 'drop in all %', 'consumers', 'standby for'])
            for b in data['boards']:
                if b['section'] != sid:
                    continue
                if 'feeder' in b:
                    fd = b['feeder']
                    w.writerow([b['id'], 'feeder', f"from {b['fedBy']['board']} ({b['fedBy']['name']})", b['volts'], b['load']['connected'], fd['amps'], fd['breaker'], fd['cable'],
                                fd['length'], fd['drop'], fd['drop'], '', ''])
                if 'altFeeder' in b:
                    fd = b['altFeeder']
                    w.writerow([b['id'], 'second feeder', f"from {fd['board']} ({fd['name']})", b['volts'], b['load']['connected'], fd['amps'], fd['breaker'], fd['cable'],
                                fd['length'], fd['drop'], fd['drop'], '', ''])
                for k in b['circuits']:
                    w.writerow([b['id'], k['no'], k['name'], b['volts'], k['watts'], k['amps'], k['breaker'], k['cable'], k['length'], k['drop'], k['total'],
                                ' '.join(k['consumers']) or (k.get('feeds', '') if k.get('feedsAs') == 'main' else ''),
                                ' '.join(k['standby']) or (k.get('feeds', '') if k.get('feedsAs') == 'alt' else '')])
            for k in data['outside']:
                w.writerow([k['board'], k['no'], k['name'], '', k['watts'], k['amps'], k['breaker'], k['cable'], k['length'], k['drop'], '', ' '.join(k['consumers']), ''])
        with open(os.path.join(OUT_DIR, f'{sid}-nets.csv'), 'w', newline='') as f:
            w = csv.writer(f)
            w.writerow(['net', 'name', 'medium', 'member', 'name or place', 'role', 'what it says'])
            for n in data['nets']:
                if n['section'] != sid:
                    continue
                for m in n['members']:
                    w.writerow([n['id'], n['name'], n['medium'], m.get('id', 'elsewhere'), by[m['id']]['name'] if 'id' in m else f"{m['place']}: {m['ext']}", m['role'], m['says']])
        with open(os.path.join(OUT_DIR, f'{sid}-pipes.csv'), 'w', newline='') as f:
            w = csv.writer(f)
            w.writerow(['pipe', 'system', 'name', 'DN', 'medium', 'material', 'length on the bridge m', 'joins', 'what it is'])
            for p in data['pipes']:
                if p['section'] != sid:
                    continue
                w.writerow([p['id'], p['system'], p['name'], p['dn'], p['medium'], p['material'], p['length'],
                            ' → '.join(e.get('id') or f"{e['place']}: {e['ext']}" for e in p['ends']), p['text']])


def write(boxes=None, quiet=False):
    data, problems, notes = build(boxes)
    if problems:
        for p in problems:
            print('  FAILS', p)
        raise SystemExit(f'the register does not hold: {len(problems)} checks failed')
    with open(OUT_JSON, 'w') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    tables(data)
    if not quiet:
        comps = data['components']
        drawn = sum(1 for c in comps if c.get('drawn'))
        print(f"{OUT_JSON}: {os.path.getsize(OUT_JSON)} bytes; {len(comps)} components ({drawn} in the model), "
              f"{sum(len(b['circuits']) for b in data['boards'])} circuits on {len(data['boards'])} boards, {len(data['nets'])} nets, {len(data['pipes'])} pipes; all checks hold")
        for b in data['boards']:
            fd = b.get('feeder')
            print(f"  {b['id']:4s} {b['volts']:3d} V {b['kind']}  {b['load']['connected']:5d} W connected, {b['load']['sea']:5d} W at sea" +
                  (f"   feeder {fd['amps']:.1f} A, {fd['breaker']} A, {fd['cable']}, {fd['length']:g} m, {fd['drop']:.1f} %" if fd else f"   from {b['fedBy']['board']} way {b['fedBy']['circuit']}"))
        for n in notes:
            print('  note:', n)
    return data


def boxes_from(path):
    import numpy as np
    z = np.load(path)
    return json.loads(bytes(z['meta']).decode()).get('components', {})


if __name__ == '__main__':
    args = sys.argv[1:]
    write(boxes_from(args[args.index('--boxes') + 1]) if '--boxes' in args else None)
