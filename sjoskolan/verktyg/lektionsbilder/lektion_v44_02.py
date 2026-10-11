"""Vecka 44, måndag 10.00–11.00: del 2 Högspänningssystem (lektionsbildernas mall, se bygg.py och lektioner.py).

Teoribilderna har delsidans åtta avsnitt i samma ordning och med samma rubriker (teorikorten i
placeringar/kurs-formelstod.json bygger på dem). Övning 2.1–2.3 görs tillsammans på delsidan, 2.4–2.6 hemma och 2.7–2.10
är extra. Exemplen räknar inte med övningarnas eller inlämningens tal (inte 6,6 kV, PF 0,88, 440 V eller 600/1 A).
"""

DELSIDA_URL = 'nj22az.github.io/sjoskolan/vecka-44/aktuell/Del_2.html'

# Läxorna efter lektionen (samma lista på bilden ”Det här gör du nu” och i dagens ruta på veckosidan).
# Adresserna gäller relativt veckosidan vecka-44/aktuell/.
HEMMA = [
    ('del-2', 'Läs del 2 på delsidan: teorin och de två exemplen. Tryck på ”Jag har läst del 2” längst ned på sidan.', 'Del_2.html', 'Öppna del 2'),
    ('ovn-2', 'Gör övning 2.4–2.6 på delsidan. Övning 2.7–2.10 är extra. Ledtrådar och facit finns där.',
     'Del_2.html#v44_02-q4', 'Öppna övning 2.4'),
]

VECKAN = 'Inlämningen och analysen av mätdata senast fredag 30 oktober. Allt finns på veckosidan.'

