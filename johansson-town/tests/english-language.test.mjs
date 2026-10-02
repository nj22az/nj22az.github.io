import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile} from 'node:fs/promises';
test('controls, dialogue and entry page stay English while scenery carries Japanese',async()=>{
 const {stdout}=await promisify(execFile)(process.execPath,['scripts/english-inventory.mjs'],{cwd:new URL('../',import.meta.url),maxBuffer:1024*1024});
 assert.match(stdout,/^0 strings/);
 const page=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.doesNotMatch(page.replace(/<!--[\s\S]*?-->|\/\/[^\n]*/g,''),/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u);
});
