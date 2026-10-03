import {THUAN_SAILOR_OUTFIT} from './outfits.js';
import {SPRING_BONES,SPRING_PARENT,springRest,chainShare,quarterShare,hemSpec,createSprings} from './springs.js';
import {SHOPPING_LANE_OUTFIT} from '../world/shopping-lane-plan.js';
import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {normalizeRecipe} from './recipe.js';
import {drawFace,faceLayout} from './face.js';
import {headProfile,shapeHeadPoint} from './head-profile.js';
import {celFrom} from '../render/cel.js';
import {GARMENT,PLAIN_UV,torsoUV,sleeveUV,paintGarment,SLEEVED_LONG} from './garment.js';

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
// The swing bones (springs.js) come last: hair, skirt and hem chains every body carries,
// used or not, so every skeleton has the same bones in the same order.
export const BONES=Object.freeze(['root','hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR',...SPRING_BONES]);
const BI=Object.fromEntries(BONES.map((n,i)=>[n,i]));

/** Every measurement of a body, from its recipe. Pure, for tests and the seat maths. */
/**
 * Height range and head scale per life stage. A child's head is about 0.4 of their
 * height, an adult's about a third, for the big-headed life-sim silhouette; elders lose a little height. Adult is the original scale.
 */
const STAGES=Object.freeze({
 child:{base:1.12,span:.2,head:1.4},
 teen:{base:1.4,span:.28,head:1.18},
 adult:{base:1.36,span:.44,head:1.12},
 elder:{base:1.33,span:.34,head:1.14},
});
export function measure(recipe){
 const r=normalizeRecipe(recipe);
 const stage=STAGES[r.age]||STAGES.adult;
 const H=stage.base+r.body.height*stage.span,k=H/1.6,build=r.body.build;
 const profile=headProfile(r.head),Rh=(.19+r.head.size*.055)*k*stage.head*(r.body.proportion==='rounded'?1.30:1),headSX=profile.width,headSY=profile.height;
 const rounded=r.body.proportion==='rounded';
 const neck=.055*k,body=H-Rh*2*headSY-neck;
 const leg=body*(rounded?.37:.47),torso=body-leg;
 const foot=.07*k,thigh=(leg-foot)*.5,shin=thigh;
 const legR=(.058+build*.024)*k,armR=(.045+build*.016)*k;
 const feminine=r.body.silhouette==='feminine',masculine=r.body.silhouette==='masculine';
 const width=(.3+build*.15)*k*(rounded?1.20:1)*(feminine?.94:masculine?1.08:1),depth=(.2+build*.09)*k*(rounded?1.15:1);
 const hips=width*(feminine?1.13:masculine?.9:1),waistRatio=feminine?.79:masculine?.98:.96;
 const upper=(rounded?.18:.22)*k,fore=(rounded?.16:.2)*k,hand=.056*k;
 const hipY=leg,chestY=hipY+torso*.5,neckY=hipY+torso,headY=neckY+neck;
 return {H,k,Rh,headSX,headSY,profile,neck,torso,leg,foot,thigh,shin,legR,armR,width,hips,waistRatio,depth,upper,fore,hand,hipY,chestY,neckY,headY,
  // The arm hangs from just inside the torso's edge, below its top, so the shoulder
  // rounds over it instead of the arm standing clear of the body.
  headCentre:headY+Rh*headSY*.94,shoulderX:width/2-armR*.2,shoulderY:neckY-.075*k,hipX:hips*.24,
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
const PARENT={...SPRING_PARENT,hips:'root',spine:'hips',chest:'spine',neck:'chest',head:'neck',shoulderL:'chest',elbowL:'shoulderL',handL:'elbowL',shoulderR:'chest',elbowR:'shoulderR',handR:'elbowR',thighL:'hips',kneeL:'thighL',footL:'kneeL',thighR:'hips',kneeR:'thighR',footR:'kneeR'};

const tmpColour=new THREE.Color();
/** The torso lathe's radius at a fraction of its height. */
/** The camp collar from Blender (tools/blender/kariyushi_collar.py), body-relative. */
function latheRadius(prof,t){for(let i=1;i<prof.length;i++){const [r0,y0]=prof[i-1],[r1,y1]=prof[i];if(t<=y1)return r0+(r1-r0)*((t-y0)/((y1-y0)||1));}return prof.at(-1)[0];}
/**
 * A part: geometry in model space, painted, bound to one bone -- or, for a limb, shared
 * between bones by a function of where each vertex is, so a joint bends as one soft piece.
 */
function part(list,geometry,bone,hex,matrix,uvAt=null){
 let g=geometry.index?geometry.toNonIndexed():geometry.clone();
 for(const key of Object.keys(g.attributes))if(!['position','normal'].includes(key))g.deleteAttribute(key);
 if(matrix)g.applyMatrix4(matrix);
 const n=g.attributes.position.count,uv=new Float32Array(n*2);
 // Every part samples the garment texture; all but the torso sample its empty strip.
 if(uvAt){
  const P=g.attributes.position,q=new THREE.Vector3();
  for(let i=0;i<n;i++){q.fromBufferAttribute(P,i);const [u,v]=uvAt(q);uv[i*2]=u;uv[i*2+1]=v;}
  // A triangle across the back seam would sweep the whole texture: bring it round.
  for(let i=0;i<n;i+=3){const us=[uv[i*2],uv[i*2+2],uv[i*2+4]];if(Math.max(...us)-Math.min(...us)>.5)for(let j=0;j<3;j++)if(uv[(i+j)*2]<.5)uv[(i+j)*2]+=1;}
 }else for(let i=0;i<n;i++){uv[i*2]=PLAIN_UV[0];uv[i*2+1]=PLAIN_UV[1];}
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 const colours=new Float32Array(n*3),index=new Uint16Array(n*4),weight=new Float32Array(n*4);
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
  const w=share(p).filter(([,x])=>x>1e-3).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=w.reduce((t,[,x])=>t+x,0)||1;
  w.forEach(([name,x],k)=>{index[i*4+k]=BI[name];weight[i*4+k]=x/sum;});
 }
 g.setAttribute('color',new THREE.BufferAttribute(colours,3));
 g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(index,4));
 g.setAttribute('skinWeight',new THREE.BufferAttribute(weight,4));
 // How much ink outline this part carries (1 everywhere unless a part says otherwise).
 g.setAttribute('ink',new THREE.BufferAttribute(new Float32Array(n).fill(1),1));
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
function limb(list,a,b,r0,r1,hex,{bone,joints=[],root=null,soft=.13,segments=14,uvAt=null}={}){
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
 part(list,g,share,hex,new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,new THREE.Vector3(1,1,1)),uvAt);
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
 * rising well up behind into a tufted crescent. Built as its own strip so both edges stay clean.
 */
function hairRing(spec){
 const open=.95,W=48,g=new THREE.SphereGeometry(spec.radius,W,8,Math.PI/2+open,Math.PI*2-open*2,.1,1);
 const pos=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<pos.count;i++){
  // Around from the vertex's column. (thetaStart is above zero because a sphere
  // starting at its pole leaves out half the triangles of its top row.)
  const u=(i%(W+1))/W,phi=Math.PI/2+open+u*(Math.PI*2-open*2),back=THREE.MathUtils.smoothstep(-Math.sin(phi),-.3,1);
  // Top edge from just above the ears at the front to higher behind; bottom at the nape.
  // Seen from behind an even band read as a bandage round the eyes: it rises well up the
  // back of the head now, so it is a crescent of hair rather than a strip, and its top
  // edge is tufted instead of ruled.
  const tufts=(1-Math.abs(Math.sin(u*Math.PI*11)))*.09*back;
  const top=Math.acos(.06+back*.5)+tufts,bottom=Math.acos(-.42-back*.12),theta=top+(1-uv.getY(i))*(bottom-top);
  const ends=THREE.MathUtils.smoothstep(Math.min(u,1-u),0,.08);
  const t=THREE.MathUtils.lerp(bottom-.12,theta,.35+.65*ends);
  pos.setXYZ(i,-Math.cos(phi)*Math.sin(t)*spec.radius,Math.cos(t)*spec.radius,Math.sin(phi)*Math.sin(t)*spec.radius);
 }
 g.computeVertexNormals();
 return g;
}

