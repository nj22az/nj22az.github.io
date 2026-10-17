const {test}=require('node:test'),assert=require('node:assert/strict');
const load=()=>import('../ui/controller.mjs');
const pad=(mapping='standard')=>({id:'Test controller',index:0,connected:true,mapping,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
test('Linux sticks respond on connection even with drift or a held button; buttons require a fresh press',async()=>{
 const {createDesktopInput}=await load(),input=createDesktopInput(()=>({})),p=pad('');
 p.axes=[.35,-.8,.7,-.3];p.buttons[0].pressed=true;
 let frame=input.sample([p]);assert.ok(frame.connected);assert.ok(frame.move.y<-.5);assert.ok(frame.look.x>.5);assert.equal(frame.pressed[0],false);
 input.suspend();assert.equal(input.sample([p]).pressed[0],false);
 p.buttons[0].pressed=false;input.sample([p]);p.buttons[0].pressed=true;assert.equal(input.sample([p]).pressed[0],true);
 assert.deepEqual(input.sample([]).move,{x:0,y:0});assert.equal(input.sample([p]).pressed[0],false);
});
test('custom axes and buttons drive the same canonical game and menu actions',async()=>{
 const {createDesktopInput,profileSettings}=await load(),settings=profileSettings({moveAxes:[2,3],lookAxes:[0,1]});settings.bindings[9]=6;settings.bindings[6]=9;
 const input=createDesktopInput(()=>settings),p=pad('');input.sample([p]);p.axes=[.8,0,0,-1];p.buttons[6].pressed=true;
 const frame=input.sample([p]);assert.equal(frame.move.y,-1);assert.ok(frame.look.x>.7);assert.equal(frame.pressed[9],true);assert.equal(frame.pressed[6],false);
});
test('dead zone removes drift, diagonals stay bounded, missing axes stay neutral',async()=>{
 const {createDesktopInput,radialStick,profileSettings}=await load();
 assert.deepEqual(radialStick(.1,-.1,.2),{x:0,y:0});const diagonal=radialStick(1,1);assert.ok(Math.hypot(diagonal.x,diagonal.y)<=1.00001);
 const p=pad();p.axes=[];assert.deepEqual(createDesktopInput(()=>({})).sample([p]).look,{x:0,y:0});
 assert.deepEqual(profileSettings({moveAxes:[NaN,-1],bindings:[Infinity]}).moveAxes,[0,1]);
});
test('selected controller and hotplug keep the active device stable',async()=>{
 const {createDesktopInput}=await load(),a=pad(),b=pad('');a.id='Deck';b.id='USB pad';b.index=2;
 const input=createDesktopInput(()=>({controller:'USB pad'}));b.axes[1]=-1;
 assert.equal(input.read([a,b]).pad.id,'USB pad');assert.equal(input.sample([a,b]).move.y,-1);
 assert.equal(input.read([b,a]).pad.id,'USB pad');b.connected=false;assert.equal(input.read([a,b]).pad.id,'Deck');
});
