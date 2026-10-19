import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {rng} from './kit.js';
import {KITAHAMA,KITAHAMA_LANES} from '../kitahama-layout.js';
import {lanePatches} from '../lane-surfaces.js?snappy=1';
import {TOWN_WALK_PLOTS} from '../architecture-plan.js';
import {NEIGHBOURHOOD,neighbourhoodHeight} from '../neighbourhood-ground.js';
import {SCHOOL} from '../school-layout.js';

/**
 * The edge of every lane in Kitahama, one way everywhere (the owner, 19 October 2026: "we need a coherent look for
 * the roads on the island").
 *
 * Kitahama's walled plots stand half a metre in from the paving (the building circuits in architecture-plan.js run
 * 1.5 m out, 2 m wide), and that half metre was lawn: a lime verge at the foot of every wall. An Okinawan lane has a
 * U-gutter (U字溝) there instead, under grey concrete lids, and a line of weeds where the gutter meets the wall. So
 * every walled plot on the grid gets the same ring, from the paving inwards:
 *
 *   the gutter, 0.3 m: concrete lids 0.6 m long on a dark channel, a steel grating across each gate and every
 *     few lengths, its top 68 mm up (28 mm over the lane, a lid's lip);
 *   a strip of earth, 0.1 m (0.2 m where no wall stands), with the weeds growing out of it at the wall's foot.
 *
 * Where a lane's edge meets open ground instead (a field, a lot waiting for its use, the island's edge), the same
 * gutter and earth strip run along the outside of the edge (openEdgeRuns). The rings follow the plot data, so a
 * plot added or taken away takes its ring with it, and the open edges close round whatever is left.
 *
 * The lanes carry their wear: two faint tyre lines down the cross lane and the spine (the rubbish truck on Tuesdays
 * and Fridays, the postman's Cub, the cane lorry in January) and a few stains, each where something drips.
 */
export const GUTTER=Object.freeze({ring:.5,width:.3,soil:.1,openSoil:.2,lid:.6,joint:.015,gratingEvery:6,
 top:.068,channel:.045,soilTop:.036});

const sideOf=(rect,side)=>{
 const {minX,maxX,minZ,maxZ}=rect;
 return {north:{axis:'x',at:maxZ,out:1,from:minX,to:maxX},south:{axis:'x',at:minZ,out:-1,from:minX,to:maxX},
  east:{axis:'z',at:maxX,out:1,from:minZ,to:maxZ},west:{axis:'z',at:minX,out:-1,from:minZ,to:maxZ}}[side];
};
/** Where a plot's gate opening is, in world coordinates along its front (okinawa/quarters.js walledHouse). */
function houseGates(p){
 const cx=(p.minX+p.maxX)/2,cz=(p.minZ+p.maxZ)/2;
 return p.gate==='north'||p.gate==='south'?{[p.gate]:[[cx-.95,cx+.95]]}:{[p.gate]:[[cz-.95,cz+.95]]};
}
/**
 * The rings, one run per side: `band` is the gutter's rectangle, `soil` the earth strip's, `walled` whether a wall
 * stands behind it (weeds at its foot), `gates` the openings along it. North and south runs take the corners.
 */
export function gutterRings(lots=[]){
 const owners=[
  ...KITAHAMA.plots.map(p=>({id:p.id,rect:p,walls:{north:true,south:true,east:true,west:true},gates:houseGates(p)})),
  ...lots.map(l=>({id:l.id,rect:l.rect,walls:Object.fromEntries(Object.entries(l.walls).map(([k,v])=>[k,!!v])),gates:l.gates})),
  // Kitahama Heights: its block wall on the lane side (the west side is its balconies' terrace).
  {id:KITAHAMA.apartment.id,rect:KITAHAMA.apartment,walls:{east:true},only:['east'],
   gates:{east:[[KITAHAMA.apartment.minZ+1.2,KITAHAMA.apartment.minZ+4.2],[KITAHAMA.apartment.maxZ-4.2,KITAHAMA.apartment.maxZ-1.8]]}},
 ];
 const runs=[],G=GUTTER;
 for(const o of owners)for(const side of o.only||['north','south','east','west']){
  const s=sideOf(o.rect,side),walled=!!o.walls[side],along=s.axis==='x',corner=along?G.ring:G.ring-G.width;
  const soilIn=walled?G.soil:0,soilOut=G.ring-G.width,from=s.from-corner,to=s.to+corner;
  const across=(a,b)=>s.out>0?[s.at+a,s.at+b]:[s.at-b,s.at-a];
  const [b0,b1]=across(G.ring-G.width,G.ring),[s0,s1]=across(soilIn,soilOut),soilFrom=s.from-(along?soilOut:soilIn),soilTo=s.to+(along?soilOut:soilIn);
  const box=(lo,hi,a,b)=>along?{minX:lo,maxX:hi,minZ:a,maxZ:b}:{minX:a,maxX:b,minZ:lo,maxZ:hi};
  runs.push({owner:o.id,side,axis:s.axis,walled,gates:(o.gates?.[side]||[]).map(g=>[...g]),
   band:box(from,to,b0,b1),soil:box(soilFrom,soilTo,s0,s1),weedLine:s.at+s.out*(soilIn+(soilOut-soilIn)/2),ring:o.rect});
 }
 return runs;
}

