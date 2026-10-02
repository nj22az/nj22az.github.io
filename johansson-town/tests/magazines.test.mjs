import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {MAGAZINE_TITLES,issueFor,rackIssues,MANGA_CHAPTERS} from '../src/world/interiors/magazine-issues.js';
import {pagesFor} from '../src/world/interiors/magazine-art.js';

const day=(m,d)=>new Date(1997,m-1,d);
const title=id=>MAGAZINE_TITLES.find(t=>t.id===id);

test('weeklies turn over on their own on-sale day, monthlies on the 1st, papers daily',()=>{
 const hayabusa=title('hayabusa');// on sale Mondays
 assert.equal(issueFor(hayabusa,day(9,15)).key,issueFor(hayabusa,day(9,21)).key,'same issue all week');
 assert.notEqual(issueFor(hayabusa,day(9,21)).key,issueFor(hayabusa,day(9,22)).key,'new issue on Monday');
 assert.equal(issueFor(hayabusa,day(9,22)).number,issueFor(hayabusa,day(9,15)).number+1);
 const guide=title('shimaaruki');
 assert.equal(issueFor(guide,day(9,1)).key,issueFor(guide,day(9,30)).key);
 assert.notEqual(issueFor(guide,day(9,30)).key,issueFor(guide,day(10,1)).key);
 assert.equal(issueFor(guide,day(9,13)).dateLine,'October 1997','monthlies carry next month on the cover');
 for(const id of ['minato','shimaspo','nippo']){
  const t=title(id);assert.notEqual(issueFor(t,day(9,13)).head,issueFor(t,day(9,14)).head,id+' changes daily');
  assert.notEqual(issueFor(t,day(9,13)).head,issueFor(t,day(9,20)).head,id+' differs a week later');
 }
 assert.deepEqual(rackIssues(day(9,13)),rackIssues(day(9,13)));
 assert.notEqual(rackIssues(day(9,13)).key,rackIssues(day(9,14)).key);
});

test('every chapter of the serial comes round, and each issue has pages to flip',()=>{
 const seen=new Set();
 for(let w=0;w<8;w++)seen.add(issueFor(title('hayabusa'),day(9,1+w*7)).chapter);
 assert.equal(seen.size,MANGA_CHAPTERS);
 for(const t of MAGAZINE_TITLES)for(const d of [day(9,13),day(10,6)]){
  const pages=pagesFor(t,issueFor(t,d));
  assert.ok(pages.length>=(t.paper?2:4),t.id+' has too few pages');
  for(const p of pages){
   assert.ok(p.draw||p.image,t.id+' page has nothing to show');
   if(p.image)assert.ok(existsSync(new URL('../assets/'+p.image,import.meta.url)),p.image+' is missing; run tools/magazines/draw_pages.py');
  }
 }
 assert.ok(pagesFor(title('hayabusa'),issueFor(title('hayabusa'),day(9,13))).some(p=>/gag/.test(p.image||'')),'the 4-koma are in the shōnen weekly');
});
