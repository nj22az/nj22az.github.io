import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSomethingComic} from '../make-something-comic.mjs';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {normalizeScene} from '../scene-model.mjs';
import {sceneLink,readSceneLink} from '../scene-links.mjs';
test('Thuan urges an unnamed canonical man; hero and football survive editable exchange',async()=>{
 const scenes=makeSomethingComic(recipeFor).map(s=>normalizeScene(s));
 assert.equal(scenes[0].actors[0].recipe.name,recipeFor('Thuan').name);
 assert.deepEqual(scenes[1].actors[0].recipe,recipeFor('Mr Fujita'));
 assert.ok(scenes.every(s=>!JSON.stringify([s.top,s.bottom,...s.actors.map(a=>a.speech)]).includes('Fujita')));
 assert.equal(scenes[1].backdrop,'hero');assert.equal(scenes[1].actors[0].pose,'ResolveFist');assert.equal(scenes[2].television,'football');assert.equal(scenes[2].actors[0].heldItem,'beer');
 const refs=scenes.map((s,i)=>'make-something:'+i),doc={format:'johansson-studio-scenes',version:1,layout:'strip',step:'effects',scenes,refs};
 const link=await sceneLink(doc,'https://example.test/');assert.deepEqual((await readSceneLink(new URL(link).hash)).refs,refs);
});

for(const language of ['en','vi','ja','sv'])test(`translated ${language} strip keeps all lettering editable and the gag intact`,async()=>{
 const source=makeSomethingComic(recipeFor,{language}),scenes=source.map(s=>normalizeScene(s));
 assert.equal(scenes[0].actors[0].speech,source[0].actors[0].speech);
 assert.equal(scenes[1].actors[0].speech,source[1].actors[0].speech);
 assert.equal(scenes[2].bottom,source[2].bottom);
 assert.equal(scenes[2].television,'football');assert.equal(scenes[2].actors[0].heldItem,'beer');
 const text=scenes.flatMap(s=>[s.top,s.bottom,...s.actors.map(a=>a.speech)]).filter(Boolean);
 assert.ok(text.every(t=>t.length<=120&&!t.includes('Fujita')));
 const doc={format:'johansson-studio-scenes',version:1,layout:'strip',step:'effects',scenes};
 assert.deepEqual((await readSceneLink(new URL(await sceneLink(doc,'https://example.test/')).hash)).scenes,scenes);
});
