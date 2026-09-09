import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js';
import {CITY_SECTIONS,FULL_PATHS,STREET_DOORS,doorApproach} from './full-town-state.js';

const STREET_SHOULDERS=Object.freeze([
 {x:-11.5,z:2.12,w:13.5,d:1.7},
 {x:11,z:2.12,w:14,d:1.7},
 {x:-11,z:-2.12,w:14,d:1.7},
 {x:11,z:-2.12,w:14,d:1.7},
]);

function timber(library){
 const mat=library.material('timber',0xb69a75).clone();
 for(const name of ['map','normalMap','roughnessMap','aoMap'])if(mat[name]){mat[name]=mat[name].clone();mat[name].repeat.set(4,10);}
 mat.normalScale.set(.3,.3);mat.roughness=.9;mat.aoMapIntensity=.28;return mat;
}

function addDeck(parent,mat,x,y,z,w,h,d,cast){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=!!cast;parent.add(mesh);return mesh;
}

function pathSegments(path){
 const segs=[];
 for(let i=1;i<path.points.length;i++){
  const a=path.points[i-1],b=path.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
  if(len<.05)continue;
  segs.push({x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,len,angle:Math.atan2(dx,dz),width:path.width,id:path.id});
 }
 return segs;
}

export function buildPromenade(parent,options={}){
 const group=new THREE.Group();group.name='Canal boardwalk and harbour water';parent.add(group);
 const library=createMaterials({mobile:options.mobile,anisotropy:options.maxAnisotropy||4});
 const deckMat=timber(library),edgeMat=new THREE.MeshStandardMaterial({color:0x6d5840,roughness:.9});
 const postMat=new THREE.MeshStandardMaterial({color:0x5c4a36,roughness:.92});
 const waterMat=new THREE.MeshStandardMaterial({color:0x3e7480,roughness:.22,metalness:.18});
 const water=new THREE.Mesh(new THREE.PlaneGeometry(120,90),waterMat);
 water.name='canal-harbour-water';water.rotation.x=-Math.PI/2;water.position.set(21.5,-.48,-18);water.receiveShadow=true;group.add(water);
 const quays=FULL_PATHS.filter(path=>path.surface==='wood'||/^(city-link|port-walk|harbour-apron|ramen-quay)$/.test(path.id));
 const dummy=new THREE.Object3D(),postMarks=[],edgeMarks=[],jointMarks=[];
 for(const path of quays){
  for(const seg of pathSegments(path)){
   const deck=addDeck(group,deckMat,seg.x,.04,seg.z,seg.width,.1,seg.len+.08);
   deck.rotation.y=seg.angle;deck.name=path.id+'-deck';
   const towardWater=path.id.includes('canal-west')?1:path.id.includes('canal-east')?-1:0;
   if(path.surface==='wood'&&towardWater){
    const ex=seg.x+towardWater*(seg.width/2+.12),ez=seg.z;
    edgeMarks.push({x:ex,z:ez,len:seg.len,angle:seg.angle});
    const count=Math.max(2,Math.round(seg.len/2.2));
    for(let i=0;i<count;i++){
     const t=(i+.5)/count-.5;
     postMarks.push({x:ex+Math.sin(seg.angle)*seg.len*t,z:ez+Math.cos(seg.angle)*seg.len*t});
    }
   }
   const joints=Math.max(1,Math.round(seg.len/.38));
   for(let i=0;i<joints;i++){
    const t=(i+.5)/joints-.5;
    jointMarks.push({x:seg.x+Math.sin(seg.angle)*seg.len*t,z:seg.z+Math.cos(seg.angle)*seg.len*t,angle:seg.angle,width:seg.width-.12});
   }
  }
 }
 for(const section of CITY_SECTIONS)for(const shoulder of STREET_SHOULDERS){
  addDeck(group,deckMat,shoulder.x+section.x,.035,shoulder.z+section.z,shoulder.w,.08,shoulder.d);
 }
 for(const section of CITY_SECTIONS)for(const door of STREET_DOORS){
  const [x,z]=doorApproach(door,1.05);
  const apron=addDeck(group,deckMat,x+section.x,.055,z+section.z,door.nx?1.7:1.15,.09,door.nz?1.7:1.15);
  apron.name='door-apron-'+door.id;
 }
 if(postMarks.length){
  const posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.09,1.15,8),postMat,postMarks.length);
  posts.name='quay-posts';posts.castShadow=!!options.shadows;posts.receiveShadow=true;
  postMarks.forEach((p,i)=>{dummy.position.set(p.x,-.35,p.z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);});
  posts.instanceMatrix.needsUpdate=true;posts.computeBoundingSphere();group.add(posts);
 }
 if(edgeMarks.length){
  const edges=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),edgeMat,edgeMarks.length);
  edges.name='quay-edge';edges.receiveShadow=true;
  edgeMarks.forEach((e,i)=>{dummy.position.set(e.x,.09,e.z);dummy.rotation.set(0,e.angle,0);dummy.scale.set(.12,.05,e.len+.04);dummy.updateMatrix();edges.setMatrixAt(i,dummy.matrix);});
  edges.instanceMatrix.needsUpdate=true;edges.computeBoundingSphere();group.add(edges);
 }
 if(jointMarks.length){
  const joints=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),edgeMat,jointMarks.length);
  joints.name='quay-joints';joints.receiveShadow=true;
  jointMarks.forEach((j,i)=>{dummy.position.set(j.x,.092,j.z);dummy.rotation.set(0,j.angle,0);dummy.scale.set(j.width,.012,.03);dummy.updateMatrix();joints.setMatrixAt(i,dummy.matrix);});
  joints.instanceMatrix.needsUpdate=true;joints.computeBoundingSphere();group.add(joints);
 }
 return {group,water,setRain(wet){waterMat.color.set(wet?0x2f5d68:0x3e7480);waterMat.roughness=wet?.18:.22;deckMat.roughness=wet?.62:.9;}};
}
