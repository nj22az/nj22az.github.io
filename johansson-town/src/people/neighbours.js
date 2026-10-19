import {CAST,castMember} from './cast.js';
import {activeResidentHome} from './home-directory.js';
import {canonicalDay,canonicalStreetRoute} from './canonical-day.js';
import {groundHeight} from '../world/layout.js';
import {createNavigation} from './navmesh.js';
import * as THREE from '../../vendor/three.module.js';
import {inGateball,COURT_TERRACE} from '../world/park-layout.js';
import {GROUND_LAYER} from '../world/ground-layers.js';
import {NAKAMURA_GO_HOME,NAKAMURA_HOME_DOOR} from '../world/nakamura-plan.js';
import {NAKAMURA_DESSERTS,HARBOUR_PARK_STUDY} from '../world/harbour-park-plan.js';
import {kitahamaHomeFor} from '../world/kitahama-layout.js';
const VY_HOME=Object.freeze(kitahamaHomeFor('Vy').door),RIKU_HOME=Object.freeze(kitahamaHomeFor('Riku').door);

/**
 * The people who live and work in the new streets.
 *
 * They are not residents in the full sense -- no schedule engine, no homes to walk into,
 * no errands at Sakura -- because what a street needs from them is simpler: to be there
 * at the hours they would be, doing the thing they do, and to turn and talk when you
 * stop. So each has a place (or a round they walk), the hours they keep, a pose, and a
 * handful of things to say. The `look` is the drawing they are made from (avatars/cast.js); the name is their own.
 * Nobody the roster retired (roster.js RETIRED) is here: NEIGHBOURS is built from the cast, so a retired identity has
 * no body.
 *
 * Coordinates are world metres; `face` is the direction they look, as [dx, dz].
 */
const H=(h,m=0)=>h*60+m;

