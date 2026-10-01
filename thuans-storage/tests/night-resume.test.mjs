import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime-harness.mjs';
test('leaving and rebuilding the stockroom preserves stolen cartons and night progress',async()=>{
 const env=await runtime();let hud,checkpoint;
 let game=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud:v=>hud=v,onCheckpoint:v=>checkpoint=v});
 game.restart(7);game.start();env.advance(100);
 const before={lost:[...hud.lostIds],shooed:hud.shooed,time:hud.time,seed:hud.seed};
 assert.ok(before.lost.length);game.dispose();
 game=env.api.createGame({canvas:env.canvas(),minimap:env.canvas(),onHud:v=>hud=v,resumeData:checkpoint});
 assert.equal(hud.seed,before.seed);assert.deepEqual([...hud.lostIds],before.lost);assert.equal(hud.shooed,before.shooed);assert.ok(hud.time>=before.time-1);
 game.dispose();
});
