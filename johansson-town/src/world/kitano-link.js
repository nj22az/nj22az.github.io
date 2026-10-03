import * as THREE from '../../vendor/three.module.js';
import {KITANO_ROAD,KITANO_BRIDGE,KITANO_ROAD_LENGTH,KITANO_ROAD_LANDS,KITANO_SHORE,KITANO_SURFACE_LIFT,roadPoint,roadHeight,leftOf} from './kitano-link-plan.js';
import {paintPatch,roadSign,stopMarking,ROAD_STANDARD} from './road-standards.js';
import {KITANO_STOP_S,CAR_PARK,carParkPoint,CAR_PARK_YAW} from './town-traffic.js';
import {AIRPORT_HEIGHT} from './airport-ground.js';
import {SEA_LEVEL} from './ocean.js';
import {beachHeight} from './beach-layout.js';

/**
 * Kitano Road and Kitano Bridge, built (the numbers are in kitano-link-plan.js).
 *
 *  - The road: asphalt carriageway with a white dashed centre line in town and a solid
 *    yellow one on the bridge (no overtaking), white edge line, a raised concrete footway
 *    with its kerb on the harbour side, the stop line and 止まれ where it meets Main Street,
 *    and zebra crossings across its mouth and on the lawn.
 *  - Past the walled garden it rises on an embankment between coral-stone retaining walls,
 *    then crosses the beach on a causeway faced in concrete with rock at its foot.
 *  - The bridge: a deck on twin girders, solid parapets with lamp posts, twin-column piers
 *    standing in the water on scour rock, and a longer navigation span at the crest.
 *  - On Kitano-jima it comes down a short ramp onto the district and ends in a car park.
 *
 * Top surfaces are ribbons laid along the centreline, so they follow its bends and its
 * long section; walls, girders and parapets are instanced box segments, one mesh each.
 */
const STEP=.5;
/** The road is laid as an apron over whatever it crosses, so the lawn's grass never shows through. */
const LIFT=KITANO_SURFACE_LIFT;
const C={asphalt:0x5f6366,footway:0xbab4a6,kerb:0xd3cec2,coral:0xd9cfb3,concrete:0xcfcbc0,girder:0xbcb8ad,pier:0xc4c0b5,rock:0x8f8a80,lampPost:0x9aa3a6,lamp:0xfff3d0,yellow:0xe8b923,carPark:0x666a6c};

function frameAt(s){const [x,z,hx,hz]=roadPoint(s),[lx,lz]=leftOf(hx,hz);return {x,z,hx,hz,lx,lz,y:roadHeight(s)};}

