const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const {syncDesktopIcon}=require('../desktop-integration.cjs');
for(const mode of ['animated','plain','bad'])test('real installer '+mode+' update preserves saves and switches only a verified package',()=>{
 const result=JSON.parse(execFileSync('python3',[path.join(__dirname,'installer-fixture.py'),mode],{encoding:'utf8'}));assert.equal(result.passed,true);
});
test('existing owned launcher gains the icon on first updated launch; portable and foreign shortcuts are untouched',()=>{
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'world-icon-')),installRoot=path.join(home,'install'),dataHome=path.join(home,'data');
 try{
  const desktop=path.join(dataHome,'applications/johansson-world.desktop'),icon=path.join(installRoot,'current/resources/app/site/desktop/icons/johansson-world-512.png');fs.mkdirSync(path.dirname(desktop),{recursive:true});fs.mkdirSync(path.dirname(icon),{recursive:true});fs.writeFileSync(icon,'fixture');
  const content='[Desktop Entry]\nName=Johansson World\nExec="'+home+'/.local/bin/johansson-world"\nTerminal=false\n';fs.writeFileSync(desktop,content);
  assert.equal(syncDesktopIcon({installRoot,home,dataHome}),false);fs.writeFileSync(path.join(installRoot,'.johansson-world-install'),'owned');
  assert.equal(syncDesktopIcon({installRoot,home,dataHome}),true);assert.match(fs.readFileSync(desktop,'utf8'),/Icon=.*johansson-world-512.png/);assert.equal(syncDesktopIcon({installRoot,home,dataHome}),false);
  fs.writeFileSync(desktop,content.replace('/.local/bin/johansson-world','/another-game'));assert.equal(syncDesktopIcon({installRoot,home,dataHome}),false);
 }finally{fs.rmSync(home,{recursive:true,force:true});}
});
