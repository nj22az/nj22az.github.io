import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime,loadThuan} from './runtime-harness.mjs';

const env=await runtime(),api=env.api;
const model=await loadThuan(api);

test('300 random stockrooms have separate departments and reachable goods and exit',()=>{
  const layouts=new Set();
  for(let seed=0;seed<300;seed++) {
    const maze=api.hd(seed),reachable=api.md(maze.cells,maze.cols,maze.rows,maze.start);
    assert.equal(reachable.size,maze.cells.filter(cell=>cell===0).length);
    assert.equal(maze.items.length,8);assert.equal(maze.items.filter(item=>item.needed).length,6);
    for(const target of [...maze.items,maze.exit])assert.ok(api.storageRoute(maze,maze.start,target).length>0);
    for(let a=0;a<maze.rooms.length;a++)for(let b=a+1;b<maze.rooms.length;b++) {
      const x=maze.rooms[a],y=maze.rooms[b];
      assert.ok(x.c+x.w<=y.c||y.c+y.w<=x.c||x.r+x.h<=y.r||y.r+y.h<=x.r,'overlapping stock zones');
    }
    layouts.add(maze.cells.join(''));
  }
  assert.ok(layouts.size>100);assert.deepEqual(api.hd(42),api.hd(42));
});

test('walking and sprinting cannot penetrate racks; diagonal contact slides',()=>{
  const maze=api.hd(1988),bank=maze.shelves[0],rack=api.gd(bank.c,bank.r,maze);
  let x=rack.x-1.2,z=rack.z;
  for(let i=0;i<180;i++){const next=api.moveStoragePlayer(x,z,4.2/60,0,maze);x=next.x;z=next.z;}
  assert.ok(x<=rack.x-0.75-0.34+1e-7);
  const before=z;
  for(let i=0;i<15;i++){const next=api.moveStoragePlayer(x,z,0.03,0.03,maze);x=next.x;z=next.z;}
  assert.ok(z>before+0.2,'sideways movement should continue along a rack');
  const bounds=api.wd(bank.c,bank.r,maze);
  assert.equal(api.Td(x,z,0.33999,bounds).hit,false);
});

test('real Thuan skin animates both legs through wave, walk, run and idle',()=>{
  const actor=api.createCharacter({gltf:model});actor.setWave(false);
  const left=actor.group.getObjectByName('LeftUpLeg'),right=actor.group.getObjectByName('RightUpLeg');
  for(const [speed,name] of [[2.35,'walk'],[4.2,'run'],[0,'idle'],[2.35,'walk']]) {
    for(let i=0;i<50;i++)actor.update(1/60,speed,0,i/60);
    const firstLeft=left.quaternion.clone(),firstRight=right.quaternion.clone();
    for(let i=0;i<9;i++)actor.update(1/60,speed,0,i/60);
    const state=actor.getAnimationState();assert.equal(state.name,name);assert.ok(state.weight>0.95,`${name} has zero action weight`);
    if(speed){assert.ok(firstLeft.angleTo(left.quaternion)>0.04,'left leg is static');assert.ok(firstRight.angleTo(right.quaternion)>0.04,'right leg is static');}
  }
  actor.setCelebrate(true);for(let i=0;i<30;i++)actor.update(1/60,0,0,i/60);
  assert.equal(actor.getAnimationState().name,'celebrate');assert.ok(actor.getAnimationState().weight>0.95);
  actor.dispose();
});

test('keyboard, touch and focus loss feed and clear movement',()=>{
  const input=api.kd();input.attach(env.canvas());
  env.window.dispatch('keydown',{code:'KeyW'});input.consumeLook();assert.equal(input.actions.moveY,1);
  env.window.dispatch('keyup',{code:'KeyW'});input.setTouchMove(1,1);input.setTouchSprint(true);input.consumeLook();assert.ok(input.actions.moveX>0.6);assert.equal(input.actions.sprint,true);
  env.window.dispatch('blur');input.consumeLook();assert.equal(input.actions.moveX,0);assert.equal(input.actions.moveY,0);assert.equal(input.actions.sprint,false);
  assert.doesNotThrow(()=>input.tryPointerLock(env.canvas()));input.detach();
});

