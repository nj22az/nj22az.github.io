import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// The codec is the shipped module. Only its IndexedDB boundary is replaced in these deterministic tests;
// real add-only transaction/upgrade/restart coverage lives in album.test.mjs and album.browser.mjs.
const source=(await readFile(new URL('../album-backup.js',import.meta.url),'utf8')).replace(/^import \{snapshotAlbum,restoreAlbum\} from '[^']+';$/m,
 'const snapshotAlbum=(...args)=>globalThis.__backupAlbum.snapshot(...args),restoreAlbum=(...args)=>globalThis.__backupAlbum.restore(...args);');
const {encodeAlbumBackup,decodeAlbumBackup,makeAlbumBackup,restoreAlbumBackup,BACKUP_FILE_LIMIT}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const png=new Blob([Uint8Array.from({length:100003},(_,i)=>i%251)],{type:'image/png'});
const original=new File([new Uint8Array([17,40,255,0,29])],'Örebro harbour.jpg',{type:'image/jpeg',lastModified:1783001234567});
const fixture=()=>({
 shots:[{id:'old-photo:1',photo:png,source:original,thumb:new Blob(['thumbnail'],{type:'image/webp'}),recipe:{layers:[{look:'instant',amount:.61}],stickers:[{id:'mine:one',x:.3,y:.7}],crop:{x:.1,y:.2,w:.6,h:.5},enhance:.4,makeup:{skin:.2}},width:512,height:384,taken:1700000000000,created:1700000000001,unknown:{optional:undefined,nonfinite:Infinity,date:new Date('2026-10-31T12:00:00Z')}}],
 stickers:[{id:'mine:one',blob:new Blob(['cutout'],{type:'image/png'}),width:20,height:25,created:9}],
 metadata:[{id:'samples:harbour-adventure:v1'}]
});
const empty=()=>({shots:[],stickers:[],metadata:[]});
async function assertBlob(actual,expected){assert.equal(actual.type,expected.type);assert.deepEqual(new Uint8Array(await actual.arrayBuffer()),new Uint8Array(await expected.arrayBuffer()));}
const jsonFile=value=>new Blob([JSON.stringify(value)],{type:'application/json'});
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function archive(){return JSON.parse(await(await encodeAlbumBackup(fixture())).text());}
function boundary(snapshot=empty()){
 const calls=[];globalThis.__backupAlbum={snapshot:async()=>snapshot,restore:async incoming=>{calls.push(incoming);return {shots:incoming.shots.length,stickers:incoming.stickers.length};}};return calls;
}

