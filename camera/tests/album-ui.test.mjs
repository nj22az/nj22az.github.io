// Run the real album UI/controller source with fault-injected storage and a small DOM.
// These checks complement, rather than replace, the browser suite's rendering/IndexedDB checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {normalRecipe,LOOKS} from '../looks-gl.js';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const album=app.slice(app.indexOf('// ---------- Album ----------'),app.indexOf('\nfunction show(mode)',app.indexOf('// ---------- Album ----------')));
const deletion=app.slice(app.indexOf("$('deletePhoto').addEventListener"),app.indexOf('// ---------- Editor ----------'));
const openAlbum=app.match(/^function openAlbum\(\).*$/m)[0];
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const tick=()=>new Promise(r=>setImmediate(r));
const photo=id=>({id,photo:new Blob([id],{type:'image/png'}),created:1234,recipe:{layers:[{look:'none',amount:1}]}});
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners=new Map();this.dataset={};this.attrs={};this.hidden=false;this.disabled=false;this.classes=new Set();this.classList={add:(...names)=>names.forEach(n=>this.classes.add(n)),remove:(...names)=>names.forEach(n=>this.classes.delete(n)),contains:n=>this.classes.has(n)};}
 set textContent(text){this._textContent=text;this.children=[];}
 get textContent(){return this._textContent||'';}
 append(...children){for(const c of children){c.parent=this;this.children.push(c);}}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
 removeAttribute(name){delete this.attrs[name];delete this[name];}
 setAttribute(name,value){this.attrs[name]=value;}
 querySelector(selector){return this.children.find(c=>c.tagName===selector);}
 addEventListener(name,fn){this.listeners.set(name,[...(this.listeners.get(name)||[]),fn]);}
 async emit(name,event={}){await Promise.all((this.listeners.get(name)||[]).map(fn=>fn(event)));}
 click(){return this.emit('click');}
}
function fixture(options={}){
 const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 get('roll').append(new Element('img'));
 const state={mode:'album',shots:[],viewing:null},calls={reads:0,seeds:0,adds:0,deletes:0,urls:[],revoked:[],toasts:[],confirmation:null};
 const context=vm.createContext({Blob,Date,URL:{createObjectURL(blob){assert.ok(blob instanceof Blob);const url='blob:fixture-'+calls.urls.length;calls.urls.push({url,blob});return url;},revokeObjectURL:url=>calls.revoked.push(url)},navigator:{standalone:!!options.standalone},location:{origin:'https://camera.test'},matchMedia:()=>({matches:false}),document:{createElement:tag=>new Element(tag)},$:get,state,normalRecipe,mixLabel:r=>r.layers.map(l=>LOOKS[l.look]?.short||l.look).join(' + '),listShots:async()=>{calls.reads++;return options.read?options.read():options.rows||[];},addShot:async row=>{calls.adds++;return options.add?options.add(row):{...row,id:'new',created:1235};},deleteShot:async id=>{calls.deletes++;if(options.deleteError)throw options.deleteError;},keepAlbum:async()=>({supported:true,persisted:false}),ensureAlbumSamples:async()=>{calls.seeds++;},makeAlbumBackup:async()=>new Blob(['backup']),restoreAlbumBackup:async()=>({added:0,stickersAdded:0,skipped:0,stickersSkipped:0}),loadMine:async()=>{},show:mode=>{state.mode=mode;},toast:text=>calls.toasts.push(text),confirmDelete:(message,label,then)=>{calls.confirmation=then;},console});
 const api=vm.runInContext(album+'\n'+openAlbum+'\n'+deletion+'\n({refreshShots,loadShots,keep,renderGrid,renderRoll,openAlbum,get reading(){return albumReading;},get ok(){return albumOK;},get revision(){return albumRevision;}})',context);
 return {api,elements,get,state,calls,options};
}
test('startup read failure shows unavailable state rather than an empty album',async()=>{
 const f=fixture({read:async()=>{throw new DOMException('closed','SecurityError');}});await f.api.loadShots();
 assert.equal(f.api.ok,false);assert.equal(f.get('albumStatus').dataset.state,'error');assert.match(f.get('albumStatusMessage').textContent,/could not be read.*SecurityError/);assert.equal(f.get('albumEmpty').hidden,true);assert.equal(f.get('albumRetry').hidden,false);assert.equal(f.get('albumBackup').disabled,true);assert.equal(f.calls.seeds,0);assert.match(f.get('roll').attrs['aria-label'],/Album unavailable/);
});
test('a later successful retry displays preserved records',async()=>{
 const f=fixture({read:async()=>{throw new DOMException('closed','SecurityError');}});await f.api.refreshShots();f.options.read=async()=>[photo('old')];await f.api.refreshShots();
 assert.equal(f.api.ok,true);assert.equal(f.get('albumStatus').dataset.state,'ready');assert.equal(f.get('albumStatus').hidden,true);assert.equal(f.get('albumEmpty').hidden,true);assert.equal(f.state.shots[0].id,'old');assert.equal(f.get('grid').children[0].dataset.id,'old');assert.equal(f.get('albumBackup').disabled,false);
});
test('read failure retains the last successful rows and their visible grid',async()=>{
 const rows=[photo('old'),photo('older')],f=fixture({rows});await f.api.refreshShots();f.options.read=async()=>{throw new DOMException('network process','UnknownError');};await f.api.refreshShots();
 assert.equal(f.state.shots,rows);assert.deepEqual(f.get('grid').children.map(b=>b.dataset.id),['old','older']);assert.match(f.get('albumStatusMessage').textContent,/last readable photos are still shown/);assert.equal(f.get('albumEmpty').hidden,true);assert.equal(f.get('albumRetry').hidden,false);
});
test('only a successful zero-record read shows the empty-album UI',async()=>{
 const f=fixture({rows:[]});await f.api.refreshShots();assert.equal(f.api.ok,true);assert.equal(f.get('albumEmpty').hidden,false);assert.equal(f.get('albumStatus').hidden,true);assert.match(f.get('albumStorageDetails').textContent,/0 stored records/);
});
test('concurrent refreshes share one database read and clear pending status',async()=>{
 const read=deferred(),f=fixture({read:()=>read.promise});const first=f.api.refreshShots(),second=f.api.refreshShots();assert.equal(f.calls.reads,1);assert.equal(f.get('albumStatus').dataset.state,'loading');assert.equal(f.get('albumRetry').disabled,true);read.resolve([photo('old')]);await Promise.all([first,second]);assert.equal(f.calls.reads,1);assert.equal(f.api.reading,null);assert.equal(f.get('albumStatus').dataset.state,'ready');
});
test('a save completing during an older read cannot be erased by that read',async()=>{
 const read=deferred(),old=photo('old');let first=true;
 const f=fixture({read:()=>{if(first){first=false;return read.promise;}return Promise.resolve([photo('new'),old]);}});
 const pending=f.api.refreshShots();await f.api.keep(photo('input'));assert.equal(f.api.revision,1);read.resolve([old]);await pending;
 assert.equal(f.calls.reads,2);assert.deepEqual(Array.from(f.state.shots,s=>s.id),['new','old']);assert.deepEqual(f.get('grid').children.map(b=>b.dataset.id),['new','old']);
});
test('reopening Album performs a real refresh and deduplicates a pending refresh',async()=>{
 const read=deferred(),f=fixture({read:()=>read.promise});f.api.openAlbum();f.api.openAlbum();assert.equal(f.calls.reads,1);read.resolve([photo('old')]);await f.api.reading;assert.equal(f.state.shots[0].id,'old');
});
test('legacy non-Blob thumbnails and malformed recipe shapes cannot hide valid photos',async()=>{
 const valid=photo('valid'),legacy={...photo('legacy'),thumb:'blob:expired',recipe:{layers:'invalid',stickers:[null]}},unreadable={id:'broken',photo:'blob:lost',thumb:{url:'obsolete'},recipe:null,created:0};
 const f=fixture({rows:[legacy,unreadable,valid]});await f.api.refreshShots();
 assert.equal(f.api.ok,true);assert.deepEqual(f.get('grid').children.map(b=>b.dataset.id),['legacy','broken','valid']);assert.equal(f.get('grid').children[1].classList.contains('album-unreadable'),true);assert.match(f.get('grid').children[1].children.find(e=>e.tagName==='small').textContent,/included in backup/);assert.ok(f.calls.urls.every(e=>e.blob instanceof Blob));assert.match(f.get('albumStorageDetails').textContent,/1 without a readable image/);
});
test('failed thumbnail decoding falls back to the retained finished image',async()=>{
 const row={...photo('valid'),thumb:new Blob(['bad thumbnail'],{type:'image/png'})},f=fixture({rows:[row]});await f.api.refreshShots();const image=f.get('grid').children[0].children.find(e=>e.tagName==='img'),first=image.src;image.onerror();assert.notEqual(image.src,first);assert.equal(f.calls.urls.find(e=>e.url===image.src).blob,row.photo);assert.equal(f.state.shots[0],row);
});
test('a failed delete keeps the record/viewer and never announces deletion',async()=>{
 const row=photo('old'),f=fixture({rows:[row],deleteError:new DOMException('storage refused','UnknownError')});await f.api.refreshShots();f.state.viewing=row;await f.get('deletePhoto').click();await f.calls.confirmation();
 assert.equal(f.calls.deletes,1);assert.equal(f.state.shots[0],row);assert.equal(f.state.viewing,row);assert.equal(f.api.revision,0);assert.ok(f.calls.toasts.some(t=>t.startsWith('Photo could not be deleted.')));assert.ok(f.calls.toasts.every(t=>t!=='Photo deleted'));
});
test('a confirmed successful delete removes the visible row only after storage succeeds',async()=>{
 const row=photo('old'),f=fixture({rows:[row]});await f.api.refreshShots();f.state.viewing=row;f.options.rows=[];await f.get('deletePhoto').click();await f.calls.confirmation();if(f.api.reading)await f.api.reading;
 assert.equal(f.calls.deletes,1);assert.equal(f.state.shots.length,0);assert.equal(f.state.viewing,null);assert.equal(f.api.revision,1);assert.equal(f.calls.toasts.at(-1),'Photo deleted');
});
test('storage details identify Home Screen context without asserting data deletion',async()=>{
 const f=fixture({standalone:true});await f.api.refreshShots();assert.match(f.get('albumStorageDetails').textContent,/Home Screen app/);assert.match(f.get('albumStorageDetails').textContent,/does not establish that another album was deleted/);assert.match(f.get('albumStorageDetails').textContent,/independent backup/);
});

