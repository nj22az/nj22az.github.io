// Operational records remain separate from product conformity and statutory controls.
const OPERATION_KINDS=['supervision','routine-review','lifetime','change','limits','boiler'];
const operationToday=()=>new Date().toISOString().slice(0,10);
const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const safeID=value=>typeof value==='string'&&/^[\w-]+$/.test(value);
const finiteValue=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value));
function reviewAnniversary(value){const date=new Date(value+'T12:00:00Z');const day=date.getUTCDate();date.setUTCDate(1);date.setUTCFullYear(date.getUTCFullYear()+1);date.setUTCDate(Math.min(day,new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate()));return date.toISOString().slice(0,10);}

export function validateOperations(db,atISO=operationToday()) {
  if(db?.pressure?.operations===undefined)return true;
  const rows=db.pressure.operations;if(!Array.isArray(rows)||!Array.isArray(db.assets)||!Array.isArray(db.pressure.evidence)||!validDay(atISO))return false;
  const assets=new Set(db.assets.map(a=>a?.id)),ids=new Set();
  for(const r of rows){
    if(!r||typeof r!=='object'||!safeID(r.id)||ids.has(r.id)||!assets.has(r.assetId)||!OPERATION_KINDS.includes(r.kind)||!validDay(r.date)||r.date>atISO||!nonempty(r.by)||!nonempty(r.reference)||!nonempty(r.notes))return false;
    ids.add(r.id);
    if(!['recorded','satisfactory','defect','review','not-performed'].includes(r.result))return false;
    if(r.evidenceId&&(!safeID(r.evidenceId)||!db.pressure.evidence.some(x=>x.id===r.evidenceId&&x.assetId===r.assetId)))return false;
    if(r.due&&(!validDay(r.due)||r.due<=r.date))return false;
    if(['supervision','routine-review'].includes(r.kind)&&!r.due)return false;
    if(r.kind==='routine-review'&&r.due>reviewAnniversary(r.date))return false;
    if(['lifetime','change','limits','boiler'].includes(r.kind)&&!r.evidenceId)return false;
    if(r.kind==='lifetime'&&(!nonempty(r.component)||!nonempty(r.mechanism)||!nonempty(r.unit)||!finiteValue(r.limit)||Number(r.limit)<=0||!finiteValue(r.consumed)||Number(r.consumed)<0))return false;
    if(r.kind==='change'&&(!['required','review','exception'].includes(r.revisionDecision)||!['damage','lifetime','change','repair','conditions'].includes(r.reason)))return false;
    if(r.kind==='limits'&&(!nonempty(r.operatingPressure)||!nonempty(r.operatingTemperature)||!nonempty(r.protectiveSettings)))return false;
    if(r.kind==='boiler'&&(!nonempty(r.competence)||!nonempty(r.monitoring)))return false;
  }
  return true;
}

export function operationFindings(profile,pressure,atISO=operationToday()) {
  if(!profile)return [];
  const rows=(pressure?.operations||[]).filter(r=>r.assetId===profile.assetId).sort((a,b)=>a.date.localeCompare(b.date));
  const findings=[],latest=new Map();
  for(const r of rows){
    const key=r.kind==='lifetime'?r.kind+'|'+r.component+'|'+r.mechanism:r.kind;
    latest.set(key,r);
  }
  for(const r of latest.values()){
    if(r.kind==='lifetime'&&Number(r.limit)-Number(r.consumed)<=0)findings.push(`Life limit reached for ${r.component} (${r.mechanism}); stop and revision-control assessment required.`);
    if(r.due&&r.due<atISO)findings.push(`${r.kind==='routine-review'?'Supervision routine evaluation':r.kind==='supervision'?'Ongoing supervision':'Operational review'} overdue since ${r.due}.`);
    if(r.kind==='supervision'&&['defect','review','not-performed'].includes(r.result))findings.push('The latest ongoing-supervision record requires follow-up: '+r.result+'.');
  }
  for(const r of rows.filter(r=>r.kind==='change'&&['required','review'].includes(r.revisionDecision))){
    const addressed=(pressure.controls||[]).some(c=>c.assetId===profile.assetId&&c.kind==='revision'&&c.result==='accepted'&&c.performedOn>=r.date);
    if(!addressed)findings.push(`Revision-control assessment remains open after ${r.reason} recorded ${r.date}.`);
  }
  if(profile.operationalScope==='in'){
    if(!latest.has('supervision'))findings.push('Ongoing supervision and its written routine have no recorded operational entry.');
    if(['A','B'].includes(profile.operationalClass)&&!latest.has('routine-review'))findings.push('Annual evaluation of the written supervision routine has no recorded entry.');
    if(['A','B'].includes(profile.operationalClass)&&!rows.some(r=>r.kind==='lifetime'))findings.push('Remaining-life journal applicability and component records require review.');
  }
  return [...new Set(findings)];
}

