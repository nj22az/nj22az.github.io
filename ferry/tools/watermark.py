#!/usr/bin/env python3
"""
Her maker's mark: make its key, and read a copy of her to say whose it is.

    python3 ferry/tools/watermark.py --new-key              make the secret key, once (it is kept outside the repository)
    python3 ferry/tools/watermark.py --check FILE           read a copy: her own file (ferry.bin.gz), or an OBJ or ASCII PLY
                                                            whose corners are in her axes, in metres
    python3 ferry/tools/watermark.py --check FILE --bounds ferry/data/ferry.bin.gz
                                                            (an OBJ or PLY is read against the bounds of that file of hers)

The owner, 12 November 2026: "I need you to water mark, models, with my logo and these icons, incase someone just steals
them, these are invisible watermarks". How the mark is made, what it survives and what it does not: ferry/blender/mark.py.

Reading a copy: every corner is put back on her grid, and the last bit of its number across her breadth is compared with
the bit the key gives for that place. A copy of hers answers with all of them (or nearly: a copy that was saved with few
decimals loses some). Anything else answers with a half. The figure beside it says how far from chance the count is: over
6 is beyond doubt; under 3 says nothing.
"""
import argparse
import gzip
import json
import os
import struct
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'blender'))
import mark as M

HERS = os.path.join(HERE, '..', 'data', 'ferry.bin.gz')


def jmf(path):
    """Her own file: its header, and each mesh's corners as the file keeps them."""
    raw = gzip.open(path, 'rb').read()
    if raw[:4] != b'JMF1':
        raise SystemExit(f'{path} is not one of her files')
    n = struct.unpack('<I', raw[4:8])[0]
    header = json.loads(raw[8:8 + n].decode())
    block = raw[8 + n:]
    out = []
    for g in header['views'][0]['groups']:
        for rec in g['meshes']:
            q = np.frombuffer(block, dtype='<u2', count=rec['vertices'] * 3, offset=rec['pos']).reshape(-1, 3)
            out.append((g['id'], q))
    return header, out


def corners(path):
    """The corners of an OBJ or an ASCII PLY, in metres."""
    pts = []
    with open(path, errors='replace') as f:
        first = f.readline()
        if first.strip() == 'ply':
            count, names = 0, []
            for line in f:
                w = line.split()
                if w[:2] == ['element', 'vertex']:
                    count = int(w[2])
                elif w[:1] == ['property'] and count and len(names) < 3:
                    names.append(w[-1])
                elif w[:1] == ['end_header']:
                    break
            for _ in range(count):
                w = f.readline().split()
                pts.append((float(w[0]), float(w[1]), float(w[2])))
        else:
            for line in [first] + f.readlines():
                if line.startswith('v '):
                    w = line.split()
                    pts.append((float(w[1]), float(w[2]), float(w[3])))
    return np.array(pts, dtype=np.float64)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--new-key', action='store_true')
    ap.add_argument('--check')
    ap.add_argument('--bounds', default=HERS, help='her own file, whose bounds an OBJ or PLY is read against')
    a = ap.parse_args()
    if a.new_key:
        if os.path.exists(M.KEY_FILE) or os.environ.get('CHISUM_MARK_KEY'):
            raise SystemExit(f'there is a key already ({M.KEY_FILE}, or CHISUM_MARK_KEY): it is not replaced. A model marked with one key answers to no other.')
        os.makedirs(os.path.dirname(M.KEY_FILE), exist_ok=True)
        k = os.urandom(32)
        with open(M.KEY_FILE, 'w') as f:
            f.write(k.hex() + '\n')
        os.chmod(M.KEY_FILE, 0o600)
        print(f'{M.KEY_FILE}: a new key, fingerprint {M.fingerprint(k)}.')
        print('Keep a copy of this file somewhere safe and never put it in a repository: without it the mark cannot be proven.')
        return 0
    if not a.check:
        ap.print_help()
        return 2
    k = M.key()
    print(f'key fingerprint {M.fingerprint(k)}')
    try:
        header, meshes = jmf(a.check)
        rights = header.get('rights') or {}
        said = rights.get('mark') or {}
        print(f"{a.check}: her own file. It says: {rights.get('owner', 'no owner named')}; mark {said.get('scheme', 'none')}, fingerprint {said.get('id', 'none')}"
              + ('' if not said or said.get('id') == M.fingerprint(k) else '  (NOT this key)'))
        by = {}
        for gid, q in meshes:
            by.setdefault(gid, []).append(q)
        for gid, qs in by.items():
            share, n, sd = M.read(np.concatenate(qs), k)
            print(f'  {gid:10s} {n:8d} corners, {100 * share:6.2f} % carry the mark ({sd:.0f} standard deviations from chance)')
        q = np.concatenate([q for _, q in meshes])
    except (OSError, SystemExit, gzip.BadGzipFile) as err:
        if isinstance(err, SystemExit) and 'not one of her files' not in str(err):
            raise
        header, _ = jmf(a.bounds)
        pts = corners(a.check)
        if not len(pts):
            raise SystemExit(f'{a.check}: no corners found (her own file, an OBJ or an ASCII PLY is read)')
        lo, hi = header['bounds']['min'], header['bounds']['max']
        inside = ((pts >= np.array(lo) - 0.01) & (pts <= np.array(hi) + 0.01)).all(1)
        print(f'{a.check}: {len(pts)} corners, {int(inside.sum())} of them within her bounds (read against {a.bounds})')
        q = M.quantise(pts[inside], lo, hi)
    share, n, sd = M.read(q, k)
    verdict = 'HERS: it carries the mark' if sd > 6 and share > 0.6 else 'it may be hers (a damaged mark)' if sd > 3 else 'no mark of this key is in it'
    print(f'in all: {n} different corners, {100 * share:.2f} % carry the mark, {sd:.0f} standard deviations from chance: {verdict}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
