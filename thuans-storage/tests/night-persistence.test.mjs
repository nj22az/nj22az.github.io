import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime-harness.mjs';
const copy=v=>JSON.parse(JSON.stringify(v));
test('all four bosses retain their identity, fight progress, picked goods, position and auto mode across rebuild',async()=>{
 const env=await runtime(),seen=new Set();let hud,saved;
 for(let seed=0;seen.size<4;seed++){
  const animal=env.api.hd(seed).boss.animal;if(seen.has(animal))continue;seen.add(animal);
  let g=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud:v=>hud=v,onCheckpoint:v=>saved=copy(v)});
  g.restart(seed);g.autoRestock();env.advance(18);g.pause();g.dispose();const before=copy(saved);
  assert.ok(before.time>=18-.1);assert.ok(before.items.some(i=>i.taken));
  g=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud:v=>hud=v,onCheckpoint:v=>saved=copy(v),resumeData:before,nightLocked:true});
  assert.equal(g.restored,true);assert.equal(hud.seed,seed);assert.equal(hud.boss.animal,animal);assert.equal(hud.boss.hp,before.boss.hp);
  assert.deepEqual(saved.items,before.items);assert.deepEqual(saved.boss,before.boss);assert.equal(saved.px,before.px);assert.equal(saved.pz,before.pz);assert.equal(hud.autoRestocking,true);
  g.restart(seed+100);assert.equal(hud.seed,seed);g.resume();
  for(let t=0;t<240&&hud.phase!=='won';t++)env.advance(1);
  assert.equal(hud.phase,'won');g.dispose();const won=copy(saved),reward=hud.yenFound;
  g=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud:v=>hud=v,onCheckpoint:v=>saved=copy(v),resumeData:won,nightLocked:true});
  assert.equal(hud.phase,'won');assert.equal(hud.yenFound,reward);g.start();g.autoRestock();g.resume();g.restart();env.advance(2);assert.equal(hud.phase,'won');assert.equal(hud.time,won.time);g.dispose();
 }
});
test('a defeated boss remains defeated with exactly 200 coins after pagehide and reload',async()=>{
 const env=await runtime();let hud,saved;const make=data=>env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud:v=>hud=v,onCheckpoint:v=>saved=copy(v),resumeData:data});
 let g=make();let seed=0;while(env.api.hd(seed).boss.animal!=='bear')seed++;
 g.restart(seed);g.start();env.advance(11);const at=r=>{const p=env.api.gd(10,r,env.api.hd(seed));return [p.x,p.z];};
 for(let n=0;n<3;n++){
  g._stage({thuan:at(9.6),boss:[...at(8),0]});env.advance(.4);
  for(let t=0;t<12&&hud.boss.state!=='tired';t+=.1)env.advance(.1);
  assert.equal(hud.boss.state,'tired');g._stage({thuan:at(8.6)});g.shoo();env.advance(.2);
 }
 assert.equal(hud.yenFound,200);env.window.dispatch('pagehide');const before=copy(saved);g.dispose();g=make(before);
 assert.equal(hud.boss.defeated,true);assert.equal(hud.boss.hp,0);assert.equal(hud.yenFound,200);g.resume();env.advance(30);assert.equal(hud.yenFound,200);g.dispose();
});
test('old carton schema and malformed fight checkpoints cannot be restored',async()=>{
 const env=await runtime();let saved;let g=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud(){},onCheckpoint:v=>saved=copy(v)});g.start();env.advance(1);g.dispose();
 for(const patch of [{version:1},{time:NaN},{boss:{...saved.boss,hp:0,state:'roam'}},{items:[]}]){
  g=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud(){},resumeData:{...saved,...patch}});assert.equal(g.restored,false);g.dispose();
 }
});
