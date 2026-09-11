// Stable identities, shared by wardrobe, errands and menus. No random reroll on load.
export const RESIDENT_PERSONALITIES=Object.freeze({
 Kenji:{source:'casual_2',top:'#477697',trousers:'#334b55',hair:'#24272b',skin:'#bd8b65',width:.96,accessory:'tool-pouch',interests:['arcade','machine','radio','inspect'],snack:'bun',drink:'beer',meal:'yakitori'},
 'Mrs Sato':{source:'female_formal',top:'#96566d',trousers:'#96566d',hair:'#c5c0ae',skin:'#c69c7c',width:1.06,accessory:'glasses',interests:['read','shop','seat','post'],snack:'tea',drink:'tea',meal:'rice'},
 'Harbour master':{source:'suit',top:'#455b6b',trousers:'#374653',hair:'#92958d',skin:'#b5805d',width:1.10,accessory:'captain',interests:['fish','read','machine','phone'],snack:'rice',drink:'beer',meal:'fish'},
 Tetsuo:{source:'worker',top:'#698071',trousers:'#4a5146',hair:'#444035',skin:'#ba895d',helmet:'#737768',width:1.03,accessory:'glasses',interests:['radio','machine','arcade','inspect'],snack:'bun',drink:'beer',meal:'yakitori'},
 'Officer Mori':{source:'suit',top:'#3c5780',trousers:'#303e57',hair:'#202528',skin:'#c79872',width:.98,accessory:'police',interests:['read','phone','post','inspect'],snack:'rice',drink:'tea',meal:'rice'},
 'Bus driver':{source:'suit',top:'#437f78',trousers:'#3b514e',hair:'#61564b',skin:'#b88968',width:1.04,accessory:'driver',interests:['seat','read','phone','shop'],snack:'tea',drink:'tea',meal:'fish'},
 Nao:{source:'female_casual',top:'#bd7557',trousers:'#394b58',hair:'#292a30',skin:'#cf9b77',width:.98,accessory:'apron',interests:['shop','post','read','radio'],snack:'rice',drink:'tea',meal:'yakitori'},
 Aya:{interests:['read','seat','post','shop'],snack:'tea',drink:'beer',meal:'rice'},
 Reiko:{interests:['read','radio','phone','shop'],snack:'rice',drink:'beer',meal:'fish'},
 Yuri:{source:'female_casual',top:'#d49bb3',trousers:'#996c85',hair:'#704e53',skin:'#ddb499',width:1.02,accessory:'ribbon-apron',interests:['shop','seat','read','post'],snack:'tea',drink:'tea',meal:'rice',height:1.64},
});
const DEFAULT={interests:['read','inspect','seat','shop'],snack:'rice',drink:'tea',meal:'rice'};
export const residentPersonality=name=>RESIDENT_PERSONALITIES[name]||DEFAULT;

export function restoreResidentLife(saved){
 const restored={};if(!saved||typeof saved!=='object')return restored;
 for(const name of Object.keys(RESIDENT_PERSONALITIES)){
  const source=saved[name];if(!source||!Number.isSafeInteger(source.day)||!Number.isFinite(source.yen))continue;
  const record={day:source.day,yen:Math.max(0,Math.min(2400,source.yen)),purchases:[],activities:[],meals:{}};
  if(Array.isArray(source.purchases))record.purchases=source.purchases.filter(p=>p&&typeof p.id==='string'&&typeof p.item==='string'&&Number.isFinite(p.cost)&&p.cost>=0).slice(-24).map(p=>({id:p.id.slice(0,160),item:p.item.slice(0,160),cost:p.cost}));
  if(Array.isArray(source.activities))record.activities=source.activities.filter(s=>typeof s==='string').slice(-8).map(s=>s.slice(0,180));
  for(const place of ['market','izakaya','ramen']){
   const meal=source.meals?.[place];if(!meal||!['bun','rice','tea','ramen','fish','yakitori'].includes(meal.item))continue;
   record.meals[place]={item:meal.item,drink:meal.drink==='beer'?'beer':'tea',delivered:meal.delivered===true,finished:meal.finished===true,eaten:Number.isFinite(meal.eaten)?Math.max(0,Math.min(42,meal.eaten)):0};
  }
  restored[name]=record;
 }return restored;
}

// A resident's daily spending is separate from the player's wallet and inventory.
// The bounded record survives room changes and saves; repeat delivery is idempotent.
export function createResidentLedger(getState=()=>null){
 const fallback={};
 function account(name,minutes){
  const state=getState()||fallback,day=Math.floor(minutes/1440);
  state.residentLife??={};let record=state.residentLife[name];
  if(!record||record.day!==day)record=state.residentLife[name]={day,yen:2400,purchases:[],activities:[]};
  return record;
 }
 return {account,
  purchase(name,minutes,id,item,cost){
   const record=account(name,minutes);
   if(record.purchases.some(p=>p.id===id))return true;
   if(!Number.isFinite(cost)||cost<0||record.yen<cost)return false;
   if(cost===0)return true;
   record.yen-=cost;record.purchases.push({id,item,cost});record.purchases=record.purchases.slice(-24);return true;
  },
  record(name,minutes,activity){const record=account(name,minutes);record.activities.push(activity);record.activities=record.activities.slice(-8);},
 };
}
