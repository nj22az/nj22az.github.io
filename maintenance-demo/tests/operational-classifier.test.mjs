import test from 'node:test';
import assert from 'node:assert/strict';
import {operationalClassify} from '../operational-classifier.mjs';

// Acceptance fixtures transcribed from the official consolidated PDF's actual merged
// cells, printed pages 88–94, including amendments AFS 2024:4. Values at an upper
// boundary remain in the lower class (9 kap. 23 §).
const BASE={operationalExclusion:'none',operationalType:'vessel',opGroup:'1a',opPhase:'gas',p:'10',temperature:'20',volume:'10',dn:'100',ratedPower:'100',coilVolume:'100',flowThroughCoil:'no',operationalLimitsBasis:'body',operationalLimitsReference:'Certificate CL-7, stated permitted limits',fluidEvidenceReference:'Reviewed SDS and §25 group assessment',phaseBasis:'§24 phase assessment at maximum permitted temperature',overheatingRisk:'no',steamOrHotWater:'no',heatedAssessmentReference:'Heating assessment H1',multipleFluids:'no',multipleCompartments:'no',unstableGas:'no',waterPressurisedAir:'no',airOrNitrogen:'no',refrigeration:'no',branchPipe:'no'};
const calc=changes=>operationalClassify({...BASE,...changes});
function expect(changes,className,label){const r=calc(changes);assert.equal(r.status,'calculated',label+': '+r.reasons.join(' '));assert.equal(r.className,className,label);assert.deepEqual(r.required,[],label);return r;}
function cases(type,rows,extras={}){for(const [values,expected,label]of rows)expect({operationalType:type,...extras,...values},expected,label);}

test('boilers use temperature/power boundaries and the 25-litre coil exception',()=>{
  cases('boiler',[
    [{temperature:'110.001',ratedPower:'5'},'other','5 kW upper boundary'],
    [{temperature:'110.001',ratedPower:'5.001'},'A','above 5 kW and 110 C'],
    [{temperature:'110',ratedPower:'101'},'B','110 C remains B'],
    [{temperature:'65',ratedPower:'1000'},'other','65 C lower boundary'],
    [{temperature:'65.001',ratedPower:'100'},'other','100 kW lower boundary'],
    [{temperature:'65.001',ratedPower:'100.001'},'B','above 65 C and 100 kW'],
    [{temperature:'150',ratedPower:'1000',flowThroughCoil:'yes',coilVolume:'25'},'other','coil 25 L exception'],
    [{temperature:'150',ratedPower:'1000',flowThroughCoil:'yes',coilVolume:'25.001'},'A','coil above 25 L'],
    [{temperature:'65',ratedPower:'1000',flowThroughCoil:'unknown'},'other','irrelevant coil flag does not block a below-limit result']
  ]);
  assert.equal(calc({operationalType:'boiler',temperature:'150',ratedPower:'1000',flowThroughCoil:'unknown'}).status,'review');
});

test('electric tap-water heaters use 500/2000 litre boundaries and their actual definition',()=>{
  cases('water-heater',[
    [{temperature:'66',volume:'500'},'other','500 L lower boundary'],
    [{temperature:'66',volume:'500.001'},'B','above 500 L'],
    [{temperature:'110',volume:'2000'},'B','2000 L upper B boundary'],
    [{temperature:'110',volume:'2000.001'},'A','above 2000 L']
  ]);
  for(const temperature of ['65','110.001'])assert.equal(calc({operationalType:'water-heater',temperature}).status,'review','Reassess equipment definition rather than returning a false unclassified result.');
});

