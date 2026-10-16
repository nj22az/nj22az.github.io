import {newDMMState,operateDMM,readDMM} from './dmm-actions.mjs';
import {DC_TERMINALS} from './dc-interaction.mjs';
import {benchLoadCurrent} from './dmm-model.mjs';
export const FAULT_CASES=Object.freeze([
 {id:'return',answer:'return',setup:{fault:'open-return'},explain:'Returen är bruten. Källan har spänning men lastens vanliga strömväg är öppen.',theory:'module-1-v2-circuit'},
 {id:'switch',answer:'switch',setup:{closed:false},explain:'Brytaren har ett internt kontaktavbrott. Spänning över kontakten tillsammans med noll lastspänning skiljer detta från ett friskt kontaktställe.',theory:'module-1-v2-circuit'}
]);
export function newChallenge(index){const c=FAULT_CASES[index%FAULT_CASES.length];return {...newDMMState(),power:true,meter:{...newDMMState().meter,mode:'dc'},...c.setup};}
export function canUndo(s,previous){return !!previous&&!s.power&&!s.protection&&!s.meter.fuseMA&&!s.meter.fuseA&&!previous.protection&&!previous.meter.fuseMA&&!previous.meter.fuseA;}
export function makeWorkbench(saved){const valid=['intro','free','challenge'].includes(saved?.mode)&&saved?.state?.meter&&saved?.state?.probeTargets;return {mode:valid?saved.mode:'intro',state:valid?structuredClone(saved.state):newDMMState(),history:[],activeProbe:'red',exercise:valid&&Number.isInteger(saved.exercise)?Math.max(0,Math.min(5,saved.exercise)):0,caseIndex:valid&&Number.isInteger(saved.caseIndex)?Math.abs(saved.caseIndex)%FAULT_CASES.length:0,measurements:valid&&Array.isArray(saved.measurements)?saved.measurements:[],revealed:false};}
export function operateWorkbench(w,action,args={}){
 const before=structuredClone(w.state);
 if(w.mode==='challenge'&&['switch','return','set_voltage','set_load','series_bridge','isolate'].includes(action))throw Error('Det dolda fallet ändras inte. Undersök med voltmetern och välj sedan din diagnos.');
 if(w.mode==='challenge'&&action==='set_mode'&&!['off','dc'].includes(args.mode))throw Error('Detta felsökningsfall undersöks med likspänningsmätning.');
 const result=operateDMM(w.state,action,args);w.state=result.state;
 if(action!=='reset'&&!w.state.protection&&!before.protection){w.history.push(before);if(w.history.length>24)w.history.shift();}else w.history=[];
 return result.observation;
}
export function undoWorkbench(w){const previous=w.history.at(-1);if(!canUndo(w.state,previous))throw Error('Bryt matningen före Ångra. Löst skydd återställs med Återställ skydd.');const fuseMA=w.state.meter.fuseMA,fuseA=w.state.meter.fuseA;w.state=w.history.pop();w.state.power=false;w.state.meter.fuseMA=fuseMA;w.state.meter.fuseA=fuseA;return w.state;}
export function readWorkbench(w){const r=readDMM(w.state);w.state=r.state;return r.observation;}
export function assessDiagnosis(w,answer,reason){const c=FAULT_CASES[w.caseIndex],points=new Set(w.measurements.filter(x=>x.code==='reading'&&x.mode==='dc'&&x.power===true&&!x.hold).map(x=>x.point));if(!['return','switch','source'].includes(answer))return {passed:false,kind:'incomplete',message:'Välj en diagnos och förklara den med dina mätningar.',theory:c.theory};if(!points.has('supply')||!points.has('contact')||!points.has('load'))return {passed:false,kind:'incomplete',message:'Spara spänningsmätningar över källan, brytaren och lasten innan du bedömer felorsaken.',theory:'module-1-v2-voltage'};if(!reason.trim())return {passed:false,kind:'incomplete',message:'Förklara vilka mätningar som stödjer din diagnos.',theory:c.theory};return {passed:answer===c.answer,message:answer===c.answer?'Rätt felorsak. '+c.explain:'Diagnosen stämmer inte med fallet. '+c.explain,theory:c.theory};}
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function circuitStatus(s,concealed=false){
 if(s.protection)return 'Skyddet har löst ut. Matningen är från. Lossa proberna och återställ skyddet.';
 if(s.isolated)return 'Källan är frånskild. Ingen yttre matning till lasten. Ω-läget använder egen testström.';
 if(!s.power)return 'Matningen är från. Ingen lastström. Källan är fortfarande ansluten.';
 if(concealed)return 'Matningen är till. Undersök de dolda kontaktlägena med voltmetern.';
 const gaps=[!s.closed?'brytaren är öppen':null,s.fault!=='none'?'returen är bruten':null].filter(Boolean);
 if(gaps.length)return 'Matningen är till, men '+gaps.join(' och ')+'. Ingen vanlig lastström.';
 if(s.seriesOpen)return benchLoadCurrent(s)>1e-6?'Mätbryggan är öppen. Lastströmmen går genom multimetern i serie.':'Mätbryggan är öppen. Anslut strömmätaren mellan Källa + och Brytare in för att sluta strömvägen.';
 return 'Matningen är till. Brytare, retur och mätbrygga är slutna. Lastström går.';
}
const P={sourcePlus:[110,85],sourceMinus:[110,265],switchIn:[290,85],switchOut:[410,85],loadPlus:[610,85],loadMinus:[610,265],returnLeft:[290,265],returnRight:[410,265]};
export function circuitMarkup(s,activeProbe='red',concealed=false){
 const flow=!concealed&&benchLoadCurrent(s)>1e-6,wire=(d,cls='')=>`<path class="dc-wire ${cls}" d="${d}"/>`;
 const gap=(x,y,closed,label)=>`<g aria-label="${E(label)}">${concealed?`<rect x="${x-46}" y="${y-19}" width="92" height="38" rx="7" class="dc-sealed"/><text x="${x}" y="${y+7}" text-anchor="middle">?</text>`:wire(`M ${x-60},${y} L ${closed?x+60:x+35},${closed?y:y-35}`)}<text x="${x}" y="${y-48}" text-anchor="middle">${E(label)}</text></g>`;
 let svg=`<svg class="dc-circuit" viewBox="0 0 760 360" role="img" aria-label="${concealed?'Kopplingsschema med två slutna höljen. Interna kontaktlägen är dolda.':'Samma koppling som 3D-bänken. Brytare '+(s.closed?'sluten':'öppen')+', retur '+(s.fault==='none'?'hel':'bruten')+'.'}"><title>Kretsens koppling och valda mätspetsar</title><defs><marker id="dc-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#08763a"/></marker></defs>${wire('M110 85V140 M110 210V265H290 M410 85H610V135 M610 215V265H410')}${wire(s.seriesOpen?'M110 85H175 M225 85H290':'M110 85H290')}${gap(350,85,s.closed,concealed?'Brytarens hölje':s.closed?'Sluten brytare':'Öppen brytare')}${gap(350,265,s.fault==='none',concealed?'Returens hölje':s.fault==='none'?'Hel retur':'Bruten retur')}<circle cx="110" cy="175" r="35" class="dc-symbol"/><text x="110" y="170" text-anchor="middle">+</text><text x="110" y="198" text-anchor="middle">−</text><text x="45" y="174" text-anchor="middle">${s.voltage} V</text><rect x="585" y="135" width="50" height="80" class="dc-symbol"/><text x="675" y="180" text-anchor="middle">${E(s.resistance)} Ω</text>`;
 if(s.seriesOpen)svg+='<text x="200" y="62" text-anchor="middle">Öppen mätbrygga</text>';
 if(!s.power||s.isolated)svg+='<text x="110" y="326" text-anchor="middle">Källan '+(s.isolated?'frånskild':'från')+'</text>';
 if(flow)svg+='<path class="dc-flow" d="M440 85H540 M610 225V250 M250 265H165" marker-end="url(#dc-flow-arrow)"/><text x="600" y="326" text-anchor="middle">Lastström går</text>';
 else if(!concealed)svg+='<text x="600" y="326" text-anchor="middle">Ingen lastström</text>';
 for(const [key,[x,y]]of Object.entries(P)){svg+=`<circle cx="${x}" cy="${y}" r="6" class="dc-node"/>`;const colors=['red','black'].filter(c=>s.probeTargets[c]===key);colors.forEach((c,i)=>{svg+=`<circle cx="${x}" cy="${y}" r="${12+i*8}" fill="none" stroke="${c==='red'?'#b02030':'#17251d'}" stroke-width="4"/><text x="${x}" y="${y+(y<170?25:-20)-i*22}" text-anchor="middle" class="dc-probe-label ${c}">${c==='red'?'Röd':'Svart'}</text>`;});}
 return svg+'</svg><p>Välj prob och tryck på en mätpunkt. Ringarna visar var proberna är anslutna.</p><div class="dc-terminal-list">'+Object.entries(DC_TERMINALS).map(([key,label])=>`<button type="button" data-terminal="${key}" aria-label="Anslut ${activeProbe==='red'?'röd':'svart'} prob till ${E(label)}" aria-pressed="${s.probeTargets[activeProbe]===key}">${E(label)}</button>`).join('')+'</div>';
}
