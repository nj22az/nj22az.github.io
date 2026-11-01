/** Small, offline frontal-face detector. See vendor/pico.NOTICE.txt for the model and MIT source. */
import {pico} from './vendor/pico.js?v=20261031retouch1';

let loading;
async function classifier(){
 if(!loading)loading=(async()=>{
  const stop=new AbortController(),timeout=setTimeout(()=>stop.abort(),8000);
  try{
   const response=await fetch(new URL('./vendor/facefinder.bin?v=20261031retouch1',import.meta.url),{signal:stop.signal});
   if(!response.ok)throw new Error('Face detector unavailable');
   const bytes=new Int8Array(await response.arrayBuffer());
   if(bytes.length!==239632)throw new Error('Face detector incomplete');
   return pico.unpack_cascade(bytes);
  }finally{clearTimeout(timeout);}
 })().catch(error=>{loading=null;throw error;});
 return loading;
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/** Returns the largest confidently detected frontal face in source coordinates, or null. No photo upload. */
export async function detectLocalFace(source){
 const W=source?.naturalWidth||source?.videoWidth||source?.width,H=source?.naturalHeight||source?.videoHeight||source?.height;
 if(!(W>0&&H>0))return null;
 const classify=await classifier(),k=Math.min(1,480/Math.max(W,H)),w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d',{willReadFrequently:true});
 g.fillStyle='#fff';g.fillRect(0,0,w,h);g.drawImage(source,0,0,w,h);
 const rgba=g.getImageData(0,0,w,h).data,pixels=new Uint8Array(w*h);
 for(let i=0;i<pixels.length;i++)pixels[i]=(2*rgba[4*i]+7*rgba[4*i+1]+rgba[4*i+2])/10;
 const image={pixels,nrows:h,ncols:w,ldim:w},dets=[];
 // Yield between scales so phone controls can respond while the bounded still-image scan runs.
 for(let scale=Math.max(32,Math.min(w,h)*.08);scale<=Math.min(w,h)*.96;scale*=1.15){
  dets.push(...pico.run_cascade(image,classify,{shiftfactor:.08,minsize:scale,maxsize:scale,scalefactor:1.15}));
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 const faces=pico.cluster_detections(dets,.2).filter(d=>d[3]>=35);
 if(!faces.length)return null;
 faces.sort((a,b)=>b[2]-a[2]||b[3]-a[3]);
 const [row,col,size]=faces[0],x=clamp((col-size*.46)/w,0,1),y=clamp((row-size*.58)/h,0,1);
 return {x,y,w:Math.min(size*.92/w,1-x),h:Math.min(size*1.16/h,1-y)};
}
