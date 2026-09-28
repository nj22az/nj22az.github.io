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

SJO = Path(__file__).resolve().parents[2]
HAR = Path(__file__).resolve().parent

# Vad som hör till en vecka. Mönster relativt sjoskolan/. Vecka 40 omfattar även frånskiljningen (vecka 38-materialet),
# som undervisas måndag vecka 40.
OMFANG = {
    '40': ['vecka-40/**/*', 'bildspel/v40_*/**/*', 'larare/filer/v40_*', 'larare/filer/Mandag_28_sep_vecka40_*',
           'larare/vecka-40.html', 'larare/vecka-38.html', 'vecka-38/aktuell/v38_01_*', 'vecka-38/aktuell/figurer/*',
           'bildspel/v38_01_*/**/*'],
}


def filer(vecka):
    ut = set()
    for m in OMFANG[vecka]:
        ut |= {p for p in SJO.glob(m) if p.is_file() and '__pycache__' not in p.parts and p.name != '.DS_Store'}
    return sorted(ut)


def summa(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def las(vecka):
    data = {str(p.relative_to(SJO)): summa(p) for p in filer(vecka)}
    (HAR / f'vecka-{vecka}.json').write_text(json.dumps({'vecka': vecka, 'omfang': OMFANG[vecka], 'filer': data}, ensure_ascii=False, indent=1) + '\n')
    print(f'vecka {vecka} låst: {len(data)} filer')


def kontrollera():
    fel = []
    for lasfil in sorted(HAR.glob('vecka-*.json')):
        d = json.loads(lasfil.read_text())
        v = d['vecka']
        nu = {str(p.relative_to(SJO)): p for p in filer(v)} if v in OMFANG else {}
        for rel, s in d['filer'].items():
            p = SJO / rel
            if not p.exists():
                fel.append(f'vecka {v} är låst: {rel} har tagits bort')
            elif summa(p) != s:
                fel.append(f'vecka {v} är låst: {rel} har ändrats')
        for rel in sorted(set(nu) - set(d['filer'])):
            fel.append(f'vecka {v} är låst: {rel} är ny')
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
