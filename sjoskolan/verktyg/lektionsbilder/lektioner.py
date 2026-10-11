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
            'punkter': [
                'Läs del 1 på webben. Tryck på ”Jag har läst del 1” längst ned på sidan.',
                'Gör övning 1.6–1.10 på delsidan. Ledtrådar och facit finns där.',
                'Titta på filmen Fem steg (repetition från vecka 40).',
                'I morgon tisdag 15.00: del 2, Regler, ansvar och arbetsmetoder.',
            ],
            'not': 'Inlämningen för vecka 42 öppnar du från veckosidan. Sista dag: söndag 18 oktober.',
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
                 'https://www.transportstyrelsen.se/sv/sjofart/Fartyg/Fartygskonstruktion/Elinstallationer/Lagar-foreskrifter-och-standarder/'),
            ],
        }),
    ],
}

LEKTIONER = [V42_01]
