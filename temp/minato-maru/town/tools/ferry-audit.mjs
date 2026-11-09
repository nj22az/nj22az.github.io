/**
 * The Minato Maru's issues, found in her own data: what the Rev C working drawings (tools/ferry-cad.mjs) mark and list.
 *
 * The owner, 9 November 2026: "Start a revision C the ferry has lots of issues at the moment so if you can create working
 * cads this will be helpful build her in sections". Each check reads ferry-interior.js's boxes (every drawn piece of her
 * rooms, with the source line that made it under __KIT_TRACE__), her walking floors (ferry-walk.js) and her general
 * arrangement (ferry-ship.js FERRY_GA), and, given the built model, every face (tools/z-fighting.mjs):
 *
 *   clash        two different fittings occupy the same space (a bunk through a desk)
 *   into-structure  a fitting runs more than 3 cm into a wall, deck or casing
 *   part-clash   a trim piece of one assembly stands more than 5 cm inside another fitting
 *   floating     a fitting rests on nothing and hangs from nothing: no deck, no top, no wall face within 2 cm
 *   coplanar     two faces share a plane and overlap (they flash)
 *   no-floor     a manned space with doors has no floor anyone can walk on
 *
 * Severity: "clash" (wrong, to fix) or "check" (look at it: often wrong, sometimes meant, such as a fixing let into a wall).
 * Mirror findings (the same pair at the same frame, port and starboard) are given once, as both sides.
 */
import {FERRY_INTERIOR} from '../src/world/ferry-interior.js';
import {FERRY_SHIP,FERRY_GA,FERRY_HEIGHTS} from '../src/world/ferry-ship.js';
import {FERRY_FLOORS} from '../src/world/ferry-walk.js';
import {FERRY_H1_ENABLED} from '../src/world/ferry-engine-room-plan.js';

const HALF=FERRY_SHIP.length/2,DRAFT=FERRY_SHIP.draft;
/** Structure by name: what a fitting may stand on, hang from or meet. Unnamed solid boxes are walls (ferry-interior.js wall()). */
const STRUCTURE=/deck|deckhead|side|casing|floor plates|bulkhead|trunk|wall|top|platform|grating|pillar|frame|well rail|stair rail/i;
/** Pieces that join others by nature: pipework, cables and their fittings pass into what they serve and through walls. */
const CONNECTOR=/pipe|bend|branch|tap|cock|valve|flange|gland|cable|tray|penetration|hose|duct|conduit|spindle|shaft|coupling/i;
const DECKS=[['hold',FERRY_HEIGHTS.carDeck],['car',FERRY_HEIGHTS.passengerDeck],['passenger',FERRY_HEIGHTS.bridgeDeck],['bridge',FERRY_HEIGHTS.compassDeck],['compass',Infinity]];

/** Shipyard figures for a point in her frame: yard from the transom, height above the keel, x (+ port). */
export const yardOf=([x,y,z])=>({yard:+(z+HALF).toFixed(2),x:+x.toFixed(2),h:+(y+DRAFT).toFixed(2)});
/** The deck a height above the keel belongs to. */
export const deckOf=h=>DECKS.find(([,top])=>h<top-.05)[0];
/** The general-arrangement space a point lies in (the smallest that holds it), or null. */
export function spaceOf(p){
 const {yard,x,h}=yardOf(p);
 const hits=FERRY_GA.filter(s=>yard>=s.z[0]-.05&&yard<=s.z[1]+.05&&x>=s.x[0]-.05&&x<=s.x[1]+.05&&h>=s.y[0]-.15&&h<=s.y[1]+.15);
 hits.sort((a,b)=>(a.z[1]-a.z[0])*(a.x[1]-a.x[0])-(b.z[1]-b.z[0])*(b.x[1]-b.x[0]));
 if(hits[0])return hits[0].id;
 // Outside every space's box (a fitting on a rail, the edge of a wing): the nearest space on its deck.
 const d=s=>Math.hypot(Math.max(s.z[0]-yard,0,yard-s.z[1]),Math.max(s.x[0]-x,0,x-s.x[1]));
 const deck=FERRY_GA.filter(s=>h>=s.y[0]-.15&&h<=s.y[1]+.15).sort((a,b)=>d(a)-d(b))[0];
 return deck&&d(deck)<1.5?deck.id:null;
}

