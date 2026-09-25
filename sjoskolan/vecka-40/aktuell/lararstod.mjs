import {GUIDE_TASKS,guideValues} from '../../vaxelstromslabbet/guided-lessons.mjs?v=20260925-ac2';
const n=v=>v.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});
document.getElementById('guide-answers').innerHTML=GUIDE_TASKS.map(t=>`<section><h3>${t.title}</h3><p>${t.fields.map(([k,l,u])=>`${l}: <strong>${n(guideValues(t)[k])} ${u}</strong>`).join('. ')}</p><p>${t.method}</p><p>Följdfråga: ${t.explain}</p></section>`).join('');
