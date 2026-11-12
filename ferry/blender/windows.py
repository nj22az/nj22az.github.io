#!/usr/bin/env python3
"""
windows.py --part <the part file> [--base <the page's file>]: nothing is built over a window.

The owner, 12 November 2026, with a picture of the gallery under the wheelhouse's new bay, two of whose knees came down
the house's front across two cabin windows of the deck below: "check the quality please you cant cover the windows like
that", "make sure you dont build over a window". The knees had been set at round figures, and nothing looked at the wall
they were welded to. This is the look, made part of the gate (make.sh): it is run on every build, so that the next thing
drawn against a wall is tried against that wall's windows whether or not its builder remembered them.

What it does. Every pane of window glass aboard that stands still (a door's glass moves with its door) is a flat piece of
the look `Window glass`. For each, the space before it and behind it is kept clear: REACH metres either way, over the
pane's own glass less its outermost EDGE (a hole cut in it, for a clear-view screen, is not glass). Every other piece
that comes near is tried by points spread over its surface, 4 cm apart; a piece with points over OVER squares of the
pane or more is named, with how much of the pane it stands over. A point nearer the glass than NEAR is the window's
own frame, gasket or rail, which hold it.

What may stand before a pane is written down here with its reason (ALLOW), by the piece's name and, where the name is
shared with other things, by where the pane is. Anything else stops the build.

What it does not see: a thing farther from the glass than REACH (a rail a pace off is looked through, as a rail is); a
thing that hides a window from where one stands without being near it; glass of another look (the clear-view discs, the
instrument glasses).
"""
import argparse
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import afloat as F  # noqa: E402
import lines as L  # noqa: E402

REACH = 0.30          # the space kept clear before and behind a pane
NEAR = 0.03           # nearer than this is the window's own frame and gasket
STEP = 0.04           # the points tried on a piece's surface are this far apart
SMALL = 0.12          # a pane under this many square metres is not a window (a bottle is drawn in the same glass)
EDGE = 0.05           # a thing over the outermost 5 cm of a pane is beside the window, not over it (a rail at the height of a sill)
OVER = 4              # a piece is named when it stands over this many squares of STEP of a pane, or more

# What may stand before a pane, and why: (the piece's name, where the pane is (a word of its own name, or None), the reason).
ALLOW = [
    (r'^Window wiper', None, 'a wiper lies on the glass it wipes'),
    (r'^Sun blind', None, 'a blind is drawn down before its window'),
    (r'^Wheelhouse, (steel|rubber|equipment cases|black cases|plastics|chrome|brass|lamps and lenses|lit lamps|panel seams)$', 'Wheelhouse, window glass',
     'on the bridge: a blind\'s guide wires, a clear-view screen\'s ring, motor and the tube that carries it, a wiper\'s boss, the wash jets, the table\'s lamp'),
    (r'^Wheelhouse, (console|instruments|panel faces|desk tops|brass|painted fittings)$', 'Wheelhouse, window glass',
     'a wing control station\'s dials stand in an upright face before the wing\'s own glass, and are read against it (JSY-STD-404, rule 13)'),
    (r'^(Port|Starboard) wing, .*lever', 'Wheelhouse, window glass', 'the wing station\'s levers, before the wing\'s glass'),
    (r'^Wheelhouse, light wood$', 'Wheelhouse, window glass', 'the wooden rails and mullions a pane of the bridge sits between'),
    (r'^Wheelhouse, (plating|wing plating|window frames|linings)$', 'Wheelhouse, window glass', 'the posts and frames of the bridge\'s own windows, where two panes meet at a corner'),
]


def panes(pieces):
    """Every still pane of window glass: its plane, and its triangles in that plane."""
    out = []
    for p in pieces:
        if p['look'] != 'Window glass' or p['mover'] or not p['own']:
            continue
        tri = p['tri']
        nrm = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
        area = np.linalg.norm(nrm, axis=1).sum() / 2
        if area < SMALL:
            continue
        n = nrm.sum(0)
        if np.linalg.norm(n) < 1e-9:
            continue
        n = n / np.linalg.norm(n)
        c = tri.reshape(-1, 3).mean(0)
        if np.abs((tri.reshape(-1, 3) - c) @ n).max() > 0.004:
            continue                                         # not flat: not a pane
        u = np.cross(n, [0.0, 1.0, 0.0])
        u = u / np.linalg.norm(u) if np.linalg.norm(u) > 1e-6 else np.array([1.0, 0.0, 0.0])
        v = np.cross(n, u)
        flat = np.stack([(tri - c) @ u, (tri - c) @ v], -1)  # (k, 3, 2)
        out.append(dict(name=p['name'], group=p['group'], n=n, c=c, u=u, v=v, flat=flat, area=area, lo=p['lo'] - REACH, hi=p['hi'] + REACH, piece=p))
    return out


