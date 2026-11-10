#!/usr/bin/env python3
"""The bridge drawings: CHR-B1 … B6, as DXF, PDF and PNG in sheets/.

    python3 ferry/design/bridge/sheets.py [B1 B2 …]

Every line is the model's own: the plans and sections are cuts through the triangles of the page's `bridge` group
(ferry/data/ferry.bin.gz), the equipment is the register's (register.py), the findings are findings.py's.
"""
import json
import math
import os
import sys

import numpy as np

import cadlib as D
import cutlib as C
import findings as FD
import register as R

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'sheets')
os.makedirs(OUT, exist_ok=True)
SNAP = R.SNAP
ROWS = R.ROWS
FINDINGS = FD.F
TRIS, MATS, HEADER, GROUP = C.group_triangles()
YARD = 17.25
DECK = 9.1
COMMIT = SNAP['source']['commit']
SRC = f"ferry.bin.gz · Town {COMMIT}"
ROOMNAME = {'eg-room': 'Emergency generator', 'co2-room': 'CO2 room', 'crew-cabin': 'Crew cabin', 'mate-cabin': "Mate's cabin",
            'deckhand-cabin': "Deckhand's cabin", 'crew-wc': 'Crew WC and shower', 'mess': 'Mess', 'galley': 'Galley',
            'chief-cabin': "Chief engineer's cabin", 'master-cabin': "Master's cabin", 'corridor': 'Corridor', 'wheelhouse': 'Wheelhouse',
            'wing-p': 'Port wing', 'wing-s': 'Starboard wing'}


def cut_y(h):
    """Plan cut h metres above the bridge deck, (M,2,2) of (x, z)."""
    return C.cut_plane_y(TRIS, DECK + h)


def draw_cut(sh, view, segs, layer, clip=None):
    for a, b in segs:
        if clip and not (clip[0] <= a[0] <= clip[1] and clip[0] <= b[0] <= clip[1] and clip[2] <= a[1] <= clip[3] and clip[2] <= b[1] <= clip[3]):
            continue
        sh.line(view(*a), view(*b), layer)


def pos(row):
    """(x, z) in the model's metres of a register row, or None."""
    if row['yard'] is None:
        return None
    return row['x'], row['yard'] - YARD


def place_balloons(items, r, view, sheet):
    """items: [(label, (x, z))]; returns [(label, anchor_sheet_xy, balloon_xy)] with balloons pushed apart."""
    pts = [[*view(*p)] for _, p in items]
    anchors = [tuple(p) for p in pts]
    bal = [list(p) for p in pts]
    for _ in range(60):
        moved = False
        for i in range(len(bal)):
            for j in range(i + 1, len(bal)):
                dx, dy = bal[j][0] - bal[i][0], bal[j][1] - bal[i][1]
                d = math.hypot(dx, dy)
                if d < 2 * r + 1.0:
                    if d < 1e-6:
                        dx, dy, d = 1.0, 0.3 * (j - i), 1.0
                    push = (2 * r + 1.0 - d) / 2 + 0.05
                    bal[i][0] -= dx / d * push; bal[i][1] -= dy / d * push
                    bal[j][0] += dx / d * push; bal[j][1] += dy / d * push
                    moved = True
        if not moved:
            break
    return [(items[i][0], anchors[i], tuple(bal[i])) for i in range(len(items))]


