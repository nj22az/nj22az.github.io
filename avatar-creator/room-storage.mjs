import {validateRoom} from '../johansson-town/src/studio/room-project.js';
const DB='johansson-studio-rooms',STORE='projects';
export function openRoomStore(indexedDB=globalThis.indexedDB){
 let opening;
 const open=()=>opening??=new Promise((resolve,reject)=>{
  if(!indexedDB){reject(Error('Local project storage is unavailable. Download your project to keep it.'));return;}
  const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>{opening=null;reject(request.error);};request.onblocked=()=>{opening=null;reject(Error('Close another Studio tab to upgrade project storage.'));};
 });
 return {
 async read(id){const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result?.project||null);r.onerror=()=>reject(r.error);});},
 async save(project,expected){validateRoom(project);const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),r=store.get(project.id);let problem;
  r.onsuccess=()=>{
   const actual=r.result?.project.revision??null;
   if(actual!==expected){problem=Error(`Another Studio tab saved revision ${actual}. Reopen it before saving.`);tx.abort();return;}
   store.put({id:project.id,project});
  };tx.oncomplete=()=>resolve(project.revision);tx.onerror=()=>reject(problem||tx.error);tx.onabort=()=>reject(problem||tx.error||Error('Project save interrupted.'));
 });},
 async close(){if(opening){const db=await opening;db.close();opening=null;}}
 };
}
