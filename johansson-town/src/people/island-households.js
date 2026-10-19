import {CAST,castMember} from './cast.js';
import {retiredHomeFallback} from './roster.js';

/** Canonical home identity. Geometry stays in the world layouts; every label reads this registry. */
const home=(id,address,district,entranceSiteId,extra={})=>Object.freeze({
 home:id,id,address,district,island:district==='Kitano hamlet'?'kitano':'minato',entranceSiteId,...extra,
});
/**
 * Kitahama Heights (docs/CAST-CONSOLIDATION.md addendum 6): two attached ground-floor houses on Fukugi Lane, each with
 * its own front door, gate and garden, no corridor, no stair, no upper storey. The logical ids kitahama-flat-3 (Mac)
 * and kitahama-flat-4 (Mika) are kept for the save migration; the houses are shown as Kitahama Heights A (the north
 * house) and B (the south house), letters so that no former flat number is mistaken for a door. Flats 1 and 2 were
 * retired with their occupants (roster.js RETIRED_HOMES); kitahama-layout.js draws the geometry from this list.
 */
export const HEIGHTS_HOUSES=Object.freeze([
 Object.freeze({id:'kitahama-flat-3',house:'A',name:'Kitahama Heights A',side:'north'}),
 Object.freeze({id:'kitahama-flat-4',house:'B',name:'Kitahama Heights B',side:'south'}),
]);
export const ISLAND_HOMES=Object.freeze([
 home('kitano-1','Johansson & Thuan’s House, Kitano hamlet','Kitano hamlet','mayor-home'),
 // Kai's, the Kitano line hand's (people/roster.js QUARTERS): rented, supporting accommodation, not a core household.
 home('kitano-2','Shiroma house, Kitano hamlet','Kitano hamlet','home-kitano-2',{quarters:true}),
 home('kitano-3','Chinen house, Kitano hamlet','Kitano hamlet','home-kitano-3'),
 home('office','Harbour Office · residence behind the screen','Harbour','office'),
 home('clinic','Doctor’s flat, Town Hall Clinic','Town Hall','home-clinic'),
 home('ferry-chief-cabin','Johansson’s duty cabin, Minato Maru','Harbour','ferry-chief-cabin',{aboard:true,secondaryOnly:true}),
 home('ferry-engineer-duty-berth','Relief engineer’s duty berth, Minato Maru','Harbour','ferry-engineer-duty-berth',{aboard:true,secondaryOnly:true}),
 // The supporting crew's quarters aboard (roster.js QUARTERS; world/ferry-ship.js FERRY_GA mate-cabin, deckhand-cabin and
 // crew-cabin): their primary accommodation, registered so the directory and the nameplates know where they sleep, and
 // flagged `quarters` so the housing code never counts a cabin as a shore household or invents a house for them.
 home('ferry-officer-cabin','Chief officer’s cabin, Minato Maru','Harbour','ferry-officer-cabin',{aboard:true,quarters:true}),
 home('ferry-crew-cabin','Crew accommodation, Minato Maru','Harbour','ferry-crew-cabin',{aboard:true,quarters:true}),
 home('ferry','Former chief engineer home identity','Harbour','ferry-terminal',{retired:true}),
 home('koban','Officer Mori’s quarters, Minato Police Station','Main Street','koban'),
 home('izakaya','Minato Izakaya · Barfly’s home','Main Street','home-izakaya'),
 home('fujita-houseboat','Shiosai houseboat, west pier','Harbour','fujita-houseboat'),
 home('resident-home-aya','1 Front-Row Yard','Front-Row Yard','resident-home-aya'),
 home('resident-home-kenji','2 Front-Row Yard','Front-Row Yard','resident-home-kenji'),
 home('market','Sakura main office and kitchenette','Sakura','market',{retired:true}),
 ...Array.from({length:12},(_,i)=>home('kitahama-'+(i+1),(i+1)+' Kitahama','Kitahama',
  i===0?'resident-home-thuan':i===1?'resident-home-mrs-sato':'home-kitahama-'+(i+1),
  {retired:[7,9,10,11,12].includes(i+1)})),
 // Unit assignments are explicit in CAST, never derived from the order of the people list.
 ...HEIGHTS_HOUSES.map(h=>home(h.id,h.name+', Fukugi Lane','Kitahama','home-'+h.id,{buildingId:'kitahama-flats',unit:h.house})),
 // The two logical units that went with the upper storey (phase 3): a save that names one lands at the roster's
 // fallback, and the two retired identities still walking (people/cast.js) are registered here with no home standing.
 ...[1,2].map(n=>home('kitahama-flat-'+n,'Former Flat '+n+', Kitahama Heights','Kitahama','home-kitahama-flat-'+n,{retired:true,buildingId:'kitahama-flats'})),
 ...[['higa','Higa'],['kinjo','Kinjō'],['oshiro','Ōshiro']].map(([id,name])=>home(id,name+' house, Nishi-machi','Nishi-machi','home-'+id)),
 ...[['nakasone','Nakasone'],['miyagi','Miyagi']].map(([id,name])=>home(id,name+' house, east back','East back','home-'+id,{retired:true})),
 // Save-era identities remain recognisable after the two empty buildings are removed.
 ...[['tamaki','Tamaki'],['kamiya','Kamiya']].map(([id,name])=>home(id,name+' house, east back','East back','home-'+id,{retired:true})),
 home('nakamura','Above Nakamura Zenzai','Main Street','home-nakamura'),
 home('shimabukuro','Above the post office','Main Street','home-shimabukuro'),
 home('arakaki','Above Aragaki Confectionery Store','Main Street','home-arakaki',{retired:true}),
 home('yonamine','Above Yonamine Fresh Fish Store','Main Street','home-yonamine',{retired:true}),
]);

