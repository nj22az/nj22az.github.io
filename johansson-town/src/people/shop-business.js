import {STORE_MENU} from './store-service.js';
import {residentPersonality} from './resident-personalities.js';
import {recordSakuraSale} from '../commerce/sakura-economy.js';

// Continue the same orders while the player explores another part of town.
// Only neighbours who actually reached Sakura can generate a sale. The visible
// service takes over these records immediately when the player enters.
export function advanceShopBusiness({world,ledger,state,minutes,dt,visible=false,onSale=()=>{}}){
 const m=((minutes%1440)+1440)%1440,clerk=world.people.find(p=>p.profile.name==='Thuan');
 if(visible||m<540||m>=1200||clerk?.g.userData.indoors!=='market'||dt<=0)return;
 for(const p of world.people){
  if(p===clerk||p.g.userData.indoors!=='market'||p.g.userData.roomTransition)continue;
  const account=ledger.account(p.profile.name,minutes);account.meals??={};
  const meal=account.meals.market??={item:residentPersonality(p.profile.name).snack,started:minutes,delivered:false,eaten:0,finished:false};
  if(meal.finished)continue;
  if(!meal.delivered){
   meal.waited=(meal.waited||0)+dt;if(meal.waited<45)continue;
   const item=STORE_MENU.find(i=>i.id===meal.item)||STORE_MENU[0];
   if(!ledger.purchase(p.profile.name,minutes,'market-meal',item.id,item.cost)){meal.finished=true;continue;}
   meal.delivered=true;
   if(recordSakuraSale(state,item.cost,'meal-'+Math.floor(minutes/1440)+'-'+p.profile.name))onSale();
  }else{
   meal.eaten+=dt;if(meal.eaten>=18){meal.finished=true;ledger.record(p.profile.name,minutes,'finished a snack at Sakura');}
  }
 }
}