export function initPressureOperations(api) {
  const {e,field,select,area,modal,form,card,btn,badge,uid,today,asset,commit}=api;
  const db=()=>api.getDB();
  const operations=()=>db().pressure.operations;
  const SOURCE='https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-202311/';
  const kinds={
    supervision:{title:'Ongoing supervision',ref:'AFS 2023:11 · 9 kap. 9–10, 38 §§',help:'Record the assigned person’s checks against the written supervision routine, including safety equipment and measured observations. The routine determines the interval.'},
    'routine-review':{title:'Supervision routine review',ref:'AFS 2023:11 · 9 kap. 38 §',help:'Record the evaluation of the written routine and the next evaluation date, no later than one year after this review. This annual evaluation is separate from the frequency of the actual supervision checks.'},
    lifetime:{title:'Remaining-life journal',ref:'AFS 2023:11 · 9 kap. 39 §',help:'Create a separate entry for each component and damage mechanism. Use the same unit for its documented limit and consumed life. The arithmetic supports the journal; the underlying engineering assessment must be retained.'},
    change:{title:'Change, repair and revision review',ref:'AFS 2023:11 · 9 kap. 40–42 §§; 10 kap. 20–21 §§',help:'Record damage, exhausted life, changed conditions, modifications or repairs and the decision on revision control. A recorded exception needs its exact legal and technical basis. This entry does not authorise operation.'},
    limits:{title:'Operating limits and protective settings',ref:'AFS 2023:11 · 9 kap. 6, 28, 36 §§',help:'Keep the actual operating conditions and approved protective settings separate from manufacturer PS/TS values. Record units, relevant permitted limits and the approved basis.'},
    boiler:{title:'Boiler supervision and operator knowledge',ref:'AFS 2023:11 · 10 kap. 27–42 §§; bilaga 8',help:'Where relevant, record the supervision arrangement, control-body decision, alarm path, attendance time and operator knowledge evidence. The planner does not issue or presume operator certification.'}
  };
  const text=s=>`<p class="pressure-note">${s}</p>`;
  const anniversary=reviewAnniversary;
  function evidenceOptions(aid){return [['','Select retained evidence'],...db().pressure.evidence.filter(x=>x.assetId===aid).map(x=>[x.id,x.title+' · '+x.reference])];}
  function initialDue(kind){return kind==='routine-review'?anniversary(today()):'';}

  window.pressureOperation=(aid,kind='supervision')=>{
    const config=kinds[kind];if(!config||!asset(aid))return;
    if(!operations())db().pressure.operations=[];
    let fields=text(e(config.help))+field('Record date','date',today(),true,'date')+field('Responsible person / reviewer','by','',true)+field('Written routine / assessment reference','reference','',true)+select('Supporting controlled evidence','evidenceId',evidenceOptions(aid),'');
    if(kind==='supervision'||kind==='routine-review')fields+=field(kind==='routine-review'?'Next routine evaluation date':'Next supervision due date','due',initialDue(kind),true,'date')+select('Recorded outcome','result',[['satisfactory','Satisfactory'],['defect','Defect / action required'],['review','Further assessment required'],['not-performed','Not performed']], 'satisfactory');
    if(kind==='lifetime')fields+=field('Component / part identity','component','',true)+field('Damage mechanism','mechanism','',true)+field('Documented life limit','limit','',true,'number')+field('Consumed life / measurement','consumed','',true,'number')+field('Common unit (hours, cycles, etc.)','unit','',true)+text('Remaining life is calculated as documented limit minus consumed life. A zero or negative result requires a stop and revision-control assessment; it does not create a new allowable life.');
    if(kind==='change')fields+=select('Reason for review','reason',[['damage','Suspected damage'],['lifetime','Life limit reached'],['change','Modification'],['repair','Repair'],['conditions','Operating conditions changed']], 'damage')+select('Revision-control decision','revisionDecision',[['review','Decision pending specialist review'],['required','Revision control required'],['exception','Documented exception assessment']], 'review');
    if(kind==='limits')fields+=field('Operating pressure p, unit and permitted range','operatingPressure','',true)+field('Operating temperature, unit and permitted range','operatingTemperature','',true)+area('Protective settings, units and approved limits','protectiveSettings');
    if(kind==='boiler')fields+=area('Operator assignment and knowledge evidence','competence')+area('Supervision, alarms, attendance time and control-body decision','monitoring')+field('Next arrangement / knowledge review date','due','',false,'date');
    fields+=area(kind==='supervision'?'Readings, observations, defects and required actions':kind==='change'?'Description, significance, decision basis and restrictions':'Assessment, conclusions and actions','notes');
    modal(config.title,form(fields));
    document.querySelector('#edit-form').onsubmit=ev=>{
      ev.preventDefault();const d=Object.fromEntries(new FormData(ev.target));
      for(const key of Object.keys(d))if(typeof d[key]==='string')d[key]=d[key].trim();
      if(!d.by||!d.reference||!d.date){alert('Record the date, responsible person and controlled reference.');return;}
      if(d.date>today()){alert('Record date cannot be in the future.');return;}
      if(d.due&&d.due<=d.date){alert('The next review or supervision date must be after the record date.');return;}
      if(kind==='routine-review'&&(!d.due||d.due>anniversary(d.date))){alert('The next routine evaluation must be no later than one year after this review.');return;}
      if(['lifetime','change','limits','boiler'].includes(kind)&&!d.evidenceId){alert('Register and select the supporting controlled evidence first.');return;}
      if(kind==='lifetime'){
        if(!d.component||!d.mechanism||!d.unit||!finiteValue(d.limit)||Number(d.limit)<=0||!finiteValue(d.consumed)||Number(d.consumed)<0){alert('Record the component, mechanism, common unit, a positive limit and non-negative consumed life.');return;}
        d.limit=Number(d.limit);d.consumed=Number(d.consumed);d.result=d.limit-d.consumed<=0?'defect':'recorded';
      }
      if(kind==='change')d.result='review';
      if(kind==='limits'&&!d.protectiveSettings?.trim()){alert('Record the protective settings and their approved limits.');return;}
      if(kind==='boiler'&&(!d.competence?.trim()||!d.monitoring?.trim())){alert('Record the operator knowledge and supervision arrangements.');return;}
      if(!d.notes?.trim()){alert('Record the assessment, observations and any required actions.');return;}
      if(!d.result)d.result='recorded';
      commit(aid,config.title+' record added',d.by,s=>{
        s.operations??=[];s.operations.push({...d,id:uid(),assetId:aid,kind});
        // Preserve an explicit stop independently of the next lifetime measurement.
        if(kind==='lifetime'&&d.limit-d.consumed<=0){const p=s.profiles.find(x=>x.assetId===aid);if(p){p.stopped=true;p.stopReason=`Life limit reached: ${d.component}, ${d.mechanism}. ${d.consumed} / ${d.limit} ${d.unit}. Revision-control assessment required.`;}}
      });
    };
  };
  function details(r){
    if(r.kind==='lifetime')return `<p>${e(r.component)} · ${e(r.mechanism)}</p><p>${e(r.consumed)} / ${e(r.limit)} ${e(r.unit)} consumed · <strong class="${r.limit-r.consumed<=0?'red':''}">${e(r.limit-r.consumed)} ${e(r.unit)} remaining</strong></p>`;
    if(r.kind==='change')return `<p>${e(r.reason)} · Revision decision: ${e(r.revisionDecision)}</p>`;
    if(r.kind==='limits')return `<p>${e(r.operatingPressure)}</p><p>${e(r.operatingTemperature)}</p><p>${e(r.protectiveSettings)}</p>`;
    if(r.kind==='boiler')return `<p>${e(r.competence)}</p><p>${e(r.monitoring)}</p>`;
    return `<p>Outcome: ${e(r.result)}</p>`;
  }
  function render(aid){
    const all=operations()||[];
    return card('Use, supervision and remaining life','Operational records under AFS 2023:11 remain separate from product conformity and independent controls.',`<div class="card-body">${text('Append records against the approved routine and supporting evidence. These entries do not change statutory control dates or authorise a return to operation.')}${Object.entries(kinds).map(([kind,config])=>{
      const rows=all.filter(x=>x.assetId===aid&&x.kind===kind).sort((a,b)=>a.date.localeCompare(b.date)),latest=rows.at(-1);
      const late=latest?.due&&latest.due<today();
      let exhausted=false;
      if(kind==='lifetime'){const components=new Map();for(const row of rows)components.set(row.component+'|'+row.mechanism,row);exhausted=[...components.values()].some(r=>Number(r.limit)-Number(r.consumed)<=0);}
      return `<section class="pressure-operation"><div class="pressure-row"><div><h3>${e(config.title)}</h3><p><a href="${SOURCE}" target="_blank" rel="noopener">${e(config.ref)}</a></p>${late?badge('overdue','Review / supervision overdue'):''}${exhausted?badge('overdue','Life limit reached · stop / revision review'):''}</div>${btn('Add '+config.title.toLowerCase(),`pressureOperation('${aid}','${kind}')`,'small')}</div>${rows.length?`<details class="print-expand"><summary>${rows.length} recorded entries${latest?' · Last '+e(latest.date):''}</summary>${rows.slice(-5).reverse().map(r=>`<article class="pressure-row"><div><h3>${e(r.date)} · ${e(r.by)}</h3><p>${e(r.reference)}${r.due?' · Next review '+e(r.due):''}</p>${details(r)}<p class="pressure-note">${e(r.notes)}</p></div></article>`).join('')}${rows.length>5?text('The latest five entries are shown. The complete history is retained in workspace backup and dossier export.'):''}</details>`:text('No entries recorded. Assess whether this workflow applies to this asset.')}</section>`;
    }).join('')}</div>`);
  }
  return {render};
}
