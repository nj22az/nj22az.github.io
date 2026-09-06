import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { createCharacters as createBaseCharacters } from './characters.js?v=11-base';

// Converts the stable procedural rigs to a restrained stepped-lighting treatment
// without changing their hierarchy, gait or interaction API.
const bands=new Uint8Array([
  42,42,42,255,
  94,94,94,255,
  151,151,151,255,
  208,208,208,255,
  255,255,255,255
]);
const gradient=new THREE.DataTexture(bands,5,1,THREE.RGBAFormat);
gradient.needsUpdate=true;
gradient.magFilter=THREE.NearestFilter;
gradient.minFilter=THREE.NearestFilter;
gradient.generateMipmaps=false;

export function createCharacters(options={}){
  const base=createBaseCharacters(options);
  const cache=new Map();

  function celMaterial(src){
    if(!src||src.isMeshToonMaterial||src.isMeshBasicMaterial||src.isSpriteMaterial)return src;
    if(cache.has(src.uuid))return cache.get(src.uuid);
    const m=new THREE.MeshToonMaterial({
      color:src.color?.clone?.()||new THREE.Color(0xffffff),
      map:src.map||null,
      gradientMap:gradient,
      emissive:src.emissive?.clone?.()||new THREE.Color(0x000000),
      emissiveMap:src.emissiveMap||null,
      emissiveIntensity:src.emissiveIntensity??1,
      transparent:src.transparent||false,
      opacity:src.opacity??1,
      side:src.side??THREE.FrontSide,
      depthWrite:src.depthWrite!==false,
      depthTest:src.depthTest!==false,
      vertexColors:src.vertexColors||false,
      dithering:true
    });
    m.name=`cel-${src.name||src.uuid}`;
    cache.set(src.uuid,m);
    return m;
  }

  function shade(root){
    root.traverse(o=>{
      if(!o.isMesh||!o.material)return;
      if(Array.isArray(o.material))o.material=o.material.map(celMaterial);
      else o.material=celMaterial(o.material);
    });
  }

  const attachBase=base.attach.bind(base);
  base.attach=(entity,file,height)=>{
    const result=attachBase(entity,file,height);
    shade(entity);
    return result;
  };
  base.celShade=shade;
  return base;
}
