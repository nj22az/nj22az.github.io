import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {FERRY_INTERIOR as I,FERRY_ENGINE_ROOM as E} from '../src/world/ferry-interior.js';
import {FERRY_PIPING as P} from '../src/world/ferry-piping.js';
import {validatePipeRoute,pipeRadius,pipeSegmentIntersectsBox} from '../src/world/ferry-pipe-routes.js';
import {searchFuelPath,FUEL_HOLDS} from '../src/world/ferry-fuel-design.js';

test('fuel edges have distinct, owned proposed interfaces and explicit geometric dispositions',()=>{
 const D=I.fuelEngineering,edges=P.find(s=>s.id==='fuel').lines;
 assert.equal(D.routes.length+D.issues.length,edges.length);
 for(const edge of edges){const [a,b]=D.interfaces.edges[edge.from+'>'+edge.to];assert.equal(a.node,edge.from);assert.equal(b.node,edge.to);assert.notEqual(a.id,b.id);for(const t of [a,b])assert.equal(t.status,'proposed-not-supplier-verified');}
 for(const id of ['tp1','tp2','purifier','service','storeP','fuel-mainP','fuel-mainS']){
  const ports=Object.values(D.interfaces.ports).filter(t=>t.node===id);assert.equal(new Set(ports.map(t=>JSON.stringify(t.pos))).size,ports.length,id+' ports do not collapse');
 }
});
test('revised paths pass fresh radius, named-owner, access and other-service clearance checks',()=>{
 const D=I.fuelEngineering,existing=I.engineeringPipes.filter(r=>r.system!=='fuel');
 for(const r of D.routes){const [a,b]=D.interfaces.edges[r.from+'>'+r.to];assert.deepEqual(r.points[0],a.pos);assert.deepEqual(r.points.at(-1),b.pos);
  assert.deepEqual(validatePipeRoute(r.points,D.geometry,r.dn,{a,b,existing}),{ok:true},r.lineId);
  for(let j=1;j<r.points.length;j++)for(const box of D.access)assert.equal(pipeSegmentIntersectsBox(r.points[j-1],r.points[j],box,pipeRadius(r.dn)),false,r.lineId+' access');
  existing.push(r);
 }
 assert.ok(D.routes.some(r=>r.from==='bunker'&&r.to==='storeP'));
 assert.ok(D.routes.some(r=>r.from==='bunker'&&r.to==='storeS'));
 assert.ok(!D.issues.some(i=>i.reason==='missing physical terminal'));
});
test('strict ownership cannot exempt an unrelated box or lengthen a nozzle stub',()=>{
 const box={name:'pump A',a:[0,0,0],b:[1,1,1]},G={y0:0,y1:3,W:4,obstacles:[box],strictTerminals:true};
 const a={id:'a',owner:'pump A',pos:[.5,1,.5],dir:'up',off:.12};
 assert.equal(validatePipeRoute([a.pos,[.5,1.12,.5]],G,25,{a}).ok,true);
 assert.equal(validatePipeRoute([a.pos,[.5,.9,.5]],G,25,{a:{...a,owner:'pump B'}}).ok,false);
 assert.equal(validatePipeRoute([a.pos,[.5,1.5,.5]],G,25,{a}).ok,false);
 assert.equal(validatePipeRoute([[.5,1.1,.5],[.5,1.2,.5]],G,25,{a}).reason,'terminal endpoint mismatch');
});
test('blocked search remains open and never supplies an obstructed fallback',()=>{
 const a={id:'a',pos:[1,1,1],dir:'up',off:.1},b={id:'b',pos:[1,1,2],dir:'up',off:.1};
 const G={y0:0,y1:3,W:2,z0:0,z1:3,strictTerminals:true,obstacles:[{name:'sealed box',a:[-2,0,0],b:[2,3,3]}]};
 assert.ok(searchFuelPath(a,b,25,G,[]).failure);
});
test('bunker station clears boarding passage; tank ports explicitly reference an unpartitioned reservation',()=>{
 const D=I.fuelEngineering;
 for(const t of Object.values(D.interfaces.ports).filter(t=>t.node==='bunker')){assert.ok(t.pos[0]>0);assert.ok(t.pos[2]+17.25<13.3);assert.match(t.basis,/proposed/);}
 for(const t of Object.values(D.interfaces.ports).filter(t=>/^store|sludge/.test(t.node))){assert.ok(Math.abs(t.pos[1]+1.9-.68)<1e-6);assert.match(t.basis,/partition unverified/);}
 assert.ok(FUEL_HOLDS.some(s=>/NPSH/.test(s)));assert.ok(FUEL_HOLDS.some(s=>/internal|supplier|equipment/.test(s)));
});
test('C1 register and source hashes match live inputs; Revision B manifest remains unchanged',()=>{
 const base=new URL('../docs/minato-maru/',import.meta.url),d=JSON.parse(fs.readFileSync(new URL('fuel-c1/engineering.json',base)));
 assert.equal(d.summary.counts.fuelGeometryClear,I.fuelEngineering.routes.length);assert.equal(d.summary.counts.allUnresolved,I.pipeRouteIssues.length);
 for(const [name,hash] of Object.entries(d.summary.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+name,import.meta.url))).digest('hex'),hash,name);
 assert.match(d.summary.status,/CONSTRUCTION NOT APPROVED/);
 const records=JSON.parse(fs.readFileSync(new URL('fuel-c1/revb-reference-hashes.json',base)));
 for(const [file,hash] of Object.entries(records))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('cad-revb/'+file,base))).digest('hex'),hash,file);
});

test('fuel polylines reject fold-backs and non-adjacent centreline self intersections',()=>{
 const G={y0:0,y1:3,W:3,strictTerminals:true};
 assert.equal(validatePipeRoute([[1,1,1],[1,1.2,1],[1,1.1,1]],G,20).reason,'self-overlapping reversal');
 assert.equal(validatePipeRoute([[0,1,0],[1,1,0],[1,1,1],[.5,1,1],[.5,1,-1]],G,20).reason,'self-intersecting route');
});
test('all accepted non-fuel services keep their Revision B geometry and original line identity',()=>{
 const B=JSON.parse(fs.readFileSync(new URL('../docs/minato-maru/cad-revb/Minato_Maru_RevB/data/ferry_source_snapshot.json',import.meta.url)));
 const pick=r=>({lineId:r.lineId,dn:r.dn,points:r.points});
 assert.deepEqual(I.engineeringPipes.filter(r=>r.system!=='fuel').map(pick),B.interior.engineeringPipes.filter(r=>r.system!=='fuel').map(pick));
});
