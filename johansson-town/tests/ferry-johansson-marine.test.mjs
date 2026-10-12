import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {JOHANSSON_MARINE,makerPlate} from '../src/world/johansson-marine.js';
import {FERRY_MACHINERY,FERRY_ELECTRICS} from '../src/world/ferry-ship.js';
import {FERRY_INTERIOR} from '../src/world/ferry-interior.js';
import {FERRY_INSPECT} from '../src/world/ferry-inspect.js';
import {createFerryRun} from '../src/world/ferry.js';
installDOM();

test('the Johansson Marine catalogue is the ship’s own data under the brand',()=>{
 const c=JOHANSSON_MARINE.catalogue;
 assert.match(c.main.spec,new RegExp(`${FERRY_MACHINERY.mains.cylinders} cyl · ${FERRY_MACHINERY.mains.bore}×${FERRY_MACHINERY.mains.stroke} mm · ${FERRY_MACHINERY.mains.kW} kW at ${FERRY_MACHINERY.mains.rpm} rpm`));
 assert.match(c.genset.spec,new RegExp(`${FERRY_ELECTRICS.generators.kVA} kVA`));assert.match(c.gear.spec,new RegExp(`^${FERRY_MACHINERY.gears.ratio}:1`));
 for(const [key,m] of Object.entries(c)){assert.match(m.model,/^J[A-Z]-?[A-Z0-9-]+$/,key+' has a Johansson model number');assert.ok(m.kind&&m.spec&&m.count>0,key);}
 const plate=makerPlate('main',1);assert.equal(plate[0],'JOHANSSON MARINE');assert.equal(plate[1],'JM6-160');assert.match(plate[3],/^No\. \d+ · Johansson Marine Works/);
 assert.throws(()=>makerPlate('tractor'));
});

test('the main engines and generator sets are built as machines, in the livery, with their plates',()=>{
 const names=new Set(FERRY_INTERIOR.cyls.map(c=>c.name).filter(Boolean));
 for(const part of ['crankcase door','oil filler','fuel filter','turbocharger turbine','turbocharger compressor','air filter','cooling-water pump','sea-water pump','lube-oil filter','flywheel housing','coupling guard','gearbox cover','output flange','gauge','tachometer','stop button','generator turbocharger','alternator'])assert.ok(names.has(part),'built: '+part);
 const green=JOHANSSON_MARINE.livery.green;
 const blocks=FERRY_INTERIOR.boxes.filter(b=>b.name==='main engine');assert.equal(blocks.length,2);for(const b of blocks)assert.equal(b.hex,green,'the block is in Johansson green');
 const plates=FERRY_INTERIOR.plates;
 assert.equal(plates.filter(p=>p.lines[0]==='JOHANSSON MARINE').length,4,'two mains and two gensets carry a maker’s plate');
 assert.equal(plates.filter(p=>p.lines[0]==='JOHANSSON').length,2,'the wordmark on each engine');
 for(const p of plates)assert.ok(p.w>0&&p.h>0&&p.pos.length===3&&Number.isFinite(p.rotY),p.name);
 // Every cylinder stands inside the engine room, below the car deck.
 for(const c of FERRY_INTERIOR.cyls)assert.ok(c.pos[1]<2.2&&c.pos[1]>-1.2&&Math.abs(c.pos[0])<4,'in the engine room: '+c.name+' '+JSON.stringify(c.pos));
});

test('the model draws the cylinders and hangs the plates on her; the prompts name the brand',()=>{
 const parent=new THREE.Group(),run=createFerryRun({parent,colliders:[]});
 const plates=[];run.ferry.traverse(o=>{if(o.isMesh&&/maker’s plate|wordmark/.test(o.name))plates.push(o);});
 assert.equal(plates.length,FERRY_INTERIOR.plates.length,'every plate is a textured plane on the ship');
 const metal=run.ferry.getObjectByName('Minato Maru metal');assert.ok(metal,'the metal class carries the machine parts');
 for(const id of ['main-engine','gearbox','generator']){const p=FERRY_INSPECT.find(p=>p.id===id);assert.match(p.title+' '+p.text,/Johansson Marine J[A-Z]/,id);}
});
