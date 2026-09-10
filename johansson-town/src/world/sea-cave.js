import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';

// The scan sits wholly beyond the northern main-street limit; the shrine is east
// of its footprint. Collision exists before streaming and never changes on load.
export const SEA_CAVE=Object.freeze({centerX:-15,frontZ:59,scale:.5,angle:Math.PI,groundY:-.65});
export const SEA_CAVE_BARRIER=Object.freeze({x:0,z:58.4,w:15.6,d:.35});
export function placeSeaCave(model){
 const holder=new THREE.Group();holder.name='Umanose sea cave';holder.add(model);
 model.rotation.y=SEA_CAVE.angle;model.scale.setScalar(SEA_CAVE.scale);model.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());
 model.position.set(SEA_CAVE.centerX-center.x,SEA_CAVE.groundY-box.min.y,SEA_CAVE.frontZ-box.min.z);
 holder.updateMatrixWorld(true);return holder;
}
export async function fetchSeaCave(){
 const controller=new AbortController();let timer;
 try{
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Sea cave loading timed out'));},15000);});
  return await Promise.race([(async()=>{
   const response=await fetch(assetURL('models/sea-cave/umanose.glb'),{signal:controller.signal});
   if(!response.ok)throw Error('Sea cave HTTP '+response.status);
   return (await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;
  })(),deadline]);
 }finally{clearTimeout(timer);}
}
export function buildSeaCave(world,options={}){
 const group=new THREE.Group();group.name='Northern sea-cave boundary';world.group.add(group);
 const barrier={...SEA_CAVE_BARRIER,seaCave:true};world.colliders.push(barrier);
 const metal=new THREE.MeshStandardMaterial({color:0x9a9d91,roughness:.84});
 const unit=new THREE.BoxGeometry(1,1,1),parts=[];
 for(const x of [-7.5,-5,-2.5,0,2.5,5,7.5])parts.push({p:[x,.52,barrier.z],s:[.11,1.04,.11]});
 for(const y of [.43,.85])parts.push({p:[0,y,barrier.z],s:[barrier.w,.16,.1]});
 const rail=new THREE.InstancedMesh(unit,metal,parts.length),dummy=new THREE.Object3D();rail.name='Closed coastal approach guardrail';
 parts.forEach(({p,s},i)=>{dummy.position.set(...p);dummy.scale.set(...s);dummy.updateMatrix();rail.setMatrixAt(i,dummy.matrix);});group.add(rail);
 const fallback=new THREE.Group();fallback.name='Sea cave loading fallback';group.add(fallback);
 const rockGeo=new THREE.IcosahedronGeometry(1,1),rockMat=new THREE.MeshStandardMaterial({color:0x707468,roughness:1,flatShading:true});
 for(const [x,y,z,sx,sy,sz] of [[-18,3,72,18,7,11],[0,4,75,16,9,13],[13,2,76,9,5,10]]){const rock=new THREE.Mesh(rockGeo,rockMat);rock.position.set(x,y,z);rock.scale.set(sx,sy,sz);fallback.add(rock);}
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#e1d9bd';ctx.fillRect(0,0,512,160);ctx.fillStyle='#3d4947';ctx.textAlign='center';ctx.font='bold 44px sans-serif';ctx.fillText('海食洞 · 立入禁止',256,65);ctx.font='24px sans-serif';ctx.fillText('SEA CAVE · COAST PATH CLOSED',256,119);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.75),new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}));sign.position.set(0,1.05,barrier.z-.12);sign.rotation.y=Math.PI;group.add(sign);
 const marker=new THREE.Object3D();marker.position.set(0,1.2,56.5);group.add(marker);
 options.register?.(marker,'Inspect the sea-cave boundary',()=>options.onAction?.('inspect','Northern sea cave','Waves have hollowed the coastal rock beyond the end of the street. The guardrail closes the unstable coast path. The harbour and shrine remain accessible from the town.'));
 let pending;
 const state={group,loaded:false,status:'idle',barrier,load(loader=fetchSeaCave){
  if(pending)return pending;state.status='loading';
  pending=Promise.resolve().then(loader).then(source=>{
   const placed=placeSeaCave(source.clone(true));placed.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;if(o.material.map)o.material.map.anisotropy=Math.min(options.maxAnisotropy||1,4);}});
   group.add(placed);fallback.removeFromParent();rockGeo.dispose();rockMat.dispose();state.loaded=true;state.status='ready';return true;
  }).catch(error=>{state.status='fallback';console.warn('Sea cave unavailable; boundary retained',error);return false;});
  return pending;
 }};
 world.seaCave=state;return state;
}
