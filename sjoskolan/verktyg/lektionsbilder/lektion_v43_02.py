"""Vecka 43, tisdag: Transformatorer och motorer (del 2 av 4). Läses av lektioner.py; mallen står i bygg.py.

Reglerna för texten står i lektioner.py. För den här lektionen:
- De sju teoribilderna har delsidans rubriker i samma ordning som den tidigare presentationen. Övningarnas teorikort
  (placeringar/kurs-formelstod.json) pekar på rubrikerna, och inlämningens hänvisningar på avsnittens nummer.
- Exemplen och teorins tal ger inte inlämning 1:s svar (fyrpolig motor, 400/690 V, 50 Hz, 1 440 r/min,
  (30 + D) Hz) eller övningarnas (2.1–2.6). Därför 60 Hz ombord, 440/110 V och en Δ/Y-motor på 690/1 200 V.
- Övning 2.1–2.5 bygger på avsnitt 2–4 (teorikorten). De görs i pass 1, var och en direkt efter sitt avsnitt och
  exempel. Pass 2 är start, omriktare och felsökning (avsnitt 5–7, övning 2.7, 2.8 och 2.10 hemma) och veckans labb.
- Efter lektionen läser eleven del 3 själv och gör Hållkretslabbets räkna-först-uppgifter, så labben visas här.
- Bilderna med figur ligger inte på bild 11 och 13: där finns de gamla övningsfigurerna v43_02-b11-1.png och
  b13-1.png, och delsidan tar en figurfil med bildens nummer före en med samma innehåll.
"""
import re

DELSIDA = 'nj22az.github.io/sjoskolan/vecka-43/aktuell/Del_2.html'

# Läxorna efter lektionen: (id, text, adress relativt veckosidan vecka-43/aktuell/, knapptext). Samma lista på bilden
# ”Det här gör du nu” och i dagens ruta på veckosidan (verktyg/veckosidor/dagsvy.py). Id som börjar med ovn- räknas som
# övning N.6–N.10 i lektionens egen del, därför heter övningarna i del 3 del3-ovn.
HEMMA = [
    ('del-2', 'Läs del 2: teorin och de två exemplen. Tryck på ”Jag har läst del 2” längst ned på sidan.', 'Del_2.html', 'Öppna del 2'),
    ('ovn-2', 'Gör övning 2.6–2.10 på delsidan. Ledtrådar och facit finns där.', 'Del_2.html#v43_02-q6', 'Öppna övning 2.6'),
    ('del-3', 'Läs del 3, Elscheman och dokumentation, på egen hand. Tryck på ”Jag har läst del 3” längst ned på sidan.', 'Del_3.html', 'Öppna del 3'),
    ('del3-ovn', 'Gör övning 3.1–3.5 i del 3.', 'Del_3.html#v43_03-q1', 'Öppna övning 3.1'),
    ('labb', 'Hållkretslabbet: gör de 8 räkna-först-uppgifterna.', '../../hallkretslabbet/', 'Öppna labben'),
]
# Det som gäller hela veckan (noten på bilden ”Det här gör du nu”).
VECKAN = 'Inlämningen och felsökningsrapporten senast fredag 23 oktober. Allt finns på veckosidan.'

