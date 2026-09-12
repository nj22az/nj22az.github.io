import * as THREE from '../../vendor/three.module.js';
import {RESIDENTIAL_CANAL} from './residential-layout.js';

// One shoreline shared by the ground, visible retaining edge and visitor map.
// The narrow northern neck continues into the distant wooded mainland.
export const COASTLINE=[[-48,-64],[-48,14],[-44,56],[-22,72],[-18,115],[18,115],[18,78],[38,72],[43,54],[53,44],[53,-24],[51,-55],[20,-64]];
export function buildPeninsula(parent){
 const shape=new THREE.Shape();COASTLINE.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 const c=RESIDENTIAL_CANAL,hole=new THREE.Path();hole.moveTo(c.minX,-c.minZ);hole.lineTo(c.maxX,-c.minZ);hole.lineTo(c.maxX,-c.maxZ);hole.lineTo(c.minX,-c.maxZ);hole.closePath();shape.holes.push(hole);
 const ground=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:0x8b9279,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.4;ground.name='Peninsula land';parent.add(ground);
 const positions=[],indices=[];
 for(let i=0;i<COASTLINE.length;i++){
  const a=COASTLINE[i],b=COASTLINE[(i+1)%COASTLINE.length],n=positions.length/3;
  positions.push(a[0],-.38,a[1],a[0],-1.5,a[1],b[0],-.38,b[1],b[0],-1.5,b[1]);indices.push(n,n+1,n+2,n+2,n+1,n+3);
 }
 const edge=new THREE.BufferGeometry();edge.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));edge.setIndex(indices);edge.computeVertexNormals();
 const wall=new THREE.Mesh(edge,new THREE.MeshStandardMaterial({color:0x79847c,roughness:1,side:THREE.DoubleSide}));wall.name='Coastal retaining stone';parent.add(wall);
 const rocks=[],dummy=new THREE.Object3D();
 for(let i=0;i<COASTLINE.length;i++){
  const a=COASTLINE[i],b=COASTLINE[(i+1)%COASTLINE.length],count=Math.floor(Math.hypot(b[0]-a[0],b[1]-a[1])/3);
  for(let j=0;j<count;j++){const t=(j+.5)/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(z< -54||z>80)continue;rocks.push({x,z,size:.65+.25*Math.sin(i*9+j*2.3)});}
 }
 const shore=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x859080,roughness:1}),rocks.length);
 rocks.forEach((r,i)=>{dummy.position.set(r.x,-.35,r.z);dummy.scale.set(r.size*1.6,r.size*.7,r.size);dummy.rotation.set(.2,i*1.7,.15);dummy.updateMatrix();shore.setMatrixAt(i,dummy.matrix);});shore.name='Rocky peninsula shore';parent.add(shore);
 return ground;
}
