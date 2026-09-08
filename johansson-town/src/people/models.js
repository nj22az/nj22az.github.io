import {smoothCharacterNormals,dressCharacter} from './surface.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {clone} from '../../vendor/SkeletonUtils.js';
import {assetURL} from '../assets.js';
import {PROFILES} from './profiles.js';

const SOURCES=['worker','suit','casual_2','female_casual','female_formal'];
const loaded=new Map();let pending=null;
export function preloadModels({onProgress}={}){
  if(pending)return pending;
  const loader=new GLTFLoader();let complete=0;
  pending=Promise.allSettled(SOURCES.map(async id=>{
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),2500);
    try{
      const response=await fetch(assetURL('characters/residents/town-'+id+'.glb'),{signal:abort.signal});
      if(!response.ok)throw Error('Local character unavailable: '+id);
      const data=await response.arrayBuffer();
      const gltf=await loader.parseAsync(data,'');gltf.scene.traverse(o=>{if(o.isSkinnedMesh){smoothCharacterNormals(o.geometry);o.material.flatShading=false;o.material.roughness=.78;o.material.dithering=true;}});loaded.set(id,gltf);
    }catch(error){console.warn('Using procedural character fallback for '+id,error.message);}
    finally{clearTimeout(timeout);onProgress?.(++complete/SOURCES.length,id,loaded.has(id));}
  })).then(()=>({ready:loaded.size,total:SOURCES.length}));
  return pending;
}
function sourceFor(name,profile){
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
    model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale;model.rotation.y=Math.PI;
    model.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=shadows;o.frustumCulled=false;dressCharacter(o,profile?.top);}});
    for(const child of entity.children)child.visible=false;
    entity.add(model);entity.userData.visualSource='Quaternius / '+source;
    const mixer=new THREE.AnimationMixer(model),actions=new Map(asset.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
    const actor={entity,model,mixer,actions,current:null,last:entity.position.clone(),gestureTime:0,speed:0};
    byEntity.set(entity,actor);actors.push(actor);return actor;
  }
  function update(dt){
    for(const actor of actors){const {entity,mixer,actions}=actor;
      if(!entity.visible){actor.last.copy(entity.position);continue;}
      const distance=entity.position.distanceTo(actor.last);actor.last.copy(entity.position);
      actor.speed=THREE.MathUtils.damp(actor.speed,distance/Math.max(dt,.001),12,dt);
      actor.gestureTime=Math.max(0,actor.gestureTime-dt);
      const clip=actor.gestureTime?'Wave':actor.speed>3.5?'Run':actor.speed>.12?'Walk':'Idle_Neutral';
      if(actor.current!==clip){const previous=actions.get(actor.current),next=actions.get(clip)||actions.get('Idle');next.reset().play();if(previous)previous.crossFadeTo(next,.22,false);actor.current=clip;}
      const locomotion=actions.get(actor.current);if(locomotion&&actor.current==='Walk')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/1.25,.55,1.45);else if(locomotion&&actor.current==='Run')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/4,.7,1.4);
      mixer.update(dt);
    }
  }
  return {attach,update,actors,gesture(entity){const actor=byEntity.get(entity);if(!actor)return false;actor.gestureTime=1.2;return true;}};
}
