#!/usr/bin/env python3
"""Bygger inlämningsuppgifterna vecka-XX/aktuell/Inlamning.html ur UPPGIFTER nedan.

Varje uppgift går att lösa med veckans genomgång och labbar. Egna värden styrs av elevens tal D
(dagen i månaden eleven är född, 1–31), så att två elever inte får samma siffror.

    python3 sjoskolan/verktyg/inlamning/bygg.py
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
V = '20260927'
MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']


def u(titel, anvand, text, delar, redovisa):
    return {'titel': titel, 'anvand': anvand, 'text': text, 'delar': delar, 'redovisa': redovisa}


L = {  # länkar som återkommer
    'formel': ('../../gemensamt/Formelblad_och_begrepp.html', 'Formelbladet'),
    'mm': ('../../multimetersimulator/', 'Multimeterlabbet'),
    'ac': ('../../vaxelstromslabbet/', 'Växelströmslabbet'),
    'tre': ('../../trefaslabbet/', 'Trefaslabbet'),
    'hall': ('../../hallkretslabbet/', 'Hållkretslabbet'),
    'iso': ('../../isolationslabbet/', 'Isolationslabbet'),
    'kort': ('../../gemensamt/Underlagskort.html', 'Instrument- och komponentkort'),
}

UPPGIFTER = {
    37: {'titel': 'Elens grunder och elsäkerhet', 'sista': '2026-09-13', 'uppgifter': [
        u('Arbetslampans strömväg', [('01A_Elens_grunder/Elens_grunder.html', 'Elens grunder steg för steg'), ('01B_Elsakerhet_och_riskbedomning/Lampkretsen_bildguide.html', 'Lampkretsen: delar och symboler')],
          'En arbetslampa ombord matas från ett 24 V-batteri via en brytare och en säkring. Lampans glödtråd har resistansen (40 + D) Ω när den lyser.',
          ['Rita kretsen med batteri, säkring, brytare, lampa och återledare. Markera strömvägen med pilar.',
           'Beräkna strömmen och effekten med ditt värde på resistansen.',
           'Återledaren får ett avbrott. Markera var i ritningen och förklara vad som händer med strömmen.',
           'Du mäter 24 V mellan batteriets poler. Förklara varför det inte bevisar att lampan fungerar eller att kretsen är säker.'],
          'Ritning, beräkning med givna värden, samband, insättning och svar med enhet, och förklaringar med egna ord.'),
        u('Två lampor parallellt', [('01A_Elens_grunder/Elens_grunder.html', 'Elens grunder, avsnitt 8'), L['formel']],
          'Två lampor sitter parallellt över 24 V. Lampa A har 60 Ω och lampa B har (100 + D) Ω.',
          ['Beräkna strömmen i varje gren och den totala strömmen från batteriet.',
           'Beräkna effekten i varje lampa. Vilken lyser starkast, och varför?',
           'Ledaren till lampa B bryts. Vilken ström går nu från batteriet?',
           'Den gemensamma återledaren bryts i stället. Vad händer då med båda lamporna?'],
          'Beräkningar med enhet och en mening som förklarar varje svar.'),
        u('Riskbedömning av en länspump', [('01B_Elsakerhet_och_riskbedomning/Elsakerhet_steg_for_steg.html', 'Elsäkerhet steg för steg'), ('01B_Elsakerhet_och_riskbedomning/Riskbedomning_mall.html', 'Mall för riskbedömning')],
          'En sladdansluten länspump i en fuktig skans har en synligt skadad kabel vid införingen i pumpen. Pumpen behövs för att hålla skansen länsad.',
          ['Fyll i mallen: observation, fara, möjlig händelse och konsekvens.',
           'Skriv vilket beslut som tas nu och vem som tar det.',
           'Föreslå en direkt åtgärd och en förebyggande åtgärd, och hur länsningen säkras under tiden.',
           'Skilj på vad du har observerat och vad du antar.'],
          'Ifylld riskbedömningsmall med egna formuleringar.'),
    ]},
    38: {'titel': 'Frånskiljning och mätteknik', 'sista': '2026-09-20', 'uppgifter': [
        u('De fem stegen för ett verkligt fall', [('v38_01_Franskiljning_och_matteknik_elev.pdf', 'Frånskiljning och mätteknik (PDF)'), ('../../filmer/#fem-steg', 'Film: Fem steg')],
          'En fläkt i maskinrummet ska bytas. Den matas från grupp 7 i fördelning D3. Fläktens styrkort matas dessutom från en UPS.',
          ['Beskriv de fem stegen för just detta fall: vad du gör, var, och hur det verifieras.',
           'Vilken matning är lätt att missa, och vad blir följden om den missas?',
           'Vilka uppgifter behöver du ur ritningar eller från ansvarig innan du kan börja? Skriv dem som frågor.'],
          'Steg för steg med motivering. Hitta inte på uppgifter som saknas, skriv dem som öppna frågor.'),
        u('Välj instrument och funktion', [L['kort'], ('Elevuppgifter.html', 'Elevuppgift V2-2')],
          'Använd instrumentkorten M1 och M2.',
          ['24 V DC över ett batteri.', '230 V AC 50 Hz i ett eluttag i en hytt.', 'Cirka 150 mA DC i en givarslinga.', 'Resistansen hos ett urkopplat motstånd märkt 4,7 kΩ.'],
          'För varje mätning: instrument, funktion, uttag, hur det ansluts och varför. Ange vilka mätningar M1 inte klarar.'),
        u('Instrumentets felgräns', [('v38_01_Franskiljning_och_matteknik_elev.pdf', 'Frånskiljning och mätteknik (PDF)'), L['formel']],
          'Ett instrument har specifikationen ±(0,8 % av visat värde + 2 siffror) och upplösningen 0,01 V. Det visar (23,50 + D/100) V.',
          ['Beräkna felgränsen och intervallet som det sanna värdet ligger i.',
           'Kravet är 24,0 V ±1 %. Kan du intyga att kravet är uppfyllt?',
           'Förklara skillnaden mellan upplösning och noggrannhet med ditt exempel.'],
          'Beräkning med enhet och en bedömning som jämför hela intervallet med kravet.'),
    ]},
    39: {'titel': 'Effekt, Kirchhoff och multimeter', 'sista': '2026-09-27', 'uppgifter': [
        u('Energibudget för ett 24 V-system', [('v39_01_Effekt_och_energi_elev.pdf', 'Effekt och energi (PDF)'), L['formel']],
          'Ett 24 V-system ombord matar under ett dygn: fem navigationsljus på 25 W vardera i 12 h, en radar som tar 6,0 A i 12 h och en länspump som tar (5 + D/10) A i 1,5 h.',
          ['Beräkna energin i Wh för varje last och totalt.',
           'Hur många Ah tas ur batteriet under dygnet?',
           'Radarn matas via en kabel med enkel längd 18 m och arean 4 mm² koppar. Beräkna spänningsfallet i volt och procent.',
           'Vilken last dominerar energin? Föreslå en åtgärd som minskar den.'],
          'Beräkningar med samband, insättning och enhet. Skilj på Wh och Ah.'),
        u('Mätaren påverkar kretsen', [L['mm'], ('v39_03_Multimeter_och_matfel_elev.pdf', 'Multimeter och mätfel (PDF)')],
          'Gör övningen ”Mätaren påverkar” i Multimeterlabbet.',
          ['Skriv din förutsägelse av spänningen innan du mäter, och varför.',
           'Skriv mätvärdet du fick.',
           'Beräkna vilken ingångsresistans som förklarar skillnaden mot det obelastade värdet. Använd den belastade spänningsdelaren.',
           'När är ett högohmigt instrument viktigt ombord? Ge ett exempel.'],
          'Förutsägelse, mätvärde, beräkning och förklaring.'),
        u('Multimeterlabbets protokoll', [L['mm']],
          'Gör övning 01–08 i Multimeterlabbet.',
          ['Spara mätprotokollet som PDF.',
           'Välj en övning där du först gjorde fel eller var osäker. Beskriv felet och vad som hade hänt med ett verkligt instrument.'],
          'Protokollet som PDF och en kort reflektion.'),
    ]},
    40: {'titel': 'Växelström', 'sista': '2026-10-04', 'uppgifter': [
        u('Egen sinusspänning', [('Genomgang.html?del=sinus', 'Genomgång del 1: sinus och mätvärden'), L['ac']],
          'Ställ Växelströmslabbet på en sinus med effektivvärdet (10 + D) V och frekvensen 50 Hz, eller 60 Hz om D är jämnt.',
          ['Räkna ut toppvärde, topp-till-topp-värde och period innan du tittar i labbet.',
           'Läs av samma storheter på oscilloskopet. Anteckna tidsaxel och skala.',
           'Jämför och förklara eventuella skillnader.'],
          'Beräkning före avläsning, avlästa värden och förklaring.'),
        u('Egen RL-last', [('Genomgang.html?del=impedans', 'Genomgång del 2: spole, motstånd och ström'), L['ac']],
          'En seriekrets har R = (20 + D) Ω och L = 0,10 H. Källan ger 230 V, 50 Hz.',
          ['Beräkna Xᴸ, |Z|, strömmen och fasvinkeln. Leder eller släpar strömmen?',
           'Ställ in samma värden i labbet och jämför.',
           'Förutsäg vad som händer med strömmen om frekvensen fördubblas. Kontrollera i labbet.'],
          'Beräkningar med enhet, avlästa värden och en förklaring till frekvensberoendet.'),
        u('Effekt och kompensering', [('Genomgang.html?del=effekt', 'Genomgång del 3: effekt och effektfaktor'), L['ac']],
          'En induktiv enfaslast tar P = (1,0 + D/10) kW vid 230 V med cos φ = 0,70.',
          ['Beräkna S, Q och strömmen.',
           'Hur stor kapacitiv reaktiv effekt behövs för att höja effektfaktorn till 0,95? Beräkna den nya strömmen.',
           'Ställ in lasten och kompenseringen i labbet och jämför.',
           'Hur mycket minskar förlusten i matningskabeln? Använd strömkvoten.'],
          'Beräkningar, avlästa värden och slutsats om ström och förlust.'),
    ]},
    41: {'titel': 'Trefas och laboration', 'sista': '2026-10-11', 'uppgifter': [
        u('Neutralström med egna laster', [('v41_01_Trefassystemets_grunder_elev.pdf', 'Trefassystemets grunder (PDF)'), L['tre']],
          'I Trefaslabbet, flik 1: 400 V, ström i L1 och L2 10 A, ström i L3 (5 + D/5) A avrundat till en decimal. Alla laster har samma cos φ.',
          ['Förutsäg neutralströmmen innan du tittar. Tips: tre lika strömmar ger summan noll.',
           'Läs av neutralströmmen i labbet och jämför.',
           'Rita visardiagrammet för dina tre strömmar.'],
          'Förutsägelse, avläst värde och visardiagram.'),
        u('Samma värmare i Y och Δ', [('v41_02_Y_och_trefaseffekt_elev.pdf', 'Y, Δ och trefaseffekt (PDF)'), (L['tre'][0] + '?flik=ydelta', 'Trefaslabbet, flik 3')],
          'Tre värmeelement på (20 + D) Ω ansluts till 400 V.',
          ['Beräkna grenspänning, grenström, linjeström och total effekt i Y.',
           'Samma beräkning i Δ.',
           'Kontrollera med labbets flik 3 och förklara varför effekten blir tre gånger så stor i Δ.'],
          'Beräkningar i tabellform och avlästa värden.'),
        u('Stationerna A, B och C', [('Simulerade_stationer.html', 'Simulerade stationer A, B och C'), ('Elevprotokoll.html', 'Elevprotokoll')],
          'Genomför stationerna enligt stationssidan.',
          ['Protokoll för Station A och Station C med en felmodul.',
           'Protokoll för Station B och en andra felmodul i Station C.',
           'Välj en mätning där uppmätt värde avvek från förväntat och förklara avvikelsen med dina siffror.'],
          'Protokollen som PDF och förklaringen.'),
    ]},
    42: {'titel': 'Elektriska risker och skydd', 'sista': '2026-10-18', 'uppgifter': [
        u('Riskbedömning före arbete', [('v42_03_Riskbedomning_och_skydd_elev.pdf', 'Riskbedömning och skydd (PDF)'), ('../../vecka-37/aktuell/01B_Elsakerhet_och_riskbedomning/Riskbedomning_mall.html', 'Mall för riskbedömning')],
          'En armatur i ett kylrum ombord ska bytas. Den matas från en grupp i en fördelning och har ett inbyggt nödljusbatteri. Golvet är fuktigt.',
          ['Fyll i riskbedömningen: fara, händelse, konsekvens, befintliga skydd och åtgärder.',
           'Välj arbetsmetod och motivera valet.',
           'Skriv vem som gör vad och hur varje åtgärd verifieras.',
           'Vilken energikälla är lätt att missa?'],
          'Ifylld mall med spårbara åtgärder.'),
        u('Rätt mätutrustning', [(L['mm'][0] + '?ovning=category', 'Multimeterlabbet: Välj CAT-klass'), ('v42_01_Elektriska_risker_elev.pdf', 'Elektriska risker (PDF)')],
          'Gör övningen ”Välj CAT-klass” i Multimeterlabbet.',
          ['Välj kategori och spänning för hela mätutrustningen på tre mätplatser: huvudtavlan 440 V, ett eluttag 230 V i en hytt och batteriet 24 V i en livbåt.',
           'Motivera varje val. Varför räcker det inte att bara instrumentet har rätt kategori?'],
          'Val och motivering för varje mätplats.'),
        u('Beröringsspänning i en modell', [('v42_01_Elektriska_risker_elev.pdf', 'Elektriska risker (PDF)'), L['formel']],
          'Skyddsledaren till en maskin är av och ett isolationsfel har gjort höljet spänningssatt: 230 V mot det jordade däcket.',
          ['Vilken beröringsspänning får en person som tar i höljet och står på däcket?',
           'Beräkna strömmen i en modell där kroppens resistans är (1 000 + 10 · D) Ω. Svara i mA.',
           'Varför kan modellen inte användas som säkerhetsgräns?',
           'Vilket skydd borde ha löst, och varför gjorde det kanske inte det när skyddsledaren är av?'],
          'Beräkning och resonemang.'),
    ]},
    43: {'titel': 'Komponenter, motorer och scheman', 'sista': '2026-10-25', 'uppgifter': [
        u('Motorns märkskylt', [('v43_02_Transformatorer_och_motorer_elev.pdf', 'Transformatorer och motorer (PDF)'), L['formel']],
          'En fyrpolig motor är märkt 4,0 kW, Δ/Y 400/690 V, 50 Hz, 1 440 r/min, η = 0,86 och cos φ = 0,82. Nätet är 400 V.',
          ['Vilken koppling används? Motivera.',
           'Beräkna synkront varvtal, eftersläpning, elektrisk inmatning och linjeström vid märklast.',
           'Motorn matas från en frekvensomriktare med (30 + D) Hz. Beräkna det synkrona varvtalet.'],
          'Beräkningar med enhet och motivering av kopplingen.'),
        u('Skyddsdata', [('v43_01_Komponenter_och_skydd_elev.pdf', 'Komponenter och skydd (PDF)')],
          'En grupp skyddas av en dvärgbrytare märkt C16, 6 kA, och en jordfelsbrytare märkt 30 mA.',
          ['Beräknad möjlig kortslutningsström är (3 + D/5) kA. Räcker brytförmågan? Motivera.',
           'Utgående ström är 8,000 A och returströmmen (7,990 − D/1 000) A. Beräkna differensströmmen. Löser jordfelsbrytaren?',
           'Varför skyddar jordfelsbrytaren inte mot överlast?'],
          'Beräkningar och motiveringar.'),
        u('Hållkretsen med nödstopp', [('v43_03_Elscheman_och_dokumentation_elev.pdf', 'Elscheman och dokumentation (PDF)'), L['hall']],
          'Gör de 8 räkna-först-uppgifterna i Hållkretslabbet. Rita sedan om hållkretsen med ett nödstopp S2 vid pumpen och en lampa H1 som lyser när K1 är dragen.',
          ['Var ska S2 sitta, och ska den vara NO eller NC? Motivera.',
           'Hur ansluts H1 så att den bara lyser när K1 är dragen?',
           'Beskriv vila, start, hållning, stopp och nödstopp i ord.',
           'Sätt i en felmodul i labbet och felsök den: observation, hypotes, kontroll, förväntat resultat, resultat och slutsats.'],
          'Ritning, beskrivning och felsökningsrad ur protokollet.'),
    ]},
    44: {'titel': 'Elsystem och fördjupad mätteknik', 'sista': '2026-11-01', 'uppgifter': [
        u('Isolationslabbet', [L['iso'], ('v44_01_Lagspanningssystem_elev.pdf', 'Lågspänningssystem (PDF)')],
          'Gör de 8 räkna-först-uppgifterna och labbprotokollet i Isolationslabbet.',
          ['Spara labbprotokollet som PDF.',
           'Ställ in 440 V, f = 60 Hz och kapacitansen 2 µF per fas. Ge L1 ett fullständigt jordfel. Förutsäg felströmmen och kontrollera i labbet.',
           'Förklara varför ett stort fartyg med långa kablar får större ström vid första jordfelet än ett litet.'],
          'Protokollet som PDF, förutsägelse, avläst värde och förklaring.'),
        u('Jämför jordningssystemen', [('v44_01_Lagspanningssystem_elev.pdf', 'Lågspänningssystem (PDF)'), ('../../filmer/#it-nat', 'Film: IT-nätet ombord')],
          'Jämför TN-S, TT och IT i en tabell.',
          ['Hur går felströmmen vid ett fel mellan fas och utsatt del?',
           'Vilket skydd kopplar bort felet?',
           'Vad händer vid första och andra felet i IT-systemet?',
           'Varför används IT-system ofta ombord?'],
          'Tabell och kort förklaring.'),
        u('Högspänning och strömtransformator', [('v44_02_Hogspanningssystem_elev.pdf', 'Högspänningssystem (PDF)'), L['formel']],
          'En bogpropellermotor på 6,6 kV tar P = (1,5 + D/10) MW med PF = 0,88.',
          ['Beräkna linjeströmmen.',
           'Vilken ström skulle samma effekt kräva vid 440 V? Varför används högspänning för stora laster?',
           'Strömtransformatorn har omsättningen 200/1 A. Beräkna sekundärströmmen.'],
          'Beräkningar och förklaring.'),
    ]},
    45: {'titel': 'Felsökning och repetition', 'sista': '2026-11-08', 'uppgifter': [
        u('Felsökningsrapport', [L['hall'], ('v45_01_Systematisk_felsokning_elev.pdf', 'Systematisk felsökning (PDF)')],
          'Sätt i två felmoduler i Hållkretslabbet och felsök en i taget.',
          ['Skriv observationen innan du mäter.',
           'Skriv två möjliga orsaker och välj en mätning som skiljer dem åt. Motivera mätningen och skriv förväntat resultat innan du ser resultatet.',
           'Skriv resultat och slutsats. Visa felet först när raden är ifylld.'],
          'Två ifyllda felsökningsrader ur protokollet.'),
        u('Analys av mätdata', [('v45_02_Analys_av_matresultat_elev.pdf', 'Analys av mätresultat (PDF)'), L['formel']],
          'En 24 V-pump tar 6,0 A. Före åtgärd: källan 24,1 V och pumpen (20,0 + D/100) V. Efter åtgärd: källan 24,1 V och pumpen 23,5 V. Instrumentet har ±(0,5 % + 2 siffror) och upplösningen 0,1 V.',
          ['Beräkna slingresistansen före och efter.',
           'Beräkna instrumentets felgräns för pumpens spänning efter åtgärden. Är förbättringen säkert större än mätosäkerheten?',
           'Skriv en slutsats: vad som är verifierat och vad som återstår att kontrollera.'],
          'Beräkningar och slutsats.'),
        u('Övningstentan', [('../../tentamen.html', 'Tentamen och övningstenta')],
          'Gör övningstentan utan att titta på lösningarna. Rätta den sedan.',
          ['Ange vilka uppgifter du klarade och vilka du inte klarade.',
           'Välj de tre områden du är mest osäker på och skriv vad du ska repetera och med vilket material.'],
          'Din rättade övningstenta och din repetitionsplan.'),
    ]},
}


def datum(iso):
    y, m, d = map(int, iso.split('-'))
    return f'{d} {MONTHS[m - 1]}'


def page(nr, w):
    items = ''
    for i, x in enumerate(w['uppgifter'], 1):
        anv = ' · '.join(f'<a href="{escape(h)}">{escape(t)}</a>' for h, t in x['anvand'])
        delar = ''.join(f'<li>{escape(d)}</li>' for d in x['delar'])
        items += (f'<section class="task sj-panel" id="uppgift-{i}"><h2>Uppgift {i}. {escape(x["titel"])}</h2>'
                  f'<p class="use"><strong>Använd:</strong> {anv}</p><p>{escape(x["text"])}</p><ol type="a">{delar}</ol>'
                  f'<p class="hand-in"><strong>Redovisa:</strong> {escape(x["redovisa"])}</p></section>')
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inlämning vecka {nr}: {escape(w["titel"])} · Sjöskolan</title><meta name="description" content="Inlämningsuppgifter för vecka {nr} som löses med veckans genomgångar och labbar."><link rel="canonical" href="https://nj22az.github.io/sjoskolan/vecka-{nr}/aktuell/Inlamning.html"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/sjoskolan/gemensamt/sjoskolan.css?v={V}"><link rel="stylesheet" href="/sjoskolan/course.css?v={V}">
<style>.task{{margin:24px 0}}.course-main .task h2{{margin-top:0;font-size:23px}}.task .use{{font-size:15px;color:var(--sj-muted)}}.task ol{{padding-left:26px}}.task li{{margin:6px 0}}.task .hand-in{{margin:12px 0 0;padding-top:12px;border-top:1px solid var(--sj-line)}}.dbox{{max-width:72ch}}.course-main .dbox h2{{margin-top:0}}@media print{{.task{{break-inside:avoid;border:1px solid #999}}.dbox{{border:1px solid #999}}}}</style></head>
<body class="course"><nav class="school-nav" aria-label="Sjöskolan"><a href="/sjoskolan/"><strong>SJÖSKOLAN</strong></a><a href="/sjoskolan/#veckor">Alla veckor</a><a href="/sjoskolan/vecka-{nr}/aktuell/">Vecka {nr}</a></nav><main id="main-content" class="course-main"><div class="course-breadcrumb"><a href="index.html">← Vecka {nr}</a></div><article class="course-reading">
<p class="course-kicker">Vecka {nr} · inlämning</p><h1>Inlämningsuppgifter: {escape(w["titel"])}</h1>
<p class="course-lead">Uppgifterna löses med veckans genomgångar och labbar. Lämna in senast söndag {datum(w["sista"])} via den inlämningskanal läraren har anvisat.</p>
<div class="sj-panel soft dbox"><h2>Ditt tal D</h2><p>Flera uppgifter använder ditt tal <strong>D</strong>: dagen i månaden du är född, 1–31. Är du född den 7 mars är D = 7. Skriv D överst i din inlämning. Då får du egna värden och läraren kan kontrollera dina svar.</p></div>
<h2>Så redovisar du</h2><ul><li>Skriv givna värden, samband, insättning och svar med enhet.</li><li>Skriv förutsägelsen innan du tittar i labbet, och skriv sedan ditt avlästa värde.</li><li>Förklara med egna ord och egna siffror. Skilj på vad du har observerat och vad du drar för slutsats.</li><li>Bifoga labbprotokoll som PDF när uppgiften säger det.</li></ul>
{items}
<h2>Bedömning</h2><ul><li>Metoden syns och går att följa, och enheterna stämmer.</li><li>Labbvärdena är dina egna och jämförs med din beräkning.</li><li>Förklaringarna använder begreppen från genomgången.</li><li>Säkerhetsresonemang skiljer på observation och antagande och hittar inte på uppgifter som saknas.</li></ul>
</article></main><footer class="school-nav">Sjöskolan · Elteknik och ellära · Nils Johansson</footer></body></html>
'''


if __name__ == '__main__':
    for nr, w in UPPGIFTER.items():
        out = ROOT / f'vecka-{nr}' / 'aktuell' / 'Inlamning.html'
        out.write_text(page(nr, w), encoding='utf-8')
        print('skrev', out.relative_to(ROOT.parent))
