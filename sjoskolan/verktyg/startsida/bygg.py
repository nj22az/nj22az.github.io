#!/usr/bin/env python3
"""Bygger startsidan sjoskolan/index.html: kursens moduler med delar, labb, inlämning och elevens framsteg.

Varje modul färgkodas efter kursplanens områden (samma färger och beräkning som veckosidorna,
verktyg/veckosidor/kursplan.py): randen i modulens största område och ett band med alla områden.

    python3 sjoskolan/verktyg/startsida/bygg.py
"""
import json
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # sjoskolan/
OUT = ROOT / 'index.html'
sys.path.insert(0, str(ROOT / 'verktyg' / 'veckosidor'))
import kursplan as K  # noqa: E402

# Varje modul: titel, vad eleven kan efteråt, när den undervisas, delar (länk, titel), labb, inlämning och övningar för framsteg.
# 'ovningar': (mapp, prefix) – tio övningar var, avbockade på delsidan eller i Formelstöd och övningar.
MODULER = [
    dict(nr=1, titel='Elens grunder och elsäkerhet', mal='Följ strömvägen, räkna med Ohms lag och skriv en riskrad som hänger ihop.',
         vecka='Vecka 38', start='2026-09-14', sista='2026-09-20', sida='vecka-37/aktuell/',
         delar=[('vecka-37/aktuell/01A_Elens_grunder/Elens_grunder.html', 'Elens grunder'),
                ('vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Elsakerhet_steg_for_steg.html', 'Elsäkerhet och riskbedömning')],
         labb=None, inl='vecka-37/aktuell/Inlamning.html', ovningar=[], blad=['vecka-37/']),
    dict(nr=2, titel='Effekt, Kirchhoff och multimeter', mal='Räkna effekt och energi, använd Kirchhoffs lagar och mät med multimeter.',
         vecka='Vecka 39', start='2026-09-21', sista='2026-09-27', sida='vecka-39/aktuell/',
         delar=[('vecka-39/aktuell/Formelstod_och_ovningar.html#v39_01', 'Effekt och energi'),
                ('vecka-39/aktuell/Formelstod_och_ovningar.html#v39_02', 'Kirchhoffs lagar'),
                ('vecka-39/aktuell/Multimeter_begrepp.html', 'Multimeter och mätfel')],
         labb=('multimetersimulator/', 'Multimeterlabbet'), inl='vecka-39/aktuell/Inlamning.html',
         ovningar=[('vecka-39', 'v39_01-q'), ('vecka-39', 'v39_02-q')]),
    dict(nr=3, titel='Frånskiljning och mätteknik', mal='De fem stegen, rätt instrument och funktion, och instrumentets felgräns.',
         vecka='Vecka 40', start='2026-09-28', sista='2026-10-04', sida='vecka-38/aktuell/',
         delar=[('filmer/#fem-steg', 'Film: Fem steg'), ('vecka-38/aktuell/Elevuppgifter.html', 'Övning 1.1–1.4')],
         labb=None, inl='vecka-38/aktuell/Inlamning.html', ovningar=[], blad=['vecka-38/']),
    dict(nr=4, titel='Växelström', mal='Toppvärde och effektivvärde, reaktans och impedans, effekt och effektfaktor.',
         vecka='Vecka 40', start='2026-09-28', sista='2026-10-04', sida='vecka-40/aktuell/',
         delar=[('vecka-40/aktuell/Del_1.html', 'Sinus och mätvärden'), ('vecka-40/aktuell/Del_2.html', 'Spole, motstånd och ström'),
                ('vecka-40/aktuell/Del_3.html', 'Effekt och effektfaktor')],
         labb=('vaxelstromslabbet/?lage=guidad', 'Växelströmslabbet'), inl='vecka-40/aktuell/Inlamning.html',
         ovningar=[('vecka-40', 'v40_01-q'), ('vecka-40', 'v40_02-q'), ('vecka-40', 'v40_03-q')]),
    dict(nr=5, titel='Trefas och motorn', mal='Fas- och huvudspänning, Y och Δ, trefaseffekt och motorn i plinten.',
         vecka='Vecka 41', start='2026-10-05', sista='2026-10-11', sida='vecka-41/aktuell/',
         delar=[('vecka-41/aktuell/Del_1.html', 'Trefassystemets grunder'), ('vecka-41/aktuell/Del_2.html', 'Y, Δ och trefaseffekt'),
                ('vecka-41/aktuell/Del_3.html', 'Motorn, startaren och strömtången')],
         labb=('trefaslabbet/', 'Trefaslabbet och Motorlabbet'), inl='vecka-41/aktuell/Inlamning.html',
         ovningar=[('vecka-41', 'v41_01-q'), ('vecka-41', 'v41_02-q'), ('vecka-41', 'v41_03-q')]),
    dict(nr=6, titel='Elektriska risker och skydd', mal='Hur el skadar, regler och ansvar, och en riskbedömning som går att följa upp.',
         vecka='Vecka 42', start='2026-10-12', sista='2026-10-16', sida='vecka-42/aktuell/',
         delar=[('vecka-42/aktuell/Del_1.html', 'Elektriska risker'), ('vecka-42/aktuell/Del_2.html', 'Regler, ansvar och arbetsmetoder'),
                ('vecka-42/aktuell/Del_3.html', 'Riskbedömning och skydd')],
         labb=('multimetersimulator/?ovning=category', 'Multimeterlabbet: Välj CAT-klass'), inl='vecka-42/aktuell/Inlamning.html',
         ovningar=[('vecka-42', 'v42_01-q'), ('vecka-42', 'v42_02-q'), ('vecka-42', 'v42_03-q')]),
    dict(nr=7, titel='Komponenter, motorer och scheman', mal='Skyddsdata, transformator och motor, och hållkretsen i schemat.',
         vecka='Vecka 43', start='2026-10-19', sista='2026-10-25', sida='vecka-43/aktuell/',
         delar=[('vecka-43/aktuell/Del_1.html', 'Komponenter och skydd'), ('vecka-43/aktuell/Del_2.html', 'Transformatorer och motorer'),
                ('vecka-43/aktuell/Del_3.html', 'Elscheman och dokumentation')],
         labb=('hallkretslabbet/', 'Hållkretslabbet'), inl='vecka-43/aktuell/Inlamning.html',
         ovningar=[('vecka-43', 'v43_01-q'), ('vecka-43', 'v43_02-q'), ('vecka-43', 'v43_03-q')]),
    dict(nr=8, titel='Systematisk felsökning', mal='Observation, prövbar hypotes och en kontroll som skiljer mellan orsakerna.',
         vecka='Vecka 43', start='2026-10-19', sista='2026-10-25', sida='vecka-43/aktuell/',
         delar=[('vecka-45/aktuell/Del_1.html', 'Systematisk felsökning')],
         labb=('hallkretslabbet/', 'Hållkretslabbet: dolt fel'), inl='vecka-45/aktuell/Inlamning.html#uppgift-3',
         ovningar=[('vecka-45', 'v45_01-q')]),
    dict(nr=9, titel='Elsystem ombord', mal='IT- och TN-system, första och andra jordfelet, och högspänning ombord.',
         vecka='Vecka 44', start='2026-10-26', sista='2026-11-01', sida='vecka-44/aktuell/',
         delar=[('vecka-44/aktuell/Del_1.html', 'Lågspänningssystem'), ('vecka-44/aktuell/Del_2.html', 'Högspänningssystem')],
         labb=('isolationslabbet/', 'Isolationslabbet'), inl='vecka-44/aktuell/Inlamning.html',
         ovningar=[('vecka-44', 'v44_01-q'), ('vecka-44', 'v44_02-q')]),
    dict(nr=10, titel='Mätteknik och analys', mal='Mätkedjan, isolationsmätning och en slutsats mot ett krav med hänsyn till osäkerhet.',
         vecka='Vecka 44', start='2026-10-26', sista='2026-11-01', sida='vecka-44/aktuell/',
         delar=[('vecka-44/aktuell/Del_3.html', 'Fördjupad mätteknik'), ('vecka-45/aktuell/Del_2.html', 'Analys av mätresultat')],
         labb=('isolationslabbet/?del=matning', 'Isolationsmätning och Mätaren påverkar'), inl='vecka-45/aktuell/Inlamning.html#uppgift-1',
         ovningar=[('vecka-44', 'v44_03-q'), ('vecka-45', 'v45_02-q')]),
    dict(nr=11, titel='Repetition och tentamen', mal='Välj formel efter storhet och metod efter frågan. Övningstentan med lösningar.',
         vecka='Vecka 44–45', start='2026-10-26', sista='2026-11-06', sida='vecka-45/aktuell/',
         delar=[('vecka-45/aktuell/Del_3.html', 'Repetition inför tentamen'), ('tentamen.html', 'Tentamen och övningstenta'),
                ('praktiskt-prov.html', 'Praktiskt prov')],
         labb=None, inl=None, ovningar=[('vecka-45', 'v45_03-q')], tenta=True),
]

