// Connection/transaction fault injection. Real IndexedDB round trips live in album.browser.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile(new URL('../album.js',import.meta.url),'utf8')).replaceAll(/export (async )?function /g,'$1function ').replaceAll('export const ','const ').replaceAll('import.meta.url',"'https://camera.test/camera/album.js'");
const tick=()=>new Promise(r=>setImmediate(r));
const error=name=>new DOMException(name,name);
function fixture(options={}){
 const timers=new Map();let timerID=0;
 const state={opens:[],handles:[],transactions:[],writes:[],rows:options.rows||[{id:'old',created:1}],failRead:options.failRead||0,failWrite:options.failWrite||false};
 const names=new Set(options.stores||['shots','stickers','metadata']);
 function handle(){
  const d={closed:false,version:options.version||3,objectStoreNames:{contains:n=>names.has(n)},createObjectStore:n=>names.add(n),close(){d.closed=true;},transaction(stores,mode,hints){
   if(d.closed)throw error('InvalidStateError');
   if(options.legacyOptions&&hints)throw new TypeError('No transaction options');
   if(options.startError){const name=options.startError;options.startError=null;throw error(name);}
   const tx={mode,hints,operations:[],error:null,aborted:false,pending:0,abort(){if(tx.aborted)return;tx.aborted=true;setImmediate(()=>tx.onabort?.());},objectStore(name){return {
    getAll:()=>request('getAll',null,name),get:id=>request('get',id,name),add:row=>request('add',row,name),put:row=>request('put',row,name),delete:id=>request('delete',id,name)
   };}};
   state.transactions.push(tx);
   function request(kind,value,name){
    if(options.syncThrow&&kind==='add')throw error('DataCloneError');
    const r={result:undefined,error:null};tx.pending++;tx.operations.push({kind,value,name});
    if(options.hangTransaction)return r;
    setImmediate(()=>{
     if(tx.aborted)return;
     if((mode==='readonly'&&state.failRead-->0)||(mode==='readwrite'&&state.failWrite)){
      r.error=tx.error=error(mode==='readonly'?'UnknownError':'QuotaExceededError');tx.onerror?.({target:r});tx.abort();return;
     }
     r.result=kind==='getAll'?(name==='shots'?state.rows:[]):kind==='get'?state.rows.find(x=>x.id===value):value?.id;
     r.onsuccess?.();tx.pending--;
     if(options.lateAbort){tx.error=error('AbortError');tx.abort();return;}
     setImmediate(()=>{if(!tx.aborted&&!tx.pending&&!tx.completed){tx.completed=true;if(mode==='readwrite')state.writes.push(...tx.operations);tx.oncomplete?.();}});
    });return r;
   }
   return tx;
  }};state.handles.push(d);return d;
 }
 const indexedDB={open(name,version){
  const r={result:null,error:null,transaction:{abort(){r.aborted=true;}}};state.opens.push({name,version,r});
  if(options.syncOpen){const name=options.syncOpen;options.syncOpen=null;throw error(name);}
  setImmediate(()=>{
   if(options.block){options.block=false;r.onblocked?.();return;}
   if(options.hang)return;
   if(options.openError){const name=options.openError;options.openError=null;r.error=error(name);r.onerror?.();return;}
   r.result=handle();if(options.upgrade){options.upgrade=false;r.onupgradeneeded?.();}
   if(!r.aborted)r.onsuccess?.();
  });return r;
 }};
 const context=vm.createContext({indexedDB,DOMException,Blob,URL,console,Date,Math,crypto:{randomUUID:()=>options.id||'generated-id'},navigator:{storage:options.storage},fetch:async()=>({ok:true,blob:async()=>new Blob(['image'],{type:'image/png'})}),setTimeout(fn){const id=++timerID;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}});
 const api=vm.runInContext(source+'\n({listShots,getShot,addShot,updateShot,listMine,keepAlbum,snapshotAlbum,restoreAlbum,ensureAlbumSamples})',context);
 return {api,state,options,timers,expire(){for(const fn of [...timers.values()])fn();}};
}
test('existing schema and name remain; reads keep old records',async()=>{
 const f=fixture(),rows=await f.api.listShots();assert.equal(rows[0].id,'old');assert.deepEqual(f.state.opens.map(x=>[x.name,x.version]),[['office-pocket-camera',3]]);assert.equal(f.state.writes.length,0);
});
test('version-1 upgrade only creates missing stores and retains rows',async()=>{
 const f=fixture({stores:['shots'],upgrade:true}),rows=await f.api.listShots();assert.equal(rows[0].id,'old');assert.equal(f.state.handles[0].objectStoreNames.contains('metadata'),true);assert.equal(f.state.handles[0].objectStoreNames.contains('stickers'),true);
});
test('newer schema is opened without a downgrade after VersionError',async()=>{
 const f=fixture({openError:'VersionError',version:4});assert.equal((await f.api.listShots()).length,1);assert.deepEqual(f.state.opens.map(x=>x.version),[3,undefined]);
});
test('a newer schema remains exportable but cannot be modified by an older app',async()=>{
 const f=fixture({openError:'VersionError',version:4});assert.equal((await f.api.snapshotAlbum()).shots[0].id,'old');await assert.rejects(f.api.addShot({photo:new Blob(['photo'])}),{name:'VersionError'});assert.equal(f.state.writes.length,0);
});
test('missing required stores fail visibly and are never reset',async()=>{
 const f=fixture({stores:['unknown']});await assert.rejects(f.api.listShots(),{name:'NotFoundError'});assert.equal(f.state.handles[0].closed,true);assert.equal(f.state.writes.length,0);
});
test('blocked open rejects; the next explicit call can open preserved rows',async()=>{
 const f=fixture({block:true});await assert.rejects(f.api.listShots(),{name:'BlockedError'});assert.equal((await f.api.listShots())[0].id,'old');assert.equal(f.state.opens.length,2);
});
test('late success after blocked open closes obsolete handle, not current one',async()=>{
 const f=fixture({block:true});await assert.rejects(f.api.listShots(),{name:'BlockedError'});await f.api.listShots();const current=f.state.handles[0],old=f.state.opens[0].r;
 old.result={close(){this.closed=true;}};old.onsuccess();assert.equal(old.result.closed,true);assert.equal(current.closed,false);await f.api.listShots();assert.equal(f.state.opens.length,2);
});
test('synchronous open failure does not cache a rejected promise',async()=>{
 const f=fixture({syncOpen:'SecurityError'});await assert.rejects(f.api.listShots(),{name:'SecurityError'});assert.equal((await f.api.listShots())[0].id,'old');
});
test('hung open is bounded and a subsequent call can recover',async()=>{
 const f=fixture({hang:true});const pending=f.api.listShots();await tick();f.expire();await tick();f.expire();await assert.rejects(pending,{name:'TimeoutError'});f.options.hang=false;assert.equal((await f.api.listShots())[0].id,'old');
});
test('transient transaction start failure reopens only once',async()=>{
 const f=fixture({startError:'InvalidStateError'});assert.equal((await f.api.listShots())[0].id,'old');assert.equal(f.state.opens.length,2);assert.equal(f.state.handles[0].closed,true);
});
test('readonly UnknownError retries on a fresh handle',async()=>{
 const f=fixture({failRead:1});assert.equal((await f.api.listShots())[0].id,'old');assert.equal(f.state.opens.length,2);assert.equal(f.state.transactions.length,2);assert.equal(f.state.handles[0].closed,true);
});
test('repeated readonly failure stops after one retry',async()=>{
 const f=fixture({failRead:4});await assert.rejects(f.api.listShots(),{name:'UnknownError'});assert.equal(f.state.opens.length,2);assert.equal(f.state.transactions.length,2);
});
test('late old close event cannot discard the replacement handle',async()=>{
 const f=fixture({failRead:1});await f.api.listShots();f.state.handles[0].onclose();await f.api.listShots();assert.equal(f.state.opens.length,2);assert.equal(f.state.handles[1].closed,false);
});
test('version change closes the handle and next read reopens',async()=>{
 const f=fixture();await f.api.listShots();f.state.handles[0].onversionchange();await f.api.listShots();assert.equal(f.state.opens.length,2);
});
test('writes resolve only at completion and ask for strict durability',async()=>{
 const f=fixture();const pending=f.api.addShot({photo:new Blob(['photo'])});let saved=false;pending.then(()=>saved=true);await tick();assert.equal(saved,false);const row=await pending;assert.equal(row.id,'generated-id');assert.equal(f.state.transactions[0].hints.durability,'strict');assert.equal(f.state.writes[0].kind,'add');
});
test('legacy transaction options fall back without changing operation',async()=>{
 const f=fixture({legacyOptions:true});await f.api.addShot({photo:new Blob(['photo'])});assert.equal(f.state.transactions[0].hints,undefined);assert.equal(f.state.writes[0].kind,'add');
});
test('quota failure reports failure and never replays the write',async()=>{
 const f=fixture({failWrite:true});await assert.rejects(f.api.addShot({photo:new Blob(['photo'])}),{name:'QuotaExceededError'});assert.equal(f.state.transactions.length,1);assert.equal(f.state.writes.length,0);
});
test('synchronous request failure aborts rather than committing partial work',async()=>{
 const f=fixture({syncThrow:true});await assert.rejects(f.api.addShot({photo:new Blob(['photo'])}),{name:'DataCloneError'});assert.equal(f.state.transactions[0].aborted,true);assert.equal(f.state.writes.length,0);
});
test('updating a missing record cannot create a partial photo',async()=>{
 const f=fixture();await assert.rejects(f.api.updateShot('absent',{recipe:{}}),{name:'NotFoundError'});assert.equal(f.state.writes.length,0);
});
test('snapshot uses one transaction across all original stores',async()=>{
 const f=fixture(),snapshot=await f.api.snapshotAlbum();assert.equal(snapshot.shots[0].id,'old');assert.equal(snapshot.stickers.length,0);assert.equal(snapshot.metadata.length,0);assert.equal(f.state.transactions.length,1);
});
test('restore adds within one transaction without using put',async()=>{
 const f=fixture();const counts=await f.api.restoreAlbum({shots:[{id:'restore'}],stickers:[{id:'mine:restore'}],metadata:[]});assert.equal(counts.shots,1);assert.equal(counts.stickers,1);assert.equal(f.state.transactions.length,1);assert.equal(f.state.writes.filter(x=>x.kind==='add').length,2);assert.equal(f.state.writes.some(x=>x.kind==='put'),false);
});
test('persistence result is checked and rejected requests do not escape',async()=>{
 const f=fixture({storage:{persisted:async()=>false,persist:async()=>false}});assert.equal((await f.api.keepAlbum()).persisted,false);
 f.options.storage={};const broken=fixture({storage:{persisted:async()=>false,persist:async()=>{throw error('NotAllowedError');}}});assert.equal((await broken.api.keepAlbum()).persisted,false);
 const granted=fixture({storage:{persisted:async()=>true,persist:async()=>{throw Error('should not ask');}}});assert.equal((await granted.api.keepAlbum()).persisted,true);assert.equal((await fixture().api.keepAlbum()).supported,false);
});

test('request success followed by abort must not announce a saved photograph',async()=>{
 const f=fixture({lateAbort:true});await assert.rejects(f.api.addShot({photo:new Blob(['photo'])}),{name:'AbortError'});assert.equal(f.state.transactions.length,1);assert.equal(f.state.writes.length,0);
});
test('a hung write is bounded, aborted, and is never replayed',async()=>{
 const f=fixture({hangTransaction:true});const pending=f.api.addShot({photo:new Blob(['photo'])});await tick();f.expire();await assert.rejects(pending,{name:'TimeoutError'});assert.equal(f.state.transactions.length,1);assert.equal(f.state.transactions[0].aborted,true);assert.equal(f.state.writes.length,0);
});
test('concurrent readers share one initial open',async()=>{
 const f=fixture();await Promise.all([f.api.listShots(),f.api.listMine(),f.api.snapshotAlbum()]);assert.equal(f.state.opens.length,1);
});
