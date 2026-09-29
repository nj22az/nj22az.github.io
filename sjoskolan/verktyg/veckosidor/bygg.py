#!/usr/bin/env python3
"""Bygger veckosidorna vecka-XX/aktuell/index.html ur VECKOR nedan.

Mönster enligt sjoskolan/DESIGN.md: mål, numrerade delar (genomgång, övningar, labb, film),
vad som redovisas och när, fördjupning för sig. PDF-länk visas när PDF-filen finns bredvid presentationen.

Mappnamnen följer den ursprungliga planen och ändras aldrig (länkar, nedladdningar, resultatkoder och sparade
elevdata hänger på dem). Kursen började måndag 14 september (vecka 38), så veckan som visas kan skilja sig från
mappen: 'vecka' är veckan eleven ser. vecka-37/ är kursvecka 1 (vecka 38) och vecka-38/ (Frånskiljning och
mätteknik) ingår i vecka 40, måndag ('flyttad'). Vecka 40 har en plan dag för dag ('dagar', dagplan.mjs).

    python3 sjoskolan/verktyg/veckosidor/bygg.py
"""
import re
from html import escape
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[2]  # sjoskolan/
# Inlämningsuppgifternas rubriker kommer ur innehållsdatabasens publika id-register (genererat av innehall.py bygg).
import json as _json
INLAMNING = {}
for _p in _json.loads((ROOT / 'innehall' / 'ut' / 'id-register.json').read_text(encoding='utf-8'))['poster']:
    for _pl in _p.get('placeringar', []):
        if _pl['yta'] == 'inlamning':
            INLAMNING.setdefault(int(_pl['plats'].split('-')[1].split('/')[0]), []).append((_pl['ankare'], _pl['nummer'], _p['titel']))
# Veckor där eleven skickar resultaten som QR-kod (samma mängd som i verktyg/inlamning/bygg.py).
RESULTATKOD = {40}
_spec = importlib.util.spec_from_file_location('inlamning_bygg', ROOT / 'verktyg' / 'inlamning' / 'bygg.py')
_inl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_inl)
EPOST, epost_knapp = _inl.EPOST, _inl.epost_knapp
V = '20260930d'
DAGPLAN_V = '20260927a'
MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']


def ppt(fil, titel, bilder, extra=''):
    return {'typ': 'ppt', 'fil': fil, 'titel': titel, 'bilder': bilder, 'extra': extra}


def lank(href, titel, typ, text=''):
    return {'typ': typ, 'href': href, 'titel': titel, 'text': text}


def genomgang(href, titel, deck, bilder):
    """Steget Genomgång, med samma innehåll som bildspel, PowerPoint och PDF."""
    return {'typ': 'genomgång', 'href': href, 'titel': titel, 'text': '', 'deck': deck, 'bilder': bilder}


V38 = '../../vecka-38/aktuell/'
LABB = {
    'ac': '../../vaxelstromslabbet/',
    'multimeter': '../../multimetersimulator/',
    'trefas': '../../trefaslabbet/',
    'hallkrets': '../../hallkretslabbet/',
    'isolation': '../../isolationslabbet/',
}

