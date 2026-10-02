/**
 * Kitahama (北浜), the new district on the north-east land the island gained in
 * October 2026: one lane up from the east beach past the town hall's seawall, one lane
 * across, five walled house plots and a sugar-cane field towards the point. The plots
 * are the same standard walled houses as Nishi-machi (red-tile or concrete, gate,
 * shisa, nameplate), so the island has one way of building a home. Who lives in each
 * is island-homes.js; the gate faces the lane.
 */
export const KITAHAMA=Object.freeze({
 /** From the north end of the beach, between the town hall's seawall and the shore. */
 approach:Object.freeze({minX:42,maxX:44.6,minZ:26.6,maxZ:64.5}),
 /** The cross lane the houses face. */
 lane:Object.freeze({minX:33,maxX:59,minZ:64.5,maxZ:67.5}),
 plots:Object.freeze([
  {id:'kitahama-1',kind:'red-tile',family:'トゥアン・ナオ',romaji:'Thuan & Nao',minX:33.5,maxX:41.6,minZ:55,maxZ:64,gate:'north'},
  {id:'kitahama-2',kind:'concrete',family:'佐藤',romaji:'Sato',minX:45,maxX:54,minZ:55,maxZ:64,gate:'north'},
  {id:'kitahama-3',kind:'concrete',family:'上原',romaji:'Uehara',minX:33.5,maxX:41.8,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-4',kind:'red-tile',family:'当間',romaji:'Tōma',minX:42.3,maxX:50.6,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-5',kind:'concrete',family:'貸家',romaji:'To let',minX:51.1,maxX:59.4,minZ:68,maxZ:77.5,gate:'south'},
 ].map(p=>Object.freeze({...p,wall:'block'}))),
 field:Object.freeze({minX:35,maxX:53,minZ:79,maxZ:83.2}),
 /**
  * Kitahama stands on the island's own ground, which lies 0.4 m below the old town's
  * datum (coastal-ground.js PENINSULA_GROUND_Y). It was built at the datum, so its lanes
  * and walls floated 0.4 m over the grass and anybody walking up the lane sank into it.
  */
 y:-.4,
});
/** Whether a circle of radius r stands on one of Kitahama's two lanes. */
export function kitahamaLaneAt(x,z,r=0){
 return [KITAHAMA.approach,KITAHAMA.lane].some(L=>x>=L.minX+r&&x<=L.maxX-r&&z>=L.minZ+r&&z<=L.maxZ-r);
}
/** A plot's gate, the point just outside it, and the heading of somebody walking in. */
export function plotGate(p,out=.7){
 const cx=(p.minX+p.maxX)/2,cz=(p.minZ+p.maxZ)/2;
 if(p.gate==='north')return {door:[cx,p.maxZ+out],inward:0};
 if(p.gate==='south')return {door:[cx,p.minZ-out],inward:Math.PI};
 if(p.gate==='east')return {door:[p.maxX+out,cz],inward:Math.PI/2};
 return {door:[p.minX-out,cz],inward:-Math.PI/2};
}

/** The walking residents who live in Kitahama, by plot. */
export const KITAHAMA_RESIDENT_HOMES=Object.freeze({
 'kitahama-1':Object.freeze(['Thuan','Nao']),
 'kitahama-2':Object.freeze(['Mrs Sato']),
});
export const ISLAND_RESIDENT_NAMES=Object.freeze(Object.values(KITAHAMA_RESIDENT_HOMES).flat());
const ADDRESSES=Object.freeze({'kitahama-1':'1 Kitahama','kitahama-2':'2 Kitahama'});
/** The home record a walking resident's profile reads (residents.js). */
export function kitahamaHomeFor(name){
 for(const [id,names] of Object.entries(KITAHAMA_RESIDENT_HOMES))if(names.includes(name)){
  const p=KITAHAMA.plots.find(q=>q.id===id),{door}=plotGate(p);
  return {door:[...door],address:ADDRESSES[id],plot:id};
 }
 return null;
}
