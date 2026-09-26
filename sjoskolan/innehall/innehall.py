#!/usr/bin/env python3
"""Sjöskolans gemensamma övningsdatabas: kommandon.

    python3 sjoskolan/innehall/innehall.py validera              schema, referenser, revisioner, beräkningar
    python3 sjoskolan/innehall/innehall.py bygg [exportörer …]   SQLite och alla genererade filer (eller bara de angivna)
    python3 sjoskolan/innehall/innehall.py kontrollera           genererade filer inaktuella? (CI)
    python3 sjoskolan/innehall/innehall.py rapport               ofullständiga poster, trasiga referenser, versionskrockar
    python3 sjoskolan/innehall/innehall.py anvands EL-000123     var en övning visas
    python3 sjoskolan/innehall/innehall.py hitta v41_02-q3       id för ett gammalt ankare, alias eller sparat id
    python3 sjoskolan/innehall/innehall.py visa EL-000123        posten som JSON (med skyddade fält om lösenordet finns)
    python3 sjoskolan/innehall/innehall.py revidera EL-000123 …  höj revisionen efter en innehållsändring (--alla: alla ändrade)
    python3 sjoskolan/innehall/innehall.py skyddat packa-upp     dekryptera skyddade filer till innehall/.skyddat/ för redigering
    python3 sjoskolan/innehall/innehall.py skyddat packa         kryptera tillbaka och ta bort arbetskopiorna

Lösenord: LARARLOSEN (lärarfält) och BOKLOSEN (bokens fält). Utan dem byggs och kontrolleras bara det publika.
Tunga exportörer (presentationer, bok) körs bara när de anges uttryckligen: bygg presentationer, bygg bok.
"""
import argparse
import importlib
import json
import os
import sys
from pathlib import Path

ROT = Path(__file__).resolve().parent
sys.path[:0] = [str(ROT / 'lib'), str(ROT / 'export')]
import katalog as K  # noqa: E402
import db  # noqa: E402
from atkomst import Atkomst, Atkomstfel  # noqa: E402

SJO = ROT.parent
BUILD = ROT / 'build'
UTGAVA = ROT / 'utgava.json'
# Exportörer i körordning. Lätta körs alltid; tunga bara på begäran (de kräver LibreOffice, python-pptx, boken …).
LATTA = ['kurssidor', 'simulatorer', 'arbetsblad', 'inlamning', 'tentamen', 'idregister']
TUNGA = ['presentationer', 'larare', 'bok']


def katalog_eller_avbryt(kontrollera=True):
    try:
        kat = K.Katalog()
    except K.Katalogfel as e:
        raise SystemExit(f'fel: {e}')
    if kontrollera and not kat.kontrollera():
        for f in kat.fel:
            print('FEL', f)
        raise SystemExit(f'{len(kat.fel)} fel. Rätta källorna och kör igen.')
    return kat


def bygg_db(kat):
    fil = BUILD / 'innehall.sqlite'
    if fil.exists():
        fil.unlink()
    return db.bygg(kat, fil)


def exportor(namn):
    return importlib.import_module(namn)


def generera(con, namn):
    """Kör en exportör. Returnerar {sökväg relativt sjoskolan/: innehåll} eller None om publiken saknas."""
    mod = exportor(namn)
    try:
        a = Atkomst(con, mod.PUBLIK)
    except Atkomstfel as e:
        print(f'  hoppar över {namn}: {e}')
        return None
    return mod.filer(a)


def las_utgava():
    return json.loads(UTGAVA.read_text(encoding='utf-8')) if UTGAVA.exists() else {'schema_version': K.SCHEMA_VERSION, 'utdata': {}}


def skriv_utgava(u):
    UTGAVA.write_text(json.dumps(u, ensure_ascii=False, indent=2, sort_keys=True) + '\n', encoding='utf-8')


def cmd_validera(a):
    kat = katalog_eller_avbryt(kontrollera=False)
    ok = kat.kontrollera()
    for f in kat.fel:
        print('FEL', f)
    for v in kat.varningar:
        print('obs', v)
    print(f'{len(kat.poster)} poster, {sum(len(y["placeringar"]) for y in kat.ytor.values())} placeringar, {len(kat.fel)} fel, {len(kat.varningar)} anmärkningar')
    return 0 if ok else 1


