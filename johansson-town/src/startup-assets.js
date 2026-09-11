// Bound the entry gate. The detail stream mounts late assets into stable shells;
// doors, collision and saved progress do not change when an asset arrives.
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
