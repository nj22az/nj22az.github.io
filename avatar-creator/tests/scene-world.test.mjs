import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {installDOM} from '../../johansson-town/tests/fixtures.mjs';
import {buildSceneWorld} from '../scene-world.js';
installDOM();
const originalFetch=globalThis.fetch;globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(fs.readFileSync(new URL('../../johansson-town/assets/'+new URL(String(url)).pathname.split('/assets/')[1],import.meta.url)));
let townData;
const views=JSON.parse(fs.readFileSync(new URL('../../johansson-town/assets/images/feed/views.json',import.meta.url)));
for(const id of ['harbour','sakura','books','town-hall','park','garden','pier','sakura-street','rainflower','onsen','minato','sato-ramen'])test(id+' uses real world geometry and safe ground placement',async()=>{
 const w=await buildSceneWorld(id,views,townData);townData=w.townData||townData;
 try{assert.ok(w.meshes.length>20);for(const mesh of w.meshes){let p=mesh;while(p){assert.ok(p.visible,'hidden town characters do not obstruct picking');p=p.parent;}}assert.ok(w.camera.isPerspectiveCamera);if(['minato','sato-ramen'].includes(id))assert.ok(w.scene.getObjectByName('Minato interior'),'shipped dining geometry loaded');const actors=Array.from({length:6},(_,i)=>({id:String(i),x:0,z:0,size:1,seat:''}));w.settle(actors);for(let i=0;i<actors.length;i++){const p=w.place(actors[i]);assert.equal(w.blocked(p.x,p.z),false);for(let j=0;j<i;j++){const q=w.place(actors[j]);assert.ok(Math.hypot(p.x-q.x,p.z-q.z)>=.459,'characters do not overlap');}}const a={id:'a',x:0,z:0,size:1,seat:''};const p=w.place(a);assert.ok(Number.isFinite(p.y));assert.equal(w.blocked(p.x,p.z),false);assert.ok(w.camera.position.toArray().every(Number.isFinite));if(id==='town-hall'){assert.ok(w.seats.length>0);a.seat=w.seats[0].id;const seat=w.place(a);assert.deepEqual([seat.x,seat.y,seat.z],w.seats[0].position);assert.ok(seat.seat.surfaceY>seat.y);}}
 finally{w.dispose();}
});
