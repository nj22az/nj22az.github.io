/**
 * The album: every photo Pocket Camera saves, kept in this browser (IndexedDB) and nowhere else. A shot keeps the
 * finished photo, the picture it was made from and the recipe (Looks, mix, adjustments, date stamp), so it can be
 * opened again and re-edited from the original rather than from the finished photo. The photographer's own die-cut
 * stickers (cutout.js) are kept beside the photos.
 */
const DB='office-pocket-camera',STORE='shots',MINE='stickers',META='metadata';
const SAMPLE_MARKER='samples:harbour-adventure:v1';
let opening;

function db(){
 opening??=new Promise((resolve,reject)=>{
  // Version 3 records one-time sample seeding; existing albums and stickers stay in place.
  const request=indexedDB.open(DB,3);
  request.onupgradeneeded=()=>{
   const d=request.result;
   if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});
   if(!d.objectStoreNames.contains(MINE))d.createObjectStore(MINE,{keyPath:'id'});
   if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'id'});
  };
  request.onsuccess=()=>{
   const d=request.result;
   // Safari can close the connection behind the page's back; the next call opens it again.
   d.onclose=()=>{opening=null;};d.onversionchange=()=>{d.close();opening=null;};
   resolve(d);
  };
  request.onerror=()=>{opening=null;reject(request.error);};
 });
 return opening;
}
/** One request in its own transaction, settled when the transaction is (a write is only kept once it completes). */
async function transact(mode,work,retry=true,store=STORE){
 let tx;
 try{tx=(await db()).transaction(store,mode);}
 catch(err){opening=null;if(retry)return transact(mode,work,false,store);throw err;}
 return new Promise((resolve,reject)=>{
  const r=work(tx.objectStore(store));
  tx.oncomplete=()=>resolve(r.result);
  tx.onabort=tx.onerror=()=>reject(tx.error||r.error||new Error('The album could not be written'));
 });
}
/** Asks the browser to keep the album (Safari otherwise clears a site's storage after a week without a visit). */
export function keepAlbum(){try{navigator.storage?.persist?.();}catch{}}

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
 const d=await db();
 return new Promise((resolve,reject)=>{
  let tx,added=false;
  try{tx=d.transaction([META,STORE],'readwrite');}catch(error){opening=null;reject(error);return;}
  const meta=tx.objectStore(META),shots=tx.objectStore(STORE),check=meta.get(SAMPLE_MARKER);
  check.onsuccess=()=>{if(check.result)return;for(const sample of samples)shots.put(sample);meta.put({id:SAMPLE_MARKER});added=true;};
  tx.oncomplete=()=>resolve(added);
  tx.onabort=tx.onerror=()=>reject(tx.error||check.error||new Error('Sample photos could not be saved'));
 });
}

/** Every shot, newest first. */
export async function listShots(){return (await transact('readonly',s=>s.getAll())).sort((a,b)=>b.created-a.created);}
export const getShot=id=>transact('readonly',s=>s.get(id));
/** Saves a new shot ({photo, source, thumb, recipe, width, height, taken}); returns it with its id. */
export async function addShot(shot){
 const record={...shot,id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,created:Date.now()};
 await transact('readwrite',s=>s.put(record));return record;
}
export async function updateShot(id,changes){
 const record={...await getShot(id),...changes,id,edited:Date.now()};
 await transact('readwrite',s=>s.put(record));return record;
}
export const deleteShot=id=>transact('readwrite',s=>s.delete(id));

/** The own stickers ({id, blob, width, height, created}), oldest first, as they were made. */
export async function listMine(){return (await transact('readonly',s=>s.getAll(),true,MINE)).sort((a,b)=>a.created-b.created);}
export async function addMine(sticker){
 const record={...sticker,id:`mine:${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,created:Date.now()};
 await transact('readwrite',s=>s.put(record),true,MINE);return record;
}
export const deleteMine=id=>transact('readwrite',s=>s.delete(id),true,MINE);
