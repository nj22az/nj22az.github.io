import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';

/**
 * Kitano-jima as a tropical island: white beaches, clear shallows, a jungle hill and the
 * small airport on its flat north side. Built in the airport island's own frame (u along the
 * runway, v across it; y = 0 is sea level), so the runway, pier, cargo court, check-in and
 * flights keep their places, saves and timetables.
 *
 * One terrain grid is the island. The mesh is drawn from it and the walking height reads
 * the same triangles back (tropicHeight), so feet stand on what is drawn, on the beach
 * slope and the hillside alike. The shore is the grid's zero contour, and the same
 * outline feeds the sea's shallows and the visitor map.
 *
 * Plan, by purpose:
 * - North side, airside: the runway, apron, terminal, hangar, tower and sewage works on
 *   the old reclaimed plateau, fenced at v = 16.75. A strip of beach beyond the runway
 *   that nobody walks on: it is what passengers see from the plane.
 * - West: the ferry quay (cargo court and pier), where the Minato car ferry lands.
 * - Terminal plaza, beside check-in: three kiosks a traveller needs and the departure
 *   lounge, a thatched shelter looking at the runway.
 * - South-west: Coral Bay, the long crescent of sand under leaning coconut palms, the
 *   reason people come over on the ferry with a towel.
 * - Middle: the jungle hill (Mount Hinata), a trail up through the trees to a lookout.
 * - East: Turtle Cove, a small sheltered inlet below the hill.
 */

/** Waterline, island frame. The quay at u = -53 is kept straight for the ferry. */
const OUTLINE_POINTS=[
 [-53,37],[-53,31],[-53,25],[-53,19],[-57,12],[-60,2],[-58,-10],[-48,-18],[-30,-21],[-5,-22],[20,-21.5],[42,-20],[58,-16],
 [72,-9],[86,0],[98,10],[108,22],[112,34],[109,45],[100,52],[95,59],[101,67],[106,76],[100,87],[86,96],[68,102],[50,106],
 [34,104],[22,98],[12,90],[0,86],[-12,88],[-24,92],[-36,90],[-46,82],[-52,70],[-54,56],[-53,46],
];
function closedSpline(points,per=6){
 const out=[],n=points.length;
 for(let i=0;i<n;i++){
  const p0=points[(i-1+n)%n],p1=points[i],p2=points[(i+1)%n],p3=points[(i+2)%n];
  for(let k=0;k<per;k++){const t=k/per,t2=t*t,t3=t2*t;out.push([0,1].map(a=>.5*((2*p1[a])+(-p0[a]+p2[a])*t+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t2+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t3)));}
 }
 return out;
}
/** The island's waterline as a dense closed polygon, island frame. */
export const TROPIC_OUTLINE=Object.freeze(closedSpline(OUTLINE_POINTS).map(p=>Object.freeze(p)));

/** Where the island's places are, island frame. */
export const TROPIC_PLACES=Object.freeze({
 fence:16.75,
 plaza:Object.freeze({minX:-8,maxX:36,minZ:21,maxZ:34}),
 kiosks:Object.freeze([[3.5,31.6],[12,31.6],[20.5,31.6]].map(Object.freeze)),
 lounge:Object.freeze([29.5,26.5]),
 coralBay:Object.freeze([-14,80]),
 lookout:Object.freeze([54,68]),
 turtleCove:Object.freeze([92,64]),
 quayU:-53,
});
/** The trail: plaza → Coral Bay, and from the fork up the hill to the lookout and down to Turtle Cove. */
export const TROPIC_TRAILS=Object.freeze([
 [[-4,34],[-6,44],[-9,56],[-12,68],[-13,76]],
 [[-6,44],[6,49],[20,54],[32,60],[44,66],[54,68]],
 [[54,68],[64,70],[76,68],[86,64],[92,64]],
].map(t=>Object.freeze(t.map(Object.freeze))));

const HILLS=[[54,68,14,21],[86,36,7,12],[20,74,3.5,12],[78,84,4,13]];
const PLATEAU=Object.freeze({minX:-58,maxX:64,minZ:-12,maxZ:40,y:1.1,feather:10});
export const TROPIC_PLATEAU_Y=PLATEAU.y;

