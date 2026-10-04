// node --test sjoskolan/simulatorer/stationA-manus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {ERIK_STATION_A} from './stationA-manus.mjs';
import {STATION_A} from './multimeter/lessons.mjs';
import {CONTACTS,ERIK_TARGETS} from './scene.mjs';

test('ett inslag per steg i Station A, och Erik pekar bara på det som finns på bänken',()=>{
  assert.equal(ERIK_STATION_A.length,STATION_A.steps.length);
  for(const beats of ERIK_STATION_A){
    assert.ok(beats.length>0);
    for(const b of beats){
      assert.ok(b.say.trim());
      for(const t of [b.R,b.L].filter(Boolean))assert.ok(t in CONTACTS||t in ERIK_TARGETS,`okänt mål ${t}`);
    }
  }
});

test('Erik pekar bara ut mätpunkter som steget självt nämner, röd med höger och svart med vänster hand',()=>{
  ERIK_STATION_A.forEach((beats,i)=>{
    const task=STATION_A.steps[i].task;
    for(const b of beats)for(const t of [b.R,b.L])if(t in CONTACTS)assert.ok(task.includes(t)||(t.startsWith('Ref')&&/referensen/.test(task)),`steg ${i+1}: ${t}`);
  });
});

test('Erik säger aldrig ett tal (inga avläsningar eller svar)',()=>{
  for(const beats of ERIK_STATION_A)for(const b of beats){
    const tal=b.say.match(/(?<![A-Za-zÅÄÖåäö])\d+(?:[ ,.]\d+)*/g)||[];
    assert.deepEqual(tal,[],b.say);
  }
});
