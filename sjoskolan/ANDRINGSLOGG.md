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
37. **Veckolåset följer också simulatorns körningsberoenden.** En låst veckomapp räcker inte när labbet,
    resultatkoden och lärarstödet använder filer utanför mappen. `veckolas.py` följer explicita startfiler och
    jämför både hashar och hela beroendemängden; nya dynamiskt laddade resurser ska tas med innan omlåsning.
    Frys inte hela gemensamma mappar. *Kontroll: `verktyg/las/test_veckolas.py` och `veckolas.py kontrollera`.*
38. **3D bara där det fysiska är poängen.** 3D-figurer används för maskiner och apparater som eleven ska känna igen
    (generatorn, plinten, transformatorns kärna). Visare, kurvor och formler ritas i 2D. Figuren ska vara läsbar i
    halva bildbredden: rendera modellen mindre hellre än att krympa etiketterna. En etikett som dubblerar en annan tas bort.
    3D-figurerna i vecka 41 byggs av `verktyg/figurer/figurer3d.py` (del 1–2) och `figurer3d_del3.py` (del 3 och labbet),
    inte av `scheman_veckor.py` eller `figs41.py`. Labbets figurer renderas ur Motorlabbets egen scen, så att bilderna
    och simulatorn aldrig visar olika utrustning. En figur i elevmaterialet får inte avslöja felsökningens fel.
39. **Ett facit visar aldrig ett oavrundat tal.** Vecka 40 visade û ≈ 16,970562748477143 V och fem liknande svar i
    sex veckor, eftersom sidgeneratorerna skrev `str(varde)`. Svaret formateras med `rendera.svarsvarde`: postens
    `avrundning`, annars tre värdesiffror. *Kontroll: `innehall.py kontrollera` (oavrundat tal i facit).*
40. **En del heter samma sak överallt.** Vecka 40:s inlämning kallade sinus ”del 1”, spolen ”del 2” och effekten ”del 3”,
    medan veckosidan och labben kallar dem del 2–4. Hänvisningar pekar på delsidan med samma nummer som veckosidan.
41. **En 3D-figur måste vara fysiskt rätt i detalj.** 3D gör bilden konkret, så en förenkling som är ofarlig i 2D blir
    fel: en motor med fötterna direkt på stålkrovet är jordad genom fötterna, och då ger en bruten PE ingen
    beröringsspänning. Rita det som gör påståendet sant (gummidämpare) och skriv ut det. Markera på en skylt där handtaget
    pekar, och visa alla mätpunkter (PE hör till spänningsprovningen). Granska varje ny figur som elektriker och sjöingenjör.
42. **Talen i en övningsfigur ska stå i övningen.** Övning 1.4 i vecka 41 visade U_{F} = 120 V när uppgiften sa 230 V:
    figuren ritades till en äldre version. *Kontroll: `verktyg/figurer/figurkontroll.py` (i `innehall.py kontrollera`).*
43. **En tidsbild och en kurva ska visa samma ögonblick.** Står det ”rotorn i bilden” under en kurva ska tidpunkten vara
    markerad i kurvan (5 ms för L1 = sin ωt), annars läser eleven t = 0.
44. **Revidera poster med skyddat innehåll med lösenordet laddat.** `skyddat packa-upp`, `revidera`, `skyddat packa` och
    ta bort klartexten. Annars stämmer inte kontrollsumman och `bygg larare` stoppar (EL-000810–813).


### Boken

18. **PDF:en sätts med `innehall/bok/sattning/satt.mjs`** (paged.js via lokal HTTP; typsnitt med absoluta adresser,
    annars faller Chromium tillbaka på ett annat typsnitt). Efter ändring: kryptera `bok.pdf.enc`, bygg provkapitel
    och förhandsbilder, uppdatera `manifest.json` och ladda upp den nya PDF:en i Shopify (görs av Nils).
19. **Text i bokens figurer** ändras genom att bara siffror eller index ritas om och resten av raden behålls.

45. **Jämför mätvärden i samma enhet.** Multimeterns autorange returnerar `value` i displayens Ω eller kΩ.
    Normalisera före kontroll och prova alla riggar på båda sidor om enhetsbytet.

## Ändringar

- **2026-09-30** PR #113 framflyttad: multimeterns övning 7 behåller läsbara diagrametiketter, separat spetsrad och sladdar i kanten; main:s senare notation och elevdata bevarade. Ny cacheversion. 24 modell-/DOM-tester och 10 Chromium-fall godkända på telefon, surfplatta och två skrivbordsbredder. Fysisk iPhone/iPad och WebKit kvarstår separat.

