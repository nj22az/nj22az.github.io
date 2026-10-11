"""Vecka 43 fredag, första timmen: del 3 Elscheman och dokumentation (mallen i bygg.py, reglerna i lektioner.py).

Eleverna läser del 3 hemma tisdag kväll till torsdag och gör övning 3.1–3.5 där. Timmen är en genomgång av delen med
elevernas frågor och övning 3.6 och 3.7 tillsammans. Bilderna har ändå alla teoriavsnitt, eftersom delsidan läses ur
presentationen: rubrikerna och ordningen är desamma som förut (teorikorten och Hållkretslabbets hänvisningar
”Genomgång del 3, avsnitt 4 och 6” bygger på dem). Exempel 1 heter ”Hållkretsens start” (Hållkretslabbets hänvisning).
Inlämningen (motorns märkskylt, skyddsdata, hållkretsen med nödstopp) och felsökningsrapporten har inga svar här.
"""

DELSIDA = 'nj22az.github.io/sjoskolan/vecka-43/aktuell/Del_3.html'

# Läxorna efter lektionen (samma lista på bilden ”Det här gör du nu” och på veckosidan). Adresser relativt vecka-43/aktuell/.
HEMMA = [
    ('ovn-3', 'Gör övning 3.8–3.10 på delsidan. Ledtrådar och facit finns där.', 'Del_3.html#v43_03-q8', 'Öppna övning 3.8'),
    ('labb', 'Hållkretslabbet: välj ”Ny felmodul”, felsök det dolda felet och fyll i labbprotokollet. '
             'Protokollet är underlaget till felsökningsrapporten.', '../../hallkretslabbet/#labbprotokoll', 'Öppna labben'),
]
VECKAN = 'Inlämningen, uppgift 1–4, senast i dag, fredag 23 oktober. Allt finns på veckosidan.'

