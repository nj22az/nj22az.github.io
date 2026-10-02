import * as THREE from '../../vendor/three.module.js';
import {poseAvatarOnBicycle} from './bicycle-pose.js';
import {bicycleRiderFit} from '../world/bicycle-fit.js';
import {seeded} from './recipe.js';
import {consumptionPhase,poseAvatarConsumption,drinkHeadTilt} from './consume.js';
import {bodyLanguage} from './body-language.js';

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
const ease=(t,d,edge=.25)=>Math.min(1,t/edge,(d-t)/edge);

/** How long each move lasts (loops run until something else happens). */
export const GESTURES=Object.freeze({
 Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,
 PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitEnjoyFood:3.8,SitPresentFood:4.2,SitToast:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,
 Heart:2.8,Peace:2.8,Coy:3,Tada:2.4,HandsOnHips:2.6,HeelKick:2.6,
 Talk:Infinity,Kachashi:Infinity,Crouch:Infinity,Phone:Infinity,FishIdle:Infinity,Reel:Infinity,
});
/** The body that goes with a feeling, played once when the feeling arrives. */
export const EMOTION_GESTURE=Object.freeze({happy:'Hop',laugh:'Laugh',sad:'Slump',angry:'Stomp',shy:'Fidget',surprised:'Gasp',worried:'Think'});

/**
 * @param {object} avatar from build.js
 * @param {{lively?:boolean,random?:()=>number}} [options] lively: a resident living their
 *   own life, who strikes their personality's poses standing about and as they start to
 *   talk (body-language.js). Off for the player's body, the photo studio and the maker,
 *   where somebody else says what the body does.
 */