test('heated non-boiler table 2 uses strict volume, 50/200 bar-litre and 32-bar boundaries',()=>{
  cases('heated',[
    [{p:'20',volume:'2'},'other','volume 2 L gate'],
    [{p:'20',volume:'2.5'},'other','pV 50 lower boundary'],
    [{p:'20',volume:'2.5001'},'B','pV above 50'],
    [{p:'25',volume:'8'},'B','pV 200 remains B'],
    [{p:'25',volume:'8.0001'},'A','pV above 200'],
    [{p:'32',volume:'2.0001'},'B','p 32 belongs to lower-pressure row'],
    [{p:'32.0001',volume:'2.0001'},'A','above p 32 enters high-pressure row'],
    [{p:'.5',volume:'10000'},'other','heated table pressure must exceed .5']
  ],{temperature:'120',overheatingRisk:'yes',steamOrHotWater:'yes'});
  const r=calc({operationalType:'heated',temperature:'120',p:'25',volume:'8',overheatingRisk:'yes',steamOrHotWater:'yes',opGroup:'unknown',opPhase:'unknown',fluidEvidenceReference:'',phaseBasis:''});
  assert.equal(r.className,'B','Table 2 does not use fluid group or ordinary-vessel phase.');
});

test('ordinary gas-vessel table 3 covers both groups and both volume ranges',()=>{
  cases('vessel',[
    [{opGroup:'1a',p:'10',volume:'5'},'other','1a pV 50'],
    [{opGroup:'1a',p:'10',volume:'5.001'},'B','1a pV above 50'],
    [{opGroup:'1a',p:'10',volume:'20'},'B','1a pV 200'],
    [{opGroup:'1a',p:'10',volume:'20.001'},'A','1a pV above 200'],
    [{opGroup:'1a',p:'10000',volume:'.1'},'other','1a minimum volume .1'],
    [{opGroup:'1a',p:'200',volume:'1'},'other','small 1a pressure 200'],
    [{opGroup:'1a',p:'200.001',volume:'1'},'A','small 1a pressure above 200'],
    [{opGroup:'2a',p:'10',volume:'20'},'other','2a pV 200'],
    [{opGroup:'2a',p:'10',volume:'20.001'},'B','2a pV above 200'],
    [{opGroup:'2a',p:'10',volume:'100'},'B','2a pV 1000'],
    [{opGroup:'2a',p:'10',volume:'100.001'},'A','2a pV above 1000'],
    [{opGroup:'2a',p:'10000',volume:'.1'},'other','2a minimum volume .1'],
    [{opGroup:'2a',p:'1000',volume:'1'},'other','small 2a pressure 1000'],
    [{opGroup:'2a',p:'1000.001',volume:'1'},'A','small 2a pressure above 1000'],
    [{p:'.5',volume:'100000'},'other','vessel .5 bar table boundary']
  ]);
});

test('ordinary liquid-vessel table 4 uses the actual merged A cell above 2000, not 10000',()=>{
  cases('vessel',[
    [{opGroup:'1a',p:'100',volume:'2'},'other','1a pV 200'],
    [{opGroup:'1a',p:'100.001',volume:'2'},'B','1a pV above 200'],
    [{opGroup:'1a',p:'1000',volume:'2'},'B','1a pV 2000'],
    [{opGroup:'1a',p:'1000.001',volume:'2'},'A','1a pV above 2000'],
    [{opGroup:'1a',p:'10',volume:'2000'},'B','1a pressure 10 never promotes to A'],
    [{opGroup:'1a',p:'500',volume:'1'},'other','small 1a p500'],
    [{opGroup:'1a',p:'500.001',volume:'1'},'B','small 1a p above500'],
    [{opGroup:'1a',p:'10000',volume:'.1'},'other','small 1a V .1'],
    [{opGroup:'2a',p:'1000',volume:'1000',temperature:'65'},'other','cool 2a exception includes65'],
    [{opGroup:'2a',p:'500',volume:'1000',temperature:'66'},'other','2a p500 lower boundary'],
    [{opGroup:'2a',p:'625',volume:'16',temperature:'66'},'other','2a pV10000'],
    [{opGroup:'2a',p:'625.001',volume:'16',temperature:'66'},'B','2a pV above10000'],
    [{opGroup:'2a',p:'2000',volume:'10',temperature:'66'},'other','2a V10 lower boundary']
  ],{opPhase:'liquid'});
});

