# Växelströmslabbet · Sjöskolan

Interaktivt stöd till vecka 40: `v40_01 Sinusformad växelspänning`, `v40_02 Reaktans och impedans` och `v40_03 Effekt i växelströmskretsar`.

Live: https://nj22az.github.io/sjoskolan/vaxelstromslabbet/

## Innehåll

1. **Sinus och effektivvärde.** Välj kurvform (sinus, fyrkant, triangel), effektivvärde, frekvens och tidsaxel. Kurvan visar perioden T, effektivvärdet som streckad linje och en flyttbar tidpunkt med momentanvärdet. En andra signal kan förskjutas med Δt, och fasvinkeln visas.
2. **Reaktans och impedans.** Seriekrets R, RL, RC eller RLC. Visar kretsschema, visardiagram för spänningarna, u och i över tiden och strömmen som funktion av frekvensen med resonansfrekvens.
3. **Effekt och kompensering.** Enfaslast med P, PF, karaktär och nätfrekvens 50/60 Hz. Överkompensering markeras som kapacitiv; en kondensator påverkar inte en kapacitiv last. Visar effekttriangeln, hur en kondensator (Qᶜ) minskar S och I, kabelförlusten I²R före och efter samt momentan effekt p = u · i.

**Räkna först:** tolv uppgifter, fyra per flik. Parametrarna ställs in och låses, och det sökta värdet döljs med ”?”. Svaret godkänns inom ±1–2 % (vinklar ±0,6–0,8°). Vid fel svar känns vanliga misstag igen och förklaras: effektivvärde i stället för toppvärde, räknaren i DEG/RAD, R + X i stället för Pythagoras, P/U utan effektfaktor, S − P, glömt 2π, faktor 1 000, fel tecken och faktor √2. Ledtråden kan öppnas när som helst; efter två fel svar öppnas den automatiskt och facit kan visas. Uppgifterna och startvärdena använder andra tal än presentationernas övningar och räkneexempel, så inlämningssvaren syns inte i labbet.

Direktlänkar: `?flik=sinus|impedans|effekt` och `&uppgift=period|topp|moment|fas|xl|strom|rc|resonans|skenbar|reaktiv|matstrom|kompensering`.

## Teknik och modell

Statisk HTML/CSS/ES-moduler, inga beroenden eller byggsteg. `model.mjs` innehåller beräkningarna, `lessons.mjs` avläsningar och uppgifter och `app.mjs` reglage och SVG-ritning. Framsteg sparas i `localStorage` (nyckel `sjoskolan-vaxelstrom-v1`) med felhantering om lagring är blockerad.

Modellen förutsätter ideal källa, stationär sinus och ideala, linjära komponenter. Spolen saknar resistans och kondensatorn läckström. Effektfliken antar sinusformad ström (PF = cos φ). Övertoner, mättning, uppvärmning, inkopplingsförlopp och toleranser simuleras inte.

## Verifiering

```sh
python3 -m http.server 8000
node --test sjoskolan/vaxelstromslabbet/model.test.mjs
```

18 tester godkända den 25 september 2026, efter granskning av lärare, elektriker och fartygsingenjör. Testerna täcker presentationernas räkneexempel (230 V → 325 V, 30 V topp-topp, RL 12/16 Ω vid 60 V, RC −53,1°, 0,10 H och 100 µF vid 50 Hz, resonans, effekttriangel 900 W/1 200 var, kompensering PF 0,5 → 1), medeleffekt noll för ren reaktans, svensk talformatering facit för alla tolv uppgifter och att inget av de kända felsvaren godkänns. Alla uppgifter har också lösts i Chromium via direktlänk. Sidan har ingen horisontell rullning vid 390 px bredd.

## Labbprotokoll

Station B, AC (`stationB-protokoll.mjs`): isolerad AC-källa 12,35 V 50 Hz med true RMS-mätare, medelvärdesvisande mätare och oscilloskop för sinus, fyrkant och triangel. Labbprotokollet under simulatorn (`../gemensamt/labbprotokoll.mjs`) har kontroller före start, mätningar med förväntat och uppmätt värde, ”Hämta avläsning”, felsökning, analys, utskrift, CSV och ett ifyllt exempel som räknas fram ur modellen. Stationspaket: `vecka-41/aktuell/Simulerade_stationer.html`.
