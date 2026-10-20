import {coordinatedStreetPatches} from './street-plan.js';
import {KITAHAMA,kitahamaLaneAt} from './kitahama-layout.js';
import {NIGHT_LANE,inDiningLane} from './dining-layout.js';
import {GROUND} from '../render/ground-palette.js';
import * as THREE from '../../vendor/three.module.js';
import {activeRoutes,routeAt,groundHeight} from './layout.js?snappy=1';
import {GROUND_LAYER} from './ground-layers.js';
import {BEACH} from './beach-layout.js';

// Low garden boundaries make the authored walking network legible. Leave every
// junction open, including routes supplied by the shopping and dining models.
export function laneEdges(){
 const edges=[];
 const selected=new Set(['bus-approach','bus-platform','east-alley','residential','river-walk','park-approach']);
 for(const route of activeRoutes().filter(r=>!r.park&&selected.has(r.id)))for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,count=Math.ceil(length);
  for(let j=0;j<count;j++)for(const side of [-1,1]){
   const t=(j+.5)/count,x=a[0]+dx*length*t-dz*side*(route.width/2+.22),z=a[1]+dz*length*t+dx*side*(route.width/2+.22),span=length/count;
   if([-.5,0,.5].some(u=>routeAt(x+dx*span*u,z+dz*span*u)||inDiningLane(x+dx*span*u,z+dz*span*u)))continue;
   edges.push({x,z,w:dx?span:.18,d:dz?span:.18,y:groundHeight(x+dz*side*.3,z-dx*side*.3),height:route.id==='park-approach'?.55:.7});
  }
 }
 return edges;
}

// All urban paving, including the coastal circuit, has one junction owner.
export function lanePatches(routes=activeRoutes().slice(3)) {
 return coordinatedStreetPatches(routes);
}

/** Whether a paving patch is the coastal walk's stretch over the east beach's sand (beach-layout.js BEACH). */
export function beachWalkAt(patch){
 if(patch.route!=='island-coast-walk')return false;
 const n=patch.polygon.length,x=patch.polygon.reduce((a,p)=>a+p[0],0)/n,z=patch.polygon.reduce((a,p)=>a+p[1],0)/n;
 return x>=BEACH.profile[0][0]&&z>=BEACH.minZ&&z<=BEACH.maxZ;
}
export function buildLaneSurfaces(parent,library) {
  const edges=laneEdges(),boundary=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x7d8776,roughness:1}),edges.length),dummy=new THREE.Object3D();
  edges.forEach((e,i)=>{dummy.position.set(e.x,e.y+e.height/2,e.z);dummy.scale.set(e.w,e.height,e.d);dummy.updateMatrix();boundary.setMatrixAt(i,dummy.matrix);});
  boundary.name='Low garden lane boundaries';boundary.receiveShadow=true;parent.add(boundary);
  const batches=new Map();
  const vertexHeight=(surface,x,z)=>{
    // Kitahama's lanes already carry the lane layer in groundHeight, but only where the
    // ground there is the lane: where the school's yard overlies a lane (lane 6) it is the
    // yard's datum, and taking the layer off again laid the path flush with the earth.
    const ground=groundHeight(x,z),lane=kitahamaLaneAt(x,z)&&Math.abs(ground-(KITAHAMA.y+GROUND_LAYER.lane))<1e-6;
    return ground+(lane?0:GROUND_LAYER.lane);
  };
  const triangle=(surface,a,b,c)=>{
    if(!batches.has(surface))batches.set(surface,{positions:[],uv:[],indices:[]});
    const batch=batches.get(surface),n=batch.positions.length/3;
    for(const [x,z] of [a,b,c]){batch.positions.push(x,vertexHeight(surface,x,z),z);batch.uv.push(x/4,z/4);}
    batch.indices.push(n,n+2,n+1);
  };
  // Only graded ground needs subdivision. Flat district lanes stay inexpensive on mobile.
  const emit=(surface,a,b,c,depth=0)=>{
    const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
    const pts=[a,b,c,ab,bc,ca],hs=pts.map(p=>vertexHeight(surface,...p));
    const longest=Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(b[0]-c[0],b[1]-c[1]),Math.hypot(c[0]-a[0],c[1]-a[1]));
    if(depth<10&&longest>.6&&Math.max(...hs)-Math.min(...hs)>.001){
      emit(surface,a,ab,ca,depth+1);emit(surface,ab,b,bc,depth+1);emit(surface,ca,bc,c,depth+1);emit(surface,ab,bc,ca,depth+1);
    }else triangle(surface,a,b,c);
  };
  // Along the east beach the coastal walk is the firm wet sand at the water's edge, not a concrete strip between
  // the beach and the sea: the walk is the same, its surface is the beach's (beachWalkAt).
  for(const patch of lanePatches()){const surface=beachWalkAt(patch)?'wet-sand':patch.surface;for(let i=1;i<patch.polygon.length-1;i++)emit(surface,patch.polygon[0],patch.polygon[i],patch.polygon[i+1]);}
  for(const [surface,b] of batches){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geometry.setIndex(b.indices);geometry.computeVertexNormals();
    const material=surface==='wet-sand'?new THREE.MeshStandardMaterial({color:0xcdb88c,roughness:1}):surface==='concrete'?new THREE.MeshStandardMaterial({color:GROUND.concrete,roughness:.94}):library.worldMaterial(surface==='wood'?'timber':surface==='asphalt'?'asphalt':'paving',surface==='wood'?0xc8c1af:surface==='asphalt'?GROUND.asphalt:GROUND.pavers).clone();material.side=THREE.DoubleSide;
    const mesh=new THREE.Mesh(geometry,material);mesh.name='grid-lanes:'+surface;mesh.receiveShadow=true;parent.add(mesh);
  }
}
