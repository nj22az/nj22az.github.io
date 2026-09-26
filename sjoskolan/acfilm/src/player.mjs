import {Helios,NoopDriver,ManualTicker} from '@helios-project/core';
import timeline from './timeline.json' with {type:'json'};
import {createFilm,paint} from './film.mjs';
const $=s=>document.querySelector(s),canvas=$('#film'),ctx=canvas.getContext('2d'),voice=$('#narration'),music=$('#music');
const film=createFilm(timeline),env={W:1920,H:1080,scale:1,cache:new Map(),canvas(w,h){const a=document.createElement('canvas');a.width=w;a.height=h;return {canvas:a,ctx:a.getContext('2d')}}};
const helios=new Helios({duration:timeline.duration,fps:30,width:1920,height:1080,driver:new NoopDriver(),ticker:new ManualTicker()});
window.helios=helios;
let ready=false,captions=true,playing=false,raf=0,lastScene='',lastCaption='',lastSync=0;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function draw(time){
 if(!ready)return;
 paint(film,timeline,ctx,Math.round(time*30),env,captions);
 const s=timeline.scenes.find(s=>time>=s.start&&time<s.start+s.duration)||timeline.scenes.at(-1);
 $('#position').textContent=`${fmt(time)} / ${fmt(timeline.duration)}`;$('#seek').value=time;
 if(lastScene!==s.id){lastScene=s.id;$('#scene-title').textContent=s.title;$('#slide-reference').textContent=`Lesson ${s.chapter+1} · Extended revision`;canvas.setAttribute('aria-label',`${s.title}. ${s.key.replace(/_\{([^{}]*)\}/g,' $1')}`);document.querySelectorAll('#chapters button').forEach(b=>{if(Number(b.dataset.chapter)===s.chapter)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});history.replaceState(null,'',`#${s.id}`);}
 const cue=timeline.captions.find(q=>time>=q.start&&time<q.end);
 if((cue?.text||'')!==lastCaption){lastCaption=cue?.text||'';$('#spoken-text').textContent=lastCaption;}
}
helios.subscribe(state=>draw(state.currentFrame/30));
window.renderAt=t=>{helios.seek(Math.round(Math.max(0,Math.min(t,timeline.duration))*30));draw(t)};
function frame(now){
 if(!playing)return;
 helios.seek(Math.round(voice.currentTime*30));
 if(now-lastSync>500){if(Math.abs(music.currentTime-voice.currentTime)>.18)music.currentTime=voice.currentTime;lastSync=now;}
 raf=requestAnimationFrame(frame);
}
function pause(){playing=false;voice.pause();music.pause();cancelAnimationFrame(raf);$('#play').textContent='Play';$('#play').setAttribute('aria-pressed','false')}
async function play(){
 if(!ready)return;if(voice.currentTime>=timeline.duration-.1)seek(0);
 try{await Promise.all([voice.play(),music.play()]);playing=true;$('#play').textContent='Pause';$('#play').setAttribute('aria-pressed','true');$('#status').textContent='';raf=requestAnimationFrame(frame)}
 catch(e){pause();$('#status').textContent='Audio could not start. Press Play again or check your connection.';}
}
function seek(t){t=Math.max(0,Math.min(t,timeline.duration-.04));voice.currentTime=t;music.currentTime=t;helios.seek(Math.round(t*30));draw(t)}
$('#play').addEventListener('click',()=>playing?pause():play());$('#seek').max=timeline.duration;$('#seek').addEventListener('input',e=>seek(Number(e.target.value)));
$('#back').addEventListener('click',()=>seek(voice.currentTime-10));$('#forward').addEventListener('click',()=>seek(voice.currentTime+10));
$('#captions').addEventListener('change',e=>{captions=e.target.checked;draw(voice.currentTime)});
$('#music-enabled').addEventListener('change',e=>music.muted=!e.target.checked);
$('#voice-enabled').addEventListener('change',e=>voice.muted=!e.target.checked);
$('#volume').addEventListener('input',e=>{voice.volume=Number(e.target.value);music.volume=Number(e.target.value)});
$('#speed').addEventListener('change',e=>{voice.playbackRate=Number(e.target.value);music.playbackRate=Number(e.target.value)});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#viewer').requestFullscreen()}catch{$('#status').textContent='Full screen is not available here. Use your browser’s full-screen mode.'}});
voice.addEventListener('ended',pause);voice.addEventListener('waiting',()=>music.pause());voice.addEventListener('playing',()=>{if(playing){music.currentTime=voice.currentTime;music.play().catch(()=>{})}});
for(const a of [voice,music])a.addEventListener('error',()=>{pause();$('#status').textContent='An audio file could not be loaded. Reload the page to try again.'});
$('#viewer').addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON','A'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();playing?pause():play()}if(e.code==='ArrowRight'){e.preventDefault();seek(voice.currentTime+10)}if(e.code==='ArrowLeft'){e.preventDefault();seek(voice.currentTime-10)}});
const chapterList=$('#chapters');timeline.chapters.forEach((name,i)=>{const s=timeline.scenes.find(s=>s.chapter===i),b=document.createElement('button');b.type='button';b.dataset.chapter=i;b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><strong></strong><time>${fmt(s.start)}</time>`;b.querySelector('strong').textContent=name;b.addEventListener('click',()=>{seek(s.start);});chapterList.append(b)});
const transcript=$('#transcript');timeline.scenes.forEach(s=>{const section=document.createElement('section'),h=document.createElement('h3'),p=document.createElement('p'),b=document.createElement('button');h.textContent=s.title;p.textContent=s.say;b.textContent=`Play from ${fmt(s.start)}`;b.type='button';b.addEventListener('click',()=>{seek(s.start);play();$('#viewer').scrollIntoView({block:'start'})});section.append(h,p,b);transcript.append(section)});
await Promise.all([document.fonts.load('400 36px "Film Sans"'),document.fonts.load('700 36px "Film Sans"')]);ready=true;
const initial=timeline.scenes.find(s=>s.id===location.hash.slice(1));window.renderAt(initial?.start||0);if(initial){voice.currentTime=initial.start;music.currentTime=initial.start;}
$('#play').disabled=false;$('#status').textContent='Ready. Press Play for the film and audio.';
window.addEventListener('pagehide',pause);

