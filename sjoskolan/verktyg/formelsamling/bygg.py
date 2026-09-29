#!/usr/bin/env python3
"""Formelsamlingen som bok: gemensamt/Formelsamling.pdf (A4) och gemensamt/Formelsamling.html (webb).

Boken har omslag och baksida i POPEYE-stil (awesome-design-md-jp, design-md/popeye: koboltblått #343ec9, vikt 400,
brett spärrad DM Sans, asymmetriska hörn 24/5 px, orange logotyp) och en inlaga i LINE-stil (design-md/line: vitt,
svart text, LINE-grönt #06c755 som accent, stor och enkel typografi, kort med 12 px hörn och tunn grå kant). LINE:s
webbstorlek 20 px är anpassad till tryck (11 pt brödtext).

Inlagan: titelsida med kolofon, förord, innehåll med sidnummer, metoden och rimlighetskontroll, sju kapitel med
öppningssida (”Det här ska du kunna”) och numrerade formler F1, F2 …, register, bilagor och anteckningssidor.
Varje formel har beteckningar med enhet, utlösta former, ett räknat exempel med fartygsvärden och ”Se upp”.
Registret byggs ur formlernas sökord och beteckningslistan ur innehall/beteckningar.json. Index skrivs X_{L}.

    python3 sjoskolan/verktyg/formelsamling/bygg.py          # HTML och PDF (Node, Playwright och PyMuPDF)
    python3 sjoskolan/verktyg/formelsamling/bygg.py --html   # bara HTML

Sidnumren i innehållet räknas i två pass: inlagan skrivs ut, länkarnas målsidor läses ur PDF:en och skrivs in.
"""
import html
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

SJO = Path(__file__).resolve().parents[2]
UT_HTML = SJO / 'gemensamt' / 'Formelsamling.html'
UT_PDF = SJO / 'gemensamt' / 'Formelsamling.pdf'
UTGAVA = 'Utgåva 1 · hösten 2026'
WEBB = 'https://nj22az.github.io/sjoskolan/gemensamt/Formelsamling.html'


def F(namn, formel, bet, ex, los='', obs='', sok=()):
    return {'namn': namn, 'formel': formel if isinstance(formel, list) else [formel], 'bet': bet, 'ex': ex, 'los': los, 'obs': obs, 'sok': list(sok)}