def b1():
    sh = D.Sheet('B1', 'BRIDGE DECK · general arrangement', 'Plan cut 1.0 m above the deck, with equipment tags and findings',
                 ['1:50 plan and sections'], source=SRC)
    view = D.View('plan', 50, (-4.6, 4.6, -12.2, 6.4), (24, 36))
    # what stands on the floor (0.2 m above it) in grey, the cut at 1.0 m in black
    draw_cut(sh, view, cut_y(0.2), 'LOW')
    draw_cut(sh, view, cut_y(1.0), 'CUT')
    sh.text(view.o[0], view(0, 6.4)[1] + 3, 'BRIDGE DECK · PLAN · 1.0 m above the deck', 3.6, bold=True)
    sh.text(view.o[0] + 5, view(0, 6.4)[1] + 8, 'SCALE 1:50', 2.2)
    # rooms
    for r in SNAP['rooms']:
        if r['id'] in ('corridor',):
            continue
        cx = (r['x'][0] + r['x'][1]) / 2
        zt = r['z'][1] - 17.25 - 0.18
        if r['id'] == 'wheelhouse':
            cx, zt = 1.5, 3.1
        x, y = view(cx, zt)
        sh.text(x, y - 2.2, ROOMNAME[r['id']].split(':')[0].upper()[:26], 1.9, 'TEXT', 'c')
    x, y = view(0, 0.0)
    sh.text(view(0, -3.0)[0], view(0, -3.0)[1], 'CORRIDOR', 1.9, 'TEXT', 'c', rot=90)
    # doorways from the cut
    cut1 = cut_y(1.0)
    for side, c in (('port', 0.45), ('stbd', -0.45)):
        for a, b in C.wall_gaps(cut1, 'x', c, -11.25, 2.25):
            if b - a < 3:
                p, q = view(c, a), view(c, b)
                sh.tick_dim(p, q, f'{b - a:.2f}', off=-3.2 if side == 'stbd' else 3.2)
    # the equipment
    items = []
    for r in ROWS:
        if r['deck'] != 'bridge' or r['status'] not in ('built', 'part-built') or pos(r) is None:
            continue
        if r['room'] in ('wheelhouse',):
            continue
        items.append((r['id'][1:], pos(r), r))
    for lab, anchor, bal in place_balloons([(l, p) for l, p, _ in items], 2.4, view, sh):
        sh.line(anchor, bal, 'TAG')
        sh.circle(anchor, 0.35, 'TAG')
        sh.circle(bal, 2.4, 'TAG')
        sh.text(bal[0], bal[1], lab, 1.7, 'TAG', 'm')
    # the wheelhouse is on B2: say so
    wx, wy = view(0, 4.1)
    sh.text(wx, wy, 'WHEELHOUSE AND WINGS: SEE CHR-B2', 2.2, 'TEXT', 'c', bold=True)
    # findings with a place on the plan
    for f in FINDINGS:
        w = f['where']
        if not w or f['sheet'] != 'B1':
            continue
        p = view(w['x'], w['yard'] - YARD)
        sh.rect(p[0] - 2.6, p[1] - 2.6, p[0] + 2.6, p[1] + 2.6, 'FIND')
        sh.text(p[0], p[1], f['id'][3:], 1.7, 'FIND', 'm')
    # the bow
    ax, ay = view(4.4, 5.0)
    sh.line((ax, ay - 12), (ax, ay + 4), 'THIN'); sh.line((ax, ay + 4), (ax - 1.6, ay), 'THIN'); sh.line((ax, ay + 4), (ax + 1.6, ay), 'THIN')
    sh.text(ax, ay + 6, 'BOW', 1.8, 'TEXT', 'c')
    # a scale bar: 5 m
    sx, sy = view(4.4, -12.2)
    for i in range(5):
        sh.rect(sx - 5 * 20 + i * 20, sy - 7, sx - 5 * 20 + (i + 1) * 20, sy - 5.5, 'THIN')
    sh.text(sx - 100, sy - 11, '0', 1.7); sh.text(sx - 80 + 20 * 4, sy - 11, '5 m', 1.7)

    # two sections along the ship, through the rooms on each side, looking to port (bow to the right)
    for n, (xs, title) in enumerate(((1.7, 'AT 1.7 TO PORT: EG room, crew cabin, deckhand\'s cabin, mess, chief engineer\'s cabin'),
                                       (-1.7, 'AT 1.7 TO STARBOARD: CO2 room, mate\'s cabin, crew WC, galley, master\'s cabin'))):
        lv = D.View('long', 50, (-12.2, 6.4, DECK - 0.5, DECK + 2.9), (230, 500 - n * 88))
        for a, b in C.cut_plane_x(TRIS, xs):
            if -12.2 <= a[0] <= 6.4 and -12.2 <= b[0] <= 6.4 and DECK - 0.5 <= a[1] <= DECK + 2.9 and DECK - 0.5 <= b[1] <= DECK + 2.9:
                sh.line(lv(*a), lv(*b), 'CUT')
        sh.text(lv.o[0], lv(0, DECK + 2.9)[1] + 2, 'SECTION ' + title + ' · looking to port · SCALE 1:50', 2.2, bold=True)
        sh.line(lv(-12.2, DECK), lv(6.4, DECK), 'DIM')
        sh.line(lv(-12.2, DECK + 2.4), lv(6.4, DECK + 2.4), 'DIM')
        sh.text(lv(6.4, DECK)[0] + 1.5, lv(6.4, DECK)[1] - 0.8, 'deck 11.0 above the keel', 1.6, 'DIM')
        sh.text(lv(6.4, DECK + 2.4)[0] + 1.5, lv(6.4, DECK + 2.4)[1] - 0.8, 'deckhead 13.4', 1.6, 'DIM')
        for yd in range(6, 24, 2):
            p = lv(yd - YARD, DECK - 0.5)
            sh.line(p, (p[0], p[1] - 1.5), 'DIM')
            sh.text(p[0], p[1] - 4.0, f'{yd}', 1.5, 'DIM', 'c')
        sh.text(lv.o[0] + 160, lv.o[1] - 8, 'yards from the transom', 1.5, 'DIM', 'c')

    # the legend of the tags drawn on the plan
    x0, y0 = 215, 318
    sh.text(x0, y0 + 2, 'EQUIPMENT ON THE PLAN (register B001–B116; tag = the Town\'s KKS where it gave one)', 2.6, bold=True)
    col, y = 0, y0
    for lab, p, r in items:
        txt = f"{lab}  {r['item'][:40]}" + (f"  · {r['tag']}" if r['tag'] else '')
        if y < 78:
            col += 1
            y = y0
        sh.text(x0 + col * 205, y - 3.6, txt, 1.6)
        y -= 3.5
    # findings on this sheet
    fx, fy = 640, 318
    sh.text(fx, fy + 2, 'FINDINGS WITH A PLACE ON THIS PLAN (CHR-B5 has all)', 2.4, bold=True)
    y = fy
    for f in FINDINGS:
        if f['sheet'] == 'B1':
            y = sh.wrapped(fx, y - 2, f"{f['id']} [{f['kind']}] {f['title']}", 190, 1.8, 'FIND')
    sh.save(os.path.join(OUT, 'CHR-B1-bridge-deck-ga'))


def rays(sh, view, origin, bearings, length, layer='SIGHT'):
    """Rays from `origin` (x, z) at bearings (degrees from dead ahead, + to starboard), `length` metres long."""
    for b in bearings:
        r = math.radians(b)
        q = (origin[0] - math.sin(r) * length, origin[1] + math.cos(r) * length)
        sh.line(view(*origin), view(*q), layer)