function addHair(list,recipe,m){
 const hairStart=list.length;
 const c=recipe.hair.colour,style=recipe.hair.style,side=recipe.hair.flip?-1:1;
 const R=m.Rh,cx=0,cy=m.headCentre-m.headY,S=[m.headSX*R,m.headSY*R,R*.98];
 // Hair and hat are built in head-bone space, then carried to model space.
 const at=(x,y,z)=>[x,m.headY+y,z];
 const cap=hairCap(style,recipe.hair.flip);
 if(cap){const p=cap.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);shapeHeadPoint(v,m.profile);p.setXYZ(i,v.x,v.y,v.z);}cap.computeVertexNormals();part(list,cap,'head',c,M(cx,m.headY+cy,0,0,0,0,...S));}
 const dark=new THREE.Color(c).multiplyScalar(.82).getStyle();
 // What hangs swings on its own chain of bones (springs.js); the rest is the head's.
 const swing=springRest(recipe,m),tailShare=chainShare('head',['hairA','hairB'],[swing.rest.hairA,swing.rest.hairB,swing.chains.find(ch=>ch.kind==='hair')?.tip??swing.rest.hairB]);
 if(style==='long'){ball(list,R*.95,at(0,cy-R*.72,-R*.55),tailShare,c,[1.05,1.25,.5]);}
 if(style==='ponytail'){ball(list,R*.34,at(0,cy+R*.1,-R*1.05),'head',c,[1,1,1]);ball(list,R*.3,at(0,cy-R*.45,-R*1.18),tailShare,c,[.9,1.9,.9]);ball(list,R*.16,at(0,cy+R*.1,-R*1.2),'head',recipe.outfit.accent);}
 if(style==='bun'){ball(list,R*.42,at(0,cy+R*.95,-R*.3),'head',c);}
 if(style==='spiky')for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const x=Math.cos(a)*R*.55,z=Math.sin(a)*R*.5-R*.1;
  const g=new THREE.ConeGeometry(R*.2,R*.5,6);part(list,g,'head',c,M(x,m.headY+cy+R*.88,z,Math.sin(a)*.5,0,-Math.cos(a)*.5));}
 if(style==='perm')for(let i=0;i<22;i++){const a=i*2.39996,y=.2+.75*((i*.618)%1);const rr=Math.sqrt(1-y*y);const x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(z>.35&&y<.55)continue;ball(list,R*.24,at(x*R*1.1*m.headSX,cy+y*R*1.1,z*R*1.05),'head',i%3?c:dark,[1,1,1],8,6);}
 if(style==='braids'){
  // Plaits from behind each ear to the shoulders, in lobes, each with its tie.
  for(const s of [-1,1]){
   const x0=s*R*.8,z0=-R*.35;let y=cy-R*.35;
   const side=s>0?'L':'R',chain=swing.chains.find(ch=>ch.bones[0]==='braid'+side+'1');
   const share=chainShare('head',['braid'+side+'1','braid'+side+'2'],[swing.rest['braid'+side+'1'],swing.rest['braid'+side+'2'],chain.tip]);
   for(let i=0;i<6;i++){const r=R*(.2-i*.012);ball(list,r,at(x0+s*R*.05,y,z0+R*.05*i),share,i%2?c:dark,[1,1.3,1],8,6);y-=r*1.5;}
   ball(list,R*.13,at(x0+s*R*.05,y+R*.05,z0+R*.3),share,recipe.outfit.accent,[1.2,.7,1.2],8,6);
   ball(list,R*.12,at(x0+s*R*.05,y-R*.12,z0+R*.3),share,c,[1,1.4,1],8,6);
  }
 }
 if(style==='sidepart'||style==='braids'){ball(list,R*.34,at(side*R*.5,cy+R*.62,R*.62),'head',c,[1.4,.55,.7],10,6);}
 if(style==='bob'||style==='long'){ball(list,R*.4,at(0,cy+R*.52,R*.72),'head',c,[2,.5,.6],10,6);}
 // Hair is tucked under full hats, while fringes, braids and tails stay below them.
 if(!['none','headband','ribbon'].includes(recipe.outfit.hat))for(const g of list.slice(hairStart)){
  const pos=g.attributes.position;g.userData.hatHair={position:pos.array.slice(),normal:g.attributes.normal.array.slice()};for(let i=0;i<pos.count;i++){
   const x=pos.getX(i)/S[0],y=(pos.getY(i)-m.headCentre)/S[1],z=pos.getZ(i)/S[2],r=Math.hypot(x,y,z);
   if(y>.3&&r>1.035){const f=1.035/r;pos.setXYZ(i,x*f*S[0],m.headCentre+y*f*S[1],z*f*S[2]);}
  }g.computeVertexNormals();
 }
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

