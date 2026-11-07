import {benchLoadCurrent} from './dmm-model.mjs';
import {checkDCProbes} from './dc-interaction.mjs';
// Electrical state is authoritative; geometry only visualises it.
export function dcBenchState(s,last=null,connected=false){
 const measuring=connected&&last;const point=s.probeTargets?(s.measurementPoint||'supply'):measuring?last.point:null;
 const endpoints=s.probeTargets&&point!=='power'?[s.probeTargets.red,s.probeTargets.black]:point==='supply'?['sourcePlus','sourceMinus']:point==='load'?['loadPlus','loadMinus']:point==='contact'?['switchIn','switchOut']:point==='current'?['sourcePlus','switchIn']:null;
 return {noSourceLink:s.meter?!!s.seriesOpen:point==='current'&&(!s.probeTargets||checkDCProbes(point,s.probeTargets).ready),switchAngle:s.closed?0:.65,returnVisible:s.fault!=='open-return',seriesMeter:point==='current'&&(!s.probeTargets||checkDCProbes(point,s.probeTargets).ready),endpoints,
  result:s.meter?(last?last.text+(last.unit?' '+last.unit:''):s.meter.hold&&s.meter.held?s.meter.held.text+' '+s.meter.held.unit:s.meter.mode==='off'?'—':s.protection?'STOPP':'—'):measuring?(last.value===null?'—':Number.isFinite(last.value)?new Intl.NumberFormat('sv-SE',{maximumSignificantDigits:5}).format(last.value)+' '+last.unit:'OL'):'—',
  calculation:point==='power',currentFlows:s.meter?benchLoadCurrent(s)>1e-9:s.closed&&s.fault!=='open-return',source:s.meter?(s.isolated?'FRÅNSKILD':s.power?s.voltage+' V':'FRÅN'):s.voltage+' V',resistance:s.resistance+' Ω'};
}
export function dcWireRoutes(ports,mode){
 const p=n=>ports[n];
 const routes=[
  {name:'switch-to-load',color:'red',points:[p('switchOut'),[.055,.06,-.20],[.13,.06,-.18],p('loadPlus')]},
  {name:'load-to-return',color:'black',points:[p('loadMinus'),[.34,.065,.04],p('returnRight')]},
  {name:'return-to-source',color:'black',points:[p('returnLeft'),[-.19,.048,.06],[-.33,.14,.065],p('sourceMinus')]}
 ];
 if(!(mode.noSourceLink??mode.seriesMeter))routes.push({name:'source-to-switch',color:'red',points:[p('sourcePlus'),[-.195,.14,-.025],[-.18,.065,-.20],[-.13,.06,-.19],p('switchIn')]});
 if(mode.endpoints){for(const [i,n] of mode.endpoints.entries())if(n&&p(n))routes.push({name:'probe-'+i,color:i?'black':'red',points:[p(i?'meterBlack':'meterRed'),[i?-.19:.11,.065,.235],[p(n)[0],p(n)[1]+.085,p(n)[2]],p(n)],probe:true});}
 return routes;
}
