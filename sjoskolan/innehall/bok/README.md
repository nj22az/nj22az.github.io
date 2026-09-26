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
- **PDF**: sättningen (7×10 tum) gjordes utanför repot och kan inte byggas om här. Efter en EPUB-ändring måste
  PDF:en sättas om separat och krypteras med samma format (`lib/krypto.mjs kryptera`). Tills dess är PDF och EPUB olika.
- Rättigheter: © Nils Johansson. Kredit- och rättighetsraderna i boken ändras inte av verktygen.
