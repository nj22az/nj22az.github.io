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


def _delar(vecka, resurser, S):
    """Länkar till delsidorna som uppgiftens resurser hör till: (delnummer, adress) i veckan eleven läser. En del i en annan
    veckas mapp (vecka-45/aktuell/Del_1.html är vecka 43 del 4) får sitt nummer i veckan (sjalvrattning.py dellank)."""
    ut = {}
    for x in resurser:
        for mv, k in re.findall(r'v(\d\d)_0(\d)', x['url']):
            hit = S.dellank(vecka, int(mv), int(k)) if S else None
            if hit:
                ut[hit[0]] = hit[1]
            elif int(mv) == vecka:
                ut[int(k)] = f'Del_{k}.html'
    return sorted(ut.items())


def uppgift(pl, p, svar='', fragelista=True, S=None):
    """En uppgift. svar: svarsfälten för en självrättande vecka (verktyg/inlamning/sjalvrattning.py); de ersätter raden Redovisa.
    fragelista=False: frågorna står i svarsfälten (läsförståelsen) och listas inte en gång till."""
    u = p['uppgift']
    anv = ' · '.join(f'<a href="{R.attr(x["url"].replace("vecka-", "../../vecka-") if x["url"].startswith("vecka-") else "../../" + x["url"])}">{R.h(x["titel"])}</a>'
                     for x in p['referenser'].get('resurser', []))
    # Från vecka 41: delsidan (teori, exempel och övningar) först bland det som ska användas.
    vecka = int(pl['plats'].split('-')[1].split('/')[0])
    if vecka >= 41:
        del_ = ' · '.join(f'<a href="{R.attr(href)}">Del {k}: teori och övningar</a>' for k, href in _delar(vecka, p['referenser'].get('resurser', []), S))
        anv = f'{del_} · {anv}' if del_ and anv else (del_ or anv)
    delar = ''.join(f'<li>{R.h(d["text"])}</li>' for d in u.get('delfragor', []))
    lista = f'<ol type="a">{delar}</ol>' if fragelista else ''
    return (f'<section class="task sj-panel" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h2>{R.h(pl["nummer"])}. {R.h(p["titel"])}</h2>'
            f'<p class="use"><strong>Använd:</strong> {anv}</p><p>{R.h(u["fraga"])}</p>{lista}'
            + (svar or f'<p class="hand-in"><strong>Redovisa:</strong> {R.h(u.get("svarsformat", ""))}</p>') + '</section>')


def lamnas_med(pl, p, vecka, andra):
    """En uppgift som står på den här sidan men lämnas in med en annan vecka (vecka 45: felsökningsrapporten med vecka 43,
    analysen av mätdata med vecka 44). Ankaret finns kvar, så att gamla länkar hamnar rätt, och knappen leder till uppgiften
    med svarsrutor på den veckans sida."""
    href = f'../../vecka-{vecka}/aktuell/Inlamning.html#{andra["ankare"]}'
    return (f'<section class="task sj-panel task-flyttad" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h2>{R.h(pl["nummer"])}. {R.h(p["titel"])}</h2>'
            f'<p><strong>Lämnas in med vecka {vecka}.</strong> Uppgiften står med svarsrutor på vecka {vecka}:s inlämningssida som '
            f'{R.h(andra["nummer"]).lower()}, och du lämnar in den i samma PDF som vecka {vecka}.</p>'
            f'<p>{R.h(p["uppgift"]["fraga"])}</p>'
            f'<p><a class="sj-btn" href="{R.attr(href)}">Till {R.h(andra["nummer"]).lower()}, vecka {vecka}</a></p></section>')


def filer(a):
    mall = _mall()
    S = getattr(mall, 'S', None)
    platser = a.platser(YTA)
    alla = {plats: a.placeringar(YTA, plats) for plats in platser}
    ut = {}
    for plats in platser:
        nr = int(plats.split('-')[1].split('/')[0])
        flyttade = mall.VECKOR[nr].get('lamnas_med', {})
        items = []
        for pl, p in alla[plats]:
            if p['id'] in flyttade:
                v = flyttade[p['id']]
                andra = next(x for x, y in alla.get(f'vecka-{v}/aktuell/Inlamning.html', []) if y['id'] == p['id'])
                items.append(lamnas_med(pl, p, v, andra))
            else:
                items.append(uppgift(pl, p, mall.svarsfalt(nr, pl, p), not mall.utan_fragelista(nr, p), S))
        ut[plats] = mall.page(nr, mall.VECKOR[nr], ''.join(items))
    return ut
