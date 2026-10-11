"""Övningstentan i tentamen.html: uppgifterna med lösningar ur ytan tentamen."""
import re

from region import ersatt
import rendera as R

PUBLIK = 'elev'
YTA = 'tentamen'


def sektion(pl, p):
    u = p['uppgift']
    veckor = (p.get('bedomning') or {}).get('kursniva', '').replace('Veckor: ', '')
    h = [f'<section class="exam-q" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h3>{R.h(pl["nummer"])}. {R.h(p["titel"])} <span class="week-tag">{R.h(veckor)}</span></h3>']
    h += [f'<p>{R.h(x)}</p>' for x in (u.get('stycken') or [u['fraga']])]
    los = p.get('losning') or {}
    if los.get('text') and p['referenser'].get('losning_publik', True):
        h.append(f'<details class="facit"><summary>Visa lösning</summary><p>{R.h(los["text"])}</p></details>')
    h.append('</section>')
    return ''.join(h)


def filer(a):
    plats = 'tentamen.html'
    text = (R.SJO / plats).read_text(encoding='utf-8')
    rad = '\n'.join(sektion(pl, p) for pl, p in a.placeringar(YTA, plats))
    text = ersatt(text, 'ovningstenta', '\n' + rad + '\n', r'<section class="exam-q">.*</section>')
    return {plats: text}
