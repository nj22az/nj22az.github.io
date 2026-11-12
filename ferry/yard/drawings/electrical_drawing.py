#!/usr/bin/env python3
"""
Her electrical installation, drawn from the component register.

    python3 ferry/yard/drawings/electrical_drawing.py

writes, beside this file:
    JS8-851-electrical-one-line-diagram.svg      sources, switchboards, the bridge's boards, every way with its breaker and cable
    JS8-864-<n>-<board>.svg                      one sheet a board: the cabinet with its door open, its connections, its parts
    JS8-856-cable-schedule.md                    every cable: from, to, type, breaker, load, length, drop
    JS8-864-parts-list.md                        the parts of the five boards and the cable, counted

The owner, 11 November 2026: "the electric cabinets needs to be able to open on the bridge , all the wiring should be accurate
and drawn in drawings in cad , with part lists , it needs to be a functional electrical installation".

Everything is read from ferry/data/systems.json, which ferry/systems/register.py writes from the register and which the page
and the model read too: nothing is typed in here that the register does not hold, except the yard's own choice of hardware,
which is set out in HARDWARE below and said to be the yard's on every sheet. Change the register and draw again.
ferry/systems/prove.py proves that the installation drawn here works (JS8-851, proof of supply).
"""
import json
import math
import os
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', '..', 'data', 'systems.json')
REVISION, DATE = '0', '12 November 2026'
INK, PAPER, FAINT, DIM, AMBER, RED, GREEN, BLUE = '#22303a', '#fbfaf5', '#8b959b', '#5d6a72', '#b7791f', '#c2412f', '#2f9e5a', '#2f6fb0'
FONT = 'DejaVu Sans, Helvetica, Arial, sans-serif'

# ---- The yard's own choice of hardware (not from the register, and from no rule read): what a board is built of.
HARDWARE = dict(
    module=18.0,                 # the width of one pole on a 35 mm rail, mm
    poles=2,                     # every way is switched in both poles: the 230 V and the 24 V systems are two-wire and insulated
    breaker_h=88.0, rail=35.0,
    incomer_modules=4,           # a two-pole switch-disconnector, with room for its auxiliary contact
    duct=40.0,                   # slotted wiring duct between the rows
    margin=45.0,
    width=520.0, depth=210.0,    # a wall cabinet of sheet steel, mm
    terminal={1.5: 5.2, 2.5: 5.2, 4: 6.2, 6: 8.2, 10: 10.2, 16: 12.2, 25: 16.2, 35: 16.2},     # a through terminal's width by the cable it takes
    gland={1.5: 'M20', 2.5: 'M20', 4: 'M25', 6: 'M25', 10: 'M32', 16: 'M32', 25: 'M40', 35: 'M50'},
    cleat=0.3,                   # a cable is cleated to its tray every 0.3 m (JSY-STD-402 allows 0.6 m)
)


# =====================================================================================================================
# The register, as the sheets need it
# =====================================================================================================================
def load():
    d = json.load(open(DATA, encoding='utf-8'))
    d['names'] = {c['id']: c['name'] for c in d['components']}
    return d


def run_length(paths):
    """The length of a set of runs with each stretch counted once: what a circuit's cable is, with its branches."""
    seen, total = set(), 0.0
    for path in paths:
        for a, b in zip(path, path[1:]):
            key = tuple(sorted((tuple(round(v, 2) for v in a), tuple(round(v, 2) for v in b))))
            if key in seen:
                continue
            seen.add(key)
            total += math.dist(a, b)
    return total


def cables(d):
    """Every cable of the installation: feeders, ways, and the circuits that come direct from boards elsewhere."""
    allow = d['rules']['allowance']
    out = []
    for b in d['boards']:
        f = b['feeder']
        out.append(dict(tag=f"{b['id']}-F1", board=b['id'], frm=b['fedBy']['board'], to=b['id'], name=f"Feeder to {b['name'].lower()}", cable=f['cable'], mm2=f['mm2'],
                        breaker=f['breaker'], amps=f['amps'], length=f['length'], metres=f['length'], drop=f['drop'], total=f['drop'], volts=b['volts'], kind=b['kind'], feeder=True))
        if b.get('altFeeder'):
            f = b['altFeeder']
            out.append(dict(tag=f"{b['id']}-F2", board=b['id'], frm=f['board'], to=b['id'], name=f"Second feeder to {b['name'].lower()}", cable=f['cable'], mm2=f['mm2'],
                            breaker=f['breaker'], amps=f['amps'], length=f['length'], metres=f['length'], drop=f['drop'], total=f['drop'], volts=b['volts'], kind=b['kind'], feeder=True))
        for k in b['circuits']:
            ends = k['consumers'] + k['standby']
            out.append(dict(tag=f"{b['id']}-W{k['no']}", board=b['id'], frm=b['id'], to=', '.join(ends), name=k['name'], cable=k['cable'], mm2=k['mm2'], breaker=k['breaker'],
                            amps=k['amps'], length=k['length'], metres=round(run_length(k['paths'].values()) * allow, 1), drop=k['drop'], total=k.get('total', k['drop']),
                            volts=b['volts'], kind=b['kind'], feeder=False, ends=ends, way=k['no'], watts=k['watts']))
    volts = {e['id']: (e['volts'], e['kind']) for e in d['elsewhere']}
    for n, k in enumerate(d['outside'], 1):
        ends = k['consumers'] + k['standby']
        v, kind = volts[k['board']]
        out.append(dict(tag=f"{k['board']}-D{n}", board=k['board'], frm=k['board'], to=', '.join(ends), name=k['name'], cable=k['cable'], mm2=k['mm2'], breaker=k['breaker'],
                        amps=k['amps'], length=k['length'], metres=round(run_length(k['paths'].values()) * allow, 1), drop=k['drop'], total=k.get('total', k['drop']),
                        volts=v, kind=kind, feeder=False, ends=ends, way=k['no'], watts=k['watts'] or k.get('standbyWatts', 0), direct=True))
    return out


