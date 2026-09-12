import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';
import {RESIDENTIAL,RESIDENTIAL_BUILDINGS,residentialPoint} from './residential-layout.js';
let source=null,pending=null;
export function preloadResidentialStreet(){
 if(source)return Promise.resolve(true);if(pending)return pending;
 pending=(async()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(assetURL('models/residential-street/willow-street.glb'),{signal:controller.signal});if(!response.ok)throw Error(response.status);
   const loaded=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');
   for(const b of RESIDENTIAL_BUILDINGS)if(!loaded.scene.getObjectByName(b.id)?.isMesh)throw Error('Missing residential building '+b.id);
   source=loaded.scene;return true;
  }catch(error){console.warn('Willow Alley model unavailable; will retry',error);return false;}
  finally{clearTimeout(timer);}
 })();pending.finally(()=>{pending=null;});return pending;
}
export function buildResidentialStreet(world,options={}){
 const group=new THREE.Group();group.name='Willow Alley supplied street';group.position.set(RESIDENTIAL.x,0,RESIDENTIAL.z);group.rotation.y=RESIDENTIAL.yaw;world.group.add(group);
 // Short landing strips join the supplied paving to the two existing cross paths.
 const positions=[],indices=[];
 for(const [a,b] of [[-11.02,-10.30],[9.48,10.44]]){const n=positions.length/3;positions.push(-1.95,.025,a,1.45,.025,a,-1.95,.025,b,1.45,.025,b);indices.push(n,n+2,n+1,n+1,n+2,n+3);}
 const paving=new THREE.BufferGeometry();paving.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));paving.setIndex(indices);paving.computeVertexNormals();
 const approaches=new THREE.Mesh(paving,new THREE.MeshStandardMaterial({color:0xcba58e,roughness:.95}));approaches.name='Willow Alley path connections';approaches.receiveShadow=true;group.add(approaches);
 for(const b of RESIDENTIAL_BUILDINGS)world.colliders.push({...b,residential:true});
 // The florist's low display projects beyond its wall, beside the bridge landing.
 const [displayX,displayZ]=residentialPoint(-1.94,-.5);world.colliders.push({x:displayX,z:displayZ,w:1.26,d:.96,height:1.85,residential:true});
 let mounted=false;
 function mount(){
  if(mounted)return true;if(!source)return false;
  const scene=source.clone(true);scene.name='Willow Alley authored model';
  scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=!!options.shadows;o.receiveShadow=true;o.userData.sharedAsset=true;o.material.envMapIntensity=.45;o.material.dithering=true;
   for(const map of [o.material.map,o.material.normalMap,o.material.roughnessMap,o.material.aoMap])if(map)map.anisotropy=Math.min(options.maxAnisotropy||1,options.mobile?4:8);
  });
  group.add(scene);mounted=true;return true;
 }
 if(!mount())registerDetail(world,{id:'residential-street',x:RESIDENTIAL.x,z:RESIDENTIAL.laneZ,priority:0,radius:90,timeoutMs:32000,load:async()=>await preloadResidentialStreet()&&mount()});
 world.residential={group,get ready(){return mounted;},source:'Stylized Little Japanese Town Street'};
 return group;
}