- **2026-09-28** Vecka 40:s lås förstärkt med Växelströmslabbets transitiva körningsberoenden, även genererade
  uppgifter, beräkningar, instrumentbänk och använda gemensamma moduler. Manifestet utökat från 148 till 174 filer;
  tidigare hashar och allt elevmaterial oförändrade. Kontroll av startfiler, omfattning och tillkomna/bortfallna
  beroenden samt regressionstester i CI. Oanvända senare-veckofiler, labbtester och byggverktyg lämnas utanför låset.

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
- **2026-09-28** Vecka 41: ledtråd 3 (steg för steg med andra tal, fartygsvärden) för alla 20 beräkningsövningar. Delsidan
  visar den i stället för hänvisningen till exemplet. Kontrollen stoppade ett exempel som innehöll svaret (11 kW mot
  11,3 A) och det byttes. Övning 2.2 hänvisade till ”uppgift 1” och säger nu ”föregående övning”.
- **2026-09-28** Vecka 42–45: ledtråd 3 (steg för steg med andra tal) för alla 44 beräkningsövningar. Kontrollen stoppade
  ett exempel som gav svaret (23,2 mot 23,1) och det byttes. Rättat: EL-000157 räknade med 400 V i stället för 440 V,
  EL-000225 hänvisade till ”uppgift 4” (nu ”föregående övning”), EL-000235 hade svaret som φ i stället för cos φ.
  Lärarkopior med manus för vecka 43–45 byggda om. Vecka 40 orörd (låset oförändrat).
- **2026-09-29** Vecka 41–45: inlämning med e-post till nils@sjoskolan.se. Inlämningssidan och veckosidan har rutan
  ”Så lämnar du in” (ett mejl, ämnesrad med vecka och namn, labbprotokoll som PDF) och en knapp som öppnar ett ifyllt
  mejl. Adressen och rutan finns på ett ställe (`verktyg/inlamning/bygg.py`, `EPOST`, `epost_knapp`). Vecka 40 orörd.
- **2026-09-29** Vecka 41–45: ledtråd 3 (”steg för steg”) för alla 86 resonemangsövningar. Ledtråden ger frågor i
  ordning som bygger upp svaret, ofta med ett annat fall, men inte svaret. Två utkast som räknade upp svaret
  (arbetsmetoderna i ESA, pumpens funktioner) skrevs om före publicering. Delsidan visar ”Ledtråd 3: steg för steg”
  för resonemang och ”steg för steg med andra tal” för beräkningar.
- **2026-09-29** Vecka 41–45: schemat är måndag 09.00–11.00 (del 1), tisdag 15.00–17.00 (del 2) och fredag 09.00–11.00
  (del 3), samma som vecka 40. Rutan ”Veckans presentationer” visar dag, datum och tid för varje del, och markerar
  dagens lektion med ”Idag” eller nästa lektion i veckan med ”Nästa lektion”. Vecka 40 orörd.
- **2026-09-29** Vecka 41–45, veckosidan: den dubbla knappen ”Börja med del 1” är borttagen (delens egen knapp och
  ”Nästa” visar var eleven fortsätter). Rutan med presentationerna slutar med vad som ska vara klart senast söndag:
  övningarna, labben och inlämningen med e-post. Förut stod fristen bara längst ner. Vecka 40 orörd.
- **2026-09-29** Delsidorna vecka 41–45 blev kortare och mer pedagogiska. Teorin består av kort, ett per avsnitt, med
  rubrik och avsnittets formel synliga. Eleven öppnar ett avsnitt i taget, och varje avsnitt slutar med ”Öva nu”: de
  övningar som bygger på det. Exemplen visas ett steg i taget (”Visa steg 2 av 3”, ”Visa alla steg”), så att eleven
  hinner försöka själv. Länkar från ledtrådarna öppnar rätt kort. Utan JavaScript syns allt. Övningarna börjar nu
  efter ungefär 3 800 px på mobil, mot 7 300 px förut. Vecka 40 orörd.
- **2026-09-29** Notation vecka 41–45. Nya kanoniska beteckningar i `beteckningar.json`: P_{in}, P_{axel}, P_{total},
  U_{1,gren}/U_{2,gren}, I_{1,märk}/I_{2,märk}, U_{förv}, U_{uppmätt}, R_{nom}, R_{före}/R_{efter}, R_{iso}, I_{fel},
  Z_{fel}. De gamla formerna (Paxel, Ptotal, U₁,gren …) står i `avradda`, så CI stoppar dem. Presentationer, delsidor,
  isolationslabbet, poster och bokens skyddade text är omskrivna, och figurerna i v41_02 (bild 22, 30, 34) och v41_03
  (bild 32) är omritade. De nya beteckningarna har `labbdata: false` och följer inte med i `beteckningar.gen.mjs`,
  som vecka 40:s växelströmslabb läser (låst). Pᵢₙ och Pförlust står kvar i vecka 39 (arbeta bara framåt).
  Regel: en ny beteckning efter vecka 40 får `labbdata: false`.