def b2():
    sh = D.Sheet('B2', 'WHEELHOUSE AND WINGS',
                 'What is there, and what the helmsman sees: plan cuts, the view from the wheel, a section', ['1:25'], source=SRC)
    z0, z1 = 1.9, 6.2
    plan = D.View('plan', 25, (-4.5, 4.5, z0, z1), (24, 405))
    sh.text(plan.o[0], plan(0, z1)[1] + 3, 'PLAN · cuts 0.2 (grey), 1.0 (black), 1.3 and 1.55 m (green) above the deck', 3.0, bold=True)
    draw_cut(sh, plan, cut_y(0.2), 'LOW', (-4.5, 4.5, z0, z1))
    draw_cut(sh, plan, cut_y(1.0), 'CUT', (-4.5, 4.5, z0, z1))
    draw_cut(sh, plan, cut_y(1.3), 'EQUIP', (-4.5, 4.5, z0, z1))
    draw_cut(sh, plan, cut_y(1.55), 'EQUIP', (-4.5, 4.5, z0, z1))
    # the wheelhouse's glass, from the Town's panes
    for g in SNAP['glass']:
        sx, sy, sz = g['size']
        px, py, pz = g['pos']
        if pz < 2.0:
            continue
        if sx < 0.1:
            sh.line(plan(px, pz - sz / 2), plan(px, pz + sz / 2), 'GLASS')
        else:
            sh.line(plan(px - sx / 2, pz), plan(px + sx / 2, pz), 'GLASS')
    # the eye, and the arcs seen from it
    eye = (0.0, FD.HELM_YARD - YARD)
    ex, ey = plan(*eye)
    sh.circle((ex, ey), 1.2, 'SIGHT')
    sh.line((ex - 2, ey), (ex + 2, ey), 'SIGHT'); sh.line((ex, ey - 2), (ex, ey + 2), 'SIGHT')
    sh.text(ex + 3, ey - 6, 'EYE · yard 20.9, 1.6 m up', 1.8, 'SIGHT')
    rays(sh, plan, eye, [a for a, b in FD.merged] + [b for a, b in FD.merged], 4.2)
    for a, b in FD.merged:
        for t in (a, b):
            r = math.radians(t)
            q = plan(eye[0] - math.sin(r) * 4.4, eye[1] + math.cos(r) * 4.4)
            sh.text(q[0], q[1], f'{t:+.0f}°', 1.7, 'SIGHT', 'c')
    # equipment tags
    items = [(r['id'][1:], pos(r), r) for r in ROWS if r['room'] in ('wheelhouse', 'wing-p', 'wing-s') and r['status'] in ('built', 'part-built')
             and pos(r) is not None and r['item'] not in ('Forward windows (five panes) and side windows', 'Overhead lights (two)', 'Window wipers (three pantograph)')]
    for lab, anchor, bal in place_balloons([(l, p) for l, p, _ in items], 2.2, plan, sh):
        sh.line(anchor, bal, 'TAG')
        sh.circle(anchor, 0.3, 'TAG')
        sh.circle(bal, 2.2, 'TAG')
        sh.text(bal[0], bal[1], lab, 1.6, 'TAG', 'm')
    # the doors and the wings
    for g in C.wall_gaps(cut_y(1.0), 'x', 3.0, 1.9, 5.75):
        sh.tick_dim(plan(3.0, g[0]), plan(3.0, g[1]), f'{g[1] - g[0]:.2f}', off=-4.5)
    for g in C.wall_gaps(cut_y(1.0), 'x', -3.0, 1.9, 5.75):
        sh.tick_dim(plan(-3.0, g[0]), plan(-3.0, g[1]), f'{g[1] - g[0]:.2f}', off=4.5)
    sh.tick_dim(plan(3, 2.25), plan(-3, 2.25), '6.00', off=-11)
    sh.tick_dim(plan(3, 2.25), plan(3, 5.75), '3.50', off=-14)
    sh.tick_dim(plan(2.75, 5.45), plan(-2.75, 5.45), '5.50 console', off=-1)
    for sx in (3.55, -3.55):
        a, b = plan(sx + 0.3, 21.9 - YARD), plan(sx - 0.3, 22.5 - YARD)
        sh.rect(a[0], a[1], b[0], b[1], 'MISSING')
        sh.text((a[0] + b[0]) / 2, a[1] - 4, 'wing console: designed, not built', 1.5, 'FIND', 'c')
    sh.text(plan(4.45, 2.1)[0], plan(4.45, 2.1)[1], 'PORT WING', 2.0, 'TEXT', 'l')
    sh.text(plan(-2.6, 2.1)[0] + 10, plan(-2.6, 2.1)[1], 'STARBOARD WING', 2.0, 'TEXT', 'l')
    for f in FINDINGS:
        w = f['where']
        if not w or f['sheet'] != 'B2':
            continue
        p = plan(w['x'], w['yard'] - YARD)
        sh.rect(p[0] - 2.4 + 6, p[1] - 2.4 + 6, p[0] + 2.4 + 6, p[1] + 2.4 + 6, 'FIND')
        sh.line((p[0], p[1]), (p[0] + 6, p[1] + 6), 'FIND')
        sh.text(p[0] + 6, p[1] + 6, f['id'][3:], 1.6, 'FIND', 'm')

    # ---- the view forward from the wheel: the console wall, its glass and what stands on the console
    ev = D.View('cross', 25, (-4.5, 4.5, DECK - 0.3, DECK + 2.7), (24, 235))
    sh.text(ev.o[0], ev(0, DECK + 2.7)[1] + 3, 'FROM THE WHEEL, LOOKING FORWARD · what stands between the eye and the sea', 3.0, bold=True)
    h = lambda v: DECK + v
    sh.line(ev(-4.5, h(0)), ev(4.5, h(0)), 'DIM')
    sh.line(ev(-4.5, h(2.4)), ev(4.5, h(2.4)), 'DIM')
    sh.text(ev(4.5, h(0))[0] + 1.5, ev(4.5, h(0))[1] - 0.8, 'deck', 1.6, 'DIM')
    # every piece forward of the eye (z beyond the wheel), as its outline
    for p in SNAP['pieces']:
        if p['space'] != 'wheelhouse' and p['space'] not in ('wing-p', 'wing-s'):
            continue
        if p['hi'][2] < FD.HELM_YARD - YARD + 0.3:
            continue
        x0, x1, y0, y1 = p['lo'][0], p['hi'][0], p['lo'][1], p['hi'][1]
        wallc = p['hex'] == 0xeeeae0
        sh.rect(*ev(x1, y0), *ev(x0, y1), 'LOW' if wallc else 'FURN')
    for g in SNAP['glass']:
        sx, sy, sz = g['size']
        px, py, pz = g['pos']
        if sx > 0.1 and pz > 5:
            sh.rect(*ev(px + sx / 2, py - sy / 2), *ev(px - sx / 2, py + sy / 2), 'GLASS')
    # the kit on the console, from the register's sizes (x, h, size x/h)
    for r in ROWS:
        if r['room'] != 'wheelhouse' or r['status'] != 'built' or not r['size'] or r['source'] not in ('ferry-bridge.js', 'ferry-bridge-lantern.js') and 'wiper' not in r['item']:
            continue
        sx, sy, sz = r['size']
        cx, ch = r['x'], r['h']
        if r['item'].startswith('Helm wheel'):
            sh.circle(ev(cx, h(ch)), 0.29 * ev.k, 'EQUIP')
            sh.circle(ev(cx, h(ch)), 0.055 * ev.k, 'EQUIP')
            continue
        if 'Window wipers' in r['item']:
            continue
        sh.rect(*ev(cx + sx / 2, h(ch - sz / 2)), *ev(cx - sx / 2, h(ch + sz / 2)), 'EQUIP')
    # the compass housing
    sh.rect(*ev(0.08, h(1.50)), *ev(-0.08, h(1.62)), 'FIND')
    # the eye and the level it sees at
    eyep = ev(0, h(1.6))
    sh.line((ev(-4.5, h(1.6))[0], eyep[1]), (ev(4.5, h(1.6))[0], eyep[1]), 'SIGHT')
    sh.circle(eyep, 1.2, 'SIGHT')
    sh.text(ev(4.5, h(1.6))[0] + 1.5, eyep[1] - 0.8, 'eye 1.6 m', 1.6, 'SIGHT')
    sh.text(ev.o[0], ev.o[1] - 8, 'The red box is the compass card and its housing: at 1.50–1.62 m it stands level with the eye, dead ahead.', 1.9, 'FIND')

    # ---- along the ship at the wheel: the line of sight over the console, the sea and what it hides
    lv = D.View('long', 25, (z0, z1, DECK - 0.3, DECK + 2.7), (450, 235))
    sh.text(lv.o[0], lv(0, DECK + 2.7)[1] + 3, 'ON THE CENTRELINE · looking to port', 3.0, bold=True)
    for a, b in C.cut_plane_x(TRIS, 0.02):
        if z0 <= a[0] <= z1 and z0 <= b[0] <= z1 and DECK - 0.3 <= a[1] <= DECK + 2.7 and DECK - 0.3 <= b[1] <= DECK + 2.7:
            sh.line(lv(*a), lv(*b), 'CUT')
    ez = FD.HELM_YARD - YARD
    ep = lv(ez, DECK + 1.6)
    sh.circle(ep, 1.2, 'SIGHT')
    for name, yd, top, col in (('compass card', 21.6, 1.62, 'FIND'), ('radar hood', 22.3, 1.52, 'SIGHT'), ('console', 22.92, 1.03, 'SIGHT')):
        q = lv(yd - YARD, DECK + top)
        dx, dy = q[0] - ep[0], q[1] - ep[1]
        L = math.hypot(dx, dy)
        sh.line(ep, (ep[0] + dx / L * 72, ep[1] + dy / L * 72), col)
        sh.text(ep[0] + dx / L * 73, ep[1] + dy / L * 73, name, 1.5, col)
    sh.text(lv.o[0], lv.o[1] - 8, 'Over the console top the sea is seen from 38 m ahead of the eye (24 m beyond the bow); the compass housing', 1.7, 'TEXT')
    sh.text(lv.o[0], lv.o[1] - 11.5, 'is at the eye\'s own level, so the sea within 75 m is hidden in a 13° arc right ahead.', 1.7, 'TEXT')

    # ---- the findings on this sheet
    fx, fy = 440, 150
    sh.text(fx - 25, fy + 6, 'FINDINGS SHOWN ON THIS SHEET', 2.4, bold=True)
    y = fy + 2
    for f in FINDINGS:
        if f['sheet'] == 'B2':
            y = sh.wrapped(fx - 25, y - 1, f"{f['id']} [{f['kind']}] {f['title']}", 190, 1.8, 'FIND')
    # the legend of the tags
    x0, y0 = 24, 120
    sh.text(x0, y0 + 4, 'EQUIPMENT TAGS ON THE PLAN', 2.4, bold=True)
    col, y = 0, y0
    for lab, p, r in items:
        txt = f"{lab}  {r['item'][:50]}" + (f"  · {r['tag']}" if r['tag'] else '')
        if y < 28:
            col += 1
            y = y0
        sh.text(x0 + col * 112, y - 3.5, txt, 1.55)
        y -= 3.4
    sh.save(os.path.join(OUT, 'CHR-B2-wheelhouse'))


