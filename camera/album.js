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
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>{opening=null;reject(request.error);};
 });
 return opening;
}
async function transact(mode,work){
 const store=(await db()).transaction(STORE,mode).objectStore(STORE);
 return new Promise((resolve,reject)=>{const r=work(store);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
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