def modulens_uppgifter(m):
    """Modulens övningar, labbuppgifter och inlämningar (post-id) och målen för det praktiska provet."""
    ids = set()
    for mapp, prefix in m['ovningar']:
        ids |= {pl['ovning'] for pl in K.FORMELSTOD if pl['plats'] == f'{mapp}/aktuell/Formelstod_och_ovningar.html' and pl['ankare'].startswith(prefix)}
    for b in m.get('blad', []):
        ids |= {pl['ovning'] for pl in K.ARBETSBLAD if pl['plats'].startswith(b)}
    if m['labb']:
        ids |= K.labbuppgifter('../../' + m['labb'][0])
    if m['inl']:
        fil, _, ankare = m['inl'].partition('#')
        ids |= {pl['ovning'] for pl in K.INLAMNING if pl['plats'] == fil and (not ankare or pl['ankare'] == ankare)}
    extra = []
    if m.get('tenta'):
        ids |= {pl['ovning'] for pl in K.TENTAMEN}
        extra = [mal for _, mal in K.PRAKTISKT_PROV]
    return ids, extra


MANAD = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec']


def kort_datum(iso):
    _, m, d = map(int, iso.split('-'))
    return f'{d} {MANAD[m - 1]}'


def veckodag(iso):
    import datetime as _dt
    return ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'][_dt.date.fromisoformat(iso).weekday()]


