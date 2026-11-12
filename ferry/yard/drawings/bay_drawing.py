#!/usr/bin/env python3
"""
JS2-211, the wheelhouse's forward bay and its gallery: drawn from the numbers her model is built from.

    python3 ferry/yard/drawings/bay_drawing.py     writes JS2-211-wheelhouse-forward-bay.svg beside this file

The owner, 12 November 2026, of the first gallery under the bay, whose knees came down over two cabin windows of the
deck below: "check the quality please you cant cover the windows like that, you need make the drawing, and make sure you
dont build over a window". This is that drawing. It is made BEFORE the steel, from the arrangement: what is to stand on
the house's front is laid over the windows already in it, and the measures between them are written on the sheet.

Three views at one scale, set out as a draughtsman sets them: the house's front seen from ahead, with the windows of the
officers' deck and the knees between them; under it the plan at the bridge deck at the same breadths (her bow toward the
foot of the sheet); beside it the section on the centreline at the same heights.

Every measure is read from where the builders read it: ferry/blender/bridge_place.py (the bay, the console block),
ga.py and spec.py (her decks and rooms), steel.py (the windows of the house's front, the gallery and the rule that places
its knees: steel.bay_knees) and the register, ferry/systems/bridge.py (the table, the settee, the cable ways). steel.py
draws with Blender; only its plain numbers are asked for here, so Blender's own modules are stood in for.
"""
import os
import sys
import types
from html import escape
from math import cos, hypot, radians, sin, tan

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'blender'))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'systems'))
for _name in ('bpy', 'bmesh'):
    sys.modules.setdefault(_name, types.ModuleType(_name))
if 'mathutils' not in sys.modules:
    try:
        import mathutils  # noqa: F401
    except ModuleNotFoundError:
        _m, _g = types.ModuleType('mathutils'), types.ModuleType('mathutils.geometry')
        _m.Vector = _m.Matrix = object
        _g.tessellate_polygon = None
        sys.modules['mathutils'], sys.modules['mathutils.geometry'] = _m, _g
import ga as G
import spec as S
import bridge_place as BP
import steel as ST
import bridge as REG

NUMBER, TITLE, REVISION, DATE = 'JS2-211', "Wheelhouse forward bay and gallery: arrangement and structure", '0', '12 November 2026'
WIDTH = 1900
INK, PAPER, FAINT, GLASS, DIM, AMBER, RED, GREEN = '#22303a', '#fbfaf5', '#8b959b', '#2f6f74', '#5d6a72', '#b7791f', '#c2412f', '#2f9e5a'
out = []

# ---- the ship's numbers
SHIFT = BP.SHIFT
TIER = S.BRIDGE_DECK - S.OFFICERS_DECK               # the officers' deck to the bridge deck
HH, H1 = G.HOUSE_HALF, ST.H1                          # the house's half breadth and its front, from the transom
WINS = ST.front_windows('officers')                  # the windows in that front: (x from, x to, sill, head)
KNEES, BEAMS = ST.bay_knees()                        # (x, forward reach, depth) each; and the beams between knees far apart
GAL_X, GAL_Y = ST.BAY_FRONT                          # the gallery's forward corner, to port
GAL_K = ST.BAY_LINE - H1                             # its half breadth at the house's front
WING = ST.WING                                       # her side at the bridge deck: the wings' outer faces
SILL, HEAD, CLEAR, ROOF = BP.SILL_H, BP.HEAD_H, 2.30, 2.42      # over the bridge deck: the glass's sill and head, the deckhead, the roof's underside
LEAN = BP.LEAN
B = BP.BLOCK
ya = lambda v: v + SHIFT                             # the bridge's own measure along her → metres from her transom
C = {c['id']: c for c in REG.COMPONENTS}
TABLE, SOFA = C['OUT-09'], C['OUT-41']
# (as bridge_outfit.py stands them: the table against the starboard lining and the old front's line, the settee against the port lining)
T_X = (-BP.SIDE_IN + 0.006, -BP.SIDE_IN + 0.006 + TABLE['g']['w'])
T_Y = (BP.FRONT - BP.WALL - 0.006 - TABLE['g']['l'], BP.FRONT - BP.WALL - 0.006)
if SOFA['g'].get('against') == 'aft':                 # in the port wing, against its after wall (the owner, 12 November 2026: "Move it to port wing")
    S_X = (SOFA['at'][0] - SOFA['g']['l'] / 2, SOFA['at'][0] + SOFA['g']['l'] / 2)
    S_Y = (BP.WING_AFT + 0.012, BP.WING_AFT + 0.012 + SOFA['g']['d'])
    WAY_P = BP.SIDE_IN - B['half']
else:                                                # along the port side of the wheelhouse, where it closed the way
    S_X = (BP.SIDE_IN - 0.012 - SOFA['g']['d'], BP.SIDE_IN - 0.012)
    S_Y = (SOFA['at'][1] - SOFA['g']['l'] / 2, SOFA['at'][1] + SOFA['g']['l'] / 2)
    WAY_P = S_X[0] - B['half']
WAY_S = -B['half'] - T_X[1]                           # the two side ways past the block's ends
# (the binocular box stands 0.125 m out from the block's port end, bridge_console.binoculars; the handrail's tube 0.078 m in from the lining, bridge_fittings.RAIL_OFF)
WAY_P_BOX = BP.SIDE_IN - 0.078 - (B['half'] + 0.125)
HOSE, HYDRANT, WH_DOOR = C['FIR-07'], C['PIP-01'], C['OUT-18']
# the doors from the wings onto the gallery: the doorway, the leaf, and how near its free edge comes to the rail as it swings
D0, D1 = BP.FORE_DOOR
LEAF = D1 - D0 - 2 * BP.DOOR_JAMB
HINGE = (D0 + BP.DOOR_JAMB, BP.FRONT + SHIFT)
RAIL_LINE = ST.BAY_LINE - 0.08 * 2 ** 0.5             # along the rail on the gallery's canted edge, to port, x + yard is this
SWING = min((RAIL_LINE - (HINGE[0] + LEAF * cos(radians(t)) + HINGE[1] + LEAF * sin(radians(t)))) / 2 ** 0.5 for t in range(0, 101))


