import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createCharacters as createFallbackCharacters } from './characters-cel.js?v=12';

// MakeHuman / MPFB2 NPC layer with a deliberately conservative runtime policy.
// Johansson himself uses the deterministic local hero rig until a bespoke skinned
// protagonist is available. This avoids the deformed suited avatar and keeps the
// player readable while retaining realistic NPC bodies where they are stable.
const SOURCE='https://raw.githubusercontent.com/kunalkushwaha/vsim/main/packages/assets/library/';
const MODEL_URLS=Object.freeze({
  suited:`${SOURCE}suited.glb`,
  woman:`${SOURCE}human.glb`,
  man:`${SOURCE}man.glb`,
  speaker:`${SOURCE}speaker.glb`
});

const CAST=Object.freeze({
  player:{asset:'suited',height:1.82,useFallback:true,heroic:true},
  Aiko:{asset:'woman',height:1.59,width:.98,depth:1.00},
  Kenji:{asset:'man',height:1.76,width:1.00,depth:1.00},
  'Mrs Sato':{asset:'speaker',height:1.55,width:.98,depth:1.00},
  'Harbour master':{asset:'man',height:1.74,width:1.04,depth:1.02}
});

const loaded=new Map();
let preloadPromise=null;

function withTimeout(promise,ms,label){
  let timer;
  const timeout=new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error(`${label} timed out`)),ms));
  return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
}

export function preloadCharacters({onProgress}={}){
  if(preloadPromise)return preloadPromise;
  const entries=Object.entries(MODEL_URLS);let done=0;
  preloadPromise=Promise.all(entries.map(async([key,url])=>{
    try{
      const loader=new GLTFLoader();loader.setCrossOrigin('anonymous');
      const gltf=await withTimeout(loader.loadAsync(url),15000,`character ${key}`);
      loaded.set(key,gltf);
    }catch(error){
      console.warn(`[Johansson Town] ${key} model unavailable; local stable rig will be used`,error);
    }finally{
      done++;onProgress?.(done/entries.length,key,loaded.has(key));
    }
  })).then(()=>({ready:loaded.size,total:entries.length,keys:[...loaded.keys()]}));
  return preloadPromise;
}

function cloneSkinned(source){
  const sourceLookup=new Map(),cloneLookup=new Map();
  const cloned=source.clone();
  (function parallel(a,b){
    sourceLookup.set(b,a);cloneLookup.set(a,b);
    for(let i=0;i<a.children.length;i++)parallel(a.children[i],b.children[i]);
  })(source,cloned);
  cloned.traverse(node=>{
    if(!node.isSkinnedMesh)return;
    const src=sourceLookup.get(node);if(!src?.skeleton)return;
    node.skeleton=src.skeleton.clone();
    node.bindMatrix.copy(src.bindMatrix);
    node.skeleton.bones=src.skeleton.bones.map(b=>cloneLookup.get(b)).filter(Boolean);
    node.bind(node.skeleton,node.bindMatrix);
  });
  return cloned;
}

function clipByName(clips,name){
  const n=name.toLowerCase();
  return clips.find(c=>c.name.toLowerCase()===n)||clips.find(c=>c.name.toLowerCase().includes(n));
}

function sanitiseClip(sourceClip){
  // World movement is code-driven. Root X/Z translation is removed so clips
  // cannot drag or skate characters through the scene. Authored travel speed is
  // preserved as metadata for gait timing.
  const clip=sourceClip.clone();
  let locomotionSpeed=0;
  clip.tracks.forEach(track=>{
    if(!/\.position$/i.test(track.name)||track.getValueSize?.()!==3)return;
    const node=track.name.slice(0,track.name.lastIndexOf('.')).toLowerCase();
    if(!/(hips|pelvis|root|armature)$/.test(node))return;
    const v=track.values;if(v.length<6)return;
    const dx=v[v.length-3]-v[0],dz=v[v.length-1]-v[2];
    locomotionSpeed=Math.max(locomotionSpeed,Math.hypot(dx,dz)/Math.max(.001,clip.duration));
    const baseX=v[0],baseZ=v[2];
    for(let i=0;i<v.length;i+=3){v[i]=baseX;v[i+2]=baseZ;}
  });
  clip.userData={...(clip.userData||{}),locomotionSpeed};
  return clip;
}

function prepareMaterials(root){
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;
    const list=Array.isArray(o.material)?o.material:[o.material];
    const prepared=list.map(src=>{
      if(!src)return src;
      const m=src.clone();
      if(m.map){m.map.colorSpace=THREE.SRGBColorSpace;m.map.anisotropy=Math.max(2,m.map.anisotropy||1);}
      if('roughness' in m)m.roughness=THREE.MathUtils.clamp(m.roughness??.76,.62,.95);
      if('metalness' in m)m.metalness=Math.min(.12,m.metalness??0);
      if(m.normalScale?.multiplyScalar)m.normalScale.multiplyScalar(.65);
      if('envMapIntensity' in m)m.envMapIntensity=Math.min(.5,m.envMapIntensity??.5);
      m.dithering=true;
      return m;
    });
    o.material=Array.isArray(o.material)?prepared:prepared[0];
  });
}

