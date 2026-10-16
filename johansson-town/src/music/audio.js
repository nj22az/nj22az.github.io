/** Offline-capable original accompaniment and a small formant singing synthesiser.
 * No speechSynthesis: every vowel follows a scored pitch. The stylised voice is deliberately robotic.
 * Schedule only 180 ms ahead, so exit, mute, backgrounding and interruption never leave queued songs playing.
 */
import {singingPart} from './songs.js';
const freq=n=>440*2**((n-69)/12);
const FORMANTS={a:[800,1150,2900],e:[450,1900,2600],i:[300,2200,3000],o:[450,800,2800],u:[325,700,2500],y:[300,2200,3000]};
export function createConcertAudio({Context=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let ctx=null,out=null,score=null,origin=0,nextBeat=0,nextVoice=0,cast=[],on=false,muted=false,generation=0;
 const sources=new Set();
 function source(node,at,duration){sources.add(node);node.onended=()=>{sources.delete(node);node.disconnect();};node.start(at);node.stop(at+duration);return node;}
 function envelope(at,duration,level){const g=ctx.createGain();g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+Math.max(.03,duration));g.connect(out);return g;}
 function tone(at,n,d,level,type='sine',slide=null){const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(freq(n),at);if(slide!==null)o.frequency.exponentialRampToValueAtTime(freq(slide),at+d);o.connect(envelope(at,d,level));source(o,at,d+.03);}
 function noise(at,d,level,high=1800){const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*d),ctx.sampleRate),v=b.getChannelData(0);for(let i=0;i<v.length;i++)v[i]=(Math.random()*2-1);const s=ctx.createBufferSource(),f=ctx.createBiquadFilter();s.buffer=b;f.type='highpass';f.frequency.value=high;s.connect(f).connect(envelope(at,d,level));source(s,at,d+.03);}
 function voice(s,index){
  const at=origin+s.start,d=Math.max(.06,s.duration),f=FORMANTS[s.vowel]||FORMANTS.a,o=ctx.createOscillator();o.type='sawtooth';
  // A different register and formant size for each member; no copied character voices.
  const register=(cast[index]?.body?.silhouette==='feminine'?12:0)+(index>1?3:0),pitch=freq(s.note+register);
  o.frequency.setValueAtTime(pitch*.98,at);o.frequency.exponentialRampToValueAtTime(pitch,at+.03);
  o.frequency.setValueAtTime(pitch,at+d*.7);o.frequency.linearRampToValueAtTime(pitch*1.012,at+d);
  const g=envelope(at,d,.047/Math.sqrt(cast.length));
  for(let k=0;k<3;k++){const filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='bandpass';filter.frequency.value=f[k]*(register?1.12:1);filter.Q.value=5+k;gain.gain.value=[.6,.3,.13][k];o.connect(filter).connect(gain).connect(g);}
  source(o,at,d+.03);
  // Short unvoiced onsets and tails articulate the scored vowels. This is a stylised grapheme voice,
  // not a general English pronunciation engine: the visible words remain the reliable lyrics.
  const consonant=(letters,time)=>{if(!letters)return;
   if(/[sfhxz]|sh|ch|th/.test(letters))noise(time,Math.min(.07,d*.23),.012/Math.sqrt(cast.length),/sh|ch/.test(letters)?2300:4500);
   else if(/[ptkbdg]/.test(letters))noise(time,.018,.018/Math.sqrt(cast.length),1000);
   else if(/[mnlr]/.test(letters))tone(time,s.note+register-12,Math.min(.08,d*.25),.017/Math.sqrt(cast.length),'triangle');
  };
  consonant(s.onset,at);consonant(s.coda,at+d*.78);
 }
 function percussion(b,at){
  if(b<4){tone(at,84,.055,.035,'sine');return;}
  if(b>=36){if(b===36)for(let i=0;i<12;i++)noise(at+i*.075,.09,.024,900);return;}
  const bar=Math.floor((b-4)/4),root=score.style.base+[0,5,7,0][bar%4]-24;
  if(b%2===0)tone(at,38,.16,.15,'sine',15);
  if(b%4===2)noise(at,.10,.055,1000);
  noise(at,.035,.018,6500);
  tone(at,root+(b%2?12:0),score.beat*.72,.075,'triangle');
  if(b%4===0)for(const interval of [12,16,19])tone(at,root+interval,score.beat*3.5,.019,score.style.wave);
  if(score.song.style==='disco')tone(at+score.beat/2,root+36+(b%2?7:0),.08,.018,'square');
 }
 function stop(){generation++;on=false;for(const node of sources){try{node.stop();}catch{}node.disconnect();}sources.clear();if(out&&ctx){out.disconnect();out=null;}score=null;}
 return {
  async start(next,recipes,{silent=false}={}){
   stop();const token=generation;score=next;cast=recipes.length?recipes:[{}];muted=silent;
   if(!Context)return false;
   ctx??=new Context();out=ctx.createGain();out.gain.value=muted?0:.72;out.connect(ctx.destination);
   try{await ctx.resume();}catch{if(token===generation)stop();return false;}
   if(token!==generation||!score||ctx.state!=='running')return false;
   origin=ctx.currentTime+.10;nextBeat=0;nextVoice=0;on=true;return true;
  },
  update(){if(!on||!score||ctx.state!=='running')return;
   const edge=ctx.currentTime+.18;
   while(nextBeat<40&&origin+nextBeat*score.beat<edge){const at=origin+nextBeat*score.beat;if(at>=ctx.currentTime-.05)percussion(nextBeat,at);nextBeat++;}
   while(nextVoice<score.syllables.length&&origin+score.syllables[nextVoice].start<edge){const s=score.syllables[nextVoice++];if(origin+s.start<ctx.currentTime-.05)continue;for(let i=0;i<cast.length;i++)if(singingPart(s.line,i,cast.length))voice(s,i);}
  },
  get elapsed(){return on?Math.max(0,ctx.currentTime-origin):0;},
  get running(){return on&&ctx?.state==='running';},
  mute(value){muted=!!value;if(out)out.gain.setTargetAtTime(muted?0:.72,ctx.currentTime,.025);},
  stop,
  dispose(){stop();void ctx?.close().catch(()=>{});ctx=null;},
 };
}
