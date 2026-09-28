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
30. **Lärarmanuset och frågorna har var sin källa.** Manuset (Säg, Fråga, Klicka, Tänk på) står i `note` i
    `vecka-40/aktuell/lektioner.mjs`. Frågor och svar på bilderna, också Din tur, är poster i innehållsdatabasen
    (ytan `genomgang-v40`) och synkas till presentationerna av `bygg presentationer` (formerna check och svar).
    Lärarkopiorna byggs om med `verktyg/larare/lararnoter.py` efter varje ändring. Nya exempelvärden jämförs med
    alla svar för vecka 40, även inlämningens facit för D = 1–31, med samma enhet (regel 2).

30. **Resultatkoder ska tåla båda transportformaten och kortning.** Ett befintligt komprimerings-API kan sakna
    `deflate-raw`; använd då JSON-reservformatet. Kortning får inte dela Unicode-surrogatpar eller lämna text när
    gränsen är noll. Trasiga koder ska ge ett läsbart fel även när webbläsarens strömfel saknar meddelande.
    *Kontroll: `node --test sjoskolan/vecka-40/aktuell/resultat*.test.mjs` (lärarsidans integration kräver `LARARLOSEN`).*
31. **Mappen är inte veckan.** Kursen började vecka 38, så `vecka-37/` visas som vecka 38 och `vecka-38/` ingår i vecka 40.
    Byt aldrig namn på en mapp (länkar, nedladdningar, resultatkoder, sparade elevdata). Ändra veckan eleven ser:
    `vecka` i `verktyg/veckosidor/bygg.py` och `verktyg/inlamning/bygg.py`, startsidans lista och `weeks`, och bygg om
    veckosidor, inlämning (`innehall.py bygg`) och bildspel (`verktyg/bildspel/bygg.py`, fältet `vecka`).
32. **Resurslänkar skrivs relativt `sjoskolan/`.** ”Använd:”-länkar på inlämningssidorna utan mapp (`Elevuppgifter.html`,
    `Elevprotokoll.html`, `01A_…`) pekade på filer som inte finns. *Kontroll: `innehall.py kontrollera` (resurslänkar).*
33. **Numrera vecka för vecka: Övning del.nummer och Inlämning N.** Numren V2-1, E1, ”övning v40_02 nr 3” och
    ”uppgift 1” på två sidor samtidigt gick inte att följa. Vecka 40: del 1 frånskiljning (1.1–1.7), del 2 sinus,
    del 3 spole, del 4 effekt; inlämning 1–3 (frånskiljning) och 4–7 (växelström). Registret är fältet `nummer` i
    placeringarna och reglerna står i `innehall/numrering.py`. Ändra reglerna och kör `numrering.py --skriv`, aldrig
    numren för hand. En övningstext hänvisar inte till ett nummer (”som i uppgift 9”), utan skriver ”föregående övning”
    eller övningens namn, eftersom samma post har olika nummer i kursen och boken.
    *Kontroll: `innehall.py kontrollera` (numrering).*
34. **Figurer i presentationer är bilder, inte PowerPoint-diagram eller lösa linjer.** Vecka 40:s kurvdiagram (inbäddad
    arbetsbok) och trianglar av separata linjer ritades fel i PowerPoint och Keynote, fast LibreOffice-renderingen såg
    rätt ut. Figurerna ritas ur webbens `vecka-40/aktuell/visuals.mjs` med `verktyg/ac/figurbilder.py`. Etiketter står vid
    sin egen sida och får inte krocka; kurvor med olika enheter (u och i) ritas med olika höjd. Frånskiljningens
    presentation (v38_01) ritas på samma sätt med `verktyg/ac/scheman_v38.py`.
35. **En klar vecka låses.** Vecka 40 är låst (`verktyg/las/veckolas.py`, `verktyg/las/vecka-40.json`): SHA-256 för varje
    fil i veckan. CI och `innehall.py kontrollera` stoppar varje ändring. Arbeta framåt; ändra en låst vecka bara efter ett
    uttryckligt beslut (`veckolas.py las-upp 40`, ändra, `veckolas.py las 40`). Exportörer ska inte röra låsta veckor.
36. **Varje vecka har en sida per del, som vecka 40.** Från vecka 41 bygger `innehall/export/delsidor_veckor.py`
    Del_N.html ur presentationen (teori, exempel, figurer) och databasen (övningar med ledtrådstrappa och facit). Ändras en
    presentation: kör `verktyg/veckosidor/figurer_ur_presentationer.py`, sedan `innehall.py bygg`. Ritningar i
    presentationer ritas med `verktyg/ac/scheman_veckor.py`, manus med `verktyg/larare/lararmanus.py NN`.

### Boken

