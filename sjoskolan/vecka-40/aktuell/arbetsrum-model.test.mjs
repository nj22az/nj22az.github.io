import test from 'node:test';
import assert from 'node:assert/strict';
import {STUDY} from './arbetsrum.gen.mjs';
import {LESSONS} from './lektioner.mjs';
import {number, check, attempt, solutionAvailable, status, isCorrect, isWorked, exerciseState, normalise, createStore, STUDY_KEY, verifiedExercises} from './studieprogress.mjs';
const task=id=>STUDY.tasks[`EL-${String(id).padStart(6,'0')}`];
const fresh=t=>exerciseState(normalise(null),t);

test('all 34 exercises occur once, after their teaching prerequisites',()=>{
  const lessons=[STUDY.isolation,...LESSONS];
  assert.equal(Object.keys(STUDY.tasks).length,34);
  for(const l of lessons){
    const seen=new Set();
    for(const id of STUDY.sequence[l.id]){
      if(id.startsWith('EL-')){
        const t=STUDY.tasks[id];assert.equal(t.del,l.id);
        for(const theory of t.teori)assert.ok(seen.has(theory),`${id} needs ${theory}`);
        assert.ok(t.solution.text);assert.ok(t.hints.length);
      }else assert.ok(l.slides.some(s=>s.id===id),`${l.id}:${id}`);
      assert.ok(!seen.has(id),id);seen.add(id);
    }
  }
});
test('period requires both seconds and milliseconds; decimal comma and signed values work',()=>{
  assert.equal(check(task(61),['0,020','20']).correct,true);
  assert.equal(check(task(61),['0,020','']).valid,false);
  assert.equal(check(task(61),['20','20']).correct,false);
  assert.equal(check(task(67),['−17,0']).correct,true);
  assert.equal(number('1 200,5'),1200.5);
  for(const input of ['',null,'12 V','Infinity','1,2,3','1/50'])assert.ok(Number.isNaN(number(input)));
});
test('complete calculation answers are checked, including zero and every requested quantity',()=>{
  const answers={63:['16,97'],65:['10','7,07'],68:['36'],70:['8,49','12','0','0'],73:['50'],75:['60','80','100'],76:['53,13','släpar'],77:['100','2','−53,13'],78:['fördubblas','halveras'],79:['40','50','2'],80:['5','0'],84:['1,6','1,2'],89:['44,44']};
  for(const [id,values] of Object.entries(answers))assert.equal(check(task(id),values,'Min motivering').correct,true,id);
  assert.equal(check(task(75),['60','80','140']).correct,false,'phasor voltages do not add arithmetically');
  assert.equal(check(task(80),['5','1']).correct,false,'zero phase must not use a relative tolerance alone');
  assert.match(task(75).question.samband[0],/I · R/);
});
test('blank and duplicate submissions do not unlock answers; two different attempts do',()=>{
  const t=task(61);let r=fresh(t);
  r=attempt(r,t,['','']).record;assert.equal(r.attempts.length,0);
  r=attempt(r,t,['1','1']).record;assert.equal(solutionAvailable(r),false);
  const duplicate=attempt(r,t,['1,0','1.0']);assert.equal(duplicate.duplicate,true);assert.equal(duplicate.record.attempts.length,1);
  r=attempt(r,t,['2','2']).record;assert.equal(solutionAvailable(r),true);assert.equal(isCorrect(r),false);
});
test('correct first answer completes immediately; copying a revealed answer does not',()=>{
  const t=task(63);
  let r=attempt(fresh(t),t,['17']).record;assert.equal(solutionAvailable(r),true);assert.equal(isCorrect(r),true);
  r.solutionSeen=true;assert.equal(isCorrect(r),true,'reviewing after an independent success retains that evidence');
  r=attempt({...fresh(t),solutionSeen:true},t,['17']).record;assert.equal(isCorrect(r),false);assert.equal(status(r,t),'Lösning genomgången');
});
test('written reasoning is saved for assessment and is never automatically passed',()=>{
  const t=task(630);const a=attempt(fresh(t),t,[],'Jag behöver kontrollera båda matningarna.');
  assert.equal(a.result.valid,true);assert.equal(a.result.correct,false);assert.equal(isCorrect(a.record),false);assert.match(status(a.record,t),/läraren bedömer/);
  assert.equal(check(task(90),['0,8'],'').valid,false);
  assert.equal(isWorked({...fresh(t),help:true}),false,'asking for help alone does not complete an exercise');
});
test('storage corruption, denial and old manual progress are handled honestly',()=>{
  assert.deepEqual(normalise({'v40_01-q1':true}),normalise(null));
  const denied=createStore({getItem(){throw Error('denied')},setItem(){throw Error('denied')}});
  denied.change(s=>s.cursor={lesson:'sinus',step:'period'});assert.equal(denied.read().cursor.step,'period');assert.equal(denied.persistent,false);
  const damaged=createStore({getItem:()=>'{',setItem(){}});assert.deepEqual(damaged.read(),normalise(null));
  const map=new Map();const memory=createStore({getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)});
  memory.change(s=>s.read['r1:sinus:period']=true);assert.ok(JSON.parse(map.get(STUDY_KEY)).read['r1:sinus:period']);
  const old=normalise({version:1,exercises:{'EL-000061':{revision:0,correct:true,independent:true}}});assert.equal(verifiedExercises(STUDY.tasks,old)['v40_01-q1'],false);
});
test('instrument reference cards do not give away the exercise answers',()=>{
  assert.doesNotMatch(STUDY.cards.M1.text,/11,92|12,08|0,080|0,08 V/);
  assert.doesNotMatch(STUDY.cards.M2.text,/Välj M2/);
});
