import * as THREE from '../../vendor/three.module.js';
import {GROUND} from '../render/ground-palette.js';
import {MAIN_ROAD} from './main-road.js';
import {PARK,PARK_SKIRT,TURF_TINT} from './park-layout.js';
import {GROUND_LAYER} from './ground-layers.js';
import {buildEastGarden} from './east-garden.js';
import {SCHOOL} from './school-layout.js';
import {BEACH,beachHeight} from './beach-layout.js';
import {inKobanPlot} from './koban-layout.js';
import {GATEBALL} from './okinawa/layout.js';
import {paintedTurf} from '../render/toy-surfaces.js';
import {broadleafGeometry} from './okinawa/trees.js';

/**
 * The east side of the town: one green from the boardwalk out to the water.
 *
 * With the port to the north and the shops to the west, everything east of the road
 * was ground you could look at but not stand on. The park sat in the middle of it like
 * an island — reachable only through its own ramp — and the rest was scenery half a
 * metre below the pavement, so the town had a walking lane rather than a side.
 *
 * It is now lawn at pavement level, from the pavement's east kerb to a seawall, with
 * sand and the sea below the wall. The park keeps its mound and its ramp: routeAt asks
 * the park first, so the lawn is the ground around it, not a lid over it.
 */
export const EAST_LAWN=Object.freeze({
 id:'east-lawn',surface:'grass',
 minX:MAIN_ROAD.pavementEast,maxX:33.2,minZ:-38,maxZ:24.6,
 /** The parapet at the far end, and the south return that closes the corner. */
 wall:Object.freeze({x:33.55,z:-38.35,depth:.7,height:.58,southFrom:18.6}),
 /**
  * Sand from the foot of the wall out past the headland's edge. It has to stay above
  * the peninsula's own ground (y -0.4) the whole way it is dry, or the land draws
  * through it; it crosses the water plane at y -0.56 a little beyond the old shore,
  * which is where the tide line ends up.
  */
 beach:BEACH,
});

/** True on the lawn itself. The caller asks the park and the roads first. */
export const eastLawnAt=(x,z,r=0)=>
 x>=EAST_LAWN.minX+r&&x<=EAST_LAWN.maxX-r&&z>=EAST_LAWN.minZ+r&&z<=EAST_LAWN.maxZ-r;

/** How many metres of lawn one tile of the park's grass covers. */
const TURF_METRES=2.4;

/** The green the lawn shows without a page to paint the turf on. */
const BARE_TURF=GROUND.grass;

/**
 * Ground drawn rather than fetched, for the surfaces the town supplies no photograph
 * of: sand, and the gravel of the yard on the other side of the road. A flat fill
 * reads as a sheet of card at this scale, and a couple of passes of soft blotches over
 * a scratch of grain is enough at walking height.
 */
export function groundTexture(base,marks,strokes){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
 let seed=20250918;const random=()=>(seed=seed*1103515245+12345&0x7fffffff)/0x7fffffff;
 for(const [colour,count,size] of marks){
  ctx.fillStyle=colour;
  for(let i=0;i<count;i++){const x=random()*256,y=random()*256,r=size*(.5+random());
   ctx.beginPath();ctx.ellipse(x,y,r,r*(.6+random()*.7),random()*Math.PI,0,Math.PI*2);ctx.fill();}
 }
 if(strokes){
  ctx.strokeStyle=strokes;ctx.lineWidth=1;
  for(let i=0;i<900;i++){const x=random()*256,y=random()*256,a=random()*Math.PI*2,l=1.5+random()*2.5;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);ctx.stroke();}
 }
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;
 return texture;
}

/** Roughly how wide one cell of the lawn's grid is. */
const CELL=1.2;

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {Array} options.colliders  the wall and the treeline are solid.
 * @param {(x:number,z:number)=>number} [options.heightAt]  the walkable ground, so the
 *   lawn's surface is the surface the player's feet are put on — in particular the
 *   graded foot of the park mound, which used to be a vertical face you walked into.
 */