test('gas-piping table 5 preserves 1000, 3500, 5000 and DN boundaries',()=>{
  cases('piping',[
    [{opGroup:'1a',p:'1000',dn:'25'},'other','1a DN25 boundary'],
    [{opGroup:'1a',p:'10',dn:'100'},'B','1a pDN1000 remains B'],
    [{opGroup:'1a',p:'10.001',dn:'100'},'A','1a pDN above1000 A'],
    [{opGroup:'1a',p:'.501',dn:'100.001'},'A','1a aboveDN100 A'],
    [{opGroup:'2a',p:'1000',dn:'100'},'other','2a DN100 boundary'],
    [{opGroup:'2a',p:'17.5',dn:'200'},'other','2a pDN3500 boundary'],
    [{opGroup:'2a',p:'17.501',dn:'200'},'B','2a pDN above3500 B'],
    [{opGroup:'2a',p:'1000',dn:'250'},'B','2a DN250 has no table-A band'],
    [{opGroup:'2a',p:'7',dn:'500'},'other','large2a pDN3500 boundary'],
    [{opGroup:'2a',p:'7.001',dn:'500'},'B','large2a above3500'],
    [{opGroup:'2a',p:'10',dn:'500'},'B','large2a pDN5000 boundary'],
    [{opGroup:'2a',p:'10.001',dn:'500'},'A','large2a above5000'],
    [{opGroup:'2a',p:'20',dn:'200',temperature:'350'},'B','350 C upper nonpromotion'],
    [{opGroup:'2a',p:'20',dn:'200',temperature:'350.001'},'A','above350 C table-B promotion']
  ]);
});

test('liquid-piping table 6 uses pressure-product and temperature gates',()=>{
  cases('piping',[
    [{opGroup:'1a',p:'1000',dn:'25'},'other','DN25 lower gate'],
    [{opGroup:'1a',p:'20',dn:'100'},'other','pDN2000 boundary'],
    [{opGroup:'1a',p:'20.001',dn:'100'},'A','pDN above2000,p above10'],
    [{opGroup:'1a',p:'10',dn:'200.001'},'B','p10 lower row'],
    [{opGroup:'2a',p:'1000',dn:'200',temperature:'66'},'other','2a DN200 gate'],
    [{opGroup:'2a',p:'20',dn:'250',temperature:'66'},'other','2a pDN5000 boundary'],
    [{opGroup:'2a',p:'20.001',dn:'250',temperature:'66'},'B','2a above5000'],
    [{opGroup:'2a',p:'1000',dn:'250',temperature:'65'},'other','2a cool exception'],
    [{opGroup:'2a',p:'10',dn:'1000',temperature:'66'},'other','2a p10 gate']
  ],{opPhase:'liquid'});
});

test('cistern classes use volume/group and never impose a positive .5-bar minimum or invent group2a A',()=>{
  cases('cistern',[
    [{opGroup:'1a',volume:'5000'},'other','1a5000 boundary'],
    [{opGroup:'1a',volume:'5000.001'},'B','1a above5000'],
    [{opGroup:'1a',volume:'10000'},'B','1a10000 boundary'],
    [{opGroup:'1a',volume:'10000.001'},'A','1a above10000'],
    [{opGroup:'2a',temperature:'65',volume:'1000000'},'other','2a65C boundary'],
    [{opGroup:'2a',temperature:'66',volume:'50000'},'other','2a50000 boundary'],
    [{opGroup:'2a',temperature:'66',volume:'50000.001'},'B','2a above50000'],
    [{opGroup:'2a',temperature:'66',volume:'1000000000'},'B','2a always B above gate']
  ],{p:'0',opPhase:'unknown',phaseBasis:''});
});