/** Every drawn box with its extent and its kind: a named fitting, structure, or an unnamed trim part. */
function pieces(){
 const out=FERRY_INTERIOR.boxes.filter(b=>b.draw).map(b=>{
  const lo=b.a.map((v,k)=>Math.min(v,b.b[k])),hi=b.a.map((v,k)=>Math.max(v,b.b[k]));
  const kind=b.name?(STRUCTURE.test(b.name)?'structure':'fitting'):(b.solid?'structure':'part');
  return {name:b.name,lo,hi,kind,where:b.where||null,file:(b.where||'').split(':')[0],line:+((b.where||'').split(':')[1]||0)};
 });
 // Named cylinders standing upright or lying along x or z are fittings too (tables, drums, tanks).
 for(const c of FERRY_INTERIOR.cyls){
  if(!c.name)continue;const [rx,ry,rz]=c.rot||[0,0,0],r=Math.max(c.rt,c.rb),q=v=>Math.abs(Math.abs(v)-Math.PI/2)<1e-3,z0=v=>Math.abs(v)<1e-3;
  let e;if(z0(rx)&&z0(ry)&&z0(rz))e=[r,c.h/2,r];else if(z0(rx)&&z0(ry)&&q(rz))e=[c.h/2,r,r];else if(q(rx)&&z0(ry)&&z0(rz))e=[r,r,c.h/2];else continue;
  out.push({name:c.name,lo:c.pos.map((v,k)=>v-e[k]),hi:c.pos.map((v,k)=>v+e[k]),kind:STRUCTURE.test(c.name)?'structure':'fitting',where:c.where||null,file:'',line:0,cyl:true});
 }
 return out;
}
const overlap=(p,q)=>[0,1,2].map(k=>Math.min(p.hi[k],q.hi[k])-Math.max(p.lo[k],q.lo[k]));
const middle=(p,q)=>[0,1,2].map(k=>(Math.max(p.lo[k],q.lo[k])+Math.min(p.hi[k],q.hi[k]))/2);
const contains=(a,b)=>[0,1,2].every(k=>a.lo[k]<=b.lo[k]+1e-6&&a.hi[k]>=b.hi[k]-1e-6);
/** One assembly: made by the same lines of ferry-interior.js (a bench and its legs, an engine and its covers). */
const sameAssembly=(p,q)=>p.file&&p.file===q.file&&Math.abs(p.line-q.line)<=2;
const label=p=>p.name||(p.kind==='part'?'trim piece':'wall or deck');

/**
 * In the engine room's code-built stand-in: the machinery spaces between yards 6.35 and 26.06 (ferry-model.js h1Point),
 * which the game shows until the engine room's Blender model loads and replaces (ferry-engine-room-asset.js).
 */
const inStandIn=({yard,h})=>FERRY_H1_ENABLED&&yard>=6.35&&yard<=26.06&&h>=.65&&h<=3.62;
function finding(kind,severity,what,at,extra={}){
 const y=yardOf(at),h=y.h,standIn=kind!=='coplanar'&&kind!=='no-floor'&&inStandIn(y);
 return {kind,severity,what:what+(standIn?' (in the code-built engine room, seen until the Blender model loads)':''),space:spaceOf(at),deck:deckOf(h),at:y,model:at.map(v=>+v.toFixed(3)),...(standIn?{standIn:true}:{}),...extra};
}

