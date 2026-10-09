import {THUAN_SAILOR_OUTFIT,AFTERBATH,houseDressColour} from './outfits.js';
import {SPRING_BONES,SPRING_PARENT,springRest,chainShare,quarterShare,hemSpec,createSprings} from './springs.js';
import {SHOPPING_LANE_OUTFIT} from '../world/shopping-lane-plan.js';
import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries,mergeVertices} from '../../vendor/BufferGeometryUtils.js';
import {normalizeRecipe} from './recipe.js';
import {drawFace,faceLayout} from './face.js';
import {headProfile,shapeHeadPoint} from './head-profile.js';
import {celFrom} from '../render/cel.js';
import {createTowelFit} from './towel-fit.js';
import {GARMENT,PLAIN_UV,torsoUV,sleeveUV,paintGarment,SLEEVED_LONG,CAMP_COLLAR} from './garment.js';

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
/**
 * The camp collar's leaf and lapel, one piece of cloth each side: the CAMP_COLLAR outline
 * laid onto the chest and given a few millimetres of thickness, so it has an edge the ink
 * outline follows and catches the light, plain cloth with no print. The outline is cut
 * into small triangles first so the cloth bends with the chest rather than cutting into it.
 */
function campCollar(list,m,prof,colour){
 const W=m.width,D=m.depth,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 for(const s of [-1,1]){
  const outline=CAMP_COLLAR.map(([f,t])=>new THREE.Vector2(f,t));
  let tris=THREE.ShapeUtils.triangulateShape(outline,[]).map(t=>t.map(i=>[outline[i].x,outline[i].y]));
  for(let k=0;k<3;k++)tris=tris.flatMap(([a,b,c])=>{const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);return [[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]];});
  // On the chest, lifted off it: out from the body's axis, and up a little where the chest
  // turns over into the shoulder.
  const at=([f,t],lift)=>{const r=latheRadius(prof,t),x=s*f*W/2*r,z=D/2*r*Math.sqrt(Math.max(0,1-f*f)),q=Math.hypot(x,z)||1,k=1+lift/q;
   return new THREE.Vector3(x*k,m.hipY+t*m.torso+lift*THREE.MathUtils.smoothstep(t,.9,1.02),z*k);};
  const top=.011*m.k,under=.003*m.k,pos=[],centre=at([.5,.84],0);
  const face=(a,b,c)=>{const n=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)),out=a.clone().add(b).add(c).multiplyScalar(1/3).sub(centre.clone().multiplyScalar(.2));
   if(n.dot(out)<0)[b,c]=[c,b];pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);};
  for(const [a,b,c] of tris){face(at(a,top),at(b,top),at(c,top));const A=at(a,under),B=at(b,under),C=at(c,under),n=new THREE.Vector3().subVectors(B,A).cross(new THREE.Vector3().subVectors(C,A));
   // The underside faces into the body.
   if(n.dot(A)>0)pos.push(A.x,A.y,A.z,C.x,C.y,C.z,B.x,B.y,B.z);else pos.push(A.x,A.y,A.z,B.x,B.y,B.z,C.x,C.y,C.z);}
  // The edge all round, in the same steps as the triangles' edges.
  const ring=[];CAMP_COLLAR.forEach((p,i)=>{const q=CAMP_COLLAR[(i+1)%CAMP_COLLAR.length];for(let j=0;j<8;j++)ring.push([p[0]+(q[0]-p[0])*j/8,p[1]+(q[1]-p[1])*j/8]);});
  const c2=at([.45,.85],top);
  ring.forEach((p,i)=>{const q=ring[(i+1)%ring.length],a=at(p,under),b=at(q,under),c=at(q,top),d=at(p,top),n=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(d,a)),away=a.clone().add(c).multiplyScalar(.5).sub(c2);
   if(n.dot(away)>=0)pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z,a.x,a.y,a.z,c.x,c.y,c.z,d.x,d.y,d.z);else pos.push(a.x,a.y,a.z,c.x,c.y,c.z,b.x,b.y,b.z,a.x,a.y,a.z,d.x,d.y,d.z,c.x,c.y,c.z);});
  let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g=mergeVertices(g,1e-5);g.computeVertexNormals();
  // A light ink line round the collar, none along the open V: there the outline would
  // draw on the skin beside the edge and cross where the lapels meet at the button.
  const piece=part(list,g,'chest',colour),Q=piece.attributes.position,ink=piece.attributes.ink;
  for(let i=0;i<Q.count;i++){const t=(Q.getY(i)-m.hipY)/m.torso,f=Math.abs(Q.getX(i))/(W/2*latheRadius(prof,THREE.MathUtils.clamp(t,0,1.04))),edgeV=.035+(.62-.035)*THREE.MathUtils.clamp((t-.73)/.28,0,1);
   ink.setX(i,.55*THREE.MathUtils.smoothstep(f-edgeV,.04,.14));}
 }
}

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
 pixie:{front:.36,swoop:.2,side:-.04,back:-.42,radius:1.06,faceHalf:.78},
 shoulder:{front:.28,side:-.42,back:-.56,radius:1.1,faceHalf:.66},
 // Parted in the middle, the fringe falling away to both sides.
 curtains:{front:.5,centre:.3,side:-.14,back:-.5,radius:1.09,faceHalf:.72},
 slick:{front:.62,side:.04,back:-.5,radius:1.04,faceHalf:.82},
 mullet:{front:.46,side:.0,back:-.78,radius:1.08,faceHalf:.78},
 // The old island topknot (katakashira): close at the sides, a knot on the crown.
 topknot:{front:.56,side:.08,back:-.36,radius:1.04,faceHalf:.8},
 pigtails:{front:.4,side:-.1,back:-.3,radius:1.08,faceHalf:.76},
 twinbuns:{front:.42,side:-.04,back:-.36,radius:1.08,faceHalf:.76},
});
function hairCap(style,flip,spec=HAIR[style]){
 if(!spec)return null;
 if(spec.ring)return hairRing(spec);
 const g=new THREE.SphereGeometry(1,64,44),pos=g.attributes.position,v=new THREE.Vector3();
 const side=flip?-1:1;
 // How far each point is into the hair (the field below) and how much of the hair it is (0 tucked inside the head,
 // 1 on the hair's surface): the hair states (setHairState) reshape by them.
 const keepAt=new Float32Array(pos.count),fieldAt=new Float32Array(pos.count);g.userData.hairField={keep:keepAt,field:fieldAt};
 for(let i=0;i<pos.count;i++){
  v.fromBufferAttribute(pos,i);
  // The fringe: straight across, or swept down to one side from a parting.
  let front=spec.front;
  if(spec.swoop)front-=spec.swoop*THREE.MathUtils.smoothstep(v.x*side,-.3,.5);
  if(spec.centre)front-=spec.centre*THREE.MathUtils.smoothstep(Math.abs(v.x),.04,.42);
  // How far this point is inside the hair (positive) or out of it (negative): outside the
  // face opening and above the line at the sides and back. A smooth field rather than a
  // yes/no, so the hairline is a clean curve where the cap meets the head, not stair steps.
  const outFace=Math.max(.18-v.z,Math.abs(v.x)-spec.faceHalf,v.y-front);
  const low=THREE.MathUtils.lerp(spec.side,spec.back,THREE.MathUtils.smoothstep(-v.z,-.2,.7));
  const f=Math.min(outFace,v.y-low),keep=f>0;
  // Bare scalp is tucked just inside the head; a close crop needs only a short step.
  const full=spec.radius*(1+(spec.lift&&v.y>0?v.y*spec.lift:0)),inner=spec.radius<1.04?.985:.8;
  const w=THREE.MathUtils.smoothstep(f,-.035,.035),r=THREE.MathUtils.lerp(inner,full,w);keepAt[i]=w;fieldAt[i]=f;
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
 if(cap){const p=cap.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);shapeHeadPoint(v,m.profile);p.setXYZ(i,v.x,v.y,v.z);}cap.computeVertexNormals();
  // The cap's own field, laid out the way part() lays out its triangles (one vertex per corner, in index order).
  const hf=cap.userData.hairField,index=cap.index;
  const piece=part(list,cap,'head',c,M(cx,m.headY+cy,0,0,0,0,...S));
  if(hf&&index){const n=index.count,keep=new Float32Array(n),field=new Float32Array(n);for(let i=0;i<n;i++){const j=index.getX(i);keep[i]=hf.keep[j];field[i]=hf.field[j];}piece.userData.hairField={keep,field};}
 }
 const dark=new THREE.Color(c).multiplyScalar(.82).getStyle();
 // What hangs swings on its own chain of bones (springs.js); the rest is the head's.
 const swing=springRest(recipe,m),tailShare=chainShare('head',['hairA','hairB'],[swing.rest.hairA,swing.rest.hairB,swing.chains.find(ch=>ch.kind==='hair')?.tip??swing.rest.hairB]);
 if(style==='long'){ball(list,R*.95,at(0,cy-R*.72,-R*.55),tailShare,c,[1.05,1.25,.5]);}
 if(style==='ponytail'){ball(list,R*.34,at(0,cy+R*.1,-R*1.05),'head',c,[1,1,1]);ball(list,R*.3,at(0,cy-R*.45,-R*1.18),tailShare,c,[.9,1.9,.9]);ball(list,R*.16,at(0,cy+R*.1,-R*1.2),'head',recipe.outfit.accent);}
 if(style==='bun'){ball(list,R*.42,at(0,cy+R*.95,-R*.3),'head',c);}
 if(style==='topknot'){ball(list,R*.24,at(0,cy+R*1.02,-R*.05),'head',c,[1,1.25,1.4],10,8);ball(list,R*.1,at(0,cy+R*.98,-R*.18),'head',dark,[1.3,1,1],8,6);}
 if(style==='twinbuns')for(const s of [-1,1])ball(list,R*.32,at(s*R*.62,cy+R*.82,-R*.18),'head',c);
 if(style==='pigtails')for(const s of [-1,1]){ball(list,R*.2,at(s*R*.92,cy+R*.05,-R*.25),'head',recipe.outfit.accent,[1,1,1],8,6);ball(list,R*.24,at(s*R*1.08,cy-R*.4,-R*.3),'head',c,[.9,1.8,.9]);}
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

/** A shoe (or boot) on the foot of side s ('L' or 'R'): its upper and its sole, tagged so it can come off. */
function addShoe(list,recipe,m,s,wear){
 const o=recipe.outfit,sx=s==='L'?1:-1;
 ball(list,m.legR*1.25,[sx*m.hipX,m.foot*.62,m.legR*.55],'foot'+s,o.shoes,[1,.6,wear==='shoes'?1.85:1.75],12,8).userData.shoe=s;
 if(wear==='boots')limb(list,[sx*m.hipX,m.foot,0],[sx*m.hipX,m.foot+m.shin*.65,0],m.legR*1.08,m.legR*1.05,o.shoes,{bone:'knee'+s,joints:[]});
 // The sole: white rubber on a sneaker, dark under a leather shoe or an elder's.
 ball(list,m.legR*1.32,[sx*m.hipX,m.foot*.16,m.legR*.6],'foot'+s,wear==='shoes'?'#2b2622':recipe.age==='elder'?'#6b4a32':'#f2efe6',[1,.24,1.8],12,6).userData.shoe=s;
}
/** The sock left on a foot whose shoe has come off: pale, and a little smaller than the shoe was. */
export const SOCK=Object.freeze({colour:'#e7e1d3',size:.84});

