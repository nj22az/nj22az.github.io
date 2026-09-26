// One calculation source for the instruments, text readouts and laboratory tasks.
import {readouts} from './lessons.mjs';
import {shapeValue} from './model.mjs';
export const instrumentNumber=n=>Number.isFinite(n)?n.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
const subscribers=new Set();let latest=null,control=null;
export function subscribeEquipment(fn){subscribers.add(fn);if(latest)fn(latest);return()=>subscribers.delete(fn);}
export function setEquipmentControl(fn){control=fn;}
export function adjustEquipment(key,value){if(latest?.editable&&control)control(key,value);}
export function publishEquipment(input){latest=equipmentState(input);subscribers.forEach(fn=>fn(latest));return latest;}
export function equipmentState({tab,values,locked=false,editable=false,taskId=''}){
 const r=readouts(tab,values),U=tab==='sinus'?values.urms:values.U,f=Number(values.f),shape=tab==='sinus'?values.shape:'sinus';
 const val=(n,u='')=>locked?'?':instrumentNumber(n)+(u?' '+u:'');
 const instrument=(id,name,type,rows,help)=>({id,name,type,rows,help});
 const source=instrument('source',taskId==='kalibrator'?'Kalibrator':'Växelspänningskälla','source',[[instrumentNumber(U)+' V','RMS'],[instrumentNumber(f)+' Hz',shape==='fyrkant'?'Fyrkant':shape==='triangel'?'Triangel':'Sinus']],taskId==='kalibrator'?'Känd referens: båda mätarna ska kontrolleras mot 10,00 V sinus.':'Källans inställning är effektivvärdet. Det är inte samma sak som sinuskurvans topp.');
 let instruments=[source],focus='trms';
 if(tab==='sinus'){
  instruments.push(instrument('trms','True RMS-multimeter','meter',[[val(r.trms,'V'),'V~ · True RMS']], 'Visar effektivvärdet. I denna idealmodell visar den RMS även för fyrkant och triangel.'),instrument('avg','Sinuskalibrerad multimeter','meter',[[val(r.avg,'V'),'V~ · Sinuskalibrerad']], 'Mäter likriktat medelvärde och skalar det för sinus. Fyrkant och triangel kan därför ge fel visning jämfört med RMS.'));
  if(taskId==='grund-period'||taskId==='grund-topp')focus='scope';
 }else if(tab==='impedans'){
  instruments.push(instrument('trms','Strömmätare','meter',[[val(r.I,'A'),'A~ · True RMS']], 'Visar strömmen i seriekretsen. Jämför med I = U/|Z|. Ström mäts i serie i en verklig krets enligt riggens anvisning.'),instrument('load','Komponentplatta','load',[[instrumentNumber(values.R)+' Ω','Resistor'],[values.kind.includes('L')?instrumentNumber(values.L)+' mH':'—','Spole'],[values.kind.includes('C')?instrumentNumber(values.C)+' µF':'—','Kondensator'],[val(r.XL,'Ω'),'X_{L} · beräknat'],[val(r.Z,'Ω'),'|Z| · beräknat']], 'Resistorn och spolen är de synliga komponenterna. X_{L} och |Z| är modellens beräknade värden, inte vanliga multimeteravläsningar.'));
  if(taskId==='grund-xl'||taskId==='grund-z')focus='load';
 }else{
  instruments.push(instrument('power','Effektanalysator','power',[[val(r.I,'A'),'Matningsström före komp.'],[instrumentNumber(values.P)+' W','Aktiv effekt P'],[val(r.S,'VA'),'Skenbar effekt S'],[val(r.Q,'var'),'Reaktiv effekt Q'],[instrumentNumber(values.pf),'Effektfaktor PF'],[val(r.I2,'A'),'Ström efter komp.']], 'Jämför matningsströmmen vid samma aktiva effekt och spänning. Den stora visningen gäller lasten före eventuell kompensation.'));
  focus='power';
 }
 const peak=tab==='sinus'?r.peak:U*Math.SQRT2,phi=tab==='sinus'?(values.showB?2*Math.PI*f*values.dt/1000:0):r.phi*Math.PI/180;
 const second=tab!=='sinus'||values.showB;
 const traces=Array.from({length:321},(_,i)=>{const angle=4*Math.PI*i/320;return [shapeValue(shape,angle),second?shapeValue(shape,angle-phi):null];});
 instruments.push(instrument('scope','Oscilloskop','scope',[[val(1000/f,'ms'),'Period T'],[val(peak,'V'),'Spänningens topp û'],[locked?'?':instrumentNumber(250/f)+' ms/div','Tidsbas · 8 rutor'],[second?'u hel · i/B streckad':'Spänning över tid',second?'Separata amplitudskalor':'']],tab==='sinus'?'Läs tiden mellan två motsvarande punkter och spänningens topp från nollnivån. Instrumentet visar två perioder.':'Spänning och ström har olika amplitudskalor. Jämför tidpunkterna: strömmens topp kommer senare vid induktiv last.'));
 return {tab,values:{...values},locked,editable:editable&&!locked,taskId,focus,instruments,traces:locked?[]:traces,second,U,f,peak,phase:phi,sourceShape:shape};
}
