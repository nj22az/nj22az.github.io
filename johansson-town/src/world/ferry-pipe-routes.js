/**
 * The pipes of the machinery spaces, routed from the piping diagrams (6r-1; the creator, 2026-10-13, asked whether the
 * engine room's pipes "are connected" and "lead to systems": they were painted by hand; now every line of
 * FERRY_PIPING whose two ends stand in the machinery spaces is routed here, from the one machine's anchor to the
 * other's, in the system's colour and bore, so the room and sheets 8.1–8.11 are one drawing).
 *
 * An anchor is where a pipe meets a thing: {pos:[x,y,z] in the ship's model frame, dir, off?, local?}. `dir` is the
 * way the pipe leaves ('up', 'down', 'port', 'stbd', 'fwd', 'aft'), `off` how far before it turns (0.25 m); `local` marks a connection inside one machine (the
 * jacket-water circuit on an engine) that is routed straight rather than by the lanes.
 *
 * Lanes: each system owns a run along both sides under the deckhead (fuel, sea water, fresh water, the fire main, air,
 * sewage, k = 0…5 inboard from the lining) or low along the sides over the plates (bilge and ballast, lubricating oil),
 * as the painted runs had them; a line goes up (or down) from its anchor to its lane, along the lane to the other
 * end's frame, and across the ship, when it must, along the nearer bulkhead. Every segment is axis-aligned, as pipes
 * are fitted; bends are the corners. Segments two lines share (a main that several branches join) are drawn once.
 */
export const PIPE_LANES=Object.freeze({
 fuel:Object.freeze({k:0,dy:-.1}),seawater:Object.freeze({k:1,dy:-.1}),freshwater:Object.freeze({k:2,dy:-.1}),fire:Object.freeze({k:3,dy:-.1}),
 air:Object.freeze({k:4,dy:-.14}),sewage:Object.freeze({k:5,dy:-.14}),
 bilge:Object.freeze({low:true,k:0}),lube:Object.freeze({low:true,k:1}),
 jacket:Object.freeze({local:true}),exhaust:Object.freeze({skip:true}),hydraulics:Object.freeze({skip:true}),
});
const DIRS={up:[0,1,0],down:[0,-1,0],port:[1,0,0],stbd:[-1,0,0],fwd:[0,0,1],aft:[0,0,-1]};
const add=(p,d,s=.25)=>[p[0]+d[0]*s,p[1]+d[1]*s,p[2]+d[2]*s];
const leave=a=>add(a.pos,DIRS[a.dir],a.off??.25);
const key=p=>p.map(n=>Math.round(n*100)).join(',');
/** The pipe's outside radius from its nominal bore (mm): DN 50 ≈ 60 mm outside; the smallest drawn at 12 mm. */
export const pipeRadius=dn=>Math.max(.012,dn*.0006+.004);

/**
 * Routes every line of `systems` (FERRY_PIPING) whose ends are both in `anchors` (keys 'system/node'): returns
 * [{system, from, to, dn, colour, points}] with points an orthogonal polyline from anchor to anchor. `G` is the
 * space: y0 the floor plates, y1 the deckhead, W the half-breadth between the linings, `crossings` the z of the
 * bulkheads a run may cross the ship along (just aft of each).
 */
