// Every camera module is imported at one address: a module asked for at two versions (`lettering.js?v=a` here and
// `?v=b` there) is loaded twice, and one of the copies may be a page cached from before the change.
//   node camera/tests/modules.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const seen=new Map();
for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){
 for(const [,name,version] of fs.readFileSync(path.join(dir,file),'utf8').matchAll(/from '\.\/([\w-]+\.js)(\?v=[\w-]+)?'/g)){
  if(!seen.has(name))seen.set(name,new Map());
  seen.get(name).set(version||'',[...(seen.get(name).get(version||'')||[]),file]);
 }
}
for(const [name,versions] of seen)
 assert.equal(versions.size,1,`${name} is imported at ${[...versions].map(([v,f])=>`${v||'no version'} (${f.join(', ')})`).join(' and ')}`);
console.log(`modules: ${seen.size} camera modules, each at one address`);
