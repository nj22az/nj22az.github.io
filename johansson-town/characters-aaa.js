import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createCharacters as createFallbackCharacters } from './characters-cel.js?v=12';

// High-detail adult cast for Johansson Town.
// Source models are MakeHuman / MPFB2 exports published CC0 by the vsim project.
// They are preloaded before gameplay. The existing local procedural cast remains
// a deterministic fallback if a remote model cannot be fetched.
const SOURCE='https://raw.githubusercontent.com/kunalkushwaha/vsim/main/packages/assets/library/';
const MODEL_URLS=Object.freeze({
  suited:`${SOURCE}suited.glb`,
  woman:`${SOURCE}human.glb`,
  man:`${SOURCE}man.glb`,
  speaker:`${SOURCE}speaker.glb`
});

const CAST=Object.freeze({
  player:{asset:'suited',height:1.82,width:1.02,depth:1.00,hair:0x211d1a,hairStyle:'sidepart',satchel:true},
  Aiko:{asset:'woman',height:1.63,width:.92,depth:.95,hair:0x211b19,hairStyle:'bob',scarf:0x8c4d49},
  Kenji:{asset:'man',height:1.77,width:1.03,depth:1.00,hair:0x171717,hairStyle:'crop',workCap:0x294b60},
  'Mrs Sato':{asset:'speaker',height:1.56,width:.95,depth:.97,hair:0x706b66,hairStyle:'bun',stoop:.045,apron:0xb9ad96},
  'Harbour master':{asset:'man',height:1.74,width:1.13,depth:1.09,hair:0x37322e,hairStyle:'receding',peakedCap:0x233c4b}
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
      console.warn(`[Johansson Town] high-detail ${key} character unavailable; using local fallback`,error);
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

function profileFor(entity){return CAST[entity.userData.name||'player']||CAST.player;}
function clipByName(clips,name){return clips.find(c=>c.name.toLowerCase()===name)||clips.find(c=>c.name.toLowerCase().includes(name));}
function findBone(root,...names){
  const exact=new Set(names.map(n=>n.toLowerCase()));let fuzzy=null;
  root.traverse(o=>{if(!o.isBone)return;const n=o.name.toLowerCase();if(exact.has(n))fuzzy=o;else if(!fuzzy&&names.some(x=>n.endsWith(x.toLowerCase())))fuzzy=o;});
  return fuzzy;
}

function mat(color,rough=.68,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function addMesh(parent,geo,material,pos=[0,0,0],scale=[1,1,1]){
  const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}

function makeHair(style,color,height){
  const g=new THREE.Group(),m=mat(color,.72),r=height*.105;
  const scalp=addMesh(g,new THREE.SphereGeometry(r,28,18,0,Math.PI*2,0,Math.PI*.62),m,[0,0,0],[.92,.72,.94]);scalp.rotation.y=Math.PI/2;
  if(style==='bob'){
    for(const z of [-1,1])addMesh(g,new THREE.CapsuleGeometry(r*.28,r*.68,6,12),m,[0,-r*.30,z*r*.72],[1,1,.82]);
    addMesh(g,new THREE.SphereGeometry(r*.92,24,14,0,Math.PI*2,0,Math.PI*.64),m,[0,-r*.12,r*.22],[1,.92,.78]);
  }else if(style==='bun'){
    addMesh(g,new THREE.SphereGeometry(r*.46,22,14),m,[0,r*.25,r*.72],[1,1.05,1]);
  }else if(style==='crop'){
    scalp.scale.y=.50;
    for(let i=-2;i<=2;i++){const s=addMesh(g,new THREE.ConeGeometry(r*.11,r*.30,8),m,[i*r*.20,r*.20,-r*.42]);s.rotation.x=-.32;s.rotation.z=i*.04;}
  }else if(style==='receding'){
    scalp.scale.set(.92,.38,.94);scalp.position.z=r*.18;
    for(const z of [-1,1])addMesh(g,new THREE.CapsuleGeometry(r*.14,r*.30,5,10),m,[0,-r*.12,z*r*.77],[.9,1,.9]);
  }else{
    scalp.scale.y=.54;
    for(let i=-2;i<=2;i++){const s=addMesh(g,new THREE.CapsuleGeometry(r*.13,r*.28,5,10),m,[i*r*.19,r*.16,-r*.42]);s.rotation.z=-.35+i*.07;}
  }
  return g;
}

function makeCap(color,peaked=false,height=1.75){
  const g=new THREE.Group(),r=height*.112,m=mat(color,.58),band=mat(0x182126,.48);
  addMesh(g,new THREE.SphereGeometry(r,26,14,0,Math.PI*2,0,Math.PI*.48),m,[0,0,0],[1.02,.52,1.02]);
  const bill=addMesh(g,new THREE.CapsuleGeometry(r*.12,r*.70,5,12),m,[0,-r*.08,-r*.62],[1,.22,.78]);bill.rotation.z=Math.PI/2;bill.rotation.x=.12;
  if(peaked){addMesh(g,new THREE.TorusGeometry(r*.78,r*.055,8,24,Math.PI),band,[0,-r*.02,-r*.10],[1,1,.92]);addMesh(g,new THREE.SphereGeometry(r*.10,12,8),mat(0xb79b58,.42,.22),[0,-r*.02,-r*.78]);}
  return g;
}

function anchorAccessory(wrapper,bone,object,position){
  wrapper.add(object);object.position.copy(position);wrapper.updateMatrixWorld(true);bone?.attach(object);return object;
}

function decorate(actor){
  const {wrapper,model,profile,height,localBox}=actor;
  model.updateMatrixWorld(true);
  const box=localBox,center=box.getCenter(new THREE.Vector3());
  const headBone=findBone(model,'head','mixamorigHead','DEF-spine006');
  const neckBone=findBone(model,'neck_01','neck','mixamorigNeck','DEF-spine005');
  const spineBone=findBone(model,'spine_02','spine2','mixamorigSpine2','DEF-spine003');
  const headPos=new THREE.Vector3(center.x,box.max.y-height*.055,center.z);
  if(profile.hairStyle)anchorAccessory(wrapper,headBone,makeHair(profile.hairStyle,profile.hair,height),headPos);
  if(profile.workCap)anchorAccessory(wrapper,headBone,makeCap(profile.workCap,false,height),headPos.clone().add(new THREE.Vector3(0,height*.020,0)));
  if(profile.peakedCap)anchorAccessory(wrapper,headBone,makeCap(profile.peakedCap,true,height),headPos.clone().add(new THREE.Vector3(0,height*.022,0)));
  if(profile.scarf){
    const scarf=new THREE.Group(),sm=mat(profile.scarf,.78);addMesh(scarf,new THREE.TorusGeometry(height*.071,height*.016,10,28),sm,[0,0,0],[1,.72,1]);
    anchorAccessory(wrapper,neckBone,scarf,new THREE.Vector3(center.x,box.max.y-height*.165,center.z));
  }
  if(profile.satchel){
    const bag=new THREE.Group(),leather=mat(0x49372c,.63),metal=mat(0xb29b70,.45,.15);
    addMesh(bag,new THREE.BoxGeometry(height*.20,height*.22,height*.075),leather,[height*.15,-height*.16,height*.075]);
    const strap=addMesh(bag,new THREE.TorusGeometry(height*.24,height*.011,8,32,Math.PI*1.22),leather,[0,0,0]);strap.rotation.z=-.55;
    addMesh(bag,new THREE.BoxGeometry(height*.055,height*.018,height*.010),metal,[height*.15,-height*.11,height*.116]);
    anchorAccessory(wrapper,spineBone,bag,new THREE.Vector3(center.x,box.max.y-height*.39,center.z));
  }
  if(profile.apron){
    const apron=addMesh(wrapper,new THREE.PlaneGeometry(height*.31,height*.43,6,8),mat(profile.apron,.88),[center.x,box.max.y-height*.49,center.z-height*.105]);
    apron.rotation.y=Math.PI;apron.material.side=THREE.DoubleSide;
  }
}

function prepareMaterials(root){
  root.traverse(o=>{
    if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;
    const list=Array.isArray(o.material)?o.material:[o.material];
    const prepared=list.map(src=>{
      if(!src)return src;const m=src.clone();
      if(m.map){m.map.colorSpace=THREE.SRGBColorSpace;m.map.anisotropy=Math.max(m.map.anisotropy||1,4);}
      if('roughness' in m)m.roughness=Math.max(.38,Math.min(.86,m.roughness??.68));
      if('metalness' in m)m.metalness=Math.min(.35,m.metalness??0);
      m.dithering=true;return m;
    });
    o.material=Array.isArray(o.material)?prepared:prepared[0];
  });
}

function instantiate(profile){
  const source=loaded.get(profile.asset);if(!source?.scene)return null;
  const model=cloneSkinned(source.scene);prepareMaterials(model);
  const wrapper=new THREE.Group();wrapper.name='AAA-character';wrapper.add(model);
  model.rotation.y=Math.PI/2;model.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(model),rawHeight=Math.max(.01,box.max.y-box.min.y),scale=profile.height/rawHeight;
  model.scale.setScalar(scale);model.updateMatrixWorld(true);box.setFromObject(model);model.position.y-=box.min.y;model.updateMatrixWorld(true);
  const localBox=new THREE.Box3().setFromObject(model);
  wrapper.scale.set(profile.width,1,profile.depth);wrapper.rotation.x=profile.stoop||0;
  return {wrapper,model,height:profile.height,clips:source.animations||[],localBox};
}

export function createCharacters(options={}){
  const fallback=createFallbackCharacters(options),actors=[];

  function attach(entity,file,height){
    const profile={...profileFor(entity)};if(entity.userData.name==='player'&&height)profile.height=height;
    const instance=instantiate(profile);
    if(!instance)return fallback.attach(entity,file,height);
    const oldChildren=[...entity.children];oldChildren.forEach(c=>c.visible=false);
    entity.add(instance.wrapper);
    const mixer=new THREE.AnimationMixer(instance.model),clips=instance.clips;
    const actions={};for(const name of ['idle','walk','run','wave']){const clip=clipByName(clips,name);if(clip)actions[name]=mixer.clipAction(clip);}
    const actor={entity,profile,...instance,mixer,actions,current:null,gestureTime:0,lastPosition:entity.position.clone(),speed:0};
    actors.push(actor);entity.userData.character=actor;decorate(actor);
    const idle=actions.idle||actions.walk;if(idle){idle.reset().setLoop(THREE.LoopRepeat,Infinity).play();actor.current=idle;}
    return actor;
  }

  function transition(actor,name,fade=.20){
    const next=actor.actions[name]||actor.actions.idle||actor.actions.walk;if(!next||next===actor.current)return;
    next.enabled=true;next.setLoop(THREE.LoopRepeat,Infinity);next.reset().play();
    actor.current?.crossFadeTo(next,fade,false);actor.current=next;
  }

  function gesture(entity){
    const actor=actors.find(a=>a.entity===entity);if(!actor)return fallback.gesture(entity);
    const wave=actor.actions.wave;if(!wave){actor.gestureTime=.8;return;}
    actor.gestureTime=Math.max(.5,wave.getClip().duration);wave.reset().setLoop(THREE.LoopOnce,1);wave.clampWhenFinished=true;wave.play();actor.current?.crossFadeTo(wave,.16,false);actor.current=wave;
  }

  function update(dt){
    fallback.update(dt);
    for(const a of actors){
      const raw=a.entity.position.distanceTo(a.lastPosition)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);a.speed=THREE.MathUtils.damp(a.speed,Math.min(raw,7),9,dt);
      if(a.gestureTime>0){a.gestureTime=Math.max(0,a.gestureTime-dt);if(a.gestureTime===0)transition(a,a.speed>3.6?'run':a.speed>.08?'walk':'idle',.18);}
      else transition(a,a.speed>3.6?'run':a.speed>.08?'walk':'idle');
      if(a.current===a.actions.walk)a.current.timeScale=THREE.MathUtils.clamp(a.speed/1.35,.72,1.65);
      else if(a.current===a.actions.run)a.current.timeScale=THREE.MathUtils.clamp(a.speed/4.2,.75,1.45);
      else if(a.current===a.actions.idle)a.current.timeScale=.88;
      a.mixer.update(dt);
    }
  }

  return {attach,gesture,update,actors,preloaded:()=>loaded.size,profiles:CAST};
}
