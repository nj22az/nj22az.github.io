import * as THREE from '../../vendor/three.module.js';
import {sittingClip} from './yuri-animation.js';

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
 const idle=alias('restpose','Idle_Neutral');idle.duration=4;
 for(const track of idle.tracks){
  const value=track.values.slice(0,track.getValueSize());track.times=new Float32Array([0,4]);track.values=new Float32Array([...value,...value]);
 }
 for(const [bone,amount] of [['Spine',.008],['Head',.012]]){
  const track=idle.tracks.find(t=>t.name===bone+'.quaternion'),restRotation=new THREE.Quaternion().fromArray(track.values),times=[],values=[];
  for(let i=0;i<=24;i++){
   const t=i/24*4;times.push(t);values.push(...restRotation.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(amount*Math.sin(t/4*Math.PI*2),0,0))).toArray());
  }
  track.times=new Float32Array(times);track.values=new Float32Array(values);
 }
 alias('Walking','Walk');alias('Running','Run');alias('Big_Wave_Hello','Wave');
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
 for(const name of ['Wake','Type']){const clip=sit.clone();clip.name=name;clips.push(clip);}
 for(const name of ['Read','Use','Phone','Fish'])clips.push(sittingClip(asset,idle,name,true));
 for(const [source,names] of [[sit,['Eat','Drink']],[idle,['DrinkStanding','EatStanding','CarryIdle']],[clips.find(c=>c.name==='Walk'),['CarryWalk']]])for(const name of names){const clip=source.clone();clip.name=name;clips.push(clip);}
 const sleep=idle.clone();sleep.name='Sleep';clips.push(sleep);
 return clips;
}
