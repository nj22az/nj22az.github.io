"""Innehållsändringar i vecka 43: teoriexempel som inte avslöjar övningssvar (fartygsvärden 440 V/60 Hz),
nedsänkta index och ingen hänvisning till saknade bildanteckningar.
Användning: textfix43.py <in-mapp> <ut-mapp>"""
import sys
from pptx import Presentation
from pptxtext import shape, set_paras, drop_notes_line, subscript_tokens, replace_words
SUBS = {'IΔ': ('I', 'Δ'), 'Iut': ('I', 'ut'), 'Iretur': ('I', 'retur'), 'Paxel': ('P', 'axel'), 'Pförlust': ('P', 'förlust'),
        'Ulast': ('U', 'last'), 'Ukontakt': ('U', 'kontakt'), 'Ispole': ('I', 'spole'), 'Uspole': ('U', 'spole'), 'Rspole': ('R', 'spole'),
        'Vmatningssida': ('V', 'matningssida'), 'Vretur': ('V', 'retur'), 'Vföre': ('V', 'före'), 'Vefter': ('V', 'efter'),
        'Uöppen kontakt': ('U', 'öppen kontakt'), 'Ugren': ('U', 'gren')}
src, dst = sys.argv[1], sys.argv[2]

f = "v43_01_Komponenter_och_skydd_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[7], 5), ["En ren jordfelsbrytare ersätter inte överströmsskydd.", "Ombord: i 440 V IT-nät ger första jordfelet larm, inte utlösning. Jordfelsbrytare används främst i 230 V uttagsgrupper."])
set_paras(shape(p.slides[20], 4), ["NO: normalt öppen", "NC: normalt sluten"])
# stödbilder: vägledning i stället för slutsats
set_paras(shape(p.slides[9], 10), ["Vad händer när spolen får matning?"])
set_paras(shape(p.slides[9], 11), ["Spolen tillhör manöverkretsen. Huvudkontakterna ligger i kraftvägen till motorn."])
set_paras(shape(p.slides[11], 10), ["Vilka slags överström kan uppstå?"])
set_paras(shape(p.slides[11], 11), ["Tänk på en för stor last i en hel krets och på en oavsiktlig väg med låg impedans."])
set_paras(shape(p.slides[17], 10), ["Vad mäter jordfelsfunktionen?"])
set_paras(shape(p.slides[17], 11), ["Jämför strömmen ut med strömmen tillbaka i de övervakade ledarna, även när lastströmmen är stor."])
set_paras(shape(p.slides[26], 10), ["Vilken del av apparaten gäller varje märkvärde?"])
set_paras(shape(p.slides[28], 10), ["Vilket skydd borde ha löst?"])
set_paras(shape(p.slides[32], 10), ["Vilka funktioner behövs runt motorn?"])
set_paras(shape(p.slides[32], 11), ["Tänk på normal start och stopp, på för hög belastning och på en kortslutning i kabel eller motor."])
replace_words(p, [('Huvudkontakter för 400 V', 'Huvudkontakter för 440 V'), ('huvudkontakter för 400 V', 'huvudkontakter för 440 V')])
subscript_tokens(p, SUBS); drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v43_02_Transformatorer_och_motorer_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[1], 6), ["Varför går en fyrpolig asynkronmotor något långsammare än fältets synkrona varvtal?"])
set_paras(shape(p.slides[22], 5), ["Vid 440 V nät ligger mellanledet på ca 620 V DC (440 · √2) och kan vara laddat efter frånkoppling.", "Vänta tillverkarens tid och mät DC+ mot DC− med avsedd provare före arbete."])
set_paras(shape(p.slides[28], 10), ["Följ energin från nät till motor"])
set_paras(shape(p.slides[28], 11), ["Varje del ändrar energins form. En av delarna lagrar energi mellan de två andra."])
set_paras(shape(p.slides[5], 5), ["440 V till 110 V ger omsättningen 4:1.", "2 A på sekundären motsvarar idealt 0,50 A på primären."])
set_paras(shape(p.slides[6], 5), ["Ombord: 60 Hz och fyra poler ger nₛ = 1 800 r/min.", "Här är p antalet poler, inte antalet polpar."])
set_paras(shape(p.slides[7], 5), ["nₛ = 1 800 och n = 1 746 r/min ger s = 0,03 = 3 %.", "Eftersläpningen varierar med belastningen."])
set_paras(shape(p.slides[20], 5), ["Ombord: en 440/760 V Δ/Y-motor kan vara kandidat vid 440 V.", "Y-start minskar också tillgängligt startmoment."])
set_paras(shape(p.slides[23], 10), ["En åttapolig motor matas med 60 Hz. Rotorn går med 873 r/min."])
set_paras(shape(p.slides[23], 12), ["1. nₛ = 120 · 60/8 = 900 r/min.", "2. Skillnad = 900 − 873 = 27 r/min.", "3. s% = 100 · 27/900 = 3 %."])
set_paras(shape(p.slides[23], 13), ["Rotorn går långsammare än fältet vid den angivna motordriften. p är åtta poler, inte fyra polpar."])
subscript_tokens(p, SUBS); drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v43_03_Elscheman_och_dokumentation_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[21], 4), ["Vad bör en öppen kontakt visa i ditt driftläge?"])
set_paras(shape(p.slides[8], 12), ["1. START trycks in och sluter vägen till K1-spolen.", "2. K1 drar."])
set_paras(shape(p.slides[8], 13), ["Vad som händer när START släpps och när STOPP trycks utreds i övningarna. Vid strömavbrott släpper K1."])
set_paras(shape(p.slides[23], 11), ["I = 0     Ulast = RI     Ukontakt = 9 V − Ulast"])
set_paras(shape(p.slides[23], 13), ["Stor spänning över en kontakt kan tyda på avbrott."])
set_paras(shape(p.slides[24], 11), ["Vilka punkter är förbundna med matningen och vilka med returen?"])
set_paras(shape(p.slides[26], 11), ["Slutna ideala kontakter har försumbart spänningsfall. Vilken potential har spolens två sidor?"])
set_paras(shape(p.slides[28], 11), ["Öppen serieväg ger I = 0. Vad betyder det för spänningsfallet i spolen?"])
subscript_tokens(p, SUBS); drop_notes_line(p); p.save(f"{dst}/{f}")
