#!/usr/bin/env python3
"""
Checks the Chisum as the viewer will read her (ferry/data/ferry.bin.gz), without Blender.

    python3 ferry/blender/check.py [--town <the Town's own export of the Minato Maru>]

  1. The file is a JMF1 file whose hull is the one built in Blender, with its plating, structure, gear and marks.
  2. Her lines give the particulars she is specified with.
  3. Nothing of her structure stands outside her moulded shell.
  4. Nothing of the machinery spaces (the Minato Maru's rooms, fitted by assemble.py) stands outside it either.
  5. With --town: the lines are the Rev C form, loft point for loft point (the Town's hull is drawn at every 0.5 m).

Exits 1 when a check fails.
"""
import argparse, gzip, json, os, struct, sys
from math import pi
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lines as L
import spec as S

failures = []


def check(ok, text):
    print(('ok    ' if ok else 'FAIL  ') + text)
    if not ok:
        failures.append(text)


def read(path):
    raw = gzip.open(path, 'rb').read()
    n = struct.unpack('<I', raw[4:8])[0]
    return raw[:4], json.loads(raw[8:8 + n].decode()), raw[8 + n:]


def positions(header, block, rec):
    lo, hi = np.array(header['bounds']['min']), np.array(header['bounds']['max'])
    return np.frombuffer(block, '<u2', rec['vertices'] * 3, rec['pos']).reshape(-1, 3) / 65535 * (hi - lo) + lo


