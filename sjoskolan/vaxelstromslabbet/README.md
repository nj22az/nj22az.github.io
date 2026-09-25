# Växelströmslabbet · Sjöskolan

Vecka 40 börjar på https://nj22az.github.io/sjoskolan/vecka-40/aktuell/.

## Tre arbetslägen

- **Guidad labb** (standard): åtta uppgifter. Förutsäg, läs av och jämför, förklara. Samma exempel och begrepp används i webbgenomgång, PowerPoint och kortfilm. Båda instrumenten kontrolleras vid 10 V; grundkällan är 12 V RMS/50 Hz. RL använder 40 Ω/95,5 mH och effektdelen 230 V/1 150 W vid PF 1 respektive 0,5.
- **Fri simulator**: de befintliga reglagen, graferna och tolv räkna-först-uppgifterna. Varje uppgift länkar till förklaringen av metoden. Färdiga svar rensas när flik eller stationsförinställning ändras.
- **Station B**: utökat protokoll efter undervisning om mätarprinciper. Nio rader, inklusive kontroll av båda instrumenten. Överensstämmelse med mätarmodellen skiljs från visningsfel mot RMS. Gamla åttaradiga svar flyttas till rätt rader; den nya kalibratorraden behöver fyllas i.

Direktlänkar: `?lage=guidad&del=sinus|impedans|effekt`, `?lage=fri&flik=sinus|impedans|effekt`, `?lage=station`. Äldre `?flik=…&uppgift=…` och `#labbprotokoll` fungerar fortfarande.

## Modell och lagring

Statisk HTML/CSS/ES-moduler. Three.js-bänken distribueras färdigbyggd; inga installationer krävs för eleven. `model.mjs` är beräkningskällan. `guided-lessons.mjs` kopplar uppgifterna till den. `../vecka-40/aktuell/lektioner.mjs` är undervisningskällan för webb, kortfilmer och presentationer.

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

## Instrumentbänk i Three.js

Källa, två multimetrar, oscilloskop, komponentplatta och effektanalysator är egenbyggda 3D-modeller. `equipment-state.mjs` använder samma `readouts()` som resten av labbet. Avläsningarna är dolda under förutsägelsen. Instrument kan förstoras med klick eller knappar; källans värden kan ändras i fritt läge. Bänken behöver inte rotera för att uppgiften ska gå att lösa. En förenklad Canvas2D-rendering av samma Three.js-geometri används om WebGL2 saknas. Enkel instrumentvy kan också väljas manuellt.

Källkod: `equipment.mjs`. Kör `npm run build` efter ändringar. Färdig `equipment.js` och Three.js MIT-licens i `vendor/` publiceras med sidan. Renderingen sker bara vid ändring; ingen ständig animationsslinga behövs. `equipment-state.mjs` innehåller inga hårdkodade mätresultat. Instrumentens form är generell och motsvarar inte en verifierad fysisk modell eller inkopplingsanvisning.