KAPITEL = [
    ('Likström och resistiva kretsar', 'Vecka 38–39',
     'Grunden för allt annat: spänning driver ström genom en resistans. Börja här när kretsen bara har batteri, resistorer och ledare.', [
        F('Ohms lag', 'U = R · I', 'U spänning (V) · R resistans (Ω) · I ström (A)',
          '24 V över 12 Ω ger I = 24/12 = 2,0 A.', 'I = U/R · R = U/I',
          'Räkna i grundenheter: 1 kΩ = 1 000 Ω och 1 mA = 0,001 A.', ['ström', 'spänning', 'resistans']),
        F('Effekt', 'P = U · I = I² · R = U²/R', 'P effekt (W)',
          '24 V och 2,0 A ger P = 48 W.', 'I = P/U · U = √(P · R)',
          'P = U · I gäller vid likström och ren resistans. Med spole eller kondensator: se Effekt i växelström (kapitel 2). I² · R ger alltid effekten i själva resistansen.', ['effekt']),
        F('Energi', 'E = P · t', 'E energi (J = Ws, eller kWh) · t tid (s eller h)',
          'En värmare på 2 kW i 3 h: E = 6 kWh.', 'P = E/t · t = E/P',
          'Tiden i timmar: 20 min = 20/60 h. kW gånger h ger kWh. 1 kWh = 3,6 MJ.', ['energi']),
        F('Laddning (batterikapacitet)', 'Q = I · t', 'Q laddning (Ah) · I ström (A) · t tid (h)',
          'Ett batteri som ger 5 A i 20 h: Q = 100 Ah.', 't = Q/I',
          'Ah är laddning, inte energi. Energin är ungefär U · Q (Wh).', ['batteri', 'laddning']),
        F('Verkningsgrad', ['η = P_{nyttig}/P_{in}', 'P_{förlust} = P_{in} − P_{nyttig}'], 'η verkningsgrad (0–1) · P_{in} tillförd effekt (W) · P_{nyttig} nyttig effekt (W)',
          'Motor: P_{axel} = 11 kW och η = 0,90 ger P_{in} = 11/0,90 ≈ 12,2 kW.', 'P_{in} = P_{nyttig}/η',
          'η är alltid mindre än 1. Blir P_{in} mindre än P_{nyttig} har du dividerat åt fel håll.', ['verkningsgrad', 'förlust', 'effekt']),
        F('Seriekoppling', 'R_{tot} = R_{1} + R_{2} + …', 'Samma ström genom alla delar',
          '1 kΩ och 2 kΩ i serie: R_{tot} = 3 kΩ.', '',
          'R_{tot} är alltid större än den största resistansen.', ['resistans', 'serie']),
        F('Parallellkoppling', ['1/R_{tot} = 1/R_{1} + 1/R_{2} + …', 'två grenar: R_{tot} = R_{1} · R_{2}/(R_{1} + R_{2})'], 'Samma spänning över alla grenar',
          '6 Ω parallellt med 3 Ω: R_{tot} = 18/9 = 2 Ω.', '',
          'R_{tot} är alltid mindre än den minsta resistansen.', ['resistans', 'parallell']),
        F('Spänningsdelare', ['U_{ut} = U_{in} · R_{2}/(R_{1} + R_{2})', 'med last över R_{2}: R_{p} = R_{2} · R_{last}/(R_{2} + R_{last})'], 'U_{ut} spänningen över R_{2}. Med last: byt R_{2} mot R_{p}',
          'U_{in} = 12 V, R_{1} = 1 kΩ och R_{2} = 2 kΩ: U_{ut} = 12 · 2/3 = 8 V.', '',
          'En last över R_{2} ligger parallellt med R_{2} och sänker U_{ut}.', ['spänning', 'spänningsdelare']),
        F('Strömdelare', 'I_{1} = I_{tot} · R_{2}/(R_{1} + R_{2})', 'I_{1} strömmen genom R_{1}',
          '3 A delas mellan 6 Ω (R_{1}) och 3 Ω (R_{2}): I_{1} = 3 · 3/9 = 1 A.', '',
          'Minst resistans får störst ström. Kontrollera att grenströmmarna summeras till I_{tot}.', ['ström', 'strömdelare']),
        F('Kirchhoffs strömlag', 'ΣI_{in} = ΣI_{ut}', 'I en nod',
          '5 A in i en nod och 2 A ut i ena grenen: 3 A i den andra.', '',
          'Ett negativt svar betyder att strömmen går mot pilen du ritade.', ['ström', 'kirchhoff', 'nod']),
        F('Kirchhoffs spänningslag', ['ΣU = 0 runt en slinga', 'U_{källa} = U_{1} + U_{2} + …'], 'Källans höjning = summan av spänningsfallen',
          '12 V-källa: 4 V över R_{1} ger 8 V över R_{2}.', '',
          'Gå runt slingan åt ett håll och håll ordning på tecknen.', ['spänning', 'kirchhoff', 'slinga']),
        F('Två spänningskällor i serie', ['medverkande: I = (E_{1} + E_{2})/(R_{1} + R_{2})', 'motverkande: I = (E_{1} − E_{2})/(R_{1} + R_{2})'], 'E källspänning (V)',
          'E_{1} = 12 V, E_{2} = 6 V, R_{1} = 2 Ω och R_{2} = 4 Ω: medverkande 3 A, motverkande 1 A.', '',
          'Motverkande källor: strömmen går i den största källans riktning.', ['källor i serie', 'ström', 'kirchhoff']),
        F('Nodspänning (en okänd nod)', '(E_{1} − V_{a})/R_{1} + (E_{2} − V_{a})/R_{2} = V_{a}/R_{3}', 'V_{a} nodens spänning mot referensen (V). Strömmar in i noden = ström ut',
          'E_{1} = 12 V, E_{2} = 6 V och alla R = 2 Ω: 18 − 2V_{a} = V_{a}, V_{a} = 6 V.', '',
          'Räkna V_{a} först. Grenströmmarna följer sedan med Ohms lag.', ['nod', 'nodspänning', 'kirchhoff']),
        F('Ledares resistans', 'R = ρ · l/A', 'ρ resistivitet (Ω·mm²/m) · l längd (m) · A area (mm²)',
          'Kabel 50 m, 2,5 mm² koppar. Slingan är 100 m: R = 0,0175 · 100/2,5 = 0,70 Ω.', 'l = R · A/ρ · A = ρ · l/R',
          'Slingan är fram och tillbaka: l = 2 · kabelns längd.', ['resistans', 'kabel', 'ledare']),
        F('Spänningsfall i kabel', ['ΔU = I · R_{slinga}', 'U_{last} = U_{källa} − ΔU', 'fall i % = 100 · ΔU/U_{källa}', 'P_{förlust} = I² · R_{slinga}'], 'ΔU spänningsfall (V) · R_{slinga} ledarnas resistans (Ω)',
          '10 A genom 0,70 Ω: ΔU = 7,0 V (3,0 %), lasten får 230 − 7 = 223 V och kabeln tar 70 W.', '',
          'Förlusten i kabeln är I² · R. Dubbel ström ger fyra gånger förlusten.', ['spänningsfall', 'kabel']),
        F('Thévenins ekvivalent', ['I_{last} = U_{th}/(R_{th} + R_{last})', 'ur spänningsdelare: U_{th} = U_{in} · R_{2}/(R_{1} + R_{2})', 'R_{th} = R_{1} · R_{2}/(R_{1} + R_{2})'], 'U_{th} tomgångsspänning (V) · R_{th} inre resistans med källan kortsluten (Ω)',
          'U_{th} = 12 V, R_{th} = 2 Ω och R_{last} = 4 Ω: I_{last} = 2 A.', '',
          'R_{th} räknas med spänningskällan ersatt av en kortslutning.', ['thévenin', 'ström', 'inre resistans']),
    ]),
    ('Växelström', 'Vecka 40',
     'Spänning och ström som byter riktning. Nätet ombord är ofta 440 V och 60 Hz, i land 400/230 V och 50 Hz.', [
        F('Period och frekvens', 'f = 1/T', 'f frekvens (Hz) · T periodtid (s)',
          '60 Hz: T = 1/60 ≈ 16,7 ms.', 'T = 1/f',
          'ms ska göras om till s innan du räknar f.', ['frekvens', 'period', 'tid']),
        F('Toppvärde och effektivvärde (sinus)', ['û = √2 · U_{RMS}', 'U_{pp} = 2 · û'], 'û toppvärde · U_{RMS} effektivvärde · U_{pp} topp–topp (V)',
          '440 V RMS: û ≈ 622 V och U_{pp} ≈ 1 245 V.', 'U_{RMS} = û/√2',
          '√2 gäller bara sinus. Symmetrisk fyrkant: U_{RMS} = û. Multimetern visar RMS, oscilloskopet topp och topp–topp.', ['toppvärde', 'effektivvärde', 'rms']),
        F('Momentanvärde', 'u(t) = û · sin(2π · f · t)', 'u(t) spänningen vid tiden t',
          'û = 325 V, 50 Hz, t = 2 ms: u = 325 · sin(0,628) ≈ 191 V.', '',
          'Räknaren i RAD, eftersom 2π · f · t är i radianer.', ['momentanvärde', 'sinus']),
        F('Fasvinkel från tidsskillnad', 'φ = 360° · Δt/T', 'φ fasvinkel (°) · Δt tidsskillnad mellan kurvorna (s)',
          'Δt = 2,0 ms och T = 20 ms: φ = 36°.', 'Δt = φ · T/360°',
          'Δt och T i samma enhet.', ['fasvinkel', 'fasförskjutning']),
        F('Induktiv reaktans', 'X_{L} = 2π · f · L', 'X_{L} (Ω) · L induktans (H)',
          '50 mH vid 60 Hz: X_{L} = 2π · 60 · 0,050 ≈ 18,8 Ω.', 'L = X_{L}/(2π · f)',
          'X_{L} växer med frekvensen. mH ska göras om till H.', ['reaktans', 'spole', 'induktans']),
        F('Kapacitiv reaktans', 'X_{C} = 1/(2π · f · C)', 'X_{C} (Ω) · C kapacitans (F)',
          '100 µF vid 50 Hz: X_{C} = 1/(2π · 50 · 0,000 1) ≈ 31,8 Ω.', 'C = 1/(2π · f · X_{C})',
          'X_{C} minskar med frekvensen. 1 µF = 10⁻⁶ F.', ['reaktans', 'kondensator', 'kapacitans']),
        F('Impedans (serie)', ['|Z| = √(R² + X²)', 'X = X_{L} − X_{C}'], '|Z| impedans (Ω) · X reaktans (Ω)',
          'R = 30 Ω och X = 40 Ω: |Z| = 50 Ω.', 'X = √(|Z|² − R²)',
          'Resistans och reaktans adderas inte rakt av, utan som sidorna i en rätvinklig triangel.', ['impedans']),
        F('Ström i växelströmskrets', 'I = U/|Z|', 'U och I som RMS-värden',
          '230 V över |Z| = 50 Ω: I = 4,6 A.', 'U = I · |Z|',
          'Använd |Z|, inte R, när kretsen har spole eller kondensator.', ['ström', 'impedans']),
        F('Spänningar i RL-krets (serie)', ['U_{R} = I · R', 'U_{L} = I · X_{L}', 'U = √(U_{R}² + U_{L}²)'], 'U_{R} över resistansen · U_{L} över spolen (V)',
          'I = 2 A, R = 30 Ω och X_{L} = 40 Ω: U_{R} = 60 V, U_{L} = 80 V och U = 100 V.', '',
          'Delspänningarna adderas som visare: 60 V och 80 V blir 100 V, inte 140 V.', ['spänning', 'spole', 'visare']),
        F('Fasvinkel och effektfaktor', ['φ = arctan(X/R)', 'cos φ = R/|Z|'], 'φ > 0: induktiv, strömmen släpar',
          'R = 30 Ω och X = 40 Ω: φ ≈ 53,1° och cos φ = 0,60.', '',
          'Räknaren i DEG när vinkeln ska vara i grader.', ['fasvinkel', 'effektfaktor', 'cos φ']),
        F('Resonansfrekvens', 'f_{0} = 1/(2π · √(L · C))', 'Vid f_{0} är X_{L} = X_{C} och |Z| = R',
          'L = 10 mH och C = 10 µF: f_{0} ≈ 503 Hz.', '',
          'Räkna L · C först, sedan roten.', ['resonans', 'frekvens']),
        F('Effekt i växelström (enfas)', ['S = U · I', 'P = S · PF', 'Q = S · sin φ', 'S² = P² + Q²', 'PF = P/S'], 'S skenbar (VA) · P aktiv (W) · Q reaktiv (var) · PF effektfaktor (sinus: PF = cos φ)',
          '230 V, 10 A, cos φ = 0,80: S = 2,3 kVA, P = 1,84 kW, Q = 1,38 kvar.', '',
          'Med övertoner är PF lägre än cos φ. Enheterna skiljer storheterna åt: W, VA och var.', ['effekt', 'skenbar effekt', 'reaktiv effekt']),
        F('Ström vid given effekt (enfas)', 'I = P/(U · PF)', '',
          '1,2 kW vid 230 V och PF = 0,80: I ≈ 6,5 A.', 'P = U · I · PF',
          'Lägre PF ger större ström för samma aktiva effekt.', ['ström', 'effekt']),
        F('Reaktiv effekt i kondensator', ['Q_{C} = U²/X_{C}', 'Q_{total} = Q_{last} − Q_{C}'], 'Q_{C} (var). Induktiv last: Q_{last} > 0',
          '230 V över X_{C} = 31,8 Ω: Q_{C} ≈ 1,66 kvar.', '',
          'Kondensatorns reaktiva effekt tar ut en del av den induktiva.', ['reaktiv effekt', 'kondensator', 'faskompensering']),
    ]),
    ('Trefas', 'Vecka 41',
     'Tre faser med 120° mellan sig. Håll isär linjevärden (mellan ledarna) och grenvärden (över en del av lasten).', [
        F('Huvud- och fasspänning', 'U_{L} = √3 · U_{F}', 'U_{L} huvudspänning (fas–fas) · U_{F} fasspänning (fas–neutral)',
          '440 V ombord: U_{F} = 440/√3 ≈ 254 V. I land: 400 V och 231 V.', 'U_{F} = U_{L}/√3',
          'Huvudspänningen är √3, inte 2, gånger fasspänningen.', ['spänning', 'trefas', 'fasspänning']),
        F('Fasförskjutning', ['fasavstånd = 360°/antal faser', '120° = T/3'], 'Tiden mellan två faser',
          '60 Hz: T/3 ≈ 5,56 ms.', '', '', ['fasförskjutning', 'trefas']),
        F('Y-koppling', ['U_{gren} = U_{L}/√3', 'I_{L} = I_{gren}'], 'U_{gren}, I_{gren} över och genom en gren av lasten',
          '440 V och 20 Ω per gren: U_{gren} ≈ 254 V, I_{L} ≈ 12,7 A.', '',
          'I Y är det spänningen som delas med √3.', ['y', 'stjärna', 'trefas']),
        F('Δ-koppling', ['U_{gren} = U_{L}', 'I_{L} = √3 · I_{gren}'], '',
          '440 V och 20 Ω per gren: I_{gren} = 22 A, I_{L} ≈ 38,1 A.', 'I_{gren} = I_{L}/√3',
          'Samma resistorer i Δ ger tre gånger linjeströmmen och effekten i Y.', ['delta', 'trefas']),
        F('Effekt, symmetrisk trefaslast', ['S = √3 · U_{L} · I_{L}', 'P = √3 · U_{L} · I_{L} · PF', 'Q = √3 · U_{L} · I_{L} · sin φ'], 'Linjevärden: U_{L} och I_{L}',
          '440 V, 20 A, PF = 0,85: S ≈ 15,2 kVA, P ≈ 13,0 kW.', 'I_{L} = P/(√3 · U_{L} · PF)',
          'Formeln gäller bara när alla tre faserna är lika belastade.', ['effekt', 'trefas', 'ström']),
        F('Effekt, osymmetrisk last', 'P_{total} = P_{1} + P_{2} + P_{3}', 'P_{1}, P_{2}, P_{3} effekt per fas (W)',
          '1,2 + 1,5 + 0,9 kW = 3,6 kW.', '',
          'Använd inte √3-formeln när faserna är olika belastade.', ['effekt', 'osymmetrisk']),
        F('Neutralström', ['I_{N} = −(I_{1} + I_{2} + I_{3})', 'symmetrisk last: I_{N} = 0', 'två faser: I_{N} = √(I_{1}² + I_{2}² + 2 · I_{1} · I_{2} · cos 120°)'], 'Strömmarna adderas som visare, med sina vinklar, inte som vanliga tal',
          'Bara en fas belastad med 5 A: I_{N} = 5 A. Två lika faser: I_{N} = grenströmmen.', '',
          'Bryts neutralen i en osymmetrisk last flyttar sig spänningarna, och en last kan få för hög spänning.', ['neutralström', 'neutralledare']),
        F('Motorns märkning Δ/Y', 'Δ/Y U_{Δ}/U_{Y}', 'Är nätets U_{L} lika med det lägre värdet: Δ. Lika med det högre: Y.',
          'Δ/Y 440/760 V på 440 V-nät: Δ. Δ/Y 230/400 V på 400 V-nät: Y.', '',
          'Jämför med nätets huvudspänning, inte med fasspänningen.', ['motor', 'märkning', 'koppling']),
        F('Motorström ur axeleffekt', ['P_{in} = P_{axel}/η', 'I_{L} = P_{in}/(√3 · U_{L} · PF)'], 'P_{axel} märkeffekt på axeln (W)',
          '11 kW, η = 0,90, 440 V, PF = 0,85: P_{in} ≈ 12,2 kW och I_{L} ≈ 18,9 A.', '',
          'Märkskyltens kW är axeleffekt. Dela med η innan du räknar ström.', ['motor', 'ström', 'axeleffekt']),
        F('Trefastransformatorns märkström', 'I = S/(√3 · U_{L})', 'S märkeffekt (VA) · U_{L} huvudspänningen på den sida du räknar',
          '100 kVA på 440 V-sidan: I ≈ 131 A.', 'S = √3 · U_{L} · I',
          'Räkna varje sida för sig med den sidans spänning.', ['transformator', 'märkström', 'ström']),
    ]),
    ('Elsäkerhet och skydd', 'Vecka 42',
     'Formlerna här visar storleksordningar. Arbetsmetod, frånskiljning och kontroll bestäms av instruktionerna, inte av en uträkning.', [
        F('Kortslutningsström', 'I = U/R_{slinga}', 'R_{slinga} hela felvägens resistans (Ω)',
          '24 V-batteri kortsluts av en skiftnyckel, hela slingan 0,01 Ω: I = 2 400 A.', '',
          'Låg spänning betyder inte liten risk. Liten resistans ger stor ström, värme och ljusbåge.', ['kortslutning', 'batteri', 'felström']),
        F('Riskpoäng i en riskmatris', 'riskpoäng = sannolikhet · konsekvens', 'Enhetslösa tal från matrisens skala',
          'Före: 3 · 4 = 12. Efter åtgärd: 1 · 4 = 4.', '',
          'En lägre poäng visar inte att kraven är uppfyllda. Konsekvensen är ofta densamma.', ['risk', 'riskbedömning']),
        F('Spänningsområden i kursen', ['ELV: högst 50 V AC eller 120 V DC', 'lågspänning: högst 1 000 V AC eller 1 500 V DC', 'högspänning: över lågspänning'], '',
          'Ombordnätet 440 V är lågspänning. En 12 V-rigg är ELV, men SELV kräver också skyddande separation.', '',
          'Ett lågt spänningsvärde ensamt bevisar inte att kretsen är säker (SELV).', ['spänningsområde', 'selv', 'högspänning']),
    ]),
    ('Komponenter, transformatorer och motorer', 'Vecka 43', 'Hur energin omvandlas och kopplas: transformatorn byter spänning, motorn gör rörelse, skydden bryter vid fel.', [
        F('Ideal transformator', ['U_{1}/U_{2} = N_{1}/N_{2}', 'U_{1} · I_{1} = U_{2} · I_{2}'], '1 primärsida · 2 sekundärsida · N antal varv',
          '2,0 kVA, 440/230 V: I_{2} = 2 000/230 ≈ 8,7 A och I_{1} ≈ 4,5 A.', 'I_{2}/I_{1} = N_{1}/N_{2}',
          'Sidan med högst spänning har lägst ström.', ['transformator', 'omsättning']),
        F('Synkront varvtal', 'n_{s} = 120 · f/p', 'n_{s} (r/min) · f (Hz) · p antal poler',
          '4 poler vid 60 Hz: n_{s} = 1 800 r/min. Vid 50 Hz: 1 500 r/min.', 'f = n_{s} · p/120',
          'p är antalet poler, inte polpar.', ['varvtal', 'motor']),
        F('Eftersläpning', 's = (n_{s} − n)/n_{s}', 's eftersläpning (ofta i %) · n verkligt varvtal',
          '1 750 r/min på en 1 800 r/min-motor: s ≈ 2,8 %.', 'n = n_{s} · (1 − s)',
          'En asynkronmotor går alltid lite långsammare än n_{s}.', ['eftersläpning', 'motor', 'varvtal']),
        F('Skyddets märkdata', ['märkström ≥ lastens ström i normal drift', 'brytförmåga ≥ möjlig kortslutningsström'], 'Märkström i A · brytförmåga i kA',
          'Dvärgbrytare 16 A och 6 kA räcker inte där kortslutningsströmmen kan bli 8 kA.', '',
          'Kontrollera båda. Märkströmmen säger inget om vad skyddet klarar att bryta.', ['skydd', 'brytförmåga', 'säkring']),
        F('Jordfelsbrytarens differensström', 'I_{Δ} = |I_{ut} − I_{retur}|', 'I_{Δ} differensström (mA). Personskydd: vanligen 30 mA',
          '5 000 mA ut och 4 970 mA tillbaka: I_{Δ} = 30 mA.', '',
          'Jordfelsbrytaren reagerar inte på överlast. Där behövs ett överströmsskydd.', ['jordfel', 'jordfelsbrytare']),
    ]),
    ('Elsystem och fördjupad mätteknik', 'Vecka 44',
     'Jordningssystem, fel och isolation. Ombord är IT-nätet vanligt: första jordfelet ger larm, inte bortkoppling.', [
        F('Felström i modell', 'I_{k} ≈ U_{0}/Z_{s}', 'TN-system. U_{0} spänning mot jord (V) · Z_{s} felslingans impedans (Ω)',
          '230 V och Z_{s} = 0,5 Ω: I_{k} ≈ 460 A.', 'Z_{s} = U_{0}/I_{k}',
          'Dubbel slingimpedans ger halva felströmmen och längre utlösningstid.', ['felström', 'kortslutning', 'impedans']),
        F('Beröringsspänning', 'U_{beröring} = |V_{A} − V_{B}|', 'V_{A}, V_{B} potential i två punkter som kan beröras samtidigt',
          'Kapsling 50 V mot skrov, skrovet 0 V: U_{beröring} = 50 V.', '',
          'Det är skillnaden mellan två punkter som är farlig, inte ett värde i en punkt.', ['beröringsspänning', 'jordning']),
        F('Strömtransformator', 'I_{2} = I_{1} · I_{2,märk}/I_{1,märk}', 'Omsättning till exempel 200/5 A',
          '200/5 A och 120 A i ledaren: I_{2} = 3,0 A.', 'I_{1} = I_{2} · I_{1,märk}/I_{2,märk}',
          'Sekundärsidan får aldrig lämnas öppen när primärsidan har ström.', ['strömtransformator', 'mätning']),
        F('Isolationsresistans', 'R_{iso} = U_{prov}/I_{läck}', 'R_{iso} (MΩ) · U_{prov} provspänning (V) · I_{läck} läckström',
          '500 V och 0,25 mA: R_{iso} = 2 MΩ.', 'I_{läck} = U_{prov}/R_{iso}',
          'Jämför bara mätningar med samma provspänning, tid, temperatur och inkopplade delar.', ['isolation', 'isolationsresistans']),
        F('Jordningssystem', ['TN-S: N och PE separata', 'TT: egna jordtag, liten felström', 'IT: isolerat från skrov eller via hög impedans'], 'Vanligt ombord: IT',
          'IT, första jordfelet: liten ström och larm från isolationsvakten. Andra felet på annan fas: kortslutning.', '',
          'Ett larm utan stopp är ingen grund för att vänta. Felet ska lokaliseras.', ['jordning', 'it-nät', 'tn', 'tt']),
    ]),
    ('Mätteknik och analys av mätresultat', 'Vecka 38–39 och 44–45',
     'Ett mätvärde är ett intervall, inte ett exakt tal. Jämför hela intervallet med kravet och skriv vad mätningen inte visar.', [
        F('Instrumentets felgräns', 'δ = (a/100) · visning + n · upplösning', '”±(a % + n siffror)” ur databladet',
          '±(0,5 % + 2 siffror), visning 230,0 V, upplösning 0,1 V: δ = 1,15 + 0,2 ≈ 1,4 V.', '',
          'n är antal steg i sista siffran, inte n volt.', ['felgräns', 'noggrannhet', 'mätosäkerhet']),
        F('Mätintervall mot krav', ['mätintervall = visning ± δ', 'godkänt: hela intervallet inom kravet'], '',
          'Visning 230,0 ± 1,4 V: 228,6–231,4 V. Krav 230 V ±2 %: 225,4–234,6 V. Godkänt.', '',
          'Ett värde som ligger nära gränsen kan vara underkänt när felgränsen räknas med.', ['krav', 'mätintervall']),
        F('Tolerans och krav', 'gränser = nominellt värde · (1 ± p/100)', 'p tolerans (%). Gäller R_{nom}, U_{nom} och andra märkvärden',
          '470 Ω ±10 %: 423–517 Ω. Krav 12,0 V ±5 %: 11,40–12,60 V.', '', 'Ett värde precis på gränsen är godkänt.', ['tolerans', 'resistans']),
        F('Strömtång', 'I = U_{tång}/k', 'k känslighet (mV/A)',
          '100 mV/A och 1,5 V: I = 1 500/100 = 15 A.', '',
          'Omslut en ledare. Båda ledarna i samma kabel tar ut varandra.', ['strömtång', 'ström']),
        F('Oscilloskop', ['T = rutor · tid/ruta', 'û = rutor · volt/ruta · probfaktor'], '',
          '4 rutor · 5 ms/ruta: T = 20 ms, alltså 50 Hz.', 'f = 1/T',
          'Räkna inte probfaktorn två gånger om oscilloskopet redan är inställt på 10:1.', ['oscilloskop', 'period']),
        F('Upprepade mätningar', ['medelvärde = Σx/n', 'variationsbredd = x_{max} − x_{min}', 'avvikelse i % = 100 · |x − medel|/medel'], 'n antal mätningar',
          '400, 402 och 398 V: medel 400 V, största avvikelse 0,5 %.', '',
          'Skilj på spridning och fel. Ett systematiskt fel syns inte i spridningen.', ['medelvärde', 'avvikelse']),
        F('Resistans ur spänningsfall', ['R = ΔU/I', 'ΔU_{total} = U_{källa} − U_{last}'], 'ΔU spänningsfall över sträckan (V) vid strömmen I (A)',
          'Före: 6 V vid 3 A ger 2,0 Ω. Efter: 0,3 V vid 3 A ger 0,10 Ω.', '',
          'Jämför bara värden mätta vid samma ström och i samma punkter.', ['resistans', 'felsökning', 'spänningsfall']),
        F('Spänning mellan två mätpunkter', ['U_{AB} = V_{A} − V_{B}', 'över en kontakt: sluten ≈ 0 V, öppen = full spänning'], 'V_{A}, V_{B} spänning mot samma referens (V)',
          'Före kontakten 24 V, efter kontakten 0 V mot minus: 24 V över kontakten, den är öppen.', '',
          'Mät alltid mot samma referens. Mät från källan mot lasten och ringa in där spänningen försvinner.', ['felsökning', 'potential', 'kontakt']),
        F('Mätkategori CAT', ['CAT II: uttag och apparater', 'CAT III: fast installation, tavlor', 'CAT IV: matningens början'], '',
          'Mätning i en fördelningscentral ombord kräver minst CAT III med rätt spänning.', '',
          'Hela kedjan (instrument, sladdar, prober) ska ha rätt kategori och spänning.', ['cat', 'mätkategori', 'säkerhet']),
    ]),
]

