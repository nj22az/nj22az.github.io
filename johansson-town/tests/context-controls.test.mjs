import test from 'node:test';
import assert from 'node:assert/strict';
import {controlVisibility} from '../src/interact/control-visibility.js';

test('idle exploration hides unused controls; movement, targets and held drinks reveal only relevant actions',()=>{
 const idle={playing:true,paused:false,seated:false,inside:false,moving:false,running:false,canDrink:false,hasTarget:false};
 assert.deepEqual(controlVisibility(idle),{mobile:true,act:false,drink:false,run:false,jump:false});
 const walking=controlVisibility({...idle,moving:true});assert.ok(walking.run&&walking.jump&&!walking.act);
 assert.equal(controlVisibility({...idle,hasTarget:true}).act,true);
 assert.equal(controlVisibility({...idle,canDrink:true}).drink,true);
 assert.equal(controlVisibility({...idle,running:true}).run,true,'Running toggle remains reachable when stopping');
 assert.equal(controlVisibility({...idle,moving:true,inside:true}).jump,false);
 const seated=controlVisibility({...idle,seated:true,moving:true});assert.ok(seated.act&&!seated.run&&!seated.jump);
 assert.ok(Object.values(controlVisibility({...idle,paused:true,moving:true,canDrink:true,hasTarget:true})).every(v=>!v));
 assert.ok(Object.values(controlVisibility({...idle,playing:false})).every(v=>!v));
});
