import {cpSync,mkdirSync,readFileSync,writeFileSync,readdirSync,existsSync,renameSync,rmSync,statSync} from 'node:fs';
import {resolve,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import releaseFiles from '../release-files.cjs';
import patchBuilder from './build-patch.cjs';
const app=resolve(import.meta.dirname,'..'),repo=resolve(app,'..');
const site=join(app,'site');rmSync(site,{recursive:true,force:true});mkdirSync(site,{recursive:true});
const omit=new Set(['node_modules','.git','tests','tools','scripts','art','briefs','output']);
for(const dir of ['johansson-town','avatar-creator','form-3d-studio','assets','css']){
 if(existsSync(join(repo,dir)))cpSync(join(repo,dir),join(site,dir),{recursive:true,filter:source=>!omit.has(basename(source))&&!basename(source).startsWith('.')&&source!==join(repo,'johansson-town/docs')});
}
// Keep the runtime component notice while leaving historical plans and QA captures out.
mkdirSync(join(site,'johansson-town/docs'),{recursive:true});
cpSync(join(repo,'johansson-town/docs/SPECTOR-LICENSE.txt'),join(site,'johansson-town/docs/SPECTOR-LICENSE.txt'));
for(const name of ['LICENSE.md','THIRD_PARTY_NOTICES.md','config.js','shared.js','styles.css','theme-bootstrap.js']){
 if(existsSync(join(repo,name)))cpSync(join(repo,name),join(site,name));
}
function patch(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const p=join(directory,entry.name);if(entry.isDirectory())patch(p);else if(entry.name.endsWith('.html')){let html=readFileSync(p,'utf8');html=html.replace(/<link\b[^>]*href=["']https?:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g,'');writeFileSync(p,html);}}}
patch(site);
cpSync(join(app,'ui'),join(site,'desktop'),{recursive:true});
const townIndex=join(site,'johansson-town/index.html');
writeFileSync(townIndex,readFileSync(townIndex,'utf8').replace('function pollPads() {','function pollPads() {\n    if(window.johanssonDesktop)return;').replace("Offline Linux edition · Start: pause menu · L3: hide HUD","Offline Linux edition · ☰ Menu: pause · D-pad down: hide HUD").replace('</head>','<link rel="stylesheet" href="../desktop/console.css"><script type="module" src="../desktop/console-ui.mjs"></script></head>'));

writeFileSync(join(site,'johansson-town','desktop-build.json'),JSON.stringify({version:JSON.parse(readFileSync(join(app,'package.json'))).version,source:process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),offline:true}));
if(process.argv.includes('--site-only'))process.exit(0);
const electron=join(app,'node_modules/electron/dist'),out=join(app,'dist'),bundle=join(out,'johansson-world');
rmSync(bundle,{recursive:true,force:true});mkdirSync(out,{recursive:true});cpSync(electron,bundle,{recursive:true});
renameSync(join(bundle,'electron'),join(bundle,'JohanssonWorld'));
const resources=join(bundle,'resources/app');mkdirSync(resources,{recursive:true});
for(const name of ['package.json','main.cjs','preload.cjs','storage.cjs','updater.cjs','desktop-integration.cjs','release-files.cjs'])cpSync(join(app,name),join(resources,name));
cpSync(site,join(resources,'site'),{recursive:true});
cpSync(join(app,'README.md'),join(bundle,'README.md'));
cpSync(join(app,'install.sh'),join(bundle,'install.sh'));
const version=JSON.parse(readFileSync(join(app,'package.json'))).version;
const inventory=releaseFiles.inventory(bundle,version);
writeFileSync(join(bundle,'bundle-manifest.json'),JSON.stringify(inventory));
writeFileSync(join(out,'bundle-manifest.json'),JSON.stringify(inventory));
execFileSync('tar',['-czf',join(out,'johansson-world-linux-x64.tar.gz'),'-C',out,'johansson-world']);
const file=join(out,'johansson-world-linux-x64.tar.gz'),sha256=createHash('sha256').update(readFileSync(file)).digest('hex');
const tag='johansson-world-linux-v'+version;
const manifest={version,archiveUrl:'https://github.com/nj22az/nj22az.github.io/releases/download/'+tag+'/johansson-world-linux-x64.tar.gz',sha256,bytes:statSync(file).size};
// The first patch-capable release has no compatible predecessor. Subsequent
// builds compare its small public inventory, without downloading the old game.
if(process.env.JOHANSSON_PATCH_BASE&&existsSync(process.env.JOHANSSON_PATCH_BASE)){
 const base=releaseFiles.validateInventory(JSON.parse(readFileSync(process.env.JOHANSSON_PATCH_BASE)));
 const patch=patchBuilder.buildPatch({base,target:inventory,bundle,out,releaseURL:'https://github.com/nj22az/nj22az.github.io/releases/download/'+tag});
 if(patch&&patch.bytes<manifest.bytes)manifest.patches=[patch];
}
writeFileSync(join(out,'latest-linux.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(out,'SHA256SUMS'),sha256+'  johansson-world-linux-x64.tar.gz\n'+(manifest.patches||[]).map(p=>p.sha256+'  '+new URL(p.archiveUrl).pathname.split('/').pop()+'\n').join(''));
console.log(JSON.stringify(manifest));
