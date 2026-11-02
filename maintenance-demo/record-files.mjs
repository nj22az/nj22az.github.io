import {referencedFiles} from './record-core.mjs?v=2026.11.02.9';
export const MAX_FILE=10*1024*1024,MAX_FILES=50*1024*1024;
const b64=bytes=>{let out='';for(let i=0;i<bytes.length;i+=16000)out+=String.fromCharCode(...bytes.subarray(i,i+16000));return btoa(out);};
const un64=s=>{if(typeof s!=='string'||s.length%4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('Invalid attachment encoding.');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));};
export async function fileDigest(blob){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function createFileVault(){
 let pending;const open=()=>pending??=new Promise((resolve,reject)=>{const req=indexedDB.open('maintenance-retained-files-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('files',{keyPath:'id'});req.onsuccess=()=>{req.result.onversionchange=()=>{pending=undefined;req.result.close();};resolve(req.result);};req.onerror=()=>{pending=undefined;reject(Error('Report-file storage is unavailable.'));};req.onblocked=()=>reject(Error('Close other planner tabs before upgrading report-file storage.'));});
 return {async get(id){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readonly'),req=tx.objectStore('files').get(id);req.onsuccess=()=>resolve(req.result?.blob||null);req.onerror=()=>reject(Error('Unable to read the retained report file.'));});},async put(entries){if(!entries.length)return;const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');for(const e of entries)tx.objectStore('files').put(e);tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(Error('Report files could not be stored. Check browser storage and retain your originals.'));});}};
}
export async function completeArchive(workspace,vault){
 const copy=structuredClone(workspace),files=referencedFiles(copy);if(Array.isArray(copy.assets)){copy.workspaceVersion=copy.version;copy.version=2;}let total=0;copy.archive={version:1,files:[]};copy.exportedAt=new Date().toISOString();
 for(const f of files){const blob=await vault.get(f.id);if(!blob)throw Error('Complete export stopped: missing retained file '+f.name+'. Reattach it before exporting.');if(blob.size!==f.size||await fileDigest(blob)!==f.id)throw Error('Complete export stopped: retained file integrity mismatch.');total+=blob.size;if(total>MAX_FILES)throw Error('Retained files exceed the portable archive budget (50 MB).');copy.archive.files.push({...f,data:b64(new Uint8Array(await blob.arrayBuffer()))});}
 return copy;
}
export async function restoreArchive(candidate,vault,persist){
 const refs=referencedFiles(candidate),entries=[],seen=new Set();let total=0;
 if(candidate.archive!==undefined&&(!candidate.archive||candidate.archive.version!==1||!Array.isArray(candidate.archive.files)||candidate.archive.files.length>500))throw Error('Invalid retained-file archive.');
 for(const f of candidate.archive?.files||[]){if(!f||!/^[a-f0-9]{64}$/.test(f.id)||seen.has(f.id)||typeof f.name!=='string'||typeof f.type!=='string')throw Error('Invalid or duplicate attachment record.');seen.add(f.id);if(typeof f.data!=='string'||f.data.length>Math.ceil(MAX_FILE/3)*4)throw Error('Attachment exceeds the 10 MB file limit.');const bytes=un64(f.data);total+=bytes.length;if(bytes.length!==f.size||bytes.length>MAX_FILE||total>MAX_FILES)throw Error('Attachment size or archive limit is invalid.');const blob=new Blob([bytes],{type:f.type});if(await fileDigest(blob)!==f.id)throw Error('Attachment digest mismatch. No workspace was replaced.');entries.push({id:f.id,blob});}
 for(const f of refs){const entry=entries.find(e=>e.id===f.id),blob=entry?.blob||await vault.get(f.id);if(!blob||blob.size!==f.size||await fileDigest(blob)!==f.id)throw Error('Required file is missing or invalid: '+f.name);}
 const clean=structuredClone(candidate);delete clean.archive;delete clean.exportedAt;if(clean.version===2){if(clean.workspaceVersion!==1)throw Error('Unsupported workspace schema.');clean.version=clean.workspaceVersion;delete clean.workspaceVersion;}
 // Immutable content-addressed files commit first. A failed metadata save leaves
 // the previous workspace intact, with at most unused extra blobs in the vault.
 await vault.put(entries);await persist(clean);return clean;
}
