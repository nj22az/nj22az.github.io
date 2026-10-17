const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {writeSnapshot,readSnapshot,cleanSnapshot}=require('../storage.cjs');
const {newer,validateManifest,validateMembers}=require('../updater.cjs');
test('atomic saves preserve named slots and recover the previous valid copy',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-save-'));
 try{writeSnapshot(dir,{'johansson-town-players':'{"active":"p2"}','johansson-town-1988-v5@p2':'{"yen":4321}'});writeSnapshot(dir,{'johansson-town-1988-v5@p2':'{"yen":4333}'});fs.writeFileSync(path.join(dir,'progress.json'),'truncated');assert.equal(readSnapshot(dir)['johansson-town-1988-v5@p2'],'{"yen":4321}');assert.equal(cleanSnapshot({'other-site-token':'secret'})['other-site-token'],undefined);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('verified update is staged separately and switches only on explicit restart',async()=>{
 const crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),{createUpdater}=require('../updater.cjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-update-'));
 try{
  const root=path.join(dir,'install'),old=path.join(root,'versions/v0.2.0'),fixture=path.join(dir,'fixture/johansson-world');
  fs.mkdirSync(old,{recursive:true});fs.writeFileSync(path.join(root,'.johansson-world-install'),'test');
  fs.symlinkSync(old,path.join(root,'current'));fs.mkdirSync(fixture,{recursive:true});
  fs.writeFileSync(path.join(fixture,'JohanssonWorld'),'#!/bin/sh\nexit 0\n',{mode:0o755});fs.writeFileSync(path.join(fixture,'padding'),crypto.randomBytes(4000));
  const archive=path.join(dir,'update.tar.gz');execFileSync('tar',['-czf',archive,'-C',path.join(dir,'fixture'),'johansson-world']);
  const bytes=fs.readFileSync(archive),url='https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v0.3.0/game.tar.gz';
  const manifest={version:'0.3.0',archiveUrl:url,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  const fetchImpl=async value=>value.includes('/api.github.com/')||value.includes('api.github.com')?new Response(JSON.stringify([{tag_name:'johansson-world-linux-v0.3.0',assets:[{name:'latest-linux.json',browser_download_url:url.replace('game.tar.gz','latest-linux.json')}]}])):value.endsWith('latest-linux.json')?new Response(JSON.stringify(manifest)):new Response(bytes);
  const updater=createUpdater({version:'0.2.0',installRoot:root,fetchImpl});assert.equal((await updater.check()).available,true);assert.equal((await updater.install()).ready,true);
  assert.equal(fs.realpathSync(path.join(root,'current')),old);
  assert.equal(updater.readyExecutable(),path.join(root,'versions/v0.3.0/JohanssonWorld'));
  assert.equal(fs.realpathSync(path.join(root,'previous')),old);assert.equal(fs.realpathSync(path.join(root,'current')),path.join(root,'versions/v0.3.0'));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('update version ordering and source boundaries',()=>{
 assert.equal(newer('0.3.0','0.2.0'),true);assert.equal(newer('0.2.0','0.2.0'),false);assert.equal(newer('../bad','0.2.0'),false);
 const m={version:'0.3.0',archiveUrl:'https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v0.3.0/world.tar.gz',sha256:'a'.repeat(64),bytes:2000};assert.equal(validateManifest(m),m);
 assert.throws(()=>validateManifest({...m,archiveUrl:'https://example.com/game.tar.gz'}));assert.throws(()=>validateManifest({...m,bytes:900000000}));assert.throws(()=>validateManifest({...m,sha256:'no'}));
 assert.doesNotThrow(()=>validateMembers('johansson-world/JohanssonWorld\njohansson-world/resources/app/main.cjs'));
 assert.throws(()=>validateMembers('johansson-world/../../save.json'));assert.throws(()=>validateMembers('/home/deck/file'));
});
