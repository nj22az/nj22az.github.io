/**
 * A small ZIP writer and reader for the album backup (backup.js): stored entries only (photos are already compressed),
 * UTF-8 names, CRC-32 checked both ways. The archive is assembled from Blobs, so a large album is never copied into one
 * buffer; reading slices the chosen file instead of loading it. Plain ZIP (no ZIP64): at most 65,535 entries and 4 GB.
 */
const TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const LIMIT=0xffffffff,MAX_ENTRIES=0xffff,UTF8=0x0800;

/** CRC-32 (the ZIP polynomial) of bytes, continuing from `crc`. */
export function crc32(bytes,crc=0){
 let c=~crc>>>0;
 for(let i=0;i<bytes.length;i++)c=TABLE[(c^bytes[i])&255]^(c>>>8);
 return ~c>>>0;
}
async function blobCrc(blob){
 // In pieces, so a large photo does not need a second full copy beside the one being read.
 let crc=0;for(let at=0;at<blob.size;at+=8<<20)crc=crc32(new Uint8Array(await blob.slice(at,at+(8<<20)).arrayBuffer()),crc);
 return crc;
}
function dosTime(date){
 const d=date instanceof Date&&!Number.isNaN(+date)?date:new Date();
 const y=Math.min(2107,Math.max(1980,d.getFullYear()));
 return {time:(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date:((y-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()};
}
const encoder=new TextEncoder();

/**
 * Makes a ZIP Blob from entries [{name, data: Blob|string|Uint8Array, date?}], in order. `progress(done, total)` is told
 * after each entry. Throws if the archive would need ZIP64.
 */
export async function makeZip(entries,{progress=()=>{}}={}){
 if(entries.length>MAX_ENTRIES)throw new Error('Too many files for one backup');
 const parts=[],central=[];let offset=0;
 for(let i=0;i<entries.length;i++){
  const e=entries[i],name=encoder.encode(e.name);
  const data=e.data instanceof Blob?e.data:new Blob([typeof e.data==='string'?encoder.encode(e.data):e.data]);
  const crc=await blobCrc(data),size=data.size,{time,date}=dosTime(e.date);
  if(size>=LIMIT||offset>=LIMIT)throw new Error('This album is too large for one backup file (4 GB)');
  const local=new DataView(new ArrayBuffer(30));
  local.setUint32(0,0x04034b50,true);local.setUint16(4,20,true);local.setUint16(6,UTF8,true);local.setUint16(8,0,true);
  local.setUint16(10,time,true);local.setUint16(12,date,true);local.setUint32(14,crc,true);local.setUint32(18,size,true);
  local.setUint32(22,size,true);local.setUint16(26,name.length,true);local.setUint16(28,0,true);
  const head=new DataView(new ArrayBuffer(46));
  head.setUint32(0,0x02014b50,true);head.setUint16(4,20,true);head.setUint16(6,20,true);head.setUint16(8,UTF8,true);head.setUint16(10,0,true);
  head.setUint16(12,time,true);head.setUint16(14,date,true);head.setUint32(16,crc,true);head.setUint32(20,size,true);head.setUint32(24,size,true);
  head.setUint16(28,name.length,true);head.setUint32(42,offset,true);
  parts.push(local.buffer,name,data);central.push(head.buffer,name);
  offset+=30+name.length+size;
  progress(i+1,entries.length);
 }
 const centralSize=central.reduce((n,p)=>n+p.byteLength,0);
 if(offset+centralSize>=LIMIT)throw new Error('This album is too large for one backup file (4 GB)');
 const end=new DataView(new ArrayBuffer(22));
 end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
 end.setUint32(12,centralSize,true);end.setUint32(16,offset,true);
 return new Blob([...parts,...central,end.buffer],{type:'application/zip'});
}

const view=async(blob,start,length)=>new DataView(await blob.slice(start,start+length).arrayBuffer());

/**
 * Reads the directory of a ZIP Blob made by makeZip (stored entries): [{name, size, crc, blob(type), bytes()}]. Each
 * entry's `blob(type)` is a slice of the file (nothing is copied); `check()` verifies its CRC. Throws on anything that is
 * not such an archive.
 */
export async function readZip(file){
 const notOurs=()=>new Error('This is not a Pocket Camera backup');
 if(!(file instanceof Blob)||file.size<22)throw notOurs();
 const tail=Math.min(file.size,22+0xffff),start=file.size-tail,bytes=new Uint8Array(await file.slice(start).arrayBuffer());
 let at=-1;for(let i=bytes.length-22;i>=0;i--)if(bytes[i]===0x50&&bytes[i+1]===0x4b&&bytes[i+2]===5&&bytes[i+3]===6){at=i;break;}
 if(at<0)throw notOurs();
 const end=new DataView(bytes.buffer,at,22),count=end.getUint16(10,true),size=end.getUint32(12,true),offset=end.getUint32(16,true);
 if(offset+size>file.size)throw notOurs();
 const dir=await view(file,offset,size),decoder=new TextDecoder(),entries=[];
 let p=0;
 for(let i=0;i<count;i++){
  if(p+46>size||dir.getUint32(p,true)!==0x02014b50)throw notOurs();
  const method=dir.getUint16(p+10,true),crc=dir.getUint32(p+16,true),packed=dir.getUint32(p+20,true),length=dir.getUint32(p+24,true);
  const nameLength=dir.getUint16(p+28,true),extra=dir.getUint16(p+30,true),comment=dir.getUint16(p+32,true),local=dir.getUint32(p+42,true);
  const name=decoder.decode(new Uint8Array(dir.buffer,dir.byteOffset+p+46,nameLength));
  p+=46+nameLength+extra+comment;
  if(method!==0||packed!==length)throw new Error('This backup uses compression Pocket Camera does not read');
  const head=await view(file,local,30);
  if(head.getUint32(0,true)!==0x04034b50)throw notOurs();
  const data=local+30+head.getUint16(26,true)+head.getUint16(28,true);
  if(data+length>file.size)throw notOurs();
  entries.push({name,size:length,crc,blob:(type='')=>file.slice(data,data+length,type),
   async check(){if(await blobCrc(file.slice(data,data+length))!==crc)throw new Error(`The backup is damaged (${name})`);}});
 }
 return entries;
}