/**
 * Somebody's shoe on its own (one that has come off: kicked off in a scuffle, left at a door): the same
 * pieces their foot wears, painted the same, inked like them, as a plain mesh. Its sole's middle is at the
 * origin, the toe towards +z. Null for somebody barefoot or in sandals.
 */
export function buildShoeProp(input,{side='R',shadows=true}={}){
 const recipe=normalizeRecipe(input),m=measure(recipe),wear=recipe.outfit.footwear;
 if(wear==='barefoot'||wear==='sandals')return null;
 const parts=[];addShoe(parts,recipe,m,side,wear);
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
 for(const key of ['skinIndex','skinWeight','ink'])geometry.deleteAttribute(key);
 geometry.computeBoundingBox();
 const b=geometry.boundingBox,c=b.getCenter(new THREE.Vector3());
 geometry.translate(-c.x,-b.min.y,-c.z);geometry.computeBoundingSphere();
 const mesh=new THREE.Mesh(geometry,celFrom(new THREE.MeshStandardMaterial({vertexColors:true}),{bands:'soft3'}));
 mesh.name=(recipe.name||'Resident')+'’s shoe';mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.userData.shoeProp=true;
 // its ink line: the same back-faced hull as theirs, pushed out from the shoe's own middle
 const ink=geometry.clone();ink.translate(0,-(b.max.y-b.min.y)/2,0);
 const line=new THREE.Mesh(ink,outlineMaterial({skinned:false}));line.position.y=(b.max.y-b.min.y)/2;line.name=mesh.name+' outline';line.userData.outline=true;mesh.add(line);
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
export const wearsSwimTop=recipe=>recipe.facial.style==='none'&&(['bob','long','ponytail','braids','bun','perm','shoulder','pigtails','twinbuns'].includes(recipe.hair.style)||recipe.mouth.colour!=='#b8544a');
/**
 * Swimwear (wear('swim')), modest, for Umi-no-yu's shared rock bath and the beach: a one-piece costume from the hips to
 * straight across above the bust, on two straps, with short legs, for anyone who would wear a swimsuit top; bath trunks to
 * mid-thigh for everyone else. A woman of the older generation -- an elder, or drawn with the lines of her years (wrinkles,
 * as Mrs Higa is) -- wears the skirted costume her generation swam in: a little skirt over the hips.
 */
export const SWIMSUIT=Object.freeze({top:.79,trunks:.5,legs:.2});
export const wearsSwimSkirt=recipe=>wearsSwimTop(recipe)&&(recipe.age==='elder'||recipe.wrinkles>=.6);

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
/** swim: false for clothes, true for swimwear, 'towel' for the bare body under a bath wrap (addTowel). */
function addBody(list,recipe,m,swim=false){
 const o=recipe.outfit,skin=recipe.body.skin,top=swim?skin:o.topColour,bottom=swim?recipe.swim.colour:o.bottomColour;
 // Under a bath wrap nothing else is worn: the wrap is the garment, so nothing can show through it.
 const bare=swim==='towel',onePiece=swim===true&&wearsSwimTop(recipe);
 const W=m.width,D=m.depth,hipY=m.hipY;
 // The base layer everyone has on under their clothes: a tank top and underwear.
 const tank=!swim&&o.top==='tank',briefs=!swim&&o.bottom==='underwear';
 // A running vest after the bath (outfits.js AFTERBATH) is its own shell over the bare body, like the tank top's.
 const running=!swim&&o.top==='running';
 // The torso: a lathe, full width up to square shoulders that round off into the neck.
 // A sturdier build carries a little more round the middle, so a bare torso is shaped
 // like a body rather than a box.
 const prof=torsoProfile(recipe,m);
 const lathe=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),28);
 // The hem sits on a row of the lathe, so it is a clean line rather than a zigzag.
 // Underwear sits lower than a waistband.
 const waist=hipY+m.torso*(briefs?.05:.13);
 const torsoColour=p=>{
  if(swim)return !bare&&(p.y<waist||onePiece&&p.y<hipY+m.torso*SWIMSUIT.top)?bottom:skin;
  if(p.y<waist)return bottom;
  // Under a tank top the body is bare; the vest is its own garment, added below.
  if(tank||running)return skin;
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
 if(running)runningShirt(list,recipe,m,top);
 // A one-piece costume: the torso itself is painted (torsoColour) to a clean line along a row of the lathe, and two
 // flat straps run from it over the shoulders and down the back to it again.
 if(onePiece)addStraps(list,bodyVolume(recipe,m),m,{x:W/2*.4,from:SWIMSUIT.top-.04,hw:.014*m.k,th:.003*m.k,gap:.002*m.k,colour:bottom,skin:'chest'});
 // Neck.
 tube(list,[0,m.neckY-.02,0],[0,m.headY+.01,0],m.armR*1.08,'neck',skin,8);
 // A kariyushi's open camp collar is modelled, not painted: a stand behind the neck that
 // rolls into the fall over the shoulders and folds back down the front to the V. It is
 // a real edge in silhouette and catches the light, so it reads as a collar, not a bib.
 // The collar's stand is modelled: a band of the shirt round the back and sides of the
 // neck, open at the front, rolling a little outward at the top, so the collar wraps the
 // neck from every side. Its leaves and lapels on the front are cloth too (campCollar).
 if(!swim&&o.top==='kariyushi'){
  const ri=m.armR*1.08+.004*m.k,t=.007*m.k,h=.04*m.k,roll=.012*m.k,open=.68;
  const band=new THREE.LatheGeometry([[ri,0],[ri+t,0],[ri+t+roll,h],[ri+roll*.6,h]].map(([r,y])=>new THREE.Vector2(r,y)).concat([new THREE.Vector2(ri,0)]),24,open,Math.PI*2-open*2);
  // It runs down to nothing at the front, where it turns into the collar's leaves.
  const P=band.attributes.position;for(let i=0;i<P.count;i++){const a=Math.abs(Math.atan2(P.getX(i),P.getZ(i)));P.setY(i,P.getY(i)*THREE.MathUtils.smoothstep(a,open,open+1.1));}band.computeVertexNormals();
  part(list,band,'chest',top,M(0,m.neckY-.012*m.k,0));
  campCollar(list,m,prof,top);
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
  part(list,new THREE.SphereGeometry(m.armR*1.18,16,12),capShare,swim||tank||running||o.top==='sundress'?skin:top,M(sh[0]-sx*m.armR*.12,sh[1]-m.armR*.05,0,0,0,0,1,.62,Math.min(1.1,D/W*1.6)));
  // A short sleeve: one closed, rounded sleeve over the top of the arm, starting inside the
  // shoulder cap and lent to the chest at its top, so the shirt runs from the neck to the
  // hem without a seam. A kariyushi's is a little roomier and boxier, as real ones are.
  // Its print and its hem band are painted (garment.js), not separate pieces.
  if(!swim&&!longSleeve&&!tank&&!running&&o.top!=='sundress'){
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
  if(b==='shorts'||b==='swim'&&!bare)limb(list,[hp[0],hp[1]+m.legR*.3,0],[hp[0]*1.04,hipY-m.thigh*(b==='swim'?(onePiece?SWIMSUIT.legs:SWIMSUIT.trunks):.55),0],m.legR*1.2,m.legR*1.26,bottom,{...leg,joints:[]});
  // Long cotton drawers (ステテコ) after the bath: loose, from the waist to just below the knee, bending there.
  if(b==='suteteko'){const top=[hp[0],hp[1]+m.legR*.3,0],end=[hp[0]*1.04,hipY-m.thigh-m.shin*.18,0],len=top[1]-end[1];
   limb(list,top,end,m.legR*1.3,m.legR*1.22,bottom,{bone:'thigh'+s,joints:[[(top[1]-(hipY-m.thigh))/len,'thigh'+s,'knee'+s]]});}
  // Underwear: short briefs, snug over the top of the thigh.
  if(b==='underwear')limb(list,[hp[0],hp[1]+m.legR*.3,0],[hp[0]*1.02,hipY-m.thigh*.16,0],m.legR*1.12,m.legR*1.14,bottom,{...leg,joints:[]});
  // Feet: bare (and at the beach, and after the bath), or in sandals, sneakers or leather shoes.
  const wear=swim?'barefoot':o.footwear;
  if(wear==='barefoot'||wear==='sandals'){
   ball(list,m.legR*1.12,[sx*m.hipX,m.foot*.55,m.legR*.5],'foot'+s,skin,[1,.55,1.7],12,8);
   if(wear==='sandals'){
    // Setta: a flat sole and a thong strap over the top of the foot.
    ball(list,m.legR*1.24,[sx*m.hipX,m.foot*.12,m.legR*.55],'foot'+s,recipe.age==='elder'?'#6b4a32':'#c8a878',[1,.18,1.8],12,6);
    ball(list,m.legR*.42,[sx*m.hipX,m.foot*.55+m.legR*.55,m.legR*.95],'foot'+s,o.shoes,[2.3,.5,.8],10,6);
   }
  }else addShoe(list,recipe,m,s,wear);
 }
 // The house dress's skirt and an older woman's swimsuit's little skirt are cloth round the legs (addHullSkirt).
 if(b==='housedress')addHullSkirt(list,recipe,m,'housedress',bottom);
 if(b==='swim'&&!bare&&wearsSwimSkirt(recipe))addHullSkirt(list,recipe,m,'swim',bottom);
 if(b==='skirt'||b==='longskirt'||b==='pleatedskirt'){
  const len=b==='skirt'||b==='pleatedskirt'?m.thigh*.9:m.thigh+m.shin*.85;
  // The skirt hangs from the hips and, lower down, goes with the legs: seated, it lies on the lap; and a long skirt,
  // below the knee, goes with the shins, so seated it falls over them instead of sticking out past the knees like a tube.
  const drape=p=>{
   const leg=THREE.MathUtils.smoothstep(hipY-p.y,.02,.12),w=THREE.MathUtils.smoothstep(p.x,-W*.25,W*.25);
   const shin=b==='longskirt'?THREE.MathUtils.smoothstep(hipY-p.y,m.thigh*.82,m.thigh*1.02):0;
   return [['hips',1-leg],['thighL',leg*(1-shin)*w],['thighR',leg*(1-shin)*(1-w)],['kneeL',leg*shin*w],['kneeR',leg*shin*(1-w)]];
  };
  const skirt=new THREE.CylinderGeometry(m.hips*.53,m.hips*.66+len*.22,len,b==='pleatedskirt'?64:24,6,true);if(b==='pleatedskirt'){const pos=skirt.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),f=1+.055*Math.cos(Math.atan2(z,x)*16);pos.setXYZ(i,x*f,pos.getY(i),z*f);}skirt.computeVertexNormals();}
  const hem=hemSpec(recipe,m);
  part(list,skirt,hem?quarterShare(hem,drape):drape,o.bottomPattern==='plaid'?(p=>{const vertical=Math.floor((Math.atan2(p.x,p.z)*12/Math.PI))%4===0,horizontal=Math.floor((hipY-p.y)/(.06*m.k))%4===0;return vertical||horizontal?o.accent:bottom;}):bottom,M(0,waist-len/2,0,0,0,0,1,1,D/W));
 }
}

