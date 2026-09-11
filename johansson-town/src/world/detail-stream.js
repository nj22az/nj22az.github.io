// One nearby detail at a time: avoid simultaneous model/texture decodes on Safari.
export function createDetailStream({onChange=()=>{},timeoutMs=15000}={}){
 const entries=[],stats={active:null,loaded:[],failed:[]};let busy=false;
 function add(entry){const state={...entry,status:'idle'};entries.push(state);return state;}
 function update(position){
  if(busy)return;
  const entry=entries.filter(e=>e.status==='idle').map(e=>({e,d:e.distance?e.distance(position):Math.hypot(position.x-e.x,position.z-e.z)})).filter(v=>v.d<=(v.e.radius??32)).sort((a,b)=>a.d-b.d)[0]?.e;
  if(!entry)return;
  busy=true;entry.status='loading';stats.active=entry.id;
  let timer;
  Promise.race([Promise.resolve().then(entry.load).then(ok=>{if(ok!==false)onChange();return ok;}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Detail loading timed out')),timeoutMs);})])
   .then(ok=>{if(ok===false)throw Error('Detail unavailable');entry.status='ready';stats.loaded.push(entry.id);})
   .catch(error=>{entry.status='failed';stats.failed.push(entry.id);console.warn('Detail fallback:',entry.id,error.message);})
   .finally(()=>{clearTimeout(timer);busy=false;stats.active=null;});
 }
 return {add,update,stats};
}
export function registerDetail(world,entry){(world.details??=[]).push(entry);}
