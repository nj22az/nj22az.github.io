const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {validateInventory}=require('../release-files.cjs');
function buildPatch({base,target,bundle,out,releaseURL}){
 validateInventory(base);validateInventory(target);
 if(base.runtime!==target.runtime||base.version===target.version)return null;
 const staging=fs.mkdtempSync(path.join(out,'.patch-')),payload=path.join(staging,'johansson-world');fs.mkdirSync(payload);
 try{
  for(const [name,entry] of Object.entries(target.files))if(JSON.stringify(entry)!==JSON.stringify(base.files[name])){const destination=path.join(payload,name);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(bundle,name),destination);fs.chmodSync(destination,entry.mode);}
  fs.writeFileSync(path.join(payload,'bundle-manifest.json'),JSON.stringify(target));
  const filename='johansson-world-linux-'+base.version+'-to-'+target.version+'.patch.tar.gz',archive=path.join(out,filename);
  execFileSync('tar',['-czf',archive,'-C',staging,'johansson-world']);
  return {from:base.version,baseTree:base.tree,runtime:base.runtime,archiveUrl:releaseURL+'/'+filename,sha256:crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),bytes:fs.statSync(archive).size};
 }finally{fs.rmSync(staging,{recursive:true,force:true});}
}
module.exports={buildPatch};