/**
 * The bath wrap: a yuamigi (湯浴み着), the towel-cloth wrap of a bath where people are seen.
 *
 * Nobody is ever bare at Umi-no-yu. It has a men's and a women's side, each behind its noren, a
 * lobby they share and a bath they share past the bath doors. Behind the noren grown-ups wrap
 * up in one of the bath's own terry wraps from the bandai (this): under the arms to the knees,
 * the end tucked in at the chest, for anyone who would wear a swimsuit top; from the waist to
 * the knees for everyone else. A small folded towel rests on the head, the classic way to keep
 * it out of the water and cool the head (wear('towel',{headTowel:false}) leaves it off, for
 * drying the hair at the mirror). Past the bath doors, in the washing room and the rock bath,
 * everybody wears swimwear (wear('swim')); in the lobby, the after-bath clothes (wear('afterbath')).
 * Children and teenagers keep their swimwear behind the noren too: a wrap that can come undone
 * is no garment for a child splashing about.
 *
 * The wrap is shrink-wrapped round the body: at each height it is the convex outline of the
 * torso and both legs (the arms hang outside it, over the cloth), pushed out by a small gap;
 * then, at each angle round the body, the tightest straight-sided profile that holds every
 * one of those outlines (a towel under tension spans a hollow rather than clinging to it).
 * Below the hips it eases away from the thighs, so a step or a seat moves the legs inside
 * the cloth instead of through it. Its skin is the body's own: the torso's weights above the
 * hips, the skirt's drape onto the thighs below.
 */
// Umi-no-yu's own: off-white terry with the navy band its rental towels carry (onsen-towels.js), so they come back.
export const TOWEL=Object.freeze({colour:'#f2ede2',band:'#2e3e68',fold:'#ddd5c3'});
/** Who wraps up in a bath towel: grown-ups. Children and teenagers keep their swimwear. */
export const wearsBathTowel=recipe=>recipe.age==='adult'||recipe.age==='elder';
/** What this person wears behind Umi-no-yu's noren: 'towel', or 'swim' for the young and anyone who prefers it. */
export function bathOutfit(input){const r=normalizeRecipe(input);return wearsBathTowel(r)&&r.swim.bath!=='swimwear'?'towel':'swim';}
/** Where the wrap runs: under the arms (or the waist) to just above the knee. Pure, for tests. */
export function towelSpan(recipe,m){
 const chest=wearsSwimTop(recipe);
 return {chest,top:m.hipY+m.torso*(chest?.72:.17),hem:m.hipY-m.thigh*.92};
}
/** The convex hull of [x,z] points (monotone chain), anticlockwise. */
function hull2(points){
 const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lower=[],upper=[];
 for(const q of p){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),q)<=0)lower.pop();lower.push(q);}
 for(const q of p.slice().reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),q)<=0)upper.pop();upper.push(q);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}
/** How far from the body's axis a convex outline (round the axis) lies in the direction (x,z). */
function hullReach(hull,x,z){
 let best=Infinity;
 for(let i=0;i<hull.length;i++){
  const a=hull[i],b=hull[(i+1)%hull.length],ex=b[0]-a[0],ez=b[1]-a[1],den=x*ez-z*ex;
  if(Math.abs(den)<1e-12)continue;
  const t=(a[0]*ez-a[1]*ex)/den,u=(a[0]*z-a[1]*x)/den;
  if(t>0&&u>=-1e-9&&u<=1+1e-9)best=Math.min(best,t);
 }
 return best;
}
/** The body's outline at height y in its rest pose: the torso lathe and both legs, as points, `gap` outside. */
function bodySection(prof,m,y,gap){
 const pts=[],t=(y-m.hipY)/m.torso;
 if(t>=-.1&&t<=1.04){const r=latheRadius(prof,THREE.MathUtils.clamp(t,-.1,1.04));for(let i=0;i<64;i++){const a=i/64*Math.PI*2;pts.push([Math.sin(a)*(m.width/2*r+gap),Math.cos(a)*(m.depth/2*r+gap)]);}}
 // The legs as addBody makes them: a capsule from the hip to the ankle, round over the top.
 const r0=m.legR*1.02,r1=m.legR*.86;
 const r=y<=m.hipY&&y>=m.foot?THREE.MathUtils.lerp(r0,r1,(m.hipY-y)/(m.hipY-m.foot)):y>m.hipY&&y<m.hipY+r0?Math.sqrt(r0*r0-(y-m.hipY)**2):0;
 if(r>0)for(const sx of [-1,1])for(let i=0;i<32;i++){const a=i/32*Math.PI*2;pts.push([sx*m.hipX+Math.sin(a)*(r+gap),Math.cos(a)*(r+gap)]);}
 return pts;
}
/** The highest of each [y] list's linear profile: the outer (concave) envelope of (y, r) points sorted by y. */
function outerEnvelope(ys,rs){
 const idx=ys.map((_,i)=>i).sort((a,b)=>ys[a]-ys[b]),h=[];
 for(const i of idx){while(h.length>1){const o=h.at(-2),a=h.at(-1),c=(ys[a]-ys[o])*(rs[i]-rs[o])-(rs[a]-rs[o])*(ys[i]-ys[o]);if(c>=0)h.pop();else break;}h.push(i);}
 return ys.map(y=>{for(let j=1;j<h.length;j++){const a=h[j-1],b=h[j];if(y<=ys[b]+1e-12){const f=(y-ys[a])/((ys[b]-ys[a])||1);return rs[a]+(rs[b]-rs[a])*f;}}return rs[h.at(-1)];});
}
/**
 * Cloth shrink-wrapped round the body from the height `top` down to `hem`: the bath wrap (addTowel), the house dress's skirt
 * and an older woman's swimsuit skirt (addHullSkirt). At each height it is the convex outline of the torso and both legs, a
 * small gap outside, and `ease(y)` more below the hips; then, round the body, the tightest straight-sided profile that holds
 * them all. Its top is folded over and its hem turned under. Returns the cloth, its skin, and where it lies.
 */
function hullCloth(recipe,m,{top,hem,ease}){
 const span={top,hem},prof=torsoProfile(recipe,m),k=m.k,N=48,gap=.007*k,step=.012*k;
 const dirs=Array.from({length:N},(_,i)=>{const a=i/N*Math.PI*2;return [Math.sin(a),Math.cos(a)];});
 const reach=(y,g)=>{const h=hull2(bodySection(prof,m,y,g));return dirs.map(([x,z])=>hullReach(h,x,z));};
 // Rows from the hem up, so the woven band sits exactly on two of them; and every row where the torso's outline turns.
 const ys=[];for(let y=span.hem;y<span.top-step*.5;y+=step)ys.push(y);ys.push(span.top);
 for(const [,t] of prof){const y=m.hipY+t*m.torso;if(y>span.hem+step*2.5&&y<span.top-step*.5&&ys.every(v=>Math.abs(v-y)>step*.2))ys.push(y);}
 ys.sort((a,b)=>b-a);
 const want=ys.map(y=>reach(y,gap).map(r=>r+ease(y)));
 const radius=ys.map(()=>new Array(N));
 for(let i=0;i<N;i++){const env=outerEnvelope(ys,want.map(r=>r[i]));env.forEach((r,j)=>{radius[j][i]=r;});}
 // The top edge is folded over once and rolled a little proud; the hem is turned under.
 const roll=.006*k,rings=[];
 const inner=(y,r)=>rings.push({y,r});
 inner(span.top-.01*k,reach(span.top-.01*k,gap*.35));
 rings.push({y:span.top+.004*k,r:radius[0].map(r=>r+roll*.5)});
 ys.forEach((y,j)=>rings.push({y,r:radius[j].map(r=>r+roll*(1-THREE.MathUtils.smoothstep(span.top-y,0,.016*k)))}));
 const hemR=radius.at(-1),hemIn=reach(span.hem+.004*k,gap*.35);
 rings.push({y:span.hem-.005*k,r:hemR.map(r=>r-.003*k)});
 rings.push({y:span.hem+.003*k,r:hemR.map((r,i)=>Math.max(hemIn[i],r-.011*k))});
 const pos=[],index=[];
 for(const ring of rings)for(let i=0;i<N;i++)pos.push(dirs[i][0]*ring.r[i],ring.y,dirs[i][1]*ring.r[i]);
 for(let j=0;j+1<rings.length;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N,c=(j+1)*N+i,d=(j+1)*N+(i+1)%N;index.push(a,c,b,b,c,d);}
 // Its inside: a lining a few millimetres in, facing in, from the top down to the row above the turned hem, so a look
 // into the hem (seated, from the front) finds the cloth's inner face rather than the dark inside of its ink line. It
 // carries no ink of its own (lining, the triangles from that index on).
 const lining=index.length,inset=.0035*k,first=rings.length;
 for(let j=0;j<ys.length-1;j++)for(let i=0;i<N;i++){const r=radius[j][i]-inset;pos.push(dirs[i][0]*r,ys[j],dirs[i][1]*r);}
 for(let j=0;j+1<ys.length-1;j++)for(let i=0;i<N;i++){const a=(first+j)*N+i,b=(first+j)*N+(i+1)%N,c=(first+j+1)*N+i,d=(first+j+1)*N+(i+1)%N;index.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(index);g.computeVertexNormals();
 // Skin: exactly the torso's above the hips; below, the skirt's drape onto each thigh.
 const share=p=>{
  if(p.y>=m.hipY){const chest=THREE.MathUtils.smoothstep(p.y,m.hipY+m.torso*.15,m.hipY+m.torso*.55);return [['hips',1-chest],['chest',chest]];}
  const leg=THREE.MathUtils.smoothstep(m.hipY-p.y,.02*k,.12*k),w=THREE.MathUtils.smoothstep(p.x,-m.hipX,m.hipX);
  return [['hips',1-leg],['thighL',leg*w],['thighR',leg*(1-w)]];
 };
 return {geometry:g,share,span,rings,dirs,ys,radius,step,lining};
}
/** A hull cloth's part: its lining (from `lining` on in the index, three corners a triangle in part()'s order) without ink. */
function unInk(piece,lining){piece.attributes.ink.array.fill(0,lining);return piece;}
/** The terry wrap round the body, and the end tucked in at the front. Returns where it lies, for the tuck and tests. */
function addTowel(list,recipe,m){
 const k=m.k,s0=towelSpan(recipe,m);
 // Below the hips the cloth stands off the thighs: room for a stride or a seat.
 const {geometry:g,share,span,rings,dirs,ys,radius,step,lining}=hullCloth(recipe,m,{top:s0.top,hem:s0.hem,ease:y=>.028*k*THREE.MathUtils.smoothstep(m.hipY-y,0,m.thigh*.9)});
 span.chest=s0.chest;const N=dirs.length;
 // Off-white terry, matte, with Umi-no-yu's navy band woven a hand's width above the hem.
 const band=[span.hem+step*4.02,span.hem+step*4.98];
 unInk(part(list,g,share,p=>p.y>band[0]&&p.y<band[1]?TOWEL.band:TOWEL.colour),lining);
 // The end of the towel overlaps at the front, on the wearer's left, where the right hand
 // tucks it in: its edge runs down the wrap from the top to the hem, and the corner is tucked
 // under at the top, a small fold standing just proud of the cloth.
 const ti=Math.round(.42/(Math.PI*2)*N),nx=dirs[ti][0],nz=dirs[ti][1],lift=.0025*k;
 const edge=ys.map((y,j)=>new THREE.Vector3(nx*(radius[j][ti]+lift),y,nz*(radius[j][ti]+lift)));
 part(list,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge),ys.length*2,.0032*k,6,false),share,TOWEL.fold);
 const fold=.0045*k,y0=span.top-.006*k,y1=y0-.03*k,r=Math.max(radius[0][ti],radius[Math.min(3,ys.length-1)][ti]);
 part(list,new THREE.SphereGeometry(1,10,12),share,TOWEL.fold,M(nx*(r+fold*.3),(y0+y1)/2,nz*(r+fold*.3),0,Math.atan2(nx,nz),.5,.016*k,(y0-y1)/2,fold));
 return {span,rings,dirs};
}
/**
 * Skirts that are cloth round the legs rather than a bell from the hips (hullCloth), so seated they lie on the lap as the
 * wrap does instead of standing up over it, and are fitted out of the legs and onto the seat as they are drawn (fit):
 * - the house dress's (after the bath): from just above the waist (where the bodice is sewn on) to just below the knee,
 *   loose, flaring a little to the hem;
 * - an older woman's swimsuit's (wearsSwimSkirt): from the waist to the top of the thigh.
 * Heights: `top` a fraction of the torso above the hips, `hem` a fraction of the thigh below them; `ease` and `flare`
 * (per thigh length down) in metres for a body of 1.6 m.
 */