PREFIX = [('M', 'mega', '10⁶', '1 MΩ = 1 000 000 Ω'), ('k', 'kilo', '10³', '1 kW = 1 000 W'), ('m', 'milli', '10⁻³', '1 mA = 0,001 A'), ('µ', 'mikro', '10⁻⁶', '1 µF = 0,000 001 F')]
KONSTANTER = [('√2', '≈ 1,414'), ('√3', '≈ 1,732'), ('π', '≈ 3,142'), ('ρ för koppar (20 °C)', '0,0175 Ω·mm²/m'),
              ('Nät ombord (vanligt)', '440 V, 60 Hz, 3-fas; 230 V för belysning'), ('Nät i land', '400/230 V, 50 Hz')]
ORD = [('Spänning', 'Voltage'), ('Ström', 'Current'), ('Resistans', 'Resistance'), ('Effekt', 'Power'), ('Effektivvärde', 'RMS value'),
       ('Toppvärde', 'Peak value'), ('Reaktans', 'Reactance'), ('Impedans', 'Impedance'), ('Effektfaktor', 'Power factor'),
       ('Huvudspänning', 'Line voltage'), ('Fasspänning', 'Phase voltage'), ('Neutralledare', 'Neutral conductor'),
       ('Skyddsledare', 'Protective earth (PE)'), ('Jordfel', 'Earth fault'), ('Isolationsresistans', 'Insulation resistance'),
       ('Verkningsgrad', 'Efficiency'), ('Axeleffekt', 'Shaft power'), ('Eftersläpning', 'Slip'), ('Brytförmåga', 'Breaking capacity'),
       ('Kortslutning', 'Short circuit'), ('Överlast', 'Overload'), ('Frekvensomriktare', 'Variable frequency drive'),
       ('Strömtransformator', 'Current transformer'), ('Felgräns', 'Accuracy (error limit)'), ('Upplösning', 'Resolution')]



