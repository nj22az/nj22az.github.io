import {assetURL} from '../assets.js';
import * as THREE from '../../vendor/three.module.js';

export function createMaterials({mobile=false,anisotropy=4}={}) {
  const textures=new Map(),materials=new Map(),loader=new THREE.TextureLoader();
  function texture(path,colour=false){if(textures.has(path))return textures.get(path);const t=loader.load(assetURL(path),undefined,undefined,()=>{});t.colorSpace=colour?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(anisotropy,mobile?2:8);textures.set(path,t);return t;}
  function material(kind='plaster',colour=0xffffff){const id=kind+'/'+colour;if(materials.has(id))return materials.get(id);const map=texture(kind+'.jpg',true),normalMap=texture('materials/'+kind+'-nor_gl.jpg'),arm=texture('materials/'+kind+'-arm.jpg');const m=new THREE.MeshStandardMaterial({color:colour,map,normalMap,normalScale:new THREE.Vector2(.5,.5),roughnessMap:arm,aoMap:arm,aoMapIntensity:.55,roughness:.94,metalness:0,dithering:true});materials.set(id,m);return m;}
  return {material,texture};
}
