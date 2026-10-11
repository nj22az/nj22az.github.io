"""Quizens motor med påhittade texter (inte kursens): fälten med bokstäver, sidan, nyckeln i bokstäver och
räkningen per kursplanspunkt. Kör: python3 -m unittest discover -s sjoskolan/verktyg/inlamning -p 'test_*.py'"""
import copy
import hashlib
import json
import re
import sys
import unittest
from pathlib import Path

HAR = Path(__file__).resolve().parent
sys.path.insert(0, str(HAR))
import facit  # noqa: E402
import quiz_mall as M  # noqa: E402
import sjalvrattning as S  # noqa: E402

NR = 42
SALT = 'abcdef0123456789'


def prov_post(id_, titel, fragor, mal=('LM-2',), kortnamn=None, rev=1):
    """En påhittad text med frågor [(id, text, [alternativ], ledtrad)]."""
    resurs = {'url': 'vecka-42/aktuell/prov.pdf', 'titel': f'{titel} (PDF)'}
    if kortnamn:
        resurs['kortnamn'] = kortnamn
    return {'id': id_, 'titel': titel, 'revision': rev, 'larande': {'mal': list(mal)},
            'uppgift': {'fraga': f'Läs avsnitt 1 och 2 i {titel}.',
                        'delfragor': [{'id': q, 'typ': 'flerval', 'text': t, 'alternativ': a, 'ledtrad': l} for q, t, a, l in fragor]},
            'referenser': {'resurser': [resurs], 'rattigheter': f'Provmyndigheten, {titel}, 2026.'}}


FYRA = ['Röd', 'Grön', 'Blå', 'Gul']
FEM = ['Ett', 'Två', 'Tre', 'Fyra', 'Fem']
P1 = prov_post('EL-999901', 'Provtext om färger', [('a', 'Vilken färg?', FYRA, 'avsnitt 1'), ('b', 'Vilken nyans?', FYRA, 'avsnitt 2.3')],
               mal=('LM-2', 'LM-7'), kortnamn='Provtexten')
P2 = prov_post('EL-999902', 'Provtext om tal', [('a', 'Vilket tal?', FEM, 'tabell 4'), ('b', 'Vilket mer?', FEM, 'bilaga 1'),
                                                 ('c', 'Och sist?', FYRA, 'figur 2')], mal=('LM-3',))
PLACERINGAR = [({'ovning': P1['id'], 'ordning': 1, 'nummer': 'Text 1', 'ankare': 'text-1'}, P1),
               ({'ovning': P2['id'], 'ordning': 2, 'nummer': 'Text 2', 'ankare': 'text-2'}, P2)]
SVAR = {'kommentar': 'påhittat', P1['id']: {'a': 'c', 'b': ['A', 'D']}, P2['id']: {'a': 'E', 'b': 'A', 'c': 'B'}}


def h(falt, kanon):
    return hashlib.sha256(f'{SALT}|{falt}|{kanon}'.encode()).hexdigest()[:16]


class Falt(unittest.TestCase):
    def test_bokstaver_i_postens_ordning(self):
        a, b = S.dokument_falt(NR, P1)
        self.assertEqual(a['id'], '901a')
        self.assertEqual(a['alternativ'], list(zip('ABCD', FYRA)))
        self.assertTrue(a['bokstaver'])
        self.assertEqual([x[0] for x in S.dokument_falt(NR, P2)[0]['alternativ']], list('ABCDE'))
        self.assertEqual(S.pekare_html(NR, a['pekare']), 'Läs <a href="prov.pdf">avsnitt 1</a> i Provtexten.')
        self.assertEqual(S.pekare_html(NR, S.dokument_falt(NR, P2)[0]['pekare']), 'Läs <a href="prov.pdf">tabell 4</a> i Provtext om tal.')

    def test_posten_maste_folja_formatet(self):
        for andring, ord_ in ((lambda d: d.update(ratt=1), 'Facit'), (lambda d: d.update(svar=2), 'Facit'),
                              (lambda d: d.pop('ledtrad'), 'ledtrad'), (lambda d: d.update(alternativ=['x', 'y', 'z']), '4–5'),
                              (lambda d: d.update(alternativ=FEM + ['Sex']), '4–5'), (lambda d: d.pop('alternativ'), 'heltal')):
            p = copy.deepcopy(P1)
            andring(p['uppgift']['delfragor'][0])
            with self.assertRaises(SystemExit) as e:
                S.dokument_falt(NR, p)
            self.assertIn(ord_, str(e.exception))

    def test_plan_och_kursplanens_punkter(self):
        plan = S.quiz_plan(NR, PLACERINGAR)
        self.assertEqual(plan['uppgifter'][1], {'nr': '2', 'titel': 'Provtext om tal', 'ovning': 'EL-999902', 'lm': ['LM-3'],
                                                 'falt': ['902a', '902b', '902c']})
        self.assertEqual(sorted(S.quiz_falt(NR, PLACERINGAR)), ['901a', '901b', '902a', '902b', '902c'])

    def test_falt_per_lm_for_kursens_sidor(self):
        inl = S.falt_per_lm(NR, 'inlamning')
        self.assertEqual(sum(1 for f in S.rattade_falt(NR).values()), 12)
        self.assertEqual(list(inl), sorted(inl, key=lambda m: int(m.split('-')[1])))
        las = S.falt_per_lm(NR, 'quiz')
        antal = sum(len(S.dokument_falt(NR, p)) for _, p in S.quiz_poster(NR))
        for _, p in S.quiz_poster(NR):
            for m in p['larande']['mal']:
                self.assertGreaterEqual(las[m], len(S.dokument_falt(NR, p)))
        self.assertTrue(antal > 0 and max(las.values()) <= antal)
        self.assertEqual(S.falt_per_lm(43, 'quiz'), {})
        with self.assertRaises(ValueError):
            S.falt_per_lm(NR, 'annat')


