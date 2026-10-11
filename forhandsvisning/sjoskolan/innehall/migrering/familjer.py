"""Övriga övningsfamiljer: simulatorernas uppgifter, labbprotokoll (simulerade och fysiska), vecka 40:s kontrollfrågor,
arbetsblad, förberedelsefrågor, seminarieövningar, inlämningsuppgifter och övningstentan.

Läses ur källrevisionen: simulatorerna via migrering/labbar.mjs (Node), sidorna ur git.
"""
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

import kallor
import text as T

N = T.normalisera
HAR = Path(__file__).resolve().parent
LABBNAMN = {'trefaslabbet': 'Trefaslabbet', 'vaxelstromslabbet': 'Växelströmslabbet', 'hallkretslabbet': 'Hållkretslabbet',
            'isolationslabbet': 'Isolationslabbet', 'multimetersimulator': 'Multimeterlabbet', 'vaxelstromslabbet-guidad': 'Växelströmslabbet, guidad labb'}
MAL = {'trefaslabbet': ['LM-4'], 'vaxelstromslabbet': ['LM-4'], 'vaxelstromslabbet-guidad': ['LM-4'], 'hallkretslabbet': ['LM-4', 'LM-5'],
       'isolationslabbet': ['LM-1', 'LM-6'], 'multimetersimulator': ['LM-4', 'LM-6']}
# Oberoende beräkning (lib/berakningar.py) för simulatoruppgifterna: labb -> uppgift -> (funktion, parametrar)
BER = {
    'trefaslabbet': {'uf': ('trefas.fasspanning', {'UL': 690}), 'in2': ('trefas.neutralstrom', {'I1': 12, 'I2': 12, 'I3': 0}),
                     'in3': ('trefas.neutralstrom', {'I1': 12, 'I2': 8, 'I3': 8}), 'bruten': ('trefas.bruten_neutral_u', {'UL': 400, 'R1': 23, 'R2': 46, 'Rx': 46}),
                     'inr': ('trefas.neutral_tva_laster', {'UL': 400, 'R1': 23, 'R2': 46}), 'ystrom': ('trefas.linjestrom_y', {'UL': 690, 'Z': 30}),
                     'dstrom': ('trefas.linjestrom_d', {'UL': 690, 'Z': 46}), 'p3': ('trefas.effekt_kw', {'UL': 440, 'IL': 25, 'PF': 0.85})},
    'vaxelstromslabbet': {'period': ('ac.period_ms', {'f': 400}), 'topp': ('ac.topp', {'U': 24}), 'moment': ('ac.momentan', {'U': 10, 'f': 50, 't': 0.003}),
                          'fas': ('ac.fas_grader', {'dt': 0.0025, 'f': 50}), 'xl': ('ac.xl', {'f': 50, 'L': 0.159}), 'strom': ('ac.strom_serie', {'U': 100, 'R': 40, 'XL': 30}),
                          'rc': ('ac.fasvinkel_grader', {'R': 40, 'XC': 30}), 'resonans': ('ac.resonans', {'L': 0.05, 'C': 150e-6}),
                          'skenbar': ('ac.skenbar', {'P': 1200, 'PF': 0.75}), 'reaktiv': ('ac.reaktiv', {'P': 1200, 'PF': 0.75}),
                          'matstrom': ('ac.strom_pf', {'P': 2300, 'U': 230, 'PF': 0.5}), 'kompensering': ('ac.kompensering', {'P': 2000, 'PF': 0.8})},
    'vaxelstromslabbet-guidad': {'grund-period': ('ac.period_ms', {'f': 50}), 'grund-topp': ('ac.topp', {'U': 12}), 'grund-xl': ('ac.xl', {'f': 50, 'L': 0.0955}),
                                 'grund-z': ('ac.z_rl', {'R': 40, 'f': 50, 'L': 0.0955}), 'grund-strom': ('ac.strom_rl', {'U': 12, 'R': 40, 'f': 50, 'L': 0.0955}),
                                 'grund-pf1': ('ac.strom_pf', {'P': 1150, 'U': 230, 'PF': 1}), 'grund-pf05': ('ac.strom_pf', {'P': 1150, 'U': 230, 'PF': 0.5})},
    'hallkretslabbet': {'strom': ('hallkrets.spolstrom_ma', {'U': 24, 'R': 480})},
    'isolationslabbet': {'riso': ('it.riso', {'R': [3, 3, 1.5]}), 'larm': ('it.riso', {'R': [120, 10000, 10000]}), 'symmetri': ('trefas.fasspanning', {'UL': 440}),
                         'forsta': ('it.frisk_fas_vid_jordfel', {'UL': 440}), 'kapstrom': ('it.kapacitiv_felstrom_ma', {'f': 50, 'C': 1e-6, 'UL': 440}),
                         'andra': ('it.andra_felet_ka', {'UL': 440, 'Rloop': 0.08}), 'prov': ('isolation.resistans_mohm', {'U': 500, 'I': 0.0004}),
                         'kabel': ('isolation.provstrom_ma', {'U': 500, 'R': 50000})},
}
ENHET_PARAM = {'UL': 'V', 'U': 'V', 'UF': 'V', 'I1': 'A', 'I2': 'A', 'I3': 'A', 'IL': 'A', 'R1': 'Ω', 'R2': 'Ω', 'Rx': 'Ω', 'Z': 'Ω', 'R': 'Ω', 'XL': 'Ω', 'XC': 'Ω',
               'f': 'Hz', 't': 's', 'dt': 's', 'L': 'H', 'C': 'F', 'P': 'W', 'PF': '', 'Rloop': 'Ω', 'I': 'A', 'Rin': 'Ω'}


