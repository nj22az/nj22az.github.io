import * as THREE from '../../vendor/three.module.js';
import {bodyVolume} from './build.js';
/**
 * Funny poses for comics, memes and the scene builders (the creator, 2026-10-11: "And add more poses and funny
 * expressions"): the body of a joke, held long enough to read. One list for the whole of Johansson World: the animator plays
 * them as moves (animate.js GESTURES), World's photo studio and Johansson Studio's Build scene offer them as poses (a still
 * taken at STILL_AT of the move, at its peak), and the storyteller picks them by `use`.
 *
 * Each pose: `label` (a short name for a menu), `use` (when to pick it: what has just happened in the story), `face` (the
 * expression it goes with: face.js EXPRESSION_NAMES), `d` (how long it lasts as a move, in seconds; held moves last until the
 * next), `ramp` (how long it takes to come and to go, in seconds, or [in, out]: half a second unless said), `airborne` (it
 * leaves the floor: the feet are not held to it) and its body (`play`). Each comes from however the body was standing (its
 * hands behind its back, in its pockets) and goes back to it. A hand that goes to the head (a cheek, the brow, the face, the
 * crown) is placed by the animator on this body's own head (`reach`: animate.js REACH, solved once per body: the whole mitten
 * clear of the head and the hair by `cover`; a big head on short arms is reached as near as they go, never into it); the
 * rest is written as joint angles (animate.js: x swings a limb forward when negative, a knee or elbow folds when positive; z
 * lifts a shoulder out to its side, left positive). Family-friendly and of the 1990s: no pose belongs to anyone's franchise.
 */
export const STILL_AT=.43;
const smooth=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
/** 0 → 1 between a and b, eased. */
const between=(t,a,b)=>smooth((t-a)/(b-a));
const clamp01=x=>Math.min(1,Math.max(0,x));

/** The legs a little bent and the knees turned in (weak at the knees; shy), written for both sides. */
const kneesIn=(P,w,bend=.22,inward=.07)=>{for(const [s,k] of [['L',1],['R',-1]]){P.toward('thigh'+s,-bend*.6,0,-k*inward,w);P.toward('knee'+s,bend,0,0,w);P.toward('foot'+s,-bend*.4,0,k*inward,w);}};
/** The left mitten on the hip, the elbow out (HandsOnHips' left arm). */
const handOnHip=(P,w)=>{P.toward('shoulderL',.15,0,.75,w);P.toward('elbowL',-.3,0,-1.5,w);};
/** Both hands where `reach` put them. */
const both=(P,A,w)=>{if(A.R)P.armTo('R',A.R,w,A.handR);if(A.L)P.armTo('L',A.L,w,A.handL);};

/**
 * PoleHug's pole (the nobori on Sakura Street, a lamp post, a flag pole: 2.2 cm in radius unless said): where its axis
 * stands in the hugging body's own frame (metres, x to the body's left, z ahead of it), as [x, z]: ahead of the chest, a
 * little to the side of the cheek against it (PoleHug: the right cheek, the face peeking out past the pole on its left;
 * PoleHugR: the left cheek), the head tipped back and turned out a little, and the pole as near as that head lets it (its
 * hair, a cap's peak or a beret included), the pole's radius and 2.5 cm clear (the body sways as it clings). A film or a scene puts the body there
 * from its pole (Johansson Studio: content/haunted-vending-machine, Mori up the nobori), and the arms and legs are solved
 * round it.
 */
