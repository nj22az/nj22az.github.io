import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
const assets=new Map();
export async function preloadIzakaya(){
 const loader=new GLTFLoader();await Promise.allSettled(['exterior','interior'].map(async kind=>{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(assetURL('models/izakaya/minato-'+kind+'.glb'),{signal:controller.signal});if(!response.ok)throw Error(response.status);assets.set(kind,(await loader.parseAsync(await response.arrayBuffer(),'')).scene);}catch(e){console.warn('Izakaya asset unavailable',kind,e);}finally{clearTimeout(timeout);}
 }));return {ready:assets.size,total:2};
}
function asset(kind,parent){
 const source=assets.get(kind);if(!source)return false;
 const model=source.clone(true);model.userData.sharedAsset=true;model.name='Minato '+kind;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});parent.add(model);return true;
}
export function buildIzakaya(world,options){
 const site={id:'izakaya',title:'Minato Izakaya',jp:'居酒屋 みなと',sub:'SUPPER & STORIES',color:0xc98a65,accent:'#b55049',line:'Nao’s place · small plates, old friends and new stories · 16:00–23:30',door:[24,0,20],opens:'16:00'};
 options.sites.push(site);const exterior=new THREE.Group();exterior.position.set(24,0,25);exterior.rotation.y=Math.PI;world.group.add(exterior);
 if(!asset('exterior',exterior)){
  const fallback=new THREE.Mesh(new THREE.BoxGeometry(8,4,8),new THREE.MeshStandardMaterial({color:0x965332}));fallback.position.y=2;exterior.add(fallback);
 }
 // Warm readable bilingual sign remains a runtime canvas so it does not require font textures in GLB.
 const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#36241e';ctx.fillRect(0,0,768,192);ctx.textAlign='center';ctx.fillStyle='#ffe4af';ctx.font='bold 70px serif';ctx.fillText('居酒屋 みなと',384,88);ctx.font='26px sans-serif';ctx.fillText('MINATO · SUPPER & STORIES',384,146);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.68),new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.3}));sign.position.set(0,3.35,4.3);exterior.add(sign);
 const entrance=new THREE.Object3D();entrance.position.set(24,1.2,20);world.group.add(entrance);options.register(entrance,'Come into Minato Izakaya',()=>options.enter(site));
 world.colliders.push({x:24,z:29,w:8,d:.3,height:5},{x:20,z:25,w:.3,d:8,height:5},{x:28,z:25,w:.3,d:8,height:5});
 return site;
}
export function buildIzakayaRoom({room,box,reg,collider,action,exit,signTexture}){
 if(!asset('interior',room)){
  box([13,.2,13],[0,-.1,0],0x965332,room,false);box([13,3.8,.2],[0,1.9,-6.4],0xe8c894,room,false);box([8,1,1],[-.8,.5,-2.6],0x965332,room,false);
 }
 const anchor=(position,label,fn)=>{const o=new THREE.Object3D();o.position.set(...position);room.add(o);reg(o,label,fn,true);return o;};
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.1,.68),new THREE.MeshStandardMaterial({map:signTexture('おかえりなさい','WELCOME BACK · MINATO','#b55049')}));sign.position.set(.5,3.1,-6.05);room.add(sign);
 collider(-.8,-2.6,8.3,1.15,1.15);collider(-1,-5.9,7.1,.6,2.7);collider(4.65,-4.7,2.2,1.0,1.3);
 for(const [x,z] of [[-3.5,2.2],[2.6,2]]){collider(x,z,2.5,1.35,1);for(const dz of [-1.08,1.08])collider(x,z+dz,2.5,.50,.6);}
 anchor([0,1,5.5],'Step outside',exit);
 anchor([3.55,1.15,-2.05],'Order something delicious',()=>action('izakaya-menu'));
 anchor([0,1,0],'Listen to the table',()=>action('izakaya-gossip'));
 anchor([4.0,1,2.7],'Sit and enjoy the evening',()=>action('seat','Minato window seat','A warm table, a little conversation, and nowhere to hurry.'));
 anchor([4.5,1.8,-5.5],'Choose the evening music',()=>action('radio','Minato radio','Nao turns it down when a good story begins.'));
 return {name:'Minato',cutaway:true};
}
