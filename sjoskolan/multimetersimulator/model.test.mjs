import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, network, solve, resistance, measure, lampCurrent, RIGS } from './model.mjs';
import { LESSONS, acceptsAnswer, numericAnswer } from './lessons.mjs';
import { protocolCSV } from './protocol.mjs';
const near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} ≠ ${b}`);
const st=(patch={})=>({...initialState('station'),mode:'dc',...patch});
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
    loading:[{...initialState('divider'),mode:'dc',power:true,red:'M',black:'G'},{...initialState('divider'),mode:'dc',power:true,red:'M',black:'G',input:1e6}],
    stationA:[st({red:'Ref+',black:'Ref−'}),st({link:false,red:'A',black:'B'}),st({link:false,mode:'ohm',red:'B',black:'A'}),st({link:false,mode:'ohm',red:'N',black:'B'}),st({power:true,red:'P',black:'N'}),st({power:true,red:'A',black:'B'}),st({power:true,red:'B',black:'N'}),
      st({power:true,mode:'current',jack:'ma',link:false,red:'P',black:'A'}),st({red:'Ref+',black:'Ref−'})]
  };
  for(const lesson of LESSONS.filter(l=>l.circuit!=='category')) lesson.steps.filter(step=>step.test).forEach((step,i)=>{
    assert.equal(Boolean(step.test(setups[lesson.id][i],measure(setups[lesson.id][i]))),true,`${lesson.id} step ${i+1}`);
    assert.equal(Boolean(step.test(initialState(lesson.circuit),measure(initialState(lesson.circuit)))),lesson.id==='current'&&i===1,`${lesson.id} rejects unconfigured meter`);
  });
});

const loading=LESSONS.find(l=>l.id==='loading');
const step=key=>loading.steps.find(s=>s.key===key);
test('predictions accept Swedish decimals and reject missing or malformed answers',()=>{
  for(const value of ['5','5,00','5.0'])assert.equal(acceptsAnswer(step('unloaded'),{value}),true);
  for(const value of ['', ' ', '0', '10', '5 V', '5,0,0', 'Infinity'])assert.equal(acceptsAnswer(step('unloaded'),{value}),false);
  assert.equal(Number.isNaN(numericAnswer('')),true);
  assert.equal(acceptsAnswer(step('kirchhoff'),{value:'6,67'}),true);
  assert.equal(acceptsAnswer(step('kirchhoff'),{value:'3,33'}),false);
  for(const key of ['predict10','predict1']){
    assert.equal(acceptsAnswer(step(key),{choice:null}),false);
    assert.equal(acceptsAnswer(step(key),{choice:1}),false);
    assert.equal(acceptsAnswer(step(key),{choice:0}),true);
  }
});
test('both measurement stages accept either polarity and reject wrong modes, jacks and nodes',()=>{
  for(const [key,input,expected] of [['measure10',10e6,100/21],['measure1',1e6,10/3]]){
    const s={...initialState('divider'),power:true,mode:'dc',red:'M',black:'G',input};
    for(const pair of [{red:'M',black:'G'},{red:'G',black:'M'}]){
      const setup={...s,...pair};assert.equal(step(key).test(setup,measure(setup)),true);near(Math.abs(measure(setup).value),expected);
    }
    for(const patch of [{power:false},{mode:'ac'},{mode:'off'},{jack:'a'},{red:'S'},{black:'M'},{red:null},{input:input===1e6?10e6:1e6},{trip:'short'}]){
      const setup={...s,...patch};assert.equal(Boolean(step(key).test(setup,measure(setup))),false,JSON.stringify(patch));
    }
  }
});
test('Kirchhoff compares one loaded circuit; moving a single meter changes the circuit',()=>{
  const s={...initialState('divider'),mode:'dc',power:true,red:'M',black:'G',input:1e6};
  const v=solve(network(s),[['M','G',s.input]]).voltage;
  near(v.M-v.G,10/3);near(v.S-v.M,20/3);near((v.S-v.M)+(v.M-v.G),10);
  near(measure({...s,red:'S',black:'M'}).value,10/3);
  assert.ok(Math.abs(measure(s).value+measure({...s,red:'S',black:'M'}).value-10)>3);
});
test('completion needs the correct concept and a written explanation',()=>{
  const comment='Mätaren ligger parallellt med R2 och ändrar spänningsdelningen.';
  assert.equal(acceptsAnswer(step('explain'),{choice:0,comment}),true);
  for(const answer of [{choice:1,comment},{choice:null,comment},{choice:0,comment:''},{choice:0,comment:'ja'},{choice:0,comment:'          '}])assert.equal(acceptsAnswer(step('explain'),answer),false);
});
test('CSV keeps readings, input resistance and comments; legacy rows remain exportable',()=>{
  const records=[{lesson:'Mätaren påverkar',step:3,reading:'−4,76 V',input:10e6,moment:'Mät med 10 MΩ'},
    {lesson:'Mätaren påverkar',step:5,reading:'3,33 V',input:1e6},
    {lesson:'Mätaren påverkar',step:7,comment:'Parallellt; med "R2"\nEn extra gren.'},
    {lesson:'Spänning',step:1,reading:'12,00 V'},
    {lesson:'Mätaren påverkar',comment:'=SUM(1+1)'}];
  const csv=protocolCSV(records);
  assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"10000000"'));assert.ok(csv.includes('"1000000"'));
  assert.ok(csv.includes('"Parallellt; med ""R2""\nEn extra gren."'));
  assert.ok(csv.includes('"12,00 V"'));assert.ok(csv.includes('"\'=SUM(1+1)"'));
});

test('Station A: every rig gives consistent readings, the reference is isolated and always live',()=>{
  for(const g of RIGS){
    const s={...initialState('station'),rig:g.id,mode:'dc',power:true};
    const I=g.U/(g.R1+g.R2);
    near(measure({...s,red:'P',black:'N'}).value,1.0025*g.U,1e-4);
    near(measure({...s,red:'A',black:'B'}).value,1.0025*I*g.R1,2e-3);
    near(measure({...s,red:'B',black:'N'}).value,1.0025*I*g.R2,2e-3);
    near(measure({...s,mode:'current',jack:'ma',link:false,red:'P',black:'A'}).value,0.995*1000*g.U/(g.R1+g.R2+1),1e-6);
    near(measure({...s,mode:'ohm',power:false,link:false,red:'A',black:'N'}).value,1.004*(g.R1+g.R2)/1000,1e-9);
    // med sluten länk ser mätaren den frånslagna källan parallellt
    const closed=measure({...s,mode:'ohm',power:false,red:'A',black:'B'});
    assert.ok((closed.unit==='kΩ'?closed.value*1000:closed.value)<0.95*g.R1);
  }
  const s={...initialState('station'),mode:'dc'};
  assert.equal(measure({...s,red:'Ref+',black:'N',power:true}).code,'separate');
  assert.equal(measure({...s,mode:'ohm',red:'Ref+',black:'Ref−'}).code,'live-ohm');
  assert.equal(measure({...s,mode:'current',jack:'a',red:'Ref+',black:'Ref−'}).trip,'short');
  assert.equal(measure({...s,mode:'ohm',power:true,red:'A',black:'B'}).code,'live-ohm');
  // en rigg har R2 utanför ±5 %, de andra ligger inom
  assert.deepEqual(RIGS.filter(g=>Math.abs(g.R2/2000-1)>.05||Math.abs(g.R1/1000-1)>.05).map(g=>g.id),[5]);
});
test('Station A protocol example matches the simulator and is complete',async()=>{
  const { STATION_A_PROTOKOLL:def } = await import('./stationA-protokoll.mjs');
  const { missing, deviationMatches, deviation } = await import('../gemensamt/labbprotokoll.mjs');
  assert.deepEqual(missing(def,def.example),[]);
  assert.equal(def.example.rows.length,def.rows.length);
  for(const r of def.example.rows){assert.equal(deviationMatches(r.avv,r.forv,r.uppm),true,JSON.stringify(r));assert.ok(Math.abs(deviation(r.forv,r.uppm).rel)<1,JSON.stringify(r));}
});
test('Station A: no rig displays the numbers from the v41_03 exercises',()=>{
  const bad=['4,00','8,00','11,94','3,98','7,96','12,00','6,93','6,90'];
  for(const g of RIGS.slice(1)){
    const b={...initialState('station'),rig:g.id};const r=p=>measure({...b,...p}).text;
    for(const v of [r({mode:'dc',power:true,red:'P',black:'N'}),r({mode:'dc',power:true,red:'A',black:'B'}),r({mode:'dc',power:true,red:'B',black:'N'}),r({mode:'current',jack:'ma',link:false,power:true,red:'P',black:'A'})])
      assert.ok(!bad.includes(v),`rig ${g.id}: ${v}`);
  }
});
