import {prepareParkScenery} from './park-scenery.js';
import {registerDetail} from './detail-stream.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {PARK,PARK_BENCH,parkHeight,activePark,parkBench,TURF_TINT,PARK_PATH_TINT} from './park-layout.js';
import {peninsulaActive} from './town-mode.js';
import {createLightPools} from './light-pools.js';
import {lanternGlow} from '../render/dusk.js';
/** The park's three lamp posts, in the model's own (unscaled) ground coordinates. */
export const PARK_LAMPS=Object.freeze([[.75,-2.97],[-6.72,10.41],[13.03,-3.54]]);
let source=null;
/** The lawn and the shrubs in the supplied park. Its meshes are named after materials. */
const PARK_TURF='mtParkGround00t_mat',PARK_BUSH='mtParkBush00t_mat';
/**
 * Brings the supplied ground textures down out of the highlights. See TURF_TINT: under
 * this town's sun they clip, and the mound rendered as a cream dome with its paths
 * lost in it. Idempotent, so it can run on every clone of the shared materials.
 */
function toneGround(model){
 model.traverse(o=>{
  if(!o.isMesh)return;
  const name=o.material?.name||o.name;
  // The blade cards are grass too, and they blow out worse than the ground does
  // because nothing else is competing for those pixels.
  if(!/^mtPark(Ground|Grass)0/.test(name))return;
  o.material.color.setHex(/Grass|00t|03t/.test(name)?TURF_TINT:PARK_PATH_TINT);
 });
}
/**
 * The park's own planting, for ground outside the park that should match it — the east
 * lawn runs right up to the mound, and two different greens meeting along that edge
 * looked like two different parks. Both are null until the model has been fetched.
 */
