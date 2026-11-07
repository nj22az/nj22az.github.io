// The album backup's ZIP (zip.js): a round trip, checksums, a standard reader, damage and foreign files.
//   node camera/tests/zip.test.mjs
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {crc32,makeZip,readZip} from '../zip.js';

let passed=0;const check=async(name,fn)=>{await fn();passed++;console.log('ok',name);};

await check('CRC-32 matches the standard check value',()=>{
 assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);
 assert.equal(crc32(new Uint8Array()),0);
});

const photo=new Uint8Array(300000);for(let i=0;i<photo.length;i++)photo[i]=(i*31+7)&255;
const entries=[
 {name:'pocket-camera-backup.json',data:JSON.stringify({format:1,app:'Pocket Camera',note:'Kōji’s ちょうちん'})},
 {name:'photos/0001-photo.jpg',data:new Blob([photo],{type:'image/jpeg'}),date:new Date(2026,9,31,18,30,10)},
 {name:'photos/0001-thumb.png',data:new Uint8Array([1,2,3])},
 {name:'stickers/0001.png',data:new Blob([])},
];
let progressCalls=0;
const zip=await makeZip(entries,{progress:()=>progressCalls++});

await check('makes one entry per file and reports progress',()=>{
 assert.equal(zip.type,'application/zip');assert.equal(progressCalls,entries.length);
});

await check('reads back every name and byte, with intact checksums',async()=>{
 const read=await readZip(zip);
 assert.deepEqual(read.map(e=>e.name),entries.map(e=>e.name));
 for(const e of read)await e.check();
 assert.deepEqual(new Uint8Array(await read[1].blob('image/jpeg').arrayBuffer()),photo);
 assert.equal(read[1].blob('image/jpeg').type,'image/jpeg');
 assert.equal(JSON.parse(await read[0].blob().text()).note,'Kōji’s ちょうちん');
 assert.equal(read[3].size,0);
});

await check('a standard ZIP reader opens it (Python zipfile)',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pocket-zip-')),file=path.join(dir,'backup.zip');
 return zip.arrayBuffer().then(b=>{
  fs.writeFileSync(file,Buffer.from(b));
  const out=execFileSync('python3',['-I','-c','import sys,zipfile,json;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(json.dumps([[i.filename,i.file_size,i.date_time[:3]] for i in z.infolist()]))',file],{encoding:'utf8'});
  const list=JSON.parse(out);
  assert.deepEqual(list.map(x=>x[0]),entries.map(e=>e.name));
  assert.equal(list[1][1],photo.length);
  assert.deepEqual(list[1][2],[2026,10,31]);
  fs.rmSync(dir,{recursive:true,force:true});
 });
});

await check('a damaged picture is caught by its checksum',async()=>{
 // Flip one byte inside the photo's data; the directory still reads, the photo's checksum does not match.
 const copy=new Uint8Array(await zip.arrayBuffer()),photoAt=findSequence(copy,photo.subarray(1000,1032));
 assert.ok(photoAt>0);copy[photoAt+5]^=0xff;
 const damaged=await readZip(new Blob([copy]));
 await damaged[0].check();
 await assert.rejects(()=>damaged[1].check(),/damaged/);
});

await check('refuses something that is not a ZIP',async()=>{
 await assert.rejects(()=>readZip(new Blob(['hello, this is not a backup at all'])),/not a Pocket Camera backup/);
 await assert.rejects(()=>readZip(new Blob([])),/not a Pocket Camera backup/);
});

await check('refuses compressed entries it cannot read',async()=>{
 const bytes=new Uint8Array(await zip.arrayBuffer()),copy=bytes.slice();
 // The first central directory record's method field: set to deflate (8).
 const dirAt=findSequence(copy,new Uint8Array([0x50,0x4b,1,2]));copy[dirAt+10]=8;
 await assert.rejects(()=>readZip(new Blob([copy])),/compression/);
});

function findSequence(haystack,needle){
 outer:for(let i=0;i<=haystack.length-needle.length;i++){for(let j=0;j<needle.length;j++)if(haystack[i+j]!==needle[j])continue outer;return i;}
 return -1;
}
console.log(`zip: ${passed} checks passed`);
