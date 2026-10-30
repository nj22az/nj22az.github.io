/** Lazy, on-device foreground masks for still photos. No inference or stale mask on the live video. */
export const PERSON_LOOKS=Object.freeze(['manga','pencilManga','lines','sketchbook','crayon','adventureInk','flat','halftone','print','stamp']);
export const recipeNeedsPerson=recipe=>recipe.layers.some(l=>l.amount>0&&PERSON_LOOKS.includes(l.look));

/** Keep substantial connected people, never little background suggestions. Confidence stays soft at the boundary. */
export function cleanPersonMask(values,width,height){
 const n=width*height;
 if(values.length!==n||!n)return null;
 const keep=new Uint8Array(n),seen=new Uint8Array(n),queue=new Int32Array(n);
 let kept=0;
 for(let start=0;start<n;start++){
  if(seen[start]||!(values[start]>=.5))continue;
  let head=0,tail=1,strong=0;queue[0]=start;seen[start]=1;
  while(head<tail){
   const i=queue[head++],x=i%width;
   if(values[i]>=.85)strong++;
   for(const j of [x>0?i-1:-1,x<width-1?i+1:-1,i-width,i+width]){
    if(j<0||j>=n||seen[j]||!(values[j]>=.5))continue;
    seen[j]=1;queue[tail++]=j;
   }
  }
  if(tail<n*.05||strong<tail*.75)continue;
  kept+=tail;for(let k=0;k<tail;k++)keep[queue[k]]=1;
 }
 if(!kept)return null;
 // One small separable blur rounds the model grid's steps. The .5 contour stays at the retained component's edge.
 const horizontal=new Float32Array(n),pixels=new Uint8Array(n);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=y*width+x;horizontal[i]=(keep[y*width+Math.max(0,x-1)]+keep[i]*2+keep[y*width+Math.min(width-1,x+1)])/4;
 }
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=y*width+x;pixels[i]=Math.round(255*(horizontal[Math.max(0,y-1)*width+x]+horizontal[i]*2+horizontal[Math.min(height-1,y+1)*width+x])/4);
 }
 return {width,height,pixels};
}

/** At most one inference at a time; snapshots are at most 256 px, with bounded memory and a timeout. */
export function createPersonMasker(){
 let worker=null,serial=0,queue=Promise.resolve(),disabled=false;
 function stop(){worker?.terminate();worker=null;}
 return {
  async mask(picture){
   if(disabled||typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined')return null;
   const width=picture.naturalWidth||picture.videoWidth||picture.width,height=picture.naturalHeight||picture.videoHeight||picture.height;
   if(!width||!height)return null;
   const id=++serial,before=queue;
   let image,release;queue=new Promise(resolve=>{release=resolve;});
   try{
    const scale=Math.min(1,256/Math.max(width,height)),work=new OffscreenCanvas(Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale)));
    work.getContext('2d').drawImage(picture,0,0,work.width,work.height);
    image=await createImageBitmap(work);
    await before;
    if(disabled)return null;
    worker??=new Worker(new URL('./person-mask-worker.js?v=20261030c',import.meta.url));
    const result=await new Promise((resolve,reject)=>{
     const timer=setTimeout(()=>reject(Error('Person mask timed out')),15000);
     worker.onmessage=({data})=>{if(data.id!==id)return;clearTimeout(timer);data.error?reject(Error(data.error)):resolve(data);};
     worker.onerror=()=>{clearTimeout(timer);reject(Error('Person mask unavailable'));};
     worker.postMessage({id,image},[image]);image=null;
    });
    return cleanPersonMask(result.values,result.width,result.height);
   }catch{disabled=true;stop();return null;}
   finally{image?.close();release();}
  },
  close(){disabled=true;stop();},
  get ready(){return !disabled&&!!worker;},
 };
}