- **2026-09-29** Ny formelsamling för hela kursen: `gemensamt/Formelsamling.pdf` (A4, 11 sidor) och
  `gemensamt/Formelsamling.html`. Den har 58 numrerade formler (F1–F58) i kursens ordning, vecka 38–45. Varje formel har
  beteckningar med enhet, utlösta former, ett räknat exempel med fartygsvärden och ”Se upp” med det vanligaste felet.
  Dessutom finns ”Så använder du formelsamlingen” i fyra steg, registret ”Jag söker …”, prefix, konstanter och nät samt
  en bilaga med beteckningar (ur `beteckningar.json`) och svenska–engelska. Samlingen länkas från startsidan, tentamen,
  formelbladet och veckosidorna 41–45. Källa: `verktyg/formelsamling/bygg.py` (skriver HTML och PDF). Notationen
  kontrolleras av `notation.py`. Regel: ändra en formel i `bygg.py` och kör skriptet, redigera aldrig HTML eller PDF.
- **2026-09-29** Samma notation i hela kursen, även vecka 39, formelbladet, tentamen och simulatorerna. Nya kanoniska
  beteckningar: P_{nyttig}, P_{förlust}, U_{in}/U_{ut}, I_{in}/I_{ut}/I_{retur}, R_{min}/R_{max}, U_{th}/R_{th}, R_{in},
  R_{tot}/I_{tot}, U_{last}/I_{last}/R_{last}, U_{källa}, R_{slinga}, U_{prov}, I_{läck}, U_{tång}, U_{beröring}, I_{k},
  I_{cu} och n_{s}. Pᵢₙ ska skrivas P_{in}. Alla har `labbdata: false`. Multimetersimulatorn behåller nu markeringen i
  texten och ritar index nedsänkt (markHtml), medan protokollet får oformaterad text (markText). Tidigare plattade
  exportören till ”Ukälla”. Vecka 40 orörd (låset oförändrat, QA grön).
- **2026-09-29** Granskning av formelsamlingen. Alla exempel är omräknade. En täckningskontroll mot alla övningars
  `samband` hittade samband som saknades. Nya formler: två spänningskällor i serie, nodspänning, spänningar i RL-krets
  och spänning mellan två mätpunkter. Utökade formler: fall i % och P_{förlust} i kabel, Thévenin ur spänningsdelare,
  PF = P/S, Q_{total}, fasavstånd, neutralström med två faser, spänningsdelare med last samt tolerans och krav.
  Förtydligat: effekt vid växelström (F2), kabellängd och slinga, kortslutningsslingan, 30 mA för jordfelsbrytare
  och att felströmsmodellen gäller TN-system. Etiketter som ”två faser:” ritas små. Nu 62 formler på 12 sidor.
  Regel: kör täckningskontrollen (alla `samband`) när nya övningar läggs till.
- **2026-09-29** Formelsamlingen är nu en bok på 30 sidor A4. Omslag och baksida följer POPEYE
  (awesome-design-md-jp, design-md/popeye): koboltblått #343ec9, vikt 400, spärrad DM Sans, asymmetriska hörn 24/5 px
  och orange logotyp. Omslaget har trefaskurvor, kapitelremsa och ”62 formler”. Baksidan har presentationstext, kapitel,
  QR-kod till webbversionen och en formelremsa. Inlagan följer LINE (design-md/line): vitt, svart text, grönt #06c755
  och kort med 12 px hörn, med LINE:s webbstorlekar anpassade till tryck. Nytt innehåll: titelsida med kolofon, förord,
  innehåll med sidnummer (räknas i två pass), metoden i fem steg med ett genomräknat pumpexempel, ”Sex vanliga fel”,
  rimlighetstabell med värden ombord, kapitelöppningar med ”Det här ska du kunna”, register, bilagor och
  anteckningssidor (jämnt antal sidor för dubbelsidig utskrift). Länkarna i PDF:en fungerar. Källa:
  `verktyg/formelsamling/bygg.py`.
