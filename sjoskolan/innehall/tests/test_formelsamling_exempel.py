"""Formelsamlingens räknade exempel får inte vara en övnings uppgift (ANDRINGSLOGG.md, regel 56).

Formelsamlingen (verktyg/formelsamling/bygg.py) är hjälpmedel vid övningar, inlämningar, labbar och tentamen. Ett
exempel som räknar fram en övnings svar ur samma givna tal ger eleven svaret (regel 1 och 2). Testet jämför varje
exempel med alla poster: exemplets resultat (talen efter ”ger”, kolon eller sista likhetstecknet) får inte vara en
posts svar när exemplet också använder ett av postens givna tal. Nätets och kursens fasta värden (FASTA) räknas inte,
de står i formelsamlingens tabeller. Granskade sammanträffanden med en annan krets eller storhet står i GRANSKADE.

Kör: python3 -m unittest discover -s sjoskolan/innehall/tests -p 'test_*.py'
"""
import importlib.util
import json
import os
from pathlib import Path
import re
import unittest

ROT = Path(__file__).resolve().parents[1]  # sjoskolan/innehall
SJO = ROT.parent
KALLA = Path(os.environ.get('FORMELSAMLING_KALLA', SJO / 'verktyg' / 'formelsamling' / 'bygg.py'))

ENHET = r'(kΩ|MΩ|Ω|mA|µA|kA|A|mV|kV|V|kWh|kW|W|kVA|VA|kvar|var|Wh|Ah|Hz|ms|s|r/min|%|°|mH|µF|mm²)'
TAL = re.compile(r'(?<![\d,.])(\d{1,3}(?:[  ]\d{3})+|\d+)(?:,(\d+))?\s?' + ENHET + r'(?![\wÅÄÖåäö²])')
# Nätets och kursens fasta värden: nätspänningar och frekvenser, fasspänningen, periodtiden och tiden mellan faserna
# vid 50 och 60 Hz, synkront varvtal för fyra poler, provspänningen 500 V och riggarnas 12 och 24 V. De står i
# formelsamlingens tabeller (Rimlighetskontroll, Konstanter och nät) och i ordlistan och räknas som referensvärden.
FASTA = {(230.0, 'V'), (400.0, 'V'), (440.0, 'V'), (690.0, 'V'), (231.0, 'V'), (254.0, 'V'), (50.0, 'Hz'), (60.0, 'Hz'),
         (20.0, 'ms'), (16.7, 'ms'), (6.67, 'ms'), (5.56, 'ms'), (1500.0, 'r/min'), (1800.0, 'r/min'), (500.0, 'V'),
         (12.0, 'V'), (24.0, 'V'), (0.0, 'V')}
# (formelns namn, post): granskade sammanträffanden där exemplet har samma tal men räknar en annan krets eller storhet.
GRANSKADE = {
    ('Kirchhoffs strömlag', 'EL-000194'): '3 A i en nod, inte strömtransformatorns sekundärström',
    ('Två spänningskällor i serie', 'EL-000045'): 'strömmen i en serieslinga med två källor, inte en parallellgren',
}


def tal(text):
    ut = []
    for m in TAL.finditer(text or ''):
        heltal = re.sub(r'[  ]', '', m.group(1))
        ut.append((float(heltal + ('.' + m.group(2) if m.group(2) else '')), m.group(3)))
    return ut


def lika(a, b):
    return a[1] == b[1] and (a[0] == b[0] or (b[0] != 0 and abs(a[0] - b[0]) / abs(b[0]) < 0.005))


def resultat(exempel):
    """Talen som exemplet räknar fram: i varje mening det som står efter ”ger”, kolon eller sista likhetstecknet."""
    ut = []
    for mening in re.split(r'\.\s', exempel):
        for skiljetecken in (' ger ', ':', '='):
            if skiljetecken in mening:
                ut += tal(mening.rsplit(skiljetecken, 1)[1])
                break
    return [x for x in ut if not any(lika(x, f) for f in FASTA)]


def las_formler():
    spec = importlib.util.spec_from_file_location('formelsamling_bygg', KALLA)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return [f for _, _, f in m.numrering()]


def las_poster():
    poster = []
    for f in sorted((ROT / 'ovningar').glob('*.json')):
        p = json.loads(f.read_text(encoding='utf-8'))
        u = p.get('uppgift') or {}
        givet = tal(' '.join([u.get('fraga') or '', u.get('givet') or '']
                             + [d.get('text') or '' for d in u.get('delfragor') or []]))
        givet = [g for g in givet if not any(lika(g, f) for f in FASTA)]
        los = p.get('losning') or {}
        svar = [(float(s['varde']), s['enhet']) for s in los.get('svar') or []
                if isinstance(s.get('varde'), (int, float)) and not isinstance(s.get('varde'), bool) and s.get('enhet')]
        if not svar:  # resonemangsuppgifter: talen i lösningen som inte står i uppgiften
            svar = [x for x in tal(los.get('text')) if not any(lika(x, g) for g in givet) and not any(lika(x, f) for f in FASTA)]
        poster.append((p['id'], p['titel'], givet, svar))
    return poster


def krockar(formler, poster):
    ut = []
    for f in formler:
        alla = tal(f['ex'])
        res = resultat(f['ex'])
        for id_, titel, givet, svar in poster:
            if (f['namn'], id_) in GRANSKADE:
                continue
            samma_svar = [s for s in svar if any(lika(s, r) for r in res) and not any(lika(s, g) for g in givet)]
            samma_givet = [g for g in givet if any(lika(g, x) for x in alla)]
            if samma_svar and samma_givet:
                ut.append(f'{f["namn"]} ({f["ex"]}) ger svaret på {id_} {titel}: svar {samma_svar}, givet {samma_givet}')
    return ut


class FormelsamlingensExempel(unittest.TestCase):
    def test_exemplen_ger_inte_en_ovnings_svar(self):
        fel = krockar(las_formler(), las_poster())
        self.assertEqual(fel, [], '\n'.join(fel))

    def test_kontrollen_hittar_en_kopierad_ovning(self):
        """Ett exempel som är övning 3.3 vecka 40 (R = 30 Ω och X = 40 Ω, |Z| = 50 Ω) ska stoppas."""
        formel = {'namn': 'Impedans (serie)', 'ex': 'R = 30 Ω och X = 40 Ω: |Z| = 50 Ω.'}
        poster = [('EL-TEST', 'RL-kretsens impedans', [(30.0, 'Ω'), (40.0, 'Ω')], [(50.0, 'Ω')])]
        self.assertEqual(len(krockar([formel], poster)), 1)

    def test_granskade_finns(self):
        namn = {f['namn'] for f in las_formler()}
        ids = {p[0] for p in las_poster()}
        for formel, id_ in GRANSKADE:
            self.assertIn(formel, namn)
            self.assertIn(id_, ids)


if __name__ == '__main__':
    unittest.main()
