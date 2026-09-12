import {homeSiteId} from '../people/home-life.js';
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
  dummy.position.set(entry.plate[0]+Math.sin(entry.angle)*.045,1.55+slot*.29,entry.plate[1]+Math.cos(entry.angle)*.045);dummy.rotation.set(0,entry.angle,0);dummy.updateMatrix();geometry.applyMatrix4(dummy.matrix);plates.push(geometry);
  const home={owner:p.name,address:p.homeAddress,door:p.home,building:entry.buildingId,occupied:false};homes.set(p.name,home);
  const anchor=new THREE.Object3D();anchor.name='home entrance:'+p.name;anchor.position.set(p.home[0],groundHeight(...p.home)+1.3,p.home[1]);world.group.add(anchor);
  let site=options.sites.find(s=>s.id===homeSiteId(p.name));
  if(!site){site={id:homeSiteId(p.name),title:p.name+'’s home',jp:'住まい',sub:'WILLOW ALLEY',color:0xd4c6ad,accent:'#776953',line:p.homeAddress};options.sites.push(site);}
  site.homeOwner=p.name;site.door=[p.home[0],groundHeight(...p.home),p.home[1]];site.exitPosition=[...site.door];site.entryFacing=entry.angle;site.x=p.house.x;site.z=p.house.z;
  if(p.name==='Yuri')YURI_HOME_DOOR.splice(0,2,...p.home);
  // Shared street entrances open a choice of apartments, never overlapping hit targets.
  if(slot===0)options.register(anchor,'Visit homes',()=>{
   const neighbours=RESIDENTS.filter(n=>n.homeEntry===p.homeEntry).map(n=>options.sites.find(s=>s.id===homeSiteId(n.name)));
   if(neighbours.length===1)options.enter(neighbours[0]);
   else options.onAction('visit-home','Willow Alley',neighbours.map(site=>({name:site.title,enter:()=>options.enter(site)})));
  });
 }
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.9,emissiveMap:texture,emissive:0xffdcac,emissiveIntensity:.02});
 const nameplates=new THREE.Mesh(mergeGeometries(plates,false),material);nameplates.name='resident-home-nameplates';world.group.add(nameplates);plates.forEach(g=>g.dispose());
 world.homes=homes;world.updateHomes=minutes=>{const m=((minutes%1440)+1440)%1440;material.emissiveIntensity=m>=1080||m<420?.3:.02;nameplates.visible=world.residential.ready;};
 nameplates.visible=world.residential.ready;
 return homes;
}
