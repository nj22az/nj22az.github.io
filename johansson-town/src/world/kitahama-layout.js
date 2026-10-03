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
  {id:'kitahama-1',kind:'red-tile',family:"Tuan Nao",romaji:'Thuan & Nao',minX:33.5,maxX:41.6,minZ:55,maxZ:64,gate:'north'},
  {id:'kitahama-2',kind:'concrete',family:"Sato",romaji:'Sato',minX:45,maxX:54,minZ:55,maxZ:64,gate:'north'},
  {id:'kitahama-3',kind:'concrete',family:"Uehara",romaji:'Uehara',minX:33.5,maxX:41.8,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-4',kind:'red-tile',family:"For the time being",romaji:'Tōma',minX:42.3,maxX:50.6,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-5',kind:'concrete',family:"Rental house",romaji:'To let',minX:51.1,maxX:59.4,minZ:68,maxZ:77.5,gate:'south'},
  // The residential quarter (docs/RESIDENTIAL-PLAN.md): the spine lane west, Fukugi
  // Lane north and Well Lane south. Two old red-tile houses for the grandparents.
  {id:'kitahama-6',kind:'red-tile',family:'Taira',romaji:'Taira',minX:4.5,maxX:12.5,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-7',kind:'concrete',family:'Chinen',romaji:'Chinen',minX:13,maxX:21.5,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-8',kind:'concrete',family:'Uezu',romaji:'Uezu',minX:25.5,maxX:33,minZ:68,maxZ:77.5,gate:'south'},
  {id:'kitahama-9',kind:'red-tile',family:'Gushiken',romaji:'Gushiken',minX:13.5,maxX:21.5,minZ:55,maxZ:64,gate:'north'},
  {id:'kitahama-10',kind:'red-tile',family:'Tamashiro',romaji:'Tamashiro',minX:22,maxX:32.8,minZ:55,maxZ:64,gate:'north'},
  {id:'kitahama-11',kind:'concrete',family:'Iha',romaji:'Iha',minX:25.5,maxX:33.5,minZ:79,maxZ:86,gate:'west'},
  {id:'kitahama-12',kind:'concrete',family:'Kohagura',romaji:'Kohagura',minX:25.5,maxX:33.5,minZ:86.5,maxZ:93.5,gate:'west'},
 ].map(p=>Object.freeze({...p,wall:'block'}))),
 field:Object.freeze({minX:35,maxX:53,minZ:79,maxZ:83.2}),
 /** The quarter's lanes, each 3 m: the spine west from the cross lane, and two dead ends. */
 spine:Object.freeze({minX:1,maxX:33,minZ:64.5,maxZ:67.5}),
 fukugiLane:Object.freeze({minX:22,maxX:25,minZ:67.5,maxZ:94}),
 wellLane:Object.freeze({minX:10,maxX:13,minZ:52,maxZ:64.5}),
 /** The footpath down past the school to the old town. */
 footpath:Object.freeze({minX:1,maxX:2.8,minZ:40,maxZ:64.5}),
 /** The apartment block on Fukugi Lane: two flats up, two down, an outside stair. */
 apartment:Object.freeze({id:'kitahama-flats',minX:13.5,maxX:21.5,minZ:79,maxZ:90,name:'Kitahama Heights'}),
 /** The pocket park at the corner of the spine and Well Lane. */
 park:Object.freeze({minX:3.5,maxX:9.5,minZ:55,maxZ:64}),
 /**
  * Kitahama stands on the island's own ground, which lies 0.4 m below the old town's
  * datum (coastal-ground.js PENINSULA_GROUND_Y). It was built at the datum, so its lanes
  * and walls floated 0.4 m over the grass and anybody walking up the lane sank into it.
  */
 y:-.4,
});
/** Every lane in Kitahama: the approach, the cross lane, and the quarter's. */
export const KITAHAMA_LANES=Object.freeze([KITAHAMA.approach,KITAHAMA.lane,KITAHAMA.spine,KITAHAMA.fukugiLane,KITAHAMA.wellLane,KITAHAMA.footpath]);
/** Whether a circle of radius r stands on one of Kitahama's lanes. */
export function kitahamaLaneAt(x,z,r=0){
 return KITAHAMA_LANES.some(L=>x>=L.minX+r&&x<=L.maxX-r&&z>=L.minZ+r&&z<=L.maxZ-r);
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
