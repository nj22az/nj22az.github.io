import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';

/**
 * Johansson, seen from outside: the player's own body for the third-person view.
 *
 * `assets/characters/johansson/johansson.glb` is built by tools/blender/build-johansson.py
 * and animate-johansson.py: a 163-bone MakeHuman skeleton (fingers, toes, jaw, eyes), 31
 * body actions, and fifteen face shapes on the head and brows. The body actions are mixed
 * here from what the controller is doing; the face -- blinks, where he looks, speech and
 * expression -- is driven every frame on top of them.
 */
export const JOHANSSON_MODEL='characters/johansson/johansson.glb';
export const JOHANSSON_HEIGHT=1.68;

/** Metres covered by one cycle of each gait, measured in Blender (art/characters/johansson/actions.json). */
const STRIDE={Walk:{metres:2.193,seconds:.74},Run:{metres:3.042,seconds:.6}};
export const GAIT_SPEED=Object.freeze({Walk:STRIDE.Walk.metres/STRIDE.Walk.seconds,Run:STRIDE.Run.metres/STRIDE.Run.seconds});

/** Actions that repeat until something else happens. */
export const LOOPS=new Set(['Idle','Walk','Run','Sit','SitEat','Soak','Fall','Talk','FishIdle','Reel','Kachashi','Crouch','Phone']);

/** The things he can do on request, in the order the moves menu lists them. */
export const MOVES=Object.freeze([
 ['Wave','Wave'],['Bow','Bow · お辞儀'],['Nod','Nod'],['HeadShake','Shake your head'],['Point','Point'],
 ['Shrug','Shrug'],['Clap','Clap'],['Laugh','Laugh'],['Think','Think it over'],['LookAround','Look around'],
 ['Stretch','Stretch'],['Talk','Chat with your hands'],['Kachashi','Kachāshī · カチャーシー'],['Crouch','Squat on your heels'],
 ['PickUp','Pick something up'],['Fist','Make a fist']
]);

export const FACE_SHAPES=Object.freeze(['blinkL','blinkR','squint','eyesWide','browUp','browDown','browSad','jawOpen','smile','frown','pucker','mouthWide','lipsPress','sneer','lipUp']);

/**
 * Face presets. Neutral is the closed half-smile of the photograph he is modelled on,
 * not a blank: at true zero the heavy brows and laugh lines read as a scowl.
 */
export const EXPRESSIONS=Object.freeze({
 neutral:{smile:.24,lipsPress:.12},
 happy:{smile:.7,squint:.3,browUp:.12},
 laugh:{smile:.95,jawOpen:.42,squint:.6,browUp:.2,lipUp:.2},
 surprised:{eyesWide:.85,browUp:.9,jawOpen:.28},
 worried:{browSad:.8,frown:.35,lipsPress:.25},
 thinking:{browDown:.35,pucker:.22,squint:.2,smile:.05},
 grumpy:{browDown:.7,frown:.55,sneer:.2},
 content:{smile:.45,blinkL:.2,blinkR:.2}
});

/** The face each move brings with it. */
const MOVE_FACE={Wave:'happy',Clap:'happy',Kachashi:'laugh',Laugh:'laugh',Think:'thinking',Shrug:'worried',HeadShake:'grumpy',Bow:'content',Nod:'content',Stretch:'content',LookAround:'surprised',Sit:'content',Soak:'content',SitEat:'happy'};

const BLINK_MIN=1.8,BLINK_MAX=5.5,BLINK_LENGTH=.15;

/** Choose the body action for what the controller is doing. Pure, for tests. */
export function baseMove({speed=0,running=false,seated=false,seat='Sit',airborne=false}={}){
 if(seated)return seat;
 if(airborne)return 'Fall';
 if(speed>.25)return running||speed>GAIT_SPEED.Walk*1.2?'Run':'Walk';
 return 'Idle';
}

/** Playback rate that keeps the planted foot still on the ground at this speed. */
export function gaitRate(move,speed){
 const native=GAIT_SPEED[move];
 return native?THREE.MathUtils.clamp(speed/native,.55,1.6):1;
}

