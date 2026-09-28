"""Vecka 40:s elevsidor, en per del: Översikt → Teori → Exempel → Övningar → Fredag: labben.

Eleven läser teorin först, följer exemplen och gör sedan övningarna. Varje övning har en ledtrådstrappa:
ledtråd 1 visar vilket samband som behövs och exakt vilket teoriavsnitt som förklarar det, ledtråd 2 hur man
börjar, och facit sist. Inget svar står i en ledtråd.

Källor: teori och exempel ur vecka-40/aktuell/lektioner.mjs (samma som presentationen), övningarna ur databasen
(ytan kurs-formelstod) och kopplingen övning → teoriavsnitt ur innehall/studieplan-v40.json.
"""
import html
import json
import subprocess

import rendera as R
import lektioner as LK

PUBLIK = 'elev'
V = '20260928d'
EJ_TEORI = {'mal', 'exempel', 'eget', 'klart', 'labb', 'matarna', 'protokoll'}
LABB = ('matarna', 'protokoll', 'labb')
KLAR_NYCKEL = 'sj-ovningar:/sjoskolan/vecka-40/aktuell/Formelstod_och_ovningar.html'


def e(s):
    return html.escape(str(s), quote=False)


def hjalp(texter):
    """Räknarhjälpens kort (RAD/DEG, prefix) för varje text, samma kort som i genomgången."""
    js = ("import('%s').then(r=>console.log(JSON.stringify(%s.map(t=>r.hjalpHtml(t)))))"
          % ((R.SJO / 'gemensamt' / 'raknehjalp.mjs').as_uri(), json.dumps(texter, ensure_ascii=False)))
    return json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)


def stycken(text):
    return ''.join(f'<p>{R.h(t)}</p>' for t in str(text).split('\n\n') if t.strip())


