import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createPropFactory} from '../prop-factory.js';
import {addSakuraFlyer} from '../src/world/sakura-flyers.js';
import {WOODLAND_POSTER,addWoodlandPoster} from '../src/world/woodland-poster.js';
import {FLYER_ITEM} from '../src/commerce/sakura-flyer.js';
import {createActivities} from '../activities.js';
import {installDOM,Element} from './fixtures.mjs';
import {coplanarOverlaps} from '../tools/z-fighting.mjs';

/** A small DOM/history fixture exercises the real Activities action and cleanup. */
function viewerDOM(href='https://nj22az.github.io/johansson-town/',{asyncHistory=false,origin=new URL(href).origin}={}){
 const dom=installDOM(),frames=[],events=new Map(),docEvents=new Map(),made=document.createElement;
 globalThis.location={href,origin};
 const emit=(kind,event)=>{for(const fn of [...(events.get(kind)||[])])fn(event);};
 window.addEventListener=(kind,fn)=>{if(!events.has(kind))events.set(kind,new Set());events.get(kind).add(fn);};
 window.removeEventListener=(kind,fn)=>events.get(kind)?.delete(fn);
 document.addEventListener=(kind,fn)=>{if(!docEvents.has(kind))docEvents.set(kind,[]);docEvents.get(kind).push(fn);};
 document.createElement=tag=>{
  const el=made(tag);el.tagName=tag.toUpperCase();
  if(tag==='iframe'){
   el.contentWindow={};el.attributes=new Map();
   el.setAttribute=(name,value)=>el.attributes.set(name,value);
   el.getAttribute=name=>el.attributes.get(name);
   el.remove=()=>{el.removed=true;const body=document.querySelector('#activityBody');body.children=body.children.filter(child=>child!==el);};
   frames.push(el);
  }
  return el;
 };
 const entries=[{world:'retained'}],pendingBack=[];let index=0,backCalls=0;
 const traverseBack=()=>{if(index>0){index--;emit('popstate',{state:entries[index]});}};
 window.history={
  get state(){return entries[index];},
  pushState(state,_title,url){assert.equal(url,href);entries.splice(index+1);entries.push(state);index++;},
  back(){backCalls++;if(asyncHistory)pendingBack.push(new Promise(resolve=>setTimeout(()=>{traverseBack();resolve();},0)));else traverseBack();}
 };
 const acts=createActivities({say(){},onWeather(){},onTime(){}});
 const open=()=>{acts.action('harbour-notice-board');dom.button('Look');return frames.at(-1);};
 const message=(frame,type,overrides={})=>emit('message',{
  source:frame.contentWindow,origin,
  data:{type,token:new URL(frame.src).searchParams.get('token')},...overrides
 });
 return {...dom,acts,frames,events,docEvents,open,message,history:window.history,get backCalls(){return backCalls;},async settleHistory(){while(pendingBack.length)await Promise.all(pendingBack.splice(0));}};
}

test('the woodland sheet fits the existing board beside Thuan’s flyer and is directly pickable',()=>{
 installDOM();
 const root=new THREE.Group(),factory=createPropFactory({shadows:false}),board=factory.noticeBoard(5.5,-33.2,0);
 root.add(board.object);
 const flyer=addSakuraFlyer(root,{position:[5.87,1.55,-33.115],width:.43}),registered=[],actions=[];
 const poster=addWoodlandPoster(root,{register:(o,label,fn)=>{o.userData.hit={label,fn};registered.push(o);},onAction:(...args)=>actions.push(args)});
 root.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(poster),flyerBox=new THREE.Box3().setFromObject(flyer);
 assert.ok(box.min.x>=5.5-1.48/2&&box.max.x<=5.5+1.48/2,'Within the real board width');
 assert.ok(box.min.y>=1.55-1.1/2&&box.max.y<=1.55+1.1/2,'Within the real board height');
 assert.ok(box.max.x<flyerBox.min.x,'The existing flyer remains fully visible');
 assert.ok(box.min.z>-33.2+.05,'Paper is in front of the board, with a physical gap');
 const print=poster.getObjectByName('Johansson woodland poster print');
 assert.equal(print.geometry.parameters.width/print.geometry.parameters.height,1.5);
 assert.equal(print.material.type,'MeshBasicMaterial');assert.equal(print.material.toneMapped,false);
 assert.equal(registered[0],poster);assert.equal(poster.userData.hit.label,WOODLAND_POSTER.prompt);
 poster.userData.hit.fn();assert.deepEqual(actions,[['harbour-notice-board']]);
 assert.equal(board.collider.w,1.55,'No new obstruction or enlarged board');
 factory.dispose();
});

