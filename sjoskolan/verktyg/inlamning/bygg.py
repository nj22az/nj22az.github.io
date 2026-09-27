#!/usr/bin/env python3
"""Sidmall för inlämningsuppgifterna vecka-XX/aktuell/Inlamning.html.

Uppgifterna ligger i innehållsdatabasen (sjoskolan/innehall, ytan inlamning) och skrivs av
    python3 sjoskolan/innehall/innehall.py bygg inlamning
Här finns bara veckornas rubrik och sista inlämningsdag samt HTML-mallen.
"""
from html import escape

V = '20260930'
MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']
# Mappnamnen ändras aldrig. 'vecka' är veckan eleven ser: kursen började vecka 38, så vecka-37/ undervisades vecka 38,
# och vecka-38/ (Frånskiljning och mätteknik) ingår i vecka 40 och lämnas in med den (verktyg/veckosidor/bygg.py).
VECKOR = {
    37: {'titel': 'Elens grunder och elsäkerhet', 'sista': '2026-09-20', 'vecka': 38},
    38: {'titel': 'Frånskiljning och mätteknik', 'sista': '2026-10-04', 'vecka': 40, 'veckosida': '/sjoskolan/vecka-40/aktuell/',
         'notis': 'Ingår i vecka 40. Lämnas in senast söndag 4 oktober, tillsammans med växelströmsuppgifterna. D på den här sidan räknas ur ditt namn och är ett annat tal än D i växelströmsuppgifterna.'},
    39: {'titel': 'Effekt, Kirchhoff och multimeter', 'sista': '2026-09-27'},
    40: {'titel': 'Växelström', 'sista': '2026-10-04',
         'notis': 'Den här veckan lämnar du också in Frånskiljning och mätteknik, uppgift 1–3, på en egen sida.', 'notis_lank': ('/sjoskolan/vecka-38/aktuell/Inlamning.html', 'Inlämning: Frånskiljning och mätteknik')},
    41: {'titel': 'Trefas och laboration', 'sista': '2026-10-11'},
    42: {'titel': 'Elektriska risker och skydd', 'sista': '2026-10-18'},
    43: {'titel': 'Komponenter, motorer och scheman', 'sista': '2026-10-25'},
    44: {'titel': 'Elsystem och fördjupad mätteknik', 'sista': '2026-11-01'},
    45: {'titel': 'Felsökning och repetition', 'sista': '2026-11-08'},
}


NAMNRUTA = '''<div class="sj-panel soft dbox"><h2>Ditt namn ger dina egna värden</h2><p>Flera uppgifter använder talet <strong>D</strong>, som räknas fram ur ditt namn. Skriv ditt för- och efternamn här, och skriv samma namn överst i inlämningen och i labbprotokollen. Läraren räknar fram samma D ur namnet och kan kontrollera dina svar.</p><p><label for="elevnamn">Förnamn och efternamn</label><br><input id="elevnamn" type="text" autocomplete="name" placeholder="Förnamn Efternamn"></p><p id="elevtal" aria-live="polite"><noscript>Sidan behöver JavaScript för att räkna fram D.</noscript></p></div>
<script type="module">import {elevtal,fulltNamn,sparatNamn,sparaNamn} from '/sjoskolan/gemensamt/elevtal.mjs?v=20260930';const i=document.getElementById('elevnamn'),o=document.getElementById('elevtal');i.value=sparatNamn();const visa=()=>{const ok=fulltNamn(i.value);o.innerHTML=ok?`Ditt tal är <strong>D = ${elevtal(i.value)}</strong>. Använd det i uppgifterna nedan.`:'Skriv både förnamn och efternamn, så visas ditt D.';if(ok)sparaNamn(i.value);};i.addEventListener('input',visa);visa();</script>
'''


def datum(iso):
    y, m, d = map(int, iso.split('-'))
    return f'{d} {MONTHS[m - 1]}'


# Veckor med resultatkod: D slumpas på enheten, svaren skrivs i rutor och skickas med QR-koden (vecka-XX/aktuell/resultat.mjs).
RESULTATKOD = {40}


