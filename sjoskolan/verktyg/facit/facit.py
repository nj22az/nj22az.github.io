#!/usr/bin/env python3
"""Facit till Formelstöd och övningar, vecka 39–45.

Lägger in en dold ruta "Kontrollera ditt svar" sist i varje övning. Kör om efter ändringar:

    python3 sjoskolan/verktyg/facit/facit.py

Räkneuppgifter får svar med enhet och en kort kontroll. Resonemangsuppgifter får de punkter
ett bra svar tar upp, inte en färdig text att skriva av.
"""
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

F = {
# v39_01 Effekt och energi
'v39_01-q1': 'P = 24 V · 3,0 A = 72 W.',
'v39_01-q2': 't = 40/60 h ≈ 0,667 h. E = 1,5 kW · 0,667 h = 1,0 kWh.',
'v39_01-q3': '40 W · 5 h = 200 Wh. 2 · 60 W · 3 h = 360 Wh. Totalt 560 Wh = 0,56 kWh.',
'v39_01-q4': 'Pᵢₙ = 600 W / 0,75 = 800 W. Förlust = 800 − 600 = 200 W.',
'v39_01-q5': 'I = 24 V / 12 Ω = 2,0 A. P = 24 V · 2,0 A = 48 W.',
'v39_01-q6': 'R = 0,0175 · 20 m / 2,5 mm² = 0,14 Ω.',
'v39_01-q7': 'ΔU = 5,0 A · 0,140 Ω = 0,70 V. Ulast = 24 − 0,70 = 23,3 V. Fall = 100 · 0,70/24 ≈ 2,9 %.',
'v39_01-q8': 'Vid 5 A: 25 · 0,20 = 5 W. Vid 10 A: 100 · 0,20 = 20 W. Dubbel ström ger fyra gånger förlusten.',
'v39_01-q9': 'Rmax = 0,8 V / 8 A = 0,10 Ω. Amin = 0,0175 · 24 m / 0,10 Ω = 4,2 mm². Välj närmast större standardarea och kontrollera även strömtålighet.',
'v39_01-q10': 'Pᵢₙ = 120/0,80 = 150 W. E = 150 W · 2 h = 300 Wh. I = 150/24 = 6,25 A. Q = 6,25 A · 2 h = 12,5 Ah.',
# v39_02 Kirchhoff
'v39_02-q1': 'Iₓ = 8,0 − 3,0 = 5,0 A ut ur noden. Kontroll: 8,0 = 3,0 + 5,0.',
'v39_02-q2': 'Iₓ = 2,0 − 3,5 = −1,5 A. Strömmen är 1,5 A och går in i noden, alltså mot den ritade pilen.',
'v39_02-q3': 'Uₓ = 24 − 6 − 10 = 8 V.',
'v39_02-q4': 'I = 12 V / 6 Ω = 2,0 A. U₁ = 4 V, U₂ = 8 V. Kontroll: 4 + 8 = 12 V.',
'v39_02-q5': 'I₁ = 12/6 = 2,0 A, I₂ = 12/4 = 3,0 A, I = 5,0 A.',
'v39_02-q6': 'Rp = 2 · 2/(2 + 2) = 1 kΩ. Uut = 12 · 1/(1 + 1) = 6,0 V. Utan last hade det varit 8,0 V.',
'v39_02-q7': 'I₁ (3 Ω) = 6 · 6/9 = 4,0 A, I₂ (6 Ω) = 2,0 A. Kontroll: 4 · 3 = 2 · 6 = 12 V.',
'v39_02-q8': '2(12 − Vₐ) + 2(9 − Vₐ) = 3Vₐ ger 42 = 7Vₐ och Vₐ = 6,0 V.',
'v39_02-q9': 'Uth = 12 · 2/3 = 8,0 V. Rth = 1 · 2/3 = 2/3 kΩ ≈ 0,667 kΩ.',
'v39_02-q10': 'Ilast = 8 V / (2/3 + 2) kΩ = 3,0 mA. Ulast = 3,0 mA · 2 kΩ = 6,0 V, samma som i övning 6.',
# v40_01 Sinus
'v40_01-q1': 'T = 1/50 = 0,020 s = 20 ms.',
'v40_01-q2': 'f = 1/0,0040 s = 250 Hz.',
'v40_01-q3': 'û = 1,414 · 12,0 ≈ 17,0 V.',
'v40_01-q4': 'U = 34,0/1,414 ≈ 24,0 V.',
'v40_01-q5': 'û = 10,0 V. U = 10,0/1,414 ≈ 7,07 V.',
'v40_01-q6': '2π · 50 · 0,005 = π/2 rad. u = 17,0 · sin(π/2) = 17,0 V, den positiva toppen.',
'v40_01-q7': '2π · 50 · 0,015 = 3π/2 rad. u = 17,0 · (−1) = −17,0 V, den negativa toppen.',
'v40_01-q8': 'T = 20 ms. |φ| = 360° · 2,0/20 = 36°.',
'v40_01-q9': 'P = 12,0²/24 = 6,0 W.',
'v40_01-q10': 'Sinus: 12/1,414 ≈ 8,49 V RMS. Fyrkant: 12 V RMS. Medelvärdet är 0 V för båda eftersom positiv och negativ yta är lika stora.',
# v40_02 Reaktans
'v40_02-q1': 'Xᴸ = 2π · 50 · 0,10 ≈ 31,4 Ω.',
'v40_02-q2': 'Xᶜ = 1/(2π · 50 · 100 · 10⁻⁶) ≈ 31,8 Ω.',
'v40_02-q3': '|Z| = √(900 + 1 600) = 50 Ω.',
'v40_02-q4': '|Z| = 50 Ω. I = 100/50 = 2,0 A.',
'v40_02-q5': 'Uᴿ = 60 V, Uᴸ = 80 V, U = √(60² + 80²) = 100 V. Spänningarna adderas som visare, inte som tal.',
'v40_02-q6': 'φ = arctan(40/30) ≈ 53,1°. Strömmen släpar spänningen.',
'v40_02-q7': '|Z| = 100 Ω, I = 2,0 A, φ = arctan(−80/60) ≈ −53,1°. Strömmen leder spänningen.',
'v40_02-q8': 'Xᴸ fördubblas. Xᶜ halveras.',
'v40_02-q9': 'X = 50 − 10 = 40 Ω. |Z| = 50 Ω. I = 2,0 A.',
'v40_02-q10': 'X = 0. I = 100/20 = 5,0 A och φ = 0°. Spänningen över spolen och kondensatorn är ändå 5,0 · 40 = 200 V var.',
# v40_03 Effekt
'v40_03-q1': 'S = 230 · 4,0 = 920 VA.',
'v40_03-q2': 'P = 920 · 0,75 = 690 W.',
'v40_03-q3': 'S = √(600² + 800²) = 1 000 VA. PF = 600/1 000 = 0,60.',
'v40_03-q4': 'P = 1,6 kW. sin φ = 0,60. Q = 1,2 kvar.',
'v40_03-q5': 'E = 1,60 kW · 3 h = 4,8 kWh.',
'v40_03-q6': 'I = 1 840/(230 · 0,80) = 10,0 A.',
'v40_03-q7': 'Qkondensator = −4 kvar, alltså 4 kvar kapacitiv reaktiv effekt.',
'v40_03-q8': 'Före: 1 800/(230 · 0,60) ≈ 13,0 A. Efter: 1 800/(230 · 0,90) ≈ 8,70 A.',
'v40_03-q9': '(8/12)² ≈ 0,44. Cirka 44 % av förlusten återstår, en minskning med cirka 56 %.',
'v40_03-q10': 'PF = 800/1 000 = 0,80. Den är lägre än cos φ = 0,95 eftersom övertonerna ökar strömmen och S utan att bidra till P.',
# v41_01 Trefasgrunder
'v41_01-q1': '360°/3 = 120°.',
'v41_01-q2': 'T = 20 ms. Δt = 20 · 120/360 ≈ 6,67 ms.',
'v41_01-q3': 'Uꜰ = 400/1,732 ≈ 231 V mellan fas och neutral.',
'v41_01-q4': 'Uᴸ = 1,732 · 120 ≈ 208 V, inte 240 V.',
'v41_01-q5': 'Ugren = 12,0/1,732 ≈ 6,93 V.',
'v41_01-q6': 'IN = 0 A. Tre lika visare med 120° emellan har summan noll.',
'v41_01-q7': 'IN = 5,0 A. All ström från den enda lasten återvänder i neutralledaren.',
'v41_01-q8': 'IN = √(100 + 100 − 100) = 10 A.',
'v41_01-q9': 'Medel = 400 V. Största avvikelse 2 V = 0,5 %.',
'v41_01-q10': 'Ett bra svar tar upp: utan neutral ligger de två lasterna i serie mellan två faser. Huvudspänningen delas i förhållande till impedanserna. Lasten med störst impedans (minst effekt) får den högsta spänningen, som kan bli mycket högre än fasspänningen.',
# v41_02 Y och Δ
'v41_02-q1': 'Ugren = 400/1,732 ≈ 231 V.',
'v41_02-q2': 'Igren = 231/40 ≈ 5,77 A. Iᴸ = 5,77 A.',
'v41_02-q3': 'Igren = 400/40 = 10 A. Iᴸ = 1,732 · 10 ≈ 17,3 A, tre gånger linjeströmmen i Y.',
'v41_02-q4': 'P = 1,732 · 400 · 10 · 0,80 ≈ 5 540 W ≈ 5,54 kW.',
'v41_02-q5': 'S ≈ 6,93 kVA. sin φ = 0,60. Q ≈ 4,16 kvar.',
'v41_02-q6': 'Y. Då får varje lindning 400/1,732 ≈ 231 V, vilket stämmer med 230 V.',
'v41_02-q7': 'Δ. Då får varje lindning 400 V, vilket stämmer med Δ-märkningen 400 V.',
'v41_02-q8': 'Pᵢₙ = 5,5/0,88 = 6,25 kW. Iᴸ = 6 250/(1,732 · 400 · 0,80) ≈ 11,3 A.',
'v41_02-q9': 'I₂ = 100 000/(1,732 · 400) ≈ 144 A.',
'v41_02-q10': 'Ptotal = 3,6 kW. Formeln med √3 förutsätter lika ström och lika effektfaktor i alla faser. Här skiljer sig faserna.',
# v41_03 Fysisk träff
'v41_03-q1': 'Nej. 12 V säger inget om skyddande separation. Instruktören behöver dokumentation om matande transformator eller källa, separation och märkning innan riggen används.',
'v41_03-q2': 'I = 12 V / 3 kΩ = 4,0 mA. U₂ = 4,0 mA · 2 kΩ = 8,0 V. Voltmetern kopplas parallellt över R₂.',
'v41_03-q3': '3,98 + 7,96 = 11,94 V. Resten är 0,00 V, så slinglagen stämmer inom avläsningens upplösning.',
'v41_03-q4': 'û = 1,414 · 12,1 ≈ 17,1 V.',
'v41_03-q5': 'Uförv ≈ 6,93 V. ΔU = 6,90 − 6,93 ≈ −0,03 V. Uppmätt är något lägre än beräknat.',
'v41_03-q6': 'Nej. START och K1:s hållkontakt är båda öppna, så ingen väg når spolen.',
'v41_03-q7': 'Den sluter när K1 drar och tar över strömvägen parallellt med START. K1 hålls då kvar när START släpps.',
'v41_03-q8': 'Hypotes: hållvägen är bruten, till exempel att K1:s NO-kontakt inte sluter eller att en ledare till den är av. Kontroll: mät över hållkontakten med K1 draget. Ungefär 0 V stöder att den sluter. Full spänning stöder hypotesen.',
'v41_03-q9': 'Gränser 950–1 050 Ω. 1,03 kΩ = 1 030 Ω ligger inom toleransen.',
'v41_03-q10': 'Exempel: Summan av spänningsfallen, 3,98 + 7,96 = 11,94 V, är lika med källspänningen. Mätningen stöder slinglagen i detta driftfall. Den visar inget om andra laster eller om mätarens osäkerhet.',
# v42_01 Elektriska risker
'v42_01-q1': 'Ett bra svar tar upp två av: vatten minskar övergångsresistansen, metalldäcket ger en ledande väg till kroppen, lampan är skadad så isolationen kan vara bruten, och skyddsfunktionen är inte verifierad.',
'v42_01-q2': 'Strömgenomgång: strömmen går genom kroppen och kan påverka hjärta, muskler och vävnad. Ljusbåge: värme, tryck, ljus och smält metall skadar utifrån, även om personen inte ingår i strömvägen.',
'v42_01-q3': '60 V, potentialskillnaden mellan de två punkter personen kan beröra samtidigt.',
'v42_01-q4': 'I = 24/2 000 = 0,012 A = 12 mA. Kroppens resistans varierar kraftigt med fukt, kontaktyta och spänning. Därför ger ett antaget R ingen säker gräns.',
'v42_01-q5': 'STOPP bryter styrningen. Kraftmatning, reservmatning eller lagrad energi kan finnas kvar. Spänningslöshet måste kontrolleras med provare enligt arbetsplanen.',
'v42_01-q6': 'Mycket stor kortslutningsström kan ge kraftig värme, ljusbåge, brand eller brännskador, till exempel om ett verktyg eller en ring kortsluter polerna.',
'v42_01-q7': 'Hjälparen får inte själv bli exponerad. Bryt strömmen eller se till att platsen är säkrad innan du rör personen. Larma 112.',
'v42_01-q8': 'Avbryt arbetet och gå till säker plats. Kontakta sjukvården, eftersom skador kan visa sig senare. Rapportera händelsen enligt arbetsplatsens rutin.',
'v42_01-q9': 'Ett tillbud visar en brist som nästa gång kan ge personskada. Rapporten gör det möjligt att hitta orsaken och förebygga upprepning.',
'v42_01-q10': 'Direkt: ta sladden ur bruk och märk den. Förebyggande: se över förkontrollen, förvaringen och hur skadan uppstod.',
# v42_02 Regler
'v42_02-q1': 'Föreskriften är bindande inom sitt område. Standarden beskriver en teknisk metod eller nivå som kan användas för att uppfylla kraven. Tillämpningsområdet avgör vilka dokument som gäller.',
'v42_02-q2': 'SS-EN 50110-1 utgåva 4:2024. Utgåva 3:2013 är inaktuell efter 29 maj 2026. Kontrollera också lokala anvisningar.',
'v42_02-q3': 'Arbete utan spänning, arbete med spänning, arbete inom närområde och arbete utanför närområde.',
'v42_02-q4': 'Efter frånskiljning kan någon tillkoppla igen, spänningslösheten är inte kontrollerad och närliggande delar kan vara spänningssatta. Skydd mot tillkoppling, spänningslöshetskontroll, jordning och kortslutning där det krävs, samt skydd mot närliggande delar behövs.',
'v42_02-q5': 'Två av: vilket objekt och vilken arbetsgräns som avses, vem som ansvarar, att ”nog” betyder att ingen kontroll är gjord, och vilka kontroller som faktiskt har utförts.',
'v42_02-q6': 'Nej. Utan utsedd elsäkerhetsledare är det ingen som har beslutet om start och samordningen med driften. Det faller mellan personer.',
'v42_02-q7': 'Fartygstyp, storlek, fartområde och trafik, byggår eller byggnadsdata och vilket system som berörs. Med dem går det att kontrollera vilken föreskrift som gäller.',
'v42_02-q8': 'TSFS 2014:1 är upphävd genom TSFS 2019:4. Kontrollera att ersättningsföreskriften gäller för just detta fartyg och arbete.',
'v42_02-q9': 'Generatorn saknas i planen och kan spänningssätta fördelningen. Planen behöver kompletteras med alla matningsvägar och hur var och en frånskiljs och låses.',
'v42_02-q10': 'Exempel: ”Dokument: [namn], utgåva [nr]. Avsnitt: [kontrolleras]. Gäller eftersom: [fartygsdata och arbete]. Öppen fråga: [det som saknas].”',
# v42_03 Riskbedömning
'v42_03-q1': 'Objektets beteckning, vilka ledare och plintar som ingår, alla matningsvägar och närliggande spänningssatta delar.',
'v42_03-q2': 'Exempel: Fara: skadad isolation i våt miljö. Händelse: någon berör den skadade delen. Konsekvens: strömgenomgång.',
'v42_03-q3': 'Den säger inte hur faran eller exponeringen minskas, vilken arbetsmetod som gäller eller vem som ansvarar. Handskarna har ingen angiven elektrisk klass.',
'v42_03-q4': 'Nej. En skylt informerar men hindrar inte tillkoppling. Planen kräver ett fungerande skydd, till exempel lås.',
'v42_03-q5': 'Provaren tas ur bruk och märks. Kontrollen görs inte förrän en hel och kontrollerad provare finns.',
'v42_03-q6': 'Två av: vilket objekt och vilka punkter som ska jordas, vilken utrustning och dimensionering som gäller, och vem som ansvarar och verifierar.',
'v42_03-q7': 'Arbetet i berört område avbryts. UPS:en kartläggs och tas med i beredningen. Nytt startbesked ges först efter omprövad riskbedömning.',
'v42_03-q8': 'Före 3 · 4 = 12. Efter 1 · 4 = 4. Konsekvensen är oförändrad, och en lägre poäng visar inte att krav och kontroller är uppfyllda.',
'v42_03-q9': 'Exempel: ”[Namn] kontrollerar kabel [ID] enligt [instruktion] före start. Resultatet förs in i protokollet med datum.”',
'v42_03-q10': 'Nej. Den andra matningen är inte verifierad, så spänningslösheten är inte säker. Skyddsutrustning ersätter inte det. Den andra matningen måste frånskiljas och verifieras först.',
# v43_01 Komponenter
'v43_01-q1': 'Att med en liten manöverström i spolen koppla till och från lastens kraftväg.',
'v43_01-q2': 'Överlast (för stor ström under längre tid i en hel krets) och kortslutning (mycket stor ström genom en oavsiktlig väg).',
'v43_01-q3': '16 A är den ström brytaren tål i normal drift. 6 kA är den största kortslutningsström den säkert kan bryta.',
'v43_01-q4': 'IΔ = 5,000 − 4,970 = 0,030 A = 30 mA.',
'v43_01-q5': 'Jordfelsbrytaren mäter bara skillnaden mellan ut- och returström. Vid överlast återkommer all ström och skillnaden är noll, så den löser inte.',
'v43_01-q6': 'Öppen i vila. Den sluter när K1 drar.',
'v43_01-q7': 'Spolens märkning, 24 V DC, styr manöverkretsens matning. 400 V gäller huvudkontakterna.',
'v43_01-q8': 'Selektiviteten mellan gruppskydd och huvudskydd. Det krävs tillverkarens ström–tidskurvor och den möjliga felströmmen.',
'v43_01-q9': 'Nej. 6 kA är mindre än 8 kA, och ingen backupkombination är dokumenterad.',
'v43_01-q10': 'Kontaktor för manöver, överlastskydd (motorskydd) och kortslutningsskydd (säkring eller brytare). Verkligt val kräver motor- och samordningsdata.',
# v43_02 Transformator och motor
'v43_02-q1': 'U₂ = 230 · 100/1 000 = 23 V.',
'v43_02-q2': 'I₁ = 24 · 3/240 = 0,30 A.',
'v43_02-q3': 'nₛ = 120 · 50/4 = 1 500 r/min.',
'v43_02-q4': 'nₛ = 120 · 50/6 = 1 000 r/min.',
'v43_02-q5': 'nₛ = 1 500 r/min. s = 100 · 60/1 500 = 4,0 %.',
'v43_02-q6': 'nₛ = 120 · 40/4 = 1 200 r/min.',
'v43_02-q7': 'Motor B, Δ/Y 400/690 V. Motor A ska kopplas i Y på 400 V.',
'v43_02-q8': 'Likriktare, DC-mellanled, växelriktare.',
'v43_02-q9': 'η = 3,4/4,0 = 0,85 = 85 %. Förlust 0,6 kW.',
'v43_02-q10': 'Exempel: 1) mekanisk överlast eller tröghet i pumpen, 2) obalans eller fasbortfall i matningen. Fasströmmar, spänning per fas och belastningsförlopp skiljer dem. Kontrollera också skyddets inställning.',
# v43_03 Scheman
'v43_03-q1': 'NO: normalt öppen, ingen strömväg i vila. NC: normalt sluten, strömväg i vila.',
'v43_03-q2': 'Att spolen och kontakten hör till samma apparat. Korsreferensen visar var den andra delen finns.',
'v43_03-q3': 'När K1 drar sluter NO-kontakten och tar över strömvägen. K1 hålls kvar när START släpps.',
'v43_03-q4': 'Båda vägarna passerar S0. När STOPP öppnar bryts både START-vägen och hållvägen.',
'v43_03-q5': 'Förbindningsschemat eller plintlistan. Kretsschemat visar hur funktionen hänger ihop.',
'v43_03-q6': '0 V. Ingen ström går, så det blir inget spänningsfall över spolen.',
'v43_03-q7': '12 V. Hela källspänningen ligger över spolen när vägen är sluten.',
'v43_03-q8': '12 V. Före STOPP är potentialen 12 V, efter STOPP 0 V via spolen till returen.',
'v43_03-q9': 'Ritningen kan inte anses gälla. Avvikelsen rapporteras till ansvarig, som klarlägger giltig version och uppdaterar ritningen före vidare arbete.',
'v43_03-q10': 'Vila: START och hållkontakt öppna, K1 släppt. Start: START sluter, K1 drar, hållkontakten sluter. Hållning: START släpps, strömmen går genom hållkontakten. Stopp: S0 öppnar, K1 släpper och hållkontakten öppnar.',
# v44_01 Lågspänningssystem
'v44_01-q1': 'N leder returström i normal drift. PE leder ingen ström i normal drift och leder felström vid fel. I TN-S är de separata ledare.',
'v44_01-q2': 'Felströmmen går genom två jordtag och blir ofta för liten för att ett överströmsskydd ska lösa snabbt. Jordfelsbrytaren reagerar på den lilla differensströmmen.',
'v44_01-q3': 'Isolationsresistansen mellan de aktiva ledarna och jord. En försämring varnar innan ett andra fel uppstår.',
'v44_01-q4': 'Det första felet ger liten ström och driften fortsätter. Ett andra fel på en annan fas blir en kortslutning via skrov eller jord. Därför ska felet lokaliseras och åtgärdas snabbt.',
'v44_01-q5': 'Nej. Varje delnät kan ha eget jordningssystem. Enlinjeschemat och uppgifter om transformatorer, jordning och skydd behövs för varje del.',
'v44_01-q6': 'ΔU = 6 · 0,15 = 0,9 V. Ulast = 23,1 V.',
'v44_01-q7': 'Iₖ = 230/0,46 = 500 A.',
'v44_01-q8': 'Iₖ halveras till 250 A.',
'v44_01-q9': 'Att skyddet löser inom avsedd tid även vid 200 A i reservdrift, inte bara vid 1 000 A. Det kräver skyddets ström–tidskurva.',
'v44_01-q10': 'Vilka nödlaster som måste fungera, hur de matas vid bortfall och om fördelningen är en gemensam felpunkt för både ordinarie och nödmatning.',
# v44_02 Högspänning
'v44_02-q1': 'Bara 6,6 kV AC. 690 V AC är högst 1 000 V och 1 200 V DC är högst 1 500 V.',
'v44_02-q2': 'Iᴸ = 1 000 000/(1,732 · 6 600 · 0,90) ≈ 97 A.',
'v44_02-q3': 'Iᴸ ≈ 1 600 A. Det är 6 600/400 = 16,5 gånger strömmen vid 6,6 kV.',
'v44_02-q4': 'kI = 200/5 = 40. I₂ = 120/40 = 3,0 A.',
'v44_02-q5': 'Mättransformator → skyddsrelä → brytare.',
'v44_02-q6': 'En frånskiljare är byggd för att ge en synlig brytpunkt, inte för att bryta ström. Märkdata eller dokumentation måste visa vilken ström den får bryta.',
'v44_02-q7': 'Stoppa manövern, utred varför förreglingen stoppar och kontrollera driftläget enligt instruktion. Förregling kopplas aldrig förbi.',
'v44_02-q8': 'Nej. Spänningsnivå, arbetsmetod, verktyg och möjliga rörelser saknas. Avståndet måste bestämmas enligt gällande krav.',
'v44_02-q9': 'Det går inte att avgöra vilka vägar som är spänningssatta, och det går inte att utesluta återmatning från reservkällan. Arbetsområdet kan därför inte avgränsas säkert.',
'v44_02-q10': 'Reläinställningar, mätdata och händelselogg samt brytarnas tidsordning. De skiljer fel inställning, fel signal och fel brytförlopp.',
# v44_03 Mätteknik
'v44_03-q1': '0 A. Strömmarna fram och tillbaka tar ut varandras magnetfält. Tången ska omsluta en ledare.',
'v44_03-q2': 'I = 250/10 = 25 A.',
'v44_03-q3': 'R = 500/0,00025 = 2 000 000 Ω = 2,0 MΩ.',
'v44_03-q4': 'Rp = 20 · 20/40 = 10 MΩ.',
'v44_03-q5': 'R = 0,40/0,020 = 20 Ω.',
'v44_03-q6': 'T = 4 · 5 = 20 ms. f = 1/0,020 = 50 Hz.',
'v44_03-q7': 'û = 10 · 2,0 = 20 V.',
'v44_03-q8': 'δ = 0,5 V + 0,2 V = 0,7 V. Intervall 99,3–100,7 V.',
'v44_03-q9': 'Medel = 10,0 V. Variationsbredd = 0,4 V.',
'v44_03-q10': 'Provspänning, mättid, temperatur, fukt och inkopplad utrustning kan skilja mellan mätningarna. Jämför villkoren innan du drar slutsatsen att isolationen är skadad.',
# v45_01 Felsökning
'v45_01-q1': 'Observation: ”motorn startar inte”. Hypotes: ”kontaktorn är trasig”.',
'v45_01-q2': 'Källa, kraftväg, styrning, skydd och last. Exempel: finns rätt spänning före och efter pumpens skydd?',
'v45_01-q3': 'Sträckan mellan B och lastens pluspunkt. Före B finns rätt spänning.',
'v45_01-q4': 'I = 0. Resistorn får inget fall, så hela 24 V ligger över den öppna kontakten.',
'v45_01-q5': 'I = 24/0,10 = 240 A. I verkligheten begränsar källans inre impedans och skyddet strömmen.',
'v45_01-q6': 'ΔU = 10 · 0,20 = 2,0 V. P = 100 · 0,20 = 20 W.',
'v45_01-q7': 'ΔU = 6 V. Rextra = 6/3 = 2,0 Ω.',
'v45_01-q8': 'Mät matningen och spolspänningen under START. Är de rätt är matningen godkänd. Kontrollera sedan hållkontakten: sluter den när K1 drar, och är ledarna till den hela?',
'v45_01-q9': 'Spänning och ström samtidigt under hög belastning, spänningsfall över anslutningar, temperatur och tid. Vid tomgång syns inte ett fel som beror på ström.',
'v45_01-q10': 'Funktion i rätt driftfall, föreskrivna säkerhetskontroller (till exempel anslutning och skyddsledare) och dokumenterad återlämning. Det som inte provats skrivs som oprövat.',
# v45_02 Analys
'v45_02-q1': 'Stöds: källan ger 24,0 V utan last. Kräver mer data: om spänningen håller under last. Mät då ström och spänning under last.',
'v45_02-q2': 'Krav: 11,40–12,60 V. Mätning: 11,35–11,55 V. Nej, den nedre mätgränsen 11,35 V ligger under 11,40 V.',
'v45_02-q3': 'A: 9,90–10,10 V. B: 10,02–10,22 V. Intervallen överlappar mellan 10,02 och 10,10 V, så skillnaden bevisar inte att något instrument är fel.',
'v45_02-q4': 'Slingfall 4 V. Framledningen 3 V.',
'v45_02-q5': 'Rfram = 3/2 = 1,5 Ω. Rretur = 1/2 = 0,5 Ω.',
'v45_02-q6': 'Förhöjd resistans i kabelvägen. Källan håller 24 V och 6 V förloras i kabeln. Nästa steg är att lokalisera var fallet uppstår.',
'v45_02-q7': 'Skyddet reagerar troligen korrekt på ett kvarstående fel. Samla uppgifter om ström, belastning, felström, inställning och skyddsval innan något byts.',
'v45_02-q8': 'Objekt-ID för kabeln, orsak och vad som gjordes, samt efterkontrollens mätvärden med datum och namn.',
'v45_02-q9': 'Exempel: ”Funktionen är verifierad i normaldrift. Reservdrift är inte kontrollerad och måste provas separat.”',
'v45_02-q10': 'Rföre = 2,0 Ω, Refter = 0,10 Ω. Åtgärden har minskat resistansen kraftigt. Kvar att göra: föreskriven kontroll av anslutning och skydd.',
# v45_03 Repetition
'v45_03-q1': 'Pᵢₙ = 400/0,80 = 500 W. E = 0,5 kW · 3 h = 1,5 kWh.',
'v45_03-q2': 'Iₓ = 4,0 + 1,5 − 2,0 = 3,5 A.',
'v45_03-q3': 'Rp = 4 · 4/8 = 2 kΩ. Uut = 24 · 2/(2 + 2) = 12 V.',
'v45_03-q4': 'û ≈ 33,9 V. T ≈ 16,7 ms.',
'v45_03-q5': '|Z| = 50 Ω. I = 2,0 A. cos φ = 0,60.',
'v45_03-q6': 'P = 1,732 · 400 · 8 · 0,80 ≈ 4 430 W ≈ 4,43 kW.',
'v45_03-q7': 'δ = 0,24 + 0,02 = 0,26 V. 24,00 ± 0,26 V, alltså 23,74–24,26 V.',
'v45_03-q8': 'Brist: batterireserven saknas i planen. Konsekvens: delar kan vara spänningssatta under arbetet. Beslut: arbetet startar inte förrän reserven är frånskild, låst och kontrollerad.',
'v45_03-q9': 'Hypotes: hållvägen är bruten, till exempel att K1:s NO-kontakt inte sluter. Kontroll: mät över hållkontakten med K1 draget. 0 V betyder att den sluter, full spänning att den är öppen.',
'v45_03-q10': 'Före: (24 − 20)/4 = 1,0 Ω. Efter: (24 − 23,6)/4 = 0,10 Ω.',
}


