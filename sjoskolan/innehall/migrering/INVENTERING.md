# Inventering och granskning av kursens övningsinnehåll

Revision som granskades: `8cabde3` (main, 26 september 2026). Boken: EPUB modifierad 22 september 2026, dekrypterad med bokens lösenord.
Underlag: `inventering.json` (förekomster), `konflikter.json` (558 loggade beslut), `numerik.json` (oberoende talkontroll).

## 1. Var övningarna fanns före migreringen

| Källa | Plats | Slag | Antal |
|---|---|---|---|
| Bok (EPUB) | ch006–ch032 | kapitelövning: uppgift, samband, förutsättningar, metod, figurer | 240 |
| Bok (EPUB) | ch034–ch057 | lösning: steg, svar, kontroll, figurer | 240 |
| Kurs | vecka-39…45 `Formelstod_och_ovningar.html` | övning med formelstöd, symboler, förutsättningar, arbetsgång, facit | 200 |
| Presentationer | 17 elevpresentationer v39, v41–v45 | bilderna ”Stöd till övning N” och ”Övning N” | 170 |
| Simulatorer | trefas-, växelströms-, hållkrets-, isolationslabbet `lessons.mjs` | räkna-först-uppgift med facit, ledtråd, vanliga fel | 36 |
| Simulatorer | `vaxelstromslabbet/guided-lessons.mjs` | guidad uppgift: förutsäg, läs av, förklara | 8 |
| Simulatorer | `multimetersimulator/lessons.mjs` | stegvis övning med kontrollfunktion per steg (inkl. Station A) | 9 |
| Simulatorer | fem protokollmoduler | labbprotokoll med kontroller, mätningar, frågor, ifyllt exempel | 5 |
| Kurs | `vecka-41/aktuell/Elevprotokoll.html` | protokollmall för fysiska stationer | 1 |
| Presentation | v41_03 bild 6–8, 21 | fysiska stationer A, B (AC, trefas), C | 4 |
| Kurs | `vecka-40/aktuell/lektioner.mjs` | kontrollfråga med svar (genomgång och presentation) | 8 |
| **Migrerat hittills** | | | **921 förekomster → 311 poster** |

Kvar att migrera (steg 3, inventerat men inte i poster ännu):

| Källa | Plats | Antal |
|---|---|---|
| Arbetsblad 1A/1B | `vecka-37/aktuell/*/Arbetsblad.html`, samma E1–E8 i v37_02 och v37_04 | 7 + 8 (+ fall A, B) |
| Förberedelsefrågor 1A/1B | v37_01, v37_03 (en bild) | 6 + 6 |
| Vecka 38 | Elevuppgifter V2-1..4, Fördjupning fall A/B/F, deck bild 17 och 19 | 4 + 3 + 2 |
| Kirchhoff-seminarium | v39_04 (egna 10 övningar med stöd, kontrollfrågor bild 41) | 10 + 3 |
| Multimeter och mätfel | v39_03 övning 1–10 med facitbilder | 10 |
| Start- och avslutsfrågor | bild 2 och 35 i 17 presentationer | 34 |
| Inlämning | `verktyg/inlamning/bygg.py` UPPGIFTER | 28 (med D-parametrisering) |
| Övningstenta | `tentamen.html` | 12 |
| Lärarfacit | Lärarguide (klartext utanför repot): F-funktioner (23) och textfacit | ~45 rader |
| Lärarportal | Lararstod v40, Simulerade_stationer_larare, portalens labbsidor | förklaringar, vanliga fel, förväntade värden |

Utanför omfånget (historiskt eller pensionerat): bloggens elteknik-inlägg, `vecka-39/arkiv`, `vecka-40/arkiv`, `/ellab/`.

## 2. Konflikter och hur de avgjordes

Samma övning fanns i upp till tre versioner (bok, kurssida, presentation). Regel, med bevis:

1. **Bokens text är utgångspunkt** för titel, uppgift, samband och förutsättningar. Boken är den senaste språkgranskningen (22 september); kurssidorna är ett äldre utkast (24 september-commit av tidigare text). 282 fält där boken och kurssidan skilde sig: bokens text valdes.
2. **Presentationsgranskningen 25 september vinner** där den ändrade ett fält (`verktyg/figurer/textfix4x.py`): 32 fält (17 samband, 8 uppgifter, 4 förutsättningar, 3 titlar). Exempel: ”tränare” → ”rigg”, ”vinkel” → ”vinkeln”, ”U_fas” → ”U_F”.
3. **Ledtrådar i två steg** (begrepp, metod) tas från kursen/presentationen; bokens ihopskrivna Metod-rad delades upp mening för mening (171 fall entydigt). I 29 fall behölls kursens två ledtrådar: 22 för att presentationsgranskningen ändrat dem, 7 för att bokens rad inte gick att dela entydigt (de 7 bör granskas av författaren: bokens formulering är den nyare, se `bok/ANDRINGAR.md`).
4. **Notation**: kanonisk `U_{F}`; bokens `U_{fas}` mappas vid bokexport.
5. **Lösning**: kursens facit är publikt; bokens steg, svar, kontroll och figurer ligger bara i `skyddat/bok.enc`.

## 3. Oberoende talkontroll

Bokens Svar-rad jämfördes tal för tal med kursens facit (två av varandra oberoende källor), med tolerans 1 % eller avrundning och prefixbyte (667 Ω = 0,667 kΩ):

| Utfall | Antal |
|---|---|
| Överens | 113 |
| Inga tal i svaret (resonemang) | 85 |
| **Avviker** | **2** |

- **EL-000048 (5.8, v39_02-q8)**: boken svarar ”grenströmmar 2 A och 1 A”, kursens facit anger bara V_a = 6,0 V. Ingen räknemotsägelse; boken är fullständigare. Åtgärd: lägg till grenströmmarna i kursens facit.
- **EL-000100 (16.10, v41_01-q10)**: boken ”400 V mellan faser garanterar inte rätt lastspänning”, kursen resonerar utan siffra. Ingen motsägelse.

Dessutom har 44 simulatoruppgifter fått registrerade beräkningsfunktioner (`lib/berakningar.py`) som räknas oberoende av JavaScript-modellerna; `innehall.py validera` jämför dem med simulatorernas facit. 150 poster är märkta numeriskt kontrollerade.

## 4. Granskning av kursen: brister och rekommendationer

**Innehåll**

- Kurssidan och boken hade glidit isär i 314 fält utan att någon visste det. Det är nu löst för de 200 delade övningarna; resterande familjer (tabellen ovan) är fortfarande hårdkodade tills steg 3 är klart.
- Simulatorernas facit räknas av samma modell som eleven ser. De 44 registrerade funktionerna ger första gången en oberoende kontroll. Multimeterlabbets 9 övningar saknar ännu ett funktionsregister (`funktioner.mjs`), därför ger `validera` 65 fel ”okänd labbfunktion” tills steg 4 är klart.
- Ledtrådar finns i två steg för alla 200 kursövningar, i ett steg för simulatoruppgifterna, och saknas för arbetsblad, inlämning och tenta.
- Lärarfacit till inlämningen ligger i klartext utanför repot och räknas i JavaScript i lärarguiden. De 23 D-funktionerna ska registreras som `larare.facit_funktion` så att samma tal används i lärarguiden och i eventuell automaträttning.

**Struktur (din beställning om lektionsartiklar)**

- Veckosidorna länkar till genomgång, presentation, film och övningar som skilda resurser; vecka 40:s genomgång visar en del i taget. En sammanhängande artikel per lektion (mål → förklaring med figur → instrumentet visar → genomräknat exempel → prova själv med ledtrådar → det här använder du i labben → nästa del) är genomförbar direkt ur databasen: teori-id, exempel och övningar med ledtrådar finns redan som poster och `teori.json`. Planerad som steg 4b för de tre AC-lektionerna; presentationerna behålls för undervisningen.

**Boken**

- Behöver uppdateras: 63 fält i 47 övningar (`bok/ANDRINGAR.md`), främst de 32 presentationsgranskade fälten och notationsbytet. EPUB:en kan skrivas om från databasen; PDF:en (7×10-tums sättning) kan inte byggas i repot och måste sättas om utanför.

## 5. Kända öppna punkter

- `validera`: 65 fel om okända labbfunktioner tills labbarnas `funktioner.mjs` finns (steg 4).
- 7 ledtrådar där bokens och kursens formulering skiljer sig och valet gjordes åt kursen av tekniska skäl (se punkt 2.3).
- Skyddade filer (`skyddat/larare.enc`, `skyddat/bok.enc`) kräver lösenorden i miljön (`LARARLOSEN`, `BOKLOSEN`). Utan dem bygger och kontrollerar verktyget bara det publika.
