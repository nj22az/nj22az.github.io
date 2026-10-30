// World's actual animator and drawn soles, in Node. A contact is any heel/toe within 10 mm of the floor.
// Its entire excursion must be <10 mm; the final, still-planted contacts count too.
// node tools/gait-feet.mjs [name …] [--speed 0.6,1.3,2,3.5] [--seconds 4] [--stop] [--pixar]
import {installDOM} from '../tests/fixtures.mjs';
import * as THREE from '../vendor/three.module.js';
import {buildAvatar} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {recipeFor} from '../src/avatars/cast.js';
import {footSupports} from '../src/avatars/foot-ground.js';

installDOM();
export const GAIT_NAMES=['Thuan','Harbour master','Vy','Grandmother Higa','Johansson','Mai'];
export const GAIT_SPEEDS=[.6,1.3,2,3.5];

/** Straight travel, optionally followed by an abrupt stop (at any point in the cycle).
 * The original film probes are retained. Drawn shoe vertices independently check penetration and vertical pops.
 * `worst`/`mean` are mm, unrounded so tests cannot pass a 10.4 mm slide by rounding it down. */
export function slides(name,speed,{seconds=4,stop=false,stopAt=seconds,fps=60,heading=0,pixar,pace}={}){
 const avatar=buildAvatar(recipeFor(name),{shadows:false,...(pixar===false?{pixar:null}:{})});
 const anim=createAvatarAnimator(avatar,{random:()=>.5,initialTime:0}),holder=new THREE.Group();holder.rotation.y=heading;holder.add(avatar.root);
 const m=avatar.measure,cy=m.foot*.62-m.foot-m.legR*.75,cz=m.legR*.55,rz=m.legR*2.3*.85,p=new THREE.Vector3(),down=new Map(),done=[];
 const supports=footSupports(avatar)(),previous=new Map();let landingDelay=0,landed=false,standHip=0,lastHip=null,hipDrop=0,hipJump=0;
 let popAt=0,penetration=0,pop=0,surfaceWorst=0,stopWorst=0,travel=0;
 const surfaceDown=new Map(),finishSurface=s=>{surfaceWorst=Math.max(surfaceWorst,s.d);};
 const finish=s=>{done.push(s.d);if(s.stop)stopWorst=Math.max(stopWorst,s.d);};
 const dt=1/fps,total=(stop?stopAt+1.2:seconds),warmup=.5;
 for(let frame=0;frame<Math.ceil((total+warmup)*fps);frame++){
  const t=frame/fps-warmup,v=t>=0&&(!stop||t<stopAt)?(pace?pace(t):speed):0;
  travel+=v*dt;holder.position.set(-Math.sin(heading)*travel,0,-Math.cos(heading)*travel);
  anim.update(dt,{speed:v,expression:'neutral'});holder.updateMatrixWorld(true);
  avatar.bones.hips.getWorldPosition(p);
  if(t<0)standHip=p.y;else{hipDrop=Math.max(hipDrop,standHip-p.y);if(lastHip!==null)hipJump=Math.max(hipJump,Math.abs(p.y-lastHip));}lastHip=p.y;
  for(const b of ['footL','footR'])for(const dz of [-rz,rz]){
   p.set(0,cy,cz+dz).applyMatrix4(avatar.bones[b].matrixWorld);const k=b+dz,s=down.get(k);
   if(t<0)continue;
   // These film probes are bounding-box corners, not skin vertices: only the drawn shoe defines penetration.
   if(Math.abs(p.y)>.01){if(s)finish(s);down.delete(k);continue;}
   if(!s)down.set(k,{x:p.x,z:p.z,d:0,stop:stop&&t>=stopAt});
   else{const d=Math.hypot(p.x-s.x,p.z-s.z);s.d=Math.max(s.d,d);s.stop||=stop&&t>=stopAt;}
  }
  let lowest=Infinity;
  for(const {bone,samples} of supports)for(let i=0;i<samples.length;i++){
   p.copy(samples[i]).applyMatrix4(bone.matrixWorld);lowest=Math.min(lowest,p.y);const k=bone.name+i;
   if(t>=0){penetration=Math.max(penetration,-p.y);if(previous.has(k)){const jump=Math.abs(p.y-previous.get(k));if(jump>pop){pop=jump;popAt=t;}}}
   previous.set(k,p.y);
   if(t<0)continue;
   const s=surfaceDown.get(k);
   if(Math.abs(p.y)>.01){if(s)finishSurface(s);surfaceDown.delete(k);}
   else if(!s)surfaceDown.set(k,{x:p.x,z:p.z,d:0});
   else {const d=Math.hypot(p.x-s.x,p.z-s.z);s.d=Math.max(s.d,d);}
  }
  if(stop&&t>=stopAt&&!landed){landingDelay=Math.max(0,t-stopAt)*1000;if(lowest<=.01)landed=true;else landingDelay+=dt*1000;}
 }
 for(const s of down.values())finish(s);
 for(const s of surfaceDown.values())finishSurface(s);
 avatar.dispose?.();
 return {name,speed,worst:Math.max(0,...done)*1000,mean:done.length?done.reduce((a,b)=>a+b,0)/done.length*1000:0,
  surfaceWorst:surfaceWorst*1000,contacts:done.length,stopWorst:stopWorst*1000,penetration:penetration*1000,pop:pop*1000,popAt,landingDelay,hipDrop:hipDrop*1000,hipJump:hipJump*1000,reach:(avatar.bones.kneeL.position.length()+avatar.bones.footL.position.length())*1000};
}

if(process.argv[1]?.endsWith('gait-feet.mjs')){
 const argv=process.argv.slice(2),opt=(f,d)=>{const i=argv.indexOf(f);return i>=0?argv[i+1]:d;};
 const names=argv.filter((a,i)=>!a.startsWith('--')&&!['--speed','--seconds'].includes(argv[i-1]));
 const speeds=opt('--speed',GAIT_SPEEDS.join(',')).split(',').map(Number),seconds=+opt('--seconds',4),stop=argv.includes('--stop');
 if(argv.includes('--pixar')){
  const {providePixarBodyInNode}=await import('../tests/pixar-fixture.mjs');
  const {PIXAR_BODIES}=await import('../src/avatars/pixar.js');
  for(const name of names.length?names:GAIT_NAMES)if(PIXAR_BODIES[name])await providePixarBodyInNode(name);
 }
 for(const name of names.length?names:GAIT_NAMES)for(const speed of speeds){
  const r=slides(name,speed,{seconds,stop});
  console.log(`${name.padEnd(18)} ${speed.toFixed(1)} m/s  worst ${r.worst.toFixed(2).padStart(7)} mm  mean ${r.mean.toFixed(2).padStart(6)} mm  ${r.contacts} contacts  surface ${r.surfaceWorst.toFixed(2)} mm  floor ${r.penetration.toFixed(2)} mm  vertical/frame ${r.pop.toFixed(2)} mm${stop?'  stop '+r.stopWorst.toFixed(2)+' mm':''}`);
 }
}
