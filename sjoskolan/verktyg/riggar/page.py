import re
figs=open('figs.html').read().split('\n')
FA,FB,FT,FC,FK=figs
def table(head,rows):
    h='<div class="rig-table"><table><thead><tr>'+''.join(f'<th scope="col">{x}</th>' for x in head)+'</tr></thead><tbody>'
    h+=''.join('<tr>'+''.join(f'<td>{c}</td>' for c in r)+'</tr>' for r in rows)
    return h+'</tbody></table></div>'
def sheet(title,cols,rows):
    return f'<h4>{title}</h4>'+table(cols,[[r]+['']*(len(cols)-1) for r in rows])

bomA=table(['Pos','Del','Krav','Antal','Kommentar'],[
 ['G1','Labbnätaggregat','0–30 V DC, strömgräns ställbar ned till 10 mA, galvaniskt skild utgång, SS-EN 61010-1','1 per panel','Ställs på 12,0 V och 100 mA. Låsbar inställning om aggregatet har det.'],
 ['F1','Säkring','T 100 mA, 5 × 20 mm, i panelsäkringshållare','1','Skyddar panelen om strömgränsen ställs fel.'],
 ['X-P, A, B, N','Säkerhetshylsor 4 mm','helt isolerade, IEC 61010-031, röd P, svart N, övriga svarta','4','Märk med samma namn som i simulatorn.'],
 ['L1','Kortslutningsbygel P–A','4 mm, 19 mm delning, isolerad','1','Tas bort vid strömmätning och vid resistansmätning.'],
 ['R1','Resistor på komponentbärare','1 kΩ, ±5 %, kolfilm, 0,6 W','1','Bäraren med 4 mm-kontakter gör att instruktören kan byta.'],
 ['R2','Resistor på komponentbärare','2 kΩ, ±5 %, kolfilm, 0,6 W','1','En extra bärare med 2,15 kΩ märkt ”2 kΩ” fungerar som felmodul utanför toleransen.'],
 ['REF','Spänningsreferens','5,000 V ±0,1 %, batteridriven, egna hylsor Ref+ och Ref−','1 per bänk','Kontrolleras mot skolans referensinstrument varje termin.'],
 ['–','Panel','isolerande frontplatta, sluten baksida, märkning ”SELV 12 V DC, 100 mA”','1',''],
])
bomB=table(['Pos','Del','Krav','Antal','Kommentar'],[
 ['G2','Funktionsgenerator','sinus, fyrkant, triangel, 1–400 Hz, amplitud i fina steg','1',''],
 ['A1','Effektförstärkare','klass D-modul med BTL-utgång, minst 20 W i 4–8 Ω, frekvensgång ned till 20 Hz','1','BTL: ingen av utgångarna ligger på 0 V. Därför krävs differentialprob.'],
 ['G3','Nätaggregat för förstärkaren','24 V DC, SELV, säkerhetstransformator enligt SS-EN 61558-2-6, CE-märkt, slutet','1','Utgången ska inte jordas.'],
 ['F1','Säkring','T 500 mA på UT','1',''],
 ['Rlast','Lastmotstånd','100 Ω, 10 W, trådlindat, på kylfläns','1','Ger en bestämd last. Strömmen blir cirka 0,12 A vid 12 V.'],
 ['X-UT, COM','Säkerhetshylsor 4 mm','röd UT, svart COM','2','Samma namn som i simulatorns anslutningsbild.'],
 ['M1','Multimeter, true RMS','CAT III 600 V, AC-bandbredd minst 1 kHz, 4 mm-sladdar','1 per par','Märk ”M1 TRUE RMS”.'],
 ['M2','Multimeter, medelvärdesvisande','sinuskalibrerad (inte true RMS), CAT III 600 V','1 per bänk','Märk tydligt ”M2 – EJ TRUE RMS”. Bara för jämförelsen i protokollet.'],
 ['P1','Differentialprob','minst ±70 V, dämpning 1:10 eller 1:20, CAT-klassad för mätplatsen','1 per oscilloskop','Obligatorisk på UT–COM och över shunten.'],
 ['O1','Oscilloskop','två kanaler, minst 50 MHz','1 per bänk','Skyddsjorden kopplas aldrig bort.'],
])
bomT=table(['Pos','Del','Krav','Antal','Kommentar'],[
 ['Q1','Nätanslutning','CEE 16 A 5-polig, jordfelsbrytare 30 mA typ A, dvärgbrytare C6 3-polig, nödstopp','1','Elinstallation. Utförs och kontrolleras av behörig elinstallatör.'],
 ['T1','Trefas säkerhetstransformator','400 V Δ / 12 V Yn med N utdragen, 40 VA, 50 Hz, SS-EN 61558-2-6, termiskt skydd, sluten','1','Beställs ofta som specialutförande. Alternativ: tre enfas säkerhetstransformatorer 230/7 V anslutna till L1, L2 och L3.'],
 ['F1–F3','Säkringar','T 315 mA i L1, L2 och L3 på sekundärsidan','3',''],
 ['R1–R3','Laster','100 Ω, 10 W, trådlindade, ±5 %','3','Mät och skriv in de verkliga värdena i riggdatabladet.'],
 ['–','Länkar','4 mm byglar: strömmätlänk i L1, L2, L3 och N, lastlänk i varje fas, N-länk mellan N och S','8',''],
 ['X-L1…N, S','Säkerhetshylsor 4 mm','färg enligt SS-EN 60445: L1 brun, L2 svart, L3 grå, N blå; S svart','5','Stjärnpunktsuttaget S sitter på lastsidan av N-länken.'],
])
bomC=table(['Pos','Del','Krav','Antal','Kommentar'],[
 ['G1','Labbnätaggregat','som Station A, ställt på 12,0 V och 200 mA','1',''],
 ['F2','Säkring','T 200 mA','1',''],
 ['S0','Tryckknapp STOPP','röd, 22 mm, NC','1','Färger enligt SS-EN 60204-1: STOPP röd, START grön eller vit.'],
 ['S1','Tryckknapp START','grön, 22 mm, NO','1',''],
 ['K1','Relä','12 V DC-spole, två växlande kontakter, sockel med skruvplintar','1','Ena kontakten är hjälpkontakten, den andra tänder H1. Mät spolresistansen och skriv in den.'],
 ['V1','Släckdiod','1N4007 eller likvärdig, katod mot +, direkt över spolen','1','Begränsar spänningsspiken när spolen bryts.'],
 ['H1','Indikering ”motor”','12 V LED-lampa via K1:s andra kontakt','1','Ersätter motorn. Ingen roterande last på elevsidan.'],
 ['X1–X5','Felbrytare','små vippbrytare bakom låsbar lucka, i serie med S0, S1, hjälpkontakten, spolen och returen','5','Märk med koder, inte med felets namn. Nyckeln hos instruktören.'],
 ['–','Mätpunkter och länk','4 mm hylsor +U, a, b, c, 0 V och strömmätlänk c–retur','6',''],
])
bomK=table(['Pos','Del','Krav','Antal','Kommentar'],[
 ['R','Resistor','39 Ω, 10 W, ±5 %','1','Närmaste E12-värde till simulatorns 40 Ω.'],
 ['L','Drosselspole','100 mH, minst 0,5 A, järnkärna med luftgap','1','Har egen lindningsresistans, ofta några ohm. Mät den.'],
 ['C','Kondensator','100 µF, opolär: MKP-film eller bipolär elektrolyt märkt för AC, minst 63 V','1','Aldrig en vanlig polariserad elektrolyt.'],
 ['Rs','Shunt','1,0 Ω, 1 %, 3 W','1','Strömmen mäts som spänning över shunten, med differentialprob.'],
 ['–','Länkar och hylsor','mätlänk, kortslutningslänk över L och över C, mätuttag 1–4','','Med länkarna väljs R, RL, RC eller RLC.'],
])
comm=table(['Steg','Kontroll','Krav'],[
 ['1','Nätanslutna delar (Station B trefas, bänkens uttag)','Installationskontroll av behörig elinstallatör: skyddsledarens kontinuitet, isolationsresistans, jordfelsbrytarens funktion, fasföljd.'],
 ['2','Skyddande separation för varje SELV-krets','Isolationsresistans mellan SELV-kretsen och skyddsjord samt nätsidan: provspänning 250 V DC, minst 0,5 MΩ (SS 436 40 00, del 6). Mät med kretsen spänningslös och elektronik bortkopplad.'],
 ['3','Märkning','SELV, spänning, strömgräns och säkringar på varje panel. Datum och signatur för senaste kontroll.'],
 ['4','Funktion','Tomgångs- och lastspänning, strömgränsens inställning, att säkringarna har rätt märkning och att länkar och felbrytare fungerar.'],
 ['5','Riggdata','Mät och skriv in varje riggs verkliga värden i riggdatabladet nedan. Eleverna använder dem som ”riggdata” i protokollet.'],
 ['6','Återkommande','Före varje termin: okulär kontroll, sladdar, säkringar, instrumentkontroll mot referensen. Årligen och efter ändring: steg 2 igen.'],
])
risk=table(['Fara','Var','Åtgärd'],[
 ['Elchock från nätspänning','Nätaggregat, generatorns nätdel, trefastransformatorns primärsida','Allt nätanslutet i slutna, CE-märkta apparater eller installerat av behörig. Eleven når bara SELV-hylsor. Jordfelsbrytare 30 mA och nödstopp på bänken.'],
 ['Kortslutning via oscilloskopets jord','Station B AC och komponentplattan (BTL-utgång)','Differentialprob på UT–COM och över shunten. Skyddsjorden kopplas aldrig bort. Skylt vid bänken.'],
 ['Värme i komponenter','Lastmotstånd, laster 100 Ω, R 39 Ω','Effektmarginal minst 3 gånger, montering på avstånd från hylsor, strömgräns och säkringar.'],
 ['Höga spänningar vid resonans','Komponentplattan i RLC-läge','R på minst 39 Ω håller kvalitetsfaktorn låg. Vid 12 V blir spänningen över L och C högst cirka 10 V.'],
 ['Spänningsspik när spolen bryts','Station C','Släckdiod över K1. Kontrollera den vid driftsättning.'],
 ['Fel instrumentinställning','mA-uttaget','Strömgräns på aggregatet och säkring i mätaren. Kontrollera mätarens mA-säkring varje termin.'],
])
align=table(['Station','Simulatorn','Verklig rigg','Att göra'],[
 ['A','Rigg 1–6 med givna R-värden och källspänningar, mätare med små fel inom specifikationen, frånslagen källa ligger kvar parallellt','Sex paneler med kolfilmsresistorer ±5 %, labbnätaggregat, referens 5,000 V','Mät panelerna och för in värdena i simulatorn, så att eleven kan öva på sin egen panel.'],
 ['B, AC','Källa 12 V (grundlabben) och 12,35 V (Station B), kalibrator 10,00 V, ideala instrument','Generator med BTL-förstärkare och last 100 Ω. ”Kalibratorn” är en inställning som kontrolleras med skolans referensinstrument före passet.','Skriv källans verkliga värde i riggdatabladet.'],
 ['B, trefas','UL 12,2 V och laster 98, 103 och 101 Ω','Trefas säkerhetstransformator 12 V och tre laster 100 Ω','Ersätt simulatorns värden med de uppmätta.'],
 ['C','Ideal voltmeter, spole 480 Ω, 12 eller 24 V','12 V-relä med verklig spolresistans och släckdiod','Skriv in spolresistansen. Draspänning och släppspänning är nya mätvärden som simulatorn saknar.'],
 ['Vecka 40','RL med R 40 Ω och L 95,5 mH vid 12 V, effektuppgifter vid 230 V','Komponentplatta vid 12 V med R 39 Ω, L 100 mH och C 100 µF','Effekt vid 230 V stannar i simulatorn. På bänken mäts samma samband vid 12 V: P = I²R, S = U · I.'],
])
sheets=(sheet('Station A',['Panel','U tomgång (V)','R1 (kΩ)','R2 (kΩ)','Datum','Signatur'],['A1','A2','A3','A4','A5','A6'])
 +sheet('Station B, AC',['Mätning','Värde','Instrument','Datum','Signatur'],['UT tomgång, sinus 50 Hz (V)','UT med last 100 Ω (V)','Frekvens (Hz)','Inställning ”kalibrator 10,00 V” kontrollerad (V)'])
 +sheet('Station B, trefas',['Mätning','Värde','Datum','Signatur'],['U L1–L2 (V)','U L2–L3 (V)','U L3–L1 (V)','U L1–N (V)','R1, R2, R3 (Ω)','Fasföljd'])
 +sheet('Station C',['Mätning','Värde','Datum','Signatur'],['+U tomgång (V)','Spolresistans K1 (Ω)','Draspänning K1 (V)','Släppspänning K1 (V)','Spolström vid 12 V (mA)'])
 +sheet('Komponentplatta',['Mätning','Värde','Datum','Signatur'],['R (Ω)','L (mH)','Lindningsresistans i L (Ω)','C (µF)','Shunt (Ω)']))

