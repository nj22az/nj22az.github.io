# Sjöskolan · designsystem

Ett gemensamt designsystem för kursens webbsidor, simulatorer, protokoll och presentationer. Det bygger på Sjöskolans befintliga färger och typsnitt och hämtar struktur från tre referenser:

| Referens | Används för | Det vi tar |
|---|---|---|
| Digital Agency Japan (DADS) | startsida, veckosidor, navigation | tydlig rubrikhierarki, en tydlig huvudåtgärd, numrerade steg, informationspaneler, synligt tangentbordsfokus, 17 px brödtext, minsta textstorlek 14 px, 44 px tryckyta |
| Zenn | genomgångar och räkneexempel | lugn läsbredd, luftigt radavstånd, tydlig skillnad mellan rubrik, förklaring och stödmaterial |
| SmartHR | simulatorernas reglage, labbprotokoll och mätvärden | grupperade reglage med etiketter, tydliga inmatningsfält och knappar, strukturerade tabeller, synligt läge för uppgiften |

Referenserna är sammanställningar i [awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp), inte officiell dokumentation från företagen. För DADS komponenter är [den japanska digitaliseringsmyndighetens designsystem](https://design.digital.go.jp/dads/) den bättre källan. Japanska typsnitt och radbrytningsregler används inte; svensk text och teknisk notation styr typografin.

## Vad sidan ska svara på

Varje sida bedöms efter om eleven snabbt kan se:

1. Vad lär jag mig?
2. Vad behöver jag förstå innan jag börjar?
3. Vilket instrument eller vilken koppling tittar jag på?
4. Vad gör jag nu?
5. Vad ska jag anteckna och förklara?

## Grundvärden

Implementeras i `gemensamt/sjoskolan.css`.

### Färger

| Token | Värde | Används till |
|---|---|---|
| `--sj-blue` | `#064f91` | huvudknappar, länkar, aktivt steg |
| `--sj-blue-dark` | `#053f74` | hovring och tryck på huvudknapp |
| `--sj-ink` | `#163248` | brödtext och rubriker |
| `--sj-muted` | `#4d6579` | stödtext, etiketter |
| `--sj-line` | `#cad8e2` | ramar och avdelare |
| `--sj-soft` | `#edf4f9` | paneler, tabellhuvud |
| `--sj-paper` | `#ffffff` | sidor och kort |
| `--sj-page` | `#f4f7fa` | bakgrund bakom kort i labbarna |
| `--sj-ok` | `#176844` | rätt, klart |
| `--sj-warn` | `#9a4a12` | varning, saknas |
| `--sj-danger` | `#b8323c` | fel, fara |
| `--sj-focus` | `#ffd43d` | fokusring (DADS) |

Röd används bara för det som söks eller är fel. Orange för fara och felström. Färg är aldrig enda bäraren av information: skriv också ut läget i text.

### Typografi

Arial, Helvetica, sans-serif. Brödtext 17 px med radavstånd 1,65. Minsta textstorlek 14 px. Ingen spärrning i brödtext.

| Nivå | Storlek | Vikt | Radavstånd |
|---|---|---|---|
| Sidrubrik (h1) | 36–44 px | 700 | 1,15 |
| Avsnitt (h2) | 26 px | 700 | 1,25 |
| Delrubrik (h3) | 20 px | 700 | 1,3 |
| Ingress | 20 px | 400 | 1,5 |
| Brödtext | 17 px | 400 | 1,65 |
| Etikett, stödtext | 15 px | 400–700 | 1,4 |
| Minsta | 14 px | 400 | 1,4 |

Formler skrivs i egen rad, 22–24 px, blå, med svenskt decimalkomma och mellanslag före enhet.

### Mått

- Avstånd: 8, 16, 24, 40, 64 px.
- Hörn: 8 px på knappar och fält, 12 px på kort och paneler.
- Läsbredd för löptext: högst 72 tecken (cirka 820 px). Figurer får vara bredare.
- Brytpunkter: 768 px (en eller två spalter), 1100 px (labbens arbetsyta bredvid uppgiften).
- Tryckyta minst 44 × 44 px.

### Fokus

Alla interaktiva element: `outline: 3px solid #163248; outline-offset: 2px; box-shadow: 0 0 0 6px #ffd43d`. Fokus tas aldrig bort.

## Komponenter

### Knappar

| Typ | Utseende | Används |
|---|---|---|
| Huvudknapp | blå fyllning, vit text | en per vy: nästa steg |
| Sekundär | vit, blå ram och text | alternativa vägar |
| Textknapp | blå text, understruken | små åtgärder |

Storlekar: stor 56 px, normal 48 px, liten 44 px. Knapptext är ett verb: ”Börja med genomgången”, ”Spara förutsägelsen och läs av”.

### Länkar

Blå och understrukna. Externa länkar och nedladdningar får ↗ eller filtyp i texten.

### Informationspanel

Vit eller ljusblå panel med vänsterkant i temafärg (8 px, 16 px på bred skärm). Typer: information (blå), klart (grön), varning (orange), fara (röd). Rubrik i fetstil, en till tre meningar.

### Numrerade steg

Arbetsgång visas som numrerad lista eller steglinje. Aktuellt steg är blått och fetstilt, klara steg har ”klart” i text, kommande steg är gråa. Används för ”Börja här”, labbens ”Förutsäg → Läs av och jämför → Förklara” och genomgångens fem delar.

### Formulärfält (SmartHR)

- Etikett ovanför fältet, alltid synlig. Enhet i etiketten: ”Toppvärde û (V)”.
- Höjd 48 px, ram 1 px `#5d7282`, hörn 8 px.
- Hjälptext under fältet i 15 px. Fel i röd text med orsak och åtgärd.
- Reglage grupperas under en rubrik med ”Återställ” som textknapp.

### Tabeller (SmartHR)

Rubrikrad `--sj-soft`, rader åtskilda med 1 px linje, vartannat radfält får ljus ton i långa tabeller. Tal högerjusteras med `font-variant-numeric: tabular-nums`. Enhet står i kolumnrubriken.

### Status

Uppgiftens läge skrivs ut: ”Inte påbörjad”, ”Förutsagd”, ”Avläst”, ”Förklarad”. Samma ord i simulator och protokoll.

## Sidmönster

### Startsida (DADS)

1. Aktuell vecka överst: vecka, titel, en mening om vad eleven ska kunna, en huvudknapp.
2. Kursens veckor i ordning, med veckans praktiska mål i en rad.
3. Stödmaterial i en lugnare sektion: labbar, filmer, formelblad, protokoll.

### Veckosida (DADS)

”Börja här” med numrerade delar. Varje del: genomgång, film, labb. Skilj grunddel från fördjupning i text, inte bara med färg. Vad som lämnas in och när står i en egen panel.

### Genomgång (Zenn)

Varje del följer samma mönster:

1. **Det här ska du kunna** – ett konkret mål.
2. **Så fungerar det** – förklaring bredvid figuren.
3. **Genomräknat exempel** – metoden med verkliga värden.
4. **Prova själv** – en närliggande fråga med dold förklaring.
5. **Använd det i labben** – direkt koppling till labbuppgiften.

Fördjupning märks ”Fördjupning” och kommer efter grunddelen. Beteckningar står intill den del av figuren de beskriver.

### Labb (SmartHR)

- Bred skärm (minst 1100 px): instrument och koppling till vänster, uppgiftspanelen till höger.
- Surfplatta och mobil: uppgiften först, sedan instrumentet.
- Arbetsgången Förutsäg → Läs av och jämför → Förklara syns alltid, med aktuellt steg markerat.
- Avläsningar, enheter och viktiga reglage finns också som vanlig text bredvid 3D-vyn.
- Mätvärden förs in i tabeller med enhet i rubriken. Hämtade värden märks med tid.

### Presentationer

Sjöskolans omslag behålls. Samma rubriker, begrepp och figurbeteckningar som i genomgång, simulator och protokoll. Räkneexempel och labbinstruktioner har egna, igenkännbara bildtyper. Fördjupning märks i rubriken.

## Innehållsregler

- Ett begrepp, ett ord. Samma beteckning i presentation, simulator och protokoll (till exempel U, û, UL, UF, Xᴸ).
- Svenska decimaltecken och mellanslag före enhet: 12,35 V.
- Varje obligatorisk uppgift pekar på en genomgång eller ett exempel som lär ut samma metod.
- Skilj på grunddel och fördjupning i text.
- Inga dekorativa prickar, märken eller dubbla signaler.
