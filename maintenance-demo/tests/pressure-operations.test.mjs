import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOperations,operationFindings,initPressureOperations} from '../pressure-operations.mjs';

const NOW='2026-11-02';
const profile={assetId:'vessel-1',operationalScope:'in',operationalClass:'A'};
const base={id:'record-1',assetId:'vessel-1',date:'2026-11-01',by:'Responsible engineer',reference:'Controlled routine R2',evidenceId:'doc-1',notes:'Assessment recorded against retained evidence.',result:'recorded'};
const life={...base,kind:'lifetime',component:'Shell',mechanism:'Fatigue',limit:10000,consumed:9000,unit:'cycles'};
function workspace(records=[]){return {assets:[{id:'vessel-1'},{id:'vessel-2'}],pressure:{profiles:[{...profile}],evidence:[{id:'doc-1',assetId:'vessel-1'},{id:'doc-2',assetId:'vessel-2'}],operations:structuredClone(records),controls:[]}};}
const findings=(db,p=profile)=>operationFindings(p,db.pressure,NOW).join('\n');

test('legacy workspaces without an operational extension remain readable without mutation',()=>{
  const legacy={assets:[{id:'vessel-1'}]};const before=structuredClone(legacy);
  assert.equal(validateOperations(legacy,NOW),true);
  assert.deepEqual(legacy,before);
});

test('a named supervision check can use its approved risk-based interval',()=>{
  const db=workspace([{...base,kind:'supervision',result:'satisfactory',due:'2027-12-01'}]);
  assert.equal(validateOperations(db,NOW),true);
  assert.doesNotMatch(findings(db),/Ongoing supervision.*no recorded|Ongoing supervision overdue/);
});

test('evidence must belong to the same asset, with no orphan or duplicate operational IDs',()=>{
  const db=workspace([life]);assert.equal(validateOperations(db,NOW),true);
  db.pressure.operations[0].evidenceId='doc-2';assert.equal(validateOperations(db,NOW),false);
  db.pressure.operations[0].evidenceId='missing-document';assert.equal(validateOperations(db,NOW),false);
  db.pressure.operations[0]=structuredClone(life);db.pressure.operations.push(structuredClone(life));
  assert.equal(validateOperations(db,NOW),false);
  db.pressure.operations=[{...life,assetId:'missing-vessel'}];assert.equal(validateOperations(db,NOW),false);
});

test('records reject future or impossible dates and cannot claim an evaluation happened later',()=>{
  for(const date of ['2026-11-03','2026-02-30','2026-13-01','not-a-date'])assert.equal(validateOperations(workspace([{...life,date}]),NOW),false,date);
});

test('routine evaluation is due within one year, including leap-year anniversaries',()=>{
  const review={...base,kind:'routine-review',result:'satisfactory',due:'2027-11-01'};
  assert.equal(validateOperations(workspace([review]),NOW),true);
  assert.equal(validateOperations(workspace([{...review,due:'2027-11-02'}]),NOW),false);
  const leap={...review,date:'2024-02-29',due:'2025-02-28'};
  assert.equal(validateOperations(workspace([leap]),'2024-03-01'),true);
  assert.equal(validateOperations(workspace([{...leap,due:'2025-03-01'}]),'2024-03-01'),false);
});

test('overdue annual evaluation is distinct from current ongoing supervision',()=>{
  const db=workspace([{...base,id:'routine',kind:'routine-review',date:'2025-10-31',due:'2026-10-31',result:'satisfactory'},{...base,id:'check',kind:'supervision',due:'2026-11-10',result:'satisfactory'}]);
  assert.match(findings(db),/routine evaluation.*overdue/i);
  assert.doesNotMatch(findings(db),/Ongoing supervision overdue/);
});

test('life limits require actual finite measurements and a positive documented limit',()=>{
  for(const consumed of [-1,NaN,Infinity,null,true,'','   ',{},[]])assert.equal(validateOperations(workspace([{...life,consumed}]),NOW),false,String(consumed));
  for(const limit of [0,-1,Infinity,null,''])assert.equal(validateOperations(workspace([{...life,limit}]),NOW),false,String(limit));
  assert.equal(validateOperations(workspace([{...life,consumed:0}]),NOW),true);
});

