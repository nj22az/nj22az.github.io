# Arbetsmapp för boken

*Elteknik och ellära för sjöfart och industri* (24 kapitel, 240 övningar) säljs krypterad från `elteknik/`. Bokens
redigerbara källa finns inte i något repository, så den publicerade EPUB-filen används som arbetskopia här.
Klartexten ligger i `.bok/` (i `.gitignore`) och får aldrig checkas in.

```sh
export BOKLOSEN=…                                   # bokens lösenord, aldrig i repot
python3 sjoskolan/innehall/bok/bok.py packa-upp     # .bok/bok.epub, .bok/bok.pdf och .bok/epub/ (uppackad)
python3 sjoskolan/innehall/bok/bok.py granska       # skillnader mot databasen -> ANDRINGAR.md
# redigera .bok/epub/EPUB/text/*.xhtml, eller låt bokexportören skriva övningarna: innehall.py bygg bok
python3 sjoskolan/innehall/bok/bok.py packa         # packar EPUB, krypterar till elteknik/files/bok.epub.enc, uppdaterar manifest
```

- `ANDRINGAR.md`: det boken fortfarande har i äldre form jämfört med databasen. De 200 delade övningarna är
  identiska med kursens; bokens egna 40 övningar (kapitel 1, 2, 3, 6) och alla lösningar ligger i `skyddat/bok.enc`.
- EPUB-struktur: `EPUB/text/ch006–ch032` kapitel 1–24 (övningar som `section.uppgift#chK-qN`),
  `ch034–ch057` lösningar (`section.losning#solK-sN`), `EPUB/media/` figurer, `ch003` lärandemålen.
- `packa` skriver bara om filen när innehållet ändrats, så ett ombyggt arkiv ger ingen ny diff i onödan.
- **PDF**: sätts ur EPUB-arbetskopian med `sattning/` (paged.js i Chromium, 7×10 tum, Source Serif 4 och Source Sans 3):
  `cd sattning && npm ci && node satt.mjs` skriver `.bok/bok.ny.pdf`. Innehåll, sidhänvisningar och sakregister får
  sidnummer i två pass. Kapitlen börjar på ny sida, delsidorna till höger. Kryptera sedan till `elteknik/files/bok.pdf.enc`
  (`lib/krypto.py`), bygg provkapitlet (början t.o.m. kapitel 1 och slutbladet) och uppdatera `manifest.json`.
- **Figurer**: bilderna i `EPUB/media` är PNG (1000 px). Etiketter i bilderna omfattas inte av notationskontrollen;
  kontrollera dem när notationen ändras (fil74 och fil158 ritades om i september 2026: U_F, I_gren).
- Rättigheter: © Nils Johansson. Kredit- och rättighetsraderna i boken ändras inte av verktygen.
