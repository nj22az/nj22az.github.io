import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {localToWorld} from './landmark-lots.js';

let exterior;
export const YURI_HOME_DOOR_LOCAL=[.077,1.276,3.374];

export async function preloadYuriHome(){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(assetURL('models/yuri-home/yuri-home-exterior.glb'),{signal:controller.signal});
  if(!response.ok)throw Error(response.status);
  exterior=(await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;
  return true;
 }catch(error){console.warn('Yuri home exterior unavailable',error);return false;}
 finally{clearTimeout(timeout);}
}

export function buildYuriHome(world,options,placement){
 const place=placement||{x:-6.91,z:11.6,yaw:Math.PI/2,scale:{x:.84,y:.92,z:.533}};
 const scale=place.scale??1,sx=scale.x??scale,sy=scale.y??scale,sz=scale.z??scale;
 const yaw=place.yaw??Math.PI/2;
 const [dx,dz]=localToWorld(place.x,place.z,yaw,scale,YURI_HOME_DOOR_LOCAL[0],YURI_HOME_DOOR_LOCAL[2]);
 const site=place.site||{id:'yuri-home',title:'Yuri’s room',jp:'ゆりの家',sub:'WILLOW ALLEY',
  color:0x9d7c7e,accent:'#a76680',line:'Shoes off at the door. The fern expects her back before midnight.'};
 site.door=[dx,0,dz];site.x=place.x;site.z=place.z;
 if(!place.skipSite)options.sites.push(site);
 const building=new THREE.Group();building.name=place.name||'Yuri canal house';
 building.position.set(place.x,0,place.z);building.rotation.y=yaw;building.scale.set(sx,sy,sz);
 world.group.add(building);
 if(exterior){
  const model=exterior.clone(true);model.userData.sharedAsset=true;model.name='Yuri house exterior';
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  building.add(model);
 }else{
  const fallback=new THREE.Mesh(new THREE.BoxGeometry(6,6.4,8),new THREE.MeshStandardMaterial({color:0xc9b89a,roughness:.9}));
  fallback.position.set(0,3.2,0);building.add(fallback);
 }
 hangNoren(building);
 if(place.label){
  const [lx,lz]=localToWorld(place.x,place.z,yaw,scale,0,3.02);
  place.label('ゆりの家','YURI · 22 WILLOW ALLEY',[lx,3.45*sy,lz],3.4*sx,.52*sy,yaw,'#f3e4d0','#6b3a48');
 }
 if(!place.skipSite){
  const [ex,ez]=localToWorld(place.x,place.z,yaw,scale,YURI_HOME_DOOR_LOCAL[0],YURI_HOME_DOOR_LOCAL[2]+.15);
  const entrance=new THREE.Object3D();entrance.name='Yuri house entrance';entrance.position.set(ex,1.2,ez);world.group.add(entrance);
  options.register(entrance,'Enter Yuri’s room',()=>options.enter(site));
 }
 return site;
}

function hangNoren(building){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#6b3a48';ctx.fillRect(0,0,256,320);
 ctx.fillStyle='#f3e4d0';ctx.fillRect(6,0,116,300);ctx.fillRect(134,0,116,300);
 ctx.fillStyle='#6b3a48';ctx.textAlign='center';ctx.font='700 56px sans-serif';
 ctx.fillText('ゆ',64,130);ctx.fillText('り',192,130);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const noren=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.55),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));
 noren.name='Yuri house noren';noren.position.set(.08,1.72,3.42);building.add(noren);
}
