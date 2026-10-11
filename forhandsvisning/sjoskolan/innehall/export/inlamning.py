"""Inlämningssidorna vecka-XX/aktuell/Inlamning.html ur ytan inlamning. Sidmallen ligger i verktyg/inlamning/bygg.py."""
import importlib.util
import re

import rendera as R

PUBLIK = 'elev'
YTA = 'inlamning'


def _mall():
    spec = importlib.util.spec_from_file_location('inlamning_mall', R.SJO / 'verktyg' / 'inlamning' / 'bygg.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def uppgift(pl, p):
    u = p['uppgift']
    anv = ' · '.join(f'<a href="{R.attr(x["url"].replace("vecka-", "../../vecka-") if x["url"].startswith("vecka-") else "../../" + x["url"])}">{R.h(x["titel"])}</a>'
                     for x in p['referenser'].get('resurser', []))
    # Från vecka 41: delsidan (teori, exempel och övningar) först bland det som ska användas.
    vecka = int(pl['plats'].split('-')[1].split('/')[0])
    if vecka >= 41:
        kap = sorted({int(m) for x in p['referenser'].get('resurser', []) for m in re.findall(r'v%d_0(\d)' % vecka, x['url'])})
        del_ = ' · '.join(f'<a href="Del_{k}.html">Del {k}: teori och övningar</a>' for k in kap)
        anv = f'{del_} · {anv}' if del_ and anv else (del_ or anv)
    delar = ''.join(f'<li>{R.h(d["text"])}</li>' for d in u.get('delfragor', []))
    return (f'<section class="task sj-panel" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h2>{R.h(pl["nummer"])}. {R.h(p["titel"])}</h2>'
            f'<p class="use"><strong>Använd:</strong> {anv}</p><p>{R.h(u["fraga"])}</p><ol type="a">{delar}</ol>'
            f'<p class="hand-in"><strong>Redovisa:</strong> {R.h(u.get("svarsformat", ""))}</p></section>')


def filer(a):
    mall = _mall()
    ut = {}
    for plats in a.platser(YTA):
        nr = int(plats.split('-')[1].split('/')[0])
        items = ''.join(uppgift(pl, p) for pl, p in a.placeringar(YTA, plats))
        ut[plats] = mall.page(nr, mall.VECKOR[nr], items)
    return ut
