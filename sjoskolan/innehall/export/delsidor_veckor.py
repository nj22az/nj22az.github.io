"""Vecka 41–45: en sida per del, som vecka 40. Översikt → Teori → Exempel → Övningar → Labben.

Teori och exempel kommer ur presentationen (samma text och figurer som läraren visar), övningarna ur databasen (ytan
kurs-formelstod). Varje övning har en ledtrådstrappa: ledtråd 1 visar sambandet och vilket teoriavsnitt som förklarar
det, ledtråd 2 hur man börjar, ledtråd 3 exemplet som räknar samma sorts uppgift med andra tal. Facit sist. Figurerna
ligger i vecka-NN/aktuell/figurer (verktyg/veckosidor/figurer_ur_presentationer.py).
"""
import html
import json
import re

from pptx import Presentation

import rendera as R
from delsidor import CSS as CSS40, hjalp

PUBLIK = 'elev'
V = '20260928w'
VECKOR = range(41, 46)
EMU = 914400
HOPPA = ('Dagens två pass', 'Pass 2')
CSS = CSS40.replace('/* Vecka 40, en sida per del: Översikt, Teori, Exempel, Övningar, Labben (genereras av innehall/export/delsidor.py) */',
                    '/* En sida per del: Översikt, Teori, Exempel, Övningar, Labben (innehall/export/delsidor_veckor.py; vecka 40 har egen kopia) */') + '''
.del-figur{margin:14px 0 18px}.del-figur img{display:block;width:100%;max-width:460px;height:auto;border:1px solid var(--sj-line,#cad8e2);border-radius:8px;background:#fff}
.del-figur figcaption{font-size:14px;color:var(--sj-muted,#4d6579);margin-top:4px}
.del-formel{font-size:21px;font-weight:700;color:var(--sj-accent,#064f91);margin:14px 0}
.del-teori{margin:18px 0 30px;padding-bottom:10px;border-bottom:1px solid var(--sj-line,#cad8e2)}
.del-exempel{margin:18px 0 30px;padding:10px 18px;border-left:8px solid var(--sj-accent,#064f91);background:var(--sj-soft,#edf4f9);border-radius:0 12px 12px 0}
.del-start{padding:10px 16px;border:1px dashed var(--sj-accent,#064f91);border-radius:10px}
.del-ovning .formula{white-space:normal;overflow-wrap:anywhere}
'''


def e(s):
    return html.escape(str(s), quote=False)


def run_text(r):
    t = r.text
    b = r.font._rPr.get('baseline') if r.font._rPr is not None else None
    if b and int(b) < 0 and t.strip():
        return '_{' + t + '}'
    return t


def las_bild(bild, deck, nr, figmapp):
    """Bildens rubrik och innehåll i läsordning: ('p', text) | ('formel', text) | ('fig', fil, alt)."""
    former = sorted(bild.shapes, key=lambda s: (s.top, s.left))
    titel, block, k, forra = '', [], 0, None
    for sh in former:
        if sh.shape_type is not None and 'PICTURE' in str(sh.shape_type):
            if sh.top > 6.4 * EMU and sh.width > 9 * EMU:
                continue
            k += 1
            fil = f'{deck[:6]}-b{nr:02d}-{k}.{sh.image.ext}'
            if (figmapp / fil).exists():
                alt = sh._element.nvPicPr.cNvPr.get('descr') or re.sub(r'^Figur:\s*', '', sh.name).rstrip(';').strip() or 'Figur'
                block.append(('fig', fil, alt))
            continue
        if not sh.has_text_frame or sh.top > 6.9 * EMU:
            continue
        for para in sh.text_frame.paragraphs:
            t = ''.join(run_text(r) for r in para.runs).replace('\xa0', ' ').strip()
            if not t or re.fullmatch(r'\d+', t):
                continue
            if not titel:
                titel = t
                continue
            rs = [r for r in para.runs if r.text.strip()]
            formel = rs and all(r.font.bold for r in rs) and all(r.font.color and r.font.color.type and str(r.font.color.rgb) == '064F91' for r in rs)
            typ = 'formel' if formel else 'p'
            if typ == 'p' and block and block[-1][0] == 'p' and forra is sh and not re.search(r'[.!?:]$', block[-1][1]):
                block[-1] = ('p', block[-1][1] + ' ' + t)
            else:
                block.append((typ, t))
            forra = sh
    return titel, block


