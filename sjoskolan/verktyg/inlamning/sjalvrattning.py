"""Självrättande inlämning: svarsfält under uppgifterna, rättning i webbläsaren och inlämning som PDF.

Beslut 11 oktober 2026 (Nils): inlämningen i vecka 42 rättar sig själv. Eleven skriver sina svar, trycker Rätta och får
Rätt! eller Skiljer sig med en hänvisning till var hen kan läsa (regel 5 och 6, tolerans 2 %). Varje fråga har tre
försök. Efter tre fel låses frågan; när eleven har läst om veckans delar (bekräftat på delsidorna) får de låsta frågorna
tre nya försök. Sidan sparar första svar, sista svar, försök, omgång och tider (regel 25). Lämna in visar resultatet och
ger en PDF som eleven lämnar in i Google Classroom.
Logiken finns i gemensamt/sjalvrattning.mjs, sidan i gemensamt/sjalvrattning-sida.mjs och PDF:en i gemensamt/pdf.mjs.

Beslut 12 oktober 2026 (Nils): veckans texter (PDF) läses hemma och besvaras på en egen sida, Quiz
(vecka-XX/aktuell/Quiz.html, mallen i quiz_mall.py). Frågorna är flerval med bokstäverna A–E i postens
ordning; en låst fråga får tre nya försök när eleven har läst om just den texten. Se QUIZ nedan.

Här finns bara det publika: fälten, alternativen, hänvisningarna och checklistan. Rätta svar står aldrig här.
De finns som saltade SHA-256-hashar i vecka-XX/aktuell/inlamning-nyckel.mjs och quiz-nyckel.mjs, som facit.py
skriver ur klartextfiler utanför repot. Uppgifternas text kommer ur innehållsdatabasen (inlämningen: EL-000817–819).
Fälten följer postens delfrågor (a, b, c …) och bygget stoppar om de inte gör det. Quizens poster har frågor,
alternativ och läshänvisningar i själva posten (delfrågor med alternativ och ledtrad); fälten byggs därifrån.

Hänvisningar till delsidorna anges med avsnittets rubrik. Numret räknas ur Del_N.html när sidan byggs (regel 5),
så att hänvisningen stämmer när avsnitt flyttas. En rubrik som saknas stoppar bygget.
"""
import base64
import hashlib
import html
import json
import re
from pathlib import Path

SJO = Path(__file__).resolve().parents[2]
# Veckor där inlämningssidan rättar sig själv. verktyg/inlamning/bygg.py och innehall/export/delsidor_veckor.py läser den.
# Vecka 43 och 44 sedan 12 oktober 2026 (lärarens beslut: resten av veckorna som vecka 42, allt lämnas in senast fredag).
# Vecka 45 har bara den frivilliga övningstentan; dess felsökningsrapport och analys lämnas in med vecka 43 och 44.
SJALVRATTANDE = {42, 43, 44}
# Cacheversion för gemensamt/sjalvrattning*.mjs, quiz-sida.mjs, pdf.mjs, lasbekraftelse.mjs och
# sjalvrattning.css (regel 13). Byt den när en av filerna ändras efter publicering; importerna i .mjs-filerna följer med.
VERSION = '20261014'
MAX_FORSOK = 3
MULTIMETER_CAT = '../../multimetersimulator/?ovning=category'
# Alternativen visas i en fast, blandad ordning (samma för alla elever), så att rätt svar inte står på samma plats.
ORDNINGSFRO = 'sjoskolan-v42'


def mark(text):
    """Innehållsmarkering till HTML (X_{L} blir X<sub>L</sub>), som markHtml i gemensamt/markering.mjs."""
    tagg = {'_': 'sub', '^': 'sup'}
    return re.sub(r'([_^])\{([^{}]*)\}', lambda m: f'<{tagg[m.group(1)]}>{m.group(2)}</{tagg[m.group(1)]}>', html.escape(text, quote=False))


def visningsordning(falt_id, alternativ):
    """Alternativen (id, text) i visningsordning: sorterade på sha256(frö|fält|id). Id:t och hashningen ändras inte."""
    return sorted(alternativ, key=lambda a: hashlib.sha256(f'{ORDNINGSFRO}|{falt_id}|{a[0]}'.encode()).hexdigest())


# ------------------------------------------------------------------ fält
def tal(id_, etikett, enhet, kort, pekare, dec=1, tolerans=2, heltal=None):
    """Ett tal. Godkänns inom tolerans % och avrundas till dec decimaler innan det hashas (facit.py gör samma sak).
    heltal=(min, max): bara ett heltal i intervallet är ett giltigt svar."""
    return {'id': id_, 'typ': 'tal', 'etikett': etikett, 'enhet': enhet, 'kort': kort, 'pekare': pekare, 'dec': dec,
            'tolerans': tolerans, 'heltal': heltal}


def val(id_, fraga, alternativ, kort, pekare, lista=False):
    """Ett val bland alternativ. lista=True ger en rullista (korta alternativ i naturlig ordning), annars radioknappar."""
    return {'id': id_, 'typ': 'val', 'fraga': fraga, 'alternativ': alternativ, 'kort': kort, 'pekare': pekare, 'lista': lista}


def text(id_, etikett, kort, hjalp='', las=False, rad=3, enrad=False):
    """Fri text. las=True: texten låses som första version med knappen Jag är klar med texten (rättas inte)."""
    return {'id': id_, 'typ': 'lastext' if las else 'text', 'etikett': etikett, 'kort': kort, 'hjalp': hjalp, 'rad': rad, 'enrad': enrad}


def avsnitt(del_, titel, efter=''):
    return {'del': del_, 'titel': titel, 'efter': efter}


def lank(href, titel, fore='', efter='', slut='.'):
    return {'href': href, 'titel': titel, 'fore': fore, 'efter': efter, 'slut': slut}


KATEGORI = [('1', 'CAT II'), ('2', 'CAT III'), ('3', 'CAT IV'), ('4', 'Ingen nätkategori (äldre CAT I)')]
SPANNING = [('1', '300 V'), ('2', '600 V'), ('3', '1 000 V'), ('4', '1 500 V')]
LAS_KATEGORI = lank(MULTIMETER_CAT, 'Multimeterlabbet: Välj CAT-klass', efter='Tabellen och texten under den visar vilken kategori en mätplats har.')
LAS_SPANNING = lank(MULTIMETER_CAT, 'Multimeterlabbet: Välj CAT-klass',
                    fore='Jämför spänningen på mätplatsen med märkspänningen.')


def plats(nr, namn, kort):
    return {'namn': namn, 'falt': [
        val(f'819a{nr}-kat', 'Mätplatsens kategori', KATEGORI, f'a {kort} kategori', LAS_KATEGORI, lista=True),
        val(f'819a{nr}-volt', 'Lägsta märkspänning som räcker', SPANNING, f'a {kort} spänning', LAS_SPANNING, lista=True)]}


