#!/usr/bin/env python3
"""
Does the installation work? The register, switched.

The owner, 11 November 2026: "all the wiring should be accurate and drawn in drawings in cad , with part lists , it needs to be a
functional electrical installation". register.py sizes every cable and breaker; this tool asks the other question: with the
installation as registered, **is every consumer fed, what does each breaker take with it, and what is still alive when a
source is lost?** It switches the register as one would switch the ship: sources on and off, one breaker at a time.

    python3 ferry/systems/prove.py          writes ../yard/calc/JS8-851-proof-of-supply.md and stops (exit 1) if the proof fails

How it reasons (plain rules, said here so the result can be judged):
  - a source is on or off; a board is alive if one of the boards or sources that feed it is alive and the breaker of that
    feeder is shut. A board with two feeders changes over by itself (the register says so of each: the navigation light
    panel's change-over switch, the transitional section's inverter, the emergency switchboard's bus-tie);
  - a consumer is alive if its circuit's breaker is shut and its board alive, or the same of its second supply;
  - nothing is asked here of time (how long a battery lasts is calculation JS8-855) or of fault currents (JS8-853, to do).

It reads ../data/systems.json, as the page does: what is proven is what the page shows and the model is built from.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data', 'systems.json')
OUT = os.path.join(HERE, '..', 'yard', 'calc', 'JS8-851-proof-of-supply.md')


def load():
    d = json.load(open(DATA, encoding='utf-8'))
    feeders = {}                                         # board -> [(what feeds it, the feeder's own breaker id or None)]
    for e in d['elsewhere']:
        feeders[e['id']] = [(f, None) for f in e['fedBy']]
    for b in d['boards']:
        feeders[b['id']] = [(b['fedBy']['board'], f"{b['id']} feeder")]
        if b.get('altFeeder'):
            feeders[b['id']].append((b['altFeeder']['board'], f"{b['id']} second feeder"))
    ways = {}                                            # (board, way) -> the circuit
    for b in d['boards']:
        for k in b['circuits']:
            ways[(b['id'], str(k['no']))] = dict(k, board=b['id'])
    for k in d['outside']:
        ways[(k['board'], str(k['no']))] = k
    consumers = [c for c in d['components'] if c.get('by')]
    return d, feeders, ways, consumers


def alive_boards(d, feeders, on, opened=()):
    """Which boards are alive with these sources on and these breakers open."""
    live = set(on)
    changed = True
    while changed:
        changed = False
        for board, feeds in feeders.items():
            if board in live:
                continue
            if any(src in live and (brk is None or brk not in opened) for src, brk in feeds):
                live.add(board)
                changed = True
    return live


def fed(c, live, opened=()):
    """Whether a consumer is alive, and by which of its supplies."""
    for which, by in (('first', c.get('by')), ('second', c.get('alt'))):
        if by and by[0] in live and f'{by[0]} way {by[1]}' not in opened:
            return which
    return None


def main():
    d, feeders, ways, consumers = load()
    sources = {s['id']: s for s in d['sources']}
    names = {c['id']: c['name'] for c in d['components']}
    board_name = {b['id']: b['name'] for b in d['boards']} | {e['id']: e['name'] for e in d['elsewhere']}
    fails, out = [], []
    w = out.append

    def tell(c):
        return f"{c['id']} {c['name']}"

    w('# JS8-851 · Proof of supply: the installation, switched')
    w('')
    w(f"Johansson Shipyard · calculation · made by `ferry/systems/prove.py` from the component register (`ferry/data/systems.json`) · {d['ship']['name']}")
    w('')
    w('The owner, 11 November 2026: "it needs to be a functional electrical installation". This sheet switches the installation as')
    w('registered: every source on and off, every breaker opened once, and says what is alive each time. It is made again whenever')
    w('the register changes, and the tool stops with an error if a consumer has no supply or a required service dies.')
    w('')
    w(f"**Scope.** {len(consumers)} consumers with a supply, on {len(d['boards'])} boards of the bridge and {len(d['outside'])} circuits direct from boards")
    w(f"elsewhere; {len(d['elsewhere'])} boards elsewhere; {len(sources)} sources. The register holds the navigation bridge and what feeds it:")
    w('her machinery, lighting and galley are not registered yet, so nothing is proven of them.')
    w('')

    # ---- 1. every consumer has a protected way to a source
    w('## 1. Every consumer has a protected way back to a source')
    w('')
    every = alive_boards(d, feeders, set(sources))
    orphans = [c for c in consumers if not fed(c, every)]
    unknown = [c for c in consumers if (c['by'][0], str(c['by'][1])) not in ways or (c.get('alt') and (c['alt'][0], str(c['alt'][1])) not in ways)]
    w(f'With every source on, **{len(consumers) - len(orphans)} of {len(consumers)} consumers are alive**.'
      + (' Not alive: ' + '; '.join(tell(c) for c in orphans) + '.' if orphans else ' None is without a supply.'))
    if orphans:
        fails.append(f'{len(orphans)} consumers have no way to a source')
    if unknown:
        fails.append('a consumer names a way the register does not hold: ' + ', '.join(c['id'] for c in unknown))
        w('')
        w('**A consumer names a way that is not in the register:** ' + ', '.join(tell(c) for c in unknown) + '.')
    w('')
    w('Each way is protected by its own breaker and each board by its feeder\'s (the sizes are in the cable schedule, JS8-856:')
    w(f"a breaker is at least {d['rules']['margin']} times the load, a cable is rated for its breaker, no cable loses more than")
    w(f"{d['rules']['dropOneCable']} % of the voltage). How each board is reached:")
    w('')
    w('| Board | Fed from | Then from |')
    w('|---|---|---|')

    def chain(board, seen=()):
        feeds = [f for f, _ in feeders.get(board, [])]
        return ' or '.join(f if f in sources else f + (' ← (' + chain(f, seen + (board,)) + ')' if f not in seen else '') for f in feeds)
    for b in d['boards']:
        feeds = [f for f, _ in feeders[b['id']]]
        w(f"| **{b['id']}** {b['name']} | {' and '.join(feeds)} | {'; '.join(f + ' ← ' + chain(f) for f in feeds)} |")
    w('')

    # ---- 2. what each breaker takes with it
    w('## 2. What each breaker takes with it')
    w('')
    w('At sea with the generators running, the emergency generator standing by and both batteries on, each breaker is opened')
    w('once. A consumer with a second supply stays alive on it. **A breaker takes only what hangs on it:** if opening one killed')
    w('something on another way, the tool would say so.')
    w('')
    at_sea = {s for s in sources if s not in ('SHORE', 'EG')}
    base = alive_boards(d, feeders, at_sea)
    base_dead = [c for c in consumers if not fed(c, base)]
    if base_dead:
        fails.append('at sea, without any fault, these are dead: ' + ', '.join(c['id'] for c in base_dead))
    breakers = []
    for b in d['boards']:
        for _, brk in feeders[b['id']]:
            breakers.append((brk, f"{b['id']}: its {'second ' if 'second' in brk else ''}feeder", None))
        for k in b['circuits']:
            breakers.append((f"{b['id']} way {k['no']}", f"{b['id']} way {k['no']} · {k['name']}", k))
    for k in d['outside']:
        breakers.append((f"{k['board']} way {k['no']}", f"{k['board']} · {k['name']}", k))
    w('| Breaker | A | Goes dead | Stays alive on its second supply |')
    w('|---|---|---|---|')
    spill = []
    for brk, label, k in breakers:
        live = alive_boards(d, feeders, at_sea, {brk})
        dead = [c for c in consumers if fed(c, base) and not fed(c, live, {brk})]
        kept = [c for c in consumers if fed(c, base) == 'first' and fed(c, live, {brk}) == 'second']
        if k is not None:                                # a way's breaker may kill only its own consumers
            own = set(k['consumers']) | set(k['standby'])
            stray = [c['id'] for c in dead if c['id'] not in own]
            if stray:
                spill.append(f'{label}: also {", ".join(stray)}')
        amps = k['breaker'] if k else next((b['feeder']['breaker'] if 'second' not in brk else b['altFeeder']['breaker']) for b in d['boards'] if brk.startswith(b['id'] + ' '))
        w(f"| {label} | {amps} | {', '.join(c['id'] for c in dead) or 'nothing'} | {', '.join(c['id'] for c in kept) or ''} |")
    if spill:
        fails.append('a breaker takes more than its own way: ' + '; '.join(spill))
    w('')
    w(f'{len(breakers)} breakers opened, one at a time.' + (' **Not selective:** ' + '; '.join(spill) if spill else ' Each took its own way and nothing else.'))
    w('')

    # ---- 3. losing a source
    w('## 3. Losing a source')
    w('')
    w('| Condition | Sources on | Boards alive | Consumers alive | What is dark |')
    w('|---|---|---|---|---|')
    cases = [
        ('At sea, normal', at_sea),
        ('Alongside, on the shore connection', {'SHORE', 'BAT-G', 'BAT-R'}),
        ('Blackout, the first 45 seconds (before the emergency generator is on the board)', {'BAT-G', 'BAT-R'}),
        ('Blackout, the emergency generator running', {'EG', 'BAT-G', 'BAT-R'}),
        ('Blackout, and the general service battery lost', {'EG', 'BAT-R'}),
        ('Blackout, and the radio battery lost', {'EG', 'BAT-G'}),
        ('Everything lost but the radio battery', {'BAT-R'}),
    ]
    kept = {}
    for name, on in cases:
        live = alive_boards(d, feeders, on)
        alive = [c for c in consumers if fed(c, live)]
        kept[name] = {c['id'] for c in alive}
        dark = sorted({c['sys'] for c in consumers if not fed(c, live)})
        subs = {s['id']: s['name'] for s in d['subsystems']}
        boards = [b for b in board_name if b in live]
        w(f"| {name} | {', '.join(sorted(on))} | {', '.join(boards)} | {len(alive)} of {len(consumers)} | {('all or part of: ' + ', '.join(subs.get(s, s) for s in dark)) if dark else 'nothing'} |")
    w('')

    # ---- 4. what must survive a blackout
    w('## 4. What must not go dark')
    w('')
    w('The services a ship must keep through a blackout, as the yard recalls the rule (SOLAS chapter II-1, regulation 42 for')
    w('passenger ships: an emergency source, and a transitional source that carries the essentials while the generator starts;')
    w('chapter IV for the radio\'s reserve source). **Recalled, not read for this sheet.** Each is looked for among what stays')
    w('alive in the first 45 seconds on the batteries alone:')
    w('')
    first = kept['Blackout, the first 45 seconds (before the emergency generator is on the board)']
    later = kept['Blackout, the emergency generator running']
    whats = {c['id']: c.get('what', '') for c in d['components']}
    own = lambda c: 'battery of its own' in whats.get(c['id'], '')       # the register says so of the thing, in words
    by_sys = {}
    for c in consumers:
        by_sys.setdefault(c['sys'], []).append(c)
    lanterns = [c for c in by_sys.get('NLT', []) if (c['by'][0] == 'NLP')]
    needs = [
        # (the service, its components, when it must be alive: on the batteries alone, or once the emergency generator runs)
        ('Navigation lights (the lanterns on the navigation light panel)', lanterns, 'batteries'),
        ('Radio (VHF with DSC, NAVTEX)', [c for c in by_sys.get('COM', []) if any(t in c['name'] for t in ('VHF', 'NAVTEX'))], 'batteries'),
        ('General alarm and public address', [c for c in consumers if any(t in c['name'].lower() for t in ('general alarm', 'public address'))], 'batteries'),
        ('Fire detection panel', [c for c in consumers if 'fire detection' in c['name'].lower()], 'batteries'),
        ('Position and heading (GPS, compass)', [c for c in by_sys.get('NAV', []) if any(t in c['name'] for t in ('GPS', 'compass', 'Compass'))], 'batteries'),
        ('Steering control (one of the two systems)', [c for c in by_sys.get('STR', []) if 'control' in c['name'].lower()], 'generator'),
        ('Radar', [c for c in by_sys.get('NAV', []) if 'adar' in c['name']], 'generator'),
    ]
    w('| Service | Components | Must be alive | Alive then | Verdict |')
    w('|---|---|---|---|---|')
    for name, got, tier in needs:
        then = first if tier == 'batteries' else later
        ok = [c for c in got if c['id'] in then]
        self_fed = [c for c in got if c['id'] not in then and own(c)]
        when = 'on the batteries alone, at once' if tier == 'batteries' else 'once the emergency generator is on the board (45 s)'
        if not got:
            verdict = 'none registered'
        elif len(ok) + len(self_fed) == len(got):
            verdict = 'kept' + (' (on its own battery, as the register says of it)' if self_fed else '')
        elif ok or self_fed:
            verdict = 'kept in part'
        else:
            verdict = '**DARK**'
            fails.append(f'{name}: dark {when}')
        w(f"| {name} | {', '.join(c['id'] for c in got) or 'none'} | {when} | {', '.join(c['id'] for c in ok + self_fed) or 'none'} | {verdict} |")
    w('')
    w('Steering control may wait for the emergency generator because the steering gear itself does: its power units are on the')
    w('main and the emergency switchboard, and a gear is given 45 seconds to have its second supply. "Kept in part" there means one')
    w('of the two control systems, which is what a blackout leaves of the gear too. The lanterns that are not on the navigation light')
    w('panel (wipers and window wash are registered in the same subsystem) are not counted as navigation lights.')
    w('')
    w('## 5. Limits')
    w('')
    w('- The proof is of the register, not of a ship: a cable that is registered and not yet drawn in the model is proven all the same.')
    w('- Change-overs are taken to work (the bus-tie, the inverter, the panel\'s switch): none is modelled as a part that can fail.')
    w('- Nothing is said of fault currents or of whether a small breaker opens before a large one on a short circuit (JS8-853, to do).')
    w('- The rule in section 4 is recalled. When its text has been read, the list of what must survive is to be made from it.')
    w('- That a thing has a battery of its own is read from the words the register says of it (the fire detection panel). It should be a field of the register, with the battery\'s size, and then be proven like the others.')
    w('')
    if fails:
        w('## NOT PROVEN')
        w('')
        for f in fails:
            w(f'- {f}')
        w('')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write('\n'.join(out))
    print(f'{OUT}: {len(consumers)} consumers, {len(breakers)} breakers opened, {len(cases)} conditions')
    if fails:
        print('NOT PROVEN: ' + '; '.join(fails))
        sys.exit(1)
    print('proven: every consumer has a supply, each breaker takes only its own way, the listed services survive a blackout')


if __name__ == '__main__':
    main()