def add(s):
    out.append(s)


def text(x, y, s, size=10.5, anchor='start', weight='400', fill=INK, extra=''):
    add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}" {extra}>{escape(s)}</text>')


def line(x1, y1, x2, y2, w=1.0, c=INK, dash=''):
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}"' + (f' stroke-dasharray="{dash}"' if dash else '') + '/>')


def poly(pts, fill='none', c=INK, w=1.0, dash='', close=True, opacity=None):
    tag = 'polygon' if close else 'polyline'
    add(f'<{tag} points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"'
        + (f' stroke-dasharray="{dash}"' if dash else '') + (f' fill-opacity="{opacity}"' if opacity is not None else '') + '/>')


def rect(x0, y0, x1, y1, fill='none', c=INK, w=1.0, dash='', opacity=None):
    poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill, c, w, dash, opacity=opacity)


def wrap(s, n):
    words, lines, cur = s.split(), [], ''
    for w in words:
        if len(cur) + len(w) + 1 > n and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    return lines + ([cur] if cur else [])


def head(x, y, dx, dy, c=DIM):
    m = hypot(dx, dy)
    dx, dy = dx / m, dy / m
    poly([(x, y), (x - 7 * dx + 2.2 * dy, y - 7 * dy - 2.2 * dx), (x - 7 * dx - 2.2 * dy, y - 7 * dy + 2.2 * dx)], c, c, 0.3)


def dim(x1, y1, x2, y2, label, off=-4, size=9.5, c=DIM, weight='400'):
    """A measure between two points of the sheet, with its figure beside the line."""
    line(x1, y1, x2, y2, 0.6, c)
    head(x1, y1, x1 - x2, y1 - y2, c)
    head(x2, y2, x2 - x1, y2 - y1, c)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if abs(x2 - x1) >= abs(y2 - y1):
        text(mx, my + off, label, size, 'middle', weight, fill=c)
    else:
        add(f'<text x="{mx + off:.1f}" y="{my:.1f}" font-size="{size}" text-anchor="middle" font-weight="{weight}" fill="{c}" transform="rotate(-90 {mx + off:.1f} {my:.1f})">{escape(label)}</text>')


def note(x, y, s, tx, ty, size=9.5, anchor='start', c=DIM):
    """A word beside a thing, with a leader to it."""
    line(x, y - 3, tx, ty, 0.5, c)
    add(f'<circle cx="{tx:.1f}" cy="{ty:.1f}" r="1.4" fill="{c}"/>')
    text(x + (3 if anchor == 'start' else -3), y, s, size, anchor, fill=c)


# ---------------------------------------------------------------------------------------------------------------------
# the head of the sheet
# ---------------------------------------------------------------------------------------------------------------------
LEFT, K = 60, 60.0                                   # the sheet's margin; pixels to a metre, in all three views
text(LEFT, 44, f'{S.NAME}  ·  {TITLE}', 20, weight='700')
text(LEFT, 64, f'Johansson Shipyard  ·  {NUMBER}  ·  revision {REVISION}  ·  {DATE}  ·  newbuilding No. 1  ·  general arrangement revision {G.REVISION}', 11, fill=DIM)
text(WIDTH - 24, 44, 'NOTHING IS BUILT OVER A WINDOW', 13, 'end', '700', fill=RED)
text(WIDTH - 24, 62, 'Every knee stands in line with a bulkhead of the deck below, clear of every opening.', 10.5, 'end', fill=DIM)

# ---------------------------------------------------------------------------------------------------------------------
# A. the house's front from ahead (looking aft): starboard to the left, port to the right. Heights over the officers' deck.
# ---------------------------------------------------------------------------------------------------------------------
AX0, AY0 = LEFT + (WING + 0.15) * K, 512.0           # the centreline, and the officers' deck
XA = lambda x: AX0 + x * K
HA = lambda h: AY0 - h * K                           # a height over the officers' deck
HB = lambda h: AY0 - (TIER + h) * K                  # a height over the bridge deck
text(LEFT, 96, "A   THE HOUSE'S FRONT FROM AHEAD, looking aft", 12, weight='700')
text(LEFT, 111, "the officers' deck and the bridge deck; the knees under the gallery laid over the windows that are already in the front", 10, fill=DIM)
# the officers' house front and its windows
rect(XA(-HH), HA(TIER), XA(HH), HA(0.0), '#f1efe6', INK, 1.1)
line(XA(-HH - 0.6), HA(0.0), XA(HH + 0.6), HA(0.0), 1.1)
text(XA(-HH) + 6, HA(0.0) - 6, f"officers' deck  {G.DECKS['officers']:.1f} m above the keel", 9.5, fill=DIM)
for a, b, lo, hi in WINS:
    add(f'<rect x="{XA(a):.1f}" y="{HA(hi):.1f}" width="{(b - a) * K:.1f}" height="{(hi - lo) * K:.1f}" rx="{0.10 * K:.1f}" fill="{GLASS}" fill-opacity="0.28" stroke="{GLASS}" stroke-width="1.3"/>')
    line(XA(a - 0.04), HA(hi + 0.07), XA(b + 0.04), HA(hi + 0.07), 1.6, GLASS)             # its eyebrow
names = {'master': "master's suite", 'wheelhouse-stair': 'stair', 'office': "ship's office", 'pilot-cabin': 'pilot cabin', 'chief-engineer': 'chief engineer'}
rooms = sorted((r for r in G.SPACES if r['plan'] == 'officers' and abs(r['yard'][1] - H1) < 0.01), key=lambda r: r['x'][0])
for r in rooms:
    text(XA((r['x'][0] + r['x'][1]) / 2), HA(0.42), names.get(r['id'], r['name']), 9.5, 'middle', fill=FAINT)
    if abs(r['x'][1]) < HH - 0.01:
        line(XA(r['x'][1]), HA(0.0), XA(r['x'][1]), HA(TIER), 0.7, FAINT, '7 3 1.5 3')      # the bulkhead behind the plating