STATUS_LAYER = {'built': 'TEXT', 'part-built': 'TEXT', 'data only': 'DIM', 'designed': 'SIGHT', 'required': 'FIND'}


def b3():
    sh = D.Sheet('B3', 'EQUIPMENT AND MACHINERY REGISTER', 'Every item on the bridge deck, its wheelhouse and wings, with what it connects to',
                 ['schedule'], source=SRC)
    sh.text(24, 566, f'{len(ROWS)} items · black: drawn in the model · blue: in the Town\'s data, not drawn · orange: in the design words, not drawn · red: needed, in neither (my inference)', 2.4, bold=True)
    per = 58
    for n, r in enumerate(ROWS):
        col, i = divmod(n, per)
        x = 24 + col * 405
        y = 556 - i * 6.55
        L = STATUS_LAYER[r['status']]
        pos_s = '' if r['yard'] is None else f"yd {r['yard']:.1f} x {r['x']:+.1f} h {r['h']:.1f}"
        sh.text(x, y - 2.4, r['id'], 1.8, L, bold=True)
        sh.text(x + 10, y - 2.4, r['room'], 1.7, L)
        sh.text(x + 33, y - 2.4, r['item'][:52], 1.8, L, bold=True)
        sh.text(x + 103, y - 2.4, r['status'], 1.7, L)
        sh.text(x + 120, y - 2.4, r['tag'][:26], 1.7, L)
        sh.text(x + 160, y - 2.4, pos_s, 1.6, L)
        need = ('→ ' + r['connect']) if r['connect'] else ('· ' + r['note'] if r['note'] else '')
        sh.text(x + 33, y - 5.2, need[:230], 1.35, 'THIN')
    sh.save(os.path.join(OUT, 'CHR-B3-register'))


