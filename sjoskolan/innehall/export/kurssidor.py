"""Kurssidorna Formelstöd och övningar: övningarna under varje kapitel, med ledtrådar i steg och facit.

Ytan kurs-formelstod bestämmer vilka övningar som visas, i vilken ordning och med vilket nummer.
Sidans övriga innehåll (teori och exempel) ligger utanför regionerna och redigeras i sidan.
"""
import re

from region import ersatt
import rendera as R

PUBLIK = 'elev'
YTA = 'kurs-formelstod'
VECKOR_MED_BETECKNINGAR = {40}  # veckor vars beteckningar finns i beteckningar.json
STIL = ('<style>.facit,.ledtrad{margin:12px 0 0;border:1px solid var(--sj-line,#cad8e2);border-radius:12px;padding:4px 16px;background:#fff}'
        '.facit{border-left:8px solid var(--sj-ok,#176844)}.ledtrad{border-left:8px solid var(--sj-accent,#064f91)}'
        '.facit[open],.ledtrad[open]{padding-bottom:12px}.facit p,.ledtrad p{margin:4px 0 0}.facit summary,.ledtrad summary{cursor:pointer;min-height:44px;display:flex;align-items:center}'
        '@media print{.facit,.ledtrad{display:none}}' + R.BET_CSS + '</style>')


def artikel(pl, p):
    u = p['uppgift']
    h = [f'<article class="exercise" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h3>{R.h(pl["nummer"])}: {R.h(p["titel"])}</h3>']
    h += [f'<p>{R.h(x)}</p>' for x in (u.get('stycken') or [u['fraga']])]
    if u.get('samband'):
        h.append('<p class="formula">' + '<br>'.join(R.h(x) for x in u['samband']) + '</p>')
    if u.get('givet'):
        h.append(f'<p><strong>Förutsättningar:</strong> {R.h(u["givet"])}</p>')
    for n, l in enumerate(p.get('ledtradar', []), 1):
        h.append(f'<details class="ledtrad"><summary>Ledtråd {n}: {R.LEDTRAD[l["niva"]]}</summary><p>{R.h(l["text"])}</p></details>')
    los = p.get('losning') or {}
    if los.get('text') and p['referenser'].get('losning_publik', True):
        h.append(f'<details class="facit"><summary>Kontrollera ditt svar</summary><p>{R.h(los["text"])}</p></details>')
    h.append('</article>')
    return ''.join(h)


def filer(a):
    ut = {}
    for plats in a.platser(YTA):
        text = (R.SJO / plats).read_text(encoding='utf-8')
        text = re.sub(r'<style>\.facit[,{].*?</style>(<!-- facit\.css -->)?', STIL, text, count=1, flags=re.S)
        for del_ in a.delar(YTA, plats):
            pls = a.placeringar(YTA, plats, del_)
            rad = [artikel(pl, p) for pl, p in pls]
            if int(del_[1:3]) in VECKOR_MED_BETECKNINGAR:
                texter = [x for _, p in pls for x in [p['titel'], *(p['uppgift'].get('stycken') or [p['uppgift']['fraga']]), p['uppgift'].get('givet'),
                                                     *[l['text'] for l in p.get('ledtradar', [])], (p.get('losning') or {}).get('text')]]
                formler = [x for _, p in pls for x in p['uppgift'].get('samband', [])]
                lista = R.beteckningar_i(texter, a.beteckningar(), formler)
                rad.insert(0, R.beteckningar_html(lista, 'Förkortningar och beteckningar i övningarna') + '<p class="muted"><a href="Beteckningar.html">Alla beteckningar för veckan</a></p>')
            forsta = r'<article class="exercise" id="%s-q\d+">.*?</article>(?=\s*</section>)' % re.escape(del_)
            text = ersatt(text, f'ovningar-{del_}', '\n' + '\n'.join(rad) + '\n', forsta)
        ut[plats] = text
    return ut
