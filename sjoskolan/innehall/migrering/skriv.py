"""Skriver migreringens resultat: publika poster, skyddade filer, placeringar, teori, id-register och loggar."""
import json
import os
import sys
from pathlib import Path

HAR = Path(__file__).resolve().parent
sys.path[:0] = [str(HAR.parent / 'lib')]
import katalog as K  # noqa: E402
import krypto  # noqa: E402

ROT = HAR.parent
YTOR = {
    'bok': ('Boken Elteknik och ellära för sjöfart och industri', 'bok', 'bok', 'Kapitelövningarna i bokens ordning (EPUB, krypterad).'),
    'kurs-formelstod': ('Formelstöd och övningar', 'elev', 'kurssidor', 'Övningarna under varje kapitel på veckans sida Formelstöd och övningar.'),
    'presentation': ('Presentationer', 'elev', 'presentationer', 'Bilderna Stöd till övning N och Övning N i veckornas presentationer.'),
}


def dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2) + '\n'


def skriv_allt(poster, ytor, teori, konflikter, inventering, numerik, ytinfo=None):
    ytinfo = {**YTOR, **(ytinfo or {})}
    (ROT / 'ovningar').mkdir(exist_ok=True)
    for f in (ROT / 'ovningar').glob('EL-*.json'):
        f.unlink()
    skyddat = {s: {'format': 1, 'skydd': s, 'poster': {}, 'falt': {}} for s in K.SKYDD}
    register = {'beskrivning': 'Genereras av innehall.py. Redigera inte för hand.', 'poster': {}}
    for i, p in sorted(poster.items()):
        pub, sk = K.dela_skyddat(p)
        if pub is not None:
            (ROT / 'ovningar' / f'{i}.json').write_text(dump(pub), encoding='utf-8')
            for s, d in sk.items():
                skyddat[s]['falt'][i] = d
        else:
            for s, d in sk.items():
                skyddat[s]['poster'][i] = d
        register['poster'][i] = {'revision': p['revision'], 'skydd': p['referenser']['publik'], 'hash': K.hash_av(p),
                                 'hash_publik': K.hash_av(pub) if pub is not None else None}
    (ROT / 'id-register.json').write_text(dump(register), encoding='utf-8')
    for s, d in skyddat.items():
        losen = os.environ.get(K.SKYDD[s])
        if not losen:
            raise SystemExit(f'{K.SKYDD[s]} saknas: {s}.enc kan inte skrivas')
        (ROT / 'skyddat').mkdir(exist_ok=True)
        krypto.kryptera(json.dumps(d, ensure_ascii=False, sort_keys=True).encode(), ROT / 'skyddat' / f'{s}.enc', losen)
    (ROT / 'placeringar').mkdir(exist_ok=True)
    for f in (ROT / 'placeringar').glob('*.json'):
        f.unlink()
    for namn, pl in sorted(ytor.items()):
        titel, publik, exportor, besk = ytinfo[namn]
        pl = sorted(pl, key=lambda x: (x['plats'], x.get('del') or '', x.get('roll') or '', x['ordning']))
        (ROT / 'placeringar' / f'{namn}.json').write_text(dump({'yta': namn, 'titel': titel, 'beskrivning': besk, 'publik': publik, 'exportor': exportor, 'placeringar': pl}), encoding='utf-8')
    (ROT / 'teori.json').write_text(dump(teori), encoding='utf-8')
    m = HAR
    (m / 'konflikter.json').write_text(dump(konflikter), encoding='utf-8')
    (m / 'inventering.json').write_text(dump(inventering), encoding='utf-8')
    (m / 'numerik.json').write_text(dump(numerik), encoding='utf-8')
    publika = sum(1 for p in poster.values() if p['referenser']['publik'] == 'elev')
    print(f'{len(poster)} poster ({publika} publika), {sum(len(v) for v in ytor.values())} placeringar på {len(ytor)} ytor, {len(konflikter)} loggade beslut')
