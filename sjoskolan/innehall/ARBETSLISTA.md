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
- [ ] 3 Migrering till poster och placeringar, konfliktlogg. Klart: kapitelövningar (240), simulatorer (53), protokoll (10), v40-kontrollfrågor (8). Kvar: `migrering/familjer_sidor.py` (arbetsblad, förberedelsefrågor, v38, v39_03, v39_04, start/avslutsfrågor, inlämning, tenta, lärarfacit)
- [ ] 4 Kurssidor (klart: `export/kurssidor.py`), arbetsblad, tentamen, inlämning, simulatorer (`uppgifter.gen.mjs` + `funktioner.mjs`), protokoll
- [ ] 4b Lektionsartiklar för vecka 40 del 1–3 ur databasen (mål, förklaring, instrument, exempel, prova själv, labbkoppling, nästa del)
- [ ] 5 Presentationer (pptx, PDF, bildspel) och lärarmaterial (krypterat)
- [ ] 6 Bok: placeringar, export, blockering dokumenterad
- [ ] 7 CI, README, CLAUDE.md, genererade platser märkta
- [ ] 8 Verifiering och slutrapport