export function buildKitanoLink({parent,colliders=null,shadows=false}){
 const group=new THREE.Group();group.name='Kitano Road and Kitano Bridge';parent.add(group);
 const mat=new Map(),material=(c,o={})=>{const k=c+JSON.stringify(o);if(!mat.has(k))mat.set(k,new THREE.MeshStandardMaterial({color:c,roughness:.92,...o}));return mat.get(k);};
 const S=KITANO_ROAD.section,end=KITANO_ROAD_LENGTH,bridgeFrom=KITANO_SHORE.beachFoot,bridgeTo=KITANO_SHORE.district;

 // ---- Running surfaces: ribbons across o0..o1 from s0 to s1, at the road's height plus lift. ----
 const ribbons=new Map();
 function ribbon(o0,o1,s0,s1,lift,colour){
  const list=ribbons.get(colour)??[];ribbons.set(colour,list);
  for(let s=s0;s<s1-1e-6;s+=STEP){
   const a=frameAt(s),b=frameAt(Math.min(s1,s+STEP));
   const p=(f,o)=>[f.x+f.lx*o,f.y+lift,f.z+f.lz*o];
   const A=p(a,o0),B=p(a,o1),Cc=p(b,o1),D=p(b,o0);
   list.push(...A,...D,...Cc,...A,...Cc,...B);
  }
 }
 const footFrom=5.7;// the footway starts at the dining lane's edge; across it the pavement is dropped flush
 ribbon(S.north,-S.carriageway,0,end,LIFT,C.kerb);
 ribbon(-S.carriageway,S.carriageway,0,end,LIFT,C.asphalt);
 ribbon(S.carriageway,S.footway,footFrom,end,LIFT+S.kerb,C.footway);
 for(const [colour,list] of ribbons){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(list,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,material(colour,{side:THREE.DoubleSide}));m.receiveShadow=true;m.name=colour===C.asphalt?'Kitano Road carriageway':colour===C.footway?'Kitano Road footway':'Kitano Road gutter';group.add(m);
 }

 // ---- Boxes along the road: one instanced mesh per material. ----
 const boxes=new Map();
 /** A segment from s to s+len, centred at offset o, from y0 to y1 (absolute), t thick. */
 function seg(colour,s,len,o,t,y0,y1){
  if(y1-y0<.01)return;
  const a=frameAt(s),b=frameAt(Math.min(end,s+len)),mid=frameAt(Math.min(end,s+len/2));
  const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||len;
  (boxes.get(colour)??boxes.set(colour,[]).get(colour)).push({x:mid.x+mid.lx*o,z:mid.z+mid.lz*o,y:(y0+y1)/2,len:l*1.03,t,h:y1-y0,yaw:Math.atan2(dx,dz),pitch:Math.atan2(b.y-a.y,l)});
 }
 const ground=(x,z)=>{const b=beachHeight(x,z);return b??0;};
 const seabed=SEA_LEVEL-2.2;
 // Kerb face along the footway.
 for(let s=footFrom;s<end;s+=STEP){const f=frameAt(s+STEP/2);seg(C.kerb,s,STEP,S.carriageway+.06,.12,f.y,f.y+LIFT+S.kerb+.01);}
 // Embankment, causeway and district ramp: retaining walls from the ground up to a parapet.
 const riseFrom=KITANO_ROAD.profile.riseFrom;
 for(let s=riseFrom;s<KITANO_ROAD_LANDS;s+=1){
  if(s>=bridgeFrom-.5&&s<bridgeTo)continue;
  const f=frameAt(s+.5),over=f.y-(s>=bridgeTo?AIRPORT_HEIGHT:0);if(over<.04)continue;
  const coral=f.x<33.4,colour=coral?C.coral:C.concrete,rail=over<.25?.12+over*2.92:.85;
  for(const [o,top] of [[S.north-S.parapet/2,f.y+rail],[S.footway+S.parapet/2,f.y+S.kerb+rail]]){
   const x=f.x+f.lx*o,z=f.z+f.lz*o,base=(s>=bridgeTo?AIRPORT_HEIGHT:ground(x,z))-.35;
   seg(colour,s,1,o,S.parapet,base,top);
  }
  // Between the walls the fill shows only at the ends; the deck covers it.
  if(!coral&&s<bridgeTo){for(const o of [S.north-S.parapet-.4,S.footway+S.parapet+.4]){
   const x=f.x+f.lx*o,z=f.z+f.lz*o,g=ground(x,z);seg(C.rock,s,1,o,.8,g-.4,g+.3);
   colliders?.push({id:'kitano-causeway-rock',x,z,w:.8,d:1.05,yaw:Math.atan2(f.hx,f.hz),height:g+.6});
  }}
 }
 // The bridge itself, from the beach's foot to the district's edge.
 const piers=[bridgeFrom,53.5,58.5,68,73,78,82.4,bridgeTo];
 for(let s=bridgeFrom;s<bridgeTo;s+=1){
  const f=frameAt(s+.5),len=Math.min(1,bridgeTo-s);
  seg(C.concrete,s,len,(S.north+S.footway)/2,S.footway-S.north+2*S.parapet,f.y-.38,f.y-.01);// deck slab
  for(const o of [-1.2,2.4])seg(C.girder,s,len,o,.55,f.y-KITANO_ROAD.deckDepth,f.y-.37);// twin girders
  seg(C.concrete,s,len,S.north-S.parapet/2,S.parapet,f.y-.38,f.y+.95);// parapets
  seg(C.concrete,s,len,S.footway+S.parapet/2,S.parapet,f.y-.38,f.y+S.kerb+.95);
 }
 const pierMeshes=[];
 for(const s of piers){
  const f=frameAt(s),soffit=f.y-KITANO_ROAD.deckDepth;
  seg(C.pier,s-.45,.9,(S.north+S.footway)/2,S.footway-S.north+.6,soffit-.45,soffit);// pier cap
  for(const o of [-1.2,2.4]){
   const x=f.x+f.lx*o,z=f.z+f.lz*o;
   pierMeshes.push({x,z,y0:seabed,y1:soffit-.4});
  }
 }
 const pierGeo=new THREE.CylinderGeometry(.42,.48,1,14);
 const pierMesh=new THREE.InstancedMesh(pierGeo,material(C.pier),pierMeshes.length);pierMesh.name='Kitano Bridge piers';
 const d=new THREE.Object3D();
 pierMeshes.forEach((p,i)=>{d.position.set(p.x,(p.y0+p.y1)/2,p.z);d.rotation.set(0,0,0);d.scale.set(1,p.y1-p.y0,1);d.updateMatrix();pierMesh.setMatrixAt(i,d.matrix);});
 pierMesh.castShadow=shadows;group.add(pierMesh);
 // Scour rock round each pier's foot, breaking the surface.
 const rocks=[];let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(const p of pierMeshes)for(let k=0;k<7;k++){const a=k/7*Math.PI*2+rnd(),r=.75+rnd()*.35;rocks.push([p.x+Math.cos(a)*r,SEA_LEVEL-.05+rnd()*.15,p.z+Math.sin(a)*r,.32+rnd()*.18,rnd()*6]);}
 const rockMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),material(C.rock),rocks.length);rockMesh.name='Kitano Bridge scour rock';
 rocks.forEach(([x,y,z,k,r],i)=>{d.position.set(x,y,z);d.rotation.set(r,r*1.7,0);d.scale.set(k,k*.6,k);d.updateMatrix();rockMesh.setMatrixAt(i,d.matrix);});
 group.add(rockMesh);
 for(const [colour,list] of boxes){
  const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material(colour),list.length);
  // Each segment leans with the road's gradient, so tops run smooth rather than in steps.
  list.forEach((b,i)=>{d.position.set(b.x,b.y,b.z);d.rotation.order='YXZ';d.rotation.set(-b.pitch,b.yaw,0);d.scale.set(b.t,b.h,b.len);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});
  d.rotation.order='XYZ';
  mesh.castShadow=shadows&&colour!==C.kerb;mesh.receiveShadow=true;mesh.name='Kitano '+({[C.coral]:'retaining wall',[C.concrete]:'concrete',[C.girder]:'girders',[C.rock]:'causeway rock',[C.kerb]:'kerb',[C.pier]:'pier caps'}[colour]||'structure');
  mesh.userData.walkSurface=false;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();group.add(mesh);
 }
 // Lamp posts on the north parapet across the water, heads glowing a little at dusk.
 const lampPosts=[],lampHeads=[];
 for(let s=bridgeFrom+3;s<bridgeTo;s+=11){const f=frameAt(s),o=S.north-S.parapet/2;lampPosts.push([f.x+f.lx*o,f.y+.95,f.z+f.lz*o]);lampHeads.push([f.x+f.lx*(o+.7),f.y+5.1,f.z+f.lz*(o+.7),Math.atan2(f.hx,f.hz)]);}
 const postMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.09,4.3,8),material(C.lampPost,{metalness:.3,roughness:.5}),lampPosts.length);postMesh.name='Kitano Bridge lamp posts';
 lampPosts.forEach(([x,y,z],i)=>{d.position.set(x,y+2.15,z);d.rotation.set(0,0,0);d.scale.set(1,1,1);d.updateMatrix();postMesh.setMatrixAt(i,d.matrix);});group.add(postMesh);
 const headMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,.12,1.5),new THREE.MeshStandardMaterial({color:C.lampPost,emissive:C.lamp,emissiveIntensity:.25,roughness:.4}),lampHeads.length);headMesh.name='Kitano Bridge lamps';
 lampHeads.forEach(([x,y,z,ry],i)=>{d.position.set(x,y,z);d.rotation.set(0,ry+Math.PI/2,0);d.updateMatrix();headMesh.setMatrixAt(i,d.matrix);});group.add(headMesh);
 for(const m of [pierMesh,rockMesh,postMesh,headMesh]){m.userData.walkSurface=false;m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();}

 // ---- Markings. ----
 const marks=new THREE.Group();marks.name='Kitano Road markings';group.add(marks);
 const paint=new THREE.MeshBasicMaterial({color:ROAD_STANDARD.paint,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const yellow=new THREE.MeshBasicMaterial({color:C.yellow,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const dashes=[],solidY=[],edge=[];
 for(let s=KITANO_STOP_S+1;s<end-.5;s+=.5){
  const onBridge=s>bridgeFrom-6&&s<bridgeTo+4;
  if(onBridge)solidY.push(s);else if(Math.floor(s/2)%3!==2&&s>KITANO_STOP_S+3)dashes.push(s);
  if(s>13)edge.push(s);
 }
 const strip=(list,material,o,w,name)=>{
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(w,.52).rotateX(-Math.PI/2),material,list.length);
  list.forEach((s,i)=>{const f=frameAt(s+.25),g=frameAt(s+.5),a=frameAt(s);const pitch=Math.atan2(g.y-a.y,.5);d.position.set(f.x+f.lx*o,f.y+LIFT+.012,f.z+f.lz*o);d.rotation.set(0,Math.atan2(f.hx,f.hz),0);d.rotateX(-pitch);d.scale.set(1,1,1);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});
  mesh.name=name;mesh.renderOrder=1;mesh.raycast=()=>{};mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();marks.add(mesh);
 };
 strip(dashes,paint,0,.15,'Centre line (white, dashed)');
 strip(solidY,yellow,0,.15,'Centre line (yellow: no overtaking)');
 strip(edge,paint,S.north+.25,.15,'Kitano Road edge line');
 // Westbound: the stop line and 止まれ before the zebra across the mouth.
 {const f=frameAt(KITANO_STOP_S),o=-KITANO_ROAD.lane/2;stopMarking(marks,{x:f.x+f.lx*o,z:f.z+f.lz*o,y:f.y+LIFT,width:KITANO_ROAD.lane,ry:Math.atan2(f.hx,f.hz)+Math.PI});}
 // Zebras: across the mouth on the dining lane, and on the lawn where the paths cross.
 for(const s of [3,17.5]){
  const f=frameAt(s),{bar,gap,length}=ROAD_STANDARD.zebra,n=Math.floor((2*S.carriageway-gap)/(bar+gap));
  for(let i=0;i<n;i++){const o=-S.carriageway+gap+bar/2+i*(bar+gap)+((2*S.carriageway-gap)-(n*(bar+gap)))/2;paintPatch(marks,bar,length,f.x+f.lx*o,f.y+LIFT+.004,f.z+f.lz*o,Math.atan2(f.hx,f.hz)+Math.PI,'Zebra bar');}
  if(s>10)for(const o of [S.north-.35,S.footway+.2]){const x=f.x+f.lx*o+f.hx*1.9,z=f.z+f.lz*o+f.hz*1.9;roadSign(group,'crossing',{x,z,y:f.y,ry:Math.atan2(f.hx,f.hz)+Math.PI,colliders});}
 }
 // The stop sign, on the westbound driver's left.
 {const f=frameAt(KITANO_STOP_S+.4),o=S.north-.15;roadSign(group,'stop',{x:f.x+f.lx*o,z:f.z+f.lz*o,y:f.y,ry:Math.atan2(f.hx,f.hz),colliders});}

 // ---- Names and directions. ----
 const plate=(text,sub,x,y,z,ry,w=1.6,colour='#1f5aa8')=>{
  if(typeof document==='undefined'||!document.createElement)return;
  const c=document.createElement('canvas');c.width=512;c.height=sub?224:160;const ctx=c.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#f4f1e8';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=colour;ctx.fillRect(8,8,c.width-16,c.height-16);
  ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 64px sans-serif';ctx.fillText(text,256,sub?78:80,480);
  if(sub){ctx.font='bold 40px sans-serif';ctx.fillText(sub,256,160,480);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*c.height/512),new THREE.MeshStandardMaterial({map:t,roughness:.6,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;m.name='Sign: '+text;group.add(m);
 };
 // A guide sign at the junction, facing Main Street, and the bridge's name plates.
 {const x=5.15,z=6.45;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,3.1,8),material(C.lampPost,{metalness:.3,roughness:.5}));post.position.set(x,1.55,z);group.add(post);
  plate('Kitano Road','Airport · Kitano-jima →',x-.05,2.75,z,-Math.PI/2,1.5);colliders?.push({id:'road-sign',x,z,w:.12,d:.12,height:3.1});}
 // Name plates on the parapet ends, each facing the traffic coming onto the bridge.
 for(const [s,toward] of [[bridgeFrom-.6,-1],[bridgeTo+.6,1]]){const f=frameAt(s),o=S.north-S.parapet/2,x=f.x+f.lx*o,z=f.z+f.lz*o;plate('Kitano Bridge','Opened 1997 · 38 m',x,f.y+1.35,z,Math.atan2(toward*f.hx,toward*f.hz),.9,'#5d6468');}

 // ---- The airport car park at the road's end. ----
 {
  const P=CAR_PARK,y=AIRPORT_HEIGHT+.015,[cx,cz]=carParkPoint((P.minA+P.maxA)/2,0);
  const slab=new THREE.Mesh(new THREE.PlaneGeometry(2*P.halfB,P.maxA-P.minA).rotateX(-Math.PI/2),material(C.carPark));
  slab.position.set(cx,y,cz);slab.rotation.y=CAR_PARK_YAW;slab.receiveShadow=true;slab.name='Airport car park';group.add(slab);
  // Parallel bays along both long sides: a kerb-side line with a short tick at each bay's ends.
  for(const side of [-1,1]){const [x,z]=carParkPoint(11.5,side*(P.halfB-2.6));paintPatch(marks,.12,19,x,y,z,CAR_PARK_YAW,'Bay edge line');}
  for(const [a,b] of P.bays){
   for(const da of [-2.2,2.2]){const [x,z]=carParkPoint(a+da,b);paintPatch(marks,1.9,.12,x,y,z,CAR_PARK_YAW,'Bay line');}
  }
  const [sx,sz]=carParkPoint(P.minA+.4,-P.halfB-.4);
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.6,8),material(C.lampPost,{metalness:.3,roughness:.5}));post.position.set(sx,AIRPORT_HEIGHT+1.3,sz);group.add(post);
  plate('P','Car park · Terminal A',sx,AIRPORT_HEIGHT+2.35,sz,CAR_PARK_YAW+Math.PI,.9);
  colliders?.push({id:'road-sign',x:sx,z:sz,w:.12,d:.12,height:AIRPORT_HEIGHT+2.8});
 }
 return {group,piers,bridge:{from:bridgeFrom,to:bridgeTo}};
}
