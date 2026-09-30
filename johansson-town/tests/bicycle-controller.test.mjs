import test from 'node:test';
import assert from 'node:assert/strict';
import {createBicycleController} from '../src/world/bicycle-controller.js';

test('bicycle accelerates, steers and spins forward along the street',()=>{
 const bike=createBicycleController({x:0,z:0});
 for(let i=0;i<60;i++)bike.update(1/60,{throttle:1});
 assert.ok(bike.state.speed>2);
 assert.ok(bike.state.z<0);
 const before=bike.state.yaw;
 bike.update(1/60,{throttle:1,steer:1});
 assert.ok(bike.state.yaw<before);
});

test('braking and reverse input stop the bicycle without exceeding the reverse limit',()=>{
 const bike=createBicycleController();
 for(let i=0;i<90;i++)bike.update(1/60,{throttle:1});
 for(let i=0;i<90;i++)bike.update(1/60,{throttle:-1});
 assert.ok(bike.state.speed<0);
 assert.ok(bike.state.speed>=-1.4);
});

test('an obstruction stops the bicycle before it crosses the blocked point',()=>{
 const bike=createBicycleController();
 for(let i=0;i<120;i++)bike.update(1/60,{throttle:1,blocked:(x,z)=>z<-.75});
 assert.ok(bike.state.z>=-.75);
 assert.equal(bike.state.speed,0);
});

test('the front wheel stops at a wall before the rider centre reaches it',async()=>{
 const {bicycleBlocked}=await import('../src/world/bicycle-fit.js');
 const bike=createBicycleController();
 const blocked=(x,z,yaw)=>bicycleBlocked(x,z,yaw,.75,(px,pz,r)=>pz-r<-.9);
 for(let i=0;i<180;i++)bike.update(1/60,{throttle:1,blocked});
 assert.ok(bike.state.z>=-.3225,'Front wheel and tyre remain clear of the wall');
 assert.equal(bike.state.speed,0);
 assert.equal(blocked(bike.state.x,bike.state.z,bike.state.yaw),false);
 for(let i=0;i<60;i++)bike.update(1/60,{throttle:-1,blocked});
 assert.ok(bike.state.z>0,'Can reverse away from the wall');
});
