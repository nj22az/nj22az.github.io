"""Sidfamiljer: arbetsblad och förberedelsefrågor (v37), elevuppgifter och fördjupning (v38), multimeterövningar (v39_03),
Kirchhoff-seminariet (v39_04), start- och avslutsfrågor i presentationerna, inlämningsuppgifter (med lärarfacit) och övningstentan.

Presentationernas textformer registreras i placeringarna (former) så att exportören kan skriva om bilderna.
"""
import html as _html
import json
import os
import re
from pathlib import Path

import kallor
import text as T

N = T.normalisera
LARARGUIDE = os.environ.get('LARARGUIDE_KLARTEXT')  # klartext utanför repot; utan den migreras inga lärarfacit


def bas(id_, titel, typ, mal, niva, teori, kalla, roll, publik='elev'):
    return {'id': id_, 'titel': N(titel), 'sprak': 'sv', 'typ': typ, 'revision': 1, 'granskning': {'status': 'migrerad'},
            'larande': {'mal': mal, 'niva': niva, 'teori': teori}, 'uppgift': {},
            'referenser': {'ursprung': [{'kalla': kalla, 'revision': kallor.KALLREV, 'roll': roll}], 'publik': publik}}


def former(kid):
    return {int(k): v for k, v in kallor.deck_former(kid).items()}


def txt(f, bild, sid):
    return N(' '.join(p for _, p in [(s, ' '.join(x)) for s, x in f[bild] if s == sid]))


