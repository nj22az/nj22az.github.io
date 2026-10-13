// Ms Ganaha's places (src/world/island-guide.js; the studio's town-studio/island-guide/plan.md, batch 2): every
// answer is held to the game's own files, she never promises what is not built, and she can be asked at her window.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {installDOM} from './fixtures.mjs';
const {ISLAND_PLACES,islandPlaces,islandPlace}=await import('../src/world/island-guide.js');
const {FLIGHT_TIMES,stamp}=await import('../src/island/services.js');
const {createActivities}=await import('../activities.js');
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');

test('every place is whole, and each of its facts is still in the game', () => {
 assert.equal(new Set(ISLAND_PLACES.map(p=>p.id)).size,ISLAND_PLACES.length);
 for(const p of ISLAND_PLACES){
  assert.ok(['kitano','johansson'].includes(p.island),p.id);
  assert.ok(['beach','view','shrine','shop','village','travel','bath','walk'].includes(p.kind),p.id);
  assert.ok(p.says.length>60&&p.says.length<420,p.id+' says something, briefly');
  assert.ok(p.checks.length>=1,p.id+' is held to the game');
  for(const [file,text] of p.checks)assert.ok(read(file).includes(text),`${p.id}: "${text}" in ${file}`);
 }
 assert.ok(islandPlaces('kitano').length>=5&&islandPlaces('johansson').length>=5);
 assert.match(islandPlace('airport').says,new RegExp(FLIGHT_TIMES.map(stamp).join('|')),'the flights from the timetable');
});

test('she never promises what is not built', () => {
 const all=ISLAND_PLACES.map(p=>p.says).join(' ');
 // No live turtles: she only repeats what the cove's own sign says, and that she has never seen one.
 assert.match(islandPlace('turtle-cove').says,/they say/);
 // No village bus, no guesthouse, no keeper, no summer flight, no fare.
 assert.match(islandPlace('hoshizaki').says,/no village bus yet/);assert.match(islandPlace('hoshizaki').says,/only a sign so far/);
 assert.match(islandPlace('west-cape').says,/no keeper/);
 assert.doesNotMatch(all,/summer flight|Gate 2|parasol|¥400 (ferry|return)/i);
});

test('at her window: pick an island, then a place', () => {
 const dom=installDOM({});const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>13*60});
 acts.action('ganaha','Ms Ganaha',{buy(){}});
 assert.ok(dom.labels().includes('What is there on Kitano-jima?')&&dom.labels().includes('What is there on this island?'));
 dom.button('What is there on Kitano-jima?');
 assert.deepEqual(dom.labels(),[...islandPlaces('kitano').map(p=>p.name),'That is all, thank you']);
 dom.button('Coral Bay');
 assert.equal(document.querySelector('#activityBody').children[0].textContent,islandPlace('coral-bay').says);
 dom.button('Somewhere else?');dom.button('That is all, thank you');
 dom.button('What is there on this island?');assert.ok(dom.labels().includes('Umi-no-yu'));
});
