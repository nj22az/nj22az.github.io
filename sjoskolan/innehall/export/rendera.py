"""Gemensam rendering för exportörerna."""
import html
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'lib'))
import text as T  # noqa: E402

SJO = Path(__file__).resolve().parents[2]
LEDTRAD = {'begrepp': 'vad betyder storheterna?', 'metod': 'hur går jag vidare?', 'nasta-steg': 'nästa steg'}


def h(text):
    """Innehållstext till HTML (index som <sub>/<sup>)."""
    return T.html_text(text)


def attr(text):
    return html.escape(T.ren_text(text), quote=True)


def js(obj, indent=None):
    import json
    return json.dumps(obj, ensure_ascii=False, indent=indent)


GRANS = r'(?<![\wÅÄÖåäö{}])'
SLUT = r'(?![\wÅÄÖåäö{}])'


def beteckningar_i(texter, alla, formler=()):
    """Beteckningarna (ur beteckningar.json) som förekommer i texterna, i den ordning de först dyker upp.

    texter: löptext med markering. formler: samband och formler, där även ensamma bokstäver (formel=true) letas.
    """
    import re
    lop = ' \n '.join(T.ren_text(t) for t in texter if t)
    form = ' \n '.join(T.ren_text(t) for t in formler if t)
    # I löptext räknas en ensam bokstav som symbol bara intill =, ·, / eller ett tal med enhet (P = 1 150 W).
    ut = []
    for b in alla:
        pos = None
        for f in sorted(b['former'], key=len, reverse=True):
            rx = GRANS + re.escape(f) + SLUT
            if b.get('formel'):
                kandidater = [m.start() for m in re.finditer(rx, form)]
                kandidater += [m.start() + len(lop) for m in re.finditer(GRANS + re.escape(f) + r'(?=\s*[=·/²]|\)|\s*\()', lop)]
            else:
                kandidater = [m.start() for m in re.finditer(rx, lop)] + [m.start() + len(lop) for m in re.finditer(rx, form)]
            if kandidater:
                pos = min(kandidater) if pos is None else min(pos, min(kandidater))
        for f in b.get('efter_tal', []):  # bara direkt efter ett tal: 1 150 var, 0,94 rad, 0,1 H
            rx = r'(?<=\d)\s?' + re.escape(f) + SLUT
            kandidater = [m.start() for m in re.finditer(rx, lop)] + [m.start() + len(lop) for m in re.finditer(rx, form)]
            if kandidater:
                pos = min(kandidater) if pos is None else min(pos, min(kandidater))
        if pos is not None:
            ut.append((pos, b))
    return [b for _, b in sorted(ut, key=lambda x: x[0])]


def beteckningar_html(lista, rubrik='Beteckningar', oppen=False):
    """Ordlista som <details> (kort i löptexten, går att öppna när man behöver den)."""
    if not lista:
        return ''
    rader = []
    for b in lista:
        extra = ''.join(f' {x}' for x in [b.get('utlasning') and f'<span class="bet-utl">({h(b["utlasning"])})</span>'] if x)
        enhet = f' <span class="bet-enhet">Enhet: {h(b["enhet"])}.</span>' if b.get('enhet') else ''
        exempel = f' {h(b["exempel"])}' if b.get('exempel') else ''
        obs = f' <strong>Obs:</strong> {h(b["obs"])}' if b.get('obs') else ''
        rader.append(f'<div class="bet-rad" id="bet-{b["id"]}"><dt>{h(b["visa"])}</dt><dd><strong>{h(b["namn"])}</strong>{extra}. {h(b["forklaring"])}{enhet}{exempel}{obs}</dd></div>')
    return (f'<details class="beteckningar"{" open" if oppen else ""}><summary>{h(rubrik)} ({len(lista)})</summary>'
            f'<dl class="bet-lista">{"".join(rader)}</dl></details>')


BET_CSS = ('.beteckningar{margin:16px 0;border:1px solid var(--sj-line,#cad8e2);border-radius:12px;padding:4px 16px;background:#fff}'
           '.beteckningar summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700}'
           '.bet-lista{margin:4px 0 12px}.bet-rad{display:grid;grid-template-columns:5.5em minmax(0,1fr);gap:12px;padding:8px 0;border-top:1px solid var(--sj-line,#cad8e2)}'
           '.bet-rad dt{font-weight:700;font-size:18px}.bet-rad dd{margin:0}.bet-utl,.bet-enhet{color:var(--sj-muted,#4d6579)}'
           '@media(max-width:560px){.bet-rad{grid-template-columns:4em minmax(0,1fr)}}')
