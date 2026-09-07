import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { createCharacters as createStableCharacters } from './characters-cel.js?v=13';

// Stable cast controller. Remote MakeHuman bodies are intentionally not used at runtime:
// they produced T-poses, incomplete clothing and incompatible head/accessory transforms on mobile.
// Each resident now uses a separately authored local rig from characters.js.
const CAST=Object.freeze({
  player:{source:'local-authored',height:1.82,identity:'Johansson'},
  Aiko:{source:'local-authored',height:1.59,identity:'Aiko'},
  Kenji:{source:'local-authored',height:1.76,identity:'Kenji'},
  'Mrs Sato':{source:'local-authored',height:1.55,identity:'Mrs Sato'},
  'Harbour master':{source:'local-authored',height:1.74,identity:'Harbour master'}
});

let preloadPromise=null;
export function preloadCharacters({onProgress}={}){
  if(preloadPromise)return preloadPromise;
  onProgress?.(1,'stable-local-cast',true);
  preloadPromise=Promise.resolve({ready:5,total:5,keys:Object.keys(CAST),mode:'stable-local'});
  return preloadPromise;
}

export function createCharacters(options={}){
  const stable=createStableCharacters(options),actors=stable.actors||[],conversations=new Map();
  let playerEntity=null,playerActor=null,groundY=0,jumpVelocity=0,jumping=false;

  function attach(entity,file,height){
    const isPlayer=file==='player'||!entity.userData.name;
    const actor=stable.attach(entity,file,height||(isPlayer?CAST.player.height:CAST[entity.userData.name]?.height));
    if(isPlayer){playerEntity=entity;playerActor=actor;groundY=entity.position.y;}
    return actor;
  }

  function face(entity,target,flip=false){if(!entity||!target)return;entity.lookAt(target.position.x,entity.position.y,target.position.z);if(flip)entity.rotateY(Math.PI);}

  function stageConversation(entity){
    if(!playerEntity||!entity||entity===playerEntity)return;
    const dx=playerEntity.position.x-entity.position.x,dz=playerEntity.position.z-entity.position.z;
    let d=Math.hypot(dx,dz),nx=0,nz=1;if(d>.001){nx=dx/d;nz=dz/d;}
    const targetDistance=1.34;
    if(d<targetDistance){const shift=Math.min(.80,targetDistance-d);playerEntity.position.x+=nx*shift;playerEntity.position.z+=nz*shift;}
    const hold=1900,now=performance.now();conversations.set(entity,{until:now+hold,x:entity.position.x,z:entity.position.z});
    face(entity,playerEntity,true);face(playerEntity,entity,false);stable.gesture?.(entity);
  }

  function gesture(entity){stageConversation(entity);}

  function canJump(){
    const hud=document.querySelector('#hud'),directory=document.querySelector('#directory'),activity=document.querySelector('#activity'),qte=document.querySelector('#qte');
    return !!playerEntity&&window.__JOHANSSON_RUNNING__===true&&hud&&!hud.classList.contains('hidden')&&directory?.classList.contains('hidden')&&activity?.classList.contains('hidden')&&qte?.classList.contains('hidden');
  }

  function jump(){if(!canJump()||jumping)return false;jumping=true;jumpVelocity=4.25;groundY=playerEntity.position.y;navigator.vibrate?.(12);return true;}
  if(!window.__JOHANSSON_JUMP_BOUND__){window.__JOHANSSON_JUMP_BOUND__=true;document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat)jump();});document.querySelector('#jump')?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jump();});}
  window.__JOHANSSON_JUMP__=jump;

  function updateJump(dt){if(!playerEntity)return;if(!jumping){groundY=playerEntity.position.y;return;}jumpVelocity-=11.2*dt;playerEntity.position.y+=jumpVelocity*dt;if(playerEntity.position.y<=groundY){playerEntity.position.y=groundY;jumpVelocity=0;jumping=false;}}

  function poseJump(dt){
    if(!jumping||!playerActor?.rig)return;
    const lift=THREE.MathUtils.clamp((playerEntity.position.y-groundY)/.62,0,1),rig=playerActor.rig;
    rig.legs.forEach((leg,i)=>{leg.hip.rotation.x=THREE.MathUtils.damp(leg.hip.rotation.x,(i?-.22:-.14)*lift,12,dt);leg.knee.rotation.x=THREE.MathUtils.damp(leg.knee.rotation.x,.34*lift,12,dt);});
    rig.arms.forEach((arm,i)=>{arm.shoulder.rotation.x=THREE.MathUtils.damp(arm.shoulder.rotation.x,.11*lift,10,dt);arm.shoulder.rotation.z=THREE.MathUtils.damp(arm.shoulder.rotation.z,(i?-.07:.07),10,dt);});
  }

  function update(dt){
    updateJump(dt);stable.update(dt);poseJump(dt);
    const now=performance.now();
    for(const [entity,c] of conversations){if(c.until<=now){conversations.delete(entity);continue;}entity.position.x=c.x;entity.position.z=c.z;face(entity,playerEntity,true);face(playerEntity,entity,false);}
  }

  return {attach,gesture,jump,update,actors,preloaded:()=>5,profiles:CAST,mode:'stable-local-authored'};
}
