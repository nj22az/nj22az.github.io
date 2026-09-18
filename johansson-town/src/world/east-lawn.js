import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {PARK,PARK_SKIRT,TURF_TINT} from './park-layout.js';

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
 beach:Object.freeze({profile:Object.freeze([[33.9,-.06],[38.5,-.18],[42.5,-.29],[45,-.37],[47.8,-1.05]])}),
});

/** True on the lawn itself. The caller asks the park and the roads first. */
export const eastLawnAt=(x,z,r=0)=>
 x>=EAST_LAWN.minX+r&&x<=EAST_LAWN.maxX-r&&z>=EAST_LAWN.minZ+r&&z<=EAST_LAWN.maxZ-r;

const TREE_LEAVES=[0x44664c,0x517a52,0x5d8254];
/** Lighter than the treeline: these read as shrubs on grass, not rocks. */
const CLUMP_LEAVES=[0x6d9159,0x7c9c60,0x618751];
/** How many metres of lawn one tile of the park's grass covers. */
const TURF_METRES=2.4;

/** The green the lawn shows until the park's own grass arrives (see useParkGrass). */
const BARE_TURF=0x6f8a55;

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
export function buildEastLawn({parent,colliders=[],shadows=false,heightAt=null,anisotropy=4,register=()=>{},onAction=()=>{}}={}){
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
 const xs=lines(EAST_LAWN.minX,EAST_LAWN.maxX,PARK.x-PARK.half,PARK.x+PARK.half);
 const zs=lines(EAST_LAWN.minZ,EAST_LAWN.maxZ,PARK.z-PARK.half,PARK.z+PARK.half);
 const height=(x,z)=>heightAt?heightAt(x,z):0;
 const onMound=(x,z)=>Math.abs(x-PARK.x)<=PARK.half+.01&&Math.abs(z-PARK.z)<=PARK.half+.01;
 const vertices=[],turfUV=[],faces=[];
 for(const z of zs)for(const x of xs){vertices.push(x,height(x,z)+.02,z);turfUV.push(x/TURF_METRES,z/TURF_METRES);}
 for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){
  const mx=(xs[i]+xs[i+1])/2,mz=(zs[j]+zs[j+1])/2;
  if(onMound(mx,mz))continue;
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
 parapet(wall.depth,depth+wall.depth,wall.x,(EAST_LAWN.minZ+EAST_LAWN.maxZ)/2);
 parapet(wall.x-wall.southFrom+wall.depth,wall.depth,(wall.southFrom+wall.x)/2,wall.z);

 // Sand from the foot of the wall out into the water, laid as one ribbon of sloped
 // strips so the tide line is a straight edge rather than a stack of steps.
 const sand=new THREE.BufferGeometry(),positions=[],uv=[],indices=[];
 const z0=EAST_LAWN.minZ-2.2,z1=EAST_LAWN.maxZ+2.2;
 for(const [i,[x,y]] of beach.profile.entries()){
  positions.push(x,y,z0,x,y,z1);uv.push(x/3,z0/3,x/3,z1/3);
  if(i)indices.push(i*2-2,i*2-1,i*2,i*2,i*2-1,i*2+1);
 }
 sand.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 sand.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sand.setIndex(indices);sand.computeVertexNormals();
 const grit=groundTexture('#d8caa4',[['#ded0aa',320,6],['#d0c199',260,7],['#e6dbbb',160,4]],'#cabb95');
 const shore=new THREE.Mesh(sand,new THREE.MeshStandardMaterial({color:grit?0xffffff:0xd8caa4,map:grit,roughness:1,side:THREE.DoubleSide}));
 shore.name='east-beach-sand';shore.receiveShadow=!!shadows;group.add(shore);

 // A treeline closes the north end, where the land carries on past anything built.
 const trunkMat=new THREE.MeshStandardMaterial({color:0x4f4031,roughness:1});
 const leaves=TREE_LEAVES.map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
 const treeZ=EAST_LAWN.maxZ-.6,first=EAST_LAWN.minX+1.4,last=wall.x-1.6,count=13;
 for(let i=0;i<count;i++){
  const x=first+i*(last-first)/(count-1),z=treeZ+(i%3-1)*.45,height=2.7+(i%4)*.4,radius=.78+(i%3)*.14;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.21,height*.72,7),trunkMat);
  trunk.position.set(x,height*.36,z);trunk.castShadow=!!shadows;group.add(trunk);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(radius,height*.85,7),leaves[i%leaves.length]);
  crown.position.set(x,height*.75,z);crown.scale.y=1.2;crown.castShadow=!!shadows;group.add(crown);
 }
 colliders.push({id:'east-lawn-trees',x:(first+last)/2,z:treeZ+.35,w:last-first+2.2,d:1.5,height:5.4});

 // Shrubs banked against the two closed edges, so the green itself stays open. They
 // are kept off the park mound and off the lines people walk to reach it.
 const clumps=[],park={minX:6.6,maxX:25,minZ:-33,maxZ:-14};
 let seed=8817;const random=()=>(seed=seed*1103515245+12345&0x7fffffff)/0x7fffffff;
 for(let i=0;i<150&&clumps.length<52;i++){
  const x=EAST_LAWN.minX+1.6+random()*(wall.x-EAST_LAWN.minX-3.4),z=EAST_LAWN.minZ+1.6+random()*(treeZ-EAST_LAWN.minZ-3.6);
  if(x>park.minX&&x<park.maxX&&z>park.minZ&&z<park.maxZ)continue;
  if(Math.abs(z+36)<2.2||Math.abs(z+18)<2.2)continue;
  if(wall.x-x>7&&treeZ-z>7)continue;
  clumps.push({x,z,size:.5+random()*.42,tint:Math.floor(random()*CLUMP_LEAVES.length)});
 }
 // A white base so the park's leaf texture, once it arrives, is the colour rather than
 // a tint over one; until then the per-instance greens stand in for it.
 const clumpMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1});
 // Round the normals off the shape itself.
 //
 // A polyhedron arrives with one normal per face, and the ink pass draws a line
 // wherever normals break — so a flat-shaded ball is delivered to the lawn with every
 // one of its eighty facets outlined, which reads as a bag of green rocks rather than
 // as planting. For a sphere the smooth normal is just the direction from the centre.
 const clumpGeometry=new THREE.IcosahedronGeometry(1,2);
 {
  const p=clumpGeometry.attributes.position,normals=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),length=Math.hypot(x,y,z)||1;
   normals[i*3]=x/length;normals[i*3+1]=y/length;normals[i*3+2]=z/length;
  }
  clumpGeometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
 }
 const shrubs=new THREE.InstancedMesh(clumpGeometry,clumpMat,Math.max(1,clumps.length));
 if(clumps.length){
  const dummy=new THREE.Object3D(),colour=new THREE.Color();
  clumps.forEach((c,i)=>{
   dummy.position.set(c.x,c.size*.5,c.z);dummy.scale.set(c.size*1.15,c.size*.95,c.size*1.05);
   dummy.rotation.set(0,i*1.9,0);dummy.updateMatrix();shrubs.setMatrixAt(i,dummy.matrix);
   shrubs.setColorAt(i,colour.setHex(CLUMP_LEAVES[c.tint]));
  });
  shrubs.name='East lawn planting';shrubs.castShadow=!!shadows;shrubs.receiveShadow=!!shadows;group.add(shrubs);
 }

 const marker=new THREE.Object3D();marker.name='east-seawall-view';marker.position.set(wall.x-1.1,1.2,-6);group.add(marker);
 register(marker,'Look out over the seawall',()=>onAction('inspect','East seawall','Concrete coping warm from the afternoon. Below it the sand runs down to the water, and the tide has left a line of weed and one blue float.'));
 /**
  * Lay the supplied park's own grass and leaf over the green, so the lawn and the mound
  * it runs up to are one field rather than two parks meeting along an edge. The model
  * is fetched by the detail stream, so this is called again once it arrives; until then
  * the lawn is the flat green above.
  * @returns {boolean} whether the grass was there to use.
  */
 const useParkGreenery=({grass,bush}={})=>{
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
  if(bush?.image){
   // The park's shrubs are one merged clump, so the lawn borrows the leaf rather than
   // the geometry. The per-instance greens go: the texture is the colour now.
   clumpMat.map=bush;clumpMat.needsUpdate=true;
   // White, not nothing. Dropping the attribute outright is what a mesh cannot do
   // once anything has looked at it: the section renderer decides whether there are
   // per-instance colours when it is built and then reads them every frame, so a null
   // here threw out of the render loop and cost the whole cel look. White is the same
   // picture — it lets the leaf texture through untinted — and the attribute survives.
   const white=new THREE.Color(0xffffff);
   for(let i=0;i<shrubs.count;i++)shrubs.setColorAt(i,white);
   if(shrubs.instanceColor)shrubs.instanceColor.needsUpdate=true;
  }
  return true;
 };
 return {group,lawn,shore,shrubs,useParkGreenery};
}
