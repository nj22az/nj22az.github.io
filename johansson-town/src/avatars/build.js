import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {normalizeRecipe} from './recipe.js';
import {drawFace} from './face.js';
import {celFrom} from '../render/cel.js';

/**
 * Builds a Shimanchu from a recipe.
 *
 * The body is one skinned mesh: every part -- torso, limbs, shoes, hair, hat -- is a
 * simple rounded shape painted with vertex colour and bound rigidly to one bone, so the
 * whole person is a single draw call and moves like a jointed toy, which is the look.
 * The head is the second draw call: a sphere whose front carries the painted face.
 *
 * Proportions are the point. The head is about a third of the height; arms are short and
 * end in round hands; legs are straight tubes on rounded shoes. Everyone is built on the
 * same frame, so the town's crowd reads as one family.
 *
 * The body faces +z; the root is turned to face -z, the way the town's characters do.
 */
export const BONES=Object.freeze(['root','hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR']);
const BI=Object.fromEntries(BONES.map((n,i)=>[n,i]));

/** Every measurement of a body, from its recipe. Pure, for tests and the seat maths. */
export function measure(recipe){
 const r=normalizeRecipe(recipe);
 const H=1.36+r.body.height*.44,k=H/1.6,build=r.body.build;
 const Rh=(.25+r.head.size*.07)*k,headSX=1+(r.head.shape-.5)*.12,headSY=1.02-(r.head.shape-.5)*.1;
 const neck=.045*k,body=H-Rh*2*headSY-neck;
 const leg=body*.47,torso=body-leg;
 const foot=.07*k,thigh=(leg-foot)*.5,shin=thigh;
 const legR=(.058+build*.024)*k,armR=(.045+build*.016)*k;
 const width=(.3+build*.15)*k,depth=(.2+build*.09)*k;
 const upper=.2*k,fore=.18*k,hand=.058*k;
 const hipY=leg,chestY=hipY+torso*.5,neckY=hipY+torso,headY=neckY+neck;
 return {H,k,Rh,headSX,headSY,neck,torso,leg,foot,thigh,shin,legR,armR,width,depth,upper,fore,hand,hipY,chestY,neckY,headY,
  headCentre:headY+Rh*headSY*.94,shoulderX:width/2+armR*.3,shoulderY:neckY-.045*k,hipX:width*.24,
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
 if(cap)part(list,cap,'head',c,M(cx,m.headY+cy,0,0,0,0,...S));
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
 }else if(hat==='headband'){
  part(list,new THREE.TorusGeometry(R*1.07*m.headSX,R*.09,6,28),'head',c,M(0,m.headCentre+R*.45,0,Math.PI/2+.12));
  ball(list,R*.16,[0,m.headCentre+R*.5,-R*1.05],'head',c,[1.4,.8,.8],8,6);
 }else if(hat==='kerchief'){
  part(list,new THREE.SphereGeometry(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),'head',c,M(0,m.headCentre+R*.05,-R*.12,-.45,0,0,...S));
  ball(list,R*.2,[0,m.headCentre+R*.1,-R*1.1],'head',c,[1.3,.9,.9],8,6);
 }
}

/** Long hair, a lipstick or no beard and a slight build: a swimming costume, not trunks. */
export const wearsSwimTop=recipe=>recipe.facial.style==='none'&&(['bob','long','ponytail','braids','bun','perm'].includes(recipe.hair.style)||recipe.mouth.colour!=='#b8544a');