# Vecka 42. Fyra alternativ per flervalsfråga, så att tre försök inte räcker för att pröva sig fram.
FORMULAR = {42: {
    'EL-000817': {'delar': [
        {'del': 'a', 'rubrik': 'a) Riskbedömningen', 'falt': [
            text('817a-fara', 'Fara', 'a fara', 'Vad kan skada någon?', las=True),
            text('817a-handelse', 'Händelse', 'a händelse', 'Vad kan hända under arbetet?', las=True),
            text('817a-konsekvens', 'Konsekvens', 'a konsekvens', 'Vilken skada kan det bli?', las=True),
            text('817a-skydd', 'Befintliga skydd', 'a befintliga skydd', 'Vad skyddar redan nu?', las=True),
            text('817a-atgarder', 'Åtgärder', 'a åtgärder', 'Vad gör ni före och under arbetet?', las=True, rad=4)]},
        {'del': 'b', 'rubrik': 'b) Arbetsmetod', 'falt': [
            text('817b-metod', 'Arbetsmetod', 'b arbetsmetod', 'Vilken arbetsmetod väljer du?', las=True, enrad=True),
            text('817b-motivering', 'Motivering', 'b motivering', 'Varför väljer du den?', las=True)]},
        {'del': 'c', 'rubrik': 'c) Vem gör vad', 'falt': [
            text('817c-vem', 'Vem gör vad', 'c vem gör vad', 'Skriv vem (funktion) och vad personen gör.', las=True, rad=4),
            text('817c-verifiering', 'Hur varje åtgärd verifieras', 'c verifiering', 'Hur kontrollerar ni att varje åtgärd är gjord?', las=True, rad=4)]},
        {'del': 'd', 'falt': [
            val('817d', 'd) Vilken energikälla är lätt att missa?', [
                ('1', 'Gruppen i fördelningen som matar armaturen'),
                ('2', 'Nödljusbatteriet inne i armaturen'),
                ('3', 'Landströmmen när fartyget ligger vid kaj'),
                ('4', 'Kylmaskinen som kyler kylrummet')], 'd', avsnitt(2, 'Avgränsning före beslut'))]}],
        # Visas först när eleven har låst sin första version av a–c och fråga d är rätt eller låst (namnger inte svaret på d).
        'checklista_efter': '817d',
        'checklista': [
            ('Gruppen i fördelningen är frånskild, låst och märkt.', avsnitt(2, 'Fem säkerhetsåtgärder')),
            ('Du kontrollerar att armaturen är spänningslös med en provare som du provar före och efter.', avsnitt(3, 'Provare, låsning och märkning')),
            ('Alla energikällor som kan finnas kvar när gruppen är bortkopplad är kartlagda, bortkopplade och kontrollerade.', avsnitt(2, 'Avgränsning före beslut')),
            ('Det fuktiga golvet finns med i bedömningen, till exempel att golvet torkas och att du står torrt.', avsnitt(1, 'Risker i marin miljö')),
            ('Arbetsmetoden är arbete utan spänning, och du förklarar varför.', avsnitt(2, 'SS-EN 50110-1 och ESA')),
            ('Det står vem som gör vad, till exempel vem som frånskiljer och låser och vem som byter armaturen.', avsnitt(2, 'Roller och kommunikation')),
            ('Det står hur varje åtgärd kontrolleras och vem som kontrollerar den.', avsnitt(3, 'Från identifierad fara till beslut'))],
        'las_pekare': avsnitt(3, 'Arbetsmomentets gränser')},
    'EL-000818': {'delar': [
        {'del': 'a', 'falt': [tal('818a', 'a) Beröringsspänning U_{beröring} (V)', 'V', 'a', avsnitt(1, 'Beröringsspänning'))]},
        {'del': 'b', 'falt': [tal('818b', 'b) Strömmen genom kroppen I (mA)', 'mA', 'b',
                                 avsnitt(1, 'Beröringsspänning', 'Sätt in D = 12 i R och svara i mA.'))]},
        {'del': 'c', 'falt': [
            val('818c', 'c) Varför kan modellen inte användas som säkerhetsgräns?', [
                ('1', 'Kroppens resistans ändras mycket med fukt, kontaktyta och spänning. Ett antaget värde ger ingen säker gräns.'),
                ('2', 'Modellen ger alltid för hög ström. Den verkliga strömmen blir lägre, så modellen är på den säkra sidan.'),
                ('3', 'Modellen räknar inte med säkringen. Säkringen begränsar strömmen genom kroppen till en ofarlig nivå.'),
                ('4', 'Kroppens resistans är alltid exakt 1 000 Ω, så modellen räknar med fel värde.')],
                'c', avsnitt(1, 'Strömmens väg genom kroppen')),
            text('818c-text', 'Förklara med egna ord (frivilligt)', 'c egna ord', rad=2)]},
        {'del': 'd', 'falt': [
            val('818d', 'd) Varför kopplade säkringen eller dvärgbrytaren kanske inte bort matningen?', [
                ('1', 'Säkringen löser bara ut vid kortslutning mellan fas och neutralledare, aldrig vid fel mot ett hölje.'),
                ('2', 'Säkringen löser ut först när någon rör höljet. Då går strömmen genom kroppen och säkringen bryter.'),
                ('3', 'Utan skyddsledare finns ingen bra väg tillbaka för felströmmen. Strömmen blir för liten för att säkringen ska lösa ut.'),
                ('4', 'Säkringen var för stor. En mindre säkring hade löst ut, också utan skyddsledare.')],
                'd', avsnitt(1, 'Beröringsspänning', 'Titta i figuren: vilken väg har felströmmen när skyddsledaren (PE) har gått av?')),
            text('818d-text', 'Förklara med egna ord (frivilligt)', 'd egna ord', rad=2)]}]},
    'EL-000819': {'delar': [
        {'del': 'a', 'intro': 'a) Välj mätplatsens kategori och den lägsta märkspänning som räcker för hela mätutrustningen.',
         'platser': [plats(1, 'Plintarna för en utgående grupp i huvudtavlan, 440 V', 'huvudtavla'),
                     plats(2, 'Ett eluttag i en hytt, 230 V', 'hytt'),
                     plats(3, 'Batteriet i en livbåt, 24 V', 'livbåt')]},
        {'del': 'b', 'falt': [
            val('819b', 'b) Varför räcker det inte att bara instrumentet har rätt kategori?', [
                ('1', 'Kategorin gäller bara instrumentet. Sladdarna behöver bara klara spänningen.'),
                ('2', 'Sladdar, spetsar och tillbehör måste också ha rätt kategori och spänning. Den lägsta märkningen i hela mätutrustningen gäller.'),
                ('3', 'Det är volt-talet som avgör. Ett högt volt-tal på instrumentet räcker för alla mätplatser.'),
                ('4', 'Sladdarna har ingen egen märkning, så de behöver inte kontrolleras.')],
                'b', lank(MULTIMETER_CAT, 'Multimeterlabbet: Välj CAT-klass', efter='Steg 3 handlar om mätare och sladdar.')),
            text('819-text', 'Motivera dina val med egna ord (frivilligt)', 'motivering', rad=3)]}]},
}}