class Sida(unittest.TestCase):
    def setUp(self):
        self.s = M.sida(NR, PLACERINGAR, nyckel='prov-nyckel.mjs')

    def test_texterna_i_ordning_med_bokstaver(self):
        s = self.s
        self.assertLess(s.index('id="text-1"'), s.index('id="text-2"'))
        self.assertIn('<h2>Text 2. Provtext om tal</h2>', s)
        self.assertIn('<input type="radio" name="ri-902a" value="E"><span class="ri-bokstav">E</span><span>Fem</span>', s)
        self.assertEqual(re.findall(r'name="ri-901a" value="([A-E])"', s), list('ABCD'), 'ingen blandning')
        self.assertIn('Rätta text 2', s)
        self.assertIn('data-lm="LM-2 LM-7"', s)

    def test_lasta_fragor_per_text(self):
        ruta = re.search(r'<section class="sj-panel warn ri-lasom" id="ri-lasom" hidden>(.*?)</section>', self.s).group(1)
        self.assertEqual(re.findall(r'<li data-ri-dok="(EL-\d+)" hidden>', ruta), ['EL-999901', 'EL-999902'])
        self.assertEqual(re.findall(r'data-ri-omlast="(EL-\d+)">Jag har läst om texten<', ruta), ['EL-999901', 'EL-999902'])
        self.assertIn('<a href="prov.pdf">Öppna Provtext om färger (PDF)</a>', ruta)
        self.assertNotIn('Del_1.html', ruta)

    def test_lamna_in_och_skript(self):
        s = self.s
        self.assertIn('data-ri-lagring="sj-v42-quiz"', s)
        self.assertIn('Lämna in PDF-filen i Google Classroom under Vecka 42 – Quiz senast torsdag 15 oktober.', s)
        self.assertEqual(s.count('class="sj-btn primary'), 1)
        self.assertIn(f"quiz-sida.mjs?v={S.VERSION}", s)
        self.assertIn("import('./prov-nyckel.mjs?v=saknas')", s)
        self.assertIn('oversattning.js', s)
        self.assertEqual(M.dag_text('2026-10-15'), 'torsdag 15 oktober')


class Nyckel(unittest.TestCase):
    def test_bokstaver_och_listor(self):
        falt, poster = facit.nyckel_quiz(NR, SVAR, SALT, PLACERINGAR)
        self.assertEqual(poster, {'EL-999901': 1, 'EL-999902': 1})
        self.assertEqual(falt['901a'], {'typ': 'val', 'h': [h('901a', 'v:C')]})
        self.assertEqual(falt['901b']['h'], sorted([h('901b', 'v:A'), h('901b', 'v:D')]))
        self.assertEqual(falt['902a']['h'], [h('902a', 'v:E')])
        self.assertEqual(list(falt), ['901a', '901b', '902a', '902b', '902c'])

    def test_fel_i_klartexten_stoppar(self):
        fall = [({**SVAR, P1['id']: {'a': 'E', 'b': 'A'}}, 'inget alternativ'),       # fyra alternativ: ingen E
                ({**SVAR, P1['id']: {'a': 'C'}}, 'saknas'),                          # en fråga utan svar
                ({**SVAR, P1['id']: {'a': 'C', 'b': 'A', 'x': 'B'}}, 'okända'),
                ({k: v for k, v in SVAR.items() if k != P2['id']}, 'saknas'),          # en text utan svar
                ({**SVAR, 'EL-999999': {'a': 'A'}}, 'okända'),
                ({**SVAR, P1['id']: {'a': list('ABCD'), 'b': 'A'}}, 'alla alternativ'),
                ({**SVAR, P1['id']: {'a': ['A', 'a'], 'b': 'A'}}, 'två gånger'),
                ({**SVAR, P1['id']: ['C', 'A']}, 'ange svaren')]
        for svar, text in fall:
            with self.assertRaises(SystemExit, msg=text) as e:
                facit.nyckel_quiz(NR, svar, SALT, PLACERINGAR)
            self.assertIn(text, str(e.exception))

    def test_klartext_i_repot_vagras(self):
        import subprocess
        r = subprocess.run([sys.executable, str(HAR / 'facit.py'), '42', '--sida', 'quiz', '--svar', str(HAR / 'sjalvrattning.py'),
                            '--ut', '/dev/null'], capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn('ligger i repot', r.stderr)


if __name__ == '__main__':
    unittest.main()
