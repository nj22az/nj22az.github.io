import * as THREE from '../../vendor/three.module.js';
import {poseAvatarOnBicycle} from './bicycle-pose.js';
import {bicycleRiderFit} from '../world/bicycle-fit.js';
import {seeded} from './recipe.js';
import {consumptionPhase,poseAvatarConsumption,drinkHeadTilt} from './consume.js';
import {bodyLanguage,CONVERSATION_BIG} from './body-language.js';
import {createFootGrounder,createLieGrounder} from './foot-ground.js';
import {createSeatSupport} from './seat-support.js';
import {gaitOf} from './gait.js';
import {bodyVolume} from './build.js';
import {storyProps,pocketSpot,PAPER} from './story-props.js';

/**
 * Moves a Shimanchu. There are no animation clips: every pose is a handful of joint
 * angles worked out here each frame, which is what lets one body do anything the town
 * asks of anybody -- walk, run, sit at a counter, pedal, wave, dance the kachāshī -- and
 * is what gives the cast its bounce. Everything eases toward its target, so a change of
 * mind is a movement, not a snap.
 *
 * Angles: the body faces +z. A negative x on a thigh or shoulder swings the limb
 * forward; a positive x on a knee or elbow folds it; z on a shoulder lifts the arm out
 * to that side (left positive, right negative).
 */
const JOINTS=['hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR'];
const env=(t,d)=>t<0||t>d?0:Math.sin(Math.PI*Math.min(1,t/d));
const TIC_TIME={glance:1.4,sky:1.6,nod:1,hum:2.4,watch:1.8,hair:1.4,kick:.8,skip:1.1};
const ease=(t,d,edge=.25)=>Math.min(1,t/edge,(d-t)/edge);
const smooth=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
/** A big move (kneeling down, a deep bow): in over `a` seconds and, when it has an end, out over `b`, eased at both ends. */
const inOut=(t,d,a,b=a)=>smooth(Math.min(t/a,d===Infinity?1:(d-t)/b));
/** Face down, how far the head is raised (radians, neck and head together) so its cheek, the widest thing on
 *  them, rests on the ground beside the chest rather than holding it up off it. */
const PRONE_LIFT=m=>Math.asin(THREE.MathUtils.clamp((m.Rh*m.headSX*1.04-m.depth/2)/(m.headCentre-m.neckY),0,.9));
const _pose=new THREE.Vector3();
/** KneelHug's kneel at a seat 0.5 m high whose front edge is 0.38 m before the mark (Umi-no-yu's massage chair; its back
 *  0.43 m behind that edge): the thighs upright, the knees on the floor and the toes tucked under; leaning over the seat from
 *  the hips, the head laid on its right cheek on the seat with the face turned to the left, the right forearm along the
 *  seat, the left arm round its front. The arms are written for the right side (armTo mirrors the left). */
const KNEEL=Object.freeze({hips:.3,spine:.1,chest:.24,neck:.4,head:[.5,1.45,0],thigh:0,knee:2.1,foot:-.28,
 armR:[-1.7,.03,-.37,-.39],armL:[-.19,.34,-.47,-1.19],handR:[0,0,0],handL:[0,0,0]});
/** LieKnead on the back: the knees up and the feet flat on the floor. */
const KNEAD=Object.freeze({thigh:-.7,knee:1.92,foot:.35});
/** On the back, how far the neck and head bend forward (radians, together) so the back of the head (with its hair) and the
 *  back both rest on the floor: the head is far bigger than the body is deep. */
const SUPINE_LIFT=m=>Math.asin(THREE.MathUtils.clamp((m.Rh*1.085-m.depth/2)/(m.headCentre-m.neckY),0,.9));
/** Nelder–Mead from a fixed start: the same answer every time. */
function minimise(f,x0,step=.25,iterations=320){
 const n=x0.length;let S=[x0.slice()];for(let i=0;i<n;i++){const x=x0.slice();x[i]+=step;S.push(x);}let F=S.map(f);
 for(let it=0;it<iterations;it++){
  const o=S.map((_,i)=>i).sort((a,b)=>F[a]-F[b]);S=o.map(i=>S[i]);F=o.map(i=>F[i]);
  const c=new Array(n).fill(0);for(let i=0;i<n;i++)for(let j=0;j<n;j++)c[j]+=S[i][j]/n;
  const at=k=>c.map((v,j)=>v+k*(S[n][j]-v)),r=at(-1),fr=f(r);
  if(fr<F[0]){const e=at(-2),fe=f(e);if(fe<fr){S[n]=e;F[n]=fe;}else{S[n]=r;F[n]=fr;}}
  else if(fr<F[n-1]){S[n]=r;F[n]=fr;}
  else{const k=at(.5),fk=f(k);if(fk<F[n]){S[n]=k;F[n]=fk;}else for(let i=1;i<=n;i++){S[i]=S[i].map((v,j)=>S[0][j]+.5*(v-S[0][j]));F[i]=f(S[i]);}}
 }
 let best=0;for(let i=1;i<=n;i++)if(F[i]<F[best])best=i;return S[best];
}
/**
 * The moves whose mittens go to a place on the body itself -- the cheek, the sides of the neck, the edges of the face, together
 * before the chest -- are worked out for each body, once (heads, shoulders and arms differ from one resident to the next): the
 * arm's angles that put the middle of the mitten there, with the forearm kept out of the head and the chest. A place is on
 * the head ([direction from its centre in its own frame, then how far off its surface], with the head turned as the move
 * turns it: neck, head) or in the body's own frame at rest (`at`, from its measures). `seed`: the pose for Mr Fujita, written
 * for the right arm; the left arm is the mirror unless it has its own.
 */
/** Points over a mitten (in hand lengths, the hand bone's frame): its tip, its two faces and its sides, low and high. */
const TOUCH=Object.freeze([[0,-1.65,0],[.9,-.6,0],[-.9,-.6,0],[0,-.6,.8],[0,-.6,-.8],[.85,-1.2,0],[-.85,-1.2,0],[0,-1.2,.7],[0,-1.2,-.7],[.9,0,0],[-.9,0,0],[0,0,.8],[0,0,-.8],
 ...[[1,1],[1,-1],[-1,1],[-1,-1]].flatMap(([x,z])=>[[.85*x,-.35,.72*z],[.8*x,-1.2,.6*z]])]);
const _t=new THREE.Vector3();
const REACH=Object.freeze({
 CupHands:{head:[.2,0,0],R:{at:m=>[-m.hand*.95,m.shoulderY-.085*m.k,m.depth/2+.12*m.k],seed:[-.5,.83,-.15,-1.81,-.03],hand:[.63,0,.2]}},
 CoinToCheek:{head:[.06,0,-.24],R:{head:[-.72,-.45,.55,.05],seed:[-1.55,.72,-.72,-1.55]},L:{head:[-.45,-.72,.62,.07],seed:[-2.19,.45,.89,-.82,-.02]}},
 HoldOn:{head:[.05,0,0],R:{at:m=>[-(m.armR*1.08+.1*m.k),m.shoulderY+.09*m.k,.045*m.k],elbow:m=>[-(m.shoulderX+.05*m.k),m.shoulderY+.015*m.k,.24*m.k],seed:[-1.66,.47,-.2,-2.53,.55]}},
 Peek:{neck:.2,head:[-.14,0,0],R:{head:[-.8,-.1,.75,.065],seed:[-1.67,.82,-.73,-.88]}},
 GrenadeCoin:{head:[.08,0,0],R:{head:[-1,-.35,.25,.08],seed:[-1.63,.19,-1.01,-1.64]},L:{at:m=>[0,m.shoulderY-.1*m.k,m.depth/2+.13*m.k],seed:[-.89,.96,.19,-1.48]}},
 BannerUp:{head:[-.08,0,0],R:{at:m=>[-(m.Rh*m.headSX+.09*m.k),m.headCentre+.03*m.k,.06*m.k],seed:[-2.98,.1,-.21,-.01]}},
 HoldUp:{R:{at:m=>[-.04*m.k,m.headCentre-m.Rh*m.headSY*1.2,m.Rh*1.35],seed:[-1.29,.59,.18,-1.26]}},
 HoldUpStraws:{R:{at:m=>[-(m.Rh*m.headSX+.06*m.k),m.headCentre-m.Rh*m.headSY*1.13,m.Rh*1.25],seed:[-.95,.08,-.35,-1.56]}},
 // ---- Fujita's Back (story v7). A place carried by a bone (`on`: the bone, and the place in the body's frame at rest) is
 // found with the body in the move's own pose (`pose`), so a mitten lands on the small of a bent back or on a knee.
 // The right mitten flat on the small of the back, the fingers across the spine (BentStuck, CrabWalk, CarriedBent).
 BentBack:{pose:()=>bentJoints('stand'),neck:-.12,head:[-.26,0,0],only:'R',R:{touch:true,on:['hips',(m,v)=>onBack(m,v,-1,.32)],seed:[.55,-.35,-.25,-1.75,0],hand:[.35,0,0]}},
 // Shuffling, or carried, both mittens on the small of the back (CrabWalk, CarriedBent): the left one too.
 BentBackL:{pose:()=>bentJoints('stand'),neck:-.12,head:[-.26,0,0],only:'L',L:{touch:true,on:['hips',(m,v)=>onBack(m,v,1,.32)],seed:[.55,.35,.25,-1.75,0],hand:[.35,0,0]}},
 // In the massage chair, both mittens on the thighs by the knees: curled over them, and half uncurled (ChairUncurl).
 ChairCurl:{pose:()=>chairJoints(1),R:{touch:true,on:['thighR',m=>[-m.hipX,m.hipY-m.thigh*.78,m.legR*1.15+m.hand*.85]],seed:[-.9,.1,-.1,-.6,0],hand:[-.2,0,0]}},
 ChairHalf:{pose:()=>chairJoints(1-UNCURL.half),seedFrom:'ChairCurl',R:{touch:true,on:['thighR',m=>[-m.hipX,m.hipY-m.thigh*.62,m.legR*1.15+m.hand*.85]],seed:[-.5,.1,-.1,-.6,0],hand:[-.2,0,0]}},
 // Stuck twisted in the chair, the left mitten pressed to the small of the back (FrozenAbsurd).
 // ...and the right arm flung up at the dark, the mitten above and out beside the head (clear of it).
 AbsurdUp:{neck:.05,head:[-.08,-.3,-.2],only:'R',R:{at:m=>[-(m.Rh*m.headSX+.16*m.k),m.headCentre+m.Rh*.75,.05*m.k],seed:[-2.6,.1,-.5,-.25,0]}},
 AbsurdBack:{pose:()=>absurdJoints(),only:'L',L:{touch:true,on:['hips',(m,v)=>onBack(m,v,1,.3)],seed:[.5,.35,.25,-1.75,0],hand:[.35,0,0]}},
 // Carrying furniture: the forearms forward under the load at the waist, the mittens a shoulder's width apart, palms up.
 CarryFurniture:{R:{at:m=>[-m.width*.42,m.hipY+.15*m.k,m.depth/2+.17*m.k],seed:[-.35,.1,.05,-1.4,0],hand:[-.7,0,0]}},
 // Reading the paper held open before the chest at reading distance: the mittens at its outer edges (SitRead).
 SitRead:{R:{at:m=>[-PAPER.leaf*.92,m.chestY+.03*m.k,m.depth/2+.2*m.k],seed:[-1.05,.3,.05,-1.2,0],hand:[-.25,0,0]}},
 // The torch: the right mitten on it at the left chest pocket; held up before the chest (beam forward and up, its light
 // under the chin); held low at the waist, pointing down (TorchUp, TorchOff).
 TorchPocket:{only:'R',R:{chest:a=>{const p=pocketSpot(a);return p.position.clone().addScaledVector(p.normal,a.measure.hand*.45);},seed:[-.9,.6,.35,-1.9,0],hand:[0,0,0]}},
 TorchHigh:{only:'R',R:{at:m=>[-.05*m.k,m.chestY+.04*m.k,m.depth/2+.2*m.k],seed:[-1.1,.4,.1,-1.5,0],hand:[0,0,0]}},
 TorchLow:{only:'R',R:{at:m=>[.02*m.k,m.hipY+.14*m.k,m.depth/2+.12*m.k],seed:[-.45,.4,.1,-1.2,0],hand:[0,0,0]}},
});
/** A mitten on the small of the back, on the side `side` (+1 the left, -1 the right) at height t up the torso: on the body's
 *  surface (bodyVolume), its middle a little under half its own thickness off it. In the body's frame at rest. */
const onBack=(m,vol,side,t)=>{const p=vol.surf(Math.PI-side*.38,t);return p.addScaledVector(vol.normal(p),m.hand*.95).toArray();};
/** Fujita's stuck back (ぎっくり腰): bent at the hips to a level back (with the spine and chest, about 90°), the knees bent and
 *  forward and the bottom out behind so he stands over his feet, the feet a little apart and flat; the head lifted a little
 *  (in the after-bath clothes no further: the back of the head would come down on the tenugui round his neck; without it, up
 *  to look ahead), the face down and ahead; headTo turns it
 *  to the lens. Carried, the legs hang straight and stiff, the toes down. */
const BENT=Object.freeze({hips:1.36,spine:.06,chest:.16,neck:-.12,head:-.26,thigh:-.3,knee:.52,spread:.07,
 carried:Object.freeze({thigh:.02,knee:.08,foot:.45}),
 // without a tenugui round the neck (in his clothes at the harbour, in swimwear) the head comes up further, to look ahead
 free:Object.freeze({neck:-.5,head:-.55})});
const TENUGUI_OUTFITS=new Set(['afterbath']);
function bentJoints(mode,outfit='afterbath'){
 const B=BENT,c=mode==='carried',up=TENUGUI_OUTFITS.has(outfit)?B:B.free,th=c?B.carried.thigh:B.thigh,kn=c?B.carried.knee:B.knee,ft=c?B.carried.foot:-(B.thigh+B.knee),sp=c?.02:B.spread;
 return {hips:[B.hips,0,0],spine:[B.spine,0,0],chest:[B.chest,0,0],neck:[up.neck,0,0],head:[up.head,0,0],
  thighL:[th-B.hips,0,sp],kneeL:[kn,0,0],footL:[ft,0,-sp],thighR:[th-B.hips,0,-sp],kneeR:[kn,0,0],footR:[ft,0,sp]};
}
/** In the massage chair (seat 0.5 m), curled forward over the knees (curl 1) and slowly uncurling: the rounded back is the
 *  spine and the chest (the hips stay on the seat), the head up to look ahead. UNCURL: how far he gets before the lights go
 *  (half), and how long it takes (2.4 s, the rollers' first pass). */
