/** A local, versioned backup of the complete album. No photograph is sent to a server. */
import {snapshotAlbum,restoreAlbum} from './album.js?v=20261102album1';

const FORMAT='pocket-camera-album',VERSION=1;
// JSON/base64 needs working memory as well as the file itself. Refuse large imports before reading or writing.
export const BACKUP_FILE_LIMIT=256*1024*1024;
const RAW_LIMIT=192*1024*1024,MAX_RECORDS=20000,MAX_NODES=200000,MAX_DEPTH=64;
const fail=message=>{throw new Error(message);};
const budget=()=>({bytes:0,nodes:0});
function visit(b,depth){if(depth>MAX_DEPTH||++b.nodes>MAX_NODES)fail('This album backup is too complex to open.');}
function bytes(b,size){if(!Number.isSafeInteger(size)||size<0||(b.bytes+=size)>RAW_LIMIT)fail('This album backup is too large to open safely (192 MB of image data maximum).');}
async function digest(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',value)),v=>v.toString(16).padStart(2,'0')).join('');}
const textDigest=value=>digest(new TextEncoder().encode(value));
function base64(data){
 const chunks=[];for(let start=0;start<data.length;start+=49152)chunks.push(btoa(String.fromCharCode(...data.subarray(start,start+49152))));
 return chunks.join('');
}
function unbase64(data,size){
 if(typeof data!=='string'||data.length!==4*Math.ceil(size/3)||!(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/).test(data))fail('An image in this album backup is damaged.');
 const result=new Uint8Array(size);let offset=0;
 for(let start=0;start<data.length;start+=65536){const chunk=atob(data.slice(start,start+65536));for(let i=0;i<chunk.length;i++)result[offset++]=chunk.charCodeAt(i);}
 if(offset!==size)fail('An image in this album backup is incomplete.');return result;
}
// Every compound value is tagged, so a recipe property cannot be mistaken for a Blob or alter an object prototype.
async function encode(value,b,depth=0){
 visit(b,depth);
 if(value===null||typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return value;
 if(value===undefined)return {type:'undefined'};
 if(typeof value==='number')return {type:'number',value:String(value)};
 if(value instanceof Blob){
  bytes(b,value.size);const data=new Uint8Array(await value.arrayBuffer());
  const node={type:'blob',mime:value.type,size:value.size,sha256:await digest(data),data:base64(data)};
  if(typeof File!=='undefined'&&value instanceof File)node.file={name:value.name,lastModified:value.lastModified};
  return node;
 }
 if(value instanceof Date){if(!Number.isFinite(value.getTime()))fail('An album date cannot be backed up.');return {type:'date',value:value.toISOString()};}
 if(Array.isArray(value)){const items=[];for(const item of value)items.push(await encode(item,b,depth+1));return {type:'array',items};}
 if(typeof value==='object'&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)){
  const entries=[];for(const key of Object.keys(value).sort())entries.push([key,await encode(value[key],b,depth+1)]);return {type:'object',entries};
 }
 fail('The album contains a value this backup format cannot preserve.');
}
async function decode(node,b,depth=0){
 visit(b,depth);
 if(node===null||typeof node==='string'||typeof node==='boolean'||typeof node==='number'&&Number.isFinite(node))return node;
 if(!node||typeof node!=='object'||Array.isArray(node))fail('The album backup has an invalid record.');
 if(node.type==='undefined')return undefined;
 if(node.type==='number'&&['NaN','Infinity','-Infinity'].includes(node.value))return Number(node.value);
 if(node.type==='date'&&typeof node.value==='string'&&Number.isFinite(Date.parse(node.value)))return new Date(node.value);
 if(node.type==='blob'){
  bytes(b,node.size);
  if(typeof node.mime!=='string'||node.mime.length>256||!(/^[a-f0-9]{64}$/).test(node.sha256))fail('An image in this album backup is invalid.');
  const data=unbase64(node.data,node.size);if(await digest(data)!==node.sha256)fail('An image in this album backup failed its integrity check.');
  if(node.file){
   if(typeof node.file.name!=='string'||!Number.isFinite(node.file.lastModified))fail('An original file in this album backup is invalid.');
   return new File([data],node.file.name,{type:node.mime,lastModified:node.file.lastModified});
  }
  return new Blob([data],{type:node.mime});
 }
 if(node.type==='array'&&Array.isArray(node.items)){const out=[];for(const item of node.items)out.push(await decode(item,b,depth+1));return out;}
 if(node.type==='object'&&Array.isArray(node.entries)){
  const out={};for(const pair of node.entries){
   if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||Object.hasOwn(out,pair[0]))fail('The album backup has a duplicate or invalid field.');
   Object.defineProperty(out,pair[0],{value:await decode(pair[1],b,depth+1),enumerable:true,configurable:true,writable:true});
  }return out;
 }
 fail('The album backup has an unknown value type.');
}
function validateSnapshot(snapshot){
 if(!snapshot||typeof snapshot!=='object')fail('The album backup is incomplete.');
 for(const name of ['shots','stickers','metadata']){
  const records=snapshot[name];if(!Array.isArray(records)||records.length>MAX_RECORDS)fail('The album backup has an invalid record list.');
  const ids=new Set();for(const record of records){
   if(!record||typeof record!=='object'||Array.isArray(record)||typeof record.id!=='string'||!record.id||record.id.length>1024||ids.has(record.id))fail('The album backup has a duplicate or invalid record ID.');
   ids.add(record.id);
  }
 }
 return snapshot;
}

