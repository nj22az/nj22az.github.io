import test from 'node:test';
import assert from 'node:assert/strict';
import {stickAxes,lookStep,createGamepadInput,createMenuRepeat} from '../src/input/analogue.js';
import {cameraSettings,createCameraControls,navigateControls} from '../src/input/camera-controls.js';
import {createTouchSticks} from '../src/input/touch-sticks.js';
import {Element,installDOM} from './fixtures.mjs';
import {readFile} from 'node:fs/promises';

const pad=()=>({id:'Test standard controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
test('analogue walking has a radial dead zone, bounded diagonals and independent look axes',()=>{
 assert.deepEqual(stickAxes(.07,-.08),{x:0,y:0});assert.ok(stickAxes(.3,0).x>0&&stickAxes(.3,0).x<.3);
 assert.ok(Math.abs(Math.hypot(...Object.values(stickAxes(1,1)))-1)<1e-8);
 assert.deepEqual(stickAxes(NaN,Infinity),{x:0,y:0});
 const input=createGamepadInput(),p=pad();input.sample([null,p]);p.axes=[.5,-.5,1,.4];const f=input.sample([null,p]);assert.ok(f.move.x>0&&f.move.y<0&&f.look.x>.9&&f.look.y>0);
});
test('controller buttons fire once and disconnect, focus loss and held reconnects do not leave stuck input',()=>{
 const input=createGamepadInput(),p=pad();input.sample([p]);p.buttons[0]={pressed:true,value:1};
 assert.equal(input.sample([p]).pressed[0],true);assert.equal(input.sample([p]).pressed[0],false);
 assert.equal(input.sample([]).connected,false);assert.deepEqual(input.sample([]).move,{x:0,y:0});
 assert.equal(input.sample([p]).pressed[0],undefined);p.buttons[0]={pressed:false,value:0};input.sample([p]);p.buttons[0].pressed=true;assert.equal(input.sample([p]).pressed[0],true);
 input.suspend();p.axes[0]=1;assert.deepEqual(input.sample([p]).move,{x:0,y:0});p.axes[0]=0;p.buttons[0].pressed=false;input.sample([p]);p.axes[0]=1;assert.equal(input.sample([p]).move.x,1);
 p.mapping='';assert.equal(input.sample([p]).connected,false,'Unknown layouts must not silently map the wrong controls');
});
test('camera rotation is independent of frame rate, invertible and pitch-limited',()=>{
 const run=hz=>{let view={yaw:0,pitch:0};for(let i=0;i<hz;i++)view=lookStep(view.yaw,view.pitch,.7,.2,1/hz);return view;};
 const a=run(30),b=run(120);assert.ok(Math.abs(a.yaw-b.yaw)<1e-9&&Math.abs(a.pitch-b.pitch)<1e-9);
 assert.ok(lookStep(0,0,0,1,.1,{invertY:true,sensitivity:1}).pitch>0);
 assert.equal(lookStep(0,-1.25,0,1,.1).pitch,-1.25);
 const settings=cameraSettings({sensitivity:Infinity,fov:-100,deadzone:.9,invertY:true,bob:false});assert.deepEqual(settings,{sensitivity:1,fov:45,deadzone:.35,invertY:true,bob:false});
});
test('two touches can move and look together; release, cancel and pausing stop their axes',()=>{
 installDOM();let enabled=true,dragged=0;const canvas=new Element(),movePad=new Element(),lookPad=new Element();
 const sticks=createTouchSticks({canvas,movePad,lookPad,enabled:()=>enabled,onDrag:dx=>dragged+=dx});
 // A look pad is still supported for callers that want one; the published touch build
 // drops it and looks by dragging the view instead.
 const send=(target,type,id,x=56,y=56)=>{for(const fn of target.listeners[type]||[])fn({pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault(){},stopPropagation(){}});};
 send(movePad,'pointerdown',1,56,20);send(lookPad,'pointerdown',2,90,56);assert.ok(sticks.move.y<-.8&&sticks.look.x>.8);
 send(movePad,'pointerup',1);assert.equal(sticks.move.y,0);assert.ok(sticks.look.x>.8);
 send(lookPad,'pointercancel',2);assert.equal(sticks.look.x,0);
 send(movePad,'pointerdown',3,56,20);enabled=false;send(movePad,'pointermove',3,56,20);assert.deepEqual(sticks.move,{x:0,y:0});
 enabled=true;send(canvas,'pointerdown',4);send(canvas,'pointermove',4,90,56);assert.equal(dragged,34);assert.ok(sticks.suppressClick(),'Camera dragging must not activate a shelf item');sticks.reset();
});
test('controller menu repeats do not spam and range adjustments remain within the camera limits',()=>{
 installDOM();const repeat=createMenuRepeat(),f={held:[],move:{x:0,y:1}};assert.equal(repeat(f,.016),'down');assert.equal(repeat(f,.016),'');assert.equal(repeat(f,.4),'down');f.move.y=0;repeat(f,.016);f.move.y=-1;assert.equal(repeat(f,.016),'up');
 const range={type:'range',min:'45',max:'85',step:'1',value:'85',getClientRects:()=>[{}],dispatchEvent(){this.changed=true;}};document.activeElement=range;const root={querySelectorAll:()=>[range]};navigateControls(root,'right');assert.equal(range.value,'85');navigateControls(root,'left');assert.equal(range.value,'84');assert.ok(range.changed);
});
test('camera settings open and close safely with malformed stored preferences',()=>{
 installDOM({'johansson-town-camera-v1':'broken'});let opened=0,closed=0;
 const camera=createCameraControls({onChange(){},onCentre(){},onOpen(){opened++;},onClose(){closed++;}});
 camera.open();assert.equal(camera.active,true);camera.close();assert.equal(camera.active,false);assert.equal(opened,1);assert.equal(closed,1);assert.equal(camera.settings.fov,65);
});

test('the published touch build looks by dragging the view, with no second stick',async()=>{
 installDOM();const dragged={x:0,y:0};
 const send=(target,type,id,x=56,y=56)=>{for(const fn of target.listeners[type]||[])fn({pointerId:id,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault(){},stopPropagation(){}});};
 const canvas=new Element(),movePad=new Element();
 const sticks=createTouchSticks({canvas,movePad,enabled:()=>true,onDrag:(dx,dy)=>{dragged.x+=dx;dragged.y+=dy;}});
 assert.deepEqual(sticks.look,{x:0,y:0},'There is no look stick to read');
 // Walking and looking at once: one thumb holds the move stick, another drags the view.
 send(movePad,'pointerdown',1,56,20);assert.ok(sticks.move.y<-.8,'The move stick still walks');
 send(canvas,'pointerdown',2,200,400);send(canvas,'pointermove',2,240,380);
 assert.ok(dragged.x>0&&dragged.y<0,'Dragging the view turns the camera');
 assert.ok(sticks.move.y<-.8,'and does not disturb the walk in progress');
 assert.equal(sticks.suppressClick(),true,'A drag is not also treated as a tap');
 send(canvas,'pointerup',2);send(movePad,'pointerup',1);
 assert.equal(sticks.move.y,0);
 const markup=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(markup,/id="lookStick"/,'The look stick is gone from the page');
});
