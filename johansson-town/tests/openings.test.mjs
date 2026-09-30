import test from 'node:test';
import assert from 'node:assert/strict';
import {OPENINGS,chooseOpening} from '../src/world/openings.js';

const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))};};

test('the game starts somewhere good for the hour, never in the same place twice running',()=>{
 const storage=memory(),seen=new Set();let last=null;
 for(let i=0;i<60;i++){
  const o=chooseOpening({minutes:1140,storage,random:()=>((i*0.37)%1)});
  assert.notEqual(o.id,last,'a different opening from last time');last=o.id;seen.add(o.id);
 }
 assert.ok(seen.has('izakaya')&&seen.has('pier')&&seen.has('sakura-bench'),'the evening offers Minato, the pier and the Sakura bench');
});
test('Minato only when it is open, and nothing out in the rain that needs it dry',()=>{
 for(let i=0;i<40;i++){
  const morning=chooseOpening({minutes:600,storage:memory(),random:()=>i/40});
  assert.notEqual(morning.id,'izakaya','Minato is shut at ten in the morning');
  const wet=chooseOpening({minutes:600,rain:true,storage:memory(),random:()=>i/40});
  assert.ok(!wet.dry,wet.id+' is not a place to begin in the rain');
 }
 const night=new Set();for(let i=0;i<40;i++)night.add(chooseOpening({minutes:150,storage:memory(),random:()=>i/40}).id);
 assert.deepEqual([...night].sort(),['izakaya','sakura-bench'],'at half past two it is Minato or the bench');
});
test('an opening can be asked for by name, and every one says where you are',()=>{
 for(const o of OPENINGS){
  assert.equal(chooseOpening({force:o.id,storage:memory()}).id,o.id);
  assert.ok(o.caption&&(o.seat||o.stand||o.room),o.id+' has a place and a caption');
 }
});
