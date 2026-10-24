# Motorlabbet

Labbet vecka 41 på distans, för elever som inte kan komma till den fysiska labben fredag 9 oktober. Samma stationer
som på plats (`vecka-41/aktuell/Labbet.html`): M motorn (Y och Δ i plinten, resistansmätning), S startaren
(kontakterna spänningslöst, överlastreläets testknapp), T strömtången (DC-aggregat på skyddsklenspänning) och
felsökning (ett fel i plinten som eleven hittar och rättar).

- `model.mjs`: räknemodellen. Resistansen mellan plintarna löses med nodanalys för godtyckliga bleck, också lösa
  muttrar. Lindningarnas resistans (3–6 Ω) och felet i felsökningen räknas ur D. Från vecka 42 räknar alla med samma
  D = 12 (`kursD()` i `gemensamt/elevtal.mjs`): lindningarna U 5,20 Ω, V 5,16 Ω och W 5,24 Ω, och felet är den lösa
  muttern på blecket V1–U2. `model.test.mjs` körs i CI.

Motorlabbet är också station 1 i det praktiska provet vecka 45 (`praktiskt-prov.html`). Protokollets kolumn heter
”Din förutsägelse” (ANDRINGSLOGG regel 6).
- `scen.mjs`: 3D-bänken i three.js. Den byggs till `scen.js` med `node tools/build.mjs` (three och esbuild från
  `../vaxelstromslabbet/node_modules`). Scenen visar bara läget; värdena kommer från modellen.
- `app.mjs`: knappar, regler och protokoll. Blecken flyttas bara med mätsladdarna bortkopplade, och sladden vid tången
  flyttas bara med aggregatets utgång avslagen, som i den fysiska labben. Utan WebGL fungerar allt med knapparna och
  plintbilden.

Värdena är simulerade och är inte den fysiska motorns.

## Stillbilder till kursens figurer

`rendera.html` visar bänken med vit bakgrund, valda stationer och en given kamera, och lämnar bilden och ankarpunkterna
i `window.RESULTAT`. `verktyg/figurer/figurer3d_del3.py` använder den för figurerna i v41_03, Labbet.html och
labbhandboken, så att presentationen, labbet och simulatorn visar samma motor, startare och tång.
