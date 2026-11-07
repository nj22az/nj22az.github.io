/**
 * Från innehållsdatabasen: byggs med innehall.py bygg tentamen. Ändra källposterna, inte utdata.
 * Det färdiga skriptet klistras in i ett nytt projekt på https://script.google.com/.
 * Kör skapaOvningstentamen. Inga tilläggstjänster, API-nycklar eller triggers behövs.
 * Frågor, alternativ, facit och kriterier hämtas från innehållsdatabasen.
 * Det här är den frivilliga övningstentan, inte den bedömda skriftliga tentamen.
 */
const UPPGIFTER = /* UPPGIFTER */;
const QUIZ_VERSION = '/* VERSION */';

function skapaOvningstentamen() {
  const lock = LockService.getUserLock();
  lock.waitLock(30000);
  try {
    const properties = PropertiesService.getUserProperties();
    const key = 'SJOSKOLAN_OVNINGSTENTAMEN_' + QUIZ_VERSION;
    const existing = properties.getProperty(key);
    if (existing) {
      const form = FormApp.openById(existing);
      if (properties.getProperty(key + '_klar') !== 'ja') {
        throw new Error('Ett tidigare bygge avbröts. Granska utkastet innan ett nytt skapas: ' + form.getEditUrl());
      }
      return visaQuiz_(form); // Bevara befintliga frågor, lärarändringar och elevsvar vid omkörning.
    }

    // Skapas opublicerat och stängt: läraren väljer resultatvisning och granskar före publicering.
    const form = FormApp.create('Sjöskolan | Övningstentamen i elteknik och ellära', false);
    properties.setProperty(key, form.getId());
    form.setAcceptingResponses(false);
    form.setIsQuiz(true)
      .setDescription('Frivillig träning på kursens tolv scenarier. 36 flervalsfrågor à 1 poäng och tolv skriftliga motiveringar à 2 poäng: totalt 60 poäng. Läraren granskar motiveringarna innan ett fullständigt resultat kan ges. Poängen är ett träningsstöd, inte en officiell betygsgräns. Räkna först själv med papper, räknare och kursens formelsamling. Arbeta i egen takt; formuläret har ingen automatisk tidtagning.')
      .setProgressBar(true)
      .setShuffleQuestions(false)
      .setCollectEmail(false)
      .setLimitOneResponsePerUser(false)
      .setAllowResponseEdits(false)
      .setPublishingSummary(false)
      .setShowLinkToRespondAgain(true)
      .setConfirmationMessage('Dina svar är sparade. De skriftliga motiveringarna behöver granskas av läraren innan du har ett fullständigt resultat. Använd återkopplingen för att välja vad du ska öva mer på.');

    form.addSectionHeaderItem().setTitle('Börja här').setHelpText('Välj ett svar per flervalsfråga. Skriv sedan hur du tänkte. Behåll givna värden, samband, insättning, svar och enheter. Ett nytt försök sparas separat.');
    form.addTextItem().setTitle('Namn').setRequired(true).setPoints(0);
    form.addTextItem().setTitle('Grupp eller klass (frivilligt)').setRequired(false).setPoints(0);

    const avsnitt = {
      1: ['1. Likström, energi och ledningar', 'Uppgift 1–3 | 15 poäng'],
      4: ['2. Växelström', 'Uppgift 4–5 | 10 poäng'],
      6: ['3. Trefas och neutralledare', 'Uppgift 6–7 | 10 poäng'],
      8: ['4. Elsäkerhet och arbetsplanering', 'Uppgift 8 | 5 poäng'],
      9: ['5. Motorer och systematisk felsökning', 'Uppgift 9–10 | 10 poäng'],
      11: ['6. IT-system och mätosäkerhet', 'Uppgift 11–12 | 10 poäng']
    };
    UPPGIFTER.forEach(function (uppgift) {
      if (avsnitt[uppgift.nummer]) {
        const rubrik = avsnitt[uppgift.nummer];
        form.addPageBreakItem().setTitle(rubrik[0]).setHelpText(rubrik[1]);
      }
      form.addSectionHeaderItem().setTitle('Uppgift ' + uppgift.nummer + ': ' + uppgift.titel).setHelpText(uppgift.fraga);
      uppgift.fragor.forEach(function (delfraga) {
        const item = form.addMultipleChoiceItem()
          .setTitle(uppgift.nummer + '.' + delfraga.id + ' ' + delfraga.text)
          .setHelpText('1 poäng. Välj det alternativ som bäst stämmer med ditt eget svar.')
          .setRequired(true).setPoints(1);
        // Blanda alternativen en gång vid skapandet. Facit följer texten, inte bokstaven.
        const alternativ = delfraga.alternativ.map(function (text, i) { return {text: text, ratt: i === delfraga.ratt}; });
        for (let i = alternativ.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = alternativ[i]; alternativ[i] = alternativ[j]; alternativ[j] = tmp;
        }
        item.setChoices(alternativ.map(function (a) { return item.createChoice(a.text, a.ratt); }));
        const feedback = FormApp.createFeedback().setText(uppgift.losning)
          .addLink('https://nj22az.github.io/sjoskolan/tentamen/ovningstentamen-facit.pdf', 'Facit med lösningsgång').build();
        item.setFeedbackForCorrect(feedback).setFeedbackForIncorrect(feedback);
      });
      const kriterier = uppgift.kriterier.map(function (k, i) { return (i + 1) + '. ' + k; }).join('\n');
      form.addParagraphTextItem().setTitle(uppgift.nummer + '.d Visa och förklara hur du kom fram till svaren')
        .setHelpText('2 poäng, bedöms av läraren. Redovisa hela uppgiftens beräkningar eller resonemang.\n' + kriterier)
        .setRequired(true).setPoints(2)
        .setGeneralFeedback(FormApp.createFeedback().setText('Bedömningsstöd: 1 poäng per uppfyllt kriterium. Delvis uppfyllda kriterier kan ge delpoäng vid lärarens granskning.\n' + kriterier + '\n\nLösningsgång:\n' + uppgift.losning).build());
    });

    form.addPageBreakItem().setTitle('7. Din fortsatta träning').setHelpText('Frivillig reflektion. Inga poäng.');
    form.addMultipleChoiceItem().setTitle('Hur säker känner du dig på dina lösningar?')
      .setChoiceValues(['Jag behöver öva mer på grunderna.', 'Jag kan metoderna men behöver kontrollera några delar.', 'Jag kan förklara mina lösningar och kontrollera rimligheten.'])
      .setRequired(false).setPoints(0);
    form.addParagraphTextItem().setTitle('Vilka två områden vill du repetera, och vad ska du göra härnäst?').setRequired(false).setPoints(0);
    properties.setProperty(key + '_klar', 'ja');
    return visaQuiz_(form);
  } finally {
    lock.releaseLock();
  }
}

function visaQuiz_(form) {
  const info = {
    redigera: form.getEditUrl(),
    uppgifter: 12, automatiskaFragor: 36, skriftligaMotiveringar: 12, maxpoang: 60,
    nastaSteg: 'Granska utkastet. I Inställningar > Gör till quiz: välj att släppa resultat senare efter manuell granskning och kontrollera vilka rätta svar som visas. Publicera och dela först därefter.'
  };
  console.log(JSON.stringify(info, null, 2));
  return info;
}
