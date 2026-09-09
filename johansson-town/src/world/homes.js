import {buildJapaneseHome,finishJapaneseHomes} from './japanese-town.js';
import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {RESIDENTS} from '../people/residents.js';
import {YURI_HOME_DOOR} from '../people/social.js';

// Small timber-and-plaster homes infill the existing lanes. Shared wall batches,
// a single nameplate atlas and instanced windows avoid a light/draw per resident.
export function buildHomes(world,options,box){
 const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=1024;
 const ctx=atlas.getContext('2d');ctx.fillStyle='#e6dbc1';ctx.fillRect(0,0,1024,1024);
 const plates=[],dummy=new THREE.Object3D(),homes=new Map();
 const windows=new THREE.InstancedMesh(new THREE.PlaneGeometry(.78,.84),new THREE.MeshBasicMaterial({color:0xffffff}),RESIDENTS.length);
 windows.name='resident-home-windows';world.group.add(windows);
 for(const [i,p] of RESIDENTS.entries()){
  const {x,z,angle}=p.house,cos=Math.cos(angle),sin=Math.sin(angle);
  const position=(lx,y,lz)=>[x+lx*cos+lz*sin,y,z-lx*sin+lz*cos];
  const part=(size,pos,kind,colour,tilt=0)=>box(size,position(...pos),kind,colour,[0,angle,tilt]);
  const upgraded=buildJapaneseHome(world.group,p.house,i,options);
  if(!upgraded){
  part([3.12,2.85,3.5],[0,1.425,0],'plaster',[0xbfb59c,0xa5afa1,0xc4b29f][i%3]);
  part([3.22,.22,3.6],[0,.11,0],'concrete',0x8b9086);
  for(const side of [-1,1]){
   part([.12,2.85,.12],[side*1.48,1.45,1.79],'timber',0x665640);
   part([1.85,.16,3.85],[side*.83,3.04,0],'roof',0x626e69,-side*.25);
  }
  part([.12,.18,3.85],[0,3.28,0],'roof',0x626e69);
  }
  part([.88,2.15,.09],[0,1.18,1.79],'timber',0x665640);
  for(const dx of [-.3,-.1,.1,.3])part([.035,1.78,.035],[dx,1.24,1.86],'bamboo',0xa49879);
  part([.07,.13,.05],[.3,1.15,1.88],'roof',0x303d39);
  part([.88,.95,.08],[-.99,1.68,1.8],'timber',0x665640);
  part([.38,.3,.16],[1.03,1.1,1.83],'roof',0x626e69);
  part([.26,.025,.04],[1.03,1.18,1.93],'timber',0x303d39);
  const sideways=Math.abs(sin)>.5;
  world.colliders.push({x,z,w:sideways?3.5:3.12,d:sideways?3.12:3.5,height:upgraded?6:3.3,home:p.name});
  const col=i%4,row=Math.floor(i/4);ctx.fillStyle='#e6dbc1';ctx.fillRect(col*256,row*128,256,128);
  ctx.fillStyle='#344b45';ctx.textAlign='center';ctx.font='bold 24px sans-serif';ctx.fillText(p.name,col*256+128,row*128+49,240);ctx.font='19px sans-serif';ctx.fillText(p.homeAddress,col*256+128,row*128+86,240);
  const geo=new THREE.PlaneGeometry(.92,.46),uv=geo.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setXY(n,(col+uv.getX(n))/4,1-(row+1-uv.getY(n))/8);
  dummy.position.set(...position(.99,2,1.81));dummy.rotation.set(0,angle,0);dummy.scale.set(1,1,1);dummy.updateMatrix();geo.applyMatrix4(dummy.matrix);plates.push(geo);
  dummy.position.set(...position(-.99,1.68,1.855));dummy.updateMatrix();windows.setMatrixAt(i,dummy.matrix);windows.setColorAt(i,new THREE.Color(0x354841));
  const anchor=new THREE.Object3D();anchor.position.set(p.home[0],1.3,p.home[1]);world.group.add(anchor);
  const home={owner:p.name,address:p.homeAddress,door:p.home,occupied:false};homes.set(p.name,home);
  if(p.name==='Yuri'){
   let site=options.sites.find(s=>s.id==='yuri-home');
   if(!site){site={id:'yuri-home',title:'Yuri’s room',jp:'ゆりの部屋',sub:'WILLOW ALLEY',color:0x9d7c7e,accent:'#a76680',line:'Shoes off at the door. The fern expects her back before midnight.'};options.sites.push(site);}
   site.door=[p.home[0],0,p.home[1]];site.exitPosition=[...site.door];site.entryFacing=Math.atan2(-Math.sin(p.house.angle),-Math.cos(p.house.angle));site.x=p.house.x;site.z=p.house.z;
   YURI_HOME_DOOR.splice(0,2,...p.home);
   options.register(anchor,'Enter Yuri’s room',()=>options.enter(site));
  }else options.register(anchor,'Read '+p.name+'’s nameplate',()=>options.onAction('read',p.homeAddress,p.name+' lives here. '+(home.occupied?'The door is closed; someone is at home.':'The resident is out in town.')));
 }
 finishJapaneseHomes(world.group);
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;
 const nameplates=new THREE.Mesh(mergeGeometries(plates,false),new THREE.MeshStandardMaterial({map:texture,roughness:.9}));nameplates.name='resident-home-nameplates';world.group.add(nameplates);plates.forEach(g=>g.dispose());
 world.homes=homes;
 let previous='';
 world.updateHomes=minutes=>{
  const m=((minutes%1440)+1440)%1440,night=m>=1080||m<420;
  const key=Number(night)+':'+RESIDENTS.map(p=>Number(homes.get(p.name).occupied)).join('');if(key===previous)return;previous=key;
  RESIDENTS.forEach((p,i)=>windows.setColorAt(i,new THREE.Color(night&&homes.get(p.name).occupied?0xd6aa6b:0x354841)));windows.instanceColor.needsUpdate=true;
 };
 return homes;
}
