import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile(new URL('../offline.js',import.meta.url),'utf8')).replace('export function prepareOffline','function prepareOffline').replaceAll('import.meta.url',"'https://camera.test/camera/offline.js'");
class Events{
 listeners=new Map();
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,[]);this.listeners.get(name).push(fn);}
 async emit(name,event={}){await Promise.all((this.listeners.get(name)||[]).map(fn=>fn(event)));}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function setup(options={}){
 let now=1000,updates=0,reloads=0;
 const messages=[],registrations=[],events=new Events(),button=new Events(),caption={},icon={setAttribute(name,value){this[name]=value;}},document=new Events(),registration=new Events(),serviceWorker=new Events();
 Object.assign(button,{dataset:{},attrs:{},querySelector:selector=>selector==='use'?icon:caption,setAttribute(name,value){this.attrs[name]=value;}});
 Object.assign(document,{hidden:false,querySelector:()=>({src:'https://camera.test/camera/app.js?v=current'})});
 Object.assign(registration,{active:{},installing:options.installing||null,update:()=>{updates++;return options.update?.()||Promise.resolve(registration);}});
 const controller={postMessage:message=>messages.push(message)};
 Object.assign(serviceWorker,{controller,ready:Promise.resolve(registration),register:async(...args)=>{registrations.push(args);if(options.registerFails)throw Error('offline');return registration;}});
 const state={mode:'camera',edit:null,camera:{busy:false}},navigator={onLine:options.online!==false,serviceWorker};
 const context=vm.createContext({URL,WeakSet,Date:class extends Date{static now(){return now;}},window:{pocketCamera:{state}},navigator,document,location:{reload(){reloads++;}},addEventListener:events.addEventListener.bind(events)});
 vm.runInContext(source+'\nprepareOffline',context)(button,options.canReload?{canReload:options.canReload}:undefined);await tick();
 return {button,icon,caption,document,registration,serviceWorker,controller,state,navigator,messages,registrations,events,set now(value){now=value;},get updates(){return updates;},get reloads(){return reloads;},status:async(data,from=controller)=>serviceWorker.emit('message',{data:{type:'CAMERA_OFFLINE_STATUS',...data},source:from})};
}
test('verified version mismatch offers an explicit update and protects open/saving photos',async()=>{
 const env=await setup();assert.equal(env.registrations[0][1].updateViaCache,'none');
 await env.status({ready:true,version:'current'});assert.equal(env.button.dataset.state,'ready');assert.equal(env.button.disabled,true);assert.equal(env.caption.hidden,true);
 await env.status({ready:true,version:'new'});assert.equal(env.button.dataset.state,'update');assert.equal(env.button.disabled,false);assert.equal(env.caption.hidden,false);assert.equal(env.icon.href,'#i-update');assert.equal(env.reloads,0);
 env.state.mode='editor';env.state.edit={saving:false};await env.button.emit('click');assert.equal(env.reloads,0);assert.match(env.button.title,/Save or close/);
 env.state.mode='viewer';env.state.edit.saving=true;await env.button.emit('click');assert.equal(env.reloads,0);
 env.state.edit=null;env.state.mode='camera';env.state.camera.busy=true;await env.button.emit('click');assert.equal(env.reloads,0);
 env.state.camera.busy=false;await env.button.emit('click');assert.equal(env.reloads,1);
});
test('an installing release does not offer a premature refresh from the older controller',async()=>{
 const worker=new Events();worker.state='installing';const env=await setup({installing:worker});
 await env.status({ready:true,version:'old'});assert.equal(env.button.dataset.state,'preparing');assert.equal(env.reloads,0);
 env.registration.installing=null;worker.state='activated';await worker.emit('statechange');
 await env.status({ready:true,version:'current'});assert.equal(env.button.dataset.state,'ready');
 worker.state='redundant';await worker.emit('statechange');assert.equal(env.button.dataset.state,'ready','retirement of a previously activated worker is not a failed install');
});
test('online, page resume and visibility checks deduplicate and obey online/visible state',async()=>{
 let release;const env=await setup({update:()=>new Promise(resolve=>{release=resolve;})});
 env.now=62000;await env.events.emit('online');await env.events.emit('pageshow');await env.document.emit('visibilitychange');assert.equal(env.updates,1);
 release();await tick();env.now=63000;await env.events.emit('pageshow');assert.equal(env.updates,1,'a minute separates completed update checks');
 env.now=124000;env.navigator.onLine=false;await env.events.emit('online');assert.equal(env.updates,1);
 env.navigator.onLine=true;env.document.hidden=true;await env.events.emit('online');assert.equal(env.updates,1);
 env.document.hidden=false;await env.document.emit('visibilitychange');assert.equal(env.updates,2);release();await tick();
});
test('failed background checks retain a working offline bundle and are retried later',async()=>{
 const env=await setup({update:()=>Promise.reject(Error('network lost'))});await env.status({ready:true,version:'current'});
 env.now=62000;await env.events.emit('online');await tick();assert.equal(env.updates,1);assert.equal(env.button.dataset.state,'ready');assert.equal(env.reloads,0);
 env.now=124000;await env.events.emit('pageshow');await tick();assert.equal(env.updates,2);
});
test('explicit repair and offline retry keep the existing status protocol',async()=>{
 const env=await setup();await env.status({ready:false});await env.button.emit('click');assert.equal(env.updates,1);assert.equal(env.messages.at(-1).type,'CAMERA_OFFLINE_REPAIR');
 await env.status({ready:true,version:'current'});assert.equal(env.button.dataset.state,'ready');
 await env.status({ready:false});env.navigator.onLine=false;await env.button.emit('click');assert.equal(env.updates,1);assert.match(env.button.title,/Connect/);
 const failed=await setup({registerFails:true});assert.equal(failed.button.dataset.state,'retry');
});
test('a caller can protect imports and delayed replies cannot replace current-worker status',async()=>{
 let importing=true;const env=await setup({canReload:()=>!importing});
 await env.status({ready:true,version:'new'});await env.button.emit('click');assert.equal(env.reloads,0);
 await env.status({ready:true,version:'current'},{});assert.equal(env.button.dataset.state,'update','old-controller replies are ignored');
 importing=false;await env.button.emit('click');assert.equal(env.reloads,1);
});

test('an app started offline checks immediately when connectivity returns',async()=>{
 const env=await setup({online:false});env.navigator.onLine=true;await env.events.emit('online');await tick();assert.equal(env.updates,1);
});
