import {lessonById} from './lektioner.mjs?v=20260930';
import {markHtml as m} from '../../gemensamt/markering.mjs?v=20260928';
import {visual} from './visuals.mjs?v=20260929';
// Stegfilmerna har svensk text och inget ljud. Varje steg visas en bestämd tid; eleven kan pausa, stega och ändra takten.
const STEG=20;
const $=id=>document.getElementById(id);
let lesson=lessonById(new URLSearchParams(location.search).get('del')),scenes=[],time=0,duration=0,raf=0,current=-1,playing=false,last=0;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function configure(){
 pause();scenes=lesson.film.map(id=>lesson.slides.find(s=>s.id===id));duration=scenes.length*STEG;time=0;current=-1;
 $('seek').max=duration;$('film-choice').value=lesson.id;$('film-title').textContent=lesson.filmTitle;
 $('transcript').innerHTML=scenes.map((s,i)=>`<section><h2>${i+1}. ${m(s.title)}</h2>${s.body.map(t=>`<p>${m(t)}</p>`).join('')}${s.formula?`<p>${m(s.formula)}</p>`:''}</section>`).join('');
 $('film-lab').href=`../../vaxelstromslabbet/?lage=guidad&del=${lesson.id}`;$('film-ovning').href=`Formelstod_och_ovningar.html?del=v40_0${lesson.number}`;$('film-theory').href=`Genomgang.html?del=${lesson.id}`;
 $('film-status').textContent='Tryck Spela eller gå ett steg i taget. Pausa när du behöver räkna.';
 history.replaceState(null,'',`?del=${lesson.id}`);draw();
}
const at=i=>i*STEG;
function draw(){
 if(!scenes.length)return;
 const i=Math.min(scenes.length-1,Math.floor(time/STEG)),s=scenes[i];
 if(i!==current){current=i;$('film-stage').innerHTML=`<p class="ac-kicker">STEG ${i+1} AV ${scenes.length}</p><h2>${m(s.title)}</h2>${s.visual?'<div class="lesson-visual"></div>':''}<div class="film-caption">${s.body.map(t=>`<p>${m(t)}</p>`).join('')}${s.formula?`<p><strong>${m(s.formula)}</strong></p>`:''}</div>`;}
 const el=$('film-stage').querySelector('.lesson-visual');
 if(el)el.innerHTML=visual(s.visual,el.clientWidth,matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,(time-at(i))/STEG));
 $('time').textContent=`${fmt(time)} / ${fmt(duration)}`;$('seek').value=time;$('back').disabled=i===0;$('forward').disabled=i===scenes.length-1;
}
function tick(now){
 if(!playing)return;
 time=Math.min(duration,time+(now-last)/1000*Number($('speed').value));last=now;draw();
 if(time>=duration){pause();$('film-status').textContent='Filmen är klar. Nästa steg: övningarna.';return;}
 raf=requestAnimationFrame(tick);
}
function pause(){playing=false;cancelAnimationFrame(raf);$('play').textContent='Spela';$('play').setAttribute('aria-pressed','false');}
function seek(t){time=Math.max(0,Math.min(duration,t));draw();}
$('play').addEventListener('click',()=>{
 if(playing)return pause();if(time>=duration)seek(0);
 playing=true;last=performance.now();$('play').textContent='Pausa';$('play').setAttribute('aria-pressed','true');
 $('film-status').textContent='Filmen spelas. Du kan pausa eller välja nästa steg.';raf=requestAnimationFrame(tick);
});
$('seek').addEventListener('input',e=>seek(Number(e.target.value)));
$('back').addEventListener('click',()=>{pause();seek(at(Math.max(0,current-1)));});
$('forward').addEventListener('click',()=>{pause();seek(at(Math.min(scenes.length-1,current+1)));});
$('film-choice').addEventListener('change',e=>{lesson=lessonById(e.target.value);configure();});
window.addEventListener('pagehide',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});new ResizeObserver(()=>draw()).observe($('film-stage'));
configure();
