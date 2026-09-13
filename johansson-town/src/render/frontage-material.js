import * as THREE from '../../vendor/three.module.js';
import {assetURL} from '../assets.js';
const cached=new Map(),pending=new Map();
export function frontageMaterial(page){
 if(cached.has(page))return Promise.resolve(cached.get(page));
 if(pending.has(page))return pending.get(page);
 const task=(async()=>{
  const response=await fetch(assetURL('models/main-street/atlas-'+page+'.jpg'));
  if(!response.ok)throw Error('Frontage atlas HTTP '+response.status);
  const texture=new THREE.Texture(await createImageBitmap(await response.blob()));
  texture.flipY=false;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({map:texture,vertexColors:true,roughness:.93,metalness:0,envMapIntensity:.45});
  material.name='Main Street shared atlas '+page;material.onBeforeCompile=frontageShader;
  material.customProgramCacheKey=()=> 'main-street-repeating-atlas-v1';
  cached.set(page,material);return material;
 })();pending.set(page,task);task.then(()=>pending.delete(page),()=>pending.delete(page));return task;
}
export function frontageShader(shader){
 shader.vertexShader='#ifndef USE_UV1\nattribute vec2 uv1;\n#endif\n#ifndef USE_UV2\nattribute vec2 uv2;\n#endif\nvarying vec4 vFrontageAtlas;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvFrontageAtlas=vec4(uv1,uv2);');
 shader.fragmentShader='varying vec4 vFrontageAtlas;\n'+shader.fragmentShader;
 // Original repeating UVs retain tile proportions. Explicit derivatives avoid
 // seams at wrapping edges; padded atlas gutters protect adjacent materials.
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
 vec2 atlasUV=vFrontageAtlas.xy+fract(vMapUv)*vFrontageAtlas.zw;
 diffuseColor*=textureGrad(map,atlasUV,dFdx(vMapUv)*vFrontageAtlas.zw,dFdy(vMapUv)*vFrontageAtlas.zw);
 #endif`);
}