/**
 * The open edges: along each side of every Kitahama lane, the stretches where the ground just outside is neither
 * paving, nor a plot's ring, nor a building, but the island's own level ground. There the gutter lies against the
 * paving's edge with the earth strip beyond it. Lanes running along x are laid first and take the corners.
 */
export function openEdgeRuns(rings=gutterRings()){
 const G=GUTTER,depth=G.width+G.soil,step=.1,patches=lanePatches().map(p=>{const xs=p.polygon.map(v=>v[0]),zs=p.polygon.map(v=>v[1]);return {poly:p.polygon,minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)};});
 const inPoly=(poly,x,z)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,zi]=poly[i],[xj,zj]=poly[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)inside=!inside;}return inside;};
 const paved=(x,z)=>patches.some(p=>x>=p.minX-1e-6&&x<=p.maxX+1e-6&&z>=p.minZ-1e-6&&z<=p.maxZ+1e-6&&inPoly(p.poly,x,z));
 const N=NEIGHBOURHOOD,taken=[],inside=(r,x,z,pad=0)=>x>=r.minX-pad&&x<=r.maxX+pad&&z>=r.minZ-pad&&z<=r.maxZ+pad;
 // A ring's own ground: from its plot's edge out to the paving. The plots themselves are solid, except the Heights'
 // garden, which runs right up to the lanes on its north and south and takes the open gutter there.
 const ringZones=rings.map(r=>{const z={...r.band};for(const b of [r.soil,r.ring])if(b){if(r.axis==='x'){z.minZ=Math.min(z.minZ,r.side==='north'?r.ring.maxZ:z.minZ);z.maxZ=Math.max(z.maxZ,r.side==='south'?r.ring.minZ:z.maxZ);}else{z.minX=Math.min(z.minX,r.side==='east'?r.ring.maxX:z.minX);z.maxX=Math.max(z.maxX,r.side==='west'?r.ring.minX:z.maxX);}}return z;});
 const school={minX:SCHOOL.minX-.9,maxX:SCHOOL.maxX+.9,minZ:SCHOOL.minZ,maxZ:SCHOOL.seawall.south+.6},solidPlots=TOWN_WALK_PLOTS.filter(p=>p.id!==KITAHAMA.apartment.id);
 const level=(x,z)=>inside(N,x,z)&&neighbourhoodHeight(x,z)===0&&!(x<=-24.6&&z<=29.3)&&!inside(school,x,z);
 const free=(x,z)=>!ringZones.some(r=>inside(r,x,z,.01))&&!solidPlots.some(p=>inside(p,x,z,.01))&&!taken.some(r=>inside(r,x,z,-.002));
 // The gutter needs its own ground; the earth strip beyond it only where there is room before other paving.
 const open=(x,z)=>level(x,z)&&!paved(x,z)&&free(x,z),room=(x,z)=>!level(x,z)||(!paved(x,z)&&free(x,z));
 const runs=[],lanes=[...KITAHAMA_LANES].sort((a,b)=>(b.maxX-b.minX>b.maxZ-b.minZ)-(a.maxX-a.minX>a.maxZ-a.minZ));
 for(const L of lanes){
  const alongX=L.maxX-L.minX>L.maxZ-L.minZ;
  for(const out of [-1,1]){
   const edge=alongX?(out<0?L.minZ:L.maxZ):(out<0?L.minX:L.maxX),from=alongX?L.minX:L.minZ,to=alongX?L.maxX:L.maxZ;
   const pt=(u,d)=>alongX?[u,edge+out*d]:[edge+out*d,u];
   let start=null,soilOK=true,soilReach=depth;
   const close=end=>{if(start!==null&&end-start>=.15){
     const box=(a,b,lo,hi)=>{const [c0,c1]=out>0?[edge+a,edge+b]:[edge-b,edge-a];return alongX?{minX:lo,maxX:hi,minZ:c0,maxZ:c1}:{minX:c0,maxX:c1,minZ:lo,maxZ:hi};};
     const run={owner:'lane',side:alongX?(out>0?'north':'south'):(out>0?'east':'west'),axis:alongX?'x':'z',walled:false,gates:[],
      band:box(0,G.width,start,end),soil:soilOK?box(G.width,Math.min(depth,soilReach),start,end):null,weedLine:edge+out*(G.width+G.soil/2),open:true};
     runs.push(run);taken.push(box(0,soilOK?Math.min(depth,soilReach):G.width,start,end));}
    start=null;};
   for(let u=from;u<to-1e-6;u+=step){
    const a=u,b=Math.min(to,u+step),along=[a+.01,(a+b)/2,b-.01],ok=[.05,.15].every(d=>along.every(v=>open(...pt(v,d))));
    // The earth strip goes as far as there is room, up to its 0.1 m, and is left out where there is less than 2 cm.
    const reach=ok?[.4,.38,.36,.34,.32].find(d=>along.every(v=>room(...pt(v,d-.01))))??0:0,soil=reach>=.32;
    if(soil)soilReach=start===null||!soilOK?reach:Math.min(soilReach,reach);
    if(ok&&start!==null&&soil!==soilOK){if(a-start>1)close(a);else soilOK=soilOK&&soil;}
    if(ok&&start===null){start=a;soilOK=soil;}if(!ok)close(a);if(ok&&b>=to-1e-6)close(b);
   }
  }
 }
 return runs;
}

