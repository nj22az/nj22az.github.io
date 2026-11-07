# Växelströmslabbet · Sjöskolan

Vecka 40 börjar på https://nj22az.github.io/sjoskolan/vecka-40/aktuell/.

## Tre arbetslägen

- **Guidad labb** (standard): åtta uppgifter. Förutsäg, läs av och jämför, förklara. Eleven skriver sitt namn först; värdena räknas fram ur namnet (`gemensamt/elevtal.mjs`, `personligt()` i `guided-lessons.mjs`): källa 13–23 V RMS/50 Hz, RL med 12 V, R 31–61 Ω och L 62–122 mH, effektdelen 230 V och P 1 680–2 580 W vid PF 1 respektive 0,5. Kalibratorn (10 V) och perioden (20 ms) är lika för alla. Posterna EL-000337–344 har referensvärdena. Protokollet sparar första förutsägelsen, antal försök och tider; läraren ser elevens facit i Lärarstöd vecka 40 genom att skriva namnet. `tests/personlig.test.mjs` kontrollerar att inget personligt svar ligger nära ett exempel i genomgången eller ledtrådarna och att lärarguidens facit stämmer. Genomgång, PowerPoint och stegfilm lär ut samma metoder med andra exempel (fartygets 440 V/60 Hz, fläktmotor 50 Ω/382 mH, pumpmotor 1 380 W), så att de inte ger labbens svar.
- **Fri simulator**: de befintliga reglagen, graferna och tolv räkna-först-uppgifterna. Varje uppgift länkar till förklaringen av metoden. Färdiga svar rensas när flik eller stationsförinställning ändras.
- **Station B**: utökat protokoll efter undervisning om mätarprinciper. Nio rader, inklusive kontroll av båda instrumenten. Överensstämmelse med mätarmodellen skiljs från visningsfel mot RMS. Gamla åttaradiga svar flyttas till rätt rader; den nya kalibratorraden behöver fyllas i.

Direktlänkar: `?lage=guidad&del=sinus|impedans|effekt`, `?lage=fri&flik=sinus|impedans|effekt`, `?lage=station`. Äldre `?flik=…&uppgift=…` och `#labbprotokoll` fungerar fortfarande.

## Modell och lagring

Statisk HTML/CSS/ES-moduler. Three.js-bänken distribueras färdigbyggd; inga installationer krävs för eleven. `model.mjs` är beräkningskällan. `guided-lessons.mjs` kopplar uppgifterna till den. `../vecka-40/aktuell/lektioner.mjs` är undervisningskällan för webb, kortfilmer och presentationer.

Svaren lagras bara i aktuell webbläsare: grundprotokoll `sjoskolan-ac-grund-v3`, stationsprotokoll `stationB-ac-v2`, tidigare räkneuppgifter `sjoskolan-vaxelstrom-v1`. PDF skapas genom webbläsarens utskrift. CSV exporteras lokalt. Inget skickas till en server. Antecknade svar är underlag för lärarens bedömning, inte ett automatiskt godkännande.

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

Källa, två multimetrar, oscilloskop, komponentplatta och effektanalysator är egenbyggda 3D-modeller. `equipment-state.mjs` använder samma `readouts()` som resten av labbet. Avläsningarna är dolda under förutsägelsen. Raden **Visa:** väljer instrument (uppgiftens instrument först, sist **Hela bänken**); exakt en knapp är vald och markeras med ✓. Brytaren **Bild:** växlar mellan **3D-bild** och **Siffror** (kort med alla rader). Valet sparas under besöket i `sessionStorage['sjoskolan-ac-visning']`; smal skärm (under 620 px bildbredd) börjar med Siffror. Bänken roterar inte: ett finger över bilden rullar alltid sidan (`touch-action: pan-y pinch-zoom`), ett tryck väljer instrument. Statusraden under knapparna säger vad bilden visar. Källans värden kan ändras i fritt läge. En förenklad Canvas2D-rendering av samma Three.js-geometri används om WebGL saknas; går ingen 3D-bild att visa blir 3D-bild avstängd och Siffror gäller.

Källkod: `equipment.mjs`. Kör `npm run build` efter ändringar. Färdig `equipment.js` och Three.js MIT-licens i `vendor/` publiceras med sidan. Renderingen sker bara vid ändring; ingen ständig animationsslinga behövs. `equipment-state.mjs` innehåller inga hårdkodade mätresultat. Instrumentens form är generell och motsvarar inte en verifierad fysisk modell eller inkopplingsanvisning.

## Utkast (vaxelstromslabbet-utkast)

Kopia av fredagens labb (vecka 40) som läraren provar innan den ersätter originalet. Eleverna använder `../vaxelstromslabbet/`.
Skillnader mot originalet:
- Hela bänken visar sladdarna (`equipment.mjs`, byggs till `equipment.js`): sinus parallellt över källan; spolen i serie med
  dubbelriktade pilar (växelström), oscilloskopets referens (REF) och en strömprob runt returledaren till kanal 2.
- Länken Se hur kretsen är kopplad efter avläsningen i uppgift 1–6 (`guided.mjs`), även på telefon.
- Effektanalysatorn visar bara matningsströmmen när uppgiften saknar kompensering (`equipment-state.mjs`).
- Skillnaden visas aldrig som −0,00 (`guided.mjs`).
- Rutan Utkast,
`noindex`, egen lagringsnyckel (`sjoskolan-ac-grund-utkast` i `guided.mjs`) och testerna pekar på den här mappen.

Ersätta originalet: lås upp vecka 40, kopiera `equipment.mjs` och `equipment.js` (och övriga godkända ändringar) till
`vaxelstromslabbet/`, byt `equipment.js?v=` i `boot.mjs`, kopiera också `equipment-state.mjs` och `guided.mjs` (utan lagringsnyckeln), kör `npm test`, lås vecka 40 igen och ta bort den här mappen.
Lagringsnyckeln och rutan Utkast följer inte med.
