import {readouts,DEFAULTS} from './lessons.mjs';
export const GUIDE_VERSION=2;
const sin={...DEFAULTS.sinus,shape:'sinus',urms:12,f:50,t:5,showB:false,window:'auto'};
const rl={...DEFAULTS.impedans,kind:'RL',U:12,f:50,R:40,L:95.5,C:150};
const power={...DEFAULTS.effekt,U:230,f:50,P:1150,pf:1,character:'induktiv',Qc:0,Rcable:0};
import {GUIDADE} from './uppgifter.gen.mjs';
export const GUIDE_TASKS=GUIDADE;
export function guideValues(task){return readouts(task.lesson,task.setup);}
export function parseGuideNumber(value){
 const s=String(value).trim().replace(/[−–]/g,'-').replace(',','.');
 return /^[+]?(\d+(\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;
}
export function guideDifference(task,field,predicted){return guideValues(task)[field]-predicted;}
