import {lessonById} from './lektioner.mjs?v=20260925-ac2';
import {visual} from './visuals.mjs?v=20260925-ac2';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
let lesson=lessonById(params.get('del')),index=Math.max(0,lesson.slides.findIndex(s=>s.id===params.get('avsnitt')));
function body(s){return `<ul>${s.body.map(t=>`<li>${t}</li>`).join('')}</ul>${s.formula?`<p class="formula">${s.formula}</p>`:''}`;}
function render(){const s=lesson.slides[index];$('lesson').value=lesson.id;$('section').innerHTML=lesson.slides.map((s,i)=>`<option value="${i}">${i+1}. ${s.title}</option>`).join('');$('section').value=index;
 $('slide').innerHTML=`<p class="ac-kicker">DEL ${lesson.number} · ${s.advanced?'FÖRDJUPNING':'GRUNDDEL'}</p><h1>${s.title}</h1>${body(s)}${s.visual?'<div class="lesson-visual"></div>':''}${s.check?`<p><strong>${s.check}</strong></p><details class="answer-details"><summary>Visa förklaring</summary><p>${s.answer}</p></details>`:''}`;
 draw();$('previous').disabled=index===0;$('next').disabled=index===lesson.slides.length-1;$('count').textContent=`Avsnitt ${index+1} av ${lesson.slides.length}`;
 $('lab-link').href=`../../vaxelstromslabbet/?lage=guidad&del=${lesson.id}`;$('film-link').href=`Kortfilmer.html?del=${lesson.id}`;$('deck-link').href=lesson.deck;
 $('print-lesson').innerHTML=`<h1>${lesson.title}</h1>`+lesson.slides.map(s=>`<section><h2>${s.title}</h2>${body(s)}${s.check?`<p>${s.check}</p>`:''}</section>`).join('');history.replaceState(null,'',`?del=${lesson.id}&avsnitt=${s.id}`);document.title=`${s.title} · Sjöskolan`;
}
function draw(){const el=$('slide').querySelector('.lesson-visual');if(el)el.innerHTML=visual(lesson.slides[index].visual,el.clientWidth);}
$('lesson').addEventListener('change',e=>{lesson=lessonById(e.target.value);index=0;render();});$('section').addEventListener('change',e=>{index=Number(e.target.value);render();});$('previous').addEventListener('click',()=>{index--;render();});$('next').addEventListener('click',()=>{index++;render();});$('print').addEventListener('click',()=>window.print());new ResizeObserver(draw).observe($('slide'));render();
