#!/usr/bin/env python3
"""Formelsamling för hela kursen: gemensamt/Formelsamling.html och gemensamt/Formelsamling.pdf (A4).

Formlerna står här, i kursens ordning (vecka 38–45), numrerade F1, F2 … så att lärare och elever kan hänvisa till
dem. Varje formel har beteckningar med enhet, de utlösta formerna, ett räknat exempel med fartygsvärden och en
varning för det vanligaste felet. Registret ”Jag söker …” byggs ur formlernas sökord, och beteckningslistan ur
innehall/beteckningar.json. Notationen är kursens: index skrivs X_{L} och ritas nedsänkt.

    python3 sjoskolan/verktyg/formelsamling/bygg.py          # skriver HTML och PDF (kräver Node och Playwright)
    python3 sjoskolan/verktyg/formelsamling/bygg.py --html   # bara HTML
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
UTGAVA = 'Utgåva 29 september 2026'


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
          'I² · R och U²/R gäller bara för resistiv last (DC eller ren resistans).', ['effekt']),
        F('Energi', 'E = P · t', 'E energi (J = Ws, eller kWh) · t tid (s eller h)',
          'En värmare på 2 kW i 3 h: E = 6 kWh.', 'P = E/t · t = E/P',
          'kW gånger h ger kWh. 1 kWh = 3,6 MJ.', ['energi']),
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
        F('Spänningsdelare', 'U_{ut} = U_{in} · R_{2}/(R_{1} + R_{2})', 'U_{ut} spänningen över R_{2}',
          '12 V över 1 kΩ och 2 kΩ: U_{ut} = 12 · 2/3 = 8 V.', '',
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
        F('Ledares resistans', 'R = ρ · l/A', 'ρ resistivitet (Ω·mm²/m) · l längd (m) · A area (mm²)',
          'Kabel 2 × 50 m, 2,5 mm² koppar: R = 0,0175 · 100/2,5 = 0,70 Ω.', 'l = R · A/ρ · A = ρ · l/R',
          'Slingan är fram och tillbaka: l = 2 · kabelns längd.', ['resistans', 'kabel', 'ledare']),
        F('Spänningsfall i kabel', ['ΔU = I · R_{slinga}', 'U_{last} = U_{källa} − ΔU'], 'ΔU spänningsfall (V) · R_{slinga} ledarnas resistans (Ω)',
          '10 A genom 0,70 Ω: ΔU = 7,0 V, lasten får 230 − 7 = 223 V.', '',
          'Förlusten i kabeln är I² · R. Dubbel ström ger fyra gånger förlusten.', ['spänningsfall', 'kabel']),
        F('Thévenins ekvivalent', 'I_{last} = U_{th}/(R_{th} + R_{last})', 'U_{th} tomgångsspänning (V) · R_{th} inre resistans med källan kortsluten (Ω)',
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
          'Multimetern visar RMS. Oscilloskopet visar topp och topp–topp.', ['toppvärde', 'effektivvärde', 'rms']),
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
        F('Fasvinkel och effektfaktor', ['φ = arctan(X/R)', 'cos φ = R/|Z|'], 'φ > 0: induktiv, strömmen släpar',
          'R = 30 Ω och X = 40 Ω: φ ≈ 53,1° och cos φ = 0,60.', '',
          'Räknaren i DEG när vinkeln ska vara i grader.', ['fasvinkel', 'effektfaktor', 'cos φ']),
        F('Resonansfrekvens', 'f_{0} = 1/(2π · √(L · C))', 'Vid f_{0} är X_{L} = X_{C} och |Z| = R',
          'L = 10 mH och C = 10 µF: f_{0} ≈ 503 Hz.', '',
          'Räkna L · C först, sedan roten.', ['resonans', 'frekvens']),
        F('Effekt i växelström (enfas)', ['S = U · I', 'P = S · PF', 'Q = S · sin φ', 'S² = P² + Q²'], 'S skenbar (VA) · P aktiv (W) · Q reaktiv (var) · PF effektfaktor (sinus: PF = cos φ)',
          '230 V, 10 A, cos φ = 0,80: S = 2,3 kVA, P = 1,84 kW, Q = 1,38 kvar.', '',
          'Med övertoner är PF lägre än cos φ. Enheterna skiljer storheterna åt: W, VA och var.', ['effekt', 'skenbar effekt', 'reaktiv effekt']),
        F('Ström vid given effekt (enfas)', 'I = P/(U · PF)', '',
          '1,2 kW vid 230 V och PF = 0,80: I ≈ 6,5 A.', 'P = U · I · PF',
          'Lägre PF ger större ström för samma aktiva effekt.', ['ström', 'effekt']),
        F('Reaktiv effekt i kondensator', 'Q_{C} = U²/X_{C}', 'Q_{C} (var)',
          '230 V över X_{C} = 31,8 Ω: Q_{C} ≈ 1,66 kvar.', '',
          'Kondensatorns reaktiva effekt tar ut en del av den induktiva.', ['reaktiv effekt', 'kondensator', 'faskompensering']),
    ]),
    ('Trefas', 'Vecka 41',
     'Tre faser med 120° mellan sig. Håll isär linjevärden (mellan ledarna) och grenvärden (över en del av lasten).', [
        F('Huvud- och fasspänning', 'U_{L} = √3 · U_{F}', 'U_{L} huvudspänning (fas–fas) · U_{F} fasspänning (fas–neutral)',
          '440 V ombord: U_{F} = 440/√3 ≈ 254 V. I land: 400 V och 231 V.', 'U_{F} = U_{L}/√3',
          'Huvudspänningen är √3, inte 2, gånger fasspänningen.', ['spänning', 'trefas', 'fasspänning']),
        F('Fasförskjutning', '120° = T/3', 'Tiden mellan två faser',
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
        F('Neutralström', ['I_{N} = −(I_{1} + I_{2} + I_{3})', 'symmetrisk last: I_{N} = 0'], 'Strömmarna adderas som visare, med sina vinklar, inte som vanliga tal',
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
          '24 V-batteri, 0,01 Ω genom en skiftnyckel: I = 2 400 A.', '',
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
        F('Jordfelsbrytarens differensström', 'I_{Δ} = |I_{ut} − I_{retur}|', 'I_{Δ} differensström (mA)',
          '5 000 mA ut och 4 970 mA tillbaka: I_{Δ} = 30 mA.', '',
          'Jordfelsbrytaren reagerar inte på överlast. Där behövs ett överströmsskydd.', ['jordfel', 'jordfelsbrytare']),
    ]),
    ('Elsystem och fördjupad mätteknik', 'Vecka 44',
     'Jordningssystem, fel och isolation. Ombord är IT-nätet vanligt: första jordfelet ger larm, inte bortkoppling.', [
        F('Felström i modell', 'I_{k} ≈ U_{0}/Z_{s}', 'U_{0} spänning mot jord (V) · Z_{s} felslingans impedans (Ω)',
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
        F('Tolerans', 'R_{nom} · (1 ± p/100)', 'p tolerans (%)',
          '470 Ω ±10 %: 423–517 Ω.', '', 'Ett värde precis på gränsen är godkänt.', ['tolerans', 'resistans']),
        F('Strömtång', 'I = U_{tång}/k', 'k känslighet (mV/A)',
          '100 mV/A och 1,5 V: I = 1 500/100 = 15 A.', '',
          'Omslut en ledare. Båda ledarna i samma kabel tar ut varandra.', ['strömtång', 'ström']),
        F('Oscilloskop', ['T = rutor · tid/ruta', 'û = rutor · volt/ruta · probfaktor'], '',
          '4 rutor · 5 ms/ruta: T = 20 ms, alltså 50 Hz.', 'f = 1/T',
          'Räkna inte probfaktorn två gånger om oscilloskopet redan är inställt på 10:1.', ['oscilloskop', 'period']),
        F('Upprepade mätningar', ['medelvärde = Σx/n', 'variationsbredd = x_{max} − x_{min}', 'avvikelse i % = 100 · |x − medel|/medel'], 'n antal mätningar',
          '400, 402 och 398 V: medel 400 V, största avvikelse 0,5 %.', '',
          'Skilj på spridning och fel. Ett systematiskt fel syns inte i spridningen.', ['medelvärde', 'avvikelse']),
        F('Resistans ur spänningsfall', 'R = ΔU/I', 'ΔU spänningsfall över sträckan (V) vid strömmen I (A)',
          'Före: 6 V vid 3 A ger 2,0 Ω. Efter: 0,3 V vid 3 A ger 0,10 Ω.', '',
          'Jämför bara värden mätta vid samma ström och i samma punkter.', ['resistans', 'felsökning', 'spänningsfall']),
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


def h(s):
    s = html.escape(s, quote=False)
    return re.sub(r'_\{([^{}]*)\}', r'<sub>\1</sub>', s)


def bygg_html():
    bet = json.loads((SJO / 'innehall' / 'beteckningar.json').read_text(encoding='utf-8'))['beteckningar']
    nr, sok, kap_html, toc = 0, {}, [], []
    for k, (titel, veckor, intro, formler) in enumerate(KAPITEL, 1):
        rader = []
        for f in formler:
            nr += 1
            for s in f['sok']:
                sok.setdefault(s, []).append(nr)
            formel = ''.join(f'<div class="fl">{h(x)}</div>' for x in f['formel'])
            detalj = ''.join([
                f'<p class="bet">{h(f["bet"])}</p>' if f['bet'] else '',
                f'<p class="los"><b>Lös ut:</b> {h(f["los"])}</p>' if f['los'] else '',
                f'<p class="ex"><b>Exempel:</b> {h(f["ex"])}</p>' if f['ex'] else '',
                f'<p class="obs"><b>Se upp:</b> {h(f["obs"])}</p>' if f['obs'] else ''])
            rader.append(f'<section class="f" id="F{nr}"><div class="nr">F{nr}</div><div class="kropp"><h3>{h(f["namn"])}</h3>'
                         f'<div class="formel">{formel}</div>{detalj}</div></section>')
        forsta = nr - len(formler) + 1
        toc.append(f'<li><a href="#kap{k}"><span>{k}. {h(titel)}</span><span class="v">{h(veckor)} · F{forsta}–F{nr}</span></a></li>')
        kap_html.append(f'<section class="kap" id="kap{k}"><header><p class="kicker">{k} · {h(veckor)}</p><h2>{h(titel)}</h2><p class="intro">{h(intro)}</p></header><div class="rutnat">{"".join(rader)}</div></section>')

    lank = lambda n: '<a href="#F%d">F%d</a>' % (n, n)
    register = ''.join(f'<li><span>{h(s)}</span> {" ".join(lank(n) for n in nrs)}</li>'
                       for s, nrs in sorted(sok.items(), key=lambda x: x[0].lower().replace('φ', 'f')))
    storheter = ''.join(f'<tr><td class="sym">{h(b["visa"])}</td><td>{h(b["namn"])}</td><td>{h(b["enhet"])}</td></tr>'
                        for b in bet if b.get('enhet'))
    prefix = ''.join(f'<tr><td class="sym">{a}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>' for a, b, c, d in PREFIX)
    konst = ''.join(f'<tr><td>{h(a)}</td><td>{h(b)}</td></tr>' for a, b in KONSTANTER)
    ord_ = ''.join(f'<tr><td>{h(a)}</td><td>{h(b)}</td></tr>' for a, b in ORD)

    return f'''<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Formelsamling · Elteknik och ellära · Sjöskolan</title><meta name="description" content="Alla formler i kursen Elteknik och ellära, med beteckningar, utlösta former, exempel och vanliga fel.">
<link rel="canonical" href="https://nj22az.github.io/sjoskolan/gemensamt/Formelsamling.html"><link rel="icon" href="/assets/images/apple-touch-icon.png">
<script src="/sjoskolan/gemensamt/oversattning.js?v=20260927" defer></script>
<style>
@page{{size:A4;margin:14mm 14mm 16mm}}
:root{{--bla:#064f91;--ljus:#edf4f9;--linje:#cad8e2;--text:#16283a;--dov:#4d6579;--varn:#8a4b00;--varnbg:#fff6ea}}
*{{box-sizing:border-box}}html{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{{margin:0;background:#fff;color:var(--text);font:15px/1.45 Carlito,Calibri,"Segoe UI",Arial,sans-serif}}
main{{max-width:190mm;margin:0 auto;padding:16px}}
a{{color:var(--bla)}}sub{{font-size:.72em;line-height:0}}
.webb{{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 16px}}.webb a{{display:inline-block;padding:8px 14px;border-radius:8px;border:1px solid var(--bla);text-decoration:none;font-weight:700}}.webb a.pri{{background:var(--bla);color:#fff}}
.omslag{{border-bottom:4px solid var(--bla);padding-bottom:10px;margin-bottom:14px}}
.omslag .kicker{{margin:0;color:var(--dov);font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:12px}}
.omslag h1{{margin:4px 0 2px;font-size:34px;color:var(--bla)}}.omslag p{{margin:2px 0}}
.sa{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}}
.sa div{{background:var(--ljus);border-radius:10px;padding:8px 10px}}.sa b{{display:block;color:var(--bla);font-size:20px}}
h2{{font-size:22px;margin:0;color:var(--bla)}}
.toc{{list-style:none;padding:0;margin:6px 0 12px}}.toc a{{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px dotted var(--linje);text-decoration:none;color:var(--text)}}.toc .v{{color:var(--dov)}}
.tva{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
table{{border-collapse:collapse;width:100%;font-size:13px}}th,td{{text-align:left;padding:3px 6px;border-bottom:1px solid var(--linje);vertical-align:top}}th{{color:var(--dov);font-weight:700}}
td.sym{{font-weight:700;color:var(--bla);white-space:nowrap}}
.regsida{{break-before:page}}.register{{columns:4;column-gap:16px;list-style:none;padding:0;margin:6px 0;font-size:13px}}.register li{{break-inside:avoid;padding:1px 0}}.register span{{font-weight:700}}
.kap{{margin-top:22px}}.kap:first-of-type{{break-before:page}}.kap header{{border-bottom:3px solid var(--bla);margin-bottom:6px;break-after:avoid;break-inside:avoid}}
.kap .kicker{{margin:0;color:var(--dov);font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase}}.kap .intro{{margin:2px 0 6px;color:var(--dov)}}
.rutnat{{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-items:start}}.f{{display:grid;grid-template-columns:34px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid var(--linje);break-inside:avoid}}
.f .nr{{font-weight:700;color:#fff;background:var(--bla);border-radius:7px;text-align:center;height:22px;line-height:22px;font-size:12.5px}}
.f h3{{margin:0;font-size:15px}}
.formel{{margin:3px 0 4px}}.fl{{font-size:17px;font-weight:700;color:var(--bla);line-height:1.3}}
.f p{{margin:2px 0;font-size:12.5px;line-height:1.35}}.bet{{color:var(--dov)}}.los b,.ex b{{color:var(--text)}}
.obs{{background:var(--varnbg);border-left:4px solid var(--varn);padding:2px 8px;border-radius:0 6px 6px 0}}.obs b{{color:var(--varn)}}
.bilaga{{break-before:page}}.bilaga h2{{margin-top:6px}}
@media screen and (max-width:640px){{.rutnat{{grid-template-columns:1fr}}.sa{{grid-template-columns:1fr 1fr}}.tva{{grid-template-columns:1fr}}.register{{columns:2}}.fl{{font-size:18px}}}}
@media print{{.webb{{display:none}}main{{padding:0}}}}
</style></head><body><main>
<p class="webb"><a class="pri" href="Formelsamling.pdf" download>Ladda ner som PDF</a> <a href="/sjoskolan/">Sjöskolan</a> <a href="Formelblad_och_begrepp.html">Formelblad och begrepp</a></p>
<div class="omslag"><p class="kicker">Sjöskolan · Elteknik och ellära</p><h1>Formelsamling</h1><p>Alla formler i kursen, vecka 38–45, i samma form som i genomgångar, övningar och tentamen. {UTGAVA}.</p></div>
<h2>Så använder du formelsamlingen</h2>
<div class="sa"><div><b>1</b>Skriv upp det som är givet, med enhet.</div><div><b>2</b>Skriv vad som söks. Leta upp storheten i <a href="#register">Jag söker …</a></div><div><b>3</b>Välj formeln. Lös ut det sökta innan du sätter in tal.</div><div><b>4</b>Räkna i grundenheter och gör en rimlighetskontroll med ”Se upp”.</div></div>
<div class="tva"><div><h2>Innehåll</h2><ol class="toc">{"".join(toc)}<li><a href="#bilaga"><span>Beteckningar, prefix och engelska ord</span><span class="v">bilaga</span></a></li></ol></div>
<div><h2>Prefix</h2><table><tr><th>Tecken</th><th>Namn</th><th>Faktor</th><th>Exempel</th></tr>{prefix}</table><h2 style="margin-top:10px">Konstanter och nät</h2><table>{konst}</table></div></div>
<section class="regsida"><h2 id="register">Jag söker …</h2><p>Leta upp storheten eller ordet. Numret visar formeln. Storheterna och enheterna finns i bilagan sist.</p><ul class="register">{register}</ul></section>
{"".join(kap_html)}
<section class="bilaga" id="bilaga"><h2>Beteckningar och enheter</h2><p>Ett index skrivs nedsänkt: X<sub>L</sub> läses ”X L” och betyder reaktansen hos spolen (L).</p>
<div class="tva"><table><tr><th>Beteckning</th><th>Betyder</th><th>Enhet</th></tr>{storheter}</table>
<div><h2>Svenska och engelska</h2><table><tr><th>Svenska</th><th>English</th></tr>{ord_}</table></div></div></section>
</main></body></html>
'''


def pdf():
    skript = '''const {chromium}=require(process.argv[2]);(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.argv[3],{waitUntil:'load'});await p.pdf({path:process.argv[4],format:'A4',printBackground:true,displayHeaderFooter:true,
headerTemplate:'<span></span>',footerTemplate:'<div style="width:100%;font:9px Carlito,Arial;color:#4d6579;padding:0 14mm;display:flex;justify-content:space-between"><span>Sjöskolan · Formelsamling · Elteknik och ellära</span><span>Sida <span class=pageNumber></span> av <span class=totalPages></span></span></div>',
margin:{top:'14mm',bottom:'16mm',left:'14mm',right:'14mm'}});await b.close();})();'''
    rot = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True, check=True).stdout.strip()
    with tempfile.TemporaryDirectory() as d:
        js = Path(d) / 'pdf.cjs'
        js.write_text(skript)
        subprocess.run(['node', str(js), rot + '/playwright', str(UT_HTML), str(UT_PDF)], check=True)


if __name__ == '__main__':
    UT_HTML.write_text(bygg_html(), encoding='utf-8')
    print('skrev', UT_HTML.relative_to(SJO.parent))
    if '--html' not in sys.argv:
        pdf()
        print('skrev', UT_PDF.relative_to(SJO.parent))
