import test from 'node:test';
import assert from 'node:assert/strict';
import {GESTURES,STORY_POSES} from '../../johansson-town/src/avatars/animate.js';
import {EXPRESSION_NAMES} from '../../johansson-town/src/avatars/face.js';
import {POSE_GROUPS,EXPRESSION_GROUPS,POSES,EXPRESSIONS,poseGroups,expressionGroups,seatedPose,readable} from '../scene-catalogue.mjs';
import {normalizeScene} from '../scene-model.mjs';

// The poses and expressions the Studio offered before it read World's lists: saved scenes use them.
const EARLIER_POSES=['Idle','Wave','Cheer','Point','Shrug','Laugh','Think','Bow','Clap','Kachashi','Crouch','Sit','Heart','Peace','Coy','Tada','HandsOnHips','HeelKick','CheekRest','DoubleCheek'];
const EARLIER_FACES=['neutral','happy','laugh','smile','sad','angry','shy','surprised','worried','thinking','grumpy','content','sleep'];

test('the pickers offer World\'s own poses and faces, each once, in labelled groups',()=>{
 assert.equal(new Set(POSES).size,POSES.length,'no pose twice');assert.equal(new Set(EXPRESSIONS).size,EXPRESSIONS.length,'no face twice');
 for(const name of POSES)assert.ok(name==='Idle'||name==='Sit'||name in GESTURES,name+' is a World move');
 assert.deepEqual([...EXPRESSIONS].sort(),[...EXPRESSION_NAMES].sort(),'every face World paints is offered');
 for(const g of [...POSE_GROUPS,...EXPRESSION_GROUPS]){assert.ok(g.title&&g.items.length);for(const i of g.items)assert.ok(i.label.trim(),i.name+' has a label');}
 assert.deepEqual(POSE_GROUPS.map(g=>g.id).slice(0,3),['everyday','funny','sitting']);
 for(const name of POSE_GROUPS.find(g=>g.id==='sitting').items.map(i=>i.name))assert.ok(seatedPose(name),name+' sits');
});
test('everything the Studio offered before is still offered and still loads',()=>{
 for(const p of EARLIER_POSES)assert.ok(POSES.includes(p),p);for(const e of EARLIER_FACES)assert.ok(EXPRESSIONS.includes(e),e);
 const s=normalizeScene({version:2,actors:[{recipe:{},pose:'HeelKick',expression:'grumpy'},{recipe:{},pose:'Jump',expression:'dizzy'},{recipe:{},pose:'NoSuchMove',expression:'no-such-face'}]});
 assert.deepEqual(s.actors.map(a=>a.pose),['HeelKick','Jump','Idle'],'a World move loads even when the picker does not offer it; an unknown one does not');
 assert.deepEqual(s.actors.map(a=>a.expression),['grumpy','dizzy','smile']);
});
test('a pose or face World adds later appears without a Studio change',()=>{
 const groups=poseGroups(['Wave','Cheer','Moonwalk','SitKnit','CarriedPlank','Jab'],{story:new Set(['CarriedPlank'])});
 const of=id=>groups.find(g=>g.id===id)?.items.map(i=>i.name)||[];
 assert.ok(of('more').includes('Moonwalk'),'unknown new pose goes to More');assert.ok(of('sitting').includes('SitKnit'),'a new Sit… pose sits');
 assert.ok(!groups.flatMap(g=>g.items).some(i=>['CarriedPlank','Jab'].includes(i.name)),'moves that need a partner, a prop or their story stay out');
 assert.equal(groups.flatMap(g=>g.items).find(i=>i.name==='Moonwalk').label,'Moonwalk');assert.equal(readable('EvilLaugh'),'Evil laugh');
 const faces=expressionGroups(['smile','sad','giddy']);assert.deepEqual(faces.find(g=>g.id==='more').items.map(i=>i.name),['giddy']);
});
test('story poses are offered only when they stand on their own',()=>{
 for(const name of STORY_POSES)if(POSES.includes(name))assert.ok(['BentStuck','CrabWalk','FrozenAbsurd','BasketHead','CordWrapped','SitRead'].includes(name),name);
});
