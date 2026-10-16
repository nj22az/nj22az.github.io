import {DC_TERMINALS} from './dc-interaction.mjs';
export const DC_EXERCISES=Object.freeze([
 {id:'load-closed',title:'Spänning över en fungerande last',goal:'Mät spänningen över lasten när strömvägen är sluten.',mode:'dc',red:'loadPlus',black:'loadMinus',closed:true,fault:'none',point:'load',expected:12,unit:'V',theory:'module-1-v2-voltage',explain:'Lasten ligger mellan källans plus och minus. Därför får den hela källspänningen. Spänning mäts med proberna över lasten.'},
 {id:'load-open',title:'Vad händer när brytaren öppnas?',goal:'Behåll proberna över lasten. Öppna brytaren och undersök lastspänningen.',mode:'dc',red:'loadPlus',black:'loadMinus',closed:false,fault:'none',point:'load',expected:0,unit:'V',theory:'module-1-v2-circuit',explain:'Den öppna brytaren bryter den vanliga strömvägen. Lastens båda sidor ligger här på samma potential genom den hela returen. Lastspänningen blir därför 0 V.'},
 {id:'supply-open',title:'Har batteriet fortfarande spänning?',goal:'Låt brytaren vara öppen. Flytta proberna till källans båda poler och jämför med föregående mätning.',mode:'dc',red:'sourcePlus',black:'sourceMinus',closed:false,fault:'none',point:'supply',expected:12,unit:'V',theory:'module-1-v2-voltage',explain:'Källan har fortfarande 12 V mellan sina poler trots att den vanliga strömvägen genom lasten är bruten. Källspänning bevisar inte att lastström går.'},
 {id:'return-open',title:'En sluten brytare räcker inte',goal:'Slut brytaren men bryt returen. Mät över lasten och jämför med den fungerande kretsen.',mode:'dc',red:'loadPlus',black:'loadMinus',closed:true,fault:'open-return',point:'load',expected:0,unit:'V',theory:'module-1-v2-circuit',explain:'Även returen måste vara hel. Vid detta avbrott blir spänningsskillnaden över lasten 0 V i modellen. Ett enda avbrott räcker för att stoppa den vanliga lastströmmen.'},
 {id:'series-current',title:'Ström mäts genom mätaren',goal:'Återställ en hel retur. Ersätt mätbryggan med multimetern i serie och mät lastströmmen. Beräkna först den ideala strömmen från 12 V och 6 Ω.',mode:'current',red:'sourcePlus',black:'switchIn',closed:true,fault:'none',point:'current',expected:2,unit:'A',theory:'module-1-v2-ohm-example',explain:'Ohms lag ger idealt 2 A. Mätaren visar cirka 1,967 A eftersom dess interna shunt på 0,1 Ω ligger i serie med lasten. Strömmätaren ska ligga i serie, aldrig direkt över källan.'},
 {id:'isolated-resistance',title:'Resistans mäts utan yttre matning',goal:'Bryt och frånskilj källan. Mät resistansen över lasten med röd sladd i V Ω. Mätsladdarna tillför tillsammans 0,2 Ω.',mode:'ohm',red:'loadPlus',black:'loadMinus',closed:true,fault:'none',point:'load',expected:6.2,unit:'Ω',theory:'module-1-v2-resistance',explain:'Lasten är 6 Ω. Två mätsladdar tillför tillsammans 0,2 Ω, så mätaren visar cirka 6,2 Ω. Ω-läget använder mätarens egen testström. Den yttre källan ska vara frånskild.'}
]);
const check=(key,done,text,action,args)=>({key,done,text,action,args});
export function exerciseChecks(s,e){
 const current=e.mode==='current',ohm=e.mode==='ohm',checks=[];
 if(s.protection||s.meter.fuseMA||s.meter.fuseA){
  if(s.power)return [check('recover-power',false,'Bryt matningen innan skyddet återställs.','power',{on:false})];
  if(s.probeTargets.red||s.probeTargets.black)return [check('recover-probes',false,'Lossa båda proberna före återställning.','disconnect',{})];
  return [check('recover-reset',false,'Återställ modellens skydd och säkringar.','reset',{})];
 }
 checks.push(check('source',s.voltage===12,'Källan är 12 V.','set_voltage',{voltage:12}),check('load',s.resistance===6,'Lasten är 6 Ω.','set_load',{resistance:6}),check('switch',s.closed===e.closed,e.closed?'Brytaren är sluten.':'Brytaren är öppen.','switch',{closed:e.closed}),check('return',s.fault===e.fault,e.fault==='none'?'Returen är hel.':'Returen har ett avbrott.','return',{open:e.fault==='open-return'}),check('bridge',s.seriesOpen===current,current?'Mätbryggan är öppen så att strömmen går genom mätaren.':'Mätbryggan är sluten.','series_bridge',{open:current}),check('isolation',s.isolated===ohm,ohm?'Källan är frånskild för Ω-mätning.':'Källan är ansluten.','isolate',{isolated:ohm}),check('mode',s.meter.mode===e.mode,'Vredet står på '+(ohm?'Ω':current?'A ⎓':'V ⎓')+'.','set_mode',{mode:e.mode}),check('jack',s.meter.jack===(current?'a':'v'),'Röd sladd sitter i '+(current?'A-uttaget, inte mA.':'V Ω-uttaget.') ,'set_jack',{jack:current?'a':'v'}),check('com',s.meter.blackConnected,'Svart sladd sitter i COM.','com',{connected:true}),check('red',s.probeTargets.red===e.red,'Röd prob ligger på '+DC_TERMINALS[e.red]+'.','connect',{probe:'red',terminal:e.red}),check('black',s.probeTargets.black===e.black,'Svart prob ligger på '+DC_TERMINALS[e.black]+'.','connect',{probe:'black',terminal:e.black}),check('hold',!s.meter.hold,'HOLD är av.','hold',{on:false}),check('range',s.meter.range==='auto','Mätområdet är AUTO.','set_range',{range:'auto'}));
 // Rewire only with the source off, including when continuing from the previous exercise.
 if(s.power&&checks.some(c=>!c.done))checks.unshift(check('power-off',false,'Bryt matningen före omkoppling.','power',{on:false}));
 checks.push(check('power',s.power===!ohm,ohm?'Matningen är från.':'Matningen är till för avläsningen.','power',{on:!ohm}));
 return checks;
}
export function parsePrediction(text){
 const m=String(text).trim().replace(/−/g,'-').match(/^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(mA|kΩ|MΩ|[Aa]|[Vv](?:\s*(?:⎓|DC|dc))?|Ω|ohm)\s*$/);
 if(!m)return null;const u=m[2].replace(/\s/g,'');const unit=/a$/i.test(u)?'A':/^v/i.test(u)?'V':'Ω';let scale=u==='MΩ'?1e6:/^k/i.test(u)?1000:/^ma$/i.test(u)?.001:1;
 return {value:Number(m[1].replace(',','.'))*scale,unit};
}
export function assessExercise(s,e,observation,prediction){
 if(!exerciseChecks(s,e).every(c=>c.done))return {passed:false,kind:'connection',message:'Avläsningen sparades, men uppställningen motsvarar inte uppgiften. Kontrollera uppgiften och använd Visa nästa handgrepp vid behov. Mät sedan igen.'};
 if(observation.code!=='reading'||!Number.isFinite(observation.value))return {passed:false,kind:'instrument',message:observation.detail};
 const p=parsePrediction(prediction);
 if(!p||p.unit!==e.unit)return {passed:false,kind:'unit',message:'Mätningen är sparad. Skriv en ny förutsägelse med rätt enhet ('+e.unit+'), till exempel ett tal följt av enheten.'};
 const tolerance=e.expected===0?.05:Math.abs(e.expected)*.02;
 if(Math.abs(p.value-e.expected)>tolerance)return {passed:false,kind:'prediction',message:'Mätningen är sparad. Förutsägelsen avviker. Jämför ditt resonemang med förklaringen, följ repetitionslänken och gör ett nytt försök.'};
 return {passed:true,kind:'complete',message:'Koppling, avläsning och förutsägelse stämmer för denna övning. Förklara sambandet i din slutsats. Läraren bedömer resonemanget.'};
}
export function actualDCPoint(s){const p=s.probeTargets||{};const pair=(a,b)=>p.red===a&&p.black===b||p.red===b&&p.black===a;return s.meter.mode==='current'?'current':pair('sourcePlus','sourceMinus')?'supply':pair('loadPlus','loadMinus')?'load':pair('switchIn','switchOut')?'contact':'free';}
export function dcPreparation(s){return {sources_identified:[6,12,24].includes(s.voltage),boundary_defined:true,method_verified:!!s.meter.blackConnected&&!!s.probeTargets.red&&!!s.probeTargets.black&&s.meter.mode!=='off'&&(!['ohm','continuity'].includes(s.meter.mode)||!s.power&&s.isolated)};}
