"""Veckosidan som dagar (från vecka 42): ”I dag” överst, en ruta per lektionsdag och det som gäller hela veckan.

Beslut 11 oktober 2026 (Nils): eleven ska se på sidan vad lektionen i dag handlar om, så att läraren bara behöver visa
presentationen. Alla läxor ska gå att förstå från sidan. Varje lektionsdag har en egen färg (måndag, tisdag, fredag),
och det som gäller hela veckan (quiz, inlämning, övningar) har ingen dagfärg.

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

from kursplan import DAGFARG, _sjalvrattning, kursplan_framsteg, quiz_plan, ton

ROOT = Path(__file__).resolve().parents[2]  # sjoskolan/
DAGSVY = {42, 43, 44}
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
       '.dag-lektion+.dag-lektion{margin-top:18px;padding-top:16px;border-top:2px solid #e3ecf2}'
       '.dag-lek-rubrik{margin:0 0 6px;font-size:19px}.dag-lek-rubrik span{font-weight:400;color:#4d6579;font-size:16px}'
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
       '.veckan{margin:30px 0 26px}.veckan-lista{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}'
       '.vk{display:flex;flex-direction:column;gap:6px;padding:16px 18px;border:1px solid #cad8e2;border-top:4px solid #163248;border-radius:12px;background:#f7f9fb}'
       '.vk-sista{margin:0;font-size:15px;font-weight:700;color:#163248}.vk-kvar{font-weight:400;color:#4d6579}.vk-kvar.bradskande{color:#8a2a00;font-weight:700}'
       '.vk h3{margin:0;font-size:20px}.vk p{margin:0;font-size:16px}.vk-hur{color:#4d6579}'
       '.vk-filer-rubrik{font-weight:700;margin-top:4px!important}.vk-filer{margin:0;padding-left:20px;font-size:16px}.vk-filer li{margin:4px 0}'
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


_OVNING = re.compile(r'[Öö]vning (\d+)\.(\d+)(?:–(\d+)\.(\d+))?')


def _laxans_ovningar(text, href):
    """Övningarna en läxa gäller, som ankare: talen i texten (”Gör övning 2.4–2.6 …”) i presentationen som länken pekar
    på (”Del_2.html#v44_02-q4”). Vecka 43 och 44 har olika många övningar hemma, så läget räknas ur läxan, inte 6–10."""
    m, a = _OVNING.search(text), re.search(r'#(v\d\d_\d\d)-q\d+$', href)
    if not (m and a):
        return None
    fran, till = int(m.group(2)), int(m.group(4) or m.group(2))
    return [f'{a.group(1)}-q{i}' for i in range(fran, till + 1)]


def _nummertext(nummer):
    """['1.2', '1.3', '1.4', '1.5', '1.1'] → ”1.1–1.5”, ['3.6', '3.7'] → ”3.6 och 3.7”."""
    tal = sorted({tuple(int(x) for x in n.split('.')) for n in nummer})
    foljder = []
    for d, i in tal:
        if foljder and foljder[-1][0] == d and foljder[-1][2] == i - 1:
            foljder[-1][2] = i
        else:
            foljder.append([d, i, i])
    delar = [f'{d}.{a}' if a == b else f'{d}.{a} och {d}.{b}' if b == a + 1 else f'{d}.{a}–{d}.{b}' for d, a, b in foljder]
    return delar[0] if len(delar) == 1 else ', '.join(delar[:-1]) + ' och ' + delar[-1]


def lektioner(nr, w, sida_mapp=None):
    """Veckans lektioner i tidsordning, med det sidan och dagsvy.mjs behöver. En lektion vars filer ligger i en annan veckas
    mapp (vecka 45:s delar undervisas i vecka 43 och 44) anger 'vecka' och veckans 'del'. sida_mapp: mappen för sidan
    som länkar (veckosidan vecka-NN eller en delsida), så att PDF-länken fungerar från båda."""
    mod = _lektionsmodul()
    mandag = dt.date.fromisoformat(w['datum'][0])
    sida_mapp = sida_mapp or f'vecka-{nr}'
    # ”Jag har läst del N” finns på delsidorna bara i veckor med självrättande inlämning; annars en Klart-ruta.
    lasknapp = nr in _sjalvrattning().SJALVRATTANDE
    ut = []
    for lek in mod.LEKTIONER:
        if lek.get('vecka', int(lek['id'][1:3])) != nr:
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
        mapp = Path(lek['fil']).parts[0]
        # Övningarna på lektionen: bilderna ”Övningar tillsammans” (övning N.x i presentationens egen numrering).
        pa_lektionen = [n for b in lek['bilder'] if b[0] == 'ovningar' for n in b[1]['nummer']]
        ut.append({
            'id': lek['id'], 'del': lek['del'], 'dag': dag, 'datum': datum.isoformat(), 'datumtext': _datumtext(datum),
            'start': f'{m.group(1)}:{m.group(2)}', 'slut': f'{m.group(3)}:{m.group(4)}', 'tid': f'{m.group(1)}.{m.group(2)}–{m.group(3)}.{m.group(4)}',
            'satt': 'online' if 'online' in tid.lower() else tid.split()[0], 'farg': DAGFARG[dag],
            'titel': f'Del {lek["del"]}: {lek["titel"]}', 'under': lek['underrubrik'], 'upplagg': upplagg, 'efter': lek['efter'],
            # ”Pass 1: Hur el skadar (avsnitt 1–4) och ett exempel” → ämnet för dagens ruta.
            'amnen': [re.sub(r'^Pass \d+: ', '', t) for _, t in upplagg if t.startswith('Pass ')],
            'bildspel': f'../../bildspel/?d={deck}', 'pdf': pdf.name if mapp == sida_mapp else f'../../{mapp}/aktuell/{pdf.name}',
            'mapp': mapp, 'lasknapp': lasknapp,
            'pa_lektionen': [f'{lek["id"]}-q{n.split(".")[1]}' for n in pa_lektionen],
            'pa_lektionen_text': _nummertext(pa_lektionen) if pa_lektionen else '',
            'laxor': [{'id': i, 'text': t, 'href': h, 'knapp': kn, 'ovningar': _laxans_ovningar(t, h)} for i, t, h, kn in mod.HEMMA[lek['id']]],
        })
    return sorted(ut, key=lambda l: (l['datum'], l['start']))


def _lektion_data(l):
    """Lektionen som dagsvy.mjs behöver den: läxorna som id, övningarna på lektionen och i varje läxa som ankare."""
    return ({k: l[k] for k in ('id', 'del', 'dag', 'datum', 'datumtext', 'start', 'slut', 'tid', 'satt', 'farg', 'titel', 'amnen',
                                'bildspel', 'mapp', 'lasknapp', 'pa_lektionen')}
            | {'laxor': [x['id'] for x in l['laxor']], 'laxovn': {x['id']: x['ovningar'] for x in l['laxor'] if x['ovningar']}})


def _laxa_html(lek, x):
    if x.get('ovningar') or x['id'].startswith('ovn-') or (x['id'].startswith('del-') and lek['lasknapp']):
        lage = '<span class="laxa-lage" data-lage></span>'  # läget kommer från delsidan och övningarna (dagsvy.mjs)
    else:
        lage = f'<label class="vag-klar"><input type="checkbox" data-klar="{lek["id"]}-{x["id"]}"> Klart</label>'
    return (f'<li data-laxa="{x["id"]}"><div><p>{escape(x["text"])}</p><a href="{escape(x["href"], quote=True)}">{escape(x["knapp"])}</a></div>{lage}</li>')


def _lektionsblock(lek, flera):
    """En lektion i dagens ruta. Har dagen två lektioner får varje lektion en egen rubrik med sin tid."""
    pass_ = ' class="pass"'
    upplagg = ''.join(f'<li{pass_ if t.startswith("Pass ") else ""}><time>{escape(k)}</time><span>{escape(t)}</span></li>' for k, t in lek['upplagg'])
    mal = ''.join(f'<li>{escape(e[0].upper() + e[1:])}</li>' for e in lek['efter'])
    laxor = ''.join(_laxa_html(lek, x) for x in lek['laxor'])
    rubrik = (f'<h3 class="dag-lek-rubrik">{escape(lek["titel"])} <span>{escape(lek["tid"])}</span></h3>' if flera else '')
    return (f'<div class="dag-lektion" data-lektion="{lek["id"]}">{rubrik}<p class="dag-under">{escape(lek["under"])}.</p>'
            f'<div class="dag-kolumner"><section><h4>Det här pratar vi om</h4><ol class="dag-upplagg">{upplagg}</ol></section>'
            f'<section><h4>Efter lektionen kan du</h4><ul class="dag-mal">{mal}</ul></section></div>'
            f'<p class="dag-knappar"><a class="sj-btn" href="{lek["bildspel"]}">Öppna presentationen</a>'
            f'<a href="{lek["pdf"]}">Presentationen som PDF</a></p>'
            f'<h4>Läxor efter lektionen</h4><ul class="laxor">{laxor}</ul></div>')


def _dagkort(dag_lek):
    """Dagens ruta: en eller två lektioner samma dag (vecka 44 har två entimmeslektioner måndag och tisdag)."""
    forsta, sista = dag_lek[0], dag_lek[-1]
    tid = f'{forsta["tid"].split("–")[0]}–{sista["tid"].split("–")[1]}'
    titel = ' · '.join(l['titel'] for l in dag_lek)
    stil = f'--dag:{forsta["farg"]};--dag-ton:{ton(forsta["farg"], 0.10)}'
    block = ''.join(_lektionsblock(l, len(dag_lek) > 1) for l in dag_lek)
    return (f'<details class="dag" id="dag-{forsta["dag"].lower()}" data-datum="{forsta["datum"]}" style="{stil}" open>'
            f'<summary><span class="dag-chip">{escape(forsta["dag"])} {escape(forsta["datumtext"].split(" ", 1)[1])}</span>'
            f'<span class="dag-tid">{escape(tid)} · {escape(forsta["satt"])}</span>'
            f'<span class="dag-titel">{escape(titel)}</span><span class="dag-lage" aria-live="polite"></span></summary>'
            f'<div class="dag-inne">{block}</div></details>')


def _veckokort(x):
    sista = ''
    if x.get('sista'):
        d = dt.date.fromisoformat(x['sista'])
        sista = f'<p class="vk-sista">Senast {escape(_datumtext(d))} <span class="vk-kvar"></span></p>'
    else:
        sista = '<p class="vk-sista">Hela veckan</p>'
    filer = ''
    if x.get('filer'):
        filer = ('<p class="vk-filer-rubrik">Texterna (PDF att ladda ner)</p><ul class="vk-filer">'
                 + ''.join(f'<li><a href="{escape(h, quote=True)}" download>{escape(t)}</a></li>' for t, h in x['filer']) + '</ul>')
    attr = f' data-sista="{x["sista"]}"' if x.get('sista') else ''
    # Läge (x av y) och knapp bara för det som har ett formulär eller en sida; texterna att läsa har bara filerna.
    lage = ('<p class="vk-lage" aria-live="polite"></p><span class="vp-stapel" aria-hidden="true"><i></i></span>'
            if x['id'] in ('quiz', 'inlamning', 'ovningar') else '')
    knapp = f'<a class="sj-btn" href="{escape(x["href"], quote=True)}">{escape(x["knapp"])}</a>' if x.get('href') else ''
    return (f'<article class="vk" data-vk="{x["id"]}"{attr}>{sista}<h3>{escape(x["titel"])}</h3><p>{escape(x["text"])}</p>'
            f'<p class="vk-hur">{escape(x["hur"])}</p>{filer}{lage}{knapp}</article>')


def dagsvy_html(nr, w, sjalvrattande=None):
    """Sidans mitt för en vecka i DAGSVY: I dag, lektionerna, hela veckan och kursplanens punkter."""
    lek = lektioner(nr, w)
    data, lm_rader = kursplan_framsteg(nr, w, sjalvrattande)
    data |= {
        'lektioner': [_lektion_data(l) for l in lek],
        'veckan': [{k: x[k] for k in ('id', 'titel', 'href', 'knapp', 'banner') if k in x} | ({'sista': x['sista']} if x.get('sista') else {}) for x in w['veckan']],
        'sista_text': _datumtext(dt.date.fromisoformat(w['sista'])),
    }
    if sjalvrattande and quiz_plan(nr):
        data['quiz_plan'] = quiz_plan(nr)  # quizStatus räknar med den innan eleven har öppnat quizet
    if sjalvrattande and nr in _sjalvrattning().SJALVRATTANDE:
        data['inl_plan'] = _sjalvrattning().inlamning_plan(nr)  # veckoStatus räknar med den innan formuläret har öppnats
    v = hashlib.sha1((ROOT / 'gemensamt' / 'dagsvy.mjs').read_bytes() + (ROOT / 'gemensamt' / 'veckopanel.mjs').read_bytes()).hexdigest()[:10]
    from itertools import groupby
    dagar = ''.join(_dagkort(list(g)) for _, g in groupby(lek, key=lambda l: l['datum']))
    veckan = ''.join(_veckokort(x) for x in w['veckan'])
    return (CSS
            + '<section class="idag" id="idag" aria-labelledby="idag-rubrik" hidden><p class="idag-nar" id="idag-nar"></p>'
              '<h2 id="idag-rubrik"></h2><p class="idag-text" id="idag-text"></p><ul class="idag-amnen" id="idag-amnen" hidden></ul>'
              '<p class="idag-text" id="idag-sedan" hidden></p>'
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


# --- ”Din del” överst på delsidan (Del_N.html) ----------------------------------------------------------------
# Samma data och färger som veckosidan: dagens färg och tid, vad vi pratar om, presentationen, läxorna efter lektionen
# med läge, övningarna på lektionen och det som gäller hela veckan. innehall/export/delsidor_veckor.py anropar
# delpanel_html för veckor i DAGSVY.

def _vecka(nr):
    """VECKOR[nr] ur verktyg/veckosidor/bygg.py. Hämtas först när en delsida byggs, eftersom bygg.py importerar den här
    modulen. sys.path återställs efteråt, så att innehållsexportörerna inte hittar veckosidornas moduler."""
    import sys
    if 'veckosidor_bygg' not in sys.modules:
        sokvag = list(sys.path)
        spec = importlib.util.spec_from_file_location('veckosidor_bygg', ROOT / 'verktyg' / 'veckosidor' / 'bygg.py')
        mod = importlib.util.module_from_spec(spec)
        sys.modules['veckosidor_bygg'] = mod
        try:
            spec.loader.exec_module(mod)
        finally:
            sys.path[:] = sokvag
    return sys.modules['veckosidor_bygg'].VECKOR[nr]


DEL_CSS = ('<style>'
           '.dp{margin:10px 0 28px;padding:16px 18px;border:1px solid #cad8e2;border-left:8px solid var(--dag);border-radius:12px;background:#fff}'
           '.dp-topp{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}'
           '.dp .dag-chip{display:inline-block;padding:4px 12px;border-radius:999px;background:var(--dag);color:#fff;font-weight:700;font-size:15px}'
           '.dp .dag-tid{color:#4d6579;font-size:15px}.dp-lage{font-weight:700;color:var(--dag);font-size:15px}'
           '.dp h2.dp-rubrik{margin:14px 0 6px;padding:0;border:0;font-size:17px}.dp h2.dp-rubrik::before{content:none}'
           '.dp-amnen{margin:8px 0 0;font-size:16px}'
           '.dp-knappar{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:12px 0 0}'
           '.dp .laxor{list-style:none;margin:0;padding:0;border-top:1px solid #e3ecf2}'
           '.dp .laxor li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px 14px;padding:9px 0;border-bottom:1px solid #e3ecf2}'
           '.dp .laxor p{margin:0 0 2px;font-size:16px}.dp .laxor a{font-size:16px}'
           '.dp .laxa-lage{font-size:15px;color:#4d6579;text-align:right}.dp .laxa-lage.klar{color:#176844;font-weight:700}'
           '.dp .vag-klar{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;border:1px solid #cad8e2;border-radius:8px;font-size:16px;cursor:pointer;background:#fff}'
           '.dp .vag-klar input{width:22px;height:22px;margin:0;accent-color:#176844}'
           '.dp-lektion{margin:8px 0 0;font-size:15px;color:#4d6579}.dp-lektion b{color:#163248}'
           '.dp-veckan{margin:14px 0 0;padding:12px 14px;border-radius:10px;border-top:4px solid #163248;background:#f3f6f9}'
           '.dp-veckan h2.dp-rubrik{margin-top:0}.dp .dp-vk,.dp .laxor{list-style:none;margin:0;padding:0}'
           '.dp-vk li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 12px;padding:7px 0;border-top:1px solid #dfe7ee;font-size:15px}'
           '.dp-vk li:first-child{border-top:0}.dp-vk b{font-size:16px}.dp-vk .vk-kvar.bradskande{color:#8a2a00;font-weight:700}'
           '.dp-vk .vk-lage{font-weight:700;text-align:right}.dp-vk .vk-lage.klar{color:#176844}'
           '@media (max-width:640px){.dp{padding:14px}.dp .laxor li,.dp-vk li{grid-template-columns:1fr}.dp .laxa-lage,.dp-vk .vk-lage{text-align:left}}'
           '</style>')


def delpanel_html(nr, del_nr, sjalvrattande=None, sida_mapp=None):
    """Rutan ”Din del” för del del_nr i vecka nr, eller '' när veckan inte visas som dagar eller delen saknar lektion."""
    if nr not in DAGSVY:
        return ''
    w = _vecka(nr)
    sida_mapp = sida_mapp or f'vecka-{nr}'
    lek = next((l for l in lektioner(nr, w, sida_mapp) if l['del'] == del_nr), None)
    if not lek:
        return ''
    veckan = [x for x in w['veckan'] if x.get('sista')]
    data = {
        'vecka': nr, 'sista': w['sista'], 'sista_text': _datumtext(dt.date.fromisoformat(w['sista'])),
        'lektion': _lektion_data(lek),
        'veckan': [{k: x[k] for k in ('id', 'titel', 'sista') if k in x} for x in veckan],
        'ovningar': [],
    }
    # Delens tio övningar och övningarna i läxorna (också i en annan del eller veckas mapp), per mapp.
    for a in [f'{lek["id"]}-q{i}' for i in range(1, 11)] + [a for x in lek['laxor'] for a in x['ovningar'] or []]:
        mapp = f'vecka-{a[1:3]}'
        grupp = next((g for m, g in data['ovningar'] if m == mapp), None)
        if grupp is None:
            data['ovningar'].append([mapp, grupp := []])
        if a not in grupp:
            grupp.append(a)
    if sjalvrattande:
        data['sjalvrattande'] = sjalvrattande
        if quiz_plan(nr):
            data['quiz_plan'] = quiz_plan(nr)
        if nr in _sjalvrattning().SJALVRATTANDE:
            data['inl_plan'] = _sjalvrattning().inlamning_plan(nr)
    laxor = ''.join(_laxa_html(lek, x) for x in lek['laxor'])
    amnen = ' · '.join(escape(a) for a in lek['amnen'])
    vecksida = 'index.html' if sida_mapp == f'vecka-{nr}' else f'../../vecka-{nr}/aktuell/index.html'
    texterna = f'<a href="{vecksida}#veckan">Ladda ner texterna</a>'
    rader = ''.join(
        f'<li data-vk="{x["id"]}" data-sista="{x["sista"]}"><span><b>{escape(x["titel"])}</b><br>Senast '
        f'{escape(_datumtext(dt.date.fromisoformat(x["sista"])))} <span class="vk-kvar"></span></span>'
        f'<span class="vk-lage" aria-live="polite">{"" if x.get("href") else texterna}</span></li>'
        for x in veckan)
    stil = f'--dag:{lek["farg"]};--dag-ton:{ton(lek["farg"], 0.10)}'
    v = hashlib.sha1((ROOT / 'gemensamt' / 'dagsvy.mjs').read_bytes() + (ROOT / 'gemensamt' / 'veckopanel.mjs').read_bytes()).hexdigest()[:10]
    return (DEL_CSS
            + f'<section class="dp" id="din-del" aria-label="Din del: lektionen, läxorna och veckan" style="{stil}">'
              f'<div class="dp-topp"><span class="dag-chip">{escape(lek["dag"])} {escape(lek["datumtext"].split(" ", 1)[1])}</span>'
              f'<span class="dag-tid">{escape(lek["tid"])} · {escape(lek["satt"])}</span><span class="dp-lage" data-dp-lage></span></div>'
              f'<p class="dp-amnen"><b>Vi pratar om:</b> {amnen}</p>'
              f'<p class="dp-knappar"><a class="sj-btn" href="{lek["bildspel"]}">Öppna presentationen</a><a href="{lek["pdf"]}">Presentationen som PDF</a></p>'
              f'<h2 class="dp-rubrik">Läxor efter lektionen</h2><ul class="laxor" data-lektion="{lek["id"]}">{laxor}</ul>'
              + (f'<p class="dp-lektion"><b>På lektionen:</b> övning {lek["pa_lektionen_text"]} gör vi tillsammans. <span data-dp-lektion></span></p>'
                 if lek['pa_lektionen'] else '') +
              f'<div class="dp-veckan"><h2 class="dp-rubrik">Hela veckan</h2><ul class="dp-vk">{rader}</ul>'
              f'<p class="dp-lektion"><a href="{vecksida}">Veckans översikt</a></p></div></section>'
            + f'<script type="application/json" id="delpanel-data">{json.dumps(data, ensure_ascii=False)}</script>'
            + f'<script type="module" src="../../gemensamt/dagsvy.mjs?v={v}"></script>')