const ALL_NEIGHBOURS=Object.freeze([
 {name:'Riku',look:'Riku',height:1.32,role:'at home at 3 Kitahama',at:RIKU_HOME,home:RIKU_HOME,face:[0,1],hours:[[H(7),H(19)]],
  routine:[{from:0,at:RIKU_HOME,role:'at home at 3 Kitahama',home:true},{from:H(7,40),at:[RIKU_HOME[0],RIKU_HOME[1]-.8],role:'leaving for school'},{from:H(8,15),at:RIKU_HOME,role:'at school',away:true},{from:H(15,30),at:[12.5,-26.4],role:'playing in Harbour Park'},{from:H(17),at:[18,-9],role:'playing football on the park lawn'},{from:H(18,30),at:RIKU_HOME,role:'home with Kōji and Nhung at 3 Kitahama',home:true}],
  lines:['I live at 3 Kitahama with Mum and Dad. Mum is Nhung at the bookshop; Dad sorts the fish. Vy is my cousin.',
   'Dad sorts the catch on the quay. I can watch the boats, but I am not allowed out on one until I can swim to the buoy.',
   'The open lawn beside Harbour Park is our football place. We keep the ball away from the pond and the bathhouse windows.']},

 {name:'Grandmother Higa',look:'Fumiko',height:1.46,role:'on her verandah',at:[-29.8,-20.7],y:.47,face:[0,-1],pose:'Interact',hours:[[H(7),H(18,30)]],
  lines:[
   "Hey, welcome.\nSit a moment. You are the one who talks to the girl at Sakura every day. She is a good girl. She counts my change twice so I do not have to.",
   'These are shima-rakkyō beans — no, you are right, rakkyō is an onion. I have been saying it wrong for seventy years and nobody corrects a grandmother.',
   'The bus? Eight minutes to, eight minutes past. I can hear it in the tunnel before it comes out. My husband drove that bus for thirty years.',
   'When the typhoon comes you close the amado, fill the bath with water and wait. The house has been here since before the war. It knows what to do.']},
 {name:'Mrs Nakamura',look:'Yoshiko',height:1.52,role:'serving zenzai and Blue Coral ice cream',at:NAKAMURA_DESSERTS.staffAt,y:.08,face:[-1,0],pose:'Idle',hours:[[0,1440]],
  routine:[{from:0,at:[NAKAMURA_HOME_DOOR[0],NAKAMURA_HOME_DOOR[2]],route:NAKAMURA_GO_HOME,role:'at home upstairs with Mai',home:true},
   {from:H(10),at:NAKAMURA_DESSERTS.staffAt,route:[...NAKAMURA_GO_HOME].reverse().concat([[NAKAMURA_DESSERTS.staffAt[0],.08,NAKAMURA_DESSERTS.staffAt[1]]]),role:'serving zenzai and Blue Coral ice cream'},
   {from:H(19),at:[NAKAMURA_HOME_DOOR[0],NAKAMURA_HOME_DOOR[2]],route:NAKAMURA_GO_HOME,role:'closing the counter and going upstairs',home:true}],
  lines:[
   "Welcome! Zenzai? Kintoki beans, cooked since six this morning. The ice is from the plant on the quay, shaved to order. ¥250.",
   'Thuan-chan comes on Sundays and orders the small one and then eats half of mine. Tell her I said so.',
   'Since 1972 on this corner. Zenzai, sata andagi and Blue Coral scoops all come from this counter now. Mai and Vy usually arrive together after school.']},
 {name:'Kōji',look:'Daichi',height:1.7,role:'sorting the catch',at:[23.4,-41.7],face:[0,-1],pose:'Interact',hours:[[H(5),H(12)]],
  lines:[
   'Auction is done, bro. What is left goes to Mrs Sato or to the freezer. You want a tuna head? Free. Great for soup. Nobody ever takes the tuna head.',
   'The Minato Maru came in at four with a full hold and the skipper is asleep on the wheel. That is the life.']},
 // Vy lives with Thao and Chin at 1 Kitahama. School is off-scene until it has a current public entrance.
 {name:'Vy',look:'Vy',height:1.56,role:'at home with Thao and Chin',at:VY_HOME,home:VY_HOME,face:[0,-1],hours:[[H(7),H(20)]],
  routine:[{from:0,at:VY_HOME,face:[0,-1],role:'at home at 1 Kitahama',home:true},{from:H(7,40),at:[VY_HOME[0]+1.0,VY_HOME[1]-.8],face:[0,-1],role:'leaving for school'},{from:H(8,15),at:VY_HOME,face:[0,-1],role:'at school',away:true},{from:H(15,30),at:NAKAMURA_DESSERTS.approach,face:[1,0],role:'eating a Blue Coral ice cream with Mai'},{from:H(16,20),at:HARBOUR_PARK_STUDY[0],face:[-1,0],role:'doing her homework in Harbour Park'},{from:H(18,30),at:VY_HOME,face:[0,-1],role:'home with Thao and Chin at 1 Kitahama',home:true}],
  lines:[
   'Ice cream before homework. It is a rule. I made the rule, but it is still a rule.',
   'My parents are Thao and Chin. Our home is 1 Kitahama. Aunt Thuan lives on Kitano-jima and comes over on the boat every day.',
   'Mrs Nakamura saves me the pink Blue Coral scoop. Mai and I share the walk to Harbour Park afterwards.',
   'The pond is right beside the bathhouse now. I can finish my homework while everybody goes for a soak.']},
]);
/** Who is about today. Everyone here is in the cast (cast.js); the plan's batch 2 moves them onto its schedules. */
const walking=new Set(['Johansson','Thuan','Thao','Chin','Nhung','Tetsuo','Mrs Sato','Officer Mori','Harbour master','Mr Fujita',
 // The supporting crew's bodies are the ship's (ferry-crew-aboard.js) and the Kitano pier's (ferry-shore-crew.js).
 ...CAST.filter(p=>p.supporting).map(p=>p.name)]);
