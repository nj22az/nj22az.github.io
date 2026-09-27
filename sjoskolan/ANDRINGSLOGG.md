# Ändringslogg och lärdomar – Sjöskolan

Läs reglerna innan du ändrar något i kursen, boken, labbarna eller filmerna. Varje regel kommer från ett fel som
faktiskt har gjorts. När ett nytt fel upptäcks: rätta det, lägg till en regel här och gör den helst till en
automatisk kontroll. Lägg till en rad under Ändringar efter varje större ändring.

Målet för allt material: **det ska vara lätt att lära sig.**

## Regler

### Innehåll och pedagogik

1. **En ledtråd får aldrig ge uppgiftens svar.** Metod och exempel räknas med andra tal än uppgiften. Kontrollera
   också att exemplet inte råkar ge samma svar (600 W vid 120 V gav 5,0 A, samma som uppgiften).
   *Kontroll: `innehall.py kontrollera` (svar_i_ledtradar).*
2. **Ett genomräknat exempel får inte ge svaret på en övning i samma kapitel.** Y/Δ-exemplet (200 V, 20 Ω) gav
   exakt övningarnas 5,77 A, 10 A och 17,32 A. Jämför nya exempelvärden mot alla svar i databasen innan de används.
   *Manuell kontroll (skript i ändringen 2026-09-27).*
3. **Exempel ska vara verkliga.** Hemma: vägguttag 230 V, 50 Hz, vattenkokare 2 300 W. Ombord: 440 V och 254 V,
   60 Hz, 690 V, motorer, styrtransformator 230/24 V. Inte godtyckliga tal eller andra länders nät (120 V, 240 V).
4. **Uppgifter på riggen stannar på skyddsklenspänning.** Labbarnas mätuppgifter och protokollexempel följer den
   fysiska riggen (SELV, 9–24 V). Det är exemplen och ledtrådarna som hämtas från hem och fartyg.
5. **Visa var eleven kan läsa.** En uppgift som kräver en metod pekar på exakt bild i genomgången
   (”Läs genomgången del 1, avsnitt 7: …”), räknat ur lektionerna så att det stämmer när bilder flyttas.
6. **Ge eleven ett tydligt besked.** Visa elevens egen förutsägelse med den etiketten (”Din förutsägelse”), aldrig
   ”Förväntat”, och säg om den stämmer (Rätt! / Skiljer sig) med kursens tolerans 2 %.
7. **Förkortningar förklaras.** Varje förkortning finns i `innehall/beteckningar.json` och förklaras första gången.
   *Kontroll: `innehall.py kontrollera` (vecka 40, BETECKNINGSSIDOR).*

### Notation

8. **En storhet har ett skrivsätt, index är alltid nedsänkta.** U_{pp}, U_{RMS}, U_{F}, U_{gren}, I_{L}, X_{L}.
   Aldrig Upp, Urms, U_{fas}, XL, låtsasindex (Xᴸ) eller understreck utan klammer (U_fas, X_L).
   *Kontroll: `notation.py` i `innehall.py kontrollera`. Tänk på text i figurer (PNG) och i filmer: de kontrolleras
   bara via källfilerna (`verktyg/figurer/figs*.py`, `filmer/films`).*
9. **En upphöjd siffra avslutar ordet** (UL², XL²). Kontrollen missade dem tills gränsen rättades.
10. **Genererad text ska behålla markeringen.** Exportörer som plattar ut X_{L} till XL (ren_text) ger ihopskrivna
    former. Använd markeringen och rendera nedsänkt (markHtml, rendera.h), även i generatorer för veckosidor.

### Teknik

11. **Redigera källan, inte den genererade filen.** Poster → `innehall.py revidera` och `bygg`. Veckosidor →
    `verktyg/veckosidor/bygg.py`. CI avvisar inaktuella filer.
12. **Samma exempel finns på flera ställen.** Ett genomräknat exempel kan finnas på övningssidan, i boken (text och
    figur), i presentationen och bildspelet och i filmerna. Sök överallt (även `filmer/films`,
    bokens `.bok/epub`, `bildspel/*/data.json`) och ändra allt i samma ändring, eller låt bli.
13. **Byt cacheversion när en modul ändras** (`?v=` i import och `<script>`), annars ser eleverna gammal kod.
14. **CSS som gäller alla `span` i ett block bryter översättningsskyddet.** `oversattning.js` lägger `span` runt tal
    med enhet. Använd barnselektorer (`dd > span`), inte `dd span {display:block}`.