text(XA(-HH) + 6, HA(0.80), 'chain lines: the bulkheads behind the front', 9, fill=FAINT)
# the bridge deck, carried out to her side under the wings, and the gallery's face bar
line(XA(-WING), HA(TIER), XA(WING), HA(TIER), 1.6)
text(XA(-WING) + 4, HA(TIER) - 6, f"bridge deck  {G.DECKS['bridge']:.1f} m", 9.5, fill=DIM)
rect(XA(-GAL_K), HA(TIER), XA(GAL_K), HA(TIER - 0.14), '#dfe3df', INK, 1.0)
# the knees: plates seen on edge, each on a bulkhead; and the beams between knees far apart
for x, reach, depth in KNEES:
    rect(XA(x) - 2.2, HA(TIER - 0.012), XA(x) + 2.2, HA(TIER - 0.012 - depth), RED, RED, 0.4)
for x in BEAMS:
    rect(XA(x) - 1.6, HA(TIER - 0.012), XA(x) + 1.6, HA(TIER - 0.14), AMBER, AMBER, 0.4)
# each knee's distance to the windows beside it, and its foot over the windows' heads
hw = (WINS[0][2] + WINS[0][3]) / 2
for x, reach, depth in KNEES:
    left = max((w[1] for w in WINS if w[1] <= x), default=None)
    right = min((w[0] for w in WINS if w[0] >= x), default=None)
    line(XA(x), HA(TIER - 0.012 - depth), XA(x), HA(hw - 0.42), 0.4, DIM, '2 3')
    for edge in (left, right):
        if edge is not None and abs(edge - x) < 1.4:
            dim(XA(min(x, edge)), HA(hw - 0.42), XA(max(x, edge)), HA(hw - 0.42), f'{abs(edge - x):.2f}', off=12, c=RED, weight='700')
            line(XA(edge), HA(WINS[0][2]), XA(edge), HA(hw - 0.50), 0.4, DIM, '2 3')
kx, kr, kd = KNEES[-1]
dim(XA(HH) + 22, HA(TIER), XA(HH) + 22, HA(TIER - 0.012 - kd), f'knee {kd:.2f}', off=-5)
dim(XA(HH) + 22, HA(TIER - 0.012 - kd), XA(HH) + 22, HA(WINS[0][3]), f'{TIER - 0.012 - kd - WINS[0][3]:.2f}', off=-5, c=RED, weight='700')
line(XA(kx), HA(TIER - 0.012 - kd), XA(HH) + 28, HA(TIER - 0.012 - kd), 0.4, DIM, '2 3')
line(XA(WINS[-1][1]), HA(WINS[0][3]), XA(HH) + 28, HA(WINS[0][3]), 0.4, DIM, '2 3')
dim(XA(-HH) - 22, HA(0.0), XA(-HH) - 22, HA(TIER), f'{TIER:.2f}', off=-5)
dim(XA(WINS[0][0]) - 12, HA(0.0), XA(WINS[0][0]) - 12, HA(WINS[0][2]), f'{WINS[0][2]:.2f}', off=-5)
dim(XA(WINS[0][0]) - 12, HA(WINS[0][2]), XA(WINS[0][0]) - 12, HA(WINS[0][3]), f'{WINS[0][3] - WINS[0][2]:.2f}', off=-5)
note(XA(KNEES[1][0]) - 70, HA(TIER - 0.50), 'knee, on the bulkhead', XA(KNEES[1][0]) - 2, HA(TIER - 0.45), anchor='end', c=RED)
if BEAMS:
    note(XA(BEAMS[0]) + 40, HA(TIER - 0.42), 'beam under the plate only: it comes no lower than the face bar', XA(BEAMS[0]), HA(TIER - 0.10), c=AMBER)
# over the bridge deck: the wings' fronts, the bay, the roof and the compass deck
for sgn in (-1, 1):
    a, b = sorted((sgn * BP.HOUSE_X, sgn * WING))
    rect(XA(a), HB(0.0), XA(b), HB(ROOF), 'none', INK, 0.9)
    rect(XA(a) + 6, HB(SILL), XA(b) - 6, HB(HEAD), GLASS, GLASS, 0.6, opacity=0.14)
    text(XA((a + b) / 2 + sgn * 0.6), HB(1.45), 'wing, closed in: a door and five panes', 9.5, 'middle', fill=FAINT)
    a, b = sorted((sgn * D0, sgn * D1))
    rect(XA(a), HB(0.15), XA(b), HB(2.01), '#dddcd4', GREEN, 1.4)
    rect(XA(a) + 6, HB(0.95), XA(b) - 6, HB(1.95), GLASS, GLASS, 0.6, opacity=0.25)
    text(XA((a + b) / 2), HB(0.45), 'door', 9, 'middle', '700', fill=GREEN)
poly([(XA(-BP.HOUSE_X), HB(0.0)), (XA(BP.HOUSE_X), HB(0.0)), (XA(BP.HOUSE_X), HB(ROOF)), (XA(-BP.HOUSE_X), HB(ROOF))], '#f6f4ec', INK, 1.1)
for name, s0, s1 in BP.PANES:                                                    # the bay's five panes: the cants are seen aslant
    p, q = BP.on_wall(name, s0, BP.WALL), BP.on_wall(name, s1, BP.WALL)
    a, b = sorted((p[0], q[0]))
    rect(XA(a), HB(SILL), XA(b), HB(HEAD), GLASS, GLASS, 1.0, opacity=0.22)
for sgn in (-1, 1):
    line(XA(sgn * BP.BAY_XO), HB(0.0), XA(sgn * BP.BAY_XO), HB(ROOF), 0.7, INK)
text(XA(0.0), HB(1.50), 'forward face: three panes', 9.5, 'middle', fill=DIM)
text(XA(2.5), HB(0.50), 'cant', 9, 'middle', fill=DIM)
text(XA(-2.5), HB(0.50), 'cant', 9, 'middle', fill=DIM)
rect(XA(-WING - 0.09), HB(ROOF - 0.05), XA(WING + 0.09), HB(ROOF), '#e4e2d8', INK, 0.9)                # the roof, one line from side to side
rect(XA(-S.COMPASS['half']), HB(ROOF), XA(S.COMPASS['half']), HB(ROOF + S.COMPASS['slab']), '#f1efe6', INK, 0.9)
text(XA(0.0), HB(ROOF + 0.10), 'compass deck', 9, 'middle', fill=FAINT)
for sgn in (-1, 1):                                                              # the gallery's rail, 1.0 m
    line(XA(sgn * (GAL_K - 0.08)), HB(0.0), XA(sgn * (GAL_K - 0.08)), HB(1.0), 0.7, FAINT)
