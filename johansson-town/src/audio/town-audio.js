import {assetURL} from '../assets.js';
const FILES=['water','cicadas','crickets','engine','train','steps-asphalt','steps-wood','steps-stone','clunk','click','radio-0','radio-1','radio-2'];
let ctx=null,master=null,enabled=true,buffers=new Map(),loops=new Map(),ready=null,lastTrain=-1;
export function unlockTownAudio(){
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
  if(!ctx){ctx=new Context();master=ctx.createGain();master.gain.value=.38;master.connect(ctx.destination);}
  if(!document.hidden)ctx.resume().catch(()=>{});
  if(!ready)ready=Promise.allSettled(FILES.map(async name=>{const response=await fetch(assetURL('audio/'+name+'.wav'));if(!response.ok)throw Error(name);buffers.set(name,await ctx.decodeAudioData(await response.arrayBuffer()));}));
}
function voice(name,loop=false){if(!ctx||!buffers.has(name))return null;const source=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=buffers.get(name);source.loop=loop;gain.gain.value=0;source.connect(gain).connect(pan).connect(master);source.start();return {source,gain,pan};}
export const townAudio={
  setEnabled(value){enabled=value;unlockTownAudio();if(master)master.gain.setTargetAtTime(value?.38:0,ctx.currentTime,.1);},
  play(name,volume=.5){if(!enabled)return;const v=voice(name);if(v)v.gain.gain.value=volume;},
  step(surface){this.play('steps-'+(surface==='asphalt'?'asphalt':surface==='wood'||surface==='timber'?'wood':'stone'),.27);},
  update({player,yaw=0,minutes=1002,rain=false,inside=false,station=0,paused=false}){if(!ctx)return;const night=minutes%1440>=1140||minutes%1440<360;
    const sources=[['water',0,-68,.5,95],['cicadas',-22,40,night?0:.25,140],['crickets',-22,40,night?.25:0,140],['engine',6,-56,.27,22],['radio-'+station,-4,-15,.36,22]];
    for(const name of ['radio-0','radio-1','radio-2'])if(name!=='radio-'+station&&loops.has(name))loops.get(name).gain.gain.setTargetAtTime(0,ctx.currentTime,.12);
    for(const [name,x,z,volume,range] of sources){if(!loops.has(name)){const v=voice(name,true);if(v)loops.set(name,v);}const v=loops.get(name);if(!v)continue;const dx=x-player.x,dz=z-player.z,d=Math.hypot(dx,dz),gain=paused?0:volume*Math.max(0,1-d/range)*(inside?.24:1);v.gain.gain.setTargetAtTime(gain,ctx.currentTime,.2);v.pan.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(d,1))),ctx.currentTime,.2);}
    const train=Math.floor(minutes/8);if(train!==lastTrain){if(lastTrain>=0&&!paused)this.play('train',.16);lastTrain=train;}
  },
  get enabled(){return enabled;}
};

if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(ctx){if(document.hidden)ctx.suspend().catch(()=>{});else if(enabled)ctx.resume().catch(()=>{});}});
