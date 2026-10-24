# Slutrapport: gemensam övningsdatabas för Sjöskolan och boken

Migreringen genomfördes på gren `claude/sjoskolan-elteknik-audit-f9oark`, 26 september 2026. Bokstatus uppdaterad för `main`, 27 september 2026, efter commit `462f9d8cf88f9b8d5a37217c2325828b998c2696`. Inventering: `migrering/INVENTERING.md`. Arbetslista: `ARBETSLISTA.md`.

Den rättade septemberutgåvan har en **223-sidig PDF**, satt ur EPUB-arbetskopian med repots `bok/sattning/satt.mjs`.
PDF, EPUB, provkapitel, förhandsbilder och manifest uppdaterades i samma commit. Den tidigare PDF-blockeringen är löst.
Siffrorna och testerna nedan avser migreringens verifiering där inget annat anges.

## Resultat i siffror

| | |
|---|---|
| Förekomster inventerade och migrerade | 1 058 (bok 480, kurssidor 200, presentationer 170 + 137 frågor och övningar, simulatorer 58, protokoll 10, inlämning 28, tenta 12) |
| Poster | 448 (408 publika, 40 bokens egna i `skyddat/bok.enc`) |
| Placeringar / ytor | 832 / 10 (bok, kurs-formelstod, presentation, presentation-fragor, simulator, protokoll, genomgang-v40, arbetsblad, inlamning, tentamen) |
| Loggade konfliktbeslut | 558 (`migrering/konflikter.json`) |
| Oberoende talkontroll bok mot kurs | Ursprungligen 113 överens, 85 utan tal, 2 flaggade. Båda flaggorna utredda i `462f9d8`: inga räknefel eller motsägelser; se posterna EL-000048 och EL-000100 |
| Registrerade beräkningsfunktioner | 49 i `lib/berakningar.py` + 23 lärarfacitfunktioner (D) + 24 labbfunktioner i `*/funktioner.mjs` |
| Poster märkta numeriskt kontrollerade | 150 |
| Valideringsfel | 0 (`innehall.py validera`) |
| Genererade utdata | 7 kurssidor, 6 simulatorfiler, 4 arbetsblad, 9 inlämningssidor, tentan, id-register, 3 lektionsartiklar, 24 presentationer (21 omskrivna, PDF + 29 bildspel), lärarguiden (krypterad), bokens EPUB (51 avsnitt omskrivna, 429 byte för byte oförändrade) |
| Tester | alla labbtester gröna (trefas 10, hållkrets 7, isolation 8, växelström 28, multimeter 24, protokoll 6, las 1), filmkontrollen grön |

## Vad som byggdes

- **Redigerbar källa**: `ovningar/*.json` (schema med validering), `placeringar/*.json`, `teori.json`, `skyddat/larare.enc`, `skyddat/bok.enc`.
- **SQLite** genereras (`build/innehall.sqlite`, migreringar `migreringar/00N_*.sql`, `PRAGMA user_version`), aldrig redigerad.
- **Åtkomstlager** `lib/atkomst.py` per publik (elev, larare, bok): en elevexportör kan inte läsa skyddade fält.
- **Exportörer** i `export/`: kurssidor (regioner med ledtrådar i två steg), simulatorer (`uppgifter.gen.mjs`, `kontrollfragor.gen.mjs`), arbetsblad, inlämning, tentamen, id-register, lektioner (artiklar), presentationer (pptx med bevarad formatering, PDF, bildspel), lärare (lärarguide, facit för D = 1–31 förberäknat), bok (EPUB-avsnitt, omkryptering).
- **CLI** `innehall.py`: validera, bygg, kontrollera, rapport, anvands, hitta, visa, revidera, skyddat packa-upp/packa.
- **CI**: `.github/workflows/sjoskolan.yml` kör `validera` och `kontrollera` (inaktuella genererade filer stoppar bygget).
- **Bokens arbetsmapp** `bok/` (`packa-upp`, `granska`, `packa`), klartext aldrig i git.
- **Bokens PDF-sättning** `bok/sattning/satt.mjs`: paged.js i Chromium, 7×10 tum, Source Serif 4 och Source Sans 3. Skriver `bok/.bok/bok.ny.pdf`; sidnummer för innehåll, uppgift/lösning och sakregister räknas fram i upprepade pass. Sättning och publiceringsfiler är separata steg efter `bygg bok`; se [bokens byggflöde](bok/README.md).
- **Lektionsartiklar** vecka 40 del 1–3 (`vecka-40/aktuell/Lektion_N.html`), enligt den beställda ordningen.

