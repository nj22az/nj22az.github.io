import * as THREE from '../../vendor/three.module.js';
import {TUNNEL} from './coyote-tunnel.js';

// One shoreline shared by the ground, visible retaining edge and visitor map.
// A closed headland: water separates every edge from the distant islands.
// The north-west shore runs out under the tunnel hill. It used to stop at z≈36, which
// put the hill, its boulders and the last few metres of the bus road out over open
// water: from the road you saw a band of sea at the foot of the cliff and the painting
// floating above it. The headland now carries the rock it is holding up.
// South of the lawn the land runs out to the school's seawall and the tetrapods beyond it.
export const COASTLINE=[[-40,-50],[-40,30],[-34,35],[-22,39],[-19,48],[11,49],[12,57.5],[47,57.5],[47.5,40],[45,29],[45,-43],[38,-50],[20,-50]];
// The shore runs under the headland the tunnel goes through, and a boulder there stands
// in the tunnel's road. Along Nishi-machi the seawall is the shore, so no boulders there.
const underTunnel=(x,z)=>Math.abs(x-TUNNEL.x)<TUNNEL.bore.half+1.5&&z>TUNNEL.z-1;
export function buildPeninsula(parent){
 const shape=new THREE.Shape();COASTLINE.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
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
  for(let j=0;j<count;j++){const t=(j+.5)/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(z< -40||z>52||underTunnel(x,z)||x< -39&&z<30)continue;rocks.push({x,z,size:.65+.25*Math.sin(i*9+j*2.3)});}
 }
 const shore=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x859080,roughness:1}),rocks.length);
 rocks.forEach((r,i)=>{dummy.position.set(r.x,-.35,r.z);dummy.scale.set(r.size*1.6,r.size*.7,r.size);dummy.rotation.set(.2,i*1.7,.15);dummy.updateMatrix();shore.setMatrixAt(i,dummy.matrix);});shore.name='Rocky peninsula shore';parent.add(shore);
 return ground;
}