# ============================================================================ vecka 37: arbetsblad och förberedelsefrågor
def arbetsblad(nr):
    poster, y_kurs, y_pres = {}, [], []
    s = kallor.git_text('vecka-37/aktuell/01A_Elens_grunder/Arbetsblad.html')
    fa = former('v37_02')
    bild = {1: (11, 36), 2: (16, 43), 3: (None, None), 4: (25, 7), 5: (29, 42), 6: (34, 7), 7: (37, 7)}
    for m in re.finditer(r'<h2>E(\d): (.*?)</h2><p>(.*?)</p><p><a href="([^"]+)">(.*?)</a></p>', s):
        n, titel, fraga, bildlank, bildtext = int(m.group(1)), m.group(2), m.group(3), m.group(4), m.group(5)
        id_ = nr()
        p = bas(id_, titel, 'berakning' if n in (3, 4, 7) else 'resonemang', ['LM-4'], 'grund', ['T-bildspel-v37-02'],
                f'vecka-37/aktuell/01A_Elens_grunder/Arbetsblad.html E{n}; v37_02 bild {bild[n][0]}', 'arbetsblad 1A och presentationsbild')
        p['uppgift'] = {'fraga': N(kallor.inline(fraga)), 'instruktion': 'Mitt svar och min motivering:'}
        p['referenser']['tillgangar'] = [{'id': 'bild', 'fil': bildlank.replace('../../../', ''), 'alt': N(kallor.inline(bildtext))}]
        p['losning'] = {'status': 'saknas', 'kalla': 'Gås igenom på lektionen; lärarfacit i lärarguiden vecka 37'}
        if bild[n][0]:
            p['uppgift']['kortfraga'] = txt(fa, bild[n][0], bild[n][1]).split(': ', 1)[-1]
        poster[id_] = p
        y_kurs.append({'ovning': id_, 'plats': 'vecka-37/aktuell/01A_Elens_grunder/Arbetsblad.html', 'del': '1A', 'ordning': n, 'nummer': f'E{n}', 'ankare': f'e{n}'})
        if bild[n][0]:
            y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK['v37_02'], 'del': 'v37_02', 'ordning': n, 'nummer': f'E{n}', 'bild': bild[n][0], 'roll': 'ovning',
                           'former': {'kortfraga': str(bild[n][1])}})
    s = kallor.git_text('vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html')
    fall = {}
    for namn, text in re.findall(r'<h2>Fall (A|B)</h2><p>(.*?)</p>', s):
        id_ = nr()
        p = bas(id_, f'Fall {namn}: arbetslampan på däck' if namn == 'A' else 'Fall B: gångvägen, reservlampor och pumpen', 'fall', ['LM-2', 'LM-9'], 'grund', ['T-bildspel-v37-04'],
                f'vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html Fall {namn}', 'gemensamt fall för arbetsblad 1B')
        p['uppgift'] = {'fraga': N(kallor.inline(text))}
        poster[id_] = p
        fall[namn] = id_
        y_kurs.append({'ovning': id_, 'plats': 'vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html', 'del': '1B', 'ordning': 1 if namn == 'A' else 2, 'nummer': f'Fall {namn}', 'ankare': f'fall-{namn.lower()}', 'roll': 'fall'})
    fb = former('v37_04')
    bild = {1: 6, 2: 13, 3: 20, 4: 23, 5: 29, 6: 32, 7: 33, 8: 37}
    for m in re.finditer(r'<h2>E(\d): (.*?)</h2><p>Bild (\d+)\.</p><p>(.*?)</p><p>Mitt svar: _+</p>(<table>.*?</table>)?', s, flags=re.S):
        n, titel, fraga, tab = int(m.group(1)), m.group(2), m.group(4), m.group(5)
        id_ = nr()
        p = bas(id_, titel, 'resonemang', ['LM-2', 'LM-9'], 'grund', ['T-bildspel-v37-04'],
                f'vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html E{n}; v37_04 bild {bild[n]}', 'arbetsblad 1B och presentationsbild')
        p['uppgift'] = {'fraga': N(kallor.inline(fraga)), 'fall': fall['B' if n >= 5 else 'A'], 'instruktion': 'Mitt svar:',
                        'kortfraga': txt(fb, bild[n], 6)}
        if tab:
            p['uppgift']['svarsformat'] = 'Fält: ' + '; '.join(N(kallor.inline(x)) for x in re.findall(r'<tr><td>(.*?)</td>', tab))
        p['losning'] = {'status': 'saknas', 'kalla': 'Gås igenom på lektionen'}
        poster[id_] = p
        y_kurs.append({'ovning': id_, 'plats': 'vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html', 'del': '1B', 'ordning': n + 2, 'nummer': f'E{n}', 'ankare': f'e{n}'})
        y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK['v37_04'], 'del': 'v37_04', 'ordning': n, 'nummer': f'E{n}', 'bild': bild[n], 'roll': 'ovning', 'former': {'titel': '4', 'kortfraga': '6'}})
    # förberedelsefrågor 1A och 1B: en bild med sex frågor
    for kid, del_, teori in (('v37_01', '1A', 'T-bildspel-v37-02'), ('v37_03', '1B', 'T-bildspel-v37-04')):
        f = former(kid)
        fragor = [x for s_, x in f[1] if s_ == 2][0]
        for n, q in enumerate(fragor, 1):
            id_ = nr()
            p = bas(id_, f'Förberedelsefråga {del_}: {n}', 'reflektion', ['LM-4' if del_ == '1A' else 'LM-2'], 'forberedelse', [teori],
                    f'{kallor.ALLA_DECK[kid]} bild 1, stycke {n}', 'förberedelsefråga före genomgången')
            p['uppgift'] = {'fraga': N(q), 'instruktion': 'Fundera i 10–15 minuter och skriv några stödord. Du behöver inte kunna svaret ännu.'}
            poster[id_] = p
            y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK[kid], 'del': kid, 'ordning': n, 'nummer': str(n), 'bild': 1, 'roll': 'forberedelse', 'former': {'fraga': f'2/{n}'}})
    return poster, y_kurs, y_pres