function instantiate(profile){
  const source=loaded.get(profile.asset);if(!source?.scene)return null;
  const model=cloneSkinned(source.scene);prepareMaterials(model);
  const wrapper=new THREE.Group();wrapper.name='stable-hd-character';wrapper.add(model);
  model.rotation.y=Math.PI/2;model.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(model);
  const rawHeight=Math.max(.01,box.max.y-box.min.y),scale=profile.height/rawHeight;
  model.scale.setScalar(scale);model.updateMatrixWorld(true);
  box=new THREE.Box3().setFromObject(model);model.position.y-=box.min.y;model.updateMatrixWorld(true);
  wrapper.scale.set(profile.width||1,1,profile.depth||1);
  const clips=(source.animations||[]).map(sanitiseClip);
  return {wrapper,model,clips,height:profile.height};
}

function stripFallbackSatchel(actor){
  // The older local hero has a straight strap, but even that is unnecessary for
  // the emergency clean silhouette. Remove only the extremely thin long chest strap.
  actor?.rig?.root?.traverse(o=>{
    const p=o.geometry?.parameters;
    if(o.isMesh&&o.geometry?.type==='BoxGeometry'&&p&&p.width<.06&&p.height>.8&&p.depth<.06&&o.position.z<-.2)o.visible=false;
  });
}

