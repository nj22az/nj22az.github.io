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
| `beteckningar.json` | Förkortningar, storheter och enheter med förklaring (RMS, X_{L}, PF …). Ger ordlistan, Beteckningar-rutorna på sidorna, i genomgången och i labbet |

`id-register.json` (alla id, revision, hash) och `utgava.json` (utgåvans fingeravtryck och tunga utdata) genereras av kommandona nedan.

## Modell

- **Permanent id** `EL-000123`: oberoende av vecka, kapitel, titel och nummer. Återanvänds aldrig.
- **Placering**: numrering (`Övning 3`, `10.3`, `E4`), ankare (`v41_02-q3`) och presentationsbild hör till placeringen, inte posten.
  `alias` behåller äldre länkar och sparade id. `innehall.py hitta v41_02-q3` slår upp id.
  `teorikort` anger den exakta rubriken på övningens primära teoriavsnitt i samma del (vecka 41–45).
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
(cd sjoskolan/innehall/bok/sattning && npm ci && node satt.mjs) # separat PDF-sättning ur uppdaterad EPUB-arbetskopia
python3 sjoskolan/innehall/innehall.py kontrollera           # CI: är de genererade filerna aktuella?
python3 sjoskolan/innehall/numrering.py --skriv             # numrera om enligt registret (Övning del.nummer, Inlämning N)
python3 sjoskolan/innehall/innehall.py rapport               # ofullständiga poster, trasiga referenser, versionskrockar
python3 sjoskolan/innehall/innehall.py anvands EL-000123     # var visas övningen?
python3 sjoskolan/innehall/innehall.py hitta v41_02-q3       # id för ett gammalt ankare eller alias
python3 sjoskolan/innehall/innehall.py visa EL-000123        # posten (med skyddade fält om lösenorden finns)
python3 sjoskolan/innehall/innehall.py revidera EL-000123    # höj revisionen efter en ändring (--alla: alla ändrade)
python3 sjoskolan/innehall/innehall.py skyddat packa-upp     # dekryptera skyddade filer till .skyddat/ för redigering
python3 sjoskolan/innehall/innehall.py skyddat packa         # kryptera tillbaka
```

Beroenden: Python 3.11 (standardbiblioteket), Node 22 (kryptering, labbfunktioner). Tunga exportörer: `python-pptx`,
`pymupdf`, `Pillow`, LibreOffice. PDF-sättningen använder dessutom paket från `bok/sattning/package-lock.json`
(paged.js och typsnitt), Playwright och installerad Chromium; se [bokens byggflöde](bok/README.md).

## Så ändrar du en övning

1. Redigera `ovningar/EL-xxxxxx.json` (eller `skyddat packa-upp`, redigera `.skyddat/*.json`, `skyddat packa`).
2. `innehall.py revidera EL-xxxxxx` (höjer revisionen och uppdaterar id-registret).
3. `innehall.py validera` och `innehall.py bygg`. Ändrar du en övning som finns i en presentation eller i boken:
   `bygg presentationer` respektive `bygg bok`. För boken följer PDF-sättning med `bok/sattning/satt.mjs`,
   kryptering, ombyggnad av provkapitel/förhandsbilder och uppdatering av manifest enligt [bok/README.md](bok/README.md).
4. Checka in poster, id-register, utgåva och de genererade filerna tillsammans. CI kör `kontrollera`.

Ny övning: nästa lediga id (se `id-register.json`), en post, en placering på den yta där den ska visas, `revidera`, `bygg`.

## Förkortningar och beteckningar

Varje förkortning eller beteckning som eleverna möter ska finnas i `beteckningar.json` och förklaras första gången i löptexten.
`innehall.py kontrollera` stoppar (även i CI) om en elevsida för vecka 40 innehåller en förkortning som inte finns i ordlistan
(`BETECKNINGSSIDOR` i `innehall.py`; lägg till en vecka där när ordlistan täcker den). Ny beteckning: lägg till en rad med
`former` (hur den står i text), `namn` och `forklaring`; `formel: true` för ensamma bokstäver, `efter_tal` för enheter som
också är vanliga ord (var, rad). Index skrivs alltid med markering: X_{L}, inte XL.

### En storhet, ett skrivsätt

Varje storhet skrivs på samma sätt överallt: kurssidor, labbar, filmer, presentationer, figurer, boken och posterna.
Den kanoniska formen är beteckningens `visa` (eller `kanon`); fältet `avradda` listar varianter som inte får förekomma,
eventuellt med egen ersättning (`"Urms→U_{RMS}"`). Exempel: U_{pp} (inte Upp), û (inte U_{topp}), U_{RMS} (inte Urms),
U_{F} (inte U_{fas}, UF eller Uꜰ), U_{gren}, I_{gren}, I_{L}, I_{N}, X_{L}, X_{C}, Q_{C}, f_{0}.
Index skrivs alltid `X_{L}` och ritas nedsänkt: HTML `<sub>`, SVG `<tspan>`, PowerPoint-körningar, filmernas canvas och
figurernas mathtext (`verktyg/figurer/figlib.py` skriver om etiketterna med samma regler). Låtsasindex (Xᴸ, Iɴ) är inte tillåtna.

```sh
python3 sjoskolan/innehall/notation.py kontrollera                   # lista avvikelser (ingår i innehall.py kontrollera, CI)
python3 sjoskolan/innehall/notation.py skriv-om                      # sidtext, labbarnas, filmernas och figurernas strängar
python3 sjoskolan/innehall/notation.py skriv-om --poster             # även poster och uppackade skyddade filer (.skyddat/)
python3 sjoskolan/innehall/notation.py skriv-om --presentationer     # även presentationerna (pptx), formateringen behålls
```

Efter `--poster`: `revidera --alla` och `bygg`. Efter `--presentationer`: PDF och bildspel (`verktyg/bildspel/bygg.py`).
Presentationerna kontrolleras via bildspelens `data.json`, som behåller index som markering.
Kodnycklar (`storhet: 'XL'`, `q: 'IN'`) är inte text och lämnas; ett inmatningsfält kan inte visa index, så labbprotokollet
visar en förifylld storhet med index som text och en formel med index som ledtråd under fältet.

## Genererade platser

Genererade regioner i befintliga sidor är märkta `<!-- innehall:start … -->` … `<!-- innehall:slut … -->`.
Hela filer som genereras börjar med `// GENERERAD FIL` (`*/uppgifter.gen.mjs`, `vecka-40/aktuell/kontrollfragor.gen.mjs`).
Presentationernas övningsbilder, bildspelen, `gemensamt/Lararguide.html` och `elteknik/files/bok.epub.enc` byggs av de tunga exportörerna.
Bokens PDF sätts därefter ur EPUB-arbetskopian till `bok/.bok/bok.ny.pdf` och krypteras till `elteknik/files/bok.pdf.enc`.
`bygg bok` och `bok.py packa` uppdaterar EPUB:en; de kör inte PDF-sättningen eller bygger provkapitel och förhandsbilder.
Den rättade septemberutgåvan i `462f9d8cf88f9b8d5a37217c2325828b998c2696` har 223 PDF-sidor och ett 18-sidigt
provkapitel enligt `elteknik/files/manifest.json`. Klartext i `bok/.bok/` och `.skyddat/` får aldrig checkas in.

## Migreringen

`migrering/` innehåller engångsskripten (`extrahera.py` med `kallor.py`, `familjer.py`, `familjer_sidor.py`, `labbar.mjs`),
inventeringen (`INVENTERING.md`, `inventering.json`), konfliktloggen (`konflikter.json`) och talkontrollen (`numerik.json`).
De läser källorna ur git-revisionen `8cabde3` och körs inte igen efter migreringen. Boken: se `bok/README.md`.

## Teorikort och övningar vecka 41–45

Alla 150 övningsplaceringar i `placeringar/kurs-formelstod.json` har ett granskat `teorikort`.
Fältet går genom SQLite och `Atkomst` till `export/delsidor_veckor.py`. Det väljer det primära
teoriavsnitt som eleven ska läsa före övningen. Samma referens används för kortets **Öva nu** och
övningens **Ledtråd 1**; ämnet väljs aldrig genom ordlikhet eller en reservregel för lektionspass.

Ny övning: välj en befintlig, ämnesmässigt relevant teorirubrik i samma del. Finns inget sådant avsnitt,
komplettera teorikällan innan övningen läggs in. Rubriken måste matcha exakt en teoribild i delens
presentation. Bygg och kontroll stoppar vid saknad, omdöpt eller tvetydig rubrik; bilder får flyttas,
eftersom kortnummer och länkar räknas om. Vid avsiktligt namnbyte uppdateras även placeringarna.
Övnings-id, nummer, ankare och sparade elevdata ändras inte av teorikopplingen.

```sh
python3 sjoskolan/innehall/innehall.py bygg delsidor_veckor
python3 -m unittest discover -s sjoskolan/innehall/tests -p 'test_*.py'
python3 sjoskolan/innehall/innehall.py kontrollera
```

Testet följer samtliga placeringar genom databasen till båda länkriktningarna och jämför publicerade
sidor med exporten. Namngivna ämnesfall skyddar bland annat trefaseffekt, beröringsspänning,
apparater, isolation och repetition. Septembergranskningen 2026 flyttade 76 kopplingar till ett mer
relevant kort (vecka 41: 12, vecka 42: 14, vecka 43: 19, vecka 44: 13, vecka 45: 18).

## Sammanhängande arbetsrum vecka 40

`studieplan-v40.json` anger ordning, förklaringar som varje övning behöver och de gemensamma instrumentkorten.
Fältet `vagledning` anger varje dels syfte, arbetsuppdrag, läsuppdrag och slutmål. Veckostarten och arbetsrummet
använder samma data. Övningarnas `syfte` förklarar vad eleven tränar, och `stopp` visar gränsen mellan lektion och
hemarbete. Övningarna följer numreringen i veckoplanen; förklaringen ligger alltid före uppgiften.
Exportören `arbetsrum` hämtar 30 växelströmsövningar och fyra måndagsuppgifter genom `Atkomst(..., 'elev')` och
skriver `vecka-40/aktuell/arbetsrum.gen.mjs`. Uppgifter, stegvis offentlig studievägledning (`losning.text`),
ledtrådar och kontrollerbara svar redigeras endast i övningsposterna. Bokens skyddade `losning.steg` och
lärarfält används inte av elevexportören. Den nya offentliga vägledningen är separat författad för elevens arbete.

`Genomgang.html` är elevens gemensamma arbetsrum. Gamla länkar till Formelstöd och Elevuppgifter leder till
rätt uppgift där. `?las=1` visar respektive blad för utskrift utan interaktiv rättning; instrumentkorten och
figur 04 är även inbäddade i måndagens utskriftsblad. `veckosidor/bygg.py` bygger den förenklade veckostarten.

`studieprogress.mjs` sparar lästa avsnitt, utkast, försök, visade lösningar och behov av hjälp under
`sj-v40-studie-v1`. Läsmarkeringen kräver att alla textblock har visats i den synliga sidan; den bevisar inte
förståelse. Tomma eller upprepade svar räknas inte som nya försök. Lösningen blir tillgänglig efter två
olika giltigt ifyllda försök eller ett rätt svar. Öppna motiveringar bedöms av läraren. Gamla manuella
bockar räknas inte längre i QR-resultatets oförändrade bitfält; inlämningssvar och labbdata behålls.
Detta är pedagogisk hjälp i en statisk klient, inte ett skydd mot att läsa publika svar i källkoden.

Tester efter `npm ci` i `vaxelstromslabbet`:

```sh
node --test sjoskolan/vecka-40/aktuell/arbetsrum*.test.mjs
node --test sjoskolan/vecka-40/aktuell/resultat*.test.mjs
```

Browserkontrollen körs med `node sjoskolan/verktyg/qa/week40-workspace.cjs` när Playwright och Chromium finns.
Sätt vid behov `PLAYWRIGHT_MODULE` till modulens absoluta sökväg och `BROWSER_EXECUTABLE` till Chromium.