# ============================================================================ vecka 38
def vecka38(nr):
    poster, y_kurs, y_pres = {}, [], []
    s = kallor.git_text('vecka-38/aktuell/Elevuppgifter.html')
    for m in re.finditer(r'<h2>V2-(\d): (.*?)</h2><p><strong>Underlag:</strong> (.*?)</p><p><strong>Uppgift:</strong> (.*?)</p><p><strong>Lämna:</strong> (.*?)</p>', s):
        n = int(m.group(1))
        id_ = nr()
        p = bas(id_, m.group(2), 'berakning' if n == 3 else 'resonemang', ['LM-2', 'LM-6'] if n != 3 else ['LM-4', 'LM-8'], 'tillampning', ['T-bildspel-v38-01'],
                f'vecka-38/aktuell/Elevuppgifter.html V2-{n}', 'elevuppgift vecka 38')
        p['uppgift'] = {'scenario': N(kallor.inline(m.group(3))), 'fraga': N(kallor.inline(m.group(4))), 'instruktion': N(kallor.inline(m.group(5)))}
        p['losning'] = {'status': 'saknas', 'kalla': 'Lärarguiden vecka 38'}
        if n == 3:
            p['parametrar'] = {'U': {'varde': 12.0, 'enhet': 'V'}, 'rel': {'varde': 0.005}, 'siffror': {'varde': 2}, 'upplosning': {'varde': 0.01, 'enhet': 'V'}}
            p['losning'] = {'text': 'δ = 0,005 · 12,00 + 2 · 0,01 = 0,08 V. Intervall 11,92–12,08 V. 12,04 V ligger inom intervallet: avvikelsen kan inte hävdas säkert.',
                            'svar': [{'storhet': 'δ', 'varde': 0.08, 'enhet': 'V', 'tolerans': {'abs': 0.001}, 'berakning': 'matosakerhet.grans'}], 'status': 'migrerad', 'kalla': 'Bildspel v38 och lärarguiden'}
            p['granskning']['numeriskt_kontrollerad'] = True
        poster[id_] = p
        y_kurs.append({'ovning': id_, 'plats': 'vecka-38/aktuell/Elevuppgifter.html', 'del': 'v38', 'ordning': n, 'nummer': f'V2-{n}', 'ankare': f'v2-{n}'})
    s = kallor.git_text('vecka-38/aktuell/Fordjupning_elev.html')
    for n, m in enumerate(re.finditer(r'<h2>Fall (\w): (.*?)</h2><p>(.*?)</p><p>(.*?)</p><p><strong>Redovisning:</strong> (.*?)</p>', s), 1):
        id_ = nr()
        p = bas(id_, f'Fall {m.group(1)}: {m.group(2)}', 'resonemang', ['LM-4', 'LM-8'], 'fordjupning', ['T-bildspel-v38-01'],
                f'vecka-38/aktuell/Fordjupning_elev.html Fall {m.group(1)}', 'fördjupning vecka 38')
        p['uppgift'] = {'scenario': N(kallor.inline(m.group(3))), 'fraga': N(kallor.inline(m.group(4))), 'instruktion': N(kallor.inline(m.group(5)))}
        p['losning'] = {'status': 'saknas'}
        poster[id_] = p
        y_kurs.append({'ovning': id_, 'plats': 'vecka-38/aktuell/Fordjupning_elev.html', 'del': 'fordjupning', 'ordning': n, 'nummer': f'Fall {m.group(1)}', 'ankare': f'fall-{m.group(1).lower()}'})
    f = former('v38_01')
    id_ = nr()
    p = bas(id_, 'Fel instrumentläge', 'resonemang', ['LM-6'], 'grund', ['T-bildspel-v38-01'], f'{kallor.ALLA_DECK["v38_01"]} bild 17', 'övning i presentationen')
    p['uppgift'] = {'fraga': txt(f, 17, 2)}
    p['losning'] = {'status': 'saknas'}
    poster[id_] = p
    y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK['v38_01'], 'del': 'v38_01', 'ordning': 1, 'nummer': 'Övning', 'bild': 17, 'roll': 'ovning', 'former': {'fraga': '2'}})
    for n, q in enumerate([x for s_, x in f[19] if s_ == 2][0], 1):
        id_ = nr()
        p = bas(id_, f'Exitfråga {n}', 'reflektion', ['LM-6'], 'grund', ['T-bildspel-v38-01'], f'{kallor.ALLA_DECK["v38_01"]} bild 19', 'exitfråga')
        p['uppgift'] = {'fraga': N(q)}
        poster[id_] = p
        y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK['v38_01'], 'del': 'v38_01', 'ordning': n, 'nummer': str(n), 'bild': 19, 'roll': 'avslut', 'former': {'fraga': f'2/{n}'}})
    return poster, y_kurs, y_pres


