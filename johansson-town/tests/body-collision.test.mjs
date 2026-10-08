import test from 'node:test';
import assert from 'node:assert/strict';
import {separateBodies,BODY_RADIUS} from '../src/people/body-collision.js';

const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

test('two people walking into each other end up apart, each moved half', ()=>{
  const a={x:0,z:0},b={x:.2,z:0};
  assert.equal(separateBodies([a,b]),1);
  assert.ok(dist(a,b)>=BODY_RADIUS*2-1e-9);
  assert.ok(Math.abs(a.x+(b.x-.2))<1e-9,'both moved the same amount');
});

test('someone busy (seated, serving) stays put; the other steps aside', ()=>{
  const seated={x:0,z:0,fixed:true},walker={x:.1,z:.1};
  separateBodies([seated,walker]);
  assert.deepEqual([seated.x,seated.z],[0,0]);
  assert.ok(dist(seated,walker)>=BODY_RADIUS*2-1e-9);
});

test('nobody is pushed into a wall: the other gives way', ()=>{
  const wall=x=>x<-.05;   // a wall just behind a
  const a={x:0,z:0},b={x:.3,z:0};
  separateBodies([a,b],{blocked:(x)=>wall(x)});
  assert.equal(a.x,0);
  assert.ok(dist(a,b)>=BODY_RADIUS*2-1e-9);
});

test('people in different spaces (a room and the street) never collide', ()=>{
  const a={x:0,z:0,space:'street'},b={x:0,z:0,space:'sakura'};
  assert.equal(separateBodies([a,b]),0);
});

test('a crowd settles without anyone overlapping', ()=>{
  const crowd=Array.from({length:6},(_,i)=>({x:(i%3)*.15,z:Math.floor(i/3)*.15}));
  separateBodies(crowd,{passes:30});
  for(let i=0;i<crowd.length;i++)for(let j=i+1;j<crowd.length;j++)assert.ok(dist(crowd[i],crowd[j])>=BODY_RADIUS*2-1e-3);
});
