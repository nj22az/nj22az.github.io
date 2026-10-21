#!/usr/bin/env node
/**
 * The ground audit: Minato measured against its rulebook (src/world/ground-standard.js).
 *
 * The owner, 21 October 2026: "the roads seems to have reversed to chaos again… Can you make a plan to finally fix the
 * roads to a unified system? Pavement? Walk paths, grass and sandy beach?" The audit builds the town as the tests do,
 * lays a 25 cm lattice over it and takes, at every point, the open ground a person would stand on: the highest
 * upward-facing surface below 25 cm that writes depth (polygon-offset slabs included, road paint recorded as a marking
 * on top), outside any roof. Each point is classified by its colour and height against the rulebook, and four kinds of
 * * violation are reported, each under a stable key:
 *
 *  - colour: a surface whose colour is not its class's standard (`drawn` tones of today included, so steps 2 to 4
 *    can see what is left), or a picture the rulebook cannot read; in square metres.
 *  - height: a surface whose top is not its class's top over the district's datum; in square metres.
 *  - seam: two classes meeting without the edge the rulebook requires between them (a kerb, an edge line and
 *    gutter, a stone or coral edging, a graded join); in metres of seam.
 *  - dead-end: an authored route (layout.js ROUTES, the park's paths) that ends in grass, sand or nothing rather
 *    than another path, a door or the water; one per route end.
 *
 * tests/ground-standard.test.mjs compares the result with tests/fixtures/ground-baseline.json: a new key, or a key
 * that grew, fails; a key in the baseline that is no longer found fails too, until it is taken out, so the list only
 * shrinks.
 *
 *   node tools/ground-audit.mjs [--top=N]       the summary: counts by district and kind, the ten worst places, the
 *                                               N largest findings
 *   node tools/ground-audit.mjs --json          the full result
 *   node tools/ground-audit.mjs --diff          what differs from the baseline (what the test would say)
 *   node tools/ground-audit.mjs --write-baseline   rewrite the baseline from the town as it is (after a fix only:
 *                                               the test refuses new keys, so do not use this to hide one)
 */
import * as THREE from '../vendor/three.module.js';
import {GROUND_CLASSES,GROUND_EDGE,DISTRICTS,districtAt,edgeRule,expectedTop,allowedTops} from '../src/world/ground-standard.js';
import {planHeight} from '../src/world/layout.js';

/** Minato, from the breakwater to Kitahama's north shore. Kitano-jima keeps its own terrain and is not audited. */
export const AUDIT_BOUNDS=Object.freeze({minX:-45,maxX:55,minZ:-110,maxZ:100});
export const STEP=.25;
const MAX_Y=.2,MIN_Y=-1.6,ROOF_Y=2,MIN_MESH_AREA=1;
/** How close a colour must be to the standard (ΔE, CIE76) to be the standard. */
const COLOUR_MATCH=4;
/** Further than this (ΔE) from every colour of the rulebook, today's tones included, and a surface is of no class. */
const UNKNOWN=25;
/** The window across a seam searched for its edge, metres. */
const SEAM_WINDOW=.55;

/** What is not ground even when it is flat and low: water, boats, what moves. */
/** Water, and the rock armour at the land's edge: what the ground ends at. */
const WATER=/\bsea\b|basin|water|pond|wave|\bsurf\b|foam|tide|ripple|rocky|rock armour|armour stone/i;
/** Water, boats and loose things are not ground; nor is a building's own plinth, porch, step or shop front, which is
 * architecture standing on the ground. */
const NOT_GROUND=/hull|boat|sabani|丸|ferry|houseboat fittings|vehicle|car\b|truck|bicycle|crate|mat\b|doormat|futon|tarp|net\b|nets\b|rope|shadow|reflection|puddle|leaf|petal|blossom|plinth|footing|storefront|frontage|porch|threshold|stair|step\b|steps\b/i;
const NOT_ROOF=/tree|leaf|leaves|foliage|canopy of|fukugi|palm|banyan|hibiscus|bougainvillea|frond|crown|wire|cable|line\b|pole|lamp|sign|banner|flag|lantern|bird|gull|cloud|sky|ridge|mountain|wooded|distant|awning|parasol|umbrella|arcade|pergola|trellis|wisteria|vine|rain|smoke|steam/i;
const moving=o=>{for(let p=o;p;p=p.parent)if(p.userData?.dynamicProp||p.userData?.vehicle||/^(Scheduled island cargo ship|Road traffic|Harbour gulls and garden butterflies|Beach life)$/.test(p.name))return true;return false;};

/**
 * The fake canvases of the tests' DOM remember what was filled where, so a picture drawn as rectangles (the school
 * yard, the beach grit) can be read back: the base colour and the rectangles over it.
 */
export function recordCanvasFills(){
 const original=document.createElement;if(original.__recording)return;
 const make=(...args)=>{const e=original(...args),plain=e.getContext?.bind(e);if(!plain)return e;
  e.getContext=()=>{if(e.__context)return e.__context;const base=plain(),fills=e.__fills=[];let style=null;
   return e.__context=new Proxy(base,{get(o,k){if(k==='fillRect')return (x,y,w,h)=>{if(typeof style==='string')fills.push([x,y,w,h,style]);};if(k==='fillStyle')return style;return o[k];},
    set(o,k,v){if(k==='fillStyle')style=v;else o[k]=v;return true;}});};
  return e;};
 make.__recording=true;document.createElement=make;
}

