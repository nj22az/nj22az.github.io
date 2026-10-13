import {FERRY_LOADS,FERRY_ELECTRICS,FERRY_GA,gaSpace,motorAmps} from './ferry-ship.js';
import {kks,kksCable,KKS_F0} from './ferry-kks.js';
/**
 * The Minato Maru's electrical installation as a yard draws it (the creator, 2026-10-13: "electrical drawings for the
 * ship … correct … with proper cabling"): every board and its sections, every feeder with its consumer's KKS tag,
 * its starter, its breaker, its cable (cores, section, rating, length and route) and its cable number, derived from
 * the load analysis (ferry-ship.js FERRY_LOADS) and the electrics (FERRY_ELECTRICS) by the rules below, so the
 * one-line, the feeder lists and the cable schedule (tools/ferry-drawings.mjs sheets 3, 3b, 3c, 3d) are one data set.
 *
 * Rules (IEC 60092, the marine cable standard, as the small yards of the 1990s applied it; NK's electrical rules):
 * - A motor's full-load current is its kW over √3·U·η·cos φ (motorAmps). A motor over 7.5 kW starts star-delta;
 *   smaller ones direct on line. The thruster (75 kW) is star-delta with the two-generator interlock.
 * - The feeder breaker is the next standard rating at or above 1.25 × the full-load current (motor), or the full-load
 *   current (heaters, lighting), from the moulded-case range 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200.
 * - The cable carries at least the breaker's rating: three-core EPR-insulated, sheathed and braided marine cable,
 *   rated in air at 45 °C ambient (the engine room): 1.5 mm² 16 A, 2.5 mm² 21 A, 4 mm² 28 A, 6 mm² 36 A, 10 mm²
 *   50 A, 16 mm² 67 A, 25 mm² 89 A, 35 mm² 110 A, 50 mm² 134 A, 70 mm² 166 A, 95 mm² 201 A, 120 mm² 232 A; the
 *   generator leads 2 × 95 mm² a phase. Lighting and small 105 V loads: two-core.
 * - The voltage drop at full load stays under 6 % (IEC 60092-201): checked with 0.0175 Ω·mm²/m copper.
 * - A cable's length is the route: along the deck from the board to the consumer's space (the manhattan distance
 *   between the spaces' centres), plus 4 m for every deck it climbs through a casing trunk, plus 15 % for the bends,
 *   the tray and the ends.
 * - Cable numbers follow the KKS rule: the tag of the lower end in alphabetical order, then 1001–1999 for AC ≤ 1 kV,
 *   2001–2499 for DC power, 4501–5999 for control, 7001–7999 for measuring, 8001–8999 for communication.
 */
const E=FERRY_ELECTRICS,F0=KKS_F0;
export const BREAKERS=Object.freeze([6,10,16,20,25,32,40,50,63,80,100,125,160,200]);
/** Three-core marine cable, mm² → rating in A at 45 °C (IEC 60092-352 table, EPR, derated for the engine room). */
export const CABLE_RATINGS=Object.freeze([[1.5,16],[2.5,21],[4,28],[6,36],[10,50],[16,67],[25,89],[35,110],[50,134],[70,166],[95,201],[120,232]]);
export const breakerFor=amps=>BREAKERS.find(b=>b>=amps)??null;
export const cableFor=amps=>CABLE_RATINGS.find(([,a])=>a>=amps)??null;
/** Voltage drop in per cent for a three-phase load: √3·I·ρ·L/S over U. */
export const voltageDrop=(amps,lengthM,mm2,volts=E.volts,phases=3)=>100*(phases===3?Math.sqrt(3):2)*amps*.0175*lengthM/mm2/volts;
/** The cable for a feeder: carries the breaker, and keeps the drop under 5 % at full load over its route (the next size up until it does). */
export function cableSized(breaker,amps,lengthM,volts,phases){let i=CABLE_RATINGS.findIndex(([,a])=>a>=breaker);if(i<0)return null;while(i<CABLE_RATINGS.length-1&&voltageDrop(amps,lengthM,CABLE_RATINGS[i][0],volts,phases)>5)i++;return CABLE_RATINGS[i];}

