"""Lärarmaterial: lärarguidens facittabeller ur databasen, krypterade till sjoskolan/gemensamt/Lararguide.html.

Sidans mall (upplägg, missuppfattningar, bedömning) är klartextfilen LARARGUIDE_KLARTEXT utanför repot.
Facitraderna kommer ur posternas lärarfält (larare.facit_rader) och de registrerade D-funktionerna räknas här för
D = 1…31, så att sidan inte innehåller körbar facitkod. Sidan låses med verktyg/larare/las.mjs (LARARLOSEN).

Tung exportör: `LARARLOSEN=… LARARGUIDE_KLARTEXT=… innehall.py bygg larare`. Krypteringen är inte deterministisk,
därför sparas klartextens hash i utgava.json och kontrolleras i stället för filens byte.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'lib'))
import berakningar as B
import rendera as R

PUBLIK = 'larare'
YTA = 'inlamning'
UT = R.SJO / 'gemensamt' / 'Lararguide.html'


def facittabell(a, vecka):
    rader = []
    for pl, p in a.placeringar(YTA, f'vecka-{vecka}/aktuell/Inlamning.html'):
        n = pl['ordning']
        for rad in (p.get('larare') or {}).get('facit_rader', []):
            if rad.get('funktion'):
                fn = B.LARARFACIT[rad['funktion']]
                tab = json.dumps({str(D): fn(D) for D in range(1, 32)}, ensure_ascii=False)
                cell = f'<td data-facit=\'{R.attr(tab)}\'></td>'
            else:
                cell = f'<td>{R.h(rad["text"])}</td>'
            rader.append(f'<tr data-ovning="{p["id"]}"><td>{R.h(rad["etikett"])}</td>{cell}</tr>')
    return '\n'.join(rader)


def klartext(a):
    mall = os.environ.get('LARARGUIDE_KLARTEXT')
    if not mall or not Path(mall).exists():
        raise SystemExit('LARARGUIDE_KLARTEXT saknas (klartextmallen för lärarguiden ligger utanför repot)')
    s = Path(mall).read_text(encoding='utf-8')
    for v in re.findall(r'<section class="week" id="v(\d\d)">', s):
        s = re.sub(r'(<section class="week" id="v%s">.*?<table class="ans"><tbody>)(.*?)(</tbody>)' % v,
                   lambda m: m.group(1) + '\n<!-- innehall:start facit-v%s · genererat ur sjoskolan/innehall, redigera inte här -->\n' % v + facittabell(a, int(v)) + '\n<!-- innehall:slut facit-v%s -->\n' % v + m.group(3),
                   s, count=1, flags=re.S)
    # Facitkoden ersätts av en tabellslagning: värdena är förberäknade per D.
    s = re.sub(r"  const F = \{.*?\n  \};\n", "  const F = {};\n", s, count=1, flags=re.S)
    s = s.replace("document.querySelectorAll('[data-f]').forEach((el) => { el.textContent = F[el.dataset.f](D); });",
                  "document.querySelectorAll('[data-facit]').forEach((el) => { el.textContent = JSON.parse(el.dataset.facit)[String(D)] || ''; });")
    return s


def bygg(a, kat):
    s = klartext(a)
    h = hashlib.sha256(s.encode()).hexdigest()[:16]
    losen = os.environ.get('LARARLOSEN')
    if not losen:
        raise SystemExit('LARARLOSEN saknas')
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as t:
        t.write(s)
    try:
        subprocess.run(['node', str(R.SJO / 'verktyg' / 'larare' / 'las.mjs'), 'lock', t.name, str(UT)], env={**os.environ, 'LARARLOSEN': losen}, check=True, capture_output=True)
    finally:
        os.unlink(t.name)
    rev = {p['id']: p['revision'] for plats in a.platser(YTA) for _, p in a.placeringar(YTA, plats)}
    return {'sammanfattning': f'Lararguide.html låst, klartext {h}', 'klartext_hash': h, 'revisioner': rev}
