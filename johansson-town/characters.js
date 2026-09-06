import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { clone } from './vendor/SkeletonUtils.js';

// CC0 Kenney Mini Characters. Loaded after the playable town starts.
// Each palette is embedded in its GLB, so there are no remote asset dependencies.
export function createCharacters({mobile,onError}) {
  const loader=new GLTFLoader(),cache=new Map(),actors=[];
  function source(file){if(!cache.has(file))cache.set(file,loader.loadAsync(new URL(`./assets/characters/${file}`,import.meta.url).href));return cache.get(file);}
  async function attach(entity,file,height=1.8) {
    const fallback=[...entity.children];
    try {
      const gltf=await source(file),model=clone(gltf.scene);
      model.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),scale=height/Math.max(.01,size.y);
      model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale;
      // Kenney's characters face +Z. Game actors move towards local -Z.
      model.rotation.y=Math.PI;
      model.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=true;o.frustumCulled=false;}});
      entity.add(model);fallback.forEach(o=>o.visible=false);
      const mixer=new THREE.AnimationMixer(model),clips=gltf.animations,actions=new Map();
      for(const clip of clips)actions.set(clip.name.toLowerCase(),mixer.clipAction(clip));
      const actor={entity,mixer,actions,action:null,gesture:0,lastPosition:entity.position.clone()};actors.push(actor);play(actor,'idle');entity.userData.character=actor;
      return actor;
    }catch(error){onError?.(file,error);return null;}
  }
  function play(actor,name){const next=actor.actions.get(name)||actor.actions.get('idle');if(!next||next===actor.action)return;actor.action?.fadeOut(.18);next.reset().fadeIn(.18).play();actor.action=next;}
  function gesture(entity){const actor=entity.userData.character;if(actor){actor.gesture=1.3;play(actor,'emote-yes');}}
  function update(dt){for(const a of actors){const speed=a.entity.position.distanceTo(a.lastPosition)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);if(a.gesture>0)a.gesture-=dt;else play(a,speed>3.5?'sprint':speed>.05?'walk':'idle');a.mixer.update(dt);}}
  return {attach,gesture,update,actors};
}
