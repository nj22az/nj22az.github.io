import * as THREE from '../../../johansson-town/vendor/three.module.js';
import {mergeGeometries} from '../../../johansson-town/vendor/BufferGeometryUtils.js';
import {normalizeRecipe} from './recipe.js';
import {drawFace,faceLayout} from './face.js';
import {headProfile,shapeHeadPoint} from './head-profile.js';
import {celFrom} from './cel.js';

/**
 * Builds a Shimanchu from a recipe.
 *
 * The body is one skinned mesh: every part -- torso, limbs, shoes, hair -- is a
 * simple rounded shape painted with vertex colour and bound rigidly to one bone, so the
 * whole person is a single draw call and moves like a jointed toy, which is the look.
 * The head is the second draw call: a sphere whose front carries the painted face. The
 * hat is the last range of the body, so it can be taken off and hung up.
 *
 * The head is roughly a quarter of the height, with an authored silhouette. The same
 * skeleton and measurements drive walking, seats, clothing and held objects.
 *
 * The body faces +z; the root is turned to face -z, the way the town's characters do.
 */
export const BONES=Object.freeze(['root','hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR']);
const BI=Object.fromEntries(BONES.map((n,i)=>[n,i]));

/** Every measurement of a body, from its recipe. Pure, for tests and the seat maths. */
export function measure(recipe){
 const r=normalizeRecipe(recipe);
 const H=1.36+r.body.height*.44,k=H/1.6,build=r.body.build;
 const profile=headProfile(r.head),Rh=(.19+r.head.size*.055)*k,headSX=profile.width,headSY=profile.height;
 const neck=.065*k,body=H-Rh*2*headSY-neck;
 const leg=body*.5,torso=body-leg;
 const foot=.07*k,thigh=(leg-foot)*.5,shin=thigh;
 const legR=(.058+build*.024)*k,armR=(.045+build*.016)*k;
 const width=(.3+build*.15)*k,depth=(.2+build*.09)*k;
 const upper=.22*k,fore=.2*k,hand=.052*k;
 const hipY=leg,chestY=hipY+torso*.5,neckY=hipY+torso,headY=neckY+neck;
 return {H,k,Rh,headSX,headSY,profile,neck,torso,leg,foot,thigh,shin,legR,armR,width,depth,upper,fore,hand,hipY,chestY,neckY,headY,
  // The arm hangs from just inside the torso's edge, below its top, so the shoulder
  // rounds over it instead of the arm standing clear of the body.
  headCentre:headY+Rh*headSY*.94,shoulderX:width/2-armR*.2,shoulderY:neckY-.075*k,hipX:width*.24,
  /** How far below the hip joint the backs of the thighs are when sitting. */
  seatDrop:legR*.95};
}

/** Where each bone stands at rest, in model space. */
function restPositions(m){
 return {
  root:[0,0,0],hips:[0,m.hipY,0],spine:[0,m.hipY+m.torso*.25,0],chest:[0,m.chestY,0],neck:[0,m.neckY,0],head:[0,m.headY,0],
  shoulderL:[m.shoulderX,m.shoulderY,0],elbowL:[m.shoulderX+.01,m.shoulderY-m.upper,0],handL:[m.shoulderX+.015,m.shoulderY-m.upper-m.fore,0],
  shoulderR:[-m.shoulderX,m.shoulderY,0],elbowR:[-m.shoulderX-.01,m.shoulderY-m.upper,0],handR:[-m.shoulderX-.015,m.shoulderY-m.upper-m.fore,0],
  thighL:[m.hipX,m.hipY,0],kneeL:[m.hipX,m.hipY-m.thigh,0],footL:[m.hipX,m.foot,0],
  thighR:[-m.hipX,m.hipY,0],kneeR:[-m.hipX,m.hipY-m.thigh,0],footR:[-m.hipX,m.foot,0],
 };
}
const PARENT={hips:'root',spine:'hips',chest:'spine',neck:'chest',head:'neck',shoulderL:'chest',elbowL:'shoulderL',handL:'elbowL',shoulderR:'chest',elbowR:'shoulderR',handR:'elbowR',thighL:'hips',kneeL:'thighL',footL:'kneeL',thighR:'hips',kneeR:'thighR',footR:'kneeR'};

