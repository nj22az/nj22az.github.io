import {paintedTurf,paintedPaving} from '../render/toy-surfaces.js';
import {GROUND} from '../render/ground-palette.js';
import {applyTerrainNormals} from './terrain-surface.js';
import * as THREE from '../../vendor/three.module.js';
import {gardenGroundHeight,inGarden,gardenPondAt,GARDEN_GROUND_BOUNDS,GARDEN_PATHS} from './garden-layout.js';
import {onIslandLand} from './coastal-ground.js';
import {shoppingLaneGroundHeight} from './shopping-lane-plan.js';
import {createKit} from './okinawa/kit.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {nearestSegment} from './island-plan.js';
import {GARDEN,gardenPoint} from './garden-layout.js';
import {poster} from './okinawa/signs.js';
/** Graded verges and two direct walks turn a distant attraction into the local park. */
export function buildParkAccess(world,{register,onAction}={}){
 const group=new THREE.Group();group.name='Neighbourhood walks to Aoba Garden';world.group.add(group);
 const ground=(x,z)=>{if(inGarden(x,z))return 0;return Math.max(gardenGroundHeight(x,z)??-.4,shoppingLaneGroundHeight(x,z)??-.4);};
 // A single fine mesh replaces the old flat lawn, separate banks and raised strips.
 const bounds=GARDEN_GROUND_BOUNDS,step=.25,nx=Math.round((bounds.maxX-bounds.minX)/step),nz=Math.round((bounds.maxZ-bounds.minZ)/step),positions=[],uv=[],grass=[],paving=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=bounds.minX+i*step,z=bounds.minZ+j*step;positions.push(x,ground(x,z)+.006,z);uv.push(x/6,-z/6);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=bounds.minX+(i+.5)*step,z=bounds.minZ+(j+.5)*step;if(!onIslandLand(x,z)||gardenPondAt(x,z,.04))continue;const onPath=GARDEN_PATHS.some(r=>r.surface!=='wood'&&r.points.slice(1).some((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<=r.width/2;}));const k=j*(nx+1)+i;(onPath?paving:grass).push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex([...grass,...paving]);geometry.addGroup(0,grass.length,0);geometry.addGroup(grass.length,paving.length,1);applyTerrainNormals(geometry,ground);
 const pathMap=paintedPaving().clone();pathMap.repeat.set(2.5,-2.5);pathMap.needsUpdate=true;const terrain=new THREE.Mesh(geometry,[new THREE.MeshStandardMaterial({color:GROUND.grass,map:paintedTurf(),roughness:1}),new THREE.MeshStandardMaterial({color:GROUND.pavers,map:pathMap,roughness:1})]);terrain.name='Continuous neighbourhood garden ground';terrain.receiveShadow=true;group.add(terrain);
 const kit=createKit();
 // A readable timber entrance faces the approaching visitor, with a clear walk under it.
 kit.at(-7.04,31.8,Math.atan2(-2.6,7.6),()=>{
  for(const x of [-1.85,1.85]){kit.box(.12,2.25,.12,x,1.125,0,0x74583d);world.colliders.push(kit.rect(x-.06,x+.06,-.06,.06,2.25,'garden-entrance-post'));}
  kit.box(3.9,.12,.15,0,2.25,0,0x74583d);kit.sign(poster({title:'青葉公園',lines:['AOBA GARDEN'],band:'#355d46',bg:'#eee5cc'}),1.9,.48,0,2.5,-.08,{ry:Math.PI,name:'Aoba Garden entrance',both:true});
 });
 for(const [x,z,ry] of [[.9,15.5,Math.PI],[-35.9,24,Math.PI],[-21.8,33,Math.PI]]){
  kit.box(.09,1.9,.09,x,.95,z,0x768375);kit.sign(poster({title:'青葉公園',lines:['AOBA GARDEN','公園入口 ↑','POND & BATHHOUSE'],band:'#3c6653',bg:'#efe9d4'}),.85,.7,x,1.55,z,{ry,name:'Neighbourhood park direction'});world.colliders.push(kit.rect(x-.06,x+.06,z-.06,z+.06,2,'park-direction-post'));
 }kit.finish(group,'Park wayfinding');
 const a=new THREE.Object3D();a.position.set(.9,1,15.5);group.add(a);register?.(a,'Read the Aoba Garden direction sign',()=>onAction?.('read','Your neighbourhood garden','The garden is just along the paved walk beyond the terminal. Follow the green park signs to the stone gate, the pond and Umi-no-yu. The western homes also have a direct walk from the seawall.'));
 group.add(gardenForecourt(world,ground));
 return {group};
}