# Kapitlens öppningssidor: vad eleven ska kunna efter kapitlet.
KUNNA = [
    ['räkna ström, spänning, resistans, effekt och energi i en likströmskrets',
     'ställa upp Kirchhoffs lagar för en nod och en slinga',
     'räkna spänningsfall och förlust i en kabel ombord'],
    ['läsa av periodtid, toppvärde och effektivvärde för en sinus',
     'räkna reaktans, impedans och fasvinkel',
     'skilja på aktiv, reaktiv och skenbar effekt'],
    ['skilja på huvudspänning och fasspänning',
     'räkna ström och effekt i Y- och Δ-koppling',
     'räkna motorström ur märkskyltens axeleffekt'],
    ['se att låg spänning kan ge stor ström',
     'använda en riskmatris utan att övertolka poängen',
     'känna igen spänningsområdena ELV, lågspänning och högspänning'],
    ['räkna spänning och ström i en ideal transformator',
     'räkna synkront varvtal och eftersläpning',
     'kontrollera både märkström och brytförmåga för ett skydd'],
    ['räkna felström och beröringsspänning i en enkel modell',
     'räkna med strömtransformator och isolationsresistans',
     'skilja på TN-S, TT och IT'],
    ['räkna instrumentets felgräns och jämföra ett mätintervall med ett krav',
     'räkna resistans ur spänningsfall före och efter en åtgärd',
     'välja rätt mätkategori (CAT)'],
]