const UNCURL=Object.freeze({spine:.42,chest:.62,neck:-.32,head:-.22,half:.45,time:2.4});
function chairJoints(curl){
 const U=UNCURL;
 return {spine:[U.spine*curl,0,0],chest:[U.chest*curl,0,0],neck:[U.neck*curl,0,0],head:[U.head*curl,0,0],thighL:[-1.52,0,.06],kneeL:[1.45,0,0],thighR:[-1.52,0,-.06],kneeR:[1.45,0,0]};
}
/** Stuck in the chair in a new shape when the lights come back: the chest twisted to his left and leaning to his right, the
 *  right arm flung up at the dark (the whole of him stretched up and over to the left, like a teapot), the left mitten pressed
 *  to the small of his back, the left knee hiked up to the seat's edge, the head cocked away from the raised arm. Every joint within what a back in spasm allows. */
const ABSURD=Object.freeze({spine:[.04,.12,-.1],chest:[-.06,.36,-.22],neck:[.05,-.18,-.12],head:[-.08,-.3,-.2],
 thighL:[-1.92,0,.1],kneeL:[2.1,0,0],footL:[-.3,0,0],roll:.12});
function absurdJoints(){const A=ABSURD;return {spine:A.spine,chest:A.chest,thighL:A.thighL,kneeL:A.kneeL,thighR:[-1.52,0,-.06],kneeR:[1.45,0,0]};}
/** CrabWalk's sideways shuffle, bent: a wide stance (each foot `wide` further out), steps of `step` (metres a cycle), the
 *  leading foot swinging out over the first 35% of its cycle, the other a half cycle behind closing in. */
const CRAB=Object.freeze({wide:.05,step:.15,swing:.35,lift:.3});
/** The story's held moves that the scene can name as a pose (a mark's `pose`): played as that move for as long as it is
 *  named, eased in and out over half a second. */
export const STORY_POSES=new Set(['BentStuck','CrabWalk','ChairUncurl','FrozenAbsurd','CarriedBent','CarryFurniture','CordWrapped','BasketHead','SitRead','TorchUp','TorchOff']);

/** How long each move lasts (loops run until something else happens). */
export const GESTURES=Object.freeze({
 Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,
 PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Tackle:.75,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitEnjoyFood:3.8,SitPresentFood:4.2,SitToast:2.4,SitPress:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,
 Heart:2.8,Peace:2.8,Coy:3,Tada:2.4,HandsOnHips:2.6,HeelKick:2.6,CheekRest:3,DoubleCheek:3,
 // Habits (body-language.js quirk): small, done while somebody else is talking.
 ScratchHead:1.8,HairTuck:1.6,HeelRock:2.4,ChinTap:2,CollarTug:1.5,
 // Comedy and work: a villain's laugh rubbing the hands, the wind-up before a cartoon dash,
 // and putting something on a shelf at chest height (restocking).
 EvilLaugh:2.4,WindUp:.6,Shelve:1.3,
 // Held until the next move (the onsen): drying the hair with a hand dryer by the side of the head; a hand on a
 // breaker's lever about 25° above the shoulder (Switch) or 50° (SwitchHigh, the other hand held out with a torch);
 // singing into whatever is in the hand as a microphone (Sing: Laugh's body, held, swaying to the tune).
 HairDry:Infinity,Switch:Infinity,SwitchHigh:Infinity,Sing:Infinity,
 Talk:Infinity,Kachashi:Infinity,Crouch:Infinity,Phone:Infinity,FishIdle:Infinity,Reel:Infinity,
 // Fujita's Ten Minutes of Heaven (the shot plan's batch C2). Held until the next move unless a time is given; BowDeep and
 // PoleFlick are one movement that ends in a held pose (with `hold`, the hold takes the extra time, in and out at their pace).
 CupHands:Infinity,CoinToCheek:Infinity,BowDeep:1.8,BowWalk:Infinity,KneelHug:Infinity,PoleFlick:2.4,Peek:Infinity,
 BannerUp:Infinity,FanWild:Infinity,HoldOn:Infinity,FingerStop:Infinity,Tape:Infinity,Offer:Infinity,Reach:Infinity,
 LieKnead:Infinity,GrenadeCoin:Infinity,Aim:Infinity,HoldUp:Infinity,HoldUpStraws:Infinity,Call:Infinity,WriteAbove:Infinity,
 // Fujita's Back (story v7): held until the next move, or named by the scene as a pose (STORY_POSES).
 BentStuck:Infinity,CrabWalk:Infinity,ChairUncurl:Infinity,FrozenAbsurd:Infinity,CarriedBent:Infinity,CarryFurniture:Infinity,
 CordWrapped:Infinity,BasketHead:Infinity,SitRead:Infinity,TorchUp:Infinity,TorchOff:Infinity,
});
/** The moves that ease in from wherever the body is and back to it (the story's: they lerp from the pose under them). */
const EASED=new Set(['CupHands','CoinToCheek','BowDeep','BowWalk','KneelHug','PoleFlick','Peek','BannerUp','FanWild','HoldOn','FingerStop',
 'Tape','Offer','Reach','LieKnead','GrenadeCoin','Aim','HoldUp','HoldUpStraws','Call','WriteAbove',
 'BentStuck','CrabWalk','ChairUncurl','FrozenAbsurd','CarriedBent','CarryFurniture','CordWrapped','BasketHead','SitRead','TorchUp','TorchOff']);
/** The body that goes with a feeling, played once when the feeling arrives. */
export const EMOTION_GESTURE=Object.freeze({happy:'Hop',laugh:'Laugh',sad:'Slump',angry:'Stomp',shy:'Fidget',surprised:'Gasp',worried:'Think'});

/**
 * @param {object} avatar from build.js
 * @param {{lively?:boolean,random?:()=>number}} [options] lively: a resident living their
 *   own life, who strikes their personality's poses standing about and as they start to
 *   talk (body-language.js). Off for the player's body, the photo studio and the maker,
 *   where somebody else says what the body does.
 */
