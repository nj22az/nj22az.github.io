import {prepareYuriAnimations} from './yuri-animation.js?yuri-greeting-1';
import {smoothCharacterNormals,dressCharacter} from './surface.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {clone} from '../../vendor/SkeletonUtils.js';
import {assetURL} from '../assets.js';
import {PROFILES} from './profiles.js';

const SOURCES=['suit','yui','yuri-playful',...PROFILES.map(p=>p.model)];
const loaded=new Map();let pending=null;
export function preloadModels({onProgress}={}){
  if(pending)return pending;
  const loader=new GLTFLoader();let complete=0;
  pending=Promise.allSettled(SOURCES.map(async id=>{
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),15000);
    try{
      const response=await fetch(assetURL(id.startsWith('resident-')?'characters/living/'+id+'.glb':['kenji','yui','yuri-playful'].includes(id)?'characters/realistic/'+id+'.glb'+(id==='yuri-playful'?'?yuri-rig-2':''):'characters/residents/town-'+id+'.glb'),{signal:abort.signal});
      if(!response.ok)throw Error('Local character unavailable: '+id);
      const data=await response.arrayBuffer();
      const gltf=await loader.parseAsync(data,'');gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&!id.startsWith('resident-')&&!['kenji','yui','yuri-playful'].includes(id)){smoothCharacterNormals(o.geometry);o.material.flatShading=false;o.material.roughness=.78;o.material.dithering=true;}});if(id==='yuri-playful')gltf.animations=prepareYuriAnimations(gltf);loaded.set(id,gltf);
    }catch(error){console.warn('Using procedural character fallback for '+id,error.message);}
    finally{clearTimeout(timeout);onProgress?.(++complete/SOURCES.length,id,loaded.has(id));}
  })).then(()=>({ready:loaded.size,total:SOURCES.length}));
  return pending;
}
function sourceFor(name,profile){
  if(name==='Yuri'&&loaded.has('yuri-playful'))return 'yuri-playful';
  if(name==='Yui'||name==='Yuri')return loaded.has('yui')?'yui':'female_casual';
  if(profile?.model&&loaded.has(profile.model))return profile.model;
  if(name==='player'||name==='Johansson')return 'suit';
  if(profile?.female)return profile.age>=50?'female_formal':'female_casual';
  if(name==='Harbour master'||profile?.role==='policeman'||profile?.role==='bus driver')return 'suit';
  return /repair|engineer|fish|ice/.test(profile?.role||'')?'worker':'casual_2';
}
export function createLocalCharacters({shadows=false}={}){
  const actors=[],byEntity=new Map();
  function attach(entity,name,height){
    const profile=PROFILES.find(p=>p.name===name),source=sourceFor(name,profile),asset=loaded.get(source);
    if(!asset)return null;
    const model=clone(asset.scene),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    const scale=(height||profile?.height||1.75)/size.y;
    model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale;model.rotation.y=source.startsWith('resident-')?0:Math.PI;
    model.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=shadows;o.frustumCulled=false;if(!source.startsWith('resident-')&&!['kenji','yui','yuri-playful'].includes(source))dressCharacter(o,profile?.top);}});
    for(const child of entity.children)child.visible=false;
    entity.add(model);entity.userData.visualSource=source.startsWith('resident-')?'Original Blender living cast · '+name:source==='yuri-playful'?'User-supplied Meshy · Yuri':['kenji','yui','yuri-playful'].includes(source)?'Blender / MakeHuman · '+name:'Quaternius / '+source;
    const mixer=new THREE.AnimationMixer(model),actions=new Map(asset.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
    if(source==='yuri-playful'){
      const wave=actions.get('Wave');if(wave){wave.setLoop(THREE.LoopOnce,1);wave.clampWhenFinished=true;}
    }
    let cup=null;
    if(source.startsWith('resident-')){const hand=model.getObjectByName('ForearmR');if(hand){cup=new THREE.Mesh(new THREE.CylinderGeometry(.04,.032,.085,12),new THREE.MeshStandardMaterial({color:0xe8c79c,roughness:.42}));cup.position.set(0,.25,-.025);cup.visible=false;hand.add(cup);}}
    const actor={cup,entity,model,mixer,actions,current:null,last:entity.position.clone(),gestureTime:0,speed:0,isYuri:source==='yuri-playful'};
    byEntity.set(entity,actor);actors.push(actor);return actor;
  }
  function update(dt){
    for(const actor of actors){const {entity,mixer,actions}=actor;
      if(!entity.visible){actor.last.copy(entity.position);continue;}
      const distance=entity.position.distanceTo(actor.last);actor.last.copy(entity.position);
      actor.speed=THREE.MathUtils.damp(actor.speed,distance/Math.max(dt,.001),12,dt);
      actor.gestureTime=Math.max(0,actor.gestureTime-dt);
      if(actor.cup)actor.cup.visible=entity.userData.socialPose==='Drink';
      if(actions.size===0)continue;
      const requested=entity.userData.socialPose|| (actor.gestureTime?'Wave':actor.speed>3.5?'Run':actor.speed>.12?'Walk':'Idle_Neutral');
      const clip=[requested,'Idle_Neutral','Idle'].find(name=>actions.has(name));
      if(!clip)continue;
      if(actor.current!==clip){const previous=actions.get(actor.current),next=actions.get(clip);next.reset().play();if(previous)previous.crossFadeTo(next,.22,false);actor.current=clip;}
      const locomotion=actions.get(actor.current);if(locomotion&&actor.current==='Walk')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/1.25,.55,1.45);else if(locomotion&&actor.current==='Run')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/4,.7,1.4);
      mixer.update(dt);
    }
  }
  return {attach,update,actors,gesture(entity){const actor=byEntity.get(entity);if(!actor)return false;if(actor.isYuri&&actor.gestureTime>0)return true;actor.gestureTime=actor.isYuri?(actor.actions.get('Wave')?.getClip().duration||1.2):1.2;return true;}};
}