/** The boards: each a KKS installation unit with its sections, where it stands, what feeds it. */
export const FERRY_BOARDS=Object.freeze([
 Object.freeze({id:'MSB',tag:kks({fn:'BRA',n:10,eq:'GS',no:1}),name:'Main switchboard · 440 V 60 Hz · IT',where:'control-booth',sections:Object.freeze(['Generator No.1','Synchronising','Generator No.2','440 V feeders','105 V lighting']),fedBy:Object.freeze(['DG1','DG2','shore'])}),
 Object.freeze({id:'LB',tag:kks({fn:'BRB',n:10,eq:'GS',no:1}),name:'Lighting board · 105 V · through T1 or T2',where:'control-booth',sections:Object.freeze(['Transformer selector','Lighting feeders']),fedBy:Object.freeze(['T1','T2'])}),
 Object.freeze({id:'ESB',tag:kks({fn:'BRV',n:10,eq:'GS',no:1}),name:'Emergency switchboard · 440 V and 105 V',where:'eg-room',sections:Object.freeze(['Bus-tie from MSB','Emergency generator','440 V feeders','105 V feeders']),fedBy:Object.freeze(['MSB','EG'])}),
 Object.freeze({id:'DC',tag:kks({fn:'BTA',n:10,eq:'GS',no:1}),name:'24 V DC distribution · two battery banks and chargers',where:'eg-room',sections:Object.freeze(['Starting batteries','Radio and emergency batteries','Chargers']),fedBy:Object.freeze(['chargers'])}),
 Object.freeze({id:'shore',tag:kks({g:0,fn:'BQA',n:10,eq:'GS',no:1}),name:'Shore box · quay kiosk · 200 V 50 kVA · phase-sequence lamp',where:'foyer',sections:Object.freeze(['Shore breaker 75 A','Phase sequence']),fedBy:Object.freeze([])}),
]);
/** The sources: generators, the emergency generator, the transformers, the shore transformer. */
export const FERRY_SOURCES=Object.freeze([
 Object.freeze({id:'DG1',tag:kks({f0:F0.gen1,fn:'MKA',n:10,eq:'AG',no:1}),name:`Generator No.1 · ${E.generators.kVA} kVA · ${E.generators.volts} V · ${E.generators.amps} A`,where:'engine-room',to:'MSB',amps:E.generators.amps,breaker:E.generators.breaker.frame,cable:'2 × 95 mm² a phase'}),
 Object.freeze({id:'DG2',tag:kks({f0:F0.gen2,fn:'MKA',n:10,eq:'AG',no:1}),name:`Generator No.2 · ${E.generators.kVA} kVA`,where:'engine-room',to:'MSB',amps:E.generators.amps,breaker:E.generators.breaker.frame,cable:'2 × 95 mm² a phase'}),
 Object.freeze({id:'EG',tag:kks({f0:F0.emergency,fn:'MKA',n:10,eq:'AG',no:1}),name:`Emergency generator · ${E.emergency.kVA} kVA · ${E.emergency.kW} kW`,where:'eg-room',to:'ESB',amps:Math.round(E.emergency.kVA*1000/(Math.sqrt(3)*E.volts)),breaker:63,cable:'16 mm²'}),
 Object.freeze({id:'T1',tag:kks({fn:'BRT',n:10,eq:'GT',no:1}),name:`Lighting transformer T1 · ${E.transformers.lighting.kVA} kVA · ${E.transformers.lighting.ratio}`,where:'control-booth',to:'LB',amps:Math.round(E.transformers.lighting.kVA*1000/(Math.sqrt(3)*E.lighting)),breaker:50,cable:'10 mm²'}),
 Object.freeze({id:'T2',tag:kks({fn:'BRT',n:10,eq:'GT',no:2}),name:`Lighting transformer T2 (standby)`,where:'control-booth',to:'LB',amps:Math.round(E.transformers.lighting.kVA*1000/(Math.sqrt(3)*E.lighting)),breaker:50,cable:'10 mm²'}),
 Object.freeze({id:'shore',tag:kks({g:0,fn:'BQA',n:10,eq:'GT',no:1}),name:`Shore transformer · ${E.shore.kVA} kVA · ${E.shore.transformer}`,where:'foyer',to:'MSB',amps:E.shore.breaker,breaker:E.shore.breaker,cable:'25 mm² flexible, the shore cable'}),
]);