for hh in (0.23, 0.615, 1.0):
    line(XA(-GAL_K + 0.08), HB(hh), XA(GAL_K - 0.08), HB(hh), 0.5, FAINT)
dim(XA(-BP.BAY_XO), HB(ROOF + 0.50), XA(BP.BAY_XO), HB(ROOF + 0.50), f'{2 * BP.BAY_XO:.2f}  forward face', off=-5)
dim(XA(-BP.HOUSE_X), HB(ROOF + 0.80), XA(BP.HOUSE_X), HB(ROOF + 0.80), f'{2 * BP.HOUSE_X:.2f}  the bay at the house side', off=-5)
text(XA(0.0), HA(-0.28), 'STARBOARD   ←      her centreline      →   PORT', 9.5, 'middle', fill=FAINT)
line(XA(0.0), HA(-0.12), XA(0.0), HB(ROOF + 0.95), 0.5, FAINT, '10 3 2 3')
A_BOTTOM = HA(-0.40)

# ---------------------------------------------------------------------------------------------------------------------
# C. the section on the centreline, looking to port: forward to the right, at the heights of view A
# ---------------------------------------------------------------------------------------------------------------------
CX0 = XA(WING) + 150                                 # 101.0 m from the transom
XC = lambda yard: CX0 + (yard - 101.0) * K
text(CX0 - 20, 96, 'C   SECTION ON THE CENTRELINE, looking to port', 12, weight='700')
text(CX0 - 20, 111, 'forward to the right; the knee nearest the centreline is drawn', 10, fill=DIM)
line(XC(101.2), HA(0.0), XC(H1), HA(0.0), 1.1)                                    # the officers' deck
rect(XC(H1) - 1.5, HA(TIER), XC(H1) + 1.5, HA(0.0), INK, INK, 0.3)                # the house's front
rect(XC(H1) - 2.6, HA(WINS[0][3]), XC(H1) + 2.6, HA(WINS[0][2]), GLASS, GLASS, 0.6, opacity=0.5)
note(XC(H1) - 40, HA(1.36), 'a window: 0.80 m to one side of this knee', XC(H1) - 3, HA(1.36), anchor='end', c=GLASS)
line(XC(101.2), HA(TIER), XC(GAL_Y), HA(TIER), 1.6)                               # the bridge deck and its gallery
rect(XC(GAL_Y - 0.03) - 1.2, HA(TIER), XC(GAL_Y - 0.03) + 1.2, HA(TIER - 0.14), INK, INK, 0.3)
kx, kr, kd = next(k for k in KNEES if abs(k[0]) == min(abs(q[0]) for q in KNEES))      # the knee nearest the centreline
poly([(XC(H1), HA(TIER - 0.012)), (XC(kr), HA(TIER - 0.012)), (XC(kr), HA(TIER - 0.14)), (XC(H1 + 0.10), HA(TIER - 0.012 - kd)), (XC(H1), HA(TIER - 0.012 - kd))], RED, RED, 0.8, opacity=0.25)
note(XC(H1 + 0.75), HA(TIER - 1.00), f'knee at x {kx:+.2f} m', XC(H1 + 0.30), HA(TIER - 0.45), c=RED)
# the bay's forward face: plating and lining below the sill, the glass leaning forward, the head, the roof and its eave
bi, bo = ya(BP.BAY_IN), ya(BP.BAY_OUT)
rect(XC(bi), HB(0.0), XC(bo), HB(SILL), '#dcd9cd', INK, 0.9)
poly([(XC(bi), HB(SILL)), (XC(bo), HB(SILL)), (XC(bo + LEAN), HB(HEAD)), (XC(bi + LEAN), HB(HEAD))], GLASS, GLASS, 0.9, opacity=0.25)
rect(XC(bi + LEAN), HB(HEAD), XC(bo + LEAN), HB(ROOF - 0.05), '#dcd9cd', INK, 0.9)
rect(XC(ya(23.09)), HB(ROOF - 0.05), XC(bo + LEAN + 0.257), HB(ROOF), '#e4e2d8', INK, 0.9)
rect(XC(101.2), HB(ROOF), XC(ya(S.COMPASS['yards'][1])), HB(ROOF + S.COMPASS['slab']), '#f1efe6', INK, 0.9)
line(XC(101.2), HB(CLEAR), XC(bi + LEAN), HB(CLEAR), 0.6, FAINT)                  # the deckhead's strips
line(XC(ya(BP.FRONT)), HB(-0.25), XC(ya(BP.FRONT)), HB(ROOF + 0.35), 0.5, FAINT, '6 3')
text(XC(ya(BP.FRONT)) - 4, HB(ROOF + 0.42), "the old front: the wings' line", 9, 'end', fill=FAINT)
# the console block, in its low middle: where it has always stood, now free of the front
blk = [(B['face'], 0.10), (B['face'], 0.885), (B['nose'] + 0.010, 0.885), (B['nose'], 0.895), (B['nose'], 0.922), B['desk'][0], B['desk'][1], (B['mid'][0], 1.0),
       (B['mid'][0] + (B['mid'][1] - 1.0) * tan(radians(20)), B['mid'][1]), (B['back'], B['mid'][1]), (B['back'], 0.10)]
