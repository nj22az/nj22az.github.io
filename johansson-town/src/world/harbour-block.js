import {buildJapaneseShop} from './japanese-town.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';

export const HARBOUR_SHOP_IDS=Object.freeze(['journal','electronics','market','career']);
let source=null;

export async function preloadHarbourBlock({timeoutMs=15000}={}){
 const controller=new AbortController();let timer;
 try{
  const loaded=await Promise.race([
   (async()=>{
    const url=assetURL('models/harbour-block/harbour-shops.glb');
    const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Harbour block HTTP '+response.status);
    const manager=new THREE.LoadingManager();let failedTexture=false;manager.onError=()=>{failedTexture=true;};
    const gltf=await new GLTFLoader(manager).parseAsync(await response.arrayBuffer(),new URL('.',url).href);
    if(failedTexture)throw Error('Harbour block texture unavailable');
    for(const id of HARBOUR_SHOP_IDS)for(const level of ['near','far']){
     const mesh=gltf.scene.getObjectByName(id+'-'+level);
     if(!mesh?.isMesh||!mesh.material.map||!mesh.material.normalMap)throw Error('Incomplete harbour building '+id);
    }
    return gltf.scene;
   })(),
   new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Harbour block timeout'));},timeoutMs);})
  ]);
  source=loaded;return true;
 }catch(error){console.warn('Harbour block unavailable; retaining existing shopfronts',error);return false;}
 finally{clearTimeout(timer);}
}

// Extra surface grain is sampled in metres, independently of the block's atlas.
// It fades at distance and avoids glass, preserving the supplied colour and PBR maps.
function detailedMaterial(original,kind,options){
 const material=original.clone(),detail=new THREE.TextureLoader().load(assetURL(kind+'.jpg'));
 detail.colorSpace=THREE.SRGBColorSpace;detail.wrapS=detail.wrapT=THREE.RepeatWrapping;
 detail.anisotropy=Math.min(options.maxAnisotropy||4,options.mobile?4:8);
 for(const map of [material.map,material.normalMap,material.roughnessMap,material.metalnessMap])if(map)map.anisotropy=detail.anisotropy;
 material.dithering=true;material.envMapIntensity=.75;
 material.onBeforeCompile=shader=>{
  shader.uniforms.harbourDetail={value:detail};
  shader.vertexShader='varying vec3 vHarbourPosition;\nvarying vec3 vHarbourNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHarbourPosition=position; vHarbourNormal=normal;');
  shader.fragmentShader='uniform sampler2D harbourDetail;\nvarying vec3 vHarbourPosition;\nvarying vec3 vHarbourNormal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   vec3 hn=abs(vHarbourNormal);
   vec2 huv=hn.y>max(hn.x,hn.z)?vHarbourPosition.xz:(hn.x>hn.z?vHarbourPosition.zy:vHarbourPosition.xy);
   float grain=dot(texture2D(harbourDetail,huv*1.4).rgb,vec3(.2126,.7152,.0722));
   float closeDetail=(1.0-smoothstep(12.0,28.0,length(vViewPosition)))*smoothstep(.45,.8,roughnessFactor);
   diffuseColor.rgb*=1.0+(grain-.3)*.22*closeDetail;
  `);
 };
 material.customProgramCacheKey=()=> 'harbour-surface-detail-v1';
 return material;
}

export function buildHarbourShop({parent,site,register,enter,label,...options}){
 const upgraded=buildJapaneseShop({parent,site,register,enter,label,...options});if(upgraded)return upgraded;
 if(!source||!HARBOUR_SHOP_IDS.includes(site.id))return null;
 const near=source.getObjectByName(site.id+'-near').clone(),far=source.getObjectByName(site.id+'-far').clone();
 const material=detailedMaterial(near.material,site.id==='journal'?'timber':'plaster',options);near.material=far.material=material;
 const bounds=new THREE.Box3().setFromObject(near),depth=-bounds.min.z,width=bounds.max.x-bounds.min.x;
 const frontage=new THREE.Group();frontage.name='harbour-shop:'+site.id;
 frontage.position.set(site.side*7.55,0,site.z);frontage.rotation.y=-site.side*Math.PI/2;parent.add(frontage);
 const lod=new THREE.LOD();lod.name='harbour-lod:'+site.id;lod.addLevel(near,0);lod.addLevel(far,options.mobile?28:44,.15);frontage.add(lod);far.visible=false;
 for(const mesh of [near,far]){mesh.castShadow=!!options.shadows;mesh.receiveShadow=true;mesh.geometry.computeBoundingSphere();mesh.geometry.computeBoundingBox();}

 const frameMaterial=new THREE.MeshStandardMaterial({color:site.id==='market'?0x657b78:0x574131,roughness:.72});
 function box(size,p,material=frameMaterial){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...p);m.castShadow=!!options.shadows;m.receiveShadow=true;frontage.add(m);return m;}
 // Grounded plinth covers the trimmed foundation edge and seals the base.
 box([width+.08,.12,depth+.10],[0,-.055,-depth/2],new THREE.MeshStandardMaterial({color:0x67665a,roughness:.95}));
 // Opaque recessed entry and framing give a crisp, readable threshold at eye level.
 const shutter=box([1.5,2.25,.08],[0,1.125,.11],new THREE.MeshStandardMaterial({color:0x344f52,roughness:.38,emissive:0xffcc88,emissiveIntensity:.12}));
 for(const x of [-.83,.83])box([.11,2.42,.19],[x,1.21,.19]);
 box([1.78,.12,.19],[0,2.46,.19]);
 for(const x of [-.36,.36])box([.045,.38,.07],[x,1.1,.20],new THREE.MeshStandardMaterial({color:0xbdac7c,roughness:.3,metalness:.55}));
 const mat=box([1.9,.025,.68],[0,.0125,.42],new THREE.MeshStandardMaterial({color:0x665c4c,roughness:1}));mat.userData.storeEntrance=true;
 label(site.jp,site.title.toUpperCase(),[site.side*7.16,2.97,site.z],Math.min(width-.3,5.6),.72,frontage.rotation.y,site.id==='market'?'#982f45':'#e7d5a9',site.id==='market'?'#fff0dc':site.accent,true);
 const openSign=label('営業中','OPEN',[site.side*7.25,1.75,site.z+.64],.48,.28,frontage.rotation.y,'#efe7cf','#355b50');
 const entrance=new THREE.Object3D();entrance.position.set(site.side*6.5,1.2,site.z);parent.add(entrance);
 register?.(entrance,'Enter '+site.title,()=>enter(site));
 site.door=[site.side*5.5,0,site.z];
 site.x=site.side*(7.55+depth/2);
 const collider={x:site.side*(7.55+depth/2),z:site.z,w:depth,d:width,height:bounds.max.y};
 return {id:site.id,lod,entrance,shutter,collider,nearTriangles:near.geometry.index.count/3,farTriangles:far.geometry.index.count/3,
  update(open,day){openSign.visible=open;shutter.material.color.set(open?0x344f52:0x64645c);shutter.material.emissiveIntensity=open?.08+(1-day)*.45:0;}};
}
