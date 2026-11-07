# Veckolås

`python3 sjoskolan/verktyg/las/veckolas.py kontrollera` jämför SHA-256 och
filuppsättning med `vecka-NN.json`. Körs både i CI och av `innehall.py kontrollera`.
Ändra en låst vecka bara efter ett uttryckligt beslut; förnya sedan manifestet med
`python3 sjoskolan/verktyg/las/veckolas.py las 40`.

## Vecka 40 och Växelströmslabbet

`OMFANG` behåller veckans befintliga mappar och frånskiljningsmaterial. Dessutom
följs körningsberoenden från tre explicita `STARTFILER`:

- `vaxelstromslabbet/index.html`: guidad labb, fritt läge, Station B, instrumentbänk
  och CSS som styr vilka reglage och avläsningar eleven ser.
- `vecka-40/aktuell/resultat.mjs`: uppgifterna som kodas i elevens resultat.
- `vecka-40/aktuell/lararstod.mjs`: beräkningar och personliga värden i lärarstödet.

`beroenden.py` följer lokala HTML-skript (inklusive inline), stilmallar, statiska
ES-importer och återexporter, dynamiska `import('…')` med strängliteral och
CSS-importer/url. Cacheparametrar och fragment tas bort; relativa och absoluta
`/sjoskolan/`-sökvägar normaliseras. Saknade filer stoppar kontrollen och omlåsning.
Även exakt de gemensamma moduler som används för t.ex. elevtal, notation och
protokoll skyddas. Navigeringslänkar följs inte till andra veckor.

Manifestets startfiler, globmönster och hela filuppsättning jämförs med verktyget.
Ett nytillkommet transitivt beroende måste finnas i manifestet; borttagna kanter
eller krympt omfattning kräver också ett medvetet förnyat lås. Kontrollen kan inte
förhindra att någon avsiktligt ändrar både verktyg och manifest; sådant granskas i
git-diffen.

Ingen hel labb- eller gemensamt-mapp fryses. Oanvända filer för senare veckor,
labbtester, dokumentation och byggverktyg kan ändras. För instrumentbänken låses
den **publicerade `equipment.js`** och dess externa importer; källorna och
npm-paketen laddas inte av eleven och ingår därför inte. En ombyggnad som ändrar
bundlen upptäcks av låset. En fil som faktiskt delas med vecka 40 kan däremot inte
ändras obemärkt för en senare vecka.

Avgränsning: detta är en kontroll av lokala publicerade filer, inte en fullständig
JavaScript-tolk eller frysning av externa nätresurser. Vid nya beräknade
importsökvägar, `fetch`-resurser, workers eller annan dynamisk laddning ska målen
läggas till som explicita startfiler och täckas av ett regressionstest innan
manifestet förnyas. Övningstext ändras fortfarande i innehållsdatabasen och byggs
med dess exportörer; ändra aldrig `uppgifter.gen.mjs` för hand.

## Tester

```sh
python3 -m unittest discover -s sjoskolan/verktyg/las -p 'test_*.py'
python3 sjoskolan/verktyg/las/veckolas.py kontrollera
python3 sjoskolan/verktyg/qa/week40.py
node --test sjoskolan/vecka-40/aktuell/arbetsrum*.test.mjs sjoskolan/vecka-40/aktuell/resultat*.test.mjs
cd sjoskolan/vaxelstromslabbet
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

Installera labbets beroenden före Week 40:s DOM-tester. Lärarsidans krypterade
resultatimport kräver `LARARLOSEN`; testet rapporterar annars att det hoppas över.
