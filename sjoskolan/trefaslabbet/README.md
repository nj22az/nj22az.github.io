# Trefaslabbet · Sjöskolan

Interaktivt stöd till vecka 41: `v41_01 Trefassystemets grunder` och `v41_02 Y, Δ och trefaseffekt`. Sidan använder samma stilmall som Växelströmslabbet.

Live: https://nj22az.github.io/sjoskolan/trefaslabbet/

## Innehåll

1. **Visare och neutralström.** Välj linjespänning (230, 400, 440 eller 690 V) och frekvens (50/60 Hz). Ställ fasströmmarna och en gemensam fasförskjutning. Sidan visar spänningsvisare med Uꜰ och Uᴸ, strömvisare lagda i kedja (visarsumma) och strömmarna över tiden med iɴ.
2. **Bruten neutralledare.** Tre resistiva fas–neutral-laster, där 1 000 Ω betyder frånkopplad. Med hel neutralledare får varje last Uꜰ. Bryts neutralledaren flyttar lastens stjärnpunkt (Millmans sats). Visardiagrammet och staplarna visar vilken last som får överspänning.
3. **Y, Δ och motorns märkning.** Linjespänning, koppling, grenimpedans och cos φ ger Ugren, Igren, Iᴸ, S, P och Q. Märkningarna Δ/Y 230/400, 400/690 och 440/760 V jämförs med nätet. Kopplingsplinten visar rätt eller fel koppling och lindningsspänningen.

**Räkna först:** åtta uppgifter med andra tal än presentationernas övningar och exempel. Typiska fel får en förklaring:
- addera belopp i stället för visare,
- faktor √3 åt fel håll, eller 3 i stället för √3,
- grenström i stället för linjeström,
- Uꜰ trots bruten neutral.

Direktlänkar: `?flik=visare|neutral|ydelta&uppgift=uf|in2|in3|bruten|inr|ystrom|dstrom|p3`.

## Modell

- Symmetrisk, styv källa och stationär sinus.
- Positiv fasföljd: L2 släpar L1 med 120°, och visarna ritas med L1 uppåt och L2 nere till höger.
- Lasterna i flik 2 är resistiva.
- Övertoner, osymmetrisk källa, mättning och inkopplingsförlopp simuleras inte.

## Verifiering

```sh
node --test sjoskolan/trefaslabbet/model.test.mjs
```

Åtta tester godkända den 25 september 2026. De täcker √3-sambandet, neutralström vid symmetri, en fas, två lika faser och 10/10/4 A. De täcker också bruten neutral med två laster i serie och symmetrisk last, presentationens Y/Δ-exempel (20 Ω vid 200 V) och trefaseffekt, motorns koppling, facit för alla uppgifter samt att inga kända felsvar godkänns. Alla uppgifter har lösts i Chromium; sidan har ingen horisontell rullning vid 390 px.
