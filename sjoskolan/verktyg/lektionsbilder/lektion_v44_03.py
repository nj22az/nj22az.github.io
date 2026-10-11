"""Vecka 44 tisdag, första timmen: Fördjupad mätteknik (del 3 av 5). Mallen och reglerna: bygg.py och lektioner.py.

En entimmeslektion: alla sju teoriavsnitt och båda exemplen står kvar (delsidan del 3 läses ur bilderna), en bild med
övningar tillsammans och ingen paus. Rubrikerna är delsidans, så att teorikorten i övning 3.1–3.10 och labbens
hänvisningar (”Del 3, övning 3.3”) stämmer. Inga övningstexter eller svar på bilderna, och inga tal ur inlämningen
(Isolationslabbet: 500 V och 0,40 mA, 0,5 MΩ; analysen av mätdata: ±(0,5 % + 2 siffror) på pumpens spänning).
"""

HEMMA = [
    ('del-3', 'Läs del 3: alla sju avsnitt och de två exemplen.', 'Del_3.html', 'Öppna del 3'),
    ('ovn-3', 'Gör övning 3.4–3.6 på delsidan. Ledtrådar och facit finns där.', 'Del_3.html#v44_03-q4', 'Öppna övning 3.4'),
    ('labb', 'Gör labben Mätaren påverkar i Multimeterlabbet.', '../../multimetersimulator/?ovning=loading', 'Öppna labben'),
    ('isolation', 'Gör isolationsmätningen i Isolationslabbet. Den hör till inlämning 3.', '../../isolationslabbet/?del=matning',
     'Öppna isolationsmätningen'),
]

