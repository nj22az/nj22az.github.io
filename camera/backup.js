/**
 * Album backup (the owner, 2 November 2026: "start with backup …"). The album lives only in this browser's storage
 * (album.js); on an iPhone, Safari and the Home Screen app even keep separate albums. A backup is one ZIP file the owner
 * keeps in Files or on a computer: every photo's untouched original, its finished picture and thumbnail, its recipe (so
 * a restored photo re-edits from the original with every Look, setting and sticker), and the own die-cut stickers.
 *
 *   pocket-camera-backup.json   what is in the file: each record's fields and which file holds each of its pictures
 *   photos/0001-photo.jpg …     the pictures, as the album keeps them (byte for byte)
 *   stickers/0001.png …         the own stickers
 *
 * Restoring adds what the album does not have, by id; it never replaces or deletes a photo (one edited since the backup
 * keeps its newer self). Nothing is uploaded: the file goes only where the owner saves it.
 */
import {listShots,listMine,listMeta,restoreRecord,keepAlbum} from './album.js?v=20261102fun1';
import {makeZip,readZip} from './zip.js?v=20261102fun1';

export const BACKUP_FORMAT=1;
const APP='Pocket Camera',MANIFEST='pocket-camera-backup.json';
const EXTENSIONS={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/heic':'heic','image/heif':'heif','image/avif':'avif'};
const ext=type=>EXTENSIONS[type]||'bin';
const SKIP=new Set(['__proto__','constructor','prototype']);
const pad=n=>String(n).padStart(4,'0');

/** A record split into its plain fields and its pictures (every Blob field). */
function split(record){
 const fields={},pictures={};
 for(const [k,v] of Object.entries(record)){if(SKIP.has(k))continue;if(v instanceof Blob)pictures[k]=v;else fields[k]=v;}
 return {fields,pictures};
}

/**
 * Builds the backup of everything in the album. `progress(text, fraction)` reports the work. Resolves to a File named
 * for the day, ready to be shared or downloaded in a later tap (a phone only shares from a fresh tap).
 */
export async function makeBackup({version='',progress=()=>{},now=new Date()}={}){
 progress('Reading the album…',0);
 const [shots,stickers,meta]=await Promise.all([listShots(),listMine(),listMeta()]);
 const entries=[],paths=new Map();
 // A picture shared by two fields (a sample's original, an unedited photo's source) is written once.
 const file=(blob,name)=>{if(!paths.has(blob)){paths.set(blob,name);entries.push({name,data:blob,date:now});}return {path:paths.get(blob),type:blob.type||''};};
 const manifest={format:BACKUP_FORMAT,app:APP,version,created:now.toISOString(),shots:[],stickers:[],meta:meta.map(({id})=>({id}))};
 [...shots].reverse().forEach((shot,i)=>{
  const {fields,pictures}=split(shot),files={};
  for(const [k,blob] of Object.entries(pictures))files[k]=file(blob,`photos/${pad(i+1)}-${k}.${ext(blob.type)}`);
  manifest.shots.push({record:fields,files});
 });
 stickers.forEach((sticker,i)=>{
  const {fields,pictures}=split(sticker),files={};
  for(const [k,blob] of Object.entries(pictures))files[k]=file(blob,`stickers/${pad(i+1)}${k==='blob'?'':'-'+k}.${ext(blob.type)}`);
  manifest.stickers.push({record:fields,files});
 });
 entries.unshift({name:MANIFEST,data:JSON.stringify(manifest,null,1),date:now});
 const zip=await makeZip(entries,{progress:(done,total)=>progress(`Packing ${done} of ${total} files…`,done/total)});
 const day=now.toISOString().slice(0,10);
 return {file:new File([zip],`Pocket Camera backup ${day}.zip`,{type:'application/zip'}),photos:shots.length,stickers:stickers.length};
}

/**
 * Restores a backup file into the album: adds each photo and sticker the album does not have (by id) and checks every
 * picture against its checksum first. Resolves {photos, stickers, kept} (added, added, already there).
 */
export async function restoreBackup(file,{progress=()=>{}}={}){
 progress('Opening the backup…',0);
 const entries=await readZip(file),byName=new Map(entries.map(e=>[e.name,e]));
 const head=byName.get(MANIFEST);
 if(!head)throw new Error('This is not a Pocket Camera backup');
 await head.check();
 let manifest;
 try{manifest=JSON.parse(await head.blob().text());}catch{throw new Error('This is not a Pocket Camera backup');}
 if(manifest?.app!==APP||manifest.format!==BACKUP_FORMAT)throw new Error('This backup is from another app or a newer Pocket Camera');
 const items=[...(manifest.shots||[]).map(x=>['shots',x]),...(manifest.stickers||[]).map(x=>['stickers',x])];
 let photos=0,stickers=0,kept=0,done=0;
 for(const [kind,item] of items){
  const record={};
  for(const [k,v] of Object.entries(item?.record||{}))if(!SKIP.has(k))record[k]=v;
  if(typeof record.id!=='string'||!record.id)throw new Error('The backup lists a photo without its name');
  for(const [k,f] of Object.entries(item.files||{})){
   if(SKIP.has(k))continue;
   const entry=byName.get(f?.path);
   if(!entry)throw new Error(`The backup is missing ${f?.path||'a picture'}`);
   await entry.check();
   record[k]=entry.blob(typeof f.type==='string'?f.type:'');
  }
  if(kind==='shots'&&!(record.photo instanceof Blob))throw new Error('The backup lists a photo without its picture');
  if(kind==='stickers'&&!(record.blob instanceof Blob))throw new Error('The backup lists a sticker without its picture');
  const added=await restoreRecord(kind,record);
  if(!added)kept++;else if(kind==='shots')photos++;else stickers++;
  progress(`Restoring ${++done} of ${items.length}…`,done/items.length);
 }
 for(const m of manifest.meta||[])if(typeof m?.id==='string')await restoreRecord('meta',{id:m.id});
 if(photos||stickers)keepAlbum();
 return {photos,stickers,kept};
}

/** Where the album lives and how much it holds, for the backup sheet. Values the browser does not give are null. */
export async function albumStorage(){
 const [shots,stickers]=await Promise.all([listShots(),listMine()]);
 let usage=null,quota=null,persisted=null;
 try{const e=await navigator.storage?.estimate?.();usage=Number.isFinite(e?.usage)?e.usage:null;quota=Number.isFinite(e?.quota)?e.quota:null;}catch{}
 try{const p=await navigator.storage?.persisted?.();persisted=typeof p==='boolean'?p:null;}catch{}
 let standalone=false;try{standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}catch{}
 return {photos:shots.length,stickers:stickers.length,usage,quota,persisted,standalone};
}

/** "12.4 MB", "840 KB". */
export function formatBytes(n){
 if(!Number.isFinite(n))return '';
 const units=['bytes','KB','MB','GB'];let i=0;while(n>=1000&&i<units.length-1){n/=1000;i++;}
 return `${i?n.toFixed(n<10?1:0):Math.round(n)} ${units[i]}`;
}