- **2026-09-29** Vecka 41 har nu samma stöd som vecka 40, i fyra delar:
  1) **Svarsfält** under inlämning 1 och 2 (nio tal). D räknas ur namnet, som förut. `vecka-41/aktuell/inlamning-svar.mjs`
     kopplas in via `SVARSRUTOR` i `verktyg/inlamning/bygg.py`.
  2) **Resultatkod (QR)** på `vecka-41/aktuell/Resultat.html`: svar, kontrollfrågor, övningar, stationsprotokoll A–C
     (mätningar, utanför tolerans, felsökningar med slutsats) och lösta uppgifter i Trefaslabbet. Kodningen ligger i den
     nya `gemensamt/resultatkod.mjs`, eftersom vecka 40:s modul är låst. Inlämningsmejlet ska ha QR-koden som bilaga.
  3) **Lärarsida** `larare/resultat-v41.html` (krypterad): facit ur namnets D, klassöversikt, presentatörsvy,
     kamera/skärmbild/klistra in och CSV. Den varnar när kodens D inte stämmer med namnet. Den länkas från portalen och
     från guiden för vecka 41. Vecka 40:s lärarsida är orörd.
  4) **Veckans plan** på veckosidan (41–45): lektion och hemma, dag för dag, med markeringen ”Nu”.
  **Kontrollfrågor:** tre per del, sist i övningarna. Nio flervalsposter EL-000868–876 och ytan
  `placeringar/kontrollfragor.json`. Rätt alternativ står i `losning.kommentar` (`losning.svarstext` är ett skyddat
  bokfält). Svaren sparas under `sj-kontroll:vecka-41`. Facit för lärarsidan genereras till
  `vecka-41/aktuell/kontrollfragor.gen.mjs`.
  Tester: `vecka-41/aktuell/resultat.test.mjs` (i CI). Kedjan är provad hela vägen: inlämning, delsida, QR, krypterad
  lärarsida. Vecka 40 orörd.
  Regel: en knapp på delsidan får inte ha klassen `del-klar` om den inte bockar av en övning, eftersom avbockningen
  letar efter `.del-ovning`.
- **2026-09-29** Granskning av vecka 41–45 ur fyra perspektiv: elektriker, fartygsingenjör, lärare och sjöman. Genomgånget:
  alla övningar, inlämningar, kontrollfrågor och presentationernas teoribilder. Rättat:
  - **Hållkretsen (EL-000118, EL-000239, EL-000218):** facit mätte spänning över hållkontakten medan START hölls in. Det
    ger alltid ungefär 0 V (START ligger parallellt) och skiljer inte orsakerna åt. Nu: spänningslös resistansmätning i
    hållvägen medan K1 påverkas enligt instruktionen.
  - **Elolycka (EL-000127, EL-000128):** ”Larma 112” och ”kontakta sjukvården” är ändrat till fartygets nödinstruktion och
    bryggan, TMAS till sjöss och 112 i hamn. Presentationen sa redan detta.
  - **Reläskydd (EL-000195):** facit besvarade inte frågan om hjälpspänning. Svaret är tillagt.
  - **Bogpropeller (EL-000824):** strömtransformatorn 200/1 A var underdimensionerad för 159–457 A. Nu 600/1 A, också i
    lärarfacit.
  - **Kontrollfråga 1.1:** ”fas och neutral” ombord är ändrat till ”generatorns neutralpunkt”, eftersom ombordnätet sällan
    har utdragen neutralledare.
  - **Beröringsspänning (EL-000818):** modellen anges som TN-system, inte IT-nät.
  - **Lärarfacit 43-2b:** den uppmätta differensströmmen heter I_{Δ}, märkvärdet I_{Δn}.
  För kontroll av läraren (kunde inte verifieras här): att TSFS 2014:1 är upphävd genom TSFS 2019:4, att övergångsdatumet
  för SS-EN 50110-1 utgåva 4:2024 är 29 maj 2026, och om SS-EN 50110-1 har fyra arbetsmetoder som ESA eller tre.
  Regel: en kontroll ska ge olika resultat för olika orsaker. Mät aldrig över en kontakt som har en sluten kontakt parallellt.
- **2026-09-29 – Lärarens verifiering av granskningen.**
  - **Övning 2.8 (EL-000138):** TSFS 2014:1 ersattes av TSFS 2017:26, inte av TSFS 2019:4. Lösningen nämner också
    SOLAS kapitel II-1 del D för internationell fart. Samma rättelse är gjord i bokens skyddade lösning.
  - **v42_02, bild 7:** SS-EN 50110-1 har tre arbetsmetoder: utan spänning, med spänning och nära spänning. ESA:s
    indelning i fyra står som en egen rad.
  - **Land och sjö:** övningar med 400 V eller 50 Hz anger nu sammanhanget i förutsättningarna (landström vid kaj,
    landnät, nätstation i land). Gäller EL-000092–094, 101–109, 163–165, 167, 187, 193 och 236.
  - Övergångsdatumet 29 maj 2026 för SS-EN 50110-1 utgåva 4:2024 är bekräftat.
  Regel: när en uppgift använder 400 V eller 50 Hz ska texten säga att det gäller land eller landström vid kaj.
  Ombord till sjöss gäller 440 V och 60 Hz. Frekvensen påverkar n_{s} och X_{L}.
