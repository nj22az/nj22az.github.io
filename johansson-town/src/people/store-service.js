import * as THREE from '../../vendor/three.module.js';
import {STORE_CLERK_POSITION,STORE_SEATS,STORE_TABLES,STORE_SERVICE_ROUTE} from '../world/interiors/store-layout.js';
import {createSteamedBunGeometry} from '../world/interiors/steamed-bun.js';
import {createResidentLedger,residentPersonality} from './resident-personalities.js';

export const STORE_MENU=Object.freeze([
 {id:'bun',name:'Steamed pork bun',cost:150},
 {id:'rice',name:'Onigiri',cost:120},
 {id:'tea',name:'Green tea',cost:120},
].map(Object.freeze));

// One clerk, one occupied chair per order, and a queue through the real aisle.
// Residents pay from their own daily budget. A player's next order takes priority.
export function createStoreService({clerk,room,getSeat,getMinutes,getBalance,pay,say,isBlocked=()=>false,getCustomers=()=>[],ledger=createResidentLedger()}){
 let order=null,playerOrder=null,phase='counter',elapsed=0,timer=0,route=[],resumeBreak=false;
 const tickets=new Map(),trays=new Set(),seat=STORE_SEATS[1];
 function makeTray(name='Yuri food service'){
  const tray=new THREE.Group();tray.name=name;tray.visible=false;room.add(tray);trays.add(tray);
  const mat=new THREE.MeshStandardMaterial({color:0xf2e8d3,roughness:.8});
  const plate=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.025,16),mat);tray.add(plate);
  const bun=new THREE.Mesh(createSteamedBunGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94}));bun.name='bun';bun.position.y=.018;tray.add(bun);
  const rice=new THREE.Mesh(new THREE.ConeGeometry(.16,.26,3),mat);rice.name='rice';rice.position.y=.145;rice.rotation.y=Math.PI/2;tray.add(rice);
  const nori=new THREE.Mesh(new THREE.BoxGeometry(.13,.14,.10),new THREE.MeshStandardMaterial({color:0x25362a}));nori.position.set(0,-.025,.075);rice.add(nori);
  const tea=new THREE.Mesh(new THREE.CylinderGeometry(.07,.055,.13,12),new THREE.MeshStandardMaterial({color:0x789774,roughness:.5}));tea.name='tea';tea.position.y=.08;tray.add(tea);
  const liquid=new THREE.Mesh(new THREE.CircleGeometry(.061,12),new THREE.MeshStandardMaterial({color:0x667434}));liquid.rotation.x=-Math.PI/2;liquid.position.y=.064;tea.add(liquid);
  return tray;
 }
 const playerTray=makeTray();
 function pose(value){if(value){clerk.userData.socialPose=value;clerk.userData.seatHeight=seat.height;}else{delete clerk.userData.socialPose;delete clerk.userData.seatHeight;}}
 function move(points,next){route=points.map(p=>[...p]);phase=next;pose(null);}
 function returnToCounter(){
  if(order&&!order.delivered)order.tray.visible=false;
  const p=clerk.position,path=p.x<0?[[-3.6,4.3],[1,4.3],[1,1.1],[2.8,1.1]]:p.z<1.1?[[3.8,p.z],[3.8,1.1],[2.8,1.1]]:[[2.8,p.z],[2.8,1.1]];
  move([...path,...STORE_SERVICE_ROUTE.slice(2)],'return');
 }
 function occupied(id){return id===seat.id&&['sit','stand','break-arrive'].includes(phase);}
 function clearCustomer(customer){for(const key of ['heldItem','mealState','residentSpeech'])delete customer.g.userData[key];if(customer.g.userData.inMarket)customer.g.userData.socialPose='Sit';else delete customer.g.userData.socialPose;}
 function cancelTicket(ticket){
  if(!ticket)return;ticket.tray.visible=false;
  if(ticket.customer){clearCustomer(ticket.customer);tickets.delete(ticket.customer);}
  if(ticket===playerOrder)playerOrder=null;
  if(ticket===order){order=null;returnToCounter();}
 }
 function cancel(){cancelTicket(playerOrder);}
 function walk(dt){
  const p=route[0];if(!p)return true;
  const dx=p[0]-clerk.position.x,dz=p[1]-clerk.position.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*.95);
  if(d<.025){route.shift();return !route.length;}
  const x=clerk.position.x+dx/d*step,z=clerk.position.z+dz/d*step;if(isBlocked(x,z))return false;
  clerk.position.set(x,0,z);const target=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(target-clerk.rotation.y),Math.cos(target-clerk.rotation.y));clerk.rotation.y+=delta*Math.min(1,dt*9);return false;
 }
 const open=()=>{const minute=((getMinutes()%1440)+1440)%1440;return minute>=540&&minute<1200;};
 function begin(ticket){order=ticket;if(ticket.customer){ticket.customer.g.userData.mealState='preparing';ticket.customer.g.userData.activity='Yuri is preparing '+ticket.item.name.toLowerCase();}phase='prepare';timer=1.5;clerk.rotation.y=Math.PI;}
 function nextOrder(){return playerOrder&&!playerOrder.delivered?playerOrder:[...tickets.values()].find(ticket=>!ticket.delivered);}
 function request(id){
  const item=STORE_MENU.find(i=>i.id===id),playerSeat=getSeat();
  if(!item||!playerSeat||playerOrder||!clerk.visible||clerk.userData.visualReady===false||!open())return false;
  if(getBalance()<item.cost){say('You do not have enough yen.',3);return false;}
  playerOrder={item,seat:playerSeat.id,delivered:false,tray:playerTray};resumeBreak=phase==='sit';
  if(!order){if(phase==='sit'){phase='stand';timer=.65;pose(null);}else if(phase==='counter')begin(playerOrder);else returnToCounter();}
  say('Yuri: Of course. I will bring it to your table.',4);return true;
 }
 function eat(){if(!playerOrder?.delivered||getSeat()?.id!==playerOrder.seat)return false;const item=playerOrder.item;playerOrder=null;playerTray.visible=false;say(item.id==='tea'?'You finish your tea.':'You eat the '+item.name.toLowerCase()+'.',4);return true;}
 function tablePosition(ticket){const destination=STORE_SEATS.find(s=>s.id===ticket.seat),table=STORE_TABLES[destination.table];ticket.tray.position.set(table.x,.875,table.z+(destination.yaw?-.22:.22));ticket.tray.rotation.set(0,0,0);}
 function selectFood(ticket){for(const id of ['bun','rice','tea'])ticket.tray.getObjectByName(id).visible=id===ticket.item.id;}
 function customers(dt){
  const present=open()?getCustomers().filter(p=>p.profile.name!=='Yuri'&&p.g.visible&&p.g.userData.visualReady!==false&&STORE_SEATS.some(s=>s.id===p.g.userData.storeSeatId)):[];
  for(const [customer,ticket] of tickets)if(!present.includes(customer)||customer.g.userData.storeSeatId!==ticket.seat)cancelTicket(ticket);
  for(const customer of present){
   const name=customer.profile.name,account=ledger.account(name,getMinutes());account.meals??={};
   const record=account.meals.market??={item:residentPersonality(name).snack,delivered:false,eaten:0,finished:false};
   if(record.finished){clearCustomer(customer);continue;}
   let ticket=tickets.get(customer);if(ticket&&ticket.record!==record){cancelTicket(ticket);ticket=null;}
   if(!ticket){const item=STORE_MENU.find(i=>i.id===record.item)||STORE_MENU[0];
    ticket={item,customer,record,seat:customer.g.userData.storeSeatId,delivered:record.delivered,tray:makeTray('Sakura order · '+name)};tickets.set(customer,ticket);
    if(ticket.delivered){selectFood(ticket);tablePosition(ticket);}
    else {customer.g.userData.residentSpeech={text:'A '+item.name.toLowerCase()+', please, Yuri.',until:getMinutes()+5};customer.g.userData.mealState='ordered';}
   }
   const data=customer.g.userData;
   if(!ticket.delivered){data.socialPose='Sit';data.activity='waiting for '+ticket.item.name.toLowerCase();continue;}
   record.eaten+=dt;
   if(record.eaten>=18){record.finished=true;ticket.tray.visible=false;clearCustomer(customer);data.activity='finished a '+ticket.item.name.toLowerCase()+' at Sakura';ledger.record(name,getMinutes(),data.activity);continue;}
   const consuming=record.eaten%6<3;data.mealState='eating';data.socialPose=consuming?(ticket.item.id==='tea'?'Drink':'Eat'):'Sit';data.heldItem=consuming?ticket.item.id:null;ticket.tray.visible=!consuming;
   data.activity=(ticket.item.id==='tea'?'drinking green tea':'eating '+ticket.item.name.toLowerCase())+' at Sakura';
  }
 }
 return {request,eat,cancel,occupied,get order(){return playerOrder;},get phase(){return phase;},get queue(){return [...tickets.values()].filter(t=>!t.delivered).map(t=>t.customer.profile.name);},
  update(dt){
   if(clerk.userData.visualReady===false){clerk.userData.carrying=false;if(order&&!order.delivered)order.tray.visible=false;return;}
   elapsed+=dt;customers(dt);
   if(playerOrder&&(getSeat()?.id!==playerOrder.seat||!open()&&!playerOrder.delivered))cancel();
   clerk.userData.serving=!!nextOrder()||!!order;clerk.userData.carrying=phase==='deliver';
   if(phase==='counter'){
    const next=nextOrder();if(next)begin(next);
    else if(elapsed>12&&(resumeBreak||elapsed%55<30)&&getSeat()?.id!==seat.id){resumeBreak=false;move([...STORE_SERVICE_ROUTE].reverse().concat([[seat.position[0],seat.position[2]]]),'break-arrive');}
   }else if(phase==='break-arrive'){
    if(nextOrder()||getSeat()?.id===seat.id){returnToCounter();return;}
    if(walk(dt)){phase='sit';timer=18;clerk.rotation.y=seat.yaw;pose('Sit');}
   }else if(phase==='sit'){
    if(nextOrder()||(timer-=dt)<=0){phase='stand';timer=.65;pose(null);}
   }else if(phase==='stand'){
    if((timer-=dt)<=0)returnToCounter();
   }else if(phase==='return'){
    if(walk(dt)){phase='counter';clerk.position.set(...STORE_CLERK_POSITION);clerk.rotation.y=Math.PI;}
   }else if(phase==='prepare'){
    if((timer-=dt)<=0&&order){
     const destination=STORE_SEATS.find(s=>s.id===order.seat);selectFood(order);order.tray.visible=true;
     const path=[...STORE_SERVICE_ROUTE].reverse().slice(0,4);
     if(destination.table===1)path.push([1,1.1],[1,4.3],[-3.6,4.3]);
     path.push([destination.stand[0],destination.stand[2]]);move(path,'deliver');
    }
   }else if(phase==='deliver'){
    if(walk(dt)&&order){
     const paid=order.customer?ledger.purchase(order.customer.profile.name,getMinutes(),'market-meal',order.item.id,order.item.cost):pay(order.item.cost);
     if(!paid){if(!order.customer)say('There is not enough yen for this order.',3);else order.record.finished=true;cancelTicket(order);return;}
     order.delivered=true;tablePosition(order);
     if(order.customer){order.record.delivered=true;order.customer.g.userData.residentSpeech={text:'Thank you, Yuri.',until:getMinutes()+4};}
     else say('Yuri: Here you are. Enjoy your '+order.item.name.toLowerCase()+'.',5);
     phase='served';timer=1.2;
    }
   }else if(phase==='served'){
    if((timer-=dt)<=0){order=null;returnToCounter();}
   }
   if(order&&!order.delivered&&phase==='deliver'){
    order.tray.visible=true;
    order.tray.position.copy(clerk.position).add(new THREE.Vector3(0,.98,-.34).applyAxisAngle(new THREE.Vector3(0,1,0),clerk.rotation.y));order.tray.rotation.y=clerk.rotation.y;
   }
  },
  dispose(){order=null;playerOrder=null;pose(null);delete clerk.userData.serving;delete clerk.userData.carrying;
   for(const customer of tickets.keys())clearCustomer(customer);tickets.clear();
   const geos=new Set(),mats=new Set();for(const tray of trays){tray.removeFromParent();tray.traverse(o=>{if(o.isMesh){geos.add(o.geometry);mats.add(o.material);}});}geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());trays.clear();
  }
 };
}
