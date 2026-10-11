import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {PATHS,jsonText} from '../tools/studio/repo.mjs';
import {looksModule} from '../tools/studio/build-data.mjs';
import {TOOLS} from '../tools/studio/tools.mjs';

// The real johansson-studio server over stdio, pointed (as only a test can) at a throwaway copy of Studio's data.
// Every tool is called except render_portrait, which needs Chromium (tools/studio/smoke.mjs covers it).
const town=fileURLToPath(new URL('../',import.meta.url));
let root,client,original,startup;
before(async()=>{
 root=await mkdtemp(join(tmpdir(),'studio-mcp-'));
 await mkdir(resolve(root,'johansson-town/data/studio'),{recursive:true});await mkdir(resolve(root,'johansson-town/src/avatars'),{recursive:true});
 original=jsonText({format:'johansson-looks',version:1,looks:{},characters:{}});
 await writeFile(resolve(root,PATHS.looks),original);await writeFile(resolve(root,PATHS.looksModule),looksModule(original));
 await writeFile(resolve(root,PATHS.log),jsonText({format:'johansson-studio-log',version:1,changes:[]}));
 await copyFile(resolve(town,'data/studio/brand-rules.json'),resolve(root,PATHS.brands));
 client=new Client({name:'studio-mcp-test',version:'1'});
 const transport=new StdioClientTransport({command:process.execPath,args:[resolve(town,'tools/studio/server.mjs')],cwd:resolve(town,'..'),env:{...process.env,JOHANSSON_STUDIO_ROOT:root},stderr:'pipe'});
 const t=performance.now();await client.connect(transport);startup=performance.now()-t;
});
after(async()=>{await client?.close();await rm(root,{recursive:true,force:true});});

const call=async(name,args={})=>{const r=await client.callTool({name,arguments:args},{timeout:120000});return {error:!!r.isError,data:JSON.parse(r.content[0].text)};};
const looks=()=>readFile(resolve(root,PATHS.looks),'utf8');

test('the server answers initialize quickly and lists every tool with its input',async()=>{
 assert.ok(startup<5000,`initialize took ${Math.round(startup)} ms`);
 const {tools}=await client.listTools();
 assert.deepEqual(tools.map(t=>t.name).sort(),TOOLS.map(t=>t.name).sort());
 for(const t of tools){assert.equal(t.inputSchema.type,'object',t.name);assert.ok(t.description.length>40,t.name);}
 assert.equal(tools.find(t=>t.name==='character_list').annotations.readOnlyHint,true);
 assert.equal(tools.find(t=>t.name==='character_update').annotations.readOnlyHint,false);
});

test('look, change with a dry run, apply, then reset: looks.json is byte-identical again',async()=>{
 const list=await call('character_list',{group:'townsfolk'});
 assert.ok(list.data.characters.some(c=>c.name==='Mr Fujita'&&c.role&&!c.edited));
 const got=await call('character_get',{name:'Mr Fujita',options:true});
 assert.equal(got.data.source.includes('baseRecipe'),true);assert.equal(got.data.override,null);
 assert.ok(got.data.options['outfit.hat'].words.includes('captain'));assert.ok(got.data.profile&&!got.data.recipe.profile);
 const dry=await call('character_update',{name:'Mr Fujita',set:{'outfit.hat':'captain','body.height':1.4},note:'He skippered the old ferry once.'});
 assert.equal(dry.data.ok,true,JSON.stringify(dry.data.problems));assert.equal(dry.data.applied,false);
 assert.equal(dry.data.recipe.outfit.hat,'captain');assert.equal(dry.data.clamped.length,1);
 assert.equal(await looks(),original,'a dry run writes nothing');
 const done=await call('character_update',{name:'Mr Fujita',set:{'outfit.hat':'captain'},note:'He skippered the old ferry once.',dryRun:false});
 assert.equal(done.data.applied,true,JSON.stringify(done.data));
 assert.equal((await call('character_get',{name:'Mr Fujita'})).data.override.set['outfit.hat'],'captain');
 assert.equal((await call('character_list',{query:'fujita'})).data.characters[0].edited,true);
 const reset=await call('character_reset',{name:'Mr Fujita',dryRun:false});
 assert.equal(reset.data.applied,true,JSON.stringify(reset.data));
 assert.equal(await looks(),original);
 assert.equal((await call('character_reset',{name:'Mr Fujita'})).data.nothing.includes('no Studio look'),true);
});

test('Studio-only characters; a resident can never be deleted; problems come back in words',async()=>{
 const made=await call('character_create',{name:'Aya',from:'Thao',set:{'hair.style':'bob'},card:{role:'Visiting cousin',why:'Thao\'s cousin from Naha, for the summer festival stories.'},dryRun:false});
 assert.equal(made.data.applied,true,JSON.stringify(made.data));assert.equal(made.data.id,'aya');
 assert.equal((await call('character_get',{name:'aya'})).data.recipe.hair.style,'bob');
 assert.equal((await call('character_update',{name:'Aya',set:{'outfit.top':'sailor'},note:'Her school uniform for the festival.',dryRun:false})).data.applied,true);
 const resident=await call('character_delete',{id:'Mr Fujita'});
 assert.equal(resident.error,true);assert.match(resident.data.error,/can never be deleted/);
 const wrong=await call('character_update',{name:'Mr Fujita',set:{'outfit.hat':'tophat'},note:'Trying a hat that is not there.'});
 assert.equal(wrong.data.ok,false);assert.match(wrong.data.problems.join(' '),/not a choice for outfit\.hat/);
 assert.equal((await call('character_get',{name:'Nobody at all'})).error,true);
 assert.equal((await call('character_delete',{id:'aya',dryRun:false})).data.applied,true);
 assert.equal(await looks(),original);
});

test('validate and publish_check report in plain words',async()=>{
 const v=await call('validate',{});
 assert.equal(v.data.looks.ok,true,JSON.stringify(v.data.looks));
 assert.ok(v.data.brands.warnings.some(w=>/izakaya-beer\.js:14/.test(w)),'the known Orion uses are listed');
 const c=await call('validate',{target:'change',change:{format:'johansson-studio-change',version:1,id:'x',made:'y',by:'ipad',note:'n',ops:[]}});
 assert.equal(c.data.ok,false);assert.ok(c.data.problems.length>=3);
 const p=await call('publish_check',{tests:false});
 assert.deepEqual(p.data.items.map(i=>i.check),['generated modules','data','runtime build','guide portraits','main merged','uncommitted']);
 assert.match(p.data.next,/update World/);
});