def outside(pos, slack):
    """How far each point below the car deck stands outside the moulded shell (0 when inside)."""
    out = np.zeros(len(pos))
    for i, (x, y, z) in enumerate(pos):
        if y > L.CAR - 0.05 or abs(z) >= L.HALF:
            continue
        d = abs(x) - L.hull_x(float(y), float(z))
        if d > slack:
            out[i] = d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--file', default=os.path.join(HERE, '..', 'data', 'ferry.bin.gz'))
    ap.add_argument('--town')
    a = ap.parse_args()

    magic, header, block = read(a.file)
    groups = {g['id']: g for g in header['views'][0]['groups']}
    check(magic == b'JMF1' and header['format'] == 'JMF1', 'the file is JMF1')
    check([g['id'] for g in header['views'][0]['groups']] == ['hull', 'machinery', 'car', 'passenger', 'bridge', 'top'],
          'six parts, bottom to top')
    hull = groups['hull']['meshes']
    check(hull and all(m.get('from') == 'blender' for m in hull), 'every mesh of the hull is built in Blender')
    check(any(b['part'] == 'hull' for b in header['ship'].get('built', [])), 'the header names the hull as her own')
    tri = sum(m['triangles'] for m in hull)
    check(40000 < tri < 80000, f'the hull has {tri} triangles (between 40,000 and 80,000)')
    total = sum(m['triangles'] for g in groups.values() for m in g['meshes'])
    size = os.path.getsize(a.file)
    # The budget is what a phone fetches once and then keeps (the page saves the file for use offline). It was 2 MB while she
    # was mostly the other ship; it is 3 MB since 11 November 2026, when the owner's drinks machine came aboard with 22,000
    # triangles of its own, and it is to be looked at again as each section is built.
    check(size < 3_000_000, f'the file is {size / 1e6:.2f} MB with {total} triangles (under 3 MB)')
    # ---- Her own pictures and her register travel with the model.
    here = os.path.dirname(os.path.abspath(a.file))
    sheets = header.get('atlases', [])
    check(len(sheets) == 2 and all(os.path.exists(os.path.join(here, s['file'])) for s in sheets), 'two sheets of pictures are named and both are there')
    used = {header['materials'][m['material']].get('atlas', 0) for g in groups.values() for m in g['meshes'] if header['materials'][m['material']].get('textured')}
    check(used <= {0, 1} and 1 in used, 'her own sheet is drawn from')
    for g in groups.values():
        for m in g['meshes']:
            if header['materials'][m['material']].get('textured') and 'uv' not in m:
                check(False, f'{g["id"]}: a mesh with a picture has no place on its sheet (no uv)')
    reg = header.get('systems')
    if reg and os.path.exists(os.path.join(here, reg['file'])):
        data = json.load(open(os.path.join(here, reg['file'])))
        comps = data['components']
        check(len(comps) == reg['components'], f'the register beside the model holds the {reg["components"]} components the model names')
        check(header['ship']['name'] == S.SHIP_NAME == data['ship']['name'], f'the model, the register and the specification agree on her name ({header["ship"]["name"]})')
        lo, hi = np.array(header['bounds']['min']) - 0.05, np.array(header['bounds']['max']) + 0.05
        out = [c['id'] for c in comps if c.get('box') and not ((np.array(c['box'][0]) >= lo).all() and (np.array(c['box'][1]) <= hi).all())]
        check(not out, f'every component with a place in the model lies within the model ({", ".join(out) or "all"})')
        parts = {c.get('part') for c in comps if c.get('box')}
        check(parts <= set(groups), f'each is drawn in one of the viewer\'s parts ({", ".join(sorted(p for p in parts if p))})')
        ids = {c['id'] for c in comps}
        loose = [f"{b['id']} {k['no']}: {c}" for b in data['boards'] for k in b['circuits'] for c in k['consumers'] + k['standby'] if c not in ids]
        check(not loose, 'every consumer of every way is a component of the register')
    else:
        check(False, 'the model names no register, or the register is not beside it')
    for g in groups.values():
        for m in g['meshes']:
            if m['material'] >= len(header['materials']):
                check(False, f'{g["id"]}: a mesh names material {m["material"]}, which the file does not have')

    # ---- Her lines.
    v = L.displacement()
    check(abs(v * 1.025 - 368) < 3, f'her lines displace {v * 1.025:.0f} t at 1.9 m (368 t)')
    check(abs(L.half_breadth(0) * 2 - 8.4) < 1e-9 and abs(L.keel_y(0) + 1.9) < 1e-9 and abs(L.CAR - 2.1) < 1e-9,
          'beam 8.4 m, draught 1.9 m, car deck 4.0 m above the keel')
    worst = max(max(abs(a_ - b_) for a_, b_ in zip(L.section_point(z, t), L.section_psi(z, L.psi_at(L.section_point(z, t)[1], z))))
                for z in (-17, -12, -5, 0, 6, 11, 15, 17) for t in (0.2, 0.7, 1.2, 1.5))
    check(worst < 1e-6, f'the two ways of walking round a section agree ({worst:.1e} m)')

    # ---- Structure inside the shell. Plates and the inner face are drawn in primer (roughness 0.74).
    primer = [m for m in hull if abs(header['materials'][m['material']]['roughness'] - 0.74) < 1e-6]
    check(len(primer) >= 2, 'the hull has its inner face and its plates in primer')
    for m in primer:
        mat = header['materials'][m['material']]
        pos = positions(header, block, m)
        out = outside(pos, 0.001)
        # The stern tubes pass out through the shell inside their bossings: 0.2 m round each shaft line is theirs.
        tubes = (np.abs(np.abs(pos[:, 0]) - S.SHAFT_X) < 0.2) & (pos[:, 2] < L.Z(7.6))
        bad = int(((out > 0) & ~tubes).sum())
        check(bad == 0, f'primer ({mat["side"]}): {bad} of {len(pos)} points outside the shell' +
              (f' (worst {out[~tubes].max() * 1000:.0f} mm)' if bad else ''))

    # ---- The plating's inner face stays behind the plating between the stations too: the middle of each of its
    # triangles is at least 5 mm inside the moulded surface, measured across or upward, whichever is the greater.
    for m in primer:
        if header['materials'][m['material']]['side'] != 'front':
            continue
        pos = positions(header, block, m)
        idx = np.frombuffer(block, '<u4' if m.get('wide') else '<u2', m['triangles'] * 3, m['idx']).reshape(-1, 3)
        mid = pos[idx].mean(1)
        mid = mid[(np.abs(mid[:, 2]) < L.HALF - 0.02) & (mid[:, 1] < L.CAR - 0.05)]
        # Not the stern tubes (they pass out through the shell) nor the tunnel (it is the opening).
        mid = mid[~((np.abs(np.abs(mid[:, 0]) - S.SHAFT_X) < 0.2) & (mid[:, 2] < L.Z(8.5)))]
        mid = mid[np.hypot(mid[:, 1] + 0.95, mid[:, 2] - L.Z(29.0)) > 0.55]
        thin = 0
        for x, y, z in mid[::3]:
            across = L.hull_x(float(y), float(z)) - abs(x)
            hy = L.hull_y(float(x), float(z))
            up = (y - hy) if hy is not None else -1.0
            if max(across, up) < 0.005:
                thin += 1
        check(thin == 0, f'the inner face of the plating: {thin} of {len(mid[::3])} sampled triangles come within 5 mm of the moulded surface')

    # ---- The machinery spaces inside the shell.
    for m in groups['machinery']['meshes']:
        pos = positions(header, block, m)
        low = pos[(pos[:, 1] < L.CAR - 0.05)]
        cand = low[(np.abs(low[:, 0]) > 3.5) | (low[:, 2] + L.HALF < 10.7) | (low[:, 2] + L.HALF > 25.4)]
        out = outside(cand, 0.002)
        check(int((out > 0).sum()) == 0, f'machinery (material {m["material"]}): {int((out > 0).sum())} of {len(pos)} points outside the shell' +
              (f' (worst {out.max() * 1000:.0f} mm)' if (out > 0).any() else ''))

    # ---- The lines against the Town's hull.
    if a.town:
        _, th, tb = read(a.town)
        tg = {g['id']: g for g in th['views'][0]['groups']}['hull']
        shell = max((m for m in tg['meshes'] if not m.get('from')), key=lambda m: m['triangles'], default=None)
        if shell is None:
            check(False, '--town: that file has no hull of the Town\'s own to compare with')
        else:
            pos = positions(th, tb, shell)
            worst, count, z = 0.0, 0, -L.HALF
            while z <= L.HALF + 1e-6:
                for i in range(25):
                    u = i / 24
                    x, y = L.section_point(z, pi / 2 * (2 * u * u if u < .5 else 1 - 2 * (1 - u) * (1 - u)))
                    worst = max(worst, float(np.sqrt(((pos - np.array([x, y, z])) ** 2).sum(1)).min()))
                    count += 1
                z += 0.5
            check(worst < 0.002, f'her lines pass through the Rev C hull\'s {count} port loft points (furthest {worst * 1000:.2f} mm)')

    print(f'{len(failures)} failed' if failures else 'all checks passed')
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