def run():
    total = 0
    for w in range(39, 46):
        p = ROOT / f'vecka-{w}' / 'aktuell' / 'Formelstod_och_ovningar.html'
        s = p.read_text(encoding='utf-8')
        s = re.sub(r'<details class="facit">.*?</details>', '', s, flags=re.S)

        def add(m):
            nonlocal total
            i = m.group(1)
            if i not in F:
                raise SystemExit(f'facit saknas för {i}')
            total += 1
            return (m.group(0)[:-len('</article>')]
                    + f'<details class="facit"><summary>Kontrollera ditt svar</summary><p>{escape(F[i], quote=False)}</p></details></article>')

        s = re.sub(r'<article class="exercise" id="([^"]+)">.*?</article>', add, s, flags=re.S)
        if 'facit.css' not in s:
            s = s.replace('</head>', '<style>.facit{margin:12px 0 0;border:1px solid var(--sj-line,#cad8e2);border-left:8px solid var(--sj-ok,#176844);border-radius:12px;padding:4px 16px;background:#fff}.facit[open]{padding-bottom:12px}.facit p{margin:4px 0 0}@media print{.facit{display:none}}</style><!-- facit.css --></head>', 1)
        p.write_text(s, encoding='utf-8')
    print(f'{total} övningar har facit')


if __name__ == '__main__':
    run()