export function hatFit(recipe,m=measure(recipe)){
 return {brimY:m.headCentre+m.Rh*m.headSY*.55,crownHeight:m.Rh*m.headSY*.8};
}
function addHat(list,recipe,m){
 const hat=recipe.outfit.hat,c=recipe.outfit.hatColour,R=m.Rh,top=m.headCentre+R*m.headSY*.2;
 if(hat==='none')return;
 const S=[m.headSX*R,m.headSY*R,R];
 if(hat==='cap'||hat==='police'||hat==='captain'){
  const police=hat==='police',crown=police?new THREE.CylinderGeometry(1.16,1.03,.4,28,1,true):new THREE.SphereGeometry(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);
  part(list,crown,'head',c,M(0,m.headCentre+R*m.headSY*(police?.95:.23),0,police?0:-.08,0,0,S[0],S[1]*(police?1:hat==='cap'?.9:1.05),S[2]));
  if(police)part(list,new THREE.CircleGeometry(1.16,28),'head',c,M(0,m.headCentre+R*m.headSY*1.15,0,-Math.PI/2,0,0,S[0],S[2],1));
  // A shallow curved visor reads as a cap bill rather than a cloth band.
  ball(list,R*.68,[0,m.headCentre+R*m.headSY*(police?.68:.25),R*.9],'head',hat==='cap'?c:'#1c1c24',[m.headSX*1.4,.07,1],20,8);
  if(hat!=='cap'){part(list,new THREE.CylinderGeometry(R*1.12,R*1.12,R*.14,24,1,true),'head',hat==='captain'?'#1c1c24':'#1c2742',M(0,m.headCentre+R*(police?.72:.26),0,-.08));
   ball(list,R*.1,[0,m.headCentre+R*(police?.95:.62),R*1.02],'head','#e0b93a',[1,1,.4],8,6);}
 }else if(hat==='helmet'){
  if(hat!=='paperboat')part(list,new THREE.SphereGeometry(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),'head',c,M(0,m.headCentre+R*m.headSY*.35,0,0,0,0,S[0],S[1]*.9,S[2]));
  part(list,new THREE.TorusGeometry(1.16,.045,6,24),'head',c,M(0,m.headCentre+R*m.headSY*.35,0,Math.PI/2,0,0,S[0],S[2],S[1]));
 }else if(hat==='straw'){
  const fit=hatFit(recipe,m),y=fit.brimY;
  // An annulus leaves room for the head; the crown has an open underside.
  part(list,new THREE.RingGeometry(R*.98,R*2.1,32),'head',c,M(0,y,0,-Math.PI/2,0,0,m.headSX,1,1));
  part(list,new THREE.RingGeometry(R*.98,R*2.1,32),'head',c,M(0,y-.012*m.k,0,Math.PI/2,0,0,m.headSX,1,1));
  part(list,new THREE.CylinderGeometry(R*.78,R*1.08,fit.crownHeight,24,1,true),'head',c,M(0,y+fit.crownHeight/2,0,0,0,0,m.headSX,1,1));
  part(list,new THREE.CircleGeometry(R*.78,24),'head',c,M(0,y+fit.crownHeight,0,-Math.PI/2,0,0,m.headSX,1,1));
  part(list,new THREE.CylinderGeometry(R*1.045,R*1.09,R*.12*m.headSY,24,1,true),'head','#d8342c',M(0,y+R*.06*m.headSY,0,0,0,0,m.headSX,1,1));
 }else if(hat==='beanie'){
  part(list,new THREE.SphereGeometry(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),'head',c,M(0,m.headCentre+R*.12,0,0,0,0,...S));
  part(list,new THREE.TorusGeometry(1.14,.09,6,24),'head',c,M(0,m.headCentre+R*.18,0,Math.PI/2,0,0,S[0],S[2],S[1]));
  ball(list,R*.22,[0,m.headCentre+R*m.headSY*1.32,0],'head',c,[1,1,1],10,8);
 }else if(hat==='beret'){
  ball(list,R,[R*.15,m.headCentre+R*m.headSY*.83,0],'head',c,[m.headSX*1.35,.38,1.25],20,12);
  part(list,new THREE.CylinderGeometry(R*.055,R*.055,R*.15,6),'head',c,M(R*.15,m.headCentre+R*m.headSY*1.2,0));
 }else if(hat==='bucket'){
  const y=m.headCentre+R*m.headSY*.88;
  part(list,new THREE.CylinderGeometry(R*.93,R*1.13,R*.62,20),'head',c,M(0,y,0,0,0,0,m.headSX,1,1));
  part(list,new THREE.CylinderGeometry(R*1.12,R*1.5,R*.16,24,1,true),'head',c,M(0,y-R*.33,0,0,0,0,m.headSX,1,1));
 }else if(['squid','teapot','sunflower','paperboat','mountain'].includes(hat)){
  // A fitted open dome provides one consistent hat/hair boundary for every novelty.
  if(hat!=='paperboat')part(list,new THREE.SphereGeometry(1.16,24,12,0,Math.PI*2,0,Math.PI*.49),'head',c,M(0,m.headCentre+R*m.headSY*.35,0,0,0,0,S[0],S[1]*.86,S[2]));
  const y=m.headCentre+R*m.headSY*1.16;
  if(hat==='squid'){
   ball(list,R*.6,[0,y+R*.20,0],'head',c,[1,.9,1],16,12);
   for(const sx of [-1,1]){ball(list,R*.12,[sx*R*.25,y+R*.2,R*.53],'head','#f4f1ea',[1,1,.45],10,8);ball(list,R*.055,[sx*R*.25,y+R*.2,R*.59],'head','#27304d',[1,1,.4],8,6);for(const z of [-.45,.05])tube(list,[sx*R*.78,y-R*.18,z*R],[sx*R*.96,y-R*.65,z*R],R*.10,'head',c,8);}
  }else if(hat==='teapot'){
   ball(list,R*.62,[0,y+R*.14,0],'head',c,[1.15,.72,1],16,12);
   part(list,new THREE.TorusGeometry(R*.38,R*.07,8,18),'head',c,M(-R*.66,y+R*.14,0));
   part(list,new THREE.ConeGeometry(R*.17,R*.55,12),'head',c,M(R*.69,y+R*.25,0,0,0,-.9));ball(list,R*.12,[0,y+R*.67,0],'head',recipe.outfit.accent,[1,.6,1],10,8);
  }else if(hat==='sunflower'){
   for(let i=0;i<10;i++){const a=i*Math.PI/5;ball(list,R*.25,[Math.cos(a)*R*.45,y+R*.44+Math.sin(a)*R*.45,R*.25],'head','#f4d23c',[1,.65,.25],10,8);}
   ball(list,R*.29,[0,y+R*.44,R*.31],'head','#9a6a42',[1,1,.3],12,10);
  }else if(hat==='mountain'){
   part(list,new THREE.ConeGeometry(R*.75,R*.86,12),'head',c,M(0,y+R*.26,0));part(list,new THREE.ConeGeometry(R*.31,R*.38,12),'head','#f4f1ea',M(0,y+R*.69,0));
  }else{
   for(const side of [-1,1]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-R*1.25,y,side*R*.65,R*1.25,y,side*R*.65,0,y+R*.67,0],3));g.computeVertexNormals();part(list,g,'head','#f4f1ea');}
   part(list,new THREE.BoxGeometry(R*2.45,R*.16,R*.11),'head',c,M(0,y-R*.02,R*.66));
  }
 }else if(hat==='ribbon'){
  const x=R*m.headSX*.68,y=m.headCentre+R*m.headSY*.85,z=R*.52;
  for(const sign of [-1,1])ball(list,R*.2,[x+sign*R*.16,y,z],'head',c,[1.1,.7,.45],10,8);
  ball(list,R*.09,[x,y,z+R*.04],'head',c,[1,1,.7],8,6);
 }else if(hat==='headband'){
  // A hachimaki tied snug round the forehead: it follows the head (and the hair where
  // there is hair), rising a little behind, knotted at the back. Not a floating ring.
  const band=headband(recipe.hair.style,m.profile);
  part(list,band.geometry,'head',c,M(0,m.headCentre,0,0,0,0,...S));
  ball(list,R*.13,[0,m.headCentre+band.knot[1]*S[1],band.knot[2]*S[2]-R*.04],'head',c,[1.5,.8,.7],8,6);
 }else if(hat==='kerchief'){
  part(list,new THREE.SphereGeometry(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),'head',c,M(0,m.headCentre+R*.05,-R*.12,-.45,0,0,...S));
  ball(list,R*.2,[0,m.headCentre+R*.1,-R*1.1],'head',c,[1.3,.9,.9],8,6);
 }
}

/**
 * Somebody's hat on its own, for a hook or a hat stand: the same pieces addHat puts on
 * their head, painted the same, as a plain mesh. 'wall' puts the back of the crown at
 * the origin with the brim facing +z; 'stand' sits the hat's rim on the origin. Null
 * for somebody who does not wear one.
 */
export function buildHatProp(input,{mode='wall',shadows=true}={}){
 const recipe=normalizeRecipe(input);
 if(recipe.outfit.hat==='none')return null;
 const parts=[];addHat(parts,recipe,measure(recipe));
 if(!parts.length)return null;
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
 for(const key of ['skinIndex','skinWeight'])geometry.deleteAttribute(key);
 geometry.computeBoundingBox();
 const b=geometry.boundingBox,c=b.getCenter(new THREE.Vector3());
 geometry.translate(-c.x,mode==='stand'?-b.min.y:-c.y,mode==='stand'?-c.z:-b.min.z);
 geometry.computeBoundingSphere();
 const mesh=new THREE.Mesh(geometry,celFrom(new THREE.MeshStandardMaterial({vertexColors:true}),{bands:'soft3'}));
 mesh.name=(recipe.name||'Resident')+'’s hat';mesh.castShadow=shadows;mesh.receiveShadow=true;
 mesh.userData.hatProp=true;
 return mesh;
}

