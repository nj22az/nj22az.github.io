"""Lektionsbilderna för fredag i vecka 44: del 5 av 5, Repetition inför tentamen (mallen i bygg.py, reglerna i lektioner.py).

Filerna ligger i vecka-45/ (del 3 i mappen, övning 3.1–3.10), men delen undervisas i vecka 44 som del 5 av 5 (FLYTTAD i
innehall/export/delsidor_veckor.py). Därför 'vecka': 44 och 'del': 5, och läxornas adresser skrivs ../../vecka-45/aktuell/…
så att de fungerar både från veckosidan i vecka-44/ och från delsidan i vecka-45/.

Teoribilderna har delsidans avsnitt i samma ordning och med samma rubriker: övningarnas teorikort pekar på avsnitt 2–6.
Avsnitt 8 är nytt: så går tentamensveckan till, med uppgifterna ur tentamen.html, praktiskt-prov.html och
verktyg/veckosidor/bygg.py VECKOR[45]. Övningstentans lösningar finns i den separata PDF:en ”Facit med lösningsgång”, länkad från tentamen.html#ovningstenta.
"""

DELSIDA = '../../vecka-45/aktuell/Del_3.html'


def bunden(text):
    """~ blir hårt mellanslag: ett tal och dess enhet (och en uträkning) bryts inte mellan två rader på bilden.
    Delsidan läser hårda mellanslag som vanliga."""
    return text.replace('~', '\u00a0')


# Läxorna efter lektionen (samma lista på bilden ”Det här gör du nu” och i dagens ruta på veckosidan).
HEMMA = [
    ('del-5', 'Läs del 5: teorin och de två exemplen. Tryck på ”Jag har läst del 5” längst ned på sidan.', DELSIDA, 'Öppna del 5'),
    ('ovn-5', 'Gör övning 3.6–3.10 på delsidan för del 5. Ledtrådar och facit finns där.', DELSIDA + '#v45_03-q6', 'Öppna övning 3.6'),
    ('tenta', 'Rätta övningstentan och gör om övningarna i de veckor där du hade fel.', '../../tentamen.html#ovningstenta',
     'Öppna övningstentan'),
]