function addBody(list,recipe,m,swim=false){
 const o=recipe.outfit,skin=recipe.body.skin,top=swim?skin:o.topColour,bottom=swim?recipe.swim.colour:o.bottomColour;
 const W=m.width,D=m.depth,hipY=m.hipY;
 // The torso: a lathe, wide at the hips, sloping to the shoulders, in its clothes.
 const prof=[[0,-.1],[.86,-.08],[1,.05],[1.01,.13],[1.01,.15],[1.02,.3],[1,.5],[.97,.66],[.92,.78],[.83,.88],[.68,.95],[.46,1],[.22,1.03],[0,1.04]];
 const lathe=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),28);
 // The hem sits on a row of the lathe, so it is a clean line rather than a zigzag.
 const waist=hipY+m.torso*.13;
 const stripe=o.pattern==='stripes';
 const torsoColour=p=>{
  if(swim)return p.y<waist?bottom:skin;
  if(p.y<waist)return bottom;
  if(stripe&&Math.floor((p.y-waist)/(m.torso*.12))%2)return '#f4f1ea';
  return top;
 };
 part(list,lathe,'chest',torsoColour,M(0,hipY,0,0,0,0,W/2,m.torso,D/2));
 // A swimmer's top, for anyone who would wear one.
 if(swim&&wearsSwimTop(recipe))
  part(list,new THREE.CylinderGeometry(W*.52,W*.52,m.torso*.2,16,1,true),'chest',recipe.swim.colour,M(0,hipY+m.torso*.66,0,0,0,0,1,1,D/W));
 // Neck.
 tube(list,[0,m.neckY-.02,0],[0,m.headY+.01,0],m.armR*1.2,'neck',skin,8);
 // Collars and the apron.
 if(!swim&&['polo','kariyushi','smock','jacket'].includes(o.top))part(list,new THREE.TorusGeometry(m.armR*1.6,m.armR*.45,6,14),'chest',o.top==='kariyushi'?o.topColour:'#f4f1ea',M(0,m.neckY-.015,m.depth*.08,Math.PI/2-.35));
 if(!swim&&o.top==='apron'){
  // Below the waist it follows the legs, so sitting down folds it onto the lap.
  const lap=p=>{if(p.y>hipY-.01)return [['hips',1]];const w=THREE.MathUtils.smoothstep(p.x,-W*.2,W*.2);return [['thighL',w],['thighR',1-w]];};
  part(list,new THREE.BoxGeometry(W*.78,m.torso*.95+m.thigh*.55,.02,6,10,1),lap,o.topColour,M(0,hipY+m.torso*.2-m.thigh*.1,D/2+.012));
  part(list,new THREE.TorusGeometry(W*.52,.012,4,20),'chest',o.topColour,M(0,waist+.02,0,Math.PI/2,0,0,1,D/W,1));
 }
 // The print: little flowers or dots over the shirt front and back.
 if(!swim&&(o.pattern==='flowers'||o.pattern==='dots')){
  // Laid flat on the cloth, facing out: a print, not buttons.
  const accent=o.pattern==='flowers'?'#f8f6ef':o.accent,shape=o.pattern==='flowers'?FLOWER:DOT;
  for(let i=0;i<18;i++){
   const a=i*2.39996,t=.2+.62*((i*.37)%1),y=hipY+m.torso*t;
   // The lathe's own radius at this height, so each print sits on the surface.
   const rr=latheRadius(prof,t);
   const x=Math.sin(a)*W/2*rr*1.012,z=Math.cos(a)*D/2*rr*1.012,face=Math.atan2(x/(W/2),z/(D/2));
   const size=m.k*(o.pattern==='flowers'?.035:.018);
   part(list,shape,'chest',accent,M(x,y,z,0,face,i*.7,size,size,size));
   if(o.pattern==='flowers')part(list,DOT,'chest','#f4d23c',M(x*1.004,y,z*1.004,0,face,0,size*.35,size*.35,size*.35));
  }
 }
 // Arms: one soft piece from shoulder to wrist, bending at the elbow; a sleeve over the
 // top that rounds into the shoulder; a round hand.
 const longSleeve=!swim&&['jacket','smock'].includes(o.top);
 const armT=m.upper/(m.upper+m.fore);
 for(const s of ['L','R']){
  const sx=s==='L'?1:-1,sh=[sx*m.shoulderX,m.shoulderY,0],hd=[sx*(m.shoulderX+.015),m.shoulderY-m.upper-m.fore,0];
  const arm={bone:'shoulder'+s,joints:[[armT,'shoulder'+s,'elbow'+s]]};
  limb(list,sh,hd,m.armR*1.04,m.armR*.86,swim||!longSleeve?skin:top,arm);
  // A short sleeve is a wider bell over the top of the arm.
  if(!swim&&!longSleeve)limb(list,sh,[sh[0]+sx*.006,sh[1]-m.upper*.58,0],m.armR*1.3,m.armR*1.42,top,{...arm,joints:[]});
  ball(list,m.hand,[hd[0],hd[1]-m.hand*.55,0],'hand'+s,skin,[1,1.1,.95],12,10);
 }
 // Legs and shoes; shorts and skirts show the knees.
 const b=swim?'swim':o.bottom;
 for(const s of ['L','R']){
  const sx=s==='L'?1:-1,hp=[sx*m.hipX,hipY,0],kn=[sx*m.hipX,hipY-m.thigh,0],an=[sx*m.hipX,m.foot,0];
  const leg={bone:'thigh'+s,joints:[[m.thigh/(hipY-m.foot),'thigh'+s,'knee'+s]]};
  const trousers=b==='trousers';
  limb(list,hp,an,m.legR*1.02,m.legR*.86,trousers?bottom:skin,leg);
  // Shorts and trunks: a wider piece over the top of the thigh.
  if(b==='shorts'||b==='swim')limb(list,[hp[0],hp[1]+m.legR*.3,0],[hp[0]*1.04,hipY-m.thigh*(b==='swim'?.22:.55),0],m.legR*1.2,m.legR*1.26,bottom,{...leg,joints:[]});
  const shoe=swim?skin:o.shoes;
  ball(list,m.legR*1.25,[sx*m.hipX,m.foot*.55,m.legR*.55],'foot'+s,shoe,[1,.62,1.75],12,8);
 }
 if(b==='skirt'||b==='longskirt'){
  const len=b==='skirt'?m.thigh*.9:m.thigh+m.shin*.85;
  // The skirt hangs from the hips and, lower down, goes with the legs: seated, it lies on the lap.
  const drape=p=>{const leg=THREE.MathUtils.smoothstep(hipY-p.y,.02,.12),w=THREE.MathUtils.smoothstep(p.x,-W*.25,W*.25);return [['hips',1-leg],['thighL',leg*w],['thighR',leg*(1-w)]];};
  part(list,new THREE.CylinderGeometry(W*.47,W*.62+len*.25,len,24,6,true),drape,bottom,M(0,hipY+.03-len/2,0,0,0,0,1,1,D/W));
 }
}

