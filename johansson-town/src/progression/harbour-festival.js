/** Optional, friendly festival bouts. Family members are always on the same side. */
export const FESTIVAL_ALLIES=Object.freeze(['Johansson','Thuan','Thao','Nhung']);
export const FESTIVAL_STAGES=Object.freeze([
 {id:'radio-quay',place:'Harbour quay',opponent:'Chin',x:0,z:-40,title:'The remote-control dispute',reason:'Chin built a remote for Fujita’s television. It now changes every radio on the quay. He proposes a friendly spar: the winner chooses one frequency, and everybody gets tea.',after:'Chin agrees that a remote should control one appliance. Fujita keeps the batteries.',reward:100,style:'boxing'},
 {id:'park-towel',place:'Harbour Park',opponent:'Tetsuo',x:12,z:-22.4,title:'The ceremonial towel',reason:'Tetsuo insists his warm-up routine is the only correct way to fold an onsen towel. The festival referee suggests a light-contact demonstration instead of another forty-minute lecture.',after:'Tetsuo writes a four-page towel standard. Nhung files it under fiction.',reward:120,style:'karate'},
 {id:'shopping-ladle',place:'Main Street shopping block',opponent:'Hiroshi',x:0,z:4,title:'The Golden Ladle',reason:'Hiroshi has mistaken a festival trophy for his missing soup ladle. A cheerful exhibition bout will settle who carries it to the prize table. Lunch is included either way.',after:'The real ladle was in Hiroshi’s apron. The trophy goes back to the table, and lunch is excellent.',reward:150,style:'kickboxing'},
 {id:'ferry-finale',place:'Minato Maru car deck',opponent:'Fujita',ship:true,title:'The captain of the cushions',reason:'Fujita has reserved every festival seat with one enormous cushion. He offers a final friendly bout on the stationary ferry deck. The sisters promise to supervise the seating plan together.',after:'Fujita shares the cushion. Johansson and the sisters celebrate with the whole neighbourhood. Nobody has lost a friend; the island has gained a very silly festival.',reward:200,style:'sumo'},
].map(Object.freeze));
const nameOf=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const allies=new Set(FESTIVAL_ALLIES.map(nameOf));
export function canFestivalFight(a,b){return nameOf(a)!==nameOf(b)&&!(allies.has(nameOf(a))&&allies.has(nameOf(b)))&&[...FESTIVAL_ALLIES,...FESTIVAL_STAGES.map(s=>s.opponent)].some(n=>nameOf(n)===nameOf(a))&&FESTIVAL_STAGES.some(s=>nameOf(s.opponent)===nameOf(b));}
export function restoreFestival(raw){
 const tournaments={};
 for(const [key,value] of Object.entries(raw?.tournaments||{}).slice(-8)){
  if(!/^\d{4}$/.test(key)||!FESTIVAL_ALLIES.includes(value?.hero))continue;
  const t={hero:value.hero,winners:[null,null,null],rewarded:!!value.rewarded};
  for(let i=0;i<3;i++){const pair=tournamentMatches(t)[i];if(pair.a&&pair.b&&[pair.a,pair.b].includes(value.winners?.[i]))t.winners[i]=value.winners[i];}
  tournaments[key]=t;
 }
 return {version:1,hero:FESTIVAL_ALLIES.includes(raw?.hero)?raw.hero:'Johansson',completed:[...new Set(Array.isArray(raw?.completed)?raw.completed.filter(id=>FESTIVAL_STAGES.some(s=>s.id===id)):[])],tournaments};
}
export const TOURNAMENT_DATE='10-17';
export function tournamentMatches(t){
 return [{id:'semi-1',a:t.hero,b:'Chin',stage:'radio-quay'},{id:'semi-2',a:'Tetsuo',b:'Fujita',stage:'ferry-finale'},{id:'final',a:t.winners[0],b:t.winners[1],stage:'shopping-ladle'}];
}
export function registerTournament(state,year,dateKey){
 if(dateKey!==TOURNAMENT_DATE||!Number.isInteger(year))return null;
 const progress=state.harbourFestival=restoreFestival(state.harbourFestival),key=String(year);
 return progress.tournaments[key]??=( {hero:progress.hero,winners:[null,null,null],rewarded:false} );
}
export function recordTournamentResult(state,year,index,winner){
 const progress=state.harbourFestival=restoreFestival(state.harbourFestival),t=progress.tournaments[String(year)];
 if(!t||![0,1,2].includes(index)||t.winners[index])return false;
 const match=tournamentMatches(t)[index];if(!match.a||!match.b||![match.a,match.b].includes(winner)||!canFestivalFight(match.a,match.b))return false;
 t.winners[index]=winner;
 if(index===2&&winner===t.hero&&!t.rewarded){state.yen=Math.min(999999,(Number(state.yen)||0)+400);t.rewarded=true;}
 return true;
}
export function completeFestivalStage(state,id){
 const stage=FESTIVAL_STAGES.find(s=>s.id===id);if(!stage)return false;
 const progress=state.harbourFestival=restoreFestival(state.harbourFestival);
 if(progress.completed.includes(id))return false;
 const index=FESTIVAL_STAGES.indexOf(stage);if(FESTIVAL_STAGES.slice(0,index).some(s=>!progress.completed.includes(s.id)))return false;
 progress.completed.push(id);state.yen=Math.min(999999,(Number(state.yen)||0)+stage.reward);return true;
}
const styleOf=name=>name==='Thao'?'kickboxing':name==='Nhung'?'boxing':name==='Thuan'?'karate':'boxing';
const MOVES={boxing:{jab:[5,8,20,7,.85],kick:[16,19,39,13,1.1]},kickboxing:{jab:[6,9,22,8,.9],kick:[15,20,40,16,1.25]},karate:{jab:[9,12,29,10,1],kick:[18,22,44,18,1.35]},sumo:{jab:[12,16,34,12,1.05],kick:[22,25,48,19,1.2]}};
export function createFestivalBout(hero,stage,{spectator=false,tournament=false}={}){
 if((!spectator&&!tournament&&!FESTIVAL_ALLIES.includes(hero))||!FESTIVAL_STAGES.some(s=>s.id===stage.id)||!canFestivalFight(hero,stage.opponent))throw Error('This encounter is not permitted');
 const fighter=(name,x,style)=>({name,x,z:0,hp:100,style,action:'idle',age:0,connected:false,guard:false,cooldown:0});
 return {hero,stage:stage.id,fighters:[fighter(hero,-1,styleOf(hero)),fighter(stage.opponent,1,stage.style)],tick:0,remaining:3600,result:null,hitstop:0};
}
export function stepFestivalBout(bout,human={},opponent=null){
 if(bout.result!==null)return;
 if(bout.hitstop>0){bout.hitstop--;return;}
 bout.tick++;bout.remaining--;
 const [a,b]=bout.fighters,distance=Math.hypot(a.x-b.x,a.z-b.z);
 const ai=opponent||{x:distance>1?(a.x>b.x?.6:-.6):0,z:(a.z-b.z)*.3,punch:bout.tick%57===0,kick:bout.tick%113===0,guard:a.action!=='idle'&&bout.tick%73<23};
 for(const [i,input] of [human,ai].entries()){
  const f=bout.fighters[i];f.age++;f.cooldown=Math.max(0,f.cooldown-1);
  if(f.action==='jab'||f.action==='kick'){if(f.age>=MOVES[f.style][f.action][2]){f.action='idle';f.age=0;}}
  else if(f.action==='dodge'&&f.age>=18){f.action='idle';f.age=0;}
  else if(f.action==='stun'&&f.age>=18){f.action='idle';f.age=0;}
  f.guard=!!input.guard&&f.action==='idle';
  if(f.action==='idle'&&!f.guard){if(input.dodge&&!f.cooldown){f.action='dodge';f.age=0;f.cooldown=45;}else if(input.punch||input.kick){f.action=input.kick?'kick':'jab';f.age=0;f.connected=false;}}
  if(f.action==='idle'||f.action==='dodge'){const speed=f.action==='dodge'?.09:f.guard?.012:.038,scale=Math.max(1,Math.hypot(input.x||0,input.z||0));f.x=Math.max(-2.1,Math.min(2.1,f.x+(input.x||0)/scale*speed));f.z=Math.max(-1.5,Math.min(1.5,f.z+(input.z||0)/scale*speed));}
 }
 const separation=Math.hypot(a.x-b.x,a.z-b.z);if(separation<.55){const dx=separation>.001?(b.x-a.x)/separation:1,dz=separation>.001?(b.z-a.z)/separation:0,push=(.55-separation)/2;a.x-=dx*push;a.z-=dz*push;b.x+=dx*push;b.z+=dz*push;}
 const hits=bout.fighters.map((f,i)=>{const other=bout.fighters[1-i],move=MOVES[f.style][f.action];return move&&!f.connected&&f.age>=move[0]&&f.age<=move[1]&&Math.hypot(f.x-other.x,f.z-other.z)<=move[4]&&!(other.action==='dodge'&&other.age>=2&&other.age<=12)?{i,damage:other.guard?0:move[3],blocked:other.guard}:null;});
 for(const hit of hits.filter(Boolean)){const f=bout.fighters[hit.i],other=bout.fighters[1-hit.i];f.connected=true;other.hp=Math.max(0,other.hp-hit.damage);if(!hit.blocked){other.action='stun';other.age=0;}bout.hitstop=hit.blocked?2:4;}
 if(a.hp<=0||b.hp<=0||bout.remaining<=0)bout.result=a.hp===b.hp?'draw':a.hp>b.hp?'win':'lose';
}
