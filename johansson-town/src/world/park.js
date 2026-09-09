import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {PARK,PARK_BENCH,parkHeight} from './park-layout.js';
let source=null;
export async function preloadPark(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const r=await fetch(assetURL('models/park/park-spring.glb'),{signal:controller.signal});if(!r.ok)throw Error(r.status);source=(await new GLTFLoader().parseAsync(await r.arrayBuffer(),'')).scene;return true;}
 catch(e){console.warn('Park asset unavailable',e);return false;}finally{clearTimeout(timer);}
}
export function buildPark(world,options){
 const group=new THREE.Group();group.name='Harbour Park';group.position.set(PARK.x,PARK.lift,PARK.z);world.group.add(group);
 if(source){const model=source.clone(true);model.userData.sharedAsset=true;model.traverse(o=>{if(o.isMesh){o.castShadow=!!options.shadows;o.receiveShadow=true;if(/Leaf|Bush|Grass|TreePlane/.test(o.material.name)){o.material.alphaTest=.35;o.material.transparent=false;o.material.depthWrite=true;o.material.side=THREE.DoubleSide;}}});group.add(model);}
 else{
  // Match the ground even when the optional asset cannot be loaded.
  const vertices=[],indices=[];for(let z=0;z<=56;z++)for(let x=0;x<=56;x++)vertices.push(x*.5-14,parkHeight(PARK.x+x*.5-14,PARK.z+z*.5-14)-PARK.lift,z*.5-14);
  for(let z=0;z<56;z++)for(let x=0;x<56;x++){const i=z*57+x;indices.push(i,i+57,i+1,i+1,i+57,i+58);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x85946a,roughness:1})));
  const seat=new THREE.Mesh(new THREE.BoxGeometry(.65,.12,1.8),new THREE.MeshStandardMaterial({color:0x865f42}));seat.position.set(2.06,1.9,0);group.add(seat);
 }
 // Close the cropped terrain edges down to the harbour's ground level.
 const edge=[],indices=[];for(const [a,b] of [[[-14,-14],[14,-14]],[[14,-14],[14,14]],[[14,14],[-14,14]],[[-14,14],[-14,-14]]])for(let i=0;i<56;i++){
  const base=edge.length/3;for(const t of [i/56,(i+1)/56]){const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;edge.push(x,-PARK.lift,z,x,parkHeight(PARK.x+x,PARK.z+z)-PARK.lift,z);}indices.push(base,base+1,base+2,base+2,base+1,base+3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(edge,3));geo.setIndex(indices);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x858474,roughness:1,side:THREE.DoubleSide})));
 world.colliders.push({x:37.12,z:-38,w:.94,d:1.86,minY:3.58,height:4.51,park:true},{x:38.5,z:-38,w:.85,d:.85,height:10,park:true});
 for(const [x,z] of [[.75,-2.97],[-6.72,10.41],[13.03,-3.54]])world.colliders.push({x:PARK.x+x,z:PARK.z+z,w:.25,d:.25,height:8,park:true});
 const bench=new THREE.Object3D();bench.position.set(35.9,parkHeight(35.9,-38)+1,-38);bench.userData.seat=PARK_BENCH;world.group.add(bench);
 options.register(bench,'Sit and watch the town and harbour',()=>options.onAction('seat','Harbour Park bench','A quiet view across the rooftops and port.'));
 world.park={group,bench,seat:PARK_BENCH,loaded:!!source};
}
