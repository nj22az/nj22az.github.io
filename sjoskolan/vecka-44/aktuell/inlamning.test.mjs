// Inlämningen vecka 44 rättar sig själv (som vecka 42): uppgift 1–3 och analysen av mätdata (inlämning 4), som bygger på
// del 4 i vecka-45/aktuell/Del_2.html. Gemensamma tester: verktyg/inlamning/provvecka.mjs.
// Kör: node --test sjoskolan/vecka-44/aktuell/inlamning.test.mjs (INLAMNING_FACIT_DIR=/utanför/repot prövar lärarens klartext).
import { provaVecka } from '../../verktyg/inlamning/provvecka.mjs';

provaVecka({ vecka: 44, uppgifter: ['EL-000823', 'EL-000824', 'EL-000825', 'EL-000826'], rattas: 19, sista: 'fredag 30 oktober',
  delar: [[1, 'Del_1.html'], [2, 'Del_2.html'], [3, 'Del_3.html'], [4, '../../vecka-45/aktuell/Del_2.html'], [5, '../../vecka-45/aktuell/Del_3.html']] });
