// Eriks manus för Station A. Ett inslag per steg i STATION_A (multimeter/lessons.mjs, ur innehållsdatabasen).
// Erik pekar ut det uppgiften redan säger: vred, uttag, länk, matning och var spetsarna ska sitta. Han säger aldrig
// en avläsning eller ett svar och nämner inga tal. R pekar med höger hand (röd spets), L med vänster (svart spets).
// Mål: 'matare', 'matning', 'lank' eller en mätpunkt ur CONTACTS i scene.mjs.
export const ERIK_STATION_A=[
  [
    {R:'matare',say:'Först kontrollerar vi mätaren mot något vi vet. Vredet på V ⎓, röd sladd i V Ω och svart i COM.'},
    {R:'Ref+',L:'Ref−',say:'Referensen sitter här framme. Röd spets på Ref+, svart på Ref−.'},
    {R:'matare',say:'Läs av. Visar den samma som referensen kan vi lita på den i dag.'},
  ],
  [
    {R:'matning',say:'Resistans mäter man bara i en död krets. Matningen bryter vi här.'},
    {R:'lank',say:'Länken P–A öppnar vi, så att källan inte sitter ihop med R1 och R2.'},
    {R:'A',L:'B',say:'Mätaren står kvar på V ⎓. Röd på A, svart på B. Vi kontrollerar att det är spänningslöst innan vi byter till Ω.'},
  ],
  [
    {R:'matare',say:'Nu vredet på Ω. Sladdarna sitter kvar i V Ω och COM.'},
    {R:'A',L:'B',say:'Spetsarna på A och B, över R1. Länken är fortfarande öppen.'},
    {R:'matare',say:'Läs av och jämför med märkningen på motståndet.'},
  ],
  [
    {R:'B',L:'N',say:'Samma sak för R2: spetsarna på B och N.'},
    {R:'matare',say:'Se efter om värdet ligger inom toleransen.'},
  ],
  [
    {R:'lank',say:'Länken P–A sluter vi igen, så att kretsen blir hel.'},
    {R:'matare',say:'Vredet tillbaka på V ⎓ innan vi slår på.'},
    {R:'matning',say:'Sedan slår du på matningen här.'},
    {R:'P',L:'N',say:'Röd på P, svart på N. Där mäter du hela källans spänning.'},
  ],
  [
    {R:'A',L:'B',say:'Voltmetern sitter parallellt över R1: röd på A, svart på B.'},
    {R:'matare',say:'Räkna först vad du väntar dig. Läs sedan av och jämför.'},
  ],
  [
    {R:'B',L:'N',say:'Nu över R2: röd på B, svart på N.'},
    {R:'matare',say:'Lägg ihop de två delspänningarna och jämför med källan.'},
  ],
  [
    {R:'matning',say:'Ström mäter man i serie. Först bryter vi matningen. Man kopplar aldrig om med spänningen på.'},
    {R:'lank',say:'Länken P–A öppnar vi. Mätaren ska sitta där länken satt.'},
    {R:'matare',say:'Vredet på A ⎓ och röd sladd över till mA-uttaget. Den ska tillbaka sedan, annars bränner nästa man säkringen.'},
    {R:'P',L:'A',say:'Röd på P, svart på A. Nu går strömmen genom mätaren. Sist slår du på.'},
  ],
  [
    {R:'matning',say:'Vi lämnar bänken som vi själva vill hitta den. Matningen bruten.'},
    {R:'matare',say:'Röd sladd tillbaka i V Ω och vredet på V ⎓.'},
    {R:'lank',say:'Länken P–A sluten.'},
    {R:'Ref+',L:'Ref−',say:'Och en sista kontroll mot referensen. Prova, mät, prova.'},
  ],
];