poly([(XC(ya(a)), HB(h)) for a, h in blk], '#2f5886', INK, 0.9, opacity=0.35)
text(XC(ya((B['face'] + B['back']) / 2)), HB(0.45), 'console', 9, 'middle', fill=INK)
text(XC(ya((B['face'] + B['back']) / 2)), HB(0.30), 'block', 9, 'middle', fill=INK)
dim(XC(ya(B['back'])), HB(0.62), XC(bi), HB(0.62), f'{BP.BAY_IN - B["back"]:.2f}  the way', off=-5, c=GREEN, weight='700')
# the service door of a bay, open into the way; the cables under the deck
line(XC(ya(B['back'])), HB(0.36), XC(ya(B['back'] + 0.62)), HB(0.36), 1.0, GREEN, '3 2')
text(XC(ya(B['back'])) + 4, HB(0.20), 'service door, open', 8.5, fill=GREEN)
fy, uy = ya(REG.NODES['FOOT-P'][1]), ya(REG.NODES['UP-P'][1])
poly([(XC(fy), HB(SILL)), (XC(fy), HB(-0.16)), (XC(uy), HB(-0.16)), (XC(uy), HB(0.44))], 'none', AMBER, 1.2, '5 3', close=False)
note(XC(uy) - 150, HB(-0.50), 'cables: under the deck, transit to transit', XC((fy + uy) / 2), HB(-0.16), anchor='end', c=AMBER)
# the eye at the wheel, and the line over the block: it is the block that bounds the view down, not the bay's sill
ex, eh = ya(20.9), 1.6
top = (ya(B['back']), B['mid'][1])
slope = (eh - top[1]) / (top[0] - ex)
far = bi + 0.045
over = eh - slope * (far - ex) - (SILL + 0.045)
line(XC(max(ex, 101.2)), HB(eh - slope * (max(ex, 101.2) - ex)), XC(bo + 0.9), HB(eh - slope * (bo + 0.9 - ex)), 0.6, DIM, '8 3')
text(XC(101.45), HB(eh - slope * (101.45 - ex)) - 6, 'from the eye at the wheel, 1.60 m', 8.5, fill=DIM)
note(XC(bo + 1.05), HB(1.62), f'the line over the block clears', XC(far), HB(eh - slope * (far - ex)), c=DIM)
text(XC(bo + 1.05) + 3, HB(1.62) + 12, f'the bay\'s sill by {over:.2f} m', 9.5, fill=DIM)
for hh in (0.23, 0.615, 1.0):                                                    # the gallery's rail
    line(XC(GAL_Y - 0.08) - 3, HB(hh), XC(GAL_Y - 0.08) + 3, HB(hh), 0.8, FAINT)
line(XC(GAL_Y - 0.08), HB(0.0), XC(GAL_Y - 0.08), HB(1.0), 0.9, FAINT)
dim(XC(H1), HA(TIER) + 30, XC(bo), HA(TIER) + 30, f'{bo - H1:.2f}', off=12)
dim(XC(bo), HA(TIER) + 30, XC(GAL_Y), HA(TIER) + 30, f'{GAL_Y - bo:.2f}', off=12)
text(XC(GAL_Y) + 8, HA(TIER) + 34, 'gallery', 9.5, fill=DIM)
line(XC(bo), HB(0.0), XC(bo), HA(TIER) + 36, 0.4, DIM, '2 3')
line(XC(GAL_Y), HA(TIER), XC(GAL_Y), HA(TIER) + 36, 0.4, DIM, '2 3')
dim(XC(GAL_Y) + 150, HB(0.0), XC(GAL_Y) + 150, HB(SILL), f'{SILL:.2f}', off=-5)
dim(XC(GAL_Y) + 150, HB(SILL), XC(GAL_Y) + 150, HB(HEAD), f'{HEAD - SILL:.2f}', off=-5)
dim(XC(GAL_Y) + 178, HB(0.0), XC(GAL_Y) + 178, HB(ROOF), f'{ROOF:.2f}', off=-5)
text(XC(GAL_Y) + 158, HB(SILL / 2), 'sill', 9, fill=DIM)
text(XC(GAL_Y) + 158, HB((SILL + HEAD) / 2), 'glass,', 9, fill=DIM)
text(XC(GAL_Y) + 158, HB((SILL + HEAD) / 2) + 11, 'leaning 10°', 9, fill=DIM)

# ---------------------------------------------------------------------------------------------------------------------
# B. the plan at the bridge deck, under view A at the same breadths: her bow toward the foot of the sheet
# ---------------------------------------------------------------------------------------------------------------------
BY0 = A_BOTTOM + 86                                  # 99.9 m from the transom
YB = lambda yard: BY0 + (yard - 99.9) * K
text(LEFT, BY0 - 38, 'B   PLAN AT THE BRIDGE DECK', 12, weight='700')
text(LEFT, BY0 - 23, "under view A at the same breadths, her bow toward the foot of the sheet; below the deck, drawn in chain lines: the house's front, its windows, the knees", 10, fill=DIM)
aft, old = ya(19.495), ya(BP.FRONT)
# the bridge deck's edge: the wings, the ledge before them, the gallery
edge = [(WING, aft), (WING, old), (HH, old), (HH, H1), (GAL_K, H1), (GAL_X, GAL_Y), (-GAL_X, GAL_Y), (-GAL_K, H1), (-HH, H1), (-HH, old), (-WING, old), (-WING, aft)]
poly([(XA(x), YB(v)) for x, v in edge], '#eef0ea', INK, 1.0)
# the gallery's rail, 8 cm inside its edge, and the ledge's
gx = GAL_X - 0.08 * (2 ** 0.5 - 1)
rail = [(HH - 0.08, old + 0.1), (HH - 0.08, H1 - 0.08), (ST.BAY_LINE - 0.08 * 2 ** 0.5 - (H1 - 0.08), H1 - 0.08), (gx, GAL_Y - 0.08)]
poly([(XA(x), YB(v)) for x, v in rail] + [(XA(-x), YB(v)) for x, v in rail[::-1]], 'none', FAINT, 0.9, '9 3 2 3', close=False)
note(XA(5.6), YB(GAL_Y - 0.10), 'rail, three courses, 1.0 m', XA(gx - 0.6), YB(GAL_Y - 0.08), c=FAINT)
# below the deck: the house's front, its windows, the knees and the beams
line(XA(-HH), YB(H1), XA(HH), YB(H1), 0.8, FAINT, '10 3 2 3')
for a, b, lo, hi in WINS:
    line(XA(a), YB(H1), XA(b), YB(H1), 4.0, GLASS)
for x, reach, depth in KNEES:
    line(XA(x), YB(H1), XA(x), YB(reach), 2.2, RED, '6 2')
