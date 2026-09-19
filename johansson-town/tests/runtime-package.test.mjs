import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {runtimeSourceHash} from '../scripts/runtime-source.mjs';

test('published runtime matches the current source rather than an older build',async()=>{
 const root=new URL('../',import.meta.url).pathname;
 const recorded=JSON.parse(await readFile(new URL('../runtime/source.json',import.meta.url),'utf8'));
 assert.equal(recorded.sha256,await runtimeSourceHash(root),'Run npm run build:runtime with every source change');
});

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
 const dependencies=entry=>{const result=new Set([entry.file]);for(const key of entry.imports||[])for(const file of dependencies(manifest[key]))result.add(file);return result;};
 const gameFiles=dependencies(game),audioFiles=dependencies(audio),contexts=[];
 for(const file of new Set([...gameFiles,...audioFiles]))if(/(?:window\.)?AudioContext/.test(await readFile(new URL(file,base),'utf8')))contexts.push(file);
 assert.equal(contexts.length,1,'One audio implementation in the entry graph');
 assert.ok(gameFiles.has(contexts[0])&&audioFiles.has(contexts[0]),'Game and title share one audio context');
});

test('every stylesheet link carries a hash of the file it points at',async()=>{
 const {createHash}=await import('node:crypto');
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const links=[...html.matchAll(/href="(\.\/)?([\w-]+\.css)(\?[^"]*)?"/g)];
 assert.ok(links.length>=10,'The page still links its stylesheets');
 for(const [,,file,query] of links){
  const css=await readFile(new URL('../'+file,import.meta.url));
  const hash=createHash('sha256').update(css).digest('hex').slice(0,8);
  // A hand-written version string goes stale the moment someone edits the stylesheet
  // and forgets it, which serves new markup with old CSS out of the browser cache.
  assert.equal(query,'?h='+hash,file+' is cached under the wrong key; run npm run build:runtime');
 }
});
