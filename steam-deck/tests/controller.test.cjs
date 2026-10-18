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
test('Deck prompts name physical Menu/View/shoulder controls and follow remapping',async()=>{
 const {buttonGlyph,profileSettings}=await load(),profile=profileSettings({});assert.equal(buttonGlyph(9,profile,'Steam Deck'),'☰');assert.equal(buttonGlyph(8,profile,'Steam Deck'),'▣');assert.equal(buttonGlyph(4,profile,'Steam Deck'),'R2');profile.bindings[9]=6;assert.equal(buttonGlyph(9,profile),'L2');assert.equal(buttonGlyph(4,{glyphs:'xbox'}),'RT');
});
test('D-pad follows the visible grid, preserves rows and stops at an edge',async()=>{
 const {directionalIndex}=await import('../ui/menu-navigation.mjs');const rects=[{left:0,top:0,width:100,height:40},{left:120,top:0,width:100,height:40},{left:0,top:60,width:100,height:40},{left:120,top:60,width:100,height:40}];assert.equal(directionalIndex(rects,0,'right'),1);assert.equal(directionalIndex(rects,0,'down'),2);assert.equal(directionalIndex(rects,1,'down'),3);assert.equal(directionalIndex(rects,0,'left'),0);assert.equal(directionalIndex(rects,3,'right'),3);
});

test('auto-detected controller symbols preserve physical positions and fall back to a highlighted diamond',async()=>{
 const {controllerFamily,buttonGlyph,buttonPrompt,profileSettings}=await load();
 assert.equal(controllerFamily('DualSense Wireless Controller (054c-0ce6)'),'playstation');
 assert.equal(buttonGlyph(1,{},'DualSense'),'○');assert.equal(buttonGlyph(0,{},'DualSense'),'×');
 assert.equal(buttonGlyph(0,{},'Nintendo Switch Pro Controller'),'B');assert.equal(buttonGlyph(1,{},'Nintendo Switch Pro Controller'),'A');
 assert.equal(buttonGlyph(5,{},'Xbox Wireless'),'X');assert.equal(buttonGlyph(4,{},'Steam Deck'),'R2');assert.equal(buttonGlyph(7,{},'Steam Deck'),'L2');
 const unknown=buttonPrompt(1,{},'Generic USB Controller');assert.match(unknown,/Right face button/);assert.equal((unknown.match(/<circle/g)||[]).length,4);assert.equal((unknown.match(/#e84d6b/g)||[]).length,1);
 assert.equal(buttonGlyph(1,{glyphs:'playstation'},'Generic USB'),'○');
 const saved=Array.from({length:17},(_,i)=>i);assert.deepEqual(profileSettings({bindings:saved}).bindings,saved,'Existing custom layouts are preserved');
});

test('desktop menu directions use physical D-pad, independent of HUD and camera remaps',async()=>{
 const {createDesktopInput}=await load(),{createMenuRepeat}=await import('../../johansson-town/src/input/analogue.js'),p=pad(),input=createDesktopInput(()=>({}));input.sample([p]);p.buttons[13].pressed=true;
 const frame=input.sample([p]);assert.equal(frame.held[10],true,'D-pad down still toggles HUD in play');assert.equal(frame.held[13],false);assert.equal(createMenuRepeat()(frame,1/60),'down','The same physical Down navigates menus');
});
test('controller activity hides cursor, idle/drift does not; genuine mouse movement restores it',async()=>{
 const {createInputMode}=await import('../ui/input-mode.mjs'),changes=[],mode=createInputMode(value=>changes.push(value)),frame={move:{x:.1,y:.1},look:{x:0,y:0}};
 mode.pad(frame,[]);assert.equal(mode.mode,'pointer');mode.pad(frame,[true]);assert.equal(mode.mode,'controller');mode.pointer({pointerType:'mouse',clientX:100,clientY:100});mode.pointer({pointerType:'mouse',clientX:101,clientY:100});assert.equal(mode.mode,'controller');mode.pointer({pointerType:'mouse',clientX:110,clientY:100});assert.equal(mode.mode,'pointer');mode.pad(frame,[]);assert.equal(mode.mode,'pointer');mode.pad({...frame,look:{x:.8,y:0}},[]);assert.equal(mode.mode,'controller');assert.deepEqual(changes,['controller','pointer','controller']);
});
