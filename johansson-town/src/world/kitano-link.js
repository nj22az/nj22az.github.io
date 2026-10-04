import * as THREE from '../../vendor/three.module.js';
import {KITANO_ROAD,KITANO_ROAD_LENGTH,KITANO_SURFACE_LIFT,roadPoint,roadHeight,leftOf} from './kitano-link-plan.js';
import {paintPatch,roadSign,stopMarking,ROAD_STANDARD} from './road-standards.js';
import {KITANO_STOP_S} from './town-traffic.js';

/** Mainland lane and footway. The former airport bridge and all its supports are removed. */
const STEP=.5;
/** The road is laid as an apron over whatever it crosses, so the lawn's grass never shows through. */
const LIFT=KITANO_SURFACE_LIFT;
const C={asphalt:0x5f6366,footway:0xbab4a6,kerb:0xd3cec2,coral:0xd9cfb3,concrete:0xcfcbc0,girder:0xbcb8ad,pier:0xc4c0b5,rock:0x8f8a80,lampPost:0x9aa3a6,lamp:0xfff3d0,yellow:0xe8b923,carPark:0x666a6c};

function frameAt(s){const [x,z,hx,hz]=roadPoint(s),[lx,lz]=leftOf(hx,hz);return {x,z,hx,hz,lx,lz,y:roadHeight(s)};}

export function buildKitanoLink({parent,colliders=null,shadows=false}){
 const group=new THREE.Group();group.name='Kitano mainland access lane';parent.add(group);
 const mat=new Map(),material=(c,o={})=>{const k=c+JSON.stringify(o);if(!mat.has(k))mat.set(k,new THREE.MeshStandardMaterial({color:c,roughness:.92,...o}));return mat.get(k);};
 const S=KITANO_ROAD.section,end=KITANO_ROAD_LENGTH;

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
 // Kerb face along the footway.
 for(let s=footFrom;s<end;s+=STEP){const f=frameAt(s+STEP/2);seg(C.kerb,s,STEP,S.carriageway+.06,.12,f.y,f.y+LIFT+S.kerb+.01);}
 const d=new THREE.Object3D();
 for(const [colour,list] of boxes){
  const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material(colour),list.length);
  // Each segment leans with the road's gradient, so tops run smooth rather than in steps.
  list.forEach((b,i)=>{d.position.set(b.x,b.y,b.z);d.rotation.order='YXZ';d.rotation.set(-b.pitch,b.yaw,0);d.scale.set(b.t,b.h,b.len);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});
  d.rotation.order='XYZ';
  mesh.castShadow=shadows&&colour!==C.kerb;mesh.receiveShadow=true;mesh.name='Kitano '+({[C.coral]:'retaining wall',[C.concrete]:'concrete',[C.girder]:'girders',[C.rock]:'causeway rock',[C.kerb]:'kerb',[C.pier]:'pier caps'}[colour]||'structure');
  mesh.userData.walkSurface=false;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();group.add(mesh);
 }
 // ---- Markings. ----
 const marks=new THREE.Group();marks.name='Kitano Road markings';group.add(marks);
 const paint=new THREE.MeshBasicMaterial({color:ROAD_STANDARD.paint,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const yellow=new THREE.MeshBasicMaterial({color:C.yellow,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const dashes=[],solidY=[],edge=[];
 for(let s=KITANO_STOP_S+1;s<end-.5;s+=.5){
  const onBridge=false;
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
  plate('East lawn','Airport ferry · Harbour ↓',x-.05,2.75,z,-Math.PI/2,1.5);colliders?.push({id:'road-sign',x,z,w:.12,d:.12,height:3.1});}
 return {group,piers:[],bridge:null};
}