def modulkort(m):
    delar = ''.join(f'<li><a href="{h}">{escape(t)}</a></li>' for h, t in m['delar'])
    labb = f'<p class="mod-rad"><span class="mod-etikett">Labb</span><a href="{m["labb"][0]}">{escape(m["labb"][1])}</a></p>' if m['labb'] else ''
    inl = (f'<p class="mod-rad"><span class="mod-etikett">Inlämning</span><a href="{m["inl"]}">Senast {veckodag(m["sista"])} {kort_datum(m["sista"])}</a></p>'
           if m['inl'] else '')
    ovn = json.dumps(m['ovningar'])
    framsteg = (f'<div class="mod-framsteg" data-ovningar=\'{ovn}\'><div class="mod-bar"><span></span></div><p class="mod-antal">'
                f'{10 * len(m["ovningar"])} övningar</p></div>') if m['ovningar'] else ''
    ford = K.fordelning(*modulens_uppgifter(m))
    huvud = max(ford, key=lambda x: x[1])[0]
    return (f'<article class="mod" id="modul-{m["nr"]}" data-start="{m["start"]}" data-sista="{m["sista"]}" style="border-left:6px solid {huvud[2]}">'
            f'<header class="mod-huvud"><span class="mod-nr" aria-hidden="true">{m["nr"]}</span>'
            f'<div><p class="mod-vecka">Modul {m["nr"]} · {m["vecka"]}<span class="mod-status"></span></p>'
            f'<h3><a href="{m["sida"]}">{escape(m["titel"])}</a></h3></div></header>'
            f'<p class="mod-mal">{escape(m["mal"])}</p>{K.omrade_band(ford, kompakt=True)}<ol class="mod-delar">{delar}</ol>{labb}{inl}{framsteg}</article>')