/** Build the town the way the geometry tests do (tests/ground-clearance.test.mjs). */
export async function buildAuditTown(){
 const {installDOM}=await import('../tests/fixtures.mjs');
 installDOM();globalThis.self=globalThis;recordCanvasFills();
 const {createTown}=await import('../src/world/town.js?ground-audit');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const scene=new THREE.Scene();
 // The kit records which source file made each merged piece, so a finding names what drew it (tools/z-fighting.mjs).
 globalThis.__KIT_TRACE__=true;
 const world=createTown({scene,sites:createBusinesses(),townMode:'peninsula',mobile:false,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 delete globalThis.__KIT_TRACE__;
 scene.updateMatrixWorld(true);
 return {scene,world};
}

// ---- colour --------------------------------------------------------------------------------------------------
const lab=hex=>{const c=[(hex>>16)&255,(hex>>8)&255,hex&255].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
 const X=(c[0]*.4124+c[1]*.3576+c[2]*.1805)/.95047,Y=c[0]*.2126+c[1]*.7152+c[2]*.0722,Z=(c[0]*.0193+c[1]*.1192+c[2]*.9505)/1.08883;
 const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;return [116*f(Y)-16,500*(f(X)-f(Y)),200*(f(Y)-f(Z))];};
const labCache=new Map(),labOf=hex=>{let v=labCache.get(hex);if(!v)labCache.set(hex,v=lab(hex));return v;};
export const deltaE=(a,b)=>{const p=labOf(a),q=labOf(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);};
const hexOf=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
const styleColour=new Map();
function parseStyle(s){if(styleColour.has(s))return styleColour.get(s);let c=null;try{const col=new THREE.Color();col.setStyle(s);c=col;}catch{c=null;}styleColour.set(s,c);return c;}
const dataMean=new WeakMap();
function meanOfData(texture){
 if(dataMean.has(texture))return dataMean.get(texture);
 const d=texture.image?.data;let c=null;
 if(d&&d.length>=4){let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=16){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}c=new THREE.Color().setRGB(r/n/255,g/n/255,b/n/255,THREE.SRGBColorSpace);}
 dataMean.set(texture,c);return c;
}
function canvasAt(texture,u,v){
 const img=texture.image,fills=img?.__fills;if(!fills?.length)return null;
 texture.updateMatrix();const p=new THREE.Vector2(u,v).applyMatrix3(texture.matrix);
 let x=p.x,y=p.y;if(texture.wrapS!==THREE.ClampToEdgeWrapping)x-=Math.floor(x);if(texture.wrapT!==THREE.ClampToEdgeWrapping)y-=Math.floor(y);
 const px=x*(img.width||256),py=(texture.flipY?1-y:y)*(img.height||256);
 for(let i=fills.length-1;i>=0;i--){const [fx,fy,fw,fh,s]=fills[i];if(px>=Math.min(fx,fx+fw)&&px<=Math.max(fx,fx+fw)&&py>=Math.min(fy,fy+fh)&&py<=Math.max(fy,fy+fh))return parseStyle(s);}
 return null;
}

// ---- collection ----------------------------------------------------------------------------------------------
function labelOf(o,root){
 const names=[];for(let p=o;p&&p!==root;p=p.parent)if(p.name)names.unshift(p.name.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,'#'));
 return names.slice(-2).join(' › ')||o.geometry?.type||o.type;
}
const hidden=o=>{if(!(o.layers.mask&1)&&!o.userData.renderBatch)return true;for(let p=o;p;p=p.parent)if(!p.visible)return true;return false;};

/**
 * Every upward-facing low surface (and every roof over the lattice) in bounds, binned for lookup. A mesh whose
 * upward low faces add up to less than a square metre is furniture, not ground.
 */