for x in BEAMS:
    line(XA(x), YB(H1), XA(x), YB(min(GAL_Y - 0.03, ST.BAY_LINE - abs(x)) - 0.03), 1.4, AMBER, '3 2')
note(XA(-4.2), YB(GAL_Y - 0.25), 'knees, on the bulkheads (under)', XA(KNEES[0][0]), YB(H1 + 0.30), anchor='end', c=RED)
note(XA(-4.2), YB(GAL_Y + 0.05), "windows of the officers' deck (under)", XA((WINS[2][0] + WINS[2][1]) / 2), YB(H1), anchor='end', c=GLASS)
# the wheelhouse: its after wall and sides, the wings' fronts, and the bay
wall = dict(fill='#cfccc0', c=INK, w=0.8)
for sgn in (-1, 1):
    a, b = sorted((sgn * BP.SIDE_IN, sgn * BP.HOUSE_X))
    rect(XA(a), YB(aft), XA(b), YB(old), **wall)                                                         # the house side
    a, b = sorted((sgn * BP.HOUSE_X, sgn * WING))
    rect(XA(a), YB(old - 0.06), XA(b), YB(old), **wall)                                                   # the wing's front
    rect(XA(sgn * WING), YB(aft), XA(sgn * (WING - 0.06)), YB(old), **wall)                               # her side
rect(XA(-WING), YB(aft), XA(WING), YB(aft + 0.05), **wall)
cant = lambda sgn: [(sgn * BP.SIDE_IN, ya(BP.CANT_AT)), (sgn * BP.BAY_XI, ya(BP.BAY_IN)), (sgn * BP.BAY_XO, ya(BP.BAY_OUT)), (sgn * BP.HOUSE_X, old)]
for sgn in (-1, 1):
    poly([(XA(x), YB(v)) for x, v in cant(sgn)], **wall)
rect(XA(-BP.BAY_XI), YB(ya(BP.BAY_IN)), XA(BP.BAY_XI), YB(ya(BP.BAY_OUT)), **wall)
for name, s0, s1 in BP.PANES:                                                    # the five panes, on the glass's own line
    p, q = BP.on_wall(name, s0, 0.045), BP.on_wall(name, s1, 0.045)
    line(XA(p[0]), YB(ya(p[1])), XA(q[0]), YB(ya(q[1])), 3.0, GLASS)
# the doors from the wings onto the gallery: hinged inboard, opening outward; the leaf drawn open 100 degrees, and its swing
for sgn in (-1, 1):
    hx, hy = sgn * HINGE[0], HINGE[1]
    arc = [(hx + sgn * LEAF * cos(radians(t)), hy + LEAF * sin(radians(t))) for t in range(0, 101, 5)]
    poly([(XA(x), YB(v)) for x, v in arc], 'none', GREEN, 0.7, '3 2', close=False)
    line(XA(hx), YB(hy), XA(arc[-1][0]), YB(arc[-1][1]), 1.6, GREEN)
    rect(XA(sgn * D0), YB(hy - 0.06), XA(sgn * D1), YB(hy), PAPER, GREEN, 0.9)
tx, ty = HINGE[0] + LEAF * cos(radians(45)), HINGE[1] + LEAF * sin(radians(45))
note(XA(5.6), YB(H1 + 0.62), f'door to the gallery, each wing: it opens outward; its leaf clears the rail by {SWING:.2f} m', XA(tx), YB(ty), c=GREEN)
# the room: the console block, free; the watchkeeper's table; the settee
rect(XA(-B['half']), YB(ya(B['nose'])), XA(B['half']), YB(ya(B['back'])), '#2f5886', INK, 1.0, opacity=0.35)
line(XA(-B['half']), YB(ya(B['up'][0])), XA(B['half']), YB(ya(B['up'][0])), 0.6, INK)
text(XA(0.0), YB(ya(B['face'] + 0.14)), 'CONSOLE BLOCK, free-standing', 9.5, 'middle', '700')
for i in range(5):                                                               # a service door in each bay; the middle one drawn open
    a = -B['half'] + i * 2 * B['half'] / 5
    line(XA(a + 0.04), YB(ya(B['back'])), XA(a + 2 * B['half'] / 5 - 0.04), YB(ya(B['back'])), 2.4, GREEN)