/** The tyre lines: on the shared lanes vehicles use, two 0.3 m strips a kei truck's track apart. */
export const LANE_WEAR=Object.freeze([
 Object.freeze({lane:'cross lane',axis:'x',from:KITAHAMA.lane.minX+1,to:KITAHAMA.lane.maxX-1,at:(KITAHAMA.lane.minZ+KITAHAMA.lane.maxZ)/2}),
 Object.freeze({lane:'spine',axis:'x',from:KITAHAMA.spine.minX+1,to:KITAHAMA.spine.maxX-1,at:(KITAHAMA.spine.minZ+KITAHAMA.spine.maxZ)/2}),
]);
/** The stains, and what made each one. */
export const LANE_STAINS=Object.freeze([
 Object.freeze({x:11.6,z:61,r:.45,why:'fish boxes drip outside Kōji’s gate at 3 Kitahama'}),
 Object.freeze({x:-16,z:28.7,r:.5,why:'the rubbish point at the end of Well Lane, after collection'}),
]);

/** Lays every ring into the quarter's kit, and the weeds and the wear as their own meshes under `group`. */
export function buildLaneEdges(kit,group,{lots=[],stains=[]}={}){
 const rings=gutterRings(lots),G=GUTTER,runs=[...rings,...openEdgeRuns(rings)],r=rng(401),lidTints=[0xa3a198,0x9a988f,0xaaa89f,0x9f9c92];
 const tufts=[];
 for(const run of runs){
  const along=run.axis==='x',B=run.band,len=along?B.maxX-B.minX:B.maxZ-B.minZ,start=along?B.minX:B.minZ;
  const at=(u0,u1,v0,v1)=>along?[u0,u1,v0,v1]:[v0,v1,u0,u1];
  const [v0,v1]=along?[B.minZ,B.maxZ]:[B.minX,B.maxX];
  // The channel, dark, seen through the joints; the lids over it; a grating at every gate and every few lids.
  {const [x0,x1,z0,z1]=at(start,start+len,v0,v1);kit.block(x0,x1,.015,G.channel,z0,z1,0x46443f);}
  const n=Math.max(1,Math.round(len/G.lid)),step=len/n,gateMid=run.gates.map(([a,b])=>(a+b)/2);
  for(let i=0;i<n;i++){
   const u0=start+i*step+G.joint/2,u1=start+(i+1)*step-G.joint/2,mid=(u0+u1)/2;
   const grating=gateMid.some(g=>Math.abs(g-mid)<step/2)||(i%G.gratingEvery===3);
   const [x0,x1,z0,z1]=at(u0,u1,v0+.012,v1-.012);
   if(grating){
    kit.block(x0,x1,G.channel,G.top-.006,z0,z1,0x4d5154,'metal');
    for(let k=1;k<6;k++){const u=u0+(u1-u0)*k/6;const [a0,a1,c0,c1]=at(u-.012,u+.012,v0+.03,v1-.03);kit.block(a0,a1,G.top-.006,G.top,c0,c1,0x6a6f72,'metal');}
   }else kit.block(x0,x1,G.channel,G.top,z0,z1,lidTints[(i*7+Math.round(start*3))%lidTints.length]);
  }
  // The strip of earth, and the weeds out of it, except across a gate.
  const S=run.soil;if(!S)continue;kit.block(S.minX,S.maxX,.015,G.soilTop,S.minZ,S.maxZ,0x6f6048);
  const s0=along?S.minX:S.minZ,s1=along?S.maxX:S.maxZ;
  for(let u=s0+.08;u<s1-.05;u+=.16+r.next()*.12){
   if(run.gates.some(([a,b])=>u>a-.12&&u<b+.12))continue;
   const w=run.weedLine+(r.next()-.5)*.05,[x,z]=along?[u,w]:[w,u];
   tufts.push([x,z,.07+r.next()*(run.walled?.16:.1),r.next()]);
  }
 }
 const weeds=weedMesh(tufts);weeds.name='Kitahama lane-edge weeds';group.add(weeds);
 const wear=wearMesh([...LANE_STAINS,...stains]);group.add(...wear);
 return {runs,weeds,wear,tufts:tufts.length};
}

