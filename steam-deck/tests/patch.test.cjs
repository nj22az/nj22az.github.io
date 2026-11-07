const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {inventory,validateInventory,verify}=require('../release-files.cjs'),{createUpdater}=require('../updater.cjs'),{buildPatch}=require('../tools/build-patch.cjs');
for(const scenario of ['patch','linked install','modified base','different engine','corrupt patch','symlink patch','wrong target'])test('real file updater: '+scenario,async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-patch-'));
 try{
  const root=path.join(dir,'install'),old=path.join(root,'versions/v0.2.7'),bundle=path.join(dir,'new/johansson-world'),out=path.join(dir,'out');
  fs.mkdirSync(path.join(old,'resources/app/site'),{recursive:true});fs.mkdirSync(out);fs.writeFileSync(path.join(root,'.johansson-world-install'),'test');fs.symlinkSync(old,path.join(root,'current'));
  const write=(root,name,bytes)=>{const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);};
  write(old,'JohanssonWorld','#!/bin/sh\nexit 0\n');fs.chmodSync(path.join(old,'JohanssonWorld'),0o755);write(old,'engine.bin',crypto.randomBytes(100000));write(old,'resources/app/site/old.js','retired');write(old,'resources/app/site/keep.bin',crypto.randomBytes(4000));write(old,'resources/app/package.json','{"version":"0.2.7"}');
  const base=inventory(old,'0.2.7');write(old,'bundle-manifest.json',JSON.stringify(base));fs.cpSync(old,bundle,{recursive:true});
  fs.rmSync(path.join(bundle,'resources/app/site/old.js'));write(bundle,'resources/app/site/new.js','new controls');write(bundle,'resources/app/package.json','{"version":"0.2.8"}');
  if(scenario==='different engine')write(bundle,'engine.bin',crypto.randomBytes(100000));
  const target=inventory(bundle,'0.2.8');write(bundle,'bundle-manifest.json',JSON.stringify(target));
  const releaseURL='https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v0.2.8';
  const patch=buildPatch({base,target,bundle,out,releaseURL});if(scenario==='different engine')assert.equal(patch,null);else assert.ok(patch.bytes<2000,'Only changed game files travel');
  const full=path.join(out,'full.tar.gz');execFileSync('tar',['-czf',full,'-C',path.dirname(bundle),'johansson-world']);const bytes=fs.readFileSync(full),manifest={version:'0.2.8',archiveUrl:releaseURL+'/full.tar.gz',bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),patches:patch?[patch]:[]};
  if(scenario==='modified base')write(old,'resources/app/site/old.js','locally edited');
  if(scenario==='symlink patch'||scenario==='wrong target'){
   const bad=path.join(dir,'bad/johansson-world');fs.mkdirSync(bad,{recursive:true});
   if(scenario==='symlink patch')fs.symlinkSync('/tmp',path.join(bad,'escape'));else write(bad,'bundle-manifest.json',JSON.stringify(base));
   const file=path.join(out,new URL(patch.archiveUrl).pathname.split('/').pop());execFileSync('tar',['-czf',file,'-C',path.dirname(bad),'johansson-world']);const data=fs.readFileSync(file);patch.bytes=data.length;patch.sha256=crypto.createHash('sha256').update(data).digest('hex');
  }
  const downloads=[];
  const fetchImpl=async url=>{if(url.includes('api.github.com'))return new Response(JSON.stringify([{tag_name:'johansson-world-linux-v0.2.7',assets:[{name:'latest-linux.json'}]},{tag_name:'johansson-world-linux-v0.2.8',assets:[{name:'latest-linux.json',browser_download_url:releaseURL+'/latest-linux.json'}]}]));if(url.endsWith('latest-linux.json'))return new Response(JSON.stringify(manifest));downloads.push(url);return new Response(url.endsWith('/full.tar.gz')?bytes:scenario==='corrupt patch'?Buffer.from('corrupt'):fs.readFileSync(path.join(out,new URL(url).pathname.split('/').pop())));};
  const updater=createUpdater({version:'0.2.7',installRoot:root,bundleRoot:scenario==='linked install'?path.join(root,'current'):old,fetchImpl});const check=await updater.check();assert.equal(check.next,'0.2.8','Highest version wins, even if release publication order differs');assert.equal(check.kind,patch?'patch':'full');
  if(['corrupt patch','symlink patch','wrong target'].includes(scenario)){await assert.rejects(updater.install());assert.equal(updater.readyExecutable(),null);}else{
   const result=await updater.install();assert.equal(result.kind,['patch','linked install'].includes(scenario)?'patch':'full');assert.equal(downloads.length,1);
   const staged=path.join(root,'versions/v0.2.8');verify(staged,target);assert.ok(!fs.existsSync(path.join(staged,'resources/app/site/old.js')));assert.equal(fs.realpathSync(path.join(root,'current')),fs.realpathSync(old),'Install stages only');
   assert.equal(updater.readyExecutable(),path.join(staged,'JohanssonWorld'));assert.equal(fs.realpathSync(path.join(root,'previous')),fs.realpathSync(old));
  }
  assert.equal(fs.readFileSync(path.join(old,'resources/app/package.json'),'utf8'),'{"version":"0.2.7"}','Previous version is untouched');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('file manifests reject traversal and forged trees',()=>{assert.throws(()=>validateInventory({format:1,version:'0.2.7',files:{'../outside':{sha256:'a'.repeat(64),bytes:1,mode:420}}}));});
