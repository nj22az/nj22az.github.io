// Reading exposure is tracked locally. It is never an assessment of comprehension.
export function requiredSeconds(words,figure=false){return Math.max(figure?6:4,Math.min(120,Math.ceil(words/220*60)));}
export function advanceReading(record,{seconds,visible,foreground,active,required}){const previous=record||{seconds:0,complete:false};if(previous.complete||!visible||!foreground||!active)return previous;const total=Math.min(required,previous.seconds+Math.max(0,Math.min(2,seconds)));return {seconds:total,complete:total>=required};}
export function startReadingProgress({document:doc=globalThis.document,window:win=globalThis.window,state,save,moduleId,now=()=>Date.now()}){
 if(!doc?.querySelectorAll||!win?.setInterval)return ()=>{};
 const st=state();st.readingProgress??={};st.readingSummary??={};
 const units=[];
 for(const block of doc.querySelectorAll('[data-reading-key]')){
  let elements=[...block.querySelectorAll('p,li,figure,table,dd')].filter(el=>!el.closest('details:not([open])')&&!el.parentElement?.closest('li,figure,table,dd'));
  if(!elements.length)elements=[block];
  elements.forEach((el,i)=>{const words=el.textContent.trim().split(/\s+/).filter(Boolean).length;if(words<3&&!el.querySelector('img'))return;units.push({el,key:block.dataset.readingKey+':'+i,required:requiredSeconds(words,el.tagName==='FIGURE'||!!el.querySelector('img'))});});
 }
 let last=now(),activity=last,dirty=false,ticks=0,disposed=false;
 const touch=()=>{activity=now();};
 const events=['scroll','keydown','pointerdown','touchstart','pointermove'];events.forEach(e=>doc.addEventListener(e,touch,{passive:true}));
 function update(){if(disposed)return;const current=now(),seconds=(current-last)/1000;last=current;const foreground=doc.visibilityState==='visible'&&doc.hasFocus(),active=current-activity<60000;
  for(const unit of units){const r=unit.el.getBoundingClientRect(),height=win.innerHeight||doc.documentElement.clientHeight;const overlap=Math.max(0,Math.min(r.bottom,height)-Math.max(r.top,72));const visible=r.width>0&&overlap>=Math.min(r.height,height-72)*.55;
   const previous=st.readingProgress[unit.key];const next=advanceReading(previous,{seconds,visible,foreground,active,required:unit.required});if(next!==previous){st.readingProgress[unit.key]=next;dirty=true;}
  }
  const complete=units.filter(u=>st.readingProgress[u.key]?.complete).length;st.readingSummary[moduleId]={complete,total:units.length,method:'foreground-visible-time',updatedAt:new Date(current).toISOString()};
  const status=doc.querySelector('[data-reading-summary]');if(status)status.textContent=`${complete} av ${units.length} text- och figuravsnitt genomgångna i appen`;
  if(++ticks%5===0&&dirty){save();dirty=false;}
 }
 update();const interval=win.setInterval(update,1000);
 const persist=()=>{if(dirty){save();dirty=false;}};doc.addEventListener('visibilitychange',persist);win.addEventListener('pagehide',persist);
 return ()=>{if(disposed)return;update();disposed=true;win.clearInterval(interval);events.forEach(e=>doc.removeEventListener(e,touch));doc.removeEventListener('visibilitychange',persist);win.removeEventListener('pagehide',persist);persist();};
}
