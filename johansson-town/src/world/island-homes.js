import * as THREE from '../../vendor/three.module.js';
import {KITAHAMA,KITAHAMA_FLATS,plotGate} from './kitahama-layout.js';

import {householdAtHome,householdTitle} from '../people/island-households.js';
import {HOUSEBOAT} from './fujita-houseboat.js';
import {NISHI,EAST_ROW} from './okinawa/layout.js';
import {NAKAMURA_HOME_DOOR} from './nakamura-plan.js';
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
  }else Object.assign(site,{homeOwner:household.residents[0],homeOwners:[...household.residents],familyHome:household||{members:[],toLet:true},houseKind:p.kind||'concrete',ownRoom:true});
  options.sites.push(site);
  const anchor=new THREE.Object3D();anchor.name='kitahama entrance:'+p.id;anchor.position.set(door[0],1.3,door[1]);world.group.add(anchor);
  options.register?.(anchor,(household?.toLet?'Look round ':'Visit ')+title+' · '+site.line,()=>options.enter(site));
 }
 // Every occupied unit has an Enter action, its own room and its own exit height.
 for(const unit of KITAHAMA_FLATS){
  const h=householdAtHome(unit.id),[x,y,z]=unit.approachPosition;
  addHome(h,[x,y,z],{entrancePosition:[...unit.door],entryFacing:unit.approachFacing,unitNumber:unit.unitNumber});
 }
 for(const p of NISHI.plots.filter(p=>['higa','kinjo','oshiro'].includes(p.id))){
  const {door,inward}=plotGate(p);addHome(householdAtHome(p.id),[door[0],.04,door[1]],{entryFacing:inward,houseKind:p.kind});
 }
 // Separate residential entrances: customers never cross a private sleeping room.
 addHome(householdAtHome('nakamura'),[...NAKAMURA_HOME_DOOR],{upperHome:true,entryFacing:Math.PI/2});
 const post=EAST_ROW.plots.find(p=>p.id==='shimabukuro');
 addHome(householdAtHome('shimabukuro'),[EAST_ROW.maxX+.75,.04,(post.minZ+post.maxZ)/2],{upperHome:true,entryFacing:Math.PI/2,doorPanel:true,panelPosition:[EAST_ROW.maxX+.04,1.065,(post.minZ+post.maxZ)/2]});
 addHome(householdAtHome('clinic'),[37.7,.04,35.1],{entrancePosition:[37.7,.15,36.4],entryFacing:Math.PI});
 addHome(householdAtHome('izakaya'),[-17.65,.04,-9.0],{doorPanel:true,panelPosition:[-17.14,1.065,-9]});
 function addHome(h,door,extra={}){
  const id=h.home==='clinic'?'home-clinic':h.home==='izakaya'?'home-izakaya':h.entranceSiteId;
  const site={id,title:householdTitle(h),sub:'PRIVATE HOME',homeId:h.home,isResidence:true,status:h.status,
   residents:[...h.residents],homeOwner:h.residents[0],homeOwners:[...h.residents],familyHome:h,houseKind:'concrete',ownRoom:true,
   door,exitPosition:[...door],approachPosition:[...door],x:door[0],z:door[2],opens:'00:00',line:h.address,...extra};
  options.sites.push(site);(world.landmarks??=[]).push(site);
  const anchor=new THREE.Object3D();anchor.name='occupied home entrance:'+h.home;anchor.position.set(door[0],door[1]+1.1,door[2]);world.group.add(anchor);
  options.register?.(anchor,'Visit '+site.title,()=>options.enter(site));
  for(const name of h.residents)homes.set(name,{owner:name,address:h.address,door:[door[0],door[2]],building:h.home,occupied:false});
  if(extra.doorPanel){
   const panel=new THREE.Mesh(new THREE.BoxGeometry(.08,2.05,.92),new THREE.MeshStandardMaterial({color:0x665243,roughness:.85}));
   panel.name='Private residential door:'+h.home;panel.position.set(...(extra.panelPosition||[door[0]+.4,door[1]+1.025,door[2]]));world.group.add(panel);
  }
 }
 (world.landmarks??=[]).push({id:'fujita-houseboat',title:'Shiosai · Mr Fujita’s home',homeId:'fujita-houseboat',isResidence:true,residents:['Mr Fujita'],x:HOUSEBOAT.gangway.maxX+.35,z:(HOUSEBOAT.gangway.minZ+HOUSEBOAT.gangway.maxZ)/2,openDwelling:true});
 world.homes=homes;
}