test('complete backup restores exact originals, finished pixels, thumbnails, recipe and custom stickers',async()=>{
 const before=fixture(),file=await encodeAlbumBackup(before),after=await decodeAlbumBackup(file);
 assert.equal(file.type,'application/json');assert.ok(file.size>png.size);
 for(const field of ['photo','source','thumb'])await assertBlob(after.shots[0][field],before.shots[0][field]);
 assert.equal(after.shots[0].source.name,original.name);assert.equal(after.shots[0].source.lastModified,original.lastModified);
 assert.deepEqual(after.shots[0].recipe,before.shots[0].recipe);assert.deepEqual(after.shots[0].unknown,before.shots[0].unknown);
 assert.equal(after.shots[0].id,before.shots[0].id);assert.equal(after.shots[0].created,before.shots[0].created);
 await assertBlob(after.stickers[0].blob,before.stickers[0].blob);assert.deepEqual(after.metadata,before.metadata);
});
test('makeAlbumBackup reads a complete snapshot and never writes',async()=>{
 const calls=boundary(fixture()),file=await makeAlbumBackup();assert.equal((await decodeAlbumBackup(file)).shots.length,1);assert.deepEqual(calls,[]);
});
test('valid restore is additive and supplies all records to one transaction',async()=>{
 const calls=boundary(),report=await restoreAlbumBackup(await encodeAlbumBackup(fixture()));
 assert.deepEqual(report,{added:1,skipped:0,stickersAdded:1,stickersSkipped:0});assert.equal(calls.length,1);
 assert.equal(calls[0].shots[0].id,'old-photo:1');assert.equal(calls[0].stickers[0].id,'mine:one');assert.equal(calls[0].metadata[0].id,'samples:harbour-adventure:v1');
 await assertBlob(calls[0].shots[0].source,original);
});
test('restoring the same backup skips only exact records, including Blob bytes and all recipe fields',async()=>{
 const existing=fixture(),calls=boundary(existing),report=await restoreAlbumBackup(await encodeAlbumBackup(fixture()));
 assert.deepEqual(report,{added:0,skipped:1,stickersAdded:0,stickersSkipped:1});assert.equal(calls.length,1);assert.deepEqual(calls[0].shots,[]);assert.deepEqual(calls[0].stickers,[]);
});
for(const conflict of ['pixels','recipe','sticker'])test(`a conflicting ${conflict} ID stops the whole restore before any write`,async()=>{
 const existing=fixture();
 if(conflict==='pixels')existing.shots[0].photo=new Blob(['different pixels'],{type:'image/png'});
 if(conflict==='recipe')existing.shots[0].recipe.enhance=.9;
 if(conflict==='sticker')existing.stickers[0].blob=new Blob(['different cutout'],{type:'image/png'});
 const incoming=fixture();incoming.shots.push({...incoming.shots[0],id:'new:2'});
 const calls=boundary(existing);await assert.rejects(restoreAlbumBackup(await encodeAlbumBackup(incoming)),/same ID/);assert.deepEqual(calls,[]);
});
test('invalid JSON, unknown versions, metadata tampering and truncated files cannot write to the album',async()=>{
 const calls=boundary(),good=await archive(),version={...good,version:999},changed=structuredClone(good);
 changed.payload.entries[0][0]='changed';
 for(const file of [new Blob(['{']),jsonFile(version),jsonFile(changed),new Blob([JSON.stringify(good).slice(0,-17)])])await assert.rejects(restoreAlbumBackup(file));
 assert.deepEqual(calls,[]);
});
test('a damaged image fails its own digest even if the outer archive was rehashed',async()=>{
 const calls=boundary(),bad=await archive();
 const find=node=>{if(node?.type==='blob')return node;if(node?.type==='object')for(const [,child]of node.entries){const found=find(child);if(found)return found;}if(node?.type==='array')for(const child of node.items){const found=find(child);if(found)return found;}};
 const blob=find(bad.payload);blob.data=(blob.data[0]==='A'?'B':'A')+blob.data.slice(1);bad.sha256=hash(bad.payload);
 await assert.rejects(restoreAlbumBackup(jsonFile(bad)),/integrity check/);assert.deepEqual(calls,[]);
});
test('duplicate record IDs and unknown values are rejected before restore',async()=>{
 const calls=boundary(),bad=fixture();bad.shots.push({...bad.shots[0]});await assert.rejects(encodeAlbumBackup(bad),/duplicate/);
 const malformed=await archive();malformed.payload={type:'future-value'};malformed.sha256=hash(malformed.payload);
 await assert.rejects(restoreAlbumBackup(jsonFile(malformed)),/unknown value/);assert.deepEqual(calls,[]);
 const unsupported=fixture();unsupported.shots[0].bad=new Map();await assert.rejects(encodeAlbumBackup(unsupported),/cannot preserve/);
});
test('large files and declared image sizes fail before reading or allocating their contents',async()=>{
 class HugeFile extends Blob{get size(){return BACKUP_FILE_LIMIT+1;}text(){throw Error('must not read oversized file');}}
 await assert.rejects(decodeAlbumBackup(new HugeFile()),/256 MB/);
 class HugeImage extends Blob{get size(){return 192*1024*1024+1;}arrayBuffer(){throw Error('must not read oversized image');}}
 const big=fixture();big.shots[0].photo=new HugeImage();await assert.rejects(encodeAlbumBackup(big),/192 MB/);
});
test('safe object decoding preserves reserved property names without modifying prototypes',async()=>{
 const original=fixture();Object.defineProperty(original.shots[0].recipe,'__proto__',{value:{unexpected:true},enumerable:true});
 const decoded=await decodeAlbumBackup(await encodeAlbumBackup(original));assert.equal(Object.getPrototypeOf(decoded.shots[0].recipe),Object.prototype);
 assert.equal(Object.hasOwn(decoded.shots[0].recipe,'__proto__'),true);assert.equal(decoded.shots[0].recipe.__proto__.unexpected,true);assert.equal({}.unexpected,undefined);
});
test('transaction rejection is propagated without reporting imported records',async()=>{
 const calls=boundary();globalThis.__backupAlbum.restore=async incoming=>{calls.push(incoming);throw new DOMException('collision or quota','ConstraintError');};
 await assert.rejects(restoreAlbumBackup(await encodeAlbumBackup(fixture())),{name:'ConstraintError'});assert.equal(calls.length,1);
});
