# Motorlabbet

Labbet vecka 41 på distans, för elever som inte kan komma till den fysiska labben fredag 9 oktober. Samma stationer
som på plats (`vecka-41/aktuell/Labbet.html`): M motorn (Y och Δ i plinten, resistansmätning), S startaren
(kontakterna spänningslöst, överlastreläets testknapp), T strömtången (DC-aggregat på skyddsklenspänning) och
felsökning (ett fel i plinten som eleven hittar och rättar).

- `model.mjs`: räknemodellen. Resistansen mellan plintarna löses med nodanalys för godtyckliga bleck, också lösa
  muttrar. Lindningarnas resistans räknas ur elevens D (3–6 Ω), så att varje elev får egna tal. `model.test.mjs` körs i CI.
- `scen.mjs`: 3D-bänken i three.js. Den byggs till `scen.js` med `node tools/build.mjs` (three och esbuild från
  `../vaxelstromslabbet/node_modules`). Scenen visar bara läget; värdena kommer från modellen.
- `app.mjs`: knappar, regler och protokoll. Blecken flyttas bara med mätsladdarna bortkopplade, och sladden vid tången
  flyttas bara med aggregatets utgång avslagen, som i den fysiska labben. Utan WebGL fungerar allt med knapparna och
  plintbilden.

Värdena är simulerade och är inte den fysiska motorns.
