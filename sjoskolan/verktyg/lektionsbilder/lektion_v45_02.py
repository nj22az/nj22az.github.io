"""Vecka 44 tisdag, andra timmen: Analys av mätresultat (del 4 av 5). Mallen och reglerna: bygg.py och lektioner.py.

Filerna ligger i vecka-45/ (delsidan Del_2.html, övning 2.1–2.10), men delen undervisas i vecka 44 som del 4. Därför
'vecka': 44 och 'del': 4, och läxornas adresser skrivs ../../vecka-NN/aktuell/… så att de fungerar från båda mapparna.
En entimmeslektion: alla sju teoriavsnitt och båda exemplen står kvar (delsidan läses ur bilderna), en bild med övningar
tillsammans och ingen paus. Inga övningstexter eller svar på bilderna och inga tal ur analysen av mätdata (pumpen,
24,1 V, 6,0 A och 6,4 A, voltmeterns ±(0,5 % + 2 siffror)).
"""

V45 = '../../vecka-45/aktuell/'

HEMMA = [
    ('del-4', 'Läs del 4: alla sju avsnitt och de två exemplen.', V45 + 'Del_2.html', 'Öppna del 4'),
    ('ovn-4', 'Gör övning 2.4–2.6 på delsidan för del 4. Ledtrådar och facit finns där.', V45 + 'Del_2.html#v45_02-q4', 'Öppna övning 2.4'),
    ('inl', 'Gör inlämning 1–3 på veckans inlämningssida.', '../../vecka-44/aktuell/Inlamning.html', 'Öppna inlämningen'),
    ('analys', 'Gör analysen av mätdata. Den bygger på del 3 och 4.', V45 + 'Inlamning.html#uppgift-1', 'Öppna analysen'),
    ('tenta', 'Gör övningstentan utan att titta i lösningarna.', '../../tentamen.html#ovningstenta', 'Öppna övningstentan'),
]

