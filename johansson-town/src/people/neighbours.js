import {SCHOOL} from '../world/school-layout.js';
import {groundHeight} from '../world/layout.js';
import {createNavigation} from './navmesh.js';
import {airportWorld} from '../world/airport-ground.js';
import {KITANO_HAMLET,hamletGate} from '../world/kitano-hamlet-layout.js';
// Tetsuo's mother keeps the old Chinen house, kitano-3 (the creator, 2026-10-12: "Tetsuo's mother lives on the hamlet in an old house").
const CHINEN=KITANO_HAMLET.plots.find(p=>p.id==='kitano-3'),CHINEN_GATE=airportWorld(...hamletGate(CHINEN).door),CHINEN_LANE=airportWorld((CHINEN.minX+CHINEN.maxX)/2,CHINEN.maxZ+1.6);
import * as THREE from '../../vendor/three.module.js';
import {inGateball,COURT_TERRACE} from '../world/park-layout.js';
import {GROUND_LAYER} from '../world/ground-layers.js';
import {FLOWER_SHOP} from '../world/flower-shop.js';
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
 * handful of things to say. They wear the bodies the retired cast left behind (the
 * `look` is that resident's model and colours); the name is their own.
 *
 * Coordinates are world metres; `face` is the direction they look, as [dx, dz].
 */
const H=(h,m=0)=>h*60+m;

const ALL_NEIGHBOURS=Object.freeze([
 {name:'Riku',look:'Riku',height:1.32,role:'at home at 3 Kitahama',at:RIKU_HOME,home:RIKU_HOME,face:[0,1],hours:[[H(7),H(19)]],
  routine:[{from:0,at:RIKU_HOME,role:'at home at 3 Kitahama',home:true},{from:H(7,40),at:[RIKU_HOME[0],RIKU_HOME[1]-.8],role:'leaving for school'},{from:H(8,15),at:RIKU_HOME,role:'at school',away:true},{from:H(15,30),at:[12.5,-26.4],role:'playing in Harbour Park'},{from:H(17),at:[18,-9],role:'playing football on the park lawn'},{from:H(18,30),at:RIKU_HOME,role:'home with Kōji and Nhung at 3 Kitahama',home:true}],
  lines:['I live at 3 Kitahama with Dad. Mum is Nhung at the bookshop; she comes for supper. Vy is my cousin.',
   'Dad sorts the catch on the quay. I can watch the boats, but I am not allowed out on one until I can swim to the buoy.',
   'The open lawn beside Harbour Park is our football place. We keep the ball away from Mrs Kinjō’s flowers and the pond.']},
 {name:'Grandmother Chinen',look:'Fumiko',height:1.48,role:'at her gate in Kitano hamlet',at:CHINEN_GATE,face:[0,1],hours:[[H(6,30),H(18,30)]],home:CHINEN_GATE,routine:[{from:0,at:CHINEN_GATE,role:'at home',home:true},{from:H(6,30),at:CHINEN_LANE,face:[0,-1],role:'sweeping the lane in front of her gate'},{from:H(9),at:CHINEN_GATE,role:'at home',home:true},{from:H(15),at:CHINEN_GATE,face:[0,1],role:'sitting at her gate for the breeze'},{from:H(18,30),at:CHINEN_GATE,role:'at home',home:true}],
  lines:['This is the old Chinen house. The typhoon of 1987 took the Shiromas’ roof next door; it only took three of our tiles.','My son Tetsuo mends radios in Minato. He comes over on the boat when he can, and eats like he is still fifteen.','The mayor and his wife are at the end of the lane. Thuan brings me the shop’s day-old bread on Saturdays.']},

 {name:'Grandmother Higa',look:'Fumiko',height:1.46,role:'on her verandah',at:[-29.8,-20.7],y:.47,face:[0,-1],pose:'Interact',hours:[[H(7),H(18,30)]],
  lines:[
   "Hey, welcome.\nSit a moment. You are the one who talks to the girl at Sakura every day. She is a good girl. She counts my change twice so I do not have to.",
   'These are shima-rakkyō beans — no, you are right, rakkyō is an onion. I have been saying it wrong for seventy years and nobody corrects a grandmother.',
   'The bus? Eight minutes to, eight minutes past. I can hear it in the tunnel before it comes out. My husband drove that bus for thirty years.',
   'When the typhoon comes you close the amado, fill the bath with water and wait. The house has been here since before the war. It knows what to do.']},
 {name:'Mr Ōshiro',look:'Mr Fujita',height:1.62,role:'scraping his sabani',at:[-33.4,-42.75],face:[0,-1],pose:'Interact',hours:[[H(6,30),H(17)]],
  lines:[
   'Cedar, this. From Yakushima, before you could not get it any more. I built her in 1968 and I will be buried before she is.',
   'Weed and barnacles, every spring. You scrape to the wood, you let her dry a week, then tar. Kōji says buy a fibreglass one. Kōji also says buy a microwave.',
   'In June the whole island races these, sail and paddle, Zamami to Naha. I came fourth in 1979. Fourth! Ask anyone.']},
 {name:'Mrs Nakamura',look:'Yoshiko',height:1.52,role:'serving zenzai and Blue Coral ice cream',at:NAKAMURA_DESSERTS.staffAt,y:.08,face:[-1,0],pose:'Idle',hours:[[0,1440]],
  routine:[{from:0,at:[NAKAMURA_HOME_DOOR[0],NAKAMURA_HOME_DOOR[2]],route:NAKAMURA_GO_HOME,role:'at home upstairs with Mai',home:true},
   {from:H(10),at:NAKAMURA_DESSERTS.staffAt,route:[...NAKAMURA_GO_HOME].reverse().concat([[NAKAMURA_DESSERTS.staffAt[0],.08,NAKAMURA_DESSERTS.staffAt[1]]]),role:'serving zenzai and Blue Coral ice cream'},
   {from:H(19),at:[NAKAMURA_HOME_DOOR[0],NAKAMURA_HOME_DOOR[2]],route:NAKAMURA_GO_HOME,role:'closing the counter and going upstairs',home:true}],
  lines:[
   "Welcome! Zenzai? Kintoki beans, cooked since six this morning. The ice is from the plant on the quay, shaved to order. ¥250.",
   'Thuan-chan comes on Sundays and orders the small one and then eats half of mine. Tell her I said so.',
   'Since 1972 on this corner. Zenzai, sata andagi and Blue Coral scoops all come from this counter now. Mai and Vy usually arrive together after school.']},
 {name:'Mr Shimabukuro',look:'Mr Tanabe',height:1.66,role:'minding the generators',at:[SCHOOL.powerHouse.door[0]+.6,SCHOOL.powerHouse.door[1]-.9],y:0,face:[1,0],pose:'Idle',hours:[[H(7),H(19)]],
  lines:[
   'Hear that? Two diesels, one running, one resting. Every light on this island comes through that switchboard. Mind the yellow line.',
   'I used to cut hair on Main Street. Then the town needed somebody who understood engines more than it needed another barber. The post office has my old shop now; I still live upstairs.',
   'When the tanker is in at the oil jetty I take the town truck down and bring the diesel up. Six trips. On typhoon days I sleep on a camp bed by the switchboard.']},
 {name:'Kōji',look:'Daichi',height:1.7,role:'sorting the catch',at:[23.4,-41.7],face:[0,-1],pose:'Interact',hours:[[H(5),H(12)]],
  lines:[
   'Auction is done, bro. What is left goes to Mrs Sato or to the freezer. You want a tuna head? Free. Great for soup. Nobody ever takes the tuna head.',
   'The Minato Maru came in at four with a full hold and the skipper is asleep on the wheel. That is the life.']},
 {name:'Mrs Kinjō',look:'Emi',height:1.58,role:'arranging flowers at Rainflower Florist',at:FLOWER_SHOP.staffAt,face:[-1,0],pose:'Interact',hours:[[H(9),H(18)]],
  lines:['Welcome to Rainflower. Fresh stems, a small bouquet, or something green for your windowsill? I wrap everything by hand.',
   'Nakamura-san and I share this park entrance. Her Blue Coral scoops and my flowers are neighbours now. The wide path stays clear all the way to Umi-no-yu.']},
 // Vy lives with Thao and Chin at 1 Kitahama. School is off-scene until it has a current public entrance.
 {name:'Vy',look:'Vy',height:1.56,role:'at home with Thao and Chin',at:VY_HOME,home:VY_HOME,face:[0,-1],hours:[[H(7),H(20)]],
  routine:[{from:0,at:VY_HOME,face:[0,-1],role:'at home at 1 Kitahama',home:true},{from:H(7,40),at:[VY_HOME[0]+1.0,VY_HOME[1]-.8],face:[0,-1],role:'leaving for school'},{from:H(8,15),at:VY_HOME,face:[0,-1],role:'at school',away:true},{from:H(15,30),at:NAKAMURA_DESSERTS.approach,face:[1,0],role:'eating a Blue Coral ice cream with Mai'},{from:H(16,20),at:HARBOUR_PARK_STUDY[0],face:[-1,0],role:'doing her homework in Harbour Park'},{from:H(18,30),at:VY_HOME,face:[0,-1],role:'home with Thao and Chin at 1 Kitahama',home:true}],
  lines:[
   'Ice cream before homework. It is a rule. I made the rule, but it is still a rule.',
   'My parents are Thao and Chin. Our home is 1 Kitahama, with Aunt Thuan on school nights.',
   'Mrs Nakamura saves me the pink Blue Coral scoop. Mai and I share the walk to Harbour Park afterwards.',
   'The pond is right beside the bathhouse now. I can finish my homework while everybody goes for a soak.']},
 // The postman, on his round.
 {name:'Postman Tōma',look:'Kenta',height:1.7,role:'on his round',walk:true,speed:1.25,hours:[[H(9),H(13)],[H(14),H(17)]],
  route:[[2.6,15.2],[2.6,-14.6],[4.3,-15.2],[4.3,-1.6],[5.4,2.4],[14,2.4],[14,9.2],[14,2.4],[5.4,2.4],[4.3,-1.6],[2.6,-1.2]],
  lines:[
   'Two collections a day, 10:30 and 16:30, same as the post box says. The post box is never wrong. I am sometimes wrong.',
   'Letters for the Ōshiros, a parcel for Mr Shimabukuro at the power house, and a postcard for Sakura from somebody in Hanoi. I do not read postcards. The picture was very nice.']},
]);
/** Who is about today. Everyone here is in the cast (cast.js); the plan's batch 2 moves them onto its schedules. */
export const NEIGHBOURS=ALL_NEIGHBOURS;

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
export function createNeighbours({parent,register,onAction,characters,blocked=()=>false}={}){
 const people=NEIGHBOURS.map((spec,i)=>{
  const g=new THREE.Group();g.name=spec.name;g.userData.name=spec.name;g.userData.neighbour=true;
  g.userData.activity=spec.role;g.userData.socialPose=spec.pose||null;
  const start=spec.walk?routePoint(spec.route,i*7):{x:spec.at[0],z:spec.at[1],dx:spec.face[0],dz:spec.face[1]};
  g.position.set(start.x,spec.y??groundAt(start.x,start.z),start.z);faceAlong(g,start.dx,start.dz);
  parent.add(g);
  characters?.attach(g,spec.look,spec.height);
  register?.(g,'Talk to '+spec.name,()=>onAction?.('neighbour',spec.name));
  return {g,spec,travelled:i*7};
 });
 const navigation=createNavigation(blocked);let talking=null,talkUntil=0;
 return {
  people,
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
