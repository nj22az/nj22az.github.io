import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

// A single, unhurried greeting; the existing body rig and idle remain authoritative.
export const YURI_GREETING_DURATION=1.6;

// Bake a chair pose using the supplied skeleton's model-space axes. The skin,
// bind pose and original locomotion clips are unchanged.
function sittingClip(asset,idle,name='Sit',carrying=false){
 const pose=clone(asset.scene),clip=idle.clone();clip.name=name;
 const samples=idle.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
 const offsets=carrying?{LeftArm:[-.60,0,0],RightArm:[-.60,0,0],LeftForeArm:[-.85,0,0],RightForeArm:[-.85,0,0]}:{LeftUpLeg:[-Math.PI/2,0,0],RightUpLeg:[-Math.PI/2,0,0],LeftLeg:[Math.PI/2,0,0],RightLeg:[Math.PI/2,0,0],LeftFoot:[0,0,0],RightFoot:[0,0,0],LeftArm:[-.30,0,0],RightArm:[-.30,0,0],LeftForeArm:[-.85,0,0],RightForeArm:[-.85,0,0]};
 const values=new Map(Object.keys(offsets).map(n=>[n,[]])),times=Array.from({length:49},(_,i)=>i*idle.duration/48);
 for(const t of times){
  for(const {sample,binding} of samples)binding.setValue(sample.evaluate(t),0);
  pose.updateMatrixWorld(true);
  const footRest=new Map(['LeftFoot','RightFoot'].map(n=>[n,pose.getObjectByName(n)?.getWorldQuaternion(new THREE.Quaternion())]));
  for(const [name,angles] of Object.entries(offsets)){
   const bone=pose.getObjectByName(name);if(!bone)continue;
   const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());
   let delta=new THREE.Quaternion().setFromEuler(new THREE.Euler(...angles));
   if(!carrying&&/^(Left|Right)(UpLeg|Leg)$/.test(name)){
    const end=pose.getObjectByName(name.replace('UpLeg','Leg')===name?name.replace('Leg','Foot'):name.replace('UpLeg','Leg'));
    const direction=end.getWorldPosition(new THREE.Vector3()).sub(bone.getWorldPosition(new THREE.Vector3())).normalize();
    delta.setFromUnitVectors(direction,name.endsWith('UpLeg')?new THREE.Vector3(0,-.38,Math.sqrt(1-.38**2)):new THREE.Vector3(0,-1,0));
   }
   if(!carrying&&name.endsWith('Foot'))delta=footRest.get(name).clone().multiply(bone.getWorldQuaternion(new THREE.Quaternion()).invert());
   bone.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();
   bone.updateWorldMatrix(false,true);values.get(name).push(...bone.quaternion.toArray());
  }
 }
 for(const {binding} of samples)binding.unbind();
 for(const [name,rotations] of values)if(rotations.length){clip.tracks=clip.tracks.filter(t=>t.name!==name+'.quaternion');clip.tracks.push(new THREE.QuaternionKeyframeTrack(name+'.quaternion',times,rotations));}
 return clip;
}