test('exhausted life requires a stop and revision assessment despite an unrelated accepted control',()=>{
  const db=workspace([{...life,consumed:10000}]);
  db.pressure.controls.push({assetId:'vessel-1',kind:'periodic',result:'accepted',performedOn:NOW});
  assert.match(findings(db),/Life limit reached for Shell.*stop and revision-control assessment required/);
  assert.equal(validateOperations(db,NOW),true,'An adverse factual record must remain recordable.');
});

test('latest measurements are assessed separately for each component and damage mechanism',()=>{
  const db=workspace([{...life,id:'shell-current',consumed:10000},{...life,id:'nozzle',component:'Nozzle',consumed:2000},{...life,id:'shell-older',date:'2026-10-01',consumed:5000},{...life,id:'other-vessel',assetId:'vessel-2',component:'Other shell',consumed:10000}]);
  assert.match(findings(db),/Life limit reached for Shell/);
  assert.doesNotMatch(findings(db),/Life limit reached for Nozzle|Other shell/);
});

test('an adverse supervision outcome remains visible after another workflow or control is completed',()=>{
  const db=workspace([{...base,id:'check',kind:'supervision',result:'defect',due:'2026-11-10'},{...base,id:'routine',kind:'routine-review',result:'satisfactory',due:'2027-11-01'}]);
  db.pressure.controls.push({assetId:'vessel-1',kind:'periodic',result:'accepted',performedOn:NOW});
  assert.match(findings(db),/ongoing-supervision record requires follow-up: defect/);
});

test('a change review cannot be closed by an old, rejected, unrelated or other-asset control',()=>{
  const db=workspace([{...base,kind:'change',reason:'damage',revisionDecision:'required',result:'review'}]);
  for(const control of [{assetId:'vessel-1',kind:'revision',result:'accepted',performedOn:'2026-10-30'},{assetId:'vessel-1',kind:'revision',result:'rejected',performedOn:NOW},{assetId:'vessel-1',kind:'periodic',result:'accepted',performedOn:NOW},{assetId:'vessel-2',kind:'revision',result:'accepted',performedOn:NOW}])db.pressure.controls.push(control);
  assert.match(findings(db),/Revision-control assessment remains open/);
  db.pressure.controls.push({assetId:'vessel-1',kind:'revision',result:'accepted',performedOn:NOW});
  assert.doesNotMatch(findings(db),/Revision-control assessment remains open/);
});

test('recording an exhausted life sets a persistent stop which later readings do not release',()=>{
  const db=workspace();let form;
  const previous=Object.fromEntries(['window','document','FormData','alert'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const submitted={date:'2026-11-01',by:'Responsible engineer',reference:'Life assessment R1',evidenceId:'doc-1',notes:'Fatigue limit reached.',component:'Shell',mechanism:'Fatigue',limit:'10000',consumed:'10000',unit:'cycles'};
  try{
    globalThis.window={};globalThis.document={querySelector:()=>form={fields:submitted}};
    globalThis.FormData=class{constructor(target){this.fields=target.fields;}[Symbol.iterator](){return Object.entries(this.fields)[Symbol.iterator]();}};
    globalThis.alert=message=>assert.fail(message);
    const noop=()=>'';
    initPressureOperations({getDB:()=>db,e:String,field:noop,select:noop,area:noop,modal:noop,form:noop,card:noop,btn:noop,badge:noop,uid:()=>`event-${db.pressure.operations.length}`,today:()=>NOW,asset:id=>db.assets.find(a=>a.id===id),commit:(_aid,_action,_by,mutation)=>mutation(db.pressure)});
    window.pressureOperation('vessel-1','lifetime');form.onsubmit({preventDefault(){},target:form});
    assert.equal(db.pressure.profiles[0].stopped,true);
    assert.match(db.pressure.profiles[0].stopReason,/Life limit reached: Shell/);
    assert.equal(db.pressure.operations[0].result,'defect');
    submitted.consumed='9000';submitted.notes='A later reading is not an authorised release.';
    window.pressureOperation('vessel-1','lifetime');form.onsubmit({preventDefault(){},target:form});
    assert.equal(db.pressure.profiles[0].stopped,true,'Only a separate authorised release can remove the stop.');
    assert.equal(db.pressure.operations.length,2,'The original adverse record is retained.');
  }finally{
    for(const [key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  }
});
