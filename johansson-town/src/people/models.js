import * as THREE from '../../vendor/three.module.js';
import {createAvatarActor,updateAvatarActor,avatarConversationTarget} from '../avatars/actors.js';

/**
 * The town's people, as bodies.
 *
 * Everybody is a Shimanchu: one family of bodies built at load time from recipes
 * (src/avatars/). There is nothing to download, so every resident is ready on the
 * frame they are attached. The GLB cast that used to stream in behind placeholders —
 * the MakeHuman Thuan and Johansson, Nao's VRoid, the low-poly residents — was retired
 * in the September 2026 cleanup (see docs/EXPANSION-NOTES.md to recover it).
 */
export function createLocalCharacters({shadows=false}={}){
  const actors=[],byEntity=new Map();
  function attach(entity,name){
    const actor=createAvatarActor(entity,entity.userData.name||name,{shadows});
    byEntity.set(entity,actor);actors.push(actor);return actor;
  }
  function update(dt){for(const actor of actors)updateAvatarActor(actor,dt);}
  function conversationTarget(entity,target=new THREE.Vector3()){
    const actor=byEntity.get(entity);return actor?avatarConversationTarget(actor,target):null;
  }
  /** 'swim' puts a resident into their swimwear, anything else back into their clothes. */
  function wear(entity,outfit){const actor=byEntity.get(entity);if(!actor)return false;actor.avatar.wear(outfit);actor.outfit=outfit;return true;}
  function gesture(entity){const actor=byEntity.get(entity);if(!actor)return false;if(!(actor.gestureTime>0))actor.gestureTime=1.6;return true;}
  return {attach,update,actors,conversationTarget,wear,gesture};
}