/** Fittings in each other, in structure, and trim inside other fittings. */
function clashes(P){
 const out=[];
 for(let a=0;a<P.length;a++)for(let b=a+1;b<P.length;b++){
  const p=P[a],q=P[b];
  if(p.kind!=='fitting'&&q.kind!=='fitting')continue;   // structure meets structure and trim meets trim by design
  const o=overlap(p,q);if(o.some(v=>v<=0))continue;
  if(sameAssembly(p,q)||(p.name&&p.name===q.name)||contains(p,q)||contains(q,p))continue;
  const depth=Math.min(...o),f=p.kind==='fitting'?p:q,g=f===p?q:p;
  // One fitting named in the other's name is one assembly (a pump and its motor); a connector joins what it serves.
  if(f.name&&g.name&&(f.name.includes(g.name)||g.name.includes(f.name)))continue;
  if((CONNECTOR.test(f.name||'')||CONNECTOR.test(g.name||''))&&depth<=.1)continue;
  const [kind,severity,limit]=g.kind==='fitting'?['clash','clash',.015]:g.kind==='structure'?['into-structure','check',.03]:['part-clash','check',.05];
  if(depth<=limit)continue;
  const what=kind==='clash'?`${f.name} and ${g.name} occupy the same space, ${(depth*100).toFixed(0)} cm deep`
   :kind==='into-structure'?`${f.name} runs ${(depth*100).toFixed(0)} cm into ${g.name||'a wall or deck'}`
   :`a trim piece stands ${(depth*100).toFixed(0)} cm inside ${f.name}`;
  out.push(finding(kind,severity,what,middle(p,q),{depth:+depth.toFixed(3),pieces:[label(f),label(g)],source:[f.where,g.where].filter(Boolean)}));
 }
 return out;
}

/** Fittings resting on nothing and hanging from nothing. */
function floating(P){
 const out=[],near=(a,b,e)=>Math.abs(a-b)<=e,footprint=(p,q)=>q.lo[0]<p.hi[0]&&q.hi[0]>p.lo[0]&&q.lo[2]<p.hi[2]&&q.hi[2]>p.lo[2];
 const floors=FERRY_FLOORS.filter(f=>f.part==='ship');
 for(const p of P){
  if(p.kind!=='fitting'||p.cyl)continue;const y=p.lo[1];
  const onTop=P.some(q=>q!==p&&near(q.hi[1],y,.02)&&footprint(p,q));
  const onFloor=floors.some(f=>[].concat(f.y).some(v=>near(v,y,.03))&&f.x[0]<=p.hi[0]&&f.x[1]>=p.lo[0]&&Math.min(...f.z)<=p.hi[2]&&Math.max(...f.z)>=p.lo[2]);
  const vspan=q=>q.lo[1]<p.hi[1]&&q.hi[1]>p.lo[1];
  const hung=P.some(q=>q!==p&&(
   (vspan(q)&&(near(q.hi[0],p.lo[0],.02)||near(q.lo[0],p.hi[0],.02))&&q.lo[2]<p.hi[2]&&q.hi[2]>p.lo[2])||
   (vspan(q)&&(near(q.hi[2],p.lo[2],.02)||near(q.lo[2],p.hi[2],.02))&&q.lo[0]<p.hi[0]&&q.hi[0]>p.lo[0])||
   (near(q.lo[1],p.hi[1],.02)&&footprint(p,q))));   // on a wall, a partition, a frame or a fitting's side, or under a deckhead
  const within=P.some(q=>q!==p&&q.lo[1]<y-.005&&q.hi[1]>y+.005&&footprint(p,q));
  if(onTop||onFloor||hung||within)continue;
  const c=p.lo.map((v,k)=>(v+p.hi[k])/2);c[1]=y;
  out.push(finding('floating','check',`${p.name} rests on nothing and hangs from nothing (its foot ${((y+DRAFT)).toFixed(2)} m above the keel)`,c,{pieces:[p.name],source:[p.where].filter(Boolean)}));
 }
 return out;
}

