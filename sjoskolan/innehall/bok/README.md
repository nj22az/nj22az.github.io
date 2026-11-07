# Arbetsmapp för boken

*Elteknik och ellära för sjöfart och industri* (24 kapitel, 240 övningar) säljs krypterad från `elteknik/`.
Det ursprungliga bokmanuset finns inte i repona, så den publicerade EPUB-filen används som arbetskopia för bokens
struktur och löptext. **Övningar, ledtrådar och lösningar har sin redigerbara källa i innehållsdatabasen** enligt
[innehall/README.md](../README.md); de får inte redigeras direkt i EPUB, PDF eller andra genererade filer.
Klartexten ligger i `bok/.bok/` (i `.gitignore`) och får aldrig checkas in.

## Rättad septemberutgåva 2026

Commit `462f9d8cf88f9b8d5a37217c2325828b998c2696` byggde om EPUB och PDF: **223 sidor**, 7×10 tum,
Source Serif 4 och Source Sans 3. Titelsida och kolofon anger ”Första upplagan 2026, rättad september 2026”.
`elteknik/files/provkapitel.pdf` (18 sidor), `sida-1.jpg`, `sida-2.jpg` och `manifest.json` uppdaterades samtidigt.
PDF-sättningen finns i repot; detta är inte längre ett externt byggsteg.

## Byggflöde

Kommandona körs från reporoten. `BOKLOSEN` måste finnas i miljön; lösenordet får aldrig sparas i repot.
Utgå från validerade innehållskällor (`revidera`, `validera`, `bygg` enligt huvud-README).

```sh
python3 sjoskolan/innehall/bok/bok.py packa-upp     # .bok/bok.epub, .bok/bok.pdf och .bok/epub/ (uppackad)
python3 sjoskolan/innehall/innehall.py bygg bok    # databas -> EPUB-avsnitt, packning och kryptering av EPUB
(cd sjoskolan/innehall/bok/sattning && npm ci && node satt.mjs)
# Resultat: sjoskolan/innehall/bok/.bok/bok.ny.pdf
LOSEN="$BOKLOSEN" node sjoskolan/innehall/lib/krypto.mjs kryptera \
  sjoskolan/innehall/bok/.bok/bok.ny.pdf elteknik/files/bok.pdf.enc
```

`packa-upp` ersätter EPUB-arbetskopian: kör det före lokala bokändringar, inte mitt i en pågående redigering.
`bygg bok` anropar `bok.py packa` och uppdaterar `bok.epub.enc` samt `epub_bytes` i manifestet. `packa` kan också
köras separat efter ändringar av löptext eller figurer utanför de genererade övnings- och lösningsavsnitten.
Inget av kommandona bygger PDF eller förhandsmaterial automatiskt.

Sättningen kräver Node, paketen i `sattning/package-lock.json` (installeras med `npm ci`) samt Playwright med
Chromium installerad. Playwright ingår inte i detta pakets beroenden: `satt.mjs` söker ett åtkomligt `playwright`-paket
och har en reservsökväg `/opt/node22/lib/node_modules/playwright`. Dessa förutsättningar måste ordnas i byggmiljön.
Skriptet skriver normalt `bok/.bok/bok.ny.pdf`; `--ut` kan ange en annan utfil. Den uppackade `bok/.bok/bok.pdf`
är den tidigare publicerade PDF:en och ersätts inte av standardsättningen.

Efter sättning och kryptering återstår separata publiceringssteg:

1. Kontrollera PDF-layout, innehållsförteckning, sidhänvisningar och sakregister. Sidantalet 223 gäller septemberbygget,
   inte ett fast krav för framtida utgåvor.
2. Bygg `elteknik/files/provkapitel.pdf` ur den nya PDF:en (början t.o.m. kapitel 1 och slutbladet) och förhandsbilderna
   `elteknik/files/sida-1.jpg` och `sida-2.jpg` ur samma utgåva.
3. Uppdatera `elteknik/files/manifest.json`: `pages`, `sample_pages`, `pdf_bytes`, `epub_bytes`, `sample_bytes`.
   Bokformatens bytevärden avser klartextfilerna, inte `.enc`-filerna. Behåll krypteringsparametrarna.
4. Kör `python3 sjoskolan/innehall/innehall.py kontrollera` och checka in ändrade innehållskällor och tillhörande
   genererade filer tillsammans. Klartext i `.bok/` och `../.skyddat/` ska förbli utanför git.

## Granskning och struktur

- `python3 sjoskolan/innehall/bok/bok.py granska` jämför den uppackade EPUB:en med databasen och skriver
  `ANDRINGAR.md`. Rapporten är en ögonblicksbild, inte en separat innehållskälla. Den äldre rapportens två talflaggor
  (EL-000048 och EL-000100) utreddes i `462f9d8`: aktuella källposter har förklarande kommentarer och
  `numeriskt_kontrollerad: true`, men status är fortfarande `att-granska`. Det innebär inte två saknade bokrättningar.
  En fullständig ny EPUB-jämförelse kräver `BOKLOSEN` och en aktuell uppackad arbetskopia.
- Granskningsverktyget har ännu en äldre `U_{F}` → `U_{fas}`-mappning i sin jämförelse (`bok.py`, `bokform`).
  Sådana notationsskillnader i rapporten ska bedömas mot `../beteckningar.json`; den rättade boken använder samma
  notation som kursen. Ändra inte innehållskällorna till den äldre boknotationen för att tysta rapporten.
- De 200 delade övningarna exporteras ur samma poster som kursens. Bokens egna 40 övningar (kapitel 1, 2, 3, 6)
  och lösningarnas skyddade fält ligger i `skyddat/bok.enc` under `innehall/`.
- EPUB-struktur: `EPUB/text/ch006–ch032` kapitel 1–24 (övningar som `section.uppgift#chK-qN`),
  `ch034–ch057` lösningar (`section.losning#solK-sN`), `EPUB/media/` figurer, `ch003` lärandemålen.
- `packa` skriver bara om filen när innehållet ändrats, så ett ombyggt arkiv ger ingen ny diff i onödan.
- **PDF**: sätts ur EPUB-arbetskopian med `sattning/` (paged.js i Chromium, 7×10 tum, Source Serif 4 och Source Sans 3):
  innehåll, sidhänvisningar och sakregister får sidnummer genom pass med platshållare och inräknade sidnummer,
  upprepade tills sidindelningen är stabil. Kapitlen börjar på ny sida, delsidorna till höger.
- **Figurer**: bilderna i `EPUB/media` är PNG (1000 px). Etiketter i bilderna omfattas inte av notationskontrollen;
  kontrollera dem när notationen ändras (fil74 och fil158 ritades om i september 2026: U_F, I_gren).
- Rättigheter: © Nils Johansson. Kredit- och rättighetsraderna i boken ändras inte av verktygen.
