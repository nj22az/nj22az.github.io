/** Independent acceptance coordinates transcribed from the official diagrams,
 * AFS2023:5 printed pp52–60. These are fixed source examples, not copies of
 * classifier branch expressions. Operational tables are added separately below.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {productClassify} from '../classifier-core.mjs';
const ordinary={productExclusion:'none',configuration:'single',unstableGas:false,fireExtinguisher:false,breathingBottle:false,tsMax:150,pressureCooker:false,steamOrHotWater:true,overheatingRisk:true};
const branch={1:{equipmentType:'vessel',phase:'gas',fluidGroup:'1'},2:{equipmentType:'vessel',phase:'gas',fluidGroup:'2'},3:{equipmentType:'vessel',phase:'liquid',fluidGroup:'1'},4:{equipmentType:'vessel',phase:'liquid',fluidGroup:'2'},5:{equipmentType:'heated'},6:{equipmentType:'piping',phase:'gas',fluidGroup:'1'},7:{equipmentType:'piping',phase:'gas',fluidGroup:'2'},8:{equipmentType:'piping',phase:'liquid',fluidGroup:'1'},9:{equipmentType:'piping',phase:'liquid',fluidGroup:'2'}};
const productCoordinates=[
 [1,'PV25 upper SEP',{ps:12.5,volume:2},'SEP'],[1,'PV just over25',{ps:12.5001,volume:2},'I'],
 [1,'PV50 upper I',{ps:25,volume:2},'I'],[1,'PV just over50',{ps:25.0001,volume:2},'II'],
 [1,'PV200 upper II',{ps:100,volume:2},'II'],[1,'PV just over200',{ps:100.0001,volume:2},'III'],
 [1,'PV1000 upper III',{ps:500,volume:2},'III'],[1,'PV just over1000',{ps:500.0001,volume:2},'IV'],
 [1,'small V PS200 is SEP',{ps:200,volume:1},'SEP'],[1,'small V PS above200',{ps:200.0001,volume:1},'III'],
 [1,'small V PS1000 upperIII',{ps:1000,volume:.5},'III'],[1,'small V abovePS1000',{ps:1000.0001,volume:.5},'IV'],
 [2,'PV50 upper SEP',{ps:25,volume:2},'SEP'],[2,'PV above50',{ps:25.0001,volume:2},'I'],
 [2,'PV200 upper I',{ps:100,volume:2},'I'],[2,'PV above200',{ps:100.0001,volume:2},'II'],
 [2,'PV1000 upper II',{ps:500,volume:2},'II'],[2,'PV above1000',{ps:500.0001,volume:2},'III'],
 [2,'PV3000 upper III',{ps:1500,volume:2},'III'],[2,'PV above3000',{ps:1500.0001,volume:2},'IV'],
 [2,'PS4 limits categoryIII even abovePV3000',{ps:4,volume:1000},'III'],[2,'PS just above4 andPVabove3000',{ps:4.0001,volume:1000},'IV'],
 [2,'small volume PS1000 exact SEP',{ps:1000,volume:.5},'SEP'],[2,'small volume abovePS1000',{ps:1000.0001,volume:.5},'III'],
 [2,'small volume PS3000 upperIII',{ps:3000,volume:.5},'III'],[2,'small volume abovePS3000',{ps:3000.0001,volume:.5},'IV'],
 [3,'V1 PS500 exact SEP',{ps:500,volume:1},'SEP'],[3,'V1 abovePS500 remainsII',{ps:500.0001,volume:1},'II'],
 [3,'V above1 andPSabove500 isIII',{ps:500.0001,volume:1.0001},'III'],
 [3,'PS10 remainsI',{ps:10,volume:30},'I'],[3,'PS just above10 becomesII',{ps:10.0001,volume:30},'II'],
 [3,'PS500 remainsII for larger vessel',{ps:500,volume:2},'II'],[3,'PS above500 becomesIII',{ps:500.0001,volume:2},'III'],
 [4,'V10 PS1000 exact SEP',{ps:1000,volume:10},'SEP'],[4,'smallvolume abovePS1000 isI',{ps:1000.0001,volume:10},'I'],
 [4,'Vabove10 atPS1000 isII',{ps:1000,volume:10.0001},'II'],[4,'PS10 exact remainsSEP',{ps:10,volume:10000},'SEP'],
 [4,'PSabove10 andPVabove10000 isI',{ps:10.0001,volume:1000},'I'],[4,'PS500 retainsI',{ps:500,volume:1000},'I'],[4,'PSabove500 becomesII',{ps:500.0001,volume:1000},'II'],
 [5,'PV50 upperI',{ps:5,volume:10},'I'],[5,'PVabove50',{ps:5.0001,volume:10},'II'],
 [5,'PV200 upperII',{ps:20,volume:10},'II'],[5,'PVabove200',{ps:20.0001,volume:10},'III'],
 [5,'PV3000 upperIII',{ps:30,volume:100},'III'],[5,'PVabove3000',{ps:30.0001,volume:100},'IV'],
 [5,'PS32 exact categoryII atV3',{ps:32,volume:3},'II'],[5,'PSabove32 directlyIV',{ps:32.0001,volume:3},'IV'],
 [5,'V1000 exact categoryIII atPS1',{ps:1,volume:1000},'III'],[5,'Vabove1000 directlyIV',{ps:1,volume:1000.0001},'IV'],
 [6,'DN25 exact SEP',{ps:100, dn:25},'SEP'],[6,'DNabove25 ordinaryI',{ps:1,dn:25.0001},'I'],
 [6,'pDN1000 upperI',{ps:20,dn:50},'I'],[6,'pDNabove1000',{ps:20.0001,dn:50},'II'],
 [6,'DN100 exact remainsII at highpressure',{ps:100,dn:100},'II'],[6,'DNabove100 highpressureIII',{ps:100,dn:100.0001},'III'],
 [6,'DN100 exactlowpressureI',{ps:.6,dn:100},'I'],[6,'DNabove100 lowpressureII',{ps:.6,dn:100.0001},'II'],
 [6,'DN350 exactlowpressureII',{ps:1,dn:350},'II'],[6,'DNabove350 lowpressureIII',{ps:1,dn:350.0001},'III'],
 [6,'pDN3500 upperII',{ps:17.5,dn:200},'II'],[6,'pDNabove3500',{ps:17.5001,dn:200},'III'],
 [7,'DN32 exact SEP',{ps:100,dn:32},'SEP'],[7,'DNabove32 I',{ps:100,dn:32.0001},'I'],
 [7,'pDN1000 exactSEP',{ps:10,dn:100},'SEP'],[7,'pDNabove1000 I',{ps:10.0001,dn:100},'I'],
 [7,'DN100 exact remainsI',{ps:100,dn:100},'I'],[7,'DNabove100 II',{ps:100,dn:100.0001},'II'],
 [7,'pDN3500 exact I',{ps:14,dn:250},'I'],[7,'pDNabove3500 II',{ps:14.0001,dn:250},'II'],
 [7,'DN250 exact remainsII',{ps:100,dn:250},'II'],[7,'DNabove250 III',{ps:100,dn:250.0001},'III'],
 [7,'pDN5000 exact II',{ps:10,dn:500},'II'],[7,'pDNabove5000 III',{ps:10.0001,dn:500},'III'],
 [8,'DN25 exact SEP',{ps:1000,dn:25},'SEP'],[8,'DNabove25 andhighpressureIII',{ps:1000,dn:25.0001},'III'],
 [8,'pDN2000 exact SEP',{ps:2,dn:1000},'SEP'],[8,'pDNabove2000 atlowpressureI',{ps:2.0001,dn:1000},'I'],
 [8,'PS10 exact I',{ps:10,dn:300},'I'],[8,'PSabove10 II',{ps:10.0001,dn:300},'II'],
 [8,'PS500 exact II',{ps:500,dn:30},'II'],[8,'PSabove500 III',{ps:500.0001,dn:30},'III'],
 [9,'DN200 exact SEP',{ps:1000,dn:200},'SEP'],[9,'DNabove200 atPS1000 II',{ps:1000,dn:200.0001},'II'],
 [9,'PS10 exact SEP evenlargeDN',{ps:10,dn:1000},'SEP'],[9,'PSabove10 I',{ps:10.0001,dn:1000},'I'],
 [9,'pDN5000 exact SEP',{ps:20,dn:250},'SEP'],[9,'pDNabove5000 I',{ps:20.0001,dn:250},'I'],
 [9,'PS500 exact I',{ps:500,dn:1000},'I'],[9,'PSabove500 II',{ps:500.0001,dn:1000},'II']
];
for(const [diagram,label,inputs,expected] of productCoordinates)test('AFS5 source diagram'+diagram+': '+label,()=>{const result=productClassify({...ordinary,...branch[diagram],...inputs});assert.equal(result.status,'calculated',JSON.stringify(result));assert.equal(result.diagram,diagram);assert.equal(result.category,expected,JSON.stringify(result));});
test('AFS5 documented phase/extent assumptions remain required',()=>{
 assert.equal(productClassify({...ordinary,...branch[1],ps:10,volume:100,configuration:'multiple'}).status,'review');
 assert.equal(productClassify({...ordinary,...branch[1],ps:10,volume:100,fluidGroup:'unknown'}).status,'review');
 assert.equal(productClassify({...ordinary,...branch[1],ps:10,volume:100,productExclusion:'unknown'}).status,'review');
});
test('AFS5 rejects malformed numeric dimensions rather than falsely returning SEP',()=>{
 for(const volume of ['0x64','0b1100100','1e300'])assert.equal(productClassify({...ordinary,...branch[1],ps:10,volume}).status,'review');
});

// Independent fixed examples from AFS2023:11 printed pp88–94, tables2–6
// and §§29–35, including merged cells inspected in local original-PDF renders.
import {operationalClassify} from '../operational-classifier.mjs';
const opBase={operationalExclusion:'none',operationalLimitsBasis:'body',operationalLimitsReference:'BODY-LIMITS-001',fluidEvidenceReference:'SDS-REVIEW-001',phaseBasis:'PHASE-REVIEW-001',multipleFluids:'no',multipleCompartments:'no',branchPipe:'no',overheatingRisk:'no',steamOrHotWater:'no',unstableGas:'no',airOrNitrogen:'no',refrigeration:'no',waterPressurisedAir:'no',flowThroughCoil:'no',temperature:20};
const opBranches={g1:{operationalType:'vessel',opPhase:'gas',opGroup:'1a'},g2:{operationalType:'vessel',opPhase:'gas',opGroup:'2a'},l1:{operationalType:'vessel',opPhase:'liquid',opGroup:'1a'},l2:{operationalType:'vessel',opPhase:'liquid',opGroup:'2a',temperature:100},pg1:{operationalType:'piping',opPhase:'gas',opGroup:'1a'},pg2:{operationalType:'piping',opPhase:'gas',opGroup:'2a'},pl1:{operationalType:'piping',opPhase:'liquid',opGroup:'1a'},pl2:{operationalType:'piping',opPhase:'liquid',opGroup:'2a',temperature:100},cis1:{operationalType:'cistern',opGroup:'1a',p:.1},cis2:{operationalType:'cistern',opGroup:'2a',p:.1,temperature:100},vac1:{operationalType:'vacuum',opGroup:'1a',p:-.5},vac2:{operationalType:'vacuum',opGroup:'2a',p:-.5,temperature:100},boiler:{operationalType:'boiler'},water:{operationalType:'water-heater'},heated:{operationalType:'heated',opGroup:'2a',overheatingRisk:'yes',steamOrHotWater:'yes',temperature:120,heatedAssessmentReference:'HEAT-REVIEW-001'}};
const operationalCoordinates=[
 ['g1','table3 PV50 exact outside',{p:25,volume:2},'other'],['g1','table3 PVabove50 B',{p:25.0001,volume:2},'B'],
 ['g1','table3 PV200 exact B',{p:100,volume:2},'B'],['g1','table3 PVabove200 A',{p:100.0001,volume:2},'A'],
 ['g1','table3 V0.1 exact outside',{p:1000,volume:.1},'other'],['g1','small V p200 exact outside',{p:200,volume:.1001},'other'],['g1','small V pabove200 A regardless PVbelow50',{p:200.0001,volume:.1001},'A'],
 ['g2','table3 PV200 exact outside',{p:100,volume:2},'other'],['g2','table3 PVabove200 B',{p:100.0001,volume:2},'B'],
 ['g2','table3 PV1000 exact B',{p:500,volume:2},'B'],['g2','table3 PVabove1000 A',{p:500.0001,volume:2},'A'],
 ['g2','small V p1000 exact outside',{p:1000,volume:.5},'other'],['g2','small V pabove1000 A',{p:1000.0001,volume:.5},'A'],
 ['l1','table4 PV200 exact outside',{p:100,volume:2},'other'],['l1','table4 PVabove200 B',{p:100.0001,volume:2},'B'],
 ['l1','table4 PV2000 exact B',{p:20,volume:100},'B'],['l1','table4 PVabove2000 A',{p:20.0001,volume:100},'A'],
 ['l1','p10 staysB despite hugePV',{p:10,volume:100000},'B'],['l1','pabove10 hugePV A',{p:10.0001,volume:100000},'A'],
 ['l1','small V p500 exact outside',{p:500,volume:.5},'other'],['l1','small V pabove500 B',{p:500.0001,volume:.5},'B'],['l1','small V0.1 exact outside',{p:1000,volume:.1},'other'],
 ['l2','table4 V10 exact outside',{p:10000,volume:10},'other'],['l2','table4 p500 exact outside',{p:500,volume:1000},'other'],['l2','table4 PV10000 exact outside',{p:1000,volume:10},'other'],
 ['l2','table4 required cutoffs exceeded B',{p:500.0001,volume:20},'B'],['l2','table4 cold liquid exception at65',{p:10000,volume:10000,temperature:65},'other'],['l2','table4 temperatureabove65 B',{p:10000,volume:10000,temperature:65.0001},'B'],
 ['pg1','table5 DN25 exact outside',{p:1000,dn:25},'other'],['pg1','table5 DNabove25 B',{p:.6,dn:25.0001},'B'],
 ['pg1','table5 pDN1000 exact B',{p:10,dn:100},'B'],['pg1','table5 pDNabove1000 A',{p:10.0001,dn:100},'A'],['pg1','table5 DNabove100 directly A',{p:.6,dn:100.0001},'A'],
 ['pg2','table5 DN100 exact outside',{p:1000,dn:100},'other'],['pg2','table5 DN250 pDN3500 exact outside',{p:14,dn:250},'other'],['pg2','table5 DN250 pDNabove3500 B',{p:14.0001,dn:250},'B'],
 ['pg2','table5 DN250 cannot becomeA bypressure alone',{p:10000,dn:250},'B'],['pg2','table5 DN500 pDN3500 exact outside',{p:7,dn:500},'other'],['pg2','table5 DN500 pDNabove3500 B',{p:7.0001,dn:500},'B'],
 ['pg2','table5 DN500 pDN5000 exact B',{p:10,dn:500},'B'],['pg2','table5 DN500 pDNabove5000 A',{p:10.0001,dn:500},'A'],
 ['pg2','table5 T350 exact remainsB',{p:15,dn:250,temperature:350},'B'],['pg2','table5 Tabove350 promotesB toA',{p:15,dn:250,temperature:350.0001},'A'],
 ['pl1','table6 DN25 exact outside',{p:1000,dn:25},'other'],['pl1','table6 pDN2000 exact outside',{p:10,dn:200},'other'],['pl1','table6 pDNabove2000 andp10 B',{p:10,dn:200.0001},'B'],['pl1','table6 pDNabove2000 andpabove10 A',{p:10.0001,dn:200.0001},'A'],
 ['pl2','table6 DN200 exact outside',{p:1000,dn:200},'other'],['pl2','table6 p10 exact outside',{p:10,dn:10000},'other'],['pl2','table6 pDN5000 exact outside',{p:20,dn:250},'other'],['pl2','table6 cutoffs exceeded B',{p:20.0001,dn:250},'B'],['pl2','table6 T65 exact outside',{p:1000,dn:1000,temperature:65},'other'],
 ['cis1','section34 V5000 exact outside',{volume:5000},'other'],['cis1','section34 Vabove5000 B',{volume:5000.0001},'B'],['cis1','section34 V10000 exact B',{volume:10000},'B'],['cis1','section34 Vabove10000 A',{volume:10000.0001},'A'],
 ['cis2','section34 V50000 exact outside',{volume:50000},'other'],['cis2','section34 Vabove50000 B',{volume:50000.0001},'B'],['cis2','section34 neverA for2a',{volume:50000000},'B'],['cis2','section34 T65 exact outside',{volume:50000000,temperature:65},'other'],
 ['vac1','section35 V1000 exact outside',{volume:1000},'other'],['vac1','section35 Vabove1000 B',{volume:1000.0001},'B'],['vac1','section35 V5000 exact B',{volume:5000},'B'],['vac1','section35 Vabove5000 A',{volume:5000.0001},'A'],
 ['vac2','section35 V50000 exact outside',{volume:50000},'other'],['vac2','section35 Vabove50000 B',{volume:50000.0001},'B'],['vac2','section35 V500000 exact B',{volume:500000},'B'],['vac2','section35 Vabove500000 A',{volume:500000.0001},'A'],['vac2','section35 T65 exact outside',{volume:50000000,temperature:65},'other'],
 ['boiler','section29 temperature110 power100 exact outside',{temperature:110,ratedPower:100},'other'],['boiler','section29 temperature110 powerabove100 B',{temperature:110,ratedPower:100.0001},'B'],['boiler','section29 above110 power5 exact outside',{temperature:110.0001,ratedPower:5},'other'],['boiler','section29 above110 above5 A',{temperature:110.0001,ratedPower:5.0001},'A'],['boiler','section29 flowthrough25 exact outside',{temperature:200,ratedPower:1000,flowThroughCoil:'yes',coilVolume:25},'other'],['boiler','section29 flowthroughabove25 A',{temperature:200,ratedPower:1000,flowThroughCoil:'yes',coilVolume:25.0001},'A'],
 ['water','section30 V500 exact outside',{temperature:100,volume:500},'other'],['water','section30 Vabove500 B',{temperature:100,volume:500.0001},'B'],['water','section30 V2000 exact B',{temperature:100,volume:2000},'B'],['water','section30 Vabove2000 A',{temperature:100,volume:2000.0001},'A'],
 ['heated','table2 V2 exact outside',{p:100,volume:2},'other'],['heated','table2 PV50 exact outside',{p:10,volume:5},'other'],['heated','table2 PVabove50 B',{p:10.0001,volume:5},'B'],['heated','table2 PV200 exact B',{p:10,volume:20},'B'],['heated','table2 PVabove200 A',{p:10.0001,volume:20},'A'],['heated','table2 p32 exact B nearPV64',{p:32,volume:2.0001},'B'],['heated','table2 pabove32 A nearPV64',{p:32.0001,volume:2.0001},'A']
];
for(const [key,label,inputs,expected] of operationalCoordinates)test('AFS11 source '+label,()=>{const r=operationalClassify({...opBase,...opBranches[key],...inputs});assert.equal(r.status,'calculated',JSON.stringify(r));assert.equal(r.className,expected,JSON.stringify(r));});
test('AFS11 table3 exceptions do not remove tableA vessels',()=>{
 for(const extra of [{airOrNitrogen:'yes'},{refrigeration:'yes'}]){
  assert.equal(operationalClassify({...opBase,...opBranches.g2,p:2,volume:200,...extra}).className,'other');
  assert.equal(operationalClassify({...opBase,...opBranches.g2,p:10,volume:200,...extra}).className,'A');
 }
 assert.equal(operationalClassify({...opBase,...opBranches.g1,p:25.0001,volume:2,unstableGas:'yes'}).className,'A');
 assert.equal(operationalClassify({...opBase,...opBranches.g2,p:10,volume:150,waterPressurisedAir:'yes',airOrNitrogen:'yes'}).className,'other');
});
test('AFS11 rejects system cases that need another compartment or main-pipe assessment',()=>{
 assert.equal(operationalClassify({...opBase,...opBranches.g1,p:10,volume:100,multipleCompartments:'yes'}).status,'review');
 assert.equal(operationalClassify({...opBase,...opBranches.pg1,p:10,dn:100,branchPipe:'yes'}).status,'review');
 assert.equal(operationalClassify({...opBase,...opBranches.g1,p:10,volume:100,multipleFluids:'yes'}).status,'review');
});
