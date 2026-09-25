import {lessonById} from './lektioner.mjs?v=20260925-ac2';
import {visual} from './visuals.mjs?v=20260925-ac2';
const $=id=>document.getElementById(id),audio=$('film-audio');
let lesson=lessonById(new URLSearchParams(location.search).get('del')),scenes=[],timeline={},time=0,duration=120,raf=0,current=-1;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function configure(){
 pause();scenes=lesson.film.map(id=>lesson.slides.find(s=>s.id===id));duration=timeline[lesson.id]?.duration||120;time=0;current=-1;
 audio.src=`film-audio/${lesson.id}.mp3?v=20260925-ac2`;audio.playbackRate=Number($('speed').value);audio.muted=!$('voice').checked;
 $('seek').max=duration;$('film-choice').value=lesson.id;$('film-title').textContent=lesson.filmTitle;
 $('transcript').innerHTML=scenes.map((s,i)=>`<section><h2>${i+1}. ${s.title}</h2>${s.body.map(t=>`<p>${t}</p>`).join('')}${s.formula?`<p>${s.formula}</p>`:''}<details><summary>Engelsk berättarröst</summary><p lang="en-GB">${esc(timeline[lesson.id]?.scenes[i]?.say||'')}</p></details></section>`).join('');
 $('film-lab').href=`../../vaxelstromslabbet/?lage=guidad&del=${lesson.id}`;$('film-theory').href=`Genomgang.html?del=${lesson.id}`;
 $('film-status').textContent='Tryck Spela eller gå ett steg i taget. Pausa när du behöver räkna.';
 history.replaceState(null,'',`?del=${lesson.id}`);draw();
}
function at(i){return timeline[lesson.id]?.scenes[i]?.start??i*20;}
function draw(){
 if(!scenes.length)return;
 const i=Math.max(0,scenes.findLastIndex((_,j)=>time>=at(j))),s=scenes[i];
 if(i!==current){current=i;$('film-stage').innerHTML=`<p class="ac-kicker">STEG ${i+1} AV ${scenes.length}</p><h2>${s.title}</h2>${s.visual?'<div class="lesson-visual"></div>':''}<div class="film-caption">${s.body.map(t=>`<p>${t}</p>`).join('')}${s.formula?`<p><strong>${s.formula}</strong></p>`:''}</div>`;}
 const el=$('film-stage').querySelector('.lesson-visual');
 if(el)el.innerHTML=visual(s.visual,el.clientWidth,matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,(time-at(i))/(timeline[lesson.id]?.scenes[i]?.duration||20)));
 $('time').textContent=`${fmt(time)} / ${fmt(duration)}`;$('seek').value=time;$('back').disabled=i===0;$('forward').disabled=i===scenes.length-1;
}
function tick(){if(audio.paused)return;time=Math.min(duration,audio.currentTime);draw();raf=requestAnimationFrame(tick);}
function pause(){audio.pause();cancelAnimationFrame(raf);$('play').textContent='Spela';$('play').setAttribute('aria-pressed','false');}
function seek(t){time=Math.max(0,Math.min(duration,t));audio.currentTime=time;draw();}
$('play').addEventListener('click',async()=>{
 if(!audio.paused)return pause();if(time>=duration)seek(0);
 try{audio.currentTime=time;await audio.play();$('play').textContent='Pausa';$('play').setAttribute('aria-pressed','true');$('film-status').textContent='Filmen spelas. Du kan pausa eller välja nästa steg.';cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
 catch{$('film-status').textContent='Ljudet kunde inte spelas. Försök igen eller använd Nästa steg och textversionen.';pause();}
});
$('seek').addEventListener('input',e=>seek(Number(e.target.value)));
$('back').addEventListener('click',()=>{pause();seek(at(Math.max(0,current-1)));});
$('forward').addEventListener('click',()=>{pause();seek(at(Math.min(scenes.length-1,current+1)));});
$('film-choice').addEventListener('change',e=>{lesson=lessonById(e.target.value);configure();});
$('speed').addEventListener('change',()=>{audio.playbackRate=Number($('speed').value);});
$('voice').addEventListener('change',()=>{audio.muted=!$('voice').checked;});
 audio.addEventListener('ended',()=>{time=duration;pause();draw();$('film-status').textContent='Filmen är klar. Prova nu motsvarande uppgift i den guidade labben.';});
 audio.addEventListener('error',()=>{pause();$('film-status').textContent='Ljudfilen kunde inte hämtas. Du kan fortfarande läsa och gå mellan filmens sex steg.';});
window.addEventListener('pagehide',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});new ResizeObserver(()=>draw()).observe($('film-stage'));
try{const response=await fetch('film-audio/timeline.json?v=20260925-ac2');if(!response.ok)throw Error('timeline');timeline=await response.json();}catch{$('film-status').textContent='Tidsinformationen kunde inte hämtas. Textversionen finns kvar.';}
configure();
