import {GUIDE_TASKS,guideValues} from '../../vaxelstromslabbet/guided-lessons.mjs?v=20260929';
import {markHtml as m} from '../../gemensamt/markering.mjs?v=20260928';
const n=v=>v.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});
document.getElementById('guide-answers').innerHTML=GUIDE_TASKS.map(t=>`<section><h3>${m(t.title)}</h3><p>${t.fields.map(([k,l,u])=>`${m(l)}: <strong>${n(guideValues(t)[k])} ${u}</strong>`).join('. ')}</p><p>${m(t.method)}</p><p>Följdfråga: ${m(t.explain)}</p></section>`).join('');