export function collectGround(root,{bounds=AUDIT_BOUNDS,step=STEP}={}){
 root.updateMatrixWorld(true);
 const tris=[],roofs=new Set(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),e=new THREE.Vector3(),m=new THREE.Matrix4(),im=new THREE.Matrix4(),box=new THREE.Box3();
 const region=new THREE.Box3(new THREE.Vector3(bounds.minX,-50,bounds.minZ),new THREE.Vector3(bounds.maxX,80,bounds.maxZ));
 root.traverse(o=>{
  if(!o.isMesh||o.isSkinnedMesh||!o.geometry?.attributes?.position||o.name.startsWith('static-props:')||hidden(o)||moving(o))return;
  const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
  const label=labelOf(o,root),water=WATER.test(label),skip=NOT_GROUND.test(label),roofable=!NOT_ROOF.test(label);
  const pos=g.attributes.position,idx=g.index,total=idx?idx.count:pos.count,uv=g.attributes.uv,vc=g.attributes.color;
  const groups=g.groups.length?g.groups:[{start:0,count:total,materialIndex:0}];
  const count=o.isInstancedMesh?o.count:1,mine=[];let area=0;
  for(let k=0;k<count;k++){
   if(o.isInstancedMesh){o.getMatrixAt(k,im);if(Math.abs(im.determinant())<1e-12)continue;m.multiplyMatrices(o.matrixWorld,im);}else m.copy(o.matrixWorld);
   box.copy(g.boundingBox).applyMatrix4(m);if(!box.intersectsBox(region))continue;
   const low=box.min.y<=MAX_Y+.02,high=box.max.y>=ROOF_Y;if(!low&&!(high&&roofable))continue;
   const tint=o.instanceColor?new THREE.Color().fromBufferAttribute(o.instanceColor,k):null;
   for(const grp of groups){
    const mat=Array.isArray(o.material)?o.material[grp.materialIndex]:o.material;
    if(!mat||mat.visible===false||mat.colorWrite===false||(mat.transparent&&mat.opacity<.3))continue;
    const two=mat.side===THREE.DoubleSide,end=Math.min(total,grp.start+grp.count);
    for(let i=grp.start;i+2<end;i+=3){
     const ia=idx?idx.getX(i):i,ib=idx?idx.getX(i+1):i+1,ic=idx?idx.getX(i+2):i+2;
     a.fromBufferAttribute(pos,ia).applyMatrix4(m);b.fromBufferAttribute(pos,ib).applyMatrix4(m);c.fromBufferAttribute(pos,ic).applyMatrix4(m);
     n.subVectors(b,a).cross(e.subVectors(c,a));const len=n.length();if(len<1e-7)continue;n.divideScalar(len);
     if(mat.side===THREE.BackSide)n.negate();
     const minY=Math.min(a.y,b.y,c.y),maxY=Math.max(a.y,b.y,c.y);
     if(roofable&&minY>=ROOF_Y&&minY<40&&Math.abs(n.y)>.3){
      for(let ix=Math.ceil(Math.min(a.x,b.x,c.x)/step);ix<=Math.floor(Math.max(a.x,b.x,c.x)/step);ix++)for(let iz=Math.ceil(Math.min(a.z,b.z,c.z)/step);iz<=Math.floor(Math.max(a.z,b.z,c.z)/step);iz++)
       if(inTri(ix*step,iz*step,a,b,c))roofs.add(ix+','+iz);
      continue;
     }
     if(skip||maxY>MAX_Y+.02||minY<MIN_Y)continue;
     const up=n.y>.85?1:two&&n.y<-.85?-1:0;if(!up)continue;
     area+=len/2;
     const where=pieceWhere(o,ia);
     mine.push({p:[a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z],ny:Math.abs(n.y),mesh:o,mat,k,tint,v:[ia,ib,ic],uv,vc,label:where?label+' ⟨'+where.replace(/:\d+:\d+.*$/,'')+'⟩':label,where,water,
      decal:mat.depthWrite===false,offset:!!(mat.polygonOffset&&(mat.polygonOffsetFactor||mat.polygonOffsetUnits))});
    }
   }
  }
  if(area>=MIN_MESH_AREA||mine.some(t=>t.decal))for(const t of mine)tris.push(t);
 });
 const bins=new Map(),bin=2;
 tris.forEach((t,i)=>{const p=t.p;for(let gx=Math.floor(Math.min(p[0],p[3],p[6])/bin);gx<=Math.floor(Math.max(p[0],p[3],p[6])/bin);gx++)for(let gz=Math.floor(Math.min(p[2],p[5],p[8])/bin);gz<=Math.floor(Math.max(p[2],p[5],p[8])/bin);gz++){const key=gx+','+gz;(bins.get(key)??bins.set(key,[]).get(key)).push(i);}});
 return {tris,bins,bin,roofs,step};
}
/** The source a merged piece came from (the kit's trace): 'okinawa/quarters.js:117:3 < …'. */
function pieceWhere(o,vi){
 const sources=o.userData.kitSources;if(!sources)return null;
 let lo=0,hi=sources.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(sources[mid].start<=vi)lo=mid;else hi=mid-1;}
 const w=sources[lo]?.where;return w?w.replace(/^src\/world\//,''):null;
}
function inTri(x,z,a,b,c){
 const d=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(!d)return false;
 const l1=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/d,l2=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/d;return l1>=-1e-9&&l2>=-1e-9&&l1+l2<=1+1e-9;
}
function bary(t,x,z){
 const p=t.p,d=(p[5]-p[8])*(p[0]-p[6])+(p[6]-p[3])*(p[2]-p[8]);if(!d)return null;
 const l1=((p[5]-p[8])*(x-p[6])+(p[6]-p[3])*(z-p[8]))/d,l2=((p[8]-p[2])*(x-p[6])+(p[0]-p[6])*(z-p[8]))/d,l3=1-l1-l2;
 return l1>=-1e-9&&l2>=-1e-9&&l3>=-1e-9?[l1,l2,l3]:null;
}
/** The colour a triangle shows at a barycentric point: material × vertex colour × instance colour × its picture. */
function colourAt(t,w){
 const col=t.mat.color?t.mat.color.clone():new THREE.Color(1,1,1);
 if(t.mat.vertexColors&&t.vc){const v=new THREE.Color(0,0,0),q=new THREE.Color();t.v.forEach((vi,i)=>{q.fromBufferAttribute(t.vc,vi);v.r+=q.r*w[i];v.g+=q.g*w[i];v.b+=q.b*w[i];});col.multiply(v);}
 if(t.tint)col.multiply(t.tint);
 const map=t.mat.map;let pictured=false;
 if(map&&!map.userData?.sharedAsset){
  let c=null;
  if(map.image?.__fills&&t.uv){let u=0,v=0;t.v.forEach((vi,i)=>{u+=t.uv.getX(vi)*w[i];v+=t.uv.getY(vi)*w[i];});c=canvasAt(map,u,v);}
  else if(map.image?.data)c=meanOfData(map);
  if(c)col.multiply(c);else pictured=true;
 }
 return {hex:col.getHex(),pictured};
}
/** Everything drawn at a point, highest first: {y, t, w}. */
function hitsAt(G,x,z){
 const list=G.bins.get(Math.floor(x/G.bin)+','+Math.floor(z/G.bin));if(!list)return [];
 const out=[];for(const i of list){const t=G.tris[i],w=bary(t,x,z);if(!w)continue;out.push({y:t.p[1]*w[0]+t.p[4]*w[1]+t.p[7]*w[2],t,w});}
 return out.sort((p,q)=>(q.y+(q.t.offset?.001:0))-(p.y+(p.t.offset?.001:0)));
}

