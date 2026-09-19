import * as THREE from '../../vendor/three.module.js';
import {sittingClip} from './yuri-animation.js';
import {fingerTracks} from './thuan-fingers.js';
import {clone} from '../../vendor/SkeletonUtils.js';

function aim(bone,child,target){
 const start=bone.getWorldPosition(new THREE.Vector3()),from=child.getWorldPosition(new THREE.Vector3()).sub(start).normalize(),to=target.clone().sub(start).normalize();
 const desired=new THREE.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(desired));bone.updateWorldMatrix(false,true);
}

function solveArm(model,side,wrist,pole,palm){
 const upper=model.getObjectByName(side+'Arm'),lower=model.getObjectByName(side+'ForeArm'),hand=model.getObjectByName(side+'Hand');
 if(!upper||!lower||!hand)return;
 const shoulder=upper.getWorldPosition(new THREE.Vector3()),elbow=lower.getWorldPosition(new THREE.Vector3()),current=hand.getWorldPosition(new THREE.Vector3());
 const a=shoulder.distanceTo(elbow),b=elbow.distanceTo(current),direction=wrist.clone().sub(shoulder);
 const distance=THREE.MathUtils.clamp(direction.length(),Math.abs(a-b)+.008,a+b-.008);direction.normalize();
 const elbowPole=pole.clone().addScaledVector(direction,-pole.dot(direction)).normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),bend=Math.sqrt(Math.max(0,a*a-along*along));
 aim(upper,lower,shoulder.clone().addScaledVector(direction,along).addScaledVector(elbowPole,bend));
 aim(lower,hand,shoulder.clone().addScaledVector(direction,distance));
 if(palm){
  const rotation=palm.clone();
  hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rotation));hand.updateWorldMatrix(false,true);
 }
}

function worldPalm(forward,normal,side){
 const y=forward.clone().normalize(),z=normal.clone().addScaledVector(y,-normal.dot(y)).normalize(),x=new THREE.Vector3().crossVectors(y,z);
 // Meshy's palm normal is local +/-X, rather than local Z.
 const localNormal=new THREE.Vector3(side,0,0),up=new THREE.Vector3(0,1,0);
 const localBasis=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(up,localNormal),up,localNormal));
 return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z)).multiply(localBasis.invert());
}

function worldDelta(bone,euler){
 const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion());
 bone.quaternion.premultiply(parent.clone().invert().multiply(new THREE.Quaternion().setFromEuler(euler)).multiply(parent)).normalize();
 bone.updateWorldMatrix(false,true);
}

function poseShopkeeper(pose,kind,t,duration){
 const spine=pose.getObjectByName('Spine'),head=pose.getObjectByName('Head');
 const breath=Math.sin(t/duration*Math.PI*2),shift=Math.sin(t/duration*Math.PI*2+1.1);
 // Slow breathing and a small asymmetric upper-body settle, without moving
 // the planted feet or dropping the pelvis into the source crouch animation.
 const lean=kind==='counter'?.065:0;
 if(spine)worldDelta(spine,new THREE.Euler(.012*breath+lean-.018,.022,.035+.012*shift));
 if(head)worldDelta(head,new THREE.Euler(.012*breath,.018*shift,-.018));
 const hip=pose.getObjectByName('LeftUpLeg')?.getWorldPosition(new THREE.Vector3())||new THREE.Vector3(.05,.88,0);
 const rightHip=pose.getObjectByName('RightUpLeg')?.getWorldPosition(new THREE.Vector3())||new THREE.Vector3(-.06,.88,0);
 // Rest beside and slightly in front of the dress. A wrist at the hip joint
 // buries the palm and downward-pointing fingers inside the flared skirt.
 const leftWrist=hip.clone().add(new THREE.Vector3(.20,.105+.006*breath,.16));
 const rightWrist=kind==='counter'?new THREE.Vector3(-.10,1.09,.50):rightHip.clone().add(new THREE.Vector3(-.20,.045,.14+.005*shift));
 const relaxedPalm=side=>worldPalm(new THREE.Vector3(side*.10,-1,.12),new THREE.Vector3(-side,.08,.10),side);
 solveArm(pose,'Left',leftWrist,new THREE.Vector3(.20,-.18,-.22),relaxedPalm(1));
 solveArm(pose,'Right',rightWrist,kind==='counter'?new THREE.Vector3(-.22,-.32,.25):new THREE.Vector3(-.20,-.18,-.20),kind==='counter'?worldPalm(new THREE.Vector3(.06,-.18,1),new THREE.Vector3(0,-1,.04),-1):relaxedPalm(-1));
}

function bakeIdle(asset,source,name,kind,duration){
 const pose=clone(asset.scene),clip=source.clone();clip.name=name;clip.duration=duration;
 const samples=source.tracks.map(track=>({sample:track.createInterpolant(),binding:THREE.PropertyBinding.create(pose,track.name)}));
 const names=['Hips','Spine','Head','LeftShoulder','RightShoulder','LeftArm','RightArm','LeftForeArm','RightForeArm','LeftHand','RightHand'];
 const times=Array.from({length:61},(_,i)=>i*duration/60),values=new Map(names.map(n=>[n,[]]));
 for(const t of times){
  // The six-second baked loop must not inherit the four-second hold's seam.
  for(const {sample,binding} of samples)binding.setValue(sample.evaluate(0),0);
  pose.updateMatrixWorld(true);
  poseShopkeeper(pose,kind,t,duration);
  for(const n of names){const bone=pose.getObjectByName(n);if(bone)values.get(n).push(...bone.quaternion.toArray());}
 }
 for(const {binding} of samples)binding.unbind();
 for(const n of names){
  if(!values.get(n).length)continue;
  clip.tracks=clip.tracks.filter(track=>track.name!==n+'.quaternion');
  clip.tracks.push(new THREE.QuaternionKeyframeTrack(n+'.quaternion',times,values.get(n)));
 }
 const fidget=(t,side,finger,segment)=>{
  const onDesk=kind==='counter'&&side==='Right';
  const rest=onDesk?.20:.26;
  const wave=Math.sin((t/duration*Math.PI*2)+(side==='Left'?0:1.3)+segment*.4)*.025;
  return rest+wave;
 };
 clip.tracks=clip.tracks.filter(track=>!/Hand(Thumb|Index|Middle|Ring|Pinky)/.test(track.name));
 clip.tracks.push(...fingerTracks(asset.scene,times,fidget));
 return clip;
}

