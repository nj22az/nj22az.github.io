import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {check} from '../tools/studio/build-data.mjs';
import {openRepo,CODE_ROOT} from '../tools/studio/repo.mjs';
import {validateLooks,brandProblems} from '../src/studio/rules.js';
import {OPS,CHANGE_SCHEMA} from '../src/studio/ops.js';
import {LOOKS_SHA256} from '../src/avatars/looks-data.js';
import {sha256} from '../src/studio/sha256.js';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const repo=openRepo(CODE_ROOT);

test('World\'s generated module matches Studio\'s data (build-data --check)',async()=>{
 const r=await check(repo);
 assert.ok(r.ok,`Out of date: ${r.stale.join(', ')}. Run node johansson-town/tools/studio/build-data.mjs`);
 assert.equal(LOOKS_SHA256,sha256(await read('data/studio/looks.json')));
});

test('Studio\'s data is valid and written the way the tools write it',async()=>{
 const text=await read('data/studio/looks.json'),looks=JSON.parse(text);
 const r=validateLooks(looks);assert.ok(r.ok,r.problems.map(p=>p.sentence).join('\n'));
 assert.equal(text,JSON.stringify(looks,null,2)+'\n');
 const log=JSON.parse(await read('data/studio/log.json'));
 assert.equal(log.format,'johansson-studio-log');assert.ok(Array.isArray(log.changes));
 for(const c of log.changes)assert.ok(c.id&&c.note&&Array.isArray(c.ops)&&Array.isArray(c.inverse),c.id);
});

test('the brand rules copy jojo\'s list, add Orion (also in katakana) and keep Asahi out',async()=>{
 const rules=JSON.parse(await read('data/studio/brand-rules.json'));
 assert.equal(rules.brands.length,56);
 for(const brand of ['orion beer','orion','coca-cola','fujiiryoki','seven-eleven'])assert.ok(rules.brands.includes(brand),brand);
 assert.ok(!rules.brands.includes('asahi'),'Asahi is a street name here');
 assert.ok(rules.kana.includes('オリオン'));
 for(const text of ['Orion lager','Orion draught, a frosted mug','Orion, a bottle','オリオン 生ビール'])assert.ok(brandProblems(text,'product.name',rules).length,text);
 assert.deepEqual(brandProblems('Umineko lager on Asahi Street','product.name',rules),[]);
 for(const issue of rules.knownIssues){
  await access(new URL('../'+issue.file,import.meta.url));
  assert.ok(Number.isInteger(issue.line)&&issue.line>0&&issue.note,issue.file);
 }
});

test('every Studio step has a schema, and the change file names them',()=>{
 for(const [name,spec] of Object.entries(OPS)){
  assert.equal(spec.schema.properties.op.const,name);assert.equal(spec.schema.additionalProperties,false,name);
  assert.ok(['looks','products'].includes(spec.target),name);assert.ok(spec.summary.length>20,name);
 }
 assert.equal(CHANGE_SCHEMA.properties.ops.maxItems,50);assert.equal(CHANGE_SCHEMA.properties.files.maxProperties,12);
});
