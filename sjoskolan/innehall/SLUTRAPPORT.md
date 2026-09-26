# Slutrapport: gemensam övningsdatabas för Sjöskolan och boken

Gren `claude/sjoskolan-elteknik-audit-f9oark`, 26 september 2026. Inventering: `migrering/INVENTERING.md`. Arbetslista: `ARBETSLISTA.md`.

## Resultat i siffror

| | |
|---|---|
| Förekomster inventerade och migrerade | 1 058 (bok 480, kurssidor 200, presentationer 170 + 137 frågor och övningar, simulatorer 58, protokoll 10, inlämning 28, tenta 12) |
| Poster | 448 (408 publika, 40 bokens egna i `skyddat/bok.enc`) |
| Placeringar / ytor | 832 / 10 (bok, kurs-formelstod, presentation, presentation-fragor, simulator, protokoll, genomgang-v40, arbetsblad, inlamning, tentamen) |
| Loggade konfliktbeslut | 558 (`migrering/konflikter.json`) |
| Oberoende talkontroll bok mot kurs | 113 överens, 85 utan tal, 2 flaggade (fullständigare svar i boken, inga räknefel) |
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
- **Lektionsartiklar** vecka 40 del 1–3 (`vecka-40/aktuell/Lektion_N.html`), enligt den beställda ordningen.

## Verifierat

- **Delad ändring**: en ledtråd i EL-000047 och EL-000301 ändrades, `revidera`, `bygg`, `bygg presentationer`, `bygg bok`. Markören dök upp i kurssidan (v39), `trefaslabbet/uppgifter.gen.mjs`, presentationen v39_02 bild 37, bildspelet och bokens ch010.xhtml; revisionerna höjdes till 2. Återställt och ombyggt: inga diffar.
- **Idempotens**: `bygg presentationer` och `bygg bok` andra gången ändrar inget; `kontrollera` grön med och utan lösenord.
- **Trohet**: arbetsblad, elevuppgifter, fördjupning och inlämning är textidentiska med sidorna före migreringen; kurssidor och tenta skiljer sig bara i markering (`<sub>`) och tillagda ledtrådar; multimeterpresentationen (kontrollformer) stämmer med posterna.
- **Rendering**: labbarna (markering `X_{L}` → `<sub>`), lektionsartiklarna (dator och telefon, 7 figurer, ingen horisontell rullning) och omskrivna presentationsbilder (v41_01, v37_04, v39_04) kontrollerade i webbläsare respektive PDF; inga sidfel.
- **Hårdkodat innehåll**: sökning efter övningstext utanför databasen träffar bara genererade regioner och veckosidornas rubriklistor (som läser id-registret). `verktyg/facit/facit.py` borttaget.

## Blockeringar och öppna punkter

1. **Bokens PDF** kan inte byggas i repot (7×10-tums sättning gjord utanför). EPUB:en är uppdaterad; PDF:en är den gamla tills den sätts om och krypteras (`lib/krypto.mjs kryptera`).
2. **Labbprotokollens moduler** (`*-protokoll.mjs`) läser ännu inte sina texter ur databasen (posterna finns); exempelvärdena räknas av modellen vid körning. Nästa exportör: `protokoll.gen.mjs`.
3. **Två poster att granska** (EL-000048, EL-000100): boken svarar fullständigare än kursens facit. Rekommendation: lägg till bokens tal i `losning.text`.
4. **Sju ledtrådar** där boken (senare språkgranskning) och kursen skiljer sig: databasen har kursens; se `bok/ANDRINGAR.md`-historik och konfliktloggen (`bokens Metod-rad kunde inte delas entydigt`).
5. Presentationernas talarmanus (`talarmanus`) är tomt i posterna: vecka 40:s anteckningar ligger kvar i `lektioner.mjs`; övriga presentationer saknar anteckningar.

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
# 4. lärarfält: LARARLOSEN=… innehall.py skyddat packa-upp, redigera .skyddat/larare.json, skyddat packa, bygg larare
git add -A && git commit
```

Var visas en övning: `innehall.py anvands EL-000047`. Gammal länk: `innehall.py hitta v39_02-q7`.