# ============================================================================ v39_03: Multimeter och mätfel
MM = [  # (övningsbild, frågeformer, facitbild, facitformer, titel, typ)
    (10, [35, 33, 34], None, [], 'Spänningen över H1', 'matning'), (17, [39, 37, 38], None, [], 'Strömmen genom H1', 'matning'),
    (22, [29, 30, 31], 23, [29, 30, 31, 32], 'Vad är fel före anslutning', 'resonemang'), (30, [4, 26], 31, [27, 28], 'Två möjliga mätvägar', 'berakning'),
    (38, [4, 6], 39, [6, 7], 'Vilken märkning räcker', 'flerval'), (47, [19, 20, 21, 22], 48, [4, 5, 6, 7], 'Multimetern visar 24,00 V', 'berakning'),
    (50, [4, 5, 6, 7], 51, [4, 22], 'Ryms hela mätintervallet', 'berakning'), (53, [4, 5, 6, 7], None, [], 'Nästa vakt behöver förstå mätningen', 'resonemang'),
    (58, [4, 26], 59, [4, 26, 27], 'Spänningen med ansluten mätare', 'berakning'), (60, [4, 33], 61, [4, 27, 26], 'Lägre ingångsresistans', 'berakning'),
]
MM_SVAR = {4: [{'storhet': 'R', 'varde': 500, 'enhet': 'Ω', 'tolerans': {'rel': 0.001}, 'berakning': 'parallell.resistans'}],
           6: [{'storhet': 'δ', 'varde': 0.14, 'enhet': 'V', 'tolerans': {'abs': 0.001}, 'berakning': 'matosakerhet.grans'}],
           9: [{'storhet': 'U_{m}', 'varde': 4.762, 'enhet': 'V', 'tolerans': {'abs': 0.001}, 'berakning': 'spanningsdelare.belastad'}],
           10: [{'storhet': 'U_{m}', 'varde': 3.333, 'enhet': 'V', 'tolerans': {'abs': 0.001}, 'berakning': 'spanningsdelare.belastad'}]}
MM_PARAM = {4: {'R': [1000, 1000]}, 6: {'U': 24.0, 'rel': 0.005, 'siffror': 2, 'upplosning': 0.01},
            9: {'U': 10, 'R1': 1e6, 'R2': 1e6, 'Rin': 10e6}, 10: {'U': 10, 'R1': 1e6, 'R2': 1e6, 'Rin': 1e6}}


def multimeter_deck(nr):
    poster, y_pres = {}, []
    f = former('v39_03')
    for n, (b, fr, fb, ff, titel, typ) in enumerate(MM, 1):
        id_ = nr()
        p = bas(id_, titel, typ, ['LM-4', 'LM-6'], 'grund', ['T-bildspel-v39-03', 'T-labb-multimetersimulator'],
                f'{kallor.ALLA_DECK["v39_03"]} bild {b}' + (f' och facit bild {fb}' if fb else ''), 'övning i presentationen Multimeter och mätfel')
        p['uppgift'] = {'fraga': ' '.join(txt(f, b, s) for s in fr)}
        if typ == 'flerval':
            p['uppgift']['alternativ'] = ['Instrument A: CAT II 1 000 V', 'Instrument B: CAT III 600 V']
        if typ == 'matning':  # genomförs som övning i Multimeterlabbet
            p['simulator'] = {'labb': 'multimetersimulator', 'validering': {'typ': 'steg'}, 'alias': 'voltage' if n == 1 else 'current'}
        if fb:
            p['losning'] = {'text': ' '.join(txt(f, fb, s) for s in ff), 'status': 'migrerad', 'kalla': f'Facitbild {fb}'}
            if n in MM_SVAR:
                p['losning']['svar'] = MM_SVAR[n]
                p['parametrar'] = {k: {'varde': v} for k, v in MM_PARAM[n].items()}
                p['granskning']['numeriskt_kontrollerad'] = True
        else:
            p['losning'] = {'status': 'saknas', 'kalla': 'Genomförs i Multimeterlabbet' if typ == 'matning' else 'Diskuteras på lektionen'}
        p['referenser']['losning_publik'] = True
        poster[id_] = p
        pl = {'ovning': id_, 'plats': kallor.ALLA_DECK['v39_03'], 'del': 'v39_03', 'ordning': n, 'nummer': f'Övning {n}', 'bild': b, 'roll': 'ovning',
              'former': {f'fraga/{i}': str(s) for i, s in enumerate(fr, 1)}, 'kontroll': True}
        if fb:
            pl['stodbild'] = fb
            pl['former'].update({f'stod/losning/{i}': str(s) for i, s in enumerate(ff, 1)})
        y_pres.append(pl)
    return poster, y_pres


