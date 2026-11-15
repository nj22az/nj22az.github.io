/* The homepage's street, painted live: the game's own film of the harbour road (tools/office-painting/), drawn frame
 * by frame through Pocket Camera's engine, so the Look on the page is the Look in the camera. Loaded only when motion
 * is welcome and WebGL2 is there (office-painting.js); any failure leaves the painted still, which is the same street. */
import {createLookEngine,normalRecipe} from '/camera/looks-gl.js?v=20261115';

const FILM='/assets/office-painting/street';
const LOOKS=['print','watercolour','sketchbook','manga','cyanotype','natural'];
const engineLook=name=>name==='natural'?'none':name;
const wait=(test,ms)=>new Promise((ok,no)=>{const t0=performance.now();(function poll(){if(test())ok();else if(performance.now()-t0>ms)no(Error('timed out'));else setTimeout(poll,80);})();});

export async function start({figure,stage,canvas,look}){
 const dpr=Math.min(devicePixelRatio||1,2),small=stage.getBoundingClientRect().width*dpr<1100;
 const engine=createLookEngine(canvas,{light:small||matchMedia('(pointer: coarse)').matches});
 // The film opens with the shop's shutter going up at nine, then loops the open street from loopAt (street.json).
 const meta=await fetch(FILM+'.json?v=20261115').then(r=>{if(!r.ok)throw Error('film');return r.json();});
 const video=document.createElement('video');
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');
 // H.264 where it plays (Safari, Chrome, Edge, Firefox); VP9 otherwise (open-source Chromium).
 const mp4=video.canPlayType('video/mp4; codecs="avc1.640028"');
 video.src=FILM+(small?'-800':'-1280')+(mp4?'.mp4':'.webm')+'?v=20261115';
 await new Promise((ok,no)=>{video.addEventListener('loadeddata',ok,{once:true});video.addEventListener('error',()=>no(Error('film')),{once:true});setTimeout(()=>no(Error('film timed out')),20000);});
 function fit(){const r=stage.getBoundingClientRect(),k=Math.min(1,video.videoWidth/Math.max(1,r.width*dpr)),w=Math.max(2,Math.round(r.width*dpr*k)),h=Math.max(2,Math.round(r.height*dpr*k));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
 fit();
 let current=look(),recipe=normalRecipe({layers:[{look:engineLook(current)}]});
 engine.warm([engineLook(current)]);
 await wait(()=>engine.isReady(engineLook(current)),20000);
 // The rest compile in the background, so a brush is ready when it is chosen.
 engine.warm(LOOKS.map(engineLook));
 function draw(){if(engine.lost())return false;engine.setSource('film',video,video.videoWidth,video.videoHeight);return !!engine.draw(recipe,{source:'film'});}
 if(!draw())throw Error('The first frame could not be painted');
 await video.play();
 figure.setAttribute('data-live','');
 let running=true,onScreen=true;
 const frame=video.requestVideoFrameCallback?cb=>video.requestVideoFrameCallback(cb):cb=>requestAnimationFrame(cb);
 // The jump back to loopAt is hidden by the film itself: its last frames are mixed into the ones before loopAt.
 const end=meta.duration-1.5/meta.fps;
 function wrap(time){if(time>=end){video.currentTime=meta.loopAt;return true;}return false;}
 video.addEventListener('ended',()=>{video.currentTime=meta.loopAt;video.play().catch(()=>{});});
 (function loop(now,frameInfo){if(!running)return;if(!wrap(frameInfo?.mediaTime??video.currentTime)&&onScreen&&!document.hidden&&!video.paused&&!draw()&&engine.lost()){stop();return;}frame(loop);})();
 function stop(){running=false;video.pause();figure.removeAttribute('data-live');}
 function resume(){if(!running)return;if(onScreen&&!document.hidden)video.play().catch(()=>{});else video.pause();}
 new IntersectionObserver(e=>{onScreen=e[0].isIntersecting;resume();},{threshold:.05}).observe(stage);
 document.addEventListener('visibilitychange',resume);
 new ResizeObserver(()=>{fit();draw();}).observe(stage);
 canvas.addEventListener('webglcontextlost',stop);
 return {
  video,
  prepare:name=>wait(()=>engine.isReady(engineLook(name)),20000),
  /** The painting as it is this moment, to be brushed away: drawn now, so it can be copied in the same task. */
  snapshot(){draw();return canvas;},
  use(name){current=name;recipe=normalRecipe({layers:[{look:engineLook(name)}]});draw();}
 };
}
