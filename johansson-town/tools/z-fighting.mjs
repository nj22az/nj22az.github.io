import * as THREE from '../vendor/three.module.js';

/**
 * Coplanar overlapping faces: the flashing the owner saw on his iPhone (20 October 2026: "Lots of flashing meshes").
 * Two triangles that face the same way, lie within `tolerance` metres of each other's plane and overlap by more than
 * `minArea` square metres are drawn at the same depth, and the depth buffer picks a different winner from frame to
 * frame (and more so on a phone's depth buffer, further away). A face drawn with polygon offset (the town's decal
 * layers) is excluded, as are hidden meshes and ones that write no colour. A double-sided face fights from both sides.
 *
 * `regions`: [{minX,maxX,minZ,maxZ,minY?,maxY?}] in world metres; only triangles whose middle is in one are scanned.
 * Returns the pairs, largest overlap first: {a,b,area,gap,normal,at} with a and b the meshes' paths.
 */
export function coplanarOverlaps(root,{regions=null,tolerance=.005,minArea=.0004,skip=()=>false,ground=.15,keepIdentical=false,keepHidden=false,detail=false}={}){
 root.updateMatrixWorld(true);
 const inRegion=(x,y,z)=>!regions||regions.some(r=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ&&y>=(r.minY??-Infinity)&&y<=(r.maxY??Infinity));
 const regionBox=regions&&regions.map(r=>new THREE.Box3(new THREE.Vector3(r.minX,r.minY??-1e9,r.minZ),new THREE.Vector3(r.maxX,r.maxY??1e9,r.maxZ)));
 const tris=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),e=new THREE.Vector3(),m=new THREE.Matrix4(),im=new THREE.Matrix4(),box=new THREE.Box3();
 const pathOf=o=>{const names=[];for(let p=o;p&&p!==root;p=p.parent)if(p.name)names.unshift(p.name);return names.join(' › ')||o.type;};
 const hidden=o=>{if(!o.layers.isEnabled(0))return true;for(let p=o;p;p=p.parent)if(!p.visible)return true;return false;};
 const offset=mat=>!!mat&&mat.polygonOffset&&(mat.polygonOffsetFactor||mat.polygonOffsetUnits);
 const invisible=mat=>!mat||mat.visible===false||mat.colorWrite===false||(mat.transparent&&mat.opacity<=.01);
 // What a face looks like: two coplanar faces that are drawn identically (the same material and colour, untextured or
 // painted by the kit's world projection) cannot be told apart, so whichever wins the depth test, nothing flashes.
 const hex=c=>c?c.getHexString():'';
 const lookOf=(o,mat,vi,k)=>{
  const colour=o.geometry.attributes.color,inst=o.instanceColor;
  return [mat.type,hex(mat.color),hex(mat.emissive),mat.emissiveIntensity,mat.roughness,mat.metalness,mat.opacity,mat.transparent,mat.vertexColors&&colour?[colour.getX(vi),colour.getY(vi),colour.getZ(vi)].map(v=>v.toFixed(3)).join(','):'',
   inst?[inst.getX(k),inst.getY(k),inst.getZ(k)].map(v=>v.toFixed(3)).join(','):'',
   mat.map||mat.emissiveMap||mat.alphaMap?(o.name.includes('Okinawan quarter:')||/:\w+\|-?\d+\|-?\d+$/.test(o.name)?mat.uuid:o.uuid+'|'+mat.uuid):''].join('/');
 };
 // Every opaque triangle near the regions, by the solid it belongs to (a mesh, or one piece of a merged mesh): a face whose
 // overlap lies inside another closed solid is never seen, whatever it shares a plane with.
 const solids=[],cells=new Map(),cell=.5,near=regionBox&&regionBox.map(r=>r.clone().expandByScalar(2));
 root.traverse(o=>{
  if(!o.isMesh||o.isSkinnedMesh||!o.geometry?.attributes?.position||hidden(o)||skip(o))return;
  const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
  const count=o.isInstancedMesh?o.count:1,mats=Array.isArray(o.material)?o.material:[o.material];
  const p=g.attributes.position,index=g.index,total=index?index.count:p.count,colour=g.attributes.color;
  const groups=g.groups.length?g.groups:[{start:0,count:total,materialIndex:0}];
  for(let k=0;k<count;k++){
   if(o.isInstancedMesh){o.getMatrixAt(k,im);if(Math.abs(im.determinant())<1e-12)continue;m.multiplyMatrices(o.matrixWorld,im);}else m.copy(o.matrixWorld);
   if(regionBox){box.copy(g.boundingBox).applyMatrix4(m);if(!regionBox.some(r=>r.intersectsBox(box)))continue;}
   const id=o.uuid+(o.isInstancedMesh?'#'+k:''),path=pathOf(o),sources=o.userData.kitSources??o.userData.mergedParts;
   const pieceOf=vi=>{if(!sources)return -1;let lo=0,hi=sources.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(sources[mid].start<=vi)lo=mid;else hi=mid-1;}return lo;};
   const sourceOf=vi=>{const i=pieceOf(vi);return i<0||!sources[i].where?path:path.split(':')[0]+' ⟨'+sources[i].where+'⟩';};
   const occludes=!near||near.some(r=>r.intersectsBox(box.copy(g.boundingBox).applyMatrix4(m)));
   for(const grp of groups){
    const mat=Array.isArray(o.material)?mats[grp.materialIndex]:o.material;
    if(invisible(mat)||offset(mat))continue;
    const twoSided=mat.side===THREE.DoubleSide,end=Math.min(total,grp.start+grp.count),opaque=!mat.transparent&&!mat.alphaTest&&!o.userData.clearWindow;
    for(let i=grp.start;i+2<end;i+=3){
     a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(m);
     b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(m);
     c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(m);
     if(occludes&&opaque){const solid=id+'/'+pieceOf(index?index.getX(i):i),tri={solid,pts:[a.clone(),b.clone(),c.clone()]};
      tri.minX=Math.min(a.x,b.x,c.x);tri.maxX=Math.max(a.x,b.x,c.x);tri.minZ=Math.min(a.z,b.z,c.z);tri.maxZ=Math.max(a.z,b.z,c.z);solids.push(tri);
      for(let gx=Math.floor(tri.minX/cell);gx<=Math.floor(tri.maxX/cell);gx++)for(let gz=Math.floor(tri.minZ/cell);gz<=Math.floor(tri.maxZ/cell);gz++){const key=gx+','+gz;(cells.get(key)??cells.set(key,[]).get(key)).push(tri);}}
     n.subVectors(b,a).cross(e.subVectors(c,a));const len=n.length();if(len<2e-6)continue;n.divideScalar(len);
     if(!inRegion((a.x+b.x+c.x)/3,(a.y+b.y+c.y)/3,(a.z+b.z+c.z)/3))continue;
     if(mat.side===THREE.BackSide)n.negate();
     // A face looking down at ground level rests on the ground: nobody can stand under it to see it.
     if(n.y<-.7&&Math.max(a.y,b.y,c.y)<ground&&!twoSided)continue;
     const t={id,mesh:o,glass:mat.transparent&&mat.depthWrite===false,src:sourceOf(index?index.getX(i):i),look:lookOf(o,mat,index?index.getX(i):i,k),pts:[a.clone(),b.clone(),c.clone()],n:n.clone(),d:n.dot(a)};
     tris.push(t);if(twoSided)tris.push({...t,n:t.n.clone().negate(),d:-t.d});
    }
   }
  }
 });
 // A solid is closed when every edge of its triangles is shared by an even number of them (a box, a cylinder with its
 // caps); only a closed one has an inside. Inside: a ray straight up from the point crosses it an odd number of times.
 const closed=new Map(),bySolid=new Map();for(const t of solids)(bySolid.get(t.solid)??bySolid.set(t.solid,[]).get(t.solid)).push(t);
 const isClosed=id=>{if(closed.has(id))return closed.get(id);const edges=new Map(),k=p=>p.toArray().map(v=>Math.round(v*1e4)).join(',');
  for(const t of bySolid.get(id)||[])for(let i=0;i<3;i++){const x=k(t.pts[i]),y=k(t.pts[(i+1)%3]),key=x<y?x+'|'+y:y+'|'+x;edges.set(key,(edges.get(key)||0)+1);}
  const ok=edges.size>0&&[...edges.values()].every(v=>v%2===0);closed.set(id,ok);return ok;};
 const insideSolid=pt=>{const crossings=new Map();
  for(const t of cells.get(Math.floor(pt.x/cell)+','+Math.floor(pt.z/cell))||[]){
   if(pt.x<t.minX||pt.x>t.maxX||pt.z<t.minZ||pt.z>t.maxZ)continue;const [A,B,C]=t.pts;
   const den=(B.z-C.z)*(A.x-C.x)+(C.x-B.x)*(A.z-C.z);if(Math.abs(den)<1e-12)continue;
   const l1=((B.z-C.z)*(pt.x-C.x)+(C.x-B.x)*(pt.z-C.z))/den,l2=((C.z-A.z)*(pt.x-C.x)+(A.x-C.x)*(pt.z-C.z))/den,l3=1-l1-l2;
   if(l1<0||l2<0||l3<0)continue;if(l1*A.y+l2*B.y+l3*C.y<=pt.y)continue;
   crossings.set(t.solid,(crossings.get(t.solid)||0)+1);}
  for(const [id,n] of crossings)if(n%2===1&&isClosed(id))return true;return false;};
 const sample=new THREE.Vector3();
 // Buckets by facing (to about 1°) and by plane (tolerance-wide slabs; a pair can straddle two).
 const q=v=>Math.round(v*60),buckets=new Map();
 for(const t of tris){const key=q(t.n.x)+','+q(t.n.y)+','+q(t.n.z);(buckets.get(key)??buckets.set(key,[]).get(key)).push(t);}
 const found=new Map(),u=new THREE.Vector3(),v=new THREE.Vector3();
 for(const list of buckets.values()){
  if(list.length<2)continue;
  const N=list[0].n;u.set(Math.abs(N.y)<.9?0:1,Math.abs(N.y)<.9?1:0,0).cross(N).normalize();v.crossVectors(N,u);
  for(const t of list){t.uv=t.pts.map(p=>[p.dot(u),p.dot(v)]);t.min=[Math.min(...t.uv.map(p=>p[0])),Math.min(...t.uv.map(p=>p[1]))];t.max=[Math.max(...t.uv.map(p=>p[0])),Math.max(...t.uv.map(p=>p[1]))];}
  list.sort((x,y)=>x.d-y.d);
  for(let i=0;i<list.length;i++){const s=list[i];
   for(let j=i+1;j<list.length&&list[j].d-s.d<=tolerance;j++){const t=list[j];
    if(t.id===s.id&&t.mesh===s.mesh&&s.pts.every((p,k)=>p.equals(t.pts[k])))continue;
    if(s.n.dot(t.n)<.9998||(!keepIdentical&&s.look===t.look))continue;
    // Two see-through layers that write no depth both draw, in their fixed order: they cannot fight each other.
    if(s.glass&&t.glass)continue;
    if(s.max[0]<=t.min[0]||t.max[0]<=s.min[0]||s.max[1]<=t.min[1]||t.max[1]<=s.min[1])continue;
    const poly=overlapPolygon(s.uv,t.uv),area=polygonArea(poly);if(area<1e-6)continue;
    // Seen at all? Points of the overlap 1.5 mm in front of it, each inside some closed solid or not.
    {const cx=poly.reduce((v,p)=>v+p[0],0)/poly.length,cy=poly.reduce((v,p)=>v+p[1],0)/poly.length,d=(s.d+t.d)/2+.0015;
     const seen=[[cx,cy],...poly.map(p=>[cx+(p[0]-cx)*.8,cy+(p[1]-cy)*.8])].some(([pu,pv])=>{sample.copy(u).multiplyScalar(pu).addScaledVector(v,pv).addScaledVector(s.n,d-(u.dot(s.n)*pu+v.dot(s.n)*pv));sample.x+=1.3e-5;sample.z+=.7e-5;return !insideSolid(sample);});
     if(!seen&&!keepHidden)continue;}
    const [p,r]=s.src<=t.src?[s,t]:[t,s],key=p.src+' | '+r.src+' | '+q(s.n.x)+','+q(s.n.y)+','+q(s.n.z);
    const f=found.get(key)??found.set(key,{a:p.src,b:r.src,same:s.mesh===t.mesh,area:0,gap:0,normal:s.n.toArray().map(x=>+x.toFixed(3)),at:s.pts[0].toArray().map(x=>+x.toFixed(2))}).get(key);
    f.area+=area;f.gap=Math.max(f.gap,Math.abs(t.d-s.d));
    if(detail){const bb=x=>{const lo=[0,1,2].map(k=>Math.min(...x.pts.map(p=>p.getComponent(k)))),hi=[0,1,2].map(k=>Math.max(...x.pts.map(p=>p.getComponent(k))));return lo.map((v,k)=>v.toFixed(3)+'..'+hi[k].toFixed(3)).join(' ');};(f.boxes??=[]).length<6&&f.boxes.push([bb(p),bb(r)]);}
   }
  }
 }
 return [...found.values()].filter(f=>f.area>=minArea).sort((x,y)=>y.area-x.area);
}

/** The intersection of two triangles in a plane (Sutherland–Hodgman, both wound either way), and a polygon's area. */
function polygonArea(P){let s=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];s+=p[0]*q[1]-q[0]*p[1];}return Math.abs(s)/2;}
function overlapPolygon(A,B){
 const ccw=P=>{let s=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];s+=p[0]*q[1]-q[0]*p[1];}return s<0?[...P].reverse():P;};
 let out=ccw(A);const clip=ccw(B);
 for(let i=0;i<clip.length&&out.length;i++){
  const p=clip[i],q=clip[(i+1)%clip.length],side=x=>(q[0]-p[0])*(x[1]-p[1])-(q[1]-p[1])*(x[0]-p[0]);
  const input=out;out=[];
  for(let k=0;k<input.length;k++){const cur=input[k],prev=input[(k+input.length-1)%input.length],sc=side(cur),sp=side(prev);
   if(sc>=0){if(sp<0)out.push(cross(prev,cur,sp,sc));out.push(cur);}else if(sp>=0)out.push(cross(prev,cur,sp,sc));}
 }
 return out;
}
function cross(p,q,sp,sq){const t=sp/(sp-sq);return [p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];}
