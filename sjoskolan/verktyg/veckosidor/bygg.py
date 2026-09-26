#!/usr/bin/env python3
"""Bygger veckosidorna vecka-XX/aktuell/index.html (utom vecka 40, som har egen sida) ur VECKOR nedan.

Mönster enligt sjoskolan/DESIGN.md: mål, numrerade delar (genomgång, övningar, labb, film),
vad som redovisas och när, fördjupning för sig. PDF-länk visas när PDF-filen finns bredvid presentationen.

    python3 sjoskolan/verktyg/veckosidor/bygg.py
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # sjoskolan/
V = '20260927'
MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']


def ppt(fil, titel, bilder, extra=''):
    return {'typ': 'ppt', 'fil': fil, 'titel': titel, 'bilder': bilder, 'extra': extra}


def lank(href, titel, typ, text=''):
    return {'typ': typ, 'href': href, 'titel': titel, 'text': text}


LABB = {
    'multimeter': '../../multimetersimulator/',
    'trefas': '../../trefaslabbet/',
    'hallkrets': '../../hallkretslabbet/',
    'isolation': '../../isolationslabbet/',
}

VECKOR = {
    37: {
        'titel': 'Elens grunder och elsäkerhet', 'datum': ('2026-09-07', '2026-09-11'), 'sista': '2026-09-13',
        'mal': 'Du kan följa strömvägen i en enkel krets, räkna med spänning, ström och resistans och göra en första riskbedömning.',
        'delar': [
            {'titel': 'Elens grunder', 'mal': 'Strömväg, brytare, spänning mellan två punkter och Ohms lag.', 'poster': [
                ppt('v37_01_Forberedelsefragor_1A_elev.pptx', 'Förberedelsefrågor 1A', 1, 'svara innan genomgången'),
                ppt('v37_02_Elens_grunder_ombord_elev.pptx', 'Elens grunder ombord', 50),
                lank('01A_Elens_grunder/Elens_grunder.html', 'Elens grunder steg för steg', 'läs', 'samma genomgång som text'),
                lank('01A_Elens_grunder/Arbetsblad.html', 'Arbetsblad 1A: elens grunder', 'övning', 'E1–E7'),
            ]},
            {'titel': 'Elsäkerhet och riskbedömning', 'mal': 'Skilj på fara, händelse och skada och skriv en riskrad som hänger ihop.', 'poster': [
                ppt('v37_03_Forberedelsefragor_1B_elev.pptx', 'Förberedelsefrågor 1B', 1, 'svara innan genomgången'),
                ppt('v37_04_Elsakerhet_och_riskbedomning_elev.pptx', 'Elsäkerhet och riskbedömning', 46),
                lank('01B_Elsakerhet_och_riskbedomning/Elsakerhet_steg_for_steg.html', 'Elsäkerhet steg för steg', 'läs', 'samma genomgång som text'),
                lank('01B_Elsakerhet_och_riskbedomning/Lampkretsen_bildguide.html', 'Lampkretsen: delar och symboler', 'läs'),
                lank('01B_Elsakerhet_och_riskbedomning/Arbetsblad.html', 'Arbetsblad 1B: elsäkerhet och riskbedömning', 'övning', 'E1–E6'),
                lank('01B_Elsakerhet_och_riskbedomning/Riskbedomning_mall.html', 'Mall för riskbedömning', 'mall'),
            ]},
        ],
        'redovisa': ['Arbetsblad 1A, E1–E7, med metod och enhet i varje beräkning.', 'Arbetsblad 1B, E1–E6.', 'En egen riskbedömning i mallen.'],
        'fordjupning': [lank('01B_Elsakerhet_och_riskbedomning/Bildkallor.html', 'Bildkällor till föreläsning 1B', 'läs')],
    },
    38: {
        'titel': 'Frånskiljning och mätteknik', 'datum': ('2026-09-14', '2026-09-18'), 'sista': '2026-09-20',
        'mal': 'Du kan frånskilja enligt de fem stegen, välja instrument och funktion för en mätning och bedöma ett mätvärde mot instrumentets noggrannhet.',
        'delar': [
            {'titel': 'Frånskiljning och de fem stegen', 'mal': 'Varför en öppen brytare inte är ett bevis, och vad som måste verifieras.', 'poster': [
                ppt('v38_01_Franskiljning_och_matteknik_elev.pptx', 'Frånskiljning och mätteknik', 19),
                lank('../../filmer/#fem-steg', 'Film: Fem steg', 'film', 'utan ljud, med text'),
            ]},
            {'titel': 'Instrumentval och noggrannhet', 'mal': 'Välj rätt funktion och räkna instrumentets felgräns.', 'poster': [
                lank('Elevuppgifter.html', 'Elevuppgifter V2-1 till V2-4', 'övning'),
                lank('../../gemensamt/Underlagskort.html', 'Instrument- och komponentkort', 'läs', 'M1 och M2 används i V2-2'),
            ]},
        ],
        'redovisa': ['Elevuppgifterna V2-1 till V2-4, var och en med metod och motivering.'],
        'fordjupning': [lank('Fordjupning_elev.html', 'Fördjupning: mätfrågor, upplösning och mätprotokoll', 'övning')],
    },
    39: {
        'titel': 'Effekt, Kirchhoff och multimeter', 'datum': ('2026-09-21', '2026-09-25'), 'sista': '2026-09-27',
        'mal': 'Du kan räkna effekt och energi, använda Kirchhoffs lagar i en belastad krets och mäta spänning, ström och resistans med multimeter.',
        'delar': [
            {'titel': 'Effekt och energi', 'mal': 'P = U · I, energi över tid och förlust i en kabel.', 'poster': [
                ppt('v39_01_Effekt_och_energi_elev.pptx', 'Effekt och energi', 36),
                lank('Formelstod_och_ovningar.html#v39_01', 'Övningar: effekt och energi', 'övning', '10 övningar med facit'),
                lank('../../filmer/#dubbel-strom', 'Film: Dubbel ström – fyra gånger förlust', 'film', 'utan ljud, med text'),
            ]},
            {'titel': 'Kirchhoffs lagar', 'mal': 'Slingekvation, nodspänning och den belastade spänningsdelaren.', 'poster': [
                ppt('v39_02_Kirchhoffs_lagar_med_nodforklaring_v2_elev.pptx', 'Kirchhoffs lagar', 46),
                lank('Kirchhoff_exempel_i_text.html', 'Kirchhoff: tre exempel i text', 'läs'),
                lank('Formelstod_och_ovningar.html#v39_02', 'Övningar: Kirchhoffs lagar', 'övning', '10 övningar med facit'),
            ]},
            {'titel': 'Multimeter och mätfel', 'mal': 'Koppla rätt, välj funktion och uttag, och förstå mätarens felgräns och belastning.', 'poster': [
                ppt('v39_03_Multimeter_och_matfel_elev.pptx', 'Multimeter och mätfel', 70, 'version 7'),
                lank('Multimeter_begrepp.html', 'Multimetern – ord på enkel svenska', 'läs'),
                lank('Filmer.html', 'Svenska filmer om multimetern', 'film'),
                lank(LABB['multimeter'], 'Multimeterlabbet', 'labb', 'övning 01–08'),
            ]},
        ],
        'redovisa': ['Multimeterlabbet: övning 01–08 klara och mätprotokollet sparat som PDF.'],
        'fordjupning': [
            ppt('v39_04_Kirchhoff_seminarium_elev.pptx', 'Kirchhoff – kompletterande seminarium', 42),
            lank('../../multimeterfilm/', 'Multimeter Aboard (engelska)', 'film', '12 kapitel med engelsk berättarröst'),
            lank('SELV_rigg_hyttbelysning.png', 'Bild: SELV-rigg för hyttbelysning', 'läs'),
        ],
    },
    41: {
        'titel': 'Trefas och laboration', 'datum': ('2026-10-05', '2026-10-09'), 'sista': '2026-10-11',
        'mal': 'Du kan räkna med fas- och huvudspänning i Y och Δ, förklara neutralströmmen och genomföra stationerna A, B och C med eget protokoll.',
        'delar': [
            {'titel': 'Trefassystemets grunder', 'mal': 'Fas- och huvudspänning, visare och neutralström.', 'poster': [
                ppt('v41_01_Trefassystemets_grunder_elev.pptx', 'Trefassystemets grunder', 36),
                lank('Formelstod_och_ovningar.html#v41_01', 'Övningar: trefassystemets grunder', 'övning', '10 övningar med facit'),
                lank('../../filmer/#varfor-rot-3', 'Film: Varför √3?', 'film', 'utan ljud, med text'),
                lank(LABB['trefas'], 'Trefaslabbet', 'labb', 'flik 1 och 2'),
            ]},
            {'titel': 'Y, Δ och trefaseffekt', 'mal': 'Välj rätt spänning och ström i Y och Δ och räkna effekten.', 'poster': [
                ppt('v41_02_Y_och_trefaseffekt_elev.pptx', 'Y, Δ och trefaseffekt', 36),
                lank('Formelstod_och_ovningar.html#v41_02', 'Övningar: Y, Δ och trefaseffekt', 'övning', '10 övningar med facit'),
                lank(LABB['trefas'] + '?flik=ydelta', 'Trefaslabbet', 'labb', 'flik 3: Y, Δ och motorns märkning'),
            ]},
            {'titel': 'Stationerna A, B och C', 'mal': 'Förutsäg, mät, jämför och förklara vid tre stationer.', 'poster': [
                ppt('v41_03_Fysisk_traff_och_matning_elev.pptx', 'Fysisk träff och mätning', 36),
                lank('Formelstod_och_ovningar.html#v41_03', 'Övningar: beräkning före mätning', 'övning', '10 övningar med facit'),
                lank('Simulerade_stationer.html', 'Simulerade stationer A, B och C', 'labb', 'protokoll och ifyllda exempel'),
                lank('Elevprotokoll.html', 'Elevprotokoll och riskmall', 'mall', 'för den fysiska träffen'),
                lank('../../filmer/#hallkretsen', 'Film: Hållkretsen', 'film', 'inför Station C'),
            ]},
        ],
        'redovisa': ['Protokoll för Station A och Station C med en felmodul (under träffen fredag 9 oktober).', 'Protokoll för Station B och en andra felmodul i Station C.'],
        'notis': 'Laborationen fredag 9 oktober använder den avsedda riggen och lärarens anvisningar. Förbered protokoll och riskbedömning före träffen.',
        'fordjupning': [lank(LABB['hallkrets'], 'Hållkretslabbet', 'labb', '8 räkna-först-uppgifter')],
    },
    42: {
        'titel': 'Elektriska risker och skydd', 'datum': ('2026-10-12', '2026-10-16'), 'sista': '2026-10-18',
        'mal': 'Du kan beskriva hur el skadar, välja regelverk och arbetsmetod utifrån fallet och skriva en riskbedömning som går att följa upp.',
        'delar': [
            {'titel': 'Elektriska risker', 'mal': 'Strömgenomgång, ljusbåge och beröringsspänning.', 'poster': [
                ppt('v42_01_Elektriska_risker_elev.pptx', 'Elektriska risker', 36),
                lank('Formelstod_och_ovningar.html#v42_01', 'Övningar: elektriska risker', 'övning', '10 övningar med facit'),
                lank('../../filmer/#fem-steg', 'Film: Fem steg', 'film', 'repetition från vecka 38'),
            ]},
            {'titel': 'Regler, ansvar och arbetsmetoder', 'mal': 'Vem gör vad, och vilket underlag krävs innan arbetet börjar.', 'poster': [
                ppt('v42_02_Regler_ansvar_och_arbetsmetoder_elev.pptx', 'Regler, ansvar och arbetsmetoder', 36),
                lank('Formelstod_och_ovningar.html#v42_02', 'Övningar: regler och arbetsmetoder', 'övning', '10 övningar med facit'),
            ]},
            {'titel': 'Riskbedömning och skydd', 'mal': 'Från identifierad fara till beslut och verifierad åtgärd.', 'poster': [
                ppt('v42_03_Riskbedomning_och_skydd_elev.pptx', 'Riskbedömning och skydd', 36),
                lank('Formelstod_och_ovningar.html#v42_03', 'Övningar: riskbedömning och skydd', 'övning', '10 övningar med facit'),
                lank(LABB['multimeter'] + '?ovning=category', 'Multimeterlabbet: Välj CAT-klass', 'labb', 'motivera valet skriftligt'),
            ]},
        ],
        'redovisa': ['Multimeterlabbet, Välj CAT-klass: ditt val av instrument och mätsladdar med skriftlig motivering.', 'En riskbedömning i mallen för ett av fallen i del 3.'],
        'fordjupning': [],
    },
    43: {
        'titel': 'Komponenter, motorer och scheman', 'datum': ('2026-10-19', '2026-10-23'), 'sista': '2026-10-25',
        'mal': 'Du kan läsa skyddsdata och märkning, räkna på transformator och motor och följa en styrkrets i schemat.',
        'delar': [
            {'titel': 'Komponenter och skydd', 'mal': 'Säkring, dvärgbrytare, jordfelsbrytare och deras märkdata.', 'poster': [
                ppt('v43_01_Komponenter_och_skydd_elev.pptx', 'Komponenter och skydd', 36),
                lank('Formelstod_och_ovningar.html#v43_01', 'Övningar: komponenter och skydd', 'övning', '10 övningar med facit'),
            ]},
            {'titel': 'Transformatorer och motorer', 'mal': 'Omsättning, varvtal och eftersläpning.', 'poster': [
                ppt('v43_02_Transformatorer_och_motorer_elev.pptx', 'Transformatorer och motorer', 36),
                lank('Formelstod_och_ovningar.html#v43_02', 'Övningar: transformatorer och motorer', 'övning', '10 övningar med facit'),
            ]},
            {'titel': 'Elscheman och dokumentation', 'mal': 'Följ hållkretsen i schemat och mät dig fram till ett avbrott.', 'poster': [
                ppt('v43_03_Elscheman_och_dokumentation_elev.pptx', 'Elscheman och dokumentation', 36),
                lank('Formelstod_och_ovningar.html#v43_03', 'Övningar: scheman och dokumentation', 'övning', '10 övningar med facit'),
                lank('../../filmer/#hallkretsen', 'Film: Hållkretsen', 'film', 'utan ljud, med text'),
                lank(LABB['hallkrets'], 'Hållkretslabbet', 'labb', '8 räkna-först-uppgifter'),
            ]},
        ],
        'redovisa': ['Hållkretslabbet: de 8 räkna-först-uppgifterna och en felsökning med observation, hypotes, kontroll och slutsats.'],
        'fordjupning': [],
    },
    44: {
        'titel': 'Elsystem och fördjupad mätteknik', 'datum': ('2026-10-26', '2026-10-30'), 'sista': '2026-11-01',
        'mal': 'Du kan jämföra IT- och TN-system ombord, förklara första och andra jordfelet och bedöma isolationsresistans och läckström.',
        'delar': [
            {'titel': 'Lågspänningssystem', 'mal': 'Matning, jordning och skydd i IT- och TN-system.', 'poster': [
                ppt('v44_01_Lagspanningssystem_elev.pptx', 'Lågspänningssystem', 37),
                lank('Formelstod_och_ovningar.html#v44_01', 'Övningar: lågspänningssystem', 'övning', '10 övningar med facit'),
                lank('../../filmer/#it-nat', 'Film: IT-nätet ombord', 'film', 'första och andra jordfelet'),
                lank(LABB['isolation'], 'Isolationslabbet', 'labb', 'isolationsövervakning och jordfel i IT-nät'),
            ]},
            {'titel': 'Högspänningssystem', 'mal': 'Spänningsnivåer, skyddsfunktion och strömtransformator.', 'poster': [
                ppt('v44_02_Hogspanningssystem_elev.pptx', 'Högspänningssystem', 37),
                lank('Formelstod_och_ovningar.html#v44_02', 'Övningar: högspänningssystem', 'övning', '10 övningar med facit'),
            ]},
            {'titel': 'Fördjupad mätteknik', 'mal': 'Mätkedjan, isolationsmätning och instrumentets påverkan.', 'poster': [
                ppt('v44_03_Fordjupad_matteknik_elev.pptx', 'Fördjupad mätteknik', 36),
                lank('Formelstod_och_ovningar.html#v44_03', 'Övningar: fördjupad mätteknik', 'övning', '10 övningar med facit'),
                lank(LABB['isolation'] + '?del=matning', 'Isolationslabbet: isolationsmätning', 'labb', 'provspänning, läckström och gränsvärde'),
                lank(LABB['multimeter'] + '?ovning=loading', 'Multimeterlabbet: Mätaren påverkar', 'labb', 'belastning i en spänningsdelare'),
            ]},
        ],
        'redovisa': ['Isolationslabbet: alla räkna-först-uppgifter och labbprotokollet sparat som PDF.', 'Multimeterlabbet: Mätaren påverkar, V ~ på likspänning, Ström i serie och Välj CAT-klass. Förklara för varje oväntat värde om instrumentet, kretsen eller referenspunkten orsakar det.'],
        'fordjupning': [],
    },
    45: {
        'titel': 'Felsökning och repetition', 'datum': ('2026-11-02', '2026-11-06'), 'sista': '2026-11-08',
        'mal': 'Du kan felsöka systematiskt från observation till verifierad åtgärd, bedöma mätresultat mot krav och repetera kursen inför tentamen.',
        'delar': [
            {'titel': 'Systematisk felsökning', 'mal': 'Observation, prövbar hypotes och en kontroll som skiljer mellan orsakerna.', 'poster': [
                ppt('v45_01_Systematisk_felsokning_elev.pptx', 'Systematisk felsökning', 36),
                lank('Formelstod_och_ovningar.html#v45_01', 'Övningar: systematisk felsökning', 'övning', '10 övningar med facit'),
                lank(LABB['hallkrets'], 'Hållkretslabbet', 'labb', 'lägg in ett fel och motivera nästa mätning innan du ser resultatet'),
            ]},
            {'titel': 'Analys av mätresultat', 'mal': 'Mätvärde, osäkerhet och slutsats mot ett krav.', 'poster': [
                ppt('v45_02_Analys_av_matresultat_elev.pptx', 'Analys av mätresultat', 36),
                lank('Formelstod_och_ovningar.html#v45_02', 'Övningar: analys av mätresultat', 'övning', '10 övningar med facit'),
                lank(LABB['multimeter'] + '?ovning=loading', 'Multimeterlabbet: Mätaren påverkar', 'labb', 'repetera belastning och avvikande mätvärden'),
                lank('../../vecka-41/aktuell/Elevprotokoll.html', 'Elevprotokoll (vecka 41)', 'mall', 'samma kolumner för plan, mätning och analys'),
            ]},
            {'titel': 'Repetition inför tentamen', 'mal': 'Välj formel efter storhet och metod efter frågan.', 'poster': [
                ppt('v45_03_Repetition_infor_tentamen_elev.pptx', 'Repetition inför tentamen', 36),
                lank('Formelstod_och_ovningar.html#v45_03', 'Övningar: repetition', 'övning', '10 övningar med facit'),
                lank('../../tentamen.html', 'Tentamen: innehåll och övningstenta', 'läs', 'med lösningar'),
            ]},
        ],
        'redovisa': ['En felsökning i Hållkretslabbet där varje mätning är motiverad innan resultatet visas.', 'Övningstentan, rättad mot lösningarna, med de uppgifter du vill ta upp på repetitionen markerade.'],
        'fordjupning': [],
    },
}

KIND = {'ppt': 'Presentation', 'läs': 'Läs', 'övning': 'Övningar', 'labb': 'Labb', 'film': 'Film', 'mall': 'Mall'}


def datum(iso, år=False):
    y, m, d = map(int, iso.split('-'))
    return f'{d} {MONTHS[m - 1]}' + (f' {y}' if år else '')


def post(p, week_dir):
    if p['typ'] == 'ppt':
        pdf = p['fil'][:-5] + '.pdf'
        extra = f" · {escape(p['extra'])}" if p['extra'] else ''
        pdf_link = f' · <a href="{pdf}">PDF</a>' if (week_dir / pdf).exists() else ''
        return (f'<li><span class="kind">Presentation</span><a href="{p["fil"]}">{escape(p["titel"])}</a>'
                f'<small>PowerPoint · {p["bilder"]} {"bild" if p["bilder"] == 1 else "bilder"}{extra}{pdf_link}</small></li>')
    small = f'<small>{escape(p["text"])}</small>' if p['text'] else ''
    return f'<li><span class="kind">{KIND[p["typ"]]}</span><a href="{p["href"]}">{escape(p["titel"])}</a>{small}</li>'


def first_href(del_):
    p = del_['poster'][0]
    return p.get('fil') or p['href']


def page(nr, w):
    week_dir = ROOT / f'vecka-{nr}' / 'aktuell'
    start, end = w['datum']
    delar = ''.join(
        f'<li id="del-{i}"><span class="lesson-number" aria-hidden="true">{i}</span><div><h3>Del {i}. {escape(d["titel"])}</h3>'
        f'<p>{escape(d["mal"])}</p><ul class="lesson-items">{"".join(post(p, week_dir) for p in d["poster"])}</ul></div></li>'
        for i, d in enumerate(w['delar'], 1))
    redovisa = ''.join(f'<li>{escape(r)}</li>' for r in w['redovisa'])
    fordj = ''
    if w['fordjupning']:
        fordj = ('<h3>Fördjupning, frivillig</h3><ul class="lesson-items">'
                 + ''.join(post(p, week_dir) for p in w['fordjupning']) + '</ul>')
    notis = f'<p class="sj-panel warn week-note">{escape(w["notis"])}</p>' if w.get('notis') else ''
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vecka {nr}: {escape(w["titel"])} · Sjöskolan</title><meta name="description" content="{escape(w["mal"])}"><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{nr}/aktuell/"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v={V}"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}"><script defer src="/sjoskolan/downloads.js?v=20260924-1"></script></head><body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a></nav><main id="main-content" class="course-main">
<header class="course-heading week-heading"><p class="course-kicker">Vecka {nr} · {datum(start)}–{datum(end, True)}</p><h1>{escape(w["titel"])}</h1><p class="course-lead">{escape(w["mal"])}</p><p>Arbeta med delarna i ordning. Varje del börjar med en presentation, fortsätter med övningar och slutar i en labb eller film när det finns en.</p><p class="course-actions"><a class="sj-btn primary large" href="#del-1">Börja med del 1: {escape(w["delar"][0]["titel"])}</a></p></header>
{notis}<div class="week-grid"><section aria-labelledby="ordning"><h2 id="ordning">Arbeta i den här ordningen</h2><ol class="lesson-list">{delar}</ol></section>
<aside class="week-aside" aria-labelledby="grundarbete"><h2 id="grundarbete">Veckans grundarbete</h2><h3>Du redovisar</h3><ul>{redovisa}</ul><p>Övningarna i Formelstöd och övningar är träning. Kontrollera dina svar mot facit under varje övning.</p><p><strong>Senast söndag {datum(w["sista"])}.</strong> Lämna via den inlämningskanal läraren har anvisat.</p>{fordj}<h3>Att slå upp</h3><ul class="plain"><li><a href="../../gemensamt/Formelblad_och_begrepp.html">Formelblad och begrepp</a></li><li><a href="../../gemensamt/Underlagskort.html">Instrument- och komponentkort</a></li><li><a href="../../tentamen.html">Tentamen och övningstenta</a></li></ul></aside></div>
<p class="course-download-note">Presentationerna finns som PowerPoint och PDF. PDF öppnas direkt i telefonen. Nedladdade filer får datum och klockslag i filnamnet.</p>
</main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>
'''


if __name__ == '__main__':
    for nr, w in VECKOR.items():
        out = ROOT / f'vecka-{nr}' / 'aktuell' / 'index.html'
        out.write_text(page(nr, w), encoding='utf-8')
        print('skrev', out.relative_to(ROOT.parent))
