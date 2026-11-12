"""
No two faces aboard lie in one plane over each other.

    python3 ferry/blender/zfight.py --part chisum.npz [--base ferry/data/ferry.bin.gz] [--all] [--json out.json]

The owner, 11 November 2026: "Z fighting is not allowed". Where two faces lie in the same plane, look the same way and
overlap, the page cannot tell which is in front and the two flicker as the view moves. This goes through the whole model
and finds every such pair.

How. Every triangle is sorted by the plane it lies in (its direction and its distance from the origin, to 0.4 mm). In
each plane, triangles of different pieces whose outlines overlap by more than a square centimetre are a fight, if they
look the same way, or look opposite ways and either is drawn on both sides. Two kinds of pair are not a fight. Paint, a
picture or a floor plate drawn with an offset toward the eye (the look's `offset`) on a surface drawn without it, or with
another: the page puts the one before the other by that offset, which is what it is for. And two faces bedded on a third:
where a face of another part lies in the same plane or within 2.5 mm of it, looks the other way and covers them (the feet
of two things on one deck, two backs against one wall), no eye can come between to see them.

Her own parts are read from the part file Blender wrote, with their names; the other ship's from the model. Without
--all only fights that one of her parts takes part in are listed and fail the check; the other ship's own are counted,
and listed with --all, for the sections still to be rebuilt.
"""
import argparse
import json
import os
import sys
from collections import defaultdict

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import assemble as A  # noqa: E402

HALF = A.L.HALF
SAME = 0.0004            # two planes nearer than this are one plane
AREA = 1e-4              # an overlap larger than this (m²) is seen to flicker
CELL = 0.5


def load(part_paths, base):
    """Every piece: triangles, whose it is, its name, the viewer's part, how its look is drawn (both sides, its offset)."""
    out = []
    for path in part_paths:
        z = np.load(path)
        meta = json.loads(bytes(z['meta']).decode())
        for m in meta['meshes']:
            tri = z[m['key'] + '|pos'].astype(np.float64).reshape(-1, 3, 3)
            look = m['look']
            at = 0
            for ob in m['objects']:
                mine = tri[at:at + ob['triangles']]
                at += ob['triangles']
                out.append(dict(tri=mine, own=True, name=ob['name'], group=m['group'], both=look.get('side') == 'double',
                                offset=tuple(look.get('offset') or ()), glass=bool(look.get('transparent'))))
    header, block = A.read_jmf(base)
    for g in header['views'][0]['groups']:
        for rec in g['meshes']:
            if rec.get('from') == 'blender':
                continue
            m = A.decode(header, block, rec)
            mat = header['materials'][rec['material']]
            tri = m['pos'][m['idx']].astype(np.float64)
            col = m['col'][m['idx'][:, 0]]
            for sel in A.pieces_of(m):
                out.append(dict(tri=tri[sel], own=False, group=g['id'], both=mat.get('side') == 'double', offset=tuple(mat.get('offset') or ()),
                                glass=bool(mat.get('transparent')),
                                name=f"the other ship's, material {rec['material']}, colour {tuple(int(v) for v in col[sel[0]][:3])}"))
    return out


def clip_area(a, b):
    """The area two triangles in a plane (3 x 2 each) have in common."""
    def side(p, q, r):
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    if side(*b) < 0:
        b = b[::-1]
    poly = [tuple(p) for p in a]
    for i in range(3):
        p, q = b[i], b[(i + 1) % 3]
        nxt = []
        for j in range(len(poly)):
            u, v = poly[j], poly[(j + 1) % len(poly)]
            du, dv = side(p, q, u), side(p, q, v)
            if du >= 0:
                nxt.append(u)
            if (du > 0 and dv < 0) or (du < 0 and dv > 0):
                t = du / (du - dv)
                nxt.append((u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t))
        poly = nxt
        if len(poly) < 3:
            return 0.0
    area = 0.0
    for j in range(len(poly)):
        u, v = poly[j], poly[(j + 1) % len(poly)]
        area += u[0] * v[1] - v[0] * u[1]
    xs, ys = [q[0] for q in poly], [q[1] for q in poly]
    # A band narrower than 2.5 mm is two faces that meet edge to edge, not one over the other.
    if min(max(xs) - min(xs), max(ys) - min(ys)) < 0.0025:
        return 0.0
    clip_area.centre = (sum(xs) / len(xs), sum(ys) / len(ys))
    return abs(area) / 2


