"""Week 40: a concrete assignment, its purpose and the route through the week."""
import json
from html import escape
from pathlib import Path


# Del 1–3 har en sida var med samma ordning: översikt, teori, exempel, övningar, labben (innehall/export/delsidor.py).
# Frånskiljningen (från vecka 38) finns kvar i arbetsrummet.
def knapp(i, id_, title):
    if i == 0:
        return f'<a class="sj-btn" href="Genomgang.html?del={id_}&amp;fortsatt=1">Arbeta med {title.lower()}</a>'
    return f'<a class="sj-btn primary" href="Del_{i}.html">Öppna del {i}: {title.lower()}</a>'


def till_delsida(html):
    """Länkar till del 1–3 i arbetsrummet eller på övningssidan går till delsidorna (Del_N.html)."""
    import re
    nr = {'sinus': 1, 'impedans': 2, 'effekt': 3}
    def genomgang(m):
        par = dict(x.split('=', 1) for x in re.split(r'&(?:amp;)?', m.group(2) or '') if '=' in x)
        mal = par.get('uppgift') or ('exempel' if par.get('avsnitt') == 'exempel' else f'teori-{par["avsnitt"]}' if par.get('avsnitt') else 'teori')
        return f'Del_{nr[m.group(1)]}.html#{mal}'
    html = re.sub(r'Genomgang\.html\?del=(sinus|impedans|effekt)((?:&(?:amp;)?[^"#&]+)*)', genomgang, html)
    html = re.sub(r'Formelstod_och_ovningar\.html\?del=v40_0([123])(#v40_0[123]-q\d+)?', lambda m: f'Del_{m.group(1)}.html' + (m.group(2) or '#ovningar'), html)
    return re.sub(r'Formelstod_och_ovningar\.html#(v40_0([123])-q\d+)', lambda m: f'Del_{m.group(2)}.html#{m.group(1)}', html)


def page(w, schedule):
    schedule = till_delsida(schedule)
    plan = json.loads((Path(__file__).resolve().parents[2] / 'innehall/studieplan-v40.json').read_text())
    lessons = plan['vagledning']
    rows = []
    for i, (id_, brief) in enumerate(lessons.items()):
        title = escape(brief['titel'])
        rows.append(f'''<li id="{id_}" data-lesson="{id_}">
<h3>{'Först' if i == 0 else f'Del {i}'}: {title}</h3>
<p><strong>Varför:</strong> {escape(brief['syfte'])}</p>
<p class="study-note"><strong>När:</strong> {escape(brief['nar'])}</p>
<p class="lesson-progress" aria-live="polite">Inte påbörjad</p>
{knapp(i, id_, title)}</li>''')
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vecka 40 · Frånskiljning och växelström · Sjöskolan</title><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-40/aktuell/"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="../../gemensamt/sjoskolan.css?v=20260926"><link rel="stylesheet" href="../../course.css?v=20260930d"><link rel="stylesheet" href="arbetsrum.css?v=20260927c"><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script><script type="module" src="dagplan.mjs?v=20260928d"></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a></nav><main id="main-content" class="study-main">
<header><p class="study-kicker">Vecka 40 · 28 september–2 oktober 2026</p><h1>Förstå mätningen innan du läser av</h1>
<p id="week-purpose">På fredag ska du kunna <strong>beräkna ett förväntat värde, läsa av instrumentet och förklara skillnaden</strong> i växelströmslabbet. Veckans förklaringar och övningar förbereder dig för det.</p>
<div id="nu" class="study-panel"><h2>Vad gör jag först?</h2><p id="resume-text">Börja med frånskiljning: följ två möjliga matningar i en figur och beskriv vad som måste kontrolleras. Sedan väljer du instrument med hjälp av korten på sidan.</p><a id="resume" class="sj-btn primary large" href="Genomgang.html?del=franskiljning&amp;avsnitt=mal">Börja med frånskiljning</a></div>
</header>
<section aria-labelledby="sa-gor-du"><h2 id="sa-gor-du">Så arbetar du</h2><p>Del 1, 2 och 3 är uppbyggda på samma sätt, och du arbetar uppifrån och ned:</p><ol class="study-method"><li><strong>Översikt.</strong> Vad du ska kunna och när du gör det.</li><li><strong>Teori.</strong> Korta avsnitt med figur. Läs i ordning.</li><li><strong>Exempel.</strong> Följ Så räknar du med papper och räknare. Räkna sedan Din tur själv innan du tittar på svaret.</li><li><strong>Övningar.</strong> Fastnar du: <em>Ledtråd 1</em> visar vilken formel du behöver och vilket teoriavsnitt som förklarar den. <em>Ledtråd 2</em> visar hur du börjar. Öppna facit när du har ett eget svar och bocka av övningen.</li><li><strong>Fredag: labben.</strong> Samma metoder: räkna först, läs av, jämför och förklara.</li></ol><p class="study-note">Sist på varje lektion: <a href="Resultat.html">Skicka resultat</a> med namn och QR-kod. Dina avbockningar sparas i den här webbläsaren.</p></section>
<section aria-labelledby="ordning"><h2 id="ordning">Vad gör vi under veckan?</h2><p>Arbeta i den här ordningen och följ lektionernas plan. Varje del samlar förklaringar, exempel och övningar på samma sida.</p><ol class="study-lessons">{''.join(rows)}</ol></section>
<section class="study-stage" id="labb"><p class="study-kicker">Fredag · efter del 1–3</p><h2>Använd det du har tränat på i labben</h2><p>Öppna den guidade simulatorlabben och gör åtta uppgifter. För varje mätning: <strong>beräkna först, läs av, jämför och förklara</strong>. Dina mätningar blir ett protokoll som används i växelströmsinlämningens uppgift 4.</p><a class="sj-btn" href="../../vaxelstromslabbet/?lage=guidad">Öppna den guidade simulatorlabben</a></section>
<section class="study-stage" id="inlamning"><h2>Vad ska jag lämna in?</h2><p><strong>Senast söndag 4 oktober:</strong> lämna båda inlämningarna via den kanal läraren har anvisat.</p><ol><li><a href="Inlamning.html">Växelström, uppgift 1–4</a>: beräkningar, förklaringar och labbprotokoll.</li><li><a href="../../vecka-38/aktuell/Inlamning.html">Frånskiljning och mätteknik, uppgift 1–3</a>: dina svar och motiveringar.</li></ol><p>Övningarna i arbetsrummet är <strong>träning inför dessa inlämningar</strong>. Att läsa alla avsnitt innebär inte att du har lämnat in.</p><p>Efter lektionen: öppna <a href="Resultat.html">Skicka resultat</a>, skriv ditt namn, ta en skärmbild av QR-koden och skicka den till läraren. Följ också instruktionerna på respektive inlämningssida.</p></section>
<details class="study-resources" id="schema"><summary>Detaljerad plan: på lektionen och hemma</summary>{schedule}</details>
<details class="study-resources"><summary>Film, presentation och extra stöd</summary><p>Läraren använder presentation och film på lektionen. För eget arbete följer du arbetsrummets steg; använd filmen eller artikeln när du vill repetera en förklaring.</p><p><a href="../../bildspel/">Bildspel, PowerPoint och PDF</a> · <a href="Kortfilmer.html">Korta filmer</a> · <a href="Beteckningar.html">Beteckningar</a> · <a href="../../gemensamt/Raknehjalp.html">Räknarhjälp</a></p></details>
</main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>'''