function greetingClip(asset,idle){
  const duration=YURI_GREETING_DURATION,greeting=idle.clone();greeting.name='Wave';
  for(const track of greeting.tracks)for(let i=0;i<track.times.length;i++)track.times[i]*=duration/idle.duration;
  // Bake in model space, then convert into each bone's parent space. Meshy's
  // shoulder/elbow axes are not aligned with the model or with one another.
  const pose=clone(asset.scene),bones=new Map();
  pose.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
  const names=['RightArm','RightForeArm','RightHand','Head'];
  const times=Array.from({length:97},(_,i)=>i*duration/96),values=new Map(names.map(name=>[name,[]]));
  const smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
  // Sample every channel explicitly: an AnimationMixer may skip unchanged
  // static channels, which would accumulate our offsets while baking.
  const samples=idle.tracks.map(track=>({interpolant:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
  for(const t of times){
    for(const {interpolant,binding} of samples)binding.setValue(interpolant.evaluate(t/duration*idle.duration),0);
    pose.updateMatrixWorld(true);
    const lift=smooth(t/.36)*(1-smooth((t-1.02)/.5));
    const wavePhase=THREE.MathUtils.clamp((t-.38)/.62,0,1);
    const wave=Math.sin(wavePhase*Math.PI)**2*Math.sin(wavePhase*Math.PI*4);
    const head=smooth(t/.48)*(1-smooth((t-.94)/.56));
    const offsets={RightArm:[-.18*lift,0,-.34*lift],RightForeArm:[-2.1*lift,0,0],RightHand:[0,0,.18*wave],Head:[.045*head,0,.065*head]};
    for(const name of names){
      const bone=bones.get(name);if(!bone)continue;
      const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());
      const delta=new THREE.Quaternion().setFromEuler(new THREE.Euler(...offsets[name]));
      bone.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();
      bone.updateWorldMatrix(false,true);values.get(name).push(...bone.quaternion.toArray());
    }
  }
  for(const {binding} of samples)binding.unbind();
  // Replace only the expressive upper-body rotations. Preserve feet, hips,
  // skinning, translation/scale tracks, and the authored breathing underneath.
  for(const name of names){
    if(!values.get(name).length)continue;
    const trackName=name+'.quaternion';
    greeting.tracks=greeting.tracks.filter(track=>track.name!==trackName);
    greeting.tracks.push(new THREE.QuaternionKeyframeTrack(trackName,times,values.get(name)));
  }
  greeting.duration=duration;return greeting;
}

// These clips belong to the supplied Meshy skeleton. Do not retarget other rigs.
export function prepareYuriAnimations(asset){
  asset.scene.updateMatrixWorld(true);
  const bones=[];asset.scene.traverse(o=>{if(o.isBone)bones.push(o);});
  const poseClip=(name,duration,greeting=false)=>{
    const tracks=[],times=Array.from({length:49},(_,i)=>i*duration/48);
    for(const bone of bones){
      const rotations=[],rest=bone.quaternion.clone();
      // Meshy exports a T-pose. Lower the arms in model space before adding
      // subtle motion; local axes differ between the mirrored shoulders.
      if(bone.name==='LeftArm'||bone.name==='RightArm'){
        const parentWorld=bone.parent.getWorldQuaternion(new THREE.Quaternion());
        const lower=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),bone.name==='LeftArm'?-1.30:1.30);
        rest.premultiply(parentWorld.clone().invert().multiply(lower).multiply(parentWorld));
      }
      for(const t of times){
        const phase=t/duration*Math.PI*2,envelope=Math.sin(Math.PI*t/duration)**2;
        let x=0,z=0;
        if(bone.name==='Head'){x=greeting?.10*envelope:.014*Math.sin(phase);z=greeting?.075*envelope:.022*Math.sin(phase);}
        if(bone.name==='Spine'){x=.009*Math.sin(phase);}
        if(greeting&&bone.name==='RightHand')z=.13*envelope*Math.sin(phase*2);
        const q=rest.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x,0,z)));
        rotations.push(...q.toArray());
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',times,rotations));
      tracks.push(new THREE.VectorKeyframeTrack(bone.name+'.position',[0,duration],[...bone.position.toArray(),...bone.position.toArray()]));
    }
    return new THREE.AnimationClip(name,duration,tracks);
  };
  const locomotion=asset.animations.map(source=>{
    const clip=source.clone();
    // Entity movement owns world travel. Keep authored vertical footfall motion.
    for(const track of clip.tracks)if(track.name==='Hips.position'){
      for(let i=0;i<track.values.length;i+=3){track.values[i]=track.values[0];track.values[i+2]=track.values[2];}
    }
    return clip;
  });
  const authoredIdle=locomotion.find(clip=>clip.name==='Idle_Neutral');
  if(authoredIdle)return [...locomotion,greetingClip(asset,authoredIdle),sittingClip(asset,authoredIdle),sittingClip(asset,authoredIdle,'CarryIdle',true),sittingClip(asset,locomotion.find(c=>c.name==='Walk')||authoredIdle,'CarryWalk',true)];
  return [...locomotion,poseClip('Idle_Neutral',4),poseClip('Wave',1.2,true)];
}
