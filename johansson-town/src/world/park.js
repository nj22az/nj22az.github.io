import * as THREE from '../../vendor/three.module.js';
import {PARK,PARK_BENCH,parkBenchGeometry,TURF_TINT,PARK_PATH_TINT} from './park-layout.js';
import {HARBOUR_PARK_MAIN,HARBOUR_PARK_EXTENSION,HARBOUR_PARK_ENTRY,HARBOUR_POND,HARBOUR_CHERRY,HARBOUR_SHRINE,HARBOUR_PARK_SEATS,HARBOUR_PARK_PATHS} from './harbour-park-plan.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';
import {createLightPools} from './light-pools.js';
import {lanternGlow} from '../render/dusk.js';
import {paintedTurf,paintedPaving} from '../render/toy-surfaces.js';
import {createKit} from './okinawa/kit.js';
import {hibiscus} from './okinawa/houses.js';
import {broadleafGeometry} from './okinawa/trees.js';
import {GROUND_LAYER} from './ground-layers.js';
import {townCalendarAt} from '../town-clock.js';
import {poster} from './okinawa/signs.js';
export const PARK_TREE=Object.freeze([(HARBOUR_CHERRY[0]-PARK.x)/PARK.scale,(HARBOUR_CHERRY[1]-PARK.z)/PARK.scale]);
const LAMP_POSITIONS=Object.freeze([[7.8,-26.8],[17.7,-34.9],[29.8,-13.4]]);
export const PARK_LAMPS=Object.freeze(LAMP_POSITIONS.map(([x,z])=>[(x-PARK.x)/PARK.scale,(z-PARK.z)/PARK.scale]));
const BLOSSOM={light:0xf7b8cf,mid:0xe98fb2,core:0xb4587f,bark:0x5a4030};
const LEAF={light:0x6cb544,mid:0x48a23a,core:0x1f5226,bark:0x5a4030};
let benchSource=null,benchPending=null;
/** Small original Blender prop; the lawn/tree remain the town's procedural geometry. */
export function preloadPark(){
 if(benchSource)return Promise.resolve(true);
 if(benchPending)return benchPending;
 if(typeof document==='undefined')return Promise.resolve(false);
 const controller=new AbortController();let timer;
 benchPending=Promise.race([
  fetch(assetURL('models/park/harbour-bench.glb?harbour-bench-1'),{signal:controller.signal}).then(response=>{
   if(!response.ok)throw Error('Harbour bench HTTP '+response.status);return response.arrayBuffer();
  }).then(data=>new GLTFLoader().parseAsync(data,'')),
  new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('Harbour bench asset timeout'));},8000);})
 ]).then(gltf=>{benchSource=gltf.scene;benchSource.updateMatrixWorld(true);return true;})
  .catch(error=>{console.warn('Harbour bench unavailable; using its measured local fallback.',error.message);return false;})
  .finally(()=>{clearTimeout(timer);benchPending=null;});
 return benchPending;
}
function makeParkBench(g,shadows){
 const group=new THREE.Group();group.name='Harbour Park Blender bench';group.position.set(g.x,g.footY,g.z);group.rotation.y=Math.PI/2;group.scale.setScalar(g.scale);
 if(benchSource){const model=benchSource.clone(true);model.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.userData.staticProp=true;}});group.add(model);return group;}
 const d=g.dimensions,kit=createKit({shadows}),legX=d.length/2-.14;
 for(const x of [-legX,legX]){
  for(const z of [-d.seatDepth/2+.055,d.seatDepth/2-.055])kit.box(.055,d.seatHeight-d.seatThickness,.055,x,(d.seatHeight-d.seatThickness)/2,z,0x303638);
  kit.box(.095,.035,d.footprintDepth,x,.0175,0,0x303638);
  kit.box(.05,d.backHeight+.025,.05,x,d.seatHeight+d.backHeight/2-.0125,d.backZ,0x303638);
 }
 const gap=.008,slat=(d.seatDepth-gap*3)/4;
 for(let i=0;i<4;i++)kit.box(d.length,d.seatThickness,slat,0,d.seatHeight-d.seatThickness/2,-d.seatDepth/2+slat/2+i*(slat+gap),0x9a6a42);
 for(let i=0;i<3;i++)kit.box(d.length,.1,.04,0,d.seatHeight+.2+i*.14,d.backZ,0x9a6a42);
 kit.finish(group,'Harbour Park measured bench fallback');group.traverse(mesh=>{if(mesh.isMesh)mesh.userData.staticProp=false;});return group;
}

