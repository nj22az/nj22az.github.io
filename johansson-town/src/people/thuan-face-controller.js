import * as THREE from '../../vendor/three.module.js';

/**
 * Expression, blink and viseme authority for Thuan.
 *
 * Two rigs behind one interface. If a skinned mesh in the hierarchy carries Apple
 * ARKit blendshapes the controller drives those by name; the shipped model has none
 * (`yuri-merged.glb` is a 30-bone body rig with zero morph targets), so it drives the
 * procedural face built by `createThuanFace` instead. Both paths take the same weights,
 * so swapping in an ARKit export later needs no change here or at the call site.
 *
 * @typedef {'neutral'|'smile'|'concern'|'surprise'} ThuanExpression
 * @typedef {object} FaceWeights
 * @property {number} blink      0 open, 1 shut
 * @property {number} smile      mouth corners
 * @property {number} browOuter  outer brow raise
 * @property {number} browInner  inner brow raise, the worried shape
 * @property {number} eyeWide    lid retraction
 * @property {number} mouthOpen  jaw
 * @property {number} mouthFunnel lip rounding, carried by speech
 */

/** Target weights per preset. Neutral is not blank: a face at true zero reads dead. */
export const EXPRESSIONS=Object.freeze({
 neutral:{smile:.18,browOuter:0,browInner:0,eyeWide:0,mouthOpen:0},
 smile:{smile:.85,browOuter:.15,browInner:0,eyeWide:.05,mouthOpen:0},
 concern:{smile:.02,browOuter:0,browInner:.70,eyeWide:0,mouthOpen:0},
 surprise:{smile:.25,browOuter:.80,browInner:.30,eyeWide:.75,mouthOpen:.35}
});

/** Weight name to the ARKit blendshapes it drives, for a rig that has them. */
const ARKIT=Object.freeze({
 blink:['eyeBlinkLeft','eyeBlinkRight'],
 smile:['mouthSmileLeft','mouthSmileRight'],
 browOuter:['browOuterUpLeft','browOuterUpRight'],
 browInner:['browInnerUp'],
 eyeWide:['eyeWideLeft','eyeWideRight'],
 mouthOpen:['jawOpen'],
 mouthFunnel:['mouthFunnel']
});

const BLINK_MIN=2.5,BLINK_MAX=6,BLINK_LENGTH=.16;
const nextBlinkDelay=()=>BLINK_MIN+Math.random()*(BLINK_MAX-BLINK_MIN);

/**
 * Finds the first skinned mesh carrying morph targets, and reports which of the ARKit
 * names it actually has. A rig missing a name is not an error: that weight is skipped.
 * @param {THREE.Object3D} root
 * @returns {{mesh:THREE.Mesh,indices:Record<string,number[]>}|null}
 */
export function findMorphTargets(root){
 let found=null;
 root?.traverse?.(object=>{
  if(found||!object.isMesh||!object.morphTargetDictionary||!object.morphTargetInfluences?.length)return;
  const indices={};
  for(const [weight,names] of Object.entries(ARKIT)){
   const list=names.map(name=>object.morphTargetDictionary[name]).filter(i=>Number.isInteger(i));
   if(list.length)indices[weight]=list;
  }
  if(Object.keys(indices).length)found={mesh:object,indices};
 });
 return found;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} [options.model] hierarchy to search for ARKit blendshapes
 * @param {{apply:(w:FaceWeights)=>void}} [options.face] procedural face, used when there are none
 * @param {ThuanExpression} [options.expression]
 * @param {() => number} [options.random] injectable for deterministic tests
 */
