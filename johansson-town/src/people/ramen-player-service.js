import * as THREE from '../../vendor/three.module.js';
import {createResidentProp} from './resident-props.js';
export const RAMEN_MENU=Object.freeze([{id:'ramen',name:'Shoyu ramen',cost:300},{id:'rice',name:'Onigiri',cost:120},{id:'bun',name:'Steamed pork bun',cost:150},{id:'tea',name:'Green tea',cost:120}]);
export function createRamenPlayerService({room,getSeat,getMinutes,getBalance,pay,say}){
 let order=null,elapsed=0;const props=new Map();
 const open=()=>getMinutes()%1440>=540&&getMinutes()%1440<1260;
 const clear=()=>{for(const p of props.values())p.visible=false;order=null;};
 return {menu:RAMEN_MENU,title:'Sato Ramen',server:'The cook',get order(){return order;},
  request(id){const item=RAMEN_MENU.find(i=>i.id===id),seat=getSeat();if(!item||!seat||order)return false;
   if(!open()){say('The ramen kitchen is closed. Please return after 09:00.',4);return false;}
   if(getBalance()<item.cost){say('You do not have enough yen.',3);return false;}
   order={item,seat,delivered:false};elapsed=0;say('The cook takes your order and begins preparing it.',4);return true;
  },
  update(dt){if(!order)return;if(getSeat()!==order.seat||!open()&&!order.delivered){clear();return;}if(order.delivered)return;
   elapsed+=dt;if(elapsed<5)return;
   if(!pay(order.item.cost)){say('There is not enough yen for this order.',4);clear();return;}
   order.delivered=true;let prop=props.get(order.item.id);if(!prop){prop=createResidentProp(order.item.id);props.set(order.item.id,prop);room.add(prop);}
   const seat=order.seat,forward=new THREE.Vector3(-Math.sin(seat.yaw),0,-Math.cos(seat.yaw));prop.position.set(...seat.position).addScaledVector(forward,.38);prop.position.y=1.04;prop.visible=true;say('Your '+order.item.name.toLowerCase()+' is served. Enjoy your meal.',4);
  },
  eat(){if(!order?.delivered)return false;const item=order.item;clear();say(item.id==='tea'?'You finish your green tea.':'You enjoy the '+item.name.toLowerCase()+'.',4);return true;},
  cancel:clear,dispose(){clear();for(const prop of props.values()){prop.removeFromParent();prop.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}props.clear();}
 };
}
