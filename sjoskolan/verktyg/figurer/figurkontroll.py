#!/usr/bin/env python3
"""Talen i en övningsfigur ska stå i övningen. En figur som ritades till en äldre version av uppgiften (övning 1.4 i
vecka 41 visade U_F = 120 V när uppgiften sa 230 V) fångas här: varje tal i figurens beskrivning (spec4N.json)
ska finnas i texten på övningens bild. Övningar som bygger på föregående övning undantas.

    python3 sjoskolan/verktyg/figurer/figurkontroll.py        skriver avvikelserna, slutkod 1 om någon finns
"""
import json
import re
import sys
from pathlib import Path

SJO = Path(__file__).resolve().parents[2]


def tal(s):
    s = re.sub(r'(\d)[  ](\d{3})\b', r'\1\2', s.replace(' ', ' '))
    return {x.replace('.', ',').rstrip('0').rstrip(',') if re.search(r'[.,]', x) else x
            for x in re.findall(r'(?<![\d,.])\d+(?:[.,]\d+)?', s)}


def avvikelser():
    from pptx import Presentation
    ut = []
    # spec40.json gäller en äldre utgåva av vecka 40:s presentationer (bildnumren stämmer inte längre), därför 41 och framåt.
    for spec in sorted((SJO / 'verktyg' / 'figurer').glob('spec4[1-9].json')):
        for deck, info in json.loads(spec.read_text(encoding='utf-8')).items():
            fil = SJO.parent / info['src']
            if not fil.exists():
                continue
            bilder = Presentation(fil).slides
            for n, (typ, namn, beskrivning) in info['slides'].items():
                if typ != 'ovn' or int(n) > len(bilder):
                    continue
                text = ' '.join(sh.text_frame.text for sh in bilder[int(n) - 1].shapes if sh.has_text_frame)
                if 'föregående' in text:
                    continue
                saknas = sorted(x for x in tal(beskrivning) - tal(text) if not re.fullmatch(r'[0-3]', x))
                if saknas:
                    ut.append(f'{deck} bild {n} ({namn}): talen {", ".join(saknas)} i figuren står inte i övningen')
    return ut


if __name__ == '__main__':
    fel = avvikelser()
    print('\n'.join(fel) or 'figurerna stämmer med övningarna')
    sys.exit(1 if fel else 0)