export const POLE_RADIUS=.022;
// the hug's head: tipped back (a big head looking ahead keeps the pole at arm's length: tipped back, the chest comes to
// it) and turned out a little past the pole, the other cheek to it; the chest a little into the pole; the pole that far to
// the cheek's side
const POLE_HUG_HEAD=Object.freeze({pitch:-.3,yaw:.3,roll:0}),POLE_HUG_LEAN=.05,POLE_HUG_SIDE=.06;
// where the mittens grip the pole, from its axis (x, and the height over the chest; the first the left, the second the
// right, for PoleHug: the face's side a little higher), and how far beyond its axis
const POLE_HUG_GRIP=Object.freeze([[.1,.12],[-.1,.06],[.1,.06],[-.1,.12]]),POLE_HUG_GRIP_BEYOND=.03;
// where each arm's solve starts: the arm on the pole's side nearly straight out to it (from the far arm's bent start it
// came across the chest, in front of the pole), the other bent across the chest to its far side; and where the elbows go
// (out to the sides, so the arms ring the pole rather than lie along the chest)
const POLE_HUG_NEAR_SEED=Object.freeze([-1.5,.1,0,-.5,0]),POLE_HUG_FAR_SEED=Object.freeze([-1.3,.4,.6,-1.7,0]);
export const poleHugPole=(m,r=POLE_RADIUS,avatar=null,side='L')=>{const x=(side==='R'?1:-1)*POLE_HUG_SIDE*m.k;return [x,poleAhead(m,r,avatar,side,x)];};
const poleHugBoxes=(m,avatar,side,r=POLE_RADIUS)=>{const [x,z]=poleHugPole(m,r,avatar,side);
 // the pole, and its far side kept free: the mittens grip it either side of the far side, not clasped across it (a nobori's
 // flag hangs from its pole there, a sign is fixed to a post)
 return [{min:[x-r,-1,z-r],max:[x+r,4,z+r],clear:.006*m.k},{min:[x-.004,-1,z],max:[x+.004,4,z+.6],clear:.006*m.k}];};
/** How near the pole can stand ahead of the body, the head turned as the hug turns it: every head-bound point of the drawn
 *  head (its hair, a hat's brim) turned with it about the head's pivot (and leant with the chest), the pole's radius and
 *  3.5 cm clear of the nearest. Without the avatar, the head's measured ellipsoid. */
const poleAheads=new WeakMap();
function poleAhead(m,r,avatar,side,x){
 const key=side+r;let memo=avatar&&poleAheads.get(avatar);if(memo?.[key])return memo[key];
 const H=POLE_HUG_HEAD,o=side==='R'?-1:1,clear=r+.025*m.k;
 const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(H.pitch,o*H.yaw,o*H.roll)),lean=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),POLE_HUG_LEAN);
 const pivot=new THREE.Vector3(0,m.headY,0),chest=new THREE.Vector3(0,m.chestY,0),p=new THREE.Vector3();
 // (and room before the chest for the forearms to come round it: nearer, an elbow went across it)
 let z=m.depth/2+r+.13*m.k;
 const take=v=>{p.copy(v).sub(pivot).applyQuaternion(q).add(pivot).sub(chest).applyQuaternion(lean).add(chest);
  const dx=p.x-x;if(Math.abs(dx)<clear)z=Math.max(z,p.z+Math.sqrt(clear*clear-dx*dx));};
 const meshes=avatar?avatar.root.children.filter(c=>c.isSkinnedMesh&&c.visible&&!c.name.includes('outline')):[];
 let any=false;
 for(const mesh of meshes){
  const P=mesh.geometry.attributes.position,I=mesh.geometry.attributes.skinIndex,W=mesh.geometry.attributes.skinWeight,head=mesh.skeleton.bones.indexOf(avatar.bones.head);
  if(head<0)continue;const v=new THREE.Vector3();
  for(let i=0;i<P.count;i++)if(I.getX(i)===head&&W.getX(i)>.5){take(v.fromBufferAttribute(P,i));any=true;}
 }
 if(!any){const S=[m.Rh*m.headSX,m.Rh*m.headSY,m.Rh*.98],v=new THREE.Vector3();
  for(let a=0;a<64;a++)for(let b=1;b<16;b++){const t=a/64*Math.PI*2,f=b/16*Math.PI;take(v.set(S[0]*Math.sin(f)*Math.cos(t),m.headCentre+S[1]*Math.cos(f),S[2]*Math.sin(f)*Math.sin(t)));}}
 // and far enough ahead of the body's own front (a round belly reaches well past the chest's depth) for both mittens to
 // close on the pole clear of it: each mitten's middle a mitten and a centimetre outside the torso where it grips
 if(avatar?.recipe){const vol=bodyVolume(avatar.recipe,m),need=m.hand+.01*m.k;
  for(let i=0;i<80;i++){let ok=true;
   for(const [dx,dy] of POLE_HUG_GRIP)if(vol.sdf(p.set(x+dx*m.k,m.chestY+dy*m.k,z+POLE_HUG_GRIP_BEYOND*m.k))<need){ok=false;break;}
   if(ok)break;z+=.005*m.k;}}
 if(avatar){memo??={};memo[key]=z;poleAheads.set(avatar,memo);}
 return z;
}
// the hug's body: the chest a little into the pole, the thighs up before it and apart, the knees either side of it, the
// shins down and the feet turned in against it (gripping it between the knees and the calves)
// (the pole is to the cheek's side: that knee goes wider round it)
const POLE_HUG_SPREAD=Object.freeze({near:.5,far:.14});
const POLE_HUG_JOINTS=Object.freeze(Object.fromEntries(['L','R'].map(side=>{const nL=side==='R'?POLE_HUG_SPREAD.near:POLE_HUG_SPREAD.far,nR=side==='R'?POLE_HUG_SPREAD.far:POLE_HUG_SPREAD.near;
 return [side,Object.freeze({chest:[POLE_HUG_LEAN,0,0],thighL:[-1.15,0,nL],kneeL:[.95,0,0],footL:[.25,.35,0],thighR:[-1.15,0,-nR],kneeR:[.95,0,0],footR:[.25,-.35,0]})];})));