def sida(a, l, alla, plan, pl_av):
    nr, tab = l['number'], l['id']
    dnr, antal = nr + 1, len(alla) + 1  # delens nummer i veckan: frånskiljningen är del 1 (innehall/numrering.py)
    guide = plan['vagledning'][tab]
    slides = [s for s in l['slides']]
    teori = [s for s in slides if s['id'] not in EJ_TEORI and not s.get('example') and not s.get('tur')]
    teorinr = {s['id']: i for i, s in enumerate(teori, 1)}
    exempel = [s for s in slides if s.get('example') or s['id'] == 'exempel'] + [s for s in slides if s.get('tur')] + [s for s in slides if s['id'] == 'eget']
    labb = [s for s in slides if s['id'] in LABB]
    ovn = [x for x in plan['ordning'][tab] if x.startswith('EL-')]
    poster = [(pl_av[i], a.ovning(i), plan['ovningar'][i]) for i in ovn]
    kort = hjalp([' '.join([p['uppgift']['fraga'], *p['uppgift'].get('samband', []), p['uppgift'].get('givet', '')]) for _, p, _ in poster])
    nasta = next((x for x in alla if x['number'] == nr + 1), None)

    h = [f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Del {dnr}: {e(l["title"])} · Vecka 40 · Sjöskolan</title><meta name="description" content="{e(l["goal"])}"><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-40/aktuell/Del_{nr}.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v=20260926"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}"><link rel="stylesheet" href="ac-course.css?v=20260929"><link rel="stylesheet" href="lektion.css?v=20260928"><link rel="stylesheet" href="del.css?v={V}"><link rel="stylesheet" href="../../gemensamt/beteckningar.css?v=20260928"><link rel="stylesheet" href="../../gemensamt/raknehjalp.css?v=20260929"><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="index.html">Vecka 40</a><a href="Resultat.html">Skicka resultat</a></nav>
<main id="main-content" class="course-main del-main"><div class="course-breadcrumb"><a href="index.html">← Vecka 40</a></div>
<article class="course-reading del-sida">
<p class="course-kicker">Vecka 40 · Del {dnr} av {antal}</p><h1>Del {dnr}: {e(l["title"])}</h1>
<nav class="del-steg" aria-label="Delens ordning"><a href="#oversikt"><b>1</b>Översikt</a><a href="#teori"><b>2</b>Teori</a><a href="#exempel"><b>3</b>Exempel</a><a href="#ovningar"><b>4</b>Övningar</a><a href="#labb"><b>5</b>Fredag: labben</a></nav>''']

    # 1 Översikt
    mal = next((s for s in slides if s['id'] == 'mal'), None)
    h.append(f'''<section id="oversikt" class="del-block"><h2><span>1</span> Översikt</h2>
<p class="course-lead">{R.h(guide["syfte"])}</p>
<div class="sj-panel soft"><h3>Det här ska du kunna</h3><ul>{''.join(f'<li>{R.h(t)}</li>' for t in (mal["body"] if mal else [l["goal"]]))}</ul>
<p><strong>När:</strong> {R.h(guide["nar"])}</p></div>
<h3>Så gör du</h3><ol class="del-gor">
<li><strong>Läs teorin</strong> ({len(teori)} korta avsnitt). Titta på figuren till varje avsnitt.</li>
<li><strong>Följ exemplen</strong> med papper och räknare. Räkna sedan Din tur och Eget försök innan du öppnar svaret.</li>
<li><strong>Gör övningarna</strong> {dnr}.1–{dnr}.{len(poster)}. Fastnar du: <em>Ledtråd 1</em> visar vilken formel du behöver och var i teorin den förklaras. <em>Ledtråd 2</em> visar hur du börjar och <em>Ledtråd 3</em> hela metoden med andra tal. Öppna facit när du har ett eget svar.</li>
<li><strong>Skicka resultat</strong> sist på lektionen: <a href="Resultat.html">Skicka resultat</a>, skriv ditt namn och ta en skärmbild av QR-koden.</li></ol>
<p class="del-mer">Film: <a href="Kortfilmer.html?del={tab}">{e(l["filmTitle"])}</a> · <a href="../../bildspel/?d={e(l["deck"].replace("_elev.pptx", ""))}">Lärarens presentation</a> · <a href="../../gemensamt/Raknehjalp.html">Räknarhjälp</a> · <a href="Inlamning.html">Veckans inlämning</a></p>''')
    texter = [l['goal']] + [t for s in slides for t in [s['title'], *s['body'], s.get('check'), s.get('answer')]] + [p['uppgift']['fraga'] for _, p, _ in poster]
    formler = [s.get('formula') for s in slides] + [x for _, p, _ in poster for x in p['uppgift'].get('samband', [])]
    h.append(R.beteckningar_html(R.beteckningar_i(texter, a.beteckningar(), formler), 'Förkortningar och beteckningar i den här delen'))
    h.append('</section>')

    # 2 Teori
    h.append('<section id="teori" class="del-block"><h2><span>2</span> Teori</h2><p>Läs avsnitten i ordning. Övningarna hänvisar hit.</p>')
    h += [LK.avsnitt({**s, 'id': 'teori-' + s['id'], 'title': f'{teorinr[s["id"]]}. {s["title"]}'}, prova=False) for s in teori]
    h.append('</section>')

    # 3 Exempel
    h.append('<section id="exempel" class="del-block"><h2><span>3</span> Exempel</h2><p>Följ exemplet steg för steg. Räkna sedan själv med nya tal och jämför med svaret.</p>')
    for s in exempel:
        if s.get('tur') or s['id'] == 'eget':
            fraga = s['check'] if s.get('tur') else ' '.join(s['body'])
            h.append(f'<section class="del-tur" id="{s["id"]}"><h3>{R.h(s["title"])}</h3><p>{R.h(fraga)}</p>'
                     f'<details class="facit"><summary>Visa svaret</summary><p>{R.h(s.get("answer", ""))}</p></details></section>')
        else:
            h.append(LK.avsnitt({**s, 'id': 'exempel-' + s['id']}, prova=False))
    h.append('</section>')

    # 4 Övningar
    h.append(f'<section id="ovningar" class="del-block"><h2><span>4</span> Övningar</h2><p>Räkna på papper. Bocka av en övning när du har kontrollerat ditt svar. Avbockningen följer med i din QR-kod.</p><p id="del-status" class="del-status" aria-live="polite"></p>')
    for (pl, p, cfg), rh in zip(poster, kort):
        u, los = p['uppgift'], p.get('losning') or {}
        ref = [f'<a href="#teori-{t}">Teori {teorinr[t]}: {R.h(next(s["title"] for s in teori if s["id"] == t))}</a>' for t in cfg.get('teori', []) if t in teorinr]
        formel = ' och '.join(f'<span class="formula">{R.h(x)}</span>' for x in u.get('samband', []))
        led1 = (f'Använd {formel}. ' if formel else '') + (f'Läs {" och ".join(ref)}.' if ref else '')
        led2 = ' '.join(R.h(x['text']) for x in p.get('ledtradar', []) if x.get('niva') in ('metod', 'begrepp'))
        led3 = ' '.join(R.h(x['text']) for x in p.get('ledtradar', []) if x.get('niva') == 'nasta-steg')
        svar = ' · '.join(f'{R.h(sv["storhet"])} ≈ {e(str(sv["varde"]).replace(".", ","))} {e(sv.get("enhet", ""))}' for sv in los.get('svar', []) if isinstance(sv.get('varde'), (int, float)))
        h.append(f'''<article class="del-ovning" id="{pl["ankare"]}"><h3>{e(pl["nummer"])}: {R.h(p["titel"])}</h3>
<p>{R.h(u["fraga"])}</p>{f'<p class="del-givet"><strong>Givet:</strong> {R.h(u["givet"])}</p>' if u.get("givet") else ''}
{f'<details class="ledtrad"><summary>Ledtråd 1: vilken formel?</summary><p>{led1}</p></details>' if led1 else ''}
{f'<details class="ledtrad"><summary>Ledtråd 2: hur börjar jag?</summary><p>{led2}</p></details>' if led2 else ''}
{f'<details class="ledtrad"><summary>Ledtråd 3: steg för steg med andra tal</summary><p>{led3}</p></details>' if led3 else ''}
{rh}
<details class="facit"><summary>Facit</summary>{stycken(los.get("text", ""))}{f'<p><strong>Svar:</strong> {svar}</p>' if svar else ''}</details>
<button type="button" class="del-klar" data-id="{pl["ankare"]}">Markera som klar</button></article>''')
    h.append('</section>')

    # 5 Labben
    h.append('<section id="labb" class="del-block"><h2><span>5</span> Fredag: labben</h2><p>Labben gör du på fredag, efter del 2–4. Du använder samma metoder som i övningarna: <strong>räkna först, läs av, jämför och förklara</strong>. Ledtrådarna i labben pekar tillbaka till teorin på den här sidan.</p>')
    h += [LK.avsnitt({**s, 'id': 'labb-' + s['id']}, prova=False) for s in labb]
    h.append(f'<p><a class="sj-btn" href="../../vaxelstromslabbet/?lage=guidad&amp;del={tab}">Öppna den guidade labben, del {dnr}</a></p></section>')

    fore = f'<a href="Del_{nr - 1}.html">← Del {dnr - 1}</a>' if nr > 1 else '<a href="Genomgang.html?del=franskiljning">← Del 1: Frånskiljning</a>'
    efter = f'<a href="Del_{nasta["number"]}.html">Del {nasta["number"] + 1}: {e(nasta["title"])} →</a>' if nasta else '<a href="../../vaxelstromslabbet/?lage=guidad">Guidad labb →</a>'
    h.append(f'''<nav class="art-nav" aria-label="Delar"><span>{fore}</span><span><a href="index.html">Veckans översikt</a></span><span>{efter}</span></nav>
</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer>
<script type="module">
import {{visual}} from './visuals.mjs?v=20260929';
const draw=()=>document.querySelectorAll('[data-visual]').forEach(el=>{{el.querySelector('svg')?.remove();el.insertAdjacentHTML('afterbegin',visual(el.dataset.visual,Math.min(el.clientWidth,760)));}});
draw();addEventListener('resize',draw);
// Avbockade övningar sparas med samma nyckel som övningssidan, så att de följer med i QR-koden.
const K='{KLAR_NYCKEL}';let klara={{}};try{{klara=JSON.parse(localStorage.getItem(K)||'{{}}')||{{}};}}catch{{}}
const knappar=[...document.querySelectorAll('.del-klar')];
const rita=()=>{{let n=0;for(const b of knappar){{const k=!!klara[b.dataset.id];n+=k;b.textContent=k?'✓ Klar':'Markera som klar';b.setAttribute('aria-pressed',String(k));b.closest('.del-ovning').classList.toggle('klar',k);}}document.getElementById('del-status').textContent=`${{n}} av ${{knappar.length}} övningar klara.`;}};
for(const b of knappar)b.addEventListener('click',()=>{{klara[b.dataset.id]=!klara[b.dataset.id];try{{localStorage.setItem(K,JSON.stringify(klara));}}catch{{}}rita();}});
rita();
</script></body></html>
''')
    return ''.join(h)


CSS = '''/* Vecka 40, en sida per del: Översikt, Teori, Exempel, Övningar, Labben (genereras av innehall/export/delsidor.py) */
.del-main{max-width:980px}.del-sida{max-width:76ch}
.del-steg{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 24px;position:sticky;top:0;background:#fff;padding:8px 0;z-index:2;border-bottom:1px solid var(--sj-line,#cad8e2)}
.del-steg a{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:4px 14px 4px 6px;border:1px solid var(--sj-line,#cad8e2);border-radius:999px;text-decoration:none;font-weight:700;background:#fff}
.del-steg b{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--sj-accent,#064f91);color:#fff}
.del-block{margin:12px 0 40px;scroll-margin-top:72px}.del-block>h2{display:flex;align-items:center;gap:12px;border-bottom:3px solid var(--sj-accent,#064f91);padding-bottom:6px}
.del-block>h2 span{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--sj-accent,#064f91);color:#fff;font-size:22px}
.del-block section,.del-ovning{scroll-margin-top:72px}
.del-gor li{margin:8px 0}.del-mer{font-size:15px;color:var(--sj-muted,#4d6579)}
.del-tur{margin:16px 0 24px;padding:8px 16px;border-left:8px solid var(--sj-accent,#064f91);background:var(--sj-soft,#edf4f9);border-radius:0 12px 12px 0}
.del-ovning{margin:20px 0 28px;padding:14px 18px;border:1px solid var(--sj-line,#cad8e2);border-radius:12px;background:#fff}
.del-ovning h3{margin-top:0}.del-givet{color:var(--sj-muted,#4d6579)}
.del-ovning .formula{font-weight:700;white-space:nowrap;font-size:inherit;display:inline;margin:0}
.del-klar{margin-top:12px;min-height:44px;padding:6px 14px;border:1px solid var(--sj-line,#cad8e2);border-radius:8px;background:#fff;font:inherit;cursor:pointer}
.del-ovning.klar{border-color:var(--sj-ok,#176844)}.del-ovning.klar .del-klar{background:var(--sj-ok,#176844);color:#fff;border-color:var(--sj-ok,#176844)}
.del-status{font-weight:700;color:var(--sj-muted,#4d6579)}
@media(max-width:700px){.del-steg{position:static;gap:6px}.del-steg a{min-height:40px;padding:2px 10px 2px 4px;font-size:15px}.del-steg b{width:26px;height:26px}}
@media print{.del-steg,.del-klar,.art-nav,.school-nav{display:none}.del-ovning{break-inside:avoid}}
'''


def filer(a):
    alla = LK.lektioner()
    plan = json.loads((R.SJO / 'innehall/studieplan-v40.json').read_text())
    pl_av = {p['id']: pl for pl, p in a.placeringar('kurs-formelstod', 'vecka-40/aktuell/Formelstod_och_ovningar.html')}
    ut = {'vecka-40/aktuell/del.css': CSS}
    for l in alla:
        ut[f'vecka-40/aktuell/Del_{l["number"]}.html'] = sida(a, l, alla, plan, pl_av)
    return ut
