// What a game opens (camera/unlocks.js): a Memory or Solitaire win opens the Pocket faces once, wins are counted per
// game, a Blackjack win counts but opens nothing, odd stored values are tolerated. Run: node camera/tests/unlocks.test.mjs
import assert from 'node:assert/strict';
import {recordWin,isUnlocked,unlockHint,UNLOCKS,GAMES} from '../unlocks.js';

assert.deepEqual(GAMES,['memory','solitaire','blackjack','ball']);
assert.equal(UNLOCKS[0].id,'pocket-faces');
assert.equal(isUnlocked({},'pocket-faces'),false);assert.equal(isUnlocked(null,'pocket-faces'),false);

// The first Memory win opens the sheet, and only that once.
let r=recordWin({theme:'dark'},'memory');
assert.deepEqual(r.unlocked,['pocket-faces']);assert.deepEqual(r.saved.wins,{memory:1});assert.deepEqual(r.saved.unlocked,['pocket-faces']);assert.equal(r.saved.theme,'dark','the rest of the settings stay');
assert.ok(isUnlocked(r.saved,'pocket-faces'));
r=recordWin(r.saved,'solitaire');
assert.deepEqual(r.unlocked,[],'already open');assert.deepEqual(r.saved.wins,{memory:1,solitaire:1});assert.deepEqual(r.saved.unlocked,['pocket-faces']);
// A Blackjack win is counted and opens nothing; a Solitaire win alone opens the sheet too.
r=recordWin({},'blackjack');assert.deepEqual(r.unlocked,[]);assert.deepEqual(r.saved.wins,{blackjack:1});assert.deepEqual(r.saved.unlocked,[]);
r=recordWin({},'solitaire');assert.deepEqual(r.unlocked,['pocket-faces']);
// Nonsense is tolerated: an unknown game changes nothing, broken stored values are replaced.
r=recordWin({wins:'x',unlocked:'y'},'tetris');assert.deepEqual(r.unlocked,[]);assert.deepEqual(r.saved,{wins:'x',unlocked:'y'});
r=recordWin({wins:'x',unlocked:'y'},'memory');assert.deepEqual(r.saved.wins,{memory:1});assert.deepEqual(r.saved.unlocked,['pocket-faces']);
r=recordWin({wins:{memory:2.5}},'memory');assert.equal(r.saved.wins.memory,1,'a broken count starts again');
assert.equal(unlockHint('pocket-faces'),'Win a game of Memory or Solitaire, or score 500 in Ball, to open this sheet.');
r=recordWin({},'ball');assert.deepEqual(r.unlocked,['pocket-faces'],'five hundred in Ball opens it too');assert.equal(unlockHint('nope'),'');
console.log('unlocks: a win opens the Pocket faces once; wins counted; odd values tolerated');
