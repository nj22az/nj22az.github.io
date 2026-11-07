#!/usr/bin/env python3
"""Engångsmigrering: läser kursens, presentationernas, simulatorernas och bokens befintliga övningar
och skriver poster, placeringar, konfliktlogg, inventering och numerisk kontroll.

Efter migreringen är posterna den enda redigerbara källan. Skriptet ligger kvar för spårbarhet och körs inte igen
(det skulle skriva över redigeringar). Det läser källorna ur git vid revisionen före migreringen (kallor.KALLREV).

    BOK_EPUB_DIR=<uppackad bok.epub> LARARLOSEN=… BOKLOSEN=… python3 sjoskolan/innehall/migrering/extrahera.py
"""
import collections
import difflib
import json
import re
import sys
from pathlib import Path

HAR = Path(__file__).resolve().parent
sys.path[:0] = [str(HAR), str(HAR.parent / 'lib')]
import kallor  # noqa: E402
import text as T  # noqa: E402

ROT = HAR.parent
KONFLIKTER, INVENTERING, NUMERIK = [], [], {}
N = T.normalisera


def logg(id_, falt, beslut, **kallor_):
    KONFLIKTER.append({'id': id_, 'falt': falt, 'beslut': beslut, **{k: v for k, v in kallor_.items() if v is not None}})


def inventera(kalla, plats, slag, antal, **x):
    INVENTERING.append({'kalla': kalla, 'plats': plats, 'slag': slag, 'antal': antal, **x})


def ursprung(kalla, roll, revision=kallor.KALLREV):
    return {'kalla': kalla, 'revision': revision, 'roll': roll}


def formlika(a, b):
    """Lika bortsett från formatering: indexmarkering, styckeavgränsare och blanktecken."""
    f = lambda s: re.sub(r'\s+', ' ', re.sub(r'[_^]\{([^}]*)\}', r'\1', s or '').replace(' / ', ' ').replace(';', ' ')).strip()
    return f(a) == f(b)


def meningar(s):
    return [x for x in re.split(r'(?<=[.!?])\s+(?=[A-ZÅÄÖ0-9ΔηφωθIU])', (s or '').strip()) if x]


TAL = re.compile(r'−?\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|−?\d+(?:,\d+)?')


def tal(s):
    """Talen i en text som (värde, antal decimaler). Index (I_{1}, K1) och funktionsargument (u(5 ms)) räknas inte."""
    t = re.sub(r'_\{[^}]*\}', '', s or '')
    t = re.sub(r'(?<=[A-Za-zΔ])\([^)]*\)', '', t)
    t = re.sub(r'(?<=[A-Za-z])\d+', '', T.ren_text(t))
    ut = []
    for x in TAL.findall(t):
        v = float(x.replace('−', '-').replace(' ', '').replace('\u00a0', '').replace('\u202f', '').replace(',', '.'))
        ut.append((v, len(x.split(',')[1]) if ',' in x else 0))
    return ut


def talmatch(a, b, rel=0.011):
    """Lika inom 1 %, inom avrundningen i den kortare angivelsen eller med annat prefix (667 Ω = 0,667 kΩ)."""
    (va, da), (vb, db) = a, b
    for skala in (1, 1e3, 1e-3, 1e6, 1e-6):
        x = va * skala
        if abs(x - vb) <= rel * max(abs(x), abs(vb)) + 1e-9 or abs(x - vb) <= 0.51 * 10 ** -min(da, db) * (skala if skala < 1 else 1):
            return True
    return False


ENHETER = r'(?:kV|V|mV|kA|mA|A|µA|kΩ|MΩ|mΩ|Ω|kW|MW|W|kWh|Wh|mWh|Ah|mAh|VA|kVA|var|kvar|Hz|kHz|ms|s|h|min|°|%|r/min|mH|H|µF|F|mm²|m|km|kJ|J|°C|kr)'
SVAR_RE = re.compile(r'(?P<st>[A-Za-zΔηφωθτ][\w{}_]*?(?:\([^)]*\))?)\s*(?:=|≈)\s*(?P<v>−?\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|−?\d+(?:,\d+)?)\s*(?P<e>' + ENHETER + r')?(?=[\s,;.)]|$)')