15. **`innehall.py revidera --alla` utan skyddade filer** får bara jämföra den publika hashen (rättat 2026-09-26).
    Revidera helst med de skyddade filerna öppna; annars måste posten revideras igen nästa gång de är öppna.
16. **Main kan ha nya commits från andra sessioner.** Hämta och slå ihop, skriv aldrig över. Lös konflikter i källor
    för hand och bygg om genererade filer med verktygen.
17. **Lösenord skrivs aldrig i repot.** Lärar- och bokklartext ligger utanför git (`.skyddat/`, `bok/.bok/`).

20. **Filmens exempel får inte vara en övnings svar.** Vägguttaget 230 V, 50 Hz vid 2,5 ms är övning EL-000854, så
    växelströmsfilmen räknar på fartyget (440 V, 60 Hz, 2,0 ms). Kontrollera filmens tal mot svaren i databasen.
21. **En film ska gå att ändra utan ny inspelning.** Filmerna ritas ur `filmer/films/*.mjs` med text i bubblor och
    undertexter. Talmanus för en senare röst görs med `filmer/tal.mjs`.
22. **Genomgången får inte räkna labbens uppgifter.** Ledtrådarna pekar på genomgången, så den ska lära ut metoden
    med andra tal. Genomgången för vecka 40 räknade exakt labbens värden (20 ms, 16,97 V, 30 Ω, 50 Ω, 0,24 A, 5 A,
    10 A) och fördjupningsbilderna var ordagrant räkna-först-uppgifterna. Kontrollera nya exempel mot `simulator`-
    posternas svar, även för presentationer, stegfilmer och figurer (`visuals.mjs`, diagram i PowerPoint).
23. **Ett exempel får inte ge svaret på en annan uppgift i samma labb.** *Kontroll: `svar_i_ledtradar` jämför nu också med
    de andra uppgifterna i samma labb (tal med enhet).*

24. **Eleven identifieras med namn, inte med ett tal.** Personliga värden räknas fram ur namnet med samma funktion
    överallt (`gemensamt/elevtal.mjs`, lärarguiden och `berakningar.elevtal`). Nya personliga uppgifter ska ha facit i
    lärarguiden och ett test som visar att facit och labbet ger samma tal.
25. **Protokoll ska visa hur eleven kom fram till svaret.** En ändrad förutsägelse får aldrig skriva över den första;
    protokollet visar första förutsägelse, antal försök och tider.

26. **Eleven ska alltid veta nästa steg.** Varje del har samma väg: genomgång → film → övningar, labben sist.
    Samma ord överallt: Genomgång (avsnitt), Bildspel (bilder, PowerPoint, PDF), Artikel, Film, Övningar, Labb,
    Inlämning. Inga interna koder (v40_01) i elevtext. Extramaterial ligger under ”Mer att läsa”.

27. **Elevens PowerPoint har inga talaranteckningar.** Anteckningarna innehöll lärarråd och facit. Lärarkopian med
    anteckningar krypteras i `larare/filer/` och laddas ner från utbildningsguiden. *Kontroll: `verktyg/qa/week40.py`.*

28. **Räknaren och enheterna förklaras där de behövs.** `gemensamt/raknehjalp.mjs` visar korten RAD, DEG och prefix
    automatiskt i genomgång, artikel, labb och övningar när texten innehåller u(t), sin(2π…), arctan/fasvinkel eller
    mH, µF, ms. Allt samlat på `gemensamt/Raknehjalp.html` med omvandlare. Nya kurstexter får korten utan extra arbete.

29. **Namnet skrivs sist, D slumpas per enhet (vecka 40 och framåt).** `mittD()` i `gemensamt/elevtal.mjs`. Eleven
    skickar resultaten som QR-kod (`vecka-XX/aktuell/Resultat.html`); läraren läser dem i `larare/resultat.html`.
    Facit för resultatkoden finns bara i den krypterade lärarsidan, aldrig i elevens moduler. Vecka 37–39 räknar
    fortfarande D ur namnet (`RESULTATKOD` i `verktyg/inlamning/bygg.py` och `verktyg/veckosidor/bygg.py`).

30. **Resultatkoder ska tåla båda transportformaten och kortning.** Ett befintligt komprimerings-API kan sakna
    `deflate-raw`; använd då JSON-reservformatet. Kortning får inte dela Unicode-surrogatpar eller lämna text när
    gränsen är noll. Trasiga koder ska ge ett läsbart fel även när webbläsarens strömfel saknar meddelande.
    *Kontroll: `node --test sjoskolan/vecka-40/aktuell/resultat*.test.mjs` (lärarsidans integration kräver `LARARLOSEN`).*

