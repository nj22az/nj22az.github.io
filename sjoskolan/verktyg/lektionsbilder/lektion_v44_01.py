"""Vecka 44, måndag 09.00–10.00: del 1 Lågspänningssystem (lektionsbildernas mall, se bygg.py och lektioner.py).

Teoribilderna har delsidans åtta avsnitt i samma ordning och med samma rubriker: inlämningens och övningarnas
hänvisningar (”Läs genomgången del 1, avsnitt 3: TN-system”, Isolationslabbets ”avsnitt 5: IT-system och övervakning”)
och teorikorten i placeringar/kurs-formelstod.json bygger på dem. Övning 1.1–1.5 görs tillsammans på delsidan (två bilder,
eftersom en övningsbild rymmer högst fyra övningar). Inga övningstexter, inga svar och inga tal ur inlämningen på bilderna.
"""

DELSIDA_URL = 'nj22az.github.io/sjoskolan/vecka-44/aktuell/Del_1.html'

# Läxorna efter lektionen (samma lista på bilden ”Det här gör du nu” och i dagens ruta på veckosidan).
# Adresserna gäller relativt veckosidan vecka-44/aktuell/.
HEMMA = [
    ('del-1', 'Läs del 1 på delsidan: teorin och de två exemplen. Tryck på ”Jag har läst del 1” längst ned på sidan.', 'Del_1.html', 'Öppna del 1'),
    ('ovn-1', 'Gör övning 1.6–1.10 på delsidan. Ledtrådar och facit finns där.', 'Del_1.html#v44_01-q6', 'Öppna övning 1.6'),
    ('film', 'Titta på filmen IT-nätet ombord: första och andra jordfelet.', '../../filmer/#it-nat', 'Öppna filmen'),
    ('labb', 'Gör Isolationslabbet: räkna-först-uppgifterna och protokollet. Spara protokollet som PDF.',
     '../../isolationslabbet/', 'Öppna labben'),
]

VECKAN = 'Inlämningen och analysen av mätdata senast fredag 30 oktober. Allt finns på veckosidan.'