/** The weeds: low tufts of grass and the odd yellow-flowered one, one merged mesh kept off the walking surface. */
function weedMesh(tufts){
 const colour=new THREE.Color(),parts=[],palette=[0x5e8c3a,0x4f7d34,0x6f9a44,0x7a8f3e];
 const paint=(g,hex)=>{const out=g.index?g.toNonIndexed():g;out.deleteAttribute('uv');colour.set(hex);const n=out.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++)c.set([colour.r,colour.g,colour.b],i*3);out.setAttribute('color',new THREE.BufferAttribute(c,3));return out;};
 const blade=new THREE.ConeGeometry(.05,1,4,1,true).translate(0,.5,0);
 for(const [x,z,h,u] of tufts){
  for(let k=0;k<3;k++){const a=u*6+k*2.1,t=.18+k*.08;parts.push(paint(blade.clone().scale(1,h*(1-k*.18),1).rotateZ(Math.cos(a)*t).rotateX(Math.sin(a)*t).translate(x+Math.cos(a)*.03,GUTTER.soilTop,z+Math.sin(a)*.03),palette[(Math.floor(u*16)+k)%palette.length]));}
  if(u>.86){const f=new THREE.SphereGeometry(.022,5,3).translate(x,GUTTER.soilTop+h*.9,z);parts.push(paint(f,0xe8c73a));}
 }
 const geometry=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());blade.dispose();geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}));
 mesh.userData.walkSurface=false;mesh.receiveShadow=true;return mesh;
}

/** Tyre lines and stains: decals a few millimetres over the lane, offset so they never fight it. */
function wearMesh(stainList){
 const decal=opacity=>new THREE.MeshStandardMaterial({color:0x3a3730,roughness:1,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const y=.043,strips=[];
 for(const w of LANE_WEAR)for(const off of [-.62,.62]){
  // Broken where the wheels wander, so the line reads as wear and not as paint.
  const r=rng(Math.round(w.at*13+off*7));
  for(let u=w.from;u<w.to;){const len=2+r.next()*5,gap=r.next()<.3?.6+r.next()*1.5:0,end=Math.min(w.to,u+len);
   const g=new THREE.PlaneGeometry(end-u,.28+r.next()*.06).rotateX(-Math.PI/2).translate((u+end)/2,y,w.at+off+(r.next()-.5)*.08);strips.push(g);u=end+gap;}
 }
 const tracks=new THREE.Mesh(mergeGeometries(strips,false),decal(.07));tracks.name='Kitahama lane tyre wear';strips.forEach(g=>g.dispose());
 const blots=stainList.map((s,i)=>new THREE.CircleGeometry(1,14).scale(s.r,s.r*(.6+(i%3)*.15),1).rotateX(-Math.PI/2).rotateY(i*.7).translate(s.x,y+.001,s.z));
 const stains=new THREE.Mesh(mergeGeometries(blots,false),decal(.13));stains.name='Kitahama lane stains';blots.forEach(g=>g.dispose());
 for(const m of [tracks,stains]){m.receiveShadow=true;m.userData.walkSurface=false;m.renderOrder=1;}
 return [tracks,stains];
}
