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

SCRIPT = ('<script>(function(){var c={},las=function(m){if(!(m in c)){try{c[m]=JSON.parse(localStorage.getItem("sj-ovningar:/sjoskolan/"+m+"/aktuell/Formelstod_och_ovningar.html")||"{}")||{};}catch(e){c[m]={};}}return c[m];};'
          'var alla={},gjorda={};document.querySelectorAll(".kp-kort[data-ovningar]").forEach(function(k){var g=JSON.parse(k.dataset.ovningar),n=0,t=0;'
          'g.forEach(function(x){var s=las(x[0]);x[1].forEach(function(a){t++;alla[x[0]+a]=1;if(s[a]){n++;gjorda[x[0]+a]=1;}});});'
          'k.querySelector(".kp-bar span").style.width=(t?100*n/t:0)+"%";k.classList.toggle("klar",t&&n===t);'
          'k.querySelector(".kp-antal").textContent=n?n+" av "+t+" övningar klara":t+" övningar";});'
          'var d=document.getElementById("kp-dina");if(d){var a=Object.keys(alla).length;d.textContent=Object.keys(gjorda).length+" av "+a;}})();</script>')


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


def kursplan_html(nr, w):
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
        mapp = p['href'].split('../../')[-1].split('/')[0].split('?')[0]
        filt = re.search(r'ovning=([a-z]+)', p['href'])
        rader = [pl for pl in SIMULATOR if pl['plats'].startswith(mapp + '/') and (not filt or pl['ankare'] == filt.group(1))]
        antal = defaultdict(int)
        for pl in rader:
            for m in _MAL_AV.get(pl['ovning'], []):
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
    plan = ''.join(f'<li><a href="#kp-{m}" title="{escape(MAL[m]["text"])}">{m}</a></li>' if m in aktiva
                   else f'<li><span title="{escape(MAL[m]["text"])}">{m}</span></li>'
                   for m in sorted(MAL, key=lambda x: int(x.split('-')[1])))
    kort = []
    for m in aktiva:
        akt = ''.join(f'<li><span class="typ">{escape(t)}</span><a href="{lank}">{escape(titel)}</a>'
                      + (f'<small>{escape(txt)}</small>' if txt else '') + '</li>'
                      for _, t, titel, lank, txt in sorted(per_mal[m], key=lambda x: x[0]))
        grupper = [[mapp, a] for mapp, a in framsteg[m].items()]
        fram = (f'<div class="kp-fram"><div class="kp-bar"><span></span></div><p class="kp-antal">'
                f'{sum(len(a) for _, a in grupper)} övningar</p></div>') if grupper else ''
        data = f" data-ovningar='{json.dumps(grupper)}'" if grupper else ''
        kort.append(f'<article class="kp-kort" id="kp-{m}"{data}><div class="kp-huvud"><span class="kp-id">{m}</span>'
                    f'<span class="kp-prov">prövas {escape(MAL[m]["prov"])}</span></div>'
                    f'<p class="kp-text">{escape(MAL[m]["text"])}</p><ul class="kp-akt">{akt}</ul>{fram}</article>')
    antal_ovn = sum(len(a) for m in aktiva for a in framsteg[m].values())
    tal = (f'<div><small>Kursplanens punkter</small><b>{len(aktiva)} av {len(MAL)}</b></div>'
           + (f'<div><small>Dina övningar</small><b id="kp-dina">–</b></div>' if antal_ovn else '')
           + f'<div><small>{"Protokollen senast" if w.get("tenta") else "Inlämning senast"}</small><b>{escape(_sista(w))}</b></div>')
    ingress = ('Veckan prövar kursplanens punkter i tentamen och det praktiska provet.' if w.get('tenta')
               else 'Det här är kursplanens punkter som veckan arbetar med, och vad du gör för var och en.')
    return (CSS + f'<section class="kp" aria-labelledby="kp-rubrik"><h2 id="kp-rubrik">Kursplanen den här veckan</h2>'
            f'<p class="kp-ingress">{ingress}</p><ul class="kp-plan" aria-label="Kursplanens punkter LM-1 till LM-9">{plan}</ul>'
            f'<div class="kp-tal">{tal}</div><div class="kp-grid">{"".join(kort)}</div></section>' + SCRIPT)


MANAD = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']


def _sista(w):
    if w.get('tenta'):
        return 'onsdag 4 november'
    _, m, d = map(int, w['sista'].split('-'))
    return f'söndag {d} {MANAD[m - 1]}'