LEKTION = {
    'id': 'v44_02',
    'fil': 'vecka-44/aktuell/v44_02_Hogspanningssystem_elev.pptx',
    'omslag': 'omslag_v44_02.jpg',
    'figurmapp': 'vecka-44/aktuell/figurer',
    'kicker': 'Vecka 44 · Måndag 26 oktober · 10.00–11.00',
    'titel': 'Högspänningssystem',
    'underrubrik': 'Ställverk, skydd och säker arbetsplanering',
    'etikett': 'Vecka 44 · Måndag · Högspänningssystem',
    'del': 2, 'delar': 5,
    'delsida_url': DELSIDA_URL,
    'omrade': 'sakerhet',
    'mal': ['LM-2', 'LM-1', 'LM-3'],
    'efter': [
        'beskriva högspänningssystemets viktigaste funktioner.',
        'beräkna linjeström och strömtransformatorns sekundärström.',
        'identifiera nödvändigt underlag för säkra arbetsgränser.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv en kort förklaring i chatten.'}),
        ('upplagg', [
            ('10.00', 'Start och startfråga'),
            ('10.05', 'Pass 1: Spänningsnivå, ställverk och mättransformatorer (avsnitt 1–4) och ett exempel'),
            ('10.20', 'Övning 2.1, 2.2 och 2.3 tillsammans'),
            ('10.35', 'Pass 2: Skydd, arbetsgräns och neutralpunktsjordning (avsnitt 5–8) och ett exempel'),
            ('10.50', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Spänning och skyddsfunktion',
            'nyckel': 'AC och DC har olika spänningsgränser i kursens terminologi.',
            'punkter': [
                'I_{L} är linjeström. U_{L} är linjespänning i trefasformlerna.',
                'Mättransformator ger signal, reläskydd fattar beslut och brytare kopplar bort.',
                'Manöver, frånskiljning och jordning är skilda funktioner med särskilda villkor.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Spänningsnivå och överföring',
            'nyckel': 'P = √3 · U_{L} · I_{L} · PF',
            'punkter': [
                'Högspänning (HV) är över 1 000 V AC eller över 1 500 V DC i den terminologi som används här.',
                'Vid given effekt och PF minskar strömmen när spänningen ökar.',
                'Isolering och arbetssäkerhet kräver samtidigt andra lösningar.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Ställverkets funktioner',
            'nyckel': 'Apparaternas funktioner ska framgå av schema och data.',
            'punkter': [
                'Brytare kopplar last och avsedda felströmmar.',
                'Frånskiljning och jordning har särskilda uppgifter.',
                'Förreglingar kan hindra farliga manöverföljder. De ersätter inte arbetsberedning och verifierad status.',
            ],
            'figur': 'v44_02-b07-1.png',
            'alt': 'Ställverksfack: samlingsskena, frånskiljare, brytare, strömtransformator och jordningskopplare mot kabeln till '
                   'förbrukaren, med förregling.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Mättransformatorer och reläskydd',
            'nyckel': 'Kedjan: mätning, skyddslogik, utlösning och brytare.',
            'punkter': [
                'Ström- och spänningstransformatorer ger signaler till mätning och skydd.',
                'Reläskyddet bedömer tillstånd och kan ge brytkommando.',
                'En strömtransformator kräver föreskriven sekundärhantering.',
                'En belastad sekundärkrets får inte öppnas godtyckligt.',
            ],
            'size': 19,
            'figur': 'v44_02-b08-1.png',
            'alt': 'Strömtransformatorn mäter, skyddsreläet beslutar och brytaren kopplar bort.',
        }),
        ('teori', {
            'etikett': 'Del 2 · exempel 1', 'rubrik': 'Exempel: ström vid högre spänning',
            'scenario': 'Symmetrisk trefaslast med P = 500 kW och PF = 0,80. Jämför 5 kV och 500 V linjespänning.',
            'nyckel': 'I_{L} = P/(√3 · U_{L} · PF)',
            'punkter': [
                '1. Vid 5 kV: I_{L} = 500 000/(√3 · 5 000 · 0,80) ≈ 72,2 A.',
                '2. Vid 500 V: I_{L} ≈ 721,7 A.',
                '3. Spänningskvoten 5 000/500 = 10 ger omvänd strömkvot.',
            ],
            'slutsats': 'Samma effekt och PF ger tio gånger större ström vid en tiondel av spänningen.',
            'size': 18, 'mellan': 6,
            'figur': 'v44_02-b09-1.png',
            'alt': 'Stapeldiagram: linjeströmmen är 72,2 A vid 5 kV och 721,7 A vid 500 V för 500 kW och PF 0,80.',
        }),
        ('ovningar', {
            'nummer': ['2.1', '2.2', '2.3'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 2.4–2.6 gör du själv efter lektionen.',
        }),
        ('teori', {
            'etikett': 'Del 2 · exempel 2', 'rubrik': 'Exempel: strömtransformator',
            'scenario': 'En ideal strömtransformator är märkt 400/5 A. Primärströmmen är 320 A. Endast beräkning på data.',
            'nyckel': 'k_{I} = I_{1,märk}/I_{2,märk} och I_{2} = I_{1}/k_{I}',
            'punkter': [
                '1. k_{I} = 400/5 = 80.',
                '2. I_{2} = 320/80 = 4,0 A.',
                '3. Kontroll: 4,0/5 = 320/400 = 0,80 av märkström på båda sidor.',
            ],
            'slutsats': 'Sekundärkretsen hanteras enligt anläggningens instruktion. Exemplet är ingen kopplingsanvisning.',
            'size': 18, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v44_02-b24-1.png',
            'alt': 'Strömtransformator 400/5 A med primärströmmen 320 A och sekundärströmmen 4,0 A. '
                   'Sekundärkretsen får inte brytas under drift.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Skyddsfunktioner',
            'nyckel': 'Inställning och verifiering hör till anläggningens skyddsplan.',
            'punkter': [
                'Överström, jordfel och differentialskydd reagerar på olika felbilder.',
                'Selektivitet ska begränsa bortkoppling till avsett område.',
                'Ett skydd som inte löser och ett som löser felaktigt kan båda hota driftsäkerheten.',
            ],
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Avstånd och arbetsgräns',
            'nyckel': 'Inget generellt kursmått ersätter en fastställd arbetsplan.',
            'punkter': [
                'Områdes- och arbetsavstånd beror på anläggning och arbetsmetod.',
                'Verktyg, material och rörelseutrymme påverkar gränsen.',
                'Ansvarig använder aktuell standard och lokala anvisningar för spänningsnivån och den konkreta arbetsplatsen.',
            ],
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Beredning för ett dokumentationsfall',
            'nyckel': 'Teoretisk planering utan praktiska HV-manövrer.',
            'punkter': [
                'Underlaget ska visa objekt, matningsvägar och aktuell driftstatus.',
                'Roller, kommunikation och stoppvillkor behöver vara tydliga.',
                'Okänd matning, bristande dokumentation eller oklar status innebär att förutsättningarna behöver klarläggas.',
            ],
        }),
        ('teori', {
            'avsnitt': 8, 'rubrik': 'Neutralpunktsjordning i HV-nät',
            'nyckel': 'Ett motstånd i neutralpunkten begränsar jordfelsströmmen till en bestämd nivå.',
            'punkter': [
                'Fartygens 6,6 och 11 kV-nät har ofta neutralpunkten jordad via ett sådant motstånd (NER).',
                'Jordfelsreläet larmar eller löser ut enligt skyddsplanen.',
                'Hur många generatorer som har jordad neutralpunkt samtidigt styrs så att felströmmen blir den avsedda.',
            ],
            'size': 19,
            'figur': 'v44_02-b35-1.png',
            'alt': 'Generator 6,6 kV med neutralpunkten jordad via ett motstånd (NER) och ett jordfelsrelä. Ett jordfel på L1 ger '
                   'en felström genom skrovet och motståndet, begränsad av motståndet.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'Högspänning är över 1 000 V AC eller över 1 500 V DC. Linjeströmmen räknas med I_{L} = P/(√3 · U_{L} · PF).',
                'Ställverkets apparater har olika uppgifter. Förreglingar ersätter inte arbetsberedning och verifierad status.',
                'Arbetsgränsen bestäms för anläggningen och arbetsmetoden enligt aktuell standard och lokala anvisningar.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + ['I morgon tisdag 15.00: del 3, Fördjupad mätteknik, och del 4, Analys av mätresultat.'],
            'not': VECKAN,
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 44, del 2 Högspänningssystem', 'https://nj22az.github.io/sjoskolan/vecka-44/aktuell/Del_2.html'),
                ('Studieplanen YH03151, 18 september 2026: Elteknik och ellära, lärandemål 1, 2 och 3', None),
                ('Elsäkerhetsverket: Vad är en elolycka och vad betyder de olika begreppen?',
                 'https://www.elsakerhetsverket.se/elolyckor-i-arbetslivet/vad-ar-en-elolycka/'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)',
                 'https://elstandard.se/documents/preview/3246401'),
                ('Schneider Electric: samordning av skydd', 'https://www.electrical-installation.org/enwiki/Coordination_between_circuit-breakers'),
                ('Schneider Electric: skenbar effekt', 'https://www.electrical-installation.org/enwiki/Installed_apparent_power_%28kVA%29'),
            ],
        }),
    ],
}
