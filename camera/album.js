/**
 * The album: every photo Pocket Camera saves, kept in this browser (IndexedDB) and nowhere else. A shot keeps the
 * finished photo, the picture it was made from and the recipe (Looks, mix, adjustments, date stamp), so it can be
 * opened again and re-edited from the original rather than from the finished photo.
 */
const DB='office-pocket-camera',STORE='shots';
let opening;

function db(){
 opening??=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'id'});
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
async function transact(mode,work,retry=true){
 let tx;
 try{tx=(await db()).transaction(STORE,mode);}
 catch(err){opening=null;if(retry)return transact(mode,work,false);throw err;}
 return new Promise((resolve,reject)=>{
  const r=work(tx.objectStore(STORE));
  tx.oncomplete=()=>resolve(r.result);
  tx.onabort=tx.onerror=()=>reject(tx.error||r.error||new Error('The album could not be written'));
 });
}
/** Asks the browser to keep the album (Safari otherwise clears a site's storage after a week without a visit). */
export function keepAlbum(){try{navigator.storage?.persist?.();}catch{}}

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
