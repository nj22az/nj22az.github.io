import * as THREE from '../../vendor/three.module.js';
import {residentPlan} from './social.js';

const EXCHANGES=[
 ['Aya','Emi',['Did Tama agree to the apron?','He has asked for a larger salary.','Payment in sardines, presumably.']],
 ['Kenji','Tetsuo',['I fixed the crackling on your radio.','That was the music, Kenji.','Then I have improved it.']],
 ['Mrs Sato','Fumiko',['You said you were only coming for tea.','I am. The rice ball is keeping it company.','I shall fetch a second cup.']],
 ['Harbour master','Mr Fujita',['How large was the fish today?','Larger than yesterday.','Your hands say that every day.']],
 ['Hana','Daichi',['Hold still. I am drawing you.','Is this my heroic side?','It is your only still side.']],
 ['Officer Mori','Reiko',['Nothing suspicious on my rounds.','What about the cat in the fish crate?','An ongoing investigation.']],
 ['Kenta','Cold-storage kid',['I practised saying hello to Emi.','The freezer heard every word.','Was it convincing?']],
 ['Nao','Masaru',['Is this the catch of the day?','Small, but exceptionally brave.','I will need smaller plates.']],
 ['Yuri','Nao',['I promised my plants an early night.','Did they answer?','The fern looked disappointed.']],
 ['Bus driver','Naoko',['Any letters for the harbour bus?','Only complaints about the timetable.','At least somebody is reading it.']],
 ['Mr Tanabe','Fumiko',['A quiet evening is good for the soul.','So is a little gossip.','We shall call it local history.']]
];

export function clearChatLine(a,b,boxes){
 return !boxes.some(c=>{
  let lo=0,hi=1;
  for(const [axis,min,max] of [['x',c.x-c.w/2,c.x+c.w/2],['z',c.z-c.d/2,c.z+c.d/2],['y',c.minY??0,c.height??2.8]]){
   const d=b[axis]-a[axis];if(Math.abs(d)<1e-8){if(a[axis]<min||a[axis]>max)return false;continue;}
   const t1=(min-a[axis])/d,t2=(max-a[axis])/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;
  }return hi>.02&&lo<.98;
 });
}
const visible=g=>{if(g.userData.visualReady===false)return false;for(let p=g;p;p=p.parent)if(!p.visible)return false;return true;};
const place=p=>p.g.userData.inWorkplace|| (p.g.userData.inIzakaya?'izakaya':p.g.userData.inMarket?'market':p.g.userData.inRamen?'ramen':p.g.userData.inHome?'home':'street');

// One brief, local exchange at a time. No generated dialogue, network or new actors.
export function createNeighbourChats({world,observer,blocked=()=>false,state=()=>({})}){
 let clock=0,nextScan=2,active=null,sequence=0;const cooldown=new Map();
 const point=p=>{const v=p.g.getWorldPosition(new THREE.Vector3());v.y+=(p.profile.height||1.7)*.8;return v;};
 const signature=(p,minutes,rain)=>residentPlan(p.profile,minutes,rain).place+'/'+place(p);
 function cancel(){if(active){for(const p of active.pair){delete p.g.userData.chat;delete p.g.userData.chatHold;cooldown.set(p.profile.name,clock+45);}active=null;}nextScan=clock+4;}
 function eligible(p){return visible(p.g)&&!p.g.userData.serving&&!p.g.userData.usingTownObject&&!p.g.userData.mealState&&(!p.g.userData.indoors||place(p)!=='street')&&!(p.g.userData.facePlayerUntil>performance.now())&&!(p.profile.name==='Kenji'&&state().kenjiEscort==='walking')&&p.g.position.distanceTo(observer())<12;}
 function update(dt,minutes,rain=false){
  clock+=dt;
  if(active){
   if(active.pair.some((p,i)=>!eligible(p)||signature(p,minutes,rain)!==active.signatures[i])||blocked(point(active.pair[0]),point(active.pair[1]))){cancel();return;}
   const elapsed=clock-active.start;if(elapsed>=12){cancel();return;}
   const turn=Math.floor(elapsed/4),speaker=active.pair[turn%2];active.speaker=speaker;active.text=active.lines[turn];
   active.pair.forEach(p=>{const partner=active.pair.find(q=>q!==p);p.g.userData.chat={speaking:p===speaker,time:elapsed,partner:partner.g,greeting:elapsed<1.8};p.g.userData.chatHold=true;
    if(place(p)==='street'){const dx=partner.g.position.x-p.g.position.x,dz=partner.g.position.z-p.g.position.z,heading=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(heading-p.g.rotation.y),Math.cos(heading-p.g.rotation.y));p.g.rotation.y+=delta*(1-Math.exp(-dt*5));}
   });return;
  }
  if(clock<nextScan)return;nextScan=clock+2;
  const people=world.people.filter(p=>eligible(p)&&(cooldown.get(p.profile.name)||0)<=clock);let best=null;
  for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
   const a=people[i],b=people[j],d=a.g.position.distanceTo(b.g.position);if(place(a)!==place(b)||d<.85||d>3.2||blocked(point(a),point(b)))continue;
   const authored=EXCHANGES.find(e=>[a.profile.name,b.profile.name].includes(e[0])&&[a.profile.name,b.profile.name].includes(e[1]));
   const score=d+(authored?-4:0);if(!best||score<best.score)best={a,b,authored,score};
  }
  if(!best)return;
  let {a,b,authored}=best;
  if(authored&&a.profile.name!==authored[0])[a,b]=[b,a];
  const general=rain?['You brought the rain with you.','I thought it belonged to the harbour.','Let us blame the gulls.']:(minutes%1440<360||minutes%1440>=1320)?['Still awake?','The town sounds different at night.','Listen. Even the gulls have gone home.']:[['How has your day been?','Busy. I have earned a proper supper.','Nao will find you a chair.'],['Have you seen Tama?','He went past looking terribly important.','Another inspection of the fish crates.'],['The harbour is looking peaceful.','Give the delivery trolley a moment.','I shall stand well clear.']][sequence++%3];
  active={pair:[a,b],lines:authored?.[2]||general,start:clock,signatures:[signature(a,minutes,rain),signature(b,minutes,rain)],speaker:a,text:(authored?.[2]||general)[0]};
  update(0,minutes,rain);
 }
 return {update,cancel,get current(){return active;}};
}

export function createChatBubble({camera,canvas,target,blocked=()=>false}){
 const bubble=document.createElement('div'),name=document.createElement('strong'),line=document.createElement('span');bubble.className='neighbour-chat';bubble.hidden=true;bubble.setAttribute('aria-hidden','true');bubble.append(name,line);document.body.append(bubble);
 return {render(chat){
  bubble.hidden=true;if(!chat||!visible(chat.speaker.g))return;
  const head=target(chat.speaker.g),eye=camera.getWorldPosition(new THREE.Vector3());if(head.distanceTo(eye)>12||blocked(eye,head))return;
  const p=head.clone();p.y+=.45;p.project(camera);if(p.z< -1||p.z>1||Math.abs(p.x)>.94||Math.abs(p.y)>.85)return;
  const rect=canvas.getBoundingClientRect?.()||{left:0,top:0,width:innerWidth,height:innerHeight};
  const x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;
  if(y<100||y>rect.top+rect.height*.72)return;
  name.textContent=chat.speaker.profile.name;line.textContent=chat.text;
  bubble.style.left=Math.max(116,Math.min(innerWidth-116,x))+'px';bubble.style.top=y+'px';bubble.hidden=false;
 },hide(){bubble.hidden=true;}};
}
