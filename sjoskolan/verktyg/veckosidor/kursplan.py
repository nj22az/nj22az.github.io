"""Veckans översikt efter kursplanens punkter (lärandemålen LM-1–9 i innehall/teori.json).

Varje vecka visar vilka punkter den arbetar med och, för varje punkt, delarna, labben och inlämningen som tränar den.
Kopplingen kommer ur övningsposternas `larande.mal` och placeringarna (kurs-formelstod, arbetsblad, simulator,
inlamning, tentamen), så den följer databasen. Elevens framsteg läses ur samma avbockningar som delsidorna
(localStorage `sj-ovningar:/sjoskolan/vecka-NN/aktuell/Formelstod_och_ovningar.html`).

Används av bygg.py: kursplan_html(nr, w, week_dir).
"""
import json
import re
from collections import defaultdict
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # sjoskolan/
INN = ROOT / 'innehall'

MAL = json.loads((INN / 'teori.json').read_text(encoding='utf-8'))['mal']
_MAL_AV, _TITEL = {}, {}
for _f in sorted((INN / 'ovningar').glob('*.json')):
    _p = json.loads(_f.read_text(encoding='utf-8'))
    _MAL_AV[_p['id']] = _p['larande'].get('mal', [])
    _TITEL[_p['id']] = _p['titel']

BLAD = {'01A_Elens_grunder/Arbetsblad.html': 'Arbetsblad 1A', '01B_Elsakerhet_och_riskbedomning/Arbetsblad.html': 'Arbetsblad 1B',
        'Elevuppgifter.html': 'Frånskiljning: övning 1.1–1.4', 'Fordjupning_elev.html': 'Fördjupning: mätfrågor'}


def _placeringar(yta):
    return json.loads((INN / 'placeringar' / f'{yta}.json').read_text(encoding='utf-8'))['placeringar']


FORMELSTOD, ARBETSBLAD, SIMULATOR, INLAMNING, TENTAMEN = (
    _placeringar(y) for y in ('kurs-formelstod', 'arbetsblad', 'simulator', 'inlamning', 'tentamen'))

# Kursplanens punkter med enkla ord (elevens text). Den formella texten (teori.json) visas när man pekar på koden.
ENKEL = {
    'LM-1': 'Du känner igen vanliga komponenter, skydd och mätinstrument och vet vad de gör.',
    'LM-2': 'Du kan förklara hur el kan skada och hur man arbetar säkert, vid både låg och hög spänning.',
    'LM-3': 'Du följer reglerna för säkert elarbete ombord när du mäter och bedömer risker.',
    'LM-4': 'Du kan mäta spänning, ström och resistans i likström, växelström och trefas.',
    'LM-5': 'Du kan hitta ett fel med mätningar och ritningar.',
    'LM-6': 'Du arbetar elsäkert när du mäter, kontrollerar och letar fel.',
    'LM-7': 'Du ser till att felsökning och kontroll görs rätt och skrivs ner i ett protokoll.',
    'LM-8': 'Du förstår vad dina mätvärden betyder och drar rätt slutsats.',
    'LM-9': 'Du arbetar säkert, i rätt ordning, och skriver ner vad du har gjort.',
}
assert set(ENKEL) == set(MAL)

# Kursplanens fyra områden: färgkoden för veckorna och modulerna. Varje skriftlig punkt har sin praktiska motsvarighet
# (LM-2/6 elsäkerhet, LM-4/8 mätning, LM-5/7 felsökning; LM-3/9 regler och ansvar hör till elsäkerheten).
# Färgerna är validerade för färgblindhet (dataviz validate_palette.js, alla par, vit yta) och visas alltid med namnet
# bredvid. Röd och orange används inte: i Sjöskolan betyder de fel och fara (DESIGN.md).
OMRADEN = [
    ('komponenter', 'Komponenter och system', '#1baf7a', ['LM-1']),
    ('sakerhet', 'Elsäkerhet och regler', '#eda100', ['LM-2', 'LM-3', 'LM-6', 'LM-9']),
    ('matning', 'Mätning och analys', '#6250d6', ['LM-4', 'LM-8']),
    ('felsokning', 'Felsökning och dokumentation', '#e87ba4', ['LM-5', 'LM-7']),
]
OMRADE_AV = {m: o for o in OMRADEN for m in o[3]}


