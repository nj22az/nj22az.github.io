import {groundHeight} from '../world/layout.js';
import {createNavigation} from './navmesh.js';
import {AIRPORT_COUNTER,airportWorld} from '../world/airport-ground.js';
import * as THREE from '../../vendor/three.module.js';
import {inGateball,COURT_TERRACE} from '../world/park-layout.js';
import {GROUND_LAYER} from '../world/ground-layers.js';

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

export const NEIGHBOURS=Object.freeze([
 {name:'Haru',look:'Shin',height:1.76,role:'sorting the village catch',at:[151,188],face:[-1,0],hours:[[0,1440]],home:[127,182],routine:[{from:0,at:[127,182],role:'at home',home:true},{from:360,at:[151,188],role:'landing and sorting the catch'},{from:720,at:[126,206],role:'collecting lunch at the general store'},{from:780,at:[149,183],role:'mending fishing nets'},{from:1080,at:[127,182],role:'at home',home:true}],lines:['The airport takes our parcels, but the boats still set the pace of the village.','I land the catch at dawn, collect lunch from Mina and mend the nets before going home.']},
 {name:'Mina',look:'Yui',height:1.6,role:'keeping the village store',at:[126,206],face:[0,1],hours:[[0,1440]],home:[126,202.8],routine:[{from:0,at:[126,205.5],role:'at home',home:true},{from:480,at:[126,206],role:'opening the village general store'},{from:720,at:[130,208],role:'taking a lunch break'},{from:780,at:[126,206],role:'serving village customers'},{from:1080,at:[126,205.5],role:'at home',home:true}],lines:['Tea, rice crackers and postcards. Most customers are our neighbours.','The new guesthouse will bring a few visitors, but this will still be a quiet fishing village.']},
 {name:'Jun',look:'Daichi',height:1.7,role:'checking commuter tickets',at:airportWorld(-16,18.5),face:[1,0],hours:[[0,1440]],home:airportWorld(-20,18.5),routine:[{from:0,at:airportWorld(-20,18.5),role:'off duty',home:true},{from:420,at:airportWorld(-16,18.5),role:'checking commuter tickets'},{from:720,at:airportWorld(-26,18.5),role:'taking lunch beside the terminal'},{from:780,at:airportWorld(-16,18.5),role:'checking commuter tickets'},{from:1200,at:airportWorld(-20,18.5),role:'off duty',home:true}],lines:['Check in ten minutes before your flight. Keep your cabin bag with you.','The ground-service radio goes to Kenji and Tetsuo at the docks. The test sheet comes back with it.']},

 {name:'Grandmother Higa',look:'Fumiko',height:1.46,role:'on her verandah',at:[-29.8,-20.7],y:.47,face:[0,-1],pose:'Interact',hours:[[H(7),H(18,30)]],
  lines:[
   "Hey, welcome.\nSit a moment. You are the one who talks to the girl at Sakura every day. She is a good girl. She counts my change twice so I do not have to.",
   'These are shima-rakkyō beans — no, you are right, rakkyō is an onion. I have been saying it wrong for seventy years and nobody corrects a grandmother.',
   'The bus? Eight minutes to, eight minutes past. I can hear it in the tunnel before it comes out. My husband drove that bus for thirty years.',
   'When the typhoon comes you close the amado, fill the bath with water and wait. The house has been here since before the war. It knows what to do.']},
 {name:'Mr Ōshiro',look:'Mr Fujita',height:1.62,role:'scraping his sabani',at:[-24.6,-45.2],face:[0,-1],pose:'Interact',hours:[[H(6,30),H(17)]],
  lines:[
   'Cedar, this. From Yakushima, before you could not get it any more. I built her in 1968 and I will be buried before she is.',
   'Weed and barnacles, every spring. You scrape to the wood, you let her dry a week, then tar. My son says buy a fibreglass one. My son also says buy a microwave.',
   'In June the whole island races these, sail and paddle, Zamami to Naha. I came fourth in 1979. Fourth! Ask anyone.']},
 {name:'Uncle Kinjō',look:'Masaru',height:1.7,role:'fishing off the seawall',at:[-38.3,7.2],face:[-1,0],pose:'Idle',hours:[[H(5),H(10)],[H(15,30),H(19,30)]],
  lines:[
   'Shh — no, it is fine, they are not biting anyway. The tide is wrong. The tide is always wrong when somebody is watching.',
   'Gurukun, if I am lucky. Fried whole, you eat the bones too. If I am unlucky, the cat from the net shed gets the bait again.',
   'My son runs the ice plant now. I told him: ice is a good business, it never goes off. He did not laugh either.']},
 {name:'Mrs Nakamura',look:'Yoshiko',height:1.52,role:'at the zenzai counter',at:[7.35,-10.55],y:.08,face:[-1,0],pose:'Idle',hours:[[H(10),H(19)]],
  lines:[
   "Welcome! Zenzai? Kintoki beans, cooked since six this morning. The ice is from the plant on the quay, shaved to order. ¥250.",
   'Thuan-chan comes on Sundays and orders the small one and then eats half of mine. Tell her I said so.',
   'Since 1972 on this corner. The machine is older than the shop. It sounds like a tractor and it makes the best ice on the island.']},
 {name:'Mr Shimabukuro',look:'Mr Tanabe',height:1.66,role:'minding the generators',at:[20.7,31.2],y:0,face:[1,0],pose:'Idle',hours:[[H(7),H(19)]],
  lines:[
   'Hear that? Two diesels, one running, one resting. Every light on this island comes through that switchboard. Mind the yellow line.',
   'I used to cut hair on Main Street. Then the town needed somebody who understood engines more than it needed another barber. The post office has my old shop now; I still live upstairs.',
   'When the tanker is in at the oil jetty I take the town truck down and bring the diesel up. Six trips. On typhoon days I sleep on a camp bed by the switchboard.']},
 {name:'Mrs Yonamine',look:'Naoko',height:1.56,role:'behind the fish counter',at:[-9.95,10.25],y:.08,face:[1,0],pose:'Interact',hours:[[H(7),H(15)]],
  lines:[
   'Irabu-chā, fresh this morning — the blue one, parrotfish. Sashimi with vinegar miso. Don’t make that face, try it first.',
   'Mozuku, ¥200 a tray. It is seaweed and it is good for everything. My mother lived to ninety-eight on it and on complaining.',
   'The auction is at six. By three I am sold out or the cat has it. Either way I go home.']},
 {name:'Mrs Miyagi',look:'Fumiko',height:1.44,role:'praying at the utaki',at:[-30.8,21.6],face:[0,1],pose:'Interact',hours:[[H(6),H(9,30)]],
  lines:[
   '……\nShe does not turn round straight away. When she does, she smiles as if she had been expecting you.\nThe gods here are not like the ones in the shrines on the mainland. They do not want money. They want you to come back.',
   'Every morning since I was a girl, rice and salt and incense. When I cannot walk here any more my granddaughter will. That is how it goes.']},
 {name:'Mr Tamaki',look:'Kenta',height:1.72,role:'loading ice',at:[30,-44.8],face:[1,0],pose:'Interact',hours:[[H(5),H(13)]],
  lines:[
   'Mind your feet — the floor is wet everywhere here, even in August. Especially in August.',
   'Block, crushed, flake. Crushed for the boats, flake for the fish shop, block for anybody with a party. Forty tonnes a day in summer.',
   'My father fishes off the seawall and says ice is a good business because it never goes off. He says it every day.']},
 {name:'Kōji',look:'Daichi',height:1.7,role:'sorting the catch',at:[23.4,-41.7],face:[0,-1],pose:'Interact',hours:[[H(5),H(12)]],
  lines:[
   'Auction is done, bro. What is left goes to Yonamine-san or to the freezer. You want a tuna head? Free. Great for soup. Nobody ever takes the tuna head.',
   'The Minato Maru came in at four with a full hold and the skipper is asleep on the wheel. That is the life.']},
 // The gateball players, on the court morning and late afternoon.
 {name:'Mr Nakasone',look:'Hiroshi',height:1.64,role:'playing gateball',at:[22.6,-34.6],face:[1,.2],pose:'Interact',hours:[[H(7),H(10,30)],[H(16),H(18,30)]],
  lines:[
   'Red team, number three. Do not stand there, that is where my ball is going. Probably.',
   'We play the next village on Sunday. They have a man who used to play professional baseball. It is not fair and we will beat him anyway.']},
 {name:'Mrs Kamiya',look:'Yoshiko',height:1.5,role:'playing gateball',at:[26.2,-35.8],face:[-1,.3],pose:'Idle',hours:[[H(7),H(10,30)],[H(16),H(18,30)]],
  lines:[
   'Nakasone-san hits too hard. Gateball is a game of patience. I have been patient with him for fifty years.',
   'After the game we go to Nakamura’s for zenzai. The winning team pays. So Nakasone-san has never paid.']},
 {name:'Mr Arakaki',look:'Mr Tanabe',height:1.62,role:'refereeing',at:[28.8,-33.4],face:[-1,-.2],pose:'Idle',hours:[[H(7),H(10,30)],[H(16),H(18,30)]],
  lines:[
   'Thirty minutes, not a second more! — Oh, a visitor. My wife makes the andagi at the shop on Main Street. I referee, which is how I keep out of her kitchen.']},
 // Two who walk: one doing her shopping, one on his round.
 {name:'Mrs Kinjō',look:'Emi',height:1.58,role:'doing her shopping',walk:true,speed:1.05,hours:[[H(8),H(12)],[H(15),H(19)]],
  // Up the paved side of the alley: Sato Ramen stands on the other side, against Minato.
  route:[[-37.6,-13],[-30,-13],[-24.6,-13.4],[-20,-13.6],[-19,-18.3],[-6.6,-18.3],[-6.6,-19.4],[-6.6,-18.3],[-19,-18.3],[-20,-13.6],[-24.6,-13.4],[-30,-13],[-37.6,-13],[-37.6,1.5],[-30,1.5],[-37.6,1.5]],
  lines:[
   'Sakura first, then Yonamine-san for fish, then home before the rice is ready. If I stop to talk the rice is ruined. So — quickly!',
   'My husband is the one fishing off the seawall. If you see him, tell him the rice is ready. It is always ready. He is always late.']},
 {name:'Postman Tōma',look:'Kenta',height:1.7,role:'on his round',walk:true,speed:1.25,hours:[[H(9),H(13)],[H(14),H(17)]],
  route:[[2.6,15.2],[2.6,-14.6],[4.3,-15.2],[4.3,-1.6],[5.4,2.4],[14,2.4],[14,9.2],[14,2.4],[5.4,2.4],[4.3,-1.6],[2.6,-1.2]],
  lines:[
   'Two collections a day, 10:30 and 16:30, same as the post box says. The post box is never wrong. I am sometimes wrong.',
   'Letters for the Nakasones, a parcel for Mr Shimabukuro at the power house, and a postcard for Sakura from somebody in Hanoi. I do not read postcards. The picture was very nice.']},
]);

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
    if(spec.routine){const m=((minutes%1440)+1440)%1440,phase=[...spec.routine].reverse().find(p=>m>=p.from);if(!p.routine){g.position.set(phase.at[0],groundAt(...phase.at),phase.at[1]);p.routine=phase;}if(p.routine!==phase){p.routine=phase;p.path=navigation.path(g.position,{x:phase.at[0],z:phase.at[1]});}g.userData.activity=phase.role;if(!g.userData.playerConversation&&p.path?.length){const to=p.path[0],dx=to[0]-g.position.x,dz=to[1]-g.position.z,len=Math.hypot(dx,dz),step=Math.min(len,dt*.75);if(len<.07)p.path.shift();else {const x=g.position.x+dx/len*step,z=g.position.z+dz/len*step;if(!blocked(x,z,.32)){g.position.set(x,groundAt(x,z),z);faceAlong(g,dx,dz);}}}if(phase.home&&!p.path?.length){g.visible=false;continue;}}
    const awake=neighbourAwake(spec,minutes);
    const near=!viewer||Math.hypot(g.position.x-viewer.x,g.position.z-viewer.z)<45;
    g.visible=awake&&near;
    if(!g.visible)continue;
    const held=(talking===p&&now<talkUntil)||g.userData.playerConversation||g.userData.chatHold;
    if(spec.walk&&!held){
     p.travelled+=spec.speed*dt;
     const at=routePoint(spec.route,p.travelled);
     g.position.x=at.x;g.position.z=at.z;if(spec.y==null)g.position.y=groundAt(at.x,at.z);faceAlong(g,at.dx,at.dz);
    }else if(!spec.walk&&!held&&spec.face){
     // Back to their work once you have gone.
     const want=Math.atan2(spec.face[0],spec.face[1])+Math.PI,diff=Math.atan2(Math.sin(want-g.rotation.y),Math.cos(want-g.rotation.y));
     g.rotation.y+=diff*Math.min(1,dt*2.5);
    }
   }
  },
 };
}
