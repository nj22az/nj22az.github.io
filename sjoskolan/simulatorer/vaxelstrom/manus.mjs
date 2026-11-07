// Eriks manus för Station B. Erik visar *hur* mätningen görs: vilket instrument, vilket läge, var sladdarna sitter
// och var avläsningen står. Han säger aldrig svaret och nämner inga tal utöver det uppgiften redan anger
// (kalibratorns 10 V, landströmmens 230 V). Arbete på 230 V gör bara Erik (regel 4: eleven stannar på SELV).
// Takterna är presentation; uppgiftens text, metod och ledtråd kommer ur innehållsdatabasen.
import * as THREE from '../../../johansson-town/vendor/three.module.js';

const PI=Math.PI;
// Erik står till vänster om det han arbetar med och greppar spetsen en handlängd bakom kontaktpunkten.
const vid=x=>[x-.22,-.47];
const grepp=p=>p?p.clone().add(new THREE.Vector3(.03,.07,.1)):null;
// När avläsningen visas kliver Erik åt sidan med händerna nere, så att eleven ser instrumentet.
const SIDAN={bank:[-.48,-.5],last:[2.72,-1.3]};

/** Takterna för en uppgift. P: scenens punkter. Sladdar: [från, till, färg] där r = röd, s = svart, b = prob. */
export function takter(task,P){
  const g=n=>grepp(P[n]);
  const serie=[['src+','A','r'],['C','M1.A','r'],['M1.COM','src−','s']];
  switch(task.id){
    case 'kalibrator':return [
      {d:3.6,at:vid(-.5),face:PI,cam:'kalibrator',say:'Först kontrollerar vi mätarna. Kalibratorn ger ett känt värde, så den avslöjar en mätare som visar fel.'},
      {d:3.4,at:vid(-.5),face:PI,cam:'kalibrator',R:g('cal+'),L:g('cal−'),connect:[['M1.V','cal+','r'],['M1.COM','cal−','s'],['M2.V','cal+','r'],['M2.COM','cal−','s']],say:'Båda mätarna på V~, parallellt över kalibratorn. Röd till plus, svart till minus.'},
      {d:4,at:SIDAN.bank,face:PI*.8,cam:'matare',show:true,say:'Läs av M1 och M2. Visar de samma som kalibratorn kan vi lita på dem i dag.'},
    ];
    case 'grund-period':return [
      {d:3.4,at:vid(-.18),face:PI,cam:'kalla',R:g('srcKnob'),probe:false,say:'Källan ger skyddsklenspänning. Jag ställer den som uppgiften säger, och läser inställningen på displayen.'},
      {d:3.6,at:vid(.05),face:PI,cam:'scope',R:g('src+'),L:g('src−'),connect:[['scope','src+','b'],['scope','src−','s'],['M1.V','src+','r'],['M1.COM','src−','s']],say:'Oscilloskopets prob på källans plus, jordklämman på minus. M1 på V~ över källan.'},
      {d:4.4,at:SIDAN.bank,face:PI*.8,cam:'scope',show:true,say:'Två markörer där kurvan börjar om på samma sätt, uppåt genom noll. Tiden mellan dem är en period.'},
    ];
    case 'grund-topp':return [
      {d:3.2,at:vid(.05),face:PI,cam:'scope',R:g('src+'),L:g('src−'),connect:[['scope','src+','b'],['scope','src−','s'],['M1.V','src+','r'],['M1.COM','src−','s']],say:'Samma källa och samma koppling som förut.'},
      {d:4.6,at:SIDAN.bank,face:PI*.8,cam:'scope',show:true,say:'Nu en markör på nollinjen och en på toppen. Multimetern visar effektivvärdet. Skärmen visar toppen.'},
    ];
    case 'grund-xl':return [
      {d:3.8,at:vid(-.05),face:PI,cam:'platta',R:g('A'),L:g('C'),connect:serie,say:'R och L i serie på plattan. M1 sitter i serie, på A-uttaget med A~. Strömmen går genom mätaren.'},
      {d:3.4,at:vid(.02),face:PI,cam:'platta',R:g('B'),L:g('C'),connect:[['M2.V','B','r'],['M2.COM','C','s']],say:'M2 på V~ över spolen, mellan B och C.'},
      {d:4.6,at:SIDAN.bank,face:PI*.8,cam:'matare',show:true,say:'Spänningen över spolen delat med strömmen ger spolens reaktans. Vi räknar med en ideal spole, utan resistans i lindningen.'},
    ];
    case 'grund-z':return [
      {d:3.6,at:vid(-.05),face:PI,cam:'platta',R:g('A'),L:g('C'),connect:serie,say:'Samma krets. M1 sitter kvar i serie.'},
      {d:3.4,at:vid(-.2),face:PI,cam:'kalla',R:g('src+'),L:g('src−'),connect:[['M2.V','src+','r'],['M2.COM','src−','s']],say:'M2 flyttar jag till källan. Nu mäter den spänningen över hela kretsen.'},
      {d:4.4,at:SIDAN.bank,face:PI*.8,cam:'matare',show:true,say:'Hela spänningen delat med strömmen ger impedansens belopp.'},
    ];
    case 'grund-strom':return [
      {d:3.4,at:vid(-.05),face:PI,cam:'platta',R:g('A'),L:g('C'),connect:serie,say:'Kretsen är kopplad som förut, med M1 i serie.'},
      {d:4,at:SIDAN.bank,face:PI*.8,cam:'matare',show:true,connect:[['M2.V','src+','r'],['M2.COM','src−','s']],say:'Strömmen läser du direkt på M1. Jämför med vad den hade blivit med bara motståndet.'},
    ];
    case 'grund-pf1':return [
      {d:3.6,at:[2.7,-1.25],face:PI,cam:'last',say:'Nu landström. Vi ligger vid kaj och uttaget ger 230 volt. Det här kopplar jag, du tittar.'},
      {d:3.6,at:[1.9,-2.02],face:PI,cam:'last',R:g('socket'),probe:false,say:'Lastbanken är frånslagen. Analysatorn sitter mellan uttaget och lastbanken.'},
      {d:3.4,at:[2.62,-1.3],face:PI,cam:'last',R:g('lastbank.R'),L:g('lastbank.till'),probe:false,say:'Lastbanken på bara motstånd. Jag slår till.'},
      {d:4.2,at:SIDAN.last,face:PI*1.2,cam:'last',show:true,say:'Läs strömmen på analysatorn.'},
    ];
    case 'grund-pf05':return [
      {d:3.6,at:[2.62,-1.3],face:PI,cam:'last',R:g('lastbank.L'),probe:false,say:'Samma aktiva effekt och samma spänning. Nu kopplar jag in lastbankens spolar också.'},
      {d:4.6,at:SIDAN.last,face:PI*1.2,cam:'last',show:true,say:'Effektfaktorn sjunker. Titta på strömmen igen och jämför.'},
    ];
    default:return [{d:2,at:SIDAN.bank,face:PI*.8,show:true,say:''}];
  }
}

/** Sladdarna när uppgiften är uppkopplad (efter Eriks visning eller när eleven kommer tillbaka). */
export function sladdar(task){
  const serie=[['src+','A','r'],['C','M1.A','r'],['M1.COM','src−','s']];
  switch(task.id){
    case 'kalibrator':return [['M1.V','cal+','r'],['M1.COM','cal−','s'],['M2.V','cal+','r'],['M2.COM','cal−','s']];
    case 'grund-period':case 'grund-topp':return [['scope','src+','b'],['scope','src−','s'],['M1.V','src+','r'],['M1.COM','src−','s']];
    case 'grund-xl':return [...serie,['M2.V','B','r'],['M2.COM','C','s']];
    case 'grund-z':case 'grund-strom':return [...serie,['M2.V','src+','r'],['M2.COM','src−','s']];
    default:return [];
  }
}

/** Kameravinkel när eleven förutsäger: uppgiftens apparat. */
export function vinkel(task){
  return {kalibrator:'kalibrator','grund-period':'scope','grund-topp':'scope','grund-xl':'platta','grund-z':'platta','grund-strom':'matare','grund-pf1':'last','grund-pf05':'last'}[task.id]||'bank';
}