/** Up the pole, hugging it: the pole ahead of the chest, both arms round it and the mittens gripping it either side, the
 *  knees either side of it below, the head tipped back and turned out to the `side`, the other cheek against it (each arm solved round the pole
 *  on every body: reach, the pole a box to keep clear of). The arms go a long way round it, so the hug closes over 0.9 s
 *  (at 0.6 a shoulder turned 0.2 rad a frame). */
function poleHug(side){
 const o=side==='L'?1:-1,H=POLE_HUG_HEAD,at=(dx,dy,dz)=>(m,v,a)=>{const [x,z]=poleHugPole(m,POLE_RADIUS,a,side);return [x+dx*m.k,m.chestY+dy*m.k,z+dz*m.k];};
 return Object.freeze({label:side==='L'?'Up the pole':'Up the pole (right)',face:'dismay',d:Infinity,ramp:.9,airborne:true,
  use:`Up a pole (or a tree) out of fright and not coming down: hugging it, both arms round it, the legs gripping it, the ${side==='L'?'right':'left'} cheek pressed to it and the face turned out to the ${side==='L'?'left':'right'}.`,
  reach:{pose:()=>POLE_HUG_JOINTS[side],head:[H.pitch,o*H.yaw,o*H.roll],hair:true,
   L:{on:['root',at(POLE_HUG_GRIP[0][0],o>0?POLE_HUG_GRIP[0][1]:POLE_HUG_GRIP[1][1],POLE_HUG_GRIP_BEYOND)],avoid:(m,a)=>poleHugBoxes(m,a,side),elbow:m=>[m.shoulderX+.05*m.k,m.chestY,m.depth/2+.03*m.k],seed:o<0?POLE_HUG_NEAR_SEED:POLE_HUG_FAR_SEED,hand:[0,.6,0]},
   R:{on:['root',at(POLE_HUG_GRIP[1][0],o>0?POLE_HUG_GRIP[1][1]:POLE_HUG_GRIP[0][1],POLE_HUG_GRIP_BEYOND)],avoid:(m,a)=>poleHugBoxes(m,a,side),elbow:m=>[-m.shoulderX-.05*m.k,m.chestY,m.depth/2+.03*m.k],seed:o>0?POLE_HUG_NEAR_SEED:POLE_HUG_FAR_SEED,hand:[0,.6,0]}},
  play(P){const {w,t,m}=P,sway=Math.sin(t*1.7)*.02*w;
   both(P,P.reach(),w);
   P.toward('chest',POLE_HUG_LEAN+sway,0,0,w);P.toward('head',H.pitch,o*H.yaw,o*H.roll,w);
   for(const [j,a] of Object.entries(POLE_HUG_JOINTS[side]))if(j!=='chest')P.toward(j,...a,w);
   return {root:.14*w*m.k};}});
}