def ton(hexfarg, andel=0.14):
    """Ljus ton av färgen mot vitt, för bakgrunder (text står alltid i mörk färg)."""
    r, g, b = (int(hexfarg[i:i + 2], 16) for i in (1, 3, 5))
    return '#' + ''.join(f'{round(255 - (255 - c) * andel):02x}' for c in (r, g, b))
assert set(OMRADE_AV) == set(MAL)

# Det praktiska provet vecka 45 (praktiskt-prov.html): stationerna och målen de visar.
PRAKTISKT_PROV = [('Station 1: motorn i plinten', ['LM-4', 'LM-5', 'LM-6', 'LM-8']),
                  ('Station 2: hållkretsen med dolt fel', ['LM-5', 'LM-7', 'LM-8', 'LM-9']),
                  ('Station 3: isolation och jordfel', ['LM-4', 'LM-6', 'LM-8', 'LM-9'])]

# Mappar vars material också hör till veckan: frånskiljningen (vecka-38/) undervisas måndag vecka 40.
EXTRA_MAPPAR = {40: [38]}


def _mappar(nr):
    return [nr] + EXTRA_MAPPAR.get(nr, [])


CSS = ('<style>'
       '.kp{margin:22px 0 26px;padding:20px 22px;border:1px solid #cad8e2;border-radius:12px;background:#fff}'
       '.kp h2{margin:0 0 4px;font-size:26px}.kp-ingress{margin:0 0 14px;color:#4d6579}'
       '.kp-plan{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px;padding:0;list-style:none}'
       '.kp-plan li a,.kp-plan li span{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none}'
       '.kp-plan li a{background:#064f91;color:#fff}.kp-plan li span{background:#edf4f9;color:#4d6579;font-weight:400}'
       '.kp-tal{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:12px;margin:0 0 16px}'
       '.kp-tal div{padding:12px 14px;border-radius:10px;background:#edf4f9}.kp-tal b{display:block;font-size:24px;line-height:1.2}'
       '.kp-tal small{font-size:15px;color:#4d6579}'
       '.kp-lista{list-style:none;margin:0;padding:0}.kp-lista li{display:grid;grid-template-columns:4.2em 1fr;gap:4px 12px;padding:12px 0 12px 10px;border-top:1px solid #e3ecf2;margin:6px 0 0}'
       '.kp-detaljer summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:#064f91;font-weight:700;font-size:17px}'
       '.kp-omr{display:inline-block;margin:0 8px 2px 0;padding:1px 8px;border-radius:6px;font-weight:700;color:#163248}'
       '.kp-lista .kp-id{font-weight:700;color:#064f91;padding-top:2px}.kp-enkel{margin:0;font-size:18px;font-weight:700;line-height:1.4}'
       '.kp-var{margin:4px 0 0;font-size:15px;color:#4d6579}'
       '.kp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));gap:12px}'
       '.kp-kort{display:flex;flex-direction:column;padding:16px;border:1px solid #cad8e2;border-radius:12px;scroll-margin-top:16px}'
       '.kp-kort:target{border:2px solid #064f91}'
       '.kp-huvud{display:flex;justify-content:space-between;gap:8px;align-items:baseline}'
       '.kp-id{font-weight:700;color:#064f91}.kp-prov{font-size:14px;color:#4d6579}'
       '.kp-text{margin:4px 0 10px;font-weight:700;line-height:1.35}'
       '.kp-akt{list-style:none;margin:0 0 10px;padding:0;font-size:16px}'
       '.kp-akt li{display:grid;grid-template-columns:5.6em 1fr;gap:2px 8px;padding:5px 0;border-top:1px solid #e3ecf2}'
       '.kp-akt .typ{font-size:14px;font-weight:700;color:#4d6579;padding-top:2px}.kp-akt small{grid-column:2;font-size:14px;color:#4d6579}'
       '.kp-fram{margin-top:auto}.kp-bar{height:8px;border-radius:999px;background:#edf4f9;overflow:hidden}'
       '.kp-bar span{display:block;height:100%;width:0;background:#064f91;border-radius:999px}.kp-kort.klar .kp-bar span{background:#176844}'
       '.kp-antal{margin:6px 0 0;font-size:15px;color:#4d6579}'
       '</style>')

