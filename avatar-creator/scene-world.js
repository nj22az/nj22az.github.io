import * as THREE from '../johansson-town/vendor/three.module.js';
import {createTown} from '../johansson-town/src/world/town.js';
import {createIslandBusinesses} from '../johansson-town/src/world/businesses.js';
import {groundHeight,routeAt,planHeight} from '../johansson-town/src/world/layout.js';
import {suppliedRoomBoundsBlocked} from '../johansson-town/src/world/supplied-rooms.js';
import {createTownSky} from '../johansson-town/src/render/sky.js';
import {createCelPass} from '../johansson-town/src/render/cel.js';
import {createWalkSurface} from '../johansson-town/src/world/walk-surface.js';
import {hitsSolid,walkTo} from './scene-physics.mjs';
const interiors=new Set(['sakura','minato','sato-ramen','books','onsen','town-hall']);
const noop=()=>{};
export async function buildSceneWorld(id,views,townData=null){
 const inside=interiors.has(id);
 const scene=!inside&&townData?townData.scene:new THREE.Scene(),room=new THREE.Group();scene.background=new THREE.Color(inside?0xe8e4d8:0xb4dce8);if(inside)scene.add(room);
 const solids=[],reg=(o,label)=>{o.userData.studioLabel=label;};
 const collider=(x,z,w,d,height,minY)=>solids.push({x,z,w,d,height,minY});
 const options={room,reg,collider,action:noop,exit:noop};let api,layout,world;
 if(!inside){world=townData?.world||createTown({scene,sites:createIslandBusinesses(),mobile:true,shadows:true,maxAnisotropy:2,register:reg,enter:noop,onAction:noop,getPlayerPosition:()=>new THREE.Vector3()});solids.push(...world.colliders);for(const p of world.people||[])if(p.g)p.g.visible=false;}
 else if(id==='sakura'){const m=await import('../johansson-town/src/world/interiors/sakura-interior.js');api=m.buildSakuraInterior(options);await api.ready();layout=api.layout;solids.push(...(layout.colliders||[]));}
 else if(id==='minato'||id==='sato-ramen'){
  const m=await import('../johansson-town/src/world/izakaya.js?snappy=1');await m.preloadIzakaya(['interior']);if(!m.izakayaReady('interior'))throw Error('Dining room model unavailable');
  const box=(size,pos,color,parent=room)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));mesh.position.set(...pos);parent.add(mesh);return mesh;};
  const signTexture=(a,b)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#eee4cb';ctx.fillRect(0,0,512,128);ctx.fillStyle='#243442';ctx.font='28px sans-serif';ctx.fillText(a,20,45);ctx.fillText(b||'',20,95);return new THREE.CanvasTexture(c);};
  api=id==='minato'?m.buildIzakayaRoom({...options,box,signTexture}):(await import('../johansson-town/src/world/interiors/sato-ramen.js')).buildSatoRamenRoom(options);layout=api.layout||api;if(id==='sato-ramen'){const shared=await import('../johansson-town/src/world/interiors/shared-dining-layout.js');solids.push(...shared.SHARED_DINING_COLLIDERS);layout={...layout,bounds:shared.SHARED_DINING_BOUNDS,floorPolygon:shared.SHARED_DINING_FLOOR};}
 }else if(id==='books'){api=(await import('../johansson-town/src/world/interiors/compact-shops.js')).buildCompactShop({...options,site:createIslandBusinesses().find(s=>s.id==='frontrow')});layout=api;}
 else if(id==='onsen'){api=(await import('../johansson-town/src/world/interiors/onsen.js')).buildOnsenInterior(options);layout=api;solids.push(...(api.colliders||[]));}
 else{api=(await import('../johansson-town/src/world/interiors/town-hall.js')).buildMayorOffice(options);layout=api;}
 for(const actor of api?.owned||[])if(['barfly','Jonsson'].includes(actor.holder?.name))actor.holder.visible=false;
 const preset=views[id].wide,spots=[...preset.spots.stand];
 if(!spots.length){const p=new THREE.Vector3().fromArray(preset.camera.position),f=new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion().fromArray(preset.camera.quaternion));for(let d=3;d<10;d+=.6)for(let side=-2;side<=2;side+=.5){const x=p.x+f.x*d+f.z*side,z=p.z+f.z*d-f.x*side;spots.push([x,groundHeight(x,z),z,.5,.78]);}}
 const candidates=[...spots].sort((a,b)=>(a[3]-.5)**2+(a[4]-.78)**2-((b[3]-.5)**2+(b[4]-.78)**2));
 let walk;const base=(x,z)=>inside?(preset.floor||0):planHeight(x,z);
 const floor=(x,z)=>walk?.level(x,z)??(base(x,z)+(walk?.lift(x,z)||0));
 const blocked=(x,z,r=.23)=>!Number.isFinite(floor(x,z))||(!inside&&!routeAt(x,z,r))||(inside&&suppliedRoomBoundsBlocked(layout,x,z,r))||hitsSolid(x,z,r,solids,floor(x,z));
 const origin=candidates.find(p=>!blocked(p[0],p[2]))||candidates[0];
 if(!origin)throw Error('No standing area for this location');
 for(const d of world?.details||[])if(Math.hypot(d.x-origin[0],d.z-origin[2])<Math.min(d.radius||20,25)){try{if(!d.studioLoaded){await d.load();d.studioLoaded=true;}}catch(e){console.warn('Optional scene detail',e);}}
 walk=createWalkSurface({minX:origin[0]-12,maxX:origin[0]+12,minZ:origin[2]-12,maxZ:origin[2]+12,base});walk.add(scene);
 const seats=[];scene.traverse(o=>{const s=o.userData.seat;if(s?.position&&!s.soak&&!s.wash)seats.push({...s,id:'seat-'+seats.length,label:o.userData.studioLabel||'Seat '+(seats.length+1)});});
 if(inside||!townData)scene.add(new THREE.HemisphereLight(0xfff5e5,0x80949c,2));
 const sun=townData&&!inside?townData.sun:new THREE.DirectionalLight(0xfff3de,2.4);sun.position.set(origin[0]+5,10,origin[2]+6);sun.target.position.set(origin[0],0,origin[2]);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:40});sun.shadow.bias=-.0005;if(inside||!townData)scene.add(sun,sun.target);
 // Keep the photograph's location while letting the author move its camera.
 const camera=new THREE.PerspectiveCamera(55,4/3,.05,250);camera.position.fromArray(preset.camera.position);camera.quaternion.fromArray(preset.camera.quaternion);camera.updateMatrixWorld(true);
 const sky=inside?null:(townData?.sky||createTownSky(scene)),cel=createCelPass({tint:0xffffff});cel.apply(scene);
 let lamps=0;scene.traverse(o=>{if(o.isPointLight&&++lamps>4)o.visible=false;});
 const meshes=[];scene.traverse(o=>{if(o.isMesh){let p=o,actor=false;while(p){if(p.userData.studioActor)actor=true;p=p.parent;}if(!actor)meshes.push(o);}});scene.updateMatrixWorld(true);
 return {scene,camera,origin,seats,floor,blocked,meshes,sky,townData:inside?null:{scene,world,sun,sky},
  settle(actors){const occupied=[];for(const a of actors){let p=this.place(a);if(!a.seat&&(blocked(p.x,p.z,.23*a.size)||occupied.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<.23*(q.size+a.size)))){const choices=[...candidates];for(let dx=-2;dx<=2;dx+=.6)for(let dz=-2;dz<=2;dz+=.6)choices.push([origin[0]+dx,0,origin[2]+dz]);const free=choices.find(q=>!blocked(q[0],q[2],.23*a.size)&&!occupied.some(o=>Math.hypot(o.x-q[0],o.z-q[2])<.23*(o.size+a.size)));if(free){a.x=free[0]-origin[0];a.z=free[2]-origin[2];p=this.place(a);}}occupied.push({...p,size:a.size});}},
  place(actor){if(actor.seat){const s=seats.find(s=>s.id===actor.seat);if(s)return {x:s.position[0],y:s.position[1],z:s.position[2],seat:s};actor.seat='';}
   let x=origin[0]+actor.x,z=origin[2]+actor.z;
   if(blocked(x,z,.23*actor.size)){const p=candidates.find(p=>!blocked(p[0],p[2],.23*actor.size));if(p){x=p[0];z=p[2];actor.x=x-origin[0];actor.z=z-origin[2];}}
   return {x,y:floor(x,z),z};},
  move(actor,x,z,actors){if(actor.seat){const seat=seats.find(s=>s.id===actor.seat);if(seat?.stand){actor.x=seat.stand[0]-origin[0];actor.z=seat.stand[2]-origin[2];}actor.seat='';actor.pose='Idle';}const p=this.place(actor),r=.23*actor.size;const result=walkTo({x:p.x,z:p.z},{x,z},(x,z)=>Math.abs(floor(x,z)-p.y)>.4||blocked(x,z,r)||actors.some(a=>a.id!==actor.id&&Math.hypot(x-this.place(a).x,z-this.place(a).z)<r+.23*a.size));actor.seat='';actor.x=result.x-origin[0];actor.z=result.z-origin[2];return Math.hypot(result.x-x,result.z-z)<.1;},
  dispose(){api?.dispose?.();api?.television?.dispose?.();api?.tv?.dispose?.();}
 };
}
