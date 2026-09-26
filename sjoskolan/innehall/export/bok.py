"""Boken: övnings- och lösningsavsnitten i EPUB:en skrivs ur databasen och boken krypteras om.

Kräver bokens uppackade arbetskopia (bok/bok.py packa-upp) och BOKLOSEN. Tung exportör: `innehall.py bygg bok`.

Varje avsnitt (section.uppgift, section.losning) byggs ur posten. Om avsnittets text är oförändrad mot bokens
ursprungliga XHTML (sparad i posten, bok.html) behålls originalet byte för byte, med bokens färgmarkering av
storheter. Annars skrivs avsnittet om ur posten; färgmarkeringen (vU, vI, vR) läggs då på med samma regel som
boken använder: symbolerna U, I och R med eventuellt index.

Boken använder samma notation som kursen (beteckningar.json): U_{F}, inte U_{fas}.

PDF:en kan inte byggas om här (sättningen gjordes utanför repot); efter en ändring måste den sättas om separat.
"""
import html
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'migrering'))
import rendera as R
import text as T

PUBLIK = 'bok'
YTA = 'bok'
ARB = Path(__file__).resolve().parents[1] / 'bok' / '.bok' / 'epub' / 'EPUB' / 'text'
NIVA = {'grund': 'Grund', 'tillampning': 'Tillämpning', 'analys': 'Analys', 'forberedelse': 'Grund', 'fordjupning': 'Analys'}


def farg(h):
    """Färgmarkering av storheterna U, I och R (med index) i redan renderad XHTML."""
    def w(m):
        return f'<span class="v{m.group(1)}">{m.group(1)}{m.group(2) or ""}</span>'
    return re.sub(r'(?<![\w<>/"=])([UIR])(<sub>[^<]*</sub>)?(?![\w])', w, h)


def x(t):
    return farg(T.html_text(t or ''))


def strip(h):
    """Avsnittets text för jämförelse. Index räknas med (X<sub>L</sub> och XL är olika), färgmarkering inte."""
    s = re.sub(r'<sub>(.*?)</sub>', r'_{\1}', h or '')
    s = re.sub(r'<sup>(.*?)</sup>', r'^{\1}', s)
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def figur(f, datafig=None):
    fil = f['fil'].replace('media/', '../media/')
    cap = f.get('bildtext') or f['alt']
    nr = f'<span class="fignr">{html.escape(f["nr"])}</span>' if f.get('nr') else ''
    klass = f.get('klass', 'fig-uppg')
    df = f' data-fig="{datafig}"' if datafig else ''
    return (f'<figure class="{klass}"{df}>\n<img src="{html.escape(fil, quote=True)}" class="{klass}" alt="{html.escape(f["alt"], quote=True)}" />\n'
            f'<figcaption aria-hidden="true">{nr}{html.escape(cap)}</figcaption>\n</figure>\n')


def uppgift_xhtml(pl, p, kapfil, losfil):
    u = p['uppgift']
    k, n = pl['nummer'].split('.')
    niva = p['larande'].get('niva', 'grund')
    tag = {'Grund': 'grund', 'Tillämpning': 'tillampning', 'Analys': 'analys'}[NIVA[niva]]
    h = [f'<section id="ch{k}-q{n}" class="level3 uppgift" data-tag="{tag}">',
         f'<h3><span class="num">{k}.{n}</span> <span class="titel">{T.html_text(p["titel"])}</span> <span class="tag tag-{tag}">{NIVA[niva]}</span></h3>']
    for f in (p.get('bok') or {}).get('figurer', []):
        h.append(figur(f, f'q{int(k):02d}-{int(n):02d}').rstrip('\n'))  # bokens figur-id för övningsfigurer
    h += [f'<p>{x(s)}</p>' for s in (u.get('stycken') or [u['fraga']])]
    if u.get('samband'):
        h.append('<div class="rad rad-samband">\n<span class="lbl">Samband</span> ' + '<br />\n'.join(x(s) for s in u['samband']) + '\n</div>')
    if u.get('givet'):
        h.append(f'<div class="rad rad-forutsattningar">\n<span class="lbl">Förutsättningar</span> {x(u["givet"])}\n</div>')
    metod = ' '.join(l['text'] for l in p.get('ledtradar', []) if l.get('i_bok', True))
    if metod:
        h.append(f'<div class="rad rad-metod">\n<span class="lbl">Metod</span> {x(metod)}\n</div>')
    h.append(f'<div class="lank">\n<a href="{losfil}#sol{k}-s{n}" class="tosol">Lösning {k}.{n}</a>\n</div>\n</section>')
    return '\n'.join(h)


