/** Remember only an interrupted launch, never a save or the player's location.
 * A killed browser process cannot deliver pagehide; ordinary exits/reloads can. */
const KEY='johansson-startup-attempt-v1',SAFE='johansson-safe-graphics-v1';
export function createStartupRecovery({storage,now=()=>Date.now(),search='',events, schedule=setTimeout,cancel=clearTimeout}={}){
 const read=key=>{try{return storage?.getItem(key);}catch{return null;}};
 const write=(key,value)=>{try{storage?.setItem(key,value);}catch{}};
 const remove=key=>{try{storage?.removeItem(key);}catch{}};
 let prior=null;try{prior=JSON.parse(read(KEY)||'null');}catch{}
 const interrupted=!!prior&&['starting','entering'].includes(prior.stage)&&now()-prior.at>=0&&now()-prior.at<180000;
 const safe=new URLSearchParams(search).get('graphics')==='safe'||read(SAFE)==='1'||interrupted;
 if(safe)write(SAFE,'1');
 let timer=null;
 const checkpoint=stage=>write(KEY,JSON.stringify({stage,at:now()}));
 const close=()=>{cancel(timer);remove(KEY);};
 events?.addEventListener('pagehide',close);
 checkpoint('starting');
 return {safe,interrupted,
  entering(){checkpoint('entering');},
  running(){cancel(timer);timer=schedule(()=>remove(KEY),45000);},
  failed(){cancel(timer);remove(KEY);},
  dispose(){close();events?.removeEventListener('pagehide',close);}
 };
}
/** FXAA keeps the illustrated edges without duplicate native/offscreen MSAA buffers. */
export function graphicsProfile({mobile=false,tablet=false,safe=false,ios=false}={}){
 const basic=safe||(ios&&!tablet),lean=mobile||basic;
 return Object.freeze({dpr:basic?1:lean?1.25:2,shadows:!lean,antialias:!lean,
  samples:lean?0:4,pixelBudget:lean?1.2e6:4.6e6,superScale:lean?1:1.25,
  precompile:!lean,preferHalfFloat:!lean,postprocess:!basic,
  streamDetails:!basic,cinematic:!basic,quietOpening:basic,
  canvasPixels:basic?650000:null});
}
/** Bound the screen buffer too; an offscreen cap alone leaves the native canvas large. */
export function drawingDpr({width,height,deviceDpr=1,profile,scale=1}){
 const base=Math.max(1,Math.min(deviceDpr||1,profile.dpr)*scale);
 return profile.canvasPixels?Math.min(base,Math.sqrt(profile.canvasPixels/Math.max(1,width*height))):base;
}
