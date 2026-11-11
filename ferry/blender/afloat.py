"""
Nothing aboard hangs in the air.

    python3 ferry/blender/afloat.py --part chisum.npz [--base ferry/data/ferry.bin.gz] [--all] [--json out.json]

The owner, 11 November 2026, of the steering wheel, which stood on a stub of shaft that ended 4 cm over its stand: "The
wheel is not connected to anything in the wheelhouse fix this every detail in every part of the ship needs to be
realistic". A thing is realistic only if something holds it: this goes through the whole model and finds what nothing
holds.

How. The model is taken apart into pieces (a piece is a connected set of triangles: a box, a bar, a plate). Two pieces
hold each other if they touch: a corner of one lies within 4 mm of the other's surface, an edge of one passes through
the other, or one stands inside the other (a shaft in its bearing). The hull's shell and the largest pieces are the
ground; whatever touches the ground is held, whatever touches that is held, and so on. What is left is afloat: a single
piece, or several that hold only each other, as the wheel, its hub and its stub of shaft did.

It reads her own parts from the part file Blender wrote (where each object still has its name) and the other ship's
from the model. Without --all only her own parts are reported: the other ship's are listed with it, for the sections
still to be rebuilt.
"""
import argparse
import json
import os
import sys
from collections import defaultdict, deque

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import assemble as A  # noqa: E402

TOL = 0.004           # two things closer than this touch
PAINT = 0.008         # paint and pictures are drawn a little proud of the surface they are on (more on the curved shell)
PAINTED = ('Marking', 'Panel face', 'Screen picture')
CELL = 0.25           # the grid the pieces are sorted into
HALF = 17.25          # metres from the transom = z + HALF
# What is drawn on a surface with nothing behind it is not a thing to be held: the base draws its signs, floor markings
# and light pools as loose flat pictures. A piece thinner than this in one direction is such a picture.
FLAT = 0.0005


def pieces_of_soup(tri):
    """The connected pieces of a list of triangles (n, 3, 3): arrays of triangle numbers."""
    flat = np.round(tri.reshape(-1, 3) * 1e4).astype(np.int64)
    _, inv = np.unique(flat, axis=0, return_inverse=True)
    inv = inv.reshape(-1, 3)
    parent = np.arange(inv.max() + 1)

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    for a, b, c in inv:
        ra, rb, rc = find(a), find(b), find(c)
        parent[rb] = ra
        parent[find(rc)] = ra
    root = np.array([find(a) for a in inv[:, 0]])
    order = np.argsort(root, kind='stable')
    cuts = np.nonzero(np.diff(root[order]))[0] + 1
    return np.split(order, cuts)


def load(part_paths, base):
    """Every piece: its triangles, whose it is, the object's name, the viewer's part, whether it moves."""
    out = []
    for path in part_paths:
        z = np.load(path)
        meta = json.loads(bytes(z['meta']).decode())
        for m in meta['meshes']:
            tri = z[m['key'] + '|pos'].astype(np.float64).reshape(-1, 3, 3)
            at = 0
            for ob in m['objects']:
                mine = tri[at:at + ob['triangles']]
                at += ob['triangles']
                for sel in pieces_of_soup(mine):
                    out.append(dict(tri=mine[sel], own=True, name=ob['name'], group=m['group'], mover=m.get('mover') or '', look=m['material']))
    header, block = A.read_jmf(base)
    for g in header['views'][0]['groups']:
        for rec in g['meshes']:
            if rec.get('from') == 'blender':
                continue
            m = A.decode(header, block, rec)
            tri = m['pos'][m['idx']].astype(np.float64)
            col = m['col'][m['idx'][:, 0]]
            for sel in A.pieces_of(m):
                out.append(dict(tri=tri[sel], own=False, name=f"the other ship's, material {rec['material']}, colour {tuple(int(v) for v in col[sel[0]][:3])}",
                                group=g['id'], mover='', look=str(rec['material'])))
    for p in out:
        v = p['tri'].reshape(-1, 3)
        p['lo'], p['hi'] = v.min(0), v.max(0)
        p['tlo'], p['thi'] = p['tri'].min(1), p['tri'].max(1)
    return out