# Metodsidan: fem steg och ett helt genomräknat exempel.
METOD = [
    ('Givet', 'Skriv upp alla värden med enhet. Gör om till grundenheter: kW till W, mA till A, ms till s.'),
    ('Sökt', 'Skriv vilken storhet du ska ta fram och vilken enhet svaret ska ha.'),
    ('Formel', 'Leta upp storheten i registret ”Jag söker …” och välj formeln. Läs ”Se upp” innan du räknar.'),
    ('Räkna', 'Lös ut det sökta innan du sätter in tal. Behåll mellanresultat med minst tre siffror.'),
    ('Rimligt?', 'Jämför med tabellen på nästa sida. Kontrollera enheten och storleksordningen och avrunda till rimlig noggrannhet.'),
]
FEL = [
    ('Glömt √3', 'Trefaseffekt och trefasström räknas med √3 och linjevärden. √3 ≈ 1,732, inte 2 och inte 3.'),
    ('kW och kWh', 'kW är effekt, kWh är energi. Energin får du genom att multiplicera effekten med tiden i timmar.'),
    ('RAD eller DEG', 'sin(2π · f · t) räknas i RAD. Vinklar i grader, som 30° och 120°, räknas i DEG.'),
    ('Prefixen', 'Gör om mA, kΩ, µF och mH till A, Ω, F och H innan du sätter in talen.'),
    ('Kabelns längd', 'Strömmen går fram och tillbaka. Slingans längd är två gånger kabelns längd.'),
    ('Topp eller RMS', 'Multimetern visar RMS och oscilloskopet toppvärde. För sinus är û = √2 · U.'),
]
RIMLIGT = [
    ('Nätet ombord', '440 V trefas 60 Hz. Belysning och uttag ofta 230 V'),
    ('Nätet i land', '400/230 V, 50 Hz'),
    ('Periodtid', '20 ms vid 50 Hz, 16,7 ms vid 60 Hz'),
    ('Motorström (trefas)', 'ungefär 1,7 A per kW vid 440 V, 2 A per kW vid 400 V'),
    ('Motorns verkningsgrad', '0,85–0,95'),
    ('Motorns effektfaktor', '0,8–0,9 vid full last'),
    ('Synkront varvtal, 4 poler', '1 800 r/min vid 60 Hz, 1 500 r/min vid 50 Hz'),
    ('Kopparkabel 2,5 mm²', 'ungefär 0,7 Ω per 100 m slinga'),
    ('Jordfelsbrytare, personskydd', '30 mA'),
    ('Människokroppen, räknemodell', 'ungefär 1 000 Ω'),
    ('Batterisystem ombord', 'ofta 24 V DC'),
]


def h(s):
    s = html.escape(s, quote=False)
    return re.sub(r'_\{([^{}]*)\}', r'<sub>\1</sub>', s)


def formelrad(x):
    """En formelrad. En inledande etikett (”två faser:”, ”CAT II:”) ritas liten, så att formeln syns först."""
    m = re.match(r'^([^=:]{2,26}): (.+)$', x)
    if m and '=' not in m.group(1):
        return f'<div class="fl"><span class="etikett">{h(m.group(1))}</span> {h(m.group(2))}</div>'
    return f'<div class="fl">{h(x)}</div>'


def numrering():
    """[(kapitelindex, F-nummer, formel)] i bokens ordning."""
    ut, nr = [], 0
    for k, (_, _, _, formler) in enumerate(KAPITEL):
        for f in formler:
            nr += 1
            ut.append((k, nr, f))
    return ut


def fnr(namn):
    return next(n for _, n, f in numrering() if f['namn'] == namn)


FONTER = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Noto+Sans:wght@400;500;700&display=swap">')

# ---------------------------------------------------------------- POPEYE: omslag och baksida
POP_CSS = '''
.pop{--blue:#343ec9;--blue5:#5363ff;--orange:#ff9000;--cyan:#3affff;--navy:#002184;font-family:"DM Sans",Carlito,Arial,sans-serif;font-weight:400;
  letter-spacing:.025em;font-feature-settings:"palt";color:var(--blue);background:#fff;width:210mm;height:297mm;box-sizing:border-box;padding:14mm 14mm 12mm;
  display:flex;flex-direction:column;overflow:hidden;position:relative;break-after:page}
.pop *{font-weight:400}
.pop .topp{display:flex;justify-content:space-between;align-items:center}
.pop .logo{color:var(--orange);font-size:22px;letter-spacing:.18em}
.pop .pill{border:1px solid var(--blue);border-radius:24px;padding:6px 16px;font-size:13px;letter-spacing:.06em}
.pop .titel{font-size:104px;line-height:.98;letter-spacing:.067em;margin:10mm 0 4mm}
.pop .under{font-size:18px;line-height:1.5;max-width:150mm;margin:0 0 8mm}
.pop .bild{background:var(--blue);border-radius:0 24px 0 0;height:66mm;position:relative;overflow:hidden}
.pop .bild svg{position:absolute;inset:0;width:100%;height:100%}.pop .etik{position:absolute;color:#fff;font-size:22px;letter-spacing:.07em;background:var(--blue);padding:2px 10px}.pop .e1{left:8mm;top:6mm;border-radius:0 5px 5px 0}.pop .e2{right:8mm;bottom:6mm;color:var(--cyan);border-radius:5px 0 0 5px}.pop sub{font-size:.65em}
.pop .dagar{display:grid;grid-template-columns:repeat(7,1fr);gap:0;margin-top:0}
.pop .dagar div{background:var(--blue);color:#fff;padding:10px 8px 12px;min-height:30mm;border-left:1px solid rgba(255,255,255,.35);font-size:12.5px;line-height:1.5}
.pop .dagar div:first-child{border-left:0}.pop .dagar div:last-child{border-radius:0 0 24px 0}
.pop .dagar b{display:block;font-size:22px;letter-spacing:.06em;margin-bottom:4px;color:var(--cyan)}
.pop .rader{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:6mm;margin-top:10mm;align-items:start}.pop .stortal{font-size:88px;line-height:.9;letter-spacing:.02em}.pop .stortal span{display:block;font-size:14.4px;line-height:1.5;letter-spacing:.025em;margin-top:3mm}.pop .rad{border-top:1px solid var(--blue);padding-top:3mm;font-size:14.4px;line-height:1.5}.pop .rad p{margin:0 0 2mm;color:var(--orange);font-size:20px;letter-spacing:.07em}
.pop .fot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:10px;font-size:13px;letter-spacing:.06em}
.pop .tagg{display:inline-block;border:1px solid var(--blue);border-radius:5px 5px 0 0;padding:5px 12px;font-size:12.5px;margin-right:6px}
.pop.bak{background:var(--blue);color:#fff}
.pop.bak .pill{border-color:#fff}
.pop.bak h2{font-size:44px;line-height:1.05;letter-spacing:.067em;margin:12mm 0 6mm}
.pop.bak p{font-size:16px;line-height:1.5;margin:0 0 4mm;max-width:160mm}
.pop.bak .lista{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:4mm 0 8mm;border-top:1px solid rgba(255,255,255,.5)}
.pop.bak .lista div{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.5);font-size:14.4px;line-height:1.5}
.pop.bak .lista div:nth-child(odd){padding-right:8mm}
.pop.bak .kal{background:var(--navy);border-radius:24px;padding:8mm;display:grid;grid-template-columns:1fr auto;gap:8mm;align-items:center}
.pop.bak .kal .v{color:var(--cyan);font-size:20px;letter-spacing:.07em;margin:0 0 3mm}
.pop.bak .kal p{font-size:14.4px;margin:0 0 2mm}
.pop.bak .qr{background:#fff;border-radius:0 5px 5px 0;padding:8px}
.pop.bak .qr svg{display:block;width:34mm;height:34mm}
.pop.bak .knapp{display:inline-block;background:var(--cyan);color:var(--navy);border-radius:24px;padding:8px 20px;font-size:14px;margin-top:3mm}
.pop.bak .strip{margin:10mm -14mm 0;padding:12px 14mm;border-top:1px solid #fff;border-bottom:1px solid #fff;white-space:nowrap;overflow:hidden;font-size:20px;letter-spacing:.05em;display:flex;justify-content:space-between}.pop.bak .strip .sep{color:var(--cyan);padding:0 4mm}
'''


