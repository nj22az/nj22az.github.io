#!/usr/bin/env python3
"""Vecka 40:s presentationer: kurvdiagram och trianglar som bilder ur webbgenomgångens figurer.

PowerPoint-diagram (inbäddad arbetsbok) och trianglar av lösa linjer ritas olika i PowerPoint, Keynote och
LibreOffice. Bilderna här ritas ur samma kod som genomgången på webben (vecka-40/aktuell/visuals.mjs), så presentation
och webb visar samma figur. Kör efter ändringar i visuals.mjs eller lektioner.mjs, och därefter
`innehall.py bygg presentationer` (PDF och bildspel) och `verktyg/larare/lararnoter.py` (lärarkopiorna).

    python3 sjoskolan/verktyg/ac/figurbilder.py
"""
import json
import subprocess
import sys
from pathlib import Path

from pptx import Presentation
from pptx.util import Emu

SJO = Path(__file__).resolve().parents[2]
V40 = SJO / 'vecka-40' / 'aktuell'
UT = V40 / 'figurer'
BILD = ['wave', 'period', 'peak', 'resistor', 'rl', 'triangle', 'powerTriangle']  # tabellfigurerna förblir text
BREDD, HOJD = 840, 270
# Figurens ruta på bilden (tum): samma plats som diagrammen hade, ovanför formeln (3,89 tum).
LEFT, TOP, WIDTH = 0.94, 1.30, 8.12
TA_BORT = ('Chart', 'real-leg', 'reactive-leg', 'hypotenuse', 'right-angle-h', 'right-angle-v',
           'horizontal-label', 'vertical-label', 'diagonal-label', 'period-label', 'peak-label')

RITA = r"""
const { chromium } = require(process.argv[2] + '/playwright');
(async () => {
  const { visual } = await import(process.argv[3]);
  const [ut, bredd, ...slag] = process.argv.slice(4);
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 3 });
  for (const k of slag) {
    await p.setContent(`<body style="margin:0;background:#fff">${visual(k, Number(bredd), 1, { skala: 1.4 })}</body>`);
    await (await p.$('svg')).screenshot({ path: `${ut}/deck-${k}.png` });
  }
  await b.close();
})();
"""


def rita():
    UT.mkdir(exist_ok=True)
    rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True, check=True).stdout.strip()
    skript = UT / '.rita.cjs'
    skript.write_text(RITA)
    try:
        subprocess.run(['node', str(skript), rot, (V40 / 'visuals.mjs').as_uri(), str(UT), str(BREDD), *BILD], check=True)
    finally:
        skript.unlink()


def main():
    rita()
    js = "import('%s').then(m=>console.log(JSON.stringify(m.LESSONS)))" % (V40 / 'lektioner.mjs').as_uri()
    lektioner = json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)
    for l in lektioner:
        fil = V40 / l['deck']
        prs = Presentation(fil)
        bilder = list(prs.slides)
        n = 0
        for i, s in enumerate(l['slides']):
            if s.get('visual') not in BILD:
                continue
            bild = bilder[i + 1]
            for sh in list(bild.shapes):
                if sh.name in TA_BORT or sh.name.startswith('figur-kurva'):
                    # Släpp också relationen till diagrammet (och dess arbetsbok), annars ligger delen kvar i filen.
                    rids = sh._element.xpath('.//c:chart/@r:id') if sh.shape_type is not None and 'CHART' in str(sh.shape_type) else []
                    sh._element.getparent().remove(sh._element)
                    for rid in rids:
                        bild.part.drop_rel(rid)
            hojd = WIDTH * HOJD / BREDD
            pic = bild.shapes.add_picture(str(UT / f'deck-{s["visual"]}.png'), Emu(int(LEFT * 914400)), Emu(int(TOP * 914400)),
                                          Emu(int(WIDTH * 914400)), Emu(int(hojd * 914400)))
            pic.name = f'figur-kurva-{s["visual"]}'
            # Alternativtext för skärmläsare: bildens rubrik.
            pic._element.nvPicPr.cNvPr.set('descr', s.get('title', ''))
            n += 1
        prs.save(fil)
        print(f'{fil.name}: {n} figurer som bilder')


if __name__ == '__main__':
    sys.exit(main())