CSS = '''
.dash-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;padding:8px 0 24px}
.dash-head h1{font-size:clamp(32px,4vw,42px);line-height:1.15;margin:4px 0 0}
.dash-top{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(2,minmax(0,1fr));gap:16px;margin-bottom:40px}
.tile{background:var(--sj-paper);border:1px solid var(--sj-line);border-radius:12px;padding:20px 22px}
.tile .tile-etikett{font-size:15px;font-weight:700;color:var(--sj-muted);margin:0 0 6px}
.tile .tile-varde{font-size:28px;font-weight:700;line-height:1.2;margin:0}
.tile .tile-text{font-size:15px;color:var(--sj-muted);margin:6px 0 0}
.tile.nu{background:var(--sj-soft);border:2px solid var(--sj-blue)}
.tile.nu h2{font-size:26px;margin:0 0 6px}.tile.nu .sj-btn{margin-top:14px}
.omr-legend{margin:0 0 18px}.omr-legend-rubrik{margin:0 0 8px;font-size:15px;font-weight:700;color:var(--sj-muted)}
.omr-legend ul{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0;padding:0}
.omr-legend li{padding:6px 12px;border-radius:8px;font-size:15px;color:var(--sj-ink)}.omr-legend li span{color:var(--sj-muted)}
.mod .omr{margin:8px 0 6px}.mod .omr-text{font-size:14px}
.mod-filter{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.mod-filter button{min-height:44px;padding:0 16px;border:1px solid var(--sj-line);border-radius:999px;background:var(--sj-paper);color:var(--sj-ink);font:inherit;font-size:16px;cursor:pointer}
.mod-filter button[aria-pressed=true]{background:var(--sj-blue);border-color:var(--sj-blue);color:#fff}
.moduler{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:16px;margin:0;padding:0}
.mod{display:flex;flex-direction:column;background:var(--sj-paper);border:1px solid var(--sj-line);border-radius:12px;padding:20px}
.mod.nu{border:2px solid var(--sj-blue);box-shadow:0 2px 0 var(--sj-soft)}
.mod-huvud{display:flex;gap:14px;align-items:flex-start}
.mod-nr{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--sj-soft);color:var(--sj-blue);font-weight:700;font-size:18px}
.mod.nu .mod-nr{background:var(--sj-blue);color:#fff}
.mod.klar .mod-nr{background:#e3f1ea;color:var(--sj-ok)}
.mod-vecka{margin:0;font-size:15px;color:var(--sj-muted)}
.mod-status{margin-left:8px;font-weight:700}
.mod.nu .mod-status{color:var(--sj-blue)}.mod.klar .mod-status{color:var(--sj-ok)}
.mod h3{font-size:20px;line-height:1.3;margin:2px 0 0}.mod h3 a{text-decoration:none;color:var(--sj-ink)}.mod h3 a:hover{text-decoration:underline}
.mod-mal{font-size:16px;color:var(--sj-muted);margin:10px 0 8px}
.mod-delar{margin:0 0 8px;padding-left:22px;font-size:16px}.mod-delar li{margin:4px 0}
.mod-rad{display:flex;gap:10px;margin:4px 0;font-size:16px}
.mod-etikett{flex:none;width:82px;font-size:15px;font-weight:700;color:var(--sj-muted);padding-top:1px}
.mod-framsteg{margin-top:auto;padding-top:14px}
.mod-bar{height:8px;border-radius:999px;background:var(--sj-soft);overflow:hidden}
.mod-bar span{display:block;height:100%;width:0;background:var(--sj-blue);border-radius:999px}
.mod.klar .mod-bar span{background:var(--sj-ok)}
.mod-antal{margin:6px 0 0;font-size:15px;color:var(--sj-muted)}
.mod[hidden]{display:none}
.stod{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:16px}
.stod h3{font-size:17px;margin:0 0 8px}.stod ul{list-style:none;padding:0;margin:0}.stod li{padding:5px 0;font-size:16px}
section+section{margin-top:48px}
@media(max-width:900px){.dash-top{grid-template-columns:1fr 1fr}.dash-top .nu{grid-column:1/-1}.stod{grid-template-columns:1fr}}
@media(max-width:560px){.dash-top{grid-template-columns:1fr}}
'''