export const HULL_SKIRTS=Object.freeze({
 housedress:Object.freeze({top:.2,hem:1.06,ease:.024,flare:.03}),
 swim:Object.freeze({top:.13,hem:.42,ease:.016,flare:.03}),
});
function addHullSkirt(list,recipe,m,kind,colour){
 const S=HULL_SKIRTS[kind],k=m.k;
 const {geometry,share,lining}=hullCloth(recipe,m,{top:m.hipY+m.torso*S.top,hem:m.hipY-m.thigh*S.hem,
  ease:y=>{const d=Math.max(0,m.hipY-y);return k*(S.ease*THREE.MathUtils.smoothstep(d,0,m.thigh*.9)+S.flare*d/m.thigh);}});
 const piece=unInk(part(list,geometry,share,colour),lining);piece.userData.fit=true;return piece;
}
/**
 * The folded towel on the head, lying on the crown (or the hair) and draped to its shape: each
 * point of its underside is dropped onto the head from above, so it rests rather than floats,
 * and nothing of the head comes through it. It is the head bone's, so it goes where the head goes.
 */
function addHeadTowel(list,m,surfaces){
 const k=m.k,R=m.Rh,lx=R*m.headSX*1.15,lz=R*.72,th=.026*k,rad=th*.5,cz=-R*.06,gap=.0025*k;
 // One smooth piece (shared vertices), so its ink line follows it rather than splitting at the edges.
 let g=new THREE.BoxGeometry(lx,th,lz,16,2,10);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g,1e-7);
 const P=g.attributes.position,v=new THREE.Vector3(),q=new THREE.Vector3();
 const half=new THREE.Vector3(lx/2-rad,0,lz/2-rad);
 for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);q.set(THREE.MathUtils.clamp(v.x,-half.x,half.x),0,THREE.MathUtils.clamp(v.z,-half.z,half.z));const d=v.clone().sub(q);if(d.lengthSq()>1e-14)d.setLength(rad);v.copy(q).add(d);P.setXYZ(i,v.x,v.y,v.z);}
 const surface=new THREE.Mesh(mergeGeometries(surfaces.map(s=>{const c=new THREE.BufferGeometry();c.setAttribute('position',s.attributes.position.clone());return c;}),false),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),from=new THREE.Vector3(),d=.006*k;
 const ground=(x,z)=>{let top=-Infinity;for(const [ox,oz] of [[0,0],[d,0],[-d,0],[0,d],[0,-d]]){ray.set(from.set(x+ox,m.H+1,z+oz),down);const hit=ray.intersectObject(surface,false)[0];if(hit)top=Math.max(top,hit.point.y);}return top;};
 const cache=new Map();
 for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i)+cz,key=x.toFixed(5)+','+z.toFixed(5);if(!cache.has(key))cache.set(key,ground(x,z));P.setXYZ(i,x,cache.get(key)+gap+P.getY(i)+th/2,z);}
 surface.geometry.dispose();g.computeVertexNormals();
 // Folded in four, with the end of its band showing along one fold.
 const b0=-lx/2+lx*11/16,b1=-lx/2+lx*12/16;
 part(list,g,'head',p=>p.x>b0&&p.x<b1?TOWEL.band:TOWEL.colour);
}

/**
 * Cloth laid on the body: the running vest and its straps, the tenugui round the neck.
 *
 * The body here is its rest pose's volume as addBody builds it -- the torso lathe, the two shoulder caps and the neck --
 * as an approximate signed distance (metres, negative inside). A strip of cloth is laid along a centre line on it: each
 * point across the strip is dropped onto the body along the body's normal there and lifted `gap` off it (its inner face)
 * and `gap+th` (its outer), so it lies on the body, bends with it and is never inside it. The strips are the chest's, and
 * the chest carries the torso's top, so they stay where they were laid in every pose.
 */
export function bodyVolume(recipe,m){
 const prof=torsoProfile(recipe,m),W=m.width,D=m.depth,neckR=m.armR*1.08,n0=m.neckY-.02,n1=m.headY+.01,top=m.hipY+1.04*m.torso;
 const caps=[1,-1].map(sx=>({c:new THREE.Vector3(sx*m.shoulderX-sx*m.armR*.12,m.shoulderY-m.armR*.05,0),r:new THREE.Vector3(m.armR*1.18,m.armR*1.18*.62,m.armR*1.18*Math.min(1.1,D/W*1.6))}));
 const sdf=p=>{
  const t=(p.y-m.hipY)/m.torso;
  let d=t<-.1||t>1.04?Math.hypot(p.x,p.z,p.y-top):(Math.hypot(p.x/(W/2),p.z/(D/2))-latheRadius(prof,t))*Math.min(W,D)/2;
  for(const {c,r} of caps)d=Math.min(d,(Math.hypot((p.x-c.x)/r.x,(p.y-c.y)/r.y,(p.z-c.z)/r.z)-1)*r.y);
  return Math.min(d,Math.hypot(p.x,p.y-THREE.MathUtils.clamp(p.y,n0,n1),p.z)-neckR);
 };
 const h=.002*m.k,q=new THREE.Vector3();
 const normal=p=>{const n=new THREE.Vector3();for(const [ax,k] of [['x',0],['y',1],['z',2]]){q.copy(p);q[ax]+=h;const a=sdf(q);q[ax]-=2*h;n.setComponent(k,a-sdf(q));}return n.normalize();};
 /** p dropped onto the body along n (the outermost surface on that line) and lifted `lift` off it. */
 const layOn=(p,n,lift,reach=.1*m.k)=>{
  const steps=50,step=2*reach/steps;let hit=null;
  for(let i=0;i<=steps;i++){q.copy(p).addScaledVector(n,reach-i*step);if(sdf(q)<0){hit=reach-i*step;break;}}
  if(hit===null)return p.clone().addScaledVector(n,lift);
  let a=hit,b=hit+step;for(let k=0;k<22;k++){const mid=(a+b)/2;q.copy(p).addScaledVector(n,mid);if(sdf(q)<0)a=mid;else b=mid;}
  return p.clone().addScaledVector(n,b+lift);
 };
 return {prof,sdf,normal,layOn,surf:(a,t)=>{const r=latheRadius(prof,t);return new THREE.Vector3(Math.sin(a)*W/2*r,m.hipY+t*m.torso,Math.cos(a)*D/2*r);},
  /** The height t (upper torso, above the shoulder line) at which the lathe's radius is r. */
  tAt:r=>{for(let i=prof.length-1;i>0;i--){const [r0,t0]=prof[i],[r1,t1]=prof[i-1];if(t1<.66)break;if((r-r0)*(r-r1)<=0)return t0+(t1-t0)*((r-r0)/((r1-r0)||1));}return .66;}};
}
/**
 * A strip of cloth along `frames` ({c: centre, side: across, n: off the body, lay}): laid (lay true), on the body as
 * bodyVolume.layOn puts it; free, where its frame puts it in the air, pushed `gap` clear of the body. `hw` is half its
 * width, `th` its thickness. Returns an indexed geometry with smooth normals, and each vertex's fraction along it.
 */
function clothStrip(vol,frames,{hw,th,gap,across=6}){
 const N=frames.length,J=across,pos=[],along=[],index=[],v=new THREE.Vector3(),g=new THREE.Vector3();
 for(let i=0;i<N;i++){
  const f=frames[i],row=[];
  for(let j=0;j<=J;j++){
   v.copy(f.c).addScaledVector(f.side,(j/J*2-1)*hw);
   if(f.lay){row.push([vol.layOn(v,f.n,gap),vol.layOn(v,f.n,gap+th)]);continue;}
   const a=v.clone().addScaledVector(f.n,-th/2),b=v.clone().addScaledVector(f.n,th/2);
   // In the air: both faces moved together, out of the body, until the nearer is `gap` clear of it.
   for(let k=0;k<8;k++){const d=Math.min(vol.sdf(a),vol.sdf(b));if(d>=gap)break;g.copy(vol.normal(vol.sdf(a)<vol.sdf(b)?a:b)).multiplyScalar(gap-d+1e-4);a.add(g);b.add(g);}
   row.push([a,b]);
  }
  for(let layer=0;layer<2;layer++)for(let j=0;j<=J;j++){const p=row[j][layer];pos.push(p.x,p.y,p.z);along.push(i/(N-1));}
 }
 const at=(i,layer,j)=>i*2*(J+1)+layer*(J+1)+j,P=k=>new THREE.Vector3(pos[k*3],pos[k*3+1],pos[k*3+2]);
 const quad=(a,b,c,d,want)=>{const n=P(b).sub(P(a)).cross(P(c).sub(P(a)));if(n.dot(want)<0)index.push(a,c,b,a,d,c);else index.push(a,b,c,a,c,d);};
 for(let i=0;i<N;i++){
  const f=frames[i],t=frames[Math.min(N-1,i+1)].c.clone().sub(frames[Math.max(0,i-1)].c).normalize(),n=t.clone().cross(f.side).normalize();
  // which way is out of the cloth's face here: across the thickness, from the inner face to the outer
  const out=P(at(i,1,J>>1)).sub(P(at(i,0,J>>1)));if(out.lengthSq()>1e-14)n.copy(out.normalize());
  if(i<N-1)for(let j=0;j<J;j++){quad(at(i,1,j),at(i+1,1,j),at(i+1,1,j+1),at(i,1,j+1),n);quad(at(i,0,j),at(i+1,0,j),at(i+1,0,j+1),at(i,0,j+1),n.clone().negate());}
  if(i<N-1){quad(at(i,0,0),at(i+1,0,0),at(i+1,1,0),at(i,1,0),f.side.clone().negate());quad(at(i,0,J),at(i+1,0,J),at(i+1,1,J),at(i,1,J),f.side);}
  if(i===0||i===N-1)for(let j=0;j<J;j++)quad(at(i,0,j),at(i,0,j+1),at(i,1,j+1),at(i,1,j),i===0?t.clone().negate():t);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setIndex(index);geometry.computeVertexNormals();
 return {geometry,along:Float32Array.from(along)};
}
/** Frames along a centre line laid on the body: each point dropped onto it, the strip's width across it. */
function laidFrames(vol,points){
 const c=points.map(p=>vol.layOn(p,vol.normal(p),0));
 return c.map((p,i)=>{const n=vol.normal(p),t=c[Math.min(c.length-1,i+1)].clone().sub(c[Math.max(0,i-1)]).normalize();return {c:p,n,side:t.clone().cross(n).normalize(),lay:true};});
}

/**
 * The running vest (ランニングシャツ) after the bath: white cotton from below the waist of the drawers to a deep scoop at
 * the neck front and back, cut away under the arms, on two flat straps over the shoulders. The body of it is a shell
 * round the torso, its top edge one smooth curve (so a clean line, not a stair of triangles); the straps are strips laid
 * on the shoulders that run down over the shell's edge. Its skin is the torso's own at every height.
 */
export const RUNNING_VEST=Object.freeze({hem:.02,neckFront:.8,neckBack:.86,straps:.92,armhole:.7,strapAt:.52,gap:.006});
function runningShirt(list,recipe,m,colour){
 const vol=bodyVolume(recipe,m),V=RUNNING_VEST,W=m.width,D=m.depth,k=m.k;
 // Its top edge round the body, by the angle from the front: the scoop, the strap's root, the armhole, the back's scoop.
 const knots=[[0,V.neckFront],[V.strapAt,V.straps],[Math.PI/2,V.armhole],[Math.PI-V.strapAt,V.straps],[Math.PI,V.neckBack]];
 const edge=a=>{a=Math.abs(((a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI);for(let i=1;i<knots.length;i++){const [a0,t0]=knots[i-1],[a1,t1]=knots[i];if(a<=a1)return t0+(t1-t0)*THREE.MathUtils.smoothstep(a,a0,a1);}return V.neckBack;};
 const cols=112,rows=18,pos=[],index=[];
 for(let i=0;i<=cols;i++){const a=i/cols*Math.PI*2,tTop=edge(a);
  for(let j=0;j<=rows;j++){const t=V.hem+(tTop-V.hem)*j/rows,r=latheRadius(vol.prof,t);pos.push(Math.sin(a)*(W/2*r+V.gap*k),m.hipY+t*m.torso,Math.cos(a)*(D/2*r+V.gap*k));}}
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const a=i*(rows+1)+j,b=(i+1)*(rows+1)+j;index.push(a,b,a+1,b,b+1,a+1);}
 let shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));shell.setIndex(index);
 shell=mergeVertices(shell,1e-6);shell.computeVertexNormals();
 const torsoSkin=p=>{const chest=THREE.MathUtils.smoothstep(p.y,m.hipY+m.torso*.15,m.hipY+m.torso*.55);return [['hips',1-chest],['chest',chest]];};
 part(list,shell,torsoSkin,colour);
 // The straps: from a little below the shell's edge at the front, over the shoulder between the neck and the shoulder's
 // round, to the same below the edge at the back, lying just over the shell.
 addStraps(list,vol,m,{x:Math.sin(V.strapAt)*W/2*latheRadius(vol.prof,V.straps),from:V.straps-.05,hw:.019*k,th:.003*k,gap:(V.gap+.0015)*k,colour,skin:torsoSkin});
}
/**
 * Two flat straps laid over the shoulders, `x` either side of the middle, from the height `from` up the front, over the
 * top between the neck and the shoulder's round, and down the back to `from` again (the running vest's, a swimsuit's).
 */