test('game moves on touch, pauses without drift and automatic restocking completes',()=>{
  let hud;
  const game=api.createGame({canvas:env.canvas(),minimap:env.canvas(),gltf:model,onHud:value=>{hud=value;}});
  env.advance(0.1);const initial=env.rendered().character.position.clone();
  game.start();game.setTouchMove(0,1);env.advance(1);
  assert.ok(env.rendered().character.position.distanceTo(initial)>1.5,'Thuan does not move');
  game.pause();const paused=env.rendered().character.position.clone(),pausedTime=hud.time;env.advance(1);
  assert.equal(env.rendered().character.position.distanceTo(paused),0);assert.equal(hud.time,pausedTime);
  game.resume();env.advance(0.5);assert.equal(env.rendered().character.position.distanceTo(paused),0,'held touch input leaked across pause');
  for(const seed of [1988,42,19,7]) {
    game.restart(seed);game.autoRestock();
    for(let second=0;second<180&&hud.phase!=='won';second++)env.advance(1);
    assert.equal(hud.phase,'won',`automatic restock stalled at seed ${seed}: ${hud.collected}/${hud.total}`);
    assert.equal(hud.collected,6);
    game.restart('same');assert.equal(hud.seed,seed);
  }
  game.dispose();assert.deepEqual(env.logs,[]);
});

test('harbour guests spawn on a fraction of seeds and never sit on restock shortest paths',()=>{
  let withGuest=0;
  for(let seed=0;seed<200;seed++) {
    const maze=api.hd(seed);
    if(!maze.guest)continue;
    withGuest++;
    const critical=new Set();
    const mark=path=>path.forEach(p=>critical.add(`${p.c},${p.r}`));
    mark(api.storageRoute(maze,maze.start,maze.exit));
    for(const item of maze.items.filter(i=>i.needed)){
      mark(api.storageRoute(maze,maze.start,item));
      mark(api.storageRoute(maze,item,maze.exit));
    }
    assert.equal(critical.has(`${maze.guest.c},${maze.guest.r}`),false,`guest on critical path seed ${seed}`);
    assert.ok(maze.guest.lines?.length>=2);
    assert.ok(maze.guest.name);
    // Required goods and exit remain reachable.
    for(const target of [...maze.items.filter(i=>i.needed),maze.exit]){
      assert.ok(api.storageRoute(maze,maze.start,target).length>0);
    }
  }
  assert.ok(withGuest>=50&&withGuest<=90,`expected ~25–40% guests, got ${withGuest}/200`);
  assert.deepEqual(api.hd(77).guest,api.hd(77).guest);
});

test('each night one of Bizarro Minato comes up the sea-cave hole, in the same suit as in the cave',async()=>{
  const {COSTUMES}=await import('../../johansson-town/src/dungeon/costumes.js');
  const animals=new Set();
  for(let seed=0;seed<60;seed++){
    const maze=api.hd(seed),boss=maze.boss;
    assert.ok(api.yd(maze.hole.c,maze.hole.r,maze),'the hole opens onto floor');
    assert.equal(api.vd(maze.hole.c+maze.hole.wall[0],maze.hole.r+maze.hole.wall[1],maze),true,'in a wall');
    for(const item of maze.items)assert.ok(api.storageRoute(maze,maze.hole,item).length,'every carton can be reached from the hole');
    const town=COSTUMES[boss.who];animals.add(boss.animal);
    assert.ok(town,boss.who+' is one of the cave’s townsfolk');assert.equal(boss.animal,town.animal);
    assert.deepEqual([...boss.lines],[...town.lines],'and talks the same backwards talk');
  }
  assert.deepEqual([...animals].sort(),['bear','crocodile','donkey','gorilla'],'every boss turns up over a few nights');
  assert.equal(api.hd(5).boss.who,api.hd(5).boss.who);assert.deepEqual(api.hd(5).items,api.hd(5).items);
});