/** The face texture and the head it lives on. */
function buildHead(recipe,m,faceSize){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=faceSize;
 const ctx=canvas.getContext('2d');
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const g=new THREE.SphereGeometry(1,36,26),pos=g.attributes.position,uv=g.attributes.uv,v=new THREE.Vector3();
 // The face is projected onto the front of the sphere; everything else samples the
 // canvas edge, which is plain skin.
 const PHI0=Math.PI/2-.95,PHI=1.9,TH0=Math.PI*.28,TH=Math.PI*.58;
 for(let i=0;i<pos.count;i++){
  v.fromBufferAttribute(pos,i);
  const phi=Math.atan2(v.z,-v.x),theta=Math.acos(THREE.MathUtils.clamp(v.y,-1,1));
  uv.setXY(i,THREE.MathUtils.clamp((phi-PHI0)/PHI,.002,.998),THREE.MathUtils.clamp(1-(theta-TH0)/TH,.002,.998));
 }
 g.scale(m.Rh*m.headSX,m.Rh*m.headSY,m.Rh*.98);
 // The face is shaded as if it were flat and tipped up to the light, as a drawn face
 // is: a sphere's own normals put a hard shadow line straight across the cheeks.
 const nrm=g.attributes.normal,n=new THREE.Vector3(),toward=new THREE.Vector3(0,.4,.92).normalize();
 for(let i=0;i<nrm.count;i++){n.fromBufferAttribute(nrm,i);n.lerp(toward,THREE.MathUtils.smoothstep(n.z,-.35,.45)*.7).normalize();nrm.setXYZ(i,n.x,n.y,n.z);}
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
export function buildAvatar(input,{shadows=true,faceSize=256}={}){
 const recipe=normalizeRecipe(input),m=measure(recipe);
 const rest=restPositions(m),bones={},list=BONES.map(name=>{const b=new THREE.Bone();b.name=name;bones[name]=b;return b;});
 for(const name of BONES){
  const b=bones[name],p=rest[name],parent=PARENT[name];
  if(parent){const q=rest[parent];b.position.set(p[0]-q[0],p[1]-q[1],p[2]-q[2]);bones[parent].add(b);}else b.position.set(...p);
 }
 const parts=[];
 addBody(parts,recipe,m,false);
 // Ears.
 for(const s of [-1,1])ball(parts,m.Rh*.2,[s*m.Rh*m.headSX*.97,m.headCentre-m.Rh*.08,-m.Rh*.05],'head',recipe.body.skin,[.55,1,.8],8,6);
 addHair(parts,recipe,m);addHat(parts,recipe,m);
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
 geometry.computeBoundingSphere();
 const material=celFrom(new THREE.MeshStandardMaterial({vertexColors:true}),{bands:'soft3'});
 const body=new THREE.SkinnedMesh(geometry,material);body.name='Shimanchu body';
 body.add(bones.root);body.bind(new THREE.Skeleton(list));
 body.castShadow=shadows;body.receiveShadow=true;body.frustumCulled=false;
 // Swimwear is a second body, swapped in at the onsen.
 let swimBody=null;
 const face=buildHead(recipe,m,faceSize);
 face.head.castShadow=shadows;face.head.receiveShadow=true;
 bones.head.add(face.head);
 const root=new THREE.Group();root.name='Shimanchu · '+(recipe.name||'resident');
 root.add(body);root.rotation.y=Math.PI;
 const avatar={
  recipe,measure:m,root,body,bones,face,height:m.H,
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
   if(outfit==='swim'&&!swimBody){
    const parts=[];addBody(parts,recipe,m,true);for(const s of [-1,1])ball(parts,m.Rh*.2,[s*m.Rh*m.headSX*.97,m.headCentre-m.Rh*.08,-m.Rh*.05],'head',recipe.body.skin,[.55,1,.8],8,6);
    addHair(parts,{...recipe,outfit:{...recipe.outfit,hat:'none'}},m);
    const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());
    swimBody=new THREE.SkinnedMesh(g,material);swimBody.name='Shimanchu swimwear';swimBody.bind(body.skeleton,body.bindMatrix);
    swimBody.castShadow=shadows;swimBody.frustumCulled=false;root.add(swimBody);
   }
   body.visible=outfit!=='swim';if(swimBody)swimBody.visible=outfit==='swim';
  },
  dispose(){geometry.dispose();material.dispose();face.texture.dispose();face.head.geometry.dispose();face.head.material.dispose();swimBody?.geometry.dispose();},
 };
 avatar.paintFace({});
 return avatar;
}