def vagor():
    """Omslagsbilden: trefas som tre sinuskurvor, med formler i kursens notation."""
    import math
    w, hgt = 760, 300
    farger = ['#ffffff', '#3affff', '#ff9000']
    kurvor = []
    for k, c in enumerate(farger):
        pts = ' '.join(f'{x:.1f},{hgt / 2 - 100 * math.sin(2 * math.pi * (x / 300) - k * 2 * math.pi / 3):.1f}' for x in range(0, w + 1, 6))
        kurvor.append(f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="{4 if k == 0 else 3}" opacity="{1 if k == 0 else .95}"/>')
    axel = f'<line x1="0" y1="{hgt / 2}" x2="{w}" y2="{hgt / 2}" stroke="#ffffff" stroke-opacity=".35" stroke-width="1"/>'
    txt = ''
    return f'<svg viewBox="0 0 {w} {hgt}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{axel}{"".join(kurvor)}{txt}</svg>'


def omslag():
    antal = len(numrering())
    dagar = ''.join(f'<div><b>{k:02d}</b>{h(t)}</div>' for k, (t, _, _, _) in enumerate(KAPITEL, 1))
    return f'''<section class="pop" aria-label="Omslag">
<div class="topp"><span class="logo">SJÖSKOLAN</span><span class="pill">NO. 38–45 · ELTEKNIK OCH ELLÄRA</span></div>
<h1 class="titel">FORMEL-<br>SAMLING</h1>
<p class="under">Alla formler i kursen Elteknik och ellära på ett ställe. Varje formel med beteckningar, utlösta former, ett räknat exempel från fartyget och det vanligaste felet.</p>
<div class="bild">{vagor()}<span class="etik e1">U<sub>L</sub> = √3 · U<sub>F</sub></span><span class="etik e2">120° = T/3</span></div>
<div class="dagar">{dagar}</div>
<div class="rader"><div class="stortal">{antal}<span>formler från Ohms lag till felsökning ombord</span></div>
<div class="rad"><p>01</p>Varje formel med beteckningar, enheter och utlösta former</div><div class="rad"><p>02</p>Räknade exempel med fartygets 440 V och 60 Hz</div><div class="rad"><p>03</p>”Se upp”: felet som är lättast att göra</div></div>
<div class="fot"><div><span class="tagg">7 KAPITEL</span><span class="tagg">VECKA 38–45</span><span class="tagg">EXEMPEL OMBORD</span></div><span>{h(UTGAVA).upper()}</span></div>
</section>'''


def qr_svg(url):
    import qrcode
    import qrcode.image.svg
    img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, border=1)
    s = img.to_string(encoding='unicode')
    s = re.sub(r'<\?xml[^>]*>', '', s)
    return s.replace('fill="#000000"', 'fill="#343ec9"').replace('<svg ', '<svg aria-label="QR-kod till webbversionen" ', 1)


def baksida():
    lista = ''.join(f'<div>{k:02d} · {h(t)}<br><span style="opacity:.8">{h(v)}</span></div>' for k, (t, v, _, _) in enumerate(KAPITEL, 1))
    lista += '<div>Register, beteckningar och ordlista<br><span style="opacity:.8">svenska och engelska</span></div>'
    strip = '<span class="sep">/</span>'.join('<span>%s</span>' % x for x in ['U = R · I', 'P = √3 · U<sub>L</sub> · I<sub>L</sub> · PF', 'X<sub>L</sub> = 2π · f · L', 'û = √2 · U<sub>RMS</sub>'])
    return f'''<section class="pop bak" aria-label="Baksida">
<div class="topp"><span class="logo">SJÖSKOLAN</span><span class="pill">FORMELSAMLING</span></div>
<h2>EN FORMEL ÄR<br>ETT VERKTYG</h2>
<p>Den här boken är skriven för kursen Elteknik och ellära. Den följer kursen vecka för vecka, från Ohms lag till felsökning i fartygets elsystem. Formlerna står i samma form som i genomgångar, övningar och tentamen.</p>
<p>Varje formel visar vad beteckningarna betyder, hur du löser ut den storhet du söker, ett räknat exempel med värden från ett fartyg och det fel som är lättast att göra. Använd boken när du övar, i labbet och på tentamen när läraren tillåter det.</p>
<div class="lista">{lista}</div>
<div class="kal"><div><p class="v">WEBBVERSIONEN</p><p>Samma formler med klickbart register finns på Sjöskolans webbplats, tillsammans med veckornas övningar, ledtrådar och facit.</p><span class="knapp">nj22az.github.io/sjoskolan</span></div><div class="qr">{qr_svg(WEBB)}</div></div>
<div class="strip">{strip}</div>
<div class="fot"><span>SJÖSKOLAN · ELTEKNIK OCH ELLÄRA · NILS JOHANSSON</span><span>{h(UTGAVA).upper()}</span></div>
</section>'''


# ---------------------------------------------------------------- LINE: inlagan
LINE_CSS = '''
:root{--gron:#06c755;--grond:#05b34c;--text:#000;--text2:#666;--grans:#e5e5e5;--yta:#f7f8f9;--varn:#f9ab00;--varnbg:#fff8e5}
*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:#fff;color:var(--text);font:14.7px/1.45 "Noto Sans",Arial,Carlito,sans-serif}
.inlaga{max-width:182mm;margin:0 auto}
a{color:inherit;text-decoration:none}sub{font-size:.72em;line-height:0}
.sida{break-before:page;padding-top:2mm}
.kicker{margin:0;color:var(--text2);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
h1.stor{font-size:44px;line-height:1.1;margin:6mm 0 3mm;font-weight:700}
h2{font-size:26px;line-height:1.25;margin:0 0 3mm;font-weight:700}
.ingress{font-size:18px;line-height:1.5;color:var(--text);max-width:150mm}
.kort{background:#fff;border:1px solid var(--grans);border-radius:12px;padding:5mm}
.yta{background:var(--yta);border-radius:12px;padding:5mm}
.titelsida{display:flex;flex-direction:column;min-height:265mm}
.titelsida .gron{width:18mm;height:4px;background:var(--gron);border-radius:2px;margin:0 0 6mm}
.kolofon{margin-top:auto;font-size:12px;color:var(--text2);line-height:1.6;border-top:1px solid var(--grans);padding-top:4mm}
.forord p{font-size:15.5px;line-height:1.6;max-width:150mm;margin:0 0 3.5mm}
.forord .tre{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin:6mm 0}
.forord .tre b{display:block;font-size:17px;margin-bottom:1mm}
.innehall{list-style:none;padding:0;margin:4mm 0}
.innehall li a{display:grid;grid-template-columns:14mm 1fr auto;align-items:baseline;gap:3mm;padding:3.2mm 0;border-bottom:1px solid var(--grans);font-size:17px}
.innehall .n{font-size:22px;font-weight:700;color:var(--gron)}.innehall .v{display:block;font-size:12.5px;color:var(--text2)}
.innehall .s{font-weight:700;font-variant-numeric:tabular-nums}
.steg{display:grid;grid-template-columns:repeat(5,1fr);gap:3mm;margin:4mm 0}
.steg div{background:var(--yta);border-radius:12px;padding:4mm 3.5mm;font-size:12.5px;line-height:1.45}
.steg b{display:flex;align-items:center;gap:2mm;font-size:15px;margin-bottom:1.5mm}
.steg i{font-style:normal;display:inline-grid;place-items:center;width:7mm;height:7mm;border-radius:50%;background:var(--gron);color:#fff;font-size:13px}
.felrutor{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.felrutor div{background:var(--varnbg);border-left:3px solid var(--varn);border-radius:0 12px 12px 0;padding:3.5mm 4mm;font-size:12.8px;line-height:1.45}.felrutor b{display:block;font-size:15px;margin-bottom:1mm}
.losning{display:grid;grid-template-columns:28mm 1fr;gap:1.5mm 4mm;font-size:14px;margin:0}
.losning dt{font-weight:700}.losning dd{margin:0}
.tabell{width:100%;border-collapse:collapse;font-size:13px}#rimligt .tabell{font-size:15px;margin-top:6mm}#rimligt .tabell td{padding:3.5mm 2mm}.tabell td,.tabell th{text-align:left;padding:2.2mm 2mm;border-bottom:1px solid var(--grans);vertical-align:top}
.tabell th{color:var(--text2);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase}
.tabell td.sym{font-weight:700;white-space:nowrap}
.oppning{min-height:128mm;display:flex;flex-direction:column;justify-content:flex-end;border-bottom:4px solid var(--gron);padding-bottom:6mm;margin-bottom:6mm;break-inside:avoid}
.oppning .nr{font-size:120px;line-height:1;font-weight:700;color:var(--gron);letter-spacing:-.02em}
.oppning h2{font-size:40px;margin:2mm 0 3mm}
.oppning .kunna{margin-top:5mm}.oppning .kunna b{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--text2)}
.oppning ul{margin:2mm 0 0;padding-left:5mm;font-size:15px;line-height:1.6}
.oppning .omf{margin-top:3mm;font-size:13px;color:var(--text2)}
.rutnat{display:grid;grid-template-columns:1fr 1fr;gap:4mm;align-items:start}
.f{border:1px solid var(--grans);border-radius:12px;padding:4mm 4.5mm;break-inside:avoid;background:#fff}
.f header{display:flex;align-items:center;gap:2.5mm;margin-bottom:1.5mm}
.f .nr{background:var(--gron);color:#fff;font-weight:700;font-size:13px;border-radius:8px;padding:1px 7px;min-width:10mm;text-align:center}
.f h3{margin:0;font-size:15px;font-weight:700}
.formel{margin:1mm 0 2mm}.fl{font-size:18px;font-weight:700;line-height:1.3}
.fl .etikett{display:block;font-size:10.5px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;line-height:1.4;margin-top:1mm}
.f p{margin:1.2mm 0;font-size:12.3px;line-height:1.42}.f .bet{color:var(--text2)}
.f .obs{background:var(--varnbg);border-left:3px solid var(--varn);border-radius:0 8px 8px 0;padding:1.5mm 2.5mm}
.register{columns:4;column-gap:6mm;list-style:none;padding:0;margin:3mm 0;font-size:12px}
.register li{break-inside:avoid;padding:.6mm 0;border-bottom:1px solid var(--grans)}.register span{font-weight:700}
.register a{display:inline-block;background:var(--yta);border-radius:6px;padding:0 4px;margin-left:2px;font-weight:500}
.tva{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start}
.linjer{height:236mm;background:repeating-linear-gradient(#fff 0 9mm,var(--grans) 9mm calc(9mm + 1px));border-top:1px solid var(--grans);margin-top:4mm}
.webb{display:none}
@media screen{body{background:#f7f8f9}.inlaga{background:#fff;padding:16px;max-width:900px}.sida{break-before:auto;margin-top:48px}
  .webb{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 12px}.webb a{display:inline-block;padding:10px 20px;border-radius:8px;border:1px solid var(--grans);font-weight:700}.webb a.pri{background:var(--gron);color:#fff;border-color:var(--gron)}
  .pop{width:auto;height:auto;min-height:0;padding:24px;margin:0 auto 0;max-width:900px}.pop .titel{font-size:clamp(48px,11vw,104px)}.pop .bild{height:220px}
  .pop .dagar{grid-template-columns:repeat(auto-fit,minmax(110px,1fr))}.linjer,.anteckn{display:none}.oppning{min-height:0}}
@media screen and (max-width:700px){.pop .pill{font-size:10.5px;padding:4px 10px}.pop .logo{font-size:17px}.pop .rader{grid-template-columns:1fr 1fr}.pop .fot{flex-direction:column;align-items:flex-start}.pop.bak .lista,.pop.bak .kal{grid-template-columns:1fr}.pop.bak .strip{flex-wrap:wrap;white-space:normal;gap:6px}.pop.bak h2{font-size:30px}.felrutor,.rutnat,.tva,.forord .tre{grid-template-columns:1fr}.steg{grid-template-columns:1fr 1fr}.register{columns:2}h1.stor{font-size:32px}.oppning .nr{font-size:72px}}
'''