function addStraps(list,vol,m,{x,from,hw,th,gap,colour,skin}){
 const W=m.width,D=m.depth;
 for(const sx of [1,-1]){
  const px=sx*x,pts=[],tTop=vol.tAt(Math.abs(px)/(W/2)+.02);
  for(const side of [1,-1])for(let i=0;i<=24;i++){const t=from+(tTop-from)*(side>0?i/24:1-i/24),r=latheRadius(vol.prof,t);
   pts.push(new THREE.Vector3(px,m.hipY+t*m.torso,side*D/2*Math.sqrt(Math.max(0,r*r-(px/(W/2))**2))));}
  // in order from the front root over the top to the back root, evenly spaced
  const ordered=pts.slice(0,25).concat(pts.slice(26));
  const frames=laidFrames(vol,new THREE.CatmullRomCurve3(ordered).getSpacedPoints(36));
  const strap=part(list,clothStrip(vol,frames,{hw,th,gap,across:4}).geometry,skin,colour);
  strap.attributes.ink.array.fill(.6);
 }
}

/**
 * The bath's tenugui round a man's neck after the bath: a thin cotton towel folded to a band, laid round the back of the
 * neck on the shoulders' slope, its two ends down the chest over the vest. Umi-no-yu's own, off-white with the navy band
 * its towels carry near each end. All the chest's, so it goes where the chest goes; it stands off the neck, which turns
 * inside it, and the chin, which nods above it.
 *
 * 'flag' (setTenugui): a gust has the two ends: from where they leave the shoulders they stream away the way the wind
 * blows, over the shoulders, rippling, the cloth on edge to it as a flag is. Every shape is a pure function of where the
 * wind blows and the moment (time), so the same call always draws the same cloth.
 */
// The navy band: rows `band` from each end of the strip (of samples), so its edges run straight across the cloth.
// Round the back of the neck it keeps `clear` (metres, for 1.6 m) between its inner edge and the neck; its ends leave the
// shoulders at `anchor` radians either side of the front and hang to `end` of the torso's height. In a gust (flag) the wind
// lifts it off from `lift` radians either side of the front, behind the neck, and the rest streams.
export const TENUGUI=Object.freeze({clear:.012,anchor:.72,lift:1.9,end:.42,halfWidth:.03,thickness:.006,gap:.012,band:Object.freeze([4,7]),samples:85});
function tenuguiShape(recipe,m,{state='rest',direction=Math.PI,time=0}={}){
 const vol=bodyVolume(recipe,m),T=TENUGUI,W=m.width,D=m.depth,k=m.k;
 // Round the neck at a set distance from it, wherever on the shoulders' slope that is: lower behind, where the neck is nearer
 // the back, than at the sides.
 const rho=m.armR*1.08+(T.halfWidth+T.clear)*k,ringT=a=>vol.tAt(Math.min(1,rho*Math.hypot(Math.sin(a)/(W/2),Math.cos(a)/(D/2))));
 const onRing=a=>vol.surf(a,ringT(a)),tA=ringT(T.anchor),xA=Math.abs(onRing(T.anchor).x);
 const down=(sx,t)=>{const x=sx*xA*(1+(tA-t)*.1),r=latheRadius(vol.prof,t);return new THREE.Vector3(x,m.hipY+t*m.torso,D/2*Math.sqrt(Math.max(0,r*r-(x/(W/2))**2)));};
 // From the right end's tip up the chest, round the back of the neck, and down to the left end's tip.
 const drop=[T.end,.6,.72,.82,.9,tA-.035];
 const ctrl=[...drop.map(t=>down(-1,t)),onRing(Math.PI*2-T.anchor)];
 for(let i=1;i<=7;i++)ctrl.push(onRing(Math.PI*2-T.anchor-i/8*(Math.PI*2-2*T.anchor)));
 ctrl.push(onRing(T.anchor),...drop.slice().reverse().map(t=>down(1,t)));
 const curve=new THREE.CatmullRomCurve3(ctrl,false,'centripetal'),rest=laidFrames(vol,curve.getSpacedPoints(T.samples-1));
 // The two anchors: where the ends leave the shoulders.
 const nearest=p=>rest.reduce((best,f,i)=>f.c.distanceTo(p)<rest[best].c.distanceTo(p)?i:best,0);
 const anchors=[nearest(ctrl[drop.length]),nearest(ctrl[drop.length+8])],lifted=[nearest(onRing(Math.PI*2-T.lift)),nearest(onRing(T.lift))];
 let frames=rest;
 if(state==='flag'){
  // A gust from in front of him or from a side blows the ends behind him or away to the side. One from behind him would
  // stream them forward, through his arms; it is drawn as from the side, and so is one from straight ahead's other half.
  const hd=new THREE.Vector3(Math.sin(direction),0,Math.cos(direction));if(hd.z>0)hd.set(Math.sign(hd.x)||1,0,0);
  const up=new THREE.Vector3(0,1,0),across=up.clone().cross(hd).normalize();
  frames=rest.slice();
  for(const [a,step,sx] of [[lifted[0],-1,-1],[lifted[1],1,1]]){
   const o=new THREE.Vector3(sx,0,0),count=step<0?a:rest.length-1-a;
   let length=0;for(let i=a;i!==a+step*count;i+=step)length+=rest[i].c.distanceTo(rest[i+step].c);
   // Each end first goes back from the neck, over the top of the back, and only then turns with the wind; the end on the far
   // side from the wind drops as it goes, so it crosses the upper back well under the head to reach the other side.
   const back=new THREE.Vector3(0,0,-1),far=o.dot(hd)<-.2;
   const first=(far?o.clone().multiplyScalar(.3).addScaledVector(back,.6).addScaledVector(up,-.7):o.clone().multiplyScalar(.2).addScaledVector(back,.8).addScaledVector(up,.12)).normalize();
   const last=hd.clone().addScaledVector(back,.35).addScaledVector(o,Math.max(0,o.dot(hd))*.3).addScaledVector(up,far?-.05:.06).normalize(),ds=length/count;
   const p=rest[a].c.clone(),s0=rest[a].side.clone(),flagUp=up.clone().multiplyScalar(Math.sign(s0.dot(up))||1);
   const centres=[];
   for(let n=1;n<=count;n++){const tau=n/count;p.addScaledVector(first.clone().lerp(last,THREE.MathUtils.smoothstep(tau,0,.45)).normalize(),ds);
    const ripple=Math.sin(Math.PI*2*(1.3*tau-.9*time)+(sx>0?0:1.7))*.1*length*tau;
    centres.push(p.clone().addScaledVector(across,ripple).addScaledVector(up,Math.sin(Math.PI*2*(.8*tau-.7*time)+sx)*.03*length*tau));}
   for(let n=1;n<=count;n++){
    const c=centres[n-1],prev=n>1?centres[n-2]:rest[a].c,next=centres[Math.min(count-1,n)],t=next.clone().sub(prev).normalize();
    const tau=n/count,w=s0.clone().lerp(flagUp,THREE.MathUtils.smoothstep(tau,.12,.5));w.addScaledVector(t,-w.dot(t)).normalize();
    frames[a+step*n]={c,side:w,n:w.clone().cross(t).normalize(),lay:false};
   }
  }
 }
 const {geometry,along}=clothStrip(vol,frames,{hw:T.halfWidth*k,th:T.thickness*k,gap:T.gap*k,across:6});
 return {geometry,along,anchors};
}
/**
 * The tenugui as a part of the body: painted, inked lightly, skinned as the torso under it is at each height (the chest's
 * round the neck, the torso's blend of chest and hips lower down the ends), so it moves exactly with what it lies on.
 * Returns the piece and its index (for setTenugui).
 */
function addTenugui(list,recipe,m){
 const {geometry,along}=tenuguiShape(recipe,m),index=geometry.index.array.slice();
 const torsoSkin=p=>{const chest=THREE.MathUtils.smoothstep(p.y,m.hipY+m.torso*.15,m.hipY+m.torso*.55);return [['hips',1-chest],['chest',chest]];};
 const piece=part(list,geometry,torsoSkin,TOWEL.colour),C=piece.attributes.color,band=new THREE.Color(TOWEL.band),last=TENUGUI.samples-1;
 const [b0,b1]=TENUGUI.band.map(r=>r/last),rows=[[b0,b1],[1-b1,1-b0]];
 // A whole quad of the cloth is in the band or out of it, so its edges are straight lines across.
 for(let i=0;i<index.length;i+=3){const a=[along[index[i]],along[index[i+1]],along[index[i+2]]],lo=Math.min(...a),hi=Math.max(...a);
  if(rows.some(([x,y])=>lo>=x-1e-6&&hi<=y+1e-6))for(let j=0;j<3;j++)C.setXYZ(i+j,band.r,band.g,band.b);}
 piece.attributes.ink.array.fill(.55);
 return {piece,index};
}

