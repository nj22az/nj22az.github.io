import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

/**
 * Alternate takes of the standing idle.
 *
 * Nine of these people stand around the town at any hour, and every one of them was
 * playing the same authored two-second loop -- the whole cast breathing in unison, in
 * step, forever. One loop is what makes a crowd read as scenery.
 *
 * Each take puts the weight somewhere else: the pelvis tilts, the chest counter-leans
 * over it, the head glances off, and the arms hang a little differently. The thighs
 * take the pelvis rotation back out, because the legs hang off it and turning it
 * otherwise drags the feet across the pavement. The takes also run at different
 * lengths, so two people standing near each other cannot fall into step.
 *
 * @returns {THREE.AnimationClip[]} the takes, named Idle_Neutral.1 and .2
 */
function standingTakes(asset,idle){
 const WEIGHT=[{hip:-.05,lean:.034,glance:.12,arm:.055,stretch:1.38},
               {hip:.04,lean:-.03,glance:-.09,arm:-.04,stretch:1.16}];
 const takes=[];
 for(const [index,w] of WEIGHT.entries()){
  const pose=clone(asset.scene);
  const twist=(name,rotation)=>{
   const bone=pose.getObjectByName(name);if(!bone)return;
   const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());
   bone.quaternion.premultiply(parent.clone().invert().multiply(rotation).multiply(parent)).normalize();
   bone.updateWorldMatrix(false,true);
  };
  const names=['Hips','Chest','Head','UpperArmL','UpperArmR','LowerArmL','LowerArmR','UpperLegL','UpperLegR'];
  const span=idle.duration*w.stretch,steps=24;
  const at=Array.from({length:steps+1},(_,i)=>i*span/steps),values=new Map(names.map(n=>[n,[]]));
  const samples=idle.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
  // Whatever the source idle does not animate has to be put back by hand each sample.
  //
  // This rig's idle carries no Hips track at all, so nothing reset the pelvis between
  // frames and every frame's tilt landed on top of the last one: the take sank half a
  // metre into the ground over one loop. Only the channels a clip actually holds are
  // restored by its own bindings; the rest keep whatever was last written to them.
  const tracked=new Set(idle.tracks.map(track=>track.name));
  const held=names.filter(n=>!tracked.has(n+'.quaternion'))
   .map(n=>({bone:pose.getObjectByName(n)})).filter(e=>e.bone)
   .map(e=>({bone:e.bone,rest:e.bone.quaternion.clone()}));
  for(const t of at){
   for(const {sample,binding} of samples)binding.setValue(sample.evaluate(t/span*idle.duration),0);
   for(const {bone,rest} of held)bone.quaternion.copy(rest);
   pose.updateMatrixWorld(true);
   const drift=Math.sin(t/span*Math.PI*2+index*1.9);
   const pelvis=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,w.hip*.6,w.hip));
   twist('Hips',pelvis);
   const back=pelvis.clone().invert();
   for(const leg of ['UpperLegL','UpperLegR'])twist(leg,back);
   twist('Chest',new THREE.Quaternion().setFromEuler(new THREE.Euler(.008*drift,-w.hip*.5,w.lean)));
   twist('Head',new THREE.Quaternion().setFromEuler(new THREE.Euler(.01*drift,w.glance,-w.lean*.4)));
   for(const side of ['L','R']){
    const sign=side==='L'?1:-1;
    twist('UpperArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(w.arm*sign,0,w.arm*.5*sign)));
    twist('LowerArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(w.arm*.8*sign,0,0)));
   }
   for(const n of names){const bone=pose.getObjectByName(n);if(bone)values.get(n).push(...bone.quaternion.toArray());}
  }
  for(const {binding} of samples)binding.unbind();
  const clip=idle.clone();clip.name='Idle_Neutral.'+(index+1);clip.duration=span;
  for(const track of clip.tracks)for(let i=0;i<track.times.length;i++)track.times[i]*=span/idle.duration;
  // Only the rotations these takes rewrite. Matching on the bone alone also caught
  // Hips.position, which is what carries the body off the floor -- drop that and the
  // whole person collapses to the origin.
  const rewritten=new Set([...values].filter(([,v])=>v.length).map(([n])=>n+'.quaternion'));
  clip.tracks=clip.tracks.filter(track=>!rewritten.has(track.name));
  for(const [n,rotations] of values)if(rotations.length)clip.tracks.push(new THREE.QuaternionKeyframeTrack(n+'.quaternion',at,rotations));
  takes.push(clip);
 }
 return takes;
}