export function routePipes(systems,anchors,G){
 const routes=[];
 // Low lanes run under the floor plates (the bilge and lubricating-oil mains do), overhead lanes under the deckhead.
 const laneY=l=>l.low?G.y0-.11-(l.k%3)*.03:G.y1+l.dy;
 const laneX=(l,side)=>side*(l.low?G.W-.3-l.k*.12:G.W-.14-l.k*.12);
 const sideOf=p=>p[0]>=0?1:-1;
 for(const s of systems){const lane=PIPE_LANES[s.id];if(!lane||lane.skip)continue;
  for(const li of s.lines){if(!(li.dn>0))continue;const a=anchors[s.id+'/'+li.from],b=anchors[s.id+'/'+li.to];if(!a||!b)continue;
   const pa=leave(a),pb=leave(b);let pts;
   // A machine's own circuit hugs the machine: straight, just over the higher of its two ends.
   const near=Math.abs(pa[0]-pb[0])<.3&&Math.abs(pa[2]-pb[2])<.3,sa=sideOf(pa),sb=sideOf(pb);
   // Both ends low (a sea chest, a tank's stub, a pump's suction, a bilge well): a suction, run under the floor plates on
   // the system's low lane; both ends high: the system's overhead lane. A machine's own circuit (both ends local, on
   // one side) hugs the machine: straight, just over the higher of its two ends, round the machine not through it.
   const low=lane.low||(pa[1]<G.y0+.7&&pb[1]<G.y0+.7);
   if(near)pts=[a.pos,pa,[pa[0],pb[1],pa[2]],[pb[0],pb[1],pa[2]],pb,b.pos];
   else if(lane.local||(a.local&&b.local&&sa===sb)){const y=Math.min(G.y1-.08,Math.max(pa[1],pb[1])+.06);
    const orders=[[a.pos,pa,[pa[0],y,pa[2]],[pb[0],y,pa[2]],[pb[0],y,pb[2]],pb,b.pos],[a.pos,pa,[pa[0],y,pa[2]],[pa[0],y,pb[2]],[pb[0],y,pb[2]],pb,b.pos]];
    pts=G.clear?orders.find(o=>clearRun(o,G.clear))||orders[0]:orders[0];}
   else{
    const L=low?{low:true,k:lane.k}:lane,y=laneY(L),xa=laneX(L,sa),xb=laneX(L,sb);
    pts=[a.pos,pa,[pa[0],y,pa[2]],[xa,y,pa[2]]];
    // Across the ship along a bulkhead: the forward bulkhead of the compartment both ends are in, else the one nearest
    // the run's middle (never the engine room's aft one: the switchboard stands there); each lane a little aft of the
    // last so the crossings do not stack on one line.
    if(sa!==sb){const comp=z=>G.crossings.findIndex(c=>z<c+.22);const ca=comp(pa[2]),cb=comp(pb[2]),mid=(pa[2]+pb[2])/2;
     const zc=(ca===cb&&ca>=0?G.crossings[ca]:G.crossings.reduce((best,z)=>Math.abs(z-mid)<Math.abs(best-mid)?z:best))-lane.k*.11;pts.push([xa,y,zc],[xb,y,zc]);}
    pts.push([xb,y,pb[2]],[pb[0],y,pb[2]],pb,b.pos);
   }
   // Drop the points that repeat (an anchor already on its lane), so every segment has a length.
   const clean=[];for(const p of pts)if(!clean.length||key(clean[clean.length-1])!==key(p))clean.push(p);
   routes.push(Object.freeze({system:s.id,from:li.from,to:li.to,dn:li.dn,colour:s.colour,points:Object.freeze(clean.map(p=>Object.freeze(p)))}));
  }}
 return routes;
}
/** Whether a polyline's middle (its first and last point excepted) stays clear by `clear(p)`, sampled every 5 cm. */
function clearRun(pts,clear){
 for(let i=2;i<pts.length-2;i++){const a=pts[i-1],b=pts[i];const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/.05));
  for(let j=0;j<=n;j++)if(!clear([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n,a[2]+(b[2]-a[2])*j/n]))return false;}
 return true;
}
/** The segments of the routes, each once: [{system, dn, colour, a, b}]. */
export function pipeSegments(routes){
 // Segments of one system on one line (same axis, same two fixed coordinates) are merged where they overlap or touch,
 // so a main that several branches join is one bar, at the largest bore on it.
 const lines=new Map();
 for(const r of routes)for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i];const ax=[0,1,2].find(k=>Math.abs(a[k]-b[k])>1e-6);if(ax===undefined)continue;
  const fixed=[0,1,2].filter(k=>k!==ax).map(k=>Math.round(a[k]*100)),lk=r.system+'|'+ax+'|'+fixed.join(',');
  if(!lines.has(lk))lines.set(lk,{system:r.system,colour:r.colour,ax,fixed:[0,1,2].filter(k=>k!==ax).map(k=>a[k]),spans:[]});
  lines.get(lk).spans.push({lo:Math.min(a[ax],b[ax]),hi:Math.max(a[ax],b[ax]),dn:r.dn});}
 const out=[];
 for(const l of lines.values()){l.spans.sort((p,q)=>p.lo-q.lo);let cur=null;
  const emit=()=>{if(!cur)return;const mk=v=>{const p=[0,0,0];let j=0;for(let k=0;k<3;k++)p[k]=k===l.ax?v:l.fixed[j++];return p;};out.push({system:l.system,dn:cur.dn,colour:l.colour,a:mk(cur.lo),b:mk(cur.hi)});};
  for(const sp of l.spans){if(cur&&sp.lo<=cur.hi+1e-6){cur.hi=Math.max(cur.hi,sp.hi);cur.dn=Math.max(cur.dn,sp.dn);}else{emit();cur={...sp};}}
  emit();}
 return out;
}
/** The corners of the routes (where a bend is drawn), each once: [{system, dn, colour, p}]. */
export function pipeBends(routes){
 const seen=new Set(),out=[];
 for(const r of routes)for(let i=1;i<r.points.length-1;i++){const p=r.points[i],k=r.system+key(p);if(seen.has(k))continue;seen.add(k);out.push({system:r.system,dn:r.dn,colour:r.colour,p});}
 return out;
}
