const {test}=require('node:test'),assert=require('node:assert/strict');
const policy=()=>import('../../johansson-town/src/desktop/life-state.js'),people=()=>import('../../johansson-town/src/people/cast.js');
test('every playable character has a canonical home without reviving removed vacancies',async()=>{
 const {playableRoster}=await policy(),{CAST}=await people(),roster=playableRoster(['Cold-storage kid','Fujita','Johansson']);
 // The consolidated cast (people/cast.js, 26 since 19 October 2026): everyone in it has a home that stands, nobody else is playable.
 assert.equal(new Set(roster.map(p=>p.name)).size,roster.length);assert.equal(roster.length,CAST.length);assert.deepEqual(roster.map(p=>p.name).sort(),CAST.map(p=>p.name).sort());
 for(const p of roster){assert.ok(p.home.id);assert.ok(p.home.siteId);assert.ok(p.home.address);}
 assert.equal(roster.find(p=>p.name==='Johansson').home.id,'kitano-1');assert.equal(roster.find(p=>p.name==='Thuan').home.id,'kitano-1');
 assert.equal(roster.some(p=>p.name==='Cold-storage kid'),false,'Unassigned background figures must not displace established households');
});
test('bedtime spawning honours individual night shifts and children’s schedules',async()=>{
 const {shouldSleep}=await policy();assert.equal(shouldSleep('Johansson',60),true);assert.equal(shouldSleep('Mai',60),true);
 // Chin is the ferry's motorman since the consolidation (signed on 06:05, off 22:20): a day shift, no longer a night worker.
 assert.equal(shouldSleep('Chin',60),true);assert.equal(shouldSleep('Chin',600),false);
 assert.equal(shouldSleep('Officer Mori',60),false);assert.equal(shouldSleep('Thao',60),false);
 assert.equal(shouldSleep('Officer Mori',600),true,'The night patrol sleeps in the morning');
 assert.equal(shouldSleep('Kōji',270),false,'The fish auction starts before dawn');assert.equal(shouldSleep('Mr Nakandakari',330),false,'The chief is up for the first sailing');
});
test('a 0.2.9 save follows the consolidated cast: old names go on as the live person, the retired fall back',async()=>{
 const {playableRoster,restoreLife}=await policy(),roster=playableRoster();
 const old={active:'Mr Nakandakari',people:{'Mr Nakandakari':{checkpoint:{x:12,z:-7,yaw:1.5,atHome:false}},Thuan:{checkpoint:{x:3,z:4,yaw:0,atHome:true}},Barfly:{checkpoint:{x:1,z:1,yaw:0}}},tempers:{'Mr Nakandakari\u0000Tetsuo':{at:700,count:2,cooldown:0},'Barfly\u0000Tetsuo':{at:700,count:3,cooldown:0}}};
 const life=restoreLife(JSON.parse(JSON.stringify(old)),roster);
 assert.equal(life.active,'Mac');assert.deepEqual(life.people.Mac.checkpoint,{x:12,z:-7,yaw:1.5,atHome:false});assert.equal(life.people.Thuan.checkpoint.atHome,true);
 assert.equal('Barfly' in life.people,false);assert.deepEqual(Object.keys(life.tempers),[]);
 assert.equal(restoreLife({active:'Barfly'},roster).active,'Johansson','a retired resident cannot be the player');
 assert.deepEqual(restoreLife(JSON.parse(JSON.stringify(life)),roster),life,'a second pass changes nothing');
});
test('repeated insults end peacefully, with warnings, decay and cooldown',async()=>{
 const {playableRoster,restoreLife,insultResident,apologiseTo}=await policy(),life=restoreLife(null,playableRoster());
 assert.equal(insultResident(life,'Tetsuo',720).kind,'warning');assert.equal(insultResident(life,'Chin',721).count,1);
 assert.equal(insultResident(life,'Tetsuo',722).kind,'warning');assert.equal(insultResident(life,'Tetsuo',723).count,3);
 assert.equal(insultResident(life,'Tetsuo',724).kind,'leave');assert.equal(insultResident(life,'Tetsuo',725).kind,'leave');
 apologiseTo(life,'Chin');assert.equal(insultResident(life,'Chin',726).count,1);assert.equal(insultResident(life,'Chin',750).count,1);
 const restored=restoreLife(JSON.parse(JSON.stringify(life)),playableRoster());assert.equal(insultResident(restored,'Tetsuo',740).kind,'leave');
});
test('quarrels preserve family alliances and do not turn children into combat opponents',async()=>{
 const {playableRoster,restoreLife,insultResident}=await policy(),life=restoreLife(null,playableRoster());
 for(let i=0;i<4;i++)var result=insultResident(life,'Thuan',720+i);assert.equal(result.kind,'leave');
});
test('character switching restores independent positions, saves identity and uses an owned bed at night',async()=>{
 const {createLinuxLife}=await import('../../johansson-town/src/desktop/life.js');let at={x:1,z:2,yaw:.5},minutes=720,identity='',saved=0;
 const state={},opts={state,names:[],getMinutes:()=>minutes,getPose:()=>at,getEntityPose:()=>({x:9,z:8,yaw:0}),applyIdentity:name=>{identity=name;},spawnHome:async person=>{at={x:30,z:40,yaw:0,atHome:true};return {position:[0,.5,0],stand:[1,0,0],axis:'z',owner:person.name};},spawnOutside:point=>{at=point.homeBedside?{x:30,z:40,yaw:0,atHome:true}:point;},menu(){},close(){},save(){saved++;},say(){}};
 const api=createLinuxLife(opts);await api.select('Thuan');assert.equal(identity,'Thuan');assert.equal(at.x,9);at={x:14,z:13,yaw:1};await api.select('Johansson');assert.equal(at.x,1);await api.select('Thuan');assert.equal(at.x,14);
 minutes=60;await api.select('Nhung');assert.equal(api.inBed,true);assert.equal(api.current().home.id,state.desktopLife.people.Nhung.home);assert.equal(api.wake(),true);assert.equal(api.inBed,false);assert.ok(saved>3);
 const reloaded=createLinuxLife({...opts,state:JSON.parse(JSON.stringify(state))});assert.equal(reloaded.active,'Nhung');await reloaded.start();assert.equal(reloaded.inBed,true);
});