const tmpColour=new THREE.Color();
/** A five-petal flower and a dot, the prints a shirt can carry. */
const FLOWER=(()=>{const sh=new THREE.Shape();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=.55+.45*Math.abs(Math.cos(a*2.5));const x=Math.cos(a)*r,y=Math.sin(a)*r;i?sh.lineTo(x,y):sh.moveTo(x,y);}const g=new THREE.ShapeGeometry(sh);g.userData.keep=true;return g;})();
const DOT=(()=>{const g=new THREE.CircleGeometry(1,10);g.userData.keep=true;return g;})();
/** The torso lathe's radius at a fraction of its height. */
function latheRadius(prof,t){for(let i=1;i<prof.length;i++){const [r0,y0]=prof[i-1],[r1,y1]=prof[i];if(t<=y1)return r0+(r1-r0)*((t-y0)/((y1-y0)||1));}return prof.at(-1)[0];}
/**
 * A part: geometry in model space, painted, bound to one bone -- or, for a limb, shared
 * between bones by a function of where each vertex is, so a joint bends as one soft piece.
 */
function part(list,geometry,bone,hex,matrix){
 let g=geometry.index?geometry.toNonIndexed():geometry.clone();
 for(const key of Object.keys(g.attributes))if(!['position','normal'].includes(key))g.deleteAttribute(key);
 if(matrix)g.applyMatrix4(matrix);
 const n=g.attributes.position.count,colours=new Float32Array(n*3),index=new Uint16Array(n*4),weight=new Float32Array(n*4);
 const paint=typeof hex==='function'?hex:null,share=typeof bone==='function'?bone:null;
 if(!paint)tmpColour.set(hex);
 const p=new THREE.Vector3();
 const a=new THREE.Vector3(),b=new THREE.Vector3();
 for(let i=0;i<n;i++){
  // Painted per triangle, from its centre: a colour boundary is a clean edge between
  // two faces rather than a smear across one.
  if(paint&&i%3===0){const P=g.attributes.position;p.fromBufferAttribute(P,i);a.fromBufferAttribute(P,i+1);b.fromBufferAttribute(P,i+2);p.add(a).add(b).multiplyScalar(1/3);tmpColour.set(paint(p));}
  colours[i*3]=tmpColour.r;colours[i*3+1]=tmpColour.g;colours[i*3+2]=tmpColour.b;
  if(!share){index[i*4]=BI[bone];weight[i*4]=1;continue;}
  p.fromBufferAttribute(g.attributes.position,i);
  const w=share(p).filter(([,x])=>x>1e-3).slice(0,4),sum=w.reduce((t,[,x])=>t+x,0)||1;
  w.forEach(([name,x],k)=>{index[i*4+k]=BI[name];weight[i*4+k]=x/sum;});
 }
 g.setAttribute('color',new THREE.BufferAttribute(colours,3));
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(index,4));
 g.setAttribute('skinWeight',new THREE.BufferAttribute(weight,4));
 list.push(g);
 if(geometry!==g&&!geometry.userData?.keep)geometry.dispose?.();
 return g;
}
const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
/** A tube from a to b of radius r, capped round. */
function tube(list,a,b,r,bone,hex,segments=10){
 const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),len=d.length();
 const g=new THREE.CapsuleGeometry(r,Math.max(.001,len),3,segments);
 const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
 part(list,g,bone,hex,new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,new THREE.Vector3(1,1,1)));
}
/**
 * A limb: one capsule from a to b, tapering from r0 to r1, its skin shared between the
 * bones along it. `joints` are [t, from, to] -- at t (0 at a, 1 at b) the skin passes
 * from one bone to the next over a soft band -- and `root` lends the top of the limb to
 * the body, so a shoulder or hip rounds off instead of hinging on a seam.
 */
