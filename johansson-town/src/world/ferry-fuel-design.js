/** C1 fuel interface/routing proposal, 2026-10-17. FOR DESIGN REVIEW; CONSTRUCTION NOT APPROVED.
 * All nozzles below are proposed design interfaces on source equipment/reservation faces,
 * not selected-maker flange coordinates. The legacy game preview is deliberately separate.
 */
import {pipeRadius,pipeSegmentIntersectsBox,pipeSegmentDistance,validatePipeRoute} from './ferry-pipe-routes.js';
export const FUEL_REVISION='C1';
export const FUEL_HOLDS=Object.freeze([
 'Select equipment and confirm nozzle sizes, directions, flange envelopes and pump suction/discharge manifolds.',
 'Design individual storage/sludge tank partitions, roof plating, penetrations, dip pipes, vents, sounding and overflow arrangements; the source defines only a shared tank reservation.',
 'Select pipe class, actual ID/OD, wall, corrosion allowance, insulation, bend radius, flange/valve access and supports; current radii are geometric reservations.',
 'Confirm pump curves, viscosity/temperature, NPSH, pressure losses, purifier feed regulation/bypass and return/overflow capacity. A 2 m3/h pump is not demonstrated compatible with a 0.25 m3/h purifier.',
 'Confirm gravity head at minimum service-tank level, engine inlet/return pressure and generator return arrangements. The old 1.8 m gravity-head claim is unsupported.',
 'Engineer and approve tank/deck/watertight bulkhead sleeves, fire protection and fuel containment. Proposed penetrations confer no structural or fire approval.',
 'Coordinate unvalidated service routes, cables, ventilation, removal and escape envelopes; this check only reserves stated access boxes and existing accepted pipes.'
]);
const dirs={up:[0,1,0],down:[0,-1,0],port:[1,0,0],stbd:[-1,0,0],fwd:[0,0,1],aft:[0,0,-1]};
const move=t=>t.pos.map((v,k)=>v+dirs[t.dir][k]*t.off);
const same=(a,b)=>a.every((v,k)=>Math.abs(v-b[k])<1e-7);
const clean=p=>p.filter((v,i)=>!i||!same(v,p[i-1]));
const compact=p=>p.filter((v,i)=>!i||i===p.length-1||[0,1,2].find(k=>Math.abs(v[k]-p[i-1][k])>1e-7)!==[0,1,2].find(k=>Math.abs(p[i+1][k]-v[k])>1e-7));
const frozen=o=>Object.freeze(o);

