import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {FERRY_MANNING,FERRY_CAR_PLACES} from '../src/world/ferry-ship.js';
import {FERRY_CREW,crewFor,crewOnDuty,FERRY_PEOPLE} from '../src/people/ferry-crew.js';
import {createFerryCrewAboard,CREW_POSTS} from '../src/people/ferry-crew-aboard.js';
import {crewRoute,crewWalkSegment,crewBlocked,crewBlockedBetween,crewObstacleAt,crewFloorsAt,CREW_RADIUS} from '../src/people/ferry-crew-walk.js';
import {FERRY_CLIMBS} from '../src/world/ferry-walk.js';
import {ferryServiceFixture} from './ferry-service-fixture.mjs';
import {QUICK_CROSSING} from '../src/world/ferry-quick-crossing.js';

function fixture(){
 let bound=null;
 const run={ferry:new THREE.Group(),phase:'waiting',operation:null,bindCrewController(c){bound=c;}};
 const crew=createFerryCrewAboard({run,characters:{attach(){return null;}},register(){},onAction(){}});
 crew.update(.1,600);assert.equal(bound,crew);return {run,crew};
}
const task=(id,post,station,seconds=3,target)=>({id,post,station,seconds,action:'Work at '+station,...(target?{target}: {})});

test('eight roles match the manning plan, with separate deck and bosun identities and no invented households',()=>{
 assert.deepEqual(FERRY_CREW.map(c=>c.post),FERRY_MANNING.map(c=>c.post));
 for(const m of [600,7*1440+600])assert.equal(new Set(crewOnDuty(m).map(c=>c.name)).size,8);
 assert.equal(crewFor('bosun',600),'Ms Uezu');assert.equal(crewFor('bosun',7*1440+600),'Kōji');
 assert.equal(crewFor('deck'),'Deck hand');
 for(const c of FERRY_CREW.filter(c=>c.jobRole))assert.ok(!FERRY_PEOPLE.includes(c.name));
 assert.match(FERRY_CREW.find(c=>c.name==='Mr Higa Jr').lives,/flat 1/);
 assert.ok(FERRY_CREW.every(c=>!c.licence.includes('enough for')));
});

test('real doors, stairs and the visible forecastle ladder connect the work stations',()=>{
 for(const [from,to] of [['port-wing','ramp'],['gangway','saloon'],['engine-room','car-deck'],['car-deck','mess'],['mess','galley'],['car-deck','purser'],['gangway','bow'],['bow','saloon']]){
  const route=crewRoute(CREW_POSTS[from].pos,CREW_POSTS[to].pos);assert.ok(route.ok,from+' to '+to+': '+route.reason);
  for(let i=1;i<route.path.length;i++){
   const a=route.path[i-1].pos,b=route.path[i].pos;
   if(route.path[i].climb){
    assert.ok(FERRY_CLIMBS.some(c=>c.id===route.path[i].climb));
    const n=Math.ceil(new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b))/.035);
    for(let k=0;k<=n;k++)assert.equal(crewBlocked(a.map((v,j)=>v+(b[j]-v)*k/n)),false,'ladder clears its solid house');
   }else assert.ok(crewWalkSegment(a,b),from+' to '+to+' has a continuous supported segment');
  }
  if(from==='bow'||to==='bow')assert.ok(route.path.some(p=>p.climb),'a deck change uses the physical ladder');
 }
});

test('task arrival and completed work are separate gates, and phase changes cannot teleport the crew',()=>{
 const {run,crew}=fixture(),jobs=[task('bow','deck','bow',5),task('ramp','mate','ramp',4),task('aft','bosun','stern',3)];
 run.operation={id:'test-voyage',stage:'raising-ramp',tasks:jobs};
 const origins=new Map([...crew.bodies].map(([name,b])=>[name,b.g.position.clone()]));
 crew.update(.1,600);
 for(const job of jobs){assert.equal(crew.taskAtStation(job.id),false);assert.equal(crew.taskReady(job.id),false);}
 for(const [name,b] of crew.bodies)assert.ok(b.g.position.distanceTo(origins.get(name))<=.119,'first movement is bounded: '+name);
 let sawClimb=false,sawWorking=false;
 for(let frame=0;frame<1600&&!jobs.every(t=>crew.taskReady(t.id));frame++){
  const before=new Map([...crew.bodies].map(([name,b])=>[name,b.g.position.clone()]));crew.update(.1,600);
  for(const [name,b] of crew.bodies){assert.ok(b.g.position.distanceTo(before.get(name))<=.119,'no teleport: '+name);assert.equal(crewBlocked(b.g.position.toArray()),false,name+' outside the solid model');sawClimb||=!!b.g.userData.climbing;}
  for(const t of jobs)if(crew.taskAtStation(t.id)&&!crew.taskReady(t.id))sawWorking=true;
 }
 assert.ok(sawClimb);assert.ok(sawWorking);
 for(const t of jobs)assert.equal(crew.taskReady(t.id),true,JSON.stringify(crew.snapshot()));
 const deck=crew.bodies.get('Deck hand'),before=deck.g.position.clone();
 run.operation={id:'test-voyage',stage:'opening-access',tasks:[task('gangway','deck','gangway')]};crew.update(.1,600);
 assert.ok(deck.g.position.distanceTo(before)<=.119);assert.equal(crew.taskReady('gangway'),false);
 let climbingDown=false;
 for(let i=0;i<1000&&!crew.taskReady('gangway');i++){
  const y=deck.g.position.y;crew.update(.1,600);
  if(deck.g.userData.climbing&&deck.g.position.y<y){climbingDown=true;assert.ok(Math.cos(deck.g.rotation.y+Math.PI)>.99,'faces the ladder while descending');}
 }
 assert.ok(climbingDown);assert.equal(crew.taskReady('gangway'),true);
});

