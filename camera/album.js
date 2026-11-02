/**
 * The album: every photo Pocket Camera saves, kept in this browser (IndexedDB) and nowhere else. A shot keeps the
 * finished photo, the picture it was made from and the recipe (Looks, mix, adjustments, date stamp), so it can be
 * opened again and re-edited from the original rather than from the finished photo. The photographer's own die-cut
 * stickers (cutout.js) are kept beside the photos.
 */
const DB='office-pocket-camera',STORE='shots',MINE='stickers',META='metadata';
const SAMPLE_MARKER='samples:harbour-adventure:v1';
let opening=null,connection=null;
const STORAGE_TIMEOUT=10000;
const storageError=(name,message)=>new DOMException(message,name);
const reconnectable=error=>['InvalidStateError','UnknownError','AbortError','TimeoutError','TransactionInactiveError'].includes(error?.name);
function forget(d){
 if(connection===d){connection=null;opening=null;}
 try{d?.close();}catch{}
}
function db(){
 if(opening)return opening;
 const attempt=new Promise((resolve,reject)=>{
  let request,settled=false;
  const timer=setTimeout(()=>fail(storageError('TimeoutError','The album did not respond. Try opening it again.')),STORAGE_TIMEOUT);
  function fail(error){if(settled)return;settled=true;clearTimeout(timer);reject(error);}
  function open(version){
   try{request=version?indexedDB.open(DB,version):indexedDB.open(DB);}catch(error){fail(error);return;}
   request.onblocked=()=>fail(storageError('BlockedError','Another Pocket Camera window is holding the album open. Close that window, then retry.'));
   request.onupgradeneeded=()=>{
    if(settled||!version){request.transaction.abort();return;}
    // Version 3 only adds the sample marker store; no existing store or record is replaced.
    const d=request.result;
    if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});
    if(!d.objectStoreNames.contains(MINE))d.createObjectStore(MINE,{keyPath:'id'});
    if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'id'});
   };
   request.onsuccess=()=>{
    const d=request.result;
    if(settled){d.close();return;}
    if(![STORE,MINE,META].every(name=>d.objectStoreNames.contains(name))){d.close();fail(storageError('NotFoundError','This album uses an unsupported storage layout. Its data has been left in place.'));return;}
    settled=true;clearTimeout(timer);connection=d;
    // A late close event from an old handle must not invalidate a newer connection.
    d.onclose=()=>forget(d);d.onversionchange=()=>forget(d);
    resolve(d);
   };
   request.onerror=()=>{
    // A newer installed app may already have upgraded the database. Read its existing stores without downgrading.
    if(!settled&&version&&request.error?.name==='VersionError'){open();return;}
    fail(request.error||storageError('UnknownError','The album could not be opened.'));
   };
  }
  open(3);
 });
 opening=attempt;
 attempt.catch(()=>{if(opening===attempt)opening=null;});
 return attempt;
}
function begin(d,stores,mode){
 if(mode==='readwrite'){
  if(d.version>3)throw storageError('VersionError','A newer Pocket Camera version owns this album. Export is available; update the app before saving changes.');
  // Ask for a disk-backed commit where supported. Old engines reject the options argument.
  try{return d.transaction(stores,mode,{durability:'strict'});}catch(error){if(error?.name!=='TypeError')throw error;}
 }
 return d.transaction(stores,mode);
}
/** Retry a read once on a stale connection. Never replay a write once its transaction has begun. */
async function transaction(mode,stores,work,retry=true){
 let d,tx;
 try{d=await db();tx=begin(d,stores,mode);}
 catch(error){
  if(d)forget(d);
  if(retry&&reconnectable(error))return transaction(mode,stores,work,false);
  throw error;
 }
 try{return await new Promise((resolve,reject)=>{
  let result,error,settled=false;
  const finish=(failure)=>{if(settled)return;settled=true;clearTimeout(timer);if(failure)reject(failure);else{try{resolve(result());}catch(e){reject(e);}}};
  const timer=setTimeout(()=>{
   const failure=storageError('TimeoutError','The album did not respond. Its saved data has not been reset.');
   try{tx.abort();}catch{}
   finish(failure);
  },STORAGE_TIMEOUT);
  tx.oncomplete=()=>finish(error);
  tx.onerror=e=>{error??=e.target?.error||tx.error;};
  tx.onabort=()=>finish(error||tx.error||storageError('AbortError','The album operation was interrupted.'));
  try{result=work(tx);}catch(e){error=e;try{tx.abort();}catch{finish(e);}}
 });}catch(error){
  if(reconnectable(error))forget(d);
  if(mode==='readonly'&&retry&&reconnectable(error))return transaction(mode,stores,work,false);
  throw error;
 }
}
/** Settle on transaction completion: request success alone does not mean a photo was committed. */
const transact=(mode,work,retry=true,store=STORE)=>transaction(mode,store,tx=>{
 const request=work(tx.objectStore(store));return ()=>request.result;
},retry);
/** The returned permission is advisory. Browser-local photos still need an external backup. */
export async function keepAlbum(){
 try{
  const storage=navigator.storage;
  if(!storage?.persist)return {supported:false,persisted:false};
  const persisted=await storage.persisted?.()||await storage.persist();
  return {supported:true,persisted:!!persisted};
 }catch{return {supported:true,persisted:false};}
}

