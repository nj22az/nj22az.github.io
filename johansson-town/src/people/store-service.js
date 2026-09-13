import * as THREE from '../../vendor/three.module.js';
import {STORE_CLERK_POSITION,STORE_SEATS,STORE_TABLES,STORE_SERVICE_ROUTE} from '../world/interiors/store-layout.js';
import {createSteamedBunGeometry} from '../world/interiors/steamed-bun.js';
import {createResidentLedger,residentPersonality} from './resident-personalities.js';
import {THUAN_CHAIR_STEP} from './thuan-chair-motion.js';

export const STORE_MENU=Object.freeze([
 {id:'bun',name:'Steamed pork bun',cost:150},
 {id:'rice',name:'Onigiri',cost:120},
 {id:'tea',name:'Green tea',cost:120},
].map(Object.freeze));

// One clerk, one occupied chair per order, and a queue through the real aisle.
// Residents pay from their own daily budget. A player's next order takes priority.
export function createStoreService({clerk,room,getSeat,getMinutes,getBalance,pay,say,isBlocked=()=>false,getCustomers=()=>[],ledger=createResidentLedger(),onSale=()=>{}}){
 let order=null,playerOrder=null,phase='counter',elapsed=0,timer=0,route=[],resumeBreak=false,walkSpeed=0;
 const tickets=new Map(),trays=new Set(),seat=STORE_SEATS[1];
 const chairDuration=1.35,chairFront=[seat.position[0],seat.position[2]+THUAN_CHAIR_STEP];
 const smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
 function makeTray(name='Thuan food service'){
  const tray=new THREE.Group();tray.name=name;tray.visible=false;room.add(tray);trays.add(tray);
  const mat=new THREE.MeshStandardMaterial({color:0xf2e8d3,roughness:.8});
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.014,24),mat);tray.add(plate);
  const bun=new THREE.Mesh(createSteamedBunGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94}));bun.name='bun';bun.position.y=.018;tray.add(bun);
  const rice=new THREE.Mesh(new THREE.ConeGeometry(.070,.125,3),mat);rice.name='rice';rice.position.y=.079;rice.rotation.y=Math.PI/2;tray.add(rice);
  const nori=new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.075),new THREE.MeshStandardMaterial({color:0x25362a}));nori.position.set(0,-.025,.022);rice.add(nori);
  const tea=new THREE.Mesh(new THREE.CylinderGeometry(.037,.030,.10,12),new THREE.MeshStandardMaterial({color:0x789774,roughness:.5}));tea.name='tea';tea.position.y=.061;tray.add(tea);
  const liquid=new THREE.Mesh(new THREE.CircleGeometry(.032,12),new THREE.MeshStandardMaterial({color:0x667434}));liquid.rotation.x=-Math.PI/2;liquid.position.y=.049;tea.add(liquid);
  return tray;
 }
 const playerTray=makeTray();
 function pose(value){if(value){clerk.userData.socialPose=value;clerk.userData.seatHeight=seat.height;}else{delete clerk.userData.socialPose;delete clerk.userData.seatHeight;delete clerk.userData.chairBlend;}}
 function move(points,next){route=points.map(p=>[...p]);phase=next;walkSpeed=0;pose(null);}
 function turn(yaw,dt){const delta=Math.atan2(Math.sin(yaw-clerk.rotation.y),Math.cos(yaw-clerk.rotation.y));clerk.rotation.y+=THREE.MathUtils.clamp(delta,-dt*2.6,dt*2.6);return Math.abs(delta)<.025;}
 function chairPose(amount){
  const blend=smooth(amount);pose('Sit');clerk.userData.chairBlend=blend;
  clerk.position.set(chairFront[0],0,chairFront[1]-THUAN_CHAIR_STEP*blend);clerk.rotation.y=seat.yaw;
 }
 function stand(){phase='stand';timer=chairDuration;chairPose(1);}
 function prepareToLeave(){
  if(phase==='counter')return true;
  if(phase==='sit')stand();
  else if(!['sit-down','stand','return'].includes(phase))returnToCounter();
  return false;
 }
 function returnToCounter(){
  if(order&&!order.delivered)order.tray.visible=false;
  const p=clerk.position,path=p.x<0?[[-3.6,4.3],[1,4.3],[1,1.1],[2.8,1.1]]:p.z<1.1?[[3.8,p.z],[3.8,1.1],[2.8,1.1]]:[[2.8,p.z],[2.8,1.1]];
  move([...path,...STORE_SERVICE_ROUTE.slice(2)],'return');
 }
 function occupied(id){return id===seat.id&&['sit','stand','sit-down','break-turn','break-arrive'].includes(phase);}
 function clearCustomer(customer){for(const key of ['heldItem','mealState','residentSpeech'])delete customer.g.userData[key];if(customer.g.userData.inMarket)customer.g.userData.socialPose='Sit';else delete customer.g.userData.socialPose;}
 function cancelTicket(ticket){
  if(!ticket)return;ticket.tray.visible=false;
  if(ticket.customer){clearCustomer(ticket.customer);tickets.delete(ticket.customer);}
  if(ticket===playerOrder)playerOrder=null;
  if(ticket===order){order=null;delete clerk.userData.carriedTray;clerk.userData.carrying=false;returnToCounter();}
 }
 function cancel(){cancelTicket(playerOrder);}
 function walk(dt){
  const p=route[0];if(!p)return true;
  const dx=p[0]-clerk.position.x,dz=p[1]-clerk.position.z,d=Math.hypot(dx,dz);
  if(d<.008){clerk.position.set(p[0],0,p[1]);route.shift();return !route.length;}
  const target=Math.atan2(-dx,-dz);turn(target,dt);
  const angle=Math.abs(Math.atan2(Math.sin(target-clerk.rotation.y),Math.cos(target-clerk.rotation.y)));
  // Face the aisle before stepping, then ease off before a corner or table.
  const desired=angle>.35?0:Math.min(.90,Math.sqrt(2*1.8*d));
  walkSpeed+=THREE.MathUtils.clamp(desired-walkSpeed,-dt*2.4,dt*1.8);
  if(angle>.35)return false;
  const step=Math.min(d,dt*walkSpeed);
  const x=clerk.position.x+dx/d*step,z=clerk.position.z+dz/d*step;if(isBlocked(x,z))return false;
  clerk.position.set(x,0,z);return false;
 }
 const open=()=>{const minute=((getMinutes()%1440)+1440)%1440;return minute>=540&&minute<1200;};
 function tableRoute(ticket,next){
  const destination=STORE_SEATS.find(s=>s.id===ticket.seat),path=[...STORE_SERVICE_ROUTE].reverse().slice(0,4);
  if(destination.table===1)path.push([1,1.1],[1,4.3],[-3.6,4.3]);
  path.push([destination.stand[0],destination.stand[2]]);move(path,next);
 }
 function begin(ticket){
  order=ticket;
  if(ticket.customer&&!ticket.asked){clerk.userData.activity='going to take an order';tableRoute(ticket,'approach');return;}
  if(ticket.customer){ticket.customer.g.userData.mealState='preparing';ticket.customer.g.userData.activity='Thuan is preparing '+ticket.item.name.toLowerCase();}
  clerk.userData.activity='collecting '+ticket.item.name.toLowerCase()+' at the counter';phase='prepare';timer=1.5;
 }
 function nextOrder(){return playerOrder&&!playerOrder.delivered?playerOrder:[...tickets.values()].find(ticket=>!ticket.delivered);}
 function request(id){
  const item=STORE_MENU.find(i=>i.id===id),playerSeat=getSeat();
  if(!item||!playerSeat||playerOrder||!clerk.visible||clerk.userData.roomTransition||!clerk.userData.inMarket||clerk.userData.visualReady===false||!open())return false;
  if(getBalance()<item.cost){say('You do not have enough yen.',3);return false;}
  playerOrder={item,seat:playerSeat.id,delivered:false,tray:playerTray};resumeBreak=phase==='sit';
  if(!order){if(phase==='sit')stand();else if(phase==='counter')begin(playerOrder);else if(!['sit-down','stand'].includes(phase))returnToCounter();}
  say('Thuan: Of course. I will bring it to your table.',4);return true;
 }
 function eat(){if(!playerOrder?.delivered||getSeat()?.id!==playerOrder.seat)return false;const item=playerOrder.item;playerOrder=null;playerTray.visible=false;say(item.id==='tea'?'You finish your tea.':'You eat the '+item.name.toLowerCase()+'.',4);return true;}
 function tablePosition(ticket){const destination=STORE_SEATS.find(s=>s.id===ticket.seat),table=STORE_TABLES[destination.table];ticket.tray.position.set(table.x,.875,table.z+(destination.yaw?-.22:.22));ticket.tray.rotation.set(0,0,0);}
 function selectFood(ticket){for(const id of ['bun','rice','tea'])ticket.tray.getObjectByName(id).visible=id===ticket.item.id;}
 function customers(dt){
  const present=open()?getCustomers().filter(p=>p.profile.name!=='Thuan'&&p.g.visible&&!p.g.userData.roomTransition&&p.g.userData.visualReady!==false&&STORE_SEATS.some(s=>s.id===p.g.userData.storeSeatId)):[];
  for(const [customer,ticket] of tickets)if(!present.includes(customer)||customer.g.userData.storeSeatId!==ticket.seat)cancelTicket(ticket);
  for(const customer of present){
   const name=customer.profile.name,account=ledger.account(name,getMinutes());account.meals??={};
   const record=account.meals.market??={item:residentPersonality(name).snack,started:getMinutes(),delivered:false,eaten:0,finished:false};
   if(record.finished){clearCustomer(customer);continue;}
   let ticket=tickets.get(customer);if(ticket&&ticket.record!==record){cancelTicket(ticket);ticket=null;}
   if(!ticket){const item=STORE_MENU.find(i=>i.id===record.item)||STORE_MENU[0];
    ticket={item,customer,record,seat:customer.g.userData.storeSeatId,delivered:record.delivered,tray:makeTray('Sakura order · '+name)};tickets.set(customer,ticket);
    if(ticket.delivered){selectFood(ticket);tablePosition(ticket);}
    else {customer.g.userData.residentSpeech={text:'Excuse me, Thuan. May I order?' ,until:getMinutes()+5};customer.g.userData.mealState='ordered';}
   }
   const data=customer.g.userData;
   if(!ticket.delivered){data.socialPose='Sit';data.activity=ticket.asked?'waiting for '+ticket.item.name.toLowerCase():'waiting to order';continue;}
   record.eaten+=dt;
   if(record.eaten>=18){record.finished=true;ticket.tray.visible=false;clearCustomer(customer);data.activity='finished a '+ticket.item.name.toLowerCase()+' at Sakura';ledger.record(name,getMinutes(),data.activity);continue;}
   const consuming=record.eaten%6<3;data.mealState='eating';data.socialPose=consuming?(ticket.item.id==='tea'?'Drink':'Eat'):'Sit';data.heldItem=consuming?ticket.item.id:null;ticket.tray.visible=!consuming;
   data.activity=(ticket.item.id==='tea'?'drinking green tea':'eating '+ticket.item.name.toLowerCase())+' at Sakura';
  }
 }
 return {request,eat,cancel,occupied,prepareToLeave,get order(){return playerOrder;},get phase(){return phase;},get queue(){return [...tickets.values()].filter(t=>!t.delivered).map(t=>t.customer.profile.name);},
  update(dt){
   if(!clerk.visible||!clerk.userData.inMarket||clerk.userData.roomTransition||clerk.userData.indoors&&clerk.userData.indoors!=='market'||clerk.userData.visualReady===false){clerk.userData.carrying=false;delete clerk.userData.carriedTray;if(order&&!order.delivered)order.tray.visible=false;return;}
   elapsed+=dt;customers(dt);
   clerk.userData.floorHeight=.078;
   if(playerOrder&&(getSeat()?.id!==playerOrder.seat||!open()&&!playerOrder.delivered))cancel();
   clerk.userData.serving=!!nextOrder()||!!order;clerk.userData.carrying=phase==='deliver';
   if(phase==='counter'){
    const next=nextOrder();if(next)begin(next);
    else if(open()&&elapsed>12&&(resumeBreak||elapsed%55<30)&&getSeat()?.id!==seat.id){resumeBreak=false;move([...STORE_SERVICE_ROUTE].reverse().slice(0,-1).concat([[seat.stand[0],chairFront[1]],chairFront]),'break-arrive');}
   }else if(phase==='break-arrive'){
    if(nextOrder()||getSeat()?.id===seat.id){returnToCounter();return;}
    if(walk(dt)){phase='break-turn';timer=.25;}
   }else if(phase==='break-turn'){
    if(nextOrder()||getSeat()?.id===seat.id){returnToCounter();return;}
    if(turn(seat.yaw,dt)&&(timer-=dt)<=0){phase='sit-down';timer=chairDuration;chairPose(0);}
   }else if(phase==='sit-down'){
    timer=Math.max(0,timer-dt);chairPose(1-timer/chairDuration);
    if(!timer){phase='sit';timer=18;delete clerk.userData.chairBlend;}
   }else if(phase==='sit'){
    clerk.rotation.y=seat.yaw;
    if(!open()||nextOrder()||(timer-=dt)<=0)stand();
   }else if(phase==='stand'){
    timer=Math.max(0,timer-dt);chairPose(timer/chairDuration);if(!timer)returnToCounter();
   }else if(phase==='return'){
    if(walk(dt)&&turn(Math.PI,dt)){phase='counter';clerk.position.set(...STORE_CLERK_POSITION);if(order&&!order.delivered)begin(order);}
   }else if(phase==='approach'){
    if(walk(dt)&&order){const customer=order.customer.g;if(turn(Math.atan2(clerk.position.x-customer.position.x,clerk.position.z-customer.position.z),dt)){clerk.userData.residentSpeech={text:'What would you like to order?',until:getMinutes()+1.8};clerk.userData.activity='taking an order';phase='ask';timer=1.8;}}
   }else if(phase==='ask'){
    if((timer-=dt)<=0&&order){order.asked=true;order.customer.g.userData.mealState='ordered';order.customer.g.userData.residentSpeech={text:'A '+order.item.name.toLowerCase()+', please.',until:getMinutes()+2};phase='answer';timer=2;}
   }else if(phase==='answer'){
    if((timer-=dt)<=0&&order){clerk.userData.residentSpeech={text:'Of course. I will fetch that for you.',until:getMinutes()+3};returnToCounter();}
   }else if(phase==='prepare'){
    turn(Math.PI,dt);
    if((timer-=dt)<=0&&order){
     selectFood(order);order.tray.visible=true;tableRoute(order,'deliver');clerk.userData.activity='bringing food to a customer';
    }
   }else if(phase==='deliver'){
    if(walk(dt)&&order){
     const paid=order.customer?ledger.purchase(order.customer.profile.name,getMinutes(),'market-meal',order.item.id,order.item.cost):pay(order.item.cost);
     if(!paid){if(!order.customer)say('There is not enough yen for this order.',3);else order.record.finished=true;cancelTicket(order);return;}
     order.delivered=true;tablePosition(order);
     if(order.customer){order.record.delivered=true;order.customer.g.userData.residentSpeech={text:'Thank you, Thuan.',until:getMinutes()+4};}
     else say('Thuan: Here you are. Enjoy your '+order.item.name.toLowerCase()+'.',5);
     onSale(order.item.cost,order.customer?'meal-'+Math.floor(getMinutes()/1440)+'-'+order.customer.profile.name:null);phase='served';timer=1.2;
    }
   }else if(phase==='served'){
    if((timer-=dt)<=0){order=null;returnToCounter();}
   }
   if(order&&!order.delivered&&phase==='deliver'){
    clerk.userData.carrying=true;clerk.userData.carriedTray=order.tray;
    order.tray.visible=true;
    order.tray.position.copy(clerk.position).add(new THREE.Vector3(0,.98,-.34).applyAxisAngle(new THREE.Vector3(0,1,0),clerk.rotation.y));order.tray.rotation.y=clerk.rotation.y;
   }else{clerk.userData.carrying=false;delete clerk.userData.carriedTray;}
  },
  dispose(){order=null;playerOrder=null;pose(null);delete clerk.userData.floorHeight;delete clerk.userData.serving;delete clerk.userData.carrying;delete clerk.userData.carriedTray;delete clerk.userData.residentSpeech;
   for(const customer of tickets.keys())clearCustomer(customer);tickets.clear();
   const geos=new Set(),mats=new Set();for(const tray of trays){tray.removeFromParent();tray.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material);}});}geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());trays.clear();
  }
 };
}