SCRIPT = ('<script>(function(){var k=document.querySelector(".kp[data-ovningar]"),d=document.getElementById("kp-dina");if(!k||!d)return;'
          'var n=0,t=0;JSON.parse(k.dataset.ovningar).forEach(function(x){var s={};try{s=JSON.parse(localStorage.getItem("sj-ovningar:/sjoskolan/"+x[0]+"/aktuell/Formelstod_och_ovningar.html")||"{}")||{};}catch(e){}'
          'x[1].forEach(function(a){t++;if(s[a])n++;});});d.textContent=n+" av "+t;})();</script>')


def _ovningsgrupper(nr, w):
    """(mapp, del, etikett, länk) för veckans övningsdelar, också delar som ligger i en annan veckas mapp."""
    grupper = []
    for i, d in enumerate(w['delar'], 1):
        ds = d.get('delsida')
        if ds and 'vecka-' in ds:
            mapp = re.search(r'vecka-(\d+)', ds).group(1)
            k = re.search(r'Del_(\d)', ds).group(1)
            grupper.append((f'vecka-{mapp}', f'v{mapp}_0{k}', f'Del {i}', ds + '#ovningar', d['titel']))
        elif 'delsida' not in d:
            dels = (ROOT / f'vecka-{nr}' / 'aktuell' / f'Del_{i}.html').exists()
            lank = f'Del_{i}.html#ovningar' if dels else f'Formelstod_och_ovningar.html#v{nr}_0{i}'
            grupper.append((f'vecka-{nr}', f'v{nr}_0{i}', f'Del {i}', lank, d['titel']))
    return grupper


def _labbar(w):
    sett, ut = set(), []
    for d in w['delar']:
        for p in d.get('poster', []) + d.get('steg', []):
            if p.get('typ') == 'labb' and p['href'] not in sett:
                sett.add(p['href']); ut.append(p)
    for p in w.get('labbar', []):
        if p['href'] not in sett:
            sett.add(p['href']); ut.append(p)
    return ut


def _inlamning(nr, w):
    """(mapp, ankare, nummer, länk) för veckans inlämningsuppgifter."""
    ut = []
    lankar = [h for h, _ in w.get('redovisa_lista') or []] if w.get('redovisa_lista') else None
    if lankar is None:
        for x in _mappar(nr):
            pre = '' if x == nr else f'../../vecka-{x}/aktuell/'
            ut += [(f'vecka-{x}', pl['ankare'], pl['nummer'], f'{pre}Inlamning.html#{pl["ankare"]}')
                   for pl in INLAMNING if pl['plats'].startswith(f'vecka-{x}/')]
        lankar = [h for h, _ in w.get('redovisa_extra', [])]
    for h in lankar:
        m = re.search(r'vecka-(\d+)/aktuell/Inlamning\.html#(.+)$', h)
        if m:
            pl = next((x for x in INLAMNING if x['plats'] == f'vecka-{m.group(1)}/aktuell/Inlamning.html' and x['ankare'] == m.group(2)), None)
            if pl:
                ut.append((f'vecka-{m.group(1)}', pl['ankare'], pl['nummer'], h))
    return ut


def veckans_uppgifter(nr, w):
    """Alla övningar, labbuppgifter och inlämningar veckan har (post-id), och målen för det praktiska provet."""
    ids = set()
    for mapp, del_, *_ in _ovningsgrupper(nr, w):
        ids |= {pl['ovning'] for pl in FORMELSTOD if pl['plats'] == f'{mapp}/aktuell/Formelstod_och_ovningar.html' and pl['del'] == del_}
    ids |= {pl['ovning'] for pl in ARBETSBLAD if any(pl['plats'].startswith(f'vecka-{x}/') for x in _mappar(nr))}
    for p in _labbar(w):
        ids |= labbuppgifter(p['href'])
    for mapp, ankare, *_ in _inlamning(nr, w):
        ids |= {x['ovning'] for x in INLAMNING if x['plats'] == f'{mapp}/aktuell/Inlamning.html' and x['ankare'] == ankare}
    extra = []
    if w.get('tenta'):
        ids |= {pl['ovning'] for pl in TENTAMEN}
        extra = [mal for _, mal in PRAKTISKT_PROV]
    return ids, extra