function segDist(px,pz,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(px-a[0]-dx*t,pz-a[1]-dz*t);}
function inside(px,pz,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j],zi=a[1],zj=b[1];if((zi>pz)!==(zj>pz)&&px<(b[0]-a[0])*(pz-zi)/(zj-zi)+a[0])c=!c;}return c;}
/** How far the waterline distance is measured; nothing on the island looks further. */
const SHORE_REACH=36,BUCKET=12;
let buckets=null;
function shoreBuckets(){
 if(buckets)return buckets;buckets=new Map();const O=TROPIC_OUTLINE;
 for(let i=0;i<O.length;i++){const a=O[i],b=O[(i+1)%O.length];for(let x=Math.floor(Math.min(a[0],b[0])/BUCKET);x<=Math.floor(Math.max(a[0],b[0])/BUCKET);x++)for(let z=Math.floor(Math.min(a[1],b[1])/BUCKET);z<=Math.floor(Math.max(a[1],b[1])/BUCKET);z++){const k=(x+64)*256+z+64;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(a,b);}}
 return buckets;
}
/** Signed metres to the waterline, positive on land, capped at 36 m either way. */
const OUTLINE_BOX=TROPIC_OUTLINE.reduce((b,[u,v])=>[Math.min(b[0],u),Math.min(b[1],v),Math.max(b[2],u),Math.max(b[3],v)],[Infinity,Infinity,-Infinity,-Infinity]);
export function shoreSigned(u,v){
 if(u<OUTLINE_BOX[0]-SHORE_REACH||v<OUTLINE_BOX[1]-SHORE_REACH||u>OUTLINE_BOX[2]+SHORE_REACH||v>OUTLINE_BOX[3]+SHORE_REACH)return -SHORE_REACH;
 const B=shoreBuckets(),bx=Math.floor(u/BUCKET),bz=Math.floor(v/BUCKET),n=Math.ceil(SHORE_REACH/BUCKET);let d=SHORE_REACH;
 for(let x=bx-n;x<=bx+n;x++)for(let z=bz-n;z<=bz+n;z++){const list=B.get((x+64)*256+z+64);if(list)for(let i=0;i<list.length;i+=2)d=Math.min(d,segDist(u,v,list[i],list[i+1]));}
 return inside(u,v,TROPIC_OUTLINE)?d:-d;
}
export function trailDistance(u,v){let d=Infinity;for(const t of TROPIC_TRAILS)for(let i=0;i+1<t.length;i++)d=Math.min(d,segDist(u,v,t[i],t[i+1]));return d;}
function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function plateauWeight(u,v){const P=PLATEAU,ex=Math.max(P.minX-u,0,u-P.maxX),ez=Math.max(P.minZ-v,0,v-P.maxZ);return 1-smooth(0,P.feather,Math.hypot(ex,ez));}
function hills(u,v){let h=0;for(const [x,z,a,r] of HILLS)h+=a*Math.exp(-((u-x)**2+(v-z)**2)/(r*r));return h+.6*Math.sin(u*.11+v*.07)*Math.cos(v*.09-u*.05);}

/** The analytic shape the grid samples: beach profile, the hills, and the flat airport. */
function shapeHeight(u,v,d=shoreSigned(u,v)){
 // The hilltop is levelled into a pad for the lookout deck, which stands one step above it.
 const [lu,lv]=TROPIC_PLACES.lookout,pad=1-smooth(4.5,9,Math.hypot(u-lu,v-lv));
 const h=naturalHeight(u,v,d);return pad>0?h+(naturalHeight(lu,lv,shoreSigned(lu,lv))-h)*pad:h;
}
function naturalHeight(u,v,d){
 if(d<0)return Math.max(-3,d*.32);
 let s=Math.min(1,d/9);s=s*(2-s);
 let h=.95*s+.15*smooth(9,15,d)+hills(u,v)*smooth(10,28,d);
 const w=plateauWeight(u,v);h+=(PLATEAU.y-h)*w;
 return h;
}

