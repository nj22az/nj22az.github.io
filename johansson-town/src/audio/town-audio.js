import {assetURL} from '../assets.js';
import {BEACH_CORNER} from '../world/beach-layout.js';
let ctx=null,master=null,enabled=true,buffers=new Map(),loops=new Map(),lastTrain=-1,speech=null,speechRequest=0;
export function unlockTownAudio(){
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
  if(!ctx){ctx=new Context();master=ctx.createGain();master.gain.value=.38;master.connect(ctx.destination);}
  if(!document.hidden)ctx.resume().catch(()=>{});

}
const pendingAudio=new Map();
function loadSound(name){
 if(buffers.has(name))return Promise.resolve(true);
 if(pendingAudio.has(name))return pendingAudio.get(name);
 const task=(async()=>{try{const response=await fetch(assetURL('audio/'+name+'.wav'));if(!response.ok)throw Error(name);buffers.set(name,await ctx.decodeAudioData(await response.arrayBuffer()));return true;}catch{return false;}})();
 pendingAudio.set(name,task);return task;
}
function voice(name,loop=false){if(!ctx)return null;if(!buffers.has(name)){void loadSound(name);return null;}const source=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=buffers.get(name);source.loop=loop;gain.gain.value=0;source.connect(gain).connect(pan).connect(master);source.start();return {source,gain,pan};}
/**
 * The shore at the beach corner, synthesised: there is no recording of it, and a loop
 * would repeat. Brown noise through a low-pass is the sea; its level follows a swell
 * that builds, breaks and slides back about every nine seconds, the filter opening as
 * the wave breaks. Over it, now and then: sandpipers' peeps, a tern's call, and the
 * slap of a fish coming down. All of it rises as you near the corner (beach-corner.js)
 * and is fullest when you are sitting in one of its chairs.
 */