/** Encodes all saved fields, originals, finished images, thumbnails and custom stickers without changing the album. */
export async function encodeAlbumBackup(snapshot){
 validateSnapshot(snapshot);
 const payload=await encode(snapshot,budget()),encoded=JSON.stringify(payload);
 const file=new Blob([JSON.stringify({format:FORMAT,version:VERSION,exportedAt:new Date().toISOString(),sha256:await textDigest(encoded),payload})],{type:'application/json'});
 if(file.size>BACKUP_FILE_LIMIT)fail('This album backup exceeds the 256 MB file limit.');return file;
}
/** Checks the complete file and every image before exposing any records for a restore. */
export async function decodeAlbumBackup(file){
 if(!(file instanceof Blob)||file.size>BACKUP_FILE_LIMIT)fail('Choose a Pocket Camera backup smaller than 256 MB.');
 let archive;try{archive=JSON.parse(await file.text());}catch{fail('This is not a readable Pocket Camera album backup.');}
 if(archive?.format!==FORMAT||archive.version!==VERSION)fail('This Pocket Camera backup format or version is not supported.');
 if(typeof archive.sha256!=='string'||await textDigest(JSON.stringify(archive.payload))!==archive.sha256)fail('This album backup failed its integrity check. Nothing was imported.');
 return validateSnapshot(await decode(archive.payload,budget()));
}
export async function makeAlbumBackup(){return encodeAlbumBackup(await snapshotAlbum());}

/** Exact duplicate IDs are skipped; a different record with the same ID stops the complete restore. */
export async function restoreAlbumBackup(file){
 const incoming=await decodeAlbumBackup(file),existing=await snapshotAlbum(),pending={shots:[],stickers:[],metadata:incoming.metadata};
 const skipped={shots:0,stickers:0};
 for(const name of ['shots','stickers']){
  const byId=new Map(existing[name].map(record=>[record.id,record]));
  for(const record of incoming[name]){
   const current=byId.get(record.id);if(!current){pending[name].push(record);continue;}
   if(JSON.stringify(await encode(current,budget()))!==JSON.stringify(await encode(record,budget())))fail('A different saved item has the same ID. Nothing was imported; both your album and backup are unchanged.');
   skipped[name]++;
  }
 }
 const added=await restoreAlbum(pending);
 return {added:added.shots,skipped:skipped.shots,stickersAdded:added.stickers,stickersSkipped:skipped.stickers};
}
