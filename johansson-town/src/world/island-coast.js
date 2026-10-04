import {ISLAND_COAST} from './island-plan.js';
import * as THREE from '../../vendor/three.module.js';
import {GROUND} from '../render/ground-palette.js';
import {TUNNEL} from './coyote-tunnel.js';
import {paintedTurf} from '../render/toy-surfaces.js';

// One shoreline shared by the ground, visible retaining edge and visitor map.
// A closed headland: water separates every edge from the distant islands.
// The north-west shore runs out under the tunnel hill. It used to stop at z≈36, which
// put the hill, its boulders and the last few metres of the bus road out over open
// water: from the road you saw a band of sea at the foot of the cliff and the painting
// floating above it. The headland now carries the rock it is holding up.
// South of the lawn the land runs out to the school's seawall and the tetrapods beyond it.
// October 2026: the island grew and lost its corners (docs/AMPLIFY-AUDIT.md, §12). What is
// built stays where it was: the Nishi-machi seawall (x -40) and the harbour front (z -50)
// are man-made and straight, and the beach keeps its line. The natural shore around
// them is now irregular: a rocky point north-west of Nishi-machi, the new Kitahama
// district and its cane field rounding the north-east, and a softened south-east corner.
export const COASTLINE=[
 [-40,-50],[-40,30],[-43,32],[-47,36],[-49.5,41],[-48.5,46],[-44,49.5],[-38,50.5],
 ...ISLAND_COAST,
 [62,64],[59,57],[55,52],[51,48.5],[48.5,46],
 [47.5,40],[45,29],[45,-43],
 [44,-46.5],[41.5,-49],[38,-50],[20,-50]];
/** The land's bounding box, for the map and the residents' navigation grid. */
export const COAST_BOUNDS=Object.freeze({minX:Math.min(...COASTLINE.map(p=>p[0])),maxX:Math.max(...COASTLINE.map(p=>p[0])),minZ:Math.min(...COASTLINE.map(p=>p[1])),maxZ:Math.max(...COASTLINE.map(p=>p[1]))});
// The shore runs under the headland the tunnel goes through, and a boulder there stands
// in the tunnel's road. Along Nishi-machi the seawall is the shore, so no boulders there.
const underTunnel=(x,z)=>Math.abs(x-TUNNEL.x)<TUNNEL.bore.half+1.5&&z>TUNNEL.z-1;
export function buildIslandCoast(parent){
 const shape=new THREE.Shape();COASTLINE.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 // Unbuilt land is rough island grass, painted like the lawns, not a grey-khaki slab:
 // from the harbour it was the largest flat colour in view (docs/AMPLIFY-AUDIT.md).
 const groundMaterial=new THREE.MeshStandardMaterial({color:GROUND.grass,roughness:1});
 if(typeof document!=='undefined'&&document.createElement){try{const turf=paintedTurf().clone();turf.needsUpdate=true;turf.repeat.set(1/6,1/6);groundMaterial.map=turf;}catch{}}
 const ground=new THREE.Mesh(new THREE.ShapeGeometry(shape),groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.4;ground.name='Island land';parent.add(ground);
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
  for(let j=0;j<count;j++){const t=(j+.5)/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(z< -40||underTunnel(x,z)||x< -39&&z<30||x>44&&z>-43&&z<40)continue;rocks.push({x,z,size:.65+.25*Math.sin(i*9+j*2.3)});}
 }
 const shore=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x859080,roughness:1}),rocks.length);
 rocks.forEach((r,i)=>{dummy.position.set(r.x,-.35,r.z);dummy.scale.set(r.size*1.6,r.size*.7,r.size);dummy.rotation.set(.2,i*1.7,.15);dummy.updateMatrix();shore.setMatrixAt(i,dummy.matrix);});shore.name='Rocky island shore';parent.add(shore);
 return ground;
}
