# 05 — HEMUPPGIFT VECKA 42 — Felsökning på 24 V fartygskrets
**Tidsåtgång:** cirka 30–45 minuter. **Simulerad** krets, inga praktiska mätningar. LM-4 (DC-teori), LM-5, LM-7, LM-8, LM-9.

## Situation
En navigations-/signallampa matas från ett 24,0 V DC-system. Lampan är modellerad som en resistor på 48 Ω vid arbetspunkten. Ledning och säkring antas ha försumbar resistans när de är hela. Lampan lyser svagt. Du får följande **simulerade** mätvärden med kretsen belastad:

- Mellan matningens plus och minus: **24,0 V**.
- Direkt över lampans två anslutningar: **12,0 V**.
- Spänningsfall mellan matningens plus och lampans plusanslutning: **12,0 V**.
- Spänningsfall på returledningen: **0,0 V**.

## Uppgifter
1. Rita ett enkelt kretsschema med källa, säkring, ledning och lampa.
2. Beräkna lampans ström från den förenklade resistiva modellen. Visa formel och enhet.
3. Använd Kirchhoffs spänningslag: hur kan källans 24 V fördelas i kretsen?
4. Vilken del av kretsen är mest misstänkt? Ge minst två möjliga konkreta felorsaker. Vad kan du **inte** säkert avgöra med givna värden?
5. Beskriv i vilken ordning du skulle undersöka felet på en **säker, frånskild träningskrets**. Vilka kontroller skulle krävas före eventuella mätningar på verklig fartygsanläggning? Inga elever ska utföra sådana mätningar hemma.
6. Skriv ett kort felsökningsprotokoll: symptom, givna mätvärden, beräkning, hypotes, föreslagen kontroll och slutsats.

## Lärarstöd / facit
I = 12/48 = **0,25 A** enligt modellen. Spänningsfall 12 V i matningsvägen + 12 V över lampan + 0 V i retur = 24 V. En onormalt hög serieresistans i plusvägen är misstänkt; motsvarande **48 Ω** i modellen. Möjliga orsaker är dålig kontakt, korrosion eller skadad ledare; givna data skiljer inte dessa åt. Verkliga glödlampor har temperaturberoende resistans, därför är modellen avsiktligt förenklad. Korrekt dokumenterad osäkerhet premieras.
