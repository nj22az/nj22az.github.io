"""Vecka 43, måndag: Komponenter och skydd (del 1 av 4). Läses av lektioner.py; mallen står i bygg.py.

Reglerna för texten står i lektioner.py. För den här lektionen:
- De sju teoribilderna har delsidans rubriker i samma ordning som den tidigare presentationen. Övningarnas teorikort
  (placeringar/kurs-formelstod.json) pekar på rubrikerna, och inlämningens hänvisningar på avsnittens nummer.
- Exemplen räknar inte med inlämning 2:s tal (C16, 6 kA, 30 mA, 8,000 A ut) eller övningarnas (1.4: 5,000/4,970 A,
  1.9: 8 kA mot 6 kA).
- Övning 1.2–1.5 bygger på avsnitt 3–4 (pass 1) och övning 1.1 på avsnitt 5 (pass 2), enligt teorikorten.
"""
import re

DELSIDA = 'nj22az.github.io/sjoskolan/vecka-43/aktuell/Del_1.html'

# Läxorna efter lektionen: (id, text, adress relativt veckosidan vecka-43/aktuell/, knapptext). Samma lista på bilden
# ”Det här gör du nu” och i dagens ruta på veckosidan (verktyg/veckosidor/dagsvy.py).
HEMMA = [
    ('del-1', 'Läs del 1: teorin och de två exemplen.', 'Del_1.html', 'Öppna del 1'),
    ('ovn-1', 'Gör övning 1.6–1.10 på delsidan. Ledtrådar och facit finns där.', 'Del_1.html#v43_01-q6', 'Öppna övning 1.6'),
    ('inl', 'Börja på inlämningen: uppgift 1 och 2.', 'Inlamning.html', 'Öppna inlämningen'),
]
# Det som gäller hela veckan (noten på bilden ”Det här gör du nu”).
VECKAN = 'Inlämningen och felsökningsrapporten senast fredag 23 oktober. Allt finns på veckosidan.'

