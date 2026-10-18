// Counts completed work, not elapsed time or an estimated download percentage.
export const STARTUP_STEPS=Object.freeze([
 ['controls','Preparing controls'],['code','Loading game code'],
 ['accessories','Loading character accessories'],['graphics','Preparing graphics'],
 ['town','Building the town'],['residents','Preparing residents'],
 ['walking','Preparing walking routes'],['frame','Drawing the first playable frame']
]);

export function createLoadingProgress({onChange=()=>{}}={}){
 const completed=new Set(),files=new Map();let active=STARTUP_STEPS[0][0],error=null;
 let resolveReady,rejectReady;
 const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
 ready.catch(()=>{}); // Preview errors may precede the player's START click.
 const valid=id=>{if(!STARTUP_STEPS.some(step=>step[0]===id))throw Error('Unknown loading step: '+id);};
 function snapshot(){
  const assets={completed:0,total:0,failed:0};for(const item of files.values())for(const key of Object.keys(assets))assets[key]+=item[key];
  return {completed:completed.size,total:STARTUP_STEPS.length,percent:completed.size/STARTUP_STEPS.length*100,
   label:error?'Loading failed':completed.size===STARTUP_STEPS.length?'Island ready':STARTUP_STEPS.find(s=>s[0]===active)?.[1]||'Ready to enter the island',
   error:error?.message||null,assets};
 }
 const emit=()=>onChange(snapshot());
 const api={snapshot,ready,
  start(id){valid(id);if(error||completed.has(id))return;active=id;emit();},
  complete(id){valid(id);if(error||completed.has(id))return;completed.add(id);if(active===id)active=null;emit();if(completed.size===STARTUP_STEPS.length)resolveReady(snapshot());},
  fileProgress(group,done,total,failed=0){
   if(error||completed.size===STARTUP_STEPS.length)return;
   files.set(group,{completed:done,total,failed});emit();
  },
  fail(reason){if(error||completed.size===STARTUP_STEPS.length)return;error=reason instanceof Error?reason:new Error(String(reason));emit();rejectReady(error);},
  watch(manager){
   const before={onStart:manager.onStart,onProgress:manager.onProgress,onError:manager.onError},failed=new Set();
   const update=(url,done,total)=>api.fileProgress('scene',done,total,failed.size);
   manager.onStart=function(...args){before.onStart?.apply(this,args);update(...args);};
   manager.onProgress=function(...args){before.onProgress?.apply(this,args);update(...args);};
   manager.onError=function(url){failed.add(url);before.onError?.call(this,url);};
  }
 };
 emit();return api;
}