// ---- classification ------------------------------------------------------------------------------------------
const CLASS_LIST=Object.values(GROUND_CLASSES);
const EDGE_COLOURS=[GROUND_EDGE.kerb,GROUND_EDGE.edging,GROUND_EDGE.coralEdging,GROUND_EDGE.gutter,GROUND_EDGE.coping].flatMap(e=>[e.colour,...(e.legacy||[])].map(c=>[e.id,c]));
const MARK_COLOURS=[...GROUND_EDGE.paint.colours,GROUND_EDGE.tactile.colour];
/**
 * The class a surface is by its colour: the nearest of the rulebook's colours (standard, drawn and legacy tones), its
 * height and whether the class belongs in the district breaking ties between near greys. A narrow strip may also be
 * an edge (a kerb, an edging, a gutter, a coping).
 */
export function classify(hex,y,districtId,{narrow=false,x=0,z=0}={}){
 let best=null;
 const consider=(id,colour,kind,penalty)=>{const dE=deltaE(hex,colour),score=dE+penalty;if(!best||score<best.score)best={id,kind,colour,score,dE};};
 for(const c of CLASS_LIST){
  const off=c.graded?(y<c.range[0]?c.range[0]-y:y>c.range[1]?y-c.range[1]:0):Math.max(0,Math.min(...topsAt(c.id,districtId,x,z).map(t=>Math.abs(y-t)))-c.tolerance);
  const penalty=off*60+(c.where.includes(districtId)?0:5);
  for(const colour of [c.colour,c.drawn,...c.legacy].filter(v=>v!==undefined))consider(c.id,colour,'class',penalty);
 }
 // An edge is told by its colour and by being narrow; a broad patch of an edge's colour (a coping, a gutter run seen
 // end-on) is still an edge if nothing else is near.
 for(const [id,colour] of EDGE_COLOURS)consider(id,colour,'edge',narrow?-1:6);
 return best;
}
/**
 * Where the drawing says what it is, the audit takes its word for the class and checks its colour and height against
 * it: a coordinated street patch knows its street class (street-plan.js), and some meshes are named for what they are.
 * Everything else is classified by colour.
 */
