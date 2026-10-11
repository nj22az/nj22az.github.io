"""Vecka 43 fredag, andra timmen: del 4 Systematisk felsökning (mallen i bygg.py, reglerna i lektioner.py).

Filerna ligger kvar i vecka-45/ (delsidan vecka-45/aktuell/Del_1.html, övningarna heter 1.1–1.10), men delen undervisas i
vecka 43 som del 4 av 4: 'vecka': 43, 'del': 4. Läxornas adresser skrivs ../../vecka-45/aktuell/… så att de fungerar både
från veckosidan i vecka-43/ och från delsidan i vecka-45/.
Rubrikerna och ordningen är desamma som förut (teorikorten bygger på dem). Övning 1.1–1.5 görs tillsammans, efter
avsnitt 4 och efter avsnitt 7. Felsökningsrapporten (inlämning 3 i vecka-45/) har inga svar här.
"""

DELSIDA = 'nj22az.github.io/sjoskolan/vecka-45/aktuell/Del_1.html'
V45 = '../../vecka-45/aktuell/'

# Läxorna efter lektionen (samma lista på bilden ”Det här gör du nu” och på veckosidan).
HEMMA = [
    ('del-4', 'Läs del 4: teorin och de två exemplen. Tryck på ”Jag har läst del 4” längst ned på sidan.', V45 + 'Del_1.html', 'Öppna del 4'),
    ('ovn-4', 'Gör övning 1.6–1.10 på delsidan för del 4. Ledtrådar och facit finns där.', V45 + 'Del_1.html#v45_01-q6',
     'Öppna övning 1.6'),
    ('rapport', 'Skriv felsökningsrapporten, inlämning 4: felsök två felmoduler i Hållkretslabbet, en i taget. Lämna in de två '
                'felsökningsraderna ur protokollet.', '../../vecka-43/aktuell/Inlamning.html#uppgift-4', 'Öppna felsökningsrapporten'),
]
VECKAN = 'Inlämningen och felsökningsrapporten senast i dag, fredag 23 oktober. Allt finns på veckosidan.'

