// The overview derives progress from recorded reading and attempts, never checkboxes.
import {STUDY} from './arbetsrum.gen.mjs?v=20260927b';
import {studyStore, exerciseState, isWorked, isCorrect} from './studieprogress.mjs?v=20260927b';
const store=studyStore(), aliases={v40_01:'sinus',v40_02:'impedans',v40_03:'effekt'};
function route(href){
  const url=new URL(href,location.href), p=url.searchParams;
  if(url.pathname.endsWith('/Formelstod_och_ovningar.html')&&url.pathname.includes('vecka-40')) {
    url.pathname=url.pathname.replace('Formelstod_och_ovningar.html','Genomgang.html');
    if(url.hash)p.set('uppgift',url.hash.slice(1));url.hash='';
  } else if(url.pathname.endsWith('/vecka-38/aktuell/Elevuppgifter.html')) {
    url.pathname='/sjoskolan/vecka-40/aktuell/Genomgang.html';p.set('del','franskiljning');p.set('uppgift',url.hash.slice(1)||'v2-1');url.hash='';
  }
  return url;
}
function render(){
  const s=store.read();
  for(const row of document.querySelectorAll('[data-lesson]')){
    const id=row.dataset.lesson, seq=STUDY.sequence[id];
    const theory=seq.filter(x=>!x.startsWith('EL-')),tasks=seq.filter(x=>x.startsWith('EL-')).map(x=>STUDY.tasks[x]);
    const read=theory.filter(x=>s.read[`r1:${id}:${x}`]).length;
    const worked=tasks.filter(t=>isWorked(exerciseState(s,t))).length,correct=tasks.filter(t=>isCorrect(exerciseState(s,t))).length;
    row.querySelector('.lesson-progress').textContent=`${read}/${theory.length} avsnitt genomgångna · ${worked}/${tasks.length} övningar bearbetade · ${correct} med rätt svar`;
  }
  const c=s.cursor;
  if(c&&STUDY.sequence[c.lesson]?.includes(c.step)){
    const a=document.getElementById('resume');a.href='Genomgang.html';a.textContent='Fortsätt där du slutade';
    document.getElementById('resume-text').textContent='Dina försök och din senaste plats finns kvar.';
  }
  for(const li of document.querySelectorAll('[data-steg]')){
    const a=li.querySelector('.steg-text a');if(!a)continue;
    const url=route(a.getAttribute('href'));a.href=url.pathname+url.search+url.hash;
    const output=li.querySelector('[data-status]');let text='';
    if(li.dataset.ovningar){
      const [part,range]=li.dataset.ovningar.split(':'),[start,end]=range.split('-').map(Number);
      const tasks=Object.values(STUDY.tasks).filter(t=>t.del===aliases[part]&&Number(t.anchor.split('-q')[1])>=start&&Number(t.anchor.split('-q')[1])<=end);
      const n=tasks.filter(t=>isWorked(exerciseState(s,t))).length;
      text=`${n}/${tasks.length} bearbetade`;
    }else if(url.pathname.endsWith('Genomgang.html')){
      const id=aliases[url.searchParams.get('del')]||url.searchParams.get('del');
      const seq=STUDY.sequence[id]||[];
      const task=url.searchParams.get('uppgift');
      if(task){
        const selected=Object.values(STUDY.tasks).filter(t=>t.del===id&&(!task||t.anchor>=task));
        text=`${selected.filter(t=>isWorked(exerciseState(s,t))).length}/${selected.length} bearbetade`;
      }else{
        const read=seq.filter(x=>!x.startsWith('EL-'));
        text=`${read.filter(x=>s.read[`r1:${id}:${x}`]).length}/${read.length} avsnitt genomgångna`;
      }
    }
    if(output)output.textContent=text;
  }
}
addEventListener('pageshow',render);addEventListener('storage',render);render();