def box(sh, x, y, w, h, text, layer='CUT', size=1.7, bold=False):
    sh.rect(x, y, x + w, y + h, layer)
    sh.text(x + 1.5, y + h / 2, text, size, layer if layer in ('MISSING', 'FIND') else 'TEXT', bold=bold)
    sh.msp[-1].dxf.insert = (x + 1.5, y + h / 2 - size * 0.35)


def b4():
    sh = D.Sheet('B4', 'WIRING AND PLUMBING FOUNDATION', 'What the Town\'s tables give the bridge deck, and what they do not (dashed red)',
                 ['schematic'], source=SRC)
    feeders = {f['id']: f for f in SNAP['feeders']}
    # ------------------------------------------------------------------ electrical
    sh.text(24, 566, 'ELECTRICAL · feeders to the bridge deck and the compass deck (FERRY_FEEDERS) · cable numbers from the Town', 2.6, bold=True)
    groups = (('MSB', '10BRA10 GS001', 'Main switchboard · 440 V 3~', ['range', 'water-heater', 'chargersA', 'chargersB']),
              ('LB', '10BRB10 GS001', 'Lighting board · 105 V', ['light-crew', 'searchlight', 'bridge-electronics', 'room-acA', 'room-acB', 'galley-appliances']),
              ('ESB', '10BRV10 GS001', 'Emergency switchboard · 440/105 V (in the EG room)', ['emergency-light', 'nav-lights', 'emergency-radar', 'emergency-charger']))
    y = 556
    P = 8.6
    for bid, btag, bname, ids in groups:
        top = y
        h = len(ids) * P
        sh.rect(24, y - h, 78, y, 'WALL')
        sh.text(26, y - 4, bid, 3.2, bold=True)
        sh.text(26, y - 8.6, btag, 1.5)
        sh.wrapped(26, y - 9.2, bname, 50, 1.45)
        for i, fid in enumerate(ids):
            f = feeders[fid]
            yy = y - i * P - P / 2
            sh.line((78, yy), (112, yy), 'POWER')
            sh.rect(112, yy - 3.2, 405, yy + 3.2, 'THIN')
            sh.text(114, yy + 0.4, f"{f['tag']} · {f['name'][:36]} · {f['where']}", 1.7, bold=True)
            sh.text(114, yy - 2.6, f"{f['kW']} kW {f['amps']} A · {f['volts']} V · {f['starter']} {f['breaker']} A · {f['cable']} · {f['length']} m · {f['drop']} % · cable {f['number']}", 1.45)
        y -= h + 5
    sh.text(24, y - 1, 'NOT IN THE TABLES (this register\'s needs, B-numbers)', 2.2, bold=True, layer='FIND')
    y -= 6
    missing = [('DC', '24 V DC distribution: no feeder at all (59 of 59 are AC)', 'VHF/DSC B093 · NAVTEX B095 · GPS B096 · alarm panel B090/B097 · chart and compass lamps · EG starter B001'),
               ('WH', 'Wheelhouse distribution panel, a fused way per instrument', 'B073–B092, B093–B102 hang on one 0.75 kW feeder, 4.4 % drop'),
               ('CSA', 'Fire detection loops, call points, general alarm, PA', 'B022, B027, B032, B037, B042, B090, B097: key CSA exists, no feeder uses it'),
               ('LTG', 'Lighting and socket circuits per room (cabins, WC, mess, galley, wheelhouse, wings, EG, CO₂)', 'one 0.42 kW "light-crew" for bridge, mess, galley and cabins: no per-room circuit, no sockets'),
               ('MOT', 'Wiper motors ×3, hood fan, toilet fan, EG louvre flaps', 'B086, B062, B052, B008'),
               ('CTL', 'Steering, engine and thruster control cables (4501–5999) from the stand and the wing consoles', 'B073–B079, B107, B109'),
               ('NAV', 'Sidelight and wing circuits; ramp lamp board; searchlight handle', 'B098, B100, B108, B110')]
    for k, a, b in missing:
        sh.rect(24, y - 9, 405, y, 'MISSING')
        sh.text(26, y - 4, k, 2.4, 'FIND', bold=True)
        sh.text(40, y - 3.4, a[:110], 1.8, 'FIND', bold=True)
        sh.text(40, y - 7.2, b[:170], 1.45, 'FIND')
        y -= 10.5
    # ------------------------------------------------------------------ plumbing and fire
    X = 440
    sh.text(X, 566, 'PLUMBING AND FIRE · pipe lines that serve the bridge deck (FERRY_PIPING) · DN in mm', 2.6, bold=True)
    issues = {i['line'].split('#')[0]: i for i in SNAP['routeIssues']}
    def pipe_row(y, src, dst, system, dn, note=None, layer='WATER'):
        key = f"{system}/{src}>{dst}"
        sh.rect(X, y - 3.2, X + 62, y + 3.2, 'THIN')
        sh.text(X + 1.5, y - 0.6, SNAME.get(src, src), 1.55)
        sh.line((X + 62, y), (X + 135, y), layer)
        sh.text(X + 66, y + 1.3, f"DN{dn}" + (f" · {note}" if note else ''), 1.4, 'DIM')
        sh.rect(X + 135, y - 3.2, X + 255, y + 3.2, 'THIN')
        sh.text(X + 136.5, y - 0.6, SNAME.get(dst, dst), 1.55)
        if key in issues:
            sh.text(X + 258, y - 0.6, 'not routed: ' + issues[key]['reason'] + (f" ({', '.join(issues[key]['missing'])})" if issues[key]['missing'] else ''), 1.4, 'FIND')
    SNAME = {'ptank': 'Pressure tank (drinking water)', 'galley': '10GKB20 BR001 galley sink, kiosk hot water', 'toilets': '10GKB20 BR002 "toilets": basins, crew WC, shower',
             'heater': '10GKB20 AC001 water heater 100 L / 3 kW', 'main': 'Fire main', 'hBridge': '10SGA30 AA518 hydrant, port wing',
             'co2b': '10SGJ10 BB001 CO₂ bottles 4 × 45 kg', 'co2rel': '10SGJ10 CH001 release cabinet', 'co2v': '10SGJ10 AA201 main valve', 'co2n': 'nozzles, engine room',
             'co2al': 'CO₂ alarm and fan stop (engine room)', 'sp1': 'Sanitary pump 1', 'sp2': 'Sanitary pump 2', 'flush': '10GHB10 BR001 flush: WCs, urinals, crew WC', 'htank': 'Sewage holding tank'}
    y = 556
    for title, rows in (('FRESH WATER', [('ptank', 'galley', 'freshwater', 20, None, 'WATER'), ('ptank', 'toilets', 'freshwater', 20, None, 'WATER'),
                                         ('ptank', 'heater', 'freshwater', 15, None, 'WATER'), ('heater', 'galley', 'freshwater', 15, 'hot', 'FIRE'),
                                         ('heater', 'toilets', 'freshwater', 15, 'hot', 'FIRE')]),
                        ('FIRE', [('main', 'hBridge', 'fire', 50, None, 'FIRE'), ('co2b', 'co2v', 'fire', 40, None, 'FIRE'), ('co2rel', 'co2v', 'fire', 25, 'pilot', 'CTRL'),
                                  ('co2v', 'co2n', 'fire', 40, None, 'FIRE'), ('co2b', 'co2rel', 'fire', 0, 'wire', 'CTRL'), ('co2rel', 'co2al', 'fire', 0, 'electric: alarm, fans stop', 'CTRL')]),
                        ('FLUSH AND SOIL', [('sp1', 'flush', 'sewage', 32, None, 'WASTE'), ('sp2', 'flush', 'sewage', 32, None, 'WASTE'), ('flush', 'htank', 'sewage', 100, 'gravity', 'WASTE')])):
        sh.text(X, y - 4, title, 2.2, bold=True)
        y -= 7
        for src, dst, system, dn, note, layer in rows:
            pipe_row(y - 3.5, src, dst, system, dn, note, layer)
            y -= 8
        y -= 3
    sh.text(X, y - 1, 'NOT IN THE TABLES (the register\'s needs)', 2.2, bold=True, layer='FIND')
    y -= 6
    for k, a, b in (('GREY', 'Grey-water collection: galley sink, basin, shower, fridge defrost, AC condensate, hood', 'B050, B051, B059, B063, B064: nowhere to go; traps at each fitting'),
                    ('CREW', 'Crew WC and shower as nodes in crew-wc: hot, cold, flush, soil, extract', 'B049–B052: today they are "toilets" two decks down'),
                    ('FUEL', 'EG day tank fill, return, overflow, vent; exhaust; louvre flaps', 'B001, B007–B009: no node in the fuel system'),
                    ('FIRE', 'A second hydrant and hose at the aft platform (the one hose reaches 15 m; EG and CO₂ rooms are 20 m)', next(f['id'] for f in FINDINGS if 'hydrant' in f['title'])),
                    ('SHAFT', 'The route itself: no pipe is drawn on this deck (0 of 14 lines)', 'resolve 11 unresolved lines through the casing trunk')):
        sh.rect(X, y - 9, X + 380, y, 'MISSING')
        sh.text(X + 2, y - 4, k, 2.0, 'FIND', bold=True)
        sh.text(X + 18, y - 3.4, a[:105], 1.8, 'FIND', bold=True)
        sh.text(X + 18, y - 7.2, b[:120], 1.45, 'FIND')
        y -= 10.5
    sh.save(os.path.join(OUT, 'CHR-B4-wiring-and-plumbing'))