// Named shore residents and off-watch crew all use their canonical household and day.
export const NEIGHBOURS=Object.freeze(CAST.filter(p=>!walking.has(p.name)).map(p=>{
 const old=ALL_NEIGHBOURS.find(n=>n.name===p.name),home=activeResidentHome(p.name)?.target;
 const at=home?[home.x,home.z]:old?.at;
 return {...old,name:p.name,look:old?.look||p.name,height:old?.height||(p.age<16?1.4:p.sex==='f'?1.58:1.7),
  at:old?.at||at,home:at,face:old?.face||[0,1],role:p.purpose,hours:[[0,1440]],canonical:true,
  lines:old?.lines||[p.purpose,'My home is '+home?.address+'.'],
  profile:{name:p.name,age:p.age,home:at,start:420,retire:1260,canonicalDay:true}};
}));

/** Everything they can say, by name, for the conversation box. */
export const NEIGHBOUR_TALK=Object.freeze(Object.fromEntries(NEIGHBOURS.map(n=>[n.name,n])));

export const neighbourAwake=(spec,minutes)=>{
 const m=((minutes%1440)+1440)%1440;
 return spec.hours.some(([from,to])=>m>=from&&m<to);
};

/** Where along its route a walker is after walking `distance` metres (it loops). */
export function routePoint(route,distance){
 const legs=[];let total=0;
 for(let i=0;i<route.length;i++){const a=route[i],b=route[(i+1)%route.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);legs.push([a,b,len]);total+=len;}
 let d=((distance%total)+total)%total;
 for(const [a,b,len] of legs){if(d<=len){const t=len?d/len:0;return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,dx:b[0]-a[0],dz:b[1]-a[1],total};}d-=len;}
 const [a]=legs[0];return {x:a[0],z:a[1],dx:0,dz:1,total};
}

/**
 * A stand point (stand-points.js) or a claimed quay spot (quay-breaks.js), once they are on it: turn to its facing at a
 * person's pace (never a snap), then take its pose with its tool in hand; on the way to the next, the pose is put down
 * and their own (spec.pose) comes back.
 */
function standAtPoint(g,spec,stand,onIt,dt){
 const u=g.userData;
 if(stand&&onIt){
  const diff=Math.atan2(Math.sin(stand.yaw-g.rotation.y),Math.cos(stand.yaw-g.rotation.y));
  g.rotation.y+=Math.max(-dt*2.6,Math.min(dt*2.6,diff));
  if(Math.abs(diff)<.05){u.socialPose=stand.pose||null;if(stand.tool)u.tool=stand.tool;else delete u.tool;u.standPose=true;}
  return;
 }
 if(u.standPose){u.socialPose=spec.pose||null;delete u.tool;delete u.standPose;}
}
/** The ground under a neighbour: the gateball court stands on its terrace, everywhere else is level. */
const groundAt=(x,z)=>inGateball(x,z)?COURT_TERRACE.height+GROUND_LAYER.apron:groundHeight(x,z);
const faceAlong=(g,dx,dz)=>{if(dx||dz)g.rotation.y=Math.atan2(dx,dz)+Math.PI;};

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {(object:THREE.Object3D,label:string,fn:Function)=>void} options.register
 * @param {(kind:string,name:string)=>void} options.onAction
 * @param {{attach:Function}} [options.characters]
 */