/** Manned spaces with doors but (almost) no floor anyone can stand on. */
function unwalkable(){
 const out=[];
 for(const s of FERRY_GA){
  if(!s.exits||s.unmanned)continue;
  const z0=s.z[0]-HALF,z1=s.z[1]-HALF,y0=s.y[0]-DRAFT;let n=0,ok=0;
  for(let z=z0+.2;z<z1-.1;z+=.25)for(let x=s.x[0]+.2;x<s.x[1]-.1;x+=.25){n++;
   if(FERRY_FLOORS.some(f=>{if(f.part!=='ship')return false;const fy=Math.min(...[].concat(f.y));return fy>=y0-.3&&fy<=y0+1.2&&x>=f.x[0]&&x<=f.x[1]&&z>=Math.min(...f.z)&&z<=Math.max(...f.z)&&(!f.inside||f.inside(x,z,.2));}))ok++;}
  const share=ok/Math.max(1,n);if(share>=.1)continue;
  const at=[(s.x[0]+s.x[1])/2,y0+.05,(z0+z1)/2];
  out.push({...finding('no-floor','check',`${s.id}: a manned space with ${s.exits.length} exit${s.exits.length>1?'s':''} (${s.exits.join(', ')}) but ${Math.round(share*100)}% of it can be walked on`,at),space:s.id,walkable:+share.toFixed(2)});
 }
 return out;
}

/** Faces sharing a plane, from the built model (tools/z-fighting.mjs). */
async function coplanar(root){
 if(!root)return [];
 const {coplanarOverlaps}=await import('./z-fighting.mjs');
 return coplanarOverlaps(root,{tolerance:.002,minArea:.0004,ground:-99}).map(f=>{
  const A=meshName(f.a),B=meshName(f.b),area=f.area>=1?`${f.area.toFixed(2)} m²`:`${Math.round(f.area*1e4)} cm²`;
  return finding('coplanar',f.area>=.01?'clash':'check',`${A.name===B.name?A.name+', two of its faces,':A.name+' and '+B.name} share a plane over ${area}: they flash`,f.centre,
   {area:+f.area.toFixed(4),pieces:[f.a,f.b],source:[A.where,B.where].filter(Boolean)});});
}
/** A mesh's path, said shortly: the engine room's Blender model (and its object), her kit with its source line, or the part. */
function meshName(path){
 const p=path.replace(/^Minato Maru › /,''),kit=p.match(/Minato Maru (\w+) ⟨(.+?)⟩/),parts=p.split(' › ');
 if(/Blender CAD/.test(p))return {name:`the engine room’s Blender model (${parts[parts.length-1]})`};
 if(kit)return {name:`her ${kit[1]} work`,where:kit[2]};
 return {name:parts.slice(-2).join(' › ')};
}

/** The same finding to port and to starboard at the same frame: given once, as both sides. */
function mirror(list){
 const out=[],used=new Set();
 for(let i=0;i<list.length;i++){if(used.has(i))continue;const f=list[i];
  const j=list.findIndex((g,k)=>k>i&&!used.has(k)&&g.kind===f.kind&&g.what===f.what&&Math.abs(g.at.yard-f.at.yard)<.05&&Math.abs(g.at.h-f.at.h)<.05&&Math.abs(g.at.x+f.at.x)<.05&&Math.abs(f.at.x)>.05);
  if(j>=0){used.add(j);out.push({...f,sides:'both',mirrorModel:list[j].model});}else out.push(f);}
 return out;
}

const ORDER=['hold','car','passenger','bridge','compass'];
/**
 * Every finding, numbered F1… from aft to forward deck by deck (the number is the finding's for this revision only).
 * Pass the built model as `root` (built with __KIT_TRACE__ set) to include faces sharing a plane.
 */
export async function auditFerry({root=null}={}){
 const P=pieces();
 const all=mirror([...clashes(P),...floating(P),...unwalkable(),...await coplanar(root)]);
 all.sort((a,b)=>ORDER.indexOf(a.deck)-ORDER.indexOf(b.deck)||(a.severity==='clash'?0:1)-(b.severity==='clash'?0:1)||a.at.yard-b.at.yard||b.at.x-a.at.x);
 all.forEach((f,i)=>f.n='F'+(i+1));
 const count=k=>all.filter(f=>f.kind===k).length;
 return {findings:all,summary:{total:all.length,clash:all.filter(f=>f.severity==='clash').length,check:all.filter(f=>f.severity==='check').length,
  byKind:Object.fromEntries(['clash','into-structure','part-clash','floating','coplanar','no-floor'].map(k=>[k,count(k)]))}};
}