def cmd_bygg(a):
    kat = katalog_eller_avbryt()
    con = bygg_db(kat)
    namn = a.exportorer or LATTA
    utg = las_utgava()
    utg['schema_version'] = K.SCHEMA_VERSION
    for n in namn:
        if n not in LATTA + TUNGA:
            raise SystemExit(f'okänd exportör {n}')
        mod = exportor(n)
        if hasattr(mod, 'bygg'):  # tunga exportörer skriver själva (binära filer)
            try:
                res = mod.bygg(Atkomst(con, mod.PUBLIK), kat)
            except Atkomstfel as e:
                print(f'  hoppar över {n}: {e}')
                continue
            utg['utdata'][n] = res
            print(f'{n}: {res.get("sammanfattning", "klar")}')
            continue
        filer = generera(con, n)
        if filer is None:
            continue
        andrade = 0
        for rel, innehall in sorted(filer.items()):
            f = SJO / rel
            data = innehall.encode('utf-8') if isinstance(innehall, str) else innehall
            if not f.exists() or f.read_bytes() != data:
                f.parent.mkdir(parents=True, exist_ok=True)
                f.write_bytes(data)
                andrade += 1
        print(f'{n}: {len(filer)} filer, {andrade} ändrade')
    utg['fingeravtryck_publikt'] = kat.fingeravtryck(bara_publikt=True)
    skriv_utgava(utg)
    return 0


def cmd_kontrollera(a):
    """Bygger allt i minnet och jämför med filerna. Avslutar med fel om något är inaktuellt (CI-grind)."""
    kat = katalog_eller_avbryt()
    con = bygg_db(kat)
    inaktuella = []
    for n in LATTA:
        filer = generera(con, n)
        for rel, innehall in sorted((filer or {}).items()):
            f = SJO / rel
            data = innehall.encode('utf-8') if isinstance(innehall, str) else innehall
            if not f.exists() or f.read_bytes() != data:
                inaktuella.append(rel)
    for f in inaktuella:
        print('INAKTUELL', f)
    brister = rapport(kat, con, tyst=True)
    for b in brister['fel']:
        print('FEL', b)
    if inaktuella or brister['fel']:
        print('Kör: python3 sjoskolan/innehall/innehall.py bygg')
        return 1
    print(f'Alla genererade filer är aktuella ({len(kat.poster)} poster).')
    return 0


def rapport(kat, con, tyst=False):
    ut = {'fel': [], 'obs': []}
    utg = las_utgava()
    # Versionskrockar: tunga utdata byggda med en äldre revision av en övning.
    for n, res in utg.get('utdata', {}).items():
        for i, rev in (res.get('revisioner') or {}).items():
            p = kat.poster.get(i)
            reg = kat.register['poster'].get(i, {})
            nu = p['revision'] if p else reg.get('revision')
            if nu is not None and nu != rev:
                ut['obs' if n in TUNGA else 'fel'].append(f'{n} är byggd med {i} revision {rev}, men posten har revision {nu} (kör innehall.py bygg {n})')
    if utg.get('schema_version') != K.SCHEMA_VERSION:
        ut['fel'].append(f'utgava.json har schemaversion {utg.get("schema_version")}, katalogen {K.SCHEMA_VERSION}')
    for i, p in kat.poster.items():
        saknas = []
        if not p.get('ledtradar') and p['typ'] in ('berakning', 'resonemang'):
            saknas.append('ledtrådar')
        if p['typ'] in ('berakning', 'resonemang') and (p.get('losning') or {}).get('status') == 'saknas':
            saknas.append('lösning')
        if p['typ'] == 'berakning' and not (p.get('losning') or {}).get('svar'):
            saknas.append('strukturerat svar')
        if not kat.anvands(i):
            saknas.append('placering')
        if saknas:
            ut['obs'].append(f'{i} ({p["titel"]}): saknar {", ".join(saknas)}')
    if not tyst:
        for k in ('fel', 'obs'):
            for x in ut[k]:
                print(k.upper(), x)
    return ut


def cmd_rapport(a):
    kat = katalog_eller_avbryt(kontrollera=False)
    kat.kontrollera()
    for f in kat.fel:
        print('FEL', f)
    for v in kat.varningar:
        print('OBS', v)
    con = bygg_db(kat) if not kat.fel else None
    r = rapport(kat, con) if con else {'fel': [], 'obs': []}
    print(f'{len(kat.fel) + len(r["fel"])} fel, {len(kat.varningar) + len(r["obs"])} anmärkningar')
    return 1 if kat.fel or r['fel'] else 0


def cmd_anvands(a):
    kat = katalog_eller_avbryt(kontrollera=False)
    for i in a.id:
        p = kat.poster.get(i)
        reg = kat.register['poster'].get(i)
        if p is None and reg is None:
            print(f'{i}: okänd')
            continue
        print(f'{i} · {p["titel"] if p else "(skyddad, lösenord saknas)"} · revision {(p or reg)["revision"]} · publik {p["referenser"]["publik"] if p else reg["skydd"]}')
        for yta, pl in kat.anvands(i):
            extra = ''.join(f' {k}={pl[k]}' for k in ('ankare', 'bild', 'stodbild', 'roll') if pl.get(k))
            print(f'  {yta}: {pl["plats"]} · {pl.get("del", "")} · {pl.get("nummer", "")}{extra}')
    return 0