# Vecka 43: uppgift 1–3 och felsökningsrapporten (EL-000828, del 4 Systematisk felsökning i vecka-45/aktuell/Del_1.html).
# D = 12 för alla (gemensamt/elevtal.mjs KURS_D). Hänvisningarna går till delens avsnitt med rubriken; del 4 räknas ur
# sidornas rubrikrad (delsidor), så att den hittas i vecka-45-mappen.
FORMULAR[43] = {
    'EL-000820': {'delar': [
        {'del': 'a', 'falt': [
            val('820a', 'a) Vilken koppling ska motorn ha på nätet 400 V?', [
                ('1', 'Δ (triangel). Märkningen 400 V gäller för Δ, och nätet är 400 V.'),
                ('2', 'Y (stjärna). Märkningen 690 V gäller för Y, och 690 V är högre än nätet.'),
                ('3', 'Y (stjärna). Då får varje lindning hela nätets 400 V.'),
                ('4', 'Båda går lika bra vid 400 V. Kopplingen påverkar bara startströmmen.')],
                'a', avsnitt(2, 'Startutrustning', 'Jämför märkningen Δ/Y 400/690 V med nätets spänning.')),
            text('820a-text', 'Motivera med egna ord (frivilligt)', 'a motivering', rad=2)]},
        {'del': 'b', 'falt': [
            tal('820b-ns', 'b) Synkront varvtal n_{s} (r/min)', 'r/min', 'b n_s', avsnitt(2, 'Asynkronmotorns roterande fält', 'Här är p antalet poler.'), dec=0),
            tal('820b-s', 'Eftersläpning s (%)', '%', 'b s', avsnitt(2, 'Eftersläpning'), dec=2),
            tal('820b-pin', 'Elektrisk inmatning P_{in} (kW)', 'kW', 'b P_in',
                avsnitt(2, 'Transformator och roterande maskin', 'Märkeffekten 4,0 kW är effekten på axeln.'), dec=2),
            tal('820b-il', 'Linjeström I_{L} (A)', 'A', 'b I_L', lank('../../gemensamt/Formelblad_och_begrepp.html#trefas', 'Formelbladet: Trefas',
                efter='Använd den elektriska inmatningen, nätets 400 V och cos φ.'), dec=2)]},
        {'del': 'c', 'falt': [
            tal('820c', 'c) Synkront varvtal med frekvensomriktaren (r/min)', 'r/min', 'c',
                avsnitt(2, 'Asynkronmotorns roterande fält', 'Sätt in f = 30 + D med D = 12.'), dec=0)]}]},
    'EL-000821': {'delar': [
        {'del': 'a', 'falt': [
            tal('821a-ik', 'a) Möjlig kortslutningsström I_{k} (kA)', 'kA', 'a I_k', avsnitt(1, 'Säkring och dvärgbrytare', 'Sätt in D = 12.'), dec=2),
            val('821a', 'Räcker brytförmågan 6 kA?', [
                ('1', 'Ja. Den möjliga kortslutningsströmmen är lägre än brytförmågan 6 kA.'),
                ('2', 'Nej. Den möjliga kortslutningsströmmen är högre än brytförmågan 6 kA.'),
                ('3', 'Ja. Märkströmmen 16 A avgör vilken kortslutningsström brytaren klarar.'),
                ('4', 'Det går inte att avgöra. Brytförmågan gäller bara vid överlast.')],
                'a räcker', avsnitt(1, 'Säkring och dvärgbrytare'))]},
        {'del': 'b', 'falt': [
            tal('821b-id', 'b) Differensström I_{Δ} (mA)', 'mA', 'b I_Δ', avsnitt(1, 'Jordfelsbrytare', 'Sätt in D = 12 och svara i mA.'), dec=1),
            val('821b', 'Måste jordfelsbrytaren lösa?', [
                ('1', 'Ja. All differensström över noll gör att en jordfelsbrytare löser.'),
                ('2', 'Ja. Differensströmmen är större än halva märkvärdet, och då måste den lösa.'),
                ('3', 'Nej. Differensströmmen är lägre än märkvärdet 30 mA. Den får lösa, men den måste inte.'),
                ('4', 'Nej. En jordfelsbrytare löser bara vid kortslutning mellan två faser.')],
                'b måste lösa', avsnitt(1, 'Jordfelsbrytare', 'Jämför differensströmmen med märkvärdet I_{Δn} = 30 mA.'))]},
        {'del': 'c', 'falt': [
            val('821c', 'c) Varför skyddar jordfelsbrytaren inte mot överlast?', [
                ('1', 'Den mäter bara skillnaden mellan utgående och återkommande ström. Vid överlast är strömmarna lika stora.'),
                ('2', 'Den är för långsam för att hinna bryta en överlast.'),
                ('3', 'Den löser bara vid strömmar över 6 kA.'),
                ('4', 'Den sitter bara i IT-nät, och där kan överlast inte uppstå.')],
                'c', avsnitt(1, 'Jordfelsbrytare'))]}]},
    'EL-000822': {'delar': [
        {'del': 'a', 'intro': 'Rita först om hållkretsen med nödstoppet S2 och lampan H1 på papper. Fotografera ritningen och lämna in '
                              'bilden i Classroom tillsammans med PDF:en.', 'falt': [
            val('822a', 'a) Var ska nödstoppet S2 sitta, och ska det vara NO eller NC?', [
                ('1', 'NC, i serie med S0 före förgreningen till START (S1) och hållkontakten, så att S2 bryter båda vägarna.'),
                ('2', 'NO, parallellt med START (S1).'),
                ('3', 'NC, i serie med bara hållkontakten K1, efter förgreningen.'),
                ('4', 'NO, i serie med S0 före förgreningen.')],
                'a', avsnitt(3, 'Hållkretsens funktion', 'Följ strömvägarna till spolen: vilka vägar måste nödstoppet bryta?')),
            text('822a-text', 'Motivera med egna ord (frivilligt)', 'a motivering', rad=2)]},
        {'del': 'b', 'falt': [
            val('822b', 'b) Hur ansluts H1 så att den bara lyser när K1 är dragen?', [
                ('1', 'Över en extra NO-kontakt på K1, eller parallellt med spolen K1.'),
                ('2', 'Över en NC-kontakt på K1.'),
                ('3', 'I serie med START-knappen S1.'),
                ('4', 'Parallellt med STOPP-knappen S0.')],
                'b', avsnitt(3, 'Symboler och referenser', 'K1:s spole och kontakter hör till samma apparat.'))]},
        {'del': 'c', 'rubrik': 'c) Beskriv kretsen i ord', 'falt': [
            text('822c-vila', 'Vila', 'c vila', 'Vilka kontakter är slutna och öppna? Är K1 dragen?', las=True, rad=2),
            text('822c-start', 'Start', 'c start', 'Vad händer när du trycker START?', las=True, rad=2),
            text('822c-hallning', 'Hållning', 'c hållning', 'Varför fortsätter pumpen när du släpper START?', las=True, rad=2),
            text('822c-stopp', 'Stopp', 'c stopp', 'Vad händer när du trycker STOPP?', las=True, rad=2),
            text('822c-nodstopp', 'Nödstopp', 'c nödstopp', 'Vad händer när någon trycker nödstoppet, och vad krävs för att starta igen?', las=True, rad=2)]},
        {'del': 'd', 'rubrik': 'd) Felsökningsrad från Hållkretslabbet',
         'intro': 'Sätt i en felmodul. Skriv varje steg innan du går vidare, och visa felmodulens fel först när raden är ifylld.', 'falt': [
            text('822d-observation', 'Observation', 'd observation', 'Vad ser du innan du mäter?', las=True, rad=2),
            text('822d-hypotes', 'Hypotes', 'd hypotes', 'Vilken möjlig orsak prövar du?', las=True, rad=2),
            text('822d-kontroll', 'Kontroll', 'd kontroll', 'Vilken mätning gör du, mellan vilka punkter och i vilket driftläge?', las=True, rad=2),
            text('822d-forvantat', 'Förväntat resultat', 'd förväntat', 'Vad visar mätningen om hypotesen stämmer? Skriv det före mätningen.', las=True, rad=2),
            text('822d-resultat', 'Resultat', 'd resultat', 'Vad visade mätningen?', las=True, rad=2),
            text('822d-slutsats', 'Slutsats', 'd slutsats', 'Vad visar resultatet, och vad återstår?', las=True, rad=2)]}],
        # Låsningen gäller c och d. Listan visas när a och b är rätta eller låsta (den beskriver nödstoppets verkan).
        'las_efter': 'd', 'las_text': 'c och d', 'checklista_efter': ['822a', '822b'],
        'checklista': [
            ('Vila: ingen väg till spolen är sluten, K1 är släppt och pumpen står.', avsnitt(3, 'Hållkretsens funktion')),
            ('Start: START sluter vägen till spolen, K1 drar och hållkontakten sluter.', avsnitt(3, 'Hållkretsens funktion')),
            ('Hållning: hållkontakten håller spolen matad när START släpps.', avsnitt(3, 'Hållkretsens funktion')),
            ('Stopp och nödstopp: vägen till spolen bryts, K1 släpper, och pumpen startar inte igen förrän någon trycker START.',
             avsnitt(3, 'Hållkretsens funktion')),
            ('Observationen är skriven innan du mätte, och hypotesen är en möjlig orsak som går att pröva.', avsnitt(4, 'Observation och prövbar hypotes')),
            ('Kontrollen anger mätpunkter och driftläge, och förväntat resultat står före resultatet.', avsnitt(4, 'En skiljande kontroll')),
            ('Slutsatsen säger vad mätningen visar och vad som återstår att kontrollera.', avsnitt(4, 'Felsökningens arbetsgång'))],
        'las_pekare': avsnitt(4, 'Felsökningens arbetsgång')},
    'EL-000828': {'delar': [
        {'del': 'a', 'intro': 'Felsök en felmodul i taget i Hållkretslabbet. Skriv klart raden för felmodul 1 (a–c) innan du sätter i felmodul 2.',
         'falt': [text('828a-1', 'Felmodul 1: observation', 'a felmodul 1', 'Vad ser du innan du mäter?', las=True, rad=2),
                  text('828a-2', 'Felmodul 2: observation', 'a felmodul 2', 'Vad ser du innan du mäter?', las=True, rad=2)]},
        {'del': 'b', 'falt': [
            text('828b-1-orsaker', 'Felmodul 1: två möjliga orsaker', 'b felmodul 1 orsaker', las=True, rad=2),
            text('828b-1-matning', 'Felmodul 1: mätningen som skiljer orsakerna åt', 'b felmodul 1 mätning',
                 'Mellan vilka punkter och i vilket driftläge? Varför ger orsakerna olika resultat?', las=True, rad=3),
            text('828b-1-forvantat', 'Felmodul 1: förväntat resultat för varje orsak', 'b felmodul 1 förväntat',
                 'Skriv det innan du ser resultatet.', las=True, rad=2),
            text('828b-2-orsaker', 'Felmodul 2: två möjliga orsaker', 'b felmodul 2 orsaker', las=True, rad=2),
            text('828b-2-matning', 'Felmodul 2: mätningen som skiljer orsakerna åt', 'b felmodul 2 mätning',
                 'Mellan vilka punkter och i vilket driftläge? Varför ger orsakerna olika resultat?', las=True, rad=3),
            text('828b-2-forvantat', 'Felmodul 2: förväntat resultat för varje orsak', 'b felmodul 2 förväntat',
                 'Skriv det innan du ser resultatet.', las=True, rad=2)]},
        {'del': 'c', 'falt': [
            text('828c-1-resultat', 'Felmodul 1: resultat', 'c felmodul 1 resultat', las=True, rad=2),
            text('828c-1-slutsats', 'Felmodul 1: slutsats', 'c felmodul 1 slutsats', 'Vilken orsak stöder mätningen, och vad återstår?', las=True, rad=2),
            text('828c-1-fel', 'Felmodul 1: felmodulens fel', 'c felmodul 1 fel', 'Visa felet i labbet först när raden är ifylld. Stämde din slutsats?', las=True, rad=2),
            text('828c-2-resultat', 'Felmodul 2: resultat', 'c felmodul 2 resultat', las=True, rad=2),
            text('828c-2-slutsats', 'Felmodul 2: slutsats', 'c felmodul 2 slutsats', 'Vilken orsak stöder mätningen, och vad återstår?', las=True, rad=2),
            text('828c-2-fel', 'Felmodul 2: felmodulens fel', 'c felmodul 2 fel', 'Visa felet i labbet först när raden är ifylld. Stämde din slutsats?', las=True, rad=2)]}],
        'las_text': 'a–c',
        'checklista': [
            ('Båda raderna har en observation som är skriven innan du mätte.', avsnitt(4, 'Observation och prövbar hypotes')),
            ('Varje rad har två möjliga orsaker.', avsnitt(4, 'Observation och prövbar hypotes')),
            ('Mätningen ger olika resultat för de två orsakerna, och du anger punkter och driftläge.', avsnitt(4, 'En skiljande kontroll')),
            ('Förväntat resultat står före resultatet i båda raderna.', avsnitt(4, 'Felsökningens arbetsgång')),
            ('Slutsatsen säger vilken orsak mätningen stöder och vad som återstår.', avsnitt(4, 'Observation och prövbar hypotes')),
            ('Du visade felet först när raden var ifylld, och du skriver om slutsatsen stämde.', avsnitt(4, 'Felsökningens arbetsgång'))],
        'las_pekare': avsnitt(4, 'Felsökningens arbetsgång')},
}

