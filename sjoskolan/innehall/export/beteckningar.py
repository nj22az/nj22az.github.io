"""Förkortningar och beteckningar: data för webbsidornas skript och ordlistan för vecka 40.

- gemensamt/beteckningar.gen.mjs: beteckningarna som JavaScript-data (gemensamt/beteckningar.mjs letar och ritar)
- gemensamt/beteckningar.css: ordlistornas utseende (samma i alla sidor)
- vecka-40/aktuell/Beteckningar.html: alla beteckningar som veckan använder, i en sida
"""
import rendera as R

PUBLIK = 'elev'
V = '20260928'


def sida(alla, vecka):
    lista = [b for b in alla if vecka in b['veckor']]
    rader = ''.join(
        f'<div class="bet-rad" id="{b["id"]}"><dt>{R.h(b["visa"])}</dt><dd><strong>{R.h(b["namn"])}</strong>'
        + (f' <span class="bet-utl">({R.h(b["utlasning"])})</span>' if b.get('utlasning') else '') + f'. {R.h(b["forklaring"])}'
        + (f' <span class="bet-enhet">Enhet: {R.h(b["enhet"])}.</span>' if b.get('enhet') else '') + (f' {R.h(b["exempel"])}' if b.get('exempel') else '')
        + (f' <strong>Obs:</strong> {R.h(b["obs"])}' if b.get('obs') else '') + '</dd></div>' for b in lista)
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Förkortningar och beteckningar · vecka {vecka} · Sjöskolan</title><meta name="description" content="Alla förkortningar, storheter och enheter i vecka {vecka}, förklarade."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{vecka}/aktuell/Beteckningar.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v=20260926"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}"><link rel="stylesheet" href="/sjoskolan/gemensamt/beteckningar.css?v={V}"></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/bildspel/">Bildspel</a><a href="/sjoskolan/vecka-{vecka}/aktuell/">Vecka {vecka}</a></nav>
<main id="main-content" class="course-main"><div class="course-breadcrumb"><a href="index.html">← Vecka {vecka}</a></div><article class="course-reading">
<p class="course-kicker">Vecka {vecka} · stöd</p><h1>Förkortningar och beteckningar</h1>
<p class="course-lead">Alla förkortningar, storheter och enheter som veckans genomgångar, övningar och labb använder. Samma förklaringar finns i rutan Beteckningar under varje avsnitt.</p>
<p>Tips: ett index skrivs nedsänkt, till exempel X<sub>L</sub>. Det läses ”X L” och betyder att X hör till spolen (L). En hatt, som i û, betyder toppvärde.</p>
<dl class="bet-lista bet-sida">{rader}</dl>
<p><a href="../../gemensamt/Formelblad_och_begrepp.html">Formelblad och begrepp</a> har alla formler och begreppen på engelska.</p>
</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>
'''


def filer(a):
    alla = a.beteckningar()
    data = [{k: b[k] for k in ('id', 'visa', 'former', 'efter_tal', 'formel', 'namn', 'utlasning', 'forklaring', 'enhet', 'exempel', 'obs') if k in b} for b in alla]
    return {
        'gemensamt/beteckningar.gen.mjs': '// GENERERAD FIL · ur sjoskolan/innehall/beteckningar.json (innehall.py bygg). Redigera inte här.\nexport const BETECKNINGAR = ' + R.js(data, indent=1) + ';\n',
        'gemensamt/beteckningar.css': '/* GENERERAD FIL · innehall/export/rendera.py BET_CSS */\n' + R.BET_CSS + '\n.bet-sida .bet-rad{scroll-margin-top:16px}\n',
        'vecka-40/aktuell/Beteckningar.html': sida(alla, 40),
    }
