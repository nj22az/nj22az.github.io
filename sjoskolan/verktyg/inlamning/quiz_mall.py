#!/usr/bin/env python3
"""Sidmall för quizen vecka-XX/aktuell/Quiz.html (beslut 12 oktober 2026).

Eleven läser veckans texter (PDF) hemma och svarar på flervalsfrågor med bokstäverna A–E senast det datum som står i
sjalvrattning.py QUIZ. Texterna och frågorna ligger i innehållsdatabasen (ytan quiz, en post per text)
och sidan skrivs av

    python3 sjoskolan/innehall/innehall.py bygg quiz

Fälten, bokstäverna och hänvisningarna kommer från sjalvrattning.py (dokument_falt). Nyckeln med hashade svar skrivs av

    python3 sjoskolan/verktyg/inlamning/facit.py 42 --sida quiz --svar /utanför/repot/quiz-v42.json

Sidans beteende: gemensamt/quiz-sida.mjs (tre försök per fråga, ny omgång per text efter Jag har läst om
texten, Lämna in och PDF:en). Rättning, status och PDF:ens innehåll: gemensamt/sjalvrattning.mjs.
"""
import datetime
import hashlib
import html
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sjalvrattning as S  # noqa: E402

V = '20260930'  # sjoskolan.css och course.css, samma som inlämningen
EPOST = 'nils@sjoskolan.se'
NYCKEL = 'quiz-nyckel.mjs'
DAGAR = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag']
MANADER = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november',
           'december']


def dag_text(iso):
    """2026-10-15 → torsdag 15 oktober."""
    d = datetime.date.fromisoformat(iso)
    return f'{DAGAR[d.weekday()]} {d.day} {MANADER[d.month - 1]}'


def ingress(n):
    """Läs texten hemma / Läs de fyra texterna hemma."""
    tal = {2: 'två', 3: 'tre', 4: 'fyra', 5: 'fem', 6: 'sex'}
    return 'Läs texten hemma' if n == 1 else f'Läs de {tal.get(n, n)} texterna hemma'


def attr(text):
    return html.escape(str(text), quote=True)


def dokument_html(nr, n, pl, p):
    """En text: rubrik, länken till PDF:en, läsanvisningen, källan och frågorna med Rätta."""
    href, titel = S.textkalla(p)
    lm = ' '.join(p['larande'].get('mal', []))
    kalla = f'<p class="ri-kalla">Källa: {S.mark(p["referenser"]["rattigheter"])}</p>' if p['referenser'].get('rattigheter') else ''
    falt = ''.join(S.falt_html(nr, f) for f in S.dokument_falt(nr, p))
    return (f'<section class="task sj-panel ri-dok" id="{attr(pl.get("ankare") or f"text-{n}")}" data-ovning="{p["id"]}">'
            f'<h2>{html.escape(pl.get("nummer") or f"Text {n}")}. {S.mark(p["titel"])}</h2>'
            f'<p class="ri-dok-oppna"><a class="sj-btn" href="{attr(href)}">Öppna texten (PDF)</a></p>'
            f'<p class="ri-lasanvisning">{S.mark(p["uppgift"]["fraga"])}</p>{kalla}'
            f'<div class="ri-svar" data-ovning="{p["id"]}" data-nr="{n}" data-titel="{attr(p["titel"])}" data-lm="{lm}" '
            f'data-href="{attr(href)}" data-dok="{attr(titel)}"><h3>Dina svar</h3>{falt}'
            f'<div class="ri-knappar"><button type="button" class="sj-btn ri-ratta">Rätta text {n}</button>'
            '<p class="ri-summa" aria-live="polite"></p></div></div></section>\n')


def lasom_ruta(dokument):
    """Rutan Låsta frågor överst: bara texterna med låsta frågor visas (gemensamt/quiz-sida.mjs)."""
    rader = ''
    for _, p in dokument:
        href, titel = S.textkalla(p)
        rader += (f'<li data-ri-dok="{p["id"]}" hidden><a href="{attr(href)}">Öppna {html.escape(titel)}</a> '
                  f'<span class="ri-lasstatus" data-ri-omstatus="{p["id"]}"></span> '
                  f'<button type="button" class="ri-textknapp" data-ri-omlast="{p["id"]}">Jag har läst om texten</button></li>')
    return ('<section class="sj-panel warn ri-lasom" id="ri-lasom" hidden><h2>Låsta frågor</h2>'
            f'<p>Läs om texten. Tryck sedan Jag har läst om texten, så får du {S.MAX_FORSOK} nya försök på de låsta frågorna '
            'i den texten.</p>'
            f'<ul class="ri-lasom-lista">{rader}</ul><p class="ri-lasom-klart" role="status"></p></section>\n')


def sa_gor_du(nr, sista):
    m = S.MAX_FORSOK
    return ('<div class="sj-panel soft handin-mail"><h2>Så gör du</h2><ol>'
            '<li>Öppna texten och läs den hemma. Läsanvisningen under varje text säger vilka avsnitt du ska läsa.</li>'
            '<li>Välj ett svar på varje fråga, A, B, C, D eller E, och tryck <strong>Rätta</strong>. Skiljer sig ett svar står det '
            'var i texten du kan läsa.</li>'
            f'<li>Du har {m} försök på varje fråga. Efter {m} fel låses frågan. Läs om texten och tryck <strong>Jag har läst om '
            f'texten</strong>, så får du {m} nya försök.</li>'
            f'<li>Tryck <strong>Lämna in</strong> längst ner, ladda ner PDF:en och lämna in den i Google Classroom under Vecka {nr} – '
            f'Quiz senast {sista}.</li></ol>'
            '<p>Läraren ser ditt första och ditt sista svar på varje fråga och hur många försök du gjorde.</p>'
            '<p><a class="sj-btn" href="#lamna-in">Till Lämna in</a></p></div>\n')