# Vecka 44: uppgift 1–3 och analysen av mätdata (EL-000826, del 4 Analys av mätresultat i vecka-45/aktuell/Del_2.html).
VAG = [('1', 'Genom skyddsledaren (PE) tillbaka till källans jordade punkt'),
       ('2', 'Genom jordtaget och jorden tillbaka till källans jordning'),
       ('3', 'Nästan ingen ström: källan är inte jordad, bara kablarnas kapacitans leder'),
       ('4', 'Genom neutralledaren (N) tillbaka till källan')]
SKYDDET = [('1', 'Överströmsskyddet (säkring eller dvärgbrytare)'),
           ('2', 'Jordfelsbrytaren'),
           ('3', 'Inget skydd kopplar bort felet. Isolationsövervakningen larmar.'),
           ('4', 'Ingen automatik. Någon måste bryta med huvudbrytaren.')]
SYSTEM = [('tns', 'TN-S', 'TN-system'), ('tt', 'TT', 'TT-system'), ('it', 'IT, första felet', 'IT-system och övervakning')]
FELSTROM_LABB = '../../isolationslabbet/?uppgift=kapstrom'
FORMULAR[44] = {
    'EL-000823': {'delar': [
        {'del': 'a', 'falt': [
            val(f'823a-{k}', f'{"a) " if i == 0 else ""}{namn}: felströmmens väg vid fel mellan fas och utsatt del', VAG, f'a {namn}',
                avsnitt(1, rubrik), lista=True) for i, (k, namn, rubrik) in enumerate(SYSTEM)]},
        {'del': 'b', 'falt': [
            val(f'823b-{k}', f'{"b) " if i == 0 else ""}{namn}: skyddet som kopplar bort felet', SKYDDET, f'b {namn}',
                avsnitt(1, rubrik), lista=True) for i, (k, namn, rubrik) in enumerate(SYSTEM)]},
        {'del': 'c', 'falt': [
            val('823c', 'c) Vad händer vid första och andra felet i IT-systemet?', [
                ('1', 'Första felet ger liten ström och larm, och driften kan fortsätta. Ett andra fel på en annan fas ger kortslutning '
                      'via skrovet, och överströmsskyddet löser.'),
                ('2', 'Första felet ger kortslutning, och säkringen löser direkt. Ett andra fel kan därför inte uppstå.'),
                ('3', 'Båda felen ger bara larm, eftersom nätet inte är jordat.'),
                ('4', 'Första felet ger larm. Ett andra fel på samma fas ger kortslutning via skrovet.')],
                'c', avsnitt(1, 'Första och andra felet'))]},
        {'del': 'd', 'falt': [
            val('823d', 'd) Varför används IT-system ofta ombord?', [
                ('1', 'Ett första jordfel stoppar inte viktiga förbrukare. Driften kan fortsätta medan felet söks.'),
                ('2', 'IT-system behöver ingen isolationsövervakning.'),
                ('3', 'Ett andra jordfel blir ofarligt, eftersom nätet inte är jordat.'),
                ('4', 'IT-system har ingen skyddsledare, så de blir billigare.')],
                'd', avsnitt(1, 'IT-system och övervakning')),
            text('823-text', 'Förklara skillnaderna mellan systemen kort med egna ord (frivilligt)', 'förklaring', rad=3)]}]},
    'EL-000824': {'delar': [
        {'del': 'a', 'falt': [
            tal('824a', 'a) Linjeström I_{L} vid 6,6 kV (A)', 'A', 'a', avsnitt(2, 'Spänningsnivå och överföring', 'Sätt in D = 12 i P och räkna med effekten i W.'), dec=1)]},
        {'del': 'b', 'falt': [
            tal('824b', 'b) Ström vid 440 V med samma effekt (A)', 'A', 'b', avsnitt(2, 'Spänningsnivå och överföring'), dec=0),
            val('824b-val', 'Varför används högspänning för stora laster?', [
                ('1', 'Vid samma effekt blir strömmen mycket lägre. Kablarna kan vara klenare, och förlusterna och spänningsfallet blir mindre.'),
                ('2', 'Högspänning är säkrare att arbeta nära än lågspänning.'),
                ('3', 'Motorn ger större effekt vid högre spänning, även med samma ström.'),
                ('4', 'Högre spänning ger högre frekvens, så motorn går fortare.')],
                'b varför', avsnitt(2, 'Spänningsnivå och överföring'))]},
        {'del': 'c', 'falt': [
            tal('824c', 'c) Sekundärström i strömtransformatorn (A)', 'A', 'c',
                avsnitt(2, 'Mättransformatorer och reläskydd', 'Omsättningen 600/1 A: 600 A primärt ger 1 A sekundärt.'), dec=3)]}]},
    'EL-000825': {'delar': [
        {'del': 'a', 'intro': 'a) Spara labbprotokollet som PDF och lämna in det i Classroom tillsammans med PDF:en från den här sidan.', 'falt': []},
        {'del': 'b', 'falt': [
            tal('825b', 'b) Förutsagd felström vid det första jordfelet I (mA)', 'mA', 'b',
                lank(FELSTROM_LABB, 'Isolationslabbet: Ström i jordfelet', efter='Samma samband gäller med 2 µF per fas.'), dec=0),
            text('825b-text', 'Vad visade labbet? (frivilligt)', 'b labbet', rad=2)]},
        {'del': 'c', 'falt': [
            val('825c', 'c) Varför får ett stort fartyg med långa kablar större ström vid första jordfelet än ett litet?', [
                ('1', 'Långa kablar har större kapacitans mot skrovet, och felströmmen ökar med kapacitansen.'),
                ('2', 'Långa kablar har högre resistans, och högre resistans ger större ström.'),
                ('3', 'Ett stort fartyg har alltid högre spänning mellan faserna.'),
                ('4', 'Isolationsövervakningen på ett stort fartyg driver en större provström genom felet.')],
                'c', lank(FELSTROM_LABB, 'Isolationslabbet: Ström i jordfelet', efter='Vilken storhet i sambandet växer med kabelns längd?'))]}]},
    'EL-000826': {'delar': [
        {'del': 'a', 'falt': [
            tal('826a-fore', 'a) Slingresistans före åtgärden (Ω)', 'Ω', 'a före',
                avsnitt(1, 'Beräkning som stöd', 'Sätt in D = 12. Använd strömmen som mättes samtidigt.'), dec=3),
            tal('826a-efter', 'Slingresistans efter åtgärden (Ω)', 'Ω', 'a efter', avsnitt(1, 'Beräkning som stöd'), dec=3)]},
        {'del': 'b', 'falt': [
            tal('826b-fore', 'b) Voltmeterns felgräns för pumpens spänning före (V)', 'V', 'b före',
                avsnitt(3, 'Osäkerhet och felgräns', '2 siffror betyder 2 steg i sista siffran.'), dec=3),
            tal('826b-efter', 'Felgräns för pumpens spänning efter (V)', 'V', 'b efter', avsnitt(3, 'Osäkerhet och felgräns'), dec=3),
            val('826b', 'Är förbättringen säkert större än mätosäkerheten?', [
                ('1', 'Ja. Pumpens spänning ökade mer än de två felgränserna tillsammans.'),
                ('2', 'Nej. Ökningen är mindre än felgränsen för en enda avläsning.'),
                ('3', 'Det går inte att avgöra, eftersom strömmen också ändrades.'),
                ('4', 'Ja, eftersom samma voltmeter användes båda gångerna, så felen tar alltid ut varandra.')],
                'b säker', avsnitt(4, 'Mätvärde, intervall och slutsats'))]},
        {'del': 'c', 'rubrik': 'c) Slutsats', 'falt': [
            text('826c-verifierat', 'Det här är verifierat', 'c verifierat', 'Vad visar mätningarna säkert?', las=True, rad=3),
            text('826c-aterstar', 'Det här återstår att kontrollera', 'c återstår', 'Vad kan mätningarna inte visa?', las=True, rad=3)]}],
        'las_text': 'c', 'checklista_efter': ['826b'],
        'checklista': [
            ('Du skriver att slingresistansen har minskat och anger värdena före och efter.', avsnitt(1, 'Beräkning som stöd')),
            ('Du jämför ökningen av pumpens spänning med mätosäkerheten och skriver om förbättringen är säker.', avsnitt(4, 'Mätvärde, intervall och slutsats')),
            ('Du skriver vad som återstår, till exempel var den kvarvarande resistansen sitter och om pumpen nu får tillräcklig spänning.',
             avsnitt(4, 'Åtgärd och rotorsak')),
            ('Slutsatsen säger inte mer än mätningarna visar: de gäller vissa punkter vid ett visst driftläge.', avsnitt(4, 'Mätdata och slutsats'))],
        'las_pekare': avsnitt(4, 'Mätdata och slutsats')},
}
# Uppgifter som står på en annan veckas sida men lämnas in med veckan ovan (verktyg/inlamning/bygg.py VECKOR[45]).
LAMNAS_MED = {'EL-000826': 44, 'EL-000828': 43}