const NAMED=[
 [/kerb/i,'kerb','edge'],[/gutter|lane-edges\.js/i,'gutter','edge'],[/edging/i,'edging','edge'],[/coping/i,'coping','edge'],
 [/Main Street footway/,'pavers'],[/Kitano Road footway/,'concrete'],
 [/carriageway|harbour-boardwalk-deck|cargo driveway|service turnout|freight pullout|parking lay-by/i,'road'],
 [/stone walks|gravel walks/i,'park-path'],
 [/beach-sand|wet-sand/i,'beach-sand'],
 [/lawn|grass|neighbourhood ground|Island land|Park ground/i,'grass'],
 [/quay paving|pier-concrete|cargo quay/i,'quay'],
 [/timber|pier.*deck|grid-lanes:wood/i,'deck'],
];
const STREET_CLASS={main:'road',commercial:'road',residential:'lane',harbour:'quay',circuit:'concrete',coast:'concrete',boardwalk:'deck'};
export function streetPatchIndex(patches){
 const bins=new Map(),size=4;
 for(const p of patches){const xs=p.polygon.map(v=>v[0]),zs=p.polygon.map(v=>v[1]);p.box=[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];
  for(let gx=Math.floor(p.box[0]/size);gx<=Math.floor(p.box[1]/size);gx++)for(let gz=Math.floor(p.box[2]/size);gz<=Math.floor(p.box[3]/size);gz++){const k=gx+','+gz;(bins.get(k)??bins.set(k,[]).get(k)).push(p);}}
 const inside=(poly,x,z)=>{let s=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0]);if(Math.abs(c)<1e-9)continue;if(!s)s=Math.sign(c);else if(Math.sign(c)!==s)return false;}return true;};
 return (x,z)=>(bins.get(Math.floor(x/size)+','+Math.floor(z/size))||[]).find(p=>x>=p.box[0]-1e-6&&x<=p.box[1]+1e-6&&z>=p.box[2]-1e-6&&z<=p.box[3]+1e-6&&inside(p.polygon,x,z))||null;
}
function namedClass(t,x,z,d,patchAt){
 if(t.label.startsWith('grid-lanes:')){
  const surface=t.label.slice(11);if(surface==='wet-sand')return {id:'beach-sand',kind:'class',route:'island-coast-walk'};if(surface==='wood')return {id:'deck',kind:'class'};
  const p=patchAt?.(x,z);if(p){const id=p.kind==='footway'?(d==='main-street'?'pavers':'concrete'):STREET_CLASS[p.kind];if(id)return {id,kind:'class',street:p.kind,route:p.route};}
  return null;
 }
 const leaf=t.label.split(' › ').at(-1);
 for(const [re,id,kind='class'] of NAMED)if(re.test(leaf))return {id,kind};
 return null;
}
/**
 * The tops a class may have at a point: the rulebook's (allowedTops), but the open island's datum only where the plan
 * itself is open island ground (layout.js planHeight), never inside the town where the plan is the datum.
 */
function topsAt(cls,districtId,x,z){
 const c=GROUND_CLASSES[cls],tops=allowedTops(cls,districtId);
 if(!c.alsoAt?.length||planHeight(x,z)<-.2)return tops;
 return tops.slice(0,tops.length-c.alsoAt.length);
}
const heightOk=(cls,y,districtId,flat,x,z)=>{
 const c=GROUND_CLASSES[cls];if(!c)return true;
 if(c.graded&&!flat)return y>=c.range[0]&&y<=c.range[1];
 if(c.graded&&c.id==='beach-sand')return y>=c.range[0]&&y<=c.range[1];
 const tops=topsAt(cls,districtId,x,z);
 return tops.some(t=>Math.abs(y-t)<=c.tolerance+1e-6);
};

/** The lattice: at each open point, the ground a person stands on and what is painted on it. */
export function rasterGround(G,{bounds=AUDIT_BOUNDS}={}){
 const step=G.step,nx=Math.floor((bounds.maxX-bounds.minX)/step)+1,nz=Math.floor((bounds.maxZ-bounds.minZ)/step)+1;
 const cells=new Array(nx*nz).fill(null);
 const ix0=Math.ceil(bounds.minX/step),iz0=Math.ceil(bounds.minZ/step);
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
  const ix=ix0+i,iz=iz0+j;if(G.roofs.has(ix+','+iz))continue;
  const x=ix*step,z=iz*step,hits=hitsAt(G,x,z);if(!hits.length)continue;
  const base=hits.find(h=>!h.t.decal);if(!base)continue;
  const marks=hits.filter(h=>h.t.decal&&h.y>=base.y-.005&&h.y<=base.y+.06);
  cells[i*nz+j]={x,z,base,marks};
 }
 return {cells,nx,nz,ix0,iz0,step};
}

