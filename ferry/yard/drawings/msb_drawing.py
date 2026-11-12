#!/usr/bin/env python3
"""
JS8-865, the main switchboard: drawn from the numbers it is to be built from, before any of it is built.

    python3 ferry/yard/drawings/msb_drawing.py     writes, beside this file:
        JS8-865-main-switchboard.svg                 sheet 1: the 690 V board: its front, its one-line diagram, its panels, the room
        JS8-865-2-main-switchboard-ways.svg          sheet 2: the 440 V and 230 V sections: every way, its breaker and its cable

The owner, 12 November 2026: "start building the MSB , with all the right connections , so we can start hooking up the
electrical wiring to every single component onboard , including for the lights and all equipment on the bridge and
forecastle".

Every number is read from ferry/blender/msb_place.py: the builder and the register read the same file. Change the board
there and draw again.
"""
import os
import sys
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
import msb_place as M
import spec as S

bad = M.wrong()
if bad:
    raise SystemExit('JS8-865 is not drawn: the board does not hold: ' + '; '.join(bad))

NUMBER, REVISION, DATE = 'JS8-865', '0', '12 November 2026'
WIDTH = 1640
INK, PAPER, FAINT, DIM, RED, GREEN, AMBER, BLUE = '#22303a', '#fbfaf5', '#8b959b', '#5d6a72', '#c2412f', '#2f9e5a', '#b7791f', '#2f6fb7'
BUS = {'A': '#c2412f', 'B': '#2f6fb7', 'T': '#b7791f', 'P': '#2f9e5a', 'S': '#7a5aa6'}
out = []
add = out.append


def text(x, y, s, size=10.5, anchor='start', weight='400', fill=INK):
    add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}">{escape(str(s))}</text>')


def line(x1, y1, x2, y2, w=1.0, c=INK, dash=''):
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def rect(x0, y0, x1, y1, fill='none', c=INK, w=1.0, dash=''):
    add(f'<rect x="{min(x0, x1):.1f}" y="{min(y0, y1):.1f}" width="{abs(x1 - x0):.1f}" height="{abs(y1 - y0):.1f}" fill="{fill}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def circle(cx, cy, r, fill='none', c=INK, w=1.0):
    add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{c}" stroke-width="{w}"/>')


def wrap(s, n):
    words, lines, cur = str(s).split(), [], ''
    for w in words:
        if len(cur) + len(w) + 1 > n and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    return lines + [cur] if cur or not lines else lines


def table(x, y, cols, rows, widths, size=9.5, lead=14):
    w = sum(widths)
    rect(x, y, x + w, y + lead + 3, '#e9e6dc', INK, 0.7)
    cx = x
    for c, cw in zip(cols, widths):
        text(cx + 4, y + lead - 1, c, size, weight='700')
        cx += cw
    y += lead + 3
    for row in rows:
        cells = [wrap(v, max(4, int(cw / (size * 0.56)))) for v, cw in zip(row, widths)]
        hgt = max(len(c) for c in cells) * (lead - 2) + 5
        cx = x
        for c, cw in zip(cells, widths):
            for i, s_ in enumerate(c):
                text(cx + 4, y + lead - 3 + i * (lead - 2), s_, size)
            cx += cw
        line(x, y + hgt, x + w, y + hgt, 0.4, FAINT)
        y += hgt
    return y


def heading(title, sub, note):
    text(64, 34, S.SHIP_NAME.upper(), 26, weight='700')
    text(202, 34, f'{title}  ·  {NUMBER}  ·  revision {REVISION}  ·  {DATE}', 15, weight='600')
    text(64, 54, sub, 11.5, fill=FAINT)
    text(WIDTH - 24, 34, note, 11.5, 'end', fill=FAINT)


def sheet(name, title, height):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height:.0f}" width="{WIDTH}" height="{height:.0f}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif">'
           f'<title>{escape(S.SHIP_NAME)}: {escape(title)}, {NUMBER} revision {REVISION}</title>'
           f'<rect width="{WIDTH}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
    path = os.path.join(HERE, name)
    open(path, 'w').write(svg)
    print(f'{path}: {WIDTH} x {height:.0f}, {len(svg)} bytes')
    out.clear()