/**
 * The forecourt in front of the stone torii, where the two walks meet: a granite slab
 * pavement (nobedan) laid in a random bond between dark kerbs, and a low clipped hedge
 * along the garden's open south edge, broken wherever a path comes through. One mesh.
 */
function gardenForecourt(world,ground){
 const pieces=[],put=(w,h,d,x,y,z,hex,ry=0,round=false)=>{const g=round?new THREE.SphereGeometry(.5,10,6):new THREE.BoxGeometry(1,1,1);g.deleteAttribute('uv');
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),ry),new THREE.Vector3(w,h,d)));
  const n=g.index?g.toNonIndexed():g,c=new THREE.Color(hex),col=new Float32Array(n.attributes.position.count*3);for(let i=0;i<col.length;i+=3)c.toArray(col,i);n.setAttribute('color',new THREE.BufferAttribute(col,3));pieces.push(n);};
 let seed=7;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
 // Nobedan: rows of granite slabs, each row a different rhythm, from the walk up to the gate.
 const cx=GARDEN.entry[0],width=2.4,granite=[0x8f8e86,0x9c998f,0x85847d,0x95928a];
 for(let z=31.6;z<37.6;z+=.62){let x=cx-width/2;while(x<cx+width/2-.05){const w=Math.min(cx+width/2-x,.45+rand()*.7);const mx=x+w/2,mz=z+.3;put(w-.05,.08,.57,mx,ground(mx,mz)-.015,mz,granite[Math.floor(rand()*4)]);x+=w;}}
 for(const s of [-1,1])for(let z=31.6;z<37.6;z+=.75)put(.14,.1,.73,cx+s*(width/2+.07),ground(cx+s*(width/2+.07),z+.37)-.01,z+.37,0x66665f);
 // Karikomi: a clipped hedge, 70 cm, rounded on top, in two wings either side of the gate, framing it without closing the lawn.
 const paths=GARDEN_PATHS,hedgeZ=gardenPoint(0,111.4)[1],torii=[cx-2.3,cx+2.3],colliders=[];let run=null;
 const blocked=x=>x>torii[0]&&x<torii[1]||paths.some(r=>r.points.slice(1).some((b,i)=>nearestSegment(x,hedgeZ,r.points[i],b)<r.width/2+.55));
 for(let x=cx-7;x<=cx+7;x+=.5){
  if(blocked(x)){run=null;continue;}
  const y=ground(x,hedgeZ),tone=Math.floor(x*2)%3;
  put(.56,.5,.7,x,y+.25,hedgeZ,[0x3f6a3a,0x46733f,0x3a6236][(tone+3)%3]);put(.62,.36,.74,x,y+.52,hedgeZ,[0x4f7d45,0x588a4b,0x4a7642][(tone+3)%3],0,true);
  if(!run){run={from:x-.28,to:x+.28};colliders.push(run);}else run.to=x+.28;
 }
 world.colliders.push(...colliders.map(r=>({id:'garden-hedge',x:(r.from+r.to)/2,z:hedgeZ,w:r.to-r.from,d:.72,height:.75})));
 const mesh=new THREE.Mesh(mergeGeometries(pieces,false),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9}));
 pieces.forEach(g=>g.dispose());mesh.name='Garden forecourt';mesh.receiveShadow=true;mesh.castShadow=true;return mesh;
}
