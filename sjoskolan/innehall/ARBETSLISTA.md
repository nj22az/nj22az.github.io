# Arbetslista: gemensam övningsdatabas

Status för migreringen till en enda innehållskälla. Uppdateras under arbetet så att det kan återupptas.
Bokstatus uppdaterad 27 september 2026 efter `462f9d8cf88f9b8d5a37217c2325828b998c2696` på `main`.

## Beslut

- Redigerbara innehållskällor: `sjoskolan/innehall/ovningar/*.json`, `skyddat/larare.enc`, `skyddat/bok.enc`, placeringar och teoridata enligt [README](README.md). Genererade övningar redigeras aldrig direkt.
- Databas: SQLite byggs av `innehall.py bygg` till `sjoskolan/innehall/build/innehall.sqlite` (genereras, ingår inte i git).
- Åtkomstlager: `sjoskolan/innehall/lib/` (Python, bara standardbiblioteket). Alla exportörer läser databasen därigenom.
- Webben är statisk (GitHub Pages). Exporterna (HTML-regioner och simulatordata) genereras och checkas in. CI kontrollerar att de inte är inaktuella.
- Boken *Elteknik och ellära för sjöfart och industri* (24 kapitel): det ursprungliga bokmanuset saknas i repona; den publicerade EPUB:en används som arbetskopia (`bok/bok.py`, klartext i `bok/.bok/`, aldrig i git). Övningsinnehållets källa är databasen; lösningar, figurer och egna övningar ligger i `skyddat/bok.enc` (BOKLOSEN). PDF sätts i repot med `bok/sattning/satt.mjs` efter `innehall.py bygg bok`. Septemberutgåvan är ombyggd till 223 sidor med uppdaterat provkapitel, förhandsbilder och manifest. Se [bok/README.md](bok/README.md) för hela byggflödet.
- Lärarfält ligger i `skyddat/larare.enc` (LARARLOSEN, samma lösenord som lärarportalen).

## Steg

- [x] 1 Inventering av källor och förekomster (`migrering/inventering.json`, `INVENTERING.md`)
- [x] 2 Schema, validering, SQLite, åtkomstlager, CLI (`innehall.py`)
- [x] 3 Migrering till poster och placeringar, konfliktlogg (448 poster, 832 placeringar, 10 ytor)
- [x] 4 Kurssidor, simulatorer (`uppgifter.gen.mjs` + `funktioner.mjs`), arbetsblad, inlämning, tenta, protokoll (protokollposterna finns; protokollmodulerna läses fortfarande ur `*-protokoll.mjs`, se INVENTERING.md 5)
- [x] 4b Lektionsartiklar för vecka 40 del 1–3 (`export/lektioner.py`, `vecka-40/aktuell/Lektion_N.html`)
- [x] 5 Presentationer (pptx, PDF, bildspel) och lärarguiden (krypterad, facit för D = 1–31)
- [x] 6 Bok: EPUB byggs ur databasen och krypteras om; PDF sätts ur EPUB med repots `bok/sattning/satt.mjs`. Rättad septemberutgåva publicerad i `462f9d8`: 223 sidor, provkapitel och förhandsbilder ombyggda, manifest uppdaterat. PDF-kryptering och publiceringsfiler är separata steg enligt `bok/README.md`.
- [x] 7 CI (`validera` + `kontrollera`), README, CLAUDE.md, genererade platser märkta
- [x] 8 Verifiering (delad ändring i kurssida, simulator, pptx, bildspel och bok; talkontroll; labbtester; rendering) och slutrapport (`SLUTRAPPORT.md`)

EL-000048 och EL-000100 är numeriskt kontrollerade i `462f9d8`; de äldre talflaggorna i bokrapporten är utredda.
Källposterna har fortfarande status `att-granska`. Övriga öppna punkter finns i [SLUTRAPPORT.md](SLUTRAPPORT.md).