def block_html(block, nummerlista=False):
    ut, lista = [], []
    for b in block:
        if nummerlista and b[0] == 'p' and re.match(r'^\d+\.\s', b[1]):
            punkt = re.sub(r'^\d+\.\s*', '', b[1])
            lista.append(f'<li>{R.h(punkt)}</li>')
            continue
        if lista:
            ut.append(f'<ol>{"".join(lista)}</ol>')
            lista = []
        if b[0] == 'fig':
            ut.append(f'<figure class="del-figur"><img src="figurer/{b[1]}" alt="{R.attr(b[2])}" loading="lazy"></figure>')
        elif b[0] == 'formel':
            ut.append(f'<p class="del-formel">{R.h(b[1])}</p>')
        else:
            ut.append(f'<p>{R.h(b[1])}</p>')
    if lista:
        ut.append(f'<ol>{"".join(lista)}</ol>')
    return ''.join(ut)


def ord_av(s):
    s = re.sub(r'_\{([^}]*)\}', r'\1', s.lower())
    return {w for w in re.findall(r'[a-zåäöδφ√]+[0-9]*|[a-zåäö]*\d+[a-zåäö]*', s) if len(w) >= 2} - {'och', 'är', 'en', 'ett', 'av', 'på', 'med', 'för', 'som', 'den', 'det', 'till', 'om', 'att', 'de'}


def sida(a, v, deck, alla_decks, pl_ovn, pres_bild, veckotitel):
    mapp = R.SJO / f'vecka-{v}' / 'aktuell'
    figmapp = mapp / 'figurer'
    kap = deck[:6]
    dnr = int(kap[-1])
    antal = len(alla_decks)
    prs = Presentation(mapp / deck)
    bilder = [(nr, *las_bild(b, deck, nr, figmapp)) for nr, b in enumerate(prs.slides, 1)]
    deltitel = bilder[0][1]
    mal = next((b for b in bilder if b[1].startswith('Mål')), None)
    metod = next((b for b in bilder if b[1].startswith('En lösning som går att följa')), None)
    avslut = next((b for b in bilder if b[1].startswith('Avslut')), None)
    kallor = next((b for b in bilder if b[1].startswith('Källor')), None)
    exempel = [b for b in bilder if b[1].startswith('Exempel')]
    teori = [b for b in bilder[1:] if b not in (mal, metod, avslut, kallor) and b not in exempel and not b[1].startswith(HOPPA)
             and not re.match(r'^(Stöd till övning|Övning) \d', b[1])]
    pass2 = next((nr for nr, t, _ in bilder if t == 'Pass 2'), 99)
    ovn = sorted(pl_ovn.get(kap, []), key=lambda x: x[0]['ordning'])
    poster = [(pl, p) for pl, p in ovn]
    kort = hjalp([' '.join([p['uppgift']['fraga'], *p['uppgift'].get('samband', []), p['uppgift'].get('givet', '')]) for _, p in poster])

    def teori_for(p, pass_):
        """Det teoriavsnitt som delar flest begrepp med sambandet, annars det första i samma pass."""
        mal_ord = ord_av(' '.join(p['uppgift'].get('samband', [])) + ' ' + p['titel'])
        bast, poang = None, 0
        for i, (nr, t, bl) in enumerate(teori, 1):
            s = len(mal_ord & ord_av(t + ' ' + ' '.join(x[1] for x in bl if x[0] != 'fig')))
            if s > poang:
                bast, poang = (i, t), s
        if bast:
            return bast
        return next(((i, t) for i, (nr, t, _) in enumerate(teori, 1) if (nr > pass2) == pass_), (1, teori[0][1]) if teori else None)

    titel = f'Del {dnr}: {deltitel}'
    h = [f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(titel)} · Vecka {v} · Sjöskolan</title><meta name="description" content="{R.attr(veckotitel)}: {R.attr(deltitel)}. Teori, exempel och övningar med ledtrådar och facit."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{v}/aktuell/Del_{dnr}.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v=20260926"><link rel="stylesheet" href="/sjoskolan/course.css?v=20260928"><link rel="stylesheet" href="../../gemensamt/delsida.css?v={V}"><link rel="stylesheet" href="../../gemensamt/beteckningar.css?v=20260928"><link rel="stylesheet" href="../../gemensamt/raknehjalp.css?v=20260929"><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="index.html">Vecka {v}</a><a href="Inlamning.html">Inlämning</a></nav>
