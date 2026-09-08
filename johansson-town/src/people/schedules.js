import {VOICE_LINES} from './voice-lines.js';
import {createNavigation} from './navmesh.js';
import {groundHeight} from '../world/layout.js';
import {PROFILES} from './profiles.js';
import * as THREE from '../../vendor/three.module.js';
export const DIALOGUE={
 Yuri:[['hello','いらっしゃいませ。\nWelcome to Sakura Shōten. Take your time; the kettle has only just boiled.'],['pink','このリボン、お気に入りなんです。\nThis ribbon is my favourite. My aunt says the shop is easier to find when I stand outside.'],['work','午後の品出しが終わりました。\nThe afternoon shelves are ready. Cold tea is in the cooler; postcards are beside the biscuits.'],['harbour','港までお散歩ですか。\nWalking to the harbour? The light turns the water pink just before supper.'],['catalogue','取り寄せの帳面はこちらです。\nThe mail-order book is on the counter. I keep those orders separate from the daily till.']],
 Aiko:[['books','The Swedish engineer keeps leaving historical novels here as if they were spare parts.'],['shelf','Six books. The shelf has requested a structural assessment.'],['century','Which century did you like? The seventeenth leaks through the shutters.','book'],['job','So he does have a real job. I assumed he only wrote about captains.','cv'],['cat','Tama has not read them. He reviews the binding by sleeping on it.'],['rain','Please leave the rain outside. The histories have enough disasters.'],['chair','The window chair is free. Twenty seconds of peace is an excellent bargain.'],['water','The harbour office tray is towards the water. Documents, not treasure.']],
 Kenji:[['delivery','This trolley steers beautifully towards whichever ankle is nearest.'],['folio','Harbour office tray, unless the wind took it. Look for the blue tape.'],['game','One perfect Star Port run and I will show you the workshop. No charge for directions.'],['book','I delivered those books. My back now has a historical perspective.','book'],['part','A keychain without keys. Sensible. Nothing to lose yet.','keychain'],['map','The workshop is on your left. Unless you face the other way.'],['weather','Rain is just the harbour making a delivery inland.'],['model','Don’t drop it. We’re inside.']],
 'Mrs Sato':[['stock','I sell many useful things. You seem determined to pick up paper.'],['homes','Stora Mellösa. Nam Phuoc. Two homes is not the same as no home.','cv'],['bligh','A captain is easier to judge from a dry chair.','bligh'],['fish','That fish is not becoming fresher while we discuss it.'],['food','Umeboshi rice ball. Eighty yen. Twenty seconds of renewed purpose.'],['book','Six books? He should charge by the kilogram.'],['weather','The noren is not an umbrella. Visitors continue to test this.'],['home','Leave things where you found them. A town runs on this small miracle.']],
 'Harbour master':[['obvious','Did you check the obvious thing twice? Good. Now check the connector.'],['folio','It is a document, not a relic. Put it back in the tray.'],['pattern','I still prefer a wooden pattern and a sharp pencil.','keychain'],['bligh','Read the Bligh paper? Command is not the same thing as shouting.','bligh'],['commission','Commissioning: prove it works before everyone goes home.'],['diagnostics','A useful fault report begins with what happened. Not what you hoped happened.'],['tide','The tide has not read the work order. Allow for this.'],['radio','Harbour Service, 82.1. Clear instructions. Mostly clear reception.']],
 'Bus driver':[['time','The timetable is optimistic. I admire that in paper.'],['stop','This is the Harbour Line. The bus is the part currently missing.'],['book','Those Swedish books need their own ticket.','book'],['cv','Two bases? I have two stops. It is not quite the same.','cv'],['rain','A wet timetable is still wrong.'],['route','Station that way. Harbour the other way. I keep it simple.']],
 'Cold-storage kid':[['ice','Ice. Twenty yen. Briefly solid.'],['books','The Swedish books weigh more than the fish.'],['paper','The Bligh paper is dry. That is already a good voyage.','bligh'],['key','That blank could label the freezer key. We have lost the label twice.','keychain'],['shift','Night shift. The fish keep very unsociable hours.'],['home','Go home before you smell like your work.']]
};
for(const clip of VOICE_LINES){const row=DIALOGUE[clip.resident]?.find(row=>row[0]===clip.topic);if(row){row[1]=clip.ja+'\n'+clip.en;row[3]=clip.id;}}
for(const p of PROFILES)if(!DIALOGUE[p.name])DIALOGUE[p.name]=[
 ['hello','こんにちは。\n'+p.name+' · '+p.role+'. The afternoon deliveries have arrived.'],
 ['work','お疲れさまです。\n'+({'policeman':'The last bus is at 18:20. The driver will not see you waving from the pier.','bathhouse keeper':'A damp page dries best on the warm rack. Never put it against the stove.','radio repairer':'The little dial is the tuning control. The big dial makes your neighbours regret it.','school pupil':'Practice finished early. We lost the ball and won an afternoon.'}[p.role]||'I finish before supper. There is always one more small job.')] ,
 ['town','そうですね。\nThe bathhouse is on the western lane. The new roof has finally stopped leaking.'],
 ['weather','いい夕方ですね。\nSalt finds every hinge in this town. Give the doors a little patience.']
];
export function createCastAI({world,player,state,paused,collides}){
 const navigation=createNavigation(collides),routes=new Map(),destinations=new Map();
 for(const person of world.people)person.g.userData.scheduled=true;
 function destination(person,target,tag){
  const key=person.g.userData.name+'/'+tag+'/'+target.join(',');if(destinations.has(key))return destinations.get(key);
  for(let radius=0;radius<=10;radius+=.85)for(let i=0;i<(radius?24:1);i++){
   const a=i/24*Math.PI*2,point=[target[0]+Math.cos(a)*radius,target[1]+Math.sin(a)*radius];
   if(collides(...point,.32)||[...destinations.values()].some(p=>Math.hypot(point[0]-p[0],point[1]-p[1])<.85))continue;
   destinations.set(key,point);return point;
  }return target;
 }
 function move(person,target,dt,tag){const g=person.g;if(Math.hypot(g.position.x-target[0],g.position.z-target[1])<.7)return;
  let route=routes.get(g);if(!route||route.tag!==tag){route={tag,points:navigation.path(g.position,{x:target[0],z:target[1]}),at:0};routes.set(g,route);}
  const goal=route.points[route.at];if(!goal)return;const dx=goal[0]-g.position.x,dz=goal[1]-g.position.z,d=Math.hypot(dx,dz);if(d<.16){route.at++;return;}
  const step=Math.min(d,dt*(person.profile?.age>65?.75:1.25)),nx=g.position.x+dx/d*step,nz=g.position.z+dz/d*step;
  const clearOfPeople=(x,z)=>world.people.every(p=>{
   if(p.g===g||!p.g.visible)return true;
   const old=Math.hypot(p.g.position.x-g.position.x,p.g.position.z-g.position.z),next=Math.hypot(p.g.position.x-x,p.g.position.z-z);
   return next>=.61||(old<.61&&next>old+.00001);
  });
  const candidates=[[nx,nz],[nx,g.position.z],[g.position.x,nz],[g.position.x-dz/d*step,g.position.z+dx/d*step],[g.position.x+dz/d*step,g.position.z-dx/d*step]];
  for(const [x,z] of candidates)if(clearOfPeople(x,z)&&!collides(x,z,.3)){g.position.set(x,groundHeight(x,z),z);break;}
  const heading=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(heading-g.rotation.y),Math.cos(heading-g.rotation.y));g.rotation.y+=delta*(1-Math.exp(-dt*7));
 }
 return {update(dt,minutes,rain){if(paused())return;const minute=minutes%1440;
  const visible=world.people.filter(p=>{const v=p.profile;return !v||minute>=v.start-30&&minute<v.retire;}).sort((a,b)=>a.g.position.distanceToSquared(player.position)-b.g.position.distanceToSquared(player.position)).slice(0,8);
  for(const p of world.people){const v=p.profile;if(!v)continue;const g=p.g;g.visible=visible.includes(p);let target=minute<v.close?v.work:minute<v.retire-30?v.evening:v.home;let tag=minute<v.close?'work':minute<v.retire-30?'evening':'home';
   if(rain&&tag!=='work'){target=v.home;tag='shelter';}g.userData.activity=tag==='work'?v.role:tag==='evening'?'walking to supper':tag==='home'?'going home':'sheltering from rain';
   if(v.name==='Aiko'&&minute>=v.close)g.userData.activity='bookshop closed · on the way to supper';
   if(v.name==='Kenji'&&state().kenjiEscort==='walking'){target=[-4,20.5];tag='escort';if(g.position.distanceTo(player.position)>6)continue;if(Math.hypot(g.position.x-target[0],g.position.z-target[1])<1){state().kenjiEscort='done';g.userData.activity='showing the workshop';}}
   target=destination(p,target,tag);
   if(!g.visible){if(!collides(...target,.32))g.position.set(target[0],groundHeight(...target),target[1]);routes.delete(g);continue;}if(g.userData.facePlayerUntil>performance.now())continue;move(p,target,dt,tag);
  }
  if(world.cat){const s=state();let target=minute<600?[4,34]:minute<1080?[-4,-18]:[-1.6,-76];if(s.quest===3)target=[4,34];else if(s.quest===1)target=[-4,-18];if(s.quest===2||s.inventory.includes('Sea bream'))target=[player.position.x+.8,player.position.z+.8];move({g:world.cat},target,dt,'cat-'+Math.round(target[0]/3)+'-'+Math.round(target[1]/3));}
 },pose(){}};
}