### Boken

18. **PDF:en sätts med `innehall/bok/sattning/satt.mjs`** (paged.js via lokal HTTP; typsnitt med absoluta adresser,
    annars faller Chromium tillbaka på ett annat typsnitt). Efter ändring: kryptera `bok.pdf.enc`, bygg provkapitel
    och förhandsbilder, uppdatera `manifest.json` och ladda upp den nya PDF:en i Shopify (görs av Nils).
19. **Text i bokens figurer** ändras genom att bara siffror eller index ritas om och resten av raden behålls.

## Ändringar

- **2026-09-28** Trefaslabbets stationsprotokoll (EL-000406) pekade på en flik ”Neutralledaren” som inte finns; nu ”2 Bruten neutralledare”.
- **2026-09-28** Trefas-, Hållkrets- och Isolationslabbet enklare på iPad och mobil: uppgiften står först och reglagen
  bredvid diagrammet från 768 px (inte klistrade), flikarna blir en lista på mobil, S1 och S0 skriver läget (släppt /
  ✓ intryckt). Ingen knapp ser vald ut efter ett tryck (:hover), 44 px tryckytor, större reglageknopp, 17 px text och
  fält i protokollet (ingen inzoomning i iOS). Beskedet efter ”Hämta avläsning” står i mätningens ruta. Ny
  `gemensamt/labbpekskarm.css`; Växelströmslabbet och multimetern oförändrade. Sparade protokoll och länkar oförändrade.
- **2026-09-28** Växelströmslabbet enklare på iPad och mobil: steget skrivs ut (Steg 1 av 3) och stegraden är
  status, inte knappar. Förutsägelsen står bredvid rutan där värdet visas efter sparandet. Bänken visar uppgiftens
  instrument i närbild med en rad Visa: och en rad Bild: (3D-bild/Siffror); vridning borttagen så att sidan alltid
  kan rullas. Dubbeltryck ignoreras kort efter stegbyte, tydliga fel per fält, 44 px tryckytor och 17 px text i
  labbets egna delar. Sparade svar (v3-nyckeln) och QR-flödet oförändrade. 33 tester.
- **2026-09-27** Fokuserade regressionstester för vecka 40:s resultatkoder: z/j-rundtur, svenska tal, Unicode,
  kortningsgränser, trasiga koder, version/vecka, partiella labbdata, separat labb-D och lärarsidans verkliga
  hashimport. Rättat komprimeringsreservväg, Unicode-/nollkortning och tomma felmeddelanden. Kortningsbeskedet
  jämför nu med originaltexten och samma datasnapshot används genom QR-kortningen. Cacheversioner uppdaterade;
  lärarsidan behåller krypteringen. Separat CI-steg, utan presentatörs- eller sorteringstester.

- **2026-09-25** Innehållsdatabasen (`innehall/`), kursrevision, arbetsmapp för boken.
- **2026-09-26** Vecka 40: alla förkortningar förklarade. En storhet, ett skrivsätt i allt material (notation.py och
  CI). Växelströmsfilmen renderad om med nedsänkta index. Lärarsidor och bok med kursens notation. Ny PDF av boken
  (223 sidor, rättad september 2026). Översättningsskydd för formler och enheter (`gemensamt/oversattning.js`).
  Talmanus för kortfilmerna (`filmer/tal.mjs`).
- **2026-09-27** Växelströmslabbet: elevens förutsägelse och besked (Rätt!/Skiljer sig), ledtrådar utan svaret och
  med exempel från hem och fartyg, läshänvisning till rätt bild i genomgången. Genomräknade exempel från fartyget:
  fas och linje 254/440 V, Y och Δ på 440 V, styrtransformator 230/24 V (övningssidor, bok, presentationer).
  Automatisk kontroll att ledtrådar inte ger svaret; kontroll av understreck utan klammer.
- **2026-09-27** Den engelska filmen Alternating Current Aboard (`acfilm`) borttagen. Ny svensk repetitionsfilm
  Växelström ombord (`filmer/films/vaxelstrom.mjs`, 4 min): 440 V/60 Hz, momentanvärde, spole och kondensator,
  impedans 5/12/13 Ω, pumpmotor 1 380 W med PF 0,80, effekttriangel och kompensering. Pausa-och-räkna-moment.
