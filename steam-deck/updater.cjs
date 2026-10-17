const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {Readable,Transform}=require('node:stream');
const {pipeline}=require('node:stream/promises');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
const REPO='nj22az/nj22az.github.io',MAX_ARCHIVE=700*1024*1024;
const semver=v=>/^\d+\.\d+\.\d+$/.test(v);
function newer(a,b){if(!semver(a)||!semver(b))return false;const A=a.split('.').map(Number),B=b.split('.').map(Number);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i];}return false;}
function trustedURL(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='github.com'&&u.pathname.startsWith('/'+REPO+'/releases/download/');}catch{return false;}}
function validateManifest(m){if(!m||!semver(m.version)||!trustedURL(m.archiveUrl)||!/^[a-f0-9]{64}$/.test(m.sha256)||!Number.isSafeInteger(m.bytes)||m.bytes<1024||m.bytes>MAX_ARCHIVE)throw Error('Invalid update manifest');return m;}
function validateMembers(text){for(const name of text.trim().split('\n')){if(!name.startsWith('johansson-world/')||name.split('/').includes('..')||name.includes('\\'))throw Error('Unsafe update archive');}}
function createUpdater({version,installRoot,fetchImpl=fetch}){
 let candidate=null,ready=null,busy=false;
 const owned=()=>installRoot&&fs.existsSync(path.join(installRoot,'.johansson-world-install'));
 async function json(url){const r=await fetchImpl(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'Johansson-World-Updater'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Update service returned '+r.status);return r.json();}
 return {
  async check(){
   const releases=await json('https://api.github.com/repos/'+REPO+'/releases?per_page=30');
   if(!Array.isArray(releases))throw Error('Update service returned an invalid release list');
   const release=releases.find(r=>!r.draft&&r.tag_name?.startsWith('johansson-world-linux-v')&&r.assets?.some(a=>a.name==='latest-linux.json'));
   if(!release)return {available:false,version};
   const asset=release.assets.find(a=>a.name==='latest-linux.json');
   if(!trustedURL(asset.browser_download_url))throw Error('Unrecognised update source');
   const manifest=validateManifest(await json(asset.browser_download_url));
   candidate=newer(manifest.version,version)?manifest:null;
   return {available:!!candidate,version,next:candidate?.version,canInstall:!!owned(),notes:release.body||''};
  },
  async install(){
   if(busy)throw Error('An update is already downloading');
   if(!candidate)throw Error('Check for an update first');
   if(!owned())throw Error('Use the Linux installer to enable in-game updates. Portable files are not changed.');
   busy=true;let temporary;
   try{
    const versions=path.join(installRoot,'versions');await fsp.mkdir(versions,{recursive:true});
    temporary=await fsp.mkdtemp(path.join(versions,'.update-'));
    const archive=path.join(temporary,'download.tar.gz');
    const response=await fetchImpl(candidate.archiveUrl,{signal:AbortSignal.timeout(600000)});
    if(!response.ok||!response.body)throw Error('Update download failed');
    let bytes=0;const hash=crypto.createHash('sha256');
    const meter=new Transform({transform(chunk,_encoding,done){bytes+=chunk.length;if(bytes>candidate.bytes||bytes>MAX_ARCHIVE)return done(Error('Update exceeds the declared size'));hash.update(chunk);done(null,chunk);}});
    await pipeline(Readable.fromWeb(response.body),meter,fs.createWriteStream(archive,{mode:0o600}));
    if(bytes!==candidate.bytes||hash.digest('hex')!==candidate.sha256)throw Error('Update checksum verification failed');
    const listing=await run('tar',['-tzf',archive],{maxBuffer:8*1024*1024});validateMembers(listing.stdout);
    const extracted=path.join(temporary,'app');await fsp.mkdir(extracted);
    await run('tar',['-xzf',archive,'--strip-components=1','-C',extracted]);
    const binary=path.join(extracted,'JohanssonWorld');await fsp.access(binary,fs.constants.X_OK);
    const destination=path.join(versions,'v'+candidate.version);
    if(fs.existsSync(destination))throw Error('This update version already exists. Your current installation is unchanged.');
    await fsp.rename(extracted,destination);ready=destination;
    return {ready:true,version:candidate.version};
   }finally{busy=false;if(temporary)await fsp.rm(temporary,{recursive:true,force:true});}
  },
  readyExecutable(){
   if(!ready||!owned())return null;
   const current=path.join(installRoot,'current'),next=current+'.next',previous=path.join(installRoot,'previous');
   if(fs.existsSync(current)){const old=fs.readlinkSync(current);if(fs.existsSync(previous))fs.unlinkSync(previous);fs.symlinkSync(old,previous);}
   if(fs.existsSync(next))fs.unlinkSync(next);
   fs.symlinkSync(ready,next);fs.renameSync(next,current);
   return path.join(ready,'JohanssonWorld');
  }
 };
}
module.exports={newer,validateManifest,validateMembers,createUpdater};
