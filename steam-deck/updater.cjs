const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {Readable,Transform}=require('node:stream');
const {pipeline}=require('node:stream/promises');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
const {validateInventory,verify,runtimeFile}=require('./release-files.cjs');
const REPO='nj22az/nj22az.github.io',MAX_ARCHIVE=700*1024*1024;
const semver=v=>/^\d+\.\d+\.\d+$/.test(v);
function newer(a,b){if(!semver(a)||!semver(b))return false;const A=a.split('.').map(Number),B=b.split('.').map(Number);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i];}return false;}
function trustedURL(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='github.com'&&u.pathname.startsWith('/'+REPO+'/releases/download/');}catch{return false;}}
function validateManifest(m){if(!m||!semver(m.version)||!trustedURL(m.archiveUrl)||!/^[a-f0-9]{64}$/.test(m.sha256)||!Number.isSafeInteger(m.bytes)||m.bytes<1024||m.bytes>MAX_ARCHIVE)throw Error('Invalid update manifest');return m;}
function validateMembers(text){for(const name of text.trim().split('\n')){if(name!=='johansson-world/'&&(!name.startsWith('johansson-world/')||name.split('/').includes('..')||name.includes('\\')||/[\x00-\x1f\x7f]/.test(name)))throw Error('Unsafe update archive');}}
function createUpdater({version,installRoot,bundleRoot,fetchImpl=fetch}){
 let candidate=null,ready=null,busy=false,patch=null;
 function installed(){try{const m=validateInventory(JSON.parse(fs.readFileSync(path.join(bundleRoot,'bundle-manifest.json'))));return m.version===version?m:null;}catch{return null;}}
 const owned=()=>installRoot&&fs.existsSync(path.join(installRoot,'.johansson-world-install'));
 async function json(url){const r=await fetchImpl(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'Johansson-World-Updater'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Update service returned '+r.status);return r.json();}
 return {
  async check(){
   const releases=await json('https://api.github.com/repos/'+REPO+'/releases?per_page=30');
   if(!Array.isArray(releases))throw Error('Update service returned an invalid release list');
   candidate=null;patch=null;
   const release=releases.filter(r=>!r.draft&&r.tag_name?.startsWith('johansson-world-linux-v')&&semver(r.tag_name.slice('johansson-world-linux-v'.length))&&r.assets?.some(a=>a.name==='latest-linux.json')).sort((a,b)=>newer(a.tag_name.slice('johansson-world-linux-v'.length),b.tag_name.slice('johansson-world-linux-v'.length))?-1:1)[0];
   if(!release)return {available:false,version};
   const asset=release.assets.find(a=>a.name==='latest-linux.json');
   if(!trustedURL(asset.browser_download_url))throw Error('Unrecognised update source');
   const manifest=validateManifest(await json(asset.browser_download_url));
   if(release.tag_name!=='johansson-world-linux-v'+manifest.version)throw Error('Release version does not match its manifest');
   candidate=newer(manifest.version,version)?manifest:null;
   const base=installed();
   patch=candidate&&base&&Array.isArray(candidate.patches)?candidate.patches.find(p=>p.from===version&&p.baseTree===base.tree&&p.runtime===base.runtime&&trustedURL(p.archiveUrl)&&/^[a-f0-9]{64}$/.test(p.sha256)&&Number.isSafeInteger(p.bytes)&&p.bytes>0&&p.bytes<candidate.bytes):null;
   return {available:!!candidate,version,next:candidate?.version,canInstall:!!owned(),notes:release.body||'',downloadBytes:patch?.bytes||candidate?.bytes,kind:patch?'patch':'full'};
  },
  async install(){
   if(busy)throw Error('An update is already downloading');
   if(!candidate)throw Error('Check for an update first');
   if(!owned())throw Error('Use the Linux installer to enable in-game updates. Portable files are not changed.');
   busy=true;let temporary;
   try{
    const versions=path.join(installRoot,'versions');await fsp.mkdir(versions,{recursive:true});
    temporary=await fsp.mkdtemp(path.join(versions,'.update-'));
    let delivery=patch||candidate;
    // A modified installation cannot safely receive a file patch. Repair it with
    // the complete package instead, before downloading anything.
    if(patch){try{verify(bundleRoot,installed());}catch{patch=null;delivery=candidate;}}
    const archive=path.join(temporary,'download.tar.gz');
    const response=await fetchImpl(delivery.archiveUrl,{signal:AbortSignal.timeout(600000)});
    if(!response.ok||!response.body)throw Error('Update download failed');
    let bytes=0;const hash=crypto.createHash('sha256');
    const meter=new Transform({transform(chunk,_encoding,done){bytes+=chunk.length;if(bytes>delivery.bytes||bytes>MAX_ARCHIVE)return done(Error('Update exceeds the declared size'));hash.update(chunk);done(null,chunk);}});
    await pipeline(Readable.fromWeb(response.body),meter,fs.createWriteStream(archive,{mode:0o600}));
    if(bytes!==delivery.bytes||hash.digest('hex')!==delivery.sha256)throw Error('Update checksum verification failed');
    const listing=await run('tar',['-tzf',archive],{maxBuffer:8*1024*1024});validateMembers(listing.stdout);
    const types=await run('tar',['-tvzf',archive],{maxBuffer:8*1024*1024});
    if(types.stdout.trim().split('\n').some(line=>!['-','d'].includes(line[0])))throw Error('Update archives may contain only regular files and directories');
    const extracted=path.join(temporary,'app');await fsp.mkdir(extracted);
    await run('tar',['-xzf',archive,'--strip-components=1','-C',extracted]);
    let staged=extracted;
    const manifestFile=path.join(extracted,'bundle-manifest.json');
    if(patch){
     const base=installed(),target=validateInventory(JSON.parse(await fsp.readFile(manifestFile,'utf8')));
     if(target.version!==candidate.version||target.runtime!==base.runtime)throw Error('Incompatible patch target');
     // Patches can update the shell/game and docs, never the Electron runtime.
     for(const [name,entry] of Object.entries(target.files))if(runtimeFile(name)&&JSON.stringify(entry)!==JSON.stringify(base.files[name]))throw Error('Patch changes the engine');
     for(const name of Object.keys(base.files))if(runtimeFile(name)&&!target.files[name])throw Error('Patch removes engine files');
     staged=path.join(temporary,'patched');
     await fsp.cp(bundleRoot,staged,{recursive:true,mode:fs.constants.COPYFILE_FICLONE});
     for(const name of Object.keys(base.files))if(!target.files[name])await fsp.rm(path.join(staged,name));
     // Copy overlay after removing file/directory conflicts. Never mutate the base.
     for(const name of Object.keys(target.files)){
      const source=path.join(extracted,name);
      if(!fs.existsSync(source))continue;
      const destination=path.join(staged,name);await fsp.rm(destination,{recursive:true,force:true});await fsp.mkdir(path.dirname(destination),{recursive:true});await fsp.copyFile(source,destination);await fsp.chmod(destination,target.files[name].mode);
     }
     await fsp.copyFile(manifestFile,path.join(staged,'bundle-manifest.json'));
     verify(staged,target);
    }else if(fs.existsSync(manifestFile)){
     const target=validateInventory(JSON.parse(await fsp.readFile(manifestFile,'utf8')));if(target.version!==candidate.version)throw Error('Wrong version in update');verify(staged,target);
    }
    const binary=path.join(staged,'JohanssonWorld');await fsp.access(binary,fs.constants.X_OK);
    const destination=path.join(versions,'v'+candidate.version);
    if(fs.existsSync(destination))throw Error('This update version already exists. Your current installation is unchanged.');
    await fsp.rename(staged,destination);ready=destination;
    return {ready:true,version:candidate.version,kind:patch?'patch':'full',downloadBytes:delivery.bytes};
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