function limb(list,a,b,r0,r1,hex,{bone,joints=[],root=null,soft=.13,segments=14}={}){
 const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),len=d.length(),dir=d.clone().normalize();
 // A capsule with rings all along it (three's own has none between its caps), so the
 // skin has somewhere to bend.
 const prof=[],cap=5,rows=12;
 for(let i=0;i<=cap;i++){const a=-Math.PI/2+i/cap*Math.PI/2;prof.push(new THREE.Vector2(Math.cos(a)*r0,-len/2+Math.sin(a)*r0));}
 for(let i=1;i<rows;i++)prof.push(new THREE.Vector2(r0,-len/2+i/rows*len));
 for(let i=0;i<=cap;i++){const a=i/cap*Math.PI/2;prof.push(new THREE.Vector2(Math.cos(a)*r0,len/2+Math.sin(a)*r0));}
 prof[0].x=prof.at(-1).x=0;
 const g=new THREE.LatheGeometry(prof,segments),pos=g.attributes.position;
 for(let i=0;i<pos.count;i++){
  const y=pos.getY(i),t=THREE.MathUtils.clamp(.5-y/len,0,1),k=THREE.MathUtils.lerp(r0,r1,t)/r0;
  pos.setXYZ(i,pos.getX(i)*k,y+(y>len/2?0:y<-len/2?(y+len/2)*(k-1):0),pos.getZ(i)*k);
 }
 // The lathe's own normals are kept: recomputing them would crease its seam.
 // Capsules run along +y; this one runs from a down to b.
 const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),dir);
 const rel=new THREE.Vector3();
 const share=p=>{
  const t=rel.copy(p).sub(A).dot(dir)/len;
  let out=[[bone,1]];
  for(const [tj,from,to] of joints){const w=THREE.MathUtils.smoothstep(t,tj-soft,tj+soft);out=out.flatMap(([n,x])=>n===from?[[from,x*(1-w)],[to,x*w]]:[[n,x]]);}
  if(root){const w=root[1]*(1-THREE.MathUtils.smoothstep(t,-.04,root[2]??.2));out=out.map(([n,x])=>[n,x*(1-w)]);out.push([root[0],w]);}
  return out;
 };
 part(list,g,share,hex,new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,new THREE.Vector3(1,1,1)));
}
const ball=(list,r,at,bone,hex,s=[1,1,1],w=12,h=8)=>part(list,new THREE.SphereGeometry(r,w,h),bone,hex,M(at[0],at[1],at[2],0,0,0,...s));

/**
 * Hair, as a cap over the head that stops where the face and neck begin. The cap is a
 * sphere a little bigger than the head; anywhere the style leaves bare is pulled back
 * inside the head, so the hairline is wherever the style says it is.
 */
