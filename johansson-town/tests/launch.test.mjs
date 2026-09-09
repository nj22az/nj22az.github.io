import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createLauncher,watchdogDecision,GRAPHICS_ERROR,START_ERROR,LOADING_LIMIT_MS} from '../src/launch.js';

const root=resolve(new URL('..',import.meta.url).pathname);

function resetLaunch(){
  delete globalThis.__JOHANSSON_BOOTING__;
  delete globalThis.__JOHANSSON_RUNNING__;
  delete globalThis.__JOHANSSON_BOOT__;
}

function fakeFatal(){
  const classes=new Set(['hidden']);
  return {
    classList:{
      add(name){classes.add(name);},
      remove(name){classes.delete(name);},
      contains(name){return classes.has(name);}
    }
  };
}

test('pending boot does not report a graphics-engine failure at 25 seconds',async()=>{
  resetLaunch();
  const timers=[];
  let now=0;
  const boot={phase:'characters',detail:'yuri-playful',kind:null,startedAt:0,updatedAt:0};
  const ui={enter:{disabled:false},status:{textContent:''},fatal:fakeFatal(),fatalMessage:{textContent:GRAPHICS_ERROR}};
  let resolveBoot;
  const launch=createLauncher({
    now:()=>now,
    schedule:(fn,ms)=>{const id=timers.length;timers.push({fn,at:now+ms,id});return id;},
    clearSchedule:(id)=>{const timer=timers.find(t=>t.id===id);if(timer)timer.cleared=true;},
    importBoot:()=>new Promise(resolve=>{resolveBoot=resolve;}),
    isRunning:()=>false,
    getBoot:()=>boot
  });
  const pending=launch(ui);
  now=25000;
  for(const timer of [...timers])if(!timer.cleared&&timer.at<=now)timer.fn();
  assert.equal(ui.fatal.classList.contains('hidden'),true,'Loading must not open the fatal dialog');
  assert.notEqual(ui.fatalMessage.textContent,GRAPHICS_ERROR);
  assert.doesNotMatch(ui.status.textContent,/graphics engine/i);
  assert.match(ui.status.textContent,/characters|yuri|loading/i);
  boot.phase='world';boot.detail='Neighbourhood map';boot.updatedAt=now;
  now=50000;
  for(const timer of [...timers])if(!timer.cleared&&timer.at<=now)timer.fn();
  assert.equal(ui.fatal.classList.contains('hidden'),true);
  assert.match(ui.status.textContent,/world|neighbourhood|loading/i);
  resolveBoot();
  await pending;
  assert.equal(ui.fatal.classList.contains('hidden'),true);
  assert.equal(globalThis.__JOHANSSON_RUNNING__,true);
});

test('watchdog names a loading timeout instead of a graphics failure',()=>{
  const decision=watchdogDecision({
    running:false,
    boot:{phase:'world',detail:'Neighbourhood map'},
    elapsed:LOADING_LIMIT_MS
  });
  assert.equal(decision.action,'fatal');
  assert.doesNotMatch(decision.message,/graphics engine/i);
  assert.match(decision.message,/Neighbourhood map|world/i);
  assert.match(decision.message,/loading timeout/i);
});

test('actual WebGL failure keeps the graphics-engine message',async()=>{
  resetLaunch();
  const ui={enter:{disabled:false},status:{textContent:''},fatal:fakeFatal(),fatalMessage:{textContent:GRAPHICS_ERROR}};
  const launch=createLauncher({
    importBoot:async()=>{throw new Error('THREE.WebGLRenderer: Error creating WebGL context.');},
    schedule:()=>1,
    clearSchedule:()=>{},
    isRunning:()=>false
  });
  const error=console.error;console.error=()=>{};
  try{await launch(ui);}finally{console.error=error;}
  assert.equal(ui.fatal.classList.contains('hidden'),false);
  assert.equal(ui.fatalMessage.textContent,GRAPHICS_ERROR);
  assert.equal(ui.status.textContent,'GRAPHICS FAILED');
});

test('import failure replaces the graphics-engine message',async()=>{
  resetLaunch();
  const ui={enter:{disabled:false},status:{textContent:''},fatal:fakeFatal(),fatalMessage:{textContent:GRAPHICS_ERROR}};
  const launch=createLauncher({
    importBoot:async()=>{throw new Error('Failed to resolve module specifier ./boot.js');},
    schedule:()=>1,
    clearSchedule:()=>{},
    isRunning:()=>false
  });
  const error=console.error;console.error=()=>{};
  try{await launch(ui);}finally{console.error=error;}
  assert.equal(ui.fatal.classList.contains('hidden'),false);
  assert.equal(ui.fatalMessage.textContent,START_ERROR);
  assert.equal(ui.status.textContent,'START FAILED');
});

test('launcher and boot keep optional characters off the first-frame path',async()=>{
  const index=await readFile(resolve(root,'index.html'),'utf8');
  const boot=await readFile(resolve(root,'src/boot.js'),'utf8');
  assert.match(index,/createLauncher/);
  assert.match(index,/id="fatalMessage"/);
  assert.doesNotMatch(index,/Unable to start the graphics engine[\s\S]*25000/);
  assert.match(boot,/charactersReady/);
  const worldWait=boot.slice(boot.indexOf('await Promise.all'));
  assert.doesNotMatch(worldWait,/preloadCharacters/);
  assert.match(boot,/extras\.catch/);
});