18. **PDF:en sätts med `innehall/bok/sattning/satt.mjs`** (paged.js via lokal HTTP; typsnitt med absoluta adresser,
    annars faller Chromium tillbaka på ett annat typsnitt). Efter ändring: kryptera `bok.pdf.enc`, bygg provkapitel
    och förhandsbilder, uppdatera `manifest.json` och ladda upp den nya PDF:en i Shopify (görs av Nils).
19. **Text i bokens figurer** ändras genom att bara siffror eller index ritas om och resten av raden behålls.

## Ändringar

- **2026-09-28** Vecka 40, övning 1–30: en tredje ledtråd ”steg för steg” i varje post (formel i kursens notation, ordning, enhetsomvandling, RAD/DEG, rimlighetskoll och ett exempel med andra tal, kontrollerat mot alla svar i databasen). Visas som Ledtråd 3 i arbetsrummet och på övningssidan.
- **2026-09-28** Lärarsidorna följer den nya planen: lärarportalens veckolista, utbildningsguiden vecka 38 (kursvecka 1, mapp vecka-37), frånskiljningen som måndag pass 1 i vecka 40, vecka 40:s plan med lektionstider och hemmablock, Lärarstöd vecka 40 och talaranteckningarna på bild 2 i lärarens PowerPoint v40_01–03. Upplåst utanför repot och låst igen.
- **2026-09-28** Vecka 40: verkliga lektionstider i dagplanen och lärarens anteckningar (måndag 09.00–11.00, tisdag 15.00–17.00, fredag 09.00–11.00); hemmablocken börjar när lektionen slutar.
- **2026-09-27** Kursen började vecka 38, inte vecka 37. Startsidan visar vecka 38–45 (Elens grunder vecka 38,
  14–18 september) och väljer vecka 40 från måndag 28 september. Frånskiljning och mätteknik (mappen `vecka-38`, inte
  undervisad) ingår i vecka 40, måndag; den gamla sidan säger det och länkar dit, och dess inlämning lämnas senast
  söndag 4 oktober. Presentationens sidfot och omslag (kursvecka 3, vecka 40) och bildspelet omgjorda. Vecka 40 har en
  plan dag för dag (`dagplan.mjs`): lektion måndag, tisdag och fredag, hemma måndag kväll, onsdag, torsdag och helgen
  med steg, tid, avbockning, framsteg från övningssidan och ”Före nästa lektion”; panelen ”I dag” visar nästa steg.
  Lärarens anteckningar i `lektioner.mjs` följer planen. Mappar, länkar och resultatkoder oförändrade. Trasiga
  ”Använd:”-länkar i inlämning vecka 37, 38 och 41 rättade (regel 32).
- **2026-09-28** Räknarhjälpen förklarar med interaktiva bilder (`gemensamt/raknehjalp-bilder.mjs`): radianen som
  bågen mätt i radier, snurrande visare till sinuskurva (u(t) vid 440 V/60 Hz), samma knapptryck i RAD och DEG,
  impedanstriangeln med fasvinkeln och prefixtrappan där kommat flyttar tre platser per steg. Exempeltalen
  (1,5 ms, 0,565 rad, 333 V, R 30 Ω/X_{L} 45 Ω) kontrollerade mot databasens svar. Korten i `raknehjalp.mjs` oförändrade.
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
- **2026-09-28** Vecka 40, läs upp och låt eleverna göra: fem Din tur-bilder (belysningsnätet 254 V, momentanvärde
  i vägguttaget, ventilationsfläkten |Z| och φ, kylskåpets kompressor) som poster EL-000863–867, i genomgången,
  elev- och lärarpresentationerna (svaret visas vid klick). Lärarmanus till alla bilder (Säg, Fråga, Klicka),
  lärarkopiorna byggs med `verktyg/larare/lararnoter.py`. Nya bildnummer i dagsplanerna och utbildningsguiden.
- **2026-09-28** Sammanslagning med main (verkliga lektionstider, arbetsrummet, Så räknar du-exemplen): manus och
  Din tur-bilder följer den nya planen. Långa brödtexter i vecka 40:s presentationer får automatiskt den största
  storlek som ryms (`kompakt` i `innehall/export/presentationer.py`); Så räknar du-texten gick annars in i sidfoten.
  40 poster som main reviderat utan skyddade filer registrerades om med `revidera --alla` och lärarlösenordet.
- **2026-09-28** Vecka 40, en sida per del (`Del_1.html`–`Del_3.html`, exportören `delsidor`): Översikt → Teori →
  Exempel → Övningar → Fredag: labben. Varje övning har Ledtråd 1 (vilken formel och vilket teoriavsnitt), Ledtråd 2
  (hur du börjar), räknarhjälp och facit; avbockningen följer med i QR-koden. Veckosidan och dagplanen länkar dit.
- **2026-09-28** Registervård och numrering vecka för vecka (`innehall/numrering.py`, 456 nummer). Övningarna heter
  nu Övning del.nummer på webben, i presentationerna, i facit, i lärarmanus och i QR-koden. Vecka 40: del 1–4, inlämning
  1–7, lärarens QR-granskare visar Inlämning 4–6. Fem övningstexter som hänvisade till gamla nummer skrevs om.
