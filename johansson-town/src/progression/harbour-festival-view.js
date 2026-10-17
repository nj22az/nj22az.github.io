import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from '../avatars/build.js';
import {recipeFor} from '../avatars/cast.js';
import {FESTIVAL_ALLIES,FESTIVAL_STAGES,restoreFestival,createFestivalBout,stepFestivalBout,completeFestivalStage,TOURNAMENT_DATE,registerTournament,tournamentMatches,recordTournamentResult,recordFestivalWatch} from './harbour-festival.js';

/** Uses the live island scene and the shared Studio avatars; no painted backdrops. */
export function createHarbourFestival({scene,camera,renderer,activities,getStage,canStart,getCalendar=()=>({date:'',year:1997}),onBegin=()=>{},onEnd=()=>{},onFrame=()=>{}}){
 let bout=null,stage=null,actors=[],ring=null,hud=null,accumulator=0,previousPad=[],resultShown=false;
 const keyboard={},edges={};let cameraBefore,spectating=false,tournamentMatch=null;const offered=new Set();let lastOfferCheck=0;
 const festivalStyle=document.createElement('style');festivalStyle.textContent='.festival-active #hud,.festival-active #mobile{visibility:hidden!important}';document.head.append(festivalStyle);
 const state=()=>activities.state.harbourFestival=restoreFestival(activities.state.harbourFestival);
 function menu(){
  if(bout){finish();return;}
  const progress=state();
  activities.menu('Harbour Festival · The Golden Ladle','An optional, light-contact festival story around the real island. Johansson, Thuan, Thao and Nhung are allies and never fight one another. Everyone goes home as friends.\n\nYour representative: '+progress.hero,[
   ['Choose our representative',()=>activities.menu('One family, one team','Choose who represents the family. The others cheer them on.',FESTIVAL_ALLIES.map(name=>[name,()=>{state().hero=name;activities.save();menu();}]))],
   ...FESTIVAL_STAGES.map((s,i)=>[progress.completed.includes(s.id)||progress.watched.includes(s.id)?'Replay · '+s.place:i===0||(progress.completed.includes(FESTIVAL_STAGES[i-1].id)||progress.watched.includes(FESTIVAL_STAGES[i-1].id))?s.place+' · '+s.opponent:'Locked · '+s.place,()=>{
    if(i&& !state().completed.includes(FESTIVAL_STAGES[i-1].id)&&!state().watched.includes(FESTIVAL_STAGES[i-1].id)){activities.menu('One stage at a time','Finish the earlier festival encounter first.',[['Festival card',menu]]);return;}
    activities.menu(s.title,s.reason+'\n\nStage: '+s.place+'. Friendly exhibition, no entry fee. Winning this chapter once earns ¥'+s.reward+'.',[['Take part',()=>start(s)],['Watch the exhibition',()=>start(s,{watch:true})],['Festival card',menu]]);
   }]),
   ['Annual Harbour Tournament · 17 October',tournamentMenu],['Return to the island',()=>activities.close()]
  ]);
 }
 function tournamentMenu(){
  const {year,date}=getCalendar(),t=registerTournament(activities.state,year,date);
  if(!t){activities.menu('Annual Harbour Tournament','The island tournament is held on 17 October each year. Four entrants, two semi-finals and a final. One family representative enters; the sisters and Johansson remain on the same team.',[['Festival card',menu]]);return;}
  activities.save();const matches=tournamentMatches(t);
  activities.menu('Harbour Tournament · 17 October','The bracket and results are saved. Watch any available match, or take part when the family representative is competing. Final prize: the Golden Ladle and ¥400.',[
   ...matches.map((match,index)=>[t.winners[index]?(index===2?'Champion: ':'Winner: ')+t.winners[index]:(match.a&&match.b?match.a+' vs '+match.b:'Final · waiting for semi-finals'),()=>{
    if(t.winners[index]||!match.a||!match.b){tournamentMenu();return;}
    const base=FESTIVAL_STAGES.find(s=>s.id===match.stage),stage={...base,opponent:match.b,title:index===2?'Annual Harbour Tournament · Final':'Annual Harbour Tournament · Semi-final',reason:'A friendly festival bracket. Everyone has agreed to take part.'};
    const choices=[['Watch this match',()=>start(stage,{watch:true,hero:match.a,tournament:{year,index}})]];
    if(FESTIVAL_ALLIES.includes(match.a))choices.unshift(['Take part as '+match.a,()=>start(stage,{hero:match.a,tournament:{year,index}})]);
    activities.menu(stage.title,match.a+' vs '+match.b+' at '+stage.place+'.',choices.concat([['Back to bracket',tournamentMenu]]));
   }]),['Festival card',menu]
  ]);
 }
 function start(s,options={}){
  const problem=canStart(s);if(problem){activities.menu('Stage not ready',problem,[['Festival card',menu],['Return',()=>activities.close()]]);return;}
  const frame=getStage(s);if(!frame){activities.menu('Stage unavailable','The real stage could not be placed safely. Your progress is unchanged.',[['Return',menu]]);return;}
  stage={...s,...frame};spectating=!!options.watch;tournamentMatch=options.tournament||null;const hero=options.hero||(spectating?(s.opponent==='Tetsuo'?'Chin':'Tetsuo'):state().hero);bout=createFestivalBout(hero,s,{spectator:spectating,tournament:!!tournamentMatch});resultShown=false;accumulator=0;
  activities.close();onBegin(stage);cameraBefore={position:camera.position.clone(),quaternion:camera.quaternion.clone(),fov:camera.fov};
  ring=new THREE.Group();ring.name='Harbour Festival at '+s.place;ring.position.copy(stage.position);ring.rotation.y=stage.yaw||0;scene.add(ring);
  actors=bout.fighters.map(f=>{const avatar=buildAvatar(recipeFor(f.name),{shadows:false,faceSize:256});avatar.root.rotation.y=0;ring.add(avatar.root);return avatar;});
  const line=new THREE.Mesh(new THREE.RingGeometry(2.45,2.48,48),new THREE.MeshBasicMaterial({color:0xf4e4ab,side:THREE.DoubleSide,depthWrite:false}));line.rotation.x=-Math.PI/2;line.position.y=.025;ring.add(line);
  hud=document.createElement('section');hud.id='festivalHUD';hud.style.cssText='position:fixed;left:3%;right:3%;top:4%;z-index:1000;pointer-events:none;color:#fff;font:700 17px system-ui;text-shadow:0 2px 3px #000';
  hud.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px"><span data-hero></span><span data-clock></span><span data-foe></span></div><p data-stage style="text-align:center"></p><p style="position:fixed;bottom:20px;left:4%;right:4%;text-align:center">'+(window.johanssonDesktop?'X punch · Y kick · Hold A guard · B dodge · View leave':'X / J punch · Y / K kick · Hold A / L guard · B / Space dodge · View / Esc leave')+'</p>';
  document.body.append(hud);document.documentElement.classList.add('festival-active');
 }
 function finish(){
  if(!bout)return;
  const result=bout.result,finishedStage=stage,annual=tournamentMatch;
  if(spectating&&!annual&&result!==null){recordFestivalWatch(activities.state,stage.id);activities.save();}
  if(annual&&['win','lose'].includes(result)){recordTournamentResult(activities.state,annual.year,annual.index,bout.fighters[result==='win'?0:1].name);activities.save();}
  if(result==='win'&&!spectating&&!annual){completeFestivalStage(activities.state,stage.id);activities.save();}
  for(const avatar of actors)avatar.dispose();actors=[];ring.traverse(object=>{if(object.isMesh&&object.geometry?.type==='RingGeometry'){object.geometry.dispose();object.material.dispose();}});ring.removeFromParent();ring=null;
  hud?.remove();hud=null;document.documentElement.classList.remove('festival-active');
  camera.position.copy(cameraBefore.position);camera.quaternion.copy(cameraBefore.quaternion);camera.fov=cameraBefore.fov;camera.updateProjectionMatrix();
  bout=null;stage=null;Object.keys(keyboard).forEach(k=>keyboard[k]=false);onEnd();
  if(annual){if(result!==null)activities.menu('Tournament result',result==='draw'?'A draw. The referee calls for a rematch.':'The bracket has been updated.',[['Return to bracket',tournamentMenu],['Back to exploring',()=>activities.close()]]);return;}
  if(spectating){if(result!==null)activities.menu('Exhibition complete','A bow, a handshake and tea for both sides. This chapter is recorded as watched. The story continues; watching does not award a fighting prize.',[['Festival card',menu],['Back to exploring',()=>activities.close()]]);return;}
  if(result==='win')activities.menu('Festival chapter complete',finishedStage.after,[['Festival card',menu],['Back to exploring',()=>activities.close()]]);
  else if(result==='lose'||result==='draw')activities.menu('Tea break',result==='draw'?'A draw. Everyone votes for tea. You can try again whenever you like.':'A cheerful handshake, and another chance whenever you like. Your money and possessions are unchanged.',[['Festival card',menu],['Back to exploring',()=>activities.close()]]);
 }
 document.addEventListener('keydown',event=>{if(!bout)return;if(['KeyJ','KeyK','KeyL','Space','KeyW','KeyA','KeyS','KeyD','Escape','Enter'].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();if(!keyboard[event.code])edges[event.code]=true;keyboard[event.code]=true;if(event.code==='Escape')finish();}},true);
 document.addEventListener('keyup',event=>{keyboard[event.code]=false;},true);
 addEventListener('blur',()=>{for(const key of Object.keys(keyboard))keyboard[key]=false;});
 return {menu,tournamentMenu,...(new URLSearchParams(location.search).has('audit')?{auditStage(id,{watch=false}={}){if(bout)finish();const s=FESTIVAL_STAGES.find(s=>s.id===id);if(!s)throw Error('Unknown festival stage');start(s,{watch});return !!bout;},auditLeave:finish}:{}),nearby({position}){
  if(bout||performance.now()-lastOfferCheck<1000)return;lastOfferCheck=performance.now();
  const progress=state(),next=FESTIVAL_STAGES.find(s=>!progress.completed.includes(s.id)&&!progress.watched.includes(s.id));
  if(!next||offered.has(next.id))return;
  const location=getStage(next);if(!location||location.position.distanceTo(position)>6||canStart(next))return;
  offered.add(next.id);activities.menu(next.title,next.reason,[['Take part',()=>start(next)],['Watch what happens',()=>start(next,{watch:true})],['Perhaps later',()=>activities.close()]]);
 },get active(){return !!bout;},render(dt){
  if(!bout)return;
  const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected&&p.mapping==='standard'),buttons=pad?.buttons.map(b=>b.pressed)||[],edge=i=>buttons[i]&&!previousPad[i];
  if(edge(8)){previousPad=buttons;finish();return;}
  const paused=document.hidden||document.documentElement.dataset.desktopMenu==='open';
  if(!paused){
   let input={x:(keyboard.KeyD?1:0)-(keyboard.KeyA?1:0)+(pad?.axes[0]||0),z:(keyboard.KeyS?1:0)-(keyboard.KeyW?1:0)+(pad?.axes[1]||0),punch:!!edges.KeyJ||edge(2),kick:!!edges.KeyK||edge(3),guard:!!keyboard.KeyL||!!buttons[0],dodge:!!edges.Space||edge(1)};
   if(Math.abs(input.x)<.16)input.x=0;if(Math.abs(input.z)<.16)input.z=0;
   accumulator+=Math.min(.1,dt);
   let consumed=false;while(accumulator>=1/60){const spectatorInput={x:Math.abs(bout.fighters[1].x-bout.fighters[0].x)>.65?(bout.fighters[1].x>bout.fighters[0].x?.55:-.55):0,z:(bout.fighters[1].z-bout.fighters[0].z)*.3,punch:bout.tick%41===0,kick:bout.tick%97===0,guard:bout.tick%91<17};stepFestivalBout(bout,spectating?spectatorInput:consumed?{...input,punch:false,kick:false,dodge:false}:input);consumed=true;accumulator-=1/60;}
   if(consumed)for(const key of Object.keys(edges))delete edges[key];
  }
  previousPad=buttons;
  onFrame(stage);
  for(let i=0;i<2;i++){
   const f=bout.fighters[i],other=bout.fighters[1-i],avatar=actors[i],bones=avatar.bones;
   for(const b of Object.values(bones))b.rotation.set(0,0,0);
   avatar.root.position.set(f.x,stage.heightAt?stage.heightAt(stage.position.x+f.x,stage.position.z+f.z)-stage.position.y+.03:0,f.z);avatar.root.rotation.y=Math.atan2(other.x-f.x,other.z-f.z);
   const karate=f.style==='karate';
   for(const side of ['L','R']){bones['shoulder'+side].rotation.x=karate?-.35:-.7;bones['elbow'+side].rotation.x=karate?-1.1:-1.7;}
   if(f.guard){bones.shoulderL.rotation.x=bones.shoulderR.rotation.x=-1.0;}
   const strike=f.action==='jab'||f.action==='kick',startup=f.action==='jab'?(karate?9:6):18,amount=strike?Math.max(0,Math.min(1,f.age/startup,1-(f.age-startup-4)/22)):0;
   if(f.action==='jab'){bones.shoulderR.rotation.x=-.7-amount*.9;bones.elbowR.rotation.x=-1.7+amount*1.6;bones.chest.rotation.y=-amount*.16;}
   if(f.action==='kick'){bones.thighR.rotation.x=-amount*1.5;bones.kneeR.rotation.x=f.age<startup?Math.sin(f.age/startup*Math.PI)*1.4:.05;if(!karate){bones.hips.rotation.y=-amount*.45;bones.thighR.rotation.z=amount*.6;}}
   if(f.action==='stun')bones.spine.rotation.x=-.25;
  }
  const eye=ring.localToWorld(new THREE.Vector3(0,2.7,5.6)),target=ring.localToWorld(new THREE.Vector3(0,.9,0));camera.position.copy(eye);camera.lookAt(target);camera.updateMatrixWorld();
  hud.querySelector('[data-hero]').textContent=bout.hero+' · '+Math.ceil(bout.fighters[0].hp);
  hud.querySelector('[data-foe]').textContent=stage.opponent+' · '+Math.ceil(bout.fighters[1].hp);
  hud.querySelector('[data-clock]').textContent=String(Math.ceil(bout.remaining/60));
  hud.querySelector('[data-stage]').textContent=stage.place+' · '+stage.title+(spectating?' · SPECTATING':'');
  renderer.render(scene,camera);
  if(bout.result!==null&&!resultShown){resultShown=true;finish();}
 }};
}