- **2026-09-29 – ESA:s fyra arbetsmetoder mot standardens tre.** Facit i övning EL-000133 (kursen och boken) lyder nu:
  arbete utan spänning, arbete med spänning (AMS), arbete inom närområde (arbete nära spänning) och arbete utanför
  närområde. En mening förklarar att SS-EN 50110-1 har tre metoder och att ESA lägger till arbete utanför närområde.
  v42_02 bild 7 skriver: ”SS-EN 50110-1: tre metoder (…). ESA: fyra metoder (kompletterar med arbete utanför närområde).”
  Regel: när ESA:s fyra metoder nämns ska standardens tre stå bredvid, så att begreppen inte blandas ihop.
- **2026-09-29 – Jordfel i IT-nät (v41_01 bild 7, Del 1 avsnitt 3).** ”Vid ett jordfel kan en fas ha hela 440 V mot
  skrovet” är ändrat till ”Vid ett jordfel får de två friska faserna hela 440 V mot skrovet”. Den felande fasen ligger
  då på skrovets potential. De två andra faserna går från ≈ 254 V till linjespänningen mot skrov.
  Regel: säg vilken fas som avses när spänning mot skrov beskrivs vid jordfel.
- **2026-09-29 – Figurerna i v41 Del 1 (fas- och linjespänning).**
  - **Bild 6:** sinusfiguren har en fjärde, streckad kurva U_{12} = L1 − L2 med toppvärdet √3. Axeln går till ±√3, så
    linjespänningen syns större än fasspänningen.
  - **Övning 1.2 (bild 13):** etiketten L2 krockade med ”Δt = ?” och är flyttad.
  - **Bild 7:** U_{F} (U_{1N}, U_{2N}, U_{3N}) mäts mellan en fas och nollpunkten. U_{L} (U_{12}, U_{23}, U_{31}) mäts
    mellan två faser.
  - **Bild 8:** U_{12} = U_{1N} − U_{2N} är en vektoriell skillnad. U_{L} = √3 · U_{F} i ett symmetriskt system,
    aldrig 2 · U_{F}.
  - **Bild 23:** vid nollavbrott eller jordfel kan fas–jord visa allt från 0 V till hela U_{L}.
  - Alt-texterna till figurerna säger samma sak (`spec41.json`, `scheman_veckor.py`).
  Regel: en normaliserad kurva med fasspänningar ska inte lämnas ensam där linjespänning diskuteras. Visa U_{L} med
  toppvärdet √3 eller skriv det ut.
- **2026-09-29 – v41 Del 2 (Y, Δ och trefaseffekt) granskad.**
  - **Exempel E2** gav I_{L} ≈ 5,77 A, samma svar som övning 2.2. Det bröt regel 2. Exemplet räknar nu ombord:
    P_{axel} = 3,0 kW, η = 0,80, PF = 0,75, 440 V, vilket ger P_{in} = 3,75 kW, I_{L} ≈ 6,56 A och förlust 0,75 kW
    (v41_02 bild 24).
  - **Teorihänvisningar:** övning 2.3 pekar nu på Teori 3 (I_{L} = √3 · I_{gren}), 2.4 och 2.10 på Teori 4
    (Trefaseffekt). Placeringen kan ange avsnittet med det nya fältet `teori` i `kurs-formelstod.json`. Att vikta
    formelord i det automatiska valet prövades men flyttade 25 hänvisningar i vecka 41–45, flera till sämre avsnitt.
  - **Övning 2.7 (EL-000107):** ledtråd 1 löd ”Utgå från Jämför …”. Principen står nu som ”Nätets U_{L} = märkvärdet
    för driftkopplingen”.
  - **Teori:** ”I symmetrisk Δ är grenspänning och linjespänning lika” gäller alltid, inte bara vid symmetri (bild 4).
    Trefaseffekt har fått raden ”Osymmetrisk last: summera fasernas aktiva effekter” (bild 8).
  - Figurerna är kontrollerade, bland annat plintbyglarna för Y och Δ. De är oförändrade.
  Regel: kontrollera varje övnings teorihänvisning mot avsnittet där formeln faktiskt står. Ange `teori` i
  placeringen när det automatiska valet blir fel.
