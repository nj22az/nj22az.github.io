import {householdAtHome,activeHomeForResident,homeNameplate} from '../people/island-households.js';

/**
 * Kitahama (北浜), the new district on the north-east land the island gained in
 * October 2026: one lane up from the east beach past the town hall's seawall, one lane
 * across, five walled house plots on a compact street grid. The plots
 * are the same standard walled houses as Nishi-machi (red-tile or concrete, gate,
 * shisa, nameplate), so the island has one way of building a home. Who lives in each
 * is island-homes.js; the gate faces the lane.
 */
export const KITAHAMA=Object.freeze({
 /** From the north end of the beach, between the town hall's seawall and the shore. */
 approach:Object.freeze({minX:42,maxX:45,minZ:30.5,maxZ:75}),
 /** The cross lane the houses face. */
 lane:Object.freeze({minX:-35,maxX:45,minZ:57.5,maxZ:61.5}),
 plots:Object.freeze([
  {id:'kitahama-1',kind:'red-tile',family:"Tuan Thao",romaji:'Thuan, Thao & Chin',minX:20,maxX:28,minZ:48,maxZ:57,gate:'north'},
  {id:'kitahama-2',kind:'concrete',family:"Sato",romaji:'Sato',minX:33,maxX:41,minZ:48,maxZ:57,gate:'north'},
  {id:'kitahama-3',kind:'concrete',family:"Uehara",romaji:'Uehara',minX:7,maxX:15,minZ:62,maxZ:71,gate:'south'},
  {id:'kitahama-4',kind:'red-tile',family:"For the time being",romaji:'Tōma',minX:20,maxX:28,minZ:62,maxZ:71,gate:'south'},
  {id:'kitahama-5',kind:'concrete',family:"Rental house",romaji:'To let',minX:33,maxX:41,minZ:62,maxZ:71,gate:'south'},
  // The residential quarter (docs/RESIDENTIAL-PLAN.md): the spine lane west, Fukugi
  // Lane north and Well Lane south. `family` and `romaji` are what the nameplate on the gate says (the
  // house's own sign); who lives there is the cast (people/cast.js), and a house nobody in it lives in is to let.
  {id:'kitahama-6',kind:'red-tile',family:'Taira',romaji:'Taira',minX:-32,maxX:-24,minZ:48,maxZ:57,gate:'north'},
  {id:'kitahama-7',kind:'concrete',family:'Chinen',romaji:'Chinen',minX:-19,maxX:-11,minZ:48,maxZ:57,gate:'north'},
  {id:'kitahama-8',kind:'concrete',family:'Uezu',romaji:'Uezu',minX:-6,maxX:2,minZ:48,maxZ:57,gate:'north'},
  {id:'kitahama-9',kind:'red-tile',family:'Gushiken',romaji:'Gushiken',minX:7,maxX:15,minZ:48,maxZ:57,gate:'north'},
  {id:'kitahama-10',kind:'red-tile',family:'Tamashiro',romaji:'Tamashiro',minX:-32,maxX:-24,minZ:62,maxZ:71,gate:'south'},
  {id:'kitahama-11',kind:'concrete',family:'Iha',romaji:'Iha',minX:-19,maxX:-11,minZ:62,maxZ:71,gate:'south'},
  {id:'kitahama-12',kind:'concrete',family:'Kohagura',romaji:'Kohagura',minX:-6,maxX:2,minZ:62,maxZ:71,gate:'south'},
 ].map(p=>{const plate=homeNameplate(p.id);return Object.freeze({...p,wall:'block',family:plate.address,romaji:plate.owners});})),
 field:Object.freeze({minX:37,maxX:47,minZ:84,maxZ:88.2}),
 /** The quarter's lanes, each 3 m: the spine west from the cross lane, and two dead ends. */
 spine:Object.freeze({minX:-35,maxX:45,minZ:72,maxZ:75}),
 fukugiLane:Object.freeze({minX:-23,maxX:-20,minZ:30.5,maxZ:91}),
 wellLane:Object.freeze({minX:-17.5,maxX:-14.5,minZ:26.8,maxZ:30.8}),
 /** Main Street continues directly through the relocated residential blocks. */
 footpath:Object.freeze({minX:3,maxX:6,minZ:30.5,maxZ:91}),
 northLane:Object.freeze({minX:-35,maxX:45,minZ:44.5,maxZ:47.5}),
 eastLane:Object.freeze({minX:-36,maxX:-33,minZ:30.5,maxZ:75}),
 southLane:Object.freeze({minX:-36,maxX:6,minZ:29.3,maxZ:32.3}),
 westCrossLane:Object.freeze({minX:-36,maxX:-20,minZ:44.5,maxZ:47.5}),
 middleLane:Object.freeze({minX:16,maxX:19,minZ:45.1,maxZ:75}),
 mainCrossLane:Object.freeze({minX:-7.55,maxX:6,minZ:30.5,maxZ:33.5}),
 fieldLane:Object.freeze({minX:29,maxX:32,minZ:45.1,maxZ:75}),
 /** The apartment block on Fukugi Lane: two flats up, two down, an outside stair. */
 apartment:Object.freeze({id:'kitahama-flats',minX:-32,maxX:-24,minZ:33.5,maxZ:44.5,name:'Kitahama Heights'}),
 /** The pocket park at the corner of the spine and Well Lane. */
 park:Object.freeze({minX:-19,maxX:-11,minZ:34.5,maxZ:43.5}),
 /** The compact residential blocks share the town datum. neighbourhood-ground.js
  * supplies their ground and grades the outer edge back to the island. */
 y:0,
});
/** Every lane in Kitahama: the approach, the cross lane, and the quarter's. */
export const KITAHAMA_LANES=Object.freeze([KITAHAMA.approach,KITAHAMA.lane,KITAHAMA.spine,KITAHAMA.fukugiLane,KITAHAMA.wellLane,KITAHAMA.footpath,KITAHAMA.northLane,KITAHAMA.eastLane,KITAHAMA.fieldLane,KITAHAMA.southLane,KITAHAMA.westCrossLane,KITAHAMA.middleLane,KITAHAMA.mainCrossLane]);
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