export function createCharacters(options={}){
  const fallback=createFallbackCharacters(options),actors=[];
  const conversations=new Map();
  let playerEntity=null,playerFallbackActor=null,playerGroundY=0,jumpVelocity=0,jumping=false;

  function attach(entity,file,height){
    const name=entity.userData.name||'player';
    const isPlayer=file==='player'||name==='player';
    const profile={...(CAST[name]||CAST.player)};
    if(isPlayer&&height)profile.height=height;

    if(isPlayer||profile.useFallback){
      playerEntity=entity;playerGroundY=entity.position.y;
      const actor=fallback.attach(entity,file,height||profile.height);
      playerFallbackActor=actor;stripFallbackSatchel(actor);
      return actor;
    }

    const instance=instantiate(profile);
    if(!instance)return fallback.attach(entity,file,height||profile.height);
    [...entity.children].forEach(c=>c.visible=false);
    entity.add(instance.wrapper);

    const mixer=new THREE.AnimationMixer(instance.model),actions={};
    // 'wave' remains discoverable for provenance/compatibility but is never used
    // in normal conversation. Only idle/walk/run are selected by the state machine.
    for(const name of ['idle','walk','run','wave']){
      const clip=clipByName(instance.clips,name);if(clip)actions[name]=mixer.clipAction(clip);
    }
    const actor={entity,profile,...instance,mixer,actions,current:null,state:'idle',lastPosition:entity.position.clone(),speed:0};
    actors.push(actor);entity.userData.character=actor;
    const idle=actions.idle||actions.walk;
    if(idle){idle.reset().setLoop(THREE.LoopRepeat,Infinity).setEffectiveWeight(1).play();idle.timeScale=.62;actor.current=idle;}
    return actor;
  }

  function transition(actor,name,fade=.42){
    const next=actor.actions[name]||actor.actions.idle||actor.actions.walk;
    if(!next||next===actor.current){actor.state=name;return;}
    next.enabled=true;next.setLoop(THREE.LoopRepeat,Infinity);next.reset().setEffectiveWeight(1).play();
    actor.current?.crossFadeTo(next,fade,false);actor.current=next;actor.state=name;
  }

  function faceConversation(entity,target,isNpc=false){
    if(!entity||!target)return;
    entity.lookAt(target.position.x,entity.position.y,target.position.z);
    if(isNpc)entity.rotateY(Math.PI);
  }

  function stageConversation(entity){
    if(!playerEntity||entity===playerEntity)return;
    const now=performance.now(),hold=1900;
    const anchor=entity.position.clone();
    conversations.set(entity,{until:now+hold,anchor});

    // If the player has approached too closely, establish a clear conversational
    // gap instead of letting the two bodies intersect.
    const dx=playerEntity.position.x-entity.position.x,dz=playerEntity.position.z-entity.position.z;
    let d=Math.hypot(dx,dz),nx=0,nz=1;
    if(d>.001){nx=dx/d;nz=dz/d;}
    if(d<1.22){
      const shift=Math.min(.72,1.28-d);
      playerEntity.position.x+=nx*shift;playerEntity.position.z+=nz*shift;
    }
    faceConversation(entity,playerEntity,true);
    faceConversation(playerEntity,entity,false);
  }

  function gesture(entity){
    // No waving and no incremental bone rotations. Those additive rotations were
    // the source of the accumulating 'nightmare' deformation during dialogue.
    stageConversation(entity);
  }

  function canJump(){
    const hud=document.querySelector('#hud'),directory=document.querySelector('#directory'),activity=document.querySelector('#activity'),qte=document.querySelector('#qte');
    return !!playerEntity&&window.__JOHANSSON_RUNNING__===true&&hud&&!hud.classList.contains('hidden')&&directory?.classList.contains('hidden')&&activity?.classList.contains('hidden')&&qte?.classList.contains('hidden');
  }

  function jump(){
    if(!canJump()||jumping)return false;
    jumping=true;jumpVelocity=4.25;playerGroundY=playerEntity.position.y;
    if(navigator.vibrate)navigator.vibrate(12);
    return true;
  }

  if(!window.__JOHANSSON_JUMP_BOUND__){
    window.__JOHANSSON_JUMP_BOUND__=true;
    document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat)jump();});
    document.querySelector('#jump')?.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jump();});
  }
  window.__JOHANSSON_JUMP__=jump;

  function updateJump(dt){
    if(!playerEntity)return;
    if(!jumping){playerGroundY=playerEntity.position.y;return;}
    jumpVelocity-=11.2*dt;playerEntity.position.y+=jumpVelocity*dt;
    if(playerEntity.position.y<=playerGroundY){playerEntity.position.y=playerGroundY;jumpVelocity=0;jumping=false;}
  }

  function desiredState(actor,now){
    const conversation=conversations.get(actor.entity);
    if(conversation&&conversation.until>now)return'idle';
    if(actor.state==='idle')return actor.speed>.22?'walk':'idle';
    if(actor.state==='walk')return actor.speed<.09?'idle':actor.speed>3.05?'run':'walk';
    if(actor.state==='run')return actor.speed<2.55?'walk':'run';
    return actor.speed>.22?'walk':'idle';
  }

  function actionSpeed(action,fallbackSpeed){
    return Math.max(.25,action?.getClip?.()?.userData?.locomotionSpeed||fallbackSpeed);
  }

  function poseFallbackJump(dt){
    if(!jumping||!playerFallbackActor?.rig)return;
    const rig=playerFallbackActor.rig;
    const rise=THREE.MathUtils.clamp((playerEntity.position.y-playerGroundY)/.65,0,1);
    rig.legs.forEach((leg,i)=>{
      const target=i===0?-.18:-.28;
      leg.hip.rotation.x=THREE.MathUtils.damp(leg.hip.rotation.x,target*rise,12,dt);
      leg.knee.rotation.x=THREE.MathUtils.damp(leg.knee.rotation.x,.42*rise,12,dt);
    });
    rig.arms.forEach((arm,i)=>{
      const target=i===0?.20:.16;
      arm.shoulder.rotation.x=THREE.MathUtils.damp(arm.shoulder.rotation.x,target*rise,10,dt);
      arm.shoulder.rotation.z=THREE.MathUtils.damp(arm.shoulder.rotation.z,(i?-.08:.08)*rise,10,dt);
    });
  }

  function update(dt){
    updateJump(dt);
    fallback.update(dt);
    poseFallbackJump(dt);
    const now=performance.now();

    for(const [entity,c] of conversations){
      if(c.until<=now){conversations.delete(entity);continue;}
      entity.position.x=c.anchor.x;entity.position.z=c.anchor.z;
      faceConversation(entity,playerEntity,true);faceConversation(playerEntity,entity,false);
    }

    for(const a of actors){
      const dx=a.entity.position.x-a.lastPosition.x,dz=a.entity.position.z-a.lastPosition.z;
      const raw=Math.hypot(dx,dz)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);
      const bounded=raw>8?0:Math.min(raw,5.2);a.speed=THREE.MathUtils.damp(a.speed,bounded,5.2,dt);
      const desired=desiredState(a,now);if(desired!==a.state)transition(a,desired,desired==='idle'?.46:.38);
      if(a.current===a.actions.walk){
        const authored=actionSpeed(a.actions.walk,1.45);a.current.timeScale=THREE.MathUtils.clamp(a.speed/authored,.58,1.12);
      }else if(a.current===a.actions.run){
        const authored=actionSpeed(a.actions.run,3.55);a.current.timeScale=THREE.MathUtils.clamp(a.speed/authored,.70,1.10);
      }else if(a.current===a.actions.idle)a.current.timeScale=.62;
      a.mixer.update(dt);
    }
  }

  return {attach,gesture,jump,update,actors,preloaded:()=>loaded.size,profiles:CAST};
}