/** The terrain grid. Square cells, each split along the same diagonal as the mesh. */
export const TROPIC_GRID=Object.freeze({minX:-66,maxX:120,minZ:-28,maxZ:110,step:1.5});
const NX=Math.round((TROPIC_GRID.maxX-TROPIC_GRID.minX)/TROPIC_GRID.step),NZ=Math.round((TROPIC_GRID.maxZ-TROPIC_GRID.minZ)/TROPIC_GRID.step);
let heights=null,shoreField=null;
function grid(){
 if(heights)return heights;
 heights=new Float32Array((NX+1)*(NZ+1));shoreField=new Float32Array((NX+1)*(NZ+1));
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const u=TROPIC_GRID.minX+i*TROPIC_GRID.step,v=TROPIC_GRID.minZ+j*TROPIC_GRID.step,k=j*(NX+1)+i;shoreField[k]=shoreSigned(u,v);heights[k]=shapeHeight(u,v,shoreField[k]);}
 return heights;
}
/** Height above sea level of the drawn ground at (u,v), island frame; -3 off the grid. */
export function tropicHeight(u,v){
 const H=grid(),G=TROPIC_GRID,fx=(u-G.minX)/G.step,fz=(v-G.minZ)/G.step;
 if(fx<0||fz<0||fx>=NX||fz>=NZ)return -3;
 const i=Math.floor(fx),j=Math.floor(fz),tx=fx-i,tz=fz-j,a=H[j*(NX+1)+i],b=H[j*(NX+1)+i+1],c=H[(j+1)*(NX+1)+i],d=H[(j+1)*(NX+1)+i+1];
 // Triangles (a,c,b) and (b,c,d): the diagonal runs from b to c.
 return tx+tz<=1?a+(b-a)*tx+(c-a)*tz:d+(c-d)*(1-tx)+(b-d)*(1-tz);
}
/** The waterline distance read off the grid: close enough to place a plant by. */
function shoreAt(u,v){
 grid();const G=TROPIC_GRID,fx=Math.max(0,Math.min(NX-1e-6,(u-G.minX)/G.step)),fz=Math.max(0,Math.min(NZ-1e-6,(v-G.minZ)/G.step)),i=Math.floor(fx),j=Math.floor(fz),tx=fx-i,tz=fz-j,F=shoreField,k=j*(NX+1)+i;
 return (F[k]*(1-tx)+F[k+1]*tx)*(1-tz)+(F[k+NX+1]*(1-tx)+F[k+NX+2]*tx)*tz;
}
/** True where a walker's feet are on dry island ground. */
export function tropicLand(u,v){return tropicHeight(u,v)>.18;}

/** The island's surface name at a point, for footsteps and the map. */
export function tropicSurface(u,v){
 const t=trailDistance(u,v);if(t<1.4)return 'gravel';
 return shoreAt(u,v)<10&&plateauWeight(u,v)<.5?'sand':'grass';
}