# ============================================================================ v39_04: Kirchhoff-seminariet
def seminarium(nr):
    poster, y_pres = {}, []
    f = former('v39_04')
    ovn = {1: 20, 2: 22, 3: 24, 4: 26, 5: 28, 6: 32, 7: 34, 8: 36, 9: 38, 10: 40}
    for n, b in ovn.items():
        st = b - 1
        id_ = nr()
        titel = txt(f, b, 2).split('. ', 1)[1]
        p = bas(id_, titel, 'berakning', ['LM-4'], 'grund' if n <= 4 else ('tillampning' if n <= 8 else 'analys'), ['T-bildspel-v39-04', 'T-kurs-v39-02'],
                f'{kallor.ALLA_DECK["v39_04"]} bild {st} och {b}', 'seminarieövning med stödbild')
        sist = max(s for s, x in f[b] if s != 9001 and not ' '.join(x).strip().isdigit())
        p['uppgift'] = {'scenario': txt(f, b, 3), 'fraga': txt(f, b, sist), 'samband': [N(x) for x in txt(f, st, 16).split(' / ')], 'givet': txt(f, st, 18).split(': ', 1)[-1]}
        p['ledtradar'] = [{'niva': 'begrepp', 'text': txt(f, st, 17), 'status': 'migrerad'}, {'niva': 'metod', 'text': txt(f, st, 19).split(': ', 1)[-1], 'status': 'migrerad'}]
        p['losning'] = {'status': 'saknas', 'kalla': 'Löses gemensamt på seminariet'}
        poster[id_] = p
        y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK['v39_04'], 'del': 'v39_04', 'ordning': n, 'nummer': f'{n}', 'bild': b, 'stodbild': st, 'roll': 'ovning',
                       'former': {'titel': '2', 'scenario': '3', 'fraga': str(sist), 'stod/samband': '16', 'stod/begrepp': '17', 'stod/givet': '18', 'stod/metod': '19'}})
    for n, q in enumerate([x for s, x in f[41] if s in (3, 4, 5)], 1):
        id_ = nr()
        p = bas(id_, f'Kontrollfråga {n} efter seminariet', 'reflektion', ['LM-4'], 'grund', ['T-bildspel-v39-04'], f'{kallor.ALLA_DECK["v39_04"]} bild 41', 'avslutande kontrollfråga')
        p['uppgift'] = {'fraga': N(' '.join(q))}
        poster[id_] = p
        y_pres.append({'ovning': id_, 'plats': kallor.ALLA_DECK['v39_04'], 'del': 'v39_04', 'ordning': n, 'nummer': str(n), 'bild': 41, 'roll': 'avslut', 'former': {'fraga': str(n + 2)}})
    return poster, y_pres