/** Explicit per-edge ports prevent inlet/outlet collapse. Coordinates are game metres. */
export function fuelInterfaces(anchors,ER,half,draft){
 const ports={},edges={};const z=X=>X-half;
 const port=(node,tag,pos,dir,{owner=null,off=.12,penetration=false,penetrates=[],basis='proposed assembly interface'}={})=>{
  const id='fuel/'+node+':'+tag;
  return ports[id]=frozen({id,node,port:tag,pos:frozen(pos),dir,off,owner,penetration,penetrates:frozen(penetrates),basis,status:'proposed-not-supplier-verified'});
 };
 const pair=(from,to,a,b)=>{edges[from+'>'+to]=frozen([a,b]);};
 const tank=(n,tag,x,X)=>port(n,tag,[x,.68-draft,z(X)],'up',{penetration:true,off:.42,penetrates:['reserved removable floor plates'],basis:'proposed roof at upper bound of shared ER double-bottom reservation; tank partition unverified'});
 const pFill=tank('storeP','fill',2.25,12.0),sFill=tank('storeS','fill',-2.25,12.0);
 const pSuction=tank('storeP','suction',2.25,12.3),sSuction=tank('storeS','suction',-2.25,12.3);
 const pOverflow=tank('storeP','overflow',2.25,12.65),sludge=tank('sludge','inlet',2.98,13.0);
 // Two valved outlets of one proposed bunker station. Internal inlet/tee spool is listed separately.
 const bP=port('bunker','fillP',[3.66,1.5,z(12.85)],'down',{off:.70,penetration:true,basis:'proposed port car-deck station; outside boarding passage X13.3..14.7'});
 const bS=port('bunker','fillS',[3.84,1.5,z(12.85)],'down',{off:.70,penetration:true,basis:bP.basis});
 pair('bunker','storeP',bP,pFill);pair('bunker','storeS',bS,sFill);
 for(const [s,n,st] of [[1,'vP',pSuction],[-1,'vS',sSuction]]){
  const x=s*2.25,X=12.3,y=ER.floor+.35;
  pair(s>0?'storeP':'storeS',n,st,port(n,'tank',[x,y,z(X)],'down',{off:.12}));
  // Coordinate the proposed P cross-suction outlet to its lane, avoiding a 1 mm routing jog.
  for(const [i,dx] of [[1,-.09],[2,.09]])pair(n,'tp'+i,port(n,'pump'+i,[x+dx-(s>0&&i===2?.001:0),y+.1,z(X)],'up'),null);
 }
 for(const [i,X] of [[1,14.2],[2,14.55]]){
  const owner='fuel transfer no.'+i+' pump';
  // Separate suction manifold branch interfaces and discharge on the top equipment envelope.
  for(const [v,dx] of [['vP',-.1],['vS',.1]]){
   const a=edges[v+'>tp'+i][0];pair(v,'tp'+i,a,port('tp'+i,'suction-'+v,[3.73+dx,ER.floor+.55,z(X)],'up',{owner,off:.16}));
  }
  const out=port('tp'+i,'discharge',[3.48,ER.floor+.44,z(X+.04)],'stbd',{owner,off:.14});
  pair('tp'+i,'purifier',out,port('purifier','feed'+i,[3.48,ER.floor+.8,z(11.85+i*.16)],'stbd',{owner:'fuel purifier',off:.14}));
 }
 const purOut=port('purifier','clean',[3.71,ER.floor+1.1,z(12.22)],'up',{owner:'fuel purifier',off:.14});
 const purSludge=port('purifier','sludge',[3.48,ER.floor+.3,z(11.82)],'stbd',{owner:'fuel purifier',off:.14});
 const svc=(tag,y,X)=>port('service',tag,[-3.23,y,z(X)],'port',{owner:'fuel service tank',off:.06});
 pair('purifier','service',purOut,svc('clean-in',.35,13.35));pair('purifier','sludge',purSludge,sludge);
 const ovIn=port('overflow','inlet',[-3.02,.50,z(12.8)],'stbd',{off:.06});
 pair('service','overflow',svc('overflow',.50,12.8),ovIn);
 pair('overflow','storeP',port('overflow','outlet',[-2.94,.50,z(12.8)],'up'),pOverflow);
 pair('service','qcv',svc('supply',-.60,13.6),port('qcv','inlet',[-3.08,-.60,z(13.6)],'stbd',{off:.06}));
 // A proposed QCV/downstream distribution assembly: four explicitly separated outlet faces.
 for(const [j,id] of ['mainP','mainS','gen1','gen2'].entries()){
  const q=port('qcv','out-'+id,[-3.08+j*.10,.50,z(13.6)],'up');
  const a=anchors['fuel/fuel-'+id];
  const inlet=port('fuel-'+id,'inlet',a.pos.slice(),'up',{off:.18,basis:'retained source feed interface; maker flange position unverified'});
  pair('qcv','fuel-'+id,q,inlet);
 }
 for(const [i,id] of ['mainP','mainS'].entries()){
  const a=anchors['fuel/fuel-'+id],p=a.pos.slice();p[2]+=.18;
  pair('fuel-'+id,'return',port('fuel-'+id,'return',p,'up',{off:.18}),port('return','in-'+id,[2.80+i*.25,.50,z(13)],'up'));
 }
 pair('return','service',port('return','outlet',[2.93,.50,z(13.15)],'up'),svc('return',.40,13.05));
 return frozen({ports:frozen(ports),edges:frozen(edges),bunkerAssembly:frozen({
  status:'proposed-not-supplier-verified',inlet:[3.75,1.70,z(12.85)],
  // DN50 common inlet/tee and two independently isolated outlets. Not independent coincident pipes.
  dn:50,spools:[[[3.75,1.70,z(12.85)],[3.75,1.5,z(12.85)]],[[3.66,1.5,z(12.85)],[3.84,1.5,z(12.85)]]],outlets:[bP.id,bS.id]
 })});
}

/** Access reservations are model dimensions, not approved escape/maintenance minima. */
export function fuelAccessReservations(ER,half){
 const box=(name,x0,x1,X0,X1)=>({name,a:[x0,ER.floor,X0-half],b:[x1,ER.floor+1.75,X1-half]});
 return [box('reserved central access',-.63,.63,8.5,19),box('reserved forward engine service',-2.1,2.1,13.05,13.7),
  box('reserved generator port aisle',2.5,3.30,14.0,16.55),box('reserved generator stbd aisle',-3.30,-2.5,14.0,16.55),
  box('reserved generator cross aisle',-3.30,3.30,16.35,16.65)];
}

/** Proposed sleeves cut the source bulkhead envelope at the outboard overhead lane only.
 * The remaining wall is solid to the routing check. Engineering approval of the sleeve is open.
 */
