// The page's icons and look-icons.js are what tools/draw-camera-icons.py drew (camera/icons/ui-icons.json), and every
// icon the page or the app asks for by name is among them.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {iconData,spriteBlock,lookIconsModule} from '../../tools/apply-camera-icons.mjs';
const camera=fileURLToPath(new URL('../',import.meta.url));
const page=await readFile(camera+'index.html','utf8'),data=await iconData();
assert.ok(page.includes(await spriteBlock()),'camera/index.html carries the drawn symbols: run node tools/apply-camera-icons.mjs');
assert.equal(await readFile(camera+'look-icons.js','utf8'),await lookIconsModule(),'camera/look-icons.js is the drawing: run node tools/apply-camera-icons.mjs');
const symbols=new Set([...page.matchAll(/<symbol id="i-([\w-]+)"/g)].map(m=>m[1]));
for(const name of Object.keys(data.sprite))assert.ok(symbols.has(name),`symbol ${name}`);
for(const name of Object.keys(data.games))assert.ok(symbols.has(`game-${name}`),`game sign ${name}`);
let asked=0;
for(const use of page.matchAll(/href="#i-([\w-]+)"/g)){asked++;assert.ok(symbols.has(use[1]),`index.html asks for #i-${use[1]}`);}
for(const file of (await readdir(camera)).filter(f=>f.endsWith('.js'))){
 const source=await readFile(camera+file,'utf8');
 for(const call of source.matchAll(/\bicon\('([\w-]+)'\)/g)){asked++;assert.ok(symbols.has(call[1]),`${file} asks for icon('${call[1]}')`);}
 for(const use of source.matchAll(/href="#i-([\w-]+)"/g)){asked++;assert.ok(symbols.has(use[1]),`${file} asks for #i-${use[1]}`);}
}
for(const body of [...Object.values(data.sprite),...Object.values(data.kinds),...Object.values(data.looks),...Object.values(data.games)])assert.ok(!/<text|font/.test(body),'no icon is a font');
console.log(`icons: ${symbols.size} symbols, ${Object.keys(data.kinds).length} kinds, ${Object.keys(data.looks).length} Looks; ${asked} uses, each one drawn`);
