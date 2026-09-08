import * as THREE from '../../vendor/three.module.js';

// These motions belong to this supplied skeleton. The player controller owns
// world movement, so horizontal root motion must not pull the skin off its collider.
export function prepareProtagonistAnimations(asset){
 const hips=asset.scene.getObjectByName('Hips');
 const clips=asset.animations.filter(c=>c.name!=='restpose').map(source=>{
  const clip=source.clone();clip.name=({Walking:'Walk',Running:'Run',Big_Heart_Gesture:'Wave'})[clip.name]||clip.name;
  for(const track of clip.tracks)if(track.name==='Hips.position')for(let i=0;i<track.values.length;i+=3){track.values[i]=hips.position.x;track.values[i+2]=hips.position.z;}
  return clip;
 });
 // The opening of the supplied heart gesture is a relaxed, feet-planted stance.
 // Hold its translations and add only a little breathing; never scale the body.
 const reference=clips.find(c=>c.name==='Wave')||clips.find(c=>c.name==='Walk');
 if(reference){
  const duration=4,times=Array.from({length:49},(_,i)=>i*duration/48);
  const tracks=reference.tracks.map(track=>{
   const rest=Array.from(track.createInterpolant().evaluate(0)),values=[];
   for(const t of times){
    if(track.name==='Spine.quaternion'||track.name==='Head.quaternion'){
     const q=new THREE.Quaternion().fromArray(rest),phase=t/duration*Math.PI*2;
     q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.008*Math.sin(phase),0,track.name==='Head.quaternion'?.012*Math.sin(phase):0))).normalize();values.push(...q.toArray());
    }else values.push(...rest);
   }
   return new track.constructor(track.name,times,values,track.getInterpolation());
  });
  clips.push(new THREE.AnimationClip('Idle_Neutral',duration,tracks));
 }
 return clips;
}
