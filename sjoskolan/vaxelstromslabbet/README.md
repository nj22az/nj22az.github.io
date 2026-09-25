# Växelströmslabbet · Sjöskolan

Vecka 40 börjar på https://nj22az.github.io/sjoskolan/vecka-40/aktuell/.

## Tre arbetslägen

- **Guidad labb** (standard): åtta uppgifter. Förutsäg, läs av och jämför, förklara. Samma exempel och begrepp används i webbgenomgång, PowerPoint och kortfilm. Båda instrumenten kontrolleras vid 10 V; grundkällan är 12 V RMS/50 Hz. RL använder 40 Ω/95,5 mH och effektdelen 230 V/1 150 W vid PF 1 respektive 0,5.
- **Fri simulator**: de befintliga reglagen, graferna och tolv räkna-först-uppgifterna. Varje uppgift länkar till förklaringen av metoden. Färdiga svar rensas när flik eller stationsförinställning ändras.
- **Station B**: utökat protokoll efter undervisning om mätarprinciper. Nio rader, inklusive kontroll av båda instrumenten. Överensstämmelse med mätarmodellen skiljs från visningsfel mot RMS. Gamla åttaradiga svar flyttas till rätt rader; den nya kalibratorraden behöver fyllas i.

Direktlänkar: `?lage=guidad&del=sinus|impedans|effekt`, `?lage=fri&flik=sinus|impedans|effekt`, `?lage=station`. Äldre `?flik=…&uppgift=…` och `#labbprotokoll` fungerar fortfarande.

## Modell och lagring

Statisk HTML/CSS/ES-moduler. Inga beroenden eller byggsteg krävs för att använda labbet. `model.mjs` är beräkningskällan. `guided-lessons.mjs` kopplar uppgifterna till den. `../vecka-40/aktuell/lektioner.mjs` är undervisningskällan för webb, kortfilmer och presentationer.

Svaren lagras bara i aktuell webbläsare: grundprotokoll `sjoskolan-ac-grund-v2`, stationsprotokoll `stationB-ac-v2`, tidigare räkneuppgifter `sjoskolan-vaxelstrom-v1`. PDF skapas genom webbläsarens utskrift. CSV exporteras lokalt. Inget skickas till en server. Antecknade svar är underlag för lärarens bedömning, inte ett automatiskt godkännande.

Modellen förutsätter en ideal källa och ideala linjära komponenter. RL/RC/RLC och effektfliken är stationär enfas med sinusformade signaler (PF = cos φ). Mätarjämförelsen omfattar också ideal fyrkant och triangel med samma RMS. Verkliga instrument har bland annat bandbredds- och toppfaktorgränser. Simulatorn verifierar inte fysisk inkoppling.

## Verifiering

Från denna katalog:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

21 modelltester samt DOM-tester av samtliga åtta guidade uppgifter, båda kalibratoravläsningarna, sparade svar, återställning av uppgifter och separata stationsbedömningar. DOM-testerna verifierar beteende; de ersätter inte visuell kontroll i en webbläsare. Det gemensamma protokollet har separata tester i `../gemensamt/labbprotokoll.test.mjs`.

Lärarstöd, facit och förberedelser för den verkliga riggen: `../vecka-40/aktuell/Lararstod.html`. Byggkällor för presentationerna och rösten: `../verktyg/ac/`.
