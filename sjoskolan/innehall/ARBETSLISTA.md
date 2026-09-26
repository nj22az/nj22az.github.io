# Arbetslista: gemensam övningsdatabas

Status för migreringen till en enda innehållskälla. Uppdateras under arbetet så att det kan återupptas.

## Beslut

- Redigerbar källa: `sjoskolan/innehall/ovningar/*.json` (publika fält) och `sjoskolan/innehall/larare.enc` (lärarfält, krypterad med samma lösenord och format som lärarsidorna). Inget annat är redigerbart.
- Databas: SQLite byggs av `innehall.py bygg` till `sjoskolan/innehall/build/innehall.sqlite` (genereras, ingår inte i git).
- Åtkomstlager: `sjoskolan/innehall/lib/` (Python, bara standardbiblioteket). Alla exportörer läser databasen därigenom.
- Webben är statisk (GitHub Pages). Exporterna (HTML-regioner och simulatordata) genereras och checkas in. CI kontrollerar att de inte är inaktuella.
- Boken *Elteknik och ellära för sjöfart och industri* (24 kapitel): redigerbar källa saknas i båda repona. Den publicerade EPUB:en är arbetskopia (`bok/bok.py`, klartext i `bok/.bok/`, aldrig i git). Bokens lösningar, figurer och egna övningar ligger i `skyddat/bok.enc` (BOKLOSEN). PDF:en kan inte byggas om här. Se `migrering/INVENTERING.md` och `bok/ANDRINGAR.md`.
- Lärarfält ligger i `skyddat/larare.enc` (LARARLOSEN, samma lösenord som lärarportalen).

## Steg

- [x] 1 Inventering av källor och förekomster (`migrering/inventering.json`, `INVENTERING.md`)
- [x] 2 Schema, validering, SQLite, åtkomstlager, CLI (`innehall.py`)
- [x] 3 Migrering till poster och placeringar, konfliktlogg (448 poster, 832 placeringar, 10 ytor)
- [x] 4 Kurssidor, simulatorer (`uppgifter.gen.mjs` + `funktioner.mjs`), arbetsblad, inlämning, tenta, protokoll (protokollposterna finns; protokollmodulerna läses fortfarande ur `*-protokoll.mjs`, se INVENTERING.md 5)
- [x] 4b Lektionsartiklar för vecka 40 del 1–3 (`export/lektioner.py`, `vecka-40/aktuell/Lektion_N.html`)
- [x] 5 Presentationer (pptx, PDF, bildspel) och lärarguiden (krypterad, facit för D = 1–31)
- [x] 6 Bok: EPUB byggs ur databasen och krypteras om; PDF kan inte byggas i repot (dokumenterat i `bok/README.md`)
- [x] 7 CI (`validera` + `kontrollera`), README, CLAUDE.md, genererade platser märkta
- [x] 8 Verifiering (delad ändring i kurssida, simulator, pptx, bildspel och bok; talkontroll; labbtester; rendering) och slutrapport (`SLUTRAPPORT.md`)
