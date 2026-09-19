import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
 clock,daylight,duskAmount,windowGlow,lanternGlow,fluorescent,
 periodLabel,sunColor,skyColor,gradeWarmth,PALETTE,
} from '../src/render/dusk.js';
import {atmosphere} from '../src/render/atmosphere.js';

const at=(h,m=0)=>h*60+m;

test('daylight envelope is unchanged at the old knots',()=>{
 assert.equal(daylight(at(12)),1);
 assert.equal(daylight(at(7)),1);
 assert.equal(daylight(at(17)),1);
 assert.equal(daylight(at(20)),0);
 assert.equal(daylight(at(5)),0);
 assert.ok(Math.abs(daylight(at(18,30))-0.5)<1e-9);
});

test('dusk peaks at lantern hour and is gone by night',()=>{
 assert.equal(duskAmount(at(16,59)),0);
 assert.ok(duskAmount(at(17,30))>0.2);
 assert.equal(duskAmount(at(18,30)),1);
 assert.equal(duskAmount(at(19,30)),1);
 assert.ok(duskAmount(at(20,15))<1);
 assert.equal(duskAmount(at(20,30)),0);
 assert.equal(duskAmount(at(22)),0);
});

test('windows ease on instead of snapping at 18:00',()=>{
 assert.equal(windowGlow(at(16)),0);
 assert.ok(windowGlow(at(17,30))>0.2&&windowGlow(at(17,30))<1);
 assert.equal(windowGlow(at(18)),1);
 assert.equal(windowGlow(at(2)),1);
 assert.ok(windowGlow(at(6))<1);
});

test('paper lanterns lead the windows',()=>{
 assert.ok(lanternGlow(at(17,30))>windowGlow(at(17,30)));
 assert.equal(lanternGlow(at(17,30)),1);
 assert.equal(lanternGlow(at(18)),1);
 assert.equal(lanternGlow(at(16)),0);
});

test('Sakura fluorescent stays cold and does not follow dusk',()=>{
 assert.equal(fluorescent(at(12)),1);
 assert.equal(fluorescent(at(18,30)),1);
 assert.equal(fluorescent(at(19,59)),1);
 assert.equal(fluorescent(at(20)),0.35);
 assert.equal(fluorescent(at(2)),0.35);
 assert.notEqual(PALETTE.sakuraTube,PALETTE.lanternPaper);
 assert.notEqual(PALETTE.sakuraTube,PALETTE.sunDusk);
});

test('period labels include DUSK between afternoon and evening',()=>{
 assert.equal(periodLabel(at(16,42)),'AFTERNOON');
 assert.equal(periodLabel(at(17,30)),'DUSK');
 assert.equal(periodLabel(at(18,30)),'EVENING');
 assert.equal(periodLabel(at(21)),'NIGHT');
 assert.equal(periodLabel(at(6)),'EARLY MORNING');
});

test('sun goes apricot at dusk and cool at night, never a second light',()=>{
 assert.equal(sunColor(at(12)),PALETTE.sunDay);
 assert.equal(sunColor(at(18,30)),PALETTE.sunDusk);
 assert.equal(sunColor(at(22)),PALETTE.sunNight);
});

test('sky is apricot then violet, rain stays grey',()=>{
 assert.equal(skyColor(at(12)),PALETTE.skyDay);
 assert.equal(skyColor(at(18,30)),PALETTE.skyDuskApricot);
 assert.equal(skyColor(at(20)),PALETTE.skyDuskViolet);
 assert.equal(skyColor(at(22)),PALETTE.skyNight);
 assert.equal(skyColor(at(18,30),true),PALETTE.skyRain);
});

test('grade warmth rises only at dusk and never touches ink',()=>{
 assert.ok(Math.abs(gradeWarmth(at(12))-0.05)<1e-9);
 assert.ok(gradeWarmth(at(18,30))>0.1);
 assert.ok(Math.abs(gradeWarmth(at(22))-0.05)<1e-9);
});

test('clock is fogless and does not invent point lights',()=>{
 const dusk=clock(at(18,30));
 assert.equal(dusk.fog,null);
 assert.equal(dusk.period,'EVENING');
 assert.equal(dusk.fluorescent,1);
 assert.equal(dusk.lanternGlow,1);
 assert.ok(!('pointLights' in dusk));
 assert.ok(dusk.ambient>clock(at(22)).ambient);
});

test('atmosphere(day) keeps the old three-stop sky for existing callers',()=>{
 const noon=atmosphere(1,false,false);
 assert.equal(noon.sky,0xb8dce9);
 assert.equal(noon.fog,null);
 assert.ok(atmosphere(1,false,true).ambient>=1);
 const dusk=atmosphere(0.5,false,false,at(18,30));
 assert.equal(dusk.sky,PALETTE.skyDuskApricot);
 assert.equal(dusk.fog,null);
});

test('town wiring drives windows, lanterns and nameplates from the clock',async()=>{
 const files={
  town:await readFile(new URL('../src/world/town.js',import.meta.url),'utf8'),
  homes:await readFile(new URL('../src/world/homes.js',import.meta.url),'utf8'),
  izakaya:await readFile(new URL('../src/world/izakaya.js',import.meta.url),'utf8'),
  facade:await readFile(new URL('../src/world/minato-facade.js',import.meta.url),'utf8'),
  harbour:await readFile(new URL('../src/world/harbour.js',import.meta.url),'utf8'),
  game:await readFile(new URL('../src/game.js',import.meta.url),'utf8'),
 };
 assert.match(files.town,/windowGlow/);
 assert.doesNotMatch(files.town,/>=1080/);
 assert.match(files.homes,/windowGlow/);
 assert.doesNotMatch(files.homes,/>=1080/);
 assert.match(files.izakaya,/lanternGlow/);
 assert.match(files.facade,/lanternI/);
 assert.match(files.harbour,/lanternGlow/);
 assert.match(files.game,/duskClock/);
 assert.match(files.game,/uWarmth:c\.gradeWarmth/);
 assert.doesNotMatch(files.game,/new THREE\.PointLight/);
});
