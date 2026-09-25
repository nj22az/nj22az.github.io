# Hållkretslabbet

Interaktiv hållkrets för v41_03 och v43_03: S0 STOPP (NC), S1 START (NO) och K1:s NO-hjälpkontakt.

- Tryck S1 och S0, slå av styrspänningen, lägg in fel (S0 fast öppen, hjälpkontakt, spole, retur).
- Välj punkter för röd och svart sond och läs av mätaren. Flytande punkter visas som ”flytande”.
- Åtta ”Räkna först”-uppgifter med 24 V och 480 Ω. Svaret och grafiska ledtrådar döljs tills eleven svarat.

Filer: `model.mjs` (noder, kontakter och hållning), `lessons.mjs` (uppgifter), `app.mjs` (ritning och interaktion), `model.test.mjs` (`node --test`).

## Labbprotokoll

Station C (`stationC-protokoll.mjs`): felmoduler med slumpat, dolt fel (fem feltyper och ”inget fel”), styrspänning 12 eller 24 V. Labbprotokollet under simulatorn (`../gemensamt/labbprotokoll.mjs`) har kontroller före start, mätningar med förväntat och uppmätt värde, ”Hämta avläsning”, felsökning, analys, utskrift, CSV och ett ifyllt exempel som räknas fram ur modellen. Stationspaket: `vecka-41/aktuell/Simulerade_stationer.html`.