/** The consumers' KKS tags: the pumps and machines as on the piping diagrams, the rest by their systems. */
const TAGS=Object.freeze({
 'steer-1':kks({fn:'XSA',n:10,eq:'AP',no:1,cmp:'-M'}),'steer-2':kks({fn:'XSA',n:10,eq:'AP',no:2,cmp:'-M'}),'fire-1':kks({fn:'SGA',n:10,eq:'AP',no:1,cmp:'-M'}),'fire-2':kks({fn:'SGA',n:10,eq:'AP',no:2,cmp:'-M'}),
 bilge:kks({fn:'GMA',n:20,eq:'AP',no:1,cmp:'-M'}),'fire-emergency':kks({fn:'SGA',n:20,eq:'AP',no:1,cmp:'-M'}),'er-fans':kks({fn:'SAA',n:10,eq:'AN',no:1,cmp:'-M'}),'car-deck-fans':kks({fn:'SAB',n:10,eq:'AN',no:1,cmp:'-M'}),
 thruster:kks({fn:'XSC',n:10,eq:'AN',no:1,cmp:'-M'}),windlass:kks({fn:'XSD',n:10,eq:'AE',no:1,cmp:'-M'}),capstan:kks({fn:'XSD',n:20,eq:'AE',no:1,cmp:'-M'}),ramp:kks({fn:'XSB',n:10,eq:'AP',no:1,cmp:'-M'}),
 compressor:kks({fn:'SCA',n:10,eq:'AN',no:1,cmp:'-M'}),'compressor-2':kks({fn:'SCA',n:10,eq:'AN',no:2,cmp:'-M'}),'fuel-transfer':kks({fn:'EGC',n:10,eq:'AP',no:1,cmp:'-M'}),'fuel-transfer-2':kks({fn:'EGC',n:10,eq:'AP',no:2,cmp:'-M'}),
 purifier:kks({fn:'EGD',n:10,eq:'AT',no:1,cmp:'-M'}),'lube-priming':kks({f0:F0.mainP,fn:'XJV',n:10,eq:'AP',no:2,cmp:'-M'}),hydrophore:kks({fn:'GKB',n:10,eq:'AP',no:1,cmp:'-M'}),'hydrophore-2':kks({fn:'GKB',n:10,eq:'AP',no:2,cmp:'-M'}),
 sanitary:kks({fn:'GHB',n:10,eq:'AP',no:1,cmp:'-M'}),'sanitary-2':kks({fn:'GHB',n:10,eq:'AP',no:2,cmp:'-M'}),sewage:kks({fn:'GRA',n:10,eq:'AP',no:1,cmp:'-M'}),'sewage-2':kks({fn:'GRA',n:10,eq:'AP',no:2,cmp:'-M'}),
 separator:kks({fn:'GNA',n:10,eq:'AT',no:1,cmp:'-M'}),davit:kks({fn:'SMA',n:10,eq:'AE',no:1,cmp:'-M'}),'saloon-ac':kks({fn:'SAC',n:10,eq:'AH',no:1}),range:kks({fn:'GKB',n:30,eq:'AH',no:1}),'water-heater':kks({fn:'GKB',n:20,eq:'AC',no:1}),
 chargers:kks({fn:'BRU',n:10,eq:'GU',no:1}),workshop:kks({fn:'SMA',n:20,eq:'AE',no:2,cmp:'-M'}),ballast:kks({fn:'GHA',n:10,eq:'AP',no:1,cmp:'-M'}),
 'light-passenger':kks({fn:'BRB',n:10,eq:'GS',no:11}),'light-car-deck':kks({fn:'BRB',n:10,eq:'GS',no:12}),'light-engine':kks({fn:'BRB',n:10,eq:'GS',no:13}),'light-crew':kks({fn:'BRB',n:10,eq:'GS',no:14}),
 floodlights:kks({fn:'BRB',n:10,eq:'GS',no:15}),searchlight:kks({fn:'CTA',n:10,eq:'GS',no:1}),'bridge-electronics':kks({fn:'CTA',n:10,eq:'GS',no:2}),'room-ac':kks({fn:'SAC',n:20,eq:'AH',no:1}),'galley-appliances':kks({fn:'GKB',n:30,eq:'GS',no:1}),
 kiosk:kks({fn:'BRB',n:10,eq:'GS',no:16}),vending:kks({fn:'BRB',n:10,eq:'GS',no:17}),'lane-signals':kks({fn:'BRB',n:10,eq:'GS',no:20}),tv:kks({fn:'BRB',n:10,eq:'GS',no:19}),'toilet-fans':kks({fn:'SAC',n:30,eq:'AN',no:1,cmp:'-M'}),
 'emergency-light':kks({fn:'BRV',n:20,eq:'GS',no:11}),'nav-lights':kks({fn:'CTA',n:20,eq:'GS',no:1}),'emergency-radar':kks({fn:'CTA',n:10,eq:'GS',no:3}),'emergency-charger':kks({fn:'BRU',n:10,eq:'GU',no:3}),
});
export const loadTag=id=>TAGS[id]||null;
const DECK_Y={hold:0,car:1,passenger:2,bridge:3,compass:4};
/** The route length from a board's space to a consumer's space: manhattan across the decks' plan, 4 m a deck, 15 % slack. */
export function routeLength(fromId,toId){
 const a=gaSpace(fromId),b=gaSpace(toId);if(!a||!b)return null;
 const c=s=>[(s.z[0]+s.z[1])/2,(s.x[0]+s.x[1])/2];const [za,xa]=c(a),[zb,xb]=c(b);
 const decks=Math.abs((DECK_Y[a.deck]??0)-(DECK_Y[b.deck]??0));
 return Math.round((Math.abs(za-zb)+Math.abs(xa-xb)+decks*4)*1.15+2);
}
/** A consumer's starter: star-delta over 7.5 kW, direct on line below, none for heaters and lighting. */
export const starterFor=l=>l.supply!=='440'||/^light|lights|kiosk|vending|tv|electronics|charger|appliances|heater|range|searchlight|ac$/.test(l.id)||l.kW<=0?(l.supply==='440'&&/ac|heater|range|charger/.test(l.id)?'contactor':'switch'):l.kW>7.5?'star-delta':'DOL';
/**
 * Every feeder: the consumer (FERRY_LOADS), its tag, its board and board tag, full-load current, starter, breaker,
 * cable (cores × mm², rating), length, voltage drop and route, and the cable number. One feeder per consumer; a
 * consumer counted twice (two fans, two pumps) has two feeders, A and B.
 */
