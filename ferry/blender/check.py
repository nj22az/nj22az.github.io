#!/usr/bin/env python3
"""
Checks the Chisum as the viewer will read her (ferry/data/ferry.bin.gz), without Blender.

    python3 ferry/blender/check.py

  1. The file is a JMF1 file, every mesh of it built in Blender, with her pictures and her register beside it.
  2. Her rooms are the spaces of the general arrangement (ga.py), each with a box inside the model.
  3. Her lines give the particulars she is specified with, and the arrangement agrees with them.
  4. Nothing of her structure stands outside her moulded shell, nor anything of the machinery spaces.

Exits 1 when a check fails.
"""
import argparse, gzip, json, os, struct, sys
from math import pi
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lines as L
import spec as S
import ga

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
    """How far each point below the upper deck stands outside the moulded shell (0 when inside)."""
    out = np.zeros(len(pos))
    for i, (x, y, z) in enumerate(pos):
        if y > L.UPPER - 0.05 or abs(z) >= L.HALF or abs(x) < 4.0 and L.yard(z) < 100.0 and y > L.keel_y(float(z)) + 0.5:
            continue
        if abs(x) <= L.STEM_HALF + 0.005:
            continue                    # the keel plate and the stem's plate, between the two sides' plating
        d = abs(x) - L.hull_x(float(y), float(z))
        if d > slack:
            out[i] = d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--file', default=os.path.join(HERE, '..', 'data', 'ferry.bin.gz'))
    a = ap.parse_args()

    magic, header, block = read(a.file)
    groups = {g['id']: g for g in header['views'][0]['groups']}
    check(magic == b'JMF1' and header['format'] == 'JMF1', 'the file is JMF1')
    check([g['id'] for g in header['views'][0]['groups']] == list(S.PARTS),
          f'{len(S.PARTS)} parts, bottom to top ({", ".join(S.PARTS)})')
    hull = groups['hull']['meshes']
    check(hull and all(m.get('from') == 'blender' for m in hull), 'every mesh of the hull is built in Blender')
    check(all(m.get('from') == 'blender' for g in groups.values() for m in g['meshes']), 'every mesh of every part is built in Blender: nothing of another ship is in the file')
    check(any(b['part'] == 'hull' for b in header['ship'].get('built', [])), 'the header names the hull as her own')
    # Whose she is (the owner, 12 November 2026: "I need you to water mark, models ... incase someone just steals them"): the
    # file names its owner, and every corner carries her maker's mark (mark.py). A file without it is not to be published.
    import mark as M
    rights = header.get('rights') or {}
    said = rights.get('mark') or {}
    check(rights.get('owner') == M.OWNER and said.get('scheme') == M.SCHEME and said.get('id'), f"the file names its owner ({rights.get('owner')}) and says it carries her maker's mark (fingerprint {said.get('id')})")
    k = M.key(required=False)
    if k:
        q = np.concatenate([np.frombuffer(block, dtype='<u2', count=m['vertices'] * 3, offset=m['pos']).reshape(-1, 3) for g in groups.values() for m in g['meshes']])
        share, n, sd = M.read(q, k)
        check(said.get('id') == M.fingerprint(k) and share == 1.0, f"read with this machine's key, {100 * share:.2f} % of her {n:,} different corners carry the mark")
    else:
        print("      (no key on this machine: the mark is said by the file, not read)")
    hidden = [m for g in groups.values() for m in g['meshes'] if header['materials'][m['material']].get('hidden')]
    check(len(hidden) >= 4, f"the studio's name and signs lie in her plating in {len(hidden)} meshes the page never draws")
    tri = sum(m['triangles'] for m in hull)
    total = sum(m['triangles'] for g in groups.values() for m in g['meshes'])
    size = os.path.getsize(a.file)
    # No budget. The owner, 11 November 2026, standing on her bridge wing: "This low quality of detail is not acceptable I
    # can't even see what I'm looking at , don't use triangle budgets , this vessel becomes its own world when we are on it,
    # so it needs to be as detailed as possible" (JSY-STD-404). What she weighs is said, not limited: how a phone fetches and
    # draws it is for the page to solve, not for the drawing to pay for.
    check(tri > 80000, f'the hull has {tri:,} triangles (no upper limit)')
    print(f'      the file is {size / 1e6:.2f} MB with {total:,} triangles (said, not limited: JSY-STD-404)')
    # ---- Her own pictures and her register travel with the model.
    here = os.path.dirname(os.path.abspath(a.file))
    sheets = header.get('atlases', [])
    check(len(sheets) == 1 and all(os.path.exists(os.path.join(here, s['file'])) for s in sheets), 'her one sheet of pictures is named and is there')
    used = {header['materials'][m['material']].get('atlas', 0) for g in groups.values() for m in g['meshes'] if header['materials'][m['material']].get('textured')}
    check(used == {0}, 'her own sheet is drawn from')
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

    # ---- Her rooms: the spaces of the general arrangement, each once, each inside the model.
    listed = [sp['id'] for g in header['views'][0]['groups'] for sp in g['spaces']]
    check(sorted(listed) == sorted(sp['id'] for sp in ga.SPACES), f'the page lists the {len(ga.SPACES)} spaces of the general arrangement, each once ({len(listed)} listed)')
    lo, hi = np.array(header['bounds']['min']) - 0.05, np.array(header['bounds']['max']) + 0.05
    out = [sp['id'] for g in header['views'][0]['groups'] for sp in g['spaces'] if not ((np.array(sp['min']) >= lo).all() and (np.array(sp['max']) <= hi).all())]
    check(not out, f'every room\'s box lies within the model ({", ".join(out) or "all"})')
    check(len(header.get('stairs', [])) == len(S.STAIRS), f"the model carries her {len(S.STAIRS)} stairs as the yard's standard has them ({len(header.get('stairs', []))})")

    # ---- Her lines.
    wrong = ga.check() + ga.check_lines()
    check(not wrong, f'the general arrangement (revision {ga.REVISION}) holds and agrees with her lines ({"; ".join(wrong) or "all"})')
    # ---- Her outfit's places (spec.OUTFIT): each on a deck of hers, inside her, no two in each other's way; every doorway listed.
    wrong = S.outfit_wrong()
    check(not wrong, f'the {len(S.OUTFIT)} places of her deck fittings are each on clear deck inside her ({"; ".join(wrong[:6]) or "all"})')
    check(len(header.get('doorways', [])) > 50, f"the model lists her doorways for the check that walks them ({len(header.get('doorways', []))})")
    v = L.displacement()
    check(abs(v * 1.025 - ga.DISPLACEMENT) < 0.01 * ga.DISPLACEMENT, f'her lines displace {v * 1.025:,.0f} t at {L.DRAFT} m (the arrangement: about {ga.DISPLACEMENT:,} t)')
    check(abs(L.half_breadth(0) * 2 - ga.BEAM) < 1e-9 and abs(L.keel_y(0) + ga.DRAFT) < 1e-9 and abs(L.above_keel(L.MAIN) - ga.DECKS['main']) < 1e-9
          and abs(L.above_keel(L.UPPER) - ga.DECKS['upper']) < 1e-9 and abs(L.LENGTH - ga.LENGTH) < 1e-9,
          f'length {L.LENGTH} m, beam {L.BEAM} m, draught {L.DRAFT} m, main deck {L.DEPTH} m and upper deck {L.above_keel(L.UPPER):.1f} m above the keel')
    # ---- Her decks stand where the arrangement has them: each deck's rooms on the level it names.
    levels = header['ship'].get('decks', {})
    check(all(abs(levels.get(k, 1e9) - L.Y(v)) < 1e-3 for k, v in ga.DECKS.items()), f'the model says her decks as the arrangement has them ({len(ga.DECKS)} levels)')
    check(abs(header['ship']['length'] - L.LENGTH) < 1e-9 and all(os.path.exists(os.path.join(here, f)) for f in ('systems.json',)), 'the model says the same length')
    # ---- The arrangement beside the model, which the page's deck plan is drawn from (map.js), is the arrangement as it stands.
    plans = os.path.join(here, 'plans.json')
    same = os.path.exists(plans) and json.load(open(plans)) == json.loads(json.dumps(ga.plans()))
    rooms = {s['id'] for g in header['views'][0]['groups'] for s in g['spaces']}
    drawn = {s['id'] for p in ga.plans()['plans'] for s in p['spaces']}
    check(same and rooms == drawn, f"the arrangement beside the model (plans.json) is revision {ga.REVISION} as it stands, and holds each of her {len(rooms)} rooms"
          + ('' if same else ': it is not there or is another arrangement; write it with ga.py --plans'))

    # ---- Structure inside the shell. Plates and the inner face are drawn in primer (roughness 0.74).
    primer = [m for m in hull if abs(header['materials'][m['material']]['roughness'] - 0.74) < 1e-6]
    check(len(primer) >= 2, 'the hull has its inner face and its plates in primer')
    for m in primer:
        mat = header['materials'][m['material']]
        pos = positions(header, block, m)
        out = outside(pos, 0.001)
        # The stern tubes pass out through the shell inside their bossings: 0.5 m round each shaft line is theirs.
        tubes = (np.abs(np.abs(pos[:, 0]) - S.SHAFT_X) < 0.5) & (pos[:, 2] < L.Z(S.STERN_TUBE_SEAL + 0.3))
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
        mid = mid[(np.abs(mid[:, 2]) < L.HALF - 0.02) & (mid[:, 1] < L.MAIN - 0.05) & (mid[:, 2] < L.Z(L.FOREFOOT))]
        # Not the stern tubes (they pass out through the shell) nor the tunnel (it is the opening).
        mid = mid[~((np.abs(np.abs(mid[:, 0]) - S.SHAFT_X) < 0.5) & (mid[:, 2] < L.Z(S.STERN_TUBE_SEAL + 0.3)))]
        mid = mid[np.hypot(mid[:, 1] - S.THRUSTER['y'], mid[:, 2] - L.Z(S.THRUSTER['yard'])) > S.THRUSTER['radius'] + 0.15]
        thin = 0
        for x, y, z in mid[::3]:
            across = L.hull_x(float(y), float(z)) - abs(x)
            hy = L.hull_y(float(x), float(z))
            up = (y - hy) if hy is not None else -1.0
            if max(across, up) < 0.005:
                thin += 1
        check(thin == 0, f'the inner face of the plating: {thin} of {len(mid[::3])} sampled triangles come within 5 mm of the moulded surface')

    # ---- The machinery spaces inside the shell.
    worst, bad, count = 0.0, 0, 0
    for m in groups['machinery']['meshes']:
        pos = positions(header, block, m)
        out = outside(pos[pos[:, 1] < L.MAIN - 0.05], 0.002)
        count += len(pos)
        bad += int((out > 0).sum())
        worst = max(worst, float(out.max()) if len(out) else 0.0)
    check(bad == 0, f'the machinery spaces: {bad} of {count} points outside the shell' + (f' (worst {worst * 1000:.0f} mm)' if bad else ''))

    print(f'{len(failures)} failed' if failures else 'all checks passed')
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
