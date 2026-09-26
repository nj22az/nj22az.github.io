#!/usr/bin/env python3
"""Sidmall för inlämningsuppgifterna vecka-XX/aktuell/Inlamning.html.

Uppgifterna ligger i innehållsdatabasen (sjoskolan/innehall, ytan inlamning) och skrivs av
    python3 sjoskolan/innehall/innehall.py bygg inlamning
Här finns bara veckornas rubrik och sista inlämningsdag samt HTML-mallen.
"""
from html import escape

V = '20260928'
MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']
VECKOR = {
    37: {'titel': 'Elens grunder och elsäkerhet', 'sista': '2026-09-13'},
    38: {'titel': 'Frånskiljning och mätteknik', 'sista': '2026-09-20'},
    39: {'titel': 'Effekt, Kirchhoff och multimeter', 'sista': '2026-09-27'},
    40: {'titel': 'Växelström', 'sista': '2026-10-04'},
    41: {'titel': 'Trefas och laboration', 'sista': '2026-10-11'},
    42: {'titel': 'Elektriska risker och skydd', 'sista': '2026-10-18'},
    43: {'titel': 'Komponenter, motorer och scheman', 'sista': '2026-10-25'},
    44: {'titel': 'Elsystem och fördjupad mätteknik', 'sista': '2026-11-01'},
    45: {'titel': 'Felsökning och repetition', 'sista': '2026-11-08'},
}


def datum(iso):
    y, m, d = map(int, iso.split('-'))
    return f'{d} {MONTHS[m - 1]}'


def page(nr, w, items):
    """items: uppgifternas HTML (från innehall/export/inlamning.py)."""
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inlämning vecka {nr}: {escape(w["titel"])} · Sjöskolan</title><meta name="description" content="Inlämningsuppgifter för vecka {nr} som löses med veckans genomgångar och labbar."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{nr}/aktuell/Inlamning.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v={V}"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}">
<style>.task{{margin:24px 0}}.course-main .task h2{{margin-top:0;font-size:23px}}.task .use{{font-size:15px;color:var(--sj-muted)}}.task ol{{padding-left:26px}}.task li{{margin:6px 0}}.task .hand-in{{margin:12px 0 0;padding-top:12px;border-top:1px solid var(--sj-line)}}.dbox{{max-width:72ch}}.course-main .dbox h2{{margin-top:0}}@media print{{.task{{break-inside:avoid;border:1px solid #999}}.dbox{{border:1px solid #999}}}}</style></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/bildspel/">Bildspel</a><a href="/sjoskolan/vecka-{nr}/aktuell/">Vecka {nr}</a></nav><main id="main-content" class="course-main"><div class="course-breadcrumb"><a href="index.html">← Vecka {nr}</a></div><article class="course-reading">
<p class="course-kicker">Vecka {nr} · inlämning</p><h1>Inlämningsuppgifter: {escape(w["titel"])}</h1>
<p class="course-lead">Uppgifterna löses med veckans genomgångar och labbar. Lämna in senast söndag {datum(w["sista"])} via den inlämningskanal läraren har anvisat.</p>
<div class="sj-panel soft dbox"><h2>Ditt tal D</h2><p>Flera uppgifter använder ditt tal <strong>D</strong>: dagen i månaden du är född, 1–31. Är du född den 7 mars är D = 7. Skriv D överst i din inlämning. Då får du egna värden och läraren kan kontrollera dina svar.</p></div>
<h2>Så redovisar du</h2><ul><li>Skriv givna värden, samband, insättning och svar med enhet.</li><li>Skriv förutsägelsen innan du tittar i labbet, och skriv sedan ditt avlästa värde.</li><li>Förklara med egna ord och egna siffror. Skilj på vad du har observerat och vad du drar för slutsats.</li><li>Bifoga labbprotokoll som PDF när uppgiften säger det.</li></ul>
{items}
<h2>Bedömning</h2><ul><li>Metoden syns och går att följa, och enheterna stämmer.</li><li>Labbvärdena är dina egna och jämförs med din beräkning.</li><li>Förklaringarna använder begreppen från genomgången.</li><li>Säkerhetsresonemang skiljer på observation och antagande och hittar inte på uppgifter som saknas.</li></ul>
</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>
'''


if __name__ == '__main__':
    raise SystemExit('Kör: python3 sjoskolan/innehall/innehall.py bygg inlamning')