/** Accessories join the existing skinned mesh, adding no extra draw calls. */
function addAccessories(list,recipe,m){
 const a=recipe.accessories,R=m.Rh,c=a.colour;
 if(a.earrings!=='none')for(const sign of [-1,1]){
  const x=sign*R*m.headSX*1.035,y=m.headCentre-R*.21,z=R*.04;
  if(a.earrings==='studs')ball(list,R*.085,[x,y,z],'head',c,[1,1,.65],8,6);
  else part(list,new THREE.TorusGeometry(R*.16,R*.035,6,14),'head',c,M(x,y-R*.1,z,0,sign*.5));
 }
 if(a.neckwear==='pendant'){
  part(list,new THREE.TorusGeometry(m.width*.3,m.k*.007,5,18),'chest',c,M(0,m.neckY-.035,m.depth*.05,Math.PI/2-.5));
  ball(list,m.k*.025,[0,m.neckY-.12,m.depth*.53],'chest',c,[.7,1,.35],8,6);
 }else if(a.neckwear==='scarf'){
  part(list,new THREE.TorusGeometry(m.armR*1.7,m.armR*.55,6,18),'chest',c,M(0,m.neckY-.035,0,Math.PI/2));
  part(list,new THREE.BoxGeometry(m.width*.22,m.torso*.5,.025),'chest',c,M(m.width*.14,m.neckY-m.torso*.28,m.depth*.53,0,0,-.15));
 }
 if(a.pin)ball(list,m.k*.024,[m.width*.22,m.neckY-m.torso*.28,m.depth*.52],'chest',c,[1,1,.3],8,6);
}

/** Long hair, a lipstick or no beard and a slight build: a swimming costume, not trunks. */
export const wearsSwimTop=recipe=>recipe.facial.style==='none'&&(['bob','long','ponytail','braids','bun','perm'].includes(recipe.hair.style)||recipe.mouth.colour!=='#b8544a');

function torsoProfile(recipe,m){
 const belly=1+(recipe.body.build-.5)*.12,hipRatio=m.hips/m.width;
 return [[0,-.1],[hipRatio*.86,-.08],[hipRatio,.05],[hipRatio,.13],[hipRatio,.15],[m.waistRatio*belly,.3],[m.waistRatio*(1+(belly-1)*.6),.5],[1,.66],[.985,.74],[.95,.8],[.88,.87],[.76,.93],[.58,.98],[.38,1.01],[.19,1.03],[0,1.04]];
}
/**
 * The body's material, carrying the painted garment. The texture is mixed over the
 * vertex colour by its alpha, so a part that samples the empty strip keeps its own
 * colour and the torso shows the cloth wherever nothing is drawn.
 */
