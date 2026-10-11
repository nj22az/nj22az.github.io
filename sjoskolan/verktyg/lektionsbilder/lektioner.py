"""Innehållet i lektionsbilderna (se bygg.py för mallen).

Regler för texten:
- En bild, en tanke: en nyckelmening (blå) och högst tre korta rader.
- Teoribilderna följer delsidans avsnitt i samma ordning och med samma rubriker, så att ”Del 1 · avsnitt 3” på bilden
  är samma avsnitt som inlämningens hänvisning ”Läs del 1, avsnitt 3”.
- Inga övningstexter och inga svar på övningar eller inlämningar på bilderna. Övningarna görs på delsidan.
  Start- och avslutsfrågan och övningarnas titlar hämtas ur posterna.
- Inga egna räkneexempel med inlämningens tal (230 V mot däck, kroppsresistans 1 000 + 10 · D Ω).
"""

DELSIDA = 'nj22az.github.io/sjoskolan/vecka-{v}/aktuell/Del_{d}.html'

# Läxorna efter varje lektion: (id, text, adress relativt veckosidan, knapptext). Samma lista står på bilden ”Det här gör
# du nu” och i dagens ruta på veckosidan (verktyg/veckosidor/dagsvy.py), så att presentationen och sidan säger samma sak.
# id styr hur sidan visar läget: del-N (”Jag har läst del N” på delsidan), ovn-N (övning N.6–N.10 avbockade),
# inl (inlämningen påbörjad); övriga har en Klart-ruta.
HEMMA = {
    'v42_01': [
        ('del-1', 'Läs del 1. Tryck på ”Jag har läst del 1” längst ned på sidan.', 'Del_1.html', 'Öppna del 1'),
        ('ovn-1', 'Gör övning 1.6–1.10 på delsidan. Ledtrådar och facit finns där.', 'Del_1.html#v42_01-q6', 'Öppna övning 1.6'),
        ('film', 'Titta på filmen Fem steg (repetition från vecka 40).', '../../filmer/#fem-steg', 'Öppna filmen'),
    ],
    'v42_02': [
        ('del-2', 'Läs del 2. Tryck på ”Jag har läst del 2” längst ned på sidan.', 'Del_2.html', 'Öppna del 2'),
        ('ovn-2', 'Gör övning 2.6–2.10 på delsidan. Ledtrådar och facit finns där.', 'Del_2.html#v42_02-q6', 'Öppna övning 2.6'),
        ('inl', 'Börja på inlämningen: uppgift 1 och 2.', 'Inlamning.html', 'Öppna inlämningen'),
    ],
    'v42_03': [
        ('del-3', 'Läs del 3. Tryck på ”Jag har läst del 3” längst ned på sidan.', 'Del_3.html', 'Öppna del 3'),
        ('ovn-3', 'Gör övning 3.6–3.10 på delsidan. Ledtrådar och facit finns där.', 'Del_3.html#v42_03-q6', 'Öppna övning 3.6'),
        ('labb', 'Gör labben Välj CAT-klass i Multimeterlabbet.', '../../multimetersimulator/?ovning=category', 'Öppna labben'),
    ],
}
# Det som gäller hela veckan (står på bilden som not och på veckosidan under ”Hela veckan”).
VECKAN = {42: 'Läs texterna och gör quizet senast torsdag 15 oktober. Inlämningen senast fredag 16 oktober. Allt finns på veckosidan.'}


def hemma(lek_id):
    return [h[1] for h in HEMMA[lek_id]]

