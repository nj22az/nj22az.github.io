/* Shared by the classic service worker and its policy tests. No save storage is touched here. */
globalThis.createTownOffline=function({scope,manifest,storage=caches,fetchFile=fetch,digest=bytes=>crypto.subtle.digest('SHA-256',bytes),notify=()=>{}}){
 const prefix='johansson-town-offline-v1-',name=prefix+manifest.version;
 const url=path=>new URL(path,scope).href,marker=url('__offline_ready__');
 const files=manifest.files.map(file=>({...file,key:url(file.url)}));
 let task=null,inspection=null,paused=false,checked=false,snapshotList=null,controllers=new Set();
 let state={version:manifest.version,stage:'available',done:0,total:files.length,bytes:0,totalBytes:manifest.bytes,error:null};
 const publish=patch=>{state={...state,...patch};notify({...state});return {...state};};
 const hash=async bytes=>Array.from(new Uint8Array(await digest(bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 async function valid(response,file){
  if(!response?.ok)return false;
  const body=await response.arrayBuffer();
  return body.byteLength===file.bytes&&await hash(body)===file.sha256;
 }
 async function readRecord(cache){try{return await (await cache.match(marker))?.json();}catch{return null;}}
 async function inspect(){
  const cache=await storage.open(name),record=await readRecord(cache);
  if(record?.version===manifest.version){
   // Check the bytes again after a worker restart. A marker alone never proves completeness.
   let done=0,bytes=0;
   for(const file of files){if(!await valid(await cache.match(file.key),file)){await cache.delete(marker);snapshotList=null;return publish({stage:'paused',done,bytes});}done++;bytes+=file.bytes;}
   checked=true;return publish({stage:'ready',done,bytes});
  }
  const keys=new Set((await cache.keys()).map(request=>request.url));let done=0,bytes=0;
  for(const file of files)if(keys.has(file.key)&&await valid(await cache.match(file.key),file)){done++;bytes+=file.bytes;}
  if(done)return publish({stage:'paused',done,bytes});
  return {...state};
 }
 function status(){if(task||checked)return Promise.resolve({...state});return inspection||(inspection=inspect().finally(()=>{inspection=null;}));}
 async function download(){
  paused=false;checked=false;publish({stage:'downloading',done:0,bytes:0,error:null});
  const cache=await storage.open(name);await cache.delete(marker);
  let next=0,failure=null;
  const others=(await storage.keys()).filter(key=>key.startsWith(prefix)&&key!==name);
  const obtain=async file=>{
   if(await valid(await cache.match(file.key),file))return;
   for(const other of others){const previous=await (await storage.open(other)).match(file.key);if(await valid(previous?.clone(),file)){await cache.put(file.key,previous);return;}}
   const controller=new AbortController();controllers.add(controller);
   try{
    const response=await fetchFile(file.key,{cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
    if(!await valid(response.clone(),file))throw Error('A town file could not be verified. Reconnect and retry.');
    if(!paused)await cache.put(file.key,response);
   }finally{controllers.delete(controller);}
  };
  // Two bounded requests; never load or decode the town's models while downloading.
  await Promise.all([0,1].map(async()=>{
   while(next<files.length&&!paused&&!failure){
    const file=files[next++];
    try{await obtain(file);if(!paused)publish({done:state.done+1,bytes:state.bytes+file.bytes});}
    catch(error){if(!paused&&!failure){failure=error;for(const controller of controllers)controller.abort();}}
   }
  }));
  if(paused)return publish({stage:'paused'});
  if(failure)throw failure;
  const previous=[];for(const key of others){const record=await readRecord(await storage.open(key));if(record?.version)previous.push({key,record});}
  const record={version:manifest.version,generation:Math.max(0,...previous.map(p=>p.record.generation||0))+1,created:Date.now(),files:manifest.files};
  // Atomic publication: a failed or interrupted replacement keeps the previous complete island.
  await cache.put(marker,new Response(JSON.stringify(record),{headers:{'Content-Type':'application/json'}}));
  checked=true;snapshotList=null;publish({stage:'ready',done:files.length,bytes:manifest.bytes});
  // A tab opened before an update can still ask for its old lazy chunks. Retain one complete predecessor.
  previous.sort((a,b)=>(b.record.generation||0)-(a.record.generation||0)||b.record.created-a.record.created);const keep=previous[0]?.key;
  await Promise.allSettled(others.filter(key=>key!==keep).map(key=>storage.delete(key)));
  return {...state};
 }
 function start(){
  if(task)return task;
  task=download().catch(error=>publish({stage:'error',error:error?.name==='QuotaExceededError'?'Not enough device storage. Free some space, then retry.':error?.message||'Download interrupted. Reconnect and retry.'})).finally(()=>{task=null;});
  return task;
 }
 function pause(){paused=true;for(const controller of controllers)controller.abort();return {...state};}
 async function readSnapshots(){
  const records=[];
  for(const key of (await storage.keys()).filter(key=>key.startsWith(prefix))){const cache=await storage.open(key),record=await readRecord(cache);if(record?.version&&Array.isArray(record.files))records.push({cache,record});}
  return records.sort((a,b)=>Number(b.record.version===manifest.version)-Number(a.record.version===manifest.version)||(b.record.generation||0)-(a.record.generation||0)||b.record.created-a.record.created);
 }
 const snapshots=()=>snapshotList||(snapshotList=readSnapshots().catch(error=>{snapshotList=null;throw error;}));
 async function fallback(request){
  const requested=new URL(request.url),home=new URL(scope);
  if(request.method!=='GET'||requested.origin!==home.origin||!requested.pathname.startsWith(home.pathname))return null;
  const navigation=request.mode==='navigate';
  // External links (Studio, live shops and optional AI downloads) are outside this game bundle.
  if(navigation&&!['', 'index.html'].includes(requested.pathname.slice(home.pathname.length)))return null;
  for(const {cache,record} of await snapshots()){
   const path=navigation?'index.html':requested.pathname.slice(home.pathname.length);
   const file=record.files.find(file=>file.url===path);
   if(!file)continue;
   const stamped=requested.searchParams.get('h');
   if(!navigation&&stamped&&stamped!==file.sha256.slice(0,8))continue;
   const response=await cache.match(url(file.url));if(!response)continue;
   const range=request.headers.get('range');
   if(!range)return response;
   // Safari asks for byte ranges when playing the town's local sound files.
   const match=/^bytes=(\d*)-(\d*)$/.exec(range),bytes=await response.arrayBuffer();
   if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
   const start=match[1]?Number(match[1]):Math.max(0,bytes.byteLength-Number(match[2]));
   const end=match[1]?(match[2]?Math.min(Number(match[2]),bytes.byteLength-1):bytes.byteLength-1):bytes.byteLength-1;
   if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});
   const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${start}-${end}/${bytes.byteLength}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
   return new Response(bytes.slice(start,end+1),{status:206,headers});
  }
  return null;
 }
 return {status,start,pause,fallback,snapshot:()=>({...state})};
};