def foot(y):
    text(64, y, 'Made by ferry/yard/drawings/msb_drawing.py from ferry/blender/msb_place.py (the design basis\'s plant; the yard\'s gathering of its consumers onto ways): the numbers the board is to be built from.', 10, fill=FAINT)
    text(WIDTH - 24, y, 'Not class-approved; not construction information.', 10, 'end', fill=FAINT)


def acb_symbol(x, y, c=INK, size=7):
    """An air circuit breaker on a one-line diagram: a square with a cross, on its line."""
    rect(x - size, y - size, x + size, y + size, PAPER, c, 1.2)
    line(x - size + 2, y - size + 2, x + size - 2, y + size - 2, 1.0, c)
    line(x - size + 2, y + size - 2, x + size - 2, y - size + 2, 1.0, c)


P_ = M.MSB_PANELS
C_ = M.CUBICLE
N = len(P_)

# =====================================================================================================================
# Sheet 1: the 690 V board
# =====================================================================================================================
heading('Main switchboard, 690 V: the board, its one-line diagram, its panels',
        'Sheet 1 of 2. Nine cubicles on the place marked MSB in the main switchboard room, on the platform. Drawn before it is built.',
        'Seen from the aisle, looking forward: outboard (port) is on the left.')
K = 150.0                                        # pixels to a metre, front view
FX, FY = 64, 96                                  # the board's top left corner on the sheet
W = C_['wide'] * K
H = (C_['high'] + C_['plinth']) * K
text(FX, FY - 12, 'THE FRONT, FROM THE AISLE', 12, weight='700')
busy = FY + 0.205 * K                            # the mimic bars painted across the instrument doors
for p in P_:
    x = FX + (p['no'] - 1) * W
    rect(x, FY, x + W, FY + C_['high'] * K, '#d9dcdd', INK, 1.3)
    rect(x, FY + C_['high'] * K, x + W, FY + H, '#5d6a72', INK, 1.0)                    # the plinth
    # the instrument door, the breaker's compartment, the cable compartment's door
    top, mid = FY + 0.62 * K, FY + 1.22 * K
    line(x, top, x + W, top, 0.8)
    line(x, mid, x + W, mid, 0.8)
    colour = BUS.get(p['bus'][0], INK)
    # instruments
    if p['kind'] == 'tie':
        circle(x + W / 2, FY + 0.40 * K, 13, PAPER, INK, 1.0)                           # the synchroscope
        text(x + W / 2, FY + 0.40 * K + 3, 'SY', 7.5, 'middle', '700')
        for k in (-1, 1):
            rect(x + W / 2 + k * 22 - 8, FY + 0.30 * K - 2, x + W / 2 + k * 22 + 8, FY + 0.30 * K + 26, PAPER, INK, 0.8)     # double voltmeter, double frequency meter
        for k in range(3):
            circle(x + 16 + k * 21, FY + 0.56 * K, 4, '#f3d99a', INK, 0.6)              # earth-fault lamps
    else:
        for k in range(3 if p['kind'] == 'gen' else 1):
            circle(x + W / 2 + (k - (1 if p['kind'] == 'gen' else 0)) * 23, FY + 0.37 * K, 10, PAPER, INK, 1.0)
        for k, c in enumerate((GREEN, RED)):
            circle(x + W / 2 - 9 + k * 18, FY + 0.54 * K, 4, c, INK, 0.6)
    # the breaker
    rect(x + 0.09 * K, top + 0.10 * K, x + W - 0.09 * K, mid - 0.10 * K, '#3a3f41', INK, 1.0)
    text(x + W / 2, top + 0.33 * K, f"{p['breaker']} A", 9, 'middle', '700', PAPER)
    if p.get('second'):
        text(x + W / 2, top + 0.45 * K, f"+ {p['second']['amps']} A", 8, 'middle', '700', PAPER)
    # the lower door: its handle and its louvres
    circle(x + W - 9, mid + 0.36 * K, 3, INK, INK, 0.5)
    for k in range(4):
        line(x + 14, FY + 1.82 * K + k * 5, x + W - 14, FY + 1.82 * K + k * 5, 0.6, DIM)
    # nameplates
    rect(x + 6, FY + 6, x + W - 6, FY + 22, PAPER, INK, 0.6)
    text(x + W / 2, FY + 18, p['tag'], 10, 'middle', '700')
    text(x + W / 2, FY - 2 + H + 14, str(p['no']), 10, 'middle', '700', DIM)