# =====================================================================================================================
# A sheet
# =====================================================================================================================
class Sheet:
    def __init__(self, width):
        self.w, self.out = width, []

    def add(self, s):
        self.out.append(s)

    def text(self, x, y, s, size=10, anchor='start', weight='400', fill=INK, rotate=None):
        tr = f' transform="rotate({rotate} {x:.1f} {y:.1f})"' if rotate is not None else ''
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}"{tr}>{escape(str(s))}</text>')

    def line(self, x1, y1, x2, y2, w=1.2, c=INK, dash=''):
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')

    def path(self, pts, w=1.2, c=INK, dash='', fill='none', close=False):
        d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + (' Z' if close else '')
        self.add(f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')

    def rect(self, x0, y0, x1, y1, fill='none', c=INK, w=1.0, dash='', r=0):
        self.add(f'<rect x="{min(x0, x1):.1f}" y="{min(y0, y1):.1f}" width="{abs(x1 - x0):.1f}" height="{abs(y1 - y0):.1f}" rx="{r}" fill="{fill}" stroke="{c}" stroke-width="{w}"'
                 + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')

    def circle(self, cx, cy, r, fill='none', c=INK, w=1.2):
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{c}" stroke-width="{w}"/>')

    def dot(self, x, y):
        self.circle(x, y, 2.6, INK, INK, 0.5)

    def wrap(self, s, n):
        words, lines, cur = str(s).split(), [], ''
        for word in words:
            if len(cur) + len(word) + 1 > n and cur:
                lines.append(cur)
                cur = word
            else:
                cur = (cur + ' ' + word).strip()
        return lines + ([cur] if cur else [])

    def para(self, x, y, s, n, size=10, lead=13, fill=INK, weight='400'):
        for part in self.wrap(s, n):
            self.text(x, y, part, size, fill=fill, weight=weight)
            y += lead
        return y

    def table(self, x, y, cols, rows, size=9.5, lead=14, head_fill='#e9e6dc'):
        """cols: (title, width, anchor). A cell may be several lines: its text is wrapped to the column."""
        widths = [c[1] for c in cols]
        self.rect(x, y, x + sum(widths), y + lead + 4, head_fill, INK, 0.8)
        cx = x
        for title, w, anchor in cols:
            self.text(cx + (5 if anchor == 'start' else w - 5), y + lead - 1, title, size, anchor, '700')
            cx += w
        y += lead + 4
        for row in rows:
            cells = [self.wrap(cell, max(4, int((w - 8) / (size * 0.53)))) for cell, w in zip(row, widths)]
            h = max(len(c) for c in cells) * (lead - 2) + 6
            cx = x
            for lines, (title, w, anchor) in zip(cells, cols):
                for i, part in enumerate(lines):
                    self.text(cx + (5 if anchor == 'start' else w - 5), y + (lead - 2) * (i + 1), part, size, anchor)
                cx += w
            self.line(x, y + h, x + sum(widths), y + h, 0.4, FAINT)
            y += h
        cx = x
        top = y
        return top

    def title_block(self, y, number, title, sheet, ship, note):
        x1 = self.w - 30
        x0 = x1 - 560
        self.rect(x0, y, x1, y + 78, PAPER, INK, 1.2)
        self.line(x0 + 150, y, x0 + 150, y + 78, 0.8)
        self.line(x0 + 150, y + 26, x1, y + 26, 0.8)
        self.line(x0 + 150, y + 52, x1, y + 52, 0.8)
        self.line(x1 - 130, y + 26, x1 - 130, y + 78, 0.8)
        self.text(x0 + 10, y + 22, 'JOHANSSON', 13, weight='700')
        self.text(x0 + 10, y + 38, 'SHIPYARD', 13, weight='700')
        self.text(x0 + 10, y + 56, f'Newbuilding No. 1', 9.5, fill=DIM)
        self.text(x0 + 10, y + 69, ship, 9.5, fill=DIM)
        self.text(x0 + 160, y + 18, title, 12.5, weight='700')
        self.text(x0 + 160, y + 44, f'Drawing {number}', 11, weight='700')
        self.text(x0 + 160, y + 69, f'Revision {REVISION} · {DATE}', 10)
        self.text(x1 - 122, y + 44, f'Sheet {sheet}', 10)
        self.text(x1 - 122, y + 69, 'Not to scale' if 'one-line' in title.lower() else 'mm', 10)
        self.para(30, y + 12, note, int((x0 - 60) / 5.2), 9.5, 13, FAINT)
        return y + 78

    def save(self, name, height, title):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {height:.0f}" width="{self.w}" height="{height:.0f}" font-family="{FONT}">'
               f'<title>{escape(title)}</title><rect width="{self.w}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(self.out) + '</svg>')
        path = os.path.join(HERE, name)
        open(path, 'w', encoding='utf-8').write(svg)
        print(f'{path}: {self.w} x {height:.0f}, {len(svg)} bytes')

    # ---- symbols of a one-line diagram
    def breaker(self, x, y, horizontal=False):
        """A circuit breaker on a conductor: the conductor runs from (x, y) for 18 along its way."""
        if horizontal:
            self.line(x, y, x + 4, y)
            self.line(x + 2, y - 3, x + 6, y + 3, 1.0)
            self.line(x + 2, y + 3, x + 6, y - 3, 1.0)
            self.line(x + 16, y, x + 5, y - 6)
            self.line(x + 16, y, x + 18, y)
        else:
            self.line(x - 3, y + 2, x + 3, y + 6, 1.0)
            self.line(x + 3, y + 2, x - 3, y + 6, 1.0)
            self.line(x, y, x, y + 4)
            self.line(x, y + 16, x - 6, y + 5)
            self.line(x, y + 16, x, y + 18)

    def transformer(self, x, y):
        """Two windings on a vertical conductor, 30 high from (x, y)."""
        self.circle(x, y + 11, 8.5, PAPER)
        self.circle(x, y + 21, 8.5, 'none')

    def converter(self, x, y, top, bottom):
        """A converter on a vertical conductor, 26 high from (x, y): what goes in at the top and what comes out below."""
        self.rect(x - 13, y, x + 13, y + 26, PAPER, INK, 1.2)
        self.line(x - 13, y + 26, x + 13, y, 0.9)
        self.text(x - 6, y + 11, top, 10, 'middle', '700')
        self.text(x + 6, y + 23, bottom, 10, 'middle', '700')

    def generator(self, x, y, label='G'):
        self.circle(x, y, 17, PAPER)
        self.text(x, y + 1, label, 12, 'middle', '700')
        self.text(x, y + 12, '3 ~', 8, 'middle')

    def battery(self, x, y):
        """A battery on a vertical conductor, 22 high from (x, y)."""
        for i in range(3):
            self.line(x - 12, y + 2 + i * 8, x + 12, y + 2 + i * 8, 1.2)
            self.line(x - 6, y + 6 + i * 8, x + 6, y + 6 + i * 8, 2.6)


def volts_of(text):
    """The voltage a source's rating names: '... 690 V, 60 Hz' is 690."""
    for word in text.replace(',', ' ').split():
        pass
    parts = text.replace(',', ' ').split()
    for i, word in enumerate(parts):
        if word == 'V' and i and parts[i - 1].replace('.', '').isdigit():
            return float(parts[i - 1])
    return None


def nominal(v):
    """450 V is the 440 V system's generator voltage: the same system."""
    return 440.0 if v and 430 <= v <= 460 else v


# =====================================================================================================================
# JS8-851: the one-line diagram
# =====================================================================================================================
# Where each source and each board elsewhere stands on the sheet. A board the register gains is said so at the foot of
# the sheet until it is given a place here: nothing is left off without a word.
SOURCE_AT = {'G1': 150, 'G2': 250, 'G3': 350, 'SHORE': 470, 'EG': 800, 'BAT-G': 1290, 'BAT-R': 1570}
LABEL = 128                     # a wide bus has its name under its left end: lines that go down from it keep clear of that
BUS_AT = {                      # (from x, to x, y)
    'MSB': (100, 400, 245), 'PSB': (100, 540, 375), 'LB': (100, 330, 505), 'SG1': (400, 520, 505),
    'ESB': (660, 1000, 375), 'SG2': (690, 770, 505), 'TSB': (880, 1100, 505), 'DCB': (1120, 1340, 375), 'DCB-R': (1400, 1620, 375),
}
SOURCE_Y = 150
BUS_Y, PITCH = 800, 30          # the bridge's boards, and the pitch of their ways


def one_line(d):
    ships = f"{d['ship']['name']}"
    sources = {x['id']: x for x in d['sources']}
    elsewhere = {x['id']: x for x in d['elsewhere']}
    boards = {b['id']: b for b in d['boards']}
    unplaced = [i for i in sources if i not in SOURCE_AT] + [i for i in elsewhere if i not in BUS_AT]
    # ---- the lower row first, so that the sheet is as wide as it needs: each board of the bridge, and each board elsewhere
    # that sends circuits to the bridge direct, with its ways
    direct = {}
    for k in d['outside']:
        direct.setdefault(k['board'], []).append(k)
    order = ['BD1', 'LB', 'SG1', 'BD2', 'ESB', 'SG2', 'NLP', 'DC1', 'DC2']
    groups, x = [], 40
    for gid in order + [b for b in boards if b not in order] + [b for b in direct if b not in order]:
        kind = 'board' if gid in boards else 'direct' if gid in direct else None
        if not kind:
            continue
        ways = boards[gid]['circuits'] if kind == 'board' else direct[gid]
        width = max(len(ways) * PITCH + 12, 150 if kind == 'board' else 66)
        groups.append(dict(kind=kind, id=gid, ways=ways, x0=x, x1=x + width))
        x += width + 22
    W = max(1700, x + 20)
    s = Sheet(W)
    s.text(30, 38, f'{ships}: electrical one-line diagram', 20, weight='700')
    s.text(30, 58, "JS8-851 · her supply, the boards that feed the navigation bridge, and every way on the bridge's five boards. "
                   'Read with the proof of supply (ferry/yard/calc/JS8-851-proof-of-supply.md) and the cable schedule (JS8-856).', 11, fill=DIM)

    def volts(node):
        if node in sources:
            return nominal(volts_of(sources[node]['rating'])), ('DC' if node.startswith('BAT') else 'AC')
        e = elsewhere[node]
        return float(e['volts']), e['kind']

    used = {}                                           # where lines already meet each bus

    def free_x(node, want, lower=()):
        """A place on a board's bus for a line to leave or arrive: near `want`, clear of what is there already and, for a
        line that goes on downward, clear of the buses that lie under this one."""
        x0, x1, y = BUS_AT[node]
        taken = used.setdefault(node, [])
        best = None
        for k in range(int((x1 - x0 - 16) // 4) + 1):
            cand = x0 + 8 + k * 4
            if any(abs(cand - t) < 14 for t in taken):
                continue
            if any(a - 8 <= cand <= b + 8 for a, b in lower):
                continue
            if best is None or abs(cand - want) < abs(best - want):
                best = cand
        best = best if best is not None else min(max(want, x0 + 8), x1 - 8)
        taken.append(best)
        return best

    # ---- sources
    for sid, src in sources.items():
        if sid not in SOURCE_AT:
            continue
        x = SOURCE_AT[sid]
        if sid.startswith('BAT'):
            s.battery(x, SOURCE_Y)
            s.line(x, SOURCE_Y - 8, x, SOURCE_Y + 2)
        elif sid == 'SHORE':
            s.rect(x - 26, SOURCE_Y - 14, x + 26, SOURCE_Y + 14, PAPER, INK, 1.2)
            s.text(x, SOURCE_Y + 4, 'SHORE', 9.5, 'middle', '700')
        else:
            s.generator(x, SOURCE_Y, 'G')
        short = src['name'].replace('Diesel generator No. ', 'Generator ').replace('24 V battery bank, ', '').replace(' connection', '')
        label = s.wrap(short, 17)[:2] + s.wrap(src['rating'].replace('about ', '').replace(' (calculation JS8-855)', ''), 17)[:2]
        top = SOURCE_Y - 30 - 10.5 * len(label)
        s.text(x, top, sid, 10.5, 'middle', '700')
        for i, part in enumerate(label):
            s.text(x, top + 11 + 10.5 * i, part, 8.6, 'middle', fill=DIM)

    def source_foot(sid):
        return SOURCE_AT[sid], SOURCE_Y + (24 if not sid.startswith('BAT') else 28)

    # ---- the boards elsewhere: a bus each, with its name
    for bid, e in elsewhere.items():
        if bid not in BUS_AT:
            continue
        x0, x1, y = BUS_AT[bid]
        s.line(x0, y, x1, y, 4.2)
        wide = x1 - x0 >= 220
        lx, ly = (x0, y + 17) if wide else (x1 + 8, y - 6)
        s.text(lx, ly, f"{bid}  {e['volts']} V{' DC' if e['kind'] == 'DC' else ''}", 10.5, weight='700')
        for i, part in enumerate(s.wrap(f"{e['name']} · {e['where']}", 25 if wide else 19)[:3]):
            s.text(lx, ly + 12 + 10.5 * i, part, 8.6, fill=DIM)

    def under(node, to=None):
        """What a line going down from a board's bus must keep clear of: the buses that lie under it (but the one it is
        going to), and the board's own name."""
        x0, x1, y = BUS_AT[node]
        clear = [(a, b) for n, (a, b, yy) in BUS_AT.items() if n not in (node, to) and yy > y and a <= x1 and b >= x0]
        return clear + ([(x0, x0 + LABEL)] if x1 - x0 >= 220 else [])

    # ---- what feeds each board elsewhere: infeeds of one voltage are joined before they are transformed
    lanes = {}
    for bid, e in elsewhere.items():
        if bid not in BUS_AT:
            continue
        x0, x1, y = BUS_AT[bid]
        bv, bk = volts(bid)
        by_volts = {}
        for f in e['fedBy']:
            if f in SOURCE_AT or f in BUS_AT:
                by_volts.setdefault(volts(f), []).append(f)
        middle = lambda f: SOURCE_AT[f] if f in SOURCE_AT else (BUS_AT[f][0] + BUS_AT[f][1]) / 2
        for (gv, gk), feeds in sorted(by_volts.items(), key=lambda kv: min(middle(f) for f in kv[1])):
            want = sum(min(max(middle(f), x0), x1) for f in feeds) / len(feeds)
            x_in = free_x(bid, want)
            convert = (gv, gk) != (bv, bk)
            top = y - (78 if convert else 26)                        # where the feeds have come together
            for f in feeds:
                if f in SOURCE_AT:
                    fx, fy = source_foot(f)
                else:
                    fx, fy = free_x(f, x_in, under(f, bid) if BUS_AT[f][2] < y else ()), BUS_AT[f][2]
                    s.dot(fx, fy)
                if abs(fx - x_in) < 1 and fy < top:
                    s.line(fx, fy, x_in, top)
                elif fy < top - 16:                                  # from above: down, across, down
                    lane = fy + 22 + 11 * lanes.setdefault(f, 0)
                    lanes[f] += 1
                    s.path([(fx, fy), (fx, min(lane, top - 12)), (x_in, min(lane, top - 12)), (x_in, top)])
                else:                                                # from a board beside it: up, across, down
                    lane = top - 16
                    s.path([(fx, fy), (fx, lane), (x_in, lane), (x_in, top)])
            if len(feeds) > 1:
                s.dot(x_in, top)
            if convert:
                if gk == bk:
                    s.line(x_in, top, x_in, top + 4)
                    s.transformer(x_in, top + 2)
                    s.line(x_in, top + 30, x_in, y - 26)
                    s.text(x_in + 14, top + 21, f'{gv:.0f}/{bv:.0f} V', 8.8, fill=DIM)
                else:
                    s.converter(x_in, top, '=' if gk == 'DC' else '~', '~' if bk == 'AC' else '=')
                    s.text(x_in + 18, top + 17, 'inverter' if gk == 'DC' else 'charger', 8.8, fill=DIM)
                    s.line(x_in, top + 26, x_in, y - 26)
                s.breaker(x_in, y - 26)
                s.line(x_in, y - 8, x_in, y)
            else:
                s.breaker(x_in, top)
                s.line(x_in, top + 18, x_in, y)
            s.dot(x_in, y)

    # ---- the bridge's boards and the circuits direct from boards elsewhere, each way a stub
    feeders = []
    for g in groups:
        x0, x1, gid, ways = g['x0'], g['x1'], g['id'], g['ways']
        board = g['kind'] == 'board'
        s.line(x0, BUS_Y, x1, BUS_Y, 4.2 if board else 2.0, INK, '' if board else '7 4')
        n = max(14, int((x1 - x0 - 16) / 4.7))
        if board:
            b = boards[gid]
            head = [(f"{gid}  {b['volts']} V{' DC' if b['kind'] == 'DC' else ''}", True)] + [(t, False) for t in s.wrap(b['name'], n)[:2]] \
                + [(t, False) for t in s.wrap(f"{b['load']['connected']} W connected, {b['load']['sea']} W at sea", n)]
            f = b['feeder']
            head += [(t, False) for t in s.wrap(f"F1 from {b['fedBy']['board']}: {f['breaker']} A, 2 × {f['mm2']} mm², {f['length']} m, {f['drop']} %", n)]
            feeders.append((gid, b['fedBy']['board'], x0 + 5, True))
            if b.get('altFeeder'):
                f = b['altFeeder']
                head += [(t, False) for t in s.wrap(f"F2 from {f['board']}: {f['breaker']} A, 2 × {f['mm2']} mm², {f['length']} m, {f['drop']} %", n)]
                feeders.append((gid, f['board'], x1 - 5, True))
        else:
            head = [(f'from {gid}', True), ('direct', False)]
            feeders.append((gid, gid, x0 + 5, False))
        for i, (part, bold) in enumerate(head):
            s.text(x0 + 13, BUS_Y - 12 - 11 * (len(head) - 1 - i), part, 10.5 if bold else 8.8, weight='700' if bold else '400', fill=INK if bold else DIM)
        first = x0 + (x1 - x0 - (len(ways) - 1) * PITCH) / 2
        for i, k in enumerate(ways):
            wx = first + i * PITCH
            s.dot(wx, BUS_Y)
            s.line(wx, BUS_Y, wx, BUS_Y + 4)
            s.breaker(wx, BUS_Y + 4)
            s.line(wx, BUS_Y + 22, wx, BUS_Y + 44)
            s.path([(wx - 4, BUS_Y + 38), (wx, BUS_Y + 46), (wx + 4, BUS_Y + 38)], 1.0)
            watts = k['watts'] or k.get('standbyWatts', 0)
            name = f"{k['no']}  {k['name']}" if board else k['name']
            s.text(wx - 2, BUS_Y + 54, name if len(name) <= 52 else name[:51] + '…', 8.6, 'end', '700', rotate=-90)
            s.text(wx + 9, BUS_Y + 54, f"{k['breaker']} A · 2 × {k['mm2']} mm² · {watts} W · {k['length']} m · {k.get('total', k['drop'])} %", 8.2, 'end', fill=DIM, rotate=-90)
    # the feeders, each in a lane of its own between the two rows, leaving its board clear of the buses under it
    for n, (gid, frm, fx, breaker) in enumerate(sorted(feeders, key=lambda t: t[2])):
        if frm not in BUS_AT:
            unplaced.append(frm)
            continue
        ux, uy = free_x(frm, fx, under(frm)), BUS_AT[frm][2]
        lane = 590 + n * 8.5
        s.dot(ux, uy)
        start = uy
        if breaker:
            s.line(ux, uy, ux, uy + 2)
            s.breaker(ux, uy + 2)
            start = uy + 20
        s.path([(ux, start), (ux, lane), (fx, lane), (fx, BUS_Y)], 1.2, INK, '' if breaker else '7 4')
        s.dot(fx, BUS_Y)
    # ---- legend and notes
    y = BUS_Y + 54 + 262
    s.text(30, y, 'SYMBOLS', 11, weight='700')
    lx = 30
    s.generator(lx + 18, y + 30); s.text(lx + 44, y + 34, 'generator', 9.5)
    s.battery(lx + 150, y + 18); s.text(lx + 170, y + 34, 'battery bank', 9.5)
    s.transformer(lx + 280, y + 14); s.text(lx + 298, y + 34, 'transformer', 9.5)
    s.converter(lx + 400, y + 18, '=', '~'); s.text(lx + 420, y + 34, 'inverter or charger', 9.5)
    s.breaker(lx + 560, y + 20); s.text(lx + 572, y + 34, 'circuit breaker, both poles', 9.5)
    s.line(lx + 740, y + 30, lx + 790, y + 30, 4.2); s.text(lx + 798, y + 34, 'busbar of a board', 9.5)
    s.line(lx + 910, y + 30, lx + 960, y + 30, 2.0, INK, '7 4'); s.text(lx + 968, y + 34, 'circuits that leave a board elsewhere direct, each on a breaker of its own there', 9.5)
    s.dot(lx + 1400, y + 30); s.text(lx + 1410, y + 34, 'joined; lines that cross without a dot are not', 9.5)
    y += 70
    s.text(30, y, 'NOTES', 11, weight='700')
    y += 16
    notes = [
        d['rules']['text'],
        'Each way reads: its number and name; then the breaker, the cable (two cores and an earth), the connected load, the length to its farthest consumer and the voltage lost from the switchboard to it.',
        'Infeeds of one voltage are joined before they are transformed. The emergency switchboard: ' + elsewhere['ESB']['text'],
        'The transitional section: ' + elsewhere['TSB']['text'],
        'The 690 V and 440 V systems are three-wire and insulated; 230 V and 24 V are two-wire, both poles insulated and both switched, which is why every breaker drawn opens both.',
        "The sheet shows the register as it stands: the navigation bridge and what feeds it. Her machinery, lighting, galley and ramps are not registered yet and are not drawn. Sizes of the generators and transformers are the register's, not calculated here (the load balance of the whole ship is to do: JS8-852).",
    ]
    if unplaced:
        notes.append('Registered and not yet given a place on this sheet: ' + ', '.join(sorted(set(unplaced))) + '.')
    for i, note in enumerate(notes):
        s.text(30, y + 11, str(i + 1), 9.5, weight='700', fill=DIM)
        y = s.para(46, y + 11, note, int((W - 90) / 5.2), 9.5, 13) + 3
    y = s.title_block(y + 14, 'JS8-851', 'Electrical one-line diagram', '1 of 1', ships,
                      'Made by ferry/yard/drawings/electrical_drawing.py from ferry/data/systems.json (the component register). The standards a board is built to are named on the board sheets, JS8-864, and are recalled there, not read.')
    s.save('JS8-851-electrical-one-line-diagram.svg', y + 24, f'{ships}: electrical one-line diagram, JS8-851 revision {REVISION}')


# =====================================================================================================================
# JS8-864: a board, its door open
# =====================================================================================================================
def board_parts(d, b, mine):
    """What one board is built of: (description, quantity, unit). The yard's own choice (HARDWARE)."""
    H = HARDWARE
    dc = b['kind'] == 'DC'
    feeders = [c for c in mine if c['feeder']]
    ways = [c for c in mine if not c['feeder']]
    parts = [(f"Wall cabinet, sheet steel, {H['width']:.0f} mm wide, {H['depth']:.0f} mm deep, door with a lock, IP44, with mounting plate and gland plate", 1, 'off')]
    big = max(f['breaker'] for f in feeders)
    frame = next(r for r in (25, 40, 63, 80, 100, 125) if r >= big)
    parts.append((f"Switch-disconnector, two-pole, {frame} A, {'24 V DC' if dc else '230 V AC'}, for the incoming feeder", len(feeders), 'off'))
    if len(feeders) > 1:
        parts.append((f'Change-over switch, two-pole, {frame} A, I-0-II, between the two feeders', 1, 'off'))
    parts.append((f"Indicator lamp, supply on, {'24 V DC' if dc else '230 V AC'}, one for each feeder", len(feeders), 'off'))
    by = {}
    for c in ways:
        by[c['breaker']] = by.get(c['breaker'], 0) + 1
    fused = 'fused' in b.get('text', '')                 # the register says so of the navigation light panel, in words
    for rating in sorted(by):
        if fused:
            parts.append((f'Fuse carrier, two-pole, with two {rating} A fuse links', by[rating], 'off'))
        else:
            parts.append((f"Miniature circuit breaker, two-pole, {rating} A, {'for direct current, 24 V' if dc else 'curve C, 230 V AC'}", by[rating], 'off'))
    if fused and 'monitored' in b.get('text', ''):
        parts.append(('Lamp-failure relay, one a way, with its lamp on the panel', len(ways), 'off'))
        parts.append(('Buzzer with a mute button, common to the lamp-failure relays', 1, 'off'))
    term = {}
    for c in mine:
        size = next(k for k in sorted(H['terminal']) if k >= c['mm2'])
        term[size] = term.get(size, 0) + 2
    for size in sorted(term):
        parts.append((f'Through terminal, {size} mm², grey', term[size], 'off'))
    parts.append(('Earth terminal, green and yellow, on the rail', len(mine), 'off'))
    parts.append(('End stop and end plate for the terminal row', 2, 'sets'))
    gl = {}
    for c in mine:
        g = H['gland'][next(k for k in sorted(H['gland']) if k >= c['mm2'])]
        gl[g] = gl.get(g, 0) + 1
    for g in sorted(gl, key=lambda t: int(t[1:])):
        parts.append((f'Cable gland, brass, nickel-plated, {g}, with locknut and seal', gl[g], 'off'))
    rows = math.ceil(len(ways) * H['poles'] * H['module'] / (H['width'] - 2 * H['margin']))
    parts.append(('Mounting rail, 35 mm, steel', round((rows + 2) * (H['width'] - 2 * H['margin']) / 1000, 1), 'm'))
    parts.append((f"Slotted wiring duct, {H['duct']:.0f} × 60 mm, with cover", round((rows + 2) * (H['width'] - 2 * H['margin']) / 1000 + 2 * 0.5, 1), 'm'))
    parts.append(('Comb busbar, two-pole, for the row of breakers', rows, 'off'))
    parts.append(('Earth bar, copper, with a bolt to the cabinet and to the door', 1, 'off'))
    parts.append(('Label, engraved: one for the board, one for each way and each feeder', 1 + len(mine), 'off'))
    parts.append(('Circuit list, in a pocket inside the door', 1, 'off'))
    return parts, rows


def board_sheet(d, b, mine, sheet_no, of):
    H = HARDWARE
    W = 1700
    s = Sheet(W)
    ships = d['ship']['name']
    dc = b['kind'] == 'DC'
    s.text(30, 38, f"{b['id']} · {b['name']}", 20, weight='700')
    s.text(30, 58, f"JS8-864 sheet {sheet_no} · {b['volts']} V{' direct current' if dc else ''} · {b['where']} · register component {b['comp']} · fed from {b['fedBy']['board']} ({b['fedBy']['name'].lower()})"
                   + (f" and {b['altFeeder']['board']}" if b.get('altFeeder') else ''), 11, fill=DIM)
    y = s.para(30, 80, b['text'], 190, 10.5, 14, INK) + 6
    feeders = [c for c in mine if c['feeder']]
    ways = [c for c in mine if not c['feeder']]
    parts, rows = board_parts(d, b, mine)
    # ---- the cabinet, door open, at 0.9 px a millimetre
    K = 0.9
    X0, Y0 = 60, y + 40
    per_row = int((H['width'] - 2 * H['margin']) // (H['poles'] * H['module']))
    height = H['margin'] + 110 + H['duct'] + rows * (H['breaker_h'] + H['duct']) + 70 + H['duct'] + 60
    mm = lambda v: v * K
    s.text(X0, Y0 - 14, f"FRONT, DOOR OPEN  (1 : {1 / K * 96 / 25.4:.1f} on a 96 dpi screen; the cabinet is {H['width']:.0f} × {height:.0f} × {H['depth']:.0f} mm)", 10.5, weight='700')
    s.rect(X0, Y0, X0 + mm(H['width']), Y0 + mm(height), '#f1efe6', INK, 1.6, r=3)
    s.rect(X0 + mm(12), Y0 + mm(12), X0 + mm(H['width'] - 12), Y0 + mm(height - 12), 'none', FAINT, 0.7)          # the mounting plate
    gx = lambda v: X0 + mm(v)
    gy = lambda v: Y0 + mm(v)

    def duct(y0, label=''):
        s.rect(gx(H['margin'] - 10), gy(y0), gx(H['width'] - H['margin'] + 10), gy(y0 + H['duct']), '#dcd9cf', DIM, 0.7)
        for k in range(int((H['width'] - 2 * H['margin'] + 20) // 12)):
            s.line(gx(H['margin'] - 6 + k * 12), gy(y0 + 4), gx(H['margin'] - 6 + k * 12), gy(y0 + H['duct'] - 4), 0.4, FAINT)

    def rail(y0):
        s.rect(gx(H['margin']), gy(y0 + (H['breaker_h'] - H['rail']) / 2), gx(H['width'] - H['margin']), gy(y0 + (H['breaker_h'] + H['rail']) / 2), '#cfd3d2', DIM, 0.6)

    def device(x0, y0, w, h, lines, fill='#fbfaf5', lever=True):
        s.rect(gx(x0), gy(y0), gx(x0 + w), gy(y0 + h), fill, INK, 0.9, r=1.5)
        if lever:
            s.rect(gx(x0 + w / 2 - 5), gy(y0 + h * 0.56), gx(x0 + w / 2 + 5), gy(y0 + h * 0.80), DIM, INK, 0.5, r=1)
        for i, part in enumerate(lines):
            s.text(gx(x0 + w / 2), gy(y0 + 13) + 9.5 * i, part, 7.6, 'middle', '700' if i == 0 else '400')

    cy = H['margin']
    # the incomers, the change-over, the lamps
    rail(cy)
    cx = H['margin'] + 8
    for i, f in enumerate(feeders):
        w = H['incomer_modules'] * H['module']
        device(cx, cy, w, H['breaker_h'], [f'Q{i}', f"{f['breaker']} A feeder", f['tag']])
        cx += w + 8
    if len(feeders) > 1:
        w = H['incomer_modules'] * H['module']
        device(cx, cy, w, H['breaker_h'], ['S0', 'I - 0 - II', 'change-over'])
        cx += w + 8
    for i, f in enumerate(feeders):
        s.rect(gx(cx), gy(cy), gx(cx + H['module']), gy(cy + H['breaker_h']), '#fbfaf5', INK, 0.9, r=1.5)
        s.circle(gx(cx + H['module'] / 2), gy(cy + 34), mm(6), '#d9f0c8' if not dc else '#cfe3f5', INK, 0.8)
        s.text(gx(cx + H['module'] / 2), gy(cy + 70), f'H{i}', 7.2, 'middle', '700')
        cx += H['module'] + 4
    s.text(gx(H['width'] - H['margin']), gy(cy + 12), 'incoming', 8.2, 'end', fill=DIM)
    cy += H['breaker_h']
    duct(cy)
    cy += H['duct']
    # the ways
    place = {}
    for r in range(rows):
        rail(cy)
        for i, c in enumerate(ways[r * per_row:(r + 1) * per_row]):
            x0 = H['margin'] + i * H['poles'] * H['module']
            device(x0, cy, H['poles'] * H['module'] - 1, H['breaker_h'], [f"F{c['way']}", f"{c['breaker']} A"])
            place[c['tag']] = x0 + H['module']
        cy += H['breaker_h']
        duct(cy)
        cy += H['duct']
    # the terminal row
    ty = cy + 6
    s.rect(gx(H['margin']), gy(ty + 24), gx(H['width'] - H['margin']), gy(ty + 36), '#cfd3d2', DIM, 0.6)
    tx = H['margin'] + 6
    terminals = {}
    n = 1
    for c in feeders + ways:
        size = next(k for k in sorted(H['terminal']) if k >= c['mm2'])
        w = H['terminal'][size]
        first = n
        for pole in range(2):
            s.rect(gx(tx), gy(ty), gx(tx + w), gy(ty + 58), '#d7d9d6', INK, 0.5)
            tx += w
            n += 1
        s.rect(gx(tx), gy(ty), gx(tx + 5.2), gy(ty + 58), '#bfe0a8', INK, 0.5)                       # its earth terminal
        tx += 5.2 + 1.6
        terminals[c['tag']] = (first, first + 1)
    wide = tx > H['width'] - H['margin']
    cy = ty + 58 + 6
    duct(cy)
    cy += H['duct']
    # the earth bar and the gland plate
    s.rect(gx(H['margin']), gy(cy + 8), gx(H['width'] - H['margin']), gy(cy + 16), '#e2b46a', INK, 0.6)
    s.text(gx(H['margin']), gy(cy + 6), 'PE', 8, weight='700')
    px = H['margin'] + 6
    for c in feeders + ways:
        g = H['gland'][next(k for k in sorted(H['gland']) if k >= c['mm2'])]
        dia = int(g[1:]) + 5
        if px + dia > H['width'] - H['margin'] + 20:
            px = H['margin'] + 6
        s.circle(gx(px + dia / 2), gy(height - 16), mm(dia / 2), '#c9ccc8', INK, 0.8)
        s.circle(gx(px + dia / 2), gy(height - 16), mm(dia / 2 - 4), '#3a4244', INK, 0.4)
        px += dia + 3
    s.text(gx(0), gy(height) + 16, f'X1: terminals 1 to {n - 1} on the lower rail, an earth terminal (green) after each pair.', 8.8, fill=DIM)
    s.text(gx(0), gy(height) + 29, 'Gland plate: one gland a cable, in the order of the terminals. PE: the earth bar.', 8.8, fill=DIM)
    bottom_left = gy(height) + 44
    # ---- the connections
    TX = X0 + mm(H['width']) + 50
    s.text(TX, Y0 - 14, 'CONNECTIONS', 10.5, weight='700')
    cols = [('Cable', 78, 'start'), ('Device', 52, 'start'), ('A', 34, 'end'), ('X1', 50, 'start'), ('Cable type', 190, 'start'), ('Gland', 46, 'start'), ('m', 44, 'end'),
            ('Load A', 50, 'end'), ('Drop %', 50, 'end'), ('To', W - TX - 30 - 594, 'start')]
    rows_ = []
    for i, c in enumerate(feeders):
        t = terminals[c['tag']]
        rows_.append((c['tag'], f'Q{i}', c['breaker'], f'{t[0]}, {t[1]}', c['cable'], H['gland'][next(k for k in sorted(H['gland']) if k >= c['mm2'])], c['length'], c['amps'], c['drop'],
                      f"from {c['frm']}: {c['name'].lower()}"))
    for c in ways:
        t = terminals[c['tag']]
        ends = '; '.join(f"{e} {d['names'].get(e, '')}" for e in c['ends'])
        rows_.append((c['tag'], f"F{c['way']}", c['breaker'], f'{t[0]}, {t[1]}', c['cable'], H['gland'][next(k for k in sorted(H['gland']) if k >= c['mm2'])], c['metres'], c['amps'], c['total'],
                      f"{c['name']}: {ends}"))
    ty2 = s.table(TX, Y0, cols, rows_)
    s.text(TX, ty2 + 16, f"m: the cable's length with its branches and a tenth for bends and making off. Drop: from the switchboard to the farthest consumer. Earth cores go to the terminal after each pair, and from there to the PE bar.", 9, fill=DIM)
    # ---- the parts
    py = max(ty2 + 44, 0)
    s.text(TX, py, 'PARTS OF THIS BOARD', 10.5, weight='700')
    prow = [(str(i + 1), desc, f'{q:g}', unit) for i, (desc, q, unit) in enumerate(parts)]
    py = s.table(TX, py + 10, [('Pos', 40, 'start'), ('Description', W - TX - 30 - 150, 'start'), ('Qty', 50, 'end'), ('Unit', 60, 'start')], prow)
    y = max(bottom_left, py) + 24
    notes = [
        "The board's contents are the register's: one way for each circuit, each breaker and cable as the register sized them. The cabinet, the devices' form, the terminals and the glands are the yard's own choice (electrical_drawing.py, HARDWARE) and no maker is named.",
        'Both poles of every way are switched and protected: the system is two-wire and insulated from the hull, so a breaker in one pole would leave the other alive. An earth-fault lamp set belongs on the switchboard that feeds the board, not here.',
        'Standards a builder would work to, as the yard recalls them (not read for this sheet): IEC 60092 (electrical installations in ships), IEC 61439 (low-voltage assemblies), IEC 60898-1 and IEC 60947-2 (breakers).',
    ]
    if wide:
        notes.append('The terminal row is longer than this cabinet is wide: it is to be set in two rows, or the cabinet made wider. Not settled.')
    for i, note in enumerate(notes):
        s.text(30, y + 11, str(i + 1), 9.5, weight='700', fill=DIM)
        y = s.para(46, y + 11, note, 300, 9.5, 13) + 3
    y = s.title_block(y + 14, 'JS8-864', f"{b['id']}: layout, connections and parts", f'{sheet_no} of {of}', ships,
                      'Made by ferry/yard/drawings/electrical_drawing.py from ferry/data/systems.json (the component register). The model\'s cabinet is to be built from this sheet: an incomer, a breaker for each way, the terminals, the glands.')
    name = f"JS8-864-{sheet_no}-{b['id']}-layout-and-connections.svg"
    s.save(name, y + 24, f"{ships}: {b['id']} {b['name']}, JS8-864 sheet {sheet_no} revision {REVISION}")
    return parts


# =====================================================================================================================
# JS8-856 and the parts list
# =====================================================================================================================
def schedule(d, all_cables):
    ships = d['ship']['name']
    out = [f'# JS8-856 · Cable schedule', '',
           f"Johansson Shipyard · made by `ferry/yard/drawings/electrical_drawing.py` from the component register (`ferry/data/systems.json`) · {ships} · revision {REVISION}, {DATE}", '',
           'Every cable the register holds: the feeders to the bridge\'s five boards, each way on them, and the circuits that come to the bridge direct from boards',
           'elsewhere. The one-line diagram is JS8-851; the boards are JS8-864; that the installation works is proven in `../calc/JS8-851-proof-of-supply.md`.', '',
           d['rules']['text'], '',
           '**Length** is the cable as laid, with its branches, and a tenth more for bends and making off; a feeder\'s is its one run. **Drop** is the voltage lost from the',
           'switchboard to the cable\'s farthest consumer. A cable said to be fire-resistant must go on working in a fire (the register\'s `FIRE_RESISTANT`).', '',
           '| Cable | From | To | What it feeds | Volts | Breaker A | Load A | Cable | Length m | Drop % |', '|---|---|---|---|---|---|---|---|---|---|']
    for c in all_cables:
        to = c['to'] if c['feeder'] else ', '.join(c['ends'])
        out.append(f"| {c['tag']} | {c['frm']} | {to} | {c['name']} | {c['volts']} {'DC' if c['kind'] == 'DC' else 'AC'} | {c['breaker']} | {c['amps']} | {c['cable']} | {c['metres']} | {c['total']} |")
    by = {}
    for c in all_cables:
        by[c['cable']] = by.get(c['cable'], 0) + c['metres']
    out += ['', '## Cable to buy, by type', '', '| Cable | Metres | Drums of 100 m |', '|---|---|---|']
    for kind in sorted(by, key=lambda t: (('fire' in t), float(t.split('×')[1].split('mm')[0]))):
        out.append(f'| {kind} | {by[kind]:.0f} | {math.ceil(by[kind] / 100)} |')
    out += ['', f"{len(all_cables)} cables, {sum(by.values()):.0f} m in all. Nothing here says how the cables are carried: the ways they are laid along (trays, trunks, ducts) are the register's",
            '`NODES` and `EDGES` (`ferry/systems/bridge.py`), which the page\'s X-ray draws.', '']
    path = os.path.join(HERE, 'JS8-856-cable-schedule.md')
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    print(f'{path}: {len(all_cables)} cables, {sum(by.values()):.0f} m')
    return by


def parts_list(d, per_board, by_cable, all_cables):
    ships = d['ship']['name']
    total = {}
    for bid, parts in per_board.items():
        for desc, q, unit in parts:
            key = (desc, unit)
            total.setdefault(key, {})[bid] = q
    ids = list(per_board)
    out = ['# JS8-864 · Parts list: the bridge\'s distribution boards and their cables', '',
           f"Johansson Shipyard · made by `ferry/yard/drawings/electrical_drawing.py` from the component register · {ships} · revision {REVISION}, {DATE}", '',
           'The owner, 11 November 2026: "drawn in drawings in cad , with part lists". What the five boards are built of, counted from the board sheets (JS8-864 sheets 1 to',
           f"{len(ids)}), and the cable of the schedule (JS8-856). **No maker is named and nothing is priced:** the descriptions are what a buyer would ask for. The cabinets, devices,",
           'terminals and glands are the yard\'s own choice; the ways, breakers and cables are the register\'s.', '',
           '## The boards', '', '| Description | ' + ' | '.join(ids) + ' | Total | Unit |', '|---|' + '---|' * (len(ids) + 2)]
    for (desc, unit), per in total.items():
        out.append(f"| {desc} | " + ' | '.join(f"{per.get(b, ''):g}" if b in per else '' for b in ids) + f" | {sum(per.values()):g} | {unit} |")
    out += ['', '## Cable and what carries it', '', '| Description | Quantity | Unit |', '|---|---|---|']
    for kind in sorted(by_cable, key=lambda t: (('fire' in t), float(t.split('×')[1].split('mm')[0]))):
        out.append(f'| Cable, {kind}, for ships (halogen-free, flame-retardant{"; fire-resistant" if "fire" in kind else ""}) | {by_cable[kind]:.0f} | m |')
    metres = sum(by_cable.values())
    ends = sum(len(c.get('ends', [])) or 1 for c in all_cables)
    out.append(f"| Cable cleat or tie, stainless, one every {HARDWARE['cleat']} m of cable | {math.ceil(metres / HARDWARE['cleat'])} | off |")
    out.append(f'| Cable gland at the consumer\'s end, to suit each cable (one a consumer or board fed) | {ends} | off |')
    out.append(f'| Cable marker, both ends of every cable | {2 * len(all_cables)} | off |')
    out += ['', 'Counted and not designed: the cleats are by length, not by the trays as drawn; the consumers\' glands are one for each end, of the size the board\'s gland has.',
            'Cable trays, trunks and their supports are the model\'s (they are built parts, checked by `ferry/blender/spans.py`), not listed here.', '']
    path = os.path.join(HERE, 'JS8-864-parts-list.md')
    open(path, 'w', encoding='utf-8').write('\n'.join(out))
    print(f'{path}: {len(total)} kinds of part')


def main():
    d = load()
    all_cables = cables(d)
    one_line(d)
    per_board = {}
    # (the bridge's boards: the stern ramp's starter panel, three-phase and of another size, is drawn on JS3-304 sheet 3)
    boards = [b for b in d['boards'] if b['section'] == 'bridge']
    for n, b in enumerate(boards, 1):
        mine = [c for c in all_cables if c['board'] == b['id'] and not c.get('direct')]
        per_board[b['id']] = board_sheet(d, b, mine, n, len(boards))
    by_cable = schedule(d, all_cables)
    parts_list(d, per_board, by_cable, all_cables)


if __name__ == '__main__':
    main()
