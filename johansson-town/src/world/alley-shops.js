import * as THREE from '../../vendor/three.module.js';
import {NIGHT_LANE} from './dining-layout.js';
import {ALLEY_UNITS,alleyBusinessLayout} from './business-layout.js';
import {buildShopDoor} from './shop-door.js';

// Reuse existing site identities: room contents, saves and workplace schedules
// continue to resolve by id. All positions are fixed before detail streaming.
export const ALLEY_SHOPS=Object.freeze(Object.fromEntries(Object.entries(ALLEY_UNITS).map(([id,units])=>[id,units[0]])));
export function alleyShopPlacement(id){
 return alleyBusinessLayout(id);
}
export function buildAlleyShop({parent,site,register,enter,label,shadows}){
 const p=alleyShopPlacement(site.id);if(!p)return null;
 const group=new THREE.Group();group.name='alley-shop:'+site.id;
 // Recess the new joinery into the solid footprint, clear of the narrow lane.
 group.position.set(p.x,NIGHT_LANE.y,p.z-(p.yaw===0?.40:-.40));group.rotation.y=p.yaw;parent.add(group);
 const door=buildShopDoor(group,{name:site.id+'-alley-door',width:1.0,shadows});
 const sign=new THREE.Vector3(0,2.94,.39);group.localToWorld(sign);
 label(site.jp,site.title.toUpperCase(),sign.toArray(),2.0,.43,p.yaw,'#e7dcc0','#3e463f',true);
 const entrance=new THREE.Object3D();entrance.name=site.id+'-alley-entrance';entrance.position.set(p.door[0],1.25,p.door[2]);parent.add(entrance);
 register?.(entrance,'Enter '+site.title,()=>enter(site));
 site.x=p.x;site.z=p.z;site.door=[...p.door];site.exitPosition=[...p.door];site.entryFacing=p.yaw;site.alleyBuilding=p.building;
 site.streetFrontage={position:[p.x,NIGHT_LANE.y,p.z],yaw:p.yaw};
 site.alleyUnits=[...p.units];
 return {id:site.id,lod:group,entrance,shutter:door.pane,source:'Japanese street at night',nearTriangles:0,farTriangles:0,update:door.update};
}
