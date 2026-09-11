// All callers have procedural fallbacks. Late assets may populate their caches,
// but are not inserted into the live street or its collision geometry.
export async function settleStartupAssets(jobs,{timeoutMs=20000}={}){
  const pending=new Set(Object.keys(jobs)),failed=[];
  let timer;
  const ready=Promise.all(Object.entries(jobs).map(async([name,load])=>{
    try{await load();}catch(error){failed.push(name);console.warn('Startup asset unavailable:',name,error);}
    finally{pending.delete(name);}
  }));
  try{
    await Promise.race([ready,new Promise(resolve=>{timer=setTimeout(resolve,timeoutMs);})]);
    return {pending:[...pending],failed:[...failed]};
  }finally{clearTimeout(timer);}
}
