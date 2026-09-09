import {assetURL} from '../assets.js';
import * as THREE from '../../vendor/three.module.js';
import {applyWorldUV} from './world-uv.js';

const EXTRA_SURFACES={
  concrete:{map:'materials/oga-concrete.jpg',roughness:.95,bump:.022},
  paving:{map:'materials/oga-paving.jpg',roughness:.93,bump:.035},
  bamboo:{map:'materials/oga-bamboo.jpg',normal:'materials/oga-bamboo-normal.jpg',roughness:.84}
};

export function createMaterials({mobile=false,anisotropy=4}={}) {
  const textures=new Map(),materials=new Map(),loader=new THREE.TextureLoader();
  function texture(path,colour=false){if(textures.has(path))return textures.get(path);const t=loader.load(assetURL(path),undefined,undefined,()=>{});t.colorSpace=colour?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(anisotropy,mobile?2:8);textures.set(path,t);return t;}
  function material(kind='plaster',colour=0xffffff){
    const id=kind+'/'+colour;if(materials.has(id))return materials.get(id);
    const extra=EXTRA_SURFACES[kind];let m;
    if(extra){
      const map=texture(extra.map,true);
      m=new THREE.MeshStandardMaterial({color:colour,map,roughness:extra.roughness,metalness:0,dithering:true});
      if(extra.normal){m.normalMap=texture(extra.normal);m.normalScale=new THREE.Vector2(.35,.35);}
      // Small height inference for photographs without a supplied normal map.
      if(extra.bump){m.bumpMap=map;m.bumpScale=extra.bump;}
    }else{
      const map=texture(kind+'.jpg',true),normalMap=texture('materials/'+kind+'-nor_gl.jpg'),arm=texture('materials/'+kind+'-arm.jpg');
      m=new THREE.MeshStandardMaterial({color:colour,map,normalMap,normalScale:new THREE.Vector2(.4,.4),roughnessMap:arm,aoMap:arm,aoMapIntensity:.45,roughness:.94,metalness:0,dithering:true});
    }
    materials.set(id,m);return m;
  }
  function worldMaterial(kind,colour=0xffffff,metres=2){
    const id='world/'+kind+'/'+colour+'/'+metres;
    if(!materials.has(id))materials.set(id,applyWorldUV(material(kind,colour).clone(),metres));
    return materials.get(id);
  }
  return {material,worldMaterial,texture};
}
