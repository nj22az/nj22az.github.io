import {lessonById} from './lektioner.mjs?v=20260925-ac2';
import {visual} from './visuals.mjs?v=20260925-ac2';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
let lesson=lessonById(params.get('del')),index=Math.max(0,lesson.slides.findIndex(s=>s.id===params.get('avsnitt')));
// Genomgångens fem delar enligt DESIGN.md, plus fördjupning
const KINDS=[['mal','Det här ska du kunna'],['teori','Så fungerar det'],['exempel','Genomräknat exempel'],['prova','Prova själv'],['labb','Använd det i labben'],['fordjupning','Fördjupning']];
function kind(s){if(s.advanced)return'fordjupning';if(s.id==='mal')return'mal';if(s.id==='exempel')return'exempel';if(s.id==='eget'||s.id==='klart')return'prova';if(['labb','matarna','protokoll'].includes(s.id))return'labb';return'teori';}
function route(cur){return `<ol class="sj-steps lesson-route" aria-label="Genomgångens delar">${KINDS.filter(([k])=>lesson.slides.some(x=>kind(x)===k)).map(([k,t],i)=>{const first=lesson.slides.findIndex(x=>kind(x)===k);return `<li${k===cur?' aria-current="step"':''}><a href="?del=${lesson.id}&amp;avsnitt=${lesson.slides[first].id}" data-go="${first}"><b>${k==='fordjupning'?'+':i+1}</b>${t}</a></li>`;}).join('')}</ol>`;}
function body(s){return `<ul>${s.body.map(t=>`<li>${t}</li>`).join('')}</ul>${s.formula?`<p class="formula">${s.formula}</p>`:''}`;}
function render(){const s=lesson.slides[index];$('lesson').value=lesson.id;$('section').innerHTML=lesson.slides.map((s,i)=>`<option value="${i}">${i+1}. ${s.title}</option>`).join('');$('section').value=index;
 const k=kind(s),kt=KINDS.find(x=>x[0]===k)[1];
 $('route').innerHTML=route(k);
 $('slide').className=`lesson-stage${s.visual?' has-visual':''}`;
 $('slide').innerHTML=`<div class="lesson-text"><p class="ac-kicker">DEL ${lesson.number} · ${kt.toUpperCase()}</p><h1>${s.title}</h1>${body(s)}${s.check?`<p class="lesson-check"><strong>Prova själv:</strong> ${s.check}</p><details class="answer-details"><summary>Visa förklaring</summary><p>${s.answer}</p></details>`:''}${k==='labb'?`<p class="lesson-check">Det här gör du i den guidade labben i slutet av veckan, när du har gått igenom del 1–3. <a href="../../vaxelstromslabbet/?lage=guidad&amp;del=${lesson.id}">Titta på labbuppgiften</a></p>`:''}</div>${s.visual?'<div class="lesson-visual"></div>':''}`;
 draw();$('previous').disabled=index===0;$('next').disabled=index===lesson.slides.length-1;$('count').textContent=`Avsnitt ${index+1} av ${lesson.slides.length}`;
 $('lab-link').href=`../../vaxelstromslabbet/?lage=guidad&del=${lesson.id}`;$('film-link').href=`Kortfilmer.html?del=${lesson.id}`;$('artikel-link').href=`Lektion_${lesson.number}.html`;$('deck-link').href=`../../bildspel/?d=${lesson.deck.replace(/_elev\.pptx$/,'')}`;
 $('print-lesson').innerHTML=`<h1>${lesson.title}</h1>`+lesson.slides.map(s=>`<section><h2>${s.title}</h2>${body(s)}${s.check?`<p>${s.check}</p>`:''}</section>`).join('');history.replaceState(null,'',`?del=${lesson.id}&avsnitt=${s.id}`);document.title=`${s.title} · Sjöskolan`;
}
function draw(){const el=$('slide').querySelector('.lesson-visual');if(el)el.innerHTML=visual(lesson.slides[index].visual,el.clientWidth);}
$('route').addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(!a)return;e.preventDefault();index=Number(a.dataset.go);render();});$('lesson').addEventListener('change',e=>{lesson=lessonById(e.target.value);index=0;render();});$('section').addEventListener('change',e=>{index=Number(e.target.value);render();});$('previous').addEventListener('click',()=>{index--;render();});$('next').addEventListener('click',()=>{index++;render();});$('print').addEventListener('click',()=>window.print());new ResizeObserver(draw).observe($('slide'));render();