<main id="main-content" class="course-main del-main"><div class="course-breadcrumb"><a href="index.html">← Vecka {v}</a></div>
<article class="course-reading del-sida">
<p class="course-kicker">Vecka {v} · Del {dnr} av {antal}</p><h1>{e(titel)}</h1>
<nav class="del-steg" aria-label="Delens ordning"><a href="#oversikt"><b>1</b>Översikt</a><a href="#teori"><b>2</b>Teori</a><a href="#exempel"><b>3</b>Exempel</a><a href="#ovningar"><b>4</b>Övningar</a><a href="#labb"><b>5</b>Labben</a></nav>''']

    # 1 Översikt
    malrader = [b for b in (mal[2] if mal else []) if b[0] != 'fig']
    start = next((i for i, b in enumerate(malrader) if b[1].lower().startswith('startfråga')), None)
    kunna = malrader[:start] if start is not None else malrader
    fraga = malrader[start + 1:] if start is not None else []
    h.append(f'''<section id="oversikt" class="del-block"><h2><span>1</span> Översikt</h2>
<div class="sj-panel soft"><h3>Det här ska du kunna</h3><ul>{''.join(f'<li>{R.h(b[1])}</li>' for b in kunna)}</ul></div>
{f'<p class="del-start"><strong>Fundera först:</strong> {" ".join(R.h(b[1]) for b in fraga)} Svaret finns i teorin nedan.</p>' if fraga else ''}
<h3>Så gör du</h3><ol class="del-gor">
<li><strong>Läs teorin</strong> ({len(teori)} korta avsnitt). Titta på figuren till varje avsnitt.</li>
<li><strong>Följ exemplen</strong> med papper och räknare, steg för steg.</li>
<li><strong>Gör övningarna</strong> {dnr}.1–{dnr}.{len(poster)}. Fastnar du: <em>Ledtråd 1</em> visar vilket samband du behöver och var i teorin det förklaras. <em>Ledtråd 2</em> visar hur du börjar och <em>Ledtråd 3</em> exemplet som räknar samma sorts uppgift med andra tal. Öppna facit när du har ett eget svar.</li>
<li><strong>Lämna in</strong> veckans uppgifter: <a href="Inlamning.html">Veckans inlämning</a>.</li></ol>''')
    if metod:
        h.append(f'<details class="sj-panel"><summary><strong>Så skriver du en lösning som går att följa</strong></summary>{block_html(metod[2])}</details>')
    h.append(f'<p class="del-mer"><a href="../../bildspel/?d={e(deck[:-5].removesuffix("_elev"))}">Lärarens presentation</a> · <a href="{e(deck[:-5])}.pdf">PDF</a> · <a href="../../gemensamt/Raknehjalp.html">Räknarhjälp</a> · <a href="../../gemensamt/Formelblad_och_begrepp.html">Formelblad</a></p>')
    texter = [t for _, t, bl in bilder for t in [t, *[x[1] for x in bl if x[0] == 'p']]] + [p['uppgift']['fraga'] for _, p in poster]
    formler = [x[1] for _, _, bl in bilder for x in bl if x[0] == 'formel'] + [x for _, p in poster for x in p['uppgift'].get('samband', [])]
    h.append(R.beteckningar_html(R.beteckningar_i(texter, a.beteckningar(), formler), 'Förkortningar och beteckningar i den här delen'))
    h.append('</section>')

    # 2 Teori
    h.append('<section id="teori" class="del-block"><h2><span>2</span> Teori</h2><p>Läs avsnitten i ordning. Övningarna hänvisar hit.</p>')
    for i, (nr, t, bl) in enumerate(teori, 1):
        h.append(f'<section class="del-teori" id="teori-{i}"><h3>{i}. {R.h(t)}</h3>{block_html(bl)}</section>')
    h.append('</section>')

    # 3 Exempel
    h.append('<section id="exempel" class="del-block"><h2><span>3</span> Exempel</h2><p>Följ exemplet steg för steg med papper och räknare. Övningarna använder samma metod med andra tal.</p>')
    for i, (nr, t, bl) in enumerate(exempel, 1):
        h.append(f'<section class="del-exempel" id="exempel-{i}"><h3>{R.h(t)}</h3>{block_html(bl, nummerlista=True)}</section>')
    h.append('</section>')

    # 4 Övningar
    nyckel = f'sj-ovningar:/sjoskolan/vecka-{v}/aktuell/Formelstod_och_ovningar.html'
    h.append('<section id="ovningar" class="del-block"><h2><span>4</span> Övningar</h2><p>Räkna på papper. Bocka av en övning när du har kontrollerat ditt svar mot facit. Avbockningen sparas i den här webbläsaren.</p><p id="del-status" class="del-status" aria-live="polite"></p>')
    for k, ((pl, p), rh) in enumerate(zip(poster, kort), 1):
        u, los = p['uppgift'], p.get('losning') or {}
        pass_ = pl['ordning'] > 5
        ref = teori_for(p, pass_)
        formel = ' och '.join(f'<span class="formula">{R.h(x)}</span>' for x in u.get('samband', []))
        resonemang = p.get('typ') == 'resonemang'
        led1 = ((f'Utgå från {formel}. ' if resonemang else f'Använd {formel}. ') if formel else '') + (f'Läs <a href="#teori-{ref[0]}">Teori {ref[0]}: {R.h(ref[1])}</a>.' if ref else '')
        led2 = ' '.join(R.h(x['text']) for x in p.get('ledtradar', []) if x.get('niva') in ('begrepp', 'metod'))
        ex = exempel[1 if pass_ and len(exempel) > 1 else 0] if exempel else None
        led3 = ((f'Samma sätt att resonera: <a href="#exempel-{exempel.index(ex) + 1}">{R.h(ex[1])}</a>. Gör likadant med fallet i den här uppgiften och motivera varje steg.' if resonemang
                 else f'Samma metod med andra tal: <a href="#exempel-{exempel.index(ex) + 1}">{R.h(ex[1])}</a>. Följ stegen där och gör sedan likadant med talen i den här uppgiften.') if ex else '')
        steg = ' '.join(R.h(x['text']) for x in p.get('ledtradar', []) if x.get('niva') == 'nasta-steg')
        if steg:  # ledtråd 3 ur databasen: metoden steg för steg med andra tal
            led3 = steg
        figs = [x for x in (pres_bild.get(p['id']) or []) if x[0] == 'fig']
        facit = ''.join(f'<p>{R.h(x)}</p>' for x in str(los.get('text', 'Facit saknas.')).split('\n\n') if x.strip())
        svar = ' · '.join(f'{R.h(sv["storhet"])} ≈ {e(str(sv["varde"]).replace(".", ","))} {e(sv.get("enhet", ""))}' for sv in los.get('svar', []) if isinstance(sv.get('varde'), (int, float)))
        h.append(f'''<article class="del-ovning" id="{pl["ankare"]}"><h3>{e(pl["nummer"])}: {R.h(p["titel"])}</h3>
{f'<p>{R.h(u["scenario"])}</p>' if u.get("scenario") else ''}<p>{R.h(u["fraga"])}</p>{f'<p class="del-givet"><strong>Givet:</strong> {R.h(u["givet"])}</p>' if u.get("givet") else ''}
{block_html(figs)}
{f'<details class="ledtrad"><summary>Ledtråd 1: {"vilken princip?" if resonemang else "vilket samband?"}</summary><p>{led1}</p></details>' if led1 else ''}
{f'<details class="ledtrad"><summary>Ledtråd 2: hur börjar jag?</summary><p>{led2}</p></details>' if led2 else ''}
{f'<details class="ledtrad"><summary>Ledtråd 3: {"steg för steg med andra tal" if steg else "samma metod i ett exempel"}</summary><p>{led3}</p></details>' if led3 else ''}
{rh}
<details class="facit"><summary>Facit</summary>{facit}{f'<p><strong>Svar:</strong> {svar}</p>' if svar else ''}</details>
<button type="button" class="del-klar" data-id="{pl["ankare"]}">Markera som klar</button></article>''')
    if avslut:
        h.append(f'<section class="del-tur" id="klart"><h3>Klart med delen?</h3>{block_html(avslut[2])}</section>')
    h.append('</section>')

    # 5 Labben
    h.append(f'<section id="labb" class="del-block"><h2><span>5</span> Labben</h2><p>Labben kommer sist i veckan, när du har gått igenom del 1–{antal}. Du använder samma metod som i övningarna: <strong>räkna först, läs av, jämför och förklara</strong>.</p>'
             f'<p><a class="sj-btn" href="index.html#labb">Veckans labbar</a> <a class="sj-btn" href="Inlamning.html">Veckans inlämning</a></p>')
    if kallor:
        h.append(f'<details class="del-mer"><summary>Källor och fortsatt läsning</summary>{block_html(kallor[2])}</details>')
    h.append('</section>')

    fore = f'<a href="Del_{dnr - 1}.html">← Del {dnr - 1}</a>' if dnr > 1 else '<a href="index.html">← Vecka ' + str(v) + '</a>'
    efter = f'<a href="Del_{dnr + 1}.html">Del {dnr + 1} →</a>' if dnr < antal else '<a href="index.html#labb">Labben →</a>'
    h.append(f'''<nav class="art-nav" aria-label="Delar"><span>{fore}</span><span><a href="index.html">Veckans översikt</a></span><span>{efter}</span></nav>