test('vacuum classes use negative pressure and the separate 1000/5000/50000/500000 volume bands',()=>{
  cases('vacuum',[
    [{opGroup:'1a',volume:'1000'},'other','1a1000 boundary'],
    [{opGroup:'1a',volume:'1000.001'},'B','1a above1000'],
    [{opGroup:'1a',volume:'5000'},'B','1a5000 boundary'],
    [{opGroup:'1a',volume:'5000.001'},'A','1a above5000'],
    [{opGroup:'2a',temperature:'65',volume:'1000000'},'other','2a65C boundary'],
    [{opGroup:'2a',temperature:'66',volume:'50000'},'other','2a50000 boundary'],
    [{opGroup:'2a',temperature:'66',volume:'50000.001'},'B','2a above50000'],
    [{opGroup:'2a',temperature:'66',volume:'500000'},'B','2a500000 boundary'],
    [{opGroup:'2a',temperature:'66',volume:'500000.001'},'A','2a above500000']
  ],{p:'-.5',opPhase:'unknown',phaseBasis:''});
});

test('unstable-gas promotions, B-only vessel exceptions and water-pumping p=1 are explicit',()=>{
  expect({unstableGas:'yes'},'A','unstable table-B1a gas vessel promoted');
  expect({operationalType:'piping',unstableGas:'yes'},'A','unstable table-B1a gas pipe promoted');
  expect({opGroup:'2a',volume:'100',airOrNitrogen:'yes'},'other','air table B demoted');
  expect({opGroup:'2a',volume:'100.001',airOrNitrogen:'yes'},'A','air table A retained');
  expect({opGroup:'2a',volume:'100',refrigeration:'yes'},'other','refrigeration table B demoted');
  expect({opGroup:'2a',volume:'100.001',refrigeration:'yes'},'A','refrigeration table A retained');
  const water=expect({opGroup:'2a',volume:'1000',airOrNitrogen:'yes',waterPressurisedAir:'yes'},'other','water pumping uses p1 then air B exception');
  assert.equal(water.calculations.effectiveP,1);assert.equal(water.calculations.pVExact,'1000');
  expect({opGroup:'2a',volume:'1000.001',airOrNitrogen:'yes',waterPressurisedAir:'yes'},'A','water-pumping class A retained');
});

test('relevant unknowns and multi-system cases request review without blocking unrelated fields',()=>{
  for(const changes of [{operationalExclusion:'unknown'},{multipleFluids:'yes'},{multipleCompartments:'yes'},{operationalType:'piping',branchPipe:'unknown'},{opPhase:'unknown'},{phaseBasis:''},{opGroup:'unknown'},{operationalLimitsBasis:'unknown'},{overheatingRisk:'unknown',steamOrHotWater:'unknown',temperature:'120'},{unstableGas:'unknown'}])assert.equal(calc(changes).status,'review',JSON.stringify(changes));
  expect({volume:'100',unstableGas:'unknown'},'A','unstable flag cannot alter existing table A');
  expect({operationalType:'cistern',p:'0',volume:'10001',opPhase:'unknown',flowThroughCoil:'unknown',branchPipe:'unknown',overheatingRisk:'unknown'},'A','unrelated flags do not block cistern classification');
  expect({operationalType:'piping',p:'100',dn:'101',multipleCompartments:'unknown'},'A','ordinary pipe does not need vessel compartment screening');
});

test('scope exclusions, contradictory definitions, invalid numeric inputs and exact products are safe',()=>{
  const excluded=calc({operationalExclusion:'excluded',operationalExclusionReason:'Reviewed §1 exclusion'});assert.equal(excluded.status,'outside');assert.equal(excluded.className,'other');
  assert.equal(calc({operationalExclusion:'excluded',operationalExclusionReason:''}).status,'review');
  assert.equal(calc({operationalType:'cistern',p:'.5001'}).status,'review');
  assert.equal(calc({operationalType:'vacuum',p:'-.0065'}).status,'review');
  for(const p of [null,true,Infinity,'10 bar','1 000','1e3','',{},'-1'])assert.equal(calc({p}).status,'review',String(p));
  const exact=expect({opGroup:'1a',opPhase:'liquid',p:'20.1',volume:'99.50248756218905472636815920398009950248756218905472636815920398009950248756218905472636815920398009950248'},'B','decimal product just below2000 remains B');
  assert.ok(exact.calculations.pVExact.startsWith('1999.999999'));
  assert.doesNotThrow(()=>operationalClassify(null));
  const original={...BASE};calc({});assert.deepEqual(original,BASE);
});