door = 2 * B['half'] / 5 - 0.07
hx = B['half'] / 5 - 0.035
add(f'<path d="M {XA(hx - door):.1f} {YB(ya(B["back"])):.1f} A {door * K:.1f} {door * K:.1f} 0 0 0 {XA(hx + door * 0.26):.1f} {YB(ya(B["back"] + door * 0.966)):.1f}" fill="none" stroke="{GREEN}" stroke-width="0.7" stroke-dasharray="3 2"/>')
line(XA(hx), YB(ya(B['back'])), XA(hx + door * 0.26), YB(ya(B['back'] + door * 0.966)), 1.2, GREEN)
note(XA(5.6), YB(H1 + 0.95), 'five service doors in the block\'s back (the middle one drawn open): terminals, earth bar, transit', XA(1.3), YB(ya(B['back'])) + 1, c=GREEN)
rect(XA(T_X[0]), YB(ya(T_Y[0])), XA(T_X[1]), YB(ya(T_Y[1])), '#c49a5e', INK, 0.8, opacity=0.6)
text(XA((T_X[0] + T_X[1]) / 2), YB(ya(T_Y[0])) - 5, 'table', 9, 'middle', fill=DIM)
rect(XA(S_X[0]), YB(ya(S_Y[0])), XA(S_X[1]), YB(ya(S_Y[1])), '#3a3f45', INK, 0.8, opacity=0.55)
text(XA((S_X[0] + S_X[1]) / 2), YB(ya(S_Y[1])) + 12, 'settee', 9, 'middle', '700', fill=INK)
# the port wing, where the settee stands: what was there first is drawn, so that it is seen to be clear of it. The door and
# the window of the after wall; the fire hose box and the hydrant in the inboard corner; the wheelhouse's door and its swing.
d0, d1 = BP.WING_AFT_DOOR
w0, w1 = BP.WING_AFT_WINDOW
line(XA(d0), YB(ya(BP.WING_AFT)) - 1.5, XA(d1), YB(ya(BP.WING_AFT)) - 1.5, 3.4, GREEN)
text(XA((d0 + d1) / 2), YB(ya(BP.WING_AFT)) + 12, 'door', 8.5, 'middle', fill=GREEN)
line(XA(w0), YB(ya(BP.WING_AFT)) - 1.5, XA(w1), YB(ya(BP.WING_AFT)) - 1.5, 3.4, GLASS)
text(XA((S_X[1] + w1) / 2 + 0.25), YB(ya(BP.WING_AFT)) + 12, 'window, sill 1.15', 8.5, 'middle', fill=GLASS)
hx, hy = HOSE['at'][0], HOSE['at'][1]
rect(XA(BP.HOUSE_X), YB(ya(hy - 0.26)), XA(BP.HOUSE_X + 0.22), YB(ya(hy + 0.26)), RED, RED, 0.6, opacity=0.5)
add(f'<circle cx="{XA(HYDRANT["at"][0] + 0.06):.1f}" cy="{YB(ya(HYDRANT["at"][1])):.1f}" r="{0.085 * K:.1f}" fill="{RED}" fill-opacity="0.5" stroke="{RED}" stroke-width="0.6"/>')
note(XA(4.1), YB(ya(hy + 1.55)), 'fire hose box and hydrant: kept clear', XA(BP.HOUSE_X + 0.22), YB(ya(hy)), c=RED)
yd0, yd1 = WH_DOOR['g']['yd']
leaf = yd1 - yd0 - 2 * BP.DOOR_JAMB
hinge = (BP.HOUSE_X - 0.03, yd1 - BP.DOOR_JAMB)
arc = [(hinge[0] + leaf * sin(radians(t)), hinge[1] - leaf * cos(radians(t))) for t in range(0, 101, 5)]
poly([(XA(x), YB(ya(v))) for x, v in arc], 'none', FAINT, 0.6, '3 2', close=False)
dim(XA(d1), YB(ya(S_Y[1])) + 26, XA(S_X[0]), YB(ya(S_Y[1])) + 26, f'{S_X[0] - d1:.2f}', off=12)
dim(XA(BP.HOUSE_X + 0.22), YB(ya(S_Y[1])) + 44, XA(S_X[0]), YB(ya(S_Y[1])) + 44, f'{S_X[0] - BP.HOUSE_X - 0.22:.2f}  from the hose box', off=12, c=RED)
ym = YB(ya((B['nose'] + B['back']) / 2 + 0.16))
dim(XA(T_X[1]), ym, XA(-B['half']), ym, f'{WAY_S:.2f}', off=-5, c=GREEN, weight='700')
dim(XA(B['half']), ym, XA(B['half'] + WAY_P), ym, f'{WAY_P:.2f}', off=-5, c=GREEN if WAY_P >= 0.7 else RED, weight='700')
dim(XA(1.2), YB(ya(B['back'])), XA(1.2), YB(ya(BP.BAY_IN)), f'{BP.BAY_IN - B["back"]:.2f}  the way', off=-6, c=GREEN, weight='700')
# the cable ways under the deck, from each mullion's transit to the block's
for tag in ('P', 'S'):
    f, u = REG.NODES['FOOT-' + tag], REG.NODES['UP-' + tag]
    line(XA(f[0]), YB(ya(f[1])), XA(u[0]), YB(ya(u[1])), 1.2, AMBER, '5 3')
    for q in (f, u):
        rect(XA(q[0]) - 3.5, YB(ya(q[1])) - 3.5, XA(q[0]) + 3.5, YB(ya(q[1])) + 3.5, AMBER, AMBER, 0.4)
note(XA(5.6), YB(H1 + 1.28), 'cable transits, and the run under the deck between them', XA(REG.NODES['FOOT-P'][0]), YB(ya(REG.NODES['FOOT-P'][1] - 0.4)), c=AMBER)
# measures along her
dx = XA(-GAL_K) - 34
dim(dx, YB(old), dx, YB(ya(BP.BAY_OUT)), f'{BP.BAY:.2f}  bay', off=-6)
dim(dx - 30, YB(H1), dx - 30, YB(ya(BP.BAY_OUT)), f'{ya(BP.BAY_OUT) - H1:.2f}', off=-6)
dim(dx - 30, YB(ya(BP.BAY_OUT)), dx - 30, YB(GAL_Y), f'{GAL_Y - ya(BP.BAY_OUT):.2f}', off=-6)
for v in (old, H1, ya(BP.BAY_OUT), GAL_Y):
    line(dx - 36, YB(v), XA(-GAL_X), YB(v), 0.4, DIM, '2 3')
text(XA(-WING) + 6, YB(aft) + 16, f'{aft:.1f} m from the transom', 9, fill=FAINT)
text(XA(-HH) + 6, YB(H1) - 5, f"house's front, {H1:.1f} m", 9, fill=FAINT)
text(XA(WING) - 6, YB(GAL_Y) + 4, 'BOW  ↓', 10, 'end', fill=FAINT)
B_BOTTOM = YB(GAL_Y) + 26

# ---------------------------------------------------------------------------------------------------------------------
# what was checked, and what is not settled
# ---------------------------------------------------------------------------------------------------------------------
py_ = B_BOTTOM + 30
col = [LEFT, LEFT + 600, LEFT + 1220]
text(col[0], py_, 'THE KNEES AGAINST THE WINDOWS', 12, weight='700')
rows = []
for x, reach, depth in KNEES:
    wall = next((names.get(a['id'], a['name']) + ' / ' + names.get(b['id'], b['name']) for a, b in zip(rooms, rooms[1:]) if abs(a['x'][1] - x) < 0.01), '')
    gap = min(min(abs(x - w[0]), abs(x - w[1])) for w in WINS)
    rows.append(f'x {x:+.3f} m: on the bulkhead {wall}; {reach - H1:.2f} m long, {depth:.2f} m deep; the nearest window {gap:.2f} m away')
y1 = py_
for s in rows:
    y1 += 4
    for part in wrap(s, 88):
        y1 += 13
        text(col[0], y1, part, 10)
