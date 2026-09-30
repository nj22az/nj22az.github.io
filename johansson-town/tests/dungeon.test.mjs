import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {generateFloor,FLOOR,TILE,tileCentre} from '../src/dungeon/generate.js';
import {buildDungeon,CREATURES} from '../src/dungeon/dungeon.js';

const reachable=(map,from)=>{const seen=new Set([from.y*map.w+from.x]),queue=[[from.x,from.y]];
 while(queue.length){const [x,y]=queue.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(y+dy)*map.w+x+dx;if(map.at(x+dx,y+dy)===FLOOR&&!seen.has(k)){seen.add(k);queue.push([x+dx,y+dy]);}}}
 return seen;};

test('every floor is one connected cave: rope, stairs, chests and creatures all reachable',()=>{
 for(const floor of [1,2,3,5])for(const seed of [1,2,3,17,99]){
  const map=generateFloor(floor,seed),open=reachable(map,map.start),key=t=>t.y*map.w+t.x;
  assert.ok(map.rooms.length>=4,'Too few rooms on B'+floor);
  assert.ok(open.has(key(map.stairs)),'The stairs cannot be reached on B'+floor+' seed '+seed);
  assert.notDeepEqual(map.stairs,map.start,'The stairs are under the rope');
  for(const c of [...map.chests,...map.creatures])assert.ok(open.has(key(c)),'Something is sealed in the rock');
  // The edge of the grid is always rock, so nobody walks off the world.
  for(let x=0;x<map.w;x++)assert.ok(map.at(x,0)!==FLOOR&&map.at(x,map.h-1)!==FLOOR);
 }
 // The same seed is the same floor; deeper is bigger and busier.
 assert.deepEqual([...generateFloor(2,5).tiles],[...generateFloor(2,5).tiles]);
 const shallow=generateFloor(1,4),deep=generateFloor(5,4);
 assert.ok(deep.w>shallow.w&&deep.creatures.length>=shallow.creatures.length);
});

const run=()=>({hp:5,maxHp:5,loot:0,items:[],floor:1,seed:3});
const build=(r=run(),hooks={})=>{const room=new THREE.Group(),anchors=[];const layout=buildDungeon({room,reg:(o,label,fn)=>anchors.push({o,label,fn}),run:r,...hooks});return {room,anchors,layout,r};};

test('the grid is the walls: you walk the cave floor and nowhere else',()=>{
 const {layout}=build(),map=layout.dungeon.map;
 const [sx,,sz]=layout.spawn;assert.equal(layout.blocked(sx,sz,.3),false,'You arrive inside rock');
 assert.equal(layout.blocked(-1,-1,.3),true);
 // The stairs are a pit you stand at the edge of, not a floor you walk onto.
 const pit=(x,y)=>x===map.stairs.x&&y===map.stairs.y;
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){const [cx,cz]=tileCentre(x,y);assert.equal(layout.blocked(cx,cz,0),map.at(x,y)!==FLOOR||pit(x,y));}
 // and the edge of the pit is somewhere you can stand, close enough to go down.
 const [px,pz]=tileCentre(map.stairs.x,map.stairs.y);
 assert.ok([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>!layout.blocked(px+dx*TILE,pz+dz*TILE,.3)),'Nowhere to stand beside the stairs');
 assert.equal(layout.noDoorway,true,'Walking back past the rope throws you out of the dungeon');
});

test('chests pay out once, creatures can be struck down, and they hurt when they reach you',()=>{
 let hurt=0,fainted=false,exited=false,descended=false;
 const {anchors,layout,r}=build(run(),{onHurt:()=>hurt++,onFaint:()=>fainted=true,onExit:()=>exited=true,onDescend:()=>descended=true});
 const d=layout.dungeon;
 // A chest.
 const chestAnchor=anchors.find(a=>a.label==='Open the chest');assert.ok(chestAnchor,'No chest on the first floor');
 chestAnchor.fn();const after=r.loot+r.items.length;chestAnchor.fn();assert.equal(r.loot+r.items.length,after,'A chest paid out twice');assert.ok(after>0);
 // A creature, struck until it is gone, pays its bounty.
 const c=d.creatures[0];assert.ok(c,'Nothing lives on the first floor');
 d.update(0,{x:c.x+1,z:c.z});const before=r.loot;
 for(let i=0;i<CREATURES[c.kind].hp;i++){d.update(0,{x:c.x+1,z:c.z});d.strike(c);}
 assert.equal(c.alive,false);assert.ok(r.loot>before,'No bounty');
 // Another one catches you if you stand still next to it.
 const other=d.creatures.find(x=>x.alive);
 if(other){for(let i=0;i<120;i++)d.update(1/30,{x:other.x+.3,z:other.z});assert.ok(hurt>0,'It never touched you');}
 // Five hearts and then you black out.
 r.hp=1;if(other&&other.alive){other.cool=0;d.update(1/30,{x:other.x+.2,z:other.z});assert.ok(fainted,'You never black out');}
 // The rope and the stairs.
 anchors.find(a=>/Climb/.test(a.label)).fn();assert.ok(exited);
 anchors.find(a=>/Go down to floor B2/.test(a.label)).fn();assert.ok(descended);
});
