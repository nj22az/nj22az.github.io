import {readouts,DEFAULTS} from './lessons.mjs';
export const GUIDE_VERSION=3;
const sin={...DEFAULTS.sinus,shape:'sinus',urms:12,f:50,t:5,showB:false,window:'auto'};
const rl={...DEFAULTS.impedans,kind:'RL',U:12,f:50,R:40,L:95.5,C:150};
const power={...DEFAULTS.effekt,U:230,f:50,P:1150,pf:1,character:'induktiv',Qc:0,Rcable:0};
import {GUIDADE} from './uppgifter.gen.mjs?v=20260929';
export {elevtal} from '../gemensamt/elevtal.mjs?v=20260930';
export const GUIDE_TASKS=GUIDADE;
export function guideValues(task){return readouts(task.lesson,task.setup);}

// Personliga värden. Varje elev får egna värden ur sitt tal D (1–31), som slumpas på elevens enhet (gemensamt/elevtal.mjs).
// Posterna EL-000337–344 har referensvärdena (12 V, 40 Ω, 95,5 mH, 1 150 W); här byts talen i deras text mot elevens.
// Intervallen är valda så att inget svar ligger inom 2 % av ett exempel i genomgången eller ledtrådarna
// (se tests/personlig.test.mjs). Samma formler finns i innehall/lib/berakningar.py (lärarguidens facit, '40-4').
export const personligt=D=>({urms:13+(D%11),R:30+D,L:60+2*D,P:1650+30*D});
const fmt=(v,d)=>v.toLocaleString('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d});
export function personligUppgift(task,D){
 if(!D)return task;
 const p=personligt(D),setup={...task.setup};
 if(task.lesson==='sinus'&&task.id!=='kalibrator')setup.urms=p.urms;
 if(task.lesson==='impedans'){setup.R=p.R;setup.L=p.L;}
 if(task.lesson==='effekt')setup.P=p.P;
 const v=task.lesson==='impedans'?readouts('impedans',setup):null;
 const XL=v?fmt(v.XL,0):'',Z=v?fmt(v.Z,0):'';
 const byt=t=>{if(typeof t!=='string')return t;let s=t;
  if(task.lesson==='sinus'&&task.id!=='kalibrator')s=s.replaceAll('12,00 V',`${fmt(p.urms,2)} V`);
  if(task.lesson==='impedans'){s=s.replaceAll('40 + 30',`${p.R} + ${XL}`).replaceAll('X_{L} ≈ 30 Ω',`X_{L} ≈ ${XL} Ω`).replaceAll('|Z| ≈ 50 Ω',`|Z| ≈ ${Z} Ω`).replaceAll('R = 40 Ω',`R = ${p.R} Ω`).replaceAll('Enbart R: 40 Ω',`Enbart R: ${p.R} Ω`).replaceAll('95,5 mH',`${p.L} mH`).replaceAll('0,30 A',`${fmt(12/p.R,2)} A`);}
  if(task.lesson==='effekt')s=s.replaceAll('1 150 W',`${fmt(p.P,0)} W`);
  return s;};
 const ut={...task,setup};for(const k of ['prompt','source','explain','hint','title'])ut[k]=byt(task[k]);
 return ut;
}
export function parseGuideNumber(value){
 const s=String(value).trim().replace(/[−–]/g,'-').replace(',','.');
 return /^[+]?(\d+(\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;
}
export function guideDifference(task,field,predicted){return guideValues(task)[field]-predicted;}