y1 += 9
for s in wrap(f"The rule (steel.bay_knees): a knee stands only in line with a bulkhead of the deck below; the build stops if one is nearer a window's opening than "
              f"{ST.KNEE_CLEAR:.2f} m; every knee's foot ends above the windows' heads ({TIER - 0.012 - KNEES[0][2] - WINS[0][3]:.2f} m here), though none is over one. "
              f"Between knees more than 1.6 m apart a beam under the plate (x {', '.join(f'{b:+.2f}' for b in BEAMS)}): it comes no lower than the face bar, {WINS[0][3] and TIER - 0.14 - WINS[0][3]:.2f} m over the windows' heads.", 92):
    y1 += 13
    text(col[0], y1, s, 10, fill=DIM)
text(col[1], py_, 'WHAT THE BAY IS FOR', 12, weight='700')
y2 = py_
WHY = (
    f'The console block stood against the forward bulkhead. A chief constructor, of that: it must be reached from its other side for electrical work and maintenance. '
    f'The middle of the bridge front is built {BP.BAY:.2f} m forward as a bay with a canted corner each side (the owner\'s photograph of the Finnarrow: "that protruding part '
    f'forward on the bridge"); the block keeps its place and stands free, with a way {BP.BAY_IN - B["back"]:.2f} m wide before it.',
    f'The way is entered from either side: to starboard past the watchkeeper\'s table, {WAY_S:.2f} m; to port {WAY_P:.2f} m ({WAY_P_BOX:.2f} m between the binocular box on the block\'s end and the handrail). '
    f'The settee, which closed the port way to 0.46 m, stands in the port wing against its after wall, {S_X[0] - BP.WING_AFT_DOOR[1]:.2f} m from the door and {S_X[0] - BP.HOUSE_X - 0.22:.2f} m clear of the fire hose box. '
    'In the block\'s back a service door for each of its five bays opens into the way.',
    'The block is fed from below now: its cables came down two window mullions into its back; they go down the same mullions to the deck, through it in a transit, '
    'under it, and up through a transit in the block\'s bottom. Two 24 V ways are a size heavier for the 4 m more (the register).',
    f'The bay stands {ya(BP.BAY_OUT) - H1:.2f} m beyond the house\'s front, and the bridge deck is carried {GAL_Y - ya(BP.BAY_OUT):.2f} m beyond the bay all round as a gallery, '
    'from which its glass is washed and its wipers reached.',
    f'The owner: "Of course needs doors to the deck outside the bridge". A weathertight door in each wing\'s forward wall, beside the house\'s corner, opens outward onto the gallery, '
    f'hinged on its inboard edge; the gallery is {BP.GALLERY:.2f} m wide so that the leaf ({LEAF:.2f} m) clears the rail by {SWING:.2f} m through its whole swing.',
)
for s in WHY:
    y2 += 6
    for part in wrap(s, 88):
        y2 += 13
        text(col[1], y2, part, 10)
text(col[2], py_, 'NOT SETTLED', 12, weight='700')
y3 = py_
OPEN = (
    'No scantling is calculated: the gallery\'s plate, face bar, knees and beams are drawn at the sizes of the wings\' own, and their welds to the front are not designed.',
    'The sight-line calculation JS4-402 is not run again with the bay; the line in view C is this sheet\'s own.',
    'The doors to the gallery stand in a forward-facing wall: their coamings are 0.15 m as her other bridge doors\' are, and no rule was looked up for a door in that position.',
    'The general arrangement (JS1-102) still draws the wheelhouse as a rectangle to 103.5 m.',
)
for i, s in enumerate(OPEN):
    y3 += 6
    for j, part in enumerate(wrap(s, 78)):
        y3 += 13
        if j == 0:
            text(col[2], y3, f'{i + 1}', 10, weight='700', fill=DIM)
        text(col[2] + 16, y3, part, 10)

# ---------------------------------------------------------------------------------------------------------------------
# the foot of the sheet: a scale, where it comes from
# ---------------------------------------------------------------------------------------------------------------------
y = max(y1, y2, y3) + 38
for i in range(5):
    rect(LEFT + i * K, y, LEFT + (i + 1) * K, y + 5, INK if i % 2 == 0 else PAPER, INK, 0.7)
    text(LEFT + i * K, y + 17, str(i), 9, 'middle', fill=DIM)
text(LEFT + 5 * K, y + 17, '5 m', 9, 'middle', fill=DIM)
text(LEFT + 5 * K + 26, y + 7, 'All three views at this scale.', 10, fill=DIM)
text(WIDTH - 24, y + 7, f'Made by ferry/yard/drawings/bay_drawing.py from ferry/blender/bridge_place.py, ga.py, spec.py, steel.py and the register (revision {G.REVISION}): the numbers the model is built from.', 10, 'end', fill=FAINT)
height = y + 34
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height:.0f}" width="{WIDTH}" height="{height:.0f}" font-family="DejaVu Sans, Helvetica, Arial, sans-serif">'
       f'<title>{escape(S.NAME)}: {escape(TITLE)}, {NUMBER} revision {REVISION}</title>'
       f'<rect width="{WIDTH}" height="{height:.0f}" fill="{PAPER}"/>' + ''.join(out) + '</svg>')
path = os.path.join(HERE, f'{NUMBER}-wheelhouse-forward-bay.svg')
open(path, 'w').write(svg)
print(f'wrote {path}')
for s in rows:
    print(' ', s)
print(f'  the ways past the block: starboard {WAY_S:.2f} m, port {WAY_P:.2f} m ({WAY_P_BOX:.2f} at the binocular box); before it {BP.BAY_IN - B["back"]:.2f} m')
print(f'  the settee: x {S_X[0]:.2f} to {S_X[1]:.2f} m, {ya(S_Y[0]):.2f} to {ya(S_Y[1]):.2f} m from the transom; {S_X[0] - BP.WING_AFT_DOOR[1]:.2f} m from the wing\'s after door, {S_X[0] - BP.HOUSE_X - 0.22:.2f} m from the hose box')
print(f'  the doors to the gallery: leaf {LEAF:.2f} m, {SWING:.2f} m clear of the rail through its swing; the gallery {BP.GALLERY:.2f} m')