def b5():
    sh = D.Sheet('B5', 'FINDINGS', f'{len(FINDINGS)} problems found by drawing the bridge, each with where it comes from and what to do',
                 ['text'], source=SRC)
    kinds = {}
    for f in FINDINGS:
        kinds[f['kind']] = kinds.get(f['kind'], 0) + 1
    sh.text(24, 566, '  ·  '.join(f'{n} {k}' for k, n in kinds.items()) + '  ·  error: the model contradicts itself or its data · gap: asked for, not drawn or not specified · risk: it works, a real ship would not have it so', 2.2, bold=True)
    colw = 240
    x = [24, 24 + 270, 24 + 540]
    y = [556, 556, 556]
    per = math.ceil(len(FINDINGS) / 3)
    for n, f in enumerate(FINDINGS):
        col = n // per
        layer = {'error': 'FIND', 'gap': 'DIM', 'risk': 'SIGHT'}[f['kind']]
        yy = y[col]
        sh.text(x[col], yy - 3.4, f"{f['id']}  [{f['kind']}]", 2.8, layer, bold=True)
        yy = sh.wrapped(x[col], yy - 5.4, f['title'], colw, 2.6, layer, bold=True)
        yy = sh.wrapped(x[col], yy - 0.6, f['what'], colw, 2.0, 'TEXT')
        yy = sh.wrapped(x[col], yy - 0.8, 'Where from: ' + f['source'] + (f"  ·  drawn on CHR-{f['sheet']}" if f['sheet'] else ''), colw, 1.6, 'THIN')
        yy = sh.wrapped(x[col], yy - 0.8, 'To do: ' + f['fix'], colw, 1.9, 'DIM')
        y[col] = yy - 6
    sh.save(os.path.join(OUT, 'CHR-B5-findings'))