def inlaga(sidor=None, extra=0):
    """Inlagan. sidor: {ankare: sidnummer} för innehållsförteckningen (andra passet)."""
    sidor = sidor or {}
    s = lambda a: str(sidor.get(a, '00'))
    bet = json.loads((SJO / 'innehall' / 'beteckningar.json').read_text(encoding='utf-8'))['beteckningar']
    alla = numrering()
    sok = {}
    for _, n, f in alla:
        for x in f['sok']:
            sok.setdefault(x, []).append(n)

    def kort(n, f):
        detalj = ''.join([
            f'<p class="bet">{h(f["bet"])}</p>' if f['bet'] else '',
            f'<p><b>Lös ut:</b> {h(f["los"])}</p>' if f['los'] else '',
            f'<p><b>Exempel:</b> {h(f["ex"])}</p>' if f['ex'] else '',
            f'<p class="obs"><b>Se upp:</b> {h(f["obs"])}</p>' if f['obs'] else ''])
        return (f'<section class="f" id="F{n}"><header><span class="nr">F{n}</span><h3>{h(f["namn"])}</h3></header>'
                f'<div class="formel">{"".join(formelrad(x) for x in f["formel"])}</div>{detalj}</section>')

    kap = []
    for k, (titel, veckor, intro, formler) in enumerate(KAPITEL):
        nrs = [n for kk, n, _ in alla if kk == k]
        kap.append(f'''<section class="sida kapitel" id="kap{k + 1}"><div class="oppning"><p class="kicker">Kapitel {k + 1} · {h(veckor)}</p><div class="nr">{k + 1:02d}</div>
<h2>{h(titel)}</h2><p class="ingress">{h(intro)}</p><div class="kunna"><b>Det här ska du kunna</b><ul>{"".join(f"<li>{h(x)}</li>" for x in KUNNA[k])}</ul></div>
<p class="omf">Formlerna F{nrs[0]}–F{nrs[-1]}</p></div>
<div class="rutnat">{"".join(kort(n, f) for kk, n, f in alla if kk == k)}</div></section>''')

    innehall = [('forord', 'Förord', 'Så använder du boken'), ('metod', 'Metoden', 'Fem steg till ett svar'), ('rimligt', 'Rimlighetskontroll', 'Värden att jämföra med')]
    innehall += [(f'kap{k + 1}', t, f'{v} · F{[n for kk, n, _ in alla if kk == k][0]}–F{[n for kk, n, _ in alla if kk == k][-1]}') for k, (t, v, _, _) in enumerate(KAPITEL)]
    innehall += [('register', 'Jag söker …', 'Register över storheter och ord'), ('bilaga', 'Bilagor', 'Beteckningar, prefix, konstanter och engelska ord')]
    kapnr = lambda a: a[3:].zfill(2) if a.startswith('kap') else ''  # bara kapitlen har nummer, samma som på öppningssidan
    toc = ''.join(f'<li><a href="#{a}"><span class="n">{kapnr(a)}</span><span>{h(t)}<span class="v">{h(v)}</span></span><span class="s">{s(a)}</span></a></li>'
                  for a, t, v in innehall)

    lank = lambda n: '<a href="#F%d">F%d</a>' % (n, n)
    register = ''.join(f'<li><span>{h(x)}</span> {" ".join(lank(n) for n in nrs)}</li>'
                       for x, nrs in sorted(sok.items(), key=lambda y: y[0].lower().replace('φ', 'f')))
    storheter = ''.join(f'<tr><td class="sym">{h(b["visa"])}</td><td>{h(b["namn"])}</td><td>{h(b["enhet"])}</td></tr>' for b in bet if b.get('enhet'))
    prefix = ''.join(f'<tr><td class="sym">{a}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>' for a, b, c, d in PREFIX)
    konst = ''.join(f'<tr><td>{h(a)}</td><td>{h(b)}</td></tr>' for a, b in KONSTANTER)
    ord_ = ''.join(f'<tr><td>{h(a)}</td><td>{h(b)}</td></tr>' for a, b in ORD)
    steg = ''.join(f'<div><b><i>{i}</i>{h(t)}</b>{h(x)}</div>' for i, (t, x) in enumerate(METOD, 1))
    felrutor = ''.join(f'<div><b>{h(t)}</b>{h(x)}</div>' for t, x in FEL)
    rimligt = ''.join(f'<tr><td><b>{h(a)}</b></td><td>{h(b)}</td></tr>' for a, b in RIMLIGT)
    motor = fnr('Motorström ur axeleffekt')

    return f'''<div class="inlaga">
<p class="webb"><a class="pri" href="Formelsamling.pdf" download>Ladda ner boken som PDF</a><a href="/sjoskolan/">Sjöskolan</a><a href="Formelblad_och_begrepp.html">Formelblad och begrepp</a></p>
<section class="titelsida"><p class="kicker">Sjöskolan · Elteknik och ellära</p><h1 class="stor">Formelsamling</h1><div class="gron"></div>
<p class="ingress">Alla formler i kursen, vecka 38–45. Med beteckningar, utlösta former, räknade exempel från fartyget och de vanligaste felen.</p>
<p class="ingress" style="color:var(--text2)">Nils Johansson</p>
<div class="kolofon">{h(UTGAVA)}. {len(alla)} formler i sju kapitel.<br>Notationen följer kursen: ett index skrivs nedsänkt, X<sub>L</sub>, och varje storhet har ett enda skrivsätt.<br>
Webbversion med klickbart register: nj22az.github.io/sjoskolan/gemensamt/Formelsamling.html<br>
Omslag i stil efter POPEYE och inlaga i stil efter LINE, enligt designbeskrivningarna i awesome-design-md-jp (MIT-licens).<br>© 2026 Nils Johansson. Får kopieras för undervisning i kursen.</div></section>

<section class="sida forord" id="forord"><p class="kicker">Förord</p><h1 class="stor">Så använder du boken</h1>
<p>Den här boken samlar alla formler du behöver i kursen Elteknik och ellära. Den följer kursens ordning: likström först, sedan växelström och trefas, därefter elsäkerhet, komponenter, elsystem och mätteknik.</p>
<p>Varje formel har ett nummer, F1, F2 och så vidare. Läraren och övningarna hänvisar till numren. Under formeln står vad beteckningarna betyder och i vilken enhet de räknas, hur du löser ut en annan storhet, ett räknat exempel och en ruta ”Se upp” med det fel som är lättast att göra.</p>
<div class="tre"><div class="yta"><b>När du övar</b>Börja i kapitlets öppningssida: där står vad du ska kunna. Räkna exemplet själv innan du läser svaret.</div>
<div class="yta"><b>När du fastnar</b>Slå upp storheten i registret ”Jag söker …”. Följ de fem stegen i metoden på nästa uppslag.</div>
<div class="yta"><b>På tentamen</b>Använd boken som hjälpmedel när läraren tillåter det. Kontrollera alltid svaret med rimlighetstabellen.</div></div>
<p>Exemplen använder värden från ett fartyg: 440 V och 60 Hz i huvudnätet, 230 V för belysning och 24 V i batterisystemet. I land är nätet 400/230 V och 50 Hz. Formlerna är desamma, bara talen skiljer.</p>
<p>Formlerna i kapitlet om elsäkerhet visar storleksordningar. Arbetsmetod, frånskiljning och kontroll bestäms av instruktioner och föreskrifter, aldrig av en uträkning.</p>
</section>
<section class="sida" id="innehall"><p class="kicker">Innehåll</p><h1 class="stor">Innehåll</h1><ol class="innehall">{toc}</ol></section>

<section class="sida" id="metod"><p class="kicker">Metoden</p><h1 class="stor">Fem steg till ett svar</h1>
<div class="steg">{steg}</div>
<div class="kort"><h2 style="font-size:20px">Exempel: strömmen till en pump ombord</h2>
<p style="margin:0 0 3mm">En sjövattenpump har märkskylten 11 kW, η = 0,90 och cos φ = 0,85. Den matas med 440 V trefas. Hur stor ström drar den vid full last?</p>
<dl class="losning"><dt>1 Givet</dt><dd>P<sub>axel</sub> = 11 kW = 11 000 W · η = 0,90 · PF = 0,85 · U<sub>L</sub> = 440 V</dd>
<dt>2 Sökt</dt><dd>Linjeströmmen I<sub>L</sub> i ampere</dd>
<dt>3 Formel</dt><dd>F{motor}: P<sub>in</sub> = P<sub>axel</sub>/η och I<sub>L</sub> = P<sub>in</sub>/(√3 · U<sub>L</sub> · PF)</dd>
<dt>4 Räkna</dt><dd>P<sub>in</sub> = 11 000/0,90 ≈ 12 220 W · I<sub>L</sub> = 12 220/(1,732 · 440 · 0,85) ≈ 12 220/648 ≈ 18,9 A</dd>
<dt>5 Rimligt?</dt><dd>Tabellen säger ungefär 1,7 A per kW vid 440 V: 11 · 1,7 ≈ 19 A. Svaret stämmer. Svar: I<sub>L</sub> ≈ 19 A.</dd></dl></div>
<h2 style="margin-top:8mm">Sex vanliga fel</h2><div class="felrutor">{felrutor}</div>
</section>
<section class="sida" id="rimligt"><p class="kicker">Metoden</p><h1 class="stor">Rimlighetskontroll</h1><p class="ingress">Stämmer storleksordningen? Jämför ditt svar med värdena här innan du lämnar in.</p>
<table class="tabell"><tr><th>Storhet</th><th>Typiskt värde</th></tr>{rimligt}</table>
<p style="font-size:12px;color:var(--text2)">Tabellen ger storleksordningar för att upptäcka räknefel. Den ersätter inte märkskyltar, datablad eller föreskrifter.</p></section>

{"".join(kap)}

<section class="sida" id="register"><p class="kicker">Register</p><h1 class="stor">Jag söker …</h1><p>Leta upp storheten eller ordet. Numret visar formeln. Beteckningar och enheter finns i bilagan.</p><ul class="register">{register}</ul></section>

<section class="sida" id="bilaga"><p class="kicker">Bilagor</p><h1 class="stor">Beteckningar och tabeller</h1>
<p>Ett index skrivs nedsänkt: X<sub>L</sub> läses ”X L” och betyder reaktansen hos spolen (L).</p>
<table class="tabell"><tr><th>Beteckning</th><th>Betyder</th><th>Enhet</th></tr>{storheter}</table>
<div class="tva" style="margin-top:6mm"><div><h2 style="font-size:20px">Prefix</h2><table class="tabell"><tr><th>Tecken</th><th>Namn</th><th>Faktor</th><th>Exempel</th></tr>{prefix}</table>
<h2 style="font-size:20px;margin-top:5mm">Konstanter och nät</h2><table class="tabell">{konst}</table></div>
<div><h2 style="font-size:20px">Svenska och engelska</h2><table class="tabell"><tr><th>Svenska</th><th>English</th></tr>{ord_}</table></div></div></section>
{'<section class="sida anteckn"><p class="kicker">Anteckningar</p><div class="linjer"></div></section>' * (1 + extra)}
</div>'''