def strukturerade_svar(svar, publik_text):
    """Tal med storhet och enhet ur bokens Svar-rad. Bara tal som också finns i den publika facittexten tas med."""
    ut = []
    pub = tal(publik_text)
    for m in SVAR_RE.finditer(svar or ''):
        v = tal(m.group('v'))[0]
        if not any(talmatch(v, p) for p in pub):
            continue
        dec = m.group('v').split(',')[1] if ',' in m.group('v') else ''
        s = {'storhet': m.group('st'), 'varde': v[0], 'avrundning': f'{len(dec)} decimaler' if dec else 'heltal', 'tolerans': {'rel': 0.02}}
        if m.group('e'):
            s['enhet'] = m.group('e')
        ut.append(s)
    return ut


# ============================================================================ lärandemål och teori
def teori_och_mal():
    d = kallor.bok_dir()
    s = (d / 'ch003.xhtml').read_text(encoding='utf-8')
    tab = s[s.find('<table'):s.find('</table>')]
    mal, kapmal = {}, collections.defaultdict(list)
    for nr, txt, kap in re.findall(r'<tr[^>]*>\s*<td[^>]*>(\d)</td>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>', tab, flags=re.S):
        mal[f'LM-{nr}'] = {'text': kallor.inline(txt), 'prov': 'skriftligt' if int(nr) <= 5 else 'praktiskt', 'kalla': 'Kursens lärandemål, som i bokens inledning'}
        for del_ in kallor.inline(kap).split(','):
            del_ = del_.strip()
            a, _, b = del_.partition('–')
            for k in range(int(a), int(b or a) + 1):
                kapmal[k].append(f'LM-{nr}')
    teori = {}
    for k in range(1, 25):
        x = (d / kallor.BOK_KAPITEL_FIL[k]).read_text(encoding='utf-8')
        titel = kallor.inline(re.search(r'<span class="titel">(.*?)</span>', x).group(1))
        teori[f'T-bok-{k:02d}'] = {'titel': f'Kapitel {k}: {titel}', 'kalla': 'bok', 'kapitel': k}
    kurs = kallor.kurs_kapitelrubrik()
    for kid, k in kallor.KAPITEL.items():
        v = int(kid[1:3])
        teori[f'T-kurs-{kid.replace("_", "-")}'] = {'titel': kurs[kid]['titel'], 'kalla': 'kurs', 'url': f'vecka-{v}/aktuell/Formelstod_och_ovningar.html#{kid}'}
    for deck in sorted(Path(kallor.REPO, 'sjoskolan', 'bildspel').glob('v*/data.json')):
        dd = json.loads(deck.read_text(encoding='utf-8'))
        kid = dd['id'][:6]
        teori[f'T-bildspel-{kid.replace("_", "-")}'] = {'titel': dd['title'], 'kalla': 'bildspel', 'url': f'bildspel/?d={dd["id"]}'}
    for lab, titel in LABBAR.items():
        teori[f'T-labb-{lab}'] = {'titel': titel, 'kalla': 'labb', 'url': f'{lab}/'}
    teori['T-formelblad'] = {'titel': 'Formelblad och begrepp', 'kalla': 'formelblad', 'url': 'gemensamt/Formelblad_och_begrepp.html'}
    return mal, dict(kapmal), teori


LABBAR = {'multimetersimulator': 'Multimeterlabbet', 'vaxelstromslabbet': 'Växelströmslabbet', 'trefaslabbet': 'Trefaslabbet',
          'hallkretslabbet': 'Hållkretslabbet', 'isolationslabbet': 'Isolationslabbet'}


