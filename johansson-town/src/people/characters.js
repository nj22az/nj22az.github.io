import {createLocalCharacters,preloadModels} from './models.js?yuri-playful-2';
import * as THREE from '../../vendor/three.module.js';
import { createCharacters as createStableCharacters } from './procedural.js';

// Locally vendored skinned bodies use their own compatible clips. Procedural rigs
// preserve interaction and collision when an asset cannot load.
const CAST=Object.freeze({
  player:{source:'local-authored',height:1.82,identity:'Johansson'},
  Aiko:{source:'local-authored',height:1.59,identity:'Aiko'},
  Kenji:{source:'local-authored',height:1.76,identity:'Kenji'},
  'Mrs Sato':{source:'local-authored',height:1.55,identity:'Mrs Sato'},
  'Harbour master':{source:'local-authored',height:1.74,identity:'Harbour master'}
});

export const preloadCharacters=preloadModels;

export function createCharacters(options={}){
  const stable=createStableCharacters(options),models=createLocalCharacters(options),actors=[],conversations=new Map(),entities=new Map(),aiControls=new Map();
  let playerEntity=null,playerActor=null,groundY=0,jumpVelocity=0,jumping=false;

  function attach(entity,file,height){
    const isPlayer=file==='player'||!entity.userData.name;
    const targetHeight=height||(isPlayer?CAST.player.height:CAST[entity.userData.name]?.height);
    const actor=models.attach(entity,file,targetHeight)||stable.attach(entity,file,targetHeight);if(actor)actors.push(actor);
    const identity=isPlayer?'Johansson':entity.userData.name;
    if(identity)entities.set(identity,entity);
    if(isPlayer){playerEntity=entity;playerActor=actor;groundY=entity.position.y;}
    return actor;
  }

  function face(entity,target,flip=false){if(!entity||!target)return;entity.lookAt(target.position.x,entity.position.y,target.position.z);if(flip)entity.rotateY(Math.PI);}

  function stageConversation(entity){
    if(!playerEntity||!entity||entity===playerEntity)return;
    const dx=playerEntity.position.x-entity.position.x,dz=playerEntity.position.z-entity.position.z;
    let d=Math.hypot(dx,dz),nx=0,nz=1;if(d>.001){nx=dx/d;nz=dz/d;}
    const targetDistance=1.34;
    // Facing never moves the player through a wall or prop.
    const hold=1900,now=performance.now();conversations.set(entity,{until:now+hold,x:entity.position.x,z:entity.position.z});
    face(entity,playerEntity,true);face(playerEntity,entity,false);if(!models.gesture(entity))stable.gesture?.(entity);
  }

  function gesture(entity){stageConversation(entity);}

  function canJump(){
    const hud=document.querySelector('#hud'),directory=document.querySelector('#directory'),activity=document.querySelector('#activity'),qte=document.querySelector('#qte');
    return !window.__JOHANSSON_INSPECTING__&&!!playerEntity&&window.__JOHANSSON_RUNNING__===true&&hud&&!hud.classList.contains('hidden')&&directory?.classList.contains('hidden')&&activity?.classList.contains('hidden')&&qte?.classList.contains('hidden');
  }

  function jump(){if(!canJump()||options.canJump?.()===false||jumping)return false;jumping=true;jumpVelocity=4.25;groundY=playerEntity.position.y;navigator.vibrate?.(12);return true;}
  if(!window.__JOHANSSON_JUMP_BOUND__){window.__JOHANSSON_JUMP_BOUND__=true;document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat)jump();});document.querySelector('#jump')?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jump();});}
  window.__JOHANSSON_JUMP__=jump;

  function updateJump(dt,terrainY=0){if(!playerEntity)return;if(!jumping){groundY=terrainY;playerEntity.position.y=terrainY;return;}groundY=terrainY;jumpVelocity-=11.2*dt;playerEntity.position.y+=jumpVelocity*dt;if(playerEntity.position.y<=groundY){playerEntity.position.y=groundY;jumpVelocity=0;jumping=false;}}

  function poseJump(dt){
    if(!jumping||!playerActor?.rig)return;
    const lift=THREE.MathUtils.clamp((playerEntity.position.y-groundY)/.62,0,1),rig=playerActor.rig;
    rig.legs.forEach((leg,i)=>{leg.hip.rotation.x=THREE.MathUtils.damp(leg.hip.rotation.x,(i?-.22:-.14)*lift,12,dt);leg.knee.rotation.x=THREE.MathUtils.damp(leg.knee.rotation.x,.34*lift,12,dt);});
    rig.arms.forEach((arm,i)=>{arm.shoulder.rotation.x=THREE.MathUtils.damp(arm.shoulder.rotation.x,.11*lift,10,dt);arm.shoulder.rotation.z=THREE.MathUtils.damp(arm.shoulder.rotation.z,(i?-.07:.07),10,dt);});
  }

  // Bounded AI/NPC control. This deliberately operates on the same local actor entities
  // that the player sees; it does not spawn hidden duplicate avatars or bypass the cast pipeline.
  function listCharacters(){return [...entities.entries()].map(([name,e])=>({name,x:+e.position.x.toFixed(2),y:+e.position.y.toFixed(2),z:+e.position.z.toFixed(2),player:name==='Johansson',aiControlled:aiControls.has(e)}));}
  function getCharacter(name){const e=entities.get(name);return e?{name,x:+e.position.x.toFixed(2),y:+e.position.y.toFixed(2),z:+e.position.z.toFixed(2),player:name==='Johansson',aiControlled:aiControls.has(e)}:null;}
  function moveNPC(name,{dx=0,dz=0,seconds=4}={}){
    const e=entities.get(name);if(!e||e===playerEntity)return false;
    const targetX=THREE.MathUtils.clamp(e.position.x+THREE.MathUtils.clamp(Number(dx)||0,-4,4),-5.7,5.7);
    const targetZ=THREE.MathUtils.clamp(e.position.z+THREE.MathUtils.clamp(Number(dz)||0,-6,6),-55,48);
    aiControls.set(e,{targetX,targetZ,until:performance.now()+THREE.MathUtils.clamp(Number(seconds)||4,.5,15)*1000,faceName:null});
    return true;
  }
  function faceCharacter(name,targetName='Johansson',seconds=4){
    const e=entities.get(name),target=entities.get(targetName);if(!e||!target||e===playerEntity)return false;
    const current=aiControls.get(e)||{targetX:e.position.x,targetZ:e.position.z};
    aiControls.set(e,{...current,until:performance.now()+THREE.MathUtils.clamp(Number(seconds)||4,.5,15)*1000,faceName:targetName});
    return true;
  }
  function commandGesture(name){const e=entities.get(name);if(!e||e===playerEntity)return false;if(!models.gesture(e))stable.gesture?.(e);return true;}
  function releaseCharacter(name){const e=entities.get(name);if(!e||e===playerEntity)return false;aiControls.delete(e);return true;}
  function updateAIControls(dt){
    const now=performance.now();
    for(const [e,c] of aiControls){
      if(c.until<=now){aiControls.delete(e);continue;}
      const x=THREE.MathUtils.damp(e.position.x,c.targetX,6.5,dt),z=THREE.MathUtils.damp(e.position.z,c.targetZ,6.5,dt);
      if(!options.isBlocked?.(x,e.position.z,.32))e.position.x=x;
      if(!options.isBlocked?.(e.position.x,z,.32))e.position.z=z;
      if(c.faceName){const target=entities.get(c.faceName);if(target)face(e,target,true);}
    }
  }
  window.__JOHANSSON_CHARACTER_CONTROL__=Object.freeze({list:listCharacters,get:getCharacter,moveNPC,faceCharacter,gesture:commandGesture,release:releaseCharacter});

  function update(dt){
    updateAIControls(dt);stable.update(dt);models.update(dt);poseJump(dt);
    const now=performance.now();
    for(const [entity,c] of conversations){if(c.until<=now){conversations.delete(entity);continue;}entity.position.x=c.x;entity.position.z=c.z;face(entity,playerEntity,true);face(playerEntity,entity,false);}
    // Re-apply the AI target after the conversation layer so a commanded resident does not drift.
  }

  return {attach,gesture,jump,update,physics:updateJump,actors,preloaded:()=>7,profiles:CAST,mode:'local-skinned-with-procedural-fallback',listCharacters,getCharacter,moveNPC,faceCharacter,releaseCharacter};
}