def labbuppgifter(href):
    """Labbens uppgifter (post-id) för en länk som ../../hallkretslabbet/ eller ../../multimetersimulator/?ovning=category."""
    mapp = href.split('../../')[-1].split('/')[0].split('?')[0]
    filt = re.search(r'ovning=([a-z]+)', href)
    return {pl['ovning'] for pl in SIMULATOR if pl['plats'].startswith(mapp + '/') and (not filt or pl['ankare'] == filt.group(1))}


def fordelning(ids, extra=()):
    """Antal uppgifter per område (en uppgift räknas en gång per område den tränar), i områdenas fasta ordning."""
    antal = defaultdict(int)
    for malen in [_MAL_AV.get(i, []) for i in ids] + list(extra):
        for o in {OMRADE_AV[m][0] for m in malen}:
            antal[o] += 1
    return [(o, antal[o[0]]) for o in OMRADEN if antal[o[0]]]


OMR_CSS = ('<style>.omr{margin:10px 0 18px}.omr-bar{display:flex;gap:2px;height:10px;max-width:640px}'
           '.omr-bar span{display:block;height:100%;border-radius:3px}'
           '.omr-text{margin:6px 0 0;font-size:15px;color:#4d6579;display:flex;flex-wrap:wrap;gap:4px 14px}'
           '.omr-text b{color:#163248}.omr-namn{display:inline-flex;align-items:center;gap:6px}'
           '.omr-namn i{display:inline-block;width:12px;height:12px;border-radius:3px}</style>')


def omrade_band(fordeln, rubrik='Kursplanen', kompakt=False):
    """Färgkoden: ett band med områdenas andelar och namnen bredvid (färgen är aldrig ensam bärare av informationen)."""
    tot = sum(n for _, n in fordeln) or 1
    storst = max(fordeln, key=lambda x: x[1])[0][0] if fordeln else None
    etikett = ', '.join(f'{o[1]} {round(100 * n / tot)} %' for o, n in fordeln)
    band = ''.join(f'<span style="flex:{n} 1 0;background:{o[2]}"></span>' for o, n in fordeln)
    namn = ''.join(f'<span class="omr-namn"><i style="background:{o[2]}"></i>' + (f'<b>{escape(o[1])}</b>' if o[0] == storst else escape(o[1])) + '</span>'
                   for o, _ in fordeln)
    if kompakt:  # modulkorten: bara största området; förklaringen över korten namnger alla färger
        o = next(o for o, _ in fordeln if o[0] == storst)
        namn, rubrik = f'<span class="omr-namn"><i style="background:{o[2]}"></i><b>{escape(o[1])}</b></span>', 'Mest'
    return (f'<div class="omr" data-omrade="{storst or ""}"><div class="omr-bar" role="img" aria-label="{escape(rubrik)}: {escape(etikett)}" title="{escape(etikett)}">{band}</div>'
            f'<p class="omr-text"><span>{escape(rubrik)}:</span>{namn}</p></div>')


def vecko_band(nr, w):
    return OMR_CSS + omrade_band(fordelning(*veckans_uppgifter(nr, w)))


