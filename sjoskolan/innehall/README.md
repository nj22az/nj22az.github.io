# Sjöskolans innehållsdatabas

En enda redigerbar källa för kursens och bokens övningar, ledtrådar, lösningar, labbuppgifter och lärarfacit.
Allt annat (kurssidor, simulatorernas uppgiftsfiler, presentationer, bildspel, arbetsblad, inlämning, tenta,
lärarguide, boken) genereras härifrån och får aldrig redigeras direkt.

## Redigerbara källor

| Fil | Innehåll |
|---|---|
| `ovningar/EL-xxxxxx.json` | En post per övning: publika fält (schema `schema/ovning.schema.json`) |
| `skyddat/larare.enc` | Lärarfält (`larare.*`) och lärarposter. Krypterad med lärarlösenordet (`LARARLOSEN`) |
| `skyddat/bok.enc` | Bokens lösningar, figurer, ursprungliga avsnitt och bokens egna övningar. Krypterad med bokens lösenord (`BOKLOSEN`) |
| `placeringar/*.json` | Var övningarna visas: yta, fil, del, ordning, visningsnummer, ankare, presentationsbild och textformer, alias |
| `teori.json` | Lärandemål (LM-1…9) och teoriavsnitt (T-…) som posterna hänvisar till |

`id-register.json` (alla id, revision, hash) och `utgava.json` (utgåvans fingeravtryck och tunga utdata) genereras av kommandona nedan.

## Modell

- **Permanent id** `EL-000123`: oberoende av vecka, kapitel, titel och nummer. Återanvänds aldrig.
- **Placering**: numrering (`Övning 3`, `10.3`, `E4`), ankare (`v41_02-q3`) och presentationsbild hör till placeringen, inte posten.
  `alias` behåller äldre länkar och sparade id. `innehall.py hitta v41_02-q3` slår upp id.
- **Parametrar och svar**: `parametrar` är strukturerade värden, `losning.svar[]` strukturerade svar med tolerans och
  `berakning` = id för en registrerad funktion i `lib/berakningar.py`. Innehållet innehåller aldrig kod.
  Labbarnas kontrollfunktioner registreras i `<labb>/funktioner.mjs` och refereras med id.
- **Ledtrådar i steg**: `begrepp` (vad betyder storheterna), `metod` (hur går jag vidare), `nasta-steg`.
  Boken visar dem ihopskrivna som Metod-rad.
- **Varianter**: fysisk och simulerad labb är skilda poster som pekar på varandra (`labb.fysisk_variant`, `labb.simulerad_variant`).
- **Versioner**: schemaversion (`lib/katalog.py SCHEMA_VERSION`), innehållsrevision per post (`revision`, höjs med
  `innehall.py revidera`), utgåvans fingeravtryck (`utgava.json`, `innehall/ut/id-register.json`).
- **Publik**: `elev` (öppet), `larare`, `bok`. Skyddade fält ligger alltid i de krypterade filerna; åtkomstlagret
  (`lib/atkomst.py`) filtrerar per publik så att en elevexportör inte kan skriva skyddat innehåll.
- **Granskning**: `granskning.status` migrerad, utkast, att-granska, granskad. `numeriskt_kontrollerad` när svaret
  räknats oberoende.

## Kommandon

```sh
python3 sjoskolan/innehall/innehall.py validera              # schema, referenser, revisioner, beräkningar
python3 sjoskolan/innehall/innehall.py bygg                  # SQLite + kurssidor, simulatorer, arbetsblad, inlämning, tenta, id-register
python3 sjoskolan/innehall/innehall.py bygg presentationer   # pptx, PDF (LibreOffice) och bildspel
LARARLOSEN=… LARARGUIDE_KLARTEXT=… python3 sjoskolan/innehall/innehall.py bygg larare   # lärarguiden (krypterad)
BOKLOSEN=… python3 sjoskolan/innehall/innehall.py bygg bok   # bokens EPUB (kräver bok/bok.py packa-upp)
python3 sjoskolan/innehall/innehall.py kontrollera           # CI: är de genererade filerna aktuella?
python3 sjoskolan/innehall/innehall.py rapport               # ofullständiga poster, trasiga referenser, versionskrockar
python3 sjoskolan/innehall/innehall.py anvands EL-000123     # var visas övningen?
python3 sjoskolan/innehall/innehall.py hitta v41_02-q3       # id för ett gammalt ankare eller alias
python3 sjoskolan/innehall/innehall.py visa EL-000123        # posten (med skyddade fält om lösenorden finns)
python3 sjoskolan/innehall/innehall.py revidera EL-000123    # höj revisionen efter en ändring (--alla: alla ändrade)
python3 sjoskolan/innehall/innehall.py skyddat packa-upp     # dekryptera skyddade filer till .skyddat/ för redigering
python3 sjoskolan/innehall/innehall.py skyddat packa         # kryptera tillbaka
```

Beroenden: Python 3.11 (standardbiblioteket), Node 22 (kryptering, labbfunktioner). Tunga exportörer: `python-pptx`,
`pymupdf`, `Pillow`, LibreOffice.

## Så ändrar du en övning

1. Redigera `ovningar/EL-xxxxxx.json` (eller `skyddat packa-upp`, redigera `.skyddat/*.json`, `skyddat packa`).
2. `innehall.py revidera EL-xxxxxx` (höjer revisionen och uppdaterar id-registret).
3. `innehall.py validera` och `innehall.py bygg`. Ändrar du en övning som finns i en presentation eller i boken:
   `bygg presentationer` respektive `bygg bok` (och sätt om PDF:en utanför repot).
4. Checka in poster, id-register, utgåva och de genererade filerna tillsammans. CI kör `kontrollera`.

Ny övning: nästa lediga id (se `id-register.json`), en post, en placering på den yta där den ska visas, `revidera`, `bygg`.

## Genererade platser

Genererade regioner i befintliga sidor är märkta `<!-- innehall:start … -->` … `<!-- innehall:slut … -->`.
Hela filer som genereras börjar med `// GENERERAD FIL` (`*/uppgifter.gen.mjs`, `vecka-40/aktuell/kontrollfragor.gen.mjs`).
Presentationernas övningsbilder, bildspelen, `gemensamt/Lararguide.html` och `elteknik/files/bok.epub.enc` byggs av de tunga exportörerna.

## Migreringen

`migrering/` innehåller engångsskripten (`extrahera.py` med `kallor.py`, `familjer.py`, `familjer_sidor.py`, `labbar.mjs`),
inventeringen (`INVENTERING.md`, `inventering.json`), konfliktloggen (`konflikter.json`) och talkontrollen (`numerik.json`).
De läser källorna ur git-revisionen `8cabde3` och körs inte igen efter migreringen. Boken: se `bok/README.md`.