# ============================================================================ start- och avslutsfrågor i 17 presentationer
def start_avslut(nr):
    poster, y_pres = {}, []
    for kid, fil in kallor.DECK.items():
        f = former(kid)
        n = max(f)
        sist = n if any('Avslut' in ' '.join(x) for _, x in f[n]) else n - 1
        t = f'T-bildspel-{kid.replace("_", "-")}'
        for roll, b, sid, titel in (('start', 2, 6, 'Startfråga'), ('avslut', sist, 3, 'Avslutsfråga')):
            id_ = nr()
            p = bas(id_, f'{titel}: {kid}', 'reflektion', ['LM-4'], 'forberedelse' if roll == 'start' else 'grund', [t], f'{fil} bild {b}', f'{titel.lower()} i presentationen')
            p['uppgift'] = {'fraga': txt(f, b, sid)}
            if roll == 'avslut':
                p['uppgift']['instruktion'] = txt(f, b, 4)
            poster[id_] = p
            pl = {'ovning': id_, 'plats': fil, 'del': kid, 'ordning': 1, 'nummer': titel, 'bild': b, 'roll': roll, 'former': {'fraga': str(sid)}}
            if roll == 'avslut':
                pl['former']['instruktion'] = '4'
            y_pres.append(pl)
    return poster, y_pres


# ============================================================================ inlämningsuppgifter med lärarfacit
def inlamning(nr, logg):
    ns = {}
    src = kallor.git_text('verktyg/inlamning/bygg.py')
    exec(src.split("\n\ndef datum")[0].replace("ROOT = Path(__file__).resolve().parents[2]", "ROOT = None"), ns)
    U = ns['UPPGIFTER']
    facit = lararfacit()
    poster, y = {}, []
    for v, w in U.items():
        for n, x in enumerate(w['uppgifter'], 1):
            id_ = nr()
            typ = 'berakning' if re.search(r'\bD\b', x['text'] + ' '.join(x['delar'])) else 'resonemang'
            p = bas(id_, x['titel'], typ, ['LM-4'] if typ == 'berakning' else ['LM-2', 'LM-7'], 'tillampning', [], f'verktyg/inlamning/bygg.py UPPGIFTER[{v}][{n - 1}]', 'inlämningsuppgift')
            p['uppgift'] = {'fraga': N(x['text']), 'delfragor': [{'id': 'abcdefgh'[i], 'text': N(d)} for i, d in enumerate(x['delar'])], 'svarsformat': N(x['redovisa'])}
            if typ == 'berakning':
                p['parametrar'] = {'D': {'varde': 'D', 'beskrivning': 'Elevens tal: dagen i månaden eleven är född, 1–31'}}
            p['referenser']['resurser'] = [{'url': h.replace('../../', ''), 'titel': N(t)} for h, t in x['anvand']]
            for h, t in x['anvand']:
                m = re.search(r'd=(v\d\d_\d\d)', h)
                if m:
                    p['larande']['teori'].append(f'T-bildspel-{m.group(1).replace("_", "-")}')
                for lab in ('multimetersimulator', 'vaxelstromslabbet', 'trefaslabbet', 'hallkretslabbet', 'isolationslabbet'):
                    if lab in h:
                        p['larande']['teori'].append(f'T-labb-{lab}')
            p['larande']['teori'] = list(dict.fromkeys(p['larande']['teori'])) or ['T-formelblad']
            p['losning'] = {'status': 'saknas', 'kalla': 'Lärarfacit (skyddat)'}
            p['referenser']['losning_publik'] = False
            rader = facit.get((v, n), [])
            if rader:
                p['larare'] = {'facit_rader': rader, 'bedomning': 'Svar räknas som rätta inom ±2 % eller avrundningen i sista siffran.'}
            poster[id_] = p
            y.append({'ovning': id_, 'plats': f'vecka-{v}/aktuell/Inlamning.html', 'del': str(v), 'ordning': n, 'nummer': f'Uppgift {n}', 'ankare': f'uppgift-{n}'})
    return poster, y, {v: {'titel': w['titel'], 'sista': w['sista']} for v, w in U.items()}


def lararfacit():
    """Lärarguidens facittabeller (klartext utanför repot) -> {(vecka, uppgiftsnr): [rader]}."""
    if not LARARGUIDE or not Path(LARARGUIDE).exists():
        return {}
    s = Path(LARARGUIDE).read_text(encoding='utf-8')
    ut = {}
    for v, body in re.findall(r'<section class="week" id="v(\d\d)">(.*?)</section>', s, flags=re.S):
        for lbl, attrs, cell in re.findall(r'<tr><td>(.*?)</td><td([^>]*)>(.*?)</td></tr>', body, flags=re.S):
            m = re.match(r'(\d)', lbl)
            if not m:
                continue
            rad = {'etikett': N(kallor.inline(lbl))}
            fm = re.search(r'data-f="([^"]+)"', attrs)
            if fm:
                rad['funktion'] = f'inlamning.{fm.group(1)}'
            else:
                rad['text'] = N(kallor.inline(cell))
            ut.setdefault((int(v), int(m.group(1))), []).append(rad)
    return ut