# the mimic bars
xp = lambda no: FX + (no - 0.5) * W
line(xp(1) - W * 0.4, busy, xp(4) + W * 0.4, busy, 4.0, BUS['B'])
line(xp(6) - W * 0.4, busy, xp(7) + W * 0.4, busy, 4.0, BUS['A'])
line(xp(8) - W * 0.4, busy, xp(9) + W * 0.4, busy, 4.0, BUS['T'])
text(FX, FY + H + 34, f"Each cubicle {C_['wide']:.2f} m wide, {C_['deep']:.2f} m deep, {C_['high']:.2f} m high on a plinth of {C_['plinth']:.2f} m. Top door: instruments and lamps. Middle: the air circuit", 9.5, fill=DIM)
text(FX, FY + H + 47 - 13 + 13, '', 9.5)
text(FX, FY + H + 47, 'breaker, drawn out to the front. Bottom door: the cables\' terminals. Generator panels: ammeter, voltmeter, kilowatt meter; closed and open', 9.5, fill=DIM)
text(FX, FY + H + 60, 'lamps. Tie panel: synchroscope, double voltmeter, double frequency meter, three earth-fault lamps. The mimic painted across the doors:', 9.5, fill=DIM)
text(FX, FY + H + 73, 'blue, bars B; red, bars A; amber, the thruster bars. The cables come down into each cubicle from the trays over it.', 9.5, fill=DIM)

# ---- the room, from above
RX, RY, RK = 800, 96, 62.0
text(RX, RY - 12, 'THE ROOM, FROM ABOVE', 12, weight='700')
(rx0, rx1), (ra, rb) = M.ROOM['x'], M.ROOM['yard']
PX = lambda yard: RX + (yard - ra) * RK          # forward to the right
PY = lambda x: RY + (rx1 - x) * RK               # port (outboard) at the top
rect(PX(ra), PY(rx1), PX(rb), PY(rx0), '#f4f2ea', INK, 1.8)
for box, name, fill in ((M.MSB_BOX, '690 V BOARD', '#d9dcdd'), (M.PSB_BOX, '440 V AND 230 V SECTIONS', '#d9dcdd')):
    rect(PX(box[2]), PY(box[1]), PX(box[3]), PY(box[0]), fill, INK, 1.2)
import stern_place as SP
for tag in ('T1', 'T2'):
    b = SP.END[tag]['box']
    rect(PX(b[2]), PY(b[1]), PX(b[3]), PY(b[0]), '#cfe0dc', INK, 1.0)
    text(PX((b[2] + b[3]) / 2), PY((b[0] + b[1]) / 2) + 4, tag, 9, 'middle', '700')
for no in range(1, N):
    xa = M.panel_x(no)[0]
    line(PX(M.MSB_BOX[2]), PY(xa), PX(M.MSB_BOX[3]), PY(xa), 0.5, DIM)
