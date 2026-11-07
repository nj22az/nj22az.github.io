// Station B · Växelström i maskinrummet. Samma åtta uppgifter, samma personliga värden ur D och samma
// arbetsgång som vecka 40:s guidade labb (förutsäg → läs av och jämför → förklara), med ett steg där Erik visar
// mätningen innan avläsningen syns. Inga elektriska värden räknas här: allt kommer ur guided-lessons.mjs/model.mjs,
// ögonblicksbilder av Växelströmslabbet (se ../snapshot.json). Ingen DOM; testas med node --test.
import {GUIDE_TASKS,guideValues,personligUppgift,parseGuideNumber} from './guided-lessons.mjs';
import {seriesCircuit,meterReadings,fmt} from './model.mjs';

export const KEY='sjoskolan-maskinrum-vaxelstrom-v1';
export const VERSION=1;
export const STEG=['Förutsäg','Erik visar','Läs av och jämför','Förklara'];

// Kursens tolerans: 2 %, eller 0,01 nära noll (samma som veckolabbet).
export const stammer=(v,p)=>Math.abs(v-p)<=Math.max(0.02*Math.abs(v),0.01);

// Var varje storhet läses av på bänken. 'beräknat' betyder att två avläsningar delas, som man gör i verkligheten.
export const KALLOR={
  trms:{instrument:'M1',text:'M1 True RMS, V~'},
  avg:{instrument:'M2',text:'M2 sinuskalibrerad, V~'},
  T:{instrument:'scope',text:'Oscilloskopet, Δt mellan markörerna'},
  peak:{instrument:'scope',text:'Oscilloskopet, markör på toppen'},
  XL:{instrument:'calc',text:'beräknat: U_{L} (M2 över spolen) / I (M1 i serie)'},
  Z:{instrument:'calc',text:'beräknat: U (M2 över källan) / I (M1 i serie)'},
  I:{instrument:'M1',text:'M1 i serie, A~'},
};
export function kalla(task,key){
  if(key==='I'&&task.lesson==='effekt')return {instrument:'analysator',text:'Effektanalysatorn, I'};
  return KALLOR[key]||{instrument:'calc',text:'simulerat värde'};
}

/** Vad instrumenten på bänken visar när Erik har kopplat upp uppgiften. Bara text till displayerna. */
export function instrumentVisning(task){
  const s=task.setup,v=guideValues(task),ut={};
  const V=x=>`${fmt(x,4)} V`,A=x=>`${fmt(x,3)} A`;
  if(task.lesson==='sinus'){
    if(task.id==='kalibrator'){const m=meterReadings(s);ut.M1=['V~',V(m.trueRms)];ut.M2=['V~',V(m.avgResp)];ut.kalibrator=`${fmt(s.urms,4)} V ~ ${s.f} Hz`;}
    else{ut.kalla=`${fmt(s.urms,4)} V ~ ${s.f} Hz`;ut.M1=['V~',V(s.urms)];ut.scope={urms:s.urms,f:s.f,markor:task.fields[0][0]==='T'?'T':'peak',T:v.T,peak:v.peak};}
  }else if(task.lesson==='impedans'){
    const r=seriesCircuit({kind:s.kind,U:s.U,f:s.f,R:s.R,L:s.L/1000,C:s.C/1e6});
    ut.kalla=`${fmt(s.U,4)} V ~ ${s.f} Hz`;ut.M1=['A~',A(r.I)];
    ut.M2=task.fields[0][0]==='XL'?['V~',V(r.UL)]:['V~',V(s.U)];
    ut.m2plats=task.fields[0][0]==='XL'?'spolen':'källan';
  }else{
    ut.analysator={U:`${fmt(s.U,4)} V`,I:A(v.I),P:`${fmt(s.P,4)} W`,PF:s.pf.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})};ut.lastbank=s.pf>=0.999?'R':'R + L';
  }
  return ut;
}

