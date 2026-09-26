"""Arbetsblad 1A och 1B (vecka 37) samt elevuppgifter och fördjupning (vecka 38): uppgiftsblocken ur ytan arbetsblad."""
from region import ersatt
import rendera as R

PUBLIK = 'elev'
YTA = 'arbetsblad'


def block(pl, p, plats):
    u, nr = p['uppgift'], pl['nummer']
    if p['typ'] == 'fall':
        return f'<h2 id="{pl["ankare"]}" data-ovning="{p["id"]}">{R.h(nr)}</h2><p>{R.h(u["fraga"])}</p>'
    if 'Fordjupning' in plats:  # rubriken är hela titeln (Fall A: …), texten utan etiketter
        return (f'<h2 id="{pl["ankare"]}" data-ovning="{p["id"]}">{R.h(p["titel"])}</h2><p>{R.h(u.get("scenario", ""))}</p><p>{R.h(u["fraga"])}</p>'
                f'<p><strong>Redovisning:</strong> {R.h(u.get("instruktion", ""))}</p>')
    h = [f'<h2 id="{pl["ankare"]}" data-ovning="{p["id"]}">{R.h(nr)}: {R.h(p["titel"])}</h2>']
    if 'vecka-38' in plats:
        if u.get('scenario'):
            h.append(f'<p><strong>Underlag:</strong> {R.h(u["scenario"])}</p>')
        h.append(f'<p><strong>Uppgift:</strong> {R.h(u["fraga"])}</p>')
        h.append(f'<p><strong>Lämna:</strong> {R.h(u.get("instruktion", ""))}</p>')
        return ''.join(h)
    bilder = p['referenser'].get('tillgangar', [])
    if '1B' in plats:
        h.append(f'<p>Bild {pl.get("bild", "")}.</p>' if pl.get('bild') else '')
    h.append(f'<p>{R.h(u["fraga"])}</p>')
    for b in bilder:
        h.append(f'<p><a href="../../../{R.attr(b["fil"])}">{R.h(b["alt"])}</a></p>')
    h.append(f'<p>{R.h(u.get("instruktion", "Mitt svar:"))} {"_" * (20 if "1A" in plats else 40)}</p>')
    if u.get('svarsformat', '').startswith('Fält: '):
        rader = ''.join(f'<tr><td>{R.h(f.strip())}</td><td>________________________________________</td></tr>' for f in u['svarsformat'][6:].split(';'))
        h.append(f'<table><tr><th>Fält</th><th>Ditt underlag och beslut</th></tr>{rader}</table>')
    return ''.join(h)


FORSTA = {
    'vecka-37/aktuell/01A_Elens_grunder/Arbetsblad.html': r'<h2>E1:.*?(?=</article>)',
    'vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Arbetsblad.html': r'<h2>Fall A</h2>.*?(?=<h2>Att ta med)',
    'vecka-38/aktuell/Elevuppgifter.html': r'<h2>V2-1:.*?(?=</article>)',
    'vecka-38/aktuell/Fordjupning_elev.html': r'<h2>Fall A:.*?(?=</article>)',
}


def filer(a):
    ut = {}
    for plats in a.platser(YTA):
        text = (R.SJO / plats).read_text(encoding='utf-8')
        # Presentationsbildens nummer hämtas från presentationsplaceringen, för 1B-bladets ”Bild N.”
        rad = []
        for pl, p in a.placeringar(YTA, plats):
            pp = a.placering_for(p['id'], 'presentation-fragor')
            if pp:
                pl['bild'] = pp['bild']
            rad.append(block(pl, p, plats))
        text = ersatt(text, 'uppgifter', ''.join(rad), FORSTA[plats])
        ut[plats] = text
    return ut
