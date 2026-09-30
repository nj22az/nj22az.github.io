# Regressionstest för vecka 40:s resultatkod

Utgångspunkt: main `0542b9206e7c46a6afe25b8c96405fce7a3c4b77`, efter QR-commit
`4972d5841606d806eb82a67e6268ee943785071b`. Testerna är separata från presentatörsvy, sortering och visuell QA.

```sh
node --test sjoskolan/vecka-40/aktuell/resultat*.test.mjs
npm test --prefix sjoskolan/vaxelstromslabbet
node --test sjoskolan/gemensamt/labbprotokoll.test.mjs
python3 sjoskolan/verktyg/qa/week40.py
python3 sjoskolan/innehall/innehall.py kontrollera
```

`resultat.test.mjs` använder bara Node-standardbiblioteket. Testerna kör verkliga Web Streams och verifierar
transportformatet oberoende med `node:zlib`. Lagring och klocka isoleras per test. Både z och j kontrolleras för
svenska decimalsvar, Unicode, versionsfel, saknade data och länkens fragment. QR-testerna provar varje
kortningsstegs exakta längdgräns och gränsen minus ett tecken. Om metadata ensamt överskrider längdmålet
behålls den kortaste länken; namn, svar och första försök kapas inte. Detta är ett längdmål för skärmläsbar QR,
inte ett löfte att godtyckligt stora namn eller metadata alltid ryms.

`resultat-teacher.test.mjs` dekrypterar repositoryts aktuella `larare/resultat.html` **enbart i minnet** när
miljövariabeln `LARARLOSEN` finns. Sidans egen modulkod och dess faktiska importer körs med DOM-sänkor,
isolerad lagring och ett nätverksanrop som alltid avvisas. Testet inväntar sidans riktiga hashimport och
kontrollerar sparat resultat, rensning av hash först efter lyckad import, mottagning av länk/fragment/rå kod,
partiella labbrader och bedömning mot `gd`. Det testar inte layout, kamera, QR-bildavläsning eller sortering.
Lösenord och dekrypterat facit ska aldrig skrivas i testfixturer eller loggar.

Läs lösenordet utan att lägga det i skalhistoriken (Bash):

```sh
read -rs -p 'Lärarlösenord: ' LARARLOSEN
export LARARLOSEN
node --test sjoskolan/vecka-40/aktuell/resultat*.test.mjs
unset LARARLOSEN
```

CI har ett eget resultatkodssteg. Den skyddade integrationen använder den valfria Actions-hemligheten
`LARARLOSEN`. Utan den markeras just integrationen uttryckligen som överhoppad; de publika kodtesterna körs
alltid. Ett felaktigt tillhandahållet lösenord gör integrationen röd, inte överhoppad.

Säkra rättningar som testerna motiverar: j-reservväg även vid fel i komprimerings-API:t, kortning utan trasiga
surrogatpar, verklig nollgräns, korrekt kortningsbesked och begripliga fel för skadade komprimerade koder.
Resultat finns fortfarande enbart på enheten och i URL-fragmentet. Inget serverstöd eller nytt beroende införs.
