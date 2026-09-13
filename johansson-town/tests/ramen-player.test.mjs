import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createRamenPlayerService} from '../src/people/ramen-player-service.js';

test('ramen orders charge only on delivery, cancel when leaving and cannot replay payment',()=>{
 const room=new T.Group(),seat={position:[0,0,0],yaw:0};let current=seat,minutes=600,yen=1000,charges=0;
 const service=createRamenPlayerService({room,getSeat:()=>current,getMinutes:()=>minutes,getBalance:()=>yen,pay:cost=>{if(yen<cost)return false;yen-=cost;charges++;return true;},say(){}});
 assert.ok(service.request('ramen'));service.update(3);current=null;service.update(3);assert.equal(yen,1000);assert.equal(service.order,null);
 current=seat;assert.ok(service.request('ramen'));minutes=1260;service.update(10);assert.equal(charges,0);assert.equal(service.request('ramen'),false);
 minutes=600;assert.ok(service.request('ramen'));assert.equal(service.request('tea'),false);service.update(5);assert.equal(charges,1);assert.equal(yen,700);assert.ok(room.children.some(p=>p.visible));
 service.update(60);assert.equal(charges,1);assert.ok(service.eat());assert.equal(service.eat(),false);assert.ok(room.children.every(p=>!p.visible));
 assert.ok(service.request('ramen'));yen=0;service.update(5);assert.equal(charges,1);assert.equal(service.order,null);assert.ok(room.children.every(p=>!p.visible));service.dispose();assert.equal(room.children.length,0);
});