LEKTION = {
    'id': 'v43_03',
    'fil': 'vecka-43/aktuell/v43_03_Elscheman_och_dokumentation_elev.pptx',
    'omslag': 'omslag_v43_03.jpg',
    'figurmapp': 'vecka-43/aktuell/figurer',
    'kicker': 'Vecka 43 · Fredag 23 oktober · 09.00–10.00',
    'titel': 'Elscheman och dokumentation',
    'underrubrik': 'Symboler, hållkrets och förväntade mätvärden',
    'etikett': 'Vecka 43 · Fredag · Elscheman och dokumentation',
    'del': 3, 'delar': 4,
    'delsida_url': DELSIDA,
    'omrade': 'felsokning',
    'mal': ['LM-5', 'LM-9', 'LM-1'],  # LM-1 sist: dess text är två rader
    'efter': [
        'följa en huvud- och styrströmsfunktion i ett schema.',
        'koppla symboler, beteckningar och mätpunkter till dokumentationen.',
        'ange de två mätpunkterna och driftläget för ett förväntat mätvärde.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ett kort svar i chatten.'}),
        ('upplagg', [
            ('09.00', 'Start och startfråga'),
            ('09.05', 'Pass 1: Genomgång av del 3 med era frågor (avsnitt 1–7)'),
            ('09.30', 'Övning 3.6 och 3.7 tillsammans'),
            ('09.40', 'Avslutsfråga, sammanfattning och det här gör du nu'),
            ('09.50', 'Paus'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Så läses styrkretsen',
            'nyckel': 'En symbol visar funktion. En beteckning identifierar apparaten.',
            'punkter': [
                'NO är öppen och NC är sluten i opåverkat läge: ingen trycker och spolen är strömlös.',
                'Kontakter i serie måste alla vara slutna för att det ska finnas en strömväg.',
                'Kontakter parallellt ger alternativa vägar mellan samma två noder.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Symboler och referenser',
            'nyckel': 'Symboler visar komponenternas funktion.',
            'punkter': [
                'IEC 60617 är referensen för grafiska symboler i elscheman.',
                'Beteckningen identifierar objektet, till exempel apparaten K1.',
                'Korsreferenser knyter samman spolen och kontakterna.',
                'Figuren visar förenklade undervisningssymboler.',
            ],
            'size': 19, 'mellan': 4,
            'figur_under': True, 'texthojd': 2.25,
            'figur': 'v43_03-b06-1.png',
            'alt': 'Grafiska symboler: motstånd (R), NO-kontakt (S, slutande), spänningsmätare, säkring (F), reläspole K1 och strömmätare.',
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Huvud- och styrström',
            'nyckel': 'Två scheman: kraftvägen och villkoren för manövern.',
            'punkter': [
                '**Huvudströmsschemat** visar kraftvägen till lasten.',
                '**Styrströmsschemat** visar villkoren för manövern.',
                'Figuren är kraftdelens förenklade funktionsschema. F1 ger kortslutningsskydd, K1 kopplar matningen '
                'och F2:s överlastfunktion ska bryta motorns manöver.',
            ],
            'size': 19, 'mellan': 4,
            'figur_under': True, 'texthojd': 2.45,
            'figur': 'v43_03-b07-1.png',
            'alt': 'Huvudströmsschema: L1–L3 genom säkringarna F1, kontaktorn K1 och överlastskyddet F2 till motorn M 3~.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Hållkretsens funktion',
            'nyckel': 'S0 i serie med (S1 parallellt med K1)',
            'punkter': [
                'S0 är STOPP (NC). S1 är START (NO). K1 har en NO-hållkontakt.',
                'K1-spolen matas när det finns en obruten väg från +12 V till 0 V.',
                'Figuren är en förenklad funktionsskiss i vila. K1:s spole och kontakt tillhör samma apparat.',
            ],
            'size': 19, 'mellan': 4,
            'figur_under': True, 'texthojd': 2.25,
            'figur': 'v43_03-b08-1.png',
            'alt': '+12 V – S0 STOPP (NC, sluten i vila) – S1 START (NO, öppen i vila) parallellt med K1:s hållkontakt '
                   '(NO, sluts när K1 drar) – spolen K1 – 0 V.',
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 1', 'rubrik': 'Exempel: hållkretsens start',
            'scenario': 'I en 12 V-hållkrets är STOPP (NC) sluten. START (NO) och K1:s NO-hållkontakt är öppna i vila.',
            'nyckel': 'K1 matas via STOPP och en av parallellvägarna.',
            'punkter': [
                '1. START trycks in och sluter vägen till K1-spolen.',
                '2. K1 drar.',
            ],
            'slutsats': 'Vad som händer när START släpps och när STOPP trycks utreds i övningarna. Vid strömavbrott släpper K1.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Kretsschema och förbindning',
            'nyckel': 'Funktion respektive fysisk förbindelse.',
            'punkter': [
                '**Kretsschemat** beskriver den elektriska funktionen.',
                '**Förbindningsschemat** visar anslutningarna mellan plintar och apparater.',
                'En felsökare behöver kunna gå från K1 i funktionen till rätt apparat och anslutning i verkligheten.',
            ],
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Mätpunkter och referens',
            'nyckel': 'Ett spänningsvärde kräver två definierade punkter.',
            'punkter': [
                'Ange driftläge och förväntat värde innan du kontrollerar.',
                'Vad bör en öppen kontakt visa i ditt driftläge? I en enkel aktiv DC-kedja kan ett avbrott ta hela spänningen.',
                'Tolka resultatet mot schemat och referenspunkten.',
            ],
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Dokumentets status',
            'nyckel': 'Aktuellt schema och faktisk anläggning ska stämma.',
            'punkter': [
                'Ritningsnummer, revision och datum visar vilket underlag som används.',
                'Ändringar behöver kunna följas från beslut till verifierad funktion.',
                'Inlämning 3 bygger på hållkretsen: nödstoppet, lampan, kretsens fem lägen och en felsökningsrad.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 3 · exempel 2', 'rubrik': 'Exempel: spänning över ett avbrott',
            'scenario': '9 V matar en ohmsk last via en öppen seriekontakt. Returen är hel och övriga ledningar är ideala.',
            # Hårda mellanslag (\u00a0) inom varje samband: raden bryts bara mellan sambanden.
            'nyckel': 'I\u00a0=\u00a00     U_{last}\u00a0=\u00a0R\u00a0·\u00a0I     U_{kontakt}\u00a0=\u00a09\u00a0V\u00a0−\u00a0U_{last}',
            'punkter': [
                '1. Den öppna kontakten hindrar strömmen: I = 0 A.',
                '2. U_{last} = R · 0 = 0 V, oavsett lastens ändliga\u00a0R.',
                '3. U_{kontakt} = 9 − 0 = 9 V.',
            ],
            'slutsats': 'Stor spänning över en kontakt kan tyda på avbrott.',
            'size': 18, 'nyckelstorlek': 22, 'mellan': 6,
            'figur': 'v43_03-b24-1.png',
            'alt': '9 V-krets med en öppen seriekontakt och en ohmsk last: 9 V över kontakten, 0 V över lasten och ingen ström.',
        }),
        ('ovningar', {
            'nummer': ['3.6', '3.7'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 3.8–3.10 gör du själv efter lektionen.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'En symbol visar funktion och en beteckning identifierar apparaten. Huvudströmsschemat visar kraftvägen, '
                'styrströmsschemat villkoren för manövern.',
                'I hållkretsen ligger STOPP (NC) i serie med två parallella vägar: START (NO) och K1:s hållkontakt (NO).',
                'Ett mätvärde gäller två punkter i ett driftläge. Kontrollera att schemat stämmer med anläggningen.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + ['Efter pausen 10.00: del 4, Systematisk felsökning.'],
            'not': VECKAN,
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 43, del 3 Elscheman och dokumentation', 'https://nj22az.github.io/sjoskolan/vecka-43/aktuell/Del_3.html'),
                ('Studieplanen YH03151, 18 september 2026', None),
                ('IEC 60617, grafiska symboler för elscheman (IEC)', 'https://webstore.iec.ch/en/publication/2723'),
                ('Fluke: multimeterns funktioner och mätning', 'https://dam-assets.fluke.com.cn/s3fs-public/2100079_6003_ENG_D_W.PDF'),
                ('Schneider Electric: samordning av skydd',
                 'https://www.electrical-installation.org/enwiki/Coordination_between_circuit-breakers'),
            ],
        }),
    ],
}