def losning_xhtml(pl, p, kapfil):
    los = p.get('losning') or {}
    k, n = pl['nummer'].split('.')
    h = [f'<section id="sol{k}-s{n}" class="level3 losning">', f'<h3><span class="num">{k}.{n}</span> <span class="titel">{T.html_text(p["titel"])}</span></h3>']
    for f in (p.get('bok') or {}).get('losningsfigurer', []):
        h.append(figur(f).rstrip('\n'))
    h += [f'<p>{x(s)}</p>' for s in los.get('steg', [])]
    if los.get('svarstext'):
        h.append(f'<div class="rad rad-svar">\n<span class="lbl">Svar</span> {x(los["svarstext"])}\n</div>')
    if los.get('kontroll'):
        h.append(f'<div class="rad rad-kontroll">\n<span class="lbl">Kontroll</span> {x(los["kontroll"])}\n</div>')
    h.append(f'<div class="lank">\n<a href="{kapfil}#ch{k}-q{n}" class="toq">Uppgift {k}.{n}</a>\n</div>\n</section>')
    return '\n'.join(h)


def ersatt_section(text, sid, ny):
    m = re.search(r'<section id="%s"[^>]*>.*?</section>' % re.escape(sid), text, flags=re.S)
    if not m:
        raise ValueError(f'avsnittet {sid} saknas i boken')
    return text[:m.start()] + ny + text[m.end():]


def bygg(a, kat):
    import kallor
    if not ARB.exists():
        raise SystemExit('bokens arbetskopia saknas: kör BOKLOSEN=… python3 sjoskolan/innehall/bok/bok.py packa-upp')
    filer = {}
    stat = {'oforandrade': 0, 'omskrivna': [], 'rev': {}}
    for pl, p in a.placeringar(YTA):
        k = int(pl['nummer'].split('.')[0])
        kapfil, losfil = kallor.BOK_KAPITEL_FIL[k], kallor.BOK_LOSNING_FIL[k]
        orig = (p.get('bok') or {}).get('html') or {}
        for slag, fil, ny, sid in (('uppgift', kapfil, uppgift_xhtml(pl, p, kapfil, losfil), f'ch{k}-q{pl["nummer"].split(".")[1]}'),
                                   ('losning', losfil, losning_xhtml(pl, p, kapfil), f'sol{k}-s{pl["nummer"].split(".")[1]}')):
            if slag == 'losning' and not orig.get('losning') and not (p.get('losning') or {}).get('steg'):
                continue
            if orig.get(slag) and strip(orig[slag]) == strip(ny):
                # Oförändrat innehåll: bokens original (avsnittets inre XHTML) byte för byte, med samma sektionstagg.
                tagg = re.match(r'<section[^>]*>', ny).group(0)
                ny = f'{tagg}\n{orig[slag]}\n</section>'
                stat['oforandrade'] += 1
            else:
                stat['omskrivna'].append(f'{pl["nummer"]} {slag}')
            text = filer.get(fil) or (ARB / fil).read_text(encoding='utf-8')
            filer[fil] = ersatt_section(text, sid, ny)
        stat['rev'][p['id']] = p['revision']
    andrade = 0
    for fil, text in filer.items():
        if (ARB / fil).read_text(encoding='utf-8') != text:
            (ARB / fil).write_text(text, encoding='utf-8')
            andrade += 1
    import importlib.util
    spec = importlib.util.spec_from_file_location('bokverktyg', Path(__file__).resolve().parents[1] / 'bok' / 'bok.py')
    bokverktyg = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(bokverktyg)
    bokverktyg.packa()
    print(f'  {andrade} EPUB-filer ändrade')
    return {'sammanfattning': f'{stat["oforandrade"]} avsnitt oförändrade, {len(stat["omskrivna"])} omskrivna ur databasen. PDF måste sättas om separat.',
            'omskrivna': stat['omskrivna'], 'revisioner': stat['rev']}