const HAIR=Object.freeze({
 crop:{front:.46,side:.02,back:-.5,radius:1.07,faceHalf:.78},
 sidepart:{front:.4,swoop:.28,side:0,back:-.5,radius:1.08,faceHalf:.78},
 bob:{front:.24,side:-.62,back:-.66,radius:1.12,faceHalf:.64},
 long:{front:.3,side:-.62,back:-.7,radius:1.11,faceHalf:.64},
 ponytail:{front:.44,side:.02,back:-.25,radius:1.08,faceHalf:.78},
 braids:{front:.4,swoop:.26,side:-.12,back:-.6,radius:1.08,faceHalf:.74},
 bun:{front:.46,side:.02,back:-.32,radius:1.07,faceHalf:.78},
 spiky:{front:.5,side:.05,back:-.34,radius:1.08,faceHalf:.78},
 perm:{front:.42,side:-.12,back:-.44,radius:1.15,faceHalf:.74,bumps:true},
 buzz:{front:.52,side:.06,back:-.36,radius:1.025,faceHalf:.8},
 afro:{front:.48,side:-.12,back:-.5,radius:1.34,faceHalf:.74,lift:.18},
 horseshoe:{ring:true,radius:1.03},
 bald:null,
});
function hairCap(style,flip){
 const spec=HAIR[style];if(!spec)return null;
 if(spec.ring)return hairRing(spec);
 const g=new THREE.SphereGeometry(1,64,44),pos=g.attributes.position,v=new THREE.Vector3();
 const side=flip?-1:1;
 for(let i=0;i<pos.count;i++){
  v.fromBufferAttribute(pos,i);
  // The fringe: straight across, or swept down to one side from a parting.
  let front=spec.front;
  if(spec.swoop)front-=spec.swoop*THREE.MathUtils.smoothstep(v.x*side,-.3,.5);
  // How far this point is inside the hair (positive) or out of it (negative): outside the
  // face opening and above the line at the sides and back. A smooth field rather than a
  // yes/no, so the hairline is a clean curve where the cap meets the head, not stair steps.
  const outFace=Math.max(.18-v.z,Math.abs(v.x)-spec.faceHalf,v.y-front);
  const low=THREE.MathUtils.lerp(spec.side,spec.back,THREE.MathUtils.smoothstep(-v.z,-.2,.7));
  const f=Math.min(outFace,v.y-low),keep=f>0;
  // Bare scalp is tucked just inside the head; a close crop needs only a short step.
  const full=spec.radius*(1+(spec.lift&&v.y>0?v.y*spec.lift:0)),inner=spec.radius<1.04?.985:.8;
  const r=THREE.MathUtils.lerp(inner,full,THREE.MathUtils.smoothstep(f,-.035,.035));
  pos.setXYZ(i,v.x*r,v.y*r+(spec.lift&&keep?spec.lift*.25:0),v.z*r);
 }
 g.computeVertexNormals();
 return g;
}

/**
 * A horseshoe: a band round the back of the head and over the ears, open at the face,
 * rising a little behind. Built as its own strip so both edges stay clean.
 */
function hairRing(spec){
 const open=.95,W=48,g=new THREE.SphereGeometry(spec.radius,W,8,Math.PI/2+open,Math.PI*2-open*2,.1,1);
 const pos=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<pos.count;i++){
  // Around from the vertex's column. (thetaStart is above zero because a sphere
  // starting at its pole leaves out half the triangles of its top row.)
  const u=(i%(W+1))/W,phi=Math.PI/2+open+u*(Math.PI*2-open*2),back=THREE.MathUtils.smoothstep(-Math.sin(phi),-.3,1);
  // Top edge from just above the ears at the front to higher behind; bottom at the nape.
  const top=Math.acos(.1+back*.2),bottom=Math.acos(-.42-back*.12),theta=top+(1-uv.getY(i))*(bottom-top);
  const ends=THREE.MathUtils.smoothstep(Math.min(u,1-u),0,.08);
  const t=THREE.MathUtils.lerp(bottom-.12,theta,.35+.65*ends);
  pos.setXYZ(i,-Math.cos(phi)*Math.sin(t)*spec.radius,Math.cos(t)*spec.radius,Math.sin(phi)*Math.sin(t)*spec.radius);
 }
 g.computeVertexNormals();
 return g;
}

