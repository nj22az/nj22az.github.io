import {open,realpath,stat} from 'node:fs/promises';
import {resolve,relative,isAbsolute,basename} from 'node:path';

export const MAX_IMAGE_BYTES=20*1024*1024;
export function imageType(bytes){
 if(bytes.length>MAX_IMAGE_BYTES||bytes.length<12)throw Error('Image must contain 12 bytes to 20 MiB.');
 if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'image/webp';
 throw Error('Use a PNG, JPEG or WebP image; SVG and other formats are not accepted.');
}
export function decodeImage(data){
 if(typeof data!=='string'||data.length>Math.ceil(MAX_IMAGE_BYTES/3)*4||!data.length||data.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(data))throw Error('Expected bounded, padded base64 image bytes, not a URL.');
 const bytes=Buffer.from(data,'base64');
 if(bytes.toString('base64')!==data)throw Error('Invalid base64 image bytes.');
 return {bytes,mimeType:imageType(bytes)};
}
export async function readImage(inputRoot,path){
 if(!inputRoot)throw Error('Set CAMERA_MCP_INPUT_DIR to a folder of approved images, or supply base64 image bytes.');
 const root=await realpath(inputRoot),file=await realpath(resolve(root,path)),rel=relative(root,file);
 if(!rel||rel==='..'||rel.startsWith('../')||rel.startsWith('..\\')||isAbsolute(rel))throw Error('Image is outside CAMERA_MCP_INPUT_DIR.');
 const info=await stat(file);if(!info.isFile()||info.size>MAX_IMAGE_BYTES)throw Error('Image must be a regular file no larger than 20 MiB.');
 const handle=await open(file,'r');
 try{
  const actual=await handle.stat();if(!actual.isFile()||actual.size>MAX_IMAGE_BYTES)throw Error('Image changed while opening.');
  const bytes=Buffer.alloc(actual.size);let offset=0;
  while(offset<bytes.length){const {bytesRead}=await handle.read(bytes,offset,bytes.length-offset,offset);if(!bytesRead)throw Error('Image changed while reading.');offset+=bytesRead;}
  return {bytes,mimeType:imageType(bytes),name:basename(file)};
 }finally{await handle.close();}
}
export function validateEdit(edit,catalog){
 if(!edit||typeof edit!=='object'||Array.isArray(edit))throw Error('Pass an edit object.');
 const known=['layers','adjust','enhance','paper','frame','crop'];
 for(const key of Object.keys(edit))if(!known.includes(key))throw Error(`Unsupported edit field: ${key}`);
 if(!Object.keys(edit).length)throw Error('Supply at least one edit.');
 const range=(n,min,max,label)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error(`${label} must be between ${min} and ${max}.`);};
 if(edit.layers!==undefined){
  if(!Array.isArray(edit.layers)||!edit.layers.length||edit.layers.length>3)throw Error('Use one to three Look layers.');
  for(const layer of edit.layers){
   if(!layer||Object.keys(layer).some(k=>!['look','amount'].includes(k))||!catalog.looks.some(l=>l.id===layer.look))throw Error('Unknown Look; call camera_catalog first.');
   range(layer.amount,0,1,'Look intensity');
  }
 }
 if(edit.adjust!==undefined){
  if(!edit.adjust||typeof edit.adjust!=='object'||Array.isArray(edit.adjust))throw Error('Adjust must be an object.');
  for(const [key,value] of Object.entries(edit.adjust)){if(!['light','contrast','colour','warmth','pattern','detail'].includes(key))throw Error(`Unknown adjustment: ${key}`);range(value,-1,1,key);}
 }
 if(edit.enhance!==undefined)range(edit.enhance,0,1,'Enhance');
 for(const field of ['frame','paper'])if(edit[field]!==undefined&&!catalog[field+'s'].some(v=>v.id===edit[field]))throw Error(`Unknown ${field}; call camera_catalog first.`);
 if(edit.crop!==undefined){
  const c=edit.crop;if(!c||Object.keys(c).length!==4||Object.keys(c).some(k=>!['x','y','w','h'].includes(k)))throw Error('Crop needs exactly x, y, w and h.');
  for(const key of ['x','y','w','h'])range(c[key],0,1,`Crop ${key}`);
  if(c.w<.01||c.h<.01||c.x+c.w>1+1e-9||c.y+c.h>1+1e-9)throw Error('Crop must stay inside the original image and be at least 1% wide and high.');
 }
 return edit;
}
