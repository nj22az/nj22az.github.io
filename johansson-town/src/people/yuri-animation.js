import * as THREE from '../../vendor/three.module.js';

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
  return [...locomotion,poseClip('Idle_Neutral',4),poseClip('Wave',1.2,true)];
}