SCRIPT = '''
(() => {
  const idag = new Date(); const iso = d => d.toISOString().slice(0, 10);
  const t = iso(new Date(idag.getTime() - idag.getTimezoneOffset() * 60000));
  const kort = [...document.querySelectorAll('.mod')];
  // Status ur datum: klar efter sista inlämningsdagen, nu från start, annars kommande.
  let nu = kort.find(k => t >= k.dataset.start && t <= k.dataset.sista) || kort.find(k => t < k.dataset.start) || kort[kort.length - 1];
  kort.forEach(k => {
    const klar = t > k.dataset.sista; const aktuell = !klar && t >= k.dataset.start;
    k.classList.toggle('klar', klar); k.classList.toggle('nu', aktuell);
    k.querySelector('.mod-status').textContent = klar ? '· avslutad' : aktuell ? '· nu' : '';
  });
  // Elevens egna avbockningar (samma nycklar som delsidorna).
  const lagrat = {};
  const las = mapp => { if (!(mapp in lagrat)) { try { lagrat[mapp] = JSON.parse(localStorage.getItem('sj-ovningar:/sjoskolan/' + mapp + '/aktuell/Formelstod_och_ovningar.html') || '{}') || {}; } catch { lagrat[mapp] = {}; } } return lagrat[mapp]; };
  let gjorda = 0, alla = 0;
  document.querySelectorAll('.mod-framsteg').forEach(f => {
    const grupper = JSON.parse(f.dataset.ovningar); let n = 0;
    grupper.forEach(([mapp, prefix]) => { const k = las(mapp); n += Math.min(10, Object.keys(k).filter(x => k[x] && x.startsWith(prefix)).length); });
    const total = 10 * grupper.length; gjorda += n; alla += total;
    f.querySelector('.mod-bar span').style.width = (100 * n / total) + '%';
    f.querySelector('.mod-antal').textContent = n ? `${n} av ${total} övningar klara` : `${total} övningar`;
  });
  const g = document.getElementById('dina-ovningar'); if (g) g.textContent = `${gjorda} av ${alla}`;
  // Nu-rutan och nästa inlämning.
  const titel = nu.querySelector('h3 a');
  document.getElementById('nu-titel').textContent = 'Modul ' + nu.id.split('-')[1] + ': ' + titel.textContent;
  document.getElementById('nu-mal').textContent = nu.querySelector('.mod-mal').textContent;
  const knapp = document.getElementById('nu-knapp'); knapp.href = titel.getAttribute('href');
  const nasta = kort.map(k => k.dataset.sista).filter(s => s >= t && kort.find(k => k.dataset.sista === s && k.querySelector('.mod-rad a[href*="Inlamning"]'))).sort()[0];
  if (nasta) {
    const [y, m, d] = nasta.split('-').map(Number); const dag = new Date(y, m - 1, d);
    const namn = dag.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('nasta-inl').textContent = namn.charAt(0).toUpperCase() + namn.slice(1);
    const mods = kort.filter(k => k.dataset.sista === nasta && k.querySelector('.mod-rad a[href*="Inlamning"]')).map(k => 'modul ' + k.id.split('-')[1]);
    document.getElementById('nasta-text').textContent = 'Inlämning för ' + mods.join(' och ') + '.';
  }
  // Filter.
  const knappar = [...document.querySelectorAll('.mod-filter button')];
  knappar.forEach(b => b.addEventListener('click', () => {
    knappar.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    kort.forEach(k => { const v = b.dataset.visa; k.hidden = v === 'kvar' ? k.classList.contains('klar') : v === 'klara' ? !k.classList.contains('klar') : false; });
  }));
  nu.scrollIntoView && location.hash === '#nu' && nu.scrollIntoView();
})();
'''

LEGEND = ('<div class="omr-legend"><p class="omr-legend-rubrik">Färgerna visar kursplanens fyra områden:</p><ul>'
          + ''.join(f'<li style="background:{K.ton(o[2])};border-left:6px solid {o[2]}"><b>{escape(o[1])}</b> <span>{", ".join(o[3])}</span></li>' for o in K.OMRADEN)
          + '</ul></div>')