# ============================================================================ övningstentan
TENTA_SVAR = {1: [{'storhet': 'P', 'varde': 108, 'enhet': 'W', 'tolerans': {'rel': 0.01}, 'berakning': 'effekt.ui'}],
              3: [{'storhet': 'R_{slinga}', 'varde': 0.131, 'enhet': 'Ω', 'tolerans': {'rel': 0.01}, 'berakning': 'ledare.slingresistans'}],
              4: [{'storhet': 'û', 'varde': 325, 'enhet': 'V', 'tolerans': {'rel': 0.01}, 'berakning': 'ac.topp'}],
              5: [{'storhet': '|Z|', 'varde': 50, 'enhet': 'Ω', 'tolerans': {'rel': 0.01}, 'berakning': 'ac.z_serie'}],
              6: [{'storhet': 'I_{L} (Y)', 'varde': 10.0, 'enhet': 'A', 'tolerans': {'rel': 0.01}, 'berakning': 'trefas.linjestrom_y'}],
              11: [{'storhet': 'R', 'varde': 0.625, 'enhet': 'MΩ', 'tolerans': {'rel': 0.01}, 'berakning': 'isolation.resistans_mohm'}],
              12: [{'storhet': 'δ', 'varde': 2.1, 'enhet': 'V', 'tolerans': {'abs': 0.05}, 'berakning': 'matosakerhet.grans'}]}
TENTA_PARAM = {1: {'U': 24, 'I': 4.5}, 3: {'rho': 0.0175, 'l': 15, 'A': 4}, 4: {'U': 230}, 5: {'R': 40, 'XL': 30}, 6: {'UL': 400, 'Z': 23},
               11: {'U': 500, 'I': 0.0008}, 12: {'U': 229.4, 'rel': 0.008, 'siffror': 3, 'upplosning': 0.1}}
VECKA_MAL = {'v37': ['LM-4'], 'v38': ['LM-6'], 'v39': ['LM-4'], 'v40': ['LM-4'], 'v41': ['LM-4'], 'v42': ['LM-2', 'LM-3'], 'v43': ['LM-1'], 'v44': ['LM-1', 'LM-6'], 'v45': ['LM-5', 'LM-8']}


def tenta(nr):
    poster, y = {}, []
    s = kallor.git_text('tentamen.html')
    for m in re.finditer(r'<section class="exam-q">\s*<h3>(\d+)\. (.*?) <span class="week-tag">(.*?)</span></h3>(.*?)<details class="facit"><summary>Visa lösning</summary><p>(.*?)</p></details></section>', s, flags=re.S):
        n, titel, veckor, body, los = int(m.group(1)), m.group(2), m.group(3), m.group(4), m.group(5)
        ps = [N(kallor.inline(x)) for x in re.findall(r'<p>(.*?)</p>', body, flags=re.S)]
        id_ = nr()
        vl = [v.strip() for v in veckor.split(',')]
        typ = 'berakning' if n in TENTA_SVAR else 'resonemang'
        p = bas(id_, titel, typ, sorted({x for v in vl for x in VECKA_MAL[v]}), 'analys', ['T-formelblad'], f'tentamen.html övningstenta {n}', 'uppgift i övningstentan')
        p['uppgift'] = {'fraga': ' '.join(ps)}
        if len(ps) > 1:
            p['uppgift']['stycken'] = ps
        p['losning'] = {'text': N(kallor.inline(los)), 'status': 'migrerad', 'kalla': 'Övningstentans lösning'}
        if n in TENTA_SVAR:
            p['losning']['svar'] = TENTA_SVAR[n]
            p['parametrar'] = {k: {'varde': v} for k, v in TENTA_PARAM[n].items()}
            p['granskning']['numeriskt_kontrollerad'] = True
        p['referenser']['losning_publik'] = True
        p['bedomning'] = {'kursniva': 'Veckor: ' + ', '.join(vl)}
        poster[id_] = p
        y.append({'ovning': id_, 'plats': 'tentamen.html', 'del': 'ovningstenta', 'ordning': n, 'nummer': str(n), 'ankare': f'tenta-{n}'})
    return poster, y


