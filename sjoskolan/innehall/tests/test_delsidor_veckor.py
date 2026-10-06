"""Teori → Öva nu → Ledtråd 1, genom JSON, SQLite och publicerad HTML.

Kör: python3 -m unittest discover -s sjoskolan/innehall/tests -p 'test_*.py'
Kräver python-pptx, liksom exportören. Inga lösenord eller webbläsare behövs.
"""
import copy
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import tempfile
import unittest

ROT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROT / 'lib'), str(ROT / 'export')]

from atkomst import Atkomst
import db
import delsidor_veckor as D
import katalog as K


class Kortlankar(HTMLParser):
    """Läs faktiska länkar och rubriker, även inuti nästlade ledtrådar."""
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self, text):
        super().__init__()
        self.stack, self.teori, self.ovningar = [], {}, {}
        self.feed(text)

    def inom(self, klass):
        return next((a for _, a in reversed(self.stack) if klass in a.get('class', '').split()), None)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag not in self.VOID:
            self.stack.append((tag, a))
        klasser = a.get('class', '').split()
        if 'del-teori' in klasser:
            self.teori[a['id']] = {'titel': '', 'ovningar': []}
        if 'del-ovning' in klasser:
            self.ovningar[a['id']] = []
        if tag == 'a':
            teori, ovning = self.inom('del-teori'), self.inom('del-ovning')
            if teori and self.inom('del-ova'):
                self.teori[teori['id']]['ovningar'].append(a['href'])
            if ovning and self.inom('ledtrad') and a.get('href', '').startswith('#teori-'):
                self.ovningar[ovning['id']].append(a['href'])

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        teori = self.inom('del-teori')
        if teori and self.inom('kort-titel'):
            self.teori[teori['id']]['titel'] += data


class TeorireferensTest(unittest.TestCase):
    def setUp(self):
        self.pl = {'plats': 'vecka-41/aktuell/Formelstod_och_ovningar.html',
                   'del': 'v41_02', 'ovning_id': 'EL-000104', 'teorikort': 'Trefaseffekt'}
        self.teori = [(4, 'Y- och Δ-koppling', [('formel', 'U_{L} I_{L} cos φ P √3')]),
                      (9, 'Trefaseffekt', [('p', 'Effekt i trefassystemet.')])]

    def test_explicit_referens_vinner_over_ordlikhet(self):
        self.assertEqual(D.teori_for(self.pl, self.teori), (2, 'Trefaseffekt'))

    def test_flyttade_bilder_ger_ratt_kortnummer(self):
        self.assertEqual(D.teori_for(self.pl, self.teori[::-1]), (1, 'Trefaseffekt'))

    def test_saknad_eller_tom_referens_stoppar_bygget(self):
        for titel in (None, '', ' ', 4):
            with self.subTest(titel=titel), self.assertRaisesRegex(ValueError, 'EL-000104.*saknar teorikort'):
                D.teori_for({**self.pl, 'teorikort': titel}, self.teori)

    def test_okand_omdopt_eller_fel_dels_rubrik_stoppar_bygget(self):
        for titel in ('Trefaseffekt ändrad', 'Isolationsmätning'):
            with self.subTest(titel=titel), self.assertRaisesRegex(ValueError, 'fann 0'):
                D.teori_for({**self.pl, 'teorikort': titel}, self.teori)

    def test_tvetydig_rubrik_stoppar_bygget(self):
        with self.assertRaisesRegex(ValueError, 'fann 2'):
            D.teori_for(self.pl, [*self.teori, self.teori[1]])


class KallflodeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kat = K.Katalog(skydd=[])
        cls.tmp = tempfile.TemporaryDirectory()
        cls.con = db.bygg(cls.kat, Path(cls.tmp.name) / 'innehall.sqlite')
        cls.a = Atkomst(cls.con, 'elev')
        cls.filer = D.filer(cls.a)
        cls.source = [pl for pl in cls.kat.ytor['kurs-formelstod']['placeringar']
                      if re.fullmatch(r'vecka-4[1-5]/aktuell/Formelstod_och_ovningar\.html', pl['plats'])]

    @classmethod
    def tearDownClass(cls):
        cls.con.close()
        cls.tmp.cleanup()

    def test_schemat_kraver_koppling_for_alla_fem_veckor(self):
        yta = copy.deepcopy(self.kat.ytor['kurs-formelstod'])
        self.assertEqual(self.kat.pschema.fel(yta), [])
        for vecka in range(41, 46):
            pl = copy.deepcopy(next(p for p in self.source if p['plats'].startswith(f'vecka-{vecka}/')))
            del pl['teorikort']
            yta['placeringar'] = [pl]
            with self.subTest(vecka=vecka):
                self.assertTrue(any('saknar teorikort' in f for f in self.kat.pschema.fel(yta)))
        # Vecka 40 har en egen, oförändrad exportör och kräver inte det nya fältet.
        pl['plats'] = 'vecka-40/aktuell/Formelstod_och_ovningar.html'
        self.assertEqual(self.kat.pschema.fel(yta), [])

    def test_granskade_amneskopplingar(self):
        # Oberoende regressionsfall: rätt ämne, inte bara en existerande länk.
        for id_, titel in {
            'EL-000091': 'Tre sinusspänningar',
            'EL-000097': 'Osymmetri och övertoner',
            'EL-000098': 'Osymmetri och övertoner',
            'EL-000103': 'Linjeström och grenström',
            'EL-000100': 'Osymmetri och övertoner',
            'EL-000104': 'Trefaseffekt',
            'EL-000105': 'Trefaseffekt',
            'EL-000110': 'Trefaseffekt',
            'EL-000877': 'Y och Δ med bleck',
            'EL-000878': 'Lindningar och plint',
            'EL-000879': 'Y och Δ med bleck',
            'EL-000880': 'Motorns delar och märkskylt',
            'EL-000881': 'Y och Δ med bleck',
            'EL-000882': 'Y och Δ med bleck',
            'EL-000883': 'Startarens delar',
            'EL-000884': 'Startarens delar',
            'EL-000885': 'Strömtången',
            'EL-000886': 'Strömtången',
            'EL-000123': 'Beröringsspänning',
            'EL-000129': 'Tillbud och lärande',
            'EL-000137': 'Regler för fartyg',
            'EL-000141': 'Arbetsmomentets gränser',
            'EL-000145': 'Provare, låsning och märkning',
            'EL-000151': 'Kontaktor och relä',
            'EL-000158': 'Selektivitet',
            'EL-000163': 'Asynkronmotorns roterande fält',
            'EL-000165': 'Eftersläpning',
            'EL-000168': 'Frekvensomriktarens delar',
            'EL-000178': 'Mätpunkter och referens',
            'EL-000181': 'TN-system',
            'EL-000198': 'Avstånd och arbetsgräns',
            'EL-000203': 'Isolationsmätning',
            'EL-000204': 'Isolationsmätning',
            'EL-000205': 'Jordresistansmätning',
            'EL-000209': 'Osäkerhet och felgräns',
            'EL-000213': 'Halveringsmetoden',
            'EL-000228': 'Kontrollprotokollets innehåll',
            'EL-000232': 'Kirchhoff och delare',
            'EL-000234': 'AC och trefas',
            'EL-000235': 'AC och trefas',
            'EL-000237': 'Mätning och felsökning',
            'EL-000239': 'Mätning och felsökning',
        }.items():
            with self.subTest(id=id_):
                self.assertEqual(self.a.placering_for(id_, 'kurs-formelstod')['teorikort'], titel)

    def test_alla_150_kopplingar_genom_databasen_till_bada_lankriktningarna(self):
        self.assertEqual(len(self.source), 150)
        sidor = {rel: Kortlankar(text) for rel, text in self.filer.items() if rel.endswith('.html')}
        self.assertEqual(len(sidor), 15)
        for rel, sida in sidor.items():
            vecka = int(rel.split('/')[0].split('-')[1])
            del_ = f'v{vecka}_0{Path(rel).stem[-1]}'
            source = {p['ovning']: p for p in self.source if p['del'] == del_}
            poster = self.a.placeringar('kurs-formelstod', del_=del_)
            with self.subTest(sida=rel):
                self.assertEqual({p['id'] for _, p in poster}, set(source))
                self.assertEqual(set(sida.ovningar), {pl['ankare'] for pl, _ in poster})
                erbjudna = [l for t in sida.teori.values() for l in t['ovningar']]
                self.assertCountEqual(erbjudna, ['#' + pl['ankare'] for pl, _ in poster])
            for pl, p in poster:
                with self.subTest(sida=rel, ovning=p['id']):
                    self.assertEqual(pl['teorikort'], source[p['id']]['teorikort'])
                    kort, = [id_ for id_, t in sida.teori.items() if t['titel'] == pl['teorikort']]
                    self.assertIn('#' + pl['ankare'], sida.teori[kort]['ovningar'])
                    self.assertEqual(sida.ovningar[pl['ankare']], ['#' + kort])

    def test_publicerade_sidor_ar_aktuella(self):
        for rel, text in self.filer.items():
            with self.subTest(fil=rel):
                self.assertEqual((ROT.parent / rel).read_text(encoding='utf-8'), text)


if __name__ == '__main__':
    unittest.main()