def lamna_in(nr, sista, mal):
    lm = attr(json.dumps(S.lm_text(mal), ensure_ascii=False))
    classroom = f'Lämna in PDF-filen i Google Classroom under Vecka {nr} – Quiz senast {sista}.'
    return (f'<section class="sj-panel ri-lamna" id="lamna-in" data-ri-quiz data-ri-vecka="{nr}" '
            f'data-ri-lagring="sj-v{nr}-quiz" data-ri-epost="{EPOST}" data-ri-titel="Quiz vecka {nr}" '
            f'data-ri-max="{S.MAX_FORSOK}" data-ri-lm="{lm}" data-ri-classroom="{attr(classroom)}">'
            '<h2>Lämna in</h2><p>När du har svarat på alla frågor: skriv ditt namn och tryck Lämna in. Sidan rättar alla svar och '
            'visar ditt resultat för varje text. Sedan laddar du ner PDF:en.</p>'
            '<noscript><p><strong>Sidan behöver JavaScript för att rätta och lämna in.</strong> Skriv frågans bokstav och ditt '
            f'svar i ett dokument och lämna in det i Google Classroom under Vecka {nr} – Quiz.</p></noscript>'
            '<p class="ri-lagring" role="status" hidden></p>'
            '<p><label for="ri-namn">Förnamn och efternamn</label><input id="ri-namn" type="text" autocomplete="name"></p>'
            '<p class="ri-namnfel" role="alert"></p>'
            '<p><button type="button" class="sj-btn primary large" id="ri-lamna">Lämna in</button></p>'
            '<div class="ri-resultat" id="ri-resultat" tabindex="-1" hidden></div></section>\n')


def skript(nr, nyckel=NYCKEL):
    """Sidans modul. Nyckelns version är filens hash (regel 13). Saknas nyckeln startar sidan ändå (starta(null)): eleven
    kan svara och lämna in, och läraren rättar PDF:en."""
    fil = S.SJO / f'vecka-{nr}' / 'aktuell' / nyckel
    v = hashlib.sha256(fil.read_bytes()).hexdigest()[:10] if fil.exists() else 'saknas'
    return (f'<script type="module">import {{starta}} from \'/sjoskolan/gemensamt/quiz-sida.mjs?v={S.VERSION}\';'
            f'import(\'./{nyckel}?v={v}\').then((m) => starta(m.NYCKEL), () => starta(null));</script>\n')


def sida(nr, dokument, nyckel=NYCKEL):
    """Hela sidan. dokument: [(placering, post)] i ordning (innehall/export/quiz.py). nyckel: nyckelfilens namn
    bredvid sidan (testerna bygger en provsida med en egen nyckel)."""
    dokument = list(dokument)
    if nr not in S.QUIZ:
        raise SystemExit(f'vecka {nr} har ingen quiz i sjalvrattning.py QUIZ')
    if not dokument:
        raise SystemExit(f'vecka {nr}: quizen har inga texter')
    sista = dag_text(S.QUIZ[nr]['sista'])
    mal = sorted({m for _, p in dokument for m in p['larande'].get('mal', [])}, key=lambda m: int(m.split('-')[1]))
    texter = ''.join(dokument_html(nr, n, pl, p) for n, (pl, p) in enumerate(dokument, 1))
    veckosida = f'/sjoskolan/vecka-{nr}/aktuell/'
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Quiz vecka {nr} · Sjöskolan</title><meta name="description" content="Quiz vecka {nr}: läs texterna hemma och svara på flervalsfrågorna. Sidan rättar svaren och ger en PDF att lämna in."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{nr}/aktuell/{S.QUIZ_SIDA}"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v={V}"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjalvrattning.css?v={S.VERSION}">
<style>.task{{margin:24px 0}}.course-main .task h2{{margin-top:0;font-size:23px}}.course-main .handin-mail h2{{margin-top:0;font-size:21px}}.handin-mail ol{{padding-left:26px}}.handin-mail li{{margin:6px 0}}@media print{{.task{{break-inside:avoid;border:1px solid #999}}}}</style><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/bildspel/">Bildspel</a><a href="{veckosida}">Vecka {nr}</a></nav><main id="main-content" class="course-main"><div class="course-breadcrumb"><a href="{veckosida}">← Vecka {nr}</a></div><article class="course-reading">
<p class="course-kicker">Vecka {nr} · quiz</p><h1>Quiz vecka {nr}</h1>
<p class="course-lead">{ingress(len(dokument))} och svara på alla frågor senast <strong>{sista}</strong>. Lämna in PDF:en i Google Classroom.</p>
{sa_gor_du(nr, sista)}{lasom_ruta(dokument)}{texter}{lamna_in(nr, sista, mal)}</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer>{skript(nr, nyckel)}</body></html>
'''


if __name__ == '__main__':
    raise SystemExit('Kör: python3 sjoskolan/innehall/innehall.py bygg quiz')