def labbdata():
    rot = tempfile.mkdtemp(prefix='kallrev-')
    subprocess.run(f'git archive {kallor.KALLREV} sjoskolan | tar -x -C {rot}', shell=True, cwd=kallor.REPO, check=True)
    r = subprocess.run(['node', str(HAR / 'labbar.mjs'), rot], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def teori_for(deck, teori):
    ut = []
    for kid in re.findall(r'v(\d\d)_(\d\d)', deck or ''):
        t = f'T-bildspel-v{kid[0]}-{kid[1]}'
        if t in teori and t not in ut:
            ut.append(t)
    return ut


def parametrar(p):
    ut = {}
    for k, v in p.items():
        d = {'varde': v if not isinstance(v, list) else ', '.join(str(x) for x in v)}
        e = ENHET_PARAM.get(k, '')
        if isinstance(v, list):
            d['beskrivning'] = 'lista (resistanser i samma enhet som svaret)'
        if e:
            d['enhet'] = e
        ut[k] = d
    return ut


def svar_med_berakning(lab, cid, storhet, varde, enhet, tol):
    s = {'storhet': storhet, 'varde': varde, 'tolerans': tol}
    if enhet:
        s['enhet'] = enhet
    b = BER.get(lab, {}).get(cid)
    param = None
    if b:
        s['berakning'] = b[0]
        param = b[1]
    return s, param


def bas(id_, titel, typ, lab, niva='tillampning', teori=(), kalla='', roll=''):
    return {'id': id_, 'titel': N(titel), 'sprak': 'sv', 'typ': typ, 'revision': 1, 'granskning': {'status': 'migrerad'},
            'larande': {'mal': MAL.get(lab, ['LM-4']), 'niva': niva, 'teori': list(teori)},
            'uppgift': {}, 'referenser': {'ursprung': [{'kalla': kalla, 'revision': kallor.KALLREV, 'roll': roll}], 'publik': 'elev', 'losning_publik': True}}


def berakna_param(post, param):
    """Parametrar för en oberoende beräkning. Listor (R) lagras som text och tolkas av lib/berakningar."""
    if param:
        post['parametrar'] = {k: {'varde': v, **({'enhet': ENHET_PARAM[k]} if ENHET_PARAM.get(k) and not isinstance(v, list) else {})} for k, v in param.items()}


# ============================================================================ simulatorernas räkna-först-uppgifter
def simulatoruppgifter(d, teori, nr):
    poster, pl = {}, []
    filer = {'trefaslabbet': 'lessons.mjs', 'vaxelstromslabbet': 'lessons.mjs', 'hallkretslabbet': 'lessons.mjs', 'isolationslabbet': 'lessons.mjs'}
    for lab in ('trefaslabbet', 'vaxelstromslabbet', 'hallkretslabbet', 'isolationslabbet'):
        for n, c in enumerate(d[lab], 1):
            id_ = nr()
            p = bas(id_, c['title'], 'simulator', lab, teori=[f'T-labb-{lab}'] + teori_for(c.get('deck'), teori),
                    kalla=f'{lab}/{filer[lab]} CHALLENGES[{n - 1}] (id {c["id"]})', roll='räkna-först-uppgift i simulatorn')
            p['uppgift']['fraga'] = N(c['task'])
            if c.get('hint'):
                p['ledtradar'] = [{'niva': 'metod', 'text': N(c['hint']), 'status': 'migrerad'}]
            ask = c['ask']
            tol = {k2: v for k2, v in (('rel', ask.get('rel')), ('abs', ask.get('abs'))) if v is not None}
            s, param = svar_med_berakning(lab, c['id'], N(ask['label']), c['expected'], ask.get('unit'), tol or {'rel': 0.02})
            p['losning'] = {'svar': [s], 'status': 'migrerad' if c.get('solution') else 'saknas', 'kalla': 'Simulatorns modell (facit räknas med registrerad funktion)'}
            if c.get('solution'):
                p['losning'] = {'text': N(c['solution']), **p['losning']}
            berakna_param(p, param)
            sim = {'labb': lab, 'validering': {'typ': 'numerisk', 'funktion': f'{lab}.forvantat', 'facit': c['expected']}}
            if tol:
                sim['validering']['tolerans'] = tol
            if c.get('tab'):
                sim['scenario'] = c['tab']
            sim['initial'] = c.get('setup') or c.get('set') or {'steg': c.get('steps')}
            fr = {'storhet': ask['key'], 'etikett': N(ask['label'])}
            if ask.get('unit'):
                fr['enhet'] = ask['unit']
            if 'phase' in ask:
                fr['fas'] = ask['phase']
            if 'scale' in ask:
                fr['skala'] = ask['scale']
            if ask.get('absolute'):
                fr['belopp'] = True
            sim['fraga'] = fr
            if c.get('mask'):
                sim['dolj'] = c['mask']
            if c.get('hideFault'):
                sim['dolj_fel'] = True
            sim['aterkoppling'] = {'vanliga_fel': [{'varde': m['v'], 'text': N(m['msg'])} for m in c['mistakes']]}
            if c.get('after'):
                sim['aterkoppling']['ratt'] = N(c['after'])
            if c.get('deck'):
                sim['kallhanvisning'] = N(c['deck'])
            if c.get('theory'):
                sim['teoriavsnitt'] = c['theory']
            sim['alias'] = c['id']
            p['simulator'] = sim
            if p['losning']['svar'][0].get('berakning'):
                p['granskning']['numeriskt_kontrollerad'] = True
            poster[id_] = p
            pl.append({'ovning': id_, 'plats': f'{lab}/uppgifter.gen.mjs', 'del': 'rakna-forst', 'ordning': n, 'nummer': N(c['title']),
                       'ankare': c['id'], 'alias': [f'{lab}?uppgift={c["id"]}']})
    # --- guidad AC-labb (grundprotokollet)
    lab = 'vaxelstromslabbet-guidad'
    for n, t in enumerate(d['guidad'], 1):
        id_ = nr()
        p = bas(id_, t['title'], 'simulator', lab, niva='grund', teori=['T-labb-vaxelstromslabbet', 'T-bildspel-v40-01' if t['lesson'] == 'sinus' else ('T-bildspel-v40-02' if t['lesson'] == 'impedans' else 'T-bildspel-v40-03')],
                kalla=f'vaxelstromslabbet/guided-lessons.mjs GUIDE_TASKS[{n - 1}] (id {t["id"]})', roll='uppgift i den guidade labben')
        p['uppgift']['fraga'] = N(t['prompt'])
        p['ledtradar'] = [{'niva': 'metod', 'text': N(t['method']), 'status': 'migrerad'}]
        svar = []
        for k, lbl, enh in t['fields']:
            s, param = svar_med_berakning(lab, t['id'], N(lbl), t['values'][k], enh, {'rel': 0.02})
            svar.append(s)
            berakna_param(p, param)
        p['losning'] = {'svar': svar, 'status': 'saknas', 'kalla': 'Simulatorns modell'}
        p['simulator'] = {'labb': lab, 'scenario': t['lesson'], 'initial': t['setup'], 'validering': {'typ': 'numerisk', 'funktion': 'vaxelstromslabbet.guidevarden'},
                          'fraga': {'falt': [[k, N(lbl), enh] for k, lbl, enh in t['fields']]}, 'teoriavsnitt': t['theory'], 'visualisering': t['visual'],
                          'forklaring': {'fraga': N(t['explain']), 'ledtrad': N(t['hint'])}, 'kalla': N(t['source']), 'alias': t['id']}
        if any(s.get('berakning') for s in svar):
            p['granskning']['numeriskt_kontrollerad'] = True
        poster[id_] = p
        pl.append({'ovning': id_, 'plats': 'vaxelstromslabbet/uppgifter.gen.mjs', 'del': 'guidad', 'ordning': n, 'nummer': N(t['title']), 'ankare': t['id'],
                   'alias': [f'vaxelstromslabbet?lage=guidad&steg={t["id"]}']})
    # --- multimeterlabbets övningar (stegvisa, med registrerade kontrollfunktioner)
    lab = 'multimetersimulator'
    for n, l in enumerate(d['multimeter'], 1):
        id_ = nr()
        typ = 'flerval' if l['circuit'] == 'category' else ('laboration' if l['id'] == 'stationA' else 'matning')
        p = bas(id_, l['title'], typ, lab, niva='grund' if n <= 6 else 'tillampning', teori=['T-labb-multimetersimulator', 'T-bildspel-v39-03'] if l['id'] != 'stationA' else ['T-labb-multimetersimulator', 'T-bildspel-v41-03'],
                kalla=f'multimetersimulator/lessons.mjs LESSONS[{n - 1}] (id {l["id"]})', roll='stegvis övning i multimeterlabbet')
        p['uppgift']['fraga'] = N(l['goal'])
        if typ == 'flerval':
            p['uppgift']['alternativ'] = [N(c) for s in l['steps'] for c in s['choices']][:3]
        steg = []
        for i, s in enumerate(l['steps'], 1):
            st = {'id': s.get('key') or f's{i}', 'text': N(s['task'])}
            if s.get('hint'):
                st['ledtrad'] = N(s['hint'])
            if s.get('why'):
                st['varfor'] = N(s['why'])
            if s.get('kind'):
                st['typ'] = s['kind']
            if s.get('label'):
                st['etikett'] = N(s['label'])
            if 'answer' in s:
                st['svar'] = s['answer']
            if s.get('unit'):
                st['enhet'] = s['unit']
            if 'tolerance' in s:
                st['tolerans'] = {'abs': s['tolerance']}
            if s.get('choices'):
                st['alternativ'] = [N(c) for c in s['choices']]
                st['ratt'] = s['correct']
            kod = {}
            if s.get('test'):
                kod['test'] = f'multimetersimulator.{l["id"]}.{i}'
            for k in ('input', 'comment'):
                if k in s:
                    kod[k] = s[k]
            if kod:
                st['kod'] = kod
            steg.append(st)
        p['labb'] = {'variant': 'simulerad', 'steg': steg}
        if l['id'] == 'stationA':
            p['labb']['station'] = 'Station A'
        sim = {'labb': lab, 'scenario': l['circuit'], 'validering': {'typ': 'steg'}, 'kallhanvisning': f'Multimeter och mätfel, bild {l["slides"]}', 'alias': l['id']}
        if l.get('setup'):
            sim['initial'] = l['setup']
        if l.get('revision'):
            sim['lagringsversion'] = l['revision']
        p['simulator'] = sim
        if l['id'] == 'loading':
            berakna_param(p, {'U': 10, 'R1': 1e6, 'R2': 1e6, 'Rin': 10e6})
            p['losning'] = {'svar': [{'storhet': 'U(M–G) utan mätare', 'varde': 5, 'enhet': 'V', 'tolerans': {'abs': 0.01}, 'berakning': 'spanningsdelare.u2'},
                                     {'storhet': 'U(M–G) med 10 MΩ', 'varde': round(100 / 21, 4), 'enhet': 'V', 'tolerans': {'abs': 0.01}, 'berakning': 'spanningsdelare.belastad'}],
                            'status': 'migrerad', 'kalla': 'Stegens svar och förklaringar'}
            p['granskning']['numeriskt_kontrollerad'] = True
        poster[id_] = p
        pl.append({'ovning': id_, 'plats': 'multimetersimulator/uppgifter.gen.mjs', 'del': 'ovningar', 'ordning': n, 'nummer': f'Övning {n:02d}', 'ankare': l['id'],
                   'alias': [f'multimetersimulator?lektion={l["id"]}']})
    return poster, pl


# ============================================================================ labbprotokoll
PROTOKOLL = [  # (nyckel i labbar.json, labb, station, fysisk station eller None)
    ('STATION_A_PROTOKOLL', 'multimetersimulator', 'Station A', 'A'),
    ('STATION_B_AC_PROTOKOLL', 'vaxelstromslabbet', 'Station B, AC', 'B-AC'),
    ('STATION_B_3F_PROTOKOLL', 'trefaslabbet', 'Station B, trefas', 'B-3f'),
    ('STATION_C_PROTOKOLL', 'hallkretslabbet', 'Station C', 'C'),
    ('ISO_PROTOKOLL', 'isolationslabbet', 'Isolationslabbet', None),
]


def protokoll_post(id_, namn, lab, station, pd):
    d = pd['data']
    p = bas(id_, d['title'].replace('Labbprotokoll: ', 'Labbprotokoll, '), 'laboration', lab, teori=[f'T-labb-{lab}'] + (['T-bildspel-v41-03'] if station.startswith('Station') else ['T-bildspel-v44-03']),
            kalla=f'{pd["fil"]} {namn}', roll='labbprotokoll under simulatorn')
    p['uppgift']['fraga'] = N(d['intro'])
    labb = {'variant': 'simulerad', 'station': N(d['station']), 'utrustning': N(d['instrument']),
            'sakerhet': [{'id': c['k'], 'text': N(c['text'])} for c in d['checks']], 'matningar': [], 'fragor': []}
    for i, r in enumerate(d['rows'], 1):
        m = {'id': f'm{i}', 'titel': N(r['title']), 'storhet': N(r['storhet']), 'punkter': N(r['punkter']), 'forvantat': N(r['forv']), 'tolerans': N(r['tol'])}
        kod = {k: r[k] for k in r if k not in ('title', 'storhet', 'punkter', 'forv', 'tol')}
        if kod:
            m['kod'] = kod
        labb['matningar'].append(m)
    for q in d['questions']:
        f = {'id': q['k'], 'text': N(q['label'])}
        for a, b in (('short', 'kort'), ('minWords', 'min_ord'), ('optional', 'valfri'), ('hint', 'ledtrad'), ('requireText', 'krav_text')):
            if a in q:
                f[b] = N(q[a]) if isinstance(q[a], str) else q[a]
        labb['fragor'].append(f)
    prot = {'nyckel': d['key'], 'titel': N(d['title'])}
    if d.get('rowsIntro'):
        prot['matningsinledning'] = N(d['rowsIntro'])
    if d.get('faults') is not None:
        prot['felsokning'] = {k: d[k] for k in ('faults', 'faultsRequired', 'faultsIntro') if k in d}
    if d.get('example'):
        prot['exempel'] = d['example']
    ovr = pd['ovrigt']
    if 'LAGEN' in ovr:
        prot['lagen'] = ovr['LAGEN']
    rigg = {k: v for k, v in ovr.items() if k != 'LAGEN'}
    if rigg:
        prot['rigg'] = rigg
    labb['protokoll'] = prot
    p['labb'] = labb
    p['losning'] = {'text': 'Protokollet har ett ifyllt exempel för en annan rigg. Förväntade värden räknas av eleven före mätningen.', 'status': 'migrerad'} if d.get('example') else {'status': 'saknas'}
    p['simulator'] = {'labb': lab, 'validering': {'typ': 'protokoll'}, 'alias': d['key']}
    return p


def protokollen(d, nr):
    poster, pl = {}, []
    mall = nr()
    ep = elevprotokoll_mall(mall)
    poster[mall] = ep
    pl.append({'ovning': mall, 'plats': 'vecka-41/aktuell/Elevprotokoll.html', 'del': 'mall', 'ordning': 1, 'nummer': 'Elevprotokoll och riskmall', 'ankare': 'elevprotokoll'})
    fysiska = fysiska_stationer()
    for n, (namn, lab, station, fys) in enumerate(PROTOKOLL, 1):
        sid = nr()
        p = protokoll_post(sid, namn, lab, station, d['protokoll'][namn])
        poster[sid] = p
        pl.append({'ovning': sid, 'plats': f'{lab}/protokoll.gen.mjs', 'del': 'protokoll', 'ordning': 1, 'nummer': N(p['titel']), 'ankare': p['labb']['protokoll']['nyckel'],
                   'alias': [namn]})
        if fys:
            fid = nr()
            f = fysiska[fys]
            fp = bas(fid, f['titel'], 'laboration', lab, teori=['T-bildspel-v41-03', f'T-labb-{lab}'], kalla=f['kalla'], roll='fysisk station vid träffen 9 oktober')
            fp['uppgift']['fraga'] = f['fraga']
            fp['labb'] = {'variant': 'fysisk', 'station': f['station'], 'utrustning': f['utrustning'], 'sakerhet': RAMAR, 'steg': f['steg'],
                          'simulerad_variant': sid, 'protokoll': {'mall': mall, 'titel': 'Elevprotokoll och riskmall'}}
            fp['losning'] = {'status': 'saknas', 'kalla': 'Bedöms vid stationen enligt bedömningsraderna i elevprotokollet'}
            p['labb']['fysisk_variant'] = fid
            poster[fid] = fp
            pl.append({'ovning': fid, 'plats': 'vecka-41/aktuell/Simulerade_stationer.html', 'del': 'stationer', 'ordning': n, 'nummer': f['station'], 'ankare': f'station-{fys.lower()}', 'roll': 'fysisk'})
    return poster, pl


RAMAR = [{'id': 'rigg', 'text': 'Instruktören kontrollerar rigg, strömgräns och instrument.'},
         {'id': 'selv', 'text': 'Elevpraktik sker på avsedd SELV-utrustning eller spänningslöst.'},
         {'id': 'klar', 'text': 'Klartecken före energisättning.'},
         {'id': 'omk', 'text': 'Omkoppling sker frånskilt. Avbryt vid skada, värme eller osäkerhet.'},
         {'id': 'trefas', 'text': 'Trefasmätning kräver en avsedd, dokumenterad rigg.'}]


def fysiska_stationer():
    """De fysiska stationerna vid träffen: presentationen v41_03 (bild 6–8 och 21) och stationssidan."""
    s = kallor.git_text('vecka-41/aktuell/Simulerade_stationer.html')
    k = 'vecka-41/aktuell/v41_03_Fysisk_traff_och_matning_elev.pptx'
    return {
        'A': {'titel': 'Station A: DC-delare, fysisk station', 'station': 'Station A', 'kalla': f'{k} bild 7; Simulerade_stationer.html',
              'fraga': '12 V DC matar 1 kΩ och 2 kΩ i serie. Förutsäg ström och spänningsfall före mätningen och mät sedan på riggen.',
              'utrustning': 'SELV-källa märkt 12 V med strömgräns 100 mA. R_{1} = 1 kΩ och R_{2} = 2 kΩ, båda ±5 %, i serie. Länk P–A för strömmätning. Multimeter med V ⎓, Ω och mA.',
              'steg': [{'id': 's1', 'text': 'Beräkna I och U_{2} i övning 2 före mätningen. I = U/(R_{1} + R_{2}).'},
                       {'id': 's2', 'text': 'Instruktören granskar mätplan och anslutningar före start.'},
                       {'id': 's3', 'text': 'Mät och fyll i elevprotokollet: mätpunkt, driftläge, värde med enhet och jämförelse med förväntat.'}]},
        'B-AC': {'titel': 'Station B: AC, fysisk station', 'station': 'Station B, AC', 'kalla': f'{k} bild 8; Simulerade_stationer.html',
                 'fraga': 'Mät effektivvärde, toppvärde och periodtid på en isolerad AC-källa och jämför två multimetrar för olika kurvformer.',
                 'utrustning': 'Avsedd isolerad AC-källa (funktionsgenerator med effektförstärkare, märkt 12 V 50 Hz) och lämpligt RMS-instrument. Kalibrator 10,00 V för instrumentkontroll.',
                 'steg': [{'id': 's1', 'text': 'Förberedelse: övning 4 i v41_03.'},
                          {'id': 's2', 'text': 'Mät endast vid riggens dokumenterade mätpunkter.'},
                          {'id': 's3', 'text': 'Fyll i elevprotokollet och förklara minst en avvikelse med egna ord.'}]},
        'B-3f': {'titel': 'Station B: trefas, fysisk station', 'station': 'Station B, trefas', 'kalla': f'{k} bild 8; Simulerade_stationer.html',
                 'fraga': 'Mät grenspänning, fasströmmar och neutralström på trefasriggen. Undersök hur grenspänningarna ändras när neutralledaren bryts.',
                 'utrustning': 'SELV-trefasrigg med huvudspänning (linjespänning) 12,2 V. Tre resistiva laster i Y märkta 100 Ω ±5 %. Neutralledaren kan brytas och varje last kopplas från. Strömmätlänkar i alla fyra ledare.',
                 'steg': [{'id': 's1', 'text': 'Förberedelse: övning 5 i v41_03 och v41_01 om neutralledaren. U_{gren} = U_{L}/√3 i symmetrisk Y.'},
                          {'id': 's2', 'text': 'Saknas trefasrigg: räkna på övningsdata eller i Trefaslabbet och dokumentera det som teori.'},
                          {'id': 's3', 'text': 'Fyll i elevprotokollet och förklara minst en avvikelse med egna ord.'}]},
        'C': {'titel': 'Station C: hållkrets, fysisk station', 'station': 'Station C', 'kalla': f'{k} bild 21; Simulerade_stationer.html',
              'fraga': 'Jämför hållkretsens förväntade funktion med den observerade: vila, start, hållning och stopp. Felsök en förberedd felmodul.',
              'utrustning': 'Hållkrets med 12 V DC styrspänning: S0 STOPP (NC), S1 START (NO) parallellt med K1:s hjälpkontakt (NO), K1-spole och retur. Instruktören använder säkra förberedda felmoduler.',
              'steg': [{'id': 's1', 'text': 'Förutsäg spänningarna i punkterna i vila, start, hållning och stopp.'},
                       {'id': 's2', 'text': 'Håll isär observation och hypotes. ”K1 släpper efter START” är en observation. ”Avbrott i hållvägen” är en hypotes som behöver prövas.'},
                       {'id': 's3', 'text': 'Fyll i felsökningsraden i elevprotokollet: observation, hypotes, kontroll och förväntat resultat.'}]},
    }


def elevprotokoll_mall(id_):
    s = kallor.git_text('vecka-41/aktuell/Elevprotokoll.html')
    krit = [N(kallor.inline(x)) for x in re.findall(r'<li>(.*?)</li>', s[s.find('Bedömning'):], flags=re.S)][:6]
    p = bas(id_, 'Elevprotokoll och riskmall', 'mall', 'multimetersimulator', teori=['T-bildspel-v41-03'], kalla='vecka-41/aktuell/Elevprotokoll.html', roll='protokollmall för de fysiska stationerna')
    p['larande']['mal'] = ['LM-6', 'LM-7', 'LM-9']
    p['uppgift']['fraga'] = 'Fyll i direkt på sidan eller skriv ut och fyll i för hand: riskbedömning före start, mätplan, resultat, analys och avslut.'
    p['bedomning'] = {'kriterier': krit}
    return p


# ============================================================================ vecka 40: kontrollfrågor i genomgångarna
def kontrollfragor(d, nr):
    poster, pl = {}, []
    for l in d['lektioner']:
        n = 0
        for i, s in enumerate(l['slides'], 1):
            if 'check' not in s:
                continue
            n += 1
            id_ = nr()
            eget = s['id'] == 'eget'
            p = bas(id_, s['title'] if not eget else f'{s["title"]}: {l["title"].lower()}', 'berakning' if re.search(r'\d', s.get('answer', '')) else 'resonemang', 'vaxelstromslabbet',
                    niva='grund', teori=[f'T-bildspel-v40-0{l["number"]}', 'T-labb-vaxelstromslabbet'], kalla=f'vecka-40/aktuell/lektioner.mjs LESSONS {l["id"]} bild {s["id"]}', roll='kontrollfråga i genomgången')
            p['uppgift']['fraga'] = N(' '.join(s['body'])) if eget else N(s['check'])
            if eget:
                p['uppgift']['instruktion'] = N(s['check'])
            p['losning'] = {'text': N(s['answer']), 'status': 'migrerad'}
            poster[id_] = p
            pl.append({'ovning': id_, 'plats': 'vecka-40/aktuell/kontrollfragor.gen.mjs', 'del': l['id'], 'ordning': n, 'nummer': s['title'], 'ankare': f'{l["id"]}:{s["id"]}'})
    return poster, pl


YTINFO = {
    'simulator': ('Simulatorernas uppgifter', 'elev', 'simulatorer', 'Räkna-först-uppgifter, guidade uppgifter och stegvisa övningar i labbarna.'),
    'protokoll': ('Labbprotokoll och stationer', 'elev', 'protokoll', 'Simulerade labbprotokoll under simulatorerna, de fysiska stationerna och protokollmallen.'),
    'genomgang-v40': ('Vecka 40: kontrollfrågor i genomgångarna', 'elev', 'simulatorer', 'Prova själv-frågorna i genomgångarna och presentationerna för vecka 40.'),
}


def alla(teori, logg, inventera, ursprung):
    d = labbdata()
    raknare = iter(range(301, 1000))
    nr = lambda: f'EL-{next(raknare):06d}'  # noqa: E731
    poster, ytor = {}, {}
    p, pl = simulatoruppgifter(d, teori, nr)
    poster.update(p)
    ytor['simulator'] = pl
    inventera('simulatorer', 'trefas-, växelströms-, hållkrets- och isolationslabbet: lessons.mjs CHALLENGES', 'räkna-först-uppgift med facit, ledtråd och vanliga fel', sum(len(d[x]) for x in ('trefaslabbet', 'vaxelstromslabbet', 'hallkretslabbet', 'isolationslabbet')))
    inventera('simulatorer', 'vaxelstromslabbet/guided-lessons.mjs GUIDE_TASKS', 'guidad uppgift med förutsägelse, avläsning och förklaring', len(d['guidad']))
    inventera('simulatorer', 'multimetersimulator/lessons.mjs LESSONS (inkl. STATION_A)', 'stegvis övning med kontrollfunktion per steg', len(d['multimeter']))
    raknare2 = iter(range(401, 500))
    nr2 = lambda: f'EL-{next(raknare2):06d}'  # noqa: E731
    p, pl = protokollen(d, nr2)
    poster.update(p)
    ytor['protokoll'] = pl
    inventera('simulatorer', 'fem protokollmoduler (stationA, stationB AC och trefas, stationC, isolation)', 'labbprotokoll med kontroller, mätningar, frågor och ifyllt exempel', 5)
    inventera('kurs', 'vecka-41/aktuell/Elevprotokoll.html', 'protokollmall för fysiska stationer med bedömningsrader', 1)
    inventera('presentation', 'v41_03 bild 6–8 och 21', 'fysiska stationer A, B (AC och trefas) och C', 4)
    raknare3 = iter(range(501, 520))
    nr3 = lambda: f'EL-{next(raknare3):06d}'  # noqa: E731
    p, pl = kontrollfragor(d, nr3)
    poster.update(p)
    ytor['genomgang-v40'] = pl
    inventera('kurs', 'vecka-40/aktuell/lektioner.mjs (bilder med check/answer)', 'kontrollfråga med svar i genomgång och presentation', len(p))
    import familjer_sidor
    p, y = familjer_sidor.alla(teori, logg, inventera)
    poster.update(p)
    for k, v in y.items():
        ytor.setdefault(k, []).extend(v)
    return poster, ytor


def ytinfo():
    import familjer_sidor
    return {**YTINFO, **familjer_sidor.YTINFO}