VECKOR = {
    # Mappen vecka-37 undervisades vecka 38 (kursvecka 1, första lektionen måndag 14 september).
    37: {
        'vecka': 38,
        'titel': 'Elens grunder och elsäkerhet', 'datum': ('2026-09-14', '2026-09-18'), 'sista': '2026-09-20',
        'mal': 'Du kan följa strömvägen i en enkel krets, räkna med spänning, ström och resistans och göra en första riskbedömning.',
        'delar': [
            {'titel': 'Elens grunder', 'mal': 'Strömväg, brytare, spänning mellan två punkter och Ohms lag.', 'poster': [
                ppt('v37_01_Forberedelsefragor_1A_elev.pptx', 'Förberedelsefrågor 1A', 1, 'svara innan genomgången'),
                ppt('v37_02_Elens_grunder_ombord_elev.pptx', 'Elens grunder ombord', 50),
                lank('01A_Elens_grunder/Elens_grunder.html', 'Elens grunder steg för steg', 'läs', 'samma genomgång som text'),
                lank('01A_Elens_grunder/Arbetsblad.html', 'Arbetsblad 1A: elens grunder', 'övning', 'övning 1.1–1.7'),
            ]},
            {'titel': 'Elsäkerhet och riskbedömning', 'mal': 'Skilj på fara, händelse och skada och skriv en riskrad som hänger ihop.', 'poster': [
                ppt('v37_03_Forberedelsefragor_1B_elev.pptx', 'Förberedelsefrågor 1B', 1, 'svara innan genomgången'),
                ppt('v37_04_Elsakerhet_och_riskbedomning_elev.pptx', 'Elsäkerhet och riskbedömning', 46),
                lank('01B_Elsakerhet_och_riskbedomning/Elsakerhet_steg_for_steg.html', 'Elsäkerhet steg för steg', 'läs', 'samma genomgång som text'),
                lank('01B_Elsakerhet_och_riskbedomning/Lampkretsen_bildguide.html', 'Lampkretsen: delar och symboler', 'läs'),
                lank('01B_Elsakerhet_och_riskbedomning/Arbetsblad.html', 'Arbetsblad 1B: elsäkerhet och riskbedömning', 'övning', 'övning 2.1–2.10'),
                lank('01B_Elsakerhet_och_riskbedomning/Riskbedomning_mall.html', 'Mall för riskbedömning', 'mall'),
            ]},
        ],
        'redovisa': ['Arbetsblad 1A, övning 1.1–1.7, med metod och enhet i varje beräkning.', 'Arbetsblad 1B, övning 2.3–2.8.', 'En egen riskbedömning i mallen.'],
        'fordjupning': [lank('01B_Elsakerhet_och_riskbedomning/Bildkallor.html', 'Bildkällor till föreläsning 1B', 'läs')],
    },
    # Mappen vecka-38 har inte undervisats än. Den ingår i vecka 40 och börjar måndagens lektion 28 september.
    38: {
        'vecka': 40,
        'flyttad': {'href': '../../vecka-40/aktuell/#mandag', 'dag': 'måndag 28 september'},
        'titel': 'Frånskiljning och mätteknik', 'datum': ('2026-09-28', '2026-09-28'), 'sista': '2026-10-04',
        'mal':'Du kan frånskilja enligt de fem stegen, välja instrument och funktion för en mätning och bedöma ett mätvärde mot instrumentets noggrannhet.',
        'delar': [
            {'titel': 'Frånskiljning och de fem stegen', 'mal': 'Varför en öppen brytare inte är ett bevis, och vad som måste verifieras.', 'poster': [
                ppt('v38_01_Franskiljning_och_matteknik_elev.pptx', 'Frånskiljning och mätteknik', 19),
                lank('../../filmer/#fem-steg', 'Film: Fem steg', 'film', 'utan ljud, med text'),
            ]},
            {'titel': 'Instrumentval och noggrannhet', 'mal': 'Välj rätt funktion och räkna instrumentets felgräns.', 'poster': [
                lank('Elevuppgifter.html', 'Övning 1.1–1.4', 'övning'),
                lank('../../gemensamt/Underlagskort.html', 'Instrument- och komponentkort', 'läs', 'M1 och M2 används i övning 1.2'),
            ]},
        ],
        'redovisa': ['Övning 1.1–1.4, var och en med metod och motivering.'],
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
    40: {
        'titel': 'Frånskiljning och växelström', 'datum': ('2026-09-28', '2026-10-02'), 'sista': '2026-10-04',
        'mal': 'Du kan frånskilja enligt de fem stegen, läsa en sinuskurva, räkna med topp- och effektivvärde, reaktans och impedans och förklara hur effektfaktorn påverkar strömmen.',
        # Måndagen börjar med materialet i mappen vecka-38 (filerna ligger kvar där).
        'forst': {'titel': 'Frånskiljning och mätteknik', 'mal': 'De fem stegen, alla matningsvägar, instrumentval och instrumentets felgräns. Måndag, före del 1.', 'steg': [
            ppt('../../vecka-38/aktuell/v38_01_Franskiljning_och_matteknik_elev.pptx', 'Frånskiljning och mätteknik', 19),
            lank('../../filmer/#fem-steg', 'Film: Fem steg', 'film', 'utan ljud, med text'),
            lank(V38 + 'Elevuppgifter.html', 'Övning 1.1–1.4', 'övning', '1.1 och 1.2 på lektionen, 1.3 och 1.4 hemma'),
        ], 'mer': [
            lank(V38 + 'Fordjupning_elev.html', 'Fördjupning: mätfrågor, upplösning och mätprotokoll', 'övning', 'frivillig'),
            lank('../../gemensamt/Underlagskort.html', 'Instrument- och komponentkort', 'läs', 'M1 och M2 används i övning 1.2'),
        ]},
        'dagar': [],  # fylls i av DAGAR40 nedan
        'delar': [
            {'titel': 'Sinus och mätvärden', 'mal': 'Periodtid, toppvärde och effektivvärde.', 'steg': [
                genomgang('Genomgang.html?del=sinus', 'Genomgång: sinus och mätvärden', 'v40_01_Sinusformad_vaxelspanning_elev.pptx', 20),
                lank('Kortfilmer.html?del=sinus', 'Film: Vad visar kurvan och multimetern?', 'film', '2 min, svensk text'),
                lank('Formelstod_och_ovningar.html?del=v40_01', 'Övningar: sinusformad växelspänning', 'övning', '10 övningar med facit, bocka av när du är klar'),
            ], 'mer': [
                lank('Lektion_1.html', 'Artikel: sinus och mätvärden', 'artikel', 'samma innehåll som genomgången, som löpande text med figurer'),
                lank('../../filmer/#radianer', 'Film: Radianer och grader', 'film', 'Måns och Sigge, 2 min: RAD eller DEG på räknaren'),
            ]},
            {'titel': 'Spole, motstånd och ström', 'mal': 'Reaktans, impedans och strömmen i en RL-krets.', 'steg': [
                genomgang('Genomgang.html?del=impedans', 'Genomgång: spole, motstånd och ström', 'v40_02_Reaktans_och_impedans_elev.pptx', 18),
                lank('Kortfilmer.html?del=impedans', 'Film: Vad händer när vi lägger till en spole?', 'film', '2 min, svensk text'),
                lank('Formelstod_och_ovningar.html?del=v40_02', 'Övningar: reaktans och impedans', 'övning', '10 övningar med facit, bocka av när du är klar'),
            ], 'mer': [
                lank('Lektion_2.html', 'Artikel: spole, motstånd och ström', 'artikel', 'samma innehåll som genomgången, som löpande text med figurer'),
            ]},
            {'titel': 'Effekt och effektfaktor', 'mal': 'P, Q och S och hur effektfaktorn påverkar matningsströmmen.', 'steg': [
                genomgang('Genomgang.html?del=effekt', 'Genomgång: effekt och effektfaktor', 'v40_03_Effekt_i_vaxelstromskretsar_elev.pptx', 16),
                lank('Kortfilmer.html?del=effekt', 'Film: Samma aktiva effekt, olika ström', 'film', '2 min, svensk text'),
                lank('Formelstod_och_ovningar.html?del=v40_03', 'Övningar: effekt i växelströmskretsar', 'övning', '10 övningar med facit, bocka av när du är klar'),
            ], 'mer': [
                lank('Lektion_3.html', 'Artikel: effekt och effektfaktor', 'artikel', 'samma innehåll som genomgången, som löpande text med figurer'),
            ]},
        ],
        'labbar': [lank(LABB['ac'] + '?lage=guidad', 'Labb: växelströmslabbet, guidad', 'labb', 'åtta uppgifter i tre delar med egna värden ur ditt D; skicka resultatet med QR-koden')],
        'slaupp': [lank('Beteckningar.html', 'Förkortningar och beteckningar', 'läs', 'RMS, X_{L}, PF och alla andra tecken i veckan')],
        'redovisa': [],
        'fordjupning': [
            lank(LABB['ac'] + '?lage=fri', 'Växelströmslabbet: utforska och räkna vidare', 'labb', 'tolv räkna-först-uppgifter'),
            lank(LABB['ac'] + '?lage=station', 'Station B: utökat protokoll', 'labb', 'efter genomgången av mätarprinciper'),
            lank('../../filmer/#vaxelstrom', 'Växelström ombord', 'film', 'repetitionsfilm med Måns och Sigge, 4 min, svensk text'),
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
                lank('../../filmer/#fem-steg', 'Film: Fem steg', 'film', 'repetition från vecka 40'),
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

def steg(kind, titel, href, minuter, text='', ovningar=None):
    """Ett steg hemma: vad eleven gör, var, och ungefär hur lång tid det tar. ovningar='v40_01:4-10' visar framsteg
    från övningssidans avbockning (gemensamt/ovningsvy.mjs)."""
    return {'kind': kind, 'titel': titel, 'href': href, 'min': minuter, 'text': text, 'ovningar': ovningar}


# Vecka 40 dag för dag. Lektion måndag 09.00–11.00, tisdag 15.00–17.00 och fredag 09.00–11.00. Onsdag, torsdag och helgen hemma.
# Ordningen i varje del är genomgång → film → övningar, och labben är veckans sista steg (ANDRINGSLOGG regel 26).
# Samma upplägg står i lärarens anteckningar i vecka-40/aktuell/lektioner.mjs (bilden ”Det här ska du kunna”).
G, K, O = 'Genomgang.html?del=', 'Kortfilmer.html?del=', 'Formelstod_och_ovningar.html?del='
BILDSPEL38 = '../../bildspel/?d=v38_01_Franskiljning_och_matteknik'
DAGAR40 = [
    {'id': 'mandag', 'dag': 'Måndag 28/9', 'typ': 'Lektion', 'tid': '09.00–11.00', 'start': '2026-09-28T00:00', 'rubrik': 'Del 1: frånskiljning, sedan del 2: sinus', 'pass': [
        ('Pass 1', 'Frånskiljning och mätteknik: de fem stegen, alla matningsvägar, instrumentval och felgräns. Film: Fem steg. Övning 1.1 och 1.2 i par.'),
        ('Pass 2', 'Del 2 Sinus och mätvärden: teori och exempel tillsammans, sedan övning 2.1–2.3.'),
        ('Sist', 'Skicka resultat med QR-koden.'),
     ], 'material': [('Mandag_28_sep_vecka40.pptx', 'Dagens presentation (PowerPoint)'), ('Mandag_28_sep_vecka40.pdf', 'Dagens presentation (PDF)'),
                     (BILDSPEL38, 'Bildspel: Frånskiljning och mätteknik'), (V38 + 'Elevuppgifter.html', 'Övning 1.1–1.4'), (G + 'sinus', 'Del 2: sinus'), (K + 'sinus', 'Film del 2')]},
    {'id': 'mandag-hemma', 'dag': 'Måndag eftermiddag och tisdag förmiddag', 'typ': 'Hemma', 'start': '2026-09-28T11:00', 'steg': [
        steg('Del 2 · Övningar', 'Fortsätt med övning 2.4–2.10', G + 'sinus&uppgift=v40_01-q4', 75, 'läs teorin som ledtråd 1 pekar på, räkna och jämför med facit', 'v40_01:4-10'),
        steg('Del 1 · Övningar', 'Övning 1.3 och 1.4', V38 + 'Elevuppgifter.html#v2-3', 20, 'skriv metod och motivering'),
     ], 'fore': ('Före tisdagens lektion', 'Övning 2.1–2.10 är bearbetade; ta med uppgifter som behöver hjälp. Du kan räkna periodtid, toppvärde och effektivvärde. Skriv ner det du inte förstod.')},
    {'id': 'tisdag', 'dag': 'Tisdag 29/9', 'typ': 'Lektion', 'tid': '15.00–17.00', 'start': '2026-09-29T14:00', 'rubrik': 'Del 3: spole, motstånd och ström', 'pass': [
        ('Pass 1', 'Dina frågor från del 2. Del 3: teori och exempel tillsammans.'),
        ('Pass 2', 'Övning 3.1–3.4. Påbörja inlämning 4.'),
        ('Sist', 'Skicka resultat med QR-koden.'),
     ], 'material': [(G + 'impedans', 'Del 3: spole'), (K + 'impedans', 'Film del 3'), (O + 'v40_02', 'Övning 3.1–3.10'), ('Inlamning.html#uppgift-1', 'Inlämning 4')]},
    {'id': 'onsdag', 'dag': 'Tisdag kväll och onsdag 30/9', 'typ': 'Hemma', 'start': '2026-09-29T17:00', 'steg': [
        steg('Del 3 · Övningar', 'Följ exemplet och gör övning 3.5–3.10', G + 'impedans&avsnitt=exempel', 55, 'fortsätt på delsidan: exempel först, sedan övningarna', 'v40_02:5-10'),
        steg('Del 1 · Inlämning', 'Inlämning 1–3', V38 + 'Inlamning.html', 45, 'D räknas där ur ditt namn, ett annat tal än D i växelströmsuppgifterna'),
     ], 'fore': ('Före fredagens lektion', 'Övning 3.1–3.10 är klara. Inlämning 1–3 är skriven.')},
    {'id': 'torsdag', 'dag': 'Torsdag 1/10', 'typ': 'Hemma', 'start': '2026-10-01T00:00', 'steg': [
        steg('Del 4 · Teori, exempel och övningar', 'Effekt och effektfaktor, till och med övning 4.6', G + 'effekt', 70, 'läs teorin och exemplen, stanna efter övning 4.6', 'v40_03:1-6'),
        steg('Del 4 · Film', 'Samma aktiva effekt, olika ström', K + 'effekt', 5, '2 min, svensk text'),
        steg('Inlämning', 'Inlämning 4 och 5', 'Inlamning.html#uppgift-1', 40, 'skriv svaren i rutorna, de följer med i QR-koden'),
     ], 'fore': ('Före fredagens lektion', 'Du har läst del 4 och gjort övning 4.1–4.6. Ta med dina frågor. Labben på fredag bygger på del 2–4.')},
    {'id': 'fredag', 'dag': 'Fredag 2/10', 'typ': 'Lektion', 'tid': '09.00–11.00', 'start': '2026-10-02T00:00', 'rubrik': 'Del 4 och labben', 'pass': [
        ('Pass 1', 'Dina frågor från del 4. Övning 4.7–4.10 tillsammans.'),
        ('Pass 2', 'Labb: växelströmslabbet, guidad. Alla åtta uppgifter. Veckans sista steg.'),
        ('Sist', 'Skicka resultat med QR-koden, nu med labbprotokollet.'),
     ], 'material': [(O + 'v40_03#v40_03-q7', 'Övning 4.7–4.10'), (LABB['ac'] + '?lage=guidad', 'Labb: växelströmslabbet, guidad'), ('Resultat.html', 'Skicka resultat')]},
    {'id': 'helgen', 'dag': 'Fredag eftermiddag och helgen', 'typ': 'Hemma', 'start': '2026-10-02T11:00', 'steg': [
        steg('Labb', 'Gör klart labbet', LABB['ac'] + '?lage=guidad', 30, 'de uppgifter du inte hann på fredagen'),
        steg('Inlämning', 'Inlämning 6 och 7', 'Inlamning.html#uppgift-3', 45, 'inlämning 7 är protokollet från labbet'),
        steg('Inlämning', 'Lämna in inlämning 1–7', '#inlamning', 10, 'frånskiljning 1–3 och växelström 4–7, via den inlämningskanal läraren har anvisat'),
        steg('Skicka resultat', 'QR-koden', 'Resultat.html', 5, 'skriv ditt namn, ta en skärmbild och skicka den till läraren'),
     ], 'fore': ('Senast söndag 4 oktober', 'Båda inlämningarna är inlämnade och du har skickat resultatet med QR-koden.')},
]
VECKOR[40]['dagar'] = DAGAR40
SLUT40 = '2026-10-05T00:00'  # därefter visar planen att veckan är klar


def tid(minuter):
    h, m = divmod(int(5 * round(minuter / 5)), 60)
    return f'cirka {h} h {m} min' if h and m else (f'cirka {h} h' if h else f'cirka {m} min')


def dagplan(nr):
    """Veckans plan dag för dag: kort om lektionen, steg för steg hemma med tid och en tydlig ”Före nästa lektion”."""
    kort = []
    for d in VECKOR[nr]['dagar']:
        hid = f'{d["id"]}-rubrik'
        if d['typ'] == 'Lektion':
            pass_ = ''.join(f'<li><strong>{escape(t)}.</strong> {escape(x)}</li>' for t, x in d['pass'])
            mat = ' · '.join(f'<a href="{h}">{escape(t)}</a>' for h, t in d['material'])
            kort.append(f'<section class="dag lektion" id="{d["id"]}" data-start="{d["start"]}" aria-labelledby="{hid}"><h3 id="{hid}"><span class="dag-namn">{escape(d["dag"])}</span> <span class="dag-typ">Lektion {d["tid"]}</span></h3>'
                        f'<p class="dag-rubrik">{escape(d["rubrik"])}</p><ul class="dag-pass">{pass_}</ul><p class="dag-material"><strong>Öppna på lektionen:</strong> {mat}</p></section>')
            continue
        rader = []
        for i, s in enumerate(d['steg'], 1):
            sid = f'{d["id"]}-{i}'
            ov = f' data-ovningar="{s["ovningar"]}"' if s['ovningar'] else ''
            text = f' · {escape(s["text"])}' if s['text'] else ''
            rader.append(f'<li data-steg="{sid}"{ov}><div class="steg-text"><span class="kind">{escape(s["kind"])}</span><a href="{s["href"]}">{escape(s["titel"])}</a>'
                         f'<small>{s["min"]} min{text}</small><span class="steg-framsteg" aria-live="polite"></span></div>'
                         f'<span class="klar-ruta" data-status="{sid}"></span></li>')
        fore_t, fore = d['fore']
        total = tid(sum(s['min'] for s in d['steg']))
        kort.append(f'<section class="dag hemma" id="{d["id"]}" data-start="{d["start"]}" aria-labelledby="{hid}"><h3 id="{hid}"><span class="dag-namn">{escape(d["dag"])}</span> <span class="dag-typ">Hemma, {total}</span></h3>'
                    f'<p class="dag-status" aria-live="polite"></p><ol class="dag-steg">{"".join(rader)}</ol><p class="dag-fore"><strong>{escape(fore_t)}:</strong> {escape(fore)}</p></section>')
    return (f'<section class="dagplan" id="dagplan" aria-labelledby="dagplan-rubrik" data-slut="{SLUT40}"><h2 id="dagplan-rubrik">Veckan dag för dag</h2>'
            '<p>Följ arbetsgången i arbetsrummet. Status hämtas från det du har läst och försökt besvara; den kan inte bockas av manuellt.</p>'
            + ''.join(kort) + '</section>')


KIND = {'ppt': 'Presentation', 'genomgång': 'Genomgång', 'läs': 'Läs', 'artikel': 'Artikel', 'övning': 'Övningar', 'labb': 'Labb', 'film': 'Film', 'mall': 'Mall'}


def datum(iso, år=False):
    y, m, d = map(int, iso.split('-'))
    return f'{d} {MONTHS[m - 1]}' + (f' {y}' if år else '')


def post(p, week_dir, steg=None):
    if p['typ'] == 'ppt':
        stem = p['fil'][:-5]
        pdf = stem + '.pdf'
        extra = f" · {escape(p['extra'])}" if p['extra'] else ''
        pdf_link = f' · <a href="{pdf}">PDF</a>' if (week_dir / pdf).exists() else ''
        did = Path(stem).name.removesuffix('_elev')
        n = f"{p['bilder']} {'bild' if p['bilder'] == 1 else 'bilder'}"
        if (ROOT / 'bildspel' / did / 'data.json').exists():
            kind = f'Steg {steg} · Bildspel' if steg else 'Bildspel'
            return (f'<li><span class="kind">{kind}</span><a href="../../bildspel/?d={did}">{escape(p["titel"])}</a>'
                    f'<small>{n}{extra} · <a href="{p["fil"]}">PowerPoint</a>{pdf_link}</small></li>')
        return (f'<li><span class="kind">Presentation</span><a href="{p["fil"]}">{escape(p["titel"])}</a>'
                f'<small>PowerPoint · {n}{extra}{pdf_link}</small></li>')
    if p.get('deck'):
        stem = p['deck'][:-5]
        pdf = f' · <a href="{stem}.pdf">PDF</a>' if (week_dir / f'{stem}.pdf').exists() else ''
        p = {**p, 'html': f'Bäst att läsa på egen hand. Till lektionen eller utskrift: <a href="../../bildspel/?d={stem.removesuffix("_elev")}">bildspel</a> ({p["bilder"]} bilder) · <a href="{p["deck"]}">PowerPoint</a>{pdf}'}
    # Kursens markering X_{L} blir nedsänkt index (som i innehall/lib/text.py).
    text = p.get('html') or re.sub(r'_\{([^{}]*)\}', r'<sub>\1</sub>', escape(p['text']))
    small = f'<small>{text}</small>' if text else ''
    kind = f'Steg {steg} · {KIND[p["typ"]]}' if steg else KIND[p['typ']]
    return f'<li><span class="kind">{kind}</span><a href="{p["href"]}">{escape(p["titel"])}</a>{small}</li>'


def first_href(del_):
    p = (del_.get('steg') or del_['poster'])[0]
    return p.get('fil') or p['href']


def veckoplan(nr, w, n, delsidor):
    """Veckans plan från vecka 41: vad eleven gör på varje lektion (måndag, tisdag, fredag) och hemma mellan dem.
    Övning d.1–d.5 görs på lektionen och d.6–d.10 hemma (samma delning som presentationernas pass). Den del av planen
    som gäller just nu markeras med ”Nu”."""
    import datetime as dt
    mandag = dt.date.fromisoformat(w['datum'][0])
    dag = lambda k: mandag + dt.timedelta(days=k)
    fmt = lambda d: f'{d.day}/{d.month}'
    svar = nr in _inl.SVARSRUTOR
    del_ = lambda i: f'<a href="Del_{i}.html">del {i}</a>' if delsidor else f'del {i}'
    kontroll = lambda i: f', sedan <a href="Del_{i}.html#kontroll">kontrollfrågorna</a>' if svar else ''
    inl = 'Skriv svaren i rutorna på <a href="Inlamning.html">inlämningssidan</a>.' if svar else 'Börja på <a href="Inlamning.html">inlämningen</a>.'
    skicka = ' Skapa QR-koden på <a href="Resultat.html">Skicka resultat</a> och bifoga den.' if svar else ''
    steg = [
        (f'{dag(0).isoformat()}T00:00', f'Måndag {fmt(dag(0))}', 'Lektion 09.00–11.00', f'Presentationen för {del_(1)}. Övning 1.1–1.5 i klassen.'),
        (f'{dag(0).isoformat()}T11:00', 'Måndag eftermiddag och tisdag förmiddag', 'Hemma', f'Övning 1.6–1.10 på {del_(1)}{kontroll(1)}. Använd ledtrådarna innan du öppnar facit.'),
        (f'{dag(1).isoformat()}T14:00', f'Tisdag {fmt(dag(1))}', 'Lektion 15.00–17.00', f'Presentationen för {del_(2)}. Övning 2.1–2.5 i klassen.'),
        (f'{dag(1).isoformat()}T17:00', 'Tisdag kväll, onsdag och torsdag', 'Hemma', f'Övning 2.6–2.10 på {del_(2)}{kontroll(2)}. {inl}'),
        (f'{dag(4).isoformat()}T00:00', f'Fredag {fmt(dag(4))}', 'Lektion 09.00–11.00', f'Presentationen för {del_(n)}, sedan <a href="#labb">labben</a>.'),
        (f'{dag(4).isoformat()}T11:00', 'Fredag eftermiddag och helgen', 'Hemma', f'Övning {n}.6–{n}.10 på {del_(n)}{kontroll(n)}. Gör klart labbprotokollet och inlämningen. Skicka mejlet senast söndag {datum(w["sista"])}.{skicka}'),
    ]
    rader = ''.join(f'<li data-start="{s0}"><span class="plan-nar"><b>{escape(d)}</b> {escape(t)}</span><span class="plan-vad">{x}</span></li>' for s0, d, t, x in steg)
    return ('<style>.veckoplan{margin:0 0 26px}.veckoplan h2{font-size:22px;margin:0 0 8px}.veckoplan ol{list-style:none;margin:0;padding:0;border-top:1px solid #cad8e2}'
            '.veckoplan li{display:grid;grid-template-columns:minmax(11em,15em) 1fr;gap:4px 16px;padding:10px 8px;border-bottom:1px solid #cad8e2}'
            '.veckoplan .plan-nar{color:#4d6579;font-size:15px}.veckoplan .plan-nar b{display:block;color:#163248}'
            '.veckoplan li.nu{border:2px solid #064f91;border-radius:10px;background:#fff}.veckoplan li.nu .plan-nar b::before{content:"Nu · ";color:#064f91}'
            '@media(max-width:640px){.veckoplan li{grid-template-columns:1fr}}</style>'
            f'<section class="veckoplan" aria-labelledby="veckoplan"><h2 id="veckoplan">Veckans plan</h2><ol>{rader}</ol></section>'
            '<script>(function(){var t=new Date(),r=[].slice.call(document.querySelectorAll(".veckoplan li[data-start]")),nu=null;'
            'r.forEach(function(x){if(new Date(x.dataset.start)<=t)nu=x;});var slut=new Date(r[r.length-1].dataset.start);slut.setDate(slut.getDate()+3);'
            'if(nu&&t<slut)nu.classList.add("nu");})();</script>')


def page(nr, w):
    if nr == 40:
        from arbetsvecka40 import page as workspace_page
        return workspace_page(w, dagplan(nr))
    week_dir = ROOT / f'vecka-{nr}' / 'aktuell'
    start, end = w['datum']
    labbar, sedda, delar_ = list(w.get('labbar', [])), set(), []
    for d in w['delar']:
        items = []
        for p in d.get('poster', []):
            if p['typ'] == 'labb':
                if p['href'] not in sedda:
                    sedda.add(p['href']); labbar.append(p)
            else:
                items.append(p)
        delar_.append((d, items))
    n = len(delar_)
    def innehall(d, items):
        # Vägläge: tre steg (genomgång, film, övningar) och resten under Mer.
        if d.get('steg'):
            mer = ''.join(post(p, week_dir) for p in d.get('mer', []))
            mer = f'<details class="week-more"><summary>Mer att läsa</summary><ul class="lesson-items">{mer}</ul></details>' if mer else ''
            return f'<ol class="lesson-items route-steps">{"".join(post(p, week_dir, k) for k, p in enumerate(d["steg"], 1))}</ol>{mer}'
        return f'<ul class="lesson-items">{"".join(post(p, week_dir) for p in items)}</ul>'
    # Från vecka 41: varje del har en egen sida som vecka 40 (Del_N.html: översikt, teori, exempel, övningar med ledtrådar och facit).
    delsida = lambda i: nr >= 41 and (week_dir / f'Del_{i}.html').exists()
    delar = ''.join(
        f'<li id="del-{i}"><span class="lesson-number" aria-hidden="true">{i}</span><div><h3>Del {i}. {escape(d["titel"])}</h3>'
        f'<p>{escape(d["mal"])}</p>'
        + (f'<p><a class="sj-btn primary" href="Del_{i}.html">Öppna del {i}: teori, exempel och övningar</a></p>'
           f'<p class="del-framsteg" data-prefix="v{nr}_0{i}-q" aria-live="polite"></p>'
           f'<details class="week-more"><summary>Allt material i del {i}</summary>{innehall(d, items)}</details>' if delsida(i) else innehall(d, items))
        + '</div></li>'
        for i, (d, items) in enumerate(delar_, 1))
    if labbar:
        delar += (f'<li id="labb" class="lab-step"><span class="lesson-number" aria-hidden="true">{n + 1}</span><div><h3>Sist: labben</h3>'
                  f'<p>Gör labben när du har gått igenom del 1–{n} och övningarna. Labben bygger på det du har lärt dig och är veckans avslutning.</p>'
                  f'<ul class="lesson-items">{"".join(post(p, week_dir) for p in labbar)}</ul></div></li>')
    redovisa = ''.join(f'<li><a href="Inlamning.html#{a}">{escape(n)}. {escape(t)}</a></li>' for a, n, t in INLAMNING[nr])
    # Veckor med resultatkod: eleven skickar resultaten som QR-kod sist i varje lektion (vecka-XX/aktuell/Resultat.html).
    skicka = '<p><a class="sj-btn primary" href="Resultat.html">Skicka resultat (QR-kod)</a></p><p>Gör det sist varje lektion: skriv ditt namn, ta en skärmbild av koden och skicka den till läraren.</p>' if nr in RESULTATKOD else ''
    lamna = 'Lämna via den inlämningskanal läraren har anvisat.'
    formelsamling = '<li><a href="../../gemensamt/Formelsamling.pdf">Formelsamling för hela kursen (PDF)</a></li>' if nr >= 41 else ''
    if nr >= 41:  # från vecka 41: inlämning med e-post till läraren (verktyg/inlamning/bygg.py har samma adress)
        skicka = epost_knapp(nr, w.get('vecka', nr))
        lamna = f'Skicka allt i ett mejl till <a href="mailto:{EPOST}">{EPOST}</a>.'
    fordj = ''
    if w['fordjupning']:
        fordj = ('<h3>Fördjupning, frivillig</h3><ul class="lesson-items">'
                 + ''.join(post(p, week_dir) for p in w['fordjupning']) + '</ul>')
    notis = f'<p class="sj-panel warn week-note">{escape(w["notis"])}</p>' if w.get('notis') else ''
    vag = bool(w['delar'][0].get('steg'))
    intro = ('Varje del har tre steg: genomgång, film och övningar. Gör dem i ordning. Labben kommer sist, när du har gått igenom del 1–%d.' % n
             if vag else 'Gå igenom delarna i ordning: bildspel och genomgång, film och övningar med facit. Labben kommer sist, när du har materialet klart för dig.')
    startlank = first_href(w['delar'][0]) if vag else '#del-1'
    slaupp = ''.join(f'<li><a href="{p["href"]}">{escape(p["titel"])}</a></li>' for p in w.get('slaupp', []))
    vn = w.get('vecka', nr)  # veckan eleven ser (mappnamnet ändras aldrig)
    flytt = w.get('flyttad')
    kicker = f'Vecka {vn} · {flytt["dag"]} 2026' if flytt else f'Vecka {vn} · {datum(start)}–{datum(end, True)}'
    rubrik = f'Vecka {vn}, {flytt["dag"]}: {w["titel"]}' if flytt else f'Vecka {vn}: {w["titel"]}'
    due = f'<p class="week-due"><strong>Inlämning senast söndag {datum(w["sista"])}.</strong> <a href="Inlamning.html">Se vad du lämnar in</a></p>'
    actions = f'<p class="course-actions"><a class="sj-btn primary large" href="{startlank}">Börja med del 1: {escape(w["delar"][0]["titel"])}</a></p>'
    plan, script, rubrik_ordning, forst = '', '', 'Arbeta i den här ordningen', ''
    if flytt:
        # Materialet har inte undervisats än: det ingår i vecka 40 och börjar måndagens lektion. Filerna ligger kvar här.
        intro = (f'<p class="sj-panel week-note flyttad"><strong>Det här ingår nu i vecka 40.</strong> Vi går igenom frånskiljning och mätteknik på lektionen '
                 f'{flytt["dag"]}, och du fortsätter hemma enligt veckans plan dag för dag. Materialet nedan ligger kvar här, och vecka 40 länkar hit.</p>')
        due = f'<p class="week-due"><strong>Inlämning senast söndag {datum(w["sista"])}</strong>, tillsammans med vecka 40. <a href="Inlamning.html">Se vad du lämnar in</a></p>'
        actions = f'<p class="course-actions"><a class="sj-btn primary large" href="{flytt["href"]}">Till vecka 40: planen dag för dag</a></p>'
    if w.get('dagar'):
        # Vecka med plan dag för dag: dagplan.mjs visar vad som gäller nu och nästa steg, och sparar avbockningen.
        intro = 'Lektion måndag, tisdag och fredag. Onsdag, torsdag och helgen arbetar du hemma. Följ planen dag för dag.'
        d0 = w['dagar'][0]
        actions = (f'<div class="nu-panel" id="nu" aria-live="polite"><p class="nu-etikett">Börja här</p><p class="nu-rubrik">{escape(d0["dag"])}: {escape(d0["rubrik"])}</p>'
                   f'<p class="nu-knapp"><a class="sj-btn primary large" href="#{d0["id"]}">Se planen för {escape(d0["dag"].split()[0].lower())}</a></p></div>')
        inl38 = ', '.join(f'{escape(x)}' for _, x, _t in INLAMNING[38])
        due = (f'<p class="week-due"><strong>Inlämning senast söndag {datum(w["sista"])}:</strong> <a href="../../vecka-38/aktuell/Inlamning.html">Inlämning 1–{len(INLAMNING[38])}: Frånskiljning och mätteknik</a> '
               f'och <a href="Inlamning.html">Inlämning {len(INLAMNING[38]) + 1}–{len(INLAMNING[38]) + len(INLAMNING[nr])}: Växelström</a>.</p>')
        plan = dagplan(nr)
        script = f'<script type="module" src="dagplan.mjs?v={DAGPLAN_V}"></script>'
        rubrik_ordning = 'Allt material, del för del'
        f = w['forst']
        mer = ''.join(post(p, week_dir) for p in f.get('mer', []))
        forst = (f'<li id="franskiljning" class="forst"><span class="lesson-number" aria-hidden="true">M</span><div><h3>Måndag först: {escape(f["titel"])}</h3><p>{escape(f["mal"])}</p>'
                 f'<ol class="lesson-items route-steps">{"".join(post(p, week_dir, k) for k, p in enumerate(f["steg"], 1))}</ol>'
                 f'<details class="week-more"><summary>Mer att läsa</summary><ul class="lesson-items">{mer}</ul></details></div></li>')
        redovisa = ('<li><a href="Inlamning.html">Växelström</a><ul>' + redovisa + '</ul></li><li><a href="../../vecka-38/aktuell/Inlamning.html">Frånskiljning och mätteknik</a><ul>'
                    + ''.join(f'<li><a href="../../vecka-38/aktuell/Inlamning.html#{a}">{escape(n)}. {escape(t)}</a></li>' for a, n, t in INLAMNING[38]) + '</ul></li>')
    pres, sjalv = '', ''
    if nr >= 41 and not flytt:
        # Från vecka 41: presentationerna först (samma princip som vecka 40), sedan lösningar och självhjälp del för del.
        rader = []
        # Lektionerna är måndag, tisdag och fredag (samma tider som vecka 40): del 1 måndag, del 2 tisdag, del 3 fredag.
        import datetime as _dt
        mandag = _dt.date.fromisoformat(w['datum'][0])
        lektion = {1: (0, 'Måndag', '09.00–11.00'), 2: (1, 'Tisdag', '15.00–17.00'), 3: (4, 'Fredag', '09.00–11.00')}
        for i, (d, items) in enumerate(delar_, 1):
            for q in items + d.get('steg', []):
                if q['typ'] == 'ppt':
                    stem = q['fil'][:-5]
                    oppna = stem + '.pdf' if (week_dir / (stem + '.pdf')).exists() else q['fil']
                    los = f' <a class="pres-los" href="Del_{i}.html#ovningar">Övningar och facit</a>' if delsida(i) else ''
                    dag = lektion.get(i)
                    ld = mandag + _dt.timedelta(days=dag[0]) if dag else None
                    nar = f'<span class="pres-nar">{dag[1]} {ld.day}/{ld.month} · {dag[2]}</span>' if dag else ''
                    attr = f' data-dag="{ld.isoformat()}"' if dag else ''
                    rader.append(f'<li{attr}><span class="pres-del">Del {i}</span><span class="pres-titel">{nar}{escape(q["titel"])}{los}</span>'
                                 f'<span class="pres-knappar"><a class="sj-btn primary" href="{oppna}">Öppna</a> <a class="sj-btn" href="{q["fil"]}" download>PowerPoint</a></span></li>')
        pres = ('<style>.week-pres{margin:22px 0 26px;padding:20px 22px;border:2px solid #064f91;border-radius:12px;background:#edf4f9}'
                '.week-pres h2{margin:0 0 6px;font-size:26px}.week-pres ul{list-style:none;margin:12px 0 0;padding:0}'
                '.week-pres li{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:10px 0;border-top:1px solid #cad8e2}'
                '.week-pres .pres-del{font-weight:700;color:#064f91;min-width:3.4em}.week-pres .pres-titel{flex:1 1 14em;font-size:18px}'
                '.week-pres .pres-knappar{display:flex;gap:10px}.week-pres .pres-los{display:block;font-size:15px;margin-top:2px}'
                '.week-pres .pres-nar{display:block;font-size:14px;font-weight:700;color:#4d6579;letter-spacing:.02em}'
                '.week-pres li.idag{margin:0 -12px;padding:12px;border:2px solid #064f91;border-radius:10px;background:#fff}'
                '.week-pres li.idag .pres-nar{color:#064f91}.week-pres .pres-klart{margin:14px 0 0;padding-top:12px;border-top:1px solid #cad8e2}</style>'
                f'<section class="week-pres" aria-labelledby="presentationer"><h2 id="presentationer">Veckans presentationer</h2>'
                f'<p>Lektioner måndag 09.00–11.00, tisdag 15.00–17.00 och fredag 09.00–11.00. Läraren visar dagens presentation på lektionen. Öppna den, eller ladda ner PowerPoint.</p><ul>{"".join(rader)}</ul>'
                f'<p class="pres-klart"><strong>Klart senast söndag {datum(w["sista"])}:</strong> övningarna i del 1–{n}, labben och <a href="Inlamning.html">inlämningen</a> med e-post till läraren.</p></section>'
                # Dagens lektion (eller nästa lektion i veckan) lyfts fram. Utan JavaScript visas listan som den är.
                '<script>(function(){var d=new Date(),t=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");'
                'var r=[].slice.call(document.querySelectorAll(".week-pres li[data-dag]"));if(!r.length||t<r[0].dataset.dag||t>r[r.length-1].dataset.dag)return;'
                'var n=r.filter(function(x){return x.dataset.dag>=t})[0];if(!n)return;n.classList.add("idag");var s=n.querySelector(".pres-nar");'
                'if(s)s.textContent=(n.dataset.dag===t?"Idag · ":"Nästa lektion · ")+s.textContent;})();</script>')
        pres += veckoplan(nr, w, n, delsida(1))
        forsta = '' if delsida(1) else actions  # delsidorna har egna knappar och ”Nästa” visar var eleven ska fortsätta
        sjalv = ('<p>Varje del har en egen sida: översikt, teori, exempel och övningar med ledtrådar och facit. Gör delarna i ordning. Labben kommer sist.</p>' if delsida(1)
                 else '<p>Varje del har bildspel, övningar med ledtrådar och facit, och film. Gör dem i ordning. Labben kommer sist.</p>') + forsta
        rubrik_ordning = 'Lösningar och självhjälp'
        actions = ''
        # Framsteg per del ur avbockningarna på delsidorna (samma nyckel i webbläsaren). Första ofärdiga delen markeras.
        sjalv += ('<style>.del-framsteg{margin:4px 0 8px;font-weight:700;color:#4d6579}.del-framsteg.klar{color:#176844}'
                  '.del-framsteg .nasta{display:inline-block;margin-left:8px;padding:2px 10px;border-radius:999px;background:#064f91;color:#fff;font-size:14px}</style>'
                  '<script>addEventListener("DOMContentLoaded",()=>{let k={};try{k=JSON.parse(localStorage.getItem("sj-ovningar:/sjoskolan/vecka-' + str(nr)
                  + '/aktuell/Formelstod_och_ovningar.html")||"{}")||{};}catch{}let nasta=false;'
                  'for(const el of document.querySelectorAll(".del-framsteg")){const n=Object.keys(k).filter(x=>k[x]&&x.startsWith(el.dataset.prefix)).length;'
                  'el.textContent=n>=10?"✓ Alla 10 övningar klara":n+" av 10 övningar klara";el.classList.toggle("klar",n>=10);'
                  'if(n<10&&!nasta){nasta=true;el.insertAdjacentHTML("beforeend",\'<span class="nasta">Nästa</span>\');}}});</script>')
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(rubrik)} · Sjöskolan</title><meta name="description" content="{escape(w["mal"])}"><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{nr}/aktuell/"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v={V}"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}"><script defer src="/sjoskolan/downloads.js?v=20260924-1"></script><script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script>{script}</head><body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/bildspel/">Bildspel</a></nav><main id="main-content" class="course-main">
<header class="course-heading week-heading"><p class="course-kicker">{escape(kicker)}</p><h1>{escape(w["titel"])}</h1>{intro if flytt else ''}<p class="course-lead">{escape(w["mal"])}</p>{'' if flytt or pres else f'<p>{intro}</p>'}{pres}{actions}{due}</header>
{notis}{plan}<div class="week-grid"><section aria-labelledby="ordning"><h2 id="ordning">{rubrik_ordning}</h2>{sjalv}<ol class="lesson-list">{forst}{delar}</ol></section>
<aside class="week-aside" aria-labelledby="grundarbete"><h2 id="grundarbete">Veckans grundarbete</h2><h3 id="inlamning">Du redovisar</h3><p><a class="sj-btn primary" href="Inlamning.html">Veckans inlämningsuppgifter</a></p><ul>{redovisa}</ul>{skicka}<p>Övningarna är träning. Kontrollera dina svar mot facit under varje övning.</p><p><strong>Senast söndag {datum(w["sista"])}.</strong> {lamna}</p>{fordj}<h3>Att slå upp</h3><ul class="plain">{slaupp}{formelsamling}<li><a href="../../gemensamt/Raknehjalp.html">Räknarhjälp: RAD eller DEG, mH och µF</a></li><li><a href="../../gemensamt/Formelblad_och_begrepp.html">Formelblad och begrepp</a></li><li><a href="../../gemensamt/Underlagskort.html">Instrument- och komponentkort</a></li><li><a href="../../tentamen.html">Tentamen och övningstenta</a></li></ul></aside></div>
<p class="course-download-note">Bildspelen öppnas direkt i webbläsaren, också i telefonen. Presentationerna finns även som PowerPoint och PDF. Nedladdade filer får datum och klockslag i filnamnet.</p>
</main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>
'''


if __name__ == '__main__':
    for nr, w in VECKOR.items():
        out = ROOT / f'vecka-{nr}' / 'aktuell' / 'index.html'
        out.write_text(page(nr, w), encoding='utf-8')
        print('skrev', out.relative_to(ROOT.parent))
