"""Veckosidan som dagar (från vecka 42): ”I dag” överst, en ruta per lektionsdag och det som gäller hela veckan.

Beslut 11 oktober 2026 (Nils): eleven ska se på sidan vad lektionen i dag handlar om, så att läraren bara behöver visa
presentationen. Alla läxor ska gå att förstå från sidan. Varje lektionsdag har en egen färg (måndag, tisdag, fredag),
och det som gäller hela veckan (läsförståelse, inlämning, övningar) har ingen dagfärg.

- Lektionsrutorna hämtar tid, rubrik, upplägg (”Det här pratar vi om”) och läxorna ur presentationernas innehåll
  (verktyg/lektionsbilder/lektioner.py: LEKTIONER och HEMMA). Bilden ”Det här gör du nu” byggs ur samma lista, så
  presentationen och sidan säger samma sak.
- Det som gäller hela veckan står i VECKOR[nr]['veckan'] (verktyg/veckosidor/bygg.py).
- gemensamt/dagsvy.mjs väljer dagens ruta, visar läget för varje läxa och fyller i kursplanens punkter.
"""
import datetime as dt
import hashlib
import importlib.util
import json
import re
from html import escape
from pathlib import Path

from kursplan import DAGFARG, kursplan_framsteg, ton

ROOT = Path(__file__).resolve().parents[2]  # sjoskolan/
DAGSVY = {42}
# Lektionsdagarnas färger: kursplan.DAGFARG. Det som gäller hela veckan har mörk text och grå kant.
VECKODAG = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag']
MANAD = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']

