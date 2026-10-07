import test from 'node:test';
import assert from 'node:assert/strict';
import {FUJITA_DAY,bottlesFor,fujitaBeer,laughingAt,tvProgramme} from '../src/world/fujita-day.js';

test('Mr Fujita gets through 24 to 49 bottles a day, and the days differ', () => {
 const n=Array.from({length:400},(_,d)=>bottlesFor(d));
 assert.ok(n.every(v=>v>=24&&v<=49));
 assert.ok(Math.min(...n)<=26&&Math.max(...n)>=47,'the whole range turns up');
});

test('the empties pile up all day, go with the morning van, and every bottle is accounted for', () => {
 const day=10,n=bottlesFor(day);let last=-1,pours=0,wasPouring=false;
 for(let m=day*1440;m<(day+1)*1440;m+=.02){
  const b=fujitaBeer(m),t=((m%1440)+1440)%1440;
  assert.ok(b.glass>=0&&b.glass<=1);
  if(t>=FUJITA_DAY.collect){
   assert.equal(b.full+b.empties+(b.bottle===null?0:1),n,`bottles at ${t.toFixed(2)}`);
   assert.ok(b.empties>=last,'the pile never shrinks during the day');last=b.empties;
  }
  if(b.phase==='pour'&&!wasPouring)pours++;wasPouring=b.phase==='pour';
 }
 assert.equal(last,n,'every bottle is on the floor by the end of the day');
 assert.equal(pours,n*FUJITA_DAY.glassesPerBottle,'three glasses a bottle');
 assert.equal(fujitaBeer(day*1440+6*60+15).empties,0,'the van has taken them');
 assert.equal(fujitaBeer((day+1)*1440+3*60).empties,n,'he sleeps among them');
});

test('he empties a glass before he pours the next, and pours without a dry bottle', () => {
 const day=3;let prev=null;
 for(let m=day*1440+FUJITA_DAY.start;m<day*1440+FUJITA_DAY.end;m+=.01){
  const b=fujitaBeer(m);
  if(prev&&prev.phase==='drink'&&b.phase==='pour')assert.ok(prev.glass<.02,'the glass was empty');
  if(b.phase==='pour')assert.ok(b.bottle!==null,'a bottle in his hand while he pours');
  prev=b;
 }
});

test('he flips channels, the ballgame only in the afternoon, the set off at night', () => {
 assert.equal(tvProgramme(3*60),'off');
 assert.equal(tvProgramme(23*60+45),'off');
 const seen=new Set();let flips=0,last='';
 for(let m=6*60+30;m<22*60+50;m+=1){const c=tvProgramme(m);seen.add(c);if(c!==last)flips++;last=c;
  if(c==='baseball')assert.ok(m>=13*60&&m<18*60,`baseball at ${m}`);}
 assert.ok(flips>60,'many channel changes a day');
 for(const c of ['variety','drama','cooking','baseball','news'])assert.ok(seen.has(c),c);
});

test('he laughs now and then, never at a dark set', () => {
 let laughs=0,was=false;
 for(let s=0;s<24*3600;s+=.5){const l=laughingAt(s/60);if(l&&!was)laughs++;was=l;if(l)assert.notEqual(tvProgramme(s/60),'off');}
 assert.ok(laughs>200&&laughs<2000,`${laughs} laughs`);
});