/** Add the two sample pictures once per album, including existing albums.
 * The assets are fetched before opening the write transaction. The marker and both shots are committed together;
 * simultaneous tabs therefore cannot duplicate them, and a failed fetch leaves the next visit free to retry.
 * Once the marker is set, deleting a sample is permanent until the browser's site data is cleared.
 */
export async function ensureAlbumSamples(){
 if(await transact('readonly',s=>s.get(SAMPLE_MARKER),true,META))return false;
 const urls=['./samples/default-original.png','./samples/default-adventure.png'];
 const images=await Promise.all(urls.map(async path=>{
  const response=await fetch(new URL(path,import.meta.url));
  if(!response.ok)throw new Error('The sample photos could not be loaded');
  const blob=await response.blob();
  if(!blob.size||!blob.type.startsWith('image/'))throw new Error('A sample photo is unavailable');
  return blob;
 }));
 const [original,adventure]=images, taken=Date.now();
 const samples=[
  {id:'sample:harbour-original:v1',sampleLabel:'Original sample',photo:original,source:original,thumb:original,recipe:{layers:[{look:'none',amount:1}]},width:512,height:384,taken,created:1},
  {id:'sample:harbour-adventure:v1',sampleLabel:'Adventure Ink sample',photo:adventure,source:original,thumb:adventure,recipe:{layers:[{look:'adventureInk',amount:1}]},width:512,height:384,taken,created:2}
 ];
 return transaction('readwrite',[META,STORE],tx=>{
  let added=false;
  const meta=tx.objectStore(META),shots=tx.objectStore(STORE),check=meta.get(SAMPLE_MARKER);
  check.onsuccess=()=>{
   if(check.result)return;
   for(const sample of samples){const existing=shots.get(sample.id);existing.onsuccess=()=>{if(!existing.result)shots.add(sample);};}
   meta.add({id:SAMPLE_MARKER});added=true;
  };
  return ()=>added;
 });
}

/** Every shot, newest first. */
export async function listShots(){return (await transact('readonly',s=>s.getAll())).sort((a,b)=>(b?.created||0)-(a?.created||0));}
export const getShot=id=>transact('readonly',s=>s.get(id));
/** Saves a new shot ({photo, source, thumb, recipe, width, height, taken}); returns it with its id. */
export async function addShot(shot){
 const record={...shot,id:globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`,created:Date.now()};
 await transact('readwrite',s=>s.add(record));return record;
}
export async function updateShot(id,changes){
 const saved=await getShot(id);
 if(!saved)throw storageError('NotFoundError','That photo is no longer in this album.');
 const record={...saved,...changes,id,edited:Date.now()};
 await transact('readwrite',s=>s.put(record));return record;
}
export const deleteShot=id=>transact('readwrite',s=>s.delete(id));

/** The own stickers ({id, blob, width, height, created}), oldest first, as they were made. */
export async function listMine(){return (await transact('readonly',s=>s.getAll(),true,MINE)).sort((a,b)=>(a?.created||0)-(b?.created||0));}
export async function addMine(sticker){
 const record={...sticker,id:`mine:${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,created:Date.now()};
 await transact('readwrite',s=>s.add(record),true,MINE);return record;
}
export const deleteMine=id=>transact('readwrite',s=>s.delete(id),true,MINE);


/** One consistent snapshot, including originals, recipes, own stickers and seeding metadata. */
export function snapshotAlbum(){
 return transaction('readonly',[STORE,MINE,META],tx=>{
  const shots=tx.objectStore(STORE).getAll(),stickers=tx.objectStore(MINE).getAll(),metadata=tx.objectStore(META).getAll();
  return ()=>({shots:shots.result,stickers:stickers.result,metadata:metadata.result});
 });
}
/** Add verified backup rows atomically. A photo/sticker ID collision aborts, never overwrites an existing row. */
export function restoreAlbum({shots=[],stickers=[],metadata=[]}){
 return transaction('readwrite',[STORE,MINE,META],tx=>{
  for(const shot of shots)tx.objectStore(STORE).add(shot);
  for(const sticker of stickers)tx.objectStore(MINE).add(sticker);
  const meta=tx.objectStore(META);
  for(const row of metadata){const existing=meta.get(row.id);existing.onsuccess=()=>{if(!existing.result)meta.add(row);};}
  return ()=>({shots:shots.length,stickers:stickers.length});
 });
}
