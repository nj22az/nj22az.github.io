import test from 'node:test';import assert from 'node:assert/strict';
import {seventeenBeersComic} from '../seventeen-beers-comic.mjs';
import {recipeFor} from '../../johansson-town/src/avatars/cast.js';
import {normalizeScene} from '../scene-model.mjs';
import {sceneLink,readSceneLink} from '../scene-links.mjs';
test('sea-wall gag keeps canonical cast, seated Fujita and the exact final punchline',async()=>{
 const scenes=seventeenBeersComic(recipeFor).map(s=>normalizeScene(s));assert.equal(scenes.length,3);
 assert.ok(scenes.every(s=>s.location==='seawall'&&s.look==='riso'&&s.actors[0].seat==='seawall-bench-4'));
 assert.deepEqual(scenes[0].actors[0].recipe,recipeFor('Mr Fujita'));assert.deepEqual(scenes[0].actors[1].recipe,recipeFor('Johansson'));
 assert.equal(scenes[0].actors[1].pose,'Walk');assert.equal(scenes[1].actors[1].speech,'You look happy.');assert.equal(scenes[2].actors[0].speech,'Thanks for noticing. I just had 17 beers.');
 assert.equal(scenes[2].actors[0].expression,'smile');assert.ok(scenes.every(s=>!s.bottom));
 const p={format:'johansson-studio-scenes',version:1,layout:'strip',scenes,creatorMark:{enabled:true,text:'Johansson',corner:'right',opacity:.58}};
 assert.deepEqual((await readSceneLink(new URL(await sceneLink(p,'https://example.test/')).hash)).scenes,scenes);
});