/**
 * A towel turban (after the bath, the women): the bath's terry towel wound round the head over the drying hair, the hair
 * all inside it. A dome over the crown, the back and the sides to just above the ears, its front edge rolled into a
 * two-ply twist across the forehead, the end tucked in a knot at the back of the crown. Long hair needs more towel round
 * it: a fuller dome and a bigger knot (LONG_HAIR).
 */
const LONG_HAIR=new Set(['bob','long','ponytail','braids','bun','perm','shoulder','pigtails','twinbuns','afro','mullet','curtains']);
export const TURBAN=Object.freeze({front:.5,side:.16,back:-.5,faceHalf:.72,radius:1.13,longRadius:1.2});
function addTurban(list,recipe,m){
 const R=m.Rh,S=[m.headSX*R,m.headSY*R,R*.98],long=LONG_HAIR.has(recipe.hair.style),rad=long?TURBAN.longRadius:TURBAN.radius;
 const dome=hairCap(null,false,{front:TURBAN.front,side:TURBAN.side,back:TURBAN.back,radius:rad,faceHalf:TURBAN.faceHalf});
 const p=dome.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);shapeHeadPoint(v,m.profile);p.setXYZ(i,v.x,v.y,v.z);}dome.computeVertexNormals();
 part(list,dome,'head',TOWEL.colour,M(0,m.headCentre,0,0,0,0,...S));
 // The twist across the forehead: two strands round each other along the dome's front edge, temple to temple.
 const yc=TURBAN.front+.06,rho=Math.sqrt(Math.max(0,(rad*.99)**2-yc*yc)),pts=[];
 for(let i=0;i<=24;i++){const phi=-1.2+2.4*i/24,u=new THREE.Vector3(Math.sin(phi)*rho,yc-.1*(Math.abs(phi)/1.2)**2,Math.cos(phi)*rho);shapeHeadPoint(u,m.profile);pts.push(new THREE.Vector3(u.x*S[0],m.headCentre+u.y*S[1],u.z*S[2]));}
 const mid=new THREE.CatmullRomCurve3(pts),N=60,rs=R*.072,off=R*.05,twists=3.5;
 for(const strand of [0,1]){
  const line=[];
  for(let i=0;i<=N;i++){const s=i/N,c=mid.getPointAt(s),t=mid.getTangentAt(s),out=c.clone().sub(new THREE.Vector3(0,m.headCentre,0)).normalize(),b=t.clone().cross(out).normalize(),n=b.clone().cross(t).normalize(),a=s*twists*Math.PI*2+strand*Math.PI;
   line.push(c.clone().addScaledVector(n,Math.cos(a)*off).addScaledVector(b,Math.sin(a)*off));}
  part(list,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(line),N*2,rs,8,false),'head',strand?TOWEL.fold:TOWEL.colour);
  for(const end of [line[0],line.at(-1)])ball(list,rs*1.15,end.toArray(),'head',strand?TOWEL.fold:TOWEL.colour,[1,1,1],8,6);
 }
 // The tucked end, a soft knot standing out of the back of the crown.
 const kd=new THREE.Vector3(0,.55,-.84).normalize().multiplyScalar(rad*1.02),kr=R*(long?.36:.3);
 ball(list,kr,[0,m.headCentre+kd.y*S[1],kd.z*S[2]],'head',TOWEL.fold,[1.2,.9,.9],14,10);
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

function addNose(parts,recipe,m){
 if(recipe.nose.style==='none')return;
 const layout=faceLayout(recipe),theta=Math.PI*.28+layout.noseY/256*Math.PI*.58,phi=Math.PI/2-.95+layout.noseX/256*1.9;
 const v=shapeHeadPoint(new THREE.Vector3(-Math.cos(phi)*Math.sin(theta),Math.cos(theta),Math.sin(phi)*Math.sin(theta)),m.profile);
 const hook=recipe.nose.style==='hook',wide=recipe.nose.style==='wide';
 const radius=m.Rh*(.065+recipe.nose.size*.055);
 ball(parts,radius,[v.x*m.Rh*m.headSX,m.headCentre+v.y*m.Rh*m.headSY,v.z*m.Rh*.98+radius*.55],'head',recipe.body.skin,
  [wide?1.45:.85,hook?1.55:.85,hook?1.65:1.2],12,10);
}

/**
 * Hair states (avatar.setHairState): the hair a body already has (its cap and its pieces) reshaped, so they work with any
 * hairstyle and in any outfit where the hair shows (under a turban or a towel on the head it does not, and nothing changes):
 * - 'halfDry': one side (the right unless told: the dryer is in the right hand) blown out in a frizzy puff, the other as it was;
 * - 'cloud': all of it blown up into a round, soft, lumpy cloud on the head, HAIR_CLOUD.size head widths across, in its own
 *   colour, rising from the hairline (which stays where it was), so the face is clear under it;
 * - 'wetFlat': slicked flat to the scalp and darker with water; what hangs (a ponytail, braids) keeps its shape.
 * Each is a pure function of the hair at rest, so the same state always looks the same, and a blend from one to another
 * (amount, from) moves every point in a straight line between the two, so nothing pops.
 */
export const HAIR_STATES=Object.freeze([null,'halfDry','cloud','wetFlat']);
// size: head widths across; lift, forward: where its middle is, in head radii above and in front of the head's; ramp: how far
// into the hair (hairCap's field) it reaches full size; tuck: how much less it stands out low behind the head, where a
// chair's back or a bath's rim is (the dryers blew it up and forward).
export const HAIR_CLOUD=Object.freeze({size:2.75,lift:.6,forward:.35,lumps:.05,ramp:.32,tuck:.8});
export const HAIR_WET=Object.freeze({darken:.6,lie:1.02});
/** Where, in one body's merged geometry, its hair is, and how much of each vertex is hair (hairCap's own field). */
function hairSpan(parts,from,to){
 let start=0;for(let i=0;i<from;i++)start+=parts[i].attributes.position.count;
 let n=0;for(let i=from;i<to;i++)n+=parts[i].attributes.position.count;
 const keep=new Float32Array(n).fill(-1),field=new Float32Array(n).fill(1);let at=0;
 for(let i=from;i<to;i++){const g=parts[i],hf=g.userData.hairField;if(hf){keep.set(hf.keep,at);field.set(hf.field,at);}at+=g.attributes.position.count;}
 return {start,end:start+n,keep,field};
}
const vertexCount=parts=>parts.reduce((n,g)=>n+g.attributes.position.count,0);
/** The cloth that is fitted out of the legs and onto the seat after skinning (towel-fit.js): a flag per vertex. */
function fitFlags(parts){const flags=new Float32Array(vertexCount(parts));let at=0;for(const g of parts){const n=g.attributes.position.count;if(g.userData.fit)flags.fill(1,at,at+n);at+=n;}return flags;}

