import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {clone} from '../../vendor/SkeletonUtils.js';
import {assetURL} from '../assets.js';
import {celFrom} from '../render/cel.js';

const cache=new Map();
export const OWNED_CHARACTERS=Object.freeze({barfly:{height:1.5,clip:'Idle'},Jonsson:{height:1.35,clip:'Work'},merry_Moose:{height:.62},Maneki_neko_Colorful:{height:.32,path:'models/owned/maneki-neko-display.glb',static:true},thuanFigurine:{height:.24,path:"figurines/thuan/thuan-display.glb",static:true}});
function load(kind){
 // FileLoader re-wraps the fetch body in a progress ReadableStream. Chromium can
 // report ERR_ABORTED at that stream's teardown even when the GLB parsed fully.
 // These owned assets have no progress UI: consume the native response to EOF
 // before parsing, preserving real HTTP, transport and glTF errors.
 if(!cache.has(kind))cache.set(kind,(async()=>{
  const url=assetURL(OWNED_CHARACTERS[kind].path||'models/owned/'+kind+'.glb');
  const response=await fetch(url);
  if(!response.ok)throw Error(`Owned asset ${url}: HTTP ${response.status}`);
  const data=await response.arrayBuffer();
  return new GLTFLoader().parseAsync(data,new URL('.',url).href);
 })().then(g=>{
  const material=m=>{if(kind==='thuanFigurine'){m.userData.keepPhysical=true;m.userData.keepPhysicalStrict=true;return m;}return celFrom(m,{bands:3});};
  g.scene.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(material):material(o.material);o.castShadow=o.receiveShadow=true;}});return g;
 }).catch(e=>{cache.delete(kind);throw e;}));return cache.get(kind);
}
/** Each instance owns its skeleton/mixer; cached geometry and textures are shared. */
export function addOwnedCharacter({parent,kind,position=[0,0,0],yaw=0,height=null,staticDisplay=false}){
 const spec=OWNED_CHARACTERS[kind];if(!spec)throw Error('Unknown owned character '+kind);
 const holder=new THREE.Group();holder.name=kind;holder.position.set(...position);holder.rotation.y=yaw;holder.userData.sharedAsset=true;parent.add(holder);
 let mixer=null,current=null,disposed=false,model=null;const actions=new Map();
 function play(name){if(disposed)return false;const next=actions.get(name);if(!next||next===current)return false;current?.fadeOut(.25);next.reset().fadeIn(.25).play();current=next;holder.userData.animation=name;return true;}
 const ready=typeof window==='undefined'||!window.document?Promise.resolve(false):load(kind).then(g=>{
  if(disposed)return false;model=clone(g.scene);model.updateMatrixWorld(true);
  // Exported character meshes are authored with their soles on zero, facing +Z
  // after glTF's coordinate conversion. Props retain their source origin.
  if(!g.animations.length||spec.static||staticDisplay){const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),centre=bounds.getCenter(new THREE.Vector3());model.position.set(-centre.x,-bounds.min.y,-centre.z);holder.scale.setScalar((height??spec.height)/size.y);}
  holder.add(model);mixer=new THREE.AnimationMixer(model);for(const clip of (spec.static||staticDisplay?[]:g.animations))actions.set(clip.name,mixer.clipAction(clip));play(spec.clip||'Idle');holder.userData.rigged=actions.size>0;holder.userData.ready=true;return true;
 }).catch(e=>{holder.userData.loadError=true;console.error('Owned character unavailable: '+kind,e);return false;});
 return {holder,ready,play,update(dt){if(!disposed&&holder.visible)mixer?.update(Math.min(.1,Math.max(0,dt)));},dispose(){disposed=true;mixer?.stopAllAction();if(model)mixer?.uncacheRoot(model);holder.removeFromParent();}};
}
