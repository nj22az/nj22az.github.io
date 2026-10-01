import * as THREE from '../../vendor/three.module.js';
import {KITAHAMA,plotGate} from './kitahama-layout.js';
import {householdAtHome} from '../people/island-households.js';
import {householdFor} from '../people/households.js';

/**
 * The doors of the Kitahama houses (okinawa/layout.js KITAHAMA), as sites like every
 * door in town. The houses themselves are built with the Okinawan quarter (quarters.js).
 *
 * Thuan & Nao and Mrs Sato are walking residents: their houses are home sites with a
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
  const title=residents?residents.join(' & ')+'’s home':household?.toLet?'House to let':(household?.members.map(m=>m.name).join(' & ')||p.romaji)+'’s home';
  const site={id:residents?'resident-home-'+residents[0].toLowerCase().replace(/[^a-z]+/g,'-'):'home-'+p.id,title,jp:p.family,sub:'KITAHAMA',color:0xd4c6ad,accent:'#776953',
   line:household?.address||p.id,door:[door[0],.02,door[1]],exitPosition:[door[0],.02,door[1]],entryFacing:inward,x:door[0],z:door[1],opens:'00:00',plot:p.id};
  if(residents){
   Object.assign(site,{homeOwner:residents[0],homeOwners:[...residents],homeEntry:p.id});
   for(const name of residents)homes.set(name,{owner:name,household:householdFor(name)?.id,address:site.line,door:[...door],building:'kitahama',occupied:false});
  }else Object.assign(site,{familyHome:household||{members:[],toLet:true},ownRoom:true});
  options.sites.push(site);
  const anchor=new THREE.Object3D();anchor.name='kitahama entrance:'+p.id;anchor.position.set(door[0],1.3,door[1]);world.group.add(anchor);
  options.register?.(anchor,(household?.toLet?'Look round ':'Visit ')+title,()=>options.enter(site));
 }
 world.homes=homes;
}
