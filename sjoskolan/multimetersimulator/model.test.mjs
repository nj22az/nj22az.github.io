import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, network, solve, resistance, measure, lampCurrent } from './model.mjs';
import { LESSONS } from './lessons.mjs';
const near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} ≠ ${b}`);
const lamp=(patch={})=>({...initialState(),mode:'dc',power:true,red:'P1',black:'P2',...patch});
test('voltage and polarity are calculated between arbitrary nodes',()=>{
  near(measure(lamp()).value,12);near(measure(lamp({red:'P2',black:'P1'})).value,-12);
  near(measure(lamp({red:'K1',black:'P1'})).value,0);
  near(measure(lamp({voltage:24})).value,24);
});
test('open link extinguishes lamp and moving the probes changes voltage',()=>{
  near(measure(lamp({link:false})).value,0);near(lampCurrent(lamp({link:false})),0);
  near(measure(lamp({link:false,red:'K1',black:'K2'})).value,12*1e7/(1e7+120));
});
test('ammeter shunt completes an open series path and adds burden',()=>{
  const s=lamp({mode:'current',jack:'a',link:false,red:'K1',black:'K2'});
  near(measure(s).value,12/120.1);near(lampCurrent(s),12/120.1);
  near(measure({...s,jack:'ma'}).value,1000*12/121);
  near(measure({...s,red:'K2',black:'K1'}).value,-12/120.1);
});
test('a closed wire bypasses the ammeter',()=>{
  near(measure(lamp({mode:'current',jack:'a',red:'K1',black:'K2'})).value,0);
});
test('physical current jack shorts the source even in V or OFF',()=>{
  for(const mode of ['current','dc','off'])assert.equal(measure(lamp({mode,jack:'a'})).trip,'short');
  assert.equal(measure(lamp({mode:'current',jack:'ma'})).trip,'fuse');
});
test('mA fuse opens on excess current and has no conductive path afterward',()=>{
  const s=lamp({mode:'current',jack:'ma',link:false,red:'K1',black:'K2',load:30});
  assert.equal(measure(s).trip,'fuse');assert.equal(measure({...s,fuse:true}).code,'fuse');near(lampCurrent({...s,fuse:true}),0);
});
test('resistance includes parallel paths, same node and disconnected nodes',()=>{
  const s={...initialState('resistor'),mode:'ohm',red:'A',black:'B'};
  near(resistance(network(s),'A','B'),500);near(measure(s).value,500);
  near(measure({...s,parallel:false}).value,1);assert.equal(measure({...s,parallel:false}).unit,'kΩ');
  near(measure({...s,red:'B'}).value,0);
  assert.equal(measure({...initialState('fuse'),mode:'ohm',red:'A',black:'B',broken:true}).code,'open');
});
test('live resistance and wrong sockets cannot produce a valid reading',()=>{
  assert.equal(measure(lamp({mode:'ohm'})).code,'live-ohm');
  assert.equal(measure(lamp({mode:'continuity'})).code,'live-ohm');
  assert.equal(measure(lamp({mode:'current'})).code,'jack');
});
test('continuity differentiates intact and open fuse; one probe is not a measurement',()=>{
  const s={...initialState('fuse'),mode:'continuity',red:'A',black:'B'};
  assert.equal(measure(s).beep,true);near(measure(s).value,.2);
  assert.equal(measure({...s,broken:true}).code,'open');assert.equal(measure({...s,black:null}).code,'waiting');
});
test('finite meter impedance loads a voltage divider',()=>{
  const s={...initialState('divider'),mode:'dc',power:true,red:'M',black:'G'};
  near(measure(s).value,100/21);near(measure({...s,input:1e6}).value,10/3);
  near(solve(network(s)).voltage.M,5);
});
test('range overload, AC rejection of pure DC and power-off behavior',()=>{
  assert.equal(measure(lamp({voltage:24,range:'20'})).code,'overrange');
  assert.equal(measure(lamp({voltage:24,range:'200'})).text,'24,00');
  near(measure(lamp({mode:'ac'})).value,0);near(measure(lamp({power:false})).value,0);
});
test('nodal solver preserves floating nodes and rejects contradictory ideal sources',()=>{
  const net={nodes:['a','b','c'],edges:[['a','b',100]],fixed:{a:1}};
  const out=solve(net);near(out.voltage.b,1);assert.equal(out.voltage.c,null);
  assert.throws(()=>solve({nodes:['a','b'],edges:[['a','b',0]],fixed:{a:1,b:0}}));
});
test('every measurement lesson accepts an electrically correct setup',()=>{
  const setups={
    voltage:[lamp()],polarity:[lamp({red:'P2',black:'P1'})],
    current:[lamp({mode:'current',jack:'a',link:false,red:'K1',black:'K2'}),initialState()],
    resistance:[{...initialState('resistor'),mode:'ohm',red:'A',black:'B',parallel:false}],
    parallel:[{...initialState('resistor'),mode:'ohm',red:'A',black:'B'},{...initialState('resistor'),mode:'ohm',red:'A',black:'B',parallel:false}],
    continuity:[{...initialState('fuse'),mode:'continuity',red:'A',black:'B'},{...initialState('fuse'),mode:'continuity',red:'A',black:'B',broken:true}],
    loading:[{...initialState('divider'),mode:'dc',power:true,red:'M',black:'G'},{...initialState('divider'),mode:'dc',power:true,red:'M',black:'G',input:1e6}]
  };
  for(const lesson of LESSONS.filter(l=>l.circuit!=='category')) lesson.steps.forEach((step,i)=>{
    assert.equal(Boolean(step.test(setups[lesson.id][i],measure(setups[lesson.id][i]))),true,`${lesson.id} step ${i+1}`);
    assert.equal(Boolean(step.test(initialState(lesson.circuit),measure(initialState(lesson.circuit)))),lesson.id==='current'&&i===1,`${lesson.id} rejects unconfigured meter`);
  });
});