/**
 * @param {object} options
 * @param {THREE.Scene} options.scene
 * @param {(path:string)=>string} options.resolve asset path to URL
 */
export function createJohansson({scene,resolve}){
 const root=new THREE.Group();root.name='Johansson (third person)';root.visible=false;scene.add(root);
 let model=null,mixer=null,faces=[],eyes=[],head=null,headRest=null,ready=false,sitHip=.4,held=null,seatHip={},outfit='clothes';const grip={},wardrobe={clothes:[],swim:[]};
 const actions=new Map();
 let base=null,baseName='',gesture=null,gestureName='',seatMove='Sit';
 let blinkIn=2,blinkT=-1,speakUntil=0,syllable=0,syllableShape={},expression='neutral',expressionUntil=0,time=0;
 const weights=Object.fromEntries(FACE_SHAPES.map(n=>[n,0]));
 let lookTarget=null;const gaze=new THREE.Vector2(),gazeGoal=new THREE.Vector2();let glanceIn=3;

 const loading=(async()=>{
  const response=await fetch(resolve(JOHANSSON_MODEL));
  if(!response.ok)throw Error('Johansson model unavailable');
  const gltf=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');
  model=gltf.scene;model.rotation.y=Math.PI;
  const bounds=new THREE.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y;
  model.scale.setScalar(JOHANSSON_HEIGHT/height);model.position.y=-bounds.min.y*JOHANSSON_HEIGHT/height;
  model.traverse(o=>{
   if(o.isMesh){
    o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
    const m=o.material;
    if(m.transparent){m.depthWrite=false;m.alphaTest=.02;o.renderOrder=2;}
    if(o.morphTargetDictionary)faces.push({mesh:o,index:o.morphTargetDictionary});
    // What he wears: the shirt, shorts and shoes, or the swimming trunks over the skin beneath them.
    if(/Clothes|Shoes/.test(o.name))wardrobe.clothes.push(o);else if(/SkinUnder|Trunks/.test(o.name)){wardrobe.swim.push(o);o.visible=false;}
   }
   if(o.isBone){if(o.name==='eyeL'||o.name==='eyeR')eyes.push({bone:o,rest:o.quaternion.clone()});if(o.name==='head'){head=o;headRest=o.quaternion.clone();}}
  });
  root.add(model);
  // Eye bones sit rolled in the MakeHuman rig; keep each one's rest turn from the head so a
  // gaze worked out in head space (x left, y up, z forward) can be carried into its frame.
  model.updateMatrixWorld(true);
  if(head){const hq=head.getWorldQuaternion(new THREE.Quaternion()).invert();for(const e of eyes){e.fromHead=hq.clone().multiply(e.bone.getWorldQuaternion(new THREE.Quaternion()));e.toHead=e.fromHead.clone().invert();}}
  mixer=new THREE.AnimationMixer(model);
  for(const clip of gltf.animations){
   const action=mixer.clipAction(clip);
   if(LOOPS.has(clip.name))action.setLoop(THREE.LoopRepeat,Infinity);else{action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;}
   actions.set(clip.name,action);
  }
  mixer.addEventListener('finished',e=>{if(e.action===gesture)endGesture(.35);});
  for(const name of ['wristR','finger3-2R','finger2-1R','finger5-1R'])grip[name]=model.getObjectByName(name);
  // How high his hips sit above his feet in the chair pose, so a seat can take his weight.
  const sit=actions.get('Sit'),hipBone=model.getObjectByName('upperleg01L');
  for(const name of ['Sit','Soak','SitDrink']){const a=actions.get(name);if(!a||!hipBone)continue;a.reset().play();mixer.update(0);root.updateMatrixWorld(true);seatHip[name]=root.worldToLocal(hipBone.getWorldPosition(new THREE.Vector3())).y;a.stop();}
  sitHip=seatHip.Sit??sitHip;
  setBase('Idle',0);ready=true;return true;
 })().catch(error=>{console.warn('Johansson stays first-person only:',error.message);return false;});

 function setBase(name,fade=.25){
  const next=actions.get(name);if(!next||name===baseName)return;
  next.reset().setEffectiveWeight(1).play();
  if(base&&!gesture)next.crossFadeFrom(base,fade,true);else if(base)base.fadeOut(fade);
  if(gesture)next.setEffectiveWeight(0);
  base=next;baseName=name;
  const face=MOVE_FACE[name];if(face)express(face,0);else if(expressionUntil===0)expression='neutral';
 }
 function endGesture(fade=.3){
  if(!gesture)return;
  const g=gesture;gesture=null;gestureName='';
  base?.reset().play();base?.setEffectiveWeight(1);if(base)base.crossFadeFrom(g,fade,true);else g.fadeOut(fade);
 }
 /** Play one of his moves over whatever his feet are doing. */
 function play(name,{face,startAt=0}={}){
  const action=actions.get(name);if(!action)return false;
  if(gesture===action){action.reset();action.time=startAt;return true;}
  const from=gesture||base;
  action.reset();action.time=startAt;action.setEffectiveWeight(1).play();
  if(from)action.crossFadeFrom(from,.25,true);
  gesture=action;gestureName=name;
  express(face||MOVE_FACE[name]||'neutral',LOOPS.has(name)?0:action.getClip().duration+.6);
  return true;
 }
 function express(name,seconds=3){if(!EXPRESSIONS[name])return;expression=name;expressionUntil=seconds>0?time+seconds:0;}
 /** Move his mouth for this long, as though speaking. */
 function speak(seconds=2){speakUntil=Math.max(speakUntil,time+seconds);}
 function lookAt(point){lookTarget=point?point.clone?.()||point:null;}

 const gw=new THREE.Vector3(),gf=new THREE.Vector3(),gi=new THREE.Vector3(),gp=new THREE.Vector3(),gUp=new THREE.Vector3(0,1,0),gq2=new THREE.Quaternion();
 /** The fingers wrap round what he holds: its axis runs from little finger to forefinger. */
 function placeInHand(){
  if(!grip.wristR||!grip['finger3-2R'])return;
  root.updateMatrixWorld(true);
  grip.wristR.getWorldPosition(gw);grip['finger3-2R'].getWorldPosition(gf);grip['finger2-1R'].getWorldPosition(gi);grip['finger5-1R'].getWorldPosition(gp);
  root.worldToLocal(gw);root.worldToLocal(gf);root.worldToLocal(gi);root.worldToLocal(gp);
  const axis=gi.clone().sub(gp).normalize(),centre=gw.clone().lerp(gf,.55);
  gq2.setFromUnitVectors(gUp,axis);held.quaternion.copy(gq2);held.position.copy(centre).addScaledVector(axis,-.055);
 }
 const eyeWorld=new THREE.Vector3(),toTarget=new THREE.Vector3(),headQ=new THREE.Quaternion(),localDir=new THREE.Vector3(),gq=new THREE.Quaternion(),eq=new THREE.Quaternion(),ge=new THREE.Euler();
 function updateFace(dt){
  // Blinks: quick, now and then a double.
  blinkIn-=dt;if(blinkIn<=0&&blinkT<0){blinkT=0;blinkIn=BLINK_MIN+Math.random()*(BLINK_MAX-BLINK_MIN);if(Math.random()<.15)blinkIn=.28;}
  let blink=0;if(blinkT>=0){blinkT+=dt;blink=Math.sin(Math.min(1,blinkT/BLINK_LENGTH)*Math.PI);if(blinkT>=BLINK_LENGTH)blinkT=-1;}
  if(expressionUntil&&time>expressionUntil){expression='neutral';expressionUntil=0;}
  const target=Object.fromEntries(FACE_SHAPES.map(n=>[n,0]));
  Object.assign(target,EXPRESSIONS[expression]);
  // Speech: a new mouth shape every syllable, jaw, rounding and spreading in turn.
  if(time<speakUntil){
   syllable-=dt;
   if(syllable<=0){syllable=.09+Math.random()*.11;const r=Math.random();syllableShape=r<.45?{jawOpen:.22+Math.random()*.25}:r<.7?{pucker:.45,jawOpen:.1}:r<.9?{mouthWide:.45,jawOpen:.12}:{lipsPress:.5};}
   for(const [k,v] of Object.entries(syllableShape))target[k]=Math.max(target[k]*.5,v);
   target.browUp=Math.max(target.browUp,.15*Math.max(0,Math.sin(time*2.3)));
  }
  target.blinkL=Math.max(target.blinkL||0,blink);target.blinkR=Math.max(target.blinkR||0,blink);
  const k=1-Math.exp(-dt*18);
  for(const n of FACE_SHAPES){const speed=n.startsWith('blink')?1:k;weights[n]+=(target[n]-weights[n])*speed;}
  for(const {mesh,index} of faces)for(const n of FACE_SHAPES){const i=index[n];if(i!==undefined)mesh.morphTargetInfluences[i]=weights[n];}
  // Gaze: at whoever he is talking to, otherwise small glances about.
  if(lookTarget&&head){
   head.getWorldPosition(eyeWorld);toTarget.subVectors(lookTarget,eyeWorld);
   head.getWorldQuaternion(headQ);localDir.copy(toTarget).applyQuaternion(headQ.invert()).normalize();
   gazeGoal.set(THREE.MathUtils.clamp(Math.atan2(localDir.x,localDir.z),-.5,.5),THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(localDir.y,-1,1)),-.3,.3));
  }else{glanceIn-=dt;if(glanceIn<=0){glanceIn=1.5+Math.random()*3;gazeGoal.set((Math.random()-.5)*.5,(Math.random()-.5)*.18);if(Math.random()<.4)gazeGoal.set(0,0);}}
  gaze.lerp(gazeGoal,1-Math.exp(-dt*10));
  ge.set(-gaze.y,gaze.x,0);gq.setFromEuler(ge);
  for(const e of eyes)if(e.fromHead)e.bone.quaternion.multiply(eq.copy(e.toHead).multiply(gq).multiply(e.fromHead));
  if(lookTarget&&head&&!gesture){ge.set(0,gaze.x*.6,0);gq.setFromEuler(ge);head.quaternion.multiply(gq);}
 }

 return {
  root,loading,
  get ready(){return ready;},get move(){return gestureName||baseName;},get expression(){return expression;},get weights(){return {...weights};},
  get actions(){return [...actions.keys()];},
  play,express,speak,lookAt,
  /** Seated variant: 'Sit', 'SitEat' or 'Soak'. */
  seat(name='Sit'){seatMove=actions.has(name)?name:'Sit';},
  /** 'clothes' or 'swim'. */
  wear(name){outfit=name==='swim'?'swim':'clothes';for(const o of wardrobe.clothes)o.visible=outfit==='clothes';for(const o of wardrobe.swim)o.visible=outfit==='swim';},
  get outfit(){return outfit;},
  /** Height of his hip joints above his feet when sitting. */
  get sitHip(){return seatHip[seatMove]??sitHip;},
  /** Put something in his right hand (a mug, a bottle, a can), or null to empty it. */
  hold(prop){if(held)held.removeFromParent();held=prop||null;if(held)root.add(held);},
  jump(){play('Jump',{startAt:.14});},
  stop(){endGesture();},
  /**
   * @param {number} dt
   * @param {{speed?:number,running?:boolean,seated?:boolean,airborne?:boolean,visible?:boolean}} state
   */
  update(dt,state={}){
   time+=dt;
   root.visible=!!state.visible&&ready;
   if(!ready)return;
   const want=baseMove({...state,seat:seatMove});
   // Walking off, or sitting down, ends a move that was playing on the spot.
   if(gesture&&gestureName!=='Jump'&&(want!=='Idle'||state.seated)&&!(state.seated&&gestureName.startsWith('Sit')))endGesture(.2);
   setBase(want,want==='Fall'||baseName==='Fall'?.15:.3);
   if(base===actions.get('Walk')||base===actions.get('Run'))base.timeScale=gaitRate(baseName,state.speed||0);
   // Eyes and head take the clip's pose, or rest, before the gaze is laid on top.
   for(const e of eyes)e.bone.quaternion.copy(e.rest);if(head)head.quaternion.copy(headRest);
   mixer.update(dt);
   updateFace(dt);
   if(held)placeInHand();
  }
 };
}