export function parkFoliage(){let grass=null;if(typeof document!=='undefined'&&document.createElement){try{grass=paintedTurf();}catch{}}return {grass,bush:null};}

function turfGeometry(bounds,{pond=false}={}){
 const b=bounds,shape=new THREE.Shape();shape.moveTo(b.minX,-b.minZ);shape.lineTo(b.maxX,-b.minZ);shape.lineTo(b.maxX,-b.maxZ);shape.lineTo(b.minX,-b.maxZ);shape.closePath();
 if(pond){const p=HARBOUR_POND,hole=new THREE.Path();hole.absellipse(p.x,-p.z,p.rx,p.rz,0,Math.PI*2,true);shape.holes.push(hole);}
 const g=new THREE.ShapeGeometry(shape,64);g.rotateX(-Math.PI/2);g.translate(0,GROUND_LAYER.grass,0);
 const positions=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<positions.count;i++)uv.setXY(i,positions.getX(i)/2.4,positions.getZ(i)/2.4);
 return g;
}

/** Flush paving, with round joins; no kerbs or corridor collision boxes. */
function parkWalks(group){
 const bySurface=new Map();
 for(const route of HARBOUR_PARK_PATHS){
  const pieces=bySurface.get(route.surface)||[];bySurface.set(route.surface,pieces);
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
   const geometry=new THREE.PlaneGeometry(route.width,length);geometry.rotateX(-Math.PI/2);geometry.rotateY(Math.atan2(dx,dz));geometry.translate((a[0]+b[0])/2,GROUND_LAYER.lane,(a[1]+b[1])/2);pieces.push(geometry);
  }
  for(const [x,z] of route.points){const g=new THREE.CircleGeometry(route.width/2,16);g.rotateX(-Math.PI/2);g.translate(x,GROUND_LAYER.lane,z);pieces.push(g);}
 }
 for(const [surface,pieces] of bySurface){
  const geometry=mergeGeometries(pieces,false),p=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/3,p.getZ(i)/3);
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:surface==='gravel'?0xb7a98a:PARK_PATH_TINT,map:paintedPaving(),roughness:.95,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  mesh.name='Harbour Park '+surface+' walks';mesh.receiveShadow=true;group.add(mesh);pieces.forEach(g=>g.dispose());
 }
}