YTINFO = {
    'arbetsblad': ('Arbetsblad, elevuppgifter och fördjupning', 'elev', 'arbetsblad', 'Vecka 37:s arbetsblad 1A och 1B, vecka 38:s elevuppgifter och fördjupning.'),
    'presentation-fragor': ('Frågor i presentationerna', 'elev', 'presentationer', 'Start- och avslutsfrågor, förberedelsefrågor, arbetsbladens bilder, multimeterövningarna och seminariets övningar.'),
    'inlamning': ('Inlämningsuppgifter', 'elev', 'inlamning', 'Veckornas inlämningsuppgifter med elevens tal D. Lärarfacit ligger i skyddat/larare.enc.'),
    'tentamen': ('Övningstentan', 'elev', 'tentamen', 'De tolv uppgifterna i övningstentan med lösningar.'),
}
INLAMNING_META = {}


def alla(teori, logg, inventera):
    poster, ytor = {}, {'arbetsblad': [], 'presentation-fragor': [], 'inlamning': [], 'tentamen': []}
    r = iter(range(601, 700))
    nr = lambda: f'EL-{next(r):06d}'  # noqa: E731
    p, yk, yp = arbetsblad(nr)
    poster.update(p); ytor['arbetsblad'] += yk; ytor['presentation-fragor'] += yp
    inventera('kurs', 'vecka-37 Arbetsblad 1A/1B (E1–E7, fall A/B + E1–E8); v37_02/v37_04 bilder; förberedelsefrågor v37_01/v37_03', 'arbetsbladsuppgift, fall och förberedelsefråga', len(p))
    p, yk, yp = vecka38(nr)
    poster.update(p); ytor['arbetsblad'] += yk; ytor['presentation-fragor'] += yp
    inventera('kurs', 'vecka-38 Elevuppgifter V2-1..4, Fördjupning fall A/B/F, v38_01 bild 17 och 19', 'elevuppgift, fördjupningsfall, övning och exitfråga', len(p))
    p, yp = multimeter_deck(nr)
    poster.update(p); ytor['presentation-fragor'] += yp
    inventera('presentation', 'v39_03 Multimeter och mätfel, övning 1–10 med facitbilder', 'övning i presentationen', len(p))
    p, yp = seminarium(nr)
    poster.update(p); ytor['presentation-fragor'] += yp
    inventera('presentation', 'v39_04 Kirchhoff-seminarium, övning 1–10 med stödbilder och kontrollfrågor', 'seminarieövning', len(p))
    r2 = iter(range(701, 800))
    nr2 = lambda: f'EL-{next(r2):06d}'  # noqa: E731
    p, yp = start_avslut(nr2)
    poster.update(p); ytor['presentation-fragor'] += yp
    inventera('presentation', '17 presentationer, bild 2 (startfråga) och sista bilden (avslutsfråga)', 'start- och avslutsfråga', len(p))
    r3 = iter(range(801, 850))
    nr3 = lambda: f'EL-{next(r3):06d}'  # noqa: E731
    p, y, meta = inlamning(nr3, logg)
    poster.update(p); ytor['inlamning'] += y
    INLAMNING_META.update(meta)
    inventera('kurs', 'verktyg/inlamning/bygg.py UPPGIFTER; lärarguidens facittabeller', 'inlämningsuppgift med lärarfacit', len(p))
    r4 = iter(range(851, 870))
    nr4 = lambda: f'EL-{next(r4):06d}'  # noqa: E731
    p, y = tenta(nr4)
    poster.update(p); ytor['tentamen'] += y
    inventera('kurs', 'tentamen.html övningstenta', 'tentauppgift med lösning', len(p))
    return poster, ytor