export const FUN_POSES=Object.freeze({
 JawDrop:Object.freeze({label:'Jaw drop',face:'gobsmacked',d:2.6,ramp:.8,
  use:'Shock at something unbelievable: both mittens on the cheeks, leaning back, the knees gone weak.',
  reach:{hair:true,head:[-.12,0,0],R:{cover:true,head:[-.82,-.38,.42,.035],seed:[-.55,.6,-1.58,-1.92,.6],hand:[0,0,0]}},
  play(P){const {w,t}=P;both(P,P.reach(),w);P.toward('chest',-.12,0,0,w);P.add('head',-.12*w+Math.sin(t*31)*.004*w);kneesIn(P,w,.24,.06);}}),
 Facepalm:Object.freeze({label:'Facepalm',face:'dry',d:2.6,ramp:.8,
  use:'Someone has done something silly (or you have): one mitten over the eyes, the head bowed into it, the other on the hip.',
  reach:{hair:true,head:[.26,0,-.1],only:'R',R:{cover:true,head:[-.12,.18,1,.035],seed:[-1.55,.72,-.72,-1.9,0],hand:[0,0,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);handOnHip(P,w);P.toward('chest',.1,0,0,w);P.add('head',.26*w,0,-.1*w);}}),
 OhNo:Object.freeze({label:'Oh no!',face:'shock',d:2.6,ramp:.8,
  use:'Disaster: both mittens clapped to the head, the elbows out, crouching a little: it has all gone wrong.',
  reach:{hair:true,head:[.1,0,0],R:{cover:.015,head:[-.7,.62,.12,.03],seed:[-2.4,.3,-.9,-1.4,0],hand:[0,0,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('chest',.08,0,0,w);P.add('head',.1*w);kneesIn(P,w,.3,0);}}),
 HideFace:Object.freeze({label:'Hide face',face:'embarrassed',d:2.8,ramp:.8,
  use:'Too embarrassed to look: both mittens over the face, the shoulders up, the knees turned in.',
  reach:{hair:true,head:[.14,0,0],R:{cover:true,head:[-.3,.02,1,.035],seed:[-1.55,.72,-.72,-1.9,0],hand:[0,0,0]}},
  play(P){const {w,t}=P;both(P,P.reach(),w);P.toward('chest',.06,0,0,w);P.add('head',.14*w);kneesIn(P,w,.2,.1);P.add('hips',0,Math.sin(t*2.2)*.05*w,0);}}),
 Shush:Object.freeze({label:'Shh!',face:'wink',d:2.6,ramp:.8,
  use:'A secret, or quiet please: a mitten held up before the lips, leaning in.',
  reach:{hair:true,head:[.06,0,0],only:'R',R:{cover:true,head:[-.04,-.4,1,.05],seed:[-1.3,.5,-.3,-2.1,0],hand:[0,-1.2,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('chest',.14,0,0,w);P.add('head',.06*w);}}),
 Salute:Object.freeze({label:'Salute',face:'focus',d:2.6,ramp:.8,
  use:'Yes, sir! Reporting for duty: the edge of the mitten at the brow, standing straight, the heels together.',
  reach:{hair:true,head:[-.05,0,0],only:'R',R:{cover:true,head:[-.6,.42,.62,.03],elbow:m=>[-(m.shoulderX+m.upper*.85),m.shoulderY,m.depth*.25],seed:[-1.1,.3,-1.3,-2.2,0],hand:[0,-1.3,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('chest',-.05,0,0,w);P.add('head',-.05*w);
   for(const s of ['L','R']){P.toward('thigh'+s,0,0,0,w);P.toward('knee'+s,0,0,0,w);P.toward('foot'+s,0,0,0,w);}}}),
 Swoon:Object.freeze({label:'Swoon',face:'daze',d:3,ramp:.8,
  use:'The dramatic swoon (oh my!): the back of a mitten to the brow, leaning back, the other arm flung out behind.',
  reach:{hair:true,head:[-.26,0,.14],only:'R',R:{cover:true,head:[-.25,.48,.85,.045],seed:[-2,.6,-.9,-1.9,0],hand:[0,1.6,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('shoulderL',.5,0,1.1,w);P.toward('elbowL',-.25,0,0,w);P.toward('chest',-.22,0,.06,w);P.add('head',-.26*w,0,.14*w);
   P.toward('thighR',-.25,0,0,w);P.toward('kneeR',.55,0,0,w);P.toward('footR',-.3,0,0,w);}}),
 Flex:Object.freeze({label:'Flex',face:'smug',d:2.6,
  use:'Showing off how strong you are: both arms up and bent, the fists by the ears, the chest out.',
  play(P){const {w,t}=P,pump=Math.sin(t*5)*.06*w;
   P.armTo('R',[-.25,0,-1.45,0],w);P.armTo('L',[-.25,0,-1.45,0],w);P.toward('elbowR',0,0,-1.9-pump,w);P.toward('elbowL',0,0,1.9+pump,w);
   P.toward('chest',-.12,0,0,w);P.add('head',-.08*w);for(const [s,k] of [['L',1],['R',-1]]){P.toward('thigh'+s,0,0,k*.12,w);P.toward('foot'+s,0,0,-k*.12,w);}}}),
 PointLaugh:Object.freeze({label:'Point and laugh',face:'laugh',d:2.8,
  use:'Somebody else’s mishap is just too funny: pointing at them, the other mitten on the belly, rocking back.',
  play(P){const {w,t}=P,rock=Math.abs(Math.sin(t*7))*w;
   P.armTo('R',[-1.45,0,-.12,-.05],w);P.armTo('L',[-.45,0,.25,-1.7],w);P.toward('handL',.2,0,0,w);
   P.toward('chest',-.16-.06*rock,0,0,w);P.add('head',(-.22-.06*rock)*w);P.toward('thighL',-.2,0,0,w);P.toward('kneeL',.4,0,0,w);P.toward('footL',-.2,0,0,w);
   return {root:.006*rock};}}),
 FistPump:Object.freeze({label:'Yes!',face:'excited',d:1.6,ramp:[.2,.7],
  use:'Victory, it worked: a fist punched up at the sky, the other pulled down to the hip, a knee up.',
  // (the fist up beside the head and above it, the arm clear of the head and its hair: big heads, short arms)
  reach:{hair:true,head:[-.16,0,0],only:'R',R:{at:m=>[-(m.Rh*m.headSX*.8+m.hand),m.headCentre+m.Rh*m.headSY*1.05,.04*m.k],upper:true,seed:[-2.9,.1,-.35,-.1,0],hand:[0,0,0]}},
  play(P){const {w,t}=P,wind=between(t,0,.25)*(1-between(t,.28,.64)),up=between(t,.28,.64),A=P.reach();
   P.armTo('R',[.3*wind,0,-.2,-1.5*wind,0].map((v,i)=>v+((A.R[i]??0)-v)*up),w);P.armTo('L',[.25*wind+.3*up,0,.25+.1*up,-1.2*wind-1.45*up],w);
   P.toward('chest',.15*wind-.12*up,0,0,w);P.add('head',(.05*wind-.16*up)*w);
   for(const s of ['L','R']){P.toward('thigh'+s,-.35*wind,0,0,w);P.toward('knee'+s,.6*wind,0,0,w);P.toward('foot'+s,-.25*wind,0,0,w);}
   P.toward('thighL',-.35*wind-1.1*up,0,0,w);P.toward('kneeL',.6*wind+1.5*up,0,0,w);P.toward('footL',-.25*wind+.3*up,0,0,w);}}),
 JumpForJoy:Object.freeze({label:'Jump for joy',face:'excited',d:1.3,airborne:true,
  use:'The good news lands: up in the air, both arms up, the heels kicked up behind.',
  play(P){const {t,m}=P,crouch=between(t,0,.22)*(1-between(t,.22,.32))+between(t,.84,.95)*(1-between(t,1,1.25)),air=between(t,.24,.44)*(1-between(t,.72,.9));
   const h=Math.max(0,Math.sin(Math.PI*clamp01((t-.3)/.55)))*.32*m.k;
   P.armTo('R',[.45*crouch-.2*air,0,-.2-2*air,-.3],1);P.armTo('L',[.45*crouch-.2*air,0,-.2-2*air,-.3],1);
   for(const s of ['L','R']){P.set('thigh'+s,-.45*crouch-.25*air);P.set('knee'+s,.85*crouch+1.5*air);P.set('foot'+s,-.4*crouch+.3*air);}
   P.add('chest',.2*crouch-.1*air);P.add('head',-.12*air);return {root:h};}}),
 StartledJump:Object.freeze({label:'Startled',face:'shock',d:1.4,airborne:true,
  use:'Boo! A jump off the ground, leaning back from the fright, the arms flung up, a knee up.',
  play(P){const {t,m}=P,up=between(t,0,.3)*(1-between(t,.95,1.3)),air=Math.max(0,Math.sin(Math.PI*clamp01((t-.08)/.85)));
   P.armTo('R',[-.7,0,-1.9,-.9],up);P.armTo('L',[-.7,0,-1.9,-.9],up);
   P.toward('chest',-.28,0,0,up);P.add('head',-.16*up);P.toward('thighL',-1,0,0,up);P.toward('kneeL',1.4,0,0,up);P.toward('footL',.3,0,0,up);
   return {root:air*.12*m.k};}}),
  // A real pole (poleHugPole): the head is wider than the shoulders, so a pole hugged before a face looking ahead went
  // through it (Johansson Studio's collision check, the creator 2026-10-14: "the world should have its collisions intact").
  // The head turns out to the side, the cheek to the pole, which stands as near the chest as that head allows. Held up off the floor by the pole
  // (the body is lifted clear, as a jump is), never hovering a centimetre over it.
 PoleHug:poleHug('L'),
 PoleHugR:poleHug('R'),
 Sneak:Object.freeze({label:'Sneak',face:'scheme',d:Infinity,
  use:'Tiptoeing past someone: crouched on the toes, the mittens up like paws, looking sideways.',
  play(P){const {w,t}=P,bob=Math.sin(t*3)*.03*w;
   P.armTo('R',[-1.15,0,-.22,-1.75],w,[.9,0,0]);P.armTo('L',[-1.15,0,-.22,-1.75],w,[.9,0,0]);
   P.toward('chest',.36,0,0,w);P.add('neck',-.14*w);P.add('head',-.1*w,.42*w,0);
   P.toward('thighL',-.8-bob,0,.04,w);P.toward('kneeL',1.1,0,0,w);P.toward('footL',.5,0,-.04,w);
   P.toward('thighR',-.2+bob,0,-.04,w);P.toward('kneeR',.95,0,0,w);P.toward('footR',.55,0,.04,w);}}),
});
