import {FacePose} from './tracking.mjs';
import {actorFrame,normalizeTake,sampleTake} from './takes.mjs';
/** Browser-local capture. Camera and microphone are only opened by explicit UI actions. */
export function createActingSession({video,onFrame=()=>{},onStatus=()=>{},onTake=()=>{},getControls=()=>({}),onState=()=>{}}){
 let disposed=false,camera=null,mic=null,worker=null,ready=false,busy=false,cameraToken=0,audioToken=0,raf=0,timer=0;
 let context=null,source=null,analyser=null,samples=null,audio=null,audioURL=null,level=0,recording=null,playback=null,lastFrame=null;
 let sent=0,lastVideo=-1,lastTick=performance.now();const tracker=new FacePose(),options={mirror:true,sensitivity:1.5,smoothing:.45};
 const notify=()=>onState({camera:!!camera,microphone:!!mic,audio:!!audio,recording:!!recording,playing:!!playback});
 function stopCamera(){cameraToken++;clearTimeout(timer);camera?.getTracks().forEach(t=>t.stop());camera=null;worker?.terminate();worker=null;ready=false;busy=false;video.pause?.();video.srcObject=null;tracker.reset();onFrame(null);notify();}
 function clearAudio(){audioToken++;mic?.getTracks().forEach(t=>t.stop());mic=null;audio?.pause();audio=null;source?.disconnect();source=null;analyser=null;samples=null;const old=context;context=null;old?.close().catch(()=>{});if(audioURL)URL.revokeObjectURL(audioURL);audioURL=null;level=0;notify();}
 function stopPlayback(){playback=null;notify();}
 async function startCamera(){
  stopPlayback();stopCamera();const token=cameraToken;let stream;
  if(!navigator.mediaDevices?.getUserMedia||!globalThis.Worker){onStatus('Camera tracking requires a secure browser with camera support.');return;}
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
   if(disposed||token!==cameraToken){stream.getTracks().forEach(t=>t.stop());return;}
   camera=stream;video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();
   if(disposed||token!==cameraToken){stream.getTracks().forEach(t=>t.stop());return;}
   const active=worker=new Worker(new URL('./tracking-worker.js',import.meta.url));
   active.onmessage=({data})=>{if(worker!==active)return;if(data.type==='ready'){clearTimeout(timer);ready=true;onStatus('Camera ready. Look forwards with a relaxed face, then Calibrate.');}
    if(data.type==='result')tracker.update(data.result,performance.now());if(data.type==='consumed')busy=false;
    if(data.type==='error'){stopCamera();onStatus(data.message);}};
   active.onerror=()=>{if(worker===active){stopCamera();onStatus('Face tracking could not start. Restart the camera to try again.');}};
   timer=setTimeout(()=>{stopCamera();onStatus('Face tracking timed out. Check your connection and try again.');},20000);
   active.postMessage({type:'init'});notify();onStatus('Loading face tracking…');
  }catch(e){stream?.getTracks().forEach(t=>t.stop());if(!disposed&&token===cameraToken){stopCamera();onStatus(e?.name==='NotAllowedError'?'Camera permission was declined. Import and replay still work.':'The camera could not start. Check its connection and permission.');}}
 }
 async function setupAudio(token,make){
  const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AudioContext)throw Error('Audio unsupported');
  const ctx=new AudioContext();context=ctx;await ctx.resume();if(disposed||token!==audioToken){await ctx.close();return false;}
  analyser=ctx.createAnalyser();analyser.fftSize=512;samples=new Float32Array(512);source=make(ctx);source.connect(analyser);return true;
 }
 async function startMicrophone(){stopPlayback();clearAudio();const token=audioToken;let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(disposed||token!==audioToken){stream.getTracks().forEach(t=>t.stop());return;}
   mic=stream;if(!await setupAudio(token,ctx=>ctx.createMediaStreamSource(stream))){stream.getTracks().forEach(t=>t.stop());return;}notify();onStatus('Microphone drives the mouth. It is not played through your speakers.');
  }catch{stream?.getTracks().forEach(t=>t.stop());if(!disposed&&token===audioToken){clearAudio();onStatus('The microphone could not start. Check permission and try again.');}}
 }
 async function playAudio(file){stopPlayback();clearAudio();if(!file||file.size>50e6){onStatus('Choose an audio file smaller than 50 MB.');return;}const token=audioToken;
  try{audioURL=URL.createObjectURL(file);const element=audio=new Audio(audioURL);if(!await setupAudio(token,ctx=>ctx.createMediaElementSource(element)))return;
   analyser.connect(context.destination);element.onended=()=>{if(audio===element){clearAudio();onFrame(null);onStatus('Audio finished.');}};await element.play();notify();onStatus('Dialogue audio drives mouth opening.');
  }catch{if(token===audioToken){clearAudio();onStatus('The audio file could not play. Try another format.');}}
 }
 function sample(now,dt){
  if(playback){const p=playback,out=sampleTake(p.take,(now-p.start)/1000,{loop:p.loop});if(!p.loop&&now-p.start>=p.take.duration*1000){playback=null;notify();onStatus('Take finished. Last frame held.');}return out;}
  let out={...getControls()};const s=tracker.sample(now,dt,options),p=s.params,w=s.weight;
  if(w>0)out={...out,head:[p.angleY,p.angleX,p.angleZ].map(v=>v*Math.PI/180*w),look:[p.gazeX,-p.gazeY].map(v=>v*w),blinkL:(1-Math.min(1,p.eyeLOpen))*w,blinkR:(1-Math.min(1,p.eyeROpen))*w,talk:p.mouthOpen*w,brow:p.browY*w,smile:p.mouthForm*w};
  if(analyser){analyser.getFloatTimeDomainData(samples);let sum=0;for(const v of samples)sum+=v*v;const target=Math.min(1,Math.max(0,(Math.sqrt(sum/samples.length)-.008)*10));level+=(target-level)*(1-Math.exp(-dt/.055));out.talk=level;}
  return actorFrame(out);
 }
 function tick(now){if(disposed)return;raf=requestAnimationFrame(tick);if(document.hidden)return;
  if(camera&&ready&&!busy&&video.readyState>=2&&video.currentTime!==lastVideo&&now-sent>1000/24){busy=true;sent=now;lastVideo=video.currentTime;const active=worker;
   createImageBitmap(video).then(bitmap=>{if(disposed||active!==worker){bitmap.close();return;}active.postMessage({type:'frame',frame:bitmap,time:now},[bitmap]);}).catch(()=>{busy=false;});}
  if(now-lastTick<1000/30)return;const dt=Math.min(.1,(now-lastTick)/1000);lastTick=now;
  if(camera||analyser||playback||recording){lastFrame=sample(now,dt);onFrame(lastFrame);if(recording){const t=Math.min(60,(now-recording.start)/1000);if(t>recording.frames.at(-1).t)recording.frames.push({...lastFrame,t});if(t>=60)stopRecording();}}
 }
 function startRecording(name){stopPlayback();const now=performance.now();recording={name:name||'Actor take',start:now,frames:[actorFrame(sample(now,0),0)]};notify();onStatus('Recording performance, up to 60 seconds.');}
 function stopRecording(){if(!recording)return;const r=recording;recording=null;notify();if(r.frames.length<2){onStatus('Record a longer take before saving.');return;}const take=normalizeTake({format:'johansson-actor-take',version:1,name:r.name,frames:r.frames});onTake(take);onStatus('Take recorded. Replay, save or download it.');return take;}
 function play(take,loop=false){const normal=normalizeTake(take);stopRecording();stopCamera();clearAudio();playback={take:normal,start:performance.now(),loop};notify();}
 function visibility(){if(document.hidden){stopRecording();stopPlayback();stopCamera();clearAudio();onStatus('Acting stopped while the page is hidden.');}}
 document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(tick);
 return {startCamera,stopCamera,startMicrophone,stopAudio(){clearAudio();onFrame(null);},playAudio,startRecording,stopRecording,play,stopPlayback,
  hold(){const held=lastFrame;stopPlayback();stopRecording();stopCamera();clearAudio();if(held)onFrame(held);},
  calibrate(){onStatus(tracker.calibrate(performance.now())?'Neutral face calibrated.':'Look into the camera before calibrating.');},
  configure(values){Object.assign(options,values);video.style.transform=options.mirror?'scaleX(-1)':'';},
  get recording(){return !!recording;},get playing(){return !!playback;},
  dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);recording=null;playback=null;stopCamera();clearAudio();}
 };
}