test('the suit is the behaviour: each boss has its tell, its attack and a worn-out moment to shoo it',()=>{
  let hud;
  const game=api.createGame({canvas:env.canvas(),minimap:env.canvas(),gltf:model,onHud:value=>{hud=value;}});
  const seedFor=animal=>{for(let seed=0;;seed++)if(api.hd(seed).boss.animal===animal)return seed;};
  // On the clear spine between the departments: column 10, rows 5 to 12.
  const at=r=>{const p=api.gd(10,r,api.hd(0));return [p.x,p.z];};
  function watch(animal,thuanRow,bossRow,yaw=0,seconds=4){
    game.restart(seedFor(animal));game.start();env.advance(11);
    game._stage({thuan:at(thuanRow),boss:[...at(bossRow),yaw]});
    const states=[];let knocked=false;
    for(let t=0;t<seconds;t+=1/30){env.advance(1/30);if(states.at(-1)!==hud.boss.state)states.push(hud.boss.state);knocked||=hud.stunned;}
    return {states,knocked};
  }
  const has=(run,list,why)=>{let i=0;for(const s of run.states)if(s===list[i])i++;assert.equal(i,list.length,why+': '+run.states.join(' → '));};
  // The gorilla beats its chest at a distance, then charges down the aisle.
  const ape=watch('gorilla',11,6,0);has(ape,['beat','charge','tired'],'the gorilla');
  // The crocodile lifts its jaws close up, lunges and snaps, then rolls over worn out.
  const croc=watch('crocodile',10,8,0);has(croc,['jaws','lunge','tired'],'the crocodile');assert.ok(croc.knocked,'SNAP');
  // The bear rears up, swipes, and sits down heavily.
  const bear=watch('bear',9.6,8,0);has(bear,['rear','swipe','tired'],'the bear');assert.ok(bear.knocked,'swiped');
  // The donkey: from behind, both back hooves; in front, a bray.
  const behind=watch('donkey',7,8,0,2.5);has(behind,['kick','tired'],'the donkey from behind');assert.ok(behind.knocked,'kicked');
  const front=watch('donkey',9.2,8,0,1);has(front,['bray'],'the donkey from in front');
  // Shooing does nothing until it is worn out; three shoos while it is, and the head comes off.
  game.restart(seedFor('bear'));game.start();env.advance(11);
  game._stage({thuan:at(9.6),boss:[...at(8),0]});game.shoo();env.advance(.2);assert.equal(hud.boss.hp,3,'not while it is fresh');
  for(let round=0;round<3;round++){
    for(let t=0;t<12&&hud.boss.state!=='tired';t+=.1)env.advance(.1);
    assert.equal(hud.boss.state,'tired');
    game._stage({thuan:at(8.6)});game.shoo();env.advance(.2);
    // The HUD is refreshed every 0.12 s: give it a moment after moving everyone.
    if(round<2){assert.equal(hud.boss.hp,2-round,'round '+round+': '+hud.reaction);game._stage({thuan:at(9.6),boss:[...at(8),0]});env.advance(.3);}
  }
  assert.equal(hud.boss.defeated,true);assert.equal(hud.yenFound,200);
  env.advance(30);assert.equal(hud.boss.about,false,'back down the hole');
  game.dispose();assert.deepEqual(env.logs,[]);
});

test('with a boss about, Thuan restocking still gets the list in, and sees some off',()=>{
  let hud;const defeated=[];
  const game=api.createGame({canvas:env.canvas(),minimap:env.canvas(),gltf:model,onHud:value=>{hud=value;}});
  for(const seed of [0,1,3,4,14,21]){
    game.restart(seed);game.autoRestock();
    for(let second=0;second<240&&hud.phase!=='won';second++)env.advance(1);
    assert.equal(hud.phase,'won',`the ${hud.boss.animal} kept her from finishing at seed ${seed}`);assert.equal(hud.collected,6);
    assert.equal(hud.yenFound,hud.boss.defeated?200:0);if(hud.boss.defeated)defeated.push(hud.boss.animal);
  }
  assert.ok(defeated.length>=2,'she sees off a boss or two: '+defeated);
  game.dispose();assert.deepEqual(env.logs,[]);
});
