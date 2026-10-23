import test from 'node:test';import assert from 'node:assert/strict';import {normalEffects,normalLayer,translateComic} from '../comic-effects-model.mjs';import {sceneLink,readSceneLink} from '../scene-links.mjs';
test('project and link effects retain editable layers, bounds and safe image assets',async()=>{const p=normalEffects({look:'manga',assets:[{kind:'star',x:10,y:-4,size:5},{kind:'image',image:'https://example.com/tracker'}]});assert.equal(p.assets.length,1);assert.equal(p.assets[0].x,1);assert.equal(p.assets[0].y,0);assert.equal(p.assets[0].size,.8);assert.equal(normalLayer({plate:'javascript:alert(1)'}),null);const doc={format:'johansson-studio-scenes',version:1,layout:'strip',scenes:[{version:2,actors:[]}],effects:[p],step:'effects'};assert.deepEqual(await readSceneLink(new URL(await sceneLink(doc,'https://example.test/')).hash),doc);});
test('Fujita translation switches both ways and leaves unknown custom dialogue intact',()=>{const s=[{top:'',bottom:'',actors:[{speech:'Fujita! Travel! Learn something! Live life to the full!'}]}];assert.equal(translateComic(s,'sv'),true);assert.match(s[0].actors[0].speech,/Lär dig/);assert.equal(translateComic(s,'en'),true);assert.match(s[0].actors[0].speech,/Travel!/);s[0].actors.push({speech:'My custom line'});const before=structuredClone(s);assert.equal(translateComic(s,'sv'),false);assert.deepEqual(s,before);});

test('MCP panel edits replace and remove text and assets atomically',async()=>{
 const {editEffectsPanels}=await import('../comic-effects-model.mjs');
 const p=[{scene:{actors:[{id:'fuji',speech:'Old words'}],bottom:''},post:normalEffects()}];
 editEffectsPanels(p,{edits:[{panel:1,dialogue:[{actor:'fuji',text:'Replacement words'}],look:'manga',assets:[{kind:'star',x:.7}]}]});
 assert.equal(p[0].scene.actors[0].speech,'Replacement words');assert.equal(p[0].post.look,'manga');assert.equal(p[0].post.assets[0].x,.7);
 const before=structuredClone(p);
 assert.throws(()=>editEffectsPanels(p,{edits:[{panel:1,bottom:'Partial change'},{panel:2,look:'none'}]}),/Panel numbers/);assert.deepEqual(p,before);
 assert.throws(()=>editEffectsPanels(p,{language:'sv'}),/Custom wording/);assert.deepEqual(p,before);
 assert.throws(()=>editEffectsPanels(p,{edits:[{panel:1,look:'made-up'}]}),/Unknown shader/);
 assert.throws(()=>editEffectsPanels(p,{edits:[{panel:1,dialogue:[{actor:'missing',text:'No'}]}]}),/Unknown speaker/);
 editEffectsPanels(p,{edits:[{panel:1,dialogue:[{actor:'fuji',text:''}],assets:[]}]});assert.equal(p[0].scene.actors[0].speech,'');assert.deepEqual(p[0].post.assets,[]);
});