// Keep the low-poly rigs' own locomotion. Add seated social poses on their
// original bones, including the independently parented foot controls.
export function prepareResidentAnimations(asset){
 const idle=asset.animations.find(clip=>clip.name==='Idle_Neutral');if(!idle)return asset.animations;
 const pose=clone(asset.scene);
 const point=name=>pose.getObjectByName(name).getWorldPosition(new THREE.Vector3());
 const rotate=(name,delta)=>{const bone=pose.getObjectByName(name),parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());bone.quaternion.premultiply(parent.clone().invert().multiply(delta).multiply(parent)).normalize();bone.updateWorldMatrix(false,true);};
 const result=[...asset.animations],duration=4,times=Array.from({length:25},(_,i)=>i*duration/24);
 result.push(...standingTakes(asset,idle));
 for(const name of ['Sleep','Wake','Sit','Type','Eat','Drink','Read','Use','Phone','Fish','DrinkStanding','EatStanding','CarryIdle','CarryWalk']){
  const sleeping=name==='Sleep',seated=['Wake','Sit','Type','Eat','Drink'].includes(name),base=name==='CarryWalk'?(asset.animations.find(c=>c.name==='Walk')||idle):idle;
  const samples=base.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
  const names=['UpperArmL','LowerArmL','UpperArmR','LowerArmR',...((seated||sleeping)?['UpperLegL','LowerLegL','UpperLegR','LowerLegR']:[]),...(seated?['FootL','FootR']:[]),...(sleeping?['Head','Chest']:[])];
  const tracks=new Map(names.map(n=>[n+'.quaternion',[]]));if(seated)for(const side of ['L','R'])tracks.set('Foot'+side+'.position',[]);
  for(const t of times){
   for(const {sample,binding} of samples)binding.setValue(sample.evaluate(t/duration*base.duration),0);pose.updateMatrixWorld(true);
   for(const side of ['L','R']){
    if(seated){
    const upper='UpperLeg'+side,lower='LowerLeg'+side,foot='Foot'+side,hip=point(upper),knee=point(lower),ankle=point(foot);
    const thigh=knee.distanceTo(hip),calf=ankle.distanceTo(knee),footBone=pose.getObjectByName(foot),footRotation=footBone.getWorldQuaternion(new THREE.Quaternion());
    const lowerAxis=ankle.clone().sub(knee).normalize().applyQuaternion(pose.getObjectByName(lower).getWorldQuaternion(new THREE.Quaternion()).invert());
    const targetKnee=hip.clone().add(new THREE.Vector3(0,-.25,Math.sqrt(1-.25**2)).multiplyScalar(thigh));
    rotate(upper,new THREE.Quaternion().setFromUnitVectors(knee.clone().sub(hip).normalize(),targetKnee.clone().sub(hip).normalize()));
    const currentAxis=lowerAxis.applyQuaternion(pose.getObjectByName(lower).getWorldQuaternion(new THREE.Quaternion()));
    rotate(lower,new THREE.Quaternion().setFromUnitVectors(currentAxis,new THREE.Vector3(0,-1,0)));
    const targetFoot=point(lower).add(new THREE.Vector3(0,-calf,0));
    footBone.position.copy(footBone.parent.worldToLocal(targetFoot));
    footBone.quaternion.copy(footBone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(footRotation));footBone.updateWorldMatrix(false,true);
    }
    if(sleeping){
     const breath=Math.sin(t/duration*Math.PI*2),sign=side==='L'?-1:1;
     rotate('UpperArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(.34+.012*breath,0,sign*.10)));
     rotate('LowerArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(.62+.018*breath,0,-sign*.035)));
     rotate('UpperLeg'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(side==='R'?.07:.025,0,sign*.018)));
     rotate('LowerLeg'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(side==='R'?.13:.055,0,0)));
    }else{
     const lift=side==='R'&&name!=='Sit'?(1-Math.cos(t/duration*Math.PI*2))*.5:0;
     const carry=name.startsWith('Carry'),phone=name==='Phone'&&side==='R',read=['Read','Fish'].includes(name);
     const typing=name==='Type',tap=Math.sin(t/duration*Math.PI*12+(side==='L'?0:Math.PI))*.035;
     const upper=typing?-.48+tap:name==='Wake'?-.4-.7*Math.sin(Math.PI*t/duration)**2:carry?-.55:phone?-.6:read?-.4:-.25-.25*lift,lower=typing?-.95-tap:carry?-1.0:phone?-1.8:read?-1.1:-.75-.80*lift;
     rotate('UpperArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(upper,0,0)));
     rotate('LowerArm'+side,new THREE.Quaternion().setFromEuler(new THREE.Euler(lower,0,0)));
    }
   }
   if(sleeping){const breath=Math.sin(t/duration*Math.PI*2);rotate('Head',new THREE.Quaternion().setFromEuler(new THREE.Euler(.015*breath,.055,0)));rotate('Chest',new THREE.Quaternion().setFromEuler(new THREE.Euler(.012*breath,0,0)));}
   for(const [key,values] of tracks){const split=key.lastIndexOf('.'),bone=pose.getObjectByName(key.slice(0,split));values.push(...bone[key.slice(split+1)].toArray());}
  }
  const clip=base.clone();clip.name=name;for(const track of clip.tracks)for(let i=0;i<track.times.length;i++)track.times[i]*=duration/base.duration;
  clip.tracks=clip.tracks.filter(track=>!tracks.has(track.name));
  for(const [key,values] of tracks)clip.tracks.push(key.endsWith('.position')?new THREE.VectorKeyframeTrack(key,times,values):new THREE.QuaternionKeyframeTrack(key,times,values));
  clip.duration=duration;result.push(clip);
  for(const {binding} of samples)binding.unbind();
 }
 return result;
}
