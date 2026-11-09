// The Minato Maru's working drawings, Rev C (the owner, 9 November 2026: "Start a revision C the ferry has lots of issues
// at the moment so if you can create working cads this will be helpful build her in sections"): the set lays out on its
// sheets, and the audit that marks the issues reports what is wrong without crying wolf at what is meant.
import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './fixtures.mjs';
installDOM();globalThis.self=globalThis;globalThis.__KIT_TRACE__=true;
const {SHEETS,layoutClashes}=await import('../tools/ferry-cad.mjs');
const {auditFerry,yardOf,deckOf,spaceOf}=await import('../tools/ferry-audit.mjs');
const {FERRY_SHIP,FERRY_HEIGHTS}=await import('../src/world/ferry-ship.js');
const {findings}=await auditFerry();   // without the built model: everything but faces sharing a plane

test('the set is the owner’s sections in his order: exterior, car deck, engine room, bridge, accommodation, toilets, galley',()=>{
 assert.deepEqual(SHEETS.map(s=>s.name),['exterior','car-deck','engine-room','bridge','passenger-accommodation','crew-accommodation','toilets','galley-mess']);
 for(const s of SHEETS)for(const v of s.views)assert.ok([25,50,100].includes(v.scale),`${s.no} ${v.title}: a ship drawing’s scale`);
});

test('every sheet lays out on A1: no view, list, legend or title block over another, nothing off the sheet',()=>{
 assert.deepEqual(SHEETS.flatMap(s=>layoutClashes(s).map(c=>`${s.no}: ${c}`)),[]);
});

test('shipyard figures: yards from the transom, heights above the keel, the deck and the room of a point',()=>{
 const half=FERRY_SHIP.length/2,draft=FERRY_SHIP.draft;
 assert.deepEqual(yardOf([1,FERRY_HEIGHTS.bridgeDeck-draft+.5,15.25-half]),{yard:15.25,x:1,h:11.5});
 assert.equal(deckOf(FERRY_HEIGHTS.carDeck+1),'car');assert.equal(deckOf(1),'hold');assert.equal(deckOf(FERRY_HEIGHTS.bridgeDeck+.5),'bridge');
 assert.equal(spaceOf([1.7,FERRY_HEIGHTS.bridgeDeck-draft+.5,15.25-half]),'mess');
 assert.equal(spaceOf([-1.7,FERRY_HEIGHTS.bridgeDeck-draft+.5,15.25-half]),'galley');
});

test('the audit reports what is wrong, not what is meant: walls meet decks, pipes enter what they serve, port and starboard once',()=>{
 for(const f of findings){
  assert.ok(f.at.yard>-.5&&f.at.yard<FERRY_SHIP.length+.5,`${f.n} lies along her`);
  assert.ok(['hold','car','passenger','bridge','compass'].includes(f.deck),`${f.n} is on a deck`);
  assert.ok(['clash','check'].includes(f.severity));
  // Structure meeting structure is how she is built; a clash always involves a fitting.
  if(['clash','into-structure','part-clash'].includes(f.kind))assert.ok(f.pieces.some(p=>!/^(wall or deck|trim piece)$/.test(p)),`${f.n}: ${f.what}`);
  // Pipework, cables and taps pass into what they serve.
  if(f.kind==='clash')assert.ok(!f.pieces.some(p=>/pipe|bend|branch|tap|cock|valve|cable|tray|penetration/i.test(p))||f.depth>.1,`${f.n}: ${f.what}`);
  // Where to fix it: the line of ferry-interior.js that made each piece.
  if(['clash','into-structure','floating'].includes(f.kind))assert.ok(f.source?.length&&f.source.every(s=>/^ferry-interior\.js:\d+$/.test(s)),`${f.n} names its source`);
 }
 // The same finding to port and starboard is one finding, both sides.
 for(const f of findings.filter(f=>f.sides==='both'))assert.ok(!findings.some(g=>g!==f&&g.kind===f.kind&&g.what===f.what&&Math.abs(g.at.yard-f.at.yard)<.05&&Math.abs(g.at.x+f.at.x)<.05));
 assert.deepEqual(findings.map(f=>f.n),findings.map((_,i)=>'F'+(i+1)),'numbered in order');
});
