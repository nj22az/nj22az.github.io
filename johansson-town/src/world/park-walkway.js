import * as THREE from '../../vendor/three.module.js';
import {applyCelShading} from '../render/cel.js';
import {lanternGlow} from '../render/dusk.js';
import {PARK_WALKWAY_RECTS,PARK_LAMP_PLACEMENTS} from './park-walkway-layout.js';

export const PARK_PAVING_Y=.075;
export const PARK_POOL_Y=.115;
export const PARK_POOL_RADIUS=4.4;

// Dense terrain sampling keeps the paving and light spill on the graded park slope.
// All rectangles share a single mesh; no model or texture downloads are required.
function surface(rects,heightAt,{pools=false}={}){
 const positions=[],colours=[],uv=[],indices=[];
 rects.forEach(([x0,x1,z0,z1],spot)=>{
  const nx=Math.ceil((x1-x0)/.28),nz=Math.ceil((z1-z0)/.28),base=positions.length/3;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
   const x=x0+(x1-x0)*i/nx,z=z0+(z1-z0)*j/nz;
   positions.push(x,heightAt(x,z)+(pools?PARK_POOL_Y:PARK_PAVING_Y),z);
   uv.push(x,z);
   if(pools){
    const [lx,lz]=PARK_LAMP_PLACEMENTS[spot];
    const falloff=Math.max(0,1-Math.hypot(x-lx,z-lz)/PARK_POOL_RADIUS);
    const light=falloff*falloff*(3-2*falloff);
    colours.push(light,light,light);
   }
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
   const a=base+j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;
   indices.push(a,c,b,b,c,d);
  }
 });
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 if(pools)geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
 geo.setIndex(indices);geo.computeVertexNormals();
 return geo;
}

export function buildParkWalkway({parent,colliders=[],heightAt=()=>0,shadows=false}={}){
 const height=(x,z)=>heightAt?.(x,z)??0;
 const group=new THREE.Group();group.name='Park lantern walkway';parent.add(group);
 // None of these meshes opt into static-prop merging. Section culling uses their
 // real geometry bounds, including the full extent of the instanced lamp posts.
 const paving=new THREE.Mesh(surface(PARK_WALKWAY_RECTS,height),new THREE.MeshStandardMaterial({
  color:0xb5aa91,roughness:1,emissive:0xffd29a,emissiveIntensity:0,
 }));
 paving.name='park-lantern-paving';paving.receiveShadow=!!shadows;group.add(paving);

 const metal=new THREE.MeshStandardMaterial({color:0x3b4945,roughness:.85,metalness:.15});
 const glass=new THREE.MeshStandardMaterial({color:0xf3ddb1,roughness:.65,emissive:0xffd29a,emissiveIntensity:0});
 const dummy=new THREE.Object3D();
 const parts=[
  {name:'bases',geo:new THREE.CylinderGeometry(.19,.23,.16,8),y:.08,mat:metal},
  {name:'posts',geo:new THREE.CylinderGeometry(.055,.085,2.5,8),y:1.38,mat:metal},
  {name:'sills',geo:new THREE.BoxGeometry(.48,.09,.48),y:2.66,mat:metal},
  {name:'glass',geo:new THREE.BoxGeometry(.34,.4,.34),y:2.9,mat:glass},
  {name:'roofs',geo:new THREE.ConeGeometry(.4,.22,4),y:3.21,mat:metal},
 ];
 let heads;
 for(const part of parts){
  const mesh=new THREE.InstancedMesh(part.geo,part.mat,PARK_LAMP_PLACEMENTS.length);
  mesh.name='park-lamp-'+part.name;mesh.castShadow=!!shadows&&part.name!=='glass';mesh.receiveShadow=!!shadows;
  PARK_LAMP_PLACEMENTS.forEach(([x,z],i)=>{
   dummy.position.set(x,height(x,z),z);dummy.position.y+=part.y;
   dummy.rotation.y=part.name==='roofs'?Math.PI/4:0;
   dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  });
  group.add(mesh);if(part.name==='glass')heads=mesh;
 }
 for(const [x,z] of PARK_LAMP_PLACEMENTS)colliders.push({id:'park-lamp-post',x,z,w:.46,d:.46,height:height(x,z)+3.32});

 // Ground-only light spill preserves the cel ramp and the existing light budget.
 // Black outer vertices add no colour. Depth testing hides spill under pond/props.
 const r=PARK_POOL_RADIUS;
 const pools=new THREE.Mesh(surface(PARK_LAMP_PLACEMENTS.map(([x,z])=>[x-r,Math.min(x+r,33.1),z-r,z+r]),height,{pools:true}),
  new THREE.MeshBasicMaterial({color:0xffd29a,vertexColors:true,transparent:true,
   blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,opacity:0}));
 pools.name='park-lamp-ground-light';pools.renderOrder=1;group.add(pools);
 applyCelShading(group);
 function update(minutes=1002){
  const glow=lanternGlow(minutes);
  heads.material.emissiveIntensity=glow*1.15;
  // A small reflected-light floor keeps the path continuous between lamp pools.
  paving.material.emissiveIntensity=glow*.10;
  pools.material.opacity=glow*.32;pools.visible=glow>0;
 }
 update();
 return {group,paving,heads,pools,update,count:PARK_LAMP_PLACEMENTS.length};
}