def dbox(nr):
    if nr not in RESULTATKOD:
        return NAMNRUTA
    return (f'<div class="sj-panel soft dbox"><h2>Ditt tal D</h2><p>Flera uppgifter använder talet <strong>D</strong>. Det slumpas första gången du öppnar veckan på en dator eller telefon och sparas där. Du behöver inte skriva ditt namn nu: det gör du i slutet, på sidan <a href="Resultat.html">Skicka resultat</a>.</p>'
            '<p id="elevtal" aria-live="polite"><noscript>Sidan behöver JavaScript för att visa D.</noscript></p>'
            '<details><summary>Har du redan ett D på en annan dator eller telefon?</summary><p><label for="annatD">Skriv D därifrån (1–31)</label><br><input id="annatD" inputmode="numeric" autocomplete="off" style="width:6em"> <button type="button" id="annatD-ok" class="sj-btn">Använd</button></p><p id="annatD-not" role="status"></p></details>'
            '<p>Skriv dina svar i rutorna under uppgift 1–3. De sparas i webbläsaren och följer med i QR-koden. Uträkningar och förklaringar lämnar du in som vanligt.</p></div>\n'
            f'<script type="module" src="/sjoskolan/vecka-{nr}/aktuell/inlamning-svar.mjs?v={V}-qr1"></script>\n')


def page(nr, w, items):
    """items: uppgifternas HTML (från innehall/export/inlamning.py)."""
    vn = w.get('vecka', nr)
    veckosida = w.get('veckosida', f'/sjoskolan/vecka-{nr}/aktuell/')
    notis = ''
    if w.get('notis'):
        lank = f' <a href="{w["notis_lank"][0]}">{escape(w["notis_lank"][1])}</a>' if w.get('notis_lank') else ''
        notis = f'<p class="sj-panel week-note"><strong>{escape(w["notis"])}</strong>{lank}</p>\n'
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inlämning vecka {vn}: {escape(w["titel"])} · Sjöskolan</title><meta name="description" content="Inlämningsuppgifter för vecka {vn} som löses med veckans genomgångar och labbar."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{nr}/aktuell/Inlamning.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v={V}"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}">
<style>.task{{margin:24px 0}}.course-main .task h2{{margin-top:0;font-size:23px}}.task .use{{font-size:15px;color:var(--sj-muted)}}.task ol{{padding-left:26px}}.task li{{margin:6px 0}}.task .hand-in{{margin:12px 0 0;padding-top:12px;border-top:1px solid var(--sj-line)}}.dbox{{max-width:72ch}}.dbox input{{min-height:44px;font:inherit;padding:4px 10px;width:22em;max-width:100%;border:1px solid var(--sj-field);border-radius:8px}}.course-main .dbox h2{{margin-top:0}}@media print{{.task{{break-inside:avoid;border:1px solid #999}}.dbox{{border:1px solid #999}}}}</style><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/bildspel/">Bildspel</a><a href="{veckosida}">Vecka {vn}</a></nav><main id="main-content" class="course-main"><div class="course-breadcrumb"><a href="{veckosida}">← Vecka {vn}</a></div><article class="course-reading">
<p class="course-kicker">Vecka {vn} · inlämning</p><h1>Inlämningsuppgifter: {escape(w["titel"])}</h1>
<p class="course-lead">Uppgifterna löses med veckans genomgångar och labbar. Lämna in senast söndag {datum(w["sista"])} via den inlämningskanal läraren har anvisat.</p>
{notis}{dbox(nr)}<h2>Så redovisar du</h2><ul><li>Skriv givna värden, samband, insättning och svar med enhet.</li><li>Skriv förutsägelsen innan du tittar i labbet, och skriv sedan ditt avlästa värde.</li><li>Förklara med egna ord och egna siffror. Skilj på vad du har observerat och vad du drar för slutsats.</li><li>Bifoga labbprotokoll som PDF när uppgiften säger det.</li></ul>
{items}
<h2>Bedömning</h2><ul><li>Metoden syns och går att följa, och enheterna stämmer.</li><li>Labbvärdena är dina egna och jämförs med din beräkning.</li><li>Förklaringarna använder begreppen från genomgången.</li><li>Säkerhetsresonemang skiljer på observation och antagande och hittar inte på uppgifter som saknas.</li></ul>
</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>
'''


if __name__ == '__main__':
    raise SystemExit('Kör: python3 sjoskolan/innehall/innehall.py bygg inlamning')
