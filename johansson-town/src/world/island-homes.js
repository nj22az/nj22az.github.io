import * as THREE from '../../vendor/three.module.js';
import {KITAHAMA,KITAHAMA_FLATS,plotGate} from './kitahama-layout.js';
import {FUMOTO} from './fumoto-layout.js';
import {householdAtHome,householdTitle} from '../people/island-households.js';
import {householdFor} from '../people/households.js';

/**
 * The doors of the Kitahama houses (okinawa/layout.js KITAHAMA), as sites like every
 * door in town. The houses themselves are built with the Okinawan quarter (quarters.js).
 *
 * Thuan & Thao and Mrs Sato are walking residents: their houses are home sites with a
 * homeOwner, so home-residents.js puts them to bed there and they no longer leave on
 * the ferry at night. The others are families from the household registry, whose room
 * is built by family-home.js; the house to let is empty.
 */
import {KITAHAMA_RESIDENT_HOMES} from './kitahama-layout.js';
export {KITAHAMA_RESIDENT_HOMES,ISLAND_RESIDENT_NAMES,kitahamaHomeFor} from './kitahama-layout.js';

export function buildIslandHomes(world,options){
 const homes=world.homes instanceof Map?world.homes:new Map();
 for(const p of KITAHAMA.plots){
  const {door,inward}=plotGate(p),household=householdAtHome(p.id),residents=KITAHAMA_RESIDENT_HOMES[p.id];
  const title=householdTitle(household);
  const site={id:household?.entranceSiteId||'home-'+p.id,title,jp:p.family,sub:'KITAHAMA',color:0xd4c6ad,accent:'#776953',
   homeId:p.id,isResidence:true,status:household?.status||'vacant',residents:[...(household?.residents||[])],
   directions:'Follow Kitahama’s cross lane to '+(household?.address||p.id)+'. The gate lists the household.',
   line:household?.address||p.id,door:[door[0],KITAHAMA.y+.02,door[1]],exitPosition:[door[0],KITAHAMA.y+.02,door[1]],entryFacing:inward,x:door[0],z:door[1],opens:'00:00',plot:p.id};
  if(residents){
   Object.assign(site,{homeOwner:residents[0],homeOwners:[...residents],homeEntry:p.id,houseKind:p.kind||'concrete'});
   for(const name of residents)homes.set(name,{owner:name,household:householdFor(name)?.id,address:site.line,door:[...door],building:'kitahama',occupied:false});
  }else Object.assign(site,{familyHome:household||{members:[],toLet:true},houseKind:p.kind||'concrete',ownRoom:true});
  options.sites.push(site);
  const anchor=new THREE.Object3D();anchor.name='kitahama entrance:'+p.id;anchor.position.set(door[0],1.3,door[1]);world.group.add(anchor);
  options.register?.(anchor,(household?.toLet?'Look round ':'Visit ')+title+' · '+site.line,()=>options.enter(site));
 }
 // Fumoto's families, at the foot of Mount Aoba: the same family homes, on the hamlet's ground.
 for(const p of FUMOTO.plots){
  const {door,inward}=plotGate(p),household=householdAtHome(p.id);
  const title=householdTitle(household);
  const site={id:'home-'+p.id,title,jp:p.family,sub:'FUMOTO',color:0xd4c6ad,accent:'#776953',line:household?.address||p.id,
   door:[door[0],FUMOTO.y+.02,door[1]],exitPosition:[door[0],FUMOTO.y+.02,door[1]],entryFacing:inward,x:door[0],z:door[1],opens:'00:00',plot:p.id,
   familyHome:household||{members:[],toLet:true},houseKind:p.kind||'red-tile',ownRoom:true,
   homeId:p.id,isResidence:true,status:household?.status||'vacant',residents:[...(household?.residents||[])],
   directions:'Follow the Fumoto lane to '+(household?.address||p.id)+'. This house is vacant.'};
  options.sites.push(site);
  const anchor=new THREE.Object3D();anchor.name='fumoto entrance:'+p.id;anchor.position.set(door[0],1.3,door[1]);world.group.add(anchor);
  options.register?.(anchor,(household?.toLet?'Look round ':'Visit ')+title+' · '+site.line,()=>options.enter(site));
 }
 // The four existing flat doors have their own named map targets; the mailbox and plate identify each unit.
 // They remain exterior addresses, without promising an unauthored interior.
 for(const unit of KITAHAMA_FLATS){
  const household=householdAtHome(unit.id),[x,y,z]=unit.approachPosition;
  (world.landmarks??=[]).push({id:household.entranceSiteId,title:householdTitle(household),line:household.address,
   sub:'KITAHAMA HEIGHTS',homeId:unit.id,isResidence:true,status:household.status,residents:[...household.residents],
   x,y,z,door:[x,y,z],exitPosition:[x,y,z],approachPosition:[x,y,z],entrancePosition:[...unit.door],entryFacing:unit.approachFacing,entranceFacing:unit.inward,unitNumber:unit.unitNumber,
   directions:household.address+' · '+(unit.level?'take the outside stair at the south end':'ground-floor approach at its marked opening on Fukugi Lane')+'. The name is beside the door.'});
 }
 world.homes=homes;
}
