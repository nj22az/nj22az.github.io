import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildSakuraCampaignPosters} from '../src/world/interiors/sakura-campaign-posters.js';
import {buildSakuraRoof} from '../src/world/interiors/sakura-roof.js';
import DATA from '../src/world/interiors/sakura-roof-design.json' with {type:'json'};
import WALL from '../src/world/interiors/sakura-wall-dressing.json' with {type:'json'};

test('approved A2 artwork loads at CAD wall planes and leaves retained notices clear',async()=>{
 installDOM();const d=buildSakuraCampaignPosters(new THREE.Group(),{load:async()=>new THREE.Texture()});
 assert.ok((await d.ready).every(x=>x.loaded));assert.equal(d.placements.length,4);
 for(const p of d.placements){assert.equal(p.width,420);assert.equal(p.height,594);assert.equal(p.center[1],(p.bottom+297)/1000);assert.equal(p.normal[0],p.wall==='east'?-1:1);
  for(const n of WALL.items.filter(n=>n.wall===p.wall)){const start=(3.91-n.three_center_m[2])*1000-n.width_mm/2,bottom=n.three_center_m[1]*1000-n.height_mm/2;assert.ok(p.start+p.width<=start||p.start>=start+n.width_mm||p.bottom+p.height<=bottom||p.bottom>=bottom+n.height_mm,p.id+' overlaps '+n.id);}
 }
 assert.deepEqual(DATA,JSON.parse(readFileSync(new URL('../docs/qa/sakura-posters-roof/design.json',import.meta.url))));
});
test('roof construction uses corrected apron fit, equal risers and complete separate pipe routes',()=>{
 const roof=buildSakuraRoof(new THREE.Group()),u=roof.userData;assert.equal(u.revision,'C');assert.equal(u.roofLevel,4010);
 assert.ok(Math.abs(u.stair.risers*u.stair.rise-4010)<.001);assert.equal(3150-u.stair.yardExtension-u.stair.steelEnvelope,855);assert.equal(u.pipeRoutes.length,8);
 assert.deepEqual(u.pipeRoutes.map(p=>p.id),['CW-F','CW-S','OF','DR','VT','CW-WB','CW-WC','CW-HW']);
 roof.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(roof);assert.ok(b.max.y>=5.76&&b.max.y<5.9);assert.ok(b.min.z>=-13.116);assert.ok(b.max.z<=.181);
 assert.match(u.access,/no roof entry/);let lights=0;roof.traverse(o=>{if(o.isLight)lights++;});assert.equal(lights,0,'roof adds no point-light workload');
});