LEKTION = {
    'id': 'v43_01',
    'fil': 'vecka-43/aktuell/v43_01_Komponenter_och_skydd_elev.pptx',
    'omslag': 'omslag_v43_01.jpg',
    'figurmapp': 'vecka-43/aktuell/figurer',
    'kicker': 'Vecka 43 · Måndag 19 oktober · 09.00–11.00',
    'titel': 'Komponenter och skydd',
    'underrubrik': 'Brytare, säkringar, reläer och selektivitet',
    'etikett': 'Vecka 43 · Måndag · Komponenter och skydd',
    'del': 1, 'delar': 4,
    'delsida_url': DELSIDA,
    'omrade': 'komponenter',
    'mal': ['LM-1'],
    'efter': [
        'förklara vad vanliga skydds- och manöverapparater gör.',
        'skilja märkström, brytförmåga och utlösningsvillkor.',
        'räkna ut en differensström och förklara vad selektivitet kräver.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ja eller nej i chatten, och ett ord om varför.'}),
        ('upplagg', [
            ('09.00', 'Start och startfråga'),
            ('09.05', 'Pass 1: Märkning, frånskiljning, säkring och jordfelsbrytare (avsnitt 1–4) och ett exempel'),
            ('09.30', 'Övning 1.2–1.5 tillsammans'),
            ('09.50', 'Paus'),
            ('10.00', 'Pass 2: Kontaktor, motorskydd och selektivitet (avsnitt 5–7) och ett exempel'),
            ('10.25', 'Övning 1.1 tillsammans'),
            ('10.40', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Apparatens uppgift och märkning',
            'nyckel': 'Varje apparat har en egen uppgift och egna märkdata.',
            'punkter': [
                'En kontaktor manövrerar last genom elektriskt styrda kontakter.',
                'Överlast och kortslutning är olika typer av överström.',
                'Märkström, spänningsklass och brytförmåga beskriver olika krav.',
                'Selektivitet kräver samordning så att rätt skyddsnivå kopplar bort felet.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Manöver och frånskiljning',
            'nyckel': 'Funktionen bestäms av märkning och konstruktion.',
            'punkter': [
                'En brytare kan användas för att koppla en krets.',
                'Förmåga till säker frånskiljning måste framgå av apparatens data.',
                'En kontaktor är avsedd för upprepad manöver.',
                'En öppen kontaktor är inte automatiskt tillräcklig arbetsfrånskiljning.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Säkring och dvärgbrytare',
            'nyckel': 'Märkström är inte samma sak som brytförmåga.',
            'punkter': [
                'Överström kan vara överlast eller kortslutning.',
                'Skyddets ström–tidsegenskap avgör hur snabbt det löser.',
                'Ett skydd märkt 16 A kan tåla normal lastström.',
                'Angiven brytförmåga beskriver vilken felström det kan bryta.',
            ],
            'size': 19, 'mellan': 8,
            'figur': 'v43_01-b07-1.png',
            'alt': 'Principskiss av en ström–tidskurva: långsam utlösning vid överlast och snabb utlösning vid kortslutning.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Jordfelsbrytare',
            # Hårt mellanslag ( ): raden bryts före ”mellan strömmarna”. Delsidan läser det som ett vanligt mellanslag.
            'nyckel': 'I_{Δ} = skillnaden mellan strömmarna',
            'punkter': [
                'Jordfelsbrytaren reagerar på differensen mellan utgående och återkommande ström i de ledare som övervakas.',
                'En ren jordfelsbrytare ersätter inte överströmsskydd.',
                'Ombord: i ett IT-nät dimensionerat för fortsatt drift ger första jordfelet normalt larm, inte utlösning.',
                'Jordfelsbrytare används främst i 230 V uttagsgrupper.',
            ],
            'size': 18, 'mellan': 6, 'nyckelstorlek': 23,
            'figur': 'v43_01-b08-1.png',
            'alt': 'Jordfelsbrytare: L och N går genom en summaströmtransformator. En läckström till jord ger en differensström '
                   'som påverkar utlösaren.',
        }),
        ('teori', {
            'etikett': 'Del 1 · exempel 1', 'rubrik': 'Exempel: differensström',
            'scenario': 'En enfaskrets har 2,000 A ut och 1,985 A tillbaka genom de övervakade ledarna.',
            'nyckel': 'I_{Δ} = |I_{ut} − I_{retur}|',
            'punkter': [
                '1. I_{Δ} = |2,000 − 1,985| = 0,015 A.',
                '2. 0,015 · 1 000 = 15 mA.',
                '3. Skillnaden innebär att en del av strömmen tar en annan väg.',
            ],
            'slutsats': 'Vilken utlösning som ska ske kräver skyddets data. Här beräknas endast differensströmmen.',
            'size': 18, 'nyckelstorlek': 22, 'mellan': 6,
            'figur': 'v43_01-b09-1.png',
            'alt': 'Jordfelsbrytare med 2,000 A ut och 1,985 A tillbaka. Differensströmmen är 15 mA.',
        }),
        ('ovningar', {
            'nummer': ['1.2', '1.3', '1.4', '1.5'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('paus', {'text': 'Vi fortsätter 10.00'}),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Kontaktor och relä',
            'nyckel': 'NO: normalt öppen. NC: normalt sluten.',
            'punkter': [
                'En spole påverkar kontakter som manövrerar andra kretsar.',
                'Hjälpkontakter kan ge hållning och återkoppling.',
                'Normalläget avser angivet opåverkat tillstånd.',
                'Spolens märkspänning är skild från huvudkontaktens lastdata.',
            ],
            'size': 19, 'mellan': 8,
            'figur': 'v43_01-b21-1.png',
            'alt': 'Kontaktor K1 i opåverkat läge: spolen, en NO-kontakt 13–14 som är öppen och en NC-kontakt 21–22 som är sluten.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Motorskydd',
            'nyckel': 'Märkdata och tillverkarens anvisning styr.',
            'punkter': [
                'Motorskydd ska anpassas till motor och startförlopp.',
                'Överlastfunktion och kortslutningsskydd behöver samordnas.',
                'Enbart motorns kW-tal räcker inte för ett skyddsval.',
                'Ström, drift, starttid och omgivning påverkar bedömningen.',
            ],
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Selektivitet',
            'nyckel': 'Utlösningskurvor och samordningsdata behövs.',
            'punkter': [
                'Selektivitet innebär att avsedd skyddsnivå kopplar bort felet så att övriga delar kan fortsätta fungera.',
                'Två skydd med olika märkström är inte automatiskt selektiva.',
                'Bedömningen gäller också den möjliga kortslutningsströmmen.',
            ],
            'size': 19,
            'figur': 'v43_01-b23-1.png',
            'alt': 'Huvudskydd och tre gruppskydd. Vid fel i grupp B löser bara grupp B, och övriga grupper är i drift.',
        }),
        ('teori', {
            'etikett': 'Del 1 · exempel 2', 'rubrik': 'Exempel: skyddsdata',
            'scenario': 'Möjlig kortslutningsström är 7 kA. Skydd A har 4,5 kA brytförmåga och B har 10 kA. Inget backupskydd anges.',
            'nyckel': 'Brytförmåga jämförs med möjlig felström.',
            'punkter': [
                '1. A: 4,5 kA är mindre än 7 kA och täcker inte kravet.',
                '2. B: 10 kA är större än 7 kA och klarar just denna jämförelse.',
                '3. Spänningsklass, utlösning och samordning måste också prövas.',
            ],
            'slutsats': 'Att klara brytförmågan är en nödvändig del av valet. Övriga skyddsvillkor återstår.',
            'size': 18, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v43_01-b24-1.png',
            'alt': 'Stapeldiagram: skydd A har 4,5 kA och skydd B 10 kA brytförmåga, jämfört med den möjliga felströmmen 7 kA.',
        }),
        ('ovningar', {
            'nummer': ['1.1'],
            'instruktion': 'Fem minuter. Skriv ditt svar i chatten. Övning 1.6–1.10 gör du själv efter lektionen.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'Kontaktorn manövrerar. Säkring och dvärgbrytare skyddar mot överström. Jordfelsbrytaren reagerar på differensström.',
                'Märkström, brytförmåga och utlösningsvillkor är olika krav. Brytförmågan ska täcka den möjliga felströmmen.',
                'Selektivitet visas med utlösningskurvor och samordningsdata, inte med olika märkströmmar.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + [
                'I morgon tisdag 15.00: del 2, Transformatorer och motorer.',
            ],
            'not': VECKAN,
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 43, del 1 Komponenter och skydd', 'https://nj22az.github.io/sjoskolan/vecka-43/aktuell/Del_1.html'),
                ('Kursplanen för Elteknik och ellära, lärandemål 1', None),
                ('Schneider Electric: samordning av skydd (selektivitet mellan brytare)',
                 'https://www.electrical-installation.org/enwiki/Coordination_between_circuit-breakers'),
                ('IEC 60617, symboler för elscheman', 'https://webstore.iec.ch/en/publication/2723'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)',
                 'https://elstandard.se/documents/preview/3246401'),
            ],
        }),
    ],
}


def _hart(text):
    """Hårt mellanslag i tusental, mellan tal och enhet och runt likhetstecken (1 000, 0,015 A), så att raden inte bryts
    mitt i ett värde. Samma regel som verktyg/figurer/insert.py. Delsidan läser hårda mellanslag som vanliga."""
    text = re.sub(r'(?<=\d) (?=\d{3}(?!\d))', ' ', text)
    text = re.sub(r'(?<=\d) (?=(?:%|mA|kA|A|V|Hz|r/min|VA|kW|W)(?![\wåäöÅÄÖ]))', ' ', text)
    return text.replace(' = ', ' = ')


for _typ, _b in LEKTION['bilder']:
    if _typ == 'teori':
        for _k in ('nyckel', 'scenario', 'slutsats'):
            if _b.get(_k):
                _b[_k] = _hart(_b[_k])
        _b['punkter'] = [_hart(p) for p in _b.get('punkter', [])]
