import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {RESIDENTS} from '../people/residents.js';
import {YURI_HOME_DOOR} from '../people/social.js';
import {groundHeight} from './layout.js?snappy=1';
import {RESIDENTIAL_ENTRIES} from './residential-layout.js';
import {buildResidentialStreet} from './residential-street.js';

// Home gameplay belongs to the authored thresholds, independent of model loading.
// No old house kit, procedural doors or gardens are overlaid on the supplied street.
export function buildHomes(world,options){
 buildResidentialStreet(world,options);
 const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;
 const ctx=atlas.getContext('2d'),plates=[],dummy=new THREE.Object3D(),homes=new Map(),slots=new Map();
 ctx.fillStyle='#e6dbc1';ctx.fillRect(0,0,1024,512);
 for(const [i,p] of RESIDENTS.entries()){
  const entry=RESIDENTIAL_ENTRIES[p.homeEntry],slot=slots.get(p.homeEntry)||0;slots.set(p.homeEntry,slot+1);
  const col=i%4,row=Math.floor(i/4);ctx.fillStyle='#344b45';ctx.textAlign='center';ctx.font='bold 25px sans-serif';ctx.fillText(p.name,col*256+128,row*128+49,240);ctx.font='19px sans-serif';ctx.fillText(p.homeAddress,col*256+128,row*128+86,240);
  const geometry=new THREE.PlaneGeometry(.58,.25),uv=geometry.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setXY(n,(col+uv.getX(n))/4,1-(row+1-uv.getY(n))/4);
  dummy.position.set(entry.facade[0]+Math.sin(entry.angle)*.045,1.55+slot*.29,entry.facade[1]+.62);dummy.rotation.set(0,entry.angle,0);dummy.updateMatrix();geometry.applyMatrix4(dummy.matrix);plates.push(geometry);
  const home={owner:p.name,address:p.homeAddress,door:p.home,building:entry.buildingId,occupied:false};homes.set(p.name,home);
  const anchor=new THREE.Object3D();anchor.name='home entrance:'+p.name;anchor.position.set(p.home[0],groundHeight(...p.home)+1.3,p.home[1]);world.group.add(anchor);
  if(p.name==='Yuri'){
   let site=options.sites.find(s=>s.id==='yuri-home');
   if(!site){site={id:'yuri-home',title:'Yuri’s room',jp:'ゆりの部屋',sub:'WILLOW ALLEY',color:0x9d7c7e,accent:'#a76680',line:'Shoes off at the door. The fern expects her back before midnight.'};options.sites.push(site);}
   site.door=[p.home[0],groundHeight(...p.home),p.home[1]];site.exitPosition=[...site.door];site.entryFacing=Math.atan2(-Math.sin(entry.angle),-Math.cos(entry.angle));site.x=p.house.x;site.z=p.house.z;
   YURI_HOME_DOOR.splice(0,2,...p.home);options.register(anchor,'Enter Yuri’s room',()=>options.enter(site));
  }else options.register(anchor,'Read '+p.name+'’s nameplate',()=>options.onAction('read',p.homeAddress,p.name+' lives here. '+(home.occupied?'The door is closed; someone is at home.':'The resident is out in town.')));
 }
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.9,emissiveMap:texture,emissive:0xffdcac,emissiveIntensity:.02});
 const nameplates=new THREE.Mesh(mergeGeometries(plates,false),material);nameplates.name='resident-home-nameplates';world.group.add(nameplates);plates.forEach(g=>g.dispose());
 world.homes=homes;world.updateHomes=minutes=>{const m=((minutes%1440)+1440)%1440;material.emissiveIntensity=m>=1080||m<420?.3:.02;nameplates.visible=world.residential.ready;};
 nameplates.visible=world.residential.ready;
 return homes;
}
