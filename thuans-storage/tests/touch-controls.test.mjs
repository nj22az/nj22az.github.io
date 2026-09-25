import test from 'node:test';
import assert from 'node:assert/strict';
import { runtime } from './runtime-harness.mjs';

const { api } = await runtime();
function fixture() {
  let state, movement = [0, 0], running = false, activity = 0;
  const looks = [], captures = [];
  const target = {
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 393, height: 700 }),
    setPointerCapture: id => captures.push(id),
  };
  const event = (id, x = 80, y = 500, pointerType = 'touch') => ({
    pointerId: id, clientX: x, clientY: y, pointerType, currentTarget: target, preventDefault() {},
  });
  const controls = api.createStorageTouchControls({
    move: (x,y) => { movement = [x,y]; }, look: (x,y) => looks.push([x,y]),
    sprint: value => { running = value; }, changed: value => { state = value; },
    activity: () => activity++,
  });
  controls.reset();
  return { controls, event, looks, captures, get state(){return state;},
    get movement(){return movement;}, get running(){return running;}, get activity(){return activity;} };
}

test('sticks are absent until touched and appear at the initial finger position without a jump', () => {
  const f = fixture();
  assert.equal(f.state.move, null); assert.equal(f.state.look, null);
  f.controls.start(f.event(1));
  assert.equal(f.state.move.ox, 70); assert.equal(f.state.move.oy, 480);
  assert.deepEqual(f.movement, [0,0]); assert.equal(f.activity, 1);
  f.controls.update(f.event(1,80,456));
  assert.equal(f.movement[1], 1); assert.equal(f.running, false, 'full movement is still walking');
  f.controls.end(f.event(1));
  assert.equal(f.state.move, null); assert.deepEqual(f.movement, [0,0]);
  f.controls.update(f.event(1,80,400));
  assert.equal(f.state.move, null, 'released pointers cannot resurrect a stick');
});

test('simultaneous Move, Look and held Run retain separate pointer ownership', () => {
  const f = fixture();
  f.controls.start(f.event(1)); f.controls.update(f.event(1,80,456));
  f.controls.start(f.event(2,300,500)); f.controls.update(f.event(2,310,495));
  assert.equal(f.state.look.ox, 290); assert.deepEqual(f.looks[0], [21.5,-10.75]);
  assert.equal(f.movement[1], 1);
  f.controls.startRun(f.event(3,360,670)); assert.equal(f.running, true);
  f.controls.start(f.event(4,90,550));
  assert.equal(f.state.move.id, 1, 'a second left-side touch must not steal movement');
  f.controls.end(f.event(4)); assert.equal(f.running, true);
  f.controls.end(f.event(2));
  assert.equal(f.state.look, null); assert.equal(f.movement[1],1); assert.equal(f.running,true);
  f.controls.end(f.event(3)); assert.equal(f.running,false); assert.equal(f.movement[1],1);
  f.controls.startRun(f.event(5)); f.controls.end(f.event(1));
  assert.equal(f.running,false); assert.equal(f.state.move,null); assert.deepEqual(f.movement,[0,0]);
});

test('pause, blur, resize and menu resets clear all gestures and ignore stale releases', () => {
  const f = fixture();
  f.controls.start(f.event(1)); f.controls.update(f.event(1,80,450));
  f.controls.start(f.event(2,300,500)); f.controls.startRun(f.event(3));
  f.controls.reset();
  assert.equal(f.state.move,null); assert.equal(f.state.look,null); assert.equal(f.running,false);
  assert.deepEqual(f.movement,[0,0]);
  f.controls.start(f.event(4)); f.controls.update(f.event(4,80,456));
  for(const id of [1,2,3]) f.controls.end(f.event(id));
  assert.equal(f.state.move.id,4); assert.equal(f.movement[1],1);
  f.controls.end(f.event(4));
  f.controls.start(f.event(5,80,500,'mouse'));
  assert.equal(f.state.move,null, 'mouse input does not create touch overlays');
});