def kursplan_html(nr, w, med_tal=True):
    per_mal = defaultdict(list)  # mål -> [(ordning, typ, titel, länk, text, framsteg)]
    framsteg = defaultdict(lambda: defaultdict(list))  # mål -> mapp -> [ankare]

    # Övningar i delarna (avbockas på delsidorna).
    for o, (mapp, del_, etikett, lank, titel) in enumerate(_ovningsgrupper(nr, w)):
        rader = [pl for pl in FORMELSTOD if pl['plats'] == f'{mapp}/aktuell/Formelstod_och_ovningar.html' and pl['del'] == del_]
        antal = defaultdict(int)
        for pl in rader:
            for m in _MAL_AV.get(pl['ovning'], []):
                antal[m] += 1
                framsteg[m][mapp].append(pl['ankare'])
        for m, n in antal.items():
            per_mal[m].append((o, etikett, titel, lank, f'{n} {"övning" if n == 1 else "övningar"}'))

    # Arbetsbladen (vecka 38).
    blad = defaultdict(lambda: defaultdict(int))
    for pl in ARBETSBLAD:
        if any(pl['plats'].startswith(f'vecka-{x}/') for x in _mappar(nr)):
            for m in _MAL_AV.get(pl['ovning'], []):
                blad[pl['plats']][m] += 1
    for o, (plats, antal) in enumerate(blad.items(), 10):
        namn = BLAD[plats.split('/aktuell/')[1]]
        for m, n in antal.items():
            per_mal[m].append((o, 'Övningar', namn, '../../' + plats, f'{n} {"övning" if n == 1 else "övningar"}'))

    # Labbarna.
    for o, p in enumerate(_labbar(w), 20):
        antal = defaultdict(int)
        for i in labbuppgifter(p['href']):
            for m in _MAL_AV.get(i, []):
                antal[m] += 1
        for m, n in antal.items():
            per_mal[m].append((o, 'Labb', p['titel'], p['href'], f'{n} {"uppgift" if n == 1 else "uppgifter"}'))

    # Inlämningen.
    # Varje uppgift för sig med sin titel: numren börjar om i varje mapp (vecka 40 och 43 har uppgifter från två mappar).
    for o, (mapp, ankare, nummer, lank) in enumerate(_inlamning(nr, w), 30):
        pl = next(x for x in INLAMNING if x['plats'] == f'{mapp}/aktuell/Inlamning.html' and x['ankare'] == ankare)
        for m in _MAL_AV.get(pl['ovning'], []):
            per_mal[m].append((o, 'Inlämning', _TITEL[pl['ovning']], lank, ''))

    # Tentamensveckan: övningstentan och det praktiska provet.
    if w.get('tenta'):
        tenta = defaultdict(int)
        for pl in TENTAMEN:
            for m in _MAL_AV.get(pl['ovning'], []):
                tenta[m] += 1
        for m, n in tenta.items():
            per_mal[m].append((1, 'Skriftligt', 'Övningstentan', '../../tentamen.html#ovningstenta', f'{n} {"uppgift" if n == 1 else "uppgifter"}'))
        for station, mal in PRAKTISKT_PROV:
            for m in mal:
                per_mal[m].append((2, 'Praktiskt', station, '../../praktiskt-prov.html', ''))

    aktiva = [m for m in sorted(MAL, key=lambda x: int(x.split('-')[1])) if per_mal.get(m)]
    if not aktiva:
        return ''
    rader = []
    for m in aktiva:
        var, sett = [], set()
        for _, t, titel, lank, _txt in sorted(per_mal[m], key=lambda x: x[0]):
            if w.get('tenta') and t == 'Inlämning':
                continue  # övningstentan står redan som egen rad
            etikett = {'Labb': 'Labb', 'Skriftligt': 'Övningstentan', 'Praktiskt': 'Praktiskt prov'}.get(t)
            if etikett is None:
                etikett = t if t.startswith('Del ') else (f'Inlämning: {titel}' if t == 'Inlämning' else titel)
            if etikett not in sett:
                sett.add(etikett)
                var.append(f'<a href="{lank}">{escape(etikett)}</a>')
        omr = OMRADE_AV[m]
        rader.append(f'<li id="kp-{m}" style="border-left:6px solid {omr[2]}"><span class="kp-id" title="{escape(MAL[m]["text"])}">{m}</span>'
                     f'<div><p class="kp-enkel">{escape(ENKEL[m])}</p><p class="kp-var"><span class="kp-omr" style="background:{ton(omr[2])}">{escape(omr[1])}</span> Här tränar du: {" · ".join(var)}</p></div></li>')
    grupper = defaultdict(list)
    for m in aktiva:
        for mapp, a in framsteg[m].items():
            grupper[mapp] += [x for x in a if x not in grupper[mapp]]
    antal_ovn = sum(len(a) for a in grupper.values())
    data = f" data-ovningar='{json.dumps([[k, v] for k, v in grupper.items()])}'" if antal_ovn else ''
    tal = (f'<div><small>Kursplanens punkter</small><b>{len(aktiva)} av {len(MAL)}</b></div>'
           + (f'<div><small>Dina övningar</small><b id="kp-dina">0 av {antal_ovn}</b></div>' if antal_ovn else '')
           + f'<div><small>{"Protokollen senast" if w.get("tenta") else "Inlämning senast"}</small><b>{escape(_sista(w))}</b></div>')
    ingress = ('Tentamen och det praktiska provet prövar de här punkterna i kursplanen.' if w.get('tenta')
               else 'Punkterna kommer från kursplanen. Under varje punkt står var du tränar den.')
    return (CSS + f'<section class="kp" aria-labelledby="kp-rubrik"{data}><h2 id="kp-rubrik">Det här lär du dig</h2>'
            f'<p class="kp-ingress">{ingress}</p>{f'<div class="kp-tal">{tal}</div>' if med_tal else ''}'
            f'<details class="kp-detaljer"><summary>Visa veckans {len(aktiva)} punkter i kursplanen</summary><ul class="kp-lista">{"".join(rader)}</ul></details></section>' + SCRIPT)


