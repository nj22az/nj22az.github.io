// Inlämningen vecka 43 rättar sig själv (som vecka 42): uppgift 1–3 och felsökningsrapporten (inlämning 4), som bygger på
// del 4 i vecka-45/aktuell/Del_1.html. Gemensamma tester: verktyg/inlamning/provvecka.mjs.
// Kör: node --test sjoskolan/vecka-43/aktuell/inlamning.test.mjs (INLAMNING_FACIT_DIR=/utanför/repot prövar lärarens klartext).
import { provaVecka } from '../../verktyg/inlamning/provvecka.mjs';

provaVecka({ vecka: 43, uppgifter: ['EL-000820', 'EL-000821', 'EL-000822', 'EL-000828'], rattas: 13, sista: 'fredag 23 oktober',
  delar: [[1, 'Del_1.html'], [2, 'Del_2.html'], [3, 'Del_3.html'], [4, 'Del_4.html']] });
