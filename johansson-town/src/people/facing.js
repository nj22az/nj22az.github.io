import * as THREE from '../../vendor/three.module.js';

/**
 * Turning to face whoever is talking to you.
 *
 * A person who is free stops what they are doing and turns round. A person in the
 * middle of something does not: they carry on and turn their head, the way you would
 * if someone spoke to you while you were counting stock. The head turn already
 * existed for customers inside the shop (see shop-attention.js); this decides who is
 * being addressed, whether they can spare the whole body for it, and points the head
 * gaze at the right person wherever they are.
 */

/** Poses a person will not abandon mid-way. They answer over their shoulder. */
export const OCCUPIED_POSES=Object.freeze([
 'Sit','Type','Eat','Drink','Wake','Sleep','Fish','Use','Read','Phone','CounterIdle'
]);

/**
 * @param {object} data the person's userData
 * @param {boolean} moving whether they are walking
 */
export function occupied(data={},moving=false){
 if(moving)return true;
 if(data.carrying||data.restocking||data.shopReach||data.sleeping||data.roomTransition)return true;
 if(data.usingTownObject)return true;
 return OCCUPIED_POSES.includes(data.socialPose);
}

/** The yaw that puts `from` face-on to `to`, in the convention the town walks in. */
export const faceYaw=(from,to)=>Math.atan2(from.x-to.x,from.z-to.z);

/** One damped step of a turn, taking the short way round. */
export function turnToward(current,target,dt,rate=6){
 const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 return current+delta*(1-Math.exp(-Math.max(0,dt)*rate));
}

/** How far off a person's own facing a point is, in radians. */
export function offBy(entity,point){
 const want=faceYaw(entity.position,point);
 return Math.abs(Math.atan2(Math.sin(want-entity.rotation.y),Math.cos(want-entity.rotation.y)));
}

/**
 * @param {object} options
 * @param {{people:Array}} options.world
 * @param {() => THREE.Vector3} options.getPlayerPosition
 * @param {() => number} [options.getPlayerEyeHeight]
 * @param {number} [options.range] how close you have to be before someone notices you
 * @param {number} [options.turnRate]
 */
export function createFacing({world,getPlayerPosition,getPlayerEyeHeight=()=>1.66,range=2.6,turnRate=6}){
 const point=new THREE.Vector3();
 const stats={addressed:0,turning:0};
 return {stats,update(dt){
  const player=getPlayerPosition();
  if(!player)return stats;
  stats.addressed=0;stats.turning=0;
  for(const person of world.people||[]){
   const entity=person?.g;if(!entity)continue;
   const data=entity.userData;
   const talking=data.playerConversation===true;
   const near=Math.hypot(entity.position.x-player.x,entity.position.z-player.z)<=range;
   // Standing next to someone is not the same as talking to them, so proximity only
   // earns a look when they have nothing else on.
   const busy=occupied(data,!!data.walking);
   if(!talking&&!(near&&!busy)){
    if(data.facingPlayer){delete data.facingPlayer;if(data.lookSource==='facing')delete data.lookTarget;}
    continue;
   }
   stats.addressed++;
   point.set(player.x,player.y+getPlayerEyeHeight(),player.z);
   // The head gaze reads this wherever the person is; it used to be set only by the
   // shop's own attention pass, which is why people outside stared straight ahead.
   data.lookTarget=point.toArray();data.lookSource='facing';
   data.facingPlayer=true;
   if(busy||!talking)continue;
   entity.rotation.y=turnToward(entity.rotation.y,faceYaw(entity.position,player),dt,turnRate);
   stats.turning++;
  }
  return stats;
 }};
}
