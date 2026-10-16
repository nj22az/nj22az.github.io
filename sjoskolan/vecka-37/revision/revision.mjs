import {renderRevision,questionMarkup,questionSummary,esc,L,t} from './revision-ui.mjs?v=20261016-r5';
import {evaluate} from './engine.mjs';
import {startReadingProgress} from './reading-progress.mjs';
import {selectModuleExport} from './module-tools.mjs';
const KEY='elteknik-module-1-revision-20261016-v1';
let state={schema:1,lang:'sv',answers:{},reflections:{},labLog:[]},persistent=true,labCleanup=null,labStarted=false;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.schema===1&&saved.answers&&typeof saved.answers==='object'&&!Array.isArray(saved.answers))state={...state,...saved,lang:'sv'};}catch{persistent=false;}
const $=s=>document.querySelector(s);
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{if(persistent){persistent=false;toast('Webbläsaren kunde inte spara. Använd säkerhetskopian för att behålla dina svar.');}}}
function toast(message){$('.toast')?.remove();const p=document.createElement('p');p.className='toast';p.role='status';p.textContent=message;document.body.append(p);setTimeout(()=>p.remove(),6000);}
function download(data,name,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function jump(){const parts=location.hash.slice(1).split('/');const id=parts[0]==='module'?(parts[2]==='export'?'nedladdning':parts[3]||'teori'):parts[0]==='lab'?'simulator':parts[0];const target=document.getElementById(id);if(target){for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;target.scrollIntoView({block:'start'});}}
try{
 const [data,exportsData]=await Promise.all(['data.json?v=20261016-r1','exports/manifest.json?v=20261016-r1'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Kursfil kunde inte hämtas');return r.json();}));
 $('#main').innerHTML=renderRevision(data,state,exportsData);
 $('#question-summary').textContent=questionSummary(data.module,state);
 const readingCleanup=startReadingProgress({state:()=>state,save,moduleId:1});
 async function openLab(){if(labStarted)return;labStarted=true;$('#revision-lab').innerHTML='<p>Laddar simulatorn…</p>';try{const {showLab}=await import('./labs.mjs?v=20261016-r5');labCleanup=await showLab('dc',{embedded:true,state:()=>state,save,t,L,esc,shell:html=>{$('#revision-lab').innerHTML=html;},link:(url,label)=>`<a href="${esc(url)}">${esc(label)}</a>`,toast,download});}catch{labStarted=false;$('#revision-lab').innerHTML='<p>Simulatorn kunde inte laddas. Försök igen.</p><button class="btn" id="open-lab">Öppna simulatorn</button>';}}
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();void openLab();}},{rootMargin:'200px'}):null;observer?.observe($('#revision-lab'));
 document.addEventListener('click',e=>{if(e.target.closest('#open-lab'))void openLab();if(e.target.closest('#download-progress'))download(JSON.stringify({...state,revision:data.revision,originalWeek:'/sjoskolan/vecka-37/aktuell/'},null,2),'Elteknik_modul_1_mina_svar.json','application/json');});
 document.addEventListener('input',e=>{if(e.target.id==='reflection'){state.reflections[1]=e.target.value;save();}const form=e.target.closest('.q-form');if(form){const q=data.module.questions.find(q=>q.id===form.dataset.q);if(q){const a=state.answers[q.id]||{attempts:[]};const f=new FormData(form);state.answers[q.id]={...a,draft:f.get('answer')??'',unit:f.get('unit')||q.unit};save();}}});
 document.addEventListener('submit',e=>{
  const form=e.target;if(form.id==='module-export-form'){e.preventDefault();const f=new FormData(form);try{const file=selectModuleExport(exportsData,1,f.get('format'),f.get('template'));const a=document.createElement('a');a.href=file.path;a.download=file.path.split('/').at(-1);a.click();form.querySelector('.export-result').textContent='Nedladdning vald: '+a.download;}catch{form.querySelector('.export-result').textContent='Filen kunde inte väljas. Använd länkarna under Alla fyra filer.';}return;}
  if(!form.matches('.q-form'))return;e.preventDefault();const q=data.module.questions.find(q=>q.id===form.dataset.q);if(!q)return;const f=new FormData(form),value=f.get('answer')??'',unit=f.get('unit')||q.unit,r=evaluate(q,value,unit);if(!r.valid){form.parentElement.querySelector('.feedback').textContent='Ange ett svar och kontrollera talet och enheten.';return;}const old=state.answers[q.id]||{attempts:[]};state.answers[q.id]={...old,draft:value,unit,attempts:[...(old.attempts||[]),{value,unit,correct:r.correct,at:new Date().toISOString()}]};save();const parent=form.parentElement;parent.outerHTML=questionMarkup(q,data.module.questions.indexOf(q)+1,state);$('#question-summary').textContent=questionSummary(data.module,state);const feedback=$('#q-'+q.id+' .feedback');feedback.tabIndex=-1;feedback.focus({preventScroll:true});
 });
 window.addEventListener('hashchange',jump);window.addEventListener('pagehide',()=>{readingCleanup();labCleanup?.();observer?.disconnect();});jump();
}catch(error){$('#main').innerHTML='<h1>Revisionen kunde inte laddas</h1><p>Prova att ladda om sidan. Originalmaterialet finns kvar.</p><a href="../aktuell/">Till originalveckan</a>';}