CSS = ('<style>'
       '.idag{margin:8px 0 28px;padding:20px 22px;border-radius:12px;border:2px solid var(--dag,#163248);background:var(--dag-ton,#f3f6f9)}'
       '.idag-nar{display:inline-block;margin:0 0 6px;padding:4px 12px;border-radius:999px;background:var(--dag,#163248);color:#fff;font-weight:700;font-size:15px}'
       '.idag h2{margin:4px 0 6px;font-size:26px;line-height:1.25}.idag-text{margin:0 0 6px;font-size:17px}'
       '.idag-amnen{margin:6px 0 12px;padding-left:22px;font-size:17px}.idag-amnen li{margin:2px 0}'
       '.idag-knappar{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:12px 0 0}'
       '.dagar h2,.veckan h2,.kp-framsteg h2{font-size:22px;margin:0 0 6px}.dagar>p,.veckan>p{margin:0 0 12px;color:#4d6579}'
       '.dag{margin:0 0 14px;border:1px solid #cad8e2;border-left:8px solid var(--dag);border-radius:12px;background:#fff}'
       '.dag[open]{box-shadow:0 1px 0 #e3ecf2}.dag.idag-kort,.dag.nasta-kort{border-width:2px 2px 2px 8px;border-color:var(--dag)}'
       '.dag>summary{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px 12px;padding:14px 18px;cursor:pointer;list-style:none;min-height:48px}'
       '.dag>summary::-webkit-details-marker{display:none}'
       '.dag>summary::after{content:"Visa";grid-column:3;grid-row:1;color:#064f91;font-weight:700;font-size:15px}.dag[open]>summary::after{content:"Dölj"}'
       '.dag-chip{display:inline-block;padding:4px 12px;border-radius:999px;background:var(--dag);color:#fff;font-weight:700;font-size:15px;white-space:nowrap}'
       '.dag-tid{color:#4d6579;font-size:15px}'
       '.dag-titel{grid-column:1/-1;font-size:21px;font-weight:700;line-height:1.3;color:#163248}'
       '.dag-lage{grid-column:1/-1;font-size:15px;color:#4d6579}.dag-lage b{color:var(--dag)}.dag-lage.kvar{color:#8a2a00;font-weight:700}'
       '.dag-inne{padding:0 18px 16px}.dag-under{margin:0 0 10px;font-size:17px}'
       '.dag-kolumner{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:8px 24px}'
       '.dag h4{margin:12px 0 6px;font-size:17px}'
       '.dag-upplagg{list-style:none;margin:0;padding:0}.dag-upplagg li{display:grid;grid-template-columns:3.4rem 1fr;gap:8px;padding:3px 0;font-size:16px}'
       '.dag-upplagg time{font-variant-numeric:tabular-nums;color:#4d6579}.dag-upplagg li.pass{font-weight:700}'
       '.dag-mal{margin:0;padding-left:20px;font-size:16px}'
       '.dag-knappar{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:14px 0 4px}'
       '.laxor{list-style:none;margin:0;padding:0;border-top:1px solid #e3ecf2}'
       '.laxor li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px 16px;padding:10px 0;border-bottom:1px solid #e3ecf2}'
       '.laxor p{margin:0 0 2px;font-size:16px}.laxor a{font-size:16px}'
       '.laxa-lage{font-size:15px;color:#4d6579;text-align:right}.laxa-lage.klar{color:#176844;font-weight:700}'
       '.vag-klar{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;border:1px solid #cad8e2;border-radius:8px;font-size:16px;cursor:pointer;background:#fff}'
       '.vag-klar input{width:22px;height:22px;margin:0;accent-color:#176844}'
       '.veckan{margin:30px 0 26px}.veckan-lista{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}'
       '.vk{display:flex;flex-direction:column;gap:6px;padding:16px 18px;border:1px solid #cad8e2;border-top:4px solid #163248;border-radius:12px;background:#f7f9fb}'
       '.vk-sista{margin:0;font-size:15px;font-weight:700;color:#163248}.vk-kvar{font-weight:400;color:#4d6579}.vk-kvar.bradskande{color:#8a2a00;font-weight:700}'
       '.vk h3{margin:0;font-size:20px}.vk p{margin:0;font-size:16px}.vk-hur{color:#4d6579}'
       '.vk-lage{font-weight:700}.vk-lage.klar{color:#176844}.vk .vp-stapel{margin:2px 0 6px}.vk .sj-btn{align-self:flex-start;margin-top:auto}'
       '.vp-stapel{display:block;height:6px;border-radius:3px;background:#dfe7ee;overflow:hidden}'
       '.vp-stapel i{display:block;height:100%;width:0;border-radius:3px;background:#163248;transition:width .3s}'
       '.kp-framsteg{margin:0 0 26px;padding:18px 20px;border:1px solid #cad8e2;border-radius:12px;background:#fff}'
       '.vp-lm{margin:0;padding:0;list-style:none}'
       '.vp-lm li{display:grid;grid-template-columns:4.2rem minmax(0,1fr) 9rem 4.6rem;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #e6edf2}'
       '.vp-lm-kod{display:inline-block;padding:2px 8px;border-left:5px solid;border-radius:4px;font-weight:700;font-size:15px}'
       '.vp-lm-text{font-size:15px;line-height:1.45}.vp-lm .vp-stapel{margin:0}.vp-lm-tal{font-size:15px;text-align:right;color:#24384a}'
       '.vp-fot{margin:12px 0 0;font-size:13px;color:#4d6579}'
       '@media (max-width:860px){.veckan-lista{grid-template-columns:1fr}.dag-kolumner{grid-template-columns:1fr}}'
       '@media (max-width:640px){.idag{padding:16px}.idag h2{font-size:22px}.dag>summary{padding:12px 14px}.dag-inne{padding:0 14px 14px}'
       '.laxor li{grid-template-columns:1fr}.laxa-lage{text-align:left}'
       '.vp-lm li{grid-template-columns:4.2rem minmax(0,1fr) 4.2rem}.vp-lm .vp-stapel{grid-column:2/4;grid-row:2}}'
       '</style>')