- **2026-09-29 – v41 Del 2 byggd som Del 1: figurerna definierar storheterna.**
  - **Bild 6 (Y/Δ):** U_{L} står som dubbelpil mellan L1 och L2. Grenen med U_{gren} är markerad. Stjärnpunkten heter
    ”stjärnpunkt” och inte N, eftersom en Y-last inte behöver ha en utdragen neutralledare. Etiketterna är större. Texten
    lyder: ”I Y … stjärnpunkten: U_{gren} = U_{F}. I Δ … två faser: U_{gren} = U_{L}.”
  - **Bild 7 (strömmar i Δ):** figuren visar I_{L1}, som delar sig i I_{12} och I_{31}. En visarbild bredvid visar
    I_{L1} = I_{12} − I_{31} som vektoriell skillnad med beloppet √3 · I_{gren}, samma bild som U_{12} i Del 1.
  - **Bild 21 (plinten):** under Y står ”lindning: U_{L}/√3” och under Δ ”lindning: U_{L}”. Texten säger att märkningen
    anger nätets U_{L} för varje koppling.
  - Alt-texterna säger samma sak (`spec41.json`, `scheman_veckor.py`).
  Regel: en teorifigur ska visa mellan vilka punkter storheten gäller. Den ska inte bara visa kopplingen.
- **2026-09-29 – Granskning av v41 Del 2 (extern genomgång).** Alla tal, facit och kontrollfrågor är bekräftade, och
  märkningen land/sjö följs. Två förslag är genomförda:
  - **Ordlistan:** S, P och Q har fått trefassambandet (S = √3 · U_{L} · I_{L}, P = … · cos φ, Q = … · sin φ) i det
    nya fältet `trefas` i `beteckningar.json`. Tillägget visas på delsidor och kurssidor från vecka 41. Vecka 40 är
    låst och visar det inte, och fältet följer inte med till `beteckningar.gen.mjs`.
  - **Övning 2.6 (EL-000106):** facit förklarar också varför Δ väljs bort: varje lindning skulle få 400 V mot
    märkspänningen 230 V. Bokens lösning hade redan steget.
  Regel: en definition i ordlistan som bara gäller enfas ska få trefasformen när trefas införs.
- **2026-09-29 – Labbhandbok för läraren (`labbhandbok/`, olåst, noindex, inte länkad från elevsidorna).** Den bygger på
  laborationsunderlaget och inköpsguiden (position 01–16) och har tre sidor:
  - **Översikt och beslut:** vad det inköpta räcker till, kopplingen till LM-1…LM-9 och beslut som ska kontrolleras
    (märkskylt, startarens kapsling, 12 V-riggarna som inte är inköpta, gruppstorlek).
  - **Iordningställ motorstationen:** motorn och startaren är övningsobjekt som aldrig ansluts. Blecken kopplar Y och Δ,
    och eleverna går igenom delarna. Lärarens referensmätning: 2R i Y, (2/3)R i Δ, kvoten 3.
  - **Labbpasset 9/10:** tre roterande stationer (motorn, startaren och skylten, strömtången på SELV), protokoll,
    handledning och ett förslag till ny Del 3.
  Motorn körs inte, och regel 4 (SELV) gäller oförändrad. Del 3 i vecka 41 är ännu inte ombyggd.
  Regel: labbuppgifter bygger bara på utrustning som finns i inköpslistan. Utrustning som inte är inköpt, som
  12 V-trefasriggen, används inte i elevmaterialet.
- **2026-09-29 – Vecka 41 Del 3 ombyggd med de fysiska stationerna.** Del 3 byggde tidigare på 12 V-riggar som inte
  är inköpta (DC-delare, trefastränare, hållkrets). Nu bygger den på motorn och startaren, som aldrig ansluts, och på
  strömtången vid DC-aggregatet (SELV). Allt som ändrats:
  - **Presentationen v41_03:** sju teoriavsnitt: labbets ramar, motorns delar och märkskylt, lindningar och plint, Y och
    Δ med bleck (2R och (2/3)R, kvoten 3), startarens delar, strömtången, protokoll och slutsats. Två exempel och nya
    figurer (`figs41.py`, `spec41.json`).
  - **Övningar 3.1–3.10:** nya poster EL-000877–886. De gamla posterna EL-000111–120 finns kvar i boken. Kontrollfrågorna
    (EL-000874–876) och start- och avslutsfrågan (EL-000709, 710) är omskrivna. Övning 3.1 och 3.6 pekar på Teori 4
    genom fältet `teori`.
  - **Elevsidan `Labbet.html`:** stationerna M, S och T med regler, steg och protokoll. Inlämning 3 (EL-000816) och
    lärarfacit följer den.
  - **Veckosidan och startsidan:** ny text för del 3. Veckoplanen säger att övning 3.1–3.5 görs före träffen.
    Simulerade stationer A, B och C är nu frivillig extra övning.
  Regel: labbuppgifter bygger bara på inköpt utrustning. Övningarna använder exempeltal tills lärarens referensmätning
  finns.
