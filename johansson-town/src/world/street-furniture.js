import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD,SHOP_CROSSING_Z} from './main-road.js';

/**
 * The town's standard street furniture, one design each, used wherever it is needed:
 *
 *  - chain bollards: white posts with a sagging steel chain between them, along the top
 *    of the sea wall, so the edge of the green reads as a promenade with a rail rather
 *    than a lawn that simply stops;
 *  - brick planters: round, with a band of mortar courses and a mound of flowers, at the
 *    corners of the Main Street crossings.
 *
 * Each is a handful of shared geometries and materials and, for the chain links, one
 * instanced mesh, so a whole run costs a few draw calls. Everything stands on the
 * ground the town reports, and everything solid gets a collider.
 */

/** Sea-wall runs as [x0,z0,x1,z1], on the lawn just inside the wall; gaps are the beach steps. */
export const CHAIN_RUNS=Object.freeze([
 [32.75,-37.4,32.75,-12.2],
 [32.75,-7.8,32.75,20.2],
 [19.2,-37.55,32.2,-37.55],
]);
/** Planters at the corners of the crossings, on the east footway. */
export const PLANTERS=Object.freeze([
 // Near the kerb, so the walking line along the shopfronts (the postman's round) stays clear.
 [MAIN_ROAD.east+1.25,SHOP_CROSSING_Z+2.55],[MAIN_ROAD.east+1.25,SHOP_CROSSING_Z-2.55],
]);

const POST_SPACING=2.4;