def covers(tri2, point):
    """Whether a triangle in the plane (3 x 2) covers a point of it."""
    (ax, ay), (bx, by), (cx, cy) = tri2
    px, py = point
    d1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax)
    d2 = (cx - bx) * (py - by) - (cy - by) * (px - bx)
    d3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx)
    return (d1 >= 0 and d2 >= 0 and d3 >= 0) or (d1 <= 0 and d2 <= 0 and d3 <= 0)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--part', action='append', required=True)
    ap.add_argument('--base', default=A.DEFAULT)
    ap.add_argument('--all', action='store_true', help="list the other ship's own fights too")
    ap.add_argument('--json')
    a = ap.parse_args()

    pieces = load(a.part, a.base)
    # ---- every triangle, with its plane
    T = np.concatenate([p['tri'] for p in pieces])
    owner = np.concatenate([np.full(len(p['tri']), i) for i, p in enumerate(pieces)])
    n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
    size = np.linalg.norm(n, axis=1)
    keep = size > 2e-6
    T, owner, n = T[keep], owner[keep], n[keep] / size[keep, None]
    # one direction for a plane, whichever way its face looks: the first component that is not zero is positive
    flip = np.where(np.abs(n[:, 0]) > 1e-6, n[:, 0] < 0, np.where(np.abs(n[:, 1]) > 1e-6, n[:, 1] < 0, n[:, 2] < 0))
    way = np.where(flip, -1, 1)
    axis = n * way[:, None]
    d = (axis * T[:, 0]).sum(1)
    kn = np.round(axis * 400).astype(np.int64)
    buckets = defaultdict(list)
    for shift in (0.0, 0.5):                                       # two grids of distance, so a pair near a boundary shares a bin
        kd = np.floor(d / 0.001 + shift).astype(np.int64)
        for i in range(len(T)):
            buckets[(kn[i, 0], kn[i, 1], kn[i, 2], kd[i], shift)].append(i)

    # Every face by the direction of its plane, for the search for a face that two others are bedded on: that face may lie
    # in the next bin of distance (the model file rounds places to its own grid, so a deck's face and the feet standing on
    # it can fall a hair to either side of a bin's edge; 11 November 2026, under the drinks machine).
    facing = defaultdict(list)
    for i in range(len(T)):
        facing[(kn[i, 0], kn[i, 1], kn[i, 2])].append(i)
    facing = {k: np.array(v) for k, v in facing.items()}

    fights = defaultdict(lambda: [0.0, None, None, 0.0, None])    # (piece, piece) -> area, where, the plane's direction, the largest overlap
    done = set()
    for idx in buckets.values():
        if len(idx) < 2:
            continue
        idx = np.array(idx)
        if len(set(owner[idx].tolist())) < 2:
            continue
        ax = axis[idx[0]]
        u = np.cross(ax, [1.0, 0, 0] if abs(ax[0]) < 0.9 else [0, 1.0, 0])
        u /= np.linalg.norm(u)
        v = np.cross(ax, u)
        P2 = np.stack([T[idx] @ u, T[idx] @ v], axis=-1)           # (k, 3, 2)
        lo, hi = P2.min(1), P2.max(1)
        cells = defaultdict(list)
        for k in range(len(idx)):
            c0, c1 = np.floor(lo[k] / CELL).astype(int), np.floor(hi[k] / CELL).astype(int)
            if (c1 - c0 + 1).prod() > 400:
                cells['big'].append(k)
                continue
            for cx in range(c0[0], c1[0] + 1):
                for cy in range(c0[1], c1[1] + 1):
                    cells[(cx, cy)].append(k)
        big = cells.pop('big', [])
        groups = list(cells.values()) + ([big + [k for k in range(len(idx)) if k not in set(big)]] if big else [])
        for members in groups:
            if len(members) < 2:
                continue
            m = np.array(members)
            for ii in range(len(m)):
                i = m[ii]
                rest = m[ii + 1:]
                if not len(rest):
                    break
                near = (owner[idx[rest]] != owner[idx[i]]) & (lo[rest] < hi[i] - 1e-4).all(1) & (hi[rest] > lo[i] + 1e-4).all(1)
                for j in rest[near]:
                    gi, gj = int(idx[i]), int(idx[j])
                    key = (min(gi, gj), max(gi, gj))
                    if key in done:
                        continue
                    done.add(key)
                    if abs(d[gi] - d[gj]) > SAME:
                        continue
                    # ... and truly one plane: each face's corners lie in the other's plane. (A plane's distance is taken
                    # from amidships, so two faces 16 mm apart whose directions differ by a fiftieth of a degree have the
                    # same distance 55 m forward or aft: on the 124.8 m ship that named a deck's edge and the shell beside
                    # it, a window's glass and the wall it stands in. Measured face to face, they are apart.)
                    if np.abs((T[gj] - T[gi][0]) @ axis[gi]).max() > SAME or np.abs((T[gi] - T[gj][0]) @ axis[gj]).max() > SAME:
                        continue
                    p, q = pieces[owner[gi]], pieces[owner[gj]]
                    if way[gi] != way[gj] and not (p['both'] or q['both']):
                        continue                                   # back to back, each seen from its own side only
                    if p['offset'] != q['offset']:
                        continue                                   # one is put before the other by the page
                    area = clip_area(P2[i], P2[j])
                    if area > 0 and way[gi] == way[gj]:
                        # bedded: a third face in this plane looks the other way and covers the middle of the overlap
                        # (anywhere in this plane, or within 2.5 mm of it: the feet of things stand a little over a deck)
                        c = clip_area.centre
                        cand = facing[(kn[gi, 0], kn[gi, 1], kn[gi, 2])]
                        cand = cand[(way[cand] != way[gi]) & (np.abs(d[cand] - d[gi]) <= 0.0025)]
                        if len(cand):
                            Q2 = np.stack([T[cand] @ u, T[cand] @ v], axis=-1)
                            inside = (Q2.min(1) <= c).all(1) & (Q2.max(1) >= c).all(1)
                            for k in np.nonzero(inside)[0]:
                                if covers(Q2[k], c):
                                    area = 0.0
                                    break
                    if area > 0:
                        rec = fights[(min(owner[gi], owner[gj]), max(owner[gi], owner[gj]))]
                        rec[0] += area
                        if rec[1] is None or area > rec[3]:
                            lo3, hi3 = np.maximum(T[gi].min(0), T[gj].min(0)), np.minimum(T[gi].max(0), T[gj].max(0))
                            rec[1], rec[2], rec[3], rec[4] = (lo3 + hi3) / 2, ax, area, (lo3, hi3, int(way[gi]), int(way[gj]))

    # ---- A second kind: a face drawn with a pull toward the eye (a covering, a picture) that lies close behind another
    # face looking the same way. The pull is meant to put it before the surface it lies on; lying under a surface instead,
    # it comes through that surface in patches when seen at a low angle (the car deck, 11 November 2026: the engine room's
    # deckhead panel, 12 mm under the deck's paint, showed through it).
    through = defaultdict(lambda: [0.0, None, None])
    pulled = np.array([bool(p['offset']) and p['offset'][0] < 0 for p in pieces])[owner]
    clear = np.array([p['glass'] for p in pieces])[owner]         # what lies behind glass is meant to be seen through it
    key = (kn[:, 0] * 1000003 + kn[:, 1] * 1009 + kn[:, 2]) * 3 + way
    ahead = d * way                                                # how far along the way it looks
    for k in np.unique(key[pulled]):
        grp = np.nonzero(key == k)[0]
        ax = axis[grp[0]]
        u = np.cross(ax, [1.0, 0, 0] if abs(ax[0]) < 0.9 else [0, 1.0, 0])
        u /= np.linalg.norm(u)
        v = np.cross(ax, u)
        P2 = np.stack([T[grp] @ u, T[grp] @ v], axis=-1)
        lo, hi = P2.min(1), P2.max(1)
        for a_ in np.nonzero(pulled[grp])[0]:
            gap = ahead[grp] - ahead[grp[a_]]
            cover = (gap > 0.0006) & (gap <= 0.03) & (owner[grp] != owner[grp[a_]]) & ~pulled[grp] & ~clear[grp] & (lo < hi[a_] - 1e-3).all(1) & (hi > lo[a_] + 1e-3).all(1)
            for b_ in np.nonzero(cover)[0]:
                area = clip_area(P2[a_], P2[b_])
                if area > 0:
                    rec = through[(int(owner[grp[a_]]), int(owner[grp[b_]]))]
                    rec[0] += area
                    if rec[1] is None:
                        rec[1], rec[2] = (T[grp[a_]].mean(0) + T[grp[b_]].mean(0)) / 2, float(gap[b_])
    shows = []
    for (i, j), (area, at, gap) in through.items():
        if area >= 0.01:
            shows.append(dict(a=pieces[i]['name'], b=pieces[j]['name'], own=bool(pieces[i]['own'] or pieces[j]['own']), group=pieces[i]['group'], area=round(area, 3),
                              gap=round(gap * 1000, 1), x=round(float(at[0]), 2), y=round(float(at[1]), 2), yard=round(float(at[2]) + HALF, 2)))
    shows.sort(key=lambda r: -r['area'])
    print(f"{len(shows)} coverings lie close under another surface and come through it; {sum(r['own'] for r in shows)} with a part of hers")
    for r in shows:
        if r['own'] or a.all:
            print(f"  {'HERS ' if r['own'] else 'other'} {r['group']:9s} {r['area']:6.2f} m², {r['gap']} mm under, at x {r['x']:+.2f}, {r['yard']:5.2f} m, y {r['y']:+.2f}: {r['a'][:52]}  under  {r['b'][:52]}")

    rows = []
    for (i, j), (area, at, ax, _, eg) in fights.items():
        if area < AREA:
            continue
        p, q = pieces[i], pieces[j]
        rows.append(dict(a=p['name'], b=q['name'], own=bool(p['own'] or q['own']), both=bool(p['own'] and q['own']), group=p['group'],
                         area=round(area, 4), x=round(float(at[0]), 2), y=round(float(at[1]), 2), yard=round(float(at[2]) + HALF, 2),
                         plane=[round(float(c), 2) for c in ax], looks=[eg[2], eg[3]],
                         box=[[round(float(v), 3) for v in eg[0]], [round(float(v), 3) for v in eg[1]]]))
    rows.sort(key=lambda r: (not r['own'], r['group'], -r['area']))
    hers = [r for r in rows if r['own']]
    print(f"{len(pieces)} pieces, {len(T)} triangles: {len(rows)} pairs of faces lie in one plane over each other; "
          f"{len(hers)} with a part of hers, {len(rows) - len(hers)} among the other ship's own")
    for r in rows:
        if r['own'] or a.all:
            print(f"  {'HERS ' if r['own'] else 'other'} {r['group']:9s} {r['area'] * 1e4:8.0f} cm²  at x {r['x']:+.2f}, {r['yard']:5.2f} m, y {r['y']:+.2f}, "
                  f"plane {r['plane']}: {r['a'][:60]}  ×  {r['b'][:60]}")
    if a.json:
        json.dump(rows, open(a.json, 'w'), indent=1)
    # The second kind is listed and counted but does not fail the check yet: it still names things that are meant (a dial's
    # face under its bezel, lettering under a rail), and what is a fault among them has to be sorted out first.
    if hers:
        raise SystemExit(f'{len(hers)} pairs of faces with a part of hers lie in one plane over each other')
    print('no face of hers lies in one plane over another')


if __name__ == '__main__':
    main()
