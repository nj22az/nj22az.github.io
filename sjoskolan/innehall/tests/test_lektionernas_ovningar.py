"""Lektionernas övningar på veckosidan och delsidan (verktyg/veckosidor/dagsvy.py) hör ihop med delsidorna.

Från vecka 43 gör lektionerna olika många övningar tillsammans och hemma (vecka 44: 2.1–2.3 på lektionen, 2.4–2.6 hemma),
och en läxa kan gälla en annan del (del 3:s övningar efter tisdagens lektion i vecka 43). Sidan räknar läget ur läxans
text och länk och ur bilderna Övningar tillsammans, så de måste peka på övningar som finns.

Kör: python3 -m unittest discover -s sjoskolan/innehall/tests -p 'test_*.py'
"""
from pathlib import Path
import re
import sys
import unittest

SJO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(SJO / 'verktyg' / 'veckosidor'))
import dagsvy  # noqa: E402
sys.path.remove(str(SJO / 'verktyg' / 'veckosidor'))


def delsidans_ovningar(ankare):
    """Ankarna för övningarna på delsidan där övningen ankare står (v44_02-q4 → vecka-44/aktuell/Del_2.html)."""
    m = re.match(r'v(\d\d)_0(\d)-q\d+$', ankare)
    sida = SJO / f'vecka-{m.group(1)}' / 'aktuell' / f'Del_{m.group(2)}.html'
    return set(re.findall(r'<article class="del-ovning" id="([^"]+)"', sida.read_text(encoding='utf-8')))


class LektionernasOvningar(unittest.TestCase):
    def lektioner(self):
        for nr in sorted(dagsvy.DAGSVY):
            yield from dagsvy.lektioner(nr, dagsvy._vecka(nr))

    def test_lektionens_och_laxornas_ovningar_finns_pa_delsidan(self):
        for lek in self.lektioner():
            for a in lek['pa_lektionen'] + [a for x in lek['laxor'] for a in x['ovningar'] or []]:
                self.assertIn(a, delsidans_ovningar(a), f'{lek["id"]}: övningen {a} finns inte på delsidan')

    def test_en_laxa_som_namner_ovningar_raknar_dem(self):
        for lek in self.lektioner():
            for x in lek['laxor']:
                if re.search(r'[Öö]vning \d+\.\d+', x['text']) and 'extra' not in x['text'].split('.')[0]:
                    self.assertTrue(x['ovningar'], f'{lek["id"]} {x["id"]}: läxan nämner övningar men länkar inte till en övning (#vNN_0N-qK)')
                    self.assertEqual(x['href'].split('#')[1], x['ovningar'][0], f'{lek["id"]} {x["id"]}: länken går inte till den första övningen')

    def test_ingen_ovning_gors_bade_pa_lektionen_och_hemma(self):
        for lek in self.lektioner():
            hemma = {a for x in lek['laxor'] for a in x['ovningar'] or []}
            self.assertFalse(hemma & set(lek['pa_lektionen']), f'{lek["id"]}: samma övning på lektionen och i läxan')

    def test_frivillig_traning_ger_inte_ogjorda_laxor(self):
        for lek in self.lektioner():
            data = dagsvy._lektion_data(lek)
            for x in lek['laxor']:
                if x['id'].startswith('extra-'):
                    self.assertNotIn(x['id'], data['laxor'])
                    self.assertNotIn(x['id'], data['laxovn'])
                    html = dagsvy._laxa_html(lek, x)
                    self.assertIn('Frivilligt', html)
                    self.assertNotIn('<input', html)
                    self.assertIn(x['href'], html)

    def test_nummertext(self):
        self.assertEqual(dagsvy._nummertext(['1.2', '1.3', '1.4', '1.5', '1.1']), '1.1–1.5')
        self.assertEqual(dagsvy._nummertext(['3.6', '3.7']), '3.6 och 3.7')
        self.assertEqual(dagsvy._nummertext(['2.1', '2.3', '2.4', '2.5']), '2.1 och 2.3–2.5')
        self.assertEqual(dagsvy._nummertext(['1.4']), '1.4')


if __name__ == '__main__':
    unittest.main()
