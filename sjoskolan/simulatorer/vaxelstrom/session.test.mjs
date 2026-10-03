// node --test sjoskolan/simulatorer/vaxelstrom/session.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {createStationB,instrumentVisning,KEY,stammer} from './session.mjs';
import {GUIDE_TASKS,personligUppgift,guideValues} from '../../vaxelstromslabbet/guided-lessons.mjs';
import {takter,sladdar} from './manus.mjs';
import * as THREE from '../../../johansson-town/vendor/three.module.js';
import {readFileSync} from 'node:fs';

const mem=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),m};};

test('samma uppgifter och samma personliga värden som veckans labb, för alla D',()=>{
  for(let D=1;D<=31;D++){
    const s=createStationB(mem(),D);
    assert.equal(s.tasks.length,8);
    s.tasks.forEach((t,i)=>{
      const vecka=personligUppgift(GUIDE_TASKS[i],D);
      assert.equal(t.ovning,vecka.ovning);assert.equal(t.prompt,vecka.prompt);
      for(const [k] of t.fields)assert.equal(s.values(t)[k],guideValues(vecka)[k]);
    });
  }
});

test('förutsäg → Erik visar → läs av → förklara; första förutsägelsen skrivs aldrig över',()=>{
  const st=mem(),s=createStationB(st,9);
  assert.equal(s.phase,0);
  assert.match(s.predict({trms:''}),/Skriv din förutsägelse/);
  assert.equal(s.predict({trms:'9,5',avg:'10'}),'');assert.equal(s.phase,1);
  assert.ok(s.shown());assert.equal(s.phase,2);
  assert.deepEqual(s.verdict().map(v=>v.ok),[false,true]);
  s.revise();assert.equal(s.predict({trms:'10',avg:'10'}),'');
  assert.equal(s.row.first.trms,9.5);assert.equal(s.row.attempts,2);
  s.shown();assert.match(s.explain(''),/egna ord/);assert.equal(s.explain('Kalibratorn ger ren sinus.'),'');
  assert.equal(s.done(),1);
  const igen=createStationB(st,9);assert.equal(igen.task.id,'kalibrator');assert.equal(igen.phase,3);
  assert.ok(st.m.has(KEY));assert.ok(![...st.m.keys()].some(k=>k.startsWith('sjoskolan-ac')));
});

test('ett annat D börjar om, utan att blanda värden',()=>{
  const st=mem();const a=createStationB(st,4);a.predict({trms:'10',avg:'10'});
  const b=createStationB(st,5);assert.equal(b.phase,0);assert.deepEqual(b.rows,{});
});

test('instrumenten visar avläsningen som ger uppgiftens svar',()=>{
  for(const D of [1,13,31]){
    const s=createStationB(mem(),D);
    for(const t of s.tasks){
      const v=instrumentVisning(t),svar=s.values(t);
      const tal=x=>Number(String(x).replace(/\s| /g,'').replace(',','.').replace(/[^\d.]/g,''));
      if(t.id==='kalibrator'){assert.ok(stammer(svar.trms,tal(v.M1[1])));assert.ok(stammer(svar.avg,tal(v.M2[1])));}
      if(t.id==='grund-period')assert.equal(v.scope.T,svar.T);
      if(t.id==='grund-topp')assert.equal(v.scope.peak,svar.peak);
      if(t.id==='grund-xl')assert.ok(stammer(svar.XL,tal(v.M2[1])/tal(v.M1[1])));
      if(t.id==='grund-z')assert.ok(stammer(svar.Z,tal(v.M2[1])/tal(v.M1[1])));
      if(t.id==='grund-strom')assert.ok(stammer(svar.I,tal(v.M1[1])));
      if(t.lesson==='effekt')assert.ok(stammer(svar.I,tal(v.analysator.I)));
    }
  }
});

test('Erik säger aldrig ett svar och arbetar bara själv på 230 V',()=>{
  const P=new Proxy({},{get:()=>new THREE.Vector3()});
  for(const t of GUIDE_TASKS){
    const b=takter(t,P);assert.ok(b.some(x=>x.show),`${t.id}: visar avläsningen`);
    for(const x of b){
      const tal=(x.say.match(/(?<![A-Za-zÅÄÖåäö])\d+(?:[ ,]\d+)*/g)||[]);
      for(const n of tal)assert.ok(['10','230'].includes(n),`${t.id}: talet ${n} i Eriks replik`);
    }
    if(t.lesson==='effekt')assert.ok(b.some(x=>/jag|Jag|Det här kopplar jag/.test(x.say)));
    assert.ok(Array.isArray(sladdar(t)));
  }
});

test('ögonblicksbilderna är oförändrade kopior av Växelströmslabbet',()=>{
  const snap=JSON.parse(readFileSync(new URL('../snapshot.json',import.meta.url)));
  for(const f of ['model.mjs','lessons.mjs','uppgifter.gen.mjs']){
    assert.equal(readFileSync(new URL(f,import.meta.url),'utf8'),readFileSync(new URL('../../vaxelstromslabbet/'+f,import.meta.url),'utf8'),f);
  }
  assert.ok(snap.stationB?.sourceFiles);
  // guided-lessons.mjs skiljer sig bara i sökvägen till gemensamt/elevtal.mjs
  const a=readFileSync(new URL('guided-lessons.mjs',import.meta.url),'utf8'),b=readFileSync(new URL('../../vaxelstromslabbet/guided-lessons.mjs',import.meta.url),'utf8');
  assert.equal(a.replace("'../../gemensamt/elevtal.mjs","'../gemensamt/elevtal.mjs"),b);
});