export function fuelStructureReservations(ER,half){
 const z=ER.fore,lower=ER.floor-.1,upper=ER.deckhead;
 return [
  {name:'reserved removable floor plates',a:[-ER.side,ER.floor-.02,ER.aft],b:[ER.side,ER.floor,19-half]},
  {name:'ER forward bulkhead stbd',a:[-ER.side,lower,z],b:[-.4,upper,z+.06]},
  {name:'ER forward bulkhead port',a:[.4,lower,z],b:[3.4,upper,z+.06]},
  {name:'ER sleeve lower boundary',a:[3.4,lower,z],b:[ER.side,.72,z+.06]},
  {name:'ER sleeve upper boundary',a:[3.4,.88,z],b:[ER.side,upper,z+.06]}
 ];
}

/** Deterministic bounded rectilinear visibility grid; no obstructed fallback. */
export function searchFuelPath(a,b,dn,G,existing){
 const pa=move(a),pb=move(b),r=pipeRadius(dn);
 const stubA=[a.pos,pa],stubB=[pb,b.pos];
 const audit=p=>validatePipeRoute(p,G,dn,{a,b,existing});
 const stubCheck=validatePipeRoute([a.pos,pa],G,dn,{a,existing});
 if(!stubCheck.ok)return {failure:{...stubCheck,terminal:a.id}};
 const endCheck=validatePipeRoute([pb,b.pos],G,dn,{b,existing});
 if(!endCheck.ok)return {failure:{...endCheck,terminal:b.id}};
 const obstacles=G.obstacles,segments=existing.flatMap(o=>o.points.slice(1).map((p,i)=>({a:o.points[i],b:p,r:pipeRadius(o.dn),id:o.lineId})));
 const xs=[pa[0],pb[0],-3.9,-3.75,-3.5,-3.35,-3.12,-2.85,-2.25,-1.2,-.8,0,.8,1.2,2.25,2.85,3.12,3.35,3.5,3.75,3.9];
 const ys=[pa[1],pb[1],G.y0-.18,G.y0-.12,G.y0+.6,G.y0+1.25,G.y0+1.60,G.y0+1.80,G.y0+1.85,G.y1-r-.01];
 const zs=[pa[2],pb[2]];for(let z=G.z0+.1;z<G.z1;z+=.24)zs.push(z);
 // Offset faces provide exact-radius detours around machinery and existing pipes.
 for(const o of obstacles)for(const [axis,values] of [[0,xs],[1,ys],[2,zs]]){
  values.push(Math.min(o.a[axis],o.b[axis])-r-.012,Math.max(o.a[axis],o.b[axis])+r+.012);
 }
 const unique=(v,lo,hi)=>[...new Set(v.filter(n=>n>=lo-1e-7&&n<=hi+1e-7).map(n=>Math.round(n*1e6)/1e6))].sort((a,b)=>a-b);
 const coords=[unique(xs,-G.W+r,G.W-r),unique(ys,G.y0+.04+r,G.y1-r),unique(zs,Math.max(G.z0+r,Math.min(pa[2],pb[2])-.65),Math.min(G.z1-r,Math.max(pa[2],pb[2])+.65))];
 const find=(k,p)=>coords[k].findIndex(n=>Math.abs(n-p[k])<1e-6),dims=coords.map(c=>c.length);
 const index=(i,j,k)=>(i*dims[1]+j)*dims[2]+k;
 const decode=n=>{const k=n%dims[2],j=Math.floor(n/dims[2])%dims[1],i=Math.floor(n/(dims[1]*dims[2]));return [i,j,k];};
 const point=ijk=>ijk.map((v,k)=>coords[k][v]);
 const si=[0,1,2].map(k=>find(k,pa)),ti=[0,1,2].map(k=>find(k,pb));
 if([...si,...ti].some(n=>n<0))return {failure:{reason:'terminal exit outside bounded routing grid'}};
 const start=index(...si),goal=index(...ti),heap=[];
 const push=(n,f)=>{heap.push({n,f});let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=f)break;heap[i]=heap[p];i=p;}heap[i]={n,f};};
 const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;};
 const dist=new Map([[start,0]]),prev=new Map(),closed=new Set(),edgeCache=new Map();
 const h=p=>p.reduce((s,n,k)=>s+Math.abs(n-pb[k]),0);
 const free=(p,q)=>{
  if(obstacles.some(o=>pipeSegmentIntersectsBox(p,q,o,r)))return false;
  if(segments.some(s=>pipeSegmentDistance(p,q,s.a,s.b)<r+s.r+.01-1e-7))return false;
  // Search nodes are strictly inside the room bounds; only the separately checked bunker stub leaves it.
  return true;
 };
 push(start,2*h(pa));let visited=0;
 while(heap.length&&visited++<160000){const {n}=pop();if(closed.has(n))continue;if(n===goal){const chain=[];let v=n;while(v!==undefined){chain.push(point(decode(v)));v=prev.get(v);}chain.reverse();chain[0]=pa;chain[chain.length-1]=pb;
   // Preserve first/last stubs: only compact the searched middle, so ownership exemptions cannot grow.
   const points=clean([stubA[0],...compact(chain),stubB[1]]),result=audit(points);
   return result.ok?{points,visited}:{failure:result,visited};}
  closed.add(n);const ijk=decode(n),p=point(ijk);
  for(let ax=0;ax<3;ax++)for(const step of [-1,1]){const v=ijk.slice();v[ax]+=step;if(v[ax]<0||v[ax]>=dims[ax])continue;const m=index(...v);if(closed.has(m))continue;
   const q=point(v),ek=n<m?n+':'+m:m+':'+n;let ok=edgeCache.get(ek);if(ok===undefined){ok=free(p,q);edgeCache.set(ek,ok);}if(!ok)continue;
   const cost=dist.get(n)+Math.abs(q[ax]-p[ax])+.001;
   if(cost<(dist.get(m)??Infinity)){dist.set(m,cost);prev.set(m,n);push(m,cost+2*h(q));}}
 }
 return {failure:{reason:'no clear path in bounded fuel grid'},visited};
}