/** One level public park opposite Sakura, with the bathhouse visible across open ground. */
export function buildPark(world,options={}){
 const group=new THREE.Group();group.name='Harbour Park';world.group.add(group);const shadows=!!options.shadows;
 const material=new THREE.MeshStandardMaterial({color:TURF_TINT,map:parkFoliage().grass,roughness:1});
 const ground=new THREE.Mesh(turfGeometry(HARBOUR_PARK_MAIN,{pond:true}),material);ground.name='Harbour Park ground';ground.receiveShadow=true;group.add(ground);
 const extension=new THREE.Mesh(turfGeometry(HARBOUR_PARK_EXTENSION),material);extension.name='Harbour Park beach lawn';extension.receiveShadow=true;group.add(extension);
 parkWalks(group);
 const kit=createKit({shadows});
 const anchor=(x,z,label,kind,title,text)=>{const a=new THREE.Object3D();a.position.set(x,1,z);group.add(a);options.register?.(a,label,()=>options.onAction?.(kind,title,text));return a;};
 const benchGeometry=parkBenchGeometry();let benchObject=makeParkBench(benchGeometry,shadows);group.add(benchObject);
 if(!benchSource)registerDetail(world,{id:'harbour-park-bench',requiredNearby:true,x:benchGeometry.x,z:benchGeometry.z,radius:40,priority:0,load:async()=>{
  if(!await preloadPark())return false;const object=makeParkBench(benchGeometry,shadows);group.add(object);benchObject.removeFromParent();benchObject=object;world.park.benchObject=object;world.park.benchSource='blender';return true;
 }});
 world.colliders.push({id:'harbour-park-bench',x:benchGeometry.x,z:benchGeometry.z,w:benchGeometry.width,d:benchGeometry.length,minY:benchGeometry.footY,height:benchGeometry.seatY+benchGeometry.top-benchGeometry.footY,park:true});
 const bench=anchor(PARK_BENCH.stand[0],PARK_BENCH.stand[2],'Sit under the harbour cherry','seat','Harbour Park bench','A quiet seat under the old cherry, with Sakura across the street and Umi-no-yu through the open park.');bench.userData.seat=PARK_BENCH;
 // The second bench faces the pond; its stand is on the wide gravel circuit.
 const second=HARBOUR_PARK_SEATS[1],seatY=.46;
 kit.box(2.08,.08,.46,second.x,seatY-.04,second.z,0x946b43);
 kit.box(2.08,.42,.05,second.x,.78,second.z-.23,0x946b43);
 for(const dx of [-.82,.82])kit.box(.07,.42,.5,second.x+dx,.21,second.z,0x35494a);
 world.colliders.push({id:second.id,x:second.x,z:second.z,w:2.08,d:.52,height:.99,park:true});
 const pondBench=anchor(...second.stand,'Sit beside the garden pond','seat','Garden pond bench','The pond reflects the cherry and the bathhouse roof. The shore walk remains open beside you.');
 pondBench.userData.seat={position:[second.x,0,second.z+.08],stand:[second.stand[0],0,second.stand[1]],surfaceY:seatY,eyeY:1.21,yaw:second.yaw,pitch:0};
 const [tx,tz]=HARBOUR_CHERRY,treeMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
 const trees={blossom:new THREE.Mesh(broadleafGeometry({greens:BLOSSOM,variant:2}),treeMaterial),leaf:new THREE.Mesh(broadleafGeometry({greens:LEAF,variant:2}),treeMaterial)};
 for(const [key,tree] of Object.entries(trees)){tree.name='Harbour Park cherry '+key;tree.position.set(tx,0,tz);tree.scale.set(6.4,6.2,6.4);tree.rotation.y=.6;tree.castShadow=shadows;tree.receiveShadow=true;group.add(tree);}
 world.colliders.push({id:'harbour-cherry',x:tx,z:tz,w:.48,d:.48,height:6.2,park:true});
 const dress=minutes=>{const bloom=townCalendarAt(minutes).date.getMonth()<=1;trees.blossom.visible=bloom;trees.leaf.visible=!bloom;};dress(0);
 for(const [x,z] of LAMP_POSITIONS){kit.cyl(.07,.1,.16,x,.08,z,0x8a8979,{segments:8});kit.cyl(.04,.05,2.55,x,1.4,z,0x35584c,{segments:8});kit.sphere(.16,x,2.77,z,0xfff4dc,{finish:'lamp'});world.colliders.push({id:'park-lamp',x,z,w:.2,d:.2,height:2.93,park:true});}
 // Low planting stays outside the view from Sakura and every walking strip.
 for(const [x,z,seed] of [[6.3,-33.8,3],[14.4,-31.2,5],[28.5,-12.9,8]])kit.at(x,z,0,()=>hibiscus(kit,0,0,{seed,size:.5}));
 const shrine=HARBOUR_SHRINE;kit.box(1.15,.15,.85,shrine.x,.075,shrine.z,0x8a897c);kit.box(.74,1.05,.54,shrine.x,.68,shrine.z,0x94604b);kit.box(1.1,.12,.8,shrine.x,1.3,shrine.z,0x4e665b);kit.box(.35,.55,.025,shrine.x,.65,shrine.z+.285,0x453e31);
 world.colliders.push({id:'garden-shrine',x:shrine.x,z:shrine.z,w:1.15,d:.85,height:1.36,park:true});
 anchor(...shrine.approach,'Visit the garden shrine','shrine','Garden shrine','A small island shrine in Harbour Park, kept beside the cherry and pond.');
 // One readable board, outside the approach: the building itself is the onsen sign ahead.
 kit.box(.08,1.3,.08,6.1,.65,-23.4,0x68563e);kit.sign(poster({title:'Minato Harbour Park',lines:['MINATO HARBOUR PARK','Umi-no-yu · pond · beach'],band:'#355d46',bg:'#eee5cc'}),1.6,.65,6.1,1.24,-23.4,{ry:-Math.PI/2,name:'Minato Harbour Park board',both:true});
 world.colliders.push({id:'park-board-post',x:6.1,z:-23.4,w:.1,d:.1,height:1.6,park:true});
 anchor(5.3,-23.4,'Read the Harbour Park guide','read','Minato Harbour Park','Umi-no-yu faces Sakura across this open park. Follow the broad paving to the bathhouse, the gravel circuit around the pond, or the shore walk to the beach ramp. Rainflower Florist is at the street entrance; Nakamura serves zenzai and Blue Coral ice cream next door.');
 const {materials}=kit.finish(group,'Harbour Park furnishings');
 const p=HARBOUR_POND,water=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshStandardMaterial({color:0x587f76,roughness:.25,transparent:true,opacity:.88,depthWrite:false}));water.rotation.x=-Math.PI/2;water.scale.set(p.rx,p.rz,1);water.position.set(p.x,p.waterY,p.z);water.name='Harbour Park koi pond';group.add(water);
 const basin=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshStandardMaterial({color:0x586455,roughness:1}));basin.rotation.x=-Math.PI/2;basin.scale.set(p.rx,p.rz,1);basin.position.set(p.x,p.bedY+.012,p.z);basin.name='Harbour pond bed';group.add(basin);
 const pondView=anchor(21.7,-31,'Look into the garden pond','inspect','Garden pond','Koi turn beneath the water. The one garden pond sits inside Harbour Park, with a clear gravel circuit, a quiet bench and Umi-no-yu beyond.');pondView.name='harbour-pond-view';
 for(const [x,z,r] of [[23.5,-31.5,.45],[27.8,-29.7,.35],[27.8,-32.5,.28]]){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),new THREE.MeshStandardMaterial({color:0x8a8b7b,roughness:1}));rock.scale.set(1.1,.7,.85);rock.position.set(x,-.04,z);rock.name='Harbour pond stone';group.add(rock);}
 const fish=[];for(let i=0;i<5;i++){const koi=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshStandardMaterial({color:i%2?0xdc9861:0xe4debc,roughness:.5}));koi.name='Harbour pond koi';koi.scale.set(.6,.45,2.2);koi.userData.dynamicProp=true;group.add(koi);fish.push(koi);}
 const pools=createLightPools(world.group,LAMP_POSITIONS.map(([x,z])=>({x,z,y:0,radius:2.5})));
 (world.hourly||(world.hourly=[])).push(minutes=>{const glow=lanternGlow(minutes);pools.update(glow);if(materials.lamp)materials.lamp.emissiveIntensity=.1+glow*1.6;dress(minutes);});
 world.park={group,bench,seat:PARK_BENCH,pondBench,loaded:true,pools,trees,fish,benchObject,benchSource:benchSource?'blender':'procedural',benchDimensions:benchGeometry.dimensions,update(time=0){fish.forEach((k,i)=>{const a=time*.08+i;k.position.set(p.x+Math.cos(a)*(1.2+i*.2),p.waterY-.07,p.z+Math.sin(a)*(.65+i*.12));k.rotation.y=-a;});}};
 world.park.update();return world.park;
}