- **2026-09-29 – Labbet vecka 41 flyttat till fredag 11.00–16.00 med lunch 12.00–13.00.** Genomgången av del 3 är
  kl. 09.00–11.00. Stationerna M, S och T har nu 40 minuter var, så att varje elev kopplar och mäter själv.
  - **Felsökningsuppdrag på slutet:** läraren lägger in ett fel i plinten (saknat bleck, fel koppling, lös mutter), och
    varje grupp hittar det med en felsökningslogg (observation, hypotes, kontroll, slutsats).
  - **Uppdaterat:** labbhandboken (tidsplan, morgonchecklista för lärare som kommer först på fredagen), Labbet.html,
    v41_03 bild 3 och veckoplanen.
- **2026-09-29 – Fredag vecka 41: genomgången av del 3 är självstudier på distans 09.00–11.00, och labbet är på plats
  11.00–16.00.** Eleverna läser genomgången själva, gör övning 3.1–3.5 och skriver sina förutsägelser innan de kommer.
  Veckoplanen, veckosidans rad om presentationerna, v41_03 bild 3, Labbet.html och labbhandboken säger nu det, och
  lärarens förberedelse på plats ligger före 11.00.
- **2026-09-29 – Del 3 läses efter del 2, som avslutning på veckans teori.** Eleverna läser genomgången av del 3 själva
  och gör övning 3.1–3.5 mellan tisdag kväll och torsdag. Fredag förmiddag är de på plats men gör annat förberedande
  arbete, och labbet är 11.00–16.00. Veckoplanen, rutan med presentationerna (”Läs själv efter del 2, senast
  torsdag”), v41_03 bild 3, Labbet.html och labbhandboken säger nu det.
- **2026-09-29 – Del 2 fick de två saknade teorifigurerna, och Motorlabbet är nytt.**
  - **Del 2:** teoriavsnitten Trefaseffekt (effekttriangel för 440 V, 20 A, cos φ = 0,85) och Trefastransformatorn
    (Dyn 6,6 kV/440 V med U_{1,gren} och U_{2,gren}) har nu figur, som de andra avsnitten.
  - **Motorlabbet (`motorlabbet/`):** labbet vecka 41 i 3D för den som inte kan komma. Samma stationer och protokoll
    som på plats: motorns plint med Y och Δ och multimeter, startaren med testknapp, tången med ett varv, två varv och
    hårnål, och en felsökning med ett fel per elev.
    - Resistansen räknas med nodanalys för varje bleckkombination. Lindningarna får egna värden ur elevens D.
    - Reglerna från den fysiska labben gäller: blecken flyttas bara med mätsladdarna bortkopplade, och sladden vid
      tången bara med utgången avslagen.
    - Utan WebGL fungerar allt med knapparna och plintbilden. three.js buntas lokalt (`tools/build.mjs`).
    - Motorlabbet är länkat från veckosidan, Labbet.html och labbhandboken. `model.test.mjs` körs i CI.
  Regel: en distansversion av en fysisk labb ska ha samma steg, regler och protokoll som labben på plats. Simulerade
  värden märks som simulerade.
- **2026-09-29** 3D-figurer i vecka 41 del 1 och 2 och en interaktiv generator:
    - Gemensamma three.js-modeller i `figurer3d/modeller.mjs` (generator, stjärnkoppling, plint, transformator),
      renderade headless och etiketterade med kursens typsnitt av `verktyg/figurer/figurer3d.py`.
    - v41_01 bild 4: generatorn i Y med kabeln, U_{L} mellan två fasledare och U_{F} mellan fasledare och N.
    - v41_01 bild 6: generatorn med tre spolar 120° isär bredvid sinuskurvorna (ersätter enbart kurvorna).
    - v41_02 bild 21: plinten i 3D, Y och Δ med bleck. Bild 23: transformatorn med tre ben, primär Δ 6,6 kV, sekundär Y 440 V.
    - `generatorn/`: vrid rotorn och se u1, u2 och u3 ritas i takt, summan är 0 V. Länkad från veckosidan och Del 1
      teori 2 (`INTERAKTIV` i `delsidor_veckor.py`).
  Regel 38.