export function routeFuelDesign(system,anchors,ER,half,draft,obstacles,existing,spools=null){
 const interfaces=fuelInterfaces(anchors,ER,half,draft),access=fuelAccessReservations(ER,half);
 obstacles=obstacles.filter(o=>Math.min(o.a[1],o.b[1])<=ER.deckhead&&Math.max(o.a[1],o.b[1])>=ER.floor-.05&&Math.min(o.a[2],o.b[2])<=19-half&&Math.max(o.a[2],o.b[2])>=ER.aft);
 // No global permission to leave a compartment. Only bunker terminal stubs may use their declared sleeve.
 const G={strictTerminals:true,y0:ER.floor,y1:ER.deckhead,W:ER.side,z0:ER.aft,z1:19-half,obstacles:[...obstacles,...access,...fuelStructureReservations(ER,half)],
  clear:(p,r,{terminal}={})=>p[1]+r<=ER.deckhead+1e-7||(terminal?.node==='bunker'&&p[0]-r>=3.58&&p[0]+r<=3.94&&p[2]-r>=12.7-half&&p[2]+r<=13.0-half&&p[1]+r<=1.75)};
 const routes=[],issues=[];
 for(const [serial,line] of system.lines.entries()){
  if(!(line.dn>0))continue;const lineId='fuel/'+line.from+'>'+line.to+'#'+serial,[a,b]=interfaces.edges[line.from+'>'+line.to]||[];
  let result={failure:{reason:'missing physical terminal'}};
  if(a&&b){
   if(spools){const candidate=spools[line.from+'>'+line.to];const check=candidate?validatePipeRoute(candidate,G,line.dn,{a,b,existing:[...existing,...routes]}):{ok:false,reason:'no reviewed fuel spool'};result=check.ok?{points:candidate}:{failure:check};}
   else {
    const reserved=Object.entries(interfaces.edges).filter(([key])=>key!==line.from+'>'+line.to).flatMap(([key,ts])=>ts.map(t=>({lineId:'reserved/'+t.id,dn:system.lines.find(l=>l.from+'>'+l.to===key).dn,points:[t.pos,move(t)]})));
    const seed=globalThis.FUEL_SEARCH_SEED?.[line.from+'>'+line.to]?.points;
    result=seed&&validatePipeRoute(seed,G,line.dn,{a,b,existing:[...existing,...routes,...reserved]}).ok?{points:seed,visited:0}:searchFuelPath(a,b,line.dn,G,[...existing,...routes,...reserved]);
   }
  }
  if(globalThis.FUEL_SEARCH_LOG)console.log(lineId,result.points?'clear':result.failure,result.visited);
  globalThis.FUEL_SEARCH_CHECKPOINT?.(line.from+'>'+line.to,result);
  if(result.points)routes.push(frozen({lineId,system:'fuel',from:line.from,to:line.to,dn:line.dn,colour:system.colour,status:'geometry-clear',revision:FUEL_REVISION,
   interfaceStatus:'proposed-not-supplier-verified',terminals:frozen([a,b]),points:frozen(result.points.map(p=>frozen(p))),searchVisited:result.visited}));
  else issues.push(frozen({lineId,system:'fuel',...line,status:'unresolved',revision:FUEL_REVISION,...result.failure,searchVisited:result.visited??0}));
 }
 return frozen({interfaces,access:frozen(access),routes:frozen(routes),issues:frozen(issues),geometry:G,holds:FUEL_HOLDS});
}