</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer>
<script>
// Avbockade övningar sparas per vecka i den här webbläsaren.
(()=>{{const K='{nyckel}';let klara={{}};try{{klara=JSON.parse(localStorage.getItem(K)||'{{}}')||{{}};}}catch{{}}
const knappar=[...document.querySelectorAll('.del-klar')];
const rita=()=>{{let n=0;for(const b of knappar){{const k=!!klara[b.dataset.id];n+=k;b.textContent=k?'✓ Klar':'Markera som klar';b.setAttribute('aria-pressed',String(k));b.closest('.del-ovning').classList.toggle('klar',k);}}document.getElementById('del-status').textContent=`${{n}} av ${{knappar.length}} övningar klara.`;}};
for(const b of knappar)b.addEventListener('click',()=>{{klara[b.dataset.id]=!klara[b.dataset.id];try{{localStorage.setItem(K,JSON.stringify(klara));}}catch{{}}rita();}});
rita();}})();
</script></body></html>
''')
    return ''.join(h)


def filer(a):
    ut = {'gemensamt/delsida.css': CSS}
    placeringar = json.loads((R.SJO / 'innehall' / 'placeringar' / 'presentation.json').read_text())['placeringar']
    for v in VECKOR:
        mapp = R.SJO / f'vecka-{v}' / 'aktuell'
        decks = sorted(x.name for x in mapp.glob('v*_elev.pptx'))
        pl_ovn = {}
        for pl, p in a.placeringar('kurs-formelstod', f'vecka-{v}/aktuell/Formelstod_och_ovningar.html'):
            pl_ovn.setdefault(pl['del'], []).append((pl, p))
        # Övningens figur: bilden i presentationen där övningen står.
        pres_bild = {}
        for pl in placeringar:
            if pl['plats'].startswith(f'vecka-{v}/') and pl.get('bild') and not pl.get('kontroll'):
                deck = pl['plats'].split('/')[-1]
                bild = Presentation(mapp / deck).slides[pl['bild'] - 1]
                pres_bild[pl['ovning']] = las_bild(bild, deck, pl['bild'], mapp / 'figurer')[1]
        veckotitel = f'Vecka {v}'
        for deck in decks:
            ut[f'vecka-{v}/aktuell/Del_{int(deck[5])}.html'] = sida(a, v, deck, decks, pl_ovn, pres_bild, veckotitel)
    return ut