test('welcome album label settles after success and failure rather than remaining in loading state',async()=>{
 const f=fixture({rows:[photo('old')]});await f.api.refreshShots();assert.match(f.get('welcomeAlbumCount').textContent,/1 photo.*on this device/);assert.doesNotMatch(f.get('welcomeAlbumCount').textContent,/Reading/);
 f.options.read=async()=>{throw new DOMException('storage unavailable','UnknownError');};await f.api.refreshShots();assert.match(f.get('welcomeAlbumCount').textContent,/Album unavailable.*retry/);assert.doesNotMatch(f.get('welcomeAlbumCount').textContent,/Reading/);
});
test('a delete completing during an older read cannot resurrect the deleted row',async()=>{
 const row=photo('old'),f=fixture({rows:[row]});await f.api.refreshShots();f.state.viewing=row;
 const read=deferred();let first=true;f.options.read=()=>{if(first){first=false;return read.promise;}return Promise.resolve([]);};
 const pending=f.api.refreshShots();await f.get('deletePhoto').click();await f.calls.confirmation();read.resolve([row]);await pending;
 assert.equal(f.state.shots.length,0);assert.equal(f.get('grid').children.length,0);assert.equal(f.calls.reads,3);assert.equal(f.api.revision,1);
});

test('a recipe that throws during normalisation uses a fallback label without hiding later rows',async()=>{
 const malformed={...photo('bad-recipe'),recipe:{layers:[{look:'none',amount:1n}]}},valid=photo('valid'),f=fixture({rows:[malformed,valid]});await f.api.refreshShots();assert.equal(f.api.ok,true);assert.deepEqual(f.get('grid').children.map(b=>b.dataset.id),['bad-recipe','valid']);assert.equal(f.get('grid').children[0].children.find(e=>e.tagName==='strong').textContent,'Saved photo');assert.equal(f.state.shots[0].recipe.layers[0].amount,1n);
});

test('a committed new save retires the previously prepared backup instead of offering stale data',async()=>{
 const f=fixture({rows:[photo('old')]});await f.api.refreshShots();await f.get('albumBackup').click();
 assert.equal(f.get('albumDownload').hidden,false);const previous=f.get('albumDownload').href;await f.api.keep(photo('input'));
 assert.equal(f.get('albumDownload').hidden,true);assert.ok(f.calls.revoked.includes(previous));assert.match(f.get('albumBackupMessage').textContent,/album changed/);
});
