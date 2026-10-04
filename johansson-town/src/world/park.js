import * as THREE from '../../vendor/three.module.js';
import {PARK,PARK_BENCH,PARK_BENCH_FIT,benchPoint,parkHeight,parkSkirtHeight,parkApproachHeight,activePark,parkBench,TURF_TINT,PARK_PATH_TINT,PARK_TERRAIN_SEGMENTS} from './park-layout.js';
import {createLightPools} from './light-pools.js';
import {lanternGlow} from '../render/dusk.js';
import {paintedTurf} from '../render/toy-surfaces.js';
import {createKit} from './okinawa/kit.js';
import {hibiscus} from './okinawa/houses.js';
import {broadleafGeometry} from './okinawa/trees.js';
import {GROUND_LAYER} from './ground-layers.js';
import {applyTerrainNormals} from './terrain-surface.js';
import {townCalendarAt} from '../town-clock.js';

/**
 * Harbour Park, built in the town's own hand (docs/AMPLIFY-AUDIT.md, §10): the mound it
 * always stood on, turfed, with a gravel ring round the old cherry and a path up from
 * the street; a wooden bench under the tree looking out over the roofs to the port; the
 * three lamp posts; hibiscus; a
 * stone lantern; and the board with its name. It replaces a supplied Sketchfab garden
 * (CC-BY), which was photographic in a town that is drawn.
 *
 * The cherry is an Okinawan kanhizakura: deep pink in January and February, when the
 * island has its cherry blossom before anywhere else in Japan, and green the rest of the year.
 */
/** The park's three lamp posts, in the old model's (unscaled) coordinates. */
export const PARK_LAMPS=Object.freeze([[.75,-2.97],[-6.72,10.41],[13.03,-3.54]]);
/** Where the cherry stands, in the same coordinates (its collider has always been here). */
export const PARK_TREE=Object.freeze([3.5,0]);
const BLOSSOM={light:0xf7b8cf,mid:0xe98fb2,core:0xb4587f,bark:0x5a4030};
const LEAF={light:0x6cb544,mid:0x48a23a,core:0x1f5226,bark:0x5a4030};

/** Nothing to fetch any more; kept so callers that waited for the model still can. */
export async function preloadPark(){return true;}
/** The park's lawn is the town's painted turf, so the lawn round it is the same field. */
export function parkFoliage(){
 let grass=null;
 if(typeof document!=='undefined'&&document.createElement){try{grass=paintedTurf();}catch{}}
 return {grass,bush:null};
}

