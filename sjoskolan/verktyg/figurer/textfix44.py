"""Innehållsändringar i vecka 44: teoriexempel som inte ger samma svar som övningarna,
nedsänkta index och ingen hänvisning till saknade bildanteckningar.
Användning: textfix44.py <in-mapp> <ut-mapp>"""
import sys
from pptx import Presentation
from pptxtext import shape, set_paras, drop_notes_line, subscript_tokens, replace_words, replace_links, duplicate_slide
SUBS = {'Zfel': ('Z', 'fel'), 'Ifel': ('I', 'fel'), 'Rslinga': ('R', 'slinga'), 'Ulast': ('U', 'last'), 'Ukälla': ('U', 'källa'),
        'Ilåg': ('I', 'låg'), 'Ihög': ('I', 'hög'), 'Uhög': ('U', 'hög'), 'Ulåg': ('U', 'låg'), 'Utång': ('U', 'tång'),
        'Uprov': ('U', 'prov'), 'Iläck': ('I', 'läck'), 'ûverklig': ('û', 'verklig'), 'ûvisad': ('û', 'visad'),
        'xmax': ('x', 'max'), 'xmin': ('x', 'min'), 'kI': ('k', 'I'), 'Zs': ('Z', 's')}
OLD_TS = "https://www.transportstyrelsen.se/sv/sjofart/Fartyg/Fartygskonstruktion/Elinstallationer/Lagar-foreskrifter-och-standarder/"
NEW_TS = "https://www.transportstyrelsen.se/sv/om-oss/dina-rattigheter-lagar-och-regler/lagar-och-regler/regler-for-sjofart/regler-for-nationell-sjofart/regler-kompletterade-upplysningar/elektrisk-utrustning-och-elinstallationer/"  # den gamla adressen ger 404
src, dst = sys.argv[1], sys.argv[2]

f = "v44_01_Lagspanningssystem_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[22], 5), ["230 V och Zs = 0,32 Ω ger cirka 720 A.", "Verklig dimensionering kräver skyddsdata och fler villkor."])
set_paras(shape(p.slides[23], 12), ["1. Iₖ ≈ 230/0,575 = 400 A.", "2. Om Zs ökar till 2,3 Ω blir Iₖ ≈ 230/2,3 = 100 A.", "3. Jämför båda strömmarna med aktuellt skydds utlösningskurva."])
set_paras(shape(p.slides[27], 3), ["Förenklad felström"])
# Ny teoribild före avslutet: landanslutning (sjöingenjörens granskning)
n = duplicate_slide(p, 20, 34)
set_paras(shape(n, 2), ["Landanslutning ombord"])
set_paras(shape(n, 3), ["Landström är ofta 400 V/50 Hz, fartygets nät ofta 440 V/60 Hz.", "Spänning och frekvens måste passa innan laster kopplas in."])
set_paras(shape(n, 4), ["Kontrollera före inkoppling"])
set_paras(shape(n, 5), ["Fasföljd, spänning och frekvens. Skyddsjord och potentialutjämning ansluts först.", "Förregling mot generatordrift. Landnätets jordning kan skilja sig från fartygets. HV-landström: IEC/IEEE 80005-1."])
set_paras(shape(p.slides[7], 5), ["Jordtagsresistanser kan begränsa felströmmen så att överströmsskydd ensamt inte ger avsedd bortkoppling.", "TT-system är ovanliga ombord."])
subscript_tokens(p, SUBS); replace_links(p, OLD_TS, NEW_TS); drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v44_02_Hogspanningssystem_elev.pptx"; p = Presentation(f"{src}/{f}")
# Ny teoribild före avslutet: neutralpunktsjordning i HV-nät (sjöingenjörens granskning)
n = duplicate_slide(p, 20, 34)
set_paras(shape(n, 2), ["Neutralpunktsjordning i HV-nät"])
set_paras(shape(n, 3), ["Fartygens 6,6 och 11 kV-nät har ofta neutralpunkten jordad via ett motstånd (NER).", "Motståndet begränsar jordfelsströmmen till en bestämd nivå."])
set_paras(shape(n, 4), ["Jordfelsskyddet larmar eller löser ut"])
set_paras(shape(n, 5), ["Jordfelsreläet larmar eller löser ut enligt skyddsplanen.", "Hur många generatorer som har jordad neutralpunkt samtidigt styrs så att felströmmen blir den avsedda."])
set_paras(shape(p.slides[18], 4), ["Ordna dessa funktioner i en signalväg: brytare, mättransformator, skyddsrelä. Vad händer om skyddsreläet saknar hjälpspänning?"])
replace_words(p, [('UᴸPF', 'Uᴸ · PF')])
set_paras(shape(p.slides[23], 10), ["En ideal strömtransformator är märkt 300/5 A. Primärströmmen är 150 A. Endast beräkning på data."])
set_paras(shape(p.slides[23], 12), ["1. kI = 300/5 = 60.", "2. I₂ = 150/60 = 2,5 A.", "3. Kontroll: 2,5/5 = 150/300 = 0,50 av märkström på båda sidor."])
subscript_tokens(p, SUBS); replace_links(p, OLD_TS, NEW_TS); drop_notes_line(p); p.save(f"{dst}/{f}")

f = "v44_03_Fordjupad_matteknik_elev.pptx"; p = Presentation(f"{src}/{f}")
set_paras(shape(p.slides[5], 5), ["Differensström: alla aktiva ledare genom tången, faserna och N om den finns, men inte PE.", "Använd en läckströmstång för mA-området. Vid omriktare: true RMS, mät på nätsidan."])
set_paras(shape(p.slides[6], 5), ["Verifiera spänningslöshet. Koppla bort isolationsvakt, omriktare och elektronik.", "Provspänning enligt utrustningens anvisning, för 440 V-utrustning ofta 500 V DC. Urladda till jord efteråt."])
set_paras(shape(p.slides[20], 5), ["Flytande mätningar kräver differentialprob med rätt mätkategori.", "I IT-nät ger probjord på en fas ett jordfel och larm, och kortslutning om ett annat fel redan finns."])
set_paras(shape(p.slides[21], 5), ["1 % av 50,00 V + 3 steg à 0,01 V ger ±0,53 V.", "En full mätosäkerhetsbudget kräver en beskriven modell."])
subscript_tokens(p, SUBS); replace_links(p, OLD_TS, NEW_TS); drop_notes_line(p); p.save(f"{dst}/{f}")