- **2026-09-28** Instrumentkorten M1 och M2 är datablad (`innehall/export/datablad.py`, `gemensamt/datablad.css`): bild av
  instrumentet med uttag, tabellen Vad instrumentet kan mäta (Ja/Nej och mätområde) och tekniska data. Uppgifterna står
  strukturerat i `studieplan-v40.json` (kort). M2 fick mätområden och CAT III 600 V. Korten visas en gång per övning.
- **2026-09-28** Komponentkortet är också ett datablad: IEC-symbol, beteckning, märkdata, läge i vila och vad kortet inte
  anger (säkringens AC/DC-märkning och brytförmåga). På mobil staplas raderna. Uppgifterna står i `studieplan-v40.json`
  (komponentkort). M2:s mätområden behålls.
- **2026-09-28** Vecka 40:s presentationer: kurvdiagram och trianglar ersatta med bilder ur webbens figurer (samma i
  PowerPoint, Keynote och webben). Figurerna rättade: trianglarnas etiketter krockade, periodmarkeringen låg över kurvan,
  resistorns u och i låg ovanpå varandra. Större text i presentationerna. Lärarkopior, PDF och bildspel byggda om.
- **2026-09-28** Frånskiljning och mätteknik (v38_01): blockschemat, symbolerna och de två kopplingsschemana (bild 4, 6,
  11, 12) är bilder i stället för lösa linjer och rutor. PDF och bildspel byggda om.
- **2026-09-28** Måndagens presentation i en fil (del 1 frånskiljning, del 2 sinus, övningar, hemuppgift, QR-koder till
  webben): elevversion utan anteckningar på veckosidan (`vecka-40/aktuell/Mandag_28_sep_vecka40.pptx` och `.pdf`),
  lärarversion med manus krypterad i lärarportalen (`larare/filer/Mandag_28_sep_vecka40_larare.pptx.enc`).
- **2026-09-28** Veckosidan vecka 40 börjar med dagens presentation (rutan väljer dagens eller nästa lektion efter datum:
  måndag del 1–2, tisdag del 3, fredag del 4). Därefter Lösningar och självhjälp (del 1–4), labben, inlämningen, Så arbetar
  du och den detaljerade planen.
- **2026-09-28** Frånskiljning och mätteknik (v38_01): omslagets båtfoto ersatt med en ritad effektbrytare i FRÅN-läge,
  låst med hänglås och skylten FRÅNSKILD – MANÖVRERA EJ (`verktyg/ac/brytare.mjs`). Även i måndagens samlade presentation.
  `verktyg/bildspel/bygg.py` hoppar över presentationer som inte heter vXX_NN.
- **2026-09-28** Vecka 40 låst (148 filer, även frånskiljningsmaterialet som undervisas måndag vecka 40). Presentationernas
  rubriker följer numreringsregistret från vecka 41 (”Övning 1.3”, ”Stöd till övning 1.3”); vecka 37–40 rörs inte.
- **2026-09-28** Vecka 41 och 42 som vecka 40: veckosidan börjar med Veckans presentationer (del för del, Öppna och
  PowerPoint), sedan Lösningar och självhjälp (gäller vecka 41–45). Lärarkopior med manus i lärarportalen
  (`verktyg/larare/lararmanus.py`: bildens text, guidens förklaringar och kontrollfrågor, facit och ledtråd på
  övningsbilderna). Diagrammet och de två kopplingsschemana i vecka 41 är bilder (`verktyg/ac/scheman_v41.py`).
  Passbilderna och Simulerade stationer använder övningsnumren d.k. Guidens Uᴸ/Uꜰ rättade till nedsänkta index.
  Databasen: två kontrollerade poster granskade, EL-000100 är resonemang, strukturerade svar för EL-000091, 099, 114
  och 123. `validera`: 0 fel, 0 anmärkningar.
- **2026-09-28** Vecka 41–45 i nivå med vecka 40: en delsida per del (15 sidor: översikt med mål och startfråga, teori
  och exempel ur presentationen med figurer, 150 övningar med ledtråd 1–3, räknarhjälp, facit och avbockning). Veckosidorna
  länkar dit (Öppna del N, Övningar och facit i presentationsrutan). Vecka 43–45: övningsnummer d.k i passbilderna,
  ritningarna i v43_03 (symboler, huvudström, hållkrets) och v44_01 (enlinjeschema) som bilder, lärarkopior med manus
  och facit i lärarportalen för alla femton presentationer i vecka 41–45.
- **2026-09-28** Tydligare väg för eleven, vecka 41–45: veckosidan visar framsteg per del (”3 av 10 övningar klara”,
  ”Nästa” på första ofärdiga del), övningssidan hänvisar till delsidan, och inlämningens ”Använd:” börjar med delsidan
  (Del N: teori och övningar).