LEKTION = {
    'id': 'v45_01',
    'vecka': 43,
    'fil': 'vecka-45/aktuell/v45_01_Systematisk_felsokning_elev.pptx',
    'omslag': 'omslag_v45_01.jpg',
    'figurmapp': 'vecka-45/aktuell/figurer',
    'kicker': 'Vecka 43 · Fredag 23 oktober · 10.00–11.00',
    'titel': 'Systematisk felsökning',
    'underrubrik': 'Felbilder, halveringsmetod och skiljande kontroller',
    'etikett': 'Vecka 43 · Fredag · Systematisk felsökning',
    'del': 4, 'delar': 4,
    'delsida_url': DELSIDA,
    'omrade': 'felsokning',
    'mal': ['LM-5', 'LM-8', 'LM-7'],
    'efter': [
        'avgränsa ett felområde med schema och mätdata.',
        'välja en kontroll som skiljer två möjliga felorsaker.',
        'skilja observation från hypotes i en felsökningsrapport.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ett kort svar i chatten.'}),
        ('upplagg', [
            ('10.00', 'Start och startfråga'),
            ('10.05', 'Pass 2: Felsökningens metod och vanliga fel (avsnitt 1–7)'),
            ('10.20', 'Övning 1.1, 1.2 och 1.3 tillsammans, efter avsnitt 4'),
            ('10.40', 'Övning 1.4 och 1.5 tillsammans, efter avsnitt 7'),
            ('10.50', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Observation och prövbar hypotes',
            'nyckel': 'Skilj på det du har sett och det du tror är orsaken.',
            'punkter': [
                '**Observation:** ett beskrivet symtom eller ett mätvärde.',
                '**Hypotes:** en möjlig förklaring som ännu behöver prövas.',
                '**Skiljande kontroll:** ger olika resultat för olika orsaker.',
                '**Slutsats:** vad data stödjer och vilka frågor som återstår.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Felsökningens arbetsgång',
            'nyckel': 'Symtom, hypotes, kontroll, slutsats.',
            'punkter': [
                'Bekräfta symtomet och den förväntade funktionen.',
                'Avgränsa systemet innan du prövar möjliga orsaker.',
                'Skriv vad varje kontroll ska kunna bekräfta eller utesluta.',
                'Riskbedömning och arbetsmetod följer varje moment.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Funktionsuppdelning',
            'nyckel': 'Fungerande manöver bevisar inte fungerande kraftdel.',
            'punkter': [
                'Dela systemet i källa, matningsväg, skydd, styrning och last.',
                'Avgör vilka delar som redan har stöd av observationerna.',
                'En motor kan ha rätt startkommando men sakna en fas.',
                'Välj mätpunkten efter den funktion du prövar.',
            ],
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Halveringsmetoden',
            'nyckel': 'Mellanpunktens värde styr nästa delområde.',
            'punkter': [
                'En kontroll ungefär mitt i en kedja kan halvera sökområdet.',
                'Metoden fungerar när schemat och referenspunkten är kända.',
                'Finns rätt spänning vid mitten men inte vid lasten? Undersök då i första hand den senare delen av matningsvägen.',
            ],
            'size': 19,
            'figur': 'v45_01-b08-1.png',
            'alt': 'Matningskedja med mätpunkterna A till E mellan källa och last. Den första mätningen görs i mitten, vid C, '
                   'och avgör vilken halva som undersöks.',
        }),
        ('teori', {
            'etikett': 'Del 4 · exempel 1', 'rubrik': 'Exempel: observation och hypotes',
            'scenario': 'En 12 V-lampa lyser inte. Källan visar 12 V under provet, men lampan har 0 V mot hel retur.',
            'nyckel': 'Observationen används för att avgränsa sökområdet.',
            'punkter': [
                '1. **Observation:** normal källspänning men bortfall vid lasten.',
                '2. **Hypotes:** avbrott eller stort fall i matningsvägen.',
                '3. **Nästa kontroll:** en mellanpunkt, enligt en säker mätplan.',
            ],
            'slutsats': 'Det finns ännu inget bevis för en viss felkomponent. Mellanpunkten ska skilja två delområden åt.',
        }),
        ('ovningar', {
            'nummer': ['1.1', '1.2', '1.3'],
            'instruktion': 'Tre minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Avbrott och kortslutning',
            'nyckel': 'Spänningsbild och strömbild ska stämma ihop.',
            'punkter': [
                '**Avbrott:** hindrar ström i den berörda vägen. En öppen seriekontakt kan ha stor spänning över sig.',
                '**Kortslutning:** en oavsiktlig väg med låg impedans.',
                'Misstänker du kortslutning? Kontrollera skydden och skadestatus.',
            ],
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Glapp och förhöjd resistans',
            'nyckel': 'ΔU = I · R     P = I² · R',
            'punkter': [
                'Ett spänningsfall kan vara litet utan last men stort under last.',
                'Förhöjd kontaktresistans kan ge lokal värme.',
                'Exempel: 0,15 Ω vid 8 A ger 1,2 V fall och 9,6 W värme.',
                'I undervisningen används kontrollerade felmoduler, aldrig avsiktligt glapp.',
            ],
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'En skiljande kontroll',
            'nyckel': 'Två hypoteser ska ge olika förväntade kontrollresultat.',
            'punkter': [
                'Då ger kontrollen mer information än ett slumpmässigt mätvärde.',
                'Exempel: matningsbortfall eller avbrott i hållvägen.',
                'Välj en mätpunkt och ett driftläge där de två hypoteserna förutsäger olika värden.',
                'Skriv det förväntade värdet före mätningen.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 4 · exempel 2', 'rubrik': 'Exempel: förhöjd kontaktresistans',
            'scenario': 'Källan håller 12 V under last. Lasten får 10 V vid 2 A. Övriga fall försummas.',
            # Hårda mellanslag (\u00a0) inom varje samband: raden bryts bara mellan sambanden.
            'nyckel': 'R_{extra}\u00a0=\u00a0(U_{källa}\u00a0−\u00a0U_{last})/I     P\u00a0=\u00a0I²\u00a0·\u00a0R_{extra}',
            'punkter': [
                '1. ΔU = 12 − 10 = 2 V.',
                '2. R_{extra} = 2/2 = 1 Ω.',
                '3. P = 2² · 1 = 4 W i den extra resistansen.',
            ],
            'slutsats': 'Kontroll: ΔU · I = 2 · 2 = 4 W. Tomgång kan dölja fallet eftersom strömmen då är liten.',
            'size': 18, 'nyckelstorlek': 22, 'mellan': 6,
            'figur': 'v45_01-b24-1.png',
            'alt': '12 V-källa, en extra serieresistans på 1 Ω och en last med 10 V vid 2 A.',
        }),
        ('ovningar', {
            'nummer': ['1.4', '1.5'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 1.6–1.10 gör du själv efter lektionen.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'Skilj observation från hypotes. Varje kontroll ska kunna bekräfta eller utesluta något.',
                'Avgränsa felet: dela upp systemet i funktioner och mät ungefär mitt i kedjan.',
                'Välj en kontroll där hypoteserna ger olika resultat, och skriv det förväntade värdet innan du mäter.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + ['Nästa vecka: vecka 44, Elsystem och mätteknik. Måndag 26 oktober 09.00.'],
            'not': VECKAN,
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 43, del 4 Systematisk felsökning', 'https://nj22az.github.io/sjoskolan/vecka-45/aktuell/Del_1.html'),
                ('Studieplanen YH03151, 18 september 2026', None),
                ('Fluke: multimeterns funktioner och mätning', 'https://dam-assets.fluke.com.cn/s3fs-public/2100079_6003_ENG_D_W.PDF'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)',
                 'https://elstandard.se/documents/preview/3246401'),
                ('OpenStax: Kirchhoffs lagar', 'https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules'),
            ],
        }),
    ],
}