- **2026-09-27** Vecka 40: momentanvärde på 440 V/60 Hz vid 2,0 ms och kompensering för pumpmotor 1 380 W vid 230 V
  (övningssida, bok med figur 7.3 och 9.3). Övningar med utländska nät bytta (U_{F} = 230 V, transformator 230 V).
  Labbens pumpuppgifter 1 500 W. Genomgång, presentationer, bildspel, lektionsartiklar och stegfilmer räknar med
  hemmets och fartygets värden i stället för labbens. Stegfilmerna har svensk text utan ljud; den engelska rösten är
  borttagen. Ny bok-PDF (223 sidor).
- **2026-09-27** Granskning av vecka 40 ur lärarens perspektiv. Rättat: ledtrådar där exemplet gav svaret på nästa
  labbuppgift (fläktmotor 5,0 A, vattenkokare 10 A), inaktuellt labbfacit i lärarportalen (S och Q för pumpen),
  tavelexempel i utbildningsguiden som var labbens värden, nedsänkta index på lärarsidorna.
- **2026-09-27** Eleven skriver sitt namn i stället för D (inlämning alla veckor, guidade växelströmslabben, lärarguiden,
  Lärarstöd vecka 40). Guidade labben ger egna värden ur namnet; protokollet visar första förutsägelse, antal försök och
  tider. Inlämning vecka 40 uppgift 4 omformulerad. Ledtrådsexempel flyttade utanför elevernas svarsintervall.
- **2026-09-27** Elev- och lärargranskning av vecka 40: ”Eget försök” i genomgången gav svaret på övning EL-000075,
  EL-000064 och räkna-först-uppgiften EL-000319; nya värden (48 V/120 Hz, 90/120 Ω vid 230 V, 4 140 W vid PF 0,60).
  Lärarsidornas upplägg samordnat med elevsidan: måndag, tisdag, fredag 2 × 45 min, labben sist.
- **2026-09-27** Vecka 40 lättare att följa: veckosidan visar tre steg per del (genomgång, film, övningar) och
  inlämningen överst; övningssidan visar en del i taget med ”Markera som klar” och framsteg; genomgången börjar med
  ”Det här ska du kunna” och visar bara rullistan i telefonen; filmer och genomgång pekar på nästa steg; samma ord
  överallt.
- **2026-09-27** Vecka 40: talaranteckningar borttagna ur elevernas PowerPoint; lärarkopior med uppdaterat dagsupplägg
  krypterade i `larare/filer/`, nedladdning i utbildningsguiden. (Vecka 39: v39_03 har fortfarande anteckningar.)
- **2026-09-27** Räknarhjälp: RAD/DEG och prefix förklaras automatiskt där de behövs (genomgång, artikel, labb,
  övningar) och på sidan Räknarhjälp med omvandlare, länkad under Att slå upp.
- **2026-09-27** Vecka 40, radianer och grader: ny bild 12 i v40_01 (genomgång, artikel, bildspel, elev- och
  lärarpresentation, 18 bilder) med hjulfigur, och filmen Radianer och grader (Måns och Sigge, 2 min). Filmen länkas
  från veckosidan del 1, RAD-kortet i räknarhjälpen och Raknehjalp.html. Måndagens pass 2 börjar med bild 12 före
  övning 6–7; fördjupningen är nu bild 13–14. Lärarplanen (PDF) omgjord med de nya bildnumren.
- **2026-09-27** Vecka 40, resultatkod: D slumpas på elevens enhet och namnet skrivs först i slutet. Svarsrutor för
  inlämning uppgift 1–3, sidan Skicka resultat med QR-kod (inlämningssvar, guidade labbens protokoll, avbockade
  övningar) och lärarsidan Resultatkoder (kamera, skärmbilder eller länk; rätt/fel mot elevens D, klasslista, CSV).
  Lärarsidornas lösenord kan sparas på lärarens enhet. Måndagens pass 2 omplanerat (bild 13 tillsammans, bild 14
  självstudier, inlämning påbörjas, QR-kod sist).
- **2026-09-27** Lärarportalen, Inlämningar under lektionen (`larare/resultat.html?vy=presentera`): en rad per elev
  med rätt/fel per svar i uppgift 1–3 och labbet, klassens summa, ordning efter namn, flest fel eller senaste kod,
  initialer i stället för namn. Uppdateras direkt när en kod läses på datorn, också i en annan flik.