function mulberry(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

/**
 * Every tree and bush on the island, placed once by rule, the same on every device:
 * coconut palms on the sand above the tide line, leaning to the sea; rainforest trees on
 * the hill; flowering shrubs where people pass. Nothing on the trail, the plaza, the quay or
 * the airside.
 */
let plantings=null;
export function tropicalPlantings(){
 if(plantings)return plantings;
 grid();const rand=mulberry(19970710),palms=[],trees=[],bushes=[];
 const P=TROPIC_PLACES,clearOfPlaces=(u,v,r)=>{
  if(u>P.plaza.minX-r&&u<P.plaza.maxX+r&&v>P.plaza.minZ-r-6&&v<P.plaza.maxZ+r)return false;
  if(u<-36&&v>14&&v<42)return false;
  // The lookout keeps its view: no rainforest trees within fourteen metres of the deck,
  // and none on the west slope below it, where the view runs across the strait to Minato.
  if(Math.hypot(u-P.lookout[0],v-P.lookout[1])<(r>1?(u<P.lookout[0]+6?26:14):5)+r)return false;
  if(Math.hypot(u-P.coralBay[0],v-P.coralBay[1])<5+r)return false;
  return trailDistance(u,v)>1.6+r;
 };
 const airside=(u,v)=>v<P.fence+1.5&&v>-16;
 for(let n=0;n<4000&&palms.length<120;n++){
  const u=TROPIC_GRID.minX+rand()*(TROPIC_GRID.maxX-TROPIC_GRID.minX),v=TROPIC_GRID.minZ+rand()*(TROPIC_GRID.maxZ-TROPIC_GRID.minZ),d=shoreAt(u,v);
  if(d<2.6||d>13||airside(u,v)||!clearOfPlaces(u,v,.8)||plateauWeight(u,v)>.4)continue;
  if(palms.some(p=>Math.hypot(p.u-u,p.v-v)<4.2))continue;
  // Lean toward the water, as palms on a beach do.
  const e=.7,gx=shoreAt(u+e,v)-shoreAt(u-e,v),gz=shoreAt(u,v+e)-shoreAt(u,v-e);
  palms.push({u,v,y:tropicHeight(u,v),lean:Math.atan2(-gz,-gx),scale:.85+rand()*.4,turn:rand()*Math.PI*2});
 }
 for(let n=0;n<9000&&trees.length<240;n++){
  const u=TROPIC_GRID.minX+rand()*(TROPIC_GRID.maxX-TROPIC_GRID.minX),v=TROPIC_GRID.minZ+rand()*(TROPIC_GRID.maxZ-TROPIC_GRID.minZ),d=shoreAt(u,v);
  if(d<12||airside(u,v)||v<P.fence+3||!clearOfPlaces(u,v,1.6)||plateauWeight(u,v)>.25)continue;
  if(trees.some(p=>Math.hypot(p.u-u,p.v-v)<4.6))continue;
  trees.push({u,v,y:tropicHeight(u,v),scale:.8+rand()*.8,turn:rand()*Math.PI*2,tone:Math.floor(rand()*4)});
 }
 for(let n=0;n<9000&&bushes.length<420;n++){
  const u=TROPIC_GRID.minX+rand()*(TROPIC_GRID.maxX-TROPIC_GRID.minX),v=TROPIC_GRID.minZ+rand()*(TROPIC_GRID.maxZ-TROPIC_GRID.minZ),d=shoreAt(u,v);
  if(d<5||airside(u,v)||v<P.fence+1||!clearOfPlaces(u,v,.6))continue;
  if(plateauWeight(u,v)>.5&&!(u>P.plaza.minX-4&&u<P.plaza.maxX+4&&v>P.plaza.maxZ&&v<P.plaza.maxZ+4))continue;
  if(bushes.some(p=>Math.hypot(p.u-u,p.v-v)<1.8)||trees.some(p=>Math.hypot(p.u-u,p.v-v)<1.6)||palms.some(p=>Math.hypot(p.u-u,p.v-v)<1.4))continue;
  // Bougainvillea where people walk by: along the trail and the plaza; ferns in the shade.
  const near=trailDistance(u,v)<5||v<P.plaza.maxZ+5;
  const flower=near&&rand()<.55;bushes.push({u,v,y:tropicHeight(u,v),scale:(flower?.55:.7)+rand()*(flower?.35:.7),turn:rand()*Math.PI*2,flower});
 }
 plantings={palms,trees,bushes};
 return plantings;
}

const SAND=new THREE.Color(0xf6ead0),WET=new THREE.Color(0xe3d2ad),LAWN=new THREE.Color(0x76a654),JUNGLE=new THREE.Color(0x4a8139),HIGH=new THREE.Color(0x3d7234),TRAIL=new THREE.Color(0xdcc597),QUAY=new THREE.Color(0xb9b4a6);

function terrainGeometry(){
 const H=grid(),G=TROPIC_GRID,pos=new Float32Array((NX+1)*(NZ+1)*3),col=new Float32Array((NX+1)*(NZ+1)*3),idx=[],c=new THREE.Color();
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){
  const k=j*(NX+1)+i,u=G.minX+i*G.step,v=G.minZ+j*G.step,h=H[k],d=shoreField[k],w=plateauWeight(u,v);
  pos.set([u,h,v],k*3);
  if(d<1.2)c.copy(WET);else c.copy(SAND).lerp(d>12?JUNGLE:LAWN,smooth(7,12,d)*(1-w));
  if(w>.02)c.lerp(LAWN,Math.min(1,w*1.4)*smooth(1,5,d));
  if(h>3)c.lerp(HIGH,smooth(3,12,h));
  if(u<-50&&v>17&&v<39&&d<4)c.copy(QUAY);
  const t=trailDistance(u,v);if(t<1.8&&d>1)c.lerp(TRAIL,1-smooth(.9,1.8,t));
  // A faint, fixed mottling so the lawn and sand do not read as plastic.
  const m=1+.04*Math.sin(u*1.7+v*.9)*Math.cos(v*1.3-u*.4);col.set([c.r*m,c.g*m,c.b*m],k*3);
 }
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){
  const a=j*(NX+1)+i,b=a+1,c2=a+NX+1,d=c2+1;
  // Skip cells wholly under the sea floor's flat floor; the opaque sea hides them anyway.
  if(Math.max(H[a],H[b],H[c2],H[d])<-2.9)continue;
  idx.push(a,c2,b,b,c2,d);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 return g;
}

