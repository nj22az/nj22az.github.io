import {LESSONS} from './lektioner.mjs?v=20260930u';
import {STUDY} from './arbetsrum.gen.mjs?v=20260928db';
import {visual} from './visuals.mjs?v=20260928fg';
import {markHtml as m} from '../../gemensamt/markering.mjs?v=20260928';
import {hjalpHtml} from '../../gemensamt/raknehjalp.mjs?v=20260929c';
import {studyStore, exerciseState, attempt, status, solutionAvailable, isCorrect, isWorked, observeReading} from './studieprogress.mjs?v=20260927b';

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const lessons = [STUDY.isolation, ...LESSONS];
const store = studyStore();
const READ_VERSION = 'r1';
const readKey = (lesson, id) => `${READ_VERSION}:${lesson}:${id}`;
const params = new URLSearchParams(location.search);
const aliases = {v40_01:'sinus', v40_02:'impedans', v40_03:'effekt'};
let lesson = lessons.find(l => l.id === (aliases[params.get('del')] || params.get('del'))) || lessons[0];
let step = '', disposeReading = () => {};
const readingBlocks = new Map();
const state = () => store.read();
const taskByAnchor = anchor => Object.values(STUDY.tasks).find(t => t.anchor === anchor || t.id === anchor);
function steps(l = lesson) { return STUDY.sequence[l.id]; }
function entry(id = step) { return STUDY.tasks[id] || lesson.slides.find(s => s.id === id); }
function readDone(l, id) { return !!state().read[readKey(l.id, id)]; }
function nextTitle() {
  if (STUDY.tasks[step]?.stopp) return STUDY.tasks[step].stopp.nasta;
  const id = steps()[steps().indexOf(step)+1];
  if (!id) return 'Se vad som återstår';
  const t = entry(id);
  return id.startsWith('EL-') ? `Prova själv: ${t.number} · ${t.title}` : `Nästa: ${t.title}`;
}
function refreshAction() {
  const task = STUDY.tasks[step];
  if (!task) {
    $('next-instruction').textContent = step === 'mal' ? 'Öppna den första förklaringen med Nästa-knappen. Fortsätt ett steg i taget; övningen kommer när du har läst det du behöver.' : entry().example ? 'Visa alla beräkningssteg och räkna med på papper innan du fortsätter. Du behöver inte skicka in exemplet.' : 'Innan du fortsätter: försök göra det som står under ”Gör nu” med egna ord. Är det oklart, läs en gång till eller skriv ned en fråga till läraren.';
    return;
  }
  const r = exerciseState(state(),task);
  $('next-instruction').textContent = r.help ? 'Ta upp den här uppgiften med läraren. Du kan fortsätta till nästa steg medan du väntar på hjälp.' : r.correct ? 'Svaret är kontrollerat. Fortsätt till nästa steg när du kan beskriva hur du räknade.' : r.solutionSeen ? 'Jämför lösningens metod med ditt försök. Skriv ned var de skiljer sig innan du fortsätter.' : r.submitted && !(task.solution.svar || []).length ? 'Din motivering är sparad för lärarens bedömning. Du kan utveckla den med ledtråden eller fortsätta till nästa steg.' : r.submitted ? 'Bearbeta svaret med ledtråden och kontrollera igen. Efter två olika ifyllda försök kan du öppna lösningen. Be läraren om hjälp om du fortfarande fastnar.' : 'Gör ett eget försök och tryck på knappen i svarsrutan innan du går vidare. Fastnar du, öppna ledtråden eller markera att du behöver hjälp.';
}
function done(l, id) { return id.startsWith('EL-') ? isWorked(exerciseState(state(), STUDY.tasks[id])) : readDone(l, id); }
function initial() {
  const current = state().cursor;
  const selected = taskByAnchor(params.get('uppgift') || location.hash.slice(1));
  if (selected) { lesson = lessons.find(l => l.id === selected.del); return selected.id; }
  const section = params.get('avsnitt');
  if (section && lesson.slides.some(s => s.id === section)) return section;
  if ((!params.get('del') || params.has('fortsatt')) && current) {
    const saved = lessons.find(l => l.id === current.lesson);
    if (saved && STUDY.sequence[saved.id].includes(current.step) && (!params.get('del') || saved.id === lesson.id)) {
      lesson = saved; return current.step;
    }
  }
  return steps().find(id => !done(lesson, id)) || steps()[0];
}
step = initial();
function cards(ids = []) {
  // Databladen byggs av innehall/export/datablad.py (fast HTML ur studieplanen).
  return ids.length ? `<div class="datablad-par">${ids.map(id => STUDY.cards[id].html).join('')}</div>` : '';
}
function picture(s) {
  if (s.image) return `<figure><img src="/sjoskolan/${esc(s.image)}" alt="${esc(s.alt || 'Två matningsvägar, A och B, mot arbetsområdet. Väljarens verkliga ställning är okänd.')}" loading="lazy"><figcaption>Figur 04 · Undervisningsmodell. Väljarens verkliga läge och spärrstatus är inte givna.</figcaption></figure>`;
  if (s.visual) return `<figure class="lesson-visual">${visual(s.visual, Math.min($('slide').clientWidth || 760, 760))}</figure>`;
  return '';
}
function explanation(s, compact = false, visade = []) {
  return `${picture(s)}${s.body.map((t,i) => `<p${compact ? '' : ` data-read="p${i}"`}>${m(t)}</p>`).join('')}${s.formula ? `<p class="formula"${compact ? '' : ' data-read="formula"'}>${m(s.formula)}</p>` : ''}${cards((s.cards || []).filter(id => !visade.includes(id)))}`;
}
function storageNote() {
  $('storage-note').textContent = store.persistent ? '' : 'Webbläsaren tillåter inte sparande. Dina svar finns kvar medan sidan är öppen. Skriv ut dem innan du lämnar sidan.';
}
function refreshProgress() {
  const seq = steps(), reading = seq.filter(id => !id.startsWith('EL-')), exercises = seq.filter(id => id.startsWith('EL-'));
  const read = reading.filter(id => readDone(lesson,id)).length;
  const worked = exercises.filter(id => isWorked(exerciseState(state(),STUDY.tasks[id]))).length;
  const correct = exercises.filter(id => isCorrect(exerciseState(state(),STUDY.tasks[id]))).length;
  $('progress').textContent = `${read}/${reading.length} avsnitt genomgångna · ${worked}/${exercises.length} övningar bearbetade · ${correct} med rätt svar`;
  $('outline').innerHTML = seq.map(id => {
    const t = entry(id), exercise = id.startsWith('EL-');
    const label = exercise ? `${t.number}: ${t.title}` : t.title;
    const progress = exercise ? status(exerciseState(state(), t), t) : (readDone(lesson, id) ? '✓ Genomgånget' : 'Inte genomgånget');
    const url = `?del=${lesson.id}&${exercise ? 'uppgift' : 'avsnitt'}=${id}`;
    return `<li><a href="${esc(url)}" data-step="${esc(id)}"${id===step?' aria-current="step"':''}>${m(label)}</a> <span class="study-note">${esc(progress)}</span></li>`;
  }).join('');
  storageNote();refreshAction();
}
function markRead(id) {
  store.change(s => { s.read[readKey(lesson.id,id)] = true; });
  const el = $('read-status'); if (el) { el.textContent = '✓ Genomgånget'; el.classList.add('correct'); }
  refreshProgress();
}
function renderTheory(s) {
  const key = readKey(lesson.id,s.id);
  const example = !!s.example;
  const shown = example ? Math.min(s.body.length, Math.max(1, state().examples[key] || 1)) : s.body.length;
  const brief = STUDY.guidance[lesson.id];
  const opening = s.id === 'mal';
  $('slide').innerHTML = `<p class="study-kicker">${opening ? 'Börja här' : example ? 'Följ beräkningen' : (s.advanced ? 'Tillämpning · förklaringen före övningen' : 'Läs och förstå')}</p>
    <h2 id="step-title" tabindex="-1">${opening ? 'Ditt uppdrag i den här delen' : m(s.title)}</h2>
    ${opening ? `<p data-read="prepare">Ha papper och räknare till hands. Du läser och gör egna försök här på sidan. Figurer och instrumentkort visas där de behövs.</p><ol>${brief.gor.map((t,i)=>`<li data-read="plan${i}">${m(t)}</li>`).join('')}</ol><h3>När är jag färdig?</h3><p data-read="complete">${m(brief.klar)}</p><p class="study-note" data-read="practice">Det här är träning inför labben och inlämningarna. Ett rätt tal är inte samma sak som en bedömd motivering. Frågorna gäller undervisningsmodeller; elektriska mätningar görs vid den handledda stationen.</p>` : `<aside class="study-task" id="current-action"><strong>Gör nu</strong><p data-read="mission">${m(brief.lasuppdrag[s.id] || 'Läs förklaringen och använd den för att besvara frågan med egna ord.')}</p></aside>`}
    ${opening ? '' : example ? `<p>Exemplet visar metoden med andra värden än övningen.</p><ol class="study-example">${s.body.slice(0,shown).map((t,i)=>`<li data-read="example${i}">${m(t)}</li>`).join('')}</ol>${shown<s.body.length?'<button type="button" id="example-next" class="primary">Visa nästa steg i beräkningen</button>':''}` : explanation(s)}
    ${!example && !opening ? hjalpHtml([s.title,...s.body,s.formula||''].join(' ')) : ''}
    <p id="read-status" class="study-status" data-read="end">${readDone(lesson,s.id)?'✓ Genomgånget':'Markeras automatiskt när du har gått igenom avsnittet.'}</p>
    <p class="study-note">Markeringen visar att innehållet har visats. Övningen efteråt hjälper dig att pröva förståelsen.</p>`;
  if (!readingBlocks.has(key)) readingBlocks.set(key, new Set());
  const readingLesson = lesson.id;
  disposeReading = observeReading($('slide'),()=>{
    if (lesson.id === readingLesson && step === s.id && (!example || shown === s.body.length)) markRead(s.id);
  }, globalThis.IntersectionObserver, readingBlocks.get(key));
  $('example-next')?.addEventListener('click',()=>{
    store.change(st=>{st.examples[key]=shown+1;});
    render(false);
    const newStep=$('slide').querySelector('li:last-child');
    newStep?.scrollIntoView({block:'center'});
    ($('example-next') || $('next')).focus({preventScroll:true});
  });
}
function fields(task,r) {
  return (task.solution.svar || []).map((f,i)=>`<div><label for="answer-${i}">${m(f.storhet)}${f.enhet?` (${esc(f.enhet)})`:''}</label><input id="answer-${i}" name="answer-${i}" data-answer="${i}" type="text" ${typeof f.varde==='number'?'inputmode="decimal"':''} autocomplete="off" value="${esc(r.values?.[i] || '')}" aria-describedby="answer-help"></div>`).join('');
}
function saveDraft(task) {
  const values = [...$('answer-form').querySelectorAll('[data-answer]')].map(e=>e.value);
  const text = $('reasoning')?.value || '';
  store.change(s=>{
    const old=exerciseState(s,task);
    const changed=JSON.stringify(old.values)!==JSON.stringify(values)||old.text!==text;
    s.exercises[task.id]={...old,values,text,...(changed?{correct:false,independent:false}:{})};
  });
  storageNote();
  return {values,text};
}
function solution(task) {
  const s = {...task.solution, steg: task.solution.text?.split(/\n\s*\n/)};
  return `<h3>Lösning steg för steg</h3>${s.steg?.length ? '<ol>'+s.steg.map(t=>`<li>${m(t)}</li>`).join('')+'</ol>' : `<p>${m(s.text || 'Jämför din metod med förklaringen och ta upp ditt svar med läraren.')}</p>`}<p class="study-note">Att läsa lösningen registreras som ”Lösning genomgången”. Det räknas inte som ett självständigt rätt svar.</p>`;
}
function renderExercise(task) {
  const r = exerciseState(state(),task), q = task.question;
  const theories = task.teori.map(id=>lesson.slides.find(s=>s.id===id)).filter(Boolean);
  const needsText = task.resonemang || !(task.solution.svar || []).length;
  const unread = theories.some(s => !readDone(lesson,s.id));
  $('slide').innerHTML = `<p class="study-kicker">${task.tillampning?'Tillämpningsövning · efter grunderna':'Prova själv'}</p><h2 id="step-title" tabindex="-1">${m(task.number)}: ${m(task.title)}</h2>
    <p id="exercise-purpose" class="study-purpose"><strong>Varför denna övning?</strong> Du tränar på att ${m(task.syfte)}.</p>
    <h3>Din uppgift</h3>
    <p>${m(q.fraga)}</p>${q.scenario?`<p class="study-panel"><strong>Underlag:</strong> ${m(q.scenario)}</p>`:''}${q.givet?`<p><strong>Givet:</strong> ${m(q.givet)}</p>`:''}
    ${picture(task)}${cards(task.cards)}
    <aside class="study-task" id="current-action"><strong>Gör så här</strong><ol><li>${(task.solution.svar||[]).length?'Skriv givna värden och välj samband. Räkna på papper eller med räknare.':'Läs underlaget och skriv ett eget svar på frågorna. Motivera dina val.'}</li><li>${(task.solution.svar||[]).length?'Skriv resultatet i varje fält nedan, i den enhet som står vid fältet.':'Skriv ditt resonemang i textrutan nedan.'}${needsText&&(task.solution.svar||[]).length?' Skriv också hur du tänkte i motiveringsrutan.':''}</li><li>${(task.solution.svar||[]).length?'Tryck på ”Kontrollera mitt svar”. Läs återkopplingen och använd ledtråden om du behöver försöka igen.':'Tryck på ”Spara mitt försök”. Läraren bedömer din motivering.'}</li></ol></aside>
    <details id="repeat-theory" ${unread?'open':''}><summary>${unread?'Förklaringen du behöver för uppgiften':'Repetera förklaringen här'}</summary>${theories.map(s=>`<section data-theory="${s.id}"><h3>${m(s.title)}</h3>${explanation(s, false, task.cards || [])}</section>`).join('')}</details>
    ${q.samband?.length?`<p class="formula">${q.samband.map(m).join('<br>')}</p>`:''}
    ${hjalpHtml([q.fraga,...(q.samband||[]),q.givet||''].join(' '))}
    <h3>Ditt svar</h3><p class="study-note">Det här är en övning. Ditt försök sparas i den här webbläsaren. Inlämningarna finns på veckans startsida.</p>
    <form id="answer-form" novalidate><div class="study-fields">${fields(task,r)}</div>
    <p id="answer-help" class="study-note">${(task.solution.svar||[]).some(f=>typeof f.varde==='number')?'Skriv tal i den enhet som står vid fältet. Komma och punkt fungerar. ':''}${(task.solution.svar||[]).some(f=>typeof f.varde==='string')?'Skriv ett ord för förändringen eller om strömmen leder/släpar.':''}</p>
    ${needsText?`<label for="reasoning">Din metod och motivering</label><textarea id="reasoning" maxlength="4000">${esc(r.text||'')}</textarea><p class="study-note">Texten sparas. Läraren bedömer resonemanget; det rättas inte automatiskt.</p>`:''}
    <div class="study-actions"><button class="primary" type="submit">${(task.solution.svar||[]).length?'Kontrollera mitt svar':'Spara mitt försök'}</button><button type="button" id="hint">Visa ledtråd</button></div></form>
    <p id="feedback" role="status"></p><p id="exercise-status" class="study-status">${esc(status(r,task))}</p><div id="hints"></div>
    <div class="study-actions"><button type="button" id="show-solution" ${solutionAvailable(r)?'':'disabled'}>Visa lösning steg för steg</button><button type="button" id="need-help">Jag behöver hjälp</button></div>
    <p id="solution-rule" class="study-note">${solutionAvailable(r)?'Du kan nu gå igenom lösningen.':'Lösningen blir tillgänglig efter två olika ifyllda försök, eller när ditt svar är rätt.'}</p>
    <section id="solution" ${r.solutionSeen?'':'hidden'}>${r.solutionSeen?solution(task):''}</section>
    ${task.stopp?`<aside class="study-panel" id="session-boundary"><h3>På lektionen eller hemma?</h3><p>${m(task.stopp.text)}</p>${task.stopp.href?`<a class="sj-btn" href="${esc(task.stopp.href)}">${esc(task.stopp.label)}</a>`:''}</aside>`:''}`;
  const readingLesson = lesson.id;
  const readers = [...$('repeat-theory').querySelectorAll('[data-theory]')].map(el => observeReading(el,()=>{
    if (lesson.id !== readingLesson || step !== task.id) return;
    store.change(s=>{s.read[readKey(readingLesson,el.dataset.theory)] = true;}); refreshProgress();
  }));
  disposeReading = () => readers.forEach(stop=>stop());
  let hintCount = Math.min(r.hints || 0,task.hints.length);
  const showHints = ()=>{
    $('hints').innerHTML=task.hints.slice(0,hintCount).map((h,i)=>`<aside class="study-panel study-hint"><strong>Ledtråd ${i+1}</strong><p>${m(h.text)}</p></aside>`).join('');
    $('hint').disabled=hintCount>=task.hints.length;
    $('hint').textContent=hintCount>=task.hints.length?'Alla ledtrådar visas':'Visa nästa ledtråd';
  };
  showHints();
  $('answer-form').addEventListener('input',()=>{
    saveDraft(task);
    const current=exerciseState(state(),task);
    $('exercise-status').textContent=status(current,task);
    $('feedback').textContent='';
    $('show-solution').disabled=!solutionAvailable(current);
    $('solution-rule').textContent=solutionAvailable(current)?'Du kan nu gå igenom lösningen.':'Lösningen blir tillgänglig efter två olika ifyllda försök, eller när ditt svar är rätt.';
    refreshProgress();
  });
  $('hint').addEventListener('click',()=>{hintCount++;store.change(s=>{s.exercises[task.id]={...exerciseState(s,task),hints:hintCount};});showHints();});
  $('answer-form').addEventListener('submit',e=>{
    e.preventDefault(); const {values,text}=saveDraft(task);
    const previous=exerciseState(state(),task), a=attempt(previous,task,values,text);
    if (a.result.valid) {
      if (!a.result.correct) hintCount=Math.max(1,hintCount);
      a.record.hints=hintCount;
      if(a.result.correct)a.record.help=false;
      store.change(s=>{s.exercises[task.id]=a.record;});
    }
    const hasFields=(task.solution.svar||[]).length>0;
    $('feedback').textContent=!a.result.valid?'Fyll i alla svar med giltiga tal och skriv en motivering där den efterfrågas. Ett tomt eller ofullständigt svar räknas inte som ett försök.':a.result.correct?(task.resonemang?'Talen stämmer. Din motivering är sparad för lärarens bedömning.':'Svaret stämmer. Du kan fortsätta till nästa steg.'):a.duplicate?'Detta försök är redan sparat. Använd ledtråden och bearbeta svaret innan du försöker igen.':hasFields?'Kontrollera de markerade fälten. Följ ledtråden och gör ett nytt försök.':'Ditt försök är sparat. Jämför med ledtråden och utveckla din motivering. Läraren bedömer svaret.';
    $('answer-form').querySelectorAll('[data-answer]').forEach((el,i)=>el.setAttribute('aria-invalid',String(a.result.valid && !a.result.fields[i])));
    const now=exerciseState(state(),task);$('exercise-status').textContent=status(now,task);
    $('show-solution').disabled=!solutionAvailable(now);
    $('solution-rule').textContent=solutionAvailable(now)?'Du kan nu gå igenom lösningen.':'Lösningen blir tillgänglig efter två olika ifyllda försök, eller när ditt svar är rätt.';
    showHints();refreshProgress();
  });
  $('show-solution').addEventListener('click',()=>{
    const current=exerciseState(state(),task);if(!solutionAvailable(current))return;
    store.change(s=>{s.exercises[task.id]={...current,solutionSeen:true};});
    $('solution').innerHTML=solution(task);$('solution').hidden=false;
    $('exercise-status').textContent=status(exerciseState(state(),task),task);refreshProgress();
  });
  $('need-help').addEventListener('click',()=>{
    saveDraft(task);store.change(s=>{s.exercises[task.id]={...exerciseState(s,task),help:true};});
    $('exercise-status').textContent='Behöver hjälp';$('feedback').textContent='Markerat för hjälp. Dina försök finns kvar. Du kan repetera förklaringen och fortsätta med nästa avsnitt.';refreshProgress();
  });
}
function resources() {
  const deck=lesson.id==='franskiljning'?'v38_01_Franskiljning_och_matteknik':lesson.deck.replace(/_elev\.pptx$/,'');
  const ppt=lesson.id==='franskiljning'?lesson.deck:lesson.deck;
  $('resources').innerHTML=`<a href="../../bildspel/?d=${esc(deck)}">Bildspel</a> · <a href="${esc(ppt)}">PowerPoint</a> · <a href="${esc(ppt.replace('.pptx','.pdf'))}">PDF</a> · <a href="${lesson.id==='franskiljning'?'../../filmer/#fem-steg':`Kortfilmer.html?del=${lesson.id}`}">Film</a>${lesson.number?` · <a href="Lektion_${lesson.number}.html">Lektionsartikel</a>`:''}`;
}
function render(focus = true) {
  disposeReading();$('finish').hidden=true;
  const data=entry(); if(!data){step=steps()[0];return render(focus);}
  $('lesson-title').textContent=lesson.title;$('lesson-goal').textContent=`Varför? ${STUDY.guidance[lesson.id].syfte}`;
  $('lesson-when').textContent=STUDY.guidance[lesson.id].nar;
  $('lesson').innerHTML=lessons.map(l=>`<option value="${l.id}">${l.number?`Del ${l.number}`:'Måndag först'}: ${esc(l.title)}</option>`).join('');$('lesson').value=lesson.id;
  store.change(s=>{s.cursor={lesson:lesson.id,step};});
  const isTask=step.startsWith('EL-');
  if(isTask)renderExercise(data);else renderTheory(data);
  const index=steps().indexOf(step);
  $('previous').disabled=index<=0;$('next').textContent=nextTitle();
  $('count').textContent=index<0?'Repetition':`Steg ${index+1} av ${steps().length}`;
  $('next').className=isTask?'':'primary';
  resources();refreshProgress();document.title=`${data.title} · Sjöskolan`;
  history.replaceState(null,'',`?del=${lesson.id}&${isTask?'uppgift':'avsnitt'}=${encodeURIComponent(isTask?data.anchor:step)}`);
  if(focus){$('step-title').focus({preventScroll:true});$('slide').scrollIntoView({block:'start'});}
}
$('previous').addEventListener('click',()=>{step=steps()[Math.max(0,steps().indexOf(step)-1)];render();});
$('next').addEventListener('click',()=>{
  const index=steps().indexOf(step);
  if(index===steps().length-1){
    $('finish').hidden=false;
    const left=steps().filter(id=>!done(lesson,id));
    $('finish').querySelector('h2').textContent=left.length?'Du har nått slutet av lektionen':'Lektionens steg är genomgångna';
    $('finish-status').textContent=left.length?`${left.length} steg återstår att gå igenom eller bearbeta. Översikten visar vilka.`:'Ta med eventuella frågor och svar som behöver lärarens bedömning.';
    $('finish-goal').textContent=STUDY.guidance[lesson.id].klar;
    $('review-lesson').hidden=!left.length;
    if(left.length)$('review-lesson').href=`?del=${lesson.id}&${left[0].startsWith('EL-')?'uppgift':'avsnitt'}=${left[0]}`;
    const next=lessons[lessons.indexOf(lesson)+1];
    $('continue-lesson').href=next?`?del=${next.id}`:'../../vaxelstromslabbet/?lage=guidad';
    $('continue-lesson').textContent=next?`Nästa: ${next.title}`:'Fortsätt till den guidade labben';
    $('finish').scrollIntoView({block:'start'});return;
  }
  step=steps()[index+1];render();
});
$('outline').addEventListener('click',e=>{const a=e.target.closest('[data-step]');if(!a)return;e.preventDefault();step=a.dataset.step;$('outline').closest('details').open=false;render();});
$('lesson').addEventListener('change',e=>{lesson=lessons.find(l=>l.id===e.target.value);step=steps().find(id=>!done(lesson,id))||steps()[0];render();});
$('print').addEventListener('click',()=>{
  $('print-answers').innerHTML='<h1>Vecka 40 · Mina övningssvar</h1><p>Namn: ____________________</p>'+Object.values(STUDY.tasks).map(t=>{
    const r=exerciseState(state(),t);if(!r.submitted&&!r.text&&!r.values?.some(Boolean))return '';
    return `<section><h2>${m(t.number)}: ${m(t.title)}</h2><p>${m(t.question.fraga)}</p><p>${esc(status(r,t))}</p>${(t.solution.svar||[]).map((f,i)=>`<p>${m(f.storhet)}: ${esc(r.values?.[i]||'')} ${esc(f.enhet||'')}</p>`).join('')}<p>${esc(r.text||'')}</p></section>`;
  }).join('');window.print();
});
addEventListener('storage',()=>render(false));
addEventListener('pageshow',()=>refreshProgress());
render(false);
