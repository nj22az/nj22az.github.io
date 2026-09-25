"""Innehållsändringar i vecka 41 (samma granskningsregler som vecka 40): exempel får inte avslöja
övningssvar, fartygsexempel där det passar, ingen hänvisning till saknade bildanteckningar.
Användning: textfix41.py <in-mapp> <ut-mapp>"""
import sys
from pptx import Presentation
from pptxtext import shape, set_paras, drop_notes_line
src, dst = sys.argv[1], sys.argv[2]

f = "v41_01_Trefassystemets_grunder_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[6], 5), ["Ombord är 440 V vanligt: då är Uꜰ ≈ 254 V.", "Använd inte linjespänningen som fas–neutralspänning."])
drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v41_02_Y_och_trefaseffekt_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[6], 5), ["440 V över tre grenar på 44 Ω i Δ:", "Igren = 10 A och Iᴸ ≈ 17,3 A."])
set_paras(shape(p.slides[7], 5), ["440 V, 20 A och cos φ = 0,85 ger", "S ≈ 15,2 kVA och P ≈ 13,0 kW."])
set_paras(shape(p.slides[20], 4), ["Nätets Uᴸ = högre märkvärde: Y"])
set_paras(shape(p.slides[20], 5), ["Nätets Uᴸ = lägre märkvärde: Δ.", "Ombord: en motor Δ/Y 440/760 V på 440 V-nät kopplas i Δ."])
set_paras(shape(p.slides[21], 5), ["Paxel = 11 kW, η = 0,90 ger Pᵢₙ ≈ 12,2 kW.", "Vid 440 V och PF = 0,85 blir Iᴸ ≈ 18,9 A."])
drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v41_03_Fysisk_traff_och_matning_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[6], 4), ["I = U/(R₁ + R₂)"])
set_paras(shape(p.slides[6], 5), ["Beräkna I, U₁ och U₂ i övning 2 före mätningen.", "Instruktören granskar mätplan och anslutningar före start."])
set_paras(shape(p.slides[7], 4), ["Ugren = Uᴸ/√3 i symmetrisk Y"])
drop_notes_line(p); p.save(f"{dst}/{f}")
print("ok")
