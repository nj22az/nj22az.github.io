import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';

test('published page uses one compiled audio/boot graph with local hashed dependencies',async()=>{
 const base=new URL('../runtime/',import.meta.url),manifest=JSON.parse(await readFile(new URL('.vite/manifest.json',base),'utf8'));
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const boot=manifest['src/boot.js'],audio=Object.values(manifest).find(entry=>entry.isEntry&&entry.name==='audio');
 assert.ok(html.includes("import('./runtime/"+boot.file+"')"));assert.ok(html.includes("from './runtime/"+audio.file+"'"));
 assert.ok(html.includes('data-town-runtime href="./runtime/'+boot.file+'"'));
 assert.doesNotMatch(html,/import\(['"]\.\/src\/boot/);
 for(const entry of Object.values(manifest)){
  await access(new URL(entry.file,base));
  for(const key of [...entry.imports||[],...entry.dynamicImports||[]])assert.ok(manifest[key],'Missing compiled dependency '+key);
  const code=await readFile(new URL(entry.file,base),'utf8');assert.doesNotMatch(code,/(?:from\s*|import\()['"][^'"]*\/src\//,'No raw source imports in published chunks');
 }
 assert.ok(Object.keys(manifest).length<=8,'Bound the JavaScript request count');
 const audioCode=await readFile(new URL(audio.file,base),'utf8');assert.match(audioCode,/unlockTownAudio/,'Title screen retains its audio unlock export');
 const game=Object.values(manifest).find(entry=>entry.src?.startsWith('src/game.js'));
 assert.ok(game.imports.some(key=>manifest[key].file===audio.file),'Game and title share one audio context');
});