def b6():
    import design_basis as DB
    merged, seen = DB.view_after(FD)
    sh = D.Sheet('B6', 'A REALISTIC WHEELHOUSE · design basis',
                 'Every item of the design words placed, the view made whole; the envelope is the one she has', ['1:25'], source=SRC)
    z0, z1 = 1.9, 6.2
    plan = D.View('plan', 25, (-4.5, 4.5, z0, z1), (24, 395))
    sh.text(plan.o[0], plan(0, z1)[1] + 3, 'PLAN · what she has (grey) and what it becomes (magenta), numbered as the table', 3.0, bold=True)
    draw_cut(sh, plan, cut_y(1.0), 'LOW', (-4.5, 4.5, z0, z1))
    for n, (name, x, y0, y1) in enumerate(DB.GLASS_NEW):
        sh.line(plan(x, y0 - YARD), plan(x, y1 - YARD), 'GLASS')
        sh.line(plan(x + (0.05 if x > 0 else -0.05), y0 - YARD), plan(x + (0.05 if x > 0 else -0.05), y1 - YARD), 'GLASS')
    for g in SNAP['glass']:
        sx, sy, sz = g['size']
        px, py, pz = g['pos']
        if pz >= 2.0 and (sx < 0.1 and abs(px) > 2.9 or sx >= 0.1 and pz > 5):
            if sx < 0.1:
                sh.line(plan(px, pz - sz / 2), plan(px, pz + sz / 2), 'GLASS')
            else:
                sh.line(plan(px - sx / 2, pz), plan(px + sx / 2, pz), 'GLASS')
    items = []
    for n, (rid, name, x, yard, h, sz, why, change) in enumerate(DB.ITEMS, 1):
        a, b = plan(x + sz[0] / 2, yard - YARD - sz[1] / 2), plan(x - sz[0] / 2, yard - YARD + sz[1] / 2)
        sh.rect(a[0], a[1], b[0], b[1], 'NEW')
        items.append((str(n), (x, yard - YARD)))
    for lab, anchor, bal in place_balloons(items, 2.0, plan, sh):
        sh.line(anchor, bal, 'NEW')
        sh.circle(bal, 2.0, 'NEW')
        sh.text(bal[0], bal[1], lab, 1.5, 'NEW', 'm')
    eye = (0.0, FD.HELM_YARD - YARD)
    ex, ey = plan(*eye)
    sh.circle((ex, ey), 1.2, 'SIGHT')
    rays(sh, plan, eye, [a for a, b in merged] + [b for a, b in merged], 4.4)
    for a, b in merged:
        for t in (a, b):
            r = math.radians(t)
            q = plan(eye[0] - math.sin(r) * 4.7, eye[1] + math.cos(r) * 4.7)
            sh.text(q[0], q[1], f'{t:+.0f}°', 1.7, 'SIGHT', 'c')
    sh.text(ex + 3, ey - 6, f'EYE · with the new glass: {seen:.0f}° of the 225°', 1.8, 'SIGHT')
    # the table
    x0, y0 = 24, 380
    sh.text(x0, y0 + 4, 'ITEMS · register id · item · position (x to port, yard, height above the deck) · what changes', 2.4, bold=True)
    col, y = 0, y0
    for n, (rid, name, x, yard, h, sz, why, change) in enumerate(DB.ITEMS, 1):
        if n == 17:
            col += 1
            y = y0
        sh.text(x0 + col * 212, y - 3.2, f'{n:>2}  {rid}  {name[:46]}', 1.7, bold=True)
        sh.text(x0 + col * 212 + 4, y - 6.2, f'x {x:+.2f}  yd {yard:.2f}  h {h:.2f}  ·  {change[:70]}', 1.4, 'NEW')
        y -= 7.0
    # the same wall seen from the wheel, with the items by height
    ev = D.View('cross', 25, (-4.5, 4.5, DECK - 0.3, DECK + 2.7), (24, 120))
    sh.text(ev.o[0], ev(0, DECK + 2.7)[1] + 3, 'FROM THE WHEEL, LOOKING FORWARD · the same items by height', 3.0, bold=True)
    h = lambda v: DECK + v
    sh.line(ev(-4.5, h(0)), ev(4.5, h(0)), 'DIM')
    sh.line(ev(-4.5, h(2.4)), ev(4.5, h(2.4)), 'DIM')
    sh.line(ev(-4.5, h(1.0)), ev(4.5, h(1.0)), 'DIM')
    sh.text(ev(4.5, h(1.0))[0] + 1.5, ev(4.5, h(1.0))[1] - 0.8, 'console top 1.0', 1.6, 'DIM')
    sh.text(ev(4.5, h(2.4))[0] + 1.5, ev(4.5, h(2.4))[1] - 0.8, 'deckhead 2.4', 1.6, 'DIM')
    for g in SNAP['glass']:
        sx, sy, sz = g['size']
        px, py, pz = g['pos']
        if sx > 0.1 and pz > 5:
            sh.rect(*ev(px + sx / 2, py - sy / 2), *ev(px - sx / 2, py + sy / 2), 'GLASS')
    for n, (rid, name, x, yard, hh, sz, why, change) in enumerate(DB.ITEMS, 1):
        if yard < 21.0:
            continue
        if name.startswith('Helm wheel'):
            sh.circle(ev(x, h(hh + 0.29)), 0.29 * ev.k, 'NEW')
        else:
            a, b = ev(x + sz[0] / 2, h(hh)), ev(x - sz[0] / 2, h(hh + sz[2]))
            sh.rect(a[0], a[1], b[0], b[1], 'NEW')
        c = ev(x, h(hh + sz[2] / 2))
        sh.text(c[0], c[1], str(n), 1.5, 'NEW', 'm')
    eyep = ev(0, h(1.6))
    sh.line((ev(-4.5, h(1.6))[0], eyep[1]), (ev(4.5, h(1.6))[0], eyep[1]), 'SIGHT')
    sh.text(ev(4.5, h(1.6))[0] + 1.5, eyep[1] - 0.8, 'eye 1.6 m', 1.6, 'SIGHT')
    sh.text(ev.o[0], ev.o[1] - 8, 'Nothing stands at the eye\'s level in the 20° right ahead; the highest thing on the console is the radar, at 1.33 m.', 1.9, 'DIM')
    # what the Ranger III shows and what follows
    rx = 450
    ry = 560
    sh.text(rx, ry, 'WHAT THE RANGER III PILOT HOUSE SHOWS (HAER MI-432 sheet 4, read at 75 px/ft, ±0.2 m)', 2.4, bold=True)
    notes = [
        ('Her pilot house is 5.9 m wide and 4.8 m deep: the Christina\'s is 6.0 m by 3.5 m, the same width; a rounded glazed front buys the depth.', 'TEXT'),
        ('Chart table 1.07 × 1.54 m, aft against the bulkhead (Christina: 0.95 × 0.60): kept, a half-fold chart fits.', 'TEXT'),
        ('Steering stand 0.63 × 0.95 m on the centreline with a seat beside it (Christina: 0.50 × 0.95): widened.', 'TEXT'),
        ('The master engine controls are ahead of the stand to port, the radar forward to starboard, the compass ahead of the stand: here the engine and thruster levers sit beside the stand, the radar to starboard, the compass overhead.', 'TEXT'),
        ('A door to each wing, three steps up from the wing: the wing doors here are real, hinged, with a sill.', 'TEXT'),
        ('The master\'s sea cabin is directly aft with its own stair; the Christina\'s master\'s cabin is on the corridor 3 m aft, a door apart: nothing to change.', 'TEXT'),
        (f'Rake: the forward glass leans out 10° at the top (head at yard {DB.rake_head()}; the compass deck\'s slab edge is 23.16, so lengthen it 0.01–0.10 m), against glare from the console at night. A guide value, recalled, not checked.', 'DIM'),
        (f'View: with the two wing doors glazed in their upper halves and the starboard wall panel glazed, the arcs from the helm join into {merged[0][0]:+.0f}° to {merged[-1][1]:+.0f}°: {seen:.0f}° of the 225° the navigation-bridge guide asks for.', 'DIM'),
        ('Nothing at eye level in the 20° right ahead: the heading readout is low in the stand, the compass is read overhead; the console\'s displays top at 1.33 m, which hides the sea only out to 50 m from the eye in a 20° arc to either side.', 'DIM'),
        ('Every item has its own supply (CHR-B4): the 24 V radio/emergency distribution feeds the VHF, telephone, alarm and lamps; a wheelhouse panel carries a fused way for each instrument.', 'DIM'),
    ]
    y = ry - 2
    for t, layer in notes:
        y = sh.wrapped(rx, y - 1.2, '· ' + t, 365, 1.8, layer)
    sh.save(os.path.join(OUT, 'CHR-B6-realistic-wheelhouse'))


if __name__ == '__main__':
    want = sys.argv[1:] or ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']
    for k in want:
        globals()[k.lower()]()
        print('wrote', k)