function bodyMaterial(recipe,m){
 const canvas=document.createElement('canvas');canvas.width=GARMENT.width;canvas.height=GARMENT.height;
 const ctx=canvas.getContext('2d'),prof=torsoProfile(recipe,m);
 const marks=paintGarment(ctx,recipe,m,t=>latheRadius(prof,t))||[];
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 // Wraps round the body; no mipmaps, so distance never bleeds the drawing into the strip.
 texture.wrapS=THREE.RepeatWrapping;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.anisotropy=4;
 const material=celFrom(new THREE.MeshStandardMaterial({vertexColors:true}),{bands:'soft3'});
 material.map=texture;
 const base=material.onBeforeCompile,key=material.customProgramCacheKey?.bind(material);
 material.onBeforeCompile=(shader,renderer)=>{
  base?.call(material,shader,renderer);
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','').replace('#include <color_fragment>',
   '#include <color_fragment>\n#ifdef USE_MAP\n vec4 garment = texture2D( map, vMapUv );\n diffuseColor.rgb = mix( diffuseColor.rgb, garment.rgb, garment.a );\n#endif');
 };
 material.customProgramCacheKey=()=>'garment_'+(key?key():'');
 material.userData.garment={canvas,texture,marks};
 return material;
}
function addBody(list,recipe,m,swim=false){
 const o=recipe.outfit,skin=recipe.body.skin,top=swim?skin:o.topColour,bottom=swim?recipe.swim.colour:o.bottomColour;
 const W=m.width,D=m.depth,hipY=m.hipY;
 // The base layer everyone has on under their clothes: a tank top and underwear.
 const tank=!swim&&o.top==='tank',briefs=!swim&&o.bottom==='underwear';
 // The torso: a lathe, full width up to square shoulders that round off into the neck.
 // A sturdier build carries a little more round the middle, so a bare torso is shaped
 // like a body rather than a box.
 const prof=torsoProfile(recipe,m);
 const lathe=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),28);
 // The hem sits on a row of the lathe, so it is a clean line rather than a zigzag.
 // Underwear sits lower than a waistband.
 const waist=hipY+m.torso*(briefs?.05:.13);
 const torsoColour=p=>{
  if(swim)return p.y<waist?bottom:skin;
  if(p.y<waist)return bottom;
  // Under a tank top the body is bare; the vest is its own garment, added below.
  if(tank)return skin;
  if(['jacket','cardigan','festival'].includes(o.top)&&p.z>D*.18&&Math.abs(p.x)<W*.13)return o.accent;
  if(o.top==='sundress'&&(p.y-hipY)/m.torso>.78)return skin;
  return top;
 };
 // The shirt's details are painted, not modelled (garment.js): the torso carries the
 // garment texture's UVs, the cloth stays its vertex colour underneath.
 const torsoSkin=p=>{const chest=THREE.MathUtils.smoothstep(p.y,hipY+m.torso*.15,hipY+m.torso*.55);return [['hips',1-chest],['chest',chest]];};
 part(list,lathe,torsoSkin,torsoColour,M(0,hipY,0,0,0,0,W/2,m.torso,D/2),swim?null:p=>torsoUV(p,m));
 if(tank){
  // The vest: a thin shell over the body from the waist to straight across the chest,
  // so its edge is a clean line, and two straps that follow the shoulders over the top.
  const top0=.77,rows=prof.filter(([,y])=>y>=.05&&y<=top0).concat([[latheRadius(prof,top0),top0]]);
  const shell=new THREE.LatheGeometry(rows.map(([r,y])=>new THREE.Vector2(r*1.025,y)),28);
  part(list,shell,'chest',top,M(0,hipY,0,0,0,0,W/2,m.torso,D/2));
  const sx=.4,at=t=>{const r=latheRadius(prof,t)*1.025;return D/2*Math.sqrt(Math.max(0,r*r-sx*sx))+.004*m.k;};
  for(const side of [-1,1]){
   const x=side*W/2*sx,pts=[.77,.9,1.0].map(t=>[x,hipY+m.torso*t,at(t)]);
   pts.push([x,hipY+m.torso*1.035,0]);
   const path=pts.concat(pts.slice(0,-1).reverse().map(([px,py,pz])=>[px,py,-pz]));
   for(let i=1;i<path.length;i++)tube(list,path[i-1],path[i],.016*m.k,'chest',top,6);
  }
 }
 // A swimmer's top, for anyone who would wear one.
 if(swim&&wearsSwimTop(recipe))
  part(list,new THREE.CylinderGeometry(W*.52,W*.52,m.torso*.2,16,1,true),'chest',recipe.swim.colour,M(0,hipY+m.torso*.66,0,0,0,0,1,1,D/W));
 // Neck.
 tube(list,[0,m.neckY-.02,0],[0,m.headY+.01,0],m.armR*1.08,'neck',skin,8);
 // A kariyushi's open camp collar is modelled, not painted: a stand behind the neck that
 // rolls into the fall over the shoulders and folds back down the front to the V. It is
 // a real edge in silhouette and catches the light, so it reads as a collar, not a bib.
 // The collar's stand is modelled: a band of the shirt round the back and sides of the
 // neck, open at the front, rolling a little outward at the top, so the collar wraps the
 // neck from every side. Its leaves and lapels on the front are drawn (garment.js).
 if(!swim&&o.top==='kariyushi'){
  const ri=m.armR*1.08+.004*m.k,t=.007*m.k,h=.045*m.k,roll=.012*m.k,open=.95;
  const band=new THREE.LatheGeometry([[ri,0],[ri+t,0],[ri+t+roll,h],[ri+roll*.6,h]].map(([r,y])=>new THREE.Vector2(r,y)).concat([new THREE.Vector2(ri,0)]),24,open,Math.PI*2-open*2);
  // It runs down to nothing at the front, where it turns into the drawn leaves.
  const P=band.attributes.position;for(let i=0;i<P.count;i++){const a=Math.abs(Math.atan2(P.getX(i),P.getZ(i)));P.setY(i,P.getY(i)*THREE.MathUtils.smoothstep(a,open,open+.9));}band.computeVertexNormals();
  part(list,band,'chest',top,M(0,m.neckY-.012*m.k,0));
 }
 // A hood lies on the back; everything else on the front of a top is painted.
 if(!swim&&o.top==='hoodie')part(list,new THREE.SphereGeometry(m.width*.35,16,12,0,Math.PI*2,0,Math.PI*.75),'chest',top,M(0,m.neckY-.045,-D*.32,.9,0,0,1,.7,.55));
 // Original festival costumes are attached to the chest; limbs keep their normal rig.
 if(!swim&&['lighthouse','lantern','reef'].includes(o.top)){
  const cy=hipY+m.torso*.52;
  if(o.top==='lantern'){
   part(list,new THREE.SphereGeometry(1,24,16),'chest',top,M(0,cy,0,0,0,0,W*.63,m.torso*.55,D*.68));
   for(const t of [.12,.9])part(list,new THREE.CylinderGeometry(W*.48,W*.48,.026*m.k,24),'chest',o.accent,M(0,hipY+m.torso*t,0,0,0,0,1,1,D/W));
   for(const angle of [-.9,-.45,0,.45,.9]){const pts=[];for(let i=0;i<=10;i++){const a=-1.05+i*.21;pts.push([Math.sin(angle)*W*.64*Math.cos(a),cy+Math.sin(a)*m.torso*.55,Math.cos(angle)*D*.69*Math.cos(a)]);}for(let i=1;i<pts.length;i++)tube(list,pts[i-1],pts[i],.007*m.k,'chest',o.accent,5);}
  }else if(o.top==='lighthouse'){
   for(const t of [.25,.60])part(list,new THREE.CylinderGeometry(W*.51,W*.51,m.torso*.11,24,1,true),'chest',o.accent,M(0,hipY+m.torso*t,0,0,0,0,1,1,D/W));
   part(list,new THREE.TorusGeometry(W*.11,.012*m.k,8,18),'chest',o.accent,M(0,hipY+m.torso*.79,D*.38));
   ball(list,W*.09,[0,hipY+m.torso*.79,D*.38],'chest','#7fb0d8',[1,1,.2],12,8);
  }else{
   for(const side of [-1,1]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([side*W*.42,hipY+m.torso*.24,-D*.15,side*W*.9,hipY+m.torso*.49,-D*.15,side*W*.42,hipY+m.torso*.83,-D*.15],3));g.computeVertexNormals();part(list,g,'chest',o.accent);const back=g.clone();back.scale(1,1,-1);part(list,back,'chest',o.accent);}
   for(let i=0;i<3;i++)ball(list,.026*m.k,[(i-1)*W*.19,cy,D*.52],'chest',o.accent,[1,1,.35],8,6);
  }
 }
 if(!swim&&o.top==='apron'){
  const topY=hipY+m.torso*.75,bottomY=hipY-m.thigh*.78;
  const apron=new THREE.PlaneGeometry(W*.7,topY-bottomY,8,14);apron.translate(0,(topY+bottomY)/2,0);
  const positions=apron.attributes.position,skirt=['skirt','longskirt'].includes(o.bottom),len=o.bottom==='longskirt'?m.thigh+m.shin*.85:m.thigh*.9;
  for(let i=0;i<positions.count;i++){
   const y=positions.getY(i),t=(y-hipY)/m.torso;
   const radius=y>=hipY?W/2*latheRadius(prof,t):skirt?THREE.MathUtils.lerp(m.hips*.53,m.hips*.66+len*.22,THREE.MathUtils.clamp((hipY+.03-y)/len,0,1)):W*.52;
   const x=positions.getX(i)*(y>hipY?1-THREE.MathUtils.clamp(t,0,1)*.25:1);
   positions.setXYZ(i,x,y,radius*D/W*Math.sqrt(Math.max(.05,1-(x/radius)**2))+.025*m.k);
  }apron.computeVertexNormals();
  // Follow the blouse above the waist and fold onto the lap below it.
  const drape=p=>{if(p.y>hipY){const chest=THREE.MathUtils.smoothstep(p.y,hipY,hipY+m.torso*.35);return [['hips',1-chest],['chest',chest]];}const leg=THREE.MathUtils.smoothstep(hipY-p.y,.02,.12),w=THREE.MathUtils.smoothstep(p.x,-W*.25,W*.25);return [['hips',1-leg],['thighL',leg*w],['thighR',leg*(1-w)]];};
  part(list,apron,drape,new THREE.Color(o.topColour).multiplyScalar(1.12).getHex());
 }

 // Arms: one soft piece from shoulder to wrist, bending at the elbow; a sleeve over the
 // top that rounds into the shoulder; a round hand.
 const longSleeve=!swim&&SLEEVED_LONG.includes(o.top);
 const armT=m.upper/(m.upper+m.fore);
 for(const s of ['L','R']){
  const sx=s==='L'?1:-1,sh=[sx*m.shoulderX,m.shoulderY,0],hd=[sx*(m.shoulderX+.015),m.shoulderY-m.upper-m.fore,0];
  const arm={bone:'shoulder'+s,joints:[[armT,'shoulder'+s,'elbow'+s]]};
  // A long sleeve is the arm itself, in the shirt, with the print and the cuff painted on.
  limb(list,sh,hd,m.armR*1.04,m.armR*.86,swim||!longSleeve?skin:top,longSleeve?{...arm,uvAt:p=>sleeveUV(p,sh,hd,sx)}:arm);
  // The shoulder: a rounded cap over the joint, in the shirt, that joins the arm to the
  // torso. Its inner side stays with the chest and its outer side goes with the arm, so
  // it stretches over a raised arm rather than coming apart from the body.
  const capShare=p=>{const w=THREE.MathUtils.smoothstep(Math.abs(p.x),m.shoulderX-m.armR*1.1,m.shoulderX+m.armR*.3);return [['chest',1-w],['shoulder'+s,w]];};
  // Flattened on top so the shoulder slopes from the neck rather than standing up in a pad.
  part(list,new THREE.SphereGeometry(m.armR*1.18,16,12),capShare,swim||tank||o.top==='sundress'?skin:top,M(sh[0]-sx*m.armR*.12,sh[1]-m.armR*.05,0,0,0,0,1,.62,Math.min(1.1,D/W*1.6)));
  // A short sleeve: one closed, rounded sleeve over the top of the arm, starting inside the
  // shoulder cap and lent to the chest at its top, so the shirt runs from the neck to the
  // hem without a seam. A kariyushi's is a little roomier and boxier, as real ones are.
  // Its print and its hem band are painted (garment.js), not separate pieces.
  if(!swim&&!longSleeve&&!tank&&o.top!=='sundress'){
   const roomy=o.top==='kariyushi',a0=[sh[0]-sx*m.armR*.05,sh[1]+m.armR*.08,0],a1=[sh[0]+sx*.008,sh[1]-m.upper*(roomy?.52:.56),0];
   limb(list,a0,a1,m.armR*(roomy?1.20:1.16),m.armR*(roomy?1.16:1.12),top,{...arm,joints:[],root:['chest',.55,.3],uvAt:p=>sleeveUV(p,a0,a1,sx)});
  }
  // A mitten hand: the palm, a little flattened, and a thumb on its front inner side,
  // so a wave or a point reads as a hand rather than a ball on a stick.
  ball(list,m.hand,[hd[0],hd[1]-m.hand*.55,0],'hand'+s,skin,[.9,1.15,.78],12,10);
  ball(list,m.hand*.42,[hd[0]-sx*m.hand*.55,hd[1]-m.hand*.35,m.hand*.42],'hand'+s,skin,[1,1.2,1],8,6);
 }
 // An island shirt worn out over the shorts: the hem below the waist is its own short skirt of
 // shirt, printed like the rest of it, and it swings on the hem quarters (springs.js).
 if(!swim&&o.top==='kariyushi'){
  // Its top tucks just inside the shirt above, so the two read as one piece of cloth; the
  // print is the shirt's own, painted down to this hem (garment.js).
  const hem=hemSpec(recipe,m),rTop=W/2*latheRadius(prof,(hem.waist-hipY)/m.torso)*.97;
  const ring=new THREE.CylinderGeometry(rTop,hem.rx*1.04,hem.length,32,4,true);
  part(list,ring,quarterShare(hem,()=>[['hips',1]]),top,M(0,hem.waist-hem.length/2,0,0,0,0,1,1,D/W),p=>torsoUV(p,m));
 }
 // Legs and shoes; shorts and skirts show the knees.
 const b=swim?'swim':o.bottom;
 for(const s of ['L','R']){
  const sx=s==='L'?1:-1,hp=[sx*m.hipX,hipY,0],kn=[sx*m.hipX,hipY-m.thigh,0],an=[sx*m.hipX,m.foot,0];
  const leg={bone:'thigh'+s,joints:[[m.thigh/(hipY-m.foot),'thigh'+s,'knee'+s]]};
  const trousers=b==='trousers'||b==='widepants';
  limb(list,hp,an,m.legR*(b==='widepants'?1.32:1.02),m.legR*(b==='widepants'?1.28:.86),trousers?bottom:skin,leg);
  if(b==='cropped'||b==='culottes'){const end=b==='cropped'?m.foot+m.shin*.35:hipY-m.thigh*1.12;limb(list,hp,[hp[0],end,0],m.legR*(b==='culottes'?1.55:1.12),m.legR*(b==='culottes'?1.7:1.16),bottom,leg);}
  // Shorts and trunks: a wider piece over the top of the thigh.
  if(b==='shorts'||b==='swim')limb(list,[hp[0],hp[1]+m.legR*.3,0],[hp[0]*1.04,hipY-m.thigh*(b==='swim'?.22:.55),0],m.legR*1.2,m.legR*1.26,bottom,{...leg,joints:[]});
  // Underwear: short briefs, snug over the top of the thigh.
  if(b==='underwear')limb(list,[hp[0],hp[1]+m.legR*.3,0],[hp[0]*1.02,hipY-m.thigh*.16,0],m.legR*1.12,m.legR*1.14,bottom,{...leg,joints:[]});
  // Feet: bare (and at the beach), or in sandals, sneakers or leather shoes.
  const wear=swim?'barefoot':o.footwear;
  if(wear==='barefoot'||wear==='sandals'){
   ball(list,m.legR*1.12,[sx*m.hipX,m.foot*.55,m.legR*.5],'foot'+s,skin,[1,.55,1.7],12,8);
   if(wear==='sandals'){
    // Setta: a flat sole and a thong strap over the top of the foot.
    ball(list,m.legR*1.24,[sx*m.hipX,m.foot*.12,m.legR*.55],'foot'+s,recipe.age==='elder'?'#6b4a32':'#c8a878',[1,.18,1.8],12,6);
    ball(list,m.legR*.42,[sx*m.hipX,m.foot*.55+m.legR*.55,m.legR*.95],'foot'+s,o.shoes,[2.3,.5,.8],10,6);
   }
  }else{
   ball(list,m.legR*1.25,[sx*m.hipX,m.foot*.62,m.legR*.55],'foot'+s,o.shoes,[1,.6,wear==='shoes'?1.85:1.75],12,8);
   if(wear==='boots')limb(list,[sx*m.hipX,m.foot,0],[sx*m.hipX,m.foot+m.shin*.65,0],m.legR*1.08,m.legR*1.05,o.shoes,{bone:'knee'+s,joints:[]});
   // The sole: white rubber on a sneaker, dark under a leather shoe or an elder's.
   ball(list,m.legR*1.32,[sx*m.hipX,m.foot*.16,m.legR*.6],'foot'+s,wear==='shoes'?'#2b2622':recipe.age==='elder'?'#6b4a32':'#f2efe6',[1,.24,1.8],12,6);
  }
 }
 if(b==='skirt'||b==='longskirt'||b==='pleatedskirt'){
  const len=b==='skirt'||b==='pleatedskirt'?m.thigh*.9:m.thigh+m.shin*.85;
  // The skirt hangs from the hips and, lower down, goes with the legs: seated, it lies on the lap.
  const drape=p=>{const leg=THREE.MathUtils.smoothstep(hipY-p.y,.02,.12),w=THREE.MathUtils.smoothstep(p.x,-W*.25,W*.25);return [['hips',1-leg],['thighL',leg*w],['thighR',leg*(1-w)]];};
  const skirt=new THREE.CylinderGeometry(m.hips*.53,m.hips*.66+len*.22,len,b==='pleatedskirt'?64:24,6,true);if(b==='pleatedskirt'){const pos=skirt.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),f=1+.055*Math.cos(Math.atan2(z,x)*16);pos.setXYZ(i,x*f,pos.getY(i),z*f);}skirt.computeVertexNormals();}
  const hem=hemSpec(recipe,m);
  part(list,skirt,hem?quarterShare(hem,drape):drape,o.bottomPattern==='plaid'?(p=>{const vertical=Math.floor((Math.atan2(p.x,p.z)*12/Math.PI))%4===0,horizontal=Math.floor((hipY-p.y)/(.06*m.k))%4===0;return vertical||horizontal?o.accent:bottom;}):bottom,M(0,waist-len/2,0,0,0,0,1,1,D/W));
 }
}