def dokument(kropp, titel, fot=False):
    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{h(titel)}</title><meta name="description" content="Formelsamling för kursen Elteknik och ellära: alla formler med beteckningar, utlösta former, exempel från fartyget och vanliga fel.">
<link rel="canonical" href="{WEBB}"><link rel="icon" href="/assets/images/apple-touch-icon.png">{FONTER}
<script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script>
<style>@page{{size:A4;margin:{'14mm 14mm 16mm' if fot else '0'}}}{POP_CSS}{LINE_CSS}</style></head><body>{kropp}</body></html>
'''


def webbsida():
    return dokument(omslag() + inlaga() + baksida(), 'Formelsamling · Elteknik och ellära · Sjöskolan')


def skriv_ut(html_text, pdf, fot):
    skript = '''const {chromium}=require(process.argv[2]);(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.argv[3],{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const fot=process.argv[5]==='1';await p.pdf({path:process.argv[4],format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:fot,
headerTemplate:'<span></span>',footerTemplate:'<div style="width:100%;font:9px Arial;color:#666;padding:0 14mm;display:flex;justify-content:space-between"><span>Formelsamling · Elteknik och ellära</span><span class=pageNumber></span></div>'});
await b.close();})();'''
    rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True, check=True).stdout.strip()
    with tempfile.TemporaryDirectory() as d:
        js, sida = Path(d) / 'pdf.cjs', Path(d) / 'sida.html'
        js.write_text(skript)
        sida.write_text(html_text, encoding='utf-8')
        subprocess.run(['node', str(js), rot + '/playwright', str(sida), str(pdf), '1' if fot else '0'], check=True)


def pdf():
    import pymupdf
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        skriv_ut(dokument(omslag(), 'Omslag'), d / 'omslag.pdf', False)
        skriv_ut(dokument(baksida(), 'Baksida'), d / 'baksida.pdf', False)
        # Pass 1: inlagan med platshållare, läs målsidorna för innehållets länkar.
        skriv_ut(dokument(inlaga(), 'Inlaga', True), d / 'inlaga1.pdf', True)
        doc = pymupdf.open(d / 'inlaga1.pdf')
        sidor = {}
        for sida in doc:
            for l in sida.get_links():
                namn = l.get('nameddest') or ''
                if namn and l.get('page', -1) >= 0 and not re.fullmatch(r'F\d+', namn) and namn not in sidor:
                    sidor[namn] = l['page'] + 1
        doc.close()
        # Pass 2: med sidnummer. Omslag + inlaga + baksida ska bli ett jämnt antal sidor (tryck dubbelsidigt),
        # annars läggs en anteckningssida till.
        skriv_ut(dokument(inlaga(sidor), 'Inlaga', True), d / 'inlaga2.pdf', True)
        if pymupdf.open(d / 'inlaga2.pdf').page_count % 2:
            skriv_ut(dokument(inlaga(sidor, 1), 'Inlaga', True), d / 'inlaga2.pdf', True)
        bok = pymupdf.open()
        for f in ('omslag.pdf', 'inlaga2.pdf', 'baksida.pdf'):
            bok.insert_pdf(pymupdf.open(d / f))
        # Inlagans interna länkar (innehåll, register) följer inte med vid sammanslagningen: lägg in dem igen, en sida förskjutna.
        inl = pymupdf.open(d / 'inlaga2.pdf')
        for i, sida in enumerate(inl):
            for l in sida.get_links():
                if l.get('page', -1) >= 0:
                    bok[i + 1].insert_link({'kind': pymupdf.LINK_GOTO, 'from': l['from'], 'page': l['page'] + 1, 'to': l.get('to', pymupdf.Point(0, 0)), 'zoom': 0})
        bok.set_metadata({'title': 'Formelsamling · Elteknik och ellära', 'author': 'Nils Johansson', 'subject': 'Sjöskolan, vecka 38–45', 'keywords': 'elteknik, formler, fartyg'})
        bok.save(UT_PDF, garbage=3, deflate=True)
        return sidor, bok.page_count


if __name__ == '__main__':
    UT_HTML.write_text(webbsida(), encoding='utf-8')
    print('skrev', UT_HTML.relative_to(SJO.parent))
    if '--html' not in sys.argv:
        sidor, n = pdf()
        print('skrev', UT_PDF.relative_to(SJO.parent), f'({n} sidor; innehåll: {sidor})')
