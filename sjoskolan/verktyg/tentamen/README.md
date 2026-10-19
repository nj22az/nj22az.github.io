# Övningstentamen som Google-quiz och PDF

## Skapa formuläret

1. Öppna [Google Apps Script](https://script.google.com/), inloggad med det lärarkonto som ska äga formuläret, och skapa ett nytt projekt.
2. Ersätt innehållet i `Code.gs` med hela **ovningstentamen.gs** i denna mapp. Spara och välj funktionen `skapaOvningstentamen`.
3. Klicka **Kör** och godkänn Googles begäran om behörighet till formulär. Redigeringslänken visas i körningsloggen. Inga API-nycklar, tilläggstjänster, installationer eller triggers behövs.
4. Öppna utkastet och förhandsgranska. I **Inställningar → Gör till quiz**, välj att släppa resultat **senare, efter manuell granskning**, och välj vilka missade frågor, rätta svar och poäng eleverna ska se. Publicera formuläret och dela respondentlänken när du är klar.

Skriptet skapar ett **opublicerat, stängt utkast**. Det skickar inga mejl och delar inget automatiskt. Inställningen för när resultat släpps behöver göras i Google Forms; den exponeras inte av Apps Scripts Form-tjänst. Frågornas facit visas som återkoppling enligt de inställningar du väljer, aldrig i frågornas hjälptext.

Samma skriptversion återanvänder sitt formulär vid omkörning. Frågor, lärarändringar och elevsvar skrivs inte över. En avbruten första körning lämnar en tydligt identifierad utkastlänk och skapar inga fler formulär vid omkörning. Efter granskning kan du börja om i ett nytt Apps Script-projekt. Uppdaterat källinnehåll ger en ny skriptversion och ett nytt formulär; gamla formulär bevaras.

## Upplägg och bedömning

- Samma tolv scenarier som övningstentan, indelade i sex ämnesavsnitt och en avslutande reflektion.
- Tre flervalsfrågor per scenario, **36 automatiskt bedömda frågor à 1 poäng**. Alternativen blandas vid skapandet med bibehållet facit.
- En skriftlig redovisning per scenario, **tolv lärarbedömda svar à 2 poäng**. Två synliga kriterier per uppgift stödjer beräkning, metod, enheter och motivering. Lösningsgången finns i frågans återkoppling för granskning.
- Totalt **60 träningspoäng**, varav 24 kräver lärarbedömning. Inga officiella betygsgränser eller tidsgränser skapas. Det är frivillig träning, inte den slutliga skriftliga tentamen.
- Namn efterfrågas; grupp och reflektion är frivilliga. E-post samlas inte in automatiskt. Svarssammanfattning delas inte. Varje nytt försök lämnas som ett separat svar.

## Ändra källan och bygg om

Frågor, svarsalternativ, facit och bedömningskriterier finns i `sjoskolan/innehall/ovningar/EL-000851.json` till `EL-000862.json`. Ändra dessa poster och revidera dem med `innehall.py revidera`. Ändra aldrig den genererade `ovningstentamen.gs` eller frågeregionen i `tentamen.html` direkt.

```sh
python3 sjoskolan/verktyg/tentamen/bygg_pdf.py   # kräver reportlab, om frågor/lösningar ändrats
python3 sjoskolan/innehall/innehall.py bygg tentamen idregister
python3 sjoskolan/innehall/innehall.py kontrollera
node --test sjoskolan/verktyg/tentamen/quiz.test.mjs
```

Webbsidan innehåller bara de tolv ursprungliga uppgifterna och länkar till separata fråge- och facitdokument. PDF:ernas källhash kontrolleras vid innehållsbygget, så en ändrad fråga eller lösning kräver uppdaterade dokument. Det genererade skriptet är ett lärarverktyg och länkas inte från elevens kursmeny. Inget skyddat lärar- eller bokinnehåll används.

Verifierat mot Googles dokumentation: [FormApp](https://developers.google.com/apps-script/reference/forms/form-app), [Form](https://developers.google.com/apps-script/reference/forms/form), [flervalsfrågor](https://developers.google.com/apps-script/reference/forms/multiple-choice-item), [skriftliga svar](https://developers.google.com/apps-script/reference/forms/paragraph-text-item) och [återkoppling](https://developers.google.com/apps-script/reference/forms/quiz-feedback-builder).

Lokal verifiering omfattar innehåll, poäng, facitkopplingar, omkörningar och avbrutna byggen med en testdubbel av Forms-tjänsten. Ett formulär har inte skapats i ditt Google-konto av den verifieringen; körningen och förhandsgranskningen ovan återstår där.