export const ISLAND_HOUSEHOLDS=Object.freeze(ISLAND_HOMES.map(def=>{
 // A retired home has no household: whoever still names it (a retired identity waiting for phase 4) sleeps at the
 // roster's fallback (retiredHomeFallback) and is on no nameplate.
 const members=def.retired?[]:CAST.filter(p=>p.home===def.home||p.alsoAt.includes(def.home)).map(p=>Object.freeze({
  name:p.name,purpose:p.purpose,primaryHome:p.home,secondary:p.home!==def.home,
 }));
 return Object.freeze({...def,householdId:def.home,members:Object.freeze(members),
  residents:Object.freeze(members.map(m=>m.name)),status:def.retired?'retired':members.length?'occupied':'vacant',toLet:!members.length&&!def.retired,
  fallback:def.retired&&retiredHomeFallback(def.home)!==def.home?retiredHomeFallback(def.home):null});
}));
const BY_HOME=new Map(ISLAND_HOUSEHOLDS.map(h=>[h.home,h]));
const houses=ISLAND_HOUSEHOLDS.filter(h=>h.buildingId==='kitahama-flats'&&!h.retired);
const HEIGHTS_BUILDING=Object.freeze({home:'kitahama-flats',id:'kitahama-flats',householdId:'kitahama-flats',
 address:'Kitahama Heights, Fukugi Lane',district:'Kitahama',island:'minato',entranceSiteId:'home-kitahama-flats',
 status:'building',toLet:false,units:Object.freeze(houses),members:Object.freeze(houses.flatMap(h=>h.members)),
 residents:Object.freeze(houses.flatMap(h=>h.residents))});

/** Historical building queries still find the pair of houses; they never arbitrarily choose a tenant's house. */
export const householdAtHome=id=>id==='kitahama-flats'?HEIGHTS_BUILDING:BY_HOME.get(id)||null;
export const homeForResident=name=>householdAtHome(castMember(name)?.home);
export const secondaryHomesFor=name=>(castMember(name)?.alsoAt||[]).map(householdAtHome).filter(Boolean);
/** The home a resident walks to ashore: nobody has a second shore room now (addendum 4), so it is the primary home. */
export const activeHomeForResident=name=>secondaryHomesFor(name).find(h=>!h.aboard)||homeForResident(name);
export const homeUnits=buildingId=>ISLAND_HOUSEHOLDS.filter(h=>h.buildingId===buildingId&&!h.retired);
/** The households proper: occupied primary homes ashore that are not supporting quarters (roster.js HOUSEHOLDS). */
export const CORE_HOUSEHOLDS=Object.freeze(ISLAND_HOUSEHOLDS.filter(h=>h.status==='occupied'&&!h.quarters&&!h.secondaryOnly));
/** Supporting accommodation: the crew's cabins aboard and Kai's rented house (roster.js QUARTERS). */
export const SUPPORTING_QUARTERS=Object.freeze(ISLAND_HOUSEHOLDS.filter(h=>h.quarters));
export const householdTitle=id=>{
 const h=typeof id==='string'?householdAtHome(id):id;
 if(!h||h.toLet)return 'House to let';
 if(h.retired)return 'Former home';
 if(h.status==='building')return 'Kitahama Heights';
 // A cabin aboard is named for what it is; its occupants are on the directory card.
 if(h.aboard&&h.quarters)return h.address.replace(/,.*$/,'');
 const names=h.residents;
 return (names.length>2?names.slice(0,-1).join(', ')+' & '+names.at(-1):names.join(' & '))+'’s home';
};

/** Two readable lines on the gate; complete names and address remain in its interaction. */
export function homeNameplate(id){
 const h=householdAtHome(id);if(!h||h.retired)return null;
 const address=h.address.replace(/,.*$/,'');
 // The only secondary homes left are duty berths aboard (Johansson's cabin, Mac's berth).
 return {title:householdTitle(h),address,owners:h.toLet?'To let':h.members.filter(m=>!m.secondary).map(m=>m.name).join(' · '),
  secondary:h.members.filter(m=>m.secondary).map(m=>m.name+' · duty berth').join('; '),vacant:h.toLet};
}
export function residentsLine(id){
 const h=householdAtHome(id);if(!h)return '';
 if(h.retired)return h.address+'. This former home has been removed and has no current household.';
 if(h.toLet)return h.address+'. Vacant — ask at the town hall.';
 if(h.status==='building')return h.units.map(unit=>unit.address.replace(/,.*$/,'')+': '+(unit.toLet?'vacant':unit.residents.join(' & '))).join('\n');
 return h.address+'\n'+h.members.map(m=>m.name+' — '+m.purpose+(m.secondary?' (duty berth; primary home ashore)':'')).join('\n');
}