html = f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Elteknik och ellära · Sjöskolan</title><meta name="description" content="Elteknik och ellära med fartygsexempel: kursens moduler, övningar, labbar och inlämningar."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="gemensamt/sjoskolan.css?v=20260926">
<style>{CSS}</style>{K.OMR_CSS}<script defer src="/sjoskolan/downloads.js?v=20260924-1"></script><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script></head>
<body class="sj"><nav class="school-nav" aria-label="Sjöskolan"><a href="./"><strong>SJÖSKOLAN</strong></a><a href="#moduler">Moduler</a><a href="bildspel/">Bildspel</a><a href="#stod">Stöd</a><a href="simulatorer/">Simulatorer</a></nav>
<main id="main-content" class="sj-wrap">
<header class="dash-head"><div><p class="sj-kicker">Elteknik och ellära · hösten 2026</p><h1>Kursens moduler</h1></div></header>
<section class="dash-top" aria-label="Översikt">
<div class="tile nu" id="nu"><p class="tile-etikett">Nu</p><h2 id="nu-titel">{escape(MODULER[5]["titel"])}</h2><p class="tile-text" id="nu-mal">{escape(MODULER[5]["mal"])}</p><a class="sj-btn primary large" id="nu-knapp" href="{MODULER[5]["sida"]}">Fortsätt</a></div>
<div class="tile"><p class="tile-etikett">Nästa inlämning</p><p class="tile-varde" id="nasta-inl">–</p><p class="tile-text" id="nasta-text">Skicka allt i ett mejl till läraren.</p></div>
<div class="tile"><p class="tile-etikett">Dina övningar</p><p class="tile-varde" id="dina-ovningar">–</p><p class="tile-text">Bocka av på delsidorna. Det sparas i den här webbläsaren.</p></div>
</section>
<section id="veckor" aria-labelledby="moduler"><h2 id="moduler">Moduler</h2>
<p class="sj-muted">Arbeta igenom modulerna i ordning. Varje modul har delar med teori, exempel och övningar, ofta en labb i webbläsaren, och en inlämning.</p>
{LEGEND}
<div class="mod-filter" role="group" aria-label="Visa moduler"><button type="button" data-visa="alla" aria-pressed="true">Alla</button><button type="button" data-visa="kvar" aria-pressed="false">Att göra</button><button type="button" data-visa="klara" aria-pressed="false">Avslutade</button></div>
<div class="moduler">{"".join(modulkort(m) for m in MODULER)}</div></section>
<section aria-labelledby="stod" id="stod-sektion"><h2 id="stod">Stöd genom hela kursen</h2><div class="stod">
<div class="tile"><h3>Labbar i webbläsaren</h3><ul><li><a href="multimetersimulator/">Multimeterlabbet</a></li><li><a href="vaxelstromslabbet/">Växelströmslabbet</a></li><li><a href="trefaslabbet/">Trefaslabbet</a></li><li><a href="motorlabbet/">Motorlabbet</a></li><li><a href="hallkretslabbet/">Hållkretslabbet</a></li><li><a href="isolationslabbet/">Isolationslabbet</a></li></ul></div>
<div class="tile"><h3>Filmer och bildspel</h3><ul><li><a href="filmer/">Förklaringsfilmer med Måns och Sigge</a></li><li><a href="bildspel/">Alla bildspel</a></li><li><a href="multimeterfilm/">Multimeter Aboard (engelska)</a></li></ul></div>
<div class="tile"><h3>Att slå upp</h3><ul><li><a href="gemensamt/Formelsamling.pdf">Formelsamling (PDF)</a></li><li><a href="gemensamt/Formelblad_och_begrepp.html">Formelblad och begrepp</a></li><li><a href="gemensamt/Raknehjalp.html">Räknarhjälp</a></li><li><a href="gemensamt/Underlagskort.html">Instrument- och komponentkort</a></li><li><a href="tentamen.html">Tentamen och övningstenta</a></li><li><a href="gemensamt/Bildgalleri.html">Figurer och scheman</a></li><li><a href="vecka-41/aktuell/Elevprotokoll.html">Mätprotokoll och riskmall</a></li><li><a href="kallor.html">Källor och bildinformation</a></li></ul></div>
</div><article class="tile" style="margin-top:16px"><p class="tile-etikett">Efter kursens moduler</p><h3><a href="simulatorer/">Simulatorer · Maskinrummet</a></h3><p class="tile-text">Öva mätteknik med Johansson vid fartygets elektriska verkstadsbänk: 3D-maskinrum, multimeter och Station A.</p></article></section>
</main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson · <a href="larare/">Lärarinloggning</a></footer>
<script>{SCRIPT}</script></body></html>
'''
OUT.write_text(html, encoding='utf-8')
print('skrev', OUT.relative_to(ROOT.parent))
