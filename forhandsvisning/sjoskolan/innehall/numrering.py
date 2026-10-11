#!/usr/bin/env python3
"""Kursens numrering, vecka för vecka: Övning <del>.<nummer> och Inlämning <nummer>.

Varje vecka har delar i den ordning de görs. Övningarna numreras inom sin del (Övning 2.3 = del 2, övning 3), och
samma nummer står på webben, i presentationen, i facit och i QR-koden. Inlämningsuppgifterna numreras i en lista
per vecka. Vecka 40 börjar med frånskiljningen (del 1), växelströmmen är del 2–4, och inlämningen är 1–3
(frånskiljning) och 4–7 (växelström).

Registret är fältet ”nummer” i placeringarna (innehall/placeringar/*.json). Ankare och id ändras aldrig, så länkar,
avbockningar och QR-koder fortsätter att fungera.

    python3 sjoskolan/innehall/numrering.py            kontrollera (körs också av innehall.py kontrollera)
    python3 sjoskolan/innehall/numrering.py --skriv    skriv numren enligt reglerna
"""
import json
import re
import sys
from pathlib import Path

ROT = Path(__file__).resolve().parent
PLAC = ROT / 'placeringar'

# Delens nummer för övningssidornas och presentationernas kapitel (vXX_0N). Vecka 40: frånskiljningen är del 1.
FORSKJUTNING = {'40': 1}
# Arbetsbladens sidor: (del, första löpnummer). Fördjupningsfallen fortsätter efter elevuppgifterna 1.1–1.4.
ARBETSBLAD = {
    'vecka-37/aktuell/01A_Elens_grunder/Arbetsblad.html': (1, 1),
    'vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html': (2, 1),
    'vecka-38/aktuell/Elevuppgifter.html': (1, 1),
    'vecka-38/aktuell/Fordjupning_elev.html': (1, 5),
}
# Inlämningen: första numret per sida. Vecka 40 visar frånskiljningens tre uppgifter (vecka-38-sidan) som 1–3.
INLAMNING_START = {'vecka-40/aktuell/Inlamning.html': 4}
# Presentationsfrågor utan motsvarande övningssida: (del, första löpnummer).
PRES_FRAGOR = {'v39_03': (3, 1), 'v39_04': (2, 11)}


def las(yta):
    return json.loads((PLAC / f'{yta}.json').read_text(encoding='utf-8'))


def i_ordning(placeringar):
    """Löpnummer 1, 2, 3 … per (plats, del) i placeringens ordning."""
    grupper = {}
    for p in placeringar:
        grupper.setdefault((p.get('plats'), p.get('del')), []).append(p)
    lop = {}
    for g in grupper.values():
        for i, p in enumerate(sorted(g, key=lambda x: x.get('ordning', 0)), 1):
            lop[id(p)] = i
    return lop


def kapiteldel(del_):
    m = re.match(r'v(\d\d)_0(\d)$', del_ or '')
    return (m.group(1), int(m.group(2)) + FORSKJUTNING.get(m.group(1), 0)) if m else (None, None)


def onskat():
    """Önskat nummer per (yta, index i placeringslistan). None = lämna som det är."""
    ut = {}
    data = {y: las(y) for y in ('kurs-formelstod', 'presentation', 'arbetsblad', 'presentation-fragor', 'inlamning')}
    for yta in ('kurs-formelstod', 'presentation'):
        pl = data[yta]['placeringar']
        lop = i_ordning(pl)
        for i, p in enumerate(pl):
            _, d = kapiteldel(p['del'])
            if d:
                ut[(yta, i)] = f'Övning {d}.{lop[id(p)]}'
    ab = data['arbetsblad']['placeringar']
    lop = i_ordning([{**p, 'del': None} for p in ab])
    ab_nr = {}
    for i, p in enumerate(ab):
        d, start = ARBETSBLAD[p['plats']]
        n = start - 1 + sorted([x for x in ab if x['plats'] == p['plats']], key=lambda x: x.get('ordning', 0)).index(p) + 1
        fall = re.match(r'(?:Övning [\d.]+ · )?(Fall [A-Z])$', p['nummer'])
        ut[('arbetsblad', i)] = f'Övning {d}.{n}' + (f' · {fall.group(1)}' if fall else '')
        ab_nr[p['ovning']] = ut[('arbetsblad', i)]
    pf = data['presentation-fragor']['placeringar']
    lop = i_ordning(pf)
    for i, p in enumerate(pf):
        if p.get('roll') != 'ovning':
            continue
        if p['ovning'] in ab_nr:
            ut[('presentation-fragor', i)] = ab_nr[p['ovning']].split(' · ')[0]
        elif p['del'] in PRES_FRAGOR:
            d, start = PRES_FRAGOR[p['del']]
            ovn = [x for x in pf if x['del'] == p['del'] and x.get('roll') == 'ovning']
            ut[('presentation-fragor', i)] = f'Övning {d}.{start - 1 + sorted(ovn, key=lambda x: x.get("ordning", 0)).index(p) + 1}'
    inl = data['inlamning']['placeringar']
    for i, p in enumerate(inl):
        sida = sorted([x for x in inl if x['plats'] == p['plats']], key=lambda x: x.get('ordning', 0))
        ut[('inlamning', i)] = f'Inlämning {INLAMNING_START.get(p["plats"], 1) + sida.index(p)}'
    return data, ut


def main():
    skriv = '--skriv' in sys.argv
    data, ut = onskat()
    fel = []
    for (yta, i), nytt in ut.items():
        p = data[yta]['placeringar'][i]
        if p['nummer'] != nytt:
            fel.append(f'{yta}: {p["plats"].split("/")[-1]} {p["ovning"]} ”{p["nummer"]}” ska vara ”{nytt}”')
            p['nummer'] = nytt
    if skriv:
        for yta, d in data.items():
            f = PLAC / f'{yta}.json'
            gammal = f.read_text(encoding='utf-8')
            ny = json.dumps(d, ensure_ascii=False, indent=2) + ('\n' if gammal.endswith('\n') else '')
            if ny != gammal:
                f.write_text(ny, encoding='utf-8')
        print(f'numrering: {len(fel)} nummer skrivna')
        return 0
    for f in fel[:40]:
        print('FEL numrering', f)
    print(f'numrering: {len(fel)} avvikelser' if fel else 'numrering: alla nummer följer registret')
    return 1 if fel else 0


if __name__ == '__main__':
    sys.exit(main())