lx = PX(rb) + 14
text(lx, PY(rx1) + 60, 'Forward row: the 690 V board', 9.5, weight='700')
text(lx, PY(rx1) + 73, 'No. 1 outboard, No. 9 inboard. It looks aft, into the aisle.', 9, fill=DIM)
text(lx, PY(rx1) + 99, 'After row: the 440 V and 230 V sections (sheet 2)', 9.5, weight='700')
text(lx, PY(rx1) + 112, 'It looks forward, into the same aisle.', 9, fill=DIM)
text(lx, PY(rx1) + 138, 'T1, T2: the two transformers, 690/440 V, 800 kVA', 9.5, weight='700')
text(lx, PY(rx1) + 151, 'At the outboard end of the room.', 9, fill=DIM)
text(lx, PY(rx1) + 177, f'Aisle between the rows: {M.MSB_BOX[2] - M.PSB_BOX[3]:.2f} m', 9.5, weight='700')
text(lx, PY(rx1) + 190, f'Behind the 690 V board: {rb - M.MSB_BOX[3]:.2f} m. Behind the after row: {M.PSB_BOX[2] - ra:.2f} m.', 9, fill=DIM)
text(PX(ra) - 6, PY((rx0 + rx1) / 2), 'AFT', 9, 'end', '700', FAINT)
text(PX(rb) + 6, PY(rx0) - 4, 'FORWARD', 9, 'start', '700', FAINT)
text(PX(ra), PY(rx1) - 5, 'OUTBOARD (PORT)', 8.5, weight='700', fill=FAINT)
text(lx, PY(rx1) + 216, f'On the platform, {M.PLATFORM:.1f} m above the keel.', 9.5, weight='700')
text(lx, PY(rx1) + 229, f'Cable trays at {M.ROOM["head"]:.2f} m: {M.ROOM["head"] - M.PLATFORM - C_["high"] - C_["plinth"]:.2f} m over the boards.', 9, fill=DIM)

# ---- the one-line diagram
OY = max(FY + H + 104, RY + (rx1 - rx0) * RK + 44)
text(64, OY, 'ONE-LINE DIAGRAM OF THE 690 V BOARD', 12, weight='700')
OX, OW = 110, 150                                # each panel's column
col = lambda no: OX + (no - 1) * OW
by = OY + 150                                    # the bars
line(col(1) - 50, by, col(4) + 50, by, 5, BUS['B'])
line(col(6) - 50, by, col(7) + 50, by, 5, BUS['A'])
line(col(8) - 50, by, col(9) + 50, by, 5, BUS['T'])
text(col(1) - 50, by - 9, f"BARS B  {M.BARS['volts']} V  {M.BARS['hz']} Hz  {M.BARS['amps']} A", 9.5, weight='700', fill=BUS['B'])
text(col(6) - 50, by - 9, 'BARS A', 9.5, weight='700', fill=BUS['A'])
text(col(9) + 50, by - 9, 'THRUSTER BARS', 9.5, 'end', '700', BUS['T'])
for p in P_:
    x, c = col(p['no']), BUS.get(p['bus'][0], INK)
    if p['kind'] == 'gen':
        circle(x, OY + 40, 17, PAPER, INK, 1.3)
        text(x, OY + 44, 'G', 12, 'middle', '700')
        text(x, OY + 16, p['tag'], 10.5, 'middle', '700')
        line(x, OY + 57, x, by, 1.6, c)
        acb_symbol(x, OY + 100, c)
        text(x + 13, OY + 96, f"{p['breaker']} A", 8.5, fill=DIM)
        text(x + 13, OY + 107, f"set {p['setting']} A", 8.5, fill=DIM)
        text(x + 24, OY + 44, f"{p['kva']} kVA", 8.5, fill=DIM)
    elif p['kind'] == 'feeder':
        line(x, by, x, by + 100, 1.6, c)
        acb_symbol(x, by + 46, c)
        text(x + 13, by + 42, f"{p['breaker']} A", 8.5, fill=DIM)
        text(x + 13, by + 53, f"set {p['setting']} A", 8.5, fill=DIM)
        if p['tag'].startswith('T'):
            circle(x, by + 110, 10, PAPER, INK, 1.2)
            circle(x, by + 124, 10, PAPER, INK, 1.2)
            text(x + 16, by + 114, f"{p['tag']}  {p['kva']} kVA", 9.5, weight='700')
            text(x + 16, by + 126, '690/440 V: to the 440 V section', 8.5, fill=DIM)
        else:
            circle(x, by + 116, 16, PAPER, INK, 1.3)
            text(x, by + 120, 'M', 12, 'middle', '700')
            text(x + 22, by + 114, 'Bow thruster', 9.5, weight='700')
            text(x + 22, by + 126, '600 kW, by its starter', 8.5, fill=DIM)
        text(x, by + 152, M.cable_text(*p['cable']), 8, 'middle', fill=DIM)
    else:
        line(col(4) + 50, by, col(6) - 50, by, 1.6, INK)
        acb_symbol(x, by, INK, 9)
        text(x, by - 16, f"BUS TIE  {p['breaker']} A", 9, 'middle', '700')
        text(x, by + 26, 'synchronising here', 8.5, 'middle', fill=DIM)
    if p['kind'] == 'gen':
        text(x, OY + 74, M.cable_text(*p['cable']), 8, 'middle', fill=DIM) if False else None