/**
 * Ink outlines for people: an inverted hull.
 *
 * The town's ink is a screen pass over the depth buffer, which finds a building's
 * silhouette but loses a person against whatever is behind them, and never draws the
 * line where hair meets face (docs/AMPLIFY-AUDIT.md, C5). So every avatar carries a
 * second, back-faced copy of its body pushed out along the normals, as Guilty Gear
 * Xrd and most cel-shaded games draw their characters. It shares the body's geometry
 * and skeleton, so it animates with it and the hat's draw range applies to both.
 * The line takes a darkened version of the colour under it rather than black, so a
 * yellow shirt gets an ochre line and skin a warm brown, the way an animator inks.
 */
export const OUTLINE_WIDTH=.011;
const outlineMaterials=new Map();
export function outlineMaterial({skinned=true,colour=null,width=OUTLINE_WIDTH}={}){
 const key=(skinned?'s':'m')+(colour??'v')+width;
 if(outlineMaterials.has(key))return outlineMaterials.get(key);
 const material=new THREE.MeshBasicMaterial({color:colour??0xffffff,vertexColors:colour==null,side:THREE.BackSide});
 material.name='Shimanchu outline';material.userData.outline=true;
 const uniform={value:width};
 material.onBeforeCompile=shader=>{
  shader.uniforms.uOutline=uniform;
  shader.vertexShader='uniform float uOutline;\n'+shader.vertexShader.replace('#include <project_vertex>',
   (skinned?'vec3 outlineN = normalize( objectNormal ) * ink;\n':'vec3 outlineN = normalize( position );\n')+
   'transformed += outlineN * uOutline;\n#include <project_vertex>');
  if(skinned)shader.vertexShader='attribute float ink;\n'+shader.vertexShader;
  if(colour==null)shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb *= vec3( 0.32, 0.27, 0.27 );');
 };
 material.customProgramCacheKey=()=>'shimanchu-outline-'+key;
 outlineMaterials.set(key,material);return material;
}
function addOutline(parent,mesh,skinned){
 const line=skinned?new THREE.SkinnedMesh(mesh.geometry,outlineMaterial({skinned:true})):new THREE.Mesh(mesh.geometry,outlineMaterial({skinned:false,colour:0x4a3028}));
 line.name=mesh.name+' outline';line.castShadow=false;line.receiveShadow=false;line.frustumCulled=false;line.userData.outline=true;
 if(skinned){line.bind(mesh.skeleton,mesh.bindMatrix);parent.add(line);}else mesh.add(line);
 return line;
}