/** The audit itself. Returns {violations, summary, cells}. */
export function auditGround(root,{bounds=AUDIT_BOUNDS,step=STEP,routes=null,patches=null}={}){
 const G=collectGround(root,{bounds,step}),R=rasterGround(G,{bounds}),patchAt=patches?streetPatchIndex(patches):null;
 // Each finding keeps its points, so it can be reported where it is: the point nearest its middle, and its extent.
 const found=new Map(),add=(kind,key,amount,at,detail)=>{const k=kind+'|'+key;let v=found.get(k);
  const {tone,...rest}=detail;
  if(!v)found.set(k,v={kind,key:k,amount:0,points:[],tones:new Map(),district:key.split('|')[0],...rest});
  v.amount+=amount;v.points.push(at);if(detail.worst>v.worst)v.worst=detail.worst;if(tone)v.tones.set(tone,(v.tones.get(tone)||0)+amount);};
 // Classify every cell.
 const info=new Array(R.cells.length).fill(null);
 R.cells.forEach((cell,i)=>{
  if(!cell)return;const {base,marks}=cell,t=base.t,d=districtAt(cell.x,cell.z);
  if(t.water){info[i]={cls:'water',y:base.y,d};return;}
  const {hex,pictured}=colourAt(t,base.w),flat=t.ny>.9995;
  // A narrow strip (a kerb, an edging, a gutter lid) has another surface on both sides of it, 20 cm away, along one axis.
  const piece=h=>h?h.t.mesh.uuid+'/'+(h.t.where||'')+'/'+h.t.mat.uuid:'';
  const other=(dx,dz)=>{const h=hitsAt(G,cell.x+dx,cell.z+dz).find(h=>!h.t.decal);return !h||piece(h)!==piece(base);};
  const narrow=(other(.2,0)&&other(-.2,0))||(other(0,.2)&&other(0,-.2));
  const named=namedClass(t,cell.x,cell.z,d,patchAt);
  let k=named?{...named,dE:deltaE(hex,named.kind==='class'?GROUND_CLASSES[named.id].colour:hex)}:pictured?{id:classify(t.mat.color.getHex(),base.y,d).id,kind:'class',dE:Infinity}:classify(hex,base.y,d,{narrow,x:cell.x,z:cell.z});
  // A colour nowhere near the rulebook is no class at all: it meets nothing correctly.
  if(!named&&!pictured&&k.dE>UNKNOWN)k={id:'unknown',kind:'class',dE:k.dE,nearest:k.id};
  const mark=marks.map(h=>colourAt(h.t,h.w).hex).find(c=>MARK_COLOURS.some(m=>deltaE(c,m)<12));
  const label=k.street?t.label+' › '+k.street:t.label;
  info[i]={cls:k.id,kind:k.kind,y:base.y,d,hex,pictured,label,where:t.where,flat,mark:mark!==undefined,dE:k.dE};
  if(k.kind!=='class')return;
  const c=GROUND_CLASSES[k.id],area=step*step,at=[+cell.x.toFixed(2),+base.y.toFixed(3),+cell.z.toFixed(2)];
  if(!c){add('colour',[d,'unknown',label].join('|'),area,at,{worst:k.dE,tone:hexOf(hex),detail:`${hexOf(hex)} is no colour of the rulebook (nearest ${k.nearest}, ΔE ${k.dE.toFixed(0)})`});return;}
  if(!c.where.includes(d)&&d!=='outside')add('place',[d,k.id,label].join('|'),area,at,{worst:0,detail:`${c.name} does not belong in ${d} (it belongs in ${c.where.join(', ')})`});
  if(pictured)add('colour',[d,k.id,label].join('|'),area,at,{worst:0,tone:'pictured',detail:'a picture the rulebook cannot read'});
  else if(deltaE(hex,c.colour)>COLOUR_MATCH)add('colour',[d,k.id,label].join('|'),area,at,{worst:deltaE(hex,c.colour),tone:hexOf(hex),detail:`${hexOf(hex)} drawn, ${hexOf(c.colour)} standard (ΔE ${deltaE(hex,c.colour).toFixed(0)})`});
  if(!heightOk(k.id,base.y,d,flat,cell.x,cell.z)){const off=c.graded?0:Math.abs(base.y-expectedTop(k.id,d));add('height',[d,k.id,label].join('|'),area,at,{worst:off,detail:`top ${base.y.toFixed(3)} m, ${c.graded?'range '+c.range.join('..'):'standard '+expectedTop(k.id,d).toFixed(3)} m`});}
 });
 // Seams: neighbours of different class, without the edge their rule needs.
 const W=Math.round(SEAM_WINDOW/step);
 const at=(i,j)=>i>=0&&j>=0&&i<R.nx&&j<R.nz?info[i*R.nz+j]:null;
 for(let i=0;i<R.nx;i++)for(let j=0;j<R.nz;j++){
  const A=at(i,j);if(!A||A.kind!=='class')continue;
  for(const [di,dj] of [[1,0],[0,1]]){
   const B=at(i+di,j+dj);if(!B||B.kind!=='class'||B.cls===A.cls||A.cls==='water'||B.cls==='water')continue;
   const rule=edgeRule(A.cls,B.cls);if(rule.edge==='flush')continue;
   // Look along the line across the seam for the edge.
   const line=[];for(let s=-W;s<=W+1;s++){const C=at(i+di*s,j+dj*s);if(C)line.push(C);}
   const step_=Math.abs(A.y-B.y),edges=new Set(line.filter(C=>C.kind==='edge').map(C=>C.cls)),painted=line.some(C=>C.mark);
   let ok;
   if(rule.edge==='kerb')ok=edges.has('kerb')||(step_>=.1&&step_<=.2);
   else if(rule.edge==='line-gutter')ok=painted||edges.has('gutter');
   else if(rule.edge==='edging')ok=edges.has('edging')||edges.has('coral-edging');
   else if(rule.edge==='coral-edging')ok=edges.has('coral-edging');
   else if(rule.edge==='graded')ok=step_<.05;
   else ok=true;
   if(ok)continue;
   const cell=R.cells[i*R.nz+j],pair=[A.cls,B.cls].sort(),labels=(A.cls===pair[0]?[A.label,B.label]:[B.label,A.label]);
   add('seam',[A.d,pair.join('/'),labels.join(' / ')].join('|'),step,[+cell.x.toFixed(2),+A.y.toFixed(3),+cell.z.toFixed(2)],{worst:step_,detail:`${pair.join(' meets ')} with no ${rule.edge}${rule.edge==='kerb'?' (step '+(step_*100).toFixed(0)+' cm)':''}`});
  }
 }
 // Dead ends: an authored route's end that runs out into soft ground.
 const FIRM=new Set(['road','lane','pavers','concrete','quay','park-path','deck']);
 const roofNear=(x,z,r)=>{for(let dx=-r;dx<=r;dx+=step)for(let dz=-r;dz<=r;dz+=step)if(G.roofs.has(Math.round((x+dx)/step)+','+Math.round((z+dz)/step)))return true;return false;};
 const cellInfo=(x,z)=>{const i=Math.round(x/step)-R.ix0,j=Math.round(z/step)-R.iz0;return at(i,j);};
 for(const route of routes||[]){
  const pts=route.points;if(!pts||pts.length<2)continue;
  // A loop (a building's circuit) has no ends.
  if(Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][1]-pts.at(-1)[1])<.1)continue;
  const polys=(routes||[]).filter(r=>r!==route&&r.points?.length>=2);
  for(const [end,prev,which] of [[pts.at(-1),pts.at(-2),'end'],[pts[0],pts[1],'start']]){
   const [x,z]=end;if(x<bounds.minX||x>bounds.maxX||z<bounds.minZ||z>bounds.maxZ)continue;
   // A door is within two metres of the end, under its building's roof; a junction is an end on another route.
   if(roofNear(x,z,2)||polys.some(r=>nearRoute(r,x,z,0)))continue;
   const len=Math.hypot(x-prev[0],z-prev[1])||1,ux=(x-prev[0])/len,uz=(z-prev[1])/len;
   // Just past the square end a grid street is drawn with (half its width): another route, firm paving or the water
   // there, a little to either side included, and the way goes on.
   const r=(route.width||2)/2+.5,probes=[0,-.6,.6].map(o=>[x+ux*r-uz*o,z+uz*r+ux*o]);
   const goesOn=([px,pz])=>{if(polys.some(r=>nearRoute(r,px,pz,.3)))return true;const c=cellInfo(px,pz);return !!c&&(c.cls==='water'||FIRM.has(c.cls));};
   if(probes.some(goesOn))continue;
   const [px,pz]=probes[0],here=cellInfo(px,pz);
   const d=districtAt(x,z);
   add('dead-end',[d,route.id,which].join('|'),1,[+x.toFixed(2),+(here?.y??0).toFixed(3),+z.toFixed(2)],{worst:1,detail:`${route.id} ${which}s in ${here?here.cls:'nothing'} at ${px.toFixed(1)}, ${pz.toFixed(1)}`});
  }
 }
 const violations=[...found.values()].map(({points,tones,...v})=>{
  const n=points.length,cx=points.reduce((s,p)=>s+p[0],0)/n,cz=points.reduce((s,p)=>s+p[2],0)/n;
  const at=points.reduce((b,p)=>Math.hypot(p[0]-cx,p[2]-cz)<Math.hypot(b[0]-cx,b[2]-cz)?p:b);
  const box=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[2])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[2]))];
  const drawn=[...tones].sort((p,q)=>q[1]-p[1]).map(([t])=>t);
  if(drawn.length>1)v.detail+=` (${drawn.length} tones, mostly ${drawn.slice(0,3).join(', ')})`;
  return {...v,amount:+v.amount.toFixed(2),at,box,...(drawn.length?{tones:drawn.slice(0,6)}:{})};
 }).sort((p,q)=>p.key<q.key?-1:1);
 return {violations,summary:summarise(violations),spots:hotspots(found,step),info,raster:R};
}
/**
 * The worst places, where step 2 starts: 6 m squares scored by what is wrong in them on the ground, not by a tone
 * that is wrong everywhere a family is drawn (that is one palette change). A metre of seam with no edge counts four,
 * a square metre at the wrong height or out of place one, a surface of no class two, a dead end twenty.
 */
