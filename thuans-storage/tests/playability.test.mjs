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


test('sprint is hold-only and clears on pause; stick magnitude never sprints',()=>{
  const input=api.kd();input.attach(env.canvas());
  input.setTouchMove(1,0);input.consumeLook();
  assert.equal(input.actions.sprint,false,'full stick must not sprint');
  input.setTouchSprint(true,7);input.consumeLook();assert.equal(input.actions.sprint,true);
  input.setTouchSprint(false,7);input.consumeLook();assert.equal(input.actions.sprint,false,'Run release clears sprint');
  env.window.dispatch('keydown',{code:'ShiftLeft'});input.consumeLook();assert.equal(input.actions.sprint,true);
  env.window.dispatch('keyup',{code:'ShiftLeft'});input.consumeLook();assert.equal(input.actions.sprint,false,'Shift is hold-to-run');
  input.clearSprint();input.consumeLook();assert.equal(input.actions.sprint,false);
  input.detach();

  let hud;
  const game=api.createGame({canvas:env.canvas(),minimap:env.canvas(),gltf:model,onHud:v=>{hud=v;}});
  game.start();
  game.setTouchSprint(true);game.setTouchMove(0,1);
  const runFrom=env.rendered().character.position.clone();
  env.advance(0.5);
  const runDist=env.rendered().character.position.distanceTo(runFrom);
  game.pause();assert.equal(hud.phase,'paused');
  game.resume();
  game.setTouchMove(0,1); // move again; sprint must stay cleared after pause
  const walkFrom=env.rendered().character.position.clone();
  env.advance(0.5);
  const walkDist=env.rendered().character.position.distanceTo(walkFrom);
  assert.ok(runDist>walkDist*1.15,`sprint should outpace walk after pause clears run (${runDist} vs ${walkDist})`);
  game.dispose();
});

test('alignedStep matches town WalkFix; start does not moonwalk into the stockroom',()=>{
  assert.equal(api.alignedStep(0),1);
  assert.equal(api.alignedStep(Math.PI),0);
  assert.ok(api.alignedStep(Math.PI/2)<1e-9);
  let hud;const game=api.createGame({canvas:env.canvas(),minimap:env.canvas(),gltf:model,onHud:v=>{hud=v;}});
  // Title poses Thuan sideways; starting play must snap facing into the room before steps.
  env.advance(0.2);
  game.start();
  // After start, advance a short moment with no input — she should stay put (not slide).
  const origin=env.rendered().character.position.clone();
  env.advance(0.5);
  assert.ok(env.rendered().character.position.distanceTo(origin)<0.05,'no drift without input after start');
  // Auto-restock: first beats may turn in place; displacement should not be opposite facing.
  game.autoRestock();
  const startPos=env.rendered().character.position.clone();
  env.advance(0.35);
  const moved=env.rendered().character.position.clone().sub(startPos);
  const dist=Math.hypot(moved.x,moved.z);
  if(dist>0.08){
    // Mesh faces rotation.y; travel direction should agree within a quarter turn (no moonwalk).
    const travelYaw=Math.atan2(-moved.x,-moved.z);
    const faceYaw=env.rendered().character.rotation.y - Math.PI; // undo mesh offset
    let delta=travelYaw-faceYaw;
    while(delta>Math.PI)delta-=Math.PI*2;
    while(delta<-Math.PI)delta+=Math.PI*2;
    assert.ok(Math.abs(delta)<Math.PI/2,`moonwalk into stockroom: delta=${delta}`);
  }
  game.dispose();
});

test('holding reverse walks a straight return path without the camera rotating the input',()=>{
  const game=api.createGame({canvas:env.canvas(),minimap:env.canvas(),gltf:model,onHud(){}});
  game.restart(1988);game.start();game.setTouchMove(0,1);env.advance(2);
  game.setTouchMove(0,-1);env.advance(0.5);
  const from=env.rendered().character.position.clone();
  env.advance(0.8);
  const to=env.rendered().character.position.clone(),delta=to.clone().sub(from);
  assert.ok(delta.z < -1.2,`reverse should progress back down the aisle: ${delta.z}`);
  assert.ok(Math.abs(delta.x)<0.1,`camera steered the held reverse input sideways: ${delta.x}`);
  const yaw=env.rendered().character.rotation.y-Math.PI;
  assert.ok((-Math.sin(yaw)*delta.x-Math.cos(yaw)*delta.z)>delta.length()*0.8,'Thuan must face actual travel');
  game.pause();game.resume();env.advance(0.1);
  assert.ok(Math.abs(env.rendered().character.rotation.y-Math.PI-yaw)<0.05,'resume must preserve her facing');
  game.dispose();
});