def post(ovning):
    return json.loads((SJO / 'innehall' / 'ovningar' / f'{ovning}.json').read_text(encoding='utf-8'))


def textkalla(p):
    """Textens PDF: (adress relativt sidan, titel) ur postens första resurs."""
    r = p['referenser']['resurser'][0]
    return Path(r['url']).name, r['titel']


def kortnamn(p):
    """Textens korta namn i hänvisningarna (Läs avsnitt 2.1 i <kortnamn>): resursens kortnamn, annars titeln utan (PDF)."""
    r = p['referenser']['resurser'][0]
    return r.get('kortnamn') or re.sub(r'\s*\(PDF\)\s*$', '', r['titel'])


def fran_posten(nr, p):
    """Delarna för en inlämningsuppgift vars delfrågor själva har alternativ och läshänvisning (FORMULAR: fran_posten)."""
    spec, kort = FORMULAR[nr][p['id']], p['id'][-3:]
    href, _ = textkalla(p)
    delar = []
    for d in p['uppgift']['delfragor']:
        pekare = lank(href, d['ledtrad'], slut=f' i {kortnamn(p)}.')
        fraga = f'{d["id"]}) {d["text"]}'
        if d.get('alternativ'):
            f = val(f'{kort}{d["id"]}', fraga, [(str(i), a) for i, a in enumerate(d['alternativ'], 1)], d['id'], pekare)
        else:
            tol = (d.get('tolerans') or {}).get('abs')
            f = tal(f'{kort}{d["id"]}', fraga, d.get('enhet', ''), d['id'], pekare, dec=0, tolerans=0 if tol == 0 else 2,
                    heltal=spec.get('heltal', {}).get(d['id']))
        delar.append({'del': d['id'], 'falt': [f]})
    return delar


def delar_for(nr, ovning, p=None):
    spec = FORMULAR[nr][ovning]
    return fran_posten(nr, p or post(ovning)) if spec.get('fran_posten') else spec['delar']


def uppgiftens_falt(nr, ovning, p=None):
    """Alla fält i en uppgift, i sidans ordning."""
    ut = []
    for d in delar_for(nr, ovning, p):
        ut += d.get('falt', [])
        for pl in d.get('platser', []):
            ut += pl['falt']
    return ut


def alla_falt(nr):
    return {f['id']: f for o in FORMULAR.get(nr, {}) for f in uppgiftens_falt(nr, o)}


def rattade_falt(nr):
    """Fälten som rättas (tal och val), med typ, decimaler, tolerans och alternativens id. facit.py använder dem."""
    return {i: f for i, f in alla_falt(nr).items() if f['typ'] in ('tal', 'val')}


# ------------------------------------------------------------------ quizen (vecka-XX/aktuell/Quiz.html)
# Beslut 12 oktober 2026 (Nils): texterna läses hemma och alla frågor besvaras senast torsdag. Varje text är en post i
# innehållsdatabasen: uppgift.fraga är läsanvisningen, delfrågorna är frågorna ({id, typ: flerval, text, alternativ (4–5),
# ledtrad: var i texten svaret står}), referenser.resurser[0] är PDF:en ({url, titel, kortnamn}) och
# referenser.rattigheter är källan. Vilka texter och i vilken ordning: innehall/placeringar/quiz.json.
# Alternativen visas i postens ordning med bokstäverna A–E, och bokstaven är alternativets id. Lärarens facit i bokstäver
# och nyckeln stämmer därför ett till ett; flyttas ett alternativ i posten måste facit ändras (regel 55).
# heltal: frågor utan alternativ (ett heltal i intervallet) per fält-id. Ett fält som inte längre är ett tal stoppar bygget.
QUIZ = {42: {'sista': '2026-10-15', 'heltal': {}}}
QUIZ_SIDA = 'Quiz.html'
BOKSTAVER = 'ABCDE'
# Facit hör inte hemma i posten: delfrågornas ratt, svar och forklaring används inte i quizen.
FACITFALT = ('ratt', 'svar', 'forklaring')


def quiz_poster(nr, placeringar=None):
    """Texterna på veckans quizsida i ordning: [(placering, post)] ur innehall/placeringar/quiz.json.
    placeringar: en annan lista (testerna använder egna poster)."""
    if placeringar is None:
        fil = SJO / 'innehall' / 'placeringar' / 'quiz.json'
        alla = json.loads(fil.read_text(encoding='utf-8'))['placeringar'] if fil.exists() else []
        plats = f'vecka-{nr}/aktuell/{QUIZ_SIDA}'
        return [(pl, post(pl['ovning'])) for pl in sorted((x for x in alla if x['plats'] == plats), key=lambda x: x['ordning'])]
    return list(placeringar)


def dokument_falt(nr, p):
    """Quizens fält för en text: ett val per delfråga med bokstäverna A–E som id (postens ordning), eller ett
    heltal när delfrågan saknar alternativ (QUIZ[nr]['heltal']). Stoppar om posten inte följer formatet."""
    heltal = QUIZ.get(nr, {}).get('heltal', {})
    kort, namn = p['id'][-3:], kortnamn(p)
    href, _ = textkalla(p)
    falt = []
    for d in p['uppgift'].get('delfragor', []):
        i = f'{kort}{d["id"]}'
        if any(k in d for k in FACITFALT):
            raise SystemExit(f'{p["id"]} {d["id"]}: {", ".join(k for k in FACITFALT if k in d)} står i posten. Facit hör inte hemma i '
                             'repot; ta bort fältet och lägg svaret i klartextfilen till facit.py.')
        if not d.get('ledtrad'):
            raise SystemExit(f'{p["id"]} {d["id"]}: ledtrad saknas (var i texten svaret står, till exempel ”avsnitt 2.1”)')
        pekare = lank(href, d['ledtrad'], slut=f' i {namn}.')
        fraga = f'{d["id"]}) {d["text"]}'
        if d.get('alternativ'):
            if not 4 <= len(d['alternativ']) <= len(BOKSTAVER) or len(set(d['alternativ'])) != len(d['alternativ']):
                raise SystemExit(f'{p["id"]} {d["id"]}: en fråga ska ha 4–5 olika alternativ (har {len(d["alternativ"])})')
            if i in heltal:
                raise SystemExit(f'sjalvrattning.py QUIZ[{nr}]: {i} har alternativ och är inget heltal. Ta bort raden i heltal.')
            f = val(i, fraga, list(zip(BOKSTAVER, d['alternativ'])), d['id'], pekare)
            f['bokstaver'] = True
        else:
            if i not in heltal:
                raise SystemExit(f'{p["id"]} {d["id"]}: frågan saknar alternativ. Ge den alternativ, eller ett heltalsintervall i '
                                 f'QUIZ[{nr}]["heltal"] i sjalvrattning.py.')
            f = tal(i, fraga, d.get('enhet', ''), d['id'], pekare, dec=0, tolerans=0, heltal=heltal[i])
        falt.append(f)
    if not falt:
        raise SystemExit(f'{p["id"]}: posten har inga delfrågor')
    return falt


