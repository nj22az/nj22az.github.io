import {solve,resistance} from './dc-network.mjs';
import {DC_TERMINALS} from './dc-interaction.mjs';
export const METER_MODES=Object.freeze({off:'OFF',dc:'V ⎓',ac:'V ~',ohm:'Ω',continuity:'Summer',current:'A ⎓'});
export const METER_DEFAULT=Object.freeze({mode:'off',jack:'v',blackConnected:true,range:'auto',input:10e6,fuseMA:false,fuseA:false,hold:false,held:null,backlight:false});
export function benchNetwork(s){return {nodes:Object.keys(DC_TERMINALS),edges:[...(!s.seriesOpen?[['sourcePlus','switchIn',0]]:[]),...(s.closed?[['switchIn','switchOut',0]]:[]),['switchOut','loadPlus',0],['loadPlus','loadMinus',s.resistance],['loadMinus','returnRight',0],...(s.fault!=='open-return'?[['returnLeft','returnRight',0]]:[]),['returnLeft','sourceMinus',0],...(!s.power&&!s.isolated?[['sourcePlus','sourceMinus',4700]]:[])],fixed:s.power&&!s.isolated?{sourcePlus:s.voltage,sourceMinus:0}:{}};}
const empty=(text,detail,code='waiting')=>({text,detail,code,value:null,unit:''});
function reading(value,unit,digits,detail,extra={}){const v=Math.abs(value)<.5*10**(-digits)?0:value;return {value,unit,text:v.toFixed(digits).replace('.',','),detail,code:'reading',...extra};}
export function observeDMM(s){
 const m={...METER_DEFAULT,...s.meter},p=s.probeTargets||{},net=benchNetwork(s),connected=!!(DC_TERMINALS[p.red]&&DC_TERMINALS[p.black]&&m.blackConnected);
 if(s.protection)return empty('STOPP','Modellens skydd har löst. Bryt matningen, lossa proberna och återställ skyddet.','tripped');
 const fused=m.jack==='ma'?m.fuseMA:m.jack==='a'?m.fuseA:false;let amps=0,electrical;
 // The jack, not the rotary switch, determines the physical shunt path.
 if(connected&&m.jack!=='v'&&!fused){const shunt=m.jack==='ma'?1:.1;electrical=solve(net,[[p.red,p.black,shunt]]);amps=((electrical.voltage[p.red]??0)-(electrical.voltage[p.black]??0))/shunt;
  if(s.power&&!s.isolated&&m.jack==='ma'&&Math.abs(amps)>.2)return {...empty('FUSE','mA-säkringen löser: mer än 200 mA. Skyddets omedelbara frånslag är en undervisningsmodell.','fault'),trip:{fuseMA:true}};
  if(s.power&&!s.isolated&&m.jack==='a'&&Math.abs(amps)>10)return {...empty('FUSE','A-säkringen löser: mer än 10 A i modellen. Matningen bryts. Ingen verklig tidskurva simuleras.','fault'),trip:{fuseA:true}};
  if(s.power&&!s.isolated&&Math.abs(amps)>6)return {...empty('STOPP','Modellmatningens 6 A-skydd bryter. Kontrollera om strömingången ligger parallellt över en spänningskälla.','fault'),trip:{source:true}};
 }
 if(m.mode==='off')return empty('—','Välj mätfunktion med vredet.','off');
 if(fused)return empty('OL','Säkringen i valt strömuttag är avbruten. Spänningsuttaget fungerar oberoende av strömsäkringarna.','fuse');
 if(!connected)return empty(['ohm','continuity'].includes(m.mode)?'OL':'—','Anslut svart sladd i COM och båda proberna till kretsen.');
 if(m.mode!=='current'&&m.jack!=='v')return empty('LEAd','Flytta röd sladd till V Ω. Strömuttagets shunt finns kvar även i V-läge och OFF.','jack');
 if(m.mode==='current'&&m.jack==='v')return empty('LEAd','Välj A- eller mA-uttaget. Bryt matningen innan sladdar eller seriekoppling ändras.','jack');
 if(m.mode==='current')return m.jack==='ma'?reading(amps*1000,'mA',2,'Ström genom mätarens 1 Ω-shunt.'):reading(amps,'A',3,'Ström genom mätarens 0,1 Ω-shunt; belastningen ändrar kretsströmmen.');
 if(['ohm','continuity'].includes(m.mode)){
  if(s.power||!s.isolated)return empty('STOPP','Ω och summer använder intern testström. Bryt och frånskilj källan före mätning.','live-ohm');
  const r=resistance(net,p.red,p.black)+.2;if(!Number.isFinite(r))return empty('OL','Ingen sammanhängande resistiv väg mellan proberna.','open');
  if(m.range!=='auto'&&r>=Number(m.range))return empty('OL','Resistansen överskrider valt område.','overrange');
  const unit=r>=1e6?'MΩ':r>=1000?'kΩ':'Ω',scale=r>=1e6?1e6:r>=1000?1000:1;return reading(r/scale,unit,scale===1?1:3,'Tvåledarmätning: komponent och båda sladdarnas sammanlagda 0,2 Ω.',{beep:m.mode==='continuity'&&r<30});
 }
 electrical=solve(net,[[p.red,p.black,m.input]]);const a=electrical.voltage[p.red],b=electrical.voltage[p.black];const volts=(a??0)-(b??0);
 if(m.mode==='ac')return reading(0,'V ~',2,'Bänken har ren likspänning. AC-kopplad mätning visar därför 0 V; ingen växelspänning eller rippel modelleras.');
 if(m.range!=='auto'&&Math.abs(volts)>=Number(m.range))return empty('OL','Spänningen överskrider valt område. Välj högre område eller AUTO.','overrange');
 return reading(volts,'V ⎓',m.range==='200'?1:2,'Röd potential minus svart potential. Ingångsresistansen belastar de valda noderna.');
}
export function applyDMMProtection(s){const r=observeDMM(s);if(r.trip){Object.assign(s.meter,r.trip);s.power=false;s.protection=true;}return r;}
export function benchLoadCurrent(s){if(!s.power||s.isolated||s.protection)return 0;const m=s.meter||METER_DEFAULT,p=s.probeTargets||{},extra=[];if(DC_TERMINALS[p.red]&&DC_TERMINALS[p.black]&&m.blackConnected){if(m.jack==='v')extra.push([p.red,p.black,m.input]);else if(!(m.jack==='ma'?m.fuseMA:m.fuseA))extra.push([p.red,p.black,m.jack==='ma'?1:.1]);}const v=solve(benchNetwork(s),extra).voltage;return Math.abs(((v.loadPlus??0)-(v.loadMinus??0))/s.resistance);}