export function createStationB(storage,D){
  let data={version:VERSION,D,rows:{},current:null},storageOK=Boolean(storage);
  try{const s=JSON.parse(storage?.getItem(KEY)||'null');if(s?.version===VERSION&&s.D===D&&s.rows&&typeof s.rows==='object')data={...data,rows:s.rows,current:s.current||null};}catch{storageOK=false;}
  const tasks=GUIDE_TASKS.map(t=>personligUppgift(t,D));
  let task=tasks.find(t=>t.id===data.current)||tasks[0];
  const row=()=>data.rows[task.id]||{};
  const ready=r=>task.fields.every(([k])=>Number.isFinite(r?.predicted?.[k]));
  // Fas: 0 förutsäg, 1 Erik visar, 2 läs av och jämför, 3 förklara.
  let phase=row().shown&&ready(row())?(row().explanation?3:2):0;
  const save=()=>{data.current=task.id;try{storage?.setItem(KEY,JSON.stringify(data));}catch{storageOK=false;}};
  return {
    get D(){return D;},get tasks(){return tasks;},get task(){return task;},get phase(){return phase;},get row(){return structuredClone(row());},
    get storageOK(){return storageOK;},get rows(){return structuredClone(data.rows);},
    values(t=task){return guideValues(t);},
    select(id){const t=tasks.find(x=>x.id===id);if(!t)return false;task=t;const r=row();phase=r.shown&&ready(r)?(r.explanation?3:2):0;save();return true;},
    /** Elevens förutsägelse. Returnerar ett felmeddelande eller ''. Första förutsägelsen skrivs aldrig över. */
    predict(input){
      const predicted={};
      for(const [k,label,unit] of task.fields){
        const raw=String(input?.[k]??'').trim();
        if(!raw)return `Skriv din förutsägelse för ${label} (${unit}).`;
        const v=parseGuideNumber(raw);
        if(!Number.isFinite(v)||v<0)return `${label}: skriv ett positivt tal i ${unit}. Komma och punkt går båda bra.`;
        predicted[k]=v;
      }
      const g=data.rows[task.id],now=new Date().toISOString();
      data.rows[task.id]={first:g?.first||predicted,firstAt:g?.firstAt||now,predicted,attempts:(g?.attempts||0)+1,shown:false,explanation:g?.explanation||''};
      phase=1;save();return '';
    },
    /** Erik har visat mätningen: avläsningen får synas. */
    shown(){if(phase!==1)return false;data.rows[task.id]={...row(),shown:true,shownAt:new Date().toISOString()};phase=2;save();return true;},
    revise(){phase=0;},
    toExplain(){if(phase>=2)phase=3;},
    verdict(){const v=guideValues(task),r=row();return task.fields.map(([k,label,unit])=>({k,label,unit,value:v[k],predicted:r.predicted?.[k],ok:stammer(v[k],r.predicted?.[k]),kalla:kalla(task,k)}));},
    explain(text){const t=String(text??'').trim();if(!t)return 'Skriv din förklaring med egna ord.';data.rows[task.id]={...row(),explanation:t,explainedAt:new Date().toISOString()};save();return '';},
    next(){const i=tasks.indexOf(task);return tasks[i+1]||null;},
    /** Protokollets rader: första förutsägelse, antal försök, värde och förklaring (regel 25). */
    protocol(){return tasks.flatMap(t=>{const r=data.rows[t.id]||{},v=guideValues(t);return t.fields.map(([k,label,unit])=>({uppgift:t.title,ovning:t.ovning,storhet:label,enhet:unit,forsta:r.first?.[k],forstaTid:r.firstAt||'',senaste:r.predicted?.[k],forsok:r.attempts||0,
      varde:r.shown?v[k]:null,stammer:r.shown&&Number.isFinite(r.first?.[k])?stammer(v[k],r.first[k]):null,forklaring:r.explanation||'',kalla:kalla(t,k).text}));});},
    done(){return tasks.filter(t=>data.rows[t.id]?.explanation).length;},
  };
}