function palmParts(){
 // A trunk bending over toward +x, ringed, and a crown of drooping fronds at its tip.
 const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,-.3,0),new THREE.Vector3(.4,3.6,0),new THREE.Vector3(1.9,6.6,0));
 const trunk=new THREE.TubeGeometry(curve,8,.2,6,false);
 const tip=curve.getPoint(1),fronds=[];
 for(let f=0;f<8;f++){
  const a=f/8*Math.PI*2+.2,pts=[],w=[.05,.32,.36,.26,.04],len=3.3;
  const g=new THREE.BufferGeometry(),p=[];
  for(let s=0;s<5;s++){const t=s/4,r=len*t,y=.5*t-1.7*t*t;pts.push([r,y,w[s]]);}
  for(let s=0;s<4;s++){const [r0,y0,w0]=pts[s],[r1,y1,w1]=pts[s+1];p.push(r0,y0,-w0,r1,y1,-w1,r0,y0,w0,r0,y0,w0,r1,y1,-w1,r1,y1,w1);}
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.rotateZ(.05);g.rotateY(a);g.translate(tip.x,tip.y,tip.z);g.computeVertexNormals();fronds.push(g);
 }
 const nuts=[0,1,2].map(n=>new THREE.IcosahedronGeometry(.17,0).translate(tip.x+Math.cos(n*2.1)*.25,tip.y-.25,Math.sin(n*2.1)*.25));
 return {trunk,crown:mergeGeometries(fronds),nuts:mergeGeometries(nuts)};
}
function treeParts(){
 const trunk=new THREE.CylinderGeometry(.22,.38,5,7).translate(0,2.2,0);
 const crown=mergeGeometries([[0,5.6,0,2.5],[1.4,5,.6,1.8],[-1.2,5.2,-.7,1.9],[.2,6.6,-.3,1.7]].map(([x,y,z,r])=>new THREE.IcosahedronGeometry(r,1).scale(1,.8,1).translate(x,y,z)));
 return {trunk,crown};
}

/** Draws the island into `group` (the airport island's own frame). */
export function buildTropicalIsland(group){
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.95,...extra});
 const terrain=new THREE.Mesh(terrainGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
 terrain.name='Kitano-jima island ground';terrain.receiveShadow=true;group.add(terrain);
 // The ferry quay's face, where the cargo court meets deep water.
 const quay=new THREE.Mesh(new THREE.BoxGeometry(1.2,4,19),mat(0xa8a396));quay.name='Kitano-jima ferry quay wall';quay.position.set(TROPIC_PLACES.quayU-.2,-.92,28);group.add(quay);
 const {palms,trees,bushes}=tropicalPlantings(),m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),col=new THREE.Color();
 const instanced=(name,geometry,material,list,place)=>{const im=new THREE.InstancedMesh(geometry,material,list.length);im.name=name;list.forEach((it,k)=>{place(it,k,im);im.setMatrixAt(k,m);});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere();im.computeBoundingBox?.();group.add(im);return im;};
 const palmM=(it)=>{q.setFromAxisAngle(up,-it.lean);m.compose(p.set(it.u,it.y,it.v),q,s.setScalar(it.scale));};
 const pp=palmParts();
 instanced('Coconut palm trunks',pp.trunk,mat(0x8a6a4a),palms,palmM);
 instanced('Coconut palm fronds',pp.crown,mat(0x3f8f3a,{side:THREE.DoubleSide}),palms,(it,k,im)=>{palmM(it);im.setColorAt(k,col.set(k%3?0x4c9a3e:0x5aa648));});
 instanced('Coconuts',pp.nuts,mat(0x6b5a2e),palms,palmM);
 const tp=treeParts();
 const treeM=(it)=>{q.setFromAxisAngle(up,it.turn);m.compose(p.set(it.u,it.y,it.v),q,s.setScalar(it.scale));};
 instanced('Jungle tree trunks',tp.trunk,mat(0x6d5843),trees,treeM);
 const greens=[0x2f7a3a,0x3f8d3c,0x4f9b42,0x2c6b45];
 instanced('Jungle canopy',tp.crown,mat(0xffffff),trees,(it,k,im)=>{treeM(it);im.setColorAt(k,col.set(greens[it.tone]));});
 instanced('Island shrubs',new THREE.IcosahedronGeometry(.9,0).scale(1,.75,1).translate(0,.45,0),mat(0xffffff),bushes,(it,k,im)=>{q.setFromAxisAngle(up,it.turn);m.compose(p.set(it.u,it.y,it.v),q,s.setScalar(it.scale));im.setColorAt(k,col.set(it.flower?(k%2?0xc8648e:0xd88270):(k%3?0x3e8a40:0x5a9e46)));});
 return {terrain,plantings:{palms,trees,bushes}};
}
