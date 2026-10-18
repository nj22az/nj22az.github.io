/** Remember only an interrupted launch, never a save or the player's location.
 * A killed browser process cannot deliver pagehide; ordinary exits/reloads can. */
const KEY='johansson-startup-attempt-v1',SAFE='johansson-safe-graphics-v1';
export function createStartupRecovery({storage,now=()=>Date.now(),search='',events, schedule=setTimeout,cancel=clearTimeout}={}){
 const read=key=>{try{return storage?.getItem(key);}catch{return null;}};
 const write=(key,value)=>{try{storage?.setItem(key,value);}catch{}};
 const remove=key=>{try{storage?.removeItem(key);}catch{}};
 let prior=null;try{prior=JSON.parse(read(KEY)||'null');}catch{}
 const interrupted=!!prior&&['starting','entering'].includes(prior.stage)&&now()-prior.at>=0&&now()-prior.at<180000;
 const requested=new URLSearchParams(search).get('graphics');
 // Only an explicit choice persists. The old automatic '1' marker could leave
 // a repaired game in plain rendering after every subsequent ordinary reload.
 const reduced=requested==='safe'||(requested!=='full'&&read(SAFE)==='manual');
 const safe=reduced||interrupted;
 if(reduced)write(SAFE,'manual');else remove(SAFE);
 let timer=null;
 const checkpoint=stage=>write(KEY,JSON.stringify({stage,at:now()}));
 const close=()=>{cancel(timer);remove(KEY);};
 events?.addEventListener('pagehide',close);
 checkpoint('starting');
 return {safe,reduced,interrupted,
  entering(){checkpoint('entering');},
  running(){cancel(timer);timer=schedule(()=>remove(KEY),45000);},
  failed(){cancel(timer);remove(KEY);},
  dispose(){close();events?.removeEventListener('pagehide',close);}
 };
}
/** Full cartoon effects share the same bounded pipeline on every device. */
export function graphicsProfile({mobile=false,tablet=false,safe=false,reduced=safe,ios=false}={}){
 const phone=ios&&!tablet,lean=mobile||safe||phone;
 const compact=phone||safe;
 return Object.freeze({dpr:safe?1:phone?1.5:lean?1.25:2,shadows:!safe&&(!lean||phone),antialias:!lean,
  shadowSize:safe?0:phone?512:tablet?1024:2048,shadowRadius:phone?14:26,
  // Restore HDR colour before grading and modest offscreen edge smoothing.
  // The native canvas stays single-sample; the two targets remain pixel-bounded.
  samples:phone&&!safe?2:lean?0:4,pixelBudget:compact?650000:lean?1.2e6:4.6e6,superScale:lean?1:1.25,
  precompile:!lean,preferHalfFloat:!lean||(phone&&!reduced),postprocess:!reduced,
  // Full effects do not imply full-world model streaming or a cinematic launch.
  streamDetails:!compact,cinematic:!compact,quietOpening:compact,
  canvasPixels:compact?650000:null});
}
/** Bound the screen buffer too; an offscreen cap alone leaves the native canvas large. */
export function drawingDpr({width,height,deviceDpr=1,profile,scale=1}){
 // Retain the old one-scene-pixel-per-CSS-pixel floor within the hard budget.
 const base=Math.max(1,Math.min(deviceDpr||1,profile.dpr)*scale);
 return profile.canvasPixels?Math.min(base,Math.sqrt(profile.canvasPixels/Math.max(1,width*height))):base;
}