/** The face texture and the head it lives on. */
function buildHead(recipe,m,faceSize){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=faceSize;
 const ctx=canvas.getContext('2d');
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 let g=new THREE.SphereGeometry(1,36,26);
 const pos=g.attributes.position,uv=g.attributes.uv,v=new THREE.Vector3();
 // The face is projected onto the front of the sphere; everything else samples the
 // canvas edge, which is plain skin.
 const PHI0=Math.PI/2-.95,PHI=1.9,TH0=Math.PI*.28,TH=Math.PI*.58;
 for(let i=0;i<pos.count;i++){
  v.fromBufferAttribute(pos,i);
  const phi=Math.atan2(v.z,-v.x),theta=Math.acos(THREE.MathUtils.clamp(v.y,-1,1));
  uv.setXY(i,THREE.MathUtils.clamp((phi-PHI0)/PHI,.002,.998),THREE.MathUtils.clamp(1-(theta-TH0)/TH,.002,.998));
  shapeHeadPoint(v,m.profile);pos.setXYZ(i,v.x,v.y,v.z);
 }
 g.scale(m.Rh*m.headSX,m.Rh*m.headSY,m.Rh*.98);g.computeVertexNormals();
 // The face is shaded as if it were flat and tipped up to the light, as a drawn face
 // is: a sphere's own normals put a hard shadow line straight across the cheeks.
 const nrm=g.attributes.normal,n=new THREE.Vector3(),toward=new THREE.Vector3(0,.4,.92).normalize();
 for(let i=0;i<nrm.count;i++){n.fromBufferAttribute(nrm,i);n.lerp(toward,THREE.MathUtils.smoothstep(n.z,-.35,.45)*.7).normalize();nrm.setXYZ(i,n.x,n.y,n.z);}
 // atan2 wraps on the rear/side seam. Interpolating from u=0 to u=1
 // across a triangle paints the whole face there, including red lips.
 // Give those triangles their own plain-skin UVs, retaining smooth normals.
 const indexed=g;g=indexed.toNonIndexed();indexed.dispose();
 const P=g.attributes.position,U=g.attributes.uv;
 for(let i=0;i<P.count;i+=3){
  const us=[U.getX(i),U.getX(i+1),U.getX(i+2)];
  const rear=P.getZ(i)<=0&&P.getZ(i+1)<=0&&P.getZ(i+2)<=0;
  if(rear||Math.max(...us)-Math.min(...us)>.5)
   for(let j=0;j<3;j++)U.setXY(i+j,.002,.002);
 }
 // Cel-shaded like the town, on its high-key ramp, and a little self-lit so a face in
 // a dim room still reads.
 const material=celFrom(new THREE.MeshStandardMaterial({map:texture,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.05}),{bands:'soft3'});
 const head=new THREE.Mesh(g,material);head.name='Shimanchu head';
 head.position.y=m.headCentre-m.headY;
 return {head,canvas,ctx,texture};
}

/**
 * @param {object} input recipe (anything; it is normalized)
 * @param {{shadows?:boolean,faceSize?:number}} [options]
 */
function addNose(parts,recipe,m){
 if(recipe.nose.style==='none')return;
 const layout=faceLayout(recipe),theta=Math.PI*.28+layout.noseY/256*Math.PI*.58,phi=Math.PI/2-.95+layout.noseX/256*1.9;
 const v=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
 const hook=recipe.nose.style==='hook',wide=recipe.nose.style==='wide';
 const radius=m.Rh*(.065+recipe.nose.size*.055);
 ball(parts,radius,[v.x*m.Rh*m.headSX,m.headCentre+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+radius*.55],'head',recipe.body.skin,
  [wide?1.45:.85,hook?1.55:.85,hook?1.65:1.2],12,10);
}

