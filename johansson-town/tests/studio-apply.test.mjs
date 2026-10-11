import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink,readdir,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openRepo,writable,defaultRoot,CODE_ROOT,PATHS,jsonText} from '../tools/studio/repo.mjs';
import {applyChange} from '../tools/studio/apply.mjs';
import {looksModule} from '../tools/studio/build-data.mjs';
import {validateChange,brandProblems,pictureProblems} from '../src/studio/rules.js';
import {applyOps} from '../src/studio/change.js';
import {baseRecipe} from '../src/avatars/cast.js';
import {sha256,recordSha256} from '../src/studio/sha256.js';

// Every write here goes to a throwaway copy of Studio's data, never to the checkout.
const town=fileURLToPath(new URL('../',import.meta.url));
let root,repo,original;
before(async()=>{
 root=await mkdtemp(join(tmpdir(),'studio-apply-'));
 await mkdir(resolve(root,'johansson-town/data/studio'),{recursive:true});await mkdir(resolve(root,'johansson-town/src/avatars'),{recursive:true});
 original=jsonText({format:'johansson-looks',version:1,looks:{},characters:{}});
 await writeFile(resolve(root,PATHS.looks),original);
 await writeFile(resolve(root,PATHS.log),jsonText({format:'johansson-studio-log',version:1,changes:[]}));
 await copyFile(resolve(town,'data/studio/brand-rules.json'),resolve(root,PATHS.brands));
 await writeFile(resolve(root,PATHS.looksModule),looksModule(original));
 repo=openRepo(root);
});
after(()=>rm(root,{recursive:true,force:true}));

let n=0;
const change=(ops,extra={})=>({format:'johansson-studio-change',version:1,id:`2026-10-12T09-14Z-test-${++n}`,made:'2026-10-12T09:14:00Z',by:'claude',note:'A test of the Studio change file.',ops,...extra});
const fujita=baseRecipe('Mr Fujita');
const captain={op:'look.set',name:'Mr Fujita',set:{'outfit.hat':'captain'},was:{'outfit.hat':fujita.outfit.hat}};
async function snapshot(){
 const out={};
 async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await scan(p);else out[p.slice(root.length)]=e.isSymbolicLink()?'link':await readFile(p,'utf8');}}
 await scan(root);return out;
}
const sentences=r=>[...(r.problems||[]),...(r.conflicts||[])].map(p=>p.sentence).join(' ');

test('a dry run writes nothing, then apply and reset leave looks.json byte-identical',async()=>{
 const before=await snapshot();
 const dry=await applyChange(change([captain]),{repo});
 assert.equal(dry.ok,true,sentences(dry));assert.equal(dry.applied,false);assert.deepEqual(dry.writes,[PATHS.looks,PATHS.looksModule,PATHS.log]);
 assert.deepEqual(await snapshot(),before,'a dry run must not touch a file');
 const done=await applyChange(change([captain]),{repo,dryRun:false});
 assert.equal(done.applied,true,sentences(done));
 const looks=JSON.parse(await readFile(resolve(root,PATHS.looks),'utf8'));
 assert.deepEqual(looks.looks['Mr Fujita'].set,{'outfit.hat':'captain'});
 assert.equal(await readFile(resolve(root,PATHS.looksModule),'utf8'),looksModule(await readFile(resolve(root,PATHS.looks),'utf8')),'World\'s module is regenerated');
 // Applying the same change again changes nothing (World already has it).
 const again=await applyChange(change([captain]),{repo,dryRun:false});assert.equal(again.applied,false);assert.match(again.nothing,/already/);
 const reset=await applyChange(change([{op:'look.reset',name:'Mr Fujita',was:{'outfit.hat':'captain'}}]),{repo,dryRun:false});
 assert.equal(reset.applied,true,sentences(reset));
 assert.equal(await readFile(resolve(root,PATHS.looks),'utf8'),original,'apply then reset gives back the same bytes');
 const log=JSON.parse(await readFile(resolve(root,PATHS.log),'utf8'));
 assert.equal(log.changes.length,2);assert.deepEqual(log.changes[0].inverse,[{op:'look.set',name:'Mr Fujita',set:{'outfit.hat':fujita.outfit.hat},was:{'outfit.hat':'captain'}}]);
 assert.equal(log.changes[1].after.looks,sha256(original));
});

test('setting a field back to how World draws it removes it from the look',()=>{
 const data={looks:{format:'johansson-looks',version:1,looks:{},characters:{}}};
 const one=applyOps(data,[captain],{made:'m'}).data;
 const two=applyOps(one,[{op:'look.set',name:'Mr Fujita',set:{'outfit.hat':fujita.outfit.hat},was:{'outfit.hat':'captain'}}],{made:'m'}).data;
 assert.deepEqual(two.looks.looks,{});
 assert.deepEqual(data.looks.looks,{},'applyOps never changes its input');
});

