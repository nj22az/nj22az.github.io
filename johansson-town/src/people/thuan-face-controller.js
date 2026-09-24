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
 * @typedef {'neutral'|'smile'|'concern'|'surprise'|'happy'|'sad'|'angry'|'shy'} ThuanExpression
 * @typedef {object} FaceWeights
 * @property {number} blink      0 open, 1 shut
 * @property {number} smile      mouth corners
 * @property {number} browOuter  outer brow raise
 * @property {number} browInner  inner brow raise, the worried shape
 * @property {number} eyeWide    lid retraction
 * @property {number} mouthOpen  jaw
 * @property {number} mouthFunnel lip rounding, carried by speech
 * @property {number} browDown   brows drawn down and in: the cross shape
 * @property {number} squint     lower lids up: a real smile's eyes, or a glare
 * @property {number} frown      mouth corners down
 * @property {number} press      lips pressed together
 * @property {number} blush      colour in the cheeks
 */

/** Target weights per preset. Neutral is not blank: a face at true zero reads dead. */
const FACE_KEYS=['smile','browOuter','browInner','eyeWide','mouthOpen','browDown','squint','frown','press','blush'];
const preset=weights=>Object.freeze(Object.fromEntries(FACE_KEYS.map(key=>[key,weights[key]||0])));
export const EXPRESSIONS=Object.freeze({
 neutral:preset({smile:.18}),
 smile:preset({smile:.85,browOuter:.15,eyeWide:.05}),
 concern:preset({smile:.02,browInner:.70}),
 surprise:preset({smile:.25,browOuter:.80,browInner:.30,eyeWide:.75,mouthOpen:.35}),
 // A full smile reaches the eyes and lifts the brows, and the lips part a little.
 happy:preset({smile:1,browOuter:.3,squint:.35,mouthOpen:.05,blush:.2}),
 // Inner brows up, corners down, the eyes a little heavy.
 sad:preset({browInner:1,frown:1,squint:.25,press:.1}),
 // Brows down and in, a narrow look, the lips pressed thin.
 angry:preset({browDown:1,squint:.5,press:.45,frown:.85}),
 // A small smile she is trying to keep, brows a touch worried, and a flush.
 shy:preset({smile:.45,browInner:.35,press:.3,squint:.1,blush:.9})
});

/** Weight name to the ARKit blendshapes it drives, for a rig that has them. */
const ARKIT=Object.freeze({
 blink:['eyeBlinkLeft','eyeBlinkRight'],
 browDown:['browDown'],
 squint:['eyeSquint'],
 frown:['mouthFrown'],
 press:['mouthPress'],
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
 * Finds every mesh carrying the ARKit shapes (the head, and the brows, lashes and blush
 * that must move with it), and reports which names each actually has. A rig missing a
 * name is not an error: that weight is skipped. `mesh` and `indices` are the richest one.
 * @param {THREE.Object3D} root
 * @returns {{mesh:THREE.Mesh,indices:Record<string,number[]>,meshes:{mesh:THREE.Mesh,indices:Record<string,number[]>}[]}|null}
 */
export function findMorphTargets(root){
 const meshes=[];
 root?.traverse?.(object=>{
  if(!object.isMesh||!object.morphTargetDictionary||!object.morphTargetInfluences?.length)return;
  const indices={};
  for(const [weight,names] of Object.entries(ARKIT)){
   const list=names.map(name=>object.morphTargetDictionary[name]).filter(i=>Number.isInteger(i));
   if(list.length)indices[weight]=list;
  }
  if(Object.keys(indices).length)meshes.push({mesh:object,indices});
 });
 if(!meshes.length)return null;
 const richest=meshes.reduce((a,b)=>Object.keys(b.indices).length>Object.keys(a.indices).length?b:a);
 return {mesh:richest.mesh,indices:richest.indices,meshes};
}

/** A soft round flush: full in the middle of the cheek, gone well before the patch edge. */
function blushTexture(size=64){
 const data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const r=Math.hypot((x+.5)/size-.5,(y+.5)/size-.5)/.5,a=Math.round(255*Math.exp(-Math.pow(r/.55,2))*Math.max(0,1-r));
  data.set([a,a,a,255],(y*size+x)*4);
 }
 const texture=new THREE.DataTexture(data,size,size);
 texture.needsUpdate=true;
 return texture;
}

/**
 * The blush patches ship clear. Here they get a rose tint that fades out from the middle
 * of each cheek; they never write depth, so the ink pass draws no outline round them.
 */
export function findBlush(root){
 const found=[];
 root?.traverse?.(object=>{if(object.isMesh&&/Blush/.test(object.name||''))found.push(object);});
 if(!found.length)return null;
 const material=new THREE.MeshBasicMaterial({color:0xf0707f,alphaMap:blushTexture(),transparent:true,opacity:0,
  depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 for(const mesh of found){mesh.material=material;mesh.visible=false;mesh.renderOrder=1;}
 return {meshes:found,material};
}

/**
 * @param {object} options
 * @param {THREE.Object3D} [options.model] hierarchy to search for ARKit blendshapes
 * @param {{apply:(w:FaceWeights)=>void}} [options.face] procedural face, used when there are none
 * @param {ThuanExpression} [options.expression]
 * @param {() => number} [options.random] injectable for deterministic tests
 */
export function createThuanFaceController({model=null,face=null,expression='neutral',random=Math.random}={}){
 const morph=findMorphTargets(model),blush=findBlush(model);
 /** @type {FaceWeights} */
 const weights={blink:0,...EXPRESSIONS.neutral,mouthFunnel:0};
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
  if(blush){
   const value=THREE.MathUtils.clamp(weights.blush||0,0,1);
   blush.material.opacity=value*.55;
   for(const mesh of blush.meshes)mesh.visible=value>.01;
  }
  if(morph){
   for(const {mesh,indices} of morph.meshes){
    const influences=mesh.morphTargetInfluences;
    for(const [weight,list] of Object.entries(indices)){
     const value=THREE.MathUtils.clamp(weights[weight]||0,0,1);
     for(const index of list)influences[index]=value;
    }
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
   for(const key of FACE_KEYS){
    if(key==='mouthOpen')continue;
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