test('the first line hand waits at station without working until the real counterpart arrives',()=>{
 const s=ferryServiceFixture(),q=QUICK_CROSSING.town;
 s.player.position.set(q.stand[0],q.ground,q.stand[1]);
 assert.equal(s.run.beginCrossing('airport'),true);
 s.until(()=>s.run.operation.stage==='letting-go');
 const line=s.run.operation.lines[0],jobs=s.run.operation.tasks;
 const ship=jobs.find(t=>t.post==='deck'),shore=jobs.find(t=>t.post==='shore');
 assert.ok(ship&&shore);
 // The AB has been prepositioned on the forecastle; Fujita still has to walk
 // from his actual shed. Waiting longer than the work duration must not count.
 s.tick(ship.seconds+.5);
 assert.equal(s.crew.taskAtStation(ship.id),true,'arrival can be acknowledged without a work permit');
 assert.equal(s.crew.taskAtStation(shore.id),false,'the actual shore hand is still approaching');
 assert.equal(s.run.operation.tasks.find(t=>t.id===ship.id).acknowledged,true);
 assert.equal(s.crew.taskReady(ship.id),false,'the AB cannot finish a handoff alone');
 assert.equal(s.crew.snapshot().find(c=>c.task===ship.id).progress,0);
 assert.equal(s.crew.bodies.get('Deck hand').g.userData.socialPose,'Idle','no handling gesture before the counterpart arrives');
 assert.equal(s.run.operation.lines[0].status,'fast');
 s.until(()=>s.run.operation.tasks.every(t=>t.acknowledged));
 assert.equal(s.crew.taskAtStation(ship.id),true);assert.equal(s.crew.taskAtStation(shore.id),true);
 assert.equal(s.crew.taskReady(ship.id),false);assert.equal(s.crew.taskReady(shore.id),false);
 s.tick(.1);
 assert.equal(s.crew.bodies.get('Deck hand').g.userData.socialPose,'Interact');
 assert.equal(s.shed.fujita.userData.socialPose,'Interact');
 assert.ok(s.crew.snapshot().filter(c=>c.task===ship.id||c.task===shore.id).every(c=>c.progress>0&&c.progress<1));
 s.tick(ship.seconds-.5);
 assert.equal(s.crew.taskReady(ship.id),false,'the work duration begins at the joint acknowledgement');
 assert.equal(s.crew.taskReady(shore.id),false);
 s.until(()=>s.crew.taskReady(ship.id)&&s.crew.taskReady(shore.id));
 assert.equal(s.run.operation.lines.find(l=>l.id===line.id).status,'coiled');
});

test('a solid or occupied work station cannot be acknowledged or reported complete',()=>{
 const {run,crew}=fixture();
 run.operation={id:'blocked-voyage',stage:'preparing',tasks:[task('bad','deck','bow',1,{x:3,y:1.1,z:15})]};
 for(let i=0;i<20;i++)crew.update(.1,600);
 assert.equal(crew.taskAtStation('bad'),false);assert.equal(crew.taskReady('bad'),false);
 assert.ok(crew.snapshot().find(c=>c.post==='deck').blocked);
 const vehicle={id:'van',x:0,z:1.25,w:1.95,d:4.9,y:1.1,height:2.4};
 assert.equal(crewRoute(CREW_POSTS.gangway.pos,CREW_POSTS['car-deck'].pos,{obstacles:[vehicle]}).ok,false);
});

test('a loaded car deck keeps physical pedestrian access to the passenger stair',()=>{
 const obstacles=FERRY_CAR_PLACES.map((p,i)=>({id:'car-'+i,x:p.x,z:p.z-17.25,w:1.62,d:3.9,y:1.1,height:1.8}));
 const start=[0,1.1,5],goal=CREW_POSTS.purser.pos,route=crewRoute(start,goal,{obstacles});
 assert.ok(route.ok,route.reason);
 for(let i=1;i<route.path.length;i++)assert.ok(crewWalkSegment(route.path[i-1].pos,route.path[i].pos,CREW_RADIUS,obstacles));
 assert.ok(route.path.every(p=>!crewObstacleAt(p.pos,obstacles)));
 const at=CREW_POSTS.galley.pos;assert.ok(crewFloorsAt(at[0],at[2]).some(f=>f.floor==='galley'&&Math.abs(f.y-at[1])<.01));
});

test('the passenger stair-head rail cannot be cut between coarse route samples',()=>{
 const a=[2.55,5.5,-10.05],b=[2.4,5.5,-9.9];
 assert.equal(crewBlocked(a),false);assert.equal(crewBlocked(b),false);
 assert.equal(crewBlockedBetween(a,b),true,'the diagonal crosses the rail’s expanded corner');
 assert.equal(crewWalkSegment(a,b),false);
 const {run,crew}=fixture();
 run.operation={id:'out-and-back',stage:'raising-ramp',tasks:[task('out','mate','ramp',1)]};
 for(let i=0;i<1000&&!crew.taskReady('out');i++)crew.update(.1,600);
 assert.equal(crew.taskReady('out'),true,JSON.stringify(crew.snapshot()));
 run.operation={id:'return',stage:'preparing',tasks:[task('back','mate','port-wing',1)]};
 for(let i=0;i<1000&&!crew.taskReady('back');i++)crew.update(.1,600);
 assert.equal(crew.taskReady('back'),true,JSON.stringify(crew.snapshot()));
});
