"""Week 40: a concrete assignment, its purpose and the route through the week."""
import json
from html import escape
from pathlib import Path


def page(w, schedule):
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
<a class="sj-btn" href="Genomgang.html?del={id_}&amp;fortsatt=1">Arbeta med {title.lower()}</a></li>''')
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vecka 40 · Frånskiljning och växelström · Sjöskolan</title><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-40/aktuell/"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="../../gemensamt/sjoskolan.css?v=20260926"><link rel="stylesheet" href="../../course.css?v=20260930d"><link rel="stylesheet" href="arbetsrum.css?v=20260927c"><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script><script type="module" src="dagplan.mjs?v=20260927c"></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a></nav><main id="main-content" class="study-main">
<header><p class="study-kicker">Vecka 40 · 28 september–2 oktober 2026</p><h1>Förstå mätningen innan du läser av</h1>
<p id="week-purpose">På fredag ska du kunna <strong>beräkna ett förväntat värde, läsa av instrumentet och förklara skillnaden</strong> i växelströmslabbet. Veckans förklaringar och övningar förbereder dig för det.</p>
<div id="nu" class="study-panel"><h2>Vad gör jag först?</h2><p id="resume-text">Börja med frånskiljning: följ två möjliga matningar i en figur och beskriv vad som måste kontrolleras. Sedan väljer du instrument med hjälp av korten på sidan.</p><a id="resume" class="sj-btn primary large" href="Genomgang.html?del=franskiljning&amp;avsnitt=mal">Börja med frånskiljning</a></div>
</header>
<section aria-labelledby="sa-gor-du"><h2 id="sa-gor-du">Så arbetar du</h2><ol class="study-method"><li><strong>Läs med en uppgift i åtanke.</strong> Rutan ”Gör nu” talar om vad du ska leta efter i texten eller figuren.</li><li><strong>Följ exemplet och prova själv.</strong> Ha papper och räknare till hands. Skriv svaret på sidan och tryck på ”Kontrollera mitt svar” eller ”Spara mitt försök”.</li><li><strong>Använd återkopplingen.</strong> Rätta din metod med ledtråden. Efter två olika ifyllda försök kan du läsa lösningen. Fortsätt när du kan förklara metoden, eller ta med frågan till läraren.</li></ol><p class="study-note">Läsmarkeringar sköts automatiskt. De visar vad du har gått igenom. Du behöver också kunna förklara hur du tänkte. Din senaste plats och dina svar sparas i den här webbläsaren.</p></section>
<section aria-labelledby="ordning"><h2 id="ordning">Vad gör vi under veckan?</h2><p>Arbeta i den här ordningen och följ lektionernas plan. Varje del samlar förklaringar, exempel och övningar på samma sida.</p><ol class="study-lessons">{''.join(rows)}</ol></section>
<section class="study-stage" id="labb"><p class="study-kicker">Fredag · efter del 1–3</p><h2>Använd det du har tränat på i labben</h2><p>Öppna den guidade simulatorlabben och gör åtta uppgifter. För varje mätning: <strong>beräkna först, läs av, jämför och förklara</strong>. Dina mätningar blir ett protokoll som används i växelströmsinlämningens uppgift 4.</p><a class="sj-btn" href="../../vaxelstromslabbet/?lage=guidad">Öppna den guidade simulatorlabben</a></section>
<section class="study-stage" id="inlamning"><h2>Vad ska jag lämna in?</h2><p><strong>Senast söndag 4 oktober:</strong> lämna båda inlämningarna via den kanal läraren har anvisat.</p><ol><li><a href="Inlamning.html">Växelström, uppgift 1–4</a>: beräkningar, förklaringar och labbprotokoll.</li><li><a href="../../vecka-38/aktuell/Inlamning.html">Frånskiljning och mätteknik, uppgift 1–3</a>: dina svar och motiveringar.</li></ol><p>Övningarna i arbetsrummet är <strong>träning inför dessa inlämningar</strong>. Att läsa alla avsnitt innebär inte att du har lämnat in.</p><p>Efter lektionen: öppna <a href="Resultat.html">Skicka resultat</a>, skriv ditt namn, ta en skärmbild av QR-koden och skicka den till läraren. Följ också instruktionerna på respektive inlämningssida.</p></section>
<details class="study-resources" id="schema"><summary>Detaljerad plan: på lektionen och hemma</summary>{schedule}</details>
<details class="study-resources"><summary>Film, presentation och extra stöd</summary><p>Läraren använder presentation och film på lektionen. För eget arbete följer du arbetsrummets steg; använd filmen eller artikeln när du vill repetera en förklaring.</p><p><a href="../../bildspel/">Bildspel, PowerPoint och PDF</a> · <a href="Kortfilmer.html">Korta filmer</a> · <a href="Beteckningar.html">Beteckningar</a> · <a href="../../gemensamt/Raknehjalp.html">Räknarhjälp</a></p></details>
</main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>'''