- **2026-09-29** 3D-figurer i vecka 41 del 3 och i labbet, renderade ur Motorlabbets bänk (`motorlabbet/rendera.html`):
    - v41_03 bild 6 motorns delar, bild 7 plinten med ohmmeterns sladdar och lindningarna streckade, bild 17 (övning 3.4)
      motorn med stängd låda, bild 21 startarens delar, bild 22 strömtången en gång, två varv och hårnål. Bild 6 och 22
      har nu figuren i full bredd mellan texten, som bild 21. Resistansnät och stapeldiagram är kvar i 2D.
    - Labbet.html: en bild per station M, S och T. Labbhandboken: samma stationsbilder och de tre felen i felsökningen
      (bara i handboken, `labbhandbok/bilder/`).
    - Hjälpfunktionerna för 3D-figurerna ligger i `verktyg/figurer/fig3d.py`.

- **2026-09-29** Vecka 40 granskad inför fredagen (upplåst, ändrad, låst igen: Del_1–3.html och Inlamning.html):
    - Sex facit med oavrundade tal rättade (övning 2.3, 2.5, 2.10, 3.6, 3.9 och 4.9). Samma formatering i vecka 41–45,
      där svaren nu följer postens avrundning (0,60 i stället för 0,6, 12 i stället för 12,0).
    - Inlämning 4–6 pekar på delsidorna med veckosidans numrering (del 2–4). Inlämning 7 säger inte längre att
      inlämning 6 ska vara klar före labben, eftersom labben görs på fredagens lektion och inlämning 6 efteråt.
    - Ny sida i labbhandboken: `labbhandbok/vecka-40.html`, fredagens plan med tidsplan, vad labben kräver från
      måndag, tisdag och torsdag, tre stopp för samtal och vanliga fel.
- **2026-09-29** Vecka 40: hur D används står nu där eleven ser D (upplåst, ändrad, låst igen).
    - Inlämningen: rutan Så används D med ett exempel på insättning (D = 7), elevens egna startvärden för inlämning 4–6
      (bara insättningen, inga svar) och att labben räknar fram värdena själv.
    - Guidade labben: D står överst, med samma förklaring, i stället för bara i det hopfällda protokollet.
    - Labbhandboken (vecka-40.html): ett kort manus för att förklara D och en tabell över hur D används i varje uppgift.
- **2026-09-30** Växelströmslabbet: rubrikradens länkar och Först-rutan sa ”del 1–3” och pekade på den äldre
  genomgångssidan. Nu del 2–4 och delsidorna, som veckosidan (regel 40). Vecka 40 upplåst, ändrad, låst igen.
- **2026-09-30** Utkast `vaxelstromslabbet-utkast/`: en kopia av fredagens labb där Hela bänken visar sladdarna
  (sinus: mätarna och oscilloskopet parallellt över källan; spolen: källa, strömmätare och komponentplatta i serie, med
  pilar för strömmens väg). Originalet och låset för vecka 40 är orörda tills läraren godkänner. Se utkastets README.
- **2026-09-30** Vecka 42: fem 3D-figurer (`figurer3d/sakerhet.mjs`, `verktyg/figurer/figurer3d_v42.py`): v42_01 bild 7
  beröringsspänning (pumpmotor på gummidämpare, isolationsfel, bruten PE, punkterna A och B), bild 8 ljusbåge i ett öppet
  fack, v42_02 bild 7 riskområde och närområde som skal åt alla håll, v42_03 bild 8 frånskilj, lås och märk samt
  spänningsprovning mot L1, L2, L3 och PE, bild 21 jordnings- och kortslutningsdon efter en synligt öppen frånskiljare.
  Etiketterna placeras i spalter (`fig3d.spalter`) och håller 11–13 pt i bildens högra kolumn.
- **2026-09-30** Vecka 41 granskad bild för bild. Rättat: övning 1.4 visade U_{F} = 120 V (uppgiften: 230 V); bild 6 i del 1
  markerar nu 5 ms i kurvan och att rotorn vrids medurs; texten i övning 1.10 låg över en ledning. Övriga figurer stämmer
  (visare, Y/Δ-bleck, resistansnät, effekttriangel, startarens kontakter, tångens varv). Ny kontroll: figurkontroll.py.
  EL-000810–813 reviderade med det skyddade innehållet uppackat (regel 44).

- **2026-09-30** Multimeterlabbet, Station A: R1-kontrollen normaliserar Ω/kΩ så rigg 2, 5 och 6 kan godkännas.
  R2 använder samma kontroll. Regressioner täcker alla riggar, båda spetsordningarna, felkopplingar och steg 3 → 4 → 5.
  Cacheversionerna är uppdaterade; elevframsteg och protokoll behåller sina lagringsnycklar.
  Kontroll: 26 modell-/DOM-tester och 14 Chromium-tester godkända (två pektester gäller bara pekprojekten).
  Station A genomförd i alla nio steg vid 390, 820, 1024 och 1440 px; sparade övningar och protokoll behålls vid omladdning.