def near(p, lo, hi):
    """The triangles of a piece whose own boxes come within the box lo..hi."""
    keep = ((p['thi'] >= lo) & (p['tlo'] <= hi)).all(1)
    return p['tri'][keep]


def point_triangle(P, T):
    """The distance from each point (m, 3) to each triangle (k, 3, 3): (m, k). After Ericson, Real-Time Collision Detection, 5.1.5."""
    a, b, c = T[:, 0][None], T[:, 1][None], T[:, 2][None]
    p = P[:, None, :]
    ab, ac, ap = b - a, c - a, p - a
    d1, d2 = (ab * ap).sum(-1), (ac * ap).sum(-1)
    bp = p - b
    d3, d4 = (ab * bp).sum(-1), (ac * bp).sum(-1)
    cp = p - c
    d5, d6 = (ab * cp).sum(-1), (ac * cp).sum(-1)
    vc, vb, va = d1 * d4 - d3 * d2, d5 * d2 - d1 * d6, d3 * d6 - d5 * d4
    with np.errstate(divide='ignore', invalid='ignore'):
        denom = va + vb + vc
        v, w = vb / denom, vc / denom
        inside = a + ab * v[..., None] + ac * w[..., None]
        t_ab = np.clip(d1 / (d1 - d3), 0, 1)
        t_ac = np.clip(d2 / (d2 - d6), 0, 1)
        t_bc = np.clip((d4 - d3) / ((d4 - d3) + (d5 - d6)), 0, 1)
    on_ab = a + ab * np.nan_to_num(t_ab)[..., None]
    on_ac = a + ac * np.nan_to_num(t_ac)[..., None]
    on_bc = b + (c - b) * np.nan_to_num(t_bc)[..., None]
    best = np.minimum(np.minimum(np.linalg.norm(p - on_ab, axis=-1), np.linalg.norm(p - on_ac, axis=-1)), np.linalg.norm(p - on_bc, axis=-1))
    ok = (va >= 0) & (vb >= 0) & (vc >= 0) & (np.abs(denom) > 1e-18)
    face = np.linalg.norm(p - np.nan_to_num(inside), axis=-1)
    return np.where(ok, np.minimum(face, best), best)


def segments_cross(S, T):
    """Whether any segment (e, 2, 3) passes through any triangle (k, 3, 3)."""
    o, d = S[:, 0][:, None], (S[:, 1] - S[:, 0])[:, None]
    a, e1, e2 = T[:, 0][None], (T[:, 1] - T[:, 0])[None], (T[:, 2] - T[:, 0])[None]
    h = np.cross(d, e2)
    det = (e1 * h).sum(-1)
    with np.errstate(divide='ignore', invalid='ignore'):
        f = 1.0 / det
        s = o - a
        u = f * (s * h).sum(-1)
        q = np.cross(s, e1)
        v = f * (d * q).sum(-1)
        t = f * (e2 * q).sum(-1)
        hit = (np.abs(det) > 1e-14) & (u >= 0) & (v >= 0) & (u + v <= 1) & (t >= 0) & (t <= 1)
    return bool(hit.any())


def closed(p):
    """Whether a piece is a closed skin: every edge between exactly two triangles."""
    if 'closed' not in p:
        flat = np.round(p['tri'].reshape(-1, 3) * 1e4).astype(np.int64)
        _, inv = np.unique(flat, axis=0, return_inverse=True)
        inv = inv.reshape(-1, 3)
        e = np.sort(np.concatenate([inv[:, [0, 1]], inv[:, [1, 2]], inv[:, [2, 0]]]), axis=1)
        _, counts = np.unique(e, axis=0, return_counts=True)
        p['closed'] = bool((counts == 2).all())
    return p['closed']


def inside(point, p):
    """Whether a point lies inside a closed piece: a line upward from it leaves the skin an odd number of times."""
    if not closed(p) or not ((point >= p['lo']) & (point <= p['hi'])).all():
        return False
    T = p['tri']
    # nudged off the grid, so the line does not run along an edge
    o = point + np.array([1.37e-4, 0.0, 2.11e-4])
    a, e1, e2 = T[:, 0], T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]
    d = np.array([0.0, 1.0, 0.0])
    h = np.cross(d, e2)
    det = (e1 * h).sum(-1)
    with np.errstate(divide='ignore', invalid='ignore'):
        f = 1.0 / det
        s = o - a
        u = f * (s * h).sum(-1)
        q = np.cross(s, e1)
        v = f * (q @ d)
        t = f * (e2 * q).sum(-1)
        hits = (np.abs(det) > 1e-14) & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    return int(hits.sum()) % 2 == 1


