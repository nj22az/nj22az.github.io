#!/usr/bin/env python3
"""
Nothing runs through the air: every pipe, cable, conduit and wire of hers is carried.

    python3 ferry/blender/spans.py --part chisum.npz [--list]

The owner, 11 November 2026, of the emergency generator room as first built: "There looks like too much floating objects in
the emergency generator room why aren't you working according to Spec?" They were right. afloat.py asks only that a thing
touch something somewhere; a cable standing 1.4 m up from an alternator to a tray touches at both ends and passed, and so
did pipes run 0.3 m off a wall with no bracket. A ship's pipe is clamped, her cable lies in a tray or a ladder or is
cleated, and this check asks for that.

What it looks at: every run a builder lays with a line of points (shipyard.RUNS, written with the part file: its centre
line and its radius), and besides those any long thin piece of a part whose name says it is pipes, cables, conduit or
wire. Every 5 cm along the middle of a run it asks whether something that could carry it is there: any piece of another
part within a centimetre of its surface (a clamp, a tray, a deck, a wall, the machine it is joined to). A part does not
carry itself. Then, measured along the run, no two carried places may be further apart than its span, and each end must be
carried within half of it:

    cables            0.6 m (a free loop to a machine on mounts may be that long, no longer)
    wire              0.7 m (the stiffeners it is led through are 0.65 m apart)
    pipes, conduit    1.5 m

The spans are the yard's (JSY-STD-402); the rule texts behind them are not read.
"""
import argparse
import os
import sys
from collections import defaultdict
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import afloat as F
import assemble as A

KINDS = (('pull wire', 0.7), ('cables', 0.6), ('conduit', 1.5), ('pipes', 1.5))
STEP, NEAR, JOIN = 0.05, 0.010, 0.012
HALF = 17.25


def kind_of(name):
    tail = name.split(', ', 1)[-1] if ', ' in name else name
    for word, span in KINDS:
        if word in tail.split(', ')[-1] or tail.startswith(word) or f', {word}' in name:
            return word, span
    return None


def distance(point, tri):
    """From a point to each of some triangles (n, 3, 3)."""
    a, b, c = tri[:, 0], tri[:, 1], tri[:, 2]
    ab, ac, ap = b - a, c - a, point - a
    d1, d2 = (ab * ap).sum(1), (ac * ap).sum(1)
    bp = point - b
    d3, d4 = (ab * bp).sum(1), (ac * bp).sum(1)
    cp = point - c
    d5, d6 = (ab * cp).sum(1), (ac * cp).sum(1)
    va, vb, vc = d3 * d6 - d5 * d4, d5 * d2 - d1 * d6, d1 * d4 - d3 * d2
    out = np.empty((len(tri), 3))
    done = np.zeros(len(tri), dtype=bool)

    def put(mask, value):
        m = mask & ~done
        out[m] = value[m]
        done[m] = True

    put((d1 <= 0) & (d2 <= 0), a)
    put((d3 >= 0) & (d4 <= d3), b)
    put((d6 >= 0) & (d5 <= d6), c)
    with np.errstate(divide='ignore', invalid='ignore'):
        put((vc <= 0) & (d1 >= 0) & (d3 <= 0), a + ab * (d1 / (d1 - d3))[:, None])
        put((vb <= 0) & (d2 >= 0) & (d6 <= 0), a + ac * (d2 / (d2 - d6))[:, None])
        put((va <= 0) & (d4 - d3 >= 0) & (d5 - d6 >= 0), b + (c - b) * ((d4 - d3) / ((d4 - d3) + (d5 - d6)))[:, None])
        den = va + vb + vc
        put(np.ones(len(tri), dtype=bool), a + ab * (vb / den)[:, None] + ac * (vc / den)[:, None])
    return np.linalg.norm(out - point, axis=1)