test('the woodland paper and print remain separated beyond the town’s depth tolerance',()=>{
 const root=new THREE.Group(),poster=addWoodlandPoster(root);
 const scan=()=>coplanarOverlaps(root,{tolerance:.002,minArea:.05});
 assert.deepEqual(scan(),[],'The printed face must not fight its backing');
 // Sensitivity: the old 2 mm gap rounds just below the threshold in Float32.
 poster.getObjectByName('Woodland poster paper').position.z=-.005;
 const fault=scan();
 assert.equal(fault.length,1);assert.ok(fault[0].area>.25);
 assert.match(fault[0].a+fault[0].b,/Woodland poster paper/);
});

test('one board menu offers Look and retains the existing free shop flyer without creating a viewer',()=>{
 const dom=viewerDOM();dom.acts.action('harbour-notice-board');
 assert.deepEqual(dom.labels(),['Look','Read Thuan’s flyer','Close']);
 assert.equal(dom.acts.viewerActive,false);assert.equal(dom.frames.length,0);
 const image=document.querySelector('#activityBody').children.find(el=>el.tagName==='IMG');
 assert.equal(image.src,WOODLAND_POSTER.image);
 dom.button('Read Thuan’s flyer');assert.match(document.querySelector('#activityTitle').textContent,/Sakura Shop/);
 assert.ok(dom.has('Take a free copy'));assert.ok(dom.has('Other harbour notices'));
 dom.button('Take a free copy');assert.deepEqual(dom.acts.state.inventory,[FLYER_ITEM]);
 assert.equal(dom.has('Take a free copy'),false);assert.equal(dom.frames.length,0);
 dom.acts.close();assert.equal(dom.acts.paused,false);
});

test('Look opens only the local embedded viewer; messages require the current source, origin and token',()=>{
 const dom=viewerDOM(),opener=new Element();opener.focus();
 const frame=dom.open(),url=new URL(frame.src),token=url.searchParams.get('token');
 assert.equal(url.pathname,'/johansson-town/diorama/woodland/index.html');
 assert.equal(url.origin,new URL(location.href).origin);assert.equal(url.searchParams.get('embedded'),'1');assert.ok(token);
 assert.equal(dom.frames.length,1);assert.equal(dom.acts.paused,true);assert.equal(dom.acts.viewerActive,true);
 assert.equal(dom.history.state.world,'retained');assert.equal(dom.history.state.johanssonDiorama,token);
 assert.ok(document.querySelector('#activity').classList.contains('woodland-view'));
 for(const override of [
  {source:{}},{origin:'https://example.invalid'},
  {data:{type:'johansson-diorama-close',token:'wrong'}}
 ])dom.message(frame,'johansson-diorama-close',override);
 assert.equal(dom.acts.viewerActive,true,'Other frames/pages and stale tokens cannot close World’s view');
 dom.message(frame,'johansson-diorama-ready');assert.equal(frame.getAttribute('aria-busy'),'false');
 dom.message(frame,'johansson-diorama-close');
 assert.equal(dom.acts.viewerActive,false);assert.equal(dom.acts.paused,false);assert.equal(frame.removed,true);
 assert.equal(dom.events.get('message').size,0);assert.equal(dom.events.get('popstate').size,0);
 assert.deepEqual(dom.history.state,{world:'retained'});assert.equal(dom.backCalls,1);
 assert.equal(document.activeElement,opener,'Closing returns focus to the original game control');
});

test('browser Back closes the diorama once and repeated opens leave no frames or listeners running',()=>{
 const dom=viewerDOM();
 const first=dom.open();dom.history.back();
 assert.equal(first.removed,true);assert.equal(dom.acts.viewerActive,false);assert.equal(dom.acts.paused,false);
 assert.equal(dom.backCalls,1,'The popstate close must not call Back for a second time');
 const second=dom.open();dom.acts.close();
 assert.equal(second.removed,true);assert.equal(dom.backCalls,2);assert.equal(dom.frames.length,2);
 assert.ok(dom.frames.every(frame=>frame.removed));
 assert.equal(dom.events.get('message').size,0);assert.equal(dom.events.get('popstate').size,0);
});