LEKTION = {
    'id': 'v44_03',
    'fil': 'vecka-44/aktuell/v44_03_Fordjupad_matteknik_elev.pptx',
    'omslag': 'omslag_v44_03.jpg',
    'figurmapp': 'vecka-44/aktuell/figurer',
    'kicker': 'Vecka 44 · Tisdag 27 oktober · 15.00–16.00',
    'titel': 'Fördjupad mätteknik',
    'underrubrik': 'Strömtång, isolation, oscilloskop och osäkerhet',
    'etikett': 'Vecka 44 · Tisdag · Fördjupad mätteknik',
    'del': 3, 'delar': 5,
    'delsida_url': 'nj22az.github.io/sjoskolan/vecka-44/aktuell/Del_3.html',
    'omrade': 'matning',
    'mal': ['LM-4', 'LM-6', 'LM-8'],
    'efter': [
        'välja mätprincip för en definierad fråga.',
        'mäta säkert med isolationsprovare och oscilloskop.',
        'tolka mätdata tillsammans med instrumentets begränsningar.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv en gissning i chatten, med ett ord om varför.'}),
        ('upplagg', [
            ('15.00', 'Start och startfråga'),
            ('15.05', 'Pass 1: Mätkedja, strömtång, isolation och jordtag (avsnitt 1–4) och ett exempel'),
            ('15.25', 'Övning 3.1–3.3 tillsammans'),
            ('15.40', 'Pass 2: Oscilloskop, felgräns och kalibrering (avsnitt 5–7) och ett exempel'),
            ('15.55', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Mätkedjan och enheterna',
            'nyckel': 'Varje led i mätkedjan påverkar vad visningen betyder.',
            'punkter': [
                'En givare kan omvandla ström till en liten spänning.',
                '**Känslighet** i mV/A talar om hur signalen räknas om.',
                '**Probfaktor** korrigerar visningen bara om instrumentet inte redan gör det.',
                'Mätmetod, område och driftvillkor behövs för att tolka varje resultat.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Strömtångens mätprincip',
            'nyckel': 'Fram- och returström kan ta ut varandra.',
            'punkter': [
                'En strömtång känner det magnetfält som omslutna strömmar skapar.',
                'För lastström omsluts normalt en ledare.',
                '**Differensström:** alla aktiva ledare genom tången, faserna och N om den finns, men inte PE.',
                'Använd en läckströmstång för mA-området. Vid omriktare: true RMS, mät på nätsidan.',
            ],
            'size': 18, 'nyckelstorlek': 23, 'mellan': 8,
            'figur': 'v44_03-b06-1.png',
            'alt': 'Tre strömtänger. Runt en ledare visar tången lastströmmen, runt fram- och returledaren nästan noll och runt '
                   'L1–L3 och N differensströmmen. Trefas utan N: bara L1–L3. PE hålls alltid utanför.',
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Isolationsmätning',
            'nyckel': 'Provspänning och metod väljs för utrustningen.',
            'punkter': [
                'Instrumentet lägger på en definierad provspänning och mäter responsen.',
                'Resultatet påverkas av objekt, temperatur, fukt och mättid.',
                'Verifiera spänningslöshet. Koppla bort isolationsvakt, omriktare och elektronik.',
                'Provspänning enligt utrustningens anvisning, för 440 V-utrustning ofta 500 V DC. Urladda till jord efteråt.',
            ],
            'size': 18, 'nyckelstorlek': 22, 'mellan': 7,
            'figur': 'v44_03-b07-1.png',
            'alt': 'Isolationsprovare mellan kabelns ledare och skrovet. Provspänningen driver en läckström genom '
                   'isolationsresistansen. Objektet är spänningslöst och elektroniken bortkopplad. Urladda efteråt.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Jordresistansmätning',
            'nyckel': 'R = U/I i den förenklade mätmodellen',
            'punkter': [
                'Metoden behöver skilja jordtagets egenskaper från parallella vägar.',
                'Hjälpelektroder eller selektiva metoder används beroende på systemet.',
                'Mätgeometri och anslutningar påverkar resultatet.',
                'Ett lågt tal utan metodbeskrivning är otillräckligt.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 1', 'rubrik': 'Exempel: resistans från läckström',
            'scenario': 'En stationär resistiv modell ger 0,10 mA vid 250 V provspänning.',
            'nyckel': 'R = U/I',
            'punkter': [
                '1. 0,10 mA = 0,00010 A.',
                '2. R = 250/0,00010 = 2 500 000 Ω.',
                '3. R = 2,5 MΩ efter division med 1 000 000.',
            ],
            'slutsats': 'Kontroll: 2 500 000 Ω · 0,00010 A = 250 V. Ingen praktisk provning ingår här.',
        }),
        ('ovningar', {
            'nummer': ['3.1', '3.2', '3.3'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 3.4–3.6 gör du själv efter lektionen.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Oscilloskopets referens',
            'nyckel': 'Jordad eller isolerad mätning måste vara planerad.',
            'punkter': [
                'Ett vanligt bänkinstruments probjord är kopplad till skyddsjord.',
                'Fel anslutning kan skapa en kortslutning mot jord.',
                'Flytande mätningar kräver differentialprob med rätt mätkategori.',
                'I IT-nät ger probjord på en fas ett jordfel och larm, och kortslutning om ett annat fel redan finns.',
            ],
            'size': 18, 'nyckelstorlek': 22, 'mellan': 8,
            'figur': 'v44_03-b21-1.png',
            'alt': 'Oscilloskopets probjord är förbunden med skyddsjorden (PE). Kopplas probjorden till en spänningssatt ledare '
                   'blir det kortslutning via skyddsjorden. Flytande mätning görs med differentialprob.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Osäkerhet och felgräns',
            'nyckel': 'Resultatets intervall behöver följa med slutsatsen.',
            'punkter': [
                'Upplösning, instrumentspecifikation och spridning är olika bidrag.',
                'Enkel summering kan användas som konservativ gräns i uppgifter.',
                '1 % av 50,00 V + 3 steg à 0,01 V ger ±0,53 V.',
                'En full mätosäkerhetsbudget kräver en beskriven modell.',
            ],
            'size': 19, 'nyckelstorlek': 22, 'mellan': 8,
            'figur': 'v44_03-b22-1.png',
            'alt': 'Visningen 50,00 V med felgränsen ±0,53 V ger intervallet 49,47–50,53 V.',
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Kalibrering och kontroll',
            'nyckel': 'Status, datum, användning och kontrollresultat.',
            'punkter': [
                'Kalibrering jämför instrumentet med en spårbar referens.',
                'Justering och kalibrering är olika moment.',
                'Ett kalibreringsbevis garanterar inte att instrumentet förblir felfritt efter exempelvis fall, överlast eller '
                'skadad ledning.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 2', 'rubrik': 'Exempel: oscilloskopets skalor',
            'scenario': 'En hel period upptar 5 rutor à 2 ms. Visad topp är 1,5 V med 10:1-prob utan automatisk kompensation.',
            # Hårda mellanslag (\u00a0) håller ihop en formel när raden bryts.
            'nyckel': 'T = rutor · tidsbas; f = 1/T; û\u00a0=\u00a0probfaktor\u00a0·\u00a0û_{visad}',
            'punkter': [
                '1. T = 5 · 2 = 10 ms = 0,010 s.',
                '2. f = 1/0,010 = 100 Hz.',
                '3. û = 10 · 1,5 = 15 V.',
            ],
            'slutsats': 'Tidsskalan styr frekvensberäkningen. Probfaktorn korrigerar spänning, inte\u00a0tid.',
            'size': 19, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v44_03-b24-1.png',
            'alt': 'Oscilloskopskärm med en sinus: 2 ms per ruta, 1 V per ruta och 10:1-prob. En period är fem rutor, och '
                   'toppen ligger en och en halv ruta över mitten.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'Mätkedjan avgör vad visningen betyder. Strömtången mäter summan av de omslutna strömmarna.',
                'Isolationsprov görs på ett spänningslöst objekt med elektroniken bortkopplad. Oscilloskopets referens planeras före mätningen.',
                'Resultatets intervall följer med slutsatsen. Ett kalibreringsbevis garanterar inte att instrumentet är felfritt efter fall eller överlast.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + [
                'Efter pausen 16.00: del 4, Analys av mätresultat.',
            ],
            'not': 'Inlämningen och analysen av mätdata senast fredag 30 oktober. Allt finns på veckosidan.',
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 44, del 3 Fördjupad mätteknik', 'https://nj22az.github.io/sjoskolan/vecka-44/aktuell/Del_3.html'),
                ('Kursplanen för Elteknik och ellära, lärandemål 4, 6 och 8', None),
                ('Fluke: mätning med strömtång', 'https://www.fluke.com/en-us/learn/blog/clamps/using-accessory-current-clamps-with-fluke-dmms'),
                ('Tektronix: oscilloskopprober och säkerhet', 'https://www.tek.com/en/documents/whitepaper/abcs-probes-primer'),
                ('Megger: jordresistansmätning', 'https://www.megger.com/en-gb/et-online/november-2007/a-guide-to-earth-testing'),
                ('Fluke: multimeterns funktioner och mätning', 'https://dam-assets.fluke.com.cn/s3fs-public/2100079_6003_ENG_D_W.PDF'),
            ],
        }),
    ],
}
