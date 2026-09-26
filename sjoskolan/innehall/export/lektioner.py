"""Lektionsartiklar för vecka 40: en sammanhängande, illustrerad artikel per lektion.

Ordningen följer undervisningen: det här ska du kunna, så fungerar det (förklaring bredvid figur), se vad instrumentet
visar, följ ett genomräknat exempel, prova själv (ledtråd och facit på begäran), det här använder du i labben,
fördjupning efter grundkraven, nästa del. Texten kommer ur vecka-40/aktuell/lektioner.mjs (genomgångens innehåll)
och övningarna, ledtrådarna och facit ur databasen. Figurerna ritas av visuals.mjs, samma som genomgången använder.
"""
import html
import json
import re
import subprocess

import rendera as R
import text as T

PUBLIK = 'elev'
V = '20260928'
KATALOG = R.SJO / 'vecka-40' / 'aktuell'
FORKUNSKAPER = {
    'sinus': [('../../vecka-39/aktuell/Formelstod_och_ovningar.html#v39_01', 'Effekt och energi (vecka 39)'), ('../../gemensamt/Formelblad_och_begrepp.html', 'Formelblad och begrepp')],
    'impedans': [('Lektion_1.html', 'Del 1: Sinus och mätvärden'), ('../../vecka-39/aktuell/Formelstod_och_ovningar.html#v39_02', 'Kirchhoffs lagar (vecka 39)')],
    'effekt': [('Lektion_2.html', 'Del 2: Spole, motstånd och ström'), ('Lektion_1.html', 'Del 1: Sinus och mätvärden')],
}
INSTRUMENT = {'sinus': ('matarna', 'protokoll'), 'impedans': ('labb',), 'effekt': ('labb',)}
BILDTEXT = {'wave': 'Spänningen över tid: tidsaxel i millisekunder, spänning i volt.', 'period': 'En hel period mellan två stigande nollpassager.',
            'peak': 'Toppvärde från nollnivån och topp till topp.', 'rms': 'Effektivvärdet ger samma värme som en likspänning av samma storlek.',
            'calibration': 'Instrumentkontroll mot en känd källa före mätningen.', 'meters': 'Två mätare visar olika för samma kurvform.',
            'resistor': 'Spänning och ström i fas över en resistor.', 'rl': 'Spole i serie: strömmen släpar efter spänningen.',
            'triangle': 'Impedanstriangeln: R och X vinkelrätt, |Z| som diagonal.', 'power': 'Effekt och ström vid olika effektfaktor.',
            'powerTriangle': 'Effekttriangeln: P, Q och S.'}


def lektioner():
    js = "import('%s').then(m=>console.log(JSON.stringify(m.LESSONS)))" % (KATALOG / 'lektioner.mjs').as_uri()
    return json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)


def e(s):
    return html.escape(str(s), quote=False)


def figur(visual):
    if not visual:
        return ''
    return f'<figure class="lesson-visual" data-visual="{visual}"><figcaption>{e(BILDTEXT.get(visual, ""))}</figcaption></figure>'


def avsnitt(s, prova):
    h = [f'<section class="art-del" id="{s["id"]}"><h3>{R.h(s["title"])}</h3><div class="art-rad">{figur(s.get("visual"))}<div class="art-text"><ul>']
    h += [f'<li>{R.h(t)}</li>' for t in s['body']]
    h.append('</ul>')
    if s.get('formula'):
        h.append(f'<p class="formula">{R.h(s["formula"])}</p>')
    if s.get('check') and prova:
        h.append(f'<div class="art-prova"><p><strong>Prova själv:</strong> {R.h(s["check"])}</p>' + (f'<details><summary>Visa svar</summary><p>{R.h(s["answer"])}</p></details>' if s.get('answer') else '') + '</div>')
    h.append('</div></div></section>')
    return ''.join(h)