test('old bench checkpoints recover on startup and character switching without moving other residents',async()=>{
 const {createLinuxLife}=await import('../../johansson-town/src/desktop/life.js');
 const yaw=Math.atan2(14.05,-5.2),bench={x:6.6-.08*Math.sin(yaw),z:-32-.08*Math.cos(yaw),yaw,atHome:false};
 const ordinary={x:14,z:13,yaw:1,atHome:false},home={...bench,atHome:true};
 const state={desktopLife:{version:2,active:'Johansson',people:{Johansson:{checkpoint:{...bench}},Thuan:{checkpoint:{...bench}},Chin:{checkpoint:{...ordinary}},Nhung:{checkpoint:{...home}}}}};
 let at={x:0,z:0,yaw:0},homes=0;
 const api=createLinuxLife({state,names:[],getMinutes:()=>720,getPose:()=>at,getEntityPose:()=>null,applyIdentity(){},
  spawnOutside:point=>{at=point;},spawnHome:async()=>{homes++;return {position:[0,0,0],stand:[1,0,0],axis:'z'};},menu(){},close(){},save(){},say(){}});
 const safe={...bench,x:19.8,z:-40,yaw:-1.03};
 assert.equal(await api.start(),true);assert.deepEqual(at,safe);assert.deepEqual(state.desktopLife.people.Johansson.checkpoint,safe);
 await api.select('Thuan');assert.deepEqual(at,safe);assert.deepEqual(state.desktopLife.people.Thuan.checkpoint,safe);
 await api.select('Chin');assert.deepEqual(at,ordinary);assert.equal(homes,0);
 assert.deepEqual(state.desktopLife.people.Nhung.checkpoint,home,'A home checkpoint is not an outdoor bench position');
});