let shore=null;
function startShore(){
 const len=ctx.sampleRate*4,buffer=ctx.createBuffer(1,len,ctx.sampleRate),data=buffer.getChannelData(0);
 let last=0;for(let i=0;i<len;i++){last=(last+.02*(Math.random()*2-1))/1.02;data[i]=last*3.2;}
 const sea=ctx.createBufferSource();sea.buffer=buffer;sea.loop=true;
 const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;
 const swell=ctx.createGain();swell.gain.value=0;const out=ctx.createGain();out.gain.value=0;
 sea.connect(filter).connect(swell).connect(out).connect(master);sea.start();
 return {sea,filter,swell,out,level:0,nextBird:ctx.currentTime+2,nextSplash:ctx.currentTime+9};
}
function shoreNote(at,from,to,length,level,type='sine'){
 const osc=ctx.createOscillator(),env=ctx.createGain();osc.type=type;
 osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(to,at+length);
 env.gain.setValueAtTime(.0001,at);env.gain.exponentialRampToValueAtTime(level,at+.012);env.gain.exponentialRampToValueAtTime(.0001,at+length);
 osc.connect(env).connect(shore.out);osc.start(at);osc.stop(at+length+.02);
}
function shoreSplash(at){
 const len=Math.floor(ctx.sampleRate*.25),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(len*.18));
 const src=ctx.createBufferSource(),band=ctx.createBiquadFilter(),env=ctx.createGain();src.buffer=b;band.type='bandpass';band.frequency.value=1400;band.Q.value=.8;env.gain.value=.35;
 src.connect(band).connect(env).connect(shore.out);src.start(at);
 for(let k=0;k<3;k++)shoreNote(at+.12+k*.07+Math.random()*.05,1800+Math.random()*900,1100,.06,.05);
}
function updateShore(player,{inside,paused,relax}){
 const d=Math.hypot(player.x-BEACH_CORNER.x,player.z-BEACH_CORNER.z),near=Math.max(0,1-d/BEACH_CORNER.radius);
 const level=paused||inside?0:relax?.85:near*near*.6;
 if(!shore){if(level<=0)return;shore=startShore();}
 const t=ctx.currentTime;shore.out.gain.setTargetAtTime(level,t,.4);if(level<=0)return;
 // The swell: build for six seconds, break, then slide back.
 const phase=(t%9)/9,build=phase<.66?phase/.66:1-(phase-.66)/.34;
 shore.swell.gain.setTargetAtTime(.25+build*build*.75,t,.25);shore.filter.frequency.setTargetAtTime(380+(phase>.6&&phase<.75?1400:build*500),t,.2);
 if(t>shore.nextBird){
  if(Math.random()<.6){for(let k=0;k<2+Math.floor(Math.random()*3);k++)shoreNote(t+k*.13,3600+Math.random()*500,3000,.08,.07);}
  else shoreNote(t,1500,900,.42,.05,'sawtooth');
  shore.nextBird=t+3+Math.random()*7;
 }
 if(t>shore.nextSplash){shoreSplash(t);shore.nextSplash=t+12+Math.random()*16;}
}
export const townAudio={
  stopSpeech(){speechRequest++;if(speech){try{speech.source.stop();}catch{}speech=null;}},
  async speak(id){
    this.stopSpeech();if(!enabled||!ctx||!id||!/^[a-z0-9-]+$/.test(id))return;
    const request=speechRequest,key='voice/'+id;
    try{
      if(!buffers.has(key)){const response=await fetch(assetURL('audio/voices/'+id+'.wav'));if(!response.ok)return;buffers.set(key,await ctx.decodeAudioData(await response.arrayBuffer()));}
      if(request!==speechRequest||!enabled||document.hidden)return;
      speech=voice(key);if(speech)speech.gain.gain.value=.9;
    }catch{/* The written dialogue remains available if audio cannot load. */}
  },
  setEnabled(value){enabled=value;if(!value)this.stopSpeech();unlockTownAudio();if(master)master.gain.setTargetAtTime(value?.38:0,ctx.currentTime,.1);},
  play(name,volume=.5){if(!enabled||!ctx)return;if(!buffers.has(name)){void loadSound(name).then(ready=>{if(ready)this.play(name,volume);});return;}const v=voice(name);if(v)v.gain.gain.value=volume;},
  // There is no grass recording, so the lawn borrows the stone one at about half the
  // level rather than sounding like a pavement.
  step(surface){this.play('steps-'+(surface==='asphalt'?'asphalt':surface==='wood'||surface==='timber'?'wood':'stone'),surface==='grass'?.13:.27);},
  update({player,yaw=0,minutes=1002,rain=false,inside=false,station=0,paused=false,relax=false}){if(!ctx)return;if(enabled)updateShore(player,{inside,paused,relax});const night=minutes%1440>=1140||minutes%1440<360;
    const sources=[['water',0,-54,.5,95],['cicadas',-28,24,night?0:.25,140],['crickets',-28,24,night?.25:0,140],['engine',6,-42,.27,22],['radio-'+station,-4,-15,.36,22]];
    for(const name of ['radio-0','radio-1','radio-2'])if(name!=='radio-'+station&&loops.has(name))loops.get(name).gain.gain.setTargetAtTime(0,ctx.currentTime,.12);
    for(const [name,x,z,volume,range] of sources){if(!loops.has(name)&&!paused&&volume>0&&Math.hypot(x-player.x,z-player.z)<range){const v=voice(name,true);if(v)loops.set(name,v);}const v=loops.get(name);if(!v)continue;const dx=x-player.x,dz=z-player.z,d=Math.hypot(dx,dz),gain=paused?0:volume*Math.max(0,1-d/range)*(inside?.24:1);v.gain.gain.setTargetAtTime(gain,ctx.currentTime,.2);v.pan.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(d,1))),ctx.currentTime,.2);}
    const train=Math.floor(minutes/8);if(train!==lastTrain){if(lastTrain>=0&&!paused)this.play('train',.16);lastTrain=train;}
  },
  /**
   * A tune on struck bells, synthesised: each note a few inharmonic partials with a hard
   * strike and a long decay, the way a school's chime sounds through a horn speaker.
   * @param {Array<[number,number]>} notes [frequency Hz, start seconds]
   */
  bells(notes,volume=.5){
    if(!enabled||!ctx||ctx.state!=='running')return;
    const out=ctx.createGain();out.gain.value=volume*.55;
    // A horn speaker has no bass and not much top.
    const band=ctx.createBiquadFilter();band.type='bandpass';band.frequency.value=1100;band.Q.value=.55;
    out.connect(band).connect(master);
    const t0=ctx.currentTime+.05;
    for(const [f,at] of notes)for(const [ratio,level,decay] of [[1,1,2.6],[2.76,.32,1.1],[5.4,.12,.5],[.5,.18,3.2]]){
      const osc=ctx.createOscillator(),env=ctx.createGain();osc.type='sine';osc.frequency.value=f*ratio;
      env.gain.setValueAtTime(0,t0+at);env.gain.linearRampToValueAtTime(level,t0+at+.008);env.gain.exponentialRampToValueAtTime(.0005,t0+at+decay);
      osc.connect(env).connect(out);osc.start(t0+at);osc.stop(t0+at+decay+.05);
    }
  },
  /** A dialogue voice blip: one short soft note (dialogue-box.js picks it per speaker). */
  blip(freq,type='sine',volume=.06){
    if(!enabled||!ctx||ctx.state!=='running')return;
    const t=ctx.currentTime,osc=ctx.createOscillator(),env=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(freq,t);
    env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(volume,t+.006);env.gain.exponentialRampToValueAtTime(.0001,t+.06);
    osc.connect(env).connect(master);osc.start(t);osc.stop(t+.07);
  },
  get enabled(){return enabled;}
};

if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(ctx){if(document.hidden){townAudio.stopSpeech();ctx.suspend().catch(()=>{});}else if(enabled)ctx.resume().catch(()=>{});}});
