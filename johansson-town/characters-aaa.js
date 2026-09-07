import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createCharacters as createFallbackCharacters } from './characters-cel.js?v=12';

// Naturalistic adult cast for Johansson Town.
// Source models are MakeHuman / MPFB2 exports published CC0 by the vsim project.
// The reference direction is realistic Japanese adults: restrained silhouettes,
// matte skin/hair response, subtle greetings and locomotion without root drift.
const SOURCE='https://raw.githubusercontent.com/kunalkushwaha/vsim/main/packages/assets/library/';
const MODEL_URLS=Object.freeze({
  suited:`${SOURCE}suited.glb`,
  woman:`${SOURCE}human.glb`,
  man:`${SOURCE}man.glb`,
  speaker:`${SOURCE}speaker.glb`
});

const CAST=Object.freeze({
  player:{asset:'suited',height:1.80,width:1.00,depth:1.00,hair:0x1d1917,hairStyle:'sidepart',satchel:true},
  Aiko:{asset:'woman',height:1.59,width:.97,depth:.99,hair:0x171313,hairStyle:'ponytail',necklace:true},
  Kenji:{asset:'man',height:1.76,width:1.00,depth:1.00,hair:0x141414,hairStyle:'crop',workCap:0x294b60},
  'Mrs Sato':{asset:'speaker',height:1.55,width:.98,depth:1.00,hair:0x6d6864,hairStyle:'bun',stoop:.026,apron:0xb9ad96},
  'Harbour master':{asset:'man',height:1.74,width:1.04,depth:1.02,hair:0x35302c,hairStyle:'receding',peakedCap:0x233c4b}
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
      console.warn(`[Johansson Town] naturalistic ${key} character unavailable; using local fallback`,error);
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
  const wanted=names.map(n=>n.toLowerCase());let exact=null,fuzzy=null;
  root.traverse(o=>{
    if(!o.isBone)return;
    const n=o.name.toLowerCase();
    if(!exact&&wanted.includes(n))exact=o;
    if(!fuzzy&&wanted.some(x=>n.endsWith(x)))fuzzy=o;
  });
  return exact||fuzzy;
}

function sanitiseClip(sourceClip){
  // The town owns world-space movement. Keep the authored gait, but remove
  // forward/back root translation so characters do not skate or lurch.
  const clip=sourceClip.clone();
  clip.tracks.forEach(track=>{
    if(!/\.position$/i.test(track.name)||track.getValueSize?.()!==3)return;
    const node=track.name.slice(0,track.name.lastIndexOf('.')).toLowerCase();
    if(!/(hips|pelvis|root|armature)$/.test(node))return;
    const v=track.values,baseX=v[0],baseZ=v[2];
    for(let i=0;i<v.length;i+=3){v[i]=baseX;v[i+2]=baseZ;}
  });
  return clip;
}

function mat(color,rough=.82,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function addMesh(parent,geo,material,pos=[0,0,0],scale=[1,1,1]){
  const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}

function makeHair(style,color,height){
  const g=new THREE.Group(),m=mat(color,.90),r=height*.103;
  const scalp=addMesh(g,new THREE.SphereGeometry(r,30,20,0,Math.PI*2,0,Math.PI*.66),m,[0,0,0],[.94,.62,.97]);
  scalp.rotation.y=Math.PI/2;

  if(style==='ponytail'){
    // Smooth crown, wispy full fringe, two face-framing strands and a low tied ponytail.
    for(let i=-4;i<=4;i++){
      const lock=addMesh(g,new THREE.CapsuleGeometry(r*.055,r*.23,5,10),m,[i*r*.155,-r*.10,-r*.77],[1,1,.78]);
      lock.rotation.x=.06;lock.rotation.z=i*.012;
    }
    for(const side of [-1,1]){
      const strand=addMesh(g,new THREE.CapsuleGeometry(r*.07,r*.52,6,11),m,[side*r*.76,-r*.28,-r*.34],[.84,1,.82]);
      strand.rotation.z=-side*.04;
    }
    addMesh(g,new THREE.SphereGeometry(r*.105,14,10),mat(0x2a2020,.88),[0,-r*.02,r*.80]);
    const tail=addMesh(g,new THREE.CapsuleGeometry(r*.22,r*.84,8,14),m,[0,-r*.52,r*.91],[.72,1,.68]);
    tail.rotation.x=.10;
  }else if(style==='bun'){
    scalp.scale.y=.58;
    addMesh(g,new THREE.SphereGeometry(r*.43,24,16),m,[0,r*.16,r*.72],[1,.96,1]);
  }else if(style==='crop'){
    scalp.scale.y=.43;
    scalp.position.y=r*.03;
  }else if(style==='receding'){
    scalp.scale.set(.92,.34,.95);scalp.position.z=r*.16;
    for(const side of [-1,1])addMesh(g,new THREE.CapsuleGeometry(r*.10,r*.24,5,9),m,[side*r*.69,-r*.10,r*.03],[.78,1,.78]);
  }else{
    // Side part without spikes or toy-like quiffs.
    scalp.scale.y=.48;
    const left=addMesh(g,new THREE.CapsuleGeometry(r*.075,r*.38,5,10),m,[-r*.28,-r*.02,-r*.66],[1,.92,.74]);
    const right=addMesh(g,new THREE.CapsuleGeometry(r*.07,r*.30,5,10),m,[r*.22,-r*.01,-r*.67],[1,.90,.74]);
    left.rotation.z=-.18;right.rotation.z=.13;
  }
  return g;
}

function makeCap(color,peaked=false,height=1.75){
  const g=new THREE.Group(),r=height*.110,m=mat(color,.78),band=mat(0x182126,.68);
  addMesh(g,new THREE.SphereGeometry(r,28,16,0,Math.PI*2,0,Math.PI*.47),m,[0,0,0],[1.01,.48,1.01]);
  const bill=addMesh(g,new THREE.BoxGeometry(r*1.10,r*.10,r*.56),m,[0,-r*.05,-r*.58],[1,.6,1]);bill.rotation.x=-.05;
  if(peaked){
    addMesh(g,new THREE.BoxGeometry(r*1.25,r*.10,r*.08),band,[0,-r*.01,-r*.28]);
    addMesh(g,new THREE.SphereGeometry(r*.07,12,8),mat(0xb79b58,.55,.15),[0,-r*.02,-r*.75]);
  }
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

  actor.headBone=headBone;actor.neckBone=neckBone;actor.spineBone=spineBone;
  if(profile.hairStyle)anchorAccessory(wrapper,headBone,makeHair(profile.hairStyle,profile.hair,height),headPos);
  if(profile.workCap)anchorAccessory(wrapper,headBone,makeCap(profile.workCap,false,height),headPos.clone().add(new THREE.Vector3(0,height*.020,0)));
  if(profile.peakedCap)anchorAccessory(wrapper,headBone,makeCap(profile.peakedCap,true,height),headPos.clone().add(new THREE.Vector3(0,height*.022,0)));

  if(profile.necklace){
    const chain=new THREE.Group(),silver=mat(0xb8b7b3,.52,.28);
    const loop=addMesh(chain,new THREE.TorusGeometry(height*.058,height*.0045,7,28),silver,[0,0,0],[1,.72,1]);loop.rotation.x=Math.PI/2;
    addMesh(chain,new THREE.SphereGeometry(height*.009,10,8),silver,[0,-height*.065,-height*.016],[.65,1,.65]);
    anchorAccessory(wrapper,neckBone,chain,new THREE.Vector3(center.x,box.max.y-height*.178,center.z-height*.010));
  }
  if(profile.satchel){
    const bag=new THREE.Group(),leather=mat(0x49372c,.78),metal=mat(0xb29b70,.55,.12);
    addMesh(bag,new THREE.BoxGeometry(height*.19,height*.20,height*.065),leather,[height*.15,-height*.16,height*.07]);
    const strap=addMesh(bag,new THREE.TorusGeometry(height*.235,height*.009,8,30,Math.PI*1.22),leather,[0,0,0]);strap.rotation.z=-.55;
    addMesh(bag,new THREE.BoxGeometry(height*.05,height*.015,height*.009),metal,[height*.15,-height*.11,height*.105]);
    anchorAccessory(wrapper,spineBone,bag,new THREE.Vector3(center.x,box.max.y-height*.39,center.z));
  }
  if(profile.apron){
    const apron=addMesh(wrapper,new THREE.PlaneGeometry(height*.30,height*.42,5,7),mat(profile.apron,.91),[center.x,box.max.y-height*.49,center.z-height*.105]);
    apron.rotation.y=Math.PI;apron.material.side=THREE.DoubleSide;
  }
}

function prepareMaterials(root){
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;
    const srcList=Array.isArray(o.material)?o.material:[o.material];
    const prepared=srcList.map(src=>{
      if(!src)return src;
      const m=src.clone();
      if(m.map){m.map.colorSpace=THREE.SRGBColorSpace;m.map.anisotropy=Math.max(m.map.anisotropy||1,4);}
      if('roughness' in m)m.roughness=THREE.MathUtils.clamp(m.roughness??.72,.56,.92);
      if('metalness' in m)m.metalness=Math.min(.18,m.metalness??0);
      if(m.normalScale?.multiplyScalar)m.normalScale.multiplyScalar(.72);
      if('envMapIntensity' in m)m.envMapIntensity=Math.min(.65,m.envMapIntensity??.65);
      m.dithering=true;
      return m;
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
  const clips=(source.animations||[]).map(sanitiseClip);
  return {wrapper,model,height:profile.height,clips,localBox};
}

export function createCharacters(options={}){
  const fallback=createFallbackCharacters(options),actors=[];

  function attach(entity,file,height){
    const profile={...profileFor(entity)};if(entity.userData.name==='player'&&height)profile.height=height;
    const instance=instantiate(profile);
    if(!instance)return fallback.attach(entity,file,height);

    [...entity.children].forEach(c=>c.visible=false);
    entity.add(instance.wrapper);
    const mixer=new THREE.AnimationMixer(instance.model),clips=instance.clips;
    const actions={};
    for(const name of ['idle','walk','run','wave']){
      const clip=clipByName(clips,name);if(clip)actions[name]=mixer.clipAction(clip);
    }
    const actor={entity,profile,...instance,mixer,actions,current:null,state:'idle',gestureTime:0,gestureDuration:.78,lastPosition:entity.position.clone(),speed:0};
    actors.push(actor);entity.userData.character=actor;decorate(actor);

    const idle=actions.idle||actions.walk;
    if(idle){idle.reset().setLoop(THREE.LoopRepeat,Infinity).setEffectiveWeight(1).play();idle.timeScale=.72;actor.current=idle;}
    return actor;
  }

  function transition(actor,name,fade=.32){
    const next=actor.actions[name]||actor.actions.idle||actor.actions.walk;
    if(!next||next===actor.current){actor.state=name;return;}
    next.enabled=true;next.setLoop(THREE.LoopRepeat,Infinity);next.reset().setEffectiveWeight(1).play();
    actor.current?.crossFadeTo(next,fade,false);actor.current=next;actor.state=name;
  }

  function gesture(entity){
    const actor=actors.find(a=>a.entity===entity);if(!actor)return fallback.gesture(entity);
    // Deliberately avoid the large stock full-body wave. A small nod/acknowledgement
    // reads much more naturally in close conversation and fits the Japanese setting.
    actor.gestureDuration=.78;actor.gestureTime=actor.gestureDuration;
  }

  function update(dt){
    fallback.update(dt);
    for(const a of actors){
      const raw=a.entity.position.distanceTo(a.lastPosition)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);
      const bounded=raw>8?0:Math.min(raw,4.8);
      a.speed=THREE.MathUtils.damp(a.speed,bounded,6.5,dt);

      let desired='idle';
      if(a.speed>2.65)desired='run';else if(a.speed>.14)desired='walk';
      if(desired!==a.state)transition(a,desired,desired==='idle'?.36:.30);

      if(a.current===a.actions.walk)a.current.timeScale=THREE.MathUtils.clamp(a.speed/1.55,.70,1.12);
      else if(a.current===a.actions.run)a.current.timeScale=THREE.MathUtils.clamp(a.speed/3.65,.78,1.12);
      else if(a.current===a.actions.idle)a.current.timeScale=.72;

      a.mixer.update(dt);

      if(a.gestureTime>0){
        a.gestureTime=Math.max(0,a.gestureTime-dt);
        const p=1-a.gestureTime/a.gestureDuration;
        const envelope=Math.sin(Math.PI*THREE.MathUtils.clamp(p,0,1));
        if(a.headBone)a.headBone.rotateX(-envelope*.065);
        if(a.neckBone)a.neckBone.rotateY(Math.sin(p*Math.PI*2)*.012*envelope);
      }
    }
  }

  return {attach,gesture,update,actors,preloaded:()=>loaded.size,profiles:CAST};
}