export function createAvatarAnimator(avatar,{lively=false,random=Math.random,bowDepth=1}={}){
 const {bones,measure:m}=avatar;
 const groundFeet=createFootGrounder(avatar),groundLying=createLieGrounder(avatar);
 const supportSeat=createSeatSupport(avatar);
 const style=bodyLanguage(avatar.recipe?.profile||{});
 const pick=list=>list[Math.floor(random()*list.length)];
 const idleWait=()=>style.idleEvery[0]+random()*(style.idleEvery[1]-style.idleEvery[0]);
 let idleIn=4+idleWait()*.6,wasTalking=false,quietFor=10;
 const individual=seeded(avatar.recipe.name||JSON.stringify(avatar.recipe));
 const strideStyle=.92+individual()*.16,armStyle=.8+individual()*.25;
 const posture=(individual()-.5)*.055,idleRate=.85+individual()*.3;
 // How they walk (gait.js): their type, their age and, for a few, their own way of going.
 const gait=gaitOf(avatar.recipe,individual);
 let ticIn=gait.ticEvery[0]+random()*(gait.ticEvery[1]-gait.ticEvery[0]),tic=null,ticT=0;
 // Listening (body-language.js listen): which way their head leans, and their two habits:
 // the one their personality has, and one that is just theirs.
 const listen=style.listen,tiltSide=individual()<.5?-1:1,habits=[style.quirk,['ScratchHead','HairTuck','HeelRock','ChinTap','CollarTug'][Math.floor(individual()*5)]];
 const between=([a,b])=>a+random()*(b-a);
 let nodIn=between(listen.nodEvery),nodT=-1,quirkIn=between(listen.quirkEvery),beatCool=0,awayIn=2,awayT=0,awaySide=1,attention=0;
 const gazeWorld=new THREE.Vector3();let gazeWeight=0,hadGaze=false;
 const current=Object.fromEntries(JOINTS.map(j=>[j,new THREE.Vector3()]));
 const target=Object.fromEntries(JOINTS.map(j=>[j,new THREE.Vector3()]));
 const gazeLocal=new THREE.Vector3();
 let phase=0,time=Math.random()*10,rootY=0,hipsY=0,lean=0;
 let lie=0,lyingTilt=false,prone=false;
 // KneelHug's kneel, 0..1: eased down and up over 0.8 s whatever ends the move (its time, another move, a stop).
 let kneelRamp=0,kneel=0,kneelT=0;
 let gesture=null,blinkIn=1+Math.random()*3,blinkT=-1,talkT=0,talkOpen=0,glance=[0,0],glanceIn=2,lastExpression='neutral';
 const headRestPosition=bones.head.position.clone();
 // ---- Hands on this body's own shape (REACH): worked out the first time each move is played, then kept.
 const reached=new Map();let volume=null;
 const _q=[0,1,2,3].map(()=>new THREE.Quaternion()),_eu=new THREE.Euler(),_p=[0,1,2,3,4].map(()=>new THREE.Vector3());
 function reachFor(name){
  if(reached.has(name))return reached.get(name);
  const spec=REACH[name],k=m.k,S=[m.Rh*m.headSX,m.Rh*m.headSY,m.Rh*.98],hc=m.headCentre-m.headY;volume??=bodyVolume(avatar.recipe,m);
  // The head in the chest's frame, turned as the move turns it.
  const qNeck=new THREE.Quaternion().setFromEuler(_eu.set(spec.neck||0,0,0)),qHead=qNeck.clone().multiply(new THREE.Quaternion().setFromEuler(_eu.set(...(spec.head||[0,0,0])))),qInv=qHead.clone().invert();
  const headAt=bones.neck.position.clone().add(headRestPosition.clone().applyQuaternion(qNeck)),chestAt=new THREE.Vector3(0,m.chestY,0);
  const onHead=([dx,dy,dz,off])=>{const u=new THREE.Vector3(dx,dy,dz).normalize(),n=new THREE.Vector3(u.x/S[0],u.y/S[1],u.z/S[2]).normalize();
   return new THREE.Vector3(u.x*S[0],u.y*S[1]+hc,u.z*S[2]).addScaledVector(n,off*k).applyQuaternion(qHead).add(headAt);};
  const headR=p=>{const q=_p[4].copy(p).sub(headAt).applyQuaternion(qInv);return Math.hypot(q.x/S[0],(q.y-hc)/S[1],q.z/S[2]);};
  const out={};
  // A place carried by a bone, with the body in the move's pose: where it is in the chest's frame then.
  const posed=spec.pose?posedPlaces(spec.pose()):null,hipsM=spec.pose?chestToHips(spec.pose()):null,_h=new THREE.Vector3();
  // how far a point (in the chest's frame) is from the torso: bent, from the hips' part or the chest's, whichever is nearer
  // (and, posed, from the legs too: each a round limb of the leg's thickness and its clothes)
  const _s=new THREE.Line3(),_n=new THREE.Vector3();
  const torso=p=>{const d=volume.sdf(_h.copy(p).add(chestAt));if(!hipsM)return d;let e=Math.min(d,volume.sdf(_h.copy(p).applyMatrix4(hipsM)));
   for(const [a,b] of hipsM.legs){_s.set(a,b);e=Math.min(e,_s.closestPointToPoint(p,true,_n).distanceTo(p)-m.legR*1.15);}return e;};
  for(const side of ['R','L']){
   if(spec.only&&side!==spec.only)continue;
   // a side without its own place is the mirror of the right
   const own=!!spec[side],want=spec[side]||spec.R,sg=side==='R'?1:-1,mirror=a=>a.map((v,i)=>i===1||i===2||i===4?v*sg:v);
   const flipX=v=>own?v:[-v[0],...v.slice(1)];
   const target=want.head?onHead(flipX(want.head)):want.on?posed(own?want.on[0]:want.on[0].replace(/[RL]$/,c=>c==='R'?'L':'R'),flipX(want.on[1](m,volume)))
    :want.chest?want.chest(avatar):new THREE.Vector3(...flipX(want.at(m))).sub(chestAt);
   const elbowAt=want.elbow?new THREE.Vector3(...flipX(want.elbow(m))).sub(chestAt):null;
   const hand=want.hand?mirror(want.hand):[0,0,0],seed=mirror(spec.seedFrom?reachFor(spec.seedFrom)[side]:[...want.seed,0].slice(0,5));
   const sh=bones['shoulder'+side].position,el=bones['elbow'+side].position,wr=bones['hand'+side].position,mit=new THREE.Vector3(0,-m.hand*.55,0);
   const qHand=new THREE.Quaternion().setFromEuler(_eu.set(...hand));
   const cost=x=>{
    _q[0].setFromEuler(_eu.set(x[0],x[1],x[2]));const E=_p[0].copy(el).applyQuaternion(_q[0]).add(sh);
    _q[1].copy(_q[0]).multiply(_q[2].setFromEuler(_eu.set(x[3],x[4],0)));const W=_p[1].copy(wr).applyQuaternion(_q[1]).add(E);
    _q[3].copy(_q[1]).multiply(qHand);const M=_p[2].copy(mit).applyQuaternion(_q[3]).add(W);
    let c=M.distanceToSquared(target)*100/(k*k);
    if(elbowAt)c+=E.distanceToSquared(elbowAt)*10/(k*k);
    // the forearm and the mitten out of the head and the chest
    for(let i=0;i<=4;i++){const p=_p[3].copy(E).lerp(W,i/4),r=headR(p),near=1+m.armR*1.15/m.Rh;if(r<near)c+=(near-r)**2*40;
     // (a mitten laid on the body (touch) brings its wrist to it: there only the forearm's upper part is kept off)
     if(want.touch&&i>2)continue;
     const d=torso(p);if(d<m.armR*1.1&&(hipsM||p.y+chestAt.y>m.hipY+.1*k))c+=((m.armR*1.1-d)/k)**2*400;}
    const rm=headR(M),nearM=1+m.hand*.85/m.Rh;if(rm<nearM)c+=(nearM-rm)**2*300;
    const dm=torso(M),clear=want.touch?m.hand*.7:m.hand*.9;if(dm<clear)c+=((clear-dm)/k)**2*400;
    // laid on the body, the whole mitten stays on it, not in it: its tip and the backs of its sides
    if(want.touch)for(const q of TOUCH){const d=torso(_t.set(q[0]*m.hand,q[1]*m.hand,q[2]*m.hand).applyQuaternion(_q[3]).add(W));if(d<.009*k)c+=((.009*k-d)/k)**2*2000;}
    for(let i=0;i<5;i++)c+=.01*(x[i]-seed[i])**2;if(x[3]>0)c+=x[3]**2;if(x[3]<-2.6)c+=(x[3]+2.6)**2;
    // (a move may keep the upper arm's and the forearm's twist near its seed, so the arm is not wound round to get there)
    if(want.twist)c+=want.twist*((x[1]-seed[1])**2+(x[4]-seed[4])**2);
    return c;};
   let x=seed;for(const step of [.3,.1,.03])x=minimise(cost,x,step);
   out[side]=mirror(x);out['hand'+side]=want.hand||null;
  }
  reached.set(name,out);return out;
 }
 /** With the body put in `pose` (joint: [x, y, z]; every other joint straight) for a moment: a function giving, for a place
  *  carried by a bone (in the body's frame at rest), where it is in the chest's frame. The body is put back as it was. */
 function posedPlaces(pose){
  const root=avatar.root,saved=JOINTS.map(j=>bones[j].rotation.toArray().slice(0,3));
  const put=rot=>{JOINTS.forEach((j,i)=>bones[j].rotation.set(...rot(j,i)));root.updateMatrixWorld(true);};
  return (bone,p)=>{
   put(()=>[0,0,0]);const v=bones[bone].worldToLocal(root.localToWorld(new THREE.Vector3(...p)));
   put(j=>pose[j]||[0,0,0]);const out=bones.chest.worldToLocal(bones[bone].localToWorld(v));
   put((j,i)=>saved[i]);return out;};
 }
 /** In `pose`, the matrix from the chest's frame to the hips' frame placed at rest (the body's frame at rest, as bodyVolume
  *  has it), so a bent body's lower back is where the hips have taken it. */
 function chestToHips(pose){
  const root=avatar.root,saved=JOINTS.map(j=>bones[j].rotation.toArray().slice(0,3));
  JOINTS.forEach(j=>bones[j].rotation.set(...(pose[j]||[0,0,0])));root.updateMatrixWorld(true);
  const M=new THREE.Matrix4().copy(bones.hips.matrixWorld).invert().multiply(bones.chest.matrixWorld).premultiply(new THREE.Matrix4().makeTranslation(0,m.hipY,0));
  // the legs in the chest's frame: hip, knee and ankle of each, for keeping a mitten on a thigh out of it
  const at=b=>bones.chest.worldToLocal(bones[b].getWorldPosition(new THREE.Vector3()));
  M.legs=['L','R'].flatMap(s=>[[at('thigh'+s),at('knee'+s)],[at('knee'+s),at('foot'+s)]]);
  JOINTS.forEach((j,i)=>bones[j].rotation.set(...saved[i]));root.updateMatrixWorld(true);return M;
 }
 // ---- Fujita's Back: the pose the scene names (s.pose, one of STORY_POSES) and how far in it is (ramp 0..1); CrabWalk's step
 // (cycles) and which way he goes (+1 to his left, -1 to his right: the way he is moved); how far CordWrapped's cord is
 // wound; whether a move wants the paper or the basket this frame; the torch's arm (torchArm); the head's turn (headTo).
 let posed=null,crabPhase=0,crabSide=1,wrap=0,reading=0,basketWanted=false,headToW=0;const lastHolder=new THREE.Vector3();let holderSeen=false;
 const lastHeadTo=new THREE.Vector3();
 const torch={at:'pocket',goal:null,t:0,d:0,from:null,to:null,fromW:0,toW:0,cur:[0,0,0,0,0],w:0,p0:new THREE.Vector3(),q0:new THREE.Quaternion()};
 let consumption=null,consumeTime=0,lastConsume=null,driftX=0;
 const set=(j,x=0,y=0,z=0)=>target[j].set(x,y,z);
 const add=(j,x=0,y=0,z=0)=>target[j].add(new THREE.Vector3(x,y,z));

 /** What the arms do on the walk (gait.js carry). */
 function carryArms(carry,sp,A){
  if(carry==='behind'){set('shoulderL',.38,0,.18);set('shoulderR',.38,0,-.18);set('elbowL',-.95);set('elbowR',-.95);}
  else if(carry==='pockets'){set('shoulderL',sp*A*.15+.05,0,.07);set('shoulderR',-sp*A*.15+.05,0,-.07);set('elbowL',-.4);set('elbowR',-.4);}
  else if(carry==='stiff'){set('shoulderL',sp*A*1.25,0,.08);set('shoulderR',-sp*A*1.25,0,-.08);set('elbowL',-.05);set('elbowR',-.05);}
  else if(carry==='hips'){set('shoulderL',.1,0,.62);set('shoulderR',.1,0,-.62);set('elbowL',-1.6);set('elbowR',-1.6);}
 }
 /** A walking tic, at strength e (0..1, in and out). */
 function walkTic(kind,e,sp){
  if(kind==='glance')add('head',0,.75*e*tiltSide,0);
  else if(kind==='sky')add('head',-.45*e,0,0);
  else if(kind==='nod')add('head',Math.abs(Math.sin(e*Math.PI*2))*.22*e,0,0);
  else if(kind==='hum')add('head',0,0,Math.sin(time*6)*.14*e);
  else if(kind==='watch'){set('shoulderL',-1.15*e,0,.15+.25*e);set('elbowL',-.25-1.45*e);add('head',.3*e,.35*e,0);}
  else if(kind==='hair'){set('shoulderR',-2.1*e,0,-.12-.35*e);set('elbowR',-.25-1.55*e);add('head',0,0,-.1*e);}
  else if(kind==='kick'){add(sp>0?'thighL':'thighR',-.55*e,0,0);}
  else if(kind==='skip'){add('shoulderL',0,0,.35*e);add('shoulderR',0,0,-.35*e);}
 }

 /** @param {number} [seconds] how long to hold a move that would otherwise loop.
  *  @param {boolean} [hold] also stretch a timed move to `seconds` (a Point held through a line: in and out at its own pace). */
 function play(name,seconds,hold){
  if(!(name in GESTURES))return false;
  gesture={name,t:0,d:(GESTURES[name]===Infinity||hold)&&seconds?seconds:GESTURES[name]};return true;
 }
 /** A move of one's own choosing: loops are held for a few seconds, not for ever. */
 const flourish=name=>play(name,2.6+random()*1.4);
 const stop=()=>{gesture=null;};

 /**
  * @param {number} dt
  * @param {object} s what the body is doing:
  *   speed, running, seated, seatHeight, floorHeight, pose, riding, ridePhase, carrying,
  *   waving, talking, expression, sleeping, airborne, seat ('Sit'|'SitEat'|'Soak'),
  *   gaze (a world point to look at), tipsy (0–4: how much they have drunk),
  *   conversing (in a conversation, talking or listening),
  *   pose 'SitPour' (seated, pouring a bottle into the glass in the other hand), 'SitHold' (a glass held up),
  *   'DrinkHip' / 'SitDrinkHip' (drinking with the other hand on the hip, chin up: coffee milk after the bath),
  *   lying (flat on their back on the floor, knocked out: arms and legs flung out, head lolling;
  *   0–1 blends them down and up again; 'prone': face down instead, the cartoon knock-out: flat on the
  *   front, the arms flung out on the ground, the head turned to rest on a cheek, the knees bent and
  *   the feet up in the air, swaying gently)
  */
 function update(dt,s={}){
  time+=dt;
  const action=gesture?.name||s.pose||s.seat;avatar.setOpenHands?.(false);   // always mitten hands (the creator): never fingers, in any move
  const eating=['Eat','EatStanding','SitEat'].includes(action),drinking=['Drink','DrinkStanding','DrinkHip','SitDrink','SitDrinkHip','SitToast'].includes(action);
  if(eating||drinking){
   if(action!==lastConsume)consumeTime=0;
   consumeTime+=dt;
   const t=Number.isFinite(s.consumeElapsed)?s.consumeElapsed:gesture?gesture.t+dt:consumeTime%5;
   consumption={...consumptionPhase(t),food:eating,elapsed:consumeTime,cycle:Math.floor(consumeTime/5)};
  }else{consumption=null;consumeTime=0;}
  lastConsume=action;
  for(const j of JOINTS)target[j].set(0,0,0);
  let targetRoot=0,targetHips=0,targetLean=0;
  const chairBlend=Number.isFinite(s.chairBlend)?THREE.MathUtils.clamp(s.chairBlend,0,1):(s.seated?1:0);
  const onChair=chairBlend>0||s.seated;
  const speed=s.speed||0,moving=speed>.08&&!s.seated&&!s.riding;
  // Arms hang a little out from the body, the way a toy's do.
  set('shoulderL',0,0,.13);set('shoulderR',0,0,-.13);set('elbowL',-.12);set('elbowR',-.12);
  if(s.riding){
   // Pedalling: the knees go round, the hands are on the bars.
   const p=s.ridePhase||0;
   const fit=s.bicycleFit||bicycleRiderFit(m);
   targetRoot=fit.saddle*fit.scale-m.hipY+m.seatDrop;
   set('thighL',-1.05+Math.sin(p*Math.PI*2)*.38);set('kneeL',1.05+Math.cos(p*Math.PI*2)*.4);
   set('thighR',-1.05-Math.sin(p*Math.PI*2)*.38);set('kneeR',1.05-Math.cos(p*Math.PI*2)*.4);
   set('chest',.28);set('head',-.18);
   set('shoulderL',-1.15,0,.18);set('shoulderR',-1.15,0,-.18);set('elbowL',-.35);set('elbowR',-.35);
  }else if(onChair){
   const soak=s.seat==='Soak'||s.pose==='Soak';
   targetRoot=(Number.isFinite(s.seatHeight)?s.seatHeight:.45)-m.hipY+m.seatDrop;
   set('thighL',-1.52,0,.06);set('thighR',-1.52,0,-.06);set('kneeL',1.45);set('kneeR',1.45);
   // On cushions and low benches, extend the shins instead of driving the
   // shoes through the floor. Higher stools let the short legs hang naturally.
   const ankle=(Number.isFinite(s.seatHeight)?s.seatHeight:.45)+m.seatDrop-m.thigh*Math.cos(1.52)-(s.floorHeight||0)-m.foot-m.legR*.28;
   if(!soak&&ankle<m.shin*Math.cos(.07)){
    const shinAngle=-Math.acos(THREE.MathUtils.clamp(ankle/m.shin,0,1));
    set('kneeL',1.52+shinAngle);set('kneeR',1.52+shinAngle);
    set('footL',-shinAngle);set('footR',-shinAngle);
   }
   // Rest beside the thighs; task poses lift only the arms they need.
   set('shoulderL',-.10,0,.13);set('shoulderR',-.10,0,-.13);set('elbowL',-.15);set('elbowR',-.15);
   add('chest',Math.sin(time*1.5)*.02);
   const pose=s.pose;
   if(s.driving){set('shoulderL',-.95,0,.12);set('shoulderR',-.95,0,-.12);set('elbowL',-.65);set('elbowR',-.65);set('head',-.06);}
   else if(pose==='Type'){set('shoulderL',-.9,0,.1);set('shoulderR',-.9,0,-.1);set('elbowL',-.7+Math.sin(time*14)*.08);set('elbowR',-.7+Math.sin(time*13+1)*.08);set('head',.15);}
   else if(pose==='Eat'||pose==='Drink'||pose==='SitDrinkHip'||s.seat==='SitEat'){const lift=Math.max(0,Math.sin(time*1.4))**4;set('shoulderR',-.6-lift*.9,0,-.25);set('elbowR',-.8-lift*1.3);set('head',.08-lift*.1);
    // the bathhouse way with a bottle of milk: the other hand on the hip, the chin up
    if(pose==='SitDrinkHip'){set('shoulderL',.15,0,.75);set('elbowL',-.3,0,-1.5);add('head',-.12);}}
   // Pouring from the chair: the glass held out low in the right hand, the bottle brought across in the left
   // and tipped over it, the head down to watch the level (never filling it past the foam).
   // Holding a glass between sips: the forearm up off the arm of the chair, the glass in front of him.
   else if(pose==='SitHold'){set('shoulderR',-.62,0,-.1);set('elbowR',-1.25);}
   else if(pose==='SitPour'){set('shoulderR',-.75,0,.12);set('elbowR',-1.3);set('shoulderL',-1.2,0,-.5);set('elbowL',-.7);set('head',.32,-.18,0);set('chest',.08);}
   else if(pose==='Sleep'||s.sleeping){set('head',.45,0,.15);set('chest',.15);}
   else if(soak){set('thighL',-1.3,0,.25);set('thighR',-1.3,0,-.25);set('kneeL',.9);set('kneeR',.9);set('shoulderL',0,0,.9);set('shoulderR',0,0,-.9);set('head',-.1);}
   else if(pose==='Wake'){const w=Math.max(0,Math.sin(time*.8));set('shoulderL',0,0,.4+w*2.2);set('shoulderR',0,0,-.4-w*2.2);}
  }else if(moving){
   // Walking and running: short legs, a quick step and a proper bounce.
   // Their own gait (gait.js) shapes every part of the step; running evens people out.
   const run=s.running||speed>2.6,G=run?{...gait,carry:'swing',lean:gait.lean*.5,sway:gait.sway*.5}:gait;
   // Backing out of a room with a bow (BowWalk): small steps, taken backwards (the step cycle runs the other way).
   const backing=!run&&gesture?.name==='BowWalk',small=backing?.55:1;
   const stride=m.leg*(run?2.6:1.7)*strideStyle*G.stride*small;
   phase+=(backing?-1:1)*speed/stride*Math.PI*2*dt*.5;
   const A=(run?.95:Math.min(.62,.25+speed*.3))*Math.sqrt(G.stride)*(backing?.6:1),sp=Math.sin(phase),cp=Math.cos(phase);
   set('thighL',-sp*A,G.toe,0);set('thighR',sp*A,-G.toe,0);
   set('kneeL',(Math.max(0,Math.sin(phase-.9))*A*1.5+.05)*G.lift);set('kneeR',(Math.max(0,Math.sin(phase+Math.PI-.9))*A*1.5+.05)*G.lift);
   set('footL',sp*A*.3);set('footR',-sp*A*.3);
   const swing=A*armStyle*G.arms;
   set('shoulderL',sp*swing,0,.12);set('shoulderR',-sp*swing,0,-.12);
   set('elbowL',run?-1.35:-.25-G.elbow-Math.max(0,-sp)*.3);set('elbowR',run?-1.35:-.25-G.elbow-Math.max(0,sp)*.3);
   set('hips',0,sp*.14*G.swagger,Math.sin(phase)*G.sway);set('chest',(run?.22:.05)+G.lean,-sp*.18*G.swagger,-Math.sin(phase)*G.sway*.6);
   set('head',(run?-.12:-.02)-G.lean*.5+Math.abs(cp)*G.headBob,sp*.08,0);
   if(!s.carrying&&!run)carryArms(G.carry,sp,A);
   targetHips=Math.abs(cp)*(run?.055:.025)*m.k*G.bounce-(run?.02:0);
   // Now and then, their walking tic.
   if(!run&&!s.carrying){
    if(!tic){ticIn-=dt;if(ticIn<=0){tic=pick(gait.tics);ticT=0;ticIn=gait.ticEvery[0]+random()*(gait.ticEvery[1]-gait.ticEvery[0]);}}
    if(tic){ticT+=dt;const d=TIC_TIME[tic]||1.2,e=env(ticT,d);walkTic(tic,e,sp);if(tic==='skip')targetHips+=Math.abs(Math.sin(ticT/d*Math.PI*2))*.05*m.k*e;if(ticT>=d)tic=null;}
   }
   if(s.carrying){set('shoulderL',-1.15,0,.3);set('shoulderR',-1.15,0,-.3);set('elbowL',-.5);set('elbowR',-.5);}
  }else{
   // Standing: breathing, the weight moving from foot to foot, the odd look round.
   add('chest',Math.sin(time*1.6)*.025);set('hips',0,0,Math.sin(time*.45)*.035);add('head',Math.sin(time*.7)*.03,Math.sin(time*.31)*.12,Math.sin(time*.5)*.04);
   add('thighL',0,0,-Math.sin(time*.45)*.03);add('thighR',0,0,-Math.sin(time*.45)*.03);
   add('chest',posture);add('head',0,Math.sin(time*.31*idleRate)*.035,0);
   // In a conversation the wandering head settles: attention is on the other person.
   if(attention>.01)add('head',-Math.sin(time*.7)*.03*attention,-Math.sin(time*.31)*.12*attention*.8,-Math.sin(time*.5)*.04*attention*.8);
   targetHips=Math.sin(time*1.6*idleRate)*.004;
   const pose=s.pose;
   // Standing about the way they walk: an elder's hands behind the back, a loafer's in the pockets.
   // (The story's moves ease in from this and back to it, so it stays under them.)
   if((!pose||STORY_POSES.has(pose))&&!s.carrying&&(!gesture||EASED.has(gesture.name))){add('chest',gait.lean*.6);if(gait.carry==='behind'||gait.carry==='pockets')carryArms(gait.carry,0,0);}
   if(pose==='CounterIdle'){set('shoulderL',-.5,0,.2);set('shoulderR',-.5,0,-.2);set('elbowL',-.95);set('elbowR',-.95);}
   else if(pose==='Interact'){set('shoulderL',-.75+Math.sin(time*4.5)*.18,0,.15);set('shoulderR',-.75+Math.sin(time*4.5+1.7)*.18,0,-.15);set('elbowL',-.8);set('elbowR',-.8);add('chest',.12);add('head',.2);}
   // Cleaning (people/izakaya-hours.js): the arms work, the chest turns into it.
   else if(pose==='Sweep'||pose==='Mop'){const fast=pose==='Sweep',w=Math.sin(time*(fast?2.4:1.6));set('shoulderL',-.85,0,.15);set('shoulderR',-.7,0,-.05);set('elbowL',-.5);set('elbowR',-.25);add('chest',fast?.22:.3,w*(fast?.35:.45),0);add('hips',0,w*.12,0);add('head',.18,-w*.2,0);}
   else if(pose==='Wipe'){const a=time*3.2;set('shoulderR',-.95+Math.sin(a)*.12,Math.cos(a)*.22,-.15);set('elbowR',-.45);set('shoulderL',-.35,0,.25);set('elbowL',-.4);add('chest',.35);add('head',.25);}
   else if(pose==='Polish'){set('shoulderL',-.9,0,.25);set('shoulderR',-.9,0,-.25);set('elbowL',-1.45);set('elbowR',-1.45+Math.sin(time*5)*.18);add('head',.28);}
   else if(pose==='Stack'){const l=(Math.sin(time*1.4)+1)/2;set('shoulderL',-.6-l,0,.2);set('shoulderR',-.6-l,0,-.2);set('elbowL',-.6+l*.3);set('elbowR',-.6+l*.3);add('chest',.2-l*.15);}
   else if(pose==='DrinkStanding'||pose==='Drink'||pose==='DrinkHip'){const lift=Math.max(0,Math.sin(time*1.2))**4;set('shoulderR',-.5-lift*1.1,0,-.2);set('elbowR',-.9-lift*1.2);
    // DrinkHip: a bottle of coffee milk after the bath, the free hand on the hip, the chin up
    if(pose==='DrinkHip'){set('shoulderL',.15,0,.75);set('elbowL',-.3,0,-1.5);add('chest',-.06);add('head',-.12);}}
   else if(pose==='Sit'||pose==='Sleep'){set('head',.2);}
   // Jan-ken-pon (people/social.js sistersAtPlay): three pumps of the fist, then the throw
   // held out between them, round again.
   else if(pose==='Janken'){const c=(time*idleRate)%2.4;
    if(c<1.2){const pump=Math.abs(Math.sin(c/1.2*Math.PI*3));set('shoulderR',-.75-pump*.4,0,-.15);set('elbowR',-1.5+pump*.3);add('head',.06*pump);add('chest',.04*pump);}
    else{set('shoulderR',-1.35,0,-.1);set('elbowR',-.15);add('chest',.08);add('head',.1);}
    set('shoulderL',-.15,0,.4);set('elbowL',-1.25);}
   if(s.carrying){set('shoulderL',-1.15,0,.3);set('shoulderR',-1.15,0,-.3);set('elbowL',-.5);set('elbowR',-.5);}
  }
  // Drunk (tipsy 0–4, 2.5 is properly drunk): the body loses its line. A slow roll
  // through hips and chest, a lolling head, a stride that comes out uneven and arms held
  // out for balance; now and then a lurch. Standing, the whole body sways on its feet.
  const drunk=THREE.MathUtils.clamp((s.tipsy||0)/2.5,0,1);
  let drift=0;
  if(drunk>0&&!s.riding&&!s.airborne){
   const roll=Math.sin(time*1.7),lurch=Math.max(0,Math.sin(time*.43+Math.sin(time*.19)*2))**8;
   if(s.seated){add('head',.22*drunk+Math.sin(time*.6)*.06*drunk,Math.sin(time*.37)*.1*drunk,Math.sin(time*.5)*.12*drunk);add('chest',.08*drunk,0,Math.sin(time*.5)*.05*drunk);}
   else if(moving){
    const uneven=1+Math.sin(phase*.5)*.35*drunk;
    target.thighL.x*=uneven;target.thighR.x*=2-uneven;
    add('hips',0,0,roll*.12*drunk);add('chest',.06*drunk+lurch*.25*drunk,0,-roll*.14*drunk);
    add('head',.1*drunk,Math.sin(time*.8)*.15*drunk,roll*.18*drunk);
    add('shoulderL',0,0,.35*drunk);add('shoulderR',0,0,-.35*drunk);
    drift=roll*.07*drunk+lurch*Math.sign(Math.sin(time*.21))*.06*drunk;
   }else{
    add('hips',0,0,Math.sin(time*.9)*.06*drunk);add('chest',.04*drunk,0,-Math.sin(time*.9)*.08*drunk);
    add('head',.12*drunk,Math.sin(time*.4)*.12*drunk,Math.sin(time*.9+.6)*.12*drunk);
    add('thighL',0,0,.05*drunk);add('thighR',0,0,-.05*drunk);
    drift=Math.sin(time*.9)*.04*drunk;
   }
  }
  driftX+=(drift-driftX)*(1-Math.exp(-dt*6));
  if(s.airborne&&!s.seated){set('thighL',-.6);set('thighR',-.2);set('kneeL',1);set('kneeR',.6);set('shoulderL',-.3,0,1.6);set('shoulderR',-.3,0,-1.6);}
  // A feeling arriving brings its body with it, once.
  const expression=s.expression||'neutral';
  const conversing=!!s.conversing;
  attention+=((conversing?1:0)-attention)*(1-Math.exp(-dt*3));beatCool=Math.max(0,beatCool-dt);
  // In a conversation a big move would pull the body off the other person: it comes out
  // as their habit instead, and there is a breath between one move and the next, so a
  // run of lines does not set off a run of gestures.
  const beat=g=>{if(!conversing)return flourish(g);if(beatCool>0)return false;beatCool=3.5;return flourish(CONVERSATION_BIG.has(g)?habits[0]:g);};
  // Which move depends on who they are: a happy Typhoon throws a ta-da, a happy
  // Lighthouse keeper nods.
  if(expression!==lastExpression){lastExpression=expression;const g=style.feel[expression]||EMOTION_GESTURE[expression];if(g&&!s.seated&&!moving&&!gesture&&!STORY_POSES.has(s.pose))beat(g);}
  const talking=!!s.talking;
  if(lively){
   const free=!moving&&!s.seated&&!s.riding&&!s.airborne&&!s.sleeping&&!s.carrying&&!consumption&&(!s.pose||s.pose==='Idle')&&!s.heldProp;
   // Starting to say something, after a pause: the hands go with the words.
   if(talking&&!wasTalking&&quietFor>.8&&free&&!gesture&&random()<style.talkChance)beat(pick(style.talk));
   // Listening: little nods along, now and then their habit. Never the idle moves, which
   // look round the room or stretch, as if bored of you.
   if(conversing&&!talking){
    nodIn-=dt;if(nodIn<=0&&nodT<0){nodT=0;nodIn=between(listen.nodEvery);}
    if(free&&!gesture){quirkIn-=dt;if(quirkIn<=0){quirkIn=between(listen.quirkEvery);if(beatCool<=0){beatCool=2.5;flourish(pick(habits));}}}
    idleIn=Math.max(idleIn,4);
   }
   // Standing about with nothing to do: now and then, something of their own.
   else if(free&&!talking&&!gesture){idleIn-=dt;if(idleIn<=0){flourish(pick(style.idle));idleIn=idleWait();}}
   else idleIn=Math.max(idleIn,2);
  }
  // A listener's nod is a small dip of the head, not a whole move; the head leans a
  // little their way while they listen.
  if(nodT>=0){nodT+=dt;add('head',Math.sin(Math.min(1,nodT/.55)*Math.PI)*.13);if(nodT>=.55)nodT=-1;}
  if(attention>.01&&!talking)add('head',0,0,listen.tilt*tiltSide*attention);
  quietFor=talking?0:quietFor+dt;wasTalking=talking;
  if(s.waving&&!gesture)play('Wave');
  let gestureEyes=null;
  // A held move the scene names as a pose (s.pose, one of STORY_POSES) is played as that move while it is named: in over half
  // a second, and out over half a second once it is not (a new one comes in when the old one is out).
  const named=STORY_POSES.has(s.pose)&&gesture?.name!==s.pose?s.pose:null;
  if(named&&!posed)posed={name:named,t:0,d:Infinity,ramp:0};
  if(posed){const on=posed.name===named;posed.ramp=THREE.MathUtils.clamp(posed.ramp+(on?dt:-dt)/.5,0,1);posed.t+=dt;
   if(!on&&posed.ramp===0)posed=named?{name:named,t:0,d:Infinity,ramp:0}:null;}
  wrap=0;reading=0;basketWanted=false;
  const crabbing=gesture?.name==='CrabWalk'||posed?.name==='CrabWalk';
  if(crabbing){
   // which way he is moved (along his own left, the body's +x), unless the scene says (s.crab)
   const holder=avatar.root.parent;
   if(holder){avatar.root.updateWorldMatrix(true,false);const at=new THREE.Vector3().setFromMatrixPosition(holder.matrixWorld);
    if(holderSeen){const left=new THREE.Vector3(1,0,0).transformDirection(avatar.root.matrixWorld),side=at.clone().sub(lastHolder).dot(left);if(Math.abs(side)>1e-5)crabSide=Math.sign(side);}
    lastHolder.copy(at);holderSeen=true;}
   if(s.crab===1||s.crab===-1)crabSide=s.crab;
   if(moving)crabPhase+=speed/(CRAB.step*m.k)*dt;
  }
  // A move may change the arms and head while sitting; its standing legs and bounce must not pull the sitter through or off
  // the furniture (unless it says the legs are its own: a knee hiked up on the seat).
  const legs=onChair?['hips','thighL','kneeL','footL','thighR','kneeR','footR'].map(j=>[j,target[j].clone()]):null;let ownLegs=false;
  if(gesture){gesture.t+=dt;if(gesture.t>=gesture.d)gesture=null;else{
   const r=applyGesture(gesture,s,onChair);
   if(!legs&&r?.root!==undefined)targetRoot+=r.root;
   // Some moves say where the eyes are (down on the book while calling out): unless the scene says otherwise.
   gestureEyes=r?.eyes||null;ownLegs||=!!r?.legs;
  }}
  // the named pose after the move, so a pose that binds the body (a cord round it) keeps it through a laugh
  if(posed&&posed.ramp>0){const r=applyGesture(posed,s,onChair);if(r?.eyes)gestureEyes=r.eyes;ownLegs||=!!r?.legs;if(!legs&&r?.root!==undefined)targetRoot+=r.root;}
  if(legs&&!ownLegs)for(const [j,pose] of legs)target[j].copy(pose);
  torchArm(dt,s);
  // Kneeling down and getting up take their time (0.8 s each way), however the kneel ends; seated, nobody kneels.
  const kneeling=gesture?.name==='KneelHug'&&!onChair&&(gesture.d===Infinity||gesture.t<gesture.d-.8);
  if(kneeling&&kneelRamp===0)kneelT=0;
  kneelRamp=THREE.MathUtils.clamp(kneelRamp+(kneeling?dt:-dt)/.8,0,1);kneelT+=dt;kneel=smooth(kneelRamp);
  if(kneel>0)kneelPose(kneel,kneelT);
  // Looking at someone: the head turns, the chest helps with a big turn, and the eyes
  // carry whatever is left over. `gaze` is a point in the world.
  let eyes=null;
  // The point looked at glides to a new person rather than jumping, and the look fades
  // in and out (and fades as they would have to turn right round), so a head never pops.
  const wantGaze=!!(s.gaze&&!s.sleeping);
  if(wantGaze){
   const g=s.gaze.isVector3?s.gaze:gazeLocal.set(...s.gaze);
   if(!hadGaze)gazeWorld.copy(g);else gazeWorld.lerp(g,1-Math.exp(-dt*8));
   hadGaze=true;
  }else if(gazeWeight<.01)hadGaze=false;
  if(hadGaze){
   gazeLocal.copy(gazeWorld);avatar.root.worldToLocal(gazeLocal);
   const yaw=Math.atan2(gazeLocal.x,gazeLocal.z),pitch=-Math.atan2(gazeLocal.y-m.headCentre,Math.hypot(gazeLocal.x,gazeLocal.z));
   const reach=1-THREE.MathUtils.smoothstep(Math.abs(yaw),2.0,2.6);
   gazeWeight+=((wantGaze?reach:0)-gazeWeight)*(1-Math.exp(-dt*6));
   const w=gazeWeight,turn=THREE.MathUtils.clamp(yaw,-1.35,1.35),tilt=THREE.MathUtils.clamp(pitch,-.45,.4);
   add('head',tilt*.8*w,turn*.62*w,0);add('chest',tilt*.15*w,turn*.3*w,0);
   if(w>.5)eyes=[THREE.MathUtils.clamp((yaw-turn*.62)*1.6,-1,1),THREE.MathUtils.clamp(tilt*.5,-.6,.6)];
   // Holding someone's eye, a quiet listener now and then looks off for a moment.
   if(eyes&&conversing){awayIn-=dt;if(awayIn<=0&&awayT<=0){if(random()<listen.glanceAway){awayT=.5+random()*.5;awaySide=random()<.5?-1:1;}awayIn=1.5+random()*2.5;}
    if(awayT>0){awayT-=dt;eyes=[awaySide*.75,.35];}}
  }
  // Knocked out flat on the back: arms and legs flung out, a knee up, the head lolling.
  // Or face down ('prone'): which way they went down holds until they are up again.
  const lying=s.lying===true||s.lying==='prone'?1:Math.max(0,Math.min(1,+s.lying||0));
  if(lie===0&&lying>0)prone=s.lying==='prone';
  lie+=(lying-lie)*(1-Math.exp(-dt*10));if(lie<.001)lie=0;
  const kneading=!prone&&gesture?.name==='LieKnead';let kneadWeight=0;
  if(lie>0){
   const l=lie,roll=Math.sin(time*1.7);
   for(const j of ['hips','spine','chest','neck','head','shoulderL','elbowL','handL','shoulderR','elbowR','handR','thighL','kneeL','footL','thighR','kneeR','footR'])target[j].multiplyScalar(1-l);
   if(prone){
    // Splat: the arms out flat on the ground either side (out to the side only, so they stay on it: a
    // reach forward would go into the pavement), the head turned onto its cheek, the knees bent so the
    // feet stand up in the air, swaying together slowly from side to side, the toes pointed.
    const sway=Math.sin(time*1.8),pump=Math.sin(time*1.8+1.3);
    add('shoulderL',.06*l,0,1.3*l);add('shoulderR',.06*l,0,-1.4*l);add('elbowL',-.12*l);add('elbowR',-.18*l);
    add('thighL',.08*l,.3*sway*l,.06*l);add('thighR',.08*l,.3*sway*l,-.06*l);
    add('kneeL',(1.5+.1*pump)*l);add('kneeR',(1.75-.1*pump)*l);add('footL',.5*l);add('footR',.45*l);
    const lift=PRONE_LIFT(m);add('neck',-lift*.45*l);add('head',-lift*.55*l,1.25*l,0);targetRoot*=1-l;
   }else{
    // "I'll BE the chair" (LieKnead), blended in from the knocked-out sprawl over half a second: on the back, the knees up
    // and the feet flat, the head resting on the floor with the back, both arms up kneading the air in slow rolls like the
    // chair's rollers, one arm half a turn after the other.
    kneadWeight=kneading?inOut(gesture.t,gesture.d,.5):0;const kw=kneadWeight*l,ko=l-kw;
    add('shoulderL',-.2*ko,0,1.35*ko);add('shoulderR',-.35*ko,0,-1.15*ko);add('elbowL',-.35*ko);add('elbowR',-.6*ko);
    add('thighL',-.12*ko,0,.2*ko);add('thighR',-.65*ko,0,-.14*ko);add('kneeR',1.05*ko);add('footL',.45*ko);add('footR',.25*ko);
    add('head',0,(.35+.12*roll)*ko,.08*roll*ko);
    if(kw>0){
     const r=gesture.t*Math.PI*1.1;
     for(const [side,k,o] of [['R',1,0],['L',-1,Math.PI]]){
      add('shoulder'+side,(-1.45+Math.sin(r+o)*.2)*kw,0,-.16*k*kw);add('elbow'+side,(-.9+Math.cos(r+o)*.4)*kw);add('hand'+side,Math.sin(r+o+.6)*.35*kw);
      add('thigh'+side,KNEAD.thigh*kw,0,-.06*k*kw);add('knee'+side,KNEAD.knee*kw);add('foot'+side,KNEAD.foot*kw);
     }
     const lift=SUPINE_LIFT(m);add('neck',lift*.5*kw);add('head',lift*.5*kw);
    }
    targetRoot*=1-l;
   }
  }
  // Ease every joint toward where it is going.
  if(onChair&&chairBlend<1){
   for(const j of ['thighL','kneeL','footL','thighR','kneeR','footR'])target[j].multiplyScalar(chairBlend);
   targetRoot*=chairBlend;
  }
  const k=1-Math.exp(-dt*14);
  for(const j of JOINTS){current[j].lerp(target[j],k);bones[j].rotation.set(current[j].x,current[j].y,current[j].z);}
  rootY+=(targetRoot-rootY)*(s.seated||s.riding?1-Math.exp(-dt*9):k);hipsY+=(targetHips-hipsY)*k;lean+=(targetLean-lean)*k;
  if(s.riding)rootY=targetRoot;
  avatar.root.position.x=s.riding?0:driftX;
  avatar.root.position.z=s.riding?.21*(s.bicycleFit||bicycleRiderFit(m)).scale:0;
  avatar.root.position.y=rootY+(s.seated||s.riding?0:(s.floorHeight||0));
  bones.hips.position.y=m.hipY+(s.riding?0:hipsY);
  bones.head.position.copy(headRestPosition);
  if(s.riding)poseAvatarOnBicycle(avatar,s.ridePhase||0,s.bicycleFit||bicycleRiderFit(m));
  else if(consumption){
   bones.head.rotation.x+=drinkHeadTilt(s.heldProp,consumption.lift,consumption.food);
   poseAvatarConsumption(avatar,consumption.lift,consumption.food,s.heldProp);
  }
  if(onChair&&!s.riding){
   // Keep sit/stand transitions continuous and use the actual clothing surface
   // as the contact point. Camera eye height never determines this support.
   if(chairBlend<1){
    groundFeet(s.floorHeight||0);const standingY=avatar.root.position.y;
    supportSeat(Number.isFinite(s.seatHeight)?s.seatHeight:.45);
    avatar.root.position.y=THREE.MathUtils.lerp(standingY,avatar.root.position.y,chairBlend);
   }else supportSeat(Number.isFinite(s.seatHeight)?s.seatHeight:.45);
  }else if(!s.riding&&!s.sleeping&&!lie){
   groundFeet(s.floorHeight||0,{airborne:!!s.airborne||['Jump','Tackle','Cheer','Hop','Gasp'].includes(gesture?.name)});
   // Kneeling rests on the knees as well as the toes: nothing on the body (a boot's leg, a knee in thick cloth) goes
   // below the floor; whichever is lowest touches it.
   if(kneel>0){const up=groundLying(s.floorHeight||0);if(up>0)avatar.root.position.y+=up;}
  }
  if(lie>0||lyingTilt){
   // On the back: tipped over about the hips so they lie where they stood, raised by the back of the head
   // (the biggest thing on them) so nothing goes through the floor.
   const l=THREE.MathUtils.smoothstep(lie,0,1),rest=Math.max(m.Rh*Math.max(m.headSX,m.headSY),m.depth/2);
   // A body faces -z: a quarter turn about x the positive way lays its back on the floor, face up, the head
   // behind where they stood; the hips stay on their mark. Face down is the quarter turn the other way, the
   // head in front of where they stood, resting on whatever on them is lowest (the cheek, the chest).
   avatar.root.rotation.x=(prone?-1:1)*Math.PI/2*l;
   avatar.root.position.z+=(prone?1:-1)*m.hipY*l;
   if(prone){const y=avatar.root.position.y;avatar.root.position.y=0;avatar.root.position.y=y*(1-l)+(groundLying(s.floorHeight||0))*l;}
   else{
    // Kneading, the body rests on whatever on it is lowest (the head, the back and the feet together); knocked out, on the
    // back of the head; between them, between the two.
    const standY=avatar.root.position.y,knockedOut=standY*(1-l)+rest*l;
    if(kneadWeight>0){avatar.root.position.y=0;const ground=groundLying(s.floorHeight||0);avatar.root.position.y=THREE.MathUtils.lerp(knockedOut,standY*(1-l)+ground*l,kneadWeight);}
    else avatar.root.position.y=knockedOut;
   }
   lyingTilt=l>0;
  }
  storyAfter(dt,s);
  // The face: blinks, words, glances, and whatever it is feeling.
  blinkIn-=dt;if(blinkIn<=0&&blinkT<0){blinkT=0;blinkIn=1.8+Math.random()*3.8;}
  let blink=0;if(blinkT>=0){blinkT+=dt;blink=blinkT<.13?1:0;if(blinkT>=.13)blinkT=-1;}
  if(s.talking){talkT-=dt;if(talkT<=0){talkT=.09+Math.random()*.12;talkOpen=talkOpen?0:(Math.random()<.8?1:0);}}else talkOpen=0;
  glanceIn-=dt;if(glanceIn<=0){glanceIn=1.2+Math.random()*3;glance=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8];}
  const face=s.sleeping?'sleep':expression;
  avatar.paintFace({expression:face,blink,talk:talkOpen,look:s.look||(headToW>.5?[0,0]:null)||eyes||gestureEyes||(face==='thinking'?[1,-1]:glance)});
 }

 /**
  * Heartbreak at the dead chair (KneelHug, 3a): down on the knees (and the tucked toes) in front of the seat, leaning over
  * it from the hips, the head laid on its right cheek with the face turned to his left, the right forearm along the seat
  * and the left arm round its front; once, after a moment, he nuzzles his face into it. k: how far down (0..1); t: how
  * long since it began. All of it held still: a head resting on a seat does not sway on it.
  */
 function kneelPose(k,t){
  const K=KNEEL,press=Math.sin(Math.PI*smooth((t-1.4)/1))*.12*k;
  toward('hips',K.hips,0,0,k);toward('spine',K.spine,0,0,k);toward('chest',K.chest,0,0,k);toward('neck',K.neck,0,0,k);toward('head',K.head[0],K.head[1]-press,K.head[2],k);
  for(const side of ['L','R']){toward('thigh'+side,K.thigh-K.hips,0,0,k);toward('knee'+side,K.knee,0,0,k);toward('foot'+side,K.foot,0,0,k);}
  armTo('R',K.armR,k,K.handR);armTo('L',K.armL,k,K.handL);
 }
 /** Toward a joint's pose by w (0..1) from wherever the body has it this frame (walking, sitting): no jump at the start. */
 const toward=(j,x,y,z,w)=>target[j].lerp(_pose.set(x,y,z),w);
 /** An arm toward [shoulder x, y, z, elbow x, elbow y] (and the wrist), written for the right arm: the left is its mirror. The
  *  arm swings forward or back first and turns in or out after (and the other way round going back), so an arm that ends
  *  across the chest goes round the front of it, never through its side. */
 const armTo=(side,a,w,hand)=>{const k=side==='R'?1:-1,later=smooth((w-.3)/.7),sh=target['shoulder'+side];
  sh.x+=(a[0]-sh.x)*w;sh.y+=(a[1]*k-sh.y)*later;sh.z+=(a[2]*k-sh.z)*later;
  toward('elbow'+side,a[3],(a[4]||0)*k,0,w);if(hand)toward('hand'+side,hand[0],hand[1]*k,hand[2]*k,w);};
 const mix=(a,b,u)=>a.map((v,i)=>v+((b[i]??0)-v)*u);
 /**
  * The torch in Tetsuo's right hand (TorchUp, TorchOff): the hand goes to his pocket and takes it (0.5 s), brings it up before
  * the chest, the beam forward and up, and clicks it on once it is there (TorchUp); clicks it off and lowers it to the waist,
  * pointing down (TorchOff); when neither is played any more, puts it back on the pocket and the hand down again. The arm
  * goes from wherever it is to the next place, eased; the torch is placed in the hand after the bones (storyAfter).
  */
 function torchArm(dt,s){
  const names=[gesture?.name,s.pose];
  const want=names.includes('TorchUp')?'up':names.includes('TorchOff')?'low':null;
  if(!want&&!avatar.storyProps?.has('torch'))return;
  const props=storyProps(avatar),T=torch,tor=props.give('torch');
  const ang=k=>reachFor(k==='up'?'TorchHigh':k==='low'?'TorchLow':'TorchPocket').R;
  const go=(goal,to,toW,d)=>{T.goal=goal;T.from=T.cur.slice();T.fromW=T.w;T.to=to;T.toW=toW;T.t=0;T.d=d;T.p0.copy(tor.position);T.q0.copy(tor.quaternion);};
  T.t+=dt;const done=()=>T.t>=T.d;
  if(want){
   if(T.at==='pocket'){if(T.goal!=='fetch')go('fetch',ang('pocket'),1,.65);else if(done()){avatar.root.updateMatrixWorld(true);props.torchTo('R');T.at='hand';}}
   if(T.at==='hand'&&T.goal!==want)go(want,ang(want),1,want==='up'?.75:.8);
  }else if(T.at==='hand'){if(T.goal!=='stow')go('stow',ang('pocket'),1,.7);else if(done()){props.torchTo('pocket');T.at='pocket';go('down',T.cur,0,.6);}}
  else if(T.w>0&&T.goal!=='down')go('down',T.cur,0,.6);
  if(T.from){const u=T.d>0?smooth(T.t/T.d):1;T.cur=T.from.map((v,i)=>v+(T.to[i]-v)*u);T.w=T.fromW+(T.toW-T.fromW)*u;}
  if(T.w>0)armTo('R',T.cur,T.w);
  // the click: on once it is up and held there; off the moment TorchOff begins, or it goes back
  tor.userData.torch.setOn(want==='up'&&T.at==='hand'&&T.goal==='up'&&done());
 }
 /** After the bones: the things the story's moves hold put where the hands are, and the head turned to `headTo`. */
 const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_qa=new THREE.Quaternion(),_qb=new THREE.Quaternion(),_eA=new THREE.Euler();
 function storyAfter(dt,s){
  const props=avatar.storyProps;
  if(!props&&!wrap&&!reading&&!basketWanted&&!s.headTo&&headToW<.001)return;
  avatar.root.updateMatrixWorld(true);const root=avatar.root;
  const P=props||storyProps(avatar);
  // the torch in the hand: from where it was taken, to the grip, turned to the beam's way (forward and up, or down when
  // lowered); going back, to its place on the pocket
  const tor=P.get('torch');
  if(tor&&torch.at==='hand'&&tor.parent===bones.handR){
   const T=torch,u=T.d>0?smooth(T.t/T.d):1,hq=bones.handR.getWorldQuaternion(_qa).invert();
   if(T.goal==='stow'){const spot=pocketSpot(avatar);
    _a.copy(spot.position);bones.chest.localToWorld(_a);bones.handR.worldToLocal(_a);
    _qb.copy(hq).multiply(bones.chest.getWorldQuaternion(new THREE.Quaternion())).multiply(spot.quaternion);
    tor.position.lerpVectors(T.p0,_a,u);tor.quaternion.slerpQuaternions(T.q0,_qb,u);}
   else if(T.goal==='low'){
    // held low, it lies across the fist (along the hand's breadth), pointing the way that is more ahead of him
    const fwd=_b.set(0,0,1).transformDirection(root.matrixWorld),across=new THREE.Vector3(1,0,0).transformDirection(bones.handR.matrixWorld);
    if(across.dot(fwd)<0)across.negate();const up=new THREE.Vector3(0,1,0).transformDirection(bones.handR.matrixWorld),side=new THREE.Vector3().crossVectors(up,across).normalize();up.crossVectors(across,side);
    _qb.copy(hq).multiply(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side,up,across)));
    tor.position.lerpVectors(T.p0,_a.set(0,-m.hand*.55,0),u);tor.quaternion.slerpQuaternions(T.q0,_qb,u);}
   else{const pitch=-.42;
    _qb.copy(hq).multiply(root.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(_eA.set(pitch,0,0)));
    tor.position.lerpVectors(T.p0,_a.set(0,-m.hand*.55,0),u);tor.quaternion.slerpQuaternions(T.q0,_qb,u);}
   // lit, its light on his face: the middle of the face, a little below the eyes
   if(tor.userData.torch.on){tor.updateMatrixWorld(true);tor.userData.torch.aimAt(bones.head.localToWorld(_a.set(0,m.headCentre-m.headY-m.Rh*.25,m.Rh*.8)));}
  }
  // the paper: its two outer edges in the mittens (the right one always; the left as far as the paper reaches), the fold
  // away from the reader, opened as far as the hands are apart
  if(reading>0){
   const paper=P.give('newspaper');paper.visible=true;
   const mR=bones.handR.localToWorld(_a.set(0,-m.hand*.55,0)),mL=bones.handL.localToWorld(_b.set(0,-m.hand*.55,0));root.worldToLocal(mR);root.worldToLocal(mL);
   const across=_c.subVectors(mL,mR),dist=across.length();across.normalize();
   const a=paper.userData.paper.setSpread(Math.min(dist/2,PAPER.leaf)),away=new THREE.Vector3(0,0,1).addScaledVector(across,-across.z).normalize();
   const up=new THREE.Vector3().crossVectors(away,across);
   paper.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(across,up,away));
   const edge=new THREE.Vector3(-PAPER.leaf*Math.cos(a),-.07*m.k,-PAPER.leaf*Math.sin(a)).applyQuaternion(paper.quaternion);
   paper.position.copy(mR).sub(edge);
  }else{const paper=P.get('newspaper');if(paper)paper.visible=false;}
  // the basket on the head, once a move puts it there (it stays until it is taken)
  if(basketWanted)P.give('basketOnHead');
  // the cord: wound round her once her arms are pinned, from the hand up (built from her body as it stands then)
  const cord=P.get('dryerCord');
  if(wrap>=.8){const c=cord&&cord.userData.outfit===avatar.outfit?cord:(P.take('dryerCord'),P.give('dryerCord'));c.userData.outfit=avatar.outfit;
   c.visible=true;const n=c.userData.indexCount;c.geometry.setDrawRange(0,Math.max(3,Math.round(n*smooth((wrap-.8)/.2)/3)*3));}
  else if(cord)cord.visible=false;
  // the head turned to a point (headTo: in the world, [x, y, z], or [x, z] at the head's own height), the body as it is
  // (turned, not lifted, over a tenugui)
  headToW+=((s.headTo?1:0)-headToW)*(1-Math.exp(-dt*5));
  if(s.headTo){const h=s.headTo;if(h.isVector3)lastHeadTo.copy(h);else if(h.length===2)lastHeadTo.set(h[0],NaN,h[1]);else lastHeadTo.set(h[0],h[1],h[2]);}
  if(headToW>.001){
   const head=bones.head,centre=head.localToWorld(_a.set(0,m.headCentre-m.headY,0));
   const at=_b.copy(lastHeadTo);if(Number.isNaN(at.y))at.y=centre.y;
   const dir=at.sub(centre).normalize().applyQuaternion(bones.neck.getWorldQuaternion(_qa).invert());
   const face=_c.set(0,0,1).applyQuaternion(head.quaternion);
   // with a tenugui round the neck the head turns but does not go back further (the back of the head would come down on it)
   if(TENUGUI_OUTFITS.has(avatar.outfit)){const up=new THREE.Vector3(0,1,0).applyQuaternion(head.quaternion),over=dir.dot(up)-face.dot(up);if(over>0)dir.addScaledVector(up,-over).normalize();}
   const turn=new THREE.Quaternion().setFromUnitVectors(face,dir);
   const angle=2*Math.acos(Math.min(1,Math.abs(turn.w)));if(angle>1.3)turn.slerp(_qb.identity(),1-1.3/angle);
   head.quaternion.slerp(turn.multiply(head.quaternion),headToW);head.updateMatrixWorld(true);
  }
 }
 /** CrabWalk's legs while he is moved sideways: the leading foot steps out, the other closes in half a cycle later; each foot
  *  planted while it carries him (its stance moves back exactly as far as he goes), lifted by the knee while it swings. */
 function crabLegs(w){
  const C=CRAB,D=C.step*m.k,S=D*(1-C.swing),L=m.thigh+m.shin+m.foot*.5,lead=crabSide>0?'L':'R';
  for(const side of ['L','R']){
   const sg=side==='L'?1:-1,p=(((crabPhase+(side===lead?0:.5))%1)+1)%1,swinging=p<C.swing;
   const u=swinging?-S/2+S*smooth(p/C.swing):S/2-S*(p-C.swing)/(1-C.swing),lift=swinging?Math.sin(Math.PI*p/C.swing):0;
   const z=sg*BENT.spread+Math.asin(THREE.MathUtils.clamp((crabSide*u+sg*C.wide*m.k)/L,-.6,.6));
   const tx=BENT.thigh-lift*C.lift,kn=BENT.knee+lift*C.lift*1.7;
   toward('thigh'+side,tx-BENT.hips,0,z,w);toward('knee'+side,kn,0,0,w);toward('foot'+side,-(tx+kn),0,-z,w);
  }
 }
 function applyGesture(g,s,seated=false){
  const t=g.t,d=g.d,e=d===Infinity?1:env(t,d),q=d===Infinity?Math.min(1,t/.3):ease(t,d);
  // the moves for Fujita's Ten Minutes of Heaven come in smoothly over half a second (big ones slower); a pose the scene
  // names comes in and goes out on its own ramp
  const raw=g.ramp!==undefined?g.ramp:THREE.MathUtils.clamp(Math.min(t/.5,d===Infinity?1:(d-t)/.5),0,1);
  const w=g.ramp!==undefined?smooth(g.ramp):inOut(t,d,.5),soak=s.seat==='Soak'||s.pose==='Soak';
  switch(g.name){
   case 'Wave':set('shoulderR',-.2,0,-2.55*q);set('elbowR',0,0,-.45+Math.sin(t*10)*.45*q);add('head',0,0,.08*q);break;
   case 'Bow':add('chest',.95*e*bowDepth);add('spine',.25*e*bowDepth);add('head',.2*e*bowDepth);set('shoulderL',.1,0,.05);set('shoulderR',.1,0,-.05);break;
   case 'Nod':add('head',Math.sin(t*9)*.28*e);break;
   case 'ScratchHead':set('shoulderR',-1.55*q,0,-1.15*q);set('elbowR',-2.2*q+Math.sin(t*16)*.12*q);add('head',.06*q,0,-.14*q);break;
   case 'HairTuck':set('shoulderL',-1.3*q,0,.95*q);set('elbowL',-2.25*q);add('head',0,0,.12*q);break;
   case 'HeelRock':set('shoulderL',.45*q,0,.1);set('shoulderR',.45*q,0,-.1);set('elbowL',-.9*q);set('elbowR',-.9*q);add('footL',Math.sin(t*5)*.22*e);add('footR',Math.sin(t*5)*.22*e);add('chest',Math.sin(t*5)*.04*e);break;
   case 'ChinTap':set('shoulderR',-1.2*q,0,-.3);set('elbowR',-1.9*q+Math.sin(t*11)*.14*q);add('head',.1*q,0,.1*q);break;
   case 'CollarTug':set('shoulderR',-1*q,0,-.25*q);set('elbowR',-2.1*q);set('shoulderL',-1*q,0,.25*q);set('elbowL',-2.1*q);add('head',-.12*q);break;
   case 'HeadShake':add('head',0,Math.sin(t*11)*.45*e);break;
   case 'Point':set('shoulderR',-1.5*q,.2,-.1);set('elbowR',-.05);add('head',0,-.15*q);break;
   case 'Shrug':set('shoulderL',-.3*e,0,.55*e+.13);set('shoulderR',-.3*e,0,-.55*e-.13);set('elbowL',-1.3*e);set('elbowR',-1.3*e);add('head',0,0,.2*e);break;
   case 'Clap':{const c=Math.abs(Math.sin(t*9));set('shoulderL',-1.2*q,0,.1+c*.35);set('shoulderR',-1.2*q,0,-.1-c*.35);set('elbowL',-.9*q);set('elbowR',-.9*q);break;}
   case 'Laugh':add('chest',-.24*e+Math.sin(t*16)*.07*e);add('head',-.32*e);set('shoulderL',-.85*e,0,.4);set('shoulderR',-.85*e,0,-.4);set('elbowL',-1.65*e);set('elbowR',-1.65*e);break;
   case 'Gasp':add('chest',-.18*e);add('head',-.12*e);set('shoulderL',-.7*e,0,.28);set('shoulderR',-.7*e,0,-.28);set('elbowL',-1.9*e);set('elbowR',-1.9*e);return {root:Math.sin(Math.PI*t/d)*.045};
   case 'Think':set('shoulderR',-1.25*q,0,-.35);set('elbowR',-1.95*q);set('shoulderL',-.4*q,0,.3);set('elbowL',-1.4*q);add('head',.12*q,0,.18*q);break;
   case 'LookAround':add('head',0,Math.sin(t*2.4)*.75*e);add('chest',0,Math.sin(t*2.4)*.2*e);break;
   case 'Stretch':set('shoulderL',-.2,0,2.8*e);set('shoulderR',-.2,0,-2.8*e);add('chest',-.25*e);add('head',-.3*e);break;
   // The villain's laugh: hunched over, rubbing the hands together, the shoulders shaking.
   case 'EvilLaugh':{const rub=Math.sin(t*13)*.12*q;
    set('shoulderL',-.95*q,0,.42*q);set('shoulderR',-.95*q,0,-.42*q);set('elbowL',-1.75*q,rub,0);set('elbowR',-1.75*q,rub,0);
    add('chest',.18*q+Math.sin(t*15)*.05*e);add('head',-.28*q+Math.sin(t*15)*.04*e);return {root:-.02*q};}
   // The wind-up before a cartoon dash: leaning back, a knee up, the arms drawn back.
   case 'WindUp':set('thighR',-1.0*q);set('kneeR',1.4*q);add('chest',-.28*q);add('head',-.1*q);set('shoulderL',.7*q,0,.2);set('shoulderR',.7*q,0,-.2);set('elbowL',-.6*q);set('elbowR',-.6*q);return {root:.03*q};
   // Putting something on a shelf at chest height: the right arm out, a little lean, up on the toes.
   case 'Shelve':{const reach=Math.sin(Math.PI*Math.min(1,t/d));
    set('shoulderR',-1.55*reach,0,-.08);set('elbowR',-.35+.2*reach);add('chest',.12*reach);add('head',-.08*reach);
    set('shoulderL',-.35*q,0,.15);set('elbowL',-.9*q);return {root:.025*reach};}
   case 'PickUp':add('chest',1.1*e);add('spine',.3*e);set('shoulderR',-1.3*e);set('thighL',-.5*e);set('thighR',-.5*e);set('kneeL',.9*e);set('kneeR',.9*e);return {root:-.08*e};
   case 'Fist':set('shoulderR',-2.4*q+Math.sin(t*8)*.2*q,0,-.1);set('elbowR',-.5*q);add('chest',-.1*q);break;
   // Fighting with bare hands: a straight punch, the other fist kept up by the chin.
   case 'Jab':case 'JabL':{
    const R=g.name==='Jab',a=R?'R':'L',b=R?'L':'R',sgn=R?1:-1;
    // Pulled back for a beat, snapped out, and brought home again.
    const out=t<.1?-(t/.1)*.3:t<.2?(t-.1)/.1:Math.max(0,1-(t-.2)/.22);
    set('shoulder'+a,-.9-.75*out,0,-sgn*.05);set('elbow'+a,-1.9+1.85*out);
    set('shoulder'+b,-1.05,0,sgn*.18);set('elbow'+b,-2.1);
    add('chest',.06*out,-sgn*.4*out);add('head',0,sgn*.12*out);
    return {root:-.02*q};}
   // Somebody in a suit coming at you: both arms up over the head, then down on you.
   case 'Swipe':{
    const up=t<.32?t/.32:Math.max(0,1-(t-.32)/.14),down=t<.32?0:Math.min(1,(t-.32)/.14)*Math.max(0,1-(t-.5)/.2);
    set('shoulderL',-2.7*up-1.2*down,0,.25);set('shoulderR',-2.7*up-1.2*down,0,-.25);set('elbowL',-.4*up);set('elbowR',-.4*up);
    add('chest',-.2*up+.45*down);add('head',-.15*up+.2*down);
    return {root:.04*up};}
   // Hit: knocked back a step, arms flung out, head snapped back.
   case 'Hurt':set('shoulderL',-.5*e,0,.9*e+.13);set('shoulderR',-.5*e,0,-.9*e-.13);set('elbowL',-.5*e);set('elbowR',-.5*e);add('chest',-.4*e);add('head',-.35*e,Math.sin(t*20)*.1*e);return {root:-.03*e};
   // A flying tackle: both arms thrown forward and closing round the other's middle, legs swept out behind
   // (the body's dive itself, leaning flat and off the ground, comes from whoever moves them: the film's lean/lift).
   case 'Tackle':set('shoulderL',-1.55*q,0,-.22*q);set('shoulderR',-1.55*q,0,.22*q);set('elbowL',-.75*q);set('elbowR',-.75*q);set('thighL',.55*q);set('thighR',.35*q);set('kneeL',.7*q);set('kneeR',.45*q);add('head',-.25*q);return {root:0};
   case 'Jump':{const up=t<.2?-.08:Math.sin(Math.PI*Math.min(1,(t-.2)/.6))*.25;set('shoulderL',-.3,0,1.4*q);set('shoulderR',-.3,0,-1.4*q);set('kneeL',t<.2?.8:.3);set('kneeR',t<.2?.8:.3);set('thighL',t<.2?-.5:-.2);set('thighR',t<.2?-.5:-.2);return {root:up};}
   case 'Cheer':set('shoulderL',-.2,0,2.6*q);set('shoulderR',-.2,0,-2.6*q);set('elbowL',-.3);set('elbowR',-.3);return {root:Math.abs(Math.sin(t*7))*.1*e};
   case 'Hop':set('shoulderL',-.2,0,.9*e);set('shoulderR',-.2,0,-.9*e);add('head',-.15*e);return {root:Math.abs(Math.sin(t*8))*.12*e};
   case 'Stomp':set('shoulderL',-.2,0,.35);set('shoulderR',-.2,0,-.35);set('elbowL',-1.6*q);set('elbowR',-1.6*q);set('thighL',-.5*Math.max(0,Math.sin(t*9))*e);set('kneeL',.6*Math.max(0,Math.sin(t*9))*e);add('head',.18*e,Math.sin(t*14)*.1*e);add('chest',.12*e);break;
   case 'Slump':add('chest',.3*e);add('head',.4*e);set('shoulderL',.05,0,.03);set('shoulderR',.05,0,-.03);return {root:-.03*e};
   case 'Fidget':set('shoulderL',-.55*q,0,-.2*q);set('shoulderR',-.55*q,0,.2*q);set('elbowL',-.6*q);set('elbowR',-.6*q);add('head',.18*e,0,.25*e);add('hips',0,Math.sin(t*3)*.12*e);break;
   case 'SitEnjoyFood':{
    // Two open palms beside the dish, with a friendly lean and head tilt.
    set('shoulderL',-.70*q,.18*q,.62*q);set('shoulderR',-.70*q,-.18*q,-.62*q);
    set('elbowL',-1.35*q);set('elbowR',-1.35*q);
    set('handL',-1.25*q,.55*q,.25*q);set('handR',-1.25*q,-.55*q,-.25*q);
    add('chest',.05*e);add('head',-.06*e,0,.16*e);break;
   }
   case 'SitPresentFood':{
    // Support a plate with both hands, keeping the seated legs planted.
    set('shoulderL',-1.10*q,0,.22*q);set('shoulderR',-1.10*q,0,-.22*q);
    set('elbowL',-1.18*q);set('elbowR',-1.18*q);
    set('handL',-1.45*q,0,.18*q);set('handR',-1.45*q,0,-.18*q);
    add('head',-.08*e,0,-.10*e);break;
   }
   case 'SitPress':{
    // Seated, both hands reach across the table and press something flat (a strip of tape, a map, a poster):
    // lean in, arms forward and nearly straight, palms down, two firm presses.
    const press=Math.max(0,Math.sin(t*5.2))**2*.08*q;
    add('chest',.34*q);set('shoulderL',-1.48*q+press,0,.16*q);set('shoulderR',-1.48*q+press,0,-.16*q);
    set('elbowL',-.12*q);set('elbowR',-.12*q);set('handL',.6*q);set('handR',.6*q);add('head',.25*q);break;
   }
   case 'SitToast':set('shoulderR',-1.9*q,0,-.2);set('elbowR',-.6*q);add('head',-.15*q);break;
   case 'SitDrink':{const lift=Math.max(0,Math.sin(t*2.6))**2;set('shoulderR',-.6-lift*1,0,-.25);set('elbowR',-.9-lift*1.2);break;}
   // Playful poses for photos: struck, held while the move lasts, and kept alive with a
   // little bounce. The head is big and the arms short, so every hand stays at or
   // below the cheek.
   case 'Heart':{
    // Hands together in front of the chest, elbows out: a heart, the idol way.
    set('shoulderL',-.8*q,0,.5*q);set('elbowL',-.45*q,0,-1.7*q);set('shoulderR',-.8*q,0,-.5*q);set('elbowR',-.45*q,0,1.7*q);
    add('head',.06*q,0,.22*q+Math.sin(t*3.2)*.04*q);set('hips',0,0,-.05*q);set('thighR',-.12*q);set('kneeR',.3*q);
    return {root:Math.abs(Math.sin(t*3.2))*.012*q};}
   case 'Peace':{
    // A hand up by the cheek, the other on the hip, and the hip out.
    set('shoulderR',-.55*q,0,-1.25*q);set('elbowR',-1.9*q,0,-.2*q);
    set('shoulderL',.15*q,0,.75*q);set('elbowL',-.3*q,0,-1.5*q);
    add('head',.06*q,-.1*q,-.24*q);set('hips',0,.15*q,-.07*q);set('thighL',-.15*q);set('kneeL',.4*q);break;}
   case 'Coy':{
    // A fingertip at the chin, a hand on the hip, a sideways look.
    set('shoulderR',-1.15*q,0,-.12*q);set('elbowR',-2.1*q);
    set('shoulderL',.15*q,0,.75*q);set('elbowL',-.3*q,0,-1.5*q);
    add('head',.12*q,.2*q,.2*q);add('chest',0,.12*q,-.05*q);set('hips',0,-.2*q,.08*q);set('thighR',-.1*q,0,-.06*q);set('kneeR',.3*q);break;}
   case 'CheekRest':{
    // The photo-booth pose: a palm cupping the cheek, the head tipped into it, shoulders up a
    // little, the other arm loose, one knee soft.
    set('shoulderR',-.55*q,.6*q,-1.58*q);set('elbowR',-1.92*q,.6*q,0);
    set('shoulderL',-.12*q,0,.16*q);set('elbowL',-.35*q);
    add('head',.1*q,-.08*q,.29*q+Math.sin(t*2)*.02*q);add('chest',.04*q,-.06*q,.04*q);set('hips',0,.06*q,.04*q);set('thighL',-.08*q);set('kneeL',.25*q);
    return {root:Math.abs(Math.sin(t*2))*.006*q};}
   case 'DoubleCheek':{
    // Both palms to the cheeks, elbows tucked, a little sway from side to side.
    set('shoulderR',-.55*q,.6*q,-1.58*q);set('elbowR',-1.92*q,.6*q,0);set('shoulderL',-.55*q,-.6*q,1.58*q);set('elbowL',-1.92*q,-.6*q,0);
    add('head',.1*q,0,Math.sin(t*2.6)*.12*q);add('chest',.05*q,0,-Math.sin(t*2.6)*.04*q);set('kneeL',.18*q);set('kneeR',.18*q);
    return {root:Math.abs(Math.sin(t*2.6))*.008*q};}
   case 'Tada':{
    // Arms flung wide and a heel kicked up behind.
    const pop=Math.min(1,t/.3);
    set('shoulderL',-.15*q,0,1.9*q);set('shoulderR',-.15*q,0,-1.9*q);set('elbowL',0,0,.2*q);set('elbowR',0,0,-.2*q);
    set('thighL',.35*q*pop);set('kneeL',1.3*q*pop);add('chest',-.12*q);add('head',-.15*q,0,.12*q);return {root:.03*q*pop};}
   case 'HandsOnHips':
    set('shoulderL',.15*q,0,.75*q);set('elbowL',-.3*q,0,-1.5*q);set('shoulderR',.15*q,0,-.75*q);set('elbowR',-.3*q,0,1.5*q);
    add('chest',-.12*q);add('head',-.12*q,0,Math.sin(t*2.2)*.08*q);set('thighL',0,0,.12*q);set('thighR',0,0,-.12*q);break;
   case 'HeelKick':
    // Fists under the chin and one foot kicked up behind.
    set('thighR',.45*q);set('kneeR',1.7*q+Math.sin(t*3)*.08*q);
    set('shoulderL',-1.2*q,0,-.2*q);set('shoulderR',-1.2*q,0,.2*q);set('elbowL',-1.6*q);set('elbowR',-1.6*q);
    add('head',.08*q,0,-.25*q);add('chest',.1*q,0,-.06*q);break;
   case 'Talk':set('shoulderR',-.55+Math.sin(t*3.1)*.25,0,-.2);set('elbowR',-1.1+Math.sin(t*4.3)*.3);set('shoulderL',-.35+Math.sin(t*2.3+1)*.2,0,.2);set('elbowL',-1+Math.sin(t*3.7)*.3);add('head',Math.sin(t*2.6)*.06);break;
   case 'Kachashi':{
    // The kachāshī: hands up at head height, wrists turning, stepping from foot to foot.
    const w=Math.sin(t*5.5),step=Math.sin(t*2.75);
    set('shoulderL',-.4,0,1.9+w*.25);set('shoulderR',-.4,0,-1.9+w*.25);set('elbowL',0,0,1.1+w*.5);set('elbowR',0,0,-1.1+w*.5);
    set('hips',0,step*.2,step*.08);add('chest',0,-step*.2);add('head',0,step*.15,-step*.1);
    set('thighL',-Math.max(0,step)*.5);set('kneeL',Math.max(0,step)*.8);set('thighR',-Math.max(0,-step)*.5);set('kneeR',Math.max(0,-step)*.8);
    return {root:Math.abs(step)*.03};
   }
   case 'Crouch':set('thighL',-1.7,0,.25);set('thighR',-1.7,0,-.25);set('kneeL',2.3);set('kneeR',2.3);set('footL',-.6);set('footR',-.6);add('chest',.5);set('shoulderL',-.9,0,.1);set('shoulderR',-.9,0,-.1);set('elbowL',-.4);set('elbowR',-.4);return {root:-(m.thigh+m.shin)*.72};
   // Drying the hair: the forearm up, the elbow out, the mitten (and the dryer in it) well out from the side of
   // the head (the dryer's length between), waved in small, even strokes over it; the head tips a little into the warm air.
   case 'HairDry':{const w=Math.sin(t*5.5)*q;
    set('shoulderR',-1.3*q+w*.08,0,-1.6*q+w*.05);set('elbowR',-1.4*q+w*.1);add('head',0,0,-.08*q+Math.sin(t*2.75)*.03*q);break;}
   // A hand on a breaker's lever: the arm up and forward, nearly straight, and held there (a little lean in to it).
   case 'Switch':case 'SwitchHigh':{const high=g.name==='SwitchHigh';
    set('shoulderR',(high?-2.4:-1.98)*q,0,-.12*q);set('elbowR',-.12*q);add('chest',.06*q);add('head',(high?-.1:0)*q,0,0);
    if(high){set('shoulderL',-1.2*q,0,.1*q);set('elbowL',-.35*q);}break;}
   // Singing: Laugh's body held (the chest up, the head back, the free hand up), the microphone (a hair dryer will
   // do) held out before the chin in the right mitten, swaying with the tune.
   case 'Sing':{const sway=Math.sin(t*2.6)*q;
    add('chest',-.2*q);add('head',-.3*q,0,sway*.1);set('shoulderL',-.85*q,0,.4);set('elbowL',-1.65*q);
    set('shoulderR',-1.1*q,.5*q,-.2*q);set('elbowR',-1.35*q);add('hips',0,0,sway*.04);break;}
   case 'Phone':set('shoulderR',-.4,0,-.5);set('elbowR',-2.2);add('head',0,0,-.15);break;
   case 'FishIdle':set('shoulderL',-1,0,.1);set('shoulderR',-1,0,-.1);set('elbowL',-.6);set('elbowR',-.6);break;
   case 'Reel':set('shoulderL',-1,0,.1);set('elbowL',-.6);set('shoulderR',-1+Math.sin(t*9)*.25,0,-.2);set('elbowR',-.8+Math.cos(t*9)*.3);break;
   // ---- Fujita's Ten Minutes of Heaven (shot plan C2). Every hand is a closed mitten; where a prop is named, the mitten is
   // where the film's prop is gripped (it hangs from the hand bone, 6 cm into the mitten).
   // Carrying something small and precious (the coin, 1a): both mittens cupped together at the chest, the elbows in, the
   // head bent over them. It walks: the legs keep their step, the hands stay still.
   case 'CupHands':{const A=reachFor('CupHands');armTo('R',A.R,w,A.handR);armTo('L',A.L,w,A.handL);add('head',.2*w);add('chest',.04*w);break;}
   // Warming the coin against his cheek (1b): the right mitten holds it on the right cheek, the left mitten cupped over it,
   // the head tipped into them, the eyes shut (the face's 'content'), a whisper.
   case 'CoinToCheek':{const A=reachFor('CoinToCheek');add('chest',.05*w);add('head',.06*w,0,-.24*w+Math.sin(t*1.3)*.015*w);
    armTo('R',A.R,w);armTo('L',A.L,w);break;}
   // The deep bow (最敬礼, 1c): 45° from the hips with a straight back, the legs straight, the arms hanging along the
   // thighs; down in 0.6 s, held, up in 0.6 s (held longer with `hold`).
   case 'BowDeep':{const b=inOut(t,d,.6),a=Math.PI/4*b;
    add('hips',a);add('thighL',-a);add('thighR',-a);add('head',.08*b);
    armTo('R',[-a*.85,0,-.06,-.12],b);armTo('L',[-a*.85,0,-.06,-.12],b);break;}
   // Bowing while backing out of a room (8c): little bows, one after another, the hands together in front of the body
   // (or round whatever they carry), small steps backwards (the walk itself, above).
   case 'BowWalk':{const bob=.5-.5*Math.cos(t*Math.PI*2*.8);
    add('chest',(.36+.18*bob)*w);add('spine',.08*w);add('head',(.1+.08*bob)*w);
    armTo('R',[-.23,.73,-.11,-1.41],w);armTo('L',[-.23,.73,-.11,-1.41],w);break;}
   // Heartbreak at the dead chair (3a): see kneelPose.
   case 'KneelHug':break;   // posed in update(), from the kneel's own ease (kneelPose)
   // The noren pole flicks the breaker up behind her (3b), seated, reading: the right arm goes up and back over the
   // shoulder with the pole, a little flick at the top, and stays; the chest turns into it, the head stays down on the
   // book, the left hand keeps the place.
   case 'PoleFlick':{const r=inOut(t,d,.55,.5),f=smooth((t-.55)/.2);
    add('chest',.06*r,-.4*r,0);add('head',.5*r,.35*r,0);
    armTo('R',mix([-2.55,-.1,-.92,-1.46],[-2.83,.1,-.77,-.88],f),r);armTo('L',[.28,.15,-.3,-1.95],r);return {eyes:[0,.85]};}
   // Peeking through the slit of a noren (3e, 6c–e): close to the cloth, both mittens holding the slit open at eye height,
   // one each side of the face, and the head pushed forward into the gap.
   case 'Peek':{const A=reachFor('Peek');add('chest',.08*w);add('neck',.2*w);add('head',-.14*w);
    armTo('R',A.R,w,[0,.4,0]);armTo('L',A.L,w,[0,.4,0]);break;}
   // Holding something up high like a war banner (4a, the giant uchiwa in the right mitten): both arms up beside the head,
   // the chin up; it marches.
   case 'BannerUp':{const A=reachFor('BannerUp');add('chest',-.05*w);add('head',-.08*w);armTo('R',A.R,w);armTo('L',A.L,w);break;}
   // Fanning wildly (4b, the giant uchiwa in the right mitten): fast strokes from high at the side to low in front, the
   // wrist flicking, the body leaning into it with one foot forward; the left fist at the belly.
   case 'FanWild':{const p=Math.sin(t*Math.PI*2*2.2),u=(p+1)/2;
    add('chest',.2*w,.12*p*w,0);add('head',-.05*w);
    armTo('R',mix([-.81,-.03,-.39,-1.56],[-1.21,.17,.35,0],u),w,[.45*p,0,0]);armTo('L',[.16,.49,-.65,-2.13],w);
    if(!seated){toward('thighL',-.3,0,.04,w);toward('kneeL',.3,0,0,w);toward('thighR',.22,0,-.04,w);toward('footR',-.22,0,0,w);}break;}
   // Holding on in a gale (4c): both mittens clutching the tenugui at the sides of the neck (the ends are streaming
   // behind), leaning into the wind, one foot braced back.
   case 'HoldOn':{const A=reachFor('HoldOn');add('chest',.12*w);add('head',.05*w);armTo('R',A.R,w);armTo('L',A.L,w);
    if(!seated){toward('thighL',-.3,0,.04,w);toward('kneeL',.3,0,0,w);toward('thighR',.22,0,-.04,w);toward('footR',-.22,0,0,w);}break;}
   // Stopping someone without looking up (4d; standing or seated): the right arm out level, the mitten raised like a stop
   // sign, the left holding the book she reads, the head and eyes down on it.
   case 'FingerStop':add('head',.35*w);armTo('R',[-1.33,.07,.04,-.49],w,[-1.35,0,0]);armTo('L',[-.4,.54,-.05,-1.53],w);return {eyes:[0,.85]};
   // Taping a sign to a cloth (5a, 5b): both mittens pressed flat on it at chest height, pressing and smoothing; up on the
   // toes to reach (standing).
   case 'Tape':{const press=Math.max(0,Math.sin(t*4.2))**2*.07;add('chest',.06*w);
    armTo('R',[-1.14-press,.22,.1,-1.1+press],w,[-.9,0,0]);armTo('L',[-1.14-press,.22,.1,-1.1+press],w,[-.9,0,0]);
    if(!seated){add('footL',.3*w);add('footR',.3*w);}break;}
   // Holding something out, politely (5c, 11a, 12c): the right mitten forward with it, the left beside it, a little bow.
   // In the bath the right hand comes up out of the water with it, the left stays on the water.
   case 'Offer':add('chest',(soak?.08:.12)*w);add('head',.08*w);
    if(soak)armTo('R',[-1.59,.24,.04,-.55],w);
    else{armTo('R',[-1.28,.33,.16,-.46],w);armTo('L',[-.85,.41,.1,-.97],w);}break;
   // Reaching up and out to take something (5c): the right arm straight, up on the toes, leaning in.
   case 'Reach':{const strain=Math.sin(t*3.1)*.03;add('chest',.12*w);
    armTo('R',[-1.6+strain,.05,-.1,-.66],w);armTo('L',[.25,0,-.2,-.35],w);if(!seated){add('footL',.18*w);add('footR',.18*w);}break;}
   // "I'll BE the chair" (5e): with lying, flat on the back kneading the air (below, where lying is worked out); without,
   // the same kneading rolls in the air before the chest.
   case 'LieKnead':{const r=t*Math.PI*1.1;
    armTo('R',[-1.35+Math.sin(r)*.22,0,-.12,-.95+Math.cos(r)*.4],w,[Math.sin(r+.6)*.35,0,0]);
    armTo('L',[-1.35+Math.sin(r+Math.PI)*.22,0,-.12,-.95+Math.cos(r+Math.PI)*.4],w,[Math.sin(r+.6+Math.PI)*.35,0,0]);break;}
   // The coin raised like a grenade about to be thrown (6a, seated in the chair): held up in the right mitten a hand's breadth
   // from the right cheek, the left mitten a fist before the chest, hunched forward, tense; the face clear for the lens.
   case 'GrenadeCoin':{const A=reachFor('GrenadeCoin');add('chest',.12*w);add('head',.08*w);armTo('R',A.R,w);armTo('L',A.L,w);break;}
   // A hair dryer aimed like a pistol (6b): the right arm straight out ahead, the left mitten under the forearm steadying it.
   case 'Aim':add('head',.04*w);armTo('R',[-1.2,0,.14,0],w);armTo('L',[-1.12,.84,.5,-.72],w);break;
   // Holding one thing up to show it (8a: the tiny screwdriver, upright before his face like a sacred object).
   case 'HoldUp':armTo('R',reachFor('HoldUp').R,w);break;
   // Showing a fan of straws (9b–d): held up in the right mitten beside the right of the face (both read), chest to eye height.
   case 'HoldUpStraws':armTo('R',reachFor('HoldUpStraws').R,w);break;
   // Calling out without looking up (8b, seated at the bandai): the head turned to her left to call, the eyes still down on
   // the book in the left mitten, the pencil in the right still moving.
   case 'Call':{const pen=Math.sin(t*7)*.05;add('chest',.05*w,.1*w,0);add('head',.3*w,.5*w,0);
    armTo('R',[-.4,.61+pen,-.04,-1.66],w);armTo('L',[-.42,.66,-.03,-1.49],w);return {eyes:[-.5,.8]};}
   // Writing in the book held up out of the water (12d, soaking): the left mitten holds it open before her left shoulder,
   // just above the water, the right one writes in it, the head bent over it (the face clear of it).
   case 'WriteAbove':{const pen=Math.sin(t*6)*.05;add('head',.35*w,.3*w,0);
    armTo('R',[-1.84,.37+pen,.77,-.49],w);armTo('L',[-.93,.11,-.3,-1.52],w);return {eyes:[-.2,.85]};}
   // ---- Fujita's Back (story v7). Every hand a closed mitten. Each is held until the next move, or for as long as the scene
   // names it as a pose.
   // Stuck (ぎっくり腰, 1b–4b): bent level at the hips, the knees bent and forward and the bottom out behind so he stands over
   // his feet, the head lifted a little; the right mitten pressed to the small of his back, the left arm hanging bent,
   // not daring to move; frozen, but for a little shiver. CrabWalk (2a, 4a): the same, shuffling sideways the way he is
   // moved (crabLegs), both mittens on his back, the head turned a little the way he goes. CarriedBent (8a–8d): the
   // same rigid shape lifted (the scene lifts him): the legs hanging straight and stiff, the toes down, both mittens held to
   // his back.
   case 'BentStuck':case 'CrabWalk':case 'CarriedBent':{
    const carried=g.name==='CarriedBent',crab=g.name==='CrabWalk',J=bentJoints(carried?'carried':'stand',avatar.outfit),shiver=carried?0:Math.sin(t*23)*.005;
    for(const j of ['hips','spine','chest','neck','head'])toward(j,J[j][0]+(j==='chest'?shiver:0),J[j][1],J[j][2],w);
    if(!seated){if(crab&&(s.speed||0)>.08)crabLegs(w);else for(const j of ['thighL','kneeL','footL','thighR','kneeR','footR'])toward(j,...J[j],w);}
    const back=reachFor('BentBack');armTo('R',back.R,w,back.handR);
    if(carried||crab){const both=reachFor('BentBackL');armTo('L',both.L,w,both.handL);if(crab)add('head',0,crabSide*.25*w,0);}
    else armTo('L',[-1.35,.1,.14,-1.35+shiver*4],w);
    break;}
   // In the massage chair (4d, 5b, 6i): curled over his knees, the mittens on his thighs, and uncurling slowly as the rollers
   // work, over UNCURL.time, until he is half way (where the blackout catches him); `s.uncurl` (0 curled .. 1 upright) says
   // where he is instead. The head up to look ahead.
   case 'ChairUncurl':{
    const u=Number.isFinite(s.uncurl)?THREE.MathUtils.clamp(s.uncurl,0,1):UNCURL.half*smooth(t/UNCURL.time),J=chairJoints(1-u);
    for(const j of ['spine','chest','neck','head'])toward(j,...J[j],w);
    const A=reachFor('ChairCurl'),B=reachFor('ChairHalf'),f=u/UNCURL.half;
    armTo('R',mix(A.R,B.R,f),w,A.handR);armTo('L',mix(A.L,B.L,f),w,A.handL);break;}
   // Stuck in the chair in a new shape when the lights come back (7a, 7c, 7f): see ABSURD. Seated, the left knee is its own.
   case 'FrozenAbsurd':{const A=ABSURD;
    for(const j of ['spine','chest','neck','head'])toward(j,...A[j],w);
    const U=reachFor('AbsurdUp');armTo('R',U.R,w);const B=reachFor('AbsurdBack');armTo('L',B.L,w,B.handL);
    // seated, the left knee hiked up: the pelvis rolls onto the right buttock (the left one comes up off the seat as the thigh
    // lifts), the right thigh staying where it was on the seat
    if(seated){for(const j of ['thighL','kneeL','footL'])toward(j,...A[j],w);toward('hips',0,0,A.roll,w);add('spine',0,0,-A.roll*w);add('thighR',0,0,-A.roll*w);return {legs:true};}
    break;}
   // Carrying a person like a piece of furniture (8a–8d): both mittens forward under the load at the height of the hips,
   // palms up, the back straight and a little back, the knees bent ("Lift with your legs"); it walks.
   case 'CarryFurniture':{const A=reachFor('CarryFurniture'),strain=Math.sin(t*17)*.008;
    armTo('R',[A.R[0]+strain,...A.R.slice(1)],w,A.handR);armTo('L',[A.L[0]-strain,...A.L.slice(1)],w,A.handL);add('chest',-.04*w);add('head',-.04*w);
    // leaning in a little from the hips with a straight back, the knees well bent (walking, the step goes on under it)
    if(!seated){const lean=.1,walk=(s.speed||0)>.08;toward('hips',lean,0,0,w);
     if(walk){add('thighL',-lean*w);add('thighR',-lean*w);}
     else for(const [j,v] of [['thigh',-.32-lean],['knee',.64],['foot',-.32]]){toward(j+'L',v,0,j==='thigh'?.07:j==='foot'?-.07:0,w);toward(j+'R',v,0,j==='thigh'?-.07:j==='foot'?.07:0,w);}}
    break;}
   // Wound up in her dryer's cord like a parcel (6d, 7a, 7b, 7e): the arms pinned straight down her sides first, then the cord
   // round her and them (storyAfter); the body held still (a laugh moves only her head), the feet together.
   case 'CordWrapped':{const pin=smooth(Math.min(1,raw/.4));
    for(const j of ['hips','spine','chest'])toward(j,0,0,0,w);
    armTo('R',[.02,0,-.07,-.04],pin,[0,0,0]);armTo('L',[.02,0,-.07,-.04],pin,[0,0,0]);
    if(!seated)for(const [j,z] of [['thighL',-.015],['thighR',.015],['kneeL',0],['kneeR',0],['footL',.015],['footR',-.015]])toward(j,0,0,z,w);
    add('head',.04*w,0,.1*w);wrap=Math.max(wrap,raw);break;}
   // Dazed under a basket (7a, 7b, 7e): the locker basket upside down on her head (storyAfter), both arms out before her
   // feeling for anything in the dark, slowly, the head tipped and wandering.
   case 'BasketHead':{const p=Math.sin(t*1.5),r=Math.sin(t*2.1+1);
    armTo('R',[-1.28+p*.1,.12,-.12,-.32+r*.12],w);armTo('L',[-1.28-p*.1,.12,-.12,-.32-r*.12],w);
    add('chest',.05*w);add('head',(.06+Math.sin(t*.8)*.03)*w,Math.sin(t*.6)*.12*w,.14*w);basketWanted=true;break;}
   // Reading the evening paper after his bath (3a, 3f, 4a, 5a; seated on the koagari edge): held open in both mittens before
   // the chest (storyAfter places it), the head bent over it; a Nod lowers it to look over it, nods, and brings it back up.
   case 'SitRead':{const nod=gesture?.name==='Nod'?env(gesture.t,gesture.d):0,A=reachFor('SitRead'),low=[.42,0,0,.3,0];
    armTo('R',A.R.map((v,i)=>v+low[i]*nod),w,A.handR);armTo('L',A.L.map((v,i)=>v+low[i]*nod),w,A.handL);
    add('head',(.24-.34*nod)*w);reading=Math.max(reading,w);return {eyes:[0,.7*(1-nod)]};}
   // The torch (6f, 7a, 7d): the arm is torchArm's; the body stands easy and calm.
   case 'TorchUp':add('chest',.02*w);break;
   case 'TorchOff':add('head',.05*w);break;
  }
  return null;
 }
 return {update,play,stop,style,gait,get gesture(){return gesture?.name||null;},get consumption(){return consumption;}};
}