def quiz_falt(nr, placeringar=None):
    """Alla fält som rättas på quizsidan: {fält-id: fält}. facit.py använder dem."""
    poster = quiz_poster(nr, placeringar)
    kanda = {f['id']: f for _, p in poster for f in dokument_falt(nr, p)}
    prefix = {p['id'][-3:] for _, p in poster}
    for i in QUIZ.get(nr, {}).get('heltal', {}):
        if i[:3] in prefix and i not in kanda:
            raise SystemExit(f'sjalvrattning.py QUIZ[{nr}]: heltal {i} finns inte i texten. Ta bort raden.')
    return kanda


def quiz_plan(nr, placeringar=None):
    """Sidans plan när den byggs, i samma form som sparadPlan i gemensamt/sjalvrattning.mjs:
    {vecka, titel, uppgifter: [{nr, titel, ovning, lm, falt: [fält-id]}]}. quizStatus(vecka, plan) räknar med den
    innan eleven har öppnat sidan."""
    return {'vecka': str(nr), 'titel': f'Quiz vecka {nr}', 'uppgifter': [
        {'nr': str(n), 'titel': p['titel'], 'ovning': p['id'], 'lm': p['larande'].get('mal', []),
         'falt': [f['id'] for f in dokument_falt(nr, p)]} for n, (_, p) in enumerate(quiz_poster(nr, placeringar), 1)]}


def inlamning_plan(nr):
    """Inlämningens plan när sidan byggs, i samma form som sparadPlan i gemensamt/sjalvrattning.mjs:
    {vecka, titel, delar: ['del-1', …], uppgifter: [{nr, titel, ovning, lm, falt: [fält-id som rättas]}]}. veckoStatus(vecka, plan) räknar med den
    innan eleven har öppnat sidan. Uppgifternas nummer och ordning kommer ur placeringarna (innehall/placeringar/inlamning.json)."""
    alla = json.loads((SJO / 'innehall' / 'placeringar' / 'inlamning.json').read_text(encoding='utf-8'))['placeringar']
    pls = sorted((x for x in alla if x['plats'] == f'vecka-{nr}/aktuell/Inlamning.html' and x['ovning'] in FORMULAR.get(nr, {})),
                 key=lambda x: x['ordning'])
    return {'vecka': str(nr), 'titel': '', 'delar': [f'del-{n}' for n in delsidor(nr)], 'uppgifter': [
        {'nr': re.sub(r'\D', '', pl['nummer']), 'titel': post(pl['ovning'])['titel'], 'ovning': pl['ovning'],
         'lm': post(pl['ovning'])['larande'].get('mal', []),
         'falt': [f['id'] for f in uppgiftens_falt(nr, pl['ovning']) if f['typ'] in ('tal', 'val')]} for pl in pls]}


def falt_per_lm(nr, sida='inlamning'):
    """Antal fält som rättas per kursplanspunkt på veckans inlämning (sida='inlamning') eller quiz
    (sida='quiz'): {'LM-2': 12, …} i punkternas ordning. Varje fält räknas under alla sin posts punkter, som
    veckoStatus och quizStatus i gemensamt/sjalvrattning.mjs. Tom när veckan inte har sidan."""
    if sida == 'inlamning':
        poster = [(post(o), [f for f in uppgiftens_falt(nr, o) if f['typ'] in ('tal', 'val')]) for o in FORMULAR.get(nr, {})]
    elif sida == 'quiz':
        poster = [(p, dokument_falt(nr, p)) for _, p in quiz_poster(nr)] if nr in QUIZ else []
    else:
        raise ValueError(f'okänd sida {sida} (inlamning eller quiz)')
    per = {}
    for p, falt in poster:
        for m in p['larande'].get('mal', []):
            per[m] = per.get(m, 0) + len(falt)
    return dict(sorted(((m, n) for m, n in per.items() if n), key=lambda kv: int(kv[0].split('-')[1])))


# ------------------------------------------------------------------ rendering
_AVSNITT = {}
_DELSIDOR = {}


def delsidor(nr):
    """Veckans delsidor: {delnummer: (adress från vecka-NN/aktuell/, rubrik utan ”Del N: ”, fil)}. Läses ur sidornas
    rubrikrad (”Vecka 43 · Del 4 av 4”, innehall/export/delsidor_veckor.py), så att delar som ligger i en annan veckas
    mapp kommer med (vecka 43 del 4 = vecka-45/aktuell/Del_1.html, vecka 44 del 4–5 = vecka-45/aktuell/Del_2–3.html)."""
    if nr not in _DELSIDOR:
        ut = {}
        for f in sorted(SJO.glob('vecka-*/aktuell/Del_*.html')):
            m = re.search(r'<p class="course-kicker">Vecka (\d+) · Del (\d+) av \d+</p><h1>(.*?)</h1>', f.read_text(encoding='utf-8'))
            if not m or int(m.group(1)) != nr:
                continue
            mapp = int(f.parent.parent.name.split('-')[1])
            href = f.name if mapp == nr else f'../../vecka-{mapp}/aktuell/{f.name}'
            ut[int(m.group(2))] = (href, re.sub(r'^Del \d+: ', '', html.unescape(m.group(3))), f)
        _DELSIDOR[nr] = dict(sorted(ut.items()))
    return _DELSIDOR[nr]


def dellank(nr, mappvecka, fil_del):
    """Delen i vecka nr som ligger i vecka-<mappvecka>/aktuell/Del_<fil_del>.html: (delnummer, adress) eller None."""
    for n, (href, _, f) in delsidor(nr).items():
        if f.parent.parent.name == f'vecka-{mappvecka}' and f.name == f'Del_{fil_del}.html':
            return n, href
    return None


def avsnittsnummer(nr, del_, titel):
    """Avsnittets nummer på delsidan (id="teori-N"), räknat ur delens sida (delsidor)."""
    nyckel = (nr, del_)
    if nyckel not in _AVSNITT:
        if del_ not in delsidor(nr):
            raise SystemExit(f'sjalvrattning.py: vecka {nr} har ingen del {del_} (delsidornas rubrikrad).')
        s = delsidor(nr)[del_][2].read_text(encoding='utf-8')
        _AVSNITT[nyckel] = re.findall(r'<details class="del-kort del-teori" id="teori-(\d+)"[^>]*><summary><span class="kort-nr">\d+</span>'
                                      r'<span class="kort-text"><span class="kort-titel">(.*?)</span>', s)
    tr = [int(n) for n, t in _AVSNITT[nyckel] if html.unescape(t) == titel]
    if len(tr) != 1:
        raise SystemExit(f'sjalvrattning.py: vecka {nr}, del {del_} har {"inget" if not tr else "flera"} avsnitt ”{titel}”. '
                         'Rätta hänvisningen i verktyg/inlamning/sjalvrattning.py.')
    return tr[0]


def pekare_html(nr, p):
    if 'del' in p:
        n = avsnittsnummer(nr, p['del'], p['titel'])
        href = delsidor(nr)[p['del']][0]
        s = f'Läs <a href="{href}#teori-{n}">del {p["del"]}, avsnitt {n}: {html.escape(p["titel"])}</a>.'
        return s + (f' {mark(p["efter"])}' if p['efter'] else '')
    delar = [mark(p['fore'])] if p['fore'] else []
    delar.append(f'Läs <a href="{html.escape(p["href"])}">{html.escape(p["titel"])}</a>{html.escape(p["slut"])}')
    if p['efter']:
        delar.append(mark(p['efter']))
    return ' '.join(delar)


def _besked(nr, f):
    # Beskedet hör till fältet (aria-describedby); bara sammanfattningen efter Rätta läses upp direkt (aria-live).
    return (f'<p class="ri-besked" id="ri-{f["id"]}-besked"></p>'
            f'<p class="ri-pekare" hidden>{pekare_html(nr, f["pekare"])}</p>')