export function createAvatarAnimator(avatar,{lively=false,random=Math.random}={}){
 const {bones,measure:m}=avatar;
 const style=bodyLanguage(avatar.recipe?.profile||{});
 const pick=list=>list[Math.floor(random()*list.length)];
 const idleWait=()=>style.idleEvery[0]+random()*(style.idleEvery[1]-style.idleEvery[0]);
 let idleIn=4+idleWait()*.6,wasTalking=false,quietFor=10;
 const individual=seeded(avatar.recipe.name||JSON.stringify(avatar.recipe));
 const strideStyle=.92+individual()*.16,armStyle=.8+individual()*.25;
 const posture=(individual()-.5)*.055,idleRate=.85+individual()*.3;
 const current=Object.fromEntries(JOINTS.map(j=>[j,new THREE.Vector3()]));
 const target=Object.fromEntries(JOINTS.map(j=>[j,new THREE.Vector3()]));
 const gazeLocal=new THREE.Vector3();
 let phase=0,time=Math.random()*10,rootY=0,hipsY=0,lean=0;
 let gesture=null,blinkIn=1+Math.random()*3,blinkT=-1,talkT=0,talkOpen=0,glance=[0,0],glanceIn=2,lastExpression='neutral';
 let consumption=null,consumeTime=0,lastConsume=null,driftX=0;
 const set=(j,x=0,y=0,z=0)=>target[j].set(x,y,z);
 const add=(j,x=0,y=0,z=0)=>target[j].add(new THREE.Vector3(x,y,z));

 /** @param {number} [seconds] how long to hold a move that would otherwise loop. */
 function play(name,seconds){
  if(!(name in GESTURES))return false;
  gesture={name,t:0,d:GESTURES[name]===Infinity&&seconds?seconds:GESTURES[name]};return true;
 }
 /** A move of one's own choosing: loops are held for a few seconds, not for ever. */
 const flourish=name=>play(name,2.6+random()*1.4);
 const stop=()=>{gesture=null;};

 /**
  * @param {number} dt
  * @param {object} s what the body is doing:
  *   speed, running, seated, seatHeight, floorHeight, pose, riding, ridePhase, carrying,
  *   waving, talking, expression, sleeping, airborne, seat ('Sit'|'SitEat'|'Soak'),
  *   gaze (a world point to look at), tipsy (0–4: how much they have drunk)
  */
 function update(dt,s={}){
  time+=dt;
  const action=gesture?.name||s.pose||s.seat;avatar.setOpenHands?.(['SitEnjoyFood','SitPresentFood'].includes(action));
  const eating=['Eat','EatStanding','SitEat'].includes(action),drinking=['Drink','DrinkStanding','SitDrink','SitToast'].includes(action);
  if(eating||drinking){
   if(action!==lastConsume)consumeTime=0;
   consumeTime+=dt;
   const t=Number.isFinite(s.consumeElapsed)?s.consumeElapsed:gesture?gesture.t+dt:consumeTime%5;
   consumption={...consumptionPhase(t),food:eating,elapsed:consumeTime,cycle:Math.floor(consumeTime/5)};
  }else{consumption=null;consumeTime=0;}
  lastConsume=action;
  for(const j of JOINTS)target[j].set(0,0,0);
  let targetRoot=0,targetHips=0,targetLean=0;
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
  }else if(s.seated){
   const soak=s.seat==='Soak'||s.pose==='Soak';
   targetRoot=(Number.isFinite(s.seatHeight)?s.seatHeight:.45)-m.hipY+m.seatDrop;
   set('thighL',-1.52,0,.06);set('thighR',-1.52,0,-.06);set('kneeL',1.45);set('kneeR',1.45);
   set('shoulderL',-.45,0,.15);set('shoulderR',-.45,0,-.15);set('elbowL',-.55);set('elbowR',-.55);
   add('chest',Math.sin(time*1.5)*.02);
   const pose=s.pose;
   if(pose==='Type'){set('shoulderL',-.9,0,.1);set('shoulderR',-.9,0,-.1);set('elbowL',-.7+Math.sin(time*14)*.08);set('elbowR',-.7+Math.sin(time*13+1)*.08);set('head',.15);}
   else if(pose==='Eat'||pose==='Drink'||s.seat==='SitEat'){const lift=Math.max(0,Math.sin(time*1.4))**4;set('shoulderR',-.6-lift*.9,0,-.25);set('elbowR',-.8-lift*1.3);set('head',.08-lift*.1);}
   else if(pose==='Sleep'||s.sleeping){set('head',.45,0,.15);set('chest',.15);}
   else if(soak){set('thighL',-1.3,0,.25);set('thighR',-1.3,0,-.25);set('kneeL',.9);set('kneeR',.9);set('shoulderL',0,0,.9);set('shoulderR',0,0,-.9);set('head',-.1);}
   else if(pose==='Wake'){const w=Math.max(0,Math.sin(time*.8));set('shoulderL',0,0,.4+w*2.2);set('shoulderR',0,0,-.4-w*2.2);}
  }else if(moving){
   // Walking and running: short legs, a quick step and a proper bounce.
   const run=s.running||speed>2.6,stride=m.leg*(run?2.6:1.7)*strideStyle;
   phase+=speed/stride*Math.PI*2*dt*.5;
   const A=run?.95:Math.min(.62,.25+speed*.3),sp=Math.sin(phase),cp=Math.cos(phase);
   set('thighL',-sp*A);set('thighR',sp*A);
   set('kneeL',Math.max(0,Math.sin(phase-.9))*A*1.5+.05);set('kneeR',Math.max(0,Math.sin(phase+Math.PI-.9))*A*1.5+.05);
   set('footL',sp*A*.3);set('footR',-sp*A*.3);
   set('shoulderL',sp*A*armStyle,0,.12);set('shoulderR',-sp*A*armStyle,0,-.12);
   set('elbowL',run?-1.35:-.25-Math.max(0,-sp)*.3);set('elbowR',run?-1.35:-.25-Math.max(0,sp)*.3);
   set('hips',0,sp*.14,0);set('chest',run?.22:.05,-sp*.18,0);set('head',run?-.12:-.02,sp*.08,0);
   targetHips=Math.abs(cp)*(run?.055:.025)*m.k-(run?.02:0);
   if(s.carrying){set('shoulderL',-1.15,0,.3);set('shoulderR',-1.15,0,-.3);set('elbowL',-.5);set('elbowR',-.5);}
  }else{
   // Standing: breathing, the weight moving from foot to foot, the odd look round.
   add('chest',Math.sin(time*1.6)*.025);set('hips',0,0,Math.sin(time*.45)*.035);add('head',Math.sin(time*.7)*.03,Math.sin(time*.31)*.12,Math.sin(time*.5)*.04);
   add('thighL',0,0,-Math.sin(time*.45)*.03);add('thighR',0,0,-Math.sin(time*.45)*.03);
   add('chest',posture);add('head',0,Math.sin(time*.31*idleRate)*.035,0);
   targetHips=Math.sin(time*1.6*idleRate)*.004;
   const pose=s.pose;
   if(pose==='CounterIdle'){set('shoulderL',-.5,0,.2);set('shoulderR',-.5,0,-.2);set('elbowL',-.95);set('elbowR',-.95);}
   else if(pose==='Interact'){set('shoulderL',-.75+Math.sin(time*4.5)*.18,0,.15);set('shoulderR',-.75+Math.sin(time*4.5+1.7)*.18,0,-.15);set('elbowL',-.8);set('elbowR',-.8);add('chest',.12);add('head',.2);}
   else if(pose==='DrinkStanding'||pose==='Drink'){const lift=Math.max(0,Math.sin(time*1.2))**4;set('shoulderR',-.5-lift*1.1,0,-.2);set('elbowR',-.9-lift*1.2);}
   else if(pose==='Sit'||pose==='Sleep'){set('head',.2);}
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
  // Which move depends on who they are: a happy Typhoon throws a ta-da, a happy
  // Lighthouse keeper nods.
  if(expression!==lastExpression){lastExpression=expression;const g=style.feel[expression]||EMOTION_GESTURE[expression];if(g&&!s.seated&&!moving&&!gesture)flourish(g);}
  const talking=!!s.talking;
  if(lively){
   const free=!moving&&!s.seated&&!s.riding&&!s.airborne&&!s.sleeping&&!s.carrying&&!consumption&&(!s.pose||s.pose==='Idle')&&!s.heldProp;
   // Starting to say something, after a pause: the hands go with the words.
   if(talking&&!wasTalking&&quietFor>.8&&free&&!gesture&&random()<style.talkChance)flourish(pick(style.talk));
   // Standing about with nothing to do: now and then, something of their own.
   if(free&&!talking&&!gesture){idleIn-=dt;if(idleIn<=0){flourish(pick(style.idle));idleIn=idleWait();}}
   else idleIn=Math.max(idleIn,2);
  }
  quietFor=talking?0:quietFor+dt;wasTalking=talking;
  if(s.waving&&!gesture)play('Wave');
  if(gesture){gesture.t+=dt;if(gesture.t>=gesture.d)gesture=null;else{const r=applyGesture(gesture,s);if(r?.root!==undefined)targetRoot+=r.root;}}
  // Looking at someone: the head turns, the chest helps with a big turn, and the eyes
  // carry whatever is left over. `gaze` is a point in the world.
  let eyes=null;
  if(s.gaze&&!s.sleeping){
   gazeLocal.set(...(s.gaze.isVector3?s.gaze.toArray():s.gaze));avatar.root.worldToLocal(gazeLocal);
   const yaw=Math.atan2(gazeLocal.x,gazeLocal.z),pitch=-Math.atan2(gazeLocal.y-m.headCentre,Math.hypot(gazeLocal.x,gazeLocal.z));
   if(Math.abs(yaw)<2.4){
    const turn=THREE.MathUtils.clamp(yaw,-1.35,1.35),tilt=THREE.MathUtils.clamp(pitch,-.45,.4);
    add('head',tilt*.8,turn*.62,0);add('chest',tilt*.15,turn*.3,0);
    eyes=[THREE.MathUtils.clamp((yaw-turn*.62)*1.6,-1,1),THREE.MathUtils.clamp(tilt*.5,-.6,.6)];
   }
  }
  // Ease every joint toward where it is going.
  const k=1-Math.exp(-dt*14);
  for(const j of JOINTS){current[j].lerp(target[j],k);bones[j].rotation.set(current[j].x,current[j].y,current[j].z);}
  rootY+=(targetRoot-rootY)*(s.seated||s.riding?1-Math.exp(-dt*9):k);hipsY+=(targetHips-hipsY)*k;lean+=(targetLean-lean)*k;
  if(s.riding)rootY=targetRoot;
  avatar.root.position.x=s.riding?0:driftX;
  avatar.root.position.z=s.riding?.21*(s.bicycleFit||bicycleRiderFit(m)).scale:0;
  avatar.root.position.y=rootY+(s.seated||s.riding?0:(s.floorHeight||0));
  bones.hips.position.y=m.hipY+(s.riding?0:hipsY);
  if(s.riding)poseAvatarOnBicycle(avatar,s.ridePhase||0,s.bicycleFit||bicycleRiderFit(m));
  else if(consumption){
   bones.head.rotation.x+=drinkHeadTilt(s.heldProp,consumption.lift,consumption.food);
   poseAvatarConsumption(avatar,consumption.lift,consumption.food,s.heldProp);
  }
  // The face: blinks, words, glances, and whatever it is feeling.
  blinkIn-=dt;if(blinkIn<=0&&blinkT<0){blinkT=0;blinkIn=1.8+Math.random()*3.8;}
  let blink=0;if(blinkT>=0){blinkT+=dt;blink=blinkT<.13?1:0;if(blinkT>=.13)blinkT=-1;}
  if(s.talking){talkT-=dt;if(talkT<=0){talkT=.09+Math.random()*.12;talkOpen=talkOpen?0:(Math.random()<.8?1:0);}}else talkOpen=0;
  glanceIn-=dt;if(glanceIn<=0){glanceIn=1.2+Math.random()*3;glance=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8];}
  const face=s.sleeping?'sleep':expression;
  avatar.paintFace({expression:face,blink,talk:talkOpen,look:s.look||eyes||(face==='thinking'?[1,-1]:glance)});
 }

 function applyGesture(g,s){
  const t=g.t,d=g.d,e=d===Infinity?1:env(t,d),q=d===Infinity?Math.min(1,t/.3):ease(t,d);
  switch(g.name){
   case 'Wave':set('shoulderR',-.2,0,-2.55*q);set('elbowR',0,0,-.45+Math.sin(t*10)*.45*q);add('head',0,0,.08*q);break;
   case 'Bow':add('chest',.95*e);add('spine',.25*e);add('head',.2*e);set('shoulderL',.1,0,.05);set('shoulderR',.1,0,-.05);break;
   case 'Nod':add('head',Math.sin(t*9)*.28*e);break;
   case 'HeadShake':add('head',0,Math.sin(t*11)*.45*e);break;
   case 'Point':set('shoulderR',-1.5*q,.2,-.1);set('elbowR',-.05);add('head',0,-.15*q);break;
   case 'Shrug':set('shoulderL',-.3*e,0,.55*e+.13);set('shoulderR',-.3*e,0,-.55*e-.13);set('elbowL',-1.3*e);set('elbowR',-1.3*e);add('head',0,0,.2*e);break;
   case 'Clap':{const c=Math.abs(Math.sin(t*9));set('shoulderL',-1.2*q,0,.1+c*.35);set('shoulderR',-1.2*q,0,-.1-c*.35);set('elbowL',-.9*q);set('elbowR',-.9*q);break;}
   case 'Laugh':add('chest',-.24*e+Math.sin(t*16)*.07*e);add('head',-.32*e);set('shoulderL',-.85*e,0,.4);set('shoulderR',-.85*e,0,-.4);set('elbowL',-1.65*e);set('elbowR',-1.65*e);break;
   case 'Gasp':add('chest',-.18*e);add('head',-.12*e);set('shoulderL',-.7*e,0,.28);set('shoulderR',-.7*e,0,-.28);set('elbowL',-1.9*e);set('elbowR',-1.9*e);return {root:Math.sin(Math.PI*t/d)*.045};
   case 'Think':set('shoulderR',-1.25*q,0,-.35);set('elbowR',-1.95*q);set('shoulderL',-.4*q,0,.3);set('elbowL',-1.4*q);add('head',.12*q,0,.18*q);break;
   case 'LookAround':add('head',0,Math.sin(t*2.4)*.75*e);add('chest',0,Math.sin(t*2.4)*.2*e);break;
   case 'Stretch':set('shoulderL',-.2,0,2.8*e);set('shoulderR',-.2,0,-2.8*e);add('chest',-.25*e);add('head',-.3*e);break;
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
   case 'Phone':set('shoulderR',-.4,0,-.5);set('elbowR',-2.2);add('head',0,0,-.15);break;
   case 'FishIdle':set('shoulderL',-1,0,.1);set('shoulderR',-1,0,-.1);set('elbowL',-.6);set('elbowR',-.6);break;
   case 'Reel':set('shoulderL',-1,0,.1);set('elbowL',-.6);set('shoulderR',-1+Math.sin(t*9)*.25,0,-.2);set('elbowR',-.8+Math.cos(t*9)*.3);break;
  }
  return null;
 }
 return {update,play,stop,style,get gesture(){return gesture?.name||null;},get consumption(){return consumption;}};
}
