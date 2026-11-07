#!/usr/bin/env python3
"""Låsta veckor: en vecka som är klar ändras inte av misstag.

Låset är en lista med SHA-256 för varje fil som hör till veckan (verktyg/las/vecka-NN.json). `kontrollera` körs i CI
och av `innehall.py kontrollera` och stoppar om en låst fil har ändrats, tagits bort eller om en ny fil har lagts till
i en låst mapp. Ändringar i en låst vecka görs bara efter ett uttryckligt beslut: lås upp, ändra, lås igen.

    python3 sjoskolan/verktyg/las/veckolas.py kontrollera
    python3 sjoskolan/verktyg/las/veckolas.py las 40         skapa eller förnya låset (efter ett beslut)
    python3 sjoskolan/verktyg/las/veckolas.py las-upp 40     ta bort låset (efter ett beslut)
"""
import hashlib
import json
import sys
from pathlib import Path
from beroenden import beroenden

SJO = Path(__file__).resolve().parents[2]
HAR = Path(__file__).resolve().parent

# Vad som hör till en vecka. Mönster relativt sjoskolan/. Vecka 40 omfattar även frånskiljningen (vecka 38-materialet),
# som undervisas måndag vecka 40.
OMFANG = {
    '40': ['vecka-40/**/*', 'bildspel/v40_*/**/*', 'larare/filer/v40_*', 'larare/filer/Mandag_28_sep_vecka40_*',
           'larare/vecka-40.html', 'larare/vecka-38.html', 'vecka-38/aktuell/v38_01_*', 'vecka-38/aktuell/figurer/*',
           'bildspel/v38_01_*/**/*'],
}

# Labbens körningsgraf, inte vaxelstromslabbet/**/* eller gemensamt/**/*.
# Resultatkoden och lärarstödet använder labbens uppgifter/beräkningar även utan
# labbsidan. Ta därför med deras ingångar, också om labbets importer ändras.
STARTFILER = {
    '40': ['vaxelstromslabbet/index.html', 'vecka-40/aktuell/resultat.mjs',
           'vecka-40/aktuell/lararstod.mjs'],
}


def filer(vecka):
    ut = set()
    for m in OMFANG[vecka]:
        ut |= {p for p in SJO.glob(m) if p.is_file() and '__pycache__' not in p.parts and p.name != '.DS_Store'}
    ut |= beroenden(SJO, STARTFILER.get(vecka, []))
    return sorted(ut)


def summa(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def las(vecka):
    data = {str(p.relative_to(SJO)): summa(p) for p in filer(vecka)}
    (HAR / f'vecka-{vecka}.json').write_text(json.dumps({
        'vecka': vecka, 'omfang': OMFANG[vecka],
        'startfiler': STARTFILER.get(vecka, []), 'filer': data,
    }, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'vecka {vecka} låst: {len(data)} filer')


def kontrollera():
    fel = []
    for lasfil in sorted(HAR.glob('vecka-*.json')):
        d = json.loads(lasfil.read_text())
        v = d['vecka']
        if v not in OMFANG:
            fel.append(f'vecka {v}: låsets omfattning saknas')
            continue
        if d.get('omfang') != OMFANG[v] or d.get('startfiler', []) != STARTFILER.get(v, []):
            fel.append(f'vecka {v}: låsets omfattning/startfiler stämmer inte med verktyget')
        try:
            nu = {str(p.relative_to(SJO)): p for p in filer(v)}
        except (ValueError, OSError) as e:
            fel.append(f'vecka {v}: {e}')
            continue
        for rel, s in d['filer'].items():
            p = SJO / rel
            if not p.is_file():
                fel.append(f'vecka {v} är låst: {rel} har tagits bort')
            elif summa(p) != s:
                fel.append(f'vecka {v} är låst: {rel} har ändrats')
        for rel in sorted(set(nu) - set(d['filer'])):
            fel.append(f'vecka {v} är låst: {rel} är ny')
        for rel in sorted(set(d['filer']) - set(nu)):
            fel.append(f'vecka {v}: {rel} ingår inte längre i omfattningen/beroendena')
    for f in fel[:40]:
        print('FEL', f)
    if fel:
        print(f'{len(fel)} ändringar i låsta veckor. Återställ filerna, eller lås upp veckan efter ett beslut (veckolas.py las-upp NN).')
        return 1
    print('låsta veckor: oförändrade (' + ', '.join(json.loads(f.read_text())['vecka'] for f in sorted(HAR.glob('vecka-*.json'))) + ')')
    return 0


if __name__ == '__main__':
    kmd = sys.argv[1] if len(sys.argv) > 1 else 'kontrollera'
    if kmd == 'las':
        las(sys.argv[2])
    elif kmd == 'las-upp':
        (HAR / f'vecka-{sys.argv[2]}.json').unlink()
        print(f'vecka {sys.argv[2]} upplåst')
    else:
        sys.exit(kontrollera())