export function buildEastLawn({parent,colliders=[],shadows=false,heightAt=null,paved=null,anisotropy=4,register=()=>{},onAction=()=>{}}={}){
 const group=new THREE.Group();group.name='East lawn, seawall and beach';parent.add(group);
 const {wall,beach}=EAST_LAWN;
 const width=EAST_LAWN.maxX-EAST_LAWN.minX,depth=EAST_LAWN.maxZ-EAST_LAWN.minZ;

 // A grid rather than one slab: the mound's foot is graded into the lawn now, so the
 // green has to follow the ground the player actually walks on. Cells wholly inside
 // the park square are left out — the park's own model stands there.
 // The grid lines carry the park square's own edges, so every cell lies either wholly
 // on the mound or wholly off it. Without that the cells that straddled the boundary
 // rose to the mound's height at their inner corners and fought the model's surface
 // for the same pixels — a bright green seam all the way round the park.
 const lines=(from,to,...keep)=>{
  const set=new Set([from,to,...keep.filter(v=>v>from+.05&&v<to-.05)]);
  for(let v=from;v<to;v+=CELL)set.add(v);
  return [...set].sort((a,b)=>a-b);
 };
 // The gateball court's edges too: the court is level ground cut into the hill's foot,
 // and the lawn stops at its retaining wall rather than sloping in under the sand.
 const xs=lines(EAST_LAWN.minX,EAST_LAWN.maxX,PARK.x-PARK.half,PARK.x+PARK.half,GATEBALL.minX,GATEBALL.maxX);
 const zs=lines(EAST_LAWN.minZ,EAST_LAWN.maxZ,PARK.z-PARK.half,PARK.z+PARK.half,GATEBALL.minZ,GATEBALL.maxZ);
 const onCourt=(x,z)=>x>GATEBALL.minX&&x<GATEBALL.maxX&&z>GATEBALL.minZ&&z<GATEBALL.maxZ;
 const height=(x,z)=>heightAt?heightAt(x,z):0;
 const onMound=(x,z)=>Math.abs(x-PARK.x)<=PARK.half+.01&&Math.abs(z-PARK.z)<=PARK.half+.01;
 const vertices=[],turfUV=[],faces=[];
 // Under a path the turf is tucked a few centimetres down. Its 1.2m grid runs straight
 // between samples while the paving follows the slope on a finer one, so where the ground
 // bends -- the rise beside the harbour office -- the grass came up through the middle
 // of the path as a green stripe.
 const tuck=(x,z)=>paved?.(x,z)?.08:0;
 for(const z of zs)for(const x of xs){vertices.push(x,height(x,z)+GROUND_LAYER.grass-tuck(x,z),z);turfUV.push(x/TURF_METRES,z/TURF_METRES);}
 for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){
  const mx=(xs[i]+xs[i+1])/2,mz=(zs[j]+zs[j+1])/2;
  if(onMound(mx,mz)||onCourt(mx,mz))continue;
  const a=j*xs.length+i,b=a+1,c=a+xs.length,d=c+1;
  faces.push(a,c,b,b,c,d);
 }
 const turf=new THREE.BufferGeometry();
 turf.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 turf.setAttribute('uv',new THREE.Float32BufferAttribute(turfUV,2));
 turf.setIndex(faces);turf.computeVertexNormals();
 const lawn=new THREE.Mesh(turf,new THREE.MeshStandardMaterial({color:BARE_TURF,roughness:1}));
 lawn.name='east-lawn-grass';lawn.receiveShadow=!!shadows;group.add(lawn);

 // The parapet. Low enough to see the water over, solid enough to stop at.
 const stone=new THREE.MeshStandardMaterial({color:0xa8a293,roughness:.92});
 const cap=new THREE.MeshStandardMaterial({color:0x8e897c,roughness:.86});
 const parapet=(w,d,x,z)=>{
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,wall.height,d),stone);
  body.position.set(x,wall.height/2,z);body.castShadow=!!shadows;body.receiveShadow=!!shadows;group.add(body);
  const coping=new THREE.Mesh(new THREE.BoxGeometry(w+.14,.1,d+.14),cap);
  coping.position.set(x,wall.height+.05,z);coping.receiveShadow=!!shadows;group.add(coping);
  colliders.push({id:'east-seawall',x,z,w:w+.14,d:d+.14,height:wall.height+.1});
 };
 // Real openings in the mesh and collision wall lead down to the sand.
 let wallFrom=EAST_LAWN.minZ-wall.depth/2;
 for(const access of [...BEACH.accesses,{z:EAST_LAWN.maxZ+wall.depth/2,half:0}]){
  const wallTo=access.z-access.half;
  if(wallTo>wallFrom)parapet(wall.depth,wallTo-wallFrom,wall.x,(wallFrom+wallTo)/2);
  wallFrom=access.z+access.half;
 }
 parapet(wall.x-wall.southFrom+wall.depth,wall.depth,(wall.southFrom+wall.x)/2,wall.z);

 // Sand from the foot of the wall out into the water, laid as one ribbon of sloped
 // strips so the tide line is a straight edge rather than a stack of steps.
 const sand=new THREE.BufferGeometry(),positions=[],uv=[],indices=[];
 const z0=BEACH.minZ,z1=BEACH.maxZ;
 for(const [i,[x,y]] of beach.profile.entries()){
  positions.push(x,y,z0,x,y,z1);uv.push(x/3,z0/3,x/3,z1/3);
  if(i)indices.push(i*2-2,i*2-1,i*2,i*2,i*2-1,i*2+1);
 }
 sand.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 sand.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sand.setIndex(indices);sand.computeVertexNormals();
 const grit=groundTexture('#e3d2a4',[['#e9d9b0',320,6],['#d8c595',260,7],['#efe4c4',160,4]],'#d4c191');
 const shore=new THREE.Mesh(sand,new THREE.MeshStandardMaterial({color:grit?0xffffff:GROUND.sand,map:grit,roughness:1,side:THREE.DoubleSide}));
 shore.name='east-beach-sand';shore.receiveShadow=!!shadows;group.add(shore);
 for(const access of BEACH.accesses){
  const {fromX,toX,z,half}=access,y=beachHeight(toX,z);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute([
   fromX,.008,z-half,fromX,.008,z+half,toX,y+.008,z-half,toX,y+.008,z+half],3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,1,1,0,1,1],2));
  geometry.setIndex([0,1,2,2,1,3]);geometry.computeVertexNormals();
  const ramp=new THREE.Mesh(geometry,stone);ramp.name='Beach access ramp';ramp.receiveShadow=!!shadows;group.add(ramp);
  const anchor=new THREE.Object3D();anchor.position.set(fromX-.65,.9,z);group.add(anchor);
  register(anchor,'Read the beach access sign',()=>onAction('read','East beach','The opening in the seawall leads down to the sand. Follow the shore to the other beach entrance.'));
 }


 // A treeline closes the north end, where the land carries on past anything built.
 const treeMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});
 const shapes=[0,1,2].map(variant=>broadleafGeometry({variant}));
 const treeZ=EAST_LAWN.maxZ-.6,first=EAST_LAWN.minX+1.4,last=wall.x-1.6,count=13;
 // With a gap for the school gate, which the lawn's path runs through.
 const gate=SCHOOL.gate,clear=x=>Math.abs(x-gate.x)<gate.half+.9||inKobanPlot(x,treeZ,1.1);// and the police box
 for(let i=0;i<count;i++){
  const x=first+i*(last-first)/(count-1),z=treeZ+(i%3-1)*.45,height=3.6+(i%4)*.45;
  if(clear(x))continue;
  const tree=new THREE.Mesh(shapes[i%3],treeMat);tree.name='East lawn tree';
  tree.position.set(x,0,z);tree.scale.setScalar(height);tree.rotation.y=i*1.7;tree.castShadow=!!shadows;tree.receiveShadow=true;group.add(tree);
 }
 const west=first-1.1,eastEnd=last+1.1,g0=gate.x-gate.half-.35,g1=gate.x+gate.half+.35;
 colliders.push({id:'east-lawn-trees',x:(west+g0)/2,z:treeZ+.35,w:g0-west,d:1.5,height:5.4},
  {id:'east-lawn-trees',x:(g1+eastEnd)/2,z:treeZ+.35,w:eastEnd-g1,d:1.5,height:5.4});

 // No shrub clumps on the green. They were round balls on flat grass, and from the hill
 // they read as a scatter of boulders rather than as planting; the treeline, the park's
 // tree and the gardens carry the green without them.

 const marker=new THREE.Object3D();marker.name='east-seawall-view';marker.position.set(wall.x-1.1,1.2,-6);group.add(marker);
 register(marker,'Look out over the seawall',()=>onAction('inspect','East seawall','Concrete coping warm from the afternoon. Below it the sand runs down to the water, and the tide has left a line of weed and one blue float.'));
 const garden=buildEastGarden({parent:group,colliders,shadows,heightAt,register,onAction});
 /**
  * Lay the supplied park's own grass and leaf over the green, so the lawn and the mound
  * it runs up to are one field rather than two parks meeting along an edge. The model
  * is fetched by the detail stream, so this is called again once it arrives; until then
  * the lawn is the flat green above.
  * @returns {boolean} whether the grass was there to use.
  */
 const useParkGreenery=({grass}={})=>{
  if(!grass?.image)return false;
  // The tiling is in the lawn's own UVs, in metres, so the texture repeats once per
  // TURF_METRES wherever the ground goes.
  const map=grass.clone();map.needsUpdate=true;
  map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(1,1);
  // You almost never look down at a lawn; you look along it, and along is where a
  // texture smears. Anisotropy is the one setting that fixes that, and it was pinned
  // at 4 while the rest of the town takes whatever the device will give.
  map.anisotropy=Math.max(map.anisotropy,anisotropy);
  lawn.material.map=map;lawn.material.color.setHex(TURF_TINT);lawn.material.needsUpdate=true;
  return true;
 };
 // The same painted turf as the park's own ground from the start, so the two greens match
 // before the park has streamed in -- and where it never does.
 if(typeof document!=='undefined'&&document.createElement){try{const turf=paintedTurf();if(turf)useParkGreenery({grass:turf});}catch{}}
 return {group,lawn,shore,garden,useParkGreenery,tick:garden.tick};
}
