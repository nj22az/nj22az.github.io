import * as THREE from '../../vendor/three.module.js';

const B={
 hips:'J_Bip_C_Hips',spine:'J_Bip_C_Spine',chest:'J_Bip_C_Chest',head:'J_Bip_C_Head',
 leftArm:'J_Bip_L_UpperArm',leftForearm:'J_Bip_L_LowerArm',rightArm:'J_Bip_R_UpperArm',rightForearm:'J_Bip_R_LowerArm',
 leftLeg:'J_Bip_L_UpperLeg',leftKnee:'J_Bip_L_LowerLeg',rightLeg:'J_Bip_R_UpperLeg',rightKnee:'J_Bip_R_LowerLeg'
};

const RESTING_ARMS=Object.freeze({[B.leftArm]:[0,0,-1.12],[B.rightArm]:[0,0,1.12]});

function rotationTrack(scene,name,times,deltas){
 const bone=scene.getObjectByName(name);if(!bone)return null;
 const rest=bone.quaternion.clone(),values=[];
 for(const delta of deltas)values.push(...rest.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...delta))).normalize().toArray());
 return new THREE.QuaternionKeyframeTrack(name+'.quaternion',times,values);
}

function clip(scene,name,duration,poses,positions={}){
 const times=poses.map((_,i)=>i*duration/(poses.length-1)),tracks=[];
 // Every action owns the whole humanoid pose. The actor briefly samples Sit to
 // measure chair support during setup; omitting an idle leg/hip track would leave
 // that sampled chair pose behind when the standing action starts.
 const bones=new Set(Object.values(B));
 for(const bone of bones){
  const values=poses.map(p=>p[bone]||RESTING_ARMS[bone]||[0,0,0]);
  const track=rotationTrack(scene,bone,times,values);if(track)tracks.push(track);
 }
 const positionTracks={...positions};
 if(!positionTracks[B.hips])positionTracks[B.hips]=poses.map(()=>[0,0,0]);
 for(const [bone,offsets] of Object.entries(positionTracks)){
  const node=scene.getObjectByName(bone);if(!node)continue;
  const values=[];for(const offset of offsets)values.push(node.position.x+offset[0],node.position.y+offset[1],node.position.z+offset[2]);
  tracks.push(new THREE.VectorKeyframeTrack(bone+'.position',times,values));
 }
 return new THREE.AnimationClip(name,duration,tracks).optimize();
}

function cloneAs(source,name){const result=source.clone();result.name=name;return result;}

/**
 * VRoid exports a humanoid rest skeleton but no actions. These restrained local
 * clips give Nao a grounded town gait without altering the supplied VRM file.
 */