export function createThuanFaceController({model=null,face=null,expression='neutral',random=Math.random}={}){
 const morph=findMorphTargets(model);
 /** @type {FaceWeights} */
 const weights={blink:0,smile:EXPRESSIONS.neutral.smile,browOuter:0,browInner:0,eyeWide:0,mouthOpen:0,mouthFunnel:0};
 let target=EXPRESSIONS[expression]||EXPRESSIONS.neutral;
 let current=expression in EXPRESSIONS?expression:'neutral';
 let blinkTimer=BLINK_MIN+random()*(BLINK_MAX-BLINK_MIN),blinkPhase=-1;
 let speaking=0,forcedBlink=0,disposed=false;

 /** Lids shut and stay shut while asleep, so sleep overrides the blink cycle. */
 const setAsleep=value=>{forcedBlink=value?1:0;};

 function setExpression(name){
  if(!(name in EXPRESSIONS))return current;
  current=name;target=EXPRESSIONS[name];
  return current;
 }

 /** @param {boolean|number} value true, or an intensity for a louder line */
 function setSpeaking(value){speaking=value===true?1:value===false?0:THREE.MathUtils.clamp(Number(value)||0,0,1);}

 function applyToRig(){
  if(morph){
   const influences=morph.mesh.morphTargetInfluences;
   for(const [weight,indices] of Object.entries(morph.indices)){
    const value=THREE.MathUtils.clamp(weights[weight]||0,0,1);
    for(const index of indices)influences[index]=value;
   }
   return;
  }
  face?.apply?.(weights);
 }

 return {
  /** True when an ARKit rig was found; false means the procedural face is driving. */
  get usingMorphTargets(){return !!morph;},
  get expression(){return current;},
  /** Live weights, for tests and for the voice module to read. */
  get weights(){return weights;},
  setExpression,setSpeaking,setAsleep,
  /**
   * @param {number} delta seconds since the last frame
   * @param {number} [elapsed] total seconds, used for the speech oscillation
   */
  update(delta,elapsed=0){
   if(disposed)return weights;
   const dt=Math.min(Math.max(delta||0,0),.1);   // a tab returning from background must not blink violently

   // Blink: wait a randomised beat, then a single sine over BLINK_LENGTH.
   if(blinkPhase>=0){
    blinkPhase+=dt;
    if(blinkPhase>=BLINK_LENGTH){blinkPhase=-1;blinkTimer=nextBlinkDelayFrom(random);}
   }else{
    blinkTimer-=dt;
    if(blinkTimer<=0)blinkPhase=0;
   }
   const cycle=blinkPhase>=0?Math.sin(blinkPhase/BLINK_LENGTH*Math.PI):0;
   weights.blink=Math.max(forcedBlink,cycle);

   // Expression: damp rather than snap, so a reply never jumps the face.
   for(const key of ['smile','browOuter','browInner','eyeWide']){
    weights[key]=THREE.MathUtils.damp(weights[key],target[key],6,dt);
   }

   // Speech: two harmonics so the jaw does not read as a metronome. Falls to the
   // expression's own mouth shape the moment speech stops.
   if(speaking>0){
    const jaw=(.5+.5*Math.sin(elapsed*13.5))*(.55+.45*Math.sin(elapsed*5.3));
    weights.mouthOpen=THREE.MathUtils.damp(weights.mouthOpen,Math.max(target.mouthOpen,jaw*speaking*.7),12,dt);
    weights.mouthFunnel=THREE.MathUtils.damp(weights.mouthFunnel,(.5+.5*Math.sin(elapsed*9.1))*speaking*.4,12,dt);
   }else{
    weights.mouthOpen=THREE.MathUtils.damp(weights.mouthOpen,target.mouthOpen,10,dt);
    weights.mouthFunnel=THREE.MathUtils.damp(weights.mouthFunnel,0,10,dt);
   }

   applyToRig();
   return weights;
  },
  /** Releases the rig back to neutral; the meshes belong to the caller. */
  dispose(){
   if(disposed)return;
   disposed=true;speaking=0;
   for(const key of Object.keys(weights))weights[key]=0;
   applyToRig();
  }
 };
}

// Kept separate so the random source stays injectable for tests.
function nextBlinkDelayFrom(random){return BLINK_MIN+random()*(BLINK_MAX-BLINK_MIN);}

export {nextBlinkDelay};
