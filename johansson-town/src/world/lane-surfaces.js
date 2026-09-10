import * as THREE from '../../vendor/three.module.js';
import {ROUTES,groundHeight} from './layout.js';

// Partition the union of rectangular streets. Each patch belongs to exactly one
// route: crossing lanes never produce coplanar, overlapping road meshes.
export function lanePatches(routes=ROUTES.slice(3)) {
  const rects=[];
  for(const route of routes) {
    if(route.id==='shrine-slope')continue;
    const half=route.width/2;
    for(let i=1;i<route.points.length;i++) {
      const a=route.points[i-1],b=route.points[i];
      if(a[0]!==b[0]&&a[1]!==b[1])throw Error('Non-grid lane: '+route.id);
      rects.push({minX:Math.min(a[0],b[0])-half,maxX:Math.max(a[0],b[0])+half,minZ:Math.min(a[1],b[1])-half,maxZ:Math.max(a[1],b[1])+half,route});
    }
  }
  const xs=[...new Set([-7.5,7.5,...rects.flatMap(r=>[r.minX,r.maxX])])].sort((a,b)=>a-b);
  const zs=[...new Set([-64,58,...rects.flatMap(r=>[r.minZ,r.maxZ])])].sort((a,b)=>a-b);
  const patches=[];
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++) {
    const x=(xs[i-1]+xs[i])/2,z=(zs[j-1]+zs[j])/2;
    if(Math.abs(x)<7.5&&z>-64&&z<58)continue;
    const owner=rects.find(r=>x>r.minX&&x<r.maxX&&z>r.minZ&&z<r.maxZ);
    if(owner)patches.push({x0:xs[i-1],x1:xs[i],z0:zs[j-1],z1:zs[j],surface:owner.route.surface});
  }
  return patches;
}

export function buildLaneSurfaces(parent,library) {
  const batches=new Map();
  const quad=(surface,points)=>{
    if(!batches.has(surface))batches.set(surface,{positions:[],uv:[],indices:[]});
    const b=batches.get(surface),n=b.positions.length/3;
    for(const [x,z] of points){b.positions.push(x,groundHeight(x,z)+.04,z);b.uv.push(x/4,z/4);}
    b.indices.push(n,n+2,n+1,n+1,n+2,n+3);
  };
  for(const p of lanePatches())quad(p.surface,[[p.x0,p.z0],[p.x1,p.z0],[p.x0,p.z1],[p.x1,p.z1]]);
  const slope=ROUTES.find(r=>r.id==='shrine-slope');
  for(let i=1;i<slope.points.length;i++){
    const a=slope.points[i-1],b=slope.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=dz/len*slope.width/2,nz=-dx/len*slope.width/2;
    quad('stone',[[a[0]-nx,a[1]-nz],[a[0]+nx,a[1]+nz],[b[0]-nx,b[1]-nz],[b[0]+nx,b[1]+nz]]);
  }
  for(const [surface,b] of batches){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geometry.setIndex(b.indices);geometry.computeVertexNormals();
    const material=library.worldMaterial(surface==='wood'?'timber':surface==='asphalt'?'asphalt':'paving',0xc8c1af).clone();material.side=THREE.DoubleSide;
    const mesh=new THREE.Mesh(geometry,material);mesh.name='grid-lanes:'+surface;mesh.receiveShadow=true;parent.add(mesh);
  }
}