export function parkFoliage(){
 const found={grass:null,bush:null};
 source?.traverse(o=>{
  if(!o.isMesh)return;const name=o.material?.name||o.name;
  if(name===PARK_TURF)found.grass??=o.material?.map||null;
  else if(name===PARK_BUSH)found.bush??=o.material?.map||null;
 });
 return found;
}
export async function preloadPark(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const r=await fetch(assetURL('models/park/park-spring.glb'),{signal:controller.signal});if(!r.ok)throw Error(r.status);source=prepareParkScenery((await new GLTFLoader().parseAsync(await r.arrayBuffer(),'')).scene);return true;}
 catch(e){console.warn('Park asset unavailable',e);return false;}finally{clearTimeout(timer);}
}
export function buildPark(world,options){
 const p=activePark();
 if(p.plaza)return buildPlaza(world,options,p);
 const s=p.scale||1;
 const group=new THREE.Group();group.name='Harbour Park';group.position.set(p.x,p.lift,p.z);if(s!==1)group.scale.setScalar(s);world.group.add(group);
 const visuals=new THREE.Group();group.add(visuals);
 if(source){const model=source.clone(true);model.userData.sharedAsset=true;model.traverse(o=>{if(o.isMesh){o.castShadow=!!options.shadows;o.receiveShadow=true;if(/Leaf|Bush|Grass|TreePlane/.test(o.material.name)){o.material.alphaTest=.35;o.material.transparent=false;o.material.depthWrite=true;o.material.side=THREE.DoubleSide;}}});toneGround(model);visuals.add(model);}
 else{
  const vertices=[],indices=[];for(let z=0;z<=56;z++)for(let x=0;x<=56;x++)vertices.push(x*.5-14,(parkHeight(p.x+(x*.5-14)*s,p.z+(z*.5-14)*s)-p.lift)/s,z*.5-14);
  for(let z=0;z<56;z++)for(let x=0;x<56;x++){const i=z*57+x;indices.push(i,i+57,i+1,i+1,i+57,i+58);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();visuals.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x85946a,roughness:1})));
  const seat=new THREE.Mesh(new THREE.BoxGeometry(.65,.12,1.8),new THREE.MeshStandardMaterial({color:0x865f42}));seat.position.set(2.06,1.9,0);visuals.add(seat);
 }
 if(!source)registerDetail(world,{id:'park',x:p.x,z:p.z,radius:38,load:async()=>{
  if(!await preloadPark())return false;const model=source.clone(true);model.userData.sharedAsset=true;
  model.traverse(o=>{if(o.isMesh){o.castShadow=!!options.shadows;o.receiveShadow=true;if(/Leaf|Bush|Grass|TreePlane/.test(o.material.name)){o.material.alphaTest=.35;o.material.transparent=false;o.material.depthWrite=true;o.material.side=THREE.DoubleSide;}}});
  toneGround(model);litLamps(model);visuals.clear();visuals.add(model);world.park.loaded=true;return true;
 }});
 // The plinth's vertical face. On the peninsula the lawn grades the mound's foot into
 // the ground around it (parkSkirtHeight), so the face would stand inside that slope
 // and there is nothing for it to close off.
 const edge=[],indices=[];if(!peninsulaActive())for(const [a,b] of [[[-14,-14],[14,-14]],[[14,-14],[14,14]],[[14,14],[-14,14]],[[-14,14],[-14,-14]]])for(let i=0;i<56;i++){
  const base=edge.length/3;for(const t of [i/56,(i+1)/56]){const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;edge.push(x,-p.lift/s,z,x,(parkHeight(p.x+x*s,p.z+z*s)-p.lift)/s,z);}indices.push(base,base+1,base+2,base+2,base+1,base+3);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(edge,3));geo.setIndex(indices);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x858474,roughness:1,side:THREE.DoubleSide})));
 world.colliders.push({x:p.x+2.12*s,z:p.z,w:.94*s,d:1.86*s,minY:p.lift+1.58*s,height:p.lift+2.51*s,park:true},{x:p.x+3.5*s,z:p.z,w:.85*s,d:.85*s,height:10,park:true});
 for(const [x,z] of [[.75,-2.97],[-6.72,10.41],[13.03,-3.54]])world.colliders.push({x:p.x+x*s,z:p.z+z*s,w:.25*s,d:.25*s,height:8,park:true});
 const bench=new THREE.Object3D();bench.position.set(PARK_BENCH.stand[0],PARK_BENCH.position[1]+1,PARK_BENCH.stand[2]);bench.userData.seat=PARK_BENCH;world.group.add(bench);
 options.register(bench,'Sit and watch the town and harbour',()=>options.onAction('seat','Harbour Park bench','A quiet view across the rooftops and port.'));
 // After dark the lamp glass glows and throws a warm pool on the path below each post.
 const glassMaterials=[];
 function litLamps(model){model.traverse(o=>{if(o.isMesh&&o.material?.name==='mtParkLampLight00t_mat'){o.material=o.material.clone();o.material.emissive=new THREE.Color(0xffd9a2);o.material.emissiveIntensity=0;glassMaterials.push(o.material);}});}
 if(source)visuals.traverse(o=>{if(o.isMesh&&o.material?.name==='mtParkLampLight00t_mat'&&!glassMaterials.includes(o.material)){o.material=o.material.clone();o.material.emissive=new THREE.Color(0xffd9a2);glassMaterials.push(o.material);}});
 const pools=createLightPools(world.group,PARK_LAMPS.map(([x,z])=>{const wx=p.x+x*s,wz=p.z+z*s;return {x:wx,z:wz,y:parkHeight(wx,wz)??p.lift,radius:2.6};}));
 (world.hourly||(world.hourly=[])).push(minutes=>{const glow=lanternGlow(minutes);pools.update(glow);for(const m of glassMaterials)m.emissiveIntensity=glow*1.6;});
 world.park={group,bench,seat:PARK_BENCH,loaded:!!source,pools};
}
function buildPlaza(world,options,p){
 const group=new THREE.Group();group.name='Harbour Park';group.position.set(p.x,0,p.z);world.group.add(group);
 const hx=p.halfX||p.half,hz=p.halfZ||p.half;
 const grass=new THREE.Mesh(new THREE.BoxGeometry(hx*2-.15,.08,hz*2-.15),new THREE.MeshStandardMaterial({color:0x7d9560,roughness:1}));
 grass.position.y=.04;grass.receiveShadow=true;group.add(grass);
 const patch=new THREE.Mesh(new THREE.BoxGeometry(3.4,.04,2.2),new THREE.MeshStandardMaterial({color:0x8aa56a,roughness:1}));
 patch.position.set(-1.4,.07,-1.1);group.add(patch);
 const path=new THREE.Mesh(new THREE.BoxGeometry(1.8,.06,hz*2-.2),new THREE.MeshStandardMaterial({color:0xc4b496,roughness:.94}));
 path.position.set(0,.09,0);path.receiveShadow=true;group.add(path);
 const curbMat=new THREE.MeshStandardMaterial({color:0x8a8370,roughness:.95});
 for(const [w,d,x,z] of [[hx*2,.12,0,-hz],[hx*2,.12,0,hz],[.12,hz*2,-hx,0],[.12,hz*2,hx,0]]){
  const curb=new THREE.Mesh(new THREE.BoxGeometry(w,.16,d),curbMat);curb.position.set(x,.08,z);group.add(curb);
 }
 const trunkMat=new THREE.MeshStandardMaterial({color:0x5a4634,roughness:.9});
 const leafMat=new THREE.MeshStandardMaterial({color:0x6a864e,roughness:.82});
 const blossomMat=new THREE.MeshStandardMaterial({color:0xd9b7c4,roughness:.7});
 for(const [lx,lz,blossom] of [[-3.8,-2.5,true],[3.6,-2.7,false],[.2,-3.2,true]]){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.18,1.7,8),trunkMat);trunk.position.set(lx,.85,lz);trunk.castShadow=true;group.add(trunk);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.05,10,8),blossom?blossomMat:leafMat);crown.position.set(lx,2.15,lz);crown.castShadow=true;group.add(crown);
  world.colliders.push({x:p.x+lx,z:p.z+lz,w:.55,d:.55,height:3.4,park:true});
 }
 const wood=new THREE.MeshStandardMaterial({color:0x7a5a3a,roughness:.9});
 const seat=new THREE.Mesh(new THREE.BoxGeometry(1.55,.12,.46),wood);seat.position.set(0,.48,.35);group.add(seat);
 const back=new THREE.Mesh(new THREE.BoxGeometry(1.55,.4,.08),wood);back.position.set(0,.7,.14);group.add(back);
 for(const x of [-.62,.62]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.09,.42,.38),new THREE.MeshStandardMaterial({color:0x4a4034}));leg.position.set(x,.21,.35);group.add(leg);}
 world.colliders.push({x:p.x,z:p.z+.35,w:1.65,d:.52,height:.9,park:true});
 const marker=new THREE.Object3D(),place=parkBench(p);
 marker.position.set(place.stand[0],1,place.stand[2]);marker.userData.seat=place;world.group.add(marker);
 options.register(marker,'Sit and watch the town and harbour',()=>options.onAction('seat','Harbour Park bench','A quiet view across the rooftops and canal.'));
 world.park={group,bench:marker,seat:place,loaded:true};
}