MANAD = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']


def _sista(w):
    if w.get('tenta'):
        return 'onsdag 4 november'
    _, m, d = map(int, w['sista'].split('-'))
    return f'söndag {d} {MANAD[m - 1]}'


# --- Veckans översikt (”Din vecka”) överst på veckosidan --------------------------------------------------------
# Börjar med vecka 42. Panelen visar elevens egna framsteg (steg, lästa delar, övningar, inlämningen) och kursplanens
# punkter med stapel i områdets färg. Siffrorna räknas av gemensamt/veckopanel.mjs ur webbläsarens lagring.
PANEL = {42}

PANEL_CSS = ('<style>'
             '.vp{margin:6px 0 26px;padding:20px 22px;border:1px solid #cad8e2;border-radius:12px;background:#fff}'
             '.vp-topp{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 16px;margin:0 0 14px}'
             '.vp h2{margin:0;font-size:24px}.vp-sista{margin:0;color:#4d6579}.vp-kvar.bradskande{color:#8a2a00;font-weight:700}'
             '.vp-rutor{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 18px}'
             '.vp-ruta{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:10px;background:#f3f6f9;min-width:0}'
             '.vp-etikett{font-size:14px;color:#4d6579}.vp-tal{font-size:22px;font-weight:700;line-height:1.25}'
             '.vp-not{font-size:14px;color:#4d6579}.vp-ruta a{font-size:15px}'
             '.vp-stapel{display:block;height:6px;margin-top:6px;border-radius:3px;background:#dfe7ee;overflow:hidden}'
             '.vp-stapel i{display:block;height:100%;width:0;border-radius:3px;background:#064f91;transition:width .3s}'
             '.vp-ruta.klar .vp-tal::before{content:"✓ ";color:#1a7f37}'
             '.vp h3{margin:0 0 8px;font-size:18px}'
             '.vp-lm{margin:0;padding:0;list-style:none}'
             '.vp-lm li{display:grid;grid-template-columns:4.2rem minmax(0,1fr) 9rem 4.6rem;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #e6edf2}'
             '.vp-lm-kod{display:inline-block;padding:2px 8px;border-left:5px solid;border-radius:4px;font-weight:700;font-size:15px}'
             '.vp-lm-text{font-size:15px;line-height:1.45}.vp-lm .vp-stapel{margin:0}.vp-lm-tal{font-size:15px;text-align:right;color:#24384a}'
             '.vp-fot{margin:12px 0 0;font-size:13px;color:#4d6579}'
             '@media (max-width:760px){.vp-rutor{grid-template-columns:repeat(2,minmax(0,1fr))}'
             '.vp-lm li{grid-template-columns:4.2rem minmax(0,1fr) 4.2rem}.vp-lm .vp-stapel{grid-column:2/4;grid-row:2}}'
             '</style>')


