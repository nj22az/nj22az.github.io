# Byggkällor för AC, revision 25 september 2026

Undervisningsinnehållet finns i `../../vecka-40/aktuell/lektioner.mjs`. De tre stegfilmerna (`Kortfilmer.html`) har svensk text och inget ljud: sex steg à 20 sekunder, med paus, stegning och takt 0,75–1,25×. Rörelse följer `prefers-reduced-motion`. Exemplen kommer från hemmet och fartyget och får inte vara svaret på labbens uppgifter.

## Presentationer

`build-decks.mjs` importerar de arkiverade originalen. Omslag, 4:3-format, Calibri och Sjöskolans sidfot bevaras. Text, kurvdiagram och geometriska trianglar är redigerbara. Byggningen kräver `@oai/artifact-tool` och den installerade Presentations-skillens verifieringsverktyg. Ange `PRESENTATION_SKILL_ROOT` samt miljöns `CODEX_PRIMARY_RUNTIME_PYTHON`, `RUNTIME_NODE`, `RUNTIME_NODE_MODULES`, `RUNTIME_BIN_DIR` och `RUNTIME_PYTHON`.

```sh
node sjoskolan/verktyg/ac/build-decks.mjs /absolute/path/to/fresh-build-directory
```

Finaliseraren skriver aldrig över en tidigare slutfil eller verifieringsrapport. Använd en ny byggkatalog, granska de renderade bilderna och kopiera därefter de verifierade PowerPoint-filerna från `output-final` till veckans katalog.

Presentationerna kan också uppdateras direkt: stycken skrivs med `satt_stycke` i `innehall/export/presentationer.py` (behåller nedsänkta index), och PDF och bildspel byggs med `pdf_och_bildspel`.

Kurvdiagram och trianglar i presentationerna är bilder ur `../../vecka-40/aktuell/visuals.mjs` (samma figurer som webben).
Rita om dem efter ändringar med `python3 sjoskolan/verktyg/ac/figurbilder.py`, bygg sedan PDF och bildspel och kör
`verktyg/larare/lararnoter.py` för lärarkopiorna.