const SPOT=6,WEIGHT={height:1,place:1,seam:4,'dead-end':20};
function hotspots(found,step){
 const tiles=new Map();
 for(const v of found.values()){
  const unknown=v.kind==='colour'&&v.key.split('|')[2]==='unknown',w=unknown?2:WEIGHT[v.kind];if(!w)continue;
  const each=v.kind==='seam'?step:v.kind==='dead-end'?1:step*step;
  for(const p of v.points){const k=Math.floor(p[0]/SPOT)+','+Math.floor(p[2]/SPOT);let t=tiles.get(k);
   if(!t)tiles.set(k,t={x:(Math.floor(p[0]/SPOT)+.5)*SPOT,z:(Math.floor(p[2]/SPOT)+.5)*SPOT,score:0,keys:new Map()});
   t.score+=w*each;t.keys.set(v.key,(t.keys.get(v.key)||0)+w*each);}
 }
 return [...tiles.values()].sort((a,b)=>b.score-a.score).map(t=>({x:t.x,z:t.z,district:districtAt(t.x,t.z),score:+t.score.toFixed(1),
  what:[...t.keys].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k])=>k)}));
}
function nearRoute(r,x,z,margin){
 const w=(r.width||2)/2+margin;
 for(let i=1;i<r.points.length;i++){const [ax,az]=r.points[i-1],[bx,bz]=r.points[i],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1,s=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2));
  if(Math.hypot(x-ax-dx*s,z-az-dz*s)<=w)return true;}
 return false;
}
export function summarise(violations){
 const byDistrict={},byKind={};
 for(const v of violations){const d=(byDistrict[v.district]??={colour:0,height:0,place:0,seam:0,'dead-end':0,keys:0});d[v.kind]+=v.amount;d.keys++;
  const k=(byKind[v.kind]??={keys:0,amount:0});k.keys++;k.amount+=v.amount;}
 for(const d of Object.values(byDistrict))for(const k of ['colour','height','place','seam'])d[k]=+d[k].toFixed(1);
 for(const k of Object.values(byKind))k.amount=+k.amount.toFixed(1);
 return {byDistrict,byKind};
}

