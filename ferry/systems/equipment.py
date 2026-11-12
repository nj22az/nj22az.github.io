#!/usr/bin/env python3
"""
Everything aboard the Chisum, once: the list her maintenance program is filled from.

    python3 ferry/systems/equipment.py [--inventory /tmp/x.inventory.json]     writes ferry/data/equipment.json

The owner, 12 November 2026, of the computer in the chief engineer's cabin: "Which has all parts and equipment onboard".
Design record: ferry/yard/design/maintenance-computer.md.

She knows herself in three places, and this joins them; nothing is typed here that a builder already says:

  the register        ferry/data/systems.json (made by register.py from bridge.py and stern.py): every component with its tag,
                      its system, its room, its place, what it is and what feeds it;
  the deck fittings   ferry/blender/spec.py, OUTFIT: windlasses, winches, capstans, bitts, chocks, fairleads, boats, rafts,
                      ventilators, air pipes, monitors, each with its place and why it stands there. None is in the register;
  what the build      an inventory written by build.py as it builds (a section may answer `inventory()`): the light fittings,
  itself says         and each fitting's parts as its builder names them. Those builders run inside Blender and cannot be
                      asked from here: without `--inventory` the list is made without them, and says so.

Each item: `id` (its tag where it has one), `name`, `kind`, `system` and `systemName`, `deck` and `deckName`, `room` and
`roomName`, `at` (x to port, metres over the waterline, metres forward of amidships: the page's own measures, so the ship can
take one to it), `what`, `parts` (a list, empty where no builder names them yet), `source` (which of the three it is from).
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'blender'))
import ga
import spec as S

DATA = os.path.join(HERE, '..', 'data')
OUT = os.path.join(DATA, 'equipment.json')

# The deck fittings' systems. The register's own (NAV, STR, HYD and the rest) come with their names from the register.
SYSTEMS = dict(
    MOR=('Mooring and anchoring', 'Windlasses, chain stoppers, mooring winches, capstans, bitts, chocks, fairleads and rope reels.'),
    LSA=('Life-saving appliances', 'The lifeboats under their davits and the liferafts.'),
    VNT=('Ventilators and air pipes', 'The ventilators of the spaces below and the tanks\' air pipes, on the open decks.'),
    FIR=('Fire fighting', 'The foam monitors.'),
    CGO=('Cargo securing', 'Lashing pots in the vehicle decks.'),
    DLT=('Deck lighting', 'Floodlights on the open decks.'),
    LGT=('Lighting', 'The light fittings of her spaces.'),
    DKO=('Deck outfit', 'What stands on her decks beside.'),
)
# kind: (its name, its system)
KINDS = {
    'windlass': ('Anchor windlass and mooring winch', 'MOR'), 'chain-stopper': ('Chain stopper', 'MOR'), 'mooring-winch': ('Mooring winch', 'MOR'),
    'capstan': ('Capstan', 'MOR'), 'bitts': ('Bitts', 'MOR'), 'panama-chock': ('Panama chock', 'MOR'), 'roller-fairlead': ('Roller fairlead', 'MOR'),
    'rope-reel': ('Rope reel', 'MOR'), 'lifeboat-station': ('Lifeboat and davits', 'LSA'), 'liferaft': ('Liferaft', 'LSA'),
    'ventilator-mushroom': ('Mushroom ventilator', 'VNT'), 'ventilator-gooseneck': ('Gooseneck ventilator', 'VNT'), 'air-pipe': ('Air pipe', 'VNT'),
    'foam-monitor': ('Foam monitor', 'FIR'), 'lashing-pot': ('Lashing pots', 'CGO'), 'floodlight': ('Floodlight', 'DLT'), 'bench': ('Bench', 'DKO'),
}
DECK_NAMES = dict(hold='Lower hold', main='Main deck', upper='Upper deck', boat='Boat deck', officers="Officers' deck", bridge='Bridge deck', top='House top')
SIDE = {'p': 'port', 's': 'starboard'}


def room_at(deck, yard, x):
    """The space of the arrangement a place on a deck lies in: (id, name), or the deck itself where it lies in none."""
    best = None
    for sp in ga.SPACES:
        if sp['plan'] != deck:
            continue
        (a, b), (x0, x1) = sp['yard'], sp['x']
        if min(a, b) <= yard <= max(a, b) and min(x0, x1) <= x <= max(x0, x1):
            size = abs(b - a) * abs(x1 - x0)
            if best is None or size < best[0]:              # the smallest space that holds it (a room within a deck)
                best = (size, sp['id'], sp['name'])
    return (best[1], best[2]) if best else (deck, DECK_NAMES.get(deck, deck))


def from_register(reg):
    names = {s['id']: s['name'] for s in reg['subsystems']}
    decks = {'bridge': 'bridge', 'top': 'top', 'officers': 'officers', 'boat': 'boat', 'upper': 'upper', 'main': 'main', 'hull': 'hold', 'hold': 'hold'}
    out = []
    for c in reg['components']:
        deck = decks.get(c.get('part'), c.get('part') or '')
        out.append(dict(id=c['id'], name=c['name'], kind=names.get(c['sys'], c['sys']), system=c['sys'], systemName=names.get(c['sys'], c['sys']),
                        deck=deck, deckName=DECK_NAMES.get(deck, deck), room=c['room'], roomName=c['roomName'], at=[round(v, 3) for v in c['at']],
                        what=c['what'], parts=[], source='register'))
    return out


def from_outfit(half):
    out = []
    for o in S.OUTFIT:
        kind = o['kind']
        name, system = KINDS.get(kind, (kind.replace('-', ' ').capitalize(), 'DKO'))
        side = SIDE.get(o['id'].rsplit('-', 1)[-1])
        if 'grid' in o:                                     # a field of lashing pots: one item, where its middle is
            (ya, yb, _), (xa, xb, _) = o['grid']['yard'], o['grid']['x']
            yard, x = (ya + yb) / 2, (xa + xb) / 2
        else:
            yard, x = o['yard'], o['x']
        room, room_name = room_at(o['deck'], yard, x)
        out.append(dict(id=o['id'], name=name + (', ' + side if side else ''), kind=name, system=system, systemName=SYSTEMS[system][0],
                        deck=o['deck'], deckName=DECK_NAMES.get(o['deck'], o['deck']), room=room, roomName=room_name,
                        at=[round(x, 3), round(S.LEVELS.get(o['deck'], 0.0), 3), round(yard - half, 3)],
                        what=(o.get('note') or '').strip().capitalize(), parts=[], source='deck fittings'))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--inventory', help='what build.py wrote beside the part file: the light fittings, and each fitting\'s parts')
    a = ap.parse_args()
    reg = json.load(open(os.path.join(DATA, 'systems.json')))
    half = ga.LENGTH / 2 if hasattr(ga, 'LENGTH') else None
    if half is None:
        import lines
        half = lines.LOA / 2 if hasattr(lines, 'LOA') else lines.LENGTH / 2
    items = from_register(reg) + from_outfit(half)
    missing = []
    if a.inventory and os.path.exists(a.inventory):
        inv = json.load(open(a.inventory))
        by_id = {i['id']: i for i in items}
        for more in inv.get('items', []):                   # what only the build can say: an item of its own, or the parts of one above
            if more['id'] in by_id:
                by_id[more['id']].update({k: v for k, v in more.items() if k in ('parts', 'what') and v})
            else:
                items.append(more)
    else:
        missing = ['the light fittings (392 in 97 spaces, counted by the build)', 'each deck fitting\'s parts, as its builder names them']
    ids = [i['id'] for i in items]
    twice = sorted({i for i in ids if ids.count(i) > 1})
    if twice:
        raise SystemExit('equipment.json is not written: these are listed twice: ' + ', '.join(twice))
    systems, seen = [], set()
    reg_sys = {s['id']: s for s in reg['subsystems']}
    for i in items:
        if i['system'] in seen:
            continue
        seen.add(i['system'])
        s = reg_sys.get(i['system'])
        name, text = (s['name'], s['text']) if s else SYSTEMS.get(i['system'], (i['systemName'], ''))
        systems.append(dict(id=i['system'], name=name, text=text, count=sum(1 for j in items if j['system'] == i['system'])))
    by_source = {}
    for i in items:
        by_source[i['source']] = by_source.get(i['source'], 0) + 1
    doc = dict(format='chisum-equipment-1', ship=dict(name='Chisum', line='Johansson Line', length=round(half * 2, 2)),
               made='ferry/systems/equipment.py, from ferry/data/systems.json, ferry/blender/spec.py (OUTFIT)' + (' and the build\'s inventory' if not missing else ''),
               counts=dict(items=len(items), **by_source), notYetListed=missing,
               notAboard='Below the main deck she has no main engine, gear, generator or pump yet; the main switchboard is one item of nine cubicles. What is not built is not listed.',
               systems=systems, items=items)
    with open(OUT, 'w') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{os.path.relpath(OUT)}: {len(items)} items in {len(systems)} systems (' + ', '.join(f'{v} from the {k}' for k, v in by_source.items()) + ')'
          + ('; not yet listed: ' + '; '.join(missing) if missing else ''))


if __name__ == '__main__':
    main()