export function prepareNaoAnimations(asset){
 const s=asset.scene;
 const idle=clip(s,'Idle_Neutral',5,[
  {[B.spine]:[-.018,0,-.012],[B.chest]:[.012,0,.008],[B.head]:[.015,-.035,.008]},
  {[B.spine]:[.012,.018,.009],[B.chest]:[-.008,-.012,-.006],[B.head]:[-.012,.045,-.006]},
  {[B.spine]:[-.018,0,-.012],[B.chest]:[.012,0,.008],[B.head]:[.015,-.035,.008]}
 ]);
 const counter=clip(s,'CounterIdle',6,[
  {[B.spine]:[-.025,.02,0],[B.head]:[.01,-.04,0],[B.leftForearm]:[0,-.08,-.15],[B.rightForearm]:[0,.08,.15]},
  {[B.spine]:[-.01,-.015,.012],[B.head]:[-.015,.05,-.008],[B.leftForearm]:[.03,-.08,-.18],[B.rightForearm]:[-.03,.08,.18]},
  {[B.spine]:[-.025,.02,0],[B.head]:[.01,-.04,0],[B.leftForearm]:[0,-.08,-.15],[B.rightForearm]:[0,.08,.15]}
 ]);
 const walk=clip(s,'Walk',1,[
  {[B.hips]:[0,.04,0],[B.leftArm]:[-.38,0,-1.12],[B.rightArm]:[.38,0,1.12],[B.leftLeg]:[.48,0,0],[B.rightLeg]:[-.48,0,0]},
  {[B.hips]:[0,-.04,0],[B.leftArm]:[.38,0,-1.12],[B.rightArm]:[-.38,0,1.12],[B.leftLeg]:[-.48,0,0],[B.rightLeg]:[.48,0,0]},
  {[B.hips]:[0,.04,0],[B.leftArm]:[-.38,0,-1.12],[B.rightArm]:[.38,0,1.12],[B.leftLeg]:[.48,0,0],[B.rightLeg]:[-.48,0,0]}
 ],{[B.hips]:[[0,0,0],[0,.018,0],[0,0,0]]});
 const run=clip(s,'Run',.72,[
  {[B.spine]:[-.1,0,0],[B.leftArm]:[-.65,0,-1.05],[B.rightArm]:[.65,0,1.05],[B.leftLeg]:[.72,0,0],[B.rightLeg]:[-.72,0,0]},
  {[B.spine]:[-.1,0,0],[B.leftArm]:[.65,0,-1.05],[B.rightArm]:[-.65,0,1.05],[B.leftLeg]:[-.72,0,0],[B.rightLeg]:[.72,0,0]},
  {[B.spine]:[-.1,0,0],[B.leftArm]:[-.65,0,-1.05],[B.rightArm]:[.65,0,1.05],[B.leftLeg]:[.72,0,0],[B.rightLeg]:[-.72,0,0]}
 ],{[B.hips]:[[0,0,0],[0,.035,0],[0,0,0]]});
 const wave=clip(s,'Wave',1.8,[
  {[B.rightArm]:[0,0,-.2],[B.rightForearm]:[0,0,-1.25],[B.head]:[0,.08,0]},
  {[B.rightArm]:[0,0,-.2],[B.rightForearm]:[-.2,0,-1.05],[B.head]:[0,-.04,0]},
  {[B.rightArm]:[0,0,-.2],[B.rightForearm]:[.2,0,-1.35],[B.head]:[0,.06,0]},
  {[B.rightArm]:[0,0,-.2],[B.rightForearm]:[0,0,-1.25],[B.head]:[0,.08,0]}
 ]);
 const sit=clip(s,'Sit',4,[
  {[B.leftLeg]:[-1.3,0,0],[B.rightLeg]:[-1.3,0,0],[B.leftKnee]:[1.3,0,0],[B.rightKnee]:[1.3,0,0],[B.spine]:[-.04,0,0]},
  {[B.leftLeg]:[-1.3,0,0],[B.rightLeg]:[-1.3,0,0],[B.leftKnee]:[1.3,0,0],[B.rightKnee]:[1.3,0,0],[B.spine]:[-.02,.02,.01]},
  {[B.leftLeg]:[-1.3,0,0],[B.rightLeg]:[-1.3,0,0],[B.leftKnee]:[1.3,0,0],[B.rightKnee]:[1.3,0,0],[B.spine]:[-.04,0,0]}
 ],{[B.hips]:[[0,-.42,0],[0,-.42,0],[0,-.42,0]]});
 const clips=[idle,counter,walk,run,wave,sit];
 for(const name of ['CounterIdle.1','CounterIdle.2'])clips.push(cloneAs(counter,name));
 // A pose name does not imply a chair. `Use` is used while Nao wipes Minato's
 // counter and `Read`/`Phone`/`Fish` can be selected at standing town objects. They
 // previously cloned Sit, leaving her knees bent in mid-air with no seat support.
 for(const name of ['Wake','Eat','Drink','Sleep'])clips.push(cloneAs(sit,name));
 for(const name of ['Type','Read','Use','Phone','Fish'])clips.push(cloneAs(counter,name));
 for(const name of ['DrinkStanding','EatStanding','CarryIdle','Rest','Greet'])clips.push(cloneAs(idle,name));
 for(const name of ['CarryWalk','Stroll'])clips.push(cloneAs(walk,name));
 return clips;
}