tt = next(p for p in P_ if p.get('second'))
line(col(7) + 50, by, col(8) - 50, by, 1.6, INK)
acb_symbol((col(7) + col(8)) / 2, by, INK, 8)
text((col(7) + col(8)) / 2, by + 24, f"THRUSTER BUS TIE  {tt['second']['amps']} A", 8.5, 'middle', '700')
text((col(7) + col(8)) / 2, by + 35, 'in cubicle 8', 8, 'middle', fill=DIM)
for p in P_:
    if p['kind'] == 'gen':
        text(col(p['no']) - 12, OY + 80, M.cable_text(*p['cable']), 8, 'end', fill=DIM)
ny = by + 176
NOTES = [
    'Bars A and bars B are tied in normal service; the three diesel sets run in parallel on them. Each is brought on at the synchronising panel (cubicle 5): voltages and frequencies matched, the breaker closed as the synchroscope comes to twelve o\'clock.',
    'A shaft generator\'s frequency is its main engine\'s speed. It is not run in parallel with the diesel sets or with the other shaft generator, except for the seconds of a load transfer: an interlock between the breakers keeps it so.',
    'Manoeuvring: the thruster bus tie open, shaft generator No. 1 alone on the thruster bars with the thruster; the diesel sets on bars A and B. At sea: one shaft generator on the main bars through the thruster bus tie (SG1) or directly (SG2), the diesel sets stopped.',
    'Everything but the thruster takes its power at 440 V or 230 V through transformers No. 1 and No. 2 (sheet 2). Either transformer carries the whole of it.',
    'Three-wire, insulated from the hull: the three earth-fault lamps on cubicle 5 burn evenly while no line touches the hull. Not calculated, and owed: the short-circuit level of the bars (JS8-853) and the voltage dip when the thruster starts.',
]
text(64, ny, 'HOW IT IS RUN', 12, weight='700')
for k, t_ in enumerate(NOTES):
    for i, s_ in enumerate(wrap(t_, 250)):
        text(64 if i == 0 else 76, ny + 18 + i * 12, ('· ' if i == 0 else '') + s_, 9.5)
    ny += 15 + 12 * (len(wrap(t_, 250)) - 1)
ny += 30
text(64, ny, 'THE PANELS', 12, weight='700')
rows = []
for p in P_:
    rows.append((str(p['no']), p['tag'], p['name'].title().replace('No.', 'No.'), {'gen': 'Incomer', 'feeder': 'Feeder', 'tie': 'Tie'}[p['kind']], 'Bars ' + p['bus'].replace('T', 'T (thruster)') if p['kind'] != 'tie' else 'A to B',
                 f"{p.get('kva')} kVA" if p.get('kva') else (f"{p['kw']} kW" if p.get('kw') else ''), f"{p['amps']} A", f"{p['breaker']} A" + (f", set {p['setting']} A" if p['kind'] != 'tie' else ''),
                 M.cable_text(*p['cable']) + ' + earth' if p['cable'] else 'bars', p['to'] + (f". Also in this cubicle: the thruster bus tie, {p['second']['amps']} A" if p.get('second') else '')))