function addHair(list,recipe,m){
 const c=recipe.hair.colour,style=recipe.hair.style,side=recipe.hair.flip?-1:1;
 const R=m.Rh,cx=0,cy=m.headCentre-m.headY,S=[m.headSX*R,m.headSY*R,R*.98];
 // Hair and hat are built in head-bone space, then carried to model space.
 const at=(x,y,z)=>[x,m.headY+y,z];
 const cap=hairCap(style,recipe.hair.flip);
 if(cap){const p=cap.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);shapeHeadPoint(v,m.profile);p.setXYZ(i,v.x,v.y,v.z);}cap.computeVertexNormals();part(list,cap,'head',c,M(cx,m.headY+cy,0,0,0,0,...S));}
 const dark=new THREE.Color(c).multiplyScalar(.82).getStyle();
 if(style==='long'){ball(list,R*.95,at(0,cy-R*.72,-R*.55),'head',c,[1.05,1.25,.5]);}
 if(style==='ponytail'){ball(list,R*.34,at(0,cy+R*.1,-R*1.05),'head',c,[1,1,1]);ball(list,R*.3,at(0,cy-R*.45,-R*1.18),'head',c,[.9,1.9,.9]);ball(list,R*.16,at(0,cy+R*.1,-R*1.2),'head',recipe.outfit.accent);}
 if(style==='bun'){ball(list,R*.42,at(0,cy+R*.95,-R*.3),'head',c);}
 if(style==='spiky')for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const x=Math.cos(a)*R*.55,z=Math.sin(a)*R*.5-R*.1;
  const g=new THREE.ConeGeometry(R*.2,R*.5,6);part(list,g,'head',c,M(x,m.headY+cy+R*.88,z,Math.sin(a)*.5,0,-Math.cos(a)*.5));}
 if(style==='perm')for(let i=0;i<22;i++){const a=i*2.39996,y=.2+.75*((i*.618)%1);const rr=Math.sqrt(1-y*y);const x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(z>.35&&y<.55)continue;ball(list,R*.24,at(x*R*1.1*m.headSX,cy+y*R*1.1,z*R*1.05),'head',i%3?c:dark,[1,1,1],8,6);}
 if(style==='braids'){
  // Plaits from behind each ear to the shoulders, in lobes, each with its tie.
  for(const s of [-1,1]){
   const x0=s*R*.8,z0=-R*.35;let y=cy-R*.35;
   for(let i=0;i<6;i++){const r=R*(.2-i*.012);ball(list,r,at(x0+s*R*.05,y,z0+R*.05*i),'head',i%2?c:dark,[1,1.3,1],8,6);y-=r*1.5;}
   ball(list,R*.13,at(x0+s*R*.05,y+R*.05,z0+R*.3),'head',recipe.outfit.accent,[1.2,.7,1.2],8,6);
   ball(list,R*.12,at(x0+s*R*.05,y-R*.12,z0+R*.3),'head',c,[1,1.4,1],8,6);
  }
 }
 if(style==='sidepart'||style==='braids'){ball(list,R*.34,at(side*R*.5,cy+R*.62,R*.62),'head',c,[1.4,.55,.7],10,6);}
 if(style==='bob'||style==='long'){ball(list,R*.4,at(0,cy+R*.52,R*.72),'head',c,[2,.5,.6],10,6);}
}

/**
 * A headband strip in unit head space: a ring of columns round the head at forehead
 * height, each point pushed out to just above the hair (or the skin, below a fringe
 * that stops higher up). Returns the geometry and where its knot sits behind.
 */
function headband(style,profile){
 const spec=HAIR[style],W=56,g=new THREE.SphereGeometry(1,W,1,0,Math.PI*2,.5,.5),pos=g.attributes.position,uv=g.attributes.uv,v=new THREE.Vector3();
 let knot=[0,.4,-1];
 for(let i=0;i<pos.count;i++){
  const u=(i%(W+1))/W,phi=u*Math.PI*2,x=Math.sin(phi),z=Math.cos(phi),back=THREE.MathUtils.smoothstep(-z,-.2,1);
  const mid=.3+back*.14,y=mid+(uv.getY(i)-.5)*.14,flat=Math.sqrt(1-y*y);
  v.set(x*flat,y,z*flat);
  // The same hair field as hairCap: is this point under hair, and how far out is it?
  let r=1.035;
  if(spec&&!spec.ring){
   const outFace=Math.max(.18-v.z,Math.abs(v.x)-spec.faceHalf,v.y-spec.front);
   const low=THREE.MathUtils.lerp(spec.side,spec.back,THREE.MathUtils.smoothstep(-v.z,-.2,.7));
   const f=Math.min(outFace,v.y-low),hair=spec.radius*(1+(spec.lift&&v.y>0?v.y*spec.lift:0))+.03;
   r=THREE.MathUtils.lerp(1.035,Math.max(1.035,hair),THREE.MathUtils.smoothstep(f,-.06,.06));
  }else if(spec?.ring&&back>.3)r=spec.radius+.03;
  v.multiplyScalar(r);shapeHeadPoint(v,profile);
  pos.setXYZ(i,v.x,v.y,v.z);
  if(Math.abs(u-.5)<1e-6&&uv.getY(i)>.5)knot=[0,v.y-.07,v.z];
 }
 g.computeVertexNormals();
 return {geometry:g,knot};
}

