const fs=require('node:fs');
const path=require('node:path');
function cleanSnapshot(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid save snapshot');
 const clean={};
 for(const [key,value] of Object.entries(data)){
  if(!/^(johansson[-:]|avatar[-:]|studio[-:])/.test(key)||typeof value!=='string')continue;
  if(key.length>200||value.length>12*1024*1024)throw Error('Save is too large');
  clean[key]=value;
 }
 if(Buffer.byteLength(JSON.stringify(clean))>24*1024*1024)throw Error('Save collection is too large');
 return clean;
}
function writeSnapshot(directory,data){
 const clean=cleanSnapshot(data);fs.mkdirSync(directory,{recursive:true});
 const file=path.join(directory,'progress.json'),temp=file+'.tmp',previous=file+'.previous';
 if(fs.existsSync(file)){try{JSON.parse(fs.readFileSync(file,'utf8'));fs.copyFileSync(file,previous);}catch{}}
 const fd=fs.openSync(temp,'w',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(clean));fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
 fs.renameSync(temp,file);return {ok:true,at:Date.now()};
}
function readSnapshot(directory){
 for(const name of ['progress.json','progress.json.previous'])try{return cleanSnapshot(JSON.parse(fs.readFileSync(path.join(directory,name),'utf8')));}catch{}
 return {};
}
module.exports={cleanSnapshot,writeSnapshot,readSnapshot};