export function buildPark(world,options){
 const p=activePark();
 if(p.plaza)return buildPlaza(world,options,p);
 const s=p.scale||1,half=p.half,shadows=!!options.shadows;
 const group=new THREE.Group();group.name='Harbour Park';world.group.add(group);
 const at=(lx,lz)=>[p.x+lx*s,p.z+lz*s];
 const ground=(x,z)=>parkApproachHeight(x,z)??parkHeight(x,z)??parkSkirtHeight(x,z)??0;
 const [tx,tz]=at(...PARK_TREE);

 // The mound: a heightfield over the square, turf with the gravel ring and the path in.
 {const N=PARK_TERRAIN_SEGMENTS,positions=[],colours=[],uv=[],index=[],turf=new THREE.Color(TURF_TINT),path=new THREE.Color(PARK_PATH_TINT),edge=new THREE.Color(0x8f8a74),c=new THREE.Color();
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){
   const x=p.x-half+i/N*half*2,z=p.z-half+j/N*half*2;positions.push(x,ground(x,z)+GROUND_LAYER.grass,z);uv.push(x/2.4,z/2.4);
   const ring=Math.abs(Math.hypot(x-tx,z-tz)-2.35),approach=Math.abs(z-p.z)<.62&&x<tx-2.2;
   const onPath=ring<.48||approach,kerb=!onPath&&(ring<.56||(Math.abs(z-p.z)<.7&&x<tx-2.2));
   c.copy(onPath?path:kerb?edge:turf);colours.push(c.r,c.g,c.b);
  }
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;index.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);applyTerrainNormals(geo,ground);
  const mound=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:parkFoliage().grass,roughness:1}));mound.name='Harbour Park ground';mound.receiveShadow=true;group.add(mound);}

 const kit=createKit({shadows});
 // The bench under the tree, at the seat the town has always sat on: slats on cast legs,
 // its back to the trunk, looking out west over the roofs to the port.
 const f=PARK_BENCH_FIT,bx=p.x+f.x*s,bz=p.z,seatY=p.lift+benchPoint(0,f.seat,0)[1]*s,bw=f.width*f.scale*s,bl=f.length*f.scale*s,g0=ground(bx,bz);
 for(const dz of [-bl/2+.12,bl/2-.12]){kit.box(.06,seatY-g0,bw*.86,bx,(seatY+g0)/2,bz+dz,0x2f3436,{ry:Math.PI/2});kit.box(bw*.9,.06,.06,bx,g0+.03,bz+dz,0x2f3436);}
 kit.box(bw*.78,.05,bl,bx-bw*.02,seatY-.025,bz,0x9a6a42);
 for(let k=1;k<4;k++)kit.box(.012,.052,bl,bx-bw*.41+k*bw*.195,seatY-.024,bz,0x6b4a2e);
 for(let k=0;k<3;k++)kit.box(.04,.1,bl,bx+bw*.42,seatY+.2+k*.14,bz,0x9a6a42);
 for(const dz of [-bl/2+.12,bl/2-.12])kit.box(.05,.5,.05,bx+bw*.44,seatY+.25,bz+dz,0x2f3436);
 // The three lamp posts: a green post, a white globe that lights at dusk.
 for(const [lx,lz] of PARK_LAMPS){const [x,z]=at(lx,lz),y=ground(x,z);
  kit.cyl(.12,.16,.3,x,y+.15,z,0x9a958a,{segments:10});kit.cyl(.05,.06,3.1,x,y+1.75,z,0x2f5a4a,{segments:8});
  kit.sphere(.2,x,y+3.4,z,0xfff4dc,{finish:'lamp'});kit.cyl(.16,.2,.06,x,y+3.2,z,0x2f5a4a,{segments:10});}
 // Hibiscus round the edge, a stone lantern by the path, and the park's name.
 for(const [lx,lz,seed] of [[-9,-9,3],[9.5,-8.5,5],[-9.5,9,8],[0,10.5,11],[-3,-10.5,14]]){const [x,z]=at(lx,lz);kit.at(x,z,0,()=>hibiscus(kit,0,0,{seed,size:.55}),ground(x,z));}
 {const [x,z]=at(-4.2,1.6),y=ground(x,z);kit.box(.36,.12,.36,x,y+.06,z,0xa8a294);kit.cyl(.06,.08,.6,x,y+.42,z,0xa8a294,{segments:8});kit.box(.42,.32,.42,x,y+.86,z,0xb4ae9f);kit.box(.2,.18,.06,x,y+.86,z+.22,0xffe0a0,{finish:'lamp'});kit.box(.56,.1,.56,x,y+1.07,z,0x9a958a);kit.sphere(.09,x,y+1.18,z,0x9a958a);
  world.colliders.push({x,z,w:.45,d:.45,height:y+1.2,park:true});}
 {const [x,z]=at(-13.2,-2.2),y=ground(x,z);for(const dz of [-.5,.5])kit.box(.08,1.3,.08,x,y+.65,z+dz,0x6b4a32);
  const c=typeof document!=='undefined'&&document.createElement?document.createElement('canvas'):null;
  if(c&&c.getContext?.('2d')){c.width=512;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#f3e6c8';ctx.fillRect(0,0,512,192);ctx.strokeStyle='#6b4a32';ctx.lineWidth=12;ctx.strokeRect(6,6,500,180);
   ctx.fillStyle='#3a2a1a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 84px "Hiragino Mincho ProN","Noto Serif CJK JP",serif';ctx.fillText("港公園",256,80);ctx.font='bold 30px sans-serif';ctx.fillText('MINATO PARK',256,154);
   const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;kit.sign(t,1.3,.5,x,y+1.15,z,{ry:-Math.PI/2,name:'Minato Park board',both:true});}}
 const {materials}=kit.finish(group,'Harbour Park');

 // The cherry: one tree in two dresses, swapped with the calendar.
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
 const trees={blossom:new THREE.Mesh(broadleafGeometry({greens:BLOSSOM,variant:2}),material),leaf:new THREE.Mesh(broadleafGeometry({greens:LEAF,variant:2}),material)};
 for(const [k,t] of Object.entries(trees)){t.name='Harbour Park cherry '+k;t.position.set(tx,ground(tx,tz)-.05,tz);t.scale.set(6.4,6.2,6.4);t.rotation.y=.6;t.castShadow=shadows;t.receiveShadow=true;group.add(t);}
 const dress=minutes=>{const month=townCalendarAt(minutes).date.getMonth(),bloom=month<=1;trees.blossom.visible=bloom;trees.leaf.visible=!bloom;};
 dress(0);

 // The last backrest slat ends 53 cm above the seat. Collider height is a span
 // from its foot, not an absolute world elevation; otherwise the hill gets added
 // twice and an invisible wall blocks the seated avatar's camera above the bench.
 world.colliders.push({x:bx,z:bz,w:bw,d:bl,minY:g0,height:seatY+.53-g0,park:true});
 world.colliders.push({x:tx,z:tz,w:.85*s,d:.85*s,height:10,park:true});
 for(const [lx,lz] of PARK_LAMPS){const [x,z]=at(lx,lz);world.colliders.push({x,z,w:.25*s,d:.25*s,height:8,park:true});}
 const bench=new THREE.Object3D();bench.position.set(PARK_BENCH.stand[0],PARK_BENCH.position[1]+1,PARK_BENCH.stand[2]);bench.userData.seat=PARK_BENCH;world.group.add(bench);
 options.register(bench,'Sit and watch the town and harbour',()=>options.onAction('seat','Harbour Park bench','A quiet view across the rooftops and port, under the old cherry.'));
 const sign=new THREE.Object3D();{const [x,z]=at(-13.2,-2.2);sign.position.set(x-.6,ground(x,z)+1.1,z);}world.group.add(sign);
 options.register(sign,'Read the park board',()=>options.onAction('read','Minato Park','Laid out in 1972 on the old lookout mound. The kanhizakura was planted by the class of that year and flowers in January, the first cherry in Japan. Please take your rubbish home. No ball games on the mound. — Minato Town Office'));
 const pools=createLightPools(world.group,PARK_LAMPS.map(([lx,lz])=>{const [x,z]=at(lx,lz);return {x,z,y:ground(x,z),radius:2.6};}));
 (world.hourly||(world.hourly=[])).push(minutes=>{const glow=lanternGlow(minutes);pools.update(glow);if(materials.lamp)materials.lamp.emissiveIntensity=.1+glow*1.6;dress(minutes);});
 world.park={group,bench,seat:PARK_BENCH,loaded:true,pools,trees};
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
