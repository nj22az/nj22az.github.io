import {NIGHT_LANE,inDiningLane} from './dining-layout.js';
import {RESIDENTIAL,inResidential} from './residential-layout.js';
import * as THREE from '../../vendor/three.module.js';
import {ROUTES,routeAt,groundHeight} from './layout.js?snappy=1';

// Low garden boundaries make the authored walking network legible. Leave every
// junction open, including routes supplied by the residential and dining models.
export function laneEdges(){
 const edges=[];
 const selected=new Set(['east-alley','west-alley','residential','west-service','east-service','river-walk','park-approach']);
 for(const route of ROUTES.filter(r=>selected.has(r.id)))for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,count=Math.ceil(length);
  for(let j=0;j<count;j++)for(const side of [-1,1]){
   const t=(j+.5)/count,x=a[0]+dx*length*t-dz*side*(route.width/2+.22),z=a[1]+dz*length*t+dx*side*(route.width/2+.22),span=length/count;
   if([-.5,0,.5].some(u=>routeAt(x+dx*span*u,z+dz*span*u)||inResidential(x+dx*span*u,z+dz*span*u)||inDiningLane(x+dx*span*u,z+dz*span*u)))continue;
   edges.push({x,z,w:dx?span:.18,d:dz?span:.18,y:groundHeight(x+dz*side*.3,z-dx*side*.3),height:route.id==='park-approach'?.55:.7});
  }
 }
 return edges;
}

// Partition the union of rectangular streets. Each patch belongs to exactly one
// route: crossing lanes never produce coplanar, overlapping road meshes.
export function lanePatches(routes=ROUTES.slice(3)) {
  const rects=[];
  for(const route of routes) {
    const half=route.width/2;
    for(let i=1;i<route.points.length;i++) {
      const a=route.points[i-1],b=route.points[i];
      if(a[0]!==b[0]&&a[1]!==b[1])throw Error('Non-grid lane: '+route.id);
      rects.push({minX:Math.min(a[0],b[0])-half,maxX:Math.max(a[0],b[0])+half,minZ:Math.min(a[1],b[1])-half,maxZ:Math.max(a[1],b[1])+half,route});
    }
  }
  const xs=[...new Set([-7.5,7.5,17.5,22.2,RESIDENTIAL.minX,RESIDENTIAL.maxX,NIGHT_LANE.minX,NIGHT_LANE.maxX,...rects.flatMap(r=>[r.minX,r.maxX])])].sort((a,b)=>a-b);
  const zs=[...new Set([-50,31,RESIDENTIAL.minZ,RESIDENTIAL.maxZ,NIGHT_LANE.minZ,NIGHT_LANE.maxZ,...rects.flatMap(r=>[r.minZ,r.maxZ])])].sort((a,b)=>a-b);
  const patches=[];
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++) {
    const x=(xs[i-1]+xs[i])/2,z=(zs[j-1]+zs[j])/2;
    if(inResidential(x,z)||inDiningLane(x,z))continue;
    if(Math.abs(x)<7.5&&z>-50&&z<31)continue;
    const owner=rects.find(r=>x>r.minX&&x<r.maxX&&z>r.minZ&&z<r.maxZ);
    if(owner)patches.push({x0:xs[i-1],x1:xs[i],z0:zs[j-1],z1:zs[j],surface:owner.route.id==='home-lane'?'residential':owner.route.surface});
  }
  return patches;
}

export function buildLaneSurfaces(parent,library) {
  const edges=laneEdges(),boundary=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x7d8776,roughness:1}),edges.length),dummy=new THREE.Object3D();
  edges.forEach((e,i)=>{dummy.position.set(e.x,e.y+e.height/2,e.z);dummy.scale.set(e.w,e.height,e.d);dummy.updateMatrix();boundary.setMatrixAt(i,dummy.matrix);});
  boundary.name='Low garden lane boundaries';boundary.receiveShadow=true;parent.add(boundary);
  const batches=new Map();
  const quad=(surface,points)=>{
    if(!batches.has(surface))batches.set(surface,{positions:[],uv:[],indices:[]});
    const b=batches.get(surface),n=b.positions.length/3;
    for(const [x,z] of points){b.positions.push(x,groundHeight(x,z)+.04,z);b.uv.push(x/4,z/4);}
    b.indices.push(n,n+2,n+1,n+1,n+2,n+3);
  };
  for(const p of lanePatches())quad(p.surface,[[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1]]);
  for(const [surface,b] of batches){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geometry.setIndex(b.indices);geometry.computeVertexNormals();
    const material=surface==='residential'?new THREE.MeshStandardMaterial({color:0xb9b5a5,roughness:.94}):library.worldMaterial(surface==='wood'?'timber':surface==='asphalt'?'asphalt':'paving',0xc8c1af).clone();material.side=THREE.DoubleSide;
    const mesh=new THREE.Mesh(geometry,material);mesh.name='grid-lanes:'+surface;mesh.receiveShadow=true;parent.add(mesh);
  }
}