# ============================================================================ kapitelövningarna (bok, kurs, presentation)
def kapitelovningar(kapmal):
    bok, kurs, deck = kallor.bok_ovningar(), kallor.kurs_ovningar(), kallor.deck_ovningar()
    kurs_for_bok = {k: kid for kid, k in kallor.KAPITEL.items()}
    poster, yt = {}, collections.defaultdict(list)
    inventera('bok.epub (dekrypterad)', 'EPUB/text/ch006–ch032', 'kapitelövning (uppgift, samband, förutsättningar, metod, figurer)', len(bok))
    inventera('bok.epub (dekrypterad)', 'EPUB/text/ch034–ch057', 'lösning (steg, svar, kontroll, figurer)', sum(1 for b in bok.values() if b['steg'] or b['svar']))
    inventera('kurs', 'vecka-39…45/aktuell/Formelstod_och_ovningar.html', 'övning med formelstöd, symboler, förutsättningar, arbetsgång och facit', len(kurs))
    inventera('presentation', 'vecka-39, 41–45 *_elev.pptx', 'bilderna ”Stöd till övning N” och ”Övning N”', len(deck))
    for (k, n), b in sorted(((b['kapitel'], b['nr']), b) for b in bok.values()):
        id_ = f'EL-{(k - 1) * 10 + n:06d}'
        kid = kurs_for_bok.get(k)
        a = f'{kid}-q{n}' if kid else None
        c, d = (kurs.get(a), deck.get(a)) if kid else (None, None)
        ovn = f'{kid}-q{n}' if kid else f'ch{k}-q{n}'
        post = {'id': id_, 'titel': None, 'sprak': 'sv', 'typ': None, 'revision': 1,
                'granskning': {'status': 'migrerad'},
                'larande': {'mal': kapmal.get(k, []), 'niva': b['niva'], 'teori': [f'T-bok-{k:02d}']},
                'uppgift': {}, 'ledtradar': [], 'losning': {},
                'referenser': {'ursprung': [ursprung(f'bok.epub: {kallor.BOK_KAPITEL_FIL[k]}#{b["id_uppgift"]} och {kallor.BOK_LOSNING_FIL[k]}#{b["id_losning"]}', 'uppgift och lösning i boken')],
                               'publik': 'elev' if kid else 'bok',
                               'rattigheter': '© Nils Johansson. Bokens lösningar och figurer ingår bara i boken.'}}
        if kid:
            v = int(kid[1:3])
            post['larande']['teori'] += [f'T-kurs-{kid.replace("_", "-")}'] + ([f'T-bildspel-{kid.replace("_", "-")}'] if d else [])
            post['referenser']['ursprung'].append(ursprung(f'vecka-{v}/aktuell/Formelstod_och_ovningar.html#{a}', 'kursens övning och facit'))
            if d:
                post['referenser']['ursprung'].append(ursprung(f'{kallor.DECK[kid]} bild {d.get("stod_bild")} och {d.get("ovning_bild")}', 'presentationens stöd- och övningsbild'))
            post['referenser']['losning_publik'] = True

        # --- titel, fråga, förutsättningar: bokens text, utom där presentationsgranskningen (25 sep) ändrade fältet
        def valj(falt, vb, vk, vd):
            vb, vk, vd = N(vb), N(vk), N(vd)
            if vd and vk and not formlika(vd, vk):
                logg(id_, falt, 'presentationens granskade text (fältet ändrades vid granskningen 25 september)', bok=vb, kurs=vk, presentation=vd)
                return vd, 'presentation'
            if vk is not None and not formlika(vb, vk):
                logg(id_, falt, 'bokens text (senare språkgranskning än kurssidan)', bok=vb, kurs=vk, presentation=vd)
            return vb, 'bok'

        post['titel'], _ = valj('titel', b['titel'], c and c['titel'], d and d.get('titel'))
        fraga, kalla_f = valj('uppgift.fraga', b['fraga'], c and c['fraga'], d and d.get('fraga'))
        post['uppgift']['fraga'] = fraga
        if len(b['stycken']) > 1 and kalla_f == 'bok':
            post['uppgift']['stycken'] = [N(x) for x in b['stycken']]
        # Samband: en rad per rad i boken.
        sb = [N(x) for x in b['samband_rader'] or []]
        if d and c and d.get('samband') and not formlika(d['samband'], c.get('samband')):
            sd = [N(x) for x in d['samband'].split(' / ')]
            if not formlika(' '.join(sd), ' '.join(sb)):
                logg(id_, 'uppgift.samband', 'presentationens granskade samband', bok=sb, kurs=N(c.get('samband')), presentation=sd)
                sb = sd
        elif c and c.get('samband') and not formlika(' '.join(sb), c['samband']):
            logg(id_, 'uppgift.samband', 'bokens samband', bok=sb, kurs=N(c['samband']))
        if sb:
            post['uppgift']['samband'] = sb
        givet, _ = valj('uppgift.givet', b['givet'], c and c.get('givet'), d and d.get('givet'))
        if givet:
            post['uppgift']['givet'] = givet
        if d and d.get('instruktion'):
            post['uppgift']['instruktion'] = N(d['instruktion'])

        # --- ledtrådar i två steg: begrepp (kursens ”Symboler och innebörd”) och metod (”Arbetsgång”).
        # Bokens Metod-rad är de två ihopskrivna och språkgranskade. Den delas upp mening för mening.
        bm = meningar(N(b['metod']))
        if c:
            sy_k, ag_k = N(c.get('symboler')), N(c.get('arbetsgang'))
            sy_d, ag_d = (N(d.get('symboler')), N(d.get('arbetsgang'))) if d else (None, None)
            sy_gr = sy_d if sy_d and sy_k and not formlika(sy_d, sy_k) else None
            ag_gr = ag_d if ag_d and ag_k and not formlika(ag_d, ag_k) else None
            lab = ''
            for s in bm:
                rs = max((difflib.SequenceMatcher(None, s, x).ratio() for x in meningar(sy_k)), default=0)
                ra = max((difflib.SequenceMatcher(None, s, x).ratio() for x in meningar(ag_k)), default=0)
                lab += 'S' if rs >= ra else 'A'
            m = re.fullmatch(r'(S+)(A+)', lab)
            if m and not sy_gr and not ag_gr:
                begrepp, metod = ' '.join(bm[:len(m.group(1))]), ' '.join(bm[len(m.group(1)):])
                post['ledtradar'] = [{'niva': 'begrepp', 'text': begrepp, 'status': 'migrerad'}, {'niva': 'metod', 'text': metod, 'status': 'migrerad'}]
                if not formlika(begrepp, sy_k) or not formlika(metod, ag_k):
                    logg(id_, 'ledtradar', 'bokens Metod-rad uppdelad i begrepp och metod (bokens språkgranskade text)', bok=N(b['metod']), kurs_symboler=sy_k, kurs_arbetsgang=ag_k)
            else:
                begrepp, metod = sy_gr or sy_k, ag_gr or ag_k
                orsak = 'presentationsgranskningen ändrade ledtråden' if (sy_gr or ag_gr) else f'bokens Metod-rad kunde inte delas entydigt ({lab})'
                post['ledtradar'] = [{'niva': 'begrepp', 'text': begrepp, 'status': 'migrerad'}, {'niva': 'metod', 'text': metod, 'status': 'migrerad'}]
                logg(id_, 'ledtradar', f'kursens/presentationens två ledtrådar ({orsak}); boken visar dem ihopskrivna', bok=N(b['metod']), kurs_symboler=sy_k, kurs_arbetsgang=ag_k,
                     presentation_symboler=sy_d, presentation_arbetsgang=ag_d)
        else:
            post['ledtradar'] = [{'niva': 'metod', 'text': N(b['metod']), 'status': 'migrerad'}]

        # --- lösning: kursens facit är publikt. Bokens steg, svar och kontroll ligger i bok.enc.
        facit = N(c['facit']) if c and c.get('facit') else None
        if facit:
            post['losning']['text'] = facit
        if b['steg']:
            post['losning']['steg'] = [N(x) for x in b['steg']]
        if b['svar']:
            post['losning']['svarstext'] = N(b['svar'])
        if b['kontroll']:
            post['losning']['kontroll'] = N(b['kontroll'])
        post['losning']['status'] = 'migrerad' if (facit or b['steg']) else 'saknas'
        post['losning']['kalla'] = 'Kursens facit (publikt) och bokens lösning (bok.enc)' if kid else 'Bokens lösning'
        pub_facit = facit if kid else ' '.join([b['svar'] or ''] + b['steg'])
        sv = strukturerade_svar(N(b['svar']), pub_facit)
        if sv:
            post['losning']['svar'] = sv
        post['typ'] = 'berakning' if (sv or re.search(r'\d\s*' + ENHETER + r'(?![A-Za-zåäö])', T.ren_text(N(b['svar']) or ''))) else 'resonemang'
        if not post['losning'].get('text'):
            # Bokens egna övningar: lösningen är bokens (hela posten är skyddad).
            post['losning']['text'] = ' '.join([N(x) for x in b['steg']] + ([f'Svar: {N(b["svar"])}'] if b['svar'] else [])) or 'Se bokens lösning.'
        # Numerisk jämförelse av bokens svar och kursens facit (två oberoende källor).
        if kid and facit:
            tb, tk = tal(b['svar']), tal(facit)
            saknas = [x[0] for x in tb if not any(talmatch(x, y) for y in tk)]
            NUMERIK[id_] = {'ovning': a, 'bok': N(b['svar']), 'kurs': facit, 'status': 'inga-tal' if not tb else ('overens' if not saknas else 'avviker'), 'saknas_i_kurs': saknas}
            if saknas:
                post['granskning'] = {'status': 'att-granska', 'kommentar': f'Bokens svar innehåller tal som inte finns i kursens facit: {saknas}'}
            elif tb:
                post['granskning']['numeriskt_kontrollerad'] = True
        # --- bokens figurer
        # Bokens ursprungliga XHTML sparas (skyddat) så att oförändrat innehåll återges byte för byte, med färgmarkering.
        post['bok'] = {'html': {'uppgift': b['html']['uppgift'].strip(), **({'losning': b['html']['losning'].strip()} if b['html']['losning'] else {})}}
        if b['figurer'] or b['losningsfigurer']:
            if b['figurer']:
                post['bok']['figurer'] = [_fig(f) for f in b['figurer']]
            if b['losningsfigurer']:
                post['bok']['losningsfigurer'] = [_fig(f) for f in b['losningsfigurer']]
        post['losning'] = {k2: post['losning'][k2] for k2 in ('text', 'steg', 'svar', 'svarstext', 'kontroll', 'status', 'kalla') if k2 in post['losning']}
        poster[id_] = post
        # --- placeringar
        yt['bok'].append({'ovning': id_, 'plats': f'bok:{kallor.BOK_KAPITEL_FIL[k]}', 'del': f'kapitel-{k:02d}', 'ordning': n, 'nummer': f'{k}.{n}',
                          'ankare': b['id_uppgift'], 'alias': [b['id_losning']]})
        if kid:
            v = int(kid[1:3])
            yt['kurs-formelstod'].append({'ovning': id_, 'plats': f'vecka-{v}/aktuell/Formelstod_och_ovningar.html', 'del': kid, 'ordning': n,
                                          'nummer': f'Övning {n}', 'ankare': a})
            if d and d.get('ovning_bild'):
                pl = {'ovning': id_, 'plats': kallor.DECK[kid], 'del': kid, 'ordning': n, 'nummer': f'Övning {n}', 'bild': d['ovning_bild'], 'roll': 'ovning'}
                # Textformer på bilderna, så att presentationsexportören kan skriva om dem.
                former = {}
                rest = [(sid, t) for sid, t in d['ovning_shapes'].items() if not re.fullmatch(r'\d+', t)]
                for namn, (sid, _) in zip(('titel', 'fraga', 'instruktion'), rest):
                    former[namn] = str(sid)
                if d.get('stod_bild'):
                    pl['stodbild'] = d['stod_bild']
                    rest = [(sid, t) for sid, t in d['stod_shapes'].items() if not re.fullmatch(r'\d+', t)]
                    if rest:
                        former['stod/samband'] = str(rest[0][0])
                    for sid, t in rest[1:]:
                        namn = 'stod/givet' if t.startswith('Förutsättningar:') else 'stod/metod' if t.startswith('Arbetsgång:') else 'stod/begrepp'
                        former[namn] = str(sid)
                pl['former'] = former
                yt['presentation'].append(pl)
    return poster, yt


def _fig(f):
    x = {'fil': f['src'].replace('../media/', 'media/'), 'alt': f['alt']}
    if f.get('bildtext') and f['bildtext'] != f['alt']:
        x['bildtext'] = f['bildtext']
    if f.get('nr'):
        x['nr'] = f['nr']
    if f.get('klass'):
        x['klass'] = f['klass']
    return x


if __name__ == '__main__':
    import skriv  # noqa: E402
    mal, kapmal, teori = teori_och_mal()
    poster, ytor = kapitelovningar(kapmal)
    import familjer  # noqa: E402
    p2, y2 = familjer.alla(teori, logg, inventera, ursprung)
    dubbla = set(poster) & set(p2)
    assert not dubbla, dubbla
    poster.update(p2)
    for k, v in y2.items():
        ytor[k] += v
    skriv.skriv_allt(poster, ytor, {'mal': mal, 'teori': teori}, KONFLIKTER, INVENTERING, NUMERIK, ytinfo=familjer.ytinfo())
