# Sjöskolan – elevmaterial

Publicerad kursöversikt för kalenderveckor 37–45. `vecka-XX/aktuell/` innehåller aktuella presentationer och övningsstöd.

Multimeterpresentationen är version 7 med 70 bilder. Den fullständiga genomgången publiceras enligt Nils Johanssons instruktion den 24 september 2026 och innehåller stegvisa mätkopplingar, CAT-kategorier, undervisningsövningar med efterföljande facit samt läraranteckningar och källor. Den ersätter version 6 och används från början.

Version 6 med 46 bilder har flyttats oförändrad till `vecka-39/arkiv/2026-09-24/` och länkas som tidigare version på veckosidan. Den separata svenska begreppsguiden och formelstödet länkar till version 7.

Övriga elevpresentationer saknar lösningsbilder, anteckningar, kommentarer och dolda bilder. Genomräknade undervisningsexempel finns kvar. Inga separata prov, lärarfacit eller kursböcker ingår. Lokala lärarfiler är källmaterial och ska kontrolleras före publicering.

`downloads.js` ger nedladdningsbara filer i veckornas aktuella mappar namn med `_nedladdad_ÅÅÅÅ-MM-DD_TT-MM-SS`, enligt besökarens lokala tid vid klicket. Versionsnumret behålls; datumet är nedladdningstid, inte dokumentets ändringsdatum.

## Multimeterlabbet

`multimetersimulator/` kompletterar vecka 39 och multimeterpresentationen med åtta svenska mätövningar och fri övning. Elever väljer funktion/uttag och kopplar mätspetsar. Direkt återkoppling, lokal progress och CSV-protokoll. Se simulatorns README för modellbegränsningar och tester.

## Växelströmslabbet och figurer vecka 40

`vaxelstromslabbet/` kompletterar de tre presentationerna vecka 40 med tre flikar: sinus, impedans och effekt. Den har tolv räkna-först-uppgifter med andra tal än inlämningsövningarna. Se labbets README.

Den 25 september 2026 fick de tre presentationerna vecka 40 43 figurer: en på varje övningsbild och en på utvalda teoribilder. Bland annat har övning 2 i `v40_01` nu den kurva som uppgiften hänvisar till. Figurerna visar givna värden och markerar det som söks med ”?”. Källkoden finns i `verktyg/figurer/`.

### Granskning vecka 40 (25 september 2026)

Figurerna och labbet granskades ur tre perspektiv: lärare, elinstallatör och fartygsingenjör. Därefter gjordes följande ändringar i presentationerna vecka 40:

- **Räkneexempel som avslöjade övningssvar har fått nya tal.** Det gäller v40_02 bild 8 och 21, v40_03 bild 6, 7 och 23.
- **Fartygsexempel har lagts till.** Toppvärde vid 440 och 690 V, energi vid landanslutning, samt att kondensatorbatterier sällan används ombord.
- **Säkerhetsrad om oscilloskop på IT-nät:** v40_01 bild 19.
- **Index skrivs nedsänkt:** X_L, X_C, U_R, Q_C i stället för upphöjda bokstäver.
- **Den felaktiga hänvisningen till bildanteckningar är borttagen.** Det gäller även vecka 39.