export function buildAvatar(input,{shadows=true,faceSize=256}={}){
 const recipe=normalizeRecipe(input),m=measure(recipe);
 const swing=springRest(recipe,m),rest={...restPositions(m),...swing.rest},bones={},list=BONES.map(name=>{const b=new THREE.Bone();b.name=name;bones[name]=b;return b;});
 for(const name of BONES){
  const b=bones[name],p=rest[name],parent=PARENT[name];
  if(parent){const q=rest[parent];b.position.set(p[0]-q[0],p[1]-q[1],p[2]-q[2]);bones[parent].add(b);}else b.position.set(...p);
 }
 const parts=[];
 addBody(parts,recipe,m,false);
 // Fingers share the body's skinning and draw call, and fold inside the mitten at rest.
 const fingerStart=parts.reduce((n,g)=>n+g.attributes.position.count,0);
 for(const side of ['L','R']){const sx=side==='L'?1:-1,x=sx*(m.shoulderX+.015),y=m.shoulderY-m.upper-m.fore;
  for(let i=0;i<4;i++)part(parts,new THREE.CapsuleGeometry(m.hand*.105,m.hand*(i===0||i===3?.40:.60),3,6),'hand'+side,recipe.body.skin,M(x+(i-1.5)*m.hand*.37,y-m.hand*(i===0||i===3?1.65:1.85),m.hand*.04,0,0,(i-1.5)*.16));
 }
 const fingerEnd=parts.reduce((n,g)=>n+g.attributes.position.count,0);
 addNose(parts,recipe,m);
 // Ears.
 for(const s of [-1,1])ball(parts,m.Rh*.2,[s*m.Rh*m.headSX*.97,m.headCentre-m.Rh*.08,-m.Rh*.05],'head',recipe.body.skin,[.55,1,.8],8,6);
 addHair(parts,recipe,m);addAccessories(parts,recipe,m);
 // The hat goes in last, so taking it off is drawing one range shorter: people hang it
 // up when they get home (home-residents.js) and put it back on to go out.
 const hatStart=parts.reduce((n,g)=>n+g.attributes.position.count,0);addHat(parts,recipe,m);
 const hatHairRanges=[];let hairOffset=0;
 for(const g of parts){if(g.userData.hatHair)hatHairRanges.push({offset:hairOffset,original:g.userData.hatHair,tucked:{position:g.attributes.position.array.slice(),normal:g.attributes.normal.array.slice()}});hairOffset+=g.attributes.position.count*3;}
 let hairCovered=true;
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
 const hasHat=geometry.attributes.position.count>hatStart;
 geometry.computeBoundingSphere();
 const material=bodyMaterial(recipe,m);
 const body=new THREE.SkinnedMesh(geometry,material);body.name='Shimanchu body';
 body.add(bones.root);body.bind(new THREE.Skeleton(list));
 body.castShadow=shadows;body.receiveShadow=true;body.frustumCulled=false;
 // Swimwear is a second body, swapped in at the onsen.
 let swimBody=null,alternativeBody=null,alternativeOutline=null,alternativeKey=null;
 const face=buildHead(recipe,m,faceSize);
 face.head.castShadow=shadows;face.head.receiveShadow=true;
 bones.head.add(face.head);
 const root=new THREE.Group();root.name='Shimanchu · '+(recipe.name||'resident');
 // Keep the skeleton and face visible when a clothing mesh is swapped out.
 root.add(body,bones.root);root.rotation.y=Math.PI;
 const outline=addOutline(root,body,true);addOutline(face.head,face.head,false);
 const openFingerPositions=geometry.attributes.position.array.slice(fingerStart*3,fingerEnd*3),closedFingerPositions=openFingerPositions.slice();
 for(let i=fingerStart;i<fingerEnd;i++){const sx=geometry.attributes.skinIndex.getX(i)===BI.handL?1:-1,j=(i-fingerStart)*3;closedFingerPositions[j]=sx*(m.shoulderX+.015);closedFingerPositions[j+1]=m.shoulderY-m.upper-m.fore-m.hand*.55;closedFingerPositions[j+2]=0;}
 geometry.attributes.position.array.set(closedFingerPositions,fingerStart*3);let handsOpen=false;
 const avatar={
  recipe,measure:m,root,body,bones,face,height:m.H,hasHat,garment:material.userData.garment,springSetup:swing,springs:null,
  setOpenHands(on){on=!!on;if(handsOpen===on)return;handsOpen=on;geometry.attributes.position.array.set(on?openFingerPositions:closedFingerPositions,fingerStart*3);geometry.attributes.position.needsUpdate=true;},
  /** Hat on or off. Off, it is somebody else's job to show where it went (buildHatProp). */
  setHat(on){geometry.setDrawRange(0,on||!hasHat?Infinity:hatStart);if(hairCovered!==!!on){for(const range of hatHairRanges){const source=on?range.tucked:range.original;geometry.attributes.position.array.set(source.position,range.offset);geometry.attributes.normal.array.set(source.normal,range.offset);}if(hatHairRanges.length){geometry.attributes.position.needsUpdate=true;geometry.attributes.normal.needsUpdate=true;}hairCovered=!!on;}},
  get hatOn(){return hasHat&&geometry.drawRange.count===Infinity;},
  faceState:{expression:'neutral',blink:0,talk:0,look:[0,0]},
  /** Repaint the face if what it is doing has changed. */
  paintFace(state){
   const s=avatar.faceState,n={...s,...state};
   const key=n.expression+'|'+(n.blink>.5?1:0)+'|'+(n.talk>.5?1:0)+'|'+Math.round(n.look[0]*2)+','+Math.round(n.look[1]*2);
   if(key===avatar.faceKey)return false;
   avatar.faceKey=key;Object.assign(s,n);
   drawFace(face.ctx,recipe,{...n,size:face.canvas.width});face.texture.needsUpdate=true;return true;
  },
  /** 'swim' or 'clothes'. */
  wear(outfit){
   if(['nozomi','sailor'].includes(outfit)&&alternativeKey!==outfit){alternativeBody?.removeFromParent();alternativeOutline?.removeFromParent();alternativeBody?.geometry.dispose();alternativeKey=outfit;const r=normalizeRecipe({...recipe,outfit:{...recipe.outfit,...(outfit==='sailor'?THUAN_SAILOR_OUTFIT:SHOPPING_LANE_OUTFIT)}}),parts=[];addBody(parts,r,m);addNose(parts,r,m);for(const s of [-1,1])ball(parts,m.Rh*.2,[s*m.Rh*m.headSX*.97,m.headCentre-m.Rh*.08,-m.Rh*.05],'head',recipe.body.skin,[.55,1,.8],8,6);addHair(parts,r,m);const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());alternativeBody=new THREE.SkinnedMesh(g,bodyMaterial(r,m));alternativeBody.name=outfit==='sailor'?'Thuan · harbour academy sailor':'Thuan · shopping lane outfit';alternativeBody.bind(body.skeleton,body.bindMatrix);alternativeBody.castShadow=shadows;alternativeBody.frustumCulled=false;root.add(alternativeBody);alternativeOutline=addOutline(root,alternativeBody,true);}
   if(outfit==='swim'&&!swimBody){
    const parts=[];addBody(parts,recipe,m,true);addNose(parts,recipe,m);for(const s of [-1,1])ball(parts,m.Rh*.2,[s*m.Rh*m.headSX*.97,m.headCentre-m.Rh*.08,-m.Rh*.05],'head',recipe.body.skin,[.55,1,.8],8,6);
    addHair(parts,{...recipe,outfit:{...recipe.outfit,hat:'none'}},m);
    const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());
    swimBody=new THREE.SkinnedMesh(g,material);swimBody.name='Shimanchu swimwear';swimBody.bind(body.skeleton,body.bindMatrix);
    swimBody.castShadow=shadows;swimBody.frustumCulled=false;root.add(swimBody);
   }
   // What swings depends on what is worn: Thuan's sailor skirt, Johansson's shirt hem, nothing in the bath.
   const worn=outfit==='sailor'?{...recipe,outfit:{...recipe.outfit,...THUAN_SAILOR_OUTFIT}}:outfit==='nozomi'?{...recipe,outfit:{...recipe.outfit,...SHOPPING_LANE_OUTFIT}}:outfit==='swim'?{...recipe,outfit:{...recipe.outfit,top:'tank',bottom:'shorts'}}:recipe;
   if(avatar.springKey!==outfit){avatar.springKey=outfit;avatar.springs?.reset();avatar.springSetup=springRest(normalizeRecipe(worn),m);avatar.springs=createSprings(avatar);}
   body.visible=outfit!=='swim'&&!['nozomi','sailor'].includes(outfit);outline.visible=body.visible;if(alternativeBody){alternativeBody.visible=outfit===alternativeKey;alternativeOutline.visible=alternativeBody.visible;}if(swimBody)swimBody.visible=outfit==='swim';
  },
  dispose(){geometry.dispose();material.dispose();material.map?.dispose();if(alternativeBody){alternativeBody.material.map?.dispose();alternativeBody.material.dispose();}face.texture.dispose();face.head.geometry.dispose();face.head.material.dispose();swimBody?.geometry.dispose();alternativeBody?.geometry.dispose();},
 };
 avatar.springs=createSprings(avatar);
 avatar.paintFace({});
 return avatar;
}