function brickTexture(){
 if(typeof document==='undefined'||!document.createElement)return null;
 const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');if(!ctx)return null;
 ctx.fillStyle='#e9d9c4';ctx.fillRect(0,0,256,128);
 const rows=4,cols=8,h=128/rows,w=256/cols;
 for(let r=0;r<rows;r++)for(let i=-1;i<cols;i++){
  const x=i*w+(r%2?w/2:0)+3,y=r*h+3,shade=[ '#c0603e','#b85a3a','#c8694a','#b45334'][(r*3+i+8)%4];
  ctx.fillStyle=shade;ctx.beginPath();ctx.roundRect?.(x,y,w-6,h-6,4);if(!ctx.roundRect)ctx.rect(x,y,w-6,h-6);ctx.fill();
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {Array} options.colliders
 * @param {(x:number,z:number)=>number} options.heightAt the town's ground
 * @param {boolean} [options.shadows]
 */
export function buildStreetFurniture({parent,colliders=[],heightAt=()=>0,shadows=false}={}){
 const group=new THREE.Group();group.name='Street furniture';parent.add(group);
 const white=new THREE.MeshStandardMaterial({color:0xf2f2ee,roughness:.55});
 const steel=new THREE.MeshStandardMaterial({color:0x6e7478,roughness:.45,metalness:.35});

 // Chain bollards.
 const postGeo=new THREE.CylinderGeometry(.13,.14,.86,14),capGeo=new THREE.SphereGeometry(.13,14,8,0,Math.PI*2,0,Math.PI/2),eyeGeo=new THREE.TorusGeometry(.055,.02,6,12);
 const linkGeo=new THREE.TorusGeometry(.055,.017,5,10);linkGeo.scale(1.45,1,1);
 const posts=[],links=[];
 const existing=colliders.slice(),occupied=(x,z,r=.35)=>existing.some(c=>Math.abs(c.x-x)<(c.w||0)/2+r&&Math.abs(c.z-z)<(c.d||0)/2+r&&!/seawall/.test(c.id||''));
 for(const [x0,z0,x1,z1] of CHAIN_RUNS){
  const len=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(len/POST_SPACING)),dir=new THREE.Vector3(x1-x0,0,z1-z0).normalize();
  // A post that would land on something already there (a garden wall, a tree) is left
  // out, and the chain stops either side of it rather than running through.
  const pts=[];for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;pts.push(occupied(x,z)?null:new THREE.Vector3(x,heightAt(x,z),z));}
  for(const p of pts)if(p){posts.push(p);colliders.push({id:'chain-bollard',x:p.x,z:p.z,w:.3,d:.3,height:p.y+.95});}
  // A steel chain between each pair of posts, hanging in a shallow curve.
  for(let i=0;i<pts.length-1;i++){
   if(!pts[i]||!pts[i+1])continue;
   const a=pts[i].clone().setY(pts[i].y+.66),b=pts[i+1].clone().setY(pts[i+1].y+.66),span=a.distanceTo(b),count=Math.round(span/.15);
   for(let k=1;k<count;k++){
    const t=k/count,p=a.clone().lerp(b,t);p.y-=Math.sin(Math.PI*t)*.32;
    // Each link lies along the curve, alternate links turned a quarter so they interlock.
    const slope=Math.cos(Math.PI*t)*.32*Math.PI/span;
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),dir.clone().setY(-slope).normalize());
    if(k%2)q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));
    links.push(new THREE.Matrix4().compose(p,q,new THREE.Vector3(1,1,1)));
   }
  }
 }
 const postMesh=new THREE.InstancedMesh(postGeo,white,posts.length),capMesh=new THREE.InstancedMesh(capGeo,white,posts.length),eyeMesh=new THREE.InstancedMesh(eyeGeo,steel,posts.length);
 posts.forEach((p,i)=>{
  postMesh.setMatrixAt(i,new THREE.Matrix4().makeTranslation(p.x,p.y+.43,p.z));
  capMesh.setMatrixAt(i,new THREE.Matrix4().makeTranslation(p.x,p.y+.86,p.z));
  eyeMesh.setMatrixAt(i,new THREE.Matrix4().makeTranslation(p.x,p.y+.66,p.z));
 });
 const linkMesh=new THREE.InstancedMesh(linkGeo,steel,links.length);links.forEach((m,i)=>linkMesh.setMatrixAt(i,m));
 for(const [mesh,name] of [[postMesh,'Chain bollard'],[capMesh,'Chain bollard cap'],[eyeMesh,'Chain bollard eye'],[linkMesh,'Bollard chain']]){
  mesh.name=name;mesh.castShadow=shadows&&mesh!==linkMesh;mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();group.add(mesh);
 }

 // Brick planters.
 const bricks=brickTexture();if(bricks)bricks.repeat.set(3,1);
 const brick=new THREE.MeshStandardMaterial({color:0xffffff,map:bricks,roughness:.9});
 const rim=new THREE.MeshStandardMaterial({color:0xd8c7b0,roughness:.9}),soil=new THREE.MeshStandardMaterial({color:0x5b4030,roughness:1});
 const leaf=new THREE.MeshStandardMaterial({color:0x3f8a3c,roughness:.8});
 const petals=[0xe2445a,0xf27aa0,0xd8342c,0xf4f1ea,0xb455c8].map(color=>new THREE.MeshStandardMaterial({color,roughness:.7}));
 const tub=new THREE.CylinderGeometry(.62,.58,.52,24,1,true),cap=new THREE.TorusGeometry(.6,.05,6,24),bed=new THREE.CircleGeometry(.6,24),bush=new THREE.SphereGeometry(.2,10,8),bloom=new THREE.SphereGeometry(.1,10,8);
 PLANTERS.forEach(([x,z],n)=>{
  const y=heightAt(x,z),planter=new THREE.Group();planter.name='Brick planter';planter.position.set(x,y,z);group.add(planter);
  const body=new THREE.Mesh(tub,brick);body.position.y=.26;body.castShadow=shadows;planter.add(body);
  const lid=new THREE.Mesh(cap,rim);lid.rotation.x=Math.PI/2;lid.position.y=.52;planter.add(lid);
  const earth=new THREE.Mesh(bed,soil);earth.rotation.x=-Math.PI/2;earth.position.y=.48;planter.add(earth);
  for(let i=0;i<7;i++){const a=i*2.4+n,r=i?.36:0;const g=new THREE.Mesh(bush,leaf);g.position.set(Math.cos(a)*r,.6,Math.sin(a)*r);g.scale.setScalar(i?1:1.2);planter.add(g);}
  for(let i=0;i<11;i++){const a=i*1.9+n*.7,r=.12+(i%3)*.15;const f=new THREE.Mesh(bloom,petals[(i+n)%petals.length]);f.position.set(Math.cos(a)*r,.72+(i%2)*.06,Math.sin(a)*r);planter.add(f);}
  colliders.push({id:'brick-planter',x,z,w:1.3,d:1.3,height:y+.8});
 });
 return {group};
}