ny = table(64, ny + 10, ['No.', 'Tag', 'Panel', 'Kind', 'On', 'Rated', 'Current', 'Air circuit breaker', 'Cables', 'To'], rows, [36, 50, 200, 70, 110, 80, 70, 170, 190, 536])
foot(ny + 30)
sheet(f'{NUMBER}-main-switchboard.svg', 'Main switchboard, 690 V', ny + 48)

# =====================================================================================================================
# Sheet 2: the 440 V and 230 V sections: every way
# =====================================================================================================================
heading('Main switchboard: the 440 V and 230 V sections, every way',
        'Sheet 2 of 2. The row that faces the 690 V board, on the place marked PSB. Each way: what it feeds, what is on it, its breaker and its cable. These are the connections a cable is landed on.',
        'Powers are the design basis\'s (its load list); the gathering onto ways is the yard\'s.')
y = 84
text(64, y, 'THE 440 V SECTION: two halves behind transformers No. 1 and No. 2, tied; three-phase, three-wire, insulated', 12, weight='700')


def rows_of(ws, volts):
    out_ = []
    for x in ws:
        if x['tag'] == 'TIE':
            out_.append((x['tag'], '', x['name'], '', f"{x['breaker']} A", '', 'bars', ''))
            continue
        load = f"{x['kva']} kVA" if x['kva'] else (f"{x['kw']:g} kW" + (f" x {x['share']:g}" if x['share'] != 1.0 else '') if x['kw'] else '')
        out_.append((x['tag'], {'P': 'port', 'S': 'starboard'}.get(x['half'], ''), x['name'], load, f"{x['breaker']} A" + (f", set {x['setting']} A" if x['setting'] else ''), f"{x['amps']:.0f} A",
                     M.cable_text(*x['cable']) + ' + earth', (x['text'] + ('. ' if x['text'] and x['where'] else '') + (('To: ' + x['where']) if x['where'] else '')).strip()))
    return out_


y = table(64, y + 10, ['Way', 'Half', 'Feeds', 'Connected', 'Breaker', 'Current', 'Cable', 'What is on it, and where it goes'], rows_of(M.psb(), 440), [44, 66, 300, 110, 130, 62, 170, 630])
y += 28
text(64, y, 'THE 230 V SECTION: behind lighting transformers No. 1 and No. 2 (100 kVA each, 440/230 V), tied. Three-phase to each board; her lighting and socket circuits are two-wire from the boards', 12, weight='700')
y = table(64, y + 10, ['Way', 'Half', 'Feeds', 'Connected', 'Breaker', 'Current', 'Cable', 'Where it goes'], rows_of(M.lb(), 230), [44, 66, 380, 110, 130, 62, 170, 550])
y += 28
text(64, y, 'FOR THE BRIDGE AND THE FORECASTLE', 12, weight='700')
FOR = [
    'The navigation bridge is fed by ways L02 (the wheelhouse board BD1), L03 (the navigation light panel\'s main feeder), L04 (the fire detection panel) and L09 (the searchlight), which her register already has (systems/bridge.py), and by the emergency switchboard and the two battery boards, which are not on this board.',
    'The forecastle is fed by way P07 (the forward mooring starter panel in the fore store: the two pumps of 55 kW that work both windlasses and mooring winches) and way L07 (lighting board LD3 in the fore store: the forecastle\'s lights and floodlights, and sockets forward). The bow thruster\'s auxiliaries are way S13; the thruster itself is cubicle 9 of the 690 V board.',
    'Not on this board, and still to be drawn: the emergency switchboard and its ways (fed through P04); the group starter boards and the other boards named here, each of which is a board of its own with its own ways; the cable ways from this room to each of them.',
]
for t_ in FOR:
    for i, s_ in enumerate(wrap(t_, 250)):
        text(64 if i == 0 else 76, y + 18 + i * 12, ('· ' if i == 0 else '') + s_, 9.5)
    y += 15 + 12 * (len(wrap(t_, 250)) - 1)
foot(y + 44)
sheet(f'{NUMBER}-2-main-switchboard-ways.svg', 'Main switchboard: the 440 V and 230 V sections', y + 62)