V42_01 = {
    'id': 'v42_01',
    'fil': 'vecka-42/aktuell/v42_01_Elektriska_risker_elev.pptx',
    'omslag': 'omslag_v42_01.jpg',
    'figurmapp': 'vecka-42/aktuell/figurer',
    'kicker': 'Vecka 42 · Måndag 12 oktober · 09.00–11.00',
    'titel': 'Elektriska risker',
    'underrubrik': 'Hur el skadar och hur du beskriver risken',
    'etikett': 'Vecka 42 · Måndag · Elektriska risker',
    'del': 1, 'delar': 3,
    'delsida_url': DELSIDA.format(v=42, d=1),
    'omrade': 'sakerhet',
    'mal': ['LM-2'],
    'efter': [
        'förklara tre sätt som el skadar: strömgenomgång, ljusbåge och följdolycka.',
        'beskriva en risk med fara, exponering och konsekvens.',
        'säga vad du gör vid en elolycka och varför ett tillbud ska rapporteras.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ja eller nej i chatten, och ett ord om varför.'}),
        ('upplagg', [
            ('09.00', 'Start och startfråga'),
            ('09.05', 'Pass 1: Hur el skadar (avsnitt 1–4) och ett exempel'),
            ('09.30', 'Övning 1.2, 1.3 och 1.4 tillsammans'),
            ('09.50', 'Paus'),
            ('10.00', 'Pass 2: Marin miljö, elolycka och tillbud (avsnitt 5–7)'),
            ('10.25', 'Övning 1.1 och 1.5 tillsammans'),
            ('10.40', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Fara, händelse och skada',
            'nyckel': 'En risk beskriver du med tre ord.',
            'punkter': [
                '**Fara:** det som kan orsaka skada. Till exempel en spänningsförande del som går att nå.',
                '**Exponering:** hur en person kan utsättas för faran. Vem, var och när?',
                '**Konsekvens:** den skada som kan följa. Till exempel en stöt, en brännskada eller ett fall.',
                'Riskbedömningen kopplar arbetsmomentet till både möjlig händelse och följd.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Strömmens väg genom kroppen',
            'nyckel': 'Spänningen ensam bestämmer inte skadan.',
            'punkter': [
                'Skadans allvar beror på strömmen, hur länge den går och vilken väg den tar.',
                'Fukt, kontaktyta och hudens tillstånd påverkar kontakten.',
                'En väg genom bröstkorgen kan påverka hjärtat.',
                'Ett generellt kroppsmotstånd kan inte ge en säker gräns.',
            ],
            'figur': 'v42_01-b06-1.png',
            'alt': 'Två strömvägar genom kroppen: hand till hand och hand till fot. Båda passerar bröstkorgen nära hjärtat.',
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Beröringsspänning',
            'nyckel': 'U_{beröring} = |V_{A} − V_{B}|',
            'punkter': [
                'Spänningen mellan två punkter som en person kan röra samtidigt.',
                'Vid ett isolationsfel kan utsatt metall bli spänningsförande.',
                'I = U/R är en förenklad beräkningsmodell.',
                'Kroppens elektriska egenskaper varierar med situationen.',
            ],
            'figur_under': True, 'texthojd': 2.45, 'size': 19, 'mellan': 4,
            'figur': 'v42_01-b07-1.png',
            'alt': 'Pumpmotor på gummidämpare på stålskrovet. Isolationsfel mellan fasen och höljet, skyddsledaren (PE) är bruten. '
                   'Handen rör höljet (punkt A) och fötterna står på däcket (punkt B).',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Ljusbågens konsekvenser',
            'nyckel': 'En ljusbåge kan skada utan att ström går genom kroppen.',
            'punkter': [
                'Ljusbågen ger värme, tryck, starkt ljus och splitter av smält metall.',
                'Hur mycket felenergi som finns och hur länge felet varar avgör följden.',
                'Ett tappat verktyg eller en felaktig mätanslutning kan starta en ljusbåge.',
                'Riskbedömningen behöver omfatta hela arbetsmomentet.',
            ],
            'figur': 'v42_01-b08-1.png',
            'alt': 'Ljusbåge mellan skenorna L1 och L2 i ett öppet ställverksfack: värme och starkt ljus, tryckvåg och splitter av smält metall.',
        }),
        ('teori', {
            'etikett': 'Del 1 · exempel 1', 'rubrik': 'Exempel: en riskförklaring',
            'scenario': 'En vinkelslip har en kabel som legat klämd under en tung låda. Ingen använder maskinen just nu.',
            'nyckel': 'Fara, möjlig exponering och konsekvens',
            'punkter': [
                '1. **Observation:** kabeln är tillplattad och manteln har en spricka.',
                '2. **Möjlig händelse:** någon rör en del där isolationen är trasig.',
                '3. **Möjlig följd:** strömgenomgång, eller att maskinen tappas och skadar någon.',
            ],
            'slutsats': 'Ingen vet om kabeln är spänningssatt. Den synliga skadan räcker för att stoppa användningen.',
            'size': 18, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v42_01-b09-1.png',
            'alt': 'Vinkelslip på en arbetsbänk. Kabeln har legat klämd under en tung låda och är tillplattad, med en spricka i manteln. '
                   'Maskinen används inte tills vidare.',
        }),
        ('ovningar', {
            'nummer': ['1.2', '1.3', '1.4'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('paus', {'text': 'Vi fortsätter 10.00'}),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Risker i marin miljö',
            'nyckel': 'Varje möjlig matningsväg behöver identifieras.',
            'punkter': [
                'Fukt, trånga utrymmen och ett ledande skrov och däck påverkar arbetet.',
                'Reservmatning och batterier kan ge flera energikällor.',
                'En stoppad maskin eller en släckt panel visar inte att det är säkert att röra.',
            ],
            'figur': 'v42_01-b21-1.png',
            'alt': 'En fördelning som kan matas från generator, nödgenerator med autostart, landanslutning, batteri och UPS.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'En inträffad elolycka',
            'nyckel': 'Skydda dig själv först.',
            'punkter': [
                'Bryt strömmen bara om det kan ske säkert.',
                'Larma enligt fartygets nödinstruktion. I hamn: 112. Till sjöss: radiomedicinsk rådgivning (TMAS).',
                'När platsen är säker: bedöm andningen och ge HLR vid behov.',
                'Vid högspänning: håll avstånd tills en behörig person har säkrat platsen.',
            ],
            'size': 18,
            'figur': 'v42_01-b22-1.png',
            'alt': 'Fem steg vid en elolycka ombord: skydda dig själv, bryt strömmen om det går säkert, larma enligt nödinstruktionen, '
                   'andning och HLR när platsen är säker, medicinsk rådgivning även utan synlig skada.',
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Tillbud och lärande',
            'nyckel': 'Rapportera även när ingen skadades.',
            'punkter': [
                'Ett tillbud är en händelse som kunde ha lett till skada.',
                'Skriv vad som hände och vilka skydd som brast.',
                'Skilj på observation, bakomliggande orsak och åtgärd.',
                '”Proben var skadad” är en observation. ”Ingen förkontroll ingick” kan förklara varför risken fanns kvar.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 1 · exempel 2', 'rubrik': 'Exempel: tillbud och förbättring',
            'scenario': 'Ett låsbleck för frånskiljaren är böjt och går inte att stänga. Det upptäcks innan arbetet börjar.',
            'nyckel': 'Direkt åtgärd och förebyggande kontroll',
            'punkter': [
                '1. Ta det böjda låsblecket ur bruk och märk det enligt rutinen.',
                '2. Hämta ett helt låsbleck innan frånskiljaren låses.',
                '3. Följ upp hur skadan uppstod och om låsutrustningen kontrolleras före användning.',
            ],
            'slutsats': 'Rapporten skiljer vad som observerats från antagen orsak. Åtgärden ska kunna följas upp.',
        }),
        ('ovningar', {
            'nummer': ['1.1', '1.5'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 1.6–1.10 gör du själv efter lektionen.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'El skadar på tre sätt: strömgenomgång, ljusbåge och följdolycka.',
                'Beskriv risken med fara, exponering och konsekvens. Ombord finns ofta flera energikällor.',
                'Vid en elolycka skyddar du dig själv först. Ett tillbud rapporteras även när ingen skadades.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': hemma('v42_01') + [
                'Veckans läxa: läs de fyra texterna från Transportstyrelsen.',
                'I morgon tisdag 15.00: del 2, Regler, ansvar och arbetsmetoder.',
            ],
            'not': VECKAN[42],
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 42, del 1 Elektriska risker', 'https://nj22az.github.io/sjoskolan/vecka-42/aktuell/Del_1.html'),
                ('Kursplanen för Elteknik och ellära, lärandemål 2', None),
                ('Elsäkerhetsverket: Vad kan orsaka en elolycka?',
                 'https://www.elsakerhetsverket.se/privatpersoner/om-du-drabbas-av-en-elolycka/vad-kan-orsaka-en-elolycka/'),
                ('Elsäkerhetsverket: Vad gör jag vid en elolycka?',
                 'https://www.elsakerhetsverket.se/privatpersoner/om-du-drabbas-av-en-elolycka/vad-gor-jag-vid-en-elolycka/'),
                ('Transportstyrelsen: Elinstallationer på fartyg – lagar, föreskrifter och standarder',
                 'https://www.transportstyrelsen.se/sv/sjofart/fartyg/utrustning-pa-fartyg/elinstallationer/lagar-foreskrifter-och-standarder/'),
            ],
        }),
    ],
}

V42_02 = {
    'id': 'v42_02',
    'fil': 'vecka-42/aktuell/v42_02_Regler_ansvar_och_arbetsmetoder_elev.pptx',
    'omslag': 'omslag_v42_02.jpg',
    'figurmapp': 'vecka-42/aktuell/figurer',
    'kicker': 'Vecka 42 · Tisdag 13 oktober · 15.00–17.00',
    'titel': 'Regler, ansvar och arbetsmetoder',
    'underrubrik': 'Vilka regler gäller, vem gör vad, och hur arbetet blir säkert',
    'etikett': 'Vecka 42 · Tisdag · Regler, ansvar och arbetsmetoder',
    'del': 2, 'delar': 3,
    'delsida_url': DELSIDA.format(v=42, d=2),
    'omrade': 'sakerhet',
    'mal': ['LM-3', 'LM-2', 'LM-9'],
    'efter': [
        'skilja föreskrift, standard och arbetsanvisning.',
        'säga vilka regler som gäller ett fartyg och varför.',
        'beskriva de fem säkerhetsåtgärderna och vem som ger besked.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ja eller nej i chatten, och ett ord om varför.'}),
        ('upplagg', [
            ('15.00', 'Start och startfråga'),
            ('15.05', 'Pass 1: Regler och arbetsmetoder (avsnitt 1–4)'),
            ('15.30', 'Övning 2.1–2.4 tillsammans'),
            ('15.50', 'Paus'),
            ('16.00', 'Pass 2: Roller, regler för fartyg och avgränsning (avsnitt 5–7) och två exempel'),
            ('16.25', 'Övning 2.5 tillsammans'),
            ('16.40', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Underlag för regelval',
            'nyckel': 'Tre sorters dokument med olika uppgifter.',
            'punkter': [
                '**Föreskrift:** bindande krav inom ett bestämt tillämpningsområde.',
                '**Standard:** beskriver tekniska och organisatoriska metoder.',
                '**Lokal arbetsanvisning:** preciserar organisation och arbete på just den här arbetsplatsen.',
                'En spårbar hänvisning anger dokumentets nummer, utgåva och tillämpning.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Reglernas olika uppgifter',
            'nyckel': 'Tillämpningsområdet måste vara känt.',
            'punkter': [
                'Föreskrifter anger bindande krav inom sitt tillämpningsområde.',
                'Standarder och anvisningar ger tekniskt och organisatoriskt stöd.',
                'Fartygets kategori, trafik och byggnadsdata påverkar regelvalet.',
                'En standardhänvisning ersätter inte bedömningen.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'SS-EN 50110-1 och ESA',
            'nyckel': 'Tre arbetsmetoder i standarden, fyra i ESA.',
            'punkter': [
                'SS-EN 50110-1 utgåva 4:2024 behandlar drift av och arbete på elanläggningar. Den har tre metoder: arbete utan spänning, med spänning och nära spänning.',
                'Elbranschens anvisningar EBR ESA 2026 gäller från 29 maj 2026. ESA har fyra metoder: de tre och arbete utanför närområdet.',
                'Kursen ger en översikt. Den är ingen ESA-certifiering.',
            ],
            'size': 18, 'mellan': 6,
            'figur_under': True, 'texthojd': 2.55,
            'figur': 'v42_02-b07-1.png',
            'alt': 'Riskområde och närområde som skal runt en spänningssatt del, åt alla håll. En person står utanför närområdet. '
                   'Med spänning: arbete i riskområdet; nära spänning: arbete i närområdet; utan spänning: efter de fem säkerhetsåtgärderna.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Fem säkerhetsåtgärder',
            'nyckel': 'Arbete utan spänning kräver fem åtgärder i följd.',
            'punkter': [
                'Det räcker inte att frånskilja. Alla fem åtgärderna planeras före arbetet.',
                'Varje åtgärds tillämpning avgörs för anläggningen och arbetet.',
                'Ordningen står i figuren: frånskilj, skydda mot återinkoppling, kontrollera spänningslöshet, jorda och kortslut, skydda mot närliggande spänningssatta delar.',
            ],
            'size': 18,
            'figur': 'v42_02-b08-1.png',
            'alt': 'De fem säkerhetsåtgärderna i ordning: frånskilj fullständigt, skydda mot återinkoppling, kontrollera spänningslöshet, '
                   'jorda och kortslut, skydda mot närliggande spänningssatta delar.',
        }),
        ('ovningar', {
            'nummer': ['2.1', '2.2', '2.3', '2.4'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('paus', {'text': 'Vi fortsätter 16.00'}),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Roller och kommunikation',
            'nyckel': 'Utsedd person, avgränsat uppdrag, tydligt besked.',
            'punkter': [
                'Elsäkerhetsledaren leder säkerheten för det aktuella arbetet.',
                'Driftorganisationen samordnar drift och kopplingsåtgärder.',
                'Planens ”kopplingsansvarig” måste preciseras i den lokala organisationen.',
                'Namn, funktion och överlämning ska vara entydiga.',
            ],
            'size': 18,
            'figur': 'v42_02-b21-1.png',
            'alt': 'Besked mellan driftorganisation, elsäkerhetsledare och arbetslag: kopplingsbesked, startbesked, klart och återlämning. '
                   'Varje besked anger objekt, gräns, kontroller, namn och tid och repeteras och kvitteras.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Regler för fartyg',
            'nyckel': 'Fartygstyp och tillämpningsområde styr.',
            'punkter': [
                '**Fartyg i nationell sjöfart:** TSFS 2017:26 om fartyg i nationell sjöfart.',
                '**Fartyg med internationella certifikat:** TSFS 2019:4 om maskininstallation, elektrisk installation och periodvis obemannat maskinrum.',
                '**Arbetsmiljön ombord:** TSFS 2019:56. Där räknas redaren som arbetsgivare.',
                '**Rutinerna ombord:** ISM-koden kräver ett säkerhetsstyrningssystem (SMS) med fartygets rutiner för säkert arbete.',
                'IEC 60092 behandlar elinstallationer på fartyg. SS-EN 50110-1 har inte utvecklats specifikt för sjögående fartyg.',
            ],
            'size': 18, 'mellan': 7,
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Avgränsning före beslut',
            'nyckel': 'Rätt objekt och alla berörda energikällor.',
            'punkter': [
                'Arbetsområdet kan påverkas av fler än en matning.',
                'Reservkraft, UPS och lagrad energi ingår i kartläggningen.',
                'Arbetsberedningen anger vad som får påbörjas, av vem och under vilka verifierade förutsättningar.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 2 · exempel 1', 'rubrik': 'Exempel: regelval utan gissning',
            'scenario': 'Ett fartyg ska få en ny landanslutning. Underlaget säger bara ”enligt gällande regler”.',
            'nyckel': 'Tillämplighet måste kontrolleras före hänvisning.',
            'punkter': [
                '1. Skriv upp vilka uppgifter om fartyget som saknas i underlaget. Gissa dem inte.',
                '2. Matcha uppgifterna mot föreskriftens tillämpningsområde.',
                '3. Dokumentera aktuell version och det avsnitt du har kontrollerat.',
            ],
            'slutsats': 'Ett standardnamn ensamt visar inte vilka bindande krav som gäller för ändringen.',
        }),
        ('teori', {
            'etikett': 'Del 2 · exempel 2', 'rubrik': 'Exempel: två matningsvägar',
            'scenario': 'Arbete planeras på K3. Landanslutningen är beskriven, men ritningen visar också ett UPS-spår.',
            'nyckel': 'Arbetsgränsen omfattar alla berörda energikällor.',
            'punkter': [
                '1. **Observation:** UPS-vägen finns i ritningen men saknas i planen.',
                '2. **Osäkerhet:** K3 kan ha en ytterligare möjlig matning.',
                '3. **Beslut:** arbetet på K3 startar inte förrän vägen och skyddsåtgärderna är verifierade.',
            ],
            'slutsats': 'Planen anger ansvarig, utförda kontroller och ett tydligt besked för det avgränsade arbetet.',
            'size': 18, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v42_02-b24-1.png',
            'alt': 'K3 matas från landanslutningen, som finns i planen, och från en UPS, som finns i ritningen men inte i planen.',
        }),
        ('ovningar', {
            'nummer': ['2.5'],
            'instruktion': 'Fem minuter. Skriv ditt svar i chatten. Övning 2.6–2.10 gör du själv efter lektionen.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'En föreskrift är bindande inom sitt tillämpningsområde. En standard och en arbetsanvisning ger stöd.',
                'Ombord styr fartygets typ och certifikat vilka regler som gäller: TSFS 2017:26, TSFS 2019:4 och TSFS 2019:56.',
                'Arbete utan spänning: fem säkerhetsåtgärder, en utsedd elsäkerhetsledare och tydliga besked.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': hemma('v42_02') + [
                'Fredag 09.00: del 3, Riskbedömning och skydd.',
            ],
            'not': VECKAN[42],
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 42, del 2 Regler, ansvar och arbetsmetoder', 'https://nj22az.github.io/sjoskolan/vecka-42/aktuell/Del_2.html'),
                ('Transportstyrelsen: TSFS 2017:26 om fartyg i nationell sjöfart', 'https://www.transportstyrelsen.se/TSFS/TSFS%202017_26.pdf'),
                ('Transportstyrelsen: TSFS 2019:4 om maskininstallation och elektrisk installation',
                 'https://www.transportstyrelsen.se/TSFS/TSFS%202019_4k.pdf'),
                ('Transportstyrelsen: TSFS 2019:56 (konsoliderad) om arbetsmiljö på fartyg', 'https://www.transportstyrelsen.se/TSFS/TSFS%202019_56k.pdf'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)', None),
                ('EBR ESA 2026, Elsäkerhetsanvisningar (Energiföretagen Sverige)', None),
            ],
        }),
    ],
}

V42_03 = {
    'id': 'v42_03',
    'fil': 'vecka-42/aktuell/v42_03_Riskbedomning_och_skydd_elev.pptx',
    'omslag': 'omslag_v42_03.jpg',
    'figurmapp': 'vecka-42/aktuell/figurer',
    'kicker': 'Vecka 42 · Fredag 16 oktober · 09.00–11.00',
    'titel': 'Riskbedömning och skydd',
    'underrubrik': 'Från identifierad fara till beslut och verifierad åtgärd',
    'etikett': 'Vecka 42 · Fredag · Riskbedömning och skydd',
    'del': 3, 'delar': 3,
    'delsida_url': DELSIDA.format(v=42, d=3),
    'omrade': 'sakerhet',
    'mal': ['LM-7', 'LM-6', 'LM-1'],
    'efter': [
        'skriva en riskrad med fara, händelse, konsekvens och en åtgärd som går att verifiera.',
        'välja skydd i rätt ordning: minska faran först, skyddsutrustning sist.',
        'ange villkor för start, avbrott och återlämning.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ett ord i chatten om vad som saknas.'}),
        ('upplagg', [
            ('09.00', 'Start och startfråga'),
            ('09.05', 'Pass 1: Från fara till beslut (avsnitt 1–3) och två exempel'),
            ('09.30', 'Övning 3.1, 3.2 och 3.3 tillsammans'),
            ('09.50', 'Paus'),
            ('10.00', 'Pass 2: Provare, jordning och stoppvillkor (avsnitt 4–6) och ett exempel'),
            ('10.25', 'Övning 3.4 och 3.5 tillsammans'),
            ('10.35', 'Veckans labb: Välj CAT-klass'),
            ('10.45', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Från identifierad fara till beslut',
            'nyckel': 'Från observation till startbeslut i fyra steg.',
            'punkter': [
                '**Observation:** det vi vet om arbetsplatsen eller utrustningen.',
                '**Riskbedömning:** möjliga händelser och konsekvenser.',
                '**Åtgärd:** en ansvarig och ett sätt att verifiera effekten.',
                '**Startbeslut:** villkoren för det avgränsade arbetet är uppfyllda.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Arbetsmomentets gränser',
            'nyckel': 'Fara, händelse, konsekvens, åtgärd.',
            'punkter': [
                'Riskbedömningen börjar med en konkret uppgift och arbetsplats.',
                'Ange vad som ingår och vad som ligger utanför uppdraget.',
                'Exempel: en skadad kabel kan ge ett spänningsförande hölje.',
                'Åtgärden behöver hindra både exponering och återanvändning.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Prioritering av skydd',
            'nyckel': 'Skyddsutrustning väljs mot den bedömda risken.',
            'punkter': [
                'Planeringen ska i första hand minska eller avlägsna faran.',
                'Personlig skyddsutrustning kompletterar övriga åtgärder.',
                'Vanliga arbetshandskar är inte automatiskt elektriskt isolerande.',
                'Skydd mot ljusbåge behöver rätt klassning och användning.',
            ],
            'size': 19,
            'figur': 'v42_03-b07-1.png',
            'alt': 'Skyddsåtgärder i prioritetsordning, mest effektivt först: ta bort faran (arbete utan spänning), ersätt '
                   '(lägre spänning, säkrare utrustning), tekniska skydd (avskärmning, isolering), organisatoriska åtgärder '
                   '(beredning, instruktion, behörighet) och sist personlig skyddsutrustning, som kompletterar.',
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 1', 'rubrik': 'Exempel: en användbar riskrad',
            'scenario': 'Moment: undersöka den frånskilda kopplingslådan K4. En möjlig reservmatning är ännu inte identifierad.',
            'nyckel': 'Fara, händelse, konsekvens och verifierbar åtgärd.',
            'punkter': [
                '1. **Fara:** möjlig kvarvarande energitillförsel till K4.',
                '2. **Händelse och följd:** beröring kan ge strömgenomgång.',
                '3. **Åtgärd:** en utsedd ansvarig kartlägger matningen enligt aktuell plan.',
            ],
            'slutsats': 'Startvillkor: alla berörda källor och skyddsåtgärder är verifierade. Oklar matning ger stopp.',
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 2', 'rubrik': 'Exempel på riskrad',
            'scenario': 'Moment: inspektion av en frånskild kopplingslåda i fuktig miljö.',
            'nyckel': 'Åtgärd: kartläggning, säkring och verifiering enligt plan.',
            'punkter': [
                '1. **Fara:** alternativ matning och skadad isolering.',
                '2. Ansvarig och kontrollresultat anges före startbesked.',
            ],
            'slutsats': 'Kvarstående osäkerhet om matningen innebär att arbetet väntar.',
        }),
        ('ovningar', {
            'nummer': ['3.1', '3.2', '3.3'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('paus', {'text': 'Vi fortsätter 10.00'}),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Provare, låsning och märkning',
            'nyckel': 'Instrumentets funktion måste vara tillförlitlig.',
            'punkter': [
                'En tvåpolig spänningsprovare väljs för systemets spänning och kategori.',
                'Låsning och märkning stöder skyddet mot återinkoppling.',
                'Kontrollmetod, instrumentkontroll och arbetsgräns står i den lokala arbetsinstruktionen.',
            ],
            'size': 19, 'mellan': 6,
            'figur_under': True, 'texthojd': 2.2,
            'figur': 'v42_03-b08-1.png',
            'alt': 'Frånskiljare i läge 0 med hänglås och skylt (namn, datum, telefon). En tvåpolig spänningsprovare mot de utgående '
                   'plintarna L1, L2, L3 och PE. Provaren kontrolleras före och efter mätningen: prova, mät, prova.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Jordning och kortslutning',
            'nyckel': 'Behov och utförande styrs av anläggning och metod.',
            'punkter': [
                'Åtgärden kan skydda mot oavsiktlig återspänningssättning och andra elektriska risker i arbetsområdet.',
                'Högspänning kräver särskild utrustning, kompetens och plan.',
                'Kursfallet är en dokumentationsövning utan verkligt handhavande.',
            ],
            'size': 19, 'mellan': 6,
            'figur_under': True, 'texthojd': 2.2,
            'figur': 'v42_03-b21-1.png',
            'alt': 'Frånskiljare med synligt brytställe. Vid arbetsstället ett jordnings- och kortslutningsdon med klämmor på L1, L2 och L3 '
                   'och jordledaren till jordskenan. Jordledaren ansluts först och tas bort sist.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Kvarstående risk och stoppvillkor',
            'nyckel': 'Villkor för start, avbrott och återlämning.',
            'punkter': [
                'En åtgärd behöver en ansvarig person och en verifiering.',
                'En osäker arbetsgräns eller ändrade förutsättningar kräver ett nytt beslut.',
                '”Klart” ska betyda att de angivna kontrollerna är utförda.',
                'Skriv hur avvikelser hanteras och kommuniceras.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 3', 'rubrik': 'Exempel: riskpoäng med begränsning',
            'scenario': 'En övningsmatris anger sannolikhet 5 och konsekvens 3. Efter åtgärd bedöms sannolikheten till 2.',
            'nyckel': 'Riskpoäng = sannolikhet · konsekvens',
            'punkter': [
                '1. Före: 5 · 3 = 15.',
                '2. Efter: 2 · 3 = 6.',
            ],
            'slutsats': 'Poängen sjunker i den här matrisen, men det säger inte hur mycket säkrare arbetet har blivit. '
                        'Ingen tillåten gräns är given, så poängtalet visar inte att arbetet får starta.',
            'size': 19, 'nyckelstorlek': 22,
            'figur': 'v42_03-b24-1.png',
            'alt': 'Riskmatris fem gånger fem med poäng sannolikhet gånger konsekvens. Före åtgärd sannolikhet 5 och konsekvens 3 (15), '
                   'efter åtgärd sannolikhet 2 och konsekvens 3 (6). Ingen tillåten gräns är given.',
        }),
        ('ovningar', {
            'nummer': ['3.4', '3.5'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 3.6–3.10 gör du själv efter lektionen.',
        }),
        ('labb', {
            'namn': 'Multimeterlabbet: Välj CAT-klass',
            'steg': [
                'Öppna Multimeterlabbet och välj övningen Välj CAT-klass.',
                'Gör uppgifterna i ordning. Skriv en motivering till varje val.',
                'Labben förbereder dig för inlämningsuppgift 3.',
            ],
            'url': 'nj22az.github.io/sjoskolan/multimetersimulator/?ovning=category',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'En riskrad har fara, händelse, konsekvens och en åtgärd med ansvarig och verifiering.',
                'Skydd i rätt ordning: minska eller ta bort faran först. Skyddsutrustning kompletterar.',
                'Arbetet startar när villkoren är verifierade. Oklar matning eller ändrade förutsättningar ger stopp och nytt beslut.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': hemma('v42_03') + [
                'Gör klart inlämningen i dag. Ladda ner PDF-filen och lämna in den i Google Classroom.',
            ],
            'not': 'Inlämningen senast i dag, fredag 16 oktober. Nästa vecka: vecka 43, Komponenter och skydd.',
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 42, del 3 Riskbedömning och skydd', 'https://nj22az.github.io/sjoskolan/vecka-42/aktuell/Del_3.html'),
                ('Transportstyrelsen: Riktlinjer för riskanalysarbete, fartyg i nationell fart (2019)',
                 'https://nj22az.github.io/sjoskolan/vecka-42/aktuell/Transportstyrelsen_riktlinjer_riskanalysarbete.pdf'),
                ('Transportstyrelsen: elektrisk utrustning och elinstallationer på fartyg',
                 'https://www.transportstyrelsen.se/sv/om-oss/dina-rattigheter-lagar-och-regler/lagar-och-regler/regler-for-sjofart/regler-for-nationell-sjofart/regler-kompletterade-upplysningar/elektrisk-utrustning-och-elinstallationer/'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)', 'https://elstandard.se/documents/preview/3246401'),
            ],
        }),
    ],
}

LEKTIONER = [V42_01, V42_02, V42_03]