def ovning(pl, p, tab):
    u, sim = p['uppgift'], p['simulator']
    los = p.get('losning') or {}
    led = [l for l in p.get('ledtradar', []) if l['niva'] == 'metod']
    def varde(sv):
        v = sv['varde']
        vt = v if isinstance(v, str) else f'{v:.3g}'.replace('.', ',')
        return f'{R.h(sv["storhet"])} ≈ {e(vt)} {e(sv.get("enhet", ""))}'
    facit = ' · '.join(varde(sv) for sv in los.get('svar', []))
    h = [f'<section class="art-uppgift" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h3>{R.h(p["titel"])}</h3><p>{R.h(u["fraga"])}</p>']
    if led:
        h.append(f'<details class="ledtrad"><summary>Ledtråd</summary><p>{R.h(led[0]["text"])}</p></details>')
    if los.get('text') or facit:
        h.append(f'<details class="facit"><summary>Visa facit</summary><p>{R.h(los.get("text") or facit)}</p></details>')
    h.append(f'<p class="art-lank"><a href="../../vaxelstromslabbet/?flik={tab}&amp;uppgift={pl["ankare"]}">Räkna och kontrollera i Växelströmslabbet</a></p></section>')
    return ''.join(h)


def artikel(a, l, alla):
    nr, tab = l['number'], l['id']
    slides = {s['id']: s for s in l['slides']}
    grund = [s for s in l['slides'] if not s.get('advanced')]
    teori = [s for s in grund if s['id'] not in ('mal', 'exempel', 'eget', 'klart') and s['id'] not in INSTRUMENT[tab]]
    fordjup = [s for s in l['slides'] if s.get('advanced')]
    uppgifter = [(pl, p) for pl, p in a.placeringar('simulator', 'vaxelstromslabbet/uppgifter.gen.mjs', 'rakna-forst') if p['simulator'].get('scenario') == tab]
    guidade = [(pl, p) for pl, p in a.placeringar('simulator', 'vaxelstromslabbet/uppgifter.gen.mjs', 'guidad') if p['simulator'].get('scenario') == tab]
    nasta = next((x for x in alla if x['number'] == nr + 1), None)
    toc = [('mal', 'Det här ska du kunna'), ('beteckningar', 'Förkortningar och beteckningar'), ('teori', 'Så fungerar det'), ('instrument', 'Se vad instrumentet visar'), ('exempel', 'Följ ett genomräknat exempel'),
           ('prova', 'Prova själv'), ('labb', 'Det här använder du i labben')] + ([('fordjupning', 'Fördjupning')] if fordjup else []) + [('nasta', 'Nästa steg')]
    h = [f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(l["title"])} · Vecka 40 · Del {nr} · Sjöskolan</title><meta name="description" content="Lektionsartikel i elteknik: {e(l["goal"])}"><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-40/aktuell/Lektion_{nr}.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v=20260926"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}"><link rel="stylesheet" href="ac-course.css?v={V}"><link rel="stylesheet" href="lektion.css?v={V}"><link rel="stylesheet" href="../../gemensamt/beteckningar.css?v={V}"><script src="/sjoskolan/gemensamt/oversattning.js?v=20260926" defer></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/bildspel/">Bildspel</a><a href="/sjoskolan/vecka-40/aktuell/">Vecka 40</a></nav>
