import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
let source=null,pending;
const homeBatches=new WeakMap();
const IDS=['office','frontrow','form3d','stepwise','journal','electronics','market','career'];
export function preloadJapaneseTown(){
 return pending??= (async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{
  const response=await fetch(assetURL('models/japanese-town/street-kit.glb'),{signal:controller.signal});if(!response.ok)throw Error(response.status);
  const loaded=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');
  for(const name of ['hipped-shop','gable-shop','hipped-home','gable-home'])if(!loaded.scene.getObjectByName(name)?.isMesh)throw Error('Missing town module '+name);
  source=loaded.scene;return true;
 }catch(error){console.warn('Japanese town kit unavailable; retaining existing buildings',error);return false;}finally{clearTimeout(timer);}})();
}
function model(index,kind,width,depth,height,options){
 if(!source)return null;const mesh=source.getObjectByName((index%2?'gable':'hipped')+'-'+kind).clone();
 mesh.scale.set(width/mesh.userData.width,height,depth/mesh.userData.depth);mesh.castShadow=!!options.shadows;mesh.receiveShadow=true;mesh.userData.sharedAsset=true;
 for(const map of [mesh.material.map,mesh.material.normalMap,mesh.material.roughnessMap,mesh.material.aoMap])if(map)map.anisotropy=Math.min(options.maxAnisotropy||1,options.mobile?4:8);
 mesh.material.envMapIntensity=.45;mesh.material.dithering=true;return mesh;
}
export function buildJapaneseShop({parent,site,register,enter,label,...options}){
 const index=IDS.indexOf(site.id);if(index<0)return null;
 const width=7.5,depth=6.8,mesh=model(index,'shop',width,depth,1.05,options);if(!mesh)return null;
 const group=new THREE.Group();group.name='japanese-shop:'+site.id;group.position.set(site.side*7.55,0,site.z);group.rotation.y=-site.side*Math.PI/2;group.add(mesh);parent.add(group);
 // Entry panels sit on the existing facade; the whole room remains behind the door transition.
 const shutter=new THREE.Mesh(new THREE.BoxGeometry(1.45,2.25,.10),new THREE.MeshStandardMaterial({color:0x5b4734,roughness:.85,emissive:0xeab778,emissiveIntensity:0}));shutter.position.set(0,1.125,.08);group.add(shutter);
 mesh.geometry.computeBoundingBox();const signX=7.55-mesh.geometry.boundingBox.max.z*mesh.scale.z-.04;
 label(site.jp,site.title.toUpperCase(),[site.side*signX,3.28,site.z],5.5,.64,group.rotation.y,site.id==='market'?'#984945':'#e7dcc0',site.id==='market'?'#fff1d3':'#3e463f',true);
 const openSign=label('営業中','OPEN',[site.side*7.26,1.65,site.z+.83],.45,.26,group.rotation.y,'#e9dfc3','#405549');
 const entrance=new THREE.Object3D();entrance.position.set(site.side*6.3,1.2,site.z);parent.add(entrance);register?.(entrance,'Enter '+site.title,()=>enter(site));
 site.door=[site.side*5.5,0,site.z];site.x=site.side*(7.55+depth/2);
 const collider={x:site.x,z:site.z,w:depth,d:width,height:8.5};
 const triangles=mesh.geometry.attributes.position.count/3;
 return {id:site.id,lod:group,entrance,shutter,collider,nearTriangles:triangles,farTriangles:triangles,source:'Japanese Town',update(open,day){openSign.visible=open;shutter.material.color.set(open?0x5b4734:0x3c3a34);shutter.material.emissiveIntensity=open?(1-day)*.14:0;}};
}
export function buildJapaneseHome(parent,house,index,options){
 const mesh=model(index,'home',3.12,3.5,[.62,.70,.66][index%3],options);if(!mesh)return false;
 mesh.name='japanese-home:'+index;mesh.rotation.y=house.angle;
 mesh.position.set(house.x+Math.sin(house.angle)*1.75,0,house.z+Math.cos(house.angle)*1.75);mesh.updateMatrix();
 let batches=homeBatches.get(parent);if(!batches){batches=new Map();homeBatches.set(parent,batches);}
 const key=mesh.geometry.uuid+':'+Math.floor(house.z/24);if(!batches.has(key))batches.set(key,{mesh,matrices:[]});batches.get(key).matrices.push(mesh.matrix.clone());return true;
}

export function finishJapaneseHomes(parent){
 const batches=homeBatches.get(parent);if(!batches)return;
 for(const {mesh,matrices} of batches.values()){
  const batch=new THREE.InstancedMesh(mesh.geometry,mesh.material,matrices.length);batch.name='japanese-homes';batch.userData.sharedAsset=true;
  matrices.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));batch.castShadow=mesh.castShadow;batch.receiveShadow=true;batch.computeBoundingSphere();parent.add(batch);
 }
 homeBatches.delete(parent);
}
