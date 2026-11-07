import test from 'node:test';
import assert from 'node:assert/strict';
import {MOMENTS,MOMENT_KINDS,momentsFor,pickMoment,arrange,aim,fitGroup,applyMoment} from '../scene-moments.mjs';
import {KNOWN_POSES,KNOWN_EXPRESSIONS,POSES} from '../scene-catalogue.mjs';
import {emptyScene,addCharacter,normalizeScene} from '../scene-model.mjs';
import {turnToward,wrapTurn} from '../scene-controls.mjs';

test('every moment uses only poses the pose picker offers and faces World can paint',()=>{
 assert.equal(new Set(MOMENTS.map(m=>m.id)).size,MOMENTS.length);
 for(const m of MOMENTS){
  assert.ok(MOMENT_KINDS[m.kind],m.id+' kind');assert.ok(m.caption&&m.title,m.id+' caption');assert.ok(m.react.length>=1,m.id);
  for(const role of [m.lead,...m.react]){
   assert.ok(KNOWN_POSES.has(role.pose)&&POSES.includes(role.pose),`${m.id}: ${role.pose} is a pose that stands on its own`);
   assert.ok(KNOWN_EXPRESSIONS.has(role.expression),`${m.id}: ${role.expression}`);
   assert.ok(!role.speech||role.speech.length<=120);
  }
  assert.ok(m.caption.length<=120);
 }
});
test('the cast size decides which moments fit, and an empty stage has none',()=>{
 assert.deepEqual(momentsFor(0),[]);assert.equal(pickMoment(0),null);
 assert.ok(momentsFor(1).every(m=>m.min===1));assert.equal(momentsFor(6).length,MOMENTS.length);
 assert.ok(momentsFor(1).length<momentsFor(2).length,'some moments need a partner');
});
test('a shuffle never repeats the moment just played',()=>{
 for(let i=0;i<200;i++){const r=(i%17)/17,last=pickMoment(3,{rng:()=>r}).id;assert.notEqual(pickMoment(3,{last,rng:()=>r}).id,last);}
 assert.equal(pickMoment(2,{rng:()=>.999999}).id,momentsFor(2).at(-1).id,'rng near 1 stays in range');
});
test('the group stands across the picture, the lead faces the group, nobody shares a spot',()=>{
 for(const camera of [null,{x:0,z:6},{x:5,z:-3}])for(const layout of ['face','stage'])for(let n=1;n<=6;n++){
  const spots=arrange(n,layout,camera),turns=aim(spots,layout,camera);assert.equal(spots.length,n);assert.equal(turns.length,n);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)assert.ok(Math.hypot(spots[i].x-spots[j].x,spots[i].z-spots[j].z)>.5,`${layout} ${n}: ${i}/${j} too close`);
  for(const t of turns)assert.ok(t>-180&&t<=180);
  if(camera&&layout==='face'&&n===2){
   // Seen from the camera the two stand side by side: the line between them is square to the line of sight.
   const sx=spots[1].x-spots[0].x,sz=spots[1].z-spots[0].z,mx=(spots[0].x+spots[1].x)/2,mz=(spots[0].z+spots[1].z)/2,vx=camera.x-mx,vz=camera.z-mz;
   assert.ok(Math.abs(sx*vx+sz*vz)/(Math.hypot(sx,sz)*Math.hypot(vx,vz))<.2,'side by side as seen from the camera');
  }
 }
 const two=arrange(2,'face');assert.deepEqual(aim(two,'face'),[turnToward(two[0],two[1]),turnToward(two[1],two[0])],'without a camera they look straight at each other');
 const camera={x:0,z:6},spots=arrange(2,'face',camera),[,t]=aim(spots,'face',camera),direct=turnToward(spots[1],spots[0]),toCam=turnToward(spots[1],camera);
 assert.ok(Math.abs(wrapTurn(t-direct))>0&&Math.abs(wrapTurn(t-direct))<Math.abs(wrapTurn(toCam-direct)),'a three-quarter view: part of the way to the camera');
});
test('the whole group shifts together onto open floor, by the smallest step',()=>{
 const spots=arrange(3,'face');
 assert.deepEqual(fitGroup(spots,()=>true),{dx:0,dz:0});
 const shelf=(x,z)=>!(x<0&&x>-1.5&&Math.abs(z)<.6);const shift=fitGroup(spots,shelf);
 assert.ok(shift&&Math.hypot(shift.dx,shift.dz)<=1.5);assert.ok(spots.every(p=>shelf(p.x+shift.dx,p.z+shift.dz)));
 assert.equal(fitGroup(spots,()=>false),null);
 const s=emptyScene();for(const n of ['A','B','C'])addCharacter(s,{},n);applyMoment(s,MOMENTS[0],{free:shelf});
 assert.ok(s.actors.every(a=>shelf(a.x,a.z)),'applyMoment uses the shift');
});
test('applying a moment stages the cast, keeps who they are, and survives a save',()=>{
 const s=emptyScene();const [a,b,c]=['Thuận','Kenji','Aiko'].map(n=>addCharacter(s,{name:n,hair:n},n));a.size=1.2;a.seat='seat-1';
 const m=MOMENTS.find(x=>x.id==='bad-news');assert.equal(applyMoment(s,m),s);
 assert.deepEqual(s.actors.map(x=>x.pose),['Slump','Gasp','ScratchHead']);assert.deepEqual(s.actors.map(x=>x.expression),['sad','shock','worried']);
 assert.equal(a.speech,m.lead.speech);assert.equal(b.speech,'No!');assert.equal(c.speech,'','only two speak');assert.equal(s.bottom,m.caption);
 assert.equal(a.seat,'');assert.equal(a.size,1.2);assert.equal(a.recipe.hair,'Thuận');
 const saved=normalizeScene(JSON.parse(JSON.stringify(s)));assert.deepEqual(saved.actors.map(x=>x.pose),['Slump','Gasp','ScratchHead']);
 for(let i=0;i<3;i++){assert.equal(saved.actors[i].x,s.actors[i].x);assert.equal(saved.actors[i].turn,s.actors[i].turn);}
 const big=emptyScene();for(let i=0;i<6;i++)addCharacter(big,{});applyMoment(big,MOMENTS.find(x=>x.id==='dance-off'));
 assert.deepEqual(big.actors.map(x=>x.pose),['Kachashi','Clap','HeelKick','Clap','HeelKick','Clap'],'roles cycle for a big cast');
 assert.equal(applyMoment(emptyScene(),m),null);assert.equal(applyMoment(s,null),null);
});