export const FERRY_FEEDERS=Object.freeze((()=>{
 const out=[];const counters={};
 for(const l of FERRY_LOADS){
  const board=FERRY_BOARDS.find(b=>b.id===l.board);const amps=l.supply==='440'&&l.kW>0&&!/light|kiosk|vending|tv|electronics|charger|appliances|heater|range|searchlight|ac$/.test(l.id)?motorAmps(l.kW):l.amps;
  const motor=/DOL|star-delta/.test(starterFor(l));const breaker=breakerFor(motor?amps*1.25:amps);const length=routeLength(board.where,l.where);const volts=l.supply==='105'?E.lighting:E.volts,phases=l.supply==='105'?1:3;const cable=cableSized(breaker,amps,length,volts,phases);
  const n=Math.max(1,l.count>1&&l.kW>=.5?Math.min(l.count,2):1);
  for(let i=0;i<n;i++){const key=l.board;counters[key]=(counters[key]||0);const cls=l.supply==='105'?'ac':'ac';
   // A consumer counted twice is two feeders: the second numbered on (AN002), or, for a per-engine pump, on the other engine (12XJV10).
   const base=TAGS[l.id]||kks({fn:'BRA',n:10,eq:'GS',no:50+out.length});const tag=n>1?(/^11/.test(base)?base.replace(/^11/,'1'+(1+i)):base.replace(/(AP|AN|AE|AH|GU|GS)(\d{3})/,(m,eq,no)=>eq+String(+no+i).padStart(3,'0'))):base;
   const cores=phases===1?2:3,drop=voltageDrop(amps,length,cable[0],volts,phases);
   out.push(Object.freeze({id:l.id+(n>1?['A','B'][i]:''),name:l.name+(n>1?' No.'+(i+1):''),tag,board:l.board,boardTag:board.tag,where:l.where,supply:l.supply,kW:l.kW,amps:Math.round(amps*10)/10,starter:starterFor(l),breaker,
    cable:`${cores} × ${cable[0]} mm²`,rating:cable[1],length,drop:Math.round(drop*10)/10,route:routeWords(board.where,l.where),number:kksCable(board.tag,tag,cls,counters[key]++)}));}
 }
 return out;
})());
/** The route in words: the spaces a cable passes, board to consumer. */
function routeWords(fromId,toId){
 const a=gaSpace(fromId),b=gaSpace(toId);if(!a||!b)return '';
 const steps=[a.id];
 if(a.deck==='hold'&&b.deck!=='hold')steps.push('casing-p trunk');if(a.deck!=='hold'&&b.deck==='hold')steps.push('casing-s trunk');
 if(b.deck==='bridge'&&a.deck!=='bridge')steps.push('lobby','corridor');if(b.deck==='passenger'&&a.deck==='hold')steps.push('lobby');
 if(b.id!==a.id)steps.push(b.id);
 return steps.join(' → ');
}
/** Sums a yard checks: the generator breaker carries the full load; the main cables' drop; no cable under its breaker. */
export function electricalChecks(){
 const bad=[];
 for(const f of FERRY_FEEDERS){if(f.rating<f.breaker)bad.push(f.id+': cable '+f.rating+' A under breaker '+f.breaker+' A');if(f.drop>6)bad.push(f.id+': drop '+f.drop+' %');if(f.breaker<f.amps)bad.push(f.id+': breaker under FLA');}
 return bad;
}