LEKTION = {
    'id': 'v45_02',
    'fil': 'vecka-45/aktuell/v45_02_Analys_av_matresultat_elev.pptx',
    'omslag': 'omslag_v45_02.jpg',
    'figurmapp': 'vecka-45/aktuell/figurer',
    'kicker': 'Vecka 44 · Tisdag 27 oktober · 16.00–17.00',
    'titel': 'Analys av mätresultat',
    'underrubrik': 'Felorsak, åtgärd och kvalitetssäkring',
    'etikett': 'Vecka 44 · Tisdag · Analys av mätresultat',
    'vecka': 44, 'del': 4, 'delar': 5,
    'delsida_url': 'nj22az.github.io/sjoskolan/vecka-45/aktuell/Del_2.html',
    'omrade': 'matning',
    'mal': ['LM-8', 'LM-7', 'LM-5'],
    'efter': [
        'avgöra om ett mätintervall ligger inom ett krav.',
        'värdera hur starkt mätdata stödjer en felhypotes.',
        'skriva en rapport som visar kontrollkedjan och kvarstående osäkerhet.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv ditt svar i chatten, i en mening.'}),
        ('upplagg', [
            ('16.00', 'Start och startfråga'),
            ('16.05', 'Pass 1: Mätvärde, krav och hypoteser (avsnitt 1–4) och ett exempel'),
            ('16.25', 'Övning 2.1–2.3 tillsammans på delsidan för del 4'),
            ('16.40', 'Pass 2: Åtgärd, protokoll och återgång (avsnitt 5–7) och ett exempel'),
            ('16.55', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Mätvärde, intervall och slutsats',
            'nyckel': 'Slutsatsen bygger på intervallet, inte bara på talet.',
            'punkter': [
                'Ett mätvärde gäller vissa punkter vid ett bestämt driftläge.',
                'Felgränsen bildar ett intervall kring avläsningen.',
                'Kravet säger vilka värden som är tillåtna. Det kallas toleransintervall.',
                'Beslutsregeln i kursen: hela mätintervallet måste ligga inom kravet.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Mätdata och slutsats',
            'nyckel': '”24 V vid A” bevisar inte ”hela matningen är felfri”.',
            'punkter': [
                'En mätning gäller vissa punkter vid ett visst driftläge.',
                'Slutsatsen får inte vara mer omfattande än underlaget.',
                'Lastström, referens, tidsförlopp och instrumentdata avgör hur resultatet kan användas.',
            ],
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Jämförelse med ett krav',
            'nyckel': 'Mätintervall och toleransintervall',
            'punkter': [
                'Jämför resultatets intervall med det angivna kravet.',
                'Redovisa hur osäkerhet eller felgräns påverkar beslutet.',
                'Krav 23,0–25,0 V, mätning 24,90 ±0,15 V: intervallet 24,75–25,05 V går över kravets övre gräns, så '
                'överensstämmelse kan inte visas.',
            ],
            'size': 19, 'nyckelstorlek': 23, 'mellan': 8,
            'figur': 'v45_02-b07-1.png',
            'alt': 'Kravet 23,00–25,00 V och mätintervallet 24,75–25,05 V. Mätintervallet går över kravets övre gräns.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Flera observationer tillsammans',
            'nyckel': 'Hypoteser jämförs mot alla relevanta data.',
            'punkter': [
                'Oberoende kontroller kan stärka eller försvaga samma hypotes.',
                'En annan felorsak kan ge ett liknande symtom.',
                'Pröva varje hypotes mot alla mätvärden, inte bara mot det första symtomet.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 4 · exempel 1', 'rubrik': 'Exempel: ett mätintervall mot krav',
            'scenario': 'Krav 20,0 V ±2 %. Mätning 19,80 V ±0,15 V. Hela mätintervallet måste ligga inom kravet.',
            # Hårda mellanslag (\u00a0) håller ihop en formel när raden bryts.
            'nyckel': 'Krav = 20,0 · (1 ± 0,02); mätintervall\u00a0=\u00a019,80\u00a0±0,15',
            'punkter': [
                '1. Krav: 19,60–20,40 V.',
                '2. Mätintervall: 19,65–19,95 V.',
                '3. Hela mätintervallet ligger inom kravet: överensstämmelse visad.',
            ],
            'slutsats': 'Med större felgräns eller en annan beslutsregel kan slutsatsen bli en\u00a0annan.',
            'size': 19, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v45_02-b09-1.png',
            'alt': 'Kravet 19,60–20,40 V och mätintervallet 19,65–19,95 V. Hela mätintervallet ligger inom kravet.',
        }),
        ('ovningar', {
            'nummer': ['2.1', '2.2', '2.3'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Övning 2.4–2.6 gör du själv efter lektionen.',
        }),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Åtgärd och rotorsak',
            'nyckel': 'Skada, orsak, åtgärd och förebyggande kontroll.',
            'punkter': [
                'En utbytt komponent kan återställa funktionen tillfälligt.',
                'Bakomliggande orsak kan finnas kvar.',
                'En bränd anslutning kan kräva utredning av belastning, kontaktförhållanden och föreskriven montering.',
            ],
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Kontrollprotokollets innehåll',
            'nyckel': 'Varje slutsats ska kunna följas tillbaka till data.',
            'punkter': [
                'Ange objekt, revision, mätpunkter, driftläge och instrument.',
                'Redovisa förväntat värde, uppmätt värde och bedömning.',
                'Dokumentera avvikelser och vem som fattat beslut om återgång eller fortsatt utredning.',
            ],
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Kvalitetssäkrad återgång',
            'nyckel': 'Funktionsprov, säkerhetskontroll och återlämning.',
            'punkter': [
                'Kontrollera att felet är åtgärdat i det relevanta driftfallet.',
                'Skydd och normal dokumentation ska vara återställda.',
                'Ombord: avsluta arbetstillstånd och LOTO (låsning och märkning), kontrollera isolationsvaktens värde, informera '
                'vakthavande och bryggan, för in åtgärden i maskindagbok och underhållssystem.',
            ],
        }),
        ('teori', {
            'etikett': 'Del 4 · exempel 2', 'rubrik': 'Exempel: fram- och returväg',
            'scenario': 'Källa 12 V, last 9 V och ström 1,5 A. Returens fall är 0,9 V. Samtidiga data.',
            'nyckel': 'ΔU_{fram} = U_{källa} − U_{last} − ΔU_{retur}; R = ΔU/I',
            'punkter': [
                '1. Totalt fall = 12 − 9 = 3 V.',
                '2. Framfall = 3 − 0,9 = 2,1 V. R_{fram}\u00a0=\u00a02,1/1,5\u00a0=\u00a01,4\u00a0Ω.',
                '3. R_{retur} = 0,9/1,5 = 0,6 Ω.',
            ],
            'slutsats': 'Kontroll: (1,4 + 0,6) Ω · 1,5 A = 3 V. Beräkningen lokaliserar fall till två delar.',
            'size': 19, 'nyckelstorlek': 21, 'mellan': 6,
            'figur': 'v45_02-b24-1.png',
            'alt': 'Seriekrets: källan 12 V, lasten 9 V och strömmen 1,5 A. Framledningen tappar 2,1 V och returen 0,9 V.',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'En slutsats gäller bara de punkter och det driftläge som är mätta. Hela mätintervallet ska ligga inom kravet.',
                'Pröva varje hypotes mot alla mätvärden. Ett byte kan återställa funktionen medan orsaken finns kvar.',
                'Protokollet binder varje slutsats till data. Återgången kräver funktionsprov, säkerhetskontroll och återlämning.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + [
                'Fredag 09.00: del 5, Repetition inför tentamen.',
            ],
            'not': 'Inlämningen och analysen av mätdata senast fredag 30 oktober. Allt finns på veckosidan.',
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 44, del 4 Analys av mätresultat', 'https://nj22az.github.io/sjoskolan/vecka-45/aktuell/Del_2.html'),
                ('Kursplanen för Elteknik och ellära, lärandemål 5, 7 och 8', None),
                ('Sjöskolan: elevprotokoll med kolumner för plan, mätning och analys',
                 'https://nj22az.github.io/sjoskolan/vecka-41/aktuell/Elevprotokoll.html'),
                ('Fluke: multimeterns funktioner och mätning', 'https://dam-assets.fluke.com.cn/s3fs-public/2100079_6003_ENG_D_W.PDF'),
                ('SS-EN 50110-1 utgåva 4:2024, Skötsel av elektriska anläggningar (SEK Svensk Elstandard)',
                 'https://elstandard.se/documents/preview/3246401'),
                ('OpenStax: Kirchhoffs lagar', 'https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules'),
            ],
        }),
    ],
}
