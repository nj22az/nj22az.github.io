#!/usr/bin/env python3
"""
Puts the Christina together for the viewer: the parts built in Blender into ferry/data/ferry.bin.gz.

    python3 ferry/blender/assemble.py --part christina-hull.npz [--base <a ferry.bin.gz>] [--out ferry/data/ferry.bin.gz]

The base is a JMF1 file: the Town's export of the Minato Maru (tools/ferry-viewer-export.mjs), or the viewer's own file
as this tool last wrote it (the default). What Blender has built replaces what stood there before:

  - every mesh a part file brings is marked `from: "blender"`; meshes so marked in the base are dropped first, so the
    tool can be run again on its own output;
  - a part named in SUPERSEDES replaces the base's own meshes of that part (the Minato Maru's hull goes when the
    Christina's hull comes); the rule says what is kept and where it goes;
  - what the base keeps under the car deck is fitted inside the Christina's shell (FIT), because the Minato Maru's
    machinery spaces are square rooms and their corners stand through her plating where the hull rises aft.

Needs numpy; no Blender.
"""
import argparse, gzip, json, os, struct, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lines as L

DEFAULT = os.path.join(HERE, '..', 'data', 'ferry.bin.gz')

# The parts Blender has built, and what becomes of the base's own meshes there.
SUPERSEDES = {
    'hull': dict(
        section='Hull', built='10 November 2026',
        # The base sorts the engine control booth's window into the hull (it stands below the car deck and is not part
        # of the engine room's model): glass is not hull, so it goes with the machinery spaces it belongs to.
        keep=lambda m: m['transparent'] and m['opacity'] < 1, keep_in='machinery',
        why='her own hull, built in Blender from her lines'),
}
# Parts of the base that must lie inside the shell.
FIT = ('machinery',)
MATERIAL_DEFAULTS = dict(shading='standard', metalness=0, roughness=1, transparent=False, opacity=1, emissive='#000000',
                         emissiveIntensity=1, side='front', textured=False, depthWrite=True, alphaTest=0, offset=None)


def read_jmf(path):
    raw = gzip.open(path, 'rb').read()
    if raw[:4] != b'JMF1':
        raise SystemExit(f'{path} is not a JMF1 file')
    n = struct.unpack('<I', raw[4:8])[0]
    return json.loads(raw[8:8 + n].decode()), raw[8 + n:]


def decode(header, block, rec):
    lo, hi = np.array(header['bounds']['min']), np.array(header['bounds']['max'])
    nv, nt = rec['vertices'], rec['triangles']
    out = dict(material=rec['material'], origin=rec.get('from', 'town'), mover=rec.get('mover'))
    out['pos'] = np.frombuffer(block, '<u2', nv * 3, rec['pos']).reshape(-1, 3).astype(np.float64) / 65535 * (hi - lo) + lo
    out['nor'] = np.frombuffer(block, 'i1', nv * 3, rec['nor']).reshape(-1, 3).copy()
    out['col'] = np.frombuffer(block, 'u1', nv * 3, rec['col']).reshape(-1, 3).copy()
    out['uv'] = np.frombuffer(block, '<u2', nv * 2, rec['uv']).reshape(-1, 2).copy() if 'uv' in rec else None
    out['idx'] = np.frombuffer(block, '<u4' if rec.get('wide') else '<u2', nt * 3, rec['idx']).reshape(-1, 3).astype(np.uint32)
    return out


def fit_inside(pos, clear=0.03):
    """Move every point that stands outside the shell (below the car deck) just inside it, by the shorter way: in toward
    the centreline, or up. Returns how many were moved and the furthest move."""
    moved, furthest = 0, 0.0
    low = np.nonzero((pos[:, 1] < L.CAR - 0.05) & (np.abs(pos[:, 2]) < L.HALF))[0]
    # Amidships the section is the same from frame to frame and nothing below 3.5 m off the centreline can be outside.
    yards = pos[low, 2] + L.HALF
    maybe = low[(np.abs(pos[low, 0]) > 3.5) | (yards < 10.7) | (yards > 25.4)]
    for i in maybe:
        x, y, z = pos[i]
        ax = abs(x)
        hx = L.hull_x(y, z)
        hy = L.hull_y(ax, z)
        # Inside by either measure is inside: clear of the plating beside it, or clear of the plating under it. 5 mm of
        # grace, so a point this tool has already fitted is left where it is and a second run changes nothing.
        if ax <= hx - clear + 0.005 or (hy is not None and ax <= hx and y >= hy + clear - 0.005):
            continue
        ways = []
        if hx > 0.3:
            ways.append((ax - (hx - clear), (np.sign(x) * (hx - clear), y)))
        # Up is only a way in when the shell is over the point (a point under her bottom).
        if hy is not None and hy + clear > y:
            ways.append((hy + clear - y, (x, hy + clear)))
        if not ways:
            continue
        d, (nx, ny) = min(ways, key=lambda w: w[0])
        pos[i, 0], pos[i, 1] = nx, ny
        moved += 1
        furthest = max(furthest, d)
    return moved, furthest


