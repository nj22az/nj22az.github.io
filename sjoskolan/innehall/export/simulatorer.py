"""Simulatorernas uppgifter: <labb>/uppgifter.gen.mjs, som labbarnas lessons.mjs importerar.

Filerna har samma form som de tidigare hårdkodade arrayerna, så att app.mjs och testerna inte behöver känna till databasen.
Funktioner refereras aldrig här: validering och kontroller ligger i labbens funktioner.mjs och kopplas ihop i lessons.mjs.
Även vecka 40:s kontrollfrågor (genomgangen) skrivs härifrån.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'lib'))
import rendera as R
import text as T

PUBLIK = 'elev'
HUVUD = '// GENERERAD FIL · ur sjoskolan/innehall (innehall.py bygg simulatorer). Redigera posterna i innehall/ovningar/, inte här.\n'
MARKUP = {'trefaslabbet', 'vaxelstromslabbet', 'hallkretslabbet', 'isolationslabbet'}  # renderas med markHtml


def rakna_forst(pl, p, lab):
    sim, u, los = p['simulator'], p['uppgift'], p.get('losning') or {}
    txt = (lambda t: t) if lab in MARKUP else T.ren_text
    fr = sim['fraga']
    ask = {'key': fr['storhet'], 'label': txt(fr['etikett'])}
    if fr.get('enhet'):
        ask['unit'] = fr['enhet']
    tol = sim['validering'].get('tolerans') or {}
    for k in ('rel', 'abs'):
        if k in tol:
            ask[k] = tol[k]
    if fr.get('belopp'):
        ask['absolute'] = True
    if 'fas' in fr:
        ask['phase'] = fr['fas']
    if 'skala' in fr:
        ask['scale'] = fr['skala']
    c = {'id': sim['alias'], 'ovning': p['id']}
    if sim.get('scenario'):
        c['tab'] = sim['scenario']
    c['title'] = txt(p['titel'])
    if sim.get('kallhanvisning'):
        c['deck'] = sim['kallhanvisning']
    if sim.get('teoriavsnitt'):
        c['theory'] = sim['teoriavsnitt']
    init = sim.get('initial') or {}
    if lab == 'hallkretslabbet':
        c['steps'] = init['steg']
    elif lab == 'isolationslabbet':
        c['set'] = init
    else:
        c['setup'] = init
    c['task'] = txt(u['fraga'])
    c['ask'] = ask
    if sim.get('dolj'):
        c['mask'] = sim['dolj']
    if sim.get('dolj_fel'):
        c['hideFault'] = True
    led = [l for l in p.get('ledtradar', []) if l['niva'] == 'metod']
    if led:
        c['hint'] = txt(led[0]['text'])
    if los.get('text'):
        c['solution'] = txt(los['text'])
    fel = (sim.get('aterkoppling') or {}).get('vanliga_fel') or []
    c['mistakes'] = [{'v': m['varde'], 'msg': txt(m['text'])} for m in fel]
    if (sim.get('aterkoppling') or {}).get('ratt'):
        c['after'] = txt(sim['aterkoppling']['ratt'])
    return c


def guidad(pl, p):
    """Texten behåller markeringen X_{L}; guided.mjs renderar den med markHtml."""
    sim, u = p['simulator'], p['uppgift']
    led = [l for l in p.get('ledtradar', []) if l['niva'] == 'metod']
    return {'id': sim['alias'], 'ovning': p['id'], 'lesson': sim['scenario'], 'title': p['titel'], 'source': sim.get('kalla', ''),
            'setup': sim['initial'], 'fields': [[k, e, enh] for k, e, enh in sim['fraga']['falt']], 'prompt': u['fraga'],
            'method': led[0]['text'] if led else '', 'theory': sim.get('teoriavsnitt'), 'visual': sim.get('visualisering'),
            'explain': sim['forklaring']['fraga'], 'hint': sim['forklaring']['ledtrad']}


def multimeter(pl, p):
    sim, labb = p['simulator'], p['labb']
    l = {'id': sim['alias'], 'ovning': p['id'], 'title': T.ren_text(p['titel']), 'circuit': sim['scenario'],
         'slides': sim.get('kallhanvisning', '').replace('Multimeter och mätfel, bild ', ''), 'goal': T.ren_text(p['uppgift']['fraga'])}
    if sim.get('lagringsversion'):
        l['revision'] = sim['lagringsversion']
    if sim.get('initial'):
        l['setup'] = sim['initial']
    steg = []
    for s in labb['steg']:
        st = {}
        if not s['id'].startswith('s') or not s['id'][1:].isdigit():
            st['key'] = s['id']
        if s.get('typ'):
            st['kind'] = s['typ']
        if s.get('etikett'):
            st['label'] = T.ren_text(s['etikett'])
        st['task'] = T.ren_text(s['text'])
        if 'svar' in s:
            st['answer'] = s['svar']
        if s.get('tolerans'):
            st['tolerance'] = s['tolerans']['abs']
        if s.get('enhet'):
            st['unit'] = s['enhet']
        if s.get('alternativ'):
            st['choices'] = [T.ren_text(x) for x in s['alternativ']]
            st['correct'] = s['ratt']
        kod = s.get('kod') or {}
        for k in ('input', 'comment'):
            if k in kod:
                st[k] = kod[k]
        if s.get('ledtrad'):
            st['hint'] = T.ren_text(s['ledtrad'])
        if kod.get('test'):
            st['test'] = kod['test']
        if s.get('varfor'):
            st['why'] = T.ren_text(s['varfor'])
        steg.append(st)
    l['steps'] = steg
    return l


def kontrollfraga(pl, p):
    # Genomgången och lektionsartiklarna visar markeringen som index (markHtml, rendera.h), så texten behåller den.
    return {'del': pl['del'], 'bild': pl['ankare'].split(':')[1], 'ovning': p['id'], 'title': p['titel'],
            'check': p['uppgift'].get('instruktion') or p['uppgift']['fraga'], 'answer': p['losning']['text']}


def modul(namn, rader, kommentar=''):
    return HUVUD + (f'// {kommentar}\n' if kommentar else '') + f'export const {namn} = ' + R.js(rader, indent=1) + ';\n'


def filer(a):
    ut = {}
    for lab in sorted(MARKUP):
        rader = [rakna_forst(pl, p, lab) for pl, p in a.placeringar('simulator', f'{lab}/uppgifter.gen.mjs', 'rakna-forst')]
        ut[f'{lab}/uppgifter.gen.mjs'] = modul('UPPGIFTER', rader, 'Räkna-först-uppgifter. Texten använder markeringen X_{L} (gemensamt/markering.mjs).')
    g = [guidad(pl, p) for pl, p in a.placeringar('simulator', 'vaxelstromslabbet/uppgifter.gen.mjs', 'guidad')]
    ut['vaxelstromslabbet/uppgifter.gen.mjs'] += '\n' + modul('GUIDADE', g, 'Den guidade labbens uppgifter (grundprotokollet).').replace(HUVUD, '')
    m = [multimeter(pl, p) for pl, p in a.placeringar('simulator', 'multimetersimulator/uppgifter.gen.mjs', 'ovningar')]
    ut['multimetersimulator/uppgifter.gen.mjs'] = modul('UPPGIFTER', m, 'Stegvisa övningar. test är id i funktioner.mjs; lessons.mjs kopplar ihop dem.')
    k = [kontrollfraga(pl, p) for pl, p in a.placeringar('genomgang-v40')]
    ut['vecka-40/aktuell/kontrollfragor.gen.mjs'] = modul('KONTROLLFRAGOR', k, 'Prova själv-frågorna i genomgångarna. lektioner.mjs lägger in dem på rätt bild.')
    return ut