def falt_html(nr, f):
    i, k = f['id'], html.escape(f['kort'], quote=True)
    if f['typ'] == 'tal':
        heltal = f' data-heltal="{f["heltal"][0]}-{f["heltal"][1]}"' if f.get('heltal') else ''
        mode = 'numeric' if f.get('heltal') else 'decimal'
        return (f'<div class="ri-falt" data-falt="{i}" data-typ="tal" data-enhet="{f["enhet"]}" data-kort="{k}"{heltal}>'
                f'<label for="ri-{i}">{mark(f["etikett"])}</label>'
                f'<input id="ri-{i}" class="ri-tal" type="text" inputmode="{mode}" autocomplete="off" spellcheck="false" aria-describedby="ri-{i}-besked">'
                f'{_besked(nr, f)}</div>')
    if f['typ'] == 'val' and f['lista']:
        alt = ''.join(f'<option value="{v}">{html.escape(t)}</option>' for v, t in f['alternativ'])
        return (f'<div class="ri-falt" data-falt="{i}" data-typ="val" data-kort="{k}"><label for="ri-{i}">{mark(f["fraga"])}</label>'
                f'<select id="ri-{i}" aria-describedby="ri-{i}-besked"><option value="">Välj …</option>{alt}</select>{_besked(nr, f)}</div>')
    if f['typ'] == 'val' and f.get('bokstaver'):
        # Quizen: postens ordning, bokstaven synlig och lika med id:t (lärarens facit är bokstäver).
        alt = ''.join(f'<label class="ri-val"><input type="radio" name="ri-{i}" value="{v}"><span class="ri-bokstav">{v}</span>'
                      f'<span>{mark(t)}</span></label>' for v, t in f['alternativ'])
        return (f'<fieldset class="ri-falt" data-falt="{i}" data-typ="val" data-kort="{k}" data-bokstaver aria-describedby="ri-{i}-besked">'
                f'<legend>{mark(f["fraga"])}</legend>{alt}{_besked(nr, f)}</fieldset>')
    if f['typ'] == 'val':
        alt = ''.join(f'<label class="ri-val"><input type="radio" name="ri-{i}" value="{v}"><span>{mark(t)}</span></label>'
                      for v, t in visningsordning(i, f['alternativ']))
        return (f'<fieldset class="ri-falt" data-falt="{i}" data-typ="val" data-kort="{k}" aria-describedby="ri-{i}-besked">'
                f'<legend>{mark(f["fraga"])}</legend>{alt}{_besked(nr, f)}</fieldset>')
    hjalp = f'<p class="ri-hjalp" id="ri-{i}-hjalp">{mark(f["hjalp"])}</p>' if f['hjalp'] else ''
    beskriv = f' aria-describedby="ri-{i}-hjalp"' if f['hjalp'] else ''
    ruta = (f'<input id="ri-{i}" type="text" autocomplete="off"{beskriv}>' if f['enrad']
            else f'<textarea id="ri-{i}" rows="{f["rad"]}"{beskriv}></textarea>')
    return (f'<div class="ri-falt ri-textfalt" data-falt="{i}" data-typ="{f["typ"]}" data-kort="{k}">'
            f'<label for="ri-{i}">{mark(f["etikett"])}</label>{hjalp}{ruta}</div>')


def lista_b64(nr, lista):
    """Checklistan som base64-kodad JSON. Base64 är inget skydd: det håller bara listan dold tills eleven har låst sin
    första version (sidan avkodar den då). Den som läser källkoden kan avkoda den."""
    data = [{'text': t, 'las': pekare_html(nr, p)} for t, p in lista]
    return base64.b64encode(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode('utf-8')).decode('ascii')


def lasknapp(href, titel):
    """Länken till quizens text och knappen Jag har läst texten (nyckeln text i sj-last:vecka-NN)."""
    return (f'<p class="ri-textlas"><a href="{html.escape(href)}" data-ri-text>{html.escape(titel)}</a> '
            '<button type="button" class="ri-textknapp" data-ri-last="text">Jag har läst texten</button> '
            '<span class="ri-lasstatus" data-ri-status="text"></span></p>')


def utan_fragelista(nr, p):
    """Quizens frågor står i svarsfälten; listan a–h i uppgiften skulle bara upprepa dem."""
    return bool(FORMULAR.get(nr, {}).get(p['id'], {}).get('fran_posten'))


def svarsfalt(nr, pl, p):
    """Svarsfälten för en uppgift (en sektion på inlämningssidan). Tom sträng om veckan inte rättar sig själv."""
    form = FORMULAR.get(nr, {}).get(p['id'])
    if not form or nr not in SJALVRATTANDE:
        return ''
    delar = delar_for(nr, p['id'], p)
    delfragor = [d['id'] for d in p['uppgift'].get('delfragor', [])]
    if [d['del'] for d in delar] != delfragor:
        raise SystemExit(f'sjalvrattning.py: svarsfälten för {p["id"]} ({", ".join(d["del"] for d in delar)}) följer inte '
                         f'postens delfrågor ({", ".join(delfragor)}). Ändra FORMULAR och kör facit.py igen.')
    uppg = re.sub(r'\D', '', pl['nummer'])
    rattas = any(f['typ'] in ('tal', 'val') for d in delar for f in d.get('falt', []) + [x for pla in d.get('platser', []) for x in pla['falt']])
    ut = []
    if form.get('fran_posten'):
        href, titel = textkalla(p)
        ut.append(lasknapp(href, f'Öppna {titel}'))
        if p['referenser'].get('rattigheter'):
            ut.append(f'<p class="ri-kalla">Källa: {mark(p["referenser"]["rattigheter"])}</p>')
    for d in delar:
        if d.get('rubrik'):
            ut.append(f'<h4>{mark(d["rubrik"])}</h4>')
        if d.get('intro'):
            ut.append(f'<p class="ri-intro">{mark(d["intro"])}</p>')
        for pla in d.get('platser', []):
            ut.append(f'<fieldset class="ri-plats"><legend>{mark(pla["namn"])}</legend><div class="ri-plats-rad">'
                      + ''.join(falt_html(nr, f) for f in pla['falt']) + '</div></fieldset>')
        ut += [falt_html(nr, f) for f in d.get('falt', [])]
        if d['del'] == form.get('las_efter', 'c') and form.get('checklista'):
            # Låsningen gäller de skrivna delarna (las_text, a–c i vecka 42): efter den sista kommer knappen och checklistan.
            # checklista_efter: frågor som ska vara rätta eller låsta innan listan visas (listan får inte ge deras svar, regel 52).
            efter = form.get('checklista_efter') or []
            efter = ' '.join([efter] if isinstance(efter, str) else efter)
            las_text = form.get('las_text', 'a–c')
            ut.append(f'<div class="ri-las" data-lista="{lista_b64(nr, form["checklista"])}" data-lista-efter="{efter}" data-las-text="{html.escape(las_text, quote=True)}">'
                      f'<p class="ri-las-intro">När du har skrivit {html.escape(las_text)} trycker du på knappen. Då sparas din första version, och läraren ser den. '
                      'Sedan får du en checklista och kan skriva till mer.</p>'
                      f'<p class="ri-las-intro ri-las-hjalp">{pekare_html(nr, form["las_pekare"])}</p>'
                      '<p class="ri-knappar"><button type="button" class="sj-btn ri-las-knapp">Jag är klar med texten</button></p>'
                      '<p class="ri-las-status" aria-live="polite"></p><div class="ri-lista" hidden></div></div>')
    lm = ' '.join(p['larande'].get('mal', []))
    # En uppgift utan fält som rättas (felsökningsrapporten) har ingen Rätta-knapp; läraren läser texten.
    ratta = f'<button type="button" class="sj-btn ri-ratta">Rätta inlämning {uppg}</button>' if rattas else ''
    return (f'<div class="ri-svar" data-ovning="{p["id"]}" data-nr="{uppg}" data-titel="{html.escape(p["titel"], quote=True)}" data-lm="{lm}">'
            f'<h3>Dina svar</h3>{"".join(ut)}'
            f'<div class="ri-knappar">{ratta}'
            '<p class="ri-summa" aria-live="polite"></p></div></div>')


def epost_ruta(epost, vn, pa_sidan):
    """Rutan Så lämnar du in för en självrättande vecka (inlämningssidan; veckosidan länkar dit)."""
    var = 'i rutorna under varje uppgift' if pa_sidan else 'i rutorna på <a href="Inlamning.html">inlämningssidan</a>'
    knapp = '<p><a class="sj-btn" href="#lamna-in">Till Lämna in</a></p>' if pa_sidan else ''
    return ('<div class="sj-panel soft handin-mail"><h3>Så lämnar du in</h3>'
            '<p><strong>Skriv dina svar. Tryck Rätta. Du får se vad som är rätt och var du kan läsa om något skiljer sig. '
            'Läraren ser ditt första svar och hur många försök du gjorde.</strong></p>'
            f'<ol><li>Skriv dina svar {var}.</li>'
            f'<li>Tryck <strong>Rätta</strong>. Du har {MAX_FORSOK} försök på varje fråga. Efter {MAX_FORSOK} fel låses frågan. '
            f'Då läser du om veckan och får {MAX_FORSOK} nya försök.</li>'
            f'<li>Tryck <strong>Lämna in</strong> längst ner{"" if pa_sidan else " på inlämningssidan"} och skriv ditt namn. Ladda ner PDF:en.</li>'
            f'<li>Lämna in PDF-filen i Google Classroom under Vecka {vn}.{" " + BILAGOR[vn] if vn in BILAGOR else ""}</li></ol>'
            '<p>Ett tal räknas som rätt om det skiljer högst 2 % från rätt värde. Komma eller punkt går bra. '
            'Uträkningar kan du lämna in som foto eller PDF i Classroom, men det behövs bara om läraren ber om det.</p>'
            f'{knapp}</div>')


