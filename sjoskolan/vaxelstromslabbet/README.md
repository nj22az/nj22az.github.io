# Växelströmslabbet · Sjöskolan

Interaktivt stöd till vecka 40: `v40_01 Sinusformad växelspänning`, `v40_02 Reaktans och impedans` och `v40_03 Effekt i växelströmskretsar`.

Live: https://nj22az.github.io/sjoskolan/vaxelstromslabbet/

## Innehåll

1. **Sinus och effektivvärde.** Välj kurvform (sinus, fyrkant, triangel), effektivvärde, frekvens och tidsaxel. Kurvan visar perioden T, effektivvärdet som streckad linje och en flyttbar tidpunkt med momentanvärdet. En andra signal kan förskjutas med Δt, och fasvinkeln visas.
2. **Reaktans och impedans.** Seriekrets R, RL, RC eller RLC. Visar kretsschema, visardiagram för spänningarna, u och i över tiden och strömmen som funktion av frekvensen med resonansfrekvens.
3. **Effekt och kompensering.** Enfaslast med P, PF och karaktär. Visar effekttriangeln, hur en kondensator (Qᶜ) minskar S och I, kabelförlusten I²R före och efter samt momentan effekt p = u · i.

**Räkna först:** tolv uppgifter, fyra per flik. Parametrarna ställs in och låses, och det sökta värdet döljs med ”?”. Svaret godkänns inom ±1–2 % (vinklar ±0,6–0,8°). Vid fel svar ges riktad återkoppling för faktor 1 000, fel tecken och faktor √2. Ledtråd och facit visas efter två försök. Uppgifterna använder andra tal än presentationernas övningar.

Direktlänkar: `?flik=sinus|impedans|effekt` och `&uppgift=period|topp|moment|fas|xl|strom|rc|resonans|skenbar|reaktiv|matstrom|kompensering`.

## Teknik och modell

Statisk HTML/CSS/ES-moduler, inga beroenden eller byggsteg. `model.mjs` innehåller beräkningarna, `lessons.mjs` avläsningar och uppgifter och `app.mjs` reglage och SVG-ritning. Framsteg sparas i `localStorage` (nyckel `sjoskolan-vaxelstrom-v1`) med felhantering om lagring är blockerad.

Modellen förutsätter ideal källa, stationär sinus och ideala, linjära komponenter. Spolen saknar resistans och kondensatorn läckström. Effektfliken antar sinusformad ström (PF = cos φ). Övertoner, mättning, uppvärmning, inkopplingsförlopp och toleranser simuleras inte.

## Verifiering

```sh
python3 -m http.server 8000
node --test sjoskolan/vaxelstromslabbet/model.test.mjs
```

16 tester godkända den 25 september 2026. Testerna täcker presentationernas räkneexempel (230 V → 325 V, 30 V topp-topp, RL 12/16 Ω vid 60 V, RC −53,1°, 0,10 H och 100 µF vid 50 Hz, resonans, effekttriangel 900 W/1 200 var, kompensering PF 0,5 → 1), medeleffekt noll för ren reaktans, svensk talformatering och facit för alla tolv uppgifter. Alla uppgifter har också lösts i Chromium via direktlänk. Sidan har ingen horisontell rullning vid 390 px bredd.
