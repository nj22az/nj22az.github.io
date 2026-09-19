import {HOUSEHOLDS} from '../people/households.js';
import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {RESIDENTS} from '../people/residents.js';
import {THUAN_HOME_DOOR} from '../people/social.js';
import {RESIDENTIAL_ENTRIES} from './residential-layout.js';
import {buildResidentialStreet} from './residential-street.js';
import {windowGlow} from '../render/dusk.js';

// Home gameplay belongs to the authored thresholds, independent of model loading.
// No old house kit, procedural doors or gardens are overlaid on the supplied street.
export function buildHomes(world,options){
 buildResidentialStreet(world,options);
 const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;
 const ctx=atlas.getContext('2d'),plates=[],dummy=new THREE.Object3D(),homes=new Map();
 ctx.fillStyle='#e6dbc1';ctx.fillRect(0,0,1024,512);
 for(const household of HOUSEHOLDS){
  const entry=RESIDENTIAL_ENTRIES[household.entry],profile=RESIDENTS.find(p=>p.name===household.residents[0]);
  let site=options.sites.find(s=>s.id===household.id);
  if(!site){site={id:household.id,jp:'住まい',sub:'MAIN STREET',color:0xd4c6ad,accent:'#776953'};options.sites.push(site);}
  Object.assign(site,{title:household.title,line:household.address,homeOwner:household.residents[0],homeOwners:[...household.residents],homeEntry:household.entry,door:[profile.home[0],.02,profile.home[1]],entryFacing:entry.angle,x:entry.facade[0]-.3,z:entry.door[1]});site.exitPosition=[...site.door];
  for(const name of household.residents)homes.set(name,{owner:name,household:household.id,address:household.address,door:profile.home,building:entry.buildingId,occupied:false});
 }
 THUAN_HOME_DOOR.splice(0,2,...RESIDENTS.find(p=>p.name==='Thuan').home);
 for(const [i,[key,entry]] of Object.entries(RESIDENTIAL_ENTRIES).entries()){
  const households=HOUSEHOLDS.filter(h=>h.entry===key),col=i%4,row=Math.floor(i/4);
  ctx.fillStyle='#344b45';ctx.textAlign='center';ctx.font='bold 23px sans-serif';ctx.fillText('MAIN STREET · '+(i+1),col*256+128,row*128+28,240);
  households.forEach((h,j)=>{ctx.font='21px sans-serif';ctx.fillText(h.residents.join(' & '),col*256+128,row*128+60+j*28,240);});
  const geometry=new THREE.PlaneGeometry(.55,.28),uv=geometry.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setXY(n,(col+uv.getX(n))/4,1-(row+1-uv.getY(n))/4);
  dummy.position.set(entry.plate[0],1.48,entry.plate[1]);dummy.rotation.set(0,entry.angle,0);dummy.updateMatrix();geometry.applyMatrix4(dummy.matrix);plates.push(geometry);
  const anchor=new THREE.Object3D();anchor.name='home entrance:'+key;anchor.position.set(entry.door[0],1.3,entry.door[1]);world.group.add(anchor);
  options.register(anchor,'Visit homes',()=>{
   const flats=households.map(h=>options.sites.find(s=>s.id===h.id));
   if(flats.length===1)options.enter(flats[0]);
   else options.onAction('visit-home',(i+1)+' Main Street',flats.map(site=>({name:site.title+' · '+site.line,enter:()=>options.enter(site)})));
  });
 }
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.9,emissiveMap:texture,emissive:0xffdcac,emissiveIntensity:.02});
 const nameplates=new THREE.Mesh(mergeGeometries(plates,false),material);nameplates.name='resident-home-nameplates';world.group.add(nameplates);plates.forEach(g=>g.dispose());
 world.homes=homes;world.updateHomes=minutes=>{nameplates.material.emissiveIntensity=.02+windowGlow(minutes)*.28;nameplates.visible=world.residential.ready;};
 nameplates.visible=world.residential.ready;
 return homes;
}
