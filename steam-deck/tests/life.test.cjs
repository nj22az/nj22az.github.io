const {test}=require('node:test'),assert=require('node:assert/strict');
const policy=()=>import('../../johansson-town/src/desktop/life-state.js');
test('every playable character has a canonical home without reviving removed vacancies',async()=>{
 const {playableRoster}=await policy(),roster=playableRoster(['Cold-storage kid','Fujita','Johansson']);
 assert.equal(new Set(roster.map(p=>p.name)).size,roster.length);assert.ok(roster.length>=30);
 for(const p of roster){assert.ok(p.home.id);assert.ok(p.home.siteId);assert.ok(p.home.address);}
 assert.equal(roster.find(p=>p.name==='Johansson').home.id,'kitano-1');assert.equal(roster.find(p=>p.name==='Thuan').home.id,'kitano-1');
 assert.equal(roster.some(p=>p.name==='Cold-storage kid'),false,'Unassigned background figures must not displace established households');
});
test('bedtime spawning honours individual night shifts and children’s schedules',async()=>{
 const {shouldSleep}=await policy();assert.equal(shouldSleep('Johansson',60),true);assert.equal(shouldSleep('Mai',60),true);
 assert.equal(shouldSleep('Officer Mori',60),false);assert.equal(shouldSleep('Chin',60),false);assert.equal(shouldSleep('Thao',60),false);assert.equal(shouldSleep('Barfly',60),false);
 assert.equal(shouldSleep('Officer Mori',600),true);assert.equal(shouldSleep('Chin',600),true);assert.equal(shouldSleep('Barfly',360),true);
 assert.equal(shouldSleep('Kōji',270),false,'The fish auction starts before dawn');assert.equal(shouldSleep('Mr Nakandakari',330),false,'The chief is up for the first sailing');
});
test('fights require four deliberate insults to the same person, with warnings, decay and cooldown',async()=>{
 const {playableRoster,restoreLife,insultResident,apologiseTo}=await policy(),life=restoreLife(null,playableRoster());
 assert.equal(insultResident(life,'Tetsuo',720).kind,'warning');assert.equal(insultResident(life,'Chin',721).count,1);
 assert.equal(insultResident(life,'Tetsuo',722).kind,'warning');assert.equal(insultResident(life,'Tetsuo',723).count,3);
 assert.equal(insultResident(life,'Tetsuo',724).kind,'fight');assert.equal(insultResident(life,'Tetsuo',725).kind,'leave');
 apologiseTo(life,'Chin');assert.equal(insultResident(life,'Chin',726).count,1);assert.equal(insultResident(life,'Chin',750).count,1);
 const restored=restoreLife(JSON.parse(JSON.stringify(life)),playableRoster());assert.equal(insultResident(restored,'Tetsuo',740).kind,'leave');
});
test('quarrels preserve family alliances and do not turn children into combat opponents',async()=>{
 const {playableRoster,restoreLife,insultResident,canQuarrel}=await policy(),life=restoreLife(null,playableRoster());
 assert.equal(canQuarrel('Johansson','Thuan'),false);assert.equal(canQuarrel('Tetsuo','Mai'),false);assert.equal(canQuarrel('Chin','Officer Mori'),true);
 for(let i=0;i<4;i++)var result=insultResident(life,'Thuan',720+i);assert.equal(result.kind,'leave');
});
test('character switching restores independent positions, saves identity and uses an owned bed at night',async()=>{
 const {createLinuxLife}=await import('../../johansson-town/src/desktop/life.js');let at={x:1,z:2,yaw:.5},minutes=720,identity='',saved=0;
 const state={},opts={state,names:[],getMinutes:()=>minutes,getPose:()=>at,getEntityPose:()=>({x:9,z:8,yaw:0}),applyIdentity:name=>{identity=name;},spawnHome:async person=>{at={x:30,z:40,yaw:0,atHome:true};return {position:[0,.5,0],stand:[1,0,0],axis:'z',owner:person.name};},spawnOutside:point=>{at=point.homeBedside?{x:30,z:40,yaw:0,atHome:true}:point;},startQuarrel(){},menu(){},close(){},save(){saved++;},say(){}};
 const api=createLinuxLife(opts);await api.select('Thuan');assert.equal(identity,'Thuan');assert.equal(at.x,9);at={x:14,z:13,yaw:1};await api.select('Johansson');assert.equal(at.x,1);await api.select('Thuan');assert.equal(at.x,14);
 minutes=60;await api.select('Nhung');assert.equal(api.inBed,true);assert.equal(api.current().home.id,state.desktopLife.people.Nhung.home);assert.equal(api.wake(),true);assert.equal(api.inBed,false);assert.ok(saved>3);
 const reloaded=createLinuxLife({...opts,state:JSON.parse(JSON.stringify(state))});assert.equal(reloaded.active,'Nhung');await reloaded.start();assert.equal(reloaded.inBed,true);
});
test('a provoked fight shares the existing simulation and never grants festival progress',async()=>{
 const {createDisputeBout,stepFestivalBout}=await import('../../johansson-town/src/progression/harbour-festival.js');
 const bout=createDisputeBout('Officer Mori','Tetsuo');for(let i=0;i<5000&&bout.result===null;i++)stepFestivalBout(bout,{x:1,punch:true,kick:true});assert.notEqual(bout.result,null);assert.equal(bout.stage,'personal-quarrel');assert.throws(()=>createDisputeBout('Tetsuo','Tetsuo'));
});