def _lektionsmodul():
    spec = importlib.util.spec_from_file_location('lektioner_dagsvy', ROOT / 'verktyg' / 'lektionsbilder' / 'lektioner.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _datumtext(d, veckodag=True):
    return (f'{VECKODAG[d.weekday()]} ' if veckodag else '') + f'{d.day} {MANAD[d.month - 1]}'


def lektioner(nr, w):
    """Veckans lektioner i ordning, med det sidan och dagsvy.mjs behöver."""
    mod = _lektionsmodul()
    mandag = dt.date.fromisoformat(w['datum'][0])
    ut = []
    for lek in mod.LEKTIONER:
        if not lek['id'].startswith(f'v{nr}_'):
            continue
        k, dag, tid = w['lektioner'][lek['del']]
        datum = mandag + dt.timedelta(days=k)
        m = re.search(r'(\d{2})\.(\d{2})–(\d{2})\.(\d{2})', tid)
        if not m or dag not in DAGFARG:
            raise SystemExit(f'dagsvy: lektion {lek["id"]} saknar tid (”09.00–11.00”) eller dagfärg ({dag}).')
        upplagg = next(b[1] for b in lek['bilder'] if b[0] == 'upplagg')
        deck = Path(lek['fil']).stem.removesuffix('_elev')
        pdf = Path(lek['fil']).with_suffix('.pdf')
        if not (ROOT / 'bildspel' / deck / 'data.json').exists() or not (ROOT / pdf).exists():
            raise SystemExit(f'dagsvy: presentationen {deck} saknar bildspel eller PDF. Kör verktyg/lektionsbilder/bygg.py.')
        ut.append({
            'id': lek['id'], 'del': lek['del'], 'dag': dag, 'datum': datum.isoformat(), 'datumtext': _datumtext(datum),
            'start': f'{m.group(1)}:{m.group(2)}', 'slut': f'{m.group(3)}:{m.group(4)}', 'tid': f'{m.group(1)}.{m.group(2)}–{m.group(3)}.{m.group(4)}',
            'satt': 'online' if 'online' in tid.lower() else tid.split()[0], 'farg': DAGFARG[dag],
            'titel': f'Del {lek["del"]}: {lek["titel"]}', 'under': lek['underrubrik'], 'upplagg': upplagg, 'efter': lek['efter'],
            # ”Pass 1: Hur el skadar (avsnitt 1–4) och ett exempel” → ämnet för dagens ruta.
            'amnen': [re.sub(r'^Pass \d+: ', '', t) for _, t in upplagg if t.startswith('Pass ')],
            'bildspel': f'../../bildspel/?d={deck}', 'pdf': pdf.name,
            'laxor': [{'id': i, 'text': t, 'href': h, 'knapp': kn} for i, t, h, kn in mod.HEMMA[lek['id']]],
        })
    return ut


def _laxa_html(lek, x):
    if x['id'].startswith(('del-', 'ovn-')):
        lage = '<span class="laxa-lage" data-lage></span>'  # läget kommer från delsidan och övningarna (dagsvy.mjs)
    else:
        lage = f'<label class="vag-klar"><input type="checkbox" data-klar="{lek["id"]}-{x["id"]}"> Klart</label>'
    return (f'<li data-laxa="{x["id"]}"><div><p>{escape(x["text"])}</p><a href="{escape(x["href"], quote=True)}">{escape(x["knapp"])}</a></div>{lage}</li>')


def _dagkort(lek):
    pass_ = ' class="pass"'
    upplagg = ''.join(f'<li{pass_ if t.startswith("Pass ") else ""}><time>{escape(k)}</time><span>{escape(t)}</span></li>' for k, t in lek['upplagg'])
    mal = ''.join(f'<li>{escape(e[0].upper() + e[1:])}</li>' for e in lek['efter'])
    laxor = ''.join(_laxa_html(lek, x) for x in lek['laxor'])
    stil = f'--dag:{lek["farg"]};--dag-ton:{ton(lek["farg"], 0.10)}'
    return (f'<details class="dag" id="dag-{lek["dag"].lower()}" data-lektion="{lek["id"]}" style="{stil}" open>'
            f'<summary><span class="dag-chip">{escape(lek["dag"])} {escape(lek["datumtext"].split(" ", 1)[1])}</span>'
            f'<span class="dag-tid">{escape(lek["tid"])} · {escape(lek["satt"])}</span>'
            f'<span class="dag-titel">{escape(lek["titel"])}</span><span class="dag-lage" aria-live="polite"></span></summary>'
            f'<div class="dag-inne"><p class="dag-under">{escape(lek["under"])}.</p>'
            f'<div class="dag-kolumner"><section><h4>Det här pratar vi om</h4><ol class="dag-upplagg">{upplagg}</ol></section>'
            f'<section><h4>Efter lektionen kan du</h4><ul class="dag-mal">{mal}</ul></section></div>'
            f'<p class="dag-knappar"><a class="sj-btn" href="{lek["bildspel"]}">Öppna presentationen</a>'
            f'<a href="{lek["pdf"]}">Presentationen som PDF</a></p>'
            f'<h4>Läxor efter lektionen</h4><ul class="laxor">{laxor}</ul></div></details>')


def _veckokort(x):
    sista = ''
    if x.get('sista'):
        d = dt.date.fromisoformat(x['sista'])
        sista = f'<p class="vk-sista">Senast {escape(_datumtext(d))} <span class="vk-kvar"></span></p>'
    else:
        sista = '<p class="vk-sista">Hela veckan</p>'
    return (f'<article class="vk" data-vk="{x["id"]}"' + (f' data-sista="{x["sista"]}"' if x.get('sista') else '') + '>'
            f'{sista}<h3>{escape(x["titel"])}</h3><p>{escape(x["text"])}</p><p class="vk-hur">{escape(x["hur"])}</p>'
            f'<p class="vk-lage" aria-live="polite"></p><span class="vp-stapel" aria-hidden="true"><i></i></span>'
            f'<a class="sj-btn" href="{escape(x["href"], quote=True)}">{escape(x["knapp"])}</a></article>')


def dagsvy_html(nr, w, sjalvrattande=None):
    """Sidans mitt för en vecka i DAGSVY: I dag, lektionerna, hela veckan och kursplanens punkter."""
    lek = lektioner(nr, w)
    data, lm_rader = kursplan_framsteg(nr, w, sjalvrattande)
    data |= {
        'lektioner': [{k: l[k] for k in ('id', 'del', 'dag', 'datum', 'datumtext', 'start', 'slut', 'tid', 'satt', 'farg', 'titel', 'amnen', 'bildspel')}
                      | {'laxor': [x['id'] for x in l['laxor']]} for l in lek],
        'veckan': [{k: x[k] for k in ('id', 'titel', 'href', 'knapp') if k in x} | ({'sista': x['sista']} if x.get('sista') else {}) for x in w['veckan']],
        'sista_text': _datumtext(dt.date.fromisoformat(w['sista'])),
    }
    v = hashlib.sha1((ROOT / 'gemensamt' / 'dagsvy.mjs').read_bytes() + (ROOT / 'gemensamt' / 'veckopanel.mjs').read_bytes()).hexdigest()[:10]
    dagar = ''.join(_dagkort(l) for l in lek)
    veckan = ''.join(_veckokort(x) for x in w['veckan'])
    return (CSS
            + '<section class="idag" id="idag" aria-labelledby="idag-rubrik" hidden><p class="idag-nar" id="idag-nar"></p>'
              '<h2 id="idag-rubrik"></h2><p class="idag-text" id="idag-text"></p><ul class="idag-amnen" id="idag-amnen" hidden></ul>'
              '<p class="idag-knappar"><a class="sj-btn primary large" id="idag-knapp" href="#dagar">Se veckans lektioner</a>'
              '<a id="idag-lank" href="#veckan" hidden></a></p></section>'
            + f'<section class="dagar" id="dagar" aria-labelledby="dagar-rubrik"><h2 id="dagar-rubrik">Veckans lektioner</h2>'
              f'<p>Varje lektionsdag har en egen färg. Lektionerna är online, och länken till mötet får du av läraren. '
              f'Läxorna efter lektionen står i dagens ruta.</p>{dagar}</section>'
            + f'<section class="veckan" id="veckan" aria-labelledby="veckan-rubrik"><h2 id="veckan-rubrik">Hela veckan</h2>'
              f'<p>Det här gäller hela veckan och hör inte till en viss lektion.</p><div class="veckan-lista">{veckan}</div></section>'
            + f'<section class="kp-framsteg" id="kursplan-framsteg" aria-labelledby="kpf-rubrik"><h2 id="kpf-rubrik">Kursplanen den här veckan</h2>'
              f'<ul class="vp-lm">{lm_rader}</ul><p class="vp-fot">Övningarna och inlämningens rätta svar räknas per punkt. '
              f'Siffrorna gäller den här webbläsaren.</p></section>'
            + f'<script type="application/json" id="dagsvy-data">{json.dumps(data, ensure_ascii=False)}</script>'
            + f'<script type="module" src="../../gemensamt/dagsvy.mjs?v={v}"></script>')
