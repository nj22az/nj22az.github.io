import * as THREE from '../../vendor/three.module.js';
import {clone} from '../../vendor/SkeletonUtils.js';

/**
 * The speed a walk cycle is authored for.
 *
 * Locomotion here is played back against two constants — walkSpeed 1.25 and runSpeed 4
 * — shared by everybody, and nobody ever asked the clips what speed they were drawn at.
 * Those constants fit Thuan's walk (1.25) and the harbour master's (1.24) and nothing
 * else: Aya's legs carry 0.93 m/s and Reiko's 0.95, so both of them cross the town at
 * 1.25 with their feet turning a third too slowly, and every run in the cast is played
 * against 4 m/s when the fastest clip carries 3.3. Feet plant and the ground keeps
 * going underneath them. That slide is what reads as "floaty" long before anyone can
 * name which limb is wrong.
 *
 * None of these clips carries root motion — they are all walked on the spot — so the
 * authored speed is not written down anywhere and has to be measured. The one thing
 * that must be true of a walk cycle is that the planted foot does not slide: while it
 * is on the floor it travels backwards through the body's frame at exactly the speed
 * the body travels forwards. So that is what is measured, and the answer is in the
 * model's own units, to be scaled to whatever height each body is built to.
 */

/** The two skeletons in this town name their feet differently. */
const FEET=[['LeftFoot','RightFoot'],['FootL','FootR'],['footL','footR']];

const measured=new WeakMap();

/**
 * The ground speed a clip is drawn for, in the model's own units per second.
 *
 * A foot counts as planted while it sits within a fifth of its own lift of the lowest
 * point it reaches, and the rate is the median over every planted sample rather than
 * the mean: one frame where a toe scuffs through the floor would otherwise set the
 * speed for the whole clip.
 *
 * @returns {number} metres per second, or 0 when the clip is not locomotion at all
 */
export function clipGroundSpeed(scene,clip,samples=240){
 const feet=(FEET.find(([left])=>scene.getObjectByName(left))||[]).map(name=>scene.getObjectByName(name)).filter(Boolean);
 if(!feet.length||!clip?.duration)return 0;
 const pose=clone(scene);
 const bones=feet.map(bone=>pose.getObjectByName(bone.name)).filter(Boolean);
 const tracks=clip.tracks.map(track=>({
  interpolant:track.createInterpolant(),
  binding:THREE.PropertyBinding.create(pose,track.name),
  // A clip may carry its own travel. Strip it: the question is how the foot moves
  // through the body's frame, not where the animator walked the body to.
  root:/^(Hips|Root)\.position$/.test(track.name)}));
 const height=bones.map(()=>[]),ahead=bones.map(()=>[]),point=new THREE.Vector3();
 for(let i=0;i<samples;i++){
  for(const {interpolant,binding,root} of tracks){
   const value=interpolant.evaluate(i/samples*clip.duration);
   binding.setValue(root?[0,value[1],0]:value,0);
  }
  pose.updateMatrixWorld(true);
  bones.forEach((bone,k)=>{bone.getWorldPosition(point);height[k].push(point.y);ahead[k].push(point.z);});
 }
 for(const {binding} of tracks)binding.unbind();
 const step=clip.duration/samples,rates=[];
 for(let k=0;k<bones.length;k++){
  const low=Math.min(...height[k]),lift=Math.max(...height[k])-low;
  // A foot that never leaves the floor is standing, not walking.
  if(lift<.01)continue;
  for(let i=0;i<samples;i++){
   const next=(i+1)%samples;
   if(height[k][i]-low>lift*.2||height[k][next]-low>lift*.2)continue;
   const travel=ahead[k][i]-ahead[k][next];
   // The wrap from the end of one step to the start of the next is not a slide.
   if(Math.abs(travel)>.2)continue;
   rates.push(travel/step);
  }
 }
 if(rates.length<6)return 0;
 rates.sort((a,b)=>a-b);
 const speed=rates[Math.floor(rates.length/2)];
 return speed>.05?speed:0;
}

/**
 * Authored speed for every locomotion clip a source carries, measured once and cached
 * against the loaded asset.
 * @returns {Record<string,number>} clip name to metres per second in model units
 */
export function sourceGait(asset,names=['Walk','Run','Stroll','CarryWalk']){
 if(measured.has(asset))return measured.get(asset);
 const speeds={};
 for(const name of names){
  const clip=asset.animations?.find(c=>c.name===name);
  if(!clip)continue;
  const speed=clipGroundSpeed(asset.scene,clip);
  if(speed>0)speeds[name]=speed;
 }
 measured.set(asset,speeds);
 return speeds;
}