LEKTION = {
    'id': 'v43_02',
    'fil': 'vecka-43/aktuell/v43_02_Transformatorer_och_motorer_elev.pptx',
    'omslag': 'omslag_v43_02.jpg',
    'figurmapp': 'vecka-43/aktuell/figurer',
    'kicker': 'Vecka 43 · Tisdag 20 oktober · 15.00–17.00',
    'titel': 'Transformatorer och motorer',
    'underrubrik': 'Asynkronmotor, startutrustning och frekvensomriktare',
    'etikett': 'Vecka 43 · Tisdag · Transformatorer och motorer',
    'del': 2, 'delar': 4,
    'delsida_url': DELSIDA,
    'omrade': 'komponenter',
    'mal': ['LM-1', 'LM-2'],
    'efter': [
        'använda transformatorns omsättning och motorns varvtalssamband.',
        'beskriva start och varvtalsreglering på funktionsnivå.',
        'förklara varför en frekvensomriktare kan vara farlig efter frånkoppling.',
    ],
    'bilder': [
        ('start', {'instruktion': 'Skriv en gissning i chatten med några ord.'}),
        ('upplagg', [
            ('15.00', 'Start och startfråga'),
            ('15.05', 'Pass 1: Transformatorn och motorns varvtal (avsnitt 1–4) och två exempel'),
            ('15.25', 'Övning 2.1–2.4 tillsammans'),
            ('15.50', 'Övning 2.5 tillsammans'),
            ('15.55', 'Paus'),
            ('16.05', 'Pass 2: Start, frekvensomriktare och felsökning (avsnitt 5–7)'),
            ('16.30', 'Veckans labb: Hållkretslabbet'),
            ('16.40', 'Avslutsfråga, sammanfattning och det här gör du nu'),
        ]),
        ('teori', {
            'avsnitt': 1, 'rubrik': 'Transformator och roterande maskin',
            'nyckel': 'Håll isär beteckningarna: N, n, n_{s}, p, s och η.',
            'punkter': [
                'Transformatorns N betyder antal lindningsvarv.',
                'Motorns n betyder varvtal i r/min. n_{s} gäller magnetfältet.',
                'p är antalet poler i formeln n_{s} = 120f/p.',
                's beskriver eftersläpning. η beskriver förhållandet mellan uteffekt och inmatning.',
            ],
        }),
        ('teori', {
            'avsnitt': 2, 'rubrik': 'Transformatorns omsättning',
            'nyckel': 'U_{1}/U_{2} = N_{1}/N_{2}',
            'punkter': [
                'En växlande magnetisk koppling överför energi mellan lindningarna.',
                'Den ideala modellen försummar förluster: U_{1} · I_{1} = U_{2} · I_{2}.',
                '440 V till 110 V ger omsättningen 4:1.',
                '2 A på sekundären motsvarar idealt 0,50 A på primären.',
            ],
            'size': 19, 'mellan': 8,
            'figur': 'v43_02-b06-1.png',
            'alt': 'Ideal transformator med en primär- och en sekundärlindning: 440 V på primärsidan och 110 V på sekundärsidan.',
        }),
        ('teori', {
            'etikett': 'Del 2 · exempel 1', 'rubrik': 'Exempel: ideal transformator',
            'scenario': 'Ideal styrtransformator till en kontaktors manöverkrets: U_{1} = 230 V RMS, N_{1} = 460 och N_{2} = 48 varv. '
                        'I_{2} = 2 A.',
            'nyckel': 'U_{2} = U_{1} · N_{2}/N_{1} och I_{1} = U_{2} · I_{2}/U_{1}',
            'punkter': [
                '1. U_{2} = 230 · 48/460 = 24 V.',
                '2. Sekundär skenbar effekt S_{2} = 24 · 2 = 48 VA.',
                '3. I_{1} = 48/230 ≈ 0,21 A.',
            ],
            'slutsats': 'Kontroll: 230 · 0,21 ≈ 24 · 2 = 48 VA. Modellen försummar magnetiseringsström och förluster.',
            'nyckelstorlek': 23,
        }),
        ('teori', {
            'avsnitt': 3, 'rubrik': 'Asynkronmotorns roterande fält',
            'nyckel': 'n_{s} = 120f/p',
            'punkter': [
                'Statorns trefasströmmar skapar ett roterande magnetfält.',
                'Fältets hastighet bestäms av frekvens och antal poler.',
                'Ombord: f = 60 Hz och fyra poler (p = 4) ger n_{s} = 1 800 r/min.',
                'Här är p antalet poler, inte antalet polpar.',
            ],
        }),
        ('ovningar', {
            'nummer': ['2.1', '2.2', '2.3', '2.4'],
            'instruktion': 'Fem minuter per övning. Skriv ditt svar i chatten. Ledtrådar och facit finns på delsidan.',
        }),
        ('teori', {
            'avsnitt': 4, 'rubrik': 'Eftersläpning',
            'nyckel': 's = (n_{s} − n)/n_{s}',
            'punkter': [
                'I motordrift roterar asynkronmotorns rotor långsammare än fältet.',
                'Skillnaden behövs för induktion och moment i den vanliga modellen.',
                'n_{s} = 1 800 och n = 1 746 r/min ger s = 0,03 = 3 %.',
                'Eftersläpningen varierar med belastningen.',
            ],
            'size': 19, 'mellan': 8,
            'figur': 'v43_02-b08-1.png',
            'alt': 'Stator med fyra poler vid 60 Hz. Fältet roterar med 1 800 r/min och rotorn med 1 746 r/min.',
        }),
        ('teori', {
            'etikett': 'Del 2 · exempel 2', 'rubrik': 'Exempel: varvtal och eftersläpning',
            'scenario': 'En åttapolig motor matas med 60 Hz. Rotorn går med 873 r/min.',
            'nyckel': 'n_{s} = 120f/p och s% = 100(n_{s} − n)/n_{s}',
            'punkter': [
                '1. n_{s} = 120 · 60/8 = 900 r/min.',
                '2. Skillnad = 900 − 873 = 27 r/min.',
                '3. s% = 100 · 27/900 = 3 %.',
            ],
            'slutsats': 'Rotorn går långsammare än fältet vid den angivna motordriften. p är åtta poler, inte fyra polpar.',
            'nyckelstorlek': 23,
        }),
        ('ovningar', {
            'nummer': ['2.5'],
            'instruktion': 'Fem minuter. Skriv ditt svar i chatten. Övning 2.6–2.10 gör du själv efter lektionen.',
        }),
        ('paus', {'text': 'Vi fortsätter 16.05'}),
        ('teori', {
            'avsnitt': 5, 'rubrik': 'Startutrustning',
            'nyckel': 'Märkning, startström och lastmoment avgör.',
            'punkter': [
                'Direktstart kopplar motorn till matningen genom en startapparat.',
                'Y/Δ-start förutsätter en motor och last som passar metoden.',
                'Ombord: en 690/1 200 V Δ/Y-motor kan vara kandidat för Y/Δ-start vid 690 V.',
                'Y-start minskar också tillgängligt startmoment.',
            ],
            'size': 19, 'mellan': 8,
            'figur': 'v43_02-b21-1.png',
            'alt': 'Principskiss av startström över tid för direktstart och för Y/Δ-start med omkoppling.',
        }),
        ('teori', {
            'avsnitt': 6, 'rubrik': 'Frekvensomriktarens delar',
            'nyckel': 'Nät-AC, mellanleds-DC, reglerad motorutgång',
            'punkter': [
                'En vanlig omriktare har likriktare, DC-mellanled och växelriktare.',
                'Utgångens frekvens och spänning styr motorns drift.',
                'Utspänningen är ofta pulsformad. Mätmetod och instrument måste vara avsedda för omriktardrift.',
            ],
            'size': 19, 'mellan': 8, 'nyckelstorlek': 23,
            'figur': 'v43_02-b22-1.png',
            'alt': 'Frekvensomriktare: likriktare, DC-mellanled med lagrad energi och växelriktare med pulsad utgång.',
        }),
        ('teori', {
            'avsnitt': 7, 'rubrik': 'Felsökning i motordriften',
            'nyckel': 'Återställning kräver klarlagd orsak.',
            'punkter': [
                'Skilj kommando, matning, skyddstillstånd och mekanisk last.',
                'Ett larm är information som ska tolkas tillsammans med driftdata.',
                'Vid ett 440 V-nät ligger mellanledet på ca 620 V DC. Det kan vara laddat efter frånkoppling.',
                'Följ omriktarens säkerhetsanvisning: frånskilj alla energikällor, följ väntetiden och verifiera samtliga '
                'föreskrivna mätpunkter. Enbart DC+–DC− räcker inte.',
            ],
        }),
        ('labb', {
            'namn': 'Hållkretslabbet: Räkna först',
            'steg': [
                'Läs del 3 och gör övning 3.1–3.5 först. Labben bygger på hållkretsen i del 3.',
                'Öppna Hållkretslabbet och gör de 8 uppgifterna under Räkna först: förutsäg, läs av och jämför, förklara.',
                'Uppgifterna ingår i inlämning 3, Hållkretsen med nödstopp.',
            ],
            'url': 'nj22az.github.io/sjoskolan/hallkretslabbet/',
        }),
        ('avslut', None),
        ('lista', {
            'rubrik': 'Sammanfattning',
            'punkter': [
                'Transformatorn: U_{1}/U_{2} = N_{1}/N_{2}. I den ideala modellen är effekten lika stor på båda sidor.',
                'Motorn: fältet roterar med n_{s} = 120f/p, och rotorn går något långsammare. Skillnaden är eftersläpningen.',
                'Frekvensomriktarens DC-mellanled kan vara laddat efter frånkoppling. Följ säkerhetsanvisningen.',
            ],
        }),
        ('lista', {
            'rubrik': 'Det här gör du nu',
            'punkter': [h[1] for h in HEMMA] + [
                'Fredag 09.00: frågor om del 3 och del 4, Systematisk felsökning.',
            ],
            'not': VECKAN,
            'size': 20,
        }),
        ('kallor', {
            'kallor': [
                ('Sjöskolan: vecka 43, del 2 Transformatorer och motorer', 'https://nj22az.github.io/sjoskolan/vecka-43/aktuell/Del_2.html'),
                ('Sjöskolan: Motorlabbet, repetera motorn i plinten från vecka 41', 'https://nj22az.github.io/sjoskolan/motorlabbet/'),
                ('Kursplanen för Elteknik och ellära, lärandemål 1 och 2', None),
                ('ABB: asynkronmotor och frekvensomriktare (ACS580, teknisk e-bok)',
                 'https://library.e.abb.com/public/e670a466d31e469a80e653b759f40091/ACS580_technical_eBook_3AUA0000197173 RevB_EN.pdf'),
                ('ABB: motorns märkning och Y/Δ', 'https://library.e.abb.com/public/85bb7f53868f4d549e537374c191838b/EN_ACS260-04_B_A4.pdf'),
                ('Schneider Electric: skenbar effekt, verkningsgrad och effektfaktor (PF)',
                 'https://www.electrical-installation.org/enwiki/Installed_apparent_power_%28kVA%29'),
            ],
        }),
    ],
}


def _hart(text):
    """Hårt mellanslag i tusental, mellan tal och enhet och runt likhetstecken (1 800 r/min, 0,50 A), så att raden inte
    bryts mitt i ett värde. Samma regel som verktyg/figurer/insert.py. Delsidan läser hårda mellanslag som vanliga."""
    text = re.sub(r'(?<=\d) (?=\d{3}(?!\d))', ' ', text)
    text = re.sub(r'(?<=\d) (?=(?:%|mA|kA|A|V|Hz|r/min|VA|kW|W)(?![\wåäöÅÄÖ]))', ' ', text)
    return text.replace(' = ', ' = ')


for _typ, _b in LEKTION['bilder']:
    if _typ == 'teori':
        for _k in ('nyckel', 'scenario', 'slutsats'):
            if _b.get(_k):
                _b[_k] = _hart(_b[_k])
        _b['punkter'] = [_hart(p) for p in _b.get('punkter', [])]
