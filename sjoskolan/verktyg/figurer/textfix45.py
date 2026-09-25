"""Innehållsändringar i vecka 45: teoriexempel som inte ger samma svar som övningarna,
stödbilder som vägleder i stället för att ge slutsatsen, nedsänkta index och
ingen hänvisning till saknade bildanteckningar.
Användning: textfix45.py <in-mapp> <ut-mapp>"""
import sys
from pptx import Presentation
from pptxtext import shape, set_paras, drop_notes_line, subscript_tokens
SUBS = {'Uresistor': ('U', 'resistor'), 'Ukontakt': ('U', 'kontakt'), 'Ukälla': ('U', 'källa'), 'Rtotal': ('R', 'total'), 'Rextra': ('R', 'extra'),
        'Ulast': ('U', 'last'), 'Unom': ('U', 'nom'), 'Um': ('U', 'm'), 'ΔUtotal': ('ΔU', 'total'), 'ΔUfram': ('ΔU', 'fram'), 'ΔUretur': ('ΔU', 'retur'),
        'ΔUkabel': ('ΔU', 'kabel'), 'Rfram': ('R', 'fram'), 'Rretur': ('R', 'retur'), 'Rföre': ('R', 'före'), 'Refter': ('R', 'efter'),
        'ΔUföre': ('ΔU', 'före'), 'ΔUefter': ('ΔU', 'efter'), 'Rslinga': ('R', 'slinga'), 'Urms': ('U', 'rms'), 'Uut': ('U', 'ut'), 'Uin': ('U', 'in'),
        'Rlast': ('R', 'last'), 'Rp': ('R', 'p'), 'Itotal': ('I', 'total')}
src, dst = sys.argv[1], sys.argv[2]

f = "v45_01_Systematisk_felsokning_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[21], 5), ["0,15 Ω vid 8 A ger 1,2 V fall och 9,6 W värme.", "Kontrollerade felmoduler används i undervisning, aldrig avsiktligt glapp."])
set_paras(shape(p.slides[22], 5), ["Välj en mätpunkt och ett driftläge där de två hypoteserna", "förutsäger olika värden. Skriv förväntat värde före mätningen."])
set_paras(shape(p.slides[28], 11), ["Vad förutsäger varje hypotes för källspänningen och spolspänningen, under START och efter släpp?"])
subscript_tokens(p, SUBS); drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v45_02_Analys_av_matresultat_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[6], 5), ["Krav 23,0–25,0 V, mätning 23,10 ±0,15 V:", "intervallet 22,95–23,25 V går utanför kravet."])
set_paras(shape(p.slides[7], 5), ["Pröva varje hypotes mot alla mätvärden,", "inte bara mot det första symtomet."])
subscript_tokens(p, SUBS); drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v45_03_Repetition_infor_tentamen_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[23], 10), ["Källan håller 12 V. Vid 3 A får lasten 10,5 V före och 11,85 V efter åtgärd."])
set_paras(shape(p.slides[23], 12), ["1. Före: R = (12 − 10,5)/3 = 0,50 Ω.", "2. Efter: R = (12 − 11,85)/3 = 0,05 Ω.", "3. Samma ström och mätpunkter visar tydligt minskad resistans."])
set_paras(shape(p.slides[30], 10), ["Vilken väg ska hålla K1 efter START-släpp?"])
subscript_tokens(p, SUBS); drop_notes_line(p); p.save(f"{dst}/{f}")