LEKTION = {
    'id': 'v45_03',
    'fil': 'vecka-45/aktuell/v45_03_Repetition_infor_tentamen_elev.pptx',
    'omslag': 'omslag_v45_03.jpg',
    'figurmapp': 'vecka-45/aktuell/figurer',
    'vecka': 44,
    'kicker': 'Vecka 44 · Fredag 30 oktober · 09.00–11.00',
    'titel': 'Repetition inför tentamen',
    'underrubrik': 'Blandade uppgifter från hela kursen och så går tentamensveckan till',
    'etikett': 'Vecka 44 · Fredag · Repetition inför tentamen',
    'del': 5, 'delar': 5,
    'delsida_url': 'nj22az.github.io/sjoskolan/vecka-45/aktuell/Del_3.html',
    'omrade': 'matning',
    'mal': ['LM-4', 'LM-3', 'LM-8'],
    'efter': [
        'välja rätt samband och redovisa beräkningar tydligt.',
        'motivera instrumentval, regelval och felsökningsbeslut.',
        'säga hur tentamensveckan går till och vad du behöver repetera.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ditt område i chatten.'}),
        ('upplagg', [
            ('09.00', 'Start och startfråga'),
            ('09.05', 'Pass 1: Likström, Kirchhoff, växelström och trefas (avsnitt 1–4) och ett exempel'),
            ('09.30', 'Övning 3.1–3.5 tillsammans'),
            ('09.50', 'Paus'),
            ('10.00', 'Pass 2: Säkerhet, mätning och felsökning, redovisning och tentamensveckan (avsnitt 5–8) och ett exempel'),
            ('10.25', 'Övningstentan: vi går igenom de uppgifter som flest behöver'),
            ('10.45', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Storheten avgör formelvalet',
            'nyckel': 'Varje samband gäller under vissa villkor.',
            'punkter': [
                'DC-ström beräknas med I = U/R när kretsen är ohmsk.',
                'Energi kräver effekt och tid. Verkningsgrad kan behövas före energiberäkningen.',
                'AC kräver kontroll av vågform och RMS. Trefas kräver tydliga linjevärden.',
                'Mät- och säkerhetsfall behöver dokumenterade villkor, inte bara ett tal.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Likström och effekt',
            'nyckel': 'U = RI     P = UI     E = Pt',
            'punkter': [
                'Skriv först vilken storhet som söks.',
                'Använd ett samband som passar kretsens koppling.',
                '**Serie:** samma ström. **Parallell:** samma spänning.',
                'Enheter och rimlighetskontroll ingår i redovisningen.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Kirchhoff och delare',
            'nyckel': 'ΣI = 0     ΣΔU = 0',
            'punkter': [
                '**Nodlagen** beskriver strömbalans. **Slinglagen** beskriver spänningsbalans.',
                'En ansluten last ändrar en spänningsdelare.',
                'En negativ ström är ett tecken på riktning relativt din pil. Det är inte automatiskt ett räknefel.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 5 · exempel 1', 'rubrik': 'Exempel: metodval i en delare',
            'scenario': '18 V matar 2 kΩ och 2 kΩ i serie. En last på 2 kΩ ansluts över den nedre resistorn.',
            'nyckel': 'U_{ut} = U_{in} · R_{p}/(R_{1} + R_{p})',
            'punkter': [bunden(t) for t in (
                '1. R_{p} = R_{2} · R_{last}/(R_{2} + R_{last}) =~2~·~2/(2~+~2)~=~1~kΩ.',
                '2. U_{ut} = 18 · 1/(2 + 1) = 6~V.',
                '3. I_{tot} = 18/(2 + 1) = 6~mA. Varje nedre gren får 3~mA.',
            )],
            'slutsats': bunden('Kontroll: 3 + 3 = 6~mA, och fallet över den övre resistorn är 12~V. 12 + 6 = 18~V.'),
            'size': 18, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v45_03-b09-1.png',
            'alt': 'Spänningsdelare: 18 V matar 2 kilohm och 2 kilohm i serie. En last på 2 kilohm ligger parallellt med den '
                   'nedre resistorn. Utspänningen är 6 V.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'AC och trefas',
            'nyckel': '|Z| = √(R² + X²)     P = √3 · U_{L} · I_{L} · PF',
            'punkter': [
                'RMS, toppvärde och medelvärde beskriver olika saker.',
                'Trefasformeln med √3 förutsätter de angivna symmetrivillkoren.',
                'Skriv om spänningen är linje-, fas- eller grenspänning.',
                'Skilj aktiv effekt från skenbar effekt.',
            ],
        }),
        ('ovningar', {
            'nummer': ['3.1', '3.2', '3.3'],
            'instruktion': 'Fyra minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('ovningar', {
            'nummer': ['3.4', '3.5'],
            'instruktion': 'Fyra minuter per övning. Skriv ditt svar i chatten. Övning 3.6–3.10 gör du själv efter lektionen.',
        }),
        ('paus', {'text': 'Vi fortsätter 10.00'}),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Säkerhet och regelval',
            'nyckel': 'Riskbedömning ska leda till verifierbara åtgärder.',
            'punkter': [
                'Utgå från arbetsmoment, system och energikällor.',
                'Kontrollera vilket regelverk som gäller i det angivna fallet.',
                'Skydd, kompetens och tydlig ansvarsfördelning hänger ihop.',
                'Ett allmänt standardnamn räcker inte som motivering.',
            ],
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Mätning och felsökning',
            'nyckel': 'Observation skiljs från hypotes och slutsats.',
            'punkter': [
                'Välj mätpunkt och driftläge för att pröva en hypotes.',
                'Bedöm resultatet med instrumentdata och kretsens funktion.',
                'Ett högt spänningsfall kan lokalisera förhöjd resistans.',
                'Skriv vad mätningen visar och vad som återstår.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 5 · exempel 2', 'rubrik': 'Exempel: mätning efter åtgärd',
            'scenario': 'Källan håller 12 V. Vid 3 A får lasten 10,5 V före och 11,85 V efter åtgärd (strömmen antas oförändrad).',
            'nyckel': 'R_{slinga} = (U_{källa} − U_{last})/I',
            'punkter': [
                '1. Före: R_{slinga} = (12 − 10,5)/3 = 0,50 Ω.',
                '2. Efter: R_{slinga} = (12 − 11,85)/3 = 0,05 Ω.',
                '3. Samma ström och mätpunkter visar tydligt minskad resistans.',
            ],
            'slutsats': 'Funktionsdata stödjer förbättringen. Föreskrivna anslutnings- och säkerhetskontroller ska också dokumenteras.',
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Redovisning inför examination',
            'nyckel': 'En bra lösning visar samband, insättning, enhet och tolkning.',
            'punkter': [
                'Öppna fall kräver motiverade beslut med tydliga antaganden.',
                'Den här delen är repetition. Den ordinarie tentamen är i vecka 45.',
                'De praktiska lärandemålen bedöms i det praktiska provet.',
            ],
        }),
        ('teori', {
            'avsnitt': 8, 'rubrik': 'Så går tentamensveckan till',
            'nyckel': 'Skriftlig tentamen online och praktiskt prov i simulatorerna.',
            'punkter': [
                '**Måndag 2 november 09.00–11.00, online:** frågestund och instruktion till det praktiska provet. '
                'Boka tid för den muntliga avstämningen.',
                '**Måndag–onsdag:** gör de tre stationerna med protokoll och en riskbedömning. '
                'Skicka dem senast onsdag 4 november kl. 20.00.',
                '**Torsdag eller fredag:** muntlig avstämning online i 15 minuter.',
                '**Skriftlig tentamen:** dag, tid, länk och tillåtna hjälpmedel meddelas av läraren. '
                'Räkna med räknare och formelsamlingen.',
            ],
        }),
        ('lista', {
            # Rubriken börjar som lektionsbilden Övningar tillsammans, så att delsidan inte läser den som teori.
            'rubrik': 'Övningar tillsammans: övningstentan',
            'punkter': [
                'Öppna sidan Tentamen och gå till Övningstenta. Där finns tolv uppgifter från hela kursen.',
                'Skriv i chatten numren på de uppgifter du vill gå igenom.',
                'Vi går igenom metoden. Räkna först själv. Rätta sedan med ”Facit med lösningsgång” (PDF) i samma avsnitt.',
            ],
            'not': 'nj22az.github.io/sjoskolan/tentamen.html#ovningstenta',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'Storheten och kretsen avgör sambandet. Redovisa samband, insättning, enhet och tolkning.',
                'Säkerhet: utgå från arbetsmoment, energikällor och regelverk. Felsökning: skilj observation, hypotes och slutsats.',
                'Tentamensveckan: skriftlig tentamen online, tre stationer i simulatorerna och en muntlig avstämning på 15 minuter.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + [
                'Nästa vecka: tentamensveckan. Måndag 2 november 09.00: frågestund och instruktion till det praktiska provet.',
            ],
            'not': 'Inlämningen, uppgift 1–4, senast i dag, fredag 30 oktober. Allt finns på veckosidan.',
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 44, del 5 Repetition inför tentamen', 'https://nj22az.github.io/sjoskolan/vecka-45/aktuell/Del_3.html'),
                ('Sjöskolan: Tentamen och övningstenta', 'https://nj22az.github.io/sjoskolan/tentamen.html'),
                ('Sjöskolan: Praktiskt prov', 'https://nj22az.github.io/sjoskolan/praktiskt-prov.html'),
                ('Kursplanen för Elteknik och ellära (studieplanen YH03151, 18 september 2026)', None),
                ('OpenStax: Kirchhoffs lagar', 'https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules'),
                ('OpenStax: enkla växelströmskretsar', 'https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits'),
                ('Schneider Electric: skenbar effekt', 'https://www.electrical-installation.org/enwiki/Installed_apparent_power_%28kVA%29'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)',
                 'https://elstandard.se/documents/preview/3246401'),
            ],
        }),
    ],
}