def main():
    import json
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--part', action='append', required=True)
    ap.add_argument('--base', default=A.DEFAULT)
    ap.add_argument('--list', action='store_true', help='list every run looked at')
    a = ap.parse_args()
    pieces = F.load(a.part, a.base)
    runs = []
    # ---- the runs the builders recorded: sampled along their centre lines
    recorded = set()
    for path in a.part:
        for r in json.loads(bytes(np.load(path)['meta']).decode()).get('runs', []):
            k = kind_of(r['part'])
            if not k:
                print(f"  a run is recorded in a part whose name does not say what it is: {r['part']}")
                return 1
            pts = np.array(r['points'], dtype=np.float64)
            seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
            total = float(seg.sum())
            n = max(2, int(round(total / STEP)) + 1)
            s_at = np.linspace(0, total, n)
            cum = np.concatenate([[0], np.cumsum(seg)])
            which = np.clip(np.searchsorted(cum, s_at, side='right') - 1, 0, len(seg) - 1)
            f = (s_at - cum[which]) / np.maximum(seg[which], 1e-9)
            samples = pts[which] + (pts[which + 1] - pts[which]) * f[:, None]
            runs.append(dict(name=r['part'], kind=k[0], span=k[1], r=r['r'], pts=samples, s=s_at, length=total))
            recorded.add(r['part'])
    # ---- and the long thin pieces of parts that are pipes, cables, conduit or wire but recorded no run
    for p in pieces:
        k = p['own'] and p['name'] not in recorded and kind_of(p['name'])
        if not k:
            continue
        v = p['tri'].reshape(-1, 3)
        mid = v.mean(0)
        _, _, vt = np.linalg.svd(v - mid, full_matrices=False)
        axis = vt[0]
        along = (v - mid) @ axis
        radius = np.linalg.norm((v - mid) - np.outer(along, axis), axis=1).max()
        length = along.max() - along.min()
        if length < 0.12 or radius > 0.07 or length < 3 * radius:
            continue
        n = max(2, int(round(length / STEP)) + 1)
        s_at = np.linspace(0, length, n)
        runs.append(dict(name=p['name'], kind=k[0], span=k[1], r=radius, pts=mid + axis * along.min() + np.outer(s_at, axis), s=s_at, length=length))
    if not runs:
        print('no pipes, cables, conduit or wire of hers to look at')
        return 0
    # ---- what could carry them: every triangle near them that is not of the same part
    lo = np.min([t['pts'].min(0) for t in runs], axis=0) - 0.2
    hi = np.max([t['pts'].max(0) for t in runs], axis=0) + 0.2
    tris, owner = [], []
    for i, p in enumerate(pieces):
        if (p['hi'] < lo).any() or (p['lo'] > hi).any():
            continue
        tris.append(p['tri'])
        owner.append(np.full(len(p['tri']), i))
    T, owner = np.concatenate(tris), np.concatenate(owner)
    names = np.array([p['name'] for p in pieces], dtype=object)[owner]
    tlo, thi = T.min(1), T.max(1)
    bad = []
    for t in runs:
        reach = t['r'] + NEAR
        other = names != t['name']
        box = other & (thi >= t['pts'].min(0) - reach).all(1) & (tlo <= t['pts'].max(0) + reach).all(1)
        Tb, lob, hib = T[box], tlo[box], thi[box]
        held = np.zeros(len(t['pts']), dtype=bool)
        for j, q in enumerate(t['pts']):
            m = (lob <= q + reach).all(1) & (hib >= q - reach).all(1)
            if m.any() and (distance(q, Tb[m]) <= reach).any():
                held[j] = True
        at = t['s'][held]
        if len(at):
            gaps = np.diff(at)
            k = int(np.argmax(gaps)) if len(gaps) else 0
            worst, where = (float(gaps[k]), (at[k] + at[k + 1]) / 2) if len(gaps) else (0.0, at[0])
            ends = max(float(at[0]), float(t['length'] - at[-1]))
            if 2 * ends > worst:
                worst, where = 2 * ends, (0.0 if at[0] >= t['length'] - at[-1] else t['length'])
        else:
            worst, where = float('inf'), t['length'] / 2
        t['worst'] = worst
        t['where'] = t['pts'][int(np.argmin(np.abs(t['s'] - where)))]
        ok = worst <= t['span'] + 0.06
        if not ok:
            bad.append(t)
        if a.list:
            print(f"  {'    ' if ok else 'NOT '}{t['length']:5.2f} m, at most {worst:.2f} m between supports (allowed {t['span']}): {t['name']}")
    for t in sorted(bad, key=lambda t: -t['worst']):
        x, y, z = t['where']
        far = 'carried nowhere' if not np.isfinite(t['worst']) else f"{t['worst']:.2f} m without a support (allowed {t['span']})"
        print(f"  NOT CARRIED  {t['name']}: a run of {t['length']:.2f} m, at x {x:+.2f}, {z + HALF:.2f} m from the transom, y {y:+.2f}: {far}")
    print(f"{len(runs)} runs of pipe, cable, conduit and wire ({sum(t['length'] for t in runs):.0f} m): " + ('every one is carried' if not bad else f'{len(bad)} run through the air'))
    return 1 if bad else 0


if __name__ == '__main__':
    raise SystemExit(main())