<main id="main-content" class="course-main art-main"><div class="course-breadcrumb"><a href="index.html">← Vecka 40</a></div>
<div class="art-layout"><aside class="art-toc"><details open><summary>På denna sida</summary><ol>{''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in toc)}</ol></details></aside>
<article class="course-reading art-artikel">
<p class="course-kicker">Vecka 40 · Del {nr}</p><h1>{e(l["title"])}</h1><p class="course-lead">{R.h(l["goal"])}</p>
<p class="art-meta">{e(l["minutes"])} · <a href="Genomgang.html?del={tab}">Genomgång bild för bild</a> · <a href="Kortfilmer.html?del={tab}">Kort stegfilm</a> · <a href="../../bildspel/?d={e(l["deck"].replace("_elev.pptx", ""))}">Bildspel</a></p>''']
    # 1 Det här ska du kunna
    mal = slides.get('mal')
    h.append(f'<h2 id="mal">Det här ska du kunna</h2><p>Efter den här delen kan du: {R.h(l["goal"][0].lower() + l["goal"][1:])}</p>')
    if mal:
        h.append('<ul>' + ''.join(f'<li>{R.h(t)}</li>' for t in mal['body']) + '</ul>')
    h.append('<p><strong>Du behöver från tidigare:</strong> ' + ' · '.join(f'<a href="{u}">{e(t)}</a>' for u, t in FORKUNSKAPER[tab]) + '.</p>')
    # Alla förkortningar och beteckningar i delen, i den ordning de kommer. Förklaras också i löptexten första gången.
    texter = [l['goal']] + [t for s in l['slides'] for t in [s['title'], *s['body'], s.get('check'), s.get('answer')]] + [p['uppgift']['fraga'] for _, p in uppgifter + guidade]
    formler = [s.get('formula') for s in l['slides']] + [x for _, p in uppgifter + guidade for x in p['uppgift'].get('samband', [])]
    h.append('<h3 id="beteckningar">Förkortningar och beteckningar i den här delen</h3><p>Öppna rutan när du möter en förkortning du inte känner igen. <a href="Beteckningar.html">Alla beteckningar för veckan</a>.</p>')
    h.append(R.beteckningar_html(R.beteckningar_i(texter, a.beteckningar(), formler), 'Visa förkortningar och beteckningar'))
    # 2 Så fungerar det
    h.append('<h2 id="teori">Så fungerar det</h2>')
    h += [avsnitt(s, prova=True) for s in teori]
    # 3 Instrumentet
    h.append('<h2 id="instrument">Se vad instrumentet visar</h2>')
    h += [avsnitt(slides[i], prova=True) for i in INSTRUMENT[tab] if i in slides]
    h.append(f'<p class="art-lank"><a href="Kortfilmer.html?del={tab}">Kort stegfilm: {e(l["filmTitle"])}</a> · <a href="../../vaxelstromslabbet/?flik={tab}">Öppna fliken i Växelströmslabbet</a></p>')
    # 4 Exempel
    if 'exempel' in slides:
        h.append('<h2 id="exempel">Följ ett genomräknat exempel</h2>')
        h.append(avsnitt(slides['exempel'], prova=False))
    # 5 Prova själv
    h.append('<h2 id="prova">Prova själv</h2><p>Räkna först på papper. Öppna ledtråden om du fastnar och facit när du är klar.</p>')
    if 'eget' in slides:
        s = slides['eget']
        h.append(f'<section class="art-uppgift" id="eget"><h3>{R.h(s["title"])}</h3>' + ''.join(f'<p>{R.h(t)}</p>' for t in s['body']) + (f'<details class="facit"><summary>Visa facit</summary><p>{R.h(s["answer"])}</p></details>' if s.get('answer') else '') + '</section>')
    h += [ovning(pl, p, tab) for pl, p in uppgifter]
    # 6 Labben
    h.append('<h2 id="labb">Det här använder du i labben</h2><p>I den guidade labben förutsäger du varje värde, läser av det och förklarar skillnaden. Uppgifterna i den här delen:</p><ol>')
    h += [f'<li><strong>{R.h(p["titel"])}.</strong> {R.h(p["uppgift"]["fraga"])}</li>' for pl, p in guidade]
    h.append(f'</ol><p class="art-lank"><a class="ac-link-button" href="../../vaxelstromslabbet/?lage=guidad&amp;del={tab}">Öppna den guidade labben, del {nr}</a></p>')
    if 'klart' in slides:
        s = slides['klart']
        h.append(f'<div class="sj-panel soft"><h3>{R.h(s["title"])}</h3><ul>' + ''.join(f'<li>{R.h(t)}</li>' for t in s['body']) + '</ul></div>')
    # 7 Fördjupning
    if fordjup:
        h.append('<h2 id="fordjupning">Fördjupning</h2><p class="muted">Utöver grundkraven. Läs när grunddelen sitter.</p>')
        h += [avsnitt(s, prova=True) for s in fordjup]
    # 8 Nästa
    h.append('<h2 id="nasta">Nästa steg</h2>')
    if nasta:
        h.append(f'<p class="art-lank"><a class="ac-link-button" href="Lektion_{nasta["number"]}.html">Fortsätt till del {nasta["number"]}: {e(nasta["title"])}</a></p>')
    else:
        h.append('<p class="art-lank"><a class="ac-link-button" href="../../vaxelstromslabbet/?lage=guidad">Fortsätt till den guidade labben</a> · <a href="Inlamning.html">Veckans inlämning</a></p>')
    fore = f'<a href="Lektion_{nr - 1}.html">← Del {nr - 1}</a>' if nr > 1 else '<a href="index.html">← Vecka 40</a>'
    efter = f'<a href="Lektion_{nasta["number"]}.html">Del {nasta["number"]} →</a>' if nasta else '<a href="../../vaxelstromslabbet/?lage=guidad">Guidad labb →</a>'
    h.append(f'<nav class="art-nav" aria-label="Lektioner"><span>{fore}</span><span><a href="index.html">Veckans översikt</a></span><span>{efter}</span></nav>')
    h.append(f'''<p class="source-note">Ideala undervisningsmodeller. Praktisk instrumentanslutning följer den verkliga stationens anvisningar. Övningarna kommer ur kursens innehållsdatabas.</p>