def weld(pos, nor, col, lo, hi):
    """Triangle corners → shared vertices and indices, quantised as the file keeps them."""
    q = np.rint((pos - lo) / (hi - lo) * 65535).astype(np.uint16)
    n = np.clip(np.rint(nor * 127), -127, 127).astype(np.int8)
    rows = np.concatenate([q.astype(np.int32), n.astype(np.int32), col.astype(np.int32)], axis=1)
    uniq, inverse = np.unique(rows, axis=0, return_inverse=True)
    tri = inverse.reshape(-1, 3).astype(np.uint32)
    tri = tri[(tri[:, 0] != tri[:, 1]) & (tri[:, 1] != tri[:, 2]) & (tri[:, 0] != tri[:, 2])]
    return uniq[:, :3].astype(np.uint16), uniq[:, 3:6].astype(np.int8), uniq[:, 6:9].astype(np.uint8), tri


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--part', action='append', required=True, help='a part file written by export_jmf.py (may be given more than once)')
    ap.add_argument('--base', default=DEFAULT)
    ap.add_argument('--out', default=DEFAULT)
    ap.add_argument('--report')
    a = ap.parse_args()

    header, block = read_jmf(a.base)
    groups = header['views'][0]['groups']
    by_id = {g['id']: g for g in groups}
    materials = header['materials']
    meshes = {g['id']: [decode(header, block, rec) for rec in g['meshes']] for g in groups}
    report = dict(base=os.path.basename(a.base), dropped=[], moved=[], fitted=[], added=[])

    parts = []
    for path in a.part:
        z = np.load(path)
        meta = json.loads(bytes(z['meta']).decode())
        parts.append((meta, z))
    built = {m['group'] for meta, _ in parts for m in meta['meshes']}

    # 1. What Blender built before goes; what it builds now takes the place of the base's own.
    for gid in list(meshes):
        keep = []
        for m in meshes[gid]:
            if m['origin'] == 'blender':
                report['dropped'].append(dict(part=gid, material=m['material'], triangles=len(m['idx']), why='built in Blender before'))
            elif gid in SUPERSEDES and gid in built:
                rule = SUPERSEDES[gid]
                if rule['keep'](materials[m['material']]):
                    meshes[rule['keep_in']].append(m)
                    report['moved'].append(dict(part=gid, to=rule['keep_in'], material=m['material'], triangles=len(m['idx'])))
                else:
                    report['dropped'].append(dict(part=gid, material=m['material'], triangles=len(m['idx']), why=rule['why']))
            else:
                keep.append(m)
        meshes[gid] = keep

    # 2. The base's rooms under the car deck are fitted inside her shell.
    for gid in FIT:
        for m in meshes.get(gid, []):
            if m['origin'] != 'town':
                continue
            moved, furthest = fit_inside(m['pos'])
            if moved:
                report['fitted'].append(dict(part=gid, material=m['material'], vertices=moved, furthest=round(float(furthest), 3)))

    # 3. Bounds over everything, then the new parts.
    look_index = {}

    def material_of(look):
        rec = dict(MATERIAL_DEFAULTS)
        rec.update(metalness=round(float(look['metalness']), 3), roughness=round(float(look['roughness']), 3), side=look.get('side', 'front'),
                   offset=[int(v) for v in look['offset']] if look.get('offset') else None)
        key = json.dumps(rec, sort_keys=True)
        if key not in look_index:
            for i, m in enumerate(materials):
                if json.dumps({k: m.get(k, MATERIAL_DEFAULTS[k]) for k in MATERIAL_DEFAULTS}, sort_keys=True) == key:
                    look_index[key] = i
                    break
            else:
                materials.append(rec)
                look_index[key] = len(materials) - 1
        return look_index[key]

    fresh = []
    for meta, z in parts:
        for m in meta['meshes']:
            if m['group'] not in by_id:
                raise SystemExit(f'the part file brings "{m["group"]}", which is not one of the viewer\'s parts')
            fresh.append(dict(group=m['group'], material=material_of(m['look']), name=m['material'], objects=m['objects'], mover=m.get('mover') or None,
                              pos=z[m['key'] + '|pos'].astype(np.float64), nor=z[m['key'] + '|nor'], col=z[m['key'] + '|col']))
    # The box positions are kept over: the base's own, widened where a new part reaches further. It never shrinks, so
    # what the base keeps stays on the same grid and a second run gives the same file.
    lo, hi = np.array(header['bounds']['min'], dtype=np.float64), np.array(header['bounds']['max'], dtype=np.float64)
    for m in fresh:
        lo = np.minimum(lo, np.round(m['pos'].min(0) - 0.001, 4))
        hi = np.maximum(hi, np.round(m['pos'].max(0) + 0.001, 4))

    chunks, offset = [], 0

    def chunk(arr):
        nonlocal offset
        b = arr.tobytes()
        at = offset
        chunks.append(b)
        offset += len(b)
        pad = (4 - offset % 4) % 4
        if pad:
            chunks.append(b'\0' * pad)
            offset += pad
        return at

    def record(material, origin, pos_q, nor, col, idx, uv=None, mover=None):
        wide = len(pos_q) > 65535
        rec = dict(material=material, vertices=int(len(pos_q)), triangles=int(len(idx)), wide=wide)
        if mover:
            rec['mover'] = mover
        rec['pos'] = chunk(pos_q.astype('<u2'))
        rec['nor'] = chunk(nor.astype('i1'))
        rec['col'] = chunk(col.astype('u1'))
        if uv is not None:
            rec['uv'] = chunk(uv.astype('<u2'))
        rec['idx'] = chunk(idx.astype('<u4' if wide else '<u2'))
        if origin == 'blender':
            rec['from'] = 'blender'
        return rec

    for g in groups:
        out = []
        for m in meshes[g['id']]:
            q = np.rint((m['pos'] - lo) / (hi - lo) * 65535).astype(np.uint16)
            out.append(record(m['material'], m['origin'], q, m['nor'], m['col'], m['idx'], m['uv'], m['mover']))
        for m in (f for f in fresh if f['group'] == g['id']):
            q, n, c, tri = weld(m['pos'], m['nor'], m['col'], lo, hi)
            out.append(record(m['material'], 'blender', q, n, c, tri, mover=m['mover']))
            report['added'].append(dict(part=g['id'], material=m['name'], vertices=int(len(q)), triangles=int(len(tri)), objects=m['objects']))
        g['meshes'] = sorted(out, key=lambda r: (r['material'], r.get('mover', '')))

    header['bounds'] = dict(min=[float(v) for v in lo], max=[float(v) for v in hi])
    # What can be worked on the page (inputs) and how the moving parts answer (movers): Blender's replace Blender's.
    for key in ('inputs', 'movers'):
        kept = [x for x in header.get(key, []) if x.get('from') != 'blender']
        brought = [dict(x, **{'from': 'blender'}) for meta, _ in parts for x in meta.get(key, [])]
        if kept or brought:
            header[key] = kept + brought
        else:
            header.pop(key, None)
    ship = header['ship']
    ship['built'] = [dict(part=gid, section=SUPERSEDES[gid]['section'], date=SUPERSEDES[gid]['built']) for gid in SUPERSEDES
                     if any(f['group'] == gid for f in fresh) or any(b.get('part') == gid for b in ship.get('built', []))]
    header['source']['blender'] = dict(generator=parts[0][0]['generator'], blender=parts[0][0]['blender'])
    text = json.dumps(header, ensure_ascii=False, separators=(',', ':')).encode()
    text += b' ' * ((4 - len(text) % 4) % 4)
    body = b'JMF1' + struct.pack('<I', len(text)) + text + b''.join(chunks)
    with open(a.out, 'wb') as f:
        # No time and no file name in the gzip header: the same ship gives the same file, byte for byte.
        with gzip.GzipFile(filename='', fileobj=f, mode='wb', compresslevel=9, mtime=0) as gz:
            gz.write(body)
    report['triangles'] = {g['id']: sum(r['triangles'] for r in g['meshes']) for g in groups}
    report['bytes'] = os.path.getsize(a.out)
    if a.report:
        json.dump(report, open(a.report, 'w'), indent=1)
    print(f"{a.out}: {report['bytes']} bytes, {sum(report['triangles'].values())} triangles")
    for k in ('dropped', 'moved', 'fitted'):
        for r in report[k]:
            print(' ', k, r)
    for r in report['added']:
        print('  added', r['part'], r['material'], r['triangles'], 'triangles')
    sys.stdout.flush()


if __name__ == '__main__':
    main()