test('a stale `was` is a conflict, reported field by field, and nothing is overwritten',async()=>{
 const before=await snapshot();
 const r=await applyChange(change([{op:'look.set',name:'Mr Fujita',set:{'outfit.hat':'captain','hair.colour':'#3a2618'},was:{'outfit.hat':'cap','hair.colour':fujita.hair.colour}}]),{repo,dryRun:false});
 assert.equal(r.ok,false);assert.equal(r.conflicts.length,1);assert.equal(r.conflicts[0].path,'outfit.hat');
 assert.match(r.conflicts[0].sentence,/Mr Fujita's outfit\.hat is now "none", not "cap"/);
 assert.deepEqual(await snapshot(),before);
});

test('refuses unknown keys, unknown steps, wrong names, steps not switched on yet and changes over the limits',async()=>{
 const before=await snapshot();
 const cases=[
  [change([captain],{extra:1}),/field Studio does not know: "extra"/],
  [change([{...captain,colour:'red'}]),/field Studio does not know: "colour"/],
  [change([{op:'look.delete',name:'Mr Fujita'}]),/"look.delete" is not a Studio step/],
  [change([{...captain,name:'Mr Nobody'}]),/"Mr Nobody" is not a resident World knows/],
  [change([{...captain,set:{'outfit.tophat':'x'},was:{'outfit.tophat':'none'}}]),/not a part of a look/],
  [change([{...captain,set:{'outfit.hat':'tophat'}}]),/"tophat" is not a choice for outfit.hat/],
  [change([{...captain,set:{'hair.colour':'red'},was:{'hair.colour':fujita.hair.colour}}]),/colour written #rrggbb/],
  [change([{...captain,set:{age:'child'},was:{age:fujita.age}}]),/a look cannot make them a child/],
  [change([{...captain,was:{}}]),/was is empty/],
  [change([{...captain,was:{'hair.colour':fujita.hair.colour}}]),/was must give today's value/],
  [change([{op:'product.update',id:'beer',set:{price:300},was:{price:220}}]),/not switched on yet/],
  [change(Array.from({length:51},()=>captain)),/at most 50/],
  [change([captain],{note:'ok'}),/at least 4 words/],
  [change([captain],{note:'A <script> in the note here'}),/may not contain "<"/],
  [change([captain],{note:'A bell \u0007 in the note here'}),/control character/],
  [change([captain],{id:'../../etc/passwd'}),/id is not written the way it must be/],
  [{...change([captain]),format:'something-else'},/format must be/],
 ];
 for(const [file,expected] of cases){const r=await applyChange(file,{repo,dryRun:false});assert.equal(r.ok,false,String(expected));assert.match(sentences(r),expected);}
 assert.deepEqual(await snapshot(),before,'a refused change writes nothing');
});

test('a picture must really be a picture, match its checksum and be used by a step',()=>{
 const png=new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]),b64=bytes=>Buffer.from(bytes).toString('base64');
 assert.deepEqual(pictureProblems('beer.label.png',{sha256:sha256(png),data:b64(png)}),[]);
 assert.match(pictureProblems('beer.label.png',{sha256:sha256(png),data:b64(Buffer.from('#!/bin/sh\nrm -rf /'))})[0].sentence,/not a PNG, JPEG or WebP/);
 assert.match(pictureProblems('beer.label.png',{sha256:'0'.repeat(64),data:b64(png)})[0].sentence,/does not match its checksum/);
 assert.match(pictureProblems('beer.label.jpg',{sha256:sha256(png),data:b64(png)})[0].sentence,/really a PNG/);
 const r=validateChange(change([captain],{files:{'beer.label.png':{sha256:sha256(png),data:b64(png)}}}));
 assert.match(r.problems.map(p=>p.sentence).join(' '),/No step in this change uses the picture/);
 assert.equal(validateChange(change([captain],{files:{'../beer.png':{sha256:sha256(png),data:b64(png)}}})).ok,false);
});

test('writes go only to Studio\'s own files, never through a path that climbs out',async()=>{
 for(const ok of [PATHS.looks,PATHS.log,PATHS.looksModule,PATHS.productsModule,'johansson-town/assets/graphics/labels/beer.r2.webp','output/studio-mcp/portraits/mr-fujita-front-full-512.png'])assert.ok(writable(ok),ok);
 for(const bad of ['.mcp.json','.claude/settings.json','.github/workflows/johansson-town-live.yml','johansson-town/src/avatars/cast.js','johansson-town/data/studio/../../src/game.js',
  '../outside.json','/etc/passwd','output/studio-mcp/../../x.png','johansson-town/assets/graphics/labels/Beer.r1.webp','johansson-town/assets/graphics/labels/beer.webp','output/studio-mcp/.hidden/x.png','johansson-town\\data\\studio\\looks.json'])
  assert.equal(writable(bad),false,bad);
 await assert.rejects(repo.write('johansson-town/data/studio/../../../../outside.json','x'),/may not write/);
 await assert.rejects(repo.write('.mcp.json','{}'),/may not write/);
});

test('a symbolic link anywhere on the way is refused, and nothing is written through it',async()=>{
 const outside=await mkdtemp(join(tmpdir(),'studio-outside-')),target=resolve(outside,'looks.json');
 try{
  // The data file itself is a link.
  await writeFile(target,original);const looks=resolve(root,PATHS.looks),kept=await readFile(looks,'utf8');
  await rm(looks);await symlink(target,looks);
  await assert.rejects(applyChange(change([captain]),{repo,dryRun:false}),/link/);
  assert.equal(await readFile(target,'utf8'),original,'the file behind the link is untouched');
  await rm(looks);await writeFile(looks,kept);
  // A folder on the way (src/avatars) is a link: refused before looks.json is written, so no half change.
  const avatars=resolve(root,'johansson-town/src/avatars'),moved=resolve(outside,'avatars');
  await mkdir(moved);await copyFile(resolve(avatars,'looks-data.js'),resolve(moved,'looks-data.js'));await rm(avatars,{recursive:true});await symlink(moved,avatars);
  await assert.rejects(applyChange(change([captain]),{repo,dryRun:false}),/link/);
  assert.equal(await readFile(looks,'utf8'),kept,'looks.json was not written either');
  await rm(avatars);await mkdir(avatars);await copyFile(resolve(moved,'looks-data.js'),resolve(avatars,'looks-data.js'));
 }finally{await rm(outside,{recursive:true,force:true});}
});

test('Studio characters: created, changed and deleted; a resident is never deleted',async()=>{
 const card={role:'Visiting cousin',why:'Thao\'s cousin from Naha, for the summer festival stories.'};
 const created=await applyChange(change([{op:'character.create',id:'aya',character:{name:'Aya',recipe:{hair:{style:'bob'}},card}}]),{repo,dryRun:false});
 assert.equal(created.applied,true,sentences(created));
 let looks=JSON.parse(await readFile(resolve(root,PATHS.looks),'utf8'));
 assert.equal(looks.characters.aya.recipe.hair.style,'bob');assert.equal(looks.characters.aya.recipe.name,'Aya');
 const changed=await applyChange(change([{op:'character.set',id:'aya',set:{'hair.style':'pigtails'},was:{'hair.style':'bob'}}]),{repo,dryRun:false});
 assert.equal(changed.applied,true,sentences(changed));
 looks=JSON.parse(await readFile(resolve(root,PATHS.looks),'utf8'));
 const stale=await applyChange(change([{op:'character.delete',id:'aya',was:'0'.repeat(64)}]),{repo,dryRun:false});
 assert.equal(stale.ok,false);assert.match(sentences(stale),/Aya has changed since/);
 const gone=await applyChange(change([{op:'character.delete',id:'aya',was:recordSha256(looks.characters.aya)}]),{repo,dryRun:false});
 assert.equal(gone.applied,true,sentences(gone));
 assert.equal(await readFile(resolve(root,PATHS.looks),'utf8'),original);
 for(const bad of [{op:'character.create',id:'fujita',character:{name:'Mr Fujita',recipe:{},card}},{op:'character.create',id:'aya',character:{name:'Aya',recipe:{},card:{role:'x',why:'too short'}}},{op:'character.delete',id:'Mr Fujita',was:'0'.repeat(64)}]){
  const r=await applyChange(change([bad]),{repo,dryRun:false});assert.equal(r.ok,false,JSON.stringify(bad));
 }
});

test('the data root moves only inside a test run, and real brands are refused in product fields',()=>{
 const saved={...process.env};
 try{
  process.env.JOHANSSON_STUDIO_ROOT=root;assert.equal(defaultRoot(),resolve(root));
  delete process.env.NODE_TEST_CONTEXT;assert.equal(defaultRoot(),CODE_ROOT,'outside node --test the variable is ignored');
 }finally{process.env=saved;}
 const rules={brands:['orion','coca-cola','orion beer'],kana:['オリオン']};
 for(const bad of ['Orion lager','ORION','Ｏｒｉｏｎ draught','オリオンビール','Coca-Cola'])assert.ok(brandProblems(bad,'product.name',rules).length,bad);
 for(const ok of ['Umineko lager','Morioka soba','Asahi Street','Lorionne'])assert.deepEqual(brandProblems(ok,'product.name',rules),[],ok);
});