</article></div></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer>
<script type="module">import {{visual}} from './visuals.mjs?v=20260928';const draw=()=>document.querySelectorAll('[data-visual]').forEach(el=>{{el.querySelector('svg')?.remove();el.insertAdjacentHTML('afterbegin',visual(el.dataset.visual,Math.min(el.clientWidth,760)));}});draw();addEventListener('resize',draw);if(innerWidth<900)document.querySelector('.art-toc details').open=false;</script>
</body></html>
''')
    return ''.join(h)


CSS = '''/* Lektionsartiklar vecka 40 (genereras inte; layout för Lektion_N.html) */
.art-main{max-width:1160px}.art-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:32px;align-items:start}
.art-toc{position:sticky;top:16px}.art-toc details{border:1px solid var(--sj-line,#cad8e2);border-radius:12px;padding:8px 14px;background:#fff}
.art-toc summary{font-weight:700;cursor:pointer;min-height:44px;display:flex;align-items:center}.art-toc ol{padding-left:20px;margin:6px 0 8px}.art-toc li{margin:6px 0}
.art-artikel{max-width:72ch}.art-meta{font-size:15px;color:var(--sj-muted,#4d6579)}
.art-del{margin:24px 0 32px}.art-rad{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
.lesson-visual{margin:0;border:1px solid var(--sj-line,#cad8e2);border-radius:12px;padding:8px;background:#fff}.lesson-visual svg{width:100%;height:auto;display:block}
.lesson-visual figcaption{font-size:14px;color:var(--sj-muted,#4d6579);margin-top:6px}
.art-prova{margin:12px 0 0;border-left:8px solid var(--sj-accent,#064f91);padding:6px 16px;background:var(--sj-soft,#edf4f9);border-radius:0 12px 12px 0}
.art-prova p{margin:6px 0}.art-uppgift{margin:16px 0 24px;padding:4px 0 4px 16px;border-left:4px solid var(--sj-line,#cad8e2)}
.art-artikel .art-uppgift h3{margin-top:8px}.art-lank{margin:12px 0}
.facit,.ledtrad{margin:12px 0 0;border:1px solid var(--sj-line,#cad8e2);border-radius:12px;padding:4px 16px;background:#fff}
.facit{border-left:8px solid var(--sj-ok,#176844)}.ledtrad{border-left:8px solid var(--sj-accent,#064f91)}
.facit[open],.ledtrad[open]{padding-bottom:12px}.facit p,.ledtrad p{margin:4px 0 0}.facit summary,.ledtrad summary{cursor:pointer;min-height:44px;display:flex;align-items:center}
.art-nav{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:32px 0 0;padding-top:16px;border-top:1px solid var(--sj-line,#cad8e2)}
@media(min-width:900px){.art-rad:has(.lesson-visual){grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.art-rad .lesson-visual{order:2}}
@media(max-width:899px){.art-layout{grid-template-columns:minmax(0,1fr)}.art-toc{position:static}.art-toc details{padding:4px 14px}.art-toc details:not([open]) ol{display:none}}
@media print{.art-toc,.art-nav,.school-nav{display:none}.facit,.ledtrad{display:none}}
'''


def filer(a):
    alla = lektioner()
    ut = {'vecka-40/aktuell/lektion.css': CSS}
    for l in alla:
        ut[f'vecka-40/aktuell/Lektion_{l["number"]}.html'] = artikel(a, l, alla)
    return ut
