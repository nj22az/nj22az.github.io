/**
 * Erase, off the page's thread (app.js sends a window of the picture and the painted mask; this fills it and sends it
 * back): PhotoCraft's Content-Aware Fill (storytold/photocraft, MIT OR Apache-2.0), built to pocket-algo.wasm from
 * tools/pocket-algo. The module is fetched and compiled once, on the first erase.
 */
let ready;
function algo(){
 ready??=(async()=>{
  const url=new URL('./pocket-algo.wasm?v=20261029a',import.meta.url);
  try{return (await WebAssembly.instantiateStreaming(fetch(url),{})).instance.exports;}
  catch{return (await WebAssembly.instantiate(await (await fetch(url)).arrayBuffer(),{})).instance.exports;}
 })();
 return ready;
}
onmessage=async({data:{id,rgba,width,height,mask}})=>{
 try{
  const X=await algo(),n=width*height,ip=X.alloc(n*4),mp=X.alloc(n);
  try{
   new Uint8Array(X.memory.buffer,ip,n*4).set(rgba);new Uint8Array(X.memory.buffer,mp,n).set(mask);
   const filled=X.erase(ip,width,height,mp);
   const out=new Uint8ClampedArray(X.memory.buffer.slice(ip,ip+n*4));
   postMessage({id,rgba:out,filled},[out.buffer]);
  }finally{X.dealloc(ip,n*4);X.dealloc(mp,n);}
 }catch(err){postMessage({id,error:String(err?.message||err)});}
};