/**
 * @param {object} input recipe (anything; it is normalized)
 * @param {{shadows?:boolean,faceSize?:number}} [options]
 */
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
 const ears=list=>{for(const s of [-1,1])ball(list,m.Rh*.2,[s*m.Rh*m.headSX*.97,m.headCentre-m.Rh*.08,-m.Rh*.05],'head',recipe.body.skin,[.55,1,.8],8,6);};
 ears(parts);
 const mainHairFrom=parts.length;addHair(parts,recipe,m);const mainHairSpan=hairSpan(parts,mainHairFrom,parts.length);addAccessories(parts,recipe,m);
 // The hat goes in last, so taking it off is drawing one range shorter: people hang it
 // up when they get home (home-residents.js) and put it back on to go out.
 const hatStart=parts.reduce((n,g)=>n+g.attributes.position.count,0);addHat(parts,recipe,m);
 const hatHairRanges=[];
 for(const g of parts.slice(mainHairFrom))if(g.userData.hatHair)hatHairRanges.push({original:g.userData.hatHair,tucked:{position:g.attributes.position.array.slice(),normal:g.attributes.normal.array.slice()}});
 let hairCovered=true;
 // Each shoe's vertices, so a shoe can come off and leave a sock (setShoe).
 const shoeRanges={L:[],R:[]};{let at=0;for(const g of parts){const n=g.attributes.position.count;if(g.userData.shoe)shoeRanges[g.userData.shoe].push([at,n]);at+=n;}}
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
 const hasHat=geometry.attributes.position.count>hatStart;
 const shoeOn={L:true,R:true},shoeSaved={};
 for(const side of ['L','R'])for(const [at,n] of shoeRanges[side])(shoeSaved[side]??=[]).push({at,n,position:geometry.attributes.position.array.slice(at*3,(at+n)*3),colour:geometry.attributes.color.array.slice(at*3,(at+n)*3)});
 geometry.computeBoundingSphere();
 const material=bodyMaterial(recipe,m);
 const body=new THREE.SkinnedMesh(geometry,material);body.name='Shimanchu body';
 body.add(bones.root);body.bind(new THREE.Skeleton(list));
 body.castShadow=shadows;body.receiveShadow=true;body.frustumCulled=false;
 // Swimwear, the bath wrap and the lobby's after-bath clothes are further bodies, swapped in at the onsen.
 let swimBody=null,towelBody=null,towelOutline=null,alternativeBody=null,alternativeOutline=null,alternativeKey=null,afterbathBody=null,afterbathOutline=null;
 let swimOutline=null;
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

 // ---- Hair states: every body's hair, as built, and its shape in each state.
 let hair={state:null,amount:1,from:null,side:'R'};const hairRecords=[];
 const headC=new THREE.Vector3(0,m.headCentre,0),HS=[m.headSX*m.Rh,m.headSY*m.Rh,m.Rh*.98];
 const cloudCentre=headC.clone().add(new THREE.Vector3(0,HAIR_CLOUD.lift*m.Rh,HAIR_CLOUD.forward*m.Rh)),cloudR=HAIR_CLOUD.size*m.Rh*m.headSX;
 // Soft cumulus bulges: a few broad swells, a few smaller ones on them.
 const lumps=d=>1+HAIR_CLOUD.lumps*(Math.sin(3.7*d.x+1.1)*Math.sin(3.3*d.y+.3)*Math.sin(3.9*d.z+2.3)*1.8+Math.sin(6.1*d.x+1.9*d.y+.7)*Math.sin(5.7*d.z-1.3*d.y+1.4)*.7);
 // How far out the head's surface is along a direction (in the head's unit space): the point of the unit sphere that
 // shapeHeadPoint carries onto that direction, found in a few steps.
 const hw=new THREE.Vector3(),hsd=new THREE.Vector3();
 const headSurface=d=>{hw.copy(d);for(let k=0;k<6;k++){hsd.copy(shapeHeadPoint(hsd.copy(hw),m.profile)).normalize();hw.add(hsd.subVectors(d,hsd)).normalize();}return shapeHeadPoint(hsd.copy(hw),m.profile).length();};
 // Frizz: soft tufts, not spikes.
 const frizz=d=>Math.sin(7*d.x+2.1)*Math.sin(6*d.y+.7)*Math.sin(7*d.z+1.3)+.35*Math.sin(13*d.x-9*d.z+.4)*Math.sin(11*d.y+1.2);
 function hairShape(rec,state,side){
  const key=state+'|'+side;if(rec.cache.has(key))return rec.cache.get(key);
  if(!state){const out={position:rec.base.position,normal:rec.base.normal,colour:rec.colour};rec.cache.set(key,out);return out;}
  const B=rec.base.position,n=B.length/3,position=new Float32Array(B.length),colour=rec.colour.slice(),p=new THREE.Vector3(),u=new THREE.Vector3(),d=new THREE.Vector3(),q=new THREE.Vector3(),s=new THREE.Vector3();
  const sideSign=side==='L'?1:-1,delta=cloudCentre.clone().sub(headC);
  for(let i=0;i<n;i++){
   p.fromArray(B,i*3);u.set(p.x/HS[0],(p.y-headC.y)/HS[1],p.z/HS[2]);const ru=u.length()||1e-6;d.copy(u).divideScalar(ru);
   const hs=headSurface(d),rel=ru/hs,k=rec.keep[i]>=0?rec.keep[i]:THREE.MathUtils.smoothstep(rel,.98,1.03);
   if(state==='halfDry'){
    const w=k*THREE.MathUtils.smoothstep(d.x*sideSign,-.2,.3),puff=w*(.16+Math.max(0,ru-hs)*1.5)*(1+.4*frizz(d));
    u.multiplyScalar((ru+puff)/ru);p.set(u.x*HS[0],headC.y+u.y*HS[1],u.z*HS[2]);
   }else if(state==='wetFlat'){
    const lie=hs*HAIR_WET.lie,w=k*(1-THREE.MathUtils.smoothstep(rel,1.22,1.4));
    if(ru>lie){u.multiplyScalar((ru+(lie-ru)*w)/ru);p.set(u.x*HS[0],headC.y+u.y*HS[1],u.z*HS[2]);}
    for(let c=0;c<3;c++)colour[i*3+c]*=HAIR_WET.darken;
   }else if(state==='cloud'){
    // Out along the line from the head's middle to where it meets the cloud's sphere, more the further into the hair.
    s.copy(p).sub(headC);const r=s.length()||1e-6;s.divideScalar(r);
    const b=s.dot(delta),t=(b+Math.sqrt(Math.max(0,b*b-delta.lengthSq()+cloudR*cloudR)))*lumps(s);
    // (eased out, so the cloud bulges round from the hairline instead of rising off it in a straight cone)
    const e=1-(1-THREE.MathUtils.smoothstep(rec.field[i],0,HAIR_CLOUD.ramp))**2;
    const w=k*e*(1-HAIR_CLOUD.tuck*THREE.MathUtils.smoothstep(-s.z,.3,.9)*THREE.MathUtils.smoothstep(-s.y,-.35,.3));
    if(t>r)p.addScaledVector(s,(t-r)*w);
   }
   p.toArray(position,i*3);
  }
  // Smooth normals for the new shape: each corner's faces, summed over every corner at the same rest position.
  if(!rec.weld){const ids=new Int32Array(n),map=new Map();for(let i=0;i<n;i++){const key=Math.round(B[i*3]*1e5)+','+Math.round(B[i*3+1]*1e5)+','+Math.round(B[i*3+2]*1e5);if(!map.has(key))map.set(key,map.size);ids[i]=map.get(key);}rec.weld={ids,count:map.size};}
  const acc=new Float32Array(rec.weld.count*3),a=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3();
  for(let i=0;i<n;i+=3){a.fromArray(position,i*3);e1.fromArray(position,i*3+3).sub(a);e2.fromArray(position,i*3+6).sub(a);e1.cross(e2);for(let j=0;j<3;j++){const id=rec.weld.ids[i+j]*3;acc[id]+=e1.x;acc[id+1]+=e1.y;acc[id+2]+=e1.z;}}
  const normal=new Float32Array(B.length);
  for(let i=0;i<n;i++){const id=rec.weld.ids[i]*3;a.set(acc[id],acc[id+1],acc[id+2]);if(a.lengthSq()<1e-20)a.fromArray(rec.base.normal,i*3);a.normalize().toArray(normal,i*3);}
  const out={position,normal,colour};rec.cache.set(key,out);return out;
 }
 function applyHair(rec){
  if(!rec)return;
  const g=rec.geometry,P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,o=rec.start*3,covered=rec.covered();
  if(covered||!hair.state&&!hair.from){const src=covered&&rec.tucked?rec.tucked:rec.base;P.array.set(src.position,o);N.array.set(src.normal,o);C.array.set(rec.colour,o);}
  else{
   const A=hairShape(rec,hair.from,hair.side),Bs=hairShape(rec,hair.state,hair.side),t=hair.amount,v=new THREE.Vector3();
   for(let i=0;i<A.position.length;i++){P.array[o+i]=A.position[i]+(Bs.position[i]-A.position[i])*t;C.array[o+i]=A.colour[i]+(Bs.colour[i]-A.colour[i])*t;}
   for(let i=0;i<A.normal.length;i+=3){v.set(A.normal[i]+(Bs.normal[i]-A.normal[i])*t,A.normal[i+1]+(Bs.normal[i+1]-A.normal[i+1])*t,A.normal[i+2]+(Bs.normal[i+2]-A.normal[i+2])*t).normalize();N.array[o+i]=v.x;N.array[o+i+1]=v.y;N.array[o+i+2]=v.z;}
  }
  P.needsUpdate=N.needsUpdate=C.needsUpdate=true;
 }
 function hairRecord(g,span,{covered=()=>false,base=null,tucked=null}={}){
  const {start,end}=span,P=g.attributes.position.array,N=g.attributes.normal.array;
  const rec={geometry:g,start,end,keep:span.keep,field:span.field,covered,tucked,cache:new Map(),weld:null,
   base:base||{position:P.slice(start*3,end*3),normal:N.slice(start*3,end*3)},colour:g.attributes.color.array.slice(start*3,end*3)};
  hairRecords.push(rec);if(hair.state||hair.from)applyHair(rec);return rec;
 }
 const join=list=>{const out=new Float32Array(list.reduce((n,a)=>n+a.length,0));let at=0;for(const a of list){out.set(a,at);at+=a.length;}return out;};
 const mainHair=mainHairSpan.end>mainHairSpan.start?hairRecord(geometry,mainHairSpan,hatHairRanges.length?{
  covered:()=>hairCovered,
  base:{position:join(hatHairRanges.map(r=>r.original.position)),normal:join(hatHairRanges.map(r=>r.original.normal))},
  tucked:{position:join(hatHairRanges.map(r=>r.tucked.position)),normal:join(hatHairRanges.map(r=>r.tucked.normal))}}:{}):null;
 let swimHair=null,towelHair=null,altHair=null,afterbathHair=null,headTowelOn=false,tenugui={state:'rest',direction:Math.PI,time:0},tenuguiRange=null;

 /** A body's cloth fitted out of the legs and onto the seat as it is drawn (towel-fit.js), with its ink and its shadow. */
 function fitCloth(mesh){
  const fit=createTowelFit(avatar,mesh);fit.fitted(mesh.material,'body');
  const line=addOutline(root,mesh,true),ink=line.material,fitted=ink.clone();fitted.onBeforeCompile=ink.onBeforeCompile;fitted.customProgramCacheKey=ink.customProgramCacheKey;line.material=fit.fitted(fitted,'outline');
  mesh.customDepthMaterial=fit.fitted(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}),'depth');
  // Read the pose as it is drawn, for the picture, its ink line and its shadow alike.
  mesh.onBeforeRender=mesh.onBeforeShadow=line.onBeforeRender=()=>fit.refresh();
  mesh.towelFit=fit;return line;
 }
 function applyTenugui(){
  if(!tenuguiRange)return;
  const {geometry:g}=tenuguiShape(recipe,m,tenugui),idx=tenuguiRange.index;
  // The rest's own triangles, so every state is the same cloth (vertex for vertex) in a new place.
  g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
  const P=afterbathBody.geometry.attributes.position,N=afterbathBody.geometry.attributes.normal,src=g.attributes.position.array,nrm=g.attributes.normal.array;
  for(let i=0;i<idx.length;i++){const j=idx[i]*3,o=(tenuguiRange.start+i)*3;for(let c=0;c<3;c++){P.array[o+c]=src[j+c];N.array[o+c]=nrm[j+c];}}
  P.needsUpdate=N.needsUpdate=true;g.dispose();
 }

 const avatar={
  recipe,measure:m,root,body,bones,face,height:m.H,outfit:'clothes',hasHat,garment:material.userData.garment,springSetup:swing,springs:null,
  setOpenHands(on){on=!!on;if(handsOpen===on)return;handsOpen=on;geometry.attributes.position.array.set(on?openFingerPositions:closedFingerPositions,fingerStart*3);geometry.attributes.position.needsUpdate=true;},
  /** Hat on or off. Off, it is somebody else's job to show where it went (buildHatProp). */
  setHat(on){geometry.setDrawRange(0,on||!hasHat?Infinity:hatStart);if(hairCovered!==!!on){hairCovered=!!on;if(hatHairRanges.length)applyHair(mainHair);}},
  get hatOn(){return hasHat&&geometry.drawRange.count===Infinity;},
  /** A shoe on or off ('L' or 'R'). Off, the foot is in its sock (SOCK); where the shoe went is somebody
   *  else's to show (buildShoeProp). */
  setShoe(side,on){
   on=!!on;if(!shoeSaved[side]||shoeOn[side]===on)return;shoeOn[side]=on;
   const P=geometry.attributes.position.array,C=geometry.attributes.color.array,sock=new THREE.Color(SOCK.colour),mid=new THREE.Vector3(),q=new THREE.Vector3();
   // the sock: the shoe drawn in towards the middle of its upper (the first piece), in the sock's colour
   const upper=shoeSaved[side][0];for(let i=0;i<upper.n;i++)mid.add(q.fromArray(upper.position,i*3));mid.multiplyScalar(1/upper.n);
   for(const r of shoeSaved[side])for(let i=0;i<r.n;i++){
    const j=(r.at+i)*3;
    if(on){P.set(r.position.subarray(i*3,i*3+3),j);C.set(r.colour.subarray(i*3,i*3+3),j);continue;}
    q.fromArray(r.position,i*3).sub(mid).multiplyScalar(SOCK.size).add(mid);P[j]=q.x;P[j+1]=q.y;P[j+2]=q.z;C[j]=sock.r;C[j+1]=sock.g;C[j+2]=sock.b;
   }
   geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
  },
  shoeOn(side){return shoeOn[side];},
  faceState:{expression:'neutral',blink:0,talk:0,look:[0,0]},
  /** Repaint the face if what it is doing has changed. */
  paintFace(state){
   const s=avatar.faceState,n={...s,...state};
   const key=n.expression+'|'+(n.blink>.5?1:0)+'|'+(n.talk>.5?1:0)+'|'+Math.round(n.look[0]*2)+','+Math.round(n.look[1]*2);
   if(key===avatar.faceKey)return false;
   avatar.faceKey=key;Object.assign(s,n);
   drawFace(face.ctx,recipe,{...n,size:face.canvas.width});face.texture.needsUpdate=true;return true;
  },
  /** Whether the folded towel is on the head now (the bath wrap's, or swimwear's when asked for). */
  get headTowel(){return headTowelOn;},
  /** The hair state now: {state, amount, from, side}. */
  get hairState(){return {...hair};},
  /**
   * The hair's state, in every body that shows it (HAIR_STATES): null (as it is), 'halfDry' (one side blown into a puff;
   * side 'R' or 'L'), 'cloud' or 'wetFlat'. `amount` (0–1) of the way from `from` (another state, or null for the hair as it
   * is) to it, for a change over time: a cloud sinking in the water is setHairState('wetFlat',{from:'cloud',amount:t}).
   */
  setHairState(state=null,{amount=1,from=null,side='R'}={}){
   if(!HAIR_STATES.includes(state)||!HAIR_STATES.includes(from))throw new Error('No hair state '+(HAIR_STATES.includes(state)?from:state));
   hair={state,amount:THREE.MathUtils.clamp(+amount,0,1),from,side:side==='L'?'L':'R'};
   for(const rec of hairRecords)applyHair(rec);
   return state;
  },
  /** The tenugui round the neck after the bath: 'rest' (draped) or 'flag' (streaming in a gust). */
  get tenuguiState(){return {...tenugui};},
  /**
   * The after-bath tenugui ('rest' or 'flag'). `direction` is where the wind blows the ends, in radians round the up axis
   * in the body's own frame (Math.PI behind them, the default, a gust in the face; Math.PI/2 to their left, -Math.PI/2 to
   * their right; a direction ahead of sideways is drawn as sideways, since ends blown forward would pass through the arms);
   * `time` (seconds) ripples the cloth, the same for the same moment. Only a man's after-bath clothes have one; it is
   * remembered until they put them on.
   */
  setTenugui(state='rest',direction=Math.PI,{time=0}={}){
   if(!['rest','flag'].includes(state))throw new Error('No tenugui state '+state);
   tenugui={state,direction:+direction||0,time:+time||0};applyTenugui();return state;
  },
  /**
   * 'clothes', 'swim', 'towel' (the bath wrap), 'bath' (whichever of the two this person wears behind Umi-no-yu's noren:
   * bathOutfit), 'afterbath' (the lobby's after-bath clothes, outfits.js AFTERBATH), or Thuan's 'sailor' and 'nozomi'.
   * A child or teenager asked into a towel gets their swimwear (wearsBathTowel), and asked into after-bath clothes keeps
   * their clothes. Options: headTowel, the folded towel on the head: on by default with the wrap (off for drying the
   * hair at the mirror), off by default with swimwear (on for a soak: Tetsuo's, square on his head). Returns what they
   * ended up wearing.
   */
  wear(requested,{headTowel}={}){
   let outfit=requested==='bath'?bathOutfit(recipe):requested;
   if(outfit==='towel'&&!wearsBathTowel(recipe))outfit='swim';
   if(outfit==='afterbath'&&!wearsBathTowel(recipe))outfit='clothes';
   avatar.outfit=outfit;
   if(outfit==='towel'&&!towelBody){
    const parts=[];addBody(parts,recipe,m,'towel');addNose(parts,recipe,m);ears(parts);
    const hairStart=parts.length;addHair(parts,{...recipe,outfit:{...recipe.outfit,hat:'none'}},m);
    const hair=parts.slice(hairStart),span=hairSpan(parts,hairStart,parts.length),wrapStart=vertexCount(parts);
    const head=face.head.geometry.clone();head.translate(0,m.headCentre,0);
    addTowel(parts,recipe,m);const wrapEnd=vertexCount(parts);addHeadTowel(parts,m,[head,...hair]);head.dispose();
    const g=mergeGeometries(parts,false),count=vertexCount(parts);parts.forEach(p=>p.dispose());
    // The wrap's vertices are kept out of the body after skinning (towel-fit.js); nothing else is.
    g.setAttribute('towelFit',new THREE.BufferAttribute(new Float32Array(count).fill(1,wrapStart,wrapEnd),1));
    towelBody=new THREE.SkinnedMesh(g,celFrom(new THREE.MeshStandardMaterial({vertexColors:true}),{bands:'soft3'}));towelBody.name='Shimanchu bath towel';towelBody.bind(body.skeleton,body.bindMatrix);
    // Which vertices are the wrap (with its tuck) and which the towel on the head, for tests and the seat.
    towelBody.userData.towel={wrap:[wrapStart,wrapEnd],head:[wrapEnd,count]};
    towelBody.castShadow=shadows;towelBody.frustumCulled=false;root.add(towelBody);towelOutline=fitCloth(towelBody);
    towelHair=hairRecord(g,span,{covered:()=>headTowelOn});
   }
   if(['nozomi','sailor'].includes(outfit)&&alternativeKey!==outfit){
    if(alternativeBody){hairRecords.splice(hairRecords.indexOf(altHair),1);alternativeBody.removeFromParent();alternativeOutline.removeFromParent();alternativeBody.geometry.dispose();alternativeBody.material.map?.dispose();alternativeBody.material.dispose();}
    alternativeKey=outfit;const r=normalizeRecipe({...recipe,outfit:{...recipe.outfit,...(outfit==='sailor'?THUAN_SAILOR_OUTFIT:SHOPPING_LANE_OUTFIT)}}),parts=[];addBody(parts,r,m);addNose(parts,r,m);ears(parts);
    const hairStart=parts.length;addHair(parts,r,m);const span=hairSpan(parts,hairStart,parts.length);
    const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());alternativeBody=new THREE.SkinnedMesh(g,bodyMaterial(r,m));alternativeBody.name=outfit==='sailor'?'Thuan · harbour academy sailor':'Thuan · shopping lane outfit';alternativeBody.bind(body.skeleton,body.bindMatrix);alternativeBody.castShadow=shadows;alternativeBody.frustumCulled=false;root.add(alternativeBody);alternativeOutline=addOutline(root,alternativeBody,true);
    altHair=hairRecord(g,span);
   }
   if(outfit==='swim'&&!swimBody){
    const parts=[];addBody(parts,recipe,m,true);addNose(parts,recipe,m);ears(parts);
    const hairStart=parts.length;addHair(parts,{...recipe,outfit:{...recipe.outfit,hat:'none'}},m);
    const hair=parts.slice(hairStart),span=hairSpan(parts,hairStart,parts.length),headStart=vertexCount(parts);
    // The folded towel for the head (headTowel), last, so leaving it off is drawing one range shorter.
    const head=face.head.geometry.clone();head.translate(0,m.headCentre,0);addHeadTowel(parts,m,[head,...hair]);head.dispose();
    const flags=fitFlags(parts),count=vertexCount(parts),g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());
    g.setAttribute('towelFit',new THREE.BufferAttribute(flags,1));
    swimBody=new THREE.SkinnedMesh(g,celFrom(new THREE.MeshStandardMaterial({vertexColors:true}),{bands:'soft3'}));swimBody.name='Shimanchu swimwear';swimBody.bind(body.skeleton,body.bindMatrix);
    swimBody.userData.swim={headTowel:[headStart,count],skirt:flags.some(f=>f>0)};
    swimBody.castShadow=shadows;swimBody.frustumCulled=false;root.add(swimBody);
    // An older woman's swimsuit's little skirt is fitted like the wrap; everything else is skin-tight.
    swimOutline=swimBody.userData.swim.skirt?fitCloth(swimBody):addOutline(root,swimBody,true);
    swimHair=hairRecord(g,span,{covered:()=>headTowelOn});
   }
   if(outfit==='afterbath'&&!afterbathBody){
    const women=recipe.body.silhouette==='feminine',dress=women?houseDressColour(recipe):null;
    const r={...recipe,outfit:{...recipe.outfit,...(women?{...AFTERBATH.women,topColour:dress,bottomColour:dress,accent:dress}:AFTERBATH.men)}};
    const parts=[];addBody(parts,r,m,false);addNose(parts,r,m);ears(parts);
    let span=null,tenuguiAt=null;
    if(women)addTurban(parts,r,m);
    else{const hairStart=parts.length;addHair(parts,{...r,outfit:{...r.outfit,hat:'none'}},m);span=hairSpan(parts,hairStart,parts.length);tenuguiAt={start:vertexCount(parts),...addTenugui(parts,r,m)};}
    const flags=fitFlags(parts),g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());
    const mat=bodyMaterial(r,m);
    afterbathBody=new THREE.SkinnedMesh(g,mat);afterbathBody.name=women?'Shimanchu after the bath · house dress':'Shimanchu after the bath · vest and drawers';afterbathBody.bind(body.skeleton,body.bindMatrix);
    afterbathBody.castShadow=shadows;afterbathBody.frustumCulled=false;root.add(afterbathBody);
    if(flags.some(f=>f>0)){g.setAttribute('towelFit',new THREE.BufferAttribute(flags,1));afterbathOutline=fitCloth(afterbathBody);}else afterbathOutline=addOutline(root,afterbathBody,true);
    if(tenuguiAt){tenuguiRange={start:tenuguiAt.start,count:tenuguiAt.index.length,index:tenuguiAt.index};afterbathBody.userData.tenugui=tenuguiRange;if(tenugui.state!=='rest')applyTenugui();}
    afterbathBody.userData.afterbath={women,dress,skirt:flags.some(f=>f>0)};
    if(span)afterbathHair=hairRecord(g,span);
   }
   // The folded towel on the head.
   headTowelOn=outfit==='towel'?headTowel!==false:outfit==='swim'?!!headTowel:false;
   if(towelBody){towelBody.geometry.setDrawRange(0,outfit==='towel'&&!headTowelOn?towelBody.userData.towel.head[0]:Infinity);applyHair(towelHair);}
   if(swimBody){swimBody.geometry.setDrawRange(0,outfit==='swim'&&headTowelOn?Infinity:swimBody.userData.swim.headTowel[0]);applyHair(swimHair);}
   // What swings depends on what is worn: Thuan's sailor skirt, Johansson's shirt hem, nothing in the bath or after it.
   const worn=outfit==='sailor'?{...recipe,outfit:{...recipe.outfit,...THUAN_SAILOR_OUTFIT}}:outfit==='nozomi'?{...recipe,outfit:{...recipe.outfit,...SHOPPING_LANE_OUTFIT}}
    :['swim','towel','afterbath'].includes(outfit)?{...recipe,outfit:{...recipe.outfit,top:'tank',bottom:'shorts'},...(outfit==='afterbath'&&afterbathBody?.userData.afterbath.women?{hair:{...recipe.hair,style:'crop'}}:{})}:recipe;
   if(avatar.springKey!==outfit){avatar.springKey=outfit;avatar.springs?.reset();avatar.springSetup=springRest(normalizeRecipe(worn),m);avatar.springs=createSprings(avatar);}
   body.visible=!['swim','towel','nozomi','sailor','afterbath'].includes(outfit);outline.visible=body.visible;
   if(alternativeBody){alternativeBody.visible=outfit===alternativeKey;alternativeOutline.visible=alternativeBody.visible;}
   if(swimBody){swimBody.visible=outfit==='swim';swimOutline.visible=swimBody.visible;}
   if(towelBody){towelBody.visible=outfit==='towel';towelOutline.visible=towelBody.visible;}
   if(afterbathBody){afterbathBody.visible=outfit==='afterbath';afterbathOutline.visible=afterbathBody.visible;}
   return outfit;
  },
  dispose(){
   geometry.dispose();material.dispose();material.map?.dispose();face.texture.dispose();face.head.geometry.dispose();face.head.material.dispose();
   if(alternativeBody){alternativeBody.geometry.dispose();alternativeBody.material.map?.dispose();alternativeBody.material.dispose();}
   for(const [mesh,line] of [[swimBody,swimOutline],[towelBody,towelOutline],[afterbathBody,afterbathOutline]]){if(!mesh)continue;mesh.geometry.dispose();mesh.material.map?.dispose();mesh.material.dispose();mesh.customDepthMaterial?.dispose();if(mesh.towelFit)line.material.dispose();}
  },
 };
 avatar.springs=createSprings(avatar);
 avatar.paintFace({});
 return avatar;
}