export function createNeighbours({parent,register,onAction,characters,blocked=()=>false,getRain=()=>false,getState=()=>({}),attends=()=>true}={}){
 const people=NEIGHBOURS.map((spec,i)=>{
  const g=new THREE.Group();g.name=spec.name;g.userData.name=spec.name;g.userData.neighbour=true;
  g.userData.activity=spec.role;g.userData.socialPose=spec.pose||null;
  const start=spec.walk?routePoint(spec.route,i*7):{x:spec.at[0],z:spec.at[1],dx:spec.face[0],dz:spec.face[1]};
  g.position.set(start.x,spec.y??groundAt(start.x,start.z),start.z);faceAlong(g,start.dx,start.dz);
  parent.add(g);
  characters?.attach(g,spec.look,spec.height);
  register?.(g,'Talk to '+spec.name,()=>onAction?.('neighbour',spec.name));
  return {g,spec,profile:spec.profile,travelled:i*7};
 });
 const navigation=createNavigation(blocked,{step:.5});let talking=null,talkUntil=0;
 return {
  people,
  snapshot(){return Object.fromEntries(people.map(({g,spec})=>{
   const home=g.userData.indoors==='home'||g.userData.inHome,h=home&&activeResidentHome(spec.name)?.target;
   return [spec.name,{position:h?[h.x,h.z]:[g.position.x,g.position.z],indoors:home?'home':null,place:g.userData.place}];
  }));},
  entities:people.map(p=>p.g),
  /** New walls (Kitano-jima built on demand): forget which ground was clear, and plan each walk again from where they are. */
  replan(){navigation.clearCache?.();for(const p of people)if(p.routine)p.path=navigation.path(p.g.position,{x:p.routine.at[0],z:p.routine.at[1]});},
  /** Turn to whoever is talking to them, and stop walking while they do. */
  talkTo(name,to){
   const p=people.find(p=>p.spec.name===name);if(!p)return null;
   talking=p;talkUntil=performance.now()+2500;
   if(to)faceAlong(p.g,to.x-p.g.position.x,to.z-p.g.position.z);
   return p.g;
  },
  /**
   * @param {number} dt seconds
   * @param {number} minutes town clock
   * @param {{x:number,z:number}} [viewer] where the player is; the far ones rest
   */
  update(dt,minutes,viewer){
   const now=performance.now();
   for(const p of people){
    const {g,spec}=p;
    if(g.userData.inHome)continue;
    if(spec.canonical){
     const phase=canonicalDay(spec.name,minutes,getRain());
     if(!phase?.target){g.visible=false;continue;}
     if(spec.walk&&phase.place==='main-street'){
      let stop=p.roundIndex||0;
      if(p.initialised&&!p.path?.length&&Math.hypot(g.position.x-spec.route[stop][0],g.position.z-spec.route[stop][1])<.12)stop=(stop+1)%spec.route.length;
      p.roundIndex=stop;phase.target=[...spec.route[stop]];
     }else p.roundIndex=0;
     const key=phase.place+':'+phase.target.join(',');
     if(!p.initialised){
      const saved=getState().residentLocations?.[spec.name],at=saved?.position;
      const valid=Array.isArray(at)&&at.length===2&&at.every(Number.isFinite)&&Math.abs(at[0])<300&&Math.abs(at[1])<300;
      const start=valid?at:phase.target;g.position.set(start[0],groundAt(...start),start[1]);p.initialised=true;
     }
     if(p.phaseKey!==key){
      p.phaseKey=key;
      // Unseen and out of reach on the web (people/attention.js), the new phase starts where it ends: no route searched.
      const [tx,tz]=phase.target;
      if(!attends(g)&&!blocked(tx,tz,.3)){g.position.set(tx,groundAt(tx,tz),tz);p.path=[];}
      else p.path=canonicalStreetRoute(navigation,spec.name,g.position,phase.target);
     }
     g.userData.activity=phase.activity;g.userData.place=phase.place;
     if(!g.userData.playerConversation&&!g.userData.aboardFerry&&p.path?.length){
      const to=p.path[0],dx=to[0]-g.position.x,dz=to[1]-g.position.z,len=Math.hypot(dx,dz),step=Math.min(len,dt*(spec.profile.age>65?.7:1));
      if(len<.06)p.path.shift();else {const x=g.position.x+dx/len*step,z=g.position.z+dz/len*step;if(!blocked(x,z,.3)){g.position.set(x,groundAt(x,z),z);faceAlong(g,dx,dz);}}
     }
     const arrived=Math.hypot(g.position.x-phase.target[0],g.position.z-phase.target[1])<.35;
     if(arrived&&phase.place==='home')g.userData.indoors='home';else delete g.userData.indoors;
     g.userData.sleeping=arrived&&phase.place==='home'&&phase.rest==='sleep';
     g.userData.walking=!arrived&&!!p.path?.length&&!g.userData.aboardFerry;
     standAtPoint(g,spec,phase.stand,arrived&&!p.path?.length&&!g.userData.playerConversation,dt);
     g.visible=!g.userData.aboardFerry&&!(arrived&&(phase.place==='home'||phase.school));
     continue;
    }
    if(spec.routine?.some(phase=>phase.route)){
     const m=((minutes%1440)+1440)%1440,phase=[...spec.routine].reverse().find(p=>m>=p.from);
     if(!p.routine){p.routine=phase;const at=phase.home?phase.route.at(-1):[spec.at[0],spec.y??0,spec.at[1]];g.position.set(...at);p.steps=[];}
     if(p.routine!==phase){p.routine=phase;p.steps=phase.route.map(a=>[...a]);}
     g.userData.activity=phase.role;
     if(!g.userData.playerConversation&&p.steps.length){
      const to=p.steps[0],dx=to[0]-g.position.x,dy=to[1]-g.position.y,dz=to[2]-g.position.z,len=Math.hypot(dx,dy,dz),step=Math.min(len,dt*.75);
      if(len<.025)p.steps.shift();else {g.position.x+=dx/len*step;g.position.y+=dy/len*step;g.position.z+=dz/len*step;faceAlong(g,dx,dz);}
     }
     g.visible=!!p.steps.length||!phase.home;
     if(g.visible&&!p.steps.length)faceAlong(g,...spec.face);
     continue;
    }
    if(spec.routine){const m=((minutes%1440)+1440)%1440,phase=[...spec.routine].reverse().find(p=>m>=p.from);if(!p.routine){g.position.set(phase.at[0],groundAt(...phase.at),phase.at[1]);p.routine=phase;}if(p.routine!==phase){p.routine=phase;p.path=phase.away?[]:navigation.path(g.position,{x:phase.at[0],z:phase.at[1]});}g.userData.activity=phase.role;g.userData.scheduledAway=!!phase.away;if(phase.away){g.visible=false;continue;}if(!g.userData.playerConversation&&p.path?.length){const to=p.path[0],dx=to[0]-g.position.x,dz=to[1]-g.position.z,len=Math.hypot(dx,dz),step=Math.min(len,dt*.75);if(len<.07)p.path.shift();else {const x=g.position.x+dx/len*step,z=g.position.z+dz/len*step;if(!blocked(x,z,.32)){g.position.set(x,groundAt(x,z),z);faceAlong(g,dx,dz);}}}if(phase.home&&!p.path?.length){g.visible=false;continue;}}
    const awake=neighbourAwake(spec,minutes);
    const near=!viewer||Math.hypot(g.position.x-viewer.x,g.position.z-viewer.z)<45;
    g.visible=awake&&near;
    if(!g.visible)continue;
    const held=(talking===p&&now<talkUntil)||g.userData.playerConversation||g.userData.chatHold;
    if(spec.walk&&!held){
     p.travelled+=spec.speed*dt;
     const at=routePoint(spec.route,p.travelled);
     g.position.x=at.x;g.position.z=at.z;if(spec.y==null)g.position.y=groundAt(at.x,at.z);faceAlong(g,at.dx,at.dz);
    }else if(!spec.walk&&!held&&spec.face&&!p.path?.length){
     // Back to their work once you have gone.
     const face=p.routine?.face||spec.face,want=Math.atan2(face[0],face[1])+Math.PI,diff=Math.atan2(Math.sin(want-g.rotation.y),Math.cos(want-g.rotation.y));
     g.rotation.y+=diff*Math.min(1,dt*2.5);
    }
   }
  },
 };
}