// ---- the ratchet ---------------------------------------------------------------------------------------------
/** Quantities may wobble by a few lattice points as geometry is rebuilt; more than this is growth. */
export const GROWTH=(was)=>Math.max(was*.05,1);
export function toBaseline(violations){
 return Object.fromEntries(violations.map(v=>[v.key,v.amount]));
}
/** What the test checks: new keys, keys that grew, and baseline keys that are fixed but still listed. */
export function compareToBaseline(violations,baseline){
 const now=toBaseline(violations),added=[],grown=[],fixed=[];
 for(const v of violations){const was=baseline[v.key];if(was===undefined)added.push(v);else if(v.amount>was+GROWTH(was))grown.push({...v,was});}
 for(const key of Object.keys(baseline))if(!(key in now))fixed.push(key);
 return {added,grown,fixed};
}
/** The coordinated street patches as drawn (lane-surfaces.js), so a grid-lanes slab is classed by its street. */
export async function auditPatches(){const {lanePatches}=await import('../src/world/lane-surfaces.js');return lanePatches();}
export const BASELINE_PATH=new URL('../tests/fixtures/ground-baseline.json',import.meta.url);
export async function auditRoutes(){
 const {ROUTES}=await import('../src/world/layout.js');
 const {HARBOUR_PARK_PATHS}=await import('../src/world/harbour-park-plan.js');
 const {retiredStreetOverlay}=await import('../src/world/street-plan.js');
 return [...ROUTES.filter(r=>!retiredStreetOverlay(r)),...HARBOUR_PARK_PATHS];
}

// ---- command line --------------------------------------------------------------------------------------------
const fmt=v=>`${v.kind.padEnd(8)} ${String(v.amount).padStart(8)} ${v.kind==='seam'?'m ':v.kind==='dead-end'?'  ':'m²'}  ${v.key.slice(v.kind.length+1)}  @ ${v.at[0]}, ${v.at[2]} (x ${v.box[0]}..${v.box[2]}, z ${v.box[1]}..${v.box[3]})  (${v.detail})`;
if(import.meta.url===`file://${process.argv[1]}`){
 const args=new Set(process.argv.slice(2));
 const fs=await import('node:fs');
 const {scene}=await buildAuditTown();
 const result=auditGround(scene,{routes:await auditRoutes(),patches:await auditPatches()});
 if(args.has('--json')){console.log(JSON.stringify({summary:result.summary,spots:result.spots.slice(0,20),violations:result.violations},null,1));process.exit(0);}
 if(args.has('--write-baseline')){
  fs.writeFileSync(BASELINE_PATH,JSON.stringify({
   about:'Minato\'s ground violations against src/world/ground-standard.js, by stable key (kind|district|class|surface, or kind|district|route|end): square metres for colour and height, metres of seam, one per dead end. tests/ground-standard.test.mjs fails on a new key, a key that grew, and a key fixed but still listed. Regenerate with node tools/ground-audit.mjs --write-baseline only after a fix.',
   violations:toBaseline(result.violations)},null,1)+'\n');
  console.log('wrote',result.violations.length,'keys');process.exit(0);
 }
 if(args.has('--diff')){
  const base=JSON.parse(fs.readFileSync(BASELINE_PATH,'utf8')).violations,{added,grown,fixed}=compareToBaseline(result.violations,base);
  for(const v of added)console.log('NEW   ',fmt(v));for(const v of grown)console.log('GREW  ',fmt(v),'was',v.was);for(const k of fixed)console.log('FIXED ',k);
  process.exit(added.length||grown.length||fixed.length?1:0);
 }
 console.log('By district:');console.table(result.summary.byDistrict);
 console.log('By kind:');console.table(result.summary.byKind);
 console.log('Worst places (6 m squares; heights, seams, misplaced and unknown surfaces, dead ends):');
 for(const t of result.spots.slice(0,10))console.log(`  ${String(t.score).padStart(6)}  x ${t.x}, z ${t.z} (${t.district})\n          ${t.what.join('\n          ')}`);
 const top=+(process.argv.find(a=>a.startsWith('--top='))?.slice(6)??25);
 console.log(`Worst ${top}:`);
 const weight=v=>v.kind==='dead-end'?20:v.kind==='seam'?v.amount*2:v.amount;
 for(const v of [...result.violations].sort((p,q)=>weight(q)-weight(p)).slice(0,top))console.log(' ',fmt(v));
}
