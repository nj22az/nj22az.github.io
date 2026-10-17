const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {writeSnapshot,readSnapshot,cleanSnapshot}=require('../storage.cjs');
const {newer,validateManifest,validateMembers}=require('../updater.cjs');
test('atomic saves preserve named slots and recover the previous valid copy',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world-save-'));
 try{writeSnapshot(dir,{'johansson-town-players':'{"active":"p2"}','johansson-town-1988-v5@p2':'{"yen":4321}'});writeSnapshot(dir,{'johansson-town-1988-v5@p2':'{"yen":4333}'});fs.writeFileSync(path.join(dir,'progress.json'),'truncated');assert.equal(readSnapshot(dir)['johansson-town-1988-v5@p2'],'{"yen":4321}');assert.equal(cleanSnapshot({'other-site-token':'secret'})['other-site-token'],undefined);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('update version ordering and source boundaries',()=>{
 assert.equal(newer('0.3.0','0.2.0'),true);assert.equal(newer('0.2.0','0.2.0'),false);assert.equal(newer('../bad','0.2.0'),false);
 const m={version:'0.3.0',archiveUrl:'https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v0.3.0/world.tar.gz',sha256:'a'.repeat(64),bytes:2000};assert.equal(validateManifest(m),m);
 assert.throws(()=>validateManifest({...m,archiveUrl:'https://example.com/game.tar.gz'}));assert.throws(()=>validateManifest({...m,bytes:900000000}));assert.throws(()=>validateManifest({...m,sha256:'no'}));
 assert.doesNotThrow(()=>validateMembers('johansson-world/JohanssonWorld\njohansson-world/resources/app/main.cjs'));
 assert.throws(()=>validateMembers('johansson-world/../../save.json'));assert.throws(()=>validateMembers('/home/deck/file'));
});