LEKTION = {
    'id': 'v44_01',
    'fil': 'vecka-44/aktuell/v44_01_Lagspanningssystem_elev.pptx',
    'omslag': 'omslag_v44_01.jpg',
    'figurmapp': 'vecka-44/aktuell/figurer',
    'kicker': 'Vecka 44 · Måndag 26 oktober · 09.00–10.00',
    'titel': 'Lågspänningssystem',
    'underrubrik': 'TN, TT, IT och fördelning ombord',
    'etikett': 'Vecka 44 · Måndag · Lågspänningssystem',
    'del': 1, 'delar': 5,
    'delsida_url': DELSIDA_URL,
    'omrade': 'sakerhet',
    'mal': ['LM-2', 'LM-1'],
    'efter': [
        'förklara jordningssystemens grundprinciper och vad bokstäverna i TN, TT och IT betyder.',
        'förklara första och andra felet i ett IT-system.',
        'analysera spänningsfall och en förenklad felström.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv din gissning i chatten.'}),
        ('upplagg', [
            ('09.00', 'Start och startfråga'),
            ('09.05', 'Pass 1: Matning och jordningssystemen TN, TT och IT (avsnitt 1–6) och ett exempel'),
            ('09.25', 'Övning 1.1–1.5 tillsammans'),
            ('09.40', 'Pass 2: Felström och landanslutning (avsnitt 7–8) och ett exempel'),
            ('09.50', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Matning, jordning och skydd',
            'nyckel': 'TN, TT och IT beskriver relationen mellan källa, jord och utsatta delar.',
            'punkter': [
                '**Första bokstaven** gäller källan: T direkt jordad, I isolerad från jord. '
                '**Andra bokstaven** gäller de utsatta delarna: T egen jordning, N förbundna med källans jordade punkt.',
                'Ett enlinjeschema visar huvudvägar och systemgränser.',
                'N är neutralledare och PE skyddsledare. De har olika uppgifter.',
                'Z_{s} är felströmsslingans impedans. Dess belopp påverkar tillgänglig felström.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Matning och fördelning',
            'nyckel': 'Driftläge och matningsväg påverkar analysen.',
            'punkter': [
                'Ett enlinjeschema visar systemets huvudvägar.',
                'Källa, kopplingsapparater, skydd och laster bildar en kedja.',
                'Reservmatning kan ändra tillgänglig kortslutningsström.',
                'Skydden ska fungera även i de avsedda reservdriftfallen.',
            ],
            'figur_under': True, 'texthojd': 2.3, 'size': 19, 'mellan': 6,
            'figur': 'v44_01-b06-1.png',
            'alt': 'Enlinjeschema: källa, skydd, fördelning och last i en kedja, med mätpunkt A och B. '
                   'Driftläge och matningsväg avgör vilken väg energin tar.',
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'TN-system',
            'nyckel': 'Utsatta delar ansluts till källans jordade punkt.',
            'punkter': [
                'En punkt i källan är jordad. Förbindelsen går genom skyddsledarsystemet.',
                '**TN-S:** separat PE och N.',
                'Felströmsslingans impedans påverkar bortkopplingen.',
                'PE och N har olika funktion även om potentialerna kan vara nära.',
            ],
            'figur': 'v44_01-b07-1.png',
            'alt': 'TN-S-system: källan med L1, L2, L3, N och PE. Ett fel mellan L1 och höljet ger en felslinga via PE tillbaka till källan.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'TT-system',
            'nyckel': 'Jordfelsfunktionen är central i skyddet.',
            'punkter': [
                'Källans jordning och installationens jordtag är i princip åtskilda.',
                'Jordfelsslingan går genom jordningsvägarna.',
                'Jordtagsresistanser kan begränsa felströmmen så att överströmsskydd ensamt inte ger avsedd bortkoppling.',
                'TT-system är ovanliga ombord.',
            ],
            'size': 19,
            'figur': 'v44_01-b08-1.png',
            'alt': 'TT-system: källans systemjord och installationens eget jordtag. Felströmmen går genom jorden mellan jordtagen, '
                   'och jordtagens resistans kan begränsa den.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'IT-system och övervakning',
            'nyckel': 'Första isolationsfelet ska upptäckas och hanteras.',
            'punkter': [
                'Källan är isolerad från jord eller ansluten genom hög impedans.',
                'Utsatta delar har skyddsjordning eller motsvarande skyddsutjämning.',
                'Isolationsövervakningen ger information om försämrad isolation.',
                'Fortsatt drift är villkorad av systemets skydd och rutiner.',
            ],
            'size': 19,
            'figur': 'v44_01-b21-1.png',
            'alt': 'IT-system ombord: källan är isolerad från skrovet, och en isolationsvakt sitter mellan systemet och skrovet. '
                   'Första jordfelet ger liten ström och larm.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Första och andra felet',
            'nyckel': 'Driftkontinuitet kräver snabb felhantering.',
            'punkter': [
                'Ett första jordfel i ett korrekt utformat IT-system kan ge låg felström.',
                'Ett andra fel på annan aktiv ledare kan ge stor ström.',
                'Ett larm får inte ignoreras bara för att lasten fortfarande går.',
                'Kvarstående första fel försämrar marginalen inför nästa fel.',
            ],
            'size': 19,
            'figur': 'v44_01-b22-1.png',
            'alt': 'IT-system med ett andra jordfel på en annan fas: kortslutning mellan L1 och L2 via skrovet.',
        }),
        ('teori', {
            'etikett': 'Del 1 · exempel 1', 'rubrik': 'Exempel: systemets gräns',
            'scenario': 'Ett enlinjeschema visar en transformator mellan huvudnätet och ett separat styrnät.',
            'nyckel': 'Varje delnäts jordningssätt bedöms för sig.',
            'punkter': [
                '1. Identifiera sekundärsystemets källa och ledare.',
                '2. Kontrollera dess relation till jord samt skyddsförbindelser.',
                '3. Bestäm skydd och övervakning för just det delnätet.',
            ],
            'slutsats': 'Primärsidans jordningssystem bevisar inte hur sekundärsidan är uppbyggd.',
        }),
        ('ovningar', {
            'nummer': ['1.1', '1.2', '1.3'],
            'instruktion': 'Tre minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('ovningar', {
            'nummer': ['1.4', '1.5'],
            'instruktion': 'Tre minuter per övning. Skriv ditt svar i chatten. Övning 1.6–1.10 gör du själv efter lektionen.',
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Beräkning som stöd',
            'nyckel': 'I_{k} ≈ U_{0}/Z_{s}',
            'punkter': [
                'För en enkel DC-slinga gäller ΔU = I · R.',
                'En förenklad felströmsmodell använder hela slingimpedansen.',
                '230 V och Z_{s} = 0,32 Ω ger cirka 720 A.',
                'Verklig dimensionering kräver skyddsdata och fler villkor.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 1 · exempel 2', 'rubrik': 'Exempel: felström och impedans',
            'scenario': 'En förenklad felströmsslinga har U_{0} = 230 V och Z_{s} = 0,575 Ω.',
            'nyckel': 'I_{k} ≈ U_{0}/Z_{s}',
            'punkter': [
                '1. I_{k} ≈ 230/0,575 = 400 A.',
                '2. Om Z_{s} ökar till 2,3 Ω blir I_{k} ≈ 230/2,3 = 100 A.',
                '3. Jämför båda strömmarna med aktuellt skydds utlösningskurva.',
            ],
            'slutsats': 'Utlösningstid kan inte bestämmas utan skyddsdata. Modellen visar hur högre Z_{s} minskar felströmmen.',
            'size': 18, 'mellan': 6,
            'figur': 'v44_01-b24-1.png',
            'alt': 'Felström som funktion av slingimpedansen: 0,575 Ω ger 400 A och 2,3 Ω ger 100 A. Högre impedans ger lägre felström.',
        }),
        ('teori', {
            'avsnitt': 8, 'rubrik': 'Landanslutning ombord',
            'nyckel': 'Kontrollera fasföljd, spänning och frekvens före inkoppling.',
            'punkter': [
                # \u00a0 (hårt mellanslag) håller ihop ”kopplas in” och standardens beteckning vid radbrytning.
                'Landström är ofta 400 V/50 Hz, fartygets nät ofta 440 V/60 Hz. Spänning och frekvens måste passa innan laster kopplas\u00a0in.',
                'Skyddsjord och potentialutjämning ansluts först.',
                'Förregling mot generatordrift. Landnätets jordning kan skilja sig från fartygets.',
                'Landanslutning med högspänning: IEC/IEEE\u00a080005-1.',
            ],
            'size': 18, 'nyckelstorlek': 22, 'mellan': 6,
            'figur': 'v44_01-b35-1.png',
            'alt': 'Landanslutning: landström 400 V, 50 Hz går via anpassning av spänning och frekvens till huvudtavlan 440 V, 60 Hz. '
                   'Skyddsjord och potentialutjämning ansluts först. Förregling mot generatorerna.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'TN, TT och IT beskriver hur källan och de utsatta delarna är förbundna med jord.',
                'I ett IT-system ska det första isolationsfelet upptäckas och åtgärdas innan ett andra fel uppstår.',
                'Felströmmen kan uppskattas med I_{k} ≈ U_{0}/Z_{s}. Före landanslutning kontrolleras fasföljd, spänning och frekvens.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + ['Efter pausen 10.00: del 2, Högspänningssystem.'],
            'not': VECKAN,
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 44, del 1 Lågspänningssystem', 'https://nj22az.github.io/sjoskolan/vecka-44/aktuell/Del_1.html'),
                ('Studieplanen YH03151, 18 september 2026: Elteknik och ellära, lärandemål 1 och 2', None),
                ('Schneider Electric: TN, TT och IT', 'https://www.electrical-installation.org/enwiki/Characteristics_of_TT%2C_TN_and_IT_systems'),
                ('Schneider Electric: IT-systemets princip', 'https://www.electrical-installation.org/enwiki/IT_system_-_Principle'),
                ('Transportstyrelsen: Elinstallationer på fartyg – lagar, föreskrifter och standarder',
                 'https://www.transportstyrelsen.se/sv/sjofart/fartyg/utrustning-pa-fartyg/elinstallationer/lagar-foreskrifter-och-standarder/'),
            ],
        }),
    ],
}