def veckopanel_html(nr, w, steg_ids, delnummer, sjalvrattande=None):
    """Översikten överst på veckosidan. steg_ids: stegen med Klart-ruta. delnummer: veckans egna delsidor (läst-knapparna).
    sjalvrattande: adressen till gemensamt/sjalvrattning.mjs när veckans inlämning rättar sig själv, annars None."""
    import hashlib
    framsteg = defaultdict(lambda: defaultdict(list))
    alla = defaultdict(list)
    for mapp, del_, *_ in _ovningsgrupper(nr, w):
        for pl in FORMELSTOD:
            if pl['plats'] == f'{mapp}/aktuell/Formelstod_och_ovningar.html' and pl['del'] == del_:
                if pl['ankare'] not in alla[mapp]:
                    alla[mapp].append(pl['ankare'])
                for m in _MAL_AV.get(pl['ovning'], []):
                    framsteg[m][mapp].append(pl['ankare'])
    ids, extra = veckans_uppgifter(nr, w)
    aktiva = [m for m in sorted(MAL, key=lambda x: int(x.split('-')[1])) if any(m in _MAL_AV.get(i, []) for i in ids)]
    # Var målet tränas utöver övningarna (visas när det inte finns något att räkna ännu).
    inl_mal = {m for mapp, ankare, *_ in _inlamning(nr, w) for x in INLAMNING
               if x['plats'] == f'{mapp}/aktuell/Inlamning.html' and x['ankare'] == ankare for m in _MAL_AV.get(x['ovning'], [])}
    labb_mal = {m for p in _labbar(w) for i in labbuppgifter(p['href']) for m in _MAL_AV.get(i, [])}
    annat = {m: ' och '.join(x for x, ja in (('Inlämningen', m in inl_mal), ('labben', m in labb_mal)) if ja).capitalize() for m in aktiva}
    mal = [{'id': m, 'ovningar': [[k, v] for k, v in framsteg[m].items()], 'annat': annat[m]} for m in aktiva]
    data = {'vecka': nr, 'sista': w['sista'], 'steg': steg_ids, 'delar': delnummer,
            'ovningar': [[k, v] for k, v in alla.items()], 'mal': mal}
    if sjalvrattande:
        data['sjalvrattande'] = sjalvrattande
    n_ovn = sum(len(v) for v in alla.values())
    rader = []
    for m in aktiva:
        omr = OMRADE_AV[m]
        n = sum(len(v) for v in framsteg[m].values())
        rader.append(f'<li data-lm="{m}"><span class="vp-lm-kod" style="border-color:{omr[2]};background:{ton(omr[2])}" title="{escape(omr[1])}">{m}</span>'
                     f'<span class="vp-lm-text">{escape(ENKEL[m])}</span><span class="vp-stapel" aria-hidden="true"><i style="background:{omr[2]}"></i></span>'
                     f'<span class="vp-lm-tal">{f"0 av {n}" if n else escape(annat[m])}</span></li>')
    sista = _sista(w)
    inl = (f'<div class="vp-ruta" data-vp="inlamning"><span class="vp-etikett">Inlämningen</span><span class="vp-tal">Inte påbörjad</span>'
           f'<span class="vp-not">Senast {escape(sista)}</span><span class="vp-stapel" aria-hidden="true"><i></i></span>'
           f'<a href="Inlamning.html">Öppna inlämningen</a></div>')
    ruta = lambda nyckel, etikett, tot: (f'<div class="vp-ruta" data-vp="{nyckel}"><span class="vp-etikett">{etikett}</span>'
                                         f'<span class="vp-tal">0 av {tot}</span><span class="vp-stapel" aria-hidden="true"><i></i></span></div>')
    v = hashlib.sha1((ROOT / 'gemensamt' / 'veckopanel.mjs').read_bytes()).hexdigest()[:10]
    return (PANEL_CSS + f'<section class="vp" id="veckopanel" aria-labelledby="vp-rubrik"><div class="vp-topp"><h2 id="vp-rubrik">Din vecka</h2>'
            f'<p class="vp-sista">Inlämningen senast <strong>{escape(sista)}</strong> · <span class="vp-kvar"></span></p></div>'
            f'<div class="vp-rutor">{ruta("steg", "Steg klara", len(steg_ids))}{ruta("delar", "Delar lästa", len(delnummer))}'
            f'{ruta("ovningar", "Övningar klara", n_ovn)}{inl}</div>'
            f'<h3>Kursplanen den här veckan</h3><ul class="vp-lm">{"".join(rader)}</ul>'
            f'<p class="vp-fot">Siffrorna gäller den här webbläsaren. Delarna räknas som lästa när du har tryckt på ”Jag har läst” längst ned på delsidan.</p></section>'
            f'<script type="application/json" id="veckopanel-data">{json.dumps(data, ensure_ascii=False)}</script>'
            f'<script type="module" src="../../gemensamt/veckopanel.mjs?v={v}"></script>')
