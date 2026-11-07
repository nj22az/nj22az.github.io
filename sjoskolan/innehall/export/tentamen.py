"""Övningstentans frågor på webben, PDF-kontroll och Google Forms-skript ur samma källposter."""
import hashlib
import json

from region import ersatt
import rendera as R

PUBLIK = 'elev'
YTA = 'tentamen'


def sektion(pl, p):
    u = p['uppgift']
    veckor = (p.get('bedomning') or {}).get('kursniva', '').replace('Veckor: ', '')
    h = [f'<section class="exam-q" id="{pl["ankare"]}" data-ovning="{p["id"]}"><h3>{R.h(pl["nummer"])}. {R.h(p["titel"])} <span class="week-tag">{R.h(veckor)}</span></h3>']
    h += [f'<p>{R.h(x)}</p>' for x in (u.get('stycken') or [u['fraga']])]
    h.append('</section>')
    return ''.join(h)


def pdf_kallhash(poster):
    """Bara PDF-innehållet: quizens alternativ påverkar inte fråge- eller facitdokumentet."""
    data = [(pl['nummer'], p['titel'], p['uppgift'], p.get('losning', {}).get('text', '')) for pl, p in poster]
    data = [(nr, titel, {k: v for k, v in u.items() if k != 'delfragor'}, los) for nr, titel, u, los in data]
    return hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def google_text(text):
    """Forms har vanlig text: sifferindex i Unicode, övriga index utskrivna utan att platta ut symbolen."""
    siffror = str.maketrans('0123456789', '₀₁₂₃₄₅₆₇₈₉')
    return ''.join(t if typ == 'text' else t.translate(siffror) if typ == 'sub' and t.isdigit()
                   else f' (index {t})' if typ == 'sub' else f'^{t}' for typ, t in R.T.delar(text))


def google_skript(poster):
    uppgifter = []
    for pl, p in poster:
        fragor = p['uppgift'].get('delfragor', [])
        if len(fragor) != 3 or any(d.get('typ') != 'flerval' or len(d.get('alternativ', [])) != 4
                                  or d.get('ratt') not in range(4) for d in fragor):
            raise ValueError(f'{p["id"]}: Google-quiz kräver tre flervalsfrågor med fyra alternativ och facit')
        uppgifter.append(dict(nummer=int(pl['nummer']), id=p['id'], revision=p['revision'], titel=google_text(p['titel']),
                              fraga=google_text('\n\n'.join(p['uppgift'].get('stycken') or [p['uppgift']['fraga']])),
                              losning=google_text(p['losning']['text']), kriterier=p['bedomning']['kriterier'],
                              fragor=[dict(id=d['id'], text=google_text(d['text']),
                                           alternativ=[google_text(t) for t in d['alternativ']], ratt=d['ratt']) for d in fragor]))
    data = json.dumps(uppgifter, ensure_ascii=False, indent=2)
    version = hashlib.sha256(data.encode()).hexdigest()[:16]
    mall = R.SJO / 'verktyg/tentamen/google-quiz-mall.gs'
    return mall.read_text(encoding='utf-8').replace('/* UPPGIFTER */', data).replace('/* VERSION */', version)


def filer(a):
    plats = 'tentamen.html'
    text = (R.SJO / plats).read_text(encoding='utf-8')
    poster = a.placeringar(YTA, plats)
    rad = '\n'.join(sektion(pl, p) for pl, p in poster)
    text = ersatt(text, 'ovningstenta', '\n' + rad + '\n', r'<section class="exam-q">.*</section>')
    kallhash = pdf_kallhash(poster).encode()
    for fil in ('ovningstentamen.pdf', 'ovningstentamen-facit.pdf'):
        pdf = R.SJO / 'tentamen' / fil
        if not pdf.exists() or kallhash not in pdf.read_bytes():
            raise ValueError(f'{pdf.name} saknas eller har äldre innehåll. Kör verktyg/tentamen/bygg_pdf.py först.')
    return {plats: text, 'verktyg/tentamen/ovningstentamen.gs': google_skript(poster)}