function stillFingers(asset,clip,amount){
 const times=[0,clip.duration];
 clip.tracks=clip.tracks.filter(track=>!/Hand(Thumb|Index|Middle|Ring|Pinky)/.test(track.name));
 clip.tracks.push(...fingerTracks(asset.scene,times,()=>amount));
 return clip;
}

// This export already has lowered arms. Its unnamed clip is a low crouch, not
// a standing idle. Use its actual rest pose and keep its own locomotion/seat.
export function prepareMergedYuriAnimations(asset){
 const rest=asset.animations.find(c=>c.name==='restpose');
 if(!rest)throw Error('Thuan merged model is missing its rest pose');
 const hips=rest.tracks.find(t=>t.name==='Hips.position').values;
 const clips=asset.animations.map(source=>{
  const clip=source.clone();
  // The town entity owns travel. Give every action the same horizontal origin
  // so switching from a chair or a greeting cannot move her through furniture.
  for(const track of clip.tracks)if(track.name==='Hips.position'){
   for(let i=0;i<track.values.length;i+=3){track.values[i]=hips[0];track.values[i+2]=hips[2];}
  }
  return clip.optimize();
 });
 const alias=(source,name)=>{const clip=clips.find(c=>c.name===source)?.clone();if(!clip)throw Error('Thuan merged model is missing '+source);clip.name=name;clips.push(clip);return clip;};
 const hold=alias('restpose','Idle_Hold');hold.duration=4;
 for(const track of hold.tracks){
  const value=track.values.slice(0,track.getValueSize());track.times=new Float32Array([0,4]);track.values=new Float32Array([...value,...value]);
 }
 for(const [bone,amount] of [['Spine',.008],['Head',.012]]){
  const track=hold.tracks.find(t=>t.name===bone+'.quaternion'),restRotation=new THREE.Quaternion().fromArray(track.values),times=[],values=[];
  for(let i=0;i<=24;i++){
   const t=i/24*4;times.push(t);values.push(...restRotation.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(amount*Math.sin(t/4*Math.PI*2),0,0))).toArray());
  }
  track.times=new Float32Array(times);track.values=new Float32Array(values);
 }
 const idle=bakeIdle(asset,hold,'Idle_Neutral','hip',6);clips.push(idle);
 const counter=bakeIdle(asset,hold,'CounterIdle','counter',6);clips.push(counter);
 alias('Walking','Walk');alias('Running','Run');alias('Big_Wave_Hello','Wave');
 // Three takes shipped in this model and were never given a name the game asks for.
 //
 // Casual_Walk is a real unhurried walk, three cycles of it, and at 0.45 m/s on the
 // ground it is what she should be doing on the way to the park rather than the
 // 0.63 m/s march slowed down until the feet drag. Catching_Breath is the stop at the
 // end of it. Big_Heart_Gesture is a second greeting, so that saying hello twice is
 // not the same five seconds twice.
 alias('Casual_Walk','Stroll');
 alias('Catching_Breath','Rest');
 alias('Big_Heart_Gesture','Greet');
 stillFingers(asset,clips.find(c=>c.name==='Walk'),.78);
 stillFingers(asset,clips.find(c=>c.name==='Run'),.7);
 stillFingers(asset,clips.find(c=>c.name==='Wave'),.45);
 stillFingers(asset,clips.find(c=>c.name==='Stroll'),.74);
 stillFingers(asset,clips.find(c=>c.name==='Rest'),.6);
 stillFingers(asset,clips.find(c=>c.name==='Greet'),.5);
 const sit=alias('Chair_Sit_Idle_F','Sit');
 // The full take crosses the legs and folds the chest onto a raised hand.
 // Keep its relaxed opening, with a seamless, slow return through the same
 // samples. That gives the shop chair a quiet idle instead of a deep slump.
 sit.duration=6;
 for(const track of sit.tracks){
  const sample=track.createInterpolant(),times=[],values=[];
  for(let i=0;i<=60;i++){const t=i/10;times.push(t);values.push(...sample.evaluate(1-Math.cos(t/6*Math.PI*2)));}
  track.times=new Float32Array(times);track.values=new Float32Array(values);
 }
 stillFingers(asset,sit,.88);
 for(const name of ['Wake','Type']){const clip=sit.clone();clip.name=name;clips.push(clip);}
 for(const name of ['Read','Use','Phone','Fish'])clips.push(sittingClip(asset,idle,name,true));
 for(const [source,names] of [[sit,['Eat','Drink']],[idle,['DrinkStanding','EatStanding','CarryIdle']],[clips.find(c=>c.name==='Walk'),['CarryWalk']]])for(const name of names){const clip=source.clone();clip.name=name;clips.push(clip);}
 stillFingers(asset,clips.find(c=>c.name==='CarryIdle'),.95);
 stillFingers(asset,clips.find(c=>c.name==='CarryWalk'),.95);
 const sleep=idle.clone();sleep.name='Sleep';clips.push(sleep);
 return clips;
}
