#!/usr/bin/env node
/**
 * Smoke test for the johansson-studio MCP server, with a real MCP client over stdio and real Chromium:
 *   node --test johansson-town/tools/studio/smoke.mjs        (npm run studio:smoke in johansson-town)
 * 1. Against this checkout: initialize in under 2 s, every tool listed, the read tools and dry runs called (the data
 *    files must not change by a byte), and three portraits rendered in headless Studio (the same recipe twice gives
 *    the same pixels). The renders are deleted afterwards.
 * 2. A picture with a location hidden in it comes back from Chromium as a WebP with only its pixels.
 * 3. Against a throwaway copy of the data (only under node --test): apply a look, reset it, and looks.json is
 *    byte-identical again.
 */
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,copyFile,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {CODE_ROOT,PATHS,jsonText} from './repo.mjs';
import {looksModule} from './build-data.mjs';

const server=fileURLToPath(new URL('./server.mjs',import.meta.url));
const clients=[],made=[];
after(async()=>{for(const c of clients)await c.close().catch(()=>{});for(const p of made)await unlink(p).catch(()=>{});});
async function connect(env={}){
 const client=new Client({name:'johansson-studio-smoke',version:'1'});clients.push(client);
 const {JOHANSSON_STUDIO_ROOT,...rest}=process.env;
 const transport=new StdioClientTransport({command:process.execPath,args:[server],cwd:CODE_ROOT,env:{...rest,...env},stderr:'inherit'});
 const t=performance.now();await client.connect(transport);return {client,ms:performance.now()-t};
}
const callWith=client=>async(name,args={})=>{const r=await client.callTool({name,arguments:args},{timeout:240000});return r;};
const json=r=>JSON.parse(r.content.find(c=>c.type==='text').text);
const files=()=>Promise.all([PATHS.looks,PATHS.log,PATHS.looksModule].map(p=>readFile(resolve(CODE_ROOT,p),'utf8')));

test('this checkout: fast start, every tool, nothing written, portraits from headless Studio',async()=>{
 const before=await files(),{client,ms}=await connect();
 assert.ok(ms<2000,`initialize took ${Math.round(ms)} ms (must be under 2 s)`);
 const {tools}=await client.listTools();
 assert.deepEqual(tools.map(t=>t.name).sort(),['character_create','character_delete','character_get','character_list','character_reset','character_update','publish_check','render_portrait','validate']);
 const call=callWith(client);
 assert.ok(json(await call('character_list')).count>=47);
 assert.equal(json(await call('character_get',{name:'Mr Fujita'})).name,'Mr Fujita');
 assert.equal(json(await call('character_update',{name:'Mr Fujita',set:{'outfit.hat':'captain'},note:'A dry run from the smoke test.'})).dryRun,true);
 assert.equal(json(await call('character_create',{name:'Smoke',card:{role:'Test',why:'Only a dry run of the smoke test.'}})).dryRun,true);
 assert.equal((await call('character_delete',{id:'Mr Fujita'})).isError,true);
 assert.equal(json(await call('validate',{target:'looks'})).ok,true);
 assert.ok(json(await call('publish_check',{tests:false})).items.length>=6);
 const portraits=[];
 for(const args of [{name:'Mr Fujita',size:256},{name:'Thuan',view:'quarter',framing:'face',size:256},{name:'Mr Fujita',size:256},{recipe:{name:'Draft',hair:{style:'afro'}},view:'left',pose:'Wave',expression:'happy',size:256}]){
  const r=await call('render_portrait',args);assert.notEqual(r.isError,true,JSON.stringify(r.content));
  const image=r.content.find(c=>c.type==='image'),data=json(r),png=Buffer.from(image.data,'base64');
  assert.equal(image.mimeType,'image/png');assert.equal(png.readUInt32BE(16),256);assert.equal(png.readUInt32BE(20),256);
  made.push(resolve(CODE_ROOT,data.path));portraits.push(png);
 }
 assert.ok(portraits[0].equals(portraits[2]),'the same recipe and options give the same pixels');
 assert.ok(!portraits[0].equals(portraits[1]));
 assert.deepEqual(await files(),before,'reading, dry runs and renders never change Studio\'s data');
});

test('a picture is re-encoded to WebP in Chromium, and what was hidden in it (a GPS note) is gone',async()=>{
 const {StudioPage}=await import('./page.mjs'),{crc32}=await import('node:zlib'),page=new StudioPage();
 try{
  const png=await page.renderPortrait({name:'Smoke'},{size:128});
  // A tEXt chunk after IHDR, the way a phone or an editor leaves a location in a PNG.
  const chunk=(type,data)=>{const body=Buffer.concat([Buffer.from(type),data]),out=Buffer.alloc(body.length+8);out.writeUInt32BE(data.length,0);body.copy(out,4);out.writeUInt32BE(crc32(body)>>>0,body.length+4);return out;};
  const hidden=Buffer.concat([png.subarray(0,33),chunk('tEXt',Buffer.from('GPSLatitude\u000026.2124 N, 127.6792 E')),png.subarray(33)]);
  assert.ok(hidden.includes('GPSLatitude'));
  const {bytes,width,height}=await page.reencodeWebp(hidden,{maxSide:64});
  assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.deepEqual([width,height],[64,64]);
  assert.ok(!bytes.includes('GPSLatitude'),'only the pixels survive');
 }finally{await page.close();}
});

test('a throwaway copy: apply a look, reset it, and looks.json is byte-identical',{skip:!process.env.NODE_TEST_CONTEXT&&'run with node --test to point the server at a throwaway copy'},async()=>{
 const root=await mkdtemp(join(tmpdir(),'studio-smoke-'));
 try{
  await mkdir(resolve(root,'johansson-town/data/studio'),{recursive:true});await mkdir(resolve(root,'johansson-town/src/avatars'),{recursive:true});
  const original=await readFile(resolve(CODE_ROOT,PATHS.looks),'utf8');
  await writeFile(resolve(root,PATHS.looks),original);await writeFile(resolve(root,PATHS.looksModule),looksModule(original));
  await writeFile(resolve(root,PATHS.log),jsonText({format:'johansson-studio-log',version:1,changes:[]}));await copyFile(resolve(CODE_ROOT,PATHS.brands),resolve(root,PATHS.brands));
  const {client}=await connect({JOHANSSON_STUDIO_ROOT:root}),call=callWith(client);
  const name=json(await call('character_list',{group:'townsfolk'})).characters.find(c=>!c.edited).name;
  const done=json(await call('character_update',{name,set:{'outfit.hat':'captain'},note:'Applied by the smoke test, then reset.',dryRun:false}));
  assert.equal(done.applied,true,JSON.stringify(done));
  assert.notEqual(await readFile(resolve(root,PATHS.looks),'utf8'),original);
  assert.equal(json(await call('character_reset',{name,dryRun:false})).applied,true);
  assert.equal(await readFile(resolve(root,PATHS.looks),'utf8'),original);
  assert.equal(JSON.parse(await readFile(resolve(root,PATHS.log),'utf8')).changes.length,2);
 }finally{await rm(root,{recursive:true,force:true});}
});