## Verifierat

- **Delad ändring**: en ledtråd i EL-000047 och EL-000301 ändrades, `revidera`, `bygg`, `bygg presentationer`, `bygg bok`. Markören dök upp i kurssidan (v39), `trefaslabbet/uppgifter.gen.mjs`, presentationen v39_02 bild 37, bildspelet och bokens ch010.xhtml; revisionerna höjdes till 2. Återställt och ombyggt: inga diffar.
- **Idempotens**: `bygg presentationer` och `bygg bok` andra gången ändrar inget; `kontrollera` grön med och utan lösenord.
- **Trohet**: arbetsblad, elevuppgifter, fördjupning och inlämning är textidentiska med sidorna före migreringen; kurssidor och tenta skiljer sig bara i markering (`<sub>`) och tillagda ledtrådar; multimeterpresentationen (kontrollformer) stämmer med posterna.
- **Rendering**: labbarna (markering `X_{L}` → `<sub>`), lektionsartiklarna (dator och telefon, 7 figurer, ingen horisontell rullning) och omskrivna presentationsbilder (v41_01, v37_04, v39_04) kontrollerade i webbläsare respektive PDF; inga sidfel.
- **Hårdkodat innehåll**: sökning efter övningstext utanför databasen träffar bara genererade regioner och veckosidornas rubriklistor (som läser id-registret). `verktyg/facit/facit.py` borttaget.

## Blockeringar och öppna punkter

1. **Labbprotokollens moduler** (`*-protokoll.mjs`) läser ännu inte sina texter ur databasen (posterna finns); exempelvärdena räknas av modellen vid körning. Nästa exportör: `protokoll.gen.mjs`.
2. **Två poster har kvar granskningsstatus** `att-granska` (EL-000048, EL-000100), men båda är nu `numeriskt_kontrollerad: true` med förklaringar i källposterna. Grenströmmarna i 5.8 stämmer med V_{a} = 6,0 V; 400 V i 10.10 är linjespänningen i resonemanget, inget saknat svarsvärde. Den tidigare rekommendationen att lägga till talen i kursens facit är inte en kvarstående rättning. Statusen ska bedömas separat, inte automatiskt ändras till `granskad`.
3. **Sju ledtrådar** där boken (senare språkgranskning) och kursen skiljer sig: databasen har kursens; se `bok/ANDRINGAR.md`-historik och konfliktloggen (`bokens Metod-rad kunde inte delas entydigt`).
4. Presentationernas talarmanus (`talarmanus`) är tomt i posterna: vecka 40:s anteckningar ligger kvar i `lektioner.mjs`; övriga presentationer saknar anteckningar.

## Så gör du nästa ändring

```sh
# 1. redigera posten
$EDITOR sjoskolan/innehall/ovningar/EL-000047.json
# 2. höj revisionen, validera, bygg
python3 sjoskolan/innehall/innehall.py revidera EL-000047
python3 sjoskolan/innehall/innehall.py validera
python3 sjoskolan/innehall/innehall.py bygg
# 3. om övningen finns i en presentation eller i boken
python3 sjoskolan/innehall/innehall.py bygg presentationer
BOKLOSEN=… python3 sjoskolan/innehall/bok/bok.py packa-upp && BOKLOSEN=… python3 sjoskolan/innehall/innehall.py bygg bok
# 3b. sätt PDF ur den uppdaterade EPUB-arbetskopian
(cd sjoskolan/innehall/bok/sattning && npm ci && node satt.mjs)
# Kryptera sedan PDF, bygg provkapitel/förhandsbilder och uppdatera manifest enligt bok/README.md.
# 4. lärarfält: LARARLOSEN=… innehall.py skyddat packa-upp, redigera .skyddat/larare.json, skyddat packa, bygg larare
python3 sjoskolan/innehall/innehall.py kontrollera
# Checka in ändrade källor och tillhörande genererade filer tillsammans; aldrig klartext i .bok/ eller .skyddat/.
```

Var visas en övning: `innehall.py anvands EL-000047`. Gammal länk: `innehall.py hitta v39_02-q7`.