/** Canonical occupants of the two homes with the shared walking-resident interior. */
export const KITAHAMA_RESIDENT_HOMES=Object.freeze({
 'kitahama-1':householdAtHome('kitahama-1').residents,
 'kitahama-2':householdAtHome('kitahama-2').residents,
});
export const ISLAND_RESIDENT_NAMES=Object.freeze(Object.values(KITAHAMA_RESIDENT_HOMES).flat());
/** The home record a walking resident's profile reads (residents.js). */
export function kitahamaHomeFor(name){
 const h=activeHomeForResident(name),p=KITAHAMA.plots.find(q=>q.id===h?.home);
 if(!p)return null;
 return {door:[...plotGate(p).door],address:h.address,plot:p.id};
}

/** Exact numbered doors of the existing block. Ground-floor units are 1 and 2. */
export const KITAHAMA_FLATS=Object.freeze(Array.from({length:4},(_,i)=>{
 const A=KITAHAMA.apartment,x=A.maxX-1.9,z=i%2?A.maxZ-3.2:A.minZ+3.2,level=i<2?0:2.8;
 return Object.freeze({id:'kitahama-flat-'+(i+1),unitNumber:String(i+1),level,
  door:Object.freeze([x+.65,KITAHAMA.y+(level?level+.08:.02),z]),
  // The outdoor height field takes the upper corridor at the same x/z. Route ground-floor
  // visitors to their separate street openings, keeping the real numbered door recorded.
  approachPosition:Object.freeze([level?x+.65:KITAHAMA.fukugiLane.minX+.2,KITAHAMA.y+(level?level+.08:.04),z]),
  faceX:x+.03,inward:-Math.PI/2,approachFacing:level?0:-Math.PI/2});
}));
