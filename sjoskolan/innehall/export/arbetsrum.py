"""Week 40's student workspace: public exercises through the common access layer.

The JSON plan owns ordering and references, never copies exercise answers. The
browser receives only student fields; protected teacher/book material stays out.
"""
import json
import re
import rendera as R

PUBLIK = 'elev'


def filer(a):
    plan = json.loads((R.SJO / 'innehall/studieplan-v40.json').read_text())
    placements = {}
    for surface, path in [('kurs-formelstod', 'vecka-40/aktuell/Formelstod_och_ovningar.html'),
                          ('arbetsblad', 'vecka-38/aktuell/Elevuppgifter.html')]:
        for pl, p in a.placeringar(surface, path):
            placements[p['id']] = pl
    tasks = {}
    for id_, config in plan['ovningar'].items():
        p = a.ovning(id_)
        pl = placements[id_]
        solution = p.get('losning', {}) if p['referenser'].get('losning_publik', True) else {}
        tasks[id_] = {**config, 'id': id_, 'revision': p['revision'], 'title': p['titel'],
                      'number': pl['nummer'], 'anchor': pl['ankare'], 'question': p['uppgift'],
                      'hints': p.get('ledtradar', []), 'solution': solution}
    for lesson, sequence in plan['ordning'].items():
        ids = [x for x in sequence if x.startswith('EL-')]
        assert len(ids) == len(set(ids)), f'Duplicated exercise in {lesson}'
        assert set(ids) == {x for x, p in tasks.items() if p['del'] == lesson}
    data = {'version': plan['version'], 'cards': plan['kort'], 'isolation': plan['franskiljning'],
            'sequence': plan['ordning'], 'tasks': tasks}
    cards_page = R.SJO / 'gemensamt/Underlagskort.html'
    cards_html = ''.join(f'<h2>{R.h(c["titel"])}</h2><p>{R.h(c["text"])}</p>' for c in plan['kort'].values())
    cards_text = re.sub(r'<h2>Instrumentkort M1</h2>.*?(?=<h2>Komponentkort</h2>)', cards_html, cards_page.read_text(), flags=re.S)
    return {'gemensamt/Underlagskort.html': cards_text, 'vecka-40/aktuell/arbetsrum.gen.mjs':
            '// GENERERAD FIL · innehall.py bygg arbetsrum. Redigera innehall/ovningar och studieplan-v40.json.\n'
            + 'export const STUDY = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'}
