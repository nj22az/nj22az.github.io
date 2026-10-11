import test from 'node:test';
import assert from 'node:assert/strict';
import {wrapTurn,turnToward,touchAngle,twistTurn,nudgeStep,placeToolbar,pickBox,nearestSeat} from '../scene-controls.mjs';

test('turns wrap, face the camera and follow a two-finger twist',()=>{
 assert.equal(wrapTurn(190),-170);assert.equal(wrapTurn(-190),170);assert.equal(wrapTurn(540),180);assert.equal(wrapTurn(-180),180);
 assert.equal(turnToward({x:0,z:0},{x:0,z:5}),0,'a camera in front (+z)');assert.equal(turnToward({x:0,z:0},{x:3,z:0}),90);assert.equal(Math.abs(turnToward({x:0,z:0},{x:0,z:-2})),180);
 const a={x:100,y:100},b={x:200,y:100},clockwise={x:100+100*Math.cos(Math.PI/6),y:100+100*Math.sin(Math.PI/6)};
 assert.equal(Math.round(touchAngle(a,clockwise)),30);
 assert.equal(twistTurn(10,touchAngle(a,b),touchAngle(a,clockwise)),-20,'a clockwise twist turns the character clockwise seen from above');
 assert.equal(twistTurn(170,0,-30),-160,'and wraps');
});
test('arrow keys move relative to the picture',()=>{
 const intoScreen={x:0,z:-1};
 assert.deepEqual(nudgeStep('ArrowRight',intoScreen,1),{dx:1,dz:0});assert.deepEqual(nudgeStep('ArrowUp',intoScreen,1),{dx:0,dz:-1});
 const fromSide=nudgeStep('ArrowLeft',{x:2,z:0},.5);assert.equal(fromSide.dx,0);assert.equal(fromSide.dz,-.5);
 assert.equal(nudgeStep('KeyQ',intoScreen),null);
});
test('the toolbar sits beside the character, inside the picture and never over the face',()=>{
 const frame={w:600,h:450},bar={w:240,h:52};
 const inside=(p)=>p.x>=4&&p.y>=4&&p.x+bar.w<=frame.w-4&&p.y+bar.h<=frame.h-4;
 const clearOf=(p,f)=>{const x=Math.max(p.x,Math.min(f.x,p.x+bar.w)),y=Math.max(p.y,Math.min(f.y,p.y+bar.h));return Math.hypot(f.x-x,f.y-y)>=f.r;};
 const standing={box:{left:250,top:100,right:330,bottom:300},face:{x:290,y:140,r:30}};
 let p=placeToolbar({frame,bar,...standing});assert.equal(p.where,'below');assert.ok(inside(p)&&clearOf(p,standing.face));
 const atBottom={box:{left:250,top:150,right:330,bottom:440},face:{x:290,y:200,r:35}};
 p=placeToolbar({frame,bar,...atBottom});assert.equal(p.where,'above');assert.ok(inside(p)&&clearOf(p,atBottom.face));
 const tall={box:{left:20,top:0,right:200,bottom:450},face:{x:110,y:90,r:80}};
 p=placeToolbar({frame,bar,...tall});assert.equal(p.where,'right');assert.ok(inside(p)&&clearOf(p,tall.face));
 const huge={box:{left:0,top:0,right:600,bottom:450},face:{x:300,y:150,r:120}};
 p=placeToolbar({frame,bar,...huge});assert.ok(['legs','bottom'].includes(p.where));assert.ok(inside(p)&&clearOf(p,huge.face));
 for(let i=0;i<400;i++){const l=Math.random()*560,t=Math.random()*400,box={left:l,top:t,right:l+20+Math.random()*300,bottom:t+20+Math.random()*300},face={x:(box.left+box.right)/2,y:box.top+30,r:10+Math.random()*60};
  const q=placeToolbar({frame,bar,box,face});if(q)assert.ok(inside(q)&&clearOf(q,face),JSON.stringify({box,face,q}));}
 assert.equal(placeToolbar({frame:{w:200,h:40},bar,box:{left:0,top:0,right:10,bottom:10},face:{x:5,y:5,r:2}}),null,'too small to hold it');
});
test('a fingertip picks the character it lands on, or the nearest box within reach',()=>{
 const boxes=[{id:'big',left:0,top:0,right:300,bottom:300},{id:'small',left:100,top:100,right:140,bottom:200},{id:'hidden',left:400,top:0,right:450,bottom:100,visible:false}];
 assert.equal(pickBox({x:120,y:150},boxes),'small');assert.equal(pickBox({x:20,y:20},boxes),'big');
 assert.equal(pickBox({x:310,y:20},boxes,14),'big','within the slop');assert.equal(pickBox({x:420,y:50},boxes),null,'hidden characters are not picked');
});
test('sitting down finds the nearest free seat within reach',()=>{
 const seats=[{id:'a',position:[1,0,0]},{id:'b',position:[2,0,0]},{id:'far',position:[9,0,0]}];
 assert.equal(nearestSeat(seats,{x:0,z:0}).id,'a');assert.equal(nearestSeat(seats,{x:0,z:0},new Set(['a'])).id,'b');
 assert.equal(nearestSeat(seats,{x:0,z:0},new Set(['a','b'])),null);
});