def lasdelar(nr):
    """Det eleven läser om när en fråga är låst: veckans delar, också de som ligger i en annan veckas mapp (delsidor),
    och en text ur posten (fran_posten). [(nyckel, titel, adress)]."""
    ut = [(f'del-{n}', f'Del {n}: {titel}', href) for n, (href, titel, _) in delsidor(nr).items()]
    for o, spec in FORMULAR[nr].items():
        if spec.get('fran_posten'):
            href, titel = textkalla(post(o))
            ut.append(('text', titel, href))
    return ut


def lasom_ruta(nr, vn):
    """Rutan överst i formuläret som visas när en fråga är låst (gemensamt/sjalvrattning-sida.mjs)."""
    delar = lasdelar(nr)
    namn = [f'del {k.split("-")[1]}' if k.startswith('del-') else 'texten' for k, t, _ in delar]
    upprakning = ', '.join(namn[:-1]) + ' och ' + namn[-1]
    rader = ''.join(f'<li><a href="{h}"{" data-ri-text" if k == "text" else ""}>{html.escape(t)}</a> '
                    f'<span class="ri-lasstatus" data-ri-status="{k}"></span>'
                    + (' <button type="button" class="ri-textknapp" data-ri-last="text">Jag har läst texten</button>' if k == 'text' else '')
                    + '</li>' for k, t, h in delar)
    return (f'<section class="sj-panel warn ri-lasom" id="ri-lasom" data-ri-delar="{" ".join(k for k, _, _ in delar)}" hidden>'
            f'<h2>Låsta frågor</h2><p>Läs om vecka {vn}: {upprakning}. Sedan får du tre nya försök på de låsta frågorna.</p>'
            f'<ul class="ri-lasom-lista">{rader}</ul>'
            '<p class="ri-lasom-hjalp">Längst ner på varje del finns en knapp där du bekräftar att du har läst den.</p>'
            '<p class="ri-lasom-klart" role="status"></p></section>\n')


def lm_text(mal):
    """Kursplanens punkter med enkla ord (verktyg/veckosidor/kursplan.py ENKEL), annars teori.json."""
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location('kursplan_enkel', SJO / 'verktyg' / 'veckosidor' / 'kursplan.py')
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        enkel = mod.ENKEL
    except Exception:  # noqa: BLE001  reserv: den formella texten
        enkel = {k: v['text'] for k, v in json.loads((SJO / 'innehall' / 'teori.json').read_text(encoding='utf-8'))['mal'].items()}
    return {m: enkel[m] for m in mal if m in enkel}


def lamna_in(nr, vn, titel, epost):
    """Sista delen av sidan: namn, Lämna in och resultatet med PDF-nedladdningen (gemensamt/sjalvrattning-sida.mjs)."""
    mal = sorted({m for o in FORMULAR[nr] for m in post(o)['larande'].get('mal', [])}, key=lambda m: int(m.split('-')[1]))
    lm = html.escape(json.dumps(lm_text(mal), ensure_ascii=False), quote=True)
    return (f'<section class="sj-panel ri-lamna" id="lamna-in" data-ri-vecka="{vn}" data-ri-lagring="sj-v{nr}-inlamning" '
            f'data-ri-epost="{epost}" data-ri-titel="{html.escape(titel, quote=True)}" data-ri-max="{MAX_FORSOK}" data-ri-lm="{lm}">'
            '<h2>Lämna in</h2><p>När du är klar: skriv ditt namn och tryck Lämna in. Sidan rättar alla svar och visar ditt resultat. '
            f'Sedan laddar du ner PDF:en och lämnar in den i Google Classroom under Vecka {vn}.</p>'
            '<noscript><p><strong>Sidan behöver JavaScript för att rätta och lämna in.</strong> '
            f'Skriv dina svar i ett dokument och lämna in det i Google Classroom under Vecka {vn}.</p></noscript>'
            '<p class="ri-lagring" role="status" hidden></p>'
            '<p><label for="ri-namn">Förnamn och efternamn</label><input id="ri-namn" type="text" autocomplete="name"></p>'
            '<p class="ri-namnfel" role="alert"></p>'
            '<p><button type="button" class="sj-btn primary large" id="ri-lamna">Lämna in</button></p>'
            '<div class="ri-resultat" id="ri-resultat" tabindex="-1" hidden></div></section>\n')


# Det läraren läser själv, per vecka (punkten i rutan Bedömning).
LARAREN_LASER = {42: 'Läraren läser din riskbedömning i inlämning 1 och dina egna förklaringar.',
                 43: 'Läraren läser din ritning, din beskrivning och felsökningsraden i inlämning 3 och felsökningsrapporten i inlämning 4.',
                 44: 'Läraren läser ditt labbprotokoll från Isolationslabbet och din slutsats i inlämning 4.'}
# Det som lämnas in i Classroom tillsammans med sidans PDF.
BILAGOR = {43: 'Lägg till ett foto av ritningen i inlämning 3.', 44: 'Lägg till labbprotokollet från Isolationslabbet som PDF (inlämning 3 a).'}


def bedomning(nr):
    return ('<h2>Bedömning</h2><ul><li>Sidan rättar svaren i rutorna. Ett tal räknas som rätt om det skiljer högst 2 % från rätt värde.</li>'
            f'<li>Du har {MAX_FORSOK} försök på varje fråga. En låst fråga får {MAX_FORSOK} nya försök när du har läst om veckan.</li>'
            '<li>Läraren ser ditt första svar, ditt sista svar och hur många försök du gjorde.</li>'
            f'<li>{LARAREN_LASER.get(nr, "Läraren läser dina skrivna svar och dina egna förklaringar.")}</li>'
            '<li>Säkerhetsresonemang skiljer på observation och antagande och hittar inte på uppgifter som saknas.</li></ul>\n')


BEDOMNING = bedomning(42)  # vecka 42 (bakåtkompatibelt)


def skript(nr):
    """Sidans modul. Nyckelns version är filens hash, så att en ny nyckel aldrig fastnar i cachen (regel 13). Går nyckeln
    inte att läsa startar sidan ändå (starta(null)): eleven kan lämna in och läraren rättar."""
    nyckel = SJO / f'vecka-{nr}' / 'aktuell' / 'inlamning-nyckel.mjs'
    v = hashlib.sha256(nyckel.read_bytes()).hexdigest()[:10] if nyckel.exists() else 'saknas'
    return (f'<script type="module">import {{starta}} from \'/sjoskolan/gemensamt/sjalvrattning-sida.mjs?v={VERSION}\';'
            f'import(\'./inlamning-nyckel.mjs?v={v}\').then((m) => starta(m.NYCKEL), () => starta(null));</script>\n')


def lasbekraftelse_html(nr, del_, inlamning='Inlamning.html'):
    """Rutan sist på en delsida: Har du läst hela del N? (gemensamt/lasbekraftelse.mjs). Bara veckor i SJALVRATTANDE.
    nr och del_ är veckan och delen eleven läser, också när sidan ligger i en annan veckas mapp (vecka-45/aktuell/Del_1.html
    är vecka 43 del 4): bekräftelsen skrivs i sj-last:vecka-43 som del-4. inlamning: länken tillbaka till veckans inlämning."""
    if nr not in SJALVRATTANDE:
        return ''
    return (f'<link rel="stylesheet" href="/sjoskolan/gemensamt/sjalvrattning.css?v={VERSION}">'
            f'<section class="sj-panel ri-lasdel" id="las-del-{del_}" data-ri-las-vecka="{nr}" data-ri-las-del="del-{del_}" '
            f'data-ri-las-inlamning="{html.escape(inlamning, quote=True)}">'
            f'<h2>Har du läst hela del {del_}?</h2>'
            '<p class="ri-lasdel-hjalp">Knappen öppnas när du har läst hela sidan (minst 3 minuter).</p>'
            f'<p><button type="button" class="sj-btn ri-lasdel-knapp" disabled>Jag har läst del {del_}</button></p>'
            '<p class="ri-lasdel-status" role="status"></p></section>'
            f'<script type="module">import {{startaLasning}} from \'/sjoskolan/gemensamt/lasbekraftelse.mjs?v={VERSION}\';startaLasning();</script>')
