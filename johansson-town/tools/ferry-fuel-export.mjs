/** C1 issue exporter. Recheck every reviewed spool against current geometry before exporting. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {FERRY_INTERIOR as I,FERRY_ENGINE_ROOM as ER} from '../src/world/ferry-interior.js';
import {FERRY_SHIP as S} from '../src/world/ferry-ship.js';
import {FERRY_PIPING as P} from '../src/world/ferry-piping.js';
import {pipeRadius,pipeSegmentDistance} from '../src/world/ferry-pipe-routes.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'docs/minato-maru/fuel-c1');fs.mkdirSync(out,{recursive:true});
const baseline=JSON.parse(fs.readFileSync(path.join(root,'docs/minato-maru/cad-revb/Minato_Maru_RevB/data/ferry_source_snapshot.json')));
const design=I.fuelEngineering;
if(!design)throw Error('Fuel design is not integrated');
const csv=(name,rows)=>{const keys=[...new Set(rows.flatMap(Object.keys))];const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';fs.writeFileSync(path.join(out,name),[keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(typeof r[k]==='object'?JSON.stringify(r[k]):r[k])).join(','))].join('\n')+'\n');};
const all=[...I.engineeringPipes,...I.pipeRouteIssues];
const old=baseline.interior;
const schedule=P.find(s=>s.id==='fuel').lines.map(l=>{
 const current=all.find(r=>r.system==='fuel'&&r.from===l.from&&r.to===l.to);
 const before=[...(old.engineeringPipes||[]),...(old.pipeRouteIssues||[])].find(r=>r.system==='fuel'&&r.from===l.from&&r.to===l.to);
 const route=design.routes.find(r=>r.from===l.from&&r.to===l.to),term=design.interfaces.edges[l.from+'>'+l.to];
 const length=route?route.points.slice(1).reduce((s,p,i)=>s+Math.hypot(...p.map((v,k)=>v-route.points[i][k])),0):null;
 let pipeGap=Infinity,equipmentGap=Infinity;
 if(route)for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],radius=pipeRadius(route.dn);
  for(const other of I.engineeringPipes.filter(o=>o!==route))for(let j=1;j<other.points.length;j++)pipeGap=Math.min(pipeGap,pipeSegmentDistance(a,b,other.points[j-1],other.points[j])-radius-pipeRadius(other.dn));
  // Minimum conservative AABB clearance, omitting only the specifically owned end stub/declared floor sleeve.
  for(const o of design.geometry.obstacles){const ends=[...(i===1?[term[0]]:[]),...(i===route.points.length-1?[term[1]]:[])];if(ends.some(t=>t.owner===o.name||t.penetrates?.includes(o.name)))continue;
   const lo=o.a.map((v,k)=>Math.min(v,o.b[k])),hi=o.a.map((v,k)=>Math.max(v,o.b[k]));
   const gaps=a.map((v,k)=>Math.max(lo[k]-Math.max(v,b[k]),Math.min(v,b[k])-hi[k],0));equipmentGap=Math.min(equipmentGap,Math.hypot(...gaps)-radius);
  }
 }
 const flow=l.from.startsWith('tp')?2:l.from==='purifier'&&l.to==='service'?.25:null;
 return {lineId:current.lineId,from:l.from,to:l.to,DN_mm:l.dn,reservedRadius_mm:pipeRadius(l.dn)*1000,
  previousStatus:before?.status??'unrecorded',previousReason:before?.reason??'',currentStatus:current.status,currentReason:current.reason??'',
  disposition:before?.status==='unresolved'&&route?'geometric issue resolved; interface/design holds remain':route?'rechecked revised geometry; interface/design holds remain':'open geometric issue',
  fromPort:term?.[0].id,toPort:term?.[1].id,length_m:length===null?'':Number(length.toFixed(4)),
  minPipeSurfaceGap_mm:Number.isFinite(pipeGap)?Number((pipeGap*1000).toFixed(3)):'',minEquipmentReservationGap_mm:Number.isFinite(equipmentGap)?Number((equipmentGap*1000).toFixed(3)):'',
  flowBasis_m3_h:flow??'',nominalDNVelocity_m_s:flow?Number(((flow/3600)/(Math.PI*(l.dn/1000)**2/4)).toFixed(4)):'',
  sizingStatus:'DN retained; actual ID/OD, pressure loss, wall/flanges/bends/insulation and supplier flow data unverified',interfaceStatus:'proposed-not-supplier-verified'};
});
const sourceFiles=['src/world/ferry-fuel-design.js','src/world/ferry-fuel-spools.js','src/world/ferry-pipe-routes.js','src/world/ferry-interior.js','src/world/ferry-piping.js','src/world/ferry-ship.js','tools/ferry-fuel-export.mjs','tools/ferry-fuel-cad.py','tools/ferry-fuel-validate.py','tools/ferry-fuel-search.mjs','tools/ferry-fuel-simplify.mjs','tools/ferry-drawings.mjs','tools/ferry-status.mjs'];
const sourceHashes=Object.fromEntries(sourceFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const summary={revision:'C1 fuel-only design-review addendum',issueDate:'2026-10-17',status:'FOR DESIGN REVIEW - CONSTRUCTION NOT APPROVED',referenceRevision:'B, 2026-10-13; immutable package',
 sourceHashes,counts:{fuelLines:schedule.length,fuelGeometryClear:design.routes.length,fuelUnresolved:design.issues.length,previousFuelGeometryClear:old.engineeringPipes.filter(r=>r.system==='fuel').length,previousFuelUnresolved:old.pipeRouteIssues.filter(r=>r.system==='fuel').length,allGeometryClear:I.engineeringPipes.length,allUnresolved:I.pipeRouteIssues.length,geometricIssuesResolved:schedule.filter(r=>r.previousStatus==='unresolved'&&r.currentStatus==='geometry-clear').length},holds:design.holds,
 coordinates:'Game metres: x port; y above laden waterline; z forward of amidships. CAD mm: X=1000*(z+LOA/2), Y=1000*x, Z=1000*(y+draft).',
 acceptance:'External connection polylines against source equipment AABBs, proposed access/structure reservations and existing accepted services. All interfaces proposed; internal compound assemblies and unvalidated services remain holds. Not a fabrication or hydraulic acceptance.'};
csv('fuel_line_register.csv',schedule);csv('fuel_terminals.csv',Object.values(design.interfaces.ports));csv('pipe_route_issues.csv',I.pipeRouteIssues);
fs.writeFileSync(path.join(out,'engineering.json'),JSON.stringify({summary,ship:{length:S.length,draft:S.draft},routes:design.routes,issues:design.issues,interfaces:design.interfaces,access:design.access,obstacles:design.geometry.obstacles,otherRoutes:I.engineeringPipes.filter(r=>r.system!=='fuel'),schedule},null,2)+'\n');
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary.counts));