html=f'''<!doctype html><html lang="sv" data-theme="cobalt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Riggar för elteknik · Sjöskolan</title><meta name="description" content="Byggunderlag för verkliga labbriggar som motsvarar Sjöskolans simulerade stationer."><meta name="robots" content="noindex"><link rel="icon" href="/assets/images/apple-touch-icon.png"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/sjoskolan/course.css">
<style>.rig-fig{{margin:18px 0;border:1px solid #cdd9e2;border-radius:10px;padding:10px;background:#fff}}.rig-fig{{overflow-x:auto}}.rig-fig svg{{display:block;width:100%;min-width:640px;height:auto;font-family:Arial,Helvetica,sans-serif}}.rig-table{{overflow-x:auto}}.rig-table table{{width:100%;border-collapse:collapse;font-size:15px;display:table}}.rig-table th,.rig-table td{{border:1px solid #cdd9e2;padding:6px 8px;text-align:left;vertical-align:top}}.rig-note{{border-left:4px solid #9a4a12;padding:6px 14px;background:#fff8ec}}@media print{{.rig-fig,.rig-table,h2,h3{{break-inside:avoid}}}}</style>
</head><body class="course"><nav id="site-nav" class="site-nav"></nav><main id="main-content" class="course-main"><article class="course-reading">
<p class="course-kicker">Sjöskolan · Elteknik och ellära · byggunderlag</p>
<h1>Riggar för elteknik</h1>
<p>Det här är ett byggunderlag för verkliga labbriggar som motsvarar simulatorernas stationer: Station A (DC-delare), Station B (AC och trefas), Station C (hållkrets med felmoduler) och komponentplattan för vecka 40. Mätpunkterna har samma namn som i simulatorerna, så att eleven kan gå direkt från simulatorn till riggen.</p>
<p class="rig-note">Underlaget beskriver en konstruktion och dess krav. Slutlig konstruktion, installation av nätanslutna delar och kontroll före användning ska göras av behörig elinstallatör och godkännas av skolans elsäkerhetsansvarige. Elevarbete sker enligt skolans riskbedömning och SS-EN 50110-1.</p>

<h2>Principer</h2>
<ol>
<li><strong>Eleven når bara SELV.</strong> Alla elevåtkomliga delar har högst 12 V AC (17 V topp) eller 12 V DC, med ett tak på 24 V i förstärkarens krets. Gränserna för SELV är 50 V AC och 120 V rippelfri DC.</li>
<li><strong>Nätspänning bara i slutna apparater.</strong> Nätaggregat, generatorns nätdel och trefastransformatorns primärsida sitter i slutna, CE-märkta apparater eller installeras av behörig. Skyddande separation med säkerhetstransformator enligt SS-EN 61558-2-6.</li>
<li><strong>Begränsad energi.</strong> Varje källa har strömgräns och säkring på elevsidan.</li>
<li><strong>Ett kontaktsystem.</strong> Helt isolerade 4 mm-hylsor och provsladdar enligt IEC 61010-031. Länkar är isolerade byglar med 19 mm delning. Färger: röd för plus och utgång, svart för COM och 0 V, fasfärger enligt SS-EN 60445.</li>
<li><strong>Samma namn som simulatorn.</strong> P, A, B, N och Ref på Station A. UT och COM på Station B. L1, L2, L3, N och S på trefaspanelen. +U, a, b, c och 0 V på Station C.</li>
<li><strong>Felmoduler är instruktörens.</strong> Felbrytare sitter bakom låsbar lucka och är märkta med koder.</li>
<li><strong>Varje rigg har riggdata.</strong> Uppmätta värden skrivs in i ett riggdatablad. Protokollen jämför med riggdata, inte bara med märkvärden.</li>
</ol>

<h2>Gemensam bänk</h2>
<ul>
<li>Bänkens uttag via jordfelsbrytare 30 mA och ett nödstopp som bryter hela bänken.</li>
<li>Labbnätaggregat 0–30 V DC med ställbar strömgräns och galvaniskt skild utgång.</li>
<li>Multimeter M1 true RMS och M2 medelvärdesvisande (sinuskalibrerad), båda CAT III 600 V.</li>
<li>Oscilloskop med två kanaler och en differentialprob. Oscilloskopets skyddsjord kopplas aldrig bort.</li>
<li>Spänningsreferens 5,000 V och skolans referensinstrument (kalibrerad bänkmultimeter) för kontroll av instrumenten.</li>
</ul>

<h2>Station A · DC-delare</h2>
<p>Motsvarar övning 9 i Multimeterlabbet och v41_03 bild 7. Bygg sex paneler, A1–A6, en per elevpar. Den frånslagna källan ligger kvar parallellt med kretsen, precis som i simulatorn. Därför öppnas länken P–A före resistansmätning.</p>
{FA}
{bomA}
<p><strong>Förväntade värden:</strong> 12 V, R1 0,95–1,05 kΩ, R2 1,90–2,10 kΩ, U1 cirka 4 V, U2 cirka 8 V, ström cirka 4 mA. Den största förlusteffekten är cirka 0,03 W.</p>

<h2>Station B · AC</h2>
<p>Motsvarar Station B, AC i Växelströmslabbet. Förstärkaren ger sinus, fyrkant och triangel med samma effektivvärde, 12 V, så att true RMS och medelvärdesvisande mätare kan jämföras. BTL-utgången gör riggen realistisk på en viktig punkt: ingen utgång ligger på jord, så en jordad oscilloskopprob kortsluter halva förstärkaren. Differentialproben är därför obligatorisk.</p>
{FB}
{bomB}
<p><strong>Förväntade värden:</strong> 12 V RMS, topp 17 V för sinus och 21 V för triangel, periodtid 20,0 ms vid 50 Hz. Förstärkaren måste klara triangelns topp; välj matning 24–30 V DC. ”Kalibratorn” i simulatorn motsvarar här att källan ställs på 10,00 V sinus och kontrolleras med referensinstrumentet innan passet.</p>

<h2>Station B · trefas</h2>
<p>Motsvarar Station B, trefas i Trefaslabbet. Primärsidan är en elinstallation och byggs och kontrolleras av behörig. Eleven arbetar bara på sekundärsidans panel.</p>
{FT}
{bomT}
<p><strong>Förväntade värden:</strong> huvudspänning cirka 12 V, fasspänning cirka 7 V, fasströmmar cirka 70 mA, neutralström några mA beroende på lasternas tolerans. Med bruten N och en last frånkopplad får de två andra lasterna cirka 6 V var. Alla värden ligger långt under SELV-gränsen.</p>

<h2>Station C · hållkrets med felmoduler</h2>
<p>Motsvarar Station C i Hållkretslabbet. Felbrytarna X1–X5 ger samma fel som simulatorns felmoduler: S0 fastnat öppen, START sluter inte, hjälpkontakten sluter inte, spolen avbruten och returen bruten. Alla slutna ger ”inget fel”.</p>
{FC}
{bomC}
<p><strong>Förväntade värden:</strong> 12 V över spolen vid hållning. Spolströmmen beror på reläet, till exempel 40 mA vid 300 Ω. Mät också draspänning och släppspänning: de är verkliga egenskaper som simulatorn saknar.</p>

<h2>Komponentplatta · vecka 40</h2>
<p>Motsvarar den guidade labben i Växelströmslabbet. Plattan matas från Station B:s förstärkare. Med länkarna väljs R, RL, RC eller RLC. Strömmen mäts med M1 i mätlänken, eller som spänning över shunten med differentialprob. Effekt mäts vid 12 V med P = I²R och S = U · I. Effektuppgifterna vid 230 V görs bara i simulatorn.</p>
{FK}
{bomK}
<p><strong>Förväntade värden vid 12 V, 50 Hz:</strong> Xᴸ ≈ 31 Ω, RL-strömmen cirka 0,24 A. L och C resonerar nära 50 Hz. Med R = 39 Ω blir strömmen då cirka 0,3 A och spänningen över L och C cirka 10 V.</p>

<h2>Risker och åtgärder</h2>
{risk}

<h2>Driftsättning och kontroll</h2>
{comm}

<h2>Simulator och rigg</h2>
{align}

<h2>Riggdatablad</h2>
<p>Skriv ut och fyll i vid driftsättningen. Sätt en kopia vid varje station.</p>
{sheets}
</article></main><footer id="site-footer" class="site-footer"></footer><script src="/config.js"></script><script src="/shared.js"></script></body></html>
'''
open(__import__('pathlib').Path(__file__).resolve().parents[2]/'gemensamt'/'Riggar.html','w').write(html)
print(len(html))