def cmd_hitta(a):
    kat = katalog_eller_avbryt(kontrollera=False)
    tr = kat.hitta(a.nyckel)
    for i, yta in tr:
        print(i, yta or '')
    return 0 if tr else 1


def cmd_visa(a):
    kat = katalog_eller_avbryt(kontrollera=False)
    p = kat.poster.get(a.id)
    if p is None:
        raise SystemExit(f'{a.id}: okänd eller skyddad (lösenord saknas)')
    print(json.dumps(p, ensure_ascii=False, indent=2))
    return 0


def cmd_revidera(a):
    kat = katalog_eller_avbryt(kontrollera=False)
    reg = kat.register
    ids = a.id
    if a.alla:
        ids = [i for i, p in kat.poster.items() if i not in reg['poster'] or reg['poster'][i].get('hash') != K.hash_av(p)
               or (i in kat.publika and reg['poster'][i].get('hash_publik') != K.hash_av(kat.publika[i]))]
    if not kat.fullstandig:
        print('obs: skyddade filer är inte öppnade. Bara publika ändringar kan registreras.')
    for i in ids:
        p = kat.poster.get(i)
        if p is None:
            raise SystemExit(f'{i}: okänd')
        gammal = reg['poster'].get(i)
        if gammal and gammal.get('revision') == p['revision']:
            p['revision'] += 1
            if i in kat.publika:
                kat.publika[i]['revision'] = p['revision']
        ny = {'revision': p['revision'], 'skydd': p['referenser']['publik'], 'hash': K.hash_av(p) if kat.fullstandig or i not in kat.publika else (gammal or {}).get('hash'),
              'hash_publik': K.hash_av(kat.publika[i]) if i in kat.publika else None}
        reg['poster'][i] = ny
        if i in kat.publika:
            (ROT / 'ovningar' / f'{i}.json').write_text(json.dumps(kat.publika[i], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        else:
            skydd = p['referenser']['publik']
            kat.skyddat[skydd]['poster'][i]['revision'] = p['revision']
            _spara_skyddat(kat, skydd)
        print(f'{i}: revision {p["revision"]}')
    (ROT / 'id-register.json').write_text(json.dumps(reg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return 0


def _spara_skyddat(kat, skydd):
    ark = K.ARBETSKOPIA / f'{skydd}.json'
    data = json.dumps(kat.skyddat[skydd], ensure_ascii=False, sort_keys=True, indent=1)
    if ark.exists():
        ark.write_text(data, encoding='utf-8')
    else:
        import krypto
        krypto.kryptera(data.encode(), ROT / 'skyddat' / f'{skydd}.enc', os.environ[K.SKYDD[skydd]])


def cmd_skyddat(a):
    import krypto
    for skydd, env in K.SKYDD.items():
        losen = os.environ.get(env)
        if not losen:
            print(f'{skydd}: {env} saknas, hoppar över')
            continue
        enc, ark = ROT / 'skyddat' / f'{skydd}.enc', K.ARBETSKOPIA / f'{skydd}.json'
        if a.atgard == 'packa-upp':
            K.ARBETSKOPIA.mkdir(exist_ok=True)
            data = json.loads(krypto.dekryptera(enc, losen))
            ark.write_text(json.dumps(data, ensure_ascii=False, sort_keys=True, indent=1), encoding='utf-8')
            print(f'{skydd}: {ark} (ligger i .gitignore; kör "skyddat packa" när du är klar)')
        elif ark.exists():
            data = json.loads(ark.read_text(encoding='utf-8'))
            skrev = krypto.kryptera(json.dumps(data, ensure_ascii=False, sort_keys=True).encode(), enc, losen)
            ark.unlink()
            print(f'{skydd}: {"krypterad" if skrev else "oförändrad"}')
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('validera')
    b = sub.add_parser('bygg')
    b.add_argument('exportorer', nargs='*')
    sub.add_parser('kontrollera')
    sub.add_parser('rapport')
    x = sub.add_parser('anvands')
    x.add_argument('id', nargs='+')
    x = sub.add_parser('hitta')
    x.add_argument('nyckel')
    x = sub.add_parser('visa')
    x.add_argument('id')
    x = sub.add_parser('revidera')
    x.add_argument('id', nargs='*')
    x.add_argument('--alla', action='store_true')
    x = sub.add_parser('skyddat')
    x.add_argument('atgard', choices=['packa-upp', 'packa'])
    a = ap.parse_args()
    return globals()[f'cmd_{a.cmd.replace("-", "_")}'](a)


if __name__ == '__main__':
    sys.exit(main())
