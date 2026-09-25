# Hållkretslabbet

Interaktiv hållkrets för v41_03 och v43_03: S0 STOPP (NC), S1 START (NO) och K1:s NO-hjälpkontakt.

- Tryck S1 och S0, slå av styrspänningen, lägg in fel (S0 fast öppen, hjälpkontakt, spole, retur).
- Välj punkter för röd och svart sond och läs av mätaren. Flytande punkter visas som ”flytande”.
- Åtta ”Räkna först”-uppgifter med 24 V och 480 Ω. Svaret och grafiska ledtrådar döljs tills eleven svarat.

Filer: `model.mjs` (noder, kontakter och hållning), `lessons.mjs` (uppgifter), `app.mjs` (ritning och interaktion), `model.test.mjs` (`node --test`).
