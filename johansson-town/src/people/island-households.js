import {CAST,castMember} from './cast.js';

/** Canonical home identity. Geometry stays in the world layouts; every label reads this registry. */
const home=(id,address,district,entranceSiteId,extra={})=>Object.freeze({
 home:id,id,address,district,island:district==='Kitano hamlet'?'kitano':'minato',entranceSiteId,...extra,
});
export const ISLAND_HOMES=Object.freeze([
 home('kitano-1','Johansson & Thuan’s House, Kitano hamlet','Kitano hamlet','mayor-home'),
 home('kitano-2','Shiroma house, Kitano hamlet','Kitano hamlet','home-kitano-2'),
 home('kitano-3','Chinen house, Kitano hamlet','Kitano hamlet','home-kitano-3'),
 home('office','Harbour Office · residence behind the screen','Harbour','office'),
 home('clinic','Doctor’s flat, Town Hall Clinic','Town Hall','clinic'),
 home('ferry','Chief engineer’s cabin, Minato Maru','Harbour','ferry-terminal',{aboard:true}),
 home('koban','Officer Mori’s residence, Minato Police Box','Main Street','koban'),
 home('izakaya','Minato Izakaya · Barfly’s home','Main Street','izakaya'),
 home('fujita-houseboat','Shiosai houseboat, west pier','Harbour','fujita-houseboat'),
 home('resident-home-aya','1 Front-Row Yard','Front-Row Yard','resident-home-aya'),
 home('resident-home-kenji','2 Front-Row Yard','Front-Row Yard','resident-home-kenji'),
 home('market','Flat above Sakura Shōten','Sakura','market'),
 ...Array.from({length:12},(_,i)=>home('kitahama-'+(i+1),(i+1)+' Kitahama','Kitahama',
  i===0?'resident-home-thuan':i===1?'resident-home-mrs-sato':'home-kitahama-'+(i+1))),
 // Unit assignments are explicit in CAST, never derived from the order of the people list.
 ...Array.from({length:4},(_,i)=>home('kitahama-flat-'+(i+1),'Flat '+(i+1)+', Kitahama Heights, Fukugi Lane','Kitahama',
  'home-kitahama-flat-'+(i+1),{buildingId:'kitahama-flats',unitNumber:String(i+1)})),
 ...[['higa','Higa'],['kinjo','Kinjō'],['oshiro','Ōshiro']].map(([id,name])=>home(id,name+' house, Nishi-machi','Nishi-machi','home-'+id)),
 ...[['nakasone','Nakasone'],['miyagi','Miyagi']].map(([id,name])=>home(id,name+' house, east back','East back','home-'+id)),
 // Save-era identities remain recognisable after the two empty buildings are removed.
 ...[['tamaki','Tamaki'],['kamiya','Kamiya']].map(([id,name])=>home(id,name+' house, east back','East back','home-'+id,{retired:true})),
 home('nakamura','Above Nakamura Zenzai','Main Street','home-nakamura'),
 home('shimabukuro','Above the post office','Main Street','home-shimabukuro'),
 home('arakaki','Above Aragaki Confectionery Store','Main Street','home-arakaki'),
 home('yonamine','Above Yonamine Fresh Fish Store','Main Street','home-yonamine'),
]);

export const ISLAND_HOUSEHOLDS=Object.freeze(ISLAND_HOMES.map(def=>{
 const members=CAST.filter(p=>p.home===def.home||p.alsoAt.includes(def.home)).map(p=>Object.freeze({
  name:p.name,purpose:p.purpose,primaryHome:p.home,secondary:p.home!==def.home,
 }));
 return Object.freeze({...def,householdId:def.home,members:Object.freeze(members),
  residents:Object.freeze(members.map(m=>m.name)),status:def.retired?'retired':members.length?'occupied':'vacant',toLet:!members.length&&!def.retired});
}));
const BY_HOME=new Map(ISLAND_HOUSEHOLDS.map(h=>[h.home,h]));
const flats=ISLAND_HOUSEHOLDS.filter(h=>h.buildingId==='kitahama-flats');
const FLAT_BUILDING=Object.freeze({home:'kitahama-flats',id:'kitahama-flats',householdId:'kitahama-flats',
 address:'Kitahama Heights, Fukugi Lane',district:'Kitahama',island:'minato',entranceSiteId:'home-kitahama-flats',
 status:'building',toLet:false,units:Object.freeze(flats),members:Object.freeze(flats.flatMap(h=>h.members)),
 residents:Object.freeze(flats.flatMap(h=>h.residents))});

/** Historical building queries still find the block; they never arbitrarily choose a tenant’s flat. */
export const householdAtHome=id=>id==='kitahama-flats'?FLAT_BUILDING:BY_HOME.get(id)||null;
export const homeForResident=name=>householdAtHome(castMember(name)?.home);
export const secondaryHomesFor=name=>(castMember(name)?.alsoAt||[]).map(householdAtHome).filter(Boolean);
/** Walking Thuan retains her weekday room. The primary home remains clearly labelled on her card. */
export const activeHomeForResident=name=>secondaryHomesFor(name)[0]||homeForResident(name);
export const homeUnits=buildingId=>ISLAND_HOUSEHOLDS.filter(h=>h.buildingId===buildingId);
export const householdTitle=id=>{
 const h=typeof id==='string'?householdAtHome(id):id;
 if(!h||h.toLet)return 'House to let';
 if(h.retired)return 'Former home';
 if(h.status==='building')return 'Kitahama Heights';
 const names=h.residents;
 return (names.length>2?names.slice(0,-1).join(', ')+' & '+names.at(-1):names.join(' & '))+'’s home';
};

/** Two readable lines on the gate; complete names and address remain in its interaction. */
export function homeNameplate(id){
 const h=householdAtHome(id);if(!h||h.retired)return null;
 const address=h.unitNumber?'Flat '+h.unitNumber:h.address.replace(/,.*$/,'');
 return {title:householdTitle(h),address,owners:h.toLet?'To let':h.members.filter(m=>!m.secondary).map(m=>m.name).join(' · '),
  secondary:h.members.filter(m=>m.secondary).map(m=>m.name+' · weekday room').join('; '),vacant:h.toLet};
}
export function residentsLine(id){
 const h=householdAtHome(id);if(!h)return '';
 if(h.retired)return h.address+'. This former home has been removed and has no current household.';
 if(h.toLet)return h.address+'. Vacant — ask at the town hall.';
 if(h.status==='building')return h.units.map(unit=>'Flat '+unit.unitNumber+': '+(unit.toLet?'vacant':unit.residents.join(' & '))).join('\n');
 return h.address+'\n'+h.members.map(m=>m.name+' — '+m.purpose+(m.secondary?' (weekday room; primary home on Kitano-jima)':'')).join('\n');
}