test('a quick reopen survives the previous viewer’s asynchronous Back and still supports browser Back',async()=>{
 const dom=viewerDOM(undefined,{asyncHistory:true}),first=dom.open();
 const firstToken=new URL(first.src).searchParams.get('token');
 dom.acts.close();
 assert.equal(first.removed,true);assert.equal(dom.history.state.johanssonDiorama,firstToken,'Back has not traversed yet');
 const second=dom.open(),secondToken=new URL(second.src).searchParams.get('token');
 assert.notEqual(secondToken,firstToken);assert.equal(dom.acts.viewerActive,true);
 assert.equal(dom.history.state.johanssonDiorama,firstToken,'The next marker waits for the pending traversal');
 dom.message(first,'johansson-diorama-close');assert.equal(dom.acts.viewerActive,true);
 await dom.settleHistory();
 assert.equal(dom.acts.viewerActive,true);assert.equal(second.removed,undefined);
 assert.equal(dom.history.state.johanssonDiorama,secondToken);assert.equal(dom.backCalls,1);
 assert.equal(dom.events.get('message').size,1);assert.equal(dom.events.get('popstate').size,1);
 dom.history.back();await dom.settleHistory();
 assert.equal(second.removed,true);assert.equal(dom.acts.paused,false);assert.equal(dom.backCalls,2);
 assert.deepEqual(dom.history.state,{world:'retained'});
 assert.equal(dom.events.get('message').size,0);assert.equal(dom.events.get('popstate').size,0);
});

test('a replacement activity destroys the viewer and survives delayed messages and history traversal',async()=>{
 const dom=viewerDOM(undefined,{asyncHistory:true}),frame=dom.open();
 dom.acts.menu('Town notes','The next activity',[['Close',dom.acts.close]]);
 assert.equal(frame.removed,true);assert.equal(dom.acts.viewerActive,false);assert.equal(dom.acts.paused,true);
 assert.equal(document.querySelector('#activity').classList.contains('woodland-view'),false);
 dom.message(frame,'johansson-diorama-close');
 assert.equal(document.querySelector('#activityTitle').textContent,'Town notes');assert.equal(dom.acts.paused,true);
 await dom.settleHistory();
 assert.equal(document.querySelector('#activityTitle').textContent,'Town notes');assert.equal(dom.acts.paused,true);
 assert.equal(dom.events.get('message').size,0);assert.equal(dom.events.get('popstate').size,0);
 dom.acts.close();assert.equal(dom.backCalls,1);
});

test('Escape leaves the viewer through normal modal cleanup',()=>{
 const dom=viewerDOM(),frame=dom.open();let prevented=false;
 dom.docEvents.get('keydown').at(-1)({code:'Escape',preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(frame.removed,true);assert.equal(dom.acts.paused,false);
 assert.equal(dom.acts.viewerActive,false);assert.equal(dom.backCalls,1);
});

test('the same relative viewer works on the offline desktop origin',()=>{
 const dom=viewerDOM('johansson://world/johansson-town/?desktop=1'),frame=dom.open();
 assert.ok(frame.src.startsWith('johansson://world/johansson-town/diorama/woodland/index.html?'));
 dom.message(frame,'johansson-diorama-ready');assert.equal(frame.getAttribute('aria-busy'),'false');
 dom.message(frame,'johansson-diorama-close');assert.equal(frame.removed,true);assert.equal(dom.acts.paused,false);
});

test('the registered desktop document origin takes precedence over the URL parser’s opaque origin',()=>{
 const href='johansson://world/johansson-town/?desktop=1';
 assert.equal(new URL(href).origin,'null');
 const dom=viewerDOM(href,{origin:'johansson://world'}),frame=dom.open();
 dom.message(frame,'johansson-diorama-ready',{origin:'null'});assert.equal(frame.getAttribute('aria-busy'),'true');
 dom.message(frame,'johansson-diorama-ready');assert.equal(frame.getAttribute('aria-busy'),'false');
 dom.message(frame,'johansson-diorama-close');assert.equal(frame.removed,true);assert.equal(dom.acts.paused,false);
});
