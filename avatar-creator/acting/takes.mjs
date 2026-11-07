export const TAKE_KEY='nj-studio-actor-takes-v1',MAX_SECONDS=60,MAX_FRAMES=1801;
const n=(v,lo,hi,f=0)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):f;
const text=v=>String(v??'').replace(/[\u0000-\u001f]/g,' ').slice(0,60);
export function actorFrame(raw={},t=0){return {t:n(t,0,60),head:[0,1,2].map(i=>n(raw.head?.[i],-.6,.6)),look:[0,1].map(i=>n(raw.look?.[i],-1,1)),blinkL:n(raw.blinkL,0,1),blinkR:n(raw.blinkR,0,1),talk:n(raw.talk,0,1),brow:n(raw.brow,-1,1),smile:n(raw.smile,-1,1),expression:text(raw.expression)||'neutral',strength:n(raw.strength,0,1,1),pose:text(raw.pose)||'Idle'};}
export function normalizeTake(raw){
 if(raw?.format!=='johansson-actor-take'||raw.version!==1||!Array.isArray(raw.frames)||raw.frames.length<2||raw.frames.length>MAX_FRAMES)throw Error('Invalid actor take.');
 let last=-1;const frames=raw.frames.map(f=>{if(!Number.isFinite(f?.t)||f.t<0||f.t>60||f.t<=last)throw Error('Invalid take timing.');last=f.t;return actorFrame(f,f.t);});
 if(frames[0].t!==0||last<=0)throw Error('Invalid take duration.');
 return {format:'johansson-actor-take',version:1,name:text(raw.name)||'Untitled take',duration:last,frames};
}
export function blendFrames(a,b,u){const mix=(x,y)=>x+(y-x)*u;return {...(u<.5?a:b),t:mix(a.t,b.t),head:a.head.map((v,i)=>mix(v,b.head[i])),look:a.look.map((v,i)=>mix(v,b.look[i])),...Object.fromEntries(['blinkL','blinkR','talk','brow','smile','strength'].map(k=>[k,mix(a[k],b[k])]))};}
export function sampleTake(take,time,{loop=false}={}){
 const end=take.duration,t=loop?((time%end)+end)%end:Math.max(0,Math.min(end,time)),F=take.frames;let lo=0,hi=F.length-1;
 while(lo+1<hi){const m=(lo+hi)>>1;if(F[m].t<=t)lo=m;else hi=m;}
 const a=F[lo],b=F[hi],out=blendFrames(a,b,Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t)))),seam=Math.min(.2,end*.2);
 return loop&&t>end-seam?blendFrames(out,F[0],(t-(end-seam))/seam):out;
}
export function readTakes(storage=globalThis.localStorage){try{return JSON.parse(storage.getItem(TAKE_KEY)||'[]').slice(0,12).map(normalizeTake);}catch{return [];}}
export function writeTakes(takes,storage=globalThis.localStorage){try{storage.setItem(TAKE_KEY,JSON.stringify(takes.slice(0,12).map(normalizeTake)));return true;}catch{return false;}}