def spread(tri):
    """Points over a piece's triangles, about STEP apart: each triangle's corners, and a grid across it."""
    pts = [tri.reshape(-1, 3)]
    e = np.maximum(np.linalg.norm(tri[:, 1] - tri[:, 0], axis=1), np.linalg.norm(tri[:, 2] - tri[:, 0], axis=1))
    for n in np.unique(np.minimum(np.ceil(e / STEP).astype(int), 60)):
        if n < 2:
            continue
        t = tri[np.minimum(np.ceil(e / STEP).astype(int), 60) == n]
        i, j = np.meshgrid(np.arange(n + 1), np.arange(n + 1), indexing='ij')
        keep = i + j <= n
        a, b = (i[keep] / n)[None, :, None], (j[keep] / n)[None, :, None]
        pts.append((t[:, 0][:, None] * (1 - a - b) + t[:, 1][:, None] * a + t[:, 2][:, None] * b).reshape(-1, 3))
    return np.concatenate(pts)


def over_glass(w, pts):
    """Which of these points stand before or behind this pane's glass, inside the space kept clear."""
    d = (pts - w['c']) @ w['n']
    near = (np.abs(d) > NEAR) & (np.abs(d) < REACH)
    if not near.any():
        return near
    q = np.stack([(pts[near] - w['c']) @ w['u'], (pts[near] - w['c']) @ w['v']], -1)
    a, b, c = w['flat'][:, 0][None], w['flat'][:, 1][None], w['flat'][:, 2][None]
    p = q[:, None, :]
    cross = lambda s, t: s[..., 0] * t[..., 1] - s[..., 1] * t[..., 0]
    inside = np.ones(len(q), bool)
    for du, dv in ((0.0, 0.0), (EDGE, 0.0), (-EDGE, 0.0), (0.0, EDGE), (0.0, -EDGE)):      # in the glass, and EDGE inside its edge every way
        p = (q + np.array([du, dv]))[:, None, :]
        d1, d2, d3 = cross(b - a, p - a), cross(c - b, p - b), cross(a - c, p - c)
        inside &= (((d1 >= 0) & (d2 >= 0) & (d3 >= 0)) | ((d1 <= 0) & (d2 <= 0) & (d3 <= 0))).any(1)
    out = np.zeros(len(pts), bool)
    out[np.nonzero(near)[0][inside]] = True
    return out


def allowed(name, pane):
    for pat, where, why in ALLOW:
        if re.search(pat, name) and (where is None or where in pane):
            return why
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--part', action='append', required=True)
    ap.add_argument('--base', default=os.path.join(HERE, '..', 'data', 'ferry.bin.gz'))
    a = ap.parse_args()
    pieces = F.load(a.part, a.base)
    wins = panes(pieces)
    bad, let = {}, {}
    for w in wins:
        for p in pieces:
            if p is w['piece'] or p['look'] == 'Window glass' or (p['hi'] < w['lo']).any() or (p['lo'] > w['hi']).any():
                continue
            tri = F.near(p, w['lo'], w['hi'])
            if not len(tri):
                continue
            pts = spread(tri)
            hit = over_glass(w, pts)
            if not hit.any():
                continue
            cells = np.unique(np.floor(np.stack([(pts[hit] - w['c']) @ w['u'], (pts[hit] - w['c']) @ w['v']], -1) / STEP).astype(int), axis=0)
            if len(cells) < OVER:
                continue
            covered = min(w['area'], len(cells) * STEP * STEP)             # the squares of the pane it stands over
            why = allowed(p['name'], w['name'])
            key = (p['name'], w['name'], w['group'])
            at = pts[hit].mean(0)
            rec = (let if why else bad).setdefault(key, dict(n=0, area=0.0, at=at, why=why))
            rec['n'] += 1
            rec['area'] = max(rec['area'], covered)
    for (name, pane, group), r in sorted(let.items()):
        print(f"  may     {name}  before  {pane} ({r['n']} panes): {r['why']}")
    for (name, pane, group), r in sorted(bad.items(), key=lambda kv: -kv[1]['area']):
        x, y, z = r['at']
        print(f"  OVER A WINDOW  {group:<9} {name}  stands over  {pane}: {r['n']} panes, up to {r['area']:.2f} m² of one, at x {x:+.2f}, {L.yard(z):.2f} m, y {y:+.2f}")
    print(f'{len(wins)} panes of window glass; {len(let)} kinds of thing stand before one and may; {len(bad)} stand over one and may not')
    if bad:
        print('something is built over a window')
        sys.exit(1)
    print('nothing is built over a window')


if __name__ == '__main__':
    main()
