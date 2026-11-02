import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {assetURL} from '../assets.js';
import {BRIDGE_LANTERN_PLAN as PLAN} from './ferry-bridge-lantern-plan.js';

// An independent battery-powered teaching/service circuit. The ship's existing
// 24 V supply, emergency plant and four navigation lights are untouched.
export function buildBridgePracticeCircuit(parent){
 const group=new THREE.Group();group.name='Independent 12 V practice circuit';parent.add(group);
 const fallback=new THREE.Group();fallback.name='Practice circuit fallback';group.add(fallback);
 const parts=[],up=new THREE.Vector3(0,1,0);
 const add=(g,p,hex,q=null)=>{g=g.toNonIndexed();if(q)g.applyQuaternion(q);g.translate(...p);const c=new THREE.Color(hex),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(a,3));g.deleteAttribute('uv');parts.push(g);};
 const box=(d,p,c)=>add(new THREE.BoxGeometry(...d),p,c);
 box([.199,.125,.144],[2.78,1.085,-.35],0x1c303e);box([.206,.017,.151],[2.78,1.152,-.35],0xc9d5d4);
 box([.25,.04,.20],[2.78,1.0,-.35],0x8a9899);box([.025,.18,.20],[2.91,.87,-.35],0x8a9899);
 box([.24,.10,.03],[1.8,.8,-.708],0x9da5a1);box([.204,.068,.024],[1.8,.8,-.735],0x1c303e);
 for(const x of [1.74,1.86])box([.025,.044,.035],[x,.8,-.772],0xb58350);
 for(const x of [2.8352,2.7176])box([.028,.02,.028],[x,1.17,-.3092],x>2.8?0xc2412f:0x1d4580);
 for(const [key,color] of [['sourceToFuse',0xc2412f],['fuseToLamp',0xc2412f],['returnToSource',0x1d4580]]){
  const points=PLAN.wires[key];for(let i=1;i<points.length;i++){
   const a=new THREE.Vector3(...points[i-1]),b=new THREE.Vector3(...points[i]),delta=b.clone().sub(a);
   add(new THREE.CylinderGeometry(.0055,.0055,delta.length(),6),a.add(b).multiplyScalar(.5).toArray(),color,new THREE.Quaternion().setFromUnitVectors(up,delta.normalize()));
  }
 }
 for(const y of [1.056,1.348])add(new THREE.CylinderGeometry(.12,.12,.044,12),[3.95,y,-.95],0x1c303e);
 const opaque=new THREE.Mesh(mergeGeometries(parts,false),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.67}));opaque.name='Healthy practice equipment fallback';fallback.add(opaque);for(const g of parts)g.dispose();
 const glass=new THREE.Mesh(new THREE.CylinderGeometry(.094,.094,.232,12),new THREE.MeshStandardMaterial({color:0xa1d9db,transparent:true,opacity:.32,depthWrite:false,roughness:.2}));glass.position.set(3.95,1.212,-.95);fallback.add(glass);
 const state={group,loaded:false,pending:null,error:null,plan:PLAN,ensure(){
  return this.pending??=import('../../vendor/GLTFLoader.js').then(async({GLTFLoader})=>{
   const gltf=await new GLTFLoader().loadAsync(assetURL('models/ferry-bridge/bridge-lantern-v2.glb'));
   const bounds=new THREE.Box3().setFromObject(gltf.scene);if(bounds.isEmpty()||!bounds.min.toArray().concat(bounds.max.toArray()).every(Number.isFinite))throw Error('Invalid bridge practice asset');
   let meshes=0,triangles=0;gltf.scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;o.castShadow=o.receiveShadow=true;}});
   if(meshes!==3||triangles>20000)throw Error('Unexpected bridge practice mesh budget');
   gltf.scene.name='Minato Maru / healthy Blender 12 V practice circuit';group.add(gltf.scene);group.remove(fallback);
   const geometries=new Set(),materials=new Set();fallback.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[]))materials.add(m);});
   for(const g of geometries)g.dispose();for(const m of materials){m.map?.dispose();m.dispose();}fallback.clear();
   this.loaded=true;this.meshes=meshes;this.triangles=triangles;return true;
  }).catch(error=>{this.error=String(error?.message||error);return false;});
 }};
 // Only request the Blender prop when the bridge is actually being viewed close
 // by. No added startup download, frame timers or runtime light/shadow sources.
 const eye=new THREE.Vector3(),centre=new THREE.Vector3(2,1.1,-.4);opaque.onBeforeRender=(_renderer,_scene,camera)=>{
  if(state.pending)return;camera.getWorldPosition(eye);group.worldToLocal(eye);
  if(eye.y>-.5&&eye.y<3.5&&eye.distanceToSquared(centre)<144)state.ensure();
 };
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');x.fillStyle='#1c303e';x.fillRect(0,0,c.width,c.height);x.fillStyle='#f0ece0';x.textAlign='center';x.font='bold 64px sans-serif';x.fillText('12 V',128,71);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const label=new THREE.Mesh(new THREE.PlaneGeometry(.13,.05),new THREE.MeshBasicMaterial({map:texture}));label.position.set(2.78,1.10,-.429);label.rotation.y=Math.PI;label.name='Battery voltage marking';fallback.add(label);
 }
 group.userData.bridgePracticeCircuit=state;return state;
}