def edges(T):
    return np.concatenate([T[:, [0, 1]], T[:, [1, 2]], T[:, [2, 0]]])


def touch(p, q):
    """Whether two pieces hold each other."""
    tol = PAINT if (p['look'] in PAINTED or q['look'] in PAINTED) else TOL
    lo, hi = np.maximum(p['lo'], q['lo']) - tol, np.minimum(p['hi'], q['hi']) + tol
    if (lo > hi).any():
        return False
    P, Q = near(p, lo, hi), near(q, lo, hi)
    if len(P) and len(Q):
        if len(P) * len(Q) > 400000:                  # two large things side by side: taken in parts
            step = max(1, 400000 // len(Q))
            parts = [P[i:i + step] for i in range(0, len(P), step)]
        else:
            parts = [P]
        for part in parts:
            pv, qv = np.unique(part.reshape(-1, 3), axis=0), np.unique(Q.reshape(-1, 3), axis=0)
            pv = pv[((pv >= lo) & (pv <= hi)).all(1)]
            qv = qv[((qv >= lo) & (qv <= hi)).all(1)]
            if len(pv) and point_triangle(pv, Q).min() <= tol + 1e-5:
                return True
            if len(qv) and point_triangle(qv, part).min() <= tol + 1e-5:
                return True
            if segments_cross(edges(part), Q) or segments_cross(edges(Q), part):
                return True
    return inside(p['tri'][0, 0], q) or inside(q['tri'][0, 0], p)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--part', action='append', required=True)
    ap.add_argument('--base', default=A.DEFAULT)
    ap.add_argument('--all', action='store_true', help="report the other ship's pieces too")
    ap.add_argument('--json')
    ap.add_argument('--allow', help='a JSON file of things known to be afloat and why (object name, box), which do not fail the check')
    a = ap.parse_args()

    pieces = load(a.part, a.base)
    n = len(pieces)
    # ---- the grid
    grid = defaultdict(list)
    big = []
    for i, p in enumerate(pieces):
        c0, c1 = np.floor((p['lo'] - PAINT) / CELL).astype(int), np.floor((p['hi'] + PAINT) / CELL).astype(int)
        if np.prod(c1 - c0 + 1) > 4000:
            big.append(i)
            continue
        for cx in range(c0[0], c1[0] + 1):
            for cy in range(c0[1], c1[1] + 1):
                for cz in range(c0[2], c1[2] + 1):
                    grid[(cx, cy, cz)].append(i)

    def neighbours(i):
        p = pieces[i]
        c0, c1 = np.floor((p['lo'] - PAINT) / CELL).astype(int), np.floor((p['hi'] + PAINT) / CELL).astype(int)
        found = set(big)
        if i in big_set:
            lo, hi = p['lo'] - PAINT, p['hi'] + PAINT
            return [j for j in range(n) if j != i and (pieces[j]['hi'] >= lo).all() and (pieces[j]['lo'] <= hi).all()]
        for cx in range(c0[0], c1[0] + 1):
            for cy in range(c0[1], c1[1] + 1):
                for cz in range(c0[2], c1[2] + 1):
                    found.update(grid.get((cx, cy, cz), ()))
        found.discard(i)
        lo, hi = p['lo'] - PAINT, p['hi'] + PAINT
        return [j for j in found if (pieces[j]['hi'] >= lo).all() and (pieces[j]['lo'] <= hi).all()]
    big_set = set(big)

    # ---- the ground: her shell and every piece as large as a deck or a wall of the house
    held = np.zeros(n, bool)
    for i, p in enumerate(pieces):
        size = np.sort(p['hi'] - p['lo'])
        if size[2] > 8.0 and size[1] > 1.0:
            held[i] = True
    queue = deque(np.nonzero(held)[0].tolist())
    tested = set()
    while queue:
        i = queue.popleft()
        for j in neighbours(i):
            if held[j] or (i, j) in tested:
                continue
            tested.add((i, j))
            if touch(pieces[i], pieces[j]):
                held[j] = True
                queue.append(j)

    # ---- what is left, in the clusters that hold each other
    loose = [i for i in range(n) if not held[i] and (pieces[i]['hi'] - pieces[i]['lo']).min() > FLAT]
    pictures = sum(1 for i in range(n) if not held[i]) - len(loose)
    index = {i: k for k, i in enumerate(loose)}
    parent = list(range(len(loose)))

    def find(k):
        while parent[k] != k:
            parent[k] = parent[parent[k]]
            k = parent[k]
        return k
    for i in loose:
        for j in neighbours(i):
            if j in index and j > i and touch(pieces[i], pieces[j]):
                parent[find(index[j])] = find(index[i])
    clusters = defaultdict(list)
    for i in loose:
        clusters[find(index[i])].append(i)

    allow = json.load(open(a.allow)) if a.allow else []

    def allowed(names, lo, hi):
        for rule in allow:
            if any(rule['name'] in nm for nm in names) and all(lo[k] >= rule['box'][0][k] - 1e-6 and hi[k] <= rule['box'][1][k] + 1e-6 for k in range(3)):
                return rule['why']
        return None

    rows = []
    for members in clusters.values():
        lo = np.min([pieces[i]['lo'] for i in members], axis=0)
        hi = np.max([pieces[i]['hi'] for i in members], axis=0)
        own = any(pieces[i]['own'] for i in members)
        names = sorted({pieces[i]['name'] for i in members})
        # how far it is from anything that is held: the gap to be closed
        gap = np.inf
        for i in members:
            for j in neighbours(i):
                if held[j]:
                    lo2, hi2 = pieces[i]['lo'] - 0.25, pieces[i]['hi'] + 0.25
                    Q = near(pieces[j], lo2, hi2)
                    if len(Q):
                        v = np.unique(pieces[i]['tri'].reshape(-1, 3), axis=0)
                        gap = min(gap, float(point_triangle(v, Q[:4000]).min()))
        rows.append(dict(own=own, names=names, group=pieces[members[0]]['group'], pieces=len(members), triangles=int(sum(len(pieces[i]['tri']) for i in members)),
                         x=[round(float(lo[0]), 3), round(float(hi[0]), 3)], y=[round(float(lo[1]), 3), round(float(hi[1]), 3)],
                         yard=[round(float(lo[2]) + HALF, 3), round(float(hi[2]) + HALF, 3)], gap=None if gap == np.inf else round(gap, 4),
                         mover=sorted({pieces[i]['mover'] for i in members if pieces[i]['mover']}),
                         allowed=allowed(names, [lo[0], lo[1], lo[2] + HALF], [hi[0], hi[1], hi[2] + HALF])))
    rows.sort(key=lambda r: (not r['own'], r['group'], r['yard'][0]))
    hers = [r for r in rows if r['own']]
    bad = [r for r in hers if not r['allowed']]
    print(f"{n} pieces ({sum(1 for p in pieces if p['own'])} of hers); {int(held.sum())} are held, {pictures} are flat pictures on a surface, "
          f"{len(rows)} things are afloat: {len(hers)} of hers, {len(rows) - len(hers)} of the other ship's")
    for r in rows:
        if r['own'] or a.all:
            gap = 'nothing within 0.25 m' if r['gap'] is None else f"{r['gap'] * 1000:.0f} mm from what would hold it"
            note = f"  (known: {r['allowed']})" if r['allowed'] else ''
            print(f"  {'HERS ' if r['own'] else 'other'} {r['group']:9s} x {r['x'][0]:+.2f}..{r['x'][1]:+.2f}  {r['yard'][0]:5.2f}..{r['yard'][1]:5.2f} m  "
                  f"y {r['y'][0]:+.2f}..{r['y'][1]:+.2f}  {r['pieces']:3d} pieces  {gap}: {'; '.join(r['names'])[:150]}{note}")
    if a.json:
        json.dump(rows, open(a.json, 'w'), indent=1)
    if bad:
        raise SystemExit(f'{len(bad)} of her own things hang in the air')
    print('nothing of hers hangs in the air')


if __name__ == '__main__':
    main()
