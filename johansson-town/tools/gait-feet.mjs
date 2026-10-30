// How far a planted foot slides in World's walk (the film studio's foot-slide check, jojo remotion/scripts/feet.mjs, found
// it in every film with walking, 30 October 2026). Walks a resident in Node at a steady pace, facing -z as the game moves
// them, and follows the heel and the toe of each shoe as the film check does: while one is within 10 mm of the floor it
// should stay where it was put down; how far it goes before it lifts is its slide.
//   node tools/gait-feet.mjs [name …] [--speed 1.3,3.5] [--seconds 4]
//   → per resident and pace: the worst slide, the mean of the contacts (mm), and how many contacts
// A walk with planted feet shows every slide under 10 mm. The handoff: briefs/HANDOFF-GAIT-PLANTED-FEET-2026-10-30.md.
import {installDOM} from '../tests/fixtures.mjs';
import * as THREE from '../vendor/three.module.js';
import {buildAvatar} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {recipeFor} from '../src/avatars/cast.js';

installDOM();
const argv=process.argv.slice(2),opt=(f,d)=>{const i=argv.indexOf(f);return i>=0?argv[i+1]:d;};
const names=argv.filter((a,i)=>!a.startsWith('--')&&!['--speed','--seconds'].includes(argv[i-1]));
const speeds=opt('--speed','1.3,3.5').split(',').map(Number),seconds=+opt('--seconds',4);

/** One resident walked at `speed` m/s: the slides of their planted heels and toes (the first second left out: the walk
 *  settling in). The soles: the heel and the toe of each shoe as the film measures them (FilmCast placeBody). */
export function slides(name,speed,{seconds=4}={}){
 const avatar=buildAvatar(recipeFor(name),{shadows:false}),anim=createAvatarAnimator(avatar,{random:()=>.5}),holder=new THREE.Group();holder.add(avatar.root);
 const m=avatar.measure,cy=m.foot*.62-m.foot-m.legR*.75,cz=m.legR*.55,rz=m.legR*2.3*.85,p=new THREE.Vector3(),down=new Map(),done=[];
 for(let t=0;t<seconds;t+=1/60){
  holder.position.z-=speed/60;anim.update(1/60,{speed,expression:'neutral'});holder.updateMatrixWorld(true);
  if(t<1)continue;
  for(const b of ['footL','footR'])for(const dz of [-rz,rz]){
   p.set(0,cy,cz+dz).applyMatrix4(avatar.bones[b].matrixWorld);const k=b+dz,s=down.get(k);
   if(Math.abs(p.y)>.01){if(s)done.push(s.d);down.delete(k);continue;}
   if(!s)down.set(k,{x:p.x,z:p.z,d:0});else s.d=Math.max(s.d,Math.hypot(p.x-s.x,p.z-s.z));
  }
 }
 avatar.dispose?.();
 const mm=v=>Math.round(v*1000);
 return {name,speed,worst:mm(Math.max(0,...done)),mean:done.length?mm(done.reduce((a,b)=>a+b,0)/done.length):0,contacts:done.length};
}

if(import.meta.url===new URL(process.argv[1],'file://').href||process.argv[1]?.endsWith('gait-feet.mjs')){
 for(const name of names.length?names:['Thuan','Harbour master','Vy','Grandmother Higa'])for(const speed of speeds){
  const r=slides(name,speed,{seconds});console.log(`${name.padEnd(18)} ${speed.toFixed(1)} m/s  worst ${String(r.worst).padStart(4)} mm  mean ${String(r.mean).padStart(4)} mm  ${r.contacts} contacts`);
 }
}