function addHat(list,recipe,m){
 const hat=recipe.outfit.hat,c=recipe.outfit.hatColour,R=m.Rh,top=m.headCentre+R*m.headSY*.2;
 if(hat==='none')return;
 const S=[m.headSX*R,m.headSY*R,R];
 if(hat==='cap'||hat==='police'||hat==='captain'){
  const crown=new THREE.SphereGeometry(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);
  part(list,crown,'head',c,M(0,m.headCentre+R*.08,0,-.08,0,0,S[0],S[1]*(hat==='cap'?.9:1.05),S[2]));
  const brim=new THREE.CylinderGeometry(R*.85,R*.85,.015,20,1,false,-Math.PI*.35,Math.PI*.7);
  part(list,brim,'head',hat==='cap'?c:'#1c1c24',M(0,m.headCentre+R*.2,R*.55,.18,0,0,1,1,1));
  if(hat!=='cap'){part(list,new THREE.CylinderGeometry(R*1.12,R*1.12,R*.14,24,1,true),'head',hat==='captain'?'#1c1c24':'#e0b93a',M(0,m.headCentre+R*.26,0,-.08));
   ball(list,R*.1,[0,m.headCentre+R*.62,R*1.02],'head','#e0b93a',[1,1,.4],8,6);}
 }else if(hat==='helmet'){
  part(list,new THREE.SphereGeometry(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),'head',c,M(0,m.headCentre+R*.05,0,0,0,0,...S));
  part(list,new THREE.TorusGeometry(R*1.16*m.headSX,R*.05,6,24),'head',c,M(0,m.headCentre+R*.03,0,Math.PI/2));
 }else if(hat==='straw'){
  part(list,new THREE.CylinderGeometry(R*2.1,R*2.1,.02,28),'head',c,M(0,top+R*.18,0,-.06));
  part(list,new THREE.CylinderGeometry(R*.8,R*.95,R*.55,20),'head',c,M(0,top+R*.42,0,-.06));
  part(list,new THREE.CylinderGeometry(R*.97,R*.97,R*.12,20,1,true),'head','#d8342c',M(0,top+R*.25,0,-.06));
 }else if(hat==='beanie'){
  part(list,new THREE.SphereGeometry(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),'head',c,M(0,m.headCentre+R*.12,0,0,0,0,...S));
  part(list,new THREE.TorusGeometry(1.14,.09,6,24),'head',c,M(0,m.headCentre+R*.18,0,Math.PI/2,0,0,S[0],S[2],S[1]));
  ball(list,R*.22,[0,m.headCentre+R*m.headSY*1.32,0],'head',c,[1,1,1],10,8);
 }else if(hat==='beret'){
  ball(list,R,[R*.15,m.headCentre+R*m.headSY*.83,0],'head',c,[m.headSX*1.35,.38,1.25],20,12);
  part(list,new THREE.CylinderGeometry(R*.055,R*.055,R*.15,6),'head',c,M(R*.15,m.headCentre+R*m.headSY*1.2,0));
 }else if(hat==='bucket'){
  const y=m.headCentre+R*m.headSY*.73;
  part(list,new THREE.CylinderGeometry(R*.93,R*1.13,R*.62,20),'head',c,M(0,y,0,0,0,0,m.headSX,1,1));
  part(list,new THREE.CylinderGeome…14408 tokens truncated…Transform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_NORMALMAP
        vNormalMapUv=(normalMapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_ROUGHNESSMAP
        vRoughnessMapUv=(roughnessMapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_AOMAP
        vAoMapUv=(aoMapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_BUMPMAP
        vBumpMapUv=(bumpMapTransform*vec3(townUV,1.0)).xy;
      #endif`);
  };
  material.customProgramCacheKey=()=> 'town-world-uv-v1';
  return material;
}
